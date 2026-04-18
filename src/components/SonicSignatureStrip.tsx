import type { SonicSignature } from '../types/studio';

interface Props {
  signature: SonicSignature;
}

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1 w-16 rounded-[2px] bg-zinc-800/40">
        <div
          className={`h-1 rounded-[2px] transition-all duration-700 ease-out ${color}`}
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function SonicSignatureStrip({ signature }: Props) {
  const hasStages = signature.stages.length > 0;

  return (
    <div className="mat-brushed-dark border-t border-zinc-800/20 px-3 py-2 sm:px-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
        <div className="shrink-0 text-silkscreen-faint text-[8px]">
          Sonic Signature
        </div>

        <div className="min-w-0 flex-1">
          <p className={`text-xs leading-relaxed transition-all duration-500 sm:truncate`} style={{ color: hasStages ? 'var(--sa-cream-dim)' : undefined, opacity: hasStages ? 1 : 0.4 }}>
            {signature.summary}
          </p>
        </div>

        {/* Tonal axes — only shown when there's a chain */}
        {hasStages && (
          <div className="hidden items-center gap-4 text-[9px] tracking-wide text-zinc-500 sm:flex">
            <span className="flex items-center gap-1">
              Warmth <Bar value={signature.warmth} color="bg-amber-500/60" />
            </span>
            <span className="flex items-center gap-1">
              Clarity <Bar value={signature.clarity} color="bg-sky-400/60" />
            </span>
            <span className="flex items-center gap-1">
              Color <Bar value={signature.color} color="bg-purple-400/60" />
            </span>
            <span className="flex items-center gap-1">
              Weight <Bar value={signature.weight} color="bg-emerald-500/60" />
            </span>
          </div>
        )}

        {/* Stage count chip */}
        {hasStages && (
          <div className="shrink-0 self-start mat-recess rounded-[2px] border border-zinc-700/20 px-2 py-0.5 text-silkscreen-faint text-[8px] sm:self-auto">
            {signature.stages.length} {signature.stages.length === 1 ? 'stage' : 'stages'}
          </div>
        )}
      </div>

      {/* Stage-by-stage evolution — collapsed by default, could be expandable later */}
      {signature.stages.length > 1 && (
        <div className="mt-1.5 hidden items-center gap-2 overflow-x-auto text-[9px] text-zinc-600 sm:flex">
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
