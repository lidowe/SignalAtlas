import type { SonicSignature } from '../types/studio';

interface Props {
  signature: SonicSignature;
}

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1 w-16 rounded-full bg-zinc-800">
        <div
          className={`h-1 rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function SonicSignatureStrip({ signature }: Props) {
  const hasStages = signature.stages.length > 0;

  return (
    <div className="border-t border-zinc-800/60 bg-zinc-950/80 px-3 py-2 sm:px-4 backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
        <div className="shrink-0 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          Sonic Signature
        </div>

        <div className="min-w-0 flex-1">
          <p className={`text-xs leading-relaxed transition-all duration-500 ${hasStages ? 'text-zinc-300' : 'text-zinc-600'} sm:truncate`}>
            {signature.summary}
          </p>
        </div>

        {/* Tonal axes — only shown when there's a chain */}
        {hasStages && (
          <div className="hidden items-center gap-4 text-[10px] tracking-wide text-zinc-500 sm:flex">
            <span className="flex items-center gap-1">
              Warmth <Bar value={signature.warmth} color="bg-amber-500/80" />
            </span>
            <span className="flex items-center gap-1">
              Clarity <Bar value={signature.clarity} color="bg-sky-400/80" />
            </span>
            <span className="flex items-center gap-1">
              Color <Bar value={signature.color} color="bg-purple-400/80" />
            </span>
            <span className="flex items-center gap-1">
              Weight <Bar value={signature.weight} color="bg-emerald-500/80" />
            </span>
          </div>
        )}

        {/* Stage count chip */}
        {hasStages && (
          <div className="shrink-0 self-start rounded-md border border-zinc-700/50 bg-zinc-900/60 px-2 py-0.5 text-[10px] text-zinc-400 sm:self-auto">
            {signature.stages.length} {signature.stages.length === 1 ? 'stage' : 'stages'}
          </div>
        )}
      </div>

      {/* Stage-by-stage evolution — collapsed by default, could be expandable later */}
      {signature.stages.length > 1 && (
        <div className="mt-1.5 hidden items-center gap-2 overflow-x-auto text-[10px] text-zinc-600 sm:flex">
          {signature.stages.map((stage, i) => (
            <span key={i} className="flex shrink-0 items-center gap-1">
              {i > 0 && <span className="text-zinc-700">→</span>}
              <span className="text-zinc-500">{stage.name}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
