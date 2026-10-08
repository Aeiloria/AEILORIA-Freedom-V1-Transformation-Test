/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PersistenceClassification, SystemAggregateState } from '../types/experiment';
import { Sparkles, Flame } from 'lucide-react';

interface PersistenceClassificationCardProps {
  classification: PersistenceClassification;
  justification: string;
  distZPrimeToX: number;
  distZPrimeToZ: number;
  distZToControl: number;
  stateX: SystemAggregateState;
  stateZ: SystemAggregateState;
  stateZPrime: SystemAggregateState;
  appliedY: number;
}

export const PersistenceClassificationCard: React.FC<PersistenceClassificationCardProps> = ({
  classification,
  justification,
  distZPrimeToX,
  distZPrimeToZ,
  distZToControl,
  stateX,
  stateZ,
  stateZPrime,
  appliedY,
}) => {
  const getBadgeStyle = () => {
    switch (classification) {
      case 'SELF-SUSTAINING CANDIDATE':
        return 'border-pink-300 bg-pink-50 text-pink-900 shadow-xs ring-1 ring-pink-200';
      case 'ADAPTED':
        return 'border-amber-300 bg-amber-50 text-amber-800 shadow-xs';
      case 'EXTERNALLY DEPENDENT':
      default:
        return 'border-zinc-300 bg-zinc-100 text-zinc-800 shadow-xs';
    }
  };

  const deltaFreedomXZ = (stateZ.mean_freedom_state - stateX.mean_freedom_state).toFixed(4);
  const deltaFreedomZZPrime = (stateZPrime.mean_freedom_state - stateZ.mean_freedom_state).toFixed(4);
  const deltaFreedomXZPrime = (stateZPrime.mean_freedom_state - stateX.mean_freedom_state).toFixed(4);

  return (
    <div className="rounded border border-zinc-200 bg-white p-4 shadow-xs">
      <div className="flex flex-col gap-2 border-b border-zinc-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-pink-600" />
            <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Stage D Persistence Classification &amp; Retention Metric
            </h2>
          </div>
          <p className="font-mono text-[11px] text-zinc-500 mt-0.5">
            Evaluation of z&apos; = F(z, 0) upon complete removal of test influence y = {appliedY.toFixed(2)}.
          </p>
        </div>

        <div className={`rounded border px-3 py-1 font-mono text-xs font-bold tracking-wide uppercase ${getBadgeStyle()}`}>
          {classification}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Metric Distances */}
        <div className="rounded border border-zinc-200 bg-zinc-50/70 p-3 font-mono text-xs space-y-2">
          <div className="text-zinc-500 font-semibold uppercase text-[11px]">State Space Displacement</div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">||z&apos; - x|| (Reversion to seed):</span>
            <span className="font-bold text-zinc-900">{distZPrimeToX.toFixed(4)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">||z&apos; - z|| (Relaxation drift):</span>
            <span className="font-bold text-amber-700">{distZPrimeToZ.toFixed(4)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-zinc-200 pt-1">
            <span className="text-zinc-600">||z - z_control|| (V1 vs Control):</span>
            <span className="font-bold text-pink-700">{distZToControl.toFixed(4)}</span>
          </div>
        </div>

        {/* Transition Shifts */}
        <div className="rounded border border-zinc-200 bg-zinc-50/70 p-3 font-mono text-xs space-y-2">
          <div className="text-zinc-500 font-semibold uppercase text-[11px]">Freedom State Dynamics</div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">Δ(x → z) during V1 application:</span>
            <span className="font-bold text-pink-600">{Number(deltaFreedomXZ) >= 0 ? `+${deltaFreedomXZ}` : deltaFreedomXZ}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">Δ(z → z&apos;) post-removal decay:</span>
            <span className="font-bold text-zinc-700">{deltaFreedomZZPrime}</span>
          </div>
          <div className="flex items-center justify-between border-t border-zinc-200 pt-1">
            <span className="text-zinc-600">Net Retained Shift Δ(x → z&apos;):</span>
            <span className="font-bold text-pink-700">{Number(deltaFreedomXZPrime) >= 0 ? `+${deltaFreedomXZPrime}` : deltaFreedomXZPrime}</span>
          </div>
        </div>

        {/* Elemental Field Balance */}
        <div className="rounded border border-pink-200 bg-pink-50/40 p-3 font-mono text-xs space-y-2">
          <div className="text-pink-800 font-semibold uppercase text-[11px] flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-pink-600" />
            <span>Elemental Field Balance</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">Ether Permeability (z&apos;):</span>
            <span className="font-bold text-pink-700">{stateZPrime.mean_ether_permeability.toFixed(3)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">Fire Potency (z&apos;):</span>
            <span className="font-bold text-rose-700">{stateZPrime.mean_fire_potency.toFixed(3)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-pink-200 pt-1">
            <span className="text-zinc-600">Accessible States Retained:</span>
            <span className="font-bold text-zinc-900">{stateZPrime.total_accessible_states}</span>
          </div>
        </div>

        {/* Protocol Discipline Rule */}
        <div className="rounded border border-zinc-200 bg-zinc-50/70 p-3 font-mono text-xs space-y-1.5">
          <div className="text-zinc-500 font-semibold uppercase text-[11px]">Protocol Discipline Rule</div>
          <p className="text-[11px] leading-relaxed text-zinc-700">
            {justification}
          </p>
          <div className="text-[10px] text-zinc-500 italic">
            Note: &ldquo;Self-sustaining&rdquo; is an empirical persistence classification, not an inherently desirable outcome.
          </div>
        </div>
      </div>
    </div>
  );
};
