/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MultiDoseResult } from '../types/experiment';
import { Flame, Sparkles } from 'lucide-react';

interface MultiDoseTableProps {
  results: MultiDoseResult[];
  activeDose: number;
  onSelectDose: (dose: number) => void;
}

export const MultiDoseTable: React.FC<MultiDoseTableProps> = ({
  results,
  activeDose,
  onSelectDose,
}) => {
  const sorted = [...results].sort((a, b) => a.y_value - b.y_value);
  let thresholdDose: number | null = null;
  let saturationDose: number | null = null;

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const slope = (curr.z_mean_freedom - prev.z_mean_freedom) / (curr.y_value - prev.y_value || 1);
    if (slope > 0.35 && thresholdDose === null) {
      thresholdDose = curr.y_value;
    }
    if (i > 2 && slope < 0.08 && saturationDose === null) {
      saturationDose = curr.y_value;
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded border border-zinc-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-1 border-b border-zinc-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-pink-600" />
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-900">
                Multi-Dose Sweep Matrix (y = 0.0 → 1.0)
              </h2>
            </div>
            <p className="font-mono text-[11px] text-zinc-500 mt-0.5">
              Comparative parameter response across 6 influence strengths. Identifies thermal thresholds, saturation, hysteresis &amp; bifurcations.
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-pink-700 font-medium">
            <span>Thermal Threshold: {thresholdDose !== null ? `y ~ ${thresholdDose}` : 'N/A'}</span>
            <span aria-hidden="true" className="text-zinc-300">·</span>
            <span>Saturation: {saturationDose !== null ? `y ~ ${saturationDose}` : 'N/A'}</span>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-zinc-600">
                <th className="py-2.5 px-3">Dose y</th>
                <th className="py-2.5 px-3">Outcome z (Freedom)</th>
                <th className="py-2.5 px-3">Outcome z (Vice)</th>
                <th className="py-2.5 px-3">Accessible States</th>
                <th className="py-2.5 px-3">Removed z&apos; (Freedom)</th>
                <th className="py-2.5 px-3">Removed z&apos; (Vice)</th>
                <th className="py-2.5 px-3">||z - x||</th>
                <th className="py-2.5 px-3">||z&apos; - z||</th>
                <th className="py-2.5 px-3">Hysteresis</th>
                <th className="py-2.5 px-3">Persistence Classification</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-800">
              {results.map((r) => {
                const isSelected = Math.abs(r.y_value - activeDose) < 0.01;
                return (
                  <tr
                    key={r.y_value}
                    className={`transition-colors hover:bg-zinc-50 ${
                      isSelected ? 'bg-pink-50/70 border-l-2 border-pink-600' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-zinc-900">
                      y = {r.y_value.toFixed(2)}
                      {r.y_value === 0 && <span className="ml-1 text-[10px] text-zinc-500 font-normal">(Control)</span>}
                    </td>
                    <td className="py-2.5 px-3 text-pink-700 font-semibold">{r.z_mean_freedom.toFixed(4)}</td>
                    <td className="py-2.5 px-3 text-rose-700">{r.z_mean_vice.toFixed(4)}</td>
                    <td className="py-2.5 px-3 text-purple-700">{r.z_accessible_states}</td>
                    <td className="py-2.5 px-3 text-amber-700 font-medium">{r.z_prime_mean_freedom.toFixed(4)}</td>
                    <td className="py-2.5 px-3 text-zinc-600">{r.z_prime_mean_vice.toFixed(4)}</td>
                    <td className="py-2.5 px-3 text-zinc-600">{r.delta_x_z.toFixed(4)}</td>
                    <td className="py-2.5 px-3 text-zinc-600">{r.delta_z_zprime.toFixed(4)}</td>
                    <td className="py-2.5 px-3 text-purple-700">{r.hysteresis_index.toFixed(4)}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-semibold ${
                          r.classification === 'SELF-SUSTAINING CANDIDATE'
                            ? 'text-pink-700 font-bold'
                            : r.classification === 'ADAPTED'
                            ? 'text-amber-700'
                            : 'text-zinc-600'
                        }`}
                      >
                        {r.classification}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onSelectDose(r.y_value)}
                        className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-pink-600 text-white shadow-xs'
                            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200'
                        }`}
                      >
                        {isSelected ? 'ACTIVE' : 'TEST DOSE'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Non-linear phenomena notes with Ether & Fire Context */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded border border-zinc-200 bg-white p-3 shadow-xs">
          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-zinc-900 uppercase">
            <Flame className="h-3.5 w-3.5 text-rose-500" />
            <span>Thermal Activation Threshold</span>
          </div>
          <p className="mt-1 font-mono text-[11px] text-zinc-600">
            {thresholdDose !== null
              ? `Thermal transmutation threshold at y >= ${thresholdDose}. Fire kinetic excitation overcomes baseline vice suppression.`
              : 'Continuous linear excitation; no sudden ignition threshold.'}
          </p>
        </div>

        <div className="rounded border border-zinc-200 bg-white p-3 shadow-xs">
          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-zinc-900 uppercase">
            <Sparkles className="h-3.5 w-3.5 text-pink-500" />
            <span>Etheric Saturation Boundary</span>
          </div>
          <p className="mt-1 font-mono text-[11px] text-zinc-600">
            {saturationDose !== null
              ? `Field conductivity plateaus beyond y = ${saturationDose}. Higher dosage does not generate proportional accessible states.`
              : 'Field capacity remains unsaturated within y in [0.0, 1.0] domain.'}
          </p>
        </div>

        <div className="rounded border border-zinc-200 bg-white p-3 shadow-xs">
          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-zinc-900 uppercase">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            <span>Hysteresis &amp; Cooling Drift</span>
          </div>
          <p className="mt-1 font-mono text-[11px] text-zinc-600">
            Path asymmetry between fire application (x → z) and thermal release (z → z&apos;). Non-zero hysteresis measures irreversible state displacement.
          </p>
        </div>
      </div>
    </div>
  );
};
