const {chromium}=require('playwright');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:700}});
 await page.goto('file:///'+path.resolve('index.html').replaceAll('\\','/'));
 await page.evaluate(()=>{document.head.querySelectorAll('link,style').forEach(e=>e.remove());document.body.innerHTML='';document.body.style.cssText='background:#29232d;margin:0';});
 await page.addStyleTag({path:'saber-pet/interactive.css'});
 await page.addScriptTag({path:'saber-pet/art-data.js'});
 await page.addScriptTag({path:'saber-pet/interactive.js'});
 await page.evaluate(()=>{window.testSaber=createSaberPet(()=>{},()=>{});testSaber.update({account:'test',visible:true,preferences:{...saberDefaults(),size:'extra-large',motion:false}});testSaber.host.style.left='50px';testSaber.host.style.top='40px';});
 await page.waitForFunction(()=>document.querySelector('.saber-companion')?.dataset.ready==='true');
 await page.waitForTimeout(300);
 console.log(await page.locator('.saber-companion canvas').evaluate(c=>({width:c.width,display:c.getBoundingClientRect().width})));
 assert.equal(await page.locator('.saber-companion canvas').evaluate(c=>c.width),2048);
 assert(Number(await page.locator('.saber-companion').getAttribute('data-detail-bias'))>2.8);
 await page.locator('.saber-companion').screenshot({path:'work/saber-quality-'+(process.argv[2]||'after')+'.png'});
 await page.evaluate(()=>{const img=document.createElement('img');img.src='saber-pet/tiger.png';img.id='reference';img.style.cssText='position:absolute;left:300px;top:40px;width:189.79px';document.body.append(img);});
 await page.locator('#reference').screenshot({path:'work/saber-quality-reference.png'});
 await page.evaluate(()=>testSaber.host.style.width='600px');await page.waitForTimeout(100);
 assert(Number(await page.locator('.saber-companion').getAttribute('data-detail-bias'))<2.1,'Filtering must adjust for large views');
 assert.equal(await page.locator('.saber-companion canvas').evaluate(c=>c.width),2048);
 console.log('PASS: full-resolution canvas with display-aware filtering at small and large sizes');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
