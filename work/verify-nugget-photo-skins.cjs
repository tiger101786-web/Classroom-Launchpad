const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const origin='http://127.0.0.1:8197',output=path.join(os.tmpdir(),'nugget-photo-skin-check');fs.mkdirSync(output,{recursive:true});
const server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:'8197',DATA_DIR:fs.mkdtempSync(path.join(os.tmpdir(),'nugget-photo-data-')),SESSION_SECRET:'test',TEACHER_PIN:'654321'},stdio:'ignore'});let browser;
(async()=>{try{
 for(let i=0;i<100;i++){try{if((await fetch(origin+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
 browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});
 const context=await browser.newContext({viewport:{width:1440,height:1080},deviceScaleFactor:2});
 assert.equal((await context.request.post(origin+'/api/auth/teacher',{headers:{Origin:origin},data:{pin:'654321'}})).status(),200);
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin);await page.locator('.header-account-summary').first().click();await page.locator('.header-account-menu [data-companion-open]').first().click();
 const studio=page.locator('.pet-studio'),pet=page.locator('.nugget-companion');
 await studio.locator('#pet-select').selectOption('nugget');await page.waitForFunction(()=>document.querySelector('.nugget-companion').dataset.ready==='true');
 for(const name of ['Buffalo','Extra Crispy']){
  await studio.locator('[data-tab=appearance]').click();await studio.locator('[data-subtab=skins]').click();await studio.locator('[data-skin-choice="'+name+'"]').click();
  await page.waitForFunction(n=>document.querySelector('.nugget-companion .pet-button').dataset.renderedSkin===n,name);
  assert.equal(await pet.locator('.pet-button').getAttribute('data-skin-error'),null);
  const dimensions=await page.evaluate(async name=>{const s=await nuggetSkinLayers(name);return {body:[s.body.width,s.body.height],full:[s.original.width,s.original.height],eyes:!!s.eyes,photo:s.photographic}},name);
  assert(dimensions.body[0]>=1254&&dimensions.body[1]>=1254);assert.deepEqual(dimensions.body,dimensions.full);assert(dimensions.photo&&dimensions.eyes);
  const prefs=(await (await context.request.get(origin+'/api/companion-preferences')).json()).preferences;assert.equal(prefs.nugget.skin,name);
  await studio.locator('[data-tab=settings]').click();await studio.locator('[data-toggle=motion]').uncheck();await pet.screenshot({path:path.join(output,name+'-studio.png')});await studio.locator('[data-toggle=motion]').check();
  await studio.locator('[data-tab=play]').click();
  for(const action of ['blink','talk','wave','hands','foot']){await studio.locator('[data-action='+action+']').click();assert.equal(await pet.getAttribute('data-state'),action);await page.waitForTimeout(130)}
  await studio.locator('#dance').click();assert.equal(await pet.getAttribute('data-state'),'dance');await studio.locator('#dance').click();
  await studio.locator('[data-toggle=asleep]').check();assert.equal(await pet.getAttribute('data-state'),'sleep');await studio.locator('[data-toggle=asleep]').uncheck();
  await studio.locator('[data-tab=name]').click();await studio.locator('#size-select').selectOption('extra-large');await studio.locator('.studio-close').click();
  assert.equal(await pet.evaluate(e=>e.getBoundingClientRect().width),250);assert.equal(await pet.locator('canvas').evaluate(c=>c.width),2048);
  await pet.screenshot({path:path.join(output,name+'-extra-large.png')});
  await page.reload();await page.waitForFunction(n=>document.querySelector('.nugget-companion .pet-button')?.dataset.renderedSkin===n,name);
  await page.locator('.header-account-summary').first().click();await page.locator('.header-account-menu [data-companion-open]').first().click();
 }
 assert.deepEqual(errors,[]);console.log('PASS: native-resolution photo layers, selection, saved reload, extra-large HiDPI canvas, thumbnails, blink/talk/limbs, dance and sleep. Previews: '+output);
}finally{await browser?.close();server.kill()}})().catch(e=>{console.error(e);process.exitCode=1});
