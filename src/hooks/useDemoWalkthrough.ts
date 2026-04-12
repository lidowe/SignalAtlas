import { useCallback, useRef, useState } from 'react';
import type { Microphone, Preamp, InsertProcessor, StudioMode } from '../types/studio';

export type DemoState = 'idle' | 'running' | 'complete';

interface DemoStep {
  label: string;
  narration: string;
  action: () => void;
  delay: number;
  scrollToRow?: string;  // data-row-id value to scroll into view
}

interface UseDemoWalkthroughOptions {
  mode: StudioMode;
  microphones: Microphone[];
  preamps: Preamp[];
  compressors: Array<{ id: string; name: string; [k: string]: any }>;
  equalizers: Array<{ id: string; name: string; [k: string]: any }>;
  onSelectMic: (mic: Microphone | null) => void;
  onSelectPreamp: (pre: Preamp | null) => void;
  onAddInsert: (proc: InsertProcessor) => void;
  onClearChain: () => void;
  onSetMode: (m: StudioMode) => void;
}

// ── Tracking demo: Wunder CM7-GS → Manley Dual Mono → Retro 176 ──
const TRACKING_MIC = 'mic-wunder-cm7gs';
const TRACKING_PREAMP = 'pre-manley-dual-mono';
const TRACKING_COMP = 'comp-retro-176';

// ── Mixing demo: TF51 → Pueblo JR22 → STA-Level → Langevin MMP ──
const MIXING_MIC = 'mic-telefunken-tf51';
const MIXING_PREAMP = 'pre-pueblo-jr22';
const MIXING_COMP = 'comp-retro-sta-level';
const MIXING_EQ = 'eq-langevin-mmp';

export function useDemoWalkthrough({
  mode,
  microphones,
  preamps,
  compressors,
  equalizers,
  onSelectMic,
  onSelectPreamp,
  onAddInsert,
  onClearChain,
  onSetMode,
}: UseDemoWalkthroughOptions) {
  const [demoState, setDemoState] = useState<DemoState>('idle');
  const [stepIndex, setStepIndex] = useState(-1);
  const [narration, setNarration] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setDemoState('idle');
    setStepIndex(-1);
    setNarration('');
  }, []);

  const runSteps = useCallback((steps: DemoStep[]) => {
    setDemoState('running');
    setStepIndex(0);
    setNarration(steps[0]?.narration ?? '');

    let current = 0;

    function scrollAndHighlight(rowId?: string) {
      if (!rowId) return;
      const el = document.querySelector(`[data-row-id="${rowId}"]`);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Brief ring pulse so the user sees which row changed
      el.classList.add('demo-highlight');
      setTimeout(() => el.classList.remove('demo-highlight'), 1200);
    }

    function advance() {
      if (current >= steps.length) {
        // Auto-clear: brief pause then reset everything
        timerRef.current = setTimeout(() => {
          onClearChain();
          setDemoState('idle');
          setStepIndex(-1);
          setNarration('');
          timerRef.current = null;
        }, 2400);
        return;
      }
      const step = steps[current];
      setStepIndex(current);
      setNarration(step.narration);
      step.action();
      scrollAndHighlight(step.scrollToRow);
      current++;
      timerRef.current = setTimeout(advance, step.delay);
    }

    advance();
  }, [onClearChain]);

  const startTracking = useCallback(() => {
    const mic = microphones.find(m => m.id === TRACKING_MIC);
    const pre = preamps.find(p => p.id === TRACKING_PREAMP);
    const comp = compressors.find(c => c.id === TRACKING_COMP);
    if (!mic || !pre || !comp) return;

    runSteps([
      {
        label: 'Clearing chain',
        narration: 'Starting fresh — clearing any existing selections so the demo begins from an empty signal path.',
        delay: 2800,
        scrollToRow: 'row-mic-ties',
        action: () => { onClearChain(); onSetMode('tracking'); },
      },
      {
        label: `Selecting ${mic.name}`,
        narration: `Choosing the ${mic.name} as the source. This is where the signal originates — the microphone's capsule type and impedance determine everything downstream.`,
        delay: 3600,
        scrollToRow: 'row-mic-ties',
        action: () => onSelectMic(mic),
      },
      {
        label: `Patching ${pre.name}`,
        narration: `Patching into the ${pre.name}. The preamp brings the mic-level signal up to line level. Watch how the impedance bridging and gain staging numbers appear — this is the electrical handshake between mic and preamp.`,
        delay: 4200,
        scrollToRow: 'row-preamp-in',
        action: () => onSelectPreamp(pre),
      },
      {
        label: `Inserting ${comp.name}`,
        narration: `Adding the ${comp.name} as an insert. The compressor sits in the signal path before the mix bus, shaping dynamics before the signal reaches the converter. Notice how the sonic signature evolves with each stage.`,
        delay: 4200,
        scrollToRow: 'row-dynamics',
        action: () => onAddInsert({ type: 'compressor', item: comp as any }),
      },
      {
        label: 'Demo complete',
        narration: 'The chain is complete. The signal now travels from microphone through preamp and compressor to the converter and DAW — each stage contributing its character to the final sound.',
        delay: 4000,
        scrollToRow: 'row-ad-daw',
        action: () => {},
      },
    ]);
  }, [microphones, preamps, compressors, onSelectMic, onSelectPreamp, onAddInsert, onClearChain, onSetMode, runSteps]);

  const startMixing = useCallback(() => {
    const mic = microphones.find(m => m.id === MIXING_MIC);
    const pre = preamps.find(p => p.id === MIXING_PREAMP);
    const comp = compressors.find(c => c.id === MIXING_COMP);
    const eq = equalizers.find(e => e.id === MIXING_EQ);
    if (!mic || !pre || !comp || !eq) return;

    runSteps([
      {
        label: 'Clearing chain',
        narration: 'Starting fresh — clearing the path to build a different chain that shows how more stages affect the cumulative sound.',
        delay: 2800,
        scrollToRow: 'row-mic-ties',
        action: () => { onClearChain(); onSetMode('tracking'); },
      },
      {
        label: `Selecting ${mic.name}`,
        narration: `Choosing the ${mic.name} — a different tonal starting point from the tracking demo. Compare how the sonic signature changes with a different source.`,
        delay: 3600,
        scrollToRow: 'row-mic-ties',
        action: () => onSelectMic(mic),
      },
      {
        label: `Patching ${pre.name}`,
        narration: `Patching into the ${pre.name}. This preamp has a different topology and impedance — watch how the bridging ratio and tonal character shift compared to the tracking demo.`,
        delay: 4200,
        scrollToRow: 'row-preamp-in',
        action: () => onSelectPreamp(pre),
      },
      {
        label: `Inserting ${comp.name}`,
        narration: `Adding the ${comp.name} for dynamics control. Each compressor design reacts to transients differently — the sonic signature now reflects three cumulative stages.`,
        delay: 4200,
        scrollToRow: 'row-dynamics',
        action: () => onAddInsert({ type: 'compressor', item: comp as any }),
      },
      {
        label: `Adding ${eq.name}`,
        narration: `Adding the ${eq.name} as a fourth stage. With an equalizer in the chain, the signal passes through more analog circuitry — notice how bandwidth and cumulative coloration evolve.`,
        delay: 4200,
        scrollToRow: 'row-eq',
        action: () => onAddInsert({ type: 'equalizer', item: eq as any }),
      },
      {
        label: 'Demo complete',
        narration: 'Four analog stages plus the source — this is a heavily colored chain. The sonic signature shows how each piece of gear compounds into the final character.',
        delay: 4000,
        scrollToRow: 'row-ad-daw',
        action: () => {},
      },
    ]);
  }, [microphones, preamps, compressors, equalizers, onSelectMic, onSelectPreamp, onAddInsert, onClearChain, onSetMode, runSteps]);

  const start = useCallback(() => {
    if (mode === 'mixing') startMixing();
    else startTracking();
  }, [mode, startTracking, startMixing]);

  return { demoState, stepIndex, narration, start, startTracking, startMixing, cancel };
}
