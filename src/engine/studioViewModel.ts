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
  MixPathModel,
  StudioMode,
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

function buildMixDestinationCounts(mixPaths: MixPathModel[]) {
  return {
    apiMixA: mixPaths.filter((path) => path.destination === 'api-mix-a').length,
    apiMixB: mixPaths.filter((path) => path.destination === 'api-mix-b').length,
    otb: mixPaths.filter((path) => path.destination === 'otb').length,
    puebloA: mixPaths.filter((path) => path.destination === 'pueblo-bank-a').length,
    puebloB: mixPaths.filter((path) => path.destination === 'pueblo-bank-b').length,
  };
}

function buildMixHeadline(mixPaths: MixPathModel[]): string {
  const counts = buildMixDestinationCounts(mixPaths);
  const parts = [
    counts.apiMixA > 0 ? `${counts.apiMixA} to Mix A` : null,
    counts.apiMixB > 0 ? `${counts.apiMixB} to Mix B` : null,
    counts.otb > 0 ? `${counts.otb} to OTB` : null,
    counts.puebloA > 0 ? `${counts.puebloA} to Pueblo A` : null,
    counts.puebloB > 0 ? `${counts.puebloB} to Pueblo B` : null,
  ].filter(Boolean);

  return `${mixPaths.length} DAW track${mixPaths.length === 1 ? '' : 's'} → ${parts.join(' • ')} → print + monitor`;
}

function buildMixActivePath(mixPaths: MixPathModel[]): RouteStageSummary[] {
  const counts = buildMixDestinationCounts(mixPaths);
  const path: RouteStageSummary[] = [
    {
      id: 'mix-daw-playback',
      label: `DAW playback (${mixPaths.length})`,
      type: 'converter',
      detail: 'Lynx outputs feeding the analog mix structure',
    },
  ];

  if (counts.apiMixA > 0) {
    path.push({
      id: 'mix-api-a',
      label: `API Mix A (${counts.apiMixA})`,
      type: 'summing',
      detail: 'Primary punch-forward console bus',
    });
  }

  if (counts.apiMixB > 0) {
    path.push({
      id: 'mix-api-b',
      label: `API Mix B (${counts.apiMixB})`,
      type: 'summing',
      detail: 'Secondary bus for alternate balance or stem handling',
    });
  }

  if (counts.otb > 0) {
    path.push({
      id: 'mix-otb',
      label: `OTB tributary (${counts.otb})`,
      type: 'summing',
      detail: 'Overflow color lane that rejoins the console path',
    });
  }

  if (counts.puebloA + counts.puebloB > 0) {
    path.push({
      id: 'mix-pueblo-open',
      label: `Open Pueblo lanes (${counts.puebloA + counts.puebloB})`,
      type: 'summing',
      detail: 'Independent active branches awaiting the user’s onward decision',
    });
  }

  path.push({
    id: 'mix-print-monitor',
    label: 'Print + monitor tail',
    type: 'converter',
    detail: 'Dangerous AD+ print path with D-Box+ monitoring',
  });

  return path;
}

export function buildRouteSummary(
  mic: Microphone | null,
  preamp: Preamp | null,
  inserts: InsertProcessor[],
  parallelProcessors: ParallelProcessor[],
  analysis: ChainAnalysis | null,
  _validationIssues: RouteValidationIssue[] = [],
  mode: StudioMode = 'tracking',
  mixPaths: MixPathModel[] = []
): RouteSummaryModel {
  const active_path = buildActivePath(mic, preamp, inserts);
  const parallel_paths = buildParallelPaths(parallelProcessors);
  const gain_margin_summary = buildGainMarginSummary(mic, preamp);

  if (mode === 'mixing' && mixPaths.length > 0) {
    const counts = buildMixDestinationCounts(mixPaths);
    const openLaneCount = counts.puebloA + counts.puebloB;
    const deviations: string[] = [];

    if (counts.apiMixB > 0) {
      deviations.push(`${counts.apiMixB} track${counts.apiMixB === 1 ? ' is' : 's are'} riding Mix B for alternate balance, overflow, or stem handling.`);
    }
    if (counts.otb > 0) {
      deviations.push(`${counts.otb} track${counts.otb === 1 ? ' is' : 's are'} leaving the main console lane for the OTB tributary before rejoining the print path.`);
    }
    if (openLaneCount > 0) {
      deviations.push(`${openLaneCount} track${openLaneCount === 1 ? ' remains' : 's remain'} on open Pueblo branches, so their final re-entry or print decision is still user-directed.`);
    }
    if (parallelProcessors.length > 0) {
      deviations.push(`${parallelProcessors.length} parallel ${parallelProcessors.length === 1 ? 'branch supplements' : 'branches supplement'} the main mix architecture.`);
    }

    return {
      status: deviations.length > 0 ? 'custom' : 'default',
      headline: buildMixHeadline(mixPaths),
      viability_flag: {
        level: openLaneCount > 0 ? 'caution' : 'ok',
        reason: openLaneCount > 0
          ? 'Open Pueblo lanes are active, so the session still contains intentionally unresolved print choices.'
          : counts.otb > 0
            ? 'The session is split between the main console bus and the OTB tributary, adding a second analog color path before print.'
            : 'The session is flowing through the primary analog bus structure toward the default print and monitor chain.',
      },
      gain_margin_summary: undefined,
      validation_issues: [],
      active_path: buildMixActivePath(mixPaths),
      parallel_paths,
      deviations,
      available_next_actions: openLaneCount > 0
        ? ['Decide how the open Pueblo lanes rejoin or print', 'Inspect the active summing destination']
        : ['Inspect the active summing destination', 'Compare print path against the monitor path'],
    };
  }

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
  analysis: ChainAnalysis | null,
  mode: StudioMode = 'tracking',
  mixPaths: MixPathModel[] = []
): PerspectiveInsightModel {
  if (mode === 'mixing' && mixPaths.length > 0) {
    const counts = buildMixDestinationCounts(mixPaths);
    const openLaneCount = counts.puebloA + counts.puebloB;
    const routingNotes = [
      counts.apiMixA > 0 ? `${counts.apiMixA} on Mix A` : null,
      counts.apiMixB > 0 ? `${counts.apiMixB} on Mix B` : null,
      counts.otb > 0 ? `${counts.otb} on OTB` : null,
      openLaneCount > 0 ? `${openLaneCount} on open Pueblo lanes` : null,
    ].filter(Boolean).join(', ');

    if (perspective === 'musician') {
      return {
        perspective,
        summary: openLaneCount > 0
          ? `The mix is no longer one single center lane — ${routingNotes}. You are shaping contrasts between punch, openness, and separate stems before the final print choice.`
          : `The mix is moving as a deliberate bus performance now — ${routingNotes}. The route itself is part of the feel, not just the gear choices inside it.`,
        warnings: [],
        notes: [],
      };
    }

    if (perspective === 'engineer') {
      return {
        perspective,
        summary: `${mixPaths.length} DA outputs are active: ${routingNotes}. This is now a bus-allocation problem with print consequences, not a single stereo afterthought.`,
        warnings: [],
        notes: [],
      };
    }

    return {
      perspective,
      summary: `${mixPaths.length} analog playback lanes are instantiated across the summing network: ${routingNotes}. Monitoring remains downstream of the print branch through the D-Box+ path.`,
      warnings: [],
      notes: [],
    };
  }

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