const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),sharp=require('sharp'),shelf=require('../collectible-shelf');
const ids=["dinosaur-dig","wizard-library","candy-kingdom","storm-fortress","stained-glass","clockwork-observatory","bamboo-panda","racing-garage","firefly-bayou","origami-garden"];
(async()=>{
 for(const id of ids){
  const file='assets/collectible-shelf-'+id+'.png',m=await sharp(file).metadata();
  assert(m.hasAlpha,id+' alpha'); assert(Math.abs(m.width/m.height-4/3)<.01,id+' aspect');
  const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert(data[3]===0,id+' transparent corner');
  console.log(id,m.width,m.height);
 }
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1100,height:1800}});
 await page.route('http://art.local/**',r=>r.fulfill({body:fs.readFileSync(path.join(__dirname,'..',new URL(r.request().url()).pathname)),contentType:'image/png'}));
 const css=fs.readFileSync('collectible-shelf.css','utf8');
 const configs=ids.map(theme=>({enabled:true,theme,slots:['muzan','rengoku','mitsuri']}));
 configs.forEach(c=>assert(shelf.valid(c)));
 await page.setContent('<base href="http://art.local/"><style>'+css+'body{background:#241821;color:white;padding:40px;display:grid;grid-template-columns:1fr 1fr;gap:55px 65px}section{width:440px}h3{font:18px sans-serif;margin:0 0 10px}</style>'+configs.map(c=>'<section><h3>'+shelf.themes.find(t=>t.id===c.theme).name+'</h3>'+shelf.art(c)+'</section>').join(''));
 await page.waitForTimeout(1000);
 await page.screenshot({path:'work/ten-shelves-preview.png',fullPage:true});
 console.log('Ten shelf assets validate and render.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

