// scripts/reset-and-seed-payroll.js
// Cleans all payroll data and re-seeds the system
// Run with: node scripts/reset-and-seed-payroll.js

import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'hr-main';

async function cleanupPayrollData() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    console.log(`📦 Database: ${DATABASE_NAME}\n`);

    const db = client.db(DATABASE_NAME);

    console.log('🧹 Starting cleanup of all payroll-related data...\n');

    // ============================================
    // DELETE ALL PAYROLL-RELATED COLLECTIONS
    // ============================================

    // 1. Delete Payroll Runs
    console.log('1️⃣  Deleting payroll runs...');
    const payrollRunsResult = await db.collection('payrollruns').deleteMany({});
    console.log(`   ✅ Deleted ${payrollRunsResult.deletedCount} payroll runs`);

    // 2. Delete Employee Payroll Details
    console.log('2️⃣  Deleting employee payroll details...');
    const payrollDetailsResult = await db
      .collection('employeepayrolldetails')
      .deleteMany({});
    console.log(
      `   ✅ Deleted ${payrollDetailsResult.deletedCount} payroll details`,
    );

    // 3. Delete Payslips
    console.log('3️⃣  Deleting payslips...');
    const payslipsResult = await db.collection('paySlip').deleteMany({});
    console.log(`   ✅ Deleted ${payslipsResult.deletedCount} payslips`);

    // 4. Delete Signing Bonus Assignments
    console.log('4️⃣  Deleting signing bonus assignments...');
    const signingBonusResult = await db
      .collection('employeesigningbonus')
      .deleteMany({});
    console.log(
      `   ✅ Deleted ${signingBonusResult.deletedCount} signing bonus assignments`,
    );

    // 5. Delete Termination Benefit Assignments
    console.log('5️⃣  Deleting termination benefit assignments...');
    const terminationBenefitsResult = await db
      .collection('employeeterminationresignations')
      .deleteMany({});
    console.log(
      `   ✅ Deleted ${terminationBenefitsResult.deletedCount} termination benefit assignments`,
    );

    // 6. Delete Employee Penalties
    console.log('6️⃣  Deleting employee penalties...');
    const penaltiesResult = await db
      .collection('employeepenalties')
      .deleteMany({});
    console.log(`   ✅ Deleted ${penaltiesResult.deletedCount} penalties`);

    // 7. Delete Termination Requests
    console.log('7️⃣  Deleting termination requests...');
    const terminationRequestsResult = await db
      .collection('terminationrequest')
      .deleteMany({});
    console.log(
      `   ✅ Deleted ${terminationRequestsResult.deletedCount} termination requests`,
    );

    // 8. Delete Allowances (optional - uncomment if you want to clean these too)
    console.log('8️⃣  Deleting allowances...');
    const allowancesResult = await db.collection('allowance').deleteMany({});
    console.log(`   ✅ Deleted ${allowancesResult.deletedCount} allowances`);

    // 9. Delete Signing Bonus Templates (optional - uncomment if needed)
    console.log('9️⃣  Deleting signing bonus templates...');
    const signingBonusTemplatesResult = await db
      .collection('signingbonus')
      .deleteMany({});
    console.log(
      `   ✅ Deleted ${signingBonusTemplatesResult.deletedCount} signing bonus templates`,
    );

    // 10. Delete Termination/Resignation Benefit Templates (optional)
    console.log('🔟 Deleting termination/resignation benefit templates...');
    const benefitTemplatesResult = await db
      .collection('terminationandresignationbenefits')
      .deleteMany({});
    console.log(
      `   ✅ Deleted ${benefitTemplatesResult.deletedCount} benefit templates`,
    );

    // 11. Delete Test Employees (Bob, Lina, Eric, Charlie)
    console.log('1️⃣1️⃣  Deleting test employees...');
    const employeesResult = await db
      .collection('employee_profiles')
      .deleteMany({
        workEmail: {
          $in: [
            'bob@company.com',
            'lina@company.com',
            'eric@company.com',
            'charlie@company.com',
          ],
        },
      });
    console.log(`   ✅ Deleted ${employeesResult.deletedCount} test employees`);

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ CLEANUP COMPLETE!');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📊 Summary:');
    console.log(`   • Payroll Runs: ${payrollRunsResult.deletedCount}`);
    console.log(`   • Payroll Details: ${payrollDetailsResult.deletedCount}`);
    console.log(`   • Payslips: ${payslipsResult.deletedCount}`);
    console.log(
      `   • Signing Bonus Assignments: ${signingBonusResult.deletedCount}`,
    );
    console.log(
      `   • Termination Benefits: ${terminationBenefitsResult.deletedCount}`,
    );
    console.log(`   • Penalties: ${penaltiesResult.deletedCount}`);
    console.log(
      `   • Termination Requests: ${terminationRequestsResult.deletedCount}`,
    );
    console.log(`   • Allowances: ${allowancesResult.deletedCount}`);
    console.log(
      `   • Signing Bonus Templates: ${signingBonusTemplatesResult.deletedCount}`,
    );
    console.log(
      `   • Benefit Templates: ${benefitTemplatesResult.deletedCount}`,
    );
    console.log(`   • Test Employees: ${employeesResult.deletedCount}`);

    console.log('\n✅ Database is clean and ready for re-seeding!\n');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await client.close();
  }
}

async function main() {
  try {
    // Step 1: Cleanup
    await cleanupPayrollData();

    console.log('⏳ Starting payroll seed in 2 seconds...\n');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 2: Re-seed
    console.log('🌱 Running payroll execution seed...\n');
    console.log('═══════════════════════════════════════════════════════\n');

    // Import and run the seed script
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
