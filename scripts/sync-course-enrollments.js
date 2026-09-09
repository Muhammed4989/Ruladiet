// Keep the homepage and course listing aligned with the published course pages.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const slugs = ['رحلة-التغيير', 'المسار-الصحي', 'تكيس-المبايض'];
const counts = new Map();

for (const slug of slugs) {
  const html = fs.readFileSync(path.join(root, 'course', `${slug}.html`), 'utf8');
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const matches = [...text.matchAll(/([0-9]+\s+ملتحق(?:\s+وأكثر)?)(?=\s|$)/gu)];
  if (!matches.length) {
    console.warn(`No enrollment count on ${slug}; existing card count preserved.`);
    continue;
  }
  const values = new Set(matches.map(match => match[1]));
  if (values.size !== 1) throw new Error(`Conflicting enrollment counts on ${slug}`);
  counts.set(slug, matches[0][1].replace('ملتحق', 'طالب'));
}

const updates = [];
for (const name of ['index.html', 'الدورات.html']) {
  const file = path.join(root, name);
  const original = fs.readFileSync(file, 'utf8');
  let html = original;
  for (const [slug, label] of counts) {
    const cardPattern = new RegExp(`<a\\b[^>]*href="/course/${slug}"[^>]*class="course-card[^\"]*"[^>]*>[\\s\\S]*?</a>`, 'g');
    const cards = [...html.matchAll(cardPattern)];
    if (cards.length !== 1) throw new Error(`Expected one ${slug} card in ${name}`);
    const oldCard = cards[0][0];
    const studentPattern = /(<span class="course-students">)[^<]*(<\/span>)/g;
    if ([...oldCard.matchAll(studentPattern)].length !== 1) {
      throw new Error(`Expected one enrollment label for ${slug} in ${name}`);
    }
    const newCard = oldCard.replace(studentPattern, (_, start, end) => `${start}${label}${end}`);
    html = html.replace(oldCard, () => newCard);
  }
  updates.push({file, original, html});
}
for (const {file, original, html} of updates) {
  if (html !== original) fs.writeFileSync(file, html);
}
console.log(JSON.stringify(Object.fromEntries(counts), null, 2));
