'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Brain, Wrench, ShieldAlert, CreditCard, CheckCircle2, ExternalLink } from 'lucide-react';
import { AgentStep, VendorQuote } from '@/types';

export function ThoughtNode({ data }: { data: AgentStep }) {
  return (
    <div className="w-[300px] rounded-xl bg-[#140b2e]/95 border-2 border-purple-600/60 p-4 shadow-xl shadow-purple-950/60 text-white backdrop-blur-md">
      <Handle type="target" position={Position.Top} className="!bg-purple-400" />
      <div className="flex items-center gap-2.5 mb-2">
        <div className="h-7 w-7 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
          <Brain className="h-4 w-4 animate-pulse" />
        </div>
        <div>
          <div className="text-xs font-mono font-bold text-purple-200">{data.title}</div>
          <div className="text-[10px] font-mono text-purple-400/70">{data.timestamp} &middot; Step #{data.stepNumber}</div>
        </div>
      </div>
      <p className="text-xs text-purple-200/90 leading-relaxed font-sans">{data.description}</p>
      {data.metadata?.reasoning && (
        <ul className="mt-2.5 pt-2 border-t border-purple-800/40 space-y-1">
          {data.metadata.reasoning.map((r, i) => (
            <li key={i} className="text-[10px] font-mono text-purple-300/80 flex items-start gap-1">
              <span className="text-amber-400">&gt;</span> {r}
            </li>
          ))}
        </ul>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-purple-400" />
    </div>
  );
}

export function ToolNode({ data }: { data: AgentStep }) {
  const quotes = data.metadata?.quotes as VendorQuote[] | undefined;

  return (
    <div className="w-[320px] rounded-xl bg-[#0e122b]/95 border-2 border-cyan-500/60 p-4 shadow-xl shadow-cyan-950/60 text-white backdrop-blur-md">
      <Handle type="target" position={Position.Top} className="!bg-cyan-400" />
      <div className="flex items-center gap-2.5 mb-2">
        <div className="h-7 w-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
          <Wrench className="h-4 w-4" />
        </div>
        <div>
          <div className="text-xs font-mono font-bold text-cyan-200">{data.title}</div>
          <div className="text-[10px] font-mono text-cyan-400/70">{data.metadata?.toolName || 'tool_invocation'}</div>
        </div>
      </div>
      <p className="text-xs text-cyan-100/90 leading-relaxed">{data.description}</p>
      {quotes && (
        <div className="mt-2.5 pt-2 border-t border-cyan-900/40 space-y-1.5">
          <div className="text-[10px] font-mono text-cyan-300 font-semibold uppercase">Retrieved Quotes:</div>
          {quotes.map((q) => (
            <div key={q.id} className="text-[10px] font-mono bg-cyan-950/40 p-1.5 rounded border border-cyan-800/40 flex items-center justify-between">
              <span className="truncate max-w-[170px] text-cyan-100">{q.vendorName}</span>
              <span className="font-bold text-amber-300">$${q.totalPrice.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-cyan-400" />
    </div>
  );
}

export function ApprovalNode({ data, onApprove, onReject }: { data: AgentStep; onApprove?: (quote: VendorQuote) => void; onReject?: () => void }) {
  const quote = data.metadata?.selectedQuote as VendorQuote | undefined;

  return (
    <div className="w-[330px] rounded-xl bg-[#231206]/95 border-2 border-amber-500 p-4 shadow-2xl shadow-amber-950/80 text-white backdrop-blur-md animate-pulse" style={{ animationDuration: '3s' }}>
      <Handle type="target" position={Position.Top} className="!bg-amber-400" />
      <div className="flex items-center gap-2.5 mb-2">
        <div className="h-7 w-7 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
          <ShieldAlert className="h-4 w-4" />
        </div>
        <div>
          <div className="text-xs font-mono font-bold text-amber-200">{data.title}</div>
          <div className="text-[10px] font-mono text-amber-400/80 uppercase font-semibold">HUMAN GATE REQUIRED</div>
        </div>
      </div>
      <p className="text-xs text-amber-100/90 leading-relaxed mb-3">{data.description}</p>
      {quote && (
        <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-800/60 text-xs font-mono space-y-1 mb-3">
          <div className="flex justify-between">
            <span className="text-amber-300/80">Vendor:</span>
            <span className="text-white font-semibold">{quote.vendorName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-300/80">Authorized Amount:</span>
            <span className="text-amber-300 font-bold text-sm">$${quote.totalPrice.toFixed(2)} USD</span>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => quote && onApprove?.(quote)}
          className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono text-xs font-bold transition-all shadow-md shadow-amber-950"
        >
          Approve &amp; Pay via PayPal
        </button>
        <button
          onClick={() => onReject?.()}
          className="py-2 px-3 rounded-lg bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-neutral-300 font-mono text-xs"
        >
          Reject
        </button>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-amber-400" />
    </div>
  );
}

export function PaymentNode({ data }: { data: AgentStep }) {
  const orderId = data.metadata?.paypalOrderId;
  const approveUrl = data.metadata?.paypalApproveUrl;

  return (
    <div className="w-[300px] rounded-xl bg-[#071329]/95 border-2 border-blue-500/80 p-4 shadow-xl shadow-blue-950/60 text-white backdrop-blur-md">
      <Handle type="target" position={Position.Top} className="!bg-blue-400" />
      <div className="flex items-center gap-2.5 mb-2">
        <div className="h-7 w-7 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
          <CreditCard className="h-4 w-4" />
        </div>
        <div>
          <div className="text-xs font-mono font-bold text-blue-200">{data.title}</div>
          <div className="text-[10px] font-mono text-blue-400/70">PAYPAL SANDBOX DISPATCH</div>
        </div>
      </div>
      <p className="text-xs text-blue-100/90 leading-relaxed mb-2.5">{data.description}</p>
      {orderId && (
        <div className="p-2 rounded bg-blue-950/60 border border-blue-800/40 flex items-center justify-between text-[11px] font-mono">
          <span className="text-blue-300">Order ID:</span>
          <span className="text-amber-300 font-bold truncate max-w-[140px]">{orderId}</span>
        </div>
      )}
      {approveUrl && (
        <a
          href={approveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 text-[10px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 underline"
        >
          <span>Open PayPal Sandbox View</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-blue-400" />
    </div>
  );
}

export function SettledNode({ data }: { data: AgentStep }) {
  return (
    <div className="w-[280px] rounded-xl bg-[#061d15]/95 border-2 border-emerald-500/80 p-4 shadow-xl shadow-emerald-950/60 text-white backdrop-blur-md">
      <Handle type="target" position={Position.Top} className="!bg-emerald-400" />
      <div className="flex items-center gap-2.5 mb-2">
        <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div>
          <div className="text-xs font-mono font-bold text-emerald-200">{data.title}</div>
          <div className="text-[10px] font-mono text-emerald-400/70">LEDGER COMMITTED</div>
        </div>
      </div>
      <p className="text-xs text-emerald-100/90 leading-relaxed">{data.description}</p>
      {data.metadata?.captureId && (
        <div className="mt-2 p-1.5 rounded bg-emerald-950/50 border border-emerald-800/40 text-[10px] font-mono text-emerald-300 flex justify-between">
          <span>Capture:</span>
          <span className="font-bold">{data.metadata.captureId}</span>
        </div>
      )}
    </div>
  );
}
