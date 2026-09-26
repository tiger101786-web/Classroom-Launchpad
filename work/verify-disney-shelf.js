const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),sharp=require('sharp'),shelf=require('../collectible-shelf');
(async()=>{
 const id='enchanted-rose';
 assert(shelf.items.some(i=>i.id===id&&i.category==='Disney'));
 assert(shelf.valid({enabled:true,theme:'crimson',slots:[id,'itachi','highland-cow']}));
 const {data}=await sharp('assets/shelf-'+id+'.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});
 assert.equal(data[3],0);
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:650,height:520}});
  await page.route('http://art.local/**',r=>r.fulfill({body:fs.readFileSync(path.join(process.cwd(),new URL(r.request().url()).pathname)),contentType:'image/png'}));
  await page.setContent('<base href="http://art.local/"><style>'+fs.readFileSync('collectible-shelf.css','utf8')+'body{background:#241821;color:white;padding:90px 50px}section{width:460px}</style><section>'+shelf.art({enabled:true,theme:'crimson',slots:[id,'itachi','highland-cow']})+'</section>');
  const bases=await page.locator('.shelf-object > svg').evaluateAll(nodes=>nodes.map(n=>+n.getAttribute('y')+ +n.getAttribute('height')));
  assert(bases.every(b=>Math.abs(b-346)<.01));
  await page.waitForTimeout(700);
  await page.screenshot({path:'work/disney-shelf-preview.png'});
  await page.addScriptTag({path:path.resolve('collectible-shelf.js')});
  await page.evaluate(()=>CollectibleShelf.open({selected:{enabled:true,theme:'crimson',slots:['none','none','none']},save:async v=>v,onSave:()=>{}}));
  await page.locator('#shelfCategory').selectOption('Disney');
  await page.locator('#shelfSearch').fill('Enchanted Rose');
  const card=page.locator('[data-shelf-item="enchanted-rose"]');
  assert.equal(await card.locator('image').getAttribute('href'),'assets/shelf-enchanted-rose.png');
  await card.click();
  console.log('Enchanted rose: validation, transparency, aligned bases, category search and selection passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
