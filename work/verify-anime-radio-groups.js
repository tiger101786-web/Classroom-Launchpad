const fs = require('fs'), vm = require('vm'), assert = require('assert/strict');
const { chromium } = require('playwright');
const source = fs.readFileSync('colt-radio.js', 'utf8');
const catalog = vm.runInNewContext(source.slice(source.indexOf('  const stations ='), source.indexOf('  const preferredStationKey')) + ';({stations,stationFamilyOrder})');
const {stations,stationFamilyOrder} = catalog;
assert.equal(new Set(stations.map(s=>s.id)).size,stations.length);
for(const station of stations) assert(stationFamilyOrder.includes(station.label.split(' • ')[0]),station.label+' needs a sorting category');
assert(!stations.some(s=>s.id==='radio-forever-anime'));
const familyIndex = family => stationFamilyOrder.indexOf(family);
assert.equal(familyIndex('Anime'),familyIndex('Disney')+1);
assert.equal(familyIndex('Latin'),familyIndex('Spanish')+1);
assert.equal(familyIndex('Ocean Waves'),familyIndex('Calm')+1);
assert.equal(familyIndex('Afrobeats'),familyIndex('Persian')+1);
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try {
  const page=await browser.newPage();
  await page.route('**/*',route=>route.request().url()==='https://test.local/'?route.fulfill({body:'<div id="coltRadioRoot"></div>',contentType:'text/html'}):route.abort());
  await page.goto('https://test.local/');
  await page.addStyleTag({content:fs.readFileSync('styles.css','utf8')});
  await page.addScriptTag({content:source});
  await page.locator('.colt-radio-launcher').click();
  const actual=await page.locator('[data-station-item]').evaluateAll(items=>items.map(i=>i.dataset.stationItem));
  assert.deepEqual(actual,Array.from(stations,s=>s.id));
  for(const width of [390,1280]) {
   await page.setViewportSize({width,height:850});
   for(const id of ['anison-fm','listen-moe-anime','fantasy-adventure']) {
    await page.locator('.colt-radio-search-input').fill(id==='fantasy-adventure'?'Fantasy':'Anime');
    const button=page.locator('[data-station="'+id+'"]');
    assert(await button.isVisible());
    assert(await button.locator('.colt-radio-station-style').evaluate(e=>e.scrollWidth<=e.clientWidth),JSON.stringify(await button.locator('.colt-radio-station-style').evaluate(e=>({width:e.clientWidth,scroll:e.scrollWidth,font:getComputedStyle(e).fontSize,station:e.textContent}))));
    if(id!=='listen-moe-anime') assert(await button.locator('.colt-radio-station-style').evaluate(e=>e.getBoundingClientRect().height<=parseFloat(getComputedStyle(e).lineHeight)+1),id+' must stay on one line');
    await button.click();
    assert.equal(await page.locator('audio').getAttribute('src'),stations.find(s=>s.id===id).source);
   }
  }
  assert.equal(await page.locator('[data-station="radio-forever-anime"]').count(),0);
  console.log('PASS: all categories ranked, grouping/order correct, anime choices and sources work at desktop/mobile sizes.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
