const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');

// @desc    Employee login with empId + PIN
// @route   POST /api/employee/login
const loginEmployee = async (req, res) => {
    const { empId, pin } = req.body;

    if (!empId || !pin) {
        return res.status(400).json({ message: 'Employee ID and PIN are required' });
    }

    try {
        const employee = await Employee.findOne({ empId });

        if (!employee) {
            return res.status(401).json({ message: 'Invalid Employee ID or PIN' });
        }

        if (!employee.isActive) {
            return res.status(403).json({ message: 'Account is deactivated. Contact admin.' });
        }

        const isMatch = await bcrypt.compare(pin, employee.pinHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid Employee ID or PIN' });
        }

        res.json({
            _id: employee._id,
            employeeId: employee._id,
            empId: employee.empId,
            name: employee.name,
            department: employee.department
        });
    } catch (error) {
        console.error('Employee login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { loginEmployee };
