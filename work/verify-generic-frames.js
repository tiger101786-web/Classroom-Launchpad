const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try {
 const page=await browser.newPage({viewport:{width:1100,height:850}});
 await page.route('http://art.local/**',r=>r.fulfill({body:fs.readFileSync(path.join(__dirname,'..',new URL(r.request().url()).pathname)),contentType:'image/png'}));
 const css=['styles.css','launchpad-scenes.css'].map(f=>fs.readFileSync(f,'utf8')).join('\n');
 await page.setContent('<base href="http://art.local/"><style>'+css+'body{background:#20151a;color:white;padding:24px}.gallery{display:flex;flex-wrap:wrap;gap:25px}.gallery .school-photo{width:260px;height:260px}.sizes{display:flex;align-items:center;gap:25px;margin-top:40px}</style><main></main>');
 await page.addScriptTag({path:path.resolve('launchpad-scenes.js')});
 const app=fs.readFileSync('app.js','utf8');
 await page.addScriptTag({content:app.slice(app.indexOf('const PROFILE_FRAMES ='),app.indexOf('function renderForumAvatar'))});
 await page.evaluate(()=>{
  const stage=id=>{const host=document.createElement('div');host.innerHTML=LaunchpadScenes.render({authenticated:true,homeScene:{id:'cafe',frame:id,motion:false}},'');const stage=host.querySelector('.launch-scene-stage');stage.querySelector('button').remove();return stage.outerHTML;};
  document.querySelector('main').innerHTML='<div class="gallery">'+['titanium','walnut','ivory'].map(stage).join('')+'</div>'+['silver-rope','emerald-jewel'].map(id=>'<div class="sizes">'+[40,64,100].map(size=>`<span class="profile-frame frame-${id}" style="width:${size}px;height:${size}px"><span class="forum-avatar forum-avatar-initials">AB</span>${profileFrameArt(id)}</span>`).join('')+id+'</div>').join('');
 });
 for(const el of await page.locator('img').all())await el.evaluate(i=>i.decode());
 for(const el of await page.locator('.scene-frame').all()) {
  const fit=await el.evaluate(e=>{const a=e.getBoundingClientRect(),b=e.parentElement.querySelector('.school-photo').getBoundingClientRect();return Math.abs(a.width-b.width)+Math.abs(a.height-b.height)+Math.abs(a.x-b.x)+Math.abs(a.y-b.y)});
  assert(fit<1);
 }
 for(const el of await page.locator('.profile-frame-art').all())assert(await el.evaluate(e=>{const b=e.getBBox();return b.x>=0&&b.y>=0&&b.x+b.width<=100&&b.y+b.height<=100}));
 await page.screenshot({path:'work/generic-frames-preview.png',fullPage:true});
 for(const width of [1366,390]) {
  await page.setViewportSize({width,height:850});
  await page.evaluate(()=>{const session={authenticated:true,homeScene:{id:'cafe',frame:'none',motion:false}};document.querySelector('main').innerHTML=LaunchpadScenes.render(session,'');LaunchpadScenes.attach(session,'',()=>{});document.querySelector('#chooseLaunchFrame').click();});
  assert.equal(await page.locator('[data-frame-choice]').first().getAttribute('data-frame-choice'),'none');
  const names=await page.locator('[data-frame-choice] strong').allTextContents();
  assert.deepEqual(names.slice(1),names.slice(1).sort((a,b)=>a.localeCompare(b,'en',{sensitivity:'base'})));
  for(const [id,query] of [['titanium','Titanium'],['walnut','Walnut'],['ivory','Ivory']]) {
   await page.locator('#launchChooserSearch').fill(query);
   await page.locator(`[data-frame-choice="${id}"]`).click();
   assert.equal(await page.locator('#launchScenePreview [data-scene-frame]').getAttribute('data-scene-frame'),id);
  }
  await page.keyboard.press('Escape');
 }
 console.log('Five frames render and fit; scene search, selection, pinned reset and alphabetical ordering pass at desktop/mobile widths.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
