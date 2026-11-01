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
 for(const name of ['Buffalo','Extra Crispy','BBQ','Garlic Parm','Honey Mustard','Teriyaki Sesame','Spicy']){
  await studio.locator('[data-tab=appearance]').click();await studio.locator('[data-subtab=skins]').click();await studio.locator('[data-skin-choice="'+name+'"]').click();
  await page.waitForFunction(n=>document.querySelector('.nugget-companion .pet-button').dataset.renderedSkin===n,name);
  assert.equal(await pet.locator('.pet-button').getAttribute('data-skin-error'),null);
  const dimensions=await page.evaluate(async name=>{const s=await nuggetSkinLayers(name),source=new Image();source.src='/nugget-pet/skins/'+nuggetSkins[name].file+'-character-v2.png';await source.decode();return {source:[source.naturalWidth,source.naturalHeight],body:[s.body.width,s.body.height],full:[s.original.width,s.original.height],eyes:!!s.eyes,photo:s.photographic}},name);
  assert(dimensions.source.every(n=>n>=1024));assert.deepEqual(dimensions.body,dimensions.source);assert.deepEqual(dimensions.body,dimensions.full);assert(dimensions.photo&&dimensions.eyes);
  // A still rig must reproduce the complete original feet, with no clipped
  // scraps, holes, duplicate foot fragments or texture changes at either ankle.
  await page.evaluate(async name=>{
   const host=document.createElement('div');host.id='foot-art-audit';host.style.cssText='position:fixed;left:-5000px;width:560px';host.innerHTML='<img src="/nugget-pet/nugget-concept.png">';document.body.append(host);
   window.footAuditRig=await mountNuggetRig(host);footAuditRig.update({skin:name,motion:false,visible:false});
  },name);
  await page.waitForFunction(n=>document.querySelector('#foot-art-audit').dataset.renderedSkin===n,name);
  const footPixels=await page.evaluate(async name=>{
   const skin=await nuggetSkinLayers(name),actual=document.querySelector('#foot-art-audit canvas'),expected=document.createElement('canvas');expected.width=expected.height=2048;const g=expected.getContext('2d');g.imageSmoothingQuality='high';g.setTransform(2,0,0,2,0,0);g.drawImage(skin.basket,0,0,1024,1024);g.drawImage(skin.original,0,0,1024,1024);
   const a=actual.getContext('2d').getImageData(400,1220,1200,300).data,b=g.getImageData(400,1220,1200,300).data;let changed=0;for(let i=0;i<a.length;i++)if(a[i]!==b[i])changed++;
   document.querySelector('#foot-art-audit').remove();delete window.footAuditRig;return changed;
  },name);
  assert.equal(footPixels,0,'Both feet must match the uncut artwork exactly: '+name);
  const prefs=(await (await context.request.get(origin+'/api/companion-preferences')).json()).preferences;assert.equal(prefs.nugget.skin,name);
  await studio.locator('[data-tab=settings]').click();await studio.locator('[data-toggle=motion]').uncheck();await pet.screenshot({path:path.join(output,name+'-studio.png')});await studio.locator('[data-toggle=motion]').check();
  await studio.locator('[data-tab=play]').click();
  for(const action of ['blink','talk','wave','hands','foot']){await studio.locator('[data-action='+action+']').click();assert.equal(await pet.getAttribute('data-state'),action);const before=await pet.locator('canvas').evaluate(c=>c.toDataURL());await page.waitForTimeout(130);assert.notEqual(await pet.locator('canvas').evaluate(c=>c.toDataURL()),before,'Animation must actually redraw '+name+' '+action);if(action==='wave')await pet.screenshot({path:path.join(output,name+'-wave.png')})}
  await studio.locator('#dance').click();assert.equal(await pet.getAttribute('data-state'),'dance');await page.waitForTimeout(350);await pet.screenshot({path:path.join(output,name+'-dance.png')});await studio.locator('#dance').click();
  await studio.locator('[data-toggle=asleep]').check();assert.equal(await pet.getAttribute('data-state'),'sleep');await page.waitForTimeout(350);await pet.screenshot({path:path.join(output,name+'-sleep.png')});await studio.locator('[data-toggle=asleep]').uncheck();
  await studio.locator('[data-tab=name]').click();await studio.locator('#size-select').selectOption('extra-large');await studio.locator('.studio-close').click();
  assert.equal(await pet.evaluate(e=>e.getBoundingClientRect().width),250);assert.equal(await pet.locator('canvas').evaluate(c=>c.width),2048);
  await pet.screenshot({path:path.join(output,name+'-extra-large.png')});
  await page.reload();await page.waitForFunction(n=>document.querySelector('.nugget-companion .pet-button')?.dataset.renderedSkin===n,name);
  await page.locator('.header-account-summary').first().click();await page.locator('.header-account-menu [data-companion-open]').first().click();
 }
 // Switching away must clear photographic limb/eye overrides for legacy skins.
 for(const name of ['Golden','Frozen']){
  await studio.locator('[data-tab=appearance]').click();await studio.locator('[data-subtab=skins]').click();await studio.locator('[data-skin-choice="'+name+'"]').click();
  await page.waitForFunction(n=>document.querySelector('.nugget-companion .pet-button').dataset.renderedSkin===n,name);
  assert.equal(await pet.locator('.pet-button').getAttribute('data-skin-error'),null);
  assert.equal(await page.evaluate(async n=>!!(await nuggetSkinLayers(n)).parts,name),false);
 }
 assert.equal(await page.evaluate(()=>Object.keys(nuggetSkins).length),10);
 assert.deepEqual(errors,[]);console.log('PASS: native-resolution photo layers, selection, saved reload, extra-large HiDPI canvas, thumbnails, blink/talk/limbs, dance, sleep and legacy-skin switching. Previews: '+output);
}finally{await browser?.close();server.kill()}})().catch(e=>{console.error(e);process.exitCode=1});
