/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AEILORIA — FREEDOM V1 TRANSFORMATION TEST
 * Experimental Engine: z = F(x, y)
 * Integrated with Ether & Fire Elemental Properties.
 */

import { useState, useMemo } from 'react';
import {
  DEFAULT_CONFIG,
  SimulationConfig,
  runCompleteExperiment,
} from './engine/simulation';
import { ChamberHeader } from './components/ChamberHeader';
import { HardContainerBanner } from './components/HardContainerBanner';
import { ChamberControlPanel } from './components/ChamberControlPanel';
import { StateSpacePlot } from './components/StateSpacePlot';
import { TrajectoryPlot } from './components/TrajectoryPlot';
import { ObservablesGrid } from './components/ObservablesGrid';
import { PersistenceClassificationCard } from './components/PersistenceClassificationCard';
import { MultiDoseTable } from './components/MultiDoseTable';
import { InteractionLog } from './components/InteractionLog';
import { PrimaryQuestionsView } from './components/PrimaryQuestionsView';
import { JSONOutputView } from './components/JSONOutputView';
import { Sparkles, Flame } from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<'experiment' | 'multidose' | 'interactions' | 'questions' | 'json'>('experiment');
  const [copied, setCopied] = useState(false);

  // Run the full transformation experiment deterministically on config change
  const experimentRun = useMemo(() => {
    return runCompleteExperiment(config);
  }, [config]);

  const handleConfigChange = (newConfig: Partial<SimulationConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const handleReSeed = () => {
    setConfig((prev) => ({
      ...prev,
      seed: Math.floor(Math.random() * 90000) + 1000,
    }));
  };

  const handleCopyJSON = () => {
    const jsonStr = JSON.stringify(experimentRun.outputJSON, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(experimentRun.outputJSON, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${experimentRun.outputJSON.experiment.run_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const { outputJSON, history, allInteractions, multiDoseResults, primaryQuestions } = experimentRun;

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 flex flex-col font-sans selection:bg-pink-100 selection:text-pink-900">
      {/* Top Header */}
      <ChamberHeader
        runId={outputJSON.experiment.run_id}
        seed={config.seed}
        appliedY={config.appliedY}
        forcing={config.externalForcing}
        etherCoupling={config.etherCoupling}
        fireExcitation={config.fireExcitation}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRun={() => handleConfigChange({ seed: config.seed })}
        onReset={handleReSeed}
        onCopyJSON={handleCopyJSON}
        onDownloadJSON={handleDownloadJSON}
        copied={copied}
      />

      {/* Elemental Framework Verification Strip */}
      <HardContainerBanner />

      {/* Main Chamber Body */}
      <main className="flex-1 px-4 py-4 md:px-6 md:py-6 space-y-5 max-w-[1600px] w-full mx-auto">
        {/* Chamber Parameter & Elemental Controls */}
        <ChamberControlPanel
          config={config}
          onChangeConfig={handleConfigChange}
          onExecute={() => handleConfigChange({ seed: config.seed })}
        />

        {/* Tab 1: Transformation Chamber (Primary Real-time Workspace) */}
        {activeTab === 'experiment' && (
          <div className="space-y-5">
            {/* Stage D Classification Card */}
            <PersistenceClassificationCard
              classification={outputJSON.classification.category}
              justification={outputJSON.classification.justification}
              distZPrimeToX={outputJSON.classification.metrics.distance_z_prime_to_x}
              distZPrimeToZ={outputJSON.classification.metrics.distance_z_prime_to_z}
              distZToControl={outputJSON.control_comparison.distance_z_to_z_control}
              stateX={outputJSON.baseline.state_x}
              stateZ={outputJSON.outcome_z.state_z}
              stateZPrime={outputJSON.removal_test.state_z_prime}
              appliedY={config.appliedY}
            />

            {/* Split Visualizer: Phase Portrait & Temporal Oscilloscope */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <StateSpacePlot
                  stateX={outputJSON.baseline.state_x}
                  stateZ={outputJSON.outcome_z.state_z}
                  stateZPrime={outputJSON.removal_test.state_z_prime}
                  stateZControl={outputJSON.control_comparison.state_z_control}
                  classification={outputJSON.classification.category}
                  appliedY={config.appliedY}
                />
              </div>

              <div className="lg:col-span-7">
                <TrajectoryPlot
                  history={history}
                  timestepsPerStage={config.timestepsPerStage}
                />
              </div>
            </div>

            {/* Stage B Decomposed Observables Grid */}
            <ObservablesGrid
              observables={outputJSON.v1_application.observables}
              appliedY={config.appliedY}
            />
          </div>
        )}

        {/* Tab 2: Multi-Dose Sweep */}
        {activeTab === 'multidose' && (
          <MultiDoseTable
            results={multiDoseResults}
            activeDose={config.appliedY}
            onSelectDose={(d) => handleConfigChange({ appliedY: d })}
          />
        )}

        {/* Tab 3: Interaction Records */}
        {activeTab === 'interactions' && (
          <InteractionLog interactions={allInteractions} />
        )}

        {/* Tab 4: 12 Primary Questions */}
        {activeTab === 'questions' && (
          <PrimaryQuestionsView
            answers={primaryQuestions}
            falsificationConditions={outputJSON.falsification_conditions}
            anomalies={outputJSON.anomalies}
          />
        )}

        {/* Tab 5: Structured JSON Output */}
        {activeTab === 'json' && (
          <JSONOutputView data={outputJSON} />
        )}
      </main>

      {/* Terminal Footer */}
      <footer className="border-t border-zinc-200 bg-white px-6 py-3 font-mono text-[11px] text-zinc-500 shadow-xs">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-pink-600 flex items-center gap-1">
              <Flame className="h-3 w-3 text-pink-600" />
              <Sparkles className="h-3 w-3 text-pink-400" />
            </span>
            <span className="text-zinc-800 font-semibold">AEILORIA ETHER &amp; FIRE CONTINUUM RUNTIME</span>
            <span aria-hidden="true" className="text-zinc-400">·</span>
            <span>RULESET: {outputJSON.experiment.ruleset_version}</span>
          </div>
          <div className="text-zinc-600 flex items-center gap-2">
            <span>Ether Permeability: {outputJSON.elemental_framework.ether_permeability.toFixed(3)}</span>
            <span aria-hidden="true" className="text-zinc-300">·</span>
            <span>Fire Potency: {outputJSON.elemental_framework.fire_potency.toFixed(3)}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
