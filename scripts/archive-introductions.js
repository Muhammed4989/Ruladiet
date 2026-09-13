const fs=require('node:fs');
const path=require('node:path');
const {root}=require('./blog-html');
const {escape:e}=require('./blog-visuals');
const {categories,categoryPath,topicPath,postPath}=require('./blog-taxonomy');
const manifest=require('../content/blog-category-intros.json');
const sources=require('../content/category-guide-sources.json').sources;
function destination(value){
 if(value.startsWith('ref:')){
  const url=sources[value.slice(4)];
  if(!url)throw Error('Unknown archive reference: '+value);
  return url;
 }
 if(value.startsWith('post:')){
  const post=require('./blog-catalog').find(p=>p.key===value.slice(5));
  if(!post)throw Error('Unknown linked article: '+value);
  return postPath(post);
 }
 if(value.startsWith('category:')){
  const category=categories.find(c=>c.id===value.slice(9));
  if(!category)throw Error('Unknown linked category: '+value);
  return categoryPath(category);
 }
 if(value.startsWith('topic:')){
  for(const category of categories){const topic=category.topics.find(t=>t.id===value.slice(6));if(topic)return topicPath(category,topic);}
  throw Error('Unknown linked topic: '+value);
 }
 if(/^\/(?!\/)[^\s<>"']+$/.test(value))return value;
 throw Error('Archive links must use verified references or local destinations: '+value);
}
function inline(source,links=[]){
 let result='',last=0;
 for(const match of source.matchAll(/\[([^\[\]\n]+)\]\(([^\s)]+)\)/g)){
  const href=destination(match[2]);links.push({label:match[1],href});
  result+=e(source.slice(last,match.index))+'<a href="'+e(encodeURI(href))+'">'+e(match[1])+'</a>';
  last=match.index+match[0].length;
 }
 result+=e(source.slice(last));
 if(/\]\(/.test(result.replace(/<a\b[^>]*>[\s\S]*?<\/a>/g,'')))throw Error('Invalid Markdown link');
 return result;
}
function introduction(category,topic){
 const id=(topic||category).id;
 const file=(topic?manifest.topics:manifest.categories)[id];
 if(!file||!/^[-a-z]+\.md$/.test(file))throw Error('Missing category guide: '+id);
 const source=fs.readFileSync(path.join(root,'content/category-intros',file),'utf8').trim();
 const blocks=source.split(/\r?\n\s*\r?\n/).map(b=>b.replace(/\r?\n/g,' ').trim());
 if(blocks[0].startsWith('#'))throw Error('Guide must start with a paragraph: '+id);
 if(blocks[0].includes(']('))throw Error('Keep the collapsed lead free of links: '+id);
 const links=[],paragraphs=[];
 const html=blocks.map((block,index)=>{
  if(block.startsWith('## '))return '<h2>'+e(block.slice(3))+'</h2>';
  if(block.startsWith('#')||/<\/?[a-z]/i.test(block))throw Error('Unsupported guide markup: '+id);
  paragraphs.push(block.replace(/\[([^\]]+)\]\([^)]+\)/g,'$1'));
  const lead=index===0?e((topic||category).description)+' ':'';
  return '<p>'+lead+inline(block,links)+'</p>';
 }).join('');
 const words=paragraphs.join(' ').split(/\s+/u).filter(w=>/[\p{L}\p{N}]/u.test(w)).length;
 if(words<500)throw Error('Guide '+id+' has '+words+' body words; 500 required');
 const internal=links.filter(l=>l.href.startsWith('/')),external=links.filter(l=>l.href.startsWith('https://'));
 if(internal.length<3||external.length<2)throw Error('Guide '+id+' needs 3 internal links and 2 primary references');
 return {id,file,source,html,words,links,paragraphs};
}
module.exports={introduction,destination,inline};
