# Employee Attendance System (Monorepo)

Full-stack employee attendance system with QR code scanning, geofencing, and admin dashboard.

## 📂 Structure
```
/server   → Node.js + Express Backend (API, Auth, Geofencing)
/client   → React + Vite Admin Dashboard
/mobile   → Expo React Native Android App (QR Scanner)
```

---

## 🚀 Quick Start

### 1. Backend Server

```bash
cd server
npm install
```

**Create `.env` file** in `/server`:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/attendance_db
JWT_SECRET=your_super_secret_key
OFFICE_LAT=25.5864201
OFFICE_LNG=85.1294782
```

> ⚠️ Use port **5001** (not 5000) — macOS AirPlay uses 5000.

```bash
# Seed admin user (Username: admin, Password: 123456)
node seedAdmin.js

# Seed sample employees
node seedData.js

# Generate QR codes for all employees
node generateQR.js

# Start server
npm run dev
```

---

### 2. Admin Dashboard

```bash
cd client
npm install
npm start
```
Open **http://localhost:5173** → Login with `admin` / `123456`.

---

### 3. Mobile App (Android)

```bash
cd mobile
npm install
npx expo start
```
- Press `a` for Android Emulator, or scan QR with Expo Go app.
- If on **physical device**, update `mobile/src/services/api.js` with your computer's IP.

---

## 📱 How the System Works

### Complete Flow:
1. **Admin** logs into the dashboard → manages employees, views attendance.
2. **Admin** runs `node generateQR.js` → prints QR codes, places them in office.
3. **Employee** opens the mobile app → scans their QR code.
4. **Mobile app** captures GPS location + sends to API.
5. **API** checks geofence (50m radius from office) + duplicate scan (2 min window).
6. If valid → attendance is recorded. If not → blocked with reason.

### QR Code Generation
```bash
cd server

# Generate QR for all active employees:
node generateQR.js
```
Output: `server/qr-codes/*.png` — Print these and place at the office entrance.

Each QR contains: `{ employeeId, empId, name }` in JSON format.

### Adding New Employees
Use the Admin Dashboard or API:
```bash
# Via API:
curl -X POST http://localhost:5001/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Employee","empId":"EMP006","department":"HR"}'

# Then regenerate QR codes:
node generateQR.js
```

---

## 🔐 Security Features
- **JWT Auth** (24h expiration)
- **Rate Limiting** (Login: 20/15min, Attendance: 15/min)
- **Geofencing** (50m radius)
- **Duplicate Prevention** (2-min window)
- **Input Validation** (express-validator)

## 🛠 Environment Variables

| Variable | Description | Example |
|-----------|-------------|---------|
| `PORT` | Server port | `5001` |
| `MONGO_URI` | MongoDB connection string | `mongodb://...` |
| `JWT_SECRET` | Secret for JWT tokens | `your_secret` |
| `OFFICE_LAT` | Office latitude | `25.5864201` |
| `OFFICE_LNG` | Office longitude | `85.1294782` |
