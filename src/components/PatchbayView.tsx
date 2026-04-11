import { useState } from 'react';
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
} from '../types/studio';
import { patchRows } from '../data/studio';
import { microphones } from '../data/microphones';
import { preamps } from '../data/preamps';
import { compressors } from '../data/compressors';
import RouteReadout from './RouteReadout';

interface Props {
  perspective: Perspective;
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

type BayTone = 'rose' | 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'teal' | 'cyan' | 'sky' | 'blue' | 'violet' | 'purple' | 'slate';

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
    <section className={`rounded-[1.6rem] border px-3 py-3 md:px-4 md:py-4 ${rowShellTone[rowId] ?? rowShellTone['row-mic-ties']} ${isNext ? 'ring-1 ring-inset ring-zinc-100/18' : ''}`}>
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
  topSegments,
  bottomSegments,
  selectedTopPoints = [],
  selectedBottomPoints = [],
  openTopSegmentId,
  onTopSegmentClick,
  segmentButtonProps,
}: {
  topSegments: PairedBaySegment[];
  bottomSegments: PairedBaySegment[];
  selectedTopPoints?: number[];
  selectedBottomPoints?: number[];
  openTopSegmentId?: string | null;
  onTopSegmentClick?: (segmentId: string) => void;
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

  const renderSocketRow = (entries: ExpandedBayPoint[], selectedSet: Set<number>) => (
    <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))` }}>
      {Array.from({ length: totalColumns }, (_, index) => {
        const entry = entries[index] ?? null;
        const selected = entry?.number != null && selectedSet.has(entry.number);

        return (
          <div key={`${entry?.segmentId ?? 'open'}-${index}`} className="flex justify-center">
            <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[9px] font-medium md:h-6 md:w-6 ${entry ? (selected ? bayToneClasses[entry.tone].selected : `bg-zinc-950/95 ${bayToneClasses[entry.tone].socket}`) : 'border-zinc-800 bg-zinc-900/70 text-zinc-700'}`}>
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
          {renderSocketRow(topEntries, selectedTop)}
          {renderSocketRow(bottomEntries, selectedBottom)}
          {renderStrip(bottomSegments, openTopSegmentId, onTopSegmentClick)}
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

export default function PatchbayView({ perspective, selectedMic, selectedPreamp, insertChain, parallelChain, analysis, onSelectMic, onSelectPreamp, onAddInsert, onAddParallel, onRemoveInsert, onRemoveParallel, onReorderInserts, onInspect, equalizers, outboardProcessors }: Props) {
  const [openSectionByRow, setOpenSectionByRow] = useState<Record<string, string | null>>({});

  const orderedMicTypes: Microphone['type'][] = ['Tube LDC', 'FET LDC', 'FET MDC', 'FET SDC', 'Ribbon', 'Dynamic', 'Boundary', 'Measurement', 'Subkick', 'Field Recorder'];
  const micGroups = orderedMicTypes.map((type) => ({ type, mics: microphones.filter((mic) => mic.type === type) })).filter((entry) => entry.mics.length > 0);
  const standardPreamps = preamps.filter((preamp) => !hasStandaloneEqSection(preamp));
  const preampEqUnits = preamps.filter(hasStandaloneEqSection);
  const orderedPreamps = [...standardPreamps, ...preampEqUnits];
  const compressorGroups = groupByLabel(compressors, (compressor) => compressor.topology.replace(/-/g, ' '));
  const eqGroups = groupByLabel(equalizers, (equalizer) => equalizer.topology.replace(/-/g, ' '));
  const inlineOutboard = outboardProcessors.filter((processor) => processor.routing_mode === 'inline-optional');
  const parallelFx = outboardProcessors.filter((processor) => processor.routing_mode === 'parallel-send-return');
  const inlineGroups = groupByLabel(inlineOutboard, (processor) => processor.type.replace(/-/g, ' '));
  const fxGroups = groupByLabel(parallelFx, (processor) => processor.type.replace(/-/g, ' '));
  const selectedPreampPoint = selectedPreamp ? orderedPreamps.findIndex((preamp) => preamp.id === selectedPreamp.id) + 1 : 0;
  const insertIds = new Set(insertChain.map((processor) => processor.item.id));
  const parallelIds = new Set(parallelChain.map((processor) => processor.item.id));
  const insertPreampEqIds = new Set(insertChain.filter((processor) => processor.type === 'preamp-eq').map((processor) => processor.item.id));

  const micStartPoint = (type: Microphone['type']) => {
    let cursor = 1;

    for (const entry of micGroups) {
      if (entry.type === type) return cursor;
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
  const micSegments: BaySegment[] = micGroups.map((entry) => ({ id: entry.type.toLowerCase().replace(/[^a-z0-9]+/g, '-'), label: entry.type, count: entry.mics.length, tone: micTypeTone[entry.type] }));
  const preampSegments: BaySegment[] = [];

  if (standardPreamps.length > 0) {
    preampSegments.push({ id: 'direct-preamp', label: `${standardPreamps.length} preamps`, count: standardPreamps.length, tone: 'blue' });
  }

  if (preampEqUnits.length > 0) {
    preampSegments.push({ id: 'preamp-eq', label: `${preampEqUnits.length} preamp / eq`, count: preampEqUnits.length, tone: 'cyan' });
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
    { id: 'pueblo-line-inputs', label: 'Pueblo Line Inputs', count: 32, tone: 'yellow', startNumber: 1 },
  ];
  const preampInputSegments: PairedBaySegment[] = [];

  if (standardPreamps.length > 0) {
    preampInputSegments.push({ id: 'direct-preamp-inputs', label: 'Preamp Inputs', count: standardPreamps.length, tone: 'blue', startNumber: 1 });
  }

  if (preampEqUnits.length > 0) {
    preampInputSegments.push({ id: 'preamp-eq-inputs', label: 'Preamp / EQ Inputs', count: preampEqUnits.length, tone: 'cyan', startNumber: standardPreamps.length + 1 });
  }

  const preampOutputSegments: PairedBaySegment[] = [];

  if (standardPreamps.length > 0) {
    preampOutputSegments.push({ id: 'direct-preamp-outputs', label: 'Preamp Outputs', count: standardPreamps.length, tone: 'orange', startNumber: 1 });
  }

  if (preampEqUnits.length > 0) {
    preampOutputSegments.push({ id: 'preamp-eq-outputs', label: 'Preamp / EQ Outputs', count: preampEqUnits.length, tone: 'teal', startNumber: standardPreamps.length + 1 });
  }

  const insertSendSegments: PairedBaySegment[] = [
    { id: 'api-insert-sends', label: 'API Insert Sends', count: 16, tone: 'violet', startNumber: 1 },
    { id: 'mix-a-send', label: 'A Send', count: 2, tone: 'purple', startNumber: 17 },
    { id: 'mix-b-send', label: 'B Send', count: 2, tone: 'purple', startNumber: 19 },
    { id: 'master-send', label: 'Main Send', count: 2, tone: 'purple', startNumber: 21 },
    { id: 'otb-send', label: 'OTB Send', count: 2, tone: 'blue', startNumber: 23 },
    { id: 'pueblo-banks', label: 'Pueblo Sum', count: 8, tone: 'yellow', startNumber: 25, subLabels: ['A', 'B', 'C', 'D'] },
    { id: 'dbox-out', label: 'dBox Out', count: 2, tone: 'blue', startNumber: 33 },
    { id: 'atty-out', label: 'ATTY', count: 6, tone: 'teal', startNumber: 35 },
    { id: 'main-vu-out', label: 'Main VU', count: 2, tone: 'amber', startNumber: 41 },
  ];
  const insertReturnSegments: PairedBaySegment[] = [
    { id: 'api-insert-returns', label: 'API Insert Returns', count: 16, tone: 'violet', startNumber: 1 },
    { id: 'mix-a-return', label: 'A Return', count: 2, tone: 'purple', startNumber: 17 },
    { id: 'mix-b-return', label: 'B Return', count: 2, tone: 'purple', startNumber: 19 },
    { id: 'master-return', label: 'Main Return', count: 2, tone: 'purple', startNumber: 21 },
    { id: 'otb-return', label: 'OTB Return', count: 2, tone: 'blue', startNumber: 23 },
    { id: 'dbox-sum', label: 'dBox+ Sum', count: 8, tone: 'lime', startNumber: 25 },
    { id: 'adplus-in-a', label: 'AD+ In A', count: 2, tone: 'red', startNumber: 33 },
    { id: 'atty-in', label: 'St.A / St.B / C / D', count: 6, tone: 'teal', startNumber: 35 },
    { id: 'main-vu-in', label: 'VU In', count: 2, tone: 'amber', startNumber: 41 },
  ];
  const selectedMicPoint = selectedMic ? micStartPoint(selectedMic.type) : 0;

  const segmentInfo: Record<string, { title: string; description: string }> = {
    // Bay 3 — DAW Outputs / Console Inputs
    'lynx-line-outputs': {
      title: 'Lynx Aurora(n) Line Outputs',
      description: 'Mastering-grade multichannel DA conversion with dedicated converter arrays per channel pair for ultra-low crosstalk (−130 dB). SynchroLock 2 jitter elimination keeps the analog output pristine. These are clean, transparent line-level feeds from the DAW — the sonic character of this path is essentially whatever the session contains.',
    },
    'api-line-inputs': {
      title: 'API ASM164 Line Inputs',
      description: 'The 16-channel summing mixer\'s direct line inputs, driven by API 2510 input op-amps and 2520 output op-amps built to the same MIL-Spec standard as vintage API consoles. Each channel has per-channel panning and 31-step detented level control. Signals entering here are assigned to the Mix A or Mix B stereo program bus for analog summing.',
    },
    'pueblo-line-inputs': {
      title: 'Pueblo Audio HJ482 Line Inputs',
      description: 'A 48-input summing matrix organized across four independent 8×2 stereo banks (A–D). Ultra-low distortion (0.00094% THD), 127 dB dynamic range, and −103 dB crosstalk. Each bank can operate independently or cascade into Bank D as the main bus. Switchable output transformers add optional color.',
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
    'otb-send': {
      title: 'Tonelux OTB Send',
      description: 'Output from the Tonelux OTB analog summing unit. Adds organic cohesion and transformer-coupled warmth to stems summed through it. Designed for hybrid ITB/OTB workflows where digital stems benefit from analog ensemble character.',
    },
    'otb-return': {
      title: 'Tonelux OTB Return',
      description: 'Input to the Tonelux OTB summing unit. Signals patched here are summed through the OTB\'s transformer-coupled analog path.',
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
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
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

      <div className="space-y-4">
        {patchRows.map((row) => {
          const active = rowActive(row.id, selectedMic, selectedPreamp, insertChain, parallelChain);
          const isNext = guide.rowId === row.id;

          if (row.id === 'row-api-line-in' || row.id === 'row-insert-return' || row.id === 'row-spatial' || row.id === 'row-fx' || row.id === 'row-api-mix' || row.id === 'row-pueblo' || row.id === 'row-ad-daw') {
            return null;
          }

          if (row.id === 'row-mic-ties') {
            const openSection = openSectionByRow[row.id] ?? null;
            const activeGroup = openSection ? (micGroups.find((entry) => entry.type.toLowerCase().replace(/[^a-z0-9]+/g, '-') === openSection) ?? null) : null;

            return (
              <RowShell key={row.id} rowId={row.id} order="0" label={routeRowLabel(row.id)} active={active} isNext={isNext}>
                <StackedBayFace topSegments={toPairedSegments(micSegments)} bottomSegments={toPairedSegments(micSegments)} selectedTopPoints={selectedMicPoint > 0 ? [selectedMicPoint] : []} selectedBottomPoints={selectedMicPoint > 0 ? [selectedMicPoint] : []} openTopSegmentId={openSection} onTopSegmentClick={(sectionId) => setOpenSection(row.id, sectionId)} segmentButtonProps={{ 'data-row-section': row.id }} />

                {activeGroup && (
                  <DetailTray title={`${activeGroup.type} tie lines`} caption="Clicking the family header opens only this section. Each mic offers a direct add-to-chain action and a separate inspect action." toneClass="border-rose-900/60 bg-rose-950/18">
                    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                      {activeGroup.mics.map((mic, index) => (
                        <CompactChoice
                          key={mic.id}
                          pointNumber={micStartPoint(activeGroup.type) + index}
                          tone={micTypeTone[activeGroup.type]}
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
            const offset = normalizedSection === 'preamp-eq' ? standardPreamps.length : 0;

            return (
              <RowShell key={row.id} rowId={row.id} order="1&2" label="PREAMP I/O" active={active} isNext={isNext}>
                <StackedBayFace
                  topSegments={preampInputSegments}
                  bottomSegments={preampOutputSegments}
                  selectedTopPoints={selectedPreampPoint > 0 ? [selectedPreampPoint] : []}
                  selectedBottomPoints={selectedPreampPoint > 0 ? [selectedPreampPoint] : []}
                  openTopSegmentId={openSection}
                  onTopSegmentClick={(sectionId) => setOpenSection(row.id, sectionId)}
                  segmentButtonProps={{ 'data-row-section': row.id }}
                />

                {openSection && preampsInSection.length > 0 && (
                  <DetailTray title={normalizedSection === 'preamp-eq' ? 'Preamp / EQ units' : 'Standalone preamps'} caption={normalizedSection === 'preamp-eq' ? 'These units can serve as the first gain stage and can also donate their EQ section later as another analog stage.' : 'These are the direct first-stage choices. The selected preamp row stays highlighted after you commit one.'} toneClass="border-blue-900/60 bg-blue-950/18">
                    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                      {preampsInSection.map((preamp, index) => (
                        <CompactChoice
                          key={preamp.id}
                          pointNumber={offset + index + 1}
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
              </RowShell>
            );
          }

          if (row.id === 'row-preamp-out') {
            const openSection = openSectionByRow[row.id] ?? null;
            const activeInfo = openSection ? segmentInfo[openSection] ?? null : null;

            return (
              <RowShell key={row.id} rowId={row.id} order="3" label="DAW OUTPUTS / CONSOLE INPUTS" active={active} isNext={isNext}>
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
              <RowShell key={row.id} rowId={row.id} order="4" label="INSERT SENDS / RETURNS" active={active} isNext={isNext}>
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
                <StackedBayFace topSegments={toPairedSegments(compressorSegments)} bottomSegments={toPairedSegments(compressorSegments)} selectedTopPoints={compressors.flatMap((c) => (insertIds.has(c.id) || parallelIds.has(c.id) ? selectedPointsForItem(compressorGroups, c.id, c.channels) : []))} selectedBottomPoints={compressors.flatMap((c) => (insertIds.has(c.id) || parallelIds.has(c.id) ? selectedPointsForItem(compressorGroups, c.id, c.channels) : []))} openTopSegmentId={openSection} onTopSegmentClick={(sectionId) => setOpenSection(row.id, sectionId)} segmentButtonProps={{ 'data-row-section': row.id }} />

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
                <StackedBayFace topSegments={toPairedSegments(combinedOutboardSegments)} bottomSegments={toPairedSegments(combinedOutboardSegments)} selectedTopPoints={combinedSelectedTop} selectedBottomPoints={combinedSelectedTop} openTopSegmentId={openSection} onTopSegmentClick={(sectionId) => setOpenSection(row.id, sectionId)} segmentButtonProps={{ 'data-row-section': row.id }} />

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

          /* ── Bay 11–13 hidden pending redesign ──────────────────────────
          if (row.id === 'row-api-mix') {
            return (
              <RowShell key={row.id} rowId={row.id} order={row.order} label={routeRowLabel(row.id)} active={active} isNext={isNext}>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-amber-800/40 bg-amber-950/20 p-3">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-amber-200">Mix A</div>
                    <div className="mt-1 text-sm text-zinc-100">Default tracking path</div>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400">API channel path {'->'} stereo bus {'->'} Dangerous AD+ input A. This is the straightforward record path when you are not deliberately rerouting elsewhere.</p>
                  </div>
                  <div className="rounded-2xl border border-amber-800/40 bg-zinc-950/55 p-3">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-amber-200">Mix B</div>
                    <div className="mt-1 text-sm text-zinc-100">Return lane for blended material</div>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400">Parallel returns and overflow can land here so the dry route stays readable while wet or secondary material stays visibly separate.</p>
                  </div>
                </div>
              </RowShell>
            );
          }

          if (row.id === 'row-pueblo') {
            return (
              <RowShell key={row.id} rowId={row.id} order={row.order} label={routeRowLabel(row.id)} active={active} isNext={isNext}>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-yellow-800/40 bg-yellow-950/18 p-3">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-yellow-100">Pueblo HJ482</div>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400">32 inputs across four banks. Bank D stereo out is the visible continuation when the app needs to show the longer mix-side chain.</p>
                  </div>
                  <div className="rounded-2xl border border-yellow-800/40 bg-zinc-950/55 p-3">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-yellow-100">Tonelux OTB</div>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400">Shared wet-return stage for blended branches. It gives the parallel side a clear home before material returns to Mix B.</p>
                  </div>
                </div>
              </RowShell>
            );
          }

          return (
            <RowShell key={row.id} rowId={row.id} order={row.order} label={routeRowLabel(row.id)} active={active} isNext={isNext}>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-blue-800/40 bg-blue-950/20 p-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-blue-100">Dangerous AD+ input A</div>
                  <div className="mt-1 text-xs text-zinc-400">Tracking commit</div>
                </div>
                <div className="rounded-2xl border border-blue-800/40 bg-zinc-950/55 p-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-blue-100">AES out</div>
                  <div className="mt-1 text-xs text-zinc-400">Digital handoff leaves the analog field here.</div>
                </div>
                <div className="rounded-2xl border border-blue-800/40 bg-zinc-950/55 p-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-blue-100">Lynx Aurora(n) input 31</div>
                  <div className="mt-1 text-xs text-zinc-400">The converter landing point that still matters before the workstation sees it.</div>
                </div>
                <div className="rounded-2xl border border-blue-800/40 bg-zinc-950/55 p-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-blue-100">DAW audio track source</div>
                  <div className="mt-1 text-xs text-zinc-400">This is the final visible destination on the current tracking path.</div>
                </div>
              </div>
            </RowShell>
          );
          ── end hidden bays ──────────────────────────────────────────── */

          return null;
        })}
      </div>

      <section className="mt-4 overflow-hidden rounded-[1.7rem] border border-zinc-800 bg-[linear-gradient(180deg,rgba(16,18,21,0.98),rgba(8,10,12,0.98))]">
        <div className="border-b border-zinc-800 px-4 py-3">
          <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Full route transcription</div>
          <div className="mt-1 text-sm text-zinc-100">The chain is spelled out beyond conversion so the endpoint is explicit and the route stays teachable.</div>
        </div>
        <div className="p-4">
          <RouteReadout
            perspective={perspective}
            selectedMic={selectedMic}
            selectedPreamp={selectedPreamp}
            insertChain={insertChain}
            parallelChain={parallelChain}
            analysis={analysis}
            onSelectMic={onSelectMic}
            onSelectPreamp={onSelectPreamp}
            onRemoveInsert={onRemoveInsert}
            onRemoveParallel={onRemoveParallel}
            onReorderInserts={onReorderInserts}
            onInspect={onInspect}
          />
        </div>
      </section>
    </div>
  );
}
