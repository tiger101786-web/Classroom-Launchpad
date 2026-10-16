const assert=require('node:assert/strict');
const path=require('node:path');
const os=require('node:os');
const {chromium}=require('playwright');
const sharp=require('sharp');
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    const page=await browser.newPage({viewport:{width:1000,height:600}});
    await page.setContent('<body><main></main></body>');
    await page.addStyleTag({path:path.resolve(__dirname,'../styles.css')});
    await page.addScriptTag({path:path.resolve(__dirname,'../profile-banners.js')});
    for(const theme of ['night','light']) for(const [width,height] of [[180,90],[235,277],[832,277]]) {
      await page.evaluate(({theme,width,height})=>{
        document.body.dataset.theme=theme;
        const c=document.createElement('canvas');c.width=1200;c.height=400;
        const x=c.getContext('2d');x.fillStyle='#202124';x.fillRect(0,0,480,400);
        x.fillStyle='#143ac4';x.fillRect(480,0,720,400);
        document.querySelector('main').innerHTML=`<div class="profile-banner-cover profile-banner-custom" data-custom-layout="half" style="width:${width}px;height:${height}px;border-radius:0"><img src="${c.toDataURL()}" alt="Test"></div>`;
      },{theme,width,height});
      const banner=page.locator('.profile-banner-custom');
      await banner.locator('img').evaluate(i=>i.decode());
      await page.waitForFunction(()=>document.querySelector('.profile-banner-custom').style.getPropertyValue('--banner-accent')==='20,58,196');
      const png=await banner.screenshot({path:path.join(os.tmpdir(),`banner-fade-${theme}-${width}.png`)});
      const {data,info}=await sharp(png).removeAlpha().raw().toBuffer({resolveWithObject:true});
      const pixel=x=>Array.from(data.slice((Math.floor(height/2)*width+x)*info.channels,(Math.floor(height/2)*width+x)*info.channels+3));
      await banner.locator('img').evaluate(i=>i.style.visibility='hidden');
      const backgroundPng=await banner.screenshot();
      const bg=await sharp(backgroundPng).removeAlpha().raw().toBuffer();
      await banner.locator('img').evaluate(i=>i.style.visibility='');
      for(let x=0;x<Math.floor(width*.42);x++) {
        const offset=(Math.floor(height/2)*width+x)*info.channels;
        assert(pixel(x).every((v,c)=>Math.abs(v-bg[offset+c])<=1),'image edge must remain hidden behind the glow');
      }
      assert(pixel(5)[2]>pixel(5)[0],'the blank side receives an image-matched blue tint');
      let largestJump=0;
      for(let x=1;x<width;x++) for(let channel=0;channel<3;channel++) largestJump=Math.max(largestJump,Math.abs(pixel(x)[channel]-pixel(x-1)[channel]));
      assert(largestJump<=9,`${theme} ${width}: abrupt seam (${largestJump})`);
      assert.deepEqual(pixel(width-1),[20,58,196],'right side remains clear');
    }
    console.log('PASS: automatic image-matched glow and smooth half-banner fade in light/dark at profile and narrow-card sizes; no exposed image boundary.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
