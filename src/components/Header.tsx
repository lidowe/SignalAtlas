import type { Perspective } from '../types/studio';

interface Props {
  perspective: Perspective;
  onPerspective: (p: Perspective) => void;
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

export default function Header({ perspective, onPerspective }: Props) {
  const theme = headerTheme[perspective];

  return (
    <header className={`border-b px-4 py-4 backdrop-blur transition-colors duration-500 ${theme.bar}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Signal Flow Reference</div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">Signal Atlas</h1>
          <p className="max-w-2xl text-xs leading-relaxed text-zinc-500">
            Learn how a studio path behaves, why a circuit choice changes the result, and what each routing decision commits to the sound before it reaches the recorder.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
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
        </div>
      </div>
    </header>
  );
}
