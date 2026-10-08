/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ExperimentOutputJSON } from '../types/experiment';
import { Copy, Check, Download, Binary } from 'lucide-react';

interface JSONOutputViewProps {
  data: ExperimentOutputJSON;
}

export const JSONOutputView: React.FC<JSONOutputViewProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.experiment.run_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded border border-zinc-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Binary className="h-4 w-4 text-pink-600" />
            <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Structured Experimental JSON Output
            </h2>
          </div>
          <p className="font-mono text-[11px] text-zinc-500 mt-0.5">
            Conforms strictly to top-level schema including elemental_framework: ether_coupling, fire_excitation, baseline, v1_application, outcome_z, removal_test, classification, anomalies, falsification_conditions, next_test.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded border border-zinc-300 bg-white px-3 py-1 font-mono text-xs text-zinc-700 transition-colors hover:border-pink-300 hover:text-pink-700 hover:bg-pink-50 shadow-xs cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-pink-600" /> : <Copy className="h-3.5 w-3.5 text-zinc-500" />}
            <span>{copied ? 'COPIED' : 'COPY RAW'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded border border-zinc-300 bg-white px-3 py-1 font-mono text-xs text-zinc-700 transition-colors hover:border-pink-300 hover:text-pink-700 hover:bg-pink-50 shadow-xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-zinc-500" />
            <span>DOWNLOAD</span>
          </button>
        </div>
      </div>

      <div className="mt-3">
        <pre className="max-h-[600px] overflow-auto rounded border border-zinc-200 bg-zinc-50 p-4 font-mono text-[11px] leading-relaxed text-zinc-800">
          {jsonString}
        </pre>
      </div>
    </div>
  );
};
