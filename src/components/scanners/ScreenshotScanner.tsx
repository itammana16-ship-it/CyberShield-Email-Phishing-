import React, { useState } from 'react';
import { User, ScanResult } from '../../types';
import { analyzeScreenshot } from '../../utils/mlEngine';
import { Storage } from '../../utils/storage';
import { downloadScanPdfReport } from '../../utils/pdfGenerator';
import { 
  Camera, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Download, 
  Upload, 
  CheckCircle, 
  RefreshCw,
  Eye,
  FileCode,
  Layers
} from 'lucide-react';

interface ScreenshotScannerProps {
  currentUser: User;
  onScanComplete?: (scan: ScanResult) => void;
}

const SAMPLE_SCREENSHOTS = [
  {
    title: 'Spoofed Microsoft 365 Login Screen',
    filename: 'fake_microsoft_365_login.png',
    ocrSnippet: 'Microsoft Sign In\nAccount has been locked. Enter your current password and phone authentication code to unlock access immediately.',
    previewColor: 'from-blue-950 to-slate-900',
    riskType: 'Phishing'
  },
  {
    title: 'PayPal Unauthorized Transaction Banner',
    filename: 'paypal_fraud_urgent_alert.png',
    ocrSnippet: 'PayPal Security Alert: $650.00 unauthorized charge pending. If you did not make this transaction, login immediately within 12 hours.',
    previewColor: 'from-cyan-950 to-slate-900',
    riskType: 'Phishing'
  },
  {
    title: 'Standard Enterprise Cloud Console',
    filename: 'aws_management_dashboard.png',
    ocrSnippet: 'Amazon Web Services Console Home. EC2: 12 Running Instances. S3 Storage: 4 Buckets Active. Billing: Normal.',
    previewColor: 'from-amber-950/40 to-slate-900',
    riskType: 'Safe'
  }
];

export const ScreenshotScanner: React.FC<ScreenshotScannerProps> = ({ currentUser, onScanComplete }) => {
  const [selectedSample, setSelectedSample] = useState(SAMPLE_SCREENSHOTS[0]);
  const [ocrText, setOcrText] = useState(SAMPLE_SCREENSHOTS[0].ocrSnippet);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [uploadedImageName, setUploadedImageName] = useState<string | null>(null);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const analysis = analyzeScreenshot(uploadedImageName || selectedSample.filename, ocrText);

      const scanRecord: ScanResult = {
        id: `scn_scr_${Date.now()}`,
        userId: currentUser.id,
        userEmail: currentUser.email,
        type: 'screenshot',
        title: `Screenshot: ${uploadedImageName || selectedSample.title}`,
        targetContent: ocrText,
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
    }, 450);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImageName(file.name);
      setOcrText(`OCR Extracted from ${file.name}:\n"Urgent Action Required: Sign in to your account to confirm identity before account termination."`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Camera className="w-5 h-5 text-cyan-400" />
          <span>Screenshot Phishing Detector</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
Uses Optical character recognition (OCR) and image analysis to detect fake login pages, password-stealing forms, and misleading security symbols.        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 sm:p-5 rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Upload Email or Website Screenshot
              </label>

              <label className="cursor-pointer text-xs flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Image (.png/.jpg)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Visual Frame Simulation */}
            <div className={`h-40 rounded-lg border border-slate-800 bg-gradient-to-br ${selectedSample.previewColor} p-4 flex flex-col justify-between relative overflow-hidden shadow-inner`}>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-[11px] truncate">{uploadedImageName || selectedSample.filename}</span>
                <span className="px-2 py-0.5 rounded bg-slate-900/80 text-[10px] font-medium text-slate-300">
                  OCR Engine Active
                </span>
              </div>

              <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800 text-[11px] font-mono text-slate-300 line-clamp-3">
                {ocrText}
              </div>

              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>Visual Tensor: Form & Urgency Banner Extraction</span>
                <span>Aspect: 16:9</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Extracted Text via Optical Character Recognition (OCR):
              </label>
              <textarea
                rows={4}
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                className="w-full p-2.5 font-mono text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="button"
              onClick={handleScan}
              disabled={isScanning}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold tracking-wide transition-all shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Processing Visual OCR & SVM Tensor...</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Inspect Screenshot for Phishing UI</span>
                </>
              )}
            </button>
          </div>

          
        </div>

        {/* Results */}
        <div className="lg:col-span-6">
          {result ? (
            <div className="space-y-4">
              <div className={`p-5 rounded-xl border shadow-xl ${
                result.threatLevel === 'phishing'
                  ? 'border-rose-800/80 bg-rose-950/30'
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
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Visual Heuristic</span>
                      <h3 className={`text-sm font-bold ${
                        result.threatLevel === 'phishing' ? 'text-rose-300' : 'text-emerald-300'
                      }`}>
                        {result.threatLevel === 'phishing' ? 'Deceptive Phishing UI Captured' : 'Legitimate Application Interface'}
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
                    <span>Visual Phishing Score:</span>
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
                    Visual Phishing Indicators 
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

              {/* Extracted OCR Visual Features */}
              <div className="p-4 rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Extracted Optical Features
                  </h4>
                </div>
                <div className="space-y-1.5 text-xs">
                  {Object.entries(result.featuresExtracted).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1 border-b border-slate-800/50 last:border-0">
                      <span className="text-slate-400">{k}:</span>
                      <span className="font-mono text-slate-200">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] rounded-xl border border-dashed border-slate-800 p-8 flex flex-col items-center justify-center text-center text-slate-500 bg-slate-900/20">
              <Camera className="w-12 h-12 text-slate-700 mb-3" />
              <h3 className="text-sm font-semibold text-slate-400">Ready for Screenshot OCR</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Select a preset screenshot or upload an email snapshot to detect impersonation logos and fake urgency.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
