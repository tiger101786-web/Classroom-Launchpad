const fs=require('fs'),path=require('path'),{chromium}=require('playwright');
const themes=[{"id":"stars-stripes","name":"Stars & Stripes"},{"id":"angel-wings","name":"Angel Wings"},{"id":"wild-west","name":"Wild West"},{"id":"egyptian-gold","name":"Egyptian Gold"},{"id":"jungle-ruins","name":"Jungle Ruins"},{"id":"tropical-paradise","name":"Tropical Paradise"},{"id":"ice-cream-parlor","name":"Ice Cream Parlor"},{"id":"music-hall","name":"Music Hall"},{"id":"comic-hero","name":"Comic Hero"},{"id":"strawberry-garden","name":"Strawberry Garden"}];
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:1700}});
  await page.route('http://art.local/**',r=>r.fulfill({body:fs.readFileSync(path.join(process.cwd(),new URL(r.request().url()).pathname)),contentType:'image/png'}));
  await page.setContent('<base href="http://art.local/"><style>body{margin:0;padding:20px;display:grid;grid-template-columns:repeat(3,1fr);gap:18px;background:#241821;color:white;font:16px Arial;text-align:center}img{width:100%;display:block}</style>'+themes.map(t=>'<article><h3>'+t.name+'</h3><img src="assets/collectible-shelf-'+t.id+'.png"></article>').join(''));
  await page.locator('img').evaluateAll(ns=>Promise.all(ns.map(n=>n.decode())));
  await page.screenshot({path:'work/ten-shelves-art-preview.png',fullPage:true});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
