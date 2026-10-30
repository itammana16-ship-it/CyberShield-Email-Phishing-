
import React from 'react';
import { User } from '../../types';
import {
  Shield,
  Menu,
  ChevronRight,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Mail,
  Globe,
  QrCode,
  Camera,
  Image as ImageIcon,
  KeyRound,
  MessageSquare,
  BarChart3,
  History,
  Info,
  Settings,
  Users
} from 'lucide-react';

interface TopBarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  sidebarCollapsed,
  setSidebarCollapsed,
  onLogout,
  onOpenAuth
}) => {
  // User navigation links
  const userNavLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'email', label: 'Email Scan', icon: Mail },
    { id: 'url', label: 'URL Scan', icon: Globe },
    { id: 'qr', label: 'QR Scan', icon: QrCode },
    { id: 'screenshot', label: 'Screenshot', icon: Camera },
    { id: 'ai_image', label: 'AI Image', icon: ImageIcon },
    { id: 'password', label: 'Password', icon: KeyRound },
    { id: 'message', label: 'Message NLP', icon: MessageSquare },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
    { id: 'history', label: 'History', icon: History },
    { id: 'about', label: 'About', icon: Info },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  // Admin navigation links
  const adminNavLinks = [
    { id: 'admin_dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'admin_users', label: 'User Directory', icon: Users },
    { id: 'admin_analysis', label: 'Global Analysis', icon: BarChart3 },
    { id: 'admin_history', label: 'Global History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const currentNavLinks =
    currentUser.role === 'admin' ? adminNavLinks : userNavLinks;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">

      {/* Top primary row */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-2.5 gap-4">

        {/* Left: Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarCollapsed(prev => !prev)}
            aria-label="Toggle Sidebar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold">
              <Shield className="w-4 h-4" />
            </div>

            <div>
              <span className="text-sm font-bold tracking-tight text-white whitespace-nowrap">
                PhishGuard
              </span>
            </div>
          </div>
        </div>

        {/* Center: Active Context */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span className="capitalize">
            {currentUser.role} Workspace
          </span>

          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

          <span className="font-medium text-cyan-300 capitalize">
            {activeTab.replace('admin_', '').replace('_', ' ')}
          </span>
        </div>

        {/* Right: User details & Logout */}
        <div className="flex items-center gap-3">

          {/* Role badge */}
          <div
            className={`px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase border ${
              currentUser.role === 'admin'
                ? 'bg-rose-950/60 text-rose-300 border-rose-800/80'
                : 'bg-cyan-950/60 text-cyan-300 border-cyan-800/80'
            }`}
          >
            {currentUser.role === 'admin'
              ? 'Master Admin'
              : 'Security User'}
          </div>

          {/* User info pill */}
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2 text-xs text-slate-300 hover:text-white px-2 py-1 rounded-md hover:bg-slate-800/60 transition-colors"
            title="Open Profile"
          >

            {/* Profile Picture */}
            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700 overflow-hidden shrink-0">

              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={`${currentUser.username}'s profile`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <UserIcon className="w-4 h-4" />
              )}

            </div>

            {/* Username */}
            <span className="hidden md:inline font-medium max-w-[120px] truncate">
              {currentUser.username}
            </span>

          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}
            title="Log out of session"
            aria-label="Logout"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>

        </div>
      </div>

      {/* Top Navigation Row */}
      <div className="border-t border-slate-800/60 px-4 lg:px-6 bg-slate-900/40 overflow-x-auto no-scrollbar py-1 flex items-center gap-1.5">

        {currentNavLinks.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isActive ? 'text-cyan-400' : 'text-slate-400'
                }`}
              />

              <span>{item.label}</span>
            </button>
          );
        })}

      </div>
    </header>
  );
};
