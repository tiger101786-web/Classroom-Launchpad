const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require('playwright');
(async () => {
  const root = path.resolve(__dirname, '..');
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'scene-frame-fit-'));
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    await page.route('https://launchpad.test/**', route => {
      const relative = new URL(route.request().url()).pathname.slice(1);
      const file = path.join(root, relative);
      if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
      return route.fulfill({ body: fs.readFileSync(file), contentType: relative.endsWith('.png') ? 'image/png' : 'text/plain' });
    });
    await page.goto('https://launchpad.test/index.html');
    await page.setContent('<html><head></head><body data-theme="night"></body></html>');
    for (const file of ['styles.css', 'launchpad-scenes.css', 'scene-frame-fit.css']) await page.addStyleTag({ content: fs.readFileSync(path.join(root, file), 'utf8') });
    await page.addScriptTag({ content: fs.readFileSync(path.join(root, 'launchpad-scenes.js'), 'utf8') });
    await page.addStyleTag({ content: 'body {display:grid;grid-template-columns:repeat(4,1fr);gap:22px;padding:28px;background:#271c24} .sample {text-align:center;color:white} .home-scene-feature {position:static;transform:none;display:flex;align-items:center} .school-photo {width:280px;height:280px} h2{font-size:16px} .launch-scene-settings {opacity:1;pointer-events:auto}' });
    const ids = ['blossom', 'guardian', 'woodland', 'orbit', 'treasure', 'royal', 'phoenix', 'butterfly', 'frost-dragon', 'clockwork', 'library', 'champion', 'halloween', 'new-orleans', 'sunflower', 'peacock', 'harvest', 'evergreen'];
    await page.evaluate(ids => {
      document.body.innerHTML = ids.map(frame => `<div class="sample"><h2>${frame}</h2>${window.LaunchpadScenes.render({ authenticated:true, homeScene:{ id:'cafe',motion:false,frame } }, '')}</div>`).join('');
    }, ids);
    await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    for (const size of [280, 210, 84]) {
      await page.addStyleTag({ content: `.school-photo {width:${size}px;height:${size}px}` });
      const fitted = await page.locator('.launch-scene').evaluateAll(scenes => scenes.map(scene => {
        const style = getComputedStyle(scene);
        return { clip:style.clipPath.startsWith('polygon('),border:style.borderTopWidth,shadow:style.boxShadow };
      }));
      assert.equal(fitted.length, 18);
      fitted.forEach(fit => assert.deepEqual(fit,{clip:true,border:'0px',shadow:'none'}));
      await page.screenshot({ path:path.join(output, `frames-${size}.png`),fullPage:true });
    }
    console.log(JSON.stringify({ allDecorativeOpeningsClipped:true, sizes:[280,210,84], output }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
