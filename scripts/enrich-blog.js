// Source fragments live in content/blog; daily metadata lives in content/daily-posts.json.
const fs = require('node:fs');
const {root,elementRange,text,write} = require('./blog-html');
const posts = require('./blog-catalog');
const {descriptions,diagram,escape:e} = require('./blog-visuals');
const origin = 'https://ruladiet.com';
const authorPath = '/author/rulaalloush';
const authorId = origin + authorPath + '#person';
function dateLabel(day){return new Intl.DateTimeFormat('ar-u-nu-latn',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(day+'T12:00:00Z'));}
function image(p,hero=false) {
 const size=hero?1280:400;
 return `<img src="/images/blog/${p.key}-${size}.webp" srcset="/images/blog/${p.key}-400.webp 400w, /images/blog/${p.key}-800.webp 800w, /images/blog/${p.key}-1280.webp 1280w" sizes="${hero?'(max-width: 900px) calc(100vw - 32px), (max-width: 1200px) 64vw, 800px':'(max-width: 600px) calc(100vw - 48px), (max-width: 900px) 45vw, 360px'}" width="${size}" height="${size*9/16}" alt="${e(p.coverAlt || descriptions[p.key])}" loading="${hero?'eager':'lazy'}" ${hero?'fetchpriority="high" ':''}decoding="async">`;
}
function meta(h,key,value,property=false) {
 const attr=property?'property':'name';
 const tag=`<meta ${attr}="${key}" content="${e(value)}">`;
 const re=new RegExp('<meta\\b[^>]*'+attr+'=["\']'+key.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&')+'["\'][^>]*>','i');
 return re.test(h)?h.replace(re,tag):h.replace('</head>',tag+'</head>');
}
function replaceElement(h,cls,value,tag='div'){const r=elementRange(h,cls,tag);return h.slice(0,r.start)+value+h.slice(r.end);}
function related(p) {
 return `<section class="article-related" aria-label="مقالات ذات صلة"><h2>اقرئي أيضاً</h2><div class="article-related-grid">${p.related.map(slug=>{const q=posts.find(x=>x.slug===slug);if(!q)throw Error(slug);return `<a class="article-related-card" href="/blog/${q.slug}">${image(q)}<h3>${e(q.title)}</h3><span>قراءة المقال ←</span></a>`;}).join('')}</div></section>`;
}
for(const p of posts){
 const file='blog/'+p.slug+'.html';
 // Existing article supplies the shared shell; all identity fields are replaced below.
 let html=fs.readFileSync(fs.existsSync(root+'/'+file)?root+'/'+file:root+'/blog/شرب-الماء-لخسارة-الوزن.html','utf8');
 const originalSchema=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1])).find(x=>x['@type']==='BlogPosting');
 const published=p.published || originalSchema.datePublished;
 const updated=p.updated || '2026-09-09';
 const url=origin+'/blog/'+encodeURIComponent(p.slug);
 let body=fs.readFileSync(root+'/content/blog/'+p.key+'.html','utf8').trim();
 const wordCount=text(body).split(/\s+/).length;
 if(p.workflow==='daily' && wordCount<1000)throw Error(p.key+': daily article must contain at least 1000 body words');
 for(const link of body.matchAll(/<a href="(https:[^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) if(!p.sources.some(s=>s.url===link[1])) p.sources.push({url:link[1],name:text(link[2])});
 const headings=[];let count=0;
 body=body.replace(/<(h[23])(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g,(_,tag,label)=>{const id='section-'+(++count);headings.push({tag,label:text(label),id});return `<${tag} id="${id}">${label}</${tag}>`;});
 const visual=`<figure class="article-visual"><img src="/images/blog/visual-${p.key}.svg" width="740" height="420" loading="lazy" decoding="async" alt="${e(p.steps.join('، '))}"><figcaption>للتطبيق: ${p.steps.join('، ')}.</figcaption></figure>`;
 const sections=[...body.matchAll(/<h2\b/g)]; const place=sections[Math.min(2,sections.length-1)]?.index;
 body=place===undefined?body+visual:body.slice(0,place)+visual+body.slice(place);
 if(p.secondVisual){
  const second=`<figure class="article-visual"><img src="/images/blog/visual-${p.key}-questions.svg" width="740" height="420" loading="lazy" decoding="async" alt="${e(p.secondVisual.alt)}"><figcaption>${e(p.secondVisual.caption)}</figcaption></figure>`;
  const later=[...body.matchAll(/<h2\b/g)]; const at=later[Math.min(8,later.length-1)]?.index;
  body=at===undefined?body+second:body.slice(0,at)+second+body.slice(at);
  write('images/blog/visual-'+p.key+'-questions.svg',diagram({...p,steps:p.secondVisual.steps,visualHeading:p.secondVisual.title}));
 }
 const toc=`<ol class="toc-list">${headings.filter(h=>h.tag==='h2').map(h=>`<li><a href="#${h.id}">${e(h.label)}</a></li>`).join('')}</ol>`;
 const sources=`<section class="article-sources" aria-labelledby="article-sources-title"><h2 id="article-sources-title">المصادر والمراجع</h2><ul>${p.sources.map(s=>`<li><a href="${e(s.url)}" target="_blank" rel="noopener noreferrer">${e(s.name)}</a></li>`).join('')}</ul><p>المعلومات للتثقيف العام؛ تُخصّص الخطة الغذائية والعلاجية حسب الحالة مع المختص. الأمثلة الغذائية ليست وصفة فردية.</p></section>`;
 const cta=`<section class="article-next-step" aria-labelledby="next-step-title"><span>خطوتك التالية</span><h2 id="next-step-title">${e(p.cta.label)}</h2><p>${e(p.cta.note)}</p><a class="btn btn-primary" href="${p.cta.href}">${e(p.cta.label)} <span aria-hidden="true">←</span></a></section>`;
 const medical=['injections','mounjaro','insulin','thyroid'].includes(p.key);
 const hero=`<figure class="article-hero">${image(p,true)}${p.coverCaption?'<figcaption>'+e(p.coverCaption)+'</figcaption>':medical?'<figcaption>صورة توضيحية؛ لا تمثّل منتجاً طبياً بعينه أو نتيجة فحص.</figcaption>':''}</figure>`;
 const main=`<div class="post-main"><details class="article-mobile-toc"><summary>محتويات المقال</summary>${toc}</details>${hero}<div class="post-content"><div class="article-summary"><strong>الجواب المختصر</strong><p>${e(p.summary)}</p></div>${body}${cta}${sources}</div>${related(p)}</div>`;
 const aside=`<aside class="post-sidebar"><div class="sidebar-widget sidebar-author"><a href="${authorPath}" rel="author"><div class="sidebar-author-img"><img src="/images/rulamain.webp" alt="اختصاصية التغذية رولا علوش" width="130" height="130" loading="lazy"></div><h3>رولا علوش</h3></a><p>اختصاصية تغذية وكاتبة في التوعية الغذائية.</p><a href="${authorPath}">عن الكاتبة ومقالاتها المنشورة ←</a></div><nav class="sidebar-widget sidebar-toc" aria-label="محتويات المقال"><h2>في هذه المقالة</h2>${toc}</nav></aside>`;
 html=replaceElement(html,'post-layout',`<div class="post-layout">${main}${aside}</div>`);
 html=html.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/,`<h1 class="post-title">${e(p.title)}</h1>`).replace(/<p class="post-subtitle">[\s\S]*?<\/p>/,'');
 html=html.replace(/<span class="post-updated">[\s\S]*?<\/span>/g,'');
 html=html.replace(/<span class="post-author">[\s\S]*?<\/span>/,`<span class="post-author">بقلم <a href="${authorPath}" rel="author">رولا علوش</a></span>`);
 html=html.replace(/<span class="post-date">[\s\S]*?<\/span>/,`<span class="post-date"><time datetime="${published}">${dateLabel(published)}</time></span>`);
 if(p.category)html=html.replace(/<span class="post-category">[^<]*<\/span>/,`<span class="post-category">${e(p.category)}</span>`);
 const mr=elementRange(html,'post-meta');html=html.slice(0,mr.contentEnd)+`<span class="post-updated">آخر تحديث: <time datetime="${updated}">${dateLabel(updated)}</time></span>`+html.slice(mr.contentEnd);
 html=html.replace(/(<nav class="breadcrumb"[\s\S]*?<span>\/\s*<\/span><span>)[\s\S]*?(<\/span><\/nav>)/,'$1'+e(p.title)+'$2');
 html=html.replace(/<link rel="canonical" href="[^"]*">/,`<link rel="canonical" href="${url}">`);
 html=html.replace(/<title>[\s\S]*?<\/title>/,`<title>${e(p.title)} | رولا دايت</title>`);
 for(const key of ['description','twitter:description'])html=meta(html,key,p.summary);
 html=meta(html,'twitter:title',p.title);html=meta(html,'twitter:image',origin+'/images/blog/'+p.key+'-1280.webp');
 for(const [key,value] of Object.entries({'og:title':p.title,'og:description':p.summary,'og:url':url,'og:image':origin+'/images/blog/'+p.key+'-1280.webp','og:image:alt':p.coverAlt||descriptions[p.key],'article:author':origin+authorPath,'article:published_time':published,'article:modified_time':updated,'og:image:width':'1280','og:image:height':'720'}))html=meta(html,key,value,true);
 html=html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(all,json)=>{const data=JSON.parse(json);if(data['@type']==='BlogPosting'){Object.assign(data,{headline:p.title,description:p.summary,image:origin+'/images/blog/'+p.key+'-1280.webp',url,mainEntityOfPage:{'@type':'WebPage','@id':url},datePublished:published,dateModified:updated,wordCount,citation:p.sources.map(s=>s.url)});data.author={'@type':'Person','@id':authorId,name:'رولا علوش',url:origin+authorPath};delete data.about;}else if(data['@type']==='BreadcrumbList'){Object.assign(data.itemListElement[data.itemListElement.length-1],{name:p.title,item:url});}return '<script type="application/ld+json">'+JSON.stringify(data)+'</script>';});
 if(!html.includes('href="/css/blog-editorial.css"'))html=html.replace('</head>','<link rel="stylesheet" href="/css/blog-editorial.css"></head>');
 // Render the base layout and local fonts immediately; avoid a font/layout flash.
 html=html.replace(/<link\b[^>]*href="https:\/\/fonts\.googleapis\.com\/css2\?[^>]*>/g,'').replace(/<link rel="preconnect" href="https:\/\/fonts\.google(?:apis|static)\.com"[^>]*>/g,'');
 html=html.replace(/(<link rel="stylesheet" href="\.\.\/css\/(?:style|pages)\.css") media="print" onload='this.media="all"'>/g,'$1>');
 write(file,html);write('images/blog/visual-'+p.key+'.svg',diagram(p));
}
for(const file of ['index.html','المدونة.html']){
 let html=fs.readFileSync(root+'/'+file,'utf8');
 const daily=posts.filter(p=>p.workflow==='daily').sort((a,b)=>b.published.localeCompare(a.published));
 const dailyCard=(p)=>file==='index.html'?`<article class="blog-card"><a href="/blog/${p.slug}" class="blog-link"><div class="blog-image">${image(p)}</div><div class="blog-body"><div class="blog-meta"><span class="blog-date">${dateLabel(p.published)}</span><span class="blog-category">${e(p.category)}</span></div><h3 class="blog-title">${e(p.title)}</h3><p class="blog-excerpt">${e(p.summary)}</p><span class="blog-read-more">متابعة القراءة</span></div></a></article>`:`<article class="blog-item"><div class="blog-item-img"><a href="/blog/${p.slug}" aria-label="${e(p.title)}">${image(p)}</a></div><div class="blog-item-content"><span class="blog-item-cat">${e(p.category)}</span><h2><a href="/blog/${p.slug}">${e(p.title)}</a></h2><p>${e(p.summary)}</p><span class="blog-item-date">${dateLabel(p.published)}</span></div></article>`;
 const currentCards=[...html.matchAll(/<article class="blog-(?:item|card)">[\s\S]*?<\/article>/g)].map(m=>m[0]);
 const legacyCards=currentCards.filter(card=>!daily.some(p=>card.includes('href="/blog/'+p.slug+'"')));
 const cards=daily.map(dailyCard).concat(legacyCards);
 const grid=elementRange(html,file==='index.html'?'blog-grid':'blog-list');
 html=html.slice(0,grid.contentStart)+(file==='index.html'?cards.slice(0,3):cards).join('')+html.slice(grid.contentEnd);
 html=html.replace(/<article class="blog-(?:item|card)">[\s\S]*?<\/article>/g,card=>{
  const href=card.match(/href="\/blog\/([^"]+)"/);if(!href)return card;
  const p=posts.find(p=>p.slug===decodeURIComponent(href[1]));if(!p)throw Error('Unmapped article card '+href[1]);
  if(['injections','mounjaro','mounjaro-diet','injection-diet'].includes(p.key))card=card.replace(/(<span class="blog-item-cat">)[^<]*(<\/span>)/,'$1إبر التنحيف$2');
  card=card.replace(/<img\b[^>]*>/,image(p));
  card=card.replace(/(<h2><a\b[^>]*>)[\s\S]*?(<\/a><\/h2>)/,'$1'+e(p.title)+'$2');
  card=card.replace(/(<h3 class="blog-title">)[\s\S]*?(<\/h3>)/,'$1'+e(p.title)+'$2');
  card=card.replace(/<p(?: class="blog-excerpt")?>[\s\S]*?<\/p>/,`<p${file==='index.html'?' class="blog-excerpt"':''}>${e(p.summary)}</p>`);
  if(file==='المدونة.html')card=card.replace(/<div class="blog-item-img">([\s\S]*?)<\/div>/,`<div class="blog-item-img"><a href="/blog/${p.slug}" aria-label="${e(p.title)}">$1</a></div>`).replace(/(<div class="blog-item-img"><a\b[^>]*>)<a\b[^>]*>([\s\S]*?)<\/a>(<\/a><\/div>)/,'$1$2$3');
  return card;
 });
 if(file==='المدونة.html'){
  const categories=['الكل','الصحة والتغذية','صحة','تخطيط','أمومة','إبر التنحيف'];
  const labels=[...html.matchAll(/class="blog-item-cat">([^<]+)/g)].map(m=>m[1]);
  const links=categories.map((name,i)=>`<li><a href="#cat=${i}" data-category="${i?name:''}">${name}<span class="cat-count">(${i?labels.filter(x=>x===name).length:labels.length})</span></a></li>`).join('');
  html=replaceElement(html,'sidebar-categories',`<div class="sidebar-widget sidebar-categories"><h3>التصنيفات</h3><ul>${links}</ul></div>`);
  html=html.replace(/<script>[^<]*sidebar-categories[^<]*<\/script>/,'');
  if(!html.includes('src="/js/blog-index.js"'))html=html.replace('</body>','<script src="/js/blog-index.js" defer></script></body>');
 }
 write(file,html);
}
let map=fs.readFileSync(root+'/sitemap.xml','utf8');
for(const p of posts){const loc=origin+'/blog/'+encodeURIComponent(p.slug);const updated=p.updated||'2026-09-09';let found=false;map=map.replace(/<url>[\s\S]*?<\/url>/g,entry=>{const old=entry.match(/<loc>([^<]+)/)?.[1];if(!old||decodeURI(old)!==decodeURI(loc))return entry;found=true;return /<lastmod>/.test(entry)?entry.replace(/<lastmod>[^<]*<\/lastmod>/,`<lastmod>${updated}</lastmod>`):entry.replace('</url>',`<lastmod>${updated}</lastmod></url>`);});if(!found)map=map.replace('</urlset>',`<url><loc>${loc}</loc><lastmod>${updated}</lastmod></url>\n</urlset>`);}write('sitemap.xml',map);
console.log(`Enriched ${posts.length} articles, author links, unique images, CTAs and per-article dates.`);
