// seedPayrollExecution.js
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
const payrollRunSchema = new mongoose.Schema({
  runId: { type: String, required: true, unique: true },
  payrollPeriod: Date,
  status: {
    type: String,
    enum: ['DRAFT', 'APPROVED', 'PROCESSED', 'CANCELLED'],
    default: 'DRAFT',
  },
  entity: String,
  employees: Number,
  exceptions: Number,
  totalNetPay: Number,
  payrollSpecialistId: mongoose.Schema.Types.ObjectId,
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PROCESSED', 'FAILED'],
    default: 'PENDING',
  },
  createdAt: { type: Date, default: Date.now },
});

const employeePayrollDetailsSchema = new mongoose.Schema({
  employeeId: mongoose.Schema.Types.ObjectId,
  payrollRunId: mongoose.Schema.Types.ObjectId,
  baseSalary: Number,
  allowances: Number,
  deductions: Number,
  bonus: Number,
  benefit: Number,
  signingBonus: Number,
  terminationBenefit: Number,
  netSalary: Number,
  netPay: Number,
  bankStatus: { type: String, enum: ['VALID', 'MISSING', 'INVALID'] },
  exceptions: String,
  workingDays: Number,
  absentDays: Number,
  overtimeHours: Number,
  createdAt: { type: Date, default: Date.now },
});

const employeePenaltySchema = new mongoose.Schema({
  employeeId: mongoose.Schema.Types.ObjectId,
  penalties: [
    {
      reason: String,
      amount: Number,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const paySlipSchema = new mongoose.Schema({
  employeeId: mongoose.Schema.Types.ObjectId,
  payrollRunId: mongoose.Schema.Types.ObjectId,
  earningsDetails: {
    baseSalary: Number,
    allowances: [{ name: String, amount: Number }],
    bonuses: [{ positionName: String, amount: Number }],
    benefits: [{ name: String, amount: Number }],
    refunds: [],
  },
  deductionsDetails: {
    taxes: [{ name: String, rate: Number, amount: Number }],
    insurances: [],
    penalties: mongoose.Schema.Types.Mixed,
  },
  totalGrossSalary: Number,
  totaDeductions: Number,
  netPay: Number,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
});

const employeeSigningBonusSchema = new mongoose.Schema({
  employeeId: mongoose.Schema.Types.ObjectId,
  signingBonusId: mongoose.Schema.Types.ObjectId,
  givenAmount: Number,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  paymentDate: Date,
  approvedBy: mongoose.Schema.Types.ObjectId,
  approvedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

const employeeTerminationResignationSchema = new mongoose.Schema({
  employeeId: mongoose.Schema.Types.ObjectId,
  benefitId: mongoose.Schema.Types.ObjectId,
  givenAmount: Number,
  terminationId: mongoose.Schema.Types.ObjectId,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  paymentDate: Date,
  approvedBy: mongoose.Schema.Types.ObjectId,
  approvedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

const terminationRequestSchema = new mongoose.Schema({
  employeeId: mongoose.Schema.Types.ObjectId,
  requestDate: Date,
  effectiveDate: Date,
  type: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
});

const allowanceSchema = new mongoose.Schema({
  name: String,
  amount: Number,
  status: String,
  approvedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

const signingBonusSchema = new mongoose.Schema({
  positionName: String,
  amount: Number,
  status: String,
  approvedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

const terminationBenefitSchema = new mongoose.Schema({
  name: String,
  amount: Number,
  description: String,
  status: String,
  approvedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

const PayrollRun = mongoose.model(
  'PayrollRun',
  payrollRunSchema,
  'payrollruns',
);
const EmployeePayrollDetails = mongoose.model(
  'EmployeePayrollDetails',
  employeePayrollDetailsSchema,
  'employeepayrolldetails',
);
const EmployeePenalty = mongoose.model(
  'EmployeePenalty',
  employeePenaltySchema,
  'employeepenalties',
);
const PaySlip = mongoose.model('PaySlip', paySlipSchema, 'paySlip');
const EmployeeSigningBonus = mongoose.model(
  'EmployeeSigningBonus',
  employeeSigningBonusSchema,
  'employeesigningbonus',
);
const EmployeeTerminationResignation = mongoose.model(
  'EmployeeTerminationResignation',
  employeeTerminationResignationSchema,
  'employeeterminationresignations',
);
const TerminationRequest = mongoose.model(
  'TerminationRequest',
  terminationRequestSchema,
  'terminationrequest',
);
const Allowance = mongoose.model('Allowance', allowanceSchema, 'allowance');
const SigningBonus = mongoose.model(
  'SigningBonus',
  signingBonusSchema,
  'signingbonus',
);
const TerminationBenefit = mongoose.model(
  'TerminationBenefit',
  terminationBenefitSchema,
  'terminationandresignationbenefits',
);
const EmployeeProfile = mongoose.model(
  'EmployeeProfile',
  new mongoose.Schema({}, { strict: false }),
  'employee_profiles',
);

const seedPayrollExecution = async () => {
  try {
    console.log('\n=== Starting Payroll Execution Seed ===\n');

    // Clear existing data
    await PayrollRun.deleteMany({});
    await EmployeePayrollDetails.deleteMany({});
    await EmployeePenalty.deleteMany({});
    await PaySlip.deleteMany({});
    await EmployeeSigningBonus.deleteMany({});
    await EmployeeTerminationResignation.deleteMany({});
    await TerminationRequest.deleteMany({});
    console.log('✓ Cleared existing payroll data');

    const now = new Date();

    // ============================================
    // 1. FIND OR CREATE REQUIRED EMPLOYEES
    // ============================================
    console.log('\n👥 Finding/Creating required employees...');

    // Bob (Payroll Specialist)
    let bob = await EmployeeProfile.findOne({ workEmail: 'bob@company.com' });
    if (!bob) {
      bob = await EmployeeProfile.create({
        employeeNumber: 'EMP-002',
        nationalId: 'NAT-BOB-002',
        firstName: 'Bob',
        lastName: 'Jones',
        workEmail: 'bob@company.com',
        email: 'bob@company.com',
        status: 'ACTIVE',
        bankName: 'Metro CU',
        bankAccountNumber: 'MCU-002-2021',
        createdAt: now,
      });
      console.log(`   ✓ Created Bob: ${bob._id}`);
    } else {
      console.log(`   ✓ Found Bob: ${bob._id}`);
    }

    // Lina
    let lina = await EmployeeProfile.findOne({ workEmail: 'lina@company.com' });
    if (!lina) {
      lina = await EmployeeProfile.create({
        employeeNumber: 'EMP-011',
        nationalId: 'NAT-LINA-011',
        firstName: 'Lina',
        lastName: 'Park',
        workEmail: 'lina@company.com',
        email: 'lina@company.com',
        status: 'ACTIVE',
        bankName: 'CIB',
        bankAccountNumber: '2345678901234',
        createdAt: now,
      });
      console.log(`   ✓ Created Lina: ${lina._id}`);
    } else {
      console.log(`   ✓ Found Lina: ${lina._id}`);
    }

    // Eric
    let eric = await EmployeeProfile.findOne({ workEmail: 'eric@company.com' });
    if (!eric) {
      eric = await EmployeeProfile.create({
        employeeNumber: 'EMP-005',
        nationalId: 'NAT-ERIC-005',
        firstName: 'Eric',
        lastName: 'Stone',
        workEmail: 'eric@company.com',
        email: 'eric@company.com',
        status: 'ACTIVE',
        bankName: 'Banque Misr',
        bankAccountNumber: '3456789012345',
        createdAt: now,
      });
      console.log(`   ✓ Created Eric: ${eric._id}`);
    } else {
      console.log(`   ✓ Found Eric: ${eric._id}`);
    }

    // Charlie (NO BANK ACCOUNT)
    let charlie = await EmployeeProfile.findOne({
      workEmail: 'charlie@company.com',
    });
    if (!charlie) {
      charlie = await EmployeeProfile.create({
        employeeNumber: 'EMP-003',
        nationalId: 'NAT-CHARLIE-003',
        firstName: 'Charlie',
        lastName: 'Brown',
        workEmail: 'charlie@company.com',
        email: 'charlie@company.com',
        status: 'ACTIVE',
        bankName: null,
        bankAccountNumber: null,
        createdAt: now,
      });
      console.log(`   ✓ Created Charlie (NO BANK): ${charlie._id}`);
    } else {
      console.log(`   ✓ Found Charlie: ${charlie._id}`);
    }

    // ============================================
    // 2. CREATE/FIND ALLOWANCES
    // ============================================
    console.log('\n💰 Creating/Finding allowances...');

    let housingAllowance = await Allowance.findOne({
      name: 'Housing Allowance',
    });
    if (!housingAllowance) {
      housingAllowance = await Allowance.create({
        name: 'Housing Allowance',
        amount: 2000,
        status: 'approved',
        approvedAt: now,
        createdAt: now,
      });
      console.log('   ✓ Created Housing Allowance');
    } else {
      console.log('   ✓ Found Housing Allowance');
    }

    let transportAllowance = await Allowance.findOne({
      name: 'Transport Allowance',
    });
    if (!transportAllowance) {
      transportAllowance = await Allowance.create({
        name: 'Transport Allowance',
        amount: 1000,
        status: 'approved',
        approvedAt: now,
        createdAt: now,
      });
      console.log('   ✓ Created Transport Allowance');
    } else {
      console.log('   ✓ Found Transport Allowance');
    }

    // ============================================
    // 3. CREATE/FIND SIGNING BONUS TEMPLATE
    // ============================================
    console.log('\n🎁 Creating/Finding signing bonus template...');

    let seniorSigningBonus = await SigningBonus.findOne({
      positionName: 'Senior Software Engineer',
    });
    if (!seniorSigningBonus) {
      seniorSigningBonus = await SigningBonus.create({
        positionName: 'Senior Software Engineer',
        amount: 12000,
        status: 'approved',
        approvedAt: now,
        createdAt: now,
      });
      console.log('   ✓ Created Senior Signing Bonus template');
    } else {
      console.log('   ✓ Found Senior Signing Bonus template');
    }

    // ============================================
    // 4. CREATE/FIND END OF SERVICE BENEFIT
    // ============================================
    console.log('\n💼 Creating/Finding End of Service Benefit...');

    let endOfServiceBenefit = await TerminationBenefit.findOne({
      name: 'End of Service Benefit',
    });
    if (!endOfServiceBenefit) {
      endOfServiceBenefit = await TerminationBenefit.create({
        name: 'End of Service Benefit',
        amount: 8000,
        description: 'End-of-service benefit',
        status: 'approved',
        approvedAt: now,
        createdAt: now,
      });
      console.log('   ✓ Created End of Service Benefit template');
    } else {
      console.log('   ✓ Found End of Service Benefit template');
    }

    // ============================================
    // 5. CREATE PAYROLL RUNS (2 SEPARATE RUNS)
    // ============================================
    console.log('\n📋 Creating payroll runs...');

    const payrollPeriod = new Date('2025-01-31');

    // Engineering Run (Lina, Eric) - PR-2025-001
    const engineeringRun = await PayrollRun.create({
      runId: 'PR-2025-001',
      payrollPeriod,
      status: 'DRAFT',
      entity: 'Engineering',
      employees: 2,
      exceptions: 0,
      totalNetPay: 0, // Will be updated later
      payrollSpecialistId: bob._id,
      paymentStatus: 'PENDING',
      createdAt: now,
    });
    console.log(
      `   ✓ Created Engineering run: PR-2025-001 (${engineeringRun._id})`,
    );

    // Sales Run (Charlie) - PR-2025-002
    const salesRun = await PayrollRun.create({
      runId: 'PR-2025-002',
      payrollPeriod,
      status: 'DRAFT',
      entity: 'Sales',
      employees: 1,
      exceptions: 1,
      totalNetPay: 0, // Will be updated later
      payrollSpecialistId: bob._id,
      paymentStatus: 'PENDING',
      createdAt: now,
    });
    console.log(`   ✓ Created Sales run: PR-2025-002 (${salesRun._id})`);

    // ============================================
    // 6. CREATE SIGNING BONUS ASSIGNMENTS
    // ============================================
    console.log('\n🎁 Creating signing bonus assignments...');

    await EmployeeSigningBonus.create({
      employeeId: lina._id,
      signingBonusId: seniorSigningBonus._id,
      givenAmount: 5000,
      status: 'approved',
      paymentDate: new Date('2025-02-28'),
      approvedBy: bob._id,
      approvedAt: now,
      createdAt: now,
    });
    console.log('   ✓ Lina signing bonus: 5000 approved (2025-02-28)');

    await EmployeeSigningBonus.create({
      employeeId: charlie._id,
      signingBonusId: seniorSigningBonus._id,
      givenAmount: 5000,
      status: 'pending',
      paymentDate: null,
      createdAt: now,
    });
    console.log('   ✓ Charlie signing bonus: 5000 pending');

    // ============================================
    // 7. CREATE TERMINATION BENEFIT ASSIGNMENTS
    // ============================================
    console.log('\n💼 Creating termination benefit assignments...');

    // Create termination request for Charlie
    const charlieTermRequest = await TerminationRequest.create({
      employeeId: charlie._id,
      requestDate: new Date('2025-01-15'),
      effectiveDate: new Date('2025-02-28'),
      type: 'RESIGNATION',
      status: 'approved',
      createdAt: now,
    });

    await EmployeeTerminationResignation.create({
      employeeId: lina._id,
      benefitId: endOfServiceBenefit._id,
      givenAmount: 5000,
      terminationId: null,
      status: 'pending',
      paymentDate: null,
      createdAt: now,
    });
    console.log('   ✓ Lina termination benefit: 5000 pending');

    await EmployeeTerminationResignation.create({
      employeeId: charlie._id,
      benefitId: endOfServiceBenefit._id,
      givenAmount: 5000,
      terminationId: charlieTermRequest._id,
      status: 'approved',
      paymentDate: new Date('2025-02-28'),
      approvedBy: bob._id,
      approvedAt: now,
      createdAt: now,
    });
    console.log('   ✓ Charlie termination benefit: 5000 approved (2025-02-28)');

    // ============================================
    // 8. CREATE EMPLOYEE PENALTIES (Charlie only)
    // ============================================
    console.log('\n⚠️  Creating employee penalties...');

    await EmployeePenalty.create({
      employeeId: charlie._id,
      penalties: [
        {
          reason: 'Missing bank account',
          amount: 150,
        },
      ],
      createdAt: now,
    });
    console.log('   ✓ Charlie penalty: Missing bank account (150)');

    // ============================================
    // 9. CREATE PAYROLL DETAILS & PAYSLIPS
    // ============================================
    console.log('\n💼 Creating payroll details and payslips...\n');

    const allowancesTotal = 3000;
    const taxRate = 0.1;

    // === LINA (Engineering Run) ===
    console.log('   Processing Lina (Engineering)...');
    const linaBaseSalary = 15000;
    const linaBonus = 5000;
    const linaGrossSalary = linaBaseSalary + allowancesTotal + linaBonus;
    const linaTax = linaGrossSalary * taxRate;
    const linaNetPay = linaGrossSalary - linaTax;

    await EmployeePayrollDetails.create({
      employeeId: lina._id,
      payrollRunId: engineeringRun._id,
      baseSalary: linaBaseSalary,
      allowances: allowancesTotal,
      deductions: linaTax,
      bonus: linaBonus,
      benefit: 0,
      signingBonus: linaBonus,
      terminationBenefit: 0,
      netSalary: linaNetPay,
      netPay: linaNetPay,
      bankStatus: 'VALID',
      exceptions: null,
      workingDays: 22,
      absentDays: 0,
      overtimeHours: 0,
      createdAt: now,
    });

    await PaySlip.create({
      employeeId: lina._id,
      payrollRunId: engineeringRun._id,
      earningsDetails: {
        baseSalary: linaBaseSalary,
        allowances: [
          { name: 'Housing Allowance', amount: 2000 },
          { name: 'Transport Allowance', amount: 1000 },
        ],
        bonuses: [
          { positionName: 'Senior Software Engineer', amount: linaBonus },
        ],
        benefits: [],
        refunds: [],
      },
      deductionsDetails: {
        taxes: [{ name: 'Income Tax', rate: taxRate, amount: linaTax }],
        insurances: [],
      },
      totalGrossSalary: linaGrossSalary,
      totaDeductions: linaTax,
      netPay: linaNetPay,
      paymentStatus: 'pending',
      createdAt: now,
    });
    console.log(
      `      Base: ${linaBaseSalary}, Allowances: ${allowancesTotal}, Bonus: ${linaBonus}`,
    );
    console.log(
      `      Gross: ${linaGrossSalary}, Tax: ${linaTax}, Net: ${linaNetPay}`,
    );

    // === ERIC (Engineering Run) ===
    console.log('\n   Processing Eric (Engineering)...');
    const ericBaseSalary = 14000;
    const ericGrossSalary = ericBaseSalary + allowancesTotal;
    const ericTax = ericGrossSalary * taxRate;
    const ericNetPay = ericGrossSalary - ericTax;

    await EmployeePayrollDetails.create({
      employeeId: eric._id,
      payrollRunId: engineeringRun._id,
      baseSalary: ericBaseSalary,
      allowances: allowancesTotal,
      deductions: ericTax,
      bonus: 0,
      benefit: 0,
      signingBonus: 0,
      terminationBenefit: 0,
      netSalary: ericNetPay,
      netPay: ericNetPay,
      bankStatus: 'VALID',
      exceptions: null,
      workingDays: 22,
      absentDays: 0,
      overtimeHours: 0,
      createdAt: now,
    });

    await PaySlip.create({
      employeeId: eric._id,
      payrollRunId: engineeringRun._id,
      earningsDetails: {
        baseSalary: ericBaseSalary,
        allowances: [
          { name: 'Housing Allowance', amount: 2000 },
          { name: 'Transport Allowance', amount: 1000 },
        ],
        bonuses: [],
        benefits: [],
        refunds: [],
      },
      deductionsDetails: {
        taxes: [{ name: 'Income Tax', rate: taxRate, amount: ericTax }],
        insurances: [],
      },
      totalGrossSalary: ericGrossSalary,
      totaDeductions: ericTax,
      netPay: ericNetPay,
      paymentStatus: 'pending',
      createdAt: now,
    });
    console.log(
      `      Base: ${ericBaseSalary}, Allowances: ${allowancesTotal}`,
    );
    console.log(
      `      Gross: ${ericGrossSalary}, Tax: ${ericTax}, Net: ${ericNetPay}`,
    );

    // === CHARLIE (Sales Run) ===
    console.log('\n   Processing Charlie (Sales)...');
    const charlieBaseSalary = 9000;
    const charlieBenefitAmount = 5000;
    const charlieGrossSalary =
      charlieBaseSalary + allowancesTotal + charlieBenefitAmount;
    const charlieTax = charlieGrossSalary * taxRate;
    const charliePenaltyAmount = 150;
    const charlieDeductions = charlieTax + charliePenaltyAmount;
    const charlieNetPay = charlieGrossSalary - charlieDeductions;

    await EmployeePayrollDetails.create({
      employeeId: charlie._id,
      payrollRunId: salesRun._id,
      baseSalary: charlieBaseSalary,
      allowances: allowancesTotal,
      deductions: charlieDeductions,
      bonus: 0,
      benefit: charlieBenefitAmount,
      signingBonus: 0,
      terminationBenefit: charlieBenefitAmount,
      netSalary: charlieNetPay,
      netPay: charlieNetPay,
      bankStatus: 'MISSING',
      exceptions: 'Missing bank account',
      workingDays: 22,
      absentDays: 0,
      overtimeHours: 0,
      createdAt: now,
    });

    await PaySlip.create({
      employeeId: charlie._id,
      payrollRunId: salesRun._id,
      earningsDetails: {
        baseSalary: charlieBaseSalary,
        allowances: [
          { name: 'Housing Allowance', amount: 2000 },
          { name: 'Transport Allowance', amount: 1000 },
        ],
        bonuses: [],
        benefits: [
          { name: 'End of Service Benefit', amount: charlieBenefitAmount },
        ],
        refunds: [],
      },
      deductionsDetails: {
        taxes: [{ name: 'Income Tax', rate: taxRate, amount: charlieTax }],
        insurances: [],
        penalties: {
          employeeId: charlie._id,
          penalties: [
            {
              reason: 'Missing bank account',
              amount: charliePenaltyAmount,
            },
          ],
        },
      },
      totalGrossSalary: charlieGrossSalary,
      totaDeductions: charlieDeductions,
      netPay: charlieNetPay,
      paymentStatus: 'pending',
      createdAt: now,
    });
    console.log(
      `      Base: ${charlieBaseSalary}, Allowances: ${allowancesTotal}, Benefit: ${charlieBenefitAmount}`,
    );
    console.log(
      `      Gross: ${charlieGrossSalary}, Tax: ${charlieTax}, Penalty: ${charliePenaltyAmount}`,
    );
    console.log(
      `      Deductions: ${charlieDeductions}, Net: ${charlieNetPay}`,
    );

    console.log('\n   ✓ 3 payroll details created');
    console.log('   ✓ 3 payslips created');

    // ============================================
    // 10. UPDATE PAYROLL RUN TOTALS
    // ============================================
    console.log('\n🔄 Updating payroll run totals...');

    const engineeringTotalNetPay = linaNetPay + ericNetPay;
    const salesTotalNetPay = charlieNetPay;

    await PayrollRun.updateOne(
      { _id: engineeringRun._id },
      { $set: { totalNetPay: engineeringTotalNetPay } },
    );

    await PayrollRun.updateOne(
      { _id: salesRun._id },
      { $set: { totalNetPay: salesTotalNetPay } },
    );

    console.log(
      `   ✓ Engineering run (PR-2025-001) total: ${engineeringTotalNetPay}`,
    );
    console.log(`   ✓ Sales run (PR-2025-002) total: ${salesTotalNetPay}`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ PAYROLL EXECUTION SEED COMPLETE!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📊 Summary:');
    console.log('\n🏢 Payroll Runs:');
    console.log('   • PR-2025-001 (Engineering): 2 employees, 0 exceptions');
    console.log(`     - Total Net Pay: ${engineeringTotalNetPay}`);
    console.log('   • PR-2025-002 (Sales): 1 employee, 1 exception');
    console.log(`     - Total Net Pay: ${salesTotalNetPay}`);
    console.log('   • Period: January 31, 2025');
    console.log('   • Status: DRAFT');
    console.log('   • Specialist: Bob');

    console.log('\n👥 Employees:');
    console.log('   • Lina (Engineering - PR-2025-001)');
    console.log(
      `     - Base: ${linaBaseSalary}, Allowances: ${allowancesTotal}, Signing Bonus: ${linaBonus}`,
    );
    console.log(
      `     - Gross: ${linaGrossSalary}, Tax: ${linaTax}, Net: ${linaNetPay}`,
    );
    console.log('     - Bank: VALID');
    console.log('   • Eric (Engineering - PR-2025-001)');
    console.log(
      `     - Base: ${ericBaseSalary}, Allowances: ${allowancesTotal}`,
    );
    console.log(
      `     - Gross: ${ericGrossSalary}, Tax: ${ericTax}, Net: ${ericNetPay}`,
    );
    console.log('     - Bank: VALID');
    console.log('   • Charlie (Sales - PR-2025-002)');
    console.log(
      `     - Base: ${charlieBaseSalary}, Allowances: ${allowancesTotal}, Benefit: ${charlieBenefitAmount}`,
    );
    console.log(
      `     - Gross: ${charlieGrossSalary}, Tax: ${charlieTax}, Penalty: ${charliePenaltyAmount}`,
    );
    console.log(`     - Net: ${charlieNetPay}`);
    console.log('     - Bank: MISSING ⚠️');

    console.log('\n🎁 Signing Bonuses:');
    console.log('   • Lina: 5000 approved (2025-02-28)');
    console.log('   • Charlie: 5000 pending');

    console.log('\n💼 Termination Benefits:');
    console.log('   • Lina: 5000 pending');
    console.log('   • Charlie: 5000 approved (2025-02-28)');

    console.log('\n⚠️  Penalties:');
    console.log('   • Charlie: Missing bank account (150)');

    console.log('\n✅ All requirements met!\n');

    console.log('\n=== Payroll Execution Seed Complete ===\n');
  } catch (error) {
    console.error('✗ Seed Error:', error);
    throw error;
  }
};

const run = async () => {
  await connectDB();
  await seedPayrollExecution();
  await mongoose.connection.close();
  console.log('✓ Database connection closed');
  process.exit(0);
};

run();
