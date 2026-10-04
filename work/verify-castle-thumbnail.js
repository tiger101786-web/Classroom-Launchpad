"use strict";
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
(async () => {
  const browser = await chromium.launch({headless:true, executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});
  try {
    const page = await browser.newPage();
    await page.route('http://shelf.test/**', async route => {
      const file = path.join(root, new URL(route.request().url()).pathname);
      return route.fulfill(fs.existsSync(file) && fs.statSync(file).isFile() ? {path:file} : {contentType:'text/html', body:'<!doctype html><meta charset="utf-8"><body></body>'});
    });
    await page.goto('http://shelf.test/');
    for (const file of ['styles.css','launchpad-scenes.css','collectible-shelf.css']) await page.addStyleTag({url:`http://shelf.test/${file}`});
    await page.addScriptTag({url:'http://shelf.test/collectible-shelf.js'});
    for (const [width,height] of [[1100,900],[390,844],[1100,480]]) {
      await page.setViewportSize({width,height});
      await page.evaluate(() => CollectibleShelf.open({selected:{enabled:true,theme:'disney-castle',slots:['none','none','none']},save:async draft=>{window.savedShelf=draft;}}));
      await page.locator('#shelfStylesTab').click();
      await page.locator('#shelfSearch').fill('Disney Storybook Castle');
      const card = page.locator('[data-shelf-theme-choice="disney-castle"]');
      await card.click({trial:true});
      const boxes = await card.evaluate(button => {
        const rect = el => {const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right};};
        return {card:rect(button),art:rect(button.querySelector('.collectible-shelf')),label:rect(button.querySelector('strong'))};
      });
      assert(boxes.art.top >= boxes.card.top+6, 'Castle spire must have space above it');
      assert(boxes.art.bottom <= boxes.label.top, 'Castle must not overlap its label');
      assert(boxes.art.left >= boxes.card.left && boxes.art.right <= boxes.card.right);
      await card.screenshot({path:path.join(os.tmpdir(),`castle-card-${width}-${height}.png`)});
      await card.click();
      await page.locator('#saveShelf').click();
      await page.waitForFunction(() => window.savedShelf?.theme === 'disney-castle');
    }
    console.log('Castle thumbnail fits desktop, mobile and short windows; selection/save passed.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
