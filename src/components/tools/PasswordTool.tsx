import React, { useState } from 'react';
import { evaluatePasswordStrength, generateSafePassword } from '../../utils/mlEngine';
import { 
  KeyRound, 
  ShieldCheck, 
  Copy, 
  Check, 
  RefreshCw, 
  Sliders, 
  Lock, 
  Sparkles,
  Info,
  Clock,
  Zap
} from 'lucide-react';

export const PasswordTool: React.FC = () => {
  // Generator State
  const [passLength, setPassLength] = useState(18);
  const [useSymbols, setUseSymbols] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState(() => generateSafePassword(18, true, true));
  const [copied, setCopied] = useState(false);

  // Strength Analyzer State
  const [testPassword, setTestPassword] = useState('');
  const strength = evaluatePasswordStrength(testPassword);

  const handleGenerate = () => {
    const pw = generateSafePassword(passLength, useSymbols, useNumbers);
    setGeneratedPassword(pw);
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0: return 'bg-slate-700 text-slate-400';
      case 1: return 'bg-rose-500 text-rose-300';
      case 2: return 'bg-amber-500 text-amber-300';
      case 3: return 'bg-cyan-500 text-cyan-300';
      case 4: return 'bg-emerald-500 text-emerald-300';
      default: return 'bg-slate-700 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-cyan-400" />
          <span>Password Generator & Vault</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
Generates strong passwords to protect against hacking and password-guessing attacks.        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: "Make a Safe Password" (Generator) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Make a Safe Password (Generator)
              </h2>
            </div>

            {/* Password Display Box */}
            <div className="relative">
              <div className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between gap-2 overflow-hidden">
                <span className="font-mono text-sm text-cyan-300 font-bold tracking-wider truncate select-all">
                  {generatedPassword}
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="p-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer"
                    title="Regenerate"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {copied && (
                <div className="absolute -top-7 right-2 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-[10px] text-emerald-300">
                  Copied to clipboard!
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                  <span>Character Length:</span>
                  <span className="font-mono font-bold text-cyan-400">{passLength} characters</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="48"
                  value={passLength}
                  onChange={(e) => setPassLength(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <input
                    type="checkbox"
                    checked={useSymbols}
                    onChange={(e) => setUseSymbols(e.target.checked)}
                    className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <span>Include Symbols (!@#$)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <input
                    type="checkbox"
                    checked={useNumbers}
                    onChange={(e) => setUseNumbers(e.target.checked)}
                    className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <span>Include Numbers (0-9)</span>
                </label>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold tracking-wide transition-all shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Generate Cryptographic Safe Password</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Password Strength & Entropy Analyzer */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Live Password Strength & Entropy Analyzer
              </h2>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Test Your Existing or Proposed Password:
              </label>
              <input
                type="text"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                placeholder="Type any password to measure Shannon entropy..."
                className="w-full p-3 font-mono text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Strength Meter */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Strength Rating:</span>
                <span className="font-bold font-mono text-slate-200">{strength.label}</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      step <= strength.score ? getStrengthColor(strength.score).split(' ')[0] : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-medium block">
                  Shannon Entropy
                </span>
                <span className="text-base font-bold font-mono text-cyan-400 mt-0.5 block tabular-nums">
                  {strength.entropyBits} bits
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {strength.entropyBits >= 60 ? 'Safe for banking & master keys' : 'Vulnerable to brute-force'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-medium block">
                  Brute-Force Crack Time
                </span>
                <span className="text-base font-bold font-mono text-emerald-400 mt-0.5 block truncate">
                  {strength.crackTime}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Assuming 10 billion guesses/sec
                </span>
              </div>
            </div>

            {/* Actionable Recommendations */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-300 block">
                Security Recommendations:
              </span>
              <ul className="space-y-1 text-xs text-slate-400">
                {strength.feedback.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-cyan-400 shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
