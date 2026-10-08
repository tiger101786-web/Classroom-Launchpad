const fs=require('fs'),path=require('path'),os=require('os'),assert=require('assert/strict'),vm=require('vm');
const {chromium}=require('playwright');
const frames=[...require('./thin-frame-plan.json').frames,...require('./carnival-palace-frames.json')];
const source=fs.readFileSync('launchpad-scenes.js','utf8');
const scenes=vm.runInNewContext(source.slice(source.indexOf('const scenes ='),source.indexOf('const frames ='))+';scenes',{matchMedia:()=>({matches:false})});
const shelf=require('../collectible-shelf');
(async()=>{
 const available=frames.filter(f=>fs.existsSync('assets/scene-frame-'+f.id+'-thin-v2.png'));
 if(!process.argv.includes('--partial')) assert.equal(available.length,frames.length,'All decorative assets must exist');
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('http://frames.test/**',r=>r.fulfill({body:fs.readFileSync(path.join(process.cwd(),new URL(r.request().url()).pathname)),contentType:'image/png'}));
  const css=['styles.css','launchpad-scenes.css','scene-frame-fit.css','scene-matched-frames.css','disney-oct6-scenes.css','collectible-shelf.css','scene-exterior-frames.css'].map(f=>fs.readFileSync(f,'utf8').replace(/^\uFEFF/,'')).join('\n');
  await page.setContent('<base href="http://frames.test/"><style>'+css+'body{background:#25191e;color:white;padding:20px;margin:0}main{margin:90px auto;max-width:1150px}.home-display-row{margin:0}.home-collectible-shelf{pointer-events:none}</style><main></main>');
  await page.addScriptTag({content:source});
  const shelfHtml=shelf.render({authenticated:true,homeShelf:{enabled:true,theme:'wood',slots:['naruto','anime-asuna-knight-bust','goku']}});
  async function render(scene,frame){
   await page.evaluate(({scene,frame,shelfHtml})=>document.querySelector('main').innerHTML='<div class="home-display-row"><div class="home-shelf-position">'+shelfHtml+'</div>'+LaunchpadScenes.render({authenticated:true,homeScene:{id:scene,frame,motion:false}},'')+'<div class="home-shelf-position">'+shelfHtml+'</div></div>',{scene,frame,shelfHtml});
   await page.locator('img').evaluateAll(is=>Promise.all(is.map(i=>i.decode())));
  }
  async function metrics(){return page.evaluate(()=>({
   image:[...document.querySelectorAll('.launch-scene-image')].map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {x:r.x,y:r.y,width:r.width,height:r.height,transform:s.transform,clip:s.clipPath}}),
   shelves:[...document.querySelectorAll('.home-shelf-position')].map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})
  }))}
  for(const width of [1280,1024,820]){
   await page.setViewportSize({width,height:850});
   for(const f of available){
    const scene=f.matchedScene||'hidden-leaf-overlook';
    await render(scene,'none');const before=await metrics();
    await render(scene,f.id);assert.deepEqual(await metrics(),before,'Frame must not change scene or shelves: '+f.id);
    const clearance=await page.evaluate(()=>{const r=document.querySelector('.scene-frame-artwork').getBoundingClientRect(),s=[...document.querySelectorAll('.home-shelf-position')].map(e=>e.getBoundingClientRect());return r.left>=s[0].right&&r.right<=s[1].left});
    assert.ok(clearance,'Frame cannot enter shelf area: '+f.id);
    assert.ok(await page.evaluate(()=>Number(getComputedStyle(document.querySelector('.launch-scene')).zIndex)>Number(getComputedStyle(document.querySelector('.scene-frame-exterior')).zIndex)),'Scene must paint above frame: '+f.id);
   }
  }
  // The photo ring must disappear in both themes without changing geometry.
  for(const width of [1280,390]){
   await page.setViewportSize({width,height:850});
   for(const theme of ['light','night']){
    await page.evaluate(t=>document.body.dataset.theme=t,theme);
    await render('hidden-leaf-overlook','none');const before=await metrics();
    assert.notEqual(await page.locator('.launch-scene').evaluate(e=>getComputedStyle(e).borderTopColor),'rgba(0, 0, 0, 0)','No Frame retains its normal border');
    for(const f of available){
     await render('hidden-leaf-overlook',f.id);
     assert.deepEqual(await metrics(),before,'Ring removal preserves layout: '+f.id);
     const style=await page.locator('.launch-scene').evaluate(e=>{const s=getComputedStyle(e);return [s.borderTopWidth,s.borderTopColor,s.boxShadow,s.clipPath]});
     assert.deepEqual(style,['8px','rgba(0, 0, 0, 0)','none','inset(8px round 50%)'],theme+' '+f.id+' hides photo ring');
     assert.equal(await page.locator('.launch-scene').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)',theme+' '+f.id+' cannot paint a background ring through transparent scene edges');
    }
   }
  }
  await page.evaluate(()=>document.body.dataset.theme='light');
  await page.evaluate(()=>document.querySelector('main').id='launchScenePreview');
  await render('hidden-leaf-overlook','none');const previewBefore=await metrics();
  for(const f of available){
   await render('hidden-leaf-overlook',f.id);
   assert.deepEqual(await metrics(),previewBefore,'Preview preserves scene size: '+f.id);
   assert.equal(await page.locator('.launch-scene').evaluate(e=>getComputedStyle(e).clipPath),'inset(5px round 50%)','Preview removes only its 5px border');
   assert.equal(await page.locator('.launch-scene').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)','Preview cannot show backing through cutout edges');
  }
  await page.evaluate(()=>document.querySelector('main').removeAttribute('id'));
  // Check scene-specific image fitting is unchanged for every image scene.
  await page.setViewportSize({width:1280,height:850});
  for(const s of scenes.filter(s=>s.image)){
   await render(s.id,'none');const before=await metrics();
   await render(s.id,'match-disney-adventure-falls');assert.deepEqual(await metrics(),before,s.id+' must retain unframed size/crop');
  }
  await render('hidden-leaf-overlook','match-disney-adventure-falls');
  await page.screenshot({path:path.resolve('work/thin-frames-shelf-layout.png'),fullPage:true});
  // Reproduce the reported cutout scene/frame combination in night mode.
  await page.evaluate(()=>document.body.dataset.theme='night');
  await render('hidden-leaf-overlook','match-hidden-leaf-rooftops');
  await page.locator('.home-scene-feature').screenshot({path:path.resolve('work/hidden-leaf-transparent-edge.png')});
  assert.deepEqual(errors,[]);
  console.log('PASS: '+available.length+'/'+frames.length+' exterior frames; scene size and crop unchanged; shelf positions unchanged; no frame/shelf overlap at1280/1024/820; all image scenes preserve baseline.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
