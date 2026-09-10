/* Preserve the approved ad's source on its direct checkout links.
 * No cookies, storage, identifiers, analytics requests or Meta events.
 * This is a URL handoff, not proof of a purchase or attribution across visits.
 */
(function () {
  'use strict';
  const campaign = {
    utm_source: 'meta',
    utm_medium: 'paid_social',
    utm_campaign: 'rd_pcos_us_202609',
    utm_content: 'rula_intro'
  };
  const incoming = new URLSearchParams(window.location.search);
  const keys = Object.keys(campaign);
  // Only fixed, approved values may cross into the course platform.
  if (!keys.every(key => incoming.getAll(key).length === 1 && incoming.get(key) === campaign[key])) return;
  let pathname;
  try { pathname = decodeURIComponent(window.location.pathname); } catch (_) { return; }
  if (pathname.replace(/\.html$/, '') !== '/course/تكيس-المبايض') return;

  document.querySelectorAll('a[href]').forEach(link => {
    let destination;
    try { destination = new URL(link.getAttribute('href'), window.location.href); } catch (_) { return; }
    if (destination.origin !== 'https://course.ruladiet.com' || destination.pathname !== '/25bf7823') return;
    // Respect any source deliberately configured on the destination itself.
    if (keys.some(key => destination.searchParams.has(key))) return;
    keys.forEach(key => destination.searchParams.set(key, campaign[key]));
    link.setAttribute('href', destination.href);
  });
})();
