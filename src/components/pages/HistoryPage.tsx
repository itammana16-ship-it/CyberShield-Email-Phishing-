import React, { useState } from 'react';
import { User, ScanResult, ScanType, ThreatLevel } from '../../types';
import { downloadScanPdfReport } from '../../utils/pdfGenerator';
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  Download, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Mail, 
  Globe, 
  QrCode, 
  Camera, 
  Image as ImageIcon, 
  MessageSquare,
  Eye,
  X,
  Layers,
  CheckCircle
} from 'lucide-react';

interface HistoryPageProps {
  currentUser: User;
  scans: ScanResult[];
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ currentUser, scans }) => {
  // If user is regular user, only view own scans; if admin, can view all
  const availableScans = currentUser.role === 'admin' ? scans : scans.filter(s => s.userId === currentUser.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [threatFilter, setThreatFilter] = useState<string>('all');
  const [selectedScanDetail, setSelectedScanDetail] = useState<ScanResult | null>(null);

  const filteredScans = availableScans.filter(scan => {
    const matchesSearch = scan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          scan.targetContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          scan.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || scan.type === typeFilter;
    const matchesThreat = threatFilter === 'all' || scan.threatLevel === threatFilter;
    return matchesSearch && matchesType && matchesThreat;
  });

  const getScanTypeIcon = (type: ScanType) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4 text-cyan-400" />;
      case 'url': return <Globe className="w-4 h-4 text-blue-400" />;
      case 'qr': return <QrCode className="w-4 h-4 text-indigo-400" />;
      case 'screenshot': return <Camera className="w-4 h-4 text-purple-400" />;
      case 'ai_image': return <ImageIcon className="w-4 h-4 text-rose-400" />;
      case 'message': return <MessageSquare className="w-4 h-4 text-amber-400" />;
      default: return <HistoryIcon className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-cyan-400" />
            <span>Threat Scan History & PDF Archive</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
Keeps a secure record of all tested emails, URLs, QR codes, screenshots, and AI-generated images.          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">
            Total Records: <strong className="text-white">{filteredScans.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, extracted payload, or scan ID..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Type Filter */}
          <div className="sm:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full py-2 px-2.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Vector Types</option>
              <option value="email">Email Scans</option>
              <option value="url">URL Scans</option>
              <option value="qr">QR Code Scans</option>
              <option value="screenshot">Screenshot OCR</option>
              <option value="ai_image">AI Deepfake Scans</option>
              <option value="message">Message NLP Scans</option>
            </select>
          </div>

          {/* Threat Filter */}
          <div className="sm:col-span-3">
            <select
              value={threatFilter}
              onChange={(e) => setThreatFilter(e.target.value)}
              className="w-full py-2 px-2.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Threat Levels</option>
              <option value="phishing">Phishing (Malicious)</option>
              <option value="suspicious">Suspicious</option>
              <option value="safe">Safe (Legitimate Ham)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scans Table */}
      <div className="rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg overflow-hidden">
        {filteredScans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Inspection Title & Target</th>
                  <th className="py-3 px-4">Vector</th>
                  <th className="py-3 px-4">Threat Status</th>
                  <th className="py-3 px-4 text-right">Confidence</th>
                  <th className="py-3 px-4 text-right">Risk Score</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded bg-slate-900 border border-slate-800 shrink-0">
                          {getScanTypeIcon(scan.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-200 truncate">{scan.title}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            ID: {scan.id} · {new Date(scan.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="capitalize text-slate-400 font-medium">
                        {scan.type.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 font-semibold text-[11px] ${
                        scan.threatLevel === 'phishing'
                          ? 'text-rose-400'
                          : scan.threatLevel === 'suspicious'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}>
                        {scan.threatLevel === 'phishing' ? (
                          <ShieldAlert className="w-3.5 h-3.5" />
                        ) : scan.threatLevel === 'suspicious' ? (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        )}
                        <span className="capitalize">{scan.threatLevel}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200 tabular-nums">
                      {scan.confidence}%
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums">
                      <span className={scan.riskScore > 70 ? 'text-rose-400' : scan.riskScore > 30 ? 'text-amber-400' : 'text-emerald-400'}>
                        {scan.riskScore} / 100
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedScanDetail(scan)}
                          title="View Forensic Details & Reasons"
                          className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors inline-flex items-center gap-1 text-[11px]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={() => downloadScanPdfReport(scan)}
                          title="Download PDF Report"
                          className="p-1.5 rounded bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 hover:text-white border border-cyan-800/80 transition-colors inline-flex items-center gap-1 text-[11px]"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 text-xs">
            No scans matched your search criteria.
          </div>
        )}
      </div>

      {/* Forensic Detail Modal */}
      {selectedScanDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                  Forensic Dossier #{selectedScanDetail.id}
                </span>
                <h2 className="text-base font-bold text-white mt-0.5">
                  {selectedScanDetail.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedScanDetail(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Verdict summary card */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              selectedScanDetail.threatLevel === 'phishing'
                ? 'bg-rose-950/30 border-rose-800/80 text-rose-300'
                : 'bg-emerald-950/30 border-emerald-800/80 text-emerald-300'
            }`}>
              <div>
                <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Classification</p>
                <p className="text-sm font-bold capitalize">{selectedScanDetail.threatLevel} ({selectedScanDetail.riskScore}/100 Risk)</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Confidence</p>
                <p className="text-sm font-bold font-mono">{selectedScanDetail.confidence}%</p>
              </div>
            </div>

            {/* Target Content */}
            <div>
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Content Examined:
              </p>
              <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto">
                {selectedScanDetail.targetContent}
              </pre>
            </div>

            {/* Reasons why Fake or Real */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Forensic Reasons:
                </h4>
              </div>
              <ul className="space-y-2 text-xs">
                {selectedScanDetail.reasons.map((r, i) => (
                  <li key={i} className="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-300 flex items-start gap-2">
                    <span className="text-cyan-400 font-mono font-bold">{i + 1}.</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature Vector Table */}
            {selectedScanDetail.featuresExtracted && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    SVM Feature Vector Values:
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(selectedScanDetail.featuresExtracted).map(([k, v]) => (
                    <div key={k} className="p-2 rounded bg-slate-950 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block truncate">{k}</span>
                      <span className="font-mono text-slate-200 font-medium">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer with Download */}
            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setSelectedScanDetail(null)}
                className="py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Close
              </button>
              <button
                onClick={() => downloadScanPdfReport(selectedScanDetail)}
                className="py-2 px-4 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
