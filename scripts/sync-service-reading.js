// Curated reverse links from offers to useful decision-stage articles.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const {postPath,postFile}=require('./blog-taxonomy');
const {escape:e}=require('./blog-visuals');
function syncServiceReading(){
 const data=JSON.parse(fs.readFileSync(path.join(root,'content/service-reading.json'),'utf8'));
 const posts=require('./blog-catalog');
 const start='<!-- service-reading:start -->',end='<!-- service-reading:end -->';
 const css='<link rel="stylesheet" href="/css/service-reading.css">';
 const plans=data.pages.map(page=>{
  assert(/^\/(?:course\/)?[^/]+$/.test(page.path),'Unexpected offer path');
  assert(page.articles.length>=2&&page.articles.length<=3,'Keep reading choices focused');
  assert(new Set(page.articles.map(a=>a.key)).size===page.articles.length,'Duplicate reading link');
  const cards=page.articles.map(item=>{
   const post=posts.find(p=>p.key===item.key);
   assert(post&&fs.existsSync(path.join(root,postFile(post))),'Article must exist before linking: '+item.key);
   return `<li><a class="service-reading__link" href="${e(postPath(post))}"><h3>${e(post.title)}</h3><p>${e(item.note)}</p><span aria-hidden="true">قراءة المقال ←</span></a></li>`;
  }).join('');
  const block=`${start}<section class="service-reading" aria-labelledby="service-reading-title"><div class="container"><h2 id="service-reading-title">${e(page.heading)}</h2><p class="service-reading__intro">${e(page.intro)}</p><ul class="service-reading__grid">${cards}</ul></div></section>${end}`;
  const file=path.join(root,page.path.slice(1)+'.html');
  const old=fs.readFileSync(file,'utf8');
  const hasStart=old.includes(start),hasEnd=old.includes(end);
  assert(hasStart===hasEnd,'Unbalanced reading markers');
  let html=old;
  if(hasStart)html=html.slice(0,html.indexOf(start))+block+html.slice(html.indexOf(end)+end.length);
  else {assert(html.includes('</main>'),'Missing main boundary');html=html.replace('</main>',block+'</main>');}
  if(!html.includes(css)){assert(html.includes('</head>'),'Missing head');html=html.replace('</head>',css+'</head>');}
  assert((html.match(/\u0000/g)||[]).length===(old.match(/\u0000/g)||[]).length,'Preserve existing null-byte content');
  return {file,old,html,url:'https://ruladiet.com'+page.path};
 });
 for(const p of plans)if(p.html!==p.old)fs.writeFileSync(p.file,p.html);
 const mapFile=path.join(root,'sitemap.xml'),map=fs.readFileSync(mapFile,'utf8');
 const next=map.replace(/<url>[\s\S]*?<\/url>/g,entry=>{
  const loc=entry.match(/<loc>([^<]+)<\/loc>/)?.[1];
  if(!loc||!plans.some(p=>p.url===decodeURI(loc)))return entry;
  const oldDate=entry.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
  const date=oldDate&&oldDate>data.updated?oldDate:data.updated;
  return oldDate?entry.replace(/<lastmod>[^<]+<\/lastmod>/,`<lastmod>${date}</lastmod>`):entry.replace('</url>',`<lastmod>${date}</lastmod></url>`);
 });
 if(next!==map)fs.writeFileSync(mapFile,next);
 console.log(`Synced curated reading on ${plans.length} service pages (${plans.filter(p=>p.old!==p.html).length} changed).`);
}
module.exports=syncServiceReading;
if(require.main===module)syncServiceReading();
