const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {chromium} = require('playwright');
(async () => {
  const browser = await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    const page = await browser.newPage();
    const css = ['styles.css','collectible-shelf.css'].map(file => fs.readFileSync(path.join(__dirname,'..',file),'utf8')).join('\n');
    await page.setContent(`<style>${css}*{transition:none!important}</style><div class="home-header-rail"><button class="google-signin-btn">Google Sign In</button></div><div class="shelf-restore"><button class="outline-btn">Show shelf</button></div>`);
    const style = element => {
      const css = getComputedStyle(element);
      return [css.borderTopColor,css.backgroundImage,css.color,css.boxShadow,css.transform];
    };
    const google = page.getByRole('button',{name:'Google Sign In'});
    const shelf = page.getByRole('button',{name:'Show shelf'});
    await google.hover();
    const expected = await google.evaluate(style);
    await shelf.hover();
    assert.deepEqual(await shelf.evaluate(style),expected);
    await page.mouse.move(500,500);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    assert.equal(await shelf.evaluate(element => element.matches(':focus-visible')),true);
    assert.deepEqual(await shelf.evaluate(style),expected);
    console.log('Show shelf hover and keyboard focus match Google Sign In red glow.');
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});
