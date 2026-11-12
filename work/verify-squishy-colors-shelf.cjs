const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const shelf=require('../collectible-shelf');
const root=path.resolve(__dirname,'..'),origin='http://127.0.0.1:8193';
const output=process.env.PREVIEW_OUTPUT||fs.mkdtempSync(path.join(os.tmpdir(),'squishy-colors-'));
const ids=["squishy-aqua-waves","squishy-peach-hearts","squishy-cherry-dots","squishy-tangerine-swirl"];
const server=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,PORT:'8193',DATA_DIR:fs.mkdtempSync(path.join(os.tmpdir(),'squishy-shelf-test-')),SESSION_SECRET:'shelf-test',TEACHER_PIN:'654321'},stdio:'ignore'});
let browser;
(async()=>{try{
 fs.mkdirSync(output,{recursive:true});
 for(let i=0;i<100;i++){try{if((await fetch(origin+'/api/health')).ok)break}catch{}await new Promise(r=>setTimeout(r,100));}
 for(const id of ids){assert.equal(shelf.items.find(item=>item.id===id).category,'Squishy Toys');assert(shelf.valid({enabled:true,theme:'squishy-dumplings',slots:[id,'none','none']}));assert.equal(shelf.clean({enabled:true,slots:[id,'none','none']}).slots[0],id);}
 browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 const context=await browser.newContext();
 const login=await context.request.post(origin+'/api/auth/teacher',{headers:{Origin:origin},data:{pin:'654321'}});assert.equal(login.status(),200);
 for(const side of ['left','right'])for(const id of ids){const slots=[id,id,id];const saved=await context.request.post(origin+'/api/home-shelf',{headers:{Origin:origin},data:{enabled:true,theme:'squishy-dumplings',slots,side}});assert.equal(saved.status(),200);assert.deepEqual((await saved.json()).session[side==='right'?'homeShelfRight':'homeShelf'].slots,slots);}
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route(origin+'/shelf-preview',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body></body>'}));
 await page.goto(origin+'/shelf-preview');
 for(const file of ['styles.css','collectible-shelf.css'])await page.addStyleTag({url:origin+'/'+file});
 await page.addScriptTag({url:origin+'/collectible-shelf.js'});
 await page.evaluate(ids=>{document.body.style.cssText='margin:0;background:#201821;color:#fff;font-family:system-ui;padding:120px 20px 30px';document.body.innerHTML='<main style="max-width:920px;margin:auto;display:grid;gap:100px">'+[['squishy-gold',...ids.slice(0,2)],[...ids.slice(2),'squishy-gold']].map(slots=>'<section style="max-width:760px;width:100%;margin:auto">'+CollectibleShelf.art({enabled:true,theme:'crimson',slots},true)+'</section>').join('')+'</main>';},ids);
 for(const width of [1100,390]){
  await page.setViewportSize({width,height:900});await page.locator('img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
  const all=await page.locator('.shelf-direct-image > div').evaluateAll(elements=>elements.map(e=>{const r=e.getBoundingClientRect(),slot=e.closest('[data-shelf-slot]').getBoundingClientRect();return {bottom:e.style.bottom,percentWidth:parseFloat(e.style.width),left:r.left,right:r.right,slotLeft:slot.left,slotRight:slot.right,img:e.querySelector('img').getAttribute('src')};}));
  assert.equal(all.length,6);assert(all.every(e=>e.bottom===all[0].bottom&&Math.abs(e.percentWidth-all[0].percentWidth)<.001),'New dumplings share the existing basket width and ledge baseline');
  assert(all.every(e=>e.left>=e.slotLeft-1&&e.right<=e.slotRight+1),'Full basket stays inside its shelf spot');
  assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),'No mobile horizontal overflow');
  await page.screenshot({path:path.join(output,'squishy-colors-'+width+'.png'),fullPage:true});
 }
 await page.setViewportSize({width:1100,height:700});
 await page.evaluate(({ids,assets})=>{
  const artwork=id=>{const a=assets[id],[x,y,w,h]=a.bounds;return '<div style="position:relative;width:100%;aspect-ratio:'+w+'/'+h+';overflow:hidden"><img style="position:absolute;max-width:none;width:'+a.width/w*100+'%;left:'+(-x/w*100)+'%;top:'+(-y/h*100)+'%" src="assets/shelf-'+id+'.png"></div>'};
  document.body.innerHTML='<main style="max-width:1000px;margin:auto"><h1 style="font-size:25px;margin:0 0 24px;text-align:center;color:#fff3f7;text-shadow:none">New Patterned Squishy Dumplings</h1><div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px">'+ids.map((id,i)=>'<figure style="margin:0;padding:12px;background:#ffffff08;border:1px solid #ffffff20;border-radius:18px">'+artwork(id)+'<figcaption style="text-align:center;padding:12px 0;color:#fff">'+['Aqua Waves','Peach Hearts','Cherry Dots','Tangerine Swirl'][i]+'</figcaption></figure>').join('')+'</div></main>';
  document.body.style.padding='28px';
 },{ids,assets:JSON.parse(fs.readFileSync(path.join(__dirname,'squishy-colors-assets.json'),'utf8'))});
 await page.locator('img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
 await page.locator('main').screenshot({path:path.join(output,'squishy-colors-preview.png')});
 await page.setViewportSize({width:1100,height:900});
 await page.evaluate(()=>CollectibleShelf.open({selected:{enabled:true,theme:'crimson',slots:['none','none','none']},save:async draft=>{window.savedDumplings=draft}}));
 await page.locator('#shelfCategory').selectOption({label:'Squishy Toys'});
 for(let i=0;i<ids.length;i++){
  await page.locator('#shelfSearch').fill(['Aqua','Peach Hearts','Cherry Red','Tangerine'][i]);
  await page.locator('[data-shelf-item="'+ids[i]+'"]').click();assert.equal((await page.locator('#shelfPreview img').getAttribute('src')).split('?')[0],'assets/shelf-'+ids[i]+'.png');
 }
 await page.locator('#saveShelf').click();await page.waitForFunction(()=>window.savedDumplings?.slots[0]==='squishy-tangerine-swirl');
 assert.deepEqual(errors,[]);console.log('PASS: four new colors, existing dumpling basket width/baseline, complete desktop/mobile cutouts, picker search/selection/save, and authenticated left/right shelf persistence. Previews: '+output);
}finally{await browser?.close();server.kill();}})().catch(error=>{console.error(error);process.exitCode=1;});
