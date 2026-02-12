const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    time: {
        type: Date,
        default: Date.now,
        required: true
    },
    type: {
        type: String,
        enum: ['IN', 'OUT'],
        required: true
    },
    location: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    },
    qrCodeId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Present', 'Late', 'Half-day', 'Absent'],
        default: 'Present'
    },
    isLate: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
