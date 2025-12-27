// seedRecruitment.js
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
const jobTemplateSchema = new mongoose.Schema({
  title: String,
  department: String,
  qualifications: [String],
  skills: [String],
  description: String,
  createdAt: { type: Date, default: Date.now },
});

const jobRequisitionSchema = new mongoose.Schema({
  requisitionId: { type: String, unique: true },
  templateId: String,
  openings: Number,
  location: String,
  hiringManagerId: String,
  publishStatus: { type: String, enum: ['draft', 'published', 'closed'] },
  postingDate: Date,
  createdAt: { type: Date, default: Date.now },
});

const candidateSchema = new mongoose.Schema({
  candidateNumber: { type: String, unique: true },
  fullName: String,
  nationalId: String,
  personalEmail: String,
  mobilePhone: String,
  departmentId: String,
  positionId: String,
  status: {
    type: String,
    enum: ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED'],
  },
  applicationDate: Date,
  resumeUrl: String,
  notes: String,
  createdAt: { type: Date, default: Date.now },
});

const applicationSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
  requisitionId: String,
  currentStage: {
    type: String,
    enum: ['SCREENING', 'HR_INTERVIEW', 'TECHNICAL', 'FINAL', 'OFFER'],
  },
  status: {
    type: String,
    enum: ['SUBMITTED', 'IN_PROCESS', 'REJECTED', 'ACCEPTED'],
  },
  createdAt: { type: Date, default: Date.now },
});

const applicationStatusHistorySchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
  oldStage: String,
  newStage: String,
  oldStatus: String,
  newStatus: String,
  changedBy: String,
  createdAt: { type: Date, default: Date.now },
});

const interviewSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
  stage: String,
  scheduledDate: Date,
  method: { type: String, enum: ['IN_PERSON', 'VIDEO', 'PHONE'] },
  panel: [String],
  videoLink: String,
  status: { type: String, enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'] },
  createdAt: { type: Date, default: Date.now },
});

const assessmentResultSchema = new mongoose.Schema({
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
  interviewerId: String,
  score: Number,
  comments: String,
  createdAt: { type: Date, default: Date.now },
});

const referralSchema = new mongoose.Schema({
  referringEmployeeId: String,
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
  role: String,
  level: String,
  createdAt: { type: Date, default: Date.now },
});

const documentSchema = new mongoose.Schema({
  ownerId: String,
  type: { type: String, enum: ['CV', 'CONTRACT', 'ID', 'CERTIFICATE'] },
  filePath: String,
  uploadedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

const offerSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
  hrEmployeeId: String,
  grossSalary: Number,
  signingBonus: Number,
  benefits: [String],
  role: String,
  deadline: Date,
  applicantResponse: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED'],
  },
  approvers: [
    {
      employeeId: String,
      role: String,
      status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'] },
      actionDate: Date,
    },
  ],
  finalStatus: {
    type: String,
    enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'],
  },
  candidateSignedAt: Date,
  hrSignedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

const contractSchema = new mongoose.Schema({
  offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
  acceptanceDate: Date,
  grossSalary: Number,
  signingBonus: Number,
  role: String,
  benefits: [String],
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  employeeSignedAt: Date,
  employerSignedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

const onboardingSchema = new mongoose.Schema({
  employeeId: String,
  contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
  tasks: [
    {
      taskName: String,
      responsibleDepartment: String,
      status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'] },
      deadline: Date,
      completedAt: Date,
      documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const terminationRequestSchema = new mongoose.Schema({
  employeeId: String,
  initiator: { type: String, enum: ['EMPLOYEE', 'HR', 'MANAGER'] },
  reason: String,
  hrComments: String,
  status: {
    type: String,
    enum: ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
  },
  terminationDate: Date,
  contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
  createdAt: { type: Date, default: Date.now },
});

const clearanceChecklistSchema = new mongoose.Schema({
  terminationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TerminationRequest',
  },
  items: [
    {
      department: String,
      status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'] },
      updatedBy: String,
      updatedAt: Date,
    },
  ],
  equipmentList: [
    {
      name: String,
      returned: Boolean,
      condition: String,
    },
  ],
  cardReturned: Boolean,
  createdAt: { type: Date, default: Date.now },
});

// Models
const JobTemplate = mongoose.model('JobTemplate', jobTemplateSchema);
const JobRequisition = mongoose.model('JobRequisition', jobRequisitionSchema);
const Candidate = mongoose.model('Candidate', candidateSchema);
const Application = mongoose.model('Application', applicationSchema);
const ApplicationStatusHistory = mongoose.model(
  'ApplicationStatusHistory',
  applicationStatusHistorySchema,
);
const Interview = mongoose.model('Interview', interviewSchema);
const AssessmentResult = mongoose.model(
  'AssessmentResult',
  assessmentResultSchema,
);
const Referral = mongoose.model('Referral', referralSchema);
const Document = mongoose.model('Document', documentSchema);
const Offer = mongoose.model('Offer', offerSchema);
const Contract = mongoose.model('Contract', contractSchema);
const Onboarding = mongoose.model('Onboarding', onboardingSchema);
const TerminationRequest = mongoose.model(
  'TerminationRequest',
  terminationRequestSchema,
);
const ClearanceChecklist = mongoose.model(
  'ClearanceChecklist',
  clearanceChecklistSchema,
);

const seedRecruitment = async () => {
  try {
    console.log('\n=== Starting Recruitment Seed ===\n');

    await JobTemplate.deleteMany({});
    await JobRequisition.deleteMany({});
    await Candidate.deleteMany({});
    await Application.deleteMany({});
    await ApplicationStatusHistory.deleteMany({});
    await Interview.deleteMany({});
    await AssessmentResult.deleteMany({});
    await Referral.deleteMany({});
    await Document.deleteMany({});
    await Offer.deleteMany({});
    await Contract.deleteMany({});
    await Onboarding.deleteMany({});
    await TerminationRequest.deleteMany({});
    await ClearanceChecklist.deleteMany({});

    // 1. Job Templates
    const templates = [
      {
        title: 'Software Engineer',
        department: 'Engineering',
        qualifications: ['BS in Computer Science'],
        skills: ['Node.js', 'TypeScript', 'MongoDB'],
        description: 'Develop and maintain software applications.',
      },
      {
        title: 'HR Manager',
        department: 'Human Resources',
        qualifications: ['BA in Human Resources'],
        skills: ['Communication', 'Labor Law'],
        description: 'Manage HR operations.',
      },
    ];
    const createdTemplates = await JobTemplate.insertMany(templates);
    console.log(`✓ Created ${createdTemplates.length} job templates`);

    // 2. Job Requisition
    await JobRequisition.create({
      requisitionId: 'REQ-001',
      templateId: 'Software Engineer',
      openings: 2,
      location: 'Cairo',
      hiringManagerId: 'alice@company.com',
      publishStatus: 'published',
      postingDate: new Date(),
    });
    console.log('✓ Created job requisition');

    // 3. Candidates
    const candidates = [
      {
        candidateNumber: 'CAND-001',
        fullName: 'John Doe',
        nationalId: 'NAT-JOHN-001',
        personalEmail: 'john.doe@example.com',
        mobilePhone: '1234567890',
        departmentId: 'ENG-001',
        positionId: 'POS-SWE',
        status: 'SCREENING',
        resumeUrl: 'http://example.com/resume.pdf',
        notes: 'Referred by Bob for SWE role.',
      },
      {
        candidateNumber: 'CAND-002',
        fullName: 'Sara Kim',
        nationalId: 'NAT-SARA-002',
        personalEmail: 'sara.kim@example.com',
        mobilePhone: '9876543210',
        departmentId: 'HR-001',
        positionId: 'POS-HR-MGR',
        status: 'APPLIED',
        resumeUrl: 'http://example.com/resume-sara-kim.pdf',
        notes: 'HR generalist with policy experience.',
      },
      {
        candidateNumber: 'CAND-003',
        fullName: 'Omar Nasser',
        nationalId: 'NAT-OMAR-003',
        personalEmail: 'omar.nasser@example.com',
        mobilePhone: '5554443333',
        departmentId: 'SALES-001',
        positionId: 'POS-SALES-REP',
        status: 'INTERVIEW',
        applicationDate: new Date('2025-01-10'),
        resumeUrl: 'http://example.com/resume-omar-nasser.pdf',
        notes: 'SaaS sales background; pipeline-focused.',
      },
    ];
    const createdCandidates = await Candidate.insertMany(candidates);
    console.log(`✓ Created ${createdCandidates.length} candidates`);

    // 4. Application
    const application = await Application.create({
      candidateId: createdCandidates[0]._id,
      requisitionId: 'REQ-001',
      currentStage: 'SCREENING',
      status: 'SUBMITTED',
    });
    console.log('✓ Created application');

    // 5. Application Status History
    await ApplicationStatusHistory.create({
      applicationId: application._id,
      oldStage: 'SCREENING',
      newStage: 'HR_INTERVIEW',
      oldStatus: 'SUBMITTED',
      newStatus: 'IN_PROCESS',
      changedBy: 'alice@company.com',
    });
    console.log('✓ Created application status history');

    // 6. Interview
    const interview = await Interview.create({
      applicationId: application._id,
      stage: 'HR_INTERVIEW',
      scheduledDate: new Date('2025-02-10T10:00:00Z'),
      method: 'VIDEO',
      panel: ['alice@company.com'],
      videoLink: 'https://meet.example.com/interview-001',
      status: 'COMPLETED',
    });
    console.log('✓ Created interview');

    // 7. Assessment Result
    await AssessmentResult.create({
      interviewId: interview._id,
      interviewerId: 'alice@company.com',
      score: 4.5,
      comments: 'Strong technical depth and communication.',
    });
    console.log('✓ Created assessment result');

    // 8. Referral
    await Referral.create({
      referringEmployeeId: 'bob@company.com',
      candidateId: createdCandidates[0]._id,
      role: 'Software Engineer',
      level: 'Mid-level',
    });
    console.log('✓ Created referral');

    // 9. Documents
    const resumeDoc = await Document.create({
      ownerId: 'bob@company.com',
      type: 'CV',
      filePath: '/docs/candidates/john-doe-cv.pdf',
      uploadedAt: new Date('2025-01-05'),
    });
    const contractDoc = await Document.create({
      ownerId: 'alice@company.com',
      type: 'CONTRACT',
      filePath: '/docs/contracts/john-doe-2025.pdf',
      uploadedAt: new Date('2025-02-12'),
    });
    console.log('✓ Created documents');

    // 10. Offer
    const offer = await Offer.create({
      applicationId: application._id,
      candidateId: createdCandidates[0]._id,
      hrEmployeeId: 'alice@company.com',
      grossSalary: 18000,
      signingBonus: 3000,
      benefits: ['Medical', 'Stock Options'],
      role: 'Software Engineer',
      deadline: new Date('2025-02-20'),
      applicantResponse: 'ACCEPTED',
      approvers: [
        {
          employeeId: 'alice@company.com',
          role: 'HR Manager',
          status: 'APPROVED',
          actionDate: new Date('2025-02-11'),
        },
      ],
      finalStatus: 'APPROVED',
      candidateSignedAt: new Date('2025-02-12'),
      hrSignedAt: new Date('2025-02-12'),
    });
    console.log('✓ Created offer');

    // 11. Contract
    const contract = await Contract.create({
      offerId: offer._id,
      acceptanceDate: new Date('2025-02-12'),
      grossSalary: 18000,
      signingBonus: 3000,
      role: 'Software Engineer',
      benefits: ['Medical', 'Stock Options'],
      documentId: contractDoc._id,
      employeeSignedAt: new Date('2025-02-12'),
      employerSignedAt: new Date('2025-02-12'),
    });
    console.log('✓ Created contract');

    // 12. Onboarding
    await Onboarding.create({
      employeeId: 'bob@company.com',
      contractId: contract._id,
      tasks: [
        {
          taskName: 'Submit documents',
          responsibleDepartment: 'HR',
          status: 'COMPLETED',
          deadline: new Date('2025-02-20'),
          completedAt: new Date('2025-02-15'),
          documentId: resumeDoc._id,
        },
        {
          taskName: 'IT setup',
          responsibleDepartment: 'IT',
          status: 'IN_PROGRESS',
          deadline: new Date('2025-02-25'),
        },
      ],
    });
    console.log('✓ Created onboarding');

    // 13. Termination Request
    const terminationRequest = await TerminationRequest.create({
      employeeId: 'charlie@company.com',
      initiator: 'HR',
      reason: 'Performance issues',
      hrComments: 'Eligible for partial benefits',
      status: 'UNDER_REVIEW',
      terminationDate: new Date('2025-03-15'),
      contractId: contract._id,
    });
    console.log('✓ Created termination request');

    // 14. Clearance Checklist
    await ClearanceChecklist.create({
      terminationId: terminationRequest._id,
      items: [
        { department: 'IT', status: 'PENDING' },
        {
          department: 'Finance',
          status: 'APPROVED',
          updatedBy: 'alice@company.com',
          updatedAt: new Date('2025-03-10'),
        },
      ],
      equipmentList: [
        {
          name: 'Laptop',
          returned: true,
          condition: 'Good',
        },
      ],
      cardReturned: false,
    });
    console.log('✓ Created clearance checklist');

    console.log('\n=== Recruitment Seed Complete ===\n');
  } catch (error) {
    console.error('✗ Seed Error:', error);
    throw error;
  }
};

const run = async () => {
  await connectDB();
  await seedRecruitment();
  await mongoose.connection.close();
  console.log('✓ Database connection closed');
  process.exit(0);
};

run();
