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
 for(const skin of await page.evaluate(()=>['Original',...Object.keys(roboColtSkins).filter(s=>s!=='Original')])){
  await page.evaluate(s=>showSkin(s),skin);await page.waitForTimeout(150);
  assert.equal(await pet.getAttribute('data-skin'),skin);
  const eyeOffsets=await pet.locator('.eyes-open [data-eye-anchor]').evaluateAll(es=>es.map(e=>e.getAttribute('transform')));
  for(const state of ['eyes-open','eyes-happy','eyes-sleep'])assert.deepEqual(await pet.locator('.'+state+' [data-eye-anchor]').evaluateAll(es=>es.map(e=>e.getAttribute('transform'))),eyeOffsets);
  if(!await page.evaluate(s=>Boolean(roboColtSkins[s].artwork),skin))assert.equal(await pet.locator('#rc-mouth').getAttribute('transform'),'translate(367 400)');
  const art=await page.evaluate(s=>roboColtSkins[s].artwork,skin);
  const partImages=pet.locator('#rc-puppet image[href*="/parts-"]');
  assert((await partImages.evaluateAll(es=>es.map(e=>e.getAttribute('href')))).every(h=>h===(art||'robo-colt/parts-v1.png')));
  if(art)assert.equal(await partImages.evaluateAll(es=>es.some(e=>e.hasAttribute('filter'))),false,'Approved artwork must not be recolored');
  if(!art)assert.deepEqual(await pet.locator('image').evaluateAll(es=>es.map(e=>[e.getAttribute('x'),e.getAttribute('y'),e.getAttribute('width'),e.getAttribute('height')])),original);
  if(art){
   const bounds=await page.evaluate(s=>roboColtSkins[s].bounds,skin)||(skin==='Porcelain'?[[129,21,625,672],[863,171,1076,655],[208,706,439,1203],[769,732,1206,1184]]:[[138,17,624,672],[861,162,1077,651],[209,696,442,1195],[756,732,1192,1173]]);
   const expected=[[127,17,607,671],[851,167,1056,649],[210,700,433,1192],[765,737,1178,1168]];
   const selectors=['#rc-ear-left image','#rc-leg-left image','#rc-leg-right image','#rc-tail image'];
   for(let i=0;i<4;i++){
    const mapped=await pet.locator(selectors[i]).first().evaluate((e,b)=>{const x=+e.getAttribute('x'),y=+e.getAttribute('y'),sx=+e.getAttribute('width')/1254,sy=+e.getAttribute('height')/1254;return [x+b[0]*sx,y+b[1]*sy,x+b[2]*sx,y+b[3]*sy]},bounds[i]);
    mapped.forEach((v,j)=>assert(Math.abs(v-expected[i][j])<.001,skin+' part '+i+' registration'));
   }
  }
  assert.equal(await pet.locator('#rc-headphones [filter]').count(),0);
  assert.equal(await pet.locator('[data-pupil]').first().getAttribute('data-pupil'),skin==='Tiger'?'tiger':skin==='Crocodile'?'crocodile':skin==='Snake'?'snake':skin==='Axolotl'?'axolotl':'original');
  if(skin==='Axolotl'){
   assert.equal(await pet.locator('[data-pupil]').first().getAttribute('rx'),'19');
   assert.equal(await pet.locator('[data-pupil]').first().getAttribute('ry'),'19');
   assert.equal(await pet.locator('.eye ellipse[filter]').first().evaluate(e=>getComputedStyle(e).opacity),'0');
  }
  assert.equal(await pet.locator('#rc-headphones image').count(),2,'Both fitted earcups remain independent of skin artwork');
  assert.equal(await pet.locator('#rc-audio-rear-band path').count(),3,'Continuous band stays intact');
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
 assert((await pet.locator('#rc-puppet image[href*="/parts-"]').evaluateAll(es=>es.map(e=>e.getAttribute('href')))).every(h=>h==='robo-colt/parts-v1.png'));
 console.log('PASS: all skins render with unchanged geometry, approved artwork switching, and independent accessories.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
