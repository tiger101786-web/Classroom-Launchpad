const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const {chromium}=require('playwright');
const choices=[["anime-rooftops","Anime Rooftops"],["chapel-light","Chapel Light"],["sunlit-peaks","Sunlit Peaks"],["saturn-dream","Saturn Dream"],["winter-crystal","Winter Crystal"],["honey-meadow","Honey Meadow"],["midnight-melody","Midnight Melody"],["paint-play","Paint Play"],["dragon-valley","Dragon Valley"],["butterfly-dream","Butterfly Dream"],["rainbow-clouds","Rainbow Clouds"],["harbor-lights","Harbor Lights"],["carnival-glow","Carnival Glow"],["robot-city","Robot City"],["storybook-nook","Storybook Nook"],["stadium-spirit","Stadium Spirit"]];
(async()=>{
 const source=fs.readFileSync('server.js','utf8');
 const ctx=vm.createContext({});
 vm.runInContext(source.slice(source.indexOf('const profileBannerIds ='),source.indexOf('function profileBannerForSession('))+';globalThis.clean=cleanProfileBanner;',ctx);
 for(const [id] of choices){assert.equal(ctx.clean(id),id);assert(fs.existsSync('assets/profile-banner-'+id+'.png'));}
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1100,height:900}});
 await page.route('http://art.local/**',r=>r.fulfill({body:fs.readFileSync(path.join(process.cwd(),new URL(r.request().url()).pathname)),contentType:'image/png'}));
 await page.setContent('<base href="http://art.local/"><style>'+fs.readFileSync('styles.css','utf8').replace(/^\uFEFF/,'')+'</style><body data-theme="night"><button id="changeProfileBanner">Change banner</button></body>');
 await page.addScriptTag({path:path.resolve('profile-banners.js')});
 for(const [id] of choices){
 await page.evaluate(id=>ProfileBanners.open({selected:id,avatar:'',name:'Test',role:'Student',save:async v=>{window.saved=v;return v;},onSave:r=>{window.result=r;}}),id);
 assert.equal(await page.locator('[data-banner-choice]').count(),40);
 await page.locator('[data-banner-choice="'+id+'"]').click();
 const img=page.locator('#profileBannerPreview img');
 await img.evaluate(i=>i.decode());
 assert.equal(await img.getAttribute('src'),'assets/profile-banner-'+id+'.png');
 await page.locator('#saveProfileBanner').click();
 assert.equal(await page.evaluate(()=>window.saved),id);
 assert.equal(await page.evaluate(()=>window.result),id);
 }
 await page.evaluate(choices=>{document.body.innerHTML='<div class="gallery">'+choices.map(([id,name])=>'<article>'+ProfileBanners.cover(id)+'<strong>'+name+'</strong></article>').join('')+'</div>';},choices);
 await page.addStyleTag({content:'.gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;padding:20px}.gallery article{min-width:0}.gallery .profile-banner-cover{height:140px}.gallery strong{display:block;padding:7px}'});
 await page.locator('img').evaluateAll(images=>Promise.all(images.map(i=>{i.loading='eager';return i.decode();})));
 await page.screenshot({path:'work/banner-collection-preview.png',fullPage:true});
 console.log('16 new banners: files, server acceptance, picker selection, image loading and save callbacks passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
