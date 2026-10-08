/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, RotateCcw, Download, Copy, Check, FlaskConical, BarChart3, Binary, HelpCircle, Layers, Flame, Sparkles } from 'lucide-react';

interface ChamberHeaderProps {
  runId: string;
  seed: number;
  appliedY: number;
  forcing: number;
  etherCoupling: number;
  fireExcitation: number;
  activeTab: 'experiment' | 'multidose' | 'interactions' | 'questions' | 'json';
  setActiveTab: (tab: 'experiment' | 'multidose' | 'interactions' | 'questions' | 'json') => void;
  onRun: () => void;
  onReset: () => void;
  onCopyJSON: () => void;
  onDownloadJSON: () => void;
  copied: boolean;
}

export const ChamberHeader: React.FC<ChamberHeaderProps> = ({
  runId,
  seed,
  appliedY,
  forcing,
  etherCoupling,
  fireExcitation,
  activeTab,
  setActiveTab,
  onRun,
  onReset,
  onCopyJSON,
  onDownloadJSON,
  copied,
}) => {
  return (
    <header className="border-b border-zinc-200 bg-white px-6 py-4 text-zinc-900 shadow-xs">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-pink-200 bg-pink-50 font-mono text-sm shadow-xs text-pink-600">
              <span className="flex items-center -space-x-1">
                <Flame className="h-4 w-4 text-pink-600" />
                <Sparkles className="h-3.5 w-3.5 text-pink-400" />
              </span>
            </span>
            <div>
              <h1 className="font-mono text-lg font-bold tracking-tight text-zinc-900 uppercase">
                AEILORIA — FREEDOM V1 TRANSFORMATION TEST
              </h1>
              <div className="flex items-center gap-2 text-[11px] font-mono text-pink-700">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Ether Medium (Permeability)
                </span>
                <span aria-hidden="true" className="text-zinc-300">·</span>
                <span className="flex items-center gap-1">
                  <Flame className="h-3 w-3" /> Fire Kinetics (Excitation)
                </span>
              </div>
            </div>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-zinc-500 font-mono">
            <span>z = F(x, y)</span>
            <span aria-hidden="true" className="text-zinc-300">·</span>
            <span>V1 = COMPERSION</span>
            <span aria-hidden="true" className="text-zinc-300">·</span>
            <span>SEED: {seed}</span>
            <span aria-hidden="true" className="text-zinc-300">·</span>
            <span>RUN: {runId}</span>
            <span aria-hidden="true" className="text-zinc-300">·</span>
            <span className="text-pink-600 font-semibold">y = {appliedY.toFixed(2)}</span>
            <span aria-hidden="true" className="text-zinc-300">·</span>
            <span>ETHER: {etherCoupling.toFixed(2)}</span>
            <span aria-hidden="true" className="text-zinc-300">·</span>
            <span>FIRE: {fireExcitation.toFixed(2)}</span>
            <span aria-hidden="true" className="text-zinc-300">·</span>
            <span>FORCING: {forcing.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRun}
            className="flex items-center gap-1.5 rounded border border-pink-600 bg-pink-600 px-3.5 py-1.5 font-mono text-xs font-semibold text-white transition-colors hover:bg-pink-700 shadow-xs cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-white text-white" />
            <span>EXECUTE RUN</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 rounded border border-zinc-300 bg-white px-3 py-1.5 font-mono text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900 shadow-xs cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 text-zinc-500" />
            <span>RE-SEED</span>
          </button>

          <button
            onClick={onCopyJSON}
            className="flex items-center gap-1.5 rounded border border-zinc-300 bg-white px-3 py-1.5 font-mono text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900 shadow-xs cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-pink-600" /> : <Copy className="h-3.5 w-3.5 text-zinc-500" />}
            <span>{copied ? 'COPIED JSON' : 'COPY JSON'}</span>
          </button>

          <button
            onClick={onDownloadJSON}
            className="flex items-center gap-1.5 rounded border border-zinc-300 bg-white px-3 py-1.5 font-mono text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900 shadow-xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-zinc-500" />
            <span>EXPORT JSON</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-zinc-200 pt-3">
        <button
          onClick={() => setActiveTab('experiment')}
          className={`flex items-center gap-2 rounded px-3 py-1.5 font-mono text-xs transition-colors cursor-pointer ${
            activeTab === 'experiment'
              ? 'bg-pink-50 text-pink-900 border border-pink-300 font-semibold shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
          }`}
        >
          <FlaskConical className="h-3.5 w-3.5 text-pink-600" />
          <span>TRANSFORMATION CHAMBER</span>
        </button>

        <button
          onClick={() => setActiveTab('multidose')}
          className={`flex items-center gap-2 rounded px-3 py-1.5 font-mono text-xs transition-colors cursor-pointer ${
            activeTab === 'multidose'
              ? 'bg-pink-50 text-pink-900 border border-pink-300 font-semibold shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5 text-pink-600" />
          <span>MULTI-DOSE SWEEP (y = 0..1.0)</span>
        </button>

        <button
          onClick={() => setActiveTab('interactions')}
          className={`flex items-center gap-2 rounded px-3 py-1.5 font-mono text-xs transition-colors cursor-pointer ${
            activeTab === 'interactions'
              ? 'bg-pink-50 text-pink-900 border border-pink-300 font-semibold shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
          }`}
        >
          <Layers className="h-3.5 w-3.5 text-pink-600" />
          <span>INTERACTION RECORDS</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 rounded px-3 py-1.5 font-mono text-xs transition-colors cursor-pointer ${
            activeTab === 'questions'
              ? 'bg-pink-50 text-pink-900 border border-pink-300 font-semibold shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
          }`}
        >
          <HelpCircle className="h-3.5 w-3.5 text-pink-600" />
          <span>12 PRIMARY QUESTIONS</span>
        </button>

        <button
          onClick={() => setActiveTab('json')}
          className={`flex items-center gap-2 rounded px-3 py-1.5 font-mono text-xs transition-colors cursor-pointer ${
            activeTab === 'json'
              ? 'bg-pink-50 text-pink-900 border border-pink-300 font-semibold shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
          }`}
        >
          <Binary className="h-3.5 w-3.5 text-pink-600" />
          <span>STRUCTURED JSON OUTPUT</span>
        </button>
      </div>
    </header>
  );
};
