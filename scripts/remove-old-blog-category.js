// Remove generated pages at the former /blog/category/... paths only after
// their matching /blog/... replacements have been rendered successfully.
const fs=require('node:fs');
const path=require('node:path');
const {root}=require('./blog-html');

function removeOldBlogCategory(){
 const previousRoot=path.resolve(root,'blog','category');
 if(!fs.existsSync(previousRoot))return 0;
 const files=[];
 function collect(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
   const full=path.resolve(dir,entry.name);
   if(entry.isDirectory())collect(full);
   else if(entry.isFile()&&entry.name.endsWith('.html'))files.push(full);
   else throw Error('Unexpected file in old blog hierarchy: '+full);
  }
 }
 collect(previousRoot);
 const blogRoot=path.resolve(root,'blog')+path.sep;
 const replacements=files.map(old=>{
  const relative=path.relative(previousRoot,old);
  const replacement=path.resolve(root,'blog',relative);
  if(!old.startsWith(previousRoot+path.sep)||!replacement.startsWith(blogRoot))throw Error('Unsafe blog migration path: '+old);
  if(!fs.existsSync(replacement))throw Error('Missing replacement for old blog page: '+relative);
  return old;
 });
 for(const file of replacements)fs.unlinkSync(file);
 console.log(`Removed ${replacements.length} generated pages from the previous /blog/category/ hierarchy.`);
 return replacements.length;
}
if(require.main===module)removeOldBlogCategory();
module.exports=removeOldBlogCategory;
