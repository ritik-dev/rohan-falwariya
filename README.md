# rohan-site

One-page portfolio for **Rohan Falwariya** — creative strategist & ad editor for
DTC brands.

```bash
node build.mjs      # Node 18+, no install step
open index.html
```

Edit `src/page.html` — that is the only source file. Everything else in the root
and in `dist/` is generated. See **AGENTS.md** for the rules and **chats.md** for
how it got built and what's still open.

Zero runtime dependencies. Fonts and images are self-hosted, so the page works
fully offline and on any static host.

- `index.html` — the site (links `assets/`)
- `dist/rohan-falwariya.html` — the same site as one ~280 KB file
