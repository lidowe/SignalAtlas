// ── Signal Chain Analysis Engine ──
// Implements the physics from Appendix H, the Cascading Stages paper,
// and the Real Physics document.

import type { Microphone, Preamp, ChainAnalysis } from '../types/studio';

/** Voltage transfer: V_preamp = V_mic × Z_load / (Z_source + Z_load) */
function voltageTransfer(z_source: number, z_load: number): number {
  return z_load / (z_source + z_load);
}

/** Bridging ratio = Z_load / Z_source */
function bridgingRatio(z_source: number, z_load: number): number {
  return z_load / z_source;
}

/** Loss in dB from voltage divider: 20 * log10(transfer) */
function voltageLossDb(z_source: number, z_load: number): number {
  const t = voltageTransfer(z_source, z_load);
  return 20 * Math.log10(t);
}

/** Assess bridging ratio quality */
function assessBridging(ratio: number): ChainAnalysis['bridging_assessment'] {
  if (ratio >= 10) return 'transparent';
  if (ratio >= 5) return 'minimal';
  if (ratio >= 3) return 'audible';
  return 'significant';
}

/**
 * Bandwidth shrinkage for n cascaded stages.
 * Formula: shrinkage = √(2^(1/n) − 1)
 * From the Cascading Analog Stages paper.
 */
function bandwidthShrinkage(n: number): number {
  if (n <= 1) return 1;
  return Math.sqrt(Math.pow(2, 1 / n) - 1);
}

/** Effective -3dB bandwidth after n stages given single-stage BW */
function effectiveBandwidthKhz(singleStageBwKhz: number, n: number): number {
  return singleStageBwKhz * bandwidthShrinkage(n);
}

/**
 * THD accumulation for n identical cascaded stages.
 * THD_total ≈ THD_single × √n
 */
function cumulativeTHD(singleTHDpct: number, n: number): number {
  return singleTHDpct * Math.sqrt(n);
}

/**
 * Phase accumulation estimate (degrees at 20kHz) for n transformer stages.
 * Conservative estimate: ~5° per transformer stage at 20kHz for quality iron.
 */
function phaseAccumulation20kHz(n_transformers: number): number {
  return n_transformers * 5;
}

/** Noise floor of cascaded gain stages (simplified) */
function cascadedNoiseFloor(noise_floors_db: number[]): number {
  // Noise powers add: P_total = sum(10^(noise_i/10))
  const total_power = noise_floors_db.reduce((sum, nf) => sum + Math.pow(10, nf / 10), 0);
  return 10 * Math.log10(total_power);
}

/** Full chain analysis for mic → preamp pair */
export function analyzeMicPreamp(mic: Microphone, preamp: Preamp): ChainAnalysis {
  const z_source = mic.output_z_ohm;
  const z_load = preamp.input_z_ohm;
  const ratio = bridgingRatio(z_source, z_load);
  const loss = voltageLossDb(z_source, z_load);
  const transfer = voltageTransfer(z_source, z_load) * 100;
  const assessment = assessBridging(ratio);

  const warnings: string[] = [];
  const notes: string[] = [];

  // Check gain adequacy
  const needed = mic.gain_demand_db;
  const available = preamp.gain_range_db[1];
  if (needed > available) {
    warnings.push(`Insufficient gain: mic needs ~${needed}dB, preamp max is ${available}dB.`);
  } else if (needed > available - 10) {
    notes.push(`Gain headroom is tight: ${available - needed}dB margin.`);
  }

  // Check phantom power conflict
  if (!mic.phantom && mic.type === 'Ribbon') {
    warnings.push('⚠️ Ribbon mic — ensure phantom power is OFF. Phantom can damage ribbon element.');
  }

  // Check resonant impedance interaction
  if (mic.resonant_z_ohm) {
    const peak_ratio = bridgingRatio(mic.resonant_z_ohm, z_load);
    if (peak_ratio < 3) {
      warnings.push(`At resonance (${mic.resonant_freq_hz}Hz), bridging drops to ${peak_ratio.toFixed(1)}:1 — expect significant bass coloration.`);
    } else if (peak_ratio < 5) {
      notes.push(`At resonance (${mic.resonant_freq_hz}Hz), bridging is ${peak_ratio.toFixed(1)}:1 — mild bass effect.`);
    }
  }

  // Transformer count for cascading estimates
  const n_transformers = (preamp.has_transformer ? 1 : 0);

  // Conservative single-stage estimates
  const singleStageBwKhz = preamp.has_transformer ? 95 : 200; // Jensen-class vs transformerless
  const singleTHDpct = preamp.has_transformer ? 0.003 : 0.001;

  return {
    bridging_ratio: ratio,
    bridging_assessment: assessment,
    voltage_transfer_pct: transfer,
    loss_db: Math.abs(loss),
    cumulative_noise_db: preamp.noise_floor_db,
    bandwidth_shrinkage: 1, // single stage
    effective_bw_khz: singleStageBwKhz,
    thd_estimate_pct: singleTHDpct,
    phase_shift_deg_20khz: n_transformers * 5,
    warnings,
    notes,
  };
}

/** Analyze full chain with multiple stages. stages = array of { has_transformer, noise_floor_db } */
export function analyzeFullChain(
  mic: Microphone,
  preamp: Preamp,
  additionalStages: Array<{ has_transformer: boolean; noise_floor_db: number }>
): ChainAnalysis {
  const base = analyzeMicPreamp(mic, preamp);

  const allStages = [
    { has_transformer: preamp.has_transformer, noise_floor_db: preamp.noise_floor_db },
    ...additionalStages,
  ];

  const n = allStages.length;
  const n_transformers = allStages.filter(s => s.has_transformer).length;

  const singleBw = preamp.has_transformer ? 95 : 200;
  base.bandwidth_shrinkage = bandwidthShrinkage(n);
  base.effective_bw_khz = effectiveBandwidthKhz(singleBw, n);
  base.thd_estimate_pct = cumulativeTHD(preamp.has_transformer ? 0.003 : 0.001, n);
  base.phase_shift_deg_20khz = phaseAccumulation20kHz(n_transformers);
  base.cumulative_noise_db = cascadedNoiseFloor(allStages.map(s => s.noise_floor_db));

  if (n >= 5) {
    base.notes.push(`${n} stages in chain — cascading effects become measurable. Bandwidth at ${base.effective_bw_khz.toFixed(1)}kHz (-3dB).`);
  }
  if (n_transformers >= 4) {
    base.warnings.push(`${n_transformers} transformers in chain — cumulative phase shift ~${base.phase_shift_deg_20khz}° at 20kHz.`);
  }

  return base;
}
