# Motion references

Ritik supplied two full single-file site specs and asked to fold the best of both
into this site. The parameters actually used are recorded here; the design
rationale is in `../design-notes.md`, and what was taken vs. rejected is in
`../../chats.md`.

## Reference A — "Baseline" (tennis club & academy)

Deep-navy hero with a parallax photo, oversized uppercase headline revealed
word-by-word from behind a clipping mask, then light/dark section bands. Lenis
smooth scroll, spring-based motion throughout, adaptive rem grid.

Parameters worth keeping:

```
LOADER          MIN_VISIBLE 1400ms · MAX_VISIBLE 2600ms · EXIT 850ms
                progress fill delay 120ms, duration 1280ms, easeInOutCubic
                curtain translateY 0% → -105%
                hero animations gated on ready=true

HERO TITLE      word-by-word clip mask, wordOut {y:115%, opacity:0}
                stagger 140ms · duration 1100ms · easeOutExpo
TAGLINE         stacked lines, baseDelay 350ms · stagger 110ms · duration 900ms

STACKED LINES   stagger 120ms · duration 950ms · easeOutExpo
                clip box padding-bottom 0.14em so descenders survive

INVIEW          from {opacity:0, y:28} → {opacity:1, y:0}, play once
                spring {tension:200, friction:26}
HOVER           spring, disabled ≤768px
SPRING MODEL    v += (-tension*(x-target) - friction*v) * dt ;  x += v*dt

GHOST HEADING   8.2vw, 2 rows × 2 words, one word ink-coloured
                clip-mask reveal 700ms easeOutExpo, re-fires on content change
                opposing X parallax: -3→3 · 3→-3 · -2→4 · 4→-3 (%)

PROGRAM ROWS    Inview delayIn = i × 90ms, {tension:190, friction:26}
                arrow hover x:0→8, opacity .55→1, {tension:300, friction:20}
CARDS           hover scale 1→1.03 {tension:300,friction:22}; lift y:0→-8
STATS           delayIn = i × 110ms, {tension:180, friction:24}

PARALLAX        map element viewport position (top=bottom → 0, bottom=top → 1)
                to from→to, apply per frame
ADAPTIVE REM    base 16px at 1920 design width; vw font-size below,
                JS scale-up above (COEF 0.6666)
LAYOUT          page inset 0.5–0.75rem, section radius 2rem — the "card framing"
```

**Rejected:** Lenis from a CDN (a published Artifact's CSP blocks external
hosts — the smooth scroll here is hand-rolled instead), the tennis stock photos,
Onest.

## Reference B — "Loopstack" (black / neon footer hero)

Single non-scrolling screen. Looping video, serif headline, pill button with a
pulsing neon dot, giant wordmark pinned to the bottom, custom two-part cursor.

Parameters worth keeping:

```
EASING          cubic-bezier(0.05, 0.9, 0.1, 1)   ← the house curve
BLUR REVEAL     every reveal starts at filter: blur(20px) → 0
                this is the single biggest "expensive" tell

HEADLINE        word-by-word, wrapper overflow:hidden + padding-bottom 0.15em
                inner translateY(105%) → 0, duration 1.3s, stagger 0.1s
                keyframe: 0% opacity 0 · 30% opacity 1 · 100% settled

WORDMARK        letter-by-letter, translateX(-105%) → 0
                duration 1.2s, stagger 0.09s, font-size 21.9vw, nowrap
                line-height 0.8, letter-spacing -0.03em

CURSOR          ring 48px, 1.5px border, tracks pointer INSTANTLY
                glass pill lags at LERP 0.08 ; scale interpolates at LERP 0.15
                pill hidden (scale 0) while hovering the CTA, ring expands 1.6×
                label text set per element

STATUS DOT      10px, pulse-glow 2s (opacity .5→1, scale .85→1.1)
                ::after wave-expand 2s, scale 0.6→2.3, opacity .9→0
```

**Rejected:** the flower video (no source material), the black/neon palette (wrong
direction), Fontshare fonts (host not reachable from a published Artifact). The
status dot was repurposed as a **live Delhi clock** in the nav — a true detail
rather than a decorative one.
