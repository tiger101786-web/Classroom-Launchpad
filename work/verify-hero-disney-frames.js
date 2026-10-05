const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),vm=require('node:vm');
const {chromium}=require('playwright'),sharp=require('sharp');
const ids=['hero-armor','hero-lightning','disney-castle','disney-rose'];
(async()=>{
 const server=fs.readFileSync('server.js','utf8');
 const catalog=server.slice(server.indexOf('const homeSceneIds'),server.indexOf('function homeSceneForSession'));
 for(const id of ids){
  assert.equal(vm.runInNewContext(catalog+';cleanHomeScene({frame:'+JSON.stringify(id)+'}).frame'),id);
  const {data,info}=await sharp('assets/scene-frame-'+id+'.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.equal(data[3],0);
  assert.equal(data[(Math.floor(info.height/2)*info.width+Math.floor(info.width/2))*4+3],0);
 }
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage();
  await page.route('http://frames.test/**',r=>r.fulfill({body:fs.readFileSync(path.join(process.cwd(),new URL(r.request().url()).pathname)),contentType:'image/png'}));
  await page.route('**/api/home-scene',async r=>{
   const homeScene=r.request().postDataJSON();
   await r.fulfill({json:{session:{authenticated:true,homeScene}}});
  });
  const css=['styles.css','launchpad-scenes.css','scene-frame-fit.css'].map(f=>fs.readFileSync(f,'utf8')).join('\n');
  await page.setContent('<meta charset="utf-8"><base href="http://frames.test/"><style>'+css+'body{background:#25191e;color:white;margin:0;padding:30px}main{max-width:400px;margin:auto}.school-photo{width:300px;height:300px}</style><main></main>');
  await page.addScriptTag({path:path.resolve('launchpad-scenes.js')});
  for(const width of [1100,390]){
   await page.setViewportSize({width,height:800});
   for(const id of ids){
    await page.evaluate(id=>{
     const session={authenticated:true,homeScene:{id:'disney-twilight-boulevard',frame:id,motion:false}};
     document.querySelector('main').innerHTML=LaunchpadScenes.render(session,'');
     LaunchpadScenes.attach(session,'',updated=>window.savedFrame=updated.homeScene);
    },id);
    await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
    assert.match(await page.locator('.launch-scene').evaluate(e=>getComputedStyle(e).clipPath),/^polygon/);
    await page.screenshot({path:path.join(os.tmpdir(),'frame-'+id+'-'+width+'.png')});
    await page.evaluate(()=>document.getElementById('chooseLaunchFrame').click());
    await page.locator('#launchChooserSearch').fill(id.startsWith('hero')?'Superhero':'Disney');
    assert.equal(await page.locator('[data-frame-choice]:visible').count(),2);
    await page.locator('[data-frame-choice="'+id+'"]').click();
    assert.equal(await page.locator('#launchScenePreview [data-scene-frame]').getAttribute('data-scene-frame'),id);
    await page.locator('#saveLaunchFrame').click();
    await page.waitForFunction(id=>window.savedFrame?.frame===id,id);
    assert.deepEqual(await page.evaluate(()=>window.savedFrame),{id:'disney-twilight-boulevard',frame:id,motion:false});
   }
  }
  console.log('Four frames: transparent centers, server validation, desktop/mobile fit, category search, preview and save passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
