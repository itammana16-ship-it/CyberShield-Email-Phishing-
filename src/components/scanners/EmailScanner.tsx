import React, { useState } from 'react';
import { User, ScanResult } from '../../types';
import { extractEmailFeatures, runSvmEmailClassifier } from '../../utils/mlEngine';
import { Storage } from '../../utils/storage';
import { downloadScanPdfReport } from '../../utils/pdfGenerator';
import { 
  Mail, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Download, 
  FileText, 
  CheckCircle, 
  Upload, 
  RefreshCw,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';

interface EmailScannerProps {
  currentUser: User;
  onScanComplete?: (scan: ScanResult) => void;
}

const SAMPLE_EMAILS = [
  {
    title: 'Urgent Bank Account Suspended (Phishing)',
    text: `From: security-notice@chase-support-update.xyz
To: victim@company.com
Subject: URGENT: Your Chase Account has been suspended due to unauthorized login
SPF: fail
DKIM: fail

Dear Customer,

We detected unusual sign-in activity on your account from an unverified location. Immediate response is required to verify your account credentials or your online banking access will be terminated within 24 hours.

Please click the secure link below to confirm password and authenticate:
http://192.168.1.104/chase-online/verify-auth.php

Failure to complete KYC verification will lead to account freeze.

Security Team, Chase Online`
  },
  {
    title: 'CEO Wire Transfer Request (Business Email Compromise)',
    text: `From: ceo.executive@corp-board-finance.top
To: finance@corporate.com
Subject: Confidential: Immediate Wire Transfer Needed for M&A Acquisition
SPF: softfail
DKIM: fail

Hello Sarah,

I am currently in an urgent board meeting and cannot take phone calls. We have reached an agreement on the project acquisition. 

Please execute an immediate wire transfer of $85,400 to the attached invoice vendor account today before 4:00 PM EST. The transaction details are in the attached file wire_instructions.scr.

Please treat this as high priority and reply once completed.

Best regards,
Chief Executive Officer`
  },
  {
    title: 'Legitimate GitHub Security Alert (Ham / Safe)',
    text: `From: notifications@github.com
To: dev@company.com
Subject: [GitHub] Security advisory: Dependabot alert in repository
SPF: pass
DKIM: pass

Hi developer,

One of your repositories has a new security advisory detected by Dependabot:
- Repository: acme/secure-api
- Severity: Moderate
- Affected package: lodash (CVE-2026-2189)

You can review the recommended patch or merge the automated pull request at:
https://github.com/acme/secure-api/security/dependabot/4

You are receiving this email because you are watching this repository.
GitHub Inc., 88 Colin P Kelly Jr St, San Francisco, CA 94107`
  }
];

export const EmailScanner: React.FC<EmailScannerProps> = ({ currentUser, onScanComplete }) => {
  const [emailText, setEmailText] = useState(SAMPLE_EMAILS[0].text);
  const [selectedModel, setSelectedModel] = useState<'SVM' | 'Logistic Regression' | 'Random Forest'>('SVM');
  const [isScanning, setIsScanning] = useState(false);
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);

  const handleScan = () => {
    if (!emailText.trim()) return;
    setIsScanning(true);

    setTimeout(() => {
      const features = extractEmailFeatures(emailText);
      const mlOutput = runSvmEmailClassifier(features);

      const firstLine = emailText.split('\n').find(l => l.toLowerCase().startsWith('subject:')) || 'Email Content Inspection';
      const cleanTitle = firstLine.replace(/^subject:\s*/i, '').trim() || 'Email Security Analysis';

      const scanRecord: ScanResult = {
        id: `scn_eml_${Date.now()}`,
        userId: currentUser.id,
        userEmail: currentUser.email,
        type: 'email',
        title: cleanTitle,
        targetContent: emailText,
        threatLevel: mlOutput.threatLevel,
        confidence: mlOutput.confidence,
        riskScore: mlOutput.riskScore,
        modelUsed: selectedModel,
        timestamp: new Date().toISOString(),
        reasons: mlOutput.reasons,
        featuresExtracted: mlOutput.featuresExtracted,
        modelComparison: mlOutput.modelComparison
      };

      Storage.addScan(scanRecord);
      setCurrentResult(scanRecord);
      setIsScanning(false);
      if (onScanComplete) onScanComplete(scanRecord);
    }, 450);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setEmailText(text);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-400" />
            <span>Phishing Email Scanner</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
PhishGuard checks email security details, suspicious URLs, and urgent or misleading messages in real time to detect phishing attacks.          </p>
        </div>

       
      </div>

      {/* Main Grid: Input & Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Email Input Form */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Raw Email Headers & Body Payload
              </label>
              
              {/* File upload trigger */}
              <label className="cursor-pointer text-xs flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload .eml / .txt</span>
                <input
                  type="file"
                  accept=".eml,.txt,.msg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={12}
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              placeholder="Paste raw email content including headers (From, Subject, SPF, DKIM) and body..."
              className="w-full p-3 font-mono text-xs bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 leading-relaxed resize-y"
            />

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-slate-500 tabular-nums">
                {emailText.length} characters · {emailText.split('\n').length} lines
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEmailText('')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleScan}
                  disabled={isScanning || !emailText.trim()}
                  className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg shadow-lg shadow-cyan-600/20 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Classifying with SVM...</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4" />
                      <span>Execute Detection</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          
        </div>

        {/* Right Column: Scan Verdict & Feature Vector Output */}
        <div className="lg:col-span-5">
          {currentResult ? (
            <div className="space-y-4">
              {/* Verdict Card */}
              <div className={`p-5 rounded-xl border shadow-xl ${
                currentResult.threatLevel === 'phishing'
                  ? 'border-rose-800/80 bg-rose-950/30'
                  : currentResult.threatLevel === 'suspicious'
                  ? 'border-amber-800/80 bg-amber-950/30'
                  : 'border-emerald-800/80 bg-emerald-950/30'
              }`}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    {currentResult.threatLevel === 'phishing' ? (
                      <ShieldAlert className="w-6 h-6 text-rose-400" />
                    ) : currentResult.threatLevel === 'suspicious' ? (
                      <AlertTriangle className="w-6 h-6 text-amber-400" />
                    ) : (
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    )}
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Classification</span>
                      <h3 className={`text-base font-bold ${
                        currentResult.threatLevel === 'phishing'
                          ? 'text-rose-300'
                          : currentResult.threatLevel === 'suspicious'
                          ? 'text-amber-300'
                          : 'text-emerald-300'
                      }`}>
                        {currentResult.threatLevel === 'phishing'
                          ? 'High-Risk Phishing Email'
                          : currentResult.threatLevel === 'suspicious'
                          ? 'Suspicious Email'
                          : 'Legitimate Email (Ham)'}
                      </h3>
                    </div>
                  </div>

                  {/* Confidence Badge */}
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">Confidence</span>
                    <span className="text-sm font-bold font-mono text-white tabular-nums">
                      {currentResult.confidence}%
                    </span>
                  </div>
                </div>

                {/* Risk score gauge bar */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Phishing Risk Index:</span>
                    <span className="font-mono font-bold text-slate-200">{currentResult.riskScore} / 100</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        currentResult.threatLevel === 'phishing'
                          ? 'bg-rose-500'
                          : currentResult.threatLevel === 'suspicious'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${currentResult.riskScore}%` }}
                    />
                  </div>
                </div>

                {/* PDF Report Download Button */}
                <button
                  type="button"
                  onClick={() => downloadScanPdfReport(currentResult)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-800/40 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Download PDF Report</span>
                </button>
              </div>

              {/* Reasons why Fake or Real */}
              <div className="p-4 rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Detection Rationale & Forensic Indicators 
                  </h4>
                </div>

                <ul className="space-y-2 text-xs text-slate-300">
                  {currentResult.reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
                      <span className="text-cyan-400 font-mono font-bold text-[11px] shrink-0 mt-0.5">
                        {i + 1}.
                      </span>
                      <span className="leading-relaxed">{reason}</span>
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

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    {
                      label: 'Email Length',
                      value: `${currentResult.targetContent.length} characters`
                    },
                    {
                      label: 'URLs Detected',
                      value: String(
                        currentResult.targetContent.match(/https?:\/\/[^\s<>"')]+/gi)?.length || 0
                      )
                    },
                    {
                      label: 'Urgency Keywords',
                      value:
                        ['urgent', 'immediately', 'suspended', 'verify', 'password', 'limited', 'action required']
                          .filter(word =>
                            currentResult.targetContent.toLowerCase().includes(word)
                          )
                          .join(', ') || 'None detected'
                    },
                    {
                      label: 'Email Address Count',
                      value: String(
                        currentResult.targetContent.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)?.length || 0
                      )
                    },
                    {
                      label: 'Exclamation Marks',
                      value: String(
                        (currentResult.targetContent.match(/!/g) || []).length
                      )
                    },
                    {
                      label: 'Extracted ML Features',
                      value: String(
                        Object.keys(currentResult.featuresExtracted ?? {}).length
                      )
                    }
                  ].map(feature => (
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

                {Object.keys(currentResult.featuresExtracted ?? {}).length > 0 && (
                  <div className="border-t border-slate-800 pt-3">
                    <p className="text-[10px] text-slate-500 font-medium mb-2">
                      Extracted ML Feature Values
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(currentResult.featuresExtracted).map(([key, value]) => (
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
              </div>


              
            </div>
          ) : (
            
            <div className="h-full min-h-[380px] rounded-xl border border-dashed border-slate-800 p-8 flex flex-col items-center justify-center text-center text-slate-500 bg-slate-900/20">
              <Mail className="w-12 h-12 text-slate-700 mb-3" />
              <h3 className="text-sm font-semibold text-slate-400">No Email Scanned Yet</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Enter email text or choose one of the pre-loaded scenarios, then click "Execute SVM Detection" to view risk score, confidence %, and detailed reasons.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
