// Reapply verified PCOS course details after page regeneration.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const data = require('../content/pcos-course.json');
const count = data.modules.reduce((n, m) => n + m.lessons.length, 0);
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
function update(file, transform) {
  const full = path.join(root, file), old = fs.readFileSync(full, 'utf8');
  const next = transform(old);
  if (next !== old) { fs.writeFileSync(full, next); console.log(`Updated ${file}`); }
}
update('course/تكيس-المبايض.html', html => {
  const nl = html.includes('\r\n') ? '\r\n' : '\n';
  const start = html.indexOf('          <div class="chapter-label">');
  const end = html.indexOf('        </div>' + nl + nl + '        <div class="info-cards">', start);
  if (start < 0 || end < 0) throw new Error('PCOS curriculum boundaries not found');
  let number = 0;
  const chapters = data.modules.map(m => `          <div class="chapter-label">${esc(m.title)} — ${m.lessons.length} دروس</div>\n          <div class="curriculum">\n${m.lessons.map(title => `            <div class="lecture">\n              <div class="lecture-info"><div class="lecture-number">${++number}</div><span class="lecture-title">${esc(title)}</span></div>\n              <div class="lecture-right"><span class="lecture-free">مسجّل</span></div>\n            </div>`).join('\n')}\n          </div>\n`).join('\n').replace(/\n/g, nl);
  html = html.slice(0,start) + chapters + html.slice(end);
  html = html.replace(/34 درس — 6\+ ساعات/g, `${count} درساً — ${data.modules.length} فصول`)
    .replace(/34 درس فيديو/g, `${count} درس فيديو`).replace(/34 درس/g, `${count} درساً`)
    .replace(/6\+ ساعات محتوى/g, `${data.modules.length} فصول تعليمية`).replace(/6\+ ساعات/g, 'دروس مسجّلة')
    .replace('34 فيديو مسجّل تشرح كل المواضيع', `${count} درساً مسجّلاً ضمن ${data.modules.length} فصول`)
    .replace('المواد المرفقة', 'محتوى الكورس')
    .replace('<li>ملخصات مكتوبة لأهم النقاط</li>', '<li>شرح الدورة الشهرية والهرمونات والتكيس</li>')
    .replace('<li>جداول عملية لمتابعة الوزن والتحاليل</li>', '<li>دروس عن التغذية والوزن ومقاومة الأنسولين</li>')
    .replace('<li>قائمة مكملات وأدوية مع شرح الاستعمال</li>', '<li>التعريف بالخيارات الطبية التي تُناقش مع الطبيب</li>')
    .replace(/ملخصات مكتوبة/g, 'محتوى باللغة العربية').replace(/وصول مدى الحياة/g, 'تعلّم عبر الإنترنت')
    .replace('شهادة إتمام', 'دروس مسجّلة')
    .replace('اختصاصية التغذية — أكثر من 140 ألف متابع على انستغرام، مؤسسة رولا دايت ومقدمة برامج التوعية الغذائية.', 'اختصاصية التغذية رولا علوش، مؤسسة رولا دايت ومقدمة الكورس باللغة العربية.')
    .replace('كيف تحسّن صحتك وخصوبتك', 'موضوعات التغذية والوزن والحمل');
  const preview = '<p class="pcos-preview-note" style="color:#fff;text-align:center;margin:0 0 18px">شاهدي المقدمة التعريفية قبل التسجيل. يتضمن الكورس 33 درساً ضمن خمسة فصول.</p>';
  if (!html.includes('class="pcos-preview-note"')) html = html.replace('<div style="max-width:860px;margin:0 auto">', '<div style="max-width:860px;margin:0 auto">' + nl + '        ' + preview);
  const note = '<p class="pcos-learning-note" style="padding:16px;border-right:3px solid var(--accent);background:var(--bg);border-radius:8px;margin-bottom:24px">الكورس للتثقيف الصحي، ولا يتضمن تشخيصاً أو وصفة علاجية شخصية. ناقشي الأدوية والمكملات وخطة المتابعة مع طبيبك.</p>';
  if (!html.includes('class="pcos-learning-note"')) html = html.replace(/(<p class="section-desc">[\s\S]*?<\/p>)/, '$1' + nl + '        ' + note);
  if (!html.includes('class="pcos-price-note"')) html = html.replace('<div class="price-label">دورة متخصصة</div>', '<div class="price-label">دورة متخصصة</div>' + nl + '            <p class="pcos-price-note" style="font-size:.82rem;color:var(--text-light);margin-top:8px">السعر بالدولار الأمريكي. تظهر أي ضرائب واجبة في صفحة الدفع.</p>');
  html = html.replace('<meta property="og:image" content="https://ruladiet.com/images/ruladiet1.webp">', '<meta property="og:image" content="https://ruladiet.com/images/responsive/course-pcos-1200.webp">');
  html = html.replace(/<button\b[^>]*class="btn btn-primary nav-cta"[^>]*>اشترِ الآن<\/button>/, '<a href="https://course.ruladiet.com/25bf7823" class="btn btn-primary nav-cta">اشترِ الآن</a>');
  if (!html.includes('src="/js/campaign-source.js"')) html = html.replace('</body>', '<script src="/js/campaign-source.js" defer></script></body>');
  return html;
});
for (const file of ['index.html', 'الدورات.html']) update(file, html => html.replace(/<a\b[^>]*href="\/course\/تكيس-المبايض"[^>]*>[\s\S]*?<\/a>/g, card => card.replace(/<span class="course-duration">[^<]*<\/span>/, `<span class="course-duration">${count} درساً مسجّلاً</span>`).replace('وكيف تحسّن صحتك وخصوبتك.', 'وموضوعات التغذية والوزن والحمل.')));
console.log(`PCOS: ${count} lessons in ${data.modules.length} modules; introductory preview separate.`);
