const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const crypto = require('node:crypto');
const {chromium} = require('playwright');
const {createCanvas} = require('@napi-rs/canvas');
const root = path.resolve(__dirname, '..');
const fixture = (w,h) => { const c=createCanvas(w,h), x=c.getContext('2d'); x.fillStyle='#d6a15c'; x.fillRect(0,0,w,h); x.fillStyle='#275659'; x.fillRect(w/2,0,w/2,h); return c.toBuffer('image/jpeg'); };
(async () => {
  const browser = await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
  let payload;
  try {
    for (const width of [390,1200]) {
      const page = await browser.newPage({viewport:{width,height:950}});
      const errors=[]; page.on('pageerror',e=>errors.push(e.message));
      await page.route('http://banner.test/**',r=>r.fulfill({path:path.join(root,new URL(r.request().url()).pathname)}));
      await page.setContent('<base href="http://banner.test/"><body data-theme="night"></body>');
      await page.addStyleTag({path:path.join(root,'styles.css')});
      await page.addStyleTag({path:path.join(root,'launchpad-scenes.css')});
      await page.addScriptTag({path:path.join(root,'profile-banners.js')});
      const open = () => page.evaluate(()=>ProfileBanners.open({selected:'colt',avatar:'',name:'Test Student',role:'Student',save:async value=>{window.saved=value;if(window.failSave)throw Error('Connection lost. Try again.');return {};},onSave:()=>{}}));
      await open();
      assert.equal(await page.locator('[data-banner-choice]:visible').count(),6);
      const upload = (w,h) => page.locator('#customBannerFile').setInputFiles({name:'test.jpg',mimeType:'image/jpeg',buffer:fixture(w,h)});
      await upload(80,80);
      await page.waitForFunction(()=>document.querySelector('#customBannerQuality').textContent.includes('too tiny'));
      await upload(400,200);
      await page.waitForFunction(()=>!document.querySelector('#customBannerControls').hidden);
      assert.equal(await page.locator('#customBannerLayout').inputValue(),'framed');
      assert.equal(await page.locator('#useCustomBanner').textContent(),'Back to my image');
      assert.equal(await page.locator('.custom-banner-actions button').count(),2);
      const actionGap=await page.evaluate(()=>document.querySelector('.custom-banner-actions').getBoundingClientRect().top-document.querySelector('#customBannerQuality').getBoundingClientRect().bottom);
      assert(actionGap>=10,'Banner actions need breathing room below the status text');
      await page.locator('#customBannerLayout').selectOption('full');
      assert.match(await page.locator('#customBannerQuality').textContent(),/blurry/);
      await upload(1600,600);
      await page.waitForFunction(()=>document.querySelector('#customBannerQuality').textContent.includes('enough detail'));
      await page.locator('#customBannerZoom').fill('3');
      await page.locator('#customBannerZoom').dispatchEvent('input');
      assert.match(await page.locator('#customBannerQuality').textContent(),/blurry/);
      await page.locator('#customBannerLayout').selectOption('framed');
      const pixels = await page.locator('#profileBannerPreview img').evaluate(async img => {
        await img.decode();
        const c = document.createElement('canvas'); c.width=1200; c.height=400;
        const x=c.getContext('2d'); x.drawImage(img,0,0);
        return [Array.from(x.getImageData(0,200,1,1).data),Array.from(x.getImageData(1100,0,1,1).data),Array.from(x.getImageData(1100,399,1,1).data)];
      });
      assert(pixels[1][1]>60 && pixels[2][1]>60,'image reaches top and bottom without empty margins');
      for (const layout of ['full','framed']) {
        await page.locator('#customBannerLayout').selectOption(layout);
        for (const theme of ['night','light']) {
          await page.evaluate(t=>document.body.dataset.theme=t,theme);
          const cover=page.locator('#profileBannerPreview .profile-banner-cover');
          const png=await cover.screenshot();
          const {data,info}=await require('sharp')(png).removeAlpha().raw().toBuffer({resolveWithObject:true});
          const offset=(Math.floor(info.height/2)*info.width+2)*info.channels;
          const rgb=Array.from(data.slice(offset,offset+3));
          assert(theme==='light' ? rgb.every(v=>v>180) : rgb.every(v=>v<110),`${layout}/${theme}: ${rgb}`);
          assert.equal(await cover.getAttribute('data-custom-layout'),layout==='full'?'full':'half');
          await cover.screenshot({path:path.join(os.tmpdir(),`banner-${layout}-${theme}-${width}.png`)});
        }
      }
      await page.evaluate(()=>document.body.dataset.theme='night');
      await page.screenshot({path:path.join(os.tmpdir(),`custom-banner-${width}.png`),fullPage:true});
      await page.evaluate(()=>window.failSave=true);
      await page.locator('#saveProfileBanner').click();
      await page.waitForFunction(()=>document.querySelector('#profileBannerStatus').textContent.includes('Connection lost'));
      assert.equal(await page.locator('#customBannerFile').isDisabled(),false);
      await page.evaluate(()=>window.failSave=false);
      await page.locator('#saveProfileBanner').click();
      payload=await page.evaluate(()=>window.saved);
      assert.match(payload.image,/^data:image\/jpeg;base64,/);
      await open();
      await page.locator('#removeCustomBanner').click();
      assert.equal(await page.locator('#profileBannerPreview img').count(),0);
      assert(!await page.locator('.custom-banner-editor').textContent().then(t=>t.includes('Choose “No banner”')));
      await page.locator('#saveProfileBanner').click();
      assert.equal(await page.evaluate(()=>window.saved),'none');
      await open();
      await page.locator('[data-banner-close]').last().click();
      assert.equal(await page.locator('dialog').count(),0);
      assert.deepEqual(errors,[]);
      await page.close();
    }
  } finally { await browser.close(); }
  // Execute the real endpoint in isolation, using a temporary data directory.
  const source=fs.readFileSync(path.join(root,'server.js'),'utf8');
  const start=source.indexOf('  if (pathname === "/api/profile-banner" && req.method === "POST")');
  const end=source.indexOf('  if (pathname === "/api/profile-frame"',start);
  const teacherAuthorKey='a'.repeat(64), studentKey='b'.repeat(64);
  let db={approvedStudents:[{email:'student@test',profileBanner:'none'}],threads:[{authorKey:studentKey,replies:[{authorKey:studentKey}]}]};
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'banner-api-test-'));
  let body, result, role='student';
  const context={require,Buffer,Date,fs,path,crypto,profileAvatarDir:dir,maxProfileAvatarBytes:700*1024,teacherAuthorKey,
    profileBannerIds:new Set(['none','colt']),cleanProfileBanner:v=>typeof v==='string'&&/^custom-[a-f0-9]{64}-[0-9]{13}(?:-(?:full|half))?$/.test(v)?v:'none',
    requireSameOrigin:()=>true, requireRole:()=>({role,email:'student@test'}),readBody:async()=>body,readDb:()=>structuredClone(db),writeDb:v=>{db=v;},
    studentAuthorKey:()=>studentKey,normalizeEmail:x=>x,normalizeApprovedStudents:x=>x,normalizeModeratedThreads:x=>x,visibleApprovedThreads:x=>x,
    profileBannerForSession:(s,d)=>s.role==='teacher'?d.teacherProfileBanner:d.approvedStudents[0].profileBanner,
    publicSession:(s,d)=>({profileBanner:s.role==='teacher'?d.teacherProfileBanner:d.approvedStudents[0].profileBanner}),
    fileMatchesExtension:b=>b[0]===255&&b[1]===216&&b[2]===255,sendJson:(r,status,data)=>{result={status,data};}};
  vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf('function isPreparedBannerJpeg('),source.indexOf("['blue-fire', 'rainbow-fire', 'nugget-party']")),context);
  const handler=vm.runInContext(`(async function(req,res,pathname){${source.slice(start,end)}})`,context);
  const call=async value=>{body={profileBanner:value};await handler({method:'POST'},{},'/api/profile-banner');return result;};
  assert.equal((await call(payload)).status,200);
  const saved=db.approvedStudents[0].profileBanner;
  assert.match(saved,/^custom-/);
  assert.equal(db.threads[0].profileBanner,saved);assert.equal(db.threads[0].replies[0].profileBanner,saved);
  assert(fs.existsSync(path.join(dir,`banner-${studentKey}.jpg`)));
  const retained = await require('@napi-rs/canvas').loadImage(fs.readFileSync(path.join(dir,`banner-source-${studentKey}.jpg`)));
  assert.equal(retained.width,1600); assert.equal(retained.height,600);
  const imageStart=source.indexOf('  const bannerImageRequest =');
  const imageEnd=source.indexOf('  const avatarRequest =',imageStart);
  const getImage=vm.runInContext(`(async function(req,res,pathname){${source.slice(imageStart,imageEnd)}})`,context);
  const {Writable}=require('node:stream');
  let imageHeaders, downloaded=[];
  const response=new Writable({write(chunk,encoding,done){downloaded.push(chunk);done();}});
  response.writeHead=(status,headers)=>{assert.equal(status,200);imageHeaders=headers;};
  const finished=new Promise(resolve=>response.on('finish',resolve));
  await getImage({method:'GET'},response,`/api/profile-banner-image/${saved}`);
  await finished;
  assert.equal(imageHeaders['Content-Type'],'image/jpeg');
  assert(Buffer.concat(downloaded).length>0);
  assert.equal(imageHeaders['Cache-Control'],'private, no-cache');
  role='teacher';
  await getImage({method:'GET'},{},`/api/profile-banner-source/${saved}`);
  assert.equal(result.status,404,'Other accounts cannot download the uncropped source');
  role='student';
  assert.equal((await call({...payload,sourceImage:'data:image/jpeg;base64,'+fixture(1601,10).toString('base64')})).status,400);
  assert.equal((await call(saved)).status,200);
  assert.equal((await call(`custom-${teacherAuthorKey}-${Date.now()}`)).status,400);
  assert.equal((await call({image:'data:image/svg+xml;base64,abc'})).status,400);
  assert.equal((await call({image:'data:image/jpeg;base64,'+fixture(20,20).toString('base64')})).status,400);
  assert.equal((await call('colt')).status,200);assert.equal(db.approvedStudents[0].profileBanner,'colt');
  assert.equal((await call('none')).status,200);
  await getImage({method:'GET'},{},`/api/profile-banner-image/${saved}`);assert.equal(result.status,404);
  role='teacher';assert.equal((await call(payload)).status,200);assert.match(db.teacherProfileBanner,/^custom-/);
  console.log('PASS: custom banners on desktop/mobile, warnings, crop, framed layout, cancel/retry, premades, removal, student/teacher persistence and invalid upload/ownership checks.');
})().catch(e=>{console.error(e);process.exitCode=1;});
