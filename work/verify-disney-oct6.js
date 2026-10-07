const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),vm=require('node:vm');
const {chromium}=require('playwright'),sharp=require('sharp');
const pairs=require('./disney-oct6-generated.json').frames;
(async()=>{
 assert.equal(pairs.length,12); assert.equal(new Set(pairs.map(p=>p.scene)).size,12);
 const server=fs.readFileSync('server.js','utf8');
 const catalog=server.slice(server.indexOf('const homeSceneIds'),server.indexOf('function homeSceneForSession'));
 for(const p of pairs){
  assert.equal(vm.runInNewContext(catalog+';cleanHomeScene('+JSON.stringify({id:p.scene,frame:p.frame,motion:true})+').frame'),p.frame);
  assert.ok(fs.readFileSync(p.source).equals(fs.readFileSync('assets/launchpad-scene-'+p.scene+'.png')));
  const {data,info}=await sharp(p.asset).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.equal(data[(Math.floor(info.height/2)*info.width+Math.floor(info.width/2))*4+3],0);
 }
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.route('http://frames.test/**',r=>r.fulfill({body:fs.readFileSync(path.join(process.cwd(),new URL(r.request().url()).pathname)),contentType:'image/png'}));
  await page.route('**/api/home-scene',r=>r.fulfill({json:{session:{authenticated:true,homeScene:r.request().postDataJSON()}}}));
  const css=['styles.css','launchpad-scenes.css','scene-frame-fit.css','scene-matched-frames.css','disney-oct6-scenes.css'].map(f=>fs.readFileSync(f,'utf8')).join('\n');
  await page.setContent('<meta charset="utf-8"><base href="http://frames.test/"><style>'+css+'body{background:#25191e;color:white;margin:0;padding:20px}main{max-width:360px;margin:auto}.school-photo{width:300px;height:300px} .sheet{display:grid;grid-template-columns:repeat(3,350px);gap:30px} .sheet article{text-align:center;min-height:365px}</style><main></main>');
  await page.addScriptTag({path:path.resolve('launchpad-scenes.js')});
  for(const width of [1100,390]){
   await page.setViewportSize({width,height:800});
   for(const p of pairs){
    await page.evaluate(p=>{const s={authenticated:true,homeScene:{id:p.scene,frame:p.frame,motion:true}};document.querySelector('main').innerHTML=LaunchpadScenes.render(s,'');LaunchpadScenes.attach(s,'',s=>window.savedFrame=s.homeScene);},p);
    await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
    const fit=await page.locator('.launch-scene-image').evaluate(e=>({scale:getComputedStyle(e).transform,animations:e.parentElement.getAnimations({subtree:true}).length}));
    assert.match(fit.scale,/matrix\(0\./);assert.ok(fit.animations>0,p.scene+' has animations');
    await page.evaluate(()=>document.getElementById('chooseLaunchFrame').click());
    await page.locator('#launchChooserSearch').fill(p.name);
    await page.locator('[data-frame-choice="'+p.frame+'"]').click();
    await page.locator('#saveLaunchFrame').click();
    await page.waitForFunction(id=>window.savedFrame?.frame===id,p.frame);
    assert.deepEqual(await page.evaluate(()=>window.savedFrame),{id:p.scene,frame:p.frame,motion:true});
   }
  }
  await page.addStyleTag({content:'.home-scene-feature{position:relative!important;inset:auto!important;transform:none!important;display:flex!important;justify-content:center!important;width:100%!important}.sheet article{position:relative}'});
  await page.setViewportSize({width:1160,height:850});
  for(let start=0;start<12;start+=6){
   await page.evaluate(ps=>{document.querySelector('main').style.maxWidth='none';document.querySelector('main').innerHTML='<div class="sheet">'+ps.map(p=>'<article><h3>'+p.name+'</h3>'+LaunchpadScenes.render({authenticated:true,homeScene:{id:p.scene,frame:p.frame,motion:true}},'')+'</article>').join('')+'</div>';},pairs.slice(start,start+6));
   await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
   await page.screenshot({path:path.join(os.tmpdir(),'disney-oct6-sheet-'+start+'.png'),fullPage:true});
  }
  await page.evaluate(p=>{document.querySelector('main').innerHTML=LaunchpadScenes.render({authenticated:true,homeScene:{id:p.scene,frame:p.frame,motion:false}},'');},pairs[3]);
  assert.ok(await page.locator('.launch-scene').evaluate(e=>e.getAnimations({subtree:true}).every(a=>a.playState==='paused')));
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.launch-scene').evaluate(e=>e.getAnimations({subtree:true}).length),0);
  assert.deepEqual(errors,[]);
  console.log('PASS: 12 original scenes preserved; frame transparency/server validation; desktop/mobile fit, animated effects, chooser and save; pause and reduced motion. Screenshots: '+os.tmpdir()+'/disney-oct6-sheet-{0,6}.png');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
