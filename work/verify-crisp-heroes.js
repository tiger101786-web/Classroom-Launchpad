const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{chromium}=require('playwright'),shelf=require('../collectible-shelf');
const ids=shelf.items.filter(i=>['Anime','Superheroes'].includes(i.category)||i.id==='peace-sign-girl').map(i=>i.id);
(async()=>{
assert.equal(shelf.items.filter(i=>i.id==='all-might').length,1);
assert.match(shelf.art({enabled:true,theme:'crimson',slots:['all-might','none','none']}),/shelf-all-might-v2\.png/);

const selections=ids.map(id=>({enabled:true,theme:'crimson',slots:[id,id,id]}));
for(const s of selections){assert(shelf.valid(s));assert.deepEqual(shelf.clean(s),s);}
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
try{
const page=await browser.newPage();
await page.route('http://art.local/**',r=>{const f=path.join(process.cwd(),new URL(r.request().url()).pathname);return fs.existsSync(f)?r.fulfill({body:fs.readFileSync(f),contentType:'image/png'}):r.fulfill({status:404,body:''});});
await page.setContent('<base href="http://art.local/"><style>'+fs.readFileSync('collectible-shelf.css','utf8')+'body{margin:0;background:#241821;color:white;padding:20px;font-family:Arial}section{width:min(350px,100%);margin:110px auto 0}h2{font-size:14px}</style>'+selections.map(s=>'<section><h2>'+s.slots[0]+'</h2>'+shelf.art(s)+'</section>').join(''));
await page.addScriptTag({path:path.resolve('collectible-shelf.js')});
for(const width of [900,390]){
await page.setViewportSize({width,height:900});
await page.evaluate(async()=>{await Promise.all([...document.querySelectorAll('image')].map(i=>new Promise((ok,bad)=>{const img=new Image();img.onload=ok;img.onerror=bad;img.src=i.getAttribute('href');})));});
await page.locator('.shelf-direct-image img').evaluateAll(ns=>Promise.all(ns.map(n=>n.decode())));
assert.equal(await page.locator('.shelf-direct-image img').count(),ids.length*3);
const boxes=await page.locator('.shelf-object > div').evaluateAll(ns=>ns.map(n=>{const p=n.parentElement.getBoundingClientRect(),r=n.getBoundingClientRect();return {l:r.left,r:r.right,base:(r.bottom-p.top)/p.height*350};}));
assert(boxes.every(b=>Math.abs(b.base-346)<.2));
// Superman intentionally has a wider cape; other figures must not overlap.
// Compare against the previous renderer, including intentionally oversized statues.
const previousSource=require('child_process').execFileSync('git',['show','HEAD:collectible-shelf.js'],{encoding:'utf8'});
const sandbox={module:{exports:{}}};require('vm').runInNewContext(previousSource,sandbox);
const previous=sandbox.module.exports;
const currentWidths=await page.locator('section').evaluateAll(ns=>ns.map(n=>n.scrollWidth));
for(let i=0;i<selections.length;i++){
 const section=page.locator('section').nth(i);
 const current=await section.innerHTML();
 await section.evaluate((n,html)=>n.innerHTML=html,previous.art(selections[i]));
 const oldWidth=await section.evaluate(n=>n.scrollWidth);
 if(ids[i]!=='superhero-superman-statue')assert(currentWidths[i]<=oldWidth+1,'No new overflow: '+ids[i]);
 await section.evaluate((n,html)=>n.innerHTML=html,current);
}
assert.equal(await page.locator('[aria-label="Tenya Iida Statue"]').first().evaluate(n=>getComputedStyle(n).filter),'none');
await page.locator('section').filter({has:page.locator('[aria-label="Peace Sign Girl Statue"]')}).screenshot({path:'work/peace-sign-'+width+'.png'});
await page.evaluate(selected=>CollectibleShelf.open({selected,save:async value=>{window.saved=value;return value;},onSave:()=>{}}),selections[0]);

for(const id of ids){
await page.locator('#shelfCategory').selectOption(shelf.items.find(i=>i.id===id).category);
await page.locator('#shelfSearch').fill(shelf.items.find(i=>i.id===id).name);
assert(await page.locator('[data-shelf-item="'+id+'"]').isVisible());
await page.locator('[data-shelf-item="'+id+'"]').click();
}
await page.locator('#saveShelf').click();
assert.equal((await page.evaluate(()=>window.saved)).slots[0],ids[ids.length-1]);
}
console.log('Direct image statues passed category, image loading, save, alignment and desktop/mobile checks.');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
