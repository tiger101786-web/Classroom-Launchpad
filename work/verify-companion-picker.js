const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawn} = require('node:child_process');
const {chromium} = require('playwright');
const origin='http://127.0.0.1:8157';
const dataDir=fs.mkdtempSync(path.join(os.tmpdir(),'companion-picker-test-'));
const repo=path.resolve(__dirname,'..');
const server=spawn(process.execPath,['server.js'],{cwd:repo,env:{...process.env,PORT:'8157',DATA_DIR:dataDir,SESSION_SECRET:'companion-test',TEACHER_PIN:'654321',STUDENT_EMAIL_DOMAIN:'scscolts.org'},stdio:'pipe'});
let browser;
async function request(route, cookie='', body, method) {
  const response=await fetch(origin+route,{method:method||(body?'PUT':'GET'),headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie},body:body?JSON.stringify(body):undefined});
  return {status:response.status,data:await response.json(),cookie:(response.headers.get('set-cookie')||'').split(';')[0]};
}
(async()=>{
 try {
  for(let i=0;i<70;i++){try{if((await fetch(origin+'/api/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  assert.equal((await request('/api/companion-preferences')).status,401);
  const teacher=await request('/api/auth/teacher','',{pin:'654321'},'POST');
  assert.equal(teacher.status,200);
  const baseline={pet:'colt',color:'Gold',accessory:'none',motion:true};
  assert.deepEqual((await request('/api/companion-preferences',teacher.cookie)).data.preferences,baseline);
  await request('/api/launchpad-colt/customization',teacher.cookie,{name:'Blaze',nameplateVisible:false,platformVisible:false});
  assert.equal((await request('/api/companion-preferences',teacher.cookie,{...baseline,accessory:'<script>'})).status,400);
  const email='tiger101786@gmail.com';
  const reset=await request('/api/approved-students/'+encodeURIComponent(email)+'/reset-code',teacher.cookie,{},'POST');
  const student=await request('/api/auth/register','',{email,activationCode:reset.data.activationCode,name:'Test',grade:'4',password:'StudentTest123!'},'POST');
  assert.equal(student.status,200);
  await request('/api/companion-preferences',student.cookie,{pet:'dumpling',color:'Rose',accessory:'bow',motion:false});
  assert.deepEqual((await request('/api/companion-preferences',teacher.cookie)).data.preferences,baseline);
  browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
  for(const [role,cookie,emailAddress] of [['teacher',teacher.cookie,''],['student',student.cookie,email]]) {
    const context=await browser.newContext({viewport:{width:1280,height:900}});
    const equal=cookie.indexOf('=');
    await context.addCookies([{name:cookie.slice(0,equal),value:cookie.slice(equal+1),url:origin}]);
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin,{waitUntil:'domcontentloaded'});
    await page.evaluate(({role,email})=>window.dispatchEvent(new CustomEvent('classroom-launchpad-rendered',{detail:{screen:'home',auth:{authenticated:true,role,email}}})),{role,email:emailAddress});
    await page.locator('.companion-picker:visible').waitFor();
    const originalPanel=await page.locator('.launchpad-colt-controls').innerHTML();
    await page.getByLabel('Choose pet',{exact:true}).selectOption('dumpling');
    await page.locator('#launchpadColtRoot[hidden]').waitFor({state:'attached'});
    await page.getByRole('button',{name:'Customize dumpling',exact:true}).click();
    const frame=page.frameLocator('.companion-picker iframe');
    await frame.getByRole('button',{name:'Blue',exact:true}).click();
    await frame.getByRole('button',{name:'Headphones',exact:true}).click();
    await frame.getByRole('button',{name:'Bounce',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('.pet-status').textContent==='Saved');
    const saved=(await request('/api/companion-preferences',cookie)).data.preferences;
    assert.equal(saved.color,'Blue');assert.equal(saved.accessory,'headphones');assert.equal(saved.pet,'dumpling');
    await page.screenshot({path:path.join(repo,'work',`companion-${role}.png`)});
    await page.getByLabel('Choose pet',{exact:true}).selectOption('colt');
    await page.locator('#launchpadColtRoot:not([hidden])').waitFor({state:'attached'});
    assert.equal(await page.locator('.launchpad-colt-controls').innerHTML(),originalPanel);
    await page.locator('.launchpad-colt-character').click();
    await page.locator('.launchpad-colt-controls:not([hidden])').waitFor({state:'attached'});
    await page.locator('[data-colt-control=feed]').click();
    assert.equal(await page.locator('.launchpad-colt-companion').getAttribute('data-state'),'feeding');
    await page.getByLabel('Choose pet',{exact:true}).selectOption('dumpling');
    await page.waitForFunction(()=>document.querySelector('.pet-status').textContent==='Saved');
    await page.reload({waitUntil:'domcontentloaded'});
    await page.evaluate(({role,email})=>window.dispatchEvent(new CustomEvent('classroom-launchpad-rendered',{detail:{screen:'home',auth:{authenticated:true,role,email}}})),{role,email:emailAddress});
    await page.locator('.companion-picker iframe').waitFor();
    assert.equal(await page.getByLabel('Choose pet',{exact:true}).inputValue(),'dumpling');
    await page.getByRole('button',{name:'Customize dumpling',exact:true}).click();
    assert.equal(await page.frameLocator('iframe[title="Squishy Dumpling and customization controls"]').getByRole('button',{name:'Blue',exact:true}).getAttribute('aria-pressed'),'true');
    await page.frameLocator('.companion-picker iframe').getByRole('button',{name:'Blue',exact:true}).press('Escape');
    assert.equal(await page.locator('.companion-picker').evaluate(e=>e.classList.contains('is-expanded')),false);
    await page.getByRole('button',{name:'Customize dumpling',exact:true}).click();
    await page.route('**/api/companion-preferences',route=>route.request().method()==='PUT'?route.fulfill({status:503,contentType:'application/json',body:'{}'}):route.continue());
    await page.frameLocator('.companion-picker iframe').getByRole('button',{name:'Silver',exact:true}).click();
    await page.getByRole('button',{name:'Retry save',exact:true}).waitFor();
    await page.unroute('**/api/companion-preferences');
    await page.getByRole('button',{name:'Retry save',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('.pet-status').textContent==='Saved');
    assert.equal((await request('/api/companion-preferences',cookie)).data.preferences.color,'Silver');
    await page.setViewportSize({width:390,height:844});
    const box=await page.locator('.companion-picker').boundingBox();assert(box.x>=0 && box.x+box.width<=390);
    await page.evaluate(()=>window.dispatchEvent(new CustomEvent('classroom-launchpad-rendered',{detail:{screen:'login',auth:{authenticated:false,role:'guest',email:''}}})));
    assert.equal(await page.locator('.companion-picker').isVisible(),false);
    assert.equal(await page.locator('.companion-picker iframe').count(),0);
    if(role==='student') {
      await request('/api/launchpad-colt/config',teacher.cookie,{enabled:false});
      await page.reload({waitUntil:'domcontentloaded'});
      await page.waitForTimeout(400);
      assert.equal(await page.locator('.companion-picker').isVisible(),false);
      assert.equal(await page.locator('#launchpadColtRoot').isVisible(),false);
      await request('/api/launchpad-colt/config',teacher.cookie,{enabled:true});
    }
    assert.deepEqual(errors,[]);
    await context.close();
  }
  const colt=(await request('/api/launchpad-colt/customization',teacher.cookie)).data.customization;
  assert.equal(colt.name,'Blaze');assert.equal(colt.nameplateVisible,false);assert.equal(colt.platformVisible,false);
  const persisted=JSON.parse(fs.readFileSync(path.join(dataDir,'classroom-launchpad-db.json'),'utf8'));
  assert.equal(persisted.companionPreferences.teacher.pet,'dumpling');
  assert.equal(persisted.companionPreferences['student:'+email].accessory,'headphones');
  console.log('Companion picker passed: teacher/student persistence, isolation, reload, original Colt controls/feed, mobile, logout.');
 } finally {await browser?.close();server.kill();}
})().catch(error=>{console.error(error);process.exitCode=1;});
