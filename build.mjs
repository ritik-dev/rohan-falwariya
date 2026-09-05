#!/usr/bin/env node
/**
 * Build the Rohan site from src/page.html.
 *
 *   node build.mjs
 *
 * One source of truth, four outputs:
 *   index.html                 – standalone page, links assets/ (edit + preview locally)
 *   dist/rohan-falwariya.html  – single file, fonts + image inlined (email it, drop it anywhere)
 *   dist/artifact-body.html    – same, minus the document wrapper (for the Claude Artifact tool)
 *   _site/                     – exactly what Netlify publishes: index.html + assets/, nothing else.
 *                                Publishing the repo root instead would serve src/, reference/
 *                                (Rohan's deck PDF) and chats.md to anyone who guessed the URL.
 *
 * src/page.html holds <title>, <style>, markup and <script> with no document wrapper,
 * and two tokens:  __FONTFACE__  (the @font-face block)  ·  __FAVICON__  (tab icon href)
 *
 * Fonts are self-hosted — the page needs no network at all.
 */
import { readFile, writeFile, mkdir, copyFile, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const p = (...s) => resolve(here, ...s);

const FACES = [
  ['Instrument Serif', 'normal', 400, 'instrument-serif-400.woff2'],
  ['Instrument Serif', 'italic', 400, 'instrument-serif-400i.woff2'],
  ['Instrument Sans',  'normal', 400, 'instrument-sans-400.woff2'],
  ['Instrument Sans',  'normal', 500, 'instrument-sans-500.woff2'],
  ['IBM Plex Mono',    'normal', 400, 'plex-mono-400.woff2'],
  ['IBM Plex Mono',    'normal', 500, 'plex-mono-500.woff2'],
];

const face = (fam, style, weight, url) =>
  `@font-face{font-family:"${fam}";font-style:${style};font-weight:${weight};font-display:swap;src:url(${url}) format("woff2");}`;

async function fontBlock(inline) {
  const out = [];
  for (const [fam, style, weight, file] of FACES) {
    let url = `assets/fonts/${file}`;
    if (inline) {
      const buf = await readFile(p('assets/fonts', file));
      url = `data:font/woff2;base64,${buf.toString('base64')}`;
    }
    out.push(face(fam, style, weight, url));
  }
  return out.join('\n');
}

const body = await readFile(p('src/page.html'), 'utf8');

/* Selected-work stills. index.html links them; the single-file build inlines
   them so it still works with no network at all. */
const workFiles = (await readdir(p('assets/work')).catch(() => []))
  .filter((f) => f.endsWith('.webp'));
const workData = {};
for (const f of workFiles) {
  const buf = await readFile(p('assets/work', f));
  workData[f] = `data:image/webp;base64,${buf.toString('base64')}`;
}
const inlineWork = (html) =>
  html.replace(/assets\/work\/([A-Za-z0-9_-]+\.webp)/g, (m, f) => workData[f] || m);

/* ROAS and testimonial screenshots. */
const proofFiles = (await readdir(p('assets/proof')).catch(() => []))
  .filter((f) => f.endsWith('.webp'));
const proofData = {};
for (const f of proofFiles) {
  const buf = await readFile(p('assets/proof', f));
  proofData[f] = `data:image/webp;base64,${buf.toString('base64')}`;
}
const inlineProof = (html) =>
  html.replace(/assets\/proof\/([A-Za-z0-9_-]+\.webp)/g, (m, f) => proofData[f] || m);

/* Motion peek. Poster frames are inlined so the single-file build still shows
   the clips as stills; the .mp4s are NOT inlined — they would add megabytes to
   a file whose whole point is being emailable. Offline, the posters stand in. */
const reelFiles = (await readdir(p('assets/reel')).catch(() => []));
const reelPosters = {};
for (const f of reelFiles.filter((f) => f.endsWith('.webp'))) {
  const buf = await readFile(p('assets/reel', f));
  reelPosters[f] = `data:image/webp;base64,${buf.toString('base64')}`;
}
const inlinePosters = (html) =>
  html.replace(/assets\/reel\/([A-Za-z0-9_-]+\.webp)/g, (m, f) => reelPosters[f] || m);

/* Tab icon: an Instrument Serif "R" stored as an outline path, so it needs no
   font at render time. index.html links the file; dist/ inlines it, keeping the
   single-file build working with no network at all. */
const favData = `data:image/svg+xml;base64,${(await readFile(p('assets/favicon.svg'))).toString('base64')}`;

const shell = (inner) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${inner}
</html>
`;

const local  = body.replace('__FONTFACE__', await fontBlock(false))
                   .replace('__FAVICON__', 'assets/favicon.svg');
const inlined = inlineProof(inlinePosters(inlineWork(
                  body.replace('__FONTFACE__', await fontBlock(true))
                      .replace('__FAVICON__', favData))));

await writeFile(p('index.html'), shell(local), 'utf8');
await mkdir(p('dist'), { recursive: true });
await writeFile(p('dist/rohan-falwariya.html'), shell(inlined), 'utf8');
await writeFile(p('dist/artifact-body.html'), inlined, 'utf8');

/* ---- _site/ : the Netlify publish directory (index.html + assets only) ---- */
await mkdir(p('_site/assets/fonts'), { recursive: true });
await writeFile(p('_site/index.html'), shell(local), 'utf8');
for (const f of workFiles) {
  await mkdir(p('_site/assets/work'), { recursive: true });
  await copyFile(p('assets/work', f), p('_site/assets/work', f));
}
for (const f of proofFiles) {
  await mkdir(p('_site/assets/proof'), { recursive: true });
  await copyFile(p('assets/proof', f), p('_site/assets/proof', f));
}
for (const f of reelFiles) {
  await mkdir(p('_site/assets/reel'), { recursive: true });
  await copyFile(p('assets/reel', f), p('_site/assets/reel', f));
}
await copyFile(p('assets/favicon.svg'), p('_site/assets/favicon.svg'));
let fontCount = 0;
for (const f of await readdir(p('assets/fonts'))) {
  if (!f.endsWith('.woff2')) continue;
  await copyFile(p('assets/fonts', f), p('_site/assets/fonts', f));
  fontCount++;
}

const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(0) + ' KB';
console.log('built  index.html                 ' + kb(shell(local)) + '  (+ assets/)');
console.log('built  dist/rohan-falwariya.html  ' + kb(shell(inlined)) + '  self-contained');
console.log('built  dist/artifact-body.html    ' + kb(inlined));
console.log('built  _site/                     index.html + ' + fontCount + ' fonts + ' + workFiles.length + ' stills + ' + reelFiles.length + ' reel + ' + proofFiles.length + ' proof  (Netlify publish dir)');
