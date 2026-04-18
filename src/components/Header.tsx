import { useEffect, useRef, useState } from 'react';
import type { Perspective, StudioMode } from '../types/studio';

interface Props {
  perspective: Perspective;
  mode: StudioMode;
  searchQuery: string;
  onSearch: (q: string) => void;
  onPerspective: (p: Perspective) => void;
  onMode: (m: StudioMode) => void;
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

export default function Header({ perspective, mode, searchQuery, onSearch, onPerspective, onMode }: Props) {
  const theme = headerTheme[perspective];
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  return (
    <header className={`mat-brushed-dark mat-rack-panel border-b px-2.5 py-2 transition-colors duration-500 sm:px-4 sm:py-3 ${theme.bar}`}>
      <div className="flex flex-col gap-2 text-center sm:gap-2.5">
        <div className="space-y-1 text-center">
          <h1 className="text-sm font-semibold tracking-tight sm:text-base" style={{ color: 'var(--sa-cream)' }}>Signal Atlas</h1>
          <p className="mx-auto max-w-3xl text-[9px] leading-relaxed sm:text-[10px]" style={{ color: 'var(--sa-cream-dim)' }}>
            trace the studio path, inspect the signal chain, and understand the full route before you commit it
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center justify-center gap-1.5">
          <div className={`flex min-w-0 flex-1 items-center gap-1 mat-recess rounded-[3px] border px-1.5 py-1 transition-colors duration-500 sm:max-w-[13rem] sm:flex-none ${theme.bar}`}>
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
                className="min-w-0 flex-1 bg-transparent text-[10px] outline-none placeholder:text-zinc-600 sm:w-32 sm:flex-none"
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

          <div className={`flex flex-wrap items-center justify-center gap-0.5 mat-recess rounded-[3px] border px-1 py-0.5 transition-colors duration-500 ${theme.bar}`}>
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
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
