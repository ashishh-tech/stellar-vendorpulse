import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string, chars = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatTimestamp(timestampInSeconds: number | bigint): string {
  const ts = typeof timestampInSeconds === 'bigint' ? Number(timestampInSeconds) : timestampInSeconds;
  if (!ts) return 'N/A';
  return new Date(ts * 1000).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatScore(score: number): { text: string; colorClass: string; badgeVariant: 'success' | 'warning' | 'destructive' | 'secondary' } {
  if (score >= 80) {
    return { text: `${score}/100`, colorClass: 'text-emerald-400', badgeVariant: 'success' };
  } else if (score >= 60) {
    return { text: `${score}/100`, colorClass: 'text-amber-400', badgeVariant: 'warning' };
  } else if (score > 0) {
    return { text: `${score}/100`, colorClass: 'text-rose-400', badgeVariant: 'destructive' };
  } else {
    return { text: 'Unrated', colorClass: 'text-slate-400', badgeVariant: 'secondary' };
  }
}

export function getExplorerUrl(hashOrAddress: string, type: 'tx' | 'account' | 'contract' = 'tx'): string {
  const baseUrl = process.env.NEXT_PUBLIC_STELLAR_EXPLORER_URL || 'https://stellar.expert/explorer/testnet';
  // Mock hashes (0x-prefixed) won't exist on-chain — link to testnet operations page instead
  if (hashOrAddress.startsWith('0x')) {
    return `${baseUrl}/ops`;
  }
  return `${baseUrl}/${type}/${hashOrAddress}`;
}
