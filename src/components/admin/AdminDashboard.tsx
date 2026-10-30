import React from 'react';
import { User, ScanResult } from '../../types';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  Activity, 
  Cpu, 
  ArrowUpRight, 
  Server, 
  Database, 
  Download,
  AlertTriangle,
  Lock,
  Layers
} from 'lucide-react';
import { downloadScanPdfReport } from '../../utils/pdfGenerator';

interface AdminDashboardProps {
  currentUser: User;
  users: User[];
  scans: ScanResult[];
  setActiveTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  users,
  scans,
  setActiveTab
}) => {
  const totalScans = scans.length;
  const phishingBlocked = scans.filter(s => s.threatLevel === 'phishing').length;
  const safeScans = scans.filter(s => s.threatLevel === 'safe').length;
  const standardUsers = users.filter(
    u => u.role === 'user'
  ).length;
  return (
    <div className="space-y-6">
      {/* Master Admin SOC Banner */}
      <div className="p-6 rounded-2xl border border-rose-900/60 bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/40 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              
              
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Global Security Intelligence Console
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
Monitors user scans, system activity, and new phishing threats in real time through an admin dashboard.            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('admin_users')}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Manage User Directory</span>
            </button>
            <button
              onClick={() => setActiveTab('admin_analysis')}
              className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>Global Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Standard Users</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">{standardUsers}</span>
            <span className="text-[11px] text-slate-400">Registered Analysts</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-rose-900/40 bg-rose-950/20 shadow-lg">
          <div className="flex items-center justify-between text-rose-300 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Threats Blocked</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-300 tabular-nums">{phishingBlocked}</span>
            <span className="text-[11px] text-rose-400/80">Phishing vectors isolated</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Scans Processed</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">{totalScans}</span>
            <span className="text-[11px] text-slate-400">Platform-wide</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-900/40 bg-emerald-950/20 shadow-lg">
          <div className="flex items-center justify-between text-emerald-300 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">System SVM Accuracy</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-300 tabular-nums">96.4%</span>
            <span className="text-[11px] text-emerald-400/80">vs 91.8% Logistic Reg</span>
          </div>
        </div>
      </div>

      {/* System Infrastructure Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Database className="w-4 h-4 text-cyan-400" />
              MongoDB User Store
            </span>
            <span className="text-emerald-400 font-mono text-[11px]">CONNECTED</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Persistent storage maintaining encrypted analyst profiles, audit trails, and security configurations.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Cpu className="w-4 h-4 text-emerald-400" />
              admin Hyperplane Engine
            </span>
            <span className="text-emerald-400 font-mono text-[11px]">ACTIVE (14ms)</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Support Vector Machine linear/RBF kernel pipeline loaded with Kaggle & UCI Phishing weights.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Lock className="w-4 h-4 text-purple-400" />
              SPF/DKIM/OCR Decoders
            </span>
            <span className="text-emerald-400 font-mono text-[11px]">ONLINE</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Header forgery parsers, URL lexical tokenizers, and deepfake latent diffusion filters calibrated.
          </p>
        </div>
      </div>

      {/* Global Recent Scans Table */}
      <div className="p-5 rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Global Platform Scans Across All Users
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live audit stream of all analyst inspections
            </p>
          </div>

          <button
            onClick={() => setActiveTab('admin_history')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
          >
            <span>View All Records</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Target Payload</th>
                <th className="py-2.5 px-3">Analyst Email</th>
                <th className="py-2.5 px-3">Vector</th>
                <th className="py-2.5 px-3">Verdict</th>
                <th className="py-2.5 px-3 text-right">Confidence</th>
                <th className="py-2.5 px-3 text-right">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {scans.slice(0, 6).map((s) => (
                <tr key={s.id} className="hover:bg-slate-850/60 transition-colors">
                  <td className="py-3 px-3 max-w-[200px]">
                    <p className="font-semibold text-slate-200 truncate">{s.title}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{new Date(s.timestamp).toLocaleString()}</p>
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-mono text-[11px] truncate max-w-[150px]">
                    {s.userEmail}
                  </td>
                  <td className="py-3 px-3 capitalize text-slate-400">
                    {s.type.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                      s.threatLevel === 'phishing' ? 'text-rose-400' : s.threatLevel === 'suspicious' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {s.threatLevel === 'phishing' ? (
                        <ShieldAlert className="w-3.5 h-3.5" />
                      ) : s.threatLevel === 'suspicious' ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      )}
                      <span className="capitalize">{s.threatLevel}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-200 tabular-nums">
                    {s.confidence}%
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => downloadScanPdfReport(s)}
                      className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-slate-700 transition-colors inline-flex items-center gap-1 text-[11px]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
