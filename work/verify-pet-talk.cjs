const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const origin='http://127.0.0.1:8194',dir=fs.mkdtempSync(path.join(os.tmpdir(),'pet-talk-test-'));
const server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:'8194',DATA_DIR:dir,SESSION_SECRET:'pet-talk-test',TEACHER_PIN:'654321'},stdio:'pipe'});let browser;
(async()=>{try{
 for(let i=0;i<100;i++){try{if((await fetch(origin+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
 const login=await fetch(origin+'/api/auth/teacher',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({pin:'654321'})});assert.equal(login.status,200);
 const cookie=login.headers.get('set-cookie').split(';')[0],equal=cookie.indexOf('=');
 browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});await context.addCookies([{name:cookie.slice(0,equal),value:cookie.slice(equal+1),url:origin}]);
 const page=await context.newPage(),errors=[],outbound=[];await page.clock.install();page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>outbound.push({url:r.url(),body:r.postData()}));
 await page.goto(origin,{waitUntil:'domcontentloaded'});await page.evaluate(()=>window.dispatchEvent(new CustomEvent('classroom-launchpad-rendered',{detail:{screen:'home',auth:{authenticated:true,role:'teacher'}}})));await page.waitForFunction(()=>document.querySelector('.companion-picker select')?.disabled===false);
 const studio=page.locator('.pet-studio'),chat=page.locator('.pet-talk'),bubble=page.locator('.pet-chat'),input=chat.locator('input');
 const openStudio=async()=>{await page.locator('.header-account-summary').first().click();await page.locator('.header-account-menu [data-companion-open]').first().click();await studio.waitFor({state:'visible'})};
 const send=async text=>{await page.waitForTimeout(920);await input.fill(text);await input.press('Enter');await page.waitForTimeout(70)};
 const within=async locator=>{const r=await locator.boundingBox(),v=page.viewportSize();assert(r&&r.x>=-1&&r.y>=-1&&r.x+r.width<=v.width+1&&r.y+r.height<=v.height+1,JSON.stringify({r,v}));};
 const pets={colt:'robo',squishy:'dumpling',gummy:'gummy',eagle:'eagle',labubu:'labubu',roblox:'roblox',highland:'highland',saber:'saber',nugget:'nugget'};
 const greetings=new Set();
 for(const [kind,cls] of Object.entries(pets)){
   await openStudio();await studio.locator('#pet-select').selectOption(kind);await page.waitForTimeout(300);
   const name=await studio.locator('#pet-title').innerText();await studio.locator('.pet-talk-open').click();await chat.waitFor({state:'visible'});await bubble.waitFor({state:'visible'});
   assert.equal(await chat.locator('h2').innerText(),name);assert.equal(await bubble.getAttribute('data-pet'),kind);greetings.add(await bubble.locator('span').innerText());
   await within(chat);await within(bubble);assert(await page.locator('body > .'+cls+'-companion .pet-button').isVisible());
   const before=outbound.length;
   await send('tell me a joke');const reply=await bubble.locator('span').innerText();assert(reply.length>15);assert.equal(await chat.locator('[data-from=pet]').last().locator('span').innerText(),reply);
   await send('purple snails made a toaster');assert.match(await bubble.locator('span').innerText(),/not|cannot|outside|do not/);
   assert(!outbound.slice(before).some(r=>r.body?.includes('purple snails')||r.body?.includes('tell me a joke')),'messages never leave browser');
   await chat.locator('[data-talk-close]').click();assert.equal(await chat.locator('.pet-talk-messages p').count(),0);
 }
 assert.equal(greetings.size,9);
 // Actual click path, without changing the pet's existing controls or drag handling.
 await page.locator('body > .nugget-companion .pet-button').click();await studio.waitFor({state:'visible'});await studio.locator('.pet-talk-open').click();await chat.waitFor({state:'visible'});
 await input.fill('');await input.press('Enter');assert.match(await chat.locator('.pet-talk-status').innerText(),/Type a message/);
 await send('hello');const count=await chat.locator('.pet-talk-messages p').count();await input.fill('hello again');await input.press('Enter');assert.equal(await chat.locator('.pet-talk-messages p').count(),count);
 assert.equal(await page.locator('.pet-chat').count(),1);assert.equal(await input.getAttribute('maxlength'),'240');
 await send('someone is hurting me');assert.match(await bubble.locator('span').innerText(),/trusted adult/);assert(!(await chat.locator('.pet-talk-messages').innerText()).includes('someone is hurting me'));
 await send('ask me a question');await send('both');assert.match(await bubble.locator('span').innerText(),/idea|favorites|choice|game/);
 // Reading time, replacement, native-chatter priority, and movement tracking.
 await send('tell me an animal fact');const duration=Number(await bubble.getAttribute('data-duration'));assert(duration>=9000);
 const beforeText=await bubble.locator('span').innerText();await page.locator('.nugget-companion').evaluate(host=>{const native=host.querySelector('.pet-native-speech');native.textContent='Idle chatter must wait';native.hidden=false});await page.waitForTimeout(80);assert.equal(await bubble.locator('span').innerText(),beforeText);
 const pet=page.locator('body > .nugget-companion .pet-button'),r=await pet.boundingBox();const original=await bubble.boundingBox();await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.mouse.move(r.x+r.width/2-160,r.y+r.height/2-80,{steps:12});await page.mouse.up();await page.waitForTimeout(100);const moved=await bubble.boundingBox();assert(Math.abs(moved.x-original.x)>30);assert.equal(await bubble.locator('span').innerText(),beforeText);await within(bubble);
 await bubble.click();assert(!(await bubble.isVisible()));
 await send('hello');await page.clock.fastForward(Number(await bubble.getAttribute('data-duration'))+50);assert.match(await bubble.getAttribute('class'),/is-fading/);await page.clock.fastForward(300);assert(!(await bubble.isVisible()));await page.clock.resume();
 // Mobile/tablet bounds, readable desktop preview, and closing/reopening without old messages.
 for(const [width,height] of [[1440,1000],[800,1000],[390,844],[320,640],[768,420]]){
   await page.setViewportSize({width,height});await send('tell me a fact');await within(chat);await within(bubble);assert(await chat.evaluate(e=>e.scrollWidth<=e.clientWidth+1));
   const panelBox=await chat.boundingBox(),sendBox=await chat.locator('[type=submit]').boundingBox(),bubbleBox=await bubble.boundingBox();
   assert(sendBox.y+sendBox.height<=panelBox.y+panelBox.height-2,'Send button remains fully visible');
   assert(bubbleBox.x+bubbleBox.width<=panelBox.x||bubbleBox.x>=panelBox.x+panelBox.width||bubbleBox.y+bubbleBox.height<=panelBox.y||bubbleBox.y>=panelBox.y+panelBox.height,'Bubble avoids the chat controls when space is available');
   await page.screenshot({path:path.join(dir,'pet-talk-'+width+'.png')});
 }
 await input.press('Escape');assert(!(await chat.isVisible()));assert(!(await bubble.isVisible()));
 await page.setViewportSize({width:1440,height:1000});await openStudio();await studio.locator('#pet-select').selectOption('colt');await studio.locator('.pet-talk-open').click();await chat.waitFor({state:'visible'});assert.equal(await chat.locator('.pet-talk-messages p').count(),1);assert.equal(await bubble.getAttribute('data-pet'),'colt');
 // Skin/accessory state is read from the existing preferences, never guessed.
 await openStudio();await studio.locator('[data-skin-choice="Glitter"]').click();await studio.locator('[data-subtab="accessories"]').click();await studio.locator('[data-choice="horn"]').click();await studio.locator('.pet-talk-open').click();await chat.waitFor({state:'visible'});await send('what are you wearing');assert.match(await bubble.locator('span').innerText(),/horn/);
 await page.reload({waitUntil:'domcontentloaded'});assert(!(await chat.isVisible()));assert.equal(await chat.locator('.pet-talk-messages p').count(),0);
 // A regular student uses the same local chat, with no additional account or privileges.
 const email='tiger101786@gmail.com';
 const reset=await fetch(origin+'/api/approved-students/'+encodeURIComponent(email)+'/reset-code',{method:'POST',headers:{Origin:origin,Cookie:cookie,'Content-Type':'application/json'},body:'{}'}).then(r=>r.json());
 const registered=await fetch(origin+'/api/auth/register',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({email,activationCode:reset.activationCode,name:'Chat Test',grade:'4',password:'StudentTest123!'})});assert.equal(registered.status,200);
 const studentCookie=registered.headers.get('set-cookie').split(';')[0],studentEq=studentCookie.indexOf('=');const studentContext=await browser.newContext({viewport:{width:1200,height:900}});await studentContext.addCookies([{name:studentCookie.slice(0,studentEq),value:studentCookie.slice(studentEq+1),url:origin}]);
 const student=await studentContext.newPage();student.on('pageerror',e=>errors.push(e.message));await student.goto(origin,{waitUntil:'domcontentloaded'});await student.evaluate(()=>window.dispatchEvent(new CustomEvent('classroom-launchpad-rendered',{detail:{screen:'home',auth:{authenticated:true,role:'student',email:'tiger101786@gmail.com'}}})));await student.waitForFunction(()=>document.querySelector('.companion-picker select')?.disabled===false);
 await student.locator('body > .robo-companion .pet-button').click();await student.locator('.pet-talk-open').click();await student.locator('.pet-talk').waitFor({state:'visible'});await student.locator('#pet-talk-input').fill('hello');await student.locator('#pet-talk-input').press('Enter');assert.equal(await student.locator('.pet-talk [data-from=student]').count(),1);
 await student.evaluate(()=>window.dispatchEvent(new CustomEvent('classroom-launchpad-rendered',{detail:{screen:'login',auth:{authenticated:false}}})));await student.locator('.pet-talk').waitFor({state:'hidden'});assert.equal(await student.locator('.pet-talk-messages p').count(),0);
 assert.deepEqual(errors,[]);console.log('PASS: nine pets, student/teacher access, desktop click entry, Enter, cooldown, privacy, local replies, context, one readable moving/dismissible/fading bubble, mobile/tablet bounds, switching, customization, and ephemeral history including logout. Screenshots: '+dir);
}finally{await browser?.close();server.kill()}})().catch(e=>{console.error(e);process.exitCode=1});
