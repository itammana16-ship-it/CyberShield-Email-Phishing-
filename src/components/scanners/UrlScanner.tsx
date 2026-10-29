import React, { useState } from 'react';
import { User, ScanResult } from '../../types';
import { analyzeUrl } from '../../utils/mlEngine';
import { Storage } from '../../utils/storage';
import { downloadScanPdfReport } from '../../utils/pdfGenerator';
import { 
  Globe, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Download, 
  ExternalLink, 
  CheckCircle, 
  RefreshCw,
  Search,
  Lock,
  Layers
} from 'lucide-react';

interface UrlScannerProps {
  currentUser: User;
  onScanComplete?: (scan: ScanResult) => void;
}

const SAMPLE_URLS = [
  {
    label: 'Microsoft Typo-Squatting',
    url: 'https://micros0ft-security-auth-update.top/login.php?ref=token_83921',
    category: 'Phishing'
  },
  {
    label: 'PayPal Homoglyph Spoof',
    url: 'http://paypaI-billing-verify.com/webscr/login?token=urgent',
    category: 'Phishing'
  },
  {
    label: 'Raw IP Host Link',
    url: 'http://192.168.1.105:8080/secure/bankofamerica-login',
    category: 'Phishing'
  },
  {
    label: 'Legitimate Corporate Portal',
    url: 'https://accounts.google.com/signin/v2/identifier',
    category: 'Safe'
  }
];

export const UrlScanner: React.FC<UrlScannerProps> = ({ currentUser, onScanComplete }) => {
  const [urlInput, setUrlInput] = useState(SAMPLE_URLS[0].url);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleScan = () => {
    if (!urlInput.trim()) return;
    setIsScanning(true);

    setTimeout(() => {
      const analysis = analyzeUrl(urlInput);

      const scanRecord: ScanResult = {
        id: `scn_url_${Date.now()}`,
        userId: currentUser.id,
        userEmail: currentUser.email,
        type: 'url',
        title: analysis.url,
        targetContent: analysis.url,
        threatLevel: analysis.threatLevel,
        confidence: analysis.confidence,
        riskScore: analysis.riskScore,
        modelUsed: 'SVM',
        timestamp: new Date().toISOString(),
        reasons: analysis.reasons,
        featuresExtracted: analysis.featuresExtracted
      };

      Storage.addScan(scanRecord);
      setResult(scanRecord);
      setIsScanning(false);
      if (onScanComplete) onScanComplete(scanRecord);
    }, 400);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          <span>Real-Time URL Phishing Scanner</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
Detects suspicious URLs, fake domain names, misleading subdomains, and unsafe website extensions using an SVM model.        </p>
      </div>

      {/* Input Box */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg space-y-4">
        <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider">
          Target Domain or Hyperlink URL
        </label>

        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="e.g. https://your-bank-security-auth.xyz/login"
              className="w-full pl-9 pr-3 py-2.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <button
            type="button"
            onClick={handleScan}
            disabled={isScanning || !urlInput.trim()}
            className="py-2.5 px-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold tracking-wide transition-all shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Evaluating Lexical Features...</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4" />
                <span>Scan URL Threat</span>
              </>
            )}
          </button>
        </div>

        {/* Presets */}
        
      </div>

      {/* Result Display */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className={`p-5 rounded-xl border shadow-xl ${
              result.threatLevel === 'phishing'
                ? 'border-rose-800/80 bg-rose-950/30'
                : result.threatLevel === 'suspicious'
                ? 'border-amber-800/80 bg-amber-950/30'
                : 'border-emerald-800/80 bg-emerald-950/30'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  {result.threatLevel === 'phishing' ? (
                    <ShieldAlert className="w-6 h-6 text-rose-400" />
                  ) : result.threatLevel === 'suspicious' ? (
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                  ) : (
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  )}
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Threat Verdict</span>
                    <h3 className={`text-sm font-bold ${
                      result.threatLevel === 'phishing' ? 'text-rose-300' : result.threatLevel === 'suspicious' ? 'text-amber-300' : 'text-emerald-300'
                    }`}>
                      {result.threatLevel === 'phishing' ? 'Malicious Phishing URL' : result.threatLevel === 'suspicious' ? 'Suspicious Domain' : 'Verified Safe Domain'}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Confidence</span>
                  <span className="text-sm font-bold font-mono text-white tabular-nums">
                    {result.confidence}%
                  </span>
                </div>
              </div>

              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Calculated Risk Probability:</span>
                  <span className="font-mono font-bold text-slate-200">{result.riskScore} / 100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      result.threatLevel === 'phishing' ? 'bg-rose-500' : result.threatLevel === 'suspicious' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${result.riskScore}%` }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => downloadScanPdfReport(result)}
                className="w-full py-2 px-3 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-800/40 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Download PDF Report</span>
              </button>
            </div>

            {/* Extracted Lexical Features */}
            <div className="p-4 rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Lexical Feature Breakdown
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                {Object.entries(result.featuresExtracted).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center py-1.5 border-b border-slate-800/60 last:border-0">
                    <span className="text-slate-400">{k}:</span>
                    <span className="font-mono text-slate-200 font-medium truncate max-w-[200px] text-right">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            {/* Reasons why Fake or Real */}
            <div className="p-5 rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Why is this Classified as {result.threatLevel === 'phishing' ? 'Fake / Phishing' : 'Real / Safe'}? 
                </h4>
              </div>

              <ul className="space-y-2.5">
                {result.reasons.map((reason, i) => (
                  <li key={i} className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-cyan-400 font-mono font-bold text-xs shrink-0 mt-0.5">
                      {i + 1}.
                    </span>
                    <span className="text-xs text-slate-200 leading-relaxed">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
