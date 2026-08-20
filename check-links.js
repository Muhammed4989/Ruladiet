const fs = require('fs');
const html = fs.readFileSync('C:/Users/moham/ruladiet-site/index.html', 'utf8');

const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
let match;
const links = [];

while ((match = linkRegex.exec(html)) !== null) {
  const href = match[1];
  const text = match[2].replace(/<[^>]+>/g, '').trim().substring(0, 40);
  if (href && !href.startsWith('#') && !href.startsWith('tel:') && !href.startsWith('mailto:')) {
    links.push({ href, text });
  }
}

console.log('=== ALL LINKS ===');
links.forEach(l => console.log(l.href));
