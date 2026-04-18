import { useState } from 'react';
import type { Perspective, Microphone, Preamp, Compressor, Equalizer, OutboardProcessor, SummingNode, MonitorSpeaker } from '../types/studio';
import GearSilhouette from './GearSilhouette';
import { gearImage } from '../utils/gearImage';
import { microphones } from '../data/microphones';
import { preamps } from '../data/preamps';
import { compressors } from '../data/compressors';
import { equalizers } from '../data/equalizers';
import { outboardProcessors } from '../data/outboard';
import { cascadeNodes, monitorSpeakers, nodeZones } from '../data/cascade';
import { nodeConsequence, roleLabel } from './CascadeView';
import { getContextTags } from '../engine/studioViewModel';

interface Props {
  perspective: Perspective;
  inspectedId: string | null;
  onInspect: (id: string | null) => void;
  onClose: () => void;
}

type InspectableComponent = Microphone | Preamp | Compressor | Equalizer | OutboardProcessor;
type AlternativeDirection = 'precision' | 'character';

interface AlternativeOption {
  direction: AlternativeDirection;
  component: InspectableComponent;
}

function buildOverview(component: InspectableComponent, perspective: Perspective): { title: string; summary: string; supporting?: string } {
  if (perspective === 'technical') {
    return {
      title: 'Unit Details',
      summary: component.engineering,
      supporting: 'heritage' in component ? component.heritage : undefined,
    };
  }

  return {
    title: 'Unit Details',
    summary: component.character,
    supporting: 'heritage' in component ? component.heritage : undefined,
  };
}

function microphoneFamilyKey(mic: Microphone): string | null {
  const text = `${mic.name} ${mic.heritage ?? ''}`.toLowerCase();

  if (text.includes('u87') || text.includes('sa-87') || text.includes('87-style')) {
    return 'u87-family';
  }

  if (text.includes('u47 fet') || text.includes('fet47')) {
    return 'u47-fet-family';
  }

  return null;
}

function microphoneFamilyRepresentativeRank(mic: Microphone): number {
  const family = microphoneFamilyKey(mic);
  if (family !== 'u87-family') return 0;

  if (mic.id === 'mic-stam-sa87-red') return 0;
  if (mic.id === 'mic-stam-sa87-black') return 1;
  return 2;
}

function dedupeMicrophoneFamilies(pool: Microphone[]): Microphone[] {
  const representatives = new Map<string, Microphone>();

  pool.forEach((mic) => {
    const key = microphoneFamilyKey(mic) ?? `id:${mic.id}`;
    const existing = representatives.get(key);

    if (!existing || microphoneFamilyRepresentativeRank(mic) < microphoneFamilyRepresentativeRank(existing)) {
      representatives.set(key, mic);
    }
  });

  return Array.from(representatives.values());
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <h4 className="text-silkscreen text-[8px]">{title}</h4>
      {children}
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-zinc-500">{label}</span>
      <span className="font-mono" style={{ color: 'var(--sa-cream-dim)' }}>{value}</span>
    </div>
  );
}

function ContextTags({ tags, tone }: { tags: string[]; tone: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-zinc-500">Context notes</div>
      <p className="text-[11px] text-zinc-500 leading-relaxed">
        These are descriptive situations or outcomes people often associate with the gear, not creative prescriptions.
      </p>
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <span key={tag} className={`text-[9px] px-1.5 py-0.5 rounded-[2px] border ${tone}`}>{tag}</span>
        ))}
      </div>
    </div>
  );
}

function DescriptiveList({
  title,
  items,
  tone,
}: {
  title: string;
  items?: string[];
  tone: string;
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-1">
      <div className="text-xs text-zinc-500">{title}</div>
      <div className="flex flex-wrap gap-1">
        {items.map((item) => (
          <span key={item} className={`text-[9px] px-1.5 py-0.5 rounded-[2px] border ${tone}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function OverviewSection({ component, perspective }: { component: InspectableComponent; perspective: Perspective }) {
  const overview = buildOverview(component, perspective);

  return (
    <Section title={overview.title}>
      <p className="text-sm text-zinc-300 leading-relaxed">{overview.summary}</p>
      {overview.supporting && <p className="mt-2 text-xs leading-relaxed text-zinc-500 italic">{overview.supporting}</p>}
    </Section>
  );
}

function describeComponentMeta(component: InspectableComponent): string {
  if ('type' in component && 'qty' in component) {
    return `${component.vendor} · ${component.type}`;
  }
  if ('topology' in component && 'gain_range_db' in component) {
    return `${component.vendor} · ${component.topology}`;
  }
  if ('topology' in component && 'detection' in component) {
    return `${component.vendor} · ${component.topology}`;
  }
  if ('topology' in component && 'bands' in component) {
    return `${component.vendor} · ${component.topology}`;
  }
  return `${component.vendor} · ${component.type}`;
}

function descriptorText(component: InspectableComponent): string {
  return [
    component.name,
    component.character,
    component.engineering,
    ('heritage' in component ? component.heritage : undefined),
    ...(component.tendencies ?? []),
    ...(component.tradeoffs ?? []),
    ...(component.workflow_implications ?? []),
    ...getContextTags(component),
  ].filter(Boolean).join(' ').toLowerCase();
}

function precisionCharacterScore(component: InspectableComponent): number {
  const text = descriptorText(component);
  let score = 0;

  if ('type' in component && 'qty' in component) {
    const micBias: Record<Microphone['type'], number> = {
      'Measurement': 4,
      'FET SDC': 4,
      'Boundary': 3,
      'FET MDC': 2,
      'Field Recorder': 1,
      'FET LDC': 1,
      'Subkick': -2,
      'Dynamic': -1,
      'Ribbon': -3,
      'Tube LDC': -4,
    };
    score += micBias[component.type] ?? 0;
    if (component.sensitivity_dbv > -36) score += 1;
    if (component.type === 'FET SDC' && component.patterns.includes('cardioid')) score += 1;
  } else if ('topology' in component && 'gain_range_db' in component) {
    const preBias: Record<Preamp['topology'], number> = {
      'dc-coupled': 4,
      'discrete-ss': 1,
      'hybrid-tube': -2,
      'all-valve': -4,
    };
    score += preBias[component.topology] ?? 0;
    score += component.has_transformer ? -2 : 2;
    if (component.max_output_dbu >= 26) score += 1;
  } else if ('topology' in component && 'detection' in component) {
    const compBias: Record<Compressor['topology'], number> = {
      'gate': 4,
      'ss-limiter': 3,
      'vca-channel': 3,
      'vca-bus': 3,
      'de-esser': 2,
      'multiband': 2,
      'spectral': 2,
      'discrete-transistor': 0,
      'fet-1176': -1,
      'zener': -2,
      'diode-bridge': -2,
      'optical': -2,
      'fet-tube': -3,
      'variable-mu': -4,
    };
    score += compBias[component.topology] ?? 0;
    if (component.sidechain) score += 1;
    if (component.link) score += 1;
    if (/wide|fast|program-dependent|multiple/i.test(component.attack_range + ' ' + component.release_range + ' ' + component.ratios)) score += 1;
  } else if ('topology' in component && 'bands' in component) {
    const eqBias: Record<Equalizer['topology'], number> = {
      'parametric': 4,
      'tilt': 1,
      'active-inductor': 0,
      'passive-inductor': -2,
      'tube-reactive': -4,
    };
    score += eqBias[component.topology] ?? 0;
    score += component.has_transformer ? -2 : 1;
    if (/bandwidth control|selectable frequencies|frequency selections|bell|hpf|lpf/i.test(component.bands)) score += 2;
    if (/single tilt/i.test(component.bands)) score -= 1;
  } else {
    const outboardBias: Record<OutboardProcessor['type'], number> = {
      'utility': 3,
      'spatial': 1,
      'delay': 0,
      'reverb': -1,
      'multi-fx': -1,
      'harmonic': -4,
    };
    score += outboardBias[component.type] ?? 0;
    score += component.has_transformer ? -2 : 1;
    score += component.format === 'digital' ? 1 : 0;
    score += component.routing_mode === 'inline-optional' ? 1 : -1;
  }

  if (/transparent|clean|clear|precise|fast|tight|detailed|controlled|explicit|accurate|neutral/i.test(text)) score += 1;
  if (/warm|rich|rounded|harmonic|bloom|lush|thick|weight|tube|vintage|mojo|color/i.test(text)) score -= 1;

  return score;
}

function familyPool(component: InspectableComponent): InspectableComponent[] {
  if ('type' in component && 'qty' in component) {
    const familyKey = microphoneFamilyKey(component);
    if (familyKey) {
      const exactFamily = microphones.filter((mic) => microphoneFamilyKey(mic) === familyKey);
      if (exactFamily.length > 1) return exactFamily;
    }

    const exact = microphones.filter((mic) => mic.type === component.type);
    return exact.length > 1 ? exact : microphones;
  }
  if ('topology' in component && 'gain_range_db' in component) {
    const exact = preamps.filter((pre) => pre.topology === component.topology);
    return exact.length > 1 ? exact : preamps;
  }
  if ('topology' in component && 'detection' in component) {
    const exact = compressors.filter((comp) => comp.topology === component.topology);
    return exact.length > 1 ? exact : compressors;
  }
  if ('topology' in component && 'bands' in component) {
    const exact = equalizers.filter((eq) => eq.topology === component.topology);
    return exact.length > 1 ? exact : equalizers;
  }

  const exact = outboardProcessors.filter((proc) => proc.type === component.type && proc.routing_mode === component.routing_mode);
  if (exact.length > 1) return exact;

  const sameMode = outboardProcessors.filter((proc) => proc.routing_mode === component.routing_mode);
  return sameMode.length > 1 ? sameMode : outboardProcessors;
}

function fallbackPool(component: InspectableComponent, primaryPool: InspectableComponent[]): InspectableComponent[] {
  const primaryIds = new Set(primaryPool.map((candidate) => candidate.id));

  if ('type' in component && 'qty' in component) {
    return dedupeMicrophoneFamilies(
      microphones.filter((mic) => mic.type === component.type && !primaryIds.has(mic.id) && mic.id !== component.id)
    );
  }

  return [];
}

function pickAlternative(
  currentScore: number,
  direction: AlternativeDirection,
  primaryPool: InspectableComponent[],
  secondaryPool: InspectableComponent[]
): InspectableComponent | undefined {
  const compare = (pool: InspectableComponent[]) => {
    const candidates = pool
      .map((candidate) => ({ candidate, delta: precisionCharacterScore(candidate) - currentScore }))
      .filter((entry) => direction === 'precision' ? entry.delta > 0 : entry.delta < 0)
      .sort((left, right) => {
        const distance = Math.abs(left.delta) - Math.abs(right.delta);
        if (distance !== 0) return distance;

        return left.candidate.name.localeCompare(right.candidate.name);
      });

    return candidates[0]?.candidate;
  };

  return compare(primaryPool) ?? compare(secondaryPool);
}

function buildAlternatives(component: InspectableComponent): AlternativeOption[] {
  const primaryPool = familyPool(component).filter((candidate) => candidate.id !== component.id);
  const secondaryPool = fallbackPool(component, primaryPool);
  if (primaryPool.length === 0 && secondaryPool.length === 0) return [];

  const currentScore = precisionCharacterScore(component);
  const precisionCandidate = pickAlternative(currentScore, 'precision', primaryPool, secondaryPool);
  const characterCandidate = pickAlternative(currentScore, 'character', primaryPool, secondaryPool);

  if (!precisionCandidate && !characterCandidate) return [];

  const alternatives: AlternativeOption[] = [];
  if (precisionCandidate) {
    alternatives.push({ direction: 'precision', component: precisionCandidate });
  }

  if (characterCandidate && characterCandidate.id !== precisionCandidate?.id) {
    alternatives.push({ direction: 'character', component: characterCandidate });
  }

  return alternatives;
}

function AlternativeCard({
  option,
  onInspect,
}: {
  option: AlternativeOption;
  onInspect: (id: string) => void;
}) {
  const label = option.direction === 'precision' ? 'More Precision' : 'More Character';
  const subtitle = option.direction === 'precision'
    ? 'Tighter, clearer, more explicit'
    : 'Bolder, rounder, more imprinting';
  const tone = option.direction === 'precision'
    ? 'border-cyan-800/30 bg-cyan-950/20 text-cyan-100'
    : 'border-amber-800/30 bg-amber-950/20 text-amber-100';

  return (
    <button
      onClick={() => onInspect(option.component.id)}
      className={`w-full mat-recess rounded-[3px] border px-3 py-3 text-left transition hover:border-zinc-600 ${tone}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-silkscreen-faint text-[8px]">{label}</span>
        <span className="text-[9px] text-zinc-500">Compare</span>
      </div>
      <div className="mt-2 text-sm font-medium" style={{ color: 'var(--sa-cream)' }}>{option.component.name}</div>
      <div className="mt-1 text-[11px] text-zinc-400">{describeComponentMeta(option.component)}</div>
      <p className="mt-2 text-[11px] leading-relaxed" style={{ color: 'var(--sa-cream-dim)' }}>{subtitle}</p>
    </button>
  );
}

function AlternativeSection({
  component,
  onInspect,
}: {
  component: InspectableComponent;
  onInspect: (id: string) => void;
}) {
  const alternatives = buildAlternatives(component);
  if (alternatives.length === 0) return null;

  return (
    <Section title="Compare Direction">
      <p className="text-[11px] leading-relaxed" style={{ color: 'var(--sa-cream-dim)' }}>
        These are not better-or-worse picks. They are nearby alternatives that lean the same decision toward more precision or more character.
      </p>
      <div className="mt-2 space-y-2">
        {alternatives.map((option) => (
          <AlternativeCard key={`${option.direction}-${option.component.id}`} option={option} onInspect={onInspect} />
        ))}
      </div>
    </Section>
  );
}

function GearImage({ id, category, micType, accent }: { id: string; category: 'microphone' | 'preamp' | 'compressor' | 'equalizer' | 'outboard'; micType?: Microphone['type']; accent?: string }) {
  const { src, form } = gearImage(id, category, micType);
  if (src) {
    return <img src={src} alt="" className="h-16 w-auto rounded-[3px] object-contain opacity-80" />;
  }
  return <GearSilhouette form={form} accent={accent ?? '#a0a0a0'} className={category === 'microphone' ? 'h-14 w-10' : 'h-8 w-24'} />;
}

function MicInspector({ mic, perspective }: { mic: Microphone; perspective: Perspective }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <GearImage id={mic.id} category="microphone" micType={mic.type} accent="var(--sa-signal-active)" />
        <div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--sa-signal-active)' }}>{mic.name}</h3>
          <div className="text-xs text-zinc-500">{mic.vendor} · {mic.type} · {mic.qty}× available</div>
        </div>
      </div>

      <OverviewSection component={mic} perspective={perspective} />

      {perspective === 'musician' && (
        <Section title="Character">
          <div className="mt-2">
            <DescriptiveList title="Likely tendencies" items={mic.tendencies} tone="bg-amber-900/20 text-amber-300 border-amber-700/30" />
          </div>
          <div className="mt-2">
            <ContextTags tags={getContextTags(mic)} tone="bg-amber-900/20 text-amber-300 border-amber-700/30" />
          </div>
          <div className="mt-2">
            <DescriptiveList title="Tradeoffs" items={mic.tradeoffs} tone="bg-zinc-800 text-zinc-300 border-zinc-700" />
          </div>
        </Section>
      )}

      {perspective === 'engineer' && (
        <>
          <Section title="Signal Chain Info">
            <Spec label="Output Z" value={`${mic.output_z_ohm} Ω`} />
            <Spec label="Sensitivity" value={`${mic.sensitivity_dbv} dBV`} />
            <Spec label="Gain Demand" value={`~${mic.gain_demand_db} dB`} />
            <Spec label="Patterns" value={mic.patterns.join(', ')} />
            <Spec label="Phantom" value={mic.phantom ? '48V required' : 'Not needed'} />
          </Section>
          <Section title="Workflow Implications">
            <DescriptiveList title="Operational notes" items={mic.workflow_implications} tone="bg-zinc-800 text-zinc-300 border-zinc-700" />
          </Section>
          <Section title="Context Notes">
            <ContextTags tags={getContextTags(mic)} tone="bg-zinc-800 text-zinc-300 border-zinc-700" />
          </Section>
        </>
      )}

      {perspective === 'technical' && (
        <>
          <Section title="Electrical Specifications">
            <Spec label="Output Impedance" value={`${mic.output_z_ohm} Ω`} />
            {mic.resonant_z_ohm && <Spec label="Resonant Z" value={`${mic.resonant_z_ohm} Ω`} />}
            {mic.resonant_freq_hz && <Spec label="Resonant Freq" value={`${mic.resonant_freq_hz} Hz`} />}
            <Spec label="Sensitivity" value={`${mic.sensitivity_dbv} dBV/Pa`} />
            <Spec label="Patterns" value={mic.patterns.join(', ')} />
            <Spec label="Phantom Power" value={mic.phantom ? '48V DC' : 'None'} />
          </Section>
          <Section title="Engineering Notes">
            <p className="text-xs text-zinc-400 leading-relaxed">{mic.engineering}</p>
          </Section>
        </>
      )}
    </div>
  );
}

function PreampInspector({ pre, perspective }: { pre: Preamp; perspective: Perspective }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <GearImage id={pre.id} category="preamp" accent="#60a5fa" />
        <div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--sa-cream)' }}>{pre.name}</h3>
          <div className="text-xs text-zinc-500">
            {pre.vendor} · {pre.topology} · {pre.channels}ch
            {pre.input_z_hi && <span className="ml-1.5 inline-flex items-center rounded-[2px] border border-amber-700/30 bg-amber-950/20 px-1 text-[9px] font-medium text-amber-300">Hi-Z</span>}
          </div>
        </div>
      </div>

      <OverviewSection component={pre} perspective={perspective} />

      {perspective === 'musician' && (
        <Section title="Character">
          <div className="mt-2">
            <DescriptiveList title="Likely tendencies" items={pre.tendencies} tone="bg-blue-900/20 text-blue-300 border-blue-700/30" />
          </div>
          <div className="mt-2">
            <ContextTags tags={getContextTags(pre)} tone="bg-blue-900/20 text-blue-300 border-blue-700/30" />
          </div>
          <div className="mt-2">
            <DescriptiveList title="Tradeoffs" items={pre.tradeoffs} tone="bg-zinc-800 text-zinc-300 border-zinc-700" />
          </div>
        </Section>
      )}

      {perspective === 'engineer' && (
        <>
          <Section title="Signal Chain">
            <Spec label="Input Z" value={`${pre.input_z_ohm} Ω`} />
            {pre.input_z_hi && <Spec label="Instrument Z" value={`${pre.input_z_hi.toLocaleString()} Ω (Hi-Z)`} />}
            <Spec label="Output Z" value={`${pre.output_z_ohm} Ω`} />
            <Spec label="Gain Range" value={`${pre.gain_range_db[0]}–${pre.gain_range_db[1]} dB`} />
            <Spec label="Noise Floor" value={`${pre.noise_floor_db} dBu`} />
            <Spec label="Transformer" value={pre.has_transformer ? pre.transformer_model || 'Yes' : 'None'} />
          </Section>
          <Section title="Workflow Implications">
            <DescriptiveList title="Operational notes" items={pre.workflow_implications} tone="bg-zinc-800 text-zinc-300 border-zinc-700" />
          </Section>
          <Section title="Context Notes">
            <ContextTags tags={getContextTags(pre)} tone="bg-zinc-800 text-zinc-300 border-zinc-700" />
          </Section>
        </>
      )}

      {perspective === 'technical' && (
        <>
          <Section title="Electrical Specifications">
            <Spec label="Input Impedance" value={`${pre.input_z_ohm} Ω`} />
            {pre.input_z_hi && <Spec label="Instrument Input Z" value={`${pre.input_z_hi.toLocaleString()} Ω (Hi-Z / DI)`} />}
            <Spec label="Output Impedance" value={`${pre.output_z_ohm} Ω`} />
            <Spec label="Gain Range" value={`${pre.gain_range_db[0]}–${pre.gain_range_db[1]} dB`} />
            <Spec label="EIN / Noise Floor" value={`${pre.noise_floor_db} dBu`} />
            <Spec label="Transformer" value={pre.has_transformer ? (pre.transformer_model || 'Yes') : 'Transformerless'} />
            <Spec label="EM Zone" value={pre.em_zone} />
          </Section>
          <Section title="Engineering Notes">
            <p className="text-xs text-zinc-400 leading-relaxed">{pre.engineering}</p>
          </Section>
        </>
      )}
    </div>
  );
}

function CompInspector({ comp, perspective }: { comp: Compressor; perspective: Perspective }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <GearImage id={comp.id} category="compressor" accent="#c084fc" />
        <div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--sa-cream)' }}>{comp.name}</h3>
          <div className="text-xs text-zinc-500">{comp.vendor} · {comp.topology} · {comp.channels}ch</div>
        </div>
      </div>

      <OverviewSection component={comp} perspective={perspective} />

      {perspective === 'musician' && (
        <Section title="Character">
          <div className="mt-2">
            <DescriptiveList title="Likely tendencies" items={comp.tendencies} tone="bg-purple-900/20 text-purple-300 border-purple-700/30" />
          </div>
          <div className="mt-2">
            <ContextTags tags={getContextTags(comp)} tone="bg-purple-900/20 text-purple-300 border-purple-700/30" />
          </div>
          <div className="mt-2">
            <DescriptiveList title="Tradeoffs" items={comp.tradeoffs} tone="bg-zinc-800 text-zinc-300 border-zinc-700" />
          </div>
        </Section>
      )}

      {perspective === 'engineer' && (
        <>
          <Section title="Compression Controls">
            <Spec label="Detection" value={comp.detection} />
            <Spec label="Ratios" value={comp.ratios} />
            <Spec label="Attack" value={comp.attack_range} />
            <Spec label="Release" value={comp.release_range} />
            <Spec label="EM Zone" value={comp.em_zone} />
          </Section>
          <Section title="Workflow Implications">
            <DescriptiveList title="Operational notes" items={comp.workflow_implications} tone="bg-zinc-800 text-zinc-300 border-zinc-700" />
          </Section>
          <Section title="Context Notes">
            <ContextTags tags={getContextTags(comp)} tone="bg-zinc-800 text-zinc-300 border-zinc-700" />
          </Section>
        </>
      )}

      {perspective === 'technical' && (
        <>
          <Section title="Specifications">
            <Spec label="Detection" value={comp.detection} />
            <Spec label="Ratios" value={comp.ratios} />
            <Spec label="Sidechain" value={comp.sidechain ? 'Yes' : 'No'} />
            <Spec label="Link" value={comp.link ? 'Yes' : 'No'} />
            <Spec label="EM Zone" value={comp.em_zone} />
          </Section>
          <Section title="Engineering Notes">
            <p className="text-xs text-zinc-400 leading-relaxed">{comp.engineering}</p>
          </Section>
        </>
      )}
    </div>
  );
}

function EQInspector({ eq, perspective }: { eq: Equalizer; perspective: Perspective }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <GearImage id={eq.id} category="equalizer" accent="#2dd4bf" />
        <div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--sa-cream)' }}>{eq.name}</h3>
          <div className="text-xs text-zinc-500">{eq.vendor} · {eq.topology} · {eq.channels}ch</div>
        </div>
      </div>

      <OverviewSection component={eq} perspective={perspective} />

      {perspective === 'musician' && (
        <Section title="Character">
          <div className="mt-2">
            <DescriptiveList title="Likely tendencies" items={eq.tendencies} tone="bg-teal-900/20 text-teal-300 border-teal-700/30" />
          </div>
          <div className="mt-2">
            <ContextTags tags={getContextTags(eq)} tone="bg-teal-900/20 text-teal-300 border-teal-700/30" />
          </div>
          <div className="mt-2">
            <DescriptiveList title="Tradeoffs" items={eq.tradeoffs} tone="bg-zinc-800 text-zinc-300 border-zinc-700" />
          </div>
        </Section>
      )}

      {perspective === 'engineer' && (
        <>
          <Section title="EQ Details">
            <Spec label="Bands" value={eq.bands} />
            <Spec label="Input Z" value={`${eq.input_z_ohm} Ω`} />
            <Spec label="Output Z" value={`${eq.output_z_ohm} Ω`} />
            <Spec label="Transformer" value={eq.has_transformer ? eq.transformer_model || 'Yes' : 'None'} />
            <Spec label="EM Zone" value={eq.em_zone} />
          </Section>
          <Section title="Workflow Implications">
            <DescriptiveList title="Operational notes" items={eq.workflow_implications} tone="bg-zinc-800 text-zinc-300 border-zinc-700" />
          </Section>
          <Section title="Context Notes">
            <ContextTags tags={getContextTags(eq)} tone="bg-zinc-800 text-zinc-300 border-zinc-700" />
          </Section>
        </>
      )}

      {perspective === 'technical' && (
        <>
          <Section title="Electrical Specifications">
            <Spec label="Input Impedance" value={`${eq.input_z_ohm} Ω`} />
            <Spec label="Output Impedance" value={`${eq.output_z_ohm} Ω`} />
            <Spec label="Noise Floor" value={`${eq.noise_floor_db} dBu`} />
            <Spec label="Transformer" value={eq.has_transformer ? (eq.transformer_model || 'Yes') : 'Transformerless'} />
            <Spec label="EM Zone" value={eq.em_zone} />
          </Section>
          <Section title="Engineering Notes">
            <p className="text-xs text-zinc-400 leading-relaxed">{eq.engineering}</p>
          </Section>
        </>
      )}
    </div>
  );
}

function OutboardInspector({ proc, perspective }: { proc: OutboardProcessor; perspective: Perspective }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <GearImage id={proc.id} category="outboard" accent="#fb7185" />
        <div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--sa-cream)' }}>{proc.name}</h3>
          <div className="text-xs text-zinc-500">{proc.vendor} · {proc.type} · {proc.format} · {proc.channels}ch</div>
        </div>
      </div>

      <OverviewSection component={proc} perspective={perspective} />

      {perspective === 'musician' && (
        <Section title="Character">
          <div className="mt-2">
            <DescriptiveList title="Likely tendencies" items={proc.tendencies} tone="bg-rose-900/20 text-rose-300 border-rose-700/30" />
          </div>
          <div className="mt-2">
            <ContextTags tags={getContextTags(proc)} tone="bg-rose-900/20 text-rose-300 border-rose-700/30" />
          </div>
          <div className="mt-2">
            <DescriptiveList title="Tradeoffs" items={proc.tradeoffs} tone="bg-zinc-800 text-zinc-300 border-zinc-700" />
          </div>
        </Section>
      )}

      {perspective === 'engineer' && (
        <>
          <Section title="Processor Details">
            <Spec label="Type" value={proc.type} />
            <Spec label="Format" value={proc.format} />
            <Spec label="Signal Role" value={proc.routing_mode === 'parallel-send-return' ? 'Usually a parallel send-fed return processor' : 'Optional inline stereo processor'} />
            {proc.routing_mode === 'inline-optional' && <Spec label="Input Z" value={`${proc.input_z_ohm} Ω`} />}
            {proc.routing_mode === 'inline-optional' && <Spec label="Output Z" value={`${proc.output_z_ohm} Ω`} />}
            <Spec label="Transformer" value={proc.has_transformer ? 'Yes' : 'None'} />
            <Spec label="EM Zone" value={proc.em_zone} />
          </Section>
          <Section title="Workflow Implications">
            <DescriptiveList title="Operational notes" items={proc.workflow_implications} tone="bg-zinc-800 text-zinc-300 border-zinc-700" />
          </Section>
          <Section title="Context Notes">
            <ContextTags tags={getContextTags(proc)} tone="bg-zinc-800 text-zinc-300 border-zinc-700" />
          </Section>
        </>
      )}

      {perspective === 'technical' && (
        <>
          <Section title="Electrical Specifications">
            <Spec label="Signal Role" value={proc.routing_mode === 'parallel-send-return' ? 'Usually a parallel return processor' : 'Inline optional processor'} />
            {proc.routing_mode === 'inline-optional' && <Spec label="Input Impedance" value={`${proc.input_z_ohm} Ω`} />}
            {proc.routing_mode === 'inline-optional' && <Spec label="Output Impedance" value={`${proc.output_z_ohm} Ω`} />}
            <Spec label="Noise Floor" value={`${proc.noise_floor_db} dBu`} />
            <Spec label="EM Zone" value={proc.em_zone} />
          </Section>
          <Section title="Engineering Notes">
            <p className="text-xs text-zinc-400 leading-relaxed">{proc.engineering}</p>
          </Section>
        </>
      )}
    </div>
  );
}

function SummingNodeInspector({ node, perspective }: { node: SummingNode; perspective: Perspective }) {
  const zones = nodeZones.filter(z => z.node_id === node.id);
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const zone = zones.find(z => z.id === activeZone);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold" style={{ color: 'var(--sa-cream)' }}>{node.name}</h3>
        <div className="text-xs text-zinc-500">{node.vendor} · {roleLabel(node.role)}</div>
      </div>

      <Section title="Signal Flow Context">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--sa-cream-dim)' }}>
          {nodeConsequence(node, perspective)}
        </p>
      </Section>

      {/* Zone drill-down */}
      {zones.length > 0 && (
        <div className="space-y-2">
          <div className="text-silkscreen text-[8px]">Contained sections</div>
          <div className="flex gap-1.5">
            {zones.map(z => (
              <button
                key={z.id}
                type="button"
                onClick={() => setActiveZone(prev => prev === z.id ? null : z.id)}
                className="mat-recess rounded-[3px] border px-3 py-2 text-left transition-all cursor-pointer text-xs"
                style={{
                  borderColor: z.accent + (activeZone === z.id ? '60' : '25'),
                  backgroundColor: z.accent + (activeZone === z.id ? '15' : '06'),
                  color: activeZone === z.id ? 'var(--sa-cream)' : 'var(--sa-cream-dim)',
                }}
              >
                <div className="font-medium">{z.label}</div>
              </button>
            ))}
          </div>
          {zone && (
            <div
              className="mat-recess rounded-[3px] border p-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200"
              style={{ borderColor: zone.accent + '30', backgroundColor: zone.accent + '08' }}
            >
              <p className="text-sm leading-relaxed" style={{ color: 'var(--sa-cream-dim)' }}>
                {perspective === 'musician' ? zone.musician : perspective === 'engineer' ? zone.engineer : zone.technical}
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {zone.specs.map(s => (
                  <Spec key={s.label} label={s.label} value={s.value} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {perspective === 'musician' && !zone && (
        <Section title="Character">
          <p className="text-sm leading-relaxed text-zinc-300">{node.character}</p>
        </Section>
      )}

      {(perspective === 'engineer' || perspective === 'technical') && !zone && (
        <Section title="Electrical Specifications">
          {node.max_input_dbu !== null && <Spec label="Max Input" value={`+${node.max_input_dbu} dBu`} />}
          {node.max_output_dbu !== null && <Spec label="Max Output" value={`+${node.max_output_dbu} dBu`} />}
          {node.noise_floor_dbu !== null && <Spec label="Noise Floor" value={`${node.noise_floor_dbu} dBu`} />}
          {node.thd_percent !== null && <Spec label="THD" value={`${node.thd_percent}%`} />}
          {node.dynamic_range_db !== null && <Spec label="Dynamic Range" value={`${node.dynamic_range_db} dB`} />}
          <Spec label="Channels" value={`${node.input_channels} in / ${node.output_channels} out`} />
          <Spec label="Transformer" value={node.transformer_count > 0 ? `${node.transformer_count} transformer${node.transformer_count > 1 ? 's' : ''}` : 'Transformerless'} />
          {node.has_insert && <Spec label="Inserts" value="Per-channel + bus" />}
        </Section>
      )}

      {perspective === 'technical' && !zone && (
        <Section title="Engineering Notes">
          <p className="text-xs text-zinc-400 leading-relaxed">{node.engineering}</p>
        </Section>
      )}

      {(node.receives_from.length > 0 || node.feeds_into.length > 0) && (
        <Section title="Topology">
          {node.receives_from.length > 0 && (
            <div className="text-xs">
              <span className="text-zinc-600">Receives from</span>
              <span className="ml-2" style={{ color: 'var(--sa-cream-dim)' }}>
                {node.receives_from.map(id => cascadeNodes.find(n => n.id === id)?.name ?? id).join(', ')}
              </span>
            </div>
          )}
          {node.feeds_into.length > 0 && (
            <div className="text-xs">
              <span className="text-zinc-600">Feeds</span>
              <span className="ml-2" style={{ color: 'var(--sa-cream-dim)' }}>
                {node.feeds_into.map(id => cascadeNodes.find(n => n.id === id)?.name ?? id).join(', ')}
              </span>
            </div>
          )}
        </Section>
      )}
    </div>
  );
}

function MonitorSpeakerInspector({ speaker, perspective }: { speaker: MonitorSpeaker; perspective: Perspective }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold" style={{ color: 'var(--sa-cream)' }}>{speaker.name}</h3>
        <div className="text-xs text-zinc-500">{speaker.vendor} · {speaker.driver_config}</div>
      </div>

      <Section title={perspective === 'technical' ? 'Engineering' : 'Character'}>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--sa-cream-dim)' }}>
          {perspective === 'technical' ? speaker.engineering : speaker.character}
        </p>
      </Section>

      <Section title="Specifications">
        <Spec label="Type" value={speaker.type === 'passive' ? 'Passive' : 'Active'} />
        <Spec label="Driver Config" value={speaker.driver_config} />
        <Spec label="Frequency Range" value={`${speaker.freq_range_hz[0]} Hz – ${speaker.freq_range_hz[1] >= 1000 ? `${speaker.freq_range_hz[1] / 1000}k` : speaker.freq_range_hz[1]} Hz`} />
        {speaker.amplifier && <Spec label="Amplifier" value={speaker.amplifier} />}
      </Section>

      <Section title="Use Case">
        <p className="text-sm italic leading-relaxed" style={{ color: 'var(--sa-cream-dim)' }}>
          {speaker.use_case}
        </p>
      </Section>
    </div>
  );
}

export default function ComponentInspector({ perspective, inspectedId, onInspect, onClose }: Props) {
  if (!inspectedId) {
    return (
      <div className="p-4 text-sm text-zinc-500">
        Select a component to inspect. Information adapts to your current perspective.
      </div>
    );
  }

  // Try to find the item across all registries
  const mic = microphones.find(m => m.id === inspectedId);
  const pre = preamps.find(p => p.id === inspectedId);
  const comp = compressors.find(c => c.id === inspectedId);
  const eq = equalizers.find(e => e.id === inspectedId);
  const outboard = outboardProcessors.find(o => o.id === inspectedId);
  const cascadeNode = cascadeNodes.find(n => n.id === inspectedId);
  const speaker = monitorSpeakers.find(s => s.id === inspectedId);
  const inspectable = mic ?? pre ?? comp ?? eq ?? outboard;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-silkscreen text-[8px]">
          {mic ? 'Microphone' : pre ? 'Preamp' : comp ? 'Compressor' : eq ? 'Equalizer' : outboard ? 'Outboard' : cascadeNode ? 'Signal Path' : speaker ? 'Monitor' : 'Component'}
        </span>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-zinc-300 text-xs"
        >
          ✕ Close
        </button>
      </div>

      {mic && <MicInspector mic={mic} perspective={perspective} />}
      {pre && <PreampInspector pre={pre} perspective={perspective} />}
      {comp && <CompInspector comp={comp} perspective={perspective} />}
      {eq && <EQInspector eq={eq} perspective={perspective} />}
      {outboard && <OutboardInspector proc={outboard} perspective={perspective} />}
      {cascadeNode && <SummingNodeInspector node={cascadeNode} perspective={perspective} />}
      {speaker && <MonitorSpeakerInspector speaker={speaker} perspective={perspective} />}
      {inspectable && <AlternativeSection component={inspectable} onInspect={onInspect} />}

      {!mic && !pre && !comp && !eq && !outboard && !cascadeNode && !speaker && (
        <div className="text-sm text-zinc-500">Component not found: {inspectedId}</div>
      )}
    </div>
  );
}
