const assert = require('node:assert/strict');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const {spawn} = require('node:child_process'), {chromium} = require('playwright');
const shelf = require('../collectible-shelf');
const origin = 'http://127.0.0.1:8198';
const output = 'C:/Users/Sinister/.codex/visualizations/2026/10/31/01a19363-e9fe-7dc2-86a1-e1134a57d914';
const server = spawn(process.execPath, ['server.js'], {cwd:path.resolve(__dirname,'..'), env:{...process.env, PORT:'8198', DATA_DIR:fs.mkdtempSync(path.join(os.tmpdir(),'nugget-scene-')), SESSION_SECRET:'test', TEACHER_PIN:'654321'}, stdio:'ignore'});
let browser;
(async()=>{
 try {
  for(let i=0;i<100;i++){try{if((await fetch(origin+'/api/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  assert.equal((await context.request.post(origin+'/api/auth/teacher',{headers:{Origin:origin},data:{pin:'654321'}})).status(),200);
  assert.equal((await context.request.post(origin+'/api/home-scene',{headers:{Origin:origin},data:{id:'chicken-nugget',frame:'match-chicken-nugget',motion:true}})).status(),200);
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin);
  await page.locator('.home-scene-feature [data-scene="chicken-nugget"]').waitFor();
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
  const shelfHtml=shelf.render({authenticated:true,homeShelf:{enabled:true,theme:'wood',slots:['naruto','goku','anime-asuna-knight-bust']}});
  const render=async(frame,motion=true)=>{
   await page.evaluate(({frame,motion,shelfHtml})=>{
    document.querySelector('.home-display-row').innerHTML='<div class="home-shelf-position">'+shelfHtml+'</div>'+LaunchpadScenes.render({...authSession,homeScene:{id:'chicken-nugget',frame,motion}},'')+'<div class="home-shelf-position">'+shelfHtml+'</div>';
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
    await render('match-chicken-nugget');
    assert.deepEqual(await metrics(),before,'Scene crop/size and shelf placement stay identical to No Frame');
    const result=await fit();
    assert(result.sameFit,'Use the collection fitting formula');
    assert(result.gap<=.35,'No dark annular gap at any of 360 measured rim angles: '+JSON.stringify(result));
    assert(result.proportion<=1.16+.001,'Keep the common 116% footprint cap');
    assert(result.clear,'Do not overlap shelves');
    assert(result.overlay,'Frame paints over the scene perimeter');
    assert.equal(result.pointerEvents,'none');
    const nuggetBox=await page.locator('.scene-frame-artwork').boundingBox();
    await render('usa-patriotic');
    const standardBox=await page.locator('.scene-frame-artwork').boundingBox();
    for(const key of ['x','y','width','height'])assert(Math.abs(nuggetBox[key]-standardBox[key])<.05,'Match the proportions of the existing USA frame: '+key);
    await render('match-chicken-nugget');
    if(width===1280||width===390)await page.screenshot({clip:await page.locator('.scene-frame-artwork').boundingBox(),path:path.join(output,'nugget-frame-v4-'+theme+'-'+width+'.png')});
   }
  }
  assert.equal(await page.locator('.nugget-scene-steam i').count(),3);
  await render('match-chicken-nugget',false);
  assert.equal(await page.locator('.nugget-scene-steam i').first().evaluate(e=>getComputedStyle(e).animationPlayState),'paused');
  await page.emulateMedia({reducedMotion:'reduce'});await render('match-chicken-nugget',true);
  assert.equal(await page.locator('.nugget-scene-steam i').first().evaluate(e=>getComputedStyle(e).animationName),'none');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:1280,height:900});await page.reload();
  await page.locator('.home-scene-feature [data-scene="chicken-nugget"]').waitFor();
  await page.locator('#launchSceneSettings').evaluate(e=>e.click());
  await page.locator('#chooseLaunchFrame').click();
  await page.locator('#launchChooserSearch').fill('Chicken Nugget');
  const choice=page.locator('[data-frame-choice="match-chicken-nugget"]');
  await choice.click();
  await page.locator('#launchScenePreview .scene-frame-artwork').evaluate(i=>i.decode());
  const preview=await page.locator('#launchScenePreview').evaluate((root,max)=>{
   const f=root.querySelector('.scene-frame-artwork').getBoundingClientRect(),i=root.querySelector('.launch-scene-image').getBoundingClientRect(),s=root.querySelector('.launch-scene-stage').getBoundingClientRect();
   return {gap:f.width*max-i.width/2,proportion:f.width/s.width,source:root.querySelector('.scene-frame-artwork').getAttribute('src')};
  },audit.max);
  assert(preview.gap<=.35);assert(preview.proportion<=1.161);
  assert(preview.source.endsWith('-thin-v4.png'),'Chooser preview uses the current detailed artwork');
  await page.locator('#saveLaunchFrame').click();
  await page.locator('.launch-frame-dialog').waitFor({state:'detached'});
  assert.equal((await context.request.get(origin+'/api/auth/session')).status(),200);
  assert.deepEqual(errors,[]);
  console.log('PASS: common frame-fitting formula; no inner gap in either theme; unchanged scene/shelves at four widths; 116% cap; preview/save/reload; animation pause and reduced motion.');
 } finally {await browser?.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
