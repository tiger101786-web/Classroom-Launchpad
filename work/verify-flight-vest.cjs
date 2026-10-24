const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const origin='http://127.0.0.1:8164',dir=fs.mkdtempSync(path.join(os.tmpdir(),'accessory-test-'));
const server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:'8164',DATA_DIR:dir,SESSION_SECRET:'accessory-test',TEACHER_PIN:'654321'},stdio:'pipe'});let browser;
(async()=>{try{
for(let i=0;i<100;i++){try{if((await fetch(origin+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
const login=await fetch(origin+'/api/auth/teacher',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({pin:'654321'})});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0],eq=cookie.indexOf('=');
browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});const context=await browser.newContext({viewport:{width:1440,height:1000}});await context.addCookies([{name:cookie.slice(0,eq),value:cookie.slice(eq+1),url:origin}]);const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
const open=async()=>{await page.goto(origin,{waitUntil:'domcontentloaded'});await page.evaluate(()=>window.dispatchEvent(new CustomEvent('classroom-launchpad-rendered',{detail:{screen:'home',auth:{authenticated:true,role:'teacher'}}})));await page.waitForFunction(()=>document.querySelector('.companion-picker select')?.disabled===false);await page.locator('.header-account-summary').first().click();await page.locator('.header-account-menu [data-companion-open]').first().click();};
await open();const studio=page.locator('.pet-studio');await studio.locator('#pet-select').selectOption('eagle');
await studio.locator('[data-tab=appearance]').click();await studio.locator('[data-subtab=accessories]').click();
await studio.locator('[data-choice=flight-vest]').click();await page.waitForTimeout(900);
assert(await studio.locator('[data-accessory=flight-vest]').isVisible());
await studio.screenshot({path:path.join(dir,'studio-vest.png')});
await open();assert(await studio.locator('[data-accessory=flight-vest]').isVisible());
await page.goto('file:///'+path.resolve(__dirname,'pet-accessories-round-four.html').replaceAll('\\','/'));await page.waitForFunction(()=>window.fittings?.eagle);
await page.evaluate(()=>{fittings.eagle.selected=['flight-vest'];fittings.eagle.render()});
await page.waitForTimeout(200);await page.locator('#eagle').screenshot({path:path.join(dir,'vest-rest.png')});
await page.locator('#eagle [data-test=move]').click();await page.waitForTimeout(480);
await page.locator('#eagle').screenshot({path:path.join(dir,'vest-flap.png')});
assert.deepEqual(errors,[]);console.log('PASS: flight vest selection/save/reload and preview flap. Screenshots: '+dir);
}finally{await browser?.close();server.kill();}})().catch(e=>{console.error(e);process.exitCode=1});
