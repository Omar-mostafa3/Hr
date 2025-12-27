// seedPayrollConfiguration.js
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
const companyWideSettingsSchema = new mongoose.Schema({
  payDate: Date,
  timeZone: String,
  currency: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const payGradeSchema = new mongoose.Schema({
  grade: { type: String, required: true, unique: true },
  baseSalary: Number,
  grossSalary: Number,
  status: {
    type: String,
    enum: ['DRAFT', 'APPROVED', 'REJECTED'],
    default: 'DRAFT',
  },
  createdBy: String,
  approvedBy: String,
  approvedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const allowanceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  amount: Number,
  status: {
    type: String,
    enum: ['DRAFT', 'APPROVED', 'REJECTED'],
    default: 'DRAFT',
  },
  createdBy: String,
  approvedBy: String,
  approvedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

const insuranceBracketSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: {
    type: String,
    enum: ['DRAFT', 'APPROVED', 'REJECTED'],
    default: 'DRAFT',
  },
  minSalary: Number,
  maxSalary: Number,
  employeeRate: Number,
  employerRate: Number,
  amount: Number,
  createdAt: { type: Date, default: Date.now },
});

const payTypeSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true },
  amount: Number,
  status: {
    type: String,
    enum: ['DRAFT', 'APPROVED', 'REJECTED'],
    default: 'DRAFT',
  },
  createdBy: String,
  approvedBy: String,
  createdAt: { type: Date, default: Date.now },
});

const signingBonusSchema = new mongoose.Schema({
  positionName: { type: String, required: true, unique: true },
  amount: Number,
  status: {
    type: String,
    enum: ['DRAFT', 'APPROVED', 'REJECTED'],
    default: 'DRAFT',
  },
  createdBy: String,
  approvedBy: String,
  createdAt: { type: Date, default: Date.now },
});

const taxRuleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  rate: Number,
  status: {
    type: String,
    enum: ['DRAFT', 'APPROVED', 'REJECTED'],
    default: 'DRAFT',
  },
  createdBy: String,
  approvedBy: String,
  createdAt: { type: Date, default: Date.now },
});

const terminationBenefitSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  amount: Number,
  terms: String,
  status: {
    type: String,
    enum: ['DRAFT', 'APPROVED', 'REJECTED'],
    default: 'DRAFT',
  },
  createdBy: String,
  approvedBy: String,
  createdAt: { type: Date, default: Date.now },
});

const payrollPolicySchema = new mongoose.Schema({
  policyName: { type: String, required: true, unique: true },
  policyType: { type: String, enum: ['DEDUCTION', 'ALLOWANCE', 'BENEFIT'] },
  description: String,
  effectiveDate: Date,
  ruleDefinition: {
    percentage: Number,
    fixedAmount: Number,
    thresholdAmount: Number,
  },
  applicability: {
    type: String,
    enum: ['AllEmployees', 'ByDepartment', 'ByPosition'],
  },
  status: {
    type: String,
    enum: ['DRAFT', 'APPROVED', 'REJECTED'],
    default: 'DRAFT',
  },
  createdBy: String,
  approvedBy: String,
  createdAt: { type: Date, default: Date.now },
});

const CompanyWideSettings = mongoose.model(
  'CompanyWideSettings',
  companyWideSettingsSchema,
);
const PayGrade = mongoose.model('PayGrade', payGradeSchema);
const Allowance = mongoose.model('Allowance', allowanceSchema);
const InsuranceBracket = mongoose.model(
  'InsuranceBracket',
  insuranceBracketSchema,
);
const PayType = mongoose.model('PayType', payTypeSchema);
const SigningBonus = mongoose.model('SigningBonus', signingBonusSchema);
const TaxRule = mongoose.model('TaxRule', taxRuleSchema);
const TerminationBenefit = mongoose.model(
  'TerminationBenefit',
  terminationBenefitSchema,
);
const PayrollPolicy = mongoose.model('PayrollPolicy', payrollPolicySchema);

const seedPayrollConfiguration = async () => {
  try {
    console.log('\n=== Starting Payroll Configuration Seed ===\n');

    await CompanyWideSettings.deleteMany({});
    await PayGrade.deleteMany({});
    await Allowance.deleteMany({});
    await InsuranceBracket.deleteMany({});
    await PayType.deleteMany({});
    await SigningBonus.deleteMany({});
    await TaxRule.deleteMany({});
    await TerminationBenefit.deleteMany({});
    await PayrollPolicy.deleteMany({});

    const now = new Date();

    // 1. Company Wide Settings
    await CompanyWideSettings.create({
      payDate: now,
      timeZone: 'Africa/Cairo',
      currency: 'EGP',
    });
    console.log('✓ Created company-wide settings');

    // 2. Pay Grades
    const payGrades = [
      {
        grade: 'HR Manager',
        baseSalary: 18000,
        grossSalary: 21000,
        status: 'APPROVED',
        createdBy: 'bob@company.com',
        approvedBy: 'paula@company.com',
        approvedAt: now,
      },
      {
        grade: 'HR Generalist',
        baseSalary: 13000,
        grossSalary: 16000,
        status: 'APPROVED',
        createdBy: 'bob@company.com',
        approvedBy: 'paula@company.com',
        approvedAt: now,
      },
      {
        grade: 'Software Engineer',
        baseSalary: 17000,
        grossSalary: 20000,
        status: 'APPROVED',
        createdBy: 'bob@company.com',
        approvedBy: 'paula@company.com',
        approvedAt: now,
      },
      {
        grade: 'Senior Software Engineer',
        baseSalary: 23000,
        grossSalary: 26000,
        status: 'APPROVED',
        createdBy: 'bob@company.com',
        approvedBy: 'paula@company.com',
        approvedAt: now,
      },
      {
        grade: 'QA Engineer',
        baseSalary: 14000,
        grossSalary: 17000,
        status: 'APPROVED',
        createdBy: 'bob@company.com',
        approvedBy: 'paula@company.com',
        approvedAt: now,
      },
      {
        grade: 'Sales Representative',
        baseSalary: 12000,
        grossSalary: 15000,
        status: 'APPROVED',
        createdBy: 'bob@company.com',
        approvedBy: 'paula@company.com',
        approvedAt: now,
      },
      {
        grade: 'Sales Lead',
        baseSalary: 16000,
        grossSalary: 19000,
        status: 'APPROVED',
        createdBy: 'bob@company.com',
        approvedBy: 'paula@company.com',
        approvedAt: now,
      },
      {
        grade: 'TA',
        baseSalary: 8000,
        grossSalary: 11000,
        status: 'APPROVED',
        createdBy: 'bob@company.com',
        approvedBy: 'paula@company.com',
        approvedAt: now,
      },
      {
        grade: 'LA',
        baseSalary: 10000,
        grossSalary: 13000,
        status: 'APPROVED',
        createdBy: 'bob@company.com',
        approvedBy: 'paula@company.com',
        approvedAt: now,
      },
      {
        grade: 'Accountant',
        baseSalary: 15000,
        grossSalary: 18000,
        status: 'APPROVED',
        createdBy: 'bob@company.com',
        approvedBy: 'paula@company.com',
        approvedAt: now,
      },
      {
        grade: 'Librarian',
        baseSalary: 9000,
        grossSalary: 12000,
        status: 'APPROVED',
        createdBy: 'bob@company.com',
        approvedBy: 'paula@company.com',
        approvedAt: now,
      },
      {
        grade: 'Operations Analyst (Inactive)',
        baseSalary: 0,
        grossSalary: 3000,
        status: 'REJECTED',
        createdBy: 'bob@company.com',
        approvedBy: 'paula@company.com',
        approvedAt: now,
      },
      {
        grade: 'Test Dept Head',
        baseSalary: 19000,
        grossSalary: 22000,
        status: 'APPROVED',
        createdBy: 'bob@company.com',
        approvedBy: 'paula@company.com',
        approvedAt: now,
      },
      {
        grade: 'Test Dept Employee',
        baseSalary: 11000,
        grossSalary: 14000,
        status: 'APPROVED',
        createdBy: 'bob@company.com',
        approvedBy: 'paula@company.com',
        approvedAt: now,
      },
      {
        grade: 'Junior TA',
        baseSalary: 8000,
        grossSalary: 11000,
        status: 'APPROVED',
        createdBy: 'bob@company.com',
        approvedBy: 'paula@company.com',
        approvedAt: now,
      },
      {
        grade: 'Senior TA',
        baseSalary: 15000,
        grossSalary: 18000,
        status: 'APPROVED',
        createdBy: 'bob@company.com',
        approvedBy: 'paula@company.com',
        approvedAt: now,
      },
      {
        grade: 'Mid TA Draft',
        baseSalary: 10000,
        grossSalary: 13000,
        status: 'DRAFT',
        createdBy: 'bob@company.com',
      },
      {
        grade: 'Intern TA Rejected',
        baseSalary: 6000,
        grossSalary: 9000,
        status: 'REJECTED',
        createdBy: 'bob@company.com',
      },
    ];

    await PayGrade.insertMany(payGrades);
    console.log(`✓ Created ${payGrades.length} pay grades`);

    // 3. Allowances
    const allowances = [
      {
        name: 'Housing approved Allowance',
        amount: 2000,
        status: 'APPROVED',
        createdBy: 'bob@company.com',
        approvedBy: 'paula@company.com',
        approvedAt: now,
      },
      {
        name: 'Transport Approved Allowance',
        amount: 1000,
        status: 'APPROVED',
        createdBy: 'bob@company.com',
        approvedBy: 'paula@company.com',
        approvedAt: now,
      },
      {
        name: 'Meal Draft Allowance',
        amount: 1000,
        status: 'DRAFT',
        createdBy: 'bob@company.com',
      },
      {
        name: 'Telephone Rejected Allowance',
        amount: 1000,
        status: 'REJECTED',
        createdBy: 'bob@company.com',
      },
    ];

    await Allowance.insertMany(allowances);
    console.log(`✓ Created ${allowances.length} allowances`);

    // 4. Insurance Brackets
    const insuranceBrackets = [
      {
        name: 'Social Insurance',
        status: 'APPROVED',
        minSalary: 0,
        maxSalary: 3000,
        employeeRate: 8,
        employerRate: 14,
      },
      {
        name: 'Social Insurance',
        status: 'APPROVED',
        minSalary: 3001,
        maxSalary: 9000,
        employeeRate: 10,
        employerRate: 16,
      },
      {
        name: 'Social Insurance',
        status: 'APPROVED',
        minSalary: 9001,
        maxSalary: 100000,
        employeeRate: 12,
        employerRate: 18,
      },
      {
        name: 'Medical Insurance Draft',
        status: 'DRAFT',
        minSalary: 2000,
        maxSalary: 10000,
        employeeRate: 11,
        employerRate: 18.75,
        amount: 500,
      },
      {
        name: 'Car Insurance Rejected',
        status: 'REJECTED',
        minSalary: 2000,
        maxSalary: 10000,
        employeeRate: 11,
        employerRate: 18.75,
        amount: 500,
      },
    ];

    await InsuranceBracket.insertMany(insuranceBrackets);
    console.log(`✓ Created ${insuranceBrackets.length} insurance brackets`);

    // 5. Pay Types
    const payTypes = [
      {
        type: 'Monthly Approved Salary',
        amount: 6000,
        status: 'APPROVED',
        createdBy: 'bob@company.com',
        approvedBy: 'paula@company.com',
      },
      {
        type: 'Hourly Draft Salary',
        amount: 6000,
        status: 'DRAFT',
        createdBy: 'bob@company.com',
      },
      {
        type: 'Contact Rejected Salary',
        amount: 6000,
        status: 'REJECTED',
        createdBy: 'bob@company.com',
      },
    ];

    await PayType.insertMany(payTypes);
    console.log(`✓ Created ${payTypes.length} pay types`);

    // 6. Signing Bonuses
    const signingBonuses = [
      {
        positionName: 'Senior Developer',
        amount: 5000,
        status: 'APPROVED',
        createdBy: 'bob@company.com',
        approvedBy: 'paula@company.com',
      },
      {
        positionName: 'Junior Developer',
        amount: 1000,
        status: 'APPROVED',
        createdBy: 'bob@company.com',
        approvedBy: 'paula@company.com',
      },
      {
        positionName: 'Mid Developer',
        amount: 3000,
        status: 'DRAFT',
        createdBy: 'bob@company.com',
      },
      {
        positionName: 'Intern Developer',
        amount: 500,
        status: 'REJECTED',
        createdBy: 'bob@company.com',
      },
    ];

    await SigningBonus.insertMany(signingBonuses);
    console.log(`✓ Created ${signingBonuses.length} signing bonuses`);

    // 7. Tax Rules
    const taxRules = [
      {
        name: 'Standard Income Tax',
        description: 'Standard income tax deduction',
        rate: 10,
        status: 'APPROVED',
        createdBy: 'bob@company.com',
        approvedBy: 'paula@company.com',
      },
      {
        name: 'Sales Tax Draft',
        description: 'Sales tax deduction',
        rate: 20,
        status: 'DRAFT',
        createdBy: 'bob@company.com',
      },
      {
        name: 'VAT Tax Rejected',
        description: 'VAT tax deduction',
        rate: 14,
        status: 'REJECTED',
        createdBy: 'bob@company.com',
      },
    ];

    await TaxRule.insertMany(taxRules);
    console.log(`✓ Created ${taxRules.length} tax rules`);

    // 8. Termination & Resignation Benefits
    const terminationBenefits = [
      {
        name: 'End of Service Gratuity',
        amount: 10000,
        terms: 'After 1 year of service',
        status: 'APPROVED',
        createdBy: 'bob@company.com',
        approvedBy: 'paula@company.com',
      },
      {
        name: 'Compensation Benefit Draft',
        amount: 10000,
        terms: 'After 1 year of service',
        status: 'DRAFT',
        createdBy: 'bob@company.com',
      },
      {
        name: 'Notice Period Benefit Rejected',
        amount: 10000,
        terms: 'After 1 year of service',
        status: 'REJECTED',
        createdBy: 'bob@company.com',
      },
    ];

    await TerminationBenefit.insertMany(terminationBenefits);
    console.log(`✓ Created ${terminationBenefits.length} termination benefits`);

    // 9. Payroll Policies
    const payrollPolicies = [
      {
        policyName: 'Standard Approved Tax Policy',
        policyType: 'DEDUCTION',
        description: 'Applies standard tax rules',
        effectiveDate: new Date('2025-01-01'),
        ruleDefinition: {
          percentage: 10,
          fixedAmount: 0,
          thresholdAmount: 5000,
        },
        applicability: 'AllEmployees',
        status: 'APPROVED',
        createdBy: 'bob@company.com',
        approvedBy: 'paula@company.com',
      },
      {
        policyName: 'Standard Draft Allowance Policy',
        policyType: 'ALLOWANCE',
        description: 'Applies standard allowance rules',
        effectiveDate: new Date('2025-01-01'),
        ruleDefinition: {
          percentage: 20,
          fixedAmount: 0,
          thresholdAmount: 4000,
        },
        applicability: 'AllEmployees',
        status: 'DRAFT',
        createdBy: 'bob@company.com',
      },
      {
        policyName: 'Standard Rejected Benfit Policy',
        policyType: 'BENEFIT',
        description: 'Applies standard Benfit rules',
        effectiveDate: new Date('2025-01-01'),
        ruleDefinition: {
          percentage: 20,
          fixedAmount: 0,
          thresholdAmount: 4000,
        },
        applicability: 'AllEmployees',
        status: 'REJECTED',
        createdBy: 'bob@company.com',
      },
    ];

    await PayrollPolicy.insertMany(payrollPolicies);
    console.log(`✓ Created ${payrollPolicies.length} payroll policies`);

    console.log('\n=== Payroll Configuration Seed Complete ===\n');
  } catch (error) {
    console.error('✗ Seed Error:', error);
    throw error;
  }
};

const run = async () => {
  await connectDB();
  await seedPayrollConfiguration();
  await mongoose.connection.close();
  console.log('✓ Database connection closed');
  process.exit(0);
};

run();
