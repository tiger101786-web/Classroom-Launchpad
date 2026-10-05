const fs=require('fs'),path=require('path'),os=require('os'),assert=require('assert/strict');
const {chromium}=require('playwright');
(async()=>{
const src=fs.readFileSync('app.js','utf8');
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage();
 await page.route('http://local.test/**',r=>{const f=path.join(process.cwd(),new URL(r.request().url()).pathname);return r.fulfill({path:f})});
 await page.setContent('<base href="http://local.test/"><main></main>');
 for(const f of ['styles.css','launchpad-scenes.css','scene-frame-fit.css','scene-matched-frames.css'])await page.addStyleTag({path:path.resolve(f)});
 await page.addScriptTag({path:path.resolve('launchpad-scenes.js')});
 for(const width of [1100,390]){
  await page.setViewportSize({width,height:850});
  for(const kind of ['scenes','frames']){
   await page.evaluate(kind=>{
    const session={authenticated:true,homeScene:{id:'anime',frame:'none',motion:true}};
    document.querySelector('main').innerHTML=LaunchpadScenes.render(session,'');
    LaunchpadScenes.attach(session,'',()=>{});
    document.getElementById(kind==='scenes'?'chooseLaunchScene':'chooseLaunchFrame').click();
   },kind);
   await page.locator('#launchChooserCategory').selectOption('Disney');
   const prefix=kind==='scenes'?'data-scene-choice':'data-frame-choice';
   assert.equal(await page.locator('['+prefix+']:visible').count(),8);
   assert.match(await page.locator('[data-search-status]').textContent(),kind==='scenes'?/^25 of/:/^27 of/);
   await page.locator('#launchChooserSearch').fill('Agrabah');
   assert.equal(await page.locator('['+prefix+']:visible').count(),1);
   await page.locator('#launchChooserCategory').selectOption('Pokémon');
   assert.equal(await page.locator('['+prefix+']:visible').count(),0);
   await page.locator('[data-clear-search]').click();
   assert.equal(await page.locator('#launchChooserCategory').inputValue(),'');
   await page.locator('#launchChooserCategory').selectOption('Anime');
   await page.screenshot({path:path.join(os.tmpdir(),'categories-'+kind+'-'+width+'.png')});
   await page.evaluate(()=>document.querySelector('dialog').close());
  }
 }
 await page.addScriptTag({path:path.resolve('profile-banners.js')});
 await page.addScriptTag({content:
  "let authSession={authenticated:true,name:'Test',profileFrame:'none',profileBanner:'none',role:'student',grade:'5'};const isSignedIn=()=>true;const normalizeProfileAvatarUrl=()=>'';const escapeHtml=x=>x;const forumInitials=()=> 'CC';const forumRoleLabel=()=> 'Student';let profileAvatarMessage='',classThreads=[];const normalizeThreads=x=>x||[];const render=()=>{throw Error('Unexpected navigation/render')};const setScreen=()=>{throw Error('Unexpected navigation')};const sharedBackend={request:async(url,opts)=>({session:{...authSession,profileFrame:JSON.parse(opts.body).profileFrame},threads:[]})};"+
  src.slice(src.indexOf('const PROFILE_FRAMES ='),src.indexOf('function renderForumAuthor('))+
  src.slice(src.indexOf('function renderForumProfileEditor('),src.indexOf('function hasSharedData('))+
  src.slice(src.indexOf('function openMyProfile('),src.indexOf('function validateThreadTopic('))});
 for(const width of [1100,390]){
  await page.setViewportSize({width,height:850});
  await page.evaluate(()=>{document.querySelector('main').innerHTML='<button id="opener">My Profile</button><textarea id="draft">Unsent message</textarea>'+renderForumProfileEditor(true);document.getElementById('opener').focus();openMyProfile()});
  assert.equal(await page.locator('#forumProfileImage').count(),1);
  assert(await page.locator('#myProfileDialog').isVisible());
  const choice=page.locator('#myProfileDialog [data-profile-frame]:visible').nth(1);
  const id=await choice.getAttribute('data-profile-frame');await choice.click();
  await page.locator('#saveProfileFrame').click();
  await page.waitForFunction(()=>document.getElementById('forumProfileStatus').textContent.includes('saved'));
  assert.equal(await page.evaluate(()=>authSession.profileFrame),id);
  assert(await page.locator('#myProfileDialog').isVisible());
  await page.screenshot({path:path.join(os.tmpdir(),'profile-popup-'+width+'.png')});
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.getElementById('myProfileDialog'));
  assert.equal(await page.locator('#draft').inputValue(),'Unsent message');
  assert.equal(await page.locator('#forumProfileImage').count(),1);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'opener');
  await page.evaluate(()=>{authSession.profileFrame='none'});
 }
 console.log('Desktop/mobile category counts, combined filters, reset, profile popup save, Escape, focus, and draft preservation passed.');
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
