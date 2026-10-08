/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InteractionRecord } from '../types/experiment';
import { Search, AlertTriangle, CheckCircle2, Flame, Sparkles } from 'lucide-react';

interface InteractionLogProps {
  interactions: InteractionRecord[];
}

export const InteractionLog: React.FC<InteractionLogProps> = ({ interactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGainOnly, setFilterGainOnly] = useState(false);
  const [filterResponseOnly, setFilterResponseOnly] = useState(false);
  const [filterAnomalyOnly, setFilterAnomalyOnly] = useState(false);
  const [selectedInteraction, setSelectedInteraction] = useState<InteractionRecord | null>(null);

  const checkIsAnomaly = (rec: InteractionRecord): boolean => {
    return Boolean(
      rec.is_anomaly ||
      !rec.distinctness ||
      (rec.b_gain && !rec.non_deprivation && !rec.non_capture) ||
      (rec.b_gain && rec.a_response && !rec.non_deprivation)
    );
  };

  const anomalyCount = interactions.filter(checkIsAnomaly).length;

  const filtered = interactions.filter((rec) => {
    const isAnomaly = checkIsAnomaly(rec);
    if (filterAnomalyOnly && !isAnomaly) return false;
    if (filterGainOnly && !rec.b_gain) return false;
    if (filterResponseOnly && !rec.a_response) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      rec.interaction_id.toLowerCase().includes(term) ||
      rec.agent_a_id.toLowerCase().includes(term) ||
      rec.agent_b_id.toLowerCase().includes(term) ||
      rec.raw_observations.toLowerCase().includes(term) ||
      (rec.anomaly_reason && rec.anomaly_reason.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-4">
      <div className="rounded border border-zinc-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 border-b border-zinc-200 pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-pink-600" />
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-900">
                Interaction Event Log (Stage B Pair Interactions &amp; Elemental Resonance)
              </h2>
              {anomalyCount > 0 ? (
                <span className="flex items-center gap-1 rounded border border-red-200 bg-red-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-red-700">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{anomalyCount} ANOMALIES FLAGGED</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded border border-pink-200 bg-pink-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-pink-700">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>0 ANOMALIES</span>
                </span>
              )}
            </div>
            <p className="font-mono text-[11px] text-zinc-500 mt-0.5">
              Constituent pairwise records capturing B gain, A response, non-deprivation, non-suppression &amp; non-capture. Anomalies highlighted in red tint.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Filter by agent / ID / reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 rounded border border-zinc-300 bg-white py-1 pl-8 pr-2 font-mono text-xs text-zinc-900 placeholder-zinc-400 focus:border-pink-500 focus:outline-none"
              />
            </div>

            {/* Dedicated Anomaly Toggle Switch */}
            <div
              onClick={() => setFilterAnomalyOnly(!filterAnomalyOnly)}
              className={`flex items-center gap-2.5 rounded border px-2.5 py-1 font-mono text-xs cursor-pointer select-none transition-all ${
                filterAnomalyOnly
                  ? 'border-red-400 bg-red-50 text-red-900 shadow-xs ring-1 ring-red-400'
                  : 'border-zinc-300 bg-zinc-50 hover:bg-zinc-100 text-zinc-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                <AlertTriangle className={`h-3.5 w-3.5 ${filterAnomalyOnly ? 'text-red-600' : 'text-zinc-500'}`} />
                <span>Anomalies Only</span>
                <span className={`px-1 py-0.2 rounded text-[10px] font-bold ${
                  filterAnomalyOnly ? 'bg-red-200 text-red-900' : 'bg-zinc-200 text-zinc-700'
                }`}>
                  {anomalyCount}
                </span>
              </div>

              {/* Physical Switch UI */}
              <div
                role="switch"
                aria-checked={filterAnomalyOnly}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setFilterAnomalyOnly(!filterAnomalyOnly);
                  }
                }}
                className={`relative inline-flex h-4.5 w-8 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-red-500 ${
                  filterAnomalyOnly ? 'bg-red-600' : 'bg-zinc-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                    filterAnomalyOnly ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </div>
            </div>

            {/* Secondary filter buttons */}
            <button
              onClick={() => setFilterGainOnly(!filterGainOnly)}
              className={`rounded px-2.5 py-1 font-mono text-xs transition-colors cursor-pointer ${
                filterGainOnly
                  ? 'border border-pink-600 bg-pink-50 text-pink-800 font-semibold'
                  : 'border border-zinc-300 bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              B Gain Only
            </button>

            <button
              onClick={() => setFilterResponseOnly(!filterResponseOnly)}
              className={`rounded px-2.5 py-1 font-mono text-xs transition-colors cursor-pointer ${
                filterResponseOnly
                  ? 'border border-pink-600 bg-pink-50 text-pink-800 font-semibold'
                  : 'border border-zinc-300 bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              A Response Only
            </button>
          </div>
        </div>

        {/* Anomaly Debugging Status Banner */}
        {filterAnomalyOnly && (
          <div className="mt-3 flex items-center justify-between rounded border border-red-200 bg-red-50/80 px-3 py-2 font-mono text-xs text-red-900">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
              <span className="font-bold">ANOMALY DEBUGGING FILTER ACTIVE:</span>
              <span className="text-red-800">
                Displaying {filtered.length} flagged record{filtered.length === 1 ? '' : 's'} with state divergences out of {interactions.length} candidate interactions.
              </span>
            </div>
            <button
              onClick={() => setFilterAnomalyOnly(false)}
              className="font-bold underline hover:text-red-950 cursor-pointer text-[11px]"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* Table View */}
        <div className="mt-3 max-h-[520px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-12 text-center font-mono text-xs text-zinc-500">
              No interaction records match the active criteria.
            </div>
          ) : (
            <table className="w-full border-collapse font-mono text-xs">
              <thead className="sticky top-0 bg-zinc-50 text-left text-zinc-600 z-10 shadow-xs">
                <tr className="border-b border-zinc-200">
                  <th className="py-2 px-2.5">ID</th>
                  <th className="py-2 px-2.5">Step</th>
                  <th className="py-2 px-2.5">Observer A</th>
                  <th className="py-2 px-2.5">Agent B</th>
                  <th className="py-2 px-2.5">B Gain?</th>
                  <th className="py-2 px-2.5">A Resp?</th>
                  <th className="py-2 px-2.5">Non-Depriv?</th>
                  <th className="py-2 px-2.5">Non-Suppr?</th>
                  <th className="py-2 px-2.5">Non-Capt?</th>
                  <th className="py-2 px-2.5">Distinct?</th>
                  <th className="py-2 px-2.5">Elemental State</th>
                  <th className="py-2 px-2.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-800">
                {filtered.slice(0, 100).map((r) => {
                  const isAnomaly = checkIsAnomaly(r);
                  return (
                    <tr
                      key={r.interaction_id}
                      className={`transition-colors cursor-pointer ${
                        isAnomaly
                          ? 'bg-red-50/75 hover:bg-red-100/70 border-l-2 border-red-500'
                          : 'hover:bg-zinc-50'
                      }`}
                      onClick={() => setSelectedInteraction(r)}
                    >
                      <td className="py-1.5 px-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-zinc-700 font-semibold">{r.interaction_id}</span>
                          {isAnomaly && (
                            <span
                              className="rounded border border-red-300 bg-red-100 px-1 py-0.2 text-[9px] font-bold text-red-700"
                              title={r.anomaly_reason || 'Anomaly flagged: unusual state interaction divergence'}
                            >
                              ANOMALY
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-1.5 px-2.5 text-zinc-500">t={r.timestep}</td>
                      <td className="py-1.5 px-2.5 text-zinc-900">{r.agent_a_id}</td>
                      <td className="py-1.5 px-2.5 text-zinc-900">{r.agent_b_id}</td>
                      <td className="py-1.5 px-2.5">
                        <span className={r.b_gain ? 'text-pink-700 font-medium' : 'text-zinc-400'}>
                          {r.b_gain ? 'TRUE' : 'FALSE'}
                        </span>
                      </td>
                      <td className="py-1.5 px-2.5">
                        <span className={r.a_response ? 'text-pink-700 font-bold' : 'text-zinc-400'}>
                          {r.a_response ? 'TRUE' : 'FALSE'}
                        </span>
                      </td>
                      <td className="py-1.5 px-2.5">
                        <span className={r.non_deprivation ? 'text-pink-700' : 'text-rose-600 font-semibold'}>
                          {r.non_deprivation ? 'TRUE' : 'FALSE'}
                        </span>
                      </td>
                      <td className="py-1.5 px-2.5">
                        <span className={r.non_suppression ? 'text-pink-700' : 'text-rose-600 font-semibold'}>
                          {r.non_suppression ? 'TRUE' : 'FALSE'}
                        </span>
                      </td>
                      <td className="py-1.5 px-2.5">
                        <span className={r.non_capture ? 'text-pink-700' : 'text-rose-600 font-semibold'}>
                          {r.non_capture ? 'TRUE' : 'FALSE'}
                        </span>
                      </td>
                      <td className="py-1.5 px-2.5">
                        <span className={r.distinctness ? 'text-purple-700' : 'text-rose-600 font-semibold'}>
                          {r.distinctness ? 'TRUE' : 'FALSE'}
                        </span>
                      </td>
                      <td className="py-1.5 px-2.5 text-zinc-600">
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="flex items-center gap-0.5 text-rose-600" title="Flame Intensity">
                            <Flame className="h-3 w-3" /> {r.elemental_flame_intensity?.toFixed(2) ?? '—'}
                          </span>
                          <span className="flex items-center gap-0.5 text-pink-600" title="Ether Resonance">
                            <Sparkles className="h-3 w-3" /> {r.elemental_ether_resonance?.toFixed(2) ?? '—'}
                          </span>
                        </div>
                      </td>
                      <td className="py-1.5 px-2.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInteraction(r);
                          }}
                          className={`rounded px-2 py-0.5 text-[10px] transition-colors cursor-pointer ${
                            isAnomaly
                              ? 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-300 font-semibold'
                              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200'
                          }`}
                        >
                          VIEW
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Selected Interaction Deep Inspector */}
      {selectedInteraction && (
        <div className={`rounded border p-4 font-mono text-xs shadow-md ${
          checkIsAnomaly(selectedInteraction)
            ? 'border-red-300 bg-red-50/40'
            : 'border-zinc-300 bg-white'
        }`}>
          <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-900">
                Interaction Record: {selectedInteraction.interaction_id} (Timestep {selectedInteraction.timestep})
              </span>
              {checkIsAnomaly(selectedInteraction) && (
                <span className="rounded border border-red-300 bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-800">
                  FLAGGED ANOMALY
                </span>
              )}
            </div>
            <button
              onClick={() => setSelectedInteraction(null)}
              className="text-zinc-500 hover:text-zinc-900 cursor-pointer font-bold"
            >
              [CLOSE]
            </button>
          </div>

          {/* Anomaly Diagnosis Alert */}
          {checkIsAnomaly(selectedInteraction) && (
            <div className="mt-3 flex items-start gap-2 rounded border border-red-200 bg-red-50 p-2.5 text-red-900">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <div>
                <div className="font-bold text-red-800">Anomaly Diagnostic:</div>
                <div className="mt-0.5 text-[11px] leading-relaxed text-red-950">
                  {selectedInteraction.anomaly_reason ||
                    (!selectedInteraction.distinctness
                      ? 'DISTINCTNESS_COLLAPSE: Observer A and Agent B breached minimum state distance separation.'
                      : (!selectedInteraction.non_deprivation && !selectedInteraction.non_capture)
                      ? 'CAPTURE_DEPRIVATION: B gain was converted into predatory monopolization by A with reciprocal deprivation.'
                      : 'STATE_DIVERGENCE: Pairwise interaction trajectory violated nominal equilibrium bounds.')}
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded border border-zinc-200 bg-white p-3">
              <div className="font-semibold text-zinc-900">Observer A: {selectedInteraction.agent_a_id}</div>
              <div className="mt-1 text-zinc-600">
                Before: Freedom = {selectedInteraction.a_state_before.freedom_state.toFixed(4)}, Vice = {selectedInteraction.a_state_before.freedoms_vice.toFixed(4)}
              </div>
              <div className="text-pink-700 font-medium">
                After: Freedom = {selectedInteraction.a_state_after.freedom_state.toFixed(4)}, Vice = {selectedInteraction.a_state_after.freedoms_vice.toFixed(4)}
              </div>
            </div>

            <div className="rounded border border-zinc-200 bg-white p-3">
              <div className="font-semibold text-zinc-900">Agent B: {selectedInteraction.agent_b_id}</div>
              <div className="mt-1 text-zinc-600">
                Before: Freedom = {selectedInteraction.b_state_before.freedom_state.toFixed(4)}, Vice = {selectedInteraction.b_state_before.freedoms_vice.toFixed(4)}
              </div>
              <div className="text-pink-700 font-medium">
                After: Freedom = {selectedInteraction.b_state_after.freedom_state.toFixed(4)}, Vice = {selectedInteraction.b_state_after.freedoms_vice.toFixed(4)}
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-5">
            <div className="rounded border border-zinc-200 bg-white p-2 text-zinc-800">
              B Gain: <span className="font-bold">{String(selectedInteraction.b_gain)}</span>
            </div>
            <div className="rounded border border-zinc-200 bg-white p-2 text-zinc-800">
              A Response: <span className="font-bold">{String(selectedInteraction.a_response)}</span>
            </div>
            <div className={`rounded border p-2 ${
              !selectedInteraction.non_deprivation && selectedInteraction.b_gain
                ? 'border-red-300 bg-red-50 text-red-800'
                : 'border-zinc-200 bg-white text-zinc-800'
            }`}>
              Non-Deprivation: <span className="font-bold">{String(selectedInteraction.non_deprivation)}</span>
            </div>
            <div className={`rounded border p-2 ${
              !selectedInteraction.non_suppression
                ? 'border-red-300 bg-red-50 text-red-800'
                : 'border-zinc-200 bg-white text-zinc-800'
            }`}>
              Non-Suppression: <span className="font-bold">{String(selectedInteraction.non_suppression)}</span>
            </div>
            <div className="rounded border border-pink-200 bg-pink-50/50 p-2 text-pink-900">
              Ether Resonance: <span className="font-bold">{selectedInteraction.elemental_ether_resonance?.toFixed(3) ?? '—'}</span>
            </div>
          </div>

          <div className="mt-3 rounded border border-zinc-200 bg-white p-2 text-[11px] text-zinc-700">
            <span className="font-bold text-zinc-900">Raw Observations: </span>
            {selectedInteraction.raw_observations}
          </div>
        </div>
      )}
    </div>
  );
};
