import { sorobanServer, VENDOR_REGISTRY_CONTRACT_ID, REVIEW_SYSTEM_CONTRACT_ID } from '@/lib/stellar';
import { ContractEvent } from './types';
import { logger } from '@/lib/logger';

export async function fetchContractEvents(startLedger?: number): Promise<ContractEvent[]> {
  try {
    const contractIds = [VENDOR_REGISTRY_CONTRACT_ID, REVIEW_SYSTEM_CONTRACT_ID].filter(Boolean);
    if (contractIds.length === 0) return [];

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
        contractId: evt.contractId,
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
    logger.error('Failed to fetch Soroban events', err);
    return [];
  }
}
