# AGENTS.md — ruladiet.com

Instructions for AI coding agents working in this repo. Read this before editing anything.

## What this project is

Static HTML site for Rula Diet Clinic (Arabic, RTL), deployed on **Vercel** from the
`master` branch of `github.com/Muhammed4989/Ruladiet`. No framework, no build step for
the site itself — the `.html` files in the repo are what ships.

**There is no shared header/footer template.** The footer markup is duplicated inline in
~30 `.html` files. Any footer change must be applied to all of them, by script, not by
hand-editing one file. `vercel.json` rewrites extensionless URLs to `.html`.

Two footer formats exist in the wild: minified single-line (most pages) and
pretty-printed (the `course/*.html` pages, which also carry their own inline copy of the
footer CSS). Anything touching the footer must handle both.

## Invariants — do not revert these

**1. The clinic address.** The clinic moved in Sept 2026. The correct address, matching
the Google Business Profile exactly, is:

```
Kayabaşı, Adnan Menderes Bulvarı, Emlak Konut Kuzey Yakası A2 Blok No:3
34494 Başakşehir/İstanbul
```

The old address was `Esenkent, Esenkent-Bahçeşehir Yolu, 34510 Esenyurt/İstanbul`.
**If you ever see "Esenkent", "Esenyurt" or "34510" in a file that ships, it is a
regression** — fix it. Name/address/phone must match the Business Profile character for
character; a mismatch costs local search ranking, which is the whole point of this site.

The address is Latin script inside an RTL page, so it carries `dir="ltr"`. Without it the
bidi algorithm renders the postcode at the wrong end ("Başakşehir/İstanbul 34494").
Do not remove `dir="ltr"` from address elements.

**2. The Google Business Profile identifiers.**

| | |
|---|---|
| Place ID | `ChIJPxfeU-unyhQRyIYSaHZkkoA` |
| Hex CID | `0x14caa7eb53de173f:0x80926476681286c8` |
| Coordinates | 41.1173717, 28.7746752 |
| Listing | اختصاصية التغذية رولا علوش- عيادة تغذية / Rula Diet clinic |

**3. The footer map.** `js/footer-map.js` is the single source of truth — it injects its
own CSS and its own markup into `.footer .footer-top`, so it works on both footer
formats. Every page carries only `<script src="/js/footer-map.js" defer></script>`
before `</body>`. Do not inline map markup into the HTML files.

It has two render paths:

- **Keyless (the current default, `API_KEY = ''`)** — Google Maps' own
  *Share → Embed a map* iframe. No API key, no billing, no quota. The `pb` string
  encodes fixed coordinates, so **if the clinic moves again this string must be
  regenerated** from Google Maps → the listing → Share → Embed a map.
- **Embed API (opt-in)** — set `API_KEY` and it switches to `maps/embed/v1/place` keyed
  on the Place ID, which then follows the Business Profile automatically. Free with
  unlimited requests, key required. Restrict any such key to HTTP referrers
  `ruladiet.com/*` and `*.ruladiet.com/*` and to the Maps Embed API only.

Never commit a real API key with the key unrestricted.

## The rebuild hazard

`build-course-pages-v2.js` **regenerates** `course/*.html` from templates in that script.
It has been updated with the new address, but if you regenerate course pages you must
re-run the maintenance scripts afterwards, or the footer map script tag will be missing:

```bash
node build-course-pages-v2.js      # if you regenerate course pages
node add-footer-map.js             # re-adds the script tag   (idempotent)
node update-address.js             # re-applies the new address (idempotent)
node fix-address-dir.js            # re-applies dir="ltr"      (idempotent)
node scripts/maintain-seo.js        # root-relative links and SEO maintenance
node scripts/optimize-images.js    # reapply responsive logo and card images
node scripts/enhance-brand-navigation.js # restore clear, linked logos and same-window free-course registration
node scripts/sync-course-enrollments.js # align course card counts with the detail pages
node scripts/check-site.js         # links, sitemap, scripts and JSON-LD checks
```

All three are idempotent and safe to re-run at any time. Each writes a `.bak-*` copy
beside every file it changes; those patterns are gitignored and vercelignored.

The SEO maintenance script is also idempotent. It writes only changed files, does not
regenerate course content, and uses Git history for review and rollback. Run the site
check afterwards; its known null-byte warning is not a new regression.

## Known issues

- **`course/الأكل-العاطفي.html` contains 588 null bytes.** The file is corrupted — some
  build script wrote it badly. It renders, but it should be regenerated. `grep` treats it
  as binary, so text tooling silently skips it; account for that.
- **Line-ending noise.** `core.autocrlf` is unset and there is no `.gitattributes`, so
  `js/testimonials.js`, `sitemap.xml` and `شكر-للشراء.html` show as fully rewritten in
  `git status` while having **zero real changes** (`git diff --ignore-cr-at-eol` is
  empty). Do not present these as edits, and prefer not to commit them. Adding a
  `.gitattributes` with `* text=auto eol=lf` would settle it, but that is a separate
  commit — do not mix it into a content change.
- **`aggregateRating` is hardcoded** in the JSON-LD (`4.9` / `162` reviews as of
  2026-09-08) and the hero stat repeats it. It goes stale. The durable fix is a cached
  server-side fetch from the Places API via the existing `api/` folder.

## Conventions

- Responsive image copies are generated by `npm run optimize:images` from the
  original assets in `images/`, which must remain unchanged. Commit the generated
  `images/responsive/` files because production has no asset build step. The script
  applies the shared logo to all pages and course thumbnails to the homepage and
  course listing. Keep `sizes` aligned with the CSS if those layouts change.

- The homepage uses local Tajawal WOFF2 subsets, with their SIL OFL license and
  upstream URLs in `fonts/tajawal/`. Two Arabic weights are preloaded; optional
  font display prevents late swaps on slow connections. Homepage layout CSS is
  loaded normally to avoid an initial partial layout. Run
  `node scripts/stabilize-home-render.js` to reapply these head settings after
  homepage regeneration. Other pages currently retain their existing font setup.

- Readable legacy URL mappings live in `scripts/legacy-redirects.json`. Run
  `node scripts/build-redirects.js` after editing that map, then the site check.
  The script owns all redirect rules in `vercel.json` and preserves rewrites.
  Arabic literal paths must match both uppercase and lowercase percent encoding.
  Map old pages to equivalent current content; do not blanket-redirect old
  lessons, WordPress demo content or unknown paths to the homepage.

- The owner confirmed on 2026-09-09 that Rula's master's degree is from Sabahattin
  Zaim University (جامعة صباح الدين زعيم). Do not attribute that degree to Istanbul
  Aydin University; the food engineering bachelor's degree is a separate credential.

- Arabic filenames and Arabic UI copy throughout — preserve encoding (UTF-8, no BOM).
- Team names and roles confirmed by the owner are maintained with
  `node scripts/update-team.js`. Use "اختصاصية تغذية" for both ياسمين رسلان
  and منة, without "علاجية". Administrative/marketing roles are not clinical roles.
- Course card enrollment counts are copied from the "ملتحق" label on course
  detail pages by `node scripts/sync-course-enrollments.js`. If a detail page
  has no count, the script preserves the existing card value and reports it;
  obtain a confirmed number before adding or changing that enrollment claim.
  The owner confirmed المسار الصحي has "400 وأكثر" on 2026-09-09; preserve
  that lower-bound wording rather than presenting 400 as an exact count.
- The owner confirmed on 2026-09-10 that the emotional-eating live program has
  a paid waiting list: USD 247, with sessions starting later. Maintain its price,
  waiting-list copy and Offer schema with `node scripts/update-emotional-waitlist.js`
  after regenerating pages. Do not describe payment as immediate course access.
- PCOS course 636274 was checked in Systeme.io on 2026-09-10: 33 lessons in
  five modules, with a separate public introductory preview. Run
  `node scripts/sync-pcos-course.js` after regenerating pages. Its verified
  curriculum is in `content/pcos-course.json`; do not restore conflicting
  duration claims or unverified extras/certificates.
- Site-wide edits go through a **script committed to the repo**, so they can be re-run
  after a rebuild. Do not hand-edit 30 files.
- Verify JSON-LD still parses after touching any `<script type="application/ld+json">`
  block. There are 56 of them across the site.
- Do not add `localStorage`/`sessionStorage` — nothing here needs it.

## Campaign source handoff (2026-09-10)

- `js/campaign-source.js` carries only the approved campaign's four fixed UTM
  values from the PCOS landing page to its exact Systeme.io checkout. It does
  not forward arbitrary parameters, click IDs or contact information, persist
  a visitor identity, or send events to Meta. Organic links remain unchanged.
- `scripts/sync-pcos-course.js` restores its script tag after regeneration.
  Run `node scripts/check-campaign-source.js` and the site check after changes.
- Systeme.io's Store UTM parameters setting was enabled for supported opt-in
  forms. Its documentation explicitly excludes purchase attribution; do not
  present these tags as verified purchases, CPA or ROAS.
- Do not blanket-install an advertising pixel or upload condition-specific
  registration/purchase events on health course pages. Meta Business Tools
  Terms section 1(h) prohibits health-based data, including indirect signals.

## Blog editorial maintenance (2026-09-09)

- The owner approved a permanent two-level taxonomy on 2026-09-13. Read
  `content/blog-taxonomy.md`; assign every article key to one existing topic in
  `content/blog-taxonomy.json`. Pregnancy, breastfeeding, infants and children
  belong under family nutrition. Never restore the old free-form filters.
  `enrich-blog.js` also builds all archives and their sitemap entries; empty
  topics remain noindex until populated. Run `scripts/check-blog-navigation.js`.
- Breadcrumb links and BreadcrumbList must agree on Home / Blog / Category /
  Topic / Article. Keep current article URLs. TOC links use descriptive Arabic
  heading IDs with numbered legacy aliases. Preserve both through rebuilds.

- Edit article bodies in `content/blog/<key>.html`, with the slug/key mapping,
  titles, related reading, sources and primary CTA in `scripts/blog-catalog.js`.
  Run `node scripts/enrich-blog.js` to update the 17 public HTML pages, homepage
  and blog cards, social previews, structured data and sitemap. Update the
  explicit editorial date only when content is actually revised.
- Every article has its own modest cover (no people in the new covers) in
  `images/blog/<key>-1280.webp`, plus 400/800 responsive copies. Provenance and
  original generation prompts are in `content/blog/image-provenance.json`.
  `node scripts/prepare-blog-images.js` refreshes smaller copies from masters;
  an optional source directory supplies `<key>.png` to regenerate all sizes.
- Educational SVG diagrams are maintained by `scripts/blog-visuals.js`.
  Keep Arabic labels legible at mobile widths; do not replace them with reused
  generic stock photos. Author photos and course artwork are separate assets.
- Re-run blog maintenance after general image/SEO scripts, then run
  `node scripts/check-blog.js` and `node scripts/check-site.js`. The maintenance
  script is idempotent and preserves publication dates and existing URLs.
- Keep article navigation, contextual links, the primary CTA and related
  reading in static HTML. `js/blog-post.js` only enhances sharing and menus;
  do not restore the old widget that appended every course to every article.
- Medical content must use primary sources. Do not restore unsupported claims
  about guaranteed weight loss, water burning fat, mandatory fasting, automatic
  medication dose escalation, or a single PCOS diet. Do not invent clinical
  reviews, experiences, success rates or patient numbers.

## Daily articles and author profile (2026-09-10)

- On 2026-09-12 the owner prioritized keywords likely to lead to bookings or
  course enrollments. Follow the decision-stage briefs in the editorial plan,
  with equal consultation/course priority and PCOS first among course briefs.
  Preserve source quality, verify keyword intent, and avoid competing with the
  existing offer pages. General nutrition topics are now supporting backlog.
- The owner authorized daily publication at 09:00 Europe/Istanbul. Read
  `content/editorial-policy.md` and `content/editorial-plan.json` for the full
  workflow. New metadata belongs in `content/daily-posts.json` and is appended
  to the catalog automatically; never overwrite the legacy catalog or dates.
- Every daily article needs at least 1000 original body words, a unique modest
  cover, two meaningful inline images with descriptive Arabic alt, sources,
  internal links and one primary CTA. `check-blog.js` enforces the core limits.
- Render with `node scripts/enrich-blog.js` and `node scripts/build-author.js`,
  then run the blog and site checks. The author archive, blog index, latest-three
  homepage cards and sitemap must include the new article. Only change an
  article's explicit update date when its content is substantively revised.
- Rula's author profile is `/author/rulaalloush`; `/auther/rulaalloush` redirects
  there. Keep the CV at `/رولا-علوش`. Both resolve to Person ID
  `https://ruladiet.com/author/rulaalloush#person`, also used in BlogPosting.
- Verified publisher profiles and bio evidence live in `content/author-rula.json`.
  Do not claim an AJ+ or magazine relationship without a primary author/article
  URL. Do not claim Rula personally reviewed a generated article unless she did.
