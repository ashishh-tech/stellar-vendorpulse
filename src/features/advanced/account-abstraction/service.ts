import { PasskeyCredential, SmartWalletPolicy, SmartWalletSession } from './types';
import { logger } from '@/lib/logger';

export class AccountAbstractionService {
  private sessions: Map<string, SmartWalletSession> = new Map();
  private credentials: PasskeyCredential[] = [];

  constructor() {
    this.seedDefaultCredentials();
  }

  private seedDefaultCredentials(): void {
    const cred: PasskeyCredential = {
      credentialId: 'cred_apple_touchid_890123',
      publicKey: '04c3d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7',
      algorithm: 'ES256',
      deviceName: 'MacBook Pro TouchID Secure Enclave',
      enrolledAt: 1723500000000,
    };
    this.credentials.push(cred);
  }

  public getEnrolledCredentials(): PasskeyCredential[] {
    return [...this.credentials];
  }

  public enrollPasskey(deviceName: string): PasskeyCredential {
    const newCred: PasskeyCredential = {
      credentialId: `cred_webauthn_${Math.floor(100000 + Math.random() * 900000)}`,
      publicKey: '04' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      algorithm: 'ES256',
      deviceName,
      enrolledAt: Date.now(),
    };

    this.credentials.unshift(newCred);
    logger.info('Enrolled new WebAuthn / Passkey credential for Soroban Smart Wallet', {
      credentialId: newCred.credentialId,
      deviceName,
    });

    return newCred;
  }

  public createSession(
    walletAddress: string,
    passkey: PasskeyCredential,
    customPolicy?: Partial<SmartWalletPolicy>
  ): SmartWalletSession {
    const policy: SmartWalletPolicy = {
      dailySpendLimitXlm: customPolicy?.dailySpendLimitXlm ?? 100,
      dailySpentXlm: customPolicy?.dailySpentXlm ?? 0,
      requiresBiometricsAboveXlm: customPolicy?.requiresBiometricsAboveXlm ?? 10,
      whitelistedContracts: customPolicy?.whitelistedContracts ?? [
        'CDLZFC4SYJLNW3BFATR7GQJX33VFPV6RCZOSXIL5PZXKN3KMAEJW3RL',
        'CAAHMZF5IZHFNZFCREULIMVXMBU2FQHPEXNXF7KRGJHM47LCNLJNFKK2',
      ],
      sessionExpiryMinutes: customPolicy?.sessionExpiryMinutes ?? 60,
    };

    const session: SmartWalletSession = {
      sessionId: `sess_${Math.random().toString(36).substring(2, 12)}`,
      walletAddress,
      passkey,
      policy,
      createdAt: Date.now(),
      expiresAt: Date.now() + policy.sessionExpiryMinutes * 60_000,
      isActive: true,
    };

    this.sessions.set(session.sessionId, session);
    logger.info('Created Smart Wallet Session with Passkey verification', {
      sessionId: session.sessionId,
      walletAddress,
    });

    return session;
  }

  public validateTransactionPolicy(
    sessionId: string,
    targetContract: string,
    amountXlm: number
  ): { allowed: boolean; reason?: string; requiresBiometricPrompt?: boolean } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { allowed: false, reason: 'Session does not exist' };
    }

    if (!session.isActive || Date.now() > session.expiresAt) {
      return { allowed: false, reason: 'Session expired' };
    }

    if (!session.policy.whitelistedContracts.includes(targetContract)) {
      return { allowed: false, reason: 'Contract is not in security whitelist' };
    }

    if (session.policy.dailySpentXlm + amountXlm > session.policy.dailySpendLimitXlm) {
      return { allowed: false, reason: 'Daily spend limit exceeded' };
    }

    const requiresBiometricPrompt = amountXlm >= session.policy.requiresBiometricsAboveXlm;

    return {
      allowed: true,
      requiresBiometricPrompt,
    };
  }

  public getSession(sessionId: string): SmartWalletSession | undefined {
    return this.sessions.get(sessionId);
  }
}

export const accountAbstractionService = new AccountAbstractionService();
