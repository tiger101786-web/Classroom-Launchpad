const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const origin='http://127.0.0.1:8167';const dir=fs.mkdtempSync(path.join(os.tmpdir(),'pet-studio-test-'));
const server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:'8167',DATA_DIR:dir,SESSION_SECRET:'studio-test',TEACHER_PIN:'654321',STUDENT_EMAIL_DOMAIN:'scscolts.org'},stdio:'pipe'});let browser;
async function req(route,cookie='',body,method){const r=await fetch(origin+route,{method:method||(body?'PUT':'GET'),headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json(),cookie:(r.headers.get('set-cookie')||'').split(';')[0]}}
(async()=>{try{
for(let i=0;i<80;i++){try{if((await fetch(origin+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
const teacher=await req('/api/auth/teacher','',{pin:'654321'},'POST');assert.equal(teacher.status,200);
const email='tiger101786@gmail.com';const reset=await req('/api/approved-students/'+encodeURIComponent(email)+'/reset-code',teacher.cookie,{},'POST');const student=await req('/api/auth/register','',{email,activationCode:reset.data.activationCode,name:'Studio Test',grade:'4',password:'StudentTest123!'},'POST');assert.equal(student.status,200);
browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
for(const [role,cookie,user] of [['teacher',teacher.cookie,''],['student',student.cookie,email]]){
const context=await browser.newContext({viewport:{width:1440,height:1000}});const equal=cookie.indexOf('=');await context.addCookies([{name:cookie.slice(0,equal),value:cookie.slice(equal+1),url:origin}]);
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(origin,{waitUntil:'domcontentloaded'});
const home=()=>page.evaluate(({role,email})=>window.dispatchEvent(new CustomEvent('classroom-launchpad-rendered',{detail:{screen:'home',auth:{authenticated:true,role,email}}})),{role,email:user});await home();await page.waitForFunction(()=>document.querySelector('.companion-picker select')?.disabled===false);
const studio=page.locator('.pet-studio');const open=async()=>{await page.locator('.header-account-summary').first().click();await page.locator('.header-account-menu [data-companion-open]').first().click();await studio.waitFor({state:'visible'})};
await open();
for(const size of [{width:1366,height:768},{width:1024,height:600},{width:800,height:600},{width:390,height:844},{width:320,height:568},{width:844,height:390}]){
 await page.setViewportSize(size);
 for(const theme of ['crimson','woodland','sky','scrapbook']){
  await studio.evaluate((e,t)=>e.dataset.theme=t,theme);
  for(const tab of ['appearance','name','play','settings']){
   await studio.locator('[data-tab="'+tab+'"]').click();
   await studio.evaluate(e=>e.scrollTop=0);
   if(role==='teacher'&&theme==='crimson'&&tab==='appearance'&&(size.width===1366||size.width===390))await page.screenshot({path:'work/studio-responsive-'+size.width+'.png'});
   const box=await studio.boundingBox();
   assert(box.y>=-1&&box.y+box.height<=size.height+1,JSON.stringify({size,theme,tab,box}));
   assert(await studio.evaluate(e=>e.scrollWidth<=e.clientWidth+1),'Horizontal overflow '+JSON.stringify({size,theme,tab}));
   await studio.locator('#undo').scrollIntoViewIfNeeded();
   const undo=await studio.locator('#undo').boundingBox();
   assert(undo.y>=0&&undo.y+undo.height<=size.height,'Unreachable footer '+JSON.stringify({size,theme,tab,undo}));
  }
 }
}
assert.deepEqual(errors,[]);
await context.close();
}
console.log('PASS: all four themes and tabs fit six screen sizes; footer reachable, no horizontal overflow or browser errors.');
}finally{await browser?.close();server.kill()}})().catch(e=>{console.error(e);process.exitCode=1});

