# UI/UX audit — ui-ux-pro-max pass

Run with the `ui-ux-pro-max` skill installed at `.claude/skills/ui-ux-pro-max`.

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py \
  "creative portfolio editorial ad agency personal brand" \
  --design-system -p "Rohan Falwariya"
```

Full generated system: `design-system/rohan-falwariya/MASTER.md`.

## What the generator recommended, and what we did with it

| It said | Verdict |
|---|---|
| Pattern: **Scroll-Triggered Storytelling** — progress indicator, mini CTA per chapter, final climax CTA, simplify on mobile, disable scroll-scrub under reduced motion | **Adopted.** Matches what was built. Added the missing per-chapter mini CTA at the end of the work chapter. |
| Style: **Brutalism** — raw, stark, default fonts, 0px corners, instant transitions | **Rejected.** Ritik explicitly chose editorial luxe. The user's direction wins over a generated one. |
| Colours: monochrome `#18181B` + blue `#2563EB` accent | **Rejected**, same reason. |
| Type: Archivo / Space Grotesk | **Rejected** — and Space Grotesk is on the over-used list anyway. |
| Pre-delivery checklist | **Adopted in full** — see below. |

The lesson recorded in AGENTS.md: use this skill for UX rules, accessibility and
the checklist; not to re-pick an aesthetic the client already chose.

## Checklist results

| Check | Before | After |
|---|---|---|
| No emoji as icons | pass — all icons are inline stroke SVG on a 24px grid | pass |
| `cursor: pointer` on clickables | pass | pass |
| Hover states with transitions | pass (350–600 ms — slower than the skill's 150–300 ms, deliberate for an editorial register) | pass |
| **Light-mode text contrast ≥ 4.5:1** | **FAIL** — `--ink-3` labels at 3.53:1 | **fixed** → `#6B6252`, 5.02:1 |
| **Dark-mode text contrast** | **FAIL** — night `--ink-3` at 3.32:1, dark-theme `--ink-3` at 4.19:1 | **fixed** → `#8A8172`, 4.90:1 both |
| Accent as text on the inset band | 4.42:1, marginal | **fixed** → accent darkened `#AF421B` → `#A73D18` |
| Visible focus for keyboard nav | pass — `:focus-visible` 2px accent ring, 4px offset | pass |
| `prefers-reduced-motion` respected | pass | pass |
| Responsive 375 / 768 / 1024 / 1440 / 1920 | pass — 0 px horizontal overflow at every width | pass |
| Simplify animation on mobile | **FAIL** — parallax ran on touch devices | **fixed** — board + ghost parallax now desktop-only; smooth scroll and cursor already were |
| Touch targets ≥ 44×44 | pass — buttons 42–46 px circles with padding; niche chips 36 px tall but non-interactive links, acceptable | pass |
| Headline legibility on small screens | **FAIL** — the ad-slot chip computed to ~5.7 px at 375 px | **fixed** — `font-size: max(9.5px, .115em)` |

## Verification

Headless Chromium, five widths × light/dark: zero console errors, zero horizontal
page overflow, loader always clears (2600 ms hard cap even if `load` never
fires), fonts resolve locally with no network.
