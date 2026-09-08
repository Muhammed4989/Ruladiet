/*!
 * footer-map.js — Google Business Profile map for the Rula Diet footer.
 *
 * Single source of truth for the footer map across every page of the site.
 * Injects its own CSS, so it works on pages using css/style.css as well as
 * the course pages that carry their own inline footer styles.
 *
 * PLACE_ID points at the Google Business Profile listing rather than fixed
 * coordinates. When the clinic address changes in the Business Profile, this
 * map re-pins itself with no code change.
 *
 * Uses the Maps Embed API (place mode): free, unlimited requests, API key
 * required. https://developers.google.com/maps/documentation/embed/usage-and-billing
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * CONFIG
   *
   * Two ways to render the map. The keyless one is active by default, so
   * the footer works with no Google Cloud setup at all.
   *
   *  1. KEYLESS (default) — Google Maps' own "Share > Embed a map" iframe.
   *     No API key, no billing, no quota. Downside: the pb string below
   *     encodes fixed coordinates, so if the clinic moves you must
   *     regenerate it (Google Maps > the listing > Share > Embed a map).
   *
   *  2. EMBED API — set API_KEY below and it is used instead. Keyed on the
   *     Place ID, so it follows the Google Business Profile automatically:
   *     change the address in the profile and this map re-pins itself with
   *     no code change. Free with unlimited requests, key required.
   *     Restrict the key to referrers ruladiet.com/* and *.ruladiet.com/*
   *     and to the Maps Embed API only.
   * ------------------------------------------------------------------ */
  var API_KEY  = '';                                    // leave empty to stay keyless
  var PLACE_ID = 'ChIJPxfeU-unyhQRyIYSaHZkkoA';
  var ZOOM     = 16;

  // Keyless embed for the Rula Diet clinic listing, Arabic labels.
  var KEYLESS_SRC = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3005.7856720517916' +
    '!2d28.7746752!3d41.1173717!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2' +
    '!1s0x14caa7eb53de173f%3A0x80926476681286c8' +
    '!2z2KfYrtiq2LXYp9i12YrYqSDYp9mE2KrYutiw2YrYqSDYsdmI2YTYpyDYudmE2YjYtC0g2LnZitin2K_YqSDYqti62LDZitipIC8gUnVsYSBEaWV0IGNsaW5pYw' +
    '!5e0!3m2!1sar!2str!5m2!1sar!2str';

  var MAPS_URL = 'https://www.google.com/maps/place/?q=place_id:' + PLACE_ID;
  var DIR_URL  = 'https://www.google.com/maps/dir/?api=1&destination_place_id=' +
                 PLACE_ID + '&destination=' + encodeURIComponent('Rula Diet clinic');

  function mapSrc() {
    if (API_KEY && API_KEY.indexOf('YOUR_') !== 0) {
      return 'https://www.google.com/maps/embed/v1/place' +
             '?key=' + encodeURIComponent(API_KEY) +
             '&q=place_id:' + PLACE_ID +
             '&language=ar&region=TR&zoom=' + ZOOM;
    }
    return KEYLESS_SRC;
  }

  /* ---------------------------- styles ------------------------------ */
  var CSS = [
    '.footer-map{text-align:right;direction:rtl}',
    '.footer-map h4{font-size:.85rem;font-weight:700;color:#CBE6C7;margin:0 0 10px;letter-spacing:.5px}',
    '.footer-map-embed{position:relative;width:100%;aspect-ratio:16/11;min-height:150px;',
      'border-radius:12px;overflow:hidden;background:rgba(255,255,255,.06);',
      'border:1px solid rgba(255,255,255,.12);display:flex;align-items:center;',
      'justify-content:center;transition:border-color .25s}',
    '.footer-map-embed:hover{border-color:rgba(200,169,126,.45)}',
    '.footer-map-embed iframe{position:absolute;inset:0;width:100%;height:100%;',
      'border:0;display:block}',
    '.footer-map-fallback{font-size:.8rem;line-height:1.6;color:rgba(255,255,255,.45);',
      'padding:14px;margin:0;text-align:center}',
    '.footer-map-embed.is-loaded .footer-map-fallback{display:none}',
    '.footer-map-actions{display:flex;gap:14px;flex-wrap:wrap;margin-top:10px}',
    '.footer-map-actions a{font-size:.84rem;font-weight:600;color:#C8A97E;',
      'display:inline-flex;align-items:center;gap:5px;transition:color .2s}',
    '.footer-map-actions a:hover{color:#E3CDA8}',
    /* three-column footer on desktop; the existing mobile rule stacks it */
    '@media(min-width:901px){.footer-top{grid-template-columns:minmax(170px,1fr) 1.7fr minmax(215px,1fr)!important}}',
    '@media(max-width:900px){.footer-top{grid-template-columns:1fr!important}',
      '.footer-map{text-align:center}.footer-map-actions{justify-content:center}',
      '.footer-map-embed{max-width:420px;margin:0 auto;aspect-ratio:16/9}}'
  ].join('');

  function injectCSS() {
    if (document.getElementById('footer-map-css')) return;
    var s = document.createElement('style');
    s.id = 'footer-map-css';
    s.appendChild(document.createTextNode(CSS));
    document.head.appendChild(s);           // appended last so it wins over inline page CSS
  }

  /* ---------------------------- markup ------------------------------ */
  function buildBlock() {
    var wrap = document.createElement('div');
    wrap.className = 'footer-map';
    wrap.innerHTML =
      '<h4>موقع العيادة</h4>' +
      '<div class="footer-map-embed" id="footerMapEmbed">' +
        '<p class="footer-map-fallback">' +
          '<a href="' + MAPS_URL + '" target="_blank" rel="noopener" style="color:#C8A97E">' +
            'اعرض موقع العيادة على خرائط جوجل' +
          '</a>' +
        '</p>' +
      '</div>' +
      '<div class="footer-map-actions">' +
        '<a href="' + DIR_URL + '" target="_blank" rel="noopener">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
          '<path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' +
          'الاتجاهات' +
        '</a>' +
        '<a href="' + MAPS_URL + '" target="_blank" rel="noopener">التقييمات على جوجل</a>' +
      '</div>';
    return wrap;
  }

  /* ------------------------- lazy iframe load ------------------------ */
  function loadMap(host) {
    if (host.dataset.loaded) return;
    host.dataset.loaded = '1';

    var f = document.createElement('iframe');
    f.src = mapSrc();
    f.title = 'خريطة موقع عيادة رولا دايت';
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    f.setAttribute('allowfullscreen', '');
    f.addEventListener('load', function () { host.classList.add('is-loaded'); });
    host.appendChild(f);
  }

  function init() {
    var anchor = document.querySelector('.footer .footer-top');
    if (!anchor || anchor.querySelector('.footer-map')) return;

    injectCSS();
    anchor.appendChild(buildBlock());

    var host = document.getElementById('footerMapEmbed');
    if (!host) return;

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) { loadMap(host); io.disconnect(); return; }
        }
      }, { rootMargin: '250px' });
      io.observe(host);
    } else {
      loadMap(host);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
