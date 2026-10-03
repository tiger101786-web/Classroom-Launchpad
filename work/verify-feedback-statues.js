const fs=require('fs'),assert=require('assert/strict'),vm=require('vm'),path=require('path'),{chromium}=require('playwright'),shelf=require('../collectible-shelf');
const source=fs.readFileSync('app.js','utf8');
const resolver=source.slice(source.indexOf('function feedbackMessageStudent('),source.indexOf('function renderWebsiteRequest('));
const students=[{email:'one@test.invalid',name:'Test, One',grade:'6'},{email:'two@test.invalid',name:'Test, Two',grade:'6'}];
const ctx={approvedStudents:students};vm.createContext(ctx);vm.runInContext(resolver,ctx);
assert.equal(ctx.feedbackMessageStudent({studentEmail:'ONE@test.invalid',studentName:'wrong'}).email,students[0].email);
assert.equal(ctx.feedbackMessageStudent({studentName:'Test, One',grade:6}).email,students[0].email);
assert.equal(ctx.feedbackMessageStudent({studentName:'Test, One',grade:7}),null);
assert.equal(ctx.feedbackMessageStudent({studentEmail:'missing@test.invalid',studentName:'Test, One',grade:6}),null);
students.push({...students[0],email:'duplicate@test.invalid'});
assert.equal(ctx.feedbackMessageStudent({studentName:'Test, One',grade:6}),null);students.pop();
const handler=source.slice(source.indexOf('  if (action === "messageFeedbackStudent"'),source.indexOf('  if (action === "messageGrade"'));
Object.assign(ctx,{action:'messageFeedbackStudent',isTeacher:()=>true,loadApprovedStudents:async()=>{},websiteRequests:[{id:'feedback',studentEmail:students[0].email}],target:{dataset:{id:'feedback'}},sessionStorage:{setItem:()=>{}},setScreen:()=>{},markCurrentDirectMessagesRead:async email=>{assert.equal(email,students[0].email)},render:()=>{},requestAnimationFrame:fn=>fn(),document:{getElementById:()=>({focus(){}})},window:{alert(){ctx.alerted=true}}});
(async()=>{
await vm.runInContext('(async()=>{'+handler+'})()',ctx);
assert.equal(ctx.selectedMessageStudentEmail,students[0].email);assert.equal(ctx.dashboardSection,'messages');
ctx.target.dataset.id='missing';await vm.runInContext('(async()=>{'+handler+'})()',ctx);assert(ctx.alerted);
ctx.isTeacher=()=>false;ctx.dashboardSection='feedback';await vm.runInContext('(async()=>{'+handler+'})()',ctx);assert.equal(ctx.dashboardSection,'feedback');
assert.match(fs.readFileSync('server.js','utf8'),/studentName: studentDisplayName\(allowed\),\s+studentEmail: String\(allowed.email/);
const ids=["anime-gon-statue","anime-hinata-statue","anime-obanai-statue","anime-tengen-statue","anime-isagi-statue","anime-gray-statue","anime-nobara-statue","anime-kirito-statue","anime-natsu-statue","anime-gyomei-statue","anime-sanemi-statue"];
for(const id of ids){assert.equal(shelf.items.filter(i=>i.id===id).length,1);assert(shelf.valid({enabled:true,theme:'crimson',slots:[id,'none','none']}));}
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
try{
const page=await browser.newPage();
await page.route('http://art.local/**',r=>r.fulfill({body:fs.readFileSync(path.join(process.cwd(),new URL(r.request().url()).pathname)),contentType:'image/png'}));
await page.setContent('<base href="http://art.local/"><style>'+fs.readFileSync('collectible-shelf.css','utf8')+'body{background:#241821;color:white;margin:0;padding:20px}section{width:min(350px,100%);margin:70px auto}h2{font:14px Arial}</style>'+ids.map(id=>'<section><h2>'+id+'</h2>'+shelf.art({enabled:true,theme:'crimson',slots:[id,id,id]})+'</section>').join(''));
await page.evaluate(()=>Promise.all([...document.querySelectorAll('.shelf-direct-image img')].map(i=>i.decode())));
for(const width of [900,390]){
await page.setViewportSize({width,height:900});
assert.equal(await page.locator('.shelf-direct-image img').count(),33);
assert(await page.locator('.shelf-direct-image img').evaluateAll(ns=>ns.every(n=>n.naturalWidth>=832)));
const boxes=await page.locator('.shelf-object > div').evaluateAll(ns=>ns.map(n=>{const p=n.parentElement.getBoundingClientRect(),r=n.getBoundingClientRect();return {l:r.left,r:r.right,base:(r.bottom-p.top)/p.height*350};}));
assert(boxes.every(b=>Math.abs(b.base-346)<.2));
for(let i=0;i<boxes.length;i+=3)assert(boxes[i].r<boxes[i+1].l&&boxes[i+1].r<boxes[i+2].l);
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
await page.screenshot({path:'work/feedback-statues-'+width+'.png',fullPage:true});
}
console.log('PASS: safe feedback recipient matching, teacher-only navigation, authenticated author storage, and 11 sharp statues at desktop/mobile widths.');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});

