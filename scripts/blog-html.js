const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function elementRange(html, className, tag = 'div') {
  const startTag = new RegExp('<'+tag+'\\b[^>]*class=["\'][^"\']*\\b'+className+'\\b[^"\']*["\'][^>]*>', 'i');
  const match = startTag.exec(html);
  if (!match) throw new Error('Missing '+className);
  const tokens = new RegExp('<\\/?'+tag+'\\b[^>]*>', 'gi');
  tokens.lastIndex = match.index + match[0].length;
  let depth = 1, token;
  while ((token = tokens.exec(html))) {
    depth += token[0].startsWith('</') ? -1 : 1;
    if (!depth) return {start:match.index, contentStart:match.index+match[0].length, contentEnd:token.index, end:tokens.lastIndex};
  }
  throw new Error('Unbalanced '+className);
}
function text(html) { return html.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim(); }
function write(file, value) { const full = path.join(root,file); fs.mkdirSync(path.dirname(full),{recursive:true}); if (!fs.existsSync(full)||fs.readFileSync(full,'utf8')!==value) fs.writeFileSync(full,value); }
module.exports={root,elementRange,text,write};
