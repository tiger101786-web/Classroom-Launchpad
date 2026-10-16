const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),src=fs.readFileSync(path.join(root,'app.js'),'utf8');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try {
  const page=await browser.newPage();
  await page.setContent('<body data-theme="night"></body>');
  for(const file of ['styles.css','launchpad-scenes.css','profile-name-styles.css'])await page.addStyleTag({path:path.join(root,file)});
  for(const file of ['profile-banners.js','profile-name-styles.js'])await page.addScriptTag({path:path.join(root,file)});
  await page.addScriptTag({content:`let authSession={name:'Mr. Nieves Test Student',role:'student',grade:'4',profileFrame:'none',nameStyle:'none'};const isSignedIn=()=>true;const normalizeProfileAvatarUrl=x=>x||'';const escapeHtml=x=>x;const forumInitials=()=> 'MS';const forumRoleLabel=x=>x;let profileAvatarMessage='',classThreads=[];const normalizeThreads=x=>x||[];const prepareForumProfileImage=async()=>({});const sharedBackend={uploadProfileAvatar:async()=>({session:{...authSession,avatarUrl:'/api/profile-avatar/'+ 'a'.repeat(64)},threads:[]})};function render(){document.body.innerHTML=renderForumProfileEditor();attachForumProfileEditor();}`+
   src.slice(src.indexOf('const PROFILE_FRAMES ='),src.indexOf('function renderForumAuthor('))+
   src.slice(src.indexOf('function renderForumProfileEditor('),src.indexOf('function hasSharedData('))+
   src.slice(src.indexOf('function openMyProfile('),src.indexOf('function validateThreadTopic('))});
  for(const width of [390,870,965])for(const popup of [false,true])for(const style of ['none','notebook','comic']) {
   await page.setViewportSize({width,height:1000});
   await page.evaluate(({popup,style})=>{document.querySelector('#myProfileDialog')?.remove();authSession.avatarUrl='';authSession.nameStyle=style;render();if(popup)openMyProfile();},{popup,style});
   await page.locator('#forumProfileImage').setInputFiles({name:'avatar.jpg',mimeType:'image/jpeg',buffer:Buffer.from('mock image')});
   await page.waitForFunction(()=>document.querySelector('#forumProfileStatus').textContent==='Profile picture saved.');
   assert.equal(await page.locator('#removeForumProfileImage').count(),1);
   const gap=await page.evaluate(()=>document.querySelector('.forum-profile-actions').getBoundingClientRect().top-document.querySelector('.forum-profile-copy').getBoundingClientRect().bottom);
   assert(gap>=15,`${width}/${popup}/${style}: ${gap}`);
  }
  console.log('PASS: real student profile upload handler and rerender, popup/inline, original/notebook/comic, mobile and screenshot-sized screens.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
