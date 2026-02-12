import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-20 md:pb-0 bg-[#f0f1f5]">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a227f] to-[#4f56c8] flex items-center justify-center shadow-lg shadow-[#1a227f]/20">
                            <span className="material-symbols-outlined text-white text-xl">fingerprint</span>
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-slate-800 leading-tight">Attendance Manager</h1>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Admin Panel</p>
                        </div>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        <NavLink to="/" icon="dashboard" label="Dashboard" active={isActive('/')} />
                        <NavLink to="/employees" icon="group" label="Employees" active={isActive('/employees')} />
                    </nav>

                    <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-500 hidden md:block">{user?.username}</span>
                        <button onClick={handleLogout}
                            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-sm">logout</span>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 z-30 flex bg-white/90 backdrop-blur-xl border-t border-slate-200/50 px-2 pb-5 pt-2 md:hidden shadow-2xl">
                <MobileNavLink to="/" icon="dashboard" label="Home" active={isActive('/')} />
                <MobileNavLink to="/employees" icon="group" label="Staff" active={isActive('/employees')} />
            </nav>
        </div>
    );
};

const NavLink = ({ to, icon, label, active }) => (
    <Link to={to}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active
                ? 'bg-[#1a227f]/10 text-[#1a227f]'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}>
        <span className="material-symbols-outlined text-lg">{icon}</span>
        {label}
    </Link>
);

const MobileNavLink = ({ to, icon, label, active }) => (
    <Link to={to} className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-colors ${active ? 'text-[#1a227f]' : 'text-slate-400'
        }`}>
        <span className={`material-symbols-outlined text-xl ${active ? 'fill-1' : ''}`}>{icon}</span>
        <p className={`text-[10px] font-bold tracking-tight ${active ? '' : 'font-medium'}`}>{label}</p>
    </Link>
);

export default Layout;
