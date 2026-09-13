const fs=require('node:fs');
const assert=require('node:assert/strict');
const {root,text}=require('./blog-html');
const {headingSlug,addHeadingAnchors}=require('./blog-headings');
const {categories,categoryPath,topicPath,postPath}=require('./blog-taxonomy');
const posts=require('./blog-catalog');
const {articleTopics}=require('../content/blog-taxonomy.json');
const {introduction:archiveIntroduction}=require('./archive-introductions');
const schemas=html=>[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
const read=route=>fs.readFileSync(root+route+'.html','utf8');
const sitemap=decodeURI(fs.readFileSync(root+'/sitemap.xml','utf8'));
const paths=new Set();
assert.deepEqual(Object.keys(articleTopics).sort(),posts.map(p=>p.key).sort(),'Taxonomy contains missing or stale article assignments');
assert.equal(headingSlug('ما الكربوهيدرات؟'), 'ما-الكربوهيدرات');
assert.equal(headingSlug('  تَغْذِيَة الرُّضَّع: 6 أشهر &amp; أكثر  '),'تغذية-الرضع-6-أشهر-أكثر');
const fixture=addHeadingAnchors('<h2>وجبة متوازنة</h2><h3>وجبة متوازنة</h3><h2>وجبة متوازنة</h2>');
assert.deepEqual(fixture.headings.map(h=>h.id),['وجبة-متوازنة','وجبة-متوازنة-2','وجبة-متوازنة-3']);
for(let i=1;i<=3;i++)assert(fixture.body.includes('id="section-'+i+'"'),'Missing legacy alias');
function checkCrumbs(html, expected){
 const schema=schemas(html).find(s=>s['@type']==='BreadcrumbList');
 assert(schema,'Missing BreadcrumbList');
 assert.deepEqual(schema.itemListElement.map(i=>[i.name,decodeURI(new URL(i.item).pathname)]),expected);
 assert.deepEqual(schema.itemListElement.map(i=>i.position),expected.map((_,i)=>i+1));
 const nav=html.match(/<nav class="breadcrumb\b[^>]*>[\s\S]*?<\/nav>/)?.[0];
 assert(nav?.includes('aria-current="page"'),'Current breadcrumb missing');
 const links=[...nav.matchAll(/<a href="([^"]+)">([^<]+)<\/a>/g)].map(m=>[m[2],m[1]]);
 assert.deepEqual(links,expected.slice(0,-1),'Visible breadcrumb must match schema');
 assert(nav.includes(expected.at(-1)[0]),'Current breadcrumb label missing');
}
const base=[['الرئيسية','/'],['المدونة','/المدونة']];
checkCrumbs(read('/المدونة'),base);
let headingCount=0,archiveCount=0;
for(const p of posts){
 const html=read(postPath(p)),source=fs.readFileSync(root+'/content/blog/'+p.key+'.html','utf8');
 const {category,topic}=p.taxonomy;
 checkCrumbs(html,[...base,[category.name,categoryPath(category)],[topic.name,topicPath(category,topic)],[p.title,postPath(p)]]);
 assert.deepEqual(schemas(html).find(s=>s['@type']==='BlogPosting').articleSection,[category.name,topic.name]);
 const sourceHeadings=[...source.matchAll(/<(h[23])(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g)];
 const rendered=[...html.matchAll(/<(h[23])\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g)].filter(h=>!['article-sources-title','next-step-title'].includes(h[2]));
 assert.equal(rendered.length,sourceHeadings.length,p.key+' lost heading');
 rendered.forEach((h,i)=>{
  assert.equal(text(h[3]),text(sourceHeadings[i][2]));
  assert(!/^section-\d+$/.test(h[2]),p.key+' numbered TOC anchor');
  assert(html.includes('id="section-'+(i+1)+'"'),p.key+' legacy link lost');
  assert(h[2].startsWith(headingSlug(h[3])),p.key+' heading slug mismatch');
 });
 const toc=html.match(/<nav class="sidebar-widget sidebar-toc"[\s\S]*?<\/nav>/)[0];
 const targets=[...toc.matchAll(/href="#([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(targets,rendered.filter(h=>h[1]==='h2').map(h=>h[2]));
 headingCount+=rendered.length;
}
for(const category of categories){
 for(const topic of [null,...category.topics]){
  const route=topic?topicPath(category,topic):categoryPath(category);
  assert(!paths.has(route),'Duplicate archive route');paths.add(route);
  const html=read(route);
  const introduction=archiveIntroduction(category,topic);
  assert(html.includes(introduction.html),'Complete introduction must be in initial HTML '+route);
  assert(html.includes('data-archive-intro')&&html.includes('aria-controls="archive-intro-copy"'),'Missing expandable introduction '+route);
  assert(html.includes('aria-expanded="true" aria-controls="archive-intro-copy" hidden'),'Introduction must remain readable without JavaScript '+route);
  const expected=posts.filter(p=>topic?p.taxonomy.topic.id===topic.id:p.taxonomy.category.id===category.id);
  checkCrumbs(html,[...base,[category.name,categoryPath(category)],...(topic?[[topic.name,route]]:[])]);
  const items=schemas(html).find(s=>s['@type']==='CollectionPage').mainEntity;
  assert.equal(items.numberOfItems,expected.length);
  assert.deepEqual(items.itemListElement.map(i=>decodeURI(new URL(i.url).pathname)).sort(),expected.map(postPath).sort());
  assert.equal(html.includes('content="noindex, follow"'),!expected.length,route+' indexing rule');
  assert.equal(sitemap.includes('<loc>https://ruladiet.com'+route+'</loc>'),!!expected.length,route+' sitemap rule');
  assert(!html.includes('href="#cat='),'Legacy filter remains');
  for(const p of expected)assert(html.includes('href="'+postPath(p)+'"'),route+' missing member');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,route+' duplicate IDs');
  archiveCount++;
 }
}
const family=categories.find(c=>c.id==='family');
for(const id of ['pregnancy','breastfeeding','infants','children'])assert(family.topics.some(t=>t.id===id),'Family missing '+id);
assert(!read('/المدونة').includes('href="#cat='));
assert(read('/المدونة').includes('href="#أحدث-المقالات"')&&read('/المدونة').includes('id="أحدث-المقالات"'),'Missing shortcut to latest articles');
console.log(JSON.stringify({articles:posts.length,namedHeadings:headingCount,archives:archiveCount,breadcrumbsChecked:posts.length+archiveCount+1,errors:0},null,2));
