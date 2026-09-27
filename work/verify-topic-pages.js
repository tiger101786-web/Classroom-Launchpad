const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const src=fs.readFileSync('app.js','utf8');
const fn=src.slice(src.indexOf('function renderThreadTable('),src.indexOf('function renderThreadRow('));
const ctx=vm.createContext({coltCornerTopicPage:1,COLT_CORNER_TOPICS_PER_PAGE:15,renderThreadRow:t=>`<article data-topic="${t.id}"></article>`,emptyCard:t=>t});
vm.runInContext(fn,ctx);
for(const count of [0,1,15,16,30,31,100]){
 ctx.threads=Array.from({length:count},(_,id)=>({id}));
 const pages=Math.max(1,Math.ceil(count/15));
 for(let page=1;page<=pages;page++){
 ctx.coltCornerTopicPage=page;
 const html=vm.runInContext('renderThreadTable(threads)',ctx);
 const ids=[...html.matchAll(/data-topic="(\d+)"/g)].map(m=>+m[1]);
 assert.deepEqual(ids,ctx.threads.slice((page-1)*15,page*15).map(t=>t.id));
 assert(ids.length<=15);
 if(count){assert(html.includes(`Page ${page} of ${pages}`));assert.equal(/data-page="\d+" disabled>Previous/.test(html),page===1);assert.equal(/data-page="\d+" disabled>Next/.test(html),page===pages);}
 else assert(!html.includes('thread-pagination'));
 }
 ctx.coltCornerTopicPage=999;
 vm.runInContext('renderThreadTable(threads)',ctx);
 assert.equal(ctx.coltCornerTopicPage,pages);
}
assert(src.includes('coltCornerTopicPage = 1;\n    teacherColtCornerGrade'));
const handler=src.slice(src.indexOf('  if (action === "coltCornerTopicPage")'),src.indexOf('  if (action === "gradebookGrade")'));
ctx.action='coltCornerTopicPage';ctx.target={dataset:{page:'2'}};ctx.visibleColtCornerThreads=()=>ctx.threads;
let focused=false,scrolled=false;const list={outerHTML:''};
ctx.document={querySelector:s=>s==='.thread-list'?list:{focus:()=>{focused=true},scrollIntoView:()=>{scrolled=true}}};
vm.runInContext(handler,ctx);
assert.equal(ctx.coltCornerTopicPage,2);assert(list.outerHTML.includes('Page 2 of 7'));assert(focused&&scrolled);
console.log('Pagination passed: 0/1/15/16/30/31/100 topics, boundary controls, last-page clamping, grade reset and page handler.');
