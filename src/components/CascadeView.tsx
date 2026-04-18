import { useState } from 'react';
import type { Perspective, StudioMode, SummingNode, MonitorSpeaker } from '../types/studio';
import { cascadeNodes, monitorSpeakers } from '../data/cascade';

interface Props {
  mode: StudioMode;
  perspective: Perspective;
  onInspect: (id: string | null) => void;
}

/* ── Shared primitives ─────────────────────────────────────── */

function nodeAccent(role: SummingNode['role']): string {
  switch (role) {
    case 'converter-source': return '#6366f1';
    case 'tributary-sum': return '#14b8a6';
    case 'cascade-destination': return '#22c55e';
    case 'console': return '#ef4444';
    case 'master-converter': return '#e879f9';
    default: return '#71717a';
  }
}

export function roleLabel(role: SummingNode['role']): string {
  switch (role) {
    case 'converter-source': return 'DA Conversion';
    case 'tributary-sum': return 'Tributary Sum';
    case 'cascade-destination': return 'Cascade Sum';
    case 'console': return 'Console';
    case 'master-converter': return 'AD Conversion';
    default: return role;
  }
}

function CascadeNode({ node, highlight, selected, onSelect, onInspect }: { node: SummingNode; highlight?: boolean; selected?: boolean; onSelect?: (node: SummingNode) => void; onInspect?: (id: string) => void }) {
  const accent = nodeAccent(node.role);
  return (
    <button
      type="button"
      onClick={() => { onSelect?.(node); onInspect?.(node.id); }}
      className={`mat-recess rounded-[3px] border px-3 py-2.5 min-w-[9rem] max-w-[14rem] text-left transition-all cursor-pointer ${highlight === false ? 'opacity-40' : ''} ${selected ? 'ring-1 ring-white/20 scale-[1.02]' : 'hover:ring-1 hover:ring-white/10'}`}
      style={{ borderColor: accent + (selected ? '80' : '35'), backgroundColor: accent + (selected ? '18' : '08') }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-sm font-medium truncate" style={{ color: 'var(--sa-cream)' }}>{node.name}</div>
        {node.transformer_count > 0 && (
          <span className="text-[9px] rounded-[2px] border border-orange-800/25 bg-orange-950/15 px-1.5 py-0.5 whitespace-nowrap shrink-0" style={{ color: 'var(--sa-signal-active)' }}>
            {node.transformer_count} xfmr
          </span>
        )}
      </div>
      <div className="text-[10px] mt-0.5" style={{ color: accent }}>{roleLabel(node.role)}</div>
      <div className="text-[10px] mt-1 line-clamp-2" style={{ color: 'var(--sa-cream-dim)' }}>{node.character.split('.')[0]}.</div>
      {(node.max_input_dbu !== null || node.noise_floor_dbu !== null) && (
        <div className="flex gap-2 mt-1.5 text-[9px] text-zinc-600">
          {node.max_input_dbu !== null && <span>+{node.max_input_dbu} dBu max</span>}
          {node.noise_floor_dbu !== null && <span>{node.noise_floor_dbu} dBu noise</span>}
        </div>
      )}
    </button>
  );
}

function StageBox({ label, sublabel, accent, dim }: { label: string; sublabel?: string; accent: string; dim?: boolean }) {
  return (
    <div
      className={`mat-recess rounded-[3px] border px-3.5 py-2 text-center min-w-[5.5rem] ${dim ? 'opacity-50' : ''}`}
      style={{ borderColor: accent + '25', backgroundColor: accent + '08' }}
    >
      <div className="text-sm font-medium" style={{ color: 'var(--sa-cream)' }}>{label}</div>
      {sublabel && <div className="text-[10px]" style={{ color: 'var(--sa-cream-dim)' }}>{sublabel}</div>}
    </div>
  );
}

function Arrow({ label, dashed, color }: { label?: string; dashed?: boolean; color?: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 shrink-0">
      <svg width="28" height="12" viewBox="0 0 28 12" className={color ?? 'text-zinc-600'}>
        <path d="M0 6h24m-4-4 4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray={dashed ? '3 3' : undefined} />
      </svg>
      {label && <span className="text-[8px] text-zinc-600 whitespace-nowrap">{label}</span>}
    </div>
  );
}

function DomainGate({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 shrink-0 mx-0.5">
      <div className="w-px h-2 bg-red-800/40" />
      <span className="text-[8px] text-red-400/60 whitespace-nowrap">{label}</span>
      <div className="w-px h-2 bg-red-800/40" />
    </div>
  );
}

/* ── Node detail drawer ────────────────────────────────────── */

export function nodeConsequence(node: SummingNode, perspective: Perspective): string {
  const p = perspective;
  switch (node.id) {
    case 'aurora':
      return p === 'musician'
        ? 'This is where your sound crosses from digital to analog. The Aurora\'s conversion quality sets the resolution ceiling — every detail the monitors reveal was first decoded here.'
        : p === 'engineer'
        ? 'SynchroLock clocking and dedicated converter pairs per channel keep jitter and crosstalk below audibility. The DA outputs set the analog noise floor for the entire downstream path. At 120 dB dynamic range, the Aurora is not the limiting factor.'
        : 'DA conversion stage. 120 dB dynamic range, THD+N −108 dB, crosstalk −130 dB. Wordclock master. Outputs 1–16 feed API via Tilt EQs (hardwired). Outputs 17–24 feed OTB. AES input accepts AD+ print return.';
    case 'api':
      return p === 'musician'
        ? 'The console gives the mix its punch and midrange authority. The 2520 op-amps and iron output transformers add harmonic density to everything that passes through — this is the "sound" of the studio.'
        : p === 'engineer'
        ? 'Sixteen channels of gain staging with 31-step detented level, continuously variable pan, and per-channel inserts that are always live. Mix A is the primary print bus; Mix B feeds the Pueblo parallel path. The output iron contributes measurable even-harmonic content and gentle HF rolloff.'
        : 'API 2510 input op-amps, 2520 output op-amps (MIL-Spec). Per-channel insert always active. +28 dBu output capability exceeds the AD+ input ceiling by 4 dB — the primary headroom bottleneck in the system. THD ~0.02%, noise floor −108 dBu.';
    case 'adplus':
      return p === 'musician'
        ? 'The point of no return — this converter captures the final mix. Its input transformer and optional X-Former insert shape the last bit of analog character before the signal becomes digital permanently. What it captures is exactly what the speakers play.'
        : p === 'engineer'
        ? 'Two stereo inputs — API Mix A on Input A, Pueblo parallel sum on Input B. Front panel selector. JetPLL jitter elimination, Clip Guard, and EMPHASIS circuit (shelving EQ/compressor adding 2nd-order harmonics). The X-Former insert with custom Hammond transformers is available for deliberate iron coloration on the final capture.'
        : 'Input transformer always in path. AES output transformer. +24 dBu max input (headroom bottleneck — API outputs +28 dBu). JetPLL jitter elimination. 118 dB dynamic range. THD ~0.0011%. EMPHASIS adds controlled 2nd-order harmonic distortion via shelving EQ and compression.';
    case 'dbox-sum':
      return p === 'musician'
        ? 'The monitor controller — everything you hear passes through this. Five selectable sources (AES is the primary monitoring path) feed your choice of speakers. Independently, the 8-input summing section can combine analog signals for mixing or diagnostic listening.'
        : p === 'engineer'
        ? 'Monitor section: five selectable inputs (AES, Analog, SUM, USB, Bluetooth) with three speaker outputs and per-set level trim. Summing section: 8 balanced inputs (4 stereo pairs), active transformerless summing to stereo out. +27 dBu max, −90 dBu noise floor, THD 0.0019%, crosstalk −114 dB. The two sections are independent circuits.'
        : 'Monitor: 5-input selector (AES/Analog/SUM/USB/BT), 3 speaker outputs, talkback, mono, dim, mute. Summing: 8 inputs (4 stereo pairs), +27 dBu max I/O, −90 dBu noise, 0.0019% THD, −114 dB crosstalk, 0.0020% IMD. Monitor and summing are independent circuits.';
    case 'otb':
      return p === 'musician'
        ? 'The merge point where overflow DAW stems and the entire FX tributary converge. The TX-100 output transformer stamps iron warmth and cohesion onto the combined result — gently rounding transients and adding weight before the signal enters the console.'
        : p === 'engineer'
        ? 'TX-240/TX-260 discrete op-amp summing with TX-100 output transformer on the main XLR. Per-channel level and pan. Two outputs: transformer-balanced main (carries iron color) and clean monitor out (bypasses it). Specs are unpublished — character assessment is empirical.'
        : 'Discrete op-amp summing topology (TX-240/TX-260). TX-100 output transformer on main XLR. 16 inputs (8 stereo pairs + ext stereo in). Specs unpublished. Two outputs: transformer-balanced and clean monitor.';
    case 'pueblo':
      return p === 'musician'
        ? 'The clean alternative. When the API console\'s iron and harmonic density are too much for a particular mix, this path bypasses it entirely. The Pueblo is the quietest, lowest-distortion summing unit in the system — it delivers the mix without editorial.'
        : p === 'engineer'
        ? 'Thirty-two inputs across four cascading banks (A→B→C→D). Bank D output hardwired to AD+ Input B. At 0.00094% THD and −98 dBu noise, it contributes virtually no measurable coloration. Optional switchable transformers on Bank D output for deliberate iron when wanted.'
        : '+29 dBu max I/O, −98 dBu noise, 0.00094% THD at +22 dBu, 127 dB dynamic range, −103 dB crosstalk. Four banks cascading A→B→C→D. Bank D → AD+ Input B (hardwired). Optional Bank D output transformers (off by default).';
    default:
      return node.character;
  }
}

function NodeDetail({ node, perspective, onClose }: { node: SummingNode; perspective: Perspective; onClose: () => void }) {
  const accent = nodeAccent(node.role);

  return (
    <div
      className="mat-recess rounded-[3px] border p-3.5 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200"
      style={{ borderColor: accent + '25', backgroundColor: accent + '08' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium" style={{ color: 'var(--sa-cream)' }}>{node.name}</div>
          <div className="text-[10px]" style={{ color: 'var(--sa-cream-dim)' }}>{node.vendor} · {roleLabel(node.role)}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[10px] shrink-0 px-1.5 py-0.5 mat-recess rounded-[2px] hover:text-zinc-300" style={{ color: 'var(--sa-cream-dim)' }}
        >
          Close
        </button>
      </div>

      <p className="text-[11.5px] leading-relaxed" style={{ color: 'var(--sa-cream-dim)' }}>
        {nodeConsequence(node, perspective)}
      </p>

      {/* Specs grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-[10px]">
        {node.max_input_dbu !== null && (
          <div><span className="text-zinc-600">Max input</span> <span className="ml-1" style={{ color: 'var(--sa-cream-dim)' }}>+{node.max_input_dbu} dBu</span></div>
        )}
        {node.max_output_dbu !== null && (
          <div><span className="text-zinc-600">Max output</span> <span className="ml-1" style={{ color: 'var(--sa-cream-dim)' }}>+{node.max_output_dbu} dBu</span></div>
        )}
        {node.noise_floor_dbu !== null && (
          <div><span className="text-zinc-600">Noise floor</span> <span className="ml-1" style={{ color: 'var(--sa-cream-dim)' }}>{node.noise_floor_dbu} dBu</span></div>
        )}
        {node.thd_percent !== null && (
          <div><span className="text-zinc-600">THD</span> <span className="ml-1" style={{ color: 'var(--sa-cream-dim)' }}>{node.thd_percent}%</span></div>
        )}
        {node.dynamic_range_db !== null && (
          <div><span className="text-zinc-600">Dynamic range</span> <span className="ml-1" style={{ color: 'var(--sa-cream-dim)' }}>{node.dynamic_range_db} dB</span></div>
        )}
        <div><span className="text-zinc-600">Channels</span> <span className="ml-1" style={{ color: 'var(--sa-cream-dim)' }}>{node.input_channels} in / {node.output_channels} out</span></div>
        <div>
          <span className="text-zinc-600">Iron</span>
          <span className="ml-1" style={{ color: 'var(--sa-cream-dim)' }}>{node.transformer_count > 0 ? `${node.transformer_count} transformer${node.transformer_count > 1 ? 's' : ''}` : 'Transformerless'}</span>
        </div>
        {node.has_insert && (
          <div><span className="text-zinc-600">Inserts</span> <span className="ml-1" style={{ color: 'var(--sa-cream-dim)' }}>Per-channel + bus</span></div>
        )}
      </div>

      {/* Upstream / downstream context */}
      <div className="flex flex-wrap gap-3 text-[9px]" style={{ color: 'var(--sa-cream-dim)' }}>
        {node.receives_from.length > 0 && (
          <div>
            <span className="text-zinc-600">Receives from:</span>{' '}
            {node.receives_from.map(id => cascadeNodes.find(n => n.id === id)?.name ?? id).join(', ')}
          </div>
        )}
        {node.feeds_into.length > 0 && (
          <div>
            <span className="text-zinc-600">Feeds:</span>{' '}
            {node.feeds_into.map(id => cascadeNodes.find(n => n.id === id)?.name ?? id).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Monitor Path — the constant ───────────────────────────── */
/*
 * This is always running, regardless of mode. Every sound you hear
 * in this studio passes through this chain. The mode only changes
 * what enters it and how many tributaries feed into the console.
 */

function SpeakerChip({ speaker, selected, onSelect, onInspect }: { speaker: MonitorSpeaker; selected?: boolean; onSelect?: () => void; onInspect?: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => { onSelect?.(); onInspect?.(speaker.id); }}
      className={`mat-recess rounded-[3px] border px-2 py-1.5 text-left transition-all cursor-pointer min-w-[7rem] ${selected ? 'ring-1 ring-white/20 border-zinc-600/40' : 'border-zinc-800/30 hover:border-zinc-700/40'}`}
    >
      <div className="text-[10px] font-medium" style={{ color: 'var(--sa-cream)' }}>{speaker.name}</div>
      <div className="text-[9px]" style={{ color: 'var(--sa-cream-dim)' }}>{speaker.type === 'passive' ? `Passive · ${speaker.amplifier}` : 'Active'}</div>
    </button>
  );
}

function SpeakerDetail({ speaker, perspective, onClose }: { speaker: MonitorSpeaker; perspective: Perspective; onClose: () => void }) {
  return (
    <div className="mat-recess rounded-[3px] border border-zinc-700/20 p-3.5 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium" style={{ color: 'var(--sa-cream)' }}>{speaker.name}</div>
          <div className="text-[10px]" style={{ color: 'var(--sa-cream-dim)' }}>{speaker.vendor} · {speaker.driver_config}</div>
        </div>
        <button type="button" onClick={onClose} className="text-[10px] shrink-0 px-1.5 py-0.5 mat-recess rounded-[2px] hover:text-zinc-300" style={{ color: 'var(--sa-cream-dim)' }}>Close</button>
      </div>
      <p className="text-[11.5px] leading-relaxed" style={{ color: 'var(--sa-cream-dim)' }}>
          {perspective === 'technical' ? speaker.engineering : speaker.character}
      </p>
      <div className="flex gap-4 text-[10px]" style={{ color: 'var(--sa-cream-dim)' }}>
        <span>{speaker.freq_range_hz[0]} Hz – {speaker.freq_range_hz[1] >= 1000 ? `${speaker.freq_range_hz[1] / 1000}k` : speaker.freq_range_hz[1]} Hz</span>
        {speaker.amplifier && <span>Amp: {speaker.amplifier}</span>}
      </div>
      <div className="text-[10px] italic" style={{ color: 'var(--sa-cream-dim)' }}>{speaker.use_case}</div>
    </div>
  );
}

function MonitorPath({ perspective, selectedNode, onSelectNode, onInspect }: { perspective: Perspective; selectedNode: SummingNode | null; onSelectNode: (node: SummingNode) => void; onInspect: (id: string | null) => void }) {
  const aurora = cascadeNodes.find(n => n.id === 'aurora')!;
  const dbox = cascadeNodes.find(n => n.id === 'dbox-sum')!;
  const [selectedSpeaker, setSelectedSpeaker] = useState<MonitorSpeaker | null>(null);

  return (
    <div>
      <div className="text-silkscreen text-[8px] mb-2">
        Monitor path · always active
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <StageBox label="DAW" sublabel="Playback output" accent="#a1a1aa" />
        <Arrow label="Thunderbolt" />
        <DomainGate label="digital" />
        <CascadeNode node={aurora} selected={selectedNode?.id === aurora.id} onSelect={onSelectNode} onInspect={onInspect} />
        <Arrow label="AES cable" />
        <CascadeNode node={dbox} selected={selectedNode?.id === dbox.id} onSelect={onSelectNode} onInspect={onInspect} />
        <Arrow label="speaker select" />
        <div className="flex gap-1.5">
          {monitorSpeakers.map(s => (
            <SpeakerChip key={s.id} speaker={s} selected={selectedSpeaker?.id === s.id} onSelect={() => setSelectedSpeaker(prev => prev?.id === s.id ? null : s)} onInspect={onInspect} />
          ))}
        </div>
      </div>
      <div className="mt-2 text-[10px] leading-relaxed max-w-4xl" style={{ color: 'var(--sa-cream-dim)' }}>
        The monitoring chain is digital from DAW to D-Box+. The DAW's output travels via Thunderbolt to the Aurora(n),
        whose main monitor outputs send AES to the D-Box+ digital input. The D-Box+ selects between five sources —
        AES is the primary path — and routes to whichever speakers are active. This chain is always running regardless of mode.
      </div>
      {selectedNode && [aurora, dbox].some(n => n.id === selectedNode.id) && (
        <div className="mt-3">
          <NodeDetail node={selectedNode} perspective={perspective} onClose={() => onSelectNode(selectedNode)} />
        </div>
      )}
      {selectedSpeaker && (
        <div className="mt-3">
          <SpeakerDetail speaker={selectedSpeaker} perspective={perspective} onClose={() => setSelectedSpeaker(null)} />
        </div>
      )}
    </div>
  );
}

/* ── Source: what feeds the monitor path ────────────────────── */

function TrackingSource() {
  return (
    <div>
      <div className="text-silkscreen text-[8px] mb-2">
        Capture path · the DAW is the endpoint
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <StageBox label="Mic" sublabel="Tie line" accent="#f59e0b" />
        <Arrow label="normalled" />
        <StageBox label="Preamp" sublabel="Gain stage" accent="#3b82f6" />
        <Arrow label="normalled" />
        <StageBox label="Aurora(n)" sublabel="AD conversion" accent="#6366f1" />
        <DomainGate label="▸ digital" />
        <StageBox label="DAW" sublabel="Endpoint · record" accent="#a1a1aa" />
      </div>
      <div className="mt-1.5 text-[10px] italic leading-relaxed max-w-4xl" style={{ color: 'var(--sa-cream-dim)' }}>
        The mic signal enters through the normalled patchbay path to the preamp, then to the Aurora for A/D conversion and into the DAW.
        The DAW is the endpoint of this chain — it records the captured signal. Its playback output feeds the monitor path above,
        so you hear the recording in real time through the D-Box+ and speakers.
      </div>
    </div>
  );
}

function MixingSource({ perspective, selectedNode, onSelectNode, onInspect }: { perspective: Perspective; selectedNode: SummingNode | null; onSelectNode: (node: SummingNode) => void; onInspect: (id: string | null) => void }) {
  const aurora = cascadeNodes.find(n => n.id === 'aurora')!;
  const dbox = cascadeNodes.find(n => n.id === 'dbox-sum')!;
  const otb = cascadeNodes.find(n => n.id === 'otb')!;
  const api = cascadeNodes.find(n => n.id === 'api')!;
  const pueblo = cascadeNodes.find(n => n.id === 'pueblo')!;
  const adplus = cascadeNodes.find(n => n.id === 'adplus')!;

  return (
    <div className="space-y-4">
      <div className="text-silkscreen text-[8px] mb-1">
        Mixing path · the DAW is the starting point
      </div>

      {/* DAW → Analog domain */}
      <div>
        <div className="flex items-center gap-1.5 text-[9px] mb-1" style={{ color: 'var(--sa-cream-dim)' }}>
          <span className="inline-block w-3 h-0.5 bg-indigo-500/60 rounded" />
          DAW stems exit through the Aurora's 24 DA outputs into the analog domain
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <StageBox label="DAW" sublabel="Starting point" accent="#a1a1aa" />
          <DomainGate label="analog ◂" />
          <CascadeNode node={aurora} selected={selectedNode?.id === aurora.id} onSelect={onSelectNode} onInspect={onInspect} />
        </div>
      </div>

      {/* Two routing groups */}
      <div>
        <div className="flex items-center gap-1.5 text-[9px] mb-1" style={{ color: 'var(--sa-cream-dim)' }}>
          <span className="inline-block w-3 h-0.5 bg-red-500/60 rounded" />
          Aurora DA 1–16 → Tilt EQs → API console · channels with inserts for outboard processing
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <StageBox label="Aurora" sublabel="DA 1–16" accent="#6366f1" />
          <Arrow label="via Tilt EQs" color="text-red-700" />
          <CascadeNode node={api} selected={selectedNode?.id === api.id} onSelect={onSelectNode} onInspect={onInspect} />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 text-[9px] mb-1" style={{ color: 'var(--sa-cream-dim)' }}>
          <span className="inline-block w-3 h-0.5 bg-orange-500/60 rounded" />
          Aurora DA 17–24 → OTB for overflow stems, merging into console ext input
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <StageBox label="Aurora" sublabel="DA 17–24" accent="#6366f1" />
          <Arrow label="8 ch" color="text-orange-700" />
          <CascadeNode node={otb} selected={selectedNode?.id === otb.id} onSelect={onSelectNode} onInspect={onInspect} />
          <Arrow label="TX-100 out" color="text-orange-700" />
          <StageBox label="API ext in" sublabel="Merges into console" accent="#ef4444" />
        </div>
      </div>

      {/* D-Box+ summing — general purpose */}
      <div>
        <div className="flex items-center gap-1.5 text-[9px] mb-1" style={{ color: 'var(--sa-cream-dim)' }}>
          <span className="inline-block w-3 h-0.5 bg-teal-500/60 rounded" />
          D-Box+ summing — 8 general-purpose analog inputs, stereo sum output
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <div className="mat-recess rounded-[3px] border border-teal-800/15 px-3 py-1.5 text-center shrink-0">
            <div className="text-xs font-medium" style={{ color: 'var(--sa-cream)' }}>Patchable returns</div>
            <div className="text-[9px]" style={{ color: 'var(--sa-cream-dim)' }}>Varies per session</div>
          </div>
          <Arrow label="up to 8 inputs" color="text-teal-700" />
          <CascadeNode node={dbox} highlight selected={selectedNode?.id === dbox.id} onSelect={onSelectNode} onInspect={onInspect} />
          <Arrow label="sum out" color="text-teal-700" />
          <StageBox label="Processing" sublabel="Wideners, comp…" accent="#71717a" />
        </div>
      </div>

      {/* Print path */}
      <div>
        <div className="flex items-center gap-1.5 text-[9px] mb-1" style={{ color: 'var(--sa-cream-dim)' }}>
          <span className="inline-block w-3 h-0.5 bg-fuchsia-500/60 rounded" />
          Print path — the mix reaches AD+ for final capture back to the DAW
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <StageBox label="API Mix A" sublabel="Primary bus" accent="#ef4444" />
          <Arrow label="Mix A" color="text-fuchsia-700" />
          <CascadeNode node={adplus} selected={selectedNode?.id === adplus.id} onSelect={onSelectNode} onInspect={onInspect} />
          <DomainGate label="▸ digital" />
          <StageBox label="DAW" sublabel="Print track" accent="#a1a1aa" />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto mt-1.5 pb-1 ml-4">
          <StageBox label="API Mix B" sublabel="Alternate bus" accent="#ef4444" />
          <Arrow label="Mix B" color="text-green-700" />
          <CascadeNode node={pueblo} selected={selectedNode?.id === pueblo.id} onSelect={onSelectNode} onInspect={onInspect} />
          <Arrow label="Bank D hardwired" dashed color="text-green-700" />
          <StageBox label="AD+ input B" sublabel="Bypasses API iron" accent="#e879f9" />
        </div>
      </div>

      {selectedNode && [aurora, dbox, otb, api, pueblo, adplus].some(n => n.id === selectedNode.id) && (
        <div className="mt-1">
          <NodeDetail node={selectedNode} perspective={perspective} onClose={() => onSelectNode(selectedNode)} />
        </div>
      )}
    </div>
  );
}

/* ── Print tail — where the committed signal lands ─────────── */

function PrintTail() {
  return (
    <div>
      <div className="text-silkscreen text-[8px] mb-2">
        Print return · final capture
      </div>
      <div className="mt-1.5 text-[10px] leading-relaxed max-w-4xl" style={{ color: 'var(--sa-cream-dim)' }}>
        In mixing, the AD+ converts the final analog result back to digital. Its AES output returns to the Aurora for capture into a DAW print track.
        What you hear through the monitor path and what gets printed are independent — the D-Box+ can switch between AES (DAW playback) and SUM
        (the analog summing bus) to compare the printed result against the live analog sum.
      </div>
    </div>
  );
}

/* ── Headroom + callouts ───────────────────────────────────── */

function GainStagingNote() {
  return (
    <div className="mat-recess rounded-[3px] px-3 py-2 text-[10px]" style={{ color: 'var(--sa-cream-dim)' }}>
      <span className="font-medium" style={{ color: 'var(--sa-cream)' }}>Gain staging:</span> API can reach +28 dBu; AD+ accepts up to +24 dBu. The 4 dB difference is managed by converter calibration and mix-bus level — the mixer's job is to stage gain so the signal stays well within the converter's operating range.
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────── */

export default function CascadeView({ mode, perspective, onInspect }: Props) {
  const [selectedNode, setSelectedNode] = useState<SummingNode | null>(null);

  const handleSelectNode = (node: SummingNode) => {
    setSelectedNode(prev => prev?.id === node.id ? null : node);
  };

  return (
    <section
      className="mt-4 overflow-hidden mat-brushed-mid mat-rack-panel rounded-[3px] border transition-colors duration-500"
      style={{ borderColor: `color-mix(in srgb, var(--sa-mode-accent, rgba(113,113,122,0.25)) 40%, rgba(113,113,122,0.25))` }}
    >
      <div
        className="border-b border-zinc-800/30 px-4 py-3"
        style={{ background: `linear-gradient(180deg, var(--sa-mode-tint, transparent) 0%, transparent 100%)` }}
      >
        <div className="text-silkscreen text-[8px]">
          Studio signal flow
        </div>
        <div className="mt-1 text-sm" style={{ color: 'var(--sa-cream)' }}>
          The DAW {mode === 'tracking'
            ? 'is the endpoint — it records the captured signal, and its playback feeds the monitor path.'
            : 'is the starting point — its stems exit into the analog domain for summing, processing, and printing.'}
        </div>
      </div>

      <div className="space-y-6 px-3 py-4">
        {/* 1. The constant — always first, always visible */}
        <MonitorPath perspective={perspective} selectedNode={selectedNode} onSelectNode={handleSelectNode} onInspect={onInspect} />

        {/* 2. Divider */}
        <div className="border-t border-zinc-800/30" />

        {/* 3. What feeds it — this is the only part that changes by mode */}
        {mode === 'tracking'
          ? <TrackingSource />
          : <MixingSource perspective={perspective} selectedNode={selectedNode} onSelectNode={handleSelectNode} onInspect={onInspect} />}

        {/* 4. Divider + print note (mixing only) */}
        {mode === 'mixing' && <>
          <div className="border-t border-zinc-800/30" />
          <PrintTail />
        </>}

        {/* 6. Physics note */}
        <GainStagingNote />
      </div>
    </section>
  );
}
