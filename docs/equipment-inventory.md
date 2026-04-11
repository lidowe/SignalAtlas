
# Signal Atlas Equipment Inventory

This document is generated from the current inventory data in the repo so it can be reviewed, annotated, and then fed back as a human-audited source.

## Summary

- 64 microphones
- 20 preamps / channel strips
- 23 dynamics processors
- 8 equalizers
- 12 outboard processors
- 4 converters
- 3 summing units
- 4 monitors

## How To Audit

- Treat this as a source-of-truth draft, not a final historical document.
- Correct names, counts, model distinctions, routing roles, lineage notes, and any technical fields that are incomplete or misleading.
- For disputed historical claims, annotate the disagreement rather than flattening it.
- Keep unit details separate from longer history and lineage notes when you send revisions back.

## Microphones

### Tube LDC

- Wunder Audio CM7 GS (Wunder Audio)
  Qty: 1 | Patterns: multi | Output Z: 200 ohm | Gain demand: 30 dB | Phantom: no
  ID: mic-wunder-cm7gs
  Character: Rich, three-dimensional tube tone with dense midrange weight and a silky, never-harsh top end. The M7 capsule delivers that mythical U47 combination of warmth and presence — vocals sit with both authority and intimacy. Natural transient compression makes everything sound expensive.
  Engineering: External HV PSU runs NOS Telefunken 800-series glass pentode (EF14 derivative). 8-position M49-style pattern select via PSU + internal cardioid relay. NICO-wound output transformer (user's unit). Triple-gauge headbasket acts as Faraday cage, critical to tonal signature. Mundorf Silver Gold Oil coupling cap. 200Ω output.
  Heritage: Historically accurate reproduction of the early long-body Neumann U47 (1949–1952 era). M7-style capsule by Siegfried Thiersch (ex-Neumann Berlin), precision-milled in Switzerland. Designed by Mike Castoro, Wunder Audio, Austin TX.

- Telefunken TF51 (Telefunken Elektroakustik)
  Qty: 1 | Patterns: multi | Output Z: 300 ohm | Gain demand: 30 dB | Phantom: no
  ID: mic-telefunken-tf51
  Character: The hallmark 251 "air" — extended, shimmering top end floating above the mix without harshness. Midrange is smooth with lifelike vocal nuance. Bottom end balanced, never boomy. Where the CM7 adds weight, the TF51 adds openness and dimension.
  Engineering: TK51 CK12-style edge-terminated capsule paired with 6072A tube and Haufe T31 output transformer. External M 903 PSU provides HV for tube + capsule polarization. Three fixed patterns via PSU switch. <300Ω output. 128dB max SPL, 8dBA self-noise.
  Heritage: Modern recreation of the AKG/Telefunken ELA M 251E (1959). CK12-style edge-terminated capsule (TK51), Haufe T31 output transformer, 6072A tube. Designed by Toni Fishman, hand-assembled in Connecticut.

### FET LDC

- Stam SA-87 Red Badge (Stam Audio)
  Qty: 2 | Patterns: multi | Output Z: 200 ohm | Gain demand: 30 dB | Phantom: yes
  ID: mic-stam-sa87-red
  Character: The general U87 family sound — forward upper midrange presence giving vocals cut and authority. However, the Heisermann capsule tends brighter and more open than a genuine U87, with less controlled "darkness." Slightly more hi-fi and forward. Sibilance may be more pronounced on bright vocalists.
  Engineering: FET amplifier circuit modeled on Neumann U87 topology with transformer-coupled output. Heisermann K67-style capsule doesn't perfectly replicate Neumann backplate geometry or diaphragm tension — expect different response in 8–12kHz region. Early Red Badge production had more unit-to-unit variation. 200Ω output, 48V phantom.
  Heritage: Clone of the Neumann U87 (1967). Early production "Red Badge" with Heisermann K67-style capsule. Manufactured by Stam Audio Engineering, São Paulo, Brazil.

- Stam SA-87i Black Badge (Stam Audio)
  Qty: 1 | Patterns: multi | Output Z: 200 ohm | Gain demand: 30 dB | Phantom: yes
  ID: mic-stam-sa87-black
  Character: Fuller and warmer than the Red Badge, with denser midrange body and more controlled sibilance. The Braingasm K-87 capsule is a more refined K67 recreation — smoother upper midrange, less spitty. Overall thicker, slightly darker, more forgiving on bright sources. Closer to the real U87 experience.
  Engineering: Same FET/transformer topology as Red Badge. Braingasm K-87 capsule has tighter manufacturing tolerances, closer to original K67 backplate geometry. "i" suffix and Black Badge designation indicate later production with improved QC. Interchangeable in signal chain terms (same impedance, same gain requirements).
  Heritage: Later evolution of the Stam SA-87 with upgraded Braingasm K-87 capsule. Same Neumann U87 (1967) lineage but refined manufacturing. Having both Red and Black Badge is educational — demonstrates how capsule differences affect character when circuit topology is identical.

- UT FET47 (United Recording)
  Qty: 1 | Patterns: cardioid | Output Z: 200 ohm | Gain demand: 30 dB | Phantom: yes
  ID: mic-ut-fet47
  Character: The U47 FET warmth and weight in solid-state form. Thick full low end, smooth midrange, gently rolled top compared to U87-types. The "warm blanket" sound — less presence peak, more body and mass. Vocals sound intimate and substantial; kick drum and bass get chest-thumping authority.
  Engineering: FET amplifier with transformer-coupled output. K47-style large-diaphragm capsule. Design emphasizes SPL handling (~147dB) and low-end authority. Fixed cardioid pattern. 200Ω output, 48V phantom.
  Heritage: Inspired by the Neumann U47 FET (1972), the solid-state successor to the legendary tube U47. Bill Putnam's legacy company lineage (Universal Audio → United Recording → UREI). K47-style capsule, transformer-coupled.

- Sony C-100 (Sony)
  Qty: 1 | Patterns: multi | Output Z: 90 ohm | Gain demand: 40 dB | Phantom: yes
  ID: mic-sony-c100
  Character: Breathtakingly detailed and transparent — a truth-telling microphone. The dual-capsule system creates an almost uncanny sense of air and realism you feel as much as hear. Neutral and honest — no added warmth or color. Sounds like being in the room, not listening through a mic.
  Engineering: Novel dual-capsule: 25mm single-backplate electret LDC (≤25kHz) + 17mm electret (25–50kHz). At 44.1/48kHz the HF capsule contributes almost nothing — only at 96kHz+ does it become relevant. Transformerless output at 90Ω — virtually zero preamp interaction. Multi-pattern. 131dB max SPL, 18dBA self-noise.
  Heritage: Sony's first new studio mic in 25 years (2017). Dual-capsule hi-res system: 25mm LDC + 17mm electret extending to 50kHz. Developed over 3 years with Sony Music. Sony's mic heritage includes the legendary C-37A (1958) and C-800G.

- Audix SCX25A (Audix)
  Qty: 2 | Patterns: cardioid | Output Z: 200 ohm | Gain demand: 28 dB | Phantom: yes
  ID: mic-audix-scx25a
  Character: Smooth, natural, and musical with gentle warmth flattering acoustic instruments without coloring. The 25mm capsule gives a more focused, immediate texture than typical 1-inch LDCs. Exceptionally low 14dBA self-noise makes it remarkable on quiet sources. Piano engineers consistently praise this mic.
  Engineering: Side-address LDC in compact form (21mm body, 148mm long) — small body minimizes diffraction. True condenser (externally polarized, NOT electret). Center-terminated 25mm capsule. Transformerless FET amplifier. Matched pair within 1dB sensitivity and frequency response. No pad or filter on body. 135dB max SPL.
  Heritage: Designed by Audix, Wilsonville OR. 25mm true condenser in compact "lollipop" form factor. SCX-25 introduced ~2002, revised to SCX25A ~2005 with improved LF response. Won PSW Reader's Choice Award 2010.

### FET MDC

- Earthworks Ethos (Earthworks)
  Qty: 2 | Patterns: supercardioid | Output Z: 100 ohm | Gain demand: 40 dB | Phantom: yes
  ID: mic-earthworks-ethos
  Character: Uncolored, transparent, and almost eerily honest — captures your voice the way it actually sounds with no flattering hype or warming coloration. The ultra-fast 11.67µs rise time creates immediacy and "being there" presence fundamentally different from typical LDC sound.
  Engineering: Transformerless, phase-coherent design achieving 11.67µs rise time. Supercardioid pattern (NOT cardioid) with null points at ~125°. ~100Ω output provides excellent cable drive. Stainless steel body provides mass damping and RF shielding. Integrated foam pop filter handles plosives.
  Heritage: Founded by David Blackmer (1927–2002), who also created dbx and pioneered the VCA compressor. "Sounds like life" philosophy centered on time-domain accuracy. Ethos (2022) applies measurement-grade precision to a broadcast vocal form. Won iF Design Award 2023.

- Audio-Technica AT4033a (Audio-Technica)
  Qty: 2 | Patterns: cardioid | Output Z: 100 ohm | Gain demand: 30 dB | Phantom: yes
  ID: mic-at4033a
  Character: Strong up-front presence is the defining trait — puts vocals right in your face with confident, assertive clarity. Pronounced presence peak adds cut without harshness. Bass controlled and clean, transient response exceptionally fast thanks to the small capsule. Nashville bluegrass secret weapon for picked acoustic instrument snap and attack.
  Engineering: Electret condenser with surprisingly small 11.5mm, 2-micron diaphragm — small capsule in large side-address body is key to fast transient response. Symmetrical transformerless FET circuitry. Precision-machined nickel-plated brass baffle. 80Hz HPF switchable. 145dB max SPL, 17dBA self-noise. Five-step capsule aging process.
  Heritage: Originally released early 1990s, revolutionary for breaking the $1,000 barrier. The "a" suffix = updated shock mount (AT8449a). A Nashville studio staple, particularly in bluegrass and acoustic music communities. 11.5mm capsule makes it technically medium-diaphragm despite large body.

### FET SDC

- Beyerdynamic MC 930 (Beyerdynamic)
  Qty: 1 | Patterns: cardioid | Output Z: 180 ohm | Gain demand: 25 dB | Phantom: yes
  ID: mic-beyer-mc930
  Character: One of the sweetest-sounding SDCs available. Particularly beautiful on picked guitar. More refined and delicate than a C451 or SM81. Presence peak above 10kHz adds sparkle without harshness. Natural and musical, not clinical.
  Engineering: Externally biased true condenser (NOT electret) with transformerless output at 180Ω. Sintered metal nose cover replaces wire mesh — diaphragm mounts closer to body end, reducing diffraction. At 30mV/Pa, significantly hotter than most SDCs. -15dB pad, -6dB/oct @ 250Hz HPF. 140dB max SPL.
  Heritage: Beyerdynamic (Heilbronn, Germany, founded 1924). MC930 introduced 2002 at AES Munich as part of MC900 series. Beyerdynamic's core reputation is headphones and broadcast dynamics — their SDC line is less known but highly respected.

- Shure SM81 (Shure)
  Qty: 2 | Patterns: cardioid | Output Z: 85 ohm | Gain demand: 45 dB | Phantom: yes
  ID: mic-shure-sm81
  Character: The reference "accurate SDC" — sounds like what's in front of it. Low end extends deeper than most SDCs, giving body without color. Highs detailed but not hyped. Deep, lush, and articulate. If the C451 is champagne, the SM81 is fine single malt — richer, warmer, more grounded.
  Engineering: True condenser, transformer-coupled at remarkable 85Ω — essentially immune to cable capacitance. Run 100+ foot cables with no HF degradation. Low RF susceptibility. Operates 11–52V phantom. Three-position HPF (flat/-6dB/-18dB/oct). Lockable -10dB pad. Rugged steel construction. 146dB max SPL.
  Heritage: Introduced 1978, unchanged since. One of the most-recorded SDCs in history. Part of Shure's legendary SM line. Set the standard for flat-response SDCs. 85Ω output is the lowest of any conventional microphone.

- AKG C451e (AKG)
  Qty: 2 | Patterns: cardioid | Output Z: 200 ohm | Gain demand: 43 dB | Phantom: yes
  ID: mic-akg-c451e
  Character: THE quintessential "crispy" SDC. CK1 capsule is legendary for sparkling, detailed treble with distinct brightness above 10kHz. Transients fast and snappy. Acoustic guitars shimmer, hi-hats sizzle with articulation. Vintage CK1 units have a lively, airy organic "snap" the modern C451B doesn't replicate.
  Engineering: True condenser (externally biased) CK1 capsule with tight manufacturing tolerances. Modular CMS system — threads wear and capsules loosen over time. ⚠️ 50+ year old CK1 capsules may have shifted tension or developed noise. "e" = XLR output. 120dB max SPL (body). 9–52V phantom.
  Heritage: Introduced 1969, discontinued 1993. AKG's first FET condenser. CK1 true condenser capsule — the modular CMS system accepted 10+ capsules. Defined the modern SDC category. Vintage CK1 capsules are irreplaceable NOS items.

- AKG C451B (AKG)
  Qty: 2 | Patterns: cardioid | Output Z: 200 ohm | Gain demand: 40 dB | Phantom: yes
  ID: mic-akg-c451b
  Character: Similar family voicing — bright, detailed, excellent on transients — but perceptibly less "alive" and "special" than vintage CK1. More consistent unit-to-unit, making matched pairs more trustworthy for stereo. The -20dB pad yielding 155dB SPL handling means you can mic virtually anything without fear.
  Engineering: Fixed integral 3-micron gold-sputtered electret capsule (vs. original CK1 true condenser). Redesigned transformerless output electronics. Three-position pad (0/-10/-20dB) and three-position HPF. 155dB max SPL with -20dB pad. 18dBA self-noise. 9–52V phantom.
  Heritage: Modern reissue of C451/CK1 (2001). TEC Award nominated 2002. Fixed integral electret capsule replaces modular CMS system. AKG claims "identical acoustics" — widely debated. Having both C451e and C451B illustrates how capsule technology affects character.

- Electro-Voice RE200 (Electro-Voice)
  Qty: 2 | Patterns: cardioid | Output Z: 200 ohm | Gain demand: 40 dB | Phantom: yes
  ID: mic-ev-re200
  Character: NOT a neutral mic — deliberate "Continuous Presence Rise" with bass rolloff from 300Hz, sharp peaks at 5kHz and 8kHz (+10–12dB), steep rolloff above 13kHz. Think built-in EQ pre-optimized for percussion and hi-hat. On cymbals, it adds snap and definition without processing.
  Engineering: True condenser (externally biased despite 12V phantom operation) with ultra-thin gold-laminated diaphragm on precision ceramic disc electrode. Internal DC-DC converter maintains stable capsule polarization 12–52V — performance identical regardless of phantom supply. Transformerless. No pad or HPF. 130dB max SPL.
  Heritage: EV (Buchanan MI, founded 1927). Part of the RE series alongside legendary RE20 and RE55. Pragmatic design — condenser voiced to sound useful with minimal processing. Discontinued but available NOS.

- Peavey PVM 480 (Peavey)
  Qty: 2 | Patterns: cardioid | Output Z: 200 ohm | Gain demand: 40 dB | Phantom: yes
  ID: mic-peavey-pvm480
  Character: Genuinely underrated SDC that consistently surprises engineers without brand prejudice. Clean, detailed, smoother than expected. Less personality than a C451 but more musical than utility-grade. Disappears into the recording — doesn't impose character, just works.
  Engineering: Small-diaphragm FET condenser with true condenser capsule. Standard phantom power. Build quality solid — Peavey's manufacturing expertise from PA/live sound. Technical documentation scarce — Peavey focused marketing on live sound and guitar amps.
  Heritage: Peavey Electronics (Meridian MS, founded 1965). PVM series (1990s) was their entry into pro studio mics. The PVM 480 got buried under AKG/Shure/Neumann branding but was a legitimate studio tool. Collector-level obscure.

- Audix M1255B (Audix)
  Qty: 3 | Patterns: cardioid | Output Z: 200 ohm | Gain demand: 38 dB | Phantom: yes
  ID: mic-audix-m1255b
  Character: Chameleons — depending on capsule, they're transparent overheads, focused spot mics, or ambient capture. Tiny size disappears into setups. Sound is clean, accurate, uncolored — reveals source rather than imposing character.
  Engineering: Prepolarized (electret) condenser with interchangeable capsule system — threads onto body for quick pattern changes. Miniature form (~5 inches, pencil-thin) minimizes acoustic shadowing. Small diaphragm provides excellent transient response and off-axis coherence. 200Ω output. 48V phantom.
  Heritage: Audix's miniature installed-sound and studio condenser with interchangeable capsule system. Swiss Army knives of small condensers. Multiple capsule heads available (cardioid, hypercardioid, omni, shotgun).

- Crown GLM-200 (Crown)
  Qty: 1 | Patterns: hypercardioid | Output Z: 200 ohm | Gain demand: 38 dB | Phantom: yes
  ID: mic-crown-glm200
  Character: Tiny condenser with surprisingly full, clear sound. Designed for close-miking with hypercardioid focus on source. Presence lift adds clarity to spoken word without thinning.
  Engineering: Prepolarized electret in miniature housing (~6mm diameter). Hypercardioid provides maximum gain-before-feedback in lavalier application. Very small capsule = excellent HF extension and minimal interference effects. 200Ω output. 12–48V phantom.
  Heritage: Crown (Elkhart IN) best known for PZM boundary mics. GLM series applied their miniature expertise to lavalier condenser design. Crown pioneered boundary and miniature tech since 1970s.

### Ribbon

- Coles 4038 (Coles Electroacoustics)
  Qty: 2 | Patterns: figure-8 | Output Z: 300 ohm | Gain demand: 55 dB | Phantom: no
  ID: mic-coles-4038
  Character: Thick, warm, almost velvety quality — vocals and brass sound like they're heard in a beautiful room, not through a mic. Natural darkness on top that is never harsh, with addictive midrange weight making everything sound expensive and classic. BBC-broadcast smoothness.
  Engineering: 37×25mm corrugated aluminum ribbon element, ~0.6µm thick, in powerful Alnico magnet assembly. High-quality steel-laminate output transformer at 300Ω. ⚠️ Very sensitive to preamp input Z — loading below 1.2kΩ audibly thins bass and reduces output. Perfect null at 90°. Extremely sensitive to wind/plosives.
  Heritage: Designed by BBC Engineering Division, manufactured by STC/Coles since 1956. Standard BBC broadcast mic for decades. Abbey Road sessions, Beatles recordings. Design unchanged for nearly 70 years.

- Cascade Fat Head II (Cascade Microphones)
  Qty: 2 | Patterns: figure-8 | Output Z: 200 ohm | Gain demand: 55 dB | Phantom: no
  ID: mic-cascade-fathead
  Character: Surprisingly open and detailed for a budget ribbon — bright enough to sit in a mix without being buried. Smooth midrange handles guitar amps beautifully. With Lundahl LL2912 upgrade: more refined, silky character, starts approaching mics costing 5–10× more. Best bang-for-buck ribbon available.
  Engineering: Long-geometry aluminum ribbon (~2µm thick, 47mm long) in neodymium magnet motor. Stock transformer adequate but constrained in LF saturation. Lundahl LL2912 (Swedish nickel-core) dramatically improves transient response, lowers distortion, changes impedance curve, reduces preamp sensitivity. Figure-8 with good null depth.
  Heritage: Cascade Microphones (Olympia WA), founded by Michael Chiriac. Made Chinese-manufactured ribbons accessible to project studios mid-2000s. Lundahl LL2912 upgrade path championed by DIY community, later offered as factory option.

- Peavey PVM 45ir (Peavey)
  Qty: 1 | Patterns: figure-8 | Output Z: 300 ohm | Gain demand: 58 dB | Phantom: no
  ID: mic-peavey-pvm45ir
  Character: Genuine ribbon warmth and smoothness despite PVM dynamic branding. Natural, unforced top end that won't tire your ears. Darker and silkier than any dynamic, with pleasantly vintage quality. A hidden ribbon gem in a dynamic mic's clothing.
  Engineering: Thin aluminum ribbon element in permanent magnet assembly with output transformer at ~300Ω. ⚠️ Phantom power is a potential hazard — transformer-isolated phantom shouldn't damage ribbon but best to avoid entirely. Preamp input Z should be ≥1.5kΩ for optimal frequency response. Figure-8 pattern inherent to ribbon design.
  Heritage: One of the most obscure ribbon mics from a major manufacturer. PVM series branding disguises a genuine ribbon. Flew completely under the radar — categorized in the "PVM dynamic" line rather than marketed as a ribbon.

### Dynamic

- Sennheiser MD 441-U (Sennheiser)
  Qty: 2 | Patterns: supercardioid | Output Z: 200 ohm | Gain demand: 55 dB | Phantom: no
  ID: mic-sennheiser-md441
  Character: The Swiss Army knife of dynamics — almost condenser-like clarity and openness completely atypical for a dynamic. Top end extends well beyond most dynamics with sophisticated presence that never turns shrill. 5-position bass rolloff makes it instantly adaptable — full on floor toms, tight on snare, articulate on vocals.
  Engineering: Double-diaphragm interference tube design with internal acoustic labyrinth achieving supercardioid directivity maintaining pattern shape from 200Hz–15kHz — extraordinary for a dynamic. 5-position bass switch via acoustic damping chambers (not electronic filtering). Humbucking coil for excellent EMI rejection. 2-position presence boost (~+3dB @ 5–6kHz).
  Heritage: Introduced 1966, continuously manufactured since. Broadcast standard across European radio/TV for decades. Used by NASA, BBC. Acoustic labyrinth design was revolutionary — often called "the best dynamic mic ever made."

- Sennheiser 521 Black Fire (Sennheiser)
  Qty: 2 | Patterns: cardioid | Output Z: 200 ohm | Gain demand: 55 dB | Phantom: no
  ID: mic-sennheiser-521
  Character: Punchy, forward midrange that sits well in dense mixes — slightly leaner and more focused than SM57-style, with Sennheiser clarity in upper mids. Direct quality makes it excellent for live and close-miking, with controlled proximity effect.
  Engineering: Moving-coil capsule with proprietary Sennheiser diaphragm treatment. "Black Fire" designation refers to matte black housing and refined capsule damping. 200Ω output. Integrated XLR connector. Robust stage-ready construction.
  Heritage: Part of Sennheiser's Black Fire series (late 1970s–80s). Designed as professional stage and studio dynamics. Relatively obscure today, overshadowed by MD 421 and MD 441, but well-regarded in European pro audio.

- Sennheiser BF 509 Black Fire (Sennheiser)
  Qty: 2 | Patterns: supercardioid | Output Z: 200 ohm | Gain demand: 55 dB | Phantom: no
  ID: mic-sennheiser-bf509
  Character: Tighter and more directional than the 521 — focused "spotlight" quality isolating the source with surgical precision. Dry, present sound even in noisy environments. Tonally leaner with more bite in upper mids.
  Engineering: Supercardioid pattern provides ~10dB rejection at 120° off-axis with rear lobe at 180°. Capsule optimized for close-miking with controlled proximity effect. Shares Black Fire series robust metal construction. 200Ω output.
  Heritage: Supercardioid variant of the Black Fire series. Designed for maximum isolation in demanding stage/broadcast environments. Increasingly collected as vintage Sennheiser dynamics.

- Electro-Voice RE20 (Electro-Voice)
  Qty: 1 | Patterns: cardioid | Output Z: 150 ohm | Gain demand: 58 dB | Phantom: no
  ID: mic-ev-re20
  Character: The definition of "smooth authority" — deep, full, broadcast-ready. Bottom end rumbles without blooming, top end present without aggression. Virtually no proximity effect, so sound stays consistent 1 inch to 6 inches. Warm, authoritative quality flattering male voices especially. Round, full-bodied kick drum punch.
  Engineering: Variable-D technology: rear of capsule ported through multiple slots of varying acoustic path length, canceling proximity effect. Large-diaphragm dynamic, heavy magnet (726g total). Internal pop filter (foam + steel mesh). Bass rolloff switch (~400Hz, gentle slope). 150Ω output.
  Heritage: Introduced 1968, successor to RE15. Variable-D technology patented by EV remains unique to their line. Default US broadcast mic — if you've heard a radio DJ in America, you've likely heard an RE20. Design unchanged 55+ years.

- Electro-Voice PL10 (Electro-Voice)
  Qty: 1 | Patterns: cardioid | Output Z: 150 ohm | Gain demand: 56 dB | Phantom: no
  ID: mic-ev-pl10
  Character: Workhorse dynamic with strong, assertive midrange — punchy and forward, cutting through without a lot of EQ help. Moderate proximity warmth for close-miking. Not as refined as RE20 but more than capable.
  Engineering: Standard moving-coil element in cardioid configuration. Solid but utilitarian construction compared to N/Dym or RE series. 150Ω output.
  Heritage: EV's "Performance Line" (1980s) — stage-oriented dynamics. EV's answer to Shure SM dominance in the live sound market.

- EV N/D967 (Electro-Voice)
  Qty: 1 | Patterns: supercardioid | Output Z: 150 ohm | Gain demand: 53 dB | Phantom: no
  ID: mic-ev-nd967
  Character: Bright, open, articulate — top end almost sparkles like a condenser. Forward, aggressive presence cuts through a loud band. Low end controlled and tight, not boomy.
  Engineering: N/DYM neodymium magnet for higher sensitivity and extended response. Supercardioid with ~15dB rejection at 150°. VOB (Voice Optimized Bass) filter reduces LF handling noise/proximity. Warm Grip handle. 150Ω output.
  Heritage: EV's flagship vocal dynamic, mid-1990s. N/DYM (neodymium) magnet technology was a genuine innovation influencing the entire dynamic mic industry.

- EV N/D868 (Electro-Voice)
  Qty: 1 | Patterns: supercardioid | Output Z: 150 ohm | Gain demand: 54 dB | Phantom: no
  ID: mic-ev-nd868
  Character: Bass-drum specialist with huge, subterranean low end and focused click in attack range. Delivers modern, scooped kick sound right off the capsule — deep thump with cutting beater attack. Devastating at its intended job.
  Engineering: Large diaphragm tuned for extended LF response with N/DYM neodymium magnet. Capsule voiced with broad midrange scoop and narrow presence peak for "point and shoot" kick drum tone. High SPL handling. 20Hz–10kHz response. 150Ω output.
  Heritage: EV's tuned kick drum specialist from the N/DYM series. Answer to AKG D112 and Shure Beta 52A.

- EV N/D767a (Electro-Voice)
  Qty: 1 | Patterns: supercardioid | Output Z: 150 ohm | Gain demand: 54 dB | Phantom: no
  ID: mic-ev-nd767a
  Character: Versatile vocal dynamic — brighter and more open than SM58, smoother presence than 967. Nice middle ground — warmth of SM58 with extra openness toward Beta 58A territory.
  Engineering: N/DYM neodymium magnet. "a" suffix = revision with improved internal shock mount and refined response. Supercardioid. 50Hz–19kHz. 150Ω output.
  Heritage: Mid-tier N/DYM vocal mic. "a" revision improved shock mounting and frequency response over original N/D767.

- EV N/D468 (Electro-Voice)
  Qty: 2 | Patterns: supercardioid | Output Z: 150 ohm | Gain demand: 55 dB | Phantom: no
  ID: mic-ev-nd468
  Character: Aggressive, brighter instrument dynamic — snappy and cutting on snare and toms. Cuts through a mix extremely well with pronounced presence peak suited to drum miking.
  Engineering: N/DYM neodymium with capsule tuned for pronounced presence peak (5–8kHz). Supercardioid provides excellent rejection for close-miking tightly spaced sources. 70Hz–18kHz. 150Ω output.
  Heritage: Instrument workhorse of the N/DYM series. Particularly popular in the drum miking community as alternative to SM57.

- EV N/D478 (Electro-Voice)
  Qty: 1 | Patterns: supercardioid | Output Z: 150 ohm | Gain demand: 55 dB | Phantom: no
  ID: mic-ev-nd478
  Character: Very similar to 468 but slightly smoother in the presence region. Same cutting quality with a touch more versatility beyond drums.
  Engineering: Same N/DYM platform. Slightly different capsule tuning — less pronounced presence peak than 468. Supercardioid. 70Hz–17kHz. 150Ω output.
  Heritage: Subtle variant of N/D468 with tamer presence peak making it marginally more versatile for amps and brass.

- EV N/D457 (Electro-Voice)
  Qty: 1 | Patterns: cardioid | Output Z: 150 ohm | Gain demand: 56 dB | Phantom: no
  ID: mic-ev-nd457
  Character: Honest, balanced, reliable workhorse — less flashy than 468 but solid midrange with controlled highs. Unassuming but effective instrument mic that never sounds bad.
  Engineering: N/DYM neodymium in more modest capsule assembly. Cardioid (not super) gives wider sweet spot at cost of slightly less rejection. Robust metal. 80Hz–15kHz. 150Ω output.
  Heritage: Affordable entry into N/DYM line for instrument applications. Direct SM57 competitor on price.

- EV N/D357 (Electro-Voice)
  Qty: 1 | Patterns: cardioid | Output Z: 150 ohm | Gain demand: 56 dB | Phantom: no
  ID: mic-ev-nd357
  Character: Most basic N/DYM family member — warm and utilitarian. Classic "dynamic mic" sound with less top-end extension than siblings. Pleasantly unfussy.
  Engineering: Entry-level N/DYM capsule with neodymium magnet in simpler configuration. Cardioid. 80Hz–14kHz. 150Ω output.
  Heritage: Entry point of the N/DYM series. Gave budget-conscious users access to EV's neodymium technology.

- Shure SM7B (Shure)
  Qty: 1 | Patterns: cardioid | Output Z: 150 ohm | Gain demand: 60 dB | Phantom: no
  ID: mic-sm7b
  Character: Smooth, warm, full-bodied — famously flattering on vocals. Intimate and present without ever becoming harsh or sibilant. Natural richness makes voices sound mature and authoritative. That silky, close-mic'd vocal character from "Thriller."
  Engineering: ⚠️ Low sensitivity (-59dBV) demands high-gain, low-noise preamp — expect 55–65dB gain for speaking level. Internal EM shielding (steel plate behind capsule) provides outstanding hum rejection near transformers/CRTs. Air-suspension shock mount. Switchable presence boost (+5dB @ 5–6kHz) and bass rolloff (-6dB/oct @ 400Hz).
  Heritage: Descendant of SM7 (1973), derived from SM57/SM58 capsule platform. SM7B revision (2001) added improved EM shielding. Fame exploded after Michael Jackson's "Thriller" vocals at Westlake Audio. Dominant broadcast/podcast mic of 2020s.

- Shure Beta 52A (Shure)
  Qty: 1 | Patterns: supercardioid | Output Z: 150 ohm | Gain demand: 64 dB | Phantom: no
  ID: mic-beta52a
  Character: One-trick pony — devastating trick. Massive, floor-shaking kick drum with pointed beater attack. "Boing" and "thud" perfectly balanced right off the capsule. Not subtle, not versatile, absolutely authoritative on bass drums.
  Engineering: Purpose-built supercardioid element with hardened steel mesh grille for inside-kick placement. Shaped frequency response via capsule tuning and rear-cavity design — midrange scoop is acoustic, not electronic. Supercardioid rejects hi-hat bleed. 20Hz–10kHz shaped. 150Ω output.
  Heritage: Part of Shure's Beta line (1990s), purpose-designed kick drum mic. "A" suffix = revised mounting hardware. Default kick drum mic in live sound alongside D112 and RE20.

- Shure SM57 (Shure)
  Qty: 5 | Patterns: cardioid | Output Z: 150 ohm | Gain demand: 56 dB | Phantom: no
  ID: mic-sm57
  Character: The sound of rock and roll — aggressive, gritty, utterly reliable. On snare, the iconic "crack." On guitar amp, the snarl and grind. It's not pretty, it's not transparent, it's the SM57 — it sounds like records sound. The presence peak is its defining superpower.
  Engineering: Unidyne III moving-coil capsule (same element as SM58 without ball grille/pop filter). Pronounced presence peak from capsule resonance + tapered grille geometry. 150Ω output. Die-cast metal body, nearly indestructible. Handles SPL well over 160dB at grille.
  Heritage: Introduced 1965 as Unidyne III Model SM57. 60+ years continuous production. Possibly the most-used mic in recorded music. Mandated by US Secret Service for presidential podiums since LBJ.

- Shure SM58 (Shure)
  Qty: 2 | Patterns: cardioid | Output Z: 150 ohm | Gain demand: 54 dB | Phantom: no
  ID: mic-sm58
  Character: The SM57's more polished sibling — ball grille tames aggressive presence peak, adding warmth and smoothness. Direct, punchy, cuts through a band without sibilance. Generous musical proximity effect lets singers work the mic for dynamic control.
  Engineering: Identical Unidyne III capsule as SM57 — spherical steel mesh grille acts as acoustic diffuser, smoothing presence peak by ~2–3dB vs SM57 flat grille. Ball also serves as integral pop filter. Pneumatic shock mount inside grille reduces handling noise. 150Ω output.
  Heritage: Introduced 1966 alongside SM57. World's most popular vocal mic — estimated hundreds of millions sold. Defined the modern handheld dynamic vocal mic form factor. Has been dropped, thrown, submerged, run over, and frozen without failing.

- Telefunken M80 (Telefunken Elektroakustik)
  Qty: 1 | Patterns: cardioid | Output Z: 200 ohm | Gain demand: 50 dB | Phantom: no
  ID: mic-telefunken-m80
  Character: What happens when someone designs a dynamic without compromise — condenser-like clarity with a top end that shimmers rather than peaks. Proximity tightly controlled giving warmth without mud. Vocals sound open, modern, detailed.
  Engineering: Proprietary moving-coil capsule maintaining pattern shape across frequency range better than most dynamics. Extended 18kHz response via lightweight diaphragm and careful acoustic damping. Precision-machined steel mesh grille manages proximity effect. Low handling noise. 200Ω output.
  Heritage: Designed as modern premium dynamic to compete with condensers in vocal applications. Released 2010s, cult following among live engineers wanting condenser quality without condenser fragility. "New school" dynamic design.

- Telefunken M80s (Telefunken Elektroakustik)
  Qty: 1 | Patterns: cardioid | Output Z: 200 ohm | Gain demand: 50 dB | Phantom: no
  ID: mic-telefunken-m80s
  Character: Same capsule character as M80 — condenser-like clarity and detail — in a compact form ideal for tight miking. Same open, modern sound.
  Engineering: Same proprietary capsule as M80 in shorter body. Compact form fits tight spaces around drums and amps. 200Ω output.
  Heritage: Short-body "instrument" variant of the M80, same capsule in more compact form factor.

- Telefunken M81s (Telefunken Elektroakustik)
  Qty: 3 | Patterns: cardioid | Output Z: 200 ohm | Gain demand: 52 dB | Phantom: no
  ID: mic-telefunken-m81s
  Character: The M80's more even-tempered sibling — smoother and more balanced with less presence peak. Excellent where you want the source to come through without the mic adding its own character. The "workhorse" to the M80's "star."
  Engineering: Different capsule tuning than M80 — flatter frequency response with less presence emphasis. Short-body construction. Neodymium magnet, strong output. Well-behaved cardioid with minimal off-axis coloration. 200Ω output.
  Heritage: Instrument-focused companion to M80. M81/M81s complete Telefunken's dynamic line for applications where M80's vocal-optimized presence isn't appropriate.

- Yamaha MZ205 (Yamaha)
  Qty: 3 | Patterns: cardioid | Output Z: 250 ohm | Gain demand: 55 dB | Phantom: no
  ID: mic-yamaha-mz205
  Character: Clear, slightly bright vocal dynamic projecting well through Yamaha PA. Capable and underrated, with clean midrange that doesn't get muddy.
  Engineering: Standard moving-coil element tuned for vocal clarity. Yamaha manufacturing precision shows in consistent unit-to-unit performance. 250Ω output — slightly higher than 150Ω standard.
  Heritage: Yamaha's integrated PA system mics — designed to complement EM/EMX-series powered mixers. Primarily Japan/Asia-Pacific distribution. Quite rare in US/Europe. Genuine obscurity.

- Yamaha MZ204 (Yamaha)
  Qty: 2 | Patterns: cardioid | Output Z: 250 ohm | Gain demand: 56 dB | Phantom: no
  ID: mic-yamaha-mz204
  Character: Slightly less output and marginally more reserved top end than MZ205, but clean, professional-sounding. Good clarity for speech and general vocal duties.
  Engineering: Similar to MZ205 with different capsule tuning. Likely less powerful magnet assembly. Same robust Yamaha build. 250Ω output.
  Heritage: Step below MZ205 in Yamaha hierarchy. Same Japan-market integrated PA mic line. Even more obscure than MZ205.

- Yamaha MZ103 (Yamaha)
  Qty: 1 | Patterns: cardioid | Output Z: 250 ohm | Gain demand: 57 dB | Phantom: no
  ID: mic-yamaha-mz103
  Character: Entry-level Yamaha MZ — warm, simple, unassuming. Lacks the extended top of MZ205 but has pleasantly smooth quality that's fine for basic duties.
  Engineering: Budget end of MZ line — simpler capsule, likely ferrite magnet. Fewer machining refinements. Still benefits from Yamaha QC. 250Ω output.
  Heritage: Yamaha's entry-level professional dynamic. Among the most obscure mics on this list — very limited documentation outside Japanese sources.

- Heil Sound PR 40 (Heil Sound)
  Qty: 1 | Patterns: cardioid | Output Z: 600 ohm | Gain demand: 50 dB | Phantom: no
  ID: mic-heil-pr40
  Character: Rich, full, incredibly deep low end rivaling much larger mics — sounds huge. Smooth uncolored midrange, top end extends further than expected giving "large-diaphragm condenser in a dynamic body" feel. Warm without being dark, present without being harsh.
  Engineering: Proprietary 1.5-inch low-mass aluminum diaphragm in large magnet assembly. ⚠️ 600Ω output impedance unusually high — some preamps may not load optimally, tonal shifts possible depending on preamp input Z. Internal humbucking coil for EMI rejection. Genuine 28Hz bass extension.
  Heritage: Designed by Bob Heil — pioneer who built first concert sound systems for The Who and Grateful Dead (early 1970s). PR 40 became flagship of Heil's 2000s microphone re-entry. Decades of live sound knowledge in a recording mic.

- Beyerdynamic M201 (Beyerdynamic)
  Qty: 1 | Patterns: hypercardioid | Output Z: 200 ohm | Gain demand: 56 dB | Phantom: no
  ID: mic-beyer-m201
  Character: Transparency and openness sounding more like a small condenser than a dynamic. On snare, captures wire sizzle and shell tone equally. On guitar amps, detailed without being edgy. Natural, unforced quality that disappears — a favourite of engineers who know about it.
  Engineering: Moving-coil with hypercardioid pattern, ~12dB rejection at 110°. 18kHz extension — exceptional for a dynamic — via lightweight diaphragm assembly. Small rear lobe requires careful positioning. Compact and low-profile, fits tight drum setups. 200Ω output.
  Heritage: Introduced 1970s. Continuous favourite of top-tier engineers (Bob Clearmountain, Geoff Emerick) for decades. Great secret weapon of the drum world. Low public visibility but one of the most respected dynamics among professionals.

- Beyerdynamic M422n(c) (Beyerdynamic)
  Qty: 3 | Patterns: cardioid | Output Z: 200 ohm | Gain demand: 55 dB | Phantom: no
  ID: mic-beyer-m422nc
  Character: Flexible, mid-voiced Beyerdynamic instrument dynamic — typical Beyer clarity and precision without being clinical. n(c) variant keeps low end tight even close-miked. Punchy, controlled sound. Between M201 neutrality and SM57 mid-forward punch.
  Engineering: "n(c)" = internal acoustic filter compensating for proximity effect (similar concept to EV Variable-D but different implementation). More consistent across varying working distances. Cardioid, well-controlled. 200Ω output.
  Heritage: Professional M-series, dating to 1960s. Workhorse instrument dynamic widely used in European broadcast and studio. "n(c)" = noise-cancelling variant with proximity compensation.

- Beyerdynamic X99 (Beyerdynamic)
  Qty: 1 | Patterns: hypercardioid | Output Z: 200 ohm | Gain demand: 54 dB | Phantom: no
  ID: mic-beyer-x99
  Character: Compact hypercardioid — extremely focused and present. Bright, articulate with excellent off-axis rejection. Tight and precise with good transient response.
  Engineering: Hypercardioid pattern ~6dB narrower than cardioid — excellent for isolating single source in multi-mic setups. Beyerdynamic capsule precision ensures consistent pattern. Compact form factor. 200Ω output.
  Heritage: Obscure member of Beyerdynamic's X-series for professional stage/broadcast. Designed for compact high-directivity applications.

- Audix D1 (Audix)
  Qty: 1 | Patterns: cardioid | Output Z: 200 ohm | Gain demand: 48 dB | Phantom: no
  ID: mic-audix-d1
  Character: Sharp and attack-forward — emphasizes "stick hit" quality on snare and transient bite of percussion. Bright mic that cuts through heavy stage volume effortlessly. Not the most flattering, but extremely effective.
  Engineering: VLM (Very Low Mass) diaphragm tracks transients with near-condenser speed. High output + excellent SPL handling. Cardioid with minimal off-axis coloration. 200Ω output.
  Heritage: Audix D-series drum mic line. VLM (Very Low Mass) diaphragm technology — lighter diaphragms = faster transient response.

- Audix i5 (Audix)
  Qty: 3 | Patterns: cardioid | Output Z: 200 ohm | Gain demand: 48 dB | Phantom: no
  ID: mic-audix-i5
  Character: The "honest SM57" — similar weight and authority but flatter, more truthful response. Where SM57 adds its own character, i5 presents source more faithfully. On guitar amps, captures the tone you hear in the room. Balanced and natural rather than hyped.
  Engineering: VLM capsule with deliberately flatter response than SM57 — reduced presence peak. Output hotter than SM57 (2.5 vs 1.6 mV/Pa) means less preamp gain needed. Excellent SPL handling (140+ dB). 200Ω output.
  Heritage: Direct SM57 competitor. Designed to be "what the SM57 would sound like if designed today without legacy coloration."

- Audix D2 (Audix)
  Qty: 1 | Patterns: hypercardioid | Output Z: 200 ohm | Gain demand: 50 dB | Phantom: no
  ID: mic-audix-d2
  Character: Tuned for toms — captures full, round body of the shell with stick attack. More full-bodied than D1 with low-mid warmth bringing out shell resonance. Hypercardioid keeps adjacent bleed manageable.
  Engineering: VLM capsule in hypercardioid optimized for tom-range frequencies. Emphasizes 100–300Hz where tom fundamentals live while maintaining transient clarity. Compact clip-mountable housing. 200Ω output.
  Heritage: The tom mic in Audix's D-series (D1=snare, D2=rack tom, D4=floor tom, D6=kick).

- Audix D4 (Audix)
  Qty: 1 | Patterns: hypercardioid | Output Z: 200 ohm | Gain demand: 50 dB | Phantom: no
  ID: mic-audix-d4
  Character: Bigger, deeper D2 — captures full weight and resonance of large toms and lower-pitched drums with authority. Satisfying low-end thump with enough top bite for defined attack. Massive on floor tom.
  Engineering: VLM capsule tuned for lower frequencies. 40Hz extension suitable for large toms and small bass drums. Hypercardioid maintains isolation in tight drum setups. 200Ω output.
  Heritage: The "large tom" mic in Audix's D-series lineup.

- Audix D6 (Audix)
  Qty: 2 | Patterns: cardioid | Output Z: 200 ohm | Gain demand: 48 dB | Phantom: no
  ID: mic-audix-d6
  Character: The "instant metal kick drum" mic — modern, heavily scooped with cannon-like sub-bass thump and laser-focused beater click. Requires zero EQ for modern rock/metal. Almost too aggressive for other genres, but for heavy music, perfection.
  Engineering: Large-diaphragm capsule in ported housing creating mid-scoop through acoustic phase cancellation — essentially a tuned resonator. VLM maintains transient speed. Cardioid optimized for sub-100Hz kick energy. Shaped response is almost mix-ready. 200Ω output.
  Heritage: Released early 2000s, became the kick drum mic of choice for an entire generation of metal and rock engineers. Changed the workflow — "point the D6 at the beater and you're done."

- Audix OM5 (Audix)
  Qty: 1 | Patterns: hypercardioid | Output Z: 200 ohm | Gain demand: 48 dB | Phantom: no
  ID: mic-audix-om5
  Character: Premium vocal dynamic — clear, open, more detailed than SM58. Hypercardioid isolates from stage noise. Mature, warm midrange with extended top bringing out vocal detail.
  Engineering: VLM diaphragm provides condenser-like transient response with dynamic durability. Hypercardioid ~12dB side rejection. Requires careful monitor positioning (avoid directly behind). 200Ω output.
  Heritage: Audix's premium vocal dynamic line. VLM technology delivers condenser-like transient response.

- Audix OM6 (Audix)
  Qty: 1 | Patterns: hypercardioid | Output Z: 200 ohm | Gain demand: 46 dB | Phantom: no
  ID: mic-audix-om6
  Character: Most detailed dynamic vocal in Audix's line — top end genuinely condenser-like, capturing breath and air most dynamics miss. Vocals sound intimate and present. Remarkably transparent for a dynamic.
  Engineering: Even lighter VLM diaphragm than OM5 pushing response to genuine 20kHz. Tighter hypercardioid than OM5. Higher output (3.16 mV/Pa) means less gain needed — excellent SNR for a dynamic. 200Ω output.
  Heritage: Sits just below flagship OM7 in Audix vocal hierarchy. Represents upper range of what VLM technology can extract from a dynamic capsule.

- Audix OM7 (Audix)
  Qty: 1 | Patterns: hypercardioid | Output Z: 200 ohm | Gain demand: 56 dB | Phantom: no
  ID: mic-audix-om7
  Character: Ultimate feedback-rejecting vocal mic — tightest pattern of any Audix dynamic. Controlled, focused, almost studio-like precision. Lower output picks up far less bleed. The mic for singing next to a Marshall stack.
  Engineering: ⚠️ Lower sensitivity is intentional — capsule tuned for maximum rejection at expense of raw output. Demands clean high-gain preamp (55+ dB). Tightest hypercardioid in Audix line with very small rear lobe. Maximum gain-before-feedback. 200Ω output.
  Heritage: Flagship of Audix OM vocal series. OM7's design philosophy — sacrifice sensitivity for rejection — makes it an extreme specialist for the loudest stages.

- Peavey PVM 520i (Peavey)
  Qty: 1 | Patterns: cardioid | Output Z: 250 ohm | Gain demand: 55 dB | Phantom: no
  ID: mic-peavey-pvm520i
  Character: Solid, punchy dynamic with distinct midrange forwardness — "live sound" character that projects well. Slightly aggressive, no-nonsense quality sitting well in band mixes.
  Engineering: Moving-coil with attention to off-axis rejection. 250Ω output slightly higher than 150Ω standard, may affect some preamp loading. Robust construction from Peavey's live-sound heritage.
  Heritage: Peavey's PVM (Pro Vocal Microphone) series (late 80s–90s). Surprisingly competitive mics often overlooked due to brand perception.

- AKG D112 v1 (AKG)
  Qty: 1 | Patterns: cardioid | Output Z: 210 ohm | Gain demand: 54 dB | Phantom: no
  ID: mic-akg-d112
  Character: The "egg" — big, round kick drum sound with clear "click" on beater. Natural midrange scoop gives scooped tone working without EQ for most kick sounds. Less aggressive than D6 but more colored than RE20. Default kick drum mic for decades.
  Engineering: Large ~1.2-inch diaphragm for high-SPL low-frequency applications. Handles 160+ dB at capsule. Round housing is acoustically functional — chamber behind capsule contributes to mid-scoop through acoustic phase cancellation. 210Ω output.
  Heritage: Introduced by AKG 1980 as successor to legendary D12/D12E. "The egg" — instantly recognizable shape. Perhaps most widely used kick drum mic in the world. v1 (original) preferred by many for warmer, more "vintage" character.

- Audio-Technica ATM25 (Audio-Technica)
  Qty: 3 | Patterns: hypercardioid | Output Z: 200 ohm | Gain demand: 55 dB | Phantom: no
  ID: mic-atm25
  Character: Versatile, full-bodied dynamic with impressive low-end depth — captures kick with genuine sub-bass weight, handles toms with rich tone. Hypercardioid keeps things tight. Less shaped than D112 or D6, more natural, less "pre-EQ'd." Very underrated.
  Engineering: Large-diaphragm moving-coil in rugged compact housing. Hypercardioid ~12dB rejection at 110°. 30Hz LF extension notable for this size. Three-unit set makes consistent tom miking ideal. 200Ω output.
  Heritage: Originally part of A-T's "Artist" series. Strong following among live/studio engineers. Now discontinued but highly regarded. Three matched units ideal for consistent tom setup.

- sE Electronics V7 (sE Electronics)
  Qty: 1 | Patterns: supercardioid | Output Z: 200 ohm | Gain demand: 48 dB | Phantom: no
  ID: mic-se-v7
  Character: Modern dynamic punching well above its price — clarity and openness rivaling mics costing 3-4× more. Vocals rich, detailed, dimensional. Supercardioid focused without "tunnel" effect. Genuine contender against Telefunken M80 at fraction of cost.
  Engineering: Proprietary aluminum voice coil on custom-tuned diaphragm. Internal shock mount + grille design minimize handling noise and pop. Extended 19kHz response captures harmonics most dynamics truncate. Supercardioid with small rear lobe. All-metal housing. 200Ω output.
  Heritage: sE Electronics (Shanghai/UK, founded 2000). V7 released ~2017, breakout product — widely praised as best sub-$100 dynamic vocal mic. Represents new wave of Chinese-designed pro audio competing at highest level.

- Lewitt MTP 550 DM (Lewitt)
  Qty: 1 | Patterns: cardioid | Output Z: 275 ohm | Gain demand: 48 dB | Phantom: no
  ID: mic-lewitt-mtp550
  Character: Refined and warm — smoothness making vocals sound polished and comfortable. Less aggressive than Shure/Sennheiser, more "produced" quality straight off the capsule. Grown-up sounding, doesn't need to shout.
  Engineering: Lewitt proprietary capsule emphasizing low-noise performance and consistent quality through tight manufacturing tolerances. 275Ω output slightly above average. Well-controlled cardioid with minimal off-axis coloration.
  Heritage: Lewitt (Vienna, Austria, founded 2009) by former AKG engineers. Austrian precision engineering combined with modern design. Entry into dynamic vocal market.

### Subkick

- The Kraken Subkick (The Kraken)
  Qty: 1 | Patterns: omni | Output Z: 200 ohm | Gain demand: 20 dB | Phantom: no
  ID: mic-kraken-subkick
  Character: Captures the chest-thumping, floor-shaking sub-bass of kick drum no regular mic can reproduce. Adds physical, seismic quality when blended with conventional kick mic. Alone it's a sine wave earthquake. Blended, it adds "feel it in your ribcage" dimension.
  Engineering: Loudspeaker used in reverse — large speaker cone is extremely sensitive to low-frequency pressure waves. 6–10 inch speaker generates voltage from sound pressure. Impedance-matching transformer brings speaker Z up to mic-level. Captures ONLY sub-bass frequencies (~20–100Hz). Positioning critical — too close = wind noise.
  Heritage: Subkick concept popularized by Yamaha SKRM-100 (NS-10 woofer repurposed as mic). DIY versions common since 1990s. The Kraken is a purpose-built commercial subkick with proper impedance matching and mounting.

### Boundary

- Shure SM91 (Shure)
  Qty: 1 | Patterns: half-cardioid | Output Z: 150 ohm | Gain demand: 35 dB | Phantom: yes
  ID: mic-shure-sm91
  Character: Inside a kick drum: clean, precise capture of beater attack and shell tone with clarity dynamics can't match. Reveals full tonal complexity. On flat surfaces: captures acoustic space with remarkable evenness. Transparent, articulate, modern.
  Engineering: Half-cardioid boundary (PZM-style) condenser. On flat surface, boundary effect eliminates comb filtering — direct and reflected paths identical, coherent +6dB summation, no phase cancellation. Condenser element provides extended 20Hz–20kHz and high 7.9mV/Pa sensitivity. 150Ω output. 48V phantom.
  Heritage: Shure's boundary/PZM-style condenser. Became a staple of the "pillow inside kick drum" technique. Many top engineers blend it with a dynamic outside for ultimate kick sound.

- Beyerdynamic TG D71 (Beyerdynamic)
  Qty: 1 | Patterns: half-cardioid | Output Z: 200 ohm | Gain demand: 40 dB | Phantom: yes
  ID: mic-beyer-tgd71
  Character: Focused, punchy kick drum sound with well-defined beater attack. Cleaner and more hi-fi than dynamic kick mic, with tightness in low end working well for modern production. Slightly more "voiced" for kick than the neutral SM91.
  Engineering: Back-electret condenser in boundary housing optimized for kick drum. More deliberately shaped response than SM91 — subtle mid-scoop and presence peak for "ready to use" tone. Compact flat housing with integrated mounting clip. TG designation = robust live construction. 200Ω output.
  Heritage: Part of Beyerdynamic's TG (Touring Gear) series for professional live/touring. Beyerdynamic's modern approach to kick drum capture competing with SM91.

### Measurement

- miniDSP UMIK-1 (miniDSP)
  Qty: 1 | Patterns: omni | Output Z: 0 ohm | Gain demand: 0 dB | Phantom: no
  ID: mic-umik1
  Character: Not designed to flatter — designed to tell the truth. Reveals acoustic reality of your room and speaker system with clinical accuracy. A measurement instrument making your monitoring environment audible and fixable.
  Engineering: MEMS/electret capsule with omnidirectional pattern + USB audio interface with 24-bit ADC. Individual factory calibration file (by serial number) corrects specific capsule deviation to ±1dB 20Hz–20kHz. USB output bypasses preamp — plug and play with REW, Dirac. Omni pattern essential for capturing reflected energy.
  Heritage: miniDSP (Hong Kong) specializes in digital signal processing and room correction. UMIK-1 democratized accurate room measurement, previously requiring expensive Earthworks or B&K systems.

### Field Recorder

- Zoom H4n Pro (Zoom)
  Qty: 1 | Patterns: xy-stereo | Output Z: 0 ohm | Gain demand: 0 dB | Phantom: no
  ID: mic-zoom-h4npro
  Character: Portable recording studio in your hand — built-in X/Y mics capture surprisingly natural, open stereo image with good depth. Won't replace dedicated chains but remarkably capable for field recording, rehearsal capture, ambient room sound.
  Engineering: Matched electret condenser X/Y pair at 90° or 120° (selectable). Coincident configuration ensures mono compatibility. Two XLR/TRS combo inputs with 48V phantom for external mics. Internal 24-bit/96kHz ADC. SD card storage. Built-in limiter and LPF.
  Heritage: Zoom (Tokyo) created the handheld recorder category with H4 (2006). H4n Pro (2016) improved preamp noise floor. Ubiquitous in filmmaking, journalism, music production, and podcasting.

## Preamps / Channel Strips

### all-valve

- Manley Dual Mono (Manley)
  Channels: 2 | Input Z: 1200 ohm | Output Z: 200 ohm | Gain: 40-60 dB | Transformer: yes
  ID: pre-manley-dual-mono
  Character: Maximum harmonic weight. Thick, warm, and dimensional. The tube sound at its fullest.
  Engineering: All-valve signal path — zero solid-state in audio. High-voltage tube rails. Transformer I/O. 1–1.2kΩ mic input, 10kΩ line, 100kΩ DI. Pentode "Attitude" mode adds up to 87dB gain with heavy saturation.
  EQ / features: Integrated (not independent): Bass lift (60Hz), Mid/High (2.5k/4k bell or 12kHz shelf)

- Thermionic Culture Rooster 2 (Thermionic Culture)
  Channels: 2 | Input Z: 1400 ohm | Output Z: 200 ohm | Gain: 40-60 dB | Transformer: yes
  ID: pre-rooster2
  Character: Aggressive tube saturation when pushed. Clean at low gain, filthy at high gain. The "rooster" sound.
  Engineering: All-valve. Input valve: 12AX7/ECC83 (verify — some units have ECC81/12AT7). Transformer I/O. At 3.5:1 bridging with a ribbon mic, bass character changes dramatically.

- A-Designs MP-2A (A-Designs)
  Channels: 2 | Input Z: 1200 ohm | Output Z: 200 ohm | Gain: 20-60 dB | Transformer: Cinemag custom input + Cinemag custom output
  ID: pre-adesigns-mp2a
  Character: Rich, complex, and dimensional. The EF86 pentode delivers harmonics that triode-only designs cannot — thick mids, silky top, and a three-dimensional depth that sits vocals perfectly in a mix. Four switchable tone colors from a single unit.
  Engineering: All-valve "True Tube": EF86 pentode input → 12BH7 dual-triode output stage. Zero ICs, transistors, or solid-state in audio path. Cinemag custom I/O transformers. Point-to-point wiring, film capacitors. ~1,200Ω mic input. Hi-Z DI input routes direct to transformer. External PSU with custom toroidal transformer. -20dB pad, 48V phantom, phase switch.
  Heritage: Designed by Jon Erickson of A-Designs Audio (West Hills, CA). A unique all-tube topology — not a clone of any vintage circuit. The EF86 pentode input stage sets it apart from every triode-input preamp on the market.

### discrete-ss

- Stam Audio SA-69 / Helios Type 69 (Stam Audio)
  Channels: 1 | Input Z: 1200 ohm | Output Z: 75 ohm | Gain: 20-70 dB | Transformer: Sowter (Lustraphone-type) input + output
  ID: pre-stam-sa69
  Character: The sound of Olympic Studios — punchy, thick, and euphonically colored. Fat low-mids and a forward, gutsy presence. When pushed, it breaks up with musical grit that flatters drums and aggressive vocals.
  Engineering: Discrete Class A solid-state — NOT a tube circuit (commonly misidentified). Sowter Lustraphone-type transformers on I/O provide iron coloration. Single-ended discrete transistor gain stage. 3-band inductor EQ integral to the module. 1,200Ω mic input impedance.
  EQ / features: 3-band inductor EQ: Bass (60/100/200 Hz), Mid (700/1.6k/3.2k Hz), Treble (8k/10k/12k Hz) — boost/cut
  Heritage: Clone of the Helios Type 69 — the input module from the silver Olympic Studios desk designed by Dick Swettenham (1969). Used for Led Zeppelin II–IV, Rolling Stones, Hendrix. Fewer than 50 Helios consoles were ever built.

- A-Designs Ventura SE (A-Designs)
  Channels: 1 | Input Z: 1500 ohm / Hi-Z 10000 ohm | Output Z: 150 ohm | Gain: 20-72 dB | Transformer: Jensen input + Cinemag output
  ID: pre-ventura-se
  Character: Versatile single-channel workhorse with transformer coloration. Three inputs (Mic/Line/DI) route through a single discrete gain stage to three independent balanced outputs. Warm and musical without being dark — the iron adds body and dimension.
  Engineering: Discrete solid-state with Jensen input transformer (mic) and Cinemag output transformer. 3-in/3-out topology: Mic (~1,500Ω), Line (~10kΩ), DI (~1MΩ hi-Z) each with dedicated balanced XLR output. Single signal path — not 3 separate preamp channels. 72dB max gain.
  Heritage: Designed by Jon Erickson of A-Designs Audio. The SE (Special Edition) features upgraded Jensen and Cinemag transformers. Bridges the gap between the transparent Pacifica and the all-tube MP-2A in the A-Designs lineup.

- Chandler Germanium Pre #1 (Chandler Limited)
  Channels: 1 | Input Z: 600 ohm | Output Z: 75 ohm | Gain: 20-78 dB | Transformer: yes
  ID: pre-chandler-germanium-1
  Character: Germanium transistors give a thick, slightly fuzzy tone utterly unlike silicon. Pushes into musical distortion beautifully — not harsh or brittle, but warm and woolly. The Feedback/Thick switch takes it from "heavy" to "heavier." Two units allow stereo germanium saturation.
  Engineering: Germanium PNP junction transistors. Transformer-coupled. 600Ω input — ⚠️ caution with ribbons (2:1 bridging ratio with 300Ω source loads the ribbon more than higher-Z preamps). Feedback/Thick switch changes negative feedback amount, altering distortion character and gain structure.
  Heritage: Designed by Wade Goeke of Chandler Limited (Shelbyville, Iowa). Germanium transistors are period-correct to 1950s–60s era, before silicon transistors dominated. The Germanium Pre reimagines early transistor electronics in a modern recording tool.

- Chandler Germanium Pre #2 (Chandler Limited)
  Channels: 1 | Input Z: 600 ohm | Output Z: 75 ohm | Gain: 20-78 dB | Transformer: yes
  ID: pre-chandler-germanium-2
  Character: Same germanium character as #1. Pair for stereo drum overheads through germanium saturation, or use independently on different sources.
  Engineering: Identical to unit #1. Match settings for stereo operation.
  Heritage: Second unit — pair enables stereo germanium recording or two channels of colored tracking.

- API 3122V (API)
  Channels: 2 | Input Z: 1500 ohm | Output Z: 75 ohm | Gain: 10-68 dB | Transformer: API proprietary (AP2516 input, AP2503 output)
  ID: pre-api-3122v
  Character: The API sound: punchy, present, and immediately "finished." Transients crack, guitars jump, drums hit. That distinctive forward midrange cuts through any mix without trying.
  Engineering: Discrete Class A/B built around the API 2520 op-amp (vintage variant). API custom-wound transformers: AP2516 input, AP2503 output. 1,500Ω mic input. Switchable 48V phantom, polarity, -20dB pad. +30dBu max output with ~20dB headroom above nominal.
  Heritage: API founded by Saul Walker in 1968. The 2520 discrete op-amp is the DNA of the API sound — a hand-wired replacement for IC op-amps that defined the punchy American studio character of the 1970s.

- NPNG DMP-2NW (NPNG)
  Channels: 2 | Input Z: 5000 ohm / Hi-Z 10000 ohm | Output Z: 50 ohm | Gain: 0-68 dB | Transformer: no
  ID: pre-npng-dmp2nw
  Character: Transparent and clean. You hear the microphone, not the preamp. The ribbon specialist.
  Engineering: Transformerless output. 5,000Ω input (10kΩ in Hi-Z mode). Ideal ribbon preamp: high Z, no transformer loading. 16.7:1 bridging with Coles 4038.

- Wunder PEQ2R (Wunder Audio)
  Channels: 2 | Input Z: 1500 ohm | Output Z: 75 ohm | Gain: 20-72 dB | Transformer: yes
  ID: pre-wunder-peq2r
  Character: Neve-inspired inductor EQ sound. Thick low end, silky highs. The "big console" tone.
  Engineering: Discrete Class A. Inductor EQ with Neve-style frequency points. Transformer-coupled.
  EQ / features: Inductor EQ — classic Neve-style frequency selection

- Wunder PEQ2/4R (Wunder Audio)
  Channels: 1 | Input Z: 1500 ohm | Output Z: 75 ohm | Gain: 20-78 dB | Transformer: Carnhill/St. Ives input + NICO (Neve-Inspired Custom Output)
  ID: pre-wunder-peq24r
  Character: The Neve 1081 sound, refined. Four bands of inductor EQ with the big, warm, iron-colored bottom and silky top. More surgical than the 2-band PEQ2R while retaining all the musicality.
  Engineering: Discrete Class A. Carnhill/St. Ives input transformer, NICO output transformer. 4-band inductor EQ with classic Neve 1081 frequency selections. 1,500Ω mic input. The 4-band topology allows overlapping mid-frequency sculpting unavailable in the 2-band PEQ2R.
  EQ / features: 4-band inductor EQ: Low (35–220 Hz), Low-Mid (250–1.2k Hz), Hi-Mid (1.5–6.5k Hz), High (10k shelf) — Neve 1081 topology
  Heritage: Built by Wunder Audio (Austin, TX) as a faithful Neve 1081 4-band preamp/EQ recreation. Proprietary NICO output transformer wound to original Neve specifications. The 4-band sibling of the PEQ2R.

- Tonelux MP5A (Tonelux)
  Channels: 1 | Input Z: 1500 ohm | Output Z: 75 ohm | Gain: 20-66 dB | Transformer: Tonelux custom input + output transformer
  ID: pre-tonelux-mp5a
  Character: Clean, focused, and immediate. The built-in Tilt EQ is ingenious — one knob rocks the frequency balance from warm to bright, like tilting a seesaw. Separate gain and output fader controls let you drive the preamp stage independently of output level.
  Engineering: Discrete solid-state, 500-series (VPR Alliance). Transformer-coupled mic in and out. 20dB pad, 48V phantom, polarity switch. Inner knob = mic pre gain, outer fader = output level. 8-segment LED meter (adjustable to +28 VU), peak LED at +18dBu. Front-panel combo XLR/DI for hi-Z instruments. Tilt EQ bypasses via hard-wire switch.
  EQ / features: Tilt EQ — single knob pivots spectral balance ±6dB around ~800Hz (boost highs/cut lows or vice versa). Hard-wire bypass switch.
  Heritage: Designed by Paul Wolff, former API engineer and founder of Tonelux (Gardena, CA). The Tilt EQ — a single control shifting spectral center of gravity — became his signature circuit concept. Currently housed in A-Designs 503HR chassis.

### hybrid-tube

- Pendulum Quartet II (Pendulum Audio)
  Channels: 2 | Input Z: 2400 ohm | Output Z: 75 ohm | Gain: 10-74 dB | Transformer: Jensen nickel-core
  ID: pre-pendulum-quartet
  Character: Swiss army knife. Clean to warm depending on tube/transformer drive. Split-section routing gives immense flexibility.
  Engineering: Hybrid tube/solid-state. Jensen nickel-core transformers. Independently routable sections (mic pre, EQ, line amp). 2,400Ω input — good for most mic types.
  EQ / features: Independent 4-band inductor EQ per channel, switchable pre/post

- Sonic Farm Creamer+ (Sonic Farm)
  Channels: 2 | Input Z: 2400 ohm | Output Z: 50 ohm | Gain: 20-70 dB | Transformer: yes
  ID: pre-sonic-farm-creamer
  Character: Creamy tube saturation (hence the name). Smooth, musical distortion character.
  Engineering: Tube gain stage + solid-state output. Transformer-balanced. 2,400Ω input.

- Drawmer 1968 MKII (Drawmer)
  Channels: 2 | Input Z: 1200 ohm | Output Z: 75 ohm | Gain: 0-36 dB | Transformer: no
  ID: pre-drawmer-1968
  Character: Tube comp/preamp combo. Warm FET gain reduction with tube makeup.
  Engineering: Only 1×12AX7 tube, FET gain reduction. Reclassified from Zone A to Zone B — very low magnetic field despite tube.

- Eclair Evil Twin #1 (Jensen mod) (Eclair Engineering)
  Channels: 1 | Input Z: 1500 ohm | Output Z: 150 ohm | Gain: 20-55 dB | Transformer: Jensen JT-115K-E input + Jensen nickel-core output
  ID: pre-evil-twin-1
  Character: Fat, warm, and unapologetically colored. Tube Class A with Jensen iron on both input and output creates a unique saturation character — not Neve, not API, distinctly "Evil Twin." Harmonics are complex and musical, especially on vocals and guitar.
  Engineering: ⚠️ Desktop unit, NOT 19" rack mount. Tube Class A gain stage with Jensen JT-115K-E input transformer (mic mod replacing stock) + Jensen nickel-core output transformer. Reclassified hybrid-tube — tube is the primary gain element with transformer I/O.
  Heritage: Designed by Bruce Seifried, Eclair Engineering (Williamsburg, MA, since 1991). Tube Class A topology — NOT a Neve-based design. Jensen transformer modifications are aftermarket upgrades adding different iron character to the stock unit.

- Eclair Evil Twin #2 (Jensen mod) (Eclair Engineering)
  Channels: 1 | Input Z: 1500 ohm | Output Z: 150 ohm | Gain: 20-55 dB | Transformer: Jensen JT-115K-E input + Jensen nickel-core output
  ID: pre-evil-twin-2
  Character: Same Jensen-modded Evil Twin character as #1. Pair for stereo saturation.
  Engineering: Identical Jensen mod to unit #1. Match settings for stereo operation.
  Heritage: Second Evil Twin with identical Jensen modifications — pair enables stereo tube tracking or two channels of colored character.

### dc-coupled

- Pueblo Audio JR2/2 (Pueblo Audio)
  Channels: 2 | Input Z: 5000 ohm | Output Z: 50 ohm | Gain: 0-74 dB | Transformer: no
  ID: pre-pueblo-jr22
  Character: Ultra-transparent. DC-coupled for zero phase shift at any frequency. Surgical.
  Engineering: DC-coupled, transformerless. 5,000Ω input. Electronically balanced output.

- Undertone MPEQ-1 #1 (Undertone Audio)
  Channels: 1 | Input Z: 5000 ohm | Output Z: 50 ohm | Gain: 0-72 dB | Transformer: no
  ID: pre-undertone-mpeq1-1
  Character: Transparent, revealing, and surgically clean — captures the source with zero coloration. The built-in EQ in SEP mode becomes an independent outboard processor, effectively giving you two tools in one box.
  Engineering: DC-coupled, transformerless. 5,000Ω input. SEP mode breaks the preamp→EQ chain, routing each to independent patchbay I/O. The preamp alone is among the most transparent available. Two units with SEP mode gives 4 independent processing blocks.
  EQ / features: SEP mode — separate EQ and preamp routing. Parametric EQ section can be inserted independently via patchbay.
  Heritage: Undertone Audio (Portland, OR). The MPEQ-1 combines a DC-coupled transparent preamp with an independent EQ section — the SEP (Separate) mode lets you patch the preamp and EQ as two independent devices via the patchbay.

- Undertone MPEQ-1 #2 (Undertone Audio)
  Channels: 1 | Input Z: 5000 ohm | Output Z: 50 ohm | Gain: 0-72 dB | Transformer: no
  ID: pre-undertone-mpeq1-2
  Character: Same transparent character as #1. Pair for stereo operation or 4 independent blocks via dual SEP mode.
  Engineering: Identical to unit #1. Dual SEP mode: 2 preamps + 2 EQs = 4 independent patch points.
  EQ / features: SEP mode — separate EQ and preamp routing
  Heritage: Second MPEQ-1 — pair provides stereo transparent preamp + 2 independent EQ sections (4 processing blocks total in SEP mode).

## Dynamics Processors

### variable-mu

- Retro Instruments 176 (Retro Instruments)
  Channels: 1 | Detection: program-dependent | Attack: ~10ms (program-dependent) | Release: ~250ms–1s (program-dependent) | Ratios: variable-mu (continuous) | Sidechain: no | Link: no
  ID: comp-retro-176
  Character: Recreates the UA 176 — the tube predecessor to the 1176, NOT a tube version of the 1176. Warm, program-dependent compression with beautiful harmonic content. Vocals emerge with weight and dimension.
  Engineering: ⚠️ Recreates UA 176 (tube predecessor to 1176) — commonly misidentified as "tube 1176." Variable-mu gain reduction via dual-triode. Transformer-coupled I/O. Zone A: significant magnetic field from power and output transformers.

- Retro STA-Level Gold (Retro Instruments)
  Channels: 1 | Detection: program-dependent | Attack: program-dependent (auto) | Release: program-dependent (auto) | Ratios: variable-mu auto | Sidechain: no | Link: no
  ID: comp-retro-sta-level
  Character: Gates Sta-Level lineage — purely variable-mu, NO LA-2A connection. Musical, vibe-heavy compression that adds mojo and vintage character. The "just sounds right" compressor.
  Engineering: ⚠️ Purely variable-mu (Gates Sta-Level lineage), NOT optical. Single-knob operation — program-dependent attack/release. Tube gain reduction. Zone A: significant magnetic field.

- Retro Instruments Revolver (Retro Instruments)
  Channels: 1 | Detection: program-dependent | Attack: program-dependent (6 positions) | Release: program-dependent (6 positions) | Ratios: variable-mu (6 modes) | Sidechain: no | Link: no
  ID: comp-retro-revolver
  Character: Six selectable compression "flavors" in one unit — from gentle leveling to aggressive pumping. Retro's swiss army knife. Each position changes the entire compression character, not just attack/release.
  Engineering: Variable-mu with 6-position rotary selecting different time constant/ratio combinations. Each position is a distinct compression "preset" via different tube stage biasing. Transformer I/O. Zone A.

### fet-tube

- Drawmer 1968 MKII (Drawmer)
  Channels: 2 | Detection: peak/RMS switchable | Attack: 0.2–30ms | Release: 50ms–2s | Ratios: 1.5:1–20:1 | Sidechain: yes | Link: yes
  ID: comp-drawmer-1968
  Character: Tube warmth with FET speed — the best of both worlds. Versatile tracking and mix compressor. Switchable peak/RMS detection lets you dial between punchy and smooth.
  Engineering: 1×12AX7 tube in signal path + FET gain reduction element. ⚠️ Reclassified Zone B — very low magnetic field despite tube content. External sidechain. Stereo link.

### ss-limiter

- Pendulum PL-2 (Pendulum Audio)
  Channels: 2 | Detection: peak | Attack: <1ms | Release: 50ms–1s | Ratios: brickwall limiting | Sidechain: no | Link: yes
  ID: comp-pendulum-pl2
  Character: Transparent brickwall limiter. Catches peaks without coloring the signal. The safety net before A/D conversion — you hear nothing until it saves you.
  Engineering: ⚠️ NOT Zone A. Transformerless Class A solid-state — no tubes, no output transformer. Reclassified Zone B. The last analog stage before the Dangerous AD+.

### fet-1176

- Mohog MoFET 76 (Mohog Audio)
  Channels: 1 | Detection: peak | Attack: 20µs–800µs | Release: 50ms–1.1s | Ratios: 4:1, 8:1, 12:1, 20:1, All | Sidechain: no | Link: no
  ID: comp-mohog-mofet76
  Character: Boutique 1176 with attention to Rev D–F era character. Punchy, aggressive FET compression with musical all-buttons mode. Handcrafted precision from a small builder.
  Engineering: JFET feedback topology faithful to UA 1176 Rev D/F. Discrete Class A. Transformer-coupled I/O. All-buttons mode for parallel crush ratios.

- Wes Audio Beta76 #1 (Wes Audio)
  Channels: 1 | Detection: peak | Attack: 20µs–800µs | Release: 50ms–1.1s | Ratios: 4:1, 8:1, 12:1, 20:1, All | Sidechain: no | Link: no
  ID: comp-wes-beta76-1
  Character: Classic 1176 character — fast, aggressive, colored. All-buttons mode for parallel crush. Having two units enables stereo 1176 compression.
  Engineering: ⚠️ Beta76 has NO digital recall (that is the ng76 successor). JFET feedback topology. Discrete Class A output. Transformer I/O.

- Wes Audio Beta76 #2 (Wes Audio)
  Channels: 1 | Detection: peak | Attack: 20µs–800µs | Release: 50ms–1.1s | Ratios: 4:1, 8:1, 12:1, 20:1, All | Sidechain: no | Link: no
  ID: comp-wes-beta76-2
  Character: Second unit — pair with #1 for stereo 1176 compression on drums, bus, or vocals. Matched pair behavior.
  Engineering: Identical to unit #1. Link via matched settings for stereo operation.

### optical

- Anthony DeMaria Labs ADL-1000 (Anthony DeMaria Labs)
  Channels: 1 | Detection: program-dependent | Attack: 10ms (program-dependent) | Release: 60ms–1s (dual-stage) | Ratios: 3:1–variable (limit) | Sidechain: no | Link: no
  ID: comp-adl-1000
  Character: The smoothest compression topology made by a master builder. T4B opto cell responds like a slow, musical hand on the fader. Vocals sit with effortless authority — the "million-dollar vocal chain" LA-2A descendant.
  Engineering: T4B opto cell (EL panel + LDR). Dual time-constant release (fast transient + slow recovery). Program-dependent behavior — attack/release shift with input level. Tube gain stage. Transformer-coupled output.

- Audioscape DA-3A (Audioscape Engineering)
  Channels: 2 | Detection: program-dependent | Attack: program-dependent | Release: dual-stage (fast + slow) | Ratios: variable (compress/limit) | Sidechain: no | Link: yes
  ID: comp-audioscape-da3a
  Character: Audioscape's LA-3A-inspired optical compressor — solid-state optical with more speed and edge than the tube-based ADL-1000. Two channels, linkable for stereo bus duty. Clean, controlled, musical.
  Engineering: Solid-state optical compressor inspired by UREI LA-3A topology. Opto-resistive gain element. Faster attack than tube optical designs. Transformer-coupled I/O. Stereo link capability.

### vca-channel

- dbx 160XT #1 (xfmr mod) (dbx)
  Channels: 1 | Detection: true RMS | Attack: 1ms–50ms (program-dependent) | Release: 50ms–1s (program-dependent) | Ratios: 1:1–∞:1 (continuously variable) | Sidechain: yes | Link: no
  ID: comp-dbx-160xt-1
  Character: The definitive "hit it hard and it sounds better" compressor. dbx VCA with transformer mod adds iron warmth to the surgical precision. Drums explode, bass gets concrete-solid, vocals pop. The harder you push, the more it rewards.
  Engineering: Feed-forward VCA, true RMS detection. ⚠️ Output transformer modification — adds harmonic saturation and slightly warms the otherwise clinical VCA character. dbx VCA chip (THAT 2150-series). Continuously variable ratio from 1:1 to ∞:1.

- dbx 160XT #2 (xfmr mod) (dbx)
  Channels: 1 | Detection: true RMS | Attack: 1ms–50ms (program-dependent) | Release: 50ms–1s (program-dependent) | Ratios: 1:1–∞:1 (continuously variable) | Sidechain: yes | Link: no
  ID: comp-dbx-160xt-2
  Character: Second unit — pair with #1 for stereo VCA bus compression or use independently as parallel crush.
  Engineering: Same transformer mod as unit #1. Link via matched settings for stereo operation.

- dbx 160VU (dbx)
  Channels: 2 | Detection: true RMS | Attack: program-dependent | Release: program-dependent | Ratios: 1:1–∞:1 (continuously variable) | Sidechain: yes | Link: yes
  ID: comp-dbx-160vu
  Character: The original discrete VCA dbx — warmer, fatter, more "analog" than the later 160XT with its chip-based VCA. VU meters. Classic 80s drum bus punch. The compressor that defined how compressed drums sound in the 1980s.
  Engineering: Original discrete VCA design (NOT THAT chip-based like 160XT) — hand-matched transistor pairs. True RMS detection. Large VU meters. Heavier, more saturated character than chip VCA descendants. 2-channel with stereo link.

### vca-bus

- Audioscape 4000E (Audioscape Engineering)
  Channels: 2 | Detection: peak/RMS | Attack: 0.1–30ms | Release: 100ms–1.2s + auto | Ratios: 2:1, 4:1, 10:1 | Sidechain: yes | Link: yes
  ID: comp-audioscape-4000e
  Character: The SSL 4000E bus compressor — the definitive "mix bus glue." Tight, punchy, and defined. Makes mixes sound "finished" with that 80s–90s hit-record sheen. The most famous compressor topology in mixing history.
  Engineering: Quad VCA design cloned from SSL 4000E channel bus compressor. THAT VCA chips. Stereo sidechain link. Auto-release option. Peak/RMS switchable detection.

- Audioscape G-Comp (Audioscape Engineering)
  Channels: 2 | Detection: peak/RMS | Attack: 0.1–30ms | Release: 100ms–1.2s + auto | Ratios: 2:1, 4:1, 10:1 | Sidechain: yes | Link: yes
  ID: comp-audioscape-gcomp
  Character: The SSL G-series bus compressor — slightly cleaner and more transparent than the 4000E, with more headroom. The "modern" SSL bus sound. Subtle glue that adds cohesion without obvious compression artifacts.
  Engineering: Clones SSL G-series (later revision) bus compressor. Improved VCA linearity over 4000E design. Same control set. Having both 4000E and G-Comp provides range from "punchy colored" to "transparent glue."

### diode-bridge

- Audioscape MK-609 (Audioscape Engineering)
  Channels: 2 | Detection: peak/RMS | Attack: 0.5–50ms | Release: 100ms–1.5s + auto | Ratios: 1.5:1–6:1 + limit | Sidechain: no | Link: yes
  ID: comp-audioscape-mk609
  Character: Neve 33609-style diode bridge compression — smooth British compression adding density and weight without aggression. The warmth of transformers and the musicality of the BA440 gain cell. Everything sounds bigger and more important.
  Engineering: Clones Neve 33609 topology. Zener diode bridge BA440-style gain cell. Transformer-coupled I/O with Neve-spec Marinair-type transformers. Stereo link. The "other" bus compressor — where SSL is punchy, Neve is warm.

### zener

- Audioscape D-Comp (Audioscape Engineering)
  Channels: 2 | Detection: peak | Attack: <1ms | Release: 100ms–2s | Ratios: limiting | Sidechain: no | Link: no
  ID: comp-audioscape-dcomp
  Character: EMI TG12413 zener limiter clone — the sound of Abbey Road Studios. Dense, colored, and aggressive. Adds thickness and "British weight" that flatters drums, bass, and full mixes.
  Engineering: ⚠️ Clones the EMI TG12413 zener limiter, NOT a Distressor. Zener diode bridge topology. The gain reduction circuit used on Beatles and Pink Floyd records at Abbey Road.

### discrete-transistor

- Tonelux Dynalux (Tonelux)
  Channels: 2 | Detection: peak/RMS blendable | Attack: 0.2–100ms | Release: 50ms–3s | Ratios: 2:1–20:1 | Sidechain: yes | Link: yes
  ID: comp-tonelux-dynalux
  Character: All-discrete transistor with blendable detection topology. Can morph between transparent and colored, fast and slow, punchy and smooth. The chameleon compressor.
  Engineering: ⚠️ Tonelux compressor is the Dynalux, not "Dynacomp." All-discrete transistor network. Continuously variable peak-to-RMS detection blend. No VCA chips, no opto, no tubes — pure transistor.

### multiband

- Drawmer 1973 (Drawmer)
  Channels: 2 | Detection: RMS per band | Attack: 0.5–30ms per band | Release: 50ms–2s per band | Ratios: 1:1–20:1 per band | Sidechain: yes | Link: yes
  ID: comp-drawmer-1973
  Character: 3-band analog multiband compressor. Surgical frequency-selective dynamics without digital artifacts. Tame bass without affecting vocals, control sibilance without dulling cymbals.
  Engineering: Three independent compression bands with variable crossover points. Each band has its own ratio, threshold, attack, release. Analog crossover filters. Stereo link per band.

### de-esser

- dbx 902 #1 (dbx)
  Channels: 1 | Detection: spectral ratio VCA | Attack: auto | Release: auto | Ratios: spectral | Sidechain: no | Link: no
  ID: comp-dbx-902-1
  Character: Industry-standard hardware de-esser. Transparent sibilance control without dulling the vocal. Spectral ratio detection means it works on the relationship between HF and program level, not absolute level.
  Engineering: dbx 900-series module (fits dbx 900 rack). Spectral ratio VCA — detects sibilance by ratio of HF energy to overall signal level. Broadband or HF-only gain reduction. Auto attack/release.

- dbx 902 #2 (dbx)
  Channels: 1 | Detection: spectral ratio VCA | Attack: auto | Release: auto | Ratios: spectral | Sidechain: no | Link: no
  ID: comp-dbx-902-2
  Character: Second unit in dbx 900 rack — having two enables de-essing on stereo bus or two vocal chains simultaneously.
  Engineering: Same dbx 900-series module. Paired with unit #1 in shared 900 rack frame.

### spectral

- Dolby 740 #1 (Dolby)
  Channels: 2 | Detection: spectral | Attack: N/A | Release: N/A | Ratios: N/A — spectral processing, NOT dynamics | Sidechain: no | Link: no
  ID: comp-dolby-740-1
  Character: Dolby SR spectral processor. Adds sheen, depth, and noise reduction without traditional compression. The "secret sauce" of analog recording — makes things sound expensive.
  Engineering: Dolby SR decode module — spectral processor with companding across multiple frequency bands. NOT a dynamics unit. 2-channel.

### gate

- Drawmer DS201 (Drawmer)
  Channels: 2 | Detection: frequency-conscious key | Attack: 5µs–2ms | Release: 5ms–2s | Ratios: gate (range: 0–80dB) | Sidechain: yes | Link: yes
  ID: comp-drawmer-ds201
  Character: Precise, musical gating with frequency-conscious key filter. Tightens drums without killing the ring. The standard by which all gates are measured.
  Engineering: ⚠️ Model is DS201, not "Power Gate." VCA gate with frequency-conscious key input — HPF and LPF in sidechain allow triggering on specific frequency ranges. External key input for trigger from another source.

## Equalizers

### passive-inductor

- Langevin Mini Massive Passive (Langevin (Manley))
  Channels: 2 | Bands: 4-band passive inductor (Low, Low-Mid, Hi-Mid, High) per channel with boost/cut and bandwidth control, plus HPF/LPF | Input Z: 20000 ohm | Output Z: 200 ohm | Transformer: Langevin steel-core output
  ID: eq-langevin-mmp
  Character: Huge, lush, and three-dimensional. Passive boost curves interact musically — adds weight and air simultaneously. The tube makeup stage imparts warmth without effort.
  Engineering: Passive inductor EQ with tube gain makeup amplifier. No active components in the EQ path — inductors and capacitors only. Tube makeup amp restores level. Langevin steel-core output transformers. Zone A: output and power transformers radiate.
  Heritage: Compact version of the Manley Massive Passive, designed by Craig "Hutch" Hutchison. Shares the same Pultec-lineage passive-inductor topology in a smaller package.

### tube-reactive

- Retro 2A3 (Retro Instruments)
  Channels: 2 | Bands: 3-band tube program EQ (Bass boost/cut, Mid cut, Treble boost/cut) per channel — directly inspired by Gates/RCA broadcast EQ topology | Input Z: 10000 ohm | Output Z: 600 ohm | Transformer: Custom output transformer
  ID: eq-retro-2a3
  Character: Warm, weighty, and unmistakably tube. The 2A3 power tube in the signal path adds harmonic richness that no solid-state EQ can replicate. Broad, musical curves that enhance rather than correct.
  Engineering: ⚠️ Uses a 2A3 directly-heated triode (power tube) in the audio path — extremely unusual for a modern EQ. Tube-reactive circuitry where the EQ response changes with tube behavior. Transformer-coupled output. Zone A: significant magnetic field from power supply and output transformers.
  Heritage: Named for the 2A3 directly-heated triode power tube used in the audio path. Inspired by vintage broadcast program EQ designs from the Gates/RCA era.

### active-inductor

- Iron Age Audio Works V2 (Iron Age Audio Works)
  Channels: 1 | Bands: 4-band active inductor EQ (Low shelf, Low-Mid bell, Hi-Mid bell, High shelf) with selectable frequencies per band | Input Z: 10000 ohm | Output Z: 100 ohm | Transformer: yes
  ID: eq-iron-age-v2
  Character: Iron-inductor personality — punchy lows, textured midrange presence, silky top end. Each band interacts musically with the others. Adds weight and definition simultaneously.
  Engineering: Active inductor EQ with hand-wound iron-core inductors. Discrete Class A gain makeup. Transformer-coupled I/O. Hand-built, small-batch production.
  Heritage: Boutique hand-built inductor EQ. Small-batch American manufacturing with hand-wound inductors.

- Tonelux Equalux (Tonelux)
  Channels: 2 | Bands: 3-band active inductor EQ (Low shelf, Mid bell, High shelf) per channel with HPF/LPF filters | Input Z: 10000 ohm | Output Z: 75 ohm | Transformer: no
  ID: eq-tonelux-equalux
  Character: Musical and punchy — the inductor topology adds a tactile quality to boosts and cuts. Neve-esque warmth with modern precision. Subtle harmonic enhancement from discrete Class A circuitry.
  Engineering: Discrete Class A active inductor EQ. Custom-wound inductors per band. Proprietary ToneLux discrete op-amps. Low-impedance output — drives long cable runs and transformer-coupled inputs without issue.
  Heritage: Designed by Paul Wolff (API, DeMaria). Inductor-based topology sharing DNA with classic Neve and API EQ designs.

- Chandler Limited Tone Control #1 (Chandler Limited)
  Channels: 1 | Bands: 3-band EQ (Bass, Presence, Treble) with EMI/Abbey Road–style frequency selections plus high-pass filter | Input Z: 10000 ohm | Output Z: 75 ohm | Transformer: Marinair input + output
  ID: eq-chandler-tc-1
  Character: The sound of Abbey Road — smooth, musical, and instantly familiar. The Marinair transformers add a silky iron coloration. Presence band is the secret weapon — adds clarity without harshness.
  Engineering: Discrete Class A circuitry with Marinair transformers on input and output. Based on the EMI TG12345 channel EQ section. Germanium and silicon transistor gain stages. The transformer saturation characteristics add musical harmonic content at higher levels.
  Heritage: Based on the EMI TG12345 console EQ section — the desk used for Abbey Road, Dark Side of the Moon, and countless EMI/Abbey Road recordings.

- Chandler Limited Tone Control #2 (Chandler Limited)
  Channels: 1 | Bands: 3-band EQ (Bass, Presence, Treble) with EMI/Abbey Road–style frequency selections plus high-pass filter | Input Z: 10000 ohm | Output Z: 75 ohm | Transformer: Marinair input + output
  ID: eq-chandler-tc-2
  Character: The sound of Abbey Road — smooth, musical, and instantly familiar. The Marinair transformers add a silky iron coloration. Presence band is the secret weapon — adds clarity without harshness.
  Engineering: Discrete Class A circuitry with Marinair transformers on input and output. Based on the EMI TG12345 channel EQ section. Germanium and silicon transistor gain stages. The transformer saturation characteristics add musical harmonic content at higher levels.
  Heritage: Based on the EMI TG12345 console EQ section — the desk used for Abbey Road, Dark Side of the Moon, and countless EMI/Abbey Road recordings.

### tilt

- Tonelux Tilt EQ #1 (Tonelux)
  Channels: 1 | Bands: Single tilt control — rotates entire spectral balance around a center frequency. Clockwise = brighter, counter-clockwise = darker | Input Z: 10000 ohm | Output Z: 75 ohm | Transformer: no
  ID: eq-tonelux-tilt-1
  Character: Subtle and transparent. One knob reshapes the entire tonal balance without any single frequency jumping out. Perfect for gentle correction without artifacts.
  Engineering: Discrete Class A tilt EQ. Single control pivots the frequency response around a center point (~1kHz). Minimal phase shift. ToneLux discrete op-amps. Extremely low noise floor.

- Tonelux Tilt EQ #2 (Tonelux)
  Channels: 1 | Bands: Single tilt control — rotates entire spectral balance around a center frequency. Clockwise = brighter, counter-clockwise = darker | Input Z: 10000 ohm | Output Z: 75 ohm | Transformer: no
  ID: eq-tonelux-tilt-2
  Character: Subtle and transparent. One knob reshapes the entire tonal balance without any single frequency jumping out. Perfect for gentle correction without artifacts.
  Engineering: Discrete Class A tilt EQ. Single control pivots the frequency response around a center point (~1kHz). Minimal phase shift. ToneLux discrete op-amps. Extremely low noise floor.

## Outboard Processors

### parallel-send-return

- TC Electronic M300 (TC Electronic)
  Type: reverb | Channels: 2 | Format: digital | Input Z: 20000 ohm | Output Z: 100 ohm | Transformer: no
  ID: fx-tc-m300
  Character: Clean and usable reverbs in a compact package. TC's algorithms are musical and sit well in a mix without dominating. Great default reverb for tracking.
  Engineering: Digital stereo reverb/effects processor. 24-bit/48kHz conversion. Balanced TRS I/O. Dual-engine architecture — can run two effects simultaneously. TC VSSS algorithm set.

- TC Electronic M3000 (TC Electronic)
  Type: reverb | Channels: 2 | Format: digital | Input Z: 20000 ohm | Output Z: 100 ohm | Transformer: no
  ID: fx-tc-m3000
  Character: Lush, three-dimensional reverb tails. The VSS-3 algorithm creates spaces that feel real and dimensional. Rich early reflections with smooth, dense late-field decay.
  Engineering: Flagship digital reverb/effects. 24-bit/96kHz conversion. AES/EBU + S/PDIF digital I/O alongside balanced analog. Dual-engine with routing matrix. VSS-3, VSS-4 algorithms. External MIDI/GPI control.
  Heritage: The studio-grade TC reverb — a step up from the M3000's predecessors. Same core algorithms used on countless records.

- Roland SRV-3030 (Roland)
  Type: reverb | Channels: 2 | Format: digital | Input Z: 20000 ohm | Output Z: 100 ohm | Transformer: no
  ID: fx-roland-srv3030
  Character: Spatial and dimensional. The RSS algorithms create reverbs with a sense of actual three-dimensional space rather than simple decay tails. Unique character distinct from TC or Lexicon.
  Engineering: Digital reverb processor with Roland RSS 3D spatial processing. 24-bit conversion. Balanced XLR + TRS I/O. S/PDIF digital I/O. Preset-based with editing.
  Heritage: Roland/BOSS RSS (Roland Sound Space) technology — 3D spatial processing algorithms.

- Roland SRV-330 (Roland)
  Type: reverb | Channels: 2 | Format: digital | Input Z: 20000 ohm | Output Z: 100 ohm | Transformer: no
  ID: fx-roland-srv330
  Character: Distinctive 3D spatial quality. The "Dimensional Space" algorithms produce reverbs that wrap around the listener rather than sitting behind the source. Unique and recognizable.
  Engineering: Dimensional Space Reverb with RSS technology. 20-bit AD/DA. Balanced TRS I/O. 30 reverb algorithms with 3D spatial processing. Real-time parameter control.
  Heritage: Dimensional Space Reverb — Roland's RSS (Roland Sound Space) spatial algorithm from the SRV line.

- Behringer Virtualizer Pro V-Verb (Behringer)
  Type: reverb | Channels: 2 | Format: digital | Input Z: 20000 ohm | Output Z: 100 ohm | Transformer: no
  ID: fx-behringer-vverb
  Character: Functional and straightforward. Usable reverbs for tracking and monitoring. Not the most refined algorithms but reliable and immediate.
  Engineering: Digital multi-effects processor focused on reverb. 24-bit conversion. Balanced XLR + TRS I/O. S/PDIF digital. Wide selection of reverb types plus delay, modulation effects.

- Kurzweil Eclipse (Kurzweil)
  Type: multi-fx | Channels: 2 | Format: digital | Input Z: 20000 ohm | Output Z: 100 ohm | Transformer: no
  ID: fx-kurzweil-eclipse
  Character: Pristine and deeply programmable. The algorithms have a crystalline quality — reverbs are transparent and dimensional, modulations are smooth and artifact-free. The deepest editing of any hardware FX unit.
  Engineering: Flagship multi-effects processor with dual-engine architecture. 24-bit/96kHz. AES/EBU + S/PDIF + analog balanced I/O. MIDI automation. Deep parameter editing with VAST algorithm control. Hundreds of algorithms across reverb, delay, modulation, pitch, dynamics, EQ.
  Heritage: Kurzweil's flagship effects engine — successor to the legendary KSP8. Algorithms rooted in Kurzweil's synthesizer and sampling heritage.

### inline-optional

- Peavey Kosmos Pro (Peavey)
  Type: spatial | Channels: 2 | Format: analog | Input Z: 10000 ohm | Output Z: 100 ohm | Transformer: no
  ID: fx-peavey-kosmos
  Character: Sub-harmonic synthesis and stereo enhancement in one box. Adds subsonic weight and stereo width without mud. The sub-bass generation is musical and controlled.
  Engineering: Analog sub-harmonic synthesizer with stereo spatial processing. Generates sub-harmonics one octave below the input signal. Independent Sub and Kosmos (stereo width) controls. Balanced XLR I/O.

- Furman Punch 10 (Furman)
  Type: harmonic | Channels: 2 | Format: analog | Input Z: 10000 ohm | Output Z: 100 ohm | Transformer: no
  ID: fx-furman-punch10
  Character: Targeted low-frequency punch and impact. Tightens and reinforces bass without boosting — adds the feeling of low-end impact rather than just level.
  Engineering: Analog bass enhancer. Proprietary processing adds punch to low frequencies through harmonic generation and transient shaping. Balanced XLR I/O. Simple controls: Punch amount and frequency tuning.

- Dolby 740 #2 (Dolby)
  Type: spatial | Channels: 2 | Format: analog | Input Z: 10000 ohm | Output Z: 100 ohm | Transformer: no
  ID: fx-dolby-740-2
  Character: A subtle spatial and depth enhancer more than a conventional effect. Low-level ambience, room cues, and texture seem to bloom forward, making sources feel more expensive and dimensional without reading like obvious reverb.
  Engineering: Dolby SR spectral process across multiple sliding bands. Not a traditional compressor and not a time-based effect. Used inline, it can lift low-level detail, ambience, and apparent spatial depth without relying on overt decay tails or stereo widening tricks.
  Heritage: Second Dolby 740 unit positioned as an optional spectral/spatial enhancement path rather than purely a dynamics-side specialty processor. Same Dolby SR lineage, but useful as a patch-in texture and space tool when the context calls for it.

- Drawmer 1976 (Drawmer)
  Type: spatial | Channels: 2 | Format: analog | Input Z: 10000 ohm | Output Z: 100 ohm | Transformer: no
  ID: fx-drawmer-1976
  Character: Wide, tactile, and high-touch. It can open the sides, keep the center anchored, and add a little harmonic glue at the same time. Less like a simple widener, more like sculpting the stereo field in bands.
  Engineering: Analog 3-band stereo width processor with integrated saturation. Band splitting means the image can be widened or restrained selectively across lows, mids, and highs instead of with a single global width move. The crossover network and band interaction make setup more deliberate than a basic stereo enhancer.
  Heritage: Drawmer's dedicated stereo image and harmonic enhancement processor. Built around multiband width control with integrated saturation, aimed more at mix shaping and mastering-style image work than general-purpose effects.

- Bedini BASE (Bedini)
  Type: spatial | Channels: 2 | Format: analog | Input Z: 10000 ohm | Output Z: 100 ohm | Transformer: no
  ID: fx-bedini-base
  Character: Simple, direct stereo widening. Less about layered harmonic polish and more about making the image feel broader and more open when the source can support it.
  Engineering: Analog stereo widening process. A more direct width tool than band-split or spectral processors, intended for inline stereo use when a mix, subgroup, or source pair needs image expansion without moving into time-based ambience.
  Heritage: Analog stereo image processor from the era of dedicated width enhancement hardware. More straightforward than modern multiband image tools, but still useful as a patch-in stereo-shape device.

- Behringer Edison (Behringer)
  Type: spatial | Channels: 2 | Format: analog | Input Z: 10000 ohm | Output Z: 100 ohm | Transformer: Aftermarket output transformer mod
  ID: fx-behringer-edison
  Character: A practical stereo image shaper with a little extra attitude from the transformer-modded output. Can move from corrective image management into lightly charactered width enhancement.
  Engineering: Analog stereo processor with width and image management functions. Output transformer modification adds a mild layer of analog color and changes how the unit behaves compared with a cleaner stock path. Still fundamentally an inline stereo image tool, not a time-based effect device.
  Heritage: Utility stereo image processor that becomes more interesting when modified. This unit carries an output transformer mod, giving it more personality than a stock ultra-budget width box.

## Converters

- Dangerous D-Box+ (Dangerous Music)
  Type: DAC | Channels: 8 | Dynamic range: 118 dB | Sample rates: 44100, 48000, 88200, 96000, 176400, 192000 | Bit depths: 16, 24 | Clocking: Wordclock slave (from Aurora). Monitor controller + summing.
  ID: conv-dangerous-dbox
  Character: System gatekeeper. Everything you hear passes through this. Monitor controller + D/A + analog summing in one.
  Engineering: DA output stage drives the monitor path. Any interference here contaminates every listening decision. Wordclock chain: Aurora → AD+ → D-Box+ (inches of cable).

- Dangerous AD+ (Dangerous Music)
  Type: ADC | Channels: 2 | Dynamic range: 121 dB | Sample rates: 44100, 48000, 88200, 96000, 176400, 192000 | Bit depths: 16, 24 | Clocking: Wordclock slave (from Aurora). Final A/D stage.
  ID: conv-dangerous-adplus
  Character: The point of no return. Mastering-grade A/D conversion. Resolves signals below −1µV.
  Engineering: Analog input stage resolves below −1µV. 121+ dB dynamic range. Any interference is permanently digitized. The most critical analog engineering point in the studio.

- Lynx Aurora(n) (Lynx Studio Technology)
  Type: ADDA | Channels: 16 | Dynamic range: 120 dB | Sample rates: 44100, 48000, 88200, 96000, 176400, 192000 | Bit depths: 16, 24, 32 | Clocking: Wordclock master. TB3 optical to computer.
  ID: conv-lynx-aurora
  Character: Primary multi-channel converter. Wordclock master for the entire studio.
  Engineering: TB3 controller at 40Gbps creates RF. SMPS cycling at 50–500kHz. Wordclock master — clock jitter performance is critical. TB3 optical crosses room to computer (immune to EM).

- Tascam Studio Bridge (Tascam)
  Type: ADDA | Channels: 8 | Dynamic range: 110 dB | Sample rates: 44100, 48000, 88200, 96000 | Bit depths: 16, 24 | Clocking: Wordclock slave.
  ID: conv-tascam-studio-bridge
  Character: Secondary/utility converter. Additional I/O for overflow or independent monitoring paths.
  Engineering: ADDA converter providing supplementary channels beyond the Aurora(n). Wordclock slave in the studio clock chain.

## Summing Units

- Pueblo HJ482 (Pueblo Audio)
  Inputs: 32 | Outputs: 2 | Rack units: 2
  ID: sum-pueblo-hj482
  Character: 32-input passive summing. Top of the summing cascade. Clean and wide.
  Engineering: Passive summing network — no active electronics in signal path. Feeds Tonelux OTB.

- Tonelux OTB (Tonelux)
  Inputs: 16 | Outputs: 2 | Rack units: 2
  ID: sum-tonelux-otb
  Character: Summing with tone. Adds analog character to the summed signal.
  Engineering: Active summing with tonal controls. Receives from HJ482, feeds API ASM164.

- API ASM164 (API)
  Inputs: 16 | Outputs: 2 | Rack units: 4
  ID: sum-api-asm164
  Character: Master summing with inserts. The final analog stage before stereo processing. API iron.
  Engineering: Active summing amplifier with insert points for stereo bus processing. API 2520 op-amps. Transformer-coupled output.

## Monitoring

- HEDD Type 20 MKII (HEDD)
  Type: main | Powered: yes
  ID: mon-hedd-type20
  Character: Main monitors flanking window. AMT (Air Motion Transformer) tweeter gives extended, detailed highs. Internal ICEpower Class D amps.

- HEDD Sub 8 (HEDD)
  Type: sub | Powered: yes
  ID: mon-hedd-sub8
  Character: Centered below/between HEDDs. Extends low-frequency monitoring.

- Yamaha NS-10 (Yamaha)
  Type: near | Powered: no
  ID: mon-ns10
  Character: The near-field reference. If it sounds good on NS-10s, it sounds good everywhere. Positioned inside the HEDDs.

- Auratone 5C (Auratone)
  Type: mono | Powered: no
  ID: mon-auratone
  Character: Single mono reference. "The Horror Box." If the vocal cuts through this, it cuts through anything.
