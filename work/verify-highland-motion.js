const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage();
  await page.setContent('<style>'+fs.readFileSync('launchpad-scenes.css','utf8')+'</style><div class="launch-scene scene-highland" style="width:300px;height:300px"><span class="launch-scene-particles">'+Array.from({length:9},(_,n)=>`<i style="--n:${n}"></i>`).join('')+'</span></div>');
  const motion=await page.locator('i').evaluateAll(nodes=>nodes.map(n=>{const s=getComputedStyle(n);return {name:s.animationName,timing:s.animationTimingFunction,direction:s.animationDirection,duration:s.animationDuration,delay:s.animationDelay};}));
  assert(motion.every(m=>m.name==='scene-firefly-flow'&&m.timing==='linear'&&m.direction==='normal'&&m.duration==='7s'));
  assert.equal(new Set(motion.map(m=>m.delay)).size,9);
  const positions=await page.locator('i').first().evaluate(async el=>{const a=el.getAnimations()[0];a.pause();const ys=[];for(const t of [1000,2000,3000,4000,5000]){a.currentTime=t;ys.push(new DOMMatrix(getComputedStyle(el).transform).m42);}return ys;});
  for(let i=1;i<positions.length;i++)assert(Math.abs(positions[i]-positions[i-1]+50)<.1,'Drift should remain constant, without easing stops');
  await page.locator('.launch-scene').evaluate(e=>e.classList.add('is-paused'));
  assert.equal(await page.locator('i').last().evaluate(e=>getComputedStyle(e).animationPlayState),'paused');
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('i').last().evaluate(e=>getComputedStyle(e).animationName),'none');
  console.log('Highland motion: steady linear speed, staggered loops, pause and reduced-motion checks passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
