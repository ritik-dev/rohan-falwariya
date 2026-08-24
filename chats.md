# Session log — building rohan-site

Built in a Claude (Cowork) cloud session on **24 Aug 2026** for Ritik.
This file exists so the work can be picked up in Claude Code later without
re-deriving anything. Read `AGENTS.md` first, then this.

---

## The ask, in order

1. *"C:\Users\assassin\Downloads\Rohan — Creative Strategist & Ad Editor.pdf —
   create a modern, animated, very cool looking website for me... like if client
   opens it, he is impressed, design is the main thing."*
2. *"use claude design where possible"*
3. *"make everything in the project folder only such that I can open that in
   Claude Code later and lose almost no progress and chat history, make chats.md
   file for that as well, and appropriate agents.md file"*
4. Two full reference-site specs pasted in (**Baseline** — a tennis club landing
   page, and **Loopstack** — a black/neon footer-hero) with:
   *"take the best animations, fonts, flows, etc, and put it into our site
   accordingly, to our portfolio, basically to make the website just more
   impressive"*
5. *"17 gigs free now, you can download all the space-expensive assets"*
6. *"set up graphify and the ui-ux-pro-max skill for this project, then use that
   skill to polish the UI/UX"*

## Decisions made (and who made them)

| Decision | Chosen | Source |
|---|---|---|
| Visual direction | **Editorial luxe (light)** — warm off-white paper, ink black, one burnt-orange accent, serif display | Ritik picked from 4 options |
| Contact details | Show **both** email and WhatsApp publicly | Ritik |
| Email address | `rohanfalwariya1@gmail.com` | Ritik — the PDF had a conflict (see below) |
| Fonts | Instrument Serif + Instrument Sans + IBM Plex Mono, **self-hosted** | Claude, after Ritik freed disk space |
| Framework | None. One HTML file + a 60-line node build | Claude |
| Smooth scroll | Hand-rolled lerp, **not** Lenis via CDN | Claude — Artifact CSP blocks CDNs |

## Things pulled out of the PDF

- 2 pages, Google Docs export. Full text: `reference/deck-raw.txt`.
- **5 portfolio links** were hyperlinks, not visible text. Extracted from the PDF
  link annotations and **stripped of `/u/0/`** (that segment is account-index
  specific and breaks the link for anyone signed into a different Google account):

  | # | Label | Folder ID |
  |---|---|---|
  | 1 | 100% AI GEN VID ADS | `1D4zCj0DfKF2flQYIVhZtVFLG_4S7-5Cy` |
  | 2 | VID ADS — ugc, vsl | `1Q3zWExTdTJQ7dZzkmpF-4a5tHmiWuwRD` |
  | 3 | Results (ROAS) | `1vWS1MWr6DaVEkorCtVRAsMog-j8YjtJf` |
  | 4 | Nice things client said | `17rSJGVdX1iyr3dRw5hpMuHEPmliIKJrw` |
  | 5 | Static ads | `1rrT06MZpo-5xVwFNcI18ZK4_M-mUOpK4` |

- **The script-writing board image** (2048×909, embedded on page 2 with an alpha
  mask). Composited, downscaled to 1600px, saved as `assets/board.jpg` (60 KB).

### ⚠️ Open item — the email conflict

Page 2 of the PDF prints **`rohanfalwariya1@gmail.com`** as visible text, but the
`mailto:` hyperlink behind it points at **`rohanfalwariya@gmail.com`** (no "1").
Ritik confirmed the **`…ya1@`** version is correct, and that is what the site
uses. Worth fixing the PDF too.

## What was deliberately NOT done

- **No invented numbers.** He gave no ROAS figures, so none appear. The creative
  tracker table shows the *naming convention* (`[BRAND]_UGC_A1_HK04_V2`) with
  spend/result as "tracked", captioned as structure-only.
- **No fake testimonials.** "Nice things clients said" stays a link to his folder.
- **No contact form.** A form with no backend that pretends to send is a lie. The
  email link instead opens a pre-filled draft with the brief questions in it.
- **No stock photos** from the two reference specs — those are a tennis club and a
  flower video, nothing to do with his work.

## What was lifted from the two reference sites

From **Baseline**:
- Loader that gates the hero: MIN_VISIBLE 1400 ms / MAX 2600 ms / EXIT 850 ms,
  progress bar filling on `easeInOutCubic`, curtain sliding to `-105%`.
- Word-by-word clip-mask headline reveal, ~140 ms stagger.
- Scroll-progress parallax mapped 0→1 across an element's travel.
- Oversized ghost heading whose words parallax in opposing directions on X.
- Numbered rows with a circular arrow that springs right on hover.
- Rem-scaling above the design width; page-inset rounded section bands.
- Fullscreen menu overlay from a burger button.

From **Loopstack**:
- Two-part cursor: a ring tracking instantly + a glass label pill lagging at
  LERP 0.08, scale interpolated at 0.14.
- `filter: blur(20px) → 0` folded into every reveal — this is what makes it read
  as expensive rather than "a thing slid up".
- Letter-by-letter slide-in-from-left for a giant wordmark (90 ms stagger).
- The pulsing status dot — repurposed as a **live Delhi clock** in the nav, which
  is a true detail rather than a decorative one.
- Easing `cubic-bezier(.05,.9,.1,1)` as the house curve.

Deliberately **not** taken: Lenis via CDN (blocked by the Artifact CSP — the
smooth scroll is hand-rolled instead), the background video (no source material),
Onest/Outfit/Playfair/General Sans (Fontshare isn't reachable; and the chosen
direction wants Instrument Serif), the fake-submit contact modal.

The two prompts are kept verbatim in `reference/prompts/`.

## Page structure as built

```
loader → nav (live Delhi clock) → menu overlay
hero        "I make [SLOT] ads for DTC brands." + 4 counters
ticker      formats marquee
01 about    what he does + pull quote
02 services 7 rows, "keeping it clean" last
03 work     ▓ dark band ▓ 5 Drive folders
04 process  script board (parallax) + tracker schema + mini CTA
05 clients  8 named + ghost heading "The range matters less than the pattern."
            + 11 niche chips + 3 markets
06 contact  email (pre-filled draft) + WhatsApp
wordmark    FALWARIYA, letter-by-letter
footer
```

## Verified

Headless Chromium, five widths (375/768/1024/1440/1920), light + dark:
zero console errors, zero horizontal overflow, loader always clears, all text
≥ 4.5:1 contrast in both themes.

---

## Session 2 — Claude Code, 24 Aug 2026

Picked up in Claude Code on Ritik's machine. The ask: finish the tooling setup,
mine the two reference prompts again for anything missed, then install and use
the `responsive-design` skill.

**First finding: most of it was already done.** ui-ux-pro-max and its five
siblings were installed, and the site already carried the loader, clip-mask
reveals, scroll parallax, ghost heading, two-part cursor, letter-by-letter
wordmark, live Delhi clock and hand-rolled smooth scroll from both specs. What
was genuinely missing was smaller and more specific.

### Tooling

- **Graphify installed** — `pip install graphifyy` (0.6.1 → 0.9.49),
  `graphify install`, graph built. Added `.graphifyignore`; the first run indexed
  951 nodes of which ~95% were vendored skill scripts. Scoped to the project it
  is **13 nodes** — this repo is one HTML file and graphify doesn't parse HTML.
  It's wired up for later; it isn't useful here yet, and AGENTS.md says so.
  Semantic doc extraction needs an LLM API key that isn't set, hence `--code-only`.
- **responsive-design skill installed** to `.claude/skills/responsive-design/`
  from the tarball in Downloads.

### What was added from the prompts (the remaining ~10%)

| From the specs | What went in |
|---|---|
| "Tiny spring helper — use for all JS-driven motion" `{tension, friction}` | §10 `Spring` integrator, driving **magnetic** buttons / burger / row arrows / niche chips (28 controls) |
| StackedLines: per-word clip reveal, staggered | `splitWords()` — DOM-walking splitter, keeps `<em>` intact. Section heads sweep at 85 ms/word |
| Facilities "body word fade" (y 18, quart-out, 28 ms) | `.wf` primitive on the pull quote |
| Stats "cell Inview delayIn i×110" | four hero stat cells now cascade at 1280/1390/1500/1610 ms |
| "Hover disabled ≤768px" | every transform/fill hover moved inside `@media (hover:hover) and (pointer:fine)` |

Fonts were **not** changed. The specs use Onest / Outfit / Playfair / General
Sans; Rohan picked editorial luxe and Instrument Serif carries it. Same call as
session 1, re-confirmed rather than re-litigated.

### Two real bugs found while verifying — both pre-existing

1. **The hero's bottom rows never revealed at load.** At a 900 px viewport the
   buttons and stat row sit below the IntersectionObserver's `-10%` bottom
   margin, so they stayed at `opacity:0` until the visitor happened to scroll.
   Fixed by gating the hero on the loader (`go()` reveals every `.gate` element
   after `is-ready`) and filtering gated elements out of the observer, which also
   stopped them animating early behind the curtain.
2. **Content skipped past never revealed.** IO only reports state *changes*, so
   anything that went from below the fold to above it without intersecting — a
   restored scroll position, an anchor jump, a fast flick — stayed invisible
   permanently. Added `sweepPast()`, called only on jumps larger than a viewport.

Also raised the small mono links (13–21 px tall: footer, menu foot, nav wordmark)
to a 40 px hit area on coarse pointers via a `::before` overlay, so nothing moves.

### Responsiveness verdict

Checked in headless Chrome at **320 / 375 / 768 / 1024 / 1440 / 1920**, light and
dark, plus `prefers-reduced-motion` and device emulation. It was already good —
`scrollWidth === clientWidth` at every width, zero console messages, contrast
floor 4.90 (dark) / 5.02 (light). The touch-target and hover-latch fixes above
are the only responsiveness changes that were actually warranted.

## Where things stand / what's next

- [ ] Point a domain at it (any static host — it's one folder).
- [ ] Fix the email typo in the source PDF.
- [ ] Consider swapping the "Results (ROAS)" folder for 2–3 real screenshots
      embedded on the page — a client shouldn't have to click into Drive to see
      proof. Needs Rohan's permission per client.
- [ ] The client list has no per-client detail. If Rohan can say which niche each
      brand was, the rows get a right-hand column and read much stronger.
- [x] ~~`graphify` isn't installed yet~~ — installed in session 2. See AGENTS.md
      for why its output is thin on a single-file site.
- [ ] Set an LLM API key if you want graphify to index the `.md` files
      semantically rather than code-only.
- [ ] The reveal sweep and hero gating are covered by no test. If this ever grows,
      a small Playwright check at the six widths would lock them in.
