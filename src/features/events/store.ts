import { create } from 'zustand';
import { ContractEvent } from './types';

interface EventStoreState {
  events: ContractEvent[];
  isStreaming: boolean;
  addEvents: (newEvents: ContractEvent[]) => void;
  setStreaming: (isStreaming: boolean) => void;
  clearEvents: () => void;
}

export const useEventStore = create<EventStoreState>((set) => ({
  events: [],
  isStreaming: false,

  addEvents: (newEvents) =>
    set((state) => {
      const existingIds = new Set(state.events.map((e) => e.id));
      const filtered = newEvents.filter((e) => !existingIds.has(e.id));
      return {
        events: [...filtered, ...state.events].slice(0, 100), // Max 100 live events
      };
    }),

  setStreaming: (isStreaming) => set({ isStreaming }),
  clearEvents: () => set({ events: [] }),
}));
