const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const origin='http://127.0.0.1:8178',dir=fs.mkdtempSync(path.join(os.tmpdir(),'highland-production-'));
const server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:'8178',DATA_DIR:dir,SESSION_SECRET:'highland-test',TEACHER_PIN:'654321'},stdio:'pipe'});let browser;
(async()=>{try{
for(let i=0;i<100;i++){try{if((await fetch(origin+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
const login=await fetch(origin+'/api/auth/teacher',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({pin:'654321'})});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0],eq=cookie.indexOf('=');
browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});const context=await browser.newContext({viewport:{width:1920,height:1080}});await context.addCookies([{name:cookie.slice(0,eq),value:cookie.slice(eq+1),url:origin}]);const page=await context.newPage(),errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='warning'&&m.text().includes('Highland'))console.log(m.text())});page.on('response',r=>{if(r.url().includes('highland-pet')&&!r.ok())failed.push(r.url())});
const open=async()=>{await page.goto(origin,{waitUntil:'domcontentloaded'});await page.evaluate(()=>window.dispatchEvent(new CustomEvent('classroom-launchpad-rendered',{detail:{screen:'home',auth:{authenticated:true,role:'teacher'}}})));await page.waitForFunction(()=>document.querySelector('.companion-picker select')?.disabled===false);await page.locator('.header-account-summary').first().click();await page.locator('.header-account-menu [data-companion-open]').first().click();};
await open();const studio=page.locator('.pet-studio');await studio.locator('#pet-select').selectOption('highland');const pet=page.locator('.highland-companion');await page.waitForFunction(()=>document.querySelector('.highland-companion').dataset.ready);assert.equal(await pet.getAttribute('data-ready'),'true');assert(await pet.isVisible());assert.equal(await studio.locator('.skin-card').count(),1);
await studio.locator('[data-subtab=accessories]').click();
for(const hat of ['cap','wreath','headphones','none']){
 await studio.locator('[data-choice-key=headwear][data-choice="'+hat+'"]').click();
 assert.equal(await pet.getAttribute('data-headwear'),hat);
 assert.equal(await pet.locator('canvas').count(),1);
}
await studio.locator('[data-choice-key=headwear][data-choice=wreath]').click();
await studio.locator('[data-choice-key=neckwear][data-choice=scarf]').click();
assert.equal(await pet.getAttribute('data-neckwear'),'scarf');
await page.waitForTimeout(700);
const saved=await (await fetch(origin+'/api/companion-preferences',{headers:{Cookie:cookie}})).json();
assert.equal(saved.preferences.highland.headwear,'wreath');assert.equal(saved.preferences.highland.neckwear,'scarf');
const invalidAccessory=await fetch(origin+'/api/companion-preferences',{method:'PUT',headers:{Cookie:cookie,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({...saved.preferences,highland:{...saved.preferences.highland,headwear:'invalid'}})});assert.equal(invalidAccessory.status,400);
await studio.screenshot({path:path.join(dir,'accessories.png')});
const cdp=await context.newCDPSession(page);let compositorLayers=[];cdp.on('LayerTree.layerTreeDidChange',e=>compositorLayers=e.layers||[]);await cdp.send('LayerTree.enable');await page.waitForTimeout(200);
const documentNode=await cdp.send('DOM.getDocument');
for(const id of ['scarf','wreath']){
 const selected=await cdp.send('DOM.querySelector',{nodeId:documentNode.root.nodeId,selector:`[data-highland-wearable=${id}] > div`});
 const {node}=await cdp.send('DOM.describeNode',{nodeId:selected.nodeId});
 const layer=compositorLayers.find(l=>l.backendNodeId===node.backendNodeId);assert(layer,`${id} must have its own compositor layer`);
 const reasons=await cdp.send('LayerTree.compositingReasons',{layerId:layer.layerId});
 assert(reasons.compositingReasons.some(reason=>/active accelerated transform animation/i.test(reason)),`${id} animation must run on the compositor`);
}
await cdp.detach();
// Accessories share the preview's native SVG transforms and body frame clock.
const playback=await page.evaluate(()=>new Promise(resolve=>{const original=WebGLRenderingContext.prototype.drawArrays;let draws=0,frames=0;const batches=[];WebGLRenderingContext.prototype.drawArrays=function(...args){if(this.canvas.closest('.highland-companion'))draws++;return original.apply(this,args)};function sample(){if(frames++)batches.push(draws);draws=0;if(frames<75)requestAnimationFrame(sample);else{WebGLRenderingContext.prototype.drawArrays=original;resolve(batches)}}requestAnimationFrame(sample)}));
assert(playback.filter(n=>n===1).length>=65,'Cow should render on consecutive animation frames without re-rasterizing accessories');
const accessoryFrames=await pet.evaluate(host=>new Promise(resolve=>{const frames=[];function sample(){frames.push([...host.querySelectorAll('[data-highland-wearable]:not([hidden])')].map(n=>getComputedStyle(n.firstElementChild).transform));if(frames.length<40)requestAnimationFrame(sample);else resolve(frames)}sample()}));
assert(accessoryFrames.every(f=>f.length===2),'Scarf and wreath both remain visible');
assert(new Set(accessoryFrames.map(f=>f[0])).size>30,'Accessory motion should advance continuously');
assert.equal(await pet.locator('[data-highland-wearable=scarf] pattern').count(),2,'Scarf retains original vector patterns');
assert.equal(await pet.locator('foreignObject [data-highland-wearable]').count(),0,'Accessories must not use nested HTML compositor layers');
assert.equal(await pet.locator('.pet-button > #cow-accessories').count(),1,'Wearables are outside the main-thread SVG/foreignObject paint surface');
assert.equal(await pet.evaluate(h=>h.querySelector('[data-highland-wearable=scarf]').firstElementChild.getAnimations()[0].playState),'running');
assert.equal(await pet.locator('[data-highland-wearable=wreath] image').getAttribute('href'),'highland-pet/heather-wreath-v3.png');
assert.equal(fs.readFileSync('highland-pet/heather-wreath-v3.png').compare(fs.readFileSync('work/highland-cow-preview/heather-wreath-v3.png')),0,'Wreath must be the exact approved preview image');
await studio.locator('[data-tab=name]').click();await studio.locator('#pet-name').fill('Heather');await studio.locator('#size-select').selectOption('extra-large');await page.waitForTimeout(700);
await open();assert.equal(await studio.locator('#pet-select').inputValue(),'highland');await page.waitForFunction(()=>document.querySelector('.highland-companion').dataset.ready==='true');assert.equal(await pet.locator('#highland-pet-name').textContent(),'Heather');
await studio.locator('[data-tab=play]').click();assert.equal(await studio.locator('[data-action=look]').count(),0);for(const b of await studio.locator('[data-action]').all()){await b.click();await page.waitForTimeout(100)}
await studio.locator('[data-toggle=asleep]').check();assert.equal(await pet.getAttribute('data-state'),'sleep');await page.waitForTimeout(300);assert.equal(await pet.locator('#highland-tongue').getAttribute('opacity'),'0');const a=await pet.locator('#highland-face-motion').getAttribute('transform');await page.waitForTimeout(200);assert.notEqual(await pet.locator('#highland-face-motion').getAttribute('transform'),a);await studio.locator('[data-toggle=asleep]').uncheck();await page.waitForTimeout(3600);
await studio.locator('#dance').click();assert.equal(await pet.getAttribute('data-state'),'dance');assert.equal(await pet.getAttribute('data-headwear'),'headphones');assert.equal(await pet.locator('#cow-accessories').count(),1);assert.equal(await pet.getAttribute('data-neckwear'),'scarf');await studio.locator('#dance').click();assert.equal(await pet.getAttribute('data-headwear'),'wreath');
for(const theme of ['crimson','woodland','sky','scrapbook']){await studio.locator('[aria-label="Studio theme"]').selectOption(theme);await studio.screenshot({path:path.join(dir,theme+'.png')});}
for(const width of [1920,1440,800,390]){await page.setViewportSize({width,height:1080});await page.waitForTimeout(100);const m=await studio.evaluate(d=>{const p=d.querySelector('.highland-companion .pet-button').getBoundingClientRect(),s=d.querySelector('#pet-subtitle').getBoundingClientRect(),a=d.querySelector('.preview-actions').getBoundingClientRect();return {gap:p.top-s.bottom,bottom:p.bottom,actions:a.top,overflow:d.scrollWidth>d.clientWidth+1}});assert(m.gap>=0,JSON.stringify(m));assert(m.bottom<=m.actions+1,JSON.stringify(m));assert(!m.overflow,JSON.stringify(m));await studio.screenshot({path:path.join(dir,'studio-'+width+'.png')});}
await page.setViewportSize({width:1920,height:1080});await studio.locator('[data-tab=name]').click();await studio.locator('[data-toggle=platform]').uncheck();assert(!(await pet.locator('.highland-platform').isVisible()));assert(!(await pet.locator('.highland-nameplate').isVisible()));await studio.locator('[data-toggle=platform]').check();await studio.locator('[data-toggle=nameplate]').uncheck();assert(!(await pet.locator('.highland-nameplate').isVisible()));await studio.locator('[data-toggle=nameplate]').check();
await studio.locator('[data-tab=settings]').click();await studio.locator('[data-toggle=motion]').uncheck();await page.waitForTimeout(80);const frozen=await pet.locator('#highland-face-motion').getAttribute('transform');await page.waitForTimeout(180);assert.equal(await pet.locator('#highland-face-motion').getAttribute('transform'),frozen);assert.equal(await pet.evaluate(h=>h.querySelector('[data-highland-wearable=wreath]').firstElementChild.getAnimations()[0].playState),'paused','Motion off pauses compositor animation');await studio.locator('[data-toggle=motion]').check();
for(const kind of ['colt','squishy','gummy','eagle','labubu','roblox','highland']){await studio.locator('#pet-select').selectOption(kind);await page.waitForTimeout(100)}
await studio.locator('.studio-close').click();await pet.waitFor({state:'visible'});assert(await pet.isVisible());assert.equal(await pet.getAttribute('data-size'),'extra-large');assert.equal(Math.round((await pet.boundingBox()).width),200);await page.screenshot({path:path.join(dir,'live.png')});
await pet.locator('.pet-button').focus();const before=await pet.boundingBox();await page.keyboard.press('ArrowLeft');assert((await pet.boundingBox()).x<before.x);
await page.evaluate(()=>window.dispatchEvent(new CustomEvent('colt-radio-playback',{detail:{playing:true}})));assert.equal(await pet.getAttribute('data-state'),'dance');await page.evaluate(()=>window.dispatchEvent(new CustomEvent('colt-radio-playback',{detail:{playing:false}})));assert.equal(await pet.getAttribute('data-state'),'idle');
await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(80);const rest=await pet.locator('#highland-face-motion').getAttribute('transform');await page.waitForTimeout(200);assert.equal(await pet.locator('#highland-face-motion').getAttribute('transform'),rest);await page.emulateMedia({reducedMotion:'no-preference'});
const prefs=await page.evaluate(async()=> (await (await fetch('/api/companion-preferences')).json()).preferences);assert.equal(prefs.highland.name,'Heather');const invalid=await page.evaluate(async prefs=>(await fetch('/api/companion-preferences',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...prefs,highland:{...prefs.highland,skin:'invalid'}})})).status,prefs);assert.equal(invalid,400);
await page.evaluate(()=>window.dispatchEvent(new CustomEvent('classroom-launchpad-rendered',{detail:{screen:'login',auth:{authenticated:false}}})));await page.waitForTimeout(100);assert(!(await pet.isVisible()));assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);console.log('PASS: Highland Studio integration, saved preferences, actions, radio, sleep, motion, themes, sizes, switching, logout and validation. Screenshots: '+dir);
}finally{await browser?.close();server.kill()}})().catch(e=>{console.error(e);process.exitCode=1});
