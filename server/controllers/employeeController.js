const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private (Admin)
const getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find().select('-pinHash').sort({ empId: 1 });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Private (Admin)
const createEmployee = async (req, res) => {
    const { name, empId, department, pin } = req.body;

    if (!name || !empId || !department || !pin) {
        return res.status(400).json({ message: 'All fields are required (name, empId, department, pin)' });
    }

    try {
        const exists = await Employee.findOne({ empId });
        if (exists) {
            return res.status(400).json({ message: 'Employee ID already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const pinHash = await bcrypt.hash(pin, salt);

        const employee = await Employee.create({ name, empId, department, pinHash });

        res.status(201).json({
            _id: employee._id,
            name: employee.name,
            empId: employee.empId,
            department: employee.department,
            isActive: employee.isActive
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Failed to create employee', error: error.message });
    }
};

// @desc    Toggle employee active status
// @route   PUT /api/employees/:id/toggle
// @access  Private (Admin)
const toggleEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        employee.isActive = !employee.isActive;
        await employee.save();

        res.json({
            _id: employee._id,
            name: employee.name,
            empId: employee.empId,
            isActive: employee.isActive
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update employee (Name, Dept, PIN)
// @route   PUT /api/employees/:id
// @access  Private (Admin)
const updateEmployee = async (req, res) => {
    const { name, empId, department, pin } = req.body;

    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        if (name) employee.name = name;
        if (empId) employee.empId = empId;
        if (department) employee.department = department;

        if (pin) {
            const salt = await bcrypt.genSalt(10);
            employee.pinHash = await bcrypt.hash(pin, salt);
        }

        await employee.save();

        res.json({
            _id: employee._id,
            name: employee.name,
            empId: employee.empId,
            department: employee.department,
            isActive: employee.isActive
        });
    } catch (error) {
        res.status(400).json({ message: 'Update failed', error: error.message });
    }
};

module.exports = { getEmployees, createEmployee, toggleEmployee, updateEmployee };
