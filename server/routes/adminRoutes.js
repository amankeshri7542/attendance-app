const express = require('express');
const router = express.Router();
const { loginAdmin, registerAdmin } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

const { loginLimiter } = require('../middleware/rateLimiter');
const { validateLogin, validate } = require('../middleware/validators');

router.post('/login', loginLimiter, validateLogin, validate, loginAdmin);
router.post('/register', protect, registerAdmin); // Protected: only authenticated admins can create new admins

module.exports = router;
