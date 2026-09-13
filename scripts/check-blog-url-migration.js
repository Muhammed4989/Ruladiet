const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {root}=require('./blog-html');
const {postPath,postFile,topicPath}=require('./blog-taxonomy');
const {rewriteBlogLinks}=require('./blog-links');
const posts=require('./blog-catalog');
const origin='https://ruladiet.com';
const rules=JSON.parse(fs.readFileSync(root+'/vercel.json','utf8')).redirects;
const matches=(rule,pathname)=>new RegExp('^'+rule.source.replace(/:legacy\d*\(/g,'(?:')+'$').test(pathname);
const sitemap=decodeURI(fs.readFileSync(root+'/sitemap.xml','utf8'));
const routes=new Set();let redirects=0,assets=0;
for(const p of posts){
 const route=postPath(p),file=postFile(p);
 assert.equal(route,topicPath(p.taxonomy.category,p.taxonomy.topic)+'/'+p.slug);
 assert(!routes.has(route));routes.add(route);
 assert(!fs.existsSync(root+'/blog/'+p.slug+'.html'),'Old article still ships: '+p.key);
 const html=fs.readFileSync(root+'/'+file,'utf8');
 const canon=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
 assert.equal(decodeURI(canon),origin+route);
 assert(sitemap.includes('<loc>'+origin+route+'</loc>'));
 assert(!sitemap.includes('<loc>'+origin+'/blog/'+p.slug+'</loc>'));
 for(const asset of html.matchAll(/<(?:img|script|link)\b[^>]*\b(?:src|href)="([^"]+)"/g)){
  const url=new URL(asset[1],origin+route);
  if(url.origin!==origin||url.href===canon)continue;
  assert(asset[1].startsWith('/'),'Nested article has relative asset: '+asset[1]);
  assert(fs.existsSync(root+decodeURI(url.pathname)),p.key+' missing asset '+url.pathname);assets++;
 }
 const variants=['/blog/'+p.slug,'/blog/'+p.slug+'/','/blog/'+p.slug+'.html','/blog/'+p.slug+'.html/',route+'/',route+'.html',route+'.html/'];
 for(const source of variants){
  const encoded=encodeURI(source);
  for(const wire of [encoded,encoded.toLowerCase(),encoded.replace(/%D8/g,'%d8')]){
   const rule=rules.find(r=>matches(r,wire));assert(rule,'Missing redirect '+source);
   assert(rule.permanent);assert.equal(decodeURI(rule.destination),route);
   assert(!rules.some(r=>matches(r,encodeURI(route))),'Canonical URL loops');redirects++;
  }
 }
 assert(!rules.some(r=>matches(r,encodeURI('/blog/'+p.slug+'xhtml'))),'Unescaped dot in redirect pattern');
 const original=`<a href="/blog/${p.slug}?ref=blog&amp;test=1#section-3">عنوان المقال</a>`;
 assert.equal(rewriteBlogLinks(original),`<a href="${route}?ref=blog&amp;test=1#section-3">عنوان المقال</a>`);
 assert.equal(rewriteBlogLinks(html),html,'Published page still links to flat blog URLs: '+p.key);
}
for(const file of ['index.html','المدونة.html','author/rulaalloush.html']){
 const html=fs.readFileSync(path.join(root,file),'utf8');assert.equal(rewriteBlogLinks(html),html,file+' still links to old article URLs');
}
console.log(JSON.stringify({hierarchicalArticles:routes.size,redirectVariantsChecked:redirects,localAssetsChecked:assets,errors:0},null,2));
