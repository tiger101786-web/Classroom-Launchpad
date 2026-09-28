const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require('playwright'),sharp=require('sharp'),shelf=require('../collectible-shelf');
(async()=>{
 const ids=['six-seven'];
 const selection={enabled:true,theme:'christian',slots:['six-seven','six-seven','six-seven']};
 assert(shelf.valid(selection));assert.deepEqual(shelf.clean(selection),selection);
 for(const id of ids){
  assert.equal(shelf.items.find(i=>i.id===id).category,'Display Pieces');
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
  await page.setContent('<base href="http://art.local/"><style>'+fs.readFileSync('collectible-shelf.css','utf8').replace(/^\uFEFF/,'')+'body{margin:0;background:#241821;color:white;padding:40px 20px;font-family:Arial}h1{text-align:center;font-size:24px}section{width:min(650px,100%);margin:240px auto 0}</style><h1>67 Hands Statue</h1><section>'+shelf.art(selection)+'</section>');
  await page.addScriptTag({path:path.resolve('collectible-shelf.js')});
  for(const width of [900,390]){
   await page.setViewportSize({width,height:700});
   await page.evaluate(async()=>{await Promise.all([...document.querySelectorAll('image')].map(i=>new Promise((ok,bad)=>{const img=new Image();img.onload=ok;img.onerror=bad;img.src=i.getAttribute('href');})));});
   const bases=await page.locator('.shelf-object > svg').evaluateAll(ns=>ns.map(n=>+n.getAttribute('y')+ +n.getAttribute('height')));assert(bases.every(b=>Math.abs(b-346)<.01));
   const rects=await page.locator('.shelf-object > svg').evaluateAll(ns=>ns.map(n=>{const r=n.parentElement.getBoundingClientRect(),s=r.width/220,l=r.left+Number(n.getAttribute('x'))*s;return {l,r:l+Number(n.getAttribute('width'))*s};}));
   assert(rects[0].r<rects[1].l&&rects[1].r<rects[2].l);
   await page.screenshot({path:`work/six-seven-${width}.png`});
   await page.evaluate(selected=>CollectibleShelf.open({selected,save:async v=>v,onSave:()=>{}}),selection);
   for(const id of ids){
    await page.locator('#shelfCategory').selectOption('Display Pieces');
    await page.locator('#shelfSearch').fill(shelf.items.find(i=>i.id===id).name);
    const card=page.locator('[data-shelf-item="'+id+'"]');assert(await card.isVisible());
    assert.equal(await card.locator('image').getAttribute('href'),'assets/shelf-'+id+'.png');await card.click();
   }
   await page.keyboard.press('Escape');
  }
  console.log('67 statue pass saved-selection validation, transparent asset checks, shelf baseline/non-overlap and category/search/selection at desktop and mobile widths.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
