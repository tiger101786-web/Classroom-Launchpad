const fs = require('node:fs');
const assert = require('node:assert/strict');
const {chromium} = require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1280,height:1000}});
  await page.setContent('<body data-theme="night"><main style="padding:50px"></main></body>');
  for(const file of ['styles.css','collectible-shelf.css','launchpad-scenes.css']) await page.addStyleTag({content:fs.readFileSync(file,'utf8')});
  for(const file of ['collectible-shelf.js','launchpad-scenes.js']) await page.addScriptTag({content:fs.readFileSync(file,'utf8')});
  await page.evaluate(()=>{
   const s={authenticated:true,homeShelf:{enabled:true},homeShelfRight:{enabled:true},homeScene:{id:'pixel'}};
   document.querySelector('main').innerHTML='<div class="home-display-row"><div class="home-shelf-position">'+CollectibleShelf.render(s,'left')+'</div>'+LaunchpadScenes.render(s,'')+'<div class="home-shelf-position">'+CollectibleShelf.render(s,'right')+'</div></div>';
   LaunchpadScenes.attach(s,'',()=>{});
  });
  for(const side of ['left','right']) {
   const root=page.locator('.home-collectible-shelf[data-shelf-side="'+side+'"]');
   const gear=root.locator('.shelf-customize');
   const box=await root.boundingBox(), g=await gear.boundingBox();
   assert(Math.abs((side==='left'?box.x+box.width-g.x-g.width:g.x-box.x)-7)<1,'Gears should face the scene');
   await root.dispatchEvent('pointermove');
   await page.waitForTimeout(300);
   assert.equal(await gear.evaluate(e=>getComputedStyle(e).opacity),'1');
   await root.dispatchEvent('pointerout',{relatedTarget:null});
   assert.equal(await gear.evaluate(e=>getComputedStyle(e).opacity),'0','Shelf gear lingered');
   const zone=root.locator('.shelf-visibility-zone'), controls=zone.locator('.shelf-visibility-controls');
   await zone.dispatchEvent('pointermove');
   assert.equal(await controls.evaluate(e=>getComputedStyle(e).opacity),'1');
   await zone.dispatchEvent('pointerout',{relatedTarget:null});
   assert.equal(await controls.evaluate(e=>getComputedStyle(e).opacity),'0','Hide button lingered');
  }
  const stage=page.locator('.launch-scene-stage'), gear=page.locator('#launchSceneSettings');
  await stage.dispatchEvent('pointermove');
  await page.waitForTimeout(300);
  assert.equal(await gear.evaluate(e=>getComputedStyle(e).opacity),'1');
  await stage.dispatchEvent('pointerleave');
  assert.equal(await gear.evaluate(e=>getComputedStyle(e).opacity),'0','Scene gear lingered');
  await page.keyboard.press('Tab');
  await gear.focus();
  await stage.dispatchEvent('pointerleave');
  await page.waitForTimeout(300);
  assert.equal(await gear.evaluate(e=>getComputedStyle(e).opacity),'1','Keyboard focus must stay visible');
  console.log('PASS: gears face the scene; scene/shelf gears and Hide controls disappear immediately on exit; keyboard focus remains visible.');
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
