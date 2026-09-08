#!/usr/bin/env node
/*
 * update-address.js — moves the site's NAP data from the old Esenyurt premises
 * to the current Başakşehir address, matching the Google Business Profile.
 *
 * Also: refreshes the stale review count and adds geo + hasMap to the
 * MedicalBusiness schema.
 *
 *   node update-address.js --dry
 *   node update-address.js
 */
const fs = require('fs');
const path = require('path');

const DRY = process.argv.includes('--dry');
const SKIP_DIRS = new Set(['node_modules', '.git', '.vercel', 'videos', 'vimeo-downloads', 'images']);
const PLACE_ID = 'ChIJPxfeU-unyhQRyIYSaHZkkoA';
const LAT = 41.1173717, LNG = 28.7746752;

/* ---- ordered, longest-match-first replacements ---- */
const REPL = [
  // 1. inline one-line address (booking page)
  ['Esenkent, Esenkent-Bahçeşehir Yolu, 34510 Esenyurt/İstanbul',
   'Kayabaşı, Adnan Menderes Bulvarı, Emlak Konut Kuzey Yakası A2 Blok No:3, 34494 Başakşehir/İstanbul'],
  ['Esenkent, Esenkent-Bahçeşehir Yolu, 34510 Esenyurt/Istanbul',
   'Kayabaşı, Adnan Menderes Bulvarı, Emlak Konut Kuzey Yakası A2 Blok No:3, 34494 Başakşehir/İstanbul'],

  // 2. footer <p> two-liner (both İ spellings seen in the wild)
  ['Esenkent, Esenkent-Bahçeşehir Yolu<br>34510 Esenyurt/İstanbul',
   'Kayabaşı, Adnan Menderes Bulvarı<br>Emlak Konut Kuzey Yakası A2 Blok No:3<br>34494 Başakşehir/İstanbul'],
  ['Esenkent, Esenkent-Bahçeşehir Yolu<br>34510 Esenyurt/Istanbul',
   'Kayabaşı, Adnan Menderes Bulvarı<br>Emlak Konut Kuzey Yakası A2 Blok No:3<br>34494 Başakşehir/İstanbul'],

  // 3. course-page <li> pair
  ['<li>Esenkent, Esenkent-Bahçeşehir Yolu</li>',
   '<li>Kayabaşı, Adnan Menderes Bulvarı</li>\n            <li>Emlak Konut Kuzey Yakası A2 Blok No:3</li>'],
  ['<li>34510 Esenyurt/İstanbul</li>', '<li>34494 Başakşehir/İstanbul</li>'],
  ['<li>34510 Esenyurt/Istanbul</li>', '<li>34494 Başakşehir/İstanbul</li>'],

  // 4. JSON-LD PostalAddress
  ['"streetAddress": "Esenkent, Esenkent-Bahçeşehir Yolu"',
   '"streetAddress": "Kayabaşı, Adnan Menderes Bulvarı, Emlak Konut Kuzey Yakası A2 Blok No:3"'],
  ['"addressLocality": "Esenyurt"', '"addressLocality": "Başakşehir"'],
  ['"postalCode": "34510"',         '"postalCode": "34494"'],

  // 5. stale Google review count (Google shows 162)
  ['"reviewCount": "153"',          '"reviewCount": "162"'],
  ['تقييم جوجل (153 تقييم)',        'تقييم جوجل (162 تقييم)'],
];

/* ---- add geo + hasMap right after the PostalAddress block ---- */
const GEO_COMMA_RE = /("addressCountry":\s*"TR"\s*\n(\s*)\},)/;      // address block followed by more props
const GEO_LAST_RE  = /("addressCountry":\s*"TR"\s*\n(\s*)\})(\s*\n)/;    // address block is the last prop
function geoLines(ind, trailingComma) {
  return '\n' +
    ind + '"geo": {\n' +
    ind + '    "@type": "GeoCoordinates",\n' +
    ind + '    "latitude": ' + LAT + ',\n' +
    ind + '    "longitude": ' + LNG + '\n' +
    ind + '},\n' +
    ind + '"hasMap": "https://www.google.com/maps/place/?q=place_id:' + PLACE_ID + '"' +
    (trailingComma ? ',' : '');
}
function addGeo(src) {
  if (src.includes('"hasMap"')) return src;
  if (GEO_COMMA_RE.test(src)) {
    return src.replace(GEO_COMMA_RE, (m, whole, ind) => whole + geoLines(ind, true));
  }
  if (GEO_LAST_RE.test(src)) {
    return src.replace(GEO_LAST_RE, (m, whole, ind, tail) => whole + ',' + geoLines(ind, false) + tail);
  }
  return src;
}

function walk(dir, out) {
  out = out || [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(path.join(dir, e.name), out); }
    else if (/\.html$/.test(e.name)) out.push(path.join(dir, e.name));
  }
  return out;
}

const targets = walk('.').concat(['build-course-pages-v2.js']);
let changed = 0, geoAdded = 0;
const leftovers = [];

for (const file of targets) {
  if (!fs.existsSync(file)) continue;
  const src = fs.readFileSync(file, 'utf8');
  let out = src;
  for (const [from, to] of REPL) out = out.split(from).join(to);
  const beforeGeo = out;
  out = addGeo(out);
  if (out !== beforeGeo) geoAdded++;

  if (out !== src) {
    const hits = [];
    for (const [from] of REPL) if (src.includes(from)) hits.push(from.slice(0, 46));
    console.log((DRY ? '  would update ' : '  updated ') + file);
    hits.forEach(h => console.log('        · ' + h));
    if (out !== beforeGeo) console.log('        · + geo / hasMap');
    if (!DRY) {
      fs.writeFileSync(file + '.bak-address', src, 'utf8');
      fs.writeFileSync(file, out, 'utf8');
    }
    changed++;
  }
  // residue check on the post-replacement text
  for (const needle of ['Esenkent', 'Esenyurt', '34510']) {
    if (out.includes(needle)) leftovers.push(file + '  ->  ' + needle);
  }
}

console.log('\n' + (DRY ? 'WOULD CHANGE' : 'CHANGED') + ': ' + changed + ' files   (geo/hasMap added to ' + geoAdded + ')');
if (leftovers.length) { console.log('\n!! LEFTOVER OLD-ADDRESS STRINGS:'); leftovers.forEach(l => console.log('   ' + l)); }
else console.log('No remaining "Esenkent" / "Esenyurt" / "34510" in any patched file.');
