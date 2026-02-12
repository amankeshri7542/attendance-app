const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { isWithinGeofence } = require('../utils/geofence');

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Public (Employee App)
const markAttendance = async (req, res) => {
    const { employeeId, type = 'IN', qrCodeId } = req.body;

    // Support both { location: { lat, lng } } and { lat, lng } formats
    const lat = req.body.lat ?? req.body.location?.lat;
    const lng = req.body.lng ?? req.body.location?.lng;

    if (!employeeId || lat == null || lng == null) {
        return res.status(400).json({ message: 'employeeId, lat, and lng are required' });
    }

    // Verify employee exists and is active
    try {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        if (!employee.isActive) {
            return res.status(403).json({ message: 'Employee account is deactivated' });
        }
    } catch (err) {
        return res.status(400).json({ message: 'Invalid employee ID' });
    }

    // Validate Geofence
    const officeLat = parseFloat(process.env.OFFICE_LAT);
    const officeLng = parseFloat(process.env.OFFICE_LNG);

    if (!officeLat || !officeLng) {
        return res.status(500).json({ message: 'Office location not configured' });
    }

    if (!isWithinGeofence(lat, lng, officeLat, officeLng)) {
        console.warn(`[BLOCKED] Geofence violation for Employee: ${employeeId}, Location: ${lat}, ${lng}`);
        return res.status(400).json({ message: 'You are not within the office premises.' });
    }

    // Check for duplicate scan (last 2 minutes)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const existingRecord = await Attendance.findOne({
        employeeId,
        createdAt: { $gte: twoMinutesAgo }
    });

    if (existingRecord) {
        console.warn(`[BLOCKED] Duplicate scan for Employee: ${employeeId} within 2 minutes.`);
        return res.status(400).json({ message: 'Duplicate scan. Please wait 2 minutes.' });
    }

    // Calculate Late Status
    // Rule: Shop opens 7:00 AM. Late after 9:30 AM.
    const now = new Date();
    let status = 'Present';
    let isLate = false;

    // Check if check-in time is after 9:30 AM
    const lateThreshold = new Date(now);
    lateThreshold.setHours(9, 30, 0, 0);

    if (type === 'IN' && now > lateThreshold) {
        status = 'Late';
        isLate = true;
    }

    // Create attendance record
    try {
        const attendance = await Attendance.create({
            employeeId,
            type,
            location: { lat, lng },
            qrCodeId: qrCodeId || 'MANUAL',
            status,
            isLate
        });
        res.status(201).json(attendance);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid attendance data', error: error.message });
    }
};

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private (Admin)
const getAttendance = async (req, res) => {
    try {
        const { date, employeeId } = req.query;
        let query = {};

        if (employeeId) {
            query.employeeId = employeeId;
        }

        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            query.createdAt = { $gte: startDate, $lte: endDate };
        }

        const attendance = await Attendance.find(query)
            .populate('employeeId', 'name empId department')
            .sort({ createdAt: -1 });

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get attendance history for an employee (Public/Employee App)
// @route   GET /api/attendance/history
const getAttendanceHistory = async (req, res) => {
    try {
        const { employeeId } = req.query;
        if (!employeeId) {
            return res.status(400).json({ message: 'Employee ID is required' });
        }

        const history = await Attendance.find({ employeeId })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 records

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { markAttendance, getAttendance, getAttendanceHistory };
