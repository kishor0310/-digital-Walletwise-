import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Wallet,
  PlusCircle,
  ArrowRightLeft,
  Receipt,
  Clock,
  User,
  ShieldAlert,
  Database,
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Wallet', path: '/dashboard/wallet', icon: Wallet },
    { name: 'Add Money', path: '/dashboard/add-money', icon: PlusCircle },
    { name: 'Transfer', path: '/dashboard/transfer', icon: ArrowRightLeft },
    { name: 'Pay Bills', path: '/dashboard/bills', icon: Receipt },
    { name: 'Transactions', path: '/dashboard/transactions', icon: Clock },
    { name: 'Profile', path: '/dashboard/profile', icon: User },
    { name: 'Database & ERD', path: '/database-schema', icon: Database, badge: 'DBMS' },
  ];

  if (isAdmin || user?.role === 'ADMIN') {
    navItems.splice(7, 0, { name: 'Admin Console', path: '/admin', icon: ShieldAlert, badge: 'Admin' });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-300 border-r border-slate-800 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-18 px-6 flex items-center justify-between border-b border-slate-800/80">
            <NavLink to="/dashboard" className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/25">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Wallet<span className="text-teal-400">Wise</span>
              </span>
            </NavLink>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-180px)]">
            <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Core Wallet
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  onClick={() => setMobileOpen?.(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                      isActive
                        ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 transition group-hover:scale-110" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-teal-400/20 text-teal-300 border border-teal-400/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout Bottom Section */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
