
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
   avatar?: string;
  organization?: string;
  securityClearance?: string;
  lastLogin?: string;

  dateOfBirth?: string;
  address?: string;
  gender?: string;
  mobileNumber?: string;
}

export type ScanType =
  | 'email'
  | 'url'
  | 'qr'
  | 'screenshot'
  | 'ai_image'
  | 'message';

export type ThreatLevel = 'safe' | 'suspicious' | 'phishing';

export interface ScanResult {
  id: string;
  userId: string;
  userEmail: string;
  type: ScanType;
  title: string;
  targetContent: string;
  threatLevel: ThreatLevel;
  confidence: number;
  riskScore: number;
  modelUsed: 'SVM' | 'Logistic Regression' | 'Random Forest' | 'XGBoost';
  timestamp: string;
  reasons: string[];
  featuresExtracted: Record<string, string | number | boolean>;

  modelComparison?: {
    svmAccuracy: number;
    logisticRegressionAccuracy: number;
    rfAccuracy: number;
    xgboostAccuracy: number;
  };

  additionalMetadata?: {
    imageSrc?: string;
    decodedQr?: string;
    senderAddress?: string;
    spfDkimStatus?: string;
    deepfakeScore?: number;
  };
}

export type ThemePreset =
  | 'cyber-dark'
  | 'emerald-guard'
  | 'navy-sovereign'
  | 'clean-slate'
  | 'dark-blue'
  | 'light-blue'
  | 'white-theme'
  | 'black-theme'
  | 'green-theme';

export interface ThemeSettings {
  sidebarColor: string;
  cardColor: string;
  accentColor: string;
  textColor: string;
  bgColor: string;
  preset: ThemePreset;
  sensitivity: 'conservative' | 'balanced' | 'aggressive';
  defaultModel: 'SVM' | 'Logistic Regression' | 'Random Forest';
}
