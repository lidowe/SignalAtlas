import type {
  ChainAnalysis,
  Compressor,
  Equalizer,
  InsertProcessor,
  Microphone,
  MixAnalysis,
  MixChannelInsert,
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
      detail: 'API bus amplifier plus output transformer stages before print; higher harmonic accumulation and tighter remaining margin than the open Pueblo lanes',
    });
  }

  if (counts.apiMixB > 0) {
    path.push({
      id: 'mix-api-b',
      label: `API Mix B (${counts.apiMixB})`,
      type: 'summing',
      detail: 'Independent API bus with the same amplifier and transformer architecture, kept separate for balance and reintegration control',
    });
  }

  if (counts.otb > 0) {
    path.push({
      id: 'mix-otb',
      label: `OTB tributary (${counts.otb})`,
      type: 'summing',
      detail: 'Tonelux discrete sum + TX-100 transformer before reinjection into the console bus',
    });
  }

  if (counts.puebloA + counts.puebloB > 0) {
    path.push({
      id: 'mix-pueblo-open',
      label: `Open Pueblo lanes (${counts.puebloA + counts.puebloB})`,
      type: 'summing',
      detail: 'Cleaner active summing branches with lower stated distortion and fewer transformer stages before the final print decision',
    });
  }

  path.push({
    id: 'mix-print-monitor',
    label: 'Print + monitor tail',
    type: 'converter',
    detail: 'Dangerous AD+ capture tail with D-Box+ downstream monitoring reference',
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
            ? 'The session is split between the main console bus and the OTB tributary, adding a second analog summing stage before print.'
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
          ? `The mix is no longer one single center lane — ${routingNotes}. Different channels are now combining at different points in the analog path, so the final print still contains unresolved routing consequences.`
          : `The mix is now traveling through one committed bus structure — ${routingNotes}. The route itself changes how many stages each signal crosses before print.`,
        warnings: [],
        notes: [],
      };
    }

    if (perspective === 'engineer') {
      return {
        perspective,
        summary: `${mixPaths.length} DA outputs are active: ${routingNotes}. API lanes add bus-amplifier and transformer stages, the OTB tributary adds an extra TX-100 stage, and open Pueblo lanes defer reinsertion while preserving a simpler summing path.`,
        warnings: [],
        notes: [],
      };
    }

    return {
      perspective,
      summary: `${mixPaths.length} analog playback lanes are instantiated across the summing network: ${routingNotes}. API routes increase harmonic density via amplifier + transformer stages, OTB adds another iron-mediated summing pass, and Pueblo stays the cleaner active path before the D-Box+ / AD+ print tail.`,
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

// ── Cumulative Mix Analysis ──

const emptyMixAnalysis: MixAnalysis = {
  totalChannels: 0,
  apiChannels: 0,
  otbChannels: 0,
  channelInserts: [],
  seriesReturnChannels: 0,
  puebloDirectChannels: 0,
  tubeStages: 0,
  transformerStages: 0,
  backboneTransformers: 0,
  harmonicDensity: 'minimal',
  headroomNote: 'No active channels.',
  noiseTrend: 'Silent.',
  transientCharacter: 'No signal path active.',
  stereoImplication: 'No channels allocated.',
  returnBlendNote: 'No patched returns in play.',
  musicianSummary: 'No mix session active.',
  engineerSummary: 'No mix session active.',
  technicalSummary: 'No mix session active.',
  internalEvidence: [],
};

export function buildMixAnalysis(
  mixPaths: MixPathModel[],
  channelInserts: MixChannelInsert[],
): MixAnalysis {
  if (mixPaths.length === 0) return emptyMixAnalysis;

  const apiACount = mixPaths.filter((p) => p.destination === 'api-mix-a').length;
  const apiBCount = mixPaths.filter((p) => p.destination === 'api-mix-b').length;
  const apiChannels = apiACount + apiBCount;
  const otbChannels = mixPaths.filter((p) => p.destination === 'otb').length;

  let backboneTransformers = 2;
  if (apiACount > 0) backboneTransformers += 1;
  if (apiBCount > 0) backboneTransformers += 1;
  if (otbChannels > 0) backboneTransformers += 1;

  let insertTubeStages = 0;
  let insertTransformers = 0;
  let seriesReturnChannels = 0;
  let puebloDirectChannels = 0;

  for (const insert of channelInserts) {
    if (insert.returnMode === 'pueblo-direct') puebloDirectChannels += 1;
    else seriesReturnChannels += 1;

    const proc = insert.processor;
    switch (proc.type) {
      case 'equalizer':
        if (proc.item.has_transformer) insertTransformers += 1;
        if (proc.item.topology === 'tube-reactive') insertTubeStages += 1;
        break;
      case 'outboard':
        if (proc.item.has_transformer) insertTransformers += 1;
        break;
      case 'preamp-eq':
        if (proc.item.has_transformer) insertTransformers += 1;
        if (proc.item.topology === 'all-valve' || proc.item.topology === 'hybrid-tube') insertTubeStages += 1;
        break;
      case 'compressor':
        insertTransformers += 1;
        if (proc.item.topology === 'variable-mu' || proc.item.topology === 'fet-tube') insertTubeStages += 1;
        break;
    }
  }

  const tubeStages = insertTubeStages;
  const transformerStages = backboneTransformers + insertTransformers;
  const densityScore = (backboneTransformers * 0.5) + insertTransformers + (tubeStages * 1.6) + (seriesReturnChannels * 0.8) + (puebloDirectChannels * 0.35);

  let harmonicDensity: MixAnalysis['harmonicDensity'] = 'minimal';
  if (densityScore >= 12) harmonicDensity = 'saturated';
  else if (densityScore >= 7) harmonicDensity = 'dense';
  else if (densityScore >= 3) harmonicDensity = 'moderate';

  const headroomNote = seriesReturnChannels >= 6 || apiChannels > 12
    ? 'Several channels are re-entering through the API insert returns. That concentrates more signal into the same console bus structure, while the API can swing about +28 dBu and the AD+ clips around +24 dBu, so bus trim matters.'
    : puebloDirectChannels > 0
      ? 'Some patched channels are feeding Pueblo directly before print. That opens the blend and eases some API insert-return congestion, but it makes the parallel balance part of the final headroom picture.'
      : otbChannels > 0
        ? 'OTB is active upstream of the API and print path. Watch cumulative level across OTB → API → Pueblo → AD+.'
        : 'Standard backbone headroom: API bus into Pueblo and AD+. Keep about 4 dB of margin at the final print converter.';

  const noiseTrend = tubeStages > 2
    ? `${tubeStages} tube stages are now stacked into the mix architecture. Those valves, not the converter, become the dominant noise personality as the blend thickens.`
    : channelInserts.length > 4
      ? `${channelInserts.length} analog patch points are active. The cumulative floor is still manageable, but each extra analog branch adds a little haze and hum risk.`
      : puebloDirectChannels > 0
        ? 'Direct Pueblo returns keep the parallel contribution relatively open and quiet. The extra branches add texture more than obvious floor buildup.'
        : 'Backbone-only or lightly patched mix. The capture chain remains comfortably below the audible noise threshold.';

  const transientCharacter = tubeStages >= 3 || (seriesReturnChannels >= 4 && transformerStages >= 6)
    ? 'Transient edges are being softened by multiple series return stages. Expect less attack separation and more cumulative bus interaction.'
    : puebloDirectChannels > 0 && seriesReturnChannels > 0
      ? 'Hybrid. Series returns increase shared-bus interaction, while the direct Pueblo feeds preserve more separation before the final blend.'
      : puebloDirectChannels > 0
        ? 'More open. The patched channels keep more transient definition because they are blending into Pueblo directly instead of re-entering the console insert loop.'
        : otbChannels > 0
          ? 'Mixed. OTB lanes arrive with transformer rounding while the API channels keep the simpler console path.'
          : 'Fast and direct. The fixed backbone is still doing more than the outboard to define the transient behavior.';

  const stereoImplication = puebloDirectChannels > 0 && seriesReturnChannels > 0
    ? 'The mix is splitting into two spatial behaviors: insert-return channels reinforce shared bus interaction, while Pueblo-direct returns keep more separation until the final blend.'
    : puebloDirectChannels > 0
      ? 'Direct Pueblo contributions keep layered elements more explicit in the stereo field until the last summing point.'
      : otbChannels > 0 && apiChannels > 0
        ? 'Split topology creates two concurrent paths: API channels share one console behavior, while OTB lanes add an extra transformer stage before they merge.'
        : 'API-dominant routing keeps most elements interacting within the same console path and final summing structure.';

  const returnBlendNote = channelInserts.length === 0
    ? 'No outboard channels are patched yet — the mix is simply riding the normalled backbone.'
    : puebloDirectChannels > 0 && seriesReturnChannels > 0
      ? `${seriesReturnChannels} channel${seriesReturnChannels === 1 ? '' : 's'} are returning to the API insert path, while ${puebloDirectChannels} are feeding Pueblo directly before the final blend.`
      : puebloDirectChannels > 0
        ? `${puebloDirectChannels} patched channel${puebloDirectChannels === 1 ? ' is' : 's are'} feeding Pueblo directly instead of re-entering the API insert return.`
        : `${seriesReturnChannels} patched channel${seriesReturnChannels === 1 ? ' is' : 's are'} coming back through the API insert returns, increasing shared console-bus interaction.`;

  const musicianSummary = channelInserts.length === 0
    ? `${mixPaths.length} channels are flowing through the room's normalled analog path. No extra channel patches are changing the stage count yet.`
    : puebloDirectChannels > 0 && seriesReturnChannels > 0
      ? `${mixPaths.length} channels are active, with ${seriesReturnChannels} re-entering the console path and ${puebloDirectChannels} blending into Pueblo directly. That means different groups are accumulating different amounts of bus interaction before the final print.`
      : puebloDirectChannels > 0
        ? `${mixPaths.length} channels are active, and ${puebloDirectChannels} of them are being blended straight into Pueblo. Those channels stay less entangled with the API insert-return loop until the final sum.`
        : tubeStages >= 2
          ? `${mixPaths.length} channels now include several tube and transformer stages. Expect more harmonic accumulation and less transient separation as the stack grows.`
          : `${mixPaths.length} channels are active with ${channelInserts.length} extra patch${channelInserts.length === 1 ? '' : 'es'} changing how many analog stages those channels cross before print.`;

  const engineerSummary = channelInserts.length > 0
    ? `${mixPaths.length} DA outputs: ${apiChannels} API${otbChannels > 0 ? `, ${otbChannels} OTB` : ''}. ${seriesReturnChannels} series return${seriesReturnChannels === 1 ? '' : 's'}, ${puebloDirectChannels} direct Pueblo return${puebloDirectChannels === 1 ? '' : 's'}. ${transformerStages} transformer stages total. Harmonic density is now ${harmonicDensity}.`
    : `${mixPaths.length} DA outputs are active on the normalled backbone: ${apiChannels} API${otbChannels > 0 ? `, ${otbChannels} OTB` : ''}. No extra channel patches yet.`;

  const technicalSummary = `${mixPaths.length} channels: ${apiChannels} API, ${otbChannels} OTB. ${seriesReturnChannels} insert-return channels, ${puebloDirectChannels} direct-to-Pueblo channels. ${transformerStages} iron stages, ${tubeStages} tube stages. Final print path remains Pueblo D → AD+ → Aurora AES, with monitoring on Aurora AES → D-Box+.`;

  return {
    totalChannels: mixPaths.length,
    apiChannels,
    otbChannels,
    channelInserts,
    seriesReturnChannels,
    puebloDirectChannels,
    tubeStages,
    transformerStages,
    backboneTransformers,
    harmonicDensity,
    headroomNote,
    noiseTrend,
    transientCharacter,
    stereoImplication,
    returnBlendNote,
    musicianSummary,
    engineerSummary,
    technicalSummary,
    internalEvidence: [
      {
        id: 'mix-routing-topology',
        area: 'routing',
        level: 'documented-topology',
        summary: `${mixPaths.length} DA outputs are distributed through the documented API, OTB, and Pueblo routing backbone.`,
      },
      {
        id: 'mix-stage-accumulation',
        area: 'harmonics',
        level: 'derived-electrical',
        summary: `${transformerStages} transformer stages and ${tubeStages} tube stages are counted from declared device topology and active return routing.`,
      },
      {
        id: 'mix-headroom-ledger',
        area: 'gain',
        level: 'published-spec',
        summary: 'Headroom guidance references the API output ceiling and the Dangerous AD+ input ceiling at the print endpoint.',
      },
    ],
  };
}