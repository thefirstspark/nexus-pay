'use client';

import React, { useState } from 'react';
import { PRESET_PROMPTS } from '@/lib/mockData';
import { ProcurementPrompt } from '@/types';
import { Send, Zap, Sliders } from 'lucide-react';

interface PromptBarProps {
  onExecute: (query: string, category?: string, budgetLimit?: number) => void;
  isProcessing: boolean;
}

export function PromptBar({ onExecute, isProcessing }: PromptBarProps) {
  const [input, setInput] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onExecute(input.trim());
  };

  const handleSelectPreset = (preset: ProcurementPrompt) => {
    setSelectedPrompt(preset.id);
    setInput(preset.query);
    onExecute(preset.query, preset.category, preset.budgetLimit);
  };

  return (
    <div className="space-y-3">
      {/* Input bar */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 text-purple-400 pointer-events-none">
          <Zap className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Instruct the autonomous agent (e.g. 'Procure 200 GPU compute hours on Render under $450')..."
          disabled={isProcessing}
          className="w-full pl-12 pr-32 py-3.5 rounded-xl bg-[#110b27] border border-purple-800/50 text-white placeholder-purple-300/40 font-mono text-sm focus:outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20 shadow-inner"
        />
        <button
          type="submit"
          disabled={!input.trim() || isProcessing}
          className="absolute right-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-purple-900/50 disabled:opacity-50"
        >
          <span>{isProcessing ? 'Agent Active' : 'Run Agent'}</span>
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>

      {/* Preset Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-purple-300/60 flex items-center gap-1">
          <Sliders className="h-3 w-3" /> Preset Missions:
        </span>
        {PRESET_PROMPTS.map((p) => (
          <button
            key={p.id}
            onClick={() => handleSelectPreset(p)}
            disabled={isProcessing}
            className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all text-left flex items-center gap-1.5 ${
              selectedPrompt === p.id
                ? 'bg-purple-800/40 border-amber-400/60 text-amber-300 shadow-sm'
                : 'bg-[#150d32]/70 border-purple-800/40 text-purple-200/80 hover:bg-purple-900/30 hover:border-purple-600/50'
            } disabled:opacity-50`}
          >
            <span className="font-medium text-white">{p.label}</span>
            <span className="text-[10px] text-purple-300/50">(&lt; $${p.budgetLimit})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
