/**
 * HRMS Payroll Execution Seed File
 *
 * This seed file contains ONLY the data required for Payroll Execution:
 * - Organization Structure (Departments, Positions) - minimal for employee context
 * - Employee Profiles - employees involved in payroll
 * - Employee System Roles - for access control
 * - Payroll Configuration (Pay Grades, Allowances, Tax Rules, etc.)
 * - Payroll Execution (Payroll Runs, Employee Payroll Details, Payslips, etc.)
 * - Payroll Tracking (Claims, Disputes, Refunds)
 *
 * Required Test Users (Password: 123456):
 * - sarah.smith@company.com (PAYROLL_SPECIALIST)
 * - michael.johnson@company.com (PAYROLL_MANAGER)
 * - emily.williams@company.com (FINANCE_STAFF)
 * - john.doe@company.com (DEPARTMENT_EMPLOYEE)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ============================================================================
// CONFIGURATION
// ============================================================================

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms';
const DEFAULT_PASSWORD = 'ChangeMe123';
const TEST_USER_PASSWORD = '123456';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

function dateNow() {
  return new Date();
}

function date(dateString) {
  return new Date(dateString);
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function seedPayrollExecution() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Hash passwords
    const defaultPasswordHash = await hashPassword(DEFAULT_PASSWORD);
    const testUserPasswordHash = await hashPassword(TEST_USER_PASSWORD);

    // ========================================================================
    // 1. DEPARTMENTS (Minimal - only what's needed for payroll)
    // ========================================================================
    console.log('\n--- Seeding Departments ---');

    const Department = mongoose.model('Department');
    await Department.deleteMany({});

    const departments = await Department.insertMany([
      {
        code: 'HR-001',
        name: 'Human Resources',
        description: 'Handles all HR related tasks',
        isActive: true,
      },
      {
        code: 'ENG-001',
        name: 'Engineering',
        description: 'Software Development and Engineering',
        isActive: true,
      },
      {
        code: 'SALES-001',
        name: 'Sales',
        description: 'Sales and Marketing',
        isActive: true,
      },
      {
        code: 'FIN-001',
        name: 'Finance',
        description: 'Finance and accounting operations',
        isActive: true,
      },
    ]);
    console.log(`Created ${departments.length} departments`);

    const deptMap = {};
    departments.forEach((d) => {
      deptMap[d.code] = d;
    });

    // ========================================================================
    // 2. POSITIONS (Minimal - only what's needed for payroll)
    // ========================================================================
    console.log('\n--- Seeding Positions ---');

    const Position = mongoose.model('Position');
    await Position.deleteMany({});

    const positions = await Position.insertMany([
      {
        code: 'POS-HR-MGR',
        title: 'HR Manager',
        departmentId: deptMap['HR-001']._id,
        description: 'Manager of Human Resources',
        isActive: true,
      },
      {
        code: 'POS-SWE',
        title: 'Software Engineer',
        departmentId: deptMap['ENG-001']._id,
        description: 'Full Stack Developer',
        isActive: true,
      },
      {
        code: 'POS-QA-ENG',
        title: 'QA Engineer',
        departmentId: deptMap['ENG-001']._id,
        description: 'Quality assurance and testing',
        isActive: true,
      },
      {
        code: 'POS-SALES-REP',
        title: 'Sales Representative',
        departmentId: deptMap['SALES-001']._id,
        description: 'Sales Representative',
        isActive: true,
      },
      {
        code: 'POS-ACC',
        title: 'Accountant',
        departmentId: deptMap['FIN-001']._id,
        description: 'Handles accounting operations',
        isActive: true,
      },
    ]);
    console.log(`Created ${positions.length} positions`);

    const posMap = {};
    positions.forEach((p) => {
      posMap[p.code] = p;
    });

    // ========================================================================
    // 3. EMPLOYEE PROFILES (Only employees needed for payroll execution)
    // ========================================================================
    console.log('\n--- Seeding Employee Profiles ---');

    const EmployeeProfile = mongoose.model('EmployeeProfile');
    await EmployeeProfile.deleteMany({});

    const employeeData = [
      // Core employees from Payroll Execution requirements (Lina, Eric, Charlie)
      {
        workEmail: 'lina@company.com',
        firstName: 'Lina',
        lastName: 'Park',
        employeeNumber: 'EMP-011',
        nationalId: 'NAT-LINA-011',
        gender: 'FEMALE',
        maritalStatus: 'SINGLE',
        contractType: 'FULL_TIME_CONTRACT',
        workType: 'FULL_TIME',
        deptCode: 'ENG-001',
        posCode: 'POS-QA-ENG',
        bankDetails: { bankName: 'Tech Bank', accountNumber: 'TB-011-2021' },
        password: defaultPasswordHash,
      },
      {
        workEmail: 'eric@company.com',
        firstName: 'Eric',
        lastName: 'Stone',
        employeeNumber: 'EMP-005',
        nationalId: 'NAT-ERIC-005',
        gender: 'MALE',
        maritalStatus: 'WIDOWED',
        contractType: 'FULL_TIME_CONTRACT',
        workType: 'FULL_TIME',
        deptCode: 'ENG-001',
        posCode: 'POS-SWE',
        bankDetails: { bankName: 'Tech Bank', accountNumber: 'TB-005-2020' },
        password: defaultPasswordHash,
      },
      {
        workEmail: 'charlie@company.com',
        firstName: 'Charlie',
        lastName: 'Brown',
        employeeNumber: 'EMP-003',
        nationalId: 'NAT-CHARLIE-003',
        gender: 'MALE',
        maritalStatus: 'SINGLE',
        contractType: 'PART_TIME_CONTRACT',
        workType: 'PART_TIME',
        deptCode: 'SALES-001',
        posCode: 'POS-SALES-REP',
        bankDetails: null, // Missing bank account - causes penalty
        password: defaultPasswordHash,
      },
      // Supporting employees (alice, bob, paula, hannah for approvals/refs)
      {
        workEmail: 'alice@company.com',
        firstName: 'Alice',
        lastName: 'Smith',
        employeeNumber: 'EMP-001',
        nationalId: 'NAT-ALICE-001',
        gender: 'FEMALE',
        maritalStatus: 'SINGLE',
        contractType: 'FULL_TIME_CONTRACT',
        workType: 'FULL_TIME',
        deptCode: 'HR-001',
        posCode: 'POS-HR-MGR',
        bankDetails: {
          bankName: 'First National Bank',
          accountNumber: 'FNB-001-2020',
        },
        password: defaultPasswordHash,
      },
      {
        workEmail: 'bob@company.com',
        firstName: 'Bob',
        lastName: 'Jones',
        employeeNumber: 'EMP-002',
        nationalId: 'NAT-BOB-002',
        gender: 'MALE',
        maritalStatus: 'MARRIED',
        contractType: 'FULL_TIME_CONTRACT',
        workType: 'FULL_TIME',
        deptCode: 'FIN-001',
        posCode: 'POS-ACC',
        bankDetails: { bankName: 'Metro CU', accountNumber: 'MCU-002-2021' },
        password: defaultPasswordHash,
      },
      {
        workEmail: 'paula@company.com',
        firstName: 'Paula',
        lastName: 'Payne',
        employeeNumber: 'EMP-012',
        nationalId: 'NAT-PAULA-012',
        gender: 'FEMALE',
        maritalStatus: 'SINGLE',
        contractType: 'FULL_TIME_CONTRACT',
        workType: 'FULL_TIME',
        deptCode: 'FIN-001',
        posCode: 'POS-ACC',
        bankDetails: { bankName: 'Finance Bank', accountNumber: 'FB-012-2024' },
        password: defaultPasswordHash,
      },
      {
        workEmail: 'hannah@company.com',
        firstName: 'Hannah',
        lastName: 'Lee',
        employeeNumber: 'EMP-008',
        nationalId: 'NAT-HANNAH-008',
        gender: 'FEMALE',
        maritalStatus: 'SINGLE',
        contractType: 'PART_TIME_CONTRACT',
        workType: 'PART_TIME',
        deptCode: 'FIN-001',
        posCode: 'POS-ACC',
        bankDetails: { bankName: 'Finance Bank', accountNumber: 'FB-008-2022' },
        password: defaultPasswordHash,
      },

      // *** REQUIRED TEST USERS (Password: 123456) ***
      {
        workEmail: 'sarah.smith@company.com',
        firstName: 'Sarah',
        lastName: 'Smith',
        employeeNumber: 'EMP-ADD-001',
        nationalId: 'NAT-SARAH-SMITH-001',
        gender: 'FEMALE',
        maritalStatus: 'SINGLE',
        contractType: 'FULL_TIME_CONTRACT',
        workType: 'FULL_TIME',
        deptCode: 'FIN-001',
        posCode: 'POS-ACC',
        bankDetails: { bankName: 'Payroll Bank', accountNumber: 'PB-ADD-001' },
        password: testUserPasswordHash,
      },
      {
        workEmail: 'michael.johnson@company.com',
        firstName: 'Michael',
        lastName: 'Johnson',
        employeeNumber: 'EMP-ADD-002',
        nationalId: 'NAT-MICHAEL-JOHNSON-002',
        gender: 'MALE',
        maritalStatus: 'MARRIED',
        contractType: 'FULL_TIME_CONTRACT',
        workType: 'FULL_TIME',
        deptCode: 'FIN-001',
        posCode: 'POS-ACC',
        bankDetails: { bankName: 'Payroll Bank', accountNumber: 'PB-ADD-002' },
        password: testUserPasswordHash,
      },
      {
        workEmail: 'emily.williams@company.com',
        firstName: 'Emily',
        lastName: 'Williams',
        employeeNumber: 'EMP-ADD-003',
        nationalId: 'NAT-EMILY-WILLIAMS-003',
        gender: 'FEMALE',
        maritalStatus: 'SINGLE',
        contractType: 'FULL_TIME_CONTRACT',
        workType: 'FULL_TIME',
        deptCode: 'FIN-001',
        posCode: 'POS-ACC',
        bankDetails: { bankName: 'Finance Bank', accountNumber: 'FB-ADD-003' },
        password: testUserPasswordHash,
      },
      {
        workEmail: 'john.doe@company.com',
        firstName: 'John',
        lastName: 'Doe',
        employeeNumber: 'EMP-ADD-004',
        nationalId: 'NAT-JOHN-DOE-004',
        gender: 'MALE',
        maritalStatus: 'SINGLE',
        contractType: 'FULL_TIME_CONTRACT',
        workType: 'FULL_TIME',
        deptCode: 'ENG-001',
        posCode: 'POS-SWE',
        bankDetails: { bankName: 'Tech Bank', accountNumber: 'TB-ADD-004' },
        password: testUserPasswordHash,
      },
    ];

    const employees = [];
    for (const emp of employeeData) {
      const employee = await EmployeeProfile.create({
        workEmail: emp.workEmail,
        firstName: emp.firstName,
        lastName: emp.lastName,
        employeeNumber: emp.employeeNumber,
        nationalId: emp.nationalId,
        password: emp.password,
        status: 'ACTIVE',
        contractType: emp.contractType,
        workType: emp.workType,
        gender: emp.gender,
        maritalStatus: emp.maritalStatus,
        primaryDepartmentId: deptMap[emp.deptCode]._id,
        primaryPositionId: posMap[emp.posCode]._id,
        bankDetails: emp.bankDetails,
      });
      employees.push(employee);
    }
    console.log(`Created ${employees.length} employee profiles`);

    const empMap = {};
    employees.forEach((e) => {
      empMap[e.workEmail] = e;
    });

    // ========================================================================
    // 4. EMPLOYEE SYSTEM ROLES
    // ========================================================================
    console.log('\n--- Seeding Employee System Roles ---');

    const EmployeeSystemRole = mongoose.model('EmployeeSystemRole');
    await EmployeeSystemRole.deleteMany({});

    const roleAssignments = [
      // Core employees
      {
        email: 'alice@company.com',
        roles: ['HR_MANAGER'],
        permissions: ['org.manage', 'hr.manage'],
      },
      {
        email: 'bob@company.com',
        roles: ['PAYROLL_SPECIALIST'],
        permissions: ['payroll.process'],
      },
      {
        email: 'paula@company.com',
        roles: ['FINANCE_STAFF'],
        permissions: ['finance.view'],
      },
      {
        email: 'hannah@company.com',
        roles: ['FINANCE_STAFF'],
        permissions: ['finance.view'],
      },
      {
        email: 'lina@company.com',
        roles: ['DEPARTMENT_EMPLOYEE'],
        permissions: [],
      },
      {
        email: 'eric@company.com',
        roles: ['DEPARTMENT_EMPLOYEE'],
        permissions: [],
      },
      {
        email: 'charlie@company.com',
        roles: ['DEPARTMENT_EMPLOYEE'],
        permissions: [],
      },

      // *** REQUIRED TEST USERS ROLES ***
      {
        email: 'sarah.smith@company.com',
        roles: ['PAYROLL_SPECIALIST'],
        permissions: ['payroll.process', 'payroll.view'],
      },
      {
        email: 'michael.johnson@company.com',
        roles: ['PAYROLL_MANAGER'],
        permissions: ['payroll.manage', 'payroll.process', 'payroll.approve'],
      },
      {
        email: 'emily.williams@company.com',
        roles: ['FINANCE_STAFF'],
        permissions: ['finance.view', 'finance.process'],
      },
      {
        email: 'john.doe@company.com',
        roles: ['DEPARTMENT_EMPLOYEE'],
        permissions: ['org.read'],
      },
    ];

    for (const ra of roleAssignments) {
      if (empMap[ra.email]) {
        await EmployeeSystemRole.create({
          employeeId: empMap[ra.email]._id,
          roles: ra.roles,
          permissions: ra.permissions,
        });
      }
    }
    console.log(`Created ${roleAssignments.length} employee system roles`);

    // ========================================================================
    // 5. PAYROLL CONFIGURATION
    // ========================================================================
    console.log('\n--- Seeding Payroll Configuration ---');

    // Company Wide Settings
    const CompanyWideSettings = mongoose.model('CompanyWideSettings');
    await CompanyWideSettings.deleteMany({});
    await CompanyWideSettings.create({
      payDate: dateNow(),
      timeZone: 'Africa/Cairo',
      currency: 'EGP',
    });
    console.log('Created company wide settings');

    // Pay Grades
    const PayGrade = mongoose.model('PayGrade');
    await PayGrade.deleteMany({});
    const payGrades = await PayGrade.insertMany([
      {
        grade: 'HR Manager',
        baseSalary: 18000,
        grossSalary: 21000,
        status: 'APPROVED',
        createdById: empMap['bob@company.com']._id,
        approvedById: empMap['paula@company.com']._id,
        approvedAt: dateNow(),
      },
      {
        grade: 'Software Engineer',
        baseSalary: 17000,
        grossSalary: 20000,
        status: 'APPROVED',
        createdById: empMap['bob@company.com']._id,
        approvedById: empMap['paula@company.com']._id,
        approvedAt: dateNow(),
      },
      {
        grade: 'QA Engineer',
        baseSalary: 14000,
        grossSalary: 17000,
        status: 'APPROVED',
        createdById: empMap['bob@company.com']._id,
        approvedById: empMap['paula@company.com']._id,
        approvedAt: dateNow(),
      },
      {
        grade: 'Sales Representative',
        baseSalary: 12000,
        grossSalary: 15000,
        status: 'APPROVED',
        createdById: empMap['bob@company.com']._id,
        approvedById: empMap['paula@company.com']._id,
        approvedAt: dateNow(),
      },
      {
        grade: 'Accountant',
        baseSalary: 15000,
        grossSalary: 18000,
        status: 'APPROVED',
        createdById: empMap['bob@company.com']._id,
        approvedById: empMap['paula@company.com']._id,
        approvedAt: dateNow(),
      },
    ]);
    console.log(`Created ${payGrades.length} pay grades`);

    // Allowances
    const Allowance = mongoose.model('Allowance');
    await Allowance.deleteMany({});
    const allowances = await Allowance.insertMany([
      {
        name: 'Housing approved Allowance',
        amount: 2000,
        status: 'APPROVED',
        createdById: empMap['bob@company.com']._id,
        approvedById: empMap['paula@company.com']._id,
        approvedAt: dateNow(),
      },
      {
        name: 'Transport Approved Allowance',
        amount: 1000,
        status: 'APPROVED',
        createdById: empMap['bob@company.com']._id,
        approvedById: empMap['paula@company.com']._id,
        approvedAt: dateNow(),
      },
      {
        name: 'Meal Draft Allowance',
        amount: 1000,
        status: 'DRAFT',
        createdById: empMap['bob@company.com']._id,
      },
      {
        name: 'Telephone Rejected Allowance',
        amount: 1000,
        status: 'REJECTED',
        createdById: empMap['bob@company.com']._id,
      },
    ]);
    console.log(`Created ${allowances.length} allowances`);

    // Insurance Brackets
    const InsuranceBracket = mongoose.model('InsuranceBracket');
    await InsuranceBracket.deleteMany({});
    await InsuranceBracket.insertMany([
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
    ]);
    console.log('Created insurance brackets');

    // Pay Types
    const PayType = mongoose.model('PayType');
    await PayType.deleteMany({});
    await PayType.insertMany([
      {
        type: 'Monthly Approved Salary',
        amount: 6000,
        status: 'APPROVED',
        createdById: empMap['bob@company.com']._id,
        approvedById: empMap['paula@company.com']._id,
      },
      {
        type: 'Hourly Draft Salary',
        amount: 6000,
        status: 'DRAFT',
        createdById: empMap['bob@company.com']._id,
      },
      {
        type: 'Contact Rejected Salary',
        amount: 6000,
        status: 'REJECTED',
        createdById: empMap['bob@company.com']._id,
      },
    ]);
    console.log('Created pay types');

    // Signing Bonuses
    const SigningBonus = mongoose.model('SigningBonus');
    await SigningBonus.deleteMany({});
    const signingBonuses = await SigningBonus.insertMany([
      {
        positionName: 'Senior Developer',
        amount: 5000,
        status: 'APPROVED',
        createdById: empMap['bob@company.com']._id,
        approvedById: empMap['paula@company.com']._id,
      },
      {
        positionName: 'Junior Developer',
        amount: 1000,
        status: 'APPROVED',
        createdById: empMap['bob@company.com']._id,
        approvedById: empMap['paula@company.com']._id,
      },
      {
        positionName: 'Mid Developer',
        amount: 3000,
        status: 'DRAFT',
        createdById: empMap['bob@company.com']._id,
      },
      {
        positionName: 'Intern Developer',
        amount: 500,
        status: 'REJECTED',
        createdById: empMap['bob@company.com']._id,
      },
    ]);
    console.log(`Created ${signingBonuses.length} signing bonuses`);

    const signingBonusMap = {};
    signingBonuses.forEach((sb) => {
      signingBonusMap[sb.positionName] = sb;
    });

    // Tax Rules
    const TaxRule = mongoose.model('TaxRule');
    await TaxRule.deleteMany({});
    const taxRules = await TaxRule.insertMany([
      {
        name: 'Standard Income Tax',
        description: 'Standard income tax deduction',
        rate: 10,
        status: 'APPROVED',
        createdById: empMap['bob@company.com']._id,
        approvedById: empMap['paula@company.com']._id,
      },
      {
        name: 'Sales Tax Draft',
        description: 'Sales tax deduction',
        rate: 20,
        status: 'DRAFT',
        createdById: empMap['bob@company.com']._id,
      },
      {
        name: 'VAT Tax Rejected',
        description: 'VAT tax deduction',
        rate: 14,
        status: 'REJECTED',
        createdById: empMap['bob@company.com']._id,
      },
    ]);
    console.log(`Created ${taxRules.length} tax rules`);

    // Termination Benefits
    const TerminationBenefit = mongoose.model('TerminationBenefit');
    await TerminationBenefit.deleteMany({});
    const terminationBenefits = await TerminationBenefit.insertMany([
      {
        name: 'End of Service Gratuity',
        amount: 10000,
        terms: 'After 1 year of service',
        status: 'APPROVED',
        createdById: empMap['bob@company.com']._id,
        approvedById: empMap['paula@company.com']._id,
      },
      {
        name: 'Compensation Benefit Draft',
        amount: 10000,
        terms: 'After 1 year of service',
        status: 'DRAFT',
        createdById: empMap['bob@company.com']._id,
      },
      {
        name: 'Notice Period Benefit Rejected',
        amount: 10000,
        terms: 'After 1 year of service',
        status: 'REJECTED',
        createdById: empMap['bob@company.com']._id,
      },
    ]);
    console.log(`Created ${terminationBenefits.length} termination benefits`);

    const terminationBenefitMap = {};
    terminationBenefits.forEach((tb) => {
      terminationBenefitMap[tb.name] = tb;
    });

    // Payroll Policies
    const PayrollPolicy = mongoose.model('PayrollPolicy');
    await PayrollPolicy.deleteMany({});
    await PayrollPolicy.insertMany([
      {
        policyName: 'Standard Approved Tax Policy',
        policyType: 'DEDUCTION',
        description: 'Applies standard tax rules',
        effectiveDate: date('2025-01-01'),
        ruleDefinition: {
          percentage: 10,
          fixedAmount: 0,
          thresholdAmount: 5000,
        },
        applicability: 'AllEmployees',
        status: 'APPROVED',
        createdById: empMap['bob@company.com']._id,
        approvedById: empMap['paula@company.com']._id,
      },
      {
        policyName: 'Standard Draft Allowance Policy',
        policyType: 'ALLOWANCE',
        description: 'Applies standard allowance rules',
        effectiveDate: date('2025-01-01'),
        ruleDefinition: {
          percentage: 20,
          fixedAmount: 0,
          thresholdAmount: 4000,
        },
        applicability: 'AllEmployees',
        status: 'DRAFT',
        createdById: empMap['bob@company.com']._id,
      },
      {
        policyName: 'Standard Rejected Benefit Policy',
        policyType: 'BENEFIT',
        description: 'Applies standard Benefit rules',
        effectiveDate: date('2025-01-01'),
        ruleDefinition: {
          percentage: 20,
          fixedAmount: 0,
          thresholdAmount: 4000,
        },
        applicability: 'AllEmployees',
        status: 'REJECTED',
        createdById: empMap['bob@company.com']._id,
      },
    ]);
    console.log('Created payroll policies');

    // ========================================================================
    // 6. PAYROLL EXECUTION - PR-2025-001 (Jan 2025 for Lina, Eric, Charlie)
    // ========================================================================
    console.log('\n--- Seeding Payroll Execution ---');

    // Payroll Run
    const PayrollRun = mongoose.model('PayrollRun');
    await PayrollRun.deleteMany({});

    // Calculate salaries based on requirements:
    // Charlie: baseSalary 9000, Housing 2000, Transport 1000, Tax 10%, Penalty 150 (missing bank)
    // Lina: baseSalary 15000, Housing 2000, Transport 1000, Tax 10%, Signing Bonus 5000
    // Eric: baseSalary 14000, Housing 2000, Transport 1000, Tax 10%

    // Charlie calculations
    const charlieBase = 9000;
    const charlieAllowances = 3000; // Housing 2000 + Transport 1000
    const charlieGross = charlieBase + charlieAllowances;
    const charlieTax = charlieGross * 0.1;
    const charliePenalty = 150;
    const charlieNet = charlieGross - charlieTax - charliePenalty;

    // Lina calculations
    const linaBase = 15000;
    const linaAllowances = 3000;
    const linaBonus = 5000;
    const linaGross = linaBase + linaAllowances + linaBonus;
    const linaTax = linaGross * 0.1;
    const linaNet = linaGross - linaTax;

    // Eric calculations
    const ericBase = 14000;
    const ericAllowances = 3000;
    const ericGross = ericBase + ericAllowances;
    const ericTax = ericGross * 0.1;
    const ericNet = ericGross - ericTax;

    const totalNetPay = charlieNet + linaNet + ericNet;

    // Create Payroll Runs (one for Engineering, one for Sales as per requirements)
    const payrollRunEng = await PayrollRun.create({
      runId: 'PR-2025-001-ENG',
      payrollPeriod: date('2025-01-31'),
      status: 'DRAFT',
      entity: 'Engineering',
      employees: 2,
      exceptions: 0,
      totalNetPay: linaNet + ericNet,
      payrollSpecialistId: empMap['bob@company.com']._id,
      paymentStatus: 'PENDING',
    });

    const payrollRunSales = await PayrollRun.create({
      runId: 'PR-2025-001-SALES',
      payrollPeriod: date('2025-01-31'),
      status: 'DRAFT',
      entity: 'Sales',
      employees: 1,
      exceptions: 1,
      totalNetPay: charlieNet,
      payrollSpecialistId: empMap['bob@company.com']._id,
      paymentStatus: 'PENDING',
    });
    console.log('Created payroll runs');

    // Employee Payroll Details
    const EmployeePayrollDetails = mongoose.model('EmployeePayrollDetails');
    await EmployeePayrollDetails.deleteMany({});

    await EmployeePayrollDetails.insertMany([
      {
        employeeId: empMap['charlie@company.com']._id,
        payrollRunId: payrollRunSales._id,
        baseSalary: charlieBase,
        allowancesTotal: charlieAllowances,
        bonusesTotal: 0,
        benefitsTotal: 0,
        deductionsTotal: charlieTax + charliePenalty,
        taxAmount: charlieTax,
        penaltiesTotal: charliePenalty,
        netPay: charlieNet,
        bankStatus: 'MISSING',
        exceptions: ['Missing bank account'],
      },
      {
        employeeId: empMap['lina@company.com']._id,
        payrollRunId: payrollRunEng._id,
        baseSalary: linaBase,
        allowancesTotal: linaAllowances,
        bonusesTotal: linaBonus,
        benefitsTotal: 0,
        deductionsTotal: linaTax,
        taxAmount: linaTax,
        penaltiesTotal: 0,
        netPay: linaNet,
        bankStatus: 'VALID',
        exceptions: [],
      },
      {
        employeeId: empMap['eric@company.com']._id,
        payrollRunId: payrollRunEng._id,
        baseSalary: ericBase,
        allowancesTotal: ericAllowances,
        bonusesTotal: 0,
        benefitsTotal: 0,
        deductionsTotal: ericTax,
        taxAmount: ericTax,
        penaltiesTotal: 0,
        netPay: ericNet,
        bankStatus: 'VALID',
        exceptions: [],
      },
    ]);
    console.log('Created employee payroll details');

    // Employee Penalties (only for Charlie)
    const EmployeePenalty = mongoose.model('EmployeePenalty');
    await EmployeePenalty.deleteMany({});

    await EmployeePenalty.create({
      employeeId: empMap['charlie@company.com']._id,
      payrollRunId: payrollRunSales._id,
      penaltyType: 'MISSING_BANK_ACCOUNT',
      amount: 150,
      reason: 'Missing bank account penalty',
    });
    console.log('Created employee penalties');

    // Payslips
    const PaySlip = mongoose.model('PaySlip');
    await PaySlip.deleteMany({});

    const payslips = await PaySlip.insertMany([
      {
        employeeId: empMap['charlie@company.com']._id,
        payrollRunId: payrollRunSales._id,
        payrollPeriod: date('2025-01-31'),
        earningsDetails: {
          baseSalary: charlieBase,
          allowances: [
            { name: 'Housing approved Allowance', amount: 2000 },
            { name: 'Transport Approved Allowance', amount: 1000 },
          ],
          bonuses: [],
          benefits: [],
          refunds: [],
        },
        deductionsDetails: {
          taxes: [
            { name: 'Standard Income Tax', rate: 10, amount: charlieTax },
          ],
          insurances: [],
          penalties: [{ name: 'Missing Bank Account', amount: charliePenalty }],
        },
        totalGrossSalary: charlieGross,
        totalDeductions: charlieTax + charliePenalty,
        netPay: charlieNet,
        paymentStatus: 'PENDING',
      },
      {
        employeeId: empMap['lina@company.com']._id,
        payrollRunId: payrollRunEng._id,
        payrollPeriod: date('2025-01-31'),
        earningsDetails: {
          baseSalary: linaBase,
          allowances: [
            { name: 'Housing approved Allowance', amount: 2000 },
            { name: 'Transport Approved Allowance', amount: 1000 },
          ],
          bonuses: [
            { name: 'Senior Developer Signing Bonus', amount: linaBonus },
          ],
          benefits: [],
          refunds: [],
        },
        deductionsDetails: {
          taxes: [{ name: 'Standard Income Tax', rate: 10, amount: linaTax }],
          insurances: [],
          penalties: [],
        },
        totalGrossSalary: linaGross,
        totalDeductions: linaTax,
        netPay: linaNet,
        paymentStatus: 'PENDING',
      },
      {
        employeeId: empMap['eric@company.com']._id,
        payrollRunId: payrollRunEng._id,
        payrollPeriod: date('2025-01-31'),
        earningsDetails: {
          baseSalary: ericBase,
          allowances: [
            { name: 'Housing approved Allowance', amount: 2000 },
            { name: 'Transport Approved Allowance', amount: 1000 },
          ],
          bonuses: [],
          benefits: [],
          refunds: [],
        },
        deductionsDetails: {
          taxes: [{ name: 'Standard Income Tax', rate: 10, amount: ericTax }],
          insurances: [],
          penalties: [],
        },
        totalGrossSalary: ericGross,
        totalDeductions: ericTax,
        netPay: ericNet,
        paymentStatus: 'PENDING',
      },
    ]);
    console.log(`Created ${payslips.length} payslips`);

    // Employee Signing Bonus Assignments
    const EmployeeSigningBonus = mongoose.model('EmployeeSigningBonus');
    await EmployeeSigningBonus.deleteMany({});

    await EmployeeSigningBonus.insertMany([
      {
        employeeId: empMap['lina@company.com']._id,
        signingBonusId: signingBonusMap['Senior Developer']._id,
        givenAmount: 5000,
        status: 'APPROVED',
        paymentDate: date('2025-02-28'),
      },
      {
        employeeId: empMap['charlie@company.com']._id,
        signingBonusId: signingBonusMap['Senior Developer']._id,
        givenAmount: 5000,
        status: 'PENDING',
        paymentDate: null,
      },
    ]);
    console.log('Created employee signing bonus assignments');

    // Employee Termination/Resignation Benefits
    const EmployeeTerminationResignation = mongoose.model(
      'EmployeeTerminationResignation',
    );
    await EmployeeTerminationResignation.deleteMany({});

    await EmployeeTerminationResignation.insertMany([
      {
        employeeId: empMap['lina@company.com']._id,
        terminationBenefitId:
          terminationBenefitMap['End of Service Gratuity']._id,
        givenAmount: 5000,
        status: 'PENDING',
        paymentDate: null,
      },
      {
        employeeId: empMap['charlie@company.com']._id,
        terminationBenefitId:
          terminationBenefitMap['End of Service Gratuity']._id,
        givenAmount: 5000,
        status: 'APPROVED',
        paymentDate: date('2025-02-28'),
      },
    ]);
    console.log('Created employee termination/resignation benefits');

    // ========================================================================
    // 7. PAYROLL TRACKING (Claims, Disputes, Refunds for Charlie)
    // ========================================================================
    console.log('\n--- Seeding Payroll Tracking ---');

    // Claims
    const Claim = mongoose.model('Claim');
    await Claim.deleteMany({});

    await Claim.create({
      claimId: 'CLAIM-CHARLIE-001',
      description: 'Payroll January 2025 adjustment claim',
      claimType: 'Payroll',
      employeeId: empMap['charlie@company.com']._id,
      amount: 0,
      status: 'UNDER_REVIEW',
    });
    console.log('Created claims');

    // Get Charlie's payslip for dispute reference
    const charliePayslip = payslips.find((p) =>
      p.employeeId.equals(empMap['charlie@company.com']._id),
    );

    // Disputes
    const Dispute = mongoose.model('Dispute');
    await Dispute.deleteMany({});

    const charlieDispute = await Dispute.create({
      disputeId: 'DISP-CHARLIE-001',
      description: 'Missing bank account exception review',
      employeeId: empMap['charlie@company.com']._id,
      payslipId: charliePayslip._id,
      status: 'UNDER_REVIEW',
    });
    console.log('Created disputes');

    // Refunds
    const Refund = mongoose.model('Refund');
    await Refund.deleteMany({});

    await Refund.create({
      disputeId: charlieDispute._id,
      refundDetails: {
        description: 'Pending review for missing bank account exception',
      },
      amount: 0,
      employeeId: empMap['charlie@company.com']._id,
      financeStaffId: empMap['hannah@company.com']._id,
      status: 'PENDING',
    });
    console.log('Created refunds');

    // ========================================================================
    // SEED COMPLETE
    // ========================================================================
    console.log('\n========================================');
    console.log('PAYROLL EXECUTION SEED COMPLETE');
    console.log('========================================');
    console.log('\nTest Users (Password: 123456):');
    console.log('  - sarah.smith@company.com (PAYROLL_SPECIALIST)');
    console.log('  - michael.johnson@company.com (PAYROLL_MANAGER)');
    console.log('  - emily.williams@company.com (FINANCE_STAFF)');
    console.log('  - john.doe@company.com (DEPARTMENT_EMPLOYEE)');
    console.log('\nPayroll Run: PR-2025-001 (January 2025)');
    console.log('  - Employees: Lina, Eric, Charlie');
    console.log('  - Exceptions: 1 (Charlie - missing bank account)');
    console.log(`  - Total Net Pay: ${totalNetPay.toFixed(2)} EGP`);
    console.log('========================================\n');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Seed error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the seed
seedPayrollExecution();

module.exports = { seedPayrollExecution };
