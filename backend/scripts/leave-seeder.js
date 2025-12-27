const mongoose = require('mongoose');

// MongoDB connection string
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-main';

/**
 * Employee Profile Seeder Script
 * Creates the required employee profiles for payroll seeding
 */

async function seedEmployeeProfiles() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;

    console.log('✅ Connected to database\n');

    // ==================== EMPLOYEE PROFILES ====================
    console.log('👥 Seeding Employee Profiles...');

    const employeeProfilesCollection = db.collection('employeeprofiles');

    const employees = [
      {
        workEmail: 'bob@company.com',
        firstName: 'Bob',
        lastName: 'Smith',
        position: 'Payroll Specialist',
        department: 'HR',
        baseSalary: 12000,
        contractType: 'FULL_TIME',
        hireDate: new Date('2023-01-15'),
        status: 'ACTIVE',
        bankAccount: {
          accountNumber: '1234567890',
          bankName: 'National Bank',
          status: 'VALID',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        workEmail: 'lina@company.com',
        firstName: 'Lina',
        lastName: 'Anderson',
        position: 'Senior Developer',
        department: 'Engineering',
        baseSalary: 15000,
        contractType: 'FULL_TIME',
        hireDate: new Date('2022-06-01'),
        status: 'ACTIVE',
        bankAccount: {
          accountNumber: '2234567891',
          bankName: 'National Bank',
          status: 'VALID',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        workEmail: 'eric@company.com',
        firstName: 'Eric',
        lastName: 'Johnson',
        position: 'Project Manager',
        department: 'Operations',
        baseSalary: 14000,
        contractType: 'FULL_TIME',
        hireDate: new Date('2023-03-10'),
        status: 'ACTIVE',
        bankAccount: {
          accountNumber: '3234567892',
          bankName: 'National Bank',
          status: 'VALID',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        workEmail: 'charlie@company.com',
        firstName: 'Charlie',
        lastName: 'Brown',
        position: 'Junior Developer',
        department: 'Engineering',
        baseSalary: 9000,
        contractType: 'FULL_TIME',
        hireDate: new Date('2024-01-20'),
        status: 'ACTIVE',
        // No bank account - intentionally missing for penalty testing
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Delete existing employees with these emails
    await employeeProfilesCollection.deleteMany({
      workEmail: {
        $in: [
          'bob@company.com',
          'lina@company.com',
          'eric@company.com',
          'charlie@company.com',
        ],
      },
    });

    // Insert new employees
    const result = await employeeProfilesCollection.insertMany(employees);

    console.log(
      `   ✓ Inserted ${Object.keys(result.insertedIds).length} employee profiles\n`,
    );

    // ==================== SUMMARY ====================
    console.log('✨ Employee profiles seeding completed successfully!\n');
    console.log('Created employees:');
    employees.forEach((emp) => {
      console.log(
        `  - ${emp.firstName} ${emp.lastName} (${emp.workEmail}) - ${emp.position}`,
      );
    });
  } catch (error) {
    console.error('❌ Error seeding employee profiles:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run seeder
seedEmployeeProfiles();
