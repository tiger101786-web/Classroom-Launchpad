const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const shelf=require('../collectible-shelf');
const root=path.resolve(__dirname,'..');
const selection={enabled:true,theme:'audubon-zoo',slots:['giraffe-statue','giraffe-family-statue','flamingo']};
assert(shelf.valid(selection));assert.deepEqual(shelf.clean(selection),selection);
assert.equal(shelf.items.find(x=>x.id==='giraffe-family-statue').category,'Animal Friends');
assert.equal(new Set(shelf.items.map(x=>x.id)).size,shelf.items.length);
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:950}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('requestfailed',r=>console.log('REQUEST_FAILED',r.url(),r.failure()));
  await page.route('https://launchpad-test.local/**',r=>{
   const p=new URL(r.request().url()).pathname;
   if(p==='/')return r.fulfill({contentType:'text/html',body:'<html><body data-theme="night"><div id="coltRadioRoot"></div><main id="gallery" style="width:min(90vw,650px);margin:260px auto 0"></main></body></html>'});
   const filename=path.join(root,p.slice(1));return fs.existsSync(filename)?r.fulfill({path:filename}):r.abort();
  });
  await page.goto('https://launchpad-test.local/');
  for(const file of ['styles.css','launchpad-scenes.css','collectible-shelf.css'])await page.addStyleTag({content:fs.readFileSync(path.join(root,file),'utf8')});
  for(const file of ['collectible-shelf.js','colt-radio.js'])await page.addScriptTag({content:fs.readFileSync(path.join(root,file),'utf8')});
  await page.evaluate(s=>document.querySelector('#gallery').innerHTML=CollectibleShelf.art(s),selection);
  await page.waitForTimeout(700);
  const placed=await page.evaluate(()=>{const s=document.querySelector('#gallery .collectible-shelf'),b=s.getBoundingClientRect();return [...s.querySelectorAll('.shelf-object')].map(o=>{const r=o.getBoundingClientRect();return (r.bottom-r.width*4/220-b.top)/b.height;});});
  assert(placed.length===3&&placed.every(y=>y>=.426&&y<=.482),JSON.stringify(placed));
  await page.screenshot({path:path.join(__dirname,'audubon-zoo-shelf-preview.png'),fullPage:true});
  for(const width of [1200,390]){
   await page.setViewportSize({width,height:950});
   await page.evaluate(s=>CollectibleShelf.open({selected:s,save:async v=>{window.testSaved=v;}}),selection);
   await page.locator('#shelfSearch').fill('giraffe');
   assert.equal(await page.locator('[data-shelf-item="giraffe-family-statue"]').count(),1);
   await page.locator('#shelfStylesTab').click();await page.locator('#shelfSearch').fill('Audubon');
   await page.locator('[data-shelf-theme-choice="audubon-zoo"]').click();
   await page.screenshot({path:path.join(__dirname,`audubon-zoo-chooser-${width}.png`),fullPage:true});
   await page.locator('#saveShelf').click();await page.waitForTimeout(100);
   assert.equal((await page.evaluate(()=>window.testSaved)).theme,'audubon-zoo');
  }
  await page.getByRole('button',{name:'Open Colt Radio',exact:true}).click();
  for(const query of ['Punk Rock','Classic Buzz','Green Day','Offspring']){
   await page.locator('.colt-radio-search-input').fill(query);
   assert(await page.getByRole('button',{name:'Punk Rock • 181.FM Classic Buzz',exact:true}).isVisible());
  }
  await page.getByRole('button',{name:'Punk Rock • 181.FM Classic Buzz',exact:true}).click();
  assert.equal(await page.locator('audio').getAttribute('src'),'https://listen.181fm.com/181-classicbuzz_128k.mp3');
  await page.getByRole('button',{name:'Play Colt Radio',exact:true}).click();
  try { await page.waitForFunction(()=>{const a=document.querySelector('audio');return a.readyState>=3&&a.currentTime>1&&!a.paused;},{},{timeout:30000}); }
  catch(e){console.log('AUDIO_DIAGNOSTIC',await page.locator('audio').evaluate(a=>({src:a.currentSrc,readyState:a.readyState,paused:a.paused,error:a.error?.message,time:a.currentTime})));throw e;}
  console.log('LIVE PLAYBACK',await page.locator('audio').evaluate(a=>({readyState:a.readyState,currentTime:a.currentTime,paused:a.paused})));
  await page.getByRole('button',{name:'Stop Colt Radio',exact:true}).click();
  assert.deepEqual(errors,[]);
  console.log('PASS: shelf catalog, bounds, desktop/mobile chooser, save; station search and real MP3 playback.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
