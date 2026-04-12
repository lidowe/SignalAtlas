import type { Microphone, Preamp, InsertProcessor, SonicSignature, SonicStage } from '../types/studio';

// ── Tonal axis extraction from free-text character fields ──

interface TonalAxes {
  warmth: number;
  clarity: number;
  color: number;
  weight: number;
  transient: 'open' | 'controlled' | 'aggressive' | 'shaped' | 'transparent';
}

const WARMTH_WORDS = /warm|lush|thick|rich|saturat|harmonic|tube|vintage|mojo|glow|round|silk/i;
const CLARITY_WORDS = /clear|transparent|neutral|detail|pristine|clean|accurate|surgical|honest|open|uncolored|linear|reveal/i;
const COLOR_WORDS = /color|punch|aggressive|grit|character|bite|forward|bold|vibe|attitude|edge|excit/i;
const WEIGHT_WORDS = /weight|body|dimension|depth|mass|full|dense|bottom|foundation|sub|chest|authority/i;
const TRANSIENT_CONTROLLED = /controlled|smooth|gentle|glue|soft|round|program-?dependent|musical|settling|leveling/i;
const TRANSIENT_AGGRESSIVE = /aggressive|fast|attack|punch|snap|crack|slam|smack|bite|peak/i;
const TRANSIENT_SHAPED = /shape|sculpt|mold|program|auto|vibe|character/i;

function scoreText(text: string, pattern: RegExp): number {
  const matches = text.match(new RegExp(pattern.source, 'gi'));
  if (!matches) return 0;
  // Diminishing returns: first match is worth more than the fifth
  return Math.min(1, matches.length * 0.25);
}

function extractAxes(character: string, engineering: string): TonalAxes {
  // Character field is the primary source; engineering provides a lighter secondary signal
  const combined = character + ' ' + engineering;

  const warmth = Math.min(1, scoreText(character, WARMTH_WORDS) + scoreText(engineering, WARMTH_WORDS) * 0.3);
  const clarity = Math.min(1, scoreText(character, CLARITY_WORDS) + scoreText(engineering, CLARITY_WORDS) * 0.3);
  const color = Math.min(1, scoreText(character, COLOR_WORDS) + scoreText(engineering, COLOR_WORDS) * 0.3);
  const weight = Math.min(1, scoreText(character, WEIGHT_WORDS) + scoreText(engineering, WEIGHT_WORDS) * 0.3);

  let transient: TonalAxes['transient'] = 'transparent';
  const controlledScore = scoreText(combined, TRANSIENT_CONTROLLED);
  const aggressiveScore = scoreText(combined, TRANSIENT_AGGRESSIVE);
  const shapedScore = scoreText(combined, TRANSIENT_SHAPED);

  const maxTransient = Math.max(controlledScore, aggressiveScore, shapedScore);
  if (maxTransient === 0) transient = 'transparent';
  else if (aggressiveScore === maxTransient) transient = 'aggressive';
  else if (controlledScore === maxTransient) transient = 'controlled';
  else transient = 'shaped';

  return { warmth, clarity, color, weight, transient };
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
    ['warm', axes.warmth],
    ['transparent', axes.clarity],
    ['colorful', axes.color],
    ['weighty', axes.weight],
  ];
  candidates.sort((a, b) => b[1] - a[1]);
  return candidates[0][0];
}

function buildSummary(axes: TonalAxes, stageCount: number): string {
  const traits: string[] = [];

  // Only surface traits that are meaningfully present
  if (axes.warmth > 0.3) traits.push(axes.warmth > 0.7 ? 'lush warmth' : 'warmth');
  if (axes.clarity > 0.3) traits.push(axes.clarity > 0.7 ? 'crystalline clarity' : 'clarity');
  if (axes.color > 0.3) traits.push(axes.color > 0.7 ? 'bold character' : 'subtle color');
  if (axes.weight > 0.3) traits.push(axes.weight > 0.7 ? 'deep weight' : 'body');

  if (traits.length === 0) return 'Neutral — the chain isn\'t imposing a sonic opinion yet.';

  const transientNote =
    axes.transient === 'aggressive' ? ' with forward transients' :
    axes.transient === 'controlled' ? ' with controlled dynamics' :
    axes.transient === 'shaped' ? ' with shaped dynamics' : '';

  // Single-stage: simple declaration. Multi-stage: accumulated feel.
  if (stageCount <= 1) {
    return `${capitalize(traits[0])}${transientNote}.`;
  }

  return `${traits.map(capitalize).join(', ')}${transientNote} — ${stageCount} stages deep.`;
}

function buildContribution(name: string, axes: TonalAxes): string {
  const traits: string[] = [];
  if (axes.warmth > 0.3) traits.push('warmth');
  if (axes.clarity > 0.3) traits.push('clarity');
  if (axes.color > 0.3) traits.push('character');
  if (axes.weight > 0.3) traits.push('body');

  if (traits.length === 0) return `${name} passes signal without strong tonal opinion.`;
  return `${name} contributes ${traits.join(' and ')}.`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Public API ──

const EMPTY_SIGNATURE: SonicSignature = {
  stages: [],
  summary: 'No signal path — choose a microphone to begin.',
  warmth: 0,
  clarity: 0,
  color: 0,
  weight: 0,
  transientCharacter: 'transparent',
  dominantQuality: 'neutral',
};

export function buildSonicSignature(
  mic: Microphone | null,
  preamp: Preamp | null,
  inserts: InsertProcessor[],
): SonicSignature {
  if (!mic) return EMPTY_SIGNATURE;

  const stages: SonicStage[] = [];
  let cumulative: TonalAxes = { warmth: 0, clarity: 0, color: 0, weight: 0, transient: 'transparent' };

  // Stage 1: Microphone — strongest influence on initial character
  const micAxes = extractAxes(mic.character, mic.engineering);
  cumulative = blendAxes(cumulative, micAxes, 0.9);
  stages.push({
    name: mic.name,
    role: 'microphone',
    contribution: buildContribution(mic.name, micAxes),
    cumulativeSnapshot: buildSummary(cumulative, 1),
  });

  // Stage 2: Preamp — second-strongest shaping force
  if (preamp) {
    const preAxes = extractAxes(preamp.character, preamp.engineering);
    cumulative = blendAxes(cumulative, preAxes, 0.7);
    stages.push({
      name: preamp.name,
      role: 'preamp',
      contribution: buildContribution(preamp.name, preAxes),
      cumulativeSnapshot: buildSummary(cumulative, 2),
    });
  }

  // Stage 3+: Insert chain — each stage adds progressively less weight
  for (let i = 0; i < inserts.length; i++) {
    const proc = inserts[i];
    const insertAxes = extractAxes(proc.item.character, proc.item.engineering);
    const stageWeight = 0.5 / (1 + i * 0.3); // diminishing influence
    cumulative = blendAxes(cumulative, insertAxes, stageWeight);
    stages.push({
      name: proc.item.name,
      role: proc.type === 'preamp-eq' ? 'equalizer' : proc.type,
      contribution: buildContribution(proc.item.name, insertAxes),
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
  };
}
