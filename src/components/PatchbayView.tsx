import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type {
  ChainAnalysis,
  Equalizer,
  InsertProcessor,
  Microphone,
  OutboardProcessor,
  ParallelProcessor,
  ParallelProcessorInput,
  Perspective,
  Preamp,
  StudioMode,
} from '../types/studio';
import { patchRows } from '../data/studio';
import { microphones } from '../data/microphones';
import { preamps } from '../data/preamps';
import { compressors } from '../data/compressors';
import SignalFlowOverlay from './SignalFlowOverlay';

const CascadeView = lazy(() => import('./CascadeView'));

interface Props {
  perspective: Perspective;
  mode: StudioMode;
  selectedMic: Microphone | null;
  selectedPreamp: Preamp | null;
  insertChain: InsertProcessor[];
  parallelChain: ParallelProcessor[];
  analysis: ChainAnalysis | null;
  onSelectMic: (m: Microphone | null) => void;
  onSelectPreamp: (p: Preamp | null) => void;
  onAddInsert: (proc: InsertProcessor) => void;
  onAddParallel: (proc: ParallelProcessorInput) => void;
  onRemoveInsert: (index: number) => void;
  onRemoveParallel: (index: number) => void;
  onReorderInserts: (from: number, to: number) => void;
  onInspect: (id: string | null) => void;
  equalizers: Equalizer[];
  outboardProcessors: OutboardProcessor[];
}

type BayTone = 'rose' | 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'teal' | 'cyan' | 'sky' | 'blue' | 'violet' | 'purple' | 'slate';

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

const bayToneClasses: Record<BayTone, { strip: string; socket: string; selected: string; ring: string }> = {
  rose: { strip: 'bg-rose-300/18 text-rose-100', socket: 'border-rose-400/45 text-rose-200', selected: 'border-rose-300 bg-rose-300 text-zinc-950', ring: 'ring-rose-300/30' },
  red: { strip: 'bg-red-300/18 text-red-100', socket: 'border-red-400/45 text-red-200', selected: 'border-red-300 bg-red-300 text-zinc-950', ring: 'ring-red-300/30' },
  orange: { strip: 'bg-orange-300/18 text-orange-100', socket: 'border-orange-400/45 text-orange-200', selected: 'border-orange-300 bg-orange-300 text-zinc-950', ring: 'ring-orange-300/30' },
  amber: { strip: 'bg-amber-300/18 text-amber-100', socket: 'border-amber-400/45 text-amber-200', selected: 'border-amber-300 bg-amber-300 text-zinc-950', ring: 'ring-amber-300/30' },
  yellow: { strip: 'bg-yellow-300/18 text-yellow-100', socket: 'border-yellow-400/45 text-yellow-200', selected: 'border-yellow-300 bg-yellow-300 text-zinc-950', ring: 'ring-yellow-300/30' },
  lime: { strip: 'bg-lime-300/18 text-lime-100', socket: 'border-lime-400/45 text-lime-200', selected: 'border-lime-300 bg-lime-300 text-zinc-950', ring: 'ring-lime-300/30' },
  green: { strip: 'bg-green-300/18 text-green-100', socket: 'border-green-400/45 text-green-200', selected: 'border-green-300 bg-green-300 text-zinc-950', ring: 'ring-green-300/30' },
  teal: { strip: 'bg-teal-300/18 text-teal-100', socket: 'border-teal-400/45 text-teal-200', selected: 'border-teal-300 bg-teal-300 text-zinc-950', ring: 'ring-teal-300/30' },
  cyan: { strip: 'bg-cyan-300/18 text-cyan-100', socket: 'border-cyan-400/45 text-cyan-200', selected: 'border-cyan-300 bg-cyan-300 text-zinc-950', ring: 'ring-cyan-300/30' },
  sky: { strip: 'bg-sky-300/18 text-sky-100', socket: 'border-sky-400/45 text-sky-200', selected: 'border-sky-300 bg-sky-300 text-zinc-950', ring: 'ring-sky-300/30' },
  blue: { strip: 'bg-blue-300/18 text-blue-100', socket: 'border-blue-400/45 text-blue-200', selected: 'border-blue-300 bg-blue-300 text-zinc-950', ring: 'ring-blue-300/30' },
  violet: { strip: 'bg-violet-300/18 text-violet-100', socket: 'border-violet-400/45 text-violet-200', selected: 'border-violet-300 bg-violet-300 text-zinc-950', ring: 'ring-violet-300/30' },
  purple: { strip: 'bg-purple-300/18 text-purple-100', socket: 'border-purple-400/45 text-purple-200', selected: 'border-purple-300 bg-purple-300 text-zinc-950', ring: 'ring-purple-300/30' },
  slate: { strip: 'bg-zinc-800 text-zinc-300', socket: 'border-zinc-600 text-zinc-500', selected: 'border-zinc-400 bg-zinc-300 text-zinc-950', ring: 'ring-zinc-300/20' },
};

const rowShellTone: Record<string, string> = {
  'row-mic-ties': 'border-rose-900/60 bg-[linear-gradient(180deg,rgba(30,8,13,0.95),rgba(15,16,18,0.96))]',
  'row-preamp-in': 'border-red-900/60 bg-[linear-gradient(180deg,rgba(35,12,12,0.95),rgba(15,16,18,0.96))]',
  'row-preamp-out': 'border-orange-900/60 bg-[linear-gradient(180deg,rgba(37,20,9,0.95),rgba(15,16,18,0.96))]',
  'row-api-line-in': 'border-lime-900/60 bg-[linear-gradient(180deg,rgba(18,29,11,0.95),rgba(15,16,18,0.96))]',
  'row-insert-send': 'border-violet-900/60 bg-[linear-gradient(180deg,rgba(20,14,36,0.95),rgba(15,16,18,0.96))]',
  'row-insert-return': 'border-violet-900/60 bg-[linear-gradient(180deg,rgba(29,11,36,0.95),rgba(15,16,18,0.96))]',
  'row-dynamics': 'border-purple-900/60 bg-[linear-gradient(180deg,rgba(27,11,35,0.95),rgba(15,16,18,0.96))]',
  'row-eq': 'border-teal-900/60 bg-[linear-gradient(180deg,rgba(11,29,28,0.95),rgba(15,16,18,0.96))]',
  'row-spatial': 'border-cyan-900/60 bg-[linear-gradient(180deg,rgba(9,25,33,0.95),rgba(15,16,18,0.96))]',
  'row-fx': 'border-sky-900/60 bg-[linear-gradient(180deg,rgba(8,21,35,0.95),rgba(15,16,18,0.96))]',
  'row-api-mix': 'border-amber-900/60 bg-[linear-gradient(180deg,rgba(39,27,8,0.95),rgba(15,16,18,0.96))]',
  'row-pueblo': 'border-yellow-900/60 bg-[linear-gradient(180deg,rgba(39,33,6,0.95),rgba(15,16,18,0.96))]',
  'row-ad-daw': 'border-blue-900/60 bg-[linear-gradient(180deg,rgba(10,18,35,0.95),rgba(15,16,18,0.96))]',
};

const micLabelExpanded: Partial<Record<Microphone['type'], string>> = {
  'Tube LDC': 'Tube Large C',
  'FET LDC': 'FET Large C',
  'FET MDC': 'FET Med C',
  'FET SDC': 'FET Small C',
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

const perspectiveTheme: Record<Perspective, { label: string; badge: string; tray: string }> = {
  musician: {
    label: 'Musician Lens',
    badge: 'border-emerald-600/40 bg-emerald-500/12 text-emerald-200',
    tray: 'border-emerald-900/60 bg-emerald-950/20',
  },
  engineer: {
    label: 'Engineer Lens',
    badge: 'border-red-600/40 bg-red-500/12 text-red-200',
    tray: 'border-red-900/60 bg-red-950/20',
  },
  technical: {
    label: 'Tech Lens',
    badge: 'border-yellow-500/40 bg-yellow-400/12 text-yellow-100',
    tray: 'border-yellow-900/60 bg-yellow-950/20',
  },
};

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

function nextStep(selectedMic: Microphone | null, selectedPreamp: Preamp | null, insertChain: InsertProcessor[]): { rowId: string; heading: string; body: string } {
  if (!selectedMic) {
    return {
      rowId: 'row-mic-ties',
      heading: 'Mic tie lines',
      body: 'Start by picking a mic from the mic tie lines to learn more or begin your signal path.',
    };
  }

  if (!selectedPreamp) {
    return {
      rowId: 'row-preamp-in',
      heading: 'Choose the first gain stage',
      body: `${selectedMic.name} is live. Patch it into a preamp so the normalled route can continue all the way to the recorder.`,
    };
  }

  if (insertChain.length === 0) {
    return {
      rowId: 'row-dynamics',
      heading: 'The route is already complete',
      body: 'You are already reaching the recorder. Open dynamics, EQ, spatial, or FX only if you want to depart from the default path.',
    };
  }

  return {
    rowId: 'row-ad-daw',
    heading: 'Read the full consequence',
    body: 'The custom chain is active. Follow the explicit route below and confirm the extra analog stages are worth the commitment.',
  };
}

function rowActive(rowId: string, selectedMic: Microphone | null, selectedPreamp: Preamp | null, insertChain: InsertProcessor[], parallelChain: ParallelProcessor[]): boolean {
  switch (rowId) {
    case 'row-mic-ties':
      return selectedMic != null;
    case 'row-preamp-in':
    case 'row-preamp-out':
      return selectedMic != null || selectedPreamp != null;
    case 'row-api-line-in':
    case 'row-insert-send':
    case 'row-insert-return':
    case 'row-api-mix':
    case 'row-pueblo':
    case 'row-ad-daw':
      return selectedPreamp != null;
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

function RowShell({ rowId, order, label, active, isNext, children }: { rowId: string; order: number | string; label: string; active: boolean; isNext: boolean; children: ReactNode }) {
  return (
    <section data-row-id={rowId} className={`rounded-[1.6rem] border px-3 py-3 md:px-4 md:py-4 ${rowShellTone[rowId] ?? rowShellTone['row-mic-ties']} ${isNext ? 'ring-1 ring-inset ring-zinc-100/18' : ''}`}>
      <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/80 text-zinc-300">{order}</span>
            <span>{label}</span>
            {active && <span className="rounded-full border border-zinc-700 bg-zinc-900/70 px-2 py-0.5 text-[9px] text-zinc-300">active</span>}
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}

function DetailTray({ title, caption, children, toneClass }: { title: string; caption: string; children: ReactNode; toneClass: string }) {
  return (
    <div className={`mt-2 rounded-[1.15rem] border p-2.5 md:p-3 ${toneClass}`}>
      <div className="mb-2">
        <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Detail tray</div>
        <div className="mt-1 text-sm font-medium text-zinc-100">{title}</div>
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
  segmentButtonProps,
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
  segmentButtonProps?: SegmentButtonProps;
}) {
  const topEntries = expandBaySegments(topSegments);
  const bottomEntries = expandBaySegments(bottomSegments);
  const totalColumns = Math.max(topEntries.length, bottomEntries.length, BAY_ROW_LENGTH);
  const selectedTop = new Set(selectedTopPoints);
  const selectedBottom = new Set(selectedBottomPoints);

  const renderStrip = (segments: PairedBaySegment[], activeSegmentId?: string | null, onClick?: (segmentId: string) => void) => {
    const usedColumns = segments.reduce((sum, segment) => sum + segment.count, 0);

    return (
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))` }}>
        {segments.map((segment) => {
          const content = segment.subLabels ? (
            <div className={`rounded-lg px-0.5 py-0.5 text-center ${bayToneClasses[segment.tone].strip} ${activeSegmentId === segment.id ? `ring-1 ring-inset ${bayToneClasses[segment.tone].ring}` : ''}`} title={segment.label}>
              <div className="text-[7px] uppercase tracking-[0.08em] leading-tight">{segment.label}</div>
              <div className="flex justify-around text-[7px] uppercase tracking-[0.06em] leading-tight">{segment.subLabels.map((sub) => <span key={sub}>{sub}</span>)}</div>
            </div>
          ) : (
            <span className={`block truncate rounded-full px-0.5 py-0.5 text-center text-[7px] uppercase tracking-[0.08em] ${bayToneClasses[segment.tone].strip} ${activeSegmentId === segment.id ? `ring-1 ring-inset ${bayToneClasses[segment.tone].ring}` : ''}`} title={segment.label}>
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
          <div className="rounded-full border border-zinc-800 bg-zinc-900/85 px-2 py-1 text-center text-[9px] uppercase tracking-[0.18em] text-zinc-500" style={{ gridColumn: `span ${totalColumns - usedColumns} / span ${totalColumns - usedColumns}` }}>
            open
          </div>
        )}
      </div>
    );
  };

  const renderSocketRow = (entries: ExpandedBayPoint[], selectedSet: Set<number>, position: 'top' | 'bottom') => (
    <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))` }}>
      {Array.from({ length: totalColumns }, (_, index) => {
        const entry = entries[index] ?? null;
        const selected = entry?.number != null && selectedSet.has(entry.number);

        return (
          <div key={`${entry?.segmentId ?? 'open'}-${index}`} className="flex justify-center">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full border text-[9px] font-medium md:h-6 md:w-6 ${entry ? (selected ? bayToneClasses[entry.tone].selected : `bg-zinc-950/95 ${bayToneClasses[entry.tone].socket}`) : 'border-zinc-800 bg-zinc-900/70 text-zinc-700'}`}
              {...(selected && entry?.number != null ? { 'data-selected-point': `${rowId}-${position}-${entry.number}` } : {})}
            >
              {entry?.number ?? ''}
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="rounded-[1.25rem] border border-zinc-800 bg-[#0d0f11] px-2.5 py-2.5">
      <div className="overflow-x-auto pb-1">
        <div className="min-w-max space-y-2">
          {renderStrip(topSegments, openTopSegmentId, onTopSegmentClick)}
          {renderSocketRow(topEntries, selectedTop, 'top')}
          {renderSocketRow(bottomEntries, selectedBottom, 'bottom')}
          {renderStrip(bottomSegments, openBottomSegmentId ?? openTopSegmentId, onBottomSegmentClick ?? onTopSegmentClick)}
        </div>
      </div>
    </div>
  );
}

function PhysicalPairedBay({
  topSegments,
  bottomSegments,
  openSegmentId,
  onSegmentClick,
}: {
  topSegments: PairedBaySegment[];
  bottomSegments: PairedBaySegment[];
  openSegmentId?: string | null;
  onSegmentClick?: (segmentId: string) => void;
}) {
  const totalColumns = Math.max(
    topSegments.reduce((sum, segment) => sum + segment.count, 0),
    bottomSegments.reduce((sum, segment) => sum + segment.count, 0),
    BAY_ROW_LENGTH
  );

  const topEntries = expandBaySegments(topSegments);
  const bottomEntries = expandBaySegments(bottomSegments);

  return (
    <div className="rounded-[1.25rem] border border-zinc-800 bg-[#0d0f11] px-2.5 py-2.5">
      <div className="overflow-x-auto pb-1">
        <div className="min-w-max space-y-2">
          <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))` }}>
            {topSegments.map((segment) => {
              const isOpen = openSegmentId === segment.id;
              const ringClass = isOpen ? `ring-1 ring-inset ${bayToneClasses[segment.tone].ring}` : '';
              const content = segment.subLabels ? (
                <div className={`rounded-lg px-0.5 py-0.5 text-center ${bayToneClasses[segment.tone].strip} ${ringClass}`} title={segment.label}>
                  <div className="text-[7px] uppercase tracking-[0.08em] leading-tight">{segment.label}</div>
                  <div className="flex justify-around text-[7px] uppercase tracking-[0.06em] leading-tight">{segment.subLabels.map((sub) => <span key={sub}>{sub}</span>)}</div>
                </div>
              ) : (
                <span className={`block truncate rounded-full px-0.5 py-1 text-center text-[7px] uppercase tracking-[0.08em] ${bayToneClasses[segment.tone].strip} ${ringClass}`} title={segment.label}>
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
              <div className="rounded-full border border-zinc-800 bg-zinc-900/85 px-1 py-1 text-center text-[8px] uppercase tracking-[0.12em] text-zinc-500" style={{ gridColumn: `span ${totalColumns - topEntries.length} / span ${totalColumns - topEntries.length}` }}>
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
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[9px] font-medium md:h-6 md:w-6 ${top ? `bg-zinc-950/95 ${bayToneClasses[top.tone].socket}` : 'border-zinc-800 bg-zinc-900/70 text-zinc-700'}`}>
                    {top?.number ?? ''}
                  </span>
                  <span className={`h-3 w-px ${top && bottom ? 'bg-zinc-600' : 'bg-zinc-800'}`} />
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[9px] font-medium md:h-6 md:w-6 ${bottom ? `bg-zinc-950/95 ${bayToneClasses[bottom.tone].socket}` : 'border-zinc-800 bg-zinc-900/70 text-zinc-700'}`}>
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
                <div className={`rounded-lg px-0.5 py-0.5 text-center ${bayToneClasses[segment.tone].strip} ${ringClass}`} title={segment.label}>
                  <div className="text-[7px] uppercase tracking-[0.08em] leading-tight">{segment.label}</div>
                  <div className="flex justify-around text-[7px] uppercase tracking-[0.06em] leading-tight">{segment.subLabels.map((sub) => <span key={sub}>{sub}</span>)}</div>
                </div>
              ) : (
                <span className={`block truncate rounded-full px-0.5 py-1 text-center text-[7px] uppercase tracking-[0.08em] ${bayToneClasses[segment.tone].strip} ${ringClass}`} title={segment.label}>
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
              <div className="rounded-full border border-zinc-800 bg-zinc-900/85 px-1 py-1 text-center text-[8px] uppercase tracking-[0.12em] text-zinc-500" style={{ gridColumn: `span ${totalColumns - bottomEntries.length} / span ${totalColumns - bottomEntries.length}` }}>
                open
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ children, active = false, tone = 'zinc', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; tone?: 'amber' | 'blue' | 'teal' | 'cyan' | 'violet' | 'zinc' }) {
  const tones = {
    amber: active ? 'border-amber-300 bg-amber-300 text-zinc-950' : 'border-amber-700/40 bg-amber-950/30 text-amber-200 hover:bg-amber-950/50',
    blue: active ? 'border-blue-300 bg-blue-300 text-zinc-950' : 'border-blue-700/40 bg-blue-950/30 text-blue-200 hover:bg-blue-950/50',
    teal: active ? 'border-teal-300 bg-teal-300 text-zinc-950' : 'border-teal-700/40 bg-teal-950/30 text-teal-200 hover:bg-teal-950/50',
    cyan: active ? 'border-cyan-300 bg-cyan-300 text-zinc-950' : 'border-cyan-700/40 bg-cyan-950/30 text-cyan-200 hover:bg-cyan-950/50',
    violet: active ? 'border-violet-300 bg-violet-300 text-zinc-950' : 'border-violet-700/40 bg-violet-950/30 text-violet-200 hover:bg-violet-950/50',
    zinc: active ? 'border-zinc-300 bg-zinc-300 text-zinc-950' : 'border-zinc-700 bg-zinc-900/70 text-zinc-300 hover:bg-zinc-900',
  };

  return (
    <button {...props} className={`rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] transition ${tones[tone]} ${className}`.trim()}>
      {children}
    </button>
  );
}

function CompactChoice({ pointNumber, tone, title, meta, body, detailLabel = 'Unit details', selected, primaryLabel, primaryActive = selected, onPrimary, onInspect, extraAction }: { pointNumber: number; tone: BayTone; title: string; meta: string; body?: string; detailLabel?: string; selected: boolean; primaryLabel: string; primaryActive?: boolean; onPrimary: () => void; onInspect: () => void; extraAction?: ReactNode }) {
  return (
    <div className={`rounded-xl border px-3 py-2 ${selected ? 'border-zinc-500 bg-zinc-950/85' : 'border-zinc-800 bg-zinc-950/55'}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium ${selected ? bayToneClasses[tone].selected : `bg-zinc-950/95 ${bayToneClasses[tone].socket}`}`}>
          {pointNumber}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-zinc-100">{title}</span>
            {selected && <span className="rounded-full border border-zinc-700 bg-zinc-900/70 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-zinc-300">active</span>}
          </div>
          <div className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-zinc-500">{meta}</div>
          {body && <p className="mt-1 text-xs leading-relaxed text-zinc-400">{body}</p>}
          <div className="mt-1.5 flex flex-wrap gap-2">
            <ActionButton type="button" onClick={onPrimary} tone="amber" active={primaryActive}>{primaryLabel}</ActionButton>
            <ActionButton type="button" onClick={onInspect}>{detailLabel}</ActionButton>
            {extraAction}
          </div>
        </div>
      </div>
    </div>
  );
}

  export default function PatchbayView({ perspective, mode, selectedMic, selectedPreamp, insertChain, parallelChain, analysis, onSelectMic, onSelectPreamp, onAddInsert, onAddParallel, onRemoveInsert, onRemoveParallel, onReorderInserts: _onReorderInserts, onInspect, equalizers, outboardProcessors }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [openSectionByRow, setOpenSectionByRow] = useState<Record<string, string | null>>({});
    const [showCascadeView, setShowCascadeView] = useState(false);

    useEffect(() => {
      const frame = window.requestAnimationFrame(() => setShowCascadeView(true));
      return () => window.cancelAnimationFrame(frame);
    }, []);

  const utilityMicTypes: Set<Microphone['type']> = new Set(['Measurement', 'Subkick', 'Field Recorder']);
  const orderedMicTypes: Microphone['type'][] = ['Tube LDC', 'FET LDC', 'FET MDC', 'FET SDC', 'Ribbon', 'Dynamic', 'Boundary'];
  const micGroupsRaw: Array<{ label: string; mics: Microphone[]; tone: BayTone }> = orderedMicTypes
    .map((type) => ({ label: micLabelExpanded[type] ?? type, mics: microphones.filter((mic) => mic.type === type), tone: micTypeTone[type] }))
    .filter((entry) => entry.mics.length > 0);
  const utilityMics = microphones.filter((mic) => utilityMicTypes.has(mic.type));
  if (utilityMics.length > 0) {
    micGroupsRaw.push({ label: 'Utility', mics: utilityMics, tone: 'cyan' });
  }
  const micGroups = micGroupsRaw.sort((a, b) => a.mics.length - b.mics.length);
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
    ? Array.from({ length: selectedPreamp.channels }, (_, i) => preampPointNumber(selectedPreamp.id) + i)
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

  const selectedPointsForItem = <T extends { id: string; channels: number }>(groups: Array<{ items: T[] }>, itemId: string, channels: number): number[] => {
    const start = pointNumberForGroupedItem(groups, itemId);
    return Array.from({ length: channels }, (_, i) => start + i);
  };

  const setOpenSection = (rowId: string, sectionId: string) => {
    setOpenSectionByRow((current) => ({
      ...current,
      [rowId]: current[rowId] === sectionId ? null : sectionId,
    }));
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

  const guide = nextStep(selectedMic, selectedPreamp, insertChain);
  const guideTheme = perspectiveTheme[perspective];
  const micSegments: BaySegment[] = (() => {
    const nonDynamic = micGroups.filter((g) => g.label !== 'Dynamic');
    const dynamicGroup = micGroups.find((g) => g.label === 'Dynamic');
    const nonDynamicTotal = nonDynamic.reduce((s, g) => s + g.mics.length, 0);
    const segments: BaySegment[] = nonDynamic.map((entry) => ({ id: entry.label.toLowerCase().replace(/[^a-z0-9]+/g, '-'), label: entry.label, count: entry.mics.length, tone: entry.tone }));
    if (dynamicGroup) {
      segments.push({ id: 'dynamic', label: 'Dynamic', count: BAY_ROW_LENGTH - nonDynamicTotal, tone: dynamicGroup.tone });
    }
    return segments;
  })();
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

  const selectedPointsForCombinedItem = (itemId: string, channels: number): number[] => {
    const start = pointNumberForCombinedItem(itemId);
    return Array.from({ length: channels }, (_, i) => start + i);
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
    { id: 'api-direct-outs', label: 'Direct Outs 1–16', count: 16, tone: 'orange', startNumber: 7 },
    { id: 'api-cue-out', label: 'Cue Out', count: 2, tone: 'yellow', startNumber: 23 },
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
    const start = micStartPoint(group.label);
    const idx = group.mics.findIndex((m) => m.id === selectedMic.id);
    return start + idx;
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
    'api-direct-outs': {
      title: 'API ASM164 Direct Outputs (Ch 1–16)',
      description: 'Per-channel direct outputs tapped post-fader, post-pan but pre-bus assignment. These are always active — even when the channel is assigned to Mix A or B, the direct output carries the processed signal. Useful for multitrack printing through the API preamp/summing topology while simultaneously feeding the stereo bus.',
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
    <div ref={scrollContainerRef} className="relative flex-1 overflow-y-auto px-4 py-4">
      <SignalFlowOverlay
        containerRef={scrollContainerRef}
        mode={mode}
        selectedMic={selectedMic}
        selectedPreamp={selectedPreamp}
        insertChain={insertChain}
        parallelChain={parallelChain}
      />
      <div className={`mb-4 rounded-[1.6rem] border p-4 ${guideTheme.tray}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] ${guideTheme.badge}`}>{guideTheme.label}</span>
            </div>
            <p className="max-w-4xl text-sm leading-relaxed text-zinc-200">{guide.body}</p>
          </div>
          {analysis && (
            <div className="min-w-[15rem] rounded-2xl border border-zinc-800 bg-zinc-950/60 px-3 py-2.5">
              <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Live electrical read</div>
              <div className="mt-2 text-sm text-zinc-100">{analysis.bridging_ratio.toFixed(1)}:1 bridging</div>
              <div className="mt-1 text-xs text-zinc-400">{analysis.loss_db.toFixed(2)} dB loss · {analysis.effective_bw_khz.toFixed(1)} kHz effective bandwidth</div>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-[1] space-y-4">
        {patchRows.map((row) => {
          const active = rowActive(row.id, selectedMic, selectedPreamp, insertChain, parallelChain);
          const isNext = guide.rowId === row.id;

          if (row.id === 'row-api-line-in' || row.id === 'row-insert-return' || row.id === 'row-spatial' || row.id === 'row-fx') {
            return null;
          }

          if (row.id === 'row-mic-ties') {
            const openSection = openSectionByRow[row.id] ?? null;
            const activeGroup = openSection ? (micGroups.find((entry) => entry.label.toLowerCase().replace(/[^a-z0-9]+/g, '-') === openSection) ?? null) : null;

            return (
              <RowShell key={row.id} rowId={row.id} order="0" label="MIC TIE LINES / PREAMP INPUTS" active={active} isNext={isNext}>
                <StackedBayFace rowId="row-mic-ties" topSegments={toPairedSegments(micSegments)} bottomSegments={preampInputSegments} selectedTopPoints={selectedMicPoint > 0 ? [selectedMicPoint] : []} selectedBottomPoints={selectedPreampPoints} openTopSegmentId={openSection} onTopSegmentClick={(sectionId) => setOpenSection(row.id, sectionId)} segmentButtonProps={{ 'data-row-section': row.id }} />

                {activeGroup && (
                  <DetailTray title={`${activeGroup.label} tie lines`} caption="Clicking the family header opens only this section. Each mic offers a direct add-to-chain action and a separate inspect action." toneClass="border-rose-900/60 bg-rose-950/18">
                    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                      {activeGroup.mics.map((mic, index) => (
                        <CompactChoice
                          key={mic.id}
                          pointNumber={micStartPoint(activeGroup.label) + index}
                          tone={activeGroup.tone}
                          title={mic.name}
                          meta={compactMeta([mic.type, `${mic.qty}x`, mic.patterns.join('/')])}
                          selected={selectedMic?.id === mic.id}
                          primaryLabel="Add to chain"
                          onPrimary={() => onSelectMic(mic)}
                          detailLabel="Mic details"
                          onInspect={() => onInspect(mic.id)}
                        />
                      ))}
                    </div>
                  </DetailTray>
                )}
              </RowShell>
            );
          }

          if (row.id === 'row-preamp-in') {
            const openSection = openSectionByRow[row.id] ?? null;
            const normalizedSection = openSection?.replace(/-inputs$/, '').replace(/-outputs$/, '') ?? null;
            const preampsInSection = normalizedSection === 'preamp-eq' ? preampEqUnits : standardPreamps;

            return (
              <RowShell key={row.id} rowId={row.id} order="1" label="PREAMP OUTPUTS / DAW INPUTS" active={active} isNext={isNext}>
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
                />

                {openSection && preampsInSection.length > 0 && (
                  <DetailTray title={normalizedSection === 'preamp-eq' ? 'Preamp / EQ units' : 'Standalone preamps'} caption={normalizedSection === 'preamp-eq' ? 'These units can serve as the first gain stage and can also donate their EQ section later as another analog stage.' : 'These are the direct first-stage choices. The selected preamp row stays highlighted after you commit one.'} toneClass="border-blue-900/60 bg-blue-950/18">
                    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                      {preampsInSection.map((preamp) => (
                        <CompactChoice
                          key={preamp.id}
                          pointNumber={preampPointNumber(preamp.id)}
                          tone={openSection === 'preamp-eq' ? 'cyan' : 'blue'}
                          title={preamp.name}
                          meta={compactMeta([preamp.topology, `${preamp.channels}ch`, preamp.eq_features ?? null])}
                          selected={selectedPreamp?.id === preamp.id}
                          primaryLabel="Patch into chain"
                          onPrimary={() => onSelectPreamp(preamp)}
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

                {openSection && openSection === 'lynx-line-inputs' && (
                  <DetailTray title={segmentInfo['lynx-line-inputs'].title} caption={segmentInfo['lynx-line-inputs'].description} toneClass="border-green-900/60 bg-green-950/18">
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
              <RowShell key={row.id} rowId={row.id} order="2" label="DAW OUTPUTS / CONSOLE INPUTS" active={active} isNext={isNext}>
                <PhysicalPairedBay topSegments={dawOutputTopSegments} bottomSegments={dawOutputBottomSegments} openSegmentId={openSection} onSegmentClick={(sectionId) => setOpenSection(row.id, sectionId)} />

                {activeInfo && (
                  <DetailTray title={activeInfo.title} caption={activeInfo.description} toneClass="border-blue-900/60 bg-blue-950/18">
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
              <RowShell key={row.id} rowId={row.id} order="3" label="INSERT SENDS / RETURNS" active={active} isNext={isNext}>
                <PhysicalPairedBay topSegments={insertSendSegments} bottomSegments={insertReturnSegments} openSegmentId={openSection} onSegmentClick={(sectionId) => setOpenSection(row.id, sectionId)} />

                {activeInfo && (
                  <DetailTray title={activeInfo.title} caption={activeInfo.description} toneClass="border-violet-900/60 bg-violet-950/18">
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
              <RowShell key={row.id} rowId={row.id} order={row.order} label={routeRowLabel(row.id)} active={active} isNext={isNext}>
                <StackedBayFace rowId="row-dynamics" topSegments={toPairedSegments(compressorSegments)} bottomSegments={toPairedSegments(compressorSegments)} selectedTopPoints={compressors.flatMap((c) => (insertIds.has(c.id) || parallelIds.has(c.id) ? selectedPointsForItem(compressorGroups, c.id, c.channels) : []))} selectedBottomPoints={compressors.flatMap((c) => (insertIds.has(c.id) || parallelIds.has(c.id) ? selectedPointsForItem(compressorGroups, c.id, c.channels) : []))} openTopSegmentId={openSection} onTopSegmentClick={(sectionId) => setOpenSection(row.id, sectionId)} segmentButtonProps={{ 'data-row-section': row.id }} />

                {activeGroup && (
                  <DetailTray title={`${activeGroup.label} compressors`} caption="Patch into chain inserts the unit into the direct path. Blend return keeps the dry route intact and adds a parallel branch." toneClass="border-purple-900/60 bg-purple-950/18">
                    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                      {activeGroup.items.map((compressor) => (
                        (() => {
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
                          onPrimary={() => toggleInsert({ type: 'compressor', item: compressor })}
                          detailLabel="Compressor details"
                          onInspect={() => onInspect(compressor.id)}
                          extraAction={<ActionButton type="button" tone="cyan" active={parallelSelected} onClick={() => toggleParallel({ type: 'compressor', item: compressor })}>{parallelSelected ? 'Remove branch' : 'Blend return'}</ActionButton>}
                        />
                          );
                        })()
                      ))}
                    </div>
                  </DetailTray>
                )}
              </RowShell>
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
              <RowShell key={row.id} rowId={row.id} order={row.order} label={routeRowLabel(row.id)} active={active} isNext={isNext}>
                <StackedBayFace rowId="row-eq" topSegments={toPairedSegments(combinedOutboardSegments)} bottomSegments={toPairedSegments(combinedOutboardSegments)} selectedTopPoints={combinedSelectedTop} selectedBottomPoints={combinedSelectedTop} openTopSegmentId={openSection} onTopSegmentClick={(sectionId) => setOpenSection(row.id, sectionId)} segmentButtonProps={{ 'data-row-section': row.id }} />

                {activeEntry && trayConfig && (
                  <DetailTray title={trayConfig.title} caption={trayConfig.caption} toneClass={trayConfig.toneClass}>
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
                          onPrimary={() => toggleInsert({ type: 'equalizer', item: equalizer as any })}
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
                          onPrimary={() => toggleInsert({ type: 'outboard', item: processor as any })}
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
                          onPrimary={() => toggleParallel({ type: 'outboard', item: processor as any })}
                          detailLabel="Processor details"
                          onInspect={() => onInspect(processor.id)}
                        />
                      ))}
                    </div>
                  </DetailTray>
                )}
              </RowShell>
            );
          }

          if (row.id === 'row-api-mix') {
            const openSection = openSectionByRow[row.id] ?? null;
            const activeInfo = openSection ? segmentInfo[openSection] ?? null : null;

            return (
              <RowShell key={row.id} rowId={row.id} order={row.order} label={routeRowLabel(row.id)} active={active} isNext={isNext}>
                <PhysicalPairedBay topSegments={apiMixTopSegments} bottomSegments={apiMixBottomSegments} openSegmentId={openSection} onSegmentClick={(sectionId) => setOpenSection(row.id, sectionId)} />

                {activeInfo && (
                  <DetailTray title={activeInfo.title} caption={activeInfo.description} toneClass="border-amber-900/60 bg-amber-950/18">
                    <div />
                  </DetailTray>
                )}
              </RowShell>
            );
          }

          if (row.id === 'row-pueblo') {
            const openSection = openSectionByRow[row.id] ?? null;
            const activeInfo = openSection ? segmentInfo[openSection] ?? null : null;

            return (
              <RowShell key={row.id} rowId={row.id} order={row.order} label={routeRowLabel(row.id)} active={active} isNext={isNext}>
                <PhysicalPairedBay topSegments={puebloTopSegments} bottomSegments={puebloBottomSegments} openSegmentId={openSection} onSegmentClick={(sectionId) => setOpenSection(row.id, sectionId)} />

                {activeInfo && (
                  <DetailTray title={activeInfo.title} caption={activeInfo.description} toneClass="border-yellow-900/60 bg-yellow-950/18">
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
              <RowShell key={row.id} rowId={row.id} order={row.order} label={routeRowLabel(row.id)} active={active} isNext={isNext}>
                <PhysicalPairedBay topSegments={adDawTopSegments} bottomSegments={adDawBottomSegments} openSegmentId={openSection} onSegmentClick={(sectionId) => setOpenSection(row.id, sectionId)} />

                {activeInfo && (
                  <DetailTray title={activeInfo.title} caption={activeInfo.description} toneClass="border-blue-900/60 bg-blue-950/18">
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
        <Suspense fallback={<div className="mt-4 rounded-[1.7rem] border border-zinc-800 bg-zinc-950/40 px-4 py-6 text-sm text-zinc-500">Loading console and monitor path…</div>}>
          <CascadeView mode={mode} perspective={perspective} />
        </Suspense>
      ) : (
        <div className="mt-4 rounded-[1.7rem] border border-zinc-800 bg-zinc-950/40 px-4 py-6 text-sm text-zinc-500">Loading console and monitor path…</div>
      )}
    </div>
  );
}
