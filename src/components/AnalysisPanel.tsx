import { useRef, useState } from 'react';
import type {
  ChainAnalysis,
  InsertProcessor,
  Microphone,
  ParallelProcessor,
  Perspective,
  PerspectiveInsightModel,
  Preamp,
  RouteSummaryModel,
  StudioMode,
  MixPathModel,
} from '../types/studio';

interface Props {
  perspective: Perspective;
  mode: StudioMode;
  analysis: ChainAnalysis | null;
  routeSummary: RouteSummaryModel;
  perspectiveInsight: PerspectiveInsightModel;
  selectedMic: Microphone | null;
  selectedPreamp: Preamp | null;
  insertChain: InsertProcessor[];
  parallelChain: ParallelProcessor[];
  mixSessionTrackCount: number;
  mixPaths: MixPathModel[];
  onClearChain: () => void;
}

// ── Narrative generators ──
// These mine the actual equipment data to build perspective-specific insight.

function musicianNarrative(mic: Microphone, pre: Preamp, inserts: InsertProcessor[]): string[] {
  const lines: string[] = [];

  // Mic → preamp sonic character fusion
  lines.push(`Starting with the ${mic.name} — ${mic.character.split('.')[0].toLowerCase().trim()}. Into the ${pre.name}, which ${pre.character.split('.')[0].toLowerCase().trim()}.`);

  // What the combination creates
  const micIsWarm = /warm|thick|rich|weight|tube|vintage|mojo/i.test(mic.character);
  const preIsWarm = /warm|thick|rich|weight|tube|vintage|mojo/i.test(pre.character);
  const micIsClear = /clear|transparent|neutral|detailed|pristine|clean|accurate/i.test(mic.character);
  const preIsClear = /clear|transparent|neutral|detailed|pristine|clean|accurate/i.test(pre.character);
  const micIsColorful = /color|punch|aggressive|grit|character|bite|forward/i.test(mic.character);
  const preIsColorful = /color|punch|aggressive|grit|character|bite|forward/i.test(pre.character);

  if (micIsWarm && preIsWarm) {
    lines.push('This combination stacks warmth on warmth — expect a lush, harmonically rich signal with dimensional depth. Great when you want the recording to sound like a record from the first stage.');
  } else if (micIsClear && preIsClear) {
    lines.push('Both stages are transparent — the source will come through honest and uncolored. This chain lets the performance speak without editorial from the gear.');
  } else if (micIsWarm && preIsClear) {
    lines.push('The mic brings character and body while the preamp stays out of the way — the warmth is captured cleanly. You get the vintage texture without it becoming muddy or over-saturated.');
  } else if (micIsClear && preIsWarm) {
    lines.push('The mic captures detail faithfully, then the preamp wraps it in warmth — like shooting in high-res then applying a beautiful film stock. Definition with soul.');
  } else if (micIsColorful || preIsColorful) {
    lines.push('There\'s real personality in this chain — it\'s going to impart a sound of its own. Lean into it. This is gear that wants to be heard, not hidden.');
  } else {
    lines.push('A balanced pairing — neither stage dominates the other. The result should be musical and controlled with good tonal integrity.');
  }

  // Insert chain sonic story
  if (inserts.length > 0) {
    const insertNames = inserts.map(p => p.item.name);
    const insertCharacters = inserts.map(p => p.item.character.split('.')[0].toLowerCase().trim());

    if (inserts.length === 1) {
      lines.push(`Through the ${insertNames[0]} — ${insertCharacters[0]}. ${inserts[0].type === 'compressor' ? 'The dynamics processing will shape how the performance breathes and moves.' : inserts[0].type === 'equalizer' || inserts[0].type === 'preamp-eq' ? 'The EQ stage gives you tonal control before the signal hits the converter.' : 'The outboard processing adds a dimension that plugins can\'t quite replicate.'}`);
    } else {
      lines.push(`The insert chain runs through ${insertNames.join(' → ')}. Each stage adds its voice — ${insertCharacters.slice(0, 2).join(', then ')}. ${inserts.length >= 3 ? 'That\'s a lot of analog stages coloring the signal — this is going to have a very distinct, produced sound before it ever reaches the DAW.' : 'Two stages of analog processing gives you options without over-cooking.'}`);
    }
  }

  return lines;
}

function engineerNarrative(mic: Microphone, pre: Preamp, inserts: InsertProcessor[], analysis: ChainAnalysis): string[] {
  const lines: string[] = [];

  // Impedance bridging practical note
  if (analysis.bridging_assessment === 'transparent') {
    lines.push(`Clean impedance match — ${mic.name} into ${pre.name} at ${analysis.bridging_ratio.toFixed(1)}:1. No coloration from the electrical interface.`);
  } else if (analysis.bridging_assessment === 'minimal') {
    lines.push(`Good impedance bridging at ${analysis.bridging_ratio.toFixed(1)}:1. Slight bass proximity interaction possible with ${mic.type === 'Ribbon' ? 'the ribbon\'s resonant impedance' : 'this mic'}, but well within professional norms.`);
  } else if (analysis.bridging_assessment === 'audible') {
    lines.push(`⚠ Impedance bridging at ${analysis.bridging_ratio.toFixed(1)}:1 is audibly coloring the signal. The ${mic.name} wants a higher-impedance input — you'll hear rolled-off highs and accentuated proximity effect. ${pre.input_z_ohm < 2000 ? 'If the preamp has a Hi-Z switch, try it.' : 'Consider this an intentional tonal choice if you like the color.'}`);
  } else {
    lines.push(`⚠ Significant impedance mismatch at ${analysis.bridging_ratio.toFixed(1)}:1. The ${mic.name} is being loaded heavily — expect substantial tonal alteration and possible transient smearing. This is a creative choice, not a transparent one.`);
  }

  // Gain staging
  const gainNeeded = mic.gain_demand_db;
  const gainAvail = pre.gain_range_db;
  if (gainNeeded > gainAvail[1] - 10) {
    lines.push(`⚠ Tight gain margin — the ${mic.name} demands ~${gainNeeded}dB and the ${pre.name} tops at ${gainAvail[1]}dB. On quiet sources, you may run out of clean gain. Consider padding or a quieter mic alternative.`);
  } else if (gainNeeded < gainAvail[0] + 5) {
    lines.push(`Gain-wise, the ${mic.name} is hot enough that you'll barely need the ${pre.name}'s gain — great for preserving headroom. Watch output levels on loud sources.`);
  } else {
    lines.push(`Clean gain range — ${mic.name} needs ~${gainNeeded}dB, the ${pre.name} delivers ${gainAvail[0]}–${gainAvail[1]}dB with room to spare.`);
  }

  // Transformer cascade awareness
  const xfmrCount = (pre.has_transformer ? 1 : 0) + inserts.filter(p => {
    if (p.type === 'equalizer') return p.item.has_transformer;
    if (p.type === 'preamp-eq') return p.item.has_transformer;
    if (p.type === 'outboard') return p.item.has_transformer;
    return false; // compressors — assume transformer for now
  }).length;

  if (xfmrCount >= 3) {
    lines.push(`${xfmrCount} transformer stages in this chain — that's a lot of iron. Expect cumulative saturation, bandwidth narrowing, and phase accumulation at HF. This is the "big analog" sound, but make sure it's intentional.`);
  } else if (xfmrCount === 2) {
    lines.push(`Two transformer stages — enough iron to add harmonic texture without excessive phase shift. A good balance of color and fidelity.`);
  }

  // Insert order wisdom
  if (inserts.length >= 2) {
    const hasComp = inserts.some(p => p.type === 'compressor');
    const hasEQ = inserts.some(p => p.type === 'equalizer' || p.type === 'preamp-eq');
    const compFirst = inserts.findIndex(p => p.type === 'compressor') < inserts.findIndex(p => p.type === 'equalizer' || p.type === 'preamp-eq');

    if (hasComp && hasEQ) {
      if (compFirst) {
        lines.push('Compressor before EQ — the dynamics are reacting to the raw signal. EQ changes won\'t affect compression behavior. Classic "fix it after you control it" approach.');
      } else {
        lines.push('EQ before compressor — the compressor reacts to your tonal shaping. Boosting frequencies will cause more compression in those bands. Use this intentionally for de-essing, presence control, or tonal compression.');
      }
    }
  }

  // EM zone awareness
  const zones = [pre.em_zone, ...inserts.map(p => {
    if (p.type === 'equalizer' || p.type === 'outboard') return p.item.em_zone;
    return p.item.em_zone;
  })];
  const zoneACount = zones.filter(z => z === 'A').length;
  if (zoneACount >= 2) {
    lines.push(`${zoneACount} pieces in EM Zone A — significant magnetic fields. Watch for hum pickup if these are racked close together. Consider physical separation or cable routing to minimize interference.`);
  }

  return lines;
}

function technicalNarrative(mic: Microphone, pre: Preamp, inserts: InsertProcessor[], analysis: ChainAnalysis): string[] {
  const lines: string[] = [];

  // Impedance analysis
  lines.push(`Impedance: Z_source=${mic.output_z_ohm}Ω → Z_load=${pre.input_z_ohm}Ω. Bridging ratio ${analysis.bridging_ratio.toFixed(2)}:1. Voltage transfer ${analysis.voltage_transfer_pct.toFixed(2)}% (${analysis.loss_db.toFixed(3)}dB loss).`);

  if (mic.resonant_z_ohm) {
    const resonantRatio = pre.input_z_ohm / mic.resonant_z_ohm;
    lines.push(`Resonant impedance: ${mic.resonant_z_ohm}Ω at ${mic.resonant_freq_hz}Hz. Effective bridging drops to ${resonantRatio.toFixed(1)}:1 at resonance — ${resonantRatio < 5 ? 'expect notable bass coloration from impedance loading' : 'within acceptable range'}.`);
  }

  // Cascaded noise analysis
  const stageCount = 1 + inserts.length; // preamp + inserts
  lines.push(`Signal path: ${stageCount} active stage${stageCount > 1 ? 's' : ''}. Cascaded noise floor: ${analysis.cumulative_noise_db.toFixed(1)}dBu. ${analysis.cumulative_noise_db < -120 ? 'Noise contribution negligible relative to mic self-noise.' : analysis.cumulative_noise_db < -110 ? 'Noise floor is professional-grade but approaching audibility on very quiet sources.' : 'Elevated noise floor — may be audible on quiet passages with high-gain settings.'}`);

  // Bandwidth and phase
  lines.push(`Effective bandwidth: ${analysis.effective_bw_khz.toFixed(1)}kHz (-3dB). Bandwidth shrinkage factor: ${analysis.bandwidth_shrinkage.toFixed(3)}×. Cumulative THD estimate: ${analysis.thd_estimate_pct.toFixed(4)}%.`);

  const xfmrCount = (pre.has_transformer ? 1 : 0) + inserts.filter(p => {
    if (p.type === 'equalizer') return p.item.has_transformer;
    if (p.type === 'preamp-eq') return p.item.has_transformer;
    if (p.type === 'outboard') return p.item.has_transformer;
    return false;
  }).length;

  lines.push(`Transformer count: ${xfmrCount}. Phase accumulation at 20kHz: ~${analysis.phase_shift_deg_20khz.toFixed(1)}°. ${xfmrCount >= 3 ? 'Multiple transformer stages will produce measurable group delay and HF rolloff — characteristic of heavily ironed analog chains.' : xfmrCount >= 1 ? 'Transformer coloration present but within single-stage norms.' : 'No transformer coloration — phase response remains linear.'}`);

  // Insert impedance chain
  if (inserts.length > 0) {
    const izNotes = inserts.map(p => {
      if (p.type === 'equalizer') return `${p.item.name}: Z_in=${p.item.input_z_ohm}Ω, Z_out=${p.item.output_z_ohm}Ω, noise=${p.item.noise_floor_db}dBu`;
      if (p.type === 'preamp-eq') return `${p.item.name} EQ section: Z_in=${p.item.input_z_ohm}Ω, Z_out=${p.item.output_z_ohm}Ω, noise=${p.item.noise_floor_db}dBu`;
      if (p.type === 'outboard') return `${p.item.name}: Z_in=${p.item.input_z_ohm}Ω, Z_out=${p.item.output_z_ohm}Ω, noise=${p.item.noise_floor_db}dBu`;
      return `${p.item.name}: (compressor — impedance specs not yet characterized)`;
    });
    lines.push(`Insert stages: ${izNotes.join(' → ')}.`);
  }

  // Analysis engine warnings/notes
  analysis.warnings.forEach(w => lines.push(`⚠️ ${w}`));
  analysis.notes.forEach(n => lines.push(n));

  return lines;
}

function parallelSummary(parallelChain: ParallelProcessor[]): string | null {
  if (parallelChain.length === 0) return null;
  return parallelChain.map((proc) => `${proc.item.name} via ${proc.routing.return_destination_label}`).join(' + ');
}

function parallelNarrative(perspective: Perspective, parallelChain: ParallelProcessor[]): string[] {
  if (parallelChain.length === 0) return [];

  if (perspective === 'musician') {
    return parallelChain.map((proc) => `In parallel, ${proc.item.name} is tapped from ${proc.routing.send_source_label} and blended back through ${proc.routing.return_destination_label}, so its character supplements the dry chain instead of replacing it.`);
  }

  if (perspective === 'engineer') {
    return parallelChain.map((proc) => `Parallel path: ${proc.item.name} is fed from ${proc.routing.send_source_label} and returns via ${proc.routing.return_destination_label}. The original source path remains intact while this branch adds supplemental texture, space, or control.`);
  }

  return parallelChain.map((proc) => `Parallel branch: ${proc.item.name} taps ${proc.routing.send_source_label} and resolves at ${proc.routing.return_destination_label}. It does not alter the primary mic → preamp → insert electrical path; it creates a secondary line-level branch that is summed alongside it.`);
}

function directionalOverview(
  selectedMic: Microphone | null,
  selectedPreamp: Preamp | null,
  insertChain: InsertProcessor[],
  parallelChain: ParallelProcessor[]
): string | null {
  const parts: string[] = [];

  if (selectedMic) {
    parts.push(selectedMic.name);
  }

  if (selectedPreamp) {
    parts.push(selectedPreamp.name);
  }

  if (insertChain.length > 0) {
    parts.push(...insertChain.map((processor) => processor.item.name));
  }

  if (parallelChain.length > 0) {
    parts.push(`${parallelChain.length} parallel ${parallelChain.length === 1 ? 'branch' : 'branches'}`);
  }

  return parts.length > 0 ? parts.join(' → ') : null;
}

export default function AnalysisPanel({
  perspective, mode, analysis, routeSummary, perspectiveInsight, selectedMic, selectedPreamp, insertChain, parallelChain, mixSessionTrackCount, mixPaths, onClearChain,
}: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [showRouteNotes, setShowRouteNotes] = useState(false);
  const [showNarrativeDetails, setShowNarrativeDetails] = useState(false);
  const hasRouteNotes =
    routeSummary.deviations.length > 0 ||
    routeSummary.validation_issues.length > 0 ||
    routeSummary.available_next_actions.length > 0;
  const overview = directionalOverview(selectedMic, selectedPreamp, insertChain, parallelChain);
  const hasMixSession = mode === 'mixing' && mixPaths.length > 0;

  if ((!analysis || !selectedMic || !selectedPreamp) && hasMixSession) {
    return (
      <div className="mat-brushed-dark rounded-[3px] border border-zinc-800/20">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex w-full items-center gap-2 px-3 py-1.5 text-left"
        >
          <span className="text-silkscreen-faint text-[8px]">Mix session</span>
          <span className="min-w-0 flex-1 truncate text-[10px] text-zinc-400">{routeSummary.headline}</span>
        </button>
        {expanded && (
          <div className="border-t border-zinc-800/20 px-3 py-2 space-y-2">
            <p className="text-[11px] leading-relaxed text-zinc-300">{perspectiveInsight.summary}</p>
            <div className="text-[11px] text-zinc-500">{routeSummary.viability_flag.reason}</div>
            <div className="text-[10px] text-zinc-500">{mixSessionTrackCount} active analog route{mixSessionTrackCount === 1 ? '' : 's'} instantiated from the DAW.</div>
            {routeSummary.active_path.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 text-[10px] text-zinc-400">
                {routeSummary.active_path.map((stage, index) => (
                  <span key={stage.id} className="contents">
                    {index > 0 && <span className="text-zinc-600">→</span>}
                    <span className="rounded-[2px] border border-zinc-800/20 mat-recess px-1.5 py-0.5">{stage.label}</span>
                  </span>
                ))}
              </div>
            )}
            {routeSummary.deviations.length > 0 && (
              <div className="space-y-1">
                {routeSummary.deviations.map((deviation) => (
                  <p key={deviation} className="text-[11px] text-zinc-500">{deviation}</p>
                ))}
              </div>
            )}
            {routeSummary.available_next_actions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {routeSummary.available_next_actions.slice(0, 3).map((action) => (
                  <span key={action} className="text-[9px] px-1.5 py-0.5 rounded-[2px] border border-zinc-800/20 mat-recess text-zinc-400">{action}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (!analysis || !selectedMic || !selectedPreamp) {
    if (!overview) {
      // Nothing selected at all — show the monitor path as starting context
      const prompt = mode === 'mixing'
        ? 'The summing and print path is standing by below.'
        : 'Choose a microphone to begin building a capture path.';
      return (
        <div className="mat-brushed-dark rounded-[3px] border border-zinc-800/20">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left"
          >
            <span className="text-silkscreen-faint text-[8px]">Listening through</span>
            <span className="min-w-0 flex-1 truncate text-[10px] text-zinc-500">DAW → Aurora(n) → D-Box+ → Speakers</span>
          </button>
          {expanded && (
            <div className="border-t border-zinc-800/20 px-3 py-2 text-[11px] leading-relaxed" style={{ color: 'var(--sa-cream-dim)' }}>
              DAW → Thunderbolt → Aurora(n) → AES → D-Box+ → Speakers. <span className="text-zinc-500">The monitor path is digital from DAW to D-Box+. {prompt}</span>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="mat-brushed-dark rounded-[3px] border border-zinc-800/20">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex w-full items-center gap-2 px-3 py-1.5 text-left"
        >
          <span className="text-silkscreen-faint text-[8px]">Building route</span>
          <span className="min-w-0 flex-1 truncate text-[10px] text-zinc-500">{overview}</span>
        </button>
        {expanded && (
          <div className="border-t border-zinc-800/20 px-3 py-2">
            {selectedMic && !selectedPreamp && (
              <div className="text-[10px] text-zinc-500 leading-relaxed">
                {selectedMic.character.split('.')[0]}. Choose a preamp to complete the gain stage.
              </div>
            )}
            {(selectedMic || selectedPreamp || insertChain.length > 0 || parallelChain.length > 0) && (
              <button onClick={onClearChain} className="mt-2 shrink-0 mat-recess rounded-[3px] border border-zinc-800/20 px-2.5 py-1 text-silkscreen-faint text-[8px] hover:text-zinc-300">
                Clear
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  const narrativeLines = perspective === 'musician'
    ? musicianNarrative(selectedMic, selectedPreamp, insertChain)
    : perspective === 'engineer'
    ? engineerNarrative(selectedMic, selectedPreamp, insertChain, analysis)
    : technicalNarrative(selectedMic, selectedPreamp, insertChain, analysis);
  const leadNarrative = narrativeLines[0];
  const supportingNarrative = narrativeLines.slice(1);

  const perspectiveLabels: Record<Perspective, string> = {
    musician: 'What this chain feels like',
    engineer: 'What matters in the route',
    technical: 'Electrical readout',
  };

  const perspectiveAccents: Record<Perspective, string> = {
    musician: 'border-emerald-700/30 bg-emerald-950/12',
    engineer: 'border-red-700/30 bg-red-950/12',
    technical: 'border-amber-700/30 bg-amber-950/12',
  };

  const textAccents: Record<Perspective, string> = {
    musician: 'text-emerald-300',
    engineer: 'text-red-300',
    technical: 'text-amber-300',
  };

  const parallelLines = parallelNarrative(perspective, parallelChain);
  const parallelPathSummary = parallelSummary(parallelChain);

  return (
    <div ref={panelRef} className="mat-brushed-dark border-t border-zinc-800/20">
      {/* Compact summary bar — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-3 py-2 sm:px-4 text-left hover:bg-zinc-800/10 transition-colors"
      >
        <div className={`text-[10px] font-medium uppercase tracking-[0.22em] shrink-0 ${textAccents[perspective]}`}>{perspectiveLabels[perspective]}</div>
        <div className="min-w-0 flex-1 truncate text-[11px] text-zinc-400">{routeSummary.headline}</div>
        <svg className={`shrink-0 w-3 h-3 text-zinc-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="2,4 6,8 10,4" /></svg>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2.5 max-h-[36vh] overflow-y-auto sm:max-h-52 sm:px-4">
      {/* Gain margin + viability */}
      {routeSummary.gain_margin_summary && <div className="text-[11px] text-zinc-400">{routeSummary.gain_margin_summary}</div>}
      {routeSummary.viability_flag.level === 'caution' && (
        <div className="mat-recess rounded-[3px] border px-2.5 py-1.5 text-[11px] text-yellow-300 border-yellow-800/20">
          {routeSummary.viability_flag.reason}
        </div>
      )}

      {parallelPathSummary && <div className="text-[11px] text-cyan-300/90">Parallel: {parallelPathSummary}</div>}

      {/* Perspective narrative */}
      <div className={`mat-recess rounded-[3px] border p-3 space-y-2 ${perspectiveAccents[perspective]}`}>
          <div className="text-silkscreen-faint text-[8px]">First reading</div>
          <p className={`text-sm leading-relaxed ${textAccents[perspective]}`}>{leadNarrative}</p>
          <p className="text-[11px] leading-relaxed text-zinc-400">{perspectiveInsight.summary}</p>
          {parallelLines.length > 0 && (
            <div className="mat-recess rounded-[3px] border border-cyan-800/20 px-2.5 py-2 text-[11px] leading-relaxed text-cyan-100/90">
              {parallelLines[0]}
            </div>
          )}
          {(supportingNarrative.length > 0 || parallelLines.length > 1) && (
            <button
              onClick={() => setShowNarrativeDetails((value) => !value)}
              className="text-silkscreen-faint text-[8px] hover:text-zinc-300 mat-recess border border-zinc-800/20 rounded-[3px] px-2.5 py-1"
            >
              {showNarrativeDetails ? 'Less detail' : 'More detail'}
            </button>
          )}
        </div>

      {showNarrativeDetails && (supportingNarrative.length > 0 || parallelLines.length > 1) && (
        <div className={`mat-recess rounded-[3px] border p-3 space-y-2 ${perspectiveAccents[perspective]}`}>
          {supportingNarrative.map((line, i) => (
            <p key={i} className="text-sm leading-relaxed text-zinc-300">{line}</p>
          ))}
          {parallelLines.slice(1).map((line) => (
            <p key={line} className="text-sm leading-relaxed text-cyan-100/90">{line}</p>
          ))}
        </div>
      )}

      {hasRouteNotes && (
        <div>
          <button
            onClick={() => setShowRouteNotes((value) => !value)}
            className="text-silkscreen-faint text-[8px] hover:text-zinc-300 mat-recess border border-zinc-800/20 rounded-[3px] px-2.5 py-1"
          >
            {showRouteNotes ? 'Hide route trace' : 'Show route trace'}
          </button>
        </div>
      )}

      {showRouteNotes && hasRouteNotes && (
        <div className="mat-recess rounded-[3px] border border-zinc-800/20 px-3 py-3 space-y-2">
            {routeSummary.active_path.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 text-[10px] text-zinc-400">
                {routeSummary.active_path.map((stage, index) => (
                  <span key={stage.id} className="contents">
                    {index > 0 && <span className="text-zinc-600">→</span>}
                    <span className="rounded-[2px] border border-zinc-800/20 mat-recess px-1.5 py-0.5">{stage.label}</span>
                  </span>
                ))}
              </div>
            )}
            {routeSummary.parallel_paths.length > 0 && (
              <div className="space-y-1">
                {routeSummary.parallel_paths.map((path, index) => (
                  <div key={`parallel-${index}`} className="flex flex-wrap items-center gap-1 text-[10px] text-cyan-300/90">
                    <span className="text-cyan-500 uppercase tracking-wide">Parallel</span>
                    {path.map((stage, stageIndex) => (
                      <span key={stage.id} className="contents">
                        {stageIndex > 0 && <span className="text-cyan-700">→</span>}
                        <span className="rounded-[2px] border border-cyan-900/30 mat-recess px-1.5 py-0.5">{stage.label}</span>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {routeSummary.deviations.length > 0 && (
              <div className="space-y-1">
                {routeSummary.deviations.map((deviation) => (
                  <p key={deviation} className="text-[11px] text-zinc-500">{deviation}</p>
                ))}
              </div>
            )}
            {routeSummary.validation_issues.length > 0 && (
              <div className="space-y-1">
                {routeSummary.validation_issues.slice(0, 2).map((issue) => (
                  <p key={`${issue.code}-${issue.message}`} className="text-[11px] text-zinc-500">
                    {issue.suggested_action ? `${issue.message} ${issue.suggested_action}` : issue.message}
                  </p>
                ))}
              </div>
            )}
            {routeSummary.available_next_actions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {routeSummary.available_next_actions.slice(0, 3).map((action) => (
                  <span key={action} className="text-[9px] px-1.5 py-0.5 rounded-[2px] border border-zinc-800/20 mat-recess text-zinc-400">{action}</span>
                ))}
              </div>
            )}
        </div>
      )}

      {analysis.warnings.length > 0 && perspective !== 'technical' && (
        <div className="space-y-1">
          {analysis.warnings.map((w, i) => (
            <div key={i} className="text-[11px] text-yellow-300 mat-recess border border-yellow-700/15 rounded-[3px] px-2.5 py-2">
              ⚠ {w}
            </div>
          ))}
        </div>
      )}

      <button onClick={onClearChain} className="text-silkscreen-faint text-[8px] hover:text-zinc-300 mat-recess border border-zinc-800/20 rounded-[3px] px-2.5 py-1 shrink-0">
        Clear chain
      </button>
        </div>
      )}
    </div>
  );
}
