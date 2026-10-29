import React from 'react';
import { 
  Info, 
  ShieldCheck, 
  Cpu, 
  AlertTriangle, 
  Database, 
  Code2, 
  Layers, 
  GitCompare, 
  BookOpen, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800/80 text-xs font-mono">
          <Cpu className="w-3.5 h-3.5" />
          <span>Machine Learning Research & Architectural Specification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          PhishGuard: SVM Cyber Threat Detection Platform
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
An intelligent, multi-modal cyber threat detection system that uses Support Vector Machine (SVM), NLTK to extract text features, and compares different machine learning models to detect and prevent new phishing attacks.        </p>
      </div>

      {/* Project Overview Section */}
<div className="p-6 rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg space-y-4">
  <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
    <ShieldCheck className="w-4 h-4 text-cyan-400" />
    <span>Project Overview & Objectives</span>
  </h2>

  <div className="text-xs text-slate-300 leading-relaxed space-y-4">
    <p>
      Cyber Shield is a web-based cybersecurity platform designed to detect
      and analyze phishing emails and various online threats. It uses the
      Support Vector Machine (SVM) algorithm to classify suspicious emails
      and helps identify potential threats by analyzing URLs, email headers
      such as SPF and DKIM, and suspicious social engineering keywords.
    </p>

    <p>
      The platform aims to evaluate and compare the performance of SVM with
      other machine learning algorithms, including Logistic Regression,
      Random Forest, and XGBoost. This comparison helps assess the models'
      effectiveness in identifying phishing-related activities.
    </p>

    <p>
      Cyber Shield provides a user-friendly and responsive interface for
      analyzing emails, URLs, QR codes, screenshots, and potential AI-generated
      deepfakes. Its goal is to make cybersecurity analysis more accessible
      by bringing multiple threat-detection features together in one platform.
    </p>

    <p>
      The project also aims to improve phishing detection and support the
      identification of emerging threats, including previously unseen attacks.
      Model accuracy will be evaluated through testing rather than assuming
      a fixed accuracy level, helping ensure that the system's performance
      is assessed based on actual results.
    </p>
  </div>
</div>

      

      {/* Tech Stack & Datasets */}
      <div className="p-6 rounded-xl border border-slate-800 bg-[var(--theme-card)] shadow-lg space-y-4">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Technology Stack, Datasets & Architecture</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold">
              <Code2 className="w-4 h-4" />
              <span>Languages & Frameworks</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              • Python (Machine Learning Core)<br />
              • Flask / Express Architecture<br />
              • Modern TypeScript / React 19 Frontend<br />
              • Tailwind CSS Design System
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold">
              <Cpu className="w-4 h-4" />
              <span>ML & NLP Libraries</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              • Scikit-learn (SVM, Logistic Regression)<br />
              • NLTK (Tokenization, Urgency Lexicons)<br />
              • NumPy & Pandas (Feature Matrices)<br />
              • jsPDF Forensic Exporter
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold">
              <Database className="w-4 h-4" />
              <span>Training Datasets & DB</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              • Kaggle Phishing Email Dataset<br />
              • UCI Machine Learning Repository<br />
              • Enron Benign Ham Corpus<br />
              • MongoDB Persistent Collection Store
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
