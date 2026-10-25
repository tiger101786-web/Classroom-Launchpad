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
for(const theme of ['scrapbook','sky']){
await studio.getByLabel('Studio theme',{exact:true}).selectOption(theme);
for(const selector of ['#pet-select','.studio-theme-control select']){
 const select=studio.locator(selector);await select.hover();await select.focus();
 const actual=await select.evaluate(el=>{const c=getComputedStyle(el),o=getComputedStyle(el.selectedOptions[0]);return {text:c.color,fill:c.webkitTextFillColor,scheme:c.colorScheme,shadow:c.boxShadow,outline:c.outlineColor,option:o.color}});
 const color=theme==='scrapbook'?'rgb(61, 40, 29)':'rgb(6, 60, 118)';
 assert.deepEqual(actual,{text:color,fill:color,scheme:'light',shadow:'none',outline:color,option:color});
 const backgrounds=await select.evaluate(el=>({selected:getComputedStyle(el.selectedOptions[0]).backgroundColor,ordinary:getComputedStyle([...el.options].find(o=>!o.selected)).backgroundColor}));
 assert.equal(backgrounds.selected,backgrounds.ordinary,'Selected option must not retain a second highlight');
}
}
await studio.locator('#pet-select').selectOption('labubu');
await page.waitForFunction(()=>document.querySelector('.labubu-companion').dataset.renderedSkin==='Tan');
await page.route('**/labubu-pet/rendered/*face-underlay.png',async route=>{await new Promise(resolve=>setTimeout(resolve,650));await route.continue()});
await page.evaluate(()=>{window.mixedSkinFrames=[];window.sampleSkins=true;function sample(){const host=document.querySelector('.labubu-companion'),slug=host.dataset.renderedSkin?.toLowerCase().replaceAll(' ','-');if(slug){const hrefs=[...host.querySelectorAll('.labubu-colored-art>image')].map(e=>e.getAttribute('href'));if(hrefs.some(h=>!h.includes('/'+slug+'-')))mixedSkinFrames.push({slug,hrefs})}if(window.sampleSkins)requestAnimationFrame(sample)}requestAnimationFrame(sample)});
await studio.locator('[data-skin-choice="Sea Salt Coconut"]').click();
await page.waitForTimeout(150);
assert.equal(await studio.locator('.labubu-companion').getAttribute('data-rendered-skin'),'Tan','Hold entire old skin while new patch loads');
await studio.locator('[data-skin-choice="Lychee Berry"]').click();
await page.waitForFunction(()=>document.querySelector('.labubu-companion').dataset.renderedSkin==='Lychee Berry');
await page.waitForTimeout(300);
assert.equal(await studio.locator('.labubu-companion').getAttribute('data-rendered-skin'),'Lychee Berry','Stale completion cannot replace the latest choice');
const mixed=await page.evaluate(()=>{sampleSkins=false;return mixedSkinFrames});assert.deepEqual(mixed,[]);
await studio.locator('#pet-stage').screenshot({path:path.join(dir,'atomic-skin.png')});
assert.deepEqual(errors,[]);console.log('PASS: delayed and rapid skin changes stay atomic; both light-theme dropdowns retain dark text and a single non-red focus outline. '+dir);
}finally{await browser?.close();server.kill();}})().catch(e=>{console.error(e);process.exitCode=1});

