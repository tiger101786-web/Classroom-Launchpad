const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn,execFileSync}=require('node:child_process'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'launchpad-guest-')),origin='http://127.0.0.1:8188';
const before=execFileSync('git',['show','HEAD:my-launchpad.js'],{cwd:root,encoding:'utf8'}).split('\n').find(l=>l.startsWith('function panel(){')).trim();
const after=fs.readFileSync(path.join(root,'my-launchpad.js'),'utf8').split('\n').find(l=>l.startsWith('function panel(){')).trim();
assert.equal(after.replace('if(!account)return guestPanel();',''),before,'Authenticated panel must remain identical');
const server=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,PORT:'8188',DATA_DIR:dir,SESSION_SECRET:'guest-test'},stdio:'pipe'});let browser;
(async()=>{try{
 for(let i=0;i<100;i++){try{if((await fetch(origin+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
 browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin);await page.locator('.ml-guest').waitFor();
 for(const width of [1920,1130,800,390]){
  await page.setViewportSize({width,height:1080});const guest=page.locator('.ml-guest');await guest.screenshot({path:path.join(dir,'guest-'+width+'.png')});
  assert.equal(await guest.locator('[data-ml-dialog],.ml-recent').count(),0);
  assert.equal(await guest.locator('li').count(),3);
  assert(await guest.evaluate(e=>e.scrollWidth<=e.clientWidth+1),'Guest must not overflow');
  if(width===1920)assert((await guest.boundingBox()).height<260,'Desktop welcome should be compact');
 }
 await page.locator('.ml-guest-login').click();await page.locator('#studentLoginEmail').waitFor();assert.deepEqual(errors,[]);
 console.log('PASS: guest desktop/mobile layout, sign-in navigation, unchanged authenticated panel. Screenshots: '+dir);
}finally{await browser?.close();server.kill()}})().catch(e=>{console.error(e);process.exitCode=1});
