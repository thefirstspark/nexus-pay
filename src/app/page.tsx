'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { StatsBar } from '@/components/StatsBar';
import { PromptBar } from '@/components/PromptBar';
import { AgentCanvas } from '@/components/AgentCanvas';
import { LedgerGrid } from '@/components/LedgerGrid';
import { INITIAL_LEDGER_ITEMS } from '@/lib/mockData';
import { AgentStep, LedgerItem, VendorQuote } from '@/types';
import { Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Home() {
  const [ledger, setLedger] = useState<LedgerItem[]>(INITIAL_LEDGER_ITEMS);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusNotification, setStatusNotification] = useState<{
    type: 'success' | 'alert';
    message: string;
  } | null>(null);

  const handleExecuteAgent = async (query: string, category?: string, budgetLimit?: number) => {
    setIsProcessing(true);
    setStatusNotification(null);

    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, category, budgetLimit }),
      });

      const data = await res.json();
      if (!data.steps) {
        throw new Error(data.error || 'Failed to run agent');
      }

      setSteps(data.steps);

      if (data.newLedgerItem) {
        setLedger(prev => [data.newLedgerItem, ...prev]);
        setStatusNotification({
          type: 'success',
          message: `PayPal Sandbox Order ${data.newLedgerItem.paypalOrderId} settled and committed to AG Grid Ledger!`,
        });
      } else if (data.requiresApproval) {
        setStatusNotification({
          type: 'alert',
          message: 'Spend exceeds autonomous limit ($250). Human approval required in Agent Flow Graph.',
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusNotification({
        type: 'alert',
        message: err.message || 'Agent error encountered',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveQuote = async (quote: VendorQuote) => {
    setIsProcessing(true);
    setStatusNotification(null);

    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', quote }),
      });

      const data = await res.json();
      if (data.steps && data.newLedgerItem) {
        setSteps(prev => [...prev.filter(s => s.type !== 'approval'), ...data.steps]);
        setLedger(prev => [data.newLedgerItem, ...prev]);
        setStatusNotification({
          type: 'success',
          message: `Manager Approved! PayPal Order ${data.newLedgerItem.paypalOrderId} captured and logged.`,
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusNotification({
        type: 'alert',
        message: 'Failed to approve PayPal order',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = () => {
    setSteps(prev => [
      ...prev.filter(s => s.type !== 'approval'),
      {
        id: 'rejected',
        stepNumber: 5,
        type: 'completed',
        title: 'Procurement Rejected by Policy Gate',
        description: 'Manager rejected quote. Order canceled without dispatching PayPal funds.',
        timestamp: new Date().toTimeString().split(' ')[0],
        status: 'failed',
      }
    ]);
    setStatusNotification({
      type: 'alert',
      message: 'Procurement order rejected. Zero funds dispatched.',
    });
  };

  const handleReset = () => {
    setLedger(INITIAL_LEDGER_ITEMS);
    setSteps([]);
    setStatusNotification(null);
  };

  return (
    <div className="min-h-screen bg-[#070412] text-white flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Command Header */}
      <Header onReset={handleReset} isProcessing={isProcessing} />

      {/* Main Body */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-6 space-y-6">
        {/* Banner Notification */}
        {statusNotification && (
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm font-mono transition-all ${
            statusNotification.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
              : 'bg-amber-950/60 border-amber-500/50 text-amber-200'
          }`}>
            <div className="flex items-center gap-2.5">
              {statusNotification.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
              )}
              <span>{statusNotification.message}</span>
            </div>
            <button
              onClick={() => setStatusNotification(null)}
              className="text-xs opacity-70 hover:opacity-100 uppercase"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Real-time KPI Stats Bar */}
        <StatsBar ledger={ledger} />

        {/* Agent Mission Prompt Bar */}
        <div className="bg-[#0e0824]/90 border border-purple-900/40 rounded-2xl p-5 shadow-xl">
          <PromptBar onExecute={handleExecuteAgent} isProcessing={isProcessing} />
        </div>

        {/* Visual Graph & Reasoning Engine (React Flow) */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-mono tracking-wider uppercase text-purple-200 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Autonomous Agent Decision Graph
            </h2>
            <span className="text-xs font-mono text-purple-400/70">
              Interactive Zoom / Pan &middot; Live Policy Gating
            </span>
          </div>
          <AgentCanvas
            steps={steps}
            onApprove={handleApproveQuote}
            onReject={handleReject}
          />
        </section>

        {/* High-density Institutional Ledger (AG Grid) */}
        <section className="space-y-2 pb-10">
          <LedgerGrid items={ledger} />
        </section>
      </main>
    </div>
  );
}
