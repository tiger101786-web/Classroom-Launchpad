const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{chromium}=require('playwright'),shelf=require('../collectible-shelf');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});try{
const page=await browser.newPage();await page.route('http://art.local/**',r=>{const f=path.join(process.cwd(),new URL(r.request().url()).pathname);return r.fulfill({status:fs.existsSync(f)?200:404,body:fs.existsSync(f)?fs.readFileSync(f):'',contentType:'image/png'});});
await page.setContent('<base href="http://art.local/"><style>'+fs.readFileSync('styles.css','utf8')+fs.readFileSync('collectible-shelf.css','utf8')+'body{padding:20px;background:#20171b}.fixture{max-width:657px;margin:auto}.statues{width:min(100%,350px);margin:120px auto 20px}</style><div class="fixture"><div class="home-header-rail"><div class="home-header-apps"><button class="portal-btn">PlusPortal</button><button class="google-apps-trigger">⋮</button><button class="google-signin-btn">Google Sign In</button></div><div class="home-header-energy"></div><div class="home-header-user"><button class="header-message-control">♧</button><button class="header-account-summary">Mr. Nieves — Teacher</button></div></div></div><div class="statues">'+shelf.art({enabled:true,theme:'chicken-nuggets',slots:['toy-story-buzz','toy-story-rex','toy-story-woody']})+'</div>');
await page.addScriptTag({path:path.resolve('collectible-shelf.js')});
await page.evaluate(()=>Promise.all([...document.querySelectorAll('.shelf-direct-image img')].map(i=>i.decode())));
for(const width of [1200,981,760,390]){
await page.setViewportSize({width,height:900});
assert(await page.locator('.google-signin-btn').evaluate(n=>getComputedStyle(n).display==='none'||n.scrollWidth<=n.clientWidth));
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
}
await page.setViewportSize({width:1200,height:900});
await page.evaluate(()=>CollectibleShelf.open({selected:{enabled:true,theme:'chicken-nuggets',slots:['toy-story-buzz','toy-story-rex','toy-story-woody']},save:async x=>x,onSave:()=>{}}));
await page.locator('#shelfStylesTab').click();await page.locator('#shelfSearch').fill('Chicken Nuggets');
for(const [width,height]of [[1200,900],[760,800],[390,700]]){
await page.setViewportSize({width,height});await page.waitForTimeout(250);
const fits=await page.locator('[data-shelf-theme-choice="chicken-nuggets"]').evaluate(n=>{const c=n.getBoundingClientRect(),a=n.querySelector('.collectible-shelf').getBoundingClientRect(),l=n.querySelector('strong').getBoundingClientRect();return a.top>=c.top&&a.bottom<=l.top&&l.bottom<=c.bottom;});assert(fits,'nugget thumbnail must stay inside card');
}
for(const id of ['toy-story-buzz','toy-story-rex','toy-story-woody']){assert.equal(shelf.items.filter(i=>i.id===id).length,1);assert(shelf.valid({enabled:true,theme:'crimson',slots:[id,'none','none']}));}
await page.setViewportSize({width:1200,height:900});await page.screenshot({path:'work/toy-story-nugget-check.png'});
console.log('PASS: header label fits, no page overflow, nugget card contains artwork and label at desktop/mobile sizes, and all three statues load.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

