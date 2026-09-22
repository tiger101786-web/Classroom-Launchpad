const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try {
  for(const width of [1366,390]) {
   const page=await browser.newPage({viewport:{width,height:850}});
   await page.route('http://art.local/**',route=>route.fulfill({body:fs.readFileSync(path.join(__dirname,'..',new URL(route.request().url()).pathname)),contentType:'image/png'}));
   const css=['styles.css','launchpad-scenes.css'].map(f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8')).join('\n');
   await page.setContent('<base href="http://art.local/"><style>'+css+'</style>');
   await page.addScriptTag({path:path.join(__dirname,'../profile-banners.js')});
   await page.evaluate(()=>ProfileBanners.open({selected:'none',avatar:'',name:'Student',role:'Student',save:async value=>{window.savedBanner=value;return value},onSave:()=>{}}));
   for (const id of ['storm','clockwork','moon-garden','honeybee','volcanic','aurora']) {
    await page.locator(`[data-banner-choice="${id}"]`).click();
    assert.equal(await page.locator('#profileBannerPreview [data-banner]').getAttribute('data-banner'),id);
    await page.locator('#profileBannerPreview img').evaluate(img=>img.decode());
   }
   await page.locator('[data-banner-choice="autumn"]').click();
   assert.equal(await page.locator('#profileBannerPreview [data-banner]').getAttribute('data-banner'),'autumn');
   await page.locator('#profileBannerPreview img').evaluate(img=>img.decode());
   assert(await page.locator('dialog').evaluate(el=>el.scrollWidth<=el.clientWidth));
   await page.locator('dialog').screenshot({path:path.join(__dirname,`autumn-banner-${width}.png`)});
   await page.locator('#saveProfileBanner').click();
   assert.equal(await page.evaluate(()=>window.savedBanner),'autumn');
   await page.close();
  }
  console.log('Autumn banner loads, previews, and submits selected ID at desktop/mobile widths.');
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
