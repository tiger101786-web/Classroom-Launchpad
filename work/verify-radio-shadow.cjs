const path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
 try {
  const page=await browser.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://launchpad-test.local/',r=>r.fulfill({contentType:'text/html',body:'<html><body><div id="coltRadioRoot"></div></body></html>'}));
  await page.goto('https://launchpad-test.local/');
  await page.addScriptTag({path:path.resolve(__dirname,'../colt-radio.js')});
  await page.getByRole('button',{name:'Open Colt Radio',exact:true}).click();
  const card=page.locator('[data-station="181-classic-buzz"]');
  assert.equal(await card.locator('.colt-radio-station-family').textContent(),'Punk');
  assert.equal(await card.locator('.colt-radio-station-style').textContent(),'90s till Now');
  const families=await page.locator('.colt-radio-station-family').allTextContents();
  assert(families.indexOf('Punk')>families.lastIndexOf('Hip-Hop'));
  assert(families.indexOf('Punk')<families.indexOf('K-Pop'));
  await page.locator('.colt-radio-search-input').fill('Radio Shadow');
  await page.getByRole('button',{name:'Punk • 90s till Now',exact:true}).click();
  assert.equal(await page.locator('audio').getAttribute('src'),'https://securestreams7.autopo.st/?uri=http://162.244.80.131:8052/stream');
  await page.getByRole('button',{name:'Play Colt Radio',exact:true}).click();
  await page.waitForFunction(()=>{const a=document.querySelector('audio');return a.readyState>=3&&a.currentTime>2&&!a.paused;},null,{timeout:45000});
  console.log('LIVE PLAYBACK',await page.locator('audio').evaluate(a=>({readyState:a.readyState,time:a.currentTime,paused:a.paused})));
  await page.getByRole('button',{name:'Stop Colt Radio',exact:true}).click();
  assert.deepEqual(errors,[]);
  console.log('PASS: station search, exact requested name, HTTPS stream and actual player playback.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
