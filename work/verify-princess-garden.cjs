const assert = require('node:assert/strict');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const {spawn} = require('node:child_process'), {chromium} = require('playwright');
const shelf = require('../collectible-shelf');
const origin = 'http://127.0.0.1:8196';
const output = 'C:/Users/Sinister/.codex/visualizations/2026/11/03/01a19f35-f5fe-7a53-be7e-17a3b74d1da1/princess-garden-20261112';
const server = spawn(process.execPath, ['server.js'], {cwd:path.resolve(__dirname,'..'), env:{...process.env, PORT:'8196', DATA_DIR:fs.mkdtempSync(path.join(os.tmpdir(),'nugget-scene-')), SESSION_SECRET:'test', TEACHER_PIN:'654321'}, stdio:'ignore'});
fs.mkdirSync(output,{recursive:true});
let browser;
(async()=>{
 try {
  for(let i=0;i<100;i++){try{if((await fetch(origin+'/api/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  assert.equal((await context.request.post(origin+'/api/auth/teacher',{headers:{Origin:origin},data:{pin:'654321'}})).status(),200);
  assert.equal((await context.request.post(origin+'/api/home-scene',{headers:{Origin:origin},data:{id:'disney-princess-garden',frame:'match-disney-princess-garden',motion:true}})).status(),200);
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin);
  await page.locator('.home-scene-feature [data-scene="disney-princess-garden"]').waitFor();
  const audit=await page.evaluate(async()=>{
   const image=new Image();image.src=document.querySelector('.home-scene-feature .scene-frame-artwork').src;await image.decode();
   const c=document.createElement('canvas');c.width=image.width;c.height=image.height;
   const g=c.getContext('2d');g.drawImage(image,0,0);
   const d=g.getImageData(0,0,c.width,c.height).data,w=c.width,alpha=(x,y)=>d[(y*w+x)*4+3];
   let min=1,max=0,missing=0;
   for(let deg=0;deg<360;deg++){
    const a=deg*Math.PI/180;let run=0,found=false;
    for(let r=Math.floor(w*.3);r<w*.5;r++){
     const x=Math.floor(w/2+Math.cos(a)*r),y=Math.floor(w/2+Math.sin(a)*r);
     run=alpha(x,y)>100?run+1:0;
     if(run>=4){const radius=(r-3)/w;min=Math.min(min,radius);max=Math.max(max,radius);found=true;break;}
    }
    if(!found)missing++;
   }
   return {width:w,height:c.height,min,max,missing,center:alpha(Math.floor(w/2),Math.floor(w/2)),corner:alpha(0,0)};
  });
  assert.equal(audit.width,audit.height);assert.equal(audit.center,0);assert(audit.corner<=1);assert.equal(audit.missing,0);
  // Identical to the established collection's audit-thin-frame-assets.js fit.
  const expectedInset=-Math.min(.08,(.498/audit.max-1)/2)*100;
  console.log('Frame audit '+JSON.stringify({...audit,expectedInset}));
  const shelfHtml=shelf.render({authenticated:true,homeShelf:{enabled:true,theme:'disney-castle',slots:['music-ariana-grande-bust','cat-calico-persian-bust','cat-tortoiseshell-bust']}});
  const render=async(frame,motion=true)=>{
   await page.evaluate(({frame,motion,shelfHtml})=>{
    document.querySelector('.home-display-row').innerHTML='<div class="home-shelf-position">'+shelfHtml+'</div>'+LaunchpadScenes.render({...authSession,homeScene:{id:'disney-princess-garden',frame,motion}},'')+'<div class="home-shelf-position">'+shelfHtml+'</div>';
   },{frame,motion,shelfHtml});
   await page.locator('.home-display-row img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));
  };
  const metrics=()=>page.evaluate(()=>{
   const image=document.querySelector('.launch-scene-image'),r=image.getBoundingClientRect(),s=getComputedStyle(image);
   return {image:{x:r.x,y:r.y,w:r.width,h:r.height,transform:s.transform,objectFit:s.objectFit},shelves:[...document.querySelectorAll('.home-shelf-position')].map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};})};
  });
  const fit=()=>page.evaluate(({max,expectedInset})=>{
   const artwork=document.querySelector('.scene-frame-artwork'),frame=artwork.getBoundingClientRect(),stage=document.querySelector('.launch-scene-stage').getBoundingClientRect(),image=document.querySelector('.launch-scene-image').getBoundingClientRect();
   const layer=artwork.parentElement,scene=document.querySelector('.launch-scene');
   const centerError=Math.hypot(frame.x+frame.width/2-image.x-image.width/2,frame.y+frame.height/2-image.y-image.height/2);
   const shelves=[...document.querySelectorAll('.home-shelf-position')].map(e=>e.getBoundingClientRect());
   return {
    gap:frame.width*max+centerError-image.width/2,
    proportion:frame.width/stage.width,
    sameFit:Math.abs(parseFloat(getComputedStyle(layer).getPropertyValue('--exterior-frame-inset'))-expectedInset)<.002,
    clear:shelves.every(r=>!r.width||frame.right<=r.left+.1||frame.left>=r.right-.1||frame.bottom<=r.top+.1||frame.top>=r.bottom-.1),
    overlay:Number(getComputedStyle(layer).zIndex)>Number(getComputedStyle(scene).zIndex),
    pointerEvents:getComputedStyle(layer).pointerEvents
   };
  },{max:audit.max,expectedInset});
  for(const theme of ['night','light']){
   await page.evaluate(theme=>document.body.dataset.theme=theme,theme);
   for(const width of [1280,1024,820,390]){
    await page.setViewportSize({width,height:900});
    await render('none');const before=await metrics();
    await render('match-disney-princess-garden');
    assert.deepEqual(await metrics(),before,'Scene crop/size and shelf placement stay identical to No Frame');
    const result=await fit();
    assert(result.sameFit,'Use the collection fitting formula');
    assert(result.gap<=.35,'No dark annular gap at any of 360 measured rim angles: '+JSON.stringify(result));
    assert(result.proportion<=1.16+.001,'Keep the common 116% footprint cap');
    assert(result.clear,'Do not overlap shelves');
    assert(result.overlay,'Frame paints over the scene perimeter');
    assert.equal(result.pointerEvents,'none');
    if(width===1280||width===390)await page.screenshot({clip:await page.locator('.scene-frame-artwork').boundingBox(),path:path.join(output,'princess-garden-frame-'+theme+'-'+width+'.png')});
   }
  }
  await page.setViewportSize({width:1280,height:900});await page.reload();
  await page.locator('.home-scene-feature [data-scene="disney-princess-garden"]').waitFor();
  await page.locator('#launchSceneSettings').evaluate(e=>e.click());
  await page.locator('#chooseLaunchFrame').click();
  await page.locator('#launchChooserSearch').fill('Princess Garden');
  await page.locator('#launchChooserCategory').selectOption({label:'Disney'});
  const choice=page.locator('[data-frame-choice="match-disney-princess-garden"]');
  await choice.click();
  await page.locator('#launchScenePreview .scene-frame-artwork').evaluate(i=>i.decode());
  const preview=await page.locator('#launchScenePreview').evaluate((root,max)=>{
   const f=root.querySelector('.scene-frame-artwork').getBoundingClientRect(),i=root.querySelector('.launch-scene-image').getBoundingClientRect(),s=root.querySelector('.launch-scene-stage').getBoundingClientRect();
   return {gap:f.width*max-i.width/2,proportion:f.width/s.width,source:root.querySelector('.scene-frame-artwork').getAttribute('src')};
  },audit.max);
  assert(preview.gap<=.35);assert(preview.proportion<=1.161);
  assert(preview.source.endsWith('-thin.png'),'Chooser preview uses the current detailed artwork');
  await page.locator('#saveLaunchFrame').click();
  await page.locator('.launch-frame-dialog').waitFor({state:'detached'});
  assert.equal((await context.request.get(origin+'/api/auth/session')).status(),200);
  // Confirm the supplied scene is selectable in its Disney category.
  await page.locator('#launchSceneSettings').evaluate(e=>e.click());
  await page.locator('#chooseLaunchScene').click();
  await page.locator('#launchChooserCategory').selectOption({label:'Disney'});
  await page.locator('#launchChooserSearch').fill('Princess Garden');
  await page.locator('[data-scene-choice="disney-princess-garden"]').click();
  await page.locator('#saveLaunchScene').click();
  await page.locator('.launch-scene-dialog').waitFor({state:'detached'});
  const ids=['music-ariana-grande-bust','cat-calico-persian-bust','cat-tortoiseshell-bust'];
  for(const [i,id] of ids.entries())assert.equal(shelf.items.find(item=>item.id===id).category,i===0?'Music':'Cats');
  for(const side of ['left','right']){
    const saved=await context.request.post(origin+'/api/home-shelf',{headers:{Origin:origin},data:{enabled:true,theme:'disney-castle',slots:ids,side}});
    assert.equal(saved.status(),200);
    assert.deepEqual((await saved.json()).session[side==='left'?'homeShelf':'homeShelfRight'].slots,ids);
  }
  await page.reload();await page.locator('.home-display-row img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
  await page.locator('.home-display-row').screenshot({path:path.join(output,'princess-garden-and-statues.png')});
  const savedSession=(await (await context.request.get(origin+'/api/auth/session')).json()).session;
  assert.deepEqual(savedSession.homeScene,{id:'disney-princess-garden',frame:'match-disney-princess-garden',motion:true});
  await page.evaluate(()=>CollectibleShelf.open({selected:authSession.homeShelf,save:async draft=>window.testSavedShelf=draft}));
  for(const [i,id] of ids.entries()){
    await page.locator('#shelfCategory').selectOption({label:i===0?'Music':'Cats'});
    await page.locator('#shelfSearch').fill(['Ariana Grande','Calico Persian','Tortoiseshell'][i]);
    const choice=page.locator('[data-shelf-item="'+id+'"]');assert.equal(await choice.count(),1);await choice.click();
    const img=page.locator('#shelfPreview img[src*="shelf-'+id+'.png"]');await img.first().evaluate(i=>i.decode());
  }
  await page.locator('#saveShelf').click();await page.waitForFunction(()=>window.testSavedShelf?.slots.includes('cat-tortoiseshell-bust'));
  assert.deepEqual(errors,[]);
  console.log('PASS: common frame-fitting formula; no inner gap in either theme; unchanged scene/shelves at four widths; 116% cap; preview/save/reload; Disney scene/frame picker, Music/Cats shelf categories, statue selection, and saved scene/shelf persistence.');
 } finally {await browser?.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
