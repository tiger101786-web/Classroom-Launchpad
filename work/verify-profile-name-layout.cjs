const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const {chromium} = require('playwright');
const styles = require('../profile-name-styles');
const root = path.resolve(__dirname, '..');
(async () => {
  const browser = await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    const page = await browser.newPage();
    await page.setContent('<body><main></main></body>');
    for (const file of ['styles.css','profile-name-styles.css']) await page.addStyleTag({path:path.join(root,file)});
    for (const width of [390,870,965,1200]) {
      await page.setViewportSize({width,height:900});
      for (const theme of ['night','light']) for (const compact of [false,true]) for (const [id] of styles.choices) {
        await page.evaluate(({theme,compact,html})=>{
          document.body.dataset.theme=theme;
          document.querySelector('main').innerHTML=`<section class="forum-profile-editor ${compact?'is-compact':''}"><div class="forum-profile-preview">Avatar</div><div class="forum-profile-copy"><span class="feature-kicker">Colt Corner Profile</span><h3>Make it yours</h3>${html}<p>Choose a school-appropriate JPG, PNG, or WebP image. It will be cropped to a square for the forum.</p></div><div class="forum-profile-actions"><button class="outline-btn">Change banner</button><button class="outline-btn">Name style</button><button class="primary-btn">Change Picture</button><button class="outline-btn">Remove</button></div></section>`;
        },{theme,compact,html:styles.render('Mr. Nieves Test Student Alexandria Montgomery-Washington',id)});
        const result=await page.evaluate(()=>{
          const copy=document.querySelector('.forum-profile-copy');
          const name=copy.querySelector('strong').getBoundingClientRect();
          const rect=copy.getBoundingClientRect();
          const actions=document.querySelector('.forum-profile-actions').getBoundingClientRect();
          return {gap:actions.top-rect.bottom,nameBottom:name.bottom,actionsTop:actions.top,right:name.right,width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth};
        });
        assert(result.gap>=15 && result.nameBottom<result.actionsTop,`${width}/${theme}/${compact}/${id}: ${JSON.stringify(result)}`);
        assert(!result.overflow && result.right<=width,`Horizontal overflow: ${id} ${width}`);
      }
    }
    await page.setViewportSize({width:870,height:650});
    await page.evaluate(html=>{document.body.dataset.theme='night';document.querySelector('.forum-profile-copy .styled-name-wrap').outerHTML=html;},styles.render('Mr. Nieves Test Student','notebook'));
    await page.screenshot({path:path.join(os.tmpdir(),'student-profile-layout-fixed.png')});
    console.log('PASS: original plus all 18 name styles clear profile buttons in compact/full layouts, four screen sizes and both themes.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
