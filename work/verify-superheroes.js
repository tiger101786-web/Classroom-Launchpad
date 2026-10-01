const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require('playwright'),sharp=require('sharp'),shelf=require('../collectible-shelf');
(async()=>{
 const ids=["superhero-winter-soldier-bust","superhero-iron-man-bust","superhero-black-widow-bust","superhero-captain-america-bust","superhero-juggernaut-bust","superhero-sabretooth-bust","superhero-spider-man-bust","superhero-wolverine-bust","superhero-loki-bust","superhero-hulk-bust","superhero-thor-bust"];
 const assetPath=id=>'assets/shelf-'+id+(['superhero-loki-bust','superhero-hulk-bust','superhero-thor-bust','superhero-juggernaut-bust'].includes(id)?'-v2':'')+'.png';
 const selections=Array.from({length:4},(_,n)=>({enabled:true,theme:'crimson',slots:Array.from({length:3},(_,slot)=>ids[(n*3+slot)%ids.length])}));
 selections.push({enabled:true,theme:'crimson',slots:['superhero-iron-man-bust','superhero-sabretooth-bust','superhero-thor-bust']});
 selections.push({enabled:true,theme:'crimson',slots:['superhero-juggernaut-bust','superhero-juggernaut-bust','superhero-juggernaut-bust']});
 assert(!shelf.items.some(i=>i.id==='superhero-falcon-bust'));
 assert.deepEqual(shelf.clean({enabled:true,theme:'crimson',slots:['superhero-falcon-bust','superhero-loki-bust','superhero-winter-soldier-bust']}).slots,['none','superhero-loki-bust','superhero-winter-soldier-bust']);
 for(const selection of selections){assert(shelf.valid(selection));assert.deepEqual(shelf.clean(selection),selection);}
 for(const id of ids){
  assert.equal(shelf.items.filter(i=>i.id===id).length,1);
  assert.equal(shelf.items.find(i=>i.id===id).category,'Superheroes');
  const {data,info}=await sharp(assetPath(id)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  if(!['superhero-hulk-bust','superhero-thor-bust','superhero-juggernaut-bust'].includes(id))assert.equal(data[3],0);assert(info.width>=375);
 }
 assert.equal(shelf.items.filter(i=>i.category==='Superheroes').length,11);
 assert.equal(shelf.items.filter(i=>i.category==='Disney').length,25);
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage();
  await page.route('http://art.local/**',r=>{
   const f=path.join(process.cwd(),new URL(r.request().url()).pathname);
   return fs.existsSync(f)?r.fulfill({body:fs.readFileSync(f),contentType:'image/png'}):r.fulfill({status:404,body:''});
  });
  await page.setContent('<base href="http://art.local/"><style>'+fs.readFileSync('collectible-shelf.css','utf8')+'body{margin:0;background:#241821;color:white;padding:20px;font-family:Arial}h1{text-align:center;font-size:24px}section{width:min(650px,100%);margin:90px auto 0}</style><h1>Superheroes</h1>'+selections.map(s=>'<section>'+shelf.art(s)+'</section>').join(''));
  await page.addScriptTag({path:path.resolve('collectible-shelf.js')});
  for(const width of [900,390]){
   await page.setViewportSize({width,height:750});
   await page.evaluate(async()=>{await Promise.all([...document.querySelectorAll('image')].map(i=>new Promise((ok,bad)=>{const img=new Image();img.onload=ok;img.onerror=bad;img.src=i.getAttribute('href');})));});
   const bases=await page.locator('.shelf-object > svg').evaluateAll(ns=>ns.map(n=>+n.getAttribute('y')+ +n.getAttribute('height')));assert(bases.every(b=>Math.abs(b-346)<.01));
   const rects=await page.locator('.shelf-object > svg').evaluateAll(ns=>ns.map(n=>{const r=n.parentElement.getBoundingClientRect(),s=r.width/220,l=r.left+Number(n.getAttribute('x'))*s;return {l,r:l+Number(n.getAttribute('width'))*s};}));
   for(let n=0;n<rects.length;n+=3)assert(rects[n].r<rects[n+1].l&&rects[n+1].r<rects[n+2].l);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.screenshot({path:`work/superheroes-shelf-${width}.png`,fullPage:true});
   for(const selection of selections){
    await page.evaluate(selected=>{window.savedShelf=null;CollectibleShelf.open({selected,save:async v=>{window.savedShelf=v;return v;},onSave:()=>{}})},selection);
    await page.locator('#shelfCategory').selectOption('Superheroes');
    const names=[];
    do {
     names.push(...await page.locator('[data-shelf-item] strong').allTextContents());
     if(await page.locator('#shelfNext').isDisabled())break;
     await page.locator('#shelfNext').click();
    }while(true);
    assert.equal(names.length,11);assert.deepEqual(names,[...names].sort((a,b)=>a.localeCompare(b)));
    for(const [slot,id] of selection.slots.entries()){
     await page.locator('#shelfPreview [data-shelf-slot="'+slot+'"]').click();
     await page.locator('#shelfSearch').fill(shelf.items.find(i=>i.id===id).name);
     const card=page.locator('[data-shelf-item="'+id+'"]');assert(await card.isVisible());
     assert.equal(await card.locator('image').getAttribute('href'),assetPath(id));await card.click();
    }
    await page.screenshot({path:`work/superheroes-chooser-${width}.png`});
    await page.locator('#saveShelf').click();
    assert.deepEqual(await page.evaluate(()=>window.savedShelf),selection);
   }
  }
  console.log('All eleven Superheroes passed asset, catalog, save, search/category, alphabetical order, baseline, non-overlap and desktop/mobile checks.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
