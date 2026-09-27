const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const app=fs.readFileSync('app.js','utf8'),server=fs.readFileSync('server.js','utf8');
 const ctx=vm.createContext({normalizeProfileAvatarUrl:()=>'',escapeHtml:x=>x,forumInitials:()=> 'CC'});
 vm.runInContext(app.slice(app.indexOf('const PROFILE_FRAMES ='),app.indexOf('function renderForumAuthor('))+';globalThis.frames=PROFILE_FRAMES;',ctx);
 assert.equal(ctx.frames.length,32);assert.equal(new Set(ctx.frames.map(f=>f[0])).size,32);
 const backend=vm.createContext({});
 vm.runInContext(server.slice(server.indexOf('const profileFrameIds ='),server.indexOf('const profileBannerIds ='))+server.split('\n').filter(l=>l.includes('profileFrameIds.add(id)')).join('\n')+';function clean(value){return profileFrameIds.has(value)?value:"none";}',backend);
 for(const [id] of ctx.frames){assert.equal(backend.clean(id),id);assert.equal(ctx.normalizeProfileFrame(id),id);if(id!=='none')assert(ctx.profileFrameArt(id).includes('<svg'));}
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1000,height:700}});
 await page.setContent('<style>'+fs.readFileSync('styles.css','utf8').replace(/^\uFEFF/,'')+'body{padding:24px}.gallery{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}.gallery article{text-align:center;padding:14px}</style><body data-theme="night"><div class="gallery">'+ctx.frames.slice(16).map(([id,name])=>'<article>'+ctx.renderForumAvatar('Test','','',id)+'<h3>'+name+'</h3></article>').join('')+'</div></body>');
 assert.equal(await page.locator('.profile-frame-art').count(),16);
 assert.equal(await page.locator('parsererror').count(),0);
 await page.screenshot({path:'work/profile-collection-preview.png',fullPage:true});
 console.log('32 frames total; all 16 new designs render and pass browser/server normalization.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
