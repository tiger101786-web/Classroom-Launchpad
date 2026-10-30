const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const origin='http://127.0.0.1:8183',dir=fs.mkdtempSync(path.join(os.tmpdir(),'saber-production-'));
const server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:'8183',DATA_DIR:dir,SESSION_SECRET:'saber-test',TEACHER_PIN:'654321'},stdio:'pipe'});let browser;
(async()=>{try{
 for(let i=0;i<100;i++){try{if((await fetch(origin+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
 const login=await fetch(origin+'/api/auth/teacher',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({pin:'654321'})});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0],eq=cookie.indexOf('=');
 browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});const context=await browser.newContext({viewport:{width:1920,height:1080}});await context.addCookies([{name:cookie.slice(0,eq),value:cookie.slice(eq+1),url:origin}]);const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='warning'&&m.text().includes('Saber'))console.log(m.text())});
 const open=async()=>{await page.goto(origin,{waitUntil:'domcontentloaded'});await page.evaluate(()=>window.dispatchEvent(new CustomEvent('classroom-launchpad-rendered',{detail:{screen:'home',auth:{authenticated:true,role:'teacher'}}})));await page.waitForFunction(()=>document.querySelector('.companion-picker select')?.disabled===false);await page.locator('.header-account-summary').first().click();await page.locator('.header-account-menu [data-companion-open]').first().click();};
 await open();const studio=page.locator('.pet-studio'),pet=page.locator('.saber-companion');await studio.locator('#pet-select').selectOption('saber');await page.waitForFunction(()=>document.querySelector('.saber-companion').dataset.ready);assert.equal(await pet.getAttribute('data-ready'),'true');assert.equal(await pet.locator('canvas').evaluate(c=>c.width),2048);assert(await pet.isVisible());assert.equal(await studio.locator('.skin-card').count(),10);
 for(const name of ['Arctic','Shadow','Bengal','Snow Leopard','Sandstone','Woodland','Storm','Fire','Ice','Saber-tooth']){
  await studio.locator('[data-tab=appearance]').click();await studio.locator('[data-skin-choice="'+name+'"]').click();
  await page.waitForFunction(name=>document.querySelector('.saber-companion').dataset.renderedSkin===name,name);
  assert.equal(await pet.locator('canvas').evaluate(c=>c.width),2048);
  assert.equal(await pet.getAttribute('data-skin-error'),null);
  await pet.screenshot({path:path.join(dir,name+'-idle.png')});
  await studio.locator('[data-tab=play]').click();await studio.locator('[data-action=paw]').click();await page.waitForTimeout(650);
  await pet.screenshot({path:path.join(dir,name+'-paw.png')});
  await studio.locator('[data-toggle=asleep]').check();await page.waitForTimeout(100);
  await pet.screenshot({path:path.join(dir,name+'-sleep.png')});await studio.locator('[data-toggle=asleep]').uncheck();
  await studio.locator('#dance').click();await page.waitForTimeout(300);await pet.screenshot({path:path.join(dir,name+'-dance.png')});await studio.locator('#dance').click();
 }
 const coats=await page.evaluate(async()=>Promise.all(Object.values(saberSkins).filter(s=>s.file&&s.file!=='storm').map(async s=>{const a=await saberCoatedImage(s.art),b=await saberCoatedImage(s.underlay);return !s.material&&a.naturalWidth>=1254&&a.naturalWidth===a.naturalHeight&&b.naturalWidth===a.naturalWidth&&b.naturalHeight===a.naturalHeight})));assert(coats.length===8&&coats.every(Boolean),'Eight full-size matching foreground/underlay pairs must decode');
 await studio.locator('[data-tab=appearance]').click();
 await studio.getByLabel('Studio theme',{exact:true}).selectOption('scrapbook');
 const accessoryTab=studio.locator('[data-subtab=accessories]');
 const hatColor=()=>accessoryTab.evaluate(e=>getComputedStyle(e,'::before').backgroundColor);
 assert.equal(await hatColor(),'rgb(101, 64, 45)');
 await accessoryTab.click();assert.equal(await hatColor(),'rgb(255, 248, 237)');
 await studio.screenshot({path:path.join(dir,'scrapbook-hat.png')});
 await studio.locator('[data-subtab=skins]').click();
 await studio.getByLabel('Studio theme',{exact:true}).selectOption('crimson');
 for(const name of ['Fire','Ice']){
  await studio.locator('[data-skin-choice="'+name+'"]').click();
  await page.waitForFunction(name=>document.querySelector('.saber-companion').dataset.renderedSkin===name,name);
  await page.waitForTimeout(700);await open();
  await page.waitForFunction(name=>document.querySelector('.saber-companion').dataset.renderedSkin===name,name);
 }
 await studio.locator('[data-tab=appearance]').click();
 await studio.locator('[data-subtab=accessories]').click();await studio.locator('[data-choice=headphones]').click();await page.waitForTimeout(100);assert.equal(await pet.locator('#saber-rig-headphones').getAttribute('visibility'),'visible');await studio.locator('[data-choice=none]').click();
 await studio.locator('[data-subtab=skins]').click();
 // Superseded image decodes must never replace the latest selection.
 await page.evaluate(()=>{for(const name of ['Shadow','Arctic','Bengal','Storm'])document.querySelector('[data-skin-choice="'+name+'"]').click()});
 await page.waitForFunction(()=>document.querySelector('.saber-companion').dataset.renderedSkin==='Storm');
 await page.waitForTimeout(300);assert.equal(await pet.getAttribute('data-rendered-skin'),'Storm');
 await studio.locator('[data-tab=name]').click();await studio.locator('#pet-name').fill('Fang');await studio.locator('#size-select').selectOption('extra-large');await page.waitForTimeout(700);
 const saved=await page.evaluate(async()=> (await (await fetch('/api/companion-preferences')).json()).preferences);assert.equal(saved.pet,'saber');assert.equal(saved.saber.name,'Fang');assert.equal(saved.saber.skin,'Storm');
 await open();assert.equal(await studio.locator('#pet-select').inputValue(),'saber');await page.waitForFunction(()=>document.querySelector('.saber-companion').dataset.ready==='true');assert.equal(await pet.locator('#saber-pet-name').textContent(),'Fang');await page.waitForFunction(()=>document.querySelector('.saber-companion').dataset.renderedSkin==='Storm');
 await studio.locator('[data-tab=play]').click();for(const button of await studio.locator('[data-action]').all()){await button.click();await page.waitForTimeout(80)}
 await studio.locator('[data-toggle=asleep]').check();assert.equal(await pet.getAttribute('data-state'),'sleep');await page.waitForTimeout(120);assert.equal(await pet.locator('#saber-rig-zs').getAttribute('opacity'),'1');await studio.locator('[data-toggle=asleep]').uncheck();await page.waitForTimeout(3500);
 await studio.locator('#dance').click();assert.equal(await pet.getAttribute('data-state'),'dance');await page.waitForTimeout(100);assert.equal(await pet.locator('#saber-rig-headphones').getAttribute('visibility'),'visible');await studio.locator('#dance').click();
 for(const width of [1920,1440,800,390]){await page.setViewportSize({width,height:1080});await page.waitForTimeout(150);assert.equal(await pet.locator('canvas').evaluate(c=>c.width),2048,'Display size must not reduce rendering quality');const m=await studio.evaluate(d=>{const p=d.querySelector('.saber-companion .pet-button').getBoundingClientRect(),s=d.querySelector('#pet-subtitle').getBoundingClientRect(),a=d.querySelector('.preview-actions').getBoundingClientRect();return {gap:p.top-s.bottom,bottom:p.bottom,actions:a.top,overflow:d.scrollWidth>d.clientWidth+1}});assert(m.gap>=0,JSON.stringify(m));assert(m.bottom<=m.actions+1,JSON.stringify(m));assert(!m.overflow,JSON.stringify(m));await studio.screenshot({path:path.join(dir,'studio-'+width+'.png')});}
 await page.setViewportSize({width:1920,height:1080});await studio.locator('[data-tab=name]').click();await studio.locator('[data-toggle=platform]').uncheck();assert(!(await pet.locator('.saber-platform').isVisible()));await studio.locator('[data-toggle=platform]').check();
 await studio.locator('[data-tab=settings]').click();await studio.locator('[data-toggle=motion]').uncheck();await page.waitForTimeout(100);const face=await pet.locator('#saber-rig-face').getAttribute('transform');await page.waitForTimeout(200);assert.equal(await pet.locator('#saber-rig-face').getAttribute('transform'),face);await studio.locator('[data-toggle=motion]').check();
 await studio.locator('#pet-select').selectOption('highland');assert(!(await pet.isVisible()));await studio.locator('#pet-select').selectOption('saber');await studio.locator('.studio-close').click();assert(await pet.isVisible());assert.equal(await pet.locator('canvas').evaluate(c=>c.width),2048,'Leaving Studio must preserve full resolution');await page.evaluate(()=>window.dispatchEvent(new CustomEvent('colt-radio-playback',{detail:{playing:true}})));assert.equal(await pet.getAttribute('data-state'),'dance');await page.evaluate(()=>window.dispatchEvent(new CustomEvent('colt-radio-playback',{detail:{playing:false}})));
 const invalid=await page.evaluate(async prefs=>(await fetch('/api/companion-preferences',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...prefs,saber:{...prefs.saber,skin:'invalid'}})})).status,saved);assert.equal(invalid,400);
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('classroom-launchpad-rendered',{detail:{screen:'login',auth:{authenticated:false}}})));await page.waitForTimeout(100);assert(!(await pet.isVisible()));assert.deepEqual(errors,[]);console.log('PASS: Saber selection, persistence, actions, sleep/wake, radio, headwear, sizes, platform, motion, switching, validation and logout. Screenshots: '+dir);
 }finally{await browser?.close();server.kill()}
})().catch(e=>{console.error(e);process.exitCode=1});
