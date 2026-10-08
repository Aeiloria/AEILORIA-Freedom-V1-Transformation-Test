/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StateTransitionRecord } from '../types/experiment';
import { Sparkles, Flame } from 'lucide-react';

interface TrajectoryPlotProps {
  history: StateTransitionRecord[];
  timestepsPerStage: number;
}

export const TrajectoryPlot: React.FC<TrajectoryPlotProps> = ({
  history,
  timestepsPerStage,
}) => {
  if (history.length === 0) return null;

  const totalSteps = history.length;
  const width = 640;
  const height = 240;
  const padL = 48;
  const padR = 24;
  const padT = 28;
  const padB = 32;

  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const toSvgX = (t: number) => padL + ((t - 1) / (totalSteps - 1 || 1)) * plotW;
  const toSvgYNorm = (val: number) => padT + (1 - Math.max(0, Math.min(1, val))) * plotH;

  const maxAccessible = Math.max(...history.map(h => h.accessible_states), 300);
  const toSvgYAcc = (acc: number) => padT + (1 - acc / maxAccessible) * plotH;

  const freedomPath = history
    .map((h, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(h.timestep)} ${toSvgYNorm(h.mean_freedom_state)}`)
    .join(' ');

  const vicePath = history
    .map((h, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(h.timestep)} ${toSvgYNorm(h.mean_freedoms_vice)}`)
    .join(' ');

  const accessiblePath = history
    .map((h, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(h.timestep)} ${toSvgYAcc(h.accessible_states)}`)
    .join(' ');

  const tAEnd = timestepsPerStage;
  const tBCEnd = timestepsPerStage * 2;

  return (
    <div className="rounded border border-zinc-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-pink-600" />
          <div className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-900">
            Temporal Trajectory Oscilloscope [Stages A → B/C → D]
          </div>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-600">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-3 bg-pink-600 rounded-xs" /> Freedom State (Pink)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-3 bg-rose-600 rounded-xs" /> Freedom&apos;s vice
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-3 bg-purple-500 rounded-xs" /> Accessible States (Ether)
          </span>
        </div>
      </div>

      <div className="mt-2 w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[500px] select-none rounded border border-zinc-100 bg-white">
          {/* Stage Background Bands */}
          {/* Stage A: Baseline */}
          <rect
            x={toSvgX(1)}
            y={padT}
            width={toSvgX(tAEnd) - toSvgX(1)}
            height={plotH}
            fill="#f8fafc"
            opacity="0.8"
          />
          {/* Stage B/C: Apply V1 (Radiant Pink Tint) */}
          <rect
            x={toSvgX(tAEnd)}
            y={padT}
            width={toSvgX(tBCEnd) - toSvgX(tAEnd)}
            height={plotH}
            fill="#fdf2f8"
            opacity="0.9"
          />
          {/* Stage D: Remove V1 */}
          <rect
            x={toSvgX(tBCEnd)}
            y={padT}
            width={toSvgX(totalSteps) - toSvgX(tBCEnd)}
            height={plotH}
            fill="#fffbeb"
            opacity="0.6"
          />

          {/* Vertical Stage Dividing Lines */}
          <line
            x1={toSvgX(tAEnd)}
            y1={padT}
            x2={toSvgX(tAEnd)}
            y2={padT + plotH}
            stroke="#f472b6"
            strokeWidth="1.5"
            strokeDasharray="3,3"
          />
          <line
            x1={toSvgX(tBCEnd)}
            y1={padT}
            x2={toSvgX(tBCEnd)}
            y2={padT + plotH}
            stroke="#f472b6"
            strokeWidth="1.5"
            strokeDasharray="3,3"
          />

          {/* Stage Headers */}
          <text
            x={(toSvgX(1) + toSvgX(tAEnd)) / 2}
            y={padT - 8}
            fill="#64748b"
            fontSize="10"
            fontFamily="monospace"
            textAnchor="middle"
          >
            STAGE A · BASELINE (y=0)
          </text>
          <text
            x={(toSvgX(tAEnd) + toSvgX(tBCEnd)) / 2}
            y={padT - 8}
            fill="#db2777"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            STAGE B/C · APPLY V1 (y) [ETHER-FIRE TRANSMUTATION]
          </text>
          <text
            x={(toSvgX(tBCEnd) + toSvgX(totalSteps)) / 2}
            y={padT - 8}
            fill="#b45309"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            STAGE D · REMOVE V1 → z&apos; = F(z, 0)
          </text>

          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((v) => (
            <g key={`t-grid-${v}`}>
              <line
                x1={padL}
                y1={toSvgYNorm(v)}
                x2={padL + plotW}
                y2={toSvgYNorm(v)}
                stroke="#e4e4e7"
                strokeDasharray="2,2"
              />
              <text
                x={padL - 8}
                y={toSvgYNorm(v) + 3}
                fill="#71717a"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="end"
              >
                {v.toFixed(2)}
              </text>
            </g>
          ))}

          {/* Trajectory Paths */}
          <path d={accessiblePath} fill="none" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4,2" opacity="0.8" />
          <path d={vicePath} fill="none" stroke="#e11d48" strokeWidth="2" />
          <path d={freedomPath} fill="none" stroke="#db2777" strokeWidth="2.8" strokeLinecap="round" />

          {/* X Axis Timestep ticks */}
          <text x={toSvgX(1)} y={padT + plotH + 16} fill="#71717a" fontSize="9" fontFamily="monospace" textAnchor="middle">
            t=1
          </text>
          <text x={toSvgX(tAEnd)} y={padT + plotH + 16} fill="#71717a" fontSize="9" fontFamily="monospace" textAnchor="middle">
            t={tAEnd}
          </text>
          <text x={toSvgX(tBCEnd)} y={padT + plotH + 16} fill="#71717a" fontSize="9" fontFamily="monospace" textAnchor="middle">
            t={tBCEnd}
          </text>
          <text x={toSvgX(totalSteps)} y={padT + plotH + 16} fill="#71717a" fontSize="9" fontFamily="monospace" textAnchor="middle">
            t={totalSteps}
          </text>
        </svg>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-zinc-200 pt-2 font-mono text-[11px] text-zinc-500">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-pink-500" />
          <span>Baseline x at t={tAEnd} → Applied z at t={tBCEnd} → Released z&apos; at t={totalSteps}</span>
        </div>
        <div>
          Timesteps: {totalSteps} total ({timestepsPerStage} per stage)
        </div>
      </div>
    </div>
  );
};
