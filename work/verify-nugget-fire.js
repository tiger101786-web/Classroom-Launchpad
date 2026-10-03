const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const {chromium} = require('playwright');
(async () => {
  const shelf = require('../collectible-shelf');
  assert.equal(shelf.clean({enabled:true,theme:'chicken-nuggets',slots:['pikachu','eevee','pokemon-charizard-statue']}).theme,'chicken-nuggets');
  const server = fs.readFileSync('server.js','utf8');
  const frames = server.slice(server.indexOf('const homeSceneIds'),server.indexOf('function homeSceneForSession'));
  const banners = server.slice(server.indexOf('const profileBannerIds'),server.indexOf('function profileBannerForSession'));
  for(const id of ['blue-fire','rainbow-fire']) assert.equal(vm.runInNewContext(frames+`;cleanHomeScene({frame:'${id}'}).frame`),id);
  for(const id of ['blue-fire','rainbow-fire','nugget-party']) assert.equal(vm.runInNewContext(banners+`;cleanProfileBanner('${id}')`),id);
  for(const id of ['blue-fire','rainbow-fire']) {
    const {data,info} = await sharp(`assets/scene-frame-${id}.png`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    assert.equal(data[(Math.floor(info.height/2)*info.width+Math.floor(info.width/2))*4+3],0);
  }
  console.log('Shelf dimensions',await sharp('assets/collectible-shelf-chicken-nuggets.png').metadata());
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    const page=await browser.newPage();
    await page.route('http://art.local/**',route=>route.fulfill({body:fs.readFileSync(path.join(process.cwd(),new URL(route.request().url()).pathname)),contentType:'image/png'}));
    const css=['styles.css','launchpad-scenes.css','scene-frame-fit.css','collectible-shelf.css'].map(f=>fs.readFileSync(f,'utf8')).join('\n');
    await page.setContent('<base href="http://art.local/"><style>'+css+'body{margin:0;padding:24px;background:#191015;color:white}main{display:flex;flex-wrap:wrap;gap:28px;align-items:center;justify-content:center} .sample{width:310px} .banner-samples{display:grid;gap:16px;max-width:600px;margin:24px auto}.school-photo{width:300px;height:300px}</style><main></main><div class="banner-samples"></div>');
    for(const f of ['launchpad-scenes.js','collectible-shelf.js','profile-banners.js']) await page.addScriptTag({path:path.resolve(f)});
    await page.addStyleTag({content:'.sample .home-scene-feature{position:relative;inset:auto;margin:0}.sample .launch-scene-stage{width:300px}'});
    for(const width of [1100,390]) {
      await page.setViewportSize({width,height:1100});
      await page.evaluate(()=>{
        const shelf={enabled:true,theme:'chicken-nuggets',slots:['pikachu','eevee','pokemon-charizard-statue']};
        document.querySelector('main').innerHTML='<div class="sample">'+CollectibleShelf.art(shelf)+'</div>'+['blue-fire','rainbow-fire'].map(frame=>'<div class="sample">'+LaunchpadScenes.render({authenticated:true,homeScene:{id:'jdm',frame,motion:false}},'')+'</div>').join('');
        document.querySelector('.banner-samples').innerHTML=['blue-fire','rainbow-fire','nugget-party'].map(id=>ProfileBanners.cover(id)).join('');
      });
      for(const img of await page.locator('img').all()) await img.evaluate(i=>i.decode());
      assert.equal(await page.locator('[data-shelf-theme="chicken-nuggets"]').count(),1);
      assert.equal(await page.locator('.scene-frame-artwork').count(),2);
      assert.equal(await page.locator('.profile-banner-cover').count(),3);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await page.screenshot({path:`work/nugget-fire-${width}.png`,fullPage:true});
    }
    console.log('New shelf, frames, banners: validation, transparency, asset loading and responsive render passed.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
