const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Check if admin already exists
        const adminExists = await Admin.findOne({ username: 'admin' });

        if (adminExists) {
            console.log('Admin user "admin" already exists.');
            process.exit();
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('123456', salt);

        // Create admin
        await Admin.create({
            username: 'admin',
            passwordHash
        });

        console.log('Default Admin Created!');
        console.log('Username: admin');
        console.log('Password: 123456');

        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
