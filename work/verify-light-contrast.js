const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const app=fs.readFileSync('app.js','utf8');
 const source=app.slice(app.indexOf('function renderHomeDefault()'),app.indexOf('function spotlightMediaUrl('));
 const ctx={isTeacher:()=>true,teacherDailyLaunchGrade:'4',authSession:{grade:'4'},dailyLaunchRecord:()=>({message:'<ol><li>Finish your assignment.</li><li>Begin your next project.</li></ol>'}),isSignedIn:()=>true,sanitizeLaunchHtml:x=>x,escapeHtml:x=>x,CLASSROOM_GRADES:['4','5','6','7'],CLASSROOM_EXPECTATIONS:['Stay on approved websites.','Work quietly.','Keep headphone volume low.','Do not switch activities without permission.','Ask before visiting an unlisted website.','Use respectful and school-appropriate language.'],categories:[],renderStudentSpotlightPreview:()=>'',renderGoogleClassroomPreview:()=>'',renderClassroomPassPreview:()=>'',renderColtCornerPreview:()=>'',renderStudentWebsiteRequest:()=>''};
 const html=vm.runInNewContext(source+';renderHomeDefault()',ctx);
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{for(const theme of ['light','night'])for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:1200}});
  await page.setContent('<style>'+fs.readFileSync('styles.css','utf8').replace(/^\uFEFF/,'')+'</style><body data-theme="'+theme+'"><main style="padding:20px">'+html+'</main></body>');
  await page.evaluate(()=>{document.querySelector('#calendarDate').textContent='SEPTEMBER 26';document.querySelector('#calendarDate').classList.add('is-long-month');document.querySelector('#calendarYear').textContent='2026';document.querySelector('#calendarTime').textContent='6:33:15 PM';});
  const result=await page.evaluate(()=>{const color=s=>getComputedStyle(document.querySelector(s)).color;return {muted:getComputedStyle(document.body).getPropertyValue('--muted').trim(),rule:color('.rules-card li'),title:color('.expectations-rules h3'),year:color('.calendar-year'),message:color('.daily-launch-message'),badge:color('.expectations-kicker'),background:getComputedStyle(document.querySelector('.rules-card')).backgroundImage,overflow:document.documentElement.scrollWidth>innerWidth};});
  assert(!result.overflow);
  if(theme==='light'){for(const key of ['rule','title','year','message'])assert.equal(result[key],'rgb(0, 0, 0)',key);assert.equal(result.muted,'#000000');assert(result.background.includes('255, 255, 255'));}
  else {assert.equal(result.muted,'#bebec2');assert.notEqual(result.rule,'rgb(0, 0, 0)');assert(result.background.includes('17, 18, 22'));}
  assert.equal(result.badge,'rgb(255, 255, 255)');
  await page.locator('#home-expectations').screenshot({path:`work/standards-${theme}-${width}.png`});await page.close();
 }console.log('Light black text, light standards/calendar, white badge contrast, night colors and responsive layouts passed.');}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
