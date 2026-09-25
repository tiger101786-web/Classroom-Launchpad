const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),shelf=require('../collectible-shelf');
(async()=>{
 assert(shelf.items.some(i=>i.id==='highland-cow'&&i.category==='Animal Friends'));
 const config={enabled:true,theme:'crimson',slots:['itachi','highland-cow','tanjiro']};
 assert(shelf.valid(config));
 assert.deepEqual(shelf.clean(config),config);
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:600,height:420}});
 await page.route('http://art.local/**',r=>r.fulfill({body:fs.readFileSync(path.join(__dirname,'..',new URL(r.request().url()).pathname)),contentType:'image/png'}));
 await page.setContent('<base href="http://art.local/"><style>'+fs.readFileSync('collectible-shelf.css','utf8')+'body{background:#241821;padding:110px 35px 25px;margin:0}section{width:100%}</style><section>'+shelf.art(config)+'</section>');
 await page.waitForFunction(()=>[...document.querySelectorAll('image')].length===3);
 const sizes=await page.locator('.shelf-object > svg').evaluateAll(nodes=>nodes.map(n=>({height:+n.getAttribute('height'),bottom:+n.getAttribute('y')+ +n.getAttribute('height')})));
 assert(sizes[1].height>=sizes[0].height*.85,'Cow should be comparable to bust size');
 assert(sizes.every(s=>Math.abs(s.bottom-346)<.01),'All bases should share a baseline');
 await page.waitForTimeout(700);
 await page.screenshot({path:'work/highland-cow-preview.png'});
 console.log('Highland cow validates, renders near bust size, and shares the shelf baseline.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
