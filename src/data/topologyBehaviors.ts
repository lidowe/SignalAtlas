import type { TopologyBehavior } from '../types/studio';

// ── Topology Behaviors: Consequence-Chain Knowledge ──
//
// Each entry traces: mechanism → sonic character → musical context
// This is NOT prescriptive ("use FET on drums"). It's causal reasoning:
//   What the circuit does → what that sounds like → where that's valued
//
// Individual units modify or extend their topology's baseline.

export const topologyBehaviors: TopologyBehavior[] = [

  // ═══════════════════════════════════════════════════
  // COMPRESSOR TOPOLOGIES
  // ═══════════════════════════════════════════════════

  {
    id: 'topo-variable-mu',
    family: 'compressor',
    topology: 'variable-mu',
    label: 'Variable-Mu Tube',
    essence: 'Tube transconductance responds naturally to signal, producing smooth, program-dependent compression without external detection.',
    mechanism: {
      musician: 'A vacuum tube\'s resistance changes as signal heats it, smoothly reducing gain without abruptness. The more signal, the warmer the tube gets, the higher its resistance becomes — like a gentle hand adjusting the volume.',
      engineer: 'A dual-triode gain cell in which transconductance changes with cathode current. The tube\'s bias point shifts with input level, altering gain continuously and program-dependently. Attack and release emerge from the thermal and electrical time constants of the tube heating/cooling cycle.',
      technical: 'The tube\'s operating point moves along its transconductance curve as input current increases. Mu varies nonlinearly with input level, producing soft-knee behavior naturally. Attack is typically 10–100 ms (thermally limited), release 250 ms–1 s (cooling-limited). No separate detector circuit is required.',
    },
    sonic_character: {
      musician: 'The control feels effortless and organic, responding to overall signal weight rather than peaks. Harmonic content naturally enriches as the tube works harder. The compression itself becomes tonal rather than obvious.',
      engineer: 'Gain reduction curves smoothly without steps or mode changes. The same unit behaves differently based on input spectrum and density — a mix of bass hits versus sparse vocals produces entirely different attack/release response. This makes recall and repeatability require skill.',
      technical: 'The feedback mechanism is inherent to the tube\'s transconductance, eliminating external sensing circuits. Program dependence arises from the signal spectrum affecting thermal time constants. Compression ratio increases gradually with input level rather than stepping at fixed ratios.',
    },
    valued_in: [
      'dense vocal arrangements where individual tracks need weight without competing for space',
      'bass tracking where tone variation across the performance is part of the musicality',
      'acoustic instruments where harmonic dimension supports the performance rather than constraining it',
      'full-mix bus work when character and musicality matter more than numeric precision',
    ],
    less_suited_to: [
      'transient-heavy material requiring precise, repeatable peak control',
      'surgical sidechain routing or external signal-dependent compression',
      'sessions demanding exact numerical recall across dates',
      'sources where any tonal addition conflicts with the source\'s own character intent',
    ],
    unit_variance: 'Significant. Tube models, bias points, output transformer selection, and feedback network impedance produce substantially different compression contours. Two variable-mu units with identical topology may feel like different compressor families.',
  },

  {
    id: 'topo-fet-tube',
    family: 'compressor',
    topology: 'fet-tube',
    label: 'FET-Tube Hybrid',
    essence: 'JFET provides surgical gain reduction; tube stage adds harmonic coloration, merging speed with musicality.',
    mechanism: {
      musician: 'A fast electronic switch catches and shapes transients precisely, then a tube stage warms and colors the result. The speed comes from the FET, the musicality from the tube — both benefits without either compromise.',
      engineer: 'A JFET feedback or feedforward topology handles gain reduction with microsecond-level response, while a tube stage in the signal path adds harmonic saturation. The control voltage from the envelope detector drives the FET; the tube contribution is parallel or post-reduction coloration.',
      technical: 'JFET gate voltage controls drain-source resistance, modulating gain linearly across a wide range. Tube stage adds odd-order harmonics at 2–10 kHz typically. Attack times reach 20–100 µs; release is electronically switchable, independent of program content.',
    },
    sonic_character: {
      musician: 'Transient punch from the FET combined with a warm finish from the tube. The compression feels tight and controlled without sounding thin or clinical. Attack is immediate; release is smooth rather than grabby.',
      engineer: 'The FET ensures predictable, repeatable control across different input levels. The tube stage adds observable harmonic content that can be auditioned or bypassed. Peak/RMS detection is often switchable, allowing quick moves between fast transient response and smooth average-level following.',
      technical: 'FET attack typically 20–100 µs; tube saturation onset at moderate signal level. The hybrid character is a linear combination of FET precision and tube nonlinearity. Low magnetic field despite tube content.',
    },
    valued_in: [
      'tracking vocals where both presence and warmth are priority',
      'versatile mix roles covering drums, bass, and bus work without repatching',
      'hybrid recording chains where preamp and compressor should feel sonically integrated',
      'parallel compression workflows where visible impact and tonal character are the intention',
    ],
    less_suited_to: [
      'workflows demanding purely transparent, colorless dynamic control',
      'sources requiring extreme compression ratios for problem-solving',
      'setups where the tube\'s harmonic contribution conflicts with the source\'s existing character',
      'mastering where any tonal addition is unwanted',
    ],
    unit_variance: 'Moderate. Tube model, FET type, and whether peak or RMS detection is used all matter. The tube stage position (pre-reduction or post-reduction) significantly changes perceived character.',
  },

  {
    id: 'topo-fet-1176',
    family: 'compressor',
    topology: 'fet-1176',
    label: 'FET (1176 Lineage)',
    essence: 'Peak-detecting JFET feedback compression with microsecond attack and aggressive all-buttons parallel mode.',
    mechanism: {
      musician: 'An electronic gate that snaps shut on transient peaks and lets go at precisely controlled rates. The response is faster than human hearing can follow. All-buttons mode smashes multiple control circuits simultaneously, creating an aggressive parallel compression pump.',
      engineer: 'JFET in feedback topology: the compressed output controls the FET gate voltage, reducing gain proportionally to energy above threshold. Peak detection means no averaging — instantaneous transients trigger immediate response. All-buttons mode sums multiple time-constant outputs for its signature parallel effect.',
      technical: 'Peak detector feeds FET gate voltage. Attack as fast as 20 µs; release electronically selected (50 ms–1.1 s typical). Feedback topology produces slightly smoother compression curve than feedforward. All-buttons mode parallelizes four ratio paths, creating ~4:1 effective ratio with aggressive pump character.',
    },
    sonic_character: {
      musician: 'Immediate, pushing, energizing control that makes sources pop and sit forward. The compression itself is audible and part of the tone. All-buttons mode creates signature pumping — not flattering but iconic and desirable in specific contexts.',
      engineer: 'Gain reduction meters swing visibly even on peaks that feel musically normal. Aggressive settings produce obvious compression artifacts. Settings tend to be memorable and repeatable because the control feels obvious once you hear it.',
      technical: 'Frequency-dependent due to transformer I/O and circuit nonlinearities at high compression. All-buttons parallel paths sum unequally, producing time-constant interactions that create musical harmonic emphasis.',
    },
    valued_in: [
      'upfront vocal performances where the source should sound highly compressed and pushed forward',
      'aggressive bass where compression adds momentum and forward motion as part of the tone',
      'parallel compression workflows where obvious, visible control is the creative intention',
      'drum tracking where forward-sitting punch matters more than pristine transient clarity',
    ],
    less_suited_to: [
      'invisible, forensic dynamic control — the topology is not transparent',
      'sources already edged or thin, where added aggression pushes further from the intent',
      'mastering or reference-monitoring work requiring neutrality',
      'material where any audible compression signature conflicts with the artistic goal',
    ],
    unit_variance: 'Moderate consistency within classic 1176 designs, but vintage versus boutique implementations vary in attack-time behavior, output transformer quality, and ratio selection. Input stage design in recreations creates vendor variation.',
  },

  {
    id: 'topo-optical',
    family: 'compressor',
    topology: 'optical',
    label: 'Optical (Photocell)',
    essence: 'Light-driven gain reduction with thermal lag, producing effortless, smooth compression that follows the signal like a hand on the fader.',
    mechanism: {
      musician: 'A light source brightens and dims in response to the signal; a photocell\'s resistance changes with the light, reducing volume. The photocell\'s slowness is the feature — it can\'t change instantly, creating graceful, unhurried response.',
      engineer: 'LED or electroluminescent panel modulated by signal envelope drives a photoresistive cell. The cell\'s response time (10–100 ms lag due to thermal mass) dictates attack/release behavior. Dual time-constant designs use two cells or filter networks for faster transient tracking plus slower recovery.',
      technical: 'Light intensity modulates linearly with control voltage. Photocell resistance changes nonlinearly with illumination, creating soft-knee compression naturally. Thermal time constants dominate: fast cell may respond in 10 ms, while recovery cell responds in 60 ms–1 s. No electronic detection circuit matches the cell\'s inherent lag.',
    },
    sonic_character: {
      musician: 'The source settles into place effortlessly. Bass and vocals emerge with authority and dimension without sounding compressed or pushed. Control feels musical — smooth, never jarring.',
      engineer: 'Gain reduction curves smoothly and nonlinearly; the curve becomes less steep as compression increases, producing soft-knee behavior naturally. Program-dependent — fast, dense peaks compress differently than slow, sparse signals.',
      technical: 'Attack and release are inherent to the photocell, not user-selectable. Dual time constants preserve some transient snap while allowing broader dynamics to breathe. Frequency-independent behavior because the gain cell is purely resistive.',
    },
    valued_in: [
      'upfront vocal chains where elegance and authority are equally important',
      'fingerstyle acoustic instruments where the player\'s dynamics are the performance',
      'orchestral recording where sources need cohesion without sounding controlled',
      'subjective mixing where "it sounds right" matters more than measurable repeatability',
    ],
    less_suited_to: [
      'hard transient control — slower response means some peaks pass through',
      'surgical sidechain work or external triggering',
      'workflows demanding exact numerical recall across sessions',
      'material where response time allows undesired transients to escape',
    ],
    unit_variance: 'High. Photocell type (CdS curves vary significantly), light source (warm tube-panel optics vs. faster LED), and dual-cell vs. single-cell designs produce noticeably different sonic signatures.',
  },

  {
    id: 'topo-vca-channel',
    family: 'compressor',
    topology: 'vca-channel',
    label: 'VCA Channel Strip',
    essence: 'Voltage-controlled amplifier driven by envelope detection, providing fast, surgical, predictable compression with optional coloration.',
    mechanism: {
      musician: 'An electronic volume control that responds to how loud the signal is — fast, exact, and the same every time. Feed-forward looks ahead at what\'s arriving; feedback looks at what already came out. Either way, the control is precise.',
      engineer: 'A THAT, dbx, or OTA VCA chip controlled by voltage derived from RMS or peak detection. Attack and release are electronically timed constants. Continuously variable or stepped ratio selection. The VCA itself is transparent; added saturation or transformers provide coloration.',
      technical: 'VCA gain is exponential with control voltage (20 dB/V typical). RMS detector uses precision rectifier and filter. Attack and release are first-order R-C time constants. Modern designs (THAT 2150-series) offer superior linearity.',
    },
    sonic_character: {
      musician: 'Tight, firm control that feels confident and forward. Drums hit harder, bass gets more concrete. Heavily compressed material loses none of its definition — just gets pushed.',
      engineer: 'Gain reduction behavior is identical given identical input and settings — no program dependence means full predictability and repeatability. Optional output saturation or transformer adds character that the VCA alone does not.',
      technical: 'Attack and release settable across wide ranges (1–50 ms attack, 50 ms–2 s release typical). Compression ratio continuously variable or fixed-step. Low harmonic distortion unless intentionally added via saturation stage.',
    },
    valued_in: [
      'parallel compression where obvious impact and forward presence are desired',
      'drums requiring tight, forward-sitting hit definition',
      'bass where concrete, firm bottom end is the production goal',
      'bus compression on material benefiting from audible glue without blur',
    ],
    less_suited_to: [
      'material seeking invisible, transparent dynamic management',
      'sources benefiting from the smooth lag of optical or musicality of tubes',
      'workflows where compression should feel like a hand on the fader rather than a switch',
      'extremely dense mixes where additional compression audibility adds hardness',
    ],
    unit_variance: 'Significant. VCA chip, detection topology (feed-forward vs. feedback), and any added saturation or transformer produce wide variation. Two identical VCA chips in different circuit contexts sound different.',
  },

  {
    id: 'topo-vca-bus',
    family: 'compressor',
    topology: 'vca-bus',
    label: 'VCA Bus (Stereo)',
    essence: 'Linked stereo VCA compression creating cohesive bus glue with finished polish.',
    mechanism: {
      musician: 'Two compressors wired so they respond together — whichever channel gets louder triggers both to compress equally, keeping the stereo image tight. Like a compression assistant who listens to both sides and adjusts both together.',
      engineer: 'Two VCAs with sidechain detection from the summed or highest-energy channel. The stereo link means the control voltage is derived from whichever channel exceeds threshold first — both compress proportionally. Auto-release logic may soften timing for musicality.',
      technical: 'Sidechain summed or highest-channel-triggered to drive both VCAs. Auto-release implements different time constants depending on material dynamics. Quad VCA topology common in SSL-style designs for superior linearity in balanced bridge.',
    },
    sonic_character: {
      musician: 'The stereo field compresses together, creating unified polish and "finished" presence. No single channel escapes; everything sits cohesively. The compression is a mix-shaping decision, not individual track management.',
      engineer: 'Stereo image tightens because both channels are yoked. Peaks on either side trigger symmetric gain reduction. Auto-release adapts timing, creating musicality without manual tuning per source.',
      technical: 'Quad VCA provides superior linearity in balanced bridge topology. Linked sidechain ensures symmetric response. Auto-release typically switches between multiple time constants based on envelope characteristics.',
    },
    valued_in: [
      'mix buses where finished polish and cohesion are deliberate production decisions',
      'drum buses requiring group punch and forward presence without losing clarity',
      'stem compression where material convergence is wanted across grouped sources',
      'finaling where obvious shaping is acceptable and desired',
    ],
    less_suited_to: [
      'transparent mastering where absolute neutrality is paramount',
      'material requiring individual channel dynamics to remain independent',
      'workflows where subtle, barely-audible control is preferred to finished snap',
      'highly dynamic material where bus compression causes perceptible level riding',
    ],
    unit_variance: 'Moderate. VCA implementation, sidechain detection approach, and auto-release tuning change character. The ratio and attack/release ranges affect how obviously the compressor shapes the bus.',
  },

  {
    id: 'topo-diode-bridge',
    family: 'compressor',
    topology: 'diode-bridge',
    label: 'Diode Bridge',
    essence: 'Balanced bridge topology with inherent harmonic character, producing warm, musical compression that adds stature and weight.',
    mechanism: {
      musician: 'A balanced circuit where impedance changes with control voltage — like a volume control that adds color as it works. The transformer in and out adds vintage warmth. The result is compression that makes everything bigger, not just quieter.',
      engineer: 'Four matched diodes arranged as a bridge. Control voltage unbalances the bridge, changing impedance smoothly and harmonically. Transformer-coupled I/O adds additional saturation and upper-midrange presence. Push-pull balanced topology rejects common-mode noise.',
      technical: 'Diode bridge impedance is a nonlinear function of control voltage, producing soft-knee behavior naturally. Transformer saturation adds 2nd and 3rd-order harmonics. The gain cell is not separate from harmonic coloration — they\'re one phenomenon.',
    },
    sonic_character: {
      musician: 'Dense, warm, thickening compression that adds size and importance to everything it touches. The tone becomes rounder, fuller, heavier. Bass-end impact increases. Nothing sounds thin or edgy after passing through.',
      engineer: 'Harmonic density increases under compression. Transformer I/O adds top-end smoothness and 2–4 kHz presence. The circuit is smoothly nonlinear — soft-knee is natural, not engineered. Control is gentle and musical, not aggressive.',
      technical: 'Harmonic distortion rises with control voltage. Transformer saturation dominant above 100 Hz; diode-bridge nonlinearity shapes midrange. The two effects are inseparable — softness and harmonic content are the same phenomenon.',
    },
    valued_in: [
      'dense vocal arrangements where sources need forward weight and stature',
      'full-mix compression where the goal is glue and warmth rather than transient control',
      'drum buses needing bottom-end gravitas and unified punch without losing snap',
      'orchestral or full-band recording where blended warmth helps cohesion',
    ],
    less_suited_to: [
      'transparent, colorless compression — the circuitry always adds character',
      'material already bass-heavy, where further coloration risks muddiness',
      'surgical, problem-solving compression without tonal consequence',
      'precision sidechain work where tonal addition interferes with intent',
    ],
    unit_variance: 'High. Output transformer model is arguably more significant than the bridge itself. Diode pairs, biasing approach, and interstage transformer quality all change character substantially.',
  },

  {
    id: 'topo-zener',
    family: 'compressor',
    topology: 'zener',
    label: 'Zener Diode Limiter',
    essence: 'Nonlinear diode saturation adding harmonic excitement and peak limiting simultaneously — tone-shaping that catches peaks.',
    mechanism: {
      musician: 'A diode that conducts when the signal gets too loud, adding grit and harmonic coloration as it catches peaks. Not compression per se — more like controlled overdrive that prevents clipping while adding character.',
      engineer: 'A Zener diode in the signal path conducts aggressively once current exceeds its threshold, adding harmonic distortion and preventing voltage rise. The limiting is implicit in the nonlinear conduction — not through external feedback control.',
      technical: 'Zener voltage is fixed (typically 15–25 V); once exceeded, impedance drops exponentially, creating sharp nonlinearity. Series inductances create frequency selectivity — typically emphasizing 2–8 kHz. Harmonic profile is predominantly odd-order.',
    },
    sonic_character: {
      musician: 'Every time peaks hit threshold, the signal gets grittier and more excited. Light use adds shine and intensity; heavy use becomes aggressive distortion. The effect is tone-shaping that catches peaks, not compression that adds tone.',
      engineer: 'Gain reduction is nonlinear and frequency-dependent. Peak limiting is implicit — no attack/release to set. Harmonic content increases progressively as threshold is exceeded. The sound is aggressive, forward, and obviously processed.',
      technical: 'Once Zener voltage is exceeded, impedance drops exponentially. Series inductances create frequency selectivity. Harmonic profile is predominantly odd-order (3rd, 5th). No separate envelope detection or timing circuits.',
    },
    valued_in: [
      'drums requiring obvious character, weight, and aggressive presence',
      'bass where tonal danger and energy are part of the performance intention',
      'aggressive rock, metal, and punk production where compression distortion is sonically correct',
      'creative processing where attitude overrides transparency',
    ],
    less_suited_to: [
      'transparent, clinical dynamic control — the circuit always colors',
      'delicate or pristine recording seeking invisibility',
      'material where frequency-dependent saturation conflicts with other tone-shaping',
      'workflows where accuracy or repeatability matters more than character',
    ],
    unit_variance: 'High. Specific diode models, series/parallel impedance, temperature coefficients, and surrounding circuit topology all change character significantly. Zener designs are rarely identical.',
  },

  {
    id: 'topo-discrete-transistor',
    family: 'compressor',
    topology: 'discrete-transistor',
    label: 'Discrete Transistor',
    essence: 'All-transistor gain cell with flexible detection blending, offering wide character range from punchy to smooth without mode-switching.',
    mechanism: {
      musician: 'Individual transistors wired as a continuously variable volume control, often with a blend between responding to peaks versus overall signal weight. This blend is a real musical lever — you can dial between punchy and smooth without changing modes.',
      engineer: 'Individual BJTs or JFETs configured as a gain cell. Detection is continuously blendable — mixing peak and RMS responses via blend potentiometer. The control signal drives the transistor bias point, modulating output impedance.',
      technical: 'Transistor gain modulation via changes in input or output impedance. Blended detection: fast peak detector summed with slow RMS detector via potentiometer creates any response from peak-only to RMS-only. Soft-knee compression emerges naturally from impedance variation.',
    },
    sonic_character: {
      musician: 'Wide character range depending on how the blend is voiced — from fast and punchy to smooth and musical. The blend control becomes a creative tool. The compression is usually refined rather than rough.',
      engineer: 'Detection blend means no hard mode switching — the compression feel glides smoothly from fast to slow. Output often exhibits gentle saturation, creating natural soft-knee behavior.',
      technical: 'Blended detection uses summed detector signals — continuously variable ratio of peak-to-RMS. Temperature sensitivity is moderate. Linearity is good but not as refined as modern IC designs.',
    },
    valued_in: [
      'versatile mix roles where one unit needs to cover multiple compressor personalities',
      'tracking where sources move between needing fast control and smooth relaxation',
      'creative compression where the blend control is a real musical lever',
      'sessions requiring subtle, present compression that adapts to material naturally',
    ],
    less_suited_to: [
      'setups seeking iconic character tone — discrete designs typically aim for flexibility',
      'workflows requiring microsecond-speed response — transistor designs tend to be slightly slower',
      'productions where a signature sound is the entire point rather than adaptability',
      'forensic problem-solving where surgical, predictable control is paramount',
    ],
    unit_variance: 'Extremely high. Transistor selection, output impedance design, bias circuitry, and overall approach create substantial variance. Two all-discrete compressors may sound unlike each other despite nominally the same topology.',
  },

  {
    id: 'topo-ss-limiter',
    family: 'compressor',
    topology: 'ss-limiter',
    label: 'Solid-State Peak Limiter',
    essence: 'Transformerless, transparent peak limiting with sub-millisecond attack — pure functional protection without personality.',
    mechanism: {
      musician: 'A fast electronic wall that peaks can\'t climb over. Anything above threshold gets stopped cold without coloring what\'s underneath. Invisible unless needed.',
      engineer: 'Transformerless Class A solid-state design with true peak detection and variable release time. Attack is inherent to the detection circuit (<1 ms). Gain reduction is linear and calculated to prevent clipping without adding harmonic content.',
      technical: 'Peak detector using precision rectifier and comparator. Attack determined by detection bandwidth (<1 ms latency). Release user-selectable via R-C network. Gain reduction is linear (gain = input/threshold), not exponential.',
    },
    sonic_character: {
      musician: 'No sonic consequence unless needed. Peaks vanish cleanly. Normal signal passes completely untouched. Remove the signal and you\'d hear nothing — it\'s pure function.',
      engineer: 'Predictable, repeatable, transparent gain reduction. The only controls that matter are threshold and release time. Attack is fixed and optimal for peak detection.',
      technical: 'Linear gain reduction means dB reduction matches dB of overshoot. No frequency dependence. Low harmonic distortion (<0.1% THD typical even under limiting). Release typically adjustable 50 ms–2 s.',
    },
    valued_in: [
      'pre-ADC stage protecting digital conversion from clipping',
      'mastering final safety net for rogue peaks',
      'broadcast and live audio protection',
      'situations where transparent dynamic control is the entire requirement',
    ],
    less_suited_to: [
      'any role where compression character, musicality, or tone-shaping is desired',
      'subjective aesthetic work — the limiter has no personality',
      'creative impact or presence creation through compression',
      'situations where a character-adding tool is functionally required',
    ],
    unit_variance: 'Low. The job is specialized and well-understood; implementations converge on similar transparent designs. Differences are mainly release-time ranges and auto-release options.',
  },

  {
    id: 'topo-de-esser',
    family: 'compressor',
    topology: 'de-esser',
    label: 'De-Esser',
    essence: 'Spectral ratio detector targeting sibilance energy, providing transparent vocal cleanup without broad high-frequency dulling.',
    mechanism: {
      musician: 'A tool that hears specifically when a vocal gets too "s-y" or "sh-y" — it measures the ratio between sibilant frequencies and overall loudness, and only acts when sibilance becomes excessive. Like having an ear that catches only the harshness.',
      engineer: 'A VCA compressor driven by a spectral ratio detector — HPF-filtered peak detector (4–8 kHz sibilant region) divided by broadband RMS. When the ratio exceeds threshold, VCA reduces level in the HF region. Independent of absolute signal level.',
      technical: 'Sidechain uses bandpass or HPF filter peaking at sibilant frequencies. Detector computes ratio of HF energy to broadband energy. When ratio exceeds threshold, VCA attenuates either broadband or band-limited HF. Attack and release are fixed to catch individual sibilant transients.',
    },
    sonic_character: {
      musician: 'Clean, targeted sibilance management. Harsh "s" and "sh" sounds are caught without dulling the rest of the vocal. When subtle, it sounds like part of the microphone itself — just naturally less aggressive.',
      engineer: 'The sibilance-to-program ratio is the control variable, not absolute level. This prevents false triggering on loud but non-sibilant sounds. Per-transient triggering catches individual sibilant instances.',
      technical: 'HPF typically peaks at 4–8 kHz. Broadband detector averaging time determines whether sustained or transient sibilance is more responsive. Band-limited reduction creates frequency-notched effect; broadband reduction is gentler.',
    },
    valued_in: [
      'upfront vocal recordings where aggressive sibilants conflict with desired brightness',
      'broadcast and voiceover production requiring consistent vocal tone',
      'drum overheads where cymbal sizzle dominates the capture',
      'vocal arrangements where sibilance consistency matters across multiple tracks',
    ],
    less_suited_to: [
      'broad tonal shaping — it\'s a surgical fix tool, not a character tool',
      'material with fundamental frequency-balance issues where proper EQ is more direct',
      'sources where sibilance is desirable or part of the performance style',
      'problem-solving at the arrangement or performance level where de-essing masks rather than fixes',
    ],
    unit_variance: 'Moderate. Detection bandwidth (4 kHz vs. 8 kHz target), HF peak Q, and whether reduction is broadband or band-limited all affect sonic impact significantly.',
  },

  {
    id: 'topo-spectral',
    family: 'compressor',
    topology: 'spectral',
    label: 'Spectral Processor',
    essence: 'Dynamic spectral processing across frequency bands, adding tonal polish and depth enhancement without traditional compression dynamics.',
    mechanism: {
      musician: 'A processor that listens to the whole frequency spectrum and adjusts it dynamically — adding shimmer on top, tightening mud in the middle, refining the bass. Like a mastering EQ that moves itself based on what\'s happening.',
      engineer: 'Spectral companding: frequency-selective compression and expansion applied per band, with band-dependent detection. Noise becomes less audible as a byproduct of the spectral shaping. Frequency bands adapt their gain based on signal content.',
      technical: 'Multiband envelope detection per frequency band (typically 4–10 bands). Compression applied to quiet regions (increases SNR), expansion to loud regions (prevents per-band saturation). Non-linear frequency response emphasizes presence and treble.',
    },
    sonic_character: {
      musician: 'Material sounds larger, deeper, more polished without being obviously compressed. The tonal enhancement is perceptually subtle but the overall effect is refined and expensive-sounding. Noise floors vanish gradually rather than obviously.',
      engineer: 'Each frequency band adapts independently. The effect is contextual — noisy program sounds cleaned; clean program sounds enhanced. Noise reduction is a byproduct, not the primary goal.',
      technical: 'Noise floor reduced by frequency-selective compression in quiet regions. Presence peak (2–5 kHz) typically emphasized. Treble extension smoother. The process is broadband, symmetric, and designed around analog recording workflow.',
    },
    valued_in: [
      'analog recording chains seeking the polished sheen of classic tape-era production',
      'mastering or mix-finalization where spectral polish is part of the aesthetic',
      'tape-centric workflows where encode/decode processing is part of the signal chain',
      'situations where noise reduction is wanted without sounding like compression',
    ],
    less_suited_to: [
      'per-track recording where the encode/decode dance has no systemic foundation',
      'digital-native workflows where the analog-era context doesn\'t apply',
      'material already over-processed or suffering from fundamental tonal issues',
      'setups where any spectral shaping conflicts with the intended mix presentation',
    ],
    unit_variance: 'Moderate. Specific spectral analysis bands, detection time constants, encode/decode matching, and hardware calibration all affect character. Analog spectral processing designs vary based on individual band implementations.',
  },

  {
    id: 'topo-gate',
    family: 'compressor',
    topology: 'gate',
    label: 'Noise Gate',
    essence: 'Threshold-based muting with frequency-conscious keying for clean source isolation and creative gating effects.',
    mechanism: {
      musician: 'A switch that opens to let signal through when loud enough, then closes to silence it when signal falls below threshold. Frequency-conscious triggering lets the gate listen only to certain frequencies — "only open for kick drum, ignore cymbals."',
      engineer: 'A VCA or electronic switch controlled by threshold detector. Above threshold opens the gate; below mutes or attenuates. Frequency-conscious key input with HPF and LPF in the sidechain allows triggering on specific frequency ranges. Range control determines full mute versus partial attenuation.',
      technical: 'Threshold comparator triggers opening. Attack typically 5 µs–2 ms. Release typically 5 ms–2 s. Frequency-conscious keying uses optional bandpass filters in the sidechain. Hysteresis prevents chatter near threshold.',
    },
    sonic_character: {
      musician: 'Clean, binary behavior — signal is either open or closed. Frequency-conscious keying prevents false triggers. The gate itself is transparent unless timing becomes audible, cutting off natural decay.',
      engineer: 'Room tone, noise, and leakage disappear below threshold. Trailing decay and reflections are cleanly removed. Frequency-aware triggering reduces false opens. Creative gating effects emerge when attack/release times create tonal artifacts.',
      technical: 'Very fast attack (5 µs) creates click artifacts; slower attack (1–2 ms) creates smooth fade. Hold-open or release time after threshold exit prevents chatter on material near threshold.',
    },
    valued_in: [
      'drum tracking where room tone or leakage requires removal without smashing tone',
      'tightening sources with trailing noise, reflections, or mic leakage',
      'creative gating effects where timing becomes a rhythmic or textural element',
      'broadcast and voiceover where background noise must vanish completely',
    ],
    less_suited_to: [
      'acoustic instruments with natural decay that shouldn\'t be truncated',
      'reverb-dependent arrangements where ambient decay is essential',
      'masking fundamental arrangement or performance issues rather than addressing them',
      'contexts where unintended silence or dropout becomes musically inappropriate',
    ],
    unit_variance: 'Moderate. VCA type, frequency-conscious keying presence, attack precision, and range control implementation affect usability. Simple gates with fixed triggering vary less; advanced gates with selective key inputs vary more.',
  },

  {
    id: 'topo-multiband',
    family: 'compressor',
    topology: 'multiband',
    label: 'Multiband Compressor',
    essence: 'Frequency-divided independent compression bands, providing surgical frequency-specific dynamics without broad-brush control.',
    mechanism: {
      musician: 'The spectrum is divided into independent regions — bass, mids, treble — and each gets its own compressor. Boomy bass can be managed without touching the vocal; sizzly treble can be tamed without deadening the drums.',
      engineer: 'Active or passive crossovers divide the spectrum into independent bands (typically 3–5). Each band has its own compressor with independent threshold, ratio, attack, and release. Bands are summed after compression.',
      technical: 'Crossover frequencies typically at 200 Hz, 2 kHz, etc. Each band has its own envelope detector and VCA. Crossover phase response and slope affect transparency. Simultaneous compression of overlapping frequencies near crossover requires careful tuning.',
    },
    sonic_character: {
      musician: 'Surgical frequency-specific problem-solving without affecting neighboring ranges. The result is either transparent when subtle or obviously sculpted when aggressive.',
      engineer: 'Per-band threshold and ratio creates frequency-specific dynamics management. Overuse produces audibly sculpted, processed tone where each band becomes obvious.',
      technical: 'Soft crossovers (gentle roll-off) are more transparent; hard crossovers (steep) create time-domain smearing. Simultaneous compression near crossover boundaries requires careful tuning to avoid artifacts.',
    },
    valued_in: [
      'mastering where specific frequency bands misbehave dynamically',
      'mix-bus rescue where broad compression conflicts with band-specific issues',
      'stem compression on elements with frequency-specific dynamic problems',
      'difficult sources where single-band compression can\'t balance all spectral regions',
    ],
    less_suited_to: [
      'sources with well-balanced natural dynamics — multiband adds complexity without benefit',
      'tracking where committing to frequency-specific processing may limit later options',
      'problem-solving at the arrangement level where multiband masks rather than fixes',
      'workflows where simplicity is more important than surgical precision',
    ],
    unit_variance: 'High. Number of bands, crossover topology, individual compressor type per band, and soft-knee options all change character significantly. Analog multiband designs vary substantially from implementation to implementation.',
  },

  // ═══════════════════════════════════════════════════
  // PREAMP TOPOLOGIES
  // ═══════════════════════════════════════════════════

  {
    id: 'topo-all-valve',
    family: 'preamp',
    topology: 'all-valve',
    label: 'All-Valve',
    essence: 'The entire gain path runs through vacuum tubes, producing harmonically rich amplification where the circuit\'s character is inseparable from the gain itself.',
    mechanism: {
      musician: 'Every stage of amplification is a vacuum tube — the signal enters glass, gets louder through glass, and leaves through glass. The tubes warm slightly under load, adding overtones that grow naturally with signal level. There is no part of the gain that is neutral.',
      engineer: 'All gain stages use triode or pentode vacuum tubes for voltage amplification. Plate-to-grid coupling between stages introduces frequency-dependent phase shift and soft clipping at each node. Output is typically transformer-coupled, adding further harmonic content and gentle HF rolloff. Power supply regulation directly affects headroom and sag behavior.',
      technical: 'Cascaded common-cathode triode stages with plate-to-cathode feedback or plate-to-grid coupling. Each stage contributes predominantly even-order harmonics at moderate levels, transitioning to increased odd-order content near clipping. Interstage coupling capacitors impose a low-frequency rolloff pole. Output transformer provides balanced drive with insertion loss of 1–3 dB and bandwidth typically limited to 20 Hz–40 kHz at full rated output.',
    },
    sonic_character: {
      musician: 'The sound is dimensional — depth, width, and a sense of presence that microphone signal alone doesn\'t carry. Pushing gain adds richness rather than harshness, and the saturation feels musical rather than distorted. The preamp becomes part of the instrument.',
      engineer: 'Harmonically dense from idle. Even at conservative gain settings, the tube stages introduce audible second and third harmonics. Headroom is soft — overdriving produces gradual compression rather than hard clipping. HF is naturally shelved by the output transformer, which can round aggressive sources without EQ.',
      technical: 'THD at nominal operating level 0.5–3%, predominantly 2nd harmonic. Noise floor typically −60 to −70 dBu (higher than solid-state). Slew rate limited by interstage coupling; transient fidelity is moderate. Gain range 30–65 dB typical. Output impedance transformer-dependent, typically 150–600 Ω.',
    },
    valued_in: [
      'vocal recording where harmonic richness and proximity dimension are the priority',
      'acoustic instruments where the preamp completes the tonal picture the microphone starts',
      'warm, lush tracking aesthetic where the recording should sound finished from capture',
      'low-level ribbon microphones that benefit from the tube stage\'s natural gain and harmonic lift',
    ],
    less_suited_to: [
      'clinical measurement contexts requiring flat frequency response',
      'sources with complex existing harmonics that would become congested with tube addition',
      'high-channel-count sessions where heat, power draw, and maintenance become factors',
      'applications requiring extremely low noise floors below −80 dBu',
    ],
    unit_variance: 'Substantial. Tube type (12AX7, 12AT7, 6072A, EF86), operating point, output transformer core material, and power supply regulation all shift the harmonic profile. Two all-valve preamps can sound as different as two different topologies.',
  },

  {
    id: 'topo-hybrid-tube',
    family: 'preamp',
    topology: 'hybrid-tube',
    label: 'Hybrid Tube',
    essence: 'Solid-state gain stage handles the amplification; a tube stage adds harmonic coloration as a deliberate color choice rather than a structural necessity.',
    mechanism: {
      musician: 'The heavy lifting of gain comes from a fast, quiet transistor circuit, but the signal also passes through a tube that adds warmth and texture. The tube isn\'t doing the work of making things louder — it\'s doing the work of making things feel alive.',
      engineer: 'A discrete or IC-based solid-state input stage provides the primary voltage gain with low noise and high bandwidth. A triode stage in the signal path — typically post-gain — adds controllable harmonic content. Some designs let you vary the tube\'s operating point or blend ratio, making the coloration adjustable rather than fixed.',
      technical: 'Solid-state input stage provides 20–60 dB gain with noise floor below −80 dBu and bandwidth exceeding 100 kHz. The tube stage operates in Class A with plate voltages between 48V and 250V. Lower plate voltages increase harmonic distortion at lower signal levels (starved-plate operation). Tube position in the signal chain determines whether harmonics are added pre or post primary gain.',
    },
    sonic_character: {
      musician: 'Cleaner and more controlled than an all-valve preamp, but with warmth and presence that a purely solid-state path doesn\'t provide. The tube character is usually audible as a subtle glow or midrange weight rather than overt saturation.',
      engineer: 'The solid-state stage ensures low noise and predictable gain behavior. The tube stage adds 0.3–1.5% THD that can be driven harder for more visible coloration. The combination is versatile — the preamp functions as a clean gain stage at low tube-stage levels, or as a character piece when driven.',
      technical: 'Combined THD typically 0.1–1.5% depending on tube operating point. Noise floor determined primarily by the solid-state input stage (−75 to −85 dBu). Transient response limited by whichever stage has lower slew rate — usually the tube. Output may be transformer or electronically balanced.',
    },
    valued_in: [
      'sessions requiring versatility between clean and colored across different sources',
      'tracking where tube character is desired without the noise penalty of all-valve designs',
      'workflows where the engineer wants to dial tube saturation as a creative variable',
      'DI recording where the tube stage complements the instrument\'s existing harmonic spectrum',
    ],
    less_suited_to: [
      'purist capture where any coloration — however subtle — is unwanted',
      'sessions requiring absolute consistency across many channels of the same preamp',
      'applications where the tube\'s operating point may drift with temperature over long sessions',
      'contexts where the combination adds harmonic density that conflicts with the source character',
    ],
    unit_variance: 'Moderate to high. The tube type, plate voltage, signal-chain position, and whether the tube gain is variable all change the character significantly. Starved-plate designs sound different from full-voltage designs, even with the same tube.',
  },

  {
    id: 'topo-discrete-ss',
    family: 'preamp',
    topology: 'discrete-ss',
    label: 'Discrete Solid-State',
    essence: 'Individually selected transistors in a hand-designed gain circuit — the transistor topology, feedback network, and output stage define the sonic identity without tubes or op-amps.',
    mechanism: {
      musician: 'The gain comes from individual transistors chosen and arranged by the circuit designer. There are no tubes adding glow, and no generic op-amp chips doing the work — the sound is determined by the specific transistors, their arrangement, and the metalwork of any output transformer.',
      engineer: 'Discrete bipolar or FET transistor gain stages with designed-in feedback networks that determine gain, bandwidth, and distortion characteristics. The absence of monolithic op-amps means the designer controls every parameter of the amplification: input impedance, open-loop gain, slew rate, and harmonic content. Output may be transformer-coupled or electronically balanced.',
      technical: 'Class A or Class A/B gain stages using hand-matched bipolar junction transistors (silicon or germanium) or JFETs. Feedback topology (shunt, series, or combined) determines gain accuracy versus harmonic richness. Transformer-coupled outputs add low-frequency phase shift and bandwidth limiting. Germanium devices exhibit temperature-dependent beta, producing variable harmonic content.',
    },
    sonic_character: {
      musician: 'The sonic identity depends heavily on the specific design. API-style preamps punch and push the midrange forward. Germanium designs bloom and soften. Neve-lineage circuits feel dense and thick. The one constant: the preamp has a clear point of view about what the signal should sound like.',
      engineer: 'Each design has a recognizable signature. Harmonic content is typically odd-order dominant in transformer-coupled designs, creating midrange presence and perceived loudness. Bandwidth is wider than valve designs but shaped by the output stage. Noise floor is moderate — better than tubes, not as quiet as IC-based designs.',
      technical: 'THD 0.02–1% depending on gain setting and output loading. Noise floor −70 to −80 dBu. Slew rate varies widely (1–50 V/µs) depending on feedback topology. Germanium BJTs exhibit collector-emitter saturation voltage temperature coefficient of −2 mV/°C, causing tonal drift with ambient temperature changes.',
    },
    valued_in: [
      'drum tracking where midrange punch and transient definition are critical',
      'electric instruments where the preamp\'s character completes the instrument\'s voice',
      'sessions where a specific sonic signature — punch, density, or attitude — is the creative intent',
      'high-SPL sources that benefit from the topology\'s higher headroom compared to tubes',
    ],
    less_suited_to: [
      'applications requiring transparent, characterless amplification',
      'multi-preamp rigs where exact matching between channels is critical and units vary',
      'extremely low-level sources where the noise floor becomes a factor',
      'sessions where the preamp\'s editorial character conflicts with the source\'s natural voice',
    ],
    unit_variance: 'Very high. Transistor material (silicon vs germanium), feedback topology, output stage (transformer vs active balanced), and even PCB layout create vast differences. Two "discrete solid-state" preamps can sound as different as two different topologies.',
  },

  {
    id: 'topo-dc-coupled',
    family: 'preamp',
    topology: 'dc-coupled',
    label: 'DC-Coupled',
    essence: 'No coupling capacitors in the signal path — the signal passes through without the phase shift, low-frequency rolloff, or transient smearing that capacitors introduce.',
    mechanism: {
      musician: 'Every coupling capacitor in an audio path acts as a tiny filter that subtly smears bass transients and shifts phase at low frequencies. A DC-coupled design removes all of them. The result is that the signal arrives at the output exactly as it entered — no editorial decisions made by the circuit.',
      engineer: 'The entire signal path maintains DC continuity from input to output. This eliminates the low-frequency phase shift that coupling capacitors introduce (typically 5–20° at 20 Hz in conventional designs). Servo circuits or carefully matched differential pairs maintain DC stability without coupling capacitors. The transient response extends to DC — there is no low-frequency time constant to recover from.',
      technical: 'Zero coupling capacitors in the audio signal path. Low-frequency response extends to DC (0 Hz) with no phase shift above the noise floor. Transient settling time is determined solely by amplifier bandwidth, not by capacitor charge/discharge cycles. DC offset is managed by precision servo loops or matched differential input stages. Typical phase deviation: <0.5° at 20 Hz.',
    },
    sonic_character: {
      musician: 'The most self-effacing topology — the preamp tries to have no voice of its own. Bass is tight and immediate with no bloom or overshoot. Transients arrive intact. What the microphone captured is what you hear, with gain added and nothing else.',
      engineer: 'Phase-coherent at all frequencies within the audio band. Bass transients are uncommonly fast and precise — kick drums and bass instruments have startling definition. The preamp adds gain without adding opinion. Useful as a reference point for understanding what other preamp topologies contribute.',
      technical: 'Phase linearity within ±0.5° from 10 Hz to 100 kHz. THD typically <0.001% at rated output. Noise floor −80 to −90 dBu. Transient response limited only by gain-bandwidth product. Low-frequency group delay effectively zero. CMRR >80 dB. The servo loop time constant is designed to be well below the audio band (typically <0.1 Hz).',
    },
    valued_in: [
      'reference recording where the microphone\'s character should be heard without editorial',
      'measurement and calibration where phase accuracy matters',
      'bass-heavy sources where coupling-capacitor phase shift would smear transient definition',
      'comparison and auditioning workflows where a transparent reference preamp reveals microphone character',
    ],
    less_suited_to: [
      'sessions where the engineer wants the preamp to contribute tonal character',
      'lo-fi or vintage aesthetics where coupling-capacitor coloration is part of the intended sound',
      'ribbon microphones that benefit from the impedance interaction of transformer-coupled inputs',
      'sources that need harmonic enrichment from the gain stage to sound complete',
    ],
    unit_variance: 'Low to moderate. The topology philosophy demands transparency, so implementations tend to converge. Differences emerge in servo loop design, input impedance, and output drive capability rather than harmonic character.',
  },

  // ═══════════════════════════════════════════════════
  // EQUALIZER TOPOLOGIES
  // ═══════════════════════════════════════════════════

  {
    id: 'topo-passive-inductor',
    family: 'equalizer',
    topology: 'passive-inductor',
    label: 'Passive Inductor',
    essence: 'Real wound inductors and capacitors form the filter networks — the EQ can only cut, requiring a makeup gain stage that becomes part of the sonic signature.',
    mechanism: {
      musician: 'Coils of wire and capacitors shape the tone — no amplification happens in the EQ itself. Because the filters can only reduce frequencies, a separate gain stage restores the level afterward. That gain stage — often a tube — adds its own character on top of the EQ curves.',
      engineer: 'LC (inductor-capacitor) networks form the filter sections. Inductors are physically wound components whose core material, wire gauge, and winding geometry determine Q factor and saturation behavior. The EQ is entirely passive — insertion loss is 15–20 dB, recovered by a makeup amplifier. Filter interaction between bands is inherent and produces the topology\'s characteristic broad, musical curves.',
      technical: 'Passive LC filter networks with inductor Q factors of 5–30 depending on core material (laminated steel, ferrite, powdered iron). Band interaction occurs because filter sections share a common signal path with no active isolation between bands. Insertion loss typically 16–20 dB. Makeup gain stage adds its own noise floor, harmonic content, and bandwidth limitations. Phase shift is minimum-phase but substantial at resonant frequencies.',
    },
    sonic_character: {
      musician: 'The curves feel wide and forgiving — boosting "air" doesn\'t create harshness, cutting mud doesn\'t create hollowness. The EQ shapes tone in broad strokes rather than surgical lines. The inductor saturation adds a subtle density that rewards pushing signal through the unit.',
      engineer: 'Filter shapes are broader and more interactive than active designs. Boosting one band slightly affects adjacent bands, producing curves that sound more natural than their graphical representation suggests. The makeup gain stage (tube or discrete) adds coloration that becomes part of the EQ\'s sonic identity. Inductor saturation at high levels adds gentle low-frequency compression.',
      technical: 'Filter Q varies with signal level due to inductor core saturation. Typical THD 0.5–2% at the makeup stage. Band interaction produces non-orthogonal filter responses — adjusting one band shifts the apparent center frequency and Q of adjacent bands. Phase shift at filter resonance can reach 90° per section.',
    },
    valued_in: [
      'vocal and instrument shaping where broad, musical curves serve the performance',
      'mix bus tone control where the EQ\'s character is a creative asset',
      'mastering where gentle, wide-Q adjustments are preferred over surgical correction',
      'sources where inductor saturation adds desirable density at low frequencies',
    ],
    less_suited_to: [
      'surgical notch filtering or narrow-band problem-solving',
      'applications requiring transparency — the makeup stage always contributes character',
      'high-channel-count mixing where insertion loss and gain restoration add cumulative noise',
      'sessions requiring exact recall — passive component tolerances make unit-to-unit matching imprecise',
    ],
    unit_variance: 'Moderate. Inductor construction (toroidal vs laminated), core material, makeup amplifier topology (tube vs solid-state), and component tolerances all contribute. Two units of the same model may sound slightly different due to inductor winding variations.',
  },

  {
    id: 'topo-active-inductor',
    family: 'equalizer',
    topology: 'active-inductor',
    label: 'Active Inductor',
    essence: 'Gyrator circuits simulate inductors electronically, achieving similar musical filter shapes without the bulk, cost, or saturation behavior of wound components.',
    mechanism: {
      musician: 'Instead of physical coils of wire, the EQ uses transistor circuits that behave like inductors. The result is similar broad, musical filter curves but with more consistency and the ability to both boost and cut without a separate gain stage.',
      engineer: 'Gyrator circuits (op-amp or discrete transistor networks with feedback capacitors) synthesize inductor-like impedance. This provides resonant filter behavior without physical inductors. The active topology allows both boost and cut, eliminates insertion loss, and provides isolation between filter bands. The amplifier\'s own character (discrete vs IC, Class A vs AB) becomes the EQ\'s sonic signature.',
      technical: 'Gyrator-based resonant filters using NIC (negative impedance converter) or GIC (generalized impedance converter) topologies. Simulated inductor Q is determined by component ratios in the feedback network, not by physical winding properties. No core saturation occurs — Q remains constant with signal level. Active topology provides 0 dB insertion loss and band isolation. THD determined by the gain stage design.',
    },
    sonic_character: {
      musician: 'Musical curves with more precision than passive designs. The EQ can boost and cut without the coloration of a separate makeup stage. The character sits between the lush warmth of passive inductors and the clinical precision of parametric designs.',
      engineer: 'Filter shapes are broad and interactive like passive designs, but with better consistency and repeatability. No insertion loss means unity gain when flat. The lack of inductor core saturation means the low-frequency character is determined by the amplifier topology rather than magnetic behavior. Discrete Class A amplifiers add harmonic richness; IC-based designs are more transparent.',
      technical: 'Simulated inductor Q typically 3–20, stable with signal level. THD 0.05–0.5% depending on amplifier topology. Bandwidth limited by gain-bandwidth product of the active devices. No magnetic saturation artifacts. Phase response is minimum-phase, similar to true inductor filters. Noise floor determined by the active stage — typically −80 to −90 dBu.',
    },
    valued_in: [
      'tracking and mixing where both boost and cut are needed with musicality',
      'sessions requiring more consistency and recall precision than passive designs offer',
      'applications where the inductor-EQ sound is desired without the weight and cost of wound components',
      'channel-strip configurations where the EQ should integrate tonally with the preamp stage',
    ],
    less_suited_to: [
      'applications where the nonlinear saturation behavior of real inductors is the point',
      'audiophile or mastering contexts where the gyrator\'s active noise contribution is unwanted',
      'designs where physical inductor core saturation provides desirable signal-dependent behavior',
      'situations where the specific personality of a wound-inductor EQ defines the aesthetic',
    ],
    unit_variance: 'Low to moderate. The active gain stage (discrete transistor, op-amp, IC) is the primary differentiator. Component tolerances are tighter than passive designs, so unit-to-unit matching is better. Output transformer presence or absence significantly shifts character.',
  },

  {
    id: 'topo-tilt',
    family: 'equalizer',
    topology: 'tilt',
    label: 'Tilt EQ',
    essence: 'A single control pivots the entire frequency spectrum around a center point — one direction brightens and thins, the other warms and darkens.',
    mechanism: {
      musician: 'One knob reshapes the whole frequency balance by tilting it like a seesaw. Turn it one way and things get brighter and leaner. Turn it the other way and things get warmer and fuller. The crossover point sits in the middle of the audible range, so the tilt feels natural.',
      engineer: 'A complementary shelving filter pair with a fixed crossover point (typically 600 Hz–2 kHz). Rotating the control simultaneously boosts one shelf and cuts the other by equal amounts. The result is a linear tilt across the spectrum on a log-frequency scale. The symmetry means the perceived loudness remains roughly constant as tonal balance changes.',
      technical: 'Two 6 dB/octave shelving filters with mirrored slopes and a shared pivot frequency. The transfer function produces a linear dB/decade slope across the audio band. Maximum tilt is typically ±6 dB from crossover to band edges. Phase shift is symmetric around the pivot frequency. The circuit is typically a first-order allpass-derived topology or a Baxandall variant.',
    },
    sonic_character: {
      musician: 'Subtle and forgiving — the tilt reshapes tone broadly rather than drawing attention to specific frequencies. Small adjustments feel like changing the "temperature" of the sound. The EQ is nearly impossible to make sound bad because the symmetry keeps everything proportional.',
      engineer: 'Exceptionally fast to use in tracking because there\'s only one creative decision. The constant-loudness behavior means changes sound like tonal shifts rather than level changes. Useful as a front-end tone control before more specific processing. The limited range (±6 dB) makes it gentle enough for hardwired positions in the signal path.',
      technical: 'Maximum boost/cut typically ±3 to ±6 dB. Constant group delay at the pivot frequency. First-order slopes produce minimal phase distortion. The circuit\'s simplicity means very low noise contribution and distortion. Total harmonic distortion typically <0.01% — the tilt EQ is among the most transparent processors in the chain.',
    },
    valued_in: [
      'hardwired pre-converter tone shaping where subtlety and speed matter',
      'vocal tracking where a quick brightness or warmth adjustment avoids complex EQ decisions',
      'inline signal conditioning where the EQ should correct gently without signature',
      'A/B comparison workflows where the single control allows rapid tonal evaluation',
    ],
    less_suited_to: [
      'targeted frequency correction — the tilt affects everything proportionally',
      'sources with problems at specific frequencies that need surgical treatment',
      'creative sound design where dramatic, narrow-band shaping is the intent',
      'mastering where more precision and per-band control is typically required',
    ],
    unit_variance: 'Very low. The topology is minimal — pivot frequency, tilt range, and component quality are the only variables. Most implementations converge on similar sonic results.',
  },

  {
    id: 'topo-tube-reactive',
    family: 'equalizer',
    topology: 'tube-reactive',
    label: 'Tube Reactive',
    essence: 'Vacuum tube gain stages interact with reactive filter components — the tube\'s nonlinear behavior becomes part of the EQ curve, producing signal-dependent tonal shaping.',
    mechanism: {
      musician: 'The EQ filters are built around vacuum tubes that respond differently depending on how much signal passes through them. Push more signal and the tubes saturate, softening the EQ\'s effect and adding harmonic warmth. The EQ is not just changing frequency balance — it\'s living and breathing with the music.',
      engineer: 'Vacuum tube gain stages (typically triodes) serve as the active elements in the filter networks. The tubes\' nonlinear transconductance means the effective gain — and therefore the EQ curve — changes with signal level. At low levels, the filters behave predictably. At higher levels, tube compression gently reduces the EQ\'s effect while adding harmonic content. Reactive components (inductors, capacitors) in the filter networks further interact with the tube\'s output impedance.',
      technical: 'Triode-based filter amplifiers operating in Class A. The tube\'s transconductance curve (gm vs. grid voltage) produces signal-dependent gain that modulates the feedback loop determining filter Q and magnitude. Reactive components in the filter interact with the tube\'s plate impedance, creating frequency-dependent loading that shifts the operating point. THD rises with EQ boost due to increased signal at the tube\'s grid. Even-order harmonics are the dominant distortion products.',
    },
    sonic_character: {
      musician: 'Rich and dynamic — the EQ adjustments feel alive rather than static. Boosting frequencies adds harmonic content along with the boost, making the result sound natural and dimensional rather than just louder at that frequency. The unit rewards careful gain staging and punishes carelessness — it demands attention.',
      engineer: 'The EQ curves are program-dependent in a way that rewards understanding the source material. Dense signals compress the filter response; sparse signals let it open up. The harmonic content added by the tubes integrates with the EQ changes so thoroughly that bypassing the EQ removes both the frequency shaping and the harmonic character simultaneously.',
      technical: 'Filter response varies approximately 1–3 dB with input level due to tube compression. THD 0.5–3% at typical operating levels, rising with boost settings. Even-order harmonics predominate below clipping. Bandwidth limited by tube stage (typically 20 Hz–30 kHz at rated output). Output impedance is reactive and frequency-dependent.',
    },
    valued_in: [
      'vocal and instrument shaping where the EQ should add dimension alongside frequency change',
      'mix bus processing where signal-dependent behavior produces musical, program-aware tone control',
      'creative tracking where the EQ\'s coloration is part of the aesthetic intent',
      'sources that benefit from simultaneous harmonic enrichment and frequency rebalancing',
    ],
    less_suited_to: [
      'corrective processing requiring precise, level-independent frequency adjustments',
      'applications where the signal-dependent curve variation introduces unpredictability',
      'sessions requiring exact recall — tube aging and thermal state affect repeatability',
      'transparent mastering where any harmonic addition is undesirable',
    ],
    unit_variance: 'Moderate. Tube type, plate voltage, reactive component quality, and circuit topology (Baxandall, bridged-T, parallel-T) all affect character. Tube aging introduces gradual tonal drift over time.',
  },

  // ═══════════════════════════════════════════════════
  // MICROPHONE TOPOLOGIES
  // ═══════════════════════════════════════════════════

  {
    id: 'topo-tube-ldc',
    family: 'microphone',
    topology: 'Tube LDC',
    label: 'Tube Large-Diaphragm Condenser',
    essence: 'A large capsule\'s sensitivity paired with a tube impedance converter — the warmth, dimension, and harmonic richness that defined the studio sound for decades.',
    mechanism: {
      musician: 'A big, sensitive diaphragm captures detail and proximity. A vacuum tube inside the microphone amplifies that signal and adds its own warmth. The combination produces the "classic studio vocal" sound — intimate, dimensional, and harmonically alive.',
      engineer: 'A large-diaphragm (≥25 mm) condenser capsule with a vacuum tube (typically a triode) serving as the impedance converter between the capsule\'s extremely high output impedance and the cable. The tube operates at reduced plate voltage (40–70V from the power supply) in Class A. The output transformer provides balanced drive and further shapes the frequency response.',
      technical: 'Capsule diameter 25–34 mm with gold-sputtered Mylar diaphragm, 3–6 µm thickness. Tube impedance converter (typically 6072A, EF86, or 12AT7 variant) operates at 40–70V plate voltage. Self-noise 10–18 dBA. Sensitivity −32 to −38 dBV/Pa. Output transformer provides 200 Ω balanced drive. Required external PSU provides regulated B+ and heater voltage via dedicated cable.',
    },
    sonic_character: {
      musician: 'Lush, dimensional, and intimate. Proximity effect is pronounced and often desirable — moving closer adds bass warmth and presence. The tube adds a subtle glow that makes vocals sit forward in a mix without aggressive EQ. The microphone flatters.',
      engineer: 'Broad presence rise (3–8 kHz) with gentle HF rolloff above 12 kHz from the tube and transformer. The tube adds 0.5–2% THD (predominantly 2nd harmonic) that integrates with the source. Proximity effect is strong due to the large diaphragm. Off-axis coloration can be significant depending on capsule geometry.',
      technical: 'Self-noise 10–18 dBA (A-weighted). Max SPL 125–140 dB depending on tube headroom. Frequency response typically ±3 dB, 20 Hz–18 kHz. Proximity effect +6 dB at 100 Hz at 10 cm distance. Tube-contributed THD predominantly 2nd harmonic. Diaphragm mass limits HF transient response.',
    },
    valued_in: [
      'lead vocal recording where intimacy, warmth, and dimensional presence are the goal',
      'acoustic instruments where harmonic richness complements the source',
      'voiceover and broadcast where the proximity-driven bass warmth creates authority',
      'sessions where the microphone should sound "finished" — requiring minimal processing downstream',
    ],
    less_suited_to: [
      'high-SPL close-miking (guitar amps, drums) where the tube saturates unmusically',
      'applications requiring short setup time — the tube needs warm-up for stable operation',
      'field recording or multi-mic deployments where dedicated PSUs become impractical',
      'sources where the microphone\'s flattering character masks important tonal information',
    ],
    unit_variance: 'Significant. Tube type and age, capsule tension, output transformer, and PSU regulation all affect tone. Vintage-spec reproductions vary from unit to unit in ways that originals also varied.',
  },

  {
    id: 'topo-fet-ldc',
    family: 'microphone',
    topology: 'FET LDC',
    label: 'FET Large-Diaphragm Condenser',
    essence: 'The large capsule\'s sensitivity with solid-state precision — cleaner, faster, and more consistent than tube designs while preserving the large-diaphragm character.',
    mechanism: {
      musician: 'A large, sensitive diaphragm captures the same detail as a tube condenser, but instead of a tube, a transistor handles the amplification. The result is the big-capsule sound without the tube\'s added warmth — cleaner, faster, and more transparent.',
      engineer: 'A JFET or MOSFET impedance converter replaces the tube. The FET\'s high input impedance matches the capsule\'s output, while its low noise and wide bandwidth preserve the capsule\'s native character with minimal coloration. Phantom-powered (48V) operation eliminates the need for an external PSU. The output can be transformer or transformerless.',
      technical: 'JFET impedance converter with input impedance >1 GΩ. Self-noise 7–15 dBA (typically lower than equivalent tube designs). Sensitivity −32 to −40 dBV/Pa. Max SPL 130–155 dB. Phantom-powered at 48V, current draw 2–5 mA. Transformerless designs provide wider bandwidth (20 Hz–20 kHz ±1 dB); transformer-coupled variants add subtle coloration.',
    },
    sonic_character: {
      musician: 'Clear, present, and detailed with a wide, open top end. The large diaphragm still delivers proximity warmth and presence, but without the tube\'s added harmonic layer. The microphone reveals rather than flatters — what the source sounds like is what you get.',
      engineer: 'Lower self-noise than tube designs allows capturing quieter sources. The FET introduces negligible harmonic content. Any character comes from the capsule geometry, diaphragm material, and output transformer (if present). Transformer-coupled FET LDCs (U87, etc.) have a specific midrange density that transformerless designs lack.',
      technical: 'Self-noise 7–15 dBA. THD <0.5% at 94 dB SPL. Transient response significantly faster than tube designs — FET slew rates >50 V/µs. Proximity effect similar to tube LDC. Off-axis response dependent on capsule-to-body geometry. Transformerless models trade transformer coloration for extended LF response and lower distortion.',
    },
    valued_in: [
      'vocal recording where clarity and transient detail are prioritized over harmonic warmth',
      'acoustic instruments where the source\'s own character should dominate',
      'drum overheads and room mics where transient speed and wide bandwidth matter',
      'multi-purpose tracking where one microphone needs to serve many sources without repatching',
    ],
    less_suited_to: [
      'sessions where the microphone\'s self-effacement leaves the source sounding undercooked',
      'lo-fi or vintage aesthetics that depend on tube harmonics from the microphone stage',
      'extremely high-SPL percussion where even high max-SPL ratings limit headroom',
      'ribbon-like warmth and figure-8 pattern — fundamentally different capsule behavior',
    ],
    unit_variance: 'Moderate. Capsule design, FET type, and output stage (transformer vs transformerless) are the main differentiators. Units from the same production run tend to match well. Capsule aging can shift the HF response over decades.',
  },

  {
    id: 'topo-fet-mdc',
    family: 'microphone',
    topology: 'FET MDC',
    label: 'FET Medium-Diaphragm Condenser',
    essence: 'Between large and small — the medium capsule balances the body of an LDC with the transient speed of an SDC, offering a compromise that often serves as the ideal generalist.',
    mechanism: {
      musician: 'The capsule is smaller than a large-diaphragm but bigger than a pencil condenser. This middle ground gives you some of the warmth and body of a big capsule with more of the speed and accuracy of a small one.',
      engineer: 'Diaphragm diameter 16–22 mm with FET impedance conversion. The medium capsule\'s reduced mass improves transient response over large-diaphragm designs while maintaining more proximity effect and low-frequency sensitivity than small-diaphragm models. Off-axis coloration is reduced compared to LDCs due to the smaller acoustic obstacle.',
      technical: 'Capsule diameter 16–22 mm. Diaphragm mass intermediate between LDC (6–10 µg/mm²) and SDC (3–5 µg/mm²). Self-noise 10–17 dBA. Frequency response typically ±2 dB, 20 Hz–20 kHz. Off-axis rejection more uniform than LDC due to smaller capsule-to-wavelength ratio at HF. Phantom-powered.',
    },
    sonic_character: {
      musician: 'Natural and balanced — the microphone doesn\'t impose the lush proximity of an LDC or the clinical accuracy of an SDC. It captures what\'s there with a gentle completeness that works on almost anything.',
      engineer: 'The frequency response is flatter and more neutral than most LDCs, with less off-axis coloration. Transients are cleaner. The reduced proximity effect means less bass management is needed at close distances. The microphone integrates easily into dense arrangements because it doesn\'t grab attention.',
      technical: 'Self-noise 10–17 dBA. Max SPL 135–150 dB. Proximity effect approximately half that of an equivalently positioned LDC. Diffraction effects begin at higher frequencies than LDC designs, providing more consistent off-axis response above 8 kHz.',
    },
    valued_in: [
      'instrument recording where natural balance and transient accuracy serve the source',
      'vocal recording where LDC proximity is excessive and SDC sounds too thin',
      'multi-microphone arrays where consistent off-axis response improves phase coherence',
      'acoustic ensemble recording where the microphone should capture the room honestly',
    ],
    less_suited_to: [
      'sessions demanding the intimate, flattering proximity of a large-diaphragm capsule',
      'applications requiring the pinpoint imaging of a true small-diaphragm design',
      'sources where the medium capsule\'s neutral character is perceived as lacking personality',
      'extreme close-miking where the LDC\'s proximity effect is a desired creative tool',
    ],
    unit_variance: 'Low. The medium-diaphragm category has fewer designs and less variation than LDC or SDC markets. Units tend to sound consistent across production runs.',
  },

  {
    id: 'topo-fet-sdc',
    family: 'microphone',
    topology: 'FET SDC',
    label: 'FET Small-Diaphragm Condenser',
    essence: 'The pencil condenser — a small, light diaphragm captures transients with precision and maintains consistent off-axis response, making it the measurement-derived workhorse of studio recording.',
    mechanism: {
      musician: 'A tiny, light diaphragm moves incredibly fast, capturing every transient and spatial detail with precision. The small capsule doesn\'t color the sound or favor certain angles — it records what\'s in front of it honestly.',
      engineer: 'Capsule diameter 12–16 mm with low-mass diaphragm. The small acoustic obstacle produces minimal diffraction effects, resulting in consistent off-axis frequency response. FET impedance conversion preserves the capsule\'s native character. Interchangeable capsules allow switching between polar patterns without changing the body electronics.',
      technical: 'Capsule diameter 12–16 mm, diaphragm thickness 3–6 µm, mass 3–5 µg/mm². Self-noise 14–22 dBA. Frequency response ±1.5 dB, 20 Hz–20 kHz (best-in-class flat). Off-axis response within ±2 dB of on-axis to 12 kHz. Capsule-to-wavelength ratio allows consistent pattern maintenance above 10 kHz. Phantom-powered.',
    },
    sonic_character: {
      musician: 'Precise, quick, and uncolored. The microphone reproduces transients faithfully — stick attacks on cymbals, pick attacks on acoustic guitar, bowing articulations on strings. It doesn\'t flatter, it records. The sound is lean and honest.',
      engineer: 'The flattest native frequency response of any condenser type. Best off-axis behavior makes them ideal for stereo pairs and arrays. Transient response is faster than LDC or MDC types due to lower diaphragm mass. The neutral character means SDCs benefit from characterful preamps that complement the source.',
      technical: 'Self-noise 14–22 dBA — higher than LDC types due to smaller capsule area. Max SPL 130–150 dB. Diaphragm resonance frequency >20 kHz in well-designed capsules. Group delay <10 µs at 15 kHz. Best-in-class frequency response flatness due to minimal diffraction artifacts.',
    },
    valued_in: [
      'acoustic instruments where transient accuracy defines the performance character',
      'stereo pairs and orchestral recording where matched off-axis response matters',
      'drum overheads and hat/ride close-miking where speed reveals cymbal detail',
      'reference recording where the microphone\'s job is documentation, not interpretation',
    ],
    less_suited_to: [
      'vocals requiring intimacy and proximity warmth — the small capsule doesn\'t deliver that',
      'low-level sources where the higher self-noise becomes audible',
      'sources that benefit from the coloration and flattering nature of large diaphragms',
      'broadcast or voiceover where proximity effect and warmth are expected',
    ],
    unit_variance: 'Low. Precision capsule manufacturing and FET standardization produce consistent results. Matched pairs from reputable manufacturers track within ±0.5 dB. Capsule aging is minimal in properly stored units.',
  },

  {
    id: 'topo-ribbon',
    family: 'microphone',
    topology: 'Ribbon',
    label: 'Ribbon',
    essence: 'A thin metal ribbon suspended in a magnetic field — the microphone captures velocity rather than pressure, producing a naturally warm, smooth transient response that tames harshness at the source.',
    mechanism: {
      musician: 'Instead of a stretched plastic membrane, this microphone uses a thin strip of aluminum hanging in a magnetic field. When sound moves the ribbon, it generates a tiny voltage. The ribbon is inherently bidirectional — it hears equally front and back. The result is a sound that is naturally warm and smooth, without the brightness peaks condensers often produce.',
      engineer: 'A corrugated aluminum ribbon (1–4 µm thick) suspended between permanent magnets generates EMF proportional to the ribbon\'s velocity. The velocity-sensitive transduction produces a natural 6 dB/octave HF rolloff relative to pressure microphones. The ribbon\'s extremely low output impedance (0.2 Ω) requires a step-up transformer to reach usable levels, and this transformer\'s characteristics significantly shape the microphone\'s sound.',
      technical: 'Ribbon element 2–60 mm long, 1–4 µm thick, corrugated for compliance. Velocity-sensitive transduction: output voltage proportional to particle velocity rather than pressure. Natural figure-8 polar pattern due to pressure-gradient operation. Step-up transformer ratio typically 1:30 to 1:50, contributing 15–25 dB of voltage gain. Sensitivity −50 to −60 dBV/Pa (significantly lower than condensers). Self-noise 18–25 dBA.',
    },
    sonic_character: {
      musician: 'Warm, smooth, and forgiving. Harsh guitars sound tamed. Bright brass sounds musical. The microphone has a way of making difficult sources sound naturally balanced without EQ. The figure-8 pattern picks up room ambience from behind, adding depth and dimension.',
      engineer: 'The natural HF rolloff (6 dB/octave above ~8 kHz) reduces the need for de-essing or high-shelf cuts on bright sources. Transient response is smooth — the ribbon integrates fast transients rather than emphasizing them. The step-up transformer interaction with the preamp\'s input impedance creates a load-dependent frequency response that varies with different preamp designs.',
      technical: 'Frequency response typically ±3 dB, 30 Hz–15 kHz (less extended than condensers). Natural 6 dB/octave HF rolloff due to velocity transduction. Proximity effect pronounced in figure-8 pattern. Ribbon resonance frequency 15–40 Hz (well below the audio band in most designs). Output impedance highly transformer-dependent; preamp input impedance should be ≥5× ribbon impedance to avoid LF rolloff.',
    },
    valued_in: [
      'guitar amps where the ribbon tames harshness and captures the speaker\'s natural warmth',
      'brass and woodwinds where brightness can be fatiguing without the ribbon\'s natural rolloff',
      'drum room and overhead positions where smooth transient integration avoids cymbal harshness',
      'blumlein and mid-side stereo techniques that leverage the figure-8 pattern',
    ],
    less_suited_to: [
      'high-SPL close-miking where the ribbon element may stretch or damage',
      'outdoor recording where wind can destroy the thin ribbon element',
      'sources requiring extended HF response above 15 kHz — the ribbon rolls off naturally',
      'high-output applications where the low sensitivity requires significant preamp gain and noise becomes a factor',
    ],
    unit_variance: 'High. Ribbon tension, magnet strength, transformer ratio and core material, and ribbon element age all affect the sound. Active ribbon designs (with built-in FET amplifiers) reduce transformer dependence but change the interplay with preamp impedance.',
  },

  {
    id: 'topo-dynamic',
    family: 'microphone',
    topology: 'Dynamic',
    label: 'Moving-Coil Dynamic',
    essence: 'A coil of wire attached to a diaphragm moves through a magnetic field — the most rugged, forgiving, and widely deployed microphone transducer in professional audio.',
    mechanism: {
      musician: 'A small coil attached to the back of a diaphragm sits in a magnetic gap. Sound moves the diaphragm, the coil moves with it, and the motion generates a voltage. No phantom power, no tubes, no electronics — just magnets and wire. The microphone is nearly indestructible.',
      engineer: 'A voice coil wound on a former attached to the diaphragm moves within a permanent magnet\'s gap. The EMF is proportional to velocity. Unlike ribbons, the coil mass is significant, limiting HF response. Internal acoustic resistance networks (vents, damping materials) shape the frequency response and pattern. No active electronics — the output is purely mechanical-to-electrical transduction.',
      technical: 'Voice coil impedance 150–600 Ω. Moving mass (diaphragm + coil + former) significantly higher than condenser or ribbon elements, limiting HF to typically 12–16 kHz −3 dB point. Sensitivity −55 to −60 dBV/Pa. Self-noise N/A (passive device; noise determined by coil impedance thermal noise, typ. −130 dBV). Max SPL effectively unlimited for most audio applications. No phantom power required.',
    },
    sonic_character: {
      musician: 'Natural midrange focus with gentle HF rolloff that flatters most close-miked sources. The microphone naturally rejects off-axis sound more aggressively than condensers, keeping spill and room noise out of the signal. More forgiving of placement and technique than condenser designs — it sounds good without effort.',
      engineer: 'The heavier moving mass produces a natural low-pass response that reduces sibilance, harshness, and background noise without processing. Close-miking proximity effect adds bass warmth on vocals. Off-axis rejection is tighter than equivalent condenser patterns. The output is robust and tolerant of long cable runs and noisy environments.',
      technical: 'Frequency response typically ±3 dB, 50 Hz–15 kHz (varies widely with design intent). Presence peak at 2–6 kHz engineered by acoustic resistance networks. Off-axis rejection 15–25 dB at 180° (cardioid variants). Proximity effect +6 to +10 dB at 100 Hz at 2 cm. No phantom power required. Essentially infinite max SPL for audio applications.',
    },
    valued_in: [
      'close-miking vocals and instruments in live and studio settings where isolation matters',
      'guitar amps where the natural mid-focus and SPL handling are ideal',
      'kick and snare drums where proximity effect and ruggedness serve the application',
      'broadcast, podcast, and voiceover where the forgiving response flatters the voice',
    ],
    less_suited_to: [
      'distant miking or room capture where the lower sensitivity and HF rolloff limit detail',
      'high-fidelity orchestral recording where extended bandwidth and transient accuracy matter',
      'sources with important content above 15 kHz that the moving mass can\'t reproduce',
      'quiet sources where the low sensitivity demands high preamp gain and noise becomes audible',
    ],
    unit_variance: 'Varies widely. The SM57 and SM58 are industry references with tight manufacturing consistency. Boutique and vintage dynamics vary considerably. The magnetic circuit design, voice coil material, and acoustic damping strategy are the primary differentiators.',
  },

  {
    id: 'topo-boundary',
    family: 'microphone',
    topology: 'Boundary',
    label: 'Boundary / PZM',
    essence: 'Mounting the capsule flush against a surface eliminates the reflective interference that colors conventional microphones, producing a uniquely coherent capture of the acoustic space.',
    mechanism: {
      musician: 'Instead of standing on a stand, this microphone lies flat against a surface — a floor, a wall, a table, the inside of a kick drum. By sitting on the boundary between the air and the surface, it avoids the comb-filtering reflections that color other microphones. The result is a clean, coherent pickup of whatever is happening in the room.',
      engineer: 'A small condenser or electret capsule is mounted flush with or very close to a reflective boundary. Sound waves arriving at the boundary undergo pressure doubling (+6 dB) rather than the constructive/destructive interference pattern that occurs when a microphone is spaced from reflecting surfaces. The result is a smooth frequency response free of comb-filter artifacts up to the frequency where the boundary plate\'s size limits the effect.',
      technical: 'Capsule mounted within λ/4 of the boundary surface for the highest frequency of interest. Pressure doubling provides +6 dB sensitivity gain. Comb-filter-free response up to the frequency where boundary plate radius < λ/2. Half-space (hemisphere) pickup pattern inherent to boundary mounting. The capsule is typically a small electret or back-electret element. SPL handling limited by the capsule, not the boundary effect.',
    },
    sonic_character: {
      musician: 'Clean and spacious — the microphone captures room sound and instrument resonance without the nasal coloration that conventional mics can pick up from nearby reflections. Inside a kick drum, it captures the full resonant space. On a floor, it hears the room as the room actually sounds.',
      engineer: 'Coherent phase response across the frequency band — no comb filtering means the sound is smoother and more phase-accurate than a conventional mic at the same position. The hemisphere pickup pattern is natural for floor-mounted applications. The pressure doubling provides 6 dB more sensitivity than the capsule alone.',
      technical: 'Comb-filter-free response to approximately c/(4d) where d is capsule-to-boundary distance (typically >10 kHz for well-designed units). +6 dB pressure zone sensitivity gain. Hemisphere (half-omni) pattern. Self-noise 16–24 dBA depending on capsule. Max SPL 120–145 dB. Frequency response affected by boundary plate dimensions — larger plates extend the comb-filter-free range to lower frequencies.',
    },
    valued_in: [
      'inside kick drums where the capsule captures the full resonant character of the shell',
      'floor-mounted piano recording where conventional stands would be impractical',
      'conference and theatrical applications where the microphone must be invisible',
      'ambient room capture where comb-filter-free response provides coherent spatial information',
    ],
    less_suited_to: [
      'close-miking single sources where directional pattern control is needed',
      'applications requiring off-axis rejection — the hemisphere pattern picks up everything in its half-space',
      'portable recording where a boundary surface may not be available or appropriate',
      'sources requiring the coloration and presence boost of conventional condenser microphones',
    ],
    unit_variance: 'Low. The topology is simple and well-understood. Capsule quality, plate size, and mounting precision are the main variables. Most boundary microphones from reputable manufacturers sound consistent.',
  },

  {
    id: 'topo-measurement',
    family: 'microphone',
    topology: 'Measurement',
    label: 'Measurement Microphone',
    essence: 'Calibrated for flat frequency response and known sensitivity — the reference tool for acoustic measurement, not sonic capture.',
    mechanism: {
      musician: 'This microphone measures the room, not the music. It has a precisely flat response so that measurement software can trust its readings. It tells you how the room sounds, not how the music sounds.',
      engineer: 'A small electret capsule with factory calibration data (individual frequency response curve) provides a known, flat reference. The capsule is optimized for omnidirectional response and flat sensitivity rather than low self-noise or high output. Used with measurement software (REW, Smaart) for room analysis, speaker alignment, and acoustic treatment verification.',
      technical: 'Omnidirectional electret capsule with factory-supplied calibration file (frequency vs. sensitivity). Response typically ±1 dB, 20 Hz–20 kHz. USB or analog output. Sensitivity calibrated against a reference standard. Not optimized for musical recording — noise floor, dynamic range, and harmonic distortion are secondary to calibration accuracy.',
    },
    sonic_character: {
      musician: 'Not applicable — this microphone is a diagnostic tool, not a creative one. Its purpose is truth, not beauty.',
      engineer: 'Flat, calibrated, and precise. The calibration file compensates for capsule imperfections so that measurement software receives accurate data. The output quality is adequate for measurement but not intended for musical recording — self-noise and dynamic range are secondary specifications.',
      technical: 'Individual calibration within ±0.5 dB. Omnidirectional pattern ensures response to all room reflections. Self-noise 20–30 dBA (higher than studio condensers). Max SPL 110–130 dB. USB versions include onboard ADC for direct digital measurement.',
    },
    valued_in: [
      'room acoustic measurement and analysis',
      'speaker alignment and crossover verification',
      'acoustic treatment evaluation and optimization',
      'calibrating monitor systems for accurate playback',
    ],
    less_suited_to: [
      'any musical recording application — not designed for it',
      'live sound reinforcement — the omnidirectional pattern provides no isolation',
      'tracking or mixing reference — use studio monitors for that',
      'high-SPL measurement environments exceeding the capsule\'s limited dynamic range',
    ],
    unit_variance: 'Very low (with calibration). The individual calibration file corrects for capsule variation. Without calibration, unit-to-unit variation is moderate.',
  },

  {
    id: 'topo-subkick',
    family: 'microphone',
    topology: 'Subkick',
    label: 'Subkick',
    essence: 'A speaker cone operated in reverse as a microphone — optimized for sub-bass frequencies that conventional microphones cannot capture with equivalent weight and authority.',
    mechanism: {
      musician: 'A small speaker wired backward acts as a microphone. Because the speaker cone is large and heavy, it responds only to the deepest frequencies — the chest-thump of a kick drum, the room-shaking resonance of a bass cabinet. It hears what you feel, not what you hear.',
      engineer: 'A 5–8" speaker driver wired in reverse generates voltage from cone movement. The large cone mass and compliance produce a resonance frequency of 30–60 Hz, effectively creating a mechanical low-pass filter. The output is blended with a conventional kick microphone to add sub-bass weight without the phase issues of EQ-based low-frequency boost.',
      technical: 'Speaker cone diameter 5–8", resonance frequency 30–60 Hz. Sensitivity approximately −70 dBV/Pa (very low). Useful frequency range 20–120 Hz, rolling off naturally above the cone\'s mass-limited response. Output impedance 4–16 Ω (speaker impedance), requiring a transformer or DI to interface with microphone preamps. Phase alignment with the partner kick microphone is critical.',
    },
    sonic_character: {
      musician: 'Pure weight. The subkick adds the physical rumble and chest impact that a conventional microphone misses. Blended in, it makes the kick drum feel like it\'s in the room with you. Used alone, it sounds like a subsonic earthquake.',
      engineer: 'Clean sub-bass that avoids the phase artifacts of EQ boosting. The mechanical low-pass filtering means no high-frequency content to manage — the output is already just the low end. Phase alignment with the primary kick mic is the critical creative decision.',
      technical: 'Response centered 30–80 Hz with natural 12 dB/octave rolloff above cone resonance. No HF content requiring filtering. Phase coherence with primary kick mic depends on physical placement and polarity alignment. Output level very low — requires significant preamp gain.',
    },
    valued_in: [
      'kick drum recording where physical sub-bass impact is the priority',
      'bass cabinet recording for added fundamental weight',
      'sound design where extreme low-frequency content is desired',
      'blending with conventional kick mics to extend the low-frequency foundation',
    ],
    less_suited_to: [
      'any application beyond dedicated sub-bass capture',
      'sources above 120 Hz — the cone cannot respond to higher frequencies',
      'sessions where the low-frequency content would conflict with room resonances or monitors',
      'solo microphone use — must be blended with a conventional mic for a complete kick sound',
    ],
    unit_variance: 'Moderate. Speaker driver selection, enclosure design, and internal damping all affect resonance frequency and Q. DIY subkicks vary considerably; commercial designs are more consistent.',
  },

  {
    id: 'topo-field-recorder',
    family: 'microphone',
    topology: 'Field Recorder',
    label: 'Portable Field Recorder',
    essence: 'Self-contained recording device with built-in capsules and converters — captures sound independently of the studio signal chain.',
    mechanism: {
      musician: 'A handheld recorder with built-in microphones and a memory card. It captures sound on its own — no preamp, no patchbay, no DAW. Useful for capturing sounds outside the studio or as a stereo room reference that exists independently of the main recording chain.',
      engineer: 'Integrated stereo condenser capsules (typically X/Y or A/B configuration), phantom power, preamp, ADC, and digital storage in a portable package. The recording chain is entirely self-contained. Quality varies but modern units provide 24-bit/96 kHz recording with reasonable self-noise and dynamic range.',
      technical: 'Built-in electret capsules in X/Y or A/B configuration. Self-noise 20–28 dBA. Max SPL 100–120 dB at unity gain. ADC resolution 24-bit, sample rates to 96 kHz. Internal preamp gain typically 0–40 dB. Storage on SD/microSD. Battery-powered with 6–20 hour runtime.',
    },
    sonic_character: {
      musician: 'Practical and immediate — the recorder captures the moment without ceremony. Sound quality is good enough for reference tracks, sound design sources, and rehearsal documentation. It won\'t replace a dedicated studio path, but it captures what studio microphones can\'t reach.',
      engineer: 'The integrated signal chain has a known, fixed character. Self-noise is higher than studio condensers, and the converters are competent but not audiophile-grade. The stereo imaging from the built-in capsules is surprisingly usable for ambience, room tones, and sound effects.',
      technical: 'Integrated electret capsules with sensitivity −38 to −42 dBV/Pa. ADC dynamic range 90–100 dB. Self-noise floor limited by capsule and preamp. Limited headroom at high SPL without attenuation. Stereo separation determined by capsule spacing and pattern.',
    },
    valued_in: [
      'capturing ambient sounds, room tones, and environmental textures outside the studio',
      'rehearsal documentation and arrangement reference recording',
      'sound design source material gathering in the field',
      'stereo room reference during sessions as an independent capture chain',
    ],
    less_suited_to: [
      'primary studio recording — the signal chain quality doesn\'t match studio paths',
      'applications requiring low noise or high dynamic range exceeding the device\'s capability',
      'integration with the studio patchbay — the recorder is a self-contained, parallel system',
      'critical monitoring or measurement — the built-in converters are not calibrated',
    ],
    unit_variance: 'Low (within a model). Manufacturing consistency is high for consumer electronics. Differences between models and brands are significant — capsule quality, preamp noise, and converter performance vary across price points.',
  },
];
