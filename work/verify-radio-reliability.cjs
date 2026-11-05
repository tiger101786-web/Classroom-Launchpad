const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const assetRoot = process.env.RADIO_ASSET_ROOT || root;
const definitions = require('../radio-skin-definitions.js');
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.RADIO_BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  try {
    const context = await browser.newContext({ viewport: { width: 1000, height: 900 } });
    await context.addInitScript(() => {
      HTMLMediaElement.prototype.load = function () {};
      HTMLMediaElement.prototype.play = function () { this.dispatchEvent(new Event('playing')); return Promise.resolve(); };
      HTMLMediaElement.prototype.pause = function () { this.dispatchEvent(new Event('pause')); };
    });
    const requests = [], errors = [];
    let stored = [], getFailure = false, putFailure = false, failNextNetwork = false;
    let holdGet = null, holdPut = null, inFlight = 0, maxInFlight = 0;
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.hostname !== 'radio.test') return route.abort();
      if (url.pathname === '/api/radio-favorites') {
        const method = route.request().method();
        if (method === 'GET') {
          const snapshot = [...stored], failure = getFailure;
          if (holdGet) { const release = holdGet; holdGet = null; await release; }
          return route.fulfill({ status: failure ? 503 : 200, json: { favorites: snapshot } }).catch(() => {});
        }
        const body = route.request().postDataJSON();
        requests.push(body.favorites);
        inFlight++; maxInFlight = Math.max(maxInFlight, inFlight);
        const failure = putFailure, networkFailure = failNextNetwork;
        failNextNetwork = false;
        if (holdPut) { const release = holdPut; holdPut = null; await release; }
        inFlight--;
        if (networkFailure) return route.abort('failed');
        if (!failure) stored = [...body.favorites];
        return route.fulfill({ status: failure ? 503 : 200, json: { ok: !failure } }).catch(() => {});
      }
      if (url.pathname === '/') return route.fulfill({ contentType: 'text/html', body: '<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="/styles.css"><div id="coltRadioRoot" class="colt-radio-root"></div><script src="/colt-radio.js"></script>' });
      const file = path.join(url.pathname.startsWith('/assets/') ? assetRoot : root, decodeURIComponent(url.pathname));
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return route.fulfill({ status: 404, body: '' });
      return route.fulfill({ body: fs.readFileSync(file), contentType: file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.html') ? 'text/html' : file.endsWith('.png') ? 'image/png' : 'application/octet-stream' });
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://radio.test/');
    await page.getByRole('button', { name: 'Open Colt Radio', exact: true }).click();
    await page.getByRole('button', { name: 'Change Colt Radio skin', exact: true }).waitFor();
    const star = id => page.locator('[data-favorite-station="' + id + '"]');
    const status = page.locator('.colt-radio-favorites-status');
    const dispatchAccount = auth => page.evaluate(auth => window.dispatchEvent(new CustomEvent('classroom-launchpad-rendered', { detail: { screen: 'home', auth } })), auth);
    const student = email => ({ authenticated: true, role: 'student', email });
    const waitStatus = text => page.waitForFunction(text => document.querySelector('.colt-radio-favorites-status').textContent.includes(text), text);
    const waitSaved = () => page.waitForFunction(() => document.querySelector('.colt-radio-favorites-status').hidden);
    const waitRequests = count => assert.equal(requests.length, count);

    // Guest favorites remain local and survive reload.
    await star('studying').click();
    assert.equal(requests.length, 0);
    await page.reload();
    await page.getByRole('button', { name: 'Open Colt Radio', exact: true }).click();
    assert.equal(await star('studying').getAttribute('aria-pressed'), 'true');

    // Clear previous choices immediately and disable editing until account GET finishes.
    let releaseGet;
    holdGet = new Promise(resolve => { releaseGet = resolve; });
    await dispatchAccount(student('first@example.test'));
    await waitStatus('Loading');
    assert(await star('studying').isDisabled());
    assert.equal(await star('studying').getAttribute('aria-pressed'), 'false');
    releaseGet();
    await waitSaved();

    // HTTP errors are visible; retry preserves and saves the latest optimistic choices.
    putFailure = true;
    await star('studying').click();
    await waitStatus('not been saved');
    assert.equal(await star('studying').getAttribute('aria-pressed'), 'true');
    putFailure = false;
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await waitSaved();
    assert.deepEqual(stored, ['studying']);

    // Only one write may run at once, and its successor contains all newer edits.
    let releasePut;
    holdPut = new Promise(resolve => { releasePut = resolve; });
    const before = requests.length;
    await star('working').click();
    await page.waitForFunction(() => document.querySelector('.colt-radio-favorites-status').textContent.includes('Saving'));
    await star('chilling').click();
    await star('sleeping').click();
    assert.equal(requests.length, before + 1);
    releasePut();
    await waitSaved();
    assert.equal(maxInFlight, 1);
    assert.deepEqual([...stored].sort(), ['studying', 'working', 'chilling', 'sleeping'].sort());
    assert.equal(requests.length, before + 2);

    // Network errors also offer retry.
    failNextNetwork = true;
    await star('gaming').click();
    await waitStatus('not been saved');
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await waitSaved();
    assert(stored.includes('gaming'));

    // Load errors disable edits and retry the read rather than overwrite server data.
    getFailure = true;
    await dispatchAccount(student('second@example.test'));
    await waitStatus('Could not load');
    assert(await star('studying').isDisabled());
    stored = ['working']; getFailure = false;
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await waitSaved();
    assert.equal(await star('working').getAttribute('aria-pressed'), 'true');
    assert.equal(await star('studying').getAttribute('aria-pressed'), 'false');

    // An old save must not display errors or dispatch queued edits after account change.
    holdPut = new Promise(resolve => { releasePut = resolve; });
    putFailure = true;
    const beforeSwitch = requests.length;
    await star('studying').click();
    await waitStatus('Saving');
    await star('chilling').click();
    await dispatchAccount({ authenticated: false });
    releasePut();
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 50)));
    assert.equal(requests.length, beforeSwitch + 1, 'Old-account queued edits are discarded');
    assert(await status.isHidden(), 'Old-account failure does not replace current status');
    assert.equal(await star('working').getAttribute('aria-pressed'), 'false');
    putFailure = false;

    // Delayed responses from an earlier account cannot replace the current account.
    holdGet = new Promise(resolve => { releaseGet = resolve; });
    await dispatchAccount(student('third@example.test'));
    await waitStatus('Loading');
    await dispatchAccount({ authenticated: false });
    assert.equal(await star('studying').getAttribute('aria-pressed'), 'true');
    releaseGet();
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 50)));
    assert.equal(await star('working').getAttribute('aria-pressed'), 'false');
    assert(await status.isHidden());

    // Actual playback state controls the launcher, never station selection alone.
    await page.locator('[data-station="studying"]').click();
    const checkLauncher = async (text, playing) => {
      assert.equal(await page.locator('.colt-radio-launcher-label').textContent(), text);
      assert.equal(await page.locator('.colt-radio-launcher').evaluate(el => el.classList.contains('is-playing')), playing);
    };
    await checkLauncher('Colt Radio • Paused', false);
    await page.locator('.colt-radio-play').click();
    await checkLauncher('Colt Radio • Playing', true);
    await page.locator('.colt-radio-play').click();
    await checkLauncher('Colt Radio • Paused', false);
    await page.evaluate(() => { HTMLMediaElement.prototype.play = function () { return new Promise(() => {}); }; });
    await page.locator('.colt-radio-play').click();
    await checkLauncher('Colt Radio • Connecting', false);
    await page.evaluate(() => document.querySelector('audio').dispatchEvent(new Event('waiting')));
    await checkLauncher('Colt Radio • Buffering', false);
    await page.evaluate(() => { const a = document.querySelector('audio'); a.dispatchEvent(new Event('error')); a.dispatchEvent(new Event('error')); });
    await checkLauncher('Colt Radio • Unavailable', false);
    await page.getByRole('button', { name: 'Stop Colt Radio', exact: true }).click();
    await checkLauncher('Colt Radio', false);

    assert.equal(new Set(definitions.map(skin => skin.id)).size, definitions.length);
    for (const skin of definitions) for (const asset of skin.assets) assert(fs.existsSync(path.join(assetRoot, asset)), 'Registered art exists: ' + asset);
    assert.deepEqual(errors, []);
    console.log('PASS: guest persistence; HTTP/network save failures and retry; serialized/coalesced writes; account loading, load retry and stale responses; playback launcher states; registered artwork.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
