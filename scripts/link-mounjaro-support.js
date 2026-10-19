// Contextual navigation only: preserve clinical wording and publication dates.
const fs = require('fs');
const path = require('path');
const posts = require('./blog-catalog');
const { postPath, postFile } = require('./blog-taxonomy');
const root = path.resolve(__dirname, '..');
const main = posts.find(p => p.key === 'mounjaro-diet');
const changes = [
  ['اختاري مصدر بروتين:', 'weight-medication-protein-review'],
  ['لا تعالجي الغثيان بالصيام الطويل', 'mounjaro-nausea-meals', 'الغثيان'],
  ['الإمساك المستمر أو الشديد', 'mounjaro-constipation-care', 'الإمساك']
];
for (const relative of ['content/blog/mounjaro-diet.html', postFile(main)]) {
  const file = path.resolve(root, relative);
  let html = fs.readFileSync(file, 'utf8');
  for (const [context, key, label = context] of changes) {
    const target = posts.find(p => p.key === key);
    if (!target) throw new Error('Missing target ' + key);
    const href = postPath(target);
    const replacement = context.replace(label, '<a href="' + href + '">' + label + '</a>');
    if (html.includes(replacement)) continue;
    if (html.split(context).length !== 2) throw new Error('Unexpected preimage: ' + relative + ' / ' + context);
    html = html.replace(context, replacement);
  }
  if (html !== fs.readFileSync(file, 'utf8')) fs.writeFileSync(file, html);
}
