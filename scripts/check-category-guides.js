const fs=require('node:fs');
const assert=require('node:assert/strict');
const {root,elementRange}=require('./blog-html');
const {categories,categoryPath,topicPath}=require('./blog-taxonomy');
const {introduction}=require('./archive-introductions');
const allowed=new Set(['www.niddk.nih.gov','www.nhlbi.nih.gov','www.nia.nih.gov','www.who.int','www.nichd.nih.gov','ods.od.nih.gov','www.nimh.nih.gov','www.canada.ca','www.fda.gov','medlineplus.gov','www.nhs.uk','www.cdc.gov']);
const manifest=require('../content/blog-category-intros.json');
const guides=[],seen=new Set(),paragraphs=new Map();
assert.deepEqual(Object.keys(manifest.categories).sort(),categories.map(c=>c.id).sort());
assert.deepEqual(Object.keys(manifest.topics).sort(),categories.flatMap(c=>c.topics.map(t=>t.id)).sort());
for(const category of categories)for(const topic of [null,...category.topics]){
 const guide=introduction(category,topic),route=topic?topicPath(category,topic):categoryPath(category);
 assert(!seen.has(guide.source),'Duplicate category guide '+guide.id);seen.add(guide.source);
 assert(guide.words>=500,guide.id+' body word minimum');
 assert((guide.source.match(/^## /gm)||[]).length>=3,guide.id+' needs descriptive headings');
 const html=fs.readFileSync(root+route+'.html','utf8'),range=elementRange(html,'archive-intro-copy');
 assert.equal(html.slice(range.contentStart,range.contentEnd),guide.html,guide.id+' full guide must be in initial HTML');
 assert(html.includes('aria-expanded="true" aria-controls="archive-intro-copy" hidden'),'JS-free fallback missing');
 for(const paragraph of guide.paragraphs){assert(!paragraphs.has(paragraph),'Repeated paragraph in '+guide.id+' and '+paragraphs.get(paragraph));paragraphs.set(paragraph,guide.id);}
 for(const link of guide.links){
  assert(link.label.length>=5&&!/^(هنا|اضغط هنا|المزيد)$/.test(link.label),'Uninformative anchor in '+guide.id);
  if(link.href.startsWith('/')){
   const target=decodeURI(link.href.split(/[?#]/)[0]);
   assert(fs.existsSync(root+target+'.html')||fs.existsSync(root+target+'/index.html'),guide.id+' broken internal link '+target);
   assert(target!==route,'Self-link in guide '+guide.id);
  }else assert(allowed.has(new URL(link.href).hostname),'Unreviewed reference domain '+link.href);
 }
 guides.push({id:guide.id,words:guide.words,internalLinks:guide.links.filter(l=>l.href.startsWith('/')).length,references:guide.links.filter(l=>l.href.startsWith('https://')).length});
}
assert(fs.readFileSync(root+'/css/blog-taxonomy.css','utf8').includes('.archive-intro.is-collapsed .archive-intro-copy>:not(:first-child){display:none}'),'Collapsed rich content must not leave invisible focusable links');
console.log(JSON.stringify({guides:guides.length,totalBodyWords:guides.reduce((s,g)=>s+g.words,0),minimumBodyWords:Math.min(...guides.map(g=>g.words)),maximumBodyWords:Math.max(...guides.map(g=>g.words)),internalLinks:guides.reduce((s,g)=>s+g.internalLinks,0),references:guides.reduce((s,g)=>s+g.references,0),errors:0,details:guides},null,2));
