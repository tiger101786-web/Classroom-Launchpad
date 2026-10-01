const fs=require('fs'),os=require('os'),path=require('path'),assert=require('assert/strict'),{spawn}=require('child_process'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),dataDir=fs.mkdtempSync(path.join(os.tmpdir(),'dual-shelves-')),origin='http://127.0.0.1:8197';
const server=spawn(process.execPath,[path.join(root,'server.js')],{cwd:root,env:{...process.env,PORT:'8197',DATA_DIR:dataDir,SESSION_SECRET:'dual-shelf-tests',TEACHER_PIN:'654321'},stdio:'ignore'});
async function request(url,body,cookie=''){
 const res=await fetch(origin+url,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie},...(body?{body:JSON.stringify(body)}:{})});
 return {status:res.status,data:await res.json(),cookie:(res.headers.get('set-cookie')||'').split(';')[0]};
}
(async()=>{let browser;try{
 for(let i=0;i<80;i++){try{if((await fetch(origin+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,100));}
 const teacher=await request('/api/auth/teacher',{pin:'654321'});assert.equal(teacher.status,200);
 const reset=await request('/api/approved-students/tiger101786%40gmail.com/reset-code',{},teacher.cookie);
 const student=await request('/api/auth/register',{email:'tiger101786@gmail.com',activationCode:reset.data.activationCode,password:'ShelfTests123!',name:'Test',grade:'4'});assert.equal(student.status,200);
 const left={enabled:true,theme:'disney-castle',slots:['disney-belle-bust','disney-genie-bust','disney-rapunzel-bust']};
 const right={enabled:true,theme:'disney-castle',slots:['superhero-iron-man-bust','superhero-loki-bust','superhero-thor-bust']};
 for(const cookie of [teacher.cookie,student.cookie]){
  assert.equal((await request('/api/home-shelf',left,cookie)).status,200);
  const saved=await request('/api/home-shelf',{...right,side:'right'},cookie);
  assert.deepEqual(saved.data.session.homeShelf,left);assert.deepEqual(saved.data.session.homeShelfRight,right);
  const hidden=await request('/api/home-shelf',{...right,enabled:false,side:'right'},cookie);
  assert.deepEqual(hidden.data.session.homeShelf,left);assert.equal(hidden.data.session.homeShelfRight.enabled,false);
  await request('/api/home-shelf',{...right,side:'right'},cookie);
  const loaded=await request('/api/auth/session',null,cookie);assert.deepEqual(loaded.data.session.homeShelfRight,right);
  assert.equal((await request('/api/home-shelf',{...right,side:'bad'},cookie)).status,400);
  assert.equal((await request('/api/home-shelf',{...right,slots:['invalid'],side:'right'},cookie)).status,400);
 }
 assert.equal((await request('/api/home-shelf',{...right,side:'right'})).status,401);
 browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 const context=await browser.newContext();const [name,...v]=student.cookie.split('=');
 await context.addCookies([{name,value:v.join('='),url:origin}]);const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin,{waitUntil:'domcontentloaded'});
 await page.locator('.home-collectible-shelf[data-shelf-side="right"]').waitFor();
 for(const width of [1600,1280,900,768,390]){
  await page.setViewportSize({width,height:1000});
  await page.waitForTimeout(150);
  const box=async selector=>page.locator(selector).boundingBox();
  const l=await box('[data-shelf-position="left"] .home-collectible-shelf'),r=await box('[data-shelf-position="right"] .home-collectible-shelf'),c=await box('.home-display-row .launch-scene-stage');
  assert(Math.abs(l.width-r.width)<1,'Equal shelf widths');
  if(width>800){assert(l.x+l.width<c.x&&c.x+c.width<r.x,'Shelves flank scene');assert(Math.abs(l.y-r.y)<1,'Same vertical placement for matching themes');}
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No page overflow');
  await page.locator('#home-top').screenshot({path:path.join(root,'work','dual-shelves-'+width+'.png')});
 }
 await page.setViewportSize({width:1280,height:1000});
 // Every artwork uses the same physical tabletop baseline, even with different styles.
 for(const theme of require('../collectible-shelf.js').themes){
  await page.locator('[data-shelf-position="right"] .collectible-shelf').evaluate((el,id)=>el.dataset.shelfTheme=id,theme.id);
  const bounds=await page.locator('.home-display-row .shelf-objects').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return r.bottom;}));
  assert(Math.abs(bounds[0]-bounds[1])<0.1,'Exact tabletop alignment: '+theme.id);
  const sections=await page.locator('.home-display-row .home-collectible-shelf').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {y:r.y,width:r.width,height:r.height};}));
  assert.deepEqual(sections[0],sections[1],'Identical shelf display dimensions: '+theme.id);
 }
 await page.locator('[data-shelf-position="right"] .collectible-shelf').evaluate(el=>el.dataset.shelfTheme='disney-castle');
 async function menu(side){const section=page.locator('.home-collectible-shelf[data-shelf-side="'+side+'"]');await section.hover();await section.locator('.shelf-customize').click();}
 await menu('right');
 await page.locator('#shelfSettingsMenuRight [data-action="collectibleShelf"]').click();
 await page.locator('#shelfSearch').fill('Winter Soldier');
 await page.locator('[data-shelf-item="superhero-winter-soldier-bust"]').click();
 await page.locator('#saveShelf').click();await page.locator('.shelf-dialog').waitFor({state:'detached'});
 let current=(await request('/api/auth/session',null,student.cookie)).data.session;
 assert.deepEqual(current.homeShelf,left);assert.equal(current.homeShelfRight.slots[0],'superhero-winter-soldier-bust');
 await menu('right');await page.locator('#shelfSettingsMenuRight [data-action="hideCollectibleShelf"]').click();
 await page.locator('[data-shelf-position="right"] .shelf-restore').waitFor();
 assert.equal(await page.locator('[data-shelf-position="left"] .home-collectible-shelf').count(),1);
 await page.locator('[data-shelf-position="right"] [data-action="showCollectibleShelf"]').click();
 await page.locator('[data-shelf-position="right"] .home-collectible-shelf').waitFor();
 await page.reload({waitUntil:'domcontentloaded'});await page.locator('[data-shelf-position="right"] .home-collectible-shelf').waitFor();
 current=(await request('/api/auth/session',null,student.cookie)).data.session;
 assert.equal(current.homeShelfRight.slots[0],'superhero-winter-soldier-bust');
 assert.deepEqual(current.homeShelf,left);
 assert.deepEqual(errors,[]);
 console.log('Dual shelves passed student/teacher persistence, independent edits and visibility, backward compatibility, invalid requests, reload, desktop/mobile layout, and right-side UI controls.');
}finally{await browser?.close();server.kill();}})().catch(e=>{console.error(e);process.exitCode=1});
