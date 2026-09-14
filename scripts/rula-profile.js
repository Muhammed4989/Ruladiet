const fs = require('node:fs');
const {root, write} = require('./blog-html');
const {escape: e} = require('./blog-visuals');
const profile = require('../content/author-rula.json');
const proof = profile.publicEvidence;
const stylesheet = '<link rel="stylesheet" href="/css/rula-profile.css">';
const dateLabel = day => new Intl.DateTimeFormat('ar-u-nu-latn', {day:'numeric', month:'long', year:'numeric', timeZone:'UTC'}).format(new Date(day+'T12:00:00Z'));

function proofCards() {
  return `<div class="rula-proof" aria-label="رولا وعيادتها بالأرقام"><div class="rula-proof-grid"><div class="rula-proof-card"><strong>${proof.practiceStart.year}</strong><span>بداية العمل في إسطنبول</span></div><a class="rula-proof-card" href="${e(proof.google.url)}" target="_blank" rel="noopener noreferrer"><strong dir="ltr">${proof.google.rating} / 5</strong><span>من ${proof.google.reviewCount} تقييماً على Google</span><small>اقرئي التقييمات ↗</small></a><a class="rula-proof-card" href="${e(proof.instagram.url)}" target="_blank" rel="noopener noreferrer"><strong>${e(proof.instagram.arabicCount)}</strong><span>متابع على إنستغرام تقريباً</span><small>زوري حساب رولا ↗</small></a></div><p class="rula-proof-date">أرقام Google وإنستغرام كما ظهرت في <time datetime="${proof.checkedAt}">${dateLabel(proof.checkedAt)}</time>، وقد تتغير مع الوقت.</p></div>`;
}

function addStylesheet(html) {
  return html.includes(stylesheet) ? html : html.replace('</head>', stylesheet+'</head>');
}

function syncProfilePages() {
  let home = fs.readFileSync(root+'/index.html', 'utf8');
  // Repair the legacy duplicated section opener while replacing only the about block.
  home = home.replace('<section class="<section class="about-section"', '<section class="about-section"');
  const about = /<section\b[^>]*class="about-section"[^>]*>[\s\S]*?<\/section>/;
  if (!about.test(home)) throw new Error('Homepage about section missing');
  home = home.replace(about, `<section class="about-section" id="about"><div class="container"><div class="rula-home-about"><span class="section-badge">تعرّفي على رولا</span><h2 class="section-title">من هي رولا علوش؟</h2><div class="rula-home-intro"><img src="/images/responsive/rulamain-400.webp" srcset="/images/responsive/rulamain-200.webp 200w, /images/responsive/rulamain-400.webp 400w, /images/responsive/rulamain-600.webp 600w" sizes="(max-width:600px) 180px, 220px" alt="رولا علوش، اختصاصية التغذية ومؤسسة رولا دايت في إسطنبول" width="400" height="600" loading="lazy"><div><h3>اختصاصية تغذية عربية في إسطنبول منذ ${proof.practiceStart.year}</h3><p>${e(profile.introduction)}</p><p>حاصلة على <strong>ماجستير في التغذية والحميات من جامعة صباح الدين زعيم</strong>، وبكالوريوس التغذية والحميات من الجامعة نفسها، وبكالوريوس الهندسة الغذائية من جامعة إسطنبول أيدن.</p><p>تكتب في رولا دايت، ولها مقالات منشورة في الجزيرة نت وعربي بوست. <a href="${profile.path}#published-work">تعرّفي على كتاباتها المنشورة</a>.</p></div></div>${proofCards()}<div class="rula-profile-actions"><a href="/رولا-علوش" class="btn btn-outline">تعرّفي على رولا ومؤهلاتها</a><a href="/احجز-موعد" class="btn btn-primary">احجزي استشارة تغذية</a></div></div></div></section>`);
  home = home.replace(/<span class="stat-number">[^<]*<\/span><span class="stat-label">متابع على انستغرام(?: تقريباً)?<\/span>/, `<span class="stat-number">${proof.instagram.displayCount}</span><span class="stat-label">متابع على انستغرام تقريباً</span>`);
  write('index.html', addStylesheet(home));

  let bio = fs.readFileSync(root+'/رولا-علوش.html','utf8');
  const title = 'من هي رولا علوش؟ اختصاصية تغذية عربية في إسطنبول | رولا دايت';
  const description = `تعرّفي على رولا علوش، اختصاصية تغذية عربية تعمل في إسطنبول منذ ${proof.practiceStart.year}، مؤهلاتها من جامعة صباح الدين زعيم، تقييمات عيادة رولا دايت وطريقة حجز استشارة.`;
  bio = bio.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${title}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${description}">`)
    .replace(/<h1>[\s\S]*?<\/h1>/, '<h1>من هي رولا علوش؟</h1>')
    .replace(/<p class="title">[\s\S]*?<\/p>/, '<p class="title">اختصاصية تغذية عربية ومؤسسة عيادة رولا دايت في إسطنبول</p>')
    .replace(/\+7 سنوات خبرة/g, `في إسطنبول منذ ${proof.practiceStart.year}`)
    .replace(/\+(?:140|142)K متابع|نحو 142 ألف متابع/g, `نحو ${proof.instagram.arabicCount} متابع`)
    .replace(/\+4000 عميل|4\.9 \/ 5 على Google/g, `<bdi>${proof.google.rating} / 5</bdi> على Google`)
    .replace('بكالوريوس تغذية وحميات علاجية', 'بكالوريوس التغذية والحميات');
  const aboutBio = /<h2>(?:نبذة عني|من هي رولا علوش؟)<\/h2>[\s\S]*?(?=<h2>المؤهلات العلمية<\/h2>)/;
  if (!aboutBio.test(bio)) throw new Error('CV introduction missing');
  bio = bio.replace(aboutBio, `<h2>من هي رولا علوش؟</h2><p>${e(profile.introduction)}</p><p>هدف رولا هو تقريب التغذية من حياتك اليومية، ومساعدتك على فهم علاقتك بالطعام وبناء عادات تناسب ظروفك. تقدّم محتوى توعوياً باللغة العربية عبر مقالاتها ودوراتها وحساباتها، إلى جانب الاستشارات الغذائية.</p><p>لها كتابات منشورة في <a href="${e(profile.publications[0].url)}" target="_blank" rel="noopener noreferrer">الجزيرة نت</a> و<a href="${e(profile.publications[1].url)}" target="_blank" rel="noopener noreferrer">عربي بوست</a>. يمكنك قراءة <a href="${profile.path}#published-work">مقالاتها الأصلية لدى الناشرين</a> والتعرّف على منهج المحتوى في رولا دايت.</p>${proofCards()}<h2>عيادة رولا دايت في باشاك شهير</h2><p>تستقبل العيادة المراجعين في باشاك شهير، إسطنبول، وتتوفر الاستشارات أونلاين أيضاً. ابدئي من <a href="/احجز-موعد">صفحة حجز استشارة التغذية</a> للاستفسار عن الخدمة المناسبة والمواعيد المتاحة، أو تعرّفي على <a href="/الفريق">فريق رولا دايت</a>.</p><p class="rula-profile-address" dir="ltr">Kayabaşı, Adnan Menderes Bulvarı, Emlak Konut Kuzey Yakası A2 Blok No:3<br>34494 Başakşehir/İstanbul</p><p><a href="${e(proof.google.url)}" target="_blank" rel="noopener noreferrer">موقع عيادة رولا دايت على خرائط Google ↗</a></p><div class="rula-profile-actions"><a class="btn btn-primary" href="/احجز-موعد">احجزي استشارة مع رولا دايت</a></div>`);
  bio = bio.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (all, json) => {
    const data = JSON.parse(json);
    if (data['@type'] !== 'Person') return all;
    data.description = profile.introduction;
    data.jobTitle = 'اختصاصية تغذية';
    return '<script type="application/ld+json">'+JSON.stringify(data)+'</script>';
  });
  write('رولا-علوش.html', addStylesheet(bio));
  let sitemap = fs.readFileSync(root+'/sitemap.xml','utf8');
  const changed = new Set(['https://ruladiet.com/', 'https://ruladiet.com/رولا-علوش']);
  sitemap = sitemap.replace(/<url>[\s\S]*?<\/url>/g, entry => {
    const loc = entry.match(/<loc>(.*?)<\/loc>/)?.[1];
    if (!loc || !changed.has(decodeURI(loc))) return entry;
    const existing = entry.match(/<lastmod>(.*?)<\/lastmod>/)?.[1];
    const date = existing && existing > profile.updated ? existing : profile.updated;
    const lastmod = `<lastmod>${date}</lastmod>`;
    return entry.includes('<lastmod>') ? entry.replace(/<lastmod>.*?<\/lastmod>/,lastmod) : entry.replace('</url>',lastmod+'</url>');
  });
  write('sitemap.xml',sitemap);
}

module.exports = {proofCards, syncProfilePages};
