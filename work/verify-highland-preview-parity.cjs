const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const screenshots=fs.mkdtempSync(path.join(os.tmpdir(),'highland-parity-'));
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1400,height:1100}});
  await page.goto(pathToFileURL(path.resolve('work/highland-cow-preview/accessories.html')).href);
  await page.waitForFunction(()=>window.highlandAccessories&&window.highlandTest?.ready);
  await page.evaluate(()=>{highlandTest.state.motion=false;highlandTest.state.idle=false;highlandAccessories.choices.headwear='wreath';highlandAccessories.choices.scarf=true;highlandAccessories.update()});
  await page.waitForTimeout(100);
  await page.evaluate(async()=>{const image=new Image();image.src='heather-wreath-v3.png';await image.decode()});
  await page.evaluate(()=>{window.previewFrame=window.highlandAccessoryFrame;window.highlandAccessoryFrame=null});
  const source=fs.readFileSync('highland-pet/accessories.js','utf8').replaceAll('highland-pet/heather-wreath-v3.png','heather-wreath-v3.png');
  await page.addScriptTag({content:source});
  for(const size of [200,320]){
   await page.locator('.pet').evaluate((e,size)=>e.style.width=size+'px',size);
   for(const breath of [-1,-.55,0,.35,1]){
    const pose={breath,wobble:0,ear:0};
    await page.evaluate(p=>previewFrame(p),pose);
    await page.locator('.pet').screenshot({path:path.join(screenshots,`reference-${size}-${breath}.png`)});
    await page.evaluate(async p=>{
     window.previewLayer=document.querySelector('#cow-accessories');previewLayer.remove();
     window.liveAccessories=await createHighlandAccessories(document.body);
     liveAccessories.update({headwear:'wreath',neckwear:'scarf'});liveAccessories.frame(p);
    },pose);
    await page.waitForTimeout(150);
    await page.locator('.pet').screenshot({path:path.join(screenshots,`live-${size}-${breath}.png`)});
    // Verify identical source and fractional transforms, rather than PNG byte
    // equality (Chrome may resample cached raster images after reattachment).
    const matching=await page.evaluate(()=>['scarf','wreath'].every(id=>{
     const before=previewLayer.querySelector(`[data-ha=${id}]`).cloneNode(true);
     const after=document.querySelector(`#cow-accessories [data-ha=${id}]`).cloneNode(true);
     after.removeAttribute('data-highland-wearable');
     after.querySelectorAll('*').forEach(n=>{for(const a of [...n.attributes])if(a.value.includes('url(#'))n.setAttribute(a.name,a.value.replace(/url\(#ha-[0-9a-f-]{36}-/g,'url(#'))});
     return before.outerHTML===after.outerHTML;
    }));
    assert(matching,`Preview artwork/transform mismatch at width ${size}, breath ${breath}`);
    await page.evaluate(()=>{document.querySelector('#cow-accessories').remove();document.querySelector('.cow').append(previewLayer)});
   }
  }
  console.log('PASS: live scarf/wreath artwork and fractional transforms match preview at 10 breathing/size samples.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
