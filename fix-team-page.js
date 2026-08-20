const fs = require('fs');
const dir = 'C:/Users/moham/ruladiet-site';
const files = fs.readdirSync(dir);

const target = files.find(f => f.endsWith('.html') && f.startsWith('ال') && f.includes('فريق'));
console.log('Fixing:', target);

// Read index for header/footer
const indexContent = fs.readFileSync(dir + '/index.html', 'utf8');
const headerEnd = indexContent.indexOf('</header>');
const footerStart = indexContent.indexOf('<footer');

const header = indexContent.substring(0, headerEnd + 9);
const footer = indexContent.substring(footerStart);

// Build body with Arabic content
// Arabic: فريقنا
const badgeText = '\u0641\u0631\u064A\u0642\u0646\u0627';
// Arabic: خبراء في صحتك ورشاقتك
const heroTitle = '\u062E\u0628\u0631\u0627\u0621 \u0641\u064A \u0635\u062D\u062A\u0643 \u0648\u0631\u0634\u0627\u0642\u062A\u0643';
// Arabic: نخبة من المتخصصين في التغذية والحميات يعملون معاً لتحقيق أهدافك الصحية
const heroDesc = '\u0646\u062E\u0628\u0629 \u0645\u0646 \u0627\u0644\u0645\u062A\u062E\u0635\u0635\u064A\u0646 \u0641\u064A \u0627\u0644\u062A\u063A\u0630\u064A\u0629 \u0648\u0627\u0644\u062D\u0645\u064A\u0627\u062A \u064A\u0639\u0645\u0644\u0648\u0646 \u0645\u0639\u064B\u0627 \u0644\u062A\u062D\u0642\u064A\u0642 \u0623\u0647\u062F\u0627\u0641\u0643 \u0627\u0644\u0635\u062D\u064A\u0629';
// Arabic: المؤسسة
const founderBadge = '\u0627\u0644\u0645\u0624\u0633\u0633\u0629';
// Arabic: رولا علوش
const rulaName = '\u0631\u0648\u0644\u0627 \u0639\u0644\u0648\u0634';
// Arabic: اختصاصية التغذية والحميات
const rulaRole = '\u0627\u062E\u062A\u0635\u0627\u0635\u064A\u0629 \u0627\u0644\u062A\u063A\u0630\u064A\u0629 \u0648\u0627\u0644\u062D\u0645\u064A\u0627\u062A';
// Arabic: رولا تحمل شهادة البكالوريوس في هندسة التغذية من جامعة Istanbul Aydin...
const rulaText = '\u062A\u062D\u0645\u0644 \u0631\u0648\u0644\u0627 \u0634\u0647\u0627\u062F\u0629 \u0627\u0644\u0628\u0643\u0627\u0644\u0648\u0631\u064A\u0648\u0633 \u0641\u064A \u0647\u0646\u062F\u0633\u0629 \u0627\u0644\u062A\u063A\u0630\u064A\u0629 \u0645\u0646 \u062C\u0627\u0645\u0639\u0629 Istanbul Aydin \u0648\u0628\u0643\u0627\u0644\u0648\u0631\u064A\u0648\u0633 \u0627\u0644\u062A\u063A\u0630\u064A\u0629 \u0648\u0627\u0644\u062D\u0645\u064A\u0627\u062A \u0645\u0646 \u062C\u0627\u0645\u0639\u0629 Sabahattin Zaim \u0648\u0645\u0627\u0633\u062A\u0631 \u0641\u064A \u062A\u063A\u0630\u064A\u0629 \u0627\u0644\u0637\u0639\u0627\u0645 \u0645\u0646 \u0646\u0641\u0633 \u0627\u0644\u062C\u0627\u0645\u0639\u0629. \u062A\u062F\u064A\u0631 \u0639\u064A\u0627\u062F\u062A\u0647\u0627 \u0641\u064A \u0627\u0633\u0637\u0646\u0628\u0648\u0644 \u0648\u0644\u0647\u0627 \u0623\u0643\u062B\u0631 \u0645\u0646 140 \u0623\u0644\u0641 \u0645\u062A\u0627\u0628\u0639 \u0639\u0644\u0649 \u0645\u0646\u0635\u0627\u062A \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A.';

const body = `<main><section class="team-hero"><div class="container"><div class="team-hero-content"><span class="team-hero-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>${badgeText}</span><h1 class="team-hero-title">${heroTitle}</h1><p class="team-hero-desc">${heroDesc}</p><div class="team-divider"></div></div></div></section><section class="team-section"><div class="container"><div class="rula-feature"><div class="rula-image-wrapper"><img src="/images/rula-team.webp" alt="${rulaName}" width="400" height="600"><span class="rula-badge">${founderBadge}</span></div><div class="rula-info"><h2>${rulaName}</h2><p class="rula-role">${rulaRole}</p><p class="rula-text">${rulaText}</p><div class="rula-credentials"><span class="rula-credential"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M14 8v4l-2-1-2 1V8"/></svg>\u0628\u0643\u0627\u0644\u0648\u0631\u064A\u0648\u0633 \u0647\u0646\u062F\u0633\u0629 \u063A\u0630\u0627\u0626\u064A\u0629</span><span class="rula-credential"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/></svg>\u0628\u0643\u0627\u0644\u0648\u0631\u064A\u0648\u0633 \u062A\u063A\u0630\u064A\u0629 \u0648\u062D\u0645\u064A\u0627\u062A</span><span class="rula-credential"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>\u0645\u0627\u0633\u062A\u0631 \u062A\u063A\u0630\u064A\u0629 \u0627\u0644\u0637\u0639\u0627\u0645</span><span class="rula-credential"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>+140K \u0645\u062A\u0627\u0628\u0639</span></div></div></div><div class="team-grid-new"><div class="team-member-card"><div class="team-avatar"><img src="/images/yasmin-team.webp" alt="\u064A\u0627\u0633\u0645\u064A\u0646 \u0633\u0639\u062F\u0627\u062A" width="300" height="400"></div><h3 class="member-name">\u064A\u0627\u0633\u0645\u064A\u0646 \u0633\u0639\u062F\u0627\u062A</h3><p class="member-role">\u0627\u062E\u062A\u0635\u0627\u0635\u064A\u0629 \u062A\u063A\u0630\u064A\u0629</p><p class="member-bio">\u0645\u062A\u062E\u0635\u0635\u0629 \u0641\u064A \u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0633\u0644\u0648\u0643 \u0627\u0644\u063A\u0630\u0627\u0626\u064A \u0648\u0639\u0644\u0627\u062C \u0627\u0644\u0633\u0645\u0646\u0629</p></div><div class="team-member-card"><div class="team-avatar"><img src="/images/menna-team.webp" alt="\u0645\u0646\u0627 \u0627\u0644\u0644\u0647" width="300" height="400"></div><h3 class="member-name">\u0645\u0646\u0627 \u0627\u0644\u0644\u0647</h3><p class="member-role">\u0623\u062E\u0635\u0627\u0626\u064A\u0629 \u062A\u063A\u0630\u064A\u0629 \u0639\u0644\u0627\u062C\u064A\u0629</p><p class="member-bio">\u062E\u0628\u0631\u0629 \u0641\u064A \u0627\u0644\u062A\u063A\u0630\u064A\u0629 \u0627\u0644\u0639\u0644\u0627\u062C\u064A\u0629 \u0648\u0625\u0639\u062F\u0627\u062F \u0627\u0644\u062D\u0645\u064A\u0627\u062A</p></div><div class="team-member-card"><div class="team-avatar"><img src="/images/abeer-team.webp" alt="\u0639\u0628\u064A\u0631 \u0639\u0627\u0645\u0631" width="300" height="400"></div><h3 class="member-name">\u0639\u0628\u064A\u0631 \u0639\u0627\u0645\u0631</h3><p class="member-role">\u0627\u062E\u062A\u0635\u0627\u0635\u064A\u0629</p><p class="member-bio">\u0645\u062A\u062E\u0635\u0635\u0629 \u0641\u064A \u0625\u0646\u0642\u0627\u0635 \u0627\u0644\u0648\u0632\u0646 \u0648\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0639\u0627\u062F\u0627\u062A \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629</p></div><div class="team-member-card"><div class="team-avatar"><img src="/images/shahd-team.webp" alt="\u0634\u0647\u062F \u0639\u0648\u0636" width="300" height="400"></div><h3 class="member-name">\u0634\u0647\u062F \u0639\u0648\u0636</h3><p class="member-role">\u0623\u062E\u0635\u0627\u0626\u064A\u0629 \u062A\u063A\u0630\u064A\u0629</p><p class="member-bio">\u062E\u0628\u0631\u0629 \u0641\u064A \u0627\u0644\u062A\u063A\u0630\u064A\u0629 \u0627\u0644\u0639\u0644\u0627\u062C\u064A\u0629 \u0648\u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0629</p></div><div class="team-member-card"><div class="team-avatar"><img src="/images/3-350x700.webp" alt="\u062F. \u0623\u062D\u0645\u062F \u0641\u062A\u062D\u064A" title="\u062F. \u0623\u062D\u0645\u062F \u0641\u062A\u062D\u064A" width="350" height="700" loading="lazy"></div><h3 class="member-name">\u062F. \u0623\u062D\u0645\u062F \u0641\u062A\u062D\u064A</h3><p class="member-role">\u0623\u062E\u0635\u0627\u0626\u064A \u062A\u063A\u0630\u064A\u0629</p><p class="member-bio">\u0645\u062A\u062E\u0635\u0635 \u0641\u064A \u0627\u0644\u062A\u063A\u0630\u064A\u0629 \u0627\u0644\u0625\u0643\u0644\u064A\u0646\u064A\u0643\u064A\u0629 \u0648\u0639\u0644\u0627\u062C \u0627\u0644\u0633\u0645\u0646\u0629</p></div></div></div></section><section class="team-cta"><div class="container"><div class="cta-card"><h2 class="cta-title">\u0645\u0633\u062A\u0639\u062F \u0644\u0644\u0628\u062F\u0621\u061F</h2><p class="cta-text">\u0627\u062D\u062C\u0632 \u0627\u0633\u062A\u0634\u0627\u0631\u062A\u0643 \u0627\u0644\u0622\u0646 \u0648\u0627\u0628\u062F\u0623 \u0631\u062D\u0644\u062A\u0643 \u0646\u062D\u0648 \u062D\u064A\u0627\u0629 \u0635\u062D\u064A\u0629</p><a href="https://wa.me/905300222468?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1" class="btn btn-primary btn-lg" target="_blank" rel="noopener">\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627</a></div></div></section></main>`;

// Fix the header metadata
const teamTitle = '\u0627\u0644\u0641\u0631\u064A\u0642 - \u0631\u0648\u0644\u0627 \u062F\u0627\u064A\u062A | \u0627\u062E\u062A\u0635\u0627\u0635\u064A\u0629 \u0627\u0644\u062A\u063A\u0630\u064A\u0629 \u0631\u0648\u0644\u0627 \u0639\u0644\u0648\u0634 - \u0627\u0633\u0637\u0646\u0628\u0648\u0644';
const teamDesc = '\u062A\u0639\u0631\u0641 \u0639\u0644\u0649 \u0641\u0631\u064A\u0642 \u0631\u0648\u0644\u0627 \u062F\u0627\u064A\u062A - \u0623\u062E\u0635\u0627\u0626\u064A\u064A \u0627\u0644\u062A\u063A\u0630\u064A\u0629 \u0648\u0627\u0644\u062D\u0645\u064A\u0627\u062A \u0641\u064A \u0639\u064A\u0627\u062F\u0629 \u0631\u0648\u0644\u0627 \u062F\u0627\u064A\u062A - \u0627\u0633\u0637\u0646\u0628\u0648\u0644';
const ogTitle = '\u0627\u0644\u0641\u0631\u064A\u0642 - \u0631\u0648\u0644\u0627 \u062F\u0627\u064A\u062A';
const ogDesc = '\u0641\u0631\u064A\u0642 \u0631\u0648\u0644\u0627 \u062F\u0627\u064A\u062A - \u0623\u062E\u0635\u0627\u0626\u064A\u064A \u0627\u0644\u062A\u063A\u0630\u064A\u0629 \u0641\u064A \u0627\u0633\u0637\u0646\u0628\u0648\u0644';
const pageUrl = 'https://ruladiet.com/' + encodeURIComponent('\u0627\u0644\u0641\u0631\u064A\u0642');

let fixedHeader = header
  .replace(/<title>.*?<\/title>/, `<title>${teamTitle}</title>`)
  .replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${teamDesc}"`
  )
  .replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${ogTitle}"`
  )
  .replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${ogDesc}"`
  )
  .replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${pageUrl}"`
  )
  .replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${pageUrl}"`
  );

// Fix the active state on the nav link for this page
const navTeam = '\u0627\u0644\u0641\u0631\u064A\u0642';
fixedHeader = fixedHeader.replace(
  new RegExp(`<a href="${navTeam}" class="nav-link"`),
  `<a href="${navTeam}" class="nav-link active"`
);

// Build final HTML
const fixedHtml = fixedHeader + body + footer;

// Write it
fs.writeFileSync(dir + '/' + target, fixedHtml, 'utf8');

// Verify
const verify = fs.readFileSync(dir + '/' + target, 'utf8');
let arabicChars = 0;
for (let i = 0; i < verify.length; i++) {
  if (verify.charCodeAt(i) >= 0x0600 && verify.charCodeAt(i) <= 0x06FF) arabicChars++;
}
console.log('Done! Arabic chars:', arabicChars, '| Size:', verify.length, 'bytes');
