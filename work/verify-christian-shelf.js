const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),sharp=require('sharp'),shelf=require('../collectible-shelf');
const ids=['open-bible','praying-hands','peace-dove','holy-family','good-shepherd'];
(async()=>{
 for(const id of ids){
  assert(shelf.items.some(i=>i.id===id&&i.category==='Christian Faith'));
  assert(shelf.valid({enabled:true,theme:'crimson',slots:[id,'cross','church']}));
  const {data}=await sharp('assets/shelf-'+id+'.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert(data[3]<=1,'Exterior must be transparent (allowing negligible alpha rounding)');
 }
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:520}});
  await page.route('http://art.local/**',r=>r.fulfill({body:fs.readFileSync(path.join(process.cwd(),new URL(r.request().url()).pathname)),contentType:'image/png'}));
  const css=fs.readFileSync('collectible-shelf.css','utf8');
  await page.setContent('<base href="http://art.local/"><style>'+css+'body{background:#241821;color:white;padding:90px 30px;display:flex;gap:50px}section{width:460px}</style>'+[ids.slice(0,3),[ids[3],ids[4],'cross']].map(slots=>'<section>'+shelf.art({enabled:true,theme:'crimson',slots})+'</section>').join(''));
  const bases=await page.locator('.shelf-object > svg').evaluateAll(nodes=>nodes.map(n=>+n.getAttribute('y')+ +n.getAttribute('height')));
  assert(bases.every(b=>Math.abs(b-346)<.01));
  await page.waitForTimeout(700);
  await page.screenshot({path:'work/christian-shelf-preview.png'});
  await page.addScriptTag({path:path.resolve('collectible-shelf.js')});
  await page.evaluate(()=>CollectibleShelf.open({selected:{enabled:true,theme:'crimson',slots:['none','none','none']},save:async v=>v,onSave:()=>{}}));
  await page.locator('#shelfCategory').selectOption('Christian Faith');
  for(const id of ids){
   await page.locator('#shelfSearch').fill(shelf.items.find(i=>i.id===id).name);
   const card=page.locator('[data-shelf-item="'+id+'"]');
   assert.equal(await card.locator('image').getAttribute('href'),'assets/shelf-'+id+'.png');
   await card.click();
  }
  console.log('Five Christian collectibles: validation, transparency, aligned bases, category search and selection passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
