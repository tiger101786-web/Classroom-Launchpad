const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const shelf = require('../collectible-shelf');
const root = path.resolve(__dirname, '..');
const ids = ['dog-corgi-statue','dog-shiba-inu-bust','dog-beagle-bust','dog-boxer-bust','superhero-falcon-statue'];
assert.equal(new Set(shelf.items.map(i => i.id)).size, shelf.items.length);
(async () => {
  const browser = await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror',e => errors.push(e.message));
    page.on('requestfailed',r => errors.push(r.url()));
    await page.route('https://shelf-test.local/**',r => {
      const p = new URL(r.request().url()).pathname;
      return p === '/' ? r.fulfill({contentType:'text/html',body:'<html><body data-theme="night"><main id="gallery" style="width:650px;margin:260px auto 0"></main></body></html>'}) : r.fulfill({path:path.join(root,p.slice(1))});
    });
    await page.goto('https://shelf-test.local/');
    for (const f of ['styles.css','launchpad-scenes.css','collectible-shelf.css']) await page.addStyleTag({content:fs.readFileSync(path.join(root,f),'utf8')});
    await page.addScriptTag({content:fs.readFileSync(path.join(root,'collectible-shelf.js'),'utf8')});
    for (const width of [1200,390]) {
      await page.setViewportSize({width,height:950});
      for (const id of ids) {
        const item = shelf.items.find(i => i.id === id);
        assert.equal(item.category,id.startsWith('dog-') ? 'Dogs' : 'Superheroes');
        const selection = {enabled:true,theme:'crimson',slots:[id,'superhero-iron-man-bust','superhero-captain-america-bust']};
        assert(shelf.valid(selection));
        await page.evaluate(s => CollectibleShelf.open({selected:s,save:async v => {window.savedShelf=v;}}),selection);
        await page.locator('#shelfCategory').selectOption(item.category);
        await page.locator('#shelfSearch').fill(item.name);
        const card = page.locator(`[data-shelf-item="${id}"]`);
        await card.click();
        await page.waitForFunction(() => [...document.querySelectorAll('#shelfChoices img, #shelfPreview img')].every(i => i.complete && i.naturalWidth));
        const fits = await card.evaluate(el => {
          const c=el.getBoundingClientRect(), a=el.querySelector('.shelf-object > div').getBoundingClientRect();
          return a.left>=c.left && a.right<=c.right && a.top>=c.top && a.bottom<=c.bottom;
        });
        assert(fits,`${id} thumbnail fits at ${width}`);
        if (id.includes('falcon')) await page.screenshot({path:path.join(__dirname,`falcon-picker-${width}.png`)});
        await page.locator('#saveShelf').click();
        assert.equal((await page.evaluate(() => window.savedShelf)).slots[0],id);
      }
    }
    await page.setViewportSize({width:1200,height:950});
    for (let slot=0;slot<3;slot++) {
      const slots=['superhero-iron-man-bust','superhero-captain-america-bust'];
      slots.splice(slot,0,'superhero-falcon-statue');
      await page.evaluate(slots => document.querySelector('#gallery').innerHTML=CollectibleShelf.art({enabled:true,theme:'crimson',slots}),slots);
      await page.waitForFunction(() => [...document.querySelectorAll('#gallery img')].every(i=>i.complete&&i.naturalWidth));
      const layers = await page.locator('#gallery .shelf-objects > *').evaluateAll(els => els.map(el => Number(getComputedStyle(el).zIndex)));
      assert.equal(layers[slot],1);
      assert(layers.every((layer,i) => i===slot || layer>layers[slot]),'Falcon stays behind both neighboring heroes');
      await page.screenshot({path:path.join(__dirname,`falcon-shelf-slot-${slot}.png`)});
    }
    assert.deepEqual(errors,[]);
    console.log('PASS: four dogs and Falcon categorized, images loaded, thumbnails contained, selection saved at desktop/mobile widths; all three Falcon shelf slots rendered.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
