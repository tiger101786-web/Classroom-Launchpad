const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),origin='http://127.0.0.1:8199';
const server=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,PORT:'8199',DATA_DIR:fs.mkdtempSync(path.join(os.tmpdir(),'startup-loading-')),SESSION_SECRET:'startup-test',TEACHER_PIN:'654321'},stdio:'ignore'});
const dirs={colt:'robo-colt',gummy:'gummy-bear',eagle:'eagle-pet',labubu:'labubu-pet',roblox:'roblox-pet',highland:'highland-pet',saber:'saber-pet',nugget:'nugget-pet'};
let browser;
(async()=>{try{
 for(let i=0;i<100;i++){try{if((await fetch(origin+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 async function session(kind){
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  if(kind){assert.equal((await context.request.post(origin+'/api/auth/teacher',{headers:{Origin:origin},data:{pin:'654321'}})).status(),200);
   const prefs=(await (await context.request.get(origin+'/api/companion-preferences')).json()).preferences;
   assert.equal((await context.request.put(origin+'/api/companion-preferences',{headers:{Origin:origin},data:{...prefs,pet:kind}})).status(),200);
  }
  const page=await context.newPage(),requests=[],errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push({path:new URL(r.url()).pathname,type:r.resourceType()}));
  return {context,page,requests,errors};
 }
 for(const kind of [null,'colt','nugget','eagle','highland','dumpling']){
  const {context,page,requests,errors}=await session(kind);
  await page.goto(origin,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('.companion-picker select'));
  if(kind){await page.waitForFunction(()=>!document.querySelector('.companion-picker select').disabled);await page.locator(kind==='dumpling'?'.dumpling-companion':'.'+(kind==='colt'?'robo':kind)+'-companion').waitFor({state:'visible'});}
  await page.waitForTimeout(250);
  const loaded=requests.filter(r=>r.type==='script'||r.type==='stylesheet').map(r=>r.path);
  for(const [id,dir] of Object.entries(dirs))assert.equal(loaded.some(p=>p.startsWith('/'+dir+'/')),kind===id,(kind||'guest')+': only the equipped pet bundle loads; found '+dir);
  const logo=page.locator('.home-title-art img');if(await logo.count())assert.match(await logo.evaluate(e=>e.currentSrc),/title-lossless\.webp/);
  assert(requests.some(r=>r.path.endsWith('title-lossless.webp')),'Lossless logo requested');
  assert(!requests.some(r=>r.path.endsWith('classroom-launchpad-title.png')),'No duplicate PNG logo download');
  if(kind==='nugget'){
   await page.locator('.header-account-summary').first().click();await page.locator('[data-companion-open]').first().click();
   const studio=page.locator('.pet-studio');await studio.waitFor({state:'visible'});
   for(const name of ['colt','squishy','gummy','eagle','labubu','roblox','highland','saber','nugget']){await studio.locator('#pet-select').selectOption(name);assert(await studio.locator(name==='squishy'?'.dumpling-companion':'.'+(name==='colt'?'robo':name)+'-companion').isVisible(),name+' live studio preview');}
   const before=requests.filter(r=>r.type==='script').length;
   await studio.locator('.studio-close').click();await page.locator('.header-account-summary').first().click();await page.locator('[data-companion-open]').first().click();await studio.waitFor({state:'visible'});
   assert.equal(requests.filter(r=>r.type==='script').length,before,'Reopening Studio does not reload scripts');
   const scriptPaths=requests.filter(r=>r.type==='script').map(r=>r.path);assert.equal(new Set(scriptPaths).size,scriptPaths.length,'No duplicate script requests');
  }
  assert.deepEqual(errors,[]);console.log('PASS startup '+(kind||'guest')+': deferred unused pet scripts/styles; single logo delivery; no errors');await context.close();
 }
 {
  const {context,page,requests,errors}=await session('highland');let attempts=0;
  await page.route('**/highland-pet/interactive.js?*',route=>++attempts===1?route.abort():route.continue());
  await page.goto(origin,{waitUntil:'domcontentloaded'});await page.locator('.pet-runtime-error').waitFor();
  await page.getByRole('button',{name:'Try again',exact:true}).click();await page.locator('.highland-companion').waitFor({state:'visible'});
  assert.equal(attempts,2);assert.equal(await page.locator('.pet-runtime-error').count(),0);assert.deepEqual(errors,[]);console.log('PASS failed pet download retries successfully');await context.close();
 }
 {
  const {context,page,errors}=await session('nugget');let release,started;
  const held=new Promise(resolve=>{release=resolve}),requested=new Promise(resolve=>{started=resolve});
  await page.route('**/nugget-pet/interactive.js?*',async route=>{started();await held;await route.continue();});
  await page.goto(origin,{waitUntil:'domcontentloaded'});await requested;
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('classroom-launchpad-rendered',{detail:{screen:'home',auth:{authenticated:false,role:'guest'}}})));release();
  await page.waitForFunction(()=>typeof window.createNuggetPet==='function');await page.waitForTimeout(200);
  assert(!(await page.locator('.nugget-companion').isVisible()),'A completed old-account load stays hidden after logout');assert.deepEqual(errors,[]);console.log('PASS logout during delayed pet load');await context.close();
 }
}finally{await browser?.close();server.kill();}})().catch(e=>{console.error(e);process.exitCode=1;});
