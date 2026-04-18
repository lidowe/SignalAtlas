import { useEffect, useRef, useState } from 'react';
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
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  return (
    <header className={`mat-brushed-dark mat-rack-panel border-b px-4 py-3 transition-colors duration-500 ${theme.bar}`}>
      <div className="flex flex-col items-center gap-2.5 text-center">
        <div className="space-y-1 text-center">
          <h1 className="text-base font-semibold tracking-tight" style={{ color: 'var(--sa-cream)' }}>Signal Atlas</h1>
          <p className="max-w-3xl text-[10px] leading-relaxed lowercase" style={{ color: 'var(--sa-cream-dim)' }}>
            experience your signal as you travel with it starting with the mic locker and preamp selection
          </p>
        </div>

        <div className="flex w-full items-center gap-1 overflow-x-auto pb-0.5 sm:justify-center">
          <div className={`flex items-center gap-1 mat-recess rounded-[3px] border px-1.5 py-1 transition-colors duration-500 ${theme.bar}`}>
            <button
              type="button"
              onClick={() => setSearchOpen((value) => !value)}
              className="flex items-center gap-1 rounded-[2px] px-1 py-0.5 text-[10px] font-medium text-zinc-200"
            >
              <span aria-hidden="true">⌕</span>
              <span>Jump</span>
            </button>
            {searchOpen && (
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={(event) => onSearch(event.target.value)}
                placeholder="search"
                className="w-24 bg-transparent text-[10px] outline-none placeholder:text-zinc-600 sm:w-32"
                style={{ color: 'var(--sa-cream-dim)' }}
              />
            )}
          </div>

          <div className={`flex items-center gap-0.5 mat-recess rounded-[3px] border px-1 py-0.5 transition-colors duration-500 ${theme.bar}`}>
            {(['tracking', 'mixing'] as StudioMode[]).map(m => (
              <button
                key={m}
                onClick={() => onMode(m)}
                className={`rounded-[2px] px-1.5 py-0.5 text-[9px] font-medium transition ${
                  mode === m
                    ? 'border border-zinc-400/20 bg-zinc-400/10 text-zinc-100'
                    : 'border border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {m === 'tracking' ? 'Track' : 'Mix'}
              </button>
            ))}
          </div>

          <div className={`flex items-center gap-0.5 mat-recess rounded-[3px] border px-1 py-0.5 transition-colors duration-500 ${theme.bar}`}>
            {perspectives.map(p => (
              <button
                key={p.key}
                onClick={() => onPerspective(p.key)}
                className={`rounded-[2px] px-1.5 py-0.5 text-[9px] font-medium transition ${
                  perspective === p.key
                    ? theme.active
                    : 'border border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {p.key === 'engineer' ? 'Eng' : p.key === 'musician' ? 'Mus' : 'Tech'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={demoState === 'running' ? onCancelDemo : onStartDemo}
            className={`ml-auto mat-recess rounded-[3px] border px-2 py-0.5 text-[9px] font-medium transition sm:ml-0 ${
              demoState === 'running'
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-200 animate-pulse'
                : 'border-zinc-600/20 text-zinc-400 hover:border-zinc-500/30 hover:text-zinc-200'
            }`}
          >
            {demoState === 'running' ? 'Stop' : 'Demo'}
          </button>
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
