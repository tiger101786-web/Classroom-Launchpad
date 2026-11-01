const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const origin='http://127.0.0.1:8196',output=path.join(os.tmpdir(),'nugget-new-sides');fs.mkdirSync(output,{recursive:true});
const server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:'8196',DATA_DIR:fs.mkdtempSync(path.join(os.tmpdir(),'nugget-side-data-')),SESSION_SECRET:'side-test',TEACHER_PIN:'654321'},stdio:'ignore'});let browser;
(async()=>{try{
 for(let i=0;i<100;i++){try{if((await fetch(origin+'/api/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});
 const context=await browser.newContext({viewport:{width:1440,height:1080},deviceScaleFactor:2});
 assert.equal((await context.request.post(origin+'/api/auth/teacher',{headers:{Origin:origin},data:{pin:'654321'}})).status(),200);
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(origin);
 await page.locator('.header-account-summary').first().click();await page.locator('.header-account-menu [data-companion-open]').first().click();
 const studio=page.locator('.pet-studio'),pet=page.locator('.nugget-companion');await studio.locator('#pet-select').selectOption('nugget');
 await page.waitForFunction(()=>document.querySelector('.nugget-companion')?.dataset.ready==='true');
 // Exercise the unchanged fries renderer's protections with both new assets
 // and three different matching sauce materials.
 const pixelAudit=await page.evaluate(async()=>{
  const failures=[];
  for(const side of ['tater-tots','fried-pickles']){
   const asset=new Image();asset.src='/nugget-pet/accessories/'+side+'-v2.png';await asset.decode();
   const ac=document.createElement('canvas');ac.width=asset.naturalWidth;ac.height=asset.naturalHeight;const ag=ac.getContext('2d');ag.drawImage(asset,0,0);
   if(asset.naturalWidth<1024||asset.naturalHeight<1024)failures.push(side+' resolution');
   const top=ag.getImageData(0,0,ac.width,Math.floor(ac.height*285/1024)).data;let cropped=0;for(let i=3;i<top.length;i+=4)if(top[i]>100)cropped++;if(cropped>8)failures.push(side+' extends above the approved basket boundary');
   for(const [x,y] of [[0,0],[.5,.1],[.5,.4]])if(ag.getImageData(Math.floor(ac.width*x),Math.floor(ac.height*y),1,1).data[3]>1)failures.push(side+' transparent opening');
   for(const skin of ['Golden','Ranch','Teriyaki Sesame']){
    const layers=await nuggetSkinLayers(skin),accessory=createNuggetBasketAccessories();await accessory.select(side);
    const c=document.createElement('canvas');c.width=c.height=2048;const g=c.getContext('2d');g.setTransform(2,0,0,2,0,0);g.imageSmoothingQuality='high';g.drawImage(layers.basket,0,0,1024,1024);
    const before=g.getImageData(0,0,2048,2048).data;accessory.draw(g,layers.basket);const after=g.getImageData(0,0,2048,2048).data;
    const same=(x0,y0,x1,y1,tolerance=0)=>{for(let y=y0*2;y<y1*2;y++)for(let x=x0*2;x<x1*2;x++){const i=(y*2048+x)*4;for(let k=0;k<4;k++)if(Math.abs(before[i+k]-after[i+k])>tolerance)return false;}return true;};
    // The approved cup is slightly translucent (alpha253); restoring it over
    // food changes alpha by2. Permit only that tiny compositing/readback noise.
    for(const [label,box,tolerance] of [['left foot',[382,705,420,726],0],['right foot',[593,705,631,726],0],['sauce',[790,540,870,620],4],['rim/nameplate',[0,790,1024,1024],1]])if(!same(...box,tolerance))failures.push(side+' '+skin+' changes '+label);
    let changedLeft=0,changedRight=0;for(let y=300;y<690;y+=2)for(let x=20;x<1000;x+=2){const i=((y*2)*2048+x*2)*4;if(before[i]!==after[i]||before[i+1]!==after[i+1]||before[i+2]!==after[i+2]){if(x<330)changedLeft++;if(x>670)changedRight++;}}
    if(changedLeft<1000||changedRight<1000)failures.push(side+' must fill both basket sides');
    await accessory.select('none');const copy=document.createElement('canvas');copy.width=copy.height=2048;const cg=copy.getContext('2d');cg.setTransform(2,0,0,2,0,0);cg.imageSmoothingQuality='high';cg.drawImage(layers.basket,0,0,1024,1024);accessory.draw(cg,layers.basket);const none=cg.getImageData(0,0,2048,2048).data;for(let i=0;i<none.length;i++)if(none[i]!==before[i]){failures.push('none does not restore basket');break;}
   }
  }
  return failures;
 });assert.deepEqual(pixelAudit,[]);
 const instrumentSides=()=>page.evaluate(()=>{window.sideDrawLog=[];const draw=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(image,...args){if(image instanceof HTMLImageElement&&/\/(tater-tots|fried-pickles)-v2\.png/.test(image.src)){const m=this.getTransform();sideDrawLog.push({args,matrix:[m.a,m.b,m.c,m.d,m.e,m.f]});if(sideDrawLog.length>64)sideDrawLog.shift();}return draw.call(this,image,...args);};});
 const stationarySides=async()=>{const draws=await page.evaluate(()=>sideDrawLog);assert(draws.length>0);for(const draw of draws){assert.deepEqual(draw.args,[0,0,1024,1024]);assert.deepEqual(draw.matrix,[2,0,0,2,0,0],'Sides stay on the stationary basket transform');}};
 const openAccessories=async()=>{await studio.locator('[data-tab=appearance]').click();await studio.locator('[data-subtab=accessories]').click();};
 for(const side of ['tater-tots','fried-pickles']){
  await instrumentSides();
  const skin=side==='tater-tots'?'Teriyaki Sesame':'Spicy';await studio.locator('[data-tab=appearance]').click();await studio.locator('[data-subtab=skins]').click();await studio.locator('[data-skin-choice="'+skin+'"]').click();await page.waitForFunction(n=>document.querySelector('.nugget-companion .pet-button')?.dataset.renderedSkin===n,skin);
  await openAccessories();await studio.locator('[data-choice-key="basketAccessory"][data-choice="'+side+'"]').click();
  await page.waitForFunction(s=>document.querySelector('.nugget-companion .pet-button')?.dataset.basketAccessory===s,side);
  assert.equal(await pet.locator('.pet-button').getAttribute('data-accessory-error'),null);
  await studio.locator('[data-tab=settings]').click();await studio.locator('[data-toggle=motion]').uncheck();await pet.screenshot({path:path.join(output,side+'-studio.png')});await studio.locator('[data-toggle=motion]').check();
  await studio.locator('[data-tab=play]').click();
  for(const action of ['wave','foot']){await page.evaluate(()=>sideDrawLog=[]);await studio.locator('[data-action='+action+']').click();assert.equal(await pet.getAttribute('data-state'),action);await page.waitForTimeout(500);await stationarySides();}
  await page.evaluate(()=>sideDrawLog=[]);await studio.locator('#dance').click();assert.equal(await pet.getAttribute('data-state'),'dance');await page.waitForTimeout(400);await stationarySides();await pet.screenshot({path:path.join(output,side+'-dance.png')});await studio.locator('#dance').click();
  await studio.locator('[data-tab=name]').click();await studio.locator('[data-toggle=platform]').uncheck();assert.equal(await pet.locator('canvas').evaluate(c=>c.getContext('2d').getImageData(200,1200,1,1).data[3]),0);await studio.locator('[data-toggle=platform]').check();await studio.locator('#size-select').selectOption('extra-large');
  await studio.locator('.studio-close').click();assert.equal(await pet.evaluate(e=>e.getBoundingClientRect().width),250);assert.equal(await pet.locator('canvas').evaluate(c=>c.width),2048);
  const prefs=(await (await context.request.get(origin+'/api/companion-preferences')).json()).preferences;assert.equal(prefs.nugget.basketAccessory,side);assert.equal(prefs.nugget.skin,skin);
  await page.reload();await page.waitForFunction(s=>document.querySelector('.nugget-companion .pet-button')?.dataset.basketAccessory===s,side);
  await page.setViewportSize({width:390,height:844});assert.equal(await pet.evaluate(e=>e.getBoundingClientRect().width),250);await pet.screenshot({path:path.join(output,side+'-mobile.png')});await page.setViewportSize({width:1440,height:1080});
  await page.locator('.header-account-summary').first().click();await page.locator('.header-account-menu [data-companion-open]').first().click();
 }
 const prefs=(await (await context.request.get(origin+'/api/companion-preferences')).json()).preferences;
 assert.equal((await context.request.put(origin+'/api/companion-preferences',{headers:{Origin:origin},data:{...prefs,nugget:{...prefs.nugget,basketAccessory:'invalid-side'}}})).status(),400);
 assert.deepEqual(errors,[]);console.log('PASS: both native accessories; unchanged feet/sauce/rim across three skins; stationary sides; wave/foot/dance; basket toggle; saved reload; mobile extra-large; invalid selection rejection. Previews: '+output);
}finally{await browser?.close();server.kill();}})().catch(e=>{console.error(e);process.exitCode=1;});
