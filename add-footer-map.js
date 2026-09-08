#!/usr/bin/env node
/*
 * add-footer-map.js — adds the shared footer-map script tag to every page
 * that renders the site footer. Idempotent: safe to re-run after a rebuild.
 *
 *   node add-footer-map.js          # apply
 *   node add-footer-map.js --dry    # report only
 */
const fs = require('fs');
const path = require('path');

const DRY = process.argv.includes('--dry');
const TAG = '<script src="/js/footer-map.js" defer></script>';
const SKIP_DIRS = new Set(['node_modules', '.git', '.vercel', 'videos', 'vimeo-downloads', 'images']);

function walk(dir, out) {
  out = out || [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walk(path.join(dir, e.name), out);
    } else if (e.name.endsWith('.html')) {
      out.push(path.join(dir, e.name));
    }
  }
  return out;
}

const NUL = String.fromCharCode(0);
const results = { patched: [], already: [], noFooter: [], noBody: [], nulls: [] };

for (const file of walk('.')) {
  const src = fs.readFileSync(file, 'utf8');

  if (src.indexOf(NUL) !== -1) results.nulls.push(file);   // flag, still patch
  if (src.indexOf('footer-bottom-new') === -1) { results.noFooter.push(file); continue; }
  if (src.indexOf('js/footer-map.js') !== -1) { results.already.push(file); continue; }
  if (src.indexOf('</body>') === -1) { results.noBody.push(file); continue; }

  const out = src.replace('</body>', TAG + '</body>');
  if (!DRY) {
    fs.writeFileSync(file + '.bak-footermap', src, 'utf8');
    fs.writeFileSync(file, out, 'utf8');
  }
  results.patched.push(file);
}

console.log((DRY ? 'WOULD PATCH' : 'PATCHED') + ': ' + results.patched.length);
results.patched.forEach(f => console.log('   + ' + f));
if (results.already.length)  console.log('ALREADY HAD TAG: ' + results.already.length);
if (results.noFooter.length) console.log('NO FOOTER (skipped): ' + results.noFooter.length + '\n   ' + results.noFooter.join('\n   '));
if (results.noBody.length)   console.log('NO </body> (skipped): ' + results.noBody.length + '\n   ' + results.noBody.join('\n   '));
if (results.nulls.length)    console.log('\n!! NULL BYTES FOUND (file is corrupted, needs a rebuild):\n   ' + results.nulls.join('\n   '));
