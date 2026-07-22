import { sorobanServer, VENDOR_REGISTRY_CONTRACT_ID, REVIEW_SYSTEM_CONTRACT_ID } from '@/lib/stellar';
import { ContractEvent } from './types';
import { logger } from '@/lib/logger';

const MOCK_EVENTS: ContractEvent[] = [
  {
    id: 'evt_101',
    contractId: 'CD5W2V6E3K7R5X7M9L2P4Q6R8S0T2U4V6W8X0Y2Z4A6B8C0D',
    topic: ['vendor', 'register'],
    data: 'Ashish Supply Registered',
    ledger: 5289120,
    ledgerClosedAt: new Date(Date.now() - 300000).toISOString(),
    txHash: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
    type: 'vendor_registered',
  },
  {
    id: 'evt_102',
    contractId: 'CB2M4N6P8Q0R2S4T6U8V0W2X4Y6Z8A0B2C4D6E8F0G2H4I6',
    topic: ['review', 'submit'],
    data: 'Score: 92/100 Multi-Axis Review',
    ledger: 5289115,
    ledgerClosedAt: new Date(Date.now() - 600000).toISOString(),
    txHash: '0x1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e',
    type: 'review_submitted',
  },
  {
    id: 'evt_103',
    contractId: 'CD5W2V6E3K7R5X7M9L2P4Q6R8S0T2U4V6W8X0Y2Z4A6B8C0D',
    topic: ['vendor', 'scored'],
    data: 'Inter-Contract Score Calculation Update',
    ledger: 5289110,
    ledgerClosedAt: new Date(Date.now() - 900000).toISOString(),
    txHash: '0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b',
    type: 'score_updated',
  },
  {
    id: 'evt_104',
    contractId: 'CD5W2V6E3K7R5X7M9L2P4Q6R8S0T2U4V6W8X0Y2Z4A6B8C0D',
    topic: ['vendor', 'status'],
    data: 'Status Transition: Active -> Probation',
    ledger: 5289090,
    ledgerClosedAt: new Date(Date.now() - 1500000).toISOString(),
    txHash: '0x5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    type: 'status_changed',
  },
];

export async function fetchContractEvents(startLedger?: number): Promise<ContractEvent[]> {
  try {
    const contractIds = [VENDOR_REGISTRY_CONTRACT_ID, REVIEW_SYSTEM_CONTRACT_ID].filter(Boolean);
    if (contractIds.length === 0) return MOCK_EVENTS;

    const latestLedgerResponse = await sorobanServer.getLatestLedger();
    const currentLedger = latestLedgerResponse.sequence;
    const start = startLedger || Math.max(1, currentLedger - 100);

    const eventsResponse = await sorobanServer.getEvents({
      startLedger: start,
      filters: [
        {
          type: 'contract',
          contractIds: contractIds,
        },
      ],
      limit: 20,
    });

    if (!eventsResponse.events || eventsResponse.events.length === 0) {
      return MOCK_EVENTS;
    }

    const parsedEvents: ContractEvent[] = eventsResponse.events.map((evt) => {
      let eventType: ContractEvent['type'] = 'unknown';
      const topics = evt.topic.map((t) => t.toString());

      if (topics.some((t) => t.includes('register'))) eventType = 'vendor_registered';
      else if (topics.some((t) => t.includes('update'))) eventType = 'vendor_updated';
      else if (topics.some((t) => t.includes('status'))) eventType = 'status_changed';
      else if (topics.some((t) => t.includes('submit') || t.includes('review'))) eventType = 'review_submitted';
      else if (topics.some((t) => t.includes('scored'))) eventType = 'score_updated';

      return {
        id: evt.id,
        contractId: evt.contractId ? String(evt.contractId) : '',
        topic: topics,
        data: evt.value,
        ledger: evt.ledger,
        ledgerClosedAt: evt.ledgerClosedAt,
        txHash: evt.txHash,
        type: eventType,
      };
    });

    return parsedEvents;
  } catch (err) {
    logger.warn('Failed to fetch live Soroban events, returning default event stream', err);
    return MOCK_EVENTS;
  }
}
