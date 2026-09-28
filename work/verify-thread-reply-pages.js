const fs=require("fs"),assert=require("assert/strict"),{chromium}=require("playwright");
(async()=>{
 const src=fs.readFileSync("app.js","utf8"),browser=await chromium.launch({executablePath:"C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",headless:true});
 try{
 const page=await browser.newPage();
 await page.setContent("<style>"+fs.readFileSync("styles.css","utf8").replace(/^\uFEFF/,"")+"body{padding:20px;height:auto!important;max-width:1000px;margin:auto}</style><body data-theme=\"night\"><h2>Example discussion</h2><section class=\"thread-reply-list\"></section><textarea id=\"replyMessage\"></textarea></body>");
 const paging=src.slice(src.indexOf("function threadReplyPageData("),src.indexOf("function renderThreadDetail("));
 const reply=src.slice(src.indexOf("function renderThreadReply("),src.indexOf("function categoryCard("));
 const handler=src.slice(src.indexOf('  if (action === "threadReplyPage")'),src.indexOf('  if (action === "openThread")'));
 await page.addScriptTag({content:`const threadReplyPages=new Map(),THREAD_REPLIES_PER_PAGE=15;const getThreadReplies=t=>t.replies||[],escapeHtml=x=>String(x).replace(/</g,"&lt;"),formatShortDate=()=>"Sep 28",renderForumAuthor=()=>"",emptyCard=x=>x;let classThreads=[{id:"a",replies:Array.from({length:46},(_,i)=>({id:"r"+i,message:"Reply "+(i+1)}))}],screen={name:"thread",id:"a"};const markVisibleColtCornerTopicsSeen=()=>{};${paging}${reply}document.querySelector(".thread-reply-list").innerHTML=renderThreadReplyList(classThreads[0]);document.addEventListener("click",event=>{const target=event.target.closest("[data-action]");if(!target||target.disabled)return;const action=target.dataset.action;${handler}});`});
 for(const width of [1100,390]){
 await page.setViewportSize({width,height:900});
 await page.evaluate(()=>{threadReplyPages.set("a",1);document.querySelector(".thread-reply-list").innerHTML=renderThreadReplyList(classThreads[0]);});
 assert.equal(await page.locator(".thread-reply-post").count(),15);
 await page.locator("#replyMessage").fill("Keep this unfinished reply");
 await page.getByRole("button",{name:"Next",exact:true}).first().click();
 assert.match(await page.locator(".thread-reply-post").first().innerText(),/Reply #16/i);
 await page.getByRole("button",{name:"Latest",exact:true}).first().click();assert.equal(await page.locator(".thread-reply-post").count(),1);
 assert.match(await page.locator(".thread-reply-post").innerText(),/Reply #46/i);
 assert.equal(await page.locator("#replyMessage").inputValue(),"Keep this unfinished reply");
 await page.screenshot({path:"work/thread-reply-pages-"+width+".png",fullPage:true});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.getByRole("button",{name:"Previous",exact:true}).last().click();assert.equal(await page.locator(".thread-reply-post").count(),15);
 }
 const counts=await page.evaluate(()=>[0,1,15,16,30,31].map(n=>{const t={id:"test",replies:Array.from({length:n},(_,i)=>({message:"test",id:String(i)}))};threadReplyPages.set("test",999);const d=threadReplyPageData(t);return [d.pages,d.visible.length];}));
 assert.deepEqual(counts,[[1,0],[1,1],[1,15],[2,1],[2,15],[3,1]]);
 console.log("Reply pages: 15/page, next/previous/first/latest, global numbering, preserved draft, boundary/deletion clamping and mobile overflow passed.");
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
