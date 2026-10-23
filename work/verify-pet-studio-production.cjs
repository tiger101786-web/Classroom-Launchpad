const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const origin='http://127.0.0.1:8163';const dir=fs.mkdtempSync(path.join(os.tmpdir(),'pet-studio-test-'));
const server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:'8163',DATA_DIR:dir,SESSION_SECRET:'studio-test',TEACHER_PIN:'654321',STUDENT_EMAIL_DOMAIN:'scscolts.org'},stdio:'pipe'});let browser;
async function req(route,cookie='',body,method){const r=await fetch(origin+route,{method:method||(body?'PUT':'GET'),headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json(),cookie:(r.headers.get('set-cookie')||'').split(';')[0]}}
(async()=>{try{
for(let i=0;i<80;i++){try{if((await fetch(origin+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
const teacher=await req('/api/auth/teacher','',{pin:'654321'},'POST');assert.equal(teacher.status,200);
const email='tiger101786@gmail.com';const reset=await req('/api/approved-students/'+encodeURIComponent(email)+'/reset-code',teacher.cookie,{},'POST');const student=await req('/api/auth/register','',{email,activationCode:reset.data.activationCode,name:'Studio Test',grade:'4',password:'StudentTest123!'},'POST');assert.equal(student.status,200);
browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
for(const [role,cookie,user] of [['teacher',teacher.cookie,''],['student',student.cookie,email]]){
const context=await browser.newContext({viewport:{width:1440,height:1000}});const equal=cookie.indexOf('=');await context.addCookies([{name:cookie.slice(0,equal),value:cookie.slice(equal+1),url:origin}]);
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(origin,{waitUntil:'domcontentloaded'});
const home=()=>page.evaluate(({role,email})=>window.dispatchEvent(new CustomEvent('classroom-launchpad-rendered',{detail:{screen:'home',auth:{authenticated:true,role,email}}})),{role,email:user});await home();await page.waitForFunction(()=>document.querySelector('.companion-picker select')?.disabled===false);
const studio=page.locator('.pet-studio');const open=async()=>{await page.locator('.header-account-summary').first().click();await page.locator('.header-account-menu [data-companion-open]').first().click();await studio.waitFor({state:'visible'})};
await open();assert.equal(await studio.locator('.robo-companion').count(),1);assert.equal(await page.locator('.robo-companion').count(),1);
assert.equal(await studio.locator('#pet-studio-title').evaluate(e=>getComputedStyle(e).color),'rgb(247, 242, 245)');
await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('.pet-studio #greet').disabled);await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>!document.querySelector('.pet-studio #greet').disabled);
await studio.locator('#skin-search').fill('glitter');await studio.locator('[data-skin-choice="Glitter"]').click();await page.getByRole('status').filter({hasText:/^Saved$/}).last().waitFor();
await studio.locator('[data-tab="name"]').click();await studio.locator('#pet-name').fill('Studio '+role);await studio.locator('#size-select').selectOption('large');
await studio.locator('[data-tab="appearance"]').click();await studio.locator('[data-subtab="accessories"]').click();await studio.locator('[data-choice="horn"]').click();
await page.waitForTimeout(600);let prefs=(await req('/api/companion-preferences',cookie)).data.preferences;assert.equal(prefs.robo.skin,'Glitter');assert.equal(prefs.robo.name,'Studio '+role);assert.equal(prefs.robo.headwear,'horn');assert.equal(prefs.robo.size,'large');
await studio.locator('#undo').click();await page.waitForTimeout(300);assert.equal((await req('/api/companion-preferences',cookie)).data.preferences.robo.headwear,'none');
await studio.locator('#dance').click();assert(await studio.locator('.robo-companion .pet-button').evaluate(e=>e.classList.contains('dancing')));await studio.locator('#dance').click();
await studio.locator('[data-subtab="skins"]').click();await studio.locator('#skin-search').fill('');await studio.screenshot({path:'work/studio-production-'+role+'.png'});
await studio.locator('.studio-close').click();await page.waitForTimeout(100);assert.equal(await page.locator('body > .robo-companion').count(),1);assert.equal(await studio.isVisible(),false);
await page.locator('body > .robo-companion .pet-button').click();await studio.waitFor({state:'visible'});
await studio.locator('#pet-select').selectOption('squishy');assert(await studio.locator('.dumpling-companion').isVisible());
await studio.locator('#skin-search').fill('Galaxy');await studio.locator('[data-skin-choice="Galaxy"]').click();await studio.locator('[data-tab="name"]').click();await studio.locator('#pet-name').fill('Mochi '+role);
await studio.locator('[data-tab="appearance"]').click();await studio.locator('[data-subtab="accessories"]').click();await studio.locator('[data-choice="crown"]').click();await studio.locator('[data-choice="sunglasses"]').click();
await page.waitForTimeout(600);prefs=(await req('/api/companion-preferences',cookie)).data.preferences;assert.equal(prefs.color,'Galaxy');assert.equal(prefs.accessory,'crown');assert.equal(prefs.eyewear,'sunglasses');assert.equal(prefs.squishyName,'Mochi '+role);assert.equal(prefs.robo.name,'Studio '+role);
await studio.locator('[data-tab="play"]').click();await studio.locator('[data-toggle="asleep"]').check();assert(await studio.locator('.dumpling-companion .pet-button').evaluate(e=>e.classList.contains('asleep')));await studio.locator('[data-toggle="asleep"]').uncheck();
await studio.locator('[data-tab="appearance"]').click();await studio.locator('[data-subtab="skins"]').click();await studio.locator('#skin-search').fill('');await page.setViewportSize({width:390,height:844});await studio.screenshot({path:'work/studio-production-mobile-'+role+'.png'});assert(await studio.evaluate(e=>e.scrollWidth<=e.clientWidth+1));
// A failed save must offer retry, not falsely report success.
await page.route('**/api/companion-preferences',r=>r.request().method()==='PUT'?r.fulfill({status:500,contentType:'application/json',body:'{}'}):r.continue());await studio.locator('[data-skin-choice="Blue"]').click();await studio.locator('.studio-retry').waitFor({state:'visible'});assert.match(await studio.locator('#save-status').innerText(),/Not saved/);await page.unroute('**/api/companion-preferences');await studio.locator('.studio-retry').click();await page.waitForTimeout(400);assert.equal((await req('/api/companion-preferences',cookie)).data.preferences.color,'Blue');
await page.keyboard.press('Escape');await page.waitForTimeout(100);assert.equal(await page.locator('body > .dumpling-companion').count(),1);
await page.reload({waitUntil:'domcontentloaded'});await home();await page.waitForFunction(()=>document.querySelector('.companion-picker select')?.disabled===false);await open();assert.equal(await studio.locator('#pet-title').innerText(),'Mochi '+role);
await studio.locator('#pet-select').selectOption('gummy');assert(await studio.locator('.gummy-companion').isVisible());assert.equal(await studio.locator('[data-skin-choice]').count(),8);
for(const width of [1440,800,390]){await page.setViewportSize({width,height:1000});await page.waitForTimeout(100);const plateBox=await studio.locator('.gummy-companion .gb-nameplate').boundingBox(),actionsBox=await studio.locator('.preview-actions').boundingBox();assert(actionsBox.y>=plateBox.y+plateBox.height+16,'Gummy nameplate must stay above controls with a clear gap at '+width+'px');}
await studio.locator('[data-skin-choice="Pineapple"]').click();await studio.locator('[data-tab="name"]').click();await studio.locator('#pet-name').fill('Gummy '+role);await studio.locator('#size-select').selectOption('large');await page.waitForTimeout(400);
let gummySaved=(await req('/api/companion-preferences',cookie)).data.preferences;assert.equal(gummySaved.pet,'gummy');assert.equal(gummySaved.gummy.skin,'Pineapple');assert.equal(gummySaved.gummy.name,'Gummy '+role);assert.equal(gummySaved.gummy.size,'large');assert.equal(gummySaved.robo.name,'Studio '+role);assert.equal(gummySaved.squishyName,'Mochi '+role);
assert.equal((await req('/api/companion-preferences',cookie,{...gummySaved,gummy:{...gummySaved.gummy,skin:'invalid'}})).status,400);
await studio.locator('[data-tab="appearance"]').click();await studio.locator('[data-subtab="accessories"]').click();assert.match(await studio.locator('#tab-content').innerText(),/not available/);await studio.locator('[data-subtab="skins"]').click();
await studio.locator('#dance').click();assert(await studio.locator('.gummy-companion .pet-button').evaluate(e=>e.classList.contains('dancing')));await studio.locator('#dance').click();
await studio.locator('[data-tab="play"]').click();await studio.locator('[data-toggle="asleep"]').check();await page.waitForTimeout(300);assert(await studio.locator('.gummy-companion .pet-button').evaluate(e=>e.classList.contains('asleep')));assert.equal(await studio.locator('#dance').isDisabled(),true);await studio.locator('[data-toggle="asleep"]').uncheck();
await studio.locator('[data-tab="appearance"]').click();assert(await studio.evaluate(e=>e.scrollWidth<=e.clientWidth+1));await studio.screenshot({path:'work/gummy-studio-'+role+'.png'});
await studio.locator('.studio-close').click();await page.reload({waitUntil:'domcontentloaded'});await home();await page.waitForFunction(()=>document.querySelector('.companion-picker select')?.disabled===false);await open();assert.equal(await studio.locator('#pet-title').innerText(),'Gummy '+role);assert.equal(await studio.locator('#pet-select').inputValue(),'gummy');

await studio.locator('#pet-select').selectOption('eagle');assert(await studio.locator('.eagle-companion').isVisible());
await page.setViewportSize({width:1440,height:1000});
await studio.locator('[data-tab="name"]').click();
for(const [size,coltWidth] of [['small',124],['medium',144],['large',168],['extra-large',210]]){
 await studio.locator('#size-select').selectOption(size);
 await studio.locator('.studio-close').click();await page.waitForFunction(()=>document.querySelector('body > .eagle-companion'));
 const b=await page.locator('.eagle-companion .pet-button').boundingBox();
 assert(Math.abs(b.height-coltWidth*940/920)<2,'Eagle '+size+' matches the existing character/perch height');
 await open();await studio.locator('[data-tab="name"]').click();
}
await studio.locator('.studio-close').click();await page.waitForFunction(()=>document.querySelector('body > .eagle-companion'));
await page.setViewportSize({width:900,height:800});const compactEagle=await page.locator('.eagle-companion .pet-button').boundingBox();assert(Math.abs(compactEagle.height-62*940/920)<2);
await page.setViewportSize({width:1440,height:1000});await open();

assert.equal(await studio.locator('[data-skin-choice]').count(),1);
await studio.locator('[data-skin-choice="Bald Eagle"] img').evaluate(img=>img.decode());
await studio.locator('[data-tab="name"]').click();await studio.locator('#pet-name').fill('Eagle '+role);await studio.locator('#size-select').selectOption('large');await page.waitForTimeout(500);
let eagleSaved=(await req('/api/companion-preferences',cookie)).data.preferences;
assert.equal(eagleSaved.pet,'eagle');assert.equal(eagleSaved.eagle.name,'Eagle '+role);assert.equal(eagleSaved.eagle.size,'large');assert.equal(eagleSaved.gummy.name,'Gummy '+role);
assert.equal((await req('/api/companion-preferences',cookie,{...eagleSaved,eagle:{...eagleSaved.eagle,skin:'invalid'}})).status,400);
await studio.locator('[data-tab="play"]').click();assert.equal(await studio.locator('[data-action="tilt"]').count(),0);
await studio.locator('[data-action="wings"]').click();await page.waitForTimeout(1500);
assert(Number((await studio.locator('.eagle-companion .wing-left').getAttribute('transform')).match(/rotate\(([-\d.]+)/)[1])>25);
await studio.locator('[data-toggle="asleep"]').check();assert.equal(await studio.locator('.eagle-companion .lid-left').getAttribute('height'),'125');
await studio.locator('[data-toggle="asleep"]').uncheck();await page.waitForTimeout(1800);
assert.equal(await studio.locator('.eagle-companion .lower-jaw').getAttribute('transform'),'translate(0 0)');
await page.waitForTimeout(1600);assert.equal(await studio.locator('.eagle-companion .lid-left').getAttribute('height'),'0');
await studio.locator('#dance').click();assert(await studio.locator('.eagle-companion .pet-button').evaluate(e=>e.classList.contains('dancing')));await studio.locator('#dance').click();
for(const width of [1440,390]){await page.setViewportSize({width,height:1000});await page.waitForTimeout(100);assert(await studio.evaluate(e=>e.scrollWidth<=e.clientWidth+1));await studio.screenshot({path:'C:/Users/Sinister/Documents/Email/gummy-bear-qa/eagle-studio-'+role+'-'+width+'.png'});}
await studio.locator('.studio-close').click();await page.waitForFunction(()=>document.querySelector('body > .eagle-companion'));assert.equal(await page.locator('body > .eagle-companion').count(),1);
await page.reload({waitUntil:'domcontentloaded'});await home();await page.waitForFunction(()=>document.querySelector('.companion-picker select')?.disabled===false);await open();
assert.equal(await studio.locator('#pet-title').innerText(),'Eagle '+role);assert.equal(await studio.locator('#pet-select').inputValue(),'eagle');
await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('.eagle-companion .pet-button').classList.contains('still'));
await page.emulateMedia({reducedMotion:'no-preference'});
await studio.locator('[data-tab="settings"]').click();await studio.locator('#hide-pet').click();assert.equal(await page.locator('.eagle-companion').isVisible(),false);
await open();assert(await studio.locator('.eagle-companion').isVisible());await studio.locator('#pet-select').selectOption('gummy');

await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('.gummy-companion .pet-button').classList.contains('still'));
await page.evaluate(()=>window.dispatchEvent(new CustomEvent('classroom-launchpad-rendered',{detail:{screen:'login',auth:{authenticated:false}}})));await page.waitForTimeout(100);assert.equal(await studio.isVisible(),false);assert.equal(await page.locator('body > .dumpling-companion').count(),1);assert.equal(await page.locator('body > .gummy-companion').isVisible(),false);assert.deepEqual(errors,[]);await context.close();
}
assert.equal((await req('/api/companion-preferences',teacher.cookie)).data.preferences.squishyName,'Mochi teacher');console.log('PASS: Pet Studio teacher/student persistence and isolation, real pets, skins, accessories, naming, undo, dancing, sleep/wake, mobile, retry, reopen, reload and logout.');
}finally{await browser?.close();server.kill()}})().catch(e=>{console.error(e);process.exitCode=1});
