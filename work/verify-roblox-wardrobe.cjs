const assert=require('node:assert/strict'),path=require('node:path'),os=require('node:os'),fs=require('node:fs');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});try{
 const page=await browser.newPage({viewport:{width:1200,height:1050}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.join(__dirname,'roblox-skins-preview.html')).href);await page.locator('#motion').uncheck();
 const names=await page.evaluate(()=>Object.keys(robloxSkins));
 for(const top of names)for(const pants of names){await page.locator('#top').selectOption(top);await page.locator('#pants').selectOption(pants);const result=await page.evaluate(()=>{const p=document.querySelector('.pet-button');return {top:p.dataset.top,pants:p.dataset.pants,filter:p.querySelector('.legs image').getAttribute('filter'),expected:robloxSkins[p.dataset.pants].legs}});assert.equal(result.top,top);assert.equal(result.pants,pants);assert.equal(result.filter,result.expected?'url(#rbwear-'+result.expected+')':null);}
 await page.locator('[data-skin="Bacon Hair"]').click();await page.locator('#top').selectOption('Builder');await page.locator('#pants').selectOption('Knight');await page.locator('#headwear').selectOption('bacon-hair');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'roblox-wardrobe-'));await page.screenshot({path:path.join(dir,'existing-outfits-mixed.png')});
 await page.locator('#motion').check();await page.locator('[data-action=hands]').click();await page.waitForTimeout(350);await page.screenshot({path:path.join(dir,'mixed-arm-movement.png')});
 assert.deepEqual(errors,[]);console.log('PASS: all '+names.length*names.length+' top/pants combinations, including all existing outfits. Screenshots: '+dir);
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
