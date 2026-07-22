import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layout/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VendorPulse - Decentralized Vendor Performance Platform on Stellar Soroban',
  description:
    'VendorPulse empowers procurement teams to score suppliers across delivery, quality, payment, and communication on Stellar Soroban smart contracts.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-100 flex flex-col`}>
        <Providers>
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
          <footer className="w-full border-t border-slate-800 py-6 text-center text-xs text-slate-500 font-mono">
            VendorPulse v1.0.0 • Powered by Soroban Smart Contracts on Stellar Network
          </footer>
        </Providers>
      </body>
    </html>
  );
}
