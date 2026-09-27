const fs=require('fs'),assert=require('assert/strict');
const {chromium}=require('playwright');
(async()=>{
const src=fs.readFileSync('app.js','utf8');
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
try{
const page=await browser.newPage({viewport:{width:390,height:850}});
await page.route('http://art.local/**',r=>r.fulfill({body:fs.readFileSync('.'+new URL(r.request().url()).pathname),contentType:'image/png'}));
await page.setContent('<base href="http://art.local/"><style>'+fs.readFileSync('styles.css','utf8').replace(/^\uFEFF/,'')+'</style><body data-theme="night"></body>');
await page.addScriptTag({path:require('path').resolve('profile-banners.js')});
await page.addScriptTag({content:`const authSession={name:'Test',profileFrame:'faith-glass'};const isSignedIn=()=>true;const normalizeProfileAvatarUrl=()=>'';const escapeHtml=x=>x;const forumInitials=()=> 'CC';let profileAvatarMessage='';const sharedBackend={request:async(url,opts)=>{window.savedFrame=JSON.parse(opts.body).profileFrame;throw Error('Test retry');}};`+src.slice(src.indexOf('const PROFILE_FRAMES ='),src.indexOf('function renderForumAuthor('))+src.slice(src.indexOf('function renderForumProfileEditor('),src.indexOf('function hasSharedData('))+src.slice(src.indexOf('function attachForumProfileEditor('),src.indexOf('function validateThreadTopic('))+'document.body.innerHTML=renderForumProfileEditor(false);attachForumProfileEditor();'});
assert.equal(await page.locator('[data-profile-frame]:visible').count(),8);
assert(await page.locator('[data-profile-frame="faith-glass"]').isVisible());
const frameNames=await page.locator('[data-profile-frame] strong').allTextContents();
assert.equal(frameNames.shift(),'No Frame');
assert.deepEqual(frameNames,[...frameNames].sort((a,b)=>a.localeCompare(b,'en',{sensitivity:'base'})));
const frameChoice=page.locator('[data-profile-frame]:visible').first();
const frameId=await frameChoice.getAttribute('data-profile-frame');
await frameChoice.click();
await page.locator('[data-frame-page="1"]').click();
await page.locator('[data-frame-page="-1"]').click();
assert.equal(await page.locator('[data-profile-frame="'+frameId+'"]').getAttribute('aria-pressed'),'true');
await page.locator('#saveProfileFrame').click();
assert.equal(await page.evaluate(()=>window.savedFrame),frameId);
await page.evaluate(()=>ProfileBanners.open({selected:'none',avatar:'',name:'Test',role:'Student',save:async id=>{window.savedBanner=id;return id;},onSave:()=>{}}));
assert.equal(await page.locator('[data-banner-choice]:visible').count(),6);
const bannerNames=await page.locator('[data-banner-choice] strong').allTextContents();
assert.equal(bannerNames.shift(),'No banner');
assert.deepEqual(bannerNames,[...bannerNames].sort((a,b)=>a.localeCompare(b,'en',{sensitivity:'base'})));
await page.locator('[data-banner-page="1"]').click();
const choice=page.locator('[data-banner-choice]:visible').first();const id=await choice.getAttribute('data-banner-choice');await choice.click();
await page.locator('[data-banner-page="1"]').click();
await page.locator('[data-banner-page="-1"]').click();
assert.equal(await page.locator('[data-banner-choice="'+id+'"]').getAttribute('aria-pressed'),'true');
await page.locator('#saveProfileBanner').click();assert.equal(await page.evaluate(()=>window.savedBanner),id);
console.log('Frame/banner pages passed: limits, saved-selection page, browsing preserves draft, save payload, mobile controls.');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
