const {chromium}=require('playwright');const fs=require('fs');const assert=require('assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});try{
const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('file:///C:/Users/Sinister/Documents/GitHub/Classroom-Launchpad/work/pet-studio-preview.html');
await page.waitForTimeout(500);assert.deepEqual(errors,[]);
fs.mkdirSync('work/pet-studio-assets',{recursive:true});
for(const pet of ['colt','squishy']){
const names=await page.evaluate(p=>p==='colt'?Object.keys(roboColtSkins):[...document.querySelectorAll('.dumpling-companion [data-color]')].map(b=>b.dataset.color),pet);
for(const name of names){await page.evaluate(([p,n])=>studioCapture(p,n),[pet,name]);await page.waitForTimeout(100);await page.locator('#pet-stage '+(pet==='colt'?'.robo-companion':'.dumpling-companion')+' .pet-button').screenshot({path:'work/pet-studio-assets/'+pet+'-'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'.png'});}
}
await page.reload();await page.waitForTimeout(500);
await page.screenshot({path:'work/pet-studio-desktop.png',fullPage:true});
await page.locator('#skin-search').fill('porcelain');await page.locator('[data-skin-choice="Porcelain"]').click();assert.match(await page.locator('#pet-subtitle').innerText(),/Porcelain/);
await page.locator('#undo').click();assert.match(await page.locator('#pet-subtitle').innerText(),/Jack-o-Lantern/);
await page.locator('[data-tab="name"]').click();await page.locator('#pet-name').fill('Copper');assert.equal(await page.locator('#pet-title').innerText(),'Copper');
await page.locator('#pet-select').selectOption('squishy');await page.locator('[data-tab="appearance"]').click();await page.waitForTimeout(300);await page.screenshot({path:'work/pet-studio-squishy.png',fullPage:true});
await page.locator('[data-subtab="accessories"]').click();await page.locator('[data-choice="crown"]').click();assert.equal(await page.locator('.dumpling-companion .pet-button').getAttribute('data-accessory'),'crown');
await page.locator('#dance').click();assert.equal(await page.locator('#dance').getAttribute('aria-pressed'),'true');await page.locator('#dance').click();
await page.setViewportSize({width:390,height:844});await page.locator('[data-subtab="skins"]').click();await page.screenshot({path:'work/pet-studio-mobile.png',fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
await page.evaluate(()=>localStorage.removeItem('petStudioDesignPreviewV1'));assert.deepEqual(errors,[]);console.log('PASS: real thumbnails, both pets, skin selection, undo, names, accessories, dancing and mobile layout.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
