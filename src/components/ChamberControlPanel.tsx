/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SimulationConfig } from '../engine/simulation';
import { Flame, Sparkles } from 'lucide-react';

interface ChamberControlPanelProps {
  config: SimulationConfig;
  onChangeConfig: (newConfig: Partial<SimulationConfig>) => void;
  onExecute: () => void;
  isExecuting?: boolean;
}

export const ChamberControlPanel: React.FC<ChamberControlPanelProps> = ({
  config,
  onChangeConfig,
  onExecute,
}) => {
  const dosePresets = [0, 0.1, 0.25, 0.5, 0.75, 1.0];

  return (
    <div className="rounded border border-zinc-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-pink-100 text-pink-600">
            <Sparkles className="h-3 w-3" />
          </span>
          <div className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-900">
            Chamber Parameters, Influence y &amp; Elemental Properties
          </div>
        </div>
        <div className="font-mono text-[11px] text-zinc-500">
          z = F(x, y) Test Apparatus
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Applied y (V1 Compersion test influence) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between font-mono text-xs">
            <label className="text-zinc-800 font-bold">Applied Influence y</label>
            <span className="font-semibold text-pink-600 font-mono">{config.appliedY.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={config.appliedY}
            onChange={(e) => onChangeConfig({ appliedY: parseFloat(e.target.value) })}
            className="w-full accent-pink-600 cursor-pointer"
          />
          {/* Quick Presets */}
          <div className="flex items-center gap-1">
            {dosePresets.map((d) => (
              <button
                key={d}
                onClick={() => onChangeConfig({ appliedY: d })}
                className={`flex-1 rounded py-0.5 font-mono text-[10px] transition-colors cursor-pointer ${
                  Math.abs(config.appliedY - d) < 0.01
                    ? 'bg-pink-600 text-white font-bold border border-pink-700 shadow-xs'
                    : 'bg-zinc-100 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-200 border border-zinc-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Ether Coupling */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between font-mono text-xs">
            <label className="flex items-center gap-1 text-zinc-800 font-medium">
              <Sparkles className="h-3 w-3 text-pink-500" />
              <span>Ether Coupling</span>
            </label>
            <span className="font-mono text-pink-600 font-semibold">{config.etherCoupling.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={config.etherCoupling}
            onChange={(e) => onChangeConfig({ etherCoupling: parseFloat(e.target.value) })}
            className="w-full accent-pink-500 cursor-pointer"
          />
          <div className="font-mono text-[10px] text-zinc-500">
            Medium Permeability: {config.etherCoupling > 0.6 ? 'High Conductivity' : 'Standard Field'}
          </div>
        </div>

        {/* Fire Excitation */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between font-mono text-xs">
            <label className="flex items-center gap-1 text-zinc-800 font-medium">
              <Flame className="h-3 w-3 text-rose-500" />
              <span>Fire Excitation</span>
            </label>
            <span className="font-mono text-rose-600 font-semibold">{config.fireExcitation.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={config.fireExcitation}
            onChange={(e) => onChangeConfig({ fireExcitation: parseFloat(e.target.value) })}
            className="w-full accent-rose-500 cursor-pointer"
          />
          <div className="font-mono text-[10px] text-zinc-500">
            Thermal Kinetic Drive: {config.fireExcitation > 0.6 ? 'Active Transmutation' : 'Sub-Ignition'}
          </div>
        </div>

        {/* External Forcing & Seed */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between font-mono text-xs">
            <label className="text-zinc-800 font-medium">External Forcing</label>
            <span className="font-mono text-zinc-600">{config.externalForcing.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={config.externalForcing}
            onChange={(e) => onChangeConfig({ externalForcing: parseFloat(e.target.value) })}
            className="w-full accent-zinc-600 cursor-pointer"
          />
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>Seed: {config.seed}</span>
            <button
              onClick={() => onChangeConfig({ seed: Math.floor(Math.random() * 90000) + 1000 })}
              className="text-pink-600 hover:text-pink-800 font-semibold cursor-pointer"
            >
              🎲 Randomize
            </button>
          </div>
        </div>

        {/* Action Button & Baseline Bias */}
        <div className="space-y-1.5 flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
            <div>
              <span className="text-zinc-500">Freedom: {config.initialFreedomMean.toFixed(2)}</span>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={config.initialFreedomMean}
                onChange={(e) => onChangeConfig({ initialFreedomMean: parseFloat(e.target.value) })}
                className="w-full accent-pink-600 cursor-pointer"
              />
            </div>
            <div>
              <span className="text-zinc-500">Vice: {config.initialViceMean.toFixed(2)}</span>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={config.initialViceMean}
                onChange={(e) => onChangeConfig({ initialViceMean: parseFloat(e.target.value) })}
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={onExecute}
            className="w-full rounded border border-pink-600 bg-pink-600 py-2 font-mono text-xs font-semibold text-white transition-colors hover:bg-pink-700 shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Flame className="h-3.5 w-3.5" />
            <span>RUN TRANSFORMATION TEST</span>
          </button>
        </div>
      </div>
    </div>
  );
};
