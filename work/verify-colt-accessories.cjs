const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:1200,height:900}});
 await page.goto('file:///'+path.join(__dirname,'colt-skins-preview.html').replaceAll('\\','/'));
 for(const skin of ['Original','Porcelain','Obsidian Ember'])for(const [headwear,neckwear] of [['horn','bowtie'],['sleepcap','scarf']]){
  const prefs={skin,headwear,neckwear,eyewear:'sunglasses',motion:false};
  await page.evaluate(p=>api.update({account:'preview',visible:true,radio:false,preferences:{...roboColtDefaults(),...p}}),prefs);
  for(const id of [headwear,neckwear,'sunglasses'])assert.equal(await page.locator('#rc-head #rc-accessory-'+id).evaluate(e=>getComputedStyle(e).display),'inline');
  assert.equal(await page.locator('[id^="rc-accessory-"][filter]').count(),0);
  await page.locator('.pet-button').screenshot({path:path.join(__dirname,'colt-accessories-'+skin.replaceAll(' ','-')+'-'+headwear+'.png')});
  await page.evaluate(p=>api.update({account:'preview',visible:true,radio:true,preferences:{...roboColtDefaults(),...p,motion:true}}),prefs);
  assert.equal(await page.locator('#rc-accessory-'+headwear).evaluate(e=>getComputedStyle(e).display),'none');
  await page.evaluate(p=>api.update({account:'preview',visible:true,radio:false,preferences:{...roboColtDefaults(),...p}}),prefs);
  assert.equal(await page.locator('#rc-accessory-'+headwear).evaluate(e=>getComputedStyle(e).display),'inline');
 }
 assert.equal(await page.locator('.mouth-sleep').getAttribute('rx'),'10');assert.equal(await page.locator('.mouth-sleep').getAttribute('ry'),'13');
 console.log('PASS: all five accessories on original/custom skins, head attachment, radio override/restoration, enlarged sleep mouth.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
