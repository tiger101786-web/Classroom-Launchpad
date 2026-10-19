const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:1200,height:900}});
 await page.goto('file:///'+path.join(__dirname,'colt-skins-preview.html').replaceAll('\\','/'));
 for(const skin of ['Original','Porcelain','Obsidian Ember']){
  await page.evaluate(skin=>api.update({account:'preview',visible:true,radio:false,preferences:{...roboColtDefaults(),skin,asleep:true,motion:true}}),skin);
  const frames=await page.locator('.mouth-sleep').evaluate(e=>{
   const animation=e.getAnimations()[0];animation.pause();
   return [0,1400,2800].map(t=>{animation.currentTime=t;const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,h:r.height}});
  });
  assert(frames[1].h>frames[0].h*1.4);
  for(const f of frames){assert(Math.abs(f.x-frames[0].x)<.02);assert(Math.abs(f.y-frames[0].y)<.02)}
  assert(Math.abs(frames[2].h-frames[0].h)<.02);
  assert(await page.locator('#rc-puppet').evaluate(e=>e.getAnimations({subtree:true}).every(a=>a.effect.target.classList.contains('mouth-sleep'))));
 }
 await page.evaluate(()=>api.update({account:'preview',visible:true,radio:false,preferences:{...roboColtDefaults(),asleep:true,motion:false}}));
 assert.equal(await page.locator('.mouth-sleep').evaluate(e=>e.getAnimations().length),0);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.evaluate(()=>api.update({account:'preview',visible:true,radio:false,preferences:{...roboColtDefaults(),asleep:true,motion:true}}));
 assert.equal(await page.locator('.mouth-sleep').evaluate(e=>e.getAnimations().length),0);
 console.log('PASS: smooth centered sleep mouth for all artwork types, still body, motion-off and reduced-motion respected.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
