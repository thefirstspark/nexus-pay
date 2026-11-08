'use client';

import React, { useMemo, useState, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  AllCommunityModule,
  ModuleRegistry,
  colorSchemeDark,
  themeQuartz,
  type ColDef,
  type GridReadyEvent,
} from 'ag-grid-community';
import { LedgerItem } from '@/types';
import { Search, Download, ShieldCheck, ExternalLink } from 'lucide-react';

ModuleRegistry.registerModules([AllCommunityModule]);

const darkQuartzTheme = themeQuartz.withPart(colorSchemeDark).withParams({
  backgroundColor: '#0b0718',
  foregroundColor: '#e8e4ff',
  headerBackgroundColor: '#120b28',
  accentColor: '#ffb43c',
  borderColor: 'rgba(164,107,255,0.22)',
  fontFamily: 'var(--font-mono), monospace',
  fontSize: 12.5,
});

interface LedgerGridProps {
  items: LedgerItem[];
}

export function LedgerGrid({ items }: LedgerGridProps) {
  const gridRef = useRef<AgGridReact<LedgerItem>>(null);
  const [quickFilter, setQuickFilter] = useState('');

  const colDefs = useMemo<ColDef<LedgerItem>[]>(() => [
    {
      field: 'id',
      headerName: 'TXN ID',
      width: 110,
      cellRenderer: (p: any) => (
        <span className="font-mono font-bold text-amber-400">{p.value}</span>
      ),
    },
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      width: 155,
      cellRenderer: (p: any) => (
        <span className="text-purple-300/80 font-mono text-[11px]">{p.value}</span>
      ),
    },
    {
      field: 'vendor',
      headerName: 'Vendor / Merchant',
      width: 200,
      cellRenderer: (p: any) => (
        <span className="font-semibold text-white">{p.value}</span>
      ),
    },
    {
      field: 'itemDescription',
      headerName: 'Item & SLA Description',
      flex: 2,
      minWidth: 220,
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 150,
      cellRenderer: (p: any) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-purple-950/60 border border-purple-800/40 text-purple-200">
          {p.value}
        </span>
      ),
    },
    {
      field: 'totalAmount',
      headerName: 'Amount (USD)',
      width: 130,
      cellRenderer: (p: any) => (
        <span className="font-mono font-bold text-emerald-400">
          $${Number(p.value).toFixed(2)}
        </span>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      cellRenderer: (p: any) => {
        const val = p.value;
        const color =
          val === 'COMPLETED'
            ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60'
            : val === 'PENDING_APPROVAL'
            ? 'bg-amber-950/70 text-amber-300 border-amber-700/60'
            : 'bg-blue-950/70 text-blue-300 border-blue-700/60';
        return (
          <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded border ${color}`}>
            {val}
          </span>
        );
      },
    },
    {
      field: 'approvalType',
      headerName: 'Gate Type',
      width: 150,
      cellRenderer: (p: any) => {
        const isAuto = p.value === 'AUTONOMOUS';
        return (
          <span className={`text-[11px] font-mono ${isAuto ? 'text-cyan-400 font-semibold' : 'text-amber-400 font-semibold'}`}>
            {isAuto ? '🤖 Autonomous' : '👤 Human Sign-off'}
          </span>
        );
      },
    },
    {
      field: 'paypalOrderId',
      headerName: 'PayPal Order ID',
      width: 170,
      cellRenderer: (p: any) => {
        const id = p.value;
        const sandboxUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${id}`;
        return (
          <a
            href={sandboxUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 font-mono text-[11px] underline flex items-center gap-1 truncate"
            title="Inspect in PayPal Sandbox"
          >
            <span>{id}</span>
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        );
      },
    },
    {
      field: 'confidenceScore',
      headerName: 'AI Rating',
      width: 110,
      cellRenderer: (p: any) => (
        <span className="font-mono text-xs text-purple-200">
          {p.value}%
        </span>
      ),
    },
  ], []);

  const onExportCsv = useCallback(() => {
    gridRef.current?.api.exportDataAsCsv({
      fileName: 'nexuspay-institutional-ledger.csv',
    });
  }, []);

  return (
    <div className="space-y-3">
      {/* Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-bold font-mono text-white tracking-wide uppercase">
            AG Grid Institutional Ledger ({items.length} records)
          </h2>
          <span className="text-[10px] font-mono bg-purple-900/40 text-purple-300 border border-purple-700/40 px-2 py-0.5 rounded">
            Live Settlement Sync
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-purple-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={quickFilter}
              onChange={(e) => setQuickFilter(e.target.value)}
              placeholder="Search ledger..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#110b27] border border-purple-800/40 text-xs font-mono text-white placeholder-purple-400/50 focus:outline-none focus:border-amber-400"
            />
          </div>
          <button
            onClick={onExportCsv}
            className="px-3 py-1.5 rounded-lg bg-purple-900/30 hover:bg-purple-800/40 border border-purple-700/50 text-purple-200 font-mono text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="h-[420px] w-full rounded-2xl overflow-hidden border border-purple-900/40 shadow-2xl">
        <AgGridReact<LedgerItem>
          ref={gridRef}
          rowData={items}
          columnDefs={colDefs}
          theme={darkQuartzTheme}
          quickFilterText={quickFilter}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 20, 50]}
          animateRows={true}
        />
      </div>
    </div>
  );
}
