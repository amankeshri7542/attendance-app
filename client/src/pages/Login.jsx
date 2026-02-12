import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(username, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background-light p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg border border-primary/10">
                <div className="flex justify-center mb-6">
                    <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                        <span className="material-symbols-outlined text-primary text-3xl">lock</span>
                    </div>
                </div>
                <h2 className="mb-6 text-center text-2xl font-bold text-primary">Admin Login</h2>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            placeholder="Enter username"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2">
                        <span className="material-symbols-outlined text-sm mt-0.5">info</span>
                        <p><strong>Note for Staff:</strong> Please use the mobile app to mark attendance. This dashboard is for Admins only.</p>
                    </div>
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-primary py-2.5 font-bold text-white hover:bg-primary/90 transition-colors"
                    >
                        Login
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-4">
                        Employee Attendance System Admin
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
