import axios from 'axios';

// ⚠️ UPDATE THIS to your Render URL after deployment, e.g.:
// const BASE_URL = 'https://your-app-name.onrender.com/api';
// For local dev, use: 'http://192.168.0.111:5001/api' or 'http://localhost:5001/api'
const BASE_URL = 'https://your-app-name.onrender.com/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const loginEmployee = async (empId, pin) => {
    try {
        const response = await api.post('/employee/login', { empId, pin });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Network Error' };
    }
};

export const loginAdmin = async (username, password) => {
    try {
        const response = await api.post('/admin/login', { username, password });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Network Error' };
    }
};

export const getAttendance = async (token, date, employeeId) => {
    try {
        let url = '/attendance';
        const params = [];
        if (date) params.push(`date=${date}`);
        if (employeeId) params.push(`employeeId=${employeeId}`);
        if (params.length > 0) url += '?' + params.join('&');

        const response = await api.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Network Error' };
    }
};

export const markAttendance = async (data) => {
    try {
        const response = await api.post('/attendance', data);
        return response.data;
    } catch (error) {
        console.error('API Error:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : { message: 'Network Error' };
    }
};

export const getAttendanceHistory = async (employeeId) => {
    try {
        const response = await api.get(`/attendance/history?employeeId=${employeeId}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Network Error' };
    }
};

// Employee Management (Admin)
export const getEmployees = async (token) => {
    try {
        const response = await api.get('/employees', { headers: { Authorization: `Bearer ${token}` } });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Network Error' };
    }
};

export const createEmployee = async (data, token) => {
    try {
        const response = await api.post('/employees', data, { headers: { Authorization: `Bearer ${token}` } });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Network Error' };
    }
};

export const updateEmployee = async (id, data, token) => {
    try {
        const response = await api.put(`/employees/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Network Error' };
    }
};

export const toggleEmployee = async (id, token) => {
    try {
        const response = await api.put(`/employees/${id}/toggle`, {}, { headers: { Authorization: `Bearer ${token}` } });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: 'Network Error' };
    }
};

export default api;
