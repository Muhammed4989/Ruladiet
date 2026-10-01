// Team names and roles confirmed by the owner on 2026-09-09.
const fs = require('node:fs');
const path = require('node:path');
const {elementRange} = require('./blog-html');
const root = path.resolve(__dirname, '..');
const file = path.join(root, 'الفريق.html');
const members = [
  {image:'/images/yasmin-team.webp', name:'ياسمين رسلان', role:'اختصاصية تغذية'},
  {image:'/images/menna-team.webp', name:'منة', role:'اختصاصية تغذية'},
  {image:'/images/abeer-team.webp', name:'عبير ناشد', role:'إدارية'},
  // Owner-supplied replacement portrait, 2026-09-30. Keep a new URL for caches.
  {image:'/images/shahd-team-20260930.webp', previousImage:'/images/shahd-team.webp', width:600, height:750, name:'شهد', role:'إدارة منصات التواصل'},
  {image:'/images/3-350x700.webp', name:'المهندس محمد الحسن', role:'تسويق رقمي'}
];
const original = fs.readFileSync(file,'utf8');
let html = original;
const grid = elementRange(html,'team-grid-new');
const oldGrid = html.slice(grid.contentStart,grid.contentEnd);
let offset = 0;
const cards = members.map(member=>{
  const range = elementRange(oldGrid.slice(offset),'team-member-card');
  const card = oldGrid.slice(offset+range.start,offset+range.end);
  offset += range.end;
  const acceptedImages = [member.image, member.previousImage].filter(Boolean);
  if(!acceptedImages.some(src=>card.includes('src="'+src+'"'))) throw new Error('Unexpected portrait for '+member.name);
  let image = card.match(/<img\b[^>]*>/)[0].replace(/\balt="[^"]*"/,'alt="'+member.name+'"');
  if(member.previousImage) {
    image = image.replace(/\bsrc="[^"]*"/, 'src="'+member.image+'"')
      .replace(/\bwidth="[^"]*"/, 'width="'+member.width+'"')
      .replace(/\bheight="[^"]*"/, 'height="'+member.height+'"')
      .replace(/\sstyle="[^"]*"/g, '')
      .replace(/\s*\/?>$/, ' style="object-fit:cover;object-position:50% 30%">');
  }
  return `<div class="team-member-card"><div class="team-avatar">${image}</div><h3 class="member-name">${member.name}</h3><p class="member-role">${member.role}</p></div>`;
}).join('');
html = html.slice(0,grid.contentStart)+cards+html.slice(grid.contentEnd);
html = html.replace(/(<h1 class="team-hero-title">)[\s\S]*?(<\/h1>)/,'$1تعرّف على فريق رولا دايت$2');
html = html.replace(/(<p class="team-hero-desc">)[\s\S]*?(<\/p>)/,'$1فريق التغذية والإدارة والتواصل في رولا دايت، معك في رحلتك الصحية$2');
const description = 'تعرّف على فريق رولا دايت في التغذية والإدارة ومنصات التواصل والتسويق الرقمي.';
for(const [attribute,key] of [['name','description'],['property','og:description'],['name','twitter:description']]){
  const re = new RegExp('<meta '+attribute+'="'+key+'" content="[^"]*">');
  html = html.replace(re,`<meta ${attribute}="${key}" content="${description}">`);
}
html = html.replace(/<meta name="twitter:title" content="[^"]*">/,'<meta name="twitter:title" content="الفريق - رولا دايت">');
if(html!==original) fs.writeFileSync(file,html);
console.log(JSON.stringify(members.map(({name,role})=>({name,role})),null,2));
