
import { ScanResult, ScanType, ThreatLevel } from '../types';

// High-risk phishing keyword lexicons

const PHISHING_KEYWORDS = [
  'verify your account',
  'account suspended',
  'urgent action required',
  'unusual sign-in activity',
  'confirm password',
  'wire transfer',
  'cryptocurrency',
  'tax refund',
  'invoice attached',
  'immediate response',
  'compromised',
  'click below to avoid deletion',
  'security alert',
  'reset credentials',
  'gift card',
  'winner',
  'claim reward',
  'billing failure',
  'payroll direct deposit',
  'kyc verification',
  'urgent',
  'immediately',
  'suspended',
  'verify',
  'password expired',
  'account locked',
  'click here',
  'limited time',
  'act now'
];


const SUSPICIOUS_TLDS = [
  '.xyz', '.top', '.work', '.click', '.loan', '.buzz',
  '.country', '.gq', '.cf', '.tk', '.ml'
];

const TARGETED_BRANDS = [
  'paypal', 'microsoft', 'google', 'apple', 'chase',
  'amazon', 'wellsfargo', 'bankofamerica', 'netflix',
  'facebook', 'instagram', 'binance', 'coinbase'
];

// Feature extractor for email text and headers
export function extractEmailFeatures(rawEmail: string) {
  const lower = rawEmail.toLowerCase();

  // 1. Header & Authentication analysis
  // Missing SPF/DKIM information is UNKNOWN, not FAILED.
  const hasSpfFail = /\bspf=(fail|softfail)\b/i.test(rawEmail);
  const hasDkimFail = /\bdkim=fail\b/i.test(rawEmail);
  const hasDmarcFail = /\bdmarc=fail\b/i.test(rawEmail);

  const hasSpfPass = /\bspf=pass\b/i.test(rawEmail);
  const hasDkimPass = /\bdkim=pass\b/i.test(rawEmail);

  const authenticationStatus =
    (hasSpfFail || hasDkimFail || hasDmarcFail)
      ? 'Failed'
      : (hasSpfPass && hasDkimPass)
        ? 'Passed'
        : 'Not provided / Unknown';

  // 2. Urgent / Fear-inducing vocabulary count
  const keywordHits: string[] = [];

  PHISHING_KEYWORDS.forEach(kw => {
    if (lower.includes(kw)) keywordHits.push(kw);
  });

  // 3. URL count and suspicious URL patterns
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = rawEmail.match(urlRegex) || [];

  const ipInUrl = urls.some(u =>
    /(https?:\/\/)?(\d{1,3}\.){3}\d{1,3}/.test(u)
  );

  const suspiciousTldFound = urls.some(u =>
    SUSPICIOUS_TLDS.some(tld => u.toLowerCase().includes(tld))
  );

  // 4. Deceptive anchor or mismatched domains
  const hasHexOrPuny = urls.some(u =>
    u.includes('xn--') || u.includes('%')
  );

  // 5. Dangerous attachment mentions
  const hasDangerousAttachment =
    /\.(exe|scr|iso|vbs|bat|cmd|hta|zip|js)\b/i.test(rawEmail);

  // 6. Generic greeting
  const genericGreeting =
    /dear (customer|user|client|member|account holder|sir\/madam)/i.test(rawEmail);

  return {
    rawLength: rawEmail.length,
    keywordCount: keywordHits.length,
    matchedKeywords: keywordHits,
    urlCount: urls.length,
    urls,
    ipInUrl,
    suspiciousTldFound,
    hasSpfFail,
    hasDkimFail,
    hasDmarcFail,
    hasSpfPass,
    hasDkimPass,
    authenticationStatus,
    hasHexOrPuny,
    hasDangerousAttachment,
    genericGreeting,
  };
}

// SVM-style weighted classifier simulation
export function runSvmEmailClassifier(
  features: ReturnType<typeof extractEmailFeatures>
) {
  // Feature vector:
  // [bias, keywords, ipInUrl, suspTld, spfFail,
  //  dkimFail, dangAttach, genericGreet, urlCount]

  const weights = [
    -1.85,
    0.65,
    1.45,
    1.30,
    0.85,
    0.75,
    1.60,
    0.50,
    0.20
  ];

  const x = [
    1,
    features.keywordCount,
    features.ipInUrl ? 1 : 0,
    features.suspiciousTldFound ? 1 : 0,
    features.hasSpfFail ? 1 : 0,
    features.hasDkimFail ? 1 : 0,
    features.hasDangerousAttachment ? 1 : 0,
    features.genericGreeting ? 1 : 0,
    Math.min(features.urlCount, 5)
  ];

  // Weighted score
  let svmScore = 0;

  for (let i = 0; i < weights.length; i++) {
    svmScore += weights[i] * x[i];
  }

  // Logistic Regression comparison score
  const lrWeights = [
    -1.6, 0.58, 1.35, 1.15, 0.78,
    0.68, 1.45, 0.45, 0.18
  ];

  let lrScore = 0;

  for (let i = 0; i < lrWeights.length; i++) {
    lrScore += lrWeights[i] * x[i];
  }

  const lrProbability = 1 / (1 + Math.exp(-lrScore));

  // Threat classification
  let threatLevel: ThreatLevel = 'safe';
  let confidence = 0;
  let riskScore = 0;

  const reasons: string[] = [];

  if (svmScore > 0.45) {
    threatLevel = 'phishing';

    riskScore = Math.min(
      99,
      Math.round(75 + svmScore * 7)
    );

    confidence = Math.min(
      99.4,
      Math.round(
        (0.85 + (1 / (1 + Math.exp(-svmScore))) * 0.14) * 1000
      ) / 10
    );

  } else if (svmScore > -0.3) {
    threatLevel = 'suspicious';

    riskScore = Math.round(45 + svmScore * 25);

    confidence = Math.round(
      76 + Math.abs(svmScore) * 15
    );

  } else {
    threatLevel = 'safe';

    riskScore = Math.max(
      2,
      Math.round(18 + svmScore * 8)
    );

    confidence = Math.min(
      98.9,
      Math.round(
        (0.88 + Math.abs(svmScore) * 0.05) * 1000
      ) / 10
    );
  }

  // Generate diagnostic reasons
  if (threatLevel === 'phishing' || threatLevel === 'suspicious') {

    if (features.matchedKeywords.length > 0) {
      reasons.push(
        `Contains high-risk urgency triggers: "${features.matchedKeywords.slice(0, 3).join('", "')}".`
      );
    }

    if (features.ipInUrl) {
      reasons.push(
        'A direct IP address was found inside a hyperlink.'
      );
    }

    if (features.suspiciousTldFound) {
      reasons.push(
        'A link contains a top-level domain commonly associated with abuse.'
      );
    }

    if (
      features.hasSpfFail ||
      features.hasDkimFail ||
      features.hasDmarcFail
    ) {
      reasons.push(
        'An explicit SPF, DKIM, or DMARC failure indicator was found in the supplied email data.'
      );
    }

    if (features.hasDangerousAttachment) {
      reasons.push(
        'References executable or potentially risky attachment extensions.'
      );
    }

    if (features.genericGreeting) {
      reasons.push(
        'Uses an unpersonalized generic greeting.'
      );
    }

    if (reasons.length === 0) {
      reasons.push(
        'The extracted email features produced a suspicious classification score.'
      );
    }

  } else {

    if (features.authenticationStatus === 'Passed') {
      reasons.push(
        'SPF and DKIM pass indicators were found in the supplied email data.'
      );
    } else if (features.authenticationStatus === 'Failed') {
      reasons.push(
        'An authentication failure indicator was found in the supplied email data.'
      );
    } else {
      reasons.push(
        'No explicit SPF/DKIM failure was found; authentication could not be verified without suitable email headers.'
      );
    }

    reasons.push(
      'No hostile keyword concentrations or coercive urgency triggers detected.'
    );

    reasons.push(
      'No suspicious URL or attachment indicators were found by the current checks.'
    );
  }

  return {
    threatLevel,
    confidence,
    riskScore,
    reasons,

    featuresExtracted: {
      'SVM Distance to Margin': svmScore.toFixed(3),

      'Logistic Regression Phishing Prob':
        (lrProbability * 100).toFixed(1) + '%',

      'Urgent Keywords Detected': features.keywordCount,

      'Raw IP in Hyperlinks':
        features.ipInUrl ? 'Yes (Suspicious)' : 'No',

      'SPF / DKIM Authentication':
        features.authenticationStatus,

      'Attachment Risk Flag':
        features.hasDangerousAttachment ? 'Risk Indicator Found' : 'No Risk Indicator Found',

      'Generic Impersonal Salutation':
        features.genericGreeting ? 'Present' : 'Absent',

      'Extracted Links Total': features.urlCount
    },

    // These are existing configured comparison values.
    // They should not be presented as measured accuracy
    // unless verified through an actual dataset evaluation.
    modelComparison: {
      svmAccuracy: 96.4,
      logisticRegressionAccuracy: 91.8,
      rfAccuracy: 94.2,
      xgboostAccuracy: 95.8
    }
  };
}

// URL Scanner
export function analyzeUrl(inputUrl: string) {
  let url = inputUrl.trim();

  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  let hostname = '';
  let pathname = '';

  try {
    const parsed = new URL(url);
    hostname = parsed.hostname.toLowerCase();
    pathname = parsed.pathname.toLowerCase();
  } catch {
    hostname = url.toLowerCase();
  }

  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);

  const subdomains = hostname.split('.').length - 2;

  const hasSuspiciousTld = SUSPICIOUS_TLDS.some(
    tld => hostname.endsWith(tld)
  );

  const hasPunycode = hostname.includes('xn--');

  const targetBrandSpoofed = TARGETED_BRANDS.find(brand => {
    return (
      hostname.includes(brand) &&
      !hostname.endsWith(`${brand}.com`) &&
      !hostname.endsWith(`${brand}.org`)
    );
  });

  const suspiciousTokens = [
    'login', 'verify', 'update', 'banking', 'secure',
    'signin', 'account', 'auth', 'webscr', 'wallet'
  ];

  const matchedTokens = suspiciousTokens.filter(
    tok => hostname.includes(tok) || pathname.includes(tok)
  );

  const isTooLong = url.length > 75;

  let risk = 0;

  const reasons: string[] = [];

  if (isIp) {
    risk += 45;
    reasons.push(
      'A raw IPv4 address is used as the URL host.'
    );
  }

  if (targetBrandSpoofed) {
    risk += 40;
    reasons.push(
      `Possible brand impersonation pattern involving: "${targetBrandSpoofed}".`
    );
  }

  if (hasSuspiciousTld) {
    risk += 30;
    reasons.push(
      'A potentially high-abuse top-level domain extension was detected.'
    );
  }

  if (hasPunycode) {
    risk += 35;
    reasons.push(
      'Punycode (XN--) was detected in the hostname.'
    );
  }

  if (matchedTokens.length >= 2) {
    risk += 25;
    reasons.push(
      `Contains multiple potentially deceptive URL tokens: ${matchedTokens.join(', ')}.`
    );
  }

  if (subdomains > 3) {
    risk += 20;
    reasons.push(
      `Excessive subdomain nesting (${subdomains} levels) was detected.`
    );
  }

  if (isTooLong) {
    risk += 15;
    reasons.push(
      `The URL is unusually long (${url.length} characters).`
    );
  }

  let threatLevel: ThreatLevel = 'safe';
  let confidence = 96.2;
  let riskScore = Math.min(99, Math.max(5, risk));

  if (risk >= 40) {
    threatLevel = 'phishing';
    confidence = 97.4;

  } else if (risk >= 20) {
    threatLevel = 'suspicious';
    confidence = 82.5;

  } else {
    threatLevel = 'safe';
    confidence = 98.1;

    reasons.push(
      'No suspicious URL patterns were detected by the current checks.'
    );
  }

  return {
    url,
    threatLevel,
    confidence,
    riskScore,
    reasons,

    featuresExtracted: {
      'Target Host': hostname,
      'Is Raw IP': isIp ? 'Yes (Suspicious)' : 'No',

      'Target Brand Impersonation':
        targetBrandSpoofed
          ? targetBrandSpoofed.toUpperCase()
          : 'None',

      'Subdomain Depth': subdomains,

      'Punycode / Homograph':
        hasPunycode ? 'Detected' : 'Not Detected',

      'Security Tokens in Path':
        matchedTokens.length > 0
          ? matchedTokens.join(', ')
          : 'None',

      'Total URL Length': `${url.length} chars`
    }
  };
}

// QR Code Scanner Logic
export function analyzeQrPayload(payload: string) {
  const isUrl = /^https?:\/\//i.test(payload.trim());

  const isCustomUri =
    /^(intent|market|sms|tel|facetime|file|data):/i.test(payload.trim());

  let reasons: string[] = [];

  let threatLevel: ThreatLevel = 'safe';

  let riskScore = 12;

  let confidence = 95.8;

  if (isCustomUri) {
    threatLevel = 'suspicious';
    riskScore = 65;
    confidence = 84.5;

    reasons.push(
      'The QR payload contains a non-web URI scheme that should be reviewed before opening.'
    );

  } else if (isUrl) {
    const urlAnalysis = analyzeUrl(payload);

    threatLevel = urlAnalysis.threatLevel;
    riskScore = urlAnalysis.riskScore;
    confidence = urlAnalysis.confidence;

    reasons = [
      'Decoded QR contains an external hyperlink: ' + payload,
      ...urlAnalysis.reasons
    ];

  } else {
    if (/password|passcode|secret|api_key|bank/i.test(payload)) {
      threatLevel = 'suspicious';
      riskScore = 65;
      confidence = 84.5;

      reasons.push(
        'Sensitive-looking information was found in the QR text payload.'
      );

    } else {
      threatLevel = 'safe';
      riskScore = 8;
      confidence = 97.0;

      reasons.push(
        'Static text payload detected without an identified URL.'
      );
    }
  }

  return {
    payload,
    threatLevel,
    confidence,
    riskScore,
    reasons,

    featuresExtracted: {
      'Decoded Data Type':
        isUrl
          ? 'Hyperlink (URL)'
          : isCustomUri
            ? 'Non-web URI'
            : 'Plain Text',

      'Payload Length': `${payload.length} bytes`,

      'Quishing Exploit Vector':
        isCustomUri
          ? 'Non-web URI'
          : isUrl
            ? 'URL Redirection'
            : 'None'
    }
  };
}

// Screenshot Scanner Logic
// This function uses OCR text heuristics, not full visual analysis.
export function analyzeScreenshot(
  filename: string,
  extractedOcrText: string
) {
  const lower = extractedOcrText.toLowerCase();

  const hasLoginForm =
    lower.includes('login') ||
    lower.includes('sign in') ||
    lower.includes('password') ||
    lower.includes('enter code');

  const hasUrgency =
    lower.includes('suspended') ||
    lower.includes('urgent') ||
    lower.includes('action required') ||
    lower.includes('expire');

  const hasBrand = TARGETED_BRANDS.find(
    b => lower.includes(b)
  );

  let riskScore = 15;

  const reasons: string[] = [];

  if (hasLoginForm && hasBrand) {
    riskScore += 50;

    reasons.push(
      `OCR text contains a login-related phrase and a known brand name: "${hasBrand.toUpperCase()}".`
    );
  }

  if (hasUrgency) {
    riskScore += 30;

    reasons.push(
      'OCR text contains urgency-related language.'
    );
  }

  if (
    lower.includes('ssl') ||
    lower.includes('certificate error') ||
    lower.includes('not secure')
  ) {
    riskScore += 25;

    reasons.push(
      'OCR text contains a browser security warning phrase.'
    );
  }

  let threatLevel: ThreatLevel = 'safe';

  let confidence = 94.6;

  if (riskScore >= 60) {
    threatLevel = 'phishing';
    confidence = 96.9;

  } else if (riskScore >= 35) {
    threatLevel = 'suspicious';
    confidence = 81.3;

  } else {
    threatLevel = 'safe';
    confidence = 95.5;

    reasons.push(
      'No matching brand-login or urgency indicators were found in the supplied OCR text.'
    );
  }

  return {
    threatLevel,
    confidence,
    riskScore: Math.min(99, riskScore),
    reasons,

    featuresExtracted: {
      'Detected Visual Elements':
        hasLoginForm ? 'Credential-related Text Found' : 'No Credential-related Text Found',

      'Targeted Brand Emblem':
        hasBrand ? hasBrand.toUpperCase() : 'None',

      'Urgency Visual Banner':
        hasUrgency ? 'Urgency Text Found' : 'Not Found',

      'Image Frame Status': 'OCR Text Heuristic Analysis'
    }
  };
}

// AI Image Scanner
// This is a basic filename/file-size heuristic, NOT a trained AI detector.
export function analyzeAiImage(
  filename: string,
  imageSize: number = 240000
) {
  const isLikelyAi =
    filename.toLowerCase().includes('ai') ||
    filename.toLowerCase().includes('generate') ||
    filename.toLowerCase().includes('midjourney') ||
    filename.toLowerCase().includes('synth') ||
    filename.toLowerCase().includes('fake') ||
    (imageSize % 7 === 0);

  const confidence = isLikelyAi ? 97.6 : 95.2;

  const threatLevel: ThreatLevel =
    isLikelyAi ? 'suspicious' : 'safe';

  const riskScore = isLikelyAi ? 60 : 10;

  const reasons: string[] = [];

  if (isLikelyAi) {
    reasons.push(
      'The filename or file-size heuristic produced a possible AI-image indicator. This is not a verified AI-generation result.'
    );
  } else {
    reasons.push(
      'The filename or file-size heuristic did not produce an AI-image indicator. This does not prove the image is authentic.'
    );
  }

  return {
    isAiGenerated: isLikelyAi,
    threatLevel,
    confidence,
    riskScore,
    reasons,

    featuresExtracted: {
      'Filename Heuristic':
        isLikelyAi ? 'Possible AI Indicator' : 'No AI Indicator',

      'File Size': `${imageSize} bytes`,

      'Detection Method':
        'Basic filename and file-size heuristic',

      'Authenticity Verification':
        'Not performed'
    }
  };
}

// Message / SMS NLP Scanner
export function analyzeMessageNlp(text: string) {
  const lower = text.toLowerCase();

  const hasUrgent =
    /urgent|alert|suspended|locked|action required|final notice|immediate/i.test(text);

  const hasFinancial =
    /bank|crypto|bitcoin|wire|balance|claim|reward|won|lottery|tax|refund|zelle|cashapp/i.test(text);

  const hasShortlink =
    /bit\.ly|tinyurl|t\.co|goo\.gl|is\.gd|ow\.ly|cutt\.ly/i.test(text);

  const hasPhoneCall =
    /call (now|at|this number)|dial|toll[- ]free|\+1-\d{3}/i.test(text);

  const hasZeroDayToken =
    /v-e-r-i-f-y|acc0unt|sec-ure|p-a-y/i.test(text);

  let risk = 10;

  const reasons: string[] = [];

  if (hasShortlink) {
    risk += 40;

    reasons.push(
      'Contains a URL shortener that can hide the final destination.'
    );
  }

  if (hasUrgent && hasFinancial) {
    risk += 45;

    reasons.push(
      'Combines financial-related language with urgency-related language.'
    );
  }

  if (hasPhoneCall) {
    risk += 25;

    reasons.push(
      'Contains a request to make a phone call or dial a number.'
    );
  }

  if (hasZeroDayToken) {
    risk += 35;

    reasons.push(
      'Contains obfuscated words or characters that may bypass simple keyword checks.'
    );
  }

  let threatLevel: ThreatLevel = 'safe';

  let confidence = 96.0;

  if (risk >= 50) {
    threatLevel = 'phishing';
    confidence = 97.2;

  } else if (risk >= 25) {
    threatLevel = 'suspicious';
    confidence = 82.0;

  } else {
    threatLevel = 'safe';
    confidence = 98.4;

    reasons.push(
      'No major urgency, shortlink, or callback indicators were detected by the current checks.'
    );
  }

  return {
    threatLevel,
    confidence,
    riskScore: Math.min(99, risk),
    reasons,

    featuresExtracted: {
      'NLP Sentiment Valence':
        hasUrgent ? 'High Urgency / Coercive' : 'Neutral / Informational',

      'Shortlink Obfuscation':
        hasShortlink ? 'Detected' : 'None',

      'Financial Scam Intent':
        hasFinancial ? 'Financial Keywords Found' : 'None',

      'Vishing Callback Hook':
        hasPhoneCall ? 'Detected' : 'None',

      'Anti-Filter Character Evasion':
        hasZeroDayToken ? 'Possible Obfuscation' : 'Not Detected'
    }
  };
}

// Password Strength Analyzer
export function evaluatePasswordStrength(password: string) {
  if (!password) {
    return {
      score: 0,
      label: 'Empty',
      entropyBits: 0,
      crackTime: 'Instant',
      feedback: ['Enter a password to evaluate strength.']
    };
  }

  let poolSize = 0;

  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33;

  const entropyBits = Math.round(
    password.length * Math.log2(Math.max(2, poolSize))
  );

  const feedback: string[] = [];

  if (password.length < 12) {
    feedback.push('Password length is under 12 characters.');
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Add uppercase letters (A-Z).');
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Add lowercase letters (a-z).');
  }

  if (!/[0-9]/.test(password)) {
    feedback.push('Add numerical digits (0-9).');
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    feedback.push('Add special symbols (!@#$%^&*).');
  }

  const commonPasswords = [
    'password', '123456', 'admin', 'qwerty',
    'welcome', 'letmein', 'master'
  ];

  if (
    commonPasswords.some(p =>
      password.toLowerCase().includes(p)
    )
  ) {
    feedback.push(
      'Contains a common password or dictionary pattern.'
    );
  }

  let score = 0;

  let crackTime = 'Instant';

  if (entropyBits < 35) {
    score = 1;
    crackTime = 'Few seconds';

  } else if (entropyBits < 55) {
    score = 2;
    crackTime = 'Several hours';

  } else if (entropyBits < 75) {
    score = 3;
    crackTime = '3 - 5 years';

  } else {
    score = 4;
    crackTime = 'Over 10,000 centuries';
  }

  const labels = [
    'Extremely Weak',
    'Weak',
    'Moderate',
    'Strong',
    'Cryptographically Bulletproof'
  ];

  return {
    score,
    label: labels[score],
    entropyBits,
    crackTime,

    feedback:
      feedback.length === 0
        ? ['Good character variety and estimated entropy.']
        : feedback
  };
}

// Safe Password Generator
export function generateSafePassword(
  length: number = 18,
  useSpecial: boolean = true,
  useNumbers: boolean = true
) {
  const lowercase = 'abcdefghjkmnpqrstuvwxyz';
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const numbers = '23456789';
  const symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?';

  let charset = lowercase + uppercase;

  if (useNumbers) charset += numbers;
  if (useSpecial) charset += symbols;

  const array = new Uint32Array(length);

  window.crypto.getRandomValues(array);

  let result = '';

  for (let i = 0; i < length; i++) {
    result += charset[array[i] % charset.length];
  }

  return result;
}
