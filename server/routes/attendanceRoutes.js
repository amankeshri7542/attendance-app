const express = require('express');
const router = express.Router();
const { markAttendance, getAttendance, getAttendanceHistory } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

const { attendanceLimiter } = require('../middleware/rateLimiter');
const { validateAttendance, validate } = require('../middleware/validators');

router.post('/', attendanceLimiter, validateAttendance, validate, markAttendance); // Public for wrappers/app (with internal security checks like geofence)
router.get('/', protect, getAttendance); // Protected for Admin
router.get('/history', getAttendanceHistory); // Public for Employee App (filtered by employeeId query param)

module.exports = router;
