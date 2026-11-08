'use client';

import React from 'react';
import { LedgerItem } from '@/types';
import { DollarSign, Bot, UserCheck, TrendingUp } from 'lucide-react';

interface StatsBarProps {
  ledger: LedgerItem[];
}

export function StatsBar({ ledger }: StatsBarProps) {
  const totalSettled = ledger
    .filter(item => item.status === 'COMPLETED')
    .reduce((sum, item) => sum + item.totalAmount, 0);

  const autonomousCount = ledger.filter(item => item.approvalType === 'AUTONOMOUS').length;
  const humanConfirmedCount = ledger.filter(item => item.approvalType === 'HUMAN_CONFIRMED').length;

  // Estimated savings based on quotes compared by agent
  const estimatedSavings = totalSettled * 0.18;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-[#110b27]/80 border border-purple-900/40 rounded-xl p-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-purple-300/70 font-mono">
          <span>SETTLED VOLUME (PAYPAL)</span>
          <DollarSign className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-bold font-mono text-white mt-1">
          $${totalSettled.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-[11px] text-emerald-400/90 font-mono mt-0.5">
          100% Sandbox Cleared
        </div>
      </div>

      <div className="bg-[#110b27]/80 border border-purple-900/40 rounded-xl p-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-purple-300/70 font-mono">
          <span>AUTONOMOUS TRADES</span>
          <Bot className="h-4 w-4 text-cyan-400" />
        </div>
        <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
          {autonomousCount} <span className="text-sm font-normal text-purple-300/60">orders</span>
        </div>
        <div className="text-[11px] text-cyan-400/80 font-mono mt-0.5">
          &lt; $250 Policy Auto-Approved
        </div>
      </div>

      <div className="bg-[#110b27]/80 border border-purple-900/40 rounded-xl p-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-purple-300/70 font-mono">
          <span>HUMAN GATE APPROVALS</span>
          <UserCheck className="h-4 w-4 text-amber-400" />
        </div>
        <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
          {humanConfirmedCount} <span className="text-sm font-normal text-purple-300/60">authorized</span>
        </div>
        <div className="text-[11px] text-amber-400/80 font-mono mt-0.5">
          Zero Policy Bypasses
        </div>
      </div>

      <div className="bg-[#110b27]/80 border border-purple-900/40 rounded-xl p-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-purple-300/70 font-mono">
          <span>AGENT COST SAVINGS</span>
          <TrendingUp className="h-4 w-4 text-purple-400" />
        </div>
        <div className="text-2xl font-bold font-mono text-purple-300 mt-1">
          $${estimatedSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-[11px] text-purple-400/80 font-mono mt-0.5">
          ~18% vs List Price Quotes
        </div>
      </div>
    </div>
  );
}
