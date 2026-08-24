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
 * and two tokens:  __FONTFACE__  (the @font-face block)  ·  __BOARD__  (script-board image src)
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
const img = await readFile(p('assets/board.jpg'));
const imgData = `data:image/jpeg;base64,${img.toString('base64')}`;

const shell = (inner) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${inner}
</html>
`;

const local  = body.replace('__FONTFACE__', await fontBlock(false)).replace('__BOARD__', 'assets/board.jpg');
const inlined = body.replace('__FONTFACE__', await fontBlock(true)).replace('__BOARD__', imgData);

await writeFile(p('index.html'), shell(local), 'utf8');
await mkdir(p('dist'), { recursive: true });
await writeFile(p('dist/rohan-falwariya.html'), shell(inlined), 'utf8');
await writeFile(p('dist/artifact-body.html'), inlined, 'utf8');

/* ---- _site/ : the Netlify publish directory (index.html + assets only) ---- */
await mkdir(p('_site/assets/fonts'), { recursive: true });
await writeFile(p('_site/index.html'), shell(local), 'utf8');
await copyFile(p('assets/board.jpg'), p('_site/assets/board.jpg'));
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
console.log('built  _site/                     index.html + board.jpg + ' + fontCount + ' fonts  (Netlify publish dir)');
