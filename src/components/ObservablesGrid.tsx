/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { V1Observables } from '../types/experiment';
import { Flame, Sparkles } from 'lucide-react';

interface ObservablesGridProps {
  observables: V1Observables;
  appliedY: number;
}

export const ObservablesGrid: React.FC<ObservablesGridProps> = ({
  observables,
  appliedY,
}) => {
  const items = [
    {
      code: 'B_GAIN',
      name: "B State Gain",
      element: "FIRE",
      elementDesc: "Kinetic Ignition",
      query: "Did B undergo a positive state transition?",
      value: `${(observables.b_gain_ratio * 100).toFixed(1)}%`,
      ratio: observables.b_gain_ratio,
      desc: "Frequency of autonomous or influenced upward state transitions by observed agent B.",
    },
    {
      code: 'A_RESPONSE',
      name: "A Sympathetic Response",
      element: "ETHER",
      elementDesc: "Resonance Field",
      query: "Did A undergo a positive state transition following B's gain?",
      value: `${(observables.a_response_ratio * 100).toFixed(1)}%`,
      ratio: observables.a_response_ratio,
      desc: "Frequency of observer A experiencing concurrent positive transition upon B's gain.",
    },
    {
      code: 'NON_DEPRIVATION',
      name: "Non-Deprivation",
      element: "ETHER",
      elementDesc: "Open Continuum",
      query: "Did B's gain occur without requiring equivalent loss by A?",
      value: `${(observables.non_deprivation_ratio * 100).toFixed(1)}%`,
      ratio: observables.non_deprivation_ratio,
      desc: "Zero-sum avoidance: interactions where peer advance incurred zero reciprocal penalty on A.",
    },
    {
      code: 'NON_SUPPRESSION',
      name: "Non-Suppression",
      element: "FIRE",
      elementDesc: "Unquenched Drive",
      query: "Did A refrain from reducing or reversing B's gain?",
      value: `${(observables.non_suppression_ratio * 100).toFixed(1)}%`,
      ratio: observables.non_suppression_ratio,
      desc: "Absence of active suppression or competitive dampening directed at B's gain.",
    },
    {
      code: 'NON_CAPTURE',
      name: "Non-Capture",
      element: "ETHER",
      elementDesc: "Boundary Freedom",
      query: "Did A refrain from converting B's gain into exclusive control by A?",
      value: `${(observables.non_capture_ratio * 100).toFixed(1)}%`,
      ratio: observables.non_capture_ratio,
      desc: "Interactions where A did not appropriate or monopolize B's state expansion.",
    },
    {
      code: 'DISTINCTNESS',
      name: "Entity Distinctness",
      element: "ETHER",
      elementDesc: "Non-Local Separation",
      query: "Did A and B remain distinguishable entities?",
      value: `${(observables.distinctness_ratio * 100).toFixed(1)}%`,
      ratio: observables.distinctness_ratio,
      desc: "Separation check: state distance maintained above collapse boundary throughout interaction.",
    },
    {
      code: 'PERSISTENCE',
      name: "Local Response Retention",
      element: "FIRE",
      elementDesc: "Thermal Stability",
      query: "Did A's positive response persist beyond immediate transition noise?",
      value: `${(observables.persistence_ratio * 100).toFixed(1)}%`,
      ratio: observables.persistence_ratio,
      desc: "Stability check: state shift retained through subsequent transition step window.",
    },
    {
      code: 'FORCE_DEPENDENCE',
      name: "Forcing Dependence Index",
      element: "FIRE",
      elementDesc: "External Heat",
      query: "How much external forcing was required to produce or maintain the interaction?",
      value: `${(observables.force_dependence_index * 100).toFixed(1)}%`,
      ratio: observables.force_dependence_index,
      desc: "Ratio of interaction dynamics driven by external perturbation vs autonomous coupling.",
    },
    {
      code: 'RECURRENCE',
      name: "Interaction Recurrence",
      element: "ETHER",
      elementDesc: "Harmonic Cycle",
      query: "Did comparable interactions reappear under similar conditions?",
      value: `${observables.recurrence_count} events`,
      ratio: Math.min(1, observables.recurrence_count / Math.max(1, observables.total_interactions * 0.4)),
      desc: "Repeated occurrences of structurally matched interaction sequences in the observation window.",
    },
  ];

  return (
    <div className="rounded border border-zinc-200 bg-white p-4 shadow-xs">
      <div className="flex flex-col gap-1 border-b border-zinc-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-pink-600" />
            <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Stage B Constituent Observables (Ether &amp; Fire Transmutation)
            </h2>
          </div>
          <p className="font-mono text-[11px] text-zinc-500 mt-0.5">
            Decomposed parameters across {observables.total_interactions} candidate interactions under y = {appliedY.toFixed(2)}. Uncollapsed.
          </p>
        </div>
        <div className="font-mono text-[11px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
          NEVER COLLAPSED PREMATURELY INTO A SINGLE SCORE
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.code}
            className="flex flex-col justify-between rounded border border-zinc-200 bg-zinc-50/70 p-3 transition-colors hover:border-pink-300 hover:bg-white shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-zinc-900">{item.code}</span>
                <span className="font-bold text-pink-700">{item.value}</span>
              </div>
              <div className="mt-1 flex items-center justify-between font-mono text-[11px]">
                <span className="text-zinc-700 font-medium">{item.name}</span>
                <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${
                  item.element === 'FIRE' ? 'text-rose-600' : 'text-pink-600'
                }`}>
                  {item.element === 'FIRE' ? <Flame className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                  <span>{item.elementDesc}</span>
                </span>
              </div>
              <div className="mt-1.5 font-sans text-xs italic text-zinc-500">
                &ldquo;{item.query}&rdquo;
              </div>
            </div>

            <div className="mt-3">
              {/* Ratio bar in Pink */}
              <div className="h-1.5 w-full overflow-hidden rounded-none bg-zinc-200">
                <div
                  className="h-full bg-pink-600 transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, item.ratio * 100))}%` }}
                />
              </div>
              <div className="mt-1.5 font-mono text-[10px] text-zinc-500">
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
