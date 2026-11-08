'use client';

import React from 'react';
import { ShieldCheck, Cpu, CreditCard, Sparkles, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  isProcessing: boolean;
}

export function Header({ onReset, isProcessing }: HeaderProps) {
  return (
    <header className="border-b border-purple-900/40 bg-[#0c081e]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5">
      <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 p-0.5 shadow-lg shadow-purple-900/40">
            <div className="h-full w-full rounded-[10px] bg-[#0c081e] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-mono">
                NEXUS<span className="text-amber-400">PAY</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                Agentic Commerce Tower
              </span>
            </div>
            <p className="text-xs text-purple-300/70">
              Autonomous AI Procurement &middot; Human Gate Policy &middot; PayPal Sandbox Settle
            </p>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-950/40 border border-purple-800/40 text-purple-200">
            <Cpu className="h-3.5 w-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Agent:</span>
            <span className={isProcessing ? "text-amber-400 font-semibold animate-pulse" : "text-emerald-400 font-semibold"}>
              {isProcessing ? "REASONING..." : "STANDBY"}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-blue-200">
            <CreditCard className="h-3.5 w-3.5 text-blue-400" />
            <span>PayPal:</span>
            <span className="text-blue-300 font-semibold">SANDBOX v2</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-200">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            <span>AG Grid:</span>
            <span className="text-amber-300 font-semibold">v36 QUARTZ</span>
          </div>

          <button
            onClick={onReset}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-900/30 hover:bg-purple-800/40 border border-purple-700/50 text-purple-200 transition-colors disabled:opacity-50"
            title="Reset Ledger & State"
          >
            <RefreshCw className="h-3.5 w-3.5 text-purple-400" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
}
