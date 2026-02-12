const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Employee = require('./models/Employee');
const Attendance = require('./models/Attendance');

dotenv.config();

const employees = [
    { name: 'Raju Kumar', empId: 'EMP001', department: 'Operations' },
    { name: 'Arun Kumar', empId: 'EMP002', department: 'Operations' },
    { name: 'Lalan Pandey', empId: 'EMP003', department: 'Operations' },
    { name: 'Ravi Kumar', empId: 'EMP004', department: 'Logistics' },
    { name: 'Gajendra Kumar', empId: 'EMP005', department: 'Logistics' },
    { name: 'Rohit Kumar', empId: 'EMP006', department: 'Sales' },
    { name: 'Navneet', empId: 'EMP007', department: 'Sales' },
];

const DEFAULT_PIN = '1234';

// Generate mock attendance for the last 7 days
function generateMockAttendance(employeeIds) {
    const records = [];
    const officeLat = parseFloat(process.env.OFFICE_LAT) || 25.5864201;
    const officeLng = parseFloat(process.env.OFFICE_LNG) || 85.1294782;

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date();
        date.setDate(date.getDate() - dayOffset);
        date.setSeconds(0, 0);

        // Random subset of employees present each day (5-7)
        const presentCount = 5 + Math.floor(Math.random() * 3);
        const shuffled = [...employeeIds].sort(() => 0.5 - Math.random());
        const presentToday = shuffled.slice(0, presentCount);

        for (const empId of presentToday) {
            // Clock IN: between 8:30 AM and 9:30 AM
            const inHour = 8 + Math.floor(Math.random() * 2);
            const inMin = Math.floor(Math.random() * 60);
            const inTime = new Date(date);
            inTime.setHours(inHour, inMin, 0, 0);

            // Small GPS jitter around office
            const jitterLat = (Math.random() - 0.5) * 0.0004;
            const jitterLng = (Math.random() - 0.5) * 0.0004;

            records.push({
                employeeId: empId,
                time: inTime,
                type: 'IN',
                location: {
                    lat: officeLat + jitterLat,
                    lng: officeLng + jitterLng
                },
                qrCodeId: 'QR-cement-shop-01',
                createdAt: inTime,
                updatedAt: inTime
            });

            // Clock OUT: between 5:00 PM and 7:00 PM (except today)
            if (dayOffset > 0) {
                const outHour = 17 + Math.floor(Math.random() * 3);
                const outMin = Math.floor(Math.random() * 60);
                const outTime = new Date(date);
                outTime.setHours(outHour, outMin, 0, 0);

                records.push({
                    employeeId: empId,
                    time: outTime,
                    type: 'OUT',
                    location: {
                        lat: officeLat + jitterLat,
                        lng: officeLng + jitterLng
                    },
                    qrCodeId: 'QR-cement-shop-01',
                    createdAt: outTime,
                    updatedAt: outTime
                });
            }
        }
    }

    return records;
}

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing data
        await Employee.deleteMany({});
        await Attendance.deleteMany({});
        console.log('Cleared existing employees and attendance');

        // Hash PIN
        const salt = await bcrypt.genSalt(10);
        const pinHash = await bcrypt.hash(DEFAULT_PIN, salt);

        // Insert employees
        const employeeDocs = employees.map(emp => ({ ...emp, pinHash }));
        const created = await Employee.insertMany(employeeDocs);

        console.log(`\n✅ ${created.length} employees seeded (PIN: ${DEFAULT_PIN})\n`);
        created.forEach(emp => {
            console.log(`  ${emp.empId} — ${emp.name} (${emp.department})`);
        });

        // Generate and insert mock attendance
        const empIds = created.map(e => e._id);
        const mockRecords = generateMockAttendance(empIds);
        await Attendance.insertMany(mockRecords);

        console.log(`\n✅ ${mockRecords.length} mock attendance records created (last 7 days)\n`);
        console.log('📌 Next: Run node generateQR.js\n');

        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
