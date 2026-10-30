
import React, { useState, useEffect } from 'react';
import { User, ScanResult } from './types';
import { Storage } from './utils/storage';
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/auth/AuthModal';

import { UserDashboard } from './components/dashboard/UserDashboard';
import { EmailScanner } from './components/scanners/EmailScanner';
import { UrlScanner } from './components/scanners/UrlScanner';
import { QrScanner } from './components/scanners/QrScanner';
import { ScreenshotScanner } from './components/scanners/ScreenshotScanner';
import { AiImageScanner } from './components/scanners/AiImageScanner';
import { PasswordTool } from './components/tools/PasswordTool';
import { MessageScanner } from './components/scanners/MessageScanner';
import { HistoryPage } from './components/pages/HistoryPage';
import { AnalysisPage } from './components/pages/AnalysisPage';
import { AboutPage } from './components/pages/AboutPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { ProfilePage } from './components/pages/ProfilePage';

import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminUserList } from './components/admin/AdminUserList';

type AuthType = 'user' | 'admin';

export default function App() {
const [currentUser, setCurrentUser] = useState<User | null>(
  () => Storage.getActiveSession()
);
  const [scans, setScans] = useState<ScanResult[]>(() =>
    Storage.getScans()
  );
  const [users, setUsers] = useState<User[]>(() =>
    Storage.getUsers()
  );
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState<AuthType>('user');

  useEffect(() => {
    const theme = Storage.getThemeSettings();
    Storage.applyThemeToDOM(theme);
  }, []);

  const openUserLogin = () => {
    setAuthType('user');
    setAuthModalOpen(true);
  };

  const openAdminLogin = () => {
    setAuthType('admin');
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    Storage.setActiveSession(null);
    setCurrentUser(null);
    setAuthModalOpen(false);
    setAuthType('user');
  };

  const handleAuthSuccess = (user: User) => {
    if (authType === 'admin' && user.role !== 'admin') {
      setAuthModalOpen(true);
      return;
    }

    setCurrentUser(user);
    setUsers(Storage.getUsers());
    setAuthModalOpen(false);
    setActiveTab(
      user.role === 'admin' ? 'admin_dashboard' : 'dashboard'
    );
  };

  const handleScanComplete = (_newScan: ScanResult) => {
    setScans(Storage.getScans());
  };

  const handleUserRemoved = () => {
    setUsers(Storage.getUsers());
  };

  // Welcome page
  if (!currentUser) {
    if (!authModalOpen) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
          <header className="flex items-center gap-3 p-6 sm:p-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg">
              🛡️
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-wide">
                PhishGuard
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Cyber Security &amp; Threat Detection
              </p>
            </div>
          </header>

          <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
            <div className="max-w-3xl">
              <h2 className="text-4xl sm:text-6xl font-extrabold leading-tight">
                Stay Safe in the
                <span className="block text-cyan-400 mt-2">
                  Digital World
                </span>
              </h2>

              <p className="text-slate-400 text-base sm:text-lg mt-6 max-w-2xl mx-auto leading-8">
                Detect phishing emails, suspicious URLs, unsafe messages
                and other cyber threats with PhishGuard.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  type="button"
                  onClick={openUserLogin}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-105 hover:from-cyan-400 hover:to-blue-500"
                >
                  User Login / Register →
                </button>

                <button
                  type="button"
                  onClick={openAdminLogin}
                  className="rounded-xl border border-slate-600 bg-slate-800 px-8 py-4 font-bold text-white transition hover:bg-slate-700"
                >
                  🛡️ Admin Login
                </button>
              </div>

              <p className="text-slate-500 text-sm mt-5">
                Your smarter step toward cyber security.
              </p>
            </div>
          </main>

          <Footer />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <AuthModal
          isOpen={true}
          onClose={() => {
            setAuthModalOpen(false);
            setAuthType('user');
          }}
          onSuccess={handleAuthSuccess}
          adminOnly={authType === 'admin'}
        />
        <Footer />
      </div>
    );
  }

  const renderContent = () => {
    if (currentUser.role === 'admin') {
      switch (activeTab) {
        case 'admin_dashboard':
          return (
            <AdminDashboard
              currentUser={currentUser}
              users={users}
              scans={scans}
              setActiveTab={setActiveTab}
            />
          );

        case 'admin_users':
          return (
            <AdminUserList
              scans={scans}
              onUserRemoved={handleUserRemoved}
            />
          );

        case 'admin_analysis':
          return (
            <AnalysisPage currentUser={currentUser} scans={scans} />
          );

        case 'admin_history':
          return (
            <HistoryPage currentUser={currentUser} scans={scans} />
          );

        case 'settings':
          return <SettingsPage />;

        case 'profile':
          return (
            <ProfilePage
              currentUser={currentUser}
              onUserUpdated={u => setCurrentUser(u)}
            />
          );

        default:
          return (
            <AdminDashboard
              currentUser={currentUser}
              users={users}
              scans={scans}
              setActiveTab={setActiveTab}
            />
          );
      }
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <UserDashboard
            currentUser={currentUser}
            scans={scans}
            setActiveTab={setActiveTab}
          />
        );

      case 'email':
        return (
          <EmailScanner
            currentUser={currentUser}
            onScanComplete={handleScanComplete}
          />
        );

      case 'url':
        return (
          <UrlScanner
            currentUser={currentUser}
            onScanComplete={handleScanComplete}
          />
        );

      case 'qr':
        return (
          <QrScanner
            currentUser={currentUser}
            onScanComplete={handleScanComplete}
          />
        );

      case 'screenshot':
        return (
          <ScreenshotScanner
            currentUser={currentUser}
            onScanComplete={handleScanComplete}
          />
        );

      case 'ai_image':
        return (
          <AiImageScanner
            currentUser={currentUser}
            onScanComplete={handleScanComplete}
          />
        );

      case 'password':
        return <PasswordTool />;

      case 'message':
        return (
          <MessageScanner
            currentUser={currentUser}
            onScanComplete={handleScanComplete}
          />
        );

      case 'analysis':
        return (
          <AnalysisPage currentUser={currentUser} scans={scans} />
        );

      case 'history':
        return (
          <HistoryPage currentUser={currentUser} scans={scans} />
        );

      case 'about':
        return <AboutPage />;

      case 'settings':
        return <SettingsPage />;

      case 'profile':
        return (
          <ProfilePage
            currentUser={currentUser}
            onUserUpdated={u => setCurrentUser(u)}
          />
        );

      default:
        return (
          <UserDashboard
            currentUser={currentUser}
            scans={scans}
            setActiveTab={setActiveTab}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] flex transition-colors duration-200">
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          onLogout={handleLogout}
          onOpenAuth={openUserLogin}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
          {renderContent()}
        </main>

        <Footer />
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        adminOnly={authType === 'admin'}
      />
    </div>
  );
}
