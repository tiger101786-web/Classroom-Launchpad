const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:1200,height:900}});
 await page.goto('file:///'+path.join(__dirname,'colt-skins-preview.html').replaceAll('\\','/'));
 for(const skin of ['Original','Porcelain','Obsidian Ember']){
  await page.evaluate(skin=>api.update({account:'preview',visible:true,radio:true,preferences:{...roboColtDefaults(),skin}}),skin);
  const head=page.locator('#rc-head');assert.equal(await head.locator('#rc-mouth').count(),1);assert.equal(await head.locator('#rc-headphones').count(),1);
  assert.equal(await head.locator('.eye').count(),2);
  for(const [t,label] of [[320,'right'],[960,'left']]){
   const rotation=await head.evaluate((e,t)=>{const a=e.getAnimations()[0];a.pause();a.currentTime=t;return new DOMMatrix(getComputedStyle(e).transform).b},t);
   assert(label==='right'?rotation>0:rotation<0);
   await page.locator('.pet-button').screenshot({path:path.join(__dirname,'head-dance-'+skin.replaceAll(' ','-')+'-'+label+'.png')});
  }
  assert.equal(await page.locator('#rc-platform').evaluate(e=>e.getAnimations({subtree:true}).length),0);
  await page.evaluate(skin=>api.update({account:'preview',visible:true,radio:false,preferences:{...roboColtDefaults(),skin}}),skin);
  assert.equal(await head.evaluate(e=>getComputedStyle(e).transform),'none');
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.evaluate(()=>api.update({account:'preview',visible:true,radio:true,preferences:roboColtDefaults()}));
 assert.equal(await page.locator('#rc-head').evaluate(e=>e.getAnimations().length),0);
 console.log('PASS: head sways both ways with face/accessories attached; platform stays still; stop and reduced motion reset head.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
