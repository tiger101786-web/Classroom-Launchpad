const fs = require('fs'), assert = require('assert/strict'), { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage();
    const ids = [...new Set([...fs.readFileSync('launchpad-scenes.js', 'utf8').matchAll(/"id":"(holiday-[^"]+)"/g)].map(m => m[1]))];
    assert.equal(ids.length, 9);
    await page.setContent(`<style>${fs.readFileSync('launchpad-scenes.css', 'utf8')}</style>${[...ids, 'forest'].map(id => `<div class="launch-scene scene-${id}" style="position:relative;width:300px;height:300px"><span class="launch-scene-particles">${Array.from({length:9}, (_,n)=>`<i style="--n:${n};--x:50%;--y:50%"></i>`).join('')}</span></div>`).join('')}`);
    for (const id of ids) {
      const particle = page.locator(`.scene-${id} i`).first();
      const result = await particle.evaluate(e => {
        const style = getComputedStyle(e), animation = e.getAnimations()[0];
        animation.pause(); animation.currentTime = 700;
        const a = new DOMMatrix(getComputedStyle(e).transform).m42;
        animation.currentTime = 1700;
        return { duration: style.animationDuration, timing: style.animationTimingFunction, distance: new DOMMatrix(getComputedStyle(e).transform).m42 - a };
      });
      assert.equal(result.duration, '7s'); assert.equal(result.timing, 'linear'); assert(Math.abs(result.distance + 50) < 1);
    }
    assert.equal(await page.locator('.scene-forest i').first().evaluate(e => getComputedStyle(e).animationDuration), '10s');
    await page.locator('.launch-scene').first().evaluate(e => e.classList.add('is-paused'));
    assert.equal(await page.locator('.launch-scene i').first().evaluate(e => getComputedStyle(e).animationPlayState), 'paused');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('.launch-scene i').first().evaluate(e => getComputedStyle(e).animationName), 'none');
    console.log('All nine holiday scenes: 50px/second floating motion; older scene speed, pause and reduced-motion controls preserved.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
