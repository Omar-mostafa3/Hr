// seedTimeManagement.js
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
const shiftTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const shiftSchema = new mongoose.Schema({
  name: { type: String, required: true },
  shiftType: String,
  startTime: String,
  endTime: String,
  punchPolicy: {
    type: String,
    enum: ['FIRST_LAST', 'ALL_PUNCHES'],
    default: 'FIRST_LAST',
  },
  graceInMinutes: Number,
  graceOutMinutes: Number,
  requiresApprovalForOvertime: Boolean,
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const holidaySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['NATIONAL', 'RELIGIOUS', 'COMPANY'],
    required: true,
  },
  startDate: Date,
  name: String,
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const shiftAssignmentSchema = new mongoose.Schema({
  employeeEmail: String,
  shiftName: String,
  startDate: Date,
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  },
  createdAt: { type: Date, default: Date.now },
});

const attendanceRecordSchema = new mongoose.Schema({
  employeeEmail: String,
  date: Date,
  punches: [
    {
      type: { type: String, enum: ['IN', 'OUT'] },
      timestamp: Date,
    },
  ],
  totalWorkMinutes: Number,
  hasMissedPunch: { type: Boolean, default: false },
  finalisedForPayroll: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const ShiftType = mongoose.model('ShiftType', shiftTypeSchema);
const Shift = mongoose.model('Shift', shiftSchema);
const Holiday = mongoose.model('Holiday', holidaySchema);
const ShiftAssignment = mongoose.model(
  'ShiftAssignment',
  shiftAssignmentSchema,
);
const AttendanceRecord = mongoose.model(
  'AttendanceRecord',
  attendanceRecordSchema,
);

const seedTimeManagement = async () => {
  try {
    console.log('\n=== Starting Time Management Seed ===\n');

    await ShiftType.deleteMany({});
    await Shift.deleteMany({});
    await Holiday.deleteMany({});
    await ShiftAssignment.deleteMany({});
    await AttendanceRecord.deleteMany({});

    // 1. Shift Type
    await ShiftType.create({
      name: 'Morning Shift',
      active: true,
    });
    console.log('✓ Created shift type');

    // 2. Shifts
    const shifts = [
      {
        name: 'Standard Morning (9-5)',
        shiftType: 'Morning Shift',
        startTime: '09:00',
        endTime: '17:00',
        punchPolicy: 'FIRST_LAST',
        graceInMinutes: 15,
        graceOutMinutes: 15,
        requiresApprovalForOvertime: true,
        active: true,
      },
      {
        name: 'SW@Standard Day (9-5)',
        shiftType: 'Morning Shift',
        startTime: '09:00',
        endTime: '17:00',
        punchPolicy: 'FIRST_LAST',
        graceInMinutes: 15,
        graceOutMinutes: 15,
        requiresApprovalForOvertime: true,
        active: true,
      },
    ];

    await Shift.insertMany(shifts);
    console.log(`✓ Created ${shifts.length} shifts`);

    // 3. Holiday
    await Holiday.create({
      type: 'NATIONAL',
      startDate: new Date('2025-01-01'),
      name: 'New Year',
      active: true,
    });
    console.log('✓ Created holiday');

    // 4. Shift Assignments
    const assignments = [
      {
        employeeEmail: 'lina@company.com',
        shiftName: 'SW@Standard Day (9-5)',
        startDate: new Date('2025-12-01'),
        status: 'APPROVED',
      },
      {
        employeeEmail: 'charlie@company.com',
        shiftName: 'Standard Morning (9-5)',
        startDate: new Date('2025-12-01'),
        status: 'APPROVED',
      },
    ];

    await ShiftAssignment.insertMany(assignments);
    console.log(`✓ Created ${assignments.length} shift assignments`);

    // 5. Attendance Records
    const attendanceRecords = [];

    // Charlie's attendance (Dec 1-10, 2025)
    const charlieDates = [
      { date: new Date('2025-12-01'), hasFullDay: true },
      { date: new Date('2025-12-02'), hasFullDay: true },
      { date: new Date('2025-12-03'), hasFullDay: true },
      { date: new Date('2025-12-04'), hasFullDay: true },
      { date: new Date('2025-12-05'), hasFullDay: false }, // Half day
      { date: new Date('2025-12-06'), hasFullDay: false, absent: true },
      { date: new Date('2025-12-07'), hasFullDay: false, absent: true },
      { date: new Date('2025-12-08'), hasFullDay: false, absent: true },
      { date: new Date('2025-12-09'), hasFullDay: false, absent: true },
      { date: new Date('2025-12-10'), hasFullDay: false, absent: true },
    ];

    charlieDates.forEach(({ date, hasFullDay, absent }) => {
      const record = {
        employeeEmail: 'charlie@company.com',
        date: date,
        punches: [],
        totalWorkMinutes: 0,
        hasMissedPunch: absent || false,
        finalisedForPayroll: true,
      };

      if (!absent) {
        const inTime = new Date(date);
        inTime.setUTCHours(9, 0, 0, 0);

        const outTime = new Date(date);
        outTime.setUTCHours(hasFullDay ? 17 : 13, 0, 0, 0);

        record.punches = [
          { type: 'IN', timestamp: inTime },
          { type: 'OUT', timestamp: outTime },
        ];
        record.totalWorkMinutes = hasFullDay ? 480 : 240;
      }

      attendanceRecords.push(record);
    });

    // Lina's attendance (Dec 1-10, 2025 - all full days)
    for (let day = 1; day <= 10; day++) {
      const date = new Date(`2025-12-${day.toString().padStart(2, '0')}`);
      const inTime = new Date(date);
      inTime.setUTCHours(9, 0, 0, 0);

      const outTime = new Date(date);
      outTime.setUTCHours(17, 0, 0, 0);

      attendanceRecords.push({
        employeeEmail: 'lina@company.com',
        date: date,
        punches: [
          { type: 'IN', timestamp: inTime },
          { type: 'OUT', timestamp: outTime },
        ],
        totalWorkMinutes: 480,
        hasMissedPunch: false,
        finalisedForPayroll: true,
      });
    }

    await AttendanceRecord.insertMany(attendanceRecords);
    console.log(`✓ Created ${attendanceRecords.length} attendance records`);

    console.log('\n=== Time Management Seed Complete ===\n');
  } catch (error) {
    console.error('✗ Seed Error:', error);
    throw error;
  }
};

const run = async () => {
  await connectDB();
  await seedTimeManagement();
  await mongoose.connection.close();
  console.log('✓ Database connection closed');
  process.exit(0);
};

run();
