import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', empId: '', department: '', pin: '' });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => { fetchEmployees(); }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await api.get('/employees');
            setEmployees(res.data);
        } catch (err) {
            console.error('Error fetching employees', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (emp) => {
        setEditingId(emp._id);
        setForm({ name: emp.name, empId: emp.empId, department: emp.department, pin: '' });
        setShowForm(true);
        setError('');
        setSuccess('');
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setForm({ name: '', empId: '', department: '', pin: '' });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            if (editingId) {
                // Update
                const payload = { ...form };
                if (!payload.pin) delete payload.pin; // Don't send empty PIN
                await api.put(`/employees/${editingId}`, payload);
                setSuccess(`${form.name} updated successfully!`);
            } else {
                // Create
                await api.post('/employees', form);
                setSuccess(`${form.name} added successfully!`);
            }
            handleCancel();
            fetchEmployees();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleToggle = async (id, name, currentStatus) => {
        try {
            await api.put(`/employees/${id}/toggle`);
            setSuccess(`${name} ${currentStatus ? 'deactivated' : 'activated'}`);
            fetchEmployees();
        } catch (err) {
            setError('Failed to update status');
        }
    };

    const activeCount = employees.filter(e => e.isActive).length;
    const inactiveCount = employees.filter(e => !e.isActive).length;

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Staff Management</h1>
                    <p className="text-sm text-slate-500 mt-1">{activeCount} active · {inactiveCount} inactive</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', empId: '', department: '', pin: '' }); }}
                        className="flex items-center gap-2 bg-gradient-to-r from-[#1a227f] to-[#4f56c8] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-[#1a227f]/20 transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">person_add</span>
                        Add Employee
                    </button>
                )}
            </div>

            {/* Alerts */}
            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">error</span>{error}
                </div>
            )}
            {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">check_circle</span>{success}
                </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#1a227f]">
                                {editingId ? 'edit' : 'person_add'}
                            </span>
                            {editingId ? 'Edit Employee' : 'New Employee'}
                        </h3>
                        <button onClick={handleCancel} className="text-slate-400 hover:text-rose-500 transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                            <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1a227f] focus:ring-2 focus:ring-[#1a227f]/10"
                                placeholder="e.g. Raju Kumar" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Employee ID</label>
                            <input type="text" required value={form.empId} onChange={e => setForm({ ...form, empId: e.target.value })}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1a227f] focus:ring-2 focus:ring-[#1a227f]/10"
                                placeholder="e.g. EMP008" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Department</label>
                            <input type="text" required value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1a227f] focus:ring-2 focus:ring-[#1a227f]/10"
                                placeholder="e.g. Operations" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                {editingId ? 'New PIN (Leave blank to keep same)' : 'PIN (4 digits)'}
                            </label>
                            <input type="password" maxLength="4"
                                required={!editingId}
                                value={form.pin} onChange={e => setForm({ ...form, pin: e.target.value })}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1a227f] focus:ring-2 focus:ring-[#1a227f]/10"
                                placeholder={editingId ? "Enter new PIN to reset" : "e.g. 1234"} />
                        </div>
                        <div className="sm:col-span-2 flex gap-3 mt-2">
                            <button type="button" onClick={handleCancel}
                                className="flex-1 bg-slate-100 text-slate-600 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-all">
                                Cancel
                            </button>
                            <button type="submit"
                                className="flex-1 bg-gradient-to-r from-[#1a227f] to-[#4f56c8] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition-all">
                                {editingId ? 'Update Employee' : 'Add Employee'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Employee List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gradient-to-r from-slate-50 to-slate-100 text-xs uppercase text-slate-500 tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Employee</th>
                                <th className="px-6 py-4 font-semibold">ID</th>
                                <th className="px-6 py-4 font-semibold">Department</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-400">
                                    <span className="material-symbols-outlined animate-spin text-3xl block mb-2">progress_activity</span>
                                    Loading...
                                </td></tr>
                            ) : employees.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-400">No employees yet</td></tr>
                            ) : (
                                employees.map(emp => (
                                    <tr key={emp._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${emp.isActive ? 'bg-gradient-to-br from-[#1a227f] to-[#4f56c8]' : 'bg-slate-300'
                                                    }`}>
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <p className={`font-semibold ${emp.isActive ? 'text-slate-800' : 'text-slate-400'}`}>{emp.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{emp.empId}</td>
                                        <td className="px-6 py-4 text-slate-600">{emp.department}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${emp.isActive
                                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                                : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${emp.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                {emp.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(emp)}
                                                    className="p-1.5 text-slate-400 hover:text-[#1a227f] hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit details"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleToggle(emp._id, emp.name, emp.isActive)}
                                                    className={`p-1.5 rounded-lg transition-colors ${emp.isActive
                                                        ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                                        : 'text-emerald-600 hover:bg-emerald-50'
                                                        }`}
                                                    title={emp.isActive ? "Deactivate" : "Activate"}
                                                >
                                                    <span className="material-symbols-outlined text-lg">
                                                        {emp.isActive ? 'block' : 'check_circle'}
                                                    </span>
                                                </button>
                                            </div>
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

export default Employees;
