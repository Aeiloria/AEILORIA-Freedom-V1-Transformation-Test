/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AEILORIA — FREEDOM V1 TRANSFORMATION TEST
 * Elemental Influence Analysis: Ether & Fire vs Final State Displacement (z-norm)
 */

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { SystemAggregateState } from '../types/experiment';
import { Sparkles, Flame, Activity, Zap, Info } from 'lucide-react';

interface ElementalInfluenceAnalysisProps {
  stateX: SystemAggregateState;
  stateZ: SystemAggregateState;
  stateZPrime: SystemAggregateState;
  appliedY: number;
}

interface AgentCorrelationPoint {
  id: string;
  ether: number;
  fire: number;
  zNorm: number;
  zPrimeNorm: number;
  deltaFreedom: number;
  freedomZ: number;
  viceZ: number;
  color: string;
  quadrant: string;
}

export const ElementalInfluenceAnalysis: React.FC<ElementalInfluenceAnalysisProps> = ({
  stateX,
  stateZ,
  stateZPrime,
  appliedY,
}) => {
  const [metricMode, setMetricMode] = useState<'zNorm' | 'deltaFreedom'>('zNorm');
  const [selectedAgent, setSelectedAgent] = useState<AgentCorrelationPoint | null>(null);

  // Compute correlation points for each agent
  const { data, minZNorm, maxZNorm, etherCorrelation, fireCorrelation, meanSynergy } = useMemo(() => {
    const xAgentsMap = new Map(stateX.agents.map((a) => [a.id, a]));
    const zPrimeAgentsMap = new Map(stateZPrime.agents.map((a) => [a.id, a]));

    const rawPoints = stateZ.agents.map((zAgent) => {
      const xAgent = xAgentsMap.get(zAgent.id) || zAgent;
      const zPrimeAgent = zPrimeAgentsMap.get(zAgent.id) || zAgent;

      const dFreedom = zAgent.freedom_state - xAgent.freedom_state;
      const dVice = zAgent.freedoms_vice - xAgent.freedoms_vice;
      const zNorm = Math.sqrt(dFreedom * dFreedom + dVice * dVice);

      const dFreedomPrime = zPrimeAgent.freedom_state - xAgent.freedom_state;
      const dVicePrime = zPrimeAgent.freedoms_vice - xAgent.freedoms_vice;
      const zPrimeNorm = Math.sqrt(dFreedomPrime * dFreedomPrime + dVicePrime * dVicePrime);

      // Determine quadrant: high/low ether (0.5) and high/low fire (0.5)
      let quadrant = '';
      if (zAgent.ether_permeability >= 0.5 && zAgent.fire_potency >= 0.5) {
        quadrant = 'Catalytic Transmutation (High Ether / High Fire)';
      } else if (zAgent.ether_permeability >= 0.5 && zAgent.fire_potency < 0.5) {
        quadrant = 'Permeable Latency (High Ether / Low Fire)';
      } else if (zAgent.ether_permeability < 0.5 && zAgent.fire_potency >= 0.5) {
        quadrant = 'Kinetic Friction (Low Ether / High Fire)';
      } else {
        quadrant = 'Constrained Inertia (Low Ether / Low Fire)';
      }

      return {
        id: zAgent.id,
        ether: Number(zAgent.ether_permeability.toFixed(3)),
        fire: Number(zAgent.fire_potency.toFixed(3)),
        zNorm: Number(zNorm.toFixed(4)),
        zPrimeNorm: Number(zPrimeNorm.toFixed(4)),
        deltaFreedom: Number(dFreedom.toFixed(4)),
        freedomZ: Number(zAgent.freedom_state.toFixed(4)),
        viceZ: Number(zAgent.freedoms_vice.toFixed(4)),
        quadrant,
      };
    });

    // Find min and max for color normalization
    const zNormValues = rawPoints.map((p) => p.zNorm);
    const minZ = Math.min(...zNormValues, 0.001);
    const maxZ = Math.max(...zNormValues, 0.1);

    // Compute pink-to-neutral-zinc color gradient:
    // Low displacement -> neutral-zinc (#71717a)
    // Moderate displacement -> soft pink (#f472b6)
    // High displacement -> radiant deep pink (#db2777 / #be185d)
    const points: AgentCorrelationPoint[] = rawPoints.map((p) => {
      const normalized = Math.max(0, Math.min(1, (p.zNorm - minZ) / (maxZ - minZ || 1)));

      // Interpolate RGB from neutral zinc (113, 113, 122) to vivid pink (219, 39, 119)
      const r = Math.round(113 + (219 - 113) * normalized);
      const g = Math.round(113 + (39 - 113) * normalized);
      const b = Math.round(122 + (119 - 122) * normalized);
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

      return {
        ...p,
        color: hex,
      };
    });

    // Compute Pearson correlation coefficients
    const n = points.length || 1;
    const meanEther = points.reduce((acc, p) => acc + p.ether, 0) / n;
    const meanFire = points.reduce((acc, p) => acc + p.fire, 0) / n;
    const meanTarget = points.reduce((acc, p) => acc + (metricMode === 'zNorm' ? p.zNorm : p.deltaFreedom), 0) / n;

    let covEther = 0;
    let varEther = 0;
    let covFire = 0;
    let varFire = 0;
    let varTarget = 0;
    let sumSynergy = 0;

    for (const p of points) {
      const dE = p.ether - meanEther;
      const dF = p.fire - meanFire;
      const targetVal = metricMode === 'zNorm' ? p.zNorm : p.deltaFreedom;
      const dT = targetVal - meanTarget;

      covEther += dE * dT;
      varEther += dE * dE;
      covFire += dF * dT;
      varFire += dF * dF;
      varTarget += dT * dT;
      sumSynergy += p.ether * p.fire;
    }

    const rEther = varEther > 0 && varTarget > 0 ? covEther / Math.sqrt(varEther * varTarget) : 0;
    const rFire = varFire > 0 && varTarget > 0 ? covFire / Math.sqrt(varFire * varTarget) : 0;
    const synergy = sumSynergy / n;

    return {
      data: points,
      minZNorm: minZ,
      maxZNorm: maxZ,
      etherCorrelation: Number(rEther.toFixed(3)),
      fireCorrelation: Number(rFire.toFixed(3)),
      meanSynergy: Number(synergy.toFixed(3)),
    };
  }, [stateX, stateZ, stateZPrime, metricMode]);

  return (
    <div className="rounded border border-zinc-200 bg-white p-4 shadow-xs">
      {/* Header & Controls */}
      <div className="flex flex-col gap-2 border-b border-zinc-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-pink-50 text-pink-600">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Elemental Influence Analysis: Ether &amp; Fire vs State Displacement
            </h2>
          </div>
          <p className="mt-0.5 font-mono text-[11px] text-zinc-500">
            Scatter correlation mapping agent Ether permeability and Fire potency against final state displacement (z-norm).
          </p>
        </div>

        {/* Mode Toggle & Reference Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded border border-zinc-200 bg-zinc-50 p-0.5 font-mono text-[11px]">
            <button
              onClick={() => setMetricMode('zNorm')}
              className={`rounded px-2.5 py-1 transition-colors cursor-pointer ${
                metricMode === 'zNorm'
                  ? 'bg-white text-pink-700 font-semibold shadow-xs border border-zinc-200'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              z-Norm Displacement
            </button>
            <button
              onClick={() => setMetricMode('deltaFreedom')}
              className={`rounded px-2.5 py-1 transition-colors cursor-pointer ${
                metricMode === 'deltaFreedom'
                  ? 'bg-white text-pink-700 font-semibold shadow-xs border border-zinc-200'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Δ Freedom State
            </button>
          </div>
        </div>
      </div>

      {/* Statistics & Analytical Readouts */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 font-mono text-xs">
        <div className="rounded border border-zinc-200 bg-zinc-50/70 p-2.5">
          <div className="flex items-center gap-1 text-[11px] text-zinc-500">
            <Sparkles className="h-3 w-3 text-pink-500" />
            <span>Ether Correlation r(Ether, Δ)</span>
          </div>
          <div className="mt-1 text-sm font-bold text-pink-600">
            {etherCorrelation >= 0 ? `+${etherCorrelation}` : etherCorrelation}
          </div>
          <div className="text-[10px] text-zinc-500">
            {etherCorrelation > 0.3 ? 'Positive Field Coupling' : 'Weak Field Influence'}
          </div>
        </div>

        <div className="rounded border border-zinc-200 bg-zinc-50/70 p-2.5">
          <div className="flex items-center gap-1 text-[11px] text-zinc-500">
            <Flame className="h-3 w-3 text-rose-500" />
            <span>Fire Correlation r(Fire, Δ)</span>
          </div>
          <div className="mt-1 text-sm font-bold text-rose-600">
            {fireCorrelation >= 0 ? `+${fireCorrelation}` : fireCorrelation}
          </div>
          <div className="text-[10px] text-zinc-500">
            {fireCorrelation > 0.3 ? 'Thermal Kinetic Excitation' : 'Sub-Threshold Kinetics'}
          </div>
        </div>

        <div className="rounded border border-zinc-200 bg-zinc-50/70 p-2.5">
          <div className="flex items-center gap-1 text-[11px] text-zinc-500">
            <Zap className="h-3 w-3 text-amber-500" />
            <span>Elemental Synergy ⟨Ether · Fire⟩</span>
          </div>
          <div className="mt-1 text-sm font-bold text-zinc-900">
            {meanSynergy}
          </div>
          <div className="text-[10px] text-zinc-500">
            Coupling Product Mean
          </div>
        </div>

        <div className="rounded border border-zinc-200 bg-zinc-50/70 p-2.5">
          <div className="flex items-center gap-1 text-[11px] text-zinc-500">
            <Activity className="h-3 w-3 text-pink-600" />
            <span>Max $z$-Norm Shift</span>
          </div>
          <div className="mt-1 text-sm font-bold text-pink-700">
            {maxZNorm.toFixed(4)}
          </div>
          <div className="text-[10px] text-zinc-500">
            Peak Displacement in Ensemble
          </div>
        </div>
      </div>

      {/* Main Recharts Scatter Plot */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="relative rounded border border-zinc-200 bg-white p-2">
            <div className="mb-2 flex items-center justify-between px-2 font-mono text-[11px] text-zinc-500">
              <span className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-rose-500" /> Y: Fire Potency [0 → 1]
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-pink-500" /> X: Ether Permeability [0 → 1]
              </span>
            </div>

            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 25, left: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    dataKey="ether"
                    name="Ether Permeability"
                    domain={[0, 1]}
                    tickCount={6}
                    stroke="#94a3b8"
                    fontSize={10}
                    tickFormatter={(val: number) => val.toFixed(2)}
                    label={{
                      value: 'Ether Permeability (Field Medium Connectivity)',
                      position: 'insideBottom',
                      offset: -12,
                      fontSize: 10,
                      fill: '#64748b',
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="fire"
                    name="Fire Potency"
                    domain={[0, 1]}
                    tickCount={6}
                    stroke="#94a3b8"
                    fontSize={10}
                    tickFormatter={(val: number) => val.toFixed(2)}
                    label={{
                      value: 'Fire Potency (Kinetic Excitation)',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 8,
                      fontSize: 10,
                      fill: '#64748b',
                    }}
                  />
                  <ZAxis
                    type="number"
                    dataKey={metricMode === 'zNorm' ? 'zNorm' : 'deltaFreedom'}
                    range={[90, 420]}
                    name={metricMode === 'zNorm' ? 'z-Norm' : 'Δ Freedom'}
                  />

                  {/* Quadrant dividing crosshairs */}
                  <ReferenceLine x={0.5} stroke="#e2e8f0" strokeDasharray="4 4" />
                  <ReferenceLine y={0.5} stroke="#e2e8f0" strokeDasharray="4 4" />

                  {/* Custom Tooltip */}
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3', stroke: '#db2777', strokeWidth: 1 }}
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const pt = payload[0].payload as AgentCorrelationPoint;
                      return (
                        <div className="rounded-lg border border-pink-200 bg-white/95 p-2.5 font-mono text-[11px] text-zinc-800 shadow-md">
                          <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-1">
                            <span className="font-bold text-pink-700">{pt.id}</span>
                            <span className="text-[10px] text-zinc-500">y = {appliedY.toFixed(2)}</span>
                          </div>
                          <div className="mt-1.5 space-y-0.5">
                            <div className="flex justify-between gap-3">
                              <span className="text-zinc-500">Ether Permeability:</span>
                              <span className="font-semibold text-pink-600">{pt.ether.toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between gap-3">
                              <span className="text-zinc-500">Fire Potency:</span>
                              <span className="font-semibold text-rose-600">{pt.fire.toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between gap-3 border-t border-zinc-100 pt-1">
                              <span className="text-zinc-500">z-Norm Shift ||z - x||:</span>
                              <span className="font-bold text-zinc-900">{pt.zNorm.toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between gap-3">
                              <span className="text-zinc-500">Retained Shift ||z&apos; - x||:</span>
                              <span className="font-bold text-amber-700">{pt.zPrimeNorm.toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between gap-3">
                              <span className="text-zinc-500">Δ Freedom State:</span>
                              <span className={`font-bold ${pt.deltaFreedom >= 0 ? 'text-pink-600' : 'text-zinc-600'}`}>
                                {pt.deltaFreedom >= 0 ? `+${pt.deltaFreedom.toFixed(4)}` : pt.deltaFreedom.toFixed(4)}
                              </span>
                            </div>
                          </div>
                          <div className="mt-1.5 rounded bg-zinc-50 px-1.5 py-0.5 text-[9px] text-zinc-600 border border-zinc-100">
                            {pt.quadrant}
                          </div>
                        </div>
                      );
                    }}
                  />

                  {/* Scatter Data Points with Pink to Neutral Zinc Gradient Cells */}
                  <Scatter
                    name="Agents"
                    data={data}
                    onClick={(entry) => setSelectedAgent(entry as unknown as AgentCorrelationPoint)}
                    className="cursor-pointer"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                        className="transition-transform duration-200 hover:scale-125"
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Gradient Visual Scale Indicator */}
            <div className="mt-1 flex items-center justify-between px-3 py-1 font-mono text-[10px] text-zinc-500 border-t border-zinc-100">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-4 rounded-xs bg-[#71717a]" />
                <span>Low Displacement (Neutral Zinc ~ {minZNorm.toFixed(3)})</span>
              </div>
              <div className="h-1.5 w-32 rounded-full bg-gradient-to-r from-[#71717a] via-[#f472b6] to-[#db2777]" />
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-4 rounded-xs bg-[#db2777]" />
                <span className="text-pink-700 font-semibold">High Displacement (Radiant Pink ~ {maxZNorm.toFixed(3)})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quadrant Breakdown & Detail Inspector */}
        <div className="lg:col-span-4 space-y-3">
          {/* Selected Agent Inspector */}
          {selectedAgent ? (
            <div className="rounded border border-pink-300 bg-pink-50/40 p-3 font-mono text-xs shadow-xs">
              <div className="flex items-center justify-between border-b border-pink-200 pb-1.5">
                <span className="font-bold text-pink-900">Agent Inspector: {selectedAgent.id}</span>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-pink-700 hover:text-pink-950 font-bold cursor-pointer"
                >
                  [CLOSE]
                </button>
              </div>
              <div className="mt-2 space-y-1.5 text-zinc-700">
                <div className="flex justify-between">
                  <span>Ether Permeability:</span>
                  <span className="font-bold text-pink-700">{selectedAgent.ether.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fire Potency:</span>
                  <span className="font-bold text-rose-700">{selectedAgent.fire.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>z-Norm Displacement:</span>
                  <span className="font-bold text-zinc-900">{selectedAgent.zNorm.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Post-Removal z&apos;-Norm:</span>
                  <span className="font-bold text-amber-700">{selectedAgent.zPrimeNorm.toFixed(4)}</span>
                </div>
                <div className="flex justify-between border-t border-pink-200 pt-1">
                  <span>Final Freedom State:</span>
                  <span className="font-bold text-pink-700">{selectedAgent.freedomZ.toFixed(4)}</span>
                </div>
              </div>
              <div className="mt-2 text-[10px] text-pink-800 bg-pink-100/60 p-1.5 rounded border border-pink-200">
                {selectedAgent.quadrant}
              </div>
            </div>
          ) : (
            <div className="rounded border border-zinc-200 bg-zinc-50/60 p-3 font-mono text-xs text-zinc-500">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-700">
                <Info className="h-3.5 w-3.5 text-pink-500" />
                <span>Agent Point Inspector</span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-600">
                Click any scatter node on the correlation chart to inspect its individual Ether-Fire displacement values.
              </p>
            </div>
          )}

          {/* Elemental Quadrants Guide */}
          <div className="rounded border border-zinc-200 bg-white p-3 font-mono text-xs space-y-2">
            <div className="font-semibold text-zinc-900 uppercase text-[11px] border-b border-zinc-100 pb-1">
              Elemental Phase Quadrants
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="rounded border border-pink-100 bg-pink-50/50 p-1.5">
                <span className="font-bold text-pink-800">Q1: Transmutative Peak (High Ether / High Fire)</span>
                <p className="text-[10px] text-zinc-600 mt-0.5">
                  Maximum sympathetic response and state expansion. Fire provides ignition while Ether facilitates non-deprivation.
                </p>
              </div>

              <div className="rounded border border-zinc-100 bg-zinc-50 p-1.5">
                <span className="font-bold text-zinc-800">Q2: Kinetic Friction (Low Ether / High Fire)</span>
                <p className="text-[10px] text-zinc-600 mt-0.5">
                  High drive with restricted permeability. Susceptible to competitive suppression and capture backlash.
                </p>
              </div>

              <div className="rounded border border-zinc-100 bg-zinc-50 p-1.5">
                <span className="font-bold text-zinc-800">Q3: Permeable Latency (High Ether / Low Fire)</span>
                <p className="text-[10px] text-zinc-600 mt-0.5">
                  Open continuum with low internal drive. Relies heavily on external test influence y to initiate motion.
                </p>
              </div>

              <div className="rounded border border-zinc-100 bg-zinc-50 p-1.5">
                <span className="font-bold text-zinc-800">Q4: Inertia (Low Ether / Low Fire)</span>
                <p className="text-[10px] text-zinc-600 mt-0.5">
                  Baseline entrapment. Minimal displacement regardless of test influence dosage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
