import type { ClaimEvidence, Microphone, Preamp, InsertProcessor, SonicSignature, SonicStage } from '../types/studio';

interface TonalAxes {
  warmth: number;
  clarity: number;
  color: number;
  weight: number;
  transient: 'open' | 'controlled' | 'aggressive' | 'shaped' | 'transparent';
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function finalizeAxes(axes: TonalAxes): TonalAxes {
  return {
    warmth: clamp(axes.warmth),
    clarity: clamp(axes.clarity),
    color: clamp(axes.color),
    weight: clamp(axes.weight),
    transient: axes.transient,
  };
}

function microphoneAxes(mic: Microphone): TonalAxes {
  switch (mic.type) {
    case 'Tube LDC':
      return finalizeAxes({ warmth: 0.72, clarity: 0.34, color: 0.56, weight: 0.52, transient: 'shaped' });
    case 'FET LDC':
      return finalizeAxes({ warmth: 0.34, clarity: 0.62, color: 0.32, weight: 0.34, transient: 'open' });
    case 'FET MDC':
    case 'FET SDC':
      return finalizeAxes({ warmth: 0.16, clarity: 0.78, color: 0.18, weight: 0.16, transient: 'open' });
    case 'Ribbon':
      return finalizeAxes({ warmth: 0.58, clarity: 0.28, color: 0.38, weight: 0.46, transient: 'controlled' });
    case 'Dynamic':
      return finalizeAxes({ warmth: 0.28, clarity: 0.24, color: 0.34, weight: 0.40, transient: 'controlled' });
    case 'Measurement':
      return finalizeAxes({ warmth: 0.05, clarity: 0.92, color: 0.05, weight: 0.12, transient: 'transparent' });
    case 'Boundary':
      return finalizeAxes({ warmth: 0.16, clarity: 0.54, color: 0.14, weight: 0.28, transient: 'open' });
    default:
      return finalizeAxes({ warmth: 0.20, clarity: 0.50, color: 0.20, weight: 0.24, transient: 'open' });
  }
}

function preampAxes(preamp: Preamp): TonalAxes {
  const axes: TonalAxes = { warmth: 0.08, clarity: 0.18, color: 0.08, weight: 0.08, transient: 'transparent' };

  switch (preamp.topology) {
    case 'all-valve':
      axes.warmth += 0.58;
      axes.color += 0.30;
      axes.weight += 0.34;
      axes.clarity += 0.10;
      axes.transient = 'shaped';
      break;
    case 'hybrid-tube':
      axes.warmth += 0.40;
      axes.color += 0.24;
      axes.weight += 0.22;
      axes.clarity += 0.14;
      axes.transient = 'controlled';
      break;
    case 'discrete-ss':
      axes.clarity += 0.30;
      axes.color += 0.18;
      axes.weight += 0.10;
      axes.transient = 'open';
      break;
    case 'dc-coupled':
      axes.clarity += 0.44;
      axes.color += 0.06;
      axes.transient = 'transparent';
      break;
  }

  if (preamp.has_transformer) {
    axes.warmth += 0.16;
    axes.color += 0.14;
    axes.weight += 0.14;
    axes.transient = axes.transient === 'transparent' ? 'controlled' : axes.transient;
  }

  if (preamp.max_output_dbu >= 26) axes.weight += 0.04;
  return finalizeAxes(axes);
}

function insertAxes(proc: InsertProcessor): TonalAxes {
  if (proc.type === 'compressor') {
    const topology = proc.item.topology;
    if (topology.includes('mu')) return finalizeAxes({ warmth: 0.40, clarity: 0.12, color: 0.34, weight: 0.24, transient: 'controlled' });
    if (topology.includes('optical')) return finalizeAxes({ warmth: 0.24, clarity: 0.20, color: 0.20, weight: 0.16, transient: 'controlled' });
    if (topology.includes('fet')) return finalizeAxes({ warmth: 0.18, clarity: 0.20, color: 0.42, weight: 0.18, transient: 'aggressive' });
    if (topology.includes('vca')) return finalizeAxes({ warmth: 0.12, clarity: 0.22, color: 0.20, weight: 0.12, transient: 'controlled' });
    return finalizeAxes({ warmth: 0.16, clarity: 0.18, color: 0.22, weight: 0.14, transient: 'controlled' });
  }

  if (proc.type === 'equalizer') {
    const axes: TonalAxes = { warmth: 0.10, clarity: 0.18, color: 0.16, weight: 0.10, transient: 'transparent' };
    if (proc.item.topology === 'tube-reactive') {
      axes.warmth += 0.26;
      axes.color += 0.18;
      axes.weight += 0.12;
      axes.transient = 'shaped';
    }
    if (proc.item.topology === 'tilt') axes.clarity += 0.10;
    if (proc.item.has_transformer) {
      axes.warmth += 0.12;
      axes.color += 0.12;
      axes.transient = 'controlled';
    }
    return finalizeAxes(axes);
  }

  if (proc.type === 'preamp-eq') {
    return preampAxes(proc.item);
  }

  const axes: TonalAxes = { warmth: 0.12, clarity: 0.14, color: 0.18, weight: 0.12, transient: 'transparent' };
  if (proc.item.has_transformer) {
    axes.warmth += 0.16;
    axes.color += 0.14;
    axes.weight += 0.10;
    axes.transient = 'controlled';
  }
  return finalizeAxes(axes);
}

// ── Cumulative blending ──

function blendAxes(accumulated: TonalAxes, incoming: TonalAxes, weight: number): TonalAxes {
  // Each new stage shifts the cumulative axes but doesn't overwrite —
  // earlier stages remain influential, later stages layer on top.
  const blend = (a: number, b: number) => Math.min(1, a + b * weight);
  return {
    warmth: blend(accumulated.warmth, incoming.warmth),
    clarity: Math.max(0, Math.min(1, accumulated.clarity + (incoming.clarity - incoming.warmth * 0.3) * weight)),
    color: blend(accumulated.color, incoming.color),
    weight: blend(accumulated.weight, incoming.weight),
    transient: incoming.transient !== 'transparent' ? incoming.transient : accumulated.transient,
  };
}

// ── Summary prose builders ──

function dominantQuality(axes: TonalAxes): string {
  const candidates: [string, number][] = [
    ['harmonic-load', axes.warmth],
    ['spectral-clarity', axes.clarity],
    ['coloration', axes.color],
    ['low-mid-mass', axes.weight],
  ];
  candidates.sort((a, b) => b[1] - a[1]);
  return candidates[0][0];
}

function buildSummary(axes: TonalAxes, stageCount: number): string {
  const traits: string[] = [];
  if (axes.warmth > 0.3) traits.push(axes.warmth > 0.7 ? 'higher harmonic load' : 'moderate harmonic load');
  if (axes.clarity > 0.3) traits.push(axes.clarity > 0.7 ? 'high spectral clarity' : 'retained clarity');
  if (axes.color > 0.3) traits.push(axes.color > 0.7 ? 'strong coloration' : 'added coloration');
  if (axes.weight > 0.3) traits.push(axes.weight > 0.7 ? 'more low-mid mass' : 'some added mass');

  if (traits.length === 0) return 'Low-color route profile — the chain is not adding many extra stages yet.';

  const transientNote =
    axes.transient === 'aggressive' ? ' with faster attack emphasis' :
    axes.transient === 'controlled' ? ' with tighter transient control' :
    axes.transient === 'shaped' ? ' with more shaped dynamics' : '';

  if (stageCount <= 1) return `${capitalize(traits[0])}${transientNote}.`;
  return `${traits.map(capitalize).join(', ')}${transientNote} — ${stageCount} stages deep.`;
}

function buildContribution(name: string, axes: TonalAxes): string {
  const traits: string[] = [];
  if (axes.warmth > 0.3) traits.push('harmonic load');
  if (axes.clarity > 0.3) traits.push('clarity retention');
  if (axes.color > 0.3) traits.push('coloration');
  if (axes.weight > 0.3) traits.push('low-mid mass');

  if (traits.length === 0) return `${name} mainly preserves signal integrity without adding many extra signatures.`;
  return `${name} increases ${traits.join(' and ')}.`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Public API ──

const EMPTY_SIGNATURE: SonicSignature = {
  stages: [],
  summary: 'No route profile — choose a microphone to begin.',
  warmth: 0,
  clarity: 0,
  color: 0,
  weight: 0,
  transientCharacter: 'transparent',
  dominantQuality: 'neutral',
  internalEvidence: [],
};

export function buildSonicSignature(
  mic: Microphone | null,
  preamp: Preamp | null,
  inserts: InsertProcessor[],
): SonicSignature {
  if (!mic) return EMPTY_SIGNATURE;

  const stages: SonicStage[] = [];
  const internalEvidence: ClaimEvidence[] = [
    {
      id: 'signature-method',
      area: 'harmonics',
      level: 'derived-electrical',
      summary: 'Route profile is computed from component topology, transformer presence, coupling style, and stage order rather than adjective parsing.',
    },
  ];

  let cumulative: TonalAxes = { warmth: 0, clarity: 0, color: 0, weight: 0, transient: 'transparent' };

  const micAxes = microphoneAxes(mic);
  cumulative = blendAxes(cumulative, micAxes, 0.9);
  internalEvidence.push({
    id: `mic-${mic.id}`,
    area: 'dynamics',
    level: 'published-spec',
    summary: `${mic.name} profile derived from microphone type, coupling style, and declared operating characteristics.`,
  });
  stages.push({
    name: mic.name,
    role: 'microphone',
    contribution: buildContribution(mic.name, micAxes),
    cumulativeSnapshot: buildSummary(cumulative, 1),
  });

  if (preamp) {
    const preAxes = preampAxes(preamp);
    cumulative = blendAxes(cumulative, preAxes, 0.7);
    internalEvidence.push({
      id: `pre-${preamp.id}`,
      area: 'gain',
      level: 'derived-electrical',
      summary: `${preamp.name} contribution is based on topology, transformer presence, and available output structure.`,
    });
    stages.push({
      name: preamp.name,
      role: 'preamp',
      contribution: buildContribution(preamp.name, preAxes),
      cumulativeSnapshot: buildSummary(cumulative, 2),
    });
  }

  for (let i = 0; i < inserts.length; i++) {
    const proc = inserts[i];
    const stageAxes = insertAxes(proc);
    const stageWeight = 0.5 / (1 + i * 0.3);
    cumulative = blendAxes(cumulative, stageAxes, stageWeight);
    internalEvidence.push({
      id: `insert-${proc.item.id}-${i}`,
      area: proc.type === 'compressor' ? 'dynamics' : 'harmonics',
      level: 'derived-electrical',
      summary: `${proc.item.name} contribution is based on declared processor topology and coupling characteristics.`,
    });
    stages.push({
      name: proc.item.name,
      role: proc.type === 'preamp-eq' ? 'equalizer' : proc.type,
      contribution: buildContribution(proc.item.name, stageAxes),
      cumulativeSnapshot: buildSummary(cumulative, stages.length),
    });
  }

  return {
    stages,
    summary: buildSummary(cumulative, stages.length),
    warmth: cumulative.warmth,
    clarity: cumulative.clarity,
    color: cumulative.color,
    weight: cumulative.weight,
    transientCharacter: cumulative.transient,
    dominantQuality: dominantQuality(cumulative),
    internalEvidence,
  };
}
