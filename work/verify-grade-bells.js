const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),{chromium}=require('playwright');
(async()=>{
 const app=fs.readFileSync('app.js','utf8');
 const helpers=app.slice(app.indexOf('function coltCornerSeenTopicsStorageKey()'),app.indexOf('function isTeacher()'));
 const tabs=app.slice(app.indexOf('function renderColtCornerGradeTabs()'),app.indexOf('function setHomeNavigationMobileOpen('));
 const storage=new Map();
 const ctx=vm.createContext({escapeHtml:x=>String(x),localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},COLT_CORNER_SEEN_TOPICS_KEY:'test',isTeacher:()=>true,isSignedIn:()=>true,isApprovedStudent:()=>false,authSession:{},teacherColtCornerGrade:'4',screen:{name:'coltCorner'},getThreadReplies:t=>t.replies||[],coltCornerAudienceGrade:t=>t.audienceGrade||t.grade,classThreads:[{id:'a',grade:'4',replies:[{id:'r1',grade:'4'}]},{id:'b',grade:'Teacher',audienceGrade:'5',replies:[{id:'r2',grade:'5'},{id:'r3',grade:'Teacher'}]},{id:'c',grade:'6',replies:[]}]});
 vm.runInContext(helpers+tabs,ctx);
 assert.equal(ctx.teacherCornerUnreadCount(ctx.classThreads[0]),2);
 assert.equal(ctx.teacherCornerUnreadCount(ctx.classThreads[1]),1);
 ctx.markVisibleColtCornerTopicsSeen();assert.equal(ctx.teacherCornerUnreadCount(ctx.classThreads[0]),2);
 ctx.screen={name:'thread',id:'a'};ctx.markVisibleColtCornerTopicsSeen();assert.equal(ctx.teacherCornerUnreadCount(ctx.classThreads[0]),0);assert.equal(ctx.teacherCornerUnreadCount(ctx.classThreads[1]),1);
 ctx.classThreads[0].replies.push({id:'new',grade:'4'});assert.equal(ctx.teacherCornerUnreadCount(ctx.classThreads[0]),1);
 ctx.classThreads[0].replies.push({id:'teacher',grade:'Teacher'});assert.equal(ctx.teacherCornerUnreadCount(ctx.classThreads[0]),1);
 ctx.classThreads[0].replies=ctx.classThreads[0].replies.filter(r=>r.id!=='new');assert.equal(ctx.teacherCornerUnreadCount(ctx.classThreads[0]),0);
 assert.equal(ctx.teacherCornerUnreadCount(ctx.classThreads[0],ctx.loadTeacherCornerReadActivity()),0); // reloaded storage keeps read activity
 const html=ctx.renderColtCornerGradeTabs();assert.match(html,/Grade 5, 1 unread/);assert.match(html,/Grade 7, no unread/);
 assert.equal(ctx.markColtCornerGradeRead("5"),true);
 assert.equal(ctx.teacherCornerUnreadCount(ctx.classThreads[1]),0);
 assert.equal(ctx.teacherCornerUnreadCount(ctx.classThreads[2]),1);
 assert.equal(ctx.classThreads.length,3);
 ctx.classThreads[1].replies.push({id:"after-clear",grade:"5"});
 assert.equal(ctx.teacherCornerUnreadCount(ctx.classThreads[1]),1);
 assert.equal(ctx.markColtCornerGradeRead("8"),false);
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 const page=await browser.newPage();
 await page.setContent('<style>'+fs.readFileSync('styles.css','utf8').replace(/^\uFEFF/,'')+'body{padding:24px;height:auto;max-width:1150px;margin:auto}</style><body data-theme="night">'+html+'</body>');
 for(const width of [1200,390]){await page.setViewportSize({width,height:240});for(const theme of ['night','light']){await page.locator('body').evaluate((e,t)=>e.dataset.theme=t,theme);assert.equal(await page.locator('.corner-grade-bell svg').count(),4);assert.equal(await page.locator('.corner-grade-bell.has-unread').count(),2);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'work/grade-bells-'+width+'-'+theme+'.png'});}}
 }finally{await browser.close();}
 console.log('Grade bells: topic/reply counts, teacher exclusions, grade browsing does not clear, topic reading clears, new replies re-notify, deletion/reload and mobile/light/dark rendering passed.');
})().catch(e=>{console.error(e);process.exitCode=1});
