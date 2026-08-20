const fs = require('fs');
const dir = 'C:/Users/moham/ruladiet-site';
const files = fs.readdirSync(dir);
const target = files.find(f => f.endsWith('.html') && f.startsWith('ال') && f.includes('فريق'));
if (!target) { console.log('Not found'); process.exit(1); }

console.log('File:', target);

const content = fs.readFileSync(dir + '/' + target, 'utf8');
console.log('Size:', content.length, 'bytes');

// Look at the title and description
const headEnd = content.indexOf('</head>');
console.log('HEAD section:');
console.log(content.substring(0, headEnd).substring(0, 2000));

// Body content first 500 chars
const bodyStart = content.indexOf('<main>');
if (bodyStart > 0) {
  console.log('\nBODY first 500 chars:');
  console.log(content.substring(bodyStart, bodyStart + 500));
}
