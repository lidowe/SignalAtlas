import { useState, useRef, useEffect } from 'react';
import type { Microphone, MicType, BayTone } from '../types/studio';
import GearSilhouette, { micFormFor } from './GearSilhouette';
import { gearImage } from '../utils/gearImage';

// ── Locker group color gradients (warm palette, distinct from patchbay BayTone) ──

interface LockerHue {
  /** Drawer header gradient */
  header: string;
  /** Selected card border glow */
  glow: string;
  /** Subtle background wash for expanded drawer */
  wash: string;
  /** Accent color string for SVG silhouettes */
  accent: string;
  /** Badge/count text color */
  badge: string;
}

function lockerHueFromTone(tone: BayTone): LockerHue {
  // Map BayTone → warm cabinet gradient. These are intentionally muted
  // and warmer than the patchbay strip tones to feel like wood shelving
  // with subtle color coding.
  const hues: Partial<Record<BayTone, LockerHue>> = {
    purple: { header: 'from-purple-950/40 to-stone-950/60', glow: 'shadow-[0_0_8px_rgba(168,85,247,0.25)]', wash: 'bg-purple-950/10', accent: '#c084fc', badge: 'text-purple-300/70' },
    blue:   { header: 'from-blue-950/40 to-stone-950/60', glow: 'shadow-[0_0_8px_rgba(59,130,246,0.25)]', wash: 'bg-blue-950/10', accent: '#60a5fa', badge: 'text-blue-300/70' },
    orange: { header: 'from-orange-950/40 to-stone-950/60', glow: 'shadow-[0_0_8px_rgba(249,115,22,0.25)]', wash: 'bg-orange-950/10', accent: '#fb923c', badge: 'text-orange-300/70' },
    rose:   { header: 'from-rose-950/40 to-stone-950/60', glow: 'shadow-[0_0_8px_rgba(244,63,94,0.25)]', wash: 'bg-rose-950/10', accent: '#fb7185', badge: 'text-rose-300/70' },
    sky:    { header: 'from-sky-950/40 to-stone-950/60', glow: 'shadow-[0_0_8px_rgba(14,165,233,0.25)]', wash: 'bg-sky-950/10', accent: '#38bdf8', badge: 'text-sky-300/70' },
    teal:   { header: 'from-teal-950/40 to-stone-950/60', glow: 'shadow-[0_0_8px_rgba(20,184,166,0.25)]', wash: 'bg-teal-950/10', accent: '#2dd4bf', badge: 'text-teal-300/70' },
    green:  { header: 'from-green-950/40 to-stone-950/60', glow: 'shadow-[0_0_8px_rgba(34,197,94,0.25)]', wash: 'bg-green-950/10', accent: '#4ade80', badge: 'text-green-300/70' },
    lime:   { header: 'from-lime-950/40 to-stone-950/60', glow: 'shadow-[0_0_8px_rgba(132,204,22,0.25)]', wash: 'bg-lime-950/10', accent: '#a3e635', badge: 'text-lime-300/70' },
    slate:  { header: 'from-stone-900/40 to-stone-950/60', glow: 'shadow-[0_0_8px_rgba(161,161,170,0.2)]', wash: 'bg-stone-900/8', accent: '#a1a1aa', badge: 'text-zinc-400/70' },
    cyan:   { header: 'from-cyan-950/40 to-stone-950/60', glow: 'shadow-[0_0_8px_rgba(6,182,212,0.25)]', wash: 'bg-cyan-950/10', accent: '#22d3ee', badge: 'text-cyan-300/70' },
    violet: { header: 'from-violet-950/40 to-stone-950/60', glow: 'shadow-[0_0_8px_rgba(139,92,246,0.25)]', wash: 'bg-violet-950/10', accent: '#a78bfa', badge: 'text-violet-300/70' },
    amber:  { header: 'from-amber-950/40 to-stone-950/60', glow: 'shadow-[0_0_8px_rgba(245,158,11,0.25)]', wash: 'bg-amber-950/10', accent: '#fbbf24', badge: 'text-amber-300/70' },
    red:    { header: 'from-red-950/40 to-stone-950/60', glow: 'shadow-[0_0_8px_rgba(239,68,68,0.25)]', wash: 'bg-red-950/10', accent: '#f87171', badge: 'text-red-300/70' },
    yellow: { header: 'from-yellow-950/40 to-stone-950/60', glow: 'shadow-[0_0_8px_rgba(234,179,8,0.25)]', wash: 'bg-yellow-950/10', accent: '#facc15', badge: 'text-yellow-300/70' },
  };
  return hues[tone] ?? hues.slate!;
}

// ── Mic type short labels ──

const MIC_TYPE_SHORT: Record<MicType, string> = {
  'Tube LDC': 'Tube LDC',
  'FET LDC': 'FET LDC',
  'FET MDC': 'FET MDC',
  'FET SDC': 'FET SDC',
  Ribbon: 'Ribbon',
  Dynamic: 'Dynamic',
  Boundary: 'Boundary',
  Measurement: 'Meas.',
  Subkick: 'Subkick',
  'Field Recorder': 'Recorder',
};

// ── Component props ──

export interface MicGroup {
  label: string;
  mics: Microphone[];
  tone: BayTone;
}

interface MicLockerProps {
  groups: MicGroup[];
  selectedMic: Microphone | null;
  onSelectMic: (mic: Microphone) => void;
  onInspect: (id: string) => void;
  isNext: boolean;
}

// ── Drawer handle SVG — the little pull handle on each closed drawer ──
function DrawerHandle({ accent }: { accent: string }) {
  return (
    <svg width="18" height="4" viewBox="0 0 18 4" fill="none" className="opacity-60 transition-opacity group-hover/drawer:opacity-90">
      <rect x="0" y="0" width="18" height="4" rx="2" fill={accent} fillOpacity={0.14} />
      <rect x="1.5" y="1.25" width="15" height="1.5" rx="0.75" fill={accent} fillOpacity={0.24} />
    </svg>
  );
}

// ── Animated sliding drawer ──
function SlidingDrawer({ open, children }: { open: boolean; children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (open && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [open]);

  return (
    <div
      className="overflow-hidden transition-[max-height,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{ maxHeight: open ? height + 24 : 0, opacity: open ? 1 : 0 }}
    >
      <div ref={contentRef} className="pt-1.5">{children}</div>
    </div>
  );
}

// ── Main component ──

export default function MicLocker({ groups, selectedMic, onSelectMic, onInspect, isNext }: MicLockerProps) {
  const [openDrawer, setOpenDrawer] = useState<string | null>(null);
  const micActive = selectedMic != null;

  // Auto-open the drawer containing the selected mic
  useEffect(() => {
    if (selectedMic && !openDrawer) {
      const ownerGroup = groups.find(g => g.mics.some(m => m.id === selectedMic.id));
      if (ownerGroup) setOpenDrawer(ownerGroup.label);
    }
  }, [selectedMic, groups, openDrawer]);

  const toggleDrawer = (label: string) => {
    setOpenDrawer(prev => prev === label ? null : label);
  };

  return (
    <section
      data-row-id="row-mics"
      className={`locker-cabinet relative overflow-hidden rounded-[5px] transition-opacity duration-500 ${micActive ? 'opacity-100 signal-live' : isNext ? 'ring-1 ring-inset ring-amber-400/20 opacity-100' : 'opacity-[0.88]'}`}
    >
      {/* ── Cabinet frame layers ── */}

      {/* Wood grain texture */}
      <div className="pointer-events-none absolute inset-0 rounded-[5px]" style={{
        background: `
          repeating-linear-gradient(87deg, rgba(139,90,43,0.018) 0px, transparent 1px, transparent 6px),
          repeating-linear-gradient(93deg, rgba(100,65,30,0.012) 0px, transparent 1px, transparent 8px),
          linear-gradient(180deg, rgba(130,90,50,0.07) 0%, rgba(90,60,30,0.03) 40%, rgba(50,30,15,0.06) 100%)
        `,
      }} />

      {/* Top cap — leather-wrapped trim */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[4px] rounded-t-[5px]" style={{
        background: `linear-gradient(180deg, rgba(160,115,65,0.35) 0%, rgba(100,70,35,0.2) 100%)`,
        boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
      }} />

      {/* Bottom cap */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] rounded-b-[5px]" style={{
        background: 'linear-gradient(180deg, rgba(60,40,20,0.25) 0%, rgba(40,25,12,0.4) 100%)',
      }} />

      {/* Side rails */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[3px]" style={{
        background: 'linear-gradient(180deg, rgba(140,100,55,0.12), rgba(80,55,30,0.08))',
        boxShadow: 'inset -1px 0 0 rgba(0,0,0,0.15)',
      }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[3px]" style={{
        background: 'linear-gradient(180deg, rgba(140,100,55,0.12), rgba(80,55,30,0.08))',
        boxShadow: 'inset 1px 0 0 rgba(0,0,0,0.15)',
      }} />

      {/* ── Cabinet interior ── */}
      <div className="relative px-2 py-1.5 md:px-2.5 md:py-2">
        {/* Nameplate */}
        <div className="mb-1.5 flex items-center gap-2">
          <span className={isNext ? 'led led-amber' : micActive ? 'led led-green' : 'led led-off'} />
          <div className="locker-nameplate rounded-[2px] border border-amber-800/15 px-3 py-1" style={{
            background: 'linear-gradient(135deg, rgba(180,140,80,0.08) 0%, rgba(120,90,50,0.04) 100%)',
          }}>
            <span className="text-[8px] font-bold uppercase tracking-[0.18em]" style={{ color: 'rgba(210,170,100,0.7)', textShadow: '0 1px 0 rgba(0,0,0,0.5)' }}>Mic Locker</span>
          </div>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, rgba(140,100,55,0.15), transparent)' }} />
          <span className="text-[9px] tabular-nums text-stone-600">
            {groups.reduce((s, g) => s + g.mics.length, 0)} mics
          </span>
        </div>

        {/* ── Drawer grid: cabinet face ── */}
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {groups.map(group => {
            const hue = lockerHueFromTone(group.tone);
            const isOpen = openDrawer === group.label;
            const hasSelected = group.mics.some(m => m.id === selectedMic?.id);

            return (
              <div key={group.label} className={isOpen ? 'col-span-full' : ''}>
                {/* Drawer face (closed state) */}
                <button
                  type="button"
                  onClick={() => toggleDrawer(group.label)}
                  className={`group/drawer locker-drawer relative flex w-full items-center gap-2 rounded-[2px] border text-left transition-all duration-250 ${
                    isOpen
                      ? 'border-stone-600/30 locker-drawer-open px-2 py-1.5'
                      : hasSelected
                        ? 'border-stone-600/25 locker-drawer-active px-2 py-1.5'
                        : 'border-stone-800/20 px-2 py-1.5 hover:border-stone-700/30'
                  }`}
                  style={{ '--drawer-accent': hue.accent } as React.CSSProperties}
                >
                  <span className={`flex h-4 w-4 shrink-0 items-center justify-center transition-opacity duration-200 ${isOpen ? 'opacity-45' : 'opacity-65 group-hover/drawer:opacity-90'}`}>
                    <GearSilhouette form={micFormFor(group.mics[0].type)} accent={hue.accent} className="h-full w-full" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[9px] font-semibold uppercase tracking-[0.08em] leading-tight" style={{ color: 'var(--sa-cream-dim)' }}>
                      {group.label}
                    </span>
                    <span className="block text-[7px] text-stone-500">tap to open</span>
                  </span>

                  <span className="flex items-center gap-1.5 shrink-0">
                    <span className={`rounded-full border border-stone-700/25 px-1.5 py-0.5 text-[8px] tabular-nums ${hue.badge}`}>
                      {group.mics.length}
                    </span>
                    <DrawerHandle accent={hue.accent} />
                  </span>

                  {hasSelected && !isOpen && (
                    <span className="absolute right-1 top-1 led led-green" />
                  )}
                </button>

                {/* Drawer interior (slides open below/replaces the face) */}
                <SlidingDrawer open={isOpen}>
                  <div className="locker-drawer-interior rounded-[3px] border border-stone-800/20 px-2 pb-2 pt-1.5">
                    {/* Interior shelf label */}
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.1em]" style={{ color: hue.accent }}>
                        {group.label}
                      </span>
                      <span className="text-[9px] text-stone-600">{group.mics.length} {group.mics.length === 1 ? 'mic' : 'mics'}</span>
                    </div>

                    {/* Mics on felt-lined shelf */}
                    <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {group.mics.map(mic => (
                        <MicSlot
                          key={mic.id}
                          mic={mic}
                          hue={hue}
                          selected={selectedMic?.id === mic.id}
                          onSelect={() => onSelectMic(mic)}
                          onInspect={() => onInspect(mic.id)}
                        />
                      ))}
                    </div>
                  </div>
                </SlidingDrawer>
              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}

// ── Individual mic slot — like a mic resting in a foam cutout ──

function MicSlot({
  mic,
  hue,
  selected,
  onSelect,
  onInspect,
}: {
  mic: Microphone;
  hue: LockerHue;
  selected: boolean;
  onSelect: () => void;
  onInspect: () => void;
}) {
  const form = micFormFor(mic.type);
  const { src } = gearImage(mic.id, 'microphone', mic.type);

  return (
    <div
      className={`locker-mic-slot group/mic relative flex flex-col items-center rounded-[3px] border px-1.5 pb-1.5 pt-2 transition-all duration-250 ${
        selected
          ? `border-stone-500/40 ${hue.glow} locker-mic-slot-active`
          : 'border-stone-800/20 hover:border-stone-700/25'
      }`}
      {...(selected ? { 'data-selected-point': 'row-mics-top-1' } : {})}
    >
      {/* Mic on foam cradle */}
      <button
        type="button"
        onClick={onSelect}
        className="relative mb-1 flex h-10 w-7 cursor-pointer items-center justify-center transition-all duration-200"
        aria-label={`Select ${mic.name}`}
      >
        {/* Foam recess behind mic */}
        <div className="absolute inset-1 rounded-[4px]" style={{
          background: 'radial-gradient(ellipse at 50% 60%, rgba(30,25,18,0.8) 0%, rgba(20,18,14,0.4) 70%, transparent 100%)',
        }} />
        <span className={`relative z-[1] flex h-full w-full items-center justify-center transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-60 group-hover/mic:opacity-85'}`}>
          {src
            ? <img src={src} alt="" className="h-full w-auto object-contain drop-shadow-sm" />
            : <GearSilhouette form={form} accent={hue.accent} className="h-full w-full" />
          }
        </span>
      </button>

      {/* Mic name */}
      <span className="mb-0.5 block w-full truncate text-center text-[8px] font-medium leading-tight" style={{ color: selected ? 'var(--sa-cream)' : 'var(--sa-cream-dim)' }}>
        {mic.name}
      </span>

      {/* Type + qty */}
      <div className="flex items-center justify-center gap-1 text-[8px] text-stone-500">
        <span>{MIC_TYPE_SHORT[mic.type]}</span>
        {mic.qty > 1 && <span className="text-stone-600">{mic.qty}×</span>}
      </div>

      {/* Pattern + phantom */}
      <div className="mt-0.5 flex items-center justify-center gap-1 text-[7px] text-stone-600">
        <span>{mic.patterns.join('/')}</span>
        {mic.phantom && <span className="text-amber-600/50">48V</span>}
      </div>

      {/* Action buttons */}
      <div className="mt-1.5 flex w-full gap-1">
        <button type="button" onClick={onInspect}
          className="flex-1 rounded-[2px] border border-stone-800/25 py-0.5 text-[8px] text-stone-500 transition-colors hover:border-stone-600/30 hover:text-stone-400">
          Info
        </button>
        <button type="button" onClick={onSelect}
          className={`flex-1 rounded-[2px] border py-0.5 text-[8px] font-medium transition-colors ${
            selected
              ? 'border-emerald-700/35 text-emerald-400/75'
              : 'border-amber-800/25 text-amber-500/60 hover:border-amber-600/35 hover:text-amber-400/75'
          }`}>
          {selected ? '✓' : 'Use'}
        </button>
      </div>

      {/* Selected indicator */}
      {selected && <span className="absolute right-1 top-1 led led-green" />}
    </div>
  );
}
