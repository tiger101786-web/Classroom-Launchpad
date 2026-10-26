(() => {
  'use strict';
  const defaults=()=>({pet:'colt',color:'Gold',accessory:'none',eyewear:'none',motion:true,size:'medium',asleep:false,squishyName:'Mochi',squishyNameplate:true});
  const hiddenScreens=new Set(['pin','login']);
  let auth={},account='',epoch=0,enabled=true,preferences=defaults(),loaded=false,loadError=false,radioPlaying=false;
  let screen=document.body.dataset.screen||'home',pending=Promise.resolve(),controller,applying=false,petHidden=false,position=null,opener=null;
  let studio=null,studioRadio=false;
  const picker=document.createElement('dialog');
  picker.className='companion-picker';picker.setAttribute('aria-labelledby','companion-picker-title');
  picker.innerHTML='<header class="pet-picker-heading"><div><span class="pet-picker-kicker">YOUR CLASSROOM COMPANION</span><h2 id="companion-picker-title">My Pet</h2></div><button type="button" data-pet-close aria-label="Close pet selection">✕</button></header><div class="pet-picker-body"><p class="pet-picker-intro">A little personality for your school day.</p><fieldset class="pet-picker-group"><legend>01 · Choose your companion</legend><label>Choose pet <select aria-label="Choose pet"><option value="colt">Colt</option><option value="dumpling">Squishy Dumpling</option></select></label><p class="pet-picker-hint">Your choice saves automatically.</p></fieldset><fieldset class="pet-picker-group"><legend>02 · Make yourself at home</legend><p class="pet-picker-help">Click your pet to open its controls. Drag it to find a cozy spot.</p><div class="pet-tools"><button type="button" data-pet-customize>Customize dumpling</button><button type="button" data-pet-show>Show dumpling</button></div><p class="pet-picker-note">Colt keeps his own controls and settings.</p></fieldset><footer class="pet-picker-footer"><p class="pet-status" role="status"></p><button class="pet-retry" hidden>Retry save</button></footer></div>';
  const host=document.createElement('div');host.className='dumpling-companion';host.hidden=true;
  host.innerHTML='<h1 hidden></h1><div class="eyebrow" hidden></div><section class="stage"><span hidden></span><img class="toy" alt="Squishy dumpling"></section><aside class="panel" hidden aria-label="Squishy Dumpling controls"><div><h2></h2><p></p></div><div class="note"></div></aside>';
  document.body.append(picker,host);
  const robo=window.createRoboColt(value=>{preferences.robo=value;sync();save();},window.createPetStudio?()=>studio?.open('colt'):undefined);
  const gummy=window.createGummyBear(value=>{preferences.gummy=value;sync();save();},()=>studio?.open('gummy'));
  const roblox=window.createRobloxPet(value=>{preferences.roblox=value;sync();save();},()=>studio?.open('roblox'));
  picker.querySelector('select').add(new Option('Roblox Buddy','roblox'));
  const labubu=window.createLabubuPet(value=>{preferences.labubu=value;sync();save();},()=>studio?.open('labubu'));
  picker.querySelector('select').add(new Option('Labubu','labubu'));
  const eagle=window.createEaglePet(value=>{preferences.eagle=value;sync();save();},()=>studio?.open('eagle'));
  picker.querySelector('select').add(new Option('Bald Eagle','eagle'));
  picker.querySelector('select').add(new Option('Gummy Bear','gummy'));
  picker.querySelector('option[value="colt"]').textContent='Robo-Colt';
  picker.querySelector('.pet-picker-note').textContent='Each pet keeps its own appearance and controls.';
  const petApi=window.createDumplingPet(host),accessoryApi=window.addDumplingAccessories(host);
  const pet=host.querySelector('.pet-button'),panel=host.querySelector('.panel');
  const nameplate=window.createSquishyNameplate(pet);
  const speech=document.createElement('div');speech.className='dumpling-speech';speech.hidden=true;
  speech.setAttribute('role','status');speech.setAttribute('aria-live','polite');speech.setAttribute('aria-atomic','true');
  speech.innerHTML='<span class="dumpling-speech-label">✦ SQUISHY DUMPLING</span><span class="dumpling-speech-message"></span>';host.append(speech);
  let speechTimer,moveTimer,moveMessage=0;
  function hideSpeech(){clearTimeout(speechTimer);speech.hidden=true;}
  function placeSpeech(){
    if(speech.hidden||host.hidden)return;
    const box=pet.getBoundingClientRect(),width=Math.min(238,innerWidth-24);
    speech.style.width=`${width}px`;
    const left=Math.max(12,Math.min(box.left+box.width/2-width/2,innerWidth-width-12));
    const below=box.top<speech.offsetHeight+26;
    speech.dataset.side=below?'below':'above';speech.style.left=`${left}px`;
    speech.style.top=`${Math.max(12,Math.min(below?box.bottom+14:box.top-speech.offsetHeight-14,innerHeight-speech.offsetHeight-12))}px`;
    speech.style.setProperty('--speech-tail',`${Math.max(22,Math.min(width-22,box.left+box.width/2-left))}px`);
  }
  function say(message){
    if(host.hidden||!panel.hidden||pet.classList.contains('asleep'))return;
    clearTimeout(speechTimer);speech.querySelector('.dumpling-speech-message').textContent=message;speech.hidden=false;placeSpeech();
    speechTimer=setTimeout(hideSpeech,4200);
  }
  function movedReaction(){
    if(host.hidden||preferences.asleep||autoAsleep||pet.classList.contains('waking'))return;
    resetNap();petApi.excite();
    const messages=['New spot, same squish!','Ooh, a cozy new perch!','Boing! I like it here!'];say(messages[moveMessage++%messages.length]);
  }
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
  function groupHint(text){const hint=document.createElement('p');hint.className='dumpling-group-hint';hint.textContent=text;return hint;}
  const colors=host.querySelector('.colors');colors.previousElementSibling.remove();group('01 · Choose your sparkle',[colors,groupHint('Pick your favorite glitter color.')]);
  const accessories=host.querySelector('.accessory-controls');accessories.querySelector('.label').remove();group('02 · Dress it up',[accessories]);
  const motionLabel=[...content.children].find(e=>e.textContent==='Try an animation');
  const actions=motionLabel.nextElementSibling;motionLabel.remove();
  group('03 · Play together',[actions,host.querySelector('.motion-status')]);
  const sleepButton=document.createElement('button');sleepButton.type='button';sleepButton.dataset.dumplingSleep='';actions.append(sleepButton);
  let napTimer,autoAsleep=false,wakeRequested=false;
  function resetNap(){
    clearTimeout(napTimer);if(autoAsleep)wakeRequested=true;autoAsleep=false;sync();
    if(host.hidden||preferences.asleep||radioPlaying||studio?.isOpen())return;
    napTimer=setTimeout(()=>{if(!host.hidden&&panel.hidden&&!preferences.asleep&&!radioPlaying&&!studio?.isOpen()){autoAsleep=true;sync();}},60000);
  }
  sleepButton.onclick=()=>{wakeRequested=Boolean(preferences.asleep||autoAsleep);preferences.asleep=!wakeRequested;autoAsleep=false;closePanel();resetNap();save();};
  host.addEventListener('dumpling-wake-finished',()=>{sync();say('All rested and ready to squish!');});
  document.addEventListener('pointerdown',event=>{if(loaded&&!pet.contains(event.target))resetNap();});
  document.addEventListener('keydown',event=>{if(loaded&&!pet.contains(event.target))resetNap();});
  const sizeChoices=document.createElement('div');sizeChoices.className='controls dumpling-sizes';
  [['small','Small'],['medium','Medium'],['large','Large'],['extra-large','Extra Large']].forEach(([size,label])=>{
    const button=document.createElement('button');button.type='button';button.dataset.petSize=size;button.textContent=label;
    button.onclick=()=>{preferences.size=size;sync();save();};sizeChoices.append(button);
  });
  group('04 · Choose your size',[sizeChoices,groupHint('Matching sizes for Colt and Squishy.')]);
  const restControls=document.createElement('div');restControls.className='controls dumpling-rest-controls';
  restControls.append(host.querySelector('#idle'),sleepButton);
  group('05 · Rest & motion',[restControls]).classList.add('dumpling-rest-group');
  group('06 · Add glasses',[host.querySelector('.eyewear-controls'),groupHint('Mix glasses with any headwear.')]).classList.add('dumpling-rest-group');
  const nameLabel=document.createElement('label');nameLabel.className='squishy-name-label';nameLabel.textContent='Squishy’s name';
  const nameInput=document.createElement('input');nameInput.type='text';nameInput.maxLength=32;nameInput.autocomplete='off';nameInput.dataset.squishyName='';nameInput.setAttribute('aria-label','Squishy’s name');nameLabel.append(nameInput);
  const nameChoices=document.createElement('div');nameChoices.className='controls';
  for(const [visible,label] of [[true,'Show nameplate'],[false,'Hide nameplate']]){const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.squishyNameplate=String(visible);b.onclick=()=>{preferences.squishyNameplate=visible;sync();save();};nameChoices.append(b);}
  group('07 · Name & nameplate',[nameLabel,nameChoices,groupHint('Up to 16 characters. Your name saves when you finish editing.')]);
  nameInput.addEventListener('input',()=>{nameInput.value=Array.from(nameInput.value.replace(/[\u0000-\u001f\u007f]/g,'')).slice(0,16).join('');nameplate.update(nameInput.value,preferences.squishyNameplate!==false);});
  nameInput.addEventListener('change',()=>{preferences.squishyName=nameInput.value.trim()||'Mochi';sync();save();});
  nameInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();nameInput.blur();}});
  // Reuse the same two-row paging rules as each collection grows.
  const optionPages=[];
  function paginateOptions(grid,pageSize,hint){
    const buttons=[...grid.children].filter(el=>el.matches('button'))
      .sort((a,b)=>a.textContent.localeCompare(b.textContent,'en',{sensitivity:'base'}));
    buttons.forEach(button=>grid.append(button));
    let page=0;const count=Math.ceil(buttons.length/pageSize);
    const nav=document.createElement('nav');nav.className='dumpling-option-pages';
    nav.setAttribute('aria-label',grid.closest('fieldset').querySelector('legend').textContent+' pages');
    const previous=document.createElement('button'),next=document.createElement('button'),label=document.createElement('span');
    previous.type=next.type='button';previous.textContent='Previous';next.textContent='Next';
    label.setAttribute('aria-live','polite');nav.append(previous,label,next);grid.after(nav);
    function render(){
      buttons.forEach((button,i)=>{button.hidden=Math.floor(i/pageSize)!==page;});
      nav.hidden=count<=1;if(hint)hint.hidden=count>1;
      label.textContent=`${page+1} / ${count}`;previous.disabled=page===0;next.disabled=page===count-1;
    }
    previous.onclick=()=>{page=Math.max(0,page-1);render();};
    next.onclick=()=>{page=Math.min(count-1,page+1);render();};
    optionPages.push(()=>{const selected=buttons.findIndex(button=>button.getAttribute('aria-pressed')==='true');if(selected>=0)page=Math.floor(selected/pageSize);render();});
    render();
  }
  paginateOptions(colors,6,colors.parentElement.querySelector('.dumpling-group-hint'));
  paginateOptions(accessories.querySelector('.headwear-options'),4,accessories.querySelector('.accessory-hint'));
  paginateOptions(actions,4,host.querySelector('.motion-status'));
  paginateOptions(host.querySelector('.eyewear-controls'),6,host.querySelector('.eyewear-controls').parentElement.querySelector('.dumpling-group-hint'));
  const radioBadge=document.createElement('div');radioBadge.className='dumpling-radio-status';radioBadge.setAttribute('role','status');
  panel.append(radioBadge);
  const tools=document.createElement('div');tools.className='controls dumpling-utilities';
  tools.innerHTML='<button type="button" data-dumpling-reset>Reset spot</button><button type="button" data-dumpling-hide>Hide dumpling</button><button type="button" data-companion-open>Choose pet</button>';
  panel.append(tools);
  const status=document.createElement('p');status.className='pet-status';status.setAttribute('role','status');panel.append(status);
  const retry=document.createElement('button');retry.hidden=true;retry.textContent='Retry save';panel.append(retry);
  const panelBody=document.createElement('div');panelBody.className='dumpling-panel-body';
  panelBody.setAttribute('role','region');panelBody.setAttribute('aria-label','Squishy customization options');panelBody.tabIndex=0;
  [...panel.children].filter(child=>child!==heading).forEach(child=>panelBody.append(child));panel.append(panelBody);
  const select=picker.querySelector('select'),pickerStatus=picker.querySelector('.pet-status'),pickerRetry=picker.querySelector('.pet-retry');
  const allowed=()=>loaded&&auth.authenticated&&enabled&&!hiddenScreens.has(screen);
  const positionKey=()=>`dumpling-position:${account}`;
  function announce(message,error=false){status.textContent=pickerStatus.textContent=message;retry.hidden=pickerRetry.hidden=!error;robo.announce(message,error,()=>loadError?updateAccount(auth,true):save());studio?.announce(message,error);}
  function clamp(x,y){const box=pet.getBoundingClientRect();return {x:Math.max(8,Math.min(x,innerWidth-box.width-8)),y:Math.max(8,Math.min(y,innerHeight-box.height-8))};}
  function place(){
    if(host.hidden)return;
    const width=pet.getBoundingClientRect().width;
    const next=clamp(position?.x??innerWidth-width-34,position?.y??innerHeight*.48-90);
    host.style.left=`${next.x}px`;host.style.top=`${next.y}px`;
    if(position)position=next;
    placePanel();
    placeSpeech();
  }
  function placePanel(){
    if(panel.hidden)return;
    const box=pet.getBoundingClientRect(),width=Math.min(640,innerWidth-24);
    panel.style.width=`${width}px`;
    const left=box.left>width+20?box.left-width-12:Math.min(box.right+12,innerWidth-width-12);
    panel.style.left=`${Math.max(12,left)}px`;
    panel.style.top=`${Math.max(12,Math.min(box.top,innerHeight-panel.offsetHeight-12))}px`;
  }
  function closePanel(focus=false){panel.hidden=true;pet.setAttribute('aria-expanded','false');if(focus&&!host.hidden)pet.focus();}
  function openPanel(){if(host.hidden)return;if(studio){studio.open('squishy');return}optionPages.forEach(reveal=>reveal());hideSpeech();panel.hidden=false;pet.setAttribute('aria-expanded','true');placePanel();panel.querySelector('[data-dumpling-close]').focus();}
  function sync(){
    roblox.update({account,visible:allowed()&&preferences.pet==='roblox',radio:radioPlaying||studioRadio,preferences:preferences.roblox});
    labubu.update({account,visible:allowed()&&preferences.pet==='labubu',radio:radioPlaying||studioRadio,preferences:preferences.labubu});
    eagle.update({account,visible:allowed()&&preferences.pet==='eagle',radio:radioPlaying||studioRadio,preferences:preferences.eagle});
    gummy.update({account,visible:allowed()&&preferences.pet==='gummy',radio:radioPlaying||studioRadio,preferences:preferences.gummy});
    robo.update({account,visible:allowed()&&preferences.pet==='colt',radio:radioPlaying||studioRadio,preferences:preferences.robo});
    host.hidden=!allowed()||preferences.pet!=='dumpling'||petHidden;
    host.dataset.size=preferences.size||'medium';
    const showNameplate=preferences.squishyNameplate!==false;
    host.classList.toggle('has-nameplate',showNameplate);
    pet.querySelector('svg').setAttribute('viewBox',showNameplate?'0 30 1254 1590':'0 30 1254 1140');
    nameplate.update(preferences.squishyName||'Mochi',showNameplate);
    if(document.activeElement!==nameInput)nameInput.value=preferences.squishyName||'Mochi';
    nameChoices.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.squishyNameplate==='true')===showNameplate)));
    sizeChoices.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.petSize===host.dataset.size)));
    if(host.hidden)closePanel();
    if(!auth.authenticated||!enabled){if(picker.open)picker.close();}
    select.value=preferences.pet;select.disabled=!loaded||loadError||!enabled;
    picker.querySelector('[data-pet-customize]').hidden=picker.querySelector('[data-pet-show]').hidden=false;
    picker.querySelector('[data-pet-customize]').textContent=preferences.pet==='roblox'?'Customize Roblox Buddy':preferences.pet==='labubu'?'Customize Labubu':preferences.pet==='eagle'?'Customize Bald Eagle':preferences.pet==='gummy'?'Customize Gummy Bear':preferences.pet==='colt'?'Customize Colt':'Customize dumpling';
    picker.querySelector('[data-pet-show]').textContent=preferences.pet==='roblox'?'Show Roblox Buddy':preferences.pet==='labubu'?'Show Labubu':preferences.pet==='eagle'?'Show Bald Eagle':preferences.pet==='gummy'?'Show Gummy Bear':preferences.pet==='colt'?'Show Colt':'Show dumpling';
    applying=true;
    const asleep=Boolean(preferences.asleep||autoAsleep);
    if(host.hidden||asleep)hideSpeech();
    const animateWake=wakeRequested;wakeRequested=false;
    petApi.setSleep(asleep,animateWake);
    pet.setAttribute('aria-label',asleep?'Wake Squishy. Drag to move.':'Open Squishy Dumpling controls. Drag to move.');
    pet.title=asleep?'Click to wake · drag to move':'Click for controls · drag to move · arrow keys move';
    sleepButton.textContent=asleep?'Wake Squishy':'Sleep Squishy';sleepButton.setAttribute('aria-pressed',String(asleep));
    const motion=!host.hidden&&preferences.motion&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(pet.classList.contains('idle')!==motion)petApi.setIdle(motion);
    petApi.setRadio(radioPlaying||studioRadio);
    const accessory=(radioPlaying||studioRadio)&&!asleep&&!pet.classList.contains('waking')?'headphones':preferences.accessory;
    if(pet.dataset.accessory!==accessory)accessoryApi.setAccessory(accessory);
    accessoryApi.setEyewear(preferences.eyewear||'none');
    host.classList.toggle('is-listening',radioPlaying);
    radioBadge.textContent=asleep?'☾ Sleeping · Wake Squishy to play again':radioPlaying?'♫ Colt Radio · Headphones on'+(motion?' · Squish along!':' · Motion paused'):'♫ Radio ready · Headphones appear when music plays';
    host.querySelector('.accessory-hint').textContent=radioPlaying&&!asleep?'Your hat returns when music stops.':'Choose headwear. Add glasses below.';
    applying=false;place();studio?.refresh();
  }
  function applyAppearance(){
    applying=true;
    [...host.querySelectorAll('.color-choice')].find(b=>b.dataset.color===preferences.color)?.click();
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
  select.onchange=()=>{preferences.pet=select.value;petHidden=false;gummy.show();eagle.show();labubu.show();roblox.show();closePanel();selectPet();resetNap();save();};
  picker.querySelector('[data-pet-close]').onclick=()=>picker.close();
  picker.addEventListener('close',()=>{if(opener?.isConnected)opener.focus();});
  picker.querySelector('[data-pet-customize]').onclick=()=>{picker.close();petHidden=false;gummy.show();eagle.show();labubu.show();roblox.show();sync();if(preferences.pet==='roblox')studio?.open('roblox');else if(preferences.pet==='labubu')studio?.open('labubu');else if(preferences.pet==='eagle')studio?.open('eagle');else if(preferences.pet==='gummy')studio?.open('gummy');else if(preferences.pet==='colt')robo.customize();else openPanel();};
  picker.querySelector('[data-pet-show]').onclick=()=>{petHidden=false;gummy.show();eagle.show();labubu.show();roblox.show();picker.close();sync();if(preferences.pet==='colt')robo.show();};
  panel.querySelector('[data-dumpling-close]').onclick=()=>closePanel(true);
  panel.querySelector('[data-dumpling-hide]').onclick=()=>{petHidden=true;sync();};
  panel.querySelector('[data-dumpling-reset]').onclick=()=>{position=null;try{localStorage.removeItem(positionKey());}catch{}place();};
  function openPicker(event){
    if(!auth.authenticated)return;
    opener=event?.target?.closest('.header-account-menu')?.querySelector('summary')||document.activeElement;
    document.querySelectorAll('.header-account-menu[open]').forEach(menu=>menu.open=false);
    closePanel();robo.close();sync();if(studio&&allowed()){petHidden=false;robo.show();gummy.show();eagle.show();labubu.show();roblox.show();sync();studio.open(preferences.pet==='dumpling'?'squishy':preferences.pet);return}if(!picker.open)picker.showModal();
  }
  document.addEventListener('click',event=>{if(event.target.closest('[data-companion-open]')){event.preventDefault();openPicker(event);}});
  host.addEventListener('click',event=>{
    if(applying||!event.target.closest('.color-choice,.accessory-controls button[data-accessory],.eyewear-controls button,#idle'))return;
    preferences.color=host.querySelector('.color-choice[aria-pressed=true]').dataset.color;
    preferences.accessory=host.querySelector('.accessory-controls [aria-pressed=true]').dataset.accessory;
    preferences.eyewear=host.querySelector('.eyewear-controls [aria-pressed=true]').dataset.eyewear;
    preferences.motion=pet.classList.contains('idle');
    pet.setAttribute('aria-label','Open Squishy Dumpling controls. Drag to move.');sync();save();
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden)closePanel(true);});
  document.addEventListener('pointerdown',event=>{if(!panel.hidden&&!host.contains(event.target))closePanel();});
  let drag=null,suppressClick=false;
  function persistPosition(){try{localStorage.setItem(positionKey(),JSON.stringify(position));}catch{}}
  pet.onclick=()=>{
    if(suppressClick){suppressClick=false;return;}
    if(preferences.asleep||autoAsleep){wakeRequested=true;preferences.asleep=false;autoAsleep=false;closePanel();resetNap();save();return;}
    resetNap();panel.hidden?openPanel():closePanel();
  };
  pet.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;
    const box=pet.getBoundingClientRect();drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:box.left,top:box.top,moved:false};suppressClick=false;
    pet.setPointerCapture(event.pointerId);
  });
  pet.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.id)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(!drag.moved&&Math.hypot(dx,dy)<6)return;
    drag.moved=true;hideSpeech();closePanel();position=clamp(drag.left+dx,drag.top+dy);place();
  });
  function endDrag(event){
    if(!drag||event.pointerId!==drag.id)return;
    const changed=drag.moved&&position&&Math.hypot(position.x-drag.left,position.y-drag.top)>4;
    suppressClick=drag.moved;if(drag.moved)persistPosition();drag=null;
    if(changed&&event.type==='pointerup')movedReaction();
  }
  pet.addEventListener('pointerup',endDrag);pet.addEventListener('pointercancel',endDrag);
  pet.addEventListener('keydown',event=>{
    const moves={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]};
    if(!moves[event.key])return;event.preventDefault();const b=pet.getBoundingClientRect(),[x,y]=moves[event.key];position=clamp(b.left+x,b.top+y);place();persistPosition();
    if(position.x!==b.left||position.y!==b.top){clearTimeout(moveTimer);moveTimer=setTimeout(movedReaction,250);}
  });
  async function updateAccount(nextAuth,force=false){
    auth=nextAuth||{};const next=auth.authenticated?`${auth.role}:${auth.email||''}`:'';
    if(next===account&&!force){sync();return;}
    studio?.close();account=next;const generation=++epoch;controller?.abort();controller=new AbortController();
    clearTimeout(napTimer);clearTimeout(moveTimer);hideSpeech();autoAsleep=false;
    preferences=defaults();loaded=false;loadError=false;petHidden=false;position=null;closePanel();if(picker.open)picker.close();announce('');selectPet();
    try{const stored=JSON.parse(localStorage.getItem(positionKey())||'null');if(stored&&Number.isFinite(stored.x)&&Number.isFinite(stored.y))position=stored;}catch{}
    if(!next)return;
    try{
      const response=await fetch('/api/companion-preferences',{signal:controller.signal});if(!response.ok)throw Error('Load failed');
      const data=await response.json();if(generation!==epoch)return;
      preferences=data.preferences;loaded=true;applyAppearance();selectPet();resetNap();say('Welcome back, squish buddy!');
    }catch(error){if(generation!==epoch||error.name==='AbortError')return;loaded=true;loadError=true;announce('Could not load pet choices. Retry before making changes.',true);sync();}
  }
  window.addEventListener('resize',place);
  window.addEventListener('colt-radio-playback',event=>{const wasPlaying=radioPlaying;radioPlaying=event.detail?.playing===true;resetNap();if(radioPlaying&&!wasPlaying)say('Turn up the squish! Let’s dance!');});
  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-action]');if(!target)return;
    const messages={openMessages:'A little message, a little joy!',openColtCorner:'Let’s roll into Colt Corner!',randomActivity:'A fresh adventure? Squish yes!',category:'Let’s find something fun to learn!'};
    if(messages[target.dataset.action])say(messages[target.dataset.action]);
  });
  window.addEventListener('classroom-launchpad-rendered',event=>{screen=event.detail?.screen||document.body.dataset.screen||screen;updateAccount(event.detail?.auth||auth);});
  window.addEventListener('launchpad-companion-availability',event=>{enabled=event.detail.enabled;sync();});
  const panelObserver=new MutationObserver(sync);
  document.querySelectorAll('.colt-radio-panel,.colt-assistant-panel').forEach(p=>panelObserver.observe(p,{attributes:true,attributeFilter:['hidden']}));
  // Studio presents the existing live pets; no duplicate SVGs, animation loops,
  // storage keys or account-saving paths are introduced.
  if(window.createPetStudio){
    const readStudio=()=>({roblox:{...robloxDefaults(),...preferences.roblox},labubu:{...labubuDefaults(),...preferences.labubu},eagle:{...eaglePetDefaults(),...preferences.eagle},gummy:{...gummyBearDefaults(),...preferences.gummy},colt:{...roboColtDefaults(),...preferences.robo},squishy:{color:preferences.color,name:preferences.squishyName||'Mochi',accessory:preferences.accessory,eyewear:preferences.eyewear||'none',motion:preferences.motion,nameplate:preferences.squishyNameplate!==false,size:preferences.size||'medium',asleep:preferences.asleep}});
    const setStudio=(kind,key,value)=>{
      if(!allowed()||loadError)return;
      if(key==='name')value=Array.from(String(value).replace(/[\u0000-\u001f\u007f]/g,'')).slice(0,16).join('').trim()||(kind==='roblox'?'Buddy':kind==='labubu'?'Labubu':kind==='eagle'?'Eagle':kind==='gummy'?'Gummy':kind==='colt'?'COLT':'Mochi');
      if(kind==='colt')preferences.robo={...roboColtDefaults(),...preferences.robo,[key]:value};
      else if(kind==='roblox'){const old={...robloxDefaults(),...preferences.roblox};preferences.roblox={...old,[key]:value};if(key==='skin'){preferences.roblox.top='skin';preferences.roblox.pants='skin';}if(key==='skin')preferences.roblox.headwear=robloxSkins[value]?.headwear||'none';}
      else if(kind==='labubu')preferences.labubu={...labubuDefaults(),...preferences.labubu,[key]:value};
      else if(kind==='eagle')preferences.eagle={...eaglePetDefaults(),...preferences.eagle,[key]:value};
      else if(kind==='gummy')preferences.gummy={...gummyBearDefaults(),...preferences.gummy,[key]:value};
      else{if(key==='asleep'){wakeRequested=!value;autoAsleep=false;}preferences[{name:'squishyName',nameplate:'squishyNameplate'}[key]||key]=value;}
      applyAppearance();save();
    };
    studio=createPetStudio({
      coltHost:document.querySelector('.robo-companion'),squishyHost:host,gummyHost:gummy.host,eagleHost:eagle.host,labubuHost:labubu.host,robloxHost:roblox.host,
      canOpen:()=>allowed(),canEdit:()=>allowed()&&!loadError,read:readStudio,
      prepare(){closePanel();robo.close();hideSpeech();clearTimeout(napTimer);if(autoAsleep){autoAsleep=false;wakeRequested=true;sync();}},
      change:setStudio,
      select(kind){if(!allowed()||loadError)return;preferences.pet=kind==='squishy'?'dumpling':kind;petHidden=false;robo.show();gummy.show();eagle.show();labubu.show();roblox.show();selectPet();applyAppearance();save();},
      restore(value){if(!allowed()||loadError)return;preferences={...preferences,roblox:{...value.roblox},labubu:{...value.labubu},eagle:{...value.eagle},gummy:{...value.gummy},robo:{...value.colt},color:value.squishy.color,accessory:value.squishy.accessory,eyewear:value.squishy.eyewear,motion:value.squishy.motion,size:value.squishy.size,asleep:value.squishy.asleep,squishyName:value.squishy.name,squishyNameplate:value.squishy.nameplate};autoAsleep=false;applyAppearance();save();},
      play(kind,action){if(kind==='roblox')roblox.play(action);else if(kind==='labubu')labubu.play(action);else if(kind==='eagle')eagle.play(action);else if(kind==='gummy')gummy.play(action);else if(kind==='colt')document.querySelector('.robo-companion [data-setting="action"][data-option="'+action+'"]').click();else if(action==='excited')petApi.excite();else host.querySelector(action==='smile'||action==='blink'?'#'+action:'[data-motion="'+action+'"]').click();},
      dance(on){studioRadio=on;sync();},refresh(){resetNap();},
      resetPosition(kind){if(kind==='roblox')roblox.reset();else if(kind==='labubu')labubu.reset();else if(kind==='eagle')eagle.reset();else if(kind==='gummy')gummy.reset();else if(kind==='colt')document.querySelector('.robo-companion [data-reset]').click();else{position=null;try{localStorage.removeItem(positionKey());}catch{}place();}},
      hide(kind){if(kind==='roblox')roblox.hide();else if(kind==='labubu')labubu.hide();else if(kind==='eagle')eagle.hide();else if(kind==='gummy')gummy.hide();else if(kind==='colt')document.querySelector('.robo-companion [data-hide]').click();else{petHidden=true;sync();}},
      retry(){loadError?updateAccount(auth,true):save();}
    });
  }
  const initialEpoch=epoch;
  fetch('/api/state').then(r=>r.ok?r.json():null).then(state=>{if(!state||epoch!==initialEpoch)return;enabled=state.launchpadColt?.enabled!==false;updateAccount(state.auth);}).catch(()=>{});
})();
