const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),shelf=require('../collectible-shelf');
(async()=>{
 const ids=['sasuke','madara','kakashi','sakura','itachi'];
 ids.forEach(id=>assert(shelf.items.some(i=>i.id===id&&i.category==='Anime')));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try {
 const page=await browser.newPage({viewport:{width:1100,height:500}});
 await page.route('http://art.local/**',r=>r.fulfill({body:fs.readFileSync(path.join(__dirname,'..',new URL(r.request().url()).pathname)),contentType:'image/png'}));
 const css=fs.readFileSync(path.join(__dirname,'../collectible-shelf.css'),'utf8');
 const configs=[{enabled:true,theme:'anime-spirit',slots:['sasuke','madara','kakashi']},{enabled:true,theme:'anime-spirit',slots:['itachi','sakura','sasuke']}];
 configs.forEach(c=>assert(shelf.valid(c)));
 await page.setContent('<base href="http://art.local/"><style>'+css+'body{background:#241821;color:white;padding:50px;display:flex;gap:70px}section{width:450px}</style>'+configs.map(c=>'<section>'+shelf.art(c)+'</section>').join(''));
 await page.waitForTimeout(800);
 await page.screenshot({path:path.join(__dirname,'naruto-busts-preview.png'),fullPage:true});
 console.log('All five Naruto busts validate and render.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
