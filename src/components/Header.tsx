import type { Perspective, StudioMode } from '../types/studio';
import type { DemoState } from '../hooks/useDemoWalkthrough';

interface Props {
  perspective: Perspective;
  mode: StudioMode;
  searchQuery: string;
  onSearch: (q: string) => void;
  onPerspective: (p: Perspective) => void;
  onMode: (m: StudioMode) => void;
  demoState: DemoState;
  demoNarration: string;
  onStartDemo: () => void;
  onCancelDemo: () => void;
}

const perspectives: { key: Perspective; label: string }[] = [
  { key: 'engineer', label: 'Engineer' },
  { key: 'musician', label: 'Musician' },
  { key: 'technical', label: 'Technical' },
];

const headerTheme: Record<Perspective, { bar: string; active: string; chip: string }> = {
  musician: {
    bar: 'border-emerald-700/45 bg-emerald-950/18',
    active: 'border border-emerald-500/35 bg-emerald-500/18 text-emerald-100',
    chip: 'text-emerald-200/85',
  },
  engineer: {
    bar: 'border-red-700/45 bg-red-950/18',
    active: 'border border-red-500/35 bg-red-500/18 text-red-100',
    chip: 'text-red-200/85',
  },
  technical: {
    bar: 'border-yellow-700/45 bg-yellow-950/18',
    active: 'border border-yellow-400/35 bg-yellow-400/18 text-yellow-100',
    chip: 'text-yellow-100/85',
  },
};

export default function Header({ perspective, mode, searchQuery, onSearch, onPerspective, onMode, demoState, demoNarration, onStartDemo, onCancelDemo }: Props) {
  const theme = headerTheme[perspective];

  return (
    <header className={`mat-brushed-dark mat-rack-panel border-b px-4 py-4 transition-colors duration-500 ${theme.bar}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <div className="text-silkscreen-faint text-[8px]">Virtual Patchbay</div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--sa-cream)' }}>Signal Atlas</h1>
          <p className="max-w-2xl text-xs leading-relaxed" style={{ color: 'var(--sa-cream-dim)' }}>
            Move through the room the way the signal does: default normals stay visible, departures stay legible, and every routing choice reveals its consequence before commit.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <label className={`flex items-center gap-2 mat-recess rounded-[3px] border px-3 py-1.5 transition-colors duration-500 ${theme.bar}`}>
            <span className="text-silkscreen-faint text-[8px]">Jump</span>
            <input
              value={searchQuery}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="gear, role, topology"
              className="w-40 bg-transparent text-xs outline-none placeholder:text-zinc-600 sm:w-48"
              style={{ color: 'var(--sa-cream-dim)' }}
            />
          </label>
          <div className={`flex items-center gap-2 mat-recess rounded-[3px] border px-2 py-1 transition-colors duration-500 ${theme.bar}`}>
            <span className="text-silkscreen-faint text-[8px]">Mode</span>
            {(['tracking', 'mixing'] as StudioMode[]).map(m => (
              <button
                key={m}
                onClick={() => onMode(m)}
                className={`rounded-[3px] px-3 py-1 text-xs font-medium transition ${
                  mode === m
                    ? 'border border-zinc-400/20 bg-zinc-400/10 text-zinc-100'
                    : 'border border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          <div className={`flex items-center gap-2 mat-recess rounded-[3px] border px-2 py-1 transition-colors duration-500 ${theme.bar}`}>
            <span className="text-silkscreen-faint text-[8px]">Perspective</span>
            {perspectives.map(p => (
              <button
                key={p.key}
                onClick={() => onPerspective(p.key)}
                className={`rounded-[3px] px-3 py-1 text-xs font-medium transition ${
                  perspective === p.key
                    ? theme.active
                    : 'border border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className={`text-silkscreen text-[8px] ${theme.chip}`}>{perspective} lens</div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={demoState === 'running' ? onCancelDemo : onStartDemo}
              className={`mat-recess rounded-[3px] border px-3 py-1 text-xs font-medium transition ${
                demoState === 'running'
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-200 animate-pulse'
                  : 'border-zinc-600/20 text-zinc-400 hover:border-zinc-500/30 hover:text-zinc-200'
              }`}
            >
              {demoState === 'running'
                ? 'Stop Demo'
                : mode === 'mixing'
                  ? 'Mixing Demo'
                  : 'Tracking Demo'}
            </button>
          </div>
        </div>
      </div>

      {demoState === 'running' && demoNarration && (
        <div className="mt-3 mat-recess rounded-[3px] border border-amber-800/20 px-3 py-2">
          <p className="text-xs leading-relaxed text-amber-200/90 animate-fade-in">{demoNarration}</p>
        </div>
      )}
    </header>
  );
}
