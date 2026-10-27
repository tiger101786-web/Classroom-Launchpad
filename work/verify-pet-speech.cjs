const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const origin='http://127.0.0.1:8181',dir=fs.mkdtempSync(path.join(os.tmpdir(),'highland-production-'));
const server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:'8181',DATA_DIR:dir,SESSION_SECRET:'highland-test',TEACHER_PIN:'654321'},stdio:'pipe'});let browser;
(async()=>{try{
for(let i=0;i<100;i++){try{if((await fetch(origin+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
const login=await fetch(origin+'/api/auth/teacher',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({pin:'654321'})});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0],eq=cookie.indexOf('=');
browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});const context=await browser.newContext({viewport:{width:1920,height:1080}});await context.addCookies([{name:cookie.slice(0,eq),value:cookie.slice(eq+1),url:origin}]);const page=await context.newPage(),errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='warning'&&m.text().includes('Highland'))console.log(m.text())});page.on('response',r=>{if(r.url().includes('highland-pet')&&!r.ok())failed.push(r.url())});
const open=async()=>{await page.goto(origin,{waitUntil:'domcontentloaded'});await page.evaluate(()=>window.dispatchEvent(new CustomEvent('classroom-launchpad-rendered',{detail:{screen:'home',auth:{authenticated:true,role:'teacher'}}})));await page.waitForFunction(()=>document.querySelector('.companion-picker select')?.disabled===false);await page.locator('.header-account-summary').first().click();await page.locator('.header-account-menu [data-companion-open]').first().click();};
await open();const studio=page.locator('.pet-studio');
const pets=[['colt','robo-companion','Colt energy'],['squishy','dumpling-companion','squish'],['gummy','gummy-companion','jelly'],['eagle','eagle-companion','perch'],['labubu','labubu-companion','hideout'],['roblox','roblox-companion','spawn'],['highland','highland-companion','pasture']];
const messages=new Set();
for(const [kind,cls,word] of pets){
 if(!(await studio.isVisible())){await page.locator('.header-account-summary').first().click();await page.locator('.header-account-menu [data-companion-open]').first().click()}
 await studio.locator('#pet-select').selectOption(kind);await page.waitForTimeout(350);await studio.locator('.studio-close').click();
 const pet=page.locator('.'+cls+' .pet-button');await pet.waitFor({state:'visible'});const box=await pet.boundingBox();assert(box,kind);
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2-120,box.y+box.height/2-50,{steps:12});await page.mouse.up();await page.waitForTimeout(100);
 const bubble=page.locator('.pet-chat');assert(await bubble.isVisible(),kind+' has move bubble');const text=await bubble.locator('span').innerText();assert(text.toLowerCase().includes(word.toLowerCase()),text);messages.add(text);
 assert.equal(await bubble.getAttribute('data-pet'),kind);
 const metrics=await bubble.evaluate(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e,'::after');return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,content:s.content,border:s.borderBottomWidth}});
 assert(metrics.x>=0&&metrics.y>=0&&metrics.right<=1920&&metrics.bottom<=1080,JSON.stringify(metrics));assert.equal(metrics.content,'""');assert.equal(metrics.border,'2px');
 await page.screenshot({path:path.join(dir,'speech-'+kind+'.png')});
 // Existing idle/greeting speech must use the new surface too, not only drag messages.
 await page.locator('.'+cls).evaluate(host=>{const s=host.querySelector('.pet-native-speech');const message=s.querySelector('.dumpling-speech-message,.gb-speech-message,.speech-message')||s;message.textContent='Native greeting test';s.hidden=false});
 await page.waitForTimeout(80);assert.equal(await bubble.locator('span').innerText(),'Native greeting test');
 await page.locator('.'+cls+' .pet-native-speech').evaluate(e=>e.hidden=true);await page.waitForTimeout(80);assert(!(await bubble.isVisible()));
 // Near the top: the tail reverses to point upward at the pet.
 const pos=await pet.boundingBox();await page.mouse.move(pos.x+pos.width/2,pos.y+20);await page.mouse.down();await page.mouse.move(pos.x+pos.width/2,22,{steps:10});await page.mouse.up();await page.waitForTimeout(100);assert.equal(await bubble.getAttribute('data-side'),'below',kind);
 await page.locator('.header-account-summary').first().click();await page.locator('.header-account-menu [data-companion-open]').first().click();await page.waitForTimeout(80);assert(!(await bubble.isVisible()),'Hidden inside Studio');
}
await studio.locator('.studio-close').click();await page.setViewportSize({width:390,height:700});
const smallPet=page.locator('.highland-companion .pet-button');await smallPet.waitFor({state:'visible'});const smallBox=await smallPet.boundingBox();await page.mouse.move(smallBox.x+smallBox.width/2,smallBox.y+30);await page.mouse.down();await page.mouse.move(30,100,{steps:12});await page.mouse.up();await page.waitForTimeout(100);const smallBubble=await page.locator('.pet-chat').boundingBox();assert(smallBubble&&smallBubble.x>=0&&smallBubble.x+smallBubble.width<=390&&smallBubble.y>=0&&smallBubble.y+smallBubble.height<=700);
assert.equal(messages.size,7);assert.deepEqual(errors,[]);console.log('PASS: seven unique move messages, native greetings, themed bubbles, pointer tails, top-edge reversal, mobile bounds, and Studio suppression. Screenshots: '+dir);
}finally{await browser?.close();server.kill()}})().catch(e=>{console.error(e);process.exitCode=1});

