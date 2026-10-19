const {chromium}=require('playwright');
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
(async()=>{
 const out=process.argv[2];assert(out,'Provide a screenshot output directory');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file:///'+path.join(__dirname,'colt-skins-preview.html').replaceAll('\\','/'));
  for(const name of ['headphones','horn','sleepcap','sunglasses','scarf','bowtie']){
   const key=name==='sunglasses'?'eyewear':['scarf','bowtie'].includes(name)?'neckwear':'headwear';
   await page.evaluate(({key,name})=>api.update({account:'preview',visible:true,radio:false,preferences:{...roboColtDefaults(),motion:false,[key]:name}}),{key,name});
   await page.waitForTimeout(200);
   const bounds=await page.locator('.pet-button').boundingBox();
   await page.screenshot({path:path.join(out,name+'.png'),clip:{x:bounds.x,y:bounds.y-32,width:bounds.width,height:bounds.height+32}});
   const id=name==='headphones'?'#rc-headphones':'#rc-accessory-'+name;
   assert.equal(await page.locator(id+' image').first().getAttribute('href'),'robo-colt/accessory-'+name+(['scarf','sleepcap'].includes(name)?'-v3.png':'-v2.png'));
   if(name==='scarf')assert.equal(await page.locator(id).getAttribute('clip-path'),null,'Full scarf must remain visible');
   assert.equal(await page.locator('#rc-audio-rear-band').evaluate(e=>getComputedStyle(e).display),name==='headphones'?'inline':'none');
   assert(await page.locator('#rc-puppet').evaluate(e=>{const order=[...e.children];return ['rc-leg-left','rc-leg-right'].every(id=>order.indexOf(document.getElementById(id))<order.indexOf(document.getElementById('rc-head')))}),'Scarf must hang in front of forelegs');
   assert(await page.locator('#rc-head').evaluate(e=>e.firstElementChild.id==='rc-audio-rear-band'),'Band must render behind ears');
   assert.equal(await page.locator(id).evaluate(e=>getComputedStyle(e).display),'inline');
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: six production artwork layers render directly with no page errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
