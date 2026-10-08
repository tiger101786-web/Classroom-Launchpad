const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1366,height:900}});
  await page.route('http://shelf.local/**',r=>r.fulfill({body:fs.readFileSync(path.join(process.cwd(),new URL(r.request().url()).pathname))}));
  const css=['styles.css','launchpad-scenes.css','collectible-shelf.css'].map(f=>fs.readFileSync(f,'utf8').replace(/^\uFEFF/,'')).join('\n');
  await page.setContent('<base href="http://shelf.local/"><style>'+css+'</style>');
  await page.addScriptTag({path:path.resolve('collectible-shelf.js')});
  await page.evaluate(()=>CollectibleShelf.open({selected:{enabled:true,theme:'crimson',slots:['goku','planet','controller']},save:async value=>{window.saved=value;return value},onSave:()=>{}}));
  const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))));
  await settle();
  for(let i=0;i<9;i++)await page.locator('#shelfNext').click();
  const anchor=await page.locator('[data-shelf-item]').first().getAttribute('data-shelf-item');
  for(const height of [668,900,668,900]){
   await page.setViewportSize({width:1366,height});await settle();
   assert.equal(await page.locator('[data-shelf-item="'+anchor+'"]').count(),1,'Keep leading object through capacity changes');
  }
  const focusId=await page.locator('[data-shelf-item]').last().getAttribute('data-shelf-item');
  await page.locator('[data-shelf-item="'+focusId+'"]').focus();
  for(const viewport of [{width:1366,height:668},{width:390,height:667},{width:1366,height:900}]){
   await page.setViewportSize(viewport);await settle();
   assert.equal(await page.evaluate(()=>document.activeElement.dataset.shelfItem),focusId,'Keep focused item visible and focused');
  }
  await page.evaluate(()=>{window.focusedCard=document.activeElement;window.events=0;window.watcher=new MutationObserver(()=>events++);watcher.observe(document.querySelector('#shelfChoices'),{childList:true});for(let i=0;i<10;i++)window.dispatchEvent(new Event('resize'));});
  await settle();
  assert.equal(await page.evaluate(()=>events),0,'No rebuild on redundant resize notifications');
  assert.ok(await page.evaluate(()=>focusedCard===document.activeElement && focusedCard.isConnected));
  // Very short viewports permit scrolling even with a single row of cards.
  await page.locator('.shelf-browse-area').evaluate(e=>e.style.height='80px');await settle();
  await page.locator('.shelf-browse-area').evaluate(e=>{e.scrollTop=25;window.savedScroll=e.scrollTop;});
  assert.ok(await page.evaluate(()=>savedScroll>0),'Exercise real overflowing content');
  await page.evaluate(()=>window.dispatchEvent(new Event('resize')));await settle();
  assert.equal(await page.locator('.shelf-browse-area').evaluate(e=>e.scrollTop),await page.evaluate(()=>savedScroll),'Keep scrolling on unchanged layout');
  await page.locator('.shelf-browse-area').evaluate(e=>e.style.removeProperty('height'));await settle();
  await page.locator('[data-shelf-item="'+focusId+'"]').click();
  await page.locator('#shelfStylesTab').click();await settle();
  for(let i=0;i<3;i++)await page.locator('#shelfNext').click();
  const themeId=await page.locator('[data-shelf-theme-choice]').last().getAttribute('data-shelf-theme-choice');
  await page.locator('[data-shelf-theme-choice="'+themeId+'"]').focus();
  await page.setViewportSize({width:390,height:667});await settle();
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.shelfThemeChoice),themeId);
  await page.locator('[data-shelf-theme-choice="'+themeId+'"]').click();
  await page.locator('#shelfObjectsTab').click();await settle();
  await page.locator('#shelfSearch').fill('windmill');await settle();
  assert.equal(await page.locator('#shelfPageStatus').textContent(),'Page 1 of 1','Intentional filtering still resets pagination');
  await page.setViewportSize({width:1366,height:900});await settle();
  assert.equal(await page.locator('#shelfSearch').inputValue(),'windmill');
  await page.locator('#saveShelf').click();
  assert.deepEqual(await page.evaluate(()=>saved),{enabled:true,theme:themeId,slots:[focusId,'planet','controller']});
  await page.setViewportSize({width:390,height:667});await settle();
  assert.equal(await page.locator('.shelf-dialog').count(),0,'Resize listeners cleaned up after save');
  console.log('PASS: deep-page anchor and keyboard focus survive desktop/mobile resizing; redundant events do not rebuild; style position, search and draft survive; save succeeds.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
