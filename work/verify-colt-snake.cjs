const {chromium}=require('playwright');const assert=require('node:assert/strict');const path=require('node:path');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:1000,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file:///'+path.join(__dirname,'colt-painted-skins-preview.html').replaceAll('\\','/'));
 const pet=page.locator('.pet-button'),tongue=page.locator('#rc-snake-tongue');
 const set=async values=>page.evaluate(v=>api.update({account:'snake-test',visible:true,radio:false,preferences:{...roboColtDefaults(),skin:'Snake',...v}}),values);
 const flick=()=>page.waitForFunction(()=>document.querySelector('.pet-button').classList.contains('snake-flick'),{},{timeout:15000});
 const clear=async()=>{assert.equal(await tongue.evaluate(e=>e.querySelector('.snake-tongue-tip').getAnimations().length),0);assert.equal(await pet.evaluate(e=>e.classList.contains('snake-flick')),false);};
 await set({});assert.equal(await pet.locator('[data-pupil]').first().getAttribute('rx'),'4');
 await flick();await page.locator('.snake-tongue-tip').evaluate(e=>{const a=e.getAnimations()[0];a.pause();a.currentTime=280});
 assert.equal(await tongue.evaluate(e=>getComputedStyle(e).display),'inline');
 await pet.screenshot({path:path.join(__dirname,'snake-tongue-preview.png')});
 // Existing happy/mouth actions cancel the flick without changing their animations.
 await page.locator('[data-setting="action"][data-option="mouth"]').evaluate(e=>e.click());await clear();
 assert.equal(await pet.evaluate(e=>e.classList.contains('talking')),true);
 await page.waitForTimeout(1400);await flick();await set({asleep:true});await clear();
 await set({asleep:false});assert.equal(await pet.evaluate(e=>e.classList.contains('waking')),true);await clear();
 await page.waitForTimeout(5200);await flick();
 await page.evaluate(()=>api.update({account:'snake-test',visible:true,radio:true,preferences:{...roboColtDefaults(),skin:'Snake'}}));await clear();
 assert.equal(await pet.evaluate(e=>e.classList.contains('dancing')),true);
 await set({});await flick();await set({skin:'Panda'});await clear();
 assert.equal(await pet.locator('[data-pupil]').first().getAttribute('rx'),'13');
 await pet.screenshot({path:path.join(__dirname,'panda-normal-ears-preview.png')});
 await set({});await flick();await set({motion:false});await clear();
 await set({});await flick();await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('.robo-companion').classList.contains('motion-off'));await clear();
 await page.waitForTimeout(4500);await clear();await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>!document.querySelector('.robo-companion').classList.contains('motion-off'));
 await set({});await flick();await page.evaluate(()=>api.update({account:'',visible:false,radio:false,preferences:roboColtDefaults()}));await clear();
 assert.deepEqual(errors,[]);console.log('PASS: snake eyes, recurring tongue, mouth/sleep/wake/dance cancellation, skin reset, motion-off, reduced-motion and logout.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
