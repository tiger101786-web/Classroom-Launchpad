// Read-only visual check of every sprite viewport, without changing the source artwork.
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const shelf = require('../collectible-shelf');
(async () => {
  const browser = await chromium.launch({ executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless:true });
  try {
    const page = await browser.newPage({ viewport:{width:1200,height:1100} });
    const atlas = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname,'../assets/shelf-collectibles.png')).toString('base64');
    const bust = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname,'../assets/shelf-tanjiro-bust.png')).toString('base64');
    let gallery = '';
    for (let index=0; index<shelf.items.length; index+=3) {
      const group = shelf.items.slice(index,index+3);
      gallery += `<section>${shelf.art({enabled:true, slots:[...group.map(item=>item.id), 'none', 'none'].slice(0,3)})}<p>${group.map(item=>item.name).join(' · ')}</p></section>`;
    }
    const board = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname,'../assets/collectible-shelf-colt.png')).toString('base64');
    const css = fs.readFileSync(path.join(__dirname,'../collectible-shelf.css'),'utf8').replaceAll('assets/collectible-shelf-colt.png',board);
    for (const id of ['all-might','naruto']) gallery = gallery.replaceAll(`assets/shelf-${id}.png`, 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname,`../assets/shelf-${id}.png`)).toString('base64'));
    await page.setContent(`<style>${css}*{box-sizing:border-box}body{margin:0;padding:24px;background:#171015;color:#f8e8ed;font:12px system-ui;display:grid;grid-template-columns:repeat(3,1fr);gap:30px}p{text-align:center}</style>${gallery.replaceAll('assets/shelf-collectibles.png',atlas).replaceAll('assets/shelf-tanjiro-bust.png',bust)}`);
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
