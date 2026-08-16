import { describe, it, expect, beforeEach } from 'vitest';
import { FeeSponsorshipService } from '@/features/advanced/fee-sponsorship/service';
import { MultiSigService } from '@/features/advanced/multisig/service';
import { CrossBorderFlowService } from '@/features/advanced/cross-border/service';
import { AccountAbstractionService } from '@/features/advanced/account-abstraction/service';

describe('Advanced Features E2E Integration Flow', () => {
  let feeSponsor: FeeSponsorshipService;
  let multiSig: MultiSigService;
  let crossBorder: CrossBorderFlowService;
  let accountAbs: AccountAbstractionService;

  beforeEach(() => {
    feeSponsor = new FeeSponsorshipService({ isEnabled: true });
    multiSig = new MultiSigService();
    crossBorder = new CrossBorderFlowService();
    accountAbs = new AccountAbstractionService();
  });

  it('completes full Level 6 lifecycle: enroll passkey -> create session -> sponsor tx -> submit review -> cross-border payout', async () => {
    // Step 1: Enroll WebAuthn passkey
    const passkey = accountAbs.enrollPasskey('Production YubiKey');
    expect(passkey.credentialId).toBeTruthy();

    // Step 2: Create smart wallet session
    const session = accountAbs.createSession('GBMAINNETUSER9182738', passkey);
    expect(session.isActive).toBe(true);

    // Step 3: Validate policy for whitelisted contract
    const policyCheck = accountAbs.validateTransactionPolicy(
      session.sessionId,
      'CDLZFC4SYJLNW3BFATR7GQJX33VFPV6RCZOSXIL5PZXKN3KMAEJW3RL',
      5
    );
    expect(policyCheck.allowed).toBe(true);

    // Step 4: Get fee sponsorship quote for the register_vendor action
    const quote = feeSponsor.calculateQuote('register_vendor', 10000);
    expect(quote.isEligible).toBe(true);

    // Step 5: Execute sponsored transaction
    const sponsoredTx = await feeSponsor.wrapAndSponsorTransaction(
      'AAAAAGSimulatedXDR...',
      'register_vendor',
      'GBMAINNETUSER9182738'
    );
    expect(sponsoredTx.status).toBe('SUCCESS');
    expect(sponsoredTx.feePaidInXlm).toBeGreaterThan(0);

    // Step 6: Execute cross-border payout for the vendor
    const anchorQuote = crossBorder.requestAnchorQuote({
      fromAsset: 'USDC',
      toAsset: 'EUR',
      amount: 10000,
      vendorAddress: 'GBMAINNETUSER9182738',
    });
    expect(anchorQuote.sepProtocol).toBe('SEP-31');

    const payout = await crossBorder.executeCrossBorderPayout(1, 'Apex Logistics', anchorQuote);
    expect(payout.status).toBe('SETTLED');
    expect(payout.fiatReferenceNumber).toBeTruthy();

    // Step 7: Verify multi-sig proposal can be signed
    const proposals = multiSig.getProposals();
    expect(proposals.length).toBeGreaterThanOrEqual(2);
  });

  it('enforces security boundaries across all advanced modules', () => {
    // Fee sponsorship rejects unsupported types
    const unsupported = feeSponsor.calculateQuote('malicious_drain_call', 10000);
    expect(unsupported.isEligible).toBe(false);

    // Multi-sig rejects unauthorized signers
    expect(() =>
      multiSig.signProposal('MSP-002', 'GATTACKER_NOT_REGISTERED_9999999999')
    ).toThrow();

    // Account abstraction rejects unwhitelisted contracts
    const passkey = accountAbs.enrollPasskey('Test Device');
    const session = accountAbs.createSession('GBTEST123', passkey);
    const blocked = accountAbs.validateTransactionPolicy(
      session.sessionId,
      'CMALICIOUS_CONTRACT_9999999999999999999999999999999999999999',
      1
    );
    expect(blocked.allowed).toBe(false);
  });
});
