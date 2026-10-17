const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage();await page.clock.install();
  await page.setContent('<div id="fixture"><h1></h1><div class="eyebrow"></div><div class="stage"><span></span><img class="toy"></div><div class="panel"><div><h2></h2><p></p></div><div class="note"></div></div></div>');
  await page.evaluate(()=>{Math.random=()=>0;});
  await page.addScriptTag({content:fs.readFileSync(path.join(__dirname,'../dumpling-pet/interactive.js'),'utf8')});
  await page.evaluate(()=>{window.petApi=window.createDumplingPet(document.querySelector('#fixture'));});
  const moving=()=>page.locator('.moving-bun').evaluate(e=>e.getAnimations().length);
  await page.clock.runFor(6000);assert.equal(await moving(),0,'No constant idle bouncing');
  await page.clock.runFor(6050);assert.equal(await page.locator('.pet-button').evaluate(e=>e.classList.contains('smiling')),true,'Occasional smile');
  await page.clock.runFor(2000);assert.equal(await page.locator('.pet-button').evaluate(e=>e.classList.contains('smiling')),false);
  await page.clock.runFor(8000);assert.equal(await moving(),1,'Occasional bounce begins after a quiet interval');
  // Browser animation timelines are independent from the mocked timer clock.
  await page.locator('.moving-bun').evaluate(async e=>{await Promise.all(e.getAnimations().map(a=>a.finished));});
  assert.equal(await moving(),0,'Bounce settles completely');
  await page.evaluate(()=>window.petApi.setRadio(true));
  assert.equal(await page.locator('.moving-bun').evaluate(e=>e.getAnimations()[0].effect.getTiming().duration),600,'Fast music dance');
  assert.equal(await page.locator('.pet-button').evaluate(e=>e.classList.contains('radio-dancing')),true);
  assert.equal(await page.locator('.moving-bun').evaluate(e=>e.getAnimations()[0].effect.getTiming().iterations),Infinity);
  await page.evaluate(()=>window.petApi.setIdle(false));assert.equal(await moving(),0);
  assert.equal(await page.locator('.pet-button').evaluate(e=>e.classList.contains('radio-dancing')),false);
  await page.clock.runFor(45000);assert.equal(await moving(),0,'Motion off stops all automatic movement');
  await page.evaluate(()=>{window.petApi.setIdle(true);window.petApi.setRadio(false);});assert.equal(await moving(),0);
  await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>window.petApi.setRadio(true));assert.equal(await moving(),0);
  console.log('Dumpling timing passed: occasional smiles/bounces, radio loop, settled body, motion off and reduced motion.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
