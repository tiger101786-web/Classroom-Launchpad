const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
const shelf = require('../collectible-shelf');
(async()=>{
  const browser = await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    const page = await browser.newPage();
    await page.route('http://shelf-check.local/assets/*',route=>route.fulfill({contentType:'image/png',body:fs.readFileSync(path.join(__dirname,'../assets',path.basename(new URL(route.request().url()).pathname)))}));
    const css = fs.readFileSync(path.join(__dirname,'../collectible-shelf.css'),'utf8');
    const cards = ['paperweight','controller','terrarium','goku',...shelf.items.map(item=>item.id)].map(id=>{
      const artwork=shelf.art({enabled:true,slots:[id,'none','none']}).match(/<svg class="shelf-object[\s\S]*?<\/svg><\/svg>/)[0];
      return `<button>${artwork}<strong>${shelf.items.find(item=>item.id===id).name}</strong></button>`;
    }).join('');
    for(const width of [800,390]) {
      await page.setViewportSize({width,height:700});
      await page.setContent(`<base href="http://shelf-check.local/"><style>${css}*{box-sizing:border-box}body{padding:16px;margin:0;background:#171015;color:#fff;font-family:Arial}.shelf-choice-grid{align-items:stretch}</style><div class="shelf-choice-grid">${cards}</div>`);
      const rows = await page.locator('.shelf-choice-grid button').evaluateAll(buttons=>buttons.map(button=>{
        const box=button.getBoundingClientRect(),svg=button.querySelector('.shelf-object'),s=svg.getBoundingClientRect(),art=svg.querySelector('svg'),label=button.querySelector('strong').getBoundingClientRect();
        const scale=s.width/220;
        return {row:box.top,label:label.top,base:s.bottom-4*scale,artLeft:s.left+Number(art.getAttribute('x'))*scale,artRight:s.left+(Number(art.getAttribute('x'))+Number(art.getAttribute('width')))*scale,left:box.left,right:box.right,bottomGap:box.bottom-label.bottom,viewBox:svg.getAttribute('viewBox')};
      }));
      for(const row of rows) {
        assert.equal(row.viewBox,'0 0 220 350');
        assert(row.artLeft>=row.left && row.artRight<=row.right,'Artwork fits card');
        assert(row.bottomGap<=12,'No excessive space below labels');
        const peers=rows.filter(other=>Math.abs(other.row-row.row)<1);
        assert(peers.every(other=>Math.abs(other.label-row.label)<1 && Math.abs(other.base-row.base)<1),'Labels and image bases align in each row');
      }
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await page.screenshot({path:path.join(__dirname,`shelf-uniform-selector-${width}.png`)});
    }
    console.log('All collectible previews share statue sizing; card bases and labels align on desktop/mobile.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
