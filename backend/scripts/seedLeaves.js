// seedLeaves.js
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
const leaveCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  createdAt: { type: Date, default: Date.now },
});

const leaveTypeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: String,
  category: String,
  description: String,
  paid: Boolean,
  deductible: Boolean,
  requiresAttachment: Boolean,
  attachmentType: { type: String, enum: ['MEDICAL', 'LEGAL', 'OTHER'] },
  createdAt: { type: Date, default: Date.now },
});

const leavePolicySchema = new mongoose.Schema({
  leaveType: String,
  accrualMethod: { type: String, enum: ['MONTHLY', 'YEARLY', 'NONE'] },
  monthlyRate: Number,
  yearlyRate: Number,
  carryForwardAllowed: Boolean,
  maxCarryForward: Number,
  roundingRule: { type: String, enum: ['ROUND_UP', 'ROUND_DOWN', 'NONE'] },
  minNoticeDays: Number,
  eligibility: {
    minTenureMonths: Number,
  },
  createdAt: { type: Date, default: Date.now },
});

const leaveEntitlementSchema = new mongoose.Schema({
  employeeEmail: String,
  leaveType: String,
  yearlyEntitlement: Number,
  accruedActual: Number,
  accruedRounded: Number,
  remaining: Number,
  createdAt: { type: Date, default: Date.now },
});

const leaveRequestSchema = new mongoose.Schema({
  employeeEmail: String,
  leaveType: String,
  startDate: Date,
  endDate: Date,
  durationDays: Number,
  justification: String,
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  },
  approvalFlow: [
    {
      level: String,
      approverEmail: String,
      decision: String,
      decidedAt: Date,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const attachmentSchema = new mongoose.Schema({
  originalName: String,
  filePath: String,
  fileType: String,
  size: Number,
  createdAt: { type: Date, default: Date.now },
});

const calendarSchema = new mongoose.Schema({
  year: Number,
  holidays: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Holiday' }],
  blockedPeriods: [
    {
      startDate: Date,
      endDate: Date,
      reason: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const leaveAdjustmentSchema = new mongoose.Schema({
  employeeEmail: String,
  leaveType: String,
  adjustmentType: { type: String, enum: ['ADD', 'DEDUCT'] },
  amount: Number,
  reason: String,
  hrUserId: String,
  createdAt: { type: Date, default: Date.now },
});

const LeaveCategory = mongoose.model('LeaveCategory', leaveCategorySchema);
const LeaveType = mongoose.model('LeaveType', leaveTypeSchema);
const LeavePolicy = mongoose.model('LeavePolicy', leavePolicySchema);
const LeaveEntitlement = mongoose.model(
  'LeaveEntitlement',
  leaveEntitlementSchema,
);
const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);
const Attachment = mongoose.model('Attachment', attachmentSchema);
const Calendar = mongoose.model('Calendar', calendarSchema);
const LeaveAdjustment = mongoose.model(
  'LeaveAdjustment',
  leaveAdjustmentSchema,
);

const seedLeaves = async () => {
  try {
    console.log('\n=== Starting Leaves Seed ===\n');

    await LeaveCategory.deleteMany({});
    await LeaveType.deleteMany({});
    await LeavePolicy.deleteMany({});
    await LeaveEntitlement.deleteMany({});
    await LeaveRequest.deleteMany({});
    await Attachment.deleteMany({});
    await Calendar.deleteMany({});
    await LeaveAdjustment.deleteMany({});

    // 1. Leave Categories
    const categories = [
      { name: 'Annual', description: 'Standard annual leave' },
      { name: 'Sick', description: 'Medical leave' },
      { name: 'Unpaid', description: 'Unpaid leave category' },
    ];
    await LeaveCategory.insertMany(categories);
    console.log(`✓ Created ${categories.length} leave categories`);

    // 2. Leave Types
    const leaveTypes = [
      {
        code: 'AL',
        name: 'Annual Leave',
        category: 'Annual',
        description: 'Paid annual leave',
        paid: true,
        deductible: true,
        requiresAttachment: false,
      },
      {
        code: 'SL',
        name: 'Sick Leave',
        category: 'Sick',
        description: 'Paid sick leave',
        paid: true,
        deductible: true,
        requiresAttachment: true,
        attachmentType: 'MEDICAL',
      },
      {
        code: 'UL',
        name: 'Unpaid Leave',
        category: 'Unpaid',
        description: 'Unpaid leave type',
        paid: false,
        deductible: false,
        requiresAttachment: false,
      },
    ];
    await LeaveType.insertMany(leaveTypes);
    console.log(`✓ Created ${leaveTypes.length} leave types`);

    // 3. Leave Policies
    const policies = [
      {
        leaveType: 'AL',
        accrualMethod: 'MONTHLY',
        monthlyRate: 1.75,
        yearlyRate: 21,
        carryForwardAllowed: true,
        maxCarryForward: 5,
        roundingRule: 'ROUND_UP',
        minNoticeDays: 7,
        eligibility: { minTenureMonths: 6 },
      },
      {
        leaveType: 'SL',
        accrualMethod: 'YEARLY',
        yearlyRate: 14,
        carryForwardAllowed: false,
        roundingRule: 'NONE',
        minNoticeDays: 0,
      },
    ];
    await LeavePolicy.insertMany(policies);
    console.log(`✓ Created ${policies.length} leave policies`);

    // 4. Leave Entitlements
    const entitlements = [
      {
        employeeEmail: 'alice@company.com',
        leaveType: 'AL',
        yearlyEntitlement: 21,
        accruedActual: 21,
        accruedRounded: 21,
        remaining: 21,
      },
      {
        employeeEmail: 'alice@company.com',
        leaveType: 'SL',
        yearlyEntitlement: 14,
        accruedActual: 14,
        accruedRounded: 14,
        remaining: 14,
      },
      {
        employeeEmail: 'bob@company.com',
        leaveType: 'SL',
        yearlyEntitlement: 14,
        accruedActual: 14,
        accruedRounded: 14,
        remaining: 14,
      },
      {
        employeeEmail: 'tariq.ta@company.com',
        leaveType: 'AL',
        yearlyEntitlement: 21,
        accruedActual: 21,
        accruedRounded: 21,
        remaining: 21,
      },
      {
        employeeEmail: 'tariq.ta@company.com',
        leaveType: 'SL',
        yearlyEntitlement: 14,
        accruedActual: 14,
        accruedRounded: 14,
        remaining: 14,
      },
      {
        employeeEmail: 'laila.la@company.com',
        leaveType: 'AL',
        yearlyEntitlement: 21,
        accruedActual: 21,
        accruedRounded: 21,
        remaining: 21,
      },
      {
        employeeEmail: 'laila.la@company.com',
        leaveType: 'SL',
        yearlyEntitlement: 14,
        accruedActual: 14,
        accruedRounded: 14,
        remaining: 14,
      },
      {
        employeeEmail: 'amir.accountant@company.com',
        leaveType: 'AL',
        yearlyEntitlement: 21,
        accruedActual: 21,
        accruedRounded: 21,
        remaining: 21,
      },
      {
        employeeEmail: 'amir.accountant@company.com',
        leaveType: 'SL',
        yearlyEntitlement: 14,
        accruedActual: 14,
        accruedRounded: 14,
        remaining: 14,
      },
      {
        employeeEmail: 'salma.librarian@company.com',
        leaveType: 'UL',
        yearlyEntitlement: 0,
        accruedActual: 0,
        accruedRounded: 0,
        remaining: 0,
      },
    ];
    await LeaveEntitlement.insertMany(entitlements);
    console.log(`✓ Created ${entitlements.length} leave entitlements`);

    // 5. Leave Requests
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextWeekPlus2 = new Date(
      nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000,
    );

    const requests = [
      {
        employeeEmail: 'alice@company.com',
        leaveType: 'AL',
        startDate: nextWeek,
        endDate: nextWeekPlus2,
        durationDays: 3,
        justification: 'Vacation',
        status: 'PENDING',
        approvalFlow: [{ level: 'Manager', decision: 'PENDING' }],
      },
      {
        employeeEmail: 'bob@company.com',
        leaveType: 'SL',
        startDate: now,
        endDate: nextWeek,
        durationDays: 7,
        justification: 'Medical leave',
        status: 'APPROVED',
        approvalFlow: [
          {
            level: 'HR',
            approverEmail: 'alice@company.com',
            decision: 'APPROVED',
            decidedAt: now,
          },
        ],
      },
      {
        employeeEmail: 'tariq.ta@company.com',
        leaveType: 'AL',
        startDate: new Date('2025-05-01'),
        endDate: new Date('2025-05-02'),
        durationDays: 2,
        justification: 'Workshop support travel',
        status: 'REJECTED',
        approvalFlow: [
          {
            level: 'Manager',
            approverEmail: 'alice@company.com',
            decision: 'REJECTED',
            decidedAt: new Date('2025-04-20'),
          },
        ],
      },
      {
        employeeEmail: 'tariq.ta@company.com',
        leaveType: 'AL',
        startDate: new Date('2025-06-10'),
        endDate: new Date('2025-06-10'),
        durationDays: 1,
        justification: 'Training conflict',
        status: 'REJECTED',
        approvalFlow: [
          {
            level: 'Manager',
            approverEmail: 'alice@company.com',
            decision: 'REJECTED',
            decidedAt: new Date('2025-06-05'),
          },
        ],
      },
      {
        employeeEmail: 'tariq.ta@company.com',
        leaveType: 'SL',
        startDate: new Date('2025-07-15'),
        endDate: new Date('2025-07-16'),
        durationDays: 2,
        justification: 'Medical checkup',
        status: 'REJECTED',
        approvalFlow: [
          {
            level: 'HR',
            approverEmail: 'bob@company.com',
            decision: 'REJECTED',
            decidedAt: new Date('2025-07-10'),
          },
        ],
      },
      {
        employeeEmail: 'tariq.ta@company.com',
        leaveType: 'AL',
        startDate: new Date('2025-08-20'),
        endDate: new Date('2025-08-22'),
        durationDays: 3,
        justification: 'Family event',
        status: 'REJECTED',
        approvalFlow: [
          {
            level: 'Manager',
            approverEmail: 'alice@company.com',
            decision: 'REJECTED',
            decidedAt: new Date('2025-08-15'),
          },
        ],
      },
      {
        employeeEmail: 'tariq.ta@company.com',
        leaveType: 'AL',
        startDate: new Date('2025-09-05'),
        endDate: new Date('2025-09-06'),
        durationDays: 2,
        justification: 'Professional certification prep',
        status: 'APPROVED',
        approvalFlow: [
          {
            level: 'Manager',
            approverEmail: 'alice@company.com',
            decision: 'APPROVED',
            decidedAt: new Date('2025-08-30'),
          },
        ],
      },
      {
        employeeEmail: 'laila.la@company.com',
        leaveType: 'AL',
        startDate: new Date('2025-05-12'),
        endDate: new Date('2025-05-13'),
        durationDays: 2,
        justification: 'Conference attendance',
        status: 'APPROVED',
        approvalFlow: [
          {
            level: 'Manager',
            approverEmail: 'alice@company.com',
            decision: 'APPROVED',
            decidedAt: new Date('2025-05-05'),
          },
        ],
      },
      {
        employeeEmail: 'laila.la@company.com',
        leaveType: 'AL',
        startDate: new Date('2025-06-18'),
        endDate: new Date('2025-06-19'),
        durationDays: 2,
        justification: 'Family visit',
        status: 'APPROVED',
        approvalFlow: [
          {
            level: 'Manager',
            approverEmail: 'alice@company.com',
            decision: 'APPROVED',
            decidedAt: new Date('2025-06-10'),
          },
        ],
      },
      {
        employeeEmail: 'laila.la@company.com',
        leaveType: 'SL',
        startDate: new Date('2025-07-08'),
        endDate: new Date('2025-07-09'),
        durationDays: 2,
        justification: 'Dental procedure recovery',
        status: 'APPROVED',
        approvalFlow: [
          {
            level: 'HR',
            approverEmail: 'bob@company.com',
            decision: 'APPROVED',
            decidedAt: new Date('2025-07-05'),
          },
        ],
      },
      {
        employeeEmail: 'amir.accountant@company.com',
        leaveType: 'AL',
        startDate: new Date('2025-05-22'),
        endDate: new Date('2025-05-23'),
        durationDays: 2,
        justification: 'Quarter-end break',
        status: 'PENDING',
        approvalFlow: [{ level: 'Manager', decision: 'PENDING' }],
      },
      {
        employeeEmail: 'amir.accountant@company.com',
        leaveType: 'SL',
        startDate: new Date('2025-06-02'),
        endDate: new Date('2025-06-02'),
        durationDays: 1,
        justification: 'Clinic visit',
        status: 'PENDING',
        approvalFlow: [{ level: 'HR', decision: 'PENDING' }],
      },
      {
        employeeEmail: 'amir.accountant@company.com',
        leaveType: 'AL',
        startDate: new Date('2025-07-20'),
        endDate: new Date('2025-07-22'),
        durationDays: 3,
        justification: 'Family vacation',
        status: 'APPROVED',
        approvalFlow: [
          {
            level: 'Manager',
            approverEmail: 'alice@company.com',
            decision: 'APPROVED',
            decidedAt: new Date('2025-07-10'),
          },
        ],
      },
      {
        employeeEmail: 'amir.accountant@company.com',
        leaveType: 'AL',
        startDate: new Date('2025-08-12'),
        endDate: new Date('2025-08-13'),
        durationDays: 2,
        justification: 'Audit support conflict',
        status: 'REJECTED',
        approvalFlow: [
          {
            level: 'Manager',
            approverEmail: 'alice@company.com',
            decision: 'REJECTED',
            decidedAt: new Date('2025-08-05'),
          },
        ],
      },
      {
        employeeEmail: 'salma.librarian@company.com',
        leaveType: 'UL',
        startDate: new Date('2025-09-15'),
        endDate: new Date('2025-09-17'),
        durationDays: 3,
        justification: 'Community event support (unpaid)',
        status: 'APPROVED',
        approvalFlow: [
          {
            level: 'Manager',
            approverEmail: 'alice@company.com',
            decision: 'APPROVED',
            decidedAt: new Date('2025-09-05'),
          },
        ],
      },
    ];
    await LeaveRequest.insertMany(requests);
    console.log(`✓ Created ${requests.length} leave requests`);

    // 6. Attachment
    await Attachment.create({
      originalName: 'medical-report.pdf',
      filePath: '/attachments/medical-report.pdf',
      fileType: 'application/pdf',
      size: 350000,
    });
    console.log('✓ Created attachment');

    // 7. Calendar
    await Calendar.create({
      year: 2025,
      holidays: [], // References from Holiday collection
      blockedPeriods: [
        {
          startDate: new Date('2025-08-01'),
          endDate: new Date('2025-08-15'),
          reason: 'Peak season blackout',
        },
      ],
    });
    console.log('✓ Created calendar');

    // 8. Leave Adjustment
    await LeaveAdjustment.create({
      employeeEmail: 'charlie@company.com',
      leaveType: 'AL',
      adjustmentType: 'ADD',
      amount: 2,
      reason: 'Recognition award',
      hrUserId: 'alice@company.com',
    });
    console.log('✓ Created leave adjustment');

    console.log('\n=== Leaves Seed Complete ===\n');
  } catch (error) {
    console.error('✗ Seed Error:', error);
    throw error;
  }
};

const run = async () => {
  await connectDB();
  await seedLeaves();
  await mongoose.connection.close();
  console.log('✓ Database connection closed');
  process.exit(0);
};

run();
