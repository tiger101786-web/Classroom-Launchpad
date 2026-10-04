"use strict";
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {chromium}=require('playwright');
const shelf=require('../collectible-shelf');
const root=path.resolve(__dirname,'..');
(async()=>{
  const ids=['bowser','link','peach','yoshi','zelda','fox','samus'].map(name=>`nintendo-${name}-statue`);
  for(const id of ['mario-statue','luigi-statue']) assert.equal(shelf.items.find(item=>item.id===id).category,'Nintendo');
  for(const id of ids){assert.equal(shelf.clean({enabled:true,theme:'comic-hero',slots:[id,'none','none']}).slots[0],id);assert.equal(shelf.items.find(item=>item.id===id).category,'Nintendo');assert(fs.existsSync(path.join(root,`assets/shelf-${id}.png`)));}
  const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});
  try{
    const page=await browser.newPage({viewport:{width:1100,height:900}});
    await page.route('http://shelf.test/**',async route=>{
      const file=path.join(root,new URL(route.request().url()).pathname);
      if(fs.existsSync(file)&&fs.statSync(file).isFile())await route.fulfill({path:file});else await route.fulfill({contentType:'text/html',body:'<html><head></head><body></body></html>'});
    });
    await page.goto('http://shelf.test/');
    await page.addStyleTag({url:'http://shelf.test/styles.css'});
    await page.addStyleTag({url:'http://shelf.test/collectible-shelf.css'});
    await page.addScriptTag({url:'http://shelf.test/collectible-shelf.js'});
    await page.evaluate(ids=>{
      document.body.style.cssText='background:#19151a;padding:130px 24px 24px';
      document.body.innerHTML='<div style="display:flex;flex-wrap:wrap;gap:110px 24px">'+[ids.slice(0,3),ids.slice(3,6),[ids[6],'mario-statue','luigi-statue']].map(slots=>'<section style="width:420px;max-width:100%">'+CollectibleShelf.art({enabled:true,theme:'comic-hero',slots},true)+'</section>').join('')+'</div>';
    },ids);
    await page.locator('img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
    assert.equal(await page.locator('img').count(),9);
    const boxes=await page.locator('.shelf-direct-image > div').evaluateAll(nodes=>nodes.map(n=>({bottom:n.style.bottom,height:parseFloat(n.style.height)})));
    assert(boxes.every(b=>b.bottom===boxes[0].bottom&&b.height<=98));
    assert(boxes[0].height>82 && boxes[0].height<85, 'Bowser should have a smaller footprint while retaining room for his arms');
    await page.screenshot({path:path.join(os.tmpdir(),'nintendo-shelf-desktop.png'),fullPage:true});
    await page.evaluate(()=>CollectibleShelf.open({selected:{enabled:true,theme:'comic-hero',slots:['none','none','none']},save:async draft=>{window.savedShelf=draft;}}));
    await page.locator('#shelfCategory').selectOption({label:'Nintendo'});
    assert.match(await page.locator('#shelfResults').innerText(),/9/);
    await page.locator('#shelfSearch').fill('Zelda');
    await page.locator('[data-shelf-item="nintendo-zelda-statue"]').click();
    await page.locator('#saveShelf').click();
    await page.waitForFunction(()=>window.savedShelf?.slots[0]==='nintendo-zelda-statue');
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:path.join(os.tmpdir(),'nintendo-shelf-mobile.png'),fullPage:true});
    console.log('Nintendo assets, category, shared sizing, picker and save passed. Screenshots in '+os.tmpdir());
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
