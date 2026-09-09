/* Shared homepage navigation for the Systeme.io purchase and confirmation pages.
 * Install through each page's custom header editor. No checkout/form behavior changes.
 */
(function () {
  'use strict';
  if (!['course.ruladiet.com', 'ruladiet.systeme.io'].includes(window.location.hostname)) return;
  function mount() {
    if (document.getElementById('rula-course-brand-header')) return;
    const style = document.createElement('style');
    style.textContent = '#rula-course-brand-header{background:#fff;border-bottom:1px solid #d4e3d9;direction:rtl;font-family:Tajawal,sans-serif;position:relative;z-index:1}' +
      '#rula-course-brand-header .rula-brand-inner{max-width:1200px;margin:0 auto;padding:8px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px}' +
      '#rula-course-brand-header a{display:inline-flex;align-items:center;gap:12px;color:#2d5240;text-decoration:none;font-weight:800}' +
      '#rula-course-brand-header img{display:block;width:100px;height:80px;object-fit:contain;filter:brightness(.52) contrast(1.12)}' +
      '#rula-course-brand-header .rula-brand-name{font-size:21px;white-space:nowrap}' +
      '#rula-course-brand-header .rula-brand-back{font-size:15px;text-decoration:underline;text-underline-offset:4px;font-weight:500}' +
      '#rula-course-brand-header a:focus-visible{outline:3px solid #c8a97e;outline-offset:4px;border-radius:8px}' +
      '@media(max-width:480px){#rula-course-brand-header .rula-brand-inner{padding:6px 16px;gap:10px}#rula-course-brand-header img{width:81px;height:64px}#rula-course-brand-header .rula-brand-name{font-size:18px}#rula-course-brand-header .rula-brand-back{font-size:13px}}';
    document.head.appendChild(style);
    const header = document.createElement('header');
    header.id = 'rula-course-brand-header';
    const inner = document.createElement('div');
    inner.className = 'rula-brand-inner';
    const home = document.createElement('a');
    home.href = 'https://ruladiet.com/';
    home.setAttribute('aria-label', 'رولا دايت - الصفحة الرئيسية');
    const logo = document.createElement('img');
    logo.src = 'https://ruladiet.com/images/responsive/RULA-DIET-LOGO-384.webp';
    logo.alt = 'رولا دايت';
    logo.width = 100;
    logo.height = 80;
    const name = document.createElement('span');
    name.className = 'rula-brand-name';
    name.textContent = 'رولا دايت';
    home.append(logo, name);
    const back = document.createElement('a');
    back.href = home.href;
    back.className = 'rula-brand-back';
    back.textContent = 'العودة إلى الرئيسية';
    inner.append(home, back);
    header.appendChild(inner);
    // Keep this independent of Systeme.io's React-managed page/form tree.
    document.body.prepend(header);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
