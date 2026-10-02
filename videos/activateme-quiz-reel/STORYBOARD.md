---
format: 1080x1920
duration: 15s
message: "Find your kid's perfect activity in under a minute."
arc: Feature-Benefit Cascade (keynote reveal) — spectacle hook → the question → the promise → the product → CTA
audience: Dubai parents with kids aged 4–14 (Instagram Reels)
mode: collaborative
music: bright, confident minimal electronic pop, Apple-keynote feel, upbeat ~120 BPM, playful and family-friendly, clean punchy kick on every beat, no vocals
---

# ActivateMe Fest quiz — launch Reel (15s, 9:16)

No voiceover: Reels start muted, so on-screen type carries the whole story. Every cut lands on the
music's beat. Deep ink (#1B0B46) stage, white Baloo 2 type in sentence case with a full stop, the
brand gradient only as light and as one gradient-filled word per frame. Acti (HD cut-outs) is the
hero image of every sport beat. Text stays inside the Reel safe zone (top 12%–bottom 22% clear,
right 12% clear of key copy).


## Video direction

- **Beat grid:** 120 BPM — one beat = 0.5s, a 16th = 0.125s. Every cut, word swap and reveal lands on a
  beat (or a 16th inside the F2 flicker). Frame starts: F1 0.0 · F2 3.0 · F3 6.0 · F4 9.0 · F5 12.5 → 15.0.
- **Palette system (frame.md):** ground = ink `#1B0B46` (F1–F4); type = white; the brand gradient
  (purple `#4A01E0` → magenta `#B01AB8` → pink `#F83840` → orange `#FC8700`) appears only as (a) one soft
  radial glow behind Acti whose hue walks through the gradient across F1→F2 (football purple, swimming
  magenta, chess pink, cycling orange, creativity full gradient), (b) a gradient fill on exactly one
  word per frame, (c) the full-bleed field of the end card (F5). Muted copy = lilac `#F3EEFF` at ~80%.
- **Type:** Baloo 2 800 display, sentence case with a full stop ("Football."), tight tracking; one
  display moment per frame, 1–2 supporting lines at most. Labels Baloo 2 700 uppercase tracked.
- **Motion grammar:** keynote-clean. Words arrive by hard-cut swap or a short blur-to-sharp settle
  (`power3`, never bounce); Acti changes by scale-swap on the same beat as the word. Reveals follow the
  beat, never front-loaded. Holds are STILL — subtle jitter at most, no breathing, no back-half drift.
  One playful exception: the GOAL! sticker in F4 may spring-pop (it is a sticker).
- **Rhythm / held frames:** F1 one word per 2 beats (calm, confident) → F2 accelerates (1 beat each,
  then 16ths flicker) → F3 is the breather: everything stops and holds on the question → F4 rebuilds
  energy with the product → F5 resolves and holds on the CTA for the final second.
- **Safe zone (Reels):** key content between 12% and 78% of the height; nothing important in the right
  12% or bottom 22% (Instagram buttons + caption).
- **Negative list:** no slideshow (front-load then freeze); no screensaver floating; no bouncy eases
  (except the one sticker); no lens flares, bokeh, particles, film grain or glitch; no second accent
  colour outside the brand gradient; no drop shadows on type; no lowercase-poster styling.

## Frame 1 — Football. Swimming. Chess.

- scene: Ink stage; one sport word per beat, each with Acti playing that sport — Football., Swimming., Chess.
- voiceover: ""
- duration: 3s
- transition_in: cut
- status: animated
- src: compositions/frames/01-sports-a.html
- type: hook
- persuasion: Visual spectacle — curiosity by rapid naming
- beat: curiosity + excitement
- blueprint: kinetic-type-beats
- asset_candidates: assets/football.webp — Acti mid-kick with a football; assets/swimming.webp — Acti in goggles with a rubber ring; assets/chess.webp — Acti holding a white knight

- blueprint: kinetic-type-beats (Adapt)
- focal: assets/football.webp
- roles: football.webp = cutout · swimming.webp = cutout · chess.webp = cutout

Adapt: keep the in-place token swap signature (the word slot swaps on a hard cut while the frame holds); add Acti as a cut-out that swaps sport on the same beat, and a hue-walking glow behind him.
Scene 1 (0.0–1.0s): ink ground; soft purple radial glow blooms behind centre (`ambient-glow-bloom`). On beat 1 "Football." lands in the word slot — upper third, centred, display size ~70% of width — with a short blur-to-sharp settle (`spring-pop-entrance`, power3, no overshoot); Acti-football rises into the centre (42–78% of height) on the same beat with a smooth settle. Centered, layered depth: glow (back) · Acti (mid) · word (front).
Scene 2 (1.0–2.0s): on beat 3, hard-cut word swap to "Swimming." (`discrete-text-sequence`); Acti scale-swaps to Acti-swimming (`scale-swap-transition`); glow hue shifts to magenta.
Scene 3 (2.0–3.0s): on beat 5, swap to "Chess." + Acti-chess; glow to pink; holds still (subtle jitter on Acti only) until the cut.

narrativeRole: Stops the scroll. A keynote-style word swap on the beat ("Football." → "Swimming." → "Chess.") while Acti changes sport each time — the viewer instantly sees "lots of activities" and a lovable mascot.
keyMessage: There's a whole world of activities for kids.

## Frame 2 — Cycling. Creativity. …and seven more.

- scene: Two more full beats (Cycling., Creativity.), then the other seven Acti sports flicker past fast, landing on "12 activities."
- voiceover: ""
- duration: 3s
- transition_in: cut
- status: animated
- src: compositions/frames/02-sports-b.html
- type: hook
- persuasion: Rule of abundance — breadth shown, not listed
- beat: excitement → slight overwhelm
- blueprint: kinetic-type-beats
- asset_candidates: assets/cycling.webp — Acti on a purple bike; assets/creativity.webp — Acti with paintbrush and palette; assets/boxing.webp — Acti in red gloves; assets/skating.webp — Acti on inline skates; assets/tennis.webp — Acti with racket; assets/basketball.webp — Acti with ball overhead; assets/cricket.webp — Acti swinging a bat; assets/gymnastics.webp — Acti in a cartwheel; assets/vr.webp — Acti in a VR headset; assets/football.webp — Acti kicking (grid); assets/swimming.webp — Acti swimming (grid); assets/chess.webp — Acti with knight (grid)

- blueprint: kinetic-type-beats (Adapt) → grid-card-assemble (finale)
- focal: assets/cycling.webp
- roles: cycling.webp = cutout · creativity.webp = cutout · boxing/skating/tennis/basketball/cricket/gymnastics/vr = cutout (flicker + grid)

Adapt: same token-swap slot as F1 but accelerating (1 beat per word, then 16ths), landing on a grid assemble of all twelve.
Scene 1 (0.0–0.5s): handoff from F1 — same word slot and Acti position; "Cycling." + Acti-cycling, glow orange (`discrete-text-sequence`).
Scene 2 (0.5–1.0s): "Creativity." + Acti-creativity; glow becomes the full brand gradient.
Scene 3 (1.0–2.0s): the flicker — word slot and Acti hard-cut every 16th (0.125s) through Boxing. Skating. Tennis. Basketball. Cricket. Gymnastics. VR & Esports. (7 swaps, then a blank 16th) — `discrete-text-sequence`; motion-blur streak on each Acti swap (`motion-blur-streak`).
Scene 4 (2.0–3.0s): on beat, all 12 Acti sport poses spring into a 3×4 grid filling the middle of the frame (`grid-card-assemble` / `center-outward-expansion`, staggered by index from centre), and the word slot reads "12 activities." with "12" in the brand gradient; holds still.

narrativeRole: Builds to "so many choices" — the flicker is fun but deliberately too fast, setting up the parent's real question.
keyMessage: 12 activities. Which one?

## Frame 3 — Which one is your kid's?

- scene: The flicker stops dead; calm. "Which one is" / "your kid's?" (gradient-filled), then "Find out in under a minute." with Acti thinking.
- voiceover: ""
- duration: 3s
- transition_in: cut
- status: animated
- src: compositions/frames/03-question.html
- type: product_intro
- persuasion: Direct address — turns breadth into a personal question, then friction reduction ("under a minute")
- beat: curiosity → relief
- blueprint: kinetic-type-beats
- asset_candidates: assets/think.webp — Acti thinking, hand on chin

- blueprint: kinetic-type-beats (Reproduce — statement build)
- focal: assets/think.webp
- roles: think.webp = cutout

Scene 1 (0.0–1.5s): zoom-through arrival; ink ground, glow dimmed to a faint purple. Per-word reveal on beats (`dynamic-content-sequencing`): "Which one is" at 0.0, then "your kid's?" at 1.0 — h1 size, centred, upper-middle (24–46% of height), "your kid's?" in the brand gradient.
Scene 2 (1.5–3.0s): on beat, "Find out in under a minute." reveals beneath in lead size, lilac, per-word stagger; Acti-thinking rises small into the lower-middle (52–76%) with a smooth settle; everything holds still from 2.25s — the breather before the product.

narrativeRole: The value claim lands (by beat 2–3): the question every parent has, and the promise that answers it fast.
keyMessage: Find your kid's perfect activity in under a minute.

## Frame 4 — The quiz, on a phone

- scene: A phone glides up into frame with the real quiz: a finger-tap on "🚀 Bouncing off the walls", screens advance on the beat, then the result — Acti kicking, "GOAL!" sticker, "Football".
- voiceover: ""
- duration: 3.5s
- transition_in: cut
- status: animated
- src: compositions/frames/04-phone-demo.html
- type: feature_showcase
- persuasion: Show-don't-tell proof — the real product, working, in 3 seconds
- beat: clarity + delight
- blueprint: device-surface-showcase
- asset_candidates: assets/03-question-2.jpg — real quiz screen, Q2 energy question; assets/03b-question-2-tapped.jpg — same screen with the first answer tapped; assets/07-question-6.jpg — Q6 superpower grid; assets/09-result-football.jpg — result screen with Acti kicking and the GOAL! sticker

- blueprint: device-surface-showcase (Adapt) · registry block `device-frame-stage` for the phone
- focal: assets/09-result-football.jpg
- roles: 03-question-2.jpg = supporting (screen) · 03b-question-2-tapped.jpg = supporting (screen) · 07-question-6.jpg = supporting (screen) · 09-result-football.jpg = focal (screen)

Adapt: keep the device-as-hero with screens cycling through the real flow; static hold (no 3D orbit), the screen content does the camera work; the GOAL! sticker breaks out of the phone at the payoff.
Scene 1 (0.0–0.75s): a phone (`device-frame-stage`, slim black bezel, rounded) rises into the centre (phone occupies ~62% of height, 20–82%) showing the Q2 screen; kicker above it "6 QUICK QUESTIONS" (label, lilac) reveals at 0.5s.
Scene 2 (0.75–1.5s): a finger-tap ripple on "🚀 Bouncing off the walls" (`cursor-click-ripple`, no visible cursor — a soft white touch ring); on beat at 1.0s the screen swaps to the tapped state (`press-release-spring` on the card area).
Scene 3 (1.5–2.0s): on beat, the screen push-slides to Q6 (the superpower grid).
Scene 4 (2.0–3.5s): on beat, the screen swaps to the result; at 2.25s a large tilted white "GOAL!" sticker (gradient type) spring-pops OUT of the phone's upper-left edge, overlapping the bezel; the kicker swaps to "ONE PERFECT MATCH" (`discrete-text-sequence`); holds still to the cut.

narrativeRole: Proves the promise — tap, tap, result — and shows the payoff moment (Acti + cheer) parents will share.
keyMessage: Six taps and Acti tells you.

## Frame 5 — What should my kid try?

- scene: The brand gradient floods the frame; the heart logo blooms, "What should my kid try?", "Take the quiz · link in bio", "16–17 Jan 2027 · Dubai Silicon Oasis", @activatemefest; Acti waves.
- voiceover: ""
- duration: 2.5s
- transition_in: cut
- status: animated
- src: compositions/frames/05-end-card.html
- type: cta
- persuasion: Clear single action + event anchor
- beat: motivation + belonging
- blueprint: logo-assemble-lockup
- asset_candidates: assets/logo.webp — ActivateMe heart mark; assets/wave.webp — Acti waving

- blueprint: logo-assemble-lockup (Adapt)
- focal: assets/logo.webp
- roles: logo.webp = focal · wave.webp = cutout

Adapt: the mark blooms whole from zero on a cleared stage (no part-assembly — the logo is a raster), then the lockup builds beneath it on the beat; the ground is the brand gradient field (`mesh-gradient-bg` style radial layers, static).
Scene 1 (0.0–0.5s): zoom-through arrival into the full-bleed brand gradient; the heart logo spring-blooms at the top-centre (14–24% of height) (`spring-pop-entrance`, smooth).
Scene 2 (0.5–1.25s): "What should my kid try?" reveals per word on 16ths (`dynamic-content-sequencing`) — h1 white, centred, 28–44% of height.
Scene 3 (1.25–2.0s): a white pill "Take the quiz · link in bio" (purple text) presses in (`press-release-spring`) at 48%; Acti-waving rises into 54–77% on the same beat.
Scene 4 (2.0–2.5s): "16–17 Jan 2027 · Dubai Silicon Oasis" and "@activatemefest" fade-settle in small white type under the pill (lower edge ≤ 78%); final hold — the last frame of the video.

narrativeRole: Converts: names the quiz, the action (link in bio), and the festival dates, in the signature gradient.
keyMessage: Take the quiz — then try it at ActivateMe Fest.
