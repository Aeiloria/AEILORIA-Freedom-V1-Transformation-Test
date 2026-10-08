/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PrimaryQuestionsAnswers } from '../types/experiment';
import { HelpCircle, AlertOctagon, Flame } from 'lucide-react';

interface PrimaryQuestionsViewProps {
  answers: PrimaryQuestionsAnswers;
  falsificationConditions: string[];
  anomalies: string[];
}

export const PrimaryQuestionsView: React.FC<PrimaryQuestionsViewProps> = ({
  answers,
  falsificationConditions,
  anomalies,
}) => {
  const questions = [
    { num: 1, title: 'What was x?', content: answers.q1_what_was_x },
    { num: 2, title: 'What changed when y was applied?', content: answers.q2_what_changed_when_y_applied },
    { num: 3, title: 'What was z?', content: answers.q3_what_was_z },
    { num: 4, title: 'What changed when y was removed?', content: answers.q4_what_changed_when_y_removed },
    { num: 5, title: 'What was z\'?', content: answers.q5_what_was_z_prime },
    { num: 6, title: 'Did any transformation persist?', content: answers.q6_did_transformation_persist },
    { num: 7, title: 'Was persistence externally dependent?', content: answers.q7_was_persistence_externally_dependent },
    { num: 8, title: 'Did the effect recur?', content: answers.q8_did_effect_recur },
    { num: 9, title: 'Did the system develop new accessible states?', content: answers.q9_new_accessible_states },
    { num: 10, title: 'Did it lose accessible states?', content: answers.q10_lost_accessible_states },
    { num: 11, title: 'Did V1 reveal an existing possibility or create a new persistent condition?', content: answers.q11_reveal_existing_or_create_new },
    { num: 12, title: 'What observations would falsify the current interpretation?', content: answers.q12_falsification_observations },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded border border-zinc-200 bg-white p-4 shadow-xs">
        <div className="border-b border-zinc-200 pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-pink-600" />
            <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Primary Experimental Questions (12 Protocol Inquiries)
            </h2>
          </div>
          <p className="font-mono text-[11px] text-zinc-500 mt-0.5">
            Mercilessly objective evaluation. Does not ask &ldquo;Did Compersion succeed?&rdquo; Measures only what transformed in the Ether-Fire continuum and what remained.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {questions.map((q) => (
            <div
              key={q.num}
              className="rounded border border-zinc-200 bg-zinc-50/70 p-3.5 transition-colors hover:border-pink-300 hover:bg-white shadow-xs"
            >
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-900">
                <span className="flex h-5 w-5 items-center justify-center rounded border border-pink-300 bg-pink-50 text-[11px] text-pink-700 shadow-xs font-bold">
                  {q.num}
                </span>
                <span>{q.title}</span>
              </div>
              <div className="mt-2 font-mono text-xs leading-relaxed text-zinc-700">
                {q.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Falsification & Anomalies Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded border border-rose-200 bg-rose-50/50 p-4 shadow-xs">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-rose-800">
            <AlertOctagon className="h-4 w-4 text-rose-600" />
            <span>Rigorous Falsification Conditions</span>
          </div>
          <div className="mt-2 space-y-2 font-mono text-xs text-rose-950">
            {falsificationConditions.map((cond, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">[{idx + 1}]</span>
                <span>{cond}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-amber-800">
            <Flame className="h-4 w-4 text-amber-600" />
            <span>Experimental Anomalies &amp; Divergences</span>
          </div>
          <div className="mt-2 space-y-2 font-mono text-xs text-amber-950">
            {anomalies.map((ano, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">·</span>
                <span>{ano}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
