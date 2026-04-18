import type { SummingNode, CascadeConnection, MonitorSource, FxDiagnosticTap, MonitorSpeaker, NodeZone } from '../types/studio';

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
    input_channels: 24,               // AD: 24 analog in
    output_channels: 24,              // DA: 24 analog out
    has_insert: false,
    has_ext_input: false,
    feeds_into: ['api', 'otb'],       // DA 1-16 → Tilt → API, DA 17-24 → OTB
    receives_from: [],
    character: 'The gateway between digital and analog. SynchroLock clocking and dedicated converter arrays per pair deliver transparent, ruler-flat conversion. What the session contains is exactly what enters the analog domain. 24 analog inputs for tracking, 24 analog outputs for mixing, plus 8 digital channels (AES or ADAT). Wordclock master for the entire studio.',
    engineering: 'DA: 120 dB dynamic range (A-wtd), THD+N −108 dB, crosstalk −130 dB. AD: 119 dB dynamic range, THD+N −113 dB. 24 analog AD + 24 analog DA + 8 AES (or 8 ADAT, mutually exclusive). 32 channels max routable to DAW via Lynx software. DA 1–16 feed Tilt EQs (half-normalled on patchbay) → API. DA 17–24 feed OTB ch 1–8 (full normal). Wordclock master for the studio. TB3 optical to computer.',
  },
  {
    id: 'dbox-sum',
    name: 'Dangerous D-Box+',
    vendor: 'Dangerous Music',
    role: 'tributary-sum',
    max_input_dbu: 27,
    max_output_dbu: 27,
    noise_floor_dbu: -90,             // measured, 22 Hz–22 kHz
    thd_percent: 0.0019,              // measured at +4 dBu, 1 kHz
    dynamic_range_db: null,           // not published for summing section
    transformer_count: 0,
    transformerless: true,
    input_channels: 8,                // 8 summing inputs (4 stereo pairs) — session-patched
    output_channels: 2,               // stereo sum output
    has_insert: false,
    has_ext_input: false,
    feeds_into: ['api'],              // sum out → API Mix A insert return (full normal)
    receives_from: [],                // summing inputs are patchable — varies per session
    character: 'A flexible summing junction. Eight inputs (four stereo pairs) patched per session — Pueblo A/B outputs, outboard returns, Tascam, whatever the session needs. The stereo sum output normals to the API Mix A insert return, injecting the D-Box+ tributary into the console\'s main bus. Also the monitor controller: five selectable sources feed three speaker sets.',
    engineering: 'Monitor section: five selectable inputs (AES digital, stereo analog, SUM bus, USB, Bluetooth). Three speaker outputs with independent level trim per set. Talkback, mono, dim, mute. Summing section: 8 balanced inputs (4 stereo pairs) with per-input level, active transformerless summing to stereo output. +27 dBu max input, −90 dBu noise floor, 0.0019% THD at +4 dBu, crosstalk −114 dB, IMD 0.0020%. Monitor and summing sections are independent circuits. Sum output full-normalled to API Mix A insert return on the patchbay.',
  },
  {
    id: 'otb',
    name: 'Tonelux OTB-16',
    vendor: 'Tonelux',
    role: 'tributary-sum',
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
    has_ext_input: true,              // external stereo input patchable per session
    feeds_into: ['api'],              // transformer output → API Mix B insert return (full normal)
    receives_from: ['aurora'],        // Aurora DA 17-24 on ch 1-8
    character: 'DAW output overflow summing (Aurora DA 17–24 on channels 1–8) plus an external stereo input patchable per session. The TX-100 output transformer stamps iron character onto the result — warmth, cohesion, and gentle transient rounding. Transformer out normals to the API Mix B insert return, creating a stacked-iron path: OTB TX-100 → API 2520 → API output transformer. Per-channel level and pan. Two outputs: transformer-balanced main and clean monitor bypass.',
    engineering: 'TX-240 / TX-260 discrete op-amp summing topology. TX-100 output transformer on main XLR. Internal AC mains transformer adjacent to audio path. Per-channel level and pan controls. Specs unpublished — character assessment is empirical, not measured. DB-25 inputs at +4 dBu nominal. External stereo input on balanced TRS (patchable per session). Transformer output full-normalled to API Mix B insert return on patchbay.',
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
    input_channels: 16,               // ch 1-16 line inputs (from Tilt EQs in mixing mode)
    output_channels: 4,               // Mix A L/R + Mix B L/R
    has_insert: true,                 // per-channel insert + bus inserts on both A and B
    has_ext_input: true,              // patchable per session (no default normal)
    feeds_into: ['pueblo'],           // Mix A → Pueblo Bank C, Mix B → Pueblo Bank D
    receives_from: ['aurora', 'dbox-sum', 'otb'],  // Aurora 1-16 (via Tilt) on ch inputs, D-Box+ sum on Mix A insert, OTB xfmr on Mix B insert
    character: 'The brain of the mix. Sixteen channels from the DAW via Tilt EQs, with 31-step detented level, pan, and bus assignment. API 2520 output op-amps and iron output transformers add punch, midrange authority, and harmonic density. Insert sends on every channel are always live. D-Box+ sum normals to the Mix A insert return; OTB transformer out normals to the Mix B insert return — two tributaries feeding directly into the console buses. Mix A → Pueblo Bank C, Mix B → Pueblo Bank D. External stereo input is open, patchable per session.',
    engineering: 'API 2510 input op-amps, 2520 output op-amps (MIL-Spec). Transformer-coupled output per bus. Estimated +28 dBu max I/O, −108 dBu noise floor (from −112 dBr SNR), 0.02% THD. Per-channel: 31-step detented level, continuously variable pan with center detent, insert send/return (always active), assignable to Mix A and/or Mix B. Bus inserts: Mix A return normalled from D-Box+ sum L/R, Mix B return normalled from OTB transformer L/R (both full normal). External stereo input: patchable, no default normal. 4-segment LED metering per channel, analog VU meters on output.',
  },
  {
    id: 'pueblo',
    name: 'Pueblo Audio HJ482',
    vendor: 'Pueblo Audio',
    role: 'cascade-destination',
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
    feeds_into: [],                   // all bank outputs are patchable — Bank D typically → mastering chain → AD+
    receives_from: ['api'],           // Bank C ← API Mix A, Bank D ← API Mix B
    character: 'The lowest distortion, widest headroom, quietest unit in the system. Banks A and B (16 inputs each) are independent open banks — patchable per session for parallel taps, outboard returns, or any source. Bank C receives API Mix A. Bank D receives API Mix B. Banks do NOT cascade A→D by default; A and B provide independent stereo outputs. Bank D output is typically patched to the mastering chain and then to the AD+ for printing, but nothing is hardwired past this point.',
    engineering: 'Active summing. +29 dBu max I/O, −98 dBu noise, 0.00094% THD at +22 dBu, 127 dB dynamic range, crosstalk −103 dB, bandwidth DC–1 MHz. 12 kΩ input impedance. 4 banks × 8 inputs, each bank with independent stereo L/R output. Banks can cascade A→B→C→D internally when jumpered, but default configuration keeps A and B independent. Optional switchable transformers on Bank D output.',
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
    feeds_into: ['dbox-monitor'],     // AES out → D-Box+ AES input (hardwired)
    receives_from: [],                // analog input is patchable — end of mastering chain, no default normal
    character: 'The point of no return. Two stereo inputs (A/B selectable) — patchable, the end of the mastering chain. Whatever the session\'s final analog processing is, it terminates here. Mastering-grade A/D conversion with JetPLL jitter elimination. Optional X-Former insert adds Hammond transformers for deliberate iron coloration on the final capture. AES output hardwired to Aurora AES input.',
    engineering: `Input transformer always in path. AES output transformer. Optional X-Former insert adds 2 custom Hammond transformers. JetPLL jitter elimination. Clip Guard. Zoomable meters (top 10 dB). EMPHASIS circuit (shelving EQ/compressor for 2nd-order harmonic distortion). Dual AES, ADAT, SPDIF optical + coax outputs. +24 dBu max input. Analog input L/R is patchable on the patchbay — no default normal. Typically receives Pueblo Bank D output via mastering chain (patched per session). AES out hardwired to Aurora AES in.`,
  },
];

// ── Cascade Connections (default normalled state) ──

export const cascadeConnections: CascadeConnection[] = [
  // Tracking path
  { id: 'cc-mic-to-preamp', from_node_id: 'mic-ties', to_node_id: 'preamp-inputs', normal_type: 'full-normal', label: 'Mic tie → Preamp input', active_in: ['tracking'] },
  { id: 'cc-preamp-to-aurora', from_node_id: 'preamp-outputs', to_node_id: 'aurora', normal_type: 'half-normal', label: 'Preamp output → Aurora AD input', active_in: ['tracking'] },

  // Monitor path (always active) — digital until D-Box+ DA
  { id: 'cc-daw-to-aurora-tb', from_node_id: 'daw', to_node_id: 'aurora', normal_type: 'hardwired', label: 'DAW → Thunderbolt → Aurora(n)', active_in: ['tracking', 'mixing'] },
  { id: 'cc-aurora-aes-to-dbox', from_node_id: 'aurora', to_node_id: 'dbox-monitor', normal_type: 'hardwired', label: 'Aurora AES monitor out → D-Box+ AES in', active_in: ['tracking', 'mixing'] },
  { id: 'cc-dbox-to-speakers', from_node_id: 'dbox-monitor', to_node_id: 'speakers', normal_type: 'hardwired', label: 'D-Box+ → Speaker selection', active_in: ['tracking', 'mixing'] },

  // Mixing path — DAW outputs to analog domain
  { id: 'cc-aurora-da-to-tilt', from_node_id: 'aurora', to_node_id: 'tilt-eq', normal_type: 'half-normal', label: 'Aurora DA 1–16 → Tilt EQ inputs (half-normal)', active_in: ['mixing'] },
  { id: 'cc-tilt-to-api', from_node_id: 'tilt-eq', to_node_id: 'api', normal_type: 'full-normal', label: 'Tilt EQ outputs → API ch 1–16 line inputs', active_in: ['mixing'] },
  { id: 'cc-aurora-da-to-otb', from_node_id: 'aurora', to_node_id: 'otb', normal_type: 'full-normal', label: 'Aurora DA 17–24 → OTB ch 1–8', active_in: ['mixing'] },

  // Mixing path — tributary inserts into console buses
  { id: 'cc-dbox-sum-to-api-mixa', from_node_id: 'dbox-sum', to_node_id: 'api', normal_type: 'full-normal', label: 'D-Box+ sum L/R → API Mix A insert return', active_in: ['mixing'] },
  { id: 'cc-otb-xfmr-to-api-mixb', from_node_id: 'otb', to_node_id: 'api', normal_type: 'full-normal', label: 'OTB transformer L/R → API Mix B insert return', active_in: ['mixing'] },

  // Mixing path — console bus inserts (per-channel)
  { id: 'cc-api-ch-insert', from_node_id: 'api', to_node_id: 'api', normal_type: 'half-normal', label: 'API ch 1–16 insert send → return (half-normalled)', active_in: ['mixing'] },

  // Mixing path — console to Pueblo
  { id: 'cc-api-mixa-to-pueblo-c', from_node_id: 'api', to_node_id: 'pueblo', normal_type: 'full-normal', label: 'API Mix A L/R → Pueblo Bank C', active_in: ['mixing'] },
  { id: 'cc-api-mixb-to-pueblo-d', from_node_id: 'api', to_node_id: 'pueblo', normal_type: 'full-normal', label: 'API Mix B L/R → Pueblo Bank D', active_in: ['mixing'] },

  // Print path — hardwired digital return
  { id: 'cc-adplus-to-aurora-aes', from_node_id: 'adplus', to_node_id: 'aurora', normal_type: 'hardwired', label: 'AD+ AES out → Aurora AES in', active_in: ['mixing'] },
];

// ── D-Box+ Functional Zones ──
// The D-Box+ contains two independent circuits in one chassis.
// Each zone is inspectable separately.

export const nodeZones: NodeZone[] = [
  {
    id: 'dbox-monitor',
    node_id: 'dbox-sum',
    label: 'Monitor Controller',
    accent: '#14b8a6',
    musician: 'Everything you hear passes through this section. Five selectable sources — AES is the primary digital path from the Aurora, but you can switch to the analog summing bus, a patchable analog input, USB, or Bluetooth to compare references instantly. Three speaker sets let you check translations across different perspectives without replugging anything. Talkback, mono, dim, and mute are one button press away.',
    engineer: 'Five-input monitor selector: AES (primary), stereo analog (patchable), SUM bus, USB, Bluetooth. Three speaker outputs with independent per-set level trim and instant switching. Talkback mic with momentary or latching. Mono fold-down, dim (−20 dB), and mute on the front panel. The monitor section is electrically independent from the summing section — no signal bleed between the two.',
    technical: 'Monitor path: relay-switched input selector (5 sources), relay-switched speaker output selector (3 sets). Per-speaker-set level trim via precision potentiometer. Talkback: built-in condenser mic, routed to speaker outputs in talkback mode. Mono: L+R electrical sum. Dim: −20 dB pad. Signal path is fully balanced, transformerless. No published specs for the monitor section alone — noise/THD figures refer to the summing section.',
    specs: [
      { label: 'Inputs', value: '5 (AES, Analog, SUM, USB, BT)' },
      { label: 'Speaker outputs', value: '3 sets, per-set trim' },
      { label: 'Features', value: 'Talkback, mono, dim, mute' },
      { label: 'Switching', value: 'Relay-based' },
    ],
  },
  {
    id: 'dbox-summing',
    node_id: 'dbox-sum',
    label: 'Summing Section',
    accent: '#22c55e',
    musician: 'Eight analog inputs — four stereo pairs — summed down to a single stereo output. Patch anything into it per session: Pueblo bank outputs, outboard returns, Tascam, whatever. The stereo sum output normals to the API Mix A insert return — it feeds the console\'s main bus as a tributary. Also listenable in isolation by pressing the SUM button on the monitor section.',
    engineer: 'Eight balanced inputs (4 stereo pairs) with per-input level control. Active transformerless summing to stereo balanced output. Sum output full-normalled to API Mix A insert return on the patchbay. The SUM monitor source lets you audition just this bus — useful for checking the tributary in isolation before it enters the console.',
    technical: 'Active summing, transformerless topology. 8 balanced inputs at +27 dBu max. Per-input level via precision potentiometer. Stereo balanced output at +27 dBu max. Noise floor −90 dBu (22 Hz–22 kHz). THD 0.0019% at +4 dBu, 1 kHz. Crosstalk −114 dB. IMD 0.0020%. Independent circuit from monitor section — separate power rail references.',
    specs: [
      { label: 'Max I/O', value: '+27 dBu' },
      { label: 'Noise floor', value: '−90 dBu' },
      { label: 'THD', value: '0.0019% @ +4 dBu' },
      { label: 'Crosstalk', value: '−114 dB' },
      { label: 'IMD', value: '0.0020%' },
      { label: 'Inputs', value: '8 (4 stereo pairs)' },
      { label: 'Output', value: 'Stereo balanced' },
    ],
  },
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
    id: 'tap-dbox-sum',
    label: 'D-Box+ Sum',
    how: 'D-Box+ SUM button',
    what_you_hear: 'Whatever is patched into the D-Box+ summing inputs — Pueblo bank outputs, outboard returns, etc. — summed to stereo, before it enters the API Mix A insert',
    listen_for: 'Is the tributary balance right? Are the parallel returns clean? Isolate the D-Box+ contribution before it merges with the console bus.',
  },
  {
    id: 'tap-otb-xfmr',
    label: 'OTB Transformer',
    how: 'Mute OTB channel faders, listen to ext input only (or vice versa)',
    what_you_hear: 'Aurora DA 17–24 summed through the TX-100 transformer — the iron character bus before it enters API Mix B insert',
    listen_for: 'How the transformer colors the overflow DAW outputs. Warmth, cohesion, transient rounding. Compare transformer out vs clean monitor out.',
  },
  {
    id: 'tap-context',
    label: 'Full Mix',
    how: 'D-Box+ AES button (default monitoring)',
    what_you_hear: 'Everything together — DAW outputs, bus processing, tributary merges, the full cascade printed through the AD+',
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
