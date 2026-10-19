const {chromium}=require('playwright');
const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:1200,height:900}});
 await page.goto('file:///'+path.join(__dirname,'colt-skins-preview.html').replaceAll('\\','/'));
 const pet=page.locator('.robo-companion .pet-button');
 const original=await pet.locator('image').evaluateAll(es=>es.map(e=>[e.getAttribute('x'),e.getAttribute('y'),e.getAttribute('width'),e.getAttribute('height')]));
 for(const skin of ['Original','Arctic','Emerald','Galaxy','Royal','School Spirit']){
  await page.evaluate(s=>showSkin(s),skin);await page.waitForTimeout(150);
  assert.equal(await pet.getAttribute('data-skin'),skin);
  assert.deepEqual(await pet.locator('image').evaluateAll(es=>es.map(e=>[e.getAttribute('x'),e.getAttribute('y'),e.getAttribute('width'),e.getAttribute('height')])),original);
  assert.equal(await pet.locator('#rc-headphones [filter]').count(),0);
  await pet.screenshot({path:path.join(__dirname,'skin-'+skin.replaceAll(' ','-')+'.png')});
 }
 console.log('PASS: all six skins render with unchanged geometry and independent accessories.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
