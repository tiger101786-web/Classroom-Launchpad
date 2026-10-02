const fs=require('fs'),assert=require('assert/strict'),{chromium}=require('playwright');
(async()=>{
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
try{
const page=await browser.newPage();
await page.route('https://test.local/**',r=>r.fulfill({body:'<html><body></body></html>',contentType:'text/html'}));
await page.goto('https://test.local/');
await page.addStyleTag({content:fs.readFileSync('styles.css','utf8')});
await page.evaluate(()=>{document.body.dataset.theme='night';document.body.innerHTML='<div id="coltRadioRoot"></div><div style="width:250px"><section class="calendar-card"><div class="calendar-card-top"><span class="calendar-day">Friday</span></div><span class="calendar-date">October 2</span><span class="calendar-year">2026</span><div class="calendar-divider"></div><span class="calendar-time">4:50:48 PM</span></section></div>';});
for(const viewport of [390,1280]){
await page.setViewportSize({width:viewport,height:850});
for(const month of ['January','February','March','April','May','June','July','August','September','October','November','December'])for(const day of [2,28]){
await page.locator('.calendar-date').evaluate((el,{month,day})=>{el.textContent=month+' '+day;el.classList.toggle('is-long-month',month.length>=9);},{month,day});
assert(await page.locator('.calendar-date').evaluate(el=>{const range=document.createRange();range.selectNodeContents(el);const r=range.getBoundingClientRect(),p=el.getBoundingClientRect();return r.right<=p.right+1&&r.left>=p.left-1&&el.scrollWidth<=el.clientWidth;}),month+' '+day);
}
}
await page.locator('.calendar-date').evaluate(el=>{el.textContent='October 2';el.classList.remove('is-long-month');});
await page.locator('.calendar-card').screenshot({path:'work/calendar-fit.png'});
// Mock provider requests for deterministic UI checks; live stream checked separately.
await page.route('https://app.sonicpanelradio.com:8088/**',r=>r.abort());
await page.route('https://www.iheart.com/**',r=>r.fulfill({body:'Official player placeholder for UI test',contentType:'text/html'}));
await page.addScriptTag({content:fs.readFileSync('colt-radio.js','utf8')});
await page.locator('.colt-radio-launcher').click();
await page.locator('[data-station="radio-forever-anime"]').click();
assert.equal(await page.locator('audio').getAttribute('src'),'https://app.sonicpanelradio.com:8088/stream');
await page.locator('[data-station="iheart-katseye"]').click();
const frame=page.locator('.colt-radio-player iframe');
assert(await frame.isVisible());assert((await frame.getAttribute('src')).includes('katseye-43402886'));
assert.equal(await frame.evaluate(el=>el.getBoundingClientRect().height),300);
await page.getByRole('button',{name:'Stop Colt Radio',exact:true}).click();
assert.equal(await page.locator('.colt-radio-player iframe').getAttribute('src'),null);
console.log('Calendar dates fit at desktop/mobile widths; Radiofa selection and KATSEYE embed selection/stop passed. Provider playback is not mocked as verified.');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
