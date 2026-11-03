const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const skins=['arcade','graffiti','rock-stage','bayou','arctic','cosmic','sakura','forge','neon-city','underwater','samurai','pirate'];
const output=process.env.PREVIEW_OUTPUT||fs.mkdtempSync(path.join(os.tmpdir(),'expanded-radio-'));
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});try{
 const context=await browser.newContext({viewport:{width:1280,height:1000}}),root=path.resolve(__dirname,'..');
 const originals=JSON.parse(fs.readFileSync(path.join(__dirname,'radio-skin-sources.json'),'utf8'));
 for(const art of originals){const data=fs.readFileSync(path.join(root,art.asset));assert.equal(crypto.createHash('sha256').update(data).digest('hex'),art.sha256,'Supplied source art stays unchanged: '+art.skin);}
 await context.addInitScript(()=>{window.mediaCalls=[];HTMLMediaElement.prototype.play=function(){mediaCalls.push('play');this.dispatchEvent(new Event('playing'));return Promise.resolve();};HTMLMediaElement.prototype.pause=function(){mediaCalls.push('pause');this.dispatchEvent(new Event('pause'));};HTMLMediaElement.prototype.load=function(){mediaCalls.push('load');};});
 await context.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname!=='radio.test')return route.abort();
  if(u.pathname==='/')return route.fulfill({contentType:'text/html',body:'<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="/styles.css"><div id="coltRadioRoot" class="colt-radio-root"></div><script src="/colt-radio.js"></script>'});
  const f=path.join(root,decodeURIComponent(u.pathname));if(!fs.existsSync(f)||!fs.statSync(f).isFile())return route.fulfill({status:404,body:''});
  return route.fulfill({body:fs.readFileSync(f),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.svg')?'image/svg+xml':f.endsWith('.png')?'image/png':'application/octet-stream'});
 });
 const page=await context.newPage(),errors=[],artRequests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/assets\/radio-skins\/.*-reference\.png/.test(r.url()))artRequests.push(r.url());});await page.goto('http://radio.test/');assert.equal(artRequests.length,0);
 await page.getByRole('button',{name:'Open Colt Radio',exact:true}).click();const panel=page.locator('.colt-radio-panel'),gear=page.getByRole('button',{name:'Change Colt Radio skin',exact:true}),menu=page.locator('.colt-radio-skin-menu');await gear.waitFor();await page.waitForFunction(()=>document.querySelector('link[href^="radio-skins.css"]')?.sheet);assert.equal(artRequests.length,0,'Default Original loads no themed artwork');
 const choose=async(skin,target=page)=>{await target.getByRole('button',{name:'Change Colt Radio skin',exact:true}).click();await target.locator('[data-radio-skin-choice='+skin+']').click();};
 assert.equal(await menu.locator('[data-radio-skin-choice]').count(),13);
 await panel.locator('.colt-radio-search-input').fill('House Chill');await panel.locator('[data-station="chill-house"]').click();await panel.locator('.colt-radio-search-input').fill('');await panel.locator('[data-favorite-station="chill-house"]').click();await panel.locator('.colt-radio-play').click();
 await panel.locator('.colt-radio-volume-slider').evaluate(e=>{e.value='43';e.dispatchEvent(new Event('input',{bubbles:true}));});
 const audio=await page.evaluate(()=>{window.originalAudio=document.querySelector('audio');return {src:originalAudio.src,calls:mediaCalls.length,volume:originalAudio.volume};});


 const sizes=new Map();
 for(const [w,h]of [[1280,1000],[800,900],[390,844],[320,568]]){
  await page.setViewportSize({width:w,height:h});
  sizes.set(w,await panel.evaluate(e=>[e.offsetWidth,e.offsetHeight]));
 }
 await page.setViewportSize({width:1280,height:1000});
 const original=sizes.get(1280);

 for(const skin of skins){
  await choose(skin);
  await page.evaluate(async skin=>{const img=new Image();img.src='/assets/radio-skins/'+(skin==='rock-stage'?'rock-stage-layout':skin+'-layout')+'.png';await img.decode()},skin);
  const actual=await panel.evaluate(e=>[e.offsetWidth,e.offsetHeight]);

  for(const [w,h]of [[1280,1000],[800,900],[390,844],[320,568]]){
   await page.setViewportSize({width:w,height:h});
   const size=await panel.evaluate(e=>[e.offsetWidth,e.offsetHeight]);
   assert.deepEqual(size,sizes.get(w),skin+' panel dimensions at '+w);
   assert(await panel.locator('.colt-radio-play').isVisible());
  }
  await page.setViewportSize({width:1280,height:1000});

  assert.equal(actual[0],original[0]);
  assert.equal(await panel.locator('.colt-radio-stream-details').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');
  const state=await page.evaluate(()=>({same:document.querySelector('audio')===originalAudio,src:originalAudio.src,calls:mediaCalls.length,volume:originalAudio.volume}));
  assert(state.same);assert.equal(state.src,audio.src);assert.equal(state.calls,audio.calls);assert.equal(state.volume,audio.volume);
  await panel.screenshot({path:path.join(output,'rebuilt-'+skin+'.png')});
 }

 await page.evaluate(()=>Object.defineProperty(window,'documentPictureInPicture',{value:undefined,configurable:true}));
 const next=context.waitForEvent('page');
 await panel.getByRole('button',{name:'Pop out Colt Radio',exact:true}).click();
 const floating=await next;
 await choose('underwater',floating);
 await floating.getByRole('button',{name:'Return Colt Radio to Launchpad',exact:true}).click();
 assert.equal(await panel.getAttribute('data-radio-skin'),'underwater');
 await page.reload();
 await page.getByRole('button',{name:'Open Colt Radio',exact:true}).click();
 await gear.waitFor();
 assert.equal(await panel.getAttribute('data-radio-skin'),'underwater');
 await choose('classic');
 assert.equal(await panel.getAttribute('data-radio-skin'),null);
 assert.deepEqual(errors,[]);

 console.log('PASS: twelve themes load, original width, transparent track panels and uninterrupted audio.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
