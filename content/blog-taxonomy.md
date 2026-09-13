# Permanent blog structure

Approved and implemented on 2026-09-13. The complete names, descriptions, paths and article assignments live in `blog-taxonomy.json`.

## Navigation

Home → Blog → Category → Topic → Article. Every ancestor is a real static link, with an equivalent BreadcrumbList. Article URLs remain `/blog/<existing-slug>`; moving an article between topics does not change its URL. Category pages use `/blog/category/<category-slug>` and topics append `/<topic-slug>`.

The six roots are إدارة الوزن، صحة المرأة والتغذية، التغذية والحالات الصحية، السلوك الغذائي والعلاقة مع الطعام، التغذية اليومية، تغذية الأسرة. As requested by the owner, تغذية الحوامل، تغذية المرضعات، تغذية الرضع and تغذية الأطفال are children of تغذية الأسرة. School lunches belong to children; do not add a fourth navigation level. PCOS belongs to women's health; insulin resistance belongs to health conditions. Use contextual links to connect overlapping topics, rather than duplicating articles across categories.

## Publishing and growth

Assign each article key exactly once in `articleTopics`, using an existing topic ID. The catalog resolves its visible category label from this source. Remove or ignore the former free-form category field in daily metadata. The renderer fails when an article has no valid assignment. Keep URLs and IDs stable; edit descriptions and display names when needed without changing paths.

All 25 topics have usable landing pages and links. Thirteen currently have no dedicated articles: they say قيد الإعداد, offer a return to their parent and show available family/category reading. These pages use `noindex, follow` and are omitted from the sitemap. They become indexable automatically when their first article is published. Do not write filler to populate them or add them to the sitemap while empty.

Grow content according to the commercial and editorial priorities in `editorial-plan.json`: equal consultation and course priority, with PCOS first among courses. No annual taxonomy changes are needed. Review coverage periodically; add a new topic only if it has a distinct purpose and a sustainable set of planned articles. No dates or promotional campaign names in category names.

## Maintenance

1. Update content and the assignment in `blog-taxonomy.json`.
2. Run `node scripts/enrich-blog.js` (also builds all archives) and `node scripts/build-author.js`.
3. Run `node scripts/check-blog.js`, `node scripts/check-blog-navigation.js`, `node scripts/check-site.js` and `git diff --check`.
4. Check generator idempotence and preview the index, parent, topic and an article at desktop and mobile sizes when navigation/layout changes.
5. Verify the deployed URLs, canonical, index/noindex state, sitemap and breadcrumb links after publication.

TOC links use heading text, for example `#كيف-تختارين-الدعم-المناسب`. Duplicate heading names get a numeric suffix. The historical `#section-1` etc. remain as invisible aliases next to their corresponding headings. Avoid changing an established heading casually because readers may have bookmarked its named fragment.
