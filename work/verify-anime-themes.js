const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),sharp=require('sharp'),shelf=require('../collectible-shelf');
(async()=>{
 for(const id of ['peppa','anya','frieren','gojo'])assert((await sharp(`assets/shelf-${id}.png`).metadata()).hasAlpha);
 for(const id of ['honeybee','volcanic','aurora']) {
  const m=await sharp(`assets/collectible-shelf-${id}.png`).metadata();
  assert(m.hasAlpha); assert(Math.abs(m.width-1448)<=1); assert(Math.abs(m.height-1086)<=1);
 }
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try {
 const page=await browser.newPage({viewport:{width:1100,height:1050}});
 await page.route('http://art.local/**',r=>r.fulfill({body:fs.readFileSync(path.join(__dirname,'..',new URL(r.request().url()).pathname)),contentType:'image/png'}));
 const css=fs.readFileSync('collectible-shelf.css','utf8');
 const configs=['honeybee','volcanic','aurora'].map((theme,i)=>({enabled:true,theme,slots:i===0?['peppa','anya','frieren']:['frieren','gojo','anya']}));
 configs.forEach(c=>assert(shelf.valid(c)));
 await page.setContent('<base href="http://art.local/"><style>'+css+'body{background:#241821;color:white;padding:30px}.row{display:flex;align-items:center;gap:40px;margin-top:65px}.shelf-wrap{width:360px;flex:none}.banner{width:600px;border-radius:12px}</style>'+configs.map(c=>'<div class="row"><section class="shelf-wrap">'+shelf.art(c)+'</section><img class="banner" src="assets/profile-banner-'+c.theme+'.png"></div>').join(''));
 await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>i.decode()));});
 await page.waitForTimeout(600);
 await page.screenshot({path:'work/anime-themes-preview.png',fullPage:true});
 console.log('All assets load; transparency, saved shelf selections and shelf dimensions passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
