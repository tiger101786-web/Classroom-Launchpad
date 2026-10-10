const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require('playwright');
const shelf=require('../collectible-shelf');
const root=path.resolve(__dirname,'..');
(async()=>{
  const ids=shelf.items.filter(i=>i.category==='Squishy Toys'&&i.id.startsWith('squishy-')&&i.id!=='squishy-butter-stack').map(i=>i.id);
  assert.equal(ids.length,11);
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1200,height:800}});
    await page.route('http://art.local/assets/*',r=>r.fulfill({contentType:'image/png',body:fs.readFileSync(path.join(root,'assets',path.basename(new URL(r.request().url()).pathname)))}));
    const css=fs.readFileSync(path.join(root,'collectible-shelf.css'),'utf8').replace(/^\uFEFF/,'');
    let gallery='';
    for(let index=0;index<ids.length;index+=3){
      const group=ids.slice(index,index+3);
      gallery+='<section>'+shelf.art({enabled:true,theme:'squishy-dumplings',slots:[...group,'none','none'].slice(0,3)})+'<p>'+group.map(id=>shelf.items.find(i=>i.id===id).name).join('<br>')+'</p></section>';
    }
    await page.setContent('<base href="http://art.local/"><style>'+css+'body{margin:0;padding:30px;background:#21151d;color:white;font:14px Arial;display:grid;grid-template-columns:repeat(2,350px);justify-content:center;gap:60px}section{width:350px}p{text-align:center}</style>'+gallery);
    await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
    const widths=await page.locator('.shelf-direct-image > div').evaluateAll(els=>els.map(el=>el.getBoundingClientRect().width));
    assert.equal(widths.length,11);
    assert(Math.max(...widths)-Math.min(...widths)<.1,'Every basket has the same display width');
    assert(widths[0]<70,'Existing dumplings use smaller display sizing');
    const aligned=await page.locator('.collectible-shelf').evaluateAll(els=>els.every(el=>{
      const bottoms=[...el.querySelectorAll('.shelf-direct-image > div')].map(el=>el.getBoundingClientRect().bottom);
      return Math.max(...bottoms)-Math.min(...bottoms)<.1;
    }));
    assert(aligned,'All baskets rest on the same shelf contact baseline');
    await page.screenshot({path:'C:/Users/Sinister/Documents/Email/small-squishy-collection-preview.png',fullPage:true});
    await page.setContent('<base href="http://art.local/"><style>'+css+'</style>');
    await page.addScriptTag({path:path.join(root,'collectible-shelf.js')});
    for(const [width,height]of [[1366,768],[390,844]]){
      await page.setViewportSize({width,height});
      await page.evaluate(()=>CollectibleShelf.open({selected:{enabled:true,theme:'squishy-dumplings',slots:['squishy-pink','squishy-blue','squishy-gold']},save:async value=>{window.saved=value;return value},onSave:()=>{}}));
      await page.locator('#shelfCategory').selectOption('Squishy Toys');
      for(const id of ids.slice(-8)){
        await page.locator('#shelfSearch').fill(shelf.items.find(i=>i.id===id).name);
        const card=page.locator('[data-shelf-item="'+id+'"]');
        assert.equal(await card.count(),1);
        await card.locator('img').evaluate(i=>i.decode());
        await card.click();
      }
      await page.locator('#saveShelf').click();
      await page.waitForFunction(()=>window.saved?.slots[0]==='squishy-liberty');
    }
    console.log('All eleven dumplings have matching smaller basket width and baseline. Eight new transparent images load; desktop/mobile category search, selection and saving passed.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
