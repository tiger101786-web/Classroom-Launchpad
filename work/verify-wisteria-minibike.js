const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { chromium } = require('playwright');
const sharp = require('sharp');
const shelf = require('../collectible-shelf');
const root = path.resolve(__dirname, '..');
process.chdir(root);
(async () => {
  for (const [id, category, original] of [
    ['anime-doma-bust','Anime','grok-image-e217cb34-f8c7-467c-9119-a6a23c7beac7.png'],
    ['disney-mufasa-bust','Disney','grok-image-27c6f87a-2a15-4be8-936f-4efcab19f90e.png']
  ]) {
    assert.equal(shelf.items.find(item => item.id === id).category, category);
    assert(fs.readFileSync('assets/shelf-' + id + '.png').equals(fs.readFileSync('C:/Users/Sinister/Desktop/' + original)));
  }
  const selection = {enabled:true,theme:'demon-slayer-wisteria',slots:['anime-doma-bust','disney-mufasa-bust','anime-tanjiro-statue']};
  assert.deepEqual(shelf.clean(selection), selection);
  const server = fs.readFileSync('server.js','utf8');
  const validation = server.slice(server.indexOf('const homeSceneIds'),server.indexOf('function homeSceneForSession'));
  const scene = {id:'minibike-track',frame:'match-minibike-track',motion:true};
  assert.deepEqual(JSON.parse(JSON.stringify(vm.runInNewContext(validation+';cleanHomeScene('+JSON.stringify(scene)+')'))),scene);
  const {data,info} = await sharp('assets/scene-frame-match-minibike-track-thin-v2.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.equal(data[3],0);
  assert.equal(data[(Math.floor(info.height/2)*info.width+Math.floor(info.width/2))*4+3],0);
  const browser = await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    const page = await browser.newPage({viewport:{width:1200,height:850}});
    await page.route('http://art.local/assets/*',route => route.fulfill({contentType:'image/png',body:fs.readFileSync(path.join(root,new URL(route.request().url()).pathname))}));
    await page.route('**/api/home-scene',route => route.fulfill({json:{session:{authenticated:true,homeScene:route.request().postDataJSON()}}}));
    const css = ['styles.css','launchpad-scenes.css','scene-frame-fit.css','scene-matched-frames.css','disney-oct6-scenes.css','scene-exterior-frames.css','minibike-track.css','collectible-shelf.css'].map(file=>fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'')).join('\n');
    await page.setContent('<base href="http://art.local/"><style>'+css+'body{padding:30px}main{max-width:1140px;margin:auto}.home-scene-feature{position:relative;inset:auto;transform:none}</style><main></main>');
    await page.addScriptTag({path:path.join(root,'launchpad-scenes.js')});
    const render = async frame => {
      await page.evaluate(({frame,shelfArt})=>{
        const session={authenticated:true,homeScene:{id:'minibike-track',frame,motion:true}};
        document.querySelector('main').innerHTML='<div class="home-display-row"><div class="home-shelf-position"><div class="home-collectible-shelf">'+shelfArt+'</div></div>'+LaunchpadScenes.render(session,'')+'<div class="home-shelf-position"><div class="home-collectible-shelf">'+shelfArt+'</div></div></div>';
        LaunchpadScenes.attach(session,'',session=>window.savedScene=session.homeScene);
      },{frame,shelfArt:shelf.art(selection)});
      await page.locator('img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
    };
    for (const width of [1200,390]) {
      await page.setViewportSize({width,height:850});
      for (const theme of ['night','day']) {
        await page.locator('body').evaluate((body,theme)=>body.dataset.theme=theme,theme);
        await render('none');
        const plain = await page.locator('.launch-scene-image').boundingBox();
        await render('match-minibike-track');
        const framed = await page.locator('.launch-scene-image').boundingBox();
        assert.equal(framed.width,plain.width);
        assert.equal(framed.height,plain.height);
        assert.equal(await page.locator('.launch-scene-image').evaluate(el=>getComputedStyle(el).animationName),'none');
        assert.equal(await page.locator('.launch-scene-particles').evaluate(el=>getComputedStyle(el).display),'none');
        assert.equal(await page.locator('.minibike-sun-glow').evaluate(el=>getComputedStyle(el).animationName),'minibike-sun-breathe');
        const bases = await page.locator('.collectible-shelf').evaluateAll(shelves=>shelves.flatMap(el=>{
          const box=el.getBoundingClientRect(),style=getComputedStyle(el),top=box.top+box.height*Number(style.getPropertyValue('--shelf-surface-top')),bottom=box.top+box.height*Number(style.getPropertyValue('--shelf-surface-bottom'));
          return [...el.querySelectorAll('.shelf-object')].map(item=>{const b=item.getBoundingClientRect();const base=b.bottom-b.width*4/220;return base>=top&&base<=bottom;});
        }));
        assert(bases.every(Boolean),'Both shelves keep all bases on their ledges');
        await page.screenshot({path:'C:/Users/Sinister/Documents/Email/minibike-wisteria-'+width+'-'+theme+'.png',fullPage:true});
      }
    }
    await page.setViewportSize({width:1200,height:850});
    await render('match-minibike-track');
    await page.evaluate(()=>document.getElementById('chooseLaunchFrame').click());
    await page.locator('#launchChooserCategory').selectOption('Sports');
    await page.locator('#launchChooserSearch').fill('minibike');
    await page.locator('[data-frame-choice="match-minibike-track"]').click();
    await page.locator('#saveLaunchFrame').click();
    await page.waitForFunction(()=>window.savedScene?.frame==='match-minibike-track');
    await page.evaluate(()=>document.getElementById('chooseLaunchScene').click());
    await page.locator('#launchChooserCategory').selectOption('Sports');
    await page.locator('#launchChooserSearch').fill('minibike');
    await page.locator('[data-scene-choice="minibike-track"]').click();
    await page.locator('#saveLaunchScene').click();
    await page.waitForFunction(()=>window.savedScene?.id==='minibike-track');
    await page.evaluate(()=>document.getElementById('toggleLaunchScene').click());
    await page.waitForFunction(()=>window.savedScene?.motion===false);
    // The app redraws the homepage from the returned saved session.
    await page.evaluate(()=>document.querySelector('.home-scene-feature').outerHTML=LaunchpadScenes.render({authenticated:true,homeScene:window.savedScene},''));
    assert(await page.locator('.scene-minibike-track').evaluate(el=>el.classList.contains('is-paused')));
    assert.equal(await page.locator('.minibike-sun-glow').evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
    await page.emulateMedia({reducedMotion:'reduce'});
    assert.equal(await page.locator('.minibike-sun-glow').evaluate(el=>getComputedStyle(el).animationName),'none');
    console.log('Original statue files, categories, saved IDs, transparent frame, unchanged scene dimensions, ledge placement, desktop/mobile light/dark, category search/save, sun motion, pause and reduced motion passed.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
