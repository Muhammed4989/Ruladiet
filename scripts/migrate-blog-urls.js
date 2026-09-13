const fs=require('node:fs');
const path=require('node:path');
const {root,write}=require('./blog-html');
const posts=require('./blog-catalog');
const {postPath,postFile}=require('./blog-taxonomy');
const {canonicalBlogPath,rewriteBlogLinks}=require('./blog-links');
function migrate(){
 // Fail before removing any original if its replacement was not rendered.
 for(const p of posts)if(!fs.existsSync(path.join(root,postFile(p))))throw Error('Render canonical article first: '+p.key);
 const walk=(dir,recursive=true)=>fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(entry=>{
  const file=path.posix.join(dir,entry.name);
  return entry.isDirectory()?(recursive?walk(file):[]):entry.name.endsWith('.html')?[file]:[];
 });
 const files=[...walk('',false),...walk('blog'),...walk('course'),...walk('author'),...walk('content/blog')];
 let changed=0;
 for(const file of files){const before=fs.readFileSync(path.join(root,file),'utf8');const after=rewriteBlogLinks(before);if(before!==after){write(file,after);changed++;}}
 const mappings=JSON.parse(fs.readFileSync(root+'/scripts/legacy-redirects.json','utf8'));
 for(const mapping of mappings)mapping.destination=canonicalBlogPath(mapping.destination);
 for(const p of posts){
  const destination=postPath(p);
  for(const source of ['/blog/'+p.slug,'/blog/'+p.slug+'.html']){
   const current=mappings.find(m=>m.source===source);
   if(current&&current.destination!==destination)throw Error('Published article path changed; add a redirect from its previous hierarchical URL: '+p.key);
   if(!current)mappings.push({source,destination});
  }
 }
 write('scripts/legacy-redirects.json',JSON.stringify(mappings,null,2)+'\n');
 const blogRoot=path.resolve(root,'blog')+path.sep;
 for(const p of posts){
  const old=path.resolve(root,'blog',p.slug+'.html');
  if(!old.startsWith(blogRoot)||path.dirname(old)!==path.resolve(root,'blog'))throw Error('Unsafe old article path: '+old);
  if(fs.existsSync(old))fs.unlinkSync(old); // Single tracked file; replacement checked above, recoverable in Git.
 }
 console.log(`Migrated internal blog links in ${changed} files; ${posts.length} canonical article paths retain permanent legacy redirects.`);
}
if(require.main===module)migrate();
module.exports=migrate;
