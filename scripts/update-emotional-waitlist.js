// Owner confirmed on 2026-09-10: the live program has a paid waiting list ($247).
// Keep displayed prices, purchase expectations and structured data in agreement.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const checkout = 'https://ruladiet.systeme.io/60ace00a';
const description = 'برنامج جماعي مباشر مع رولا علوش لمدة 6 أسابيع. رسوم الانضمام إلى قائمة انتظار البرنامج القادم 247 دولاراً؛ لا تبدأ الجلسات بمجرد الدفع.';

function updateSchemas(html) {
  return html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g, (block, start, text, end) => {
    const data = JSON.parse(text);
    let changed = false;
    function visit(value) {
      if (!value || typeof value !== 'object') return;
      if (value['@type'] === 'Course' && /الشهية الانفعالية/.test(value.name || '')) {
        const before = JSON.stringify(value);
        value.description = description;
        value.offers = {...value.offers, '@type': 'Offer', price: '247.00', priceCurrency: 'USD', availability: 'https://schema.org/PreOrder', url: checkout, description: 'رسوم الانضمام إلى قائمة انتظار البرنامج القادم'};
        changed ||= JSON.stringify(value) !== before;
      }
      Object.values(value).forEach(visit);
    }
    visit(data);
    return changed ? start + JSON.stringify(data, null, 2) + end : block;
  });
}

const updates = [];
for (const name of ['index.html', 'الدورات.html']) {
  const file = path.join(root, name);
  const original = fs.readFileSync(file, 'utf8');
  let html = updateSchemas(original);
  const pattern = /<a\b[^>]*href="\/course\/الأكل-العاطفي"[^>]*class="course-card[^\"]*"[^>]*>[\s\S]*?<\/a>/g;
  if ([...html.matchAll(pattern)].length !== 1) throw new Error(`Expected one emotional course card in ${name}`);
  html = html.replace(pattern, card => {
    card = card.replace(/<div class="course-price">[\s\S]*?<\/div>/, '<div class="course-price"><span class="price-current">$247.00</span></div>');
    card = card.replace(/<p class="course-desc">[\s\S]*?<\/p>/, '<p class="course-desc">برنامج جماعي مباشر مع رولا علوش لمدة 6 أسابيع لفهم علاقتك بالطعام وبناء عادات متوازنة.</p>');
    const note = '<p class="course-waitlist-note" style="font-size:.88rem;font-weight:700;color:#2d5240;margin:8px 0">قائمة انتظار مدفوعة للبرنامج القادم — 247 دولاراً</p>';
    if (card.includes('class="course-waitlist-note"')) card = card.replace(/<p class="course-waitlist-note"[^>]*>[\s\S]*?<\/p>/, note);
    else card = card.replace('<div class="course-meta">', note + '<div class="course-meta">');
    return card;
  });
  updates.push({file, original, html});
}

const file = path.join(root, 'course', 'الأكل-العاطفي.html');
const original = fs.readFileSync(file, 'utf8');
let html = updateSchemas(original);
html = html.replace(/(<meta (?:name="description"|property="og:description") content=")[^"]*(")/g, (_, start, end) => start + description + end);
html = html.replace(/(<p class="sub">)[\s\S]*?(<\/p>)/, '$1برنامج مباشر مع رولا علوش — 6 أسابيع من الجلسات الجماعية لفهم علاقتك بالطعام وبناء عادات متوازنة.$2');
html = html.replace('سجّلي في قائمة الانتظار', 'قائمة انتظار مدفوعة — 247 دولاراً');
html = html.replace('تخلّصي من الأكل العاطفي نهائياً', 'افهمي الأكل العاطفي وابني علاقة أهدأ مع الطعام');
html = html.replace('وتبني علاقة متوازنة مع جسدك تستمر مدى الحياة', 'وتبنين علاقة أكثر توازناً مع الطعام وجسدك');
html = html.replace('المجموعة محدودة العدد لضمان اهتمام شخصي لكل مشاركة. التسجيل في قائمة الانتظار يحجز مكانك بالدورة القادمة.', 'المجموعة محدودة العدد. تدفعين 247 دولاراً للانضمام إلى قائمة انتظار البرنامج القادم؛ لا تبدأ الجلسات بمجرد الدفع. تواصلي مع الفريق لمعرفة موعد المجموعة وطريقة الحضور.');
html = html.replace(/(<div class="price-free"[^>]*>)[\s\S]*?(<\/div>)/, '$1قائمة انتظار مدفوعة<br><span dir="ltr">247 USD</span>$2');
html = html.replace(/(<div class="price-label"[^>]*>)[\s\S]*?(<\/div>)/, '$1رسوم الانضمام للبرنامج القادم$2');
html = html.replace(new RegExp(`<a href="${checkout}"[^>]*>[^<]*<\\/a>`, 'g'), link => {
  const label = link.includes('nav-cta') ? 'الانضمام · 247$' : 'ادفعي 247$ وانضمي لقائمة الانتظار';
  return link.replace(/ target="_blank"/, '').replace(/ rel="noopener"/, '').replace(/>[^<]*<\/a>$/, '>' + label + '</a>');
});
const note = '<p class="paid-waitlist-explainer" style="font-size:.9rem;line-height:1.8;margin:0 0 16px;color:#4a6b5a">الدفع يضيفك إلى قائمة انتظار البرنامج القادم، ولا يعني بدء الجلسات فوراً. <a href="https://wa.me/905300222468" style="text-decoration:underline">استفسري عن الموعد قبل التسجيل</a>.</p>';
if (html.includes('class="paid-waitlist-explainer"')) html = html.replace(/<p class="paid-waitlist-explainer"[^>]*>[\s\S]*?<\/p>/, note);
else html = html.replace('<div class="sidebar-cta">', '<div class="sidebar-cta">' + note);
updates.push({file, original, html});

for (const item of updates) {
  if (item.html !== item.original) fs.writeFileSync(item.file, item.html, 'utf8');
}
console.log('Paid waiting list aligned at USD 247 across homepage, course listing and program page.');
