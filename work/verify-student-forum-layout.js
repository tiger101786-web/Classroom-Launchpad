const fs=require('fs'),assert=require('assert/strict'),{chromium}=require('playwright');
(async()=>{
 const source=fs.readFileSync('app.js','utf8');
 const render=source.slice(source.indexOf('function renderColtCorner()'),source.indexOf('function renderColtCornerPage()'));
 const energy=source.slice(source.indexOf('function renderHeaderEnergyPaths()'),source.indexOf('function renderHomeHeaderControls()'));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 const page=await browser.newPage();
 await page.setContent('<style>'+fs.readFileSync('styles.css','utf8').replace(/^\uFEFF/,'')+'html{background:#241821}body{padding:20px;height:auto!important}main{max-width:1100px;margin:auto}.thread-form-banner{display:none}</style><body data-theme="night"><main></main></body>');
 await page.addScriptTag({content:`let teacher=false,pendingModeration=[];const isSignedIn=()=>true,isTeacher=()=>teacher,authSession={name:'Test Student',grade:'4'},teacherColtCornerGrade='4',visibleColtCornerThreads=()=>[],escapeHtml=x=>String(x),renderColtCornerGradeTabs=()=>'',renderForumProfileEditor=()=>'',renderThreadTable=()=>'<div class="thread-list">Class Topics</div>'; ${energy}${render} function draw(){document.querySelector('main').innerHTML=renderColtCorner();}draw();`});
 for(const width of [1200,850,390]){
  await page.setViewportSize({width,height:1000});
  await page.evaluate(()=>{teacher=false;pendingModeration=[];draw();});
  const dims=await page.evaluate(()=>{const rules=document.querySelector('.forum-rules-card').getBoundingClientRect(),button=document.querySelector('#threadForm button[type=submit]').getBoundingClientRect(),energy=document.querySelector('.student-forum-energy').getBoundingClientRect(),heading=document.querySelector('.colt-corner-heading').getBoundingClientRect(),form=document.querySelector('#threadForm').getBoundingClientRect();return {rules:rules.bottom,button:button.bottom,energy:energy.width,columns:form.right-heading.left,height:document.querySelector('#threadBody').getBoundingClientRect().height};});
  if(width>720){assert(Math.abs(dims.rules-dims.button)<2,JSON.stringify(dims));assert(Math.abs(dims.energy-dims.columns)<2);}
  assert(dims.height>=170);assert.equal(await page.locator('#threadStatus').count(),1);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.evaluate(()=>document.body.insertAdjacentHTML('beforeend','<span id="referenceEnergy" class="home-header-energy"><svg viewBox="0 0 240 30">'+renderHeaderEnergyPaths()+'</svg></span>'));
  const same=await page.evaluate(()=>{const a=document.querySelector('#referenceEnergy .home-header-energy-pulse'),b=document.querySelector('.student-forum-energy .home-header-energy-pulse');return ['stroke','strokeWidth','strokeDasharray','filter','animationName','animationDuration','animationTimingFunction'].every(k=>getComputedStyle(a)[k]===getComputedStyle(b)[k])&&a.getAttribute('d')===b.getAttribute('d');});assert(same);
  await page.locator('#referenceEnergy').evaluate(e=>e.remove());
  await page.screenshot({path:'work/student-forum-layout-'+width+'.png',fullPage:true});
  await page.evaluate(()=>{pendingModeration=[{}];draw();});assert.equal(await page.locator('.colt-corner-pending-note').count(),1);
  await page.evaluate(()=>{teacher=true;draw();});assert.equal(await page.locator('.student-forum-energy').count(),0);assert.equal(await page.locator('.forum-energy').count(),1);assert.equal(await page.locator('#threadForm #threadStatus').count(),1);
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>{teacher=false;draw();});
 assert.equal(await page.locator('.student-forum-energy .home-header-energy-pulse').evaluate(e=>getComputedStyle(e).animationName),'none');
 console.log('Student form/button alignment, full-width shared pulse style, mobile overflow, feedback, reduced motion and unchanged teacher markup passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
