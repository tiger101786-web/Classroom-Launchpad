const fs=require('fs'),assert=require('assert/strict'),{chromium}=require('playwright');
(async()=>{
 const src=fs.readFileSync('app.js','utf8'),css=fs.readFileSync('styles.css','utf8');
 const author=src.slice(src.indexOf('function renderForumAuthor('),src.indexOf('function renderForumProfileEditor('));
 const handler=src.slice(src.indexOf('  if (action === "threadBackToTop"'),src.indexOf('  if (action === "threadJumpBottom"'));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',headless:true});
 try {
 const page=await browser.newPage();
 for(const width of [1100,390])for(const theme of ['night','light']){
 await page.setViewportSize({width,height:700});
 await page.goto('about:blank');
 await page.setContent(`<style>${css}body{padding:20px;height:auto!important}</style><body data-theme="${theme}"><main id="app"><h1>Colt Corner</h1><div style="height:900px"></div><section id="posts"></section><textarea id="draft">Keep my draft</textarea></main></body>`);
 await page.addScriptTag({content:`window.ProfileBanners={normalize:()=> 'none',cover:()=>''};const renderForumAvatar=()=>'<div class="forum-avatar">A</div>',escapeHtml=x=>x,forumRoleLabel=x=>'Grade '+x;${author}document.getElementById('posts').innerHTML=[1,2].map(n=>'<article class="forum-post">'+renderForumAuthor({studentName:'Example Student',grade:'5'})+'<div class="forum-post-content">Example post</div></article>').join('');document.addEventListener('click',event=>{const action=event.target.dataset.action,screen={name:'thread'},app=document.getElementById('app');${handler}});`});
 assert.equal(await page.locator('.forum-back-to-top').count(),2);
 const button=page.locator('.forum-back-to-top').last();
 await button.scrollIntoViewIfNeeded();
 assert(await page.evaluate(()=>scrollY>0));
 await button.click();
 assert.equal(await page.evaluate(()=>scrollY),0);
 assert.equal(await page.evaluate(()=>document.activeElement.tagName),'H1');
 assert.equal(await page.locator('#draft').inputValue(),'Keep my draft');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 console.log('Back to top: both author areas, desktop/mobile, light/dark, scroll/focus and preserved draft passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
