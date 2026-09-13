const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const {root,elementRange,text}=require('./blog-html');
const posts=require('./blog-catalog');
const {postPath,postFile}=require('./blog-taxonomy');
const hashes=new Set();let contextualLinks=0,totalBytes=0;
for(const p of posts){
 const html=fs.readFileSync(path.join(root,postFile(p)),'utf8');
 const source=fs.readFileSync(path.join(root,'content/blog',p.key+'.html'),'utf8');
 const r=elementRange(html,'post-content'),body=html.slice(r.contentStart,r.contentEnd);
 const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'images/blog',p.key+'-1280.webp'))).digest('hex');
 assert(!hashes.has(hash),'Repeated cover: '+p.key);hashes.add(hash);
 assert(html.includes('src="/images/blog/'+p.key+'-1280.webp"'),p.key+' missing hero');
 assert(html.includes('src="/images/blog/visual-'+p.key+'.svg"'),p.key+' missing educational visual');
 assert(!/<img[^>]+src="https?:/.test(body),p.key+' external body image');
 assert(!body.includes('post-cta'),p.key+' old CTA remains');
 assert.equal((body.match(/class="article-next-step"/g)||[]).length,1,p.key+' needs one next step');
 const links=[...source.matchAll(/href="(\/[^"#]+)"/g)].map(x=>x[1]);
 assert(links.length>=2,p.key+' missing contextual links');contextualLinks+=links.length;
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size,p.key+' duplicate IDs');
 for(const link of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(link[1]),p.key+' broken fragment '+link[1]);
 const schema=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1])).find(x=>x['@type']==='BlogPosting');
 assert.equal(schema.image,'https://ruladiet.com/images/blog/'+p.key+'-1280.webp');
 assert.equal(schema.headline,p.title);assert.equal(schema.dateModified,p.updated||'2026-09-09');
 assert.equal(schema.author.name,'رولا علوش');
 assert.equal(schema.author.url,'https://ruladiet.com/author/rulaalloush');
 assert.equal(schema.author['@id'],'https://ruladiet.com/author/rulaalloush#person');
 assert.equal(decodeURI(schema.url),'https://ruladiet.com'+postPath(p));
 assert.equal(schema.wordCount,text(source).split(/\s+/).length,p.key+' body word count mismatch');
 if(p.workflow==='daily'){
  assert(schema.wordCount>=1000,p.key+' must have at least 1000 original body words');
  assert.equal(schema.datePublished,p.published);
  assert(p.updated>=p.published,p.key+' update precedes publication');
  const bodyImages=[...body.matchAll(/<img\b[^>]*>/g)];
  assert(bodyImages.length>=2&&bodyImages.length<=3,p.key+' requires two or three inline images');
  for(const img of bodyImages)assert(/alt="[^\"]{10,}"/.test(img[0]),p.key+' missing descriptive inline alt');
  assert(p.coverAlt&&p.coverAlt.length>=10,p.key+' missing descriptive cover alt');
  assert(p.sources.length>=3,p.key+' needs documented sources');
 }
 assert(html.includes('content="'+schema.image+'"'),p.key+' social preview mismatch');
 for(const img of html.matchAll(/<img\b[^>]*\bsrc="(\/[^"]+)"[^>]*>/g))assert(fs.existsSync(path.join(root,img[1])),p.key+' missing image '+img[1]);
 for(const width of [400,800,1280])totalBytes+=fs.statSync(path.join(root,'images/blog',p.key+'-'+width+'.webp')).size;
}
for(const file of ['index.html','المدونة.html']){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 for(const card of html.matchAll(/<article class="blog-(?:item|card)">[\s\S]*?<\/article>/g)){
  const slug=decodeURIComponent(card[0].match(/href="\/blog\/([^"]+)"/)[1]);const p=posts.find(x=>postPath(x)==='/blog/'+slug);
  assert(card[0].includes('/images/blog/'+p.key+'-400.webp'),file+' card mismatch');
  assert(!/<a\b[^>]*>\s*<a\b/.test(card[0]),file+' nested card anchor');
 }
}
for(const match of fs.readFileSync(path.join(root,'css/blog-editorial.css'),'utf8').matchAll(/url\('(\/[^']+)'\)/g))assert(fs.existsSync(path.join(root,match[1])),'Missing font '+match[1]);
console.log(JSON.stringify({articles:posts.length,uniqueCovers:hashes.size,educationalVisuals:posts.length,contextualLinks,responsiveImageBytes:totalBytes,errors:0},null,2));
