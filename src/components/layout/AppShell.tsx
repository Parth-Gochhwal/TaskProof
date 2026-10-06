import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, Search, CheckSquare, Wallet, Trophy, User,
  LayoutDashboard, PlusSquare, FileText, BarChart2,
  LogOut, ShieldCheck, Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar, ProgressBar } from '../ui/index';

// ============================
// Logo
// ============================
export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'lg' ? 40 : size === 'md' ? 32 : 24;
  const text = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base';
  return (
    <div className="flex items-center gap-2.5">
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#1A4B8F" />
        <path d="M20 8L28 13V21L20 32L12 21V13L20 8Z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
        <path d="M14 19.5L18.5 24L27 14.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="20" cy="20" r="11" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      </svg>
      <span className={`font-bold text-[#0F172A] ${text}`}>TaskProof</span>
    </div>
  );
}

// ============================
// Contributor Sidebar
// ============================
const contributorNav = [
  { to: '/app/contributor', label: 'Dashboard', icon: Home, end: true },
  { to: '/app/contributor/tasks', label: 'Browse Tasks', icon: Search },
  { to: '/app/contributor/my-tasks', label: 'My Tasks', icon: CheckSquare },
  { to: '/app/contributor/wallet', label: 'Wallet', icon: Wallet },
  { to: '/app/contributor/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/app/contributor/profile', label: 'My Profile', icon: User },
];

// ============================
// Business Sidebar
// ============================
const businessNav = [
  { to: '/app/business', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/business/create-task', label: 'Create Task', icon: PlusSquare },
  { to: '/app/business/tasks', label: 'My Tasks', icon: FileText },
  { to: '/app/business/submissions', label: 'Submissions', icon: CheckSquare },
  { to: '/app/business/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/app/business/wallet', label: 'Payments', icon: Wallet },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = true, onClose }: SidebarProps) {
  const { user, role, contributorProfile, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = role === 'contributor' ? contributorNav : businessNav;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && onClose && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={onClose} />
      )}
      <aside className={`app-sidebar ${open ? 'open' : ''}`}>
        {/* Logo */}
        <div className="px-5 py-4 border-b border-[#D8DEE8]">
          <Logo size="md" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Main navigation">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-[#1A4B8F] text-white shadow-[0_4px_14px_rgba(26,75,143,0.3)]'
                  : 'text-[#64748B] hover:bg-[#F5F7FA] hover:text-[#0F172A]'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                  {isActive && item.label === 'Browse Tasks' && (
                    <span className="ml-auto text-xs bg-white/20 px-1.5 py-0.5 rounded-full">New</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Contributor Level Card */}
        {role === 'contributor' && contributorProfile && (
          <div className="mx-3 mb-3 p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #EBF1FA 0%, #E6E9EF 100%)', border: '1px solid #D8DEE8' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#1A4B8F] flex items-center justify-center text-white text-xs font-bold">
                {contributorProfile.level}
              </div>
              <div>
                <p className="text-xs font-bold text-[#0F172A]">{contributorProfile.levelName}</p>
                <div className="flex items-center gap-1 text-xs text-[#64748B]">
                  <Flame className="w-3 h-3 text-orange-500" />
                  {contributorProfile.streak} day streak
                </div>
              </div>
            </div>
            <ProgressBar value={contributorProfile.xp} max={contributorProfile.xpToNextLevel} />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-[#94A3B8]">{contributorProfile.xp.toLocaleString()} XP</span>
              <span className="text-xs text-[#64748B]">{contributorProfile.xpToNextLevel.toLocaleString()} XP</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs font-bold text-[#1A4B8F]">
                {typeof window !== 'undefined' ? '1,250' : '1,250'} TCR
              </span>
              <ShieldCheck className="w-3 h-3 text-[#1A4B8F]" />
            </div>
          </div>
        )}

        {/* User & Logout */}
        <div className="px-3 pb-4 border-t border-[#D8DEE8] pt-3">
          <div className="flex items-center gap-2.5 mb-2">
            <Avatar name={user?.name || 'User'} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#0F172A] truncate">{user?.name}</p>
              <p className="text-xs text-[#94A3B8] truncate capitalize">{role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

// ============================
// Top Nav
// ============================

import { Bell, Menu } from 'lucide-react';
import { SEED_NOTIFICATIONS } from '../../data/seed';

interface TopNavProps {
  title?: string;
  onMenuToggle?: () => void;
}

export function TopNav({ title, onMenuToggle }: TopNavProps) {
  const { user, balance, role } = useAuth();
  const unread = SEED_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-white/70 backdrop-blur-md border-b border-[#D8DEE8] flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button onClick={onMenuToggle} className="md:hidden p-1.5 rounded-lg hover:bg-[#F5F7FA] cursor-pointer" aria-label="Toggle menu">
            <Menu className="w-5 h-5" />
          </button>
        )}
        {title && <h1 className="text-base font-semibold text-[#0F172A]">{title}</h1>}
      </div>

      <div className="flex items-center gap-3">
        {/* Balance chip */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold"
          style={{ background: '#EBF1FA', color: '#1A4B8F', border: '1px solid #BFDBFE' }}>
          {balance.toLocaleString()} TCR
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-[#F5F7FA] transition-colors cursor-pointer" aria-label="Notifications">
          <Bell className="w-5 h-5 text-[#64748B]" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#DC2626] text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unread}
            </span>
          )}
        </button>

        {/* Role switcher for demo */}
        <div className="text-xs text-[#94A3B8] hidden lg:block">Demo: <span className="font-medium text-[#1A4B8F] capitalize">{role}</span></div>

        <Avatar name={user?.name || 'User'} size="sm" />
      </div>
    </header>
  );
}

// ============================
// App Shell
// ============================

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="app-main">
        <TopNav onMenuToggle={() => setSidebarOpen(v => !v)} />
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
