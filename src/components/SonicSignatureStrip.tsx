import { useState } from 'react';
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
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mat-brushed-dark rounded-[3px] border border-zinc-800/20">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-left"
      >
        <span className="text-silkscreen-faint text-[8px]">Route profile</span>
        <span className="min-w-0 flex-1 truncate text-[10px] text-zinc-500">
          {signature.summary}
        </span>
        {hasStages && (
          <span className="mat-recess rounded-[2px] border border-zinc-700/20 px-1.5 py-0.5 text-silkscreen-faint text-[8px]">
            {signature.stages.length}
          </span>
        )}
      </button>

      {expanded && (
        <div className="border-t border-zinc-800/20 px-3 py-2">
          {hasStages && (
            <div className="flex flex-wrap gap-3 text-[9px] tracking-wide text-zinc-500">
              <span className="flex items-center gap-1">
                Harmonic load <Bar value={signature.warmth} color="bg-amber-500/60" />
              </span>
              <span className="flex items-center gap-1">
                Spectral clarity <Bar value={signature.clarity} color="bg-sky-400/60" />
              </span>
              <span className="flex items-center gap-1">
                Coloration <Bar value={signature.color} color="bg-purple-400/60" />
              </span>
              <span className="flex items-center gap-1">
                Low-mid mass <Bar value={signature.weight} color="bg-emerald-500/60" />
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
