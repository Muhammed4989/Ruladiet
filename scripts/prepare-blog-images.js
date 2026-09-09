// Optional source folder contains the original generated PNGs (one per catalog key).
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const {root} = require('./blog-html');
const posts = require('./blog-catalog');
async function main() {
  const source = process.argv[2];
  const out = path.join(root,'images/blog');
  fs.mkdirSync(out,{recursive:true});
  for (const p of posts) {
    const master = path.join(out,p.key+'-1280.webp');
    if (source) await sharp(path.resolve(source,p.key+'.png')).resize(1280,720,{fit:'cover'}).webp({quality:84,effort:6}).toFile(master);
    for (const width of [400,800]) await sharp(master).resize(width,Math.round(width*9/16)).webp({quality:80,effort:6}).toFile(path.join(out,p.key+'-'+width+'.webp'));
  }
  console.log('Prepared 17 unique covers in three responsive sizes.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
