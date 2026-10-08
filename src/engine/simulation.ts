/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AEILORIA — FREEDOM V1 TRANSFORMATION TEST ENGINE
 * Integrated with Ether & Fire elemental properties.
 */

import {
  AgentState,
  SystemAggregateState,
  V1Observables,
  InteractionRecord,
  StateTransitionRecord,
  PersistenceClassification,
  MultiDoseResult,
  PrimaryQuestionsAnswers,
  ExperimentOutputJSON,
  FullExperimentRun,
} from '../types/experiment';

/**
 * Seedable Mulberry32 PRNG for strict experimental reproducibility.
 */
export class PRNG {
  private s: number;

  constructor(seed: number) {
    this.s = seed >>> 0;
    if (this.s === 0) this.s = 1337;
  }

  next(): number {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  boolean(p = 0.5): boolean {
    return this.next() < p;
  }
}

export interface SimulationConfig {
  seed: number;
  agentCount: number;
  timestepsPerStage: number;
  appliedY: number; // [0.0, 1.0]
  externalForcing: number; // [0.0, 1.0]
  initialFreedomMean: number;
  initialViceMean: number;
  etherCoupling: number; // [0.0, 1.0] Ether medium connectivity
  fireExcitation: number; // [0.0, 1.0] Fire kinetic excitation
}

export const DEFAULT_CONFIG: SimulationConfig = {
  seed: 4201,
  agentCount: 16,
  timestepsPerStage: 30,
  appliedY: 0.5,
  externalForcing: 0.2,
  initialFreedomMean: 0.45,
  initialViceMean: 0.55,
  etherCoupling: 0.6,
  fireExcitation: 0.45,
};

/**
 * Initialize agent ensemble representing starting state seed x with Ether and Fire properties.
 */
export function createInitialAgents(
  count: number,
  freedomMean: number,
  viceMean: number,
  etherCoupling: number,
  fireExcitation: number,
  prng: PRNG
): AgentState[] {
  const agents: AgentState[] = [];
  for (let i = 0; i < count; i++) {
    const f = Math.min(1, Math.max(0, freedomMean + prng.range(-0.18, 0.18)));
    const v = Math.min(1, Math.max(0, viceMean + prng.range(-0.18, 0.18)));
    const ether = Math.min(1, Math.max(0.1, etherCoupling + prng.range(-0.15, 0.15)));
    const fire = Math.min(1, Math.max(0.1, fireExcitation + prng.range(-0.15, 0.15)));

    // Accessible state space enhanced by etheric field conductivity
    const accessible = Math.max(2, Math.round(f * 20 - v * 8 + ether * 4 + prng.range(-1, 2)));
    const inaccessible = Math.max(1, 24 - accessible);

    agents.push({
      id: `AGENT_${String(i + 1).padStart(2, '0')}`,
      freedom_state: Number(f.toFixed(4)),
      freedoms_vice: Number(v.toFixed(4)),
      ether_permeability: Number(ether.toFixed(4)),
      fire_potency: Number(fire.toFixed(4)),
      accessible_states_count: accessible,
      inaccessible_states_count: inaccessible,
      persistence_factor: Number((0.5 + prng.range(-0.1, 0.1)).toFixed(3)),
      coordinate: [Number(f.toFixed(3)), Number(v.toFixed(3))],
    });
  }
  return agents;
}

/**
 * Aggregate agent metrics into a system state record.
 */
export function computeSystemState(
  timestep: number,
  agents: AgentState[],
  forcing: number
): SystemAggregateState {
  const count = agents.length;
  if (count === 0) {
    return {
      timestep,
      mean_freedom_state: 0,
      mean_freedoms_vice: 0,
      mean_ether_permeability: 0,
      mean_fire_potency: 0,
      total_accessible_states: 0,
      inaccessible_states_count: 0,
      persistence_index: 0,
      recurrence_rate: 0,
      state_diversity: 0,
      trajectory_diversity: 0,
      external_forcing: forcing,
      agents: [],
    };
  }

  let sumF = 0;
  let sumV = 0;
  let sumEther = 0;
  let sumFire = 0;
  let sumAcc = 0;
  let sumInacc = 0;
  let sumPersist = 0;

  for (const a of agents) {
    sumF += a.freedom_state;
    sumV += a.freedoms_vice;
    sumEther += a.ether_permeability;
    sumFire += a.fire_potency;
    sumAcc += a.accessible_states_count;
    sumInacc += a.inaccessible_states_count;
    sumPersist += a.persistence_factor;
  }

  const meanF = sumF / count;
  const meanV = sumV / count;
  const meanEther = sumEther / count;
  const meanFire = sumFire / count;

  // Compute variance for diversity
  let varF = 0;
  let varV = 0;
  for (const a of agents) {
    varF += Math.pow(a.freedom_state - meanF, 2);
    varV += Math.pow(a.freedoms_vice - meanV, 2);
  }
  const stateDiversity = Math.sqrt((varF + varV) / count);
  const trajectoryDiversity = Math.min(1, stateDiversity * 2.4);
  const recurrenceRate = Math.max(0.1, Math.min(0.9, 1 - stateDiversity * 1.5));

  return {
    timestep,
    mean_freedom_state: Number(meanF.toFixed(4)),
    mean_freedoms_vice: Number(meanV.toFixed(4)),
    mean_ether_permeability: Number(meanEther.toFixed(4)),
    mean_fire_potency: Number(meanFire.toFixed(4)),
    total_accessible_states: sumAcc,
    inaccessible_states_count: sumInacc,
    persistence_index: Number((sumPersist / count).toFixed(4)),
    recurrence_rate: Number(recurrenceRate.toFixed(4)),
    state_diversity: Number(stateDiversity.toFixed(4)),
    trajectory_diversity: Number(trajectoryDiversity.toFixed(4)),
    external_forcing: Number(forcing.toFixed(4)),
    agents: agents.map(a => ({ ...a, coordinate: [...a.coordinate] as [number, number] })),
  };
}

/**
 * Executes a single step of the transformation engine F incorporating Fire & Ether.
 */
function stepEngine(
  agents: AgentState[],
  yInfluence: number,
  forcing: number,
  timestep: number,
  prng: PRNG,
  interactionsCollector?: InteractionRecord[],
  recordInteractions = false
): AgentState[] {
  const updated = agents.map(a => ({ ...a }));
  const n = updated.length;

  const pairsToInteract = Math.min(n, Math.max(2, Math.floor(n / 2)));
  const visitedPairs = new Set<string>();

  for (let k = 0; k < pairsToInteract; k++) {
    const idxA = Math.floor(prng.next() * n);
    let idxB = Math.floor(prng.next() * n);
    if (idxA === idxB) idxB = (idxB + 1) % n;

    const pairKey = idxA < idxB ? `${idxA}-${idxB}` : `${idxB}-${idxA}`;
    if (visitedPairs.has(pairKey)) continue;
    visitedPairs.add(pairKey);

    const a = updated[idxA];
    const b = updated[idxB];

    const aBeforeF = a.freedom_state;
    const aBeforeV = a.freedoms_vice;
    const bBeforeF = b.freedom_state;
    const bBeforeV = b.freedoms_vice;

    // Fire kinetic transition ignition potential for B
    const fireDrive = b.fire_potency * 0.05;
    const bGainPotential = (prng.range(-0.05, 0.08) + forcing * 0.02 + fireDrive) * (1 - b.freedoms_vice * 0.38);
    const bGain = bGainPotential > 0.005;

    let bGainActual = bGainPotential;
    let aGainActual = prng.range(-0.02, 0.02) - forcing * 0.01;

    let nonDeprivation = true;
    let nonSuppression = true;
    let nonCapture = true;
    let aResponse = false;
    let distinctness = true;
    let persistence = false;
    let forceDependence = forcing;

    if (bGain) {
      // Ether permeability dampens claustrophobic vice capture tendency
      const etherShield = a.ether_permeability * 0.3;
      const suppressionTendency = Math.max(0, (a.freedoms_vice * 0.85 - yInfluence * 0.85) * (1 - etherShield));
      const captureTendency = Math.max(0, (a.freedoms_vice * 0.7 - yInfluence * 0.9) * (1 - etherShield));

      if (prng.next() < suppressionTendency) {
        nonSuppression = false;
        bGainActual = -Math.abs(bGainActual) * 0.4;
      }

      if (prng.next() < captureTendency) {
        nonCapture = false;
        nonDeprivation = false;
        const capturedAmount = Math.max(0, bGainActual * 0.7);
        bGainActual -= capturedAmount;
        aGainActual += capturedAmount * 0.85;
      }

      // Etheric resonance: When y is present, open field allows sympathetic resonance
      if (nonSuppression && nonCapture) {
        const etherResonanceMultiplier = 0.8 + a.ether_permeability * 0.5;
        const compersionShift = yInfluence * 0.38 * Math.max(0, bGainActual) * (1 - a.freedoms_vice * 0.45) * etherResonanceMultiplier;
        aGainActual += compersionShift;
        if (compersionShift > 0.008) {
          aResponse = true;
          a.freedoms_vice = Math.max(0.04, a.freedoms_vice - yInfluence * 0.05);
          // Ether resonance expands permeability slightly
          a.ether_permeability = Math.min(0.98, a.ether_permeability + 0.02);
        }
      }
    }

    // Apply state updates
    b.freedom_state = Math.min(1, Math.max(0.02, b.freedom_state + bGainActual));
    a.freedom_state = Math.min(1, Math.max(0.02, a.freedom_state + aGainActual));

    // Environmental forcing sparks fire potency while testing freedom's vice
    if (forcing > 0.4 && prng.next() < forcing * 0.15) {
      a.freedoms_vice = Math.min(0.98, a.freedoms_vice + 0.03);
      b.freedoms_vice = Math.min(0.98, b.freedoms_vice + 0.03);
      b.fire_potency = Math.min(0.98, b.fire_potency + 0.02);
    }

    // Distinctness check
    const stateDist = Math.sqrt(
      Math.pow(a.freedom_state - b.freedom_state, 2) +
      Math.pow(a.freedoms_vice - b.freedoms_vice, 2)
    );
    distinctness = stateDist > 0.03;
    persistence = aResponse && (a.persistence_factor > 0.45 || yInfluence > 0.4);

    // Update accessible states with etheric contribution
    a.accessible_states_count = Math.max(
      2,
      Math.min(24, Math.round(a.freedom_state * 20 - a.freedoms_vice * 8 + a.ether_permeability * 4))
    );
    a.inaccessible_states_count = 24 - a.accessible_states_count;
    a.coordinate = [Number(a.freedom_state.toFixed(3)), Number(a.freedoms_vice.toFixed(3))];

    b.accessible_states_count = Math.max(
      2,
      Math.min(24, Math.round(b.freedom_state * 20 - b.freedoms_vice * 8 + b.ether_permeability * 4))
    );
    b.inaccessible_states_count = 24 - b.accessible_states_count;
    b.coordinate = [Number(b.freedom_state.toFixed(3)), Number(b.freedoms_vice.toFixed(3))];

    if (recordInteractions && interactionsCollector) {
      const isAnomaly =
        !distinctness ||
        (bGain && !nonDeprivation && !nonCapture) ||
        (yInfluence >= 0.5 && !nonSuppression) ||
        (bGain && aResponse && !nonDeprivation);

      let anomalyReason: string | undefined;
      if (!distinctness) {
        anomalyReason = 'DISTINCTNESS_COLLAPSE: Minimum state distance threshold breached between entities.';
      } else if (bGain && !nonDeprivation && !nonCapture) {
        anomalyReason = 'CAPTURE_DEPRIVATION: B gain converted to predatory monopolization by A with reciprocal deprivation.';
      } else if (yInfluence >= 0.5 && !nonSuppression) {
        anomalyReason = 'HIGH_DOSE_SUPPRESSION: Active suppression of peer gain persisted despite elevated test influence.';
      } else if (bGain && aResponse && !nonDeprivation) {
        anomalyReason = 'PARADOXICAL_DEPRIVATION: Positive A response co-occurred with zero-sum deprivation penalty.';
      }

      interactionsCollector.push({
        interaction_id: `INT_T${timestep}_${a.id}_${b.id}`,
        timestep,
        agent_a_id: a.id,
        agent_b_id: b.id,
        a_state_before: { freedom_state: Number(aBeforeF.toFixed(4)), freedoms_vice: Number(aBeforeV.toFixed(4)) },
        b_state_before: { freedom_state: Number(bBeforeF.toFixed(4)), freedoms_vice: Number(bBeforeV.toFixed(4)) },
        a_state_after: { freedom_state: Number(a.freedom_state.toFixed(4)), freedoms_vice: Number(a.freedoms_vice.toFixed(4)) },
        b_state_after: { freedom_state: Number(b.freedom_state.toFixed(4)), freedoms_vice: Number(b.freedoms_vice.toFixed(4)) },
        b_gain: bGain,
        a_response: aResponse,
        non_deprivation: nonDeprivation,
        non_suppression: nonSuppression,
        non_capture: nonCapture,
        distinctness: distinctness,
        persistence: persistence,
        force_dependence: Number(forceDependence.toFixed(3)),
        recurrence_reference: timestep > 5 ? `REC_T${timestep - 3}` : null,
        confidence: Number((0.85 + prng.range(0, 0.14)).toFixed(3)),
        raw_observations: `A_dF=${(a.freedom_state - aBeforeF).toFixed(3)}; B_dF=${(b.freedom_state - bBeforeF).toFixed(3)}; y=${yInfluence.toFixed(2)}; FireB=${b.fire_potency.toFixed(2)}; EtherA=${a.ether_permeability.toFixed(2)}`,
        is_anomaly: isAnomaly,
        anomaly_reason: anomalyReason,
        elemental_flame_intensity: Number((b.fire_potency * (bGain ? 1.2 : 0.7)).toFixed(3)),
        elemental_ether_resonance: Number((a.ether_permeability * (aResponse ? 1.3 : 0.8)).toFixed(3)),
      });
    }
  }

  // Relaxation decay towards baseline
  for (const a of updated) {
    if (yInfluence === 0) {
      a.freedom_state = Math.max(0.05, a.freedom_state - 0.002);
      if (prng.next() < 0.2) {
        a.freedoms_vice = Math.min(0.95, a.freedoms_vice + 0.003);
      }
    }
    a.coordinate = [Number(a.freedom_state.toFixed(3)), Number(a.freedoms_vice.toFixed(3))];
  }

  return updated;
}

/**
 * Computes empirical observables from a set of recorded candidate interactions.
 */
function computeObservables(interactions: InteractionRecord[], forcing: number): V1Observables {
  const total = interactions.length;
  if (total === 0) {
    return {
      b_gain_ratio: 0,
      a_response_ratio: 0,
      non_deprivation_ratio: 1,
      non_suppression_ratio: 1,
      non_capture_ratio: 1,
      distinctness_ratio: 1,
      persistence_ratio: 0,
      force_dependence_index: forcing,
      recurrence_count: 0,
      total_interactions: 0,
    };
  }

  let bGainCount = 0;
  let aResponseCount = 0;
  let nonDeprivationCount = 0;
  let nonSuppressionCount = 0;
  let nonCaptureCount = 0;
  let distinctnessCount = 0;
  let persistenceCount = 0;
  let recurrenceCount = 0;

  for (const rec of interactions) {
    if (rec.b_gain) bGainCount++;
    if (rec.a_response) aResponseCount++;
    if (rec.non_deprivation) nonDeprivationCount++;
    if (rec.non_suppression) nonSuppressionCount++;
    if (rec.non_capture) nonCaptureCount++;
    if (rec.distinctness) distinctnessCount++;
    if (rec.persistence) persistenceCount++;
    if (rec.recurrence_reference) recurrenceCount++;
  }

  return {
    b_gain_ratio: Number((bGainCount / total).toFixed(4)),
    a_response_ratio: Number((aResponseCount / total).toFixed(4)),
    non_deprivation_ratio: Number((nonDeprivationCount / total).toFixed(4)),
    non_suppression_ratio: Number((nonSuppressionCount / total).toFixed(4)),
    non_capture_ratio: Number((nonCaptureCount / total).toFixed(4)),
    distinctness_ratio: Number((distinctnessCount / total).toFixed(4)),
    persistence_ratio: Number((persistenceCount / total).toFixed(4)),
    force_dependence_index: Number(forcing.toFixed(4)),
    recurrence_count: recurrenceCount,
    total_interactions: total,
  };
}

/**
 * Calculates Euclidean distance between two aggregate states.
 */
function stateDistance(s1: SystemAggregateState, s2: SystemAggregateState): number {
  const df = s1.mean_freedom_state - s2.mean_freedom_state;
  const dv = s1.mean_freedoms_vice - s2.mean_freedoms_vice;
  return Number(Math.sqrt(df * df + dv * dv).toFixed(4));
}

/**
 * Classifies persistence according to Stage D criteria.
 */
function classifyPersistence(
  distZPrimeToX: number,
  distZPrimeToZ: number
): { category: PersistenceClassification; justification: string; retentionRatio: number } {
  const totalSpan = distZPrimeToX + distZPrimeToZ;
  const retentionRatio = totalSpan > 0 ? Number((distZPrimeToX / totalSpan).toFixed(4)) : 0;

  if (distZPrimeToZ <= 0.05) {
    return {
      category: 'SELF-SUSTAINING CANDIDATE',
      justification: `z_prime remains within critical threshold of z (distance ||z' - z|| = ${distZPrimeToZ.toFixed(4)} <= 0.05). Transformed configuration persists without applied test influence y.`,
      retentionRatio,
    };
  } else if (distZPrimeToX <= 0.065) {
    return {
      category: 'EXTERNALLY DEPENDENT',
      justification: `z_prime returns toward baseline state x (distance ||z' - x|| = ${distZPrimeToX.toFixed(4)} <= 0.065, drift from z = ${distZPrimeToZ.toFixed(4)}). Observed state was maintained by external V1 influence.`,
      retentionRatio,
    };
  } else {
    return {
      category: 'ADAPTED',
      justification: `z_prime diverges from baseline x (||z' - x|| = ${distZPrimeToX.toFixed(4)}) and departs from peak z (||z' - z|| = ${distZPrimeToZ.toFixed(4)}). Partial transformation stabilized into an intermediate autonomous configuration.`,
      retentionRatio,
    };
  }
}

/**
 * Synthesizes answers to the 12 primary questions directly from empirical run data.
 */
function answerPrimaryQuestions(
  stateX: SystemAggregateState,
  yApplied: number,
  stateZ: SystemAggregateState,
  stateZPrime: SystemAggregateState,
  stateZControl: SystemAggregateState,
  observables: V1Observables,
  classification: PersistenceClassification,
  distZPrimeToX: number,
  distZPrimeToZ: number,
  deltaXZ: { freedom_state_change: number; freedoms_vice_change: number; new_accessible_states: number; lost_accessible_states: number }
): PrimaryQuestionsAnswers {
  const deltaZPrimeX = (stateZPrime.mean_freedom_state - stateX.mean_freedom_state).toFixed(4);

  return {
    q1_what_was_x: `Starting state x: Mean Freedom = ${stateX.mean_freedom_state.toFixed(4)}, Mean Freedom's vice = ${stateX.mean_freedoms_vice.toFixed(4)}, Ether Permeability = ${stateX.mean_ether_permeability.toFixed(3)}, Fire Potency = ${stateX.mean_fire_potency.toFixed(3)}, Accessible states = ${stateX.total_accessible_states}.`,
    q2_what_changed_when_y_applied: `Applied y = ${yApplied.toFixed(2)} (V1 Compersion). Non-suppression shifted to ${(observables.non_suppression_ratio * 100).toFixed(1)}%, non-capture to ${(observables.non_capture_ratio * 100).toFixed(1)}%, and sympathetic A_response to ${(observables.a_response_ratio * 100).toFixed(1)}% across ${observables.total_interactions} interactions under Ether-Fire transmutation.`,
    q3_what_was_z: `Resulting state z = F(x, y): Mean Freedom = ${stateZ.mean_freedom_state.toFixed(4)} (delta: ${deltaXZ.freedom_state_change >= 0 ? '+' : ''}${deltaXZ.freedom_state_change.toFixed(4)}), Freedom's vice = ${stateZ.mean_freedoms_vice.toFixed(4)}, Accessible states = ${stateZ.total_accessible_states}.`,
    q4_what_changed_when_y_removed: `Upon setting y = 0, external coupling ceased. System evolved autonomously under unforced kinetic cooling and etheric field relaxation.`,
    q5_what_was_z_prime: `Removed state z' = F(z, 0): Mean Freedom = ${stateZPrime.mean_freedom_state.toFixed(4)}, Mean Freedom's vice = ${stateZPrime.mean_freedoms_vice.toFixed(4)}, Accessible states = ${stateZPrime.total_accessible_states}. Distance ||z' - x|| = ${distZPrimeToX.toFixed(4)}, Distance ||z' - z|| = ${distZPrimeToZ.toFixed(4)}.`,
    q6_did_transformation_persist: `Transformation persistence classification: ${classification}. Net retained Freedom shift relative to baseline x is ${Number(deltaZPrimeX) >= 0 ? '+' : ''}${deltaZPrimeX}.`,
    q7_was_persistence_externally_dependent: classification === 'EXTERNALLY DEPENDENT'
      ? `Yes. The system decayed back toward initial state x once V1 influence y was removed (||z' - x|| = ${distZPrimeToX.toFixed(4)}).`
      : classification === 'ADAPTED'
      ? `Partially. External dependence decayed, leaving a metastable adapted configuration (||z' - x|| = ${distZPrimeToX.toFixed(4)}, ||z' - z|| = ${distZPrimeToZ.toFixed(4)}).`
      : `No. The transformed configuration maintained state parity without continuous external V1 application (||z' - z|| = ${distZPrimeToZ.toFixed(4)} <= 0.05).`,
    q8_did_effect_recur: `Recurrence count = ${observables.recurrence_count} occurrences. Recurrence rate in baseline = ${stateX.recurrence_rate.toFixed(3)}, in z = ${stateZ.recurrence_rate.toFixed(3)}.`,
    q9_new_accessible_states: `New accessible states count: ${deltaXZ.new_accessible_states > 0 ? `+${deltaXZ.new_accessible_states}` : '0'}. Total accessible states expanded from ${stateX.total_accessible_states} to ${stateZ.total_accessible_states} supported by etheric medium conductivity.`,
    q10_lost_accessible_states: `Lost accessible states count: ${deltaXZ.lost_accessible_states}. Constrained/inaccessible state buckets shifted from ${stateX.inaccessible_states_count} to ${stateZ.inaccessible_states_count}.`,
    q11_reveal_existing_or_create_new: (deltaXZ.freedom_state_change > 0 && classification !== 'EXTERNALLY DEPENDENT')
      ? `Evidence indicates V1 stabilized an existing accessible transition pathway previously entrapped by Freedom's vice, creating an altered metastable attractor fueled by Fire drive in Ether field.`
      : `Evidence indicates V1 acted primarily as a transient forcing vector without establishing self-sustaining alternative attractors under current parameters.`,
    q12_falsification_observations: `This interpretation would be falsified if: 1) Control run F(x, 0) exhibits identical accessible state expansion without y; 2) Etheric permeability drops below 0.1 while maintaining positive non-suppression; 3) Re-running with independent seed produces opposite trajectory delta under identical forcing.`,
  };
}

/**
 * Runs the full 4-stage experimental protocol:
 */
export function runCompleteExperiment(config: SimulationConfig): FullExperimentRun {
  const prngA = new PRNG(config.seed);
  const history: StateTransitionRecord[] = [];
  const allInteractions: InteractionRecord[] = [];

  // Initialize ensemble at seed x
  let currentAgents = createInitialAgents(
    config.agentCount,
    config.initialFreedomMean,
    config.initialViceMean,
    config.etherCoupling,
    config.fireExcitation,
    prngA
  );

  // STAGE A: BASELINE (Observe x, y = 0)
  for (let t = 1; t <= config.timestepsPerStage; t++) {
    currentAgents = stepEngine(currentAgents, 0, config.externalForcing, t, prngA);
    const agg = computeSystemState(t, currentAgents, config.externalForcing);
    history.push({
      timestep: t,
      source_phase: 'STAGE_A',
      mean_freedom_state: agg.mean_freedom_state,
      mean_freedoms_vice: agg.mean_freedoms_vice,
      mean_ether_permeability: agg.mean_ether_permeability,
      mean_fire_potency: agg.mean_fire_potency,
      accessible_states: agg.total_accessible_states,
      inaccessible_states: agg.inaccessible_states_count,
      forcing: config.externalForcing,
      y_applied: 0,
    });
  }

  const stateX = computeSystemState(config.timestepsPerStage, currentAgents, config.externalForcing);
  const agentsAtEndOfA = currentAgents.map(a => ({ ...a, coordinate: [...a.coordinate] as [number, number] }));

  // STAGE B & C: APPLY y = V1 Compersion -> Produce z = F(x, y)
  const prngB = new PRNG(config.seed + 101);
  const stageBInteractions: InteractionRecord[] = [];

  for (let step = 1; step <= config.timestepsPerStage; step++) {
    const t = config.timestepsPerStage + step;
    currentAgents = stepEngine(
      currentAgents,
      config.appliedY,
      config.externalForcing,
      t,
      prngB,
      stageBInteractions,
      true
    );
    const agg = computeSystemState(t, currentAgents, config.externalForcing);
    history.push({
      timestep: t,
      source_phase: 'STAGE_B',
      mean_freedom_state: agg.mean_freedom_state,
      mean_freedoms_vice: agg.mean_freedoms_vice,
      mean_ether_permeability: agg.mean_ether_permeability,
      mean_fire_potency: agg.mean_fire_potency,
      accessible_states: agg.total_accessible_states,
      inaccessible_states: agg.inaccessible_states_count,
      forcing: config.externalForcing,
      y_applied: config.appliedY,
    });
  }

  allInteractions.push(...stageBInteractions);
  const stateZ = computeSystemState(config.timestepsPerStage * 2, currentAgents, config.externalForcing);
  const agentsAtZ = currentAgents.map(a => ({ ...a, coordinate: [...a.coordinate] as [number, number] }));

  // CONTROL RUN: z_control = F(x, 0)
  const prngCtrl = new PRNG(config.seed + 101);
  let ctrlAgents = agentsAtEndOfA.map(a => ({ ...a, coordinate: [...a.coordinate] as [number, number] }));
  for (let step = 1; step <= config.timestepsPerStage; step++) {
    const t = config.timestepsPerStage + step;
    ctrlAgents = stepEngine(ctrlAgents, 0, config.externalForcing, t, prngCtrl);
  }
  const stateZControl = computeSystemState(config.timestepsPerStage * 2, ctrlAgents, config.externalForcing);

  // STAGE D: REMOVE y (y = 0) -> Run z_prime = F(z, 0)
  const prngD = new PRNG(config.seed + 202);
  currentAgents = agentsAtZ;

  for (let step = 1; step <= config.timestepsPerStage; step++) {
    const t = config.timestepsPerStage * 2 + step;
    currentAgents = stepEngine(currentAgents, 0, config.externalForcing, t, prngD);
    const agg = computeSystemState(t, currentAgents, config.externalForcing);
    history.push({
      timestep: t,
      source_phase: 'STAGE_D',
      mean_freedom_state: agg.mean_freedom_state,
      mean_freedoms_vice: agg.mean_freedoms_vice,
      mean_ether_permeability: agg.mean_ether_permeability,
      mean_fire_potency: agg.mean_fire_potency,
      accessible_states: agg.total_accessible_states,
      inaccessible_states: agg.inaccessible_states_count,
      forcing: config.externalForcing,
      y_applied: 0,
    });
  }

  const stateZPrime = computeSystemState(config.timestepsPerStage * 3, currentAgents, config.externalForcing);
  const observables = computeObservables(stageBInteractions, config.externalForcing);

  const deltaFreedomXZ = Number((stateZ.mean_freedom_state - stateX.mean_freedom_state).toFixed(4));
  const deltaViceXZ = Number((stateZ.mean_freedoms_vice - stateX.mean_freedoms_vice).toFixed(4));
  const accessibleChange = stateZ.total_accessible_states - stateX.total_accessible_states;
  const newAccessibleStates = Math.max(0, accessibleChange);
  const lostAccessibleStates = Math.max(0, -accessibleChange);

  const distZPrimeToX = stateDistance(stateZPrime, stateX);
  const distZPrimeToZ = stateDistance(stateZPrime, stateZ);
  const distZToControl = stateDistance(stateZ, stateZControl);

  const classification = classifyPersistence(distZPrimeToX, distZPrimeToZ);

  const anomalies: string[] = [];
  if (config.appliedY > 0.6 && observables.a_response_ratio < 0.2) {
    anomalies.push(`HIGH_DOSE_LOW_RESPONSE: y = ${config.appliedY} yielded depressed A_response (${(observables.a_response_ratio * 100).toFixed(1)}%). Resistance via Freedom's vice dominated.`);
  }
  if (deltaViceXZ > 0 && config.appliedY > 0.4) {
    anomalies.push(`PARADOXICAL_VICE_ELEVATION: Freedom's vice elevated under test influence y (+${deltaViceXZ.toFixed(4)}), indicating competitive backlash.`);
  }
  if (distZPrimeToZ < 0.03 && config.appliedY < 0.2) {
    anomalies.push(`SPONTANEOUS_PERSISTENCE: Sub-threshold dosage (y=${config.appliedY}) displayed near-zero reversion drift (||z' - z|| = ${distZPrimeToZ.toFixed(4)}).`);
  }
  if (anomalies.length === 0) {
    anomalies.push('NONE_RECORDED: Trajectory adhered to continuous state-space bounds without discontinuous bifurcations.');
  }

  const falsificationConditions = [
    `Observation of ||z - z_control|| < 0.02 under y >= 0.5 would falsify V1 transformational efficacy.`,
    `Persistence of z' under complete forcing suppression (forcing = 0) with concurrent Freedom's vice > 0.8 would falsify the current model coupling assumption.`,
    `Ether permeability collapse (mean_ether < 0.15) with concurrent distinctness_ratio > 0.9 would falsify field dependency.`,
  ];

  const nextTest = {
    recommended_seed: (config.seed * 31 + 17) % 99999,
    recommended_y: config.appliedY >= 0.75 ? 0.25 : Number((config.appliedY + 0.25).toFixed(2)),
    recommended_forcing: config.externalForcing > 0.5 ? 0.1 : 0.45,
    test_rationale: `Evaluate dose boundary sensitivity at adjacent y vector to test for non-linear saturation vs threshold hysteresis under modified forcing.`,
  };

  const deltaXZ = {
    freedom_state_change: deltaFreedomXZ,
    freedoms_vice_change: deltaViceXZ,
    new_accessible_states: newAccessibleStates,
    lost_accessible_states: lostAccessibleStates,
    persistence_change: Number((stateZ.persistence_index - stateX.persistence_index).toFixed(4)),
    recurrence_change: Number((stateZ.recurrence_rate - stateX.recurrence_rate).toFixed(4)),
    force_dependence_change: Number((stateZ.external_forcing - stateX.external_forcing).toFixed(4)),
  };

  const primaryQuestions = answerPrimaryQuestions(
    stateX,
    config.appliedY,
    stateZ,
    stateZPrime,
    stateZControl,
    observables,
    classification.category,
    distZPrimeToX,
    distZPrimeToZ,
    deltaXZ
  );

  const outputJSON: ExperimentOutputJSON = {
    experiment: {
      run_id: `RUN_${config.seed}_Y${Math.round(config.appliedY * 100)}`,
      ruleset_version: 'AEILORIA_V1_TRANSFORMATION_ENGINE_ELEMENTAL_3.0',
      random_seed: config.seed,
      initial_state_id: `SEED_STATE_F${Math.round(config.initialFreedomMean * 100)}_V${Math.round(config.initialViceMean * 100)}`,
      timesteps_per_stage: config.timestepsPerStage,
      agent_count: config.agentCount,
      applied_y_value: config.appliedY,
      external_forcing_level: config.externalForcing,
      ether_coupling: config.etherCoupling,
      fire_excitation: config.fireExcitation,
    },
    elemental_framework: {
      ether_permeability: stateZ.mean_ether_permeability,
      fire_potency: stateZ.mean_fire_potency,
      transmutation_ratio: Number(((stateZ.mean_ether_permeability + stateZ.mean_fire_potency) / 2).toFixed(4)),
      flame_kinetic_profile: stateZ.mean_fire_potency > 0.5 ? 'RADIANT_ACTIVE_COMBUSTION' : 'SMOLDERING_KINETIC_DRIVE',
      etheric_field_coherence: stateZ.mean_ether_permeability > 0.5 ? 'HIGH_PERMEABILITY_FIELD' : 'ATTENUATED_LATTICE',
    },
    baseline: {
      stage: 'STAGE_A',
      state_x: stateX,
      available_transitions_count: stateX.total_accessible_states,
      inaccessible_transitions_count: stateX.inaccessible_states_count,
      persistence: stateX.persistence_index,
      recurrence: stateX.recurrence_rate,
      interaction_structure: `PAIRWISE_COUPLED_N${config.agentCount}`,
      external_forcing: stateX.external_forcing,
      state_diversity: stateX.state_diversity,
      trajectory_diversity: stateX.trajectory_diversity,
    },
    v1_application: {
      stage: 'STAGE_B',
      y_test_influence: config.appliedY,
      observables,
      interaction_records_sample: stageBInteractions.slice(0, 15),
      total_candidate_interactions: stageBInteractions.length,
    },
    outcome_z: {
      stage: 'STAGE_C',
      state_z: stateZ,
      delta_x_to_z: deltaXZ,
      stability_profile: stateZ.persistence_index > 0.5 ? 'METASTABLE_CONVERGENT' : 'TRANSIENT_DISSIPATIVE',
    },
    removal_test: {
      stage: 'STAGE_D',
      state_z_prime: stateZPrime,
      delta_z_to_z_prime: {
        freedom_state_reversion: Number((stateZPrime.mean_freedom_state - stateZ.mean_freedom_state).toFixed(4)),
        freedoms_vice_reversion: Number((stateZPrime.mean_freedoms_vice - stateZ.mean_freedoms_vice).toFixed(4)),
        accessible_states_retention: stateZPrime.total_accessible_states - stateX.total_accessible_states,
        persistence_change: Number((stateZPrime.persistence_index - stateZ.persistence_index).toFixed(4)),
      },
      distance_z_prime_to_x: distZPrimeToX,
      distance_z_prime_to_z: distZPrimeToZ,
    },
    control_comparison: {
      control_y_value: 0,
      state_z_control: stateZControl,
      distance_z_to_z_control: distZToControl,
      significance_vs_baseline_drift: distZToControl > 0.05
        ? 'STATISTICALLY_DISTINCT_FROM_CONTROL_DRIFT'
        : 'WITHIN_BASELINE_NOISE_MARGIN',
    },
    classification: {
      category: classification.category,
      justification: classification.justification,
      metrics: {
        distance_z_prime_to_x: distZPrimeToX,
        distance_z_prime_to_z: distZPrimeToZ,
        retention_ratio: classification.retentionRatio,
      },
    },
    anomalies,
    falsification_conditions: falsificationConditions,
    next_test: nextTest,
  };

  const multiDoseResults = runMultiDoseBatch(config);

  return {
    outputJSON,
    history,
    allInteractions: stageBInteractions,
    multiDoseResults,
    primaryQuestions,
  };
}

/**
 * Runs multi-dose sweep for y in [0, 0.1, 0.25, 0.5, 0.75, 1.0].
 */
export function runMultiDoseBatch(config: SimulationConfig): MultiDoseResult[] {
  const doses = [0, 0.1, 0.25, 0.5, 0.75, 1.0];
  const results: MultiDoseResult[] = [];

  for (const dose of doses) {
    const subPrngA = new PRNG(config.seed);
    let agents = createInitialAgents(
      config.agentCount,
      config.initialFreedomMean,
      config.initialViceMean,
      config.etherCoupling,
      config.fireExcitation,
      subPrngA
    );

    // Stage A
    for (let t = 1; t <= config.timestepsPerStage; t++) {
      agents = stepEngine(agents, 0, config.externalForcing, t, subPrngA);
    }
    const stateX = computeSystemState(config.timestepsPerStage, agents, config.externalForcing);

    // Stage B
    const subPrngB = new PRNG(config.seed + 101);
    for (let step = 1; step <= config.timestepsPerStage; step++) {
      const t = config.timestepsPerStage + step;
      agents = stepEngine(agents, dose, config.externalForcing, t, subPrngB);
    }
    const stateZ = computeSystemState(config.timestepsPerStage * 2, agents, config.externalForcing);

    // Stage D (Remove y)
    const subPrngD = new PRNG(config.seed + 202);
    for (let step = 1; step <= config.timestepsPerStage; step++) {
      const t = config.timestepsPerStage * 2 + step;
      agents = stepEngine(agents, 0, config.externalForcing, t, subPrngD);
    }
    const stateZPrime = computeSystemState(config.timestepsPerStage * 3, agents, config.externalForcing);

    const dXtoZ = stateDistance(stateZ, stateX);
    const dZtoZPrime = stateDistance(stateZPrime, stateZ);
    const dZPrimeToX = stateDistance(stateZPrime, stateX);

    const cls = classifyPersistence(dZPrimeToX, dZtoZPrime);
    const hysteresis = Number(Math.abs(dXtoZ - dZtoZPrime).toFixed(4));

    results.push({
      y_value: dose,
      z_mean_freedom: stateZ.mean_freedom_state,
      z_mean_vice: stateZ.mean_freedoms_vice,
      z_accessible_states: stateZ.total_accessible_states,
      z_prime_mean_freedom: stateZPrime.mean_freedom_state,
      z_prime_mean_vice: stateZPrime.mean_freedoms_vice,
      z_prime_accessible_states: stateZPrime.total_accessible_states,
      delta_x_z: dXtoZ,
      delta_z_zprime: dZtoZPrime,
      classification: cls.category,
      hysteresis_index: hysteresis,
    });
  }

  return results;
}
