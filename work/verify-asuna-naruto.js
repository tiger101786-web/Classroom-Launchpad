const fs=require('fs'),path=require('path'),os=require('os'),assert=require('assert/strict');
const {chromium}=require('playwright');
const shelf=require('../collectible-shelf');
(async()=>{
 const id='anime-asuna-knight-bust';
 assert.equal(shelf.items.find(i=>i.id===id).category,'Anime');
 assert.equal(shelf.clean({enabled:true,slots:[id,'none','none']}).slots[0],id);
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage();
  await page.route('http://shelf.test/assets/**',r=>r.fulfill({body:fs.readFileSync(path.join(process.cwd(),new URL(r.request().url()).pathname)),contentType:'image/png'}));
  await page.setContent('<base href="http://shelf.test/"><style>'+['styles.css','launchpad-scenes.css','collectible-shelf.css'].map(f=>fs.readFileSync(f,'utf8')).join('\n')+'</style>');
  await page.addScriptTag({path:path.resolve('collectible-shelf.js')});
  for(const width of [1100,390]){
   await page.setViewportSize({width,height:900});
   await page.evaluate(()=>CollectibleShelf.open({selected:{enabled:true,slots:['anime-naruto-six-paths-statue','anime-asuna-knight-bust','none']},save:async v=>{window.saved=v;},onSave:()=>{}}));
   await page.locator('#shelfCategory').selectOption('Anime');
   for(const [term,id] of [['Asuna','anime-asuna-knight-bust'],['Naruto Six','anime-naruto-six-paths-statue']]){
    await page.locator('#shelfSearch').fill(term);
    const tile=page.locator('[data-shelf-item="'+id+'"]');
    assert.equal(await tile.count(),1);
    await tile.locator('img').evaluate(i=>i.decode());
    await tile.screenshot({path:path.join(os.tmpdir(),id+'-'+width+'.png')});
   }
   await page.locator('#shelfPreview').screenshot({path:path.join(os.tmpdir(),'asuna-naruto-shelf-'+width+'.png')});
   await page.locator('#saveShelf').click();
   await page.waitForFunction(()=>window.saved?.slots.includes('anime-asuna-knight-bust'));
  }
  console.log('PASS: Anime catalog, server-shared validation, desktop/mobile previews, search and save.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
