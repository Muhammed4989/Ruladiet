// Notify participating search engines only after the canonical production URLs
// are deployed. Dry-run by default; no Google Indexing API is used.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const { keyFile } = require('../content/search-indexing.json');
const origin = 'https://ruladiet.com';
const endpoint = 'https://api.indexnow.org/indexnow';
const args = process.argv.slice(2);
const submit = args.includes('--submit');
const all = args.includes('--all');
const explicit = args.filter(a=>!a.startsWith('--'));
assert(args.every(a=>!a.startsWith('--')||['--all','--submit'].includes(a)), 'Unknown flag');
assert(all !== (explicit.length > 0), 'Use --all OR a list of canonical URLs');
assert(/^[a-f0-9]{32}\.txt$/.test(keyFile), 'Invalid verification filename');
const key = fs.readFileSync(path.join(root,keyFile),'utf8').trim();
assert.equal(keyFile,key+'.txt');
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(m=>[m[1].toLowerCase(),m[2]]));
async function get(url) {
  const r = await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(25000)});
  assert.equal(r.status,200, 'Expected live HTTP 200: '+url+' ('+r.status+')');
  return {body:await r.text(),robots:r.headers.get('x-robots-tag')||'',type:r.headers.get('content-type')||''};
}
(async()=>{
  const sitemap = await get(origin+'/sitemap.xml');
  assert(/xml/i.test(sitemap.type),'Sitemap must be XML');
  const sitemapUrls=[...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1].replaceAll('&amp;','&')).href);
  assert(sitemapUrls.length>0,'Empty production sitemap');
  const urls=[...new Set((all?sitemapUrls:explicit).map(u=>new URL(u).href))];
  assert(urls.length>0&&urls.length<=10000,'Invalid batch size');
  for(const url of urls){
    const u=new URL(url);
    assert(u.origin===origin&&!u.search&&!u.hash&&!u.username&&!u.password,'Only canonical ruladiet.com URLs');
    assert(sitemapUrls.includes(url),'URL must be in the production sitemap: '+url);
  }
  const verification = await get(origin+'/'+keyFile);
  assert.equal(verification.body.trim(),key,'Production ownership key does not match');
  let next=0;
  await Promise.all(Array.from({length:4},async()=>{
    while(next<urls.length){
      const url=urls[next++]; const page=await get(url);
      assert(/text\/html/i.test(page.type),'Expected HTML page: '+url);
      const tags=[...page.body.matchAll(/<(?:meta|link)\b[^>]*>/gi)].map(m=>attributes(m[0]));
      const robots=tags.filter(t=>['robots','bingbot'].includes(t.name)).map(t=>t.content).join(';')+page.robots;
      assert(!/noindex/i.test(robots),'Refusing a noindex page: '+url);
      const canonical=tags.filter(t=>t.rel==='canonical');
      assert(canonical.length===1&&new URL(canonical[0].href).href===url,'Noncanonical URL: '+url);
    }
  }));
  if(!submit){console.log(JSON.stringify({mode:'dry-run',validatedUrls:urls.length,urls},null,2));return;}
  const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json; charset=utf-8'},body:JSON.stringify({host:'ruladiet.com',key,keyLocation:origin+'/'+keyFile,urlList:urls}),signal:AbortSignal.timeout(45000)});
  const result={submittedAt:new Date().toISOString(),endpoint,status:response.status,submittedUrls:urls.length,urls,meaning:response.status===200?'Received; indexing is not guaranteed':response.status===202?'Received; key validation pending':'Submission failed'};
  console.log(JSON.stringify(result,null,2));
  assert([200,202].includes(response.status),'IndexNow submission failed; do not blindly retry or bypass rate limits');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
