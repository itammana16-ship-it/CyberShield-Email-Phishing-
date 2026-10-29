import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { Storage } from '../../utils/storage';
import {
  Shield,
  Lock,
  Mail,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  adminOnly?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  adminOnly = false
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Admin login must never open the registration form.
  useEffect(() => {
    if (adminOnly) {
      setMode('login');
      setUsername('');
      setEmail('');
      setPassword('');
      setError(null);
      setSuccessMsg(null);
    }
  }, [adminOnly]);

  if (!isOpen) return null;

  const handleQuickFillAdmin = () => {
    setMode('login');
    setUsername('admin');
    setEmail('admin@phishguard.ai');
    setPassword('Admin@2026');
    setError(null);
    setSuccessMsg(null);
  };

  const handleQuickFillUser = () => {
    setUsername('tammana');
    setEmail('itammana16@gmail.com');
    setPassword('CyberGuard@123');
    setError(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (loading) return;

    // Extra protection against registration in Admin Login mode.
    if (adminOnly && mode === 'register') {
      setMode('login');
      setError('Registration is disabled for Admin Login.');
      return;
    }

    if (!username.trim() || !email.trim() || !password) {
      setError('Please fill in Username, Email ID, and Password.');
      return;
    }

    if (mode === 'register' && password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:3003/api/auth/${mode}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: username.trim(),
            email: email.trim(),
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Authentication failed. Please try again.'
        );
      }

      if (!data.user) {
        throw new Error('The server did not return a user account.');
      }

      const authenticatedUser = data.user as User;

      // Admin Login must accept only an account with admin role.
      if (adminOnly && authenticatedUser.role !== 'admin') {
        throw new Error(
          'Access denied. Please use an authorized admin account.'
        );
      }

      Storage.saveUser(authenticatedUser);
      Storage.setActiveSession(authenticatedUser);

      setSuccessMsg(
        mode === 'login'
          ? `Welcome back, ${authenticatedUser.username}!`
          : 'Account registered successfully!'
      );

      window.setTimeout(() => {
        onSuccess(authenticatedUser);
        onClose();
      }, 500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to connect to the backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 sm:p-8 relative">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
            <Shield className="w-5 h-5" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              PhishGuard
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              {adminOnly ? 'Administrator Login' : 'User Authentication'}
            </p>
          </div>
        </div>

        {/* Login/Register tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/60 rounded-lg border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              mode === 'login'
                ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Log In
          </button>

          {!adminOnly && (
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                mode === 'register'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register User
            </button>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Authentication form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Name
            </label>

            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email ID
            </label>

            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@domain.com"
                autoComplete="email"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Password
            </label>

            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete={
                  mode === 'login'
                    ? 'current-password'
                    : 'new-password'
                }
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold tracking-wide transition-all shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 mt-2"
          >
            <span>
              {loading
                ? 'Please wait...'
                : mode === 'login'
                  ? 'Authenticate Session'
                  : 'Create Account'}
            </span>

            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        

        {/* Back button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
};

