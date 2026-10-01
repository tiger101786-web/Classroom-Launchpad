const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),sharp=require('sharp'),shelf=require('../collectible-shelf');
(async()=>{
 const state={enabled:true,theme:'disney-castle',slots:['disney-belle-bust','disney-genie-bust','disney-rapunzel-bust']};
 assert(shelf.valid(state));assert.deepEqual(shelf.clean(state),state);
 const {data,info}=await sharp('assets/collectible-shelf-disney-castle.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});
 assert.equal(data[3],0);assert.equal(info.width,1445);
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  for(const width of [1100,390]){
   const page=await browser.newPage({viewport:{width,height:800}});
   await page.route('http://art.local/**',r=>r.fulfill({body:fs.readFileSync(path.join(process.cwd(),new URL(r.request().url()).pathname)),contentType:'image/png'}));
   await page.setContent('<base href="http://art.local/"><style>'+fs.readFileSync('collectible-shelf.css','utf8')+'body{background:#241821;color:white;margin:0;padding:100px 20px}section{width:min(100%,550px);margin:auto}</style><section>'+shelf.art(state)+'</section>');
   assert.match(await page.locator('.shelf-board').evaluate(e=>getComputedStyle(e).backgroundImage),/collectible-shelf-disney-castle.png/);
   await page.evaluate(async()=>{await Promise.all([...document.querySelectorAll('image')].map(i=>new Promise((ok,bad)=>{const im=new Image();im.onload=ok;im.onerror=bad;im.src=i.getAttribute('href')})));const im=new Image();im.src='assets/collectible-shelf-disney-castle.png';await im.decode();});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   const bases=await page.locator('.shelf-object > svg').evaluateAll(ns=>ns.map(n=>{const s=n.closest('.collectible-shelf').getBoundingClientRect(),r=n.parentElement.getBoundingClientRect();return(r.top+(Number(n.getAttribute('y'))+Number(n.getAttribute('height')))*r.width/220-s.top)/s.height;}));
   assert(bases.every(y=>y>.5294&&y<.5824),'Bases should rest on tabletop');
   await page.screenshot({path:'work/disney-castle-shelf-'+width+'.png'});
   await page.addScriptTag({path:path.resolve('collectible-shelf.js')});
   await page.evaluate(selected=>CollectibleShelf.open({selected:{...selected,theme:'crimson'},save:async v=>{window.savedShelf=v;return v},onSave:()=>{}}),state);
   await page.locator('#shelfStylesTab').click();await page.locator('#shelfSearch').fill('Disney');
   await page.locator('[data-shelf-theme-choice="disney-castle"]').click();
   assert.equal(await page.locator('#shelfPreview [data-shelf-theme="disney-castle"]').count(),1);
   await page.screenshot({path:'work/disney-castle-chooser-'+width+'.png'});
   await page.locator('#saveShelf').click();
   assert.deepEqual(await page.evaluate(()=>window.savedShelf),state);
   await page.close();
  }
  console.log('Disney castle: alpha, validation, tabletop alignment, desktop/mobile rendering, search, selection and save passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
