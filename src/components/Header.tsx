import type { Perspective, StudioMode } from '../types/studio';
import type { DemoState } from '../hooks/useDemoWalkthrough';

interface Props {
  perspective: Perspective;
  mode: StudioMode;
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
    bar: 'border-emerald-900/60 bg-emerald-950/18',
    active: 'border border-emerald-500/30 bg-emerald-500/14 text-emerald-100',
    chip: 'text-emerald-200',
  },
  engineer: {
    bar: 'border-red-900/60 bg-red-950/18',
    active: 'border border-red-500/30 bg-red-500/14 text-red-100',
    chip: 'text-red-200',
  },
  technical: {
    bar: 'border-yellow-900/60 bg-yellow-950/18',
    active: 'border border-yellow-400/30 bg-yellow-400/14 text-yellow-100',
    chip: 'text-yellow-100',
  },
};

export default function Header({ perspective, mode, onPerspective, onMode, demoState, demoNarration, onStartDemo, onCancelDemo }: Props) {
  const theme = headerTheme[perspective];

  return (
    <header className={`border-b px-4 py-4 backdrop-blur transition-colors duration-500 ${theme.bar}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Virtual Patchbay</div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">Signal Atlas</h1>
          <p className="max-w-2xl text-xs leading-relaxed text-zinc-500">
            Move through the room the way the signal does: default normals stay visible, departures stay legible, and every routing choice reveals its consequence before commit.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <div className={`flex items-center gap-2 rounded-full border px-2 py-1 transition-colors duration-500 ${theme.bar}`}>
            <span className="text-[10px] uppercase tracking-wide text-zinc-500">Mode</span>
            {(['tracking', 'mixing'] as StudioMode[]).map(m => (
              <button
                key={m}
                onClick={() => onMode(m)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  mode === m
                    ? 'border border-zinc-400/30 bg-zinc-400/14 text-zinc-100'
                    : 'border border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          <div className={`flex items-center gap-2 rounded-full border px-2 py-1 transition-colors duration-500 ${theme.bar}`}>
            <span className="text-[10px] uppercase tracking-wide text-zinc-500">Perspective</span>
            {perspectives.map(p => (
              <button
                key={p.key}
                onClick={() => onPerspective(p.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  perspective === p.key
                    ? theme.active
                    : 'border border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className={`text-[10px] uppercase tracking-[0.18em] ${theme.chip}`}>{perspective} lens</div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={demoState === 'running' ? onCancelDemo : onStartDemo}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                demoState === 'running'
                  ? 'border-amber-500/40 bg-amber-500/14 text-amber-200 animate-pulse'
                  : 'border-zinc-600/40 bg-zinc-800/40 text-zinc-400 hover:border-zinc-500/50 hover:text-zinc-200'
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
        <div className="mt-3 rounded-lg border border-amber-800/30 bg-amber-950/20 px-3 py-2">
          <p className="text-xs leading-relaxed text-amber-200/90 animate-fade-in">{demoNarration}</p>
        </div>
      )}
    </header>
  );
}
