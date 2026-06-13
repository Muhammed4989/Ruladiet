const fs = require('fs');
const html = fs.readFileSync('C:\\Users\\moham\\ruladiet-site\\course\\المسار-الصحي.html', 'utf8');
const patterns = ['https?:', 'vimeo', 'cdn', '.mp4', 'cloud', 'storage', 'drive', 'player', 'src='];
patterns.forEach(p => {
  const regex = new RegExp(p, 'gi');
  let match;
  while ((match = regex.exec(html)) !== null) {
    const start = Math.max(0, match.index - 30);
    const end = Math.min(html.length, match.index + 80);
    console.log(p + ':', html.substring(start, end));
  }
});
