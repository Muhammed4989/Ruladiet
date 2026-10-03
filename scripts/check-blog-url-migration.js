const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {root}=require('./blog-html');
const {postPath,postFile,topicPath}=require('./blog-taxonomy');
const {rewriteBlogLinks}=require('./blog-links');
const posts=require('./blog-catalog');
const origin='https://ruladiet.com';
const rules=JSON.parse(fs.readFileSync(root+'/vercel.json','utf8')).redirects;
function redirectDestination(rule,pathname){
 if(/:legacy/.test(rule.source))return new RegExp('^'+rule.source.replace(/:legacy\d*\(/g,'(?:')+'$').test(pathname)?rule.destination:null;
 if(rule.source==='/blog/category/:path*')return pathname.startsWith('/blog/category/')?'/blog/'+pathname.slice('/blog/category/'.length):null;
 if(/^\/blog\/:category/.test(rule.source)){
  const names=[];
  const pattern=rule.source.split('/').map(segment=>{
   const param=segment.match(/^:(category|topic|slug)(\.html)?$/);
   if(!param)return segment;
   names.push(param[1]);return '([^/]+?)'+(param[2]?'\\.html':'');
  }).join('/');
  const match=pathname.match(new RegExp('^'+pattern+'$'));
  if(!match)return null;
  return rule.destination.replace(/:(category|topic|slug)/g,(_,name)=>match[names.indexOf(name)+1]);
 }
 return rule.source===pathname?rule.destination:null;
}
const matches=(rule,pathname)=>redirectDestination(rule,pathname)!==null;
const previousRule=rules.find(r=>r.source==='/blog/category/:path*');
assert(previousRule?.permanent&&previousRule.destination==='/blog/:path*','Missing direct previous-hierarchy redirect');
assert(fs.statSync(root+'/vercel.json').size<450000,'Routing config approaching deployment size limit');
const sitemap=decodeURI(fs.readFileSync(root+'/sitemap.xml','utf8'));
const routes=new Set();let redirects=0,assets=0;
for(const p of posts){
 const route=postPath(p),file=postFile(p);
 assert.equal(route,topicPath(p.taxonomy.category,p.taxonomy.topic)+'/'+p.slug);
 assert(!routes.has(route));routes.add(route);
 assert(!fs.existsSync(root+'/blog/'+p.slug+'.html'),'Old article still ships: '+p.key);
 assert(!fs.existsSync(root+route.replace(/^\/blog\//,'/blog/category/')+'.html'),'Previous hierarchical article still ships: '+p.key);
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
 const previous=route.replace(/^\/blog\//,'/blog/category/');
 const variants=['/blog/'+p.slug,'/blog/'+p.slug+'/','/blog/'+p.slug+'.html','/blog/'+p.slug+'.html/',route+'/',route+'.html',route+'.html/'];
 for(const source of variants){
  const encoded=encodeURI(source);
  for(const wire of [encoded,encoded.toLowerCase(),encoded.replace(/%D8/g,'%d8')]){
   const rule=rules.find(r=>matches(r,wire));assert(rule,'Missing redirect '+source);
   assert(rule.permanent);assert.equal(decodeURI(redirectDestination(rule,wire)),route);
   assert(!rules.some(r=>matches(r,encodeURI(route))),'Canonical URL loops');redirects++;
  }
 }
 assert(!rules.some(r=>matches(r,encodeURI('/blog/'+p.slug+'xhtml'))),'Unescaped dot in redirect pattern');
 for(const source of [previous,previous+'/']){
  assert(source.startsWith('/blog/category/'));
  assert.equal(source.replace(/^\/blog\/category\//,'/blog/').replace(/\/$/,''),route);
  redirects++;
 }
 const original=`<a href="/blog/${p.slug}?ref=blog&amp;test=1#section-3">عنوان المقال</a>`;
 assert.equal(rewriteBlogLinks(original),`<a href="${route}?ref=blog&amp;test=1#section-3">عنوان المقال</a>`);
 assert.equal(rewriteBlogLinks(html),html,'Published page still links to flat blog URLs: '+p.key);
}
for(const category of require('./blog-taxonomy').categories){
 for(const topic of [null,...category.topics]){
  const route=topic?topicPath(category,topic):require('./blog-taxonomy').categoryPath(category);
  for(const variant of [route+'/',route+'.html',route+'.html/']) { for(const wire of [encodeURI(variant),encodeURI(variant).toLowerCase()]) { const rule=rules.find(r=>matches(r,wire)); assert(rule?.permanent,'Missing archive normalization '+variant); assert.equal(decodeURI(redirectDestination(rule,wire)),route); redirects++; } }
  const previous=route.replace(/^\/blog\//,'/blog/category/');
  assert(!fs.existsSync(root+previous+'.html'),'Previous archive still ships: '+previous);
  assert(!sitemap.includes('<loc>'+origin+previous+'</loc>'),'Previous archive remains in sitemap: '+previous);
  for(const source of [previous,previous+'/']){
   assert.equal(source.replace(/^\/blog\/category\//,'/blog/').replace(/\/$/,''),route);
  }
 }
}
for(const file of ['index.html','المدونة.html','author/rulaalloush.html']){
 const html=fs.readFileSync(path.join(root,file),'utf8');assert.equal(rewriteBlogLinks(html),html,file+' still links to old article URLs');
}
console.log(JSON.stringify({hierarchicalArticles:routes.size,redirectVariantsChecked:redirects,localAssetsChecked:assets,errors:0},null,2));
