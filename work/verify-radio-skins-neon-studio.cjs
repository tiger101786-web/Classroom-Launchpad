const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const origin='http://127.0.0.1:8218',output=process.env.PREVIEW_OUTPUT||fs.mkdtempSync(path.join(os.tmpdir(),'radio-neon-previews-'));
const server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:'8218',DATA_DIR:fs.mkdtempSync(path.join(os.tmpdir(),'radio-neon-')),SESSION_SECRET:'radio-skin-preview-test',TEACHER_PIN:'654321'},stdio:'ignore'});let browser;
(async()=>{try{
 for(let i=0;i<100;i++){try{if((await fetch(origin+'/api/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});
 const context=await browser.newContext({viewport:{width:1440,height:1100}});
 await context.route('https://**/*',r=>r.abort());
 await context.addInitScript(()=>{window.mediaCalls=[];HTMLMediaElement.prototype.play=function(){window.mediaCalls.push('play');this.dispatchEvent(new Event('playing'));return Promise.resolve();};HTMLMediaElement.prototype.pause=function(){window.mediaCalls.push('pause');this.dispatchEvent(new Event('pause'));};HTMLMediaElement.prototype.load=function(){window.mediaCalls.push('load');};});
 assert.equal((await context.request.post(origin+'/api/auth/teacher',{headers:{Origin:origin},data:{pin:'654321'}})).status(),200);
 const page=await context.newPage(),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 await page.goto(origin);await page.locator('.colt-radio-launcher').waitFor({state:'visible'});
 assert(!requests.some(u=>u.includes('radio-skins')||u.includes('neon-gaming-dashboard')),'No preview or neon art requested on normal visits');
 await page.locator('.colt-radio-launcher').click();assert.equal(await page.locator('.colt-radio-skin-gear').count(),0);
 await page.locator('.colt-radio-search-input').fill('House Chill');await page.locator('[data-station="chill-house"]').click();await page.locator('.colt-radio-search-input').fill('');
 const normalSizes=new Map();for(const [width,height] of [[1440,1100],[800,900],[390,844],[320,740]]){await page.setViewportSize({width,height});normalSizes.set(width,await page.locator('.colt-radio-panel').evaluate(e=>{const r=e.getBoundingClientRect();return {width:r.width,height:r.height};}));}
 await page.goto(origin+'/?radioSkins=preview');await page.locator('.colt-radio-launcher').click();
 const panel=page.locator('.colt-radio-panel'),gear=panel.getByRole('button',{name:'Change Colt Radio skin',exact:true});
 const chooseSkin=async(skin,scope=page)=>{await scope.getByRole('button',{name:'Change Colt Radio skin',exact:true}).click();await scope.locator('[data-radio-skin-choice='+skin+']').click();};
 await gear.waitFor();assert.equal(await panel.getAttribute('data-radio-skin'),null);
 for(let attempt=0;attempt<2;attempt++){await gear.click();assert(await panel.locator('.colt-radio-skin-menu').evaluate(e=>e.matches(':popover-open')));await gear.click();assert.equal(await panel.locator('.colt-radio-skin-menu').evaluate(e=>e.matches(':popover-open')),false,'Second gear click closes dropdown');assert.equal(await gear.getAttribute('aria-expanded'),'false');assert(await panel.isVisible());}
 assert.equal(await panel.locator('.colt-radio-skin-gear .dashboard-nav-icon').textContent(),'⚙','Reuse Launchpad Settings gear');assert.equal(await panel.locator('.colt-radio-skin-picker').count(),0,'No custom picker panel');
 await gear.click();await page.keyboard.press('Escape');assert.equal(await panel.isVisible(),true);assert(await gear.evaluate(e=>e===e.ownerDocument.activeElement));
 await gear.click();await panel.locator('.colt-radio-search-input').click();assert.equal(await panel.locator('.colt-radio-skin-menu').evaluate(e=>e.matches(':popover-open')),false,'Outside click dismisses the dropdown');
 await gear.click();await page.keyboard.press('Home');await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');assert.equal(await panel.getAttribute('data-radio-skin'),'arcade','Compact dropdown supports keyboard selection');await chooseSkin('classic');
 await panel.locator('.colt-radio-search-input').fill('House Chill');await panel.locator('[data-station="chill-house"]').click();await panel.locator('.colt-radio-search-input').fill('');
 await panel.locator('[data-favorite-station="chill-house"]').click();
 await panel.locator('.colt-radio-play').click();
 await panel.locator('.colt-radio-volume-slider').evaluate(e=>{e.value='37';e.dispatchEvent(new Event('input',{bubbles:true}));});
 const before=await page.evaluate(()=>{const a=document.querySelector('.colt-radio-audio');window.testAudio=a;return {src:a.src,calls:mediaCalls.length,volume:a.volume};});
 const geometry=()=>panel.evaluate(e=>{const p=e.getBoundingClientRect(),selectors=['.colt-radio-header','.colt-radio-filters','.colt-radio-search','.colt-radio-stations','.colt-radio-player','.colt-radio-note','.colt-radio-station','.colt-radio-stream-artwork','.colt-radio-play'];return Object.fromEntries([['panel',{width:p.width,height:p.height}],...selectors.map(s=>{const r=e.querySelector(s).getBoundingClientRect();return [s,{width:r.width,height:r.height,top:s==='.colt-radio-station'?r.top-e.querySelector('.colt-radio-stations').getBoundingClientRect().top+e.querySelector('.colt-radio-stations').scrollTop:r.top-p.top}];})]);});
 const originalSizes=new Map();
 for(const [width,height] of [[1440,1100],[800,900],[390,844],[320,740]]){await page.setViewportSize({width,height});const size=await geometry();originalSizes.set(width,size);for(const axis of ['width','height'])assert(Math.abs(size.panel[axis]-normalSizes.get(width)[axis])<=1,'Preview matches normal player '+axis+' at '+width);}
 const sameGeometry=(actual,expected,label)=>{for(const [section,dimensions] of Object.entries(expected))for(const [axis,value] of Object.entries(dimensions))assert(Math.abs(actual[section][axis]-value)<=1,label+' '+section+' '+axis+': '+actual[section][axis]+' vs original '+value);};
 for(const skin of ['arcade','graffiti']){
  await chooseSkin(skin);
  assert.equal(await panel.getAttribute('data-radio-skin'),skin);
  const after=await page.evaluate(()=>{const a=document.querySelector('.colt-radio-audio');return {same:a===testAudio,src:a.src,calls:mediaCalls.length,volume:a.volume};});
  assert(after.same);assert.equal(after.src,before.src);assert.equal(after.calls,before.calls,'Skin change does not play, pause or reload audio');assert.equal(after.volume,before.volume);
  assert.equal(await panel.locator('[data-favorite-station="chill-house"]').getAttribute('aria-pressed'),'true');
  for(const [width,height] of [[1440,1100],[800,900],[390,844],[320,740]]){
   await page.setViewportSize({width,height});await panel.evaluate(e=>e.scrollTop=0);
   sameGeometry(await geometry(),originalSizes.get(width),'Same original dimensions for '+skin+' at '+width);
   const corners=await panel.evaluate(e=>{const s=getComputedStyle(e);return [s.borderTopLeftRadius,s.borderTopRightRadius,s.borderBottomLeftRadius,s.borderBottomRightRadius];});assert.deepEqual(corners,['0px','0px','0px','0px'],'All four artwork corners remain intact for '+skin+' at '+width);
   await gear.click();sameGeometry(await geometry(),originalSizes.get(width),'Settings overlay does not resize '+skin+' at '+width);await page.keyboard.press('Escape');
   const layout=await panel.evaluate(e=>{const r=e.getBoundingClientRect();return {overflow:e.scrollWidth>e.clientWidth+1,left:r.left,right:r.right,top:r.top,bottom:r.bottom};});
   assert(!layout.overflow,'No horizontal overflow '+skin+' '+width);assert(layout.left>=0&&layout.right<=width+1&&layout.top>=0&&layout.bottom<=height+1);
   if(skin==='arcade'){
    const crop=await panel.locator('.colt-radio-stream-artwork').evaluate(e=>{const s=getComputedStyle(e,'::before'),zoom=parseFloat(s.backgroundSize)/100,[x,y]=s.backgroundPosition.split(' ').map(parseFloat),w=924/zoom,h=w,left=(924-w)*x/100,top=(1702-h)*y/100;return {left,right:left+w,top,bottom:top+h};});
    assert(crop.left<=72&&crop.right>=260&&crop.top<=1043&&crop.bottom>=1225,'Entire original Arcade portrait, including muzzle, remains visible at '+width+' '+JSON.stringify(crop));
   }
   for(const mode of ['night','day']){await page.evaluate(m=>document.body.dataset.theme=m,mode);assert.equal(await panel.locator('.colt-radio-station').first().evaluate(e=>getComputedStyle(e).color),'rgb(255, 255, 255)');}
   if(width===1440||width===390)await panel.screenshot({path:path.join(output,'radio-skin-'+skin+'-'+width+'.png')});
  }
 }
 await page.setViewportSize({width:1440,height:1100});
 await page.evaluate(()=>Object.defineProperty(window,'documentPictureInPicture',{value:undefined,configurable:true}));
 const floatingPromise=context.waitForEvent('page');await panel.getByRole('button',{name:'Pop out Colt Radio',exact:true}).click();const floating=await floatingPromise;
 await floating.locator('.colt-radio-panel').waitFor();
 const floatingSize=await floating.locator('.colt-radio-panel').evaluate(e=>{const skin=e.dataset.radioSkin;delete e.dataset.radioSkin;const base=e.getBoundingClientRect().toJSON();e.dataset.radioSkin=skin;const actual=e.getBoundingClientRect().toJSON();return {base,actual};});assert.equal(floatingSize.actual.width,floatingSize.base.width);assert.equal(floatingSize.actual.height,floatingSize.base.height);
 assert((await floating.locator('.colt-radio-header').evaluate(e=>getComputedStyle(e).backgroundImage)).includes('neon-graffiti-reference'));
 await chooseSkin('arcade',floating);
 assert.equal(await floating.locator('.colt-radio-panel').getAttribute('data-radio-skin'),'arcade');
 assert(await page.evaluate(()=>testAudio===document.querySelector('audio')&&testAudio.ownerDocument===document),'Floating controls preserve original audio');
 await floating.getByRole('button',{name:'Return Colt Radio to Launchpad',exact:true}).click();
 await chooseSkin('graffiti');
 await page.reload();await page.locator('.colt-radio-launcher').click();await gear.waitFor();assert.equal(await panel.getAttribute('data-radio-skin'),'graffiti');
 await chooseSkin('classic');assert.equal(await panel.getAttribute('data-radio-skin'),null);
 await chooseSkin('arcade');await page.goto(origin);await page.locator('.colt-radio-launcher').click();assert.equal(await panel.getAttribute('data-radio-skin'),null);assert.equal(await gear.count(),0,'Saved preview skin does not leak onto regular site');
 await panel.locator('[aria-label="Minimize Colt Radio"]').click();
 await page.locator('.header-account-summary').first().click();await page.locator('.header-account-menu [data-companion-open]').first().click();const studio=page.locator('.pet-studio');await studio.waitFor({state:'visible'});
 assert(!requests.some(u=>u.includes('neon-gaming-dashboard')),'Neon scenery loads only after choosing it');
 const preferences=async()=>(await (await context.request.get(origin+'/api/companion-preferences')).json()).preferences;
 const petBefore=await preferences();await studio.getByLabel('Studio theme',{exact:true}).selectOption('neon');assert.deepEqual(await preferences(),petBefore);
 await page.evaluate(async()=>{const i=new Image();i.src='/assets/pet-studio/neon-gaming-dashboard-frame.png';await i.decode();});
 assert.equal(await studio.locator('#pet-select').evaluate(e=>getComputedStyle(e).color),'rgb(8, 19, 44)','Reference pale blue companion menu keeps dark text');
 assert.equal(await studio.locator('#pet-select').evaluate(e=>getComputedStyle(e).colorScheme),'light');
 await studio.locator('#pet-select').selectOption('eagle');
 for(const [width,height] of [[1440,1100],[1366,768],[800,1000],[390,844]]){
  await page.setViewportSize({width,height});let expected;
  for(const tab of ['appearance','name','play','settings']){
   await studio.locator('[data-tab='+tab+']').click();const g=await studio.evaluate(d=>{const r=d.querySelector('#tab-content').getBoundingClientRect();return {height:r.height,overflow:d.scrollWidth>d.clientWidth+1};});assert(!g.overflow,'Neon '+tab+' '+width);if(width>700&&expected)assert(Math.abs(g.height-expected)<1);else expected=g.height;
  }
  await studio.locator('[data-tab=appearance]').click();await studio.evaluate(e=>e.scrollTop=0);await studio.screenshot({path:path.join(output,'neon-studio-'+width+'.png')});
  if(width===390){await studio.locator('#skin-search').scrollIntoViewIfNeeded();await studio.screenshot({path:path.join(output,'neon-studio-mobile-controls.png')});}
 }
 await studio.locator('.studio-close').click();await page.reload();await page.locator('.header-account-summary').first().click();await page.locator('.header-account-menu [data-companion-open]').first().click();assert.equal(await studio.getAttribute('data-theme'),'neon');
 await page.setViewportSize({width:1440,height:1100});await studio.getByLabel('Studio theme',{exact:true}).selectOption('diner');
 await page.evaluate(async()=>{const i=new Image();i.src='/assets/pet-studio/diner-room-backdrop-v2.png';await i.decode();});
 for(const tab of ['appearance','settings']){await studio.locator('[data-tab='+tab+']').click();await studio.screenshot({path:path.join(output,'diner-single-chrome-'+tab+'.png')});}
 assert((await studio.locator('.studio').evaluate(e=>getComputedStyle(e).backgroundImage)).includes('diner-room-backdrop-v2'));
 assert.equal((await context.request.get(origin+'/radio-skins-test.html')).status(),200,'Standalone test page is served');
 await page.setViewportSize({width:1440,height:1200});await page.goto(origin+'/radio-skins-test.html');await page.waitForURL('**/radio-skins-test.html?radioSkins=preview');await page.locator('.colt-radio-launcher').click();await gear.waitFor();
 for(const skin of ['arcade','graffiti']){await chooseSkin(skin);assert.equal(await panel.getAttribute('data-radio-skin'),skin);await panel.screenshot({path:path.join(output,'radio-skin-'+skin+'-preview.png')});}
 await gear.click();await page.screenshot({path:path.join(output,'radio-skin-picker-preview.png')});
 assert.deepEqual(errors,[]);console.log('PASS: preview isolation, gear/keyboard/reset, skin persistence, unchanged audio/station/volume/favorites, floating window skins/return, both skins at four sizes and light/dark modes; neon theme lazy art, account isolation, four tabs/four sizes/persistence, diner single chrome backdrop.');
}finally{await browser?.close();server.kill();}})().catch(e=>{console.error(e);process.exitCode=1;});
