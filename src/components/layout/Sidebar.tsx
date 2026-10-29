
import React from 'react';
import { User } from '../../types';
import {
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
  User as UserIcon,
  ShieldAlert,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  onLogout: () => void;
  
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  onLogout
}) => {
  const isMasterAdmin = currentUser.role === 'admin';

  const userScanItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'email', label: 'Email Scanning', icon: Mail,  },
    { id: 'url', label: 'URL Scanner', icon: Globe },
    { id: 'qr', label: 'QR Code Scan', icon: QrCode },
    { id: 'screenshot', label: 'Screenshot', icon: Camera },
    { id: 'ai_image', label: 'AI Image Scan', icon: ImageIcon, },
    { id: 'password', label: 'Safe Password', icon: KeyRound },
    { id: 'message', label: 'Message NLP', icon: MessageSquare },
  ];

  const userRecordsItems = [
    { id: 'analysis', label: 'Threat Analysis', icon: BarChart3 },
    { id: 'history', label: 'Scan History', icon: History, badge: 'PDF' },
  ];

  const userSystemItems = [
    { id: 'about', label: 'About', icon: Info },
    { id: 'settings', label: 'Theme & Settings', icon: Settings },
    { id: 'profile', label: 'User Profile', icon: UserIcon },
  ];

  const adminItems = [
    { id: 'admin_dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'admin_users', label: 'User Management', icon: Users, badge: 'Live' },
    { id: 'admin_analysis', label: 'Global Analysis', icon: BarChart3 },
    { id: 'admin_history', label: 'All Scan Dossiers', icon: History, badge: 'PDF' },
    { id: 'settings', label: 'Color & Theme Settings', icon: Settings },
    { id: 'profile', label: 'Admin Security Profile', icon: UserIcon },
  ];

  const renderNavButton = (item: {
    id: string;
    label: string;
    icon: any;
    badge?: string;
  }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        title={collapsed ? item.label : undefined}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative ${
          isActive
            ? 'bg-cyan-500/15 text-cyan-300 font-semibold shadow-sm shadow-cyan-500/10 border border-cyan-500/25'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
        }`}
      >
        <Icon
          className={`w-4 h-4 shrink-0 transition-colors ${
            isActive
              ? 'text-cyan-400'
              : 'text-slate-400 group-hover:text-slate-200'
          }`}
        />

        {!collapsed && (
          <span className="truncate flex-1 text-left">
            {item.label}
          </span>
        )}

        {!collapsed && item.badge && (
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              item.badge === 'SVM'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                : item.badge === 'PDF'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside
      className={`relative shrink-0 sticky top-0 z-40 h-screen transition-[width] duration-300 flex flex-col border-r border-slate-800 bg-[var(--theme-sidebar)] shadow-xl ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 border-b border-slate-800/80 px-3.5 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-cyan-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>

          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold tracking-tight text-white truncate">
                PHISHGUARD 
              </span>
              <span className="text-[10px] font-mono text-slate-400 truncate">
                Cyber Intelligence
              </span>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(prev => !prev)}
          className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors shrink-0"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-4">
        {isMasterAdmin ? (
          <div>
            {!collapsed && (
              <div className="px-3 pb-1 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                Administration Console
              </div>
            )}
            <div className="space-y-1">
              {adminItems.map(renderNavButton)}
            </div>
          </div>
        ) : (
          <>
            <div>
              {!collapsed && (
                <div className="px-3 pb-1 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                  Scanning Suites
                </div>
              )}
              <div className="space-y-1">
                {userScanItems.map(renderNavButton)}
              </div>
            </div>

            <div>
              {!collapsed && (
                <div className="px-3 pb-1 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                  Forensic Records
                </div>
              )}
              <div className="space-y-1">
                {userRecordsItems.map(renderNavButton)}
              </div>
            </div>

            <div>
              {!collapsed && (
                <div className="px-3 pb-1 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                  System & Profile
                </div>
              )}
              <div className="space-y-1">
                {userSystemItems.map(renderNavButton)}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/50 shrink-0">
        {!collapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                <UserIcon className="w-3.5 h-3.5" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">
                  {currentUser.username}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Logout"
              aria-label="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={onLogout}
              title="Logout"
              aria-label="Logout"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
