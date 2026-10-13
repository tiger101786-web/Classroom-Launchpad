const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),shelf=require('../collectible-shelf');
const output=path.resolve(process.env.TEMP,'launchpad-anime-shelves');
const sets=[
 ['blue-lock','soccer-training-complex',['blue-lock-kaiser','blue-lock-reo','blue-lock-hiori']],
 ['bleach','bleach-soul-society',['bleach-kenpachi','bleach-byakuya','jjk-nanami']],
 ['pokemon','pokemon-center-gardens',['pikachu','eevee','pokemon-mew-statue']]
];
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 for(const id of ['blue-lock-reo','blue-lock-barou','blue-lock-hiori','blue-lock-kaiser','jjk-nanami']){
  assert.equal(shelf.items.filter(i=>i.id===id).length,1);
  assert.equal(shelf.items.find(i=>i.id===id).category,'Anime');
 }
 for(const [theme] of sets)assert((await sharp(path.join(root,'assets','collectible-shelf-'+theme+'.png')).metadata()).hasAlpha);
 const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
 assert(server.includes('homeSceneIds.add("bleach-soul-society")'));
 assert(server.includes('homeSceneFrameIds.add("match-bleach-soul-society")'));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(r.url()));
  await page.route('https://test.local/**',r=>{const p=new URL(r.request().url()).pathname;return p==='/'?r.fulfill({contentType:'text/html',body:'<html><body data-theme="night"><main></main></body></html>'}):r.fulfill({path:path.join(root,p.slice(1))});});
  await page.goto('https://test.local/');
  for(const f of ['styles.css','launchpad-scenes.css','scene-frame-fit.css','scene-matched-frames.css','scene-exterior-frames.css','collectible-shelf.css'])await page.addStyleTag({path:path.join(root,f)});
  for(const f of ['launchpad-scenes.js','collectible-shelf.js'])await page.addScriptTag({path:path.join(root,f)});
  await page.addStyleTag({content:'main{padding:45px;display:flex;flex-wrap:wrap;gap:65px;justify-content:center}.demo-shelf{width:300px;padding-top:90px}.home-scene-feature{width:260px!important}.launch-scene-stage{width:240px!important;height:240px!important}.launch-scene-stage>.school-photo{width:240px!important;height:240px!important;min-width:0!important;margin:0!important}'});
  for(const width of [1200,390]){
   await page.setViewportSize({width,height:950});
   for(const [theme,scene,slots] of sets){
    const selected={enabled:true,theme,slots};assert(shelf.valid(selected));
    await page.evaluate(({scene,selected})=>document.querySelector('main').innerHTML=LaunchpadScenes.render({authenticated:true,homeScene:{id:scene,frame:'match-'+scene,motion:true}},'')+'<div class="demo-shelf">'+CollectibleShelf.art(selected)+'</div>',{scene,selected});
    await page.locator('.launch-scene').scrollIntoViewIfNeeded();
    await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
    await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth));
    await page.waitForTimeout(150);
    const board=page.locator('.shelf-board');
    assert((await board.evaluate(e=>getComputedStyle(e).backgroundImage)).includes('collectible-shelf-'+theme+'.png'));
    await page.evaluate(async()=>{const url=getComputedStyle(document.querySelector('.shelf-board')).backgroundImage.slice(5,-2);const i=new Image();i.src=url;await i.decode();});
    if(theme==='bleach')assert(await page.locator('.scene-frame-exterior').evaluate(e=>+getComputedStyle(e).zIndex<+getComputedStyle(e.parentElement.querySelector('.launch-scene')).zIndex));
    await page.screenshot({path:path.join(output,theme+'-'+width+'.png'),fullPage:true});
    await page.evaluate(selected=>CollectibleShelf.open({selected,save:async v=>window.saved=v,onSave:()=>{}}),selected);
    for(const id of ['blue-lock-kaiser','jjk-nanami']){
     await page.locator('#shelfCategory').selectOption('Anime');await page.locator('#shelfSearch').fill(shelf.items.find(i=>i.id===id).name);
     const card=page.locator('[data-shelf-item="'+id+'"]');await card.click();
     assert(await card.evaluate(el=>{const c=el.getBoundingClientRect(),a=el.querySelector('.shelf-object > div').getBoundingClientRect();return a.left>=c.left&&a.right<=c.right&&a.top>=c.top&&a.bottom<=c.bottom;}));
    }
    await page.locator('#shelfStylesTab').click();await page.locator('#shelfSearch').fill(shelf.themes.find(t=>t.id===theme).name);
    await page.locator('[data-shelf-theme-choice="'+theme+'"]').click();
    await page.locator('#saveShelf').click();
    const saved=await page.evaluate(()=>window.saved);assert.equal(saved.theme,theme);assert.equal(saved.slots[0],'jjk-nanami');
   }
  }
  assert.deepEqual(errors,[]);console.log('PASS: three themed shelves, existing matching sets, Bleach scene/frame, both new statues, no duplicates, desktop/mobile selection and saving. Previews: '+output);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
