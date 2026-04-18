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
      detail: 'API 2520 bus amp + output iron — denser mids, firmer punch, more glue',
    });
  }

  if (counts.apiMixB > 0) {
    path.push({
      id: 'mix-api-b',
      label: `API Mix B (${counts.apiMixB})`,
      type: 'summing',
      detail: 'Independent API bus with the same iron character, kept separate for stem balance',
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
      detail: 'Cleaner, lower-THD active summing branches with less iron and more separation',
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
        summary: `${mixPaths.length} DA outputs are active: ${routingNotes}. API lanes invoke 2520 + transformer bus tone, the OTB tributary adds an extra TX-100 iron stage, and open Pueblo lanes stay wider-band and lower-color until you decide their re-entry.`,
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
  tubeStages: 0,
  transformerStages: 0,
  backboneTransformers: 0,
  harmonicDensity: 'minimal',
  headroomNote: 'No active channels.',
  noiseTrend: 'Silent.',
  transientCharacter: 'No signal path active.',
  stereoImplication: 'No channels allocated.',
  musicianSummary: 'No mix session active.',
  engineerSummary: 'No mix session active.',
  technicalSummary: 'No mix session active.',
};

export function buildMixAnalysis(
  mixPaths: MixPathModel[],
  channelInserts: MixChannelInsert[],
): MixAnalysis {
  if (mixPaths.length === 0) return emptyMixAnalysis;

  const apiACount = mixPaths.filter(p => p.destination === 'api-mix-a').length;
  const apiBCount = mixPaths.filter(p => p.destination === 'api-mix-b').length;
  const apiChannels = apiACount + apiBCount;
  const otbChannels = mixPaths.filter(p => p.destination === 'otb').length;

  // ── Backbone transformer count ──
  // Always: AD+ input transformer (1) + AD+ AES output transformer (1) = 2
  // API output transformer: 1 per bus used
  // OTB TX-100: 1 if OTB path is active
  let backboneTransformers = 2; // AD+
  if (apiACount > 0) backboneTransformers += 1; // Mix A bus output iron
  if (apiBCount > 0) backboneTransformers += 1; // Mix B bus output iron
  if (otbChannels > 0) backboneTransformers += 1; // OTB TX-100

  // ── Per-channel insert analysis ──
  let insertTubeStages = 0;
  let insertTransformers = 0;
  for (const insert of channelInserts) {
    const proc = insert.processor;
    switch (proc.type) {
      case 'equalizer':
        if (proc.item.has_transformer) insertTransformers++;
        if (proc.item.topology === 'tube-reactive') insertTubeStages++;
        break;
      case 'outboard':
        if (proc.item.has_transformer) insertTransformers++;
        break;
      case 'preamp-eq':
        if (proc.item.has_transformer) insertTransformers++;
        if (proc.item.topology === 'all-valve' || proc.item.topology === 'hybrid-tube') insertTubeStages++;
        break;
      case 'compressor':
        insertTransformers++; // conservative assumption
        if (proc.item.topology === 'variable-mu' || proc.item.topology === 'fet-tube') insertTubeStages++;
        break;
    }
  }

  const tubeStages = insertTubeStages;
  const transformerStages = backboneTransformers + insertTransformers;

  // ── Harmonic density rating ──
  let harmonicDensity: MixAnalysis['harmonicDensity'] = 'minimal';
  if (insertTransformers >= 8 || tubeStages >= 4) harmonicDensity = 'saturated';
  else if (insertTransformers >= 4 || tubeStages >= 2) harmonicDensity = 'dense';
  else if (insertTransformers >= 1 || tubeStages >= 1 || backboneTransformers >= 4) harmonicDensity = 'moderate';

  // ── Headroom note ──
  const headroomNote = apiChannels > 12
    ? 'High channel count through API bus. The 4 dB gap between API max output (+28 dBu) and AD+ clip point (+24 dBu) demands careful bus level management.'
    : otbChannels > 0
      ? 'OTB tributary adds a second summing stage before the API bus. Watch cumulative level: OTB → API → AD+ has more gain structure to manage.'
      : 'Standard backbone headroom. The AD+ clips at +24 dBu while the API can push +28 dBu — maintain 4 dB margin at the bus output.';

  // ── Noise trend ──
  const noiseTrend = tubeStages > 2
    ? `${tubeStages} tube stages across channels — cumulative tube noise raises the mix floor. The AD+ endpoint (−108 dBu) is well below, so tube inserts dominate the noise picture.`
    : channelInserts.length > 4
      ? `${channelInserts.length} analog insert stages across channels. Each adds its noise contribution, though the AD+ endpoint (−108 dBu) keeps the capture floor low.`
      : 'Backbone noise dominated by the AD+ endpoint (−108 dBu). Minimal per-channel processing keeps the cumulative floor low.';

  // ── Transient character ──
  const transientCharacter = tubeStages >= 3
    ? 'Noticeably rounded. Multiple tube stages soften attack edges cumulatively — transients arrive shaped rather than sharp.'
    : transformerStages >= 5
      ? 'Iron-mediated. The transformer count means transient peaks get gently compressed by magnetic saturation across multiple stages.'
      : otbChannels > 0
        ? 'Mixed. API channels retain fast transients through the 2520 path, while OTB channels arrive with TX-100 transformer rounding.'
        : 'Fast and direct. The API 2520 path preserves transient speed; backbone transformers add minimal rounding at normal levels.';

  // ── Stereo implication ──
  const stereoImplication = otbChannels > 0 && apiChannels > 0
    ? 'Split topology creates two stereo characters: API channels carry the denser, mid-forward image, while OTB channels arrive with transformer-widened depth. The merge at the API bus insert blends these two spatial profiles.'
    : 'API-dominant routing gives a cohesive, center-weighted stereo image with iron-mediated width.';

  // ── Perspective summaries ──
  const musicianSummary = tubeStages >= 2
    ? `${mixPaths.length} channels through the analog console with ${tubeStages} tube stages adding warmth. The feel is getting thicker and more saturated — expect glue and body, but watch for transient mushiness on percussive material.`
    : channelInserts.length > 0
      ? `${mixPaths.length} channels through the analog backbone with ${channelInserts.length} outboard insert${channelInserts.length === 1 ? '' : 's'} adding character. The mix is building density and cohesion from the iron in the signal path.`
      : `${mixPaths.length} channels through the studio's fixed analog path. The console iron and converter transformers give the mix its baseline punch and midrange authority.`;

  const engineerSummary = channelInserts.length > 0
    ? `${mixPaths.length} DA outputs: ${apiChannels} API${otbChannels > 0 ? `, ${otbChannels} OTB` : ''}. ${channelInserts.length} per-channel insert${channelInserts.length === 1 ? '' : 's'}. ${transformerStages} transformer stages (${backboneTransformers} backbone + ${insertTransformers} inserts). Harmonic density: ${harmonicDensity}.`
    : `${mixPaths.length} DA outputs: ${apiChannels} API${otbChannels > 0 ? `, ${otbChannels} OTB` : ''}. Normalled backbone only. ${backboneTransformers} backbone transformers.`;

  const technicalSummary = `${mixPaths.length} channels: ${apiChannels} API (2520/2510, ${apiACount > 0 && apiBCount > 0 ? '2 bus' : '1 bus'} xfmr${apiACount > 0 && apiBCount > 0 ? 's' : ''}), ${otbChannels} OTB (TX-100). ${transformerStages} iron stages, ${tubeStages} tube. Headroom: API +28 dBu → AD+ +24 dBu = 4 dB margin. Print: Pueblo D → AD+ → Aurora AES. Monitor: Aurora AES → D-Box+.`;

  return {
    totalChannels: mixPaths.length,
    apiChannels,
    otbChannels,
    channelInserts,
    tubeStages,
    transformerStages,
    backboneTransformers,
    harmonicDensity,
    headroomNote,
    noiseTrend,
    transientCharacter,
    stereoImplication,
    musicianSummary,
    engineerSummary,
    technicalSummary,
  };
}