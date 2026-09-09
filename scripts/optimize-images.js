// Generate responsive copies without changing the source artwork or course content.
// Run after HTML maintenance; do not regenerate course pages to apply this change.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const outputDir = path.join(root, 'images', 'responsive');
const assets = {
  'RULA-DIET-LOGO.webp': { widths: [96, 192, 384, 768], fallback: 384, quality: 85 },
  'rulamain.webp': { widths: [200, 400, 600], fallback: 400, quality: 82 },
  'course1.webp': { widths: [480, 800], fallback: 800, quality: 82 },
  'course-rehla.webp': { widths: [480, 800, 1200, 1600], fallback: 800, quality: 82 },
  'course-massar.webp': { widths: [480, 800, 1200, 1600], fallback: 800, quality: 82 },
  'course-pcos.webp': { widths: [480, 800, 1200, 1600], fallback: 800, quality: 82 },
};
const cardSizes = '(max-width: 600px) calc(100vw - 40px), (max-width: 1200px) calc(50vw - 32px), 568px';
const url = (name, width) => `/images/responsive/${path.parse(name).name}-${width}.webp`;

function setAttr(tag, name, value) {
  const attr = new RegExp(`\\s${name}=("[^"]*"|'[^']*')`, 'i');
  return attr.test(tag) ? tag.replace(attr, ` ${name}="${value}"`) : tag.replace(/\s*\/?>$/, ` ${name}="${value}">`);
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const report = [];
  for (const [name, options] of Object.entries(assets)) {
    const input = path.join(root, 'images', name);
    const variants = [];
    for (const width of options.widths) {
      const target = path.join(root, url(name, width));
      const info = await sharp(input).resize({ width, withoutEnlargement: true })
        .webp({ quality: options.quality, effort: 6 }).toFile(target);
      variants.push({ width: info.width, height: info.height, bytes: info.size });
    }
    report.push({ source: name, sourceBytes: fs.statSync(input).size, variants });
  }

  const files = ['', 'blog', 'course'].flatMap(dir => fs.readdirSync(path.join(root, dir))
    .filter(name => name.endsWith('.html')).map(name => path.posix.join(dir, name)));
  const changed = [];
  for (const file of files) {
    const filename = path.join(root, file);
    const before = fs.readFileSync(filename, 'utf8');
    const after = before.replace(/<img\b[^>]*>/gi, (tag, offset) => {
      const src = tag.match(/\ssrc=["']([^"']+)["']/i)?.[1];
      if (!src) return tag;
      const name = Object.keys(assets).find(key =>
        src === `images/${key}` || src === `/images/${key}` ||
        assets[key].widths.some(width => src === url(key, width)));
      if (!name) return tag;
      const isLogo = name === 'RULA-DIET-LOGO.webp';
      // Course thumbnails share their two-column layout on these two pages only.
      if (!isLogo && !['index.html', 'الدورات.html'].includes(file)) return tag;
      if (name === 'rulamain.webp' && file !== 'index.html') return tag;
      const options = assets[name];
      const inHeader = before.lastIndexOf('<header', offset) > before.lastIndexOf('</header>', offset);
      const sizes = isLogo ? (inHeader ? '76px' : '180px') : name === 'rulamain.webp' ? '200px' : cardSizes;
      tag = setAttr(tag, 'src', url(name, options.fallback));
      tag = setAttr(tag, 'srcset', options.widths.map(width => `${url(name, width)} ${width}w`).join(', '));
      return setAttr(tag, 'sizes', sizes);
    });
    if (after !== before) {
      fs.writeFileSync(filename, after, 'utf8');
      changed.push(file);
    }
  }
  console.log(JSON.stringify({ assets: report, changedPages: changed }, null, 2));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
