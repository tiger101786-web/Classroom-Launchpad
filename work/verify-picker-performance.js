const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{execFileSync}=require('child_process'),{chromium}=require('playwright');
(async()=>{
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
try{
const results=[];
for(const version of ['before','after']){
 const page=await browser.newPage({viewport:{width:1200,height:900}}),requested=new Set();
 await page.route('http://art.local/**',r=>{const p=new URL(r.request().url()).pathname.slice(1);if(!p.endsWith('.png')||!fs.existsSync(p))return r.fulfill({status:404,body:''});requested.add(p);return r.fulfill({body:fs.readFileSync(p),contentType:'image/png'});});
 await page.setContent('<base href="http://art.local/"><style>'+fs.readFileSync('styles.css','utf8').replace(/^\uFEFF/,'')+fs.readFileSync('launchpad-scenes.css','utf8')+'</style><body></body>');
 const source=version==='before'?execFileSync('git',['show','HEAD:launchpad-scenes.js'],{encoding:'utf8'}):fs.readFileSync('launchpad-scenes.js','utf8');
 await page.addScriptTag({content:source});
 await page.evaluate(()=>{const s={authenticated:true,homeScene:{id:'original',frame:'none',motion:false}};document.body.innerHTML=LaunchpadScenes.render(s,'');LaunchpadScenes.attach(s,'',()=>{});document.getElementById('chooseLaunchFrame').click();});
 await page.waitForTimeout(700);
 const entry={version,images:requested.size,bytes:[...requested].reduce((sum,p)=>sum+fs.statSync(p).size,0)};results.push(entry);
 if(version==='after'){
 assert.equal(await page.locator('.launch-scene-options > button[hidden] img[src]').count(),0);
 await page.locator('.launch-scene-options > button:not([hidden]) img[src]').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));
 await page.locator('[data-chooser-page="1"]').click();
 await page.locator('.launch-scene-options > button:not([hidden]) img[src]').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));
 assert.equal(await page.locator('.launch-scene-options > button:not([hidden]) img[data-chooser-src]').count(),0);
 }
 await page.close();
}
assert(results[1].images<results[0].images);assert(results[1].bytes<results[0].bytes);console.log(JSON.stringify(results));
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
