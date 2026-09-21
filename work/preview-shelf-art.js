// Read-only visual check of every sprite viewport, without changing the source artwork.
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const shelf = require('../collectible-shelf');
(async () => {
  const browser = await chromium.launch({ executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless:true });
  try {
    const page = await browser.newPage({ viewport:{width:1200,height:1100} });
    await page.route('http://shelf-preview.local/assets/*', route => {
      const filename = path.basename(new URL(route.request().url()).pathname);
      return route.fulfill({contentType:'image/png',body:fs.readFileSync(path.join(__dirname,'../assets',filename))});
    });
    let gallery = '';
    if (process.argv.includes('--figures')) {
      for (const theme of shelf.themes) gallery += `<section>${shelf.art({enabled:true,theme:theme.id,slots:['sailor-moon','rumi','luffy']})}<p>${theme.name}</p></section>`;
    }
    if (process.argv.includes('--themes')) {
      for (const theme of shelf.themes) gallery += `<section>${shelf.art({enabled:true,theme:theme.id,slots:['nezuko','luffy','daisy-vase']})}<p>${theme.name}</p></section>`;
    }
    for (let index=0; index<shelf.items.length; index+=3) {
      if (process.argv.includes('--themes') || process.argv.includes('--figures')) break;
      const pool = process.argv.includes('--random20') ? shelf.items.slice(-20) : shelf.items;
      const group = pool.slice(index,index+3);
      if (!group.length) break;
      gallery += `<section>${shelf.art({enabled:true, slots:[...group.map(item=>item.id), 'none', 'none'].slice(0,3)})}<p>${group.map(item=>item.name).join(' · ')}</p></section>`;
    }
    const css = fs.readFileSync(path.join(__dirname,'../collectible-shelf.css'),'utf8');
    await page.setContent(`<base href="http://shelf-preview.local/"><style>${css}*{box-sizing:border-box}body{margin:0;padding:24px;background:#171015;color:#f8e8ed;font:12px system-ui;display:grid;grid-template-columns:repeat(3,1fr);gap:30px}p{text-align:center}</style>${gallery}`);
    const misplaced = await page.evaluate(() => [...document.querySelectorAll('.collectible-shelf')].flatMap(shelf => {
      const board = shelf.getBoundingClientRect();
      return [...shelf.querySelectorAll('.shelf-object')].filter(item => {
        const box = item.getBoundingClientRect();
        const base = box.bottom - box.height * 4 / 220;
        return base < board.top + board.height * .53 || base > board.top + board.height * .64 || box.left < board.left || box.right > board.right;
      }).map(item => item.getAttribute('aria-label'));
    }));
    require('node:assert/strict').deepEqual(misplaced, [], 'All collectible bases must rest on the tabletop');
    await page.screenshot({path:process.argv[2] || path.join(require('node:os').tmpdir(),'shelf-art-gallery.png'),fullPage:true});
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
