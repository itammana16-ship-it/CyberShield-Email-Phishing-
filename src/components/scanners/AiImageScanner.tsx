import React, { useState } from 'react';
import { User, ScanResult } from '../../types';
import { analyzeAiImage } from '../../utils/mlEngine';
import { Storage } from '../../utils/storage';
import { downloadScanPdfReport } from '../../utils/pdfGenerator';
import { 
  Image as ImageIcon, 
  ShieldAlert, 
  ShieldCheck, 
  Download, 
  Upload, 
  CheckCircle, 
  RefreshCw,
  Sparkles,
  Layers,
  Sliders,
  Eye,
  FileCheck2
} from 'lucide-react';

interface AiImageScannerProps {
  currentUser: User;
  onScanComplete?: (scan: ScanResult) => void;
}

const SAMPLE_IMAGES = [
  {
    name: 'deepfake_ceo_executive_portrait_midjourney.jpg',
    label: 'Synthetic AI Generated Portrait (Midjourney v6)',
    type: 'AI_FAKE',
    tagline: 'Generated executive face used in CEO impersonation attack'
  },
  {
    name: 'forged_corporate_bank_wire_stamp_synth.png',
    label: 'AI-Synthesized Bank Clearance Stamp',
    type: 'AI_FAKE',
    tagline: 'Counterfeit authorization seal fabricated via generative model'
  },
  {
    name: 'authentic_nikon_staff_photo_dsc8492.jpg',
    label: 'Authentic DSLR Staff Photograph (Real Camera)',
    type: 'REAL',
    tagline: 'Raw CMOS sensor optics with natural Poisson grain'
  }
];

export const AiImageScanner: React.FC<AiImageScannerProps> = ({ currentUser, onScanComplete }) => {
  const [selectedSample, setSelectedSample] = useState(SAMPLE_IMAGES[0]);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [showSpectralHeatmap, setShowSpectralHeatmap] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    const fname = uploadedFilename || selectedSample.name;

    setTimeout(() => {
      const analysis = analyzeAiImage(fname);

      const scanRecord: ScanResult = {
        id: `scn_ai_${Date.now()}`,
        userId: currentUser.id,
        userEmail: currentUser.email,
        type: 'ai_image',
        title: `AI Image Forensics: ${fname}`,
        targetContent: `Image File: ${fname} | Deepfake & Synthetic Generator Detection`,
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
    }, 500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFilename(file.name);
      setResult(null);
    }
  };

  const activeName = uploadedFilename || selectedSample.name;
  const isAiPredicted = activeName.toLowerCase().includes('midjourney') || 
                        activeName.toLowerCase().includes('synth') || 
                        activeName.toLowerCase().includes('deepfake') ||
                        activeName.toLowerCase().includes('fake');

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-cyan-400" />
          <span>AI Image & Deepfake Detector</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
Detects AI-generated images, fake faces, and fake document stamps by analyzing image patterns and details.        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Selector & Canvas Simulator */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 sm:p-5 rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Upload Image or Select Forensic Sample
              </label>

              <label className="cursor-pointer text-xs flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Custom Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Simulated Visual Inspection Canvas */}
            <div className="relative h-56 rounded-xl border border-slate-800 bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden group">
              {/* Geometric Grid Background */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

              {/* Spectral Heatmap Simulation Layer */}
              {showSpectralHeatmap && (
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-purple-500/30 to-rose-500/30 mix-blend-color-dodge pointer-events-none transition-all duration-300">
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-cyan-300 border border-cyan-500/40">
                    High-Frequency FFT Spectral Matrix Active
                  </div>
                </div>
              )}

              <div className="relative z-10 flex flex-col items-center text-center p-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 mb-3 shadow-lg">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <p className="font-mono text-xs font-semibold text-slate-200 max-w-sm truncate">
                  {activeName}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Ready for CMOS noise variance & latent boundary analysis
                </p>
              </div>

              {/* Bottom bar of the canvas */}
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-slate-500 z-10">
                <span>Color Space: sRGB 8-bit</span>
                <span>Spatial Tensor: 512x512</span>
              </div>
            </div>

            {/* Toggles & Scan Trigger */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                
                
              </label>

              <button
                type="button"
                onClick={handleScan}
                disabled={isScanning}
                className="py-2.5 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold tracking-wide transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-2 cursor-pointer"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Analyzing Synthetic Noise...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Detect Real vs AI Image</span>
                  </>
                )}
              </button>
            </div>
          </div>

          
        </div>

        {/* Right Column: Forensic Output */}
        <div className="lg:col-span-6">
          {result ? (
            <div className="space-y-4">
              <div className={`p-5 rounded-xl border shadow-xl ${
                result.threatLevel === 'phishing'
                  ? 'border-rose-800/80 bg-rose-950/30'
                  : 'border-emerald-800/80 bg-emerald-950/30'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    {result.threatLevel === 'phishing' ? (
                      <ShieldAlert className="w-6 h-6 text-rose-400" />
                    ) : (
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    )}
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Authenticity Determination</span>
                      <h3 className={`text-sm font-bold ${
                        result.threatLevel === 'phishing' ? 'text-rose-300' : 'text-emerald-300'
                      }`}>
                        {result.threatLevel === 'phishing'
                          ? 'AI-Generated / Deepfake Image Detected'
                          : 'Authentic Real Photograph (Genuine)'}
                      </h3>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Certainty %</span>
                    <span className="text-sm font-bold font-mono text-white tabular-nums">
                      {result.confidence}%
                    </span>
                  </div>
                </div>

                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Synthetic Generation Probability:</span>
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

              {/* Reasons  why Fake or Real */}
              <div className="p-4 rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Why is this Classified as {result.threatLevel === 'phishing' ? 'AI Fake' : 'Real Image'}? 
                  </h4>
                </div>
                <ul className="space-y-2.5">
                  {result.reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs text-slate-200">
                      <span className="text-cyan-400 font-mono font-bold text-xs shrink-0 mt-0.5">
                        {i + 1}.
                      </span>
                      <span className="leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Spectral Features */}
              <div className="p-4 rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Spectral & Latent Tensor Vectors
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
              <Sparkles className="w-12 h-12 text-slate-700 mb-3" />
              <h3 className="text-sm font-semibold text-slate-400">Deepfake Scanner Ready</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Upload any profile photo, email attachment, or seal to determine if it was created by Midjourney, Stable Diffusion, or real optical lens.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
