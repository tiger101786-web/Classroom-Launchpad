const {chromium}=require('playwright');
const path=require('node:path');const assert=require('node:assert/strict');
const {createCanvas,loadImage}=require('@napi-rs/canvas');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:1200,height:900}});
 await page.goto('file:///'+path.join(__dirname,'colt-skins-preview.html').replaceAll('\\','/'));
 const pet=page.locator('.robo-companion .pet-button');
 const original=await pet.locator('image').evaluateAll(es=>es.map(e=>[e.getAttribute('x'),e.getAttribute('y'),e.getAttribute('width'),e.getAttribute('height')]));
 let armorPixels;
 for(const skin of await page.evaluate(()=>Object.keys(roboColtSkins))){
  await page.evaluate(s=>showSkin(s),skin);await page.waitForTimeout(150);
  assert.equal(await pet.getAttribute('data-skin'),skin);
  assert.deepEqual(await pet.locator('image').evaluateAll(es=>es.map(e=>[e.getAttribute('x'),e.getAttribute('y'),e.getAttribute('width'),e.getAttribute('height')])),original);
  assert.equal(await pet.locator('#rc-headphones [filter]').count(),0);
  assert.equal(await pet.locator('#rc-ear-left #rc-earphone-left').count(),1);
  assert.equal(await pet.locator('#rc-ear-right #rc-earphone-right').count(),1);
  const capture=await pet.screenshot({path:path.join(__dirname,'skin-'+skin.replaceAll(' ','-')+'.png')});
  const canvas=createCanvas(440,440),ctx=canvas.getContext('2d');ctx.drawImage(await loadImage(capture),0,0);
  assert.deepEqual([...ctx.getImageData(60,100,1,1).data],[41,37,45,255],'Texture must not spill outside the silhouette');
  const pixels=[[205,226],[247,270]].flatMap(([x,y])=>[...ctx.getImageData(x,y,1,1).data]);
  if(skin==='Original')armorPixels=pixels;
  else if(['Royal','School Spirit'].includes(skin))assert.deepEqual(pixels,armorPixels,skin+' must preserve black armor pixels');
  else assert.notDeepEqual(pixels,armorPixels,skin+' has its own armor finish');
  if(['Emerald','Galaxy'].includes(skin))assert.equal(await page.evaluate(s=>Boolean(roboColtSkins[s].glitter),skin),false);
 }
 console.log('PASS: all skins render with unchanged geometry and independent accessories.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
