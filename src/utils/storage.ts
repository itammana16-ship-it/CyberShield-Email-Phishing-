
import { User, ScanResult, ThemeSettings } from '../types';

const USERS_STORAGE_KEY = 'phishguard_users_db';
const SCANS_STORAGE_KEY = 'phishguard_scans_db';
const SESSION_KEY = 'phishguard_active_session';
const THEME_KEY = 'phishguard_theme_settings';

// Seed Initial Users
const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin_001',
    username: 'admin',
    email: 'admin@phishguard.ai',
    role: 'admin',
    createdAt: '2026-01-10T08:30:00Z',
    organization: 'PhishGuard Defense Security SOC',
    securityClearance: 'Level-5 Master Admin',
    lastLogin: '2026-10-28T07:14:00Z'
  },
  {
    id: 'usr_sec_102',
    username: 'tammana',
    email: 'itammana16@gmail.com',
    role: 'user',
    createdAt: '2026-02-14T11:20:00Z',
    organization: 'Enterprise Cyber Operations',
    securityClearance: 'Security Analyst L2',
    lastLogin: '2026-10-27T18:45:00Z'
  },
];

// Seed Initial Scans
const INITIAL_SCANS: ScanResult[] = [
  {
    id: 'scn_901',
    userId: 'usr_sec_102',
    userEmail: 'itammana16@gmail.com',
    type: 'email',
    title: 'Urgent: Your Chase Online Account has been suspended',
    targetContent: 'From: security-alert@chase-verification-center.xyz\nSubject: Urgent: Your Chase Online Account has been suspended\n\nDear Customer, We detected unusual sign-in activity from IP 192.168.1.1. Verify your account within 24 hours to avoid deletion: http://192.168.1.1/chase-auth/login.php',
    threatLevel: 'phishing',
    confidence: 98.4,
    riskScore: 96,
    modelUsed: 'SVM',
    timestamp: '2026-10-27T14:20:00Z',
    reasons: [
      'Contains high-risk urgency triggers: "verify your account", "account suspended", "urgent action required".',
      'Direct raw IP address detected inside link target (obfuscation signature bypassing standard domain reputation).',
      'High-abuse top-level domain (.xyz) used in sender address.',
      'SPF/DKIM sender authentication failed (domain spoofing detected).'
    ],
    featuresExtracted: {
      'SVM Hyperplane Margin': '1.842',
      'Urgent Keywords Detected': 4,
      'Raw IP in Hyperlinks': 'Yes (Hostile)',
      'SPF / DKIM Authentication': 'Failed / Spoofed',
      'Generic Impersonal Salutation': 'Present (Dear Customer)'
    },
    modelComparison: {
      svmAccuracy: 96.4,
      logisticRegressionAccuracy: 91.8,
      rfAccuracy: 94.2,
      xgboostAccuracy: 95.8
    }
  },
  {
    id: 'scn_902',
    userId: 'usr_sec_102',
    userEmail: 'itammana16@gmail.com',
    type: 'url',
    title: 'https://micros0ft-security-auth-update.top/login',
    targetContent: 'https://micros0ft-security-auth-update.top/login',
    threatLevel: 'phishing',
    confidence: 97.8,
    riskScore: 92,
    modelUsed: 'SVM',
    timestamp: '2026-10-27T11:15:00Z',
    reasons: [
      'Typo-squatting or brand impersonation targeting recognized entity: "MICROSOFT" (using digit "0").',
      'High-abuse top-level domain extension (.top) detected.',
      'Contains multiple deceptive credential phishing tokens: login, security, auth, update.'
    ],
    featuresExtracted: {
      'Target Host': 'micros0ft-security-auth-update.top',
      'Target Brand Impersonation': 'MICROSOFT',
      'Punycode / Homograph': 'Zero Substitution Detected',
      'Subdomain Depth': 0
    }
  },
  {
    id: 'scn_903',
    userId: 'usr_emp_204',
    userEmail: 'david.tech@corpnet.org',
    type: 'email',
    title: 'GitHub: A new public key was added to your account',
    targetContent: 'From: notifications@github.com\nSubject: [GitHub] A new public key was added to your account\n\nHi David, A new SSH key was added to your account. If you believe this was an error, review your security keys at https://github.com/settings/keys.',
    threatLevel: 'safe',
    confidence: 98.9,
    riskScore: 6,
    modelUsed: 'SVM',
    timestamp: '2026-10-26T16:30:00Z',
    reasons: [
      'Sender authentication validated: SPF & DKIM align with the claimed transmitting host (github.com).',
      'No hostile keyword concentrations or coercive urgency triggers detected.',
      'Embedded hyperlinks conform to legitimate top-level domains with valid cryptographic TLS signatures.'
    ],
    featuresExtracted: {
      'SVM Distance to Margin': '-2.140',
      'Urgent Keywords Detected': 0,
      'Raw IP in Hyperlinks': 'No',
      'SPF / DKIM Authentication': 'Passed'
    }
  },
  {
    id: 'scn_904',
    userId: 'usr_emp_305',
    userEmail: 'sarah.finance@globalfin.com',
    type: 'message',
    title: 'SMS Alert: Immediate direct deposit failure',
    targetContent: 'URGENT: Your direct payroll deposit failed due to tax withholding issues. Resolve now to receive $3,450: http://bit.ly/pay-tax-fix',
    threatLevel: 'phishing',
    confidence: 96.5,
    riskScore: 91,
    modelUsed: 'SVM',
    timestamp: '2026-10-25T10:05:00Z',
    reasons: [
      'Contains masked URL shortener (bit.ly) designed to bypass carrier SMS filters.',
      'Coercive financial panic prompt pairing payroll loss with immediate link action.',
      'Financial Scam Intent confirmed via NLP syntactic analysis.'
    ],
    featuresExtracted: {
      'NLP Sentiment Valence': 'High Urgency / Coercive',
      'Shortlink Obfuscation': 'Detected (bit.ly)',
      'Financial Scam Intent': 'Positive'
    }
  },
  {
    id: 'scn_905',
    userId: 'usr_sec_102',
    userEmail: 'itammana16@gmail.com',
    type: 'qr',
    title: 'Decoded QR: Mobile auto-dialer payload',
    targetContent: 'tel:+18005550199#code=reset9934',
    threatLevel: 'phishing',
    confidence: 98.2,
    riskScore: 89,
    modelUsed: 'SVM',
    timestamp: '2026-10-25T08:40:00Z',
    reasons: [
      'Payload invokes direct mobile URI scheme handler (tel: dialer) to trigger automatic outbound call.',
      'High-risk Quishing (QR Phishing) attack targeting automated phone verification bypass.'
    ],
    featuresExtracted: {
      'Decoded Data Type': 'Executable Mobile URI',
      'Quishing Exploit Vector': 'High (Handler Injection)'
    }
  },
  {
    id: 'scn_906',
    userId: 'usr_emp_204',
    userEmail: 'david.tech@corpnet.org',
    type: 'ai_image',
    title: 'Deepfake CEO Executive Profile Scan',
    targetContent: 'executive_portrait_midjourney_v6.png',
    threatLevel: 'phishing',
    confidence: 97.4,
    riskScore: 94,
    modelUsed: 'SVM',
    timestamp: '2026-10-24T15:20:00Z',
    reasons: [
      'High-frequency spectral loss: Absence of genuine sensor CMOS shot-noise in uniform facial areas.',
      'Diffusion latent signature: Edge blurring and non-natural micro-texture repetition typical of synthetic generators.',
      'Anomalous pupil reflection asymmetry and unnatural subsurface light scattering.'
    ],
    featuresExtracted: {
      'Spectral Consistency Score': '0.24 (Synthetic Anomaly)',
      'Generative Artifact Index': 'High (Midjourney/Flux/SD)'
    }
  }
];

export const DEFAULT_THEME: ThemeSettings = {
  sidebarColor: '#090d16',
  cardColor: '#0f172a',
  accentColor: '#06b6d4',
  textColor: '#f8fafc',
  bgColor: '#030712',
  preset: 'cyber-dark',
  sensitivity: 'balanced',
  defaultModel: 'SVM'
};

// Database helper operations
export const Storage = {
  getUsers(): User[] {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);

    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USERS;
    }
  },

  saveUser(newUser: User): void {
    const users = this.getUsers();

    const existingIndex = users.findIndex(
      u => u.email.toLowerCase() === newUser.email.toLowerCase()
    );

    if (existingIndex >= 0) {
      users[existingIndex] = newUser;
    } else {
      users.push(newUser);
    }

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  },

  removeUser(userId: string): boolean {
    const users = this.getUsers();

    const target = users.find(u => u.id === userId);

    if (target?.role === 'admin') {
      return false;
    }

    const filtered = users.filter(u => u.id !== userId);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filtered));

    return true;
  },

  getScans(): ScanResult[] {
    const raw = localStorage.getItem(SCANS_STORAGE_KEY);

    if (!raw) {
      localStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify(INITIAL_SCANS));
      return INITIAL_SCANS;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SCANS;
    }
  },

  addScan(scan: ScanResult): void {
    const scans = this.getScans();
    scans.unshift(scan);
    localStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify(scans));
  },

  getUserScans(userId: string): ScanResult[] {
    const scans = this.getScans();
    return scans.filter(s => s.userId === userId);
  },

  // Session survives refresh but normally ends when the tab/browser session closes.
  getActiveSession(): User | null {
    const raw = sessionStorage.getItem(SESSION_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setActiveSession(user: User | null): void {
    if (user) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  },

  getThemeSettings(): ThemeSettings {
    const raw = localStorage.getItem(THEME_KEY);

    if (!raw) return DEFAULT_THEME;

    try {
      return { ...DEFAULT_THEME, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_THEME;
    }
  },

  saveThemeSettings(settings: ThemeSettings): void {
    localStorage.setItem(THEME_KEY, JSON.stringify(settings));
    this.applyThemeToDOM(settings);
  },

  applyThemeToDOM(settings: ThemeSettings): void {
    const root = document.documentElement;

    root.style.setProperty('--theme-sidebar', settings.sidebarColor);
    root.style.setProperty('--theme-card', settings.cardColor);
    root.style.setProperty('--theme-accent', settings.accentColor);
    root.style.setProperty('--theme-text', settings.textColor);
    root.style.setProperty('--theme-bg', settings.bgColor);
  }
};
