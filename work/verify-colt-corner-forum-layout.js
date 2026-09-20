"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { chromium } = require("playwright");

function availablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });
}

async function waitForServer(baseUrl) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Forum layout test server did not start.");
}

async function run() {
  const root = path.resolve(__dirname, "..");
  const port = await availablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "colt-corner-forum-layout-"));
  const avatarFixture = path.join(dataDir, "avatar.png");
  fs.writeFileSync(avatarFixture, Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAG0lEQVR4nO3BAQ0AAADCoPdPbQ43oAAAAAAAAAB4G0AABc4oOwAAAABJRU5ErkJggg==",
    "base64"
  ));
  fs.writeFileSync(path.join(dataDir, "classroom-launchpad-db.json"), JSON.stringify({ threads: [] }));
  const child = spawn(process.execPath, [path.join(root, "server.js")], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      DATA_DIR: dataDir,
      SESSION_SECRET: "forum-layout-test-session-secret-that-is-long",
      TEACHER_PIN: "123456",
      NODE_ENV: "test"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  async function request(route, { method = "GET", body, cookie = "" } = {}) {
    const response = await fetch(`${baseUrl}${route}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
        ...(!["GET", "HEAD"].includes(method) ? { Origin: baseUrl } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const payload = await response.json();
    return {
      status: response.status,
      payload,
      cookie: (response.headers.get("set-cookie") || "").split(";")[0]
    };
  }

  let browser;
  try {
    await waitForServer(baseUrl);
    let response = await request("/api/auth/teacher", { method: "POST", body: { pin: "123456" } });
    const teacherCookie = response.cookie;
    response = await request("/api/approved-students/import", {
      method: "PUT",
      cookie: teacherCookie,
      body: { students: [{ email: "forum.student@scscolts.org", name: "Forum Student", grade: "6" }] }
    });
    const activationCode = response.payload.activationCodes[0].activationCode;
    response = await request("/api/auth/register", {
      method: "POST",
      body: {
        email: "forum.student@scscolts.org",
        password: "GooglePass123",
        activationCode,
        name: "Forum Student",
        grade: "6"
      }
    });
    const studentCookie = response.cookie;
    response = await request("/api/threads", {
      method: "POST",
      cookie: studentCookie,
      body: { title: "Forum layout test", message: "This first post checks the new two-column discussion layout." }
    });
    assert.equal(response.status, 200);
    response = await request("/api/threads", {
      method: "POST",
      cookie: teacherCookie,
      body: {
        title: "Teacher profile test",
        message: "This topic verifies the teacher profile picture controls.",
        grades: ["4"]
      }
    });
    assert.equal(response.status, 200);

    browser = await chromium.launch({
      headless: true,
      executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
    });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const [cookieName, cookieValue] = studentCookie.split("=");
    await context.addCookies([{ name: cookieName, value: cookieValue, url: baseUrl }]);
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    // Homepage scene choices are personal, persistent, and previewed before saving.
    assert.equal(await page.locator('#chooseLaunchScene').isVisible(), false);
    await page.locator('.launch-scene-stage').hover();
    await page.getByRole('button', { name: 'Scene settings', exact: true }).click();
    assert.equal(await page.locator('#chooseLaunchScene').isVisible(), true);
    assert.equal(await page.locator('#chooseLaunchScene').textContent(), 'Choose scene');
    assert.equal(await page.locator('#chooseLaunchFrame').textContent(), 'Choose frame');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#chooseLaunchScene').isVisible(), false);
    await page.getByRole('button', { name: 'Scene settings', exact: true }).click();
    await page.locator('h1').click();
    assert.equal(await page.locator('#chooseLaunchScene').isVisible(), false);
    async function openSceneSettings() {
      await page.locator('#launchSceneSettings').focus();
      await page.keyboard.press('Enter');
    }
    const touchContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await touchContext.addCookies([{ name: cookieName, value: cookieValue, url: baseUrl }]);
    const touchPage = await touchContext.newPage();
    await touchPage.goto(baseUrl, { waitUntil: 'networkidle' });
    await touchPage.locator('#launchSceneSettings').waitFor();
    assert.equal(await touchPage.locator('#launchSceneSettings').evaluate(button => getComputedStyle(button).opacity), '1');
    await touchPage.locator('#launchSceneSettings').tap();
    assert.equal(await touchPage.locator('#chooseLaunchScene').isVisible(), true);
    const menuBounds = await touchPage.locator('#launchSceneMenu').boundingBox();
    assert(menuBounds.x >= 0 && menuBounds.x + menuBounds.width <= 390);
    await touchPage.screenshot({ path: path.join(dataDir, 'scene-settings-touch.png') });
    await touchPage.locator('#chooseLaunchFrame').tap();
    assert.equal(await touchPage.locator('[data-frame-choice]').count(), 29);
    await touchPage.getByRole('searchbox', { name: 'Search frames' }).fill('DRAGON');
    assert.equal(await touchPage.locator('[data-frame-choice]:visible').count(), 2);
    await touchPage.getByRole('searchbox', { name: 'Search frames' }).fill('no-such-frame');
    assert.equal(await touchPage.locator('[data-frame-choice]:visible').count(), 0);
    assert.match(await touchPage.locator('[data-search-status]').textContent(), /No matching frames/);
    await touchPage.locator('[data-clear-search]').tap();
    assert.equal(await touchPage.locator('[data-frame-choice]:visible').count(), 29);
    const frameNames = await touchPage.locator('[data-frame-choice] strong').allTextContents();
    assert.equal(frameNames[0], 'No frame');
    assert.deepEqual(frameNames.slice(1), frameNames.slice(1).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })));
    assert.equal(await touchPage.locator('.launch-frame-options').evaluate(grid => getComputedStyle(grid).gridTemplateColumns.split(' ').length), 2);
    await touchPage.locator('[data-frame-choice="blossom"]').tap();
    await touchPage.locator('#launchScenePreview .scene-frame-artwork').evaluate(image => image.decode());
    assert(await touchPage.locator('.launch-frame-dialog').evaluate(dialog => dialog.scrollWidth <= dialog.clientWidth));
    await touchPage.locator('.launch-frame-dialog').screenshot({ path: path.join(dataDir, 'scene-frames-touch.png') });
    await touchPage.locator('[data-frame-choice="none"]').tap();
    await touchPage.locator('#saveLaunchFrame').tap();
    await touchPage.waitForFunction(() => {
      const gear = document.querySelector('#launchSceneSettings');
      return gear?.classList.contains('is-idle') && getComputedStyle(gear).opacity === '0';
    });
    await touchPage.locator('.home-scene-feature .launch-scene').tap();
    await touchPage.waitForFunction(() => getComputedStyle(document.querySelector('#launchSceneSettings')).opacity === '1');
    await touchPage.locator('#launchSceneSettings').tap();
    assert.equal(await touchPage.locator('#chooseLaunchScene').isVisible(), true);
    await touchContext.close();
    await openSceneSettings();
    await page.locator('#chooseLaunchFrame').click();
    for (const frame of ['none', 'chrome', 'gold', 'rose', 'pearl', 'neon', 'prism', 'onyx', 'braid', 'bronze', 'velvet', 'mosaic', 'carbon', 'deco', 'frost', 'blossom', 'guardian', 'woodland', 'orbit', 'treasure', 'royal', 'phoenix', 'butterfly', 'frost-dragon', 'clockwork', 'library', 'champion', 'halloween', 'new-orleans']) {
      await page.locator(`[data-frame-choice="${frame}"]`).click();
      assert.equal(await page.locator('#launchScenePreview [data-scene-frame]').getAttribute('data-scene-frame'), frame);
      if (['blossom', 'guardian', 'woodland', 'orbit', 'treasure', 'royal', 'phoenix', 'butterfly', 'frost-dragon', 'clockwork', 'library', 'champion', 'halloween', 'new-orleans'].includes(frame)) {
        const alpha = await page.locator('#launchScenePreview .scene-frame-artwork').evaluate(async image => {
          await image.decode();
          const canvas = document.createElement('canvas');
          canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
          const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0);
          return { center: ctx.getImageData(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), 1, 1).data[3], corner: ctx.getImageData(0, 0, 1, 1).data[3], clicks: getComputedStyle(image).pointerEvents };
        });
        assert.deepEqual(alpha, { center: 0, corner: 0, clicks: 'none' });
        const fit = await page.locator('#launchScenePreview .launch-scene').evaluate(scene => {
          const style = getComputedStyle(scene);
          return { clipped: style.clipPath.startsWith('polygon('), border: style.borderTopWidth };
        });
        assert.deepEqual(fit, { clipped: true, border: '0px' });
        assert(await page.locator(`[data-frame-choice="${frame}"] .frame-swatch > img, [data-frame-choice="${frame}"] .frame-swatch > .scene-original-thumb`).evaluate(scene => getComputedStyle(scene).clipPath.startsWith('polygon(')));
      }
      if (['bronze', 'velvet', 'mosaic', 'carbon', 'deco', 'frost', 'blossom', 'guardian', 'woodland', 'orbit', 'treasure', 'royal', 'phoenix', 'butterfly', 'frost-dragon', 'clockwork', 'library', 'champion', 'halloween', 'new-orleans'].includes(frame)) {
        await page.locator('#launchScenePreview').screenshot({ path: path.join(dataDir, `scene-frame-${frame}.png`) });
        const saved = await request('/api/home-scene', { method: 'POST', cookie: teacherCookie, body: { id: 'reef', motion: false, frame } });
        assert.equal(saved.status, 200);
        assert.equal(saved.payload.session.homeScene.frame, frame);
      }
    }
    await request('/api/home-scene', { method: 'POST', cookie: teacherCookie, body: { id: 'original', motion: true, frame: 'none' } });
    assert.equal((await request('/api/auth/session', { cookie: studentCookie })).payload.session.homeScene.frame, 'none');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.home-scene-feature [data-scene-frame]').getAttribute('data-scene-frame'), 'none');
    await openSceneSettings();
    await page.locator('#chooseLaunchFrame').click();
    await page.locator('[data-frame-choice="gold"]').click();
    await page.locator('.launch-frame-dialog').screenshot({ path: path.join(dataDir, 'scene-frames-desktop.png') });
    await page.route('**/api/home-scene', route => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Frame test save failure' }) }));
    await page.locator('#saveLaunchFrame').click();
    await page.getByText('Frame test save failure', { exact: true }).waitFor();
    assert.equal(await page.locator('#saveLaunchFrame').isEnabled(), true);
    await page.unroute('**/api/home-scene');
    await page.locator('#saveLaunchFrame').click();
    await page.locator('.launch-frame-dialog').waitFor({ state: 'detached' });
    assert.equal((await request('/api/auth/session', { cookie: studentCookie })).payload.session.homeScene.frame, 'gold');
    assert.equal((await request('/api/auth/session', { cookie: teacherCookie })).payload.session.homeScene.frame, 'none');
    assert.equal((await request('/api/home-scene', { method: 'POST', cookie: studentCookie, body: { id: 'original', motion: true, frame: '../bad' } })).status, 400);
    assert.equal(await page.locator('.home-scene-feature .launch-scene').getAttribute('data-scene'), 'original');
    await openSceneSettings();
    await page.locator('#chooseLaunchScene').click();
    await page.locator('[data-scene-choice="reef"]').click();
    const sceneSearch = page.getByRole('searchbox', { name: 'Search scenes' });
    await sceneSearch.fill('Jesus');
    assert.equal(await page.locator('[data-scene-choice]:visible').count(), 1);
    assert.equal(await page.locator('[data-scene-choice]:visible').getAttribute('data-scene-choice'), 'chapel');
    await sceneSearch.fill('cafe');
    assert.equal(await page.locator('[data-scene-choice]:visible').getAttribute('data-scene-choice'), 'cafe');
    await sceneSearch.fill('hot balloon');
    assert.equal(await page.locator('[data-scene-choice]:visible').getAttribute('data-scene-choice'), 'balloons');
    await sceneSearch.fill('no-such-scene');
    assert.equal(await page.locator('[data-scene-choice]:visible').count(), 0);
    assert.match(await page.locator('[data-search-status]').textContent(), /No matching scenes/);
    assert.equal(await page.locator('#launchScenePreview .launch-scene').getAttribute('data-scene'), 'reef');
    await page.locator('[data-clear-search]').click();
    assert.equal(await page.locator('[data-scene-choice]:visible').count(), 30);
    const sceneNames = await page.locator('[data-scene-choice] strong').allTextContents();
    assert.equal(sceneNames[0], 'Classroom Original');
    assert.deepEqual(sceneNames.slice(1), sceneNames.slice(1).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })));
    assert.equal(await page.locator('#launchScenePreview .launch-scene').getAttribute('data-scene'), 'reef');
    assert.equal((await request('/api/auth/session', { cookie: studentCookie })).payload.session.homeScene.id, 'original');
    await page.locator('#saveLaunchScene').click();
    await page.locator('.launch-scene-dialog').waitFor({ state: 'detached' });
    assert.equal(await page.locator('.home-scene-feature .launch-scene').getAttribute('data-scene'), 'reef');
    assert.equal(await page.locator('.home-scene-feature [data-scene-frame]').getAttribute('data-scene-frame'), 'gold');
    assert.equal(await page.locator('.launch-scene-image').evaluate(image => image.complete && image.naturalWidth > 0), true);
    await page.locator('.home-scene-feature .launch-scene').hover();
    await page.waitForFunction(() => {
      const gear = document.querySelector('#launchSceneSettings');
      return gear?.classList.contains('is-idle') && getComputedStyle(gear).opacity === '0';
    });
    // A stationary pointer must not hold the gear open after saving.
    await page.mouse.move(1, 1);
    await page.locator('.home-scene-feature .launch-scene').hover();
    await page.waitForFunction(() => getComputedStyle(document.querySelector('#launchSceneSettings')).opacity === '1');
    await openSceneSettings();
    await page.locator('#toggleLaunchScene').click();
    await page.waitForFunction(() => document.querySelector('#toggleLaunchScene')?.textContent === 'Resume scene');
    assert.equal((await request('/api/auth/session', { cookie: studentCookie })).payload.session.homeScene.motion, false);
    let releaseSession;
    const sessionGate = new Promise(resolve => { releaseSession = resolve; });
    await page.route('**/api/auth/session', async route => { await sessionGate; await route.continue(); });
    await page.addInitScript(() => {
      window.sawOriginalSceneDuringLoad = false;
      new MutationObserver(records => {
        for (const record of records) for (const node of record.addedNodes) {
          if (node.nodeType === 1 && (node.matches('[data-scene="original"]') || node.querySelector('[data-scene="original"]'))) window.sawOriginalSceneDuringLoad = true;
        }
      }).observe(document, { childList: true, subtree: true });
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('.scene-loading').waitFor();
    assert.equal(await page.locator('.home-scene-feature video').count(), 0);
    assert.equal(await page.locator('.home-scene-feature [data-scene="original"]').count(), 0);
    releaseSession();
    await page.locator('.home-scene-feature [data-scene="reef"]').waitFor();
    await page.unroute('**/api/auth/session');
    assert.equal(await page.evaluate(() => window.sawOriginalSceneDuringLoad), false);
    assert.equal(await page.locator('.home-scene-feature [data-scene-frame]').getAttribute('data-scene-frame'), 'gold');
    const frameAfterLegacySave = await request('/api/home-scene', { method: 'POST', cookie: studentCookie, body: { id: 'reef', motion: false } });
    assert.equal(frameAfterLegacySave.payload.session.homeScene.frame, 'gold');
    assert.equal(await page.locator('.home-scene-feature .launch-scene').getAttribute('data-scene'), 'reef');
    assert(await page.locator('.home-scene-feature .launch-scene').evaluate(element => element.classList.contains('is-paused')));
    assert.equal((await request('/api/auth/session', { cookie: teacherCookie })).payload.session.homeScene.id, 'original');
    assert.equal((await request('/api/home-scene', { method: 'POST', body: { id: 'reef', motion: true } })).status, 401);
    assert.equal((await request('/api/home-scene', { method: 'POST', cookie: studentCookie, body: { id: '../bad', motion: true } })).status, 400);
    await openSceneSettings();
    await page.locator('#chooseLaunchScene').click();
    await page.locator('[data-scene-choice="forest"]').click();
    await page.locator('#launchSceneMotion').check();
    await page.locator('#saveLaunchScene').click();
    await page.locator('.launch-scene-dialog').waitFor({ state: 'detached' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('.launch-scene-image').evaluate(image => getComputedStyle(image).animationName), 'none');
    await page.waitForFunction(() => document.querySelector('#toggleLaunchScene')?.disabled === true);
    assert(await page.locator('#toggleLaunchScene').isDisabled());
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    assert.equal(await page.locator('.launch-scene-image').evaluate(image => getComputedStyle(image).animationName), 'none');
    assert.equal(await page.locator('.launch-scene-image').evaluate(image => getComputedStyle(image).transform), 'none');
    for (const [id, effect] of [['forest', 'scene-firefly-flow'], ['pixel', 'scene-pixel-glow'], ['observatory', 'scene-stars'], ['dragon', 'scene-dust'], ['cabin', 'scene-snow'], ['neon', 'scene-rain'], ['castle', 'scene-sun-rays'], ['koi', 'scene-petals'], ['crystal', 'scene-crystal-flow'], ['pumpkin', 'scene-leaves'], ['volcano', 'scene-embers'], ['football', 'scene-confetti'], ['basketball', 'scene-court-lights'], ['championship', 'scene-confetti'], ['soccer', 'scene-court-lights'], ['baseball', 'scene-court-lights'], ['softball', 'scene-court-lights'], ['gymnastics', 'scene-court-lights'], ['cafe', 'scene-rain'], ['aurora', 'scene-aurora-flow'], ['train', 'scene-leaves'], ['lantern', 'scene-petals'], ['bookshop', 'scene-rain'], ['crawfish', 'scene-boil-steam'], ['balloons', 'scene-burner-glow'], ['robotics', 'scene-robot-lights'], ['retro-arcade', 'scene-arcade-lights'], ['chapel', 'scene-chapel-light']]) {
      await openSceneSettings();
      await page.locator('#chooseLaunchScene').click();
      assert.equal(await page.locator('[data-scene-choice]').count(), 30);
      await page.locator(`[data-scene-choice="${id}"]`).click();
      await page.locator('#launchScenePreview img').evaluate(image => image.decode());
      const imageStyle = await page.locator('#launchScenePreview img').evaluate(image => ({ animation: getComputedStyle(image).animationName, transform: getComputedStyle(image).transform }));
      assert.deepEqual(imageStyle, { animation: 'none', transform: 'none' });
      if (['balloons', 'retro-arcade', 'chapel'].includes(id)) {
        const glow = page.locator('#launchScenePreview .launch-scene-particles i').first();
        const contrast = await glow.evaluate(element => {
          const animation = element.getAnimations()[0];
          animation.pause();
          animation.currentTime = 0;
          const dim = Number(getComputedStyle(element).opacity);
          animation.currentTime = Number(animation.effect.getTiming().duration) * (element.closest('.scene-balloons') ? .35 : .5);
          return { dim, bright: Number(getComputedStyle(element).opacity), transform: getComputedStyle(element).transform };
        });
        assert(contrast.bright - contrast.dim > .9);
        assert.equal(contrast.transform, 'none');
        await page.locator('#launchScenePreview').screenshot({ path: path.join(dataDir, `${id}-bright-effect.png`) });
        await glow.evaluate(element => element.getAnimations()[0].play());
        if (id === 'retro-arcade') {
          const scan = await page.locator('#launchScenePreview .launch-scene-particles i').nth(1).evaluate(element => {
            const animation = element.getAnimations()[0];
            animation.pause();
            animation.currentTime = 0;
            const start = getComputedStyle(element).backgroundPosition;
            animation.currentTime = 1500;
            const end = getComputedStyle(element).backgroundPosition;
            animation.play();
            return { start, end, display: getComputedStyle(element).display };
          });
          assert.notEqual(scan.start, scan.end);
          assert.equal(scan.display, 'block');
        }
      }
      assert.equal(await page.locator('#launchScenePreview .launch-scene-particles i').first().evaluate(particle => getComputedStyle(particle).animationName), effect);
      if (id === 'pixel') {
        assert.equal(await page.locator('#launchScenePreview .scene-pixel-coin').count(), 4);
        const spin = await page.locator('#launchScenePreview .scene-pixel-coin svg').first().evaluate(coin => {
          const animation = coin.getAnimations()[0];
          animation.pause();
          animation.currentTime = 0;
          const face = new DOMMatrix(getComputedStyle(coin).transform).m11;
          animation.currentTime = 600;
          const edge = new DOMMatrix(getComputedStyle(coin).transform).m11;
          animation.play();
          return { face, edge };
        });
        assert(spin.face > .9 && spin.edge < .2, JSON.stringify(spin));
      }
      if (id === 'cafe') {
        const rain = await page.locator('#launchScenePreview .launch-scene-particles i').first().evaluate(element => {
          const style = getComputedStyle(element);
          return { width: style.width, height: style.height, duration: style.animationDuration, trail: getComputedStyle(element, '::before').content };
        });
        assert.deepEqual(rain, { width: '1px', height: '19px', duration: '2.8s', trail: 'none' });
      }
      if (id === 'castle') {
        const rays = await page.locator('#launchScenePreview .launch-scene-particles i').first().evaluate(particle => {
          const animation = particle.getAnimations()[0];
          animation.pause();
          animation.currentTime = 0;
          const first = { transform: getComputedStyle(particle).transform, opacity: Number(getComputedStyle(particle).opacity) };
          animation.currentTime = 2400;
          const peak = { transform: getComputedStyle(particle).transform, opacity: Number(getComputedStyle(particle).opacity) };
          const background = getComputedStyle(particle).backgroundImage;
          animation.play();
          return { first, peak, background };
        });
        assert(rays.background.includes('conic-gradient'));
        assert.notEqual(rays.first.transform, rays.peak.transform);
        assert(rays.peak.opacity - rays.first.opacity >= .39);
        const liveRay = page.locator('#launchScenePreview .launch-scene-particles i').first();
        const before = await liveRay.evaluate(element => getComputedStyle(element).transform);
        await page.waitForTimeout(350);
        assert.notEqual(await liveRay.evaluate(element => getComputedStyle(element).transform), before, 'Sun rays must move with real elapsed time');
      }
      if (['basketball', 'soccer', 'baseball', 'softball', 'gymnastics'].includes(id)) {
        assert.equal(await page.locator('#launchScenePreview .launch-scene-particles i:visible').count(), 1);
        const light = await page.locator('#launchScenePreview .launch-scene-particles i').first().evaluate(element => {
          const animation = element.getAnimations()[0];
          animation.pause();
          animation.currentTime = 0;
          const dim = Number(getComputedStyle(element).opacity);
          animation.currentTime = animation.effect.getTiming().duration / 2;
          const bright = Number(getComputedStyle(element).opacity);
          const transform = getComputedStyle(element).transform;
          animation.play();
          return { dim, bright, transform };
        });
        assert(light.bright - light.dim > .8);
        assert.equal(light.transform, 'none');
        for (const [phase, fraction] of [['dim', 0], ['bright', .5]]) {
          await page.locator('#launchScenePreview .launch-scene-particles i').first().evaluate((element, fraction) => {
            const animation = element.getAnimations()[0];
            animation.pause();
            animation.currentTime = animation.effect.getTiming().duration * fraction;
          }, fraction);
          await page.locator('#launchScenePreview .launch-scene').screenshot({ path: path.join(dataDir, `${id}-lights-${phase}.png`) });
        }
        await page.locator('#launchScenePreview .launch-scene-particles i').first().evaluate(element => element.getAnimations()[0].play());
      }
      if (['forest', 'observatory', 'dragon'].includes(id)) {
        const flow = await page.locator('#launchScenePreview .launch-scene-particles i').first().evaluate(particle => {
          const style = getComputedStyle(particle);
          const animation = particle.getAnimations()[0];
          animation.pause();
          animation.currentTime = 2000;
          const first = new DOMMatrix(getComputedStyle(particle).transform);
          animation.currentTime = 3000;
          const second = new DOMMatrix(getComputedStyle(particle).transform);
          const frames = animation.effect.getKeyframes();
          const result = { direction: style.animationDirection, easing: style.animationTimingFunction, distance: Math.hypot(second.m41 - first.m41, second.m42 - first.m42), startOpacity: frames[0].opacity, endOpacity: frames.at(-1).opacity };
          animation.play();
          return result;
        });
        assert.equal(flow.direction, 'normal');
        assert.equal(flow.easing, 'linear');
        assert(flow.distance > 25, JSON.stringify(flow));
        assert.equal(Number(flow.startOpacity), 0);
        assert.equal(Number(flow.endOpacity), 0);
      }
      await page.locator('#launchSceneMotion').uncheck();
      if (id === 'train') assert.equal(await page.locator('#launchScenePreview .launch-scene-particles').evaluate(element => getComputedStyle(element, '::before').animationPlayState), 'paused');
      if (['football', 'basketball', 'championship'].includes(id)) assert.equal(await page.locator('#launchScenePreview .launch-scene-particles').evaluate(particles => getComputedStyle(particles, '::before').animationPlayState), 'paused');
      assert.equal(await page.locator('#launchScenePreview .launch-scene-particles i').first().evaluate(particle => getComputedStyle(particle).animationPlayState), 'paused');
      if (id === 'pixel') assert.equal(await page.locator('#launchScenePreview .launch-scene-particles').evaluate(particles => getComputedStyle(particles, '::before').animationPlayState), 'paused');
      if (id === 'pixel') assert.equal(await page.locator('#launchScenePreview .scene-pixel-coin svg').first().evaluate(coin => getComputedStyle(coin).animationPlayState), 'paused');
      await page.locator('#launchSceneMotion').check();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      if (id === 'train') assert.equal(await page.locator('#launchScenePreview .launch-scene-particles').evaluate(element => getComputedStyle(element, '::before').animationName), 'none');
      if (['football', 'basketball', 'championship'].includes(id)) assert.equal(await page.locator('#launchScenePreview .launch-scene-particles').evaluate(particles => getComputedStyle(particles, '::before').animationName), 'none');
      assert.equal(await page.locator('#launchScenePreview .launch-scene-particles i').first().evaluate(particle => getComputedStyle(particle).animationName), 'none');
      if (id === 'pixel') assert.equal(await page.locator('#launchScenePreview .scene-pixel-coin svg').first().evaluate(coin => getComputedStyle(coin).animationName), 'none');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.locator('#saveLaunchScene').click();
      await page.locator('.launch-scene-dialog').waitFor({ state: 'detached' });
      assert.equal((await request('/api/auth/session', { cookie: studentCookie })).payload.session.homeScene.id, id);
      assert.equal(await page.locator('.home-scene-feature .launch-scene').getAttribute('data-scene'), id);
      if (id === 'castle') {
        await page.locator('.home-scene-feature .scene-castle i').first().evaluate(particle => { const animation = particle.getAnimations()[0]; animation.pause(); animation.currentTime = 2400; });
        await page.locator('.home-scene-feature .launch-scene').screenshot({ path: path.join(dataDir, 'castle-sun-rays.png') });
      }
      if (id === 'pixel') await page.locator('.home-scene-feature .launch-scene').screenshot({ path: path.join(dataDir, 'pixel-spinning-coins.png') });
      if (['football', 'basketball', 'championship', 'soccer', 'baseball', 'softball', 'gymnastics'].includes(id)) await page.locator('.home-scene-feature .launch-scene').screenshot({ path: path.join(dataDir, `sports-${id}.png`) });
      if (['cafe', 'aurora', 'train', 'lantern', 'bookshop', 'crawfish', 'balloons', 'robotics', 'retro-arcade', 'chapel'].includes(id)) {
        await page.locator('.home-scene-feature .launch-scene').screenshot({ path: path.join(dataDir, `cozy-${id}.png`) });
        const effectLayer = page.locator('.home-scene-feature .launch-scene-particles i').first();
        const property = ['balloons', 'robotics', 'retro-arcade', 'chapel'].includes(id) ? 'opacity' : 'transform';
        const before = await effectLayer.evaluate((element, property) => getComputedStyle(element)[property], property);
        await page.waitForTimeout(350);
        assert.notEqual(await effectLayer.evaluate((element, property) => getComputedStyle(element)[property], property), before);
      }
    }
    await openSceneSettings();
    await page.locator('#chooseLaunchScene').click();
    await page.locator('[data-scene-choice="forest"]').click();
    await page.locator('#saveLaunchScene').click();
    await page.locator('.launch-scene-dialog').waitFor({ state: 'detached' });
    await page.locator('#home-top').screenshot({ path: path.join(dataDir, 'scene-home-desktop.png'), style: '#launchpadColtRoot, #coltAssistantRoot, #coltRadioRoot { visibility: hidden !important; }' });
    await page.setViewportSize({ width: 390, height: 844 });
    await openSceneSettings();
    await page.locator('#chooseLaunchScene').click();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.locator('.launch-scene-dialog').screenshot({ path: path.join(dataDir, 'scene-chooser-mobile.png') });
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.launch-scene-dialog').count(), 0);
    await openSceneSettings();
    await page.locator('#chooseLaunchScene').click();
    await page.locator('[data-scene-choice="original"]').click();
    await page.locator('#launchSceneMotion').uncheck();
    assert(await page.locator('#launchScenePreview video').evaluate(video => video.muted && !video.autoplay));
    await page.route('**/api/home-scene', route => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Test save failure' }) }));
    await page.locator('#saveLaunchScene').click();
    await page.locator('#launchSceneSaveStatus').getByText('Test save failure').waitFor();
    assert.equal(await page.locator('.home-scene-feature .launch-scene').getAttribute('data-scene'), 'forest');
    await page.unroute('**/api/home-scene');
    await page.keyboard.press('Escape');
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.locator('[data-action="openColtCorner"]').first().click();
    await page.locator('[data-action="openThread"]').first().click();
    await page.locator(".forum-thread-view").waitFor();
    assert.equal(await page.locator(".forum-post-author").count(), 1);
    assert.equal(await page.locator(".forum-post-content").count(), 1);
    assert(await page.locator(".forum-profile-editor").isVisible());
    assert(await page.locator(".forum-reply-composer").isVisible());

    await page.locator("#forumProfileImage").setInputFiles(avatarFixture);
    await page.locator("#forumProfileStatus").getByText("Profile picture saved.").waitFor();
    const avatarSrc = await page.locator("img.forum-profile-preview").getAttribute("src");
    assert.match(avatarSrc, /^\/api\/profile-avatar\/[a-f0-9]{64}\?v=\d+$/);
    assert(await page.locator(".forum-post-author img.forum-avatar").isVisible());
    const avatarLayout = await page.locator(".forum-post-author img.forum-avatar").evaluate(avatar => {
      const styles = getComputedStyle(avatar);
      return {
        width: avatar.getBoundingClientRect().width,
        height: avatar.getBoundingClientRect().height,
        borderWidth: styles.borderWidth,
        borderRadius: styles.borderRadius,
        objectFit: styles.objectFit,
        outlineWidth: styles.outlineWidth
      };
    });
    assert.deepEqual(avatarLayout, {
      width: 92,
      height: 92,
      borderWidth: "0px",
      borderRadius: "50%",
      objectFit: "cover",
      outlineWidth: "3px"
    });
    assert.equal((await fetch(`${baseUrl}${avatarSrc}`)).status, 401);
    assert.equal((await fetch(`${baseUrl}${avatarSrc}`, { headers: { Cookie: studentCookie } })).status, 200);
    await page.screenshot({ path: path.join(dataDir, "forum-thread-desktop.png"), fullPage: true });

    assert.equal(await page.locator('[data-profile-frame]').count(), 7);
    assert.equal((await request('/api/profile-banner', { method: 'POST', body: { profileBanner: 'colt' } })).status, 401);
    assert.equal((await request('/api/profile-banner', { method: 'POST', cookie: studentCookie, body: { profileBanner: '../bad' } })).status, 400);
    await page.locator('#changeProfileBanner').click();
    assert.equal(await page.locator('[data-banner-choice]').count(), 5);
    for (const id of ['colt', 'neon', 'cosmic', 'horizon']) {
      await page.locator(`[data-banner-choice="${id}"]`).click();
      assert.equal(await page.locator('#profileBannerPreview [data-banner]').getAttribute('data-banner'), id);
      await page.locator('#profileBannerPreview img').first().evaluate(image => image.decode());
    }
    await page.keyboard.press('Escape');
    assert.equal((await request('/api/auth/session', { cookie: studentCookie })).payload.session.profileBanner, 'none');
    await page.locator('#changeProfileBanner').click();
    await page.locator('[data-banner-choice="colt"]').click();
    await page.route('**/api/profile-banner', route => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Banner save test error' }) }));
    await page.locator('#saveProfileBanner').click();
    await page.getByText('Banner save test error', { exact: true }).waitFor();
    assert(await page.locator('#saveProfileBanner').isEnabled());
    await page.unroute('**/api/profile-banner');
    await page.locator('.profile-banner-dialog').screenshot({ path: path.join(dataDir, 'banner-chooser-desktop.png') });
    await page.locator('#saveProfileBanner').click();
    await page.getByText('Profile banner saved!', { exact: true }).waitFor();
    assert.equal((await request('/api/auth/session', { cookie: studentCookie })).payload.session.profileBanner, 'colt');
    assert.equal((await request('/api/auth/session', { cookie: teacherCookie })).payload.session.profileBanner, 'none');
    assert(await page.locator('.forum-post-author [data-banner="colt"]').isVisible());
    assert.equal(await page.locator('.forum-post-author [data-banner="colt"] img').evaluate(image => getComputedStyle(image).objectPosition), '100% 50%');
    await page.locator('.forum-post-author').screenshot({ path: path.join(dataDir, 'colt-banner-author-desktop.png') });
    const bannerCrop = await page.locator('.forum-profile-editor > [data-banner="colt"] img').evaluate(async image => {
      await image.decode();
      const box = image.getBoundingClientRect();
      return Math.abs(box.width / box.height - image.naturalWidth / image.naturalHeight);
    });
    assert(bannerCrop < .02, 'Wide Colt banner must show the full image without vertical cropping');
    await page.locator('.forum-profile-editor').screenshot({ path: path.join(dataDir, 'profile-banner-desktop.png') });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#changeProfileBanner').click();
    assert.equal(await page.locator('#profileBannerPreview [data-banner="colt"] img').evaluate(image => getComputedStyle(image).objectPosition), '100% 50%');
    assert(await page.locator('.profile-banner-dialog').evaluate(dialog => dialog.scrollWidth <= dialog.clientWidth));
    await page.locator('.profile-banner-dialog').screenshot({ path: path.join(dataDir, 'banner-chooser-mobile.png') });
    await page.locator('[data-banner-choice="none"]').click();
    await page.locator('#saveProfileBanner').click();
    await page.locator('.profile-banner-dialog').waitFor({ state: 'detached' });
    assert.equal(await page.locator('.forum-post-author [data-banner]').count(), 0);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.locator('[data-profile-frame="colt"]').click();
    assert(await page.locator('#profileFramePreview .frame-colt').isVisible());
    assert.equal(await page.locator('.forum-post-author .frame-colt').count(), 0, "Preview must not save immediately.");
    await page.locator('#saveProfileFrame').click();
    await page.getByText('Profile frame saved!', { exact: true }).waitFor();
    assert(await page.locator('.forum-post-author .frame-colt').isVisible());
    async function checkHeaderFrame(page, frame) {
      const previousScreen = await page.evaluate(() => ({ ...screen }));
      await page.evaluate(() => setScreen({ name: 'home' }));
      const summary = page.locator('.header-account-summary:visible').first();
      assert(await summary.locator(`.header-frame-slot .frame-${frame}`).isVisible());
      const geometry = await summary.evaluate(element => {
        const slot = element.querySelector('.header-frame-slot').getBoundingClientRect();
        const art = element.querySelector('.profile-frame-art').getBoundingClientRect();
        const copy = element.querySelector('.header-account-copy').getBoundingClientRect();
        return { contained: art.left >= slot.left && art.right <= slot.right && art.top >= slot.top && art.bottom <= slot.bottom, noOverlap: slot.right <= copy.left, width: slot.width };
      });
      assert(geometry.contained && geometry.noOverlap, JSON.stringify(geometry));
      assert(geometry.width <= 42);
      await summary.click();
      assert(await page.locator('.header-account-panel').first().isVisible());
      assert(await page.locator(`.header-account-identity .frame-${frame}`).first().isVisible());
      await summary.click();
      await page.evaluate(value => setScreen(value), previousScreen);
    }
    await checkHeaderFrame(page, 'colt');
    const freshSession = await request('/api/auth/session', { cookie: studentCookie });
    assert.equal(freshSession.status, 200);
    assert.equal(freshSession.payload.session.profileFrame, 'colt');
    const invalidFrame = await request('/api/profile-frame', { method: 'POST', cookie: studentCookie, body: { profileFrame: '<script>' } });
    assert.equal(invalidFrame.status, 400);
    const guestFrame = await request('/api/profile-frame', { method: 'POST', body: { profileFrame: 'colt' } });
    assert.equal(guestFrame.status, 401);
    await page.locator('.forum-profile-editor').screenshot({ path: path.join(dataDir, 'profile-frames-desktop.png'), style: '#launchpadColtRoot, #coltAssistantRoot, #coltRadioRoot { visibility: hidden !important; }' });

    await page.setViewportSize({ width: 390, height: 844 });
    await checkHeaderFrame(page, 'colt');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false);
    assert(await page.locator(".forum-post-author").isVisible());
    assert(await page.locator(".forum-post-content").isVisible());
    await page.screenshot({ path: path.join(dataDir, "forum-thread-mobile.png"), fullPage: true });
    await page.locator('.forum-profile-editor').screenshot({ path: path.join(dataDir, 'profile-frames-mobile.png'), style: '#launchpadColtRoot, #coltAssistantRoot, #coltRadioRoot { visibility: hidden !important; }' });

    await page.locator("#removeForumProfileImage").click();
    await page.locator("#forumProfileStatus").getByText("Profile picture removed.").waitFor();
    assert(await page.locator(".forum-profile-preview.forum-avatar-initials").isVisible());
    assert(await page.locator('#profileFramePreview .frame-colt').isVisible(), "Removing a picture must preserve its frame.");
    await page.locator('[data-profile-frame="none"]').click();
    await page.locator('#saveProfileFrame').click();
    await page.getByText('Profile frame saved!', { exact: true }).waitFor();
    assert(await page.locator('.forum-post-author .frame-none').isVisible());

    const teacherContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const [teacherCookieName, teacherCookieValue] = teacherCookie.split("=");
    await teacherContext.addCookies([{ name: teacherCookieName, value: teacherCookieValue, url: baseUrl }]);
    const teacherPage = await teacherContext.newPage();
    await teacherPage.goto(baseUrl, { waitUntil: "networkidle" });
    await teacherPage.locator('.colt-corner-open[data-action="openColtCorner"]').click();
    await teacherPage.locator('.colt-corner-grade-tab[data-grade="4"]').click();
    assert(await teacherPage.locator(".colt-corner-card > .forum-profile-editor").isVisible());
    await teacherPage.locator('[data-profile-frame="stars"]').click();
    await teacherPage.locator('#saveProfileFrame').click();
    await teacherPage.getByText('Profile frame saved!', { exact: true }).waitFor();
    assert.equal((await request('/api/auth/session', { cookie: teacherCookie })).payload.session.profileFrame, 'stars');
    await checkHeaderFrame(teacherPage, 'stars');
    const newTopic = await request('/api/threads', { method: 'POST', cookie: teacherCookie, body: { title: 'Frame inheritance check', message: 'Let us share our favorite classroom activities.', grades: ['4'] } });
    assert.equal(newTopic.status, 200);
    const framedTopic = newTopic.payload.threads.find(thread => thread.title === 'Frame inheritance check');
    assert.equal(framedTopic.profileFrame, 'stars');
    const newReply = await request(`/api/threads/${framedTopic.id}/replies`, { method: 'POST', cookie: teacherCookie, body: { message: 'I enjoy reading together in class.' } });
    assert.equal(newReply.status, 200);
    assert.equal(newReply.payload.threads.find(thread => thread.id === framedTopic.id).replies[0].profileFrame, 'stars');
    await teacherPage.locator("#forumProfileImage").setInputFiles(avatarFixture);
    await teacherPage.locator("#forumProfileStatus").getByText("Profile picture saved.").waitFor();
    const teacherAvatarSrc = await teacherPage.locator("img.forum-profile-preview").getAttribute("src");
    assert.match(teacherAvatarSrc, /^\/api\/profile-avatar\/[a-f0-9]{64}\?v=\d+$/);
    assert.equal((await fetch(`${baseUrl}${teacherAvatarSrc}`, { headers: { Cookie: teacherCookie } })).status, 200);
    await teacherPage.locator('[data-action="openThread"]').first().click();
    assert(await teacherPage.locator(".forum-post-author img.forum-avatar").first().isVisible());
    assert.equal(await teacherPage.locator('.forum-post-author .frame-stars').count(), 2);
    await teacherPage.locator("#removeForumProfileImage").click();
    await teacherPage.locator("#forumProfileStatus").getByText("Profile picture removed.").waitFor();
    assert(await teacherPage.locator(".forum-post-author .forum-avatar-initials").first().isVisible());
    await teacherContext.close();

    console.log(JSON.stringify({
      forumDesktopTwoColumnLayout: true,
      homepageScenesPersistPerAccount: true,
      sceneMotionPauseAndReducedMotion: true,
      scenePreviewCancelAndSaveFailure: true,
      accountSavedFramePreviews: true,
      frameScreenshot: path.join(dataDir, 'profile-frames-desktop.png'),
      frameMobileScreenshot: path.join(dataDir, 'profile-frames-mobile.png'),
      forumMobileLayoutResponsive: true,
      studentProfilePictureUpload: true,
      studentProfilePictureRemoval: true,
      teacherProfilePictureUpload: true,
      teacherProfilePictureAppearsOnPosts: true,
      teacherProfilePictureRemoval: true,
      profilePicturesFillEntireCircle: true,
      innerAvatarRingRemoved: true,
      profilePicturesRequireSignedInAccess: true,
      desktopScreenshot: path.join(dataDir, "forum-thread-desktop.png"),
      mobileScreenshot: path.join(dataDir, "forum-thread-mobile.png")
    }, null, 2));
  } finally {
    if (browser) await browser.close();
    child.kill();
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
