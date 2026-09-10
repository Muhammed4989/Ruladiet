const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const mappings = require('./legacy-redirects.json');
const configPath = path.join(root, 'vercel.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Vercel matches percent-encoded pathnames case-sensitively. Keep the readable
// migration map separate and support either hex case within each Arabic segment.
function sourcePattern(source) {
  return source.split('/').map((segment, index) => {
    if (!/[^\x00-\x7F]/.test(segment)) return segment;
    const pattern = encodeURIComponent(segment).replace(/[A-F]/g, letter => '[' + letter.toLowerCase() + letter + ']');
    return ':legacy' + index + '(' + pattern + ')';
  }).join('/');
}
const redirects = mappings.flatMap(({ source, destination }) => {
  const variants = source.endsWith('/') ? [source] : [source, source + '/'];
  return variants.map(variant => ({ source: sourcePattern(variant), destination: encodeURI(destination), permanent: true }));
});
config.redirects = [...redirects,
  { source: '/course/:slug.html', destination: '/course/:slug', permanent: true },
  { source: '/blog/:slug.html', destination: '/blog/:slug', permanent: true },
  { source: '/author/:slug.html', destination: '/author/:slug', permanent: true },
];
const before = fs.readFileSync(configPath, 'utf8');
const after = JSON.stringify(config, null, 2) + '\n';
if (before !== after) fs.writeFileSync(configPath, after, 'utf8');
console.log(JSON.stringify({ mappings: mappings.length, redirects: config.redirects.length, changed: before !== after }));
