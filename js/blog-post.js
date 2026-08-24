(function () {
  'use strict';
  var BLOG_POSTS = [
    { slug: 'نظام-غذائي-مع-مونجارو', title: 'نظام غذائي مع مونجارو', img: '/images/blog-mounjaro-diet-cover.webp', date: '2026-08-20' },
    { slug: 'مونجارو', title: 'مونجارو للتنحيف: الدليل الشامل', img: '/images/blog-mounjaro-diet-cover.webp', date: '2026-07-19' },
    { slug: 'الأكل-العاطفي', title: 'الأكل العاطفي', img: '/images/blog-emotional-eating.webp', date: '2026-05-31' },
    { slug: 'خسارة-الوزن', title: 'خسارة الوزن', img: '/images/blog-weight-loss.webp', date: '2026-05-31' },
    { slug: 'مقاومة-الأنسولين', title: 'مقاومة الأنسولين', img: '/images/blog-insulin-resistance.webp', date: '2026-05-31' },
    { slug: 'ابر-التنحيف-الحديثة', title: 'إبر التنحيف الحديثة', img: '/images/webpc-passthru-2-500x300.webp', date: '2026-05-11' },
    { slug: 'رمضان-بلا-سكر', title: 'رمضان بلا سكر', img: '/images/webpc-passthru-1-500x300.webp', date: '2025-05-13' },
    { slug: 'المهمة-الممكنة-للعام-الجديد', title: 'المهمة الممكنة للعام الجديد', img: '/images/webpc-passthru-500x300.webp', date: '2025-05-13' },
    { slug: 'المهمة-المستحيلة-للأمهات', title: 'المهمة المستحيلة للأمهات', img: '/images/webpc-passthru-500x300.webp', date: '2025-05-13' }
  ];
  var COURSES = [
    { href: '../course/الأكل-العاطفي.html', img: '../images/course1.webp', alt: 'كورس التعافي من الشهية الانفعالية', title: 'كورس التعافي من الشهية الانفعالية', badge: 'عرض التفاصيل' },
    { href: '../course/رحلة-التغيير.html', img: '../images/course-rehla.webp', alt: 'كورس رحلة التغيير', title: 'كورس رحلة التغيير', badge: 'مجاني' },
    { href: '../course/المسار-الصحي.html', img: '../images/course-massar.webp', alt: 'كورس المسار الصحي', title: 'كورس المسار الصحي', badge: 'عرض التفاصيل' },
    { href: '../course/تكيس-المبايض.html', img: '../images/course-pcos.webp', alt: 'كورس التعافي من تكيس المبايض', title: 'كورس التعافي من تكيس المبايض', badge: 'عرض التفاصيل' }
  ];

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function currentSlug() {
    var p = decodeURIComponent(location.pathname.replace(/\/$/, ''));
    return p.slice(p.lastIndexOf('/') + 1).replace(/\.html$/, '');
  }

  function slugify(text, used) {
    var s = text.trim().replace(/[^\w\s\u0600-\u06FF]/g, '').replace(/\s+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
    if (!s || s.length < 2) s = 'section';
    if (/^[^A-Za-z\u0621-\u064A_]/.test(s)) s = 'sec-' + s;
    var base = s, i = 2;
    while (used[s]) s = base + '-' + i++;
    used[s] = true;
    return s;
  }

  function buildSidebar() {
    var aside = document.querySelector('.post-sidebar');
    var layout = document.querySelector('.post-layout');
    if (!aside && layout) {
      aside = el('aside', 'post-sidebar');
      layout.appendChild(aside);
    }
    if (!aside) return;

    aside.appendChild(el('div', 'sidebar-widget sidebar-author',
      '<div class="sidebar-author-img"><img src="../images/rulamain.webp" alt="رولا علوش" title="رولا علوش - اختصاصية التغذية" width="130" height="130" loading="lazy"></div>' +
      '<h4>رولا علوش</h4><p>اختصاصية التغذية والحمية العلاجية. أشاركك نصائح علمية لصحة أفضل.</p>'));

    var content = document.querySelector('.post-content');
    if (content) {
      var headings = content.querySelectorAll('h2, h3');
      var tocCard = el('div', 'sidebar-widget sidebar-toc');
      tocCard.id = 'sidebarToc';
      tocCard.appendChild(el('h3', null, 'محتويات المقال'));
      var ul = el('ul', 'toc-list');
      ul.id = 'tocList';
      var used = {};
      headings.forEach(function (h) {
        if (!h.id) h.id = slugify(h.textContent, used);
        var li = el('li');
        var a = el('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent.trim();
        if (h.tagName === 'H3') a.className = 'toc-h3';
        li.appendChild(a);
        ul.appendChild(li);
      });
      if (ul.children.length) {
        tocCard.appendChild(ul);
        aside.appendChild(tocCard);
      }
    }

    var cur = currentSlug();
    var latest = el('div', 'sidebar-widget sidebar-latest');
    latest.appendChild(el('h3', null, 'أحدث المقالات'));
    var lul = el('ul');
    BLOG_POSTS.filter(function (p) { return p.slug !== cur; }).slice(0, 6).forEach(function (p) {
      var li = el('li');
      var a = el('a');
      a.href = '../blog/' + encodeURIComponent(p.slug);
      a.innerHTML = '<div class="latest-img"><img src="' + p.img + '" alt="' + p.title + '" title="' + p.title + '" width="80" height="80" loading="lazy"></div><h4>' + p.title + '</h4>';
      li.appendChild(a);
      lul.appendChild(li);
    });
    latest.appendChild(lul);
    aside.appendChild(latest);
  }

  function buildShare() {
    var box = document.querySelector('.post-share');
    if (!box) {
      var content = document.querySelector('.post-content');
      if (!content) return;
      box = el('div', 'post-share');
      var cta = content.querySelector('.post-cta');
      if (cta && cta.parentNode === content) cta.after(box); else content.appendChild(box);
    }
    var url = location.origin === 'null' ? '' : location.origin;
    var canon = document.querySelector('link[rel="canonical"]');
    if (canon) url = canon.href;
    var metaTitle = document.querySelector('meta[property="og:title"]');
    var title = (metaTitle && metaTitle.content) || (document.querySelector('h1') || {}).textContent || document.title;
    var wa = 'https://wa.me/?text=' + encodeURIComponent(title + ' - ' + url);
    var fb = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
    box.innerHTML = '<span>مشاركة المقال:</span>' +
      '<a href="' + wa + '" target="_blank" rel="noopener" aria-label="مشاركة عبر واتساب"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></a>' +
      '<a href="' + fb + '" target="_blank" rel="noopener" aria-label="مشاركة عبر فيسبوك"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg></a>';
  }

  function buildCourses() {
    var content = document.querySelector('.post-content');
    if (!content || content.querySelector('.post-courses-widget')) return;
    var w = el('div', 'post-courses-widget');
    w.appendChild(el('h2', null, 'دوراتنا المقترحة'));
    w.appendChild(el('p', null, 'برامج تغذوية متخصصة تناسب احتياجك'));
    var grid = el('div', 'post-courses-grid');
    COURSES.forEach(function (c) {
      var a = el('a', 'post-course-card');
      a.href = c.href;
      a.innerHTML = '<div class="course-image"><img src="' + c.img + '" alt="' + c.alt + '" width="400" height="270" loading="lazy"></div><div class="post-course-info"><h3>' + c.title + '</h3><span>' + c.badge + '</span></div>';
      grid.appendChild(a);
    });
    var wa = el('a', 'post-course-card');
    wa.href = 'https://wa.me/905300222468';
    wa.target = '_blank';
    wa.rel = 'noopener';
    wa.style.borderColor = 'var(--primary)';
    wa.innerHTML = '<div class="post-course-info" style="background:var(--bg-alt);padding:32px 20px;text-align:center"><h3>استشارة تغذية فردية</h3><span>تواصل عبر واتساب</span></div>';
    grid.appendChild(wa);
    w.appendChild(grid);
    content.appendChild(w);
  }

  function wrapTables() {
    document.querySelectorAll('.post-content > table').forEach(function (t) {
      if (t.parentElement.classList.contains('table-scroll')) return;
      var w = el('div', 'table-scroll');
      t.parentNode.insertBefore(w, t);
      w.appendChild(t);
    });
  }

  function bindMenu() {
    var btn = document.getElementById('menuToggle');
    var nav = document.getElementById('nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', function () {
      nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!document.querySelector('.blog-post-page')) return;
    wrapTables();
    buildSidebar();
    buildShare();
    buildCourses();
    bindMenu();
  });
})();
