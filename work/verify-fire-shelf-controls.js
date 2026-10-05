const fs=require('fs'),path=require('path'),os=require('os'),assert=require('assert/strict'),vm=require('vm');
const {chromium}=require('playwright');
(async()=>{
 const src=fs.readFileSync('app.js','utf8'),server=fs.readFileSync('server.js','utf8');
 const ids=['blue-fire','regular-fire','rainbow-fire'];
 const catalog=server.slice(server.indexOf('const profileFrameIds'),server.indexOf('\n',server.indexOf('function cleanProfileFrame')));
 for(const id of ids) assert.equal(vm.runInNewContext(catalog+';cleanProfileFrame('+JSON.stringify(id)+')',{homeSceneFrameIds:new Set()}),id);
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:850}});
  await page.route('http://local.test/**',r=>r.fulfill({path:path.join(process.cwd(),new URL(r.request().url()).pathname)}));
  await page.setContent('<base href="http://local.test/"><body data-theme="night"><main></main></body>');
  for(const f of ['styles.css','collectible-shelf.css'])await page.addStyleTag({path:path.resolve(f)});
  await page.addScriptTag({path:path.resolve('collectible-shelf.js')});
  await page.addScriptTag({content:"const normalizeProfileAvatarUrl=x=>x;const escapeHtml=x=>x;const forumInitials=()=> 'CC';"+src.slice(src.indexOf('const PROFILE_FRAMES ='),src.indexOf('function renderForumAuthor('))});
  await page.evaluate(ids=>{
   document.querySelector('main').innerHTML='<div style="display:flex;gap:40px;padding:50px">'+ids.map(id=>'<div>'+renderForumAvatar('Test','', 'forum-profile-preview',id)+'<p>'+id+'</p></div>').join('')+'</div><div class="home-display-row">'+CollectibleShelf.render({authenticated:true,homeShelf:{enabled:false,slots:['horse','crystal','planet'],theme:'crimson'}},'left')+CollectibleShelf.render({authenticated:true,homeShelfRight:{enabled:true,slots:['horse','crystal','planet'],theme:'crimson'}},'right')+'</div>';
  },ids);
  await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
  await page.screenshot({path:path.join(os.tmpdir(),'fire-profile-shelf.png')});
  const controls=page.locator('.shelf-visibility-controls');
  assert.equal(await controls.count(),2);
  await page.waitForTimeout(3500);
  assert.equal(await controls.first().evaluate(e=>getComputedStyle(e).opacity),'0');
  await page.locator('.shelf-restore').dispatchEvent('pointermove');
  assert.equal(await controls.first().evaluate(e=>getComputedStyle(e).opacity),'1');
  await page.waitForTimeout(3100);
  assert.equal(await controls.first().evaluate(e=>getComputedStyle(e).opacity),'0');
  await controls.first().locator('button').focus();
  await page.waitForTimeout(3100);
  assert.equal(await controls.first().evaluate(e=>getComputedStyle(e).opacity),'1');
  await page.locator('.home-collectible-shelf').dispatchEvent('pointerdown',{pointerType:'touch'});
  assert.equal(await controls.last().evaluate(e=>getComputedStyle(e).opacity),'1');
  assert.equal(await controls.first().locator('button').getAttribute('data-action'),'showCollectibleShelf');
  assert.equal(await controls.last().locator('button').getAttribute('data-action'),'hideCollectibleShelf');
  const handler=src.slice(src.indexOf('  if (action === "hideCollectibleShelf"'),src.indexOf('  if (action === "collectibleShelf")'));
  await page.addScriptTag({content:"let authSession={authenticated:true,role:'student',email:'test',homeShelf:{enabled:true,slots:['horse','crystal','planet'],theme:'crimson'},homeShelfRight:{enabled:true,slots:['horse','crystal','planet'],theme:'crimson'}};const isSignedIn=()=>true;const sharedBackend={request:async(url,opts)=>{window.shelfPayload=JSON.parse(opts.body);const key=shelfPayload.side==='right'?'homeShelfRight':'homeShelf';return {session:{...authSession,[key]:shelfPayload}}}};const render=()=>{};window.testShelfAction=async(target,action)=>{"+handler+"};"});
  for(const side of ['left','right']){
   for(const showing of [false,true]){
    const payload=await page.evaluate(async({side,showing})=>{
     const target=document.createElement('button');target.dataset.shelfSide=side;
     await testShelfAction(target,showing?'showCollectibleShelf':'hideCollectibleShelf');
     return shelfPayload;
    },{side,showing});
    assert.equal(payload.side,side);assert.equal(payload.enabled,showing);
    assert.deepEqual(payload.slots,['horse','crystal','planet']);assert.equal(payload.theme,'crimson');
   }
  }
  console.log('Three fire frame IDs/artwork; shelf idle, hover, keyboard, touch and left/right show/hide save payloads passed.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
