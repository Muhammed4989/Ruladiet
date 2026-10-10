// Keep the inline footer on static pages in sync, including generated pages.
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

const root = path.resolve(__dirname, '..');
const ADDRESS = '<p class="footer-address" dir="ltr">Kayabaşı, Adnan Menderes Bulvarı<br>Emlak Konut Kuzey Yakası A2 Blok No:3<br>34494 Başakşehir/İstanbul</p>';
const LINKS = `<nav class="footer-links-new" aria-label="روابط تذييل الموقع">
  <div class="footer-col-new"><h4>روابط</h4><ul>
    <li><a href="/">الرئيسية</a></li>
    <li><a href="/الدورات">الدورات</a></li>
    <li><a href="/المدونة">المدونة</a></li>
    <li><a href="/الفريق">الفريق</a></li>
  </ul></div>
  <div class="footer-col-new"><h4>سياسات</h4><ul>
    <li><a href="/الخصوصية">الخصوصية</a></li>
    <li><a href="/الشروط">الشروط</a></li>
    <li><a href="/الإسترجاع">الإسترجاع</a></li>
  </ul></div>
  <div class="footer-col-new"><h4>تواصل معنا</h4><ul>
    <li><a class="footer-booking-link" href="/احجز-موعد">احجز موعد استشارة</a></li>
    <li><a href="https://wa.me/905300222468" target="_blank" rel="noopener">واتساب</a></li>
    <li><a dir="ltr" href="mailto:info@ruladiet.com">info@ruladiet.com</a></li>
    <li><a dir="ltr" href="tel:+905300222468">+90 530 022 24 68</a></li>
  </ul></div>
</nav>`;

function elementRange(html, className) {
  const open = new RegExp(`<(?<tag>div|nav)\\b[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>`, 'i');
  const match = open.exec(html);
  if (!match) throw new Error(`Missing ${className}`);
  const tag = match.groups.tag;
  const tags = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
  tags.lastIndex = match.index;
  let depth = 0;
  for (let m; (m = tags.exec(html));) {
    depth += m[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return {start: match.index, end: tags.lastIndex};
  }
  throw new Error(`Unclosed ${className}`);
}

function syncFooter(html) {
  if (!html.includes('footer-brand') || !html.includes('footer-links-new')) return html;
  const brand = elementRange(html, 'footer-brand');
  const brandHtml = html.slice(brand.start, brand.end);
  if (brandHtml.includes('34494 Başakşehir/İstanbul') && !brandHtml.includes('class="footer-address"')) {
    const normalized = brandHtml.replace(/<p\b[^>]*dir="ltr"[^>]*>[\s\S]*?34494 Başakşehir\/İstanbul<\/p>/, ADDRESS);
    if (normalized === brandHtml) throw new Error('Could not normalize footer address');
    html = html.slice(0, brand.start) + normalized + html.slice(brand.end);
  } else if (!brandHtml.includes('34494 Başakşehir/İstanbul')) {
    html = html.slice(0, brand.end - 6) + ADDRESS + html.slice(brand.end - 6);
  }
  const links = elementRange(html, 'footer-links-new');
  html = html.slice(0, links.start) + LINKS + html.slice(links.end);
  if (!html.includes('href="/css/footer.css"')) {
    html = html.replace('</head>', '<link rel="stylesheet" href="/css/footer.css">\n</head>');
  }
  if (!html.includes('src="/js/footer-map.js"')) {
    html = html.replace('</body>', '<script src="/js/footer-map.js" defer></script>\n</body>');
  }
  return html;
}

function syncFile(file, check = false) {
  const full = path.resolve(root, file);
  const before = fs.readFileSync(full, 'utf8');
  const updated = syncFooter(before);
  // Preserve the checkout's line endings when replacing minified and pretty footers.
  const after = before.includes('\r\n') ? updated.replace(/\r?\n/g, '\r\n') : updated;
  if (after === before) return false;
  if (!check) fs.writeFileSync(full, after, 'utf8');
  return true;
}

function allFooterFiles() {
  let files;
  if (fs.existsSync(path.join(root, '.git'))) {
    files = execFileSync('git', ['ls-files', '-z', '*.html'], {cwd: root}).toString('utf8').split('\0').filter(Boolean);
  } else {
    // A generated source bundle may not include Git metadata.
    const walk = (dir, recursive) => fs.readdirSync(path.join(root, dir), {withFileTypes: true}).flatMap(entry => {
      const file = path.join(dir, entry.name);
      return entry.isDirectory() ? (recursive ? walk(file, true) : []) : entry.name.endsWith('.html') ? [file] : [];
    });
    files = walk('.', false).concat(...['blog', 'course', 'author'].map(dir => fs.existsSync(path.join(root, dir)) ? walk(dir, true) : []));
  }
  return files.filter(file => {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    return html.includes('footer-brand') && html.includes('footer-links-new');
  });
}

if (require.main === module) {
  const check = process.argv.includes('--check');
  const changed = allFooterFiles().filter(file => syncFile(file, check));
  console.log(`${check ? 'Out of sync' : 'Updated'}: ${changed.length} of ${allFooterFiles().length} footer pages`);
  if (check && changed.length) process.exitCode = 1;
}

module.exports = {syncFooter, syncFile, allFooterFiles};
