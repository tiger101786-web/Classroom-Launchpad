const fs=require('fs'),assert=require('assert/strict'),{chromium}=require('playwright');
(async()=>{
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
try{
for(const width of [390,1200])for(const kind of ['scene','frame']){
 const page=await browser.newPage({viewport:{width,height:900}});
 await page.setContent('<style>'+fs.readFileSync('styles.css','utf8').replace(/^\uFEFF/,'')+fs.readFileSync('launchpad-scenes.css','utf8')+'</style><body data-theme="night"></body>');
 await page.addScriptTag({path:require('path').resolve('launchpad-scenes.js')});
 await page.evaluate(kind=>{
 const session={authenticated:true,homeScene:{id:'original',frame:'none',motion:false}};
 document.body.innerHTML=LaunchpadScenes.render(session,'');
 LaunchpadScenes.attach(session,'',()=>{});
 document.getElementById(kind==='scene'?'chooseLaunchScene':'chooseLaunchFrame').click();
 },kind);
 const cards=page.locator('[data-'+kind+'-choice]');
 const visible=page.locator('[data-'+kind+'-choice]:visible');
 assert.equal(await visible.count(),8);
 await page.locator('[data-chooser-page="1"]').click();
 const selected=visible.first();const id=await selected.getAttribute('data-'+kind+'-choice');await selected.click();
 await page.locator('[data-chooser-page="-1"]').click();
 await page.locator('[data-chooser-page="1"]').click();
 assert.equal(await page.locator('[data-'+kind+'-choice="'+id+'"]').getAttribute('aria-pressed'),'true');
 const name=await selected.locator('strong').textContent();
 await page.locator('#launchChooserSearch').fill(name);
 assert((await visible.count())>=1&&(await visible.count())<=8);
 assert(await page.locator('.launch-chooser-pages').textContent().then(t=>t.includes('Page 1')));
 await page.locator('#launchChooserSearch').fill('zzzz-no-results');assert.equal(await visible.count(),0);assert.equal(await page.locator('.launch-chooser-pages').isVisible(),false);
 await page.locator('[data-clear-search]').click();assert.equal(await visible.count(),8);
 const ids=[];
 while(true){ids.push(...await visible.evaluateAll(ns=>ns.map(n=>n.getAttribute('data-scene-choice')||n.getAttribute('data-frame-choice'))));const next=page.locator('[data-chooser-page="1"]');if(await next.isDisabled())break;await next.click();}
 assert.equal(new Set(ids).size,await cards.count());assert.equal(ids.length,await cards.count());
 await page.close();
}
console.log('Scenes and scene frames: 8 per page; all items reachable; search, empty results, clearing, selection persistence and page boundaries pass at mobile/desktop widths.');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
