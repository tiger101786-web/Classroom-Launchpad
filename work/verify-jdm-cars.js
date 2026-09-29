const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require('playwright'),sharp=require('sharp'),shelf=require('../collectible-shelf');
(async()=>{
 const ids=['jdm-purple-green-supra','jdm-anime-supra','jdm-red-skyline','jdm-blue-skyline','jdm-black-red-nsx','jdm-neon-gtr'];
 const selections=[0,3].map(n=>({enabled:true,theme:'crimson',slots:ids.slice(n,n+3)}));
 for(const selection of selections){assert(shelf.valid(selection));assert.deepEqual(shelf.clean(selection),selection);}
 for(const id of ids){
  assert.equal(shelf.items.filter(i=>i.id===id).length,1);
  assert.equal(shelf.items.find(i=>i.id===id).category,'JDM Model Cars');
  const {data,info}=await sharp('assets/shelf-'+id+'.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.equal(data[3],0);assert(info.width>1000);
 }
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage();
  await page.route('http://art.local/**',r=>{
   const f=path.join(process.cwd(),new URL(r.request().url()).pathname);
   return fs.existsSync(f)?r.fulfill({body:fs.readFileSync(f),contentType:'image/png'}):r.fulfill({status:404,body:''});
  });
  await page.setContent('<base href="http://art.local/"><style>'+fs.readFileSync('collectible-shelf.css','utf8')+'body{margin:0;background:#241821;color:white;padding:20px;font-family:Arial}h1{text-align:center;font-size:24px}section{width:min(650px,100%);margin:90px auto 0}</style><h1>JDM Model Cars</h1>'+selections.map(s=>'<section>'+shelf.art(s)+'</section>').join(''));
  await page.addScriptTag({path:path.resolve('collectible-shelf.js')});
  for(const width of [900,390]){
   await page.setViewportSize({width,height:750});
   await page.evaluate(async()=>{await Promise.all([...document.querySelectorAll('image')].map(i=>new Promise((ok,bad)=>{const img=new Image();img.onload=ok;img.onerror=bad;img.src=i.getAttribute('href');})));});
   const bases=await page.locator('.shelf-object > svg').evaluateAll(ns=>ns.map(n=>+n.getAttribute('y')+ +n.getAttribute('height')));assert(bases.every(b=>Math.abs(b-346)<.01));
   const rects=await page.locator('.shelf-object > svg').evaluateAll(ns=>ns.map(n=>{const r=n.parentElement.getBoundingClientRect(),s=r.width/220,l=r.left+Number(n.getAttribute('x'))*s;return {l,r:l+Number(n.getAttribute('width'))*s};}));
   for(const n of [0,3])assert(rects[n].r<rects[n+1].l&&rects[n+1].r<rects[n+2].l);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.screenshot({path:`work/jdm-cars-${width}.png`,fullPage:true});
   for(const selection of selections){
    await page.evaluate(selected=>{window.savedShelf=null;CollectibleShelf.open({selected,save:async v=>{window.savedShelf=v;return v;},onSave:()=>{}})},selection);
    await page.locator('#shelfCategory').selectOption('JDM Model Cars');
    const names=[];
    do {
     names.push(...await page.locator('[data-shelf-item] strong').allTextContents());
     if(await page.locator('#shelfNext').isDisabled())break;
     await page.locator('#shelfNext').click();
    }while(true);
    assert.equal(names.length,6);assert.deepEqual(names,[...names].sort((a,b)=>a.localeCompare(b)));
    for(const [slot,id] of selection.slots.entries()){
     await page.locator('#shelfPreview [data-shelf-slot="'+slot+'"]').click();
     await page.locator('#shelfSearch').fill(shelf.items.find(i=>i.id===id).name);
     const card=page.locator('[data-shelf-item="'+id+'"]');assert(await card.isVisible());
     const dimensions=await card.locator('.shelf-car-thumbnail').evaluate(e=>{const r=e.getBoundingClientRect(),v=e.viewBox.baseVal;return {width:Math.min(r.width,r.height*v.width/v.height),height:Math.min(r.height,r.width*v.height/v.width),card:e.parentElement.getBoundingClientRect().toJSON(),rect:r.toJSON()};});
     assert(dimensions.width>75,'Car thumbnail should use its card width');
     assert(dimensions.rect.top>=dimensions.card.top&&dimensions.rect.bottom<=dimensions.card.bottom,'Car thumbnail stays inside card');
     assert.equal(await card.locator('image').getAttribute('href'),'assets/shelf-'+id+'.png');await card.click();
    }
    await page.screenshot({path:`work/jdm-chooser-${width}.png`});
    await page.locator('#saveShelf').click();
    assert.deepEqual(await page.evaluate(()=>window.savedShelf),selection);
   }
  }
  console.log('All six JDM models passed alpha, catalog, saved selection, search/category, alphabetical order, shelf baseline, non-overlap and mobile/desktop checks.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
