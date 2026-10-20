const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});
 try{
  const page=await browser.newPage({viewport:{width:1000,height:850}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file:///'+path.join(__dirname,'colt-painted-skins-preview.html').replaceAll('\\','/'));
  for(const skin of ['Original','Panda','Tiger']){
   await page.evaluate(s=>showPaintedSkin(s),skin);
   await page.getByRole('button',{name:'Tail wag',exact:true}).first().click();
   const motion=await page.locator('#rc-tail').evaluate(e=>{
    const a=e.getAnimations()[0];a.pause();a.currentTime=360;
    return {timing:a.effect.getTiming(),frames:a.effect.getKeyframes(),origin:getComputedStyle(e).transformOrigin};
   });
   assert.equal(motion.timing.duration,1200);assert.equal(motion.timing.easing,'linear');
   assert.equal(motion.frames.length,101);assert.equal(motion.origin,'510px 547px');
   const angles=motion.frames.map(f=>Number(f.transform.match(/rotate\(([-\d.e]+)deg\)/)[1]));
   assert.equal(angles[0],0);assert(Math.abs(angles.at(-1))<.001);
   assert(Math.max(...angles)>15&&Math.min(...angles)<-15);
   for(let i=1;i<angles.length;i++)assert(Math.abs(angles[i]-angles[i-1])<5,'No sharp angular jumps');
   if(skin==='Panda')await page.locator('.pet-button').screenshot({path:path.join(__dirname,'panda-tail-midwag.png')});
   await page.locator('#rc-tail').evaluate(e=>e.getAnimations()[0].finish());
   await page.waitForTimeout(30);assert.equal(await page.locator('#rc-tail').evaluate(e=>e.getAnimations().length),0);
  }
  await page.evaluate(()=>showPaintedSkin('Panda'));
  await page.locator('#music').click();
  const loop=await page.locator('#rc-tail').evaluate(e=>{const a=e.getAnimations()[0];return {timing:a.effect.getTiming(),frames:a.effect.getKeyframes()}});
  assert.equal(loop.timing.duration,480);assert.equal(loop.timing.iterations,Infinity);
  for(const i of [0,loop.frames.length-1])assert(Math.abs(Number(loop.frames[i].transform.match(/rotate\(([-\d.e]+)deg\)/)[1]))<.001);
  await page.locator('#sleep').click();
  assert.equal(await page.locator('#rc-tail').evaluate(e=>e.getAnimations().length),0,'Sleep cancels wag');
  await page.locator('#music').click();await page.locator('#sleep').click();
  await page.waitForTimeout(5200);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.getByRole('button',{name:'Tail wag',exact:true}).first().click();
  assert.equal(await page.locator('#rc-tail').evaluate(e=>e.getAnimations().length),0,'Reduced motion prevents wag');
  const round=await page.locator('#rc-ear-left-shape').getAttribute('d');
  await page.evaluate(()=>showPaintedSkin('Original'));
  assert.equal(await page.locator('#rc-ear-left-shape').getAttribute('d'),round,'Panda uses normal Colt ear cutouts');
  assert.deepEqual(errors,[]);
  console.log('PASS: fluid tail, neutral settle, seamless dance loop, sleep/reduced motion, panda ear reset.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
