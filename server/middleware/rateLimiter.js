const rateLimit = require('express-rate-limit');

// General limiter for public routes
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Stricter limiter for attendance submission
const attendanceLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 15, // Limit to 15 requests per minute (enough for testing, strict for abuse)
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many attendance requests, please slow down'
});

// Stricter limiter for login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // 20 attempts per 15 mins
    message: 'Too many login attempts, please try again later'
});

module.exports = { generalLimiter, attendanceLimiter, loginLimiter };
