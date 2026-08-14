'use client';

import React, { useState } from 'react';
import { KeyRound, Fingerprint, ShieldCheck, Plus, CheckCircle2, Lock, ArrowRight, Laptop } from 'lucide-react';
import { accountAbstractionService } from './service';
import { PasskeyCredential, SmartWalletSession } from './types';

export const SmartWalletAuthCard: React.FC = () => {
  const [credentials, setCredentials] = useState<PasskeyCredential[]>(
    accountAbstractionService.getEnrolledCredentials()
  );
  const [activeSession, setActiveSession] = useState<SmartWalletSession | null>(null);
  const [deviceName, setDeviceName] = useState<string>('Touch ID / Windows Hello Passkey');
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);
  const [policyCheckResult, setPolicyCheckResult] = useState<string | null>(null);

  const handleEnroll = async () => {
    if (!deviceName) return;
    setIsEnrolling(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const cred = accountAbstractionService.enrollPasskey(deviceName);
      setCredentials(accountAbstractionService.getEnrolledCredentials());
      const session = accountAbstractionService.createSession(
        'GBSMART7792...WALLETAUTH',
        cred
      );
      setActiveSession(session);
    } catch (e) {
      console.error(e);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleTestPolicy = () => {
    if (!activeSession) return;
    const res = accountAbstractionService.validateTransactionPolicy(
      activeSession.sessionId,
      'CDLZFC4SYJLNW3BFATR7GQJX33VFPV6RCZOSXIL5PZXKN3KMAEJW3RL',
      15
    );
    if (res.allowed) {
      setPolicyCheckResult(
        `✅ Policy Passed: Approved without hardware signer (${res.requiresBiometricPrompt ? 'Biometric biometric prompted' : 'Auto-authorized session key'})`
      );
    } else {
      setPolicyCheckResult(`❌ Policy Blocked: ${res.reason}`);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl bg-slate-900/40 relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Account Abstraction & WebAuthn Passkeys
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Soroban Custom Auth
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Biometric WebAuthn passkey authentication, scoped session keys, and programmable policy rules without seed phrases.
            </p>
          </div>
        </div>
      </div>

      {/* Enrolled Devices & Session Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase mb-3 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-purple-400" /> Enrolled Passkey Hardware
          </h4>
          <div className="space-y-2">
            {credentials.map((c) => (
              <div
                key={c.credentialId}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono"
              >
                <div className="flex items-center gap-2 text-slate-200">
                  <Laptop className="w-4 h-4 text-purple-400" />
                  <span>{c.deviceName}</span>
                </div>
                <span className="text-[10px] text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40">
                  {c.algorithm}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="Device name..."
              className="w-full bg-slate-900 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 text-white outline-none focus:border-purple-500"
            />
            <button
              type="button"
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg shadow-md shadow-purple-600/20 whitespace-nowrap transition disabled:opacity-50"
            >
              {isEnrolling ? 'Enrolling...' : 'Enroll Passkey'}
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" /> Smart Wallet Policy Engine
            </h4>
            <div className="space-y-1.5 text-xs text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Daily Spend Limit:</span>
                <span className="text-white font-bold">100 XLM</span>
              </div>
              <div className="flex justify-between">
                <span>Biometric Threshold:</span>
                <span className="text-amber-400 font-bold">&gt; 10 XLM</span>
              </div>
              <div className="flex justify-between">
                <span>Whitelisted Contracts:</span>
                <span className="text-purple-400 font-bold">VendorRegistry, ReviewSystem</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-900 mt-3">
            <button
              type="button"
              onClick={handleTestPolicy}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Evaluate Policy & Session Key (15 XLM)
            </button>
            {policyCheckResult && (
              <p className="mt-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/30 p-2 rounded border border-emerald-900/50">
                {policyCheckResult}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
