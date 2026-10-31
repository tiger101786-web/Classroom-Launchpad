const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const origin='http://127.0.0.1:8187',dir=fs.mkdtempSync(path.join(os.tmpdir(),'nugget-production-'));
const server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:'8187',DATA_DIR:dir,SESSION_SECRET:'nugget-test',TEACHER_PIN:'654321'},stdio:'pipe'});let browser;
(async()=>{try{
 for(let i=0;i<100;i++){try{if((await fetch(origin+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
 const login=await fetch(origin+'/api/auth/teacher',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({pin:'654321'})});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0],eq=cookie.indexOf('=');
 browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});const context=await browser.newContext({viewport:{width:1920,height:1080}});await context.addCookies([{name:cookie.slice(0,eq),value:cookie.slice(eq+1),url:origin}]);const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='warning'&&m.text().includes('Saber'))console.log(m.text())});
 const open=async()=>{await page.goto(origin,{waitUntil:'domcontentloaded'});await page.evaluate(()=>window.dispatchEvent(new CustomEvent('classroom-launchpad-rendered',{detail:{screen:'home',auth:{authenticated:true,role:'teacher'}}})));await page.waitForFunction(()=>document.querySelector('.companion-picker select')?.disabled===false);await page.locator('.header-account-summary').first().click();await page.locator('.header-account-menu [data-companion-open]').first().click();};

 await open();const studio=page.locator('.pet-studio'),pet=page.locator('.nugget-companion');
 await studio.locator('#pet-select').selectOption('nugget');await page.waitForFunction(()=>document.querySelector('.nugget-companion').dataset.ready==='true');
 assert(await pet.isVisible());assert.equal(await pet.locator('canvas').evaluate(c=>c.width),2048);
 assert.equal(await studio.locator('.skin-card').count(),1);
 await studio.screenshot({path:path.join(dir,'studio.png')});
 await studio.locator('#greet').click();assert.equal(await pet.getAttribute('data-state'),'hello');
 await studio.locator('[data-tab=play]').click();
 for(const name of ['hello','happy','blink','talk','hands','wave','shake','look','foot']){
  await studio.locator('[data-action='+name+']').click();assert.equal(await pet.getAttribute('data-state'),name);await page.waitForTimeout(120);
 }
 await studio.locator('#dance').click();assert.equal(await pet.getAttribute('data-state'),'dance');await page.waitForTimeout(500);await pet.screenshot({path:path.join(dir,'dance.png')});
 await studio.locator('#dance').click();await studio.locator('[data-toggle=asleep]').check();assert.equal(await pet.getAttribute('data-state'),'sleep');
 await page.waitForTimeout(700);await pet.screenshot({path:path.join(dir,'sleep.png')});
 await studio.locator('[data-toggle=asleep]').uncheck();assert.equal(await pet.getAttribute('data-state'),'wake');
 await studio.locator('[data-tab=appearance]').click();await studio.locator('[data-subtab=accessories]').click();await studio.locator('[data-choice=headphones]').click();
 await studio.locator('[data-tab=name]').click();await studio.locator('#pet-name').fill('Crispy');await studio.locator('#size-select').selectOption('extra-large');
 await page.waitForTimeout(900);let saved=await page.evaluate(async()=> (await (await fetch('/api/companion-preferences')).json()).preferences);
 assert.equal(saved.pet,'nugget');assert.equal(saved.nugget.name,'Crispy');assert.equal(saved.nugget.headwear,'headphones');
 await studio.locator('[data-toggle=platform]').uncheck();assert(!(await pet.locator('#nugget-pet-name').isVisible()));await studio.locator('[data-toggle=platform]').check();
 await studio.locator('[data-toggle=nameplate]').uncheck();assert(!(await pet.locator('#nugget-pet-name').isVisible()));await studio.locator('[data-toggle=nameplate]').check();
 await studio.locator('[data-tab=settings]').click();await studio.locator('[data-toggle=motion]').uncheck();const f=await pet.locator('canvas').getAttribute('data-frame');await page.waitForTimeout(200);assert.equal(await pet.locator('canvas').getAttribute('data-frame'),f);await studio.locator('[data-toggle=motion]').check();
 for(const width of [1920,800,390]){
  await page.setViewportSize({width,height:1080});await page.waitForTimeout(200);assert.equal(await pet.locator('canvas').evaluate(c=>c.width),2048);
  assert(await studio.evaluate(d=>d.scrollWidth<=d.clientWidth+1));await studio.screenshot({path:path.join(dir,'studio-'+width+'.png')});
 }
 await page.setViewportSize({width:1920,height:1080});await studio.locator('#pet-select').selectOption('saber');assert(!(await pet.isVisible()));await studio.locator('#pet-select').selectOption('nugget');
 await page.waitForTimeout(900);await open();assert.equal(await studio.locator('#pet-select').inputValue(),'nugget');await page.waitForFunction(()=>document.querySelector('.nugget-companion').dataset.ready==='true');assert.equal(await pet.locator('#nugget-pet-name').textContent(),'Crispy');
 await studio.locator('.studio-close').click();assert(await pet.isVisible());
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('colt-radio-playback',{detail:{playing:true}})));assert.equal(await pet.getAttribute('data-state'),'dance');
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('colt-radio-playback',{detail:{playing:false}})));
 await pet.screenshot({path:path.join(dir,'classroom.png')});
 const b=await pet.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2-100,b.y+b.height/2+50,{steps:10});await page.mouse.up();await page.waitForTimeout(100);assert(await page.locator('.pet-chat[data-pet=nugget]').isVisible());
 saved=await page.evaluate(async()=> (await (await fetch('/api/companion-preferences')).json()).preferences);
 const invalid=await page.evaluate(async p=>(await fetch('/api/companion-preferences',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...p,nugget:{...p.nugget,skin:'bad'}})})).status,saved);assert.equal(invalid,400);
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('classroom-launchpad-rendered',{detail:{screen:'login',auth:{authenticated:false}}})));assert(!(await pet.isVisible()));
 assert.deepEqual(errors,[]);console.log('PASS: Nugget selection, all actions, sleep/wake, dance/radio, persistence, headwear, naming, platform, motion, responsive layout, drag speech, validation and logout. '+dir);
 }finally{await browser?.close();server.kill()}
})().catch(e=>{console.error(e);process.exitCode=1});
