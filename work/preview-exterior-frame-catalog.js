const fs=require('fs'),path=require('path'),{chromium}=require('playwright');
const frames=require('./thin-frame-plan.json').frames;
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:1120}});
  await page.route('http://frames.test/**',r=>r.fulfill({body:fs.readFileSync(path.join(process.cwd(),new URL(r.request().url()).pathname)),contentType:'image/png'}));
  const css=['styles.css','launchpad-scenes.css','scene-frame-fit.css','scene-matched-frames.css','disney-oct6-scenes.css','scene-exterior-frames.css'].map(f=>fs.readFileSync(f,'utf8')).join('\n');
  await page.setContent('<base href="http://frames.test/"><style>'+css+'body{background:#30202b;color:white;font:12px Arial;margin:15px}main{display:grid;grid-template-columns:repeat(6,185px);gap:12px}article{text-align:center;min-height:205px}.home-scene-feature{position:relative!important;inset:auto!important;transform:none!important;display:block!important;width:100%!important;margin:20px auto!important}.school-photo,.launch-scene-stage{width:154px!important;height:154px!important;margin:auto!important}.launch-scene-settings{display:none!important}</style><main></main>');
  await page.addScriptTag({path:path.resolve('launchpad-scenes.js')});
  for(let start=0;start<frames.length;start+=30){
   await page.evaluate(fs=>document.querySelector('main').innerHTML=fs.map(f=>'<article>'+LaunchpadScenes.render({authenticated:true,homeScene:{id:f.matchedScene||'hidden-leaf-overlook',frame:f.id,motion:false}},'')+'<div>'+f.name+'</div></article>').join(''),frames.slice(start,start+30));
   await page.locator('img').evaluateAll(is=>Promise.all(is.map(i=>i.decode())));
   await page.screenshot({path:path.resolve('work/exterior-frame-catalog-'+start+'.png'),fullPage:true});
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
