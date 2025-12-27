// scripts/seed-locked-run.js
// Creates a LOCKED payroll run with complete data
// Run with: node scripts/seed-locked-run.js
// Use this AFTER running the main combined-seed.js script

import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'hr-main';

const randomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

async function main() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    console.log(`📦 Database: ${DATABASE_NAME}\n`);
    console.log('═══════════════════════════════════════════════════════\n');

    const db = client.db(DATABASE_NAME);
    const now = new Date();

    // ============================================
    // VERIFY DATA EXISTS
    // ============================================
    console.log('🔍 Verifying existing data...');

    const employees = await db
      .collection('employee_profiles')
      .find({})
      .toArray();

    if (employees.length === 0) {
      console.error(
        '❌ No employees found! Please run combined-seed.js first.',
      );
      process.exit(1);
    }

    // Find payroll specialist (Sarah Smith)
    const payrollSpecialist = employees.find(
      (e) => e.workEmail === 'sarah.smith@company.com',
    );

    if (!payrollSpecialist) {
      console.error(
        '❌ Payroll specialist not found! Please run combined-seed.js first.',
      );
      process.exit(1);
    }

    console.log(`   ✅ Found ${employees.length} employees`);
    console.log(
      `   ✅ Payroll Specialist: ${payrollSpecialist.firstName} ${payrollSpecialist.lastName}\n`,
    );

    // ============================================
    // CREATE LOCKED PAYROLL RUN
    // ============================================
    console.log('🔒 Creating LOCKED payroll run...');

    const runId = `PR-2024-LOCKED-${randomNumber(1000, 9999)}`;
    const lockedPayrollRun = {
      runId,
      payrollPeriod: new Date(2024, 10, 30), // November 2024
      status: 'locked',
      entity: 'Acme Corporation Egypt',
      employees: employees.length,
      exceptions: employees.filter((e) => !e.bankName).length,
      totalnetpay: employees.length * 15000,
      payrollSpecialistId: payrollSpecialist._id,
      paymentStatus: 'completed',
      lockedAt: now,
      lockedBy: payrollSpecialist._id,
      approvedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Approved 1 day ago
      approvedBy: payrollSpecialist._id,
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // Created 7 days ago
      updatedAt: now,
    };

    const payrollRunResult = await db
      .collection('payrollruns')
      .insertOne(lockedPayrollRun);
    const payrollRunId = payrollRunResult.insertedId;

    console.log(`   ✅ Locked payroll run created: ${runId}`);
    console.log(`   📅 Period: November 2024`);
    console.log(`   🔒 Status: LOCKED`);
    console.log(`   💰 Payment Status: COMPLETED`);
    console.log(
      `   👤 Owner: ${payrollSpecialist.firstName} ${payrollSpecialist.lastName}\n`,
    );

    // ============================================
    // CREATE PAYROLL DETAILS FOR LOCKED RUN
    // ============================================
    console.log('💼 Creating payroll details for locked run...');

    const payrollDetails = employees.map((emp) => {
      const baseSalary = randomNumber(8000, 25000);
      const allowances = randomNumber(2000, 5000);
      const deductions = randomNumber(500, 2000);
      const taxDeduction = Math.floor(baseSalary * 0.15); // 15% tax
      const totalDeductions = deductions + taxDeduction;
      const netSalary = baseSalary + allowances - totalDeductions;
      const bonus = randomNumber(0, 3000);
      const netPay = netSalary + bonus;

      return {
        employeeId: emp._id,
        payrollRunId: payrollRunId,
        baseSalary,
        allowances,
        deductions: totalDeductions,
        taxDeduction,
        bonus,
        netSalary,
        netPay,
        bankStatus: emp.bankName ? 'valid' : 'missing',
        exceptions: !emp.bankName ? 'Missing bank details' : null,
        paymentDate: emp.bankName ? now : null,
        paymentMethod: emp.bankName ? 'bank_transfer' : null,
        paymentReference: emp.bankName
          ? `PAY-${runId}-${emp.employeeNumber}`
          : null,
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: now,
      };
    });

    await db.collection('employeepayrolldetails').insertMany(payrollDetails);
    console.log(
      `   ✅ ${payrollDetails.length} payroll detail records created`,
    );
    console.log(
      `   ✅ ${payrollDetails.filter((p) => p.bankStatus === 'valid').length} payments processed`,
    );
    console.log(
      `   ⚠️  ${payrollDetails.filter((p) => p.bankStatus === 'missing').length} payments pending (missing bank details)\n`,
    );

    // ============================================
    // CREATE PAYROLL AUDIT LOG
    // ============================================
    console.log('📝 Creating audit log entries...');

    const auditLogs = [
      {
        payrollRunId: payrollRunId,
        action: 'CREATED',
        performedBy: payrollSpecialist._id,
        performedByName: `${payrollSpecialist.firstName} ${payrollSpecialist.lastName}`,
        performedByRole: 'PAYROLL_SPECIALIST',
        timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        details: {
          runId: runId,
          period: 'November 2024',
          employeeCount: employees.length,
        },
      },
      {
        payrollRunId: payrollRunId,
        action: 'CALCULATED',
        performedBy: payrollSpecialist._id,
        performedByName: `${payrollSpecialist.firstName} ${payrollSpecialist.lastName}`,
        performedByRole: 'PAYROLL_SPECIALIST',
        timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
        details: {
          totalNetPay: employees.length * 15000,
          exceptionsFound: employees.filter((e) => !e.bankName).length,
        },
      },
      {
        payrollRunId: payrollRunId,
        action: 'APPROVED',
        performedBy: payrollSpecialist._id,
        performedByName: `${payrollSpecialist.firstName} ${payrollSpecialist.lastName}`,
        performedByRole: 'PAYROLL_SPECIALIST',
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        details: {
          approvalNote: 'All calculations verified and approved for payment',
        },
      },
      {
        payrollRunId: payrollRunId,
        action: 'LOCKED',
        performedBy: payrollSpecialist._id,
        performedByName: `${payrollSpecialist.firstName} ${payrollSpecialist.lastName}`,
        performedByRole: 'PAYROLL_SPECIALIST',
        timestamp: now,
        details: {
          reason: 'Payroll run completed and locked for record keeping',
          paymentsProcessed: payrollDetails.filter(
            (p) => p.bankStatus === 'valid',
          ).length,
        },
      },
    ];

    await db.collection('payroll_audit_logs').insertMany(auditLogs);
    console.log(`   ✅ ${auditLogs.length} audit log entries created\n`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ LOCKED PAYROLL RUN CREATED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📊 Summary:');
    console.log(`   Run ID: ${runId}`);
    console.log(`   Period: November 2024`);
    console.log(`   Status: 🔒 LOCKED`);
    console.log(`   Payment Status: ✅ COMPLETED`);
    console.log(`   Total Employees: ${employees.length}`);
    console.log(
      `   Successful Payments: ${payrollDetails.filter((p) => p.bankStatus === 'valid').length}`,
    );
    console.log(
      `   Exceptions: ${payrollDetails.filter((p) => p.bankStatus === 'missing').length}`,
    );
    console.log(
      `   Total Net Pay: $${(employees.length * 15000).toLocaleString()}`,
    );
    console.log(
      `   Owner: ${payrollSpecialist.firstName} ${payrollSpecialist.lastName}`,
    );

    console.log('\n📝 Audit Trail:');
    console.log(`   ✅ ${auditLogs.length} audit log entries`);
    console.log('   📅 Timeline:');
    console.log('      1. Created (7 days ago)');
    console.log('      2. Calculated (6 days ago)');
    console.log('      3. Approved (1 day ago)');
    console.log('      4. Locked (today)');

    console.log('\n💡 This locked payroll run:');
    console.log('   • Cannot be edited or deleted');
    console.log('   • Has complete payment history');
    console.log('   • Includes full audit trail');
    console.log('   • Represents a completed payroll cycle');

    console.log('\n🔍 Query it with:');
    console.log(`   db.payrollruns.findOne({ runId: "${runId}" })`);
    console.log('\n');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

main();
