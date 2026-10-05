const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require('playwright');
(async()=>{
 const pairs=require('./scene-matched-frame-plan.json').frames;
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1400,height:850}});
  await page.route('http://frames.test/**',r=>r.fulfill({body:fs.readFileSync(path.join(process.cwd(),new URL(r.request().url()).pathname)),contentType:'image/png'}));
  const css=['styles.css','launchpad-scenes.css','scene-frame-fit.css','scene-matched-frames.css'].map(f=>fs.readFileSync(f,'utf8')).join('\n');
  await page.setContent('<base href="http://frames.test/"><style>'+css+'body{margin:0;background:#25191e;color:white}main{display:grid;grid-template-columns:repeat(4,350px)}article{padding:24px;text-align:center}article .home-scene-feature{margin:0;position:static}article .school-photo{width:280px;height:280px}article button{display:none}p{font:14px sans-serif}</style><main></main>');
  await page.addScriptTag({path:path.resolve('launchpad-scenes.js')});
  for(let start=0;start<pairs.length;start+=7){
   await page.evaluate(pairs=>{document.querySelector('main').innerHTML=pairs.map(p=>'<article>'+LaunchpadScenes.render({authenticated:true,homeScene:{id:p.scene,frame:p.frame,motion:false}},'')+'<p>'+p.scene+'</p></article>').join('')},pairs.slice(start,start+7));
   await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
   const output=path.join(os.tmpdir(),'matched-preview-'+start+'.png');
   await page.screenshot({path:output});console.log(output);
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
