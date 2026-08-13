export interface MultiSigSigner {
  address: string;
  weight: number;
  name: string;
  hasSigned?: boolean;
  signedAt?: number;
}

export interface MultiSigProposal {
  id: string;
  title: string;
  description: string;
  targetContract: string;
  functionName: string;
  parameters: Record<string, any>;
  threshold: number;
  currentWeight: number;
  status: 'PROPOSED' | 'APPROVED' | 'EXECUTED' | 'REJECTED';
  proposer: string;
  signers: MultiSigSigner[];
  createdAt: number;
  executedAt?: number;
  txHash?: string;
}

export interface MultiSigConfig {
  threshold: number;
  signers: MultiSigSigner[];
  allowedFunctions: string[];
}
