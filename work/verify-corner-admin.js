const fs=require('fs'),assert=require('assert/strict'),{chromium}=require('playwright');
(async()=>{
const src=fs.readFileSync('app.js','utf8');
const code=src.slice(src.indexOf("let cornerAdminSection ="),src.indexOf('function renderDashboardRequests('))+src.slice(src.indexOf('function renderTeacherThread('),src.indexOf('function renderTeacherLink('));
const handlers=src.slice(src.indexOf('  if (action === "cornerAdminSection")'),src.indexOf('  if (action === "dashboardLinkPage")'));
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
try{for(const width of [390,1200])for(const theme of ['night','light']){
 const page=await browser.newPage({viewport:{width,height:1000}});
 await page.setContent('<style>'+fs.readFileSync('styles.css','utf8').replace(/^\uFEFF/,'')+'</style><body data-theme="'+theme+'"><main></main></body>');
 await page.addScriptTag({content:`let teacherColtCornerGrade='6';const isTeacher=()=>true;const escapeHtml=x=>String(x);const emptyCard=x=>'<p>'+x+'</p>';const renderColtCornerGradeTabs=()=>'';const formatShortDate=()=> 'Sep 27';const forumRoleLabel=x=>x;const isStudentMuted=()=>false;const coltCornerAudienceGrade=()=> '6';const getThreadReplies=t=>t.replies;const threads=Array.from({length:19},(_,i)=>({id:'t'+i,title:'Class topic '+i,studentName:'Student',grade:'6',body:'Our class discussion',replies:Array.from({length:13},(_,j)=>({id:'r'+j,studentName:'Student',grade:'6',message:'Reply '+j}))}));const visibleColtCornerThreads=()=>threads;const moderationQueue=Array.from({length:10},(_,i)=>({id:'q'+i,audienceGrade:'6'}));const recentlyModerated=Array.from({length:12},(_,i)=>({id:'h'+i,audienceGrade:'6'}));const mutedStudents=Array.from({length:9},(_,i)=>({id:'m'+i,name:'Student '+i}));const renderPendingModerationCard=x=>'<article class="pending">Review '+x.id+'</article>';const renderRecentModerationItem=x=>'<article class="history">History '+x.id+'</article>';`+code+`;function render(){document.querySelector('main').innerHTML=renderDashboardColtCorner();}render();document.addEventListener('click',event=>{const target=event.target.closest('[data-action]');if(!target)return;const action=target.dataset.action;${handlers}});`});
 assert.equal(await page.locator('.pending').count(),8);
 await page.locator('[data-section="topics"]').click();assert.equal(await page.locator('details').count(),8);assert.equal(await page.locator('.teacher-reply:visible').count(),0);
 await page.locator('details summary').first().click();assert.equal(await page.locator('.teacher-reply:visible').count(),5);
 await page.locator('details[open] [data-page="1"]').click();assert.equal(await page.locator('details[open] .teacher-reply').count(),5);assert((await page.locator('details[open] .teacher-reply').first().textContent()).includes('Reply 5'));
 await page.locator('details[open] [data-page="2"]').click();assert.equal(await page.locator('details[open] .teacher-reply').count(),3);
 await page.locator('.corner-admin-panel > nav [data-page="2"]').count().then(async n=>{if(!n)await page.locator('.corner-admin-panel > nav [data-page="1"]').click();});
 await page.locator('.corner-admin-panel > nav [data-page="2"]').click();assert.equal(await page.locator('details').count(),3);
 await page.locator('[data-section="history"]').click();assert.equal(await page.locator('.history').count(),8);
 await page.locator('[data-section="muted"]').click();assert.equal(await page.locator('.muted-student-card').count(),8);
 await page.locator('[data-section="topics"]').click();
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 if(theme==='night')await page.screenshot({path:'work/corner-admin-'+width+'.png',fullPage:true});
 await page.close();
}console.log('Moderation sections, topic/reply pagination, retained open reply page, collapsed topics and mobile/light/dark layouts passed.');}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
