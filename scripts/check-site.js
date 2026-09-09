const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const origin = 'https://ruladiet.com';
const files = ['', 'blog', 'course'].flatMap(dir => fs.readdirSync(path.join(root, dir))
  .filter(name => name.endsWith('.html')).map(name => path.posix.join(dir, name)));
const errors = [];
const warnings = [];
let schemas = 0;
let internalLinks = 0;
function check(condition, message) { if (!condition) errors.push(message); }
function fileForUrl(url) {
  let route = decodeURIComponent(url.pathname);
  if (route === '/') return 'index.html';
  if (route.endsWith('/')) route += 'index.html';
  if (!path.extname(route)) route += '.html';
  return route.slice(1);
}

for (const file of files) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const pageUrl = origin + (file === 'index.html' ? '/' : '/' + file.replace(/\.html$/, ''));
  check(!html.startsWith('\uFEFF'), file + ': unexpected UTF-8 BOM');
  check(!html.includes('\uFFFD'), file + ': invalid Unicode replacement character');
  check(!/Esenkent|Esenyurt|34510|باهشى شهير/.test(html), file + ': stale clinic location');
  check(!/onclick='window\.location\.href='https:\/\/course\.ruladiet\.com\/login''/.test(html), file + ': broken login handler');
  if (file === 'رولا-علوش.html') check(html.includes('ماجستير في التغذية والحميات</h4><div class="meta">جامعة صباح الدين زعيم'), 'Biography must use the owner-confirmed master’s university');
  if (!['شكر-للشراء.html', 'course/شراء-المسار-الصحي.html'].includes(file)) {
    check(html.includes('<script src="/js/footer-map.js" defer></script>'), file + ': missing footer map');
    check((html.match(/<h1\b/gi) || []).length === 1, file + ': expected one H1');
  }

  const nulls = (html.match(/\0/g) || []).length;
  check(nulls === 0 || (file === 'course/الأكل-العاطفي.html' && nulls <= 588), file + ': new null-byte corruption');
  if (nulls) warnings.push(file + ': ' + nulls + ' pre-existing null bytes; course content preserved');
  for (const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = script[1];
    if (/type=["']application\/ld\+json["']/i.test(attrs)) {
      try { JSON.parse(script[2]); schemas++; } catch (error) { errors.push(file + ': invalid JSON-LD: ' + error.message); }
    } else if (!/\bsrc=/i.test(attrs) && (!/\btype=/i.test(attrs) || /type=["'](?:text|application)\/javascript["']/i.test(attrs))) {
      try { new vm.Script(script[2]); } catch (error) { errors.push(file + ': invalid inline script: ' + error.message); }
    }
  }

  for (const match of html.matchAll(/<a\b[^>]*\bhref=(["'])([^"']*)\1/gi)) {
    const href = match[2];
    if (!href || /^(?:mailto:|tel:|javascript:|#)/i.test(href)) continue;
    const url = new URL(href.replace(/&amp;/g, '&'), pageUrl);
    if (url.origin !== origin || url.pathname.startsWith('/api/')) continue;
    internalLinks++;
    const targetFile = fileForUrl(url);
    check(fs.existsSync(path.join(root, targetFile)), file + ': missing target ' + url.pathname);
    if (targetFile.endsWith('.html')) {
      check(!url.pathname.endsWith('.html'), file + ': noncanonical HTML link ' + href);
      if (!/^https?:/i.test(href)) check(href.startsWith('/'), file + ': relative page link ' + href);
    }
  }
}

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
check(new Set(locations).size === locations.length, 'Duplicate sitemap URLs');
check(!locations.includes(origin + '/404'), 'Error page must not be in the sitemap');
for (const loc of locations) {
  const url = new URL(loc);
  const filename = fileForUrl(url);
  check(url.origin === origin, 'Unexpected sitemap host ' + loc);
  check(fs.existsSync(path.join(root, filename)), 'Missing sitemap page ' + filename);
  if (fs.existsSync(path.join(root, filename))) {
    const html = fs.readFileSync(path.join(root, filename), 'utf8');
    check(!/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html), filename + ': noindex page in sitemap');
    const canonical = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    check(!!canonical && decodeURI(canonical[1]) === decodeURI(loc), filename + ': sitemap/canonical mismatch');
  }
}

const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
for (const source of ['/courses/كورس-رحلة-التغيير', '/courses/كورس-رحلة-التغيير/', '/category/صحة', '/category/صحة/']) {
  // Vercel matches the encoded HTTP pathname, not the decoded Arabic slug.
  const wirePath = new URL(source, origin).pathname;
  const rule = config.redirects.find(rule => rule.source === wirePath);
  check(!!rule && rule.permanent === true, 'Missing permanent legacy redirect ' + source);
  if (rule) check(fs.existsSync(path.join(root, fileForUrl(new URL(rule.destination, origin)))), 'Missing redirect destination ' + rule.destination);
}
console.log(JSON.stringify({ pages: files.length, schemas, internalLinks, sitemapUrls: locations.length, warnings, errors }, null, 2));
assert.equal(errors.length, 0, 'Site checks failed');
