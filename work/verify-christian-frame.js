const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { chromium } = require('playwright');
(async () => {
  const server = fs.readFileSync('server.js', 'utf8');
  const catalog = server.slice(server.indexOf('const homeSceneIds'), server.indexOf('function homeSceneForSession'));
  assert.deepEqual(JSON.parse(JSON.stringify(vm.runInNewContext(catalog + ';cleanHomeScene({id:"highland",frame:"christian",motion:false})'))), {id:'highland',frame:'christian',motion:false});
  const browser = await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    const page = await browser.newPage();
    await page.route('http://art.local/**', route => route.fulfill({body:fs.readFileSync(path.join(process.cwd(),new URL(route.request().url()).pathname)),contentType:'image/png'}));
    const css = ['styles.css','launchpad-scenes.css','scene-frame-fit.css'].map(f=>fs.readFileSync(f,'utf8')).join('\n');
    await page.setContent('<base href="http://art.local/"><style>'+css+'body{margin:0;background:#25191e;padding:30px;color:white}main{max-width:400px;margin:auto}.school-photo{width:300px;height:300px}</style><main></main>');
    await page.addScriptTag({path:path.resolve('launchpad-scenes.js')});
    for (const width of [1100,390]) {
      await page.setViewportSize({width,height:700});
      await page.evaluate(()=>{
        const session={authenticated:true,homeScene:{id:'highland',frame:'christian',motion:false}};
        document.querySelector('main').innerHTML=LaunchpadScenes.render(session,'');
        LaunchpadScenes.attach(session,'',()=>{});
      });
      for (const img of await page.locator('img').all()) await img.evaluate(i=>i.decode());
      assert.equal(await page.locator('[data-scene="highland"]').count(),1);
      assert.match(await page.locator('[data-scene="highland"]').evaluate(e=>getComputedStyle(e).clipPath),/^polygon/);
      const {data,info} = await require('sharp')('assets/scene-frame-christian.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});
      const alpha = [data[3], data[(Math.floor(info.height/2)*info.width+Math.floor(info.width/2))*4+3]];
      assert.deepEqual(alpha,[0,0]);
      if(width===1100) await page.screenshot({path:'work/christian-frame-preview.png'});
      for(const [button,selector] of [['chooseLaunchFrame','data-frame-choice']]){
        await page.evaluate(id=>document.getElementById(id).click(),button);
        await page.locator('#launchChooserSearch').fill('Christian');
        const choice=page.locator(`[${selector}="christian"]`);
        await choice.click();
        assert.equal(await page.locator('#launchScenePreview [data-scene="highland"]').count(),1);
        assert.equal(await page.locator('#launchScenePreview [data-scene-frame="christian"]').count(),1);
        await page.keyboard.press('Escape');
      }
    }
    console.log('Christian frame: server validation, transparent frame, fitted render, chooser search and selection passed at desktop/mobile widths.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
