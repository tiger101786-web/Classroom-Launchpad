const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const origin='http://127.0.0.1:8221',output=process.env.PREVIEW_OUTPUT||fs.mkdtempSync(path.join(os.tmpdir(),'studio-labels-'));
const server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:'8221',DATA_DIR:fs.mkdtempSync(path.join(os.tmpdir(),'studio-label-data-')),SESSION_SECRET:'studio-label-test',TEACHER_PIN:'654321'},stdio:'ignore'});let browser;
(async()=>{try{
 for(let i=0;i<100;i++){try{if((await fetch(origin+'/api/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});const context=await browser.newContext({viewport:{width:1440,height:1000}});
 assert.equal((await context.request.post(origin+'/api/auth/teacher',{headers:{Origin:origin},data:{pin:'654321'}})).status(),200);const page=await context.newPage();await page.goto(origin);
 await page.locator('.header-account-summary').first().click();await page.locator('.header-account-menu [data-companion-open]').first().click();const studio=page.locator('.pet-studio');await studio.waitFor({state:'visible'});await studio.locator('#pet-select').selectOption('nugget');
 const theme=studio.getByLabel('Studio theme',{exact:true});await theme.selectOption('diner');
 for(const width of [1440,1000,800,390,320]){
  await page.setViewportSize({width,height:1000});
  for(const name of ['Honey Mustard','Bacon Cheddar','Teriyaki Sesame']){
   const card=studio.locator('[data-skin-choice="'+name+'"]');await card.scrollIntoViewIfNeeded();
   const label=await card.locator('.skin-name').evaluate(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return {text:e.textContent,height:e.clientHeight,scroll:e.scrollHeight,width:e.clientWidth,scrollWidth:e.scrollWidth,paddingTop:s.paddingTop,paddingBottom:s.paddingBottom,line:s.lineHeight,font:s.fontSize,box:r.toJSON()};});
   assert(label.scroll<=label.height+1&&label.scrollWidth<=label.width+1,'Full '+name+' label fits at '+width+': '+JSON.stringify(label));
  }
  if(width===1000||width===800){await studio.locator('[data-skin-choice="Honey Mustard"]').scrollIntoViewIfNeeded();await studio.screenshot({path:path.join(output,'diner-skin-labels-'+width+'.png')});}
 }
 await page.setViewportSize({width:1440,height:1000});await theme.selectOption('neon');const select=theme;
 for(const state of ['rest','hover','focus']){
  if(state==='hover')await select.hover();if(state==='focus')await select.focus();
  const palette=await select.evaluate(e=>{const s=getComputedStyle(e),o=getComputedStyle(e.options[0]);return {text:s.color,fill:s.webkitTextFillColor,background:s.backgroundColor,scheme:s.colorScheme,optionText:o.color,optionFill:o.webkitTextFillColor,optionBackground:o.backgroundColor};});
  assert.deepEqual(palette,{text:'rgb(8, 19, 44)',fill:'rgb(8, 19, 44)',background:'rgb(205, 227, 255)',scheme:'light',optionText:'rgb(8, 19, 44)',optionFill:'rgb(8, 19, 44)',optionBackground:'rgb(205, 227, 255)'},'Readable Neon theme menu '+state);
 }
 await studio.screenshot({path:path.join(output,'neon-theme-select-contrast.png')});console.log('PASS: all three long Diner labels fit at five sizes; Neon Studio theme select and native options keep contrasting colors at rest, hover and focus.');
}finally{await browser?.close();server.kill();}})().catch(e=>{console.error(e);process.exitCode=1;});
