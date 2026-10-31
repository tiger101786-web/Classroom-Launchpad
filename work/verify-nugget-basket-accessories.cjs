const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8766/');
  await page.waitForFunction(()=>document.querySelector('.pet').dataset.basketAccessory==='french-fries');
  await page.selectOption('#size','560');await page.uncheck('#motion');
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'nugget-fries-'));
  for(const name of ['french-fries','waffle-fries','none']){
   await page.selectOption('#basket-accessory',name);
   await page.waitForFunction(n=>document.querySelector('.pet').dataset.basketAccessory===n,name);
   assert.equal(await page.locator('canvas').evaluate(c=>c.width),2048);
   await page.locator('.pet').screenshot({path:path.join(dir,name+'.png')});
  }
  await page.selectOption('#basket-accessory','waffle-fries');await page.check('#motion');
  for(const skin of ['BBQ','Burnt','Golden']){
   await page.selectOption('#skin',skin);
   await page.waitForFunction(n=>document.querySelector('.pet').dataset.renderedSkin===n,skin);
   await page.locator('#dance').click();await page.waitForTimeout(400);
   assert.equal(await page.locator('.pet').getAttribute('data-state'),'dance');
   await page.locator('.pet').screenshot({path:path.join(dir,skin+'-dance.png')});
   await page.locator('#dance').click();
  }
  await page.locator('#sleep').click();await page.waitForTimeout(500);assert.equal(await page.locator('.pet').getAttribute('data-state'),'sleep');
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(errors,[]);console.log('PASS: accessories, no accessory, paused updates, full resolution, flavor switching, dancing, sleep and mobile. '+dir);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
