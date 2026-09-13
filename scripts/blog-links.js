const posts=require('./blog-catalog');
const {postPath}=require('./blog-taxonomy');
const origin='https://ruladiet.com';
const routes=new Map(posts.map(p=>['/blog/'+p.slug,postPath(p)]));
function canonicalBlogPath(route) {
  return routes.get(decodeURI(route).replace(/\/$/,'').replace(/\.html$/,''))||route;
}
// Handles root-relative links, absolute links, JSON-LD URLs, query strings and
// fragments without touching their labels or unrelated destinations.
function rewriteBlogLinks(html) {
  return html.replace(/(["'])(https:\/\/ruladiet\.com)?(\/blog\/[^"'<>]*)\1/g,(all,quote,host,route)=>{
    const url=new URL(route.replace(/&amp;/g,'&'),origin);
    const destination=canonicalBlogPath(url.pathname);
    if(destination===url.pathname)return all;
    return quote+(host?origin:'')+(host?encodeURI(destination):destination)+url.search.replace(/&/g,'&amp;')+url.hash+quote;
  });
}
module.exports={canonicalBlogPath,rewriteBlogLinks};
