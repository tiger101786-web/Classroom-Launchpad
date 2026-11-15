window.createBlackCatPet=function(onChange,onCustomize){
 'use strict';
 const host=document.createElement('div');host.className='blackcat-companion';host.hidden=true;
 host.innerHTML='<button type="button" class="pet-button" aria-label="Open Black Cat controls. Drag to move.">'+deferPetArtwork(blackcatMarkup())+'</button><div class="blackcat-speech" role="status" hidden></div>';
 document.body.append(host);
 const pet=host.querySelector('.pet-button'),speech=host.querySelector('.blackcat-speech');
 let preferences=blackcatDefaults(),visible=false,hidden=false,radio=false,account='',position=null,drag=null,suppress=false,rig=null,pending=null,speaking=false,disposed=false;
 const positionKey=()=> 'blackcat-position:'+account;
 function place(){if(host.hidden||host.closest('.pet-studio'))return;const b=pet.getBoundingClientRect();host.style.left=Math.max(8,Math.min(position?.x??innerWidth-b.width-34,innerWidth-b.width-8))+'px';host.style.top=Math.max(8,Math.min(position?.y??innerHeight*.48-90,innerHeight-b.height-8))+'px';}
 function fitName(){const label=host.querySelector('#blackcat-pet-name');label.textContent=preferences.name;label.style.fontSize='78px';const width=label.getComputedTextLength();if(width>500)label.style.fontSize=(78*500/width)+'px';}
 function ensureRig(){if(rig||pending||host.hidden||disposed)return;pending=mountBlackCatRig(host).then(value=>{if(disposed){value.destroy();return;}rig=value;host.dataset.ready='true';refresh();rig.setSpeaking(speaking);}).catch(error=>{host.dataset.ready='error';console.warn('Black cat animation could not load:',error.message);}).finally(()=>{pending=null;});}
 function refresh(){host.hidden=!visible||hidden;host.dataset.size=preferences.size;
  const height=preferences.platform?(preferences.nameplate?1680:1530):1280;
  host.style.setProperty('--blackcat-ratio','1280 / '+height);pet.querySelector('svg').setAttribute('viewBox','0 0 1280 '+height);
  host.querySelector('#blackcat-platform').style.display=preferences.platform?'':'none';
  host.querySelector('#blackcat-nameplate').style.display=preferences.platform&&preferences.nameplate?'':'none';
  pet.setAttribute('aria-label',preferences.asleep?'Wake Black Cat. Drag to move.':'Open Black Cat controls. Drag to move.');
  if(!host.hidden){loadPetArtwork(host);fitName();ensureRig();}speech.hidden=true;
  rig?.update({...preferences,radio,visible:!host.hidden});place();
 }
 const announce=message=>{if(host.hidden||host.closest('.pet-studio')||preferences.asleep)return;window.PetSpeech?.say(host,message);};
 function click(){if(suppress){suppress=false;return;}if(preferences.asleep){preferences={...preferences,asleep:false};refresh();onChange({...preferences});}else onCustomize?.();}
 function pointerDown(e){if(e.button!==0||host.closest('.pet-studio'))return;const b=pet.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:b.left,top:b.top,moved:false};pet.setPointerCapture(e.pointerId);}
 function pointerMove(e){if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)<6)return;drag.moved=true;position={x:drag.left+dx,y:drag.top+dy};place();}
 function pointerEnd(e){if(!drag||e.pointerId!==drag.id)return;suppress=drag.moved;if(drag.moved)try{localStorage.setItem(positionKey(),JSON.stringify(position));}catch{}drag=null;}
 function keyDown(e){if(host.closest('.pet-studio'))return;const d={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[e.key];if(!d)return;e.preventDefault();const b=pet.getBoundingClientRect();position={x:b.left+d[0],y:b.top+d[1]};place();try{localStorage.setItem(positionKey(),JSON.stringify(position));}catch{}}
 function speechChanged(e){speaking=Boolean(e.detail?.speaking);rig?.setSpeaking(speaking);}
 pet.addEventListener('click',click);pet.addEventListener('pointerdown',pointerDown);pet.addEventListener('pointermove',pointerMove);pet.addEventListener('pointerup',pointerEnd);pet.addEventListener('pointercancel',pointerEnd);pet.addEventListener('keydown',keyDown);host.addEventListener('pet-speech-change',speechChanged);window.addEventListener('resize',place);
 return {host,play(name){rig?.play(name);if(['hello','greet','excited'].includes(name)&&!host.closest('.pet-studio'))announce('Hello! I’m '+preferences.name+'. Ready for a little curiosity?');},speak(){rig?.setSpeaking(true);},announce,
 update(value){if(account!==value.account){account=value.account;position=null;hidden=false;rig?.reset();try{const stored=JSON.parse(localStorage.getItem(positionKey())||'null');if(Number.isFinite(stored?.x)&&Number.isFinite(stored?.y))position=stored;}catch{}}preferences={...blackcatDefaults(),...value.preferences};visible=value.visible;radio=value.radio;refresh();},
 show(){hidden=false;refresh();},hide(){hidden=true;speaking=false;rig?.setSpeaking(false);refresh();},reset(){position=null;try{localStorage.removeItem(positionKey());}catch{}place();},refresh,
 destroy(){disposed=true;rig?.destroy();pet.removeEventListener('click',click);pet.removeEventListener('pointerdown',pointerDown);pet.removeEventListener('pointermove',pointerMove);pet.removeEventListener('pointerup',pointerEnd);pet.removeEventListener('pointercancel',pointerEnd);pet.removeEventListener('keydown',keyDown);host.removeEventListener('pet-speech-change',speechChanged);window.removeEventListener('resize',place);host.remove();}
 };
};
