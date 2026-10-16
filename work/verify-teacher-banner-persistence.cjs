const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawn} = require('node:child_process');
const {createCanvas} = require('@napi-rs/canvas');
const root = path.resolve(__dirname, '..');
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'teacher-banner-persistence-'));
const origin = 'http://127.0.0.1:8196';
const server = spawn(process.execPath, ['server.js'], {cwd:root, env:{...process.env, PORT:'8196', DATA_DIR:dataDir, SESSION_SECRET:'banner-regression-test', TEACHER_PIN:'654321'}, stdio:['ignore','pipe','pipe']});
let logs=''; server.stderr.on('data',chunk=>logs+=chunk);
(async()=>{
  try {
    let ready=false;
    for(let i=0;i<80;i++) {
      try { if((await fetch(origin+'/api/health')).ok) {ready=true;break;} } catch {}
      await new Promise(r=>setTimeout(r,100));
    }
    assert(ready,logs);
    const login=await fetch(origin+'/api/auth/teacher',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({pin:'654321'})});
    assert.equal(login.status,200);
    const headers={Origin:origin,'Content-Type':'application/json',Cookie:login.headers.get('set-cookie').split(';')[0]};
    const save=async profileBanner=>{
      const r=await fetch(origin+'/api/profile-banner',{method:'POST',headers,body:JSON.stringify({profileBanner})});
      const result=await r.json(); assert.equal(r.status,200,JSON.stringify(result)); return result.session.profileBanner;
    };
    const canvas=createCanvas(1200,400),ctx=canvas.getContext('2d');
    ctx.fillStyle='#579488';ctx.fillRect(0,0,1200,400);
    const id=await save({image:'data:image/jpeg;base64,'+canvas.toBuffer('image/jpeg').toString('base64')});
    assert.match(id,/^custom-/);
    const stored=JSON.parse(fs.readFileSync(path.join(dataDir,'classroom-launchpad-db.json'),'utf8'));
    assert.equal(stored.teacherProfileBanner,id,'Teacher banner must survive the real database writer');
    const session=await (await fetch(origin+'/api/auth/session',{headers})).json();
    assert.equal(session.session.profileBanner,id,'A fresh session must retain the banner');
    const image=await fetch(origin+'/api/profile-banner-image/'+id,{headers});
    assert.equal(image.status,200,'Saved image must be retrievable after database reload');
    assert.match(image.headers.get('content-type'),/image\/jpeg/);
    assert((await image.arrayBuffer()).byteLength>100);
    assert.equal((await fetch(origin+'/api/profile-banner-source/'+id,{headers})).status,200);
    const {chromium} = require('playwright');
    const browser = await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
    try {
      const context = await browser.newContext();
      const [cookieName,...cookieValue] = headers.Cookie.split('=');
      await context.addCookies([{name:cookieName,value:cookieValue.join('='),url:origin}]);
      const page = await context.newPage();
      await page.goto(origin);
      await page.evaluate(()=>{document.body.innerHTML='';});
      await page.addScriptTag({path:path.join(root,'profile-banners.js')});
      const open = selected => page.evaluate(selected=>ProfileBanners.open({selected,avatar:'',name:'Teacher',role:'Teacher',save:async profileBanner=>{
        const response=await fetch('/api/profile-banner',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({profileBanner})});
        const result=await response.json();if(!response.ok)throw Error(result.error);return result;
      },onSave:result=>{window.savedBanner=result.session.profileBanner;}}),selected);
      await open(id);
      await page.waitForFunction(()=>!document.querySelector('#customBannerLayout').disabled);
      assert(await page.locator('#customBannerLayout').isVisible());
      await page.locator('#customBannerLayout').selectOption('framed');
      await page.locator('#saveProfileBanner').click();
      await page.waitForFunction(()=>window.savedBanner?.endsWith('-half'));
      const half=await page.evaluate(()=>window.savedBanner);
      await open(half);
      await page.waitForFunction(()=>!document.querySelector('#customBannerLayout').disabled);
      assert.equal(await page.locator('#customBannerLayout').inputValue(),'framed');
      await page.locator('#customBannerLayout').selectOption('full');
      await page.locator('#saveProfileBanner').click();
      await page.waitForFunction(()=>window.savedBanner?.endsWith('-full'));
      const full=await page.evaluate(()=>window.savedBanner);
      // Simulate an older saved banner with no retained source.
      const owner=full.split('-')[1];
      fs.unlinkSync(path.join(dataDir,'profile-avatars',`banner-source-${owner}.jpg`));
      await open(full);
      await page.waitForFunction(()=>!document.querySelector('#customBannerLayout').disabled);
      assert(await page.locator('#customBannerLayout').isVisible());
      await page.locator('#customBannerLayout').selectOption('framed');
      await page.locator('#saveProfileBanner').click();
      await page.waitForFunction(()=>window.savedBanner?.endsWith('-half'));
    } finally {await browser.close();}
    await save('colt');
    assert.equal(JSON.parse(fs.readFileSync(path.join(dataDir,'classroom-launchpad-db.json'),'utf8')).teacherProfileBanner,'colt');
    await save('none');
    assert.equal(JSON.parse(fs.readFileSync(path.join(dataDir,'classroom-launchpad-db.json'),'utf8')).teacherProfileBanner,'none');
    assert.equal((await fetch(origin+'/api/profile-banner-image/'+id,{headers})).status,404);
    console.log('PASS: real teacher login, upload, disk persistence, fresh session, image download, premade selection and removal.');
  } finally {server.kill();}
})().catch(error=>{console.error(error);process.exitCode=1;});
