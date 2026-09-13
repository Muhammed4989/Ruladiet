// Keep the homepage's first paint consistent with its final layout.
const fs = require('node:fs');
const path = require('node:path');
const file = path.resolve(__dirname, '..', 'index.html');
const before = fs.readFileSync(file, 'utf8');
let html = before.replace(/<link\b[^>]*href=["']https:\/\/fonts\.(?:googleapis|gstatic)\.com[^"']*["'][^>]*>/g, '');
html = html.replace(/<noscript>\s*<\/noscript>/g, '');
html = html.replace(/(<link rel="stylesheet" href="css\/(?:style|pages)\.css") media="print" onload='this.media="all"'/g, '$1');
if (!html.includes('href="/css/home-fonts.css"')) {
  html = html.replace('<link rel="preload" as="image"',
    '<link rel="preload" as="font" href="/fonts/tajawal/tajawal-400-arabic.woff2" type="font/woff2" crossorigin>' +
    '<link rel="preload" as="font" href="/fonts/tajawal/tajawal-800-arabic.woff2" type="font/woff2" crossorigin>' +
    '<link rel="stylesheet" href="/css/home-fonts.css"><link rel="preload" as="image"');
}
// The content-height fix must follow the legacy inline critical styles.
// Always normalize its position so regeneration cannot override it again.
html = html.replace(/<link\b[^>]*href=["']\/css\/home-layout\.css["'][^>]*>/g, '');
html = html.replace('</head>', '<link rel="stylesheet" href="/css/home-layout.css"></head>');
if (html !== before) fs.writeFileSync(file, html, 'utf8');
console.log(JSON.stringify({ changed: html !== before }));
