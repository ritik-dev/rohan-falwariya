# Design notes — rohan-site

## Direction

**Editorial luxe.** A print-magazine register: warm paper, generous whitespace,
a high-contrast serif set very large, hairline rules instead of boxes. The one
structural break is a **full-bleed dark chapter** in the middle of the page for
the work reel — that's what stops it reading as another cream-and-terracotta
template.

Chosen by Ritik from four options (the others were dark violet cinematic, acid
brutalist, and "build all three").

## Colour

Defined as tokens on `:root`, redefined for dark under both
`@media (prefers-color-scheme: dark)` (guarded `:root:not([data-theme="light"])`)
and `:root[data-theme="dark"]`, so all three viewer states resolve correctly.

| Token | Light | Role |
|---|---|---|
| `--paper` | `#EFEAE1` | warm bone ground — deliberately greyer than the usual cream |
| `--paper-2` | `#E6E0D5` | inset bands (ticker, contact) |
| `--ink` | `#17140F` | warm near-black, 15.3:1 |
| `--ink-2` | `#4A443A` | body copy, 8.0:1 |
| `--ink-3` | `#6B6252` | labels and eyebrows, 5.0:1 |
| `--rule` | `#C9C1B2` | hairlines (non-text) |
| `--ghost` | `#DBD3C4` | oversized ghost type |
| `--accent` | `#A73D18` | burnt sienna, 5.1:1 on paper |

Dark chapter runs its own set: `--night #14110C`, `--night-ink #EDE6D8`,
`--night-acc #E4693B`. The `.night` class re-maps the shared tokens so every
component inside it works unchanged.

Accent appears in exactly three places: the headline slot chip, hover states, and
italic payoff words. Nowhere else.

## Type

| Role | Face | Notes |
|---|---|---|
| Display | **Instrument Serif** 400 + italic | set 50–206 px, tracking −0.042em |
| Body | **Instrument Sans** 400/500 | 15–17.5 px, line-height 1.6 |
| Utility | **IBM Plex Mono** 400/500 | 9.5–11.5 px, tracking .15–.2em, uppercase |

All three self-hosted as woff2 in `assets/fonts/` (124 KB total), pulled from the
`@fontsource/*` npm packages. No CDN — a published Artifact's CSP blocks external
hosts, and self-hosting means the page works offline.

## Motion spec

House easings:

```
--expo   cubic-bezier(.16, 1, .3, 1)     hover, springs
--drama  cubic-bezier(.05, .9, .1, 1)    every reveal
--io     cubic-bezier(.76, 0, .24, 1)    curtains, wipes, fills
```

| Moment | Behaviour |
|---|---|
| Load | Dark curtain, wordmark blur-lifts in, 1 px progress bar fills over 1280 ms. Min visible 1400 ms, hard cap 2600 ms, exits by sliding to −105% over 850 ms. Hero animations are gated on `html.is-ready`. |
| Reveals | One language everywhere: `translateY(112%) → 0` inside an `overflow:hidden` mask, `opacity 0 → 1`, `blur(14px) → 0`. The blur is what makes it read as expensive. |
| Hero headline | Word by word, 140 ms stagger, ~1050 ms each. |
| Ad slot | Fixed-width chip inside the headline cycling UGC / VSL / AI-GEN / STATIC / PRODUCT every 2.2 s, with a blinking record dot. |
| Scroll | Hand-rolled lerp (0.092) driving `window.scrollTo` — keeps native scrollbar, `position:fixed`, and IntersectionObserver all working. Off on touch and under reduced motion. |
| Parallax | Board image ±4.2%; ghost words translate on X in opposing directions (−3→3, 3→−3, −2→4, 4→−3). Desktop only. |
| Cursor | Ring tracks the pointer instantly; a glass label pill lags at LERP 0.08, scale at 0.14. The pill's text is set per element via `data-cur` ("Open ↗", "Write", "Scroll"). |
| Wordmark | FALWARIYA, letter by letter from the left, 90 ms stagger, `translateX(-105%) → 0` + blur. |
| Reduced motion | Curtain removed, every transform/blur/clip zeroed, smooth scroll and parallax off, ticker paused. |

## Structural devices

The 01–06 numbering is real: the page is a sequence (who → what → work → how →
proof → talk) and the left rail tracks which chapter you're in against a scroll
progress line. It isn't decoration.

## Content rules

Every line traces to Rohan's deck. No invented figures, testimonials, or client
detail. The tracker table shows naming-convention structure, never fake spend.
