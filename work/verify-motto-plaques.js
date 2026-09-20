const assert = require('node:assert/strict');
const path = require('node:path');
module.exports = async function ({ page, browser, baseUrl, request, studentCookie, teacherCookie, dataDir }) {
  const post = (body, cookie = studentCookie) => request('/api/home-plaque', { method: 'POST', body, cookie });
  assert.equal((await post({ style: 'colt', motto: 'm0-0' }, '')).status, 401);
  assert.equal((await post({ style: 'colt', motto: '<script>' })).status, 400);
  assert.equal((await post({ style: 'unknown', motto: 'm0-0' })).status, 400);
  assert.equal((await post({ style: 'gold', motto: 'm3-0' }, teacherCookie)).status, 200);
  async function open() {
    await page.locator('.header-account-summary:visible').click();
    await page.locator('[data-action="mottoPlaque"]:visible').click();
    await page.locator('.motto-plaque-dialog').waitFor();
  }
  await open();
  assert.equal(await page.locator('[data-plaque-choice]').count(), 8);
  assert.equal(await page.locator('#mottoPlaqueText option').count(), 24);
  await page.locator('[data-plaque-choice="colt"]').click();
  await page.locator('#mottoPlaqueText').selectOption('m2-5');
  await page.screenshot({ path: path.join(dataDir, 'motto-plaque-chooser.png') });
  await page.locator('#saveMottoPlaque').click();
  await page.locator('.motto-plaque-dialog').waitFor({ state: 'detached' });
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('.title-group > .motto-plaque span').textContent(), 'Proud to Be a Colt');
  assert.equal((await request('/api/auth/session', { cookie: teacherCookie })).payload.session.homePlaque.style, 'gold');
  await page.screenshot({ path: path.join(dataDir, 'motto-plaque-colt-desktop.png') });
  await open();
  await page.locator('[data-plaque-choice="pearl"]').click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  assert.equal(await page.locator('.title-group > .motto-plaque').getAttribute('data-plaque-style'), 'colt');
  await open();
  await page.route('**/api/home-plaque', route => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Test save failed' }) }));
  await page.locator('#saveMottoPlaque').click();
  await page.waitForFunction(() => document.querySelector('#mottoPlaqueStatus')?.textContent.includes('Test save failed'));
  assert.equal(await page.locator('#saveMottoPlaque').isEnabled(), true);
  await page.unroute('**/api/home-plaque');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  for (const width of [390, 1024, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const errors = await page.evaluate(() => {
      const errors = [];
      const target = document.querySelector('.title-group > .motto-plaque');
      for (const [style] of MottoPlaques.styles.filter(([id]) => id !== 'none')) {
        for (const motto of MottoPlaques.mottos) {
          target.outerHTML = MottoPlaques.art({ style, motto: motto.id });
          const current = document.querySelector('.title-group > .motto-plaque');
          const box = current.getBoundingClientRect();
          const text = current.querySelector('span').getBoundingClientRect();
          if (text.left < box.left || text.right > box.right || text.top < box.top || text.bottom > box.bottom || box.right > innerWidth) errors.push(`${style}/${motto.id}`);
          // Keep the replacement target current for the next iteration.
          current.replaceWith(target);
        }
      }
      return errors;
    });
    assert.deepEqual(errors, [], `Plaque text fit at ${width}px`);
    await page.screenshot({ path: path.join(dataDir, `motto-plaque-${width}.png`) });
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  const guest = await browser.newPage();
  await guest.goto(baseUrl, { waitUntil: 'networkidle' });
  assert.equal(await guest.locator('.title-group > .motto-plaque').count(), 0);
  await guest.close();
  const teacher = await post({ style: 'gold', motto: 'm3-0' }, teacherCookie);
  assert.equal(teacher.payload.session.homePlaque.style, 'gold');
  assert.equal((await request('/api/auth/session', { cookie: studentCookie })).payload.session.homePlaque.style, 'colt');
  await open();
  await page.locator('[data-plaque-choice="none"]').click();
  await page.locator('#saveMottoPlaque').click();
  await page.locator('.motto-plaque-dialog').waitFor({ state: 'detached' });
  assert.equal(await page.locator('.title-group > .motto-plaque').count(), 0);
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('.title-group > .motto-plaque').count(), 0);
};
