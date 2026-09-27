const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),{chromium}=require('playwright');
const scenes=[{"id":"holiday-christmas","name":"Christmas Village"},{"id":"holiday-thanksgiving","name":"Thanksgiving Harvest"},{"id":"holiday-easter","name":"Easter Garden"},{"id":"holiday-valentine","name":"Valentine’s Day Cottage"},{"id":"holiday-st-patrick","name":"St. Patrick’s Day Meadow"},{"id":"holiday-mardi-gras","name":"Mardi Gras Celebration"},{"id":"holiday-halloween","name":"Halloween Candy Cottage"},{"id":"holiday-new-year","name":"New Year’s Celebration"},{"id":"holiday-usa","name":"USA Patriotic"}];
(async()=>{
 const server=fs.readFileSync('server.js','utf8'),ctx=vm.createContext({});
 vm.runInContext(server.slice(server.indexOf('const homeSceneIds ='),server.indexOf('function homeSceneForSession(')),ctx);
 for(const {id} of scenes)assert.equal(ctx.cleanHomeScene({id,motion:false,frame:'gold'}).id,id);
 const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 const p=await b.newPage({viewport:{width:1100,height:1200}});
 await p.route('http://art.local/**',r=>{const f=new URL(r.request().url()).pathname.slice(1);return fs.existsSync(f)&&f.endsWith('.png')?r.fulfill({body:fs.readFileSync(f),contentType:'image/png'}):r.fulfill({status:404,body:''});});
 await p.setContent('<base href="http://art.local/"><style>'+['styles.css','launchpad-scenes.css','scene-frame-fit.css'].map(f=>fs.readFileSync(f,'utf8').replace(/^\uFEFF/,'')).join('')+'</style><body data-theme="night"></body>');
 await p.addScriptTag({path:require('path').resolve('launchpad-scenes.js')});
 await p.evaluate(scenes=>{document.body.innerHTML=scenes.map(({id,name})=>'<article>'+LaunchpadScenes.render({authenticated:true,homeScene:{id,motion:false,frame:'gold'}},'')+'<h3>'+name+'</h3></article>').join('');},scenes);
 await p.addStyleTag({content:'body{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;padding:26px;background:#241923}article{text-align:center;min-width:0}.home-scene-feature{position:static;transform:none;display:flex;align-items:center}.school-photo{width:260px;height:260px}h3{font-size:16px}'});
 await p.locator('img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));
 assert.equal(await p.locator('.launch-scene-image').count(),9);
 await p.screenshot({path:'work/holiday-scenes-preview.png',fullPage:true});
 await p.evaluate(()=>{const s={authenticated:true,homeScene:{id:'holiday-usa',motion:false,frame:'gold'}};document.body.innerHTML=LaunchpadScenes.render(s,'');LaunchpadScenes.attach(s,'',()=>{});document.getElementById('chooseLaunchScene').click();});
 for(const {id,name} of scenes){await p.locator('#launchChooserSearch').fill(name);const c=p.locator('[data-scene-choice="'+id+'"]');assert(await c.isVisible());await c.click();assert.equal(await c.getAttribute('aria-pressed'),'true');assert((await p.locator('#launchScenePreview .launch-scene-image').getAttribute('src')).includes(id));}
 console.log('Nine holiday scenes: server acceptance, circular render, asset decoding, search and selection passed.');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
