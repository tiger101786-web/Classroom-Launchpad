const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const root = path.resolve(__dirname, '..');
const output = process.env.PREVIEW_OUTPUT || fs.mkdtempSync(path.join(os.tmpdir(), 'approved-radio-'));
const reference = process.env.RADIO_REFERENCE_DIR;
const genres = ['country', 'metal', 'jazz', 'djclub', 'reggae', 'disco', 'punk'];
const fullHeaders = ['bayou', 'hiphop', 'cyberpunk', ...genres];
const skins = ['inferno', 'frostfang', 'temple', 'nebula', 'bayou', 'hiphop', 'cyberpunk', ...genres];
(async () => {
 const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
 try {
  const context = await browser.newContext({ viewport: { width: 1000, height: 1000 }, deviceScaleFactor: 2 });
  await context.addInitScript(() => {
   window.mediaCalls = [];
   HTMLMediaElement.prototype.play = function () { mediaCalls.push('play'); this.dispatchEvent(new Event('playing')); return Promise.resolve(); };
   HTMLMediaElement.prototype.pause = function () { mediaCalls.push('pause'); this.dispatchEvent(new Event('pause')); };
   HTMLMediaElement.prototype.load = function () { mediaCalls.push('load'); };
  });
  await context.route('**/*', route => {
   const u = new URL(route.request().url());
   if (u.hostname !== 'radio.test') return route.abort();
   if (u.pathname === '/') return route.fulfill({ contentType: 'text/html', body: '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/styles.css"><div id="coltRadioRoot" class="colt-radio-root"></div><script src="/colt-radio.js"></script>' });
   const file = path.join(root, decodeURIComponent(u.pathname));
   if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return route.fulfill({ status: 404, body: '' });
   return route.fulfill({ body: fs.readFileSync(file), contentType: file.endsWith('.html') ? 'text/html' : file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.png') ? 'image/png' : file.endsWith('.jpg') ? 'image/jpeg' : 'application/octet-stream' });
  });
  const page = await context.newPage(), errors = [], artRequests = [];
  context.on('page', p => p.on('pageerror', e => errors.push(e.message)));
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (r.url().includes('/illustrated/')) artRequests.push(r.url()); });
  await page.goto('http://radio.test/');
  assert.equal(artRequests.length, 0);
  assert.equal(await page.locator('script[src^="radio-skins.js"]').count(), 0);
  await page.getByRole('button', { name: 'Open Colt Radio', exact: true }).click();
  const panel = page.locator('.colt-radio-panel'), gear = page.getByRole('button', { name: 'Change Colt Radio skin', exact: true });
  await gear.waitFor();
  assert.equal(await panel.locator('[data-radio-skin-choice]').count(), 15, 'Fourteen illustrated skins and Original');
  assert.equal(artRequests.length, 0, 'Original loads no themed artwork');
  const choose = async (skin, target = page) => {
   await target.getByRole('button', { name: 'Change Colt Radio skin', exact: true }).click();
   await target.locator('[data-radio-skin-choice=' + skin + ']').click();
   if (skin !== 'original') await target.evaluate(async id => {
    await Promise.race([Promise.all((['country','metal','jazz','djclub','reggae','disco','punk'].includes(id) ? ['atlas'] : ['atlas', ['bayou','hiphop','cyberpunk'].includes(id) ? 'header' : 'header-v2']).map(suffix => new Promise((resolve, reject) => { const img = new Image(); img.onload = () => img.naturalWidth > 0 ? resolve() : reject(new Error('Empty artwork')); img.onerror = () => reject(new Error('Failed artwork: ' + img.src)); img.src = new URL('assets/radio-skins/illustrated/' + id + '-' + suffix + '.png', document.baseURI).href; }))), new Promise((_, reject) => setTimeout(() => reject(new Error('Artwork timeout: ' + id + ' at ' + document.baseURI)), 10000))]);
   }, skin);
  };
  await panel.locator('[data-station="chill-house"]').click();
  await panel.locator('[data-favorite-station="chill-house"]').click();
  await page.evaluate(async () => { await Promise.all([...document.querySelectorAll('.colt-radio-panel img')].map(i => i.decode().catch(() => {}))); });
  const geometry = () => panel.evaluate(p => [p, ...p.querySelectorAll('.colt-radio-header,.colt-radio-filters,.colt-radio-search,.colt-radio-stations,.colt-radio-player,.colt-radio-station')].map(e => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }));
  const originalGeometry = await geometry();
  for (const skin of skins) {
   await choose(skin);
   if (genres.includes(skin)) {
    const art = await panel.evaluate(panel => ({
     portraits:[...panel.querySelectorAll('.colt-radio-heading-mark,.colt-radio-stream-artwork')].map(e => getComputedStyle(e).backgroundImage),
     sides:getComputedStyle(panel.querySelector('.colt-radio-skin-backdrop span')).backgroundImage
    }));
    assert(art.portraits.every(url => url.includes(skin+'-atlas')), 'Both portraits use the selected genre Colt');
    assert(art.sides.includes(skin+'-atlas'), 'Decorated side artwork uses the actual atlas');
    const portrait=await panel.locator('.colt-radio-heading-mark').boundingBox();
    assert(portrait.width>=80 && portrait.height>=88, 'Full size desktop header portrait');
   }
   if (skin === 'cyberpunk') {
    await page.evaluate(() => document.fonts.load('800 24px ColtRadioCyber'));
    await panel.locator('.colt-radio-header').screenshot({path:path.join(output,'cyberpunk-header-live.png')});
    const art = await panel.evaluate(panel => ({
      backdrop:getComputedStyle(panel.querySelector('.colt-radio-skin-backdrop')).backgroundImage,
      portraits:[...panel.querySelectorAll('.colt-radio-heading-mark,.colt-radio-stream-artwork')].map(element=>getComputedStyle(element).backgroundImage),
      labels:[...panel.querySelectorAll('.colt-radio-station-name')].every(element=>element.scrollWidth<=element.clientWidth+1)
    }));
    assert.match(art.backdrop,/cyberpunk-frame/,'Cyberpunk has real illustrated side panels');
    assert(art.portraits.every(url=>url.includes('cyberpunk-atlas')),'Both portraits use Cyber Colt');
    assert(art.labels,'Station labels fit holographic controls');
   }
   if (skin === 'hiphop') {
    const art = await panel.evaluate(panel => {
     const sides = panel.querySelector('.colt-radio-skin-backdrop');
     return {
      visible:getComputedStyle(sides).display,
      left:getComputedStyle(sides,'::before').backgroundImage,
      right:getComputedStyle(sides,'::after').backgroundImage,
      tile:getComputedStyle(panel.querySelector('.colt-radio-station')).backgroundImage
     };
    });
    assert.notEqual(art.visible,'none','Illustrated DJ sides are displayed');
    assert.match(art.left,/hiphop-atlas/);
    assert.match(art.right,/hiphop-atlas/);
    assert.match(art.tile,/hiphop-crate/);
   }
   if (fullHeaders.includes(skin)) {
    const current = await geometry();
    for (let i = 2; i < current.length; i++) assert.deepEqual(current[i].slice(2), originalGeometry[i].slice(2), skin + ': preserves control dimensions');
    assert(Math.abs(current[1][2] / current[1][3] - 3) < .03, skin + ': full 3:1 header');
   } else assert.deepEqual(await geometry(), originalGeometry, skin + ': control geometry');
   await page.locator('body').click({ position: { x: 950, y: 10 } });
   const capture = await panel.screenshot({ path: path.join(output, skin + '.png') });
   if (reference && skin !== "cyberpunk" && !genres.includes(skin)) {
    const old = await loadImage(path.join(reference, (skin === 'inferno' ? 'inferno-forge' : skin === 'bayou' ? 'bayou-nights' : skin) + '.png'));
    const current = await loadImage(capture);
    assert.equal(current.width, old.width); assert.equal(current.height, old.height);
    const canvas = createCanvas(old.width, old.height), ctx = canvas.getContext('2d');
    ctx.drawImage(old, 0, 0); const a = ctx.getImageData(0, 0, old.width, old.height).data;
    ctx.clearRect(0, 0, old.width, old.height); ctx.drawImage(current, 0, 0); const b = ctx.getImageData(0, 0, old.width, old.height).data;
    const filters = await panel.locator('.colt-radio-filters').boundingBox();
    const panelBounds = await panel.boundingBox();
    const filterTop = Math.floor((filters.y - panelBounds.y) * 2), filterBottom = Math.ceil((filters.y + filters.height - panelBounds.y) * 2);
    let changed = 0, compared = 0;
    for (let y = 0; y < old.height; y++) for (let x = 0; x < old.width; x++) {
     // The user requested the new gear beside Favorites; that row intentionally changes.
     if (y >= filterTop && y <= filterBottom) continue;
     const i = (y * old.width + x) * 4;
     if (Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i+1] - b[i+1]), Math.abs(a[i+2] - b[i+2])) > 8) changed++;
     compared++;
    }
    console.log(skin + ' reference difference: ' + (100 * changed / compared).toFixed(4) + '%');
    assert(changed / compared < .002, skin + ': matches approved preview except gear');
   }
   await gear.click(); await gear.click();
   assert.equal(await page.locator('.colt-radio-skin-menu').evaluate(m => m.matches(':popover-open')), false, 'Second gear click closes menu');
   assert(await panel.isVisible(), 'Second click keeps player open');
  }
  console.log('Checking audio continuity');
  await panel.locator('.colt-radio-play').click();
  await panel.locator('.colt-radio-volume-slider').evaluate(e => { e.value = '43'; e.dispatchEvent(new Event('input', { bubbles: true })); });
  const audioState = await page.evaluate(() => { window.originalAudio = document.querySelector('audio'); return { src: originalAudio.src, calls: mediaCalls.length, volume: originalAudio.volume }; });
  for (const skin of ['original', ...skins]) await choose(skin);
  const after = await page.evaluate(() => ({ src: originalAudio.src, calls: mediaCalls.length, volume: originalAudio.volume, same: originalAudio === document.querySelector('audio') }));
  assert(after.same); delete after.same; assert.deepEqual(after, audioState, 'Skins do not restart or replace audio');
  assert.equal(await panel.locator('[data-favorite-station="chill-house"]').getAttribute('aria-pressed'), 'true');
  for (const [width, height] of [[390, 844], [320, 700], [390, 300]]) {
   console.log('Checking viewport ' + width + 'x' + height);
   await page.setViewportSize({ width, height });
   for (const skin of skins) {
    await choose(skin); await gear.click();
    await page.waitForFunction(() => document.querySelector('.colt-radio-skin-menu').style.opacity === '1');
    const r = await page.locator('.colt-radio-skin-menu').boundingBox();
    assert(r.x >= 0 && r.y >= 0 && r.x + r.width <= width + 1 && r.y + r.height <= height + 1);
    const anchor = await gear.boundingBox();
    assert(r.y + r.height <= anchor.y || r.y >= anchor.y + anchor.height, 'Open skin menu leaves gear clickable');
    await page.keyboard.press('Escape');
    assert(await panel.isVisible());
    if (fullHeaders.includes(skin)) {
     const header = await panel.locator('.colt-radio-header').boundingBox();
     const backdrop = await panel.locator('.colt-radio-skin-backdrop').boundingBox();
     assert(Math.abs(header.width / header.height - 3) < .03, 'Uncropped mobile header');
     if (genres.includes(skin)) {
      const portrait=await panel.locator('.colt-radio-heading-mark').boundingBox();
      assert(portrait.width>=68 && portrait.height>=76, 'Mobile portrait stays large');
      assert(portrait.y>=header.y && portrait.y+portrait.height<=header.y+header.height, 'Header contains the full portrait window');
     }
     if (['bayou','cyberpunk',...genres].includes(skin)) assert(Math.abs(backdrop.y - header.y - header.height) < 1, 'No gap below header');
     if (height > 500) await panel.screenshot({path:path.join(output,skin+'-'+width+'.png')});
    }
   }
  }
  console.log('Checking real close and minimize controls on short screens');
  for (const [width,height] of [[1366,768],[1000,1000],[390,700],[390,300]]) {
   await page.setViewportSize({width,height});
   for (const skin of ['cyberpunk',...genres]) {
    await choose(skin);
    await panel.getByRole('button',{name:'Stop Colt Radio',exact:true}).click();
    assert(!(await panel.isVisible()),'X hides '+skin+' at '+width+'x'+height);
    assert(await page.getByRole('button',{name:'Open Colt Radio',exact:true}).isVisible());
    await page.getByRole('button',{name:'Open Colt Radio',exact:true}).click();
    await panel.getByRole('button',{name:'Minimize Colt Radio',exact:true}).click();
    assert(!(await panel.isVisible()),'Minimize hides '+skin+' at '+width+'x'+height);
    await page.getByRole('button',{name:'Open Colt Radio',exact:true}).click();
   }
  }
  console.log('Checking persistence and keyboard');
  await page.setViewportSize({ width: 1000, height: 1000 });
  await page.reload(); await page.getByRole('button', { name: 'Open Colt Radio', exact: true }).click(); await gear.waitFor();
  assert.equal(await panel.getAttribute('data-radio-skin'), 'punk', 'Saved skin restored');
  await gear.click(); await page.keyboard.press('Home'); await page.keyboard.press('Enter');
  assert.equal(await panel.getAttribute('data-radio-skin'), null, 'Keyboard can return to Original');
  await page.evaluate(() => Object.defineProperty(window, 'documentPictureInPicture', { value: undefined, configurable: true }));
  console.log('Checking pop-out');
  const popup = context.waitForEvent('page');
  await panel.getByRole('button', { name: 'Pop out Colt Radio', exact: true }).click();
  const floating = await popup;
  await floating.bringToFront();
  for (const skin of ['cyberpunk',...genres]) {
   await choose(skin, floating);
   await floating.screenshot({path:path.join(output,'floating-'+skin+'.png')});
  }
  await floating.getByRole('button', { name: 'Return Colt Radio to Launchpad', exact: true }).click();
  assert.equal(await panel.getAttribute('data-radio-skin'), 'punk');
  await gear.click(); await gear.click();
  assert.deepEqual(errors, []);
  console.log('PASS: approved appearance, full illustrated headers including Cyberpunk, lazy loading, original reset, fifteen choices, keyboard, gear toggle, viewport fit, persistence, audio continuity, favorites and pop-out. Screenshots: ' + output);
 } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
