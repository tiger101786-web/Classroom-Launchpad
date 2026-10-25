const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const origin='http://127.0.0.1:8164',dir=fs.mkdtempSync(path.join(os.tmpdir(),'accessory-test-'));
const server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:'8164',DATA_DIR:dir,SESSION_SECRET:'accessory-test',TEACHER_PIN:'654321'},stdio:'pipe'});let browser;
(async()=>{try{
for(let i=0;i<100;i++){try{if((await fetch(origin+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
const login=await fetch(origin+'/api/auth/teacher',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({pin:'654321'})});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0],eq=cookie.indexOf('=');
browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});const context=await browser.newContext({viewport:{width:1440,height:1000}});await context.addCookies([{name:cookie.slice(0,eq),value:cookie.slice(eq+1),url:origin}]);const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
const open=async()=>{await page.goto(origin,{waitUntil:'domcontentloaded'});await page.evaluate(()=>window.dispatchEvent(new CustomEvent('classroom-launchpad-rendered',{detail:{screen:'home',auth:{authenticated:true,role:'teacher'}}})));await page.waitForFunction(()=>document.querySelector('.companion-picker select')?.disabled===false);await page.locator('.header-account-summary').first().click();await page.locator('.header-account-menu [data-companion-open]').first().click();};
await open();const studio=page.locator('.pet-studio');
for(const width of [1920,1440,800,390]){
 await page.setViewportSize({width,height:1000});
 for(const theme of ['woodland','crimson','sky','scrapbook']){
  await studio.getByLabel('Studio theme',{exact:true}).selectOption(theme);
  if(theme==='scrapbook'){
   const select=studio.locator('#pet-select');await select.hover();await select.focus();
   const palette=await select.evaluate(e=>{const s=getComputedStyle(e);return {text:s.color,fill:s.webkitTextFillColor,scheme:s.colorScheme,option:getComputedStyle(e.selectedOptions[0]).color}});
   assert.deepEqual(palette,{text:'rgb(61, 40, 29)',fill:'rgb(61, 40, 29)',scheme:'light',option:'rgb(61, 40, 29)'});
  }
  let expected;
  for(const tab of ['appearance','name','play','settings']){
   await studio.locator('[data-tab="'+tab+'"]').click();
   const size=await studio.evaluate(d=>({h:d.querySelector('.studio').getBoundingClientRect().height,w:d.getBoundingClientRect().width,content:d.querySelector('.tab-content').getBoundingClientRect().height}));
   if(expected){assert(Math.abs(size.h-expected.h)<1,theme+' '+width+' '+tab+' '+JSON.stringify({size,expected}));assert.equal(size.w,expected.w);assert.equal(size.content,expected.content)}else expected=size;
  }
  await studio.locator('[data-tab=appearance]').click();
  await studio.locator('#pet-select').selectOption('eagle');
  await page.waitForTimeout(150);
  await studio.screenshot({path:path.join(dir,theme+'-'+width+'.png')});
  if(['sky','scrapbook'].includes(theme))for(const pet of ['colt','squishy','gummy','labubu','eagle']){
   await studio.locator('#pet-select').selectOption(pet);
   const fit=await studio.evaluate(d=>{const host=[...d.querySelectorAll('#pet-stage>.labubu-companion,#pet-stage>.eagle-companion,#pet-stage>.gummy-companion,#pet-stage>.robo-companion,#pet-stage>.dumpling-companion')].find(e=>!e.hidden),pet=host.querySelector('.pet-button').getBoundingClientRect(),subtitle=d.querySelector('#pet-subtitle').getBoundingClientRect(),actions=d.querySelector('.preview-actions').getBoundingClientRect();return {gap:pet.top-subtitle.bottom,clear:actions.top-pet.bottom,overflow:d.scrollWidth>d.clientWidth+1}});
   assert(fit.gap>=0&&fit.clear>=0&&!fit.overflow,JSON.stringify({theme,width,pet,fit}));
  }
 }
}
await page.setViewportSize({width:1920,height:1080});
for(const theme of ['sky','scrapbook']){
 await studio.getByLabel('Studio theme',{exact:true}).selectOption(theme);await open();assert.equal(await studio.getAttribute('data-theme'),theme);
 await studio.locator('#pet-select').selectOption('labubu');
 await studio.locator('#skin-search').fill('Sea Salt');await studio.locator('[data-skin-choice="Sea Salt Coconut"]').click();
 await studio.locator('#skin-search').fill('');assert.equal(await studio.locator('[data-skin-choice]').count(),7);
 await studio.locator('[data-subtab=accessories]').click();await studio.locator('[data-choice=headphones]').click();assert.equal(await studio.locator('[data-choice=headphones]').getAttribute('aria-pressed'),'true');
 await studio.locator('[data-tab=name]').click();await studio.locator('#pet-name').fill('Theme Test');assert.equal(await studio.locator('#pet-title').textContent(),'Theme Test');
 await studio.locator('[data-tab=play]').click();await studio.locator('[data-action=hand]').click();
 await studio.locator('[data-tab=appearance]').click();await studio.locator('[data-subtab=skins]').click();
 await studio.screenshot({path:path.join(dir,theme+'-labubu.png')});
}
assert.deepEqual(errors,[]);console.log('PASS: stable tabs across four themes and four widths, new theme persistence, no browser errors. Screenshots: '+dir);
}finally{await browser?.close();server.kill();}})().catch(e=>{console.error(e);process.exitCode=1});
