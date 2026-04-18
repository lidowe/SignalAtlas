import type { ReactElement } from 'react';
import type { MicType } from '../types/studio';

// ── Form-factor keys ──

export type MicForm = 'side-address' | 'pencil' | 'handheld' | 'ribbon' | 'boundary' | 'measurement' | 'subkick' | 'recorder';
export type RackForm = 'preamp' | 'compressor' | 'equalizer' | 'outboard';
export type GearForm = MicForm | RackForm;

const MIC_TYPE_FORM: Record<MicType, MicForm> = {
  'Tube LDC': 'side-address',
  'FET LDC': 'side-address',
  'FET MDC': 'side-address',
  'FET SDC': 'pencil',
  Ribbon: 'ribbon',
  Dynamic: 'handheld',
  Boundary: 'boundary',
  Measurement: 'measurement',
  Subkick: 'subkick',
  'Field Recorder': 'recorder',
};

export function micFormFor(type: MicType): MicForm {
  return MIC_TYPE_FORM[type];
}

// ── SVG silhouettes ──

const SILHOUETTES: Record<GearForm, (accent: string) => ReactElement> = {
  /* ── Microphones ── */
  'side-address': (a) => (
    <svg viewBox="0 0 32 48" fill="none" className="h-full w-full">
      <ellipse cx="16" cy="16" rx="9" ry="12" fill={a} fillOpacity={0.12} stroke={a} strokeOpacity={0.3} strokeWidth={0.8} />
      <line x1="16" y1="28" x2="16" y2="44" stroke={a} strokeOpacity={0.25} strokeWidth={1.5} />
      <circle cx="16" cy="46" r="2" fill={a} fillOpacity={0.15} />
    </svg>
  ),
  pencil: (a) => (
    <svg viewBox="0 0 32 48" fill="none" className="h-full w-full">
      <rect x="13" y="4" width="6" height="28" rx="3" fill={a} fillOpacity={0.12} stroke={a} strokeOpacity={0.3} strokeWidth={0.8} />
      <line x1="16" y1="32" x2="16" y2="44" stroke={a} strokeOpacity={0.25} strokeWidth={1.5} />
      <circle cx="16" cy="46" r="2" fill={a} fillOpacity={0.15} />
    </svg>
  ),
  handheld: (a) => (
    <svg viewBox="0 0 32 48" fill="none" className="h-full w-full">
      <rect x="11" y="4" width="10" height="14" rx="5" fill={a} fillOpacity={0.12} stroke={a} strokeOpacity={0.3} strokeWidth={0.8} />
      <rect x="13" y="18" width="6" height="22" rx="2" fill={a} fillOpacity={0.08} stroke={a} strokeOpacity={0.2} strokeWidth={0.8} />
      <circle cx="16" cy="46" r="2" fill={a} fillOpacity={0.15} />
    </svg>
  ),
  ribbon: (a) => (
    <svg viewBox="0 0 32 48" fill="none" className="h-full w-full">
      <rect x="10" y="6" width="12" height="22" rx="2" fill={a} fillOpacity={0.12} stroke={a} strokeOpacity={0.3} strokeWidth={0.8} />
      <line x1="16" y1="10" x2="16" y2="24" stroke={a} strokeOpacity={0.2} strokeWidth={0.5} />
      <line x1="16" y1="28" x2="16" y2="44" stroke={a} strokeOpacity={0.25} strokeWidth={1.5} />
      <circle cx="16" cy="46" r="2" fill={a} fillOpacity={0.15} />
    </svg>
  ),
  boundary: (a) => (
    <svg viewBox="0 0 32 48" fill="none" className="h-full w-full">
      <rect x="6" y="22" width="20" height="6" rx="2" fill={a} fillOpacity={0.12} stroke={a} strokeOpacity={0.3} strokeWidth={0.8} />
      <ellipse cx="16" cy="22" rx="4" ry="3" fill={a} fillOpacity={0.1} stroke={a} strokeOpacity={0.25} strokeWidth={0.6} />
      <line x1="26" y1="28" x2="28" y2="44" stroke={a} strokeOpacity={0.2} strokeWidth={1} />
    </svg>
  ),
  measurement: (a) => (
    <svg viewBox="0 0 32 48" fill="none" className="h-full w-full">
      <rect x="14" y="4" width="4" height="24" rx="2" fill={a} fillOpacity={0.12} stroke={a} strokeOpacity={0.3} strokeWidth={0.8} />
      <circle cx="16" cy="4" r="2.5" fill={a} fillOpacity={0.15} stroke={a} strokeOpacity={0.25} strokeWidth={0.6} />
      <line x1="16" y1="28" x2="16" y2="44" stroke={a} strokeOpacity={0.25} strokeWidth={1.5} />
      <circle cx="16" cy="46" r="2" fill={a} fillOpacity={0.15} />
    </svg>
  ),
  subkick: (a) => (
    <svg viewBox="0 0 32 48" fill="none" className="h-full w-full">
      <circle cx="16" cy="20" r="12" fill={a} fillOpacity={0.1} stroke={a} strokeOpacity={0.3} strokeWidth={0.8} />
      <circle cx="16" cy="20" r="5" fill={a} fillOpacity={0.08} stroke={a} strokeOpacity={0.2} strokeWidth={0.6} />
      <line x1="16" y1="32" x2="16" y2="44" stroke={a} strokeOpacity={0.25} strokeWidth={1.5} />
    </svg>
  ),
  recorder: (a) => (
    <svg viewBox="0 0 32 48" fill="none" className="h-full w-full">
      <rect x="8" y="8" width="16" height="28" rx="3" fill={a} fillOpacity={0.1} stroke={a} strokeOpacity={0.3} strokeWidth={0.8} />
      <rect x="11" y="11" width="10" height="6" rx="1" fill={a} fillOpacity={0.08} stroke={a} strokeOpacity={0.15} strokeWidth={0.5} />
      <circle cx="13" cy="28" r="1.5" fill={a} fillOpacity={0.2} />
      <circle cx="19" cy="28" r="1.5" fill={a} fillOpacity={0.2} />
    </svg>
  ),

  /* ── Rack gear ── */
  preamp: (a) => (
    <svg viewBox="0 0 64 20" fill="none" className="h-full w-full">
      {/* 1U rack panel */}
      <rect x="1" y="2" width="62" height="16" rx="1.5" fill={a} fillOpacity={0.08} stroke={a} strokeOpacity={0.25} strokeWidth={0.7} />
      {/* Rack ears */}
      <rect x="2" y="4" width="2" height="3" rx="0.5" fill={a} fillOpacity={0.15} />
      <rect x="2" y="13" width="2" height="3" rx="0.5" fill={a} fillOpacity={0.15} />
      <rect x="60" y="4" width="2" height="3" rx="0.5" fill={a} fillOpacity={0.15} />
      <rect x="60" y="13" width="2" height="3" rx="0.5" fill={a} fillOpacity={0.15} />
      {/* Gain knob */}
      <circle cx="20" cy="10" r="4" fill={a} fillOpacity={0.1} stroke={a} strokeOpacity={0.2} strokeWidth={0.6} />
      <line x1="20" y1="7" x2="20" y2="10" stroke={a} strokeOpacity={0.3} strokeWidth={0.5} />
      {/* Pad/phase switches */}
      <rect x="32" y="8" width="4" height="4" rx="0.5" fill={a} fillOpacity={0.12} stroke={a} strokeOpacity={0.2} strokeWidth={0.4} />
      <rect x="38" y="8" width="4" height="4" rx="0.5" fill={a} fillOpacity={0.12} stroke={a} strokeOpacity={0.2} strokeWidth={0.4} />
      {/* VU meter */}
      <rect x="48" y="5" width="8" height="5" rx="1" fill={a} fillOpacity={0.06} stroke={a} strokeOpacity={0.18} strokeWidth={0.4} />
    </svg>
  ),
  compressor: (a) => (
    <svg viewBox="0 0 64 20" fill="none" className="h-full w-full">
      <rect x="1" y="2" width="62" height="16" rx="1.5" fill={a} fillOpacity={0.08} stroke={a} strokeOpacity={0.25} strokeWidth={0.7} />
      {/* Rack screws */}
      <circle cx="4" cy="6" r="1" fill={a} fillOpacity={0.2} />
      <circle cx="4" cy="14" r="1" fill={a} fillOpacity={0.2} />
      <circle cx="60" cy="6" r="1" fill={a} fillOpacity={0.2} />
      <circle cx="60" cy="14" r="1" fill={a} fillOpacity={0.2} />
      {/* VU meter */}
      <rect x="22" y="3.5" width="20" height="7" rx="1.5" fill={a} fillOpacity={0.06} stroke={a} strokeOpacity={0.2} strokeWidth={0.5} />
      <path d="M 27 9 Q 32 3 37 9" stroke={a} strokeOpacity={0.15} strokeWidth={0.4} fill="none" />
      {/* Threshold / Ratio / Attack / Release knobs */}
      <circle cx="12" cy="14" r="2.5" fill={a} fillOpacity={0.1} stroke={a} strokeOpacity={0.2} strokeWidth={0.4} />
      <circle cx="22" cy="14" r="2.5" fill={a} fillOpacity={0.1} stroke={a} strokeOpacity={0.2} strokeWidth={0.4} />
      <circle cx="42" cy="14" r="2.5" fill={a} fillOpacity={0.1} stroke={a} strokeOpacity={0.2} strokeWidth={0.4} />
      <circle cx="52" cy="14" r="2.5" fill={a} fillOpacity={0.1} stroke={a} strokeOpacity={0.2} strokeWidth={0.4} />
    </svg>
  ),
  equalizer: (a) => (
    <svg viewBox="0 0 64 20" fill="none" className="h-full w-full">
      <rect x="1" y="2" width="62" height="16" rx="1.5" fill={a} fillOpacity={0.08} stroke={a} strokeOpacity={0.25} strokeWidth={0.7} />
      {/* Rack ears */}
      <circle cx="4" cy="6" r="1" fill={a} fillOpacity={0.2} />
      <circle cx="4" cy="14" r="1" fill={a} fillOpacity={0.2} />
      <circle cx="60" cy="6" r="1" fill={a} fillOpacity={0.2} />
      <circle cx="60" cy="14" r="1" fill={a} fillOpacity={0.2} />
      {/* Band knobs row */}
      <circle cx="14" cy="8" r="2.5" fill={a} fillOpacity={0.1} stroke={a} strokeOpacity={0.2} strokeWidth={0.4} />
      <circle cx="24" cy="8" r="2.5" fill={a} fillOpacity={0.1} stroke={a} strokeOpacity={0.2} strokeWidth={0.4} />
      <circle cx="34" cy="8" r="2.5" fill={a} fillOpacity={0.1} stroke={a} strokeOpacity={0.2} strokeWidth={0.4} />
      <circle cx="44" cy="8" r="2.5" fill={a} fillOpacity={0.1} stroke={a} strokeOpacity={0.2} strokeWidth={0.4} />
      {/* Freq select row */}
      <rect x="12" y="13" width="5" height="3" rx="0.5" fill={a} fillOpacity={0.08} stroke={a} strokeOpacity={0.15} strokeWidth={0.3} />
      <rect x="22" y="13" width="5" height="3" rx="0.5" fill={a} fillOpacity={0.08} stroke={a} strokeOpacity={0.15} strokeWidth={0.3} />
      <rect x="32" y="13" width="5" height="3" rx="0.5" fill={a} fillOpacity={0.08} stroke={a} strokeOpacity={0.15} strokeWidth={0.3} />
      <rect x="42" y="13" width="5" height="3" rx="0.5" fill={a} fillOpacity={0.08} stroke={a} strokeOpacity={0.15} strokeWidth={0.3} />
      {/* Output knob */}
      <circle cx="54" cy="10" r="3" fill={a} fillOpacity={0.1} stroke={a} strokeOpacity={0.2} strokeWidth={0.4} />
    </svg>
  ),
  outboard: (a) => (
    <svg viewBox="0 0 64 20" fill="none" className="h-full w-full">
      <rect x="1" y="2" width="62" height="16" rx="1.5" fill={a} fillOpacity={0.08} stroke={a} strokeOpacity={0.25} strokeWidth={0.7} />
      {/* Rack screws */}
      <circle cx="4" cy="6" r="1" fill={a} fillOpacity={0.2} />
      <circle cx="4" cy="14" r="1" fill={a} fillOpacity={0.2} />
      <circle cx="60" cy="6" r="1" fill={a} fillOpacity={0.2} />
      <circle cx="60" cy="14" r="1" fill={a} fillOpacity={0.2} />
      {/* Mix / param knobs */}
      <circle cx="18" cy="10" r="3.5" fill={a} fillOpacity={0.1} stroke={a} strokeOpacity={0.2} strokeWidth={0.5} />
      <line x1="18" y1="7.5" x2="18" y2="10" stroke={a} strokeOpacity={0.25} strokeWidth={0.4} />
      <circle cx="34" cy="10" r="3.5" fill={a} fillOpacity={0.1} stroke={a} strokeOpacity={0.2} strokeWidth={0.5} />
      <line x1="34" y1="7.5" x2="34" y2="10" stroke={a} strokeOpacity={0.25} strokeWidth={0.4} />
      {/* LED indicators */}
      <circle cx="48" cy="8" r="1" fill={a} fillOpacity={0.3} />
      <circle cx="52" cy="8" r="1" fill={a} fillOpacity={0.2} />
      {/* Toggle */}
      <rect x="47" y="12" width="7" height="3" rx="1" fill={a} fillOpacity={0.1} stroke={a} strokeOpacity={0.18} strokeWidth={0.4} />
    </svg>
  ),
};

// ── Public component ──

interface GearSilhouetteProps {
  form: GearForm;
  accent?: string;
  className?: string;
}

export default function GearSilhouette({ form, accent = '#a0a0a0', className = '' }: GearSilhouetteProps) {
  const render = SILHOUETTES[form];
  if (!render) return null;
  return <div className={className}>{render(accent)}</div>;
}
