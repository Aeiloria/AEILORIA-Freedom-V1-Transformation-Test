/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SystemAggregateState, PersistenceClassification } from '../types/experiment';
import { Sparkles, Flame } from 'lucide-react';

interface StateSpacePlotProps {
  stateX: SystemAggregateState;
  stateZ: SystemAggregateState;
  stateZPrime: SystemAggregateState;
  stateZControl: SystemAggregateState;
  classification: PersistenceClassification;
  appliedY: number;
}

export const StateSpacePlot: React.FC<StateSpacePlotProps> = ({
  stateX,
  stateZ,
  stateZPrime,
  stateZControl,
  classification,
  appliedY,
}) => {
  const [hoveredAgent, setHoveredAgent] = useState<{ id: string; f: number; v: number; ether: number; fire: number; stage: string } | null>(null);

  const width = 420;
  const height = 340;
  const pad = 44;
  const plotW = width - pad * 2;
  const plotH = height - pad * 2;

  const toSvgX = (freedom: number) => pad + freedom * plotW;
  const toSvgY = (vice: number) => pad + (1 - vice) * plotH;

  const xCentroid = [toSvgX(stateX.mean_freedom_state), toSvgY(stateX.mean_freedoms_vice)];
  const zCentroid = [toSvgX(stateZ.mean_freedom_state), toSvgY(stateZ.mean_freedoms_vice)];
  const zPrimeCentroid = [toSvgX(stateZPrime.mean_freedom_state), toSvgY(stateZPrime.mean_freedoms_vice)];
  const zControlCentroid = [toSvgX(stateZControl.mean_freedom_state), toSvgY(stateZControl.mean_freedoms_vice)];

  return (
    <div className="rounded border border-zinc-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-pink-500" />
          <div className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-900">
            State Space Phase Portrait: (Freedom vs Freedom&apos;s vice)
          </div>
        </div>
        <div className="font-mono text-[11px] text-pink-700 font-medium flex items-center gap-1.5">
          <span>Ether: {stateZ.mean_ether_permeability.toFixed(2)}</span>
          <span className="text-zinc-300">·</span>
          <span>Fire: {stateZ.mean_fire_potency.toFixed(2)}</span>
        </div>
      </div>

      <div className="relative mt-2 flex flex-col items-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-[480px] overflow-visible select-none bg-zinc-50/50 rounded border border-zinc-100"
        >
          {/* Subtle Etheric field lattice background */}
          <defs>
            <radialGradient id="etherGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fdf2f8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="pinkFireVector" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#db2777" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>

          <rect x={pad} y={pad} width={plotW} height={plotH} fill="url(#etherGlow)" />

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((v) => (
            <g key={`grid-x-${v}`}>
              <line
                x1={toSvgX(v)}
                y1={pad}
                x2={toSvgX(v)}
                y2={pad + plotH}
                stroke="#f3e8ff"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <text
                x={toSvgX(v)}
                y={pad + plotH + 16}
                fill="#71717a"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {v.toFixed(2)}
              </text>
            </g>
          ))}

          {[0, 0.25, 0.5, 0.75, 1.0].map((v) => (
            <g key={`grid-y-${v}`}>
              <line
                x1={pad}
                y1={toSvgY(v)}
                x2={pad + plotW}
                y2={toSvgY(v)}
                stroke="#f3e8ff"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <text
                x={pad - 8}
                y={toSvgY(v) + 3}
                fill="#71717a"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="end"
              >
                {v.toFixed(2)}
              </text>
            </g>
          ))}

          {/* Axes labels */}
          <text
            x={pad + plotW / 2}
            y={height - 2}
            fill="#3f3f46"
            fontSize="10"
            fontFamily="monospace"
            textAnchor="middle"
          >
            Freedom State [0 → 1] (Ether Field Openness)
          </text>
          <text
            transform={`rotate(-90 14 ${pad + plotH / 2})`}
            x={14}
            y={pad + plotH / 2}
            fill="#3f3f46"
            fontSize="10"
            fontFamily="monospace"
            textAnchor="middle"
          >
            Freedom&apos;s vice [0 → 1]
          </text>

          {/* Critical persistence radius ring around x */}
          <circle
            cx={xCentroid[0]}
            cy={xCentroid[1]}
            r={plotW * 0.08}
            fill="none"
            stroke="#fbcfe8"
            strokeWidth="1.2"
            strokeDasharray="3,3"
          />

          {/* Vector 1: x -> z (applied transformation in Pink Fire!) */}
          <line
            x1={xCentroid[0]}
            y1={xCentroid[1]}
            x2={zCentroid[0]}
            y2={zCentroid[1]}
            stroke="url(#pinkFireVector)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Vector 2: x -> z_control (control run drift) */}
          <line
            x1={xCentroid[0]}
            y1={xCentroid[1]}
            x2={zControlCentroid[0]}
            y2={zControlCentroid[1]}
            stroke="#cbd5e1"
            strokeWidth="1.5"
            strokeDasharray="3,3"
          />

          {/* Vector 3: z -> z_prime (removal relaxation) */}
          <line
            x1={zCentroid[0]}
            y1={zCentroid[1]}
            x2={zPrimeCentroid[0]}
            y2={zPrimeCentroid[1]}
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="4,2"
          />

          {/* Agents in Baseline x (Etheric Sky Blue / Light Violet) */}
          {stateX.agents.map((a) => (
            <circle
              key={`x-${a.id}`}
              cx={toSvgX(a.freedom_state)}
              cy={toSvgY(a.freedoms_vice)}
              r="3.5"
              fill="#0284c7"
              opacity="0.6"
              onMouseEnter={() =>
                setHoveredAgent({ id: a.id, f: a.freedom_state, v: a.freedoms_vice, ether: a.ether_permeability, fire: a.fire_potency, stage: 'Baseline x' })
              }
              onMouseLeave={() => setHoveredAgent(null)}
              className="cursor-pointer transition-transform hover:scale-150"
            />
          ))}

          {/* Agents in State z (Primary Radiant Pink Fire Motifs) */}
          {stateZ.agents.map((a) => (
            <circle
              key={`z-${a.id}`}
              cx={toSvgX(a.freedom_state)}
              cy={toSvgY(a.freedoms_vice)}
              r="4.5"
              fill="#db2777"
              stroke="#f472b6"
              strokeWidth="1.2"
              opacity="0.9"
              onMouseEnter={() =>
                setHoveredAgent({ id: a.id, f: a.freedom_state, v: a.freedoms_vice, ether: a.ether_permeability, fire: a.fire_potency, stage: 'Outcome z (Transmuted)' })
              }
              onMouseLeave={() => setHoveredAgent(null)}
              className="cursor-pointer transition-transform hover:scale-150"
            />
          ))}

          {/* Agents in State z' (Amber release) */}
          {stateZPrime.agents.map((a) => (
            <rect
              key={`zprime-${a.id}`}
              x={toSvgX(a.freedom_state) - 3}
              y={toSvgY(a.freedoms_vice) - 3}
              width="6"
              height="6"
              fill="#f59e0b"
              opacity="0.85"
              onMouseEnter={() =>
                setHoveredAgent({ id: a.id, f: a.freedom_state, v: a.freedoms_vice, ether: a.ether_permeability, fire: a.fire_potency, stage: 'Removed z\'' })
              }
              onMouseLeave={() => setHoveredAgent(null)}
              className="cursor-pointer transition-transform hover:scale-150"
            />
          ))}

          {/* Centroid x */}
          <g>
            <circle cx={xCentroid[0]} cy={xCentroid[1]} r="7" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
            <text x={xCentroid[0] + 10} y={xCentroid[1] - 8} fill="#0369a1" fontSize="11" fontFamily="monospace" fontWeight="bold">
              x (Baseline)
            </text>
          </g>

          {/* Centroid z_control */}
          <g>
            <circle cx={zControlCentroid[0]} cy={zControlCentroid[1]} r="5" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
            <text x={zControlCentroid[0] + 8} y={zControlCentroid[1] + 12} fill="#64748b" fontSize="10" fontFamily="monospace">
              z_control (y=0)
            </text>
          </g>

          {/* Centroid z in Radiant Pink */}
          <g>
            <circle cx={zCentroid[0]} cy={zCentroid[1]} r="8" fill="#db2777" stroke="#be185d" strokeWidth="2.5" />
            <circle cx={zCentroid[0]} cy={zCentroid[1]} r="12" fill="none" stroke="#f472b6" strokeWidth="1" strokeDasharray="2,2" opacity="0.8" />
            <text x={zCentroid[0] + 14} y={zCentroid[1] - 8} fill="#be185d" fontSize="11" fontFamily="monospace" fontWeight="bold">
              z = F(x, y) [Fire-Transmuted]
            </text>
          </g>

          {/* Centroid z' */}
          <g>
            <polygon
              points={`${zPrimeCentroid[0]},${zPrimeCentroid[1] - 7} ${zPrimeCentroid[0] + 6},${zPrimeCentroid[1] + 5} ${zPrimeCentroid[0] - 6},${zPrimeCentroid[1] + 5}`}
              fill="#d97706"
              stroke="#b45309"
              strokeWidth="2"
            />
            <text x={zPrimeCentroid[0] + 10} y={zPrimeCentroid[1] + 4} fill="#b45309" fontSize="11" fontFamily="monospace" fontWeight="bold">
              z&apos; = F(z, 0)
            </text>
          </g>
        </svg>

        {/* Hover inspector popup */}
        {hoveredAgent && (
          <div className="absolute top-2 right-2 rounded-lg border border-pink-200 bg-white/95 p-2.5 font-mono text-[11px] text-zinc-900 shadow-md">
            <div className="font-semibold text-pink-700">{hoveredAgent.id} ({hoveredAgent.stage})</div>
            <div>Freedom: {hoveredAgent.f.toFixed(4)}</div>
            <div>Freedom&apos;s vice: {hoveredAgent.v.toFixed(4)}</div>
            <div className="flex items-center gap-2 mt-1 pt-1 border-t border-zinc-100 text-[10px] text-zinc-600">
              <span className="text-pink-600">Ether: {hoveredAgent.ether.toFixed(3)}</span>
              <span className="text-rose-600">Fire: {hoveredAgent.fire.toFixed(3)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Diagnostics */}
      <div className="mt-3 flex flex-wrap items-center justify-between border-t border-zinc-200 pt-2 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-4 text-zinc-600">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-600" />
            <span>x: ({stateX.mean_freedom_state.toFixed(3)}, {stateX.mean_freedoms_vice.toFixed(3)})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-pink-600 ring-2 ring-pink-200" />
            <span className="text-pink-700 font-semibold">z: ({stateZ.mean_freedom_state.toFixed(3)}, {stateZ.mean_freedoms_vice.toFixed(3)})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 bg-amber-600" />
            <span>z&apos;: ({stateZPrime.mean_freedom_state.toFixed(3)}, {stateZPrime.mean_freedoms_vice.toFixed(3)})</span>
          </span>
          <span className="flex items-center gap-1.5 text-zinc-500">
            <span className="inline-block h-2 w-2 rounded-full border border-zinc-400 bg-zinc-200" />
            <span>z_ctrl: ({stateZControl.mean_freedom_state.toFixed(3)}, {stateZControl.mean_freedoms_vice.toFixed(3)})</span>
          </span>
        </div>

        <div className="text-zinc-700">
          Classification:{' '}
          <span
            className={`font-semibold ${
              classification === 'SELF-SUSTAINING CANDIDATE'
                ? 'text-pink-700 font-bold'
                : classification === 'ADAPTED'
                ? 'text-amber-700'
                : 'text-zinc-600'
            }`}
          >
            {classification}
          </span>
        </div>
      </div>
    </div>
  );
};
