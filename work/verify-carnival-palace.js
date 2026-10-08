const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const {chromium}=require('playwright'),sharp=require('sharp');
const pairs=require('./carnival-palace-frames.json');
(async()=>{
 const server=fs.readFileSync('server.js','utf8');
 const catalog=server.slice(server.indexOf('const homeSceneIds'),server.indexOf('function homeSceneForSession'));
 for(const p of pairs){
  const value={id:p.matchedScene,frame:p.id,motion:true};
  assert.deepEqual(JSON.parse(JSON.stringify(vm.runInNewContext(catalog+';cleanHomeScene('+JSON.stringify(value)+')'))),value);
  const original=fs.readFileSync('assets/launchpad-scene-'+p.matchedScene+'.png');
  if(fs.existsSync(p.source))assert.ok(original.equals(fs.readFileSync(p.source)),'Source scene unchanged');
  const {data,info}=await sharp('assets/scene-frame-'+p.id+'-thin-v2.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.equal(info.width,info.height);
  assert.equal(data[(Math.floor(info.height/2)*info.width+Math.floor(info.width/2))*4+3],0);
 }
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('http://frames.test/**',r=>r.fulfill({body:fs.readFileSync(path.join(process.cwd(),new URL(r.request().url()).pathname)),contentType:'image/png'}));
  await page.route('**/api/home-scene',r=>r.fulfill({json:{session:{authenticated:true,homeScene:r.request().postDataJSON()}}}));
  const css=['styles.css','launchpad-scenes.css','scene-frame-fit.css','scene-matched-frames.css','disney-oct6-scenes.css','scene-exterior-frames.css'].map(f=>fs.readFileSync(f,'utf8').replace(/^\uFEFF/,'')).join('\n');
  await page.setContent('<base href="http://frames.test/"><style>'+css+'body{background:#25191e;color:white;padding:25px}.home-scene-feature{position:relative!important;inset:auto!important;transform:none!important;margin:35px auto!important;display:flex!important;justify-content:center!important}main{max-width:750px;margin:auto}.launch-scene-settings{opacity:0}</style><main></main>');
  await page.addScriptTag({path:path.resolve('launchpad-scenes.js')});
  for(const width of [1100,390]){
   await page.setViewportSize({width,height:820});
   for(const p of pairs){
    await page.evaluate(p=>{const s={authenticated:true,homeScene:{id:p.matchedScene,frame:p.id,motion:true}};document.querySelector('main').innerHTML=LaunchpadScenes.render(s,'');LaunchpadScenes.attach(s,'',s=>window.savedScene=s.homeScene);},p);
    await page.locator('img').evaluateAll(is=>Promise.all(is.map(i=>i.decode())));
    assert.ok(await page.locator('.launch-scene').evaluate(e=>e.getAnimations({subtree:true}).length>0));
    await page.evaluate(()=>document.getElementById('chooseLaunchFrame').click());
    await page.locator('#launchChooserCategory').selectOption('Disney');
    await page.locator('#launchChooserSearch').fill(p.name);
    await page.locator('[data-frame-choice="'+p.id+'"]').click();
    assert.equal(await page.locator('#launchScenePreview .launch-scene').evaluate(e=>getComputedStyle(e).borderTopColor),'rgba(0, 0, 0, 0)');
    await page.locator('#saveLaunchFrame').click();
    await page.waitForFunction(id=>window.savedScene?.frame===id,p.id);
    assert.deepEqual(await page.evaluate(()=>window.savedScene),{id:p.matchedScene,frame:p.id,motion:true});
   }
  }
  await page.setViewportSize({width:820,height:490});
  await page.evaluate(ps=>document.querySelector('main').innerHTML='<div style="display:flex;gap:40px">'+ps.map(p=>'<article><h3>'+p.name+'</h3>'+LaunchpadScenes.render({authenticated:true,homeScene:{id:p.matchedScene,frame:p.id,motion:false}},'')+'</article>').join('')+'</div>',pairs);
  await page.locator('img').evaluateAll(is=>Promise.all(is.map(i=>i.decode())));
  assert.ok(await page.locator('.launch-scene').first().evaluate(e=>e.getAnimations({subtree:true}).every(a=>a.playState==='paused')));
  await page.screenshot({path:path.resolve('work/carnival-palace-preview.png'),fullPage:true});
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.launch-scene').first().evaluate(e=>e.getAnimations({subtree:true}).length),0);
  assert.deepEqual(errors,[]);
  console.log('PASS: both source images unchanged; transparent frames; server accepts both selections; desktop/mobile frame chooser, preview, save, effects, pause and reduced motion.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
