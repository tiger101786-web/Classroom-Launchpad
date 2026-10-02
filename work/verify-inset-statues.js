const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{chromium}=require('playwright'),shelf=require('../collectible-shelf');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage();
  await page.route('http://art.local/**',r=>r.fulfill({body:fs.readFileSync(path.join(process.cwd(),new URL(r.request().url()).pathname)),contentType:'image/png'}));
  const state={enabled:true,theme:'disney-castle',slots:['pokemon-umbreon-statue','pokemon-charizard-statue','pokemon-gyarados-statue']};
  await page.setContent('<base href="http://art.local/"><style>'+fs.readFileSync('collectible-shelf.css','utf8')+'body{margin:0;background:#171115;color:white;padding:20px}section{width:min(350px,100%);margin:160px auto 0}</style><section>'+shelf.art(state)+'</section>');
  for(const width of [900,390]){
   await page.setViewportSize({width,height:600});
   await page.evaluate(async()=>Promise.all([...document.querySelectorAll('image')].map(el=>new Promise((resolve,reject)=>{const img=new Image();img.onload=resolve;img.onerror=reject;img.src=el.getAttribute('href');}))));
   const result=await page.evaluate(()=>{
    const shelf=document.querySelector('.collectible-shelf').getBoundingClientRect();
    const slots=[...document.querySelectorAll('.shelf-display-slot')];
    return slots.map(el=>{const svg=el.querySelector('.shelf-object'),inner=svg.firstElementChild,r=svg.getBoundingClientRect(),scale=r.width/220;return {left:r.left+Number(inner.getAttribute('x'))*scale,right:r.left+(Number(inner.getAttribute('x'))+Number(inner.getAttribute('width')))*scale,shelfLeft:shelf.left,shelfRight:shelf.right,height:Number(inner.getAttribute('height')),base:Number(inner.getAttribute('y'))+Number(inner.getAttribute('height'))};});
   });
   assert(result[0].left>=result[0].shelfLeft,'Left statue contained');
   assert(result[2].right<=result[2].shelfRight,'Right statue contained');
   assert(result[1].height>400,'Charizard significantly enlarged');
   assert(result.every(r=>Math.abs(r.base-346)<.01),'Bases aligned');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.screenshot({path:'work/inset-statues-'+width+'.png'});
  }
  console.log('Inset outer statues, enlarged Charizard, unchanged baseline and responsive containment passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
