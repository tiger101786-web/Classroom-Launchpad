(function () {
  const choices = [
    ['none','Original','Your usual name style'],
    ['varsity','Varsity','Athletic lettering · stacked outline'],['arcade','Arcade tag','Retro lettering · pixel-style nameplate'],
    ['comic','Comic','Tilted lettering · bold sticker'],['neon','Neon sign','Glowing letters · illuminated underline'],
    ['chrome','Chrome','Metallic lettering · beveled shine'],['notebook','Notebook','Handwritten lettering · lined-paper label'],
    ['jersey','Team jersey','Pinstripes · athletic nameplate'],['graffiti','Graffiti','Slanted lettering · layered paint shadow'],
    ['fantasy','Fantasy crest','Storybook lettering · ornamental plaque'],['space','Space badge','Angled corners · mission-patch lettering'],
    ['patch','Stitched patch','Fabric colors · stitched edging'],['candy','Candy label','Rounded lettering · striped candy shell'],
    ['blueprint','Blueprint','Technical lettering · drafting grid'],['ticket','Admit one','Retro ticket · perforated edges'],
    ['ribbon','Ribbon','Serif lettering · folded ribbon ends'],['typewriter','Typewriter','Typed lettering · vintage paper strip'],
    ['prism','Prism badge','Iridescent plate · layered border'],['sketch','Doodle label','Handwritten lettering · sketchy border']
  ];
  const valid = value => choices.some(([id]) => id === value);
  const normalize = value => valid(value) ? value : 'none';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const render = (name, style) => normalize(style) === 'none' ? `<strong>${escape(name)}</strong>` : `<strong class="styled-name" data-name-style="${normalize(style)}">${escape(name)}</strong>`;
  function open({selected, name, avatar = '', role = '', save, onSave}) {
    document.querySelector('.name-style-dialog')?.remove();
    let draft = normalize(selected), saving = false;
    const dialog = document.createElement('dialog');
    dialog.className = 'launch-scene-dialog name-style-dialog';
    dialog.setAttribute('aria-labelledby','nameStyleTitle');
    dialog.innerHTML = `<div class="launch-scene-dialog-heading"><h2 id="nameStyleTitle">Choose your name style</h2><button type="button" class="outline-btn" data-name-close aria-label="Close name style picker">✕</button></div><p>Your real name stays the same. Choose how it looks in Colt Corner.</p><h3>How others will see it</h3><section class="name-style-post"><aside class="forum-post-author">${avatar}<div id="nameStylePreview">${render(name,draft)}</div><span>${escape(role)}</span></aside><div class="name-style-post-copy"><strong>My favorite part of this week</strong><p>I enjoyed working with my group on our project!</p><small>Example Colt Corner post · name shown at actual post size</small></div></section><h3>Name styles</h3><div class="name-style-choices">${choices.map(([id,title,description])=>`<button type="button" class="name-style-choice" data-name-choice="${id}" aria-pressed="${id===draft}"><span class="name-style-sample">${render(name,id)}</span><b>${title}</b><small>${description}</small></button>`).join('')}</div><p id="nameStyleStatus" role="status" aria-live="polite"></p><div class="launch-scene-dialog-actions"><button type="button" class="outline-btn" data-name-close>Cancel</button><button type="button" class="primary-btn" id="saveNameStyle">Save name style</button></div>`;
    const close = () => {if(saving)return;dialog.close();dialog.remove();document.getElementById('changeNameStyle')?.focus();};
    dialog.querySelectorAll('[data-name-close]').forEach(b=>b.onclick=close);
    dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
    dialog.querySelectorAll('[data-name-choice]').forEach(b=>b.onclick=()=>{
      if(saving)return;
      draft=b.dataset.nameChoice;
      dialog.querySelectorAll('[data-name-choice]').forEach(c=>c.setAttribute('aria-pressed',String(c===b)));
      dialog.querySelector('#nameStylePreview').innerHTML=render(name,draft);
      dialog.querySelector('#nameStyleStatus').textContent=choices.find(([id])=>id===draft)[1]+' selected';
    });
    dialog.querySelector('#saveNameStyle').onclick=async()=>{
      if(saving)return;saving=true;
      dialog.querySelectorAll('button').forEach(b=>b.disabled=true);
      dialog.querySelector('#nameStyleStatus').textContent='Saving your name style…';
      try {const result=await save(draft);saving=false;close();onSave(result);}
      catch(error){saving=false;dialog.querySelectorAll('button').forEach(b=>b.disabled=false);dialog.querySelector('#nameStyleStatus').textContent=error.message||'Could not save. Please try again.';}
    };
    document.body.append(dialog);dialog.showModal();
  }
  const api={choices,valid,normalize,render,open};
  if(typeof module!=='undefined' && module.exports) module.exports=api;
  if(typeof window!=='undefined') window.ProfileNameStyles=api;
})();
