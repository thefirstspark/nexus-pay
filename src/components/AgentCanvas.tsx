'use client';

import React, { useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  ThoughtNode,
  ToolNode,
  ApprovalNode,
  PaymentNode,
  SettledNode,
} from './canvas/CustomNodes';
import { AgentStep, VendorQuote } from '@/types';

interface AgentCanvasProps {
  steps: AgentStep[];
  onApprove?: (quote: VendorQuote) => void;
  onReject?: () => void;
}

export function AgentCanvas({ steps, onApprove, onReject }: AgentCanvasProps) {
  const nodeTypes = useMemo(
    () => ({
      thought: (props: any) => <ThoughtNode {...props} />,
      tool: (props: any) => <ToolNode {...props} />,
      approval: (props: any) => <ApprovalNode {...props} onApprove={onApprove} onReject={onReject} />,
      payment: (props: any) => <PaymentNode {...props} />,
      completed: (props: any) => <SettledNode {...props} />,
    }),
    [onApprove, onReject]
  );

  const { nodes, edges } = useMemo(() => {
    if (steps.length === 0) {
      return {
        nodes: [
          {
            id: 'idle',
            type: 'thought',
            position: { x: 300, y: 150 },
            data: {
              id: 'idle',
              stepNumber: 0,
              type: 'thought',
              title: 'Agent Awaiting Mission',
              description: 'Select a preset procurement mission above or type a custom command to visualize autonomous agent reasoning.',
              timestamp: '--:--:--',
              status: 'pending',
              metadata: {
                reasoning: [
                  'Listening for procurement commands',
                  'PayPal Sandbox integration initialized',
                  'AG Grid Ledger synchronized'
                ]
              }
            } as Record<string, unknown>
          }
        ] as Node[],
        edges: [] as Edge[],
      };
    }

    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    const spacingY = 220;
    const startX = 260;
    const startY = 40;

    steps.forEach((step, index) => {
      const xOffset = index % 2 === 0 ? 0 : 40;
      flowNodes.push({
        id: step.id,
        type: step.type,
        position: { x: startX + xOffset, y: startY + index * spacingY },
        data: { ...step } as Record<string, unknown>,
      });

      if (index > 0) {
        const prevStep = steps[index - 1];
        flowEdges.push({
          id: `e-${prevStep.id}-${step.id}`,
          source: prevStep.id,
          target: step.id,
          animated: true,
          style: {
            stroke: step.type === 'approval' ? '#f59e0b' : '#a855f7',
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: step.type === 'approval' ? '#f59e0b' : '#a855f7',
          },
        });
      }
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, [steps]);

  return (
    <div className="h-[520px] w-full rounded-2xl border border-purple-900/50 bg-[#080516] relative overflow-hidden shadow-2xl">
      <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-purple-300/80 bg-purple-950/60 px-2.5 py-1 rounded-md border border-purple-800/40">
          Agent Reasoning Graph &middot; React Flow
        </span>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.4}
        maxZoom={1.5}
        className="bg-transparent"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1.2} color="rgba(168, 85, 247, 0.15)" />
        <Controls className="!bg-[#150d32] !border-purple-800/50 !text-white" />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'approval') return '#f59e0b';
            if (n.type === 'tool') return '#06b6d4';
            if (n.type === 'payment') return '#3b82f6';
            if (n.type === 'completed') return '#10b981';
            return '#a855f7';
          }}
          className="!bg-[#0c081e] !border !border-purple-800/40 rounded-xl"
        />
      </ReactFlow>
    </div>
  );
}
