const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const assert = require('assert');
const { chromium } = require('playwright');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const server = spawn(process.execPath, ['server.js'], { cwd: root, env: { ...process.env, PORT: '8097', DATA_DIR: fs.mkdtempSync(path.join(os.tmpdir(), 'title-layout-')), SESSION_SECRET: 'test-session-secret-at-least-32-characters', TEACHER_PIN: '654321' }, stdio: ['ignore', 'pipe', 'pipe'] });
(async () => {
  let browser;
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(Error('Server timeout')), 10000);
      server.stdout.on('data', data => { if (String(data).includes('server running')) { clearTimeout(timer); resolve(); } });
    });
    const metadata = await sharp(path.join(root, 'assets/classroom-launchpad-title.png')).metadata();
    assert(metadata.hasAlpha, 'Title requires transparency');
    browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe' });
    const page = await browser.newPage();
    for (const width of [1600, 1440, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('http://localhost:8097/', { waitUntil: 'networkidle' });
      await page.locator('.home-title-art img').evaluate(img => img.decode());
      const metrics = await page.evaluate(() => {
        const title = document.querySelector('.home-title-art img');
        const t = title.getBoundingClientRect();
        const hero = document.querySelector('.hero-panel').getBoundingClientRect();
        const scene = document.querySelector('.school-photo')?.getBoundingClientRect();
        const badge = getComputedStyle(document.querySelector('.teacher-name'));
        return { width: innerWidth, heroHeight:hero.height, roundedBadge:badge.borderRadius==='999px' && badge.fontStyle==='normal', sceneContained:!scene || (scene.top>=hero.top && scene.bottom<=hero.bottom), titleWidth: t.width, titleHeight: t.height, loaded: title.naturalWidth > 0, contained: t.left >= hero.left && t.right <= hero.right, sceneClear: !scene || t.right <= scene.left || t.bottom <= scene.top || t.left >= scene.right, overflow: document.documentElement.scrollWidth > innerWidth };
      });
      console.log(metrics);
      assert(metrics.loaded && metrics.contained && metrics.sceneClear && !metrics.overflow, JSON.stringify(metrics));
      assert(metrics.roundedBadge && metrics.sceneContained);
      if(width>=1100) assert(metrics.heroHeight<=420);
      await page.locator('.hero-panel').screenshot({ path: path.join(__dirname, `home-title-${width}.png`) });
    }
  } finally { if (browser) await browser.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
