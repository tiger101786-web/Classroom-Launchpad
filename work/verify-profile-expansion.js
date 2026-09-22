const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try {
 const page=await browser.newPage({viewport:{width:1000,height:850}});
 await page.route('http://art.local/**',route=>route.fulfill({body:fs.readFileSync(path.join(__dirname,'..',new URL(route.request().url()).pathname)),contentType:'image/png'}));
 const css=fs.readFileSync(path.join(__dirname,'../styles.css'),'utf8');
 await page.setContent('<base href="http://art.local/"><style>'+css+'body{background:#171015;color:white;padding:30px}.sample{margin-bottom:20px}.profile-banner-cover{height:170px}.sizes{display:flex;gap:24px;align-items:center;padding:15px}</style><main></main>');
 const app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
 await page.addScriptTag({content:app.slice(app.indexOf('const PROFILE_FRAMES ='),app.indexOf('function renderForumAvatar'))});
 await page.evaluate(()=>{
  document.querySelector('main').innerHTML=['storm','clockwork','moon-garden'].map(id=>`<section class="sample"><div class="profile-banner-cover"><img src="assets/profile-banner-${id}.png"></div><div class="sizes">${[40,64,100].map(size=>`<span class="profile-frame frame-${id}" style="width:${size}px;height:${size}px"><span class="forum-avatar forum-avatar-initials">AB</span>${profileFrameArt(id)}</span>`).join('')}<strong>${id}</strong></div></section>`).join('');
 });
 for(const el of await page.locator('img').all())await el.evaluate(img=>img.decode());
 for(const el of await page.locator('.profile-frame-art').all()){
  const box=await el.evaluate(svg=>{const b=svg.getBBox();return {x:b.x,y:b.y,r:b.x+b.width,b:b.y+b.height};});
  assert(box.x>=-2 && box.y>=-2 && box.r<=102 && box.b<=102,JSON.stringify(box));
 }
 await page.screenshot({path:path.join(__dirname,'profile-expansion-preview.png'),fullPage:true});
 console.log('All three frame designs remain within their SVG bounds at three avatar sizes. Matching banners render.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
