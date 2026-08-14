import { describe, it, expect, beforeEach } from 'vitest';
import { AccountAbstractionService } from '@/features/advanced/account-abstraction/service';

describe('AccountAbstractionService', () => {
  let service: AccountAbstractionService;

  beforeEach(() => {
    service = new AccountAbstractionService();
  });

  it('enrolls a new Passkey credential', () => {
    const cred = service.enrollPasskey('YubiKey 5C NFC');
    expect(cred.credentialId).toContain('cred_webauthn_');
    expect(cred.algorithm).toBe('ES256');
    expect(cred.deviceName).toBe('YubiKey 5C NFC');
    expect(service.getEnrolledCredentials().length).toBeGreaterThanOrEqual(2);
  });

  it('creates active session with custom policy', () => {
    const creds = service.getEnrolledCredentials();
    const session = service.createSession('GBSMARTWALLET1234567890', creds[0], {
      dailySpendLimitXlm: 500,
      requiresBiometricsAboveXlm: 50,
    });

    expect(session.sessionId).toContain('sess_');
    expect(session.isActive).toBe(true);
    expect(session.policy.dailySpendLimitXlm).toBe(500);
  });

  it('enforces whitelist and spend limits on transaction policy', () => {
    const creds = service.getEnrolledCredentials();
    const session = service.createSession('GBSMARTWALLET1234567890', creds[0], {
      dailySpendLimitXlm: 100,
      requiresBiometricsAboveXlm: 20,
    });

    // Valid whitelisted call under biometric threshold
    const check1 = service.validateTransactionPolicy(
      session.sessionId,
      'CDLZFC4SYJLNW3BFATR7GQJX33VFPV6RCZOSXIL5PZXKN3KMAEJW3RL',
      5
    );
    expect(check1.allowed).toBe(true);
    expect(check1.requiresBiometricPrompt).toBe(false);

    // Call requiring biometric prompt
    const check2 = service.validateTransactionPolicy(
      session.sessionId,
      'CDLZFC4SYJLNW3BFATR7GQJX33VFPV6RCZOSXIL5PZXKN3KMAEJW3RL',
      30
    );
    expect(check2.allowed).toBe(true);
    expect(check2.requiresBiometricPrompt).toBe(true);

    // Unwhitelisted contract
    const check3 = service.validateTransactionPolicy(
      session.sessionId,
      'CUNWHITELISTEDCONTRACT99999999999999999999999999999999999999',
      10
    );
    expect(check3.allowed).toBe(false);
    expect(check3.reason).toBe('Contract is not in security whitelist');
  });
});
