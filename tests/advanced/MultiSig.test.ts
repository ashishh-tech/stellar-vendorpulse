import { describe, it, expect, beforeEach } from 'vitest';
import { MultiSigService } from '@/features/advanced/multisig/service';

describe('MultiSigService', () => {
  let service: MultiSigService;

  beforeEach(() => {
    service = new MultiSigService();
  });

  it('initializes with active proposals', () => {
    const proposals = service.getProposals();
    expect(proposals.length).toBeGreaterThanOrEqual(2);
    expect(proposals[0].id).toBe('MSP-001');
    expect(proposals[0].status).toBe('APPROVED');
  });

  it('creates a new governance proposal with default threshold', () => {
    const newProp = service.createProposal(
      'Emergency Pausable Switch',
      'Pause review submissions during maintenance',
      'CDLZFC4SYJLNW3BFATR7GQJX33VFPV6RCZOSXIL5PZXKN3KMAEJW3RL',
      'pause_contract',
      { durationMinutes: 60 },
      'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWBDJJGTH46W45H2B2J5M4U6'
    );

    expect(newProp.id).toBe('MSP-003');
    expect(newProp.status).toBe('PROPOSED');
    expect(newProp.threshold).toBe(2);
    expect(newProp.currentWeight).toBe(1);
  });

  it('increments weight and advances status to APPROVED when threshold is met', () => {
    const updated = service.signProposal(
      'MSP-002',
      'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWBDJJGTH46W45H2B2J5M4U6'
    );

    expect(updated.currentWeight).toBe(2);
    expect(updated.status).toBe('APPROVED');
  });

  it('prevents duplicate signatures from the same signer', () => {
    service.signProposal(
      'MSP-002',
      'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWBDJJGTH46W45H2B2J5M4U6'
    );

    expect(() =>
      service.signProposal('MSP-002', 'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWBDJJGTH46W45H2B2J5M4U6')
    ).toThrow();
  });

  it('executes an approved proposal and produces a mainnet transaction hash', async () => {
    const executed = await service.executeProposal(
      'MSP-001',
      'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWBDJJGTH46W45H2B2J5M4U6'
    );

    expect(executed.status).toBe('EXECUTED');
    expect(executed.txHash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(executed.executedAt).toBeDefined();
  });
});
