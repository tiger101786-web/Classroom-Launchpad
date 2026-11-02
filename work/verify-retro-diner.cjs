const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const origin='http://127.0.0.1:8194',output='C:/Users/Sinister/.codex/visualizations/2026/10/31/01a19363-e9fe-7dc2-86a1-e1134a57d914';
const server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:'8194',DATA_DIR:fs.mkdtempSync(path.join(os.tmpdir(),'diner-studio-')),SESSION_SECRET:'diner-test',TEACHER_PIN:'654321'},stdio:'ignore'});let browser;
(async()=>{try{
 for(let i=0;i<100;i++){try{if((await fetch(origin+'/api/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 assert.equal((await context.request.post(origin+'/api/auth/teacher',{headers:{Origin:origin},data:{pin:'654321'}})).status(),200);
 const page=await context.newPage(),errors=[],dinerRequests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().includes('diner-room-backdrop-v2.png'))dinerRequests.push(r.url());});
 const open=async()=>{await page.locator('.header-account-summary').first().click();await page.locator('.header-account-menu [data-companion-open]').first().click();await page.locator('.pet-studio').waitFor({state:'visible'});};
 await page.goto(origin);assert.equal(dinerRequests.length,0);await open();const studio=page.locator('.pet-studio');
 assert.equal(await studio.getAttribute('data-theme'),'crimson');assert.equal(dinerRequests.length,0,'Diner art loads only when chosen');
 const preferences=async()=>(await (await context.request.get(origin+'/api/companion-preferences')).json()).preferences;
 const before=await preferences();await studio.getByLabel('Studio theme',{exact:true}).selectOption('diner');assert.equal(await studio.getAttribute('data-theme'),'diner');assert.deepEqual(await preferences(),before,'Theme does not change pet/account preferences');
 await page.evaluate(async()=>{const i=new Image();i.src='/assets/pet-studio/diner-room-backdrop-v2.png';await i.decode();});
 await studio.locator('#pet-select').selectOption('nugget');await page.waitForFunction(()=>document.querySelector('.nugget-companion')?.dataset.ready==='true');
 await studio.locator('[data-subtab=skins]').click();await studio.locator('#skin-search').fill('Bacon Cheddar');await studio.locator('[data-skin-choice="Bacon Cheddar"]').click();
 await page.waitForFunction(()=>document.querySelector('.nugget-companion .pet-button')?.dataset.renderedSkin==='Bacon Cheddar');
 await page.waitForFunction(()=>document.querySelector('[data-nugget-thumb="Bacon Cheddar"]')?.complete&&document.querySelector('[data-nugget-thumb="Bacon Cheddar"]').naturalWidth===320);
 await studio.locator('#skin-search').fill('');
 for(const [width,height] of [[1440,1000],[1366,768],[800,1000],[390,844]]){
  await page.setViewportSize({width,height});let expected;
  for(const tab of ['appearance','name','play','settings']){
   await studio.locator('[data-tab='+tab+']').click();
   const geometry=await studio.evaluate(d=>{const p=d.querySelector('#tab-content').getBoundingClientRect(),s=d.querySelector('.studio').getBoundingClientRect();return {panel:p.height,studio:s.height,overflow:d.scrollWidth>d.clientWidth+1};});
   assert.equal(geometry.overflow,false,'No horizontal overflow at '+width+' '+tab);
   if(width>700&&expected){assert(Math.abs(geometry.panel-expected.panel)<1);assert(Math.abs(geometry.studio-expected.studio)<1,'Stable theme size across tabs');}else expected=geometry;
  }
  await studio.locator('[data-tab=appearance]').click();
  const layering=await studio.evaluate(d=>{const panel=d.querySelector('#tab-content'),footer=d.querySelector('.studio-footer'),group=d.querySelector('.pet-switch'),select=d.querySelector('#pet-select'),shell=d.querySelector('.studio');const p=panel.getBoundingClientRect(),f=footer.getBoundingClientRect(),g=group.getBoundingClientRect(),s=shell.getBoundingClientRect(),style=getComputedStyle(select);return {gap:f.top-p.bottom,panelBackground:getComputedStyle(panel).backgroundImage,footerBackground:getComputedStyle(footer).backgroundColor,center:(g.left+g.width/2-s.left)/s.width,align:style.textAlign,last:style.textAlignLast};});
  assert(layering.gap<=10.1,'Standard footer spacing stays inside the opaque controls frame');
  assert(layering.panelBackground.includes('rgb(255, 242, 220)'),'Opaque cream panel covers the diner scenery');
  assert.equal(layering.footerBackground,'rgb(255, 240, 212)');
  assert.equal(layering.align,'center');assert.equal(layering.last,'center');
  if(width>700)assert(Math.abs(layering.center-.843)<.005,'Companion label and menu centered in chrome header');
  assert.equal(await studio.locator('[data-subtab=skins]').evaluate(e=>getComputedStyle(e).color),'rgb(134, 25, 27)','Selected cream tab keeps dark readable text');
  assert(await studio.locator('.tabs button').evaluateAll(buttons=>buttons.every(b=>b.scrollWidth<=b.clientWidth+1)),'Tab labels remain readable without clipping');
  await studio.evaluate(d=>d.scrollTop=0);await studio.screenshot({path:path.join(output,'retro-diner-nugget-'+width+'.png')});
  if(width===390){await studio.locator('#skin-search').scrollIntoViewIfNeeded();await studio.screenshot({path:path.join(output,'retro-diner-mobile-controls.png')});}
 }
 await page.setViewportSize({width:1440,height:1000});await studio.locator('#pet-select').selectOption('eagle');await studio.screenshot({path:path.join(output,'retro-diner-eagle.png')});
 const palette=await studio.locator('#pet-select').evaluate(e=>{const s=getComputedStyle(e);return {text:s.color,fill:s.webkitTextFillColor,scheme:s.colorScheme};});assert.equal(palette.scheme,'light');assert.equal(palette.text,palette.fill);
 await studio.locator('#pet-select').selectOption('nugget');await studio.locator('[data-subtab=accessories]').click();await studio.locator('[data-choice-key=basketAccessory][data-choice=tater-tots]').click();await page.waitForFunction(()=>document.querySelector('.nugget-companion .pet-button')?.dataset.basketAccessory==='tater-tots');
 await studio.locator('[data-tab=play]').click();await studio.locator('#greet').click();assert.equal(await page.locator('.nugget-companion').getAttribute('data-state'),'hello');await studio.locator('#dance').click();assert.equal(await page.locator('.nugget-companion').getAttribute('data-state'),'dance');await studio.locator('#dance').click();
 await studio.locator('[data-tab=name]').click();await studio.locator('#pet-name').fill('Cheddar');await page.waitForTimeout(500);await studio.locator('[data-tab=appearance]').click();await studio.locator('[data-subtab=skins]').click();await studio.screenshot({path:path.join(output,'retro-diner-bacon-cheddar.png')});
 await studio.locator('.studio-close').click();await page.reload();await open();assert.equal(await studio.getAttribute('data-theme'),'diner');await page.waitForFunction(()=>document.querySelector('.nugget-companion .pet-button')?.dataset.renderedSkin==='Bacon Cheddar');assert.equal((await preferences()).nugget.name,'Cheddar');
 await studio.getByLabel('Studio theme',{exact:true}).selectOption('crimson');assert.equal(await studio.getAttribute('data-theme'),'crimson');assert(!(await studio.locator('.studio').evaluate(e=>getComputedStyle(e).backgroundImage)).includes('diner-dashboard'));
 assert.deepEqual(errors,[]);console.log('PASS: opt-in/lazy diner theme, device persistence, account isolation, all tabs at four sizes, live pet controls, Bacon Cheddar search/selection/thumbnail/save/reload, and return to Crimson.');
}finally{await browser?.close();server.kill();}})().catch(e=>{console.error(e);process.exitCode=1;});
