"use strict";
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});
 try {
  const page=await browser.newPage({viewport:{width:1450,height:950}});
  await page.route('http://hero.test/**',async route=>{
   const file=path.join(root,new URL(route.request().url()).pathname);
   return route.fulfill(fs.existsSync(file)&&fs.statSync(file).isFile()?{path:file}:{contentType:'text/html',body:'<!doctype html><body data-theme="night"></body>'});
  });
  await page.goto('http://hero.test/');
  await page.addStyleTag({url:'http://hero.test/styles.css'});
  await page.evaluate(()=>{document.body.innerHTML='<section class="hero-panel" style="width:1120px;height:740px"><video class="hero-bg-video" muted playsinline src="/assets/hero-panel-bg.mp4"></video><video class="hero-colt-mobile-video"></video><div class="topbar">Header layout check</div></section>';});
  await page.waitForFunction(()=>document.querySelector('.hero-bg-video').readyState>=2);
  for(const [width,height] of [[1120,740],[900,740],[1120,550]]){
   await page.locator('.hero-panel').evaluate((el,size)=>{el.style.width=size[0]+'px';el.style.height=size[1]+'px';},[width,height]);
   const result=await page.locator('.hero-bg-video').evaluate(v=>{const s=getComputedStyle(v);return {position:s.objectPosition,fit:s.objectFit,width:v.videoWidth,height:v.videoHeight};});
   assert.equal(result.position,'100% 0%');assert.equal(result.fit,'cover');assert(result.width>0);
   for(const time of [0,2,4]){
    await page.locator('.hero-bg-video').evaluate(async(v,time)=>{v.pause();if(v.currentTime!==time)await new Promise(resolve=>{v.addEventListener('seeked',resolve,{once:true});v.currentTime=time;});},time);
    await page.locator('.hero-panel').screenshot({path:path.join(os.tmpdir(),`hero-fit-${width}-${height}-${time}.png`)});
   }
  }
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.locator('.hero-bg-video').evaluate(v=>getComputedStyle(v).display),'none');
  assert.equal(await page.locator('.hero-colt-mobile-video').evaluate(v=>getComputedStyle(v).objectPosition),'50% 50%');
  console.log('Desktop right-edge anchoring checked at three card sizes and video timestamps; mobile background unchanged.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
