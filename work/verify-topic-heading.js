const fs=require("fs"),vm=require("vm"),assert=require("assert/strict"),{chromium}=require("playwright");
(async()=>{
 const src=fs.readFileSync("app.js","utf8"),ctx=vm.createContext({formatShortDate:()=>"Sep 28, 4:01 PM",authSession:{grade:"5"},coltCornerAudienceGrade:t=>t.grade,escapeHtml:x=>String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")});
 vm.runInContext(src.slice(src.indexOf("function renderThreadTopicHeading("),src.indexOf("function renderThreadDetail(")),ctx);
 const browser=await chromium.launch({executablePath:"C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",headless:true});
 try{
 const page=await browser.newPage();
 for(const width of [1150,390])for(const theme of ["night","light"]){
 await page.setViewportSize({width,height:400});
 await page.setContent("<style>"+fs.readFileSync("styles.css","utf8").replace(/^\uFEFF/,"")+"body{padding:20px;height:auto}h1{margin-bottom:15px}</style><body data-theme=\""+theme+"\"><h1>Colt Corner</h1>"+ctx.renderThreadTopicHeading({title:"just anything to talk about",grade:"5"})+"</body>");
 assert.equal(await page.locator(".forum-topic-heading h2").innerText(),"just anything to talk about");
 assert(await page.locator(".forum-topic-heading h2").evaluate(e=>parseFloat(getComputedStyle(e).fontSize)<17));
 assert.equal(await page.locator(".forum-topic-heading").evaluate(e=>getComputedStyle(e).borderBottomWidth),"1px");
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:"work/topic-heading-"+width+"-"+theme+".png"});
 await page.locator(".forum-topic-heading").evaluate((e,html)=>e.outerHTML=html,ctx.renderThreadTopicHeading({title:"<script>not executable</script> "+"A".repeat(80),grade:"5"}));
 assert.equal(await page.locator(".forum-topic-heading script").count(),0);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 const jump=src.slice(src.indexOf('  if (action === "threadJumpBottom"'),src.indexOf('  if (action === "threadReplyPage"'));
 await page.setContent('<div style="height:2200px">Posts</div><form id="replyForm"><textarea id="replyMessage">Keep my draft</textarea><button>Post Reply</button></form>');
 await page.evaluate(code=>new Function('action','screen',code)('threadJumpBottom',{name:'thread'}),jump);
 assert.equal(await page.locator('#replyMessage').inputValue(),'Keep my draft');
 assert(await page.locator('#replyMessage').evaluate(e=>document.activeElement===e));
 assert(await page.evaluate(()=>scrollY>1000));
 assert(src.includes('<button type="button" data-action="back">Return</button>'));
 assert(src.includes('if (screen.name === "thread") setScreen({ name: "coltCorner" });'));
 console.log("Topic heading: desktop/mobile, light/dark, small title/divider, long title wrapping, escaped text, return routing and jump-to-bottom with preserved draft passed.");
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
