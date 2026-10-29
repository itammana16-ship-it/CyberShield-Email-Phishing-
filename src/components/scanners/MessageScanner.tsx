import React, { useState } from 'react';
import { User, ScanResult } from '../../types';
import { analyzeMessageNlp } from '../../utils/mlEngine';
import { Storage } from '../../utils/storage';
import { downloadScanPdfReport } from '../../utils/pdfGenerator';
import { 
  MessageSquare, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Download, 
  CheckCircle, 
  RefreshCw,
  Sparkles,
  Layers,
  Send
} from 'lucide-react';

interface MessageScannerProps {
  currentUser: User;
  onScanComplete?: (scan: ScanResult) => void;
}

const SAMPLE_MESSAGES = [
  {
    title: 'Smishing Payroll Interception (Malicious)',
    text: 'URGENT: Your direct deposit has failed due to withholding issues. Immediate action required to claim $2,840 or funds will be forfeited: http://bit.ly/bank-deposit-fix'
  },
  {
    title: 'Bank Fraud Alert Vishing Callback (Malicious)',
    text: 'ALERT: Suspicious card charge of $799.00 at Apple Store. If not authorized, call our fraud desk immediately at +1-800-555-0182 with code 9934.'
  },
  {
    title: 'Legitimate 2FA Code Notification (Safe)',
    text: 'Your corporate SSO verification code is 482910. It expires in 5 minutes. Do not share this code with anyone. Automated notification.'
  }
];

export const MessageScanner: React.FC<MessageScannerProps> = ({ currentUser, onScanComplete }) => {
  const [msgText, setMsgText] = useState(SAMPLE_MESSAGES[0].text);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleScan = () => {
    if (!msgText.trim()) return;
    setIsScanning(true);

    setTimeout(() => {
      const analysis = analyzeMessageNlp(msgText);

      const scanRecord: ScanResult = {
        id: `scn_msg_${Date.now()}`,
        userId: currentUser.id,
        userEmail: currentUser.email,
        type: 'message',
        title: `SMS/Chat NLP: ${msgText.slice(0, 32)}...`,
        targetContent: msgText,
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
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          <span>Message & SMS NLP Scanner</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
Applies Natural Language Processing (NLP) to detect scam messages, suspicious links, and fake phone numbers.       </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 sm:p-5 rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg space-y-4">
            <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Input SMS / WhatsApp / Chat Message Content
            </label>

            <textarea
              rows={6}
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              placeholder="Paste raw text message, SMS text, or social DM..."
              className="w-full p-3 font-mono text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 leading-relaxed"
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {msgText.length} characters · {msgText.split(' ').filter(Boolean).length} tokens
              </span>

              <button
                type="button"
                onClick={handleScan}
                disabled={isScanning || !msgText.trim()}
                className="py-2.5 px-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold tracking-wide transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Parsing NLP Semantics...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Analyze NLP Smishing Risk</span>
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
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">NLP Classification</span>
                      <h3 className={`text-sm font-bold ${
                        result.threatLevel === 'phishing' ? 'text-rose-300' : 'text-emerald-300'
                      }`}>
                        {result.threatLevel === 'phishing' ? 'High-Risk Smishing Attack' : 'Legitimate Conversational Text'}
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
                    <span>NLP Smishing Probability:</span>
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
                    NLP Rationale & Semantic Indicators
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

              {/* Extracted NLP Vectors */}
              <div className="p-4 rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    NLP Syntactic & Semantic Entities
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
              <MessageSquare className="w-12 h-12 text-slate-700 mb-3" />
              <h3 className="text-sm font-semibold text-slate-400">NLP Ready for Text Analysis</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Paste any text message or select a test scenario to evaluate urgency coercion and deceptive shortlinks.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
