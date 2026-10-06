const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const ids=['disney-twilight-boulevard','disney-agrabah','disney-pride-rock','anime-hidden-leaf','anime-kame-island','anime-cherry-village','anime-walled-city'];
(async()=>{
 const server=fs.readFileSync('server.js','utf8');
 const catalog=server.slice(server.indexOf('const profileBannerIds'),server.indexOf('function profileBannerForSession'));
 for(const id of ids)assert.equal(vm.runInNewContext(catalog+';cleanProfileBanner('+JSON.stringify(id)+')'),id);
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1000,height:950}});
  await page.route('http://art.local/**',r=>r.fulfill({path:path.join(process.cwd(),new URL(r.request().url()).pathname)}));
  await page.setContent('<base href="http://art.local/"><body data-theme="night"></body>');
  await page.addStyleTag({path:path.resolve('styles.css')});
  await page.addScriptTag({path:path.resolve('profile-banners.js')});
  for(const width of [1000,390]){
   await page.setViewportSize({width,height:950});
   for(const id of ids){
    await page.evaluate(id=>ProfileBanners.open({selected:id,avatar:'',name:'Student',role:'Student',save:async v=>{window.savedBanner=v;return v},onSave:()=>{}}),id);
    const selected=page.locator('[data-banner-choice="'+id+'"]');
    assert(await selected.isVisible());
    assert.equal(await selected.getAttribute('aria-pressed'),'true');
    await page.locator('#profileBannerPreview img').evaluate(i=>i.decode());
    assert(await page.locator('#profileBannerPreview img').evaluate(i=>i.naturalWidth>0));
    assert(await page.locator('#profileBannerPreview img').evaluate(i=>{
      const style=getComputedStyle(i),box=i.getBoundingClientRect(),parent=i.parentElement.getBoundingClientRect();
      return style.objectFit==='cover' && style.transform==='none' && style.maskImage==='none' && i.naturalWidth/i.naturalHeight>2.9
        && box.left>=parent.left-1 && box.right<=parent.right+1
        && box.top>=parent.top-1 && box.bottom<=parent.bottom+1
        && Math.abs(box.width/box.height-i.naturalWidth/i.naturalHeight)<.02;
    }), 'Wide banner artwork must fit at its native proportions without zoom or circular masks');
    assert(await page.locator('.profile-banner-dialog').evaluate(e=>e.scrollWidth<=e.clientWidth));
    await selected.click();
    await page.locator('#saveProfileBanner').click();
    assert.equal(await page.evaluate(()=>window.savedBanner),id);
   }
  }
  await page.setViewportSize({width:1000,height:900});
  await page.evaluate(ids=>{document.body.innerHTML='<main style="padding:24px;display:grid;grid-template-columns:1fr 1fr;gap:20px">'+ids.map(id=>'<section><p>'+id+'</p><div class="profile-banner-card">'+ProfileBanners.cover(id)+'</div></section>').join('')+'</main>'},ids);
  await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
  const preview=path.join(os.tmpdir(),'colt-scene-banners.png');await page.screenshot({path:preview});
  console.log('PASS: '+ids.length+' IDs accepted by server; artwork loads; desktop/mobile choices, preview and save payloads work. Preview: '+preview);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
