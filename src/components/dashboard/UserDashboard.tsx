
import React from 'react';
import { User, ScanResult } from '../../types';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Mail,
  Globe,
  QrCode,
  Camera,
  Image as ImageIcon,
  KeyRound,
  MessageSquare,
  Download,
  ArrowUpRight,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { downloadScanPdfReport } from '../../utils/pdfGenerator';

interface UserDashboardProps {
  currentUser: User;
  scans: ScanResult[];
  setActiveTab: (tab: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  scans,
  setActiveTab
}) => {
  const userScans = scans.filter(
    s => s.userId === currentUser.id
  );

  const totalScans = userScans.length;

  const phishingCount = userScans.filter(
    s => s.threatLevel === 'phishing'
  ).length;

  const safeCount = userScans.filter(
    s => s.threatLevel === 'safe'
  ).length;

  const quickLaunchers = [
    {
      id: 'email',
      label: 'Email Scanner',
      desc: 'Headers, SPF/DKIM & Body',
      icon: Mail,
      color: 'text-cyan-400'
    },
    {
      id: 'url',
      label: 'URL Inspector',
      desc: 'Typo-squatting & Homoglyphs',
      icon: Globe,
      color: 'text-blue-400'
    },
    {
      id: 'qr',
      label: 'Quishing QR Code',
      desc: 'Auto-dialers & Deep links',
      icon: QrCode,
      color: 'text-indigo-400'
    },
    {
      id: 'screenshot',
      label: 'Screenshot OCR',
      desc: 'Counterfeit UI & Fake locks',
      icon: Camera,
      color: 'text-purple-400'
    },
    {
      id: 'ai_image',
      label: 'AI Deepfake Scan',
      desc: 'Real Photo vs AI Synthesis',
      icon: ImageIcon,
      color: 'text-rose-400'
    },
    {
      id: 'password',
      label: 'Safe Password',
      desc: 'Generator & Live Entropy',
      icon: KeyRound,
      color: 'text-emerald-400'
    },
    {
      id: 'message',
      label: 'Message NLP',
      desc: 'SMS Smishing & Panic Scams',
      icon: MessageSquare,
      color: 'text-amber-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Welcome, {currentUser.username}
            </h1>

            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              PhishGuard helps detect suspicious emails, fake sender
              information, and potential digital threats to support
              safer online communication.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('email')}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>New Email Scan</span>
            </button>

            <button
              onClick={() => setActiveTab('analysis')}
              className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Full Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Scans Run
            </span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {totalScans}
            </span>
            <span className="text-[11px] text-slate-400">
              across available detectors
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-rose-900/40 bg-rose-950/20 shadow-lg">
          <div className="flex items-center justify-between text-rose-300 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Phishing Detected
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-300 tabular-nums">
              {phishingCount}
            </span>
            <span className="text-[11px] text-rose-400/80">
              Phishing threats identified
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-900/40 bg-emerald-950/20 shadow-lg">
          <div className="flex items-center justify-between text-emerald-300 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Safe Results
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-300 tabular-nums">
              {safeCount}
            </span>
            <span className="text-[11px] text-emerald-400/80">
              Safe scans identified
            </span>
          </div>
        </div>
      </div>

      {/* Quick Launchers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Scanning Suites & Threat Detectors</span>
          </h2>

          <span className="text-xs text-slate-400">
            Select a detector to begin
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickLaunchers.map(item => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="p-4 rounded-xl border border-slate-800 bg-[var(--theme-card)] hover:border-cyan-500/40 hover:bg-slate-850 transition-all text-left group shadow-lg flex flex-col justify-between h-32 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {item.label}
                  </h3>

                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="p-5 rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Recent Scans
            </h2>

            <p className="text-xs text-slate-400 mt-0.5">
              View your latest scan results and download reports
            </p>
          </div>

          <button
            onClick={() => setActiveTab('history')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
          >
            <span>View Full History</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {userScans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Target / Subject</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Verdict</th>
                  <th className="py-2.5 px-3 text-right">Confidence</th>
                  <th className="py-2.5 px-3 text-right">Risk Score</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60 font-sans">
                {userScans.slice(0, 5).map(scan => (
                  <tr
                    key={scan.id}
                    className="hover:bg-slate-850/60 transition-colors"
                  >
                    <td className="py-3 px-3 max-w-[240px]">
                      <p className="font-medium text-slate-200 truncate">
                        {scan.title}
                      </p>

                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {new Date(scan.timestamp).toLocaleString()}
                      </p>
                    </td>

                    <td className="py-3 px-3">
                      <span className="capitalize text-slate-400">
                        {scan.type.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                          scan.threatLevel === 'phishing'
                            ? 'text-rose-400'
                            : scan.threatLevel === 'suspicious'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                        }`}
                      >
                        {scan.threatLevel === 'phishing' ? (
                          <ShieldAlert className="w-3.5 h-3.5" />
                        ) : scan.threatLevel === 'suspicious' ? (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        )}

                        <span className="capitalize">
                          {scan.threatLevel}
                        </span>
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-300 font-bold tabular-nums">
                      {scan.confidence}%
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold tabular-nums">
                      <span
                        className={`${
                          scan.riskScore > 70
                            ? 'text-rose-400'
                            : scan.riskScore > 30
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                        }`}
                      >
                        {scan.riskScore}/100
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => downloadScanPdfReport(scan)}
                        title="Download Scan Report"
                        className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-slate-700/80 transition-colors inline-flex items-center gap-1 text-[11px]"
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
        ) : (
          <div className="py-10 text-center text-slate-500 text-xs">
            No scans recorded in your session yet. Use any of the detectors above to run your first scan.
          </div>
        )}
      </div>
    </div>
  );
};
