// Add a contextual entry point from each newly populated topic guide.
// Re-running does not duplicate links; the post: key follows future URL migrations.
const fs=require('node:fs');
const path=require('node:path');
const posts=require('./blog-catalog');
const taxonomy=require('../content/blog-taxonomy.json');
let changed=0;
for(const post of posts.filter(p=>p.publicationBatch==='complete-existing-topics-2026-09-13')){
 const file=path.join(__dirname,'../content/category-intros',taxonomy.articleTopics[post.key]+'.md');
 const text=fs.readFileSync(file,'utf8');
 if(text.includes('(post:'+post.key+')'))continue;
 fs.writeFileSync(file,text.trimEnd()+'\n\nللتوسع في خطوات هذا الموضوع، اقرئي دليل ['+post.title+'](post:'+post.key+'). يضم أمثلة عملية ومراجع رسمية وأسئلة تساعد على اختيار الخطوة التالية وفق احتياجاتك.\n');changed++;
}
console.log('Linked '+changed+' topic guides to their new articles.');
