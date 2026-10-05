"use strict";
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const ids=['hidden-leaf-overlook','hidden-leaf-rooftops',...['nezuko','shinobu','akaza','tanjiro','rengoku','giyu'].map(name=>`demon-slayer-${name}`)];
ids.push('walled-city-fountain','walled-city-market','moonlit-cherry-village');
ids.push('pokemon-campus','pokemon-indoor-arena');
ids.push('forest-temple','mha-ua-campus');
const additions={'floating-sky-tower':['Floating Sky Tower','scene-ua-sunbeams'],'soccer-training-complex':['Soccer Training Complex','scene-training-lights'],'sunset-school-gym':['Sunset School Gym','scene-leaf-sun-rays'],'tokyo-cherry-night':['Tokyo Cherry Blossom Night','scene-petals'],'kame-house-island':['Kame House Island','scene-ua-sunbeams']};
ids.push(...Object.keys(additions));
const disney={agrabah:['Disney Agrabah Palace','scene-disney-gold'],'snow-castle':['Disney Snowy Mountain Castle','scene-snow'],'pride-rock':['Disney Pride Rock','scene-leaf-sun-rays'],'undersea-palace':['Disney Undersea Palace','scene-bubble'],bayou:['Disney Firefly Bayou','scene-disney-fireflies'],'river-valley':['Disney Sunset River Valley','scene-harbor-ripples'],'island-cottage':['Disney Tropical Island Cottage','scene-harbor-ripples'],'alpine-harbor':['Disney Alpine Castle Harbor','scene-harbor-ripples']};
for (const [name,info] of Object.entries(disney)) {const id=`disney-${name}`; additions[id]=info; ids.push(id);}
additions['disney-island-cottage'][1]='scene-cottage-surf';
const parks={'epcot-night':['Disney EPCOT After Dark','scene-park-color'],'hollywood-hotel':['Disney Hollywood Tower Hotel','scene-park-lamps'],'haunted-mansion':['Disney Moonlit Haunted Mansion','scene-park-lamps'],'castle-fountain':['Disney Castle Fountain Gardens','scene-castle-cascade'],'twilight-boulevard':['Disney Twilight Castle Boulevard','scene-park-lamps']};
for (const [name,info] of Object.entries(parks)) {const id=`disney-${name}`; additions[id]=info; ids.push(id);}
ids.push('royal-castle-city','sunlit-palace-harbor','pokemon-center-gardens');
const storyWorlds={"disney-paris-rooftops":["Disney Paris Moonlit Rooftops","scene-park-lamps"],"disney-olympus":["Disney Mount Olympus","scene-leaf-sun-rays"],"disney-notre-dame":["Disney Notre Dame Sunset","scene-leaf-sun-rays"],"disney-monstropolis":["Disney Monstropolis After Dark","scene-monster-searchlights"],"disney-halloween-town":["Disney Halloween Town","scene-park-lamps"],"disney-memory-headquarters":["Disney Memory Headquarters","scene-memory-glow"],"disney-toy-bedroom":["Disney Toy-Filled Bedroom","scene-ua-sunbeams"],"disney-tropical-lagoon":["Disney Tropical Mountain Lagoon","scene-cottage-surf"],"disney-skull-lagoon":["Disney Moonlit Skull Lagoon","scene-harbor-ripples"],"disney-marigold-bridge":["Disney Marigold Bridge","scene-petals"],"disney-radiator-springs":["Disney Radiator Springs Sunset","scene-park-lamps"],"disney-jungle-ruins":["Disney Moonlit Jungle Ruins","scene-harbor-ripples"]};
for (const [id,info] of Object.entries(storyWorlds)) { additions[id]=info; ids.push(id); }
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
      return route.fulfill({contentType:'text/html; charset=utf-8',body:'<html><head><meta charset="utf-8"></head><body><main></main></body></html>'});
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
        const particle=page.locator('.launch-scene-particles i').first();
        const radiance=page.locator('.launch-scene-radiance');
        if (await radiance.count()) assert.equal(await radiance.evaluate(el=>getComputedStyle(el,'::before').animationPlayState),'paused');
        assert.equal(await particle.evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
        if (id.startsWith('hidden-leaf')) {
          for (const pseudo of ['::before','::after']) assert.equal(await page.locator('.launch-scene-particles').evaluate((el,p)=>getComputedStyle(el,p).animationPlayState,pseudo),'paused');
        }
        await page.locator('.launch-scene').evaluate(el=>el.classList.remove('is-paused'));
        const duration = await particle.evaluate(el=>parseFloat(getComputedStyle(el).animationDuration));
        const subtle = id === 'moonlit-cherry-village';
        if (additions[id]) assert.equal(await particle.evaluate(el=>getComputedStyle(el).animationName),additions[id][1]);
        if (id.startsWith('pokemon-')) assert.equal(await particle.evaluate(el=>getComputedStyle(el).animationName),id === 'pokemon-indoor-arena' ? 'scene-arena-shine' : 'scene-leaves');
        if (id === 'royal-castle-city' || id === 'sunlit-palace-harbor') assert.equal(await particle.evaluate(el=>getComputedStyle(el).animationName),id === 'royal-castle-city' ? 'scene-ua-sunbeams' : 'scene-harbor-ripples');
        if (id === 'walled-city-fountain') assert.equal(await page.locator('.launch-scene-particles').evaluate(el=>getComputedStyle(el).clipPath),'inset(0px 0px 21%)');
        if (id === 'forest-temple' || id === 'mha-ua-campus') assert.equal(await particle.evaluate(el=>getComputedStyle(el).animationName),id === 'forest-temple' ? 'scene-leaves' : 'scene-ua-sunbeams');
        assert(subtle ? duration >= 3 && duration <= 5 : duration > 0 && duration <= 2.4, `${id}: unexpected duration ${duration}`);
        assert.equal(await particle.evaluate(el=>getComputedStyle(el).animationPlayState),'running');
        if (await radiance.count()) {
          const light=await radiance.evaluate(el=>{const s=getComputedStyle(el,'::before');return {name:s.animationName,state:s.animationPlayState};});
          assert.equal(light.name,['disney-radiator-springs','disney-river-valley'].includes(id)?'scene-background-rays':'scene-moon-halo');
          assert.equal(light.state,'running');
        }
        if (id.startsWith('hidden-leaf')) {
          const radiance = await page.locator('.launch-scene-particles').evaluate(el=>['::before','::after'].map(p=>{const s=getComputedStyle(el,p);return {name:s.animationName,state:s.animationPlayState,duration:s.animationDuration};}));
          assert.deepEqual(radiance.map(s=>s.name),['scene-leaf-sun-glow','scene-leaf-sun-rays']);
          assert(radiance.every(s=>s.state==='running' && s.duration==='2.4s'));
        }
        await page.emulateMedia({reducedMotion:'reduce'});
        assert.equal(await particle.evaluate(el=>getComputedStyle(el).animationName),'none');
        if (await radiance.count()) assert.equal(await radiance.evaluate(el=>getComputedStyle(el,'::before').animationName),'none');
        if (id.startsWith('hidden-leaf')) {
          for (const pseudo of ['::before','::after']) assert.equal(await page.locator('.launch-scene-particles').evaluate((el,p)=>getComputedStyle(el,p).animationName,pseudo),'none');
        }
        await page.emulateMedia({reducedMotion:'no-preference'});
        await page.screenshot({path:path.join(os.tmpdir(),`${id}-${width}.png`)});
        await page.evaluate(()=>document.getElementById('chooseLaunchScene').click());
        const search = id === 'royal-castle-city' ? 'Royal Castle City' : id === 'sunlit-palace-harbor' ? 'Sunlit Palace Harbor' : id === 'forest-temple' ? 'Forest Temple' : id === 'mha-ua-campus' ? 'MHA' : id.startsWith('pokemon-') ? 'Pokémon' : id.startsWith('walled-city') ? 'Walled City' : id === 'moonlit-cherry-village' ? 'Moonlit Cherry Blossom' : id.startsWith('hidden-leaf') ? 'Hidden Leaf' : 'Demon Slayer';
        await page.locator('#launchChooserSearch').fill(additions[id]?.[0] || (id === 'moonlit-cherry-village' ? 'Moonlit Cherry Blossom Village' : search));
        assert.equal(await page.locator('[data-scene-choice]:visible').count(),additions[id]?1:id.startsWith('demon-slayer')?6:id.startsWith('pokemon-')?3:['moonlit-cherry-village','forest-temple','mha-ua-campus','royal-castle-city','sunlit-palace-harbor'].includes(id)?1:2, `Search results for ${id}`);
        await page.locator(`[data-scene-choice="${id}"]`).click();
        assert.equal(await page.locator(`#launchScenePreview [data-scene="${id}"]`).count(),1);
        await page.locator('#saveLaunchScene').click();
        await page.locator('.launch-scene-dialog').waitFor({state:'detached'});
        assert.deepEqual(saves.at(-1),{id,frame:'blue-fire',motion:false});
      }
    }
    console.log(`${ids.length} scenes: validation, desktop/mobile render, search, save payload, frame preservation, scene-specific motion, pause and reduced motion passed.`);
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
