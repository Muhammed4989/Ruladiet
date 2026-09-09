const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const origin = 'https://ruladiet.com';
const htmlFiles = ['', 'blog', 'course'].flatMap(dir =>
  fs.readdirSync(path.join(root, dir))
    .filter(name => name.endsWith('.html'))
    .map(name => path.posix.join(dir, name))
);
const routes = new Map(htmlFiles.map(file => [
  '/' + file,
  file === 'index.html' ? '/' : '/' + file.replace(/\.html$/, '')
]));
routes.set('/', '/');
for (const canonical of [...routes.values()]) routes.set(canonical, canonical);

function normalizePageLinks(html, pageUrl) {
  return html.replace(/(<a\b[^>]*\bhref=)(["'])([^"']*)\2/gi, (match, before, quote, href) => {
    if (!href || /^(?:[a-z][\w+.-]*:|\/\/|#|\?)/i.test(href)) return match;
    const target = new URL(href.replace(/&amp;/g, '&'), pageUrl);
    const destination = routes.get(decodeURIComponent(target.pathname));
    if (!destination || target.origin !== origin) return match;
    return before + quote + destination + target.search.replace(/&/g, '&amp;') + target.hash + quote;
  });
}

function repairHtml(html, pageUrl) {
  return normalizePageLinks(html, pageUrl)
    .replaceAll('باهشى شهير', 'باشاك شهير')
    .replace(
      /<button\b[^>]*class="btn btn-primary nav-cta"[^>]*onclick='window\.location\.href='https:\/\/course\.ruladiet\.com\/login''[^>]*>تسجيل الدخول<\/button>/g,
      '<a href="https://course.ruladiet.com/login" class="btn btn-primary nav-cta">تسجيل الدخول</a>'
    );
}

const changed = [];
const addressChanged = new Set();
for (const file of htmlFiles) {
  const fullPath = path.join(root, file);
  const before = fs.readFileSync(fullPath, 'utf8');
  const after = repairHtml(before, origin + routes.get('/' + file));
  if (after !== before) {
    fs.writeFileSync(fullPath, after, 'utf8');
    changed.push(file);
    if (before.includes('باهشى شهير')) addressChanged.add(origin + routes.get('/' + file));
  }
}

// Keep generated course markup consistent without regenerating or changing course content.
const generatorPath = path.join(root, 'build-course-pages-v2.js');
const generatorBefore = fs.readFileSync(generatorPath, 'utf8');
const generatorAfter = repairHtml(generatorBefore, origin + '/course/template');
if (generatorAfter !== generatorBefore) {
  fs.writeFileSync(generatorPath, generatorAfter, 'utf8');
  changed.push('build-course-pages-v2.js');
}

const sitemapPath = path.join(root, 'sitemap.xml');
const sitemapBefore = fs.readFileSync(sitemapPath, 'utf8');
const today = new Date().toISOString().slice(0, 10);
const sitemapAfter = sitemapBefore.replace(/\s*<url>\s*<loc>([^<]+)<\/loc>[\s\S]*?<\/url>/g, (block, loc) => {
  if (loc === origin + '/404') return '';
  if (addressChanged.has(loc)) return block.replace(/<lastmod>[^<]+<\/lastmod>/, '<lastmod>' + today + '</lastmod>');
  return block;
});
if (sitemapAfter !== sitemapBefore) {
  fs.writeFileSync(sitemapPath, sitemapAfter, 'utf8');
  changed.push('sitemap.xml');
}

console.log(JSON.stringify({ changedFiles: changed.length, files: changed }, null, 2));
