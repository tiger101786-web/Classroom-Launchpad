const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawn}=require('node:child_process');
const {chromium}=require('playwright');
const styles=require('../profile-name-styles');
const root=path.resolve(__dirname,'..');
(async()=>{
  assert.equal(styles.choices.length,31);
  assert.equal(styles.choices[0][0],'none');
  const titles=styles.choices.slice(1).map(x=>x[1]);
  assert.deepEqual(titles,[...titles].sort((a,b)=>a.localeCompare(b,'en',{sensitivity:'base'})));
  assert.equal(styles.normalize('invalid'),'none');
  assert(!styles.render('<img src=x onerror=alert(1)>','comic').includes('<img'));
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.setContent('<body data-theme="night"><button id="changeNameStyle">Name style</button></body>');
    for(const file of ['styles.css','launchpad-scenes.css','profile-name-styles.css'])await page.addStyleTag({path:path.join(root,file)});
    await page.addScriptTag({path:path.join(root,'profile-name-styles.js')});
    const selectStyle=async id=>{
      const index=styles.choices.findIndex(([key])=>key===id),target=Math.floor(index/6)+1;
      while(true){const current=Number((await page.locator('[aria-label="Name style pages"] span').textContent()).match(/Page (\d+)/)[1]);if(current===target)break;await page.locator(`[data-name-page="${current<target?1:-1}"]`).click();}
      assert(await page.locator('[data-name-choice]:visible').count()<=6);
      await page.locator(`[data-name-choice="${id}"]`).click();
    };
    for(const width of [390,1000])for(const theme of ['night','light']) {
      await page.setViewportSize({width,height:1000});
      await page.evaluate(t=>document.body.dataset.theme=t,theme);
      await page.evaluate(()=>ProfileNameStyles.open({selected:'comic',name:'Alex Rivera',avatar:'<div class="forum-avatar forum-avatar-initials">AR</div>',role:'6th Grade',save:async id=>{if(window.fail)throw Error('Try again');window.saved=id;return {};},onSave:()=>{}}));
      assert(await page.locator('[data-name-choice="comic"]').isVisible());
      for(const [id] of styles.choices){await selectStyle(id);assert.equal(await page.locator(`[data-name-choice="${id}"]`).getAttribute('aria-pressed'),'true');assert(await page.evaluate(()=>document.querySelector('dialog').scrollWidth<=document.querySelector('dialog').clientWidth+1));}
      await selectStyle('fantasy');
      await page.locator('[data-name-page="1"]').click();
      assert.equal(await page.locator('[data-name-choice="fantasy"]').getAttribute('aria-pressed'),'true');
      await page.locator('[data-name-page="-1"]').click();
      const cardLayout=await page.locator('.name-style-choice:visible').evaluateAll(cards=>cards.map(card=>{
        const box=card.getBoundingClientRect(),title=card.querySelector('b').getBoundingClientRect(),description=card.querySelector('small').getBoundingClientRect();
        return {title:title.top-box.top,description:description.top-box.top,gap:description.top-title.bottom,height:box.height};
      }));
      for(const card of cardLayout){assert(Math.abs(card.title-cardLayout[0].title)<1);assert(Math.abs(card.description-cardLayout[0].description)<1);assert(card.gap>=9);assert(Math.abs(card.height-cardLayout[0].height)<1);}
      await page.locator('dialog').evaluate(el=>el.scrollTop=0);
      await page.screenshot({path:path.join(os.tmpdir(),`name-picker-${theme}-${width}.png`)});
      await page.evaluate(()=>window.fail=true);
      await page.locator('#saveNameStyle').click();
      await page.waitForFunction(()=>document.querySelector('#nameStyleStatus').textContent==='Try again');
      assert.equal(await page.locator('#saveNameStyle').isEnabled(),true);
      await page.evaluate(()=>window.fail=false);await page.locator('#saveNameStyle').click();assert.equal(await page.evaluate(()=>window.saved),'fantasy');
      await page.evaluate(()=>ProfileNameStyles.open({selected:'fantasy',name:'Alexandria Montgomery-Washington',save:async()=>{throw Error('Cancel must not save');},onSave:()=>{}}));
      for(const [id] of styles.choices){await selectStyle(id);assert(await page.evaluate(()=>document.querySelector('dialog').scrollWidth<=document.querySelector('dialog').clientWidth+1));}
      await page.keyboard.press('Escape');assert.equal(await page.locator('dialog').count(),0);
    }
    assert.deepEqual(errors,[]);
  } finally {await browser.close();}
  const dataDir=fs.mkdtempSync(path.join(os.tmpdir(),'name-style-test-')),origin='http://127.0.0.1:8197';
  const server=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,PORT:'8197',DATA_DIR:dataDir,SESSION_SECRET:'name-style-test',TEACHER_PIN:'654321',STUDENT_EMAIL_DOMAIN:'scscolts.org'},stdio:'ignore'});
  try {
    let ready=false;for(let i=0;i<80;i++){try{if((await fetch(origin+'/api/health')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}assert(ready);
    const request=async(url,headers,body,method='POST')=>{const r=await fetch(origin+url,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};};
    const base={Origin:origin,'Content-Type':'application/json'};
    const login=await request('/api/auth/teacher',base,{pin:'654321'});assert.equal(login.status,200);
    const teacher={...base,Cookie:login.cookie};
    assert.equal((await request('/api/profile-name-style',base,{nameStyle:'comic'})).status,401);
    assert.equal((await request('/api/profile-name-style',teacher,{nameStyle:'made-up'})).status,400);
    assert.equal((await request('/api/profile-name-style',{...teacher,Origin:'https://wrong.example'},{nameStyle:'comic'})).status,403);
    const email='style.student@scscolts.org';
    const roster=await request('/api/approved-students/import',teacher,{students:[{email,name:'Style Student',grade:'6'}]},'PUT');assert.equal(roster.status,200);
    const signup=await request('/api/auth/register',base,{email,name:'Style Student',grade:'6',activationCode:roster.data.activationCodes[0].activationCode,password:'StudentPass123!'});assert.equal(signup.status,200);
    const student={...base,Cookie:signup.cookie};
    for(const headers of [teacher,student]) {
      const before=(await request('/api/auth/session',headers,undefined,'GET')).data.session.name;
      for(const [nameStyle] of styles.choices){const r=await request('/api/profile-name-style',headers,{nameStyle,name:'Changed Name'});assert.equal(r.status,200);assert.equal(r.data.session.nameStyle,nameStyle);assert.equal(r.data.session.name,before);}
    }
    await request('/api/profile-name-style',teacher,{nameStyle:'fantasy'});
    const topic=await request('/api/threads',teacher,{title:'Our class project',message:'We enjoyed working together on our class project.',grades:['6']});assert.equal(topic.status,200);
    const thread=topic.data.threads.find(t=>t.title==='Our class project');assert(thread);assert.equal(thread.nameStyle,'fantasy');
    const reply=await request('/api/threads/'+thread.id+'/replies',teacher,{message:'Thank you for your hard work.'});assert.equal(reply.status,200);
    const changed=await request('/api/profile-name-style',teacher,{nameStyle:'comic'});
    const updated=changed.data.threads.find(t=>t.id===thread.id);assert.equal(updated.nameStyle,'comic');assert(updated.replies.length>0);assert.equal(updated.replies[0].nameStyle,'comic');
    await request('/api/profile-name-style',student,{nameStyle:'patch'});
    assert.equal((await request('/api/auth/session',teacher,undefined,'GET')).data.session.nameStyle,'comic');
    assert.equal((await request('/api/auth/session',student,undefined,'GET')).data.session.nameStyle,'patch');
    const disk=JSON.parse(fs.readFileSync(path.join(dataDir,'classroom-launchpad-db.json'),'utf8'));
    assert.equal(disk.teacherNameStyle,'comic');assert.equal(disk.approvedStudents.find(s=>s.email===email).nameStyle,'patch');
    await request('/api/profile-name-style',student,{nameStyle:'none'});
    assert.equal((await request('/api/auth/session',student,undefined,'GET')).data.session.nameStyle,'none');
    console.log('PASS: 30 styles plus Original, alphabetical order, six-card pages, saved-selection page, draft retention, desktop/mobile, both themes, long names, retry/cancel and student/teacher persistence.');
  } finally {server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
