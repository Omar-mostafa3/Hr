// seedOrganizationStructure.js
const mongoose = require('mongoose');

// MongoDB Connection
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
const departmentSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  isActive: { type: Boolean, default: true },
  headPositionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Position' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const positionSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  departmentCode: { type: String, required: true },
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const positionAssignmentSchema = new mongoose.Schema({
  employeeEmail: { type: String, required: true },
  positionCode: { type: String, required: true },
  departmentCode: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const structureChangeRequestSchema = new mongoose.Schema({
  requestNumber: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: [
      'NEW_POSITION',
      'MODIFY_POSITION',
      'DELETE_POSITION',
      'NEW_DEPARTMENT',
      'MODIFY_DEPARTMENT',
    ],
    required: true,
  },
  targetDepartment: String,
  requestedBy: String,
  submittedBy: String,
  status: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'],
    default: 'DRAFT',
  },
  details: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const structureApprovalSchema = new mongoose.Schema({
  changeRequestId: String,
  approverEmployeeId: String,
  decision: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  },
  comments: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const structureChangeLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['CREATED', 'UPDATED', 'DELETED'],
    required: true,
  },
  entityType: {
    type: String,
    enum: ['Department', 'Position', 'Assignment'],
    required: true,
  },
  entityId: String,
  performedBy: String,
  summary: String,
  beforeSnapshot: mongoose.Schema.Types.Mixed,
  afterSnapshot: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});

// Models
const Department = mongoose.model('Department', departmentSchema);
const Position = mongoose.model('Position', positionSchema);
const PositionAssignment = mongoose.model(
  'PositionAssignment',
  positionAssignmentSchema,
);
const StructureChangeRequest = mongoose.model(
  'StructureChangeRequest',
  structureChangeRequestSchema,
);
const StructureApproval = mongoose.model(
  'StructureApproval',
  structureApprovalSchema,
);
const StructureChangeLog = mongoose.model(
  'StructureChangeLog',
  structureChangeLogSchema,
);

// Seed Data
const seedOrganizationStructure = async () => {
  try {
    console.log('\n=== Starting Organization Structure Seed ===\n');

    // Clear existing data
    await Department.deleteMany({});
    await Position.deleteMany({});
    await PositionAssignment.deleteMany({});
    await StructureChangeRequest.deleteMany({});
    await StructureApproval.deleteMany({});
    await StructureChangeLog.deleteMany({});

    // 1. Create Departments
    const departments = [
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
        code: 'LND-001',
        name: 'Learning and Development',
        description: 'Learning, training, and academic support',
        isActive: true,
      },
      {
        code: 'FIN-001',
        name: 'Finance',
        description: 'Finance and accounting operations',
        isActive: true,
      },
      {
        code: 'LIB-001',
        name: 'Library Services',
        description: 'Knowledge center and library operations',
        isActive: true,
      },
      {
        code: 'OPS-001-INACTIVE',
        name: 'Operations (Inactive)',
        description: 'Inactive operations unit for coverage',
        isActive: false,
      },
      {
        code: 'TEST-001',
        name: 'Test Department',
        description: 'Seeded test department',
        isActive: true,
      },
    ];

    const createdDepartments = await Department.insertMany(departments);
    console.log(`✓ Created ${createdDepartments.length} departments`);

    // 2. Create Positions
    const positions = [
      {
        code: 'POS-HR-MGR',
        title: 'HR Manager',
        departmentCode: 'HR-001',
        description: 'Manager of Human Resources',
        isActive: true,
      },
      {
        code: 'POS-HR-GEN',
        title: 'HR Generalist',
        departmentCode: 'HR-001',
        description: 'HR operations and employee relations',
        isActive: true,
      },
      {
        code: 'POS-SWE',
        title: 'Software Engineer',
        departmentCode: 'ENG-001',
        description: 'Full Stack Developer',
        isActive: true,
      },
      {
        code: 'POS-SENIOR-SWE',
        title: 'Senior Software Engineer',
        departmentCode: 'ENG-001',
        description: 'Leads software engineering initiatives',
        isActive: true,
      },
      {
        code: 'POS-QA-ENG',
        title: 'QA Engineer',
        departmentCode: 'ENG-001',
        description: 'Quality assurance and testing',
        isActive: true,
      },
      {
        code: 'POS-SALES-REP',
        title: 'Sales Representative',
        departmentCode: 'SALES-001',
        description: 'Sales Representative',
        isActive: true,
      },
      {
        code: 'POS-SALES-LEAD',
        title: 'Sales Lead',
        departmentCode: 'SALES-001',
        description: 'Leads sales team for regional accounts',
        isActive: true,
      },
      {
        code: 'POS-TA',
        title: 'TA',
        departmentCode: 'LND-001',
        description: 'Teaching Assistant supporting learning programs',
        isActive: true,
      },
      {
        code: 'POS-LA',
        title: 'LA',
        departmentCode: 'LND-001',
        description: 'Learning Advisor guiding training plans',
        isActive: true,
      },
      {
        code: 'POS-ACC',
        title: 'Accountant',
        departmentCode: 'FIN-001',
        description: 'Handles accounting operations and reporting',
        isActive: true,
      },
      {
        code: 'POS-LIB',
        title: 'Librarian',
        departmentCode: 'LIB-001',
        description: 'Manages library resources and circulation',
        isActive: true,
      },
      {
        code: 'POS-OPS-INACTIVE',
        title: 'Operations Analyst (Inactive)',
        departmentCode: 'OPS-001-INACTIVE',
        description: 'Inactive position for coverage',
        isActive: false,
      },
      {
        code: 'POS-TEST-HEAD',
        title: 'Test Dept Head',
        departmentCode: 'TEST-001',
        description: 'Head of Test Department',
        isActive: true,
      },
      {
        code: 'POS-TEST-EMP',
        title: 'Test Dept Employee',
        departmentCode: 'TEST-001',
        description: 'Employee in Test Department',
        isActive: true,
      },

      // Department Head positions (auto-created)
      {
        code: 'POS-ENG-001-HEAD',
        title: 'Department Head - Engineering',
        departmentCode: 'ENG-001',
        description: 'Created when no head-like title exists',
        isActive: true,
      },
      {
        code: 'POS-SALES-001-HEAD',
        title: 'Department Head - Sales',
        departmentCode: 'SALES-001',
        description: 'Created when no head-like title exists',
        isActive: true,
      },
      {
        code: 'POS-LND-001-HEAD',
        title: 'Department Head - Learning and Development',
        departmentCode: 'LND-001',
        description: 'Created when no head-like title exists',
        isActive: true,
      },
      {
        code: 'POS-FIN-001-HEAD',
        title: 'Department Head - Finance',
        departmentCode: 'FIN-001',
        description: 'Created when no head-like title exists',
        isActive: true,
      },
      {
        code: 'POS-LIB-001-HEAD',
        title: 'Department Head - Library Services',
        departmentCode: 'LIB-001',
        description: 'Created when no head-like title exists',
        isActive: true,
      },
      {
        code: 'POS-OPS-001-INACTIVE-HEAD',
        title: 'Department Head - Operations (Inactive)',
        departmentCode: 'OPS-001-INACTIVE',
        description: 'Created when no head-like title exists',
        isActive: true,
      },
    ];

    const createdPositions = await Position.insertMany(positions);
    console.log(`✓ Created ${createdPositions.length} positions`);

    // 3. Update Departments with headPositionId
    const headMapping = {
      'HR-001': 'POS-HR-MGR',
      'ENG-001': 'POS-ENG-001-HEAD',
      'SALES-001': 'POS-SALES-001-HEAD',
      'LND-001': 'POS-LND-001-HEAD',
      'FIN-001': 'POS-FIN-001-HEAD',
      'LIB-001': 'POS-LIB-001-HEAD',
      'OPS-001-INACTIVE': 'POS-OPS-001-INACTIVE-HEAD',
      'TEST-001': 'POS-TEST-HEAD',
    };

    for (const [deptCode, posCode] of Object.entries(headMapping)) {
      const position = await Position.findOne({ code: posCode });
      await Department.updateOne(
        { code: deptCode },
        { headPositionId: position._id },
      );
    }
    console.log('✓ Updated department head positions');

    // 4. Create Position Assignments
    const assignments = [
      {
        employeeEmail: 'alice@company.com',
        positionCode: 'POS-HR-MGR',
        departmentCode: 'HR-001',
        startDate: new Date('2020-01-01'),
      },
      {
        employeeEmail: 'bob@company.com',
        positionCode: 'POS-ACC',
        departmentCode: 'FIN-001',
        startDate: new Date('2021-05-15'),
      },
      {
        employeeEmail: 'charlie@company.com',
        positionCode: 'POS-SALES-REP',
        departmentCode: 'SALES-001',
        startDate: new Date('2022-03-10'),
      },
      {
        employeeEmail: 'diana@company.com',
        positionCode: 'POS-SENIOR-SWE',
        departmentCode: 'ENG-001',
        startDate: new Date('2019-07-01'),
      },
      {
        employeeEmail: 'george@company.com',
        positionCode: 'POS-HR-GEN',
        departmentCode: 'HR-001',
        startDate: new Date('2010-02-15'),
      },
      {
        employeeEmail: 'tariq.ta@company.com',
        positionCode: 'POS-TA',
        departmentCode: 'LND-001',
        startDate: new Date('2025-04-05'),
      },
      {
        employeeEmail: 'laila.la@company.com',
        positionCode: 'POS-LA',
        departmentCode: 'LND-001',
        startDate: new Date('2025-04-10'),
      },
      {
        employeeEmail: 'paula@company.com',
        positionCode: 'POS-ACC',
        departmentCode: 'FIN-001',
        startDate: new Date('2024-12-01'),
      },
      {
        employeeEmail: 'amir.accountant@company.com',
        positionCode: 'POS-ACC',
        departmentCode: 'FIN-001',
        startDate: new Date('2025-04-15'),
      },
      {
        employeeEmail: 'salma.librarian@company.com',
        positionCode: 'POS-LIB',
        departmentCode: 'LIB-001',
        startDate: new Date('2025-04-20'),
      },
      {
        employeeEmail: 'tess.headley@company.com',
        positionCode: 'POS-TEST-HEAD',
        departmentCode: 'TEST-001',
        startDate: new Date('2025-05-01'),
      },
      {
        employeeEmail: 'evan.tester@company.com',
        positionCode: 'POS-TEST-EMP',
        departmentCode: 'TEST-001',
        startDate: new Date('2025-05-02'),
      },
    ];

    const createdAssignments = await PositionAssignment.insertMany(assignments);
    console.log(`✓ Created ${createdAssignments.length} position assignments`);

    // 5. Create Structure Change Request
    const changeRequest = await StructureChangeRequest.create({
      requestNumber: 'SCR-2025-001',
      type: 'NEW_POSITION',
      targetDepartment: 'SALES-001',
      requestedBy: 'alice@company.com',
      submittedBy: 'alice@company.com',
      status: 'SUBMITTED',
      details: 'Create a Sales Lead position',
    });
    console.log('✓ Created structure change request');

    // 6. Create Structure Approval
    await StructureApproval.create({
      changeRequestId: 'SCR-2025-001',
      approverEmployeeId: 'bob@company.com',
      decision: 'PENDING',
      comments: 'Pending finance alignment',
    });
    console.log('✓ Created structure approval');

    // 7. Create Structure Change Log
    await StructureChangeLog.create({
      action: 'CREATED',
      entityType: 'Position',
      entityId: 'POS-SALES-REP',
      performedBy: 'alice@company.com',
      summary: 'Requested upgrade for Sales Representative track',
      beforeSnapshot: { title: 'Sales Representative', dept: 'SALES-001' },
      afterSnapshot: { title: 'Sales Lead', dept: 'SALES-001' },
    });
    console.log('✓ Created structure change log');

    console.log('\n=== Organization Structure Seed Complete ===\n');
  } catch (error) {
    console.error('✗ Seed Error:', error);
    throw error;
  }
};

// Execute
const run = async () => {
  await connectDB();
  await seedOrganizationStructure();
  await mongoose.connection.close();
  console.log('✓ Database connection closed');
  process.exit(0);
};

run();
