const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const app=fs.readFileSync('app.js','utf8');
 const source=app.slice(app.indexOf('function renderHomeDefault()'),app.indexOf('function spotlightMediaUrl('));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 for(const teacher of [false,true]){
 const ctx={isTeacher:()=>teacher,teacherDailyLaunchGrade:'4',authSession:{grade:'4'},dailyLaunchRecord:()=>({message:'<p>Welcome! Open your project and follow today’s instructions.</p><ol><li>Finish your first slide.</li><li>Check your work and submit it.</li></ol>'}),isSignedIn:()=>true,sanitizeLaunchHtml:x=>x,escapeHtml:x=>x,CLASSROOM_GRADES:['3','4','5'],CLASSROOM_EXPECTATIONS:[],categories:[],renderStudentSpotlightPreview:()=>'',renderGoogleClassroomPreview:()=>'',renderClassroomPassPreview:()=>'',renderColtCornerPreview:()=>'',renderStudentWebsiteRequest:()=>''};
 const html=vm.runInNewContext(source+';renderHomeDefault()',ctx);
 assert(!html.includes('randomActivityCard'));assert(!html.includes('random-activity-bg.mp4'));
 for(const width of [1440,1024,390]){
 const page=await browser.newPage({viewport:{width,height:900}});
 await page.setContent('<style>'+fs.readFileSync('styles.css','utf8')+'</style><body data-theme="night"><main style="padding:20px">'+html+'</main></body>');
 const layout=await page.locator('#home-launch').evaluate(e=>{const c=e.querySelector('.daily-launch-card'),m=e.querySelector('.daily-launch-message'),copy=e.querySelector('.daily-launch-copy');return {row:e.getBoundingClientRect().width,card:c.getBoundingClientRect().width,message:m.getBoundingClientRect().width,copy:copy.getBoundingClientRect().width,overflow:e.scrollWidth>e.clientWidth}});
 assert(Math.abs(layout.row-layout.card)<2);assert(Math.abs(layout.message-layout.copy)<2);assert(!layout.overflow);
 assert.equal(await page.locator('.daily-launch-preview-tab').count(),teacher?3:0);
 if(!teacher)await page.locator('#home-launch').screenshot({path:'work/wide-launch-'+width+'.png'});
 await page.close();
 }
 }
 console.log('Wide launch: no random card/video; full row and instruction width; teacher tabs preserved; no overflow at 1440, 1024, 390px.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
