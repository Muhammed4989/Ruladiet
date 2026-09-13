const fs=require('node:fs');
const {root,write}=require('./blog-html');
const {descriptions,escape:e}=require('./blog-visuals');
const {categories,categoryPath,topicPath,postPath,postFile,trail,breadcrumb,breadcrumbSchema}=require('./blog-taxonomy');
const origin='https://ruladiet.com';
const intros=require('../content/blog-category-intros.json');
const jsonScript=data=>'<script type="application/ld+json">'+JSON.stringify(data).replace(/</g,'\\u003c')+'</script>';
function buildArchives(){
 const posts=require('./blog-catalog').map(p=>{
  const html=fs.readFileSync(root+'/'+postFile(p),'utf8');
  const schema=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1])).find(s=>s['@type']==='BlogPosting');
  return {...p,published:schema.datePublished};
 }).sort((a,b)=>b.published.localeCompare(a.published)||a.slug.localeCompare(b.slug,'ar'));
 const categoryPosts=c=>posts.filter(p=>p.taxonomy.category.id===c.id);
 const topicPosts=t=>posts.filter(p=>p.taxonomy.topic.id===t.id);
 const countLabel=n=>n===0?'قيد الإعداد':n===1?'مقال واحد':n===2?'مقالان':n<=10?n+' مقالات':n+' مقالاً';
 const card=p=>`<article class="blog-item"><div class="blog-item-img"><a href="${postPath(p)}" aria-label="${e(p.title)}"><img src="/images/blog/${p.key}-400.webp" srcset="/images/blog/${p.key}-400.webp 400w, /images/blog/${p.key}-800.webp 800w, /images/blog/${p.key}-1280.webp 1280w" sizes="(max-width:700px) calc(100vw - 40px), 280px" width="400" height="225" loading="lazy" decoding="async" alt="${e(p.coverAlt||descriptions[p.key])}"></a></div><div class="blog-item-content"><a class="blog-item-cat" href="${topicPath(p.taxonomy.category,p.taxonomy.topic)}">${e(p.category)}</a><h2><a href="${postPath(p)}">${e(p.title)}</a></h2><p>${e(p.summary)}</p><time class="blog-item-date" datetime="${p.published}">${new Intl.DateTimeFormat('ar-u-nu-latn',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(p.published+'T12:00:00Z'))}</time></div></article>`;
 function categoryCards(){return `<section class="taxonomy-section" aria-labelledby="blog-categories-title"><h2 id="blog-categories-title">تصفّحي حسب اهتمامك</h2><div class="taxonomy-grid">${categories.map(c=>`<article class="taxonomy-card"><a class="taxonomy-card-heading" href="${categoryPath(c)}"><h3>${e(c.name)}</h3><span>${countLabel(categoryPosts(c).length)} <span aria-hidden="true">←</span></span></a><p>${e(c.description)}</p><ul>${c.topics.map(t=>`<li><a href="${topicPath(c,t)}">${e(t.name)}</a>${topicPosts(t).length?'':' <small>قيد الإعداد</small>'}</li>`).join('')}</ul></article>`).join('')}</div></section>`;}
 function sidebar(category,topic){return `<aside class="blog-sidebar"><nav class="sidebar-widget taxonomy-nav" aria-label="أقسام المدونة"><h2>أقسام المدونة</h2><a class="taxonomy-all" href="/المدونة"${category?'':' aria-current="page"'}>جميع المقالات <span>${posts.length}</span></a>${categories.map(c=>`<details${category?.id===c.id?' open':''}><summary>${e(c.name)} <span>${categoryPosts(c).length}</span></summary><a class="taxonomy-parent" href="${categoryPath(c)}"${category?.id===c.id&&!topic?' aria-current="page"':''}>كل مقالات ${e(c.name)}</a><ul>${c.topics.map(t=>`<li><a href="${topicPath(c,t)}"${topic?.id===t.id?' aria-current="page"':''}>${e(t.name)} <span>${countLabel(topicPosts(t).length)}</span></a></li>`).join('')}</ul></details>`).join('')}</nav><div class="sidebar-widget taxonomy-author"><a href="/author/rulaalloush" rel="author"><img src="/images/rulamain.webp" width="100" height="100" loading="lazy" alt="اختصاصية التغذية رولا علوش"><h2>بقلم رولا علوش</h2></a><p>اختصاصية تغذية وكاتبة في التوعية الغذائية.</p><a href="/author/rulaalloush">عن الكاتبة ومقالاتها المنشورة ←</a></div></aside>`;}
 let shell=fs.readFileSync(root+'/المدونة.html','utf8');
 shell=shell.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g,'').replace(/<meta name="keywords"[^>]*>/g,'');
 shell=shell.replace(/((?:href|src)=")(?:\.\.\/)?(css|js|images|fonts)\//g,'$1/$2/');
 shell=shell.replace(/<link\b[^>]*href="https:\/\/fonts\.googleapis\.com\/css2\?[^>]*>/g,'').replace(/<link rel="preconnect" href="https:\/\/fonts\.google(?:apis|static)\.com"[^>]*>/g,'');
 shell=shell.replace(/(<link rel="stylesheet" href="\/css\/(?:style|pages)\.css") media="print" onload='this.media="all"'>/g,'$1>');
 for(const file of ['blog-editorial','blog-taxonomy'])if(!shell.includes('href="/css/'+file+'.css"'))shell=shell.replace('</head>',`<link rel="stylesheet" href="/css/${file}.css"></head>`);
 if(!shell.includes('src="/js/blog-index.js"'))shell=shell.replace('</body>','<script src="/js/blog-index.js" defer></script></body>');
 const pages=[{path:'/المدونة',title:'مدونة رولا دايت',description:'مقالات رولا علوش في التغذية وصحة المرأة وإدارة الوزن وتغذية الأسرة. اختاري التصنيف والموضوع للوصول إلى قراءة تناسب أسئلتك.',posts}];
 for(const category of categories){
  pages.push({path:categoryPath(category),title:category.name,description:category.description,posts:categoryPosts(category),category});
  for(const topic of category.topics)pages.push({path:topicPath(category,topic),title:topic.name,description:topic.description,posts:topicPosts(topic),category,topic});
 }
 for(const page of pages){
  const {category,topic}=page;
  const crumbs=trail(category,topic);
  let intro='';
  if(!category)intro=categoryCards();
  else if(!topic)intro=`<section class="taxonomy-section" aria-labelledby="blog-topics-title"><h2 id="blog-topics-title">موضوعات ${e(category.name)}</h2><div class="taxonomy-topics">${category.topics.map(t=>`<a href="${topicPath(category,t)}"><strong>${e(t.name)}</strong><span>${countLabel(topicPosts(t).length)} <span aria-hidden="true">←</span></span></a>`).join('')}</div></section>`;
  const related=page.posts.length?[]:categoryPosts(category).slice(0,3);
  const listing=page.posts.length?`<h2 class="archive-list-title">${category?'مقالات '+e(page.title):'أحدث المقالات'} <span>${countLabel(page.posts.length)}</span></h2><div class="blog-list">${page.posts.map(card).join('')}</div>`:`<section class="taxonomy-empty"><h2>مقالات هذا القسم قيد الإعداد</h2><p>نحضّر محتوى متخصصاً في ${e(topic.name)}. إلى حين نشره، يمكنك تصفّح مقالات ${e(category.name)} المتاحة.</p><a href="${categoryPath(category)}">تصفّحي ${e(category.name)} ←</a></section>${related.length?'<h2 class="archive-list-title">من مقالات '+e(category.name)+'</h2><div class="blog-list">'+related.map(card).join('')+'</div>':''}`;
  const shortcuts=category?'':'<nav class="archive-shortcuts" aria-label="انتقال سريع"><a href="#blog-categories-title">تصفّح التصنيفات</a><a href="#أحدث-المقالات">أحدث المقالات ↓</a></nav>';
  let introduction=`<p>${e(page.description)}</p>`;
  if(category){
   const paragraphs=topic?intros.topics[topic.id]:intros.categories[category.id];
   if(!paragraphs?.length)throw Error('Write a unique category introduction for '+page.path);
   const copy=[page.description+' '+paragraphs[0],...paragraphs.slice(1)];
   introduction=`<section class="archive-intro" data-archive-intro aria-label="عن ${e(page.title)}"><div class="archive-intro-copy" id="archive-intro-copy">${copy.map(p=>'<p>'+e(p)+'</p>').join('')}</div><button class="archive-intro-toggle" type="button" aria-expanded="true" aria-controls="archive-intro-copy" hidden>قراءة المزيد</button></section>`;
  }
  const main=`<main class="blog-archive"><section class="page-hero"><div class="container">${breadcrumb(crumbs)}<div class="blog-header"><h1>${e(page.title)}</h1>${introduction}${shortcuts}</div></div></section><div class="blog-page"><div class="container">${intro}<div class="blog-layout"><div class="blog-main"${category?'':' id="أحدث-المقالات"'}>${listing}</div>${sidebar(category,topic)}</div></div></div></main>`;
  let html=shell.replace(/<main\b[^>]*>[\s\S]*?<\/main>/,main);
  html=html.replace(/<title>[\s\S]*?<\/title>/,`<title>${e(page.title)} | رولا دايت</title>`).replace(/<link rel="canonical" href="[^"]*">/,`<link rel="canonical" href="${origin+encodeURI(page.path)}">`);
  const metas={'description':page.description,'robots':page.posts.length?'index, follow':'noindex, follow','og:title':page.title+' | رولا دايت','og:description':page.description,'og:url':origin+encodeURI(page.path)};
  for(const [name,value] of Object.entries(metas))html=html.replace(new RegExp('<meta (?:name|property)="'+name+'"[^>]*>'),`<meta ${name.startsWith('og:')?'property':'name'}="${name}" content="${e(value)}">`);
  const schema={'@context':'https://schema.org','@type':'CollectionPage',name:page.title,description:page.description,url:origin+encodeURI(page.path),inLanguage:'ar',isPartOf:{'@type':'WebSite',name:'رولا دايت',url:origin},mainEntity:{'@type':'ItemList',numberOfItems:page.posts.length,itemListElement:page.posts.map((p,i)=>({'@type':'ListItem',position:i+1,name:p.title,url:origin+encodeURI(postPath(p))}))}};
  html=html.replace('</head>',jsonScript(breadcrumbSchema(crumbs))+jsonScript(schema)+'</head>');
  write(page.path.slice(1)+'.html',html);
 }
 const archivePaths=new Set(pages.filter(p=>p.category).map(p=>origin+p.path));
 let sitemap=fs.readFileSync(root+'/sitemap.xml','utf8').replace(/<url>[\s\S]*?<\/url>\s*/g,entry=>archivePaths.has(decodeURI(entry.match(/<loc>([^<]+)/)?.[1]||''))?'':entry);
 const entries=pages.filter(p=>p.category&&p.posts.length).map(p=>'<url><loc>'+origin+encodeURI(p.path)+'</loc></url>').join('\n');
 sitemap=sitemap.replace('</urlset>',entries+'\n</urlset>');write('sitemap.xml',sitemap);
 console.log(`Built blog index, ${categories.length} category pages and ${pages.length-categories.length-1} topic pages; ${pages.filter(p=>p.category&&p.posts.length).length} populated archives in sitemap.`);
}
if(require.main===module)buildArchives();
module.exports=buildArchives;
