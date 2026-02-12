import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const Dashboard = () => {
    const [attendance, setAttendance] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchEmployees(); }, []);
    useEffect(() => { fetchAttendance(); }, [selectedDate, selectedEmployee]);

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/employees');
            setEmployees(res.data);
        } catch (error) {
            console.error("Error fetching employees", error);
        }
    };

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            // Fetch for the selected month/day. 
            // For now, fetching single day as per UI design, but filtering is key.
            let query = `?date=${selectedDate.toISOString()}`;
            if (selectedEmployee) query += `&employeeId=${selectedEmployee}`;
            const res = await api.get(`/attendance${query}`);
            setAttendance(res.data);
        } catch (error) {
            console.error("Error fetching attendance", error);
        } finally {
            setLoading(false);
        }
    };

    // Grouping Logic: Create a map of EmployeeID -> { In, Out, Location, Status }
    const dailyRecords = React.useMemo(() => {
        const map = new Map();

        attendance.forEach(record => {
            const empId = record.employeeId?._id;
            if (!empId) return;

            if (!map.has(empId)) {
                map.set(empId, {
                    employee: record.employeeId,
                    inTime: null,
                    outTime: null,
                    location: null,
                    status: 'Absent',
                    isLate: false
                });
            }

            const entry = map.get(empId);
            if (record.type === 'IN') {
                entry.inTime = new Date(record.time);
                entry.location = record.location;
                // Use backend status if available, else derive it
                entry.status = record.status || (entry.isLate ? 'Late' : 'Present');
                entry.isLate = record.isLate || (entry.inTime.getHours() > 9 || (entry.inTime.getHours() === 9 && entry.inTime.getMinutes() > 15));
                if (entry.isLate) entry.status = 'Late';
                else entry.status = 'Present';

            } else if (record.type === 'OUT') {
                entry.outTime = new Date(record.time);
            }
        });

        // Add employees who haven't checked in at all (Absent)
        // Only if filtering by "All Employees"
        if (!selectedEmployee) {
            employees.forEach(emp => {
                if (!map.has(emp._id) && emp.isActive) {
                    map.set(emp._id, {
                        employee: emp,
                        inTime: null,
                        outTime: null,
                        location: null,
                        status: 'Absent',
                        isLate: false
                    });
                }
            });
        }

        return Array.from(map.values());
    }, [attendance, employees, selectedEmployee]);

    const totalEmployees = employees.filter(e => e.isActive).length;
    const present = dailyRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
    const late = dailyRecords.filter(r => r.status === 'Late').length;
    const absent = dailyRecords.filter(r => r.status === 'Absent').length;

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a227f] via-[#2d35a8] to-[#4f56c8] p-6 md:p-8 text-white shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative z-10">
                    <p className="text-white/70 text-sm font-medium">Welcome back, Admin</p>
                    <h1 className="text-2xl md:text-3xl font-bold mt-1">Staff Attendance Dashboard</h1>
                    <p className="text-white/60 text-sm mt-2">
                        {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon="groups" label="Total Staff" value={totalEmployees} gradient="from-blue-500 to-blue-600" bgLight="bg-blue-50" textColor="text-blue-700" />
                <StatCard icon="check_circle" label="Present" value={present} gradient="from-emerald-500 to-emerald-600" bgLight="bg-emerald-50" textColor="text-emerald-700" />
                <StatCard icon="cancel" label="Absent" value={absent} gradient="from-rose-500 to-rose-600" bgLight="bg-rose-50" textColor="text-rose-700" />
                <StatCard icon="schedule" label="Late Arrivals" value={late} gradient="from-amber-500 to-amber-600" bgLight="bg-amber-50" textColor="text-amber-700" />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#1a227f]">table_chart</span>
                        Daily Attendance Log
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1a227f] focus:ring-2 focus:ring-[#1a227f]/10 transition-all"
                            dateFormat="dd/MM/yyyy"
                        />
                        <select
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1a227f] focus:ring-2 focus:ring-[#1a227f]/10 transition-all min-w-[160px]"
                        >
                            <option value="">All Employees</option>
                            {employees.map(emp => (
                                <option key={emp._id} value={emp._id}>{emp.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gradient-to-r from-slate-50 to-slate-100 text-xs uppercase text-slate-500 tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Employee</th>
                                <th className="px-6 py-4 font-semibold">Check In</th>
                                <th className="px-6 py-4 font-semibold">Check Out</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-400">Loading...</td></tr>
                            ) : dailyRecords.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-400">No records found</td></tr>
                            ) : (
                                dailyRecords.map((record) => (
                                    <tr key={record.employee._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a227f] to-[#4f56c8] flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                    {record.employee.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{record.employee.name}</p>
                                                    <p className="text-xs text-slate-400">{record.employee.department}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-600">
                                            {record.inTime ? record.inTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--'}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-600">
                                            {record.outTime ? record.outTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${record.status === 'Present' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' :
                                                    record.status === 'Late' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' :
                                                        'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${record.status === 'Present' ? 'bg-emerald-500' :
                                                        record.status === 'Late' ? 'bg-amber-500' :
                                                            'bg-rose-500'
                                                    }`} />
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, gradient, bgLight, textColor }) => (
    <div className={`relative overflow-hidden rounded-2xl p-5 ${bgLight} border border-slate-100 shadow-sm hover:shadow-md transition-shadow group`}>
        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${gradient} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
                <span className={`material-symbols-outlined text-lg ${textColor}`}>{icon}</span>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</p>
            </div>
            <p className={`text-3xl font-black leading-tight ${textColor}`}>{value}</p>
        </div>
    </div>
);

export default Dashboard;
