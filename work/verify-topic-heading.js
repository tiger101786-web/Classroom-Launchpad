const fs=require("fs"),vm=require("vm"),assert=require("assert/strict"),{chromium}=require("playwright");
(async()=>{
 const src=fs.readFileSync("app.js","utf8"),ctx=vm.createContext({authSession:{grade:"5"},coltCornerAudienceGrade:t=>t.grade,escapeHtml:x=>String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")});
 vm.runInContext(src.slice(src.indexOf("function renderThreadTopicHeading("),src.indexOf("function renderThreadDetail(")),ctx);
 const browser=await chromium.launch({executablePath:"C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",headless:true});
 try{
 const page=await browser.newPage();
 for(const width of [1150,390])for(const theme of ["night","light"]){
 await page.setViewportSize({width,height:400});
 await page.setContent("<style>"+fs.readFileSync("styles.css","utf8").replace(/^\uFEFF/,"")+"body{padding:20px;height:auto}h1{margin-bottom:15px}</style><body data-theme=\""+theme+"\"><h1>Colt Corner</h1>"+ctx.renderThreadTopicHeading({title:"just anything to talk about",grade:"5"})+"</body>");
 assert.equal(await page.locator(".corner-topic-heading h2").innerText(),"just anything to talk about");
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:"work/topic-heading-"+width+"-"+theme+".png"});
 await page.locator(".corner-topic-heading").evaluate((e,html)=>e.outerHTML=html,ctx.renderThreadTopicHeading({title:"<script>not executable</script> "+"A".repeat(80),grade:"5"}));
 assert.equal(await page.locator(".corner-topic-heading script").count(),0);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 console.log("Topic heading: desktop/mobile, light/dark, long title wrapping and escaped text passed.");
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
