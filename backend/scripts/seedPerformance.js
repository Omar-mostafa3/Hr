// seedPerformance.js
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
const appraisalTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ['ANNUAL', 'SEMI_ANNUAL', 'PROBATIONARY', 'PROJECT', 'AD_HOC'],
  },
  active: { type: Boolean, default: true },
  ratingScale: {
    type: { type: String, enum: ['FIVE_POINT', 'THREE_POINT', 'TEN_POINT'] },
    min: Number,
    max: Number,
    step: Number,
    labels: [String],
  },
  criteria: [
    {
      key: String,
      title: String,
      weight: Number,
      required: Boolean,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const appraisalCycleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['ANNUAL', 'SEMI_ANNUAL', 'PROBATIONARY', 'PROJECT', 'AD_HOC'],
  },
  status: {
    type: String,
    enum: ['PLANNED', 'ACTIVE', 'CLOSED', 'ARCHIVED'],
    default: 'PLANNED',
  },
  startDate: Date,
  endDate: Date,
  publishedAt: Date,
  closedAt: Date,
  archivedAt: Date,
  templateAssignments: [
    {
      department: String,
      template: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const appraisalAssignmentSchema = new mongoose.Schema({
  employeeEmail: String,
  managerEmail: String,
  cycleId: { type: mongoose.Schema.Types.ObjectId, ref: 'AppraisalCycle' },
  templateName: String,
  department: String,
  position: String,
  status: {
    type: String,
    enum: [
      'NOT_STARTED',
      'IN_PROGRESS',
      'SUBMITTED',
      'PUBLISHED',
      'ACKNOWLEDGED',
    ],
    default: 'NOT_STARTED',
  },
  assignedDate: Date,
  dueDate: Date,
  submittedAt: Date,
  publishedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

const appraisalRecordSchema = new mongoose.Schema({
  employeeEmail: String,
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AppraisalAssignment',
  },
  cycleId: { type: mongoose.Schema.Types.ObjectId, ref: 'AppraisalCycle' },
  templateName: String,
  status: {
    type: String,
    enum: ['DRAFT', 'MANAGER_SUBMITTED', 'HR_PUBLISHED', 'ARCHIVED'],
    default: 'DRAFT',
  },
  ratings: [
    {
      criterionKey: String,
      ratingValue: Number,
      ratingLabel: String,
      weightedScore: Number,
    },
  ],
  totalScore: Number,
  overallRating: String,
  managerSummary: String,
  strengths: [String],
  areasForImprovement: [String],
  managerSubmittedAt: Date,
  hrPublishedAt: Date,
  publishedBy: String,
  employeeViewedAt: Date,
  acknowledgedAt: Date,
  archivedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

const appraisalDisputeSchema = new mongoose.Schema({
  appraisalId: { type: mongoose.Schema.Types.ObjectId, ref: 'AppraisalRecord' },
  employeeEmail: String,
  reason: String,
  status: {
    type: String,
    enum: ['OPEN', 'UNDER_REVIEW', 'ADJUSTED', 'REJECTED'],
    default: 'OPEN',
  },
  assignedReviewer: String,
  resolvedAt: Date,
  resolvedBy: String,
  resolutionSummary: String,
  createdAt: { type: Date, default: Date.now },
});

const AppraisalTemplate = mongoose.model(
  'AppraisalTemplate',
  appraisalTemplateSchema,
);
const AppraisalCycle = mongoose.model('AppraisalCycle', appraisalCycleSchema);
const AppraisalAssignment = mongoose.model(
  'AppraisalAssignment',
  appraisalAssignmentSchema,
);
const AppraisalRecord = mongoose.model(
  'AppraisalRecord',
  appraisalRecordSchema,
);
const AppraisalDispute = mongoose.model(
  'AppraisalDispute',
  appraisalDisputeSchema,
);

const seedPerformance = async () => {
  try {
    console.log('\n=== Starting Performance Seed ===\n');

    await AppraisalTemplate.deleteMany({});
    await AppraisalCycle.deleteMany({});
    await AppraisalAssignment.deleteMany({});
    await AppraisalRecord.deleteMany({});
    await AppraisalDispute.deleteMany({});

    // 1. Appraisal Templates
    const templates = [
      {
        name: 'Annual Review Template 2025',
        type: 'ANNUAL',
        active: true,
        ratingScale: {
          type: 'FIVE_POINT',
          min: 1,
          max: 5,
          step: 1,
          labels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
        },
        criteria: [
          { key: 'integrity', title: 'Integrity', weight: 30, required: true },
          { key: 'teamwork', title: 'Teamwork', weight: 30, required: true },
          {
            key: 'goal_achievement',
            title: 'Goal Achievement',
            weight: 40,
            required: true,
          },
        ],
      },
      {
        name: 'Semi-Annual Review Template 2025',
        type: 'SEMI_ANNUAL',
        active: true,
        ratingScale: {
          type: 'THREE_POINT',
          min: 1,
          max: 3,
          step: 1,
          labels: ['Below Expectations', 'Meets', 'Exceeds'],
        },
        criteria: [
          {
            key: 'collaboration',
            title: 'Collaboration',
            weight: 50,
            required: true,
          },
          { key: 'delivery', title: 'Delivery', weight: 50, required: true },
        ],
      },
      {
        name: 'Probationary Review Template',
        type: 'PROBATIONARY',
        active: true,
        ratingScale: {
          type: 'TEN_POINT',
          min: 1,
          max: 10,
          step: 1,
          labels: [],
        },
        criteria: [
          {
            key: 'learning_curve',
            title: 'Learning Curve',
            weight: 50,
            required: true,
          },
          {
            key: 'culture_fit',
            title: 'Culture Fit',
            weight: 50,
            required: true,
          },
        ],
      },
      {
        name: 'Project Review Template',
        type: 'PROJECT',
        active: true,
        ratingScale: {
          type: 'FIVE_POINT',
          min: 1,
          max: 5,
          step: 1,
          labels: [],
        },
        criteria: [
          {
            key: 'delivery_quality',
            title: 'Delivery Quality',
            weight: 60,
            required: true,
          },
          {
            key: 'stakeholder_mgmt',
            title: 'Stakeholder Management',
            weight: 40,
            required: true,
          },
        ],
      },
      {
        name: 'Ad Hoc Review Template',
        type: 'AD_HOC',
        active: true,
        ratingScale: {
          type: 'THREE_POINT',
          min: 1,
          max: 3,
          step: 1,
          labels: [],
        },
        criteria: [
          {
            key: 'responsiveness',
            title: 'Responsiveness',
            weight: 50,
            required: true,
          },
          { key: 'ownership', title: 'Ownership', weight: 50, required: true },
        ],
      },
    ];

    await AppraisalTemplate.insertMany(templates);
    console.log(`✓ Created ${templates.length} appraisal templates`);

    // 2. Appraisal Cycles
    const cycles = [
      {
        name: '2025 Annual Review Cycle',
        type: 'ANNUAL',
        status: 'PLANNED',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        templateAssignments: [
          { department: 'HR-001', template: 'Annual Review Template 2025' },
          { department: 'ENG-001', template: 'Annual Review Template 2025' },
          { department: 'SALES-001', template: 'Annual Review Template 2025' },
        ],
      },
      {
        name: '2025 Midyear Cycle',
        type: 'SEMI_ANNUAL',
        status: 'ACTIVE',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-30'),
        publishedAt: new Date('2025-06-01'),
        templateAssignments: [
          {
            department: 'ENG-001',
            template: 'Semi-Annual Review Template 2025',
          },
        ],
      },
      {
        name: '2024 Probationary Cycle',
        type: 'PROBATIONARY',
        status: 'CLOSED',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-04-30'),
        closedAt: new Date('2024-05-15'),
        templateAssignments: [
          { department: 'HR-001', template: 'Probationary Review Template' },
        ],
      },
      {
        name: '2023 Project Cycle',
        type: 'PROJECT',
        status: 'ARCHIVED',
        startDate: new Date('2023-03-01'),
        endDate: new Date('2023-05-31'),
        archivedAt: new Date('2024-01-10'),
        templateAssignments: [
          { department: 'SALES-001', template: 'Project Review Template' },
        ],
      },
    ];

    const createdCycles = await AppraisalCycle.insertMany(cycles);
    console.log(`✓ Created ${createdCycles.length} appraisal cycles`);

    // Get cycle IDs for assignments
    const annualCycle = createdCycles.find(
      (c) => c.name === '2025 Annual Review Cycle',
    );
    const midyearCycle = createdCycles.find(
      (c) => c.name === '2025 Midyear Cycle',
    );
    const probationaryCycle = createdCycles.find(
      (c) => c.name === '2024 Probationary Cycle',
    );
    const projectCycle = createdCycles.find(
      (c) => c.name === '2023 Project Cycle',
    );

    // 3. Appraisal Assignments
    const assignments = [
      {
        employeeEmail: 'bob@company.com',
        managerEmail: 'alice@company.com',
        cycleId: annualCycle._id,
        templateName: 'Annual Review Template 2025',
        department: 'ENG-001',
        position: 'POS-SWE',
        status: 'PUBLISHED',
        assignedDate: new Date('2025-01-15'),
        dueDate: new Date('2025-02-28'),
      },
      {
        employeeEmail: 'charlie@company.com',
        managerEmail: 'alice@company.com',
        cycleId: annualCycle._id,
        templateName: 'Annual Review Template 2025',
        department: 'SALES-001',
        position: 'POS-SALES-REP',
        status: 'PUBLISHED',
        assignedDate: new Date('2025-01-16'),
        dueDate: new Date('2025-02-28'),
      },
      {
        employeeEmail: 'alice@company.com',
        managerEmail: 'bob@company.com',
        cycleId: annualCycle._id,
        templateName: 'Annual Review Template 2025',
        department: 'HR-001',
        position: 'POS-HR-MGR',
        status: 'PUBLISHED',
        assignedDate: new Date('2025-01-17'),
        dueDate: new Date('2025-02-28'),
      },
      {
        employeeEmail: 'bob@company.com',
        managerEmail: 'alice@company.com',
        cycleId: midyearCycle._id,
        templateName: 'Semi-Annual Review Template 2025',
        department: 'ENG-001',
        position: 'POS-SWE',
        status: 'NOT_STARTED',
        assignedDate: new Date('2025-06-02'),
        dueDate: new Date('2025-06-30'),
      },
      {
        employeeEmail: 'alice@company.com',
        managerEmail: 'bob@company.com',
        cycleId: probationaryCycle._id,
        templateName: 'Probationary Review Template',
        department: 'HR-001',
        position: 'POS-HR-MGR',
        status: 'SUBMITTED',
        assignedDate: new Date('2024-02-05'),
        dueDate: new Date('2024-04-15'),
        submittedAt: new Date('2024-04-10'),
      },
      {
        employeeEmail: 'charlie@company.com',
        managerEmail: 'alice@company.com',
        cycleId: projectCycle._id,
        templateName: 'Project Review Template',
        department: 'SALES-001',
        position: 'POS-SALES-REP',
        status: 'ACKNOWLEDGED',
        assignedDate: new Date('2023-03-05'),
        dueDate: new Date('2023-05-15'),
        submittedAt: new Date('2023-05-10'),
        publishedAt: new Date('2023-05-20'),
      },
    ];

    const createdAssignments =
      await AppraisalAssignment.insertMany(assignments);
    console.log(`✓ Created ${createdAssignments.length} appraisal assignments`);

    // 4. Appraisal Records
    const records = [
      {
        employeeEmail: 'bob@company.com',
        assignmentId: createdAssignments[0]._id,
        cycleId: annualCycle._id,
        templateName: 'Annual Review Template 2025',
        status: 'HR_PUBLISHED',
        ratings: [
          {
            criterionKey: 'integrity',
            ratingValue: 4,
            ratingLabel: 'Very Good',
            weightedScore: 1.2,
          },
          {
            criterionKey: 'teamwork',
            ratingValue: 5,
            ratingLabel: 'Excellent',
            weightedScore: 1.5,
          },
          {
            criterionKey: 'goal_achievement',
            ratingValue: 4,
            ratingLabel: 'Very Good',
            weightedScore: 1.6,
          },
        ],
        totalScore: 4.3,
        overallRating: 'Exceeds Expectations',
        managerSummary: 'Consistently delivers high-quality work.',
        strengths: ['Ownership', 'mentoring'],
        areasForImprovement: ['Document more design decisions'],
        managerSubmittedAt: new Date('2025-03-01'),
        hrPublishedAt: new Date('2025-03-05'),
        publishedBy: 'alice@company.com',
        employeeViewedAt: new Date('2025-03-06'),
        acknowledgedAt: new Date('2025-03-07'),
      },
      {
        employeeEmail: 'charlie@company.com',
        assignmentId: createdAssignments[1]._id,
        cycleId: annualCycle._id,
        templateName: 'Annual Review Template 2025',
        status: 'HR_PUBLISHED',
        ratings: [
          {
            criterionKey: 'integrity',
            ratingValue: 3,
            ratingLabel: 'Good',
            weightedScore: 0.9,
          },
          {
            criterionKey: 'teamwork',
            ratingValue: 4,
            ratingLabel: 'Very Good',
            weightedScore: 1.2,
          },
          {
            criterionKey: 'goal_achievement',
            ratingValue: 3,
            ratingLabel: 'Good',
            weightedScore: 1.2,
          },
        ],
        totalScore: 3.3,
        overallRating: 'Meets Expectations',
        managerSummary: 'Solid contributor; focus on pipeline consistency.',
        strengths: ['Client rapport'],
        areasForImprovement: ['forecasting'],
        managerSubmittedAt: new Date('2025-03-02'),
        hrPublishedAt: new Date('2025-03-06'),
        publishedBy: 'alice@company.com',
        employeeViewedAt: new Date('2025-03-07'),
        acknowledgedAt: new Date('2025-03-08'),
      },
      {
        employeeEmail: 'alice@company.com',
        assignmentId: createdAssignments[2]._id,
        cycleId: annualCycle._id,
        templateName: 'Annual Review Template 2025',
        status: 'HR_PUBLISHED',
        ratings: [
          {
            criterionKey: 'integrity',
            ratingValue: 5,
            ratingLabel: 'Excellent',
            weightedScore: 1.5,
          },
          {
            criterionKey: 'teamwork',
            ratingValue: 5,
            ratingLabel: 'Excellent',
            weightedScore: 1.5,
          },
          {
            criterionKey: 'goal_achievement',
            ratingValue: 5,
            ratingLabel: 'Excellent',
            weightedScore: 2,
          },
        ],
        totalScore: 5,
        overallRating: 'Outstanding',
        managerSummary: 'Sets the bar for leadership and delivery.',
        areasForImprovement: ['Delegate more'],
        managerSubmittedAt: new Date('2025-03-03'),
        hrPublishedAt: new Date('2025-03-07'),
        publishedBy: 'bob@company.com',
        employeeViewedAt: new Date('2025-03-08'),
        acknowledgedAt: new Date('2025-03-09'),
      },
      {
        employeeEmail: 'bob@company.com',
        assignmentId: createdAssignments[3]._id,
        cycleId: midyearCycle._id,
        templateName: 'Semi-Annual Review Template 2025',
        status: 'DRAFT',
        ratings: [],
      },
      {
        employeeEmail: 'alice@company.com',
        assignmentId: createdAssignments[4]._id,
        cycleId: probationaryCycle._id,
        templateName: 'Probationary Review Template',
        status: 'MANAGER_SUBMITTED',
        ratings: [
          {
            criterionKey: 'learning_curve',
            ratingValue: 8,
            ratingLabel: 'Strong',
          },
        ],
        managerSubmittedAt: new Date('2024-04-10'),
      },
      {
        employeeEmail: 'charlie@company.com',
        assignmentId: createdAssignments[5]._id,
        cycleId: projectCycle._id,
        templateName: 'Project Review Template',
        status: 'ARCHIVED',
        ratings: [
          {
            criterionKey: 'delivery_quality',
            ratingValue: 4,
            ratingLabel: 'Very Good',
          },
        ],
        archivedAt: new Date('2024-01-10'),
      },
    ];

    const createdRecords = await AppraisalRecord.insertMany(records);
    console.log(`✓ Created ${createdRecords.length} appraisal records`);

    // 5. Appraisal Disputes
    const disputes = [
      {
        appraisalId: createdRecords[0]._id,
        employeeEmail: 'bob@company.com',
        reason: 'Clarify weighting for goal achievement',
        status: 'OPEN',
        assignedReviewer: 'alice@company.com',
      },
      {
        appraisalId: createdRecords[4]._id,
        employeeEmail: 'alice@company.com',
        reason: 'Score clarification',
        status: 'UNDER_REVIEW',
        assignedReviewer: 'bob@company.com',
      },
      {
        appraisalId: createdRecords[5]._id,
        employeeEmail: 'charlie@company.com',
        reason: 'Archived decision dispute',
        status: 'ADJUSTED',
        resolvedAt: new Date('2024-02-01'),
        resolvedBy: 'alice@company.com',
        resolutionSummary: 'Adjusted rating after review',
      },
      {
        appraisalId: createdRecords[1]._id,
        employeeEmail: 'charlie@company.com',
        reason: 'Disagree with teamwork score',
        status: 'REJECTED',
        resolvedAt: new Date('2025-03-10'),
        resolvedBy: 'alice@company.com',
      },
    ];

    await AppraisalDispute.insertMany(disputes);
    console.log(`✓ Created ${disputes.length} appraisal disputes`);

    console.log('\n=== Performance Seed Complete ===\n');
  } catch (error) {
    console.error('✗ Seed Error:', error);
    throw error;
  }
};

const run = async () => {
  await connectDB();
  await seedPerformance();
  await mongoose.connection.close();
  console.log('✓ Database connection closed');
  process.exit(0);
};

run();
