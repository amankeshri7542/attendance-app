const { check, validationResult } = require('express-validator');

const validateLogin = [
    check('username', 'Username is required').not().isEmpty(),
    check('password', 'Password is required').not().isEmpty(),
];

const validateAttendance = [
    check('employeeId', 'Employee ID is required').not().isEmpty(),
    check('qrCodeId', 'QR Code ID is required').not().isEmpty(),
    check('type', 'Type must be IN or OUT').isIn(['IN', 'OUT']),
    check('location.lat', 'Latitude is required').isNumeric(),
    check('location.lng', 'Longitude is required').isNumeric(),
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = { validateLogin, validateAttendance, validate };
