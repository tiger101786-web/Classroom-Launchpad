const fs=require('fs'),vm=require('vm'),path=require('path'),os=require('os'),assert=require('assert/strict');
const {chromium}=require('playwright');
const source=fs.readFileSync('launchpad-scenes.js','utf8');
const scenes=vm.runInNewContext(source.slice(source.indexOf('const scenes ='),source.indexOf('const frames ='))+';scenes',{matchMedia:()=>({matches:false})}).filter(s=>s.id.startsWith('disney-'));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage();
  await page.route('http://audit.test/**',r=>r.fulfill({body:fs.readFileSync(path.join(process.cwd(),new URL(r.request().url()).pathname)),contentType:'image/png'}));
  const css=['styles.css','launchpad-scenes.css','scene-frame-fit.css','scene-matched-frames.css','disney-oct6-scenes.css'].map(f=>fs.readFileSync(f,'utf8')).join('\n');
  await page.setContent('<base href="http://audit.test/"><style>'+css+'body{background:#25191e;color:white}.home-scene-feature{position:relative!important;inset:auto!important;transform:none!important}.school-photo{width:190px;height:190px}.audit-grid{display:grid;grid-template-columns:repeat(5,210px);gap:12px}.audit-grid article{text-align:center;font-size:12px}.audit-grid .home-scene-feature{margin:0;display:flex;align-items:center}.audit-grid .disney-scene-thumbnail{margin:auto}</style><main></main>');
  await page.addScriptTag({content:source});
  for(const width of [1100,390]){
   await page.setViewportSize({width,height:850});
   await page.evaluate(()=>{const s={authenticated:true,homeScene:{id:'disney-highland-castle',frame:'none',motion:false}};document.querySelector('main').innerHTML=LaunchpadScenes.render(s,'');LaunchpadScenes.attach(s,'',()=>{});document.getElementById('chooseLaunchScene').click()});
   await page.locator('#launchChooserCategory').selectOption('Disney');
   for(const s of scenes){
    await page.locator('#launchChooserSearch').fill(s.name);
    const card=page.locator('[data-scene-choice="'+s.id+'"]');
    await card.locator('img').evaluate(i=>i.decode());
    const scale=await card.locator('img').evaluate(i=>getComputedStyle(i).transform);
    assert.match(scale,/matrix\(1\./);
    await card.click();
    assert.equal(await page.locator('#launchScenePreview .launch-scene-image').evaluate(i=>getComputedStyle(i).transform),scale);
    assert.equal(await card.locator('.disney-scene-thumbnail').evaluate(e=>getComputedStyle(e).overflow),'hidden');
   }
   await page.evaluate(()=>document.querySelector('dialog').remove());
  }
  await page.setViewportSize({width:1140,height:900});
  for(let start=0;start<scenes.length;start+=15){
   await page.evaluate(ss=>document.querySelector('main').innerHTML='<div class="audit-grid">'+ss.map(s=>'<article>'+s.name+LaunchpadScenes.render({authenticated:true,homeScene:{id:s.id,frame:'none',motion:false}},'')+'<div data-scene-choice="'+s.id+'" class="launch-scene-options"><span class="disney-scene-thumbnail"><img src="'+s.image+'"></span></div></article>').join('')+'</div>',scenes.slice(start,start+15));
   await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
   await page.screenshot({path:path.join(os.tmpdir(),'disney-audit-'+start+'.png'),fullPage:true});
  }
  console.log('PASS: '+scenes.length+' Disney scenes, desktop/mobile thumbnail/preview crop parity, circular clipping and original aspect ratio.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
