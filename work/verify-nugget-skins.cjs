const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:1440,height:1080}}),errors=[],out=fs.mkdtempSync(path.join(os.tmpdir(),'nugget-flavors-'));page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8766/');await page.waitForFunction(()=>window.nuggetRig);
 await page.locator('#size').selectOption('560');
 const names=await page.locator('#skin option').allTextContents();assert.equal(names.length,8);
 for(const name of names){
  await page.waitForTimeout(2000);await page.selectOption('#skin',name);await page.waitForFunction(n=>document.querySelector('.pet').dataset.renderedSkin===n,name);
  assert.equal(await page.locator('.pet').getAttribute('data-skin-error'),null);
  await page.locator('.pet').screenshot({path:path.join(out,name+'-idle.png')});
  await page.locator('[data-move=wave]').click();await page.waitForTimeout(600);await page.locator('.pet').screenshot({path:path.join(out,name+'-wave.png')});
  await page.locator('#dance').click();await page.waitForTimeout(300);await page.locator('.pet').screenshot({path:path.join(out,name+'-dance.png')});await page.locator('#dance').click();
  await page.locator('#sleep').click();await page.waitForTimeout(700);await page.locator('.pet').screenshot({path:path.join(out,name+'-sleep.png')});await page.locator('#sleep').click();
  assert.equal(await page.locator('canvas').evaluate(c=>c.width),2048);
 }
 const pixelChecks=await page.evaluate(async()=>{
  const get=source=>{const c=document.createElement('canvas');c.width=source.width;c.height=source.height;const x=c.getContext('2d');x.drawImage(source,0,0);return x.getImageData(0,0,c.width,c.height).data};
  const base=await nuggetSkinLayers('Golden'),body=get(base.body),basket=get(base.basket);let dipColors=[];
  for(const name of Object.keys(nuggetSkins).slice(1)){
   const skin=await nuggetSkinLayers(name),d=get(skin.body),b=get(skin.basket);if(body.length!==d.length)return 'dimensions '+name;
   for(let i=3;i<d.length;i+=4)if(body[i]!==d[i])return 'alpha '+name+' '+i;
   const w=skin.basket.width,h=skin.basket.height;
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(x>=Math.floor(w*.69)&&x<Math.ceil(w*.94)&&y>=Math.floor(h*.50)&&y<Math.ceil(h*.585))continue;const i=(y*w+x)*4;for(let k=0;k<4;k++)if(b[i+k]!==basket[i+k])return 'basket '+name+' '+x+','+y+' '+b[i+k]+'/'+basket[i+k]}
   const sample=(Math.round(h*547/1024)*w+Math.round(w*823/1024))*4;dipColors.push(Array.from(b.slice(sample,sample+3)).join(','));
  }return new Set(dipColors).size===7;
 });assert.equal(pixelChecks,true,'Original silhouettes/basket must stay exact and seven dips must differ');
 await page.selectOption('#skin','Golden');await page.waitForFunction(()=>document.querySelector('.pet').dataset.renderedSkin==='Golden');
 assert.deepEqual(errors,[]);console.log('PASS: all eight skins, original alpha, unchanged basket, matching unique dips, animations and full-resolution canvas. '+out);
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
