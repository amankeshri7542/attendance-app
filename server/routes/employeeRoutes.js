const express = require('express');
const router = express.Router();
const { getEmployees, createEmployee, toggleEmployee, updateEmployee } = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getEmployees);
router.post('/', protect, createEmployee);
router.put('/:id/toggle', protect, toggleEmployee);
router.put('/:id', protect, updateEmployee);

module.exports = router;
