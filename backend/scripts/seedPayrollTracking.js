const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/hr-main', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ MongoDB Connected');
  } catch (error) {
    console.error('✗ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Schema Definitions
const claimSchema = new mongoose.Schema({
  claimId: { type: String, required: true, unique: true },
  description: String,
  claimType: { type: String, enum: ['Payroll', 'Travel', 'Medical', 'Other'] },
  employeeId: String,
  amount: Number,
  status: {
    type: String,
    enum: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
    default: 'SUBMITTED',
  },
  createdAt: { type: Date, default: Date.now },
});

const disputeSchema = new mongoose.Schema({
  disputeId: { type: String, required: true, unique: true },
  description: String,
  employeeId: String,
  payslipId: { type: mongoose.Schema.Types.ObjectId, ref: 'PaySlip' },
  status: {
    type: String,
    enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'],
    default: 'OPEN',
  },
  createdAt: { type: Date, default: Date.now },
});

const refundSchema = new mongoose.Schema({
  disputeId: String,
  refundDetails: {
    description: String,
    reason: String,
  },
  amount: Number,
  employeeId: String,
  financeStaffId: String,
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'PROCESSED'],
    default: 'PENDING',
  },
  createdAt: { type: Date, default: Date.now },
});

const Claim = mongoose.model('Claim', claimSchema);
const Dispute = mongoose.model('Dispute', disputeSchema);
const Refund = mongoose.model('Refund', refundSchema);

// Reference to PaySlip from Payroll Execution
const PaySlip = mongoose.model('PaySlip');

const seedPayrollTracking = async () => {
  try {
    console.log('\n=== Starting Payroll Tracking Seed ===\n');

    // Clear existing data for idempotency
    await Claim.deleteMany({});
    await Dispute.deleteMany({});
    await Refund.deleteMany({});

    // Get Charlie's payslip from PR-2025-001
    const charliePayslip = await PaySlip.findOne({
      employeeEmail: 'charlie@company.com',
      payrollRunId: 'PR-2025-001',
    });

    if (!charliePayslip) {
      throw new Error(
        'Charlie payslip not found. Please run Payroll Execution seed first.',
      );
    }

    // 1. Create Claim
    await Claim.create({
      claimId: 'CLAIM-CHARLIE-001',
      description: 'Payroll January 2025 adjustment claim',
      claimType: 'Payroll',
      employeeId: 'charlie@company.com',
      amount: 0,
      status: 'UNDER_REVIEW',
    });
    console.log('✓ Created claim for Charlie');

    // 2. Create Dispute
    await Dispute.create({
      disputeId: 'DISP-CHARLIE-001',
      description: 'Missing bank account exception review',
      employeeId: 'charlie@company.com',
      payslipId: charliePayslip._id,
      status: 'UNDER_REVIEW',
    });
    console.log('✓ Created dispute for Charlie');

    // 3. Create Refund (linked to dispute)
    await Refund.create({
      disputeId: 'DISP-CHARLIE-001',
      refundDetails: {
        description: 'Pending review for missing bank account exception',
        reason: 'Bank account information not provided',
      },
      amount: 0,
      employeeId: 'charlie@company.com',
      financeStaffId: 'hannah@company.com',
      status: 'PENDING',
    });
    console.log('✓ Created refund for dispute');

    // Generate validation report
    const claimsCount = await Claim.countDocuments();
    const disputesCount = await Dispute.countDocuments();
    const refundsCount = await Refund.countDocuments();

    console.log('\n=== Validation Summary ===');
    console.log(`Claims created: ${claimsCount}`);
    console.log(`Disputes created: ${disputesCount}`);
    console.log(`Refunds created: ${refundsCount}`);
    console.log('Employee: charlie@company.com');
    console.log('Payroll Run: PR-2025-001');
    console.log('Finance Staff: hannah@company.com');

    console.log('\n=== Payroll Tracking Seed Complete ===\n');
  } catch (error) {
    console.error('✗ Seed Error:', error);
    throw error;
  }
};

const run = async () => {
  await connectDB();
  await seedPayrollTracking();
  await mongoose.connection.close();
  console.log('✓ Database connection closed');
  process.exit(0);
};

run();
