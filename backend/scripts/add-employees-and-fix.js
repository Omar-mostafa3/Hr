// scripts/add-employees-and-fix.js
// scripts/add-employees-and-fix.js
// Run with: node scripts/add-employees-and-fix.js
// This script creates 20 employees with only 3 exceptions (missing bank details)

import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'HR';

const randomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);
const randomElement = (array) =>
  array[Math.floor(Math.random() * array.length)];

// ============================================
// EGYPTIAN DATA FOR REALISTIC EMPLOYEES
// ============================================
const EGYPTIAN_DATA = {
  banks: [
    'National Bank of Egypt',
    'Banque Misr',
    'Commercial International Bank',
    'Arab African International Bank',
    'Egyptian Gulf Bank',
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
      'Karim',
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
      'Nadia',
      'Dina',
      'Salma',
      'Aya',
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
    'Nasser',
    'Salem',
    'Kamal',
    'El-Sayed',
    'Mostafa',
    'Youssef',
    'Rashid',
  ],
};

function generateEmployee(index, hasBankDetails = true) {
  const isMale = index % 2 === 0;
  const firstName = randomElement(
    isMale ? EGYPTIAN_DATA.firstNames.male : EGYPTIAN_DATA.firstNames.female,
  );
  const lastName = randomElement(EGYPTIAN_DATA.lastNames);

  return {
    firstName,
    lastName,
    nationalId: `2${randomNumber(85, 99)}${String(randomNumber(1, 12)).padStart(2, '0')}${String(randomNumber(1, 28)).padStart(2, '0')}${randomNumber(10000, 99999)}`,
    personalEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@gmail.com`,
    workEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@company.com`,
    employeeNumber: `EMP${randomNumber(10000, 99999)}`,
    dateOfHire: new Date(2020 + (index % 4), index % 12, (index % 28) + 1),
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
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function addEmployeesAndFix() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    console.log(`📦 Database: ${DATABASE_NAME}\n`);

    const db = client.db(DATABASE_NAME);

    // ============================================
    // STEP 1: Clear existing data for fresh start
    // ============================================
    console.log('🧹 STEP 1: Clearing all data for fresh start...\n');

    await db.collection('employee_profiles').deleteMany({});
    await db.collection('payrollruns').deleteMany({});
    await db.collection('employeepayrolldetails').deleteMany({});
    await db.collection('payslips').deleteMany({});
    console.log(
      '   ✅ Cleared employee_profiles, payrollruns, employeepayrolldetails, payslips',
    );

    // ============================================
    // STEP 2: Create 20 employees (17 with bank, 3 without)
    // ============================================
    console.log(
      '\n👥 STEP 2: Creating 20 employees (only 3 without bank details)...\n',
    );

    const employees = [];
    const TARGET_COUNT = 20;
    const EXCEPTIONS_COUNT = 3;

    for (let i = 0; i < TARGET_COUNT; i++) {
      // Last 3 employees (index 17, 18, 19) won't have bank details
      const hasBankDetails = i < TARGET_COUNT - EXCEPTIONS_COUNT;
      const employee = generateEmployee(i, hasBankDetails);
      employees.push(employee);

      const bankStatus = hasBankDetails ? '✅ Bank OK' : '❌ NO BANK';
      console.log(
        `   ${String(i + 1).padStart(2)}. ${employee.firstName.padEnd(10)} ${employee.lastName.padEnd(12)} - ${bankStatus}`,
      );
    }

    const insertResult = await db
      .collection('employee_profiles')
      .insertMany(employees);
    const employeeIds = Object.values(insertResult.insertedIds);
    console.log(`\n   ✅ Created ${insertResult.insertedCount} employees`);
    console.log(`   • With Bank Details: ${TARGET_COUNT - EXCEPTIONS_COUNT}`);
    console.log(`   • Without Bank Details (Exceptions): ${EXCEPTIONS_COUNT}`);

    // ============================================
    // STEP 3: Create payroll run
    // ============================================
    console.log('\n📋 STEP 3: Creating payroll run...\n');

    const runId = `PR-2024-${randomNumber(1000, 9999)}`;
    const payrollRun = {
      runId,
      payrollPeriod: new Date(2024, 11, 31),
      status: 'draft',
      entity: 'Acme Corporation Egypt',
      employees: TARGET_COUNT,
      exceptions: EXCEPTIONS_COUNT,
      totalnetpay: 0,
      payrollSpecialistId: employeeIds[0],
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const runResult = await db.collection('payrollruns').insertOne(payrollRun);
    const payrollRunId = runResult.insertedId;
    console.log(`   ✅ Created payroll run: ${runId}`);

    // ============================================
    // STEP 4: Create payroll details for ALL employees
    // ============================================
    console.log('\n💼 STEP 4: Creating payroll details...\n');

    const payrollDetails = [];
    let totalNetPay = 0;

    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      const baseSalary = randomNumber(8000, 25000);
      const allowances = randomNumber(2000, 5000);
      const deductions = randomNumber(500, 2000);
      const netSalary = baseSalary + allowances - deductions;
      const bonus = i < 7 ? randomNumber(1000, 5000) : 0;
      const netPay = netSalary + bonus;

      const hasBankDetails = emp.bankName && emp.bankAccountNumber;
      const exception = !hasBankDetails ? 'Missing bank details' : null;

      totalNetPay += netPay;

      payrollDetails.push({
        employeeId: employeeIds[i],
        payrollRunId: payrollRunId,
        baseSalary,
        allowances,
        deductions,
        netSalary,
        netPay,
        bonus,
        benefit: 0,
        bankStatus: hasBankDetails ? 'valid' : 'missing',
        exceptions: exception,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await db.collection('employeepayrolldetails').insertMany(payrollDetails);
    console.log(
      `   ✅ Created ${payrollDetails.length} payroll detail records`,
    );

    // Update payroll run totals
    await db
      .collection('payrollruns')
      .updateOne(
        { _id: payrollRunId },
        { $set: { totalnetpay: totalNetPay, exceptions: EXCEPTIONS_COUNT } },
      );

    // ============================================
    // STEP 5: Verify everything
    // ============================================
    console.log('\n🔍 STEP 5: Verification...\n');

    const verifyDetail = await db
      .collection('employeepayrolldetails')
      .findOne({});
    const verifyEmployee = await db
      .collection('employee_profiles')
      .findOne({ _id: verifyDetail.employeeId });

    if (verifyEmployee) {
      console.log('   ✅ VERIFICATION PASSED!');
      console.log(
        `   Payroll Detail -> Employee: ${verifyEmployee.firstName} ${verifyEmployee.lastName}`,
      );
    } else {
      console.log('   ❌ VERIFICATION FAILED');
    }

    const exceptionsInDB = await db
      .collection('employeepayrolldetails')
      .countDocuments({
        exceptions: { $ne: null },
      });
    console.log(`   Exceptions in database: ${exceptionsInDB}`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ ✅ ✅ COMPLETE! ✅ ✅ ✅');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📊 Summary:');
    console.log(`   • Total Employees: ${TARGET_COUNT}`);
    console.log(`   • With Bank Details: ${TARGET_COUNT - EXCEPTIONS_COUNT}`);
    console.log(`   • Without Bank Details: ${EXCEPTIONS_COUNT} (exceptions)`);
    console.log(`   • Payroll Run: ${runId}`);
    console.log(`   • Payroll Details: ${payrollDetails.length}`);
    console.log(`   • Total Net Pay: $${totalNetPay.toLocaleString()}`);
    console.log(`   • Exceptions: ${EXCEPTIONS_COUNT}`);
    console.log(
      '\n🚀 Create a NEW payroll run via your API - names will show correctly!\n',
    );
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

addEmployeesAndFix();
