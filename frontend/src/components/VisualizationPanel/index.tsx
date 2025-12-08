import { useEffect, useState } from 'react';

interface NodePosition {
  x: number;
  y: number;
}

const NODES: Record<string, NodePosition> = {
  Client: { x: 10, y: 50 },
  Backend: { x: 40, y: 50 },
  Memory: { x: 40, y: 20 },
  Internet: { x: 60, y: 20 },
  RAG: { x: 60, y: 80 },
  Reasoning: { x: 60, y: 50 },
  LLM: { x: 80, y: 50 },
  "MCP Email": { x: 85, y: 20 },
  "MCP Form": { x: 90, y: 50 },
  "MCP Task": { x: 85, y: 80 },
};

interface TraceStep {
  from: string;
  to: string;
}

interface VisualizationPanelProps {
  activeNodes?: string[];
  visibleNodes?: string[];
  trace?: TraceStep[];
}

export const VisualizationPanel = ({ activeNodes = [], visibleNodes = [], trace = [] }: VisualizationPanelProps) => {
  return (
    <div style={{ flex: 1, position: 'relative', backgroundColor: '#222', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Trace Edges */}
        {trace.map((step, idx) => {
           const fromPos = NODES[step.from];
           const toPos = NODES[step.to];
           if (!fromPos || !toPos) return null;

           return (
             <line
               key={idx}
               x1={fromPos.x} y1={fromPos.y}
               x2={toPos.x} y2={toPos.y}
               stroke="#ffd700"
               strokeWidth="0.5"
               strokeDasharray="1"
               opacity="0.8"
             />
           );
        })}

        {/* Nodes */}
        {Object.entries(NODES).map(([name, pos]) => {
          if (visibleNodes.length > 0 && !visibleNodes.includes(name)) {
            return null;
          }

          const isActive = activeNodes.includes(name);
          return (
            <g key={name} transform={`translate(${pos.x}, ${pos.y})`}>
              <circle
                r="3"
                fill={isActive ? '#007acc' : '#444'}
                stroke={isActive ? 'white' : 'none'}
                strokeWidth="0.5"
              />
              <text
                y="5"
                fontSize="3"
                fill={isActive ? 'white' : '#666'}
                textAnchor="middle"
                style={{ pointerEvents: 'none' }}
              >
                {name}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ position: 'absolute', bottom: 10, right: 10, color: '#666', fontSize: '0.8rem' }}>
        Visualization Panel
      </div>
    </div>
  );
};
