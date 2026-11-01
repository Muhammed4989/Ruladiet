const {text} = require('./blog-html');
const {escape:e} = require('./blog-visuals');
function headingText(label) {
  return text(label).replace(/&(?:nbsp|amp|quot|apos|lt|gt);|&#(?:x[0-9a-f]+|\d+);/gi, entity => {
    const named = {'&nbsp;':' ', '&amp;':'&', '&quot;':'"', '&apos;':"'", '&lt;':'<', '&gt;':'>'};
    if (named[entity]) return named[entity];
    if (entity.startsWith('&#')) return String.fromCodePoint(parseInt(entity.slice(entity[2].toLowerCase()==='x'?3:2,-1),entity[2].toLowerCase()==='x'?16:10));
    return entity;
  });
}
function headingSlug(label) {
  return headingText(label).normalize('NFC').replace(/[\u0640\u064b-\u065f\u0670]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'') || 'عنوان';
}
function extractLegacyHeadingAliases(html) {
  const aliases = new Map();
  const pattern = /<span id="(section-\d+)"[^>]*><\/span>(?:<span[^>]*><\/span>)*<(h[23])\b[^>]*>([\s\S]*?)<\/\2>/g;
  for (const match of html.matchAll(pattern)) aliases.set(headingSlug(match[3]), match[1]);
  return aliases;
}
function addHeadingAnchors(body, legacyHeadingAliases = new Map()) {
  const headings = [];
  const used = new Set(['article-sources-title','next-step-title']);
  for (const match of body.matchAll(/\bid="([^"]+)"/g)) used.add(match[1]);
  const aliases = legacyHeadingAliases instanceof Map ? legacyHeadingAliases : new Map(Object.entries(legacyHeadingAliases));
  const reserved = new Set(aliases.values());
  for (const alias of reserved) used.add(alias);
  let nextLegacy = Math.max(0, ...[...reserved].map(alias => Number(alias.replace('section-','')) || 0)) + 1;
  body = body.replace(/<(h[23])([^>]*)>([\s\S]*?)<\/\1>/g, (_,tag,attrs,label) => {
    const base = headingSlug(label);
    let id=base, suffix=2;
    while (used.has(id)) id=base+'-'+suffix++;
    used.add(id);
    let legacy = aliases.get(base);
    if (!legacy) {
      do legacy = 'section-'+nextLegacy++; while (reserved.has(legacy));
      reserved.add(legacy);
    }
    const oldId = attrs.match(/\bid="([^"]+)"/)?.[1];
    const headingAliases = [...new Set([legacy, oldId].filter(Boolean))];
    headings.push({tag,label:headingText(label),id});
    return headingAliases.map(alias=>`<span id="${e(alias)}" class="article-anchor-alias" aria-hidden="true"></span>`).join('') + `<${tag}${attrs.replace(/\s*id="[^"]*"/,'')} id="${e(id)}">${label}</${tag}>`;
  });
  return {body, headings};
}
module.exports = {headingSlug, extractLegacyHeadingAliases, addHeadingAnchors};
