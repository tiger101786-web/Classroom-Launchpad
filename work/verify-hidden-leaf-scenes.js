"use strict";
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const ids=['hidden-leaf-overlook','hidden-leaf-rooftops'];
(async()=>{
  const server=fs.readFileSync(path.join(root,'server.js'),'utf8');
  const catalog=server.slice(server.indexOf('const homeSceneIds'),server.indexOf('function homeSceneForSession'));
  for(const id of ids) assert.equal(vm.runInNewContext(catalog+`;cleanHomeScene({id:${JSON.stringify(id)},frame:"blue-fire",motion:false}).id`),id);
  const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});
  try{
    const page=await browser.newPage();
    const saves=[];
    await page.route('http://scene.test/**',async route=>{
      const url=new URL(route.request().url());
      if(url.pathname==='/api/home-scene'){
        const homeScene=route.request().postDataJSON();saves.push(homeScene);
        return route.fulfill({json:{session:{authenticated:true,homeScene}}});
      }
      const file=path.join(root,url.pathname);
      if(fs.existsSync(file)&&fs.statSync(file).isFile()) return route.fulfill({path:file});
      return route.fulfill({contentType:'text/html',body:'<html><head></head><body><main></main></body></html>'});
    });
    await page.goto('http://scene.test/');
    for(const file of ['styles.css','launchpad-scenes.css','scene-frame-fit.css']) await page.addStyleTag({url:`http://scene.test/${file}`});
    await page.addStyleTag({content:'body{background:#21171e;padding:45px;color:white}main{max-width:400px;margin:auto}.school-photo{width:300px;height:300px}'});
    await page.addScriptTag({url:'http://scene.test/launchpad-scenes.js'});
    for(const width of [1100,390]){
      await page.setViewportSize({width,height:800});
      for(const id of ids){
        await page.evaluate(id=>{
          const session={authenticated:true,homeScene:{id,frame:'blue-fire',motion:false}};
          document.querySelector('main').innerHTML=LaunchpadScenes.render(session,'');
          LaunchpadScenes.attach(session,'',updated=>{window.savedScene=updated.homeScene;});
        },id);
        await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(img=>img.decode())));
        assert.equal(await page.locator(`[data-scene="${id}"]`).count(),1);
        assert(await page.locator('.launch-scene-image').evaluate(img=>img.naturalWidth>0));
        await page.screenshot({path:path.join(os.tmpdir(),`${id}-${width}.png`)});
        await page.evaluate(()=>document.getElementById('chooseLaunchScene').click());
        await page.locator('#launchChooserSearch').fill('Hidden Leaf');
        assert.equal(await page.locator('[data-scene-choice]:visible').count(),2);
        await page.locator(`[data-scene-choice="${id}"]`).click();
        assert.equal(await page.locator(`#launchScenePreview [data-scene="${id}"]`).count(),1);
        await page.locator('#saveLaunchScene').click();
        await page.locator('.launch-scene-dialog').waitFor({state:'detached'});
        assert.deepEqual(saves.at(-1),{id,frame:'blue-fire',motion:false});
      }
    }
    console.log('Both Hidden Leaf scenes: server validation, desktop/mobile rendering, search, selection, save payload and frame preservation passed.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
