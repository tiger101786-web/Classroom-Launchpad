const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const ids=['disney-insect-meadow','disney-zootopia','disney-casita','disney-highland-castle'];
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1000,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://scene-test.local/**',r=>{const p=new URL(r.request().url()).pathname;return p==='/'?r.fulfill({contentType:'text/html',body:'<html><body data-theme="night"><main></main></body></html>'}):r.fulfill({path:path.join(root,p.slice(1))});});
  await page.goto('https://scene-test.local/');
  for(const f of ['styles.css','launchpad-scenes.css','scene-frame-fit.css','scene-matched-frames.css','disney-oct6-scenes.css','scene-exterior-frames.css','scene-motion-tuning.css'])await page.addStyleTag({path:path.join(root,f)});
  await page.addScriptTag({path:path.join(root,'launchpad-scenes.js')});
  await page.addStyleTag({content:'main{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:20px}.home-scene-feature{width:440px!important}.launch-scene-stage{width:400px!important;height:400px!important;margin:auto}'});
  await page.evaluate(ids=>{document.querySelector('main').innerHTML=ids.map(id=>LaunchpadScenes.render({authenticated:true,homeScene:{id,frame:'none',motion:true}},'')).join('');},ids);
  await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth));
  await page.waitForTimeout(1200);
  const report=await page.evaluate(()=>[...document.querySelectorAll('.launch-scene')].map(s=>({id:s.dataset.scene,particles:getComputedStyle(s.querySelector('.launch-scene-particles')).display,effects:[...s.querySelectorAll('.disney-extra-effects b')].map(e=>getComputedStyle(e).animationName),seed:getComputedStyle(s.querySelector('i')).animationName})));
  assert.equal(report[0].seed,'meadow-background-seed');
  for(const r of report.slice(1))assert.equal(r.particles,'none');
  assert(report[2].effects.includes('casita-window-warmth'));assert(report[2].effects.includes('casita-offscreen-rays'));
  assert(report[3].effects.includes('highland-coastal-waves'));assert(report[3].effects.includes('highland-lake-ripples'));
  const before=await page.locator('.scene-disney-highland-castle .disney-water').evaluate(e=>getComputedStyle(e).backgroundPosition);
  await page.waitForTimeout(500);
  assert.notEqual(await page.locator('.scene-disney-highland-castle .disney-water').evaluate(e=>getComputedStyle(e).backgroundPosition),before);
  await page.screenshot({path:path.join(__dirname,'disney-motion-preview.png'),fullPage:true});
  await page.evaluate(()=>document.querySelectorAll('.launch-scene').forEach(e=>e.classList.add('is-paused')));
  assert(await page.evaluate(()=>document.getAnimations().every(a=>a.playState==='paused')));
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.evaluate(()=>document.getAnimations().length),0);
  assert.deepEqual(errors,[]);
  console.log('PASS: four scene effects, removed particles, moving water, pause, reduced motion and image loading.',report);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
