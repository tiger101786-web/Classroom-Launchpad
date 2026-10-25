const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const root=path.resolve(__dirname,'..'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'pet-sleep-'));
 const fixture=path.join(dir,'index.html');
 fs.writeFileSync(fixture,`<meta charset="utf-8"><base href="${pathToFileURL(root+'/').href}"><link rel="stylesheet" href="labubu-pet/interactive.css"><link rel="stylesheet" href="eagle-pet/interactive.css"><style>body{background:#28242c}.labubu-companion{left:200px!important;top:100px!important}.eagle-companion{left:700px!important;top:100px!important}</style><script src="labubu-pet/skins.js"></script><script src="labubu-pet/interactive.js"></script><script src="eagle-pet/interactive.js"></script>`);
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(fixture).href);
  await page.evaluate(()=>{window.pets=[createLabubuPet(()=>{}),createEaglePet(()=>{})];window.settings=[labubuDefaults(),eaglePetDefaults()];pets.forEach((pet,i)=>{settings[i]={...settings[i],asleep:true,size:'extra-large'};pet.update({account:'test',visible:true,radio:false,preferences:settings[i]});pet.host.style.left=(200+i*500)+'px';pet.host.style.top='100px';});});
  await page.waitForTimeout(1200);
  const samples=await page.evaluate(()=>new Promise(resolve=>{const rows=[];let last;const capture=t=>{rows.push({dt:last?t-last:0,lab:document.querySelector('#open-mouth').style.transform,jaw:document.querySelector('.lower-jaw').style.transform,path:document.querySelector('#mouth-shape').getAttribute('d')});last=t;if(rows.length<180)requestAnimationFrame(capture);else resolve(rows)};requestAnimationFrame(capture)}));
  assert(new Set(samples.map(s=>s.lab)).size>100,'Labubu mouth updates continuously');
  assert(new Set(samples.map(s=>s.jaw)).size>100,'Eagle jaw updates continuously');
  assert.equal(new Set(samples.map(s=>s.path)).size,1,'Sleep mouth geometry remains cached');
  const timing=samples.slice(1).map(s=>s.dt).sort((a,b)=>a-b);
  console.log('Sleep frame intervals: median '+timing[Math.floor(timing.length*.5)].toFixed(1)+'ms; p95 '+timing[Math.floor(timing.length*.95)].toFixed(1)+'ms');
  await page.screenshot({path:path.join(dir,'sleep.png')});
  await page.evaluate(()=>pets.forEach((pet,i)=>{settings[i].asleep=false;pet.update({account:'test',visible:true,radio:false,preferences:settings[i]})}));
  await page.waitForTimeout(4200);
  assert.equal(await page.locator('#closed-left').getAttribute('opacity'),'0');
  await page.evaluate(()=>pets.forEach((pet,i)=>pet.update({account:'test',visible:true,radio:true,preferences:settings[i]})));
  await page.waitForTimeout(900);
  assert.equal(await page.locator('#notes').getAttribute('opacity'),'1');
  assert.equal(await page.locator('#notes').evaluate(e=>getComputedStyle(e).fontSize),'180px');
  await page.screenshot({path:path.join(dir,'dance.png')});
  await page.evaluate(()=>pets.forEach((pet,i)=>{settings[i].motion=false;settings[i].asleep=true;pet.update({account:'test',visible:true,radio:false,preferences:settings[i]})}));
  const frozen=await page.locator('#open-mouth').getAttribute('style');await page.waitForTimeout(300);assert.equal(await page.locator('#open-mouth').getAttribute('style'),frozen);
  assert.deepEqual(errors,[]);console.log('PASS: continuous sleep layers, wake, dance symbols and motion-off. Screenshots: '+dir);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
