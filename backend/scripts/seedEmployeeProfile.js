// seedEmployeeProfile.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
const employeeProfileSchema = new mongoose.Schema({
  workEmail: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  employeeNumber: { type: String, required: true, unique: true },
  nationalId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  primaryDepartment: String,
  primaryPosition: String,
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'TERMINATED'],
    default: 'ACTIVE',
  },
  contractType: {
    type: String,
    enum: ['FULL_TIME_CONTRACT', 'PART_TIME_CONTRACT', 'CONTRACTOR'],
    default: 'FULL_TIME_CONTRACT',
  },
  workType: {
    type: String,
    enum: ['FULL_TIME', 'PART_TIME', 'CONTRACTOR'],
    default: 'FULL_TIME',
  },
  gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
  maritalStatus: {
    type: String,
    enum: ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'],
  },
  bankName: String,
  bankAccountNumber: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const employeeSystemRoleSchema = new mongoose.Schema({
  workEmail: { type: String, required: true },
  roles: [
    {
      type: String,
      enum: [
        'SYSTEM_ADMIN',
        'HR_MANAGER',
        'HR_ADMIN',
        'HR_EMPLOYEE',
        'PAYROLL_MANAGER',
        'PAYROLL_SPECIALIST',
        'FINANCE_STAFF',
        'DEPARTMENT_HEAD',
        'DEPARTMENT_EMPLOYEE',
      ],
    },
  ],
  permissions: [String],
  createdAt: { type: Date, default: Date.now },
});

const employeeQualificationSchema = new mongoose.Schema({
  employeeEmail: { type: String, required: true },
  establishmentName: String,
  graduationType: {
    type: String,
    enum: ['HIGH_SCHOOL', 'BACHELOR', 'MASTER', 'PHD'],
  },
  createdAt: { type: Date, default: Date.now },
});

const employeeProfileChangeRequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
  employeeEmail: String,
  description: String,
  reason: String,
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  },
  createdAt: { type: Date, default: Date.now },
});

const EmployeeProfile = mongoose.model(
  'EmployeeProfile',
  employeeProfileSchema,
);
const EmployeeSystemRole = mongoose.model(
  'EmployeeSystemRole',
  employeeSystemRoleSchema,
);
const EmployeeQualification = mongoose.model(
  'EmployeeQualification',
  employeeQualificationSchema,
);
const EmployeeProfileChangeRequest = mongoose.model(
  'EmployeeProfileChangeRequest',
  employeeProfileChangeRequestSchema,
);

const seedEmployeeProfile = async () => {
  try {
    console.log('\n=== Starting Employee Profile Seed ===\n');

    await EmployeeProfile.deleteMany({});
    await EmployeeSystemRole.deleteMany({});
    await EmployeeQualification.deleteMany({});
    await EmployeeProfileChangeRequest.deleteMany({});

    const passwordHash = await bcrypt.hash('ChangeMe123', 10);
    const simplePasswordHash = await bcrypt.hash('123456', 10);

    // Core Employees
    const employees = [
      {
        workEmail: 'alice@company.com',
        firstName: 'Alice',
        lastName: 'Smith',
        employeeNumber: 'EMP-001',
        nationalId: 'NAT-ALICE-001',
        primaryDepartment: 'HR-001',
        primaryPosition: 'POS-HR-MGR',
        gender: 'FEMALE',
        maritalStatus: 'SINGLE',
        bankName: 'First National Bank',
        bankAccountNumber: 'FNB-001-2020',
        password: passwordHash,
      },
      {
        workEmail: 'bob@company.com',
        firstName: 'Bob',
        lastName: 'Jones',
        employeeNumber: 'EMP-002',
        nationalId: 'NAT-BOB-002',
        primaryDepartment: 'FIN-001',
        primaryPosition: 'POS-ACC',
        gender: 'MALE',
        maritalStatus: 'MARRIED',
        bankName: 'Metro CU',
        bankAccountNumber: 'MCU-002-2021',
        password: passwordHash,
      },
      {
        workEmail: 'charlie@company.com',
        firstName: 'Charlie',
        lastName: 'Brown',
        employeeNumber: 'EMP-003',
        nationalId: 'NAT-CHARLIE-003',
        primaryDepartment: 'SALES-001',
        primaryPosition: 'POS-SALES-REP',
        contractType: 'PART_TIME_CONTRACT',
        workType: 'PART_TIME',
        maritalStatus: 'SINGLE',
        password: passwordHash,
      },
      {
        workEmail: 'diana@company.com',
        firstName: 'Diana',
        lastName: 'Prince',
        employeeNumber: 'EMP-004',
        nationalId: 'NAT-DIANA-004',
        primaryDepartment: 'ENG-001',
        primaryPosition: 'POS-SENIOR-SWE',
        maritalStatus: 'DIVORCED',
        password: passwordHash,
      },
      {
        workEmail: 'eric@company.com',
        firstName: 'Eric',
        lastName: 'Stone',
        employeeNumber: 'EMP-005',
        nationalId: 'NAT-ERIC-005',
        primaryDepartment: 'ENG-001',
        primaryPosition: 'POS-SWE',
        maritalStatus: 'WIDOWED',
        password: passwordHash,
      },
      {
        workEmail: 'fatima@company.com',
        firstName: 'Fatima',
        lastName: 'Hassan',
        employeeNumber: 'EMP-006',
        nationalId: 'NAT-FATIMA-006',
        primaryDepartment: 'HR-001',
        primaryPosition: 'POS-HR-MGR',
        gender: 'FEMALE',
        maritalStatus: 'SINGLE',
        password: passwordHash,
      },
      {
        workEmail: 'george@company.com',
        firstName: 'George',
        lastName: 'Ibrahim',
        employeeNumber: 'EMP-007',
        nationalId: 'NAT-GEORGE-007',
        primaryDepartment: 'HR-001',
        primaryPosition: 'POS-HR-GEN',
        contractType: 'PART_TIME_CONTRACT',
        workType: 'PART_TIME',
        maritalStatus: 'MARRIED',
        password: passwordHash,
      },
      {
        workEmail: 'hannah@company.com',
        firstName: 'Hannah',
        lastName: 'Lee',
        employeeNumber: 'EMP-008',
        nationalId: 'NAT-HANNAH-008',
        primaryDepartment: 'FIN-001',
        primaryPosition: 'POS-ACC',
        contractType: 'PART_TIME_CONTRACT',
        workType: 'PART_TIME',
        gender: 'FEMALE',
        maritalStatus: 'SINGLE',
        password: passwordHash,
      },
      {
        workEmail: 'ian@company.com',
        firstName: 'Ian',
        lastName: 'Clark',
        employeeNumber: 'EMP-009',
        nationalId: 'NAT-IAN-009',
        primaryDepartment: 'HR-001',
        primaryPosition: 'POS-HR-GEN',
        maritalStatus: 'DIVORCED',
        password: passwordHash,
      },
      {
        workEmail: 'kevin@company.com',
        firstName: 'Kevin',
        lastName: 'Adams',
        employeeNumber: 'EMP-010',
        nationalId: 'NAT-KEVIN-010',
        primaryDepartment: 'HR-001',
        primaryPosition: 'POS-HR-GEN',
        maritalStatus: 'MARRIED',
        password: passwordHash,
      },
      {
        workEmail: 'lina@company.com',
        firstName: 'Lina',
        lastName: 'Park',
        employeeNumber: 'EMP-011',
        nationalId: 'NAT-LINA-011',
        primaryDepartment: 'ENG-001',
        primaryPosition: 'POS-QA-ENG',
        gender: 'FEMALE',
        maritalStatus: 'SINGLE',
        password: passwordHash,
      },
      {
        workEmail: 'paula@company.com',
        firstName: 'Paula',
        lastName: 'Payne',
        employeeNumber: 'EMP-012',
        nationalId: 'NAT-PAULA-012',
        primaryDepartment: 'FIN-001',
        primaryPosition: 'POS-ACC',
        gender: 'FEMALE',
        maritalStatus: 'SINGLE',
        password: passwordHash,
      },
      {
        workEmail: 'rami@company.com',
        firstName: 'Rami',
        lastName: 'Reed',
        employeeNumber: 'EMP-013',
        nationalId: 'NAT-RAMI-013',
        primaryDepartment: 'HR-001',
        primaryPosition: 'POS-HR-GEN',
        maritalStatus: 'SINGLE',
        password: passwordHash,
      },
      {
        workEmail: 'sarah.senior.swe@company.com',
        firstName: 'Sarah',
        lastName: 'Nguyen',
        employeeNumber: 'EMP-014',
        nationalId: 'NAT-SARAH-014',
        primaryDepartment: 'ENG-001',
        primaryPosition: 'POS-SENIOR-SWE',
        gender: 'FEMALE',
        maritalStatus: 'SINGLE',
        password: passwordHash,
      },
      {
        workEmail: 'samir.sales.lead@company.com',
        firstName: 'Samir',
        lastName: 'Saleh',
        employeeNumber: 'EMP-015',
        nationalId: 'NAT-SAMIR-015',
        primaryDepartment: 'SALES-001',
        primaryPosition: 'POS-SALES-LEAD',
        maritalStatus: 'MARRIED',
        password: passwordHash,
      },
      {
        workEmail: 'tariq.ta@company.com',
        firstName: 'Tariq',
        lastName: 'Adel',
        employeeNumber: 'EMP-016',
        nationalId: 'NAT-TARIQ-016',
        primaryDepartment: 'LND-001',
        primaryPosition: 'POS-TA',
        maritalStatus: 'SINGLE',
        password: passwordHash,
      },
      {
        workEmail: 'laila.la@company.com',
        firstName: 'Laila',
        lastName: 'Abbas',
        employeeNumber: 'EMP-017',
        nationalId: 'NAT-LAILA-017',
        primaryDepartment: 'LND-001',
        primaryPosition: 'POS-LA',
        gender: 'FEMALE',
        maritalStatus: 'SINGLE',
        password: passwordHash,
      },
      {
        workEmail: 'amir.accountant@company.com',
        firstName: 'Amir',
        lastName: 'Nabil',
        employeeNumber: 'EMP-018',
        nationalId: 'NAT-AMIR-018',
        primaryDepartment: 'FIN-001',
        primaryPosition: 'POS-ACC',
        maritalStatus: 'MARRIED',
        password: passwordHash,
      },
      {
        workEmail: 'salma.librarian@company.com',
        firstName: 'Salma',
        lastName: 'Khaled',
        employeeNumber: 'EMP-019',
        nationalId: 'NAT-SALMA-019',
        primaryDepartment: 'LIB-001',
        primaryPosition: 'POS-LIB',
        gender: 'FEMALE',
        maritalStatus: 'SINGLE',
        password: passwordHash,
      },
      {
        workEmail: 'tess.headley@company.com',
        firstName: 'Tess',
        lastName: 'Headley',
        employeeNumber: 'EMP-TEST-020',
        nationalId: 'NAT-TEST-HEAD-020',
        primaryDepartment: 'TEST-001',
        primaryPosition: 'POS-TEST-HEAD',
        gender: 'FEMALE',
        maritalStatus: 'SINGLE',
        password: passwordHash,
      },
      {
        workEmail: 'evan.tester@company.com',
        firstName: 'Evan',
        lastName: 'Tester',
        employeeNumber: 'EMP-TEST-021',
        nationalId: 'NAT-TEST-EMP-021',
        primaryDepartment: 'TEST-001',
        primaryPosition: 'POS-TEST-EMP',
        maritalStatus: 'SINGLE',
        password: passwordHash,
      },

      // Additional Payroll Users
      {
        workEmail: 'sarah.smith@company.com',
        firstName: 'Sarah',
        lastName: 'Smith',
        employeeNumber: 'EMP-022',
        nationalId: 'NAT-SARAH-SMITH-022',
        primaryDepartment: 'FIN-001',
        primaryPosition: 'POS-ACC',
        gender: 'FEMALE',
        maritalStatus: 'SINGLE',
        password: simplePasswordHash,
      },
      {
        workEmail: 'michael.johnson@company.com',
        firstName: 'Michael',
        lastName: 'Johnson',
        employeeNumber: 'EMP-023',
        nationalId: 'NAT-MICHAEL-023',
        primaryDepartment: 'FIN-001',
        primaryPosition: 'POS-ACC',
        gender: 'MALE',
        maritalStatus: 'MARRIED',
        password: simplePasswordHash,
      },
      {
        workEmail: 'emily.williams@company.com',
        firstName: 'Emily',
        lastName: 'Williams',
        employeeNumber: 'EMP-024',
        nationalId: 'NAT-EMILY-024',
        primaryDepartment: 'FIN-001',
        primaryPosition: 'POS-ACC',
        gender: 'FEMALE',
        maritalStatus: 'SINGLE',
        password: simplePasswordHash,
      },

      // Coverage and Head employees
      {
        workEmail: 'inactive.ops-001-inactive@company.com',
        firstName: 'Inactive',
        lastName: 'Operations',
        employeeNumber: 'EMP-INACTIVE-OPS-001-INACTIVE',
        nationalId: 'NAT-INACTIVE-OPS-001-INACTIVE',
        primaryDepartment: 'OPS-001-INACTIVE',
        primaryPosition: 'POS-OPS-INACTIVE',
        password: passwordHash,
      },
      {
        workEmail: 'head.eng-001@company.com',
        firstName: 'Head',
        lastName: 'Engineering',
        employeeNumber: 'EMP-HEAD-ENG-001',
        nationalId: 'NAT-HEAD-ENG-001',
        primaryDepartment: 'ENG-001',
        primaryPosition: 'POS-ENG-001-HEAD',
        password: passwordHash,
      },
      {
        workEmail: 'head.sales-001@company.com',
        firstName: 'Head',
        lastName: 'Sales',
        employeeNumber: 'EMP-HEAD-SALES-001',
        nationalId: 'NAT-HEAD-SALES-001',
        primaryDepartment: 'SALES-001',
        primaryPosition: 'POS-SALES-001-HEAD',
        password: passwordHash,
      },
      {
        workEmail: 'head.lnd-001@company.com',
        firstName: 'Head',
        lastName: 'Learning and Development',
        employeeNumber: 'EMP-HEAD-LND-001',
        nationalId: 'NAT-HEAD-LND-001',
        primaryDepartment: 'LND-001',
        primaryPosition: 'POS-LND-001-HEAD',
        password: passwordHash,
      },
      {
        workEmail: 'head.fin-001@company.com',
        firstName: 'Head',
        lastName: 'Finance',
        employeeNumber: 'EMP-HEAD-FIN-001',
        nationalId: 'NAT-HEAD-FIN-001',
        primaryDepartment: 'FIN-001',
        primaryPosition: 'POS-FIN-001-HEAD',
        password: passwordHash,
      },
      {
        workEmail: 'head.lib-001@company.com',
        firstName: 'Head',
        lastName: 'Library Services',
        employeeNumber: 'EMP-HEAD-LIB-001',
        nationalId: 'NAT-HEAD-LIB-001',
        primaryDepartment: 'LIB-001',
        primaryPosition: 'POS-LIB-001-HEAD',
        password: passwordHash,
      },
      {
        workEmail: 'head.ops-001-inactive@company.com',
        firstName: 'Head',
        lastName: 'Operations (Inactive)',
        employeeNumber: 'EMP-HEAD-OPS-001-INACTIVE',
        nationalId: 'NAT-HEAD-OPS-001-INACTIVE',
        primaryDepartment: 'OPS-001-INACTIVE',
        primaryPosition: 'POS-OPS-001-INACTIVE-HEAD',
        password: passwordHash,
      },
      {
        workEmail: 'head.hr-001@company.com',
        firstName: 'Head',
        lastName: 'Human Resources',
        employeeNumber: 'EMP-HEAD-HR-001',
        nationalId: 'NAT-HEAD-HR-001',
        primaryDepartment: 'HR-001',
        primaryPosition: 'POS-HR-MGR',
        password: passwordHash,
      },
    ];

    await EmployeeProfile.insertMany(employees);
    console.log(`✓ Created ${employees.length} employee profiles`);

    // Employee System Roles
    const roles = [
      {
        workEmail: 'alice@company.com',
        roles: ['HR_MANAGER'],
        permissions: ['org.manage', 'hr.manage'],
      },
      {
        workEmail: 'bob@company.com',
        roles: ['PAYROLL_SPECIALIST'],
        permissions: ['payroll.process'],
      },
      {
        workEmail: 'charlie@company.com',
        roles: ['DEPARTMENT_EMPLOYEE'],
        permissions: [],
      },
      {
        workEmail: 'diana@company.com',
        roles: ['DEPARTMENT_EMPLOYEE'],
        permissions: ['org.read'],
      },
      {
        workEmail: 'eric@company.com',
        roles: ['HR_EMPLOYEE'],
        permissions: ['hr.view'],
      },
      {
        workEmail: 'fatima@company.com',
        roles: ['SYSTEM_ADMIN'],
        permissions: ['system.admin'],
      },
      {
        workEmail: 'george@company.com',
        roles: ['HR_EMPLOYEE'],
        permissions: ['hr.view'],
      },
      {
        workEmail: 'hannah@company.com',
        roles: ['FINANCE_STAFF'],
        permissions: ['finance.view'],
      },
      {
        workEmail: 'ian@company.com',
        roles: ['HR_ADMIN'],
        permissions: ['hr.manage'],
      },
      {
        workEmail: 'kevin@company.com',
        roles: ['DEPARTMENT_EMPLOYEE'],
        permissions: [],
      },
      {
        workEmail: 'lina@company.com',
        roles: ['DEPARTMENT_EMPLOYEE'],
        permissions: [],
      },
      {
        workEmail: 'paula@company.com',
        roles: ['FINANCE_STAFF'],
        permissions: ['finance.view'],
      },
      {
        workEmail: 'rami@company.com',
        roles: ['HR_ADMIN'],
        permissions: ['hr.manage'],
      },
      {
        workEmail: 'sarah.senior.swe@company.com',
        roles: ['DEPARTMENT_EMPLOYEE'],
        permissions: ['org.read'],
      },
      {
        workEmail: 'samir.sales.lead@company.com',
        roles: ['DEPARTMENT_EMPLOYEE'],
        permissions: ['org.read'],
      },
      {
        workEmail: 'tariq.ta@company.com',
        roles: ['DEPARTMENT_EMPLOYEE'],
        permissions: ['org.read'],
      },
      {
        workEmail: 'laila.la@company.com',
        roles: ['DEPARTMENT_EMPLOYEE'],
        permissions: ['org.read'],
      },
      {
        workEmail: 'amir.accountant@company.com',
        roles: ['DEPARTMENT_EMPLOYEE'],
        permissions: ['finance.view'],
      },
      {
        workEmail: 'salma.librarian@company.com',
        roles: ['DEPARTMENT_EMPLOYEE'],
        permissions: ['org.read'],
      },
      {
        workEmail: 'evan.tester@company.com',
        roles: ['DEPARTMENT_EMPLOYEE'],
        permissions: ['org.read'],
      },

      // Additional Payroll Users Roles
      {
        workEmail: 'sarah.smith@company.com',
        roles: ['PAYROLL_SPECIALIST'],
        permissions: ['payroll.process'],
      },
      {
        workEmail: 'michael.johnson@company.com',
        roles: ['PAYROLL_MANAGER'],
        permissions: ['payroll.manage', 'payroll.process'],
      },
      {
        workEmail: 'emily.williams@company.com',
        roles: ['FINANCE_STAFF'],
        permissions: ['finance.view', 'finance.manage'],
      },

      // Department Heads
      {
        workEmail: 'head.eng-001@company.com',
        roles: ['DEPARTMENT_HEAD'],
        permissions: ['org.manage.department'],
      },
      {
        workEmail: 'head.sales-001@company.com',
        roles: ['DEPARTMENT_HEAD'],
        permissions: ['org.manage.department'],
      },
      {
        workEmail: 'head.lnd-001@company.com',
        roles: ['DEPARTMENT_HEAD'],
        permissions: ['org.manage.department'],
      },
      {
        workEmail: 'head.fin-001@company.com',
        roles: ['DEPARTMENT_HEAD'],
        permissions: ['org.manage.department'],
      },
      {
        workEmail: 'head.lib-001@company.com',
        roles: ['DEPARTMENT_HEAD'],
        permissions: ['org.manage.department'],
      },
      {
        workEmail: 'head.ops-001-inactive@company.com',
        roles: ['DEPARTMENT_HEAD'],
        permissions: ['org.manage.department'],
      },
      {
        workEmail: 'head.hr-001@company.com',
        roles: ['DEPARTMENT_HEAD'],
        permissions: ['org.manage.department'],
      },
      {
        workEmail: 'inactive.ops-001-inactive@company.com',
        roles: ['DEPARTMENT_EMPLOYEE'],
        permissions: ['org.read'],
      },
    ];

    await EmployeeSystemRole.insertMany(roles);
    console.log(`✓ Created ${roles.length} employee system roles`);

    // Qualifications
    const qualifications = [
      {
        employeeEmail: 'alice@company.com',
        establishmentName: 'Cairo University',
        graduationType: 'MASTER',
      },
      {
        employeeEmail: 'bob@company.com',
        establishmentName: 'AUC',
        graduationType: 'BACHELOR',
      },
    ];

    await EmployeeQualification.insertMany(qualifications);
    console.log(`✓ Created ${qualifications.length} qualifications`);

    // Change Request
    await EmployeeProfileChangeRequest.create({
      requestId: 'REQ-EP-001',
      employeeEmail: 'charlie@company.com',
      description: 'Update work email to charlie.sales@company.com',
      reason: 'Team branding alignment',
      status: 'PENDING',
    });
    console.log('✓ Created employee profile change request');

    console.log('\n=== Employee Profile Seed Complete ===\n');
  } catch (error) {
    console.error('✗ Seed Error:', error);
    throw error;
  }
};

const run = async () => {
  await connectDB();
  await seedEmployeeProfile();
  await mongoose.connection.close();
  console.log('✓ Database connection closed');
  process.exit(0);
};

run();
