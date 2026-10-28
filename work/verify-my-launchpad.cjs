const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const origin='http://127.0.0.1:8187',dir=fs.mkdtempSync(path.join(os.tmpdir(),'my-launchpad-'));
const server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:'8187',DATA_DIR:dir,SESSION_SECRET:'launchpad-test-only',TEACHER_PIN:'654321'},stdio:'pipe'});let browser;
const req=async(route,cookie,body,method)=>fetch(origin+route,{method:method||(body?'POST':'GET'),headers:{Origin:origin,...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
(async()=>{try{
 for(let i=0;i<100;i++){try{if((await fetch(origin+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
 assert.equal((await req('/api/my-launchpad')).status,401);
 const login=await req('/api/auth/teacher',null,{pin:'654321'});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0];
 assert.equal((await fetch(origin+'/api/my-launchpad',{method:'POST',headers:{Cookie:cookie,Origin:'https://bad.example','Content-Type':'application/json'},body:'{"action":"clearRecent"}'})).status,403);
 const builtin=['classroom','spotlight','corner','drive','slides','docs'];
 for(const name of builtin)assert.equal((await req('/api/my-launchpad',cookie,{action:'favorite',id:'app:'+name,value:true})).status,200);
 assert.equal((await (await req('/api/my-launchpad',cookie)).json()).preferences.favorites.length,6);
 assert.equal((await req('/api/my-launchpad',cookie,{action:'favorite',id:'javascript:alert(1)',value:true})).status,400);
 // A second real account cannot read or change the teacher's shortcuts.
 const email='tiger101786@gmail.com';
 const reset=await (await req('/api/approved-students/'+encodeURIComponent(email)+'/reset-code',cookie,{})).json();
 const student=await req('/api/auth/register',null,{email,activationCode:reset.activationCode,name:'Test',grade:'4',password:'LaunchpadTest123!'});assert.equal(student.status,200);
 const studentCookie=student.headers.get('set-cookie').split(';')[0];assert.deepEqual((await (await req('/api/my-launchpad',studentCookie)).json()).preferences.favorites,[]);
 await req('/api/my-launchpad',studentCookie,{action:'favorite',id:'app:docs',value:true});
 assert.equal((await (await req('/api/my-launchpad',cookie)).json()).preferences.favorites.length,6);
 browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});const context=await browser.newContext({viewport:{width:1920,height:1080}});
 const eq=cookie.indexOf('=');await context.addCookies([{name:cookie.slice(0,eq),value:cookie.slice(eq+1),url:origin}]);
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelectorAll('.ml-tile').length===6);
 assert.equal(await page.locator('.daily-launch-card').count(),0);
 await page.locator('#home-launch').screenshot({path:path.join(dir,'desktop.png')});
 await page.locator('[data-ml-dialog=favorites]').click();await page.locator('#ml-search').fill('Slides');assert.equal(await page.locator('.ml-result').count(),1);
 await page.locator('#ml-search').fill('');await page.locator('[data-ml-move="app:docs"][data-direction="-1"]').click();await page.waitForFunction(()=>!document.querySelector('.ml-dialog .ml-status').textContent.includes('Saving'));
 assert.equal((await (await req('/api/my-launchpad',cookie)).json()).preferences.favorites[4],'app:docs');
 await page.locator('[data-ml-mode=add]').click();await page.locator('#ml-search').fill('Typing');await page.waitForFunction(()=>document.querySelectorAll('.ml-result [data-ml-star^="link:"]').length>0);
 const star=page.locator('.ml-result [data-ml-star^="link:"]').first(),linkId=await star.getAttribute('data-ml-star');await star.click();await page.waitForFunction(id=>document.querySelector(`[data-ml-star="${id}"]`)?.getAttribute('aria-pressed')==='true',linkId);
 await page.keyboard.press('Escape');await page.reload();await page.waitForFunction(()=>document.querySelectorAll('.ml-tile').length===7);
 // Open an internal shortcut and confirm recents without navigating externally.
 await page.locator('.ml-tile [data-ml-open="app:spotlight"]').click();await page.waitForTimeout(500);
 assert.equal((await (await req('/api/my-launchpad',cookie)).json()).preferences.recent[0].id,'app:spotlight');
 await page.goto(origin);await page.waitForFunction(()=>document.querySelectorAll('.ml-tile').length===7);
 for(const width of [1920,768,390]){await page.setViewportSize({width,height:900});await page.waitForTimeout(200);await page.locator('#home-launch').scrollIntoViewIfNeeded();assert(await page.locator('.ml-heading-actions').evaluate(e=>e.getBoundingClientRect().right<=innerWidth+1));assert(await page.locator('#home-launch').evaluate(e=>e.getBoundingClientRect().right<=innerWidth+1));await page.locator('#home-launch').screenshot({path:path.join(dir,'home-'+width+'.png')});await page.locator('[data-ml-dialog=favorites]').click();assert(await page.locator('.ml-dialog').evaluate(e=>e.getBoundingClientRect().right<=innerWidth+1&&e.getBoundingClientRect().bottom<=innerHeight+1));await page.keyboard.press('Escape')}
 await page.setViewportSize({width:1920,height:1080});await page.locator('.header-account-summary').first().click();await page.locator('[data-action=teacherDashboard]').click();await page.locator('[data-action=dashboardSection][data-section=tools]').first().click();assert.equal(await page.locator('#dailyLaunchForm').count(),0);assert.equal(await page.locator('#classTimerForm').count(),1);await page.screenshot({path:path.join(dir,'teacher-tools.png')});
 await page.goto(origin);await page.waitForFunction(()=>document.querySelectorAll('.ml-tile').length===7);
 await page.locator('[data-action=category]').first().click();const categoryStar=page.locator('.link-card .ml-star').first();await categoryStar.waitFor();const categoryId=await categoryStar.getAttribute('data-ml-star'),wasOn=await categoryStar.getAttribute('aria-pressed');await categoryStar.click();await page.waitForFunction(({id,wasOn})=>document.querySelector(`[data-ml-star="${id}"]`)?.getAttribute('aria-pressed')!==wasOn,{id:categoryId,wasOn});
 await page.goto(origin);await page.locator('[data-ml-dialog=add]').click();await page.waitForFunction(()=>document.querySelector('.ml-dialog .ml-star:not(:disabled)'));
 await page.route('**/api/my-launchpad',route=>route.request().method()==='POST'?route.fulfill({status:503,contentType:'application/json',body:'{"error":"Offline test"}'}):route.continue());
 const failedStar=page.locator('.ml-dialog [data-ml-star="app:drive"]'),prior=await failedStar.getAttribute('aria-pressed');await failedStar.click();await page.waitForFunction(()=>document.querySelector('.ml-dialog .ml-status').textContent.includes('not saved'));assert.equal(await failedStar.getAttribute('aria-pressed'),prior);await page.unroute('**/api/my-launchpad');await page.keyboard.press('Escape');
 const approved=await page.evaluate(()=>ClassroomLaunchpadAssistantData.getApprovedLinks());await req('/api/links',cookie,{links:approved.map(x=>({...x,active:`link:${x.id}`!==linkId}))},'PUT');await page.reload();await page.waitForFunction(()=>document.querySelector('.ml-panel')&&!document.querySelector('.ml-panel').textContent.includes('Loading'));assert.equal(await page.locator(`.ml-tile [data-ml-open="${linkId}"]`).count(),0,'Inactive links must disappear from favorites');
 await context.clearCookies();await page.reload();await page.waitForFunction(()=>document.querySelector('.ml-panel')?.textContent.includes('Sign in'));assert.equal(await page.locator('.ml-tile').count(),0,'Logout clears personal favorites');
 assert.deepEqual(errors,[]);console.log('PASS: unlimited favorites, category stars, search, reorder, persistence, recent activity, account isolation, CSRF, error handling, inactive links, logout, responsive layout, and teacher tool removal. Screenshots: '+dir);
}finally{await browser?.close();server.kill()}})().catch(e=>{console.error(e);process.exitCode=1});
