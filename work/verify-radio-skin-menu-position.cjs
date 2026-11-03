const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});try{
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 const root=path.resolve(__dirname,'..');let slowStyles=false;
 await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname!=='radio.test')return route.abort();
  if(u.pathname==='/')return route.fulfill({contentType:'text/html',body:'<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="/styles.css"><body style="min-height:2400px"><div id="coltRadioRoot" class="colt-radio-root"></div><script src="/colt-radio.js"></script>'});
  const file=path.join(root,decodeURIComponent(u.pathname));if(!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:''});
  if(slowStyles&&u.pathname==='/radio-skins.css')await new Promise(resolve=>setTimeout(resolve,250));
  return route.fulfill({body:fs.readFileSync(file),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.png')?'image/png':file.endsWith('.svg')?'image/svg+xml':'application/octet-stream'});
 });
 const page=await context.newPage();await page.goto('http://radio.test/');await page.getByRole('button',{name:'Open Colt Radio',exact:true}).click();
 const gear=page.getByRole('button',{name:'Change Colt Radio skin',exact:true}),menu=page.locator('.colt-radio-skin-menu');await gear.waitFor();
 const check=async(target,label)=>{await target.waitForFunction(()=>{const m=document.querySelector('.colt-radio-skin-menu');if(!m?.matches(':popover-open')||m.style.top===''||getComputedStyle(m).opacity!=='1')return false;const r=m.getBoundingClientRect(),v=visualViewport,x=v?.offsetLeft||0,y=v?.offsetTop||0;return r.left>=x&&r.right<=x+(v?.width||innerWidth)+1&&r.top>=y&&r.bottom<=y+(v?.height||innerHeight)+1;});
  const g=await target.evaluate(()=>{const m=document.querySelector('.colt-radio-skin-menu').getBoundingClientRect(),a=document.querySelector('.colt-radio-skin-gear').getBoundingClientRect(),v=window.visualViewport;return {menu:m.toJSON(),anchor:a.toJSON(),width:v?.width||innerWidth,height:v?.height||innerHeight,x:v?.offsetLeft||0,y:v?.offsetTop||0};});
  assert(g.menu.left>=g.x&&g.menu.right<=g.x+g.width+1&&g.menu.top>=g.y&&g.menu.bottom<=g.y+g.height+1,label+': menu stays on screen '+JSON.stringify(g));
  assert(Math.abs(g.menu.top-g.anchor.bottom-6)<2||Math.abs(g.menu.bottom-g.anchor.top+6)<2||Math.abs(g.menu.top-g.y-8)<2,label+': menu stays next to gear '+JSON.stringify(g));
 };
 for(const [width,height] of [[1280,900],[390,844],[320,568],[390,240]]){
  await page.setViewportSize({width,height});await gear.click();await check(page,width+'x'+height);await gear.click();assert.equal(await menu.evaluate(m=>m.matches(':popover-open')),false);
 }
 await page.setViewportSize({width:1280,height:900});await gear.click();await page.evaluate(()=>window.scrollTo(0,700));await check(page,'after page scroll');
 await page.setViewportSize({width:390,height:260});await check(page,'resize while open');await page.keyboard.press('Escape');
 await page.evaluate(()=>Object.defineProperty(window,'documentPictureInPicture',{value:undefined,configurable:true}));const next=context.waitForEvent('page');await page.getByRole('button',{name:'Pop out Colt Radio',exact:true}).click();const floating=await next;
 const floatingGear=floating.getByRole('button',{name:'Change Colt Radio skin',exact:true});await floatingGear.click();await check(floating,'floating player');await floatingGear.click();await floating.getByRole('button',{name:'Return Colt Radio to Launchpad',exact:true}).click();
 await gear.click();await check(page,'returned player');await gear.click();
 slowStyles=true;const delayed=await context.newPage();await delayed.goto('http://radio.test/');await delayed.getByRole('button',{name:'Open Colt Radio',exact:true}).click();const delayedGear=delayed.getByRole('button',{name:'Change Colt Radio skin',exact:true});await delayedGear.click();await delayed.waitForFunction(()=>document.querySelector('link[href^="radio-skins.css"]')?.sheet);await check(delayed,'delayed stylesheet');await delayed.close();
 console.log('PASS: dropdown remains on screen and next to the gear on desktop, mobile, short displays, page scroll, resize while open, floating/returned player and delayed CSS; second click closes it.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
