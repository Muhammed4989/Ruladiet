const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const mappings = require('./legacy-redirects.json');
const posts=require('./blog-catalog');
const {categories,categoryPath,topicPath,postPath}=require('./blog-taxonomy');
const configPath = path.join(root, 'vercel.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Vercel matches percent-encoded pathnames case-sensitively. Keep the readable
// migration map separate and support either hex case within each Arabic segment.
function sourcePattern(source, optionalHtml = false) {
  return source.split('/').map((segment, index) => {
    if (!/[^\x00-\x7F]/.test(segment)) return segment;
    const pattern = encodeURIComponent(segment).replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/[A-F]/g, letter => '[' + letter.toLowerCase() + letter + ']');
    const suffix = optionalHtml && index === source.split('/').length - 1 ? '(?:\\.html)?' : '';
    return ':legacy' + index + '(' + pattern + suffix + ')';
  }).join('/');
}
// Keep both readable migration entries, but combine equivalent Arabic bare and
// .html paths in a noncapturing optional suffix. Repeating long percent-encoded
// paths pushed the daily configuration past Vercel's accepted file size.
const bySource = new Map(mappings.map(mapping => [mapping.source, mapping]));
const redirects = mappings.flatMap(({ source, destination }) => {
  const bare = source.endsWith('.html') ? source.slice(0, -5) : null;
  if (bare && /[^\x00-\x7F]/.test(bare.split('/').at(-1)) && bySource.get(bare)?.destination === destination) return [];
  const optionalHtml = /[^\x00-\x7F]/.test(source.split('/').at(-1)) && bySource.get(source + '.html')?.destination === destination;
  const pattern = sourcePattern(source, optionalHtml);
  const variants = source.endsWith('/') ? [pattern] : [pattern, pattern + '/'];
  return variants.map(variant => ({ source: variant, destination: encodeURI(destination), permanent: true }));
});
const canonicalVariants=posts.flatMap(p=>[postPath(p)+'/',postPath(p)+'.html',postPath(p)+'.html/'].map(source=>({source:sourcePattern(source),destination:encodeURI(postPath(p)),permanent:true})));
const archivePaths=categories.flatMap(category=>[categoryPath(category),...category.topics.map(topic=>topicPath(category,topic))]);
// A single wildcard covers every previously published category/topic/article
// path, keeping vercel.json small enough for deployment configuration limits.
const previousHierarchy={source:'/blog/category/:path*',destination:'/blog/:path*',permanent:true};
const canonicalArchives=archivePaths.flatMap(destination=>[destination+'/',destination+'.html',destination+'.html/'].map(source=>({source:sourcePattern(source),destination:encodeURI(destination),permanent:true})));
config.redirects = [...redirects,previousHierarchy,...canonicalVariants,...canonicalArchives,
  { source: '/course/:slug.html', destination: '/course/:slug', permanent: true },
  { source: '/blog/:slug.html', destination: '/blog/:slug', permanent: true },
  { source: '/author/:slug.html', destination: '/author/:slug', permanent: true },
];
const before = fs.readFileSync(configPath, 'utf8');
const after = JSON.stringify(config, null, 2) + '\n';
if (before !== after) fs.writeFileSync(configPath, after, 'utf8');
console.log(JSON.stringify({ mappings: mappings.length, redirects: config.redirects.length, changed: before !== after }));
