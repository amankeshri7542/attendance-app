require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS — allow all origins (safe: auth is via JWT, not cookies)
app.use(cors());

// Body parser
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

// Routes
app.get('/', (req, res) => {
    res.send('Attendance System API is running');
});

app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/employee', require('./routes/employeeAuthRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));

// Global error handler — prevents HTML stack traces in production
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({
        message: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message || 'Internal server error'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
