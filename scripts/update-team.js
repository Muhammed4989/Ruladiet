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
  {image:'/images/shahd-team.webp', name:'شهد', role:'إدارة منصات التواصل'},
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
  if(!card.includes('src="'+member.image+'"')) throw new Error('Unexpected portrait for '+member.name);
  const image = card.match(/<img\b[^>]*>/)[0].replace(/\balt="[^"]*"/,'alt="'+member.name+'"');
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
