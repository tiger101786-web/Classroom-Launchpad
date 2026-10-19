const {chromium}=require('playwright');
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
(async()=>{
 const out=process.argv[2];assert(out);fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file:///'+path.join(__dirname,'colt-skins-preview.html').replaceAll('\\','/'));
  // Load production nameplate before constructing a fresh renderer.
  await page.addScriptTag({url:'file:///'+path.join(__dirname,'../robo-colt/nameplate.js').replaceAll('\\','/')});
  await page.evaluate(()=>{document.querySelector('.robo-companion').remove();window.namedColt=createRoboColt(()=>{});});
  await page.addStyleTag({content:'.robo-companion .pet-button{width:440px!important;height:560px!important}'});
  const skins=await page.evaluate(()=>Object.keys(roboColtSkins));
  for(const skin of skins){
   await page.evaluate(skin=>namedColt.update({account:'test',visible:true,radio:false,preferences:{...roboColtDefaults(),skin,name:'EMBER',motion:false}}),skin);
   await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(80);
   assert.equal(await page.locator('#rc-nameplate').count(),1);
   const actual=await page.locator('#rc-nameplate image').getAttribute('filter'),expected=await page.locator('#rc-platform > image').getAttribute('filter');
   assert.equal(actual,expected||'url(#rc-name-enamel)');
   await page.locator('.pet-button').screenshot({path:path.join(out,skin+'.png')});
  }
  await page.evaluate(()=>namedColt.update({account:'test',visible:true,radio:true,preferences:{...roboColtDefaults(),name:'Thunderbolt Colt'}}));
  assert(await page.locator('#rc-nameplate text').evaluate(e=>e.getBBox().width<=500));
  assert.equal(await page.locator('#rc-platform').evaluate(e=>e.getAnimations({subtree:true}).length),0);
  assert.equal(await page.locator('#rc-platform').evaluate(e=>e.firstElementChild.id),'rc-nameplate');
  assert.deepEqual(errors,[]);console.log('PASS: all 18 skin finishes, bundled font, long names, diamond layering, static plate while dancing.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
