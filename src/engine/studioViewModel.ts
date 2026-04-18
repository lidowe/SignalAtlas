import type {
  ChainAnalysis,
  Compressor,
  Equalizer,
  InsertProcessor,
  Microphone,
  OutboardProcessor,
  ParallelProcessor,
  Perspective,
  PerspectiveInsightModel,
  Preamp,
  RouteStageSummary,
  RouteSummaryModel,
  RouteValidationIssue,
} from '../types/studio';

type DescribedComponent = Microphone | Preamp | Compressor | Equalizer | OutboardProcessor;

export function getContextTags(component: DescribedComponent): string[] {
  if (component.context_tags && component.context_tags.length > 0) {
    return component.context_tags;
  }

  return component.best_for;
}

function buildActivePath(
  mic: Microphone | null,
  preamp: Preamp | null,
  inserts: InsertProcessor[]
): RouteStageSummary[] {
  const path: RouteStageSummary[] = [];

  if (mic) {
    path.push({
      id: mic.id,
      label: mic.name,
      type: 'microphone',
      detail: `${mic.type} source`,
    });
  }

  if (preamp) {
    path.push({
      id: preamp.id,
      label: preamp.name,
      type: 'preamp',
      detail: `${preamp.topology} preamp`,
    });
  }

  if (inserts.length > 0) {
    path.push({
      id: 'insert-chain',
      label: inserts.map((insert) => insert.item.name).join(' -> '),
      type: 'insert-chain',
      detail: `${inserts.length} analog stage${inserts.length === 1 ? '' : 's'}`,
    });
  }

  return path;
}

function buildParallelPaths(parallelProcessors: ParallelProcessor[]): RouteStageSummary[][] {
  return parallelProcessors.map((processor, index) => ([
    {
      id: `parallel-send-${index}`,
      label: processor.routing.send_source_label,
      type: 'insert-chain',
      detail: index === 0 ? 'Parallel tap from the direct path' : `Parallel tap ${index + 1}`,
    },
    {
      id: processor.item.id,
      label: processor.item.name,
      type: processor.type === 'compressor' ? 'compressor' : 'outboard',
      detail: processor.type === 'compressor' ? 'Parallel dynamics branch' : 'Parallel effects or color branch',
    },
    {
      id: `parallel-return-${index}`,
      label: processor.routing.return_destination_label,
      type: 'insert-chain',
      detail: processor.routing.blend_stage === 'direct-return'
        ? 'Returned directly to a blend destination'
        : 'Summed through the Pueblo open bus before rejoining the mix path',
    },
  ]));
}

function buildGainMarginSummary(mic: Microphone | null, preamp: Preamp | null): string | undefined {
  if (!mic || !preamp) return undefined;

  const margin = preamp.gain_range_db[1] - mic.gain_demand_db;
  if (margin < 0) return `${Math.abs(margin).toFixed(0)}dB short of clean gain at maximum setting`;
  if (margin <= 5) return `${margin.toFixed(0)}dB headroom remaining — tight margin on quiet sources`;
  if (margin <= 15) return `${margin.toFixed(0)}dB headroom remaining — workable with moderate care`;
  return `${margin.toFixed(0)}dB headroom remaining — comfortable gain range`;
}

export function buildRouteSummary(
  mic: Microphone | null,
  preamp: Preamp | null,
  inserts: InsertProcessor[],
  parallelProcessors: ParallelProcessor[],
  analysis: ChainAnalysis | null,
  _validationIssues: RouteValidationIssue[] = []
): RouteSummaryModel {
  const active_path = buildActivePath(mic, preamp, inserts);
  const parallel_paths = buildParallelPaths(parallelProcessors);
  const gain_margin_summary = buildGainMarginSummary(mic, preamp);

  // ── Default continuation after the user's selections ──
  const defaultContinuation = 'API Mix A bus → AD+ converter → DAW';

  // ── Nothing selected ──
  if (!mic && !preamp) {
    return {
      status: 'incomplete',
      headline: 'No source selected',
      viability_flag: { level: 'ok', reason: `Default path: mic tie → preamp → ${defaultContinuation}.` },
      validation_issues: [],
      active_path,
      parallel_paths,
      deviations: [],
      available_next_actions: ['Choose a microphone'],
    };
  }

  // ── Mic only ──
  if (mic && !preamp) {
    return {
      status: 'incomplete',
      headline: `${mic.name} → preamp → ${defaultContinuation}`,
      viability_flag: { level: 'ok', reason: `${mic.name} is selected. Next stage is a preamp to bring the signal to line level, then the default path continues to the converter.` },
      gain_margin_summary: undefined,
      validation_issues: [],
      active_path,
      parallel_paths,
      deviations: [],
      available_next_actions: ['Choose a preamp'],
    };
  }

  // ── Build path description ──
  const micLabel = mic?.name ?? 'source';
  const preLabel = preamp?.name ?? 'preamp';
  const deviations: string[] = [];

  if (inserts.length > 0) {
    deviations.push(`${inserts.length} insert stage${inserts.length === 1 ? '' : 's'} before the mix bus`);
  }
  if (parallelProcessors.length > 0) {
    deviations.push(`${parallelProcessors.length} parallel ${parallelProcessors.length === 1 ? 'path supplements' : 'paths supplement'} the direct chain`);
  }

  const insertArrow = inserts.length > 0
    ? ` → ${inserts.map(i => i.item.name).join(' → ')}`
    : '';

  const headline = `${micLabel} → ${preLabel}${insertArrow} → ${defaultContinuation}`;

  const stageCount = 2 + inserts.length; // mic + preamp + inserts
  const reason = inserts.length > 0
    ? `${stageCount} analog stages before conversion. Insert chain extends the default normalled path.`
    : `Clean normalled path — ${micLabel} feeds ${preLabel}, then straight through to conversion.`;

  // Surface warnings as notes but never as blockers
  const level: 'ok' | 'caution' = (analysis?.warnings?.length ?? 0) > 0 ? 'caution' : 'ok';
  const cautionReason = analysis?.warnings?.[0];

  return {
    status: inserts.length > 0 ? 'custom' : 'default',
    headline,
    viability_flag: { level, reason: cautionReason ?? reason },
    gain_margin_summary,
    validation_issues: [],
    active_path,
    parallel_paths,
    deviations,
    available_next_actions: [],
  };
}

export function buildPerspectiveInsights(
  perspective: Perspective,
  analysis: ChainAnalysis | null
): PerspectiveInsightModel {
  if (!analysis) {
    return {
      perspective,
      summary: 'No active route yet.',
      warnings: [],
      notes: [],
    };
  }

  if (perspective === 'musician') {
    return {
      perspective,
      summary: analysis.warnings.length > 0
        ? 'This route has a noticeable personality shift or constraint that may become part of the sound.'
        : `The gear is doing most of the talking here — ${analysis.bridging_ratio >= 10 ? 'the electrical interface is transparent, so' : 'the impedance interaction adds subtle color, and'} what you hear is the character of the mic and preamp themselves.`,
      warnings: analysis.warnings,
      notes: analysis.notes,
    };
  }

  if (perspective === 'engineer') {
    return {
      perspective,
      summary: analysis.warnings.length > 0
        ? 'The route works, but there are practical engineering constraints to manage.'
        : `Bridging ratio ${analysis.bridging_ratio.toFixed(1)}:1, ${analysis.effective_bw_khz.toFixed(0)}kHz bandwidth, ${analysis.cumulative_noise_db.toFixed(0)} dBu cascaded noise. ${analysis.bridging_ratio >= 10 ? 'Clean interface.' : 'Some impedance loading — worth monitoring.'}`,
      warnings: analysis.warnings,
      notes: analysis.notes,
    };
  }

  return {
    perspective,
    summary: analysis.warnings.length > 0
      ? `Primary concern: ${analysis.warnings[0]}`
      : `Primary concern: bridging ${analysis.bridging_ratio.toFixed(2)}:1 with ${analysis.effective_bw_khz.toFixed(1)}kHz effective bandwidth.`,
    warnings: analysis.warnings,
    notes: analysis.notes,
  };
}