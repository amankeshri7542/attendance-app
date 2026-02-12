# Employee Attendance Android App

## Project Overview
Android attendance system for a cement shop with 15–20 employees.

Employees scan a QR code placed inside the shop to log attendance.
GPS coordinates are captured to prevent remote check-ins.

Admin logs in via web dashboard to view records.

---

## Tech Stack

Mobile:
- React Native (Expo)
- expo-camera
- expo-location

Backend:
- Node.js
- Express
- MongoDB
- JWT
- bcrypt

Admin Dashboard:
- React
- Axios
- Tailwind or MUI

---

## Features

Employee:
- QR scan
- GPS capture
- timestamp
- auto submit

Admin:
- username/password login
- attendance table
- filter by date
- filter by employee
- logout

Security:
- JWT auth
- password hashing
- geofence validation (50m)
- duplicate scan prevention

---

## Folder Structure

/server
  models
  routes
  controllers
  middleware

/client
  src/pages
  src/components

/mobile
  screens
  services
  utils

---

## API Endpoints

POST /api/admin/login
POST /api/attendance
GET /api/attendance
GET /api/employees

---

## Environment Variables

MONGO_URI=
JWT_SECRET=
OFFICE_LAT=
OFFICE_LNG=

---

## Build Commands

Backend:
npm run dev

Mobile:
npx expo start
npx expo run:android
