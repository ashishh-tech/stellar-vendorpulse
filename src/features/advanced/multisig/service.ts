import { MultiSigProposal, MultiSigSigner, MultiSigConfig } from './types';
import { logger } from '@/lib/logger';

export class MultiSigService {
  private proposals: MultiSigProposal[] = [];
  private defaultSigners: MultiSigSigner[] = [
    { address: 'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWBDJJGTH46W45H2B2J5M4U6', weight: 1, name: 'Security Council' },
    { address: 'GBN4M5J8Z9X2L3K4T5R6V7W8P9Q0S1D2F3G4H5J6K7L8M9N0P1Q2', weight: 1, name: 'Lead Auditor' },
    { address: 'GCD8P3K2M4N5L6J7H8G9F0D1S2A3W4E5R6T7Y8U9I0O1P2Q3R4S5', weight: 1, name: 'Procurement Governance' },
  ];
  private threshold: number = 2;

  constructor() {
    this.seedDefaultProposals();
  }

  private seedDefaultProposals(): void {
    this.proposals = [
      {
        id: 'MSP-001',
        title: 'Upgrade Vendor Registry Wasm Bytecode v2.1',
        description: 'Authorize security patch and gas optimization rollout for Soroban VendorRegistry contract.',
        targetContract: 'CDLZFC4SYJLNW3BFATR7GQJX33VFPV6RCZOSXIL5PZXKN3KMAEJW3RL',
        functionName: 'upgrade_contract_wasm',
        parameters: { newWasmHash: '9a8b7c6d5e4f3a2b1c0d8e7f6a5b4c3d2e1f0a9b' },
        threshold: 2,
        currentWeight: 2,
        status: 'APPROVED',
        proposer: 'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWBDJJGTH46W45H2B2J5M4U6',
        createdAt: 1723500000000,
        signers: [
          { address: 'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWBDJJGTH46W45H2B2J5M4U6', weight: 1, name: 'Security Council', hasSigned: true, signedAt: 1723501000000 },
          { address: 'GBN4M5J8Z9X2L3K4T5R6V7W8P9Q0S1D2F3G4H5J6K7L8M9N0P1Q2', weight: 1, name: 'Lead Auditor', hasSigned: true, signedAt: 1723502000000 },
          { address: 'GCD8P3K2M4N5L6J7H8G9F0D1S2A3W4E5R6T7Y8U9I0O1P2Q3R4S5', weight: 1, name: 'Procurement Governance', hasSigned: false },
        ],
      },
      {
        id: 'MSP-002',
        title: 'Adjust Minimum Reputation Score Quota for Global Tier-1 Suppliers',
        description: 'Update the global threshold for high-volume cross-border vendor SLA approvals from 80 to 85.',
        targetContract: 'CAAHMZF5IZHFNZFCREULIMVXMBU2FQHPEXNXF7KRGJHM47LCNLJNFKK2',
        functionName: 'set_min_reputation_threshold',
        parameters: { minScore: 85 },
        threshold: 2,
        currentWeight: 1,
        status: 'PROPOSED',
        proposer: 'GCD8P3K2M4N5L6J7H8G9F0D1S2A3W4E5R6T7Y8U9I0O1P2Q3R4S5',
        createdAt: 1723580000000,
        signers: [
          { address: 'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWBDJJGTH46W45H2B2J5M4U6', weight: 1, name: 'Security Council', hasSigned: false },
          { address: 'GBN4M5J8Z9X2L3K4T5R6V7W8P9Q0S1D2F3G4H5J6K7L8M9N0P1Q2', weight: 1, name: 'Lead Auditor', hasSigned: false },
          { address: 'GCD8P3K2M4N5L6J7H8G9F0D1S2A3W4E5R6T7Y8U9I0O1P2Q3R4S5', weight: 1, name: 'Procurement Governance', hasSigned: true, signedAt: 1723581000000 },
        ],
      },
    ];
  }

  public getProposals(): MultiSigProposal[] {
    return [...this.proposals];
  }

  public getProposalById(id: string): MultiSigProposal | undefined {
    return this.proposals.find((p) => p.id === id);
  }

  public createProposal(
    title: string,
    description: string,
    targetContract: string,
    functionName: string,
    parameters: Record<string, any>,
    proposer: string
  ): MultiSigProposal {
    const newProposal: MultiSigProposal = {
      id: `MSP-${String(this.proposals.length + 1).padStart(3, '0')}`,
      title,
      description,
      targetContract,
      functionName,
      parameters,
      threshold: this.threshold,
      currentWeight: 1,
      status: 'PROPOSED',
      proposer,
      createdAt: Date.now(),
      signers: this.defaultSigners.map((s) => ({
        ...s,
        hasSigned: s.address === proposer,
        signedAt: s.address === proposer ? Date.now() : undefined,
      })),
    };

    this.proposals.unshift(newProposal);
    logger.info('Created new MultiSig governance proposal', { id: newProposal.id, title });
    return newProposal;
  }

  public signProposal(proposalId: string, signerAddress: string): MultiSigProposal {
    const proposal = this.proposals.find((p) => p.id === proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    if (proposal.status !== 'PROPOSED') {
      throw new Error(`Proposal ${proposalId} is already ${proposal.status}`);
    }

    const signer = proposal.signers.find((s) => s.address === signerAddress);
    if (!signer) {
      throw new Error(`Address ${signerAddress} is not an authorized MultiSig signer`);
    }

    if (signer.hasSigned) {
      throw new Error(`Signer ${signerAddress} has already signed proposal ${proposalId}`);
    }

    signer.hasSigned = true;
    signer.signedAt = Date.now();
    proposal.currentWeight += signer.weight;

    if (proposal.currentWeight >= proposal.threshold) {
      proposal.status = 'APPROVED';
    }

    logger.info('MultiSig proposal signed', {
      proposalId,
      signer: signer.name,
      currentWeight: proposal.currentWeight,
      threshold: proposal.threshold,
      status: proposal.status,
    });

    return proposal;
  }

  public async executeProposal(proposalId: string, callerAddress: string): Promise<MultiSigProposal> {
    const proposal = this.proposals.find((p) => p.id === proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    if (proposal.status !== 'APPROVED') {
      throw new Error(`Proposal ${proposalId} cannot be executed in state ${proposal.status}`);
    }

    proposal.status = 'EXECUTED';
    proposal.executedAt = Date.now();
    proposal.txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    logger.info('Executed MultiSig governance proposal on Stellar Mainnet', {
      proposalId,
      txHash: proposal.txHash,
    });

    return proposal;
  }
}

export const multiSigService = new MultiSigService();
