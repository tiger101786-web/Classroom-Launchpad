const {chromium}=require('playwright');
const path=require('node:path');const assert=require('node:assert/strict');
const {createCanvas,loadImage}=require('@napi-rs/canvas');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:1200,height:900}});
 await page.goto('file:///'+path.join(__dirname,'colt-skins-preview.html').replaceAll('\\','/'));
 const pet=page.locator('.robo-companion .pet-button');
 assert.equal(await page.evaluate(()=>roboColtSkins['Candy Chrome'].pattern),undefined,'Candy Chrome must not restore blue stripes');
 const original=await pet.locator('image').evaluateAll(es=>es.map(e=>[e.getAttribute('x'),e.getAttribute('y'),e.getAttribute('width'),e.getAttribute('height')]));
 let armorPixels;
 for(const skin of await page.evaluate(()=>Object.keys(roboColtSkins))){
  await page.evaluate(s=>showSkin(s),skin);await page.waitForTimeout(150);
  assert.equal(await pet.getAttribute('data-skin'),skin);
  const eyeOffsets=skin==='Porcelain'?['translate(9 3)','translate(16 2)']:skin==='Obsidian Ember'?['translate(13 -3)','translate(15 -1)']:['translate(0 0)','translate(0 0)'];
  for(const state of ['eyes-open','eyes-happy','eyes-sleep'])assert.deepEqual(await pet.locator('.'+state+' [data-eye-anchor]').evaluateAll(es=>es.map(e=>e.getAttribute('transform'))),eyeOffsets);
  assert.equal(await pet.locator('#rc-mouth').getAttribute('transform'),skin==='Porcelain'?'translate(378 405) scale(.8)':'translate(367 400)');
  const art=await page.evaluate(s=>roboColtSkins[s].artwork,skin);
  const partImages=pet.locator('#rc-puppet image');
  assert((await partImages.evaluateAll(es=>es.map(e=>e.getAttribute('href')))).every(h=>h===(art||'robo-colt/parts-v1.png')));
  if(art)assert.equal(await partImages.evaluateAll(es=>es.some(e=>e.hasAttribute('filter'))),false,'Approved artwork must not be recolored');
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
 await page.evaluate(()=>showSkin('Original'));
 assert((await pet.locator('#rc-puppet image').evaluateAll(es=>es.map(e=>e.getAttribute('href')))).every(h=>h==='robo-colt/parts-v1.png'));
 console.log('PASS: all skins render with unchanged geometry, approved artwork switching, and independent accessories.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
