const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{chromium}=require('playwright'),shelf=require('../collectible-shelf');
const ids=["anime-pain-statue","anime-levi-statue","anime-guts-statue","anime-orochimaru-statue","anime-light-yagami-statue","anime-naruto-six-paths-statue","anime-sasuke-susanoo-statue","anime-naruto-kurama-statue","anime-iida-statue"];
(async()=>{
assert.equal(shelf.items.filter(i=>i.id==='all-might').length,1);
assert.match(shelf.art({enabled:true,theme:'crimson',slots:['all-might','none','none']}),/shelf-all-might-v2\.png/);
for(const id of ids)assert.equal(shelf.items.find(i=>i.id===id).category,'Anime');
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
const boxes=await page.locator('.shelf-object > svg').evaluateAll(ns=>ns.map(n=>{const r=n.parentElement.getBoundingClientRect(),s=r.width/220,l=r.left+Number(n.getAttribute('x'))*s;return {l,r:l+Number(n.getAttribute('width'))*s,base:+n.getAttribute('y')+ +n.getAttribute('height'),h:+n.getAttribute('height')};}));
assert(boxes.every(b=>Math.abs(b.base-346)<.01));
// Superman intentionally has a wider cape; other figures must not overlap.
for(let i=0;i<boxes.length;i+=3)if(ids[i/3]!=='superhero-superman-statue')assert(boxes[i].r<boxes[i+1].l&&boxes[i+1].r<boxes[i+2].l);
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
assert.equal(await page.locator('[aria-label="Tenya Iida Statue"]').first().evaluate(n=>getComputedStyle(n).filter),'none');
await page.screenshot({path:'work/anime-eight-'+width+'.png',fullPage:true});
await page.evaluate(selected=>CollectibleShelf.open({selected,save:async value=>{window.saved=value;return value;},onSave:()=>{}}),selections[0]);

for(const id of ids){
await page.locator('#shelfCategory').selectOption('Anime');
await page.locator('#shelfSearch').fill(shelf.items.find(i=>i.id===id).name);
assert(await page.locator('[data-shelf-item="'+id+'"]').isVisible());
await page.locator('[data-shelf-item="'+id+'"]').click();
}
await page.locator('#saveShelf').click();
assert.equal((await page.evaluate(()=>window.saved)).slots[0],ids[ids.length-1]);
}
console.log('Nine statues passed category, image loading, save, alignment and desktop/mobile checks.');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
