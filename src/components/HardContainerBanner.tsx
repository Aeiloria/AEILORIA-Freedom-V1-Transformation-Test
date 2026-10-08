/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, Flame, Sparkles } from 'lucide-react';

export const HardContainerBanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-zinc-200 bg-zinc-50/90 px-6 py-2.5 font-mono text-xs text-zinc-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-pink-600" />
          <span className="font-semibold text-zinc-900 uppercase">
            Elemental Framework Active:
          </span>
          <span className="flex items-center gap-1.5 text-zinc-600">
            <span className="inline-flex items-center gap-1 text-pink-700 font-medium">
              <Sparkles className="h-3 w-3 text-pink-500" /> Ether (Field Permeability)
            </span>
            <span className="text-zinc-400">&amp;</span>
            <span className="inline-flex items-center gap-1 text-rose-700 font-medium">
              <Flame className="h-3 w-3 text-rose-500" /> Fire (Kinetic Drive &amp; Transmutation)
            </span>
            <span className="hidden sm:inline text-zinc-500">integrated with Freedom V1 transformation engine.</span>
          </span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[11px] font-medium text-pink-700 hover:text-pink-900 cursor-pointer"
        >
          <span>{expanded ? 'HIDE ELEMENTAL FRAMEWORK' : 'VIEW ELEMENTAL PROPERTIES'}</span>
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 grid grid-cols-1 gap-3 border-t border-zinc-200 pt-3 md:grid-cols-2">
          <div className="rounded border border-pink-200 bg-pink-50/80 p-2.5">
            <div className="flex items-center gap-1.5 font-bold text-pink-800 uppercase text-[11px]">
              <Sparkles className="h-3.5 w-3.5 text-pink-600" />
              <span>Ether (Spatial Conductivity &amp; Field Permeability):</span>
            </div>
            <div className="mt-1 text-[11px] leading-relaxed text-pink-950">
              The unbounded subtle medium. Enhances non-local coupling between agents, reduces claustrophobic vice capture tendency, and provides the open continuum through which non-depriving sympathetic state shifts propagate.
            </div>
          </div>

          <div className="rounded border border-rose-200 bg-rose-50/80 p-2.5">
            <div className="flex items-center gap-1.5 font-bold text-rose-800 uppercase text-[11px]">
              <Flame className="h-3.5 w-3.5 text-rose-600" />
              <span>Fire (Kinetic Excitation &amp; Thermal Ignition):</span>
            </div>
            <div className="mt-1 text-[11px] leading-relaxed text-rose-950">
              The catalytic excitation force. Fuels autonomous transition attempts, determines system ignition temperature, and drives the transmutation energy required to overcome inertia and establish new metastable state attractors.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
