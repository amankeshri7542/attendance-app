const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/auth');

// @desc    Auth admin & get token
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });

    if (admin && (await bcrypt.compare(password, admin.passwordHash))) {
        res.json({
            _id: admin._id,
            username: admin.username,
            token: generateToken(admin._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
};

// Helper to create admin (for seeding/testing)
const registerAdmin = async (req, res) => {
    const { username, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    try {
        const admin = await Admin.create({
            username,
            passwordHash
        });
        res.status(201).json(admin);
    } catch (error) {
        res.status(400).json({ message: 'Admin already exists' });
    }
}

module.exports = { loginAdmin, registerAdmin };
