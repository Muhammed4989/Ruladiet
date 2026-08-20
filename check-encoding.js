const fs = require('fs');

const htmlFiles = [
  'C:/Users/moham/ruladiet-site/??????.html',
  'C:/Users/moham/ruladiet-site/احجز-موعد.html',
  'C:/Users/moham/ruladiet-site/المدونة.html',
  'C:/Users/moham/ruladiet-site/index.html'
];

// Use fs.readdir to get the files properly
const dir = 'C:/Users/moham/ruladiet-site';
fs.readdir(dir, (err, files) => {
  if (err) {
    console.error(err);
    return;
  }
  
  const htmlFiles = files.filter(f => f.endsWith('.html') && f !== '404.html' && f !== 'index.html');
  
  htmlFiles.forEach(file => {
    const content = fs.readFileSync(dir + '/' + file, 'utf8');
    const titleMatch = content.match(/<title>([^<]+)<\/title>/);
    const descMatch = content.match(/<meta name="description" content="([^"]+)"/);
    const langMatch = content.match(/lang="([^"]+)"/);
    
    console.log(file + ':');
    console.log('  Title: ' + (titleMatch ? titleMatch[1] : 'N/A'));
    console.log('  Description: ' + (descMatch ? descMatch[1] : 'N/A'));
    console.log('  lang: ' + (langMatch ? langMatch[1] : 'N/A'));
    
    // Check for problematic encoding in meta tags
    if (titleMatch && titleMatch[1].indexOf('\uFFFD') !== -1) {
      console.log('  ** BROKEN: Title contains replacement characters');
    }
    if (descMatch && descMatch[1].indexOf('\uFFFD') !== -1) {
      console.log('  ** BROKEN: Description contains replacement characters');
    }
    
    console.log('---');
  });
});
