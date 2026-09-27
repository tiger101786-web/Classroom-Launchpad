const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const app=fs.readFileSync('app.js','utf8'),server=fs.readFileSync('server.js','utf8');
 const ctx=vm.createContext({normalizeProfileAvatarUrl:()=>'',escapeHtml:x=>x,forumInitials:()=> 'CC'});
 vm.runInContext(app.slice(app.indexOf('const PROFILE_FRAMES ='),app.indexOf('function renderForumAuthor('))+';globalThis.frames=PROFILE_FRAMES;',ctx);
 assert.equal(ctx.frames.length,40);assert.equal(new Set(ctx.frames.map(f=>f[0])).size,40);
 const backend=vm.createContext({});
 vm.runInContext(server.slice(server.indexOf('const profileFrameIds ='),server.indexOf('const profileBannerIds ='))+server.split('\n').filter(l=>l.includes('profileFrameIds.add(id)')).join('\n')+';function clean(value){return profileFrameIds.has(value)?value:"none";}',backend);
 for(const [id] of ctx.frames){assert.equal(backend.clean(id),id);assert.equal(ctx.normalizeProfileFrame(id),id);if(id!=='none')assert(/<(svg|img)/.test(ctx.profileFrameArt(id)));}
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1000,height:700}});
 await page.route('http://art.local/**',r=>r.fulfill({body:fs.readFileSync('.'+new URL(r.request().url()).pathname),contentType:'image/png'}));
 await page.addInitScript(()=>{});
 await page.setContent('<base href="http://art.local/"><style>'+fs.readFileSync('styles.css','utf8').replace(/^\uFEFF/,'')+'body{padding:24px}.gallery{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}.gallery article{text-align:center;padding:14px}</style><body data-theme="night"><div class="gallery">'+ctx.frames.filter(([id])=>ctx.newProfileFrameArt(id)).map(([id,name])=>'<article>'+ctx.renderForumAvatar('Test','','',id)+'<h3>'+name+'</h3></article>').join('')+'</div></body>');
 await page.evaluate(()=>{const base=document.createElement('base');base.href='http://art.local/';document.head.prepend(base);});
 assert.equal(await page.locator('.profile-frame-raster').count(),24);
 await page.locator('img').evaluateAll(images=>Promise.all(images.map(i=>{i.loading='eager';return i.decode();})));
 assert.equal(await page.locator('parsererror').count(),0);
 const small=ctx.frames.filter(([id])=>ctx.newProfileFrameArt(id)).map(([id])=>'<span class="header-frame-slot">'+ctx.renderForumAvatar('Test','','',id)+'</span>').join('');
 await page.evaluate(html=>document.body.insertAdjacentHTML('beforeend','<div style="display:flex;gap:12px;flex-wrap:wrap;padding:20px">'+html+'</div>'),small);
 await page.locator('.header-frame-slot img').evaluateAll(images=>Promise.all(images.map(i=>{i.loading='eager';return i.decode();})));
 assert(await page.locator('.header-frame-slot').evaluateAll(slots=>slots.every(s=>{const a=s.querySelector('.profile-frame').getBoundingClientRect(),r=s.querySelector('img').getBoundingClientRect();return r.width<=a.width+1&&r.height<=a.height+1;})));
 await page.screenshot({path:'work/profile-collection-preview.png',fullPage:true});
 console.log('40 frames total; all 24 illustrated designs render and pass browser/server normalization.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
