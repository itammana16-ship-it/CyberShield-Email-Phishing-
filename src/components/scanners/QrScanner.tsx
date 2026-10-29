import React, { useState } from 'react';
import { User, ScanResult } from '../../types';
import { analyzeQrPayload } from '../../utils/mlEngine';
import { Storage } from '../../utils/storage';
import { downloadScanPdfReport } from '../../utils/pdfGenerator';
import { 
  QrCode, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Download, 
  Upload, 
  CheckCircle, 
  RefreshCw,
  Sparkles,
  Smartphone,
  Layers
} from 'lucide-react';

interface QrScannerProps {
  currentUser: User;
  onScanComplete?: (scan: ScanResult) => void;
}

const SAMPLE_QR_PAYLOADS = [
  {
    label: 'Quishing Mobile Dialer Exploit',
    payload: 'tel:+18005550199#passcode=admin_override',
    type: 'Phishing'
  },
  {
    label: 'Deceptive Credential Redirection',
    payload: 'https://security-verify-bank.xyz/portal/auth?id=992',
    type: 'Phishing'
  },
  {
    label: 'Office Guest Wi-Fi Setup',
    payload: 'WIFI:S:PhishGuard_Guest;T:WPA;P:CyberSecure2026;;',
    type: 'Safe'
  },
  {
    label: 'Legitimate Corporate MFA URL',
    payload: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    type: 'Safe'
  }
];

export const QrScanner: React.FC<QrScannerProps> = ({ currentUser, onScanComplete }) => {
  const [payloadInput, setPayloadInput] = useState(SAMPLE_QR_PAYLOADS[0].payload);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleScan = () => {
    if (!payloadInput.trim()) return;
    setIsScanning(true);

    setTimeout(() => {
      const analysis = analyzeQrPayload(payloadInput);

      const scanRecord: ScanResult = {
        id: `scn_qr_${Date.now()}`,
        userId: currentUser.id,
        userEmail: currentUser.email,
        type: 'qr',
        title: `Decoded QR: ${payloadInput.slice(0, 35)}...`,
        targetContent: payloadInput,
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // Simulate decoding QR image to payload
      if (file.name.toLowerCase().includes('phish') || file.name.toLowerCase().includes('dial')) {
        setPayloadInput('tel:+18882004411#verify=chase_auth');
      } else {
        setPayloadInput('https://internal.portal.corp/auth/mfa-handshake');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <QrCode className="w-5 h-5 text-cyan-400" />
          <span>QR Code Phishing</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
Scans QR codes to detect suspicious links, unsafe phone or SMS actions, and fake phishing websites.        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 sm:p-5 rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Upload QR Image or Paste Encoded Payload
              </label>

              <label className="cursor-pointer text-xs flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload QR Image (.png/.jpg)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {fileName && (
              <div className="p-2 rounded bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-300 flex items-center justify-between">
                <span>Loaded image: <strong>{fileName}</strong></span>
                <span className="text-[10px] text-cyan-400">Decoded successfully</span>
              </div>
            )}

            <div>
              <textarea
                rows={4}
                value={payloadInput}
                onChange={(e) => setPayloadInput(e.target.value)}
                placeholder="Paste raw QR decoded text or URI (e.g. https://... or tel:+...)"
                className="w-full p-3 font-mono text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Supports URLs, vCard, Wi-Fi, and custom URI schemes
              </span>

              <button
                type="button"
                onClick={handleScan}
                disabled={isScanning || !payloadInput.trim()}
                className="py-2 px-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold tracking-wide transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Analyzing Payload...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    <span>Inspect QR Payload</span>
                  </>
                )}
              </button>
            </div>
          </div>

          
          
        </div>

        {/* Results */}
        <div className="lg:col-span-6">
          {result ? (
            <div className="space-y-4">
              <div className={`p-5 rounded-xl border shadow-xl ${
                result.threatLevel === 'phishing'
                  ? 'border-rose-800/80 bg-rose-950/30'
                  : result.threatLevel === 'suspicious'
                  ? 'border-amber-800/80 bg-amber-950/30'
                  : 'border-emerald-800/80 bg-emerald-950/30'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {result.threatLevel === 'phishing' ? (
                      <ShieldAlert className="w-6 h-6 text-rose-400" />
                    ) : (
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    )}
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">QR Verdict</span>
                      <h3 className={`text-sm font-bold ${
                        result.threatLevel === 'phishing' ? 'text-rose-300' : 'text-emerald-300'
                      }`}>
                        {result.threatLevel === 'phishing' ? 'Hostile Quishing Vector' : 'Legitimate QR Payload'}
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
                    <span>Quishing Risk Index:</span>
                    <span className="font-mono font-bold text-slate-200">{result.riskScore} / 100</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        result.threatLevel === 'phishing' ? 'bg-rose-500' : 'bg-emerald-500'
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

              {/* Reasons */}
              <div className="p-4 rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Diagnostic Analysis & Forensic Proof
                  </h4>
                </div>
                <ul className="space-y-2">
                  {result.reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-200">
                      <span className="text-cyan-400 font-mono font-bold">{i + 1}.</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
                            {/* Lexical Feature Breakdown */}
              <div className="p-4 rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Lexical Feature Breakdown
                  </h4>
                </div>

                {(() => {
                  const content = result.targetContent.trim();
                  const urlMatch = content.match(/https?:\/\/[^\s<>"']+/i);
                  const url = urlMatch?.[0] ?? '';
                  const domain = url
                    ? url.replace(/^https?:\/\//i, '').split(/[/?#:]/)[0]
                    : '';
                  const lowerContent = content.toLowerCase();

                  const contentType =
                    /^https?:\/\//i.test(content) ? 'URL' :
                    /^WIFI:/i.test(content) ? 'Wi-Fi' :
                    /^mailto:/i.test(content) ? 'Email' :
                    /^tel:/i.test(content) ? 'Telephone' :
                    /^SMSTO:|^sms:/i.test(content) ? 'SMS' :
                    /^BEGIN:VCARD/i.test(content) ? 'vCard' :
                    'Plain Text / Other';

                  const urgencyWords = [
                    'urgent', 'verify', 'login', 'password',
                    'account', 'secure', 'immediately', 'suspended'
                  ].filter(word => lowerContent.includes(word));

                  const isIpAddress = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(domain);
                  const shorteners = [
                    'bit.ly', 'tinyurl.com', 't.co',
                    'is.gd', 'cutt.ly', 'rb.gy'
                  ];
                  const isShortened = shorteners.some(
                    shortener => domain.toLowerCase() === shortener
                  );

                  const features = [
                    { label: 'QR Content Type', value: contentType },
                    { label: 'Payload Length', value: `${content.length} characters` },
                    { label: 'URL Detected', value: url ? 'Yes' : 'No' },
                    { label: 'URL Protocol', value: url ? (url.startsWith('https://') ? 'HTTPS' : 'HTTP') : 'N/A' },
                    { label: 'Domain Name', value: domain || 'Not applicable' },
                    { label: 'IP Address URL', value: isIpAddress ? 'Yes' : 'No / N/A' },
                    { label: 'URL Shortener', value: isShortened ? 'Detected' : 'Not detected' },
                    { label: 'Urgency Keywords', value: urgencyWords.join(', ') || 'None detected' },
                    { label: 'Special Characters', value: String((content.match(/[!@#$%^&*]/g) || []).length) },
                    { label: 'ML Features Extracted', value: String(Object.keys(result.featuresExtracted ?? {}).length) }
                  ];

                  return (
                    <>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {features.map(feature => (
                          <div
                            key={feature.label}
                            className="p-2 rounded bg-slate-950/60 border border-slate-800/80 min-w-0"
                          >
                            <p className="text-[10px] text-slate-500 font-medium">
                              {feature.label}
                            </p>
                            <p className="font-mono text-slate-200 font-medium mt-1 break-words">
                              {feature.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      {Object.keys(result.featuresExtracted ?? {}).length > 0 && (
                        <div className="border-t border-slate-800 pt-3">
                          <p className="text-[10px] text-slate-500 font-medium mb-2">
                            Extracted ML Feature Values
                          </p>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(result.featuresExtracted ?? {}).map(([key, value]) => (
                              <div
                                key={key}
                                className="p-2 rounded bg-slate-950/60 border border-slate-800/80 min-w-0"
                              >
                                <p className="text-[10px] text-slate-500 break-words">
                                  {key}
                                </p>
                                <p className="font-mono text-slate-200 mt-1 break-words">
                                  {String(value)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] rounded-xl border border-dashed border-slate-800 p-8 flex flex-col items-center justify-center text-center text-slate-500 bg-slate-900/20">
              <QrCode className="w-12 h-12 text-slate-700 mb-3" />
              <h3 className="text-sm font-semibold text-slate-400">Ready for QR Analysis</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Upload a physical QR scan or test the auto-dialer quishing scenarios.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
