const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const app=fs.readFileSync('app.js','utf8');
 const start=app.indexOf('<section class="form-card daily-launch-editor">');
 const end=app.indexOf('<section class="form-card class-timer-editor">',start);
 const html=vm.runInNewContext('`'+app.slice(start,end)+'`',{CLASSROOM_GRADES:['4','5','6','7'],teacherDailyLaunchGrade:'4',escapeHtml:x=>x,sanitizeLaunchHtml:x=>x,launchRecord:{message:'<ol><li>Finish your assignment.</li><li>Begin your slide project.</li></ol>'}});
 assert(!app.includes('<section class="form-card random-activity-control">'));
 assert(!app.includes('<span>Random Activity</span>'));
 assert(app.includes('<h2 class="section-title">Colt Corner Threads</h2>'));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{for(const width of [1440,900,390]){
 const page=await browser.newPage({viewport:{width,height:1000}});
 await page.setContent('<style>'+fs.readFileSync('styles.css','utf8')+'</style><body data-theme="night"><main style="padding:16px"><div class="dashboard-tools-grid">'+html+'</div></main></body>');
 const layout=await page.locator('.daily-launch-editor').evaluate(e=>{const f=e.querySelector('form').getBoundingClientRect(),h=e.firstElementChild.getBoundingClientRect(),s=getComputedStyle(e);return {width:e.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight),form:f.width,below:f.top>=h.bottom,overflow:e.scrollWidth>e.clientWidth}});
 assert(Math.abs(layout.width-layout.form)<2);assert(layout.below);assert(!layout.overflow);
 assert.equal(await page.locator('.daily-launch-grade-tab').count(),4);
 assert.equal(await page.locator('[name="dailyLaunchCopyGrade"]').count(),3);
 assert.equal(await page.locator('[name="launchSaveMode"]').count(),2);
 await page.locator('.daily-launch-editor').screenshot({path:'work/dashboard-launch-'+width+'.png'});await page.close();
 }console.log('Dashboard launch: full-width editor, grade/copy/save controls preserved, no random controls/status; desktop/mobile checks passed.');}
 finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
