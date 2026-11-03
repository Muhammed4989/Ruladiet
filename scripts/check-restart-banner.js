const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {eligibleFiles, update} = require('./sync-restart-banner');

const root = path.resolve(__dirname, '..');
const files = eligibleFiles();
assert(files.length > 100, 'Expected site-wide coverage');
for (const file of files) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  assert.equal((html.match(/<!-- restart-banner:start -->/g) || []).length, 1, `${file}: banner count`);
  assert.equal((html.match(/href="\/css\/restart-banner\.css"/g) || []).length, 1, `${file}: stylesheet count`);
  assert.equal((html.match(/utm_medium=onsite_banner/g) || []).length, 1, `${file}: source link count`);
  assert.equal(update(html), html, `${file}: banner out of sync`);
}
for (const file of ['404.html', 'شكر-للشراء.html', 'course/شراء-المسار-الصحي.html']) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  assert(!html.includes('restart-banner:start'), `${file}: should not show a sales banner`);
}
console.log(`Restart banner verified on ${files.length} pages`);
