const mongoose = require('mongoose');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const outputDir = path.join(__dirname, 'qr-codes');

const generateQRCodes = async () => {
    try {
        // Create output directory
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Single shared QR code for the office
        const qrData = JSON.stringify({
            type: 'attendance',
            shopId: 'cement-shop-01',
            name: 'Cement Shop Attendance'
        });

        const filepath = path.join(outputDir, 'office-qr.png');

        await QRCode.toFile(filepath, qrData, {
            width: 500,
            margin: 3,
            color: { dark: '#1a227f', light: '#ffffff' }
        });

        console.log('\n✅ Office QR code generated!');
        console.log(`📁 Saved to: ${filepath}`);
        console.log('\n📱 Print this QR code and place it at the shop entrance.');
        console.log('   All employees scan this SAME QR to mark attendance.\n');

        process.exit();
    } catch (error) {
        console.error('Error generating QR code:', error);
        process.exit(1);
    }
};

generateQRCodes();
