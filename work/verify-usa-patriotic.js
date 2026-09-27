const fs=require('fs'),path=require('path'),assert=require('assert/strict'),vm=require('vm');
const {chromium}=require('playwright'),sharp=require('sharp'),shelf=require('../collectible-shelf');
(async()=>{
 const ids=['usa-eagle','usa-liberty','usa-bell','usa-top-hat'];
 for(const id of ids){
  assert(shelf.items.some(i=>i.id===id&&i.category==='USA Patriotic'));
  assert(shelf.valid({enabled:true,theme:'crimson',slots:[id,'horse','crystal']}));
  const {data}=await sharp('assets/shelf-'+id+'.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.equal(data[3],0);
 }
 const source=fs.readFileSync('server.js','utf8');
 const catalog=source.slice(source.indexOf('const homeSceneIds'),source.indexOf('function homeSceneForSession'));
 assert.equal(vm.runInNewContext(catalog+';cleanHomeScene({id:"holiday-usa",frame:"usa-patriotic",motion:false}).frame'),'usa-patriotic');
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:900}});
  await page.route('http://art.local/**',r=>{
   const f=path.join(process.cwd(),new URL(r.request().url()).pathname);
   return fs.existsSync(f)?r.fulfill({body:fs.readFileSync(f),contentType:'image/png'}):r.fulfill({status:404,body:''});
  });
  const css=['styles.css','collectible-shelf.css','launchpad-scenes.css','scene-frame-fit.css'].map(f=>fs.readFileSync(f,'utf8').replace(/^\uFEFF/,'')).join('\n');
  await page.setContent('<base href="http://art.local/"><style>'+css+'body{background:#241821;color:white;padding:30px}h1{font:700 26px sans-serif;text-align:center}.gallery{display:flex;gap:70px;align-items:center;justify-content:center}.shelves{width:500px;padding-top:170px}.shelf-sample{margin-bottom:190px}.home-scene-feature{position:static;transform:none;display:flex;align-items:center}.school-photo{width:330px;height:330px}.launch-scene-settings{opacity:1;pointer-events:auto}main{width:340px}.shelf-sample:last-child{margin-bottom:0}@media(max-width:600px){.gallery{flex-direction:column}.shelves{width:300px}main{width:300px}.school-photo{width:260px;height:260px}}</style><h1>USA Patriotic Collection</h1><div class="gallery"><div class="shelves"><section class="shelf-sample">'+shelf.art({enabled:true,theme:'crimson',slots:ids.slice(0,3)})+'</section><section class="shelf-sample">'+shelf.art({enabled:true,theme:'crimson',slots:['none','usa-top-hat','none']})+'</section></div><main></main></div>');
  await page.addScriptTag({path:path.resolve('launchpad-scenes.js')});
  await page.addScriptTag({path:path.resolve('collectible-shelf.js')});
  for(const width of [1100,390]){
   await page.setViewportSize({width,height:900});
   await page.evaluate(()=>{
    const session={authenticated:true,homeScene:{id:'holiday-usa',frame:'usa-patriotic',motion:false}};
    document.querySelector('main').innerHTML=LaunchpadScenes.render(session,'');LaunchpadScenes.attach(session,'',()=>{});
   });
   await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
   await page.waitForTimeout(500);
   const bases=await page.locator('.shelf-object > svg').evaluateAll(ns=>ns.map(n=>+n.getAttribute('y')+ +n.getAttribute('height')));assert(bases.every(b=>Math.abs(b-346)<.01));
   assert.match(await page.locator('main .launch-scene').evaluate(e=>getComputedStyle(e).clipPath),/^polygon/);
   await page.screenshot({path:`work/usa-patriotic-${width}.png`,fullPage:true});
   await page.evaluate(()=>document.getElementById('chooseLaunchFrame').click());
   await page.locator('#launchChooserSearch').fill('Stars & Stripes');
   const card=page.locator('[data-frame-choice="usa-patriotic"]');assert(await card.isVisible());
   await card.click();assert.equal(await page.locator('#launchScenePreview [data-scene-frame="usa-patriotic"]').count(),1);
   await page.keyboard.press('Escape');
   await page.evaluate(()=>CollectibleShelf.open({selected:{enabled:true,theme:'crimson',slots:['none','none','none']},save:async v=>v,onSave:()=>{}}));
   await page.locator('#shelfCategory').selectOption('USA Patriotic');
   for(const id of ids){
    await page.locator('#shelfSearch').fill(shelf.items.find(i=>i.id===id).name);
    const item=page.locator('[data-shelf-item="'+id+'"]');assert(await item.isVisible());
    assert.equal(await item.locator('image').getAttribute('href'),'assets/shelf-'+id+'.png');await item.click();
   }
   await page.keyboard.press('Escape');
  }
  console.log('USA collection: server acceptance, transparency, shelf baselines, frame aperture, chooser search and selection passed at 1100px and 390px.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
