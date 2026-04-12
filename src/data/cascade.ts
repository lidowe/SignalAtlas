import type { SummingNode, CascadeConnection, MonitorSource, FxDiagnosticTap, MonitorSpeaker } from '../types/studio';

// ── Summing Cascade Nodes ──
// Each node carries verified specs where available.
// null = manufacturer has not published this spec.

export const cascadeNodes: SummingNode[] = [
  {
    id: 'aurora',
    name: 'Lynx Aurora(n)',
    vendor: 'Lynx Studio Technology',
    role: 'converter-source',
    max_input_dbu: 20,
    max_output_dbu: 20,
    noise_floor_dbu: -110,            // derived from 120 dB dynamic range (DA)
    thd_percent: 0.0004,              // DA output, measured at −1 dBFS
    dynamic_range_db: 120,            // DA, A-weighted
    transformer_count: 0,
    transformerless: true,
    input_channels: 16,               // AD: 16 analog in
    output_channels: 24,              // DA: 24 analog out (16 main + 8 overflow)
    has_insert: false,
    has_ext_input: false,
    feeds_into: ['api', 'otb'],       // outs 1-16 → API (via Tilt), outs 17-24 → OTB
    receives_from: [],
    character: 'The gateway between digital and analog. SynchroLock clocking and dedicated converter arrays per pair deliver transparent, ruler-flat conversion. What the session contains is exactly what enters the analog domain.',
    engineering: 'DA: 120 dB dynamic range (A-wtd), THD+N −108 dB, crosstalk −130 dB. AD: 119 dB dynamic range, THD+N −113 dB. Outputs 1–16 feed API via inline Tilt EQs (hardwired, not on patchbay). Outputs 17–24 feed OTB channels 1–8. Wordclock master for the studio.',
  },
  {
    id: 'dbox-sum',
    name: 'Dangerous D-Box+',
    vendor: 'Dangerous Music',
    role: 'monitor-controller',
    max_input_dbu: 27,
    max_output_dbu: 27,
    noise_floor_dbu: -90,             // measured, 22 Hz–22 kHz
    thd_percent: 0.0019,              // measured at +4 dBu, 1 kHz
    dynamic_range_db: null,           // not published for summing section
    transformer_count: 0,
    transformerless: true,
    input_channels: 8,                // 8 summing inputs (4 stereo pairs) — general purpose analog summing
    output_channels: 2,               // stereo sum output
    has_insert: false,
    has_ext_input: false,
    feeds_into: [],                   // sum outputs route to downstream processing (wideners, compressors, etc.)
    receives_from: [],                // summing inputs are patchable — varies per session
    character: 'The monitor controller and a compact analog summing stage. Five selectable monitor sources (AES, Analog, SUM, USB, Bluetooth) feed up to three speaker sets. Independently, the summing section takes 8 inputs (4 stereo pairs) and sums them to a stereo output — this is a general-purpose analog summing bus, not tied to any specific purpose. The sum output can route downstream through processing gear before reaching the print path.',
    engineering: 'Monitor section: five selectable inputs (AES digital, stereo analog, SUM bus, USB, Bluetooth). Three speaker outputs with independent level trim per set. Talkback, mono, dim, mute. Summing section: 8 balanced inputs (4 stereo pairs) with per-input level, active transformerless summing to stereo output. +27 dBu max input, −90 dBu noise floor, 0.0019% THD at +4 dBu, crosstalk −114 dB, IMD 0.0020%. Monitor and summing sections are independent circuits.',
  },
  {
    id: 'otb',
    name: 'Tonelux OTB-16',
    vendor: 'Tonelux',
    role: 'tributary-merge',
    max_input_dbu: null,              // unpublished
    max_output_dbu: null,             // unpublished
    noise_floor_dbu: null,            // unpublished
    thd_percent: null,                // unpublished
    dynamic_range_db: null,           // unpublished
    transformer_count: 1,             // TX-100 output transformer on main XLR
    transformerless: false,
    input_channels: 16,               // 8 stereo pairs + external stereo input
    output_channels: 2,               // transformer-balanced main out + clean monitor out
    has_insert: false,
    has_ext_input: true,              // D-Box+ sum feeds here
    feeds_into: ['api'],              // transformer output → API external input
    receives_from: ['aurora', 'dbox-sum'],  // Aurora 17-24 on channels + D-Box+ sum on ext in
    character: 'The merge point. Overflow DAW stems on its 8 channels and the entire FX tributary on its external input converge here. The TX-100 output transformer stamps iron character onto the combined result — warmth, cohesion, and gentle transient rounding. Per-channel level and pan on stems. Two outputs: the transformer-balanced main carries the iron, the clean monitor output bypasses it.',
    engineering: 'TX-240 / TX-260 discrete op-amp summing topology. TX-100 output transformer on main XLR. Internal AC mains transformer adjacent to audio path. Per-channel level and pan controls. Specs unpublished — character assessment is empirical, not measured. DB-25 inputs at +4 dBu nominal. Aux inputs on balanced TRS for the external cascade feed from D-Box+.',
  },
  {
    id: 'api',
    name: 'API ASM164',
    vendor: 'API',
    role: 'console',
    max_input_dbu: 28,                // estimated from 2520 circuit headroom
    max_output_dbu: 28,               // estimated from 2520 output stage
    noise_floor_dbu: -108,            // estimated from −112 dBr SNR spec
    thd_percent: 0.02,                // estimated from 2520 op-amp characteristics
    dynamic_range_db: null,           // not published
    transformer_count: 1,             // 1 output transformer per bus; signal goes through one
    transformerless: false,
    input_channels: 16,               // plus external stereo input from OTB
    output_channels: 4,               // Mix A L/R + Mix B L/R
    has_insert: true,                 // per-channel insert + bus inserts on both A and B
    has_ext_input: true,              // OTB transformer output feeds here
    feeds_into: ['adplus', 'pueblo'], // Mix A → AD+, Mix B → Pueblo
    receives_from: ['aurora', 'otb'], // Aurora 1-16 (via Tilt) + OTB on ext input
    character: 'The brain of the mix. Sixteen channels from the DAW with 31-step detented level, pan, and bus assignment — a real console. The OTB tributary merges here via the external input. API 2520 output op-amps and iron output transformers add punch, midrange authority, and harmonic density. Insert sends on every channel are always live — free taps for outboard processing even when the insert isn\'t engaged.',
    engineering: 'API 2510 input op-amps, 2520 output op-amps (MIL-Spec). Transformer-coupled output per bus. Estimated +28 dBu max I/O, −108 dBu noise floor (from −112 dBr SNR), 0.02% THD. Per-channel: 31-step detented level, continuously variable pan with center detent, insert send/return (always active), assignable to Mix A and/or Mix B. 4-segment LED metering per channel, analog VU meters on output.',
  },
  {
    id: 'pueblo',
    name: 'Pueblo Audio HJ482',
    vendor: 'Pueblo Audio',
    role: 'parallel-sum',
    max_input_dbu: 29,                // measured
    max_output_dbu: 29,               // at 10 kΩ load
    noise_floor_dbu: -98,             // measured, A-weighted, 20–20 kHz
    thd_percent: 0.00094,             // measured at +22 dBu, 1 kHz
    dynamic_range_db: 127,            // measured
    transformer_count: 0,             // optional Bank D transformers, off by default
    transformerless: true,
    input_channels: 32,               // 4 banks of 8
    output_channels: 8,               // stereo per bank (A, B, C, D)
    has_insert: false,
    has_ext_input: false,
    feeds_into: ['adplus'],           // Bank D output → AD+ input B (hardwired)
    receives_from: ['api'],           // API Mix B
    character: 'The clean parallel path. Thirty-two inputs across four cascading banks — the lowest distortion, widest headroom, quietest unit in the entire system. Bank D output is permanently wired to the AD+ second input, always ready as an alternate print path that bypasses the API output stage entirely. When you want the mix without the iron, this is where it lives.',
    engineering: 'Active summing. +29 dBu max I/O, −98 dBu noise, 0.00094% THD at +22 dBu, 127 dB dynamic range, crosstalk −103 dB, bandwidth DC–1 MHz. 12 kΩ input impedance. Banks cascade A→B→C→D internally; all bank outputs remain live even when cascaded. Optional switchable transformers on Bank D output.',
  },
  {
    id: 'adplus',
    name: 'Dangerous AD+',
    vendor: 'Dangerous Music',
    role: 'master-converter',
    max_input_dbu: 24,                // the headroom bottleneck
    max_output_dbu: null,             // digital output
    noise_floor_dbu: -108,            // equivalent input noise
    thd_percent: 0.0011,              // estimated
    dynamic_range_db: 118,            // measured
    transformer_count: 2,             // 1 input + 1 AES output (+2 more with X-Former)
    transformerless: false,
    input_channels: 4,                // 2 stereo pairs (A/B switchable)
    output_channels: 2,               // stereo AES
    has_insert: true,                 // X-Former insert (custom Hammond transformers)
    has_ext_input: false,
    feeds_into: ['dbox-monitor'],     // AES out → D-Box+ AES input
    receives_from: ['api', 'pueblo'], // Input A from API Mix A, Input B from Pueblo Bank D
    character: 'The point of no return. Two stereo inputs — the API main mix on Input A, the Pueblo parallel sum on Input B — selectable by front panel switch. Mastering-grade A/D conversion with JetPLL jitter elimination. Also the master wordclock source for the entire studio. Optional X-Former insert adds Hammond transformers for deliberate iron coloration on the final capture.',
    engineering: `Input transformer always in path. AES output transformer. Optional X-Former insert adds 2 custom Hammond transformers. JetPLL jitter elimination. Clip Guard. Zoomable meters (top 10 dB). EMPHASIS circuit (shelving EQ/compressor for 2nd-order harmonic distortion). Master wordclock with three modes (internal, external, master). Dual AES, ADAT, SPDIF optical + coax outputs. +24 dBu max input. API can reach +28 dBu, a 4 dB difference managed by converter calibration and gain staging — the mixer ensures signal stays within the converter's operating range.`,
  },
];

// ── Cascade Connections (default normalled state) ──

export const cascadeConnections: CascadeConnection[] = [
  // Tracking path
  { id: 'cc-mic-to-preamp', from_node_id: 'mic-ties', to_node_id: 'preamp-inputs', normal_type: 'full-normal', label: 'Mic tie → Preamp input', active_in: ['tracking'] },
  { id: 'cc-preamp-to-aurora', from_node_id: 'preamp-outputs', to_node_id: 'aurora', normal_type: 'half-normal', label: 'Preamp output → Aurora AD input', active_in: ['tracking'] },

  // Monitor path (always active) — digital until D-Box+ DA
  { id: 'cc-daw-to-aurora-tb', from_node_id: 'daw', to_node_id: 'aurora', normal_type: 'hardwired', label: 'DAW → Thunderbolt → Aurora(n)', active_in: ['tracking', 'mixing'] },
  { id: 'cc-aurora-aes-to-dbox', from_node_id: 'aurora', to_node_id: 'dbox-sum', normal_type: 'hardwired', label: 'Aurora AES monitor out → D-Box+ AES in', active_in: ['tracking', 'mixing'] },
  { id: 'cc-dbox-to-speakers', from_node_id: 'dbox-sum', to_node_id: 'speakers', normal_type: 'hardwired', label: 'D-Box+ → Speaker selection', active_in: ['tracking', 'mixing'] },

  // Mixing path — DAW stems to analog domain
  { id: 'cc-aurora-da-to-api', from_node_id: 'aurora', to_node_id: 'api', normal_type: 'half-normal', label: 'Aurora DA 1–16 → Tilt EQs → API ch 1–16', active_in: ['mixing'] },
  { id: 'cc-aurora-da-to-otb', from_node_id: 'aurora', to_node_id: 'otb', normal_type: 'half-normal', label: 'Aurora DA 17–24 → OTB ch 1–8', active_in: ['mixing'] },

  // Mixing path — OTB merge into console
  { id: 'cc-otb-to-api', from_node_id: 'otb', to_node_id: 'api', normal_type: 'half-normal', label: 'OTB transformer out → API ext input', active_in: ['mixing'] },

  // Mixing path — console bus inserts
  { id: 'cc-api-insert', from_node_id: 'api', to_node_id: 'api', normal_type: 'half-normal', label: 'API bus insert send → return (normalled)', active_in: ['mixing'] },

  // Mixing path — print
  { id: 'cc-api-to-adplus', from_node_id: 'api', to_node_id: 'adplus', normal_type: 'half-normal', label: 'API Mix A → AD+ input A', active_in: ['mixing'] },
  { id: 'cc-api-to-pueblo', from_node_id: 'api', to_node_id: 'pueblo', normal_type: 'half-normal', label: 'API Mix B → Pueblo bank input', active_in: ['mixing'] },
  { id: 'cc-pueblo-to-adplus', from_node_id: 'pueblo', to_node_id: 'adplus', normal_type: 'hardwired', label: 'Pueblo Bank D → AD+ input B', active_in: ['mixing'] },
];

// ── D-Box+ Monitor Sources ──

export const monitorSources: MonitorSource[] = [
  { id: 'aes', label: 'AES', description: 'Digital stereo input. In tracking, this carries the DAW\'s main monitor output via Thunderbolt → Aurora(n) → AES cable → D-Box+. In mixing, this carries the AD+ print output. The primary monitoring path.', is_primary: true },
  { id: 'sum', label: 'SUM', description: 'The D-Box+ summing bus output. Whatever is patched into the 8 summing inputs is summed to stereo here. Can be used as a diagnostic tap to hear specific signals in isolation.', is_diagnostic: true },
  { id: 'analog', label: 'ANALOG', description: 'Patchable stereo analog input. Could be the Pueblo output, API Mix B, or an external reference. Changes per session.' },
  { id: 'usb', label: 'USB', description: 'Computer audio for reference playback and casual listening.' },
  { id: 'bluetooth', label: 'BT', description: 'Phone and wireless playback for quick references.' },
];

// ── FX Diagnostic Taps ──
// Three ways to hear the FX bus in isolation, built into the topology.

export const fxDiagnosticTaps: FxDiagnosticTap[] = [
  {
    id: 'tap-raw',
    label: 'Raw FX',
    how: 'D-Box+ SUM button',
    what_you_hear: 'FX returns before the widener, before the OTB transformer, before the cascade',
    listen_for: 'Individual effect quality — is the reverb muddy? Is the delay timing clean? Is the spatial balance right?',
  },
  {
    id: 'tap-processed',
    label: 'Processed FX',
    how: 'Mute OTB stem channels (pull faders down)',
    what_you_hear: 'FX after the widener and after the TX-100 transformer — the fully processed FX bus',
    listen_for: 'How the iron and spatial processing change the effects. Does the transformer add cohesion or mud?',
  },
  {
    id: 'tap-context',
    label: 'Full Mix',
    how: 'D-Box+ AES button (default monitoring)',
    what_you_hear: 'Everything together — stems, FX, bus processing, the full cascade',
    listen_for: 'Final mix decisions — balance, depth, width, the real picture',
  },
];

// ── Monitor Speakers ──

export const monitorSpeakers: MonitorSpeaker[] = [
  {
    id: 'ns10',
    name: 'Yamaha NS-10M',
    vendor: 'Yamaha',
    type: 'passive',
    amplifier: 'Bryston 3B',
    driver_config: '2-way: 18cm woofer + 3.5cm dome tweeter',
    freq_range_hz: [60, 20_000],
    character: 'The unforgiving truth-teller. The NS-10 is deliberately unpleasant — midrange-forward, thin on the bottom, harsh on the top. If a mix sounds good on NS-10s, it sounds good everywhere. They reveal vocal balance problems, midrange mud, and harsh sibilance that more flattering speakers hide.',
    engineering: 'Passive 2-way monitor. 18 cm white-cone paper woofer, 3.5 cm soft dome tweeter. 90 dB sensitivity, 8Ω nominal. Driven by Bryston 3B solid-state power amplifier (120W/ch into 8Ω, THD <0.007%). The Bryston adds virtually no character — what the NS-10 shows is what\'s actually there. No port — sealed cabinet gives tight, controlled bass rolloff rather than ported false extension.',
    use_case: 'Mix reference and translation checking. If vocals sit properly on NS-10s, they\'ll sit on everything from earbuds to PA systems. The standard "worst case" reference in professional studios since the early 1980s.',
  },
  {
    id: 'hedd-mk2',
    name: 'HEDD Type 20 MK2',
    vendor: 'HEDD',
    type: 'active',
    driver_config: '3-way: 7" woofer + 4" midrange + AMT tweeter',
    freq_range_hz: [32, 50_000],
    character: 'Detailed, extended, and revealing without being unkind. The Air Motion Transformer tweeter delivers high-frequency resolution and transient speed that dome tweeters cannot — you hear cymbal texture, reverb tails, and spatial cues with unusual clarity. Low end extends to 32 Hz and remains controlled. The midrange driver isolates vocals and instruments with precision.',
    engineering: 'Active 3-way, Class A/B amplification. 7" woofer (300W), 4" midrange (100W), HEDD AMT (Air Motion Transformer) tweeter (100W). Phase linearization via DSP. Rear-panel HF/LF room correction trim. 32 Hz–50 kHz ±3 dB. 120 dB SPL peak. The AMT operates by squeezing air through folded diaphragm pleats — fundamentally different transduction principle from moving-coil drivers.',
    use_case: 'Primary mixing monitors. Extended bandwidth lets you hear sub-bass content, HF detail, and spatial characteristics that narrower monitors miss. The 3-way design means less intermodulation distortion — each driver handles a constrained band cleanly.',
  },
  {
    id: 'auratone',
    name: 'Auratone 5C',
    vendor: 'Auratone',
    type: 'passive',
    amplifier: 'Bryston 3B (shared)',
    driver_config: 'Single full-range: 5" driver',
    freq_range_hz: [100, 15_000],
    character: 'Mono reference and midrange truth. One tiny speaker, no crossover, no stereo — just the midrange essence of a mix. If the vocal lead and bass fundamental come through clearly on the Auratone, the core balance is right. Exposes arrangement density problems that stereo speakers hide behind width.',
    engineering: 'Passive single-driver, sealed enclosure. 5" full-range cone. Typically used as mono reference in studio center position. No crossover network — all frequencies hit one driver, revealing phase and intermodulation artifacts that multi-way systems mask. Bandwidth roughly 100 Hz–15 kHz, deliberately limited.',
    use_case: 'Mono compatibility, arrangement clarity, vocal/bass balance. The "grot box" check — simulates small playback systems (phone speakers, laptop, AM radio). If it works here, the arrangement translates.',
  },
];
