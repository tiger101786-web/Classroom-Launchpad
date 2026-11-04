const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const origin='http://127.0.0.1:8194',dir=fs.mkdtempSync(path.join(os.tmpdir(),'pet-talk-test-'));
const server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:'8194',DATA_DIR:dir,SESSION_SECRET:'pet-talk-test',TEACHER_PIN:'654321'},stdio:'pipe'});let browser;
(async()=>{try{
 for(let i=0;i<100;i++){try{if((await fetch(origin+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
 const login=await fetch(origin+'/api/auth/teacher',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({pin:'654321'})});assert.equal(login.status,200);
 const cookie=login.headers.get('set-cookie').split(';')[0],equal=cookie.indexOf('=');
 browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});await context.addCookies([{name:cookie.slice(0,equal),value:cookie.slice(equal+1),url:origin}]);
 const page=await context.newPage(),errors=[],outbound=[];await page.clock.install();page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>outbound.push({url:r.url(),body:r.postData()}));
 await page.goto(origin,{waitUntil:'domcontentloaded'});await page.evaluate(()=>window.dispatchEvent(new CustomEvent('classroom-launchpad-rendered',{detail:{screen:'home',auth:{authenticated:true,role:'teacher'}}})));await page.waitForFunction(()=>document.querySelector('.companion-picker select')?.disabled===false);
 const studio=page.locator('.pet-studio'),chat=page.locator('.pet-talk'),bubble=page.locator('.pet-chat'),input=chat.locator('input');
 const openStudio=async()=>{await page.locator('.header-account-summary').first().click();await page.locator('.header-account-menu [data-companion-open]').first().click();await studio.waitFor({state:'visible'})};
 const within=async locator=>{const r=await locator.boundingBox(),v=page.viewportSize();assert(r&&r.x>=-1&&r.y>=-1&&r.x+r.width<=v.width+1&&r.y+r.height<=v.height+1,JSON.stringify({r,v}));};
 const requests=[];
 await page.route('**/api/pet-talk/chat',async route=>{
   const request=route.request().postDataJSON();
   requests.push(request);
   await route.fulfill({json:{answer:request.history.length?'A syrup moat would fit around it.':'Let’s build a tower with a pancake roof, a biscuit door, and a waffle castle!'}});
 });
 await openStudio();
 await studio.locator('#pet-select').selectOption('nugget');
 await studio.locator('[data-skin-choice="Spicy"]').click();
 for(const width of [1440,800,320]){
   await page.setViewportSize({width,height:850});
   assert(await studio.locator('.preview-actions button, .preview-actions .pet-talk-open').evaluateAll(buttons=>
     buttons.length===3 && buttons.every(button=>button.scrollWidth<=button.clientWidth+1)));
 }
 await studio.locator('.pet-talk-open').click();
 await chat.waitFor({state:'visible'});
 assert((await chat.boundingBox()).height<100);
 await within(chat);
 await input.fill('What should we build?');
 await input.press('Enter');
 await bubble.and(page.locator('[aria-busy=true]')).waitFor({state:'visible'});
 assert.doesNotMatch(await bubble.locator('span').innerText(), /waffle castle/);
 await bubble.locator('span').filter({hasText:'waffle castle'}).waitFor();
 assert.equal(requests[0].kind,'nugget');
 assert.equal(requests[0].skin,'Spicy');
 await page.clock.fastForward(60_000);
 assert(await bubble.isVisible(),'AI bubble stays visible for slow readers');
 await input.fill('What goes around it?');
 await chat.locator('[type=submit]').click();
 await bubble.locator('span').filter({hasText:'syrup moat'}).waitFor();
 assert.equal(requests[1].history.length,2);
 await chat.locator('[data-history]').click();
 assert.match(await chat.locator('.pet-talk-messages').innerText(),/waffle castle/);
 await chat.locator('[data-history]').click();
 await page.setViewportSize({width:1000,height:850});
 const grip=chat.locator('.pet-talk-grip');
 const before=await chat.boundingBox(), handle=await grip.boundingBox();
 await page.mouse.move(handle.x+8,handle.y+8);
 await page.mouse.down();
 await page.mouse.move(handle.x-80,handle.y-60,{steps:8});
 await page.mouse.up();
 const after=await chat.boundingBox();
 assert(Math.abs(after.x-before.x)>20 || Math.abs(after.y-before.y)>20);
 await within(chat);
 await chat.locator('[data-talk-close]').click();
 assert(!(await chat.isVisible()));
 assert(!(await bubble.isVisible()));
 assert.deepEqual(errors,[]);
 console.log('PASS: compact chat, Studio label fit, drag, generated reply display, context, history, and persistent bubble.');
}finally{await browser?.close();server.kill()}})().catch(error=>{console.error(error);process.exitCode=1});
