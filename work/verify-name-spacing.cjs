const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const {chromium} = require('playwright');
const styles = require('../profile-name-styles');
const root = path.resolve(__dirname, '..');
(async () => {
  const browser = await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    const page = await browser.newPage({viewport:{width:900,height:900}});
    await page.setContent('<body><main></main></body>');
    for (const file of ['styles.css','profile-name-styles.css']) await page.addStyleTag({path:path.join(root,file)});
    for (const theme of ['night','light']) for (const width of [140,250,500]) for (const name of ['Mr. Nieves','Alexandria Montgomery-Washington']) {
      await page.evaluate(theme=>document.body.dataset.theme=theme,theme);
      for (const [id] of styles.choices) {
        await page.locator('main').evaluate((el,{html,width})=>{
          el.innerHTML=`<div class="forum-profile-copy" style="width:${width}px"><h3>Make it yours</h3>${html}<p>Choose a school-appropriate JPG, PNG, or WebP image.</p></div>`;
        },{html:styles.render(name,id),width});
        if (id === 'none') continue;
        const gap = await page.evaluate(()=>{
          const el=document.querySelector('.styled-name'),wrap=document.querySelector('.styled-name-wrap');
          const r=el.getBoundingClientRect(),w=wrap.getBoundingClientRect();
          return {above:r.top-wrap.previousElementSibling.getBoundingClientRect().bottom,below:wrap.nextElementSibling.getBoundingClientRect().top-r.bottom,left:r.left-w.left,right:w.right-r.right};
        });
        assert(gap.above>=4 && gap.below>=4,`${id} ${width} ${name}: ${JSON.stringify(gap)}`);
        await page.locator('main').evaluate((el,{html,width})=>{
          el.innerHTML=`<aside class="forum-post-author" style="width:${width}px"><div class="forum-avatar">AR</div>${html}<span>Student</span><small>Grade 6</small></aside>`;
        },{html:styles.render(name,id),width});
        const postGap=await page.evaluate(()=>{
          const el=document.querySelector('.styled-name'),wrap=document.querySelector('.styled-name-wrap');
          return wrap.nextElementSibling.getBoundingClientRect().top-el.getBoundingClientRect().bottom;
        });
        assert(postGap>=4,`Post author ${id} ${width}: ${postGap}`);
      }
    }
    await page.locator('main').evaluate((el,html)=>{el.innerHTML=`<div class="forum-profile-copy" style="width:250px"><span class="feature-kicker">Colt Corner Profile</span><h3>Make it yours</h3>${html}<p>Choose a school-appropriate JPG, PNG, or WebP image. It will be cropped to a square for the forum.</p></div>`;}, styles.render('Mr. Nieves','comic'));
    await page.screenshot({path:path.join(os.tmpdir(),'name-spacing-fixed.png')});
    console.log('PASS: all 18 name styles clear neighboring text, both themes, three widths, short and long names.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
