const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:1200,height:900}});
 await page.goto('file:///'+path.join(__dirname,'colt-skins-preview.html').replaceAll('\\','/'));
 await page.evaluate(()=>api.update({account:'preview',visible:true,radio:true,preferences:roboColtDefaults()}));
 const notes=page.locator('.notes .music-note');assert.equal(await notes.count(),4);
 assert.deepEqual(await notes.allTextContents(),['♪','♫','♫','♪']);
 const result=await page.evaluate(()=>{
  const svg=document.querySelector('.pet-button>svg'),matrix=svg.getScreenCTM();
  // Generously includes the face and the small dancing sway.
  const a=new DOMPoint(170,150).matrixTransform(matrix),b=new DOMPoint(575,440).matrixTransform(matrix);
  const notes=[...document.querySelectorAll('.notes .music-note')];
  const timing=notes.map(n=>({duration:getComputedStyle(n).animationDuration,delay:getComputedStyle(n).animationDelay}));
  for(const n of notes){const anim=n.getAnimations()[0];anim.pause();
   for(let t=0;t<=2400;t+=60){anim.currentTime=t;const r=n.getBoundingClientRect();
    if(r.left<b.x&&r.right>a.x&&r.top<b.y&&r.bottom>a.y)return {overlap:true,timing};
   }
   anim.currentTime=650;
  }
  return {overlap:false,timing};
 });
 assert.equal(result.overlap,false);
 assert.deepEqual(result.timing.map(t=>t.duration),['2.4s','2.4s','2.4s','2.4s']);
 assert.deepEqual(result.timing.map(t=>t.delay),['0s','-0.6s','-1.2s','-1.8s']);
 await page.locator('.pet-button').screenshot({path:path.join(__dirname,'colt-matched-notes.png')});
 await page.evaluate(()=>api.update({account:'preview',visible:true,radio:false,preferences:roboColtDefaults()}));
 assert.equal(await page.locator('.notes').evaluate(e=>getComputedStyle(e).display),'none');
 console.log('PASS: four dumpling-style notes, matching timing, face clear throughout the cycle, hidden when music stops.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
