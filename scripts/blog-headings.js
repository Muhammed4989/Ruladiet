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
function addHeadingAnchors(body) {
  const headings = [];
  const used = new Set(['article-sources-title','next-step-title']);
  for (const match of body.matchAll(/\bid="([^"]+)"/g)) used.add(match[1]);
  const count = [...body.matchAll(/<h[23]\b/g)].length;
  for (let i=1;i<=count;i++) used.add('section-'+i);
  let index = 0;
  body = body.replace(/<(h[23])([^>]*)>([\s\S]*?)<\/\1>/g, (_,tag,attrs,label) => {
    const base = headingSlug(label);
    let id=base, suffix=2;
    while (used.has(id)) id=base+'-'+suffix++;
    used.add(id);
    const legacy = 'section-'+(++index);
    const oldId = attrs.match(/\bid="([^"]+)"/)?.[1];
    const aliases = [...new Set([legacy, oldId].filter(Boolean))];
    headings.push({tag,label:headingText(label),id});
    return aliases.map(alias=>`<span id="${e(alias)}" class="article-anchor-alias" aria-hidden="true"></span>`).join('') + `<${tag}${attrs.replace(/\s*id="[^"]*"/,'')} id="${e(id)}">${label}</${tag}>`;
  });
  return {body, headings};
}
module.exports = {headingSlug, addHeadingAnchors};
