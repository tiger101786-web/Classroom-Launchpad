const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),sharp=require('sharp'),{chromium}=require('playwright');
const ids=["patriotic-pride","angelic-peace","highland-haven","dumpling-delight","prehistoric-jungle","mermaid-lagoon","frontier-sunset","strawberry-picnic"];
(async()=>{
 const source=fs.readFileSync('app.js','utf8'),server=fs.readFileSync('server.js','utf8');
 const ctx=vm.createContext({normalizeProfileAvatarUrl:()=>'',escapeHtml:x=>x,forumInitials:()=> 'CC'});
 vm.runInContext(source.slice(source.indexOf('const PROFILE_FRAMES ='),source.indexOf('function renderForumAuthor('))+';globalThis.frames=PROFILE_FRAMES;',ctx);
 const backend=vm.createContext({});
 vm.runInContext(server.slice(server.indexOf('const profileBannerIds ='),server.indexOf('function profileBannerForSession(')),backend);
 for(const id of ids){
  assert.equal(ctx.normalizeProfileFrame(id),id);assert.equal(backend.cleanProfileBanner(id),id);
  const {data,info}=await sharp('assets/profile-frame-'+id+'-ornate.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.equal(data[3],0);assert.equal(data[(Math.floor(info.height/2)*info.width+Math.floor(info.width/2))*4+3],0);
 }
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:1000}});
  await page.route('http://art.local/**',r=>{const f=path.join(process.cwd(),new URL(r.request().url()).pathname);return fs.existsSync(f)?r.fulfill({body:fs.readFileSync(f),contentType:'image/png'}):r.fulfill({status:404,body:''});});
  const cards=ids.map(id=>'<article><h3>'+ctx.frames.find(f=>f[0]===id)[1]+'</h3><div class="profile-banner-card"><div class="profile-banner-cover"><img src="assets/profile-banner-'+id+'.png"></div><div class="profile-banner-identity">'+ctx.renderForumAvatar('Colt Corner','','',id)+'<strong>Colt Corner</strong></div></div><div class="sizes">'+[100,52,30].map(size=>'<span style="display:inline-flex;width:'+size+'px;height:'+size+'px">'+ctx.renderForumAvatar('CC','','',id).replace('class="profile-frame ', 'style="width:100%;height:100%" class="profile-frame ')+'</span>').join('')+'</div></article>').join('');
  await page.setContent('<base href="http://art.local/"><style>'+fs.readFileSync('styles.css','utf8').replace(/^\uFEFF/,'')+'html{background:#241821!important}body{margin:0;background:#241821!important;background-image:none!important;color:white;padding:25px;height:auto!important;min-height:100vh}.gallery{display:grid;grid-template-columns:1fr 1fr;gap:25px}article{min-width:0;padding:15px;border:1px solid #68505f;border-radius:18px}h3{margin:0 0 12px}.sizes{display:flex;align-items:center;gap:25px;margin-top:14px}@media(max-width:600px){.gallery{grid-template-columns:1fr}}</style><body data-theme="night"><div class="gallery">'+cards+'</div></body>');
  await page.addScriptTag({path:path.resolve('profile-banners.js')});
  await page.locator('img').evaluateAll(ns=>Promise.all(ns.map(i=>{i.loading='eager';return i.decode();})));
  for(const width of [1100,390]){
   await page.setViewportSize({width,height:1000});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   assert(await page.locator('.sizes .profile-frame').evaluateAll(ns=>ns.every(n=>{const a=n.getBoundingClientRect(),b=n.querySelector('.profile-frame-raster').getBoundingClientRect();return b.width<=a.width+1&&b.height<=a.height+1;})));
   await page.screenshot({path:'work/corner-matching-sets-'+width+'.png',fullPage:true});
   for(const id of ids){
    await page.evaluate(id=>ProfileBanners.open({selected:id,avatar:'',name:'Test',role:'Student',save:async v=>{window.saved=v;return v},onSave:()=>{}}),id);
    assert.equal(await page.locator('[data-banner-choice]').count(),40);
    const choice=page.locator('[data-banner-choice="'+id+'"]');assert(await choice.isVisible());await choice.click();
    await page.locator('#profileBannerPreview img').evaluate(i=>i.decode());
    await page.locator('#saveProfileBanner').click();assert.equal(await page.evaluate(()=>window.saved),id);
   }
  }
  console.log('Eight matching sets: alpha centers, banner validation/save, small avatar fit and desktop/mobile render passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
