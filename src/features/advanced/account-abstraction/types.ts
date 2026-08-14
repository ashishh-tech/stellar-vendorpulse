export interface PasskeyCredential {
  credentialId: string;
  publicKey: string;
  algorithm: 'ES256' | 'Ed25519';
  deviceName: string;
  enrolledAt: number;
}

export interface SmartWalletPolicy {
  dailySpendLimitXlm: number;
  dailySpentXlm: number;
  requiresBiometricsAboveXlm: number;
  whitelistedContracts: string[];
  sessionExpiryMinutes: number;
}

export interface SmartWalletSession {
  sessionId: string;
  walletAddress: string;
  passkey: PasskeyCredential;
  policy: SmartWalletPolicy;
  createdAt: number;
  expiresAt: number;
  isActive: boolean;
}
