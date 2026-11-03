// Keep the Restart invitation on every public site page after page generators run.
const fs = require('node:fs');
const path = require('node:path');
const {allFooterFiles} = require('./sync-footer');

const root = path.resolve(__dirname, '..');
const start = '<!-- restart-banner:start -->';
const end = '<!-- restart-banner:end -->';
const stylesheet = '<link rel="stylesheet" href="/css/restart-banner.css">';
const destination = 'https://course.ruladiet.com/restart?utm_source=ruladiet.com&amp;utm_medium=onsite_banner&amp;utm_campaign=restart_nov2026&amp;utm_content=persistent_ribbon';
const banner = `${start}<aside class="restart-banner" aria-label="تحدّي Restart"><div class="restart-banner__inner"><p class="restart-banner__message"><strong>تحدّي Restart</strong><span>6 أسابيع تبدأ في 23 نوفمبر</span></p><a class="restart-banner__link" href="${destination}">تفاصيل التحدّي والتسجيل <span aria-hidden="true">←</span></a></div></aside>${end}`;

function update(html) {
  if (!/<body\b[^>]*>/i.test(html) || !/<\/head>/i.test(html)) throw new Error('Missing document structure');
  let result = html;
  if (result.includes(start) || result.includes(end)) {
    if (!result.includes(start) || !result.includes(end)) throw new Error('Incomplete Restart banner marker');
    result = result.replace(/<!-- restart-banner:start -->[\s\S]*?<!-- restart-banner:end -->/, banner);
  } else {
    result = result.replace(/<body\b[^>]*>/i, match => match + banner);
  }
  if (!result.includes(stylesheet)) result = result.replace(/<\/head>/i, stylesheet + '</head>');
  return result;
}

function eligibleFiles() {
  return allFooterFiles().filter(file => !['404.html', 'شكر-للشراء.html', 'course/شراء-المسار-الصحي.html'].includes(file));
}

function run(check = false) {
  const changed = [];
  for (const file of eligibleFiles()) {
    const full = path.join(root, file);
    const before = fs.readFileSync(full, 'utf8');
    let after = update(before);
    if (before.includes('\r\n')) after = after.replace(/\r?\n/g, '\r\n');
    if (before !== after) {
      changed.push(file);
      if (!check) fs.writeFileSync(full, after, 'utf8');
    }
  }
  console.log(`${check ? 'Out of sync' : 'Updated'}: ${changed.length} of ${eligibleFiles().length} site pages`);
  if (check && changed.length) process.exitCode = 1;
  return changed;
}

if (require.main === module) run(process.argv.includes('--check'));
module.exports = {update, eligibleFiles, run};
