const fs=require('fs'),assert=require('assert/strict'),{chromium}=require('playwright');
(async()=>{
 const src=fs.readFileSync('app.js','utf8');
 const renderCode=src.slice(src.indexOf('function formatDirectMessageTime('),src.indexOf('function renderApprovedStudentManager('));
 const forms=src.slice(src.indexOf('  const directMessageForm = document.getElementById'),src.indexOf('  const passSearch = document.getElementById'));
 const actions=src.slice(src.indexOf('  if (action === "messageGrade")'),src.indexOf('  if (action === "teacherDashboard")'));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 const page=await browser.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setContent('<style>'+fs.readFileSync('styles.css','utf8').replace(/^\uFEFF/,'')+'html{background:#241821}body{height:auto!important;padding:20px;margin:auto;max-width:1150px}#test{min-width:0}</style><body data-theme="night"><main id="test"></main></body>');
 await page.addScriptTag({content:`
 let teacherMessageSearch='',teacherMessageGrade='all',teacherMessageHistoryFilter='messaged',teacherMessagePage=0,selectedMessageStudentEmail='',directMessageStatus='';
 const teacherMessageDrafts=new Map();
 const isTeacher=()=>true,formatStudentFirstLast=x=>x,studentGradeNumber=s=>String(s.grade),forumInitials=x=>x.slice(0,2),escapeHtml=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const approvedStudents=Array.from({length:24},(_,i)=>({email:'student'+i+'@school.test',name:'Student '+String(i).padStart(2,'0'),grade:String(4+i%4)}));
 let directMessages=approvedStudents.slice(0,19).map((s,i)=>({id:'m'+i,studentEmail:s.email,studentName:s.name,senderRole:i%3===0?'teacher':'student',readByTeacher:i>=5,createdAt:new Date(2026,8,27,9,i).toISOString(),message:i===1?'Can you help with my project?':'Project update '+i}));
 const normalizeDirectMessages=x=>x;
 const sharedBackend={sendDirectMessage:async(email,message)=>{if(window.failSend)throw Error('Connection unavailable');directMessages.push({id:'sent',studentEmail:email,studentName:'Student',senderRole:'teacher',readByTeacher:true,message,createdAt:new Date().toISOString()});return {directMessages};}};
 async function markCurrentDirectMessagesRead(email){directMessages=directMessages.map(m=>m.studentEmail===email?{...m,readByTeacher:true}:m);}
 sharedBackend.request=async(url,opts)=>{if(window.failResolve)throw Error("Could not update");const body=JSON.parse(opts.body);directMessages=directMessages.map(m=>m.id===body.messageId?{...m,noReplyNeeded:body.noReplyNeeded}:m);return {directMessages};};
 ${renderCode}
 function render(){document.getElementById('test').innerHTML=renderDashboardMessages();${forms}}
 document.addEventListener('click',async event=>{const target=event.target.closest('[data-action]');if(!target||target.disabled)return;const action=target.dataset.action;${actions}});
 render();
 `});
 for(const width of [1200,390]){
  await page.setViewportSize({width,height:950});
  await page.evaluate(()=>{teacherMessageHistoryFilter='messaged';teacherMessageGrade='all';teacherMessageSearch='';teacherMessagePage=0;selectedMessageStudentEmail='';render();});
  assert.equal(await page.locator('.inbox-row').count(),8);
  assert.equal(await page.locator('.inbox-row').first().getAttribute('data-email'),'student4@school.test');
  await page.locator('[data-action="messagePage"][data-page="1"]').click();assert.match(await page.locator('.inbox-pagination').innerText(),/Page 2 of 3/);
  await page.locator('[data-filter="unread"]').click();assert.equal(await page.locator('.inbox-row').count(),3);
  await page.locator('.inbox-row').first().click();
  assert.equal(await page.locator('.teacher-message-heading h3').innerText(),'Student 04');
  assert.equal(await page.locator('.inbox-row').count(),2); // read conversation stays open, leaves unread list
  await page.locator('#directMessageText').fill('My unfinished reply <keep>');
  await page.evaluate(()=>window.failResolve=true);
  await page.locator('[data-action="messageReplyStatus"]').click();
  assert.match(await page.locator('#directMessageStatus').innerText(),/Could not update/);
  assert.equal(await page.locator('[data-action="messageReplyStatus"]').innerText(),'No reply needed');
  await page.evaluate(()=>window.failResolve=false);
  await page.locator('[data-action="messageReplyStatus"]').click();
  assert.equal(await page.locator('.inbox-thread-tools > span').innerText(),'No reply needed');
  assert.equal(await page.locator('#directMessageText').inputValue(),'My unfinished reply <keep>');
  await page.evaluate(()=>render());
  assert.equal(await page.locator('[data-action="messageReplyStatus"]').innerText(),'Mark as needs reply');
  await page.locator('[data-action="messageReplyStatus"]').click();
  assert.equal(await page.locator('.inbox-thread-tools > span').innerText(),'Needs reply');
  await page.locator('[data-filter="all"]').click();
  assert.equal(await page.locator('#directMessageText').inputValue(),'My unfinished reply <keep>');
  await page.locator('#teacherMessageSearch').fill('Student 22');assert.equal(await page.locator('.inbox-row').count(),1);
  await page.locator('.inbox-row').click();assert.equal(await page.locator('#directMessageText').inputValue(),'');
  await page.locator('#teacherMessageSearch').fill('Student 04');await page.locator('.inbox-row').click();
  assert.equal(await page.locator('#directMessageText').inputValue(),'My unfinished reply <keep>');
  await page.evaluate(()=>window.failSend=true);await page.locator('#directMessageForm button[type="submit"]').click();
  assert.match(await page.locator('#directMessageStatus').innerText(),/Connection unavailable/);assert.equal(await page.locator('#directMessageText').inputValue(),'My unfinished reply <keep>');
  await page.evaluate(()=>window.failSend=false);await page.locator('#directMessageForm button[type="submit"]').click();
  assert.equal(await page.locator('#directMessageText').inputValue(),'');
  await page.locator('#teacherMessageSearch').fill('');await page.locator('[data-filter="needs-reply"]').click();
  assert.equal(await page.locator('.inbox-row[data-email="student4@school.test"]').count(),0);
  await page.locator('#teacherMessageGrade').selectOption('7');
  assert(await page.locator('.inbox-row-meta').evaluateAll(ns=>ns.every(n=>n.textContent.includes('Grade 7'))));
  await page.locator('#teacherMessageSearch').fill('nothing matches');assert.equal(await page.locator('.inbox-row').count(),0);
  await page.evaluate(()=>{teacherMessageSearch='';teacherMessageGrade='all';teacherMessageHistoryFilter='messaged';teacherMessagePage=0;render();});
  for(const theme of ['night','light']){await page.locator('body').evaluate((el,t)=>el.dataset.theme=t,theme);await page.screenshot({path:'work/teacher-inbox-'+width+'-'+theme+'.png',fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  // Restore the synthetic unread state for the next viewport.
  await page.evaluate(()=>{directMessages=directMessages.filter(m=>m.id!=='sent').map((m,i)=>({...m,readByTeacher:i>=5}));});
 }
 assert.deepEqual(errors,[]);
 console.log('Inbox passed: unread/newest ordering, 8-per-page, read transition, selected-thread stability, search/grade filters, draft preservation, failed/successful send, mobile and light/dark render.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
