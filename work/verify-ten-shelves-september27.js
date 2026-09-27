const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require('playwright'),sharp=require('sharp'),shelf=require('../collectible-shelf');
const ids=["stars-stripes","angel-wings","wild-west","egyptian-gold","jungle-ruins","tropical-paradise","ice-cream-parlor","music-hall","comic-hero","strawberry-garden"];
(async()=>{
 const slots=['archangel-michael','archangel-gabriel','uncle-sam'];
 for(const id of ids){
  const state={enabled:true,theme:id,slots};assert(shelf.valid(state));assert.deepEqual(shelf.clean(state),state);
  const {data,info}=await sharp('assets/collectible-shelf-'+id+'.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.equal(data[3],0);console.log(id,info.width,info.height);
 }
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:1700}});
  await page.route('http://art.local/**',r=>{const f=path.join(process.cwd(),new URL(r.request().url()).pathname);return fs.existsSync(f)?r.fulfill({body:fs.readFileSync(f),contentType:'image/png'}):r.fulfill({status:404,body:''});});
  const css=fs.readFileSync('collectible-shelf.css','utf8').replace(/^\uFEFF/,'');
  await page.setContent('<base href="http://art.local/"><style>'+css+'body{margin:0;padding:24px;display:grid;grid-template-columns:repeat(3,1fr);gap:40px 24px;background:#241821;color:white;font:16px Arial;text-align:center}article{min-width:0}h3{margin:0 0 85px}.collectible-shelf{width:100%}@media(max-width:600px){body{grid-template-columns:1fr}}</style>'+ids.map(id=>'<article><h3>'+shelf.themes.find(t=>t.id===id).name+'</h3>'+shelf.art({enabled:true,theme:id,slots})+'</article>').join(''));
  await page.addScriptTag({path:path.resolve('collectible-shelf.js')});
  await page.evaluate(async ids=>{await Promise.all([...ids.map(id=>'assets/collectible-shelf-'+id+'.png'),...Array.from(document.querySelectorAll('image'),i=>i.getAttribute('href'))].map(src=>new Promise((ok,bad)=>{const i=new Image();i.onload=ok;i.onerror=bad;i.src=src;})));},ids);
  for(const width of [1200,390]){
   await page.setViewportSize({width,height:1700});
   for(const id of ids){assert.match(await page.locator('article [data-shelf-theme="'+id+'"] > .shelf-board').evaluate(e=>getComputedStyle(e).backgroundImage),new RegExp('collectible-shelf-'+id+'.png'));}
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.screenshot({path:'work/ten-shelves-'+width+'.png',fullPage:true});
   await page.evaluate(slots=>CollectibleShelf.open({selected:{enabled:true,theme:'crimson',slots},save:async v=>{window.savedShelf=v;return v},onSave:()=>{}}),slots);
   await page.locator('#shelfStylesTab').click();
   const seen=new Set();
   do{
    for(const id of await page.locator('[data-shelf-theme-choice]').evaluateAll(ns=>ns.map(n=>n.dataset.shelfThemeChoice)))seen.add(id);
    if(await page.locator('#shelfNext').isDisabled())break;
    await page.locator('#shelfNext').click();
   }while(true);
   for(const id of ids){assert(seen.has(id));
    await page.locator('#shelfSearch').fill(shelf.themes.find(t=>t.id===id).name);
    await page.locator('[data-shelf-theme-choice="'+id+'"]').click();
    assert.equal(await page.locator('#shelfPreview [data-shelf-theme="'+id+'"]').count(),1);
   }
   await page.locator('#saveShelf').click();assert.deepEqual(await page.evaluate(()=>window.savedShelf),{enabled:true,theme:ids.at(-1),slots});
  }
  console.log('Ten new shelves pass transparent asset checks, validation, mobile/desktop rendering, pagination, search, selection and save.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
