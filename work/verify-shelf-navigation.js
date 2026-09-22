const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage();
  await page.route('http://shelf.local/assets/*',route=>route.fulfill({contentType:'image/png',body:fs.readFileSync(path.join(__dirname,'../assets',path.basename(new URL(route.request().url()).pathname)))}));
  const css=['launchpad-scenes.css','collectible-shelf.css'].map(file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8')).join('\n');
  for(const [width,height] of [[1280,900],[390,844],[390,667],[844,390]]){
   await page.setViewportSize({width,height});
   await page.setContent('<base href="http://shelf.local/"><style>:root{--paper:#171015;--ink:#fff0f5;--border:#804355;--muted:#e2bccb}body{font-family:Arial}button{padding:7px;cursor:pointer}'+css+'</style><button id="opener">Open</button>');
   await page.addScriptTag({path:path.join(__dirname,'../collectible-shelf.js')});
   const open=()=>page.evaluate(()=>{window.saved=null;CollectibleShelf.open({selected:{enabled:true,theme:'crimson',slots:['goku','planet','controller']},save:async value=>{if(window.failSave)throw Error('Test failed');window.saved=value;return value;},onSave:()=>{}});});
   await open();
   assert.equal(await page.locator('[data-shelf-item]').count(),width<=600?(height<780?3:6):height<740?4:12);
   const seen=new Set();
   do{
    for(const id of await page.locator('[data-shelf-item]').evaluateAll(els=>els.map(el=>el.dataset.shelfItem)))seen.add(id);
    if(await page.locator('#shelfNext').isDisabled())break;
    await page.locator('#shelfNext').click();
   }while(true);
   assert.equal(seen.size,require('../collectible-shelf').items.length);
   await page.locator('#shelfSearch').fill('windmill');
   assert.equal(await page.locator('[data-shelf-item]').count(),1);
   assert.equal(await page.locator('#shelfPageStatus').textContent(),'Page 1 of 1');
   await page.locator('[data-shelf-item="windmill"]').click();
   await page.locator('[data-shelf-tab="styles"]').click();
   assert.equal(await page.locator('[data-shelf-theme-choice]').first().getAttribute('data-shelf-theme-choice'),'crimson');
   await page.locator('#shelfSearch').fill('porcelain');
   await page.locator('[data-shelf-theme-choice="porcelain"]').click();
   await page.locator('[data-shelf-tab="objects"]').click();
   assert.equal(await page.locator('#shelfSearch').inputValue(),'windmill');
   await page.locator('#shelfClearSlot').click();
   await page.locator('[data-shelf-item="windmill"]').click();
   await page.locator('#shelfSearch').fill('');
   await page.locator('#shelfCategory').selectOption('Anime');
   assert.match(await page.locator('#shelfPageStatus').textContent(),/^Page 1/);
   await page.locator('#shelfCategory').selectOption('');
   await page.locator('#shelfSearch').fill('zzzzzz');
   assert.equal(await page.locator('[data-shelf-item]').count(),0);
   assert(await page.locator('#shelfNext').isDisabled());
   await page.locator('#shelfSearch').fill('');
   const layout=await page.locator('.shelf-dialog').evaluate(dialog=>{
    const footer=dialog.querySelector('.shelf-dialog-actions').getBoundingClientRect(),preview=dialog.querySelector('#shelfPreview').getBoundingClientRect();
    return {overflow:dialog.scrollHeight>dialog.clientHeight+1,horizontal:dialog.scrollWidth>dialog.clientWidth,footerBottom:footer.bottom,previewTop:preview.top};
   });
   assert(!layout.overflow && !layout.horizontal,JSON.stringify({width,height,layout}));
   assert(layout.footerBottom<=height && layout.previewTop>=0);
   await page.screenshot({path:path.join(__dirname,'shelf-navigation-'+width+'x'+height+'.png')});
   await page.evaluate(()=>window.failSave=true);
   await page.locator('#saveShelf').click();
   await page.getByText('Test failed',{exact:true}).waitFor();
   assert(await page.locator('#shelfPrevious').isDisabled());
   await page.evaluate(()=>window.failSave=false);
   await page.locator('#saveShelf').click();
   await page.locator('.shelf-dialog').waitFor({state:'detached'});
   assert.deepEqual(await page.evaluate(()=>window.saved),{enabled:true,theme:'porcelain',slots:['windmill','planet','controller']});
   await open();
   await page.locator('#shelfObjectsTab').focus();
   await page.keyboard.press('ArrowRight');
   assert.equal(await page.locator('#shelfStylesTab').getAttribute('aria-selected'),'true');
   await page.keyboard.press('Escape');
   assert.equal(await page.locator('.shelf-dialog').count(),0);
   assert.equal(await page.evaluate(()=>window.saved),null);
  }
  console.log('Shelf navigation passed: all items reachable, tabs, search, paging, clear, save/error/cancel, desktop/mobile/landscape fixed controls.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
