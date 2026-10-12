const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 const page=await browser.newPage();
 await page.route('https://refresh.test/**',r=>{const p=new URL(r.request().url()).pathname;return p==='/'?r.fulfill({contentType:'text/html',body:'<body><main id="app"></main></body>'}):r.fulfill({path:path.join(root,p.slice(1))});});
 await page.goto('https://refresh.test/');
 for(const f of ['styles.css','launchpad-scenes.css','collectible-shelf.css'])await page.addStyleTag({path:path.join(root,f)});
 for(const f of ['collectible-shelf.js','launchpad-scenes.js'])await page.addScriptTag({path:path.join(root,f)});
 const appSource=fs.readFileSync(path.join(root,'app.js'),'utf8');
 await page.addScriptTag({content:appSource.slice(appSource.indexOf('function isEditingForm()'),appSource.indexOf('function sharedSnapshot()'))});
 for(const width of [1200,390])for(const side of ['left','right']){
 await page.setViewportSize({width,height:950});
 await page.evaluate(side=>{
  window.session={authenticated:true,homeScene:{id:'needoh',frame:'match-needoh',motion:false}};
  document.querySelector('#app').innerHTML=LaunchpadScenes.render(session,'');
  LaunchpadScenes.attach(session,'',()=>{});
  CollectibleShelf.open({side,selected:{enabled:true,theme:'needoh',slots:['none','none','none']},save:async v=>window.saved=v,onSave:()=>{}});
 },side);
 await page.locator('#shelfSearch').fill('Hatsune');
 await page.locator('[data-shelf-item="hatsune-miku-statue"]').click();
 const editingGuard=await page.evaluate(()=>isEditingForm());
 const identity=await page.locator('.shelf-dialog').elementHandle();
 // Repeat the render/attach portion of a background refresh, even if a caller
 // bypasses the editing guard. It must not remove a dialog owned by the shelf.
 for(let i=0;i<3;i++)await page.evaluate(()=>{
  document.querySelector('#app').innerHTML=LaunchpadScenes.render(session,'');
  LaunchpadScenes.attach(session,'',()=>{});
 });
 assert(await identity.evaluate(e=>e.isConnected&&e.open),'same picker survives refresh');
 assert(editingGuard,'background sync must recognize the open shelf editor even when a card is focused');
 assert.equal(await page.locator('#shelfSearch').inputValue(),'Hatsune');
 assert.equal(await page.locator('[data-shelf-item="hatsune-miku-statue"]').getAttribute('aria-pressed'),'true');
 await page.locator('#saveShelf').click();
 assert.equal((await page.evaluate(()=>saved)).slots[0],'hatsune-miku-statue');
 assert.equal(await page.locator('.shelf-dialog').count(),0);
 assert.equal(await page.evaluate(()=>isEditingForm()),false);
 }
 await page.evaluate(()=>CollectibleShelf.open({selected:{enabled:true,slots:['none','none','none']},save:async()=>{},onSave:()=>{}}));
 await page.keyboard.press('Escape');assert.equal(await page.locator('.shelf-dialog').count(),0);
 console.log('PASS: left/right picker survives repeated homepage refreshes at desktop/mobile widths; search, selection and save preserved; background guard and Escape close work.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
