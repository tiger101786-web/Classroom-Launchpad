const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 const context=await browser.newContext({viewport:{width:420,height:620}});
 await context.route('**/*',route=>{
  const u=new URL(route.request().url());
  if(u.hostname==='drive.uber.radio')return route.continue();
  if(u.hostname!=='localhost')return route.abort();
  if(u.pathname==='/')return route.fulfill({contentType:'text/html; charset=utf-8',body:'<meta charset="utf-8"><link rel="stylesheet" href="/styles.css"><div id="coltRadioRoot"></div><script src="/colt-radio.js"></script>'});
  const f=path.join(process.cwd(),decodeURIComponent(u.pathname));
  if(fs.existsSync(f)&&fs.statSync(f).isFile())return route.fulfill({body:fs.readFileSync(f),contentType:f.endsWith('.js')?'text/javascript; charset=utf-8':f.endsWith('.css')?'text/css; charset=utf-8':f.endsWith('.png')?'image/png':'application/octet-stream'});
  return route.fulfill({status:404,body:''});
 });
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost/');
 await page.getByRole('button',{name:'Open Colt Radio',exact:true}).click();
 await page.evaluate(()=>window.originalAudio=document.querySelector('audio'));
 await page.getByRole('button',{name:'Pop out Colt Radio',exact:true}).click();
 await page.waitForFunction(()=>!!window.documentPictureInPicture?.window);
 const pip=await context.waitForEvent('page',{timeout:1000}).catch(()=>context.pages().find(p=>p!==page));
 assert(pip,'Floating window opened');
 await pip.waitForLoadState();
 assert(await pip.getByRole('button',{name:'Return Colt Radio to Launchpad'}).isVisible());
 await pip.getByRole('searchbox',{name:'Search Colt Radio stations or music styles'}).fill('ocean');
 assert(await pip.evaluate(()=>[...document.styleSheets].some(s=>s.cssRules.length>100)));
 await pip.locator('[data-station="calm-ocean"]').click();
 await page.evaluate(()=>document.querySelector('audio').muted=true);
 await pip.getByRole('button',{name:'Play Colt Radio',exact:true}).click();
 await page.waitForFunction(()=>{const a=document.querySelector('audio');return a.currentSrc.includes('/calmocean/')&&!a.paused&&a.currentTime>0;},{},{timeout:20000});
 await pip.screenshot({path:'work/ocean-radio.png'});
 assert(await page.evaluate(()=>originalAudio===document.querySelector('audio')&&originalAudio.ownerDocument===document));
 await pip.getByRole('button',{name:'Return Colt Radio to Launchpad'}).click();
 assert(await page.getByRole('button',{name:'Pop out Colt Radio',exact:true}).isVisible());
 assert.equal(await page.getByRole('searchbox',{name:'Search Colt Radio stations or music styles'}).inputValue(),'ocean');
 // Test browser-close restoration and a second pop-out.
 await page.getByRole('button',{name:'Pop out Colt Radio',exact:true}).click();
 await page.waitForFunction(()=>!!window.documentPictureInPicture.window);
 await page.evaluate(()=>window.documentPictureInPicture.window.close());
 await page.waitForFunction(()=>document.querySelector('.colt-radio-panel')?.ownerDocument===document);
 await page.evaluate(()=>Object.defineProperty(window,'documentPictureInPicture',{value:undefined,configurable:true}));
 const popupPromise=context.waitForEvent('page');
 await page.getByRole('button',{name:'Pop out Colt Radio',exact:true}).click();
 const fallback=await popupPromise;
 await fallback.getByRole('button',{name:'Return Colt Radio to Launchpad'}).click();
 await page.evaluate(()=>window.open=()=>null);
 await page.getByRole('button',{name:'Pop out Colt Radio',exact:true}).click();
 assert(await page.getByText('Could not open the floating player.',{exact:false}).isVisible());
 assert(await page.getByRole('button',{name:'Pop out Colt Radio',exact:true}).isEnabled());
 assert.deepEqual(errors,[]);
 console.log('Native PiP, controls, unchanged audio element, search state, return and close restoration passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
