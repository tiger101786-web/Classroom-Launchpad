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
for(const width of [1440,800,390]){
 await page.setViewportSize({width,height:1000});
 for(const theme of ['woodland','crimson']){
  await studio.getByLabel('Studio theme',{exact:true}).selectOption(theme);
  let expected;
  for(const tab of ['appearance','name','play','settings']){
   await studio.locator('[data-tab="'+tab+'"]').click();
   const size=await studio.evaluate(d=>({h:d.querySelector('.studio').getBoundingClientRect().height,w:d.getBoundingClientRect().width,content:d.querySelector('.tab-content').getBoundingClientRect().height}));
   if(expected)assert.deepEqual(size,expected,theme+' '+width+' '+tab);else expected=size;
  }
  await studio.locator('[data-tab=appearance]').click();
  await studio.locator('#pet-select').selectOption('eagle');
  await page.waitForTimeout(150);
  await studio.screenshot({path:path.join(dir,theme+'-'+width+'.png')});
 }
}
await studio.getByLabel('Studio theme',{exact:true}).selectOption('woodland');await open();assert.equal(await studio.getAttribute('data-theme'),'woodland');
assert.deepEqual(errors,[]);console.log('PASS: stable tab sizes in both themes at three widths, theme persistence, no browser errors. Screenshots: '+dir);
}finally{await browser?.close();server.kill();}})().catch(e=>{console.error(e);process.exitCode=1});
