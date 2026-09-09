// Reapply shared logo links and styling after a page rebuild, without regenerating content.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const files = ['', 'blog', 'course'].flatMap(dir => fs.readdirSync(path.join(root, dir))
  .filter(name => name.endsWith('.html')).map(name => path.posix.join(dir, name)));
function attr(tag, name, value) {
  const pattern = new RegExp('\\s' + name + '=("[^"]*"|\'[^\']*\')', 'i');
  return pattern.test(tag) ? tag.replace(pattern, ` ${name}="${value}"`) : tag.replace(/>$/, ` ${name}="${value}">`);
}
let changed = 0;
for (const file of files) {
  const filename = path.join(root, file);
  const before = fs.readFileSync(filename, 'utf8');
  let after = before.replace(/(<a\b[^>]*\bclass="logo"[^>]*>\s*)(<img\b[^>]*>)/gi, (_, anchor, img) => {
    anchor = attr(anchor.trimEnd(), 'href', '/');
    img = attr(attr(attr(img, 'width', '81'), 'height', '64'), 'sizes', '81px');
    return anchor + img;
  });
  after = after.replace(/(<div\b[^>]*\bclass="footer-brand"[^>]*>\s*)(<img\b[^>]*RULA-DIET-LOGO[^>]*>)/gi,
    (_, opening, img) => opening + '<a href="/" class="footer-logo" aria-label="رولا دايت - الصفحة الرئيسية">' +
      attr(attr(img, 'width', '180'), 'height', '143') + '</a>');
  if (/class="(?:logo|footer-logo)"/.test(after) && !after.includes('href="/css/brand-navigation.css"')) {
    after = after.replace(/<\/head>/i, '<link rel="stylesheet" href="/css/brand-navigation.css"></head>');
  }
  if (file === 'course/رحلة-التغيير.html') {
    after = after.replace(/<button\b[^>]*class="btn btn-primary nav-cta"[^>]*>ابدأ مجاناً<\/button>/,
      '<a href="https://course.ruladiet.com/a52dc038" class="btn btn-primary nav-cta">ابدأ مجاناً</a>');
    after = after.replace(/<a\b[^>]*href="https:\/\/course\.ruladiet\.com\/a52dc038"[^>]*>/g,
      tag => tag.replace(/\s(?:target|rel)="[^"]*"/g, ''));
  }
  if (after !== before) { fs.writeFileSync(filename, after, 'utf8'); changed++; }
}
console.log(`Brand navigation updated on ${changed} pages.`);
