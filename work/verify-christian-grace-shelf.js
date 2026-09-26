const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),sharp=require('sharp'),shelf=require('../collectible-shelf');
(async()=>{
 const state={enabled:true,theme:'christian',slots:['praying-hands','good-shepherd','peace-dove']};
 assert(shelf.valid(state));assert.deepEqual(shelf.clean(state),state);
 const {data}=await sharp('assets/collectible-shelf-christian.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});assert(data[3]<=1);
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  for(const width of [1100,390]){
   const page=await browser.newPage({viewport:{width,height:800}});
   await page.route('http://art.local/**',r=>r.fulfill({body:fs.readFileSync(path.join(process.cwd(),new URL(r.request().url()).pathname)),contentType:'image/png'}));
   await page.setContent('<base href="http://art.local/"><style>'+fs.readFileSync('collectible-shelf.css','utf8')+'body{background:#241821;color:white;margin:0;padding:100px 20px}section{width:min(100%,550px);margin:auto}</style><section>'+shelf.art(state)+'</section>');
   assert.match(await page.locator('.shelf-board').evaluate(e=>getComputedStyle(e).backgroundImage),/collectible-shelf-christian.png/);
   await page.waitForTimeout(500);
   await page.screenshot({path:'work/christian-grace-shelf-'+width+'.png'});
   await page.addScriptTag({path:path.resolve('collectible-shelf.js')});
   await page.evaluate(()=>CollectibleShelf.open({selected:{enabled:true,theme:'crimson',slots:['praying-hands','good-shepherd','peace-dove']},save:async v=>{window.savedShelf=v;return v},onSave:()=>{}}));
   await page.locator('#shelfStylesTab').click();await page.locator('#shelfSearch').fill('Christian Grace');
   await page.locator('[data-shelf-theme-choice="christian"]').click();
   assert.equal(await page.locator('#shelfPreview [data-shelf-theme="christian"]').count(),1);
   await page.locator('#saveShelf').click();
   assert.deepEqual(await page.evaluate(()=>window.savedShelf),state);
   await page.close();
  }
  console.log('Christian Grace shelf: transparent art, validation, desktop/mobile rendering, search, selection and save passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
