const fs = require('fs'), assert = require('assert/strict'), { chromium } = require('playwright');
(async () => {
  const src = fs.readFileSync('app.js', 'utf8');
  const table = src.slice(src.indexOf('function renderThreadTable('), src.indexOf('function renderThreadRow('));
  const paging = src.slice(src.indexOf('function threadReplyPageData('), src.indexOf('function renderThreadDetail('));
  const topicHandler = src.slice(src.indexOf('  if (action === "coltCornerTopicPage")'), src.indexOf('  if (action === "gradebookGrade")'));
  const replyHandler = src.slice(src.indexOf('  if (action === "threadReplyPage")'), src.indexOf('  if (action === "openThread")'));
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage();
    for (const width of [1100, 390, 320]) for (const theme of ['light', 'night']) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('about:blank');
      await page.setContent(`<style>${fs.readFileSync('styles.css', 'utf8')}</style><body data-theme="${theme}"><main class="app-shell" id="app"></main></body>`);
      await page.addScriptTag({ content: `
        let coltCornerTopicPage=1;const COLT_CORNER_TOPICS_PER_PAGE=15,THREAD_REPLIES_PER_PAGE=15,threadReplyPages=new Map();
        const threads=Array.from({length:150},(_,id)=>({id})),visibleColtCornerThreads=()=>threads,renderThreadRow=()=>'',emptyCard=x=>x;
        const getThreadReplies=t=>t.replies,renderThreadReply=()=>'',escapeHtml=String,markVisibleColtCornerTopicsSeen=()=>{};
        const classThreads=[{id:'test',grade:'5',replies:Array.from({length:150},(_,id)=>({id}))}],screen={name:'thread',id:'test'};
        ${table}${paging}
        document.getElementById('app').innerHTML=renderThreadTable(threads)+'<div class="thread-navigation-row"><nav class="thread-quick-links">Return · Jump to Bottom</nav><div class="thread-top-pages"></div></div><section class="thread-reply-list"></section><textarea id="replyMessage">Keep my draft</textarea>';
        document.querySelector('.thread-reply-list').innerHTML=renderThreadReplyList(classThreads[0]);refreshThreadReplyTopPager(classThreads[0]);
        document.getElementById('app').addEventListener('click',event=>{const target=event.target.closest('[data-action]');if(!target)return;const action=target.dataset.action;${topicHandler}${replyHandler}});
      ` });
      for (const label of ['Topic pages top', 'Topic pages bottom', 'Reply pages top', 'Reply pages bottom']) {
        for (const [number, corner] of [[2, 'top'], [3, 'bottom']]) {
          const button = page.locator(`nav[aria-label="${label}"] button[aria-label="Page ${number}"]`);
          await button.scrollIntoViewIfNeeded();
          const hit = await button.evaluate((e, corner) => {
            const r=e.getBoundingClientRect(),x=r.left+2,y=corner==='top'?r.top+2:r.bottom-2;
            return {width:r.width,height:r.height,hit:document.elementFromPoint(x,y)===e,x,y,font:getComputedStyle(e).fontSize};
          }, corner);
          assert(hit.width>=44 && hit.height>=44, JSON.stringify(hit));
          assert(hit.hit, `${label}: corner blocked`);assert.equal(hit.font,'12px');
          await page.mouse.click(hit.x,hit.y);
          assert.equal(await page.locator(`nav[aria-label="${label}"] [aria-current="page"]`).innerText(),String(number));
        }
      }
      assert.equal(await page.locator('#replyMessage').inputValue(),'Keep my draft');
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), `Overflow at ${width}`);
      const focus=page.locator('nav[aria-label="Topic pages top"] button[aria-label="Page 2"]');
      await focus.focus();await page.keyboard.press('Enter');
      assert.equal(await page.locator('nav[aria-label="Topic pages top"] [aria-current]').innerText(),'2');
    }
    console.log('Passed: 44px targets, clicks at expanded edges, top/bottom topic and reply paging, keyboard, draft preservation, light/dark and 320/390/1100px layouts.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
