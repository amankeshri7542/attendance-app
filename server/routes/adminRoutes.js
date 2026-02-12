const express = require('express');
const router = express.Router();
const { loginAdmin, registerAdmin } = require('../controllers/adminController');

const { loginLimiter } = require('../middleware/rateLimiter');
const { validateLogin, validate } = require('../middleware/validators');

router.post('/login', loginLimiter, validateLogin, validate, loginAdmin);
router.post('/register', registerAdmin); // Optional: for initial setup

module.exports = router;
