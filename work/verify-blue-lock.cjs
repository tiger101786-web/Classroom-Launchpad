const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const shelf = require('../collectible-shelf');
const root = path.resolve(__dirname, '..');
const ids = shelf.items.filter(i=>i.id.startsWith('blue-lock-')).map(i=>i.id);
assert.equal(ids.length,7);
assert(!shelf.items.some(i=>i.id==='blue-lock-kunigami'));
assert.equal(new Set(shelf.items.map(i => i.id)).size, shelf.items.length);
for (const id of ids) assert.equal(shelf.items.find(i => i.id === id)?.category, 'Anime');
(async () => {
  const browser = await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless:true});
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('requestfailed', r => errors.push(r.url()));
    await page.route('https://shelf-test.local/**', r => {
      const p = new URL(r.request().url()).pathname;
      return p === '/' ? r.fulfill({contentType:'text/html', body:'<html><body data-theme="night"><main id="gallery"></main></body></html>'}) : r.fulfill({path:path.join(root,p.slice(1))});
    });
    await page.goto('https://shelf-test.local/');
    for (const file of ['styles.css','launchpad-scenes.css','collectible-shelf.css']) await page.addStyleTag({content:fs.readFileSync(path.join(root,file),'utf8')});
    await page.addScriptTag({content:fs.readFileSync(path.join(root,'collectible-shelf.js'),'utf8')});
    for (const width of [1200,390]) {
      await page.setViewportSize({width,height:950});
      for (const id of ids) {
        const selection = {enabled:true,theme:'crimson',slots:[id,'blue-lock-bachira','blue-lock-nagi']};
        assert(shelf.valid(selection));
        await page.evaluate(s => CollectibleShelf.open({selected:s,save:async v => {window.savedShelf=v;}}),selection);
        await page.locator('#shelfCategory').selectOption('Anime');
        await page.locator('#shelfSearch').fill(shelf.items.find(i => i.id === id).name);
        const card = page.locator(`[data-shelf-item="${id}"]`);
        await card.click();
        await page.waitForFunction(() => [...document.querySelectorAll('#shelfChoices img, #shelfPreview img')].every(i => i.complete && i.naturalWidth > 0));
        assert(await card.isVisible());
        assert(await card.evaluate(el=>{const c=el.getBoundingClientRect(),a=el.querySelector('.shelf-object > div').getBoundingClientRect();return a.left>=c.left&&a.right<=c.right&&a.top>=c.top&&a.bottom<=c.bottom;}),'complete artwork fits in the card');
        if (id === ids[0]) await page.screenshot({path:path.join(__dirname,`blue-lock-statues-${width}.png`),fullPage:true});
        await page.locator('#saveShelf').click();
        assert.equal((await page.evaluate(() => window.savedShelf)).slots[0],id);
      }
    }
    assert.deepEqual(errors,[]);
    console.log('PASS: all seven Blue Lock statues load, appear in Anime, select and save at desktop and mobile widths; only the retained Kunigami pose is listed.');
  } finally {await browser.close();}
})().catch(e => {console.error(e);process.exitCode=1;});
