// scripts/combined-seed.js
// Complete seed script combining HR data and authentication
// Run with: node scripts/combined-seed.js
// Creates full HR system data + 4 authenticated users with roles + HR events (new hires, resignations, terminations)

import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'HR';

// ============================================
// UTILITY FUNCTIONS
// ============================================

const randomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const randomElement = (array) =>
  array[Math.floor(Math.random() * array.length)];

const randomDate = (start, end) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

function generateEmployeeNumber(index) {
  return `EMP-${String(index + 1).padStart(4, '0')}`;
}

// ============================================
// REFERENCE DATA
// ============================================

const EGYPTIAN_DATA = {
  cities: [
    'Cairo',
    'Alexandria',
    'Giza',
    'Port Said',
    'Suez',
    'Luxor',
    'Aswan',
    'Mansoura',
    'Tanta',
    'Asyut',
  ],
  streets: [
    'Tahrir Street',
    'Ramses Street',
    'Salah Salem Street',
    'El Nasr Road',
    'El Haram Street',
    'Corniche El Nile',
    'Maadi Ring Road',
    'October 6th Street',
  ],
  banks: [
    'National Bank of Egypt',
    'Banque Misr',
    'Commercial International Bank',
    'Arab African International Bank',
    'Banque du Caire',
    'QNB Alahli',
    'HSBC Egypt',
  ],
  firstNames: {
    male: [
      'Ahmed',
      'Mohamed',
      'Mahmoud',
      'Ali',
      'Hassan',
      'Youssef',
      'Khaled',
      'Omar',
      'Ibrahim',
      'Amr',
      'Tarek',
    ],
    female: [
      'Fatima',
      'Nour',
      'Maryam',
      'Layla',
      'Yasmin',
      'Sara',
      'Hana',
      'Amira',
      'Dina',
      'Salma',
    ],
  },
  lastNames: [
    'Hassan',
    'Mohamed',
    'Ali',
    'Ibrahim',
    'Khalil',
    'Mahmoud',
    'Farouk',
    'Salem',
    'El-Sayed',
    'Mostafa',
  ],
};

const DEPARTMENTS = [
  { name: 'Engineering', code: 'ENG' },
  { name: 'Human Resources', code: 'HR' },
  { name: 'Finance', code: 'FIN' },
  { name: 'Marketing', code: 'MKT' },
  { name: 'Sales', code: 'SAL' },
  { name: 'Operations', code: 'OPS' },
];

const POSITIONS = [
  {
    name: 'Junior Software Engineer',
    code: 'JSE',
    level: 'Junior',
    department: 'Engineering',
  },
  {
    name: 'Software Engineer',
    code: 'SE',
    level: 'Mid',
    department: 'Engineering',
  },
  {
    name: 'Senior Software Engineer',
    code: 'SSE',
    level: 'Senior',
    department: 'Engineering',
  },
  {
    name: 'Lead Engineer',
    code: 'LE',
    level: 'Lead',
    department: 'Engineering',
  },
  {
    name: 'HR Specialist',
    code: 'HRS',
    level: 'Mid',
    department: 'Human Resources',
  },
  {
    name: 'HR Manager',
    code: 'HRM',
    level: 'Senior',
    department: 'Human Resources',
  },
  {
    name: 'Financial Analyst',
    code: 'FA',
    level: 'Mid',
    department: 'Finance',
  },
  {
    name: 'Finance Manager',
    code: 'FM',
    level: 'Senior',
    department: 'Finance',
  },
  {
    name: 'Marketing Coordinator',
    code: 'MC',
    level: 'Junior',
    department: 'Marketing',
  },
  {
    name: 'Marketing Manager',
    code: 'MM',
    level: 'Senior',
    department: 'Marketing',
  },
];

const PAY_GRADES = [
  { grade: 'Junior Level (L1)', baseSalary: 8000 },
  { grade: 'Mid Level (L2)', baseSalary: 12000 },
  { grade: 'Senior Level (L3)', baseSalary: 18000 },
  { grade: 'Lead Level (L4)', baseSalary: 25000 },
  { grade: 'Manager Level (L5)', baseSalary: 35000 },
];

// AUTH USERS - These will be added as the first 4 employees
const AUTH_USERS = [
  {
    firstName: 'Sarah',
    lastName: 'Smith',
    nationalId: '2345678901234',
    workEmail: 'sarah.smith@company.com',
    personalEmail: 'sarah.smith.personal@gmail.com',
    password: '123456',
    role: 'PAYROLL_SPECIALIST',
    description: 'Payroll Specialist',
  },
  {
    firstName: 'Michael',
    lastName: 'Johnson',
    nationalId: '3456789012345',
    workEmail: 'michael.johnson@company.com',
    personalEmail: 'michael.johnson.personal@gmail.com',
    password: '123456',
    role: 'PAYROLL_MANAGER',
    description: 'Payroll Manager',
  },
  {
    firstName: 'Emily',
    lastName: 'Williams',
    nationalId: '4567890123456',
    workEmail: 'emily.williams@company.com',
    personalEmail: 'emily.williams.personal@gmail.com',
    password: '123456',
    role: 'FINANCE_STAFF',
    description: 'Finance Staff',
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    nationalId: '1234567890123',
    workEmail: 'john.doe@company.com',
    personalEmail: 'john.doe.personal@gmail.com',
    password: '123456',
    role: 'DEPARTMENT_EMPLOYEE',
    description: 'Department Employee',
  },
];

// ============================================
// EMPLOYEE GENERATOR
// ============================================

function generateEmployee(index, options = {}) {
  const {
    payGradeIds = [],
    departmentIds = [],
    positionIds = [],
    hasBankDetails = true,
    isAuthUser = false,
    authUserData = null,
    hrEventType = 'NORMAL', // NEW: HR Event Type
    hireDate = null,
    terminationDate = null,
    resignationDate = null,
    terminationType = null,
  } = options;

  // If it's an auth user, use their data
  if (isAuthUser && authUserData) {
    const city = randomElement(EGYPTIAN_DATA.cities);
    return {
      employeeNumber: generateEmployeeNumber(index),
      nationalId: authUserData.nationalId,
      firstName: authUserData.firstName,
      lastName: authUserData.lastName,
      fullName: `${authUserData.firstName} ${authUserData.lastName}`,
      personalEmail: authUserData.personalEmail,
      workEmail: authUserData.workEmail,
      password: authUserData.hashedPassword,
      mobilePhone: `+2010${randomNumber(10000000, 99999999)}`,
      homePhone: `+202${randomNumber(20000000, 29999999)}`,
      address: {
        city,
        streetAddress: `${randomNumber(1, 999)} ${randomElement(EGYPTIAN_DATA.streets)}`,
        country: 'Egypt',
      },
      dateOfBirth: new Date(1985, 0, 1),
      gender: randomElement(['MALE', 'FEMALE']),
      maritalStatus: randomElement(['SINGLE', 'MARRIED']),
      dateOfHire: hireDate || new Date('2024-01-01'),
      hireDate: hireDate || new Date('2024-01-01'),
      contractStartDate: new Date('2024-01-01'),
      contractType: 'FULL_TIME_CONTRACT',
      workType: 'FULL_TIME',
      status: 'ACTIVE',
      statusEffectiveFrom: new Date(),
      bankName: randomElement(EGYPTIAN_DATA.banks),
      bankAccountNumber: String(randomNumber(1000000000000, 9999999999999)),
      payGradeId: payGradeIds.length > 0 ? randomElement(payGradeIds) : null,
      primaryDepartmentId:
        departmentIds.length > 0 ? randomElement(departmentIds) : null,
      primaryPositionId:
        positionIds.length > 0 ? randomElement(positionIds) : null,
      biography: `${authUserData.firstName} ${authUserData.lastName} - ${authUserData.description}`,
      profilePictureUrl: `https://i.pravatar.cc/150?u=${authUserData.nationalId}`,
      hrEventType,
      terminationDate,
      resignationDate,
      terminationType,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Regular employee generation
  const isMale = index % 2 === 0;
  const firstName = randomElement(
    isMale ? EGYPTIAN_DATA.firstNames.male : EGYPTIAN_DATA.firstNames.female,
  );
  const lastName = randomElement(EGYPTIAN_DATA.lastNames);
  const fullName = `${firstName} ${lastName}`;

  const birthYear = randomNumber(85, 99);
  const nationalId = `2${birthYear}${String(randomNumber(1, 12)).padStart(2, '0')}${String(randomNumber(1, 28)).padStart(2, '0')}${randomNumber(10000, 99999)}`;

  const city = randomElement(EGYPTIAN_DATA.cities);

  return {
    employeeNumber: generateEmployeeNumber(index),
    nationalId,
    firstName,
    lastName,
    fullName,
    personalEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
    workEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
    mobilePhone: `+2010${randomNumber(10000000, 99999999)}`,
    homePhone: `+202${randomNumber(20000000, 29999999)}`,
    address: {
      city,
      streetAddress: `${randomNumber(1, 999)} ${randomElement(EGYPTIAN_DATA.streets)}`,
      country: 'Egypt',
    },
    dateOfBirth: new Date(1985 + (index % 15), index % 12, (index % 28) + 1),
    gender: isMale ? 'MALE' : 'FEMALE',
    maritalStatus: randomElement(['SINGLE', 'MARRIED', 'DIVORCED']),
    dateOfHire:
      hireDate || randomDate(new Date('2018-01-01'), new Date('2023-12-31')),
    hireDate:
      hireDate || randomDate(new Date('2018-01-01'), new Date('2023-12-31')),
    contractStartDate: randomDate(
      new Date('2018-01-01'),
      new Date('2023-12-31'),
    ),
    contractType: randomElement(['FULL_TIME_CONTRACT', 'PART_TIME_CONTRACT']),
    workType: randomElement(['FULL_TIME', 'PART_TIME']),
    status: 'ACTIVE',
    statusEffectiveFrom: new Date(),
    ...(hasBankDetails
      ? {
          bankName: randomElement(EGYPTIAN_DATA.banks),
          bankAccountNumber: String(randomNumber(1000000000000, 9999999999999)),
        }
      : {
          bankName: null,
          bankAccountNumber: null,
        }),
    payGradeId: payGradeIds.length > 0 ? randomElement(payGradeIds) : null,
    primaryDepartmentId:
      departmentIds.length > 0 ? randomElement(departmentIds) : null,
    primaryPositionId:
      positionIds.length > 0 ? randomElement(positionIds) : null,
    biography: `${fullName} is a dedicated professional with expertise in their field.`,
    profilePictureUrl: `https://i.pravatar.cc/150?u=${nationalId}`,
    hrEventType,
    terminationDate,
    resignationDate,
    terminationType,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ============================================
// MAIN FUNCTION
// ============================================

async function main() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    console.log(`📦 Database: ${DATABASE_NAME}\n`);
    console.log('═══════════════════════════════════════════════════════\n');

    const db = client.db(DATABASE_NAME);
    const now = new Date();
    const payrollPeriod = new Date(2024, 11, 31); // December 31, 2024

    // ============================================
    // CLEANUP
    // ============================================
    console.log('🧹 Cleaning database...');
    const collections = await db.listCollections().toArray();
    for (const col of collections) {
      await db.collection(col.name).drop();
    }
    console.log('   ✅ All collections dropped\n');

    // ============================================
    // 1. DEPARTMENTS
    // ============================================
    console.log('🏢 Creating departments...');
    const deptResult = await db.collection('departments').insertMany(
      DEPARTMENTS.map((d) => ({
        name: d.name,
        code: d.code,
        description: `${d.name} Department`,
        active: true,
        startDate: now,
        endDate: null,
        createdAt: now,
        updatedAt: now,
      })),
    );
    const departmentIds = Object.values(deptResult.insertedIds);
    console.log(`   ✅ ${departmentIds.length} departments\n`);

    // ============================================
    // 2. POSITIONS
    // ============================================
    console.log('💼 Creating positions...');
    const positionDocs = POSITIONS.map((pos) => {
      const dept = DEPARTMENTS.find((d) => d.name === pos.department);
      const deptId = departmentIds[DEPARTMENTS.indexOf(dept)];
      return {
        name: pos.name,
        code: pos.code,
        description: `${pos.name} position in ${pos.department}`,
        departmentId: deptId,
        active: true,
        startDate: now,
        endDate: null,
        createdAt: now,
        updatedAt: now,
      };
    });
    const posResult = await db.collection('positions').insertMany(positionDocs);
    const positionIds = Object.values(posResult.insertedIds);
    console.log(`   ✅ ${positionIds.length} positions\n`);

    // ============================================
    // 3. ALLOWANCES
    // ============================================
    console.log('💰 Creating allowances...');
    const allowanceResult = await db.collection('allowance').insertMany([
      {
        name: 'Housing Allowance',
        amount: 2000,
        status: 'approved',
        approvedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Transport Allowance',
        amount: 1000,
        status: 'approved',
        approvedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Food Allowance',
        amount: 800,
        status: 'approved',
        approvedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Communication Allowance',
        amount: 500,
        status: 'approved',
        approvedAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ]);
    const allowanceIds = Object.values(allowanceResult.insertedIds);
    console.log(`   ✅ ${allowanceIds.length} allowances\n`);

    // ============================================
    // 4. PAY GRADES
    // ============================================
    console.log('💵 Creating pay grades...');
    const payGradeResult = await db.collection('paygrade').insertMany(
      PAY_GRADES.map((pg) => ({
        grade: pg.grade,
        baseSalary: pg.baseSalary,
        grossSalary: pg.baseSalary + 3800,
        status: 'approved',
        allowances: allowanceIds,
        approvedAt: now,
        createdAt: now,
        updatedAt: now,
      })),
    );
    const payGradeIds = Object.values(payGradeResult.insertedIds);
    console.log(`   ✅ ${payGradeIds.length} pay grades\n`);

    // ============================================
    // 5. SIGNING BONUSES
    // ============================================
    console.log('🎁 Creating signing bonuses...');
    const bonuses = await db.collection('signingbonus').insertMany([
      {
        positionName: 'Junior Software Engineer',
        amount: 5000,
        status: 'approved',
        approvedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        positionName: 'Software Engineer',
        amount: 8000,
        status: 'approved',
        approvedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        positionName: 'Senior Software Engineer',
        amount: 12000,
        status: 'approved',
        approvedAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ]);
    const bonusIds = Object.values(bonuses.insertedIds);
    console.log(`   ✅ ${bonuses.insertedCount} signing bonuses\n`);

    // ============================================
    // 6. TERMINATION & RESIGNATION BENEFITS
    // ============================================
    console.log('🎁 Creating termination/resignation benefits...');
    const benefitTemplates = await db
      .collection('terminationAndResignationBenefits')
      .insertMany([
        {
          benefitType: 'TERMINATION',
          name: 'Termination Severance Package',
          amount: 15000,
          description: 'Standard severance for terminated employees',
          status: 'approved',
          approvedAt: now,
          createdAt: now,
          updatedAt: now,
        },
        {
          benefitType: 'RESIGNATION',
          name: 'Resignation End-of-Service Benefit',
          amount: 8000,
          description: 'End-of-service benefit for resigned employees',
          status: 'approved',
          approvedAt: now,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    const benefitTemplateIds = Object.values(benefitTemplates.insertedIds);
    console.log(`   ✅ ${benefitTemplates.insertedCount} benefit templates\n`);

    // ============================================
    // 6. EMPLOYEES (Auth users + Regular + New Hires + Terminations + Resignations)
    // ============================================
    console.log('👥 Creating employees...\n');

    const employees = [];
    const employeeSigningBonuses = [];
    const employeeTerminationBenefits = [];
    const TOTAL_EMPLOYEES = 30; // Increased to 30
    const WITHOUT_BANK = 3;
    const NEW_HIRES = 3; // Employees hired in December 2024
    const RESIGNATIONS = 2; // Employees who resigned
    const TERMINATIONS = 2; // Employees who were terminated

    // First 4 employees are AUTH USERS with passwords
    console.log('   🔐 Creating authenticated users:');
    for (let i = 0; i < AUTH_USERS.length; i++) {
      const hashedPassword = await hashPassword(AUTH_USERS[i].password);
      const employee = generateEmployee(i, {
        payGradeIds,
        departmentIds,
        positionIds,
        isAuthUser: true,
        authUserData: {
          ...AUTH_USERS[i],
          hashedPassword,
        },
        hrEventType: 'NORMAL',
      });
      employees.push(employee);
      console.log(
        `      ${i + 1}. ${employee.firstName} ${employee.lastName} - ${AUTH_USERS[i].description} (${employee.workEmail})`,
      );
    }

    // NEW HIRES (hired in December 2024)
    console.log(
      '\n   🆕 Creating NEW HIRE employees (hired in December 2024):',
    );
    for (let i = AUTH_USERS.length; i < AUTH_USERS.length + NEW_HIRES; i++) {
      const hireDate = new Date(2024, 11, randomNumber(1, 15)); // December 1-15, 2024
      const employee = generateEmployee(i, {
        payGradeIds,
        departmentIds,
        positionIds,
        hasBankDetails: true,
        hrEventType: 'NEW_HIRE',
        hireDate,
      });
      employees.push(employee);
      console.log(
        `      ${i + 1}. ${employee.firstName.padEnd(8)} ${employee.lastName.padEnd(10)} | 🆕 NEW HIRE | Hired: ${hireDate.toLocaleDateString()}`,
      );
    }

    // RESIGNATIONS
    console.log('\n   👋 Creating RESIGNATION employees:');
    for (
      let i = AUTH_USERS.length + NEW_HIRES;
      i < AUTH_USERS.length + NEW_HIRES + RESIGNATIONS;
      i++
    ) {
      const resignationDate = new Date(2024, 11, randomNumber(20, 28)); // December 20-28, 2024
      const employee = generateEmployee(i, {
        payGradeIds,
        departmentIds,
        positionIds,
        hasBankDetails: true,
        hrEventType: 'RESIGNATION',
        resignationDate,
        terminationType: 'RESIGNATION',
      });
      employees.push(employee);
      console.log(
        `      ${i + 1}. ${employee.firstName.padEnd(8)} ${employee.lastName.padEnd(10)} | 👋 RESIGNATION | Date: ${resignationDate.toLocaleDateString()}`,
      );
    }

    // TERMINATIONS
    console.log('\n   ❌ Creating TERMINATION employees:');
    for (
      let i = AUTH_USERS.length + NEW_HIRES + RESIGNATIONS;
      i < AUTH_USERS.length + NEW_HIRES + RESIGNATIONS + TERMINATIONS;
      i++
    ) {
      const terminationDate = new Date(2024, 11, randomNumber(15, 25)); // December 15-25, 2024
      const employee = generateEmployee(i, {
        payGradeIds,
        departmentIds,
        positionIds,
        hasBankDetails: true,
        hrEventType: 'TERMINATION',
        terminationDate,
        terminationType: 'TERMINATION',
      });
      employees.push(employee);
      console.log(
        `      ${i + 1}. ${employee.firstName.padEnd(8)} ${employee.lastName.padEnd(10)} | ❌ TERMINATION | Date: ${terminationDate.toLocaleDateString()}`,
      );
    }

    // REGULAR EMPLOYEES
    console.log('\n   👤 Creating regular employees:');
    for (
      let i = AUTH_USERS.length + NEW_HIRES + RESIGNATIONS + TERMINATIONS;
      i < TOTAL_EMPLOYEES;
      i++
    ) {
      const hasBankDetails = i < TOTAL_EMPLOYEES - WITHOUT_BANK;
      const employee = generateEmployee(i, {
        payGradeIds,
        departmentIds,
        positionIds,
        hasBankDetails,
        hrEventType: 'NORMAL',
      });
      employees.push(employee);

      const bank = hasBankDetails ? '✅' : '❌ NO BANK';
      console.log(
        `      ${String(i + 1).padStart(2)}. ${employee.firstName.padEnd(8)} ${employee.lastName.padEnd(10)} | ${bank}`,
      );
    }

    const empResult = await db
      .collection('employee_profiles')
      .insertMany(employees);
    const employeeIds = Object.values(empResult.insertedIds);

    console.log(`\n   ✅ ${employeeIds.length} employees created`);
    console.log(`      • ${AUTH_USERS.length} authenticated users`);
    console.log(`      • ${NEW_HIRES} new hires (December 2024)`);
    console.log(`      • ${RESIGNATIONS} resignations`);
    console.log(`      • ${TERMINATIONS} terminations`);
    console.log(
      `      • ${employees.filter((e) => e.bankName).length} with bank details`,
    );
    console.log(
      `      • ${employees.filter((e) => !e.bankName).length} without bank details\n`,
    );

    // ============================================
    // 7. EMPLOYEE SIGNING BONUSES (for new hires)
    // ============================================
    console.log('🎁 Creating employee signing bonuses for new hires...');
    for (let i = AUTH_USERS.length; i < AUTH_USERS.length + NEW_HIRES; i++) {
      const bonusAmount = randomNumber(5000, 12000);
      employeeSigningBonuses.push({
        employeeId: employeeIds[i],
        signingBonusId: randomElement(bonusIds),
        givenAmount: bonusAmount,
        status: 'APPROVED', // Already approved for payroll processing
        paymentDate: employees[i].hireDate,
        approvedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }
    if (employeeSigningBonuses.length > 0) {
      await db
        .collection('employeesigningbonus')
        .insertMany(employeeSigningBonuses);
      console.log(
        `   ✅ ${employeeSigningBonuses.length} signing bonuses created\n`,
      );
    }

    // ============================================
    // 8. EMPLOYEE TERMINATION/RESIGNATION BENEFITS
    // ============================================
    console.log('💼 Creating termination/resignation benefits...');

    // Resignations
    for (
      let i = AUTH_USERS.length + NEW_HIRES;
      i < AUTH_USERS.length + NEW_HIRES + RESIGNATIONS;
      i++
    ) {
      const benefitAmount = randomNumber(7000, 10000);
      employeeTerminationBenefits.push({
        employeeId: employeeIds[i],
        benefitId: benefitTemplateIds[1], // Resignation benefit
        benefitType: 'RESIGNATION',
        givenAmount: benefitAmount,
        status: 'APPROVED',
        paymentDate: employees[i].resignationDate,
        approvedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Terminations
    for (
      let i = AUTH_USERS.length + NEW_HIRES + RESIGNATIONS;
      i < AUTH_USERS.length + NEW_HIRES + RESIGNATIONS + TERMINATIONS;
      i++
    ) {
      const benefitAmount = randomNumber(12000, 18000);
      employeeTerminationBenefits.push({
        employeeId: employeeIds[i],
        benefitId: benefitTemplateIds[0], // Termination benefit
        benefitType: 'TERMINATION',
        givenAmount: benefitAmount,
        status: 'APPROVED',
        paymentDate: employees[i].terminationDate,
        approvedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    if (employeeTerminationBenefits.length > 0) {
      await db
        .collection('employeeterminationresignations')
        .insertMany(employeeTerminationBenefits);
      console.log(
        `   ✅ ${employeeTerminationBenefits.length} termination/resignation benefits created\n`,
      );
    }

    // ============================================
    // 9. EMPLOYEE SYSTEM ROLES (Auth only)
    // ============================================
    console.log('🔑 Creating employee system roles...');
    const systemRoles = [];
    for (let i = 0; i < AUTH_USERS.length; i++) {
      systemRoles.push({
        employeeProfileId: employeeIds[i],
        roles: [AUTH_USERS[i].role],
        permissions: [],
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }
    await db.collection('employee_system_roles').insertMany(systemRoles);
    console.log(`   ✅ ${systemRoles.length} system roles created\n`);

    // ============================================
    // 10. EMPLOYEE PENALTIES
    // ============================================
    console.log('⚠️  Creating employee penalties...');
    const penalties = [];
    for (let i = 0; i < 3; i++) {
      penalties.push({
        employeeId: employeeIds[i * 5 + 4],
        penalties: [
          { reason: 'Late arrival', amount: randomNumber(100, 300) },
          { reason: 'Unauthorized absence', amount: randomNumber(200, 500) },
        ],
        createdAt: now,
        updatedAt: now,
      });
    }
    await db.collection('employeepenalties').insertMany(penalties);
    console.log(`   ✅ ${penalties.length} penalty records\n`);

    // ============================================
    // 11. PAYROLL RUN
    // ============================================
    console.log('📋 Creating payroll run...');
    const runId = `PR-2024-${randomNumber(1000, 9999)}`;
    const payrollRun = {
      runId,
      payrollPeriod,
      status: 'draft',
      entity: 'Acme Corporation Egypt',
      employees: employees.length,
      exceptions: WITHOUT_BANK,
      totalnetpay: employees.length * 15000,
      payrollSpecialistId: employeeIds[0], // Sarah Smith
      paymentStatus: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    const payrollRunResult = await db
      .collection('payrollruns')
      .insertOne(payrollRun);
    console.log(`   ✅ Payroll run created (${runId})\n`);

    // ============================================
    // 12. EMPLOYEE PAYROLL DETAILS
    // ============================================
    console.log('💼 Creating employee payroll details...');
    const payrollDetails = [];

    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      const baseSalary = randomNumber(8000, 25000);
      const allowances = randomNumber(2000, 5000);
      let bonus = 0;
      let benefit = 0;
      let signingBonus = 0;
      let terminationBenefit = 0;

      // Add signing bonus for new hires
      if (emp.hrEventType === 'NEW_HIRE') {
        const empBonus = employeeSigningBonuses.find((b) =>
          b.employeeId.equals(employeeIds[i]),
        );
        if (empBonus) {
          signingBonus = empBonus.givenAmount;
        }
      }

      // Add termination/resignation benefit
      if (
        emp.hrEventType === 'RESIGNATION' ||
        emp.hrEventType === 'TERMINATION'
      ) {
        const empBenefit = employeeTerminationBenefits.find((b) =>
          b.employeeId.equals(employeeIds[i]),
        );
        if (empBenefit) {
          terminationBenefit = empBenefit.givenAmount;
        }
      }

      const deductions = randomNumber(500, 2000);
      const grossSalary =
        baseSalary +
        allowances +
        bonus +
        benefit +
        signingBonus +
        terminationBenefit;
      const netSalary = grossSalary - deductions;

      payrollDetails.push({
        employeeId: employeeIds[i],
        payrollRunId: payrollRunResult.insertedId,
        baseSalary,
        allowances,
        deductions,
        bonus,
        benefit,
        signingBonus,
        terminationBenefit,
        netSalary,
        netPay: netSalary,
        bankStatus: emp.bankName ? 'valid' : 'missing',
        exceptions: !emp.bankName ? 'Missing bank details' : null,
        hrEventType: emp.hrEventType,
        workingDays: 22,
        absentDays: 0,
        overtimeHours: 0,
        createdAt: now,
        updatedAt: now,
      });
    }

    await db.collection('employeepayrolldetails').insertMany(payrollDetails);
    console.log(`   ✅ ${payrollDetails.length} payroll details created\n`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ ✅ ✅ SEEDING COMPLETE! ✅ ✅ ✅');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📊 Database Summary:');
    console.log(`   • ${departmentIds.length} Departments`);
    console.log(`   • ${positionIds.length} Positions`);
    console.log(`   • ${allowanceIds.length} Allowances`);
    console.log(`   • ${payGradeIds.length} Pay Grades`);
    console.log(`   • ${bonuses.insertedCount} Signing Bonus Templates`);
    console.log(`   • ${benefitTemplates.insertedCount} Benefit Templates`);
    console.log(`   • ${employeeIds.length} Employees`);
    console.log(`     - ${AUTH_USERS.length} authenticated users`);
    console.log(`     - ${NEW_HIRES} new hires (with signing bonuses)`);
    console.log(`     - ${RESIGNATIONS} resignations (with benefits)`);
    console.log(`     - ${TERMINATIONS} terminations (with severance)`);
    console.log(
      `     - ${employees.filter((e) => e.bankName).length} with bank details`,
    );
    console.log(
      `     - ${employees.filter((e) => !e.bankName).length} missing bank details`,
    );
    console.log(
      `   • ${employeeSigningBonuses.length} Employee Signing Bonuses (Approved)`,
    );
    console.log(
      `   • ${employeeTerminationBenefits.length} Termination/Resignation Benefits (Approved)`,
    );
    console.log(`   • ${systemRoles.length} System Roles`);
    console.log(`   • ${penalties.length} Penalty Records`);
    console.log(`   • 1 Payroll Run (${runId})`);
    console.log(`   • ${payrollDetails.length} Payroll Details`);

    console.log('\n🔑 Login Credentials (Password: 123456 for all):');
    AUTH_USERS.forEach((user, i) => {
      console.log(`\n   ${i + 1}. ${user.description}:`);
      console.log(`      Email: ${user.workEmail}`);
      console.log(`      Password: 123456`);
      console.log(`      Role: ${user.role}`);
      console.log(`      Employee ID: ${employeeIds[i]}`);
    });

    console.log('\n📋 HR Events Summary:');
    console.log(
      `   🆕 New Hires: ${NEW_HIRES} employees (hired in December 2024)`,
    );
    console.log(
      `      • Each receives a signing bonus (${employeeSigningBonuses.length} bonuses created)`,
    );
    console.log(`   👋 Resignations: ${RESIGNATIONS} employees`);
    console.log(`      • Each receives end-of-service benefit`);
    console.log(`   ❌ Terminations: ${TERMINATIONS} employees`);
    console.log(`      • Each receives severance package`);
    console.log(`   📅 All HR events dated in December 2024`);
    console.log(`   ✅ All bonuses and benefits are PRE-APPROVED for payroll`);

    console.log('\n💡 Notes:');
    console.log(
      '   • The payroll specialist (Sarah Smith) is set as the payroll run owner',
    );
    console.log(`   • Payroll Specialist ID: ${employeeIds[0]}`);
    console.log('   • Payroll period: December 31, 2024');
    console.log(
      '   • All signing bonuses and termination benefits are already approved',
    );
    console.log(
      '   • HR event types: NEW_HIRE, RESIGNATION, TERMINATION, NORMAL',
    );
    console.log('\n🚀 Database is ready to use!\n');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

main();
