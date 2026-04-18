import { useState, useCallback } from 'react';
import type { Perspective, Microphone, Preamp, ChainNode, ChainAnalysis, InsertProcessor, ParallelProcessor, ParallelProcessorInput, PatchGraphModel, RouteValidationIssue, StudioMode, SonicSignature, MixPathModel, MixPathDestinationId } from '../types/studio';
import { microphones } from '../data/microphones';
import { preamps } from '../data/preamps';
import { compressors } from '../data/compressors';
import { equalizers } from '../data/equalizers';
import { outboardProcessors } from '../data/outboard';
import { analyzeMicPreamp, analyzeFullChain } from '../engine/signalChain';
import { cascadeNodes } from '../data/cascade';
import { buildSonicSignature } from '../engine/sonicSignature';
import { buildPatchGraph } from '../engine/patchRouting';
import { validatePatchGraph } from '../engine/routeValidation';
import { buildDefaultParallelRouting, normalizeParallelRouting, parallelReturnDestinationOptions, parallelSendSourceOptions } from '../engine/routingTopology';
import { buildPerspectiveInsights, buildRouteSummary } from '../engine/studioViewModel';
import type { PerspectiveInsightModel, RouteSummaryModel } from '../types/studio';

/** Extract { has_transformer, noise_floor_db } from any insert processor for signal chain analysis */
function insertToStage(proc: InsertProcessor): { has_transformer: boolean; noise_floor_db: number } {
  switch (proc.type) {
    case 'equalizer':
      return { has_transformer: proc.item.has_transformer, noise_floor_db: proc.item.noise_floor_db };
    case 'preamp-eq':
      return { has_transformer: proc.item.has_transformer, noise_floor_db: proc.item.noise_floor_db };
    case 'outboard':
      return { has_transformer: proc.item.has_transformer, noise_floor_db: proc.item.noise_floor_db };
    case 'compressor':
      // Compressor type doesn't carry these fields yet — use conservative defaults
      return { has_transformer: true, noise_floor_db: -85 };
  }
}

function runAnalysis(mic: Microphone | null, preamp: Preamp | null, inserts: InsertProcessor[]): ChainAnalysis | null {
  if (!mic || !preamp) return null;
  if (inserts.length === 0) return analyzeMicPreamp(mic, preamp);
  return analyzeFullChain(mic, preamp, inserts.map(insertToStage));
}

function buildDefaultParallelProcessor(proc: ParallelProcessorInput): ParallelProcessor {
  if ('routing' in proc) {
    return {
      ...proc,
      routing: normalizeParallelRouting(proc, proc.routing),
    };
  }

  return {
    ...proc,
    routing: buildDefaultParallelRouting(proc),
  };
}

function buildMixPathModel(trackNumber: number, destination?: MixPathDestinationId): MixPathModel {
  const resolvedDestination = destination ?? (trackNumber <= 16 ? 'api-mix-a' : 'otb');
  const sourceLabel = `Lynx / DAW out ${trackNumber}`;

  switch (resolvedDestination) {
    case 'api-mix-b':
      return {
        id: `mix-path-${trackNumber}`,
        trackNumber,
        sourceLabel,
        routeLabel: 'API Mix B',
        destination: resolvedDestination,
        sonicIntent: 'Keeps the track on a separate API bus so it can stay punchy and dense without forcing the whole mix into the same center-weighted move.',
        technicalNote: 'This still uses the API 2510/2520 amplifier path and bus output iron, but on an independent stereo lane. That is why it keeps the API midrange firmness while preserving separate balance control.',
        printTarget: 'Pueblo Bank D → AD+ input B',
        monitorTarget: 'D-Box+ AES monitor path',
      };
    case 'otb':
      return {
        id: `mix-path-${trackNumber}`,
        trackNumber,
        sourceLabel,
        routeLabel: 'Tonelux OTB tributary',
        destination: resolvedDestination,
        sonicIntent: 'Pushes the track through an extra analog color lane first, so it comes back thicker, slightly softer on transients, and more obviously glued before it rejoins the mix.',
        technicalNote: 'Aurora outputs 17–24 feed the OTB discrete summing stage and TX-100 transformer, then re-enter the API path. That extra iron stage changes harmonic density, low-mid weight, and HF phase behavior more than a direct console route.',
        printTarget: 'OTB tributary → API external / insert return path',
        monitorTarget: 'D-Box+ monitor after the summed bus',
      };
    case 'pueblo-bank-a':
      return {
        id: `mix-path-${trackNumber}`,
        trackNumber,
        sourceLabel,
        routeLabel: 'Pueblo Bank A',
        destination: resolvedDestination,
        sonicIntent: 'Keeps the track cleaner, wider, and more separated by opening a dedicated lane outside the denser API bus path.',
        technicalNote: 'Pueblo is the lower-color active summing option here: wider bandwidth, very low THD, and no immediate API transformer reinsertion. That usually reads as more transient truth and less bus glue.',
        printTarget: 'Independent Pueblo output, not the default print tail',
        monitorTarget: 'D-Box+ via the chosen monitor source',
      };
    case 'pueblo-bank-b':
      return {
        id: `mix-path-${trackNumber}`,
        trackNumber,
        sourceLabel,
        routeLabel: 'Pueblo Bank B',
        destination: resolvedDestination,
        sonicIntent: 'Builds another open, lower-color branch so a stem can stay more explicit and less iron-shaped until you decide what to do with it.',
        technicalNote: 'Like Bank A, this stays on Pueblo’s active summing network rather than the API bus amplifiers and transformers. The audible result is usually more separation, less density, and a freer later print decision.',
        printTarget: 'Independent Pueblo output, manually directed onward',
        monitorTarget: 'D-Box+ via the chosen monitor source',
      };
    case 'api-mix-a':
    default:
      return {
        id: `mix-path-${trackNumber}`,
        trackNumber,
        sourceLabel,
        routeLabel: 'API Mix A',
        destination: 'api-mix-a',
        sonicIntent: 'Keeps the track in the main API center lane, where the mix tends to feel more assertive, glued, and mid-forward.',
        technicalNote: 'This route hits the API summing amplifiers and output iron before the print tail. That bus architecture is why Mix A feels denser and more forceful than the cleaner Pueblo branches, and why gain staging matters into the AD+.',
        printTarget: 'Pueblo Bank C / API print path → AD+ input A',
        monitorTarget: 'D-Box+ AES monitor path',
      };
  }
}

export interface StudioState {
  perspective: Perspective;
  mode: StudioMode;
  selectedMic: Microphone | null;
  selectedPreamp: Preamp | null;
  insertChain: InsertProcessor[];
  parallelChain: ParallelProcessor[];
  chain: ChainNode[];
  analysis: ChainAnalysis | null;
  patchGraph: PatchGraphModel;
  routeValidation: RouteValidationIssue[];
  routeSummary: RouteSummaryModel;
  perspectiveInsights: Record<Perspective, PerspectiveInsightModel>;
  mixSessionTrackCount: number;
  mixPaths: MixPathModel[];

  sonicSignature: SonicSignature;
  inspectedId: string | null;
  searchQuery: string;
}

function buildInsights(analysis: ChainAnalysis | null, mode: StudioMode, mixPaths: MixPathModel[]): Record<Perspective, PerspectiveInsightModel> {
  return {
    musician: buildPerspectiveInsights('musician', analysis, mode, mixPaths),
    engineer: buildPerspectiveInsights('engineer', analysis, mode, mixPaths),
    technical: buildPerspectiveInsights('technical', analysis, mode, mixPaths),
  };
}

export function useStudio() {
  const initialPatchGraph = buildPatchGraph(null, null, [], []);
  const initialRouteValidation = validatePatchGraph(initialPatchGraph, null, null, [], []);

  const [state, setState] = useState<StudioState>({
    perspective: 'engineer',
    mode: 'tracking' as StudioMode,
    selectedMic: null,
    selectedPreamp: null,
    insertChain: [],
    parallelChain: [],
    chain: [],
    analysis: null,
    patchGraph: initialPatchGraph,
    routeValidation: initialRouteValidation,
    routeSummary: buildRouteSummary(null, null, [], [], null, initialRouteValidation, 'tracking', []),
    perspectiveInsights: buildInsights(null, 'tracking', []),
    mixSessionTrackCount: 0,
    mixPaths: [],
    sonicSignature: buildSonicSignature(null, null, []),
    inspectedId: null,
    searchQuery: '',
  });

  const setPerspective = useCallback((p: Perspective) => setState(s => ({ ...s, perspective: p })), []);
  const setMode = useCallback((m: StudioMode) => setState(s => ({
    ...s,
    mode: m,
    routeSummary: buildRouteSummary(s.selectedMic, s.selectedPreamp, s.insertChain, s.parallelChain, s.analysis, s.routeValidation, m, s.mixPaths),
    perspectiveInsights: buildInsights(s.analysis, m, s.mixPaths),
  })), []);
  const setSearch = useCallback((q: string) => setState(s => ({ ...s, searchQuery: q })), []);

  const setMixSessionTrackCount = useCallback((count: number) => {
    setState((s) => {
      const clamped = Math.max(0, Math.min(24, Number.isFinite(count) ? Math.floor(count) : 0));
      const mixPaths = Array.from({ length: clamped }, (_, index) => s.mixPaths[index] ?? buildMixPathModel(index + 1));

      return {
        ...s,
        mixSessionTrackCount: clamped,
        mixPaths,
        routeSummary: buildRouteSummary(s.selectedMic, s.selectedPreamp, s.insertChain, s.parallelChain, s.analysis, s.routeValidation, s.mode, mixPaths),
        perspectiveInsights: buildInsights(s.analysis, s.mode, mixPaths),
      };
    });
  }, []);

  const updateMixPathDestination = useCallback((pathId: string, destination: MixPathDestinationId) => {
    setState((s) => {
      const mixPaths = s.mixPaths.map((path) => path.id === pathId ? buildMixPathModel(path.trackNumber, destination) : path);

      return {
        ...s,
        mixPaths,
        routeSummary: buildRouteSummary(s.selectedMic, s.selectedPreamp, s.insertChain, s.parallelChain, s.analysis, s.routeValidation, s.mode, mixPaths),
        perspectiveInsights: buildInsights(s.analysis, s.mode, mixPaths),
      };
    });
  }, []);

  const selectMic = useCallback((mic: Microphone | null) => {
    setState(s => {
      const analysis = runAnalysis(mic, s.selectedPreamp, s.insertChain);
      const patchGraph = buildPatchGraph(mic, s.selectedPreamp, s.insertChain, s.parallelChain);
      const routeValidation = validatePatchGraph(patchGraph, mic, s.selectedPreamp, s.insertChain, s.parallelChain);
      return {
        ...s,
        selectedMic: mic,
        analysis,
        patchGraph,
        routeValidation,
        routeSummary: buildRouteSummary(mic, s.selectedPreamp, s.insertChain, s.parallelChain, analysis, routeValidation, s.mode, s.mixPaths),
        perspectiveInsights: buildInsights(analysis, s.mode, s.mixPaths),
        sonicSignature: buildSonicSignature(mic, s.selectedPreamp, s.insertChain),
        inspectedId: mic?.id ?? null,
      };
    });
  }, []);

  const selectPreamp = useCallback((pre: Preamp | null) => {
    setState(s => {
      const analysis = runAnalysis(s.selectedMic, pre, s.insertChain);
      const patchGraph = buildPatchGraph(s.selectedMic, pre, s.insertChain, s.parallelChain);
      const routeValidation = validatePatchGraph(patchGraph, s.selectedMic, pre, s.insertChain, s.parallelChain);
      return {
        ...s,
        selectedPreamp: pre,
        analysis,
        patchGraph,
        routeValidation,
        routeSummary: buildRouteSummary(s.selectedMic, pre, s.insertChain, s.parallelChain, analysis, routeValidation, s.mode, s.mixPaths),
        perspectiveInsights: buildInsights(analysis, s.mode, s.mixPaths),
        sonicSignature: buildSonicSignature(s.selectedMic, pre, s.insertChain),
        inspectedId: pre?.id ?? null,
      };
    });
  }, []);

  const addInsert = useCallback((proc: InsertProcessor) => {
    setState(s => {
      const insertChain = [...s.insertChain, proc];
      const analysis = runAnalysis(s.selectedMic, s.selectedPreamp, insertChain);
      const patchGraph = buildPatchGraph(s.selectedMic, s.selectedPreamp, insertChain, s.parallelChain);
      const routeValidation = validatePatchGraph(patchGraph, s.selectedMic, s.selectedPreamp, insertChain, s.parallelChain);
      return {
        ...s,
        insertChain,
        analysis,
        patchGraph,
        routeValidation,
        routeSummary: buildRouteSummary(s.selectedMic, s.selectedPreamp, insertChain, s.parallelChain, analysis, routeValidation, s.mode, s.mixPaths),
        perspectiveInsights: buildInsights(analysis, s.mode, s.mixPaths),
        sonicSignature: buildSonicSignature(s.selectedMic, s.selectedPreamp, insertChain),
        inspectedId: proc.item.id,
      };
    });
  }, []);

  const addParallel = useCallback((proc: ParallelProcessorInput) => {
    setState(s => {
      const parallelProc = buildDefaultParallelProcessor(proc);
      if (s.parallelChain.some((existing) => existing.item.id === parallelProc.item.id && existing.type === parallelProc.type)) {
        return { ...s, inspectedId: parallelProc.item.id };
      }

      const parallelChain = [...s.parallelChain, parallelProc];
      const analysis = runAnalysis(s.selectedMic, s.selectedPreamp, s.insertChain);
      const patchGraph = buildPatchGraph(s.selectedMic, s.selectedPreamp, s.insertChain, parallelChain);
      const routeValidation = validatePatchGraph(patchGraph, s.selectedMic, s.selectedPreamp, s.insertChain, parallelChain);
      return {
        ...s,
        parallelChain,
        analysis,
        patchGraph,
        routeValidation,
        routeSummary: buildRouteSummary(s.selectedMic, s.selectedPreamp, s.insertChain, parallelChain, analysis, routeValidation, s.mode, s.mixPaths),
        perspectiveInsights: buildInsights(analysis, s.mode, s.mixPaths),
        sonicSignature: buildSonicSignature(s.selectedMic, s.selectedPreamp, s.insertChain),
        inspectedId: parallelProc.item.id,
      };
    });
  }, []);

  const removeParallel = useCallback((index: number) => {
    setState(s => {
      const parallelChain = s.parallelChain.filter((_, i) => i !== index);
      const analysis = runAnalysis(s.selectedMic, s.selectedPreamp, s.insertChain);
      const patchGraph = buildPatchGraph(s.selectedMic, s.selectedPreamp, s.insertChain, parallelChain);
      const routeValidation = validatePatchGraph(patchGraph, s.selectedMic, s.selectedPreamp, s.insertChain, parallelChain);
      return {
        ...s,
        parallelChain,
        analysis,
        patchGraph,
        routeValidation,
        routeSummary: buildRouteSummary(s.selectedMic, s.selectedPreamp, s.insertChain, parallelChain, analysis, routeValidation, s.mode, s.mixPaths),
        perspectiveInsights: buildInsights(analysis, s.mode, s.mixPaths),
        sonicSignature: buildSonicSignature(s.selectedMic, s.selectedPreamp, s.insertChain),
      };
    });
  }, []);

  const updateParallelRouting = useCallback((index: number, routingPatch: Partial<ParallelProcessor['routing']>) => {
    setState(s => {
      const target = s.parallelChain[index];
      if (!target) return s;

      const parallelChain = s.parallelChain.map((processor, processorIndex) => {
        if (processorIndex !== index) return processor;

        return {
          ...processor,
          routing: normalizeParallelRouting(processor, {
            ...processor.routing,
            ...routingPatch,
          }),
        };
      });

      const analysis = runAnalysis(s.selectedMic, s.selectedPreamp, s.insertChain);
      const patchGraph = buildPatchGraph(s.selectedMic, s.selectedPreamp, s.insertChain, parallelChain);
      const routeValidation = validatePatchGraph(patchGraph, s.selectedMic, s.selectedPreamp, s.insertChain, parallelChain);

      return {
        ...s,
        parallelChain,
        analysis,
        patchGraph,
        routeValidation,
        routeSummary: buildRouteSummary(s.selectedMic, s.selectedPreamp, s.insertChain, parallelChain, analysis, routeValidation, s.mode, s.mixPaths),
        perspectiveInsights: buildInsights(analysis, s.mode, s.mixPaths),
        sonicSignature: buildSonicSignature(s.selectedMic, s.selectedPreamp, s.insertChain),
      };
    });
  }, []);

  const removeInsert = useCallback((index: number) => {
    setState(s => {
      const insertChain = s.insertChain.filter((_, i) => i !== index);
      const analysis = runAnalysis(s.selectedMic, s.selectedPreamp, insertChain);
      const patchGraph = buildPatchGraph(s.selectedMic, s.selectedPreamp, insertChain, s.parallelChain);
      const routeValidation = validatePatchGraph(patchGraph, s.selectedMic, s.selectedPreamp, insertChain, s.parallelChain);
      return {
        ...s,
        insertChain,
        analysis,
        patchGraph,
        routeValidation,
        routeSummary: buildRouteSummary(s.selectedMic, s.selectedPreamp, insertChain, s.parallelChain, analysis, routeValidation, s.mode, s.mixPaths),
        perspectiveInsights: buildInsights(analysis, s.mode, s.mixPaths),
        sonicSignature: buildSonicSignature(s.selectedMic, s.selectedPreamp, insertChain),
      };
    });
  }, []);

  const reorderInserts = useCallback((fromIndex: number, toIndex: number) => {
    setState(s => {
      const insertChain = [...s.insertChain];
      const [moved] = insertChain.splice(fromIndex, 1);
      insertChain.splice(toIndex, 0, moved);
      const analysis = runAnalysis(s.selectedMic, s.selectedPreamp, insertChain);
      const patchGraph = buildPatchGraph(s.selectedMic, s.selectedPreamp, insertChain, s.parallelChain);
      const routeValidation = validatePatchGraph(patchGraph, s.selectedMic, s.selectedPreamp, insertChain, s.parallelChain);
      return {
        ...s,
        insertChain,
        analysis,
        patchGraph,
        routeValidation,
        routeSummary: buildRouteSummary(s.selectedMic, s.selectedPreamp, insertChain, s.parallelChain, analysis, routeValidation, s.mode, s.mixPaths),
        perspectiveInsights: buildInsights(analysis, s.mode, s.mixPaths),
        sonicSignature: buildSonicSignature(s.selectedMic, s.selectedPreamp, insertChain),
      };
    });
  }, []);

  const inspect = useCallback((id: string | null) => {
    setState(s => ({ ...s, inspectedId: id }));
  }, []);

  const clearChain = useCallback(() => {
    setState(s => ({
      ...s,
      selectedMic: null,
      selectedPreamp: null,
      insertChain: [],
      analysis: null,
      patchGraph: initialPatchGraph,
      routeValidation: initialRouteValidation,
      routeSummary: buildRouteSummary(null, null, [], [], null, initialRouteValidation, s.mode, s.mixPaths),
      perspectiveInsights: buildInsights(null, s.mode, s.mixPaths),
      sonicSignature: buildSonicSignature(null, null, []),
      chain: [],
      parallelChain: [],
    }));
  }, [initialPatchGraph, initialRouteValidation]);

  return {
    state,
    setPerspective,
    setMode,
    setSearch,
    setMixSessionTrackCount,
    updateMixPathDestination,
    selectMic,
    selectPreamp,
    addInsert,
    addParallel,
    removeInsert,
    removeParallel,
    updateParallelRouting,
    reorderInserts,
    inspect,
    clearChain,
    microphones,
    preamps,
    compressors,
    equalizers,
    outboardProcessors,
    routeValidation: state.routeValidation,
    parallelSendSourceOptions,
    parallelReturnDestinationOptions,
    cascadeNodes,
  };
}
