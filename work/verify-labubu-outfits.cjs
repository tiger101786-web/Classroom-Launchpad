const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const origin='http://127.0.0.1:8165',dir=fs.mkdtempSync(path.join(os.tmpdir(),'labubu-outfits-'));
const server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:'8165',DATA_DIR:dir,SESSION_SECRET:'outfit-test',TEACHER_PIN:'654321'},stdio:'ignore'});let browser;
(async()=>{try{
 for(let i=0;i<100;i++){try{if((await fetch(origin+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
 const login=await fetch(origin+'/api/auth/teacher',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({pin:'654321'})});assert.equal(login.status,200);
 const cookie=login.headers.get('set-cookie').split(';')[0],headers={'Content-Type':'application/json',Origin:origin,Cookie:cookie};
 const base={pet:'labubu',color:'Gold',accessory:'none',motion:true,labubu:{skin:'Tan',name:'Labubu',headwear:'none',outfit:'none',neckwear:'none',nameplate:true,platform:true,motion:true,size:'large',asleep:false}};
 for(const [headwear,outfit,neckwear] of [['mustard-cap','mustard-overalls','none'],['black-bucket','black-streetwear','gold-chain'],['black-hood','black-hoodie','none'],['denim-cap','denim-overalls','none'],['sage-bucket','sage-jacket','compass'],['navy-hood','navy-varsity','none']]){
  const input={...base,labubu:{...base.labubu,headwear,outfit,neckwear}};
  assert.equal((await fetch(origin+'/api/companion-preferences',{method:'PUT',headers,body:JSON.stringify(input)})).status,200);
  const saved=(await (await fetch(origin+'/api/companion-preferences',{headers})).json()).preferences.labubu;
  for(const key of ['headwear','outfit','neckwear'])assert.equal(saved[key],input.labubu[key]);
 }
 assert.equal((await fetch(origin+'/api/companion-preferences',{method:'PUT',headers,body:JSON.stringify({...base,labubu:{...base.labubu,outfit:'invalid'}})})).status,400);
 browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1080}}),eq=cookie.indexOf('=');
 await context.addCookies([{name:cookie.slice(0,eq),value:cookie.slice(eq+1),url:origin}]);
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route(origin+'/work/labubu-outfits.html',route=>route.fulfill({contentType:'text/html',body:fs.readFileSync(path.join(__dirname,'labubu-outfits.html'),'utf8')}));
 await page.goto(origin+'/work/labubu-outfits.html');await page.waitForTimeout(1000);
 for(const skin of await page.locator('#skin option').allTextContents()){await page.selectOption('#skin',skin);await page.waitForFunction(s=>[...document.querySelectorAll('.labubu-companion')].every(e=>e.dataset.renderedSkin===s),skin)}
 await page.selectOption('#skin','Tan');await page.waitForTimeout(500);
 await page.screenshot({path:path.join(dir,'outfits.png'),fullPage:true});
 for(const action of ['hand','ears','hello']){await page.evaluate(a=>fittings.forEach(f=>f.pet.play(a)),action);await page.waitForTimeout(850);await page.screenshot({path:path.join(dir,action+'.png'),fullPage:true})}
 await page.evaluate(()=>fittings.forEach(f=>{f.radio=true;f.render()}));
 assert.equal(await page.locator('[data-lc-slot="headwear"]:visible').count(),0);
 assert.equal(await page.locator('[data-lc-slot="outfit"]:visible').count(),6);
 await page.evaluate(()=>fittings.forEach(f=>{f.radio=false;f.prefs.asleep=true;f.render()}));
 assert.equal(await page.locator('[data-lc-slot="headwear"]:visible').count(),6);
 await page.goto(origin,{waitUntil:'domcontentloaded'});
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('classroom-launchpad-rendered',{detail:{screen:'home',auth:{authenticated:true,role:'teacher'}}})));
 await page.waitForFunction(()=>document.querySelector('.companion-picker select')?.disabled===false);
 await page.locator('.header-account-summary').first().click();await page.locator('.header-account-menu [data-companion-open]').first().click();
 const studio=page.locator('.pet-studio');await studio.locator('#pet-select').selectOption('labubu');await studio.locator('[data-subtab="accessories"]').click();
 assert.equal(await studio.locator('[data-choice-key="headwear"]').count(),8);assert.equal(await studio.locator('[data-choice-key="outfit"]').count(),7);assert.equal(await studio.locator('[data-choice-key="neckwear"]').count(),3);
 await studio.locator('[data-choice="mustard-overalls"]').click();await studio.locator('[data-choice="mustard-cap"]').click();await page.waitForTimeout(700);
 assert(await studio.locator('[data-lc-value="mustard-overalls"]').isVisible());
 await studio.screenshot({path:path.join(dir,'studio.png')});
 assert.deepEqual(errors,[]);console.log('PASS: saved outfits, validation, all seven colors, waving, ear wiggles, music priority, sleep and Studio categories. Screenshots: '+dir);
 }finally{if(browser)await browser.close();server.kill()}
})().catch(e=>{console.error(e);process.exitCode=1});
