const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require('playwright'),sharp=require('sharp'),shelf=require('../collectible-shelf');
(async()=>{
 const ids=['nola-snowball','nola-king-cake','nola-second-line','nola-pelican'];
 for(const id of ids){
  assert(shelf.items.some(i=>i.id===id&&i.category==='New Orleans'));
  assert(shelf.valid({enabled:true,theme:'crimson',slots:[id,'horse','crystal']}));
  const {data}=await sharp('assets/shelf-'+id+(id==='nola-king-cake'?'-flat':'')+'.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.equal(data[3],0);
 }
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:900,height:850}});
  await page.route('http://art.local/**',r=>r.fulfill({body:fs.readFileSync(path.join(process.cwd(),new URL(r.request().url()).pathname)),contentType:'image/png'}));
  await page.setContent('<base href="http://art.local/"><style>'+fs.readFileSync('collectible-shelf.css','utf8')+'body{background:#241821;color:white;padding:100px 40px}section{width:650px}</style><section>'+shelf.art({enabled:true,theme:'mardi-gras',slots:ids.slice(0,3)})+'</section>');
  const bases=await page.locator('.shelf-object > svg').evaluateAll(ns=>ns.map(n=>+n.getAttribute('y')+ +n.getAttribute('height')));assert(bases.every(b=>Math.abs(b-346)<.01));
  await page.waitForTimeout(600);await page.screenshot({path:'work/new-orleans-shelf-preview.png'});
  await page.addScriptTag({path:path.resolve('collectible-shelf.js')});
  await page.evaluate(()=>CollectibleShelf.open({selected:{enabled:true,theme:'crimson',slots:['none','none','none']},save:async v=>v,onSave:()=>{}}));
  await page.locator('#shelfCategory').selectOption('New Orleans');
  for(const id of ids){
   await page.locator('#shelfSearch').fill(shelf.items.find(i=>i.id===id).name);
   const card=page.locator('[data-shelf-item="'+id+'"]');assert.equal(await card.locator('image').getAttribute('href'),'assets/shelf-'+id+(id==='nola-king-cake'?'-flat':'')+'.png');await card.click();
  }
  console.log('Four New Orleans items: validation, alpha, shelf alignment, category search and selection passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
