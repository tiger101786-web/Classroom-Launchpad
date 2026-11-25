window.createEvergreenPet=function(onChange,onCustomize){
 const host=document.createElement('div');
 host.className='evergreen-companion';host.hidden=true;
 host.innerHTML='<canvas width="600" height="810" aria-hidden="true"></canvas><button type="button" class="pet-button" aria-label="Open Evergreen controls. Drag to move."></button><span class="evergreen-name"><svg viewBox="0 0 680 180" aria-hidden="true"><image href="evergreen-pet/nameplate.webp" x="7" y="2" width="666" height="176" preserveAspectRatio="none"/><text x="340" text-anchor="middle" fill="#fff2cb" font-family="ColtOxanium,serif" font-weight="700" letter-spacing="3" stroke="#32190c" stroke-width="1.8" paint-order="stroke"></text></svg></span><div class="evergreen-speech" hidden></div>';
 document.body.append(host);
 const pet=host.querySelector('button'),canvas=host.querySelector('canvas'),label=host.querySelector('.evergreen-name');
 const lettering=label.querySelector('text'),fitName=window.fitColtNameplateText(lettering,90);
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const durations={hello:3,blink:.55,happy:2.8,talk:4,curious:3,crown:2,wave:2.8,swish:3,twitch:1.8,wobble:2.5,wake:3.5};
 const render=createEvergreenRenderer(canvas,refresh);
 let account='',position=null,drag=null,suppress=false,preferences=evergreenDefaults(),radio=false,speaking=false;
 let visible=false,hidden=false,mode=0,start=0,frameId=0;
 const positionKey=()=> 'evergreen-position:'+account;
 function place(){if(host.hidden||host.closest('.pet-studio'))return;const b=host.getBoundingClientRect();host.style.left=Math.max(8,Math.min(position?.x??innerWidth-b.width-34,innerWidth-b.width-8))+'px';host.style.top=Math.max(8,Math.min(position?.y??innerHeight*.48-90,innerHeight-b.height-8))+'px';}
 function pointerDown(e){if(e.button!==0||host.closest('.pet-studio'))return;const b=host.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:b.left,top:b.top,moved:false};pet.setPointerCapture(e.pointerId);}
 function pointerMove(e){if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)<6)return;drag.moved=true;position={x:drag.left+dx,y:drag.top+dy};place();}
 function pointerEnd(e){if(!drag||e.pointerId!==drag.id)return;suppress=drag.moved;if(drag.moved)try{localStorage.setItem(positionKey(),JSON.stringify(position));}catch{}drag=null;}
 function keyDown(e){if(host.closest('.pet-studio'))return;const d={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[e.key];if(!d)return;e.preventDefault();const b=host.getBoundingClientRect();position={x:b.left+d[0],y:b.top+d[1]};place();try{localStorage.setItem(positionKey(),JSON.stringify(position));}catch{}}

 function draw(now){
   frameId=0;if(host.hidden||document.hidden)return;
   const animate=preferences.motion&&!motion.matches;
   if(mode&&now-start>=durations[mode]*1000)mode=0;
   const state=preferences.asleep?'sleep':!animate?'idle':speaking?'talk':mode||(radio?'dance':'idle');
   render(state,animate?(now-start)/1000:0.65,preferences);
   if(animate)frameId=requestAnimationFrame(draw);
 }
 function refresh(){
   host.dataset.topper=preferences.topper;
   host.dataset.skirt=preferences.skirt;
   host.hidden=!visible||hidden;host.dataset.size=preferences.size;host.dataset.state=preferences.asleep?"sleep":"awake";label.hidden=!preferences.nameplate;
   lettering.textContent=preferences.name;label.setAttribute("aria-label",preferences.name+" nameplate");
   if(!host.hidden&&!label.hidden)fitName();
   pet.setAttribute('aria-label',preferences.asleep?'Wake Evergreen. Drag to move.':'Open Evergreen controls. Drag to move.');
   cancelAnimationFrame(frameId);draw(performance.now());place();
 }
 function play(name){if(['excited','greet'].includes(name))name='hello';if(durations[name]){mode=name;start=performance.now();}if(['hello','excited','greet'].includes(name)&&!host.closest('.pet-studio'))window.PetSpeech?.say(host,'Season’s greetings, friend!');}
 function click(){if(suppress){suppress=false;return;}if(preferences.asleep){onChange({...preferences,asleep:false});}else onCustomize?.();}
 function speech(e){speaking=!!e.detail?.speaking;}
 pet.addEventListener('click',click);pet.addEventListener('pointerdown',pointerDown);pet.addEventListener('pointermove',pointerMove);pet.addEventListener('pointerup',pointerEnd);pet.addEventListener('pointercancel',pointerEnd);pet.addEventListener('keydown',keyDown);
 host.addEventListener('pet-speech-change',speech);window.addEventListener('resize',place);document.addEventListener('visibilitychange',refresh);motion.addEventListener('change',refresh);
 return {host,play,refresh,update(value){
   if(account!==value.account){account=value.account;position=null;mode=0;hidden=false;try{const stored=JSON.parse(localStorage.getItem(positionKey()));if(Number.isFinite(stored?.x)&&Number.isFinite(stored?.y))position=stored;}catch{}}
   const waking=visible&&preferences.asleep&&!value.preferences?.asleep;
   preferences={...evergreenDefaults(),...value.preferences};visible=value.visible;radio=value.radio;
   if(!visible){speaking=false;mode=0;}else if(waking)play('wake');refresh();
 },show(){hidden=false;refresh();},hide(){hidden=true;refresh();},reset(){position=null;try{localStorage.removeItem(positionKey());}catch{}place();},
 destroy(){cancelAnimationFrame(frameId);window.removeEventListener('resize',place);document.removeEventListener('visibilitychange',refresh);motion.removeEventListener('change',refresh);host.remove();}};
};
