const express = require('express');
const router = express.Router();
const { loginEmployee } = require('../controllers/employeeAuthController');
const { loginLimiter } = require('../middleware/rateLimiter');

router.post('/login', loginLimiter, loginEmployee);

module.exports = router;
