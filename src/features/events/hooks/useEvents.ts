import { useEffect, useRef } from 'react';
import { useEventStore } from '../store';
import { fetchContractEvents } from '../service';

export function useEvents(pollIntervalMs = 8000) {
  const { events, addEvents, setStreaming } = useEventStore();
  const lastLedgerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    setStreaming(true);
    let mounted = true;

    async function poll() {
      if (!mounted) return;
      const fetched = await fetchContractEvents(lastLedgerRef.current);
      if (fetched.length > 0) {
        addEvents(fetched);
        const maxLedger = Math.max(...fetched.map((e) => e.ledger));
        lastLedgerRef.current = maxLedger + 1;
      }
    }

    poll();
    const interval = setInterval(poll, pollIntervalMs);

    return () => {
      mounted = false;
      setStreaming(false);
      clearInterval(interval);
    };
  }, [addEvents, pollIntervalMs, setStreaming]);

  return { events };
}
