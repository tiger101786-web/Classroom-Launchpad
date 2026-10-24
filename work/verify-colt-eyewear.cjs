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
await studio.locator('#pet-select').selectOption('colt');
async function accessories(){await studio.locator('[data-tab=appearance]').click();await studio.locator('[data-subtab=accessories]').click();}
await accessories();
for(const eyewear of ['star-glasses','sport-goggles']){
 for(const hat of ['none','racing-helmet','headphones']){
  await studio.locator('[data-choice-key=headwear][data-choice="'+hat+'"]').click();
  await studio.locator('[data-choice-key=eyewear][data-choice="'+eyewear+'"]').click();
  await page.waitForTimeout(250);
  const art=studio.locator('#rc-head [data-accessory="'+eyewear+'"]');
  assert(await art.isVisible(),eyewear+' with '+hat);
  assert.equal(await art.evaluate(el=>el.closest('[data-accessory=racing-helmet]')!==null),false);
  await studio.screenshot({path:path.join(dir,eyewear+'-'+hat+'.png')});
 }
 await page.waitForTimeout(800);await open();await accessories();
 assert(await studio.locator('#rc-head [data-accessory="'+eyewear+'"]').isVisible(),'reload '+eyewear);
}
assert.deepEqual(errors,[]);console.log('PASS: both Colt glasses with no hat, helmet, headphones and after reload. Screenshots: '+dir);
}finally{await browser?.close();server.kill();}})().catch(e=>{console.error(e);process.exitCode=1});
