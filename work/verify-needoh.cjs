const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),shelf=require('../collectible-shelf');
(async()=>{
 assert.equal(shelf.items.find(i=>i.id==='hatsune-miku-statue').category,'Anime');
 assert(shelf.valid({enabled:true,theme:'needoh',slots:['hatsune-miku-statue','none','none']}));
 const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
 assert(server.includes('homeSceneIds.add("needoh")'));assert(server.includes('homeSceneFrameIds.add("match-needoh")'));
 for(const file of ['scene-frame-match-needoh-thin-v2.png','collectible-shelf-needoh.png','shelf-hatsune-miku-statue.png']) assert((await sharp(path.join(root,'assets',file)).metadata()).hasAlpha);
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 const page=await browser.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(r.url()));
 await page.route('https://test.local/**',r=>{const p=new URL(r.request().url()).pathname;return p==='/'?r.fulfill({contentType:'text/html',body:'<html><body data-theme="night"><main></main></body></html>'}):r.fulfill({path:path.join(root,p.slice(1))});});
 await page.goto('https://test.local/');
 for(const f of ['styles.css','launchpad-scenes.css','scene-frame-fit.css','scene-matched-frames.css','scene-exterior-frames.css','collectible-shelf.css'])await page.addStyleTag({path:path.join(root,f)});
 for(const f of ['launchpad-scenes.js','collectible-shelf.js'])await page.addScriptTag({path:path.join(root,f)});
 await page.addStyleTag({content:'main{padding:40px;display:flex;flex-wrap:wrap;gap:50px;justify-content:center}.demo-shelf{width:300px;padding-top:90px}.home-scene-feature{width:260px!important}.launch-scene-stage{width:240px!important;height:240px!important}.launch-scene-stage>.school-photo{width:240px!important;height:240px!important;min-width:0!important;margin:0!important}'});
 for(const width of [1200,390]){
 await page.setViewportSize({width,height:950});
 await page.evaluate(()=>document.querySelector('main').innerHTML=LaunchpadScenes.render({authenticated:true,homeScene:{id:'needoh',frame:'match-needoh',motion:true}},'')+'<div class="demo-shelf">'+CollectibleShelf.art({enabled:true,theme:'needoh',slots:['hatsune-miku-statue','hatsune-miku-statue','hatsune-miku-statue']})+'</div>');
 await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth));
 await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
 await page.waitForTimeout(100);
 const rays=page.locator('.needoh-sun-rays');
 assert.equal(await rays.evaluate(e=>getComputedStyle(e).animationName),'needoh-sun-rays');
 const start=await rays.evaluate(e=>getComputedStyle(e).transform);
 await page.waitForTimeout(400);
 assert.notEqual(await rays.evaluate(e=>getComputedStyle(e).transform),start);
 // Inspect the strongest ray phase, not just its low-opacity first frame.
 await rays.evaluate(e=>e.getAnimations().forEach(a=>a.currentTime=6500));
 assert(await page.locator('.scene-frame-exterior').evaluate(e=>+getComputedStyle(e).zIndex<+getComputedStyle(e.parentElement.querySelector('.launch-scene')).zIndex));
 await page.screenshot({path:path.join(__dirname,`needoh-${width}.png`),fullPage:true});
 await page.evaluate(()=>CollectibleShelf.open({selected:{enabled:true,theme:'needoh',slots:['hatsune-miku-statue','none','none']},save:async v=>window.saved=v}));
 await page.locator('#shelfCategory').selectOption('Anime');await page.locator('#shelfSearch').fill('Hatsune Miku');
 const card=page.locator('[data-shelf-item="hatsune-miku-statue"]');await card.click();
 assert(await card.evaluate(el=>{const c=el.getBoundingClientRect(),a=el.querySelector('.shelf-object > div').getBoundingClientRect();return a.left>=c.left&&a.right<=c.right&&a.top>=c.top&&a.bottom<=c.bottom;}));
 await page.locator('#shelfStylesTab').click();await page.locator('#shelfSearch').fill('NeeDoh');await page.locator('[data-shelf-theme-choice="needoh"]').click();
 await page.screenshot({path:path.join(__dirname,`needoh-chooser-${width}.png`),fullPage:true});
 await page.locator('#saveShelf').click();assert.equal((await page.evaluate(()=>window.saved)).theme,'needoh');
 }
 await page.evaluate(()=>document.querySelector('.launch-scene').classList.add('is-paused'));
 assert(await page.evaluate(()=>document.getAnimations().every(a=>a.playState==='paused')));
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.evaluate(()=>document.getAnimations().length),0);
 assert.deepEqual(errors,[]);console.log('PASS: desktop/mobile artwork, transparent assets, unobstructed frame layer, Miku category/card/save, shelf selection/save, pause and reduced motion.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
