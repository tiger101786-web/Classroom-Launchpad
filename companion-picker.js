(() => {
  'use strict';
  const defaults=()=>({pet:'colt',color:'Gold',accessory:'none',motion:true});
  const hiddenScreens=new Set(['pin','login','coltRun','dashboard','edit','changePin']);
  let auth={},account='',epoch=0,enabled=true,preferences=defaults(),loaded=false,loadError=false,radioPlaying=false;
  let screen=document.body.dataset.screen||'home',pending=Promise.resolve(),controller,applying=false,petHidden=false,position=null,opener=null;
  const picker=document.createElement('dialog');
  picker.className='companion-picker';picker.setAttribute('aria-labelledby','companion-picker-title');
  picker.innerHTML='<header><h2 id="companion-picker-title">My Pet</h2><button type="button" data-pet-close aria-label="Close pet selection">✕</button></header><label>Choose pet <select aria-label="Choose pet"><option value="colt">Colt</option><option value="dumpling">Squishy Dumpling</option></select></label><p>Colt keeps his own controls and settings. Click the dumpling for customization; drag it to move.</p><div class="pet-tools"><button type="button" data-pet-customize>Customize dumpling</button><button type="button" data-pet-show>Show dumpling</button></div><p class="pet-status" role="status"></p><button class="pet-retry" hidden>Retry save</button>';
  const host=document.createElement('div');host.className='dumpling-companion';host.hidden=true;
  host.innerHTML='<h1 hidden></h1><div class="eyebrow" hidden></div><section class="stage"><span hidden></span><img class="toy" alt="Squishy dumpling"></section><aside class="panel" hidden aria-label="Squishy Dumpling controls"><div><h2></h2><p></p></div><div class="note"></div></aside>';
  document.body.append(picker,host);
  const petApi=window.createDumplingPet(host),accessoryApi=window.addDumplingAccessories(host);
  const pet=host.querySelector('.pet-button'),panel=host.querySelector('.panel');
  pet.setAttribute('aria-label','Open Squishy Dumpling controls. Drag to move.');pet.setAttribute('aria-expanded','false');pet.title='Click for controls · drag to move · arrow keys move';
  pet.querySelector('svg').setAttribute('viewBox','0 30 1254 1140');
  const heading=document.createElement('header');heading.className='dumpling-panel-heading';
  heading.innerHTML='<div><span class="pet-kicker">YOUR LITTLE COMPANION</span><strong>Squishy Dumpling</strong></div><button type="button" data-dumpling-close aria-label="Close dumpling controls">✕</button>';
  panel.prepend(heading);
  const intro=panel.querySelector('h2').parentElement;
  intro.className='dumpling-look';intro.querySelector('p').textContent='A little sparkle. A lot of personality.';
  const content=host.querySelector('.colors').parentElement;
  content.classList.add('dumpling-sections');
  function group(title,items) {
    const field=document.createElement('fieldset');field.className='dumpling-group';
    const legend=document.createElement('legend');legend.textContent=title;field.append(legend);
    items.forEach(item=>field.append(item));content.append(field);return field;
  }
  const colors=host.querySelector('.colors');colors.previousElementSibling.remove();group('01 · Choose your sparkle',[colors]);
  const accessories=host.querySelector('.accessory-controls');accessories.querySelector('.label').remove();group('02 · Dress it up',[accessories]);
  const motionLabel=[...content.children].find(e=>e.textContent==='Try an animation');
  const actions=motionLabel.nextElementSibling;motionLabel.remove();
  group('03 · Play together',[actions,host.querySelector('.motion-status')]);
  const radioBadge=document.createElement('div');radioBadge.className='dumpling-radio-status';radioBadge.setAttribute('role','status');
  panel.append(radioBadge);
  const tools=document.createElement('div');tools.className='controls dumpling-utilities';
  tools.innerHTML='<button type="button" data-dumpling-reset>Reset spot</button><button type="button" data-dumpling-hide>Hide dumpling</button><button type="button" data-companion-open>Choose pet</button>';
  panel.append(tools);
  const status=document.createElement('p');status.className='pet-status';status.setAttribute('role','status');panel.append(status);
  const retry=document.createElement('button');retry.hidden=true;retry.textContent='Retry save';panel.append(retry);
  const select=picker.querySelector('select'),pickerStatus=picker.querySelector('.pet-status'),pickerRetry=picker.querySelector('.pet-retry');
  const allowed=()=>loaded&&auth.authenticated&&enabled&&!hiddenScreens.has(screen);
  const positionKey=()=>`dumpling-position:${account}`;
  function announce(message,error=false){status.textContent=pickerStatus.textContent=message;retry.hidden=pickerRetry.hidden=!error;}
  function clamp(x,y){const box=pet.getBoundingClientRect();return {x:Math.max(8,Math.min(x,innerWidth-box.width-8)),y:Math.max(8,Math.min(y,innerHeight-box.height-8))};}
  function place(){
    if(host.hidden)return;
    const width=pet.getBoundingClientRect().width;
    const next=clamp(position?.x??innerWidth-width-34,position?.y??innerHeight*.48-90);
    host.style.left=`${next.x}px`;host.style.top=`${next.y}px`;
    if(position)position=next;
    placePanel();
  }
  function placePanel(){
    if(panel.hidden)return;
    const box=pet.getBoundingClientRect(),width=Math.min(360,innerWidth-24);
    panel.style.width=`${width}px`;
    const left=box.left>width+20?box.left-width-12:Math.min(box.right+12,innerWidth-width-12);
    panel.style.left=`${Math.max(12,left)}px`;
    panel.style.top=`${Math.max(12,Math.min(box.top,innerHeight-panel.offsetHeight-12))}px`;
  }
  function closePanel(focus=false){panel.hidden=true;pet.setAttribute('aria-expanded','false');if(focus&&!host.hidden)pet.focus();}
  function openPanel(){if(host.hidden)return;panel.hidden=false;pet.setAttribute('aria-expanded','true');placePanel();panel.querySelector('[data-dumpling-close]').focus();}
  function sync(){
    const blocked=[...document.querySelectorAll('.colt-radio-panel,.colt-assistant-panel')].some(p=>!p.hidden && (!p.classList.contains('colt-radio-panel') || !radioPlaying));
    host.hidden=!allowed()||blocked||preferences.pet!=='dumpling'||petHidden;
    if(host.hidden)closePanel();
    if(!auth.authenticated||!enabled){if(picker.open)picker.close();}
    select.value=preferences.pet;select.disabled=!loaded||loadError||!enabled;
    picker.querySelector('[data-pet-customize]').hidden=picker.querySelector('[data-pet-show]').hidden=preferences.pet!=='dumpling';
    applying=true;
    const motion=!host.hidden&&preferences.motion&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(pet.classList.contains('idle')!==motion)petApi.setIdle(motion);
    petApi.setRadio(radioPlaying);
    const accessory=radioPlaying?'headphones':preferences.accessory;
    if(pet.dataset.accessory!==accessory)accessoryApi.setAccessory(accessory);
    host.classList.toggle('is-listening',radioPlaying);
    radioBadge.textContent=radioPlaying?'♫ Colt Radio · Headphones on'+(motion?' · Squish along!':' · Motion paused'):'♫ Radio ready · Headphones appear when music plays';
    host.querySelector('.accessory-hint').textContent=radioPlaying?'Your choice is saved for when the music stops.':'One accessory at a time. Make it yours.';
    applying=false;place();
  }
  function applyAppearance(){
    applying=true;
    [...host.querySelectorAll('.color-choice')].find(b=>b.textContent===preferences.color)?.click();
    [...host.querySelectorAll('.accessory-controls button')].find(b=>b.dataset.accessory===preferences.accessory)?.click();
    pet.setAttribute('aria-label','Open Squishy Dumpling controls. Drag to move.');
    applying=false;sync();
  }
  function selectPet(){window.dispatchEvent(new CustomEvent('launchpad-companion-selected',{detail:{pet:preferences.pet}}));sync();}
  function save(){
    const snapshot={...preferences},generation=epoch;announce('Saving…');
    pending=pending.catch(()=>{}).then(async()=>{
      if(generation!==epoch)return;
      const response=await fetch('/api/companion-preferences',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(snapshot),signal:controller.signal});
      if(!response.ok)throw Error('Save failed');
      if(generation===epoch&&JSON.stringify(snapshot)===JSON.stringify(preferences))announce('Saved');
    }).catch(error=>{if(generation===epoch&&error.name!=='AbortError')announce('Not saved. Please retry.',true);});
  }
  retry.onclick=pickerRetry.onclick=()=>loadError?updateAccount(auth,true):save();
  select.onchange=()=>{preferences.pet=select.value;petHidden=false;closePanel();selectPet();save();};
  picker.querySelector('[data-pet-close]').onclick=()=>picker.close();
  picker.addEventListener('close',()=>{if(opener?.isConnected)opener.focus();});
  picker.querySelector('[data-pet-customize]').onclick=()=>{picker.close();petHidden=false;sync();openPanel();};
  picker.querySelector('[data-pet-show]').onclick=()=>{petHidden=false;picker.close();sync();};
  panel.querySelector('[data-dumpling-close]').onclick=()=>closePanel(true);
  panel.querySelector('[data-dumpling-hide]').onclick=()=>{petHidden=true;sync();};
  panel.querySelector('[data-dumpling-reset]').onclick=()=>{position=null;try{localStorage.removeItem(positionKey());}catch{}place();};
  function openPicker(event){
    if(!auth.authenticated)return;
    opener=event?.target?.closest('.header-account-menu')?.querySelector('summary')||document.activeElement;
    document.querySelectorAll('.header-account-menu[open]').forEach(menu=>menu.open=false);
    closePanel();sync();if(!picker.open)picker.showModal();
  }
  document.addEventListener('click',event=>{if(event.target.closest('[data-companion-open]')){event.preventDefault();openPicker(event);}});
  host.addEventListener('click',event=>{
    if(applying||!event.target.closest('.color-choice,.accessory-controls button,#idle'))return;
    preferences.color=host.querySelector('.color-choice[aria-pressed=true]').textContent;
    preferences.accessory=host.querySelector('.accessory-controls [aria-pressed=true]').dataset.accessory;
    preferences.motion=pet.classList.contains('idle');
    pet.setAttribute('aria-label','Open Squishy Dumpling controls. Drag to move.');sync();save();
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden)closePanel(true);});
  document.addEventListener('pointerdown',event=>{if(!panel.hidden&&!host.contains(event.target))closePanel();});
  let drag=null,suppressClick=false;
  function persistPosition(){try{localStorage.setItem(positionKey(),JSON.stringify(position));}catch{}}
  pet.onclick=()=>{if(suppressClick){suppressClick=false;return;}panel.hidden?openPanel():closePanel();};
  pet.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;
    const box=pet.getBoundingClientRect();drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:box.left,top:box.top,moved:false};suppressClick=false;
    pet.setPointerCapture(event.pointerId);
  });
  pet.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.id)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(!drag.moved&&Math.hypot(dx,dy)<6)return;
    drag.moved=true;closePanel();position=clamp(drag.left+dx,drag.top+dy);place();
  });
  function endDrag(event){if(!drag||event.pointerId!==drag.id)return;suppressClick=drag.moved;if(drag.moved)persistPosition();drag=null;}
  pet.addEventListener('pointerup',endDrag);pet.addEventListener('pointercancel',endDrag);
  pet.addEventListener('keydown',event=>{
    const moves={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]};
    if(!moves[event.key])return;event.preventDefault();const b=pet.getBoundingClientRect(),[x,y]=moves[event.key];position=clamp(b.left+x,b.top+y);place();persistPosition();
  });
  async function updateAccount(nextAuth,force=false){
    auth=nextAuth||{};const next=auth.authenticated?`${auth.role}:${auth.email||''}`:'';
    if(next===account&&!force){sync();return;}
    account=next;const generation=++epoch;controller?.abort();controller=new AbortController();
    preferences=defaults();loaded=false;loadError=false;petHidden=false;position=null;closePanel();if(picker.open)picker.close();announce('');selectPet();
    try{const stored=JSON.parse(localStorage.getItem(positionKey())||'null');if(stored&&Number.isFinite(stored.x)&&Number.isFinite(stored.y))position=stored;}catch{}
    if(!next)return;
    try{
      const response=await fetch('/api/companion-preferences',{signal:controller.signal});if(!response.ok)throw Error('Load failed');
      const data=await response.json();if(generation!==epoch)return;
      preferences=data.preferences;loaded=true;applyAppearance();selectPet();
    }catch(error){if(generation!==epoch||error.name==='AbortError')return;loaded=true;loadError=true;announce('Could not load pet choices. Retry before making changes.',true);sync();}
  }
  window.addEventListener('resize',place);
  window.addEventListener('colt-radio-playback',event=>{radioPlaying=event.detail?.playing===true;sync();});
  window.addEventListener('classroom-launchpad-rendered',event=>{screen=event.detail?.screen||document.body.dataset.screen||screen;updateAccount(event.detail?.auth||auth);});
  window.addEventListener('launchpad-companion-availability',event=>{enabled=event.detail.enabled;sync();});
  const panelObserver=new MutationObserver(sync);
  document.querySelectorAll('.colt-radio-panel,.colt-assistant-panel').forEach(p=>panelObserver.observe(p,{attributes:true,attributeFilter:['hidden']}));
  const initialEpoch=epoch;
  fetch('/api/state').then(r=>r.ok?r.json():null).then(state=>{if(!state||epoch!==initialEpoch)return;enabled=state.launchpadColt?.enabled!==false;updateAccount(state.auth);}).catch(()=>{});
})();
