const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const source=fs.readFileSync('app.js','utf8');
 const extract=(a,b)=>source.slice(source.indexOf('function '+a+'('),source.indexOf('function '+b+'('));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try {
 for(const teacher of [false,true]) for(const width of [390,1200]) for(const theme of ['night','light']) {
 const ctx={isSignedIn:()=>true,isTeacher:()=>teacher,authSession:{name:'Test Member',grade:'4',profileFrame:'none'},teacherColtCornerGrade:'4',visibleColtCornerThreads:()=>[],renderColtCornerGradeTabs:()=>'<nav class="colt-corner-grade-tabs">Grade 4 / Grade 5 / Grade 6 / Grade 7</nav>',escapeHtml:x=>x,window:{ProfileBanners:{cover:()=>''}},renderForumAvatar:()=>'<span>Avatar</span>',PROFILE_FRAMES:[['none','No Frame','Classic']],normalizeProfileFrame:x=>x,profileAvatarMessage:'',pendingModeration:[],emptyCard:x=>'<p>'+x+'</p>'};
 ctx.coltCornerTopicPage=1;ctx.COLT_CORNER_TOPICS_PER_PAGE=15;
 const html=vm.runInNewContext(extract('renderForumProfileEditor','hasSharedData')+extract('renderColtCorner','renderColtCornerPage')+extract('renderThreadTable','renderThreadRow')+';renderColtCorner()',ctx);
 const page=await browser.newPage({viewport:{width,height:1000}});
 await page.setContent('<style>'+fs.readFileSync('styles.css','utf8').replace(/^\uFEFF/,'')+'</style><body data-theme="'+theme+'">'+html+'</body>');
 assert.equal(await page.locator('.forum-profile-menu').getAttribute('open'),null);
 assert.equal(await page.locator('#changeProfileBanner').isVisible(),false);
 assert(await page.locator('.thread-list').evaluate(e=>e.getBoundingClientRect().bottom<=document.querySelector('#threadForm').getBoundingClientRect().top));
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.locator('.forum-profile-menu > summary').focus();
 await page.keyboard.press('Enter');
 assert(await page.locator('#changeProfileBanner').isVisible());
 assert(await page.locator('[for="forumProfileImage"]').isVisible());
 assert(await page.locator('[data-profile-frame]').isVisible());
 await page.locator('.forum-profile-menu > summary').click();
 assert.equal(await page.locator('#changeProfileBanner').isVisible(),false);
 if(teacher&&theme==='night')await page.screenshot({path:'work/corner-layout-'+width+'.png',fullPage:true});
 await page.close();
 }
 console.log('Passed: teacher/student, light/dark, desktop/mobile; profile closed by default, keyboard toggle, editor controls and topics before composer.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
