const {chromium}=require('playwright');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});
 try {
  const page=await browser.newPage({viewport:{width:1500,height:1800}});
  await page.goto('file:///'+path.join(__dirname,'index.html').replaceAll('\\','/'));
  await page.waitForFunction(()=>window.saberTest?.ready);
  await page.evaluate(()=>{saberTest.state.idle=false;document.querySelector('.layout').style.display='block';document.querySelector('#pet').style.width='700px'});
  await page.waitForTimeout(350);
  for(const [name,time] of [['paw',.825],['left',.3],['right',.9]]){
   await page.evaluate(({name,time})=>{const s=saberTest.state;s.mode='idle';s.motion=false;s.nextBlink=999;s.blinkStart=-10;saberTest.play(name==='paw'?'paw':'dance');if(name==='paw')s.action.start=s.time-time;else s.time=time},{name,time});
   await page.waitForTimeout(150);
   await page.locator('#pet').screenshot({path:path.join(__dirname,'test-claw-'+name+'.png')});
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
