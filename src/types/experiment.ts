/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AEILORIA — FREEDOM V1 TRANSFORMATION TEST
 * Strict schema for the z = F(x, y) test chamber.
 * Integrated with Ether & Fire elemental properties.
 */

export interface AgentState {
  id: string;
  freedom_state: number; // [0, 1] Autonomous capacity / available internal transitions
  freedoms_vice: number; // [0, 1] Tendency toward capture / suppression of peer gains
  ether_permeability: number; // [0, 1] Ether property: spatial connectivity & field permeability
  fire_potency: number; // [0, 1] Fire property: radiant kinetic excitation & transition heat
  accessible_states_count: number;
  inaccessible_states_count: number;
  persistence_factor: number;
  coordinate: [number, number]; // State space embedding [freedom_state, freedoms_vice]
}

export interface SystemAggregateState {
  timestep: number;
  mean_freedom_state: number;
  mean_freedoms_vice: number;
  mean_ether_permeability: number;
  mean_fire_potency: number;
  total_accessible_states: number;
  inaccessible_states_count: number;
  persistence_index: number;
  recurrence_rate: number;
  state_diversity: number;
  trajectory_diversity: number;
  external_forcing: number;
  agents: AgentState[];
}

export interface V1Observables {
  b_gain_ratio: number;
  a_response_ratio: number;
  non_deprivation_ratio: number;
  non_suppression_ratio: number;
  non_capture_ratio: number;
  distinctness_ratio: number;
  persistence_ratio: number;
  force_dependence_index: number;
  recurrence_count: number;
  total_interactions: number;
}

export interface InteractionRecord {
  interaction_id: string;
  timestep: number;
  agent_a_id: string;
  agent_b_id: string;
  a_state_before: { freedom_state: number; freedoms_vice: number };
  b_state_before: { freedom_state: number; freedoms_vice: number };
  a_state_after: { freedom_state: number; freedoms_vice: number };
  b_state_after: { freedom_state: number; freedoms_vice: number };
  b_gain: boolean;
  a_response: boolean;
  non_deprivation: boolean;
  non_suppression: boolean;
  non_capture: boolean;
  distinctness: boolean;
  persistence: boolean;
  force_dependence: number;
  recurrence_reference: string | null;
  confidence: number;
  raw_observations: string;
  is_anomaly?: boolean;
  anomaly_reason?: string;
  elemental_flame_intensity?: number;
  elemental_ether_resonance?: number;
}

export interface StateTransitionRecord {
  timestep: number;
  source_phase: 'STAGE_A' | 'STAGE_B' | 'STAGE_C' | 'STAGE_D';
  mean_freedom_state: number;
  mean_freedoms_vice: number;
  mean_ether_permeability: number;
  mean_fire_potency: number;
  accessible_states: number;
  inaccessible_states: number;
  forcing: number;
  y_applied: number;
}

export type PersistenceClassification =
  | 'EXTERNALLY DEPENDENT'
  | 'ADAPTED'
  | 'SELF-SUSTAINING CANDIDATE';

export interface MultiDoseResult {
  y_value: number;
  z_mean_freedom: number;
  z_mean_vice: number;
  z_accessible_states: number;
  z_prime_mean_freedom: number;
  z_prime_mean_vice: number;
  z_prime_accessible_states: number;
  delta_x_z: number;
  delta_z_zprime: number;
  classification: PersistenceClassification;
  hysteresis_index: number;
}

export interface PrimaryQuestionsAnswers {
  q1_what_was_x: string;
  q2_what_changed_when_y_applied: string;
  q3_what_was_z: string;
  q4_what_changed_when_y_removed: string;
  q5_what_was_z_prime: string;
  q6_did_transformation_persist: string;
  q7_was_persistence_externally_dependent: string;
  q8_did_effect_recur: string;
  q9_new_accessible_states: string;
  q10_lost_accessible_states: string;
  q11_reveal_existing_or_create_new: string;
  q12_falsification_observations: string;
}

/**
 * Required top-level JSON structure
 */
export interface ExperimentOutputJSON {
  experiment: {
    run_id: string;
    ruleset_version: string;
    random_seed: number;
    initial_state_id: string;
    timesteps_per_stage: number;
    agent_count: number;
    applied_y_value: number;
    external_forcing_level: number;
    ether_coupling: number;
    fire_excitation: number;
  };
  elemental_framework: {
    ether_permeability: number;
    fire_potency: number;
    transmutation_ratio: number;
    flame_kinetic_profile: string;
    etheric_field_coherence: string;
  };
  baseline: {
    stage: 'STAGE_A';
    state_x: SystemAggregateState;
    available_transitions_count: number;
    inaccessible_transitions_count: number;
    persistence: number;
    recurrence: number;
    interaction_structure: string;
    external_forcing: number;
    state_diversity: number;
    trajectory_diversity: number;
  };
  v1_application: {
    stage: 'STAGE_B';
    y_test_influence: number;
    observables: V1Observables;
    interaction_records_sample: InteractionRecord[];
    total_candidate_interactions: number;
  };
  outcome_z: {
    stage: 'STAGE_C';
    state_z: SystemAggregateState;
    delta_x_to_z: {
      freedom_state_change: number;
      freedoms_vice_change: number;
      new_accessible_states: number;
      lost_accessible_states: number;
      persistence_change: number;
      recurrence_change: number;
      force_dependence_change: number;
    };
    stability_profile: string;
  };
  removal_test: {
    stage: 'STAGE_D';
    state_z_prime: SystemAggregateState;
    delta_z_to_z_prime: {
      freedom_state_reversion: number;
      freedoms_vice_reversion: number;
      accessible_states_retention: number;
      persistence_change: number;
    };
    distance_z_prime_to_x: number;
    distance_z_prime_to_z: number;
  };
  control_comparison: {
    control_y_value: 0;
    state_z_control: SystemAggregateState;
    distance_z_to_z_control: number;
    significance_vs_baseline_drift: string;
  };
  classification: {
    category: PersistenceClassification;
    justification: string;
    metrics: {
      distance_z_prime_to_x: number;
      distance_z_prime_to_z: number;
      retention_ratio: number;
    };
  };
  anomalies: string[];
  falsification_conditions: string[];
  next_test: {
    recommended_seed: number;
    recommended_y: number;
    recommended_forcing: number;
    test_rationale: string;
  };
}

export interface FullExperimentRun {
  outputJSON: ExperimentOutputJSON;
  history: StateTransitionRecord[];
  allInteractions: InteractionRecord[];
  multiDoseResults: MultiDoseResult[];
  primaryQuestions: PrimaryQuestionsAnswers;
}
