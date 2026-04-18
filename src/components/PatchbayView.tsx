import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type {
  BayTone,
  ChainAnalysis,
  Equalizer,
  InsertProcessor,
  Microphone,
  OutboardProcessor,
  ParallelProcessor,
  ParallelProcessorInput,
  Perspective,
  PerspectiveInsightModel,
  Preamp,
  RouteSummaryModel,
  SonicSignature,
  StudioMode,
} from '../types/studio';
import { patchRows } from '../data/studio';
import { microphones } from '../data/microphones';
import { preamps } from '../data/preamps';
import { compressors } from '../data/compressors';
import SignalFlowOverlay from './SignalFlowOverlay';
import MicLocker from './MicLocker';
import AnalysisPanel from './AnalysisPanel';
import SonicSignatureStrip from './SonicSignatureStrip';

const CascadeView = lazy(() => import('./CascadeView'));

interface Props {
  perspective: Perspective;
  mode: StudioMode;
  selectedMic: Microphone | null;
  selectedPreamp: Preamp | null;
  insertChain: InsertProcessor[];
  parallelChain: ParallelProcessor[];
  analysis: ChainAnalysis | null;
  routeSummary: RouteSummaryModel;
  perspectiveInsight: PerspectiveInsightModel;
  sonicSignature: SonicSignature;
  searchQuery: string;
  onSelectMic: (m: Microphone | null) => void;
  onSelectPreamp: (p: Preamp | null) => void;
  onAddInsert: (proc: InsertProcessor) => void;
  onAddParallel: (proc: ParallelProcessorInput) => void;
  onRemoveInsert: (index: number) => void;
  onRemoveParallel: (index: number) => void;
  onReorderInserts: (from: number, to: number) => void;
  onInspect: (id: string | null) => void;
  onClearChain: () => void;
  equalizers: Equalizer[];
  outboardProcessors: OutboardProcessor[];
}

type BayNormalMode = 'full-normal' | 'half-normal' | 'patch-only';

interface BaySegment {
  id: string;
  label: string;
  count: number;
  tone: BayTone;
}

interface PairedBaySegment {
  id: string;
  label: string;
  count: number;
  tone: BayTone;
  startNumber?: number;
  subLabels?: string[];
}

interface ExpandedBayPoint {
  tone: BayTone;
  number: number | null;
  segmentId: string;
}

interface SegmentButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'data-row-section'?: string;
}

const BAY_ROW_LENGTH = 48;

/* Bay tone system — silkscreen accent colors on dark anodized panels.
   strip: recessed label band color (faint tint + engraved text)
   socket: idle jack accent (subtle ring tint on nickel)
   selected: patched jack (bright accent glow)
   ring: segment focus ring */
const bayToneClasses: Record<BayTone, { strip: string; socket: string; selected: string; ring: string; accent: string }> = {
  rose:   { strip: 'bg-rose-500/8 text-rose-200/60',   socket: 'border-rose-500/20',   selected: 'border-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.4)]',   ring: 'ring-rose-400/25',   accent: '#fb7185' },
  red:    { strip: 'bg-red-500/8 text-red-200/60',     socket: 'border-red-500/20',    selected: 'border-red-400 shadow-[0_0_6px_rgba(239,68,68,0.4)]',    ring: 'ring-red-400/25',    accent: '#f87171' },
  orange: { strip: 'bg-orange-500/8 text-orange-200/60', socket: 'border-orange-500/20', selected: 'border-orange-400 shadow-[0_0_6px_rgba(249,115,22,0.4)]', ring: 'ring-orange-400/25', accent: '#fb923c' },
  amber:  { strip: 'bg-amber-500/8 text-amber-200/60',  socket: 'border-amber-500/20',  selected: 'border-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.4)]',  ring: 'ring-amber-400/25',  accent: '#fbbf24' },
  yellow: { strip: 'bg-yellow-500/8 text-yellow-200/60', socket: 'border-yellow-500/20', selected: 'border-yellow-400 shadow-[0_0_6px_rgba(234,179,8,0.4)]',  ring: 'ring-yellow-400/25', accent: '#facc15' },
  lime:   { strip: 'bg-lime-500/8 text-lime-200/60',   socket: 'border-lime-500/20',   selected: 'border-lime-400 shadow-[0_0_6px_rgba(132,204,22,0.4)]',   ring: 'ring-lime-400/25',   accent: '#a3e635' },
  green:  { strip: 'bg-green-500/8 text-green-200/60',  socket: 'border-green-500/20',  selected: 'border-green-400 shadow-[0_0_6px_rgba(34,197,94,0.4)]',   ring: 'ring-green-400/25',  accent: '#4ade80' },
  teal:   { strip: 'bg-teal-500/8 text-teal-200/60',   socket: 'border-teal-500/20',   selected: 'border-teal-400 shadow-[0_0_6px_rgba(20,184,166,0.4)]',   ring: 'ring-teal-400/25',   accent: '#2dd4bf' },
  cyan:   { strip: 'bg-cyan-500/8 text-cyan-200/60',   socket: 'border-cyan-500/20',   selected: 'border-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.4)]',    ring: 'ring-cyan-400/25',   accent: '#22d3ee' },
  sky:    { strip: 'bg-sky-500/8 text-sky-200/60',     socket: 'border-sky-500/20',    selected: 'border-sky-400 shadow-[0_0_6px_rgba(14,165,233,0.4)]',    ring: 'ring-sky-400/25',    accent: '#38bdf8' },
  blue:   { strip: 'bg-blue-500/8 text-blue-200/60',   socket: 'border-blue-500/20',   selected: 'border-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.4)]',   ring: 'ring-blue-400/25',   accent: '#60a5fa' },
  violet: { strip: 'bg-violet-500/8 text-violet-200/60', socket: 'border-violet-500/20', selected: 'border-violet-400 shadow-[0_0_6px_rgba(139,92,246,0.4)]', ring: 'ring-violet-400/25', accent: '#a78bfa' },
  purple: { strip: 'bg-purple-500/8 text-purple-200/60', socket: 'border-purple-500/20', selected: 'border-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.4)]', ring: 'ring-purple-400/25', accent: '#c084fc' },
  slate:  { strip: 'bg-zinc-500/8 text-zinc-300/50',   socket: 'border-zinc-600/30',   selected: 'border-zinc-400 shadow-[0_0_6px_rgba(161,161,170,0.3)]',  ring: 'ring-zinc-400/20',   accent: '#a1a1aa' },
};

/* Row shell tones — anodized aluminum panels with faint warm tint from the
   signal category. The primary visual is brushed dark metal; the tint is
   a barely perceptible warmth, like the difference between two anodized
   batches under dim rack lighting. */
const rowShellTone: Record<string, string> = {
  'row-mic-ties':         'border-[rgba(180,60,80,0.12)]',
  'row-preamp-in':        'border-[rgba(200,80,60,0.12)]',
  'row-preamp-out':       'border-[rgba(200,120,50,0.12)]',
  'row-aurora-ad-in':     'border-[rgba(180,140,40,0.12)]',
  'row-aurora-da-out':    'border-[rgba(80,160,100,0.12)]',
  'row-tilt-in':          'border-[rgba(60,170,140,0.12)]',
  'row-tilt-out':         'border-[rgba(60,170,140,0.12)]',
  'row-api-line-in':      'border-[rgba(120,180,50,0.12)]',
  'row-aurora-da-otb':    'border-[rgba(80,160,100,0.12)]',
  'row-otb-in':           'border-[rgba(160,130,40,0.12)]',
  'row-insert-send':      'border-[rgba(140,80,200,0.12)]',
  'row-insert-return':    'border-[rgba(160,60,200,0.12)]',
  'row-dynamics':         'border-[rgba(160,70,200,0.12)]',
  'row-eq':               'border-[rgba(40,180,170,0.12)]',
  'row-spatial':          'border-[rgba(30,160,200,0.12)]',
  'row-fx':               'border-[rgba(30,130,210,0.12)]',
  'row-api-mix-out':      'border-[rgba(200,150,40,0.12)]',
  'row-summing-sources':  'border-[rgba(200,160,30,0.12)]',
  'row-pueblo-in':        'border-[rgba(200,170,30,0.12)]',
  'row-pueblo-out':       'border-[rgba(200,170,30,0.12)]',
  'row-dbox-io':          'border-[rgba(40,180,160,0.12)]',
  'row-ad-daw':           'border-[rgba(50,100,200,0.12)]',
};

const micTypeTone: Record<Microphone['type'], BayTone> = {
  'Tube LDC': 'rose',
  'FET LDC': 'red',
  'FET MDC': 'orange',
  'FET SDC': 'amber',
  Ribbon: 'yellow',
  Dynamic: 'lime',
  Boundary: 'teal',
  Measurement: 'cyan',
  Subkick: 'blue',
  'Field Recorder': 'violet',
};

const modeFocusedRows: Record<StudioMode, Set<string>> = {
  tracking: new Set(['row-mic-ties', 'row-preamp-in', 'row-preamp-out', 'row-aurora-ad-in', 'row-dynamics', 'row-eq']),
  mixing: new Set(['row-aurora-da-out', 'row-tilt-in', 'row-tilt-out', 'row-api-line-in', 'row-insert-send', 'row-dynamics', 'row-eq', 'row-api-mix-out', 'row-pueblo-in', 'row-ad-daw']),
};

const normalModeMeta: Record<BayNormalMode, { label: string; badge: string; bridge: string }> = {
  'full-normal': {
    label: 'Full normal',
    badge: 'border-emerald-800/20 text-emerald-400/60',
    bridge: 'bg-emerald-400/50',
  },
  'half-normal': {
    label: 'Half normal',
    badge: 'border-amber-800/20 text-amber-400/60',
    bridge: 'border-l border-dashed border-amber-300/50',
  },
  'patch-only': {
    label: 'Patch field',
    badge: 'border-zinc-700/30 text-zinc-500',
    bridge: 'bg-zinc-700/25',
  },
};

function rowNormalMode(rowId: string): BayNormalMode {
  switch (rowId) {
    case 'row-mic-ties':
      return 'full-normal';
    case 'row-preamp-out':
    case 'row-aurora-da-out':
    case 'row-insert-send':
      return 'half-normal';
    case 'row-preamp-in':
    case 'row-tilt-out':
    case 'row-aurora-da-otb':
    case 'row-api-mix-out':
      return 'full-normal';
    default:
      return 'patch-only';
  }
}

function SectionMarker({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-2 px-0.5">
      <div className="flex items-center gap-3">
        <div className="text-silkscreen text-[8px]">{title}</div>
        <div className="h-px flex-1" style={{ background: `linear-gradient(to right, var(--sa-lens-border), transparent)` }} />
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-zinc-600">{subtitle}</p>
    </div>
  );
}

function hasStandaloneEqSection(preamp: Preamp): boolean {
  return preamp.eq_features != null;
}

function compactMeta(parts: Array<string | number | undefined | null>): string {
  return parts.filter(Boolean).join(' · ');
}

function routeRowLabel(rowId: string): string {
  return patchRows.find((row) => row.id === rowId)?.label.toUpperCase() ?? rowId.toUpperCase();
}

const topologyAbbrev: Record<string, string> = {
  'variable mu': 'δμ',
  'optical': 'Opto',
  'fet 1176': 'FET 76',
  'fet tube': 'FET/Tube',
  'ss limiter': 'SS Lim',
  'vca channel': 'VCA Ch',
  'vca bus': 'VCA Bus',
  'diode bridge': 'Diode Br',
  'zener': 'Zener',
  'discrete transistor': 'Discrete',
  'multiband': 'Multibnd',
  'de esser': 'De-Ess',
  'spectral': 'Spectral',
  'gate': 'Gate',
  'passive inductor': 'Passive',
  'tube reactive': 'Tube React',
  'active inductor': 'Active Ind',
  'tilt': 'Tilt',
  'reverb': 'Reverb',
  'delay': 'Delay',
  'multi fx': 'Multi FX',
  'enhancer': 'Enhancer',
  'noise reduction': 'NR',
  'restoration': 'Restore',
  'sub bass': 'Sub Bass',
};

function abbreviateTopology(label: string): string {
  return topologyAbbrev[label.toLowerCase()] ?? label;
}

function groupByLabel<T>(items: T[], getLabel: (item: T) => string): Array<{ id: string; label: string; items: T[] }> {
  const groups = new Map<string, { label: string; items: T[] }>();

  items.forEach((item) => {
    const label = getLabel(item);
    const key = label.toLowerCase();
    const existing = groups.get(key);

    if (existing) {
      existing.items.push(item);
      return;
    }

    groups.set(key, { label, items: [item] });
  });

  return Array.from(groups.entries()).map(([id, group]) => ({ id, label: group.label, items: group.items }));
}

function nextStep(mode: StudioMode, selectedMic: Microphone | null, selectedPreamp: Preamp | null, insertChain: InsertProcessor[], parallelChain: ParallelProcessor[]): { rowId: string; heading: string; body: string } {
  if (mode === 'mixing') {
    if (insertChain.length === 0 && parallelChain.length === 0) {
      return {
        rowId: 'row-preamp-out',
        heading: 'Summing path armed',
        body: 'Playback already lands in the summing core through the default normals. Open a bus insert or return path only when the mix needs a deliberate departure.',
      };
    }

    if (parallelChain.length > 0) {
      return {
        rowId: 'row-pueblo-in',
        heading: 'Parallel color is in play',
        body: 'The return path is now part of the console story. Follow how the tributary rejoins the mix and confirm that the extra width or space earns its place.',
      };
    }

    return {
      rowId: 'row-api-mix-out',
      heading: 'Bus path is active',
      body: 'You are no longer hearing only the default mix path. The bus field below now determines how the analog sum behaves before print.',
    };
  }

  if (!selectedMic) {
    return {
      rowId: 'row-mic-ties',
      heading: 'Mic tie lines',
      body: 'Start on the source side. Choose a microphone and let the normalled capture path reveal how the studio is already prepared to record.',
    };
  }

  if (!selectedPreamp) {
    return {
      rowId: 'row-preamp-in',
      heading: 'Choose the first gain stage',
      body: `${selectedMic.name} is waiting at the bay. Patch it into a preamp so the default route can continue cleanly to capture.`,
    };
  }

  if (insertChain.length === 0 && parallelChain.length === 0) {
    return {
      rowId: 'row-dynamics',
      heading: 'Default capture path is complete',
      body: 'You are already reaching the recorder. Open the outboard field only if you want to commit extra shape, control, or character on the way in.',
    };
  }

  return {
    rowId: 'row-ad-daw',
    heading: 'Custom signal path active',
    body: 'The route now departs from the studio default. Trace it through the panels below and make sure every added stage is worth the commitment.',
  };
}

function rowActive(rowId: string, mode: StudioMode, selectedMic: Microphone | null, selectedPreamp: Preamp | null, insertChain: InsertProcessor[], parallelChain: ParallelProcessor[]): boolean {
  if (mode === 'mixing' && ['row-aurora-da-out', 'row-tilt-in', 'row-tilt-out', 'row-api-line-in', 'row-insert-send', 'row-api-mix-out', 'row-pueblo-in', 'row-pueblo-out', 'row-dbox-io', 'row-ad-daw'].includes(rowId)) {
    return true;
  }

  switch (rowId) {
    case 'row-mic-ties':
      return selectedMic != null;
    case 'row-preamp-in':
    case 'row-preamp-out':
      return selectedMic != null || selectedPreamp != null;
    case 'row-api-line-in':
    case 'row-insert-send':
    case 'row-insert-return':
    case 'row-api-mix-out':
    case 'row-pueblo-in':
    case 'row-pueblo-out':
    case 'row-dbox-io':
    case 'row-ad-daw':
      return selectedPreamp != null || mode === 'mixing';
    case 'row-dynamics':
      return insertChain.some((processor) => processor.type === 'compressor') || parallelChain.some((processor) => processor.type === 'compressor');
    case 'row-eq':
      return insertChain.some((processor) => processor.type === 'equalizer' || processor.type === 'preamp-eq');
    case 'row-spatial':
      return insertChain.some((processor) => processor.type === 'outboard');
    case 'row-fx':
      return parallelChain.some((processor) => processor.type === 'outboard');
    default:
      return false;
  }
}

function RowShell({ rowId, order, label, active, isNext, mode, children }: { rowId: string; order: number | string; label: string; active: boolean; isNext: boolean; mode: StudioMode; children: ReactNode }) {
  const isFocused = modeFocusedRows[mode].has(rowId);
  const normalMode = rowNormalMode(rowId);
  const ledClass = isNext ? 'led led-amber' : active ? 'led led-green' : 'led led-off';

  return (
    <section
      data-row-id={rowId}
      className={`
        mat-brushed-dark mat-rack-panel relative overflow-hidden rounded-[3px] border px-3 py-2 md:px-4 md:py-3
        transition-opacity duration-500
        ${rowShellTone[rowId] ?? rowShellTone['row-mic-ties']}
        ${isFocused ? 'opacity-100' : 'opacity-[0.88]'}
        ${isNext ? 'ring-1 ring-inset ring-amber-400/20' : ''}
        ${active ? 'signal-live' : ''}
      `.trim()}
      style={{
        borderTopColor: isFocused ? 'var(--sa-lens-border)' : undefined,
        backgroundImage: isFocused ? 'linear-gradient(180deg, var(--sa-lens-wash) 0%, transparent 40%)' : undefined,
      }}
    >
      {/* Corner screwheads */}
      <div className="pointer-events-none absolute inset-0">
        <span className="screwhead absolute left-2 top-2" />
        <span className="screwhead absolute right-2 top-2" />
        <span className="screwhead absolute bottom-2 left-2" />
        <span className="screwhead absolute bottom-2 right-2" />
      </div>

      {/* Panel header — engraved silkscreen label strip */}
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2.5">
            <span className={ledClass} />
            <span className="text-silkscreen text-[9px]">{order}</span>
            <span className="text-silkscreen text-[9px]">{label}</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            <span className={`mat-recess rounded-[2px] px-2 py-0.5 text-[8px] text-silkscreen-faint ${normalModeMeta[normalMode].badge}`}>{normalModeMeta[normalMode].label}</span>
            {active && <span className="mat-recess rounded-[2px] px-2 py-0.5 text-[8px] text-silkscreen-faint">Signal live</span>}
            {isFocused && <span className="mat-recess rounded-[2px] px-2 py-0.5 text-[8px] text-engraved">{mode === 'tracking' ? 'Capture focus' : 'Mix focus'}</span>}
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}

function DetailTray({ title, caption, children, toneClass, position = 'below', onClose }: { title: string; caption: string; children: ReactNode; toneClass: string; position?: 'above' | 'below'; onClose?: () => void }) {
  return (
    <div className={`${position === 'above' ? 'mb-2' : 'mt-2'} mat-recess rounded-[3px] p-2.5 md:p-3 ${toneClass}`}>
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <div className="hidden text-silkscreen-faint text-[8px] sm:block">Focused view</div>
          {onClose && (
            <button type="button" onClick={onClose} className="flex h-5 w-5 items-center justify-center rounded-sm text-zinc-500 transition-colors hover:bg-zinc-700/40 hover:text-zinc-300" aria-label="Close">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="1" y1="1" x2="9" y2="9" /><line x1="9" y1="1" x2="1" y2="9" /></svg>
            </button>
          )}
        </div>
        <div className="mt-1 text-sm font-medium" style={{ color: 'var(--sa-cream)' }}>{title}</div>
        <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{caption}</p>
      </div>
      {children}
    </div>
  );
}

function expandBaySegments(segments: PairedBaySegment[]): ExpandedBayPoint[] {
  const expanded: ExpandedBayPoint[] = [];

  segments.forEach((segment) => {
    const start = segment.startNumber ?? 1;

    for (let index = 0; index < segment.count; index += 1) {
      expanded.push({ tone: segment.tone, number: start + index, segmentId: segment.id });
    }
  });

  return expanded;
}

function toPairedSegments(segments: BaySegment[]): PairedBaySegment[] {
  let start = 1;
  return segments.map((s) => {
    const paired: PairedBaySegment = { ...s, startNumber: start };
    start += s.count;
    return paired;
  });
}

function StackedBayFace({
  rowId,
  topSegments,
  bottomSegments,
  selectedTopPoints = [],
  selectedBottomPoints = [],
  openTopSegmentId,
  onTopSegmentClick,
  openBottomSegmentId,
  onBottomSegmentClick,
  onTopJackClick,
  onBottomJackClick,
  segmentButtonProps,
  normalMode = 'patch-only',
}: {
  rowId: string;
  topSegments: PairedBaySegment[];
  bottomSegments: PairedBaySegment[];
  selectedTopPoints?: number[];
  selectedBottomPoints?: number[];
  openTopSegmentId?: string | null;
  onTopSegmentClick?: (segmentId: string) => void;
  openBottomSegmentId?: string | null;
  onBottomSegmentClick?: (segmentId: string) => void;
  onTopJackClick?: (segmentId: string) => void;
  onBottomJackClick?: (segmentId: string) => void;
  segmentButtonProps?: SegmentButtonProps;
  normalMode?: BayNormalMode;
}) {
  const topEntries = expandBaySegments(topSegments);
  const bottomEntries = expandBaySegments(bottomSegments);
  const totalColumns = Math.max(topEntries.length, bottomEntries.length, BAY_ROW_LENGTH);
  const selectedTop = new Set(selectedTopPoints);
  const selectedBottom = new Set(selectedBottomPoints);

  const bridgeClassForColumn = (hasPair: boolean) => {
    if (!hasPair) return 'bg-zinc-900/40';
    if (normalMode === 'full-normal') return 'bg-emerald-300/80';
    if (normalMode === 'half-normal') return 'border-l border-dashed border-amber-200/80';
    return 'bg-zinc-700/35';
  };

  const renderStrip = (segments: PairedBaySegment[], activeSegmentId?: string | null, onClick?: (segmentId: string) => void) => {
    const usedColumns = segments.reduce((sum, segment) => sum + segment.count, 0);

    return (
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))` }}>
        {segments.map((segment) => {
          const content = segment.subLabels ? (
            <div className={`rounded-md px-0.5 py-1 text-center ${bayToneClasses[segment.tone].strip} ${activeSegmentId === segment.id ? `ring-1 ring-inset ${bayToneClasses[segment.tone].ring}` : ''}`} title={segment.label}>
              <div className="text-[8px] uppercase tracking-[0.08em] leading-tight">{segment.label}</div>
              <div className="flex justify-around text-[7px] uppercase tracking-[0.06em] leading-tight">{segment.subLabels.map((sub) => <span key={sub}>{sub}</span>)}</div>
            </div>
          ) : (
            <span className={`block truncate rounded-[2px] px-0.5 py-1.5 text-center text-[8px] uppercase tracking-[0.08em] ${bayToneClasses[segment.tone].strip} ${activeSegmentId === segment.id ? `ring-1 ring-inset ${bayToneClasses[segment.tone].ring}` : ''}`} title={segment.label}>
              {segment.label}
            </span>
          );

          return onClick ? (
            <button key={segment.id} type="button" onClick={() => onClick(segment.id)} style={{ gridColumn: `span ${segment.count} / span ${segment.count}` }} {...segmentButtonProps}>
              {content}
            </button>
          ) : (
            <div key={segment.id} style={{ gridColumn: `span ${segment.count} / span ${segment.count}` }}>
              {content}
            </div>
          );
        })}
        {usedColumns < totalColumns && (
          <div className="mat-recess rounded-[2px] border border-zinc-800/20 px-2 py-1 text-center text-silkscreen-faint text-[8px]" style={{ gridColumn: `span ${totalColumns - usedColumns} / span ${totalColumns - usedColumns}` }}>
            open
          </div>
        )}
      </div>
    );
  };

  const renderSocketRow = (entries: ExpandedBayPoint[], selectedSet: Set<number>, position: 'top' | 'bottom') => {
    const rowHue = normalMode === 'patch-only' ? 'tt-jack-unnormalled' : position === 'top' ? 'tt-jack-top' : 'tt-jack-bottom';
    const jackClick = position === 'top' ? (onTopJackClick ?? onTopSegmentClick) : (onBottomJackClick ?? onBottomSegmentClick);
    return (
    <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))` }}>
      {Array.from({ length: totalColumns }, (_, index) => {
        const entry = entries[index] ?? null;
        const selected = entry?.number != null && selectedSet.has(entry.number);
        const clickable = jackClick && entry;

        return (
          <div key={`${entry?.segmentId ?? 'open'}-${index}`} className="flex justify-center">
            <span
              className={`tt-jack flex items-center justify-center sm:h-[24px] sm:w-[24px] ${selected ? 'tt-jack-selected' : entry ? rowHue : 'opacity-40'} ${clickable ? 'cursor-pointer' : ''}`}
              style={selected && entry ? { color: bayToneClasses[entry.tone].accent } : undefined}
              onClick={clickable ? () => jackClick(entry.segmentId) : undefined}
              {...(selected && entry?.number != null ? { 'data-selected-point': `${rowId}-${position}-${entry.number}` } : {})}
            >
              {entry?.number ?? ''}
            </span>
          </div>
        );
      })}
    </div>
    );
  };

  const renderBridgeRow = () => (
    <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))` }}>
      {Array.from({ length: totalColumns }, (_, index) => {
        const hasPair = Boolean(topEntries[index] && bottomEntries[index]);
        return (
          <div key={`bridge-${index}`} className="flex justify-center">
            <span className={`h-3 w-px ${bridgeClassForColumn(hasPair)}`} />
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="mat-brushed-mid mat-recess rounded-[3px] px-2.5 py-2">
      <div className="mb-1.5 flex items-center justify-between text-silkscreen-faint text-[8px]">
        <span>Top row</span>
        <span>{normalModeMeta[normalMode].label}</span>
        <span>Bottom row</span>
      </div>
      <div className="space-y-1.5">
        {renderStrip(topSegments, openTopSegmentId, onTopSegmentClick)}
        {renderSocketRow(topEntries, selectedTop, 'top')}
        {renderBridgeRow()}
        {renderSocketRow(bottomEntries, selectedBottom, 'bottom')}
        {renderStrip(bottomSegments, openBottomSegmentId ?? openTopSegmentId, onBottomSegmentClick ?? onTopSegmentClick)}
      </div>
    </div>
  );
}

function PhysicalPairedBay({
  topSegments,
  bottomSegments,
  openSegmentId,
  onSegmentClick,
  normalMode = 'half-normal',
}: {
  topSegments: PairedBaySegment[];
  bottomSegments: PairedBaySegment[];
  openSegmentId?: string | null;
  onSegmentClick?: (segmentId: string) => void;
  normalMode?: BayNormalMode;
}) {
  const totalColumns = Math.max(
    topSegments.reduce((sum, segment) => sum + segment.count, 0),
    bottomSegments.reduce((sum, segment) => sum + segment.count, 0),
    BAY_ROW_LENGTH
  );

  const topEntries = expandBaySegments(topSegments);
  const bottomEntries = expandBaySegments(bottomSegments);

  return (
    <div className="mat-brushed-mid mat-recess rounded-[3px] px-2.5 py-2">
      <div className="mb-1.5 flex items-center justify-between text-silkscreen-faint text-[8px]">
        <span>Top row</span>
        <span>{normalModeMeta[normalMode].label}</span>
        <span>Bottom row</span>
      </div>
      <div className="space-y-1.5">
        <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))` }}>
          {topSegments.map((segment) => {
            const isOpen = openSegmentId === segment.id;
              const ringClass = isOpen ? `ring-1 ring-inset ${bayToneClasses[segment.tone].ring}` : '';
              const content = segment.subLabels ? (
                <div className={`rounded-[2px] px-0.5 py-1 text-center ${bayToneClasses[segment.tone].strip} ${ringClass}`} title={segment.label}>
                  <div className="text-[8px] uppercase tracking-[0.08em] leading-tight">{segment.label}</div>
                  <div className="flex justify-around text-[7px] uppercase tracking-[0.06em] leading-tight">{segment.subLabels.map((sub) => <span key={sub}>{sub}</span>)}</div>
                </div>
              ) : (
                <span className={`block truncate rounded-[2px] px-0.5 py-1.5 text-center text-[8px] uppercase tracking-[0.08em] ${bayToneClasses[segment.tone].strip} ${ringClass}`} title={segment.label}>
                  {segment.label}
                </span>
              );

              return onSegmentClick ? (
                <button key={`top-${segment.id}`} type="button" onClick={() => onSegmentClick(segment.id)} style={{ gridColumn: `span ${segment.count} / span ${segment.count}` }}>
                  {content}
                </button>
              ) : (
                <div key={`top-${segment.id}`} style={{ gridColumn: `span ${segment.count} / span ${segment.count}` }}>
                  {content}
                </div>
              );
            })}
            {topEntries.length < totalColumns && (
              <div className="mat-recess rounded-[2px] border border-zinc-800/20 px-1 py-1 text-center text-silkscreen-faint text-[8px]" style={{ gridColumn: `span ${totalColumns - topEntries.length} / span ${totalColumns - topEntries.length}` }}>
                open
              </div>
            )}
          </div>

          <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))` }}>
            {Array.from({ length: totalColumns }, (_, index) => {
              const top = topEntries[index] ?? null;
              const bottom = bottomEntries[index] ?? null;

              return (
                <div key={index} className="flex flex-col items-center gap-1">
                  <span
                    className={`tt-jack flex items-center justify-center tt-jack-top ${top ? '' : 'opacity-40'} ${onSegmentClick && top ? 'cursor-pointer' : ''}`}
                    onClick={onSegmentClick && top ? () => onSegmentClick(top.segmentId) : undefined}
                  >
                    {top?.number ?? ''}
                  </span>
                  <span className={`h-3 w-px ${top && bottom ? (normalMode === 'full-normal' ? 'bg-emerald-300/60' : normalMode === 'half-normal' ? 'border-l border-dashed border-amber-200/50' : 'bg-zinc-700/25') : 'bg-zinc-800/30'}`} />
                  <span
                    className={`tt-jack flex items-center justify-center tt-jack-bottom ${bottom ? '' : 'opacity-40'} ${onSegmentClick && bottom ? 'cursor-pointer' : ''}`}
                    onClick={onSegmentClick && bottom ? () => onSegmentClick(bottom.segmentId) : undefined}
                  >
                    {bottom?.number ?? ''}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))` }}>
            {bottomSegments.map((segment) => {
              const isOpen = openSegmentId === segment.id;
              const ringClass = isOpen ? `ring-1 ring-inset ${bayToneClasses[segment.tone].ring}` : '';
              const content = segment.subLabels ? (
                <div className={`rounded-[2px] px-0.5 py-1 text-center ${bayToneClasses[segment.tone].strip} ${ringClass}`} title={segment.label}>
                  <div className="text-[8px] uppercase tracking-[0.08em] leading-tight">{segment.label}</div>
                  <div className="flex justify-around text-[7px] uppercase tracking-[0.06em] leading-tight">{segment.subLabels.map((sub) => <span key={sub}>{sub}</span>)}</div>
                </div>
              ) : (
                <span className={`block truncate rounded-[2px] px-0.5 py-1.5 text-center text-[8px] uppercase tracking-[0.08em] ${bayToneClasses[segment.tone].strip} ${ringClass}`} title={segment.label}>
                  {segment.label}
                </span>
              );

              return onSegmentClick ? (
                <button key={`bottom-${segment.id}`} type="button" onClick={() => onSegmentClick(segment.id)} style={{ gridColumn: `span ${segment.count} / span ${segment.count}` }}>
                  {content}
                </button>
              ) : (
                <div key={`bottom-${segment.id}`} style={{ gridColumn: `span ${segment.count} / span ${segment.count}` }}>
                  {content}
                </div>
              );
            })}
            {bottomEntries.length < totalColumns && (
              <div className="mat-recess rounded-[2px] border border-zinc-800/20 px-1 py-1 text-center text-silkscreen-faint text-[8px]" style={{ gridColumn: `span ${totalColumns - bottomEntries.length} / span ${totalColumns - bottomEntries.length}` }}>
                open
              </div>
            )}
          </div>
        </div>
    </div>
  );
}

function ActionButton({ children, active = false, tone = 'zinc', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; tone?: 'amber' | 'blue' | 'teal' | 'cyan' | 'violet' | 'zinc' | 'lens' }) {
  const tones = {
    amber: active
      ? 'border-amber-500/50 bg-amber-500/15 text-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
      : 'border-amber-800/25 bg-[#141210] text-amber-300/70 hover:bg-amber-950/30 hover:text-amber-200',
    blue: active
      ? 'border-blue-500/50 bg-blue-500/15 text-blue-200 shadow-[0_0_8px_rgba(59,130,246,0.15)]'
      : 'border-blue-800/25 bg-[#101214] text-blue-300/70 hover:bg-blue-950/30 hover:text-blue-200',
    teal: active
      ? 'border-teal-500/50 bg-teal-500/15 text-teal-200 shadow-[0_0_8px_rgba(20,184,166,0.15)]'
      : 'border-teal-800/25 bg-[#0f1312] text-teal-300/70 hover:bg-teal-950/30 hover:text-teal-200',
    cyan: active
      ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-200 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
      : 'border-cyan-800/25 bg-[#0f1314] text-cyan-300/70 hover:bg-cyan-950/30 hover:text-cyan-200',
    violet: active
      ? 'border-violet-500/50 bg-violet-500/15 text-violet-200 shadow-[0_0_8px_rgba(139,92,246,0.15)]'
      : 'border-violet-800/25 bg-[#121014] text-violet-300/70 hover:bg-violet-950/30 hover:text-violet-200',
    zinc: active
      ? 'border-zinc-400/40 bg-zinc-400/10 text-zinc-200'
      : 'border-zinc-700/40 bg-[#111110] text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-300',
    lens: active
      ? 'text-zinc-100'
      : 'text-zinc-300 hover:text-zinc-100',
  };

  const isLens = tone === 'lens';

  return (
    <button
      {...props}
      className={`rounded-[2px] border px-3 py-1.5 text-silkscreen text-[9px] transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] hover:-translate-y-[0.5px] ${tones[tone]} ${className}`.trim()}
      style={isLens ? { borderColor: 'var(--sa-lens-border)', backgroundColor: 'var(--sa-lens-wash)', color: 'var(--sa-lens-text)' } : undefined}
    >
      {children}
    </button>
  );
}

function CompactChoice({ pointNumber, tone, title, meta, body, detailLabel = 'Unit details', selected, primaryLabel, primaryActive = selected, onPrimary, onInspect, extraAction }: { pointNumber: number; tone: BayTone; title: string; meta: string; body?: string; detailLabel?: string; selected: boolean; primaryLabel: string; primaryActive?: boolean; onPrimary: () => void; onInspect: () => void; extraAction?: ReactNode }) {
  return (
    <div className={`mat-brushed-dark rounded-[3px] border px-3 py-2 transition-all duration-300 ${selected ? 'border-zinc-600/40 mat-raised' : 'border-zinc-800/30'}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 tt-jack flex items-center justify-center ${selected ? 'tt-jack-selected' : ''}`} style={selected ? { color: bayToneClasses[tone].accent } : undefined}>
          {pointNumber}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium" style={{ color: 'var(--sa-cream)' }}>{title}</span>
            {selected && <span className="led led-green" />}
          </div>
          <div className="mt-0.5 text-silkscreen-faint text-[8px]">{meta}</div>
          {body && <p className="mt-1 text-xs leading-relaxed text-zinc-500">{body}</p>}
          <div className="mt-1.5 flex flex-wrap gap-2">
            <ActionButton type="button" onClick={onInspect}>{detailLabel}</ActionButton>
            <ActionButton type="button" onClick={onPrimary} tone="amber" active={primaryActive}>{primaryLabel}</ActionButton>
            {extraAction}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PatchbayView({ perspective, mode, selectedMic, selectedPreamp, insertChain, parallelChain, analysis, routeSummary, perspectiveInsight, sonicSignature, searchQuery, onSelectMic, onSelectPreamp, onAddInsert, onAddParallel, onRemoveInsert, onRemoveParallel, onReorderInserts: _onReorderInserts, onInspect, onClearChain, equalizers, outboardProcessors }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [openSectionByRow, setOpenSectionByRow] = useState<Record<string, string | null>>({});
    const [showCascadeView, setShowCascadeView] = useState(false);

    useEffect(() => {
      const frame = window.requestAnimationFrame(() => setShowCascadeView(true));
      return () => window.cancelAnimationFrame(frame);
    }, []);

  // ── Hybrid mic grouping: vendor pools + topology clusters ──
  const _broadcastIds = new Set(['mic-sm7b', 'mic-ev-re20', 'mic-beyer-x99', 'mic-earthworks-ethos']);
  const _miscDynIds = new Set(['mic-heil-pr40', 'mic-se-v7', 'mic-lewitt-mtp550']);
  const _ribbonIds = new Set(['mic-coles-4038', 'mic-cascade-fathead']);
  const _utilityIds = new Set(['mic-crown-glm200', 'mic-shure-sm91', 'mic-beyer-tgd71', 'mic-zoom-h4npro', 'mic-umik1', 'mic-kraken-subkick']);
  const _specialIds = new Set([..._broadcastIds, ..._miscDynIds, ..._ribbonIds, ..._utilityIds]);

  const _neumannCloneIds = new Set(['mic-stam-sa87-red', 'mic-stam-sa87-black', 'mic-ut-fet47']);

  const _vendorDefs: Array<{ vendor: string; label: string; tone: BayTone }> = [
    { vendor: 'Audix', label: 'Audix', tone: 'purple' },
    { vendor: 'Electro-Voice', label: 'Electro-Voice', tone: 'blue' },
    { vendor: 'Shure', label: 'Shure', tone: 'orange' },
    { vendor: 'Telefunken Elektroakustik', label: 'Telefunken', tone: 'rose' },
    { vendor: 'Sennheiser', label: 'Sennheiser', tone: 'sky' },
    { vendor: 'Beyerdynamic', label: 'Beyerdynamic', tone: 'teal' },
    { vendor: 'AKG', label: 'AKG', tone: 'green' },
    { vendor: 'Audio-Technica', label: 'Audio-Technica', tone: 'lime' },
    { vendor: 'Peavey', label: 'Peavey', tone: 'slate' },
    { vendor: 'Yamaha', label: 'Yamaha', tone: 'cyan' },
    { vendor: 'Wunder Audio', label: 'Wunder', tone: 'amber' },
    { vendor: 'Sony', label: 'Sony', tone: 'sky' },
  ];

  const micGroups: Array<{ label: string; mics: Microphone[]; tone: BayTone }> = [];
  // Neumann Clones drawer (Stams + UT FET47)
  const _neumannCloneMics = microphones.filter((m) => _neumannCloneIds.has(m.id));
  if (_neumannCloneMics.length > 0) micGroups.push({ label: 'Neumann Clones', mics: _neumannCloneMics, tone: 'violet' });

  for (const def of _vendorDefs) {
    const mics = microphones.filter((m) => m.vendor === def.vendor && !_specialIds.has(m.id) && !_neumannCloneIds.has(m.id));
    if (mics.length > 0) micGroups.push({ label: def.label, mics, tone: def.tone });
  }
  const _ribbonMics = microphones.filter((m) => _ribbonIds.has(m.id));
  if (_ribbonMics.length > 0) micGroups.push({ label: 'Ribbons', mics: _ribbonMics, tone: 'red' });
  const _broadcastMics = microphones.filter((m) => _broadcastIds.has(m.id));
  if (_broadcastMics.length > 0) micGroups.push({ label: 'Broadcast', mics: _broadcastMics, tone: 'yellow' });
  const _miscDynMics = microphones.filter((m) => _miscDynIds.has(m.id));
  if (_miscDynMics.length > 0) micGroups.push({ label: 'Misc Dynamics', mics: _miscDynMics, tone: 'orange' });
  const _utilityMics = microphones.filter((m) => _utilityIds.has(m.id));
  if (_utilityMics.length > 0) micGroups.push({ label: 'Utility', mics: _utilityMics, tone: 'slate' });
  const standardPreamps = preamps.filter((preamp) => !hasStandaloneEqSection(preamp));
  const preampEqUnits = preamps.filter(hasStandaloneEqSection);
  const orderedPreamps = [...standardPreamps, ...preampEqUnits];
  const compressorGroups = groupByLabel(compressors, (compressor) => compressor.topology.replace(/-/g, ' '));
  const eqGroups = groupByLabel(equalizers, (equalizer) => equalizer.topology.replace(/-/g, ' '));
  const inlineOutboard = outboardProcessors.filter((processor) => processor.routing_mode === 'inline-optional');
  const parallelFx = outboardProcessors.filter((processor) => processor.routing_mode === 'parallel-send-return');
  const inlineGroups = groupByLabel(inlineOutboard, (processor) => processor.type.replace(/-/g, ' '));
  const fxGroups = groupByLabel(parallelFx, (processor) => processor.type.replace(/-/g, ' '));
  const preampPointNumber = (preampId: string) => {
    let cursor = 1;
    for (const p of orderedPreamps) {
      if (p.id === preampId) return cursor;
      cursor += p.channels;
    }
    return 1;
  };
  const selectedPreampPoints = selectedPreamp
    ? [preampPointNumber(selectedPreamp.id)]
    : [];
  const insertIds = new Set(insertChain.map((processor) => processor.item.id));
  const parallelIds = new Set(parallelChain.map((processor) => processor.item.id));
  const insertPreampEqIds = new Set(insertChain.filter((processor) => processor.type === 'preamp-eq').map((processor) => processor.item.id));

  const micStartPoint = (label: string) => {
    let cursor = 1;

    for (const entry of micGroups) {
      if (entry.label === label) return cursor;
      cursor += entry.mics.length;
    }

    return 1;
  };

  const pointNumberForGroupedItem = <T extends { id: string; channels: number }>(groups: Array<{ items: T[] }>, itemId: string) => {
    let cursor = 1;

    for (const group of groups) {
      for (const item of group.items) {
        if (item.id === itemId) return cursor;
        cursor += item.channels;
      }
    }

    return 1;
  };

  const selectedPointsForItem = <T extends { id: string; channels: number }>(groups: Array<{ items: T[] }>, itemId: string, _channels: number): number[] => {
    const start = pointNumberForGroupedItem(groups, itemId);
    return [start];
  };

  const setOpenSection = (rowId: string, sectionId: string) => {
    setOpenSectionByRow((current) => ({
      ...current,
      [rowId]: current[rowId] === sectionId ? null : sectionId,
    }));
  };

  const clearOpenSection = (rowId: string) => {
    setOpenSectionByRow((current) => ({ ...current, [rowId]: null }));
  };

  const findInsertIndex = (type: InsertProcessor['type'], itemId: string) => insertChain.findIndex((processor) => processor.type === type && processor.item.id === itemId);
  const findParallelIndex = (type: ParallelProcessor['type'], itemId: string) => parallelChain.findIndex((processor) => processor.type === type && processor.item.id === itemId);

  const toggleInsert = (processor: InsertProcessor) => {
    const existingIndex = findInsertIndex(processor.type, processor.item.id);

    if (existingIndex >= 0) {
      onRemoveInsert(existingIndex);
      return;
    }

    onAddInsert(processor);
  };

  const toggleParallel = (processor: ParallelProcessorInput) => {
    const existingIndex = findParallelIndex(processor.type, processor.item.id);

    if (existingIndex >= 0) {
      onRemoveParallel(existingIndex);
      return;
    }

    onAddParallel(processor);
  };

  const guide = nextStep(mode, selectedMic, selectedPreamp, insertChain, parallelChain);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const quickResults = normalizedQuery
    ? [
        ...microphones.map((item) => ({ id: item.id, title: item.name, subtitle: `${item.vendor} · ${item.type}`, tone: micTypeTone[item.type], onUse: () => onSelectMic(item), onInspect: () => onInspect(item.id), actionLabel: 'Use source' })),
        ...preamps.map((item) => ({ id: item.id, title: item.name, subtitle: `${item.vendor} · ${item.topology}`, tone: hasStandaloneEqSection(item) ? 'cyan' as BayTone : 'blue' as BayTone, onUse: () => onSelectPreamp(item), onInspect: () => onInspect(item.id), actionLabel: 'Use preamp' })),
        ...compressors.map((item) => ({ id: item.id, title: item.name, subtitle: `${item.vendor} · ${item.topology}`, tone: 'purple' as BayTone, onUse: () => toggleInsert({ type: 'compressor', item }), onInspect: () => onInspect(item.id), actionLabel: 'Insert' })),
        ...equalizers.map((item) => ({ id: item.id, title: item.name, subtitle: `${item.vendor} · ${item.topology}`, tone: 'teal' as BayTone, onUse: () => toggleInsert({ type: 'equalizer', item }), onInspect: () => onInspect(item.id), actionLabel: 'Insert EQ' })),
        ...outboardProcessors.map((item) => ({ id: item.id, title: item.name, subtitle: `${item.vendor} · ${item.type}`, tone: item.routing_mode === 'parallel-send-return' ? 'sky' as BayTone : 'cyan' as BayTone, onUse: () => item.routing_mode === 'parallel-send-return' ? toggleParallel({ type: 'outboard', item }) : toggleInsert({ type: 'outboard', item }), onInspect: () => onInspect(item.id), actionLabel: item.routing_mode === 'parallel-send-return' ? 'Blend return' : 'Insert' })),
      ].filter((entry) => `${entry.title} ${entry.subtitle}`.toLowerCase().includes(normalizedQuery)).slice(0, 8)
    : [];
  // Tie line segments — simple 1–48 numbered tie lines for Bay 0
  const tieLineSegments: PairedBaySegment[] = [
    { id: 'tie-lines', label: 'XLR Tie Lines 1–48', count: BAY_ROW_LENGTH, tone: 'slate', startNumber: 1 },
  ];
  const standardPreampChannels = standardPreamps.reduce((s, p) => s + p.channels, 0);
  const preampEqChannels = preampEqUnits.reduce((s, p) => s + p.channels, 0);
  const preampSegments: BaySegment[] = [];

  if (standardPreamps.length > 0) {
    preampSegments.push({ id: 'direct-preamp', label: `${standardPreamps.length} preamps`, count: standardPreampChannels, tone: 'blue' });
  }

  if (preampEqUnits.length > 0) {
    preampSegments.push({ id: 'preamp-eq', label: `${preampEqUnits.length} preamp / eq`, count: preampEqChannels, tone: 'cyan' });
  }

  const compressorSegments: BaySegment[] = compressorGroups.map((group) => ({ id: group.id, label: abbreviateTopology(group.label), count: group.items.reduce((s, c) => s + c.channels, 0), tone: 'purple' }));
  const eqSegments: BaySegment[] = eqGroups.map((group) => ({ id: group.id, label: abbreviateTopology(group.label), count: group.items.reduce((s, e) => s + e.channels, 0), tone: 'teal' }));
  const inlineSegments: BaySegment[] = inlineGroups.map((group) => ({ id: group.id, label: abbreviateTopology(group.label), count: group.items.reduce((s, p) => s + p.channels, 0), tone: 'cyan' }));
  const fxSegments: BaySegment[] = fxGroups.map((group) => ({ id: group.id, label: abbreviateTopology(group.label), count: group.items.reduce((s, p) => s + p.channels, 0), tone: 'sky' }));
  const combinedOutboardSegments: BaySegment[] = [...eqSegments, ...inlineSegments, ...fxSegments];

  const allOutboardGroups = [
    ...eqGroups.map((g) => ({ ...g, category: 'eq' as const })),
    ...inlineGroups.map((g) => ({ ...g, category: 'inline' as const })),
    ...fxGroups.map((g) => ({ ...g, category: 'fx' as const })),
  ];

  const pointNumberForCombinedItem = (itemId: string) => {
    let cursor = 1;
    for (const group of allOutboardGroups) {
      for (const item of group.items) {
        if (item.id === itemId) return cursor;
        cursor += item.channels;
      }
    }
    return 1;
  };

  const selectedPointsForCombinedItem = (itemId: string, _channels: number): number[] => {
    const start = pointNumberForCombinedItem(itemId);
    return [start];
  };
  const dawOutputTopSegments: PairedBaySegment[] = [
    { id: 'lynx-line-outputs', label: 'Lynx Line Outputs', count: 24, tone: 'blue', startNumber: 1 },
  ];
  const dawOutputBottomSegments: PairedBaySegment[] = [
    { id: 'api-line-inputs', label: 'API Line Inputs', count: 16, tone: 'lime', startNumber: 1 },
    { id: 'otb-stem-inputs', label: 'OTB Stem Inputs', count: 8, tone: 'amber', startNumber: 17 },
  ];

  const dawInputSegments: PairedBaySegment[] = [
    { id: 'lynx-line-inputs', label: 'Lynx Line Inputs', count: 24, tone: 'green', startNumber: 1 },
  ];
  const preampInputSegments: PairedBaySegment[] = [];

  if (standardPreamps.length > 0) {
    preampInputSegments.push({ id: 'direct-preamp-inputs', label: 'Preamp Inputs', count: standardPreampChannels, tone: 'blue', startNumber: 1 });
  }

  if (preampEqUnits.length > 0) {
    preampInputSegments.push({ id: 'preamp-eq-inputs', label: 'Preamp / EQ Inputs', count: preampEqChannels, tone: 'cyan', startNumber: standardPreampChannels + 1 });
  }

  preampInputSegments.push({ id: 'otb16-line-inputs', label: 'OTB16 Line Inputs', count: 4, tone: 'amber', startNumber: standardPreampChannels + preampEqChannels + 1 });

  const preampOutputSegments: PairedBaySegment[] = [];

  if (standardPreamps.length > 0) {
    preampOutputSegments.push({ id: 'direct-preamp-outputs', label: 'Preamp Outputs', count: standardPreampChannels, tone: 'orange', startNumber: 1 });
  }

  if (preampEqUnits.length > 0) {
    preampOutputSegments.push({ id: 'preamp-eq-outputs', label: 'Preamp / EQ Outputs', count: preampEqChannels, tone: 'teal', startNumber: standardPreampChannels + 1 });
  }

  preampOutputSegments.push({ id: 'otb16-line-outputs', label: 'OTB16 Line Outputs', count: 4, tone: 'amber', startNumber: standardPreampChannels + preampEqChannels + 1 });

  const insertSendSegments: PairedBaySegment[] = [
    { id: 'api-insert-sends', label: 'API Insert Sends', count: 16, tone: 'violet', startNumber: 1 },
    { id: 'mix-a-send', label: 'A Send', count: 2, tone: 'purple', startNumber: 17 },
    { id: 'mix-b-send', label: 'B Send', count: 2, tone: 'purple', startNumber: 19 },
    { id: 'master-send', label: 'Main Send', count: 2, tone: 'purple', startNumber: 21 },
    { id: 'pueblo-banks', label: 'Pueblo Sum', count: 8, tone: 'yellow', startNumber: 23, subLabels: ['A', 'B', 'C', 'D'] },
    { id: 'dbox-out', label: 'dBox Out', count: 2, tone: 'blue', startNumber: 31 },
    { id: 'atty-out', label: 'ATTY', count: 6, tone: 'teal', startNumber: 33 },
    { id: 'main-vu-out', label: 'Main VU', count: 2, tone: 'amber', startNumber: 39 },
  ];
  const insertReturnSegments: PairedBaySegment[] = [
    { id: 'api-insert-returns', label: 'API Insert Returns', count: 16, tone: 'violet', startNumber: 1 },
    { id: 'mix-a-return', label: 'A Return', count: 2, tone: 'purple', startNumber: 17 },
    { id: 'mix-b-return', label: 'B Return', count: 2, tone: 'purple', startNumber: 19 },
    { id: 'master-return', label: 'Main Return', count: 2, tone: 'purple', startNumber: 21 },
    { id: 'dbox-sum', label: 'dBox+ Sum', count: 8, tone: 'lime', startNumber: 23 },
    { id: 'adplus-in-a', label: 'AD+ In A', count: 2, tone: 'red', startNumber: 31 },
    { id: 'atty-in', label: 'St.A / St.B / C / D', count: 6, tone: 'teal', startNumber: 33 },
    { id: 'main-vu-in', label: 'VU In', count: 2, tone: 'amber', startNumber: 39 },
  ];

  // ── Bay 11: API Mix Buses ──
  const apiMixTopSegments: PairedBaySegment[] = [
    { id: 'api-mix-a-out', label: 'Mix A Out', count: 2, tone: 'amber', startNumber: 1 },
    { id: 'api-mix-b-out', label: 'Mix B Out', count: 2, tone: 'amber', startNumber: 3 },
    { id: 'api-master-out', label: 'Master Out', count: 2, tone: 'amber', startNumber: 5 },
    { id: 'api-cue-out', label: 'Cue Out', count: 2, tone: 'yellow', startNumber: 7 },
  ];
  const apiMixBottomSegments: PairedBaySegment[] = [
    { id: 'api-ext-in', label: 'Ext Input (OTB)', count: 2, tone: 'amber', startNumber: 1 },
    { id: 'api-mix-a-patch', label: 'Mix A Patch', count: 2, tone: 'amber', startNumber: 3 },
    { id: 'api-mix-b-patch', label: 'Mix B Patch', count: 2, tone: 'amber', startNumber: 5 },
    { id: 'api-talkback', label: 'Talkback', count: 1, tone: 'yellow', startNumber: 7 },
  ];

  // ── Bay 12: Pueblo / Tonelux OTB ──
  const puebloTopSegments: PairedBaySegment[] = [
    { id: 'pueblo-bank-a', label: 'Bank A', count: 8, tone: 'yellow', startNumber: 1, subLabels: ['1', '2', '3', '4', '5', '6', '7', '8'] },
    { id: 'pueblo-bank-b', label: 'Bank B', count: 8, tone: 'yellow', startNumber: 9, subLabels: ['1', '2', '3', '4', '5', '6', '7', '8'] },
    { id: 'pueblo-bank-c', label: 'Bank C', count: 8, tone: 'yellow', startNumber: 17, subLabels: ['1', '2', '3', '4', '5', '6', '7', '8'] },
    { id: 'pueblo-bank-d', label: 'Bank D', count: 8, tone: 'amber', startNumber: 25, subLabels: ['1', '2', '3', '4', '5', '6', '7', '8'] },
  ];
  const puebloBottomSegments: PairedBaySegment[] = [
    { id: 'pueblo-out-a', label: 'A Out', count: 2, tone: 'yellow', startNumber: 1 },
    { id: 'pueblo-out-b', label: 'B Out', count: 2, tone: 'yellow', startNumber: 3 },
    { id: 'pueblo-out-c', label: 'C Out', count: 2, tone: 'yellow', startNumber: 5 },
    { id: 'pueblo-out-d', label: 'D Out', count: 2, tone: 'amber', startNumber: 7 },
    { id: 'otb-ch-inputs', label: 'OTB Ch 1–8', count: 8, tone: 'orange', startNumber: 9, subLabels: ['1', '2', '3', '4', '5', '6', '7', '8'] },
    { id: 'otb-ext-in', label: 'OTB Ext In', count: 2, tone: 'orange', startNumber: 17 },
    { id: 'otb-main-out', label: 'OTB Main', count: 2, tone: 'red', startNumber: 19 },
    { id: 'otb-mon-out', label: 'OTB Mon', count: 2, tone: 'orange', startNumber: 21 },
  ];

  // ── Bay 13: AD+ / DAW ──
  const adDawTopSegments: PairedBaySegment[] = [
    { id: 'adplus-input-a', label: 'AD+ Input A', count: 2, tone: 'blue', startNumber: 1 },
    { id: 'adplus-input-b', label: 'AD+ Input B', count: 2, tone: 'blue', startNumber: 3 },
    { id: 'adplus-xformer-send', label: 'X-Fmr Send', count: 2, tone: 'purple', startNumber: 5 },
    { id: 'adplus-xformer-return', label: 'X-Fmr Return', count: 2, tone: 'purple', startNumber: 7 },
    { id: 'adplus-emphasis', label: 'Emphasis', count: 2, tone: 'violet', startNumber: 9 },
  ];
  const adDawBottomSegments: PairedBaySegment[] = [
    { id: 'adplus-aes-out', label: 'AES Out', count: 2, tone: 'sky', startNumber: 1 },
    { id: 'aurora-aes-in', label: 'Aurora AES In', count: 2, tone: 'sky', startNumber: 3 },
    { id: 'dbox-aes-in', label: 'D-Box+ AES', count: 2, tone: 'lime', startNumber: 5 },
    { id: 'dbox-analog-in', label: 'D-Box+ Analog', count: 2, tone: 'lime', startNumber: 7 },
    { id: 'dbox-speakers-a', label: 'Spkr A', count: 2, tone: 'green', startNumber: 9 },
    { id: 'dbox-speakers-b', label: 'Spkr B', count: 2, tone: 'green', startNumber: 11 },
    { id: 'dbox-speakers-c', label: 'Spkr C', count: 2, tone: 'green', startNumber: 13 },
  ];

  const selectedMicPoint = selectedMic ? (() => {
    const group = micGroups.find((g) => g.mics.some((m) => m.id === selectedMic.id));
    if (!group) return 0;
    return micStartPoint(group.label);
  })() : 0;

  const segmentInfo: Record<string, { title: string; description: string }> = {
    // Bay 1 — Preamp Outputs / DAW Inputs
    'lynx-line-inputs': {
      title: 'Lynx Aurora(n) Line Inputs',
      description: 'Mastering-grade multichannel AD conversion feeding the DAW. SynchroLock 2 jitter elimination and dedicated converter arrays per channel pair deliver transparent capture with ultra-low crosstalk (−130 dB). These inputs receive mic preamp outputs for tracking or outboard returns for mixing.',
    },
    // Bay 2 — DAW Outputs / Console Inputs
    'lynx-line-outputs': {
      title: 'Lynx Aurora(n) Line Outputs',
      description: 'Mastering-grade multichannel DA conversion with dedicated converter arrays per channel pair for ultra-low crosstalk (−130 dB). SynchroLock 2 jitter elimination keeps the analog output pristine. These are clean, transparent line-level feeds from the DAW — the sonic character of this path is essentially whatever the session contains.',
    },
    'api-line-inputs': {
      title: 'API ASM164 Line Inputs (Ch 1–16)',
      description: 'The 16-channel summing mixer\'s direct line inputs, receiving Aurora outputs 1–16 via inline Tilt EQs (hardwired outside the patchbay). API 2510 input op-amps and 2520 output op-amps built to MIL-Spec standard. Each channel has per-channel panning, 31-step detented level control, and an always-active insert send/return. Signals are assigned to the Mix A or Mix B stereo program bus.',
    },
    'otb-stem-inputs': {
      title: 'Tonelux OTB-16 Stem Inputs (Ch 1–8)',
      description: 'Eight overflow stem channels from Aurora outputs 17–24. The OTB sums these stems together with the FX tributary arriving on its external input and stamps the combined result through its TX-100 output transformer before feeding the API external input. Per-channel level and pan. TX-240/TX-260 discrete op-amp summing topology.',
    },
    // Bay 4 — Insert Sends / Returns
    'api-insert-sends': {
      title: 'API ASM164 Channel Insert Sends',
      description: 'Per-channel insert send points on the API ASM164. These tap the signal after the input stage but before the pan pot and mix-bus assignment, allowing outboard processing of individual channels without passing through the line input circuit again on return.',
    },
    'api-insert-returns': {
      title: 'API ASM164 Channel Insert Returns',
      description: 'The return side of the per-channel insert loop. Processed signal re-enters the channel path before the pan and bus assignment stage, preserving the full API summing topology downstream.',
    },
    'mix-a-send': {
      title: 'API ASM164 Mix A Send',
      description: 'Stereo insert send from the Mix A program bus. Taps the summed stereo bus signal before the master output stage, allowing bus-level processing (compression, EQ, limiting) on the entire Mix A stem.',
    },
    'mix-a-return': {
      title: 'API ASM164 Mix A Return',
      description: 'Return path for the Mix A bus insert. Processed signal re-enters the Mix A master output stage.',
    },
    'mix-b-send': {
      title: 'API ASM164 Mix B Send',
      description: 'Stereo insert send from the Mix B program bus. Same topology as Mix A — a second independent stereo bus for stems or parallel processing.',
    },
    'mix-b-return': {
      title: 'API ASM164 Mix B Return',
      description: 'Return path for the Mix B bus insert.',
    },
    'master-send': {
      title: 'API ASM164 Master Send',
      description: 'Stereo insert send on the master output bus. This is the final analog summing point — processing here affects the combined Mix A + Mix B signal before it reaches the monitor path or print chain.',
    },
    'master-return': {
      title: 'API ASM164 Master Return',
      description: 'Return path for the master bus insert. The last analog insertion point before the output stage.',
    },
    'pueblo-banks': {
      title: 'Pueblo Audio HJ482 Sum Outputs',
      description: 'Stereo sum outputs from each of the four Pueblo banks (A–D). Each bank independently sums its assigned inputs to a stereo pair. Banks can cascade into Bank D for a final combined sum, or feed separate destinations for parallel stem management.',
    },
    'dbox-sum': {
      title: 'Dangerous Music D-Box+ Sum Inputs',
      description: 'Eight analog summing inputs on the D-Box+. Signals patched here are summed through the Dangerous Music analog path with its signature clarity and musicality, then available on the D-Box+ monitor outputs or routed to the AD+ for print.',
    },
    'dbox-out': {
      title: 'Dangerous Music D-Box+ Line Output',
      description: 'Stereo line output from the D-Box+ monitor controller and summing unit. This is the D-Box+ main output after its internal summing and monitoring stage — typically routed to the print chain or an external destination.',
    },
    'adplus-in-a': {
      title: 'Dangerous Music AD+ Input A',
      description: 'Primary stereo analog input on the AD+ converter. Features switchable Hammond transformers for optional harmonic color, proprietary Emphasis control, and JetPLL jitter elimination. This is the mastering-grade analog-to-digital conversion point for printing the final mix.',
    },
    'atty-out': {
      title: 'A-Designs ATTY2 Outputs',
      description: 'Outputs from the A-Designs ATTY2 passive attenuator rack. Provides two stereo and two mono channels of stepped passive attenuation (0–20 dB) with a mute function. Zero coloration — purely resistive level control ideal for managing hot signals before sensitive destinations.',
    },
    'atty-in': {
      title: 'A-Designs ATTY2 Inputs',
      description: 'Inputs to the ATTY2 passive attenuator. Two stereo pairs (St. A, St. B) and two mono channels (C, D). Passive design means no active electronics in the signal path — attenuation without noise or distortion.',
    },
    'main-vu-out': {
      title: 'McCurdy ATS-100 VU Output',
      description: 'Output from the McCurdy ATS-100 VU metering unit. Vintage broadcast-quality metering with calibrated ballistics for accurate visual feedback during mixing and mastering. The through-path feeds downstream monitoring.',
    },
    'main-vu-in': {
      title: 'McCurdy ATS-100 VU Input',
      description: 'Input to the McCurdy ATS-100 VU meter. Signals patched here are displayed on the VU meter for level monitoring. Typically fed from the master bus or print chain for final-stage metering.',
    },

    // ── Bay 11: API Mix Bus Points ──
    'api-mix-a-out': {
      title: 'API ASM164 Mix A Output',
      description: 'Stereo bus output from the Mix A program bus. This is the primary tracking sum — all channels assigned to Mix A converge here through the 2520 output stage and iron output transformer. Default destination is AD+ Input A for the print chain. The transformer imparts midrange density and subtle harmonic saturation that defines the "API sound."',
    },
    'api-mix-b-out': {
      title: 'API ASM164 Mix B Output',
      description: 'Stereo bus output from the Mix B program bus. Functions as an independent second stereo mix — commonly used for parallel stems, FX returns, or alternate mix versions. Same 2520/transformer topology as Mix A. Default destination is Pueblo Audio HJ482 for secondary sum processing.',
    },
    'api-master-out': {
      title: 'API ASM164 Master Output',
      description: 'Combined Mix A + Mix B stereo output after the master summing stage. This is the final analog output of the API — the sum of both program buses through the master 2520 output op-amp and iron transformer. Used when both buses need to converge to a single stereo destination.',
    },
    'api-cue-out': {
      title: 'API ASM164 Cue Output',
      description: 'Stereo cue bus output for headphone monitoring. Independent level and source selection allow performers to hear a different balance than the control room mix without affecting the program buses.',
    },
    'api-ext-in': {
      title: 'API ASM164 External Input (OTB Feed)',
      description: 'Stereo external input that feeds the Mix B bus path. This is where the Tonelux OTB tributary enters the API — the transformer-colored sum of overflow stems and FX returns merges into the console here, giving the engineer a single fader for the entire secondary bus contribution.',
    },
    'api-mix-a-patch': {
      title: 'API ASM164 Mix A Bus Patch Point',
      description: 'Direct patch access to the Mix A stereo bus. This interrupts the normalled path between the bus output and its default destination (AD+ Input A), allowing bus-level processing — a stereo compressor, EQ, or limiter can be inserted on the entire tracking sum before it reaches the converter.',
    },
    'api-mix-b-patch': {
      title: 'API ASM164 Mix B Bus Patch Point',
      description: 'Direct patch access to the Mix B stereo bus. Same function as the Mix A patch point but for the secondary bus. Useful for processing the parallel/overflow sum independently before it reaches the Pueblo.',
    },
    'api-talkback': {
      title: 'API ASM164 Talkback',
      description: 'Talkback microphone feed routed through the console. Sends engineer communication to the cue bus for performer headphones.',
    },

    // ── Bay 12: Pueblo / Tonelux OTB ──
    'pueblo-bank-a': {
      title: 'Pueblo Audio HJ482 — Bank A Inputs (1–8)',
      description: 'Eight balanced inputs summed to a stereo pair. Active summing with +29 dBu headroom, 0.00094% THD, and 127 dB dynamic range — the quietest, cleanest summing stage in the entire system. Bank A can cascade into Bank B or operate independently with its own stereo output. 12 kΩ input impedance bridges any line-level source cleanly.',
    },
    'pueblo-bank-b': {
      title: 'Pueblo Audio HJ482 — Bank B Inputs (1–8)',
      description: 'Second bank of eight inputs. Receives Bank A cascade when cascading is engaged, otherwise operates independently. Same active topology and specifications as Bank A. Output is a stereo pair that can feed further cascading or an independent destination.',
    },
    'pueblo-bank-c': {
      title: 'Pueblo Audio HJ482 — Bank C Inputs (1–8)',
      description: 'Third bank of eight inputs. Continues the cascade chain from Bank B when engaged. Identical active summing topology. Useful for stem grouping — drums on one bank, synths on another — before they merge in Bank D for final summation.',
    },
    'pueblo-bank-d': {
      title: 'Pueblo Audio HJ482 — Bank D Inputs (1–8) + Cascade Sum',
      description: 'The final bank and the cascade terminus. When all four banks cascade, Bank D output is the combined 32-input sum. Unique to this bank: optional switchable output transformers add iron coloration to the final sum. Bank D stereo output is hardwired to AD+ Input B — the clean alternative print path that bypasses the API output stage entirely.',
    },
    'pueblo-out-a': {
      title: 'Pueblo Bank A Stereo Output',
      description: 'Independent stereo sum output from Bank A. Active and available even when cascading is engaged — banks always produce their own output alongside the cascade feed. Can route to a dedicated converter input for separate stem printing.',
    },
    'pueblo-out-b': {
      title: 'Pueblo Bank B Stereo Output',
      description: 'Independent stereo sum output from Bank B. Same topology and behavior as Bank A output.',
    },
    'pueblo-out-c': {
      title: 'Pueblo Bank C Stereo Output',
      description: 'Independent stereo sum output from Bank C.',
    },
    'pueblo-out-d': {
      title: 'Pueblo Bank D Stereo Output → AD+ Input B',
      description: 'The primary output of the cascade chain. When all banks cascade, this carries the full 32-input sum. Hardwired to Dangerous AD+ Input B — always ready as the clean print path. With optional transformers engaged, this is the one point in the Pueblo where iron can enter the signal.',
    },
    'otb-ch-inputs': {
      title: 'Tonelux OTB-16 Channel Inputs (1–8)',
      description: 'Eight stereo stem inputs from Aurora(n) outputs 17–24. Per-channel level and pan controls. TX-240/TX-260 discrete op-amp summing topology. These are the overflow DAW stems that exceed the API\'s 16-channel capacity — additional instrument groups, stem buses, or background layers.',
    },
    'otb-ext-in': {
      title: 'Tonelux OTB-16 External Input',
      description: 'Stereo external input that receives the D-Box+ summing output. This is where the FX tributary (reverbs, delays, spatial processors) re-enters the main analog path. The external input signal is summed with the OTB\'s eight stem channels before the output stage.',
    },
    'otb-main-out': {
      title: 'Tonelux OTB-16 Main Output (Transformer)',
      description: 'Transformer-balanced stereo output through the TX-100 output transformer. This is the "iron" output — the combined stems + FX tributary pass through Hammond iron, adding warmth, cohesion, and gentle transient rounding. Feeds the API external input, merging the tributary into the console.',
    },
    'otb-mon-out': {
      title: 'Tonelux OTB-16 Monitor Output (Clean)',
      description: 'Unbalanced stereo output that bypasses the TX-100 output transformer. Same summed signal without the iron coloration — useful for A/B comparison of the transformer\'s contribution or for feeding a destination that needs the clean version.',
    },

    // ── Bay 13: AD+ / DAW ──
    'adplus-input-a': {
      title: 'Dangerous AD+ Input A (API Print Path)',
      description: 'Primary stereo analog input. Receives the API Mix A output — the transformer-colored tracking/mixing sum. Features a fixed input transformer always in the signal path plus optional Hammond X-Former insert. JetPLL jitter elimination and proprietary Clip Guard protect against digital clipping. +24 dBu maximum input level.',
    },
    'adplus-input-b': {
      title: 'Dangerous AD+ Input B (Pueblo Clean Path)',
      description: 'Secondary stereo analog input. Receives the Pueblo Bank D output — the clean sum that bypasses the API output stage. Front panel A/B switch selects which input feeds the converter. This is the "without iron" print option — when you want the mix without the API transformer\'s midrange density.',
    },
    'adplus-xformer-send': {
      title: 'AD+ X-Former Insert Send',
      description: 'Send point for the optional Hammond transformer insert. When engaged, the signal passes through two custom Hammond transformers for deliberate iron coloration on the final capture. This is an additive choice — stacking iron on top of the AD+ input transformer for a denser, more saturated print.',
    },
    'adplus-xformer-return': {
      title: 'AD+ X-Former Insert Return',
      description: 'Return from the Hammond transformer insert. The iron-processed signal re-enters the AD+ conversion path. The tonal effect is cumulative: input transformer + Hammond pair = three transformer stages on the print path.',
    },
    'adplus-emphasis': {
      title: 'AD+ EMPHASIS Circuit',
      description: 'Proprietary shelving EQ and compressor designed to add 2nd-order harmonic distortion — the "musical" harmonics. A mastering-grade tonal tool built into the converter: subtle warming and presence enhancement on the final print without needing an external processor.',
    },
    'adplus-aes-out': {
      title: 'Dangerous AD+ AES Digital Output',
      description: 'The point of no return — analog becomes digital here. AES/EBU stereo output through an output transformer. The last analog component in the entire signal chain. 118 dB dynamic range, JetPLL-locked digital clock. This feeds both the Aurora(n) for DAW capture and the D-Box+ for monitoring.',
    },
    'aurora-aes-in': {
      title: 'Lynx Aurora(n) AES Input',
      description: 'AES/EBU digital input on the Aurora(n). Receives the AD+ digital output for recording into the DAW. SynchroLock 2 jitter elimination re-clocks the incoming digital stream for sample-accurate capture. This is the final handoff before the signal becomes a DAW audio track.',
    },
    'dbox-aes-in': {
      title: 'D-Box+ AES Monitor Input',
      description: 'AES digital input on the D-Box+ monitor controller. Receives the AD+ output for real-time monitoring of the print signal. This is what you hear in the control room — the converted stereo mix, decoded back to analog through the D-Box+ DA section and fed to the speakers.',
    },
    'dbox-analog-in': {
      title: 'D-Box+ Analog Monitor Input',
      description: 'Stereo analog input on the D-Box+ monitor controller. An alternative monitoring path that bypasses A/D/A conversion — feed the analog mix directly to the speakers for latency-free monitoring or converter-bypass comparison.',
    },
    'dbox-speakers-a': {
      title: 'D-Box+ Speaker Output A',
      description: 'Primary speaker feed from the D-Box+ monitor controller. Independently trimmable per speaker set. The D-Box+ manages source selection (AES, Analog, SUM, USB, Bluetooth), mono/dim/mute, and level for this output.',
    },
    'dbox-speakers-b': {
      title: 'D-Box+ Speaker Output B',
      description: 'Secondary speaker feed. Typically a different speaker pair for cross-referencing the mix on a contrasting monitoring character — nearfield vs. midfield, for example.',
    },
    'dbox-speakers-c': {
      title: 'D-Box+ Speaker Output C',
      description: 'Third speaker feed. A third monitoring reference — often a smaller, more constrained speaker that reveals how the mix translates to limited playback systems.',
    },
  };

  return (
    <div ref={scrollContainerRef} className="relative flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
      <SignalFlowOverlay
        containerRef={scrollContainerRef}
        perspective={perspective}
        mode={mode}
        selectedMic={selectedMic}
        selectedPreamp={selectedPreamp}
        insertChain={insertChain}
        parallelChain={parallelChain}
      />

      {normalizedQuery && (
        <div className="relative z-[1] mb-4 mat-brushed-dark mat-recess rounded-[3px] border border-zinc-800/30 p-3">
          <div className="mb-2 text-silkscreen-faint text-[8px]">Quick gear access</div>
          {quickResults.length > 0 ? (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
              {quickResults.map((result) => (
                <div key={result.id} className="mat-recess rounded-[3px] border border-zinc-800/20 px-3 py-2">
                  <div className="flex items-start gap-3">
                    <span className="tt-jack mt-0.5 flex h-7 w-7 items-center justify-center">•</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium" style={{ color: 'var(--sa-cream)' }}>{result.title}</div>
                      <div className="mt-0.5 text-silkscreen-faint text-[8px]">{result.subtitle}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <ActionButton type="button" tone="amber" onClick={result.onUse}>{result.actionLabel}</ActionButton>
                        <ActionButton type="button" onClick={result.onInspect}>Inspect</ActionButton>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-zinc-500">No direct match yet. Try a vendor, model, or topology.</div>
          )}
        </div>
      )}

      <div className="relative z-[1] space-y-4">
      {/* ── Mic Locker — standalone source selection above the patchbay ── */}
      {mode === 'tracking' && (
        <div className="space-y-2">
          <SectionMarker title="Mic Locker" subtitle="Choose a source. The tie line bay below carries the selection to the preamps." />
          <MicLocker
            groups={micGroups}
            selectedMic={selectedMic}
            onSelectMic={onSelectMic}
            onInspect={onInspect}
            isNext={guide.rowId === 'row-mic-ties' && !selectedMic}
          />
        </div>
      )}
        {patchRows.map((row) => {
          const active = rowActive(row.id, mode, selectedMic, selectedPreamp, insertChain, parallelChain);
          const isNext = guide.rowId === row.id;

          if (row.id === 'row-api-line-in' || row.id === 'row-insert-return' || row.id === 'row-spatial' || row.id === 'row-fx') {
            return null;
          }

          if (row.id === 'row-mic-ties') {
            const openSection = openSectionByRow[row.id] ?? null;
            const preampInputSectionPreamps = openSection === 'direct-preamp-inputs' ? standardPreamps
              : openSection === 'preamp-eq-inputs' ? preampEqUnits
              : null;

            return (
              <div key={row.id} className="space-y-2">
                <SectionMarker title="Source and capture" subtitle="Tie lines carry the mic selection to a preamp input. Choose the front-end that shapes the source." />
                <RowShell rowId={row.id} order="0" label="MIC TIE LINES / PREAMP INPUTS" active={active} isNext={isNext} mode={mode}>
                  <StackedBayFace
                    rowId="row-mic-ties"
                    topSegments={tieLineSegments}
                    bottomSegments={preampInputSegments}
                    selectedTopPoints={selectedMicPoint > 0 && selectedMicPoint <= BAY_ROW_LENGTH ? [selectedMicPoint] : []}
                    selectedBottomPoints={selectedPreampPoints}
                    openBottomSegmentId={openSection}
                    onBottomSegmentClick={(sectionId) => setOpenSection(row.id, sectionId)}
                    onBottomJackClick={(segmentId) => setOpenSection(row.id, segmentId)}
                    segmentButtonProps={{ 'data-row-section': row.id }}
                    normalMode="patch-only"
                  />

                  {preampInputSectionPreamps && preampInputSectionPreamps.length > 0 && (
                    <DetailTray title={openSection === 'preamp-eq-inputs' ? 'Preamp / EQ inputs' : 'Preamp inputs'} caption={openSection === 'preamp-eq-inputs' ? 'These channels anchor the first gain stage and later contribute another shaped analog pass.' : 'The first gain stage shapes how the source arrives at the recorder.'} toneClass="border-blue-900/20 bg-blue-950/8" onClose={() => clearOpenSection(row.id)}>
                      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                        {preampInputSectionPreamps.map((preamp) => (
                          <CompactChoice
                            key={preamp.id}
                            pointNumber={preampPointNumber(preamp.id)}
                            tone={openSection === 'preamp-eq-inputs' ? 'cyan' : 'blue'}
                            title={preamp.name}
                            meta={compactMeta([preamp.topology, `${preamp.channels}ch`, preamp.eq_features ?? null, preamp.input_z_hi ? 'Hi-Z' : null])}
                            selected={selectedPreamp?.id === preamp.id}
                            primaryLabel="Patch into chain"
                            onPrimary={() => { onSelectPreamp(preamp); clearOpenSection(row.id); }}
                            detailLabel="Preamp details"
                            onInspect={() => onInspect(preamp.id)}
                            extraAction={hasStandaloneEqSection(preamp) ? (
                              <ActionButton type="button" tone="cyan" active={insertPreampEqIds.has(preamp.id)} onClick={() => toggleInsert({ type: 'preamp-eq', item: preamp })}>
                                {insertPreampEqIds.has(preamp.id) ? 'Remove EQ stage' : 'Add EQ stage'}
                              </ActionButton>
                            ) : undefined}
                          />
                        ))}
                      </div>
                    </DetailTray>
                  )}
                </RowShell>
              </div>
            );
          }

          if (row.id === 'row-preamp-in') {
            const openSection = openSectionByRow[row.id] ?? null;
            const normalizedSection = openSection?.replace(/-inputs$/, '').replace(/-outputs$/, '') ?? null;
            const preampsInSection = normalizedSection === 'preamp-eq' ? preampEqUnits : standardPreamps;

            return (
              <RowShell key={row.id} rowId={row.id} order="1" label="PREAMP OUTPUTS / DAW INPUTS" active={active} isNext={isNext} mode={mode}>
                {openSection && preampsInSection.length > 0 && (
                  <DetailTray title={normalizedSection === 'preamp-eq' ? 'Preamp / EQ units' : 'Standalone preamps'} caption={normalizedSection === 'preamp-eq' ? 'These channels can anchor the first gain stage and later contribute another shaped analog pass.' : 'These are the core front-end choices that define how the source arrives at the recorder.'} toneClass="border-blue-900/20 bg-blue-950/8" position="above" onClose={() => clearOpenSection(row.id)}>
                    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                      {preampsInSection.map((preamp) => (
                        <CompactChoice
                          key={preamp.id}
                          pointNumber={preampPointNumber(preamp.id)}
                          tone={openSection === 'preamp-eq' ? 'cyan' : 'blue'}
                          title={preamp.name}
                          meta={compactMeta([preamp.topology, `${preamp.channels}ch`, preamp.eq_features ?? null, preamp.input_z_hi ? 'Hi-Z' : null])}
                          selected={selectedPreamp?.id === preamp.id}
                          primaryLabel="Patch into chain"
                          onPrimary={() => { onSelectPreamp(preamp); clearOpenSection(row.id); }}
                          detailLabel="Preamp details"
                          onInspect={() => onInspect(preamp.id)}
                          extraAction={hasStandaloneEqSection(preamp) ? (
                            <ActionButton type="button" tone="cyan" active={insertPreampEqIds.has(preamp.id)} onClick={() => toggleInsert({ type: 'preamp-eq', item: preamp })}>
                              {insertPreampEqIds.has(preamp.id) ? 'Remove EQ stage' : 'Add EQ stage'}
                            </ActionButton>
                          ) : undefined}
                        />
                      ))}
                    </div>
                  </DetailTray>
                )}

                <StackedBayFace
                  rowId="row-preamp-in"
                  topSegments={preampOutputSegments}
                  bottomSegments={dawInputSegments}
                  selectedTopPoints={selectedPreampPoints}
                  selectedBottomPoints={[]}
                  openTopSegmentId={openSection}
                  onTopSegmentClick={(sectionId) => setOpenSection(row.id, sectionId)}
                  onBottomSegmentClick={(sectionId) => setOpenSection(row.id, sectionId)}
                  segmentButtonProps={{ 'data-row-section': row.id }}
                  normalMode="half-normal"
                />

                {openSection && openSection === 'lynx-line-inputs' && (
                  <DetailTray title={segmentInfo['lynx-line-inputs'].title} caption={segmentInfo['lynx-line-inputs'].description} toneClass="border-green-900/20 bg-green-950/8" onClose={() => clearOpenSection(row.id)}>
                    <div />
                  </DetailTray>
                )}
              </RowShell>
            );
          }

          if (row.id === 'row-preamp-out') {
            const openSection = openSectionByRow[row.id] ?? null;
            const activeInfo = openSection ? segmentInfo[openSection] ?? null : null;

            return (
              <RowShell key={row.id} rowId={row.id} order="2" label="DAW OUTPUTS / CONSOLE INPUTS" active={active} isNext={isNext} mode={mode}>
                <PhysicalPairedBay topSegments={dawOutputTopSegments} bottomSegments={dawOutputBottomSegments} openSegmentId={openSection} onSegmentClick={(sectionId) => setOpenSection(row.id, sectionId)} normalMode="half-normal" />

                {activeInfo && (
                  <DetailTray title={activeInfo.title} caption={activeInfo.description} toneClass="border-blue-900/20 bg-blue-950/8" onClose={() => clearOpenSection(row.id)}>
                    <div />
                  </DetailTray>
                )}
              </RowShell>
            );
          }

          if (row.id === 'row-insert-send') {
            const openSection = openSectionByRow[row.id] ?? null;
            const activeInfo = openSection ? segmentInfo[openSection] ?? null : null;

            return (
              <RowShell key={row.id} rowId={row.id} order="3" label="INSERT SENDS / RETURNS" active={active} isNext={isNext} mode={mode}>
                <PhysicalPairedBay topSegments={insertSendSegments} bottomSegments={insertReturnSegments} openSegmentId={openSection} onSegmentClick={(sectionId) => setOpenSection(row.id, sectionId)} normalMode="half-normal" />

                {activeInfo && (
                  <DetailTray title={activeInfo.title} caption={activeInfo.description} toneClass="border-violet-900/20 bg-violet-950/8" onClose={() => clearOpenSection(row.id)}>
                    <div />
                  </DetailTray>
                )}
              </RowShell>
            );
          }

          if (row.id === 'row-dynamics') {
            const openSection = openSectionByRow[row.id] ?? null;
            const activeGroup = openSection ? (compressorGroups.find((group) => group.id === openSection) ?? null) : null;

            return (
              <div key={row.id} className="space-y-2">
                <SectionMarker title="Outboard field" subtitle="Dynamics, equalizers, and returns live here. Nothing needs to be patched unless the sound genuinely benefits from it." />
                <RowShell rowId={row.id} order={row.order} label={routeRowLabel(row.id)} active={active} isNext={isNext} mode={mode}>
                  {activeGroup && (
                    <DetailTray title={`${activeGroup.label} compressors`} caption="Patch into chain inserts the unit into the direct path. Blend return keeps the dry route intact and adds a parallel branch." toneClass="border-purple-900/20 bg-purple-950/8" position="above" onClose={() => clearOpenSection(row.id)}>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {activeGroup.items.map((compressor) => {
                          const insertSelected = insertChain.some((processor) => processor.type === 'compressor' && processor.item.id === compressor.id);
                          const parallelSelected = parallelChain.some((processor) => processor.type === 'compressor' && processor.item.id === compressor.id);

                          return (
                            <CompactChoice
                              key={compressor.id}
                              pointNumber={pointNumberForGroupedItem(compressorGroups, compressor.id)}
                              tone="purple"
                              title={compressor.name}
                              meta={compactMeta([compressor.topology, compressor.ratios, compressor.detection])}
                              selected={insertSelected || parallelSelected}
                              primaryLabel={insertSelected ? 'Remove from chain' : 'Patch into chain'}
                              primaryActive={insertSelected}
                              onPrimary={() => { toggleInsert({ type: 'compressor', item: compressor }); clearOpenSection(row.id); }}
                              detailLabel="Compressor details"
                              onInspect={() => onInspect(compressor.id)}
                              extraAction={<ActionButton type="button" tone="cyan" active={parallelSelected} onClick={() => { toggleParallel({ type: 'compressor', item: compressor }); clearOpenSection(row.id); }}>{parallelSelected ? 'Remove branch' : 'Blend return'}</ActionButton>}
                            />
                          );
                        })}
                      </div>
                    </DetailTray>
                  )}

                  <StackedBayFace
                    rowId="row-dynamics"
                    topSegments={toPairedSegments(compressorSegments)}
                    bottomSegments={toPairedSegments(compressorSegments)}
                    selectedTopPoints={compressors.flatMap((c) => (insertIds.has(c.id) || parallelIds.has(c.id) ? selectedPointsForItem(compressorGroups, c.id, c.channels) : []))}
                    selectedBottomPoints={compressors.flatMap((c) => (insertIds.has(c.id) || parallelIds.has(c.id) ? selectedPointsForItem(compressorGroups, c.id, c.channels) : []))}
                    openTopSegmentId={openSection}
                    onTopSegmentClick={(sectionId) => setOpenSection(row.id, sectionId)}
                    segmentButtonProps={{ 'data-row-section': row.id }}
                    normalMode="patch-only"
                  />
                </RowShell>
              </div>
            );
          }

          if (row.id === 'row-eq') {
            const openSection = openSectionByRow[row.id] ?? null;
            const activeEntry = openSection ? (allOutboardGroups.find((g) => g.id === openSection) ?? null) : null;

            const combinedSelectedTop = [
              ...equalizers.flatMap((e) => (insertIds.has(e.id) ? selectedPointsForCombinedItem(e.id, e.channels) : [])),
              ...inlineOutboard.flatMap((p) => (insertIds.has(p.id) ? selectedPointsForCombinedItem(p.id, p.channels) : [])),
              ...parallelFx.flatMap((p) => (parallelIds.has(p.id) ? selectedPointsForCombinedItem(p.id, p.channels) : [])),
            ];

            const trayConfig = activeEntry?.category === 'eq'
              ? { title: `${activeEntry.label} equalizers`, caption: 'These are compact selection lists, not full-width accordions. The route should stay readable while you inspect options.', toneClass: 'border-teal-900/60 bg-teal-950/18' }
              : activeEntry?.category === 'inline'
                ? { title: `${activeEntry.label} inline processors`, caption: 'These units patch straight into the main route when the chain needs more deliberate color or spatial shaping.', toneClass: 'border-cyan-900/60 bg-cyan-950/18' }
                : activeEntry?.category === 'fx'
                  ? { title: `${activeEntry.label} returns`, caption: 'Blend return is the primary action here because these processors are meant to supplement the direct chain rather than replace it.', toneClass: 'border-sky-900/60 bg-sky-950/18' }
                  : null;

            return (
              <RowShell key={row.id} rowId={row.id} order={row.order} label={routeRowLabel(row.id)} active={active} isNext={isNext} mode={mode}>
                {activeEntry && trayConfig && (
                  <DetailTray title={trayConfig.title} caption={trayConfig.caption} toneClass={trayConfig.toneClass} position="above" onClose={() => clearOpenSection(row.id)}>
                    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                      {activeEntry.category === 'eq' && activeEntry.items.map((equalizer) => (
                        <CompactChoice
                          key={equalizer.id}
                          pointNumber={pointNumberForCombinedItem(equalizer.id)}
                          tone="teal"
                          title={equalizer.name}
                          meta={compactMeta([(equalizer as any).topology, `${equalizer.channels}ch`, (equalizer as any).bands])}
                          selected={insertIds.has(equalizer.id)}
                          primaryLabel={insertIds.has(equalizer.id) ? 'Remove from chain' : 'Patch into chain'}
                          onPrimary={() => { toggleInsert({ type: 'equalizer', item: equalizer as any }); clearOpenSection(row.id); }}
                          detailLabel="EQ details"
                          onInspect={() => onInspect(equalizer.id)}
                        />
                      ))}
                      {activeEntry.category === 'inline' && activeEntry.items.map((processor) => (
                        <CompactChoice
                          key={processor.id}
                          pointNumber={pointNumberForCombinedItem(processor.id)}
                          tone="cyan"
                          title={processor.name}
                          meta={compactMeta([(processor as any).type, (processor as any).format, `${processor.channels}ch`])}
                          selected={insertIds.has(processor.id)}
                          primaryLabel={insertIds.has(processor.id) ? 'Remove from chain' : 'Patch into chain'}
                          onPrimary={() => { toggleInsert({ type: 'outboard', item: processor as any }); clearOpenSection(row.id); }}
                          detailLabel="Processor details"
                          onInspect={() => onInspect(processor.id)}
                        />
                      ))}
                      {activeEntry.category === 'fx' && activeEntry.items.map((processor) => (
                        <CompactChoice
                          key={processor.id}
                          pointNumber={pointNumberForCombinedItem(processor.id)}
                          tone="sky"
                          title={processor.name}
                          meta={compactMeta([(processor as any).type, (processor as any).format, `${processor.channels}ch`])}
                          selected={parallelIds.has(processor.id)}
                          primaryLabel={parallelIds.has(processor.id) ? 'Remove branch' : 'Blend return'}
                          onPrimary={() => { toggleParallel({ type: 'outboard', item: processor as any }); clearOpenSection(row.id); }}
                          detailLabel="Processor details"
                          onInspect={() => onInspect(processor.id)}
                        />
                      ))}
                    </div>
                  </DetailTray>
                )}

                <StackedBayFace rowId="row-eq" topSegments={toPairedSegments(combinedOutboardSegments)} bottomSegments={toPairedSegments(combinedOutboardSegments)} selectedTopPoints={combinedSelectedTop} selectedBottomPoints={combinedSelectedTop} openTopSegmentId={openSection} onTopSegmentClick={(sectionId) => setOpenSection(row.id, sectionId)} segmentButtonProps={{ 'data-row-section': row.id }} normalMode="patch-only" />
              </RowShell>
            );
          }

          if (row.id === 'row-api-mix-out') {
            const openSection = openSectionByRow[row.id] ?? null;
            const activeInfo = openSection ? segmentInfo[openSection] ?? null : null;

            return (
              <div key={row.id} className="space-y-2">
                <SectionMarker title="Summing and print" subtitle="This is where the route stops being a collection of channels and becomes a mix, a monitor feed, or a committed print." />
                <RowShell rowId={row.id} order={row.order} label={routeRowLabel(row.id)} active={active} isNext={isNext} mode={mode}>
                  <PhysicalPairedBay topSegments={apiMixTopSegments} bottomSegments={apiMixBottomSegments} openSegmentId={openSection} onSegmentClick={(sectionId) => setOpenSection(row.id, sectionId)} normalMode="half-normal" />

                  {activeInfo && (
                    <DetailTray title={activeInfo.title} caption={activeInfo.description} toneClass="border-amber-900/20 bg-amber-950/8" onClose={() => clearOpenSection(row.id)}>
                      <div />
                    </DetailTray>
                  )}
                </RowShell>
              </div>
            );
          }

          if (row.id === 'row-pueblo-in') {
            const openSection = openSectionByRow[row.id] ?? null;
            const activeInfo = openSection ? segmentInfo[openSection] ?? null : null;

            return (
              <RowShell key={row.id} rowId={row.id} order={row.order} label={routeRowLabel(row.id)} active={active} isNext={isNext} mode={mode}>
                <PhysicalPairedBay topSegments={puebloTopSegments} bottomSegments={puebloBottomSegments} openSegmentId={openSection} onSegmentClick={(sectionId) => setOpenSection(row.id, sectionId)} normalMode="half-normal" />

                {activeInfo && (
                  <DetailTray title={activeInfo.title} caption={activeInfo.description} toneClass="border-yellow-900/20 bg-yellow-950/8" onClose={() => clearOpenSection(row.id)}>
                    <div />
                  </DetailTray>
                )}
              </RowShell>
            );
          }

          if (row.id === 'row-ad-daw') {
            const openSection = openSectionByRow[row.id] ?? null;
            const activeInfo = openSection ? segmentInfo[openSection] ?? null : null;

            return (
              <RowShell key={row.id} rowId={row.id} order={row.order} label={routeRowLabel(row.id)} active={active} isNext={isNext} mode={mode}>
                <PhysicalPairedBay topSegments={adDawTopSegments} bottomSegments={adDawBottomSegments} openSegmentId={openSection} onSegmentClick={(sectionId) => setOpenSection(row.id, sectionId)} normalMode="patch-only" />

                {activeInfo && (
                  <DetailTray title={activeInfo.title} caption={activeInfo.description} toneClass="border-blue-900/20 bg-blue-950/8" onClose={() => clearOpenSection(row.id)}>
                    <div />
                  </DetailTray>
                )}
              </RowShell>
            );
          }

          return null;
        })}
      </div>

      {showCascadeView ? (
        <Suspense fallback={<div className="mt-4 mat-recess rounded-[3px] border border-zinc-800/20 px-4 py-6 text-sm text-silkscreen-faint">Loading console and monitor path…</div>}>
          <CascadeView mode={mode} perspective={perspective} onInspect={onInspect} />
        </Suspense>
      ) : (
        <div className="mt-4 mat-recess rounded-[3px] border border-zinc-800/20 px-4 py-6 text-sm text-silkscreen-faint">Loading console and monitor path…</div>
      )}

      <div className="mt-4 space-y-2 pb-6">
        <SonicSignatureStrip signature={sonicSignature} />
        <AnalysisPanel
          perspective={perspective}
          mode={mode}
          analysis={analysis}
          routeSummary={routeSummary}
          perspectiveInsight={perspectiveInsight}
          selectedMic={selectedMic}
          selectedPreamp={selectedPreamp}
          insertChain={insertChain}
          parallelChain={parallelChain}
          onClearChain={onClearChain}
        />
      </div>
    </div>
  );
}
