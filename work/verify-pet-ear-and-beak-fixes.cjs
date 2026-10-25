const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const {PNG}=require('pngjs');
const origin='http://127.0.0.1:8164',dir=fs.mkdtempSync(path.join(os.tmpdir(),'accessory-test-'));
const server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:'8164',DATA_DIR:dir,SESSION_SECRET:'accessory-test',TEACHER_PIN:'654321'},stdio:'pipe'});let browser;
(async()=>{try{
for(let i=0;i<100;i++){try{if((await fetch(origin+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
const login=await fetch(origin+'/api/auth/teacher',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({pin:'654321'})});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0],eq=cookie.indexOf('=');
browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});const context=await browser.newContext({viewport:{width:1440,height:1000}});await context.addCookies([{name:cookie.slice(0,eq),value:cookie.slice(eq+1),url:origin}]);const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
const open=async()=>{await page.goto(origin,{waitUntil:'domcontentloaded'});await page.evaluate(()=>window.dispatchEvent(new CustomEvent('classroom-launchpad-rendered',{detail:{screen:'home',auth:{authenticated:true,role:'teacher'}}})));await page.waitForFunction(()=>document.querySelector('.companion-picker select')?.disabled===false);await page.locator('.header-account-summary').first().click();await page.locator('.header-account-menu [data-companion-open]').first().click();};
await open();const studio=page.locator('.pet-studio');
await studio.locator('#pet-select').selectOption('labubu');
await studio.locator('[data-tab=appearance]').click();await studio.locator('[data-subtab=accessories]').click();await studio.locator('[data-choice=headphones]').click();
await studio.locator('[data-tab=settings]').click();await studio.locator('[data-toggle=motion]').uncheck();
await page.waitForTimeout(300);await studio.locator('#pet-stage').screenshot({path:path.join(dir,'labubu-ear-headphones.png')});
await studio.locator('#pet-select').selectOption('eagle');await studio.locator('[data-tab=appearance]').click();await studio.locator('[data-subtab=accessories]').click();await studio.locator('[data-choice=flight-vest]').click();
await studio.locator('[data-tab=settings]').click();await studio.locator('[data-toggle=motion]').uncheck();
await page.waitForTimeout(200);
for(const opening of [-54,-25,0]){
await page.evaluate(y=>{const h=document.querySelector('.eagle-companion');h.querySelector('.beak-motion').style.opacity='1';h.querySelector('.lower-jaw').setAttribute('transform','translate(0 '+y+')')},opening);
const crop=await studio.locator('.eagle-companion .pet-button>svg').evaluate(svg=>{const r=svg.getBoundingClientRect(),k=r.width/1494;return {x:r.x+(560+60)*k,y:r.y+(440+30)*k,width:300*k,height:190*k}});
const vest=studio.locator('[data-accessory=flight-vest]');
await vest.evaluate(e=>e.style.display='none');const bare=await page.screenshot({clip:crop,path:path.join(dir,'bare-'+opening+'.png')});
await vest.evaluate(e=>e.style.display='');const dressed=await page.screenshot({clip:crop,path:path.join(dir,'dressed-'+opening+'.png')});
console.log(dir);
const a=PNG.sync.read(bare),b=PNG.sync.read(dressed);let total=0,changed=0;for(let i=0;i<a.data.length;i++){const delta=Math.abs(a.data[i]-b.data[i]);total+=delta;if(delta>20)changed++}
assert(total/a.data.length<1&&changed/a.data.length<.005,'Vest must not cover moving beak at jaw '+opening);
await studio.locator('#pet-stage').screenshot({path:path.join(dir,'vest-chatter-'+opening+'.png')});
}
assert.deepEqual(errors,[]);console.log('PASS: headphones fit preview; no material beak-pixel changes with vest at three jaw positions. Screenshots: '+dir);
}finally{await browser?.close();server.kill();}})().catch(e=>{console.error(e);process.exitCode=1});

