// Boundary checks: only the approved source reaches the approved checkout.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'js/campaign-source.js'), 'utf8');
const page = fs.readFileSync(path.join(root, 'course/تكيس-المبايض.html'), 'utf8');
const checkout = 'https://course.ruladiet.com/25bf7823';
const campaign = 'utm_source=meta&utm_medium=paid_social&utm_campaign=rd_pcos_us_202609&utm_content=rula_intro';
const urls = [...page.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map(match => match[1]);
assert.equal((page.match(/src="\/js\/campaign-source\.js"/g) || []).length, 1);
assert.ok(urls.filter(url => url === checkout).length >= 2, 'Check all actual checkout CTAs');
function run(query, links = urls, route = '/course/تكيس-المبايض') {
  const nodes = links.map(href => ({ href, getAttribute() { return this.href; }, setAttribute(_, value) { this.href = value; } }));
  const location = new URL('https://ruladiet.com' + route + (query ? '?' + query : ''));
  // No network or browser storage APIs are provided: accidental use must fail.
  vm.runInNewContext(code, { window: { location }, document: { querySelectorAll: () => nodes }, URL, URLSearchParams });
  return nodes.map(node => node.href);
}
const updated = run(campaign + '&fbclid=private-id&email=private%40example.com&utm_term=private');
assert.deepEqual(updated, urls.map(url => url === checkout ? checkout + '?' + campaign : url));
assert.deepEqual(run(''), urls, 'Organic visits stay untagged');
assert.deepEqual(run(campaign.replace('rula_intro', 'someone@example.com')), urls);
assert.deepEqual(run(campaign + '&utm_source=other'), urls, 'Reject ambiguous duplicate values');
assert.deepEqual(run(campaign, urls, '/course/رحلة-التغيير'), urls, 'No cross-course attribution');
assert.deepEqual(run(campaign, urls, '/course/%ZZ'), urls, 'Malformed paths do not break navigation');
const unrelated = ['https://course.ruladiet.com.evil.example/25bf7823', 'http://course.ruladiet.com/25bf7823', 'https://course.ruladiet.com/login', 'https://example.com', checkout + '?utm_source=newsletter'];
assert.deepEqual(run(campaign, unrelated), unrelated);
assert.equal(run(campaign, [checkout + '?coupon=TEST#order'])[0], checkout + '?coupon=TEST&' + campaign + '#order');
console.log('Campaign source checks passed: approved handoff, no identifiers, organic and unrelated links unchanged.');
