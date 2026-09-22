const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),shelf=require('../collectible-shelf');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1100,height:900}});
 await page.route('http://art.local/**',route=>route.fulfill({body:fs.readFileSync(path.join(__dirname,'..',new URL(route.request().url()).pathname)),contentType:'image/png'}));
 const css=['launchpad-scenes.css','collectible-shelf.css'].map(f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8')).join('\n');
 const seasonal=shelf.items.filter(i=>i.category==='Fall & Halloween');
 assert.equal(seasonal.length,10);
 let gallery='';
 for(let i=0;i<seasonal.length;i+=3)gallery+='<section>'+shelf.art({enabled:true,theme:'autumn',slots:[...seasonal.slice(i,i+3).map(x=>x.id),'none','none'].slice(0,3)})+'</section>';
 await page.setContent('<base href="http://art.local/"><style>'+css+'body{margin:30px;background:#171015;color:white}.school-photo{width:340px;height:340px;border-radius:50%}.home-scene-feature{display:block}#gallery{display:grid;grid-template-columns:repeat(2,1fr);gap:70px 50px;margin-top:65px}section{max-width:350px}</style><div id="scene"></div><div id="gallery">'+gallery+'</div>');
 await page.addScriptTag({path:path.join(__dirname,'../launchpad-scenes.js')});
 await page.evaluate(()=>document.querySelector('#scene').innerHTML=LaunchpadScenes.render({authenticated:true,homeScene:{id:'ninja-course',motion:true,frame:'none'}},''));
 await page.locator('.launch-scene-image').evaluate(img=>img.decode());
 const light=page.locator('.scene-ninja-course .launch-scene-particles i').first();
 assert.equal(await light.evaluate(el=>getComputedStyle(el).animationName),'scene-ninja-lights');
 await page.locator('.launch-scene').evaluate(el=>el.classList.add('is-paused'));
 assert.equal(await light.evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
 await page.locator('.launch-scene').evaluate(el=>el.classList.remove('is-paused'));
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await light.evaluate(el=>getComputedStyle(el).animationName),'none');
 await page.screenshot({path:path.join(__dirname,'ninja-fall-preview.png'),fullPage:true});
 console.log('Ninja scene renders; lights pause and respect reduced motion; 10 seasonal items render.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
