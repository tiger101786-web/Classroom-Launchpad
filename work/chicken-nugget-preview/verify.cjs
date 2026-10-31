const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url'),fs=require('node:fs'),os=require('node:os');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});try{
const page=await browser.newPage({viewport:{width:1280,height:1000}}),errors=[],out=fs.mkdtempSync(path.join(os.tmpdir(),'nugget-preview-'));page.on('pageerror',e=>errors.push(e.message));
await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);await page.locator('.pet img').evaluate(i=>i.decode());
assert(await page.locator('.pet img').evaluate(i=>i.naturalWidth>=1024));
await page.screenshot({path:path.join(out,'desktop.png'),fullPage:true});
await page.locator('#pet-name').fill('Sir Crispy Nugget');assert.equal(await page.locator('#plate-name').textContent(),'Sir Crispy Nugget');
for(const size of ['260','560','440']){await page.locator('#size').selectOption(size);await page.waitForTimeout(50);assert(await page.locator('#plate-name').evaluate(e=>e.scrollWidth<=e.clientWidth+1))}
await page.locator('#pet-name').fill('Nugget');
for(const background of ['dark','light','warm']){await page.locator('button[data-background='+background+']').click();assert.equal(await page.locator('.stage').getAttribute('data-background'),background);await page.locator('.stage').screenshot({path:path.join(out,background+'.png')})}
await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,'mobile.png'),fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
console.log('PASS: full-resolution artwork, name fitting, sizes, backgrounds and mobile layout. '+out);
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
