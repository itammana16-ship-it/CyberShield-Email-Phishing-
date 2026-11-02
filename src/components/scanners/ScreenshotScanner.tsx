
import React, { useState } from 'react';
import { User, ScanResult } from '../../types';
import { analyzeScreenshot } from '../../utils/mlEngine';
import { Storage } from '../../utils/storage';
import { downloadScanPdfReport } from '../../utils/pdfGenerator';
import { createWorker } from 'tesseract.js';
import {
  Camera,
  ShieldAlert,
  ShieldCheck,
  Download,
  Upload,
  CheckCircle,
  RefreshCw,
  Eye,
  Layers
} from 'lucide-react';

interface ScreenshotScannerProps {
  currentUser: User;
  onScanComplete?: (scan: ScanResult) => void;
}

export const ScreenshotScanner: React.FC<ScreenshotScannerProps> = ({
  currentUser,
  onScanComplete
}) => {
  const [ocrText, setOcrText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [uploadedImageName, setUploadedImageName] = useState<string | null>(null);
  const [ocrStatus, setOcrStatus] = useState('');

  // Real OCR image upload using Tesseract.js
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      alert('Please upload a PNG, JPG, or WebP image.');
      e.target.value = '';
      return;
    }

    setUploadedImageName(file.name);
    setResult(null);
    setIsScanning(true);
    setOcrStatus('Initializing OCR engine...');
    setOcrText('Extracting text from uploaded image...');

    let worker: Awaited<ReturnType<typeof createWorker>> | undefined;

    try {
      worker = await createWorker('eng');

      setOcrStatus('Reading text from image...');

      const { data } = await worker.recognize(file);
      const extractedText = data.text.trim();

      if (!extractedText) {
        setOcrText('');
        setOcrStatus('No readable text found in this image.');
        return;
      }

      setOcrText(extractedText);
      setOcrStatus(
        `OCR completed successfully. ${Math.round(data.confidence)}% OCR confidence.`
      );
    } catch (error) {
      console.error('Screenshot OCR Error:', error);

      setOcrText('');
      setOcrStatus('OCR failed. Please try another image.');
      alert('Could not extract text from this image. Please try again.');
    } finally {
      if (worker) {
        await worker.terminate();
      }

      setIsScanning(false);
      e.target.value = '';
    }
  };

  // Analyze the extracted OCR text
  const handleScan = () => {
    if (isScanning) return;

    if (!ocrText.trim()) {
      alert('Please upload an image with readable text or enter text manually.');
      return;
    }

    setIsScanning(true);

    try {
      const analysis = analyzeScreenshot(
        uploadedImageName || 'uploaded_screenshot.png',
        ocrText
      );

      const scanRecord: ScanResult = {
        id: `scn_scr_${Date.now()}`,
        userId: currentUser.id,
        userEmail: currentUser.email,
        type: 'screenshot',
        title: `Screenshot: ${uploadedImageName || 'Uploaded Screenshot'}`,
        targetContent: ocrText,
        threatLevel: analysis.threatLevel,
        confidence: analysis.confidence,
        riskScore: analysis.riskScore,
        modelUsed: 'Random Forest',
        timestamp: new Date().toISOString(),
        reasons: analysis.reasons,
        featuresExtracted: analysis.featuresExtracted
      };

      Storage.addScan(scanRecord);
      setResult(scanRecord);

      if (onScanComplete) {
        onScanComplete(scanRecord);
      }
    } catch (error) {
      console.error('Screenshot Analysis Error:', error);
      alert('Screenshot analysis failed. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Camera className="w-5 h-5 text-cyan-400" />
          <span>Screenshot Phishing Detector</span>
        </h1>

        <p className="text-xs text-slate-400 mt-1">
          Uses Optical Character Recognition (OCR) to extract screenshot
          text and heuristic analysis to identify potential phishing indicators.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Upload and Input Section */}
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
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileUpload}
                  disabled={isScanning}
                  className="hidden"
                />
              </label>
            </div>

            {/* OCR Preview */}
            <div className="h-40 rounded-lg border border-slate-800 bg-gradient-to-br from-slate-950 to-slate-900 p-4 flex flex-col justify-between relative overflow-hidden shadow-inner">

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-[11px] truncate">
                  {uploadedImageName || 'No image uploaded'}
                </span>

                <span className="px-2 py-0.5 rounded bg-slate-900/80 text-[10px] font-medium text-slate-300">
                  OCR Engine
                </span>
              </div>

              <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800 text-[11px] font-mono text-slate-300 line-clamp-3">
                {ocrText || 'No OCR text available.'}
              </div>

              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>OCR Text Extraction</span>
                <span>Image Processing</span>
              </div>
            </div>

            {/* OCR Status */}
            {ocrStatus && (
              <div className="text-xs text-cyan-300 bg-cyan-950/30 border border-cyan-800/40 rounded-lg p-2.5">
                {isScanning && (
                  <RefreshCw className="w-3.5 h-3.5 inline mr-2 animate-spin" />
                )}
                {ocrStatus}
              </div>
            )}

            {/* OCR Text Input */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Extracted Text via Optical Character Recognition (OCR):
              </label>

              <textarea
                rows={4}
                value={ocrText}
                onChange={(e) => {
                  setOcrText(e.target.value);
                  setResult(null);
                }}
                className="w-full p-2.5 font-mono text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                placeholder="Extracted OCR text will appear here..."
              />
            </div>

            {/* Scan Button */}
            <button
              type="button"
              onClick={handleScan}
              disabled={isScanning || !ocrText.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold tracking-wide transition-all shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Processing Screenshot...</span>
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

        {/* Results Section */}
        <div className="lg:col-span-6">

          {result ? (
            <div className="space-y-4">

              {/* Verdict Card */}
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
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        OCR Text Heuristic
                      </span>

                      <h3 className={`text-sm font-bold ${
                        result.threatLevel === 'phishing'
                          ? 'text-rose-300'
                          : result.threatLevel === 'suspicious'
                            ? 'text-amber-300'
                            : 'text-emerald-300'
                      }`}>
                        {result.threatLevel === 'phishing'
                          ? 'Potential Phishing Interface'
                          : result.threatLevel === 'suspicious'
                            ? 'Suspicious Application Interface'
                            : 'No Strong Phishing Indicators Found'}
                      </h3>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      Confidence
                    </span>

                    <span className="text-sm font-bold font-mono text-white tabular-nums">
                      {result.confidence}%
                    </span>
                  </div>
                </div>

                {/* Risk Score */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Visual Phishing Score:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {result.riskScore} / 100
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        result.threatLevel === 'phishing'
                          ? 'bg-rose-500'
                          : result.threatLevel === 'suspicious'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                      }`}
                      style={{ width: `${result.riskScore}%` }}
                    />
                  </div>
                </div>

                {/* PDF Report */}
                <button
                  type="button"
                  onClick={() => downloadScanPdfReport(result)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-800/40 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Download PDF Report</span>
                </button>

              </div>

              {/* Phishing Indicators */}
              <div className="p-4 rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Phishing Indicators
                  </h4>
                </div>

                <ul className="space-y-2">
                  {result.reasons.map((r, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-200"
                    >
                      <span className="text-cyan-400 font-mono font-bold">
                        {i + 1}.
                      </span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Extracted OCR Features */}
              <div className="p-4 rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Extracted OCR Features
                  </h4>
                </div>

                <div className="space-y-1.5 text-xs">
                  {Object.entries(result.featuresExtracted).map(([k, v]) => (
                    <div
                      key={k}
                      className="flex justify-between py-1 border-b border-slate-800/50 last:border-0"
                    >
                      <span className="text-slate-400">{k}:</span>
                      <span className="font-mono text-slate-200">
                        {String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (

            /* Empty State */
            <div className="h-full min-h-[300px] rounded-xl border border-dashed border-slate-800 p-8 flex flex-col items-center justify-center text-center text-slate-500 bg-slate-900/20">
              <Camera className="w-12 h-12 text-slate-700 mb-3" />

              <h3 className="text-sm font-semibold text-slate-400">
                Ready for Screenshot OCR
              </h3>

              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Upload an email or website screenshot. OCR will extract
                readable text before phishing heuristic analysis.
              </p>
            </div>

          )}

        </div>
      </div>
    </div>
  );
};
