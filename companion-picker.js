(() => {
  'use strict';
  const defaults = () => ({pet:'colt', color:'Gold', accessory:'none', motion:true});
  const hiddenScreens = new Set(['pin','login','coltRun','dashboard','edit','changePin']);
  let auth = {}, account = '', epoch = 0, enabled = true, preferences = defaults(), expanded = false;
  let screen = document.body.dataset.screen || 'home', loaded = false, loadError = false, pending = Promise.resolve(), controller;
  const root = document.createElement('section');
  root.className = 'companion-picker'; root.hidden = true; root.setAttribute('aria-label','Pet selection');
  root.innerHTML = '<label>Choose pet <select aria-label="Choose pet"><option value="colt">Colt</option><option value="dumpling">Squishy Dumpling</option></select></label><div class="pet-display"></div><div class="pet-tools"><button class="pet-customize" hidden>Customize dumpling</button><button class="pet-hide" hidden>Hide pet</button></div><p class="pet-status" role="status"></p><button class="pet-retry" hidden>Retry save</button>';
  document.body.append(root);
  const select=root.querySelector('select'), display=root.querySelector('.pet-display'), customize=root.querySelector('.pet-customize'), hide=root.querySelector('.pet-hide'), status=root.querySelector('.pet-status'), retry=root.querySelector('.pet-retry');
  let frame, petHidden = false;
  function sendToFrame() {
    frame?.contentWindow?.postMessage({type:'dumpling-host',preferences,expanded,dark:document.body.dataset.theme==='night'},location.origin);
  }
  function sync() {
    const blocked = [...document.querySelectorAll('.colt-radio-panel,.colt-assistant-panel')].some(p=>!p.hidden);
    root.hidden = !loaded || !auth.authenticated || !enabled || hiddenScreens.has(screen) || blocked;
    select.value=preferences.pet;
    select.disabled=loadError;
    const showDumpling=preferences.pet==='dumpling';
    customize.hidden=hide.hidden=!showDumpling;
    customize.textContent=expanded?'Close customization':'Customize dumpling';
    hide.textContent=petHidden?'Show pet':'Hide pet';
    root.classList.toggle('is-expanded',expanded && showDumpling && !petHidden);
    if (!showDumpling || root.hidden || petHidden) {
      frame?.remove(); frame=null;
    } else if (!frame) {
      frame=document.createElement('iframe');
      frame.title='Squishy Dumpling and customization controls';
      frame.src='dumpling-pet/index.html';
      display.append(frame);
    }
    sendToFrame();
  }
  function selectPet() {
    window.dispatchEvent(new CustomEvent('launchpad-companion-selected',{detail:{pet:preferences.pet}}));
    sync();
  }
  function save() {
    const snapshot={...preferences}, generation=epoch;
    status.textContent='Saving…'; retry.hidden=true;
    pending=pending.catch(()=>{}).then(async()=>{
      if (generation!==epoch) return;
      const response=await fetch('/api/companion-preferences',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(snapshot),signal:controller.signal});
      if (!response.ok) throw Error('Could not save your pet choices.');
      if(generation===epoch && JSON.stringify(preferences)===JSON.stringify(snapshot)) status.textContent='Saved';
    }).catch(error=>{
      if(generation===epoch && error.name!=='AbortError'){status.textContent='Not saved. Please retry.';retry.hidden=false;}
    });
  }
  retry.onclick=()=>loadError?updateAccount(auth,true):save();
  select.onchange=()=>{preferences.pet=select.value;expanded=false;petHidden=false;selectPet();save();};
  customize.onclick=()=>{expanded=!expanded;petHidden=false;sync();};
  hide.onclick=()=>{petHidden=!petHidden;expanded=false;sync();};
  root.addEventListener('keydown',event=>{if(event.key==='Escape' && expanded){expanded=false;sync();customize.focus();}});
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin || event.source!==frame?.contentWindow || event.data?.type!=='dumpling-pet')return;
    if(event.data.ready){sendToFrame();return;}
    if(event.data.close){expanded=false;sync();customize.focus();return;}
    const p=event.data.preferences;
    if(!p || !['Gold','Rose','Blue','Lavender','Matcha','Silver'].includes(p.color) || !['none','bow','headphones','hat'].includes(p.accessory) || typeof p.motion!=='boolean')return;
    preferences={...preferences,...p,pet:'dumpling'};save();
  });
  async function updateAccount(nextAuth, force=false) {
    auth=nextAuth||{};
    const next=auth.authenticated?`${auth.role}:${auth.email||''}`:'';
    if(next===account && !force){sync();return;}
    account=next;const generation=++epoch;
    controller?.abort();controller=new AbortController();
    preferences=defaults();expanded=false;petHidden=false;loaded=false;loadError=false;status.textContent='';retry.hidden=true;retry.textContent='Retry save';
    frame?.remove();frame=null;selectPet();
    if(!next)return;
    try {
      const response=await fetch('/api/companion-preferences',{signal:controller.signal});
      if(!response.ok)throw Error('Pet choices unavailable');
      const data=await response.json();if(generation!==epoch)return;
      preferences=data.preferences;loaded=true;selectPet();
    } catch(error) {
      if(generation!==epoch || error.name==='AbortError')return;
      // Do not overwrite existing account settings after a failed load.
      loaded=true;loadError=true;status.textContent='Could not load your pet choices.';retry.textContent='Retry loading';retry.hidden=false;sync();
    }
  }
  window.addEventListener('classroom-launchpad-rendered',event=>{
    screen=event.detail?.screen||document.body.dataset.screen||screen;
    updateAccount(event.detail?.auth||auth);
  });
  // Existing Colt visibility supplies the teacher's companion enable/disable setting.
  window.addEventListener('launchpad-companion-availability',event=>{enabled=event.detail.enabled;sync();});
  new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['data-theme']});
  ['colt-radio-opened','colt-assistant-opened'].forEach(name=>window.addEventListener(name,sync));
  const panelObserver=new MutationObserver(sync);
  document.querySelectorAll('.colt-radio-panel,.colt-assistant-panel').forEach(panel=>panelObserver.observe(panel,{attributes:true,attributeFilter:['hidden']}));
  const initialEpoch=epoch;
  fetch('/api/state').then(r=>r.ok?r.json():null).then(state=>{
    if(!state || epoch!==initialEpoch)return;
    enabled=state.launchpadColt?.enabled!==false;updateAccount(state.auth);
  }).catch(()=>{});
})();
