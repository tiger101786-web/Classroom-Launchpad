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
    let gallery = '';
    for (let index=0; index<shelf.items.length; index+=3) {
      const group = shelf.items.slice(index,index+3);
      gallery += `<section>${shelf.art({enabled:true, slots:group.map(item=>item.id)})}<p>${group.map(item=>item.name).join(' · ')}</p></section>`;
    }
    const css = fs.readFileSync(path.join(__dirname,'../collectible-shelf.css'),'utf8');
    await page.setContent(`<style>${css}*{box-sizing:border-box}body{margin:0;padding:24px;background:#171015;color:#f8e8ed;font:12px system-ui;display:grid;grid-template-columns:repeat(3,1fr);gap:30px}p{text-align:center}</style>${gallery.replaceAll('assets/shelf-collectibles.png',atlas)}`);
    await page.screenshot({path:process.argv[2] || path.join(require('node:os').tmpdir(),'shelf-art-gallery.png'),fullPage:true});
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
