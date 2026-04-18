import type { Converter, SummingUnit, Monitor, PatchRow } from '../types/studio';

export const converters: Converter[] = [
  {
    id: 'conv-dangerous-dbox',
    name: 'Dangerous D-Box+',
    vendor: 'Dangerous Music',
    type: 'DAC',
    channels: 8,
    dynamic_range_db: 118,
    sample_rates: [44100, 48000, 88200, 96000, 176400, 192000],
    bit_depths: [16, 24],
    clocking: 'Wordclock slave (from Aurora). Monitor controller + summing.',
    rack_units: 1,
    em_zone: 'B',
    character: 'System gatekeeper. Everything you hear passes through this. Monitor controller + D/A + analog summing in one.',
    engineering: 'DA output stage drives the monitor path. Any interference here contaminates every listening decision. Wordclock chain: Aurora → AD+ → D-Box+ (inches of cable).',
  },
  {
    id: 'conv-dangerous-adplus',
    name: 'Dangerous AD+',
    vendor: 'Dangerous Music',
    type: 'ADC',
    channels: 2,
    dynamic_range_db: 121,
    sample_rates: [44100, 48000, 88200, 96000, 176400, 192000],
    bit_depths: [16, 24],
    clocking: 'Wordclock slave (from Aurora). Final A/D stage.',
    rack_units: 1,
    em_zone: 'B',
    character: 'The point of no return. Mastering-grade A/D conversion. Resolves signals below −1µV.',
    engineering: 'Analog input stage resolves below −1µV. 121+ dB dynamic range. Any interference is permanently digitized. The most critical analog engineering point in the studio.',
  },
  {
    id: 'conv-lynx-aurora',
    name: 'Lynx Aurora(n)',
    vendor: 'Lynx Studio Technology',
    type: 'ADDA',
    channels: 32,
    dynamic_range_db: 120,
    sample_rates: [44100, 48000, 88200, 96000, 176400, 192000],
    bit_depths: [16, 24, 32],
    clocking: 'Wordclock master. TB3 optical to computer.',
    rack_units: 1,
    em_zone: 'B',
    character: 'Primary multi-channel converter. 24 analog inputs, 24 analog outputs, plus 8 digital channels (AES or ADAT, not both). 32 channels max to DAW via Lynx routing software. Wordclock master for the entire studio.',
    engineering: 'TB3 controller at 40Gbps creates RF. SMPS cycling at 50–500kHz. Wordclock master — clock jitter performance is critical. TB3 optical crosses room to computer (immune to EM). 24 analog AD + 24 analog DA + 8 AES (or 8 ADAT, mutually exclusive). Hard cap: 32 channels routable to DAW via Lynx software.',
  },
  {
    id: 'conv-tascam-studio-bridge',
    name: 'Tascam Studio Bridge',
    vendor: 'Tascam',
    type: 'ADDA',
    channels: 8,
    dynamic_range_db: 110,
    sample_rates: [44100, 48000, 88200, 96000],
    bit_depths: [16, 24],
    clocking: 'No wordclock chain participation. Aggregate clocking only (not production-stable).',
    rack_units: 1,
    em_zone: 'B',
    character: 'Off-patchbay floater. Mobile/writing session/overflow rig. Cannot clock to the main Aurora wordclock chain without aggregate routing, which is not stable for production. Records to internal SD card for jitter-free import. Not part of the normalled studio topology.',
    engineering: 'ADDA converter. 24 inputs with internal summing to ch 23/24. Can feed D-Box+ summing via direct cable for session-specific use. Off the main patchbay and clock chain entirely.',
  },
];

export const summingUnits: SummingUnit[] = [
  {
    id: 'sum-pueblo-hj482',
    name: 'Pueblo HJ482',
    vendor: 'Pueblo Audio',
    inputs: 32,
    outputs: 8,
    rack_units: 2,
    character: '32-input active summing across four banks of 8. Banks A and B are independent open inputs (patchable per session). Bank C receives API Mix A. Bank D receives API Mix B. Banks A and B do NOT cascade to D by default — they provide independent stereo outputs for parallel taps. Optional switchable transformers on Bank D output.',
    engineering: 'Active summing. +29 dBu max I/O, −98 dBu noise, 0.00094% THD at +22 dBu, 127 dB dynamic range, crosstalk −103 dB, bandwidth DC–1 MHz. 12 kΩ input impedance. 4 banks × 8 inputs, each bank with independent stereo L/R output. Banks can cascade A→B→C→D internally when jumpered, but default configuration keeps A and B independent.',
  },
  {
    id: 'sum-tonelux-otb',
    name: 'Tonelux OTB-16',
    vendor: 'Tonelux',
    inputs: 16,
    outputs: 2,
    rack_units: 2,
    character: 'DAW output overflow summing (Aurora DA 17–24 on ch 1–8) plus external stereo input. TX-100 output transformer stamps iron character onto the result. Transformer out normals to API Mix B insert return — stacked iron path (OTB TX-100 → API 2520 → API output transformer).',
    engineering: 'TX-240 / TX-260 discrete op-amp summing topology. TX-100 output transformer on main XLR. Per-channel level and pan controls. DB-25 inputs at +4 dBu nominal. External stereo input on balanced TRS (patchable, adds noise). Transformer out + clean monitor out.',
  },
  {
    id: 'sum-api-asm164',
    name: 'API ASM164',
    vendor: 'API',
    inputs: 16,
    outputs: 4,
    rack_units: 4,
    character: 'The brain of the mix. 16 channels from DAW via Tilt EQs, with 31-step detented level, pan, and bus assignment. API 2520 output op-amps and iron output transformers add punch, midrange authority, and harmonic density. Insert sends on every channel are always live. Mix A and Mix B bus outputs, each with their own insert send/return. External stereo input (patchable per session).',
    engineering: 'API 2510 input op-amps, 2520 output op-amps (MIL-Spec). Transformer-coupled output per bus. Per-channel: 31-step detented level, continuously variable pan with center detent, insert send/return (always active), assignable to Mix A and/or Mix B. Bus inserts: D-Box+ sum L/R normals to Mix A insert return (full normal), OTB transformer L/R normals to Mix B insert return (full normal). Mix A → Pueblo Bank C, Mix B → Pueblo Bank D (full normal).',
  },
];

export const monitors: Monitor[] = [
  { id: 'mon-hedd-type20', name: 'HEDD Type 20 MKII', vendor: 'HEDD', type: 'main', powered: true, character: 'Main monitors flanking window. AMT (Air Motion Transformer) tweeter gives extended, detailed highs. Internal ICEpower Class D amps.' },
  { id: 'mon-hedd-sub8', name: 'HEDD Sub 8', vendor: 'HEDD', type: 'sub', powered: true, character: 'Centered below/between HEDDs. Extends low-frequency monitoring.' },
  { id: 'mon-ns10', name: 'Yamaha NS-10', vendor: 'Yamaha', type: 'near', powered: false, character: 'The near-field reference. If it sounds good on NS-10s, it sounds good everywhere. Positioned inside the HEDDs.' },
  { id: 'mon-auratone', name: 'Auratone 5C', vendor: 'Auratone', type: 'mono', powered: false, character: 'Single mono reference. "The Horror Box." If the vocal cuts through this, it cuts through anything.' },
];

export const patchRows: PatchRow[] = [
  // ── BAY 1: TRACKING — Mic to Preamp (full normal) ──
  { id: 'row-mic-ties', label: 'Mic Tie Lines', order: 1, normalled_to: 'row-preamp-in', category: 'signal-path', description: 'Mamba tie lines from tracking room/studio floor. Each point corresponds to a mic position. Full-normalled to preamp inputs.' },
  { id: 'row-preamp-in', label: 'Preamp Inputs', order: 2, category: 'signal-path', description: 'Input to the Tower. Full-normalled from mic ties. Break normal to route from other sources.' },

  // ── BAY 2: TRACKING — Preamp to Converter (half normal) ──
  { id: 'row-preamp-out', label: 'Preamp Outputs', order: 3, normalled_to: 'row-aurora-ad-in', half_normal: true, category: 'signal-path', description: 'Output of each preamp channel. Half-normalled to Aurora AD inputs — preamp drives converter directly, preserving individual preamp identity. Tap/mult without breaking the tracking feed.' },
  { id: 'row-aurora-ad-in', label: 'Aurora AD Inputs', order: 4, category: 'signal-path', description: 'Lynx Aurora(n) analog-to-digital inputs 1–24. Default tracking destination. Receives preamp outputs via half-normal.' },

  // ── BAY 3: MIXING — DAW Output to Tilt (half normal) ──
  { id: 'row-aurora-da-out', label: 'Aurora DA Outputs', order: 5, normalled_to: 'row-tilt-in', half_normal: true, category: 'signal-path', description: 'Lynx Aurora(n) digital-to-analog outputs 1–16. DAW output to analog domain. Half-normalled to Tilt EQs — break normal to route Tilts elsewhere and jump DAW output directly to API.' },
  { id: 'row-tilt-in', label: 'Tilt EQ Inputs', order: 6, category: 'signal-path', description: 'Tonelux Tilt EQ inputs. Tilt #1 ch 1–8, Tilt #2 ch 9–16. Half-normalled from Aurora DA 1–16. Can be patched from other sources.' },

  // ── BAY 4: MIXING — Tilt / DAW to Console (full normal) ──
  { id: 'row-tilt-out', label: 'Tilt EQ Outputs', order: 7, normalled_to: 'row-api-line-in', category: 'signal-path', description: 'Tonelux Tilt EQ outputs. Full-normalled to API ASM164 line inputs. Tilt #1 ch 1–8 → API ch 1–8, Tilt #2 ch 9–16 → API ch 9–16.' },
  { id: 'row-api-line-in', label: 'API Line Inputs', order: 8, category: 'signal-path', description: 'API ASM164 ch 1–16 line inputs. Full-normalled from Tilt EQ outputs. Aurora DA 17–24 full-normalled to OTB ch 1–8 (separate strip on same bay).' },
  { id: 'row-aurora-da-otb', label: 'Aurora DA 17–24', order: 9, normalled_to: 'row-otb-in', category: 'signal-path', description: 'Aurora DA outputs 17–24. Full-normalled to Tonelux OTB channels 1–8.' },
  { id: 'row-otb-in', label: 'OTB Inputs 1–8', order: 10, category: 'signal-path', description: 'Tonelux OTB-16 channel inputs 1–8. Full-normalled from Aurora DA 17–24.' },

  // ── BAY 5: API Channel Inserts (half normal pairs) ──
  { id: 'row-insert-send', label: 'API Insert Sends', order: 11, half_normal: true, category: 'signal-path', description: 'Half-normalled insert send/return pairs on API ch 1–16 plus Mix A and Mix B bus inserts. Ch 1–16 sends are always live taps. Mix A insert return: D-Box+ sum L/R (full normal). Mix B insert return: OTB transformer L/R (full normal).' },
  { id: 'row-insert-return', label: 'API Insert Returns', order: 12, category: 'signal-path', description: 'Insert returns for API ch 1–16 and bus inserts. Patch outboard between send and return. Mix A return normalled from D-Box+ sum, Mix B return normalled from OTB transformer out.' },

  // ── OUTBOARD POOL (choosable processors — no default normals) ──
  { id: 'row-dynamics', label: 'Dynamics', order: 13, category: 'outboard-pool', description: 'All compressors, limiters, gates. Patch between insert sends and returns, or use for parallel processing.' },
  { id: 'row-eq', label: 'Equalizers', order: 14, category: 'outboard-pool', description: 'All equalizers except Tilts. Langevin MMP, Retro 2A3, Iron Age V2, Chandler Tone Control ×2, Tonelux Equalux.' },
  { id: 'row-spatial', label: 'Spatial / Harmonic', order: 15, category: 'outboard-pool', description: 'Stereo wideners and low-end harmonic enhancers. No static normal destination; patch where needed.' },
  { id: 'row-fx', label: 'Time-Based FX', order: 16, category: 'outboard-pool', description: 'Reverbs and multi-FX. Generally run as parallel return processors, patched per session.' },

  // ── BAY 6: Summing Sources → Pueblo ──
  { id: 'row-api-mix-out', label: 'API Mix Bus Outputs', order: 17, category: 'summing', description: 'API Mix A L/R and Mix B L/R bus outputs. Mix A full-normalled to Pueblo Bank C inputs 1–2. Mix B full-normalled to Pueblo Bank D inputs 1–2.' },
  { id: 'row-summing-sources', label: 'Summing Tributary Outputs', order: 18, category: 'summing', description: 'OTB transformer out L/R (normalled to API Mix B insert return). D-Box+ sum out L/R (normalled to API Mix A insert return). Pueblo Bank A–D stereo outputs. All available as patchbay sources.' },
  { id: 'row-pueblo-in', label: 'Pueblo Inputs', order: 19, category: 'summing', description: 'Pueblo HJ482 inputs: Bank A (1–8) and Bank B (9–16) are open — patchable per session. Bank C (17–24) inputs 1–2 normalled from API Mix A L/R. Bank D (25–32) inputs 1–2 normalled from API Mix B L/R. Remaining inputs on C and D are open.' },
  { id: 'row-pueblo-out', label: 'Pueblo Outputs', order: 20, category: 'summing', description: 'Pueblo HJ482 bank stereo outputs: A L/R, B L/R, C L/R, D L/R. All patchable. Bank D output is typically patched to mastering chain → AD+ per session.' },

  // ── BAY 7: Print + Monitor I/O ──
  { id: 'row-dbox-io', label: 'D-Box+ I/O', order: 21, category: 'summing', description: 'D-Box+ summing inputs (8), sum output L/R, analog monitor input L/R, line output L/R, cue output L/R. Sum output normalled to API Mix A insert return (full normal). All other points patchable per session.' },
  { id: 'row-ad-daw', label: 'AD+ / Print Path', order: 22, category: 'digital', description: 'Dangerous AD+ analog input L/R — patchable, end of mastering chain (no default normal). AD+ AES out hardwired to Aurora AES in. Digital output → Aurora(n) → DAW via TB3.' },
];
