const data = require('../content/blog-taxonomy.json');
const {escape:e} = require('./blog-visuals');
const origin = 'https://ruladiet.com';
const categories = data.categories;
const seen = new Set();
for (const category of categories) {
  for (const item of [category, ...category.topics]) {
    // Category IDs and topic IDs have separate namespaces.
    const key = (item === category ? 'category:' : 'topic:') + item.id;
    if (seen.has(key)) throw Error('Duplicate taxonomy ID: ' + key);
    seen.add(key);
  }
}
function categoryPath(category) { return '/blog/category/' + category.slug; }
function topicPath(category, topic) { return categoryPath(category) + '/' + topic.slug; }
function postPath(post) {
  const {category,topic}=post.taxonomy||postTaxonomy(post.key).taxonomy;
  return topicPath(category,topic)+'/'+post.slug;
}
function postFile(post) { return postPath(post).slice(1)+'.html'; }
function postTaxonomy(key) {
  const id = data.articleTopics[key];
  for (const category of categories) {
    const topic = category.topics.find(topic => topic.id === id);
    if (topic) return {category: topic.name, taxonomy: {category, topic}};
  }
  throw Error('Assign article ' + key + ' to one existing topic in content/blog-taxonomy.json');
}
const baseCrumbs = [{name:'الرئيسية', path:'/'}, {name:'المدونة', path:'/المدونة'}];
function trail(category, topic, post) {
  const items = [...baseCrumbs];
  if (category) items.push({name:category.name, path:categoryPath(category)});
  if (topic) items.push({name:topic.name, path:topicPath(category,topic)});
  if (post) items.push({name:post.title, path:postPath(post)});
  return items;
}
function breadcrumb(items) {
  return '<nav class="breadcrumb blog-breadcrumb" aria-label="مسار التنقل"><ol>' + items.map((item,i) => '<li>' + (i===items.length-1 ? '<span aria-current="page">'+e(item.name)+'</span>' : '<a href="'+e(item.path)+'">'+e(item.name)+'</a>') + '</li>').join('') + '</ol></nav>';
}
function breadcrumbSchema(items) {
  return {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map((item,i)=>({'@type':'ListItem',position:i+1,name:item.name,item:origin+encodeURI(item.path)}))};
}
module.exports = {categories, categoryPath, topicPath, postPath, postFile, postTaxonomy, trail, breadcrumb, breadcrumbSchema};
