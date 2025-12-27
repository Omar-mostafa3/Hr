// scripts/payroll-execution-seed.js
// Payroll Execution Seed Script - January 2025
// Seeds payroll run for Lina, Eric, and Charlie only
// Run with: node scripts/payroll-execution-seed.js

import { MongoClient, ObjectId } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'hr-main';

async function main() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    console.log(`📦 Database: ${DATABASE_NAME}\n`);

    const db = client.db(DATABASE_NAME);
    const now = new Date();

    // ============================================
    // 1. CREATE/FIND BOB (PAYROLL SPECIALIST)
    // ============================================
    console.log('👤 Creating/Finding Bob (Payroll Specialist)...');

    let bob = await db.collection('employee_profiles').findOne({
      $or: [
        { workEmail: 'bob@company.com' },
        { employeeNumber: 'EMP-BOB' },
        { firstName: 'Bob' },
      ],
    });

    if (!bob) {
      console.log('   ⚠️  Bob not found, creating...');
      const bobResult = await db.collection('employee_profiles').insertOne({
        employeeNumber: 'EMP-BOB',
        nationalId: '29012011234567',
        firstName: 'Bob',
        lastName: 'Smith',
        fullName: 'Bob Smith',
        personalEmail: 'bob.smith.personal@gmail.com',
        workEmail: 'bob@company.com',
        email: 'bob@company.com', // ✅ ADDED
        mobilePhone: '+201012345678',
        dateOfBirth: new Date(1990, 0, 1),
        gender: 'MALE',
        maritalStatus: 'SINGLE',
        dateOfHire: new Date('2020-01-01'),
        hireDate: new Date('2020-01-01'),
        contractStartDate: new Date('2020-01-01'),
        contractType: 'FULL_TIME_CONTRACT',
        workType: 'FULL_TIME',
        status: 'ACTIVE',
        statusEffectiveFrom: now,
        bankName: 'National Bank of Egypt',
        bankAccountNumber: '1234567890123',
        biography: 'Payroll Specialist - Bob Smith',
        createdAt: now,
        updatedAt: now,
      });
      bob = { _id: bobResult.insertedId };
      console.log(`   ✅ Created Bob: ${bob._id}`);
    } else {
      console.log(`   ✅ Found Bob: ${bob._id}`);
    }

    // ============================================
    // 2. CREATE/FIND LINA, ERIC, CHARLIE
    // ============================================
    console.log('\n👥 Creating/Finding required employees...');

    // LINA
    let lina = await db.collection('employee_profiles').findOne({
      workEmail: 'lina@company.com',
    });

    if (!lina) {
      console.log('   ⚠️  Lina not found, creating...');
      const linaResult = await db.collection('employee_profiles').insertOne({
        employeeNumber: 'EMP-LINA',
        nationalId: '29501011234567',
        firstName: 'Lina',
        lastName: 'Anderson',
        fullName: 'Lina Anderson',
        personalEmail: 'lina.anderson@gmail.com',
        workEmail: 'lina@company.com',
        email: 'lina@company.com', // ✅ ADDED
        mobilePhone: '+201023456789',
        dateOfBirth: new Date(1995, 0, 1),
        gender: 'FEMALE',
        maritalStatus: 'SINGLE',
        dateOfHire: new Date('2022-01-01'),
        hireDate: new Date('2022-01-01'),
        contractStartDate: new Date('2022-01-01'),
        contractType: 'FULL_TIME_CONTRACT',
        workType: 'FULL_TIME',
        status: 'ACTIVE',
        statusEffectiveFrom: now,
        bankName: 'Commercial International Bank',
        bankAccountNumber: '2345678901234',
        biography: 'Senior Software Engineer - Lina Anderson',
        createdAt: now,
        updatedAt: now,
      });
      lina = { _id: linaResult.insertedId };
      console.log(`   ✅ Created Lina: ${lina._id}`);
    } else {
      console.log(`   ✅ Found Lina: ${lina._id}`);
    }

    // ERIC
    let eric = await db.collection('employee_profiles').findOne({
      workEmail: 'eric@company.com',
    });

    if (!eric) {
      console.log('   ⚠️  Eric not found, creating...');
      const ericResult = await db.collection('employee_profiles').insertOne({
        employeeNumber: 'EMP-ERIC',
        nationalId: '29301011234567',
        firstName: 'Eric',
        lastName: 'Martinez',
        fullName: 'Eric Martinez',
        personalEmail: 'eric.martinez@gmail.com',
        workEmail: 'eric@company.com',
        email: 'eric@company.com', // ✅ ADDED
        mobilePhone: '+201034567890',
        dateOfBirth: new Date(1993, 0, 1),
        gender: 'MALE',
        maritalStatus: 'MARRIED',
        dateOfHire: new Date('2021-06-01'),
        hireDate: new Date('2021-06-01'),
        contractStartDate: new Date('2021-06-01'),
        contractType: 'FULL_TIME_CONTRACT',
        workType: 'FULL_TIME',
        status: 'ACTIVE',
        statusEffectiveFrom: now,
        bankName: 'Banque Misr',
        bankAccountNumber: '3456789012345',
        biography: 'Software Engineer - Eric Martinez',
        createdAt: now,
        updatedAt: now,
      });
      eric = { _id: ericResult.insertedId };
      console.log(`   ✅ Created Eric: ${eric._id}`);
    } else {
      console.log(`   ✅ Found Eric: ${eric._id}`);
    }

    // CHARLIE
    let charlie = await db.collection('employee_profiles').findOne({
      workEmail: 'charlie@company.com',
    });

    if (!charlie) {
      console.log('   ⚠️  Charlie not found, creating...');
      const charlieResult = await db.collection('employee_profiles').insertOne({
        employeeNumber: 'EMP-CHARLIE',
        nationalId: '29701011234567',
        firstName: 'Charlie',
        lastName: 'Brown',
        fullName: 'Charlie Brown',
        personalEmail: 'charlie.brown@gmail.com',
        workEmail: 'charlie@company.com',
        email: 'charlie@company.com', // ✅ ADDED
        mobilePhone: '+201045678901',
        dateOfBirth: new Date(1997, 0, 1),
        gender: 'MALE',
        maritalStatus: 'SINGLE',
        dateOfHire: new Date('2023-03-01'),
        hireDate: new Date('2023-03-01'),
        contractStartDate: new Date('2023-03-01'),
        contractType: 'FULL_TIME_CONTRACT',
        workType: 'FULL_TIME',
        status: 'ACTIVE',
        statusEffectiveFrom: now,
        bankName: null, // NO BANK ACCOUNT
        bankAccountNumber: null,
        biography: 'Sales Representative - Charlie Brown',
        createdAt: now,
        updatedAt: now,
      });
      charlie = { _id: charlieResult.insertedId };
      console.log(`   ✅ Created Charlie: ${charlie._id} (NO BANK ACCOUNT)`);
    } else {
      console.log(`   ✅ Found Charlie: ${charlie._id}`);
    }

    // ============================================
    // 3. CREATE/FIND ALLOWANCES
    // ============================================
    console.log('\n💰 Creating/Finding allowances...');

    let housingAllowance = await db.collection('allowance').findOne({
      name: 'Housing Allowance',
      amount: 2000,
    });

    if (!housingAllowance) {
      const result = await db.collection('allowance').insertOne({
        name: 'Housing Allowance',
        amount: 2000,
        status: 'approved',
        approvedAt: now,
        createdAt: now,
        updatedAt: now,
      });
      housingAllowance = { _id: result.insertedId };
      console.log(`   ✅ Created Housing Allowance`);
    } else {
      console.log(`   ✅ Found Housing Allowance`);
    }

    let transportAllowance = await db.collection('allowance').findOne({
      name: 'Transport Allowance',
      amount: 1000,
    });

    if (!transportAllowance) {
      const result = await db.collection('allowance').insertOne({
        name: 'Transport Allowance',
        amount: 1000,
        status: 'approved',
        approvedAt: now,
        createdAt: now,
        updatedAt: now,
      });
      transportAllowance = { _id: result.insertedId };
      console.log(`   ✅ Created Transport Allowance`);
    } else {
      console.log(`   ✅ Found Transport Allowance`);
    }

    // ============================================
    // 4. CREATE/FIND SIGNING BONUS TEMPLATE
    // ============================================
    console.log('\n🎁 Creating/Finding signing bonus template...');

    let seniorSigningBonus = await db.collection('signingbonus').findOne({
      positionName: 'Senior Software Engineer',
    });

    if (!seniorSigningBonus) {
      const result = await db.collection('signingbonus').insertOne({
        positionName: 'Senior Software Engineer',
        amount: 12000,
        status: 'approved',
        approvedAt: now,
        createdAt: now,
        updatedAt: now,
      });
      seniorSigningBonus = { _id: result.insertedId };
      console.log(`   ✅ Created Senior Signing Bonus template`);
    } else {
      console.log(`   ✅ Found Senior Signing Bonus template`);
    }

    // ============================================
    // 5. CREATE/FIND END OF SERVICE BENEFIT
    // ============================================
    console.log('\n💼 Creating/Finding End of Service Benefit...');

    let endOfServiceBenefit = await db
      .collection('terminationandresignationbenefits')
      .findOne({
        name: 'End of Service Benefit',
      });

    if (!endOfServiceBenefit) {
      const result = await db
        .collection('terminationandresignationbenefits')
        .insertOne({
          name: 'End of Service Benefit',
          amount: 8000,
          description: 'End-of-service benefit',
          status: 'approved',
          approvedAt: now,
          createdAt: now,
          updatedAt: now,
        });
      endOfServiceBenefit = { _id: result.insertedId };
      console.log(`   ✅ Created End of Service Benefit template`);
    } else {
      console.log(`   ✅ Found End of Service Benefit template`);
    }

    // ============================================
    // 6. CREATE PAYROLL RUNS
    // ============================================
    console.log('\n📋 Creating payroll runs...');

    const payrollPeriod = new Date('2025-01-31');

    // Engineering Run (Lina, Eric)
    const engineeringRun = {
      runId: 'PR-2025-001',
      payrollPeriod,
      status: 'DRAFT',
      entity: 'Engineering',
      employees: 2,
      exceptions: 0,
      totalnetpay: 0,
      payrollSpecialistId: bob._id,
      paymentStatus: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    // Sales Run (Charlie)
    const salesRun = {
      runId: 'PR-2025-002',
      payrollPeriod,
      status: 'DRAFT',
      entity: 'Sales',
      employees: 1,
      exceptions: 1,
      totalnetpay: 0,
      payrollSpecialistId: bob._id,
      paymentStatus: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    const payrollRunsResult = await db
      .collection('payrollruns')
      .insertMany([engineeringRun, salesRun]);

    const engineeringRunId = payrollRunsResult.insertedIds[0];
    const salesRunId = payrollRunsResult.insertedIds[1];

    console.log(`   ✅ Created Engineering run: ${engineeringRunId}`);
    console.log(`   ✅ Created Sales run: ${salesRunId}`);

    // ============================================
    // 7. CREATE SIGNING BONUS ASSIGNMENTS
    // ============================================
    console.log('\n🎁 Creating signing bonus assignments...');

    const linaSigningBonus = {
      employeeId: lina._id,
      signingBonusId: seniorSigningBonus._id,
      givenAmount: 5000,
      status: 'approved', // ✅ CHANGED to lowercase
      paymentDate: new Date('2025-02-28'),
      approvedBy: bob._id,
      approvedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const charlieSigningBonus = {
      employeeId: charlie._id,
      signingBonusId: seniorSigningBonus._id,
      givenAmount: 5000,
      status: 'pending', // ✅ Already lowercase
      paymentDate: null,
      createdAt: now,
      updatedAt: now,
    };

    await db
      .collection('employeesigningbonus')
      .insertMany([linaSigningBonus, charlieSigningBonus]);

    console.log(`   ✅ Lina signing bonus: 5000 approved (2025-02-28)`);
    console.log(`   ✅ Charlie signing bonus: 5000 pending`);

    // ============================================
    // 8. CREATE TERMINATION BENEFIT ASSIGNMENTS
    // ============================================
    console.log('\n💼 Creating termination benefit assignments...');

    // Create termination request for Charlie
    const charlieTermReqResult = await db
      .collection('terminationrequest')
      .insertOne({
        employeeId: charlie._id,
        requestDate: new Date('2025-01-15'),
        effectiveDate: new Date('2025-02-28'),
        type: 'RESIGNATION',
        status: 'approved', // ✅ CHANGED to lowercase
        createdAt: now,
        updatedAt: now,
      });

    const linaBenefit = {
      employeeId: lina._id,
      benefitId: endOfServiceBenefit._id,
      givenAmount: 5000,
      terminationId: null,
      status: 'pending', // ✅ CHANGED to lowercase
      paymentDate: null,
      createdAt: now,
      updatedAt: now,
    };

    const charlieBenefitAssignment = {
      employeeId: charlie._id,
      benefitId: endOfServiceBenefit._id,
      givenAmount: 5000,
      terminationId: charlieTermReqResult.insertedId,
      status: 'approved', // ✅ CHANGED to lowercase
      paymentDate: new Date('2025-02-28'),
      approvedBy: bob._id,
      approvedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    await db
      .collection('employeeterminationresignations')
      .insertMany([linaBenefit, charlieBenefitAssignment]);

    console.log(`   ✅ Lina termination benefit: 5000 pending`);
    console.log(
      `   ✅ Charlie termination benefit: 5000 approved (2025-02-28)`,
    );

    // ============================================
    // 9. CREATE EMPLOYEE PENALTIES (Charlie only)
    // ============================================
    console.log('\n⚠️  Creating employee penalties...');

    const charliePenalty = {
      employeeId: charlie._id,
      penalties: [
        {
          reason: 'Missing bank account',
          amount: 150,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    await db.collection('employeepenalties').insertOne(charliePenalty);
    console.log(`   ✅ Charlie penalty: Missing bank account (150)`);

    // ============================================
    // 10. CREATE PAYROLL DETAILS & PAYSLIPS
    // ============================================
    console.log('\n💼 Creating payroll details and payslips...\n');

    const allowancesTotal = 3000;
    const taxRate = 0.1;

    // === LINA ===
    console.log('   Processing Lina...');
    const linaBaseSalary = 15000;
    const linaBonus = 5000;
    const linaGrossSalary = linaBaseSalary + allowancesTotal + linaBonus;
    const linaTax = linaGrossSalary * taxRate;
    const linaNetPay = linaGrossSalary - linaTax;

    const linaPayrollDetail = {
      employeeId: lina._id,
      payrollRunId: engineeringRunId,
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
      updatedAt: now,
    };

    const linaPayslip = {
      employeeId: lina._id,
      payrollRunId: engineeringRunId,
      earningsDetails: {
        baseSalary: linaBaseSalary,
        allowances: [
          { name: 'Housing Allowance', amount: 2000 },
          { name: 'Transport Allowance', amount: 1000 },
        ],
        bonuses: [
          {
            positionName: 'Senior Software Engineer',
            amount: linaBonus,
          },
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
      paymentStatus: 'pending', // ✅ CHANGED to lowercase
      createdAt: now,
      updatedAt: now,
    };

    console.log(
      `      Base: ${linaBaseSalary}, Allowances: ${allowancesTotal}, Bonus: ${linaBonus}`,
    );
    console.log(
      `      Gross: ${linaGrossSalary}, Tax: ${linaTax}, Net: ${linaNetPay}`,
    );

    // === ERIC ===
    console.log('\n   Processing Eric...');
    const ericBaseSalary = 14000;
    const ericGrossSalary = ericBaseSalary + allowancesTotal;
    const ericTax = ericGrossSalary * taxRate;
    const ericNetPay = ericGrossSalary - ericTax;

    const ericPayrollDetail = {
      employeeId: eric._id,
      payrollRunId: engineeringRunId,
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
      updatedAt: now,
    };

    const ericPayslip = {
      employeeId: eric._id,
      payrollRunId: engineeringRunId,
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
      paymentStatus: 'pending', // ✅ CHANGED to lowercase
      createdAt: now,
      updatedAt: now,
    };

    console.log(
      `      Base: ${ericBaseSalary}, Allowances: ${allowancesTotal}`,
    );
    console.log(
      `      Gross: ${ericGrossSalary}, Tax: ${ericTax}, Net: ${ericNetPay}`,
    );

    // === CHARLIE ===
    console.log('\n   Processing Charlie...');
    const charlieBaseSalary = 9000;
    const charlieBenefitAmount = 5000;
    const charlieGrossSalary =
      charlieBaseSalary + allowancesTotal + charlieBenefitAmount;
    const charlieTax = charlieGrossSalary * taxRate;
    const charliePenaltyAmount = 150;
    const charlieDeductions = charlieTax + charliePenaltyAmount;
    const charlieNetPay = charlieGrossSalary - charlieDeductions;

    const charliePayrollDetail = {
      employeeId: charlie._id,
      payrollRunId: salesRunId,
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
      updatedAt: now,
    };

    const charliePayslip = {
      employeeId: charlie._id,
      payrollRunId: salesRunId,
      earningsDetails: {
        baseSalary: charlieBaseSalary,
        allowances: [
          { name: 'Housing Allowance', amount: 2000 },
          { name: 'Transport Allowance', amount: 1000 },
        ],
        bonuses: [],
        benefits: [
          {
            name: 'End of Service Benefit',
            amount: charlieBenefitAmount,
          },
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
      paymentStatus: 'pending', // ✅ CHANGED to lowercase
      createdAt: now,
      updatedAt: now,
    };

    console.log(
      `      Base: ${charlieBaseSalary}, Allowances: ${allowancesTotal}, Benefit: ${charlieBenefitAmount}`,
    );
    console.log(
      `      Gross: ${charlieGrossSalary}, Tax: ${charlieTax}, Penalty: ${charliePenaltyAmount}`,
    );
    console.log(
      `      Deductions: ${charlieDeductions}, Net: ${charlieNetPay}`,
    );

    // Insert all payroll details
    await db
      .collection('employeepayrolldetails')
      .insertMany([linaPayrollDetail, ericPayrollDetail, charliePayrollDetail]);

    // Insert all payslips
    await db
      .collection('paySlip')
      .insertMany([linaPayslip, ericPayslip, charliePayslip]);

    console.log('\n   ✅ 3 payroll details created');
    console.log('   ✅ 3 payslips created');

    // ============================================
    // 11. UPDATE PAYROLL RUN TOTALS
    // ============================================
    console.log('\n🔄 Updating payroll run totals...');

    const engineeringTotalNetPay = linaNetPay + ericNetPay;
    const salesTotalNetPay = charlieNetPay;

    await db
      .collection('payrollruns')
      .updateOne(
        { _id: engineeringRunId },
        { $set: { totalnetpay: engineeringTotalNetPay, updatedAt: now } },
      );

    await db
      .collection('payrollruns')
      .updateOne(
        { _id: salesRunId },
        { $set: { totalnetpay: salesTotalNetPay, updatedAt: now } },
      );

    console.log(`   ✅ Engineering total: ${engineeringTotalNetPay}`);
    console.log(`   ✅ Sales total: ${salesTotalNetPay}`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ ✅ ✅ PAYROLL EXECUTION SEED COMPLETE! ✅ ✅ ✅');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📊 Summary:');
    console.log('\n🏢 Payroll Runs:');
    console.log(`   • PR-2025-001 (Engineering): 2 employees, 0 exceptions`);
    console.log(`   • PR-2025-001 (Sales): 1 employee, 1 exception`);
    console.log(`   • Period: January 31, 2025`);
    console.log(`   • Status: DRAFT`);
    console.log(`   • Specialist: Bob (${bob._id})`);

    console.log('\n👥 Employees:');
    console.log(`   • Lina (${lina._id})`);
    console.log(`     - Base: 15000, Allowances: 3000, Signing Bonus: 5000`);
    console.log(
      `     - Gross: ${linaGrossSalary}, Tax: ${linaTax}, Net: ${linaNetPay}`,
    );
    console.log(`     - Bank: VALID, Exceptions: None`);
    console.log(`   • Eric (${eric._id})`);
    console.log(`     - Base: 14000, Allowances: 3000`);
    console.log(
      `     - Gross: ${ericGrossSalary}, Tax: ${ericTax}, Net: ${ericNetPay}`,
    );
    console.log(`     - Bank: VALID, Exceptions: None`);
    console.log(`   • Charlie (${charlie._id})`);
    console.log(`     - Base: 9000, Allowances: 3000, Benefit: 5000`);
    console.log(
      `     - Gross: ${charlieGrossSalary}, Tax: ${charlieTax}, Penalty: 150`,
    );
    console.log(`     - Net: ${charlieNetPay}`);
    console.log(`     - Bank: MISSING, Exceptions: Missing bank account`);

    console.log('\n🎁 Signing Bonuses:');
    console.log(`   • Lina: 5000 approved (2025-02-28)`);
    console.log(`   • Charlie: 5000 pending`);

    console.log('\n💼 Termination Benefits:');
    console.log(`   • Lina: 5000 pending`);
    console.log(`   • Charlie: 5000 approved (2025-02-28)`);

    console.log('\n⚠️  Penalties:');
    console.log(`   • Charlie: Missing bank account (150)`);

    console.log('\n💰 Payslips:');
    console.log(`   • 3 payslips created (all pending)`);
    console.log(`   • Tax rule: Income Tax 10%`);
    console.log(`   • Charlie's payslip includes penalty in deductions`);

    console.log('\n✅ All requirements met!\n');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

main();
