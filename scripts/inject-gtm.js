// Installs the Google Tag Manager container (GTM-5R2Z54KG) on every shipped
// HTML page: the loader right after <head>, the noscript iframe right after
// <body>. GA4 and the ruladiet.com Meta Pixel are configured inside GTM, so no
// other tracking code belongs in the pages. Idempotent and byte-safe (latin1
// round-trips every byte, including the known null bytes in one course page).
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const ID = 'GTM-5R2Z54KG';
const HEAD = `<!-- Google Tag Manager --><script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${ID}');</script><!-- End Google Tag Manager -->`;
const BODY = `<!-- Google Tag Manager (noscript) --><noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript><!-- End Google Tag Manager (noscript) -->`;

const files = execFileSync('git', ['-c', 'core.quotepath=false', 'ls-files', '-z', '*.html'], { cwd: root, encoding: 'utf8' })
  .split('\0').filter(f => f && !f.startsWith('content/'));

let changed = 0, skipped = 0;
const problems = [];
for (const rel of files) {
  const file = path.join(root, rel);
  const text = fs.readFileSync(file).toString('latin1');
  if (text.includes(ID)) { skipped++; continue; }
  const head = text.match(/<head(\s[^>]*)?>/i);
  const body = text.match(/<body(\s[^>]*)?>/i);
  if (!head || !body || body.index < head.index) { problems.push(rel); continue; }
  const h = head.index + head[0].length;
  const b = body.index + body[0].length;
  const out = text.slice(0, h) + HEAD + text.slice(h, b) + BODY + text.slice(b);
  fs.writeFileSync(file, Buffer.from(out, 'latin1'));
  changed++;
}
console.log(JSON.stringify({ pages: files.length, changed, alreadyInstalled: skipped, problems }));
if (problems.length) process.exitCode = 1;
