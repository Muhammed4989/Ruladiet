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
```

All three are idempotent and safe to re-run at any time. Each writes a `.bak-*` copy
beside every file it changes; those patterns are gitignored and vercelignored.

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

- Arabic filenames and Arabic UI copy throughout — preserve encoding (UTF-8, no BOM).
- Site-wide edits go through a **script committed to the repo**, so they can be re-run
  after a rebuild. Do not hand-edit 30 files.
- Verify JSON-LD still parses after touching any `<script type="application/ld+json">`
  block. There are 56 of them across the site.
- Do not add `localStorage`/`sessionStorage` — nothing here needs it.
