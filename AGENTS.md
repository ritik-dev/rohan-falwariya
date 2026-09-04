# AGENTS.md — Rohan Falwariya portfolio site

Instructions for any AI agent (Claude Code, Cursor, etc.) working in this repo.

## What this is

A one-page portfolio site for **Rohan Falwariya**, a creative strategist and ad
editor who makes ads for DTC brands. Built for one job: a prospective client
opens the link, is impressed inside three seconds, and messages him.

Static. No framework, no bundler, no dependencies at runtime. Everything is
self-hosted — the page needs **no network at all** once built.

## Build

```bash
node build.mjs        # the only command. Node 18+. No npm install needed.
```

`src/page.html` is the **single source of truth**. It contains `<title>`,
`<style>`, the markup and the `<script>` — with no document wrapper — plus two
tokens the build replaces:

| Token / path            | index.html            | dist/*.html            |
|-------------------------|-----------------------|------------------------|
| `__FONTFACE__`          | `url(assets/fonts/…)` | base64 data URIs       |
| `assets/work/*.webp`    | linked                | base64 data URIs       |
| `assets/reel/*.webp`    | linked                | base64 data URIs       |
| `assets/reel/*.mp4`     | linked                | **left linked** — inlining megabytes of video would defeat an emailable file, so offline the poster frames stand in |

Outputs:

- `index.html` — open this locally, host it anywhere. Links `assets/`.
- `dist/rohan-falwariya.html` — one file, everything inlined (~280 KB). Email it,
  drop it on any host, open it offline.
- `dist/artifact-body.html` — same content minus the `<!doctype>/<html>/<head>`
  wrapper, for publishing through Claude's Artifact tool (it adds its own shell).

**Never edit `index.html` or anything in `dist/` by hand — they are generated.**
Edit `src/page.html` and re-run the build.

## Deploy

**Live: https://rohanmadeit.com** — continuous deployment, no manual step.

```
edit src/page.html  ->  node build.mjs  ->  git commit  ->  git push  ->  live in ~1 min
```

| Piece | Value |
|---|---|
| Repo | `github.com/ritik-dev/rohan-falwariya` (public, branch `main`) |
| Netlify project | `rohanmadeit` · site id `0a2abe11-d343-4c94-861c-79b150fb658b` |
| Build command | `node build.mjs` (from `netlify.toml`, which overrides the UI) |
| Publish dir | `_site/` |
| Registrar | **Wix** (domain bought there) |
| DNS mode | **External DNS** — nameservers stay `ns2/ns3.wixdns.net` |
| Records | `A rohanmadeit.com -> 75.2.60.5` · `CNAME www -> rohanmadeit.netlify.app` |
| Certificate | Let's Encrypt, **non-wildcard**, HTTP-01 validated |

### Do not switch this domain to Netlify DNS

It looks like the tidier option and it **cannot work.** Wix does not allow changing
nameservers on domains registered with them — no setting, no support request, no
exception. Selecting Netlify DNS makes Netlify attempt a wildcard cert
(`*.rohanmadeit.com`), and wildcards can only be validated by DNS-01: Netlify
writes `_acme-challenge` TXT records into a Netlify zone that nothing on the
internet queries, Let's Encrypt sees `NXDOMAIN`, and after five failures the
account is rate-limited for an hour. The site sits on plain HTTP the whole time.

External DNS is the correct mode here. Netlify falls back to HTTP-01, fetches a
file over HTTP from `75.2.60.5`, and issues immediately.

Diagnosing it again, if it recurs:

```bash
nslookup -type=NS rohanmadeit.com 8.8.8.8              # must be wixdns -> external DNS
nslookup -type=TXT _acme-challenge.rohanmadeit.com 8.8.8.8   # NXDOMAIN = DNS-01 can't work
```

**`rohanfalwariya.com` is no longer this site's domain.** It was moved to a
separate Netlify site (different account) and now 302s to `/soxi`. Don't re-add it.

**`_site/` is why source files are not on the public web.** The repo is public, but
Netlify serves only `_site/` — `index.html` plus `assets/`. Publishing the repo
root instead would put `src/`, `chats.md`, `prompts/` and `reference/rohan-deck.pdf`
one guessed URL away. Verified in production: those all return 404.

If you ever change the publish dir, re-check that:

```bash
for u in src/page.html chats.md reference/rohan-deck.pdf .wix.env; do
  curl -s -o /dev/null -w "$u %{http_code}
" "https://rohanmadeit.com/$u"
done   # every one must be 404
```

### Connectors

`.mcp.json` carries the **Netlify** MCP (`netlify-mcp.netlify.app/mcp`) and
**Namecheap** (`mcp.namecheap.com/mcp`), both OAuth, both project scope.

Project scope is deliberate — **local scope does not survive.** A running Claude
Code session owns `~/.claude.json` and flushes its own copy over anything
`claude mcp add` writes mid-session; `.mcp.json` is a separate file, so it
sticks. New project-scope servers are only read at **startup**, so adding one
means restarting Claude Code before it appears in `/mcp`.

Neither connector manages DNS — the Netlify MCP covers projects, deploys,
extensions, teams and env vars only. DNS changes are done in the Netlify UI.

## House rules

1. **Every claim on the page must be true.** All copy traces back to Rohan's own
   deck (`reference/deck-raw.txt`). Do not invent client names, ROAS figures,
   testimonials, or availability. The tracker table is deliberately schema-only
   (`[BRAND]_…`, "tracked") — never fill it with fake numbers.
2. **Design direction is fixed: editorial luxe.** Warm bone paper, warm near-black
   ink, one burnt-sienna accent, Instrument Serif display. See
   `reference/design-notes.md`. Don't drift toward gradients, glassmorphism,
   rounded cards with accent rails, or a second accent colour.
3. **Spend boldness in one place.** The accent appears on the headline slot chip,
   hover states, and italic payoff words. Nowhere else.
4. **Motion is orchestrated, not scattered.** One reveal language (clip-mask +
   blur lift), one easing family. See the motion spec in design-notes.
5. **Keep it dependency-free.** No CDN scripts, no webfont CDN, no build step
   beyond `node build.mjs`. A published Artifact's CSP blocks external hosts, so
   anything fetched from a CDN silently fails.
6. **Respect `prefers-reduced-motion`** — it is wired through every animation
   including the loader and smooth scroll. Don't add motion that bypasses it.
7. **Accessibility floor:** body text ≥ 4.5:1 contrast, visible focus rings,
   no horizontal page scroll at 375 / 768 / 1024 / 1440 / 1920.

## Motion primitives (what to reuse, and where it lives)

All in `src/page.html`. Add motion by reusing these, not by inventing a sixth one.

| Primitive | Markup | Notes |
|---|---|---|
| Clip-mask word reveal | `<span class="rv"><i style="--d:200ms">word</i></span>` | `overflow:hidden` box, inner lifts from `translateY(112%)` + `blur(14px)`. The house reveal. |
| Word fade | `.wf > i` | rise 18px + blur 6px, quart-out. For short display lines only — never a paragraph. |
| Block fade | `class="fade" style="--d:…"` | 26px rise + blur. Whole-element. |
| Wipe | `class="wipe"` | `clip-path` inset left→right. |
| Magnetic pull | JS, by selector | spring `{tension:300, friction:20}`, writes the independent `translate` property so CSS `transform:` hovers still compose. |

Two JS helpers do the heavy lifting:

- **`splitWords(host, cls, stagger, cap)`** (§2b) rebuilds a heading's single clip
  box into one box per word so the reveal *sweeps* the line. It walks the DOM,
  not the HTML string, so inline `<em>`/`<b>` survive the split. Skipped entirely
  under `prefers-reduced-motion`. Wired to `.head h2` (85 ms), `.cta h2 .l`
  (110 ms) and `.pull` (42 ms, word-fade).
- **`Spring(tension, friction)`** (§10) is the `v += (-k·(x-t) - c·v)·dt` integrator
  from the reference specs. Under-damped on purpose — the small overshoot on
  release is the whole point.

Three things that are easy to get wrong and are already handled — don't undo them:

1. **The hero is gated on the loader, not on scroll.** Its bottom rows sit below
   the observer's `-10%` margin at load, so IO never fires for them. `go()` adds
   `.in` to every `.gate` element right after `is-ready`, and gated elements are
   filtered *out* of the observer's target list so they can't reveal early,
   behind the curtain.
2. **A target that clips itself to nothing can never reveal itself.**
   IntersectionObserver measures the element's *clipped* box. `.wipe` starts at
   `clip-path:inset(0 100% 0 0)` — zero area — so its ratio is always 0 and a
   `threshold: 0.1` observer never fires. This silently hid the script board on
   every screen size for the whole of the site's first life. `.wipe` targets get
   their own `threshold: 0` observer (`ioClip`); keep it that way for any future
   primitive that hides by clipping rather than by opacity.
3. **IntersectionObserver only reports state *changes*.** Anything that goes from
   below the fold to above it without ever intersecting — restored scroll offset,
   anchor jump, hard flick — never fires and would stay invisible forever.
   `sweepPast()` catches those, and only runs after a jump bigger than one
   viewport, so ordinary scrolling costs nothing.

**Hover is guarded.** Every hover rule that changes a transform or a fill lives
inside `@media (hover:hover) and (pointer:fine)` — on touch, `:hover` latches
after a tap and stays stuck. Coarse pointers get a `::before` overlay that lifts
the small mono links (13–21 px tall) to a 40 px hit area without moving layout.

## Verify before you call it done

```bash
node build.mjs
# then open index.html and check at 375px and 1440px, light and dark
```

Checklist that this build passes today (verified in headless Chrome):

- [x] zero console messages, zero horizontal overflow at **320**/375/768/1024/1440/1920
- [x] loader removes itself even if `load` never fires (2600 ms hard cap)
- [x] contrast ≥ 4.5:1 in both themes — worst case 4.90 dark / 5.02 light
- [x] hero orchestrates off the loader: headline → lede → buttons → stats at
      110 ms intervals, all settled by ~4.4 s
- [x] `prefers-reduced-motion`: loader gone instantly, nothing hidden, word
      splitter skipped, magnets not wired, copy fully readable
- [x] no hover state latches on a coarse pointer; small links ≥ 40 px hit area
- [x] works with JS disabled? No — reveals need JS. Acceptable for this use.

## Skills installed here

`.claude/skills/` carries:

| Skill | What it's for here |
|---|---|
| **ui-ux-pro-max** | design intelligence — 119 UX rules, 192 palettes, GSAP presets |
| **responsive-design** | container queries, fluid type, breakpoint strategy |
| `design`, `design-system`, `brand`, `banner-design`, `slides` | siblings of ui-ux-pro-max |

```bash
python .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain ux
python .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain gsap
python .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system
```

The generated design system lives in `design-system/rohan-falwariya/MASTER.md`.
**Note:** that generator recommended a *brutalist* direction with Archivo/Space
Grotesk. Rohan explicitly chose editorial luxe, so the visual direction in
`reference/design-notes.md` wins. Use the skill for its UX rules, accessibility
checks, and pre-delivery checklist — not to re-pick the aesthetic.

### Graphify

Installed (`pip install graphifyy`, CLI `graphify`, skill at
`~/.claude/skills/graphify/`). Rebuild with:

```bash
graphify . --code-only          # then: graphify cluster-only . --no-label
```

`--code-only` is not optional here: semantic extraction of the `.md` files needs
an LLM API key (`ANTHROPIC_API_KEY` / `GEMINI_API_KEY` / …), and none is set.
`.graphifyignore` excludes `.claude/`, `dist/`, `index.html` and the assets —
without it the graph is 95% vendored skill scripts.

**Be honest about its value on this repo:** the graph is 13 nodes. The site is
one HTML file plus a 60-line build script, and graphify's AST extractors don't
parse HTML. It is wired up and will pay off if this ever grows real modules;
today, reading `src/page.html` directly is faster. Output in `graphify-out/`.

## Files

```
src/page.html                 source of truth (edit this)
build.mjs                     the build
index.html                    generated
dist/                         generated
assets/work/*.webp            selected statics + the collage bed (240px `-bed` variants)
assets/reel/*.mp4|webp        6s silent motion previews + poster frames
assets/board.jpg              Rohan's script-writing board — UNUSED since the
                              "Every ad gets logged" section was cut; kept in the
                              repo in case that section ever comes back
assets/fonts/*.woff2          Instrument Serif/Sans + IBM Plex Mono, self-hosted
reference/deck-raw.txt        text extracted from the original PDF
reference/design-notes.md     palette, type scale, motion spec, section map
reference/ui-ux-audit.md      what the ui-ux-pro-max pass changed
reference/prompts/            the two reference site specs the motion came from
.graphifyignore               keeps the knowledge graph off vendored skill code
graphify-out/                 generated knowledge graph (gitignored)
chats.md                      full session log — read this to pick up where we left off
```


## What changed in the Aug 2026 pass

Rohan reviewed the live site and sent marked-up notes
(`files/Copy of Rohan — Creative Strategist & Ad Editor.pdf`). Applied:

* **New section order** (his "NEW FORMAT"): `01` angle/script/edit/statics →
  `02` who it's been for → `03` the work → `04` and then (results + what clients
  said) → `05` stuff I do → `06` wanna work together. The driving note was
  *"logo ko jayda scroll na krna pade"* — this is an ad strategist's site, all
  the information, without a long scroll. **Weigh any addition against that.**
* **Hero line widened** to "I make the whole [SLOT] ad for DTC brands." The old
  "I make [SLOT] ads" contradicted the seven services listed later and, in his
  words, boxed him into the cheapest thing he does.
* **Deleted:** the "Every ad gets logged" section (script board + tracker table)
  and the giant `FALWARIYA` wordmark, plus all their CSS and JS.
* **Stats:** `2` → `2+` years, and the "languages worked in" *counter* is gone —
  he wants the capability stated without a number, so it sits in the hero lede.
* **Folders 5 → 3.** Results and "nice things clients said" moved out of the row
  list into the `04` two-up so neither costs a scroll.
* **"Who it's been for"** is a collage, not a name list: names in display serif
  over real creative blurred right down under a paper scrim. "agencies" →
  "dropshippers" per his note.
* **Light is the default theme**, with a toggle in the nav (half-filled disc, not
  a stock sun/moon) resolved before first paint from `localStorage`.
* **The nav has a frosted panel** — without it the wordmark and clock sat
  unreadably on the hero headline. Use `saturate(<1)`: boosting saturation turned
  the accent chip passing behind the bar into a solid salmon block.

### Client work on the page

Statics and clips are pulled from Rohan's public Drive folders (the connector
cannot list link-shared folders — parse the folder HTML for `data-id` rows).
**Curate, never dump:** check each asset's mean colour against the warm-bone
palette and drop what fights it. **Never print raw Drive filenames** — several
encode crude ad hooks.

Open item: the named client list (Taos, Dose, Royal Canadian, Southwind, Motion,
Serenity Studio, FabuLove, Cloudly) and the brands in the creative (Selian
Health, Averon, Norvia, Sweatset, Serenity Studio) only overlap on Serenity
Studio. Captions therefore name only the brand visible *in the ad itself*.
