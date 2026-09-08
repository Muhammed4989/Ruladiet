#!/usr/bin/env node
/*
 * fix-address-dir.js — the clinic address is Latin script inside an RTL page,
 * so the bidi algorithm moves the leading postcode to the visual end
 * ("Başakşehir/İstanbul 34494"). Marking the address dir="ltr" renders it in
 * the correct order while keeping it right-aligned, the same treatment the
 * phone number already gets.
 */
const fs = require('fs');
const path = require('path');
const DRY = process.argv.includes('--dry');
const SKIP = new Set(['node_modules', '.git', '.vercel', 'videos', 'vimeo-downloads', 'images']);

function walk(d, o) { o = o || [];
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP.has(e.name)) walk(path.join(d, e.name), o); }
    else if (/\.html$/.test(e.name)) o.push(path.join(d, e.name));
  } return o; }

// <p style="...">Kayabaşı...   ->  <p dir="ltr" style="...;text-align:right">Kayabaşı...
const P_RE  = /<p style="(margin-top:12px;[^"]*)">(\s*Kayabaşı)/g;
// <li>Kayabaşı… / <li>Emlak… / <li>34494…
const LI_RE = /<li>(\s*)(Kayabaşı, Adnan|Emlak Konut Kuzey|34494 Başakşehir)/g;

let changed = 0;
for (const file of walk('.').concat(['build-course-pages-v2.js'])) {
  if (!fs.existsSync(file)) continue;
  const src = fs.readFileSync(file, 'utf8');
  let out = src;
  out = out.replace(P_RE,  (m, style, tail) => `<p dir="ltr" style="${style};text-align:right">${tail}`);
  out = out.replace(LI_RE, (m, ws, tail)    => `<li dir="ltr" style="text-align:inherit">${ws}${tail}`);
  if (out !== src) {
    if (!DRY) { fs.writeFileSync(file + '.bak-dir', src, 'utf8'); fs.writeFileSync(file, out, 'utf8'); }
    console.log('  ' + (DRY ? 'would fix ' : 'fixed ') + file);
    changed++;
  }
}
console.log('\n' + (DRY ? 'WOULD CHANGE' : 'CHANGED') + ': ' + changed + ' files');
