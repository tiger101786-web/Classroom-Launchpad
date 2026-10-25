const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const origin='http://127.0.0.1:8164',dir=fs.mkdtempSync(path.join(os.tmpdir(),'accessory-test-'));
const server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:'8164',DATA_DIR:dir,SESSION_SECRET:'accessory-test',TEACHER_PIN:'654321'},stdio:'pipe'});let browser;
(async()=>{try{
for(let i=0;i<100;i++){try{if((await fetch(origin+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
const login=await fetch(origin+'/api/auth/teacher',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({pin:'654321'})});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0],eq=cookie.indexOf('=');
browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});const context=await browser.newContext({viewport:{width:1440,height:1000}});await context.addCookies([{name:cookie.slice(0,eq),value:cookie.slice(eq+1),url:origin}]);const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
const open=async()=>{await page.goto(origin,{waitUntil:'domcontentloaded'});await page.evaluate(()=>window.dispatchEvent(new CustomEvent('classroom-launchpad-rendered',{detail:{screen:'home',auth:{authenticated:true,role:'teacher'}}})));await page.waitForFunction(()=>document.querySelector('.companion-picker select')?.disabled===false);await page.locator('.header-account-summary').first().click();await page.locator('.header-account-menu [data-companion-open]').first().click();};
await open();const studio=page.locator('.pet-studio');await studio.locator('#pet-select').selectOption('labubu');
assert(await studio.locator('.labubu-companion').isVisible());
await page.setViewportSize({width:1920,height:1080});
await studio.locator('[data-skin-choice="Sea Salt Coconut"]').click();
await page.waitForFunction(()=>document.querySelector('#puppet .labubu-colored-art')?.style.display==='none');
const visibleSkins=await studio.locator('#gallery').evaluate(g=>{const r=g.getBoundingClientRect();return [...g.children].filter(e=>{const c=e.getBoundingClientRect();return c.top>=r.top&&c.bottom<=r.bottom}).length});
assert.equal(visibleSkins,7,'All seven Labubu skins fit at 1920x1080');
await studio.screenshot({path:path.join(dir,'labubu-gallery-1920.png')});
await studio.locator('[data-tab=play]').click();
let baselineFPS;
for(const action of ['idle','ears','hand']){
 if(action!=='idle')await studio.locator('[data-action="'+action+'"]').click();
 const frames=await page.evaluate(()=>new Promise(resolve=>{let last=0,samples=[];function sample(t){if(last)samples.push(t-last);last=t;if(samples.length<100)requestAnimationFrame(sample);else resolve(samples)}requestAnimationFrame(sample)}));
 const fps=1000/(frames.reduce((a,b)=>a+b)/frames.length);console.log(action+' FPS: '+fps.toFixed(1));if(action==='idle')baselineFPS=fps;else assert(fps>=baselineFPS*.8,'Wiggles should not substantially slow the live page');
}
await page.setViewportSize({width:1440,height:1000});
await studio.locator('[data-tab=name]').click();await studio.locator('#pet-name').fill('Cocoa');await studio.locator('#size-select').selectOption('extra-large');
await page.waitForTimeout(900);
await open();assert.equal(await studio.locator('#pet-select').inputValue(),'labubu');assert.equal(await studio.locator('#name-label').textContent(),'Cocoa');
await studio.locator('[data-tab=play]').click();for(const b of await studio.locator('.action-grid [data-action]').all()){await b.click();await page.waitForTimeout(120)}
await studio.locator('[data-toggle=asleep]').check();assert.equal(await studio.locator('.labubu-companion').getAttribute('data-state'),'sleep');await page.waitForTimeout(600);await studio.screenshot({path:path.join(dir,'labubu-sleep.png')});
await studio.locator('[data-toggle=asleep]').uncheck();await page.waitForTimeout(4000);
await studio.locator('#dance').click();assert.equal(await studio.locator('#headphones').getAttribute('opacity'),'1');await studio.locator('#dance').click();
await studio.locator('[data-tab=appearance]').click();await studio.locator('[data-subtab=accessories]').click();await studio.locator('[data-choice=headphones]').click();await page.waitForTimeout(300);assert.equal(await studio.locator('#headphones').getAttribute('opacity'),'1');await studio.locator('[data-choice-key=headwear][data-choice=none]').click();
for(const width of [1440,800,390]){await page.setViewportSize({width,height:1000});await studio.locator('[data-tab=appearance]').click();await studio.locator('[data-subtab=skins]').click();await page.waitForTimeout(100);const m=await studio.evaluate(d=>{const pet=d.querySelector('.labubu-companion .pet-button').getBoundingClientRect(),sub=d.querySelector('#pet-subtitle').getBoundingClientRect(),actions=d.querySelector('.preview-actions').getBoundingClientRect();return {gap:pet.top-sub.bottom,bottom:pet.bottom,actions:actions.top,overflow:d.scrollWidth>d.clientWidth+1}});assert(m.gap>=8,JSON.stringify(m));assert(m.bottom<=m.actions+1,JSON.stringify(m));assert(!m.overflow);await studio.screenshot({path:path.join(dir,'labubu-'+width+'.png')});}
await page.setViewportSize({width:1440,height:1000});
const sizes={};for(const kind of ['colt','eagle','gummy','squishy','labubu']){sizes[kind]={};await studio.locator('#pet-select').selectOption(kind);await studio.locator('[data-tab=name]').click();for(const size of ['small','medium','large','extra-large']){await studio.locator('#size-select').selectOption(size);await studio.locator('.studio-close').click();const cls={colt:'robo',squishy:'dumpling',gummy:'gummy',eagle:'eagle',labubu:'labubu'}[kind];await page.locator('.'+cls+'-companion .pet-button').waitFor({state:'visible'});sizes[kind][size]=await page.locator('.'+cls+'-companion .pet-button').boundingBox();await page.locator('.header-account-summary').first().click();await page.locator('.header-account-menu [data-companion-open]').first().click();await studio.locator('[data-tab=name]').click();}}
console.log('Size measurements: '+JSON.stringify(sizes));
for(const size of ['small','medium','large','extra-large'])assert(Math.abs(sizes.labubu[size]?.height/sizes.eagle[size]?.height-1)<.2,JSON.stringify(sizes));
for(const kind of ['eagle','labubu']){
 await studio.locator('#pet-select').selectOption(kind);await studio.locator('[data-tab=play]').click();
 const rates={};for(const asleep of [false,true]){await studio.locator('[data-toggle=asleep]').setChecked(asleep);await page.waitForTimeout(400);
 const mean=await page.evaluate(()=>new Promise(resolve=>{let last=0,frames=[];function sample(t){if(last)frames.push(t-last);last=t;if(frames.length<80)requestAnimationFrame(sample);else resolve(frames.reduce((a,b)=>a+b)/frames.length)}requestAnimationFrame(sample)}));rates[asleep?'sleep':'idle']=1000/mean;}
 console.log(kind+' live Studio idle/sleep FPS: '+JSON.stringify(rates));assert(rates.sleep>=rates.idle*.85,'Sleep should keep pace with idle in the real Studio');await studio.locator('[data-toggle=asleep]').uncheck();
}
await studio.locator('[data-tab=settings]').click();await studio.locator('[data-toggle=motion]').uncheck();await page.waitForTimeout(100);assert.equal(await studio.locator('#ears-bend').getAttribute('scale'),'0');
assert.deepEqual(errors,[]);console.log('PASS: Labubu saving/reload, all actions, sleep/wake, dancing, headset, sizes and layout. Screenshots: '+dir);console.log(JSON.stringify(sizes));
await studio.locator('[data-toggle=motion]').check();
await studio.locator('[data-tab=name]').click();await studio.locator('[data-toggle=nameplate]').uncheck();assert.equal(await studio.locator('#nameplate').isVisible(),false);await studio.locator('[data-toggle=nameplate]').check();await studio.locator('[data-toggle=platform]').uncheck();assert.equal(await studio.locator('#platform').isVisible(),false);await studio.locator('[data-toggle=platform]').check();
await page.evaluate(()=>dispatchEvent(new CustomEvent('colt-radio-playback',{detail:{playing:true}})));await page.waitForTimeout(80);assert.equal(await studio.locator('.labubu-companion').getAttribute('data-state'),'dance');await page.evaluate(()=>dispatchEvent(new CustomEvent('colt-radio-playback',{detail:{playing:false}})));await page.waitForTimeout(80);assert.equal(await studio.locator('.labubu-companion').getAttribute('data-state'),'idle');
await page.waitForTimeout(900);const persisted=await(await fetch(origin+'/api/companion-preferences',{headers:{Cookie:cookie}})).json();assert.equal(persisted.preferences.pet,'labubu');assert.equal(persisted.preferences.labubu.name,'Cocoa');
const invalid=await fetch(origin+'/api/companion-preferences',{method:'PUT',headers:{Cookie:cookie,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({...persisted.preferences,labubu:{...persisted.preferences.labubu,name:'x'.repeat(17)}})});assert.equal(invalid.status,400);
assert.deepEqual(errors,[]);console.log('PASS: platform/nameplate toggles, real radio events and server validation.');
}finally{await browser?.close();server.kill();}})().catch(e=>{console.error(e);process.exitCode=1});
