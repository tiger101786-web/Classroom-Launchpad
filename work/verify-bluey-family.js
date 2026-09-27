const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require('playwright'),sharp=require('sharp'),shelf=require('../collectible-shelf');
(async()=>{
 const ids=['bingo','chilli','bandit'];
 assert(shelf.valid({enabled:true,theme:'crimson',slots:ids}));
 const asset=id=>'assets/shelf-'+id+(id==='bingo'?'-reference':'')+'.png';
 for(const id of ids){assert(shelf.items.some(i=>i.id===id&&i.category==='Character Collectibles'));const {data}=await sharp(asset(id)).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.equal(data[3],0);}
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:800,height:750}});
 await page.route('http://art.local/**',r=>r.fulfill({body:fs.readFileSync(path.join(process.cwd(),new URL(r.request().url()).pathname)),contentType:'image/png'}));
 await page.setContent('<base href="http://art.local/"><style>'+fs.readFileSync('collectible-shelf.css','utf8')+'body{background:#241821;color:white;padding:220px 40px 20px}section{width:650px}</style><section>'+shelf.art({enabled:true,theme:'crimson',slots:ids})+'</section>');
 const boxes=await page.locator('.shelf-object > svg').evaluateAll(ns=>ns.map(n=>({height:+n.getAttribute('height'),base:+n.getAttribute('y')+ +n.getAttribute('height')})));
 assert(boxes.every(b=>Math.abs(b.base-346)<.01&&Math.abs(b.height-330)<.01));
 await page.waitForTimeout(500);await page.screenshot({path:'work/bluey-family-preview.png'});
 await page.addScriptTag({path:path.resolve('collectible-shelf.js')});
 await page.evaluate(()=>CollectibleShelf.open({selected:{enabled:true,theme:'crimson',slots:['bluey','none','none']},save:async v=>v,onSave:()=>{}}));
 await page.locator('#shelfCategory').selectOption('Character Collectibles');
 for(const id of ids){await page.locator('#shelfSearch').fill(id);const card=page.locator('[data-shelf-item="'+id+'"]');assert.equal(await card.locator('image').getAttribute('href'),asset(id));await card.click();}
 console.log('Bingo, Chilli and Bandit: category, selection, validation, transparency, statue height and shelf baseline passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
