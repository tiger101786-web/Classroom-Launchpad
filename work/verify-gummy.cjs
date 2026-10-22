const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const p=await b.newPage({viewport:{width:1200,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('file:///C:/Users/Sinister/Documents/GitHub/Classroom-Launchpad/work/gummy-bear-preview.html');
  const pet=p.locator('.gummy-companion .pet-button'),visible=selector=>pet.locator(selector).evaluate(e=>getComputedStyle(e).display!=='none');
  for(const skin of await p.evaluate(()=>Object.keys(gummyBearSkins))){
   await p.evaluate(s=>showGummy(s,false),skin);await p.waitForTimeout(120);
   assert.equal(await pet.getAttribute('data-skin'),skin);
   await pet.screenshot({path:'assets/pet-studio/gummy-'+skin.toLowerCase().replaceAll(' ','-')+'.png'});
  }
  await p.evaluate(()=>showGummy('Cherry'));
  await p.locator('#sleep').click();await p.waitForTimeout(300);
  assert(await visible('.gb-mouth-sleep'));assert(!await visible('.gb-mouth-open'));
  assert.equal(await pet.locator('.gb-mouth-sleep').evaluate(e=>getComputedStyle(e).animationDuration),'2.8s');
  assert.equal(await pet.locator('.gb-body').evaluate(e=>e.getAnimations().length),1,'Sleep breathing stays active');
  await pet.screenshot({path:'work/gummy-sleep.png'});
  await p.locator('#sleep').click();await p.locator('#dance').click();
  assert(await visible('.gb-mouth-open'));assert(await visible('.gb-happy-eyes'));
  assert.equal(await pet.locator('.gb-body').evaluate(e=>getComputedStyle(e).animationName),'gb-jelly-dance');
  assert.equal(await pet.locator('.gb-body').evaluate(e=>getComputedStyle(e).animationDuration),'0.6s');
  await pet.screenshot({path:'work/gummy-dance.png'});await p.locator('#dance').click();
  await p.locator('#mouth').click();assert(await pet.evaluate(e=>e.classList.contains('gb-talking')));
  assert(await visible('.gb-mouth-open'));await p.waitForTimeout(150);await pet.screenshot({path:'work/gummy-mouth.png'});
  await p.locator('#ears').click();assert(await pet.evaluate(e=>e.classList.contains('gb-ear-wobble')));
  assert(!await pet.evaluate(e=>e.classList.contains('gb-talking')));
  assert.equal(await pet.locator('#gb-face-mask path').count(),0,'Ear roots must not be cut out');
  assert.equal(await pet.locator('.gb-body').getAttribute('filter'),'url(#gb-ear-flex)');
  await p.waitForFunction(()=>Math.abs(Number(document.querySelector('#gb-ear-flex feDisplacementMap').getAttribute('scale')))>3);
  await p.waitForTimeout(100);await pet.screenshot({path:'work/gummy-ears.png'});
  await p.locator('#sleep').click();assert(!await pet.evaluate(e=>e.classList.contains('gb-ear-wobble')));
  assert.equal(await pet.locator('.gb-body').getAttribute('filter'),null,'Sleep cancels ear deformation');
  await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>document.querySelector('.gummy-companion .pet-button').classList.contains('still'));
  assert.equal(await pet.locator('.gb-mouth-sleep').evaluate(e=>getComputedStyle(e).animationName),'none');
  await p.evaluate(()=>showGummy('Cherry',false));
  await pet.locator('.gb-body').evaluate(e=>e.style.visibility='hidden');await pet.screenshot({path:'work/gummy-platform-only.png'});
  assert.match(await pet.locator('.gb-platform image').getAttribute('href'),/platform-solid/);
  await pet.locator('.gb-body').evaluate(e=>e.style.visibility='');
  await pet.screenshot({path:'work/gummy-cherry.png'});assert.deepEqual(errors,[]);
  console.log('PASS: eight colors, solid separate platform, sleeping mouth and breathing, faster happy dance, chatter, ear wobble, action cancellation, and reduced motion.');
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
