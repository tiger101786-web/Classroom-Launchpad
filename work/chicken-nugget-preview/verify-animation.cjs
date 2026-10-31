const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url'),fs=require('node:fs'),os=require('node:os');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:1280,height:1000}}),errors=[],out=fs.mkdtempSync(path.join(os.tmpdir(),'nugget-motion-'));page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.NUGGET_PREVIEW_URL||pathToFileURL(path.join(__dirname,'index.html')).href);await page.waitForFunction(()=>document.querySelector('.pet').dataset.ready==='true');
 assert.equal(await page.locator('canvas').evaluate(c=>c.width),2048);
 await page.locator('#size').selectOption('560');
 for(const move of ['idle','hello','happy','blink','talk','hands','wave','shake','look','foot']){
  if(move!=='idle')await page.locator('[data-move='+move+']').click();
  await page.waitForTimeout(move==='blink'?110:650);await page.locator('.pet').screenshot({path:path.join(out,move+'.png')});
 }
 await page.locator('#sleep').click();await page.waitForTimeout(800);assert.equal(await page.locator('.pet').getAttribute('data-state'),'sleep');await page.locator('.pet').screenshot({path:path.join(out,'sleep.png')});
 await page.locator('#sleep').click();await page.waitForTimeout(900);await page.locator('.pet').screenshot({path:path.join(out,'wake.png')});
 await page.locator('#dance').click();await page.waitForTimeout(400);assert.equal(await page.locator('.pet').getAttribute('data-state'),'dance');await page.locator('.pet').screenshot({path:path.join(out,'dance.png')});
 const f=await page.locator('canvas').getAttribute('data-frame');await page.waitForTimeout(150);assert.notEqual(await page.locator('canvas').getAttribute('data-frame'),f);
 await page.locator('#motion').uncheck();const still=await page.locator('canvas').getAttribute('data-frame');await page.waitForTimeout(200);assert.equal(await page.locator('canvas').getAttribute('data-frame'),still);
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('#motion').isChecked(),false);
 await page.locator('#motion').check();assert.equal(await page.locator('#motion').isChecked(),true);
 await page.locator('[data-move=wave]').click();assert.equal(await page.locator('.pet').getAttribute('data-state'),'wave');
 const resumed=await page.locator('canvas').getAttribute('data-frame');await page.waitForTimeout(150);assert.notEqual(await page.locator('canvas').getAttribute('data-frame'),resumed);
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
 console.log('PASS: animation controls, dance/sleep/wake, paused/reduced motion, 2048px rendering and mobile. '+out);
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
