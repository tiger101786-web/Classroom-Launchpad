window.nyanDefaults=()=>({skin:'Classic',name:'Nyan Cat',size:'medium',headwear:'none',motion:true,asleep:false,nameplate:true});
window.createNyanPet=function(onChange,onCustomize){
 const host=document.createElement('div');
 host.className='nyan-companion';host.hidden=true;
 host.innerHTML='<canvas width="166" height="76" aria-hidden="true"></canvas><button type="button" class="pet-button" aria-label="Open Nyan Cat controls. Drag to move."></button><span class="nyan-name"></span><div class="nyan-speech" hidden></div>';
 document.body.append(host);
 const pet=host.querySelector('button'),canvas=host.querySelector('canvas'),label=host.querySelector('.nyan-name');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const actions={hello:1,greet:1,excited:1,blink:2,happy:3,talk:4,ears:5,paw:6,tail:7,nose:8,wobble:9,wake:11};
 const durations=[0,2.8,.6,2.5,4,2.1,2.6,2.8,2,2.5,0,3.8];
 let account='',position=null,drag=null,suppress=false,preferences=nyanDefaults(),radio=false,speaking=false;
 let visible=false,hidden=false,mode=0,start=0,frameId=0,last=-Infinity;
 const positionKey=()=> 'nyan-position:'+account;
 function place(){if(host.hidden||host.closest('.pet-studio'))return;const b=host.getBoundingClientRect();host.style.left=Math.max(8,Math.min(position?.x??innerWidth-b.width-34,innerWidth-b.width-8))+'px';host.style.top=Math.max(8,Math.min(position?.y??innerHeight*.48-90,innerHeight-b.height-8))+'px';}
 function pointerDown(e){if(e.button!==0||host.closest('.pet-studio'))return;const b=host.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:b.left,top:b.top,moved:false};pet.setPointerCapture(e.pointerId);}
 function pointerMove(e){if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)<6)return;drag.moved=true;position={x:drag.left+dx,y:drag.top+dy};place();}
 function pointerEnd(e){if(!drag||e.pointerId!==drag.id)return;suppress=drag.moved;if(drag.moved)try{localStorage.setItem(positionKey(),JSON.stringify(position));}catch{}drag=null;}
 function keyDown(e){if(host.closest('.pet-studio'))return;const d={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[e.key];if(!d)return;e.preventDefault();const b=host.getBoundingClientRect();position={x:b.left+d[0],y:b.top+d[1]};place();try{localStorage.setItem(positionKey(),JSON.stringify(position));}catch{}}

 function draw(now){
   frameId=0;if(host.hidden||document.hidden)return;
   const animate=preferences.motion&&!motion.matches;
   if(now-last>=60||!animate){
     if(mode&&now-start>=durations[mode]*1000)mode=0;
     const state=preferences.asleep?10:animate&&(speaking||mode||radio)?(speaking?4:mode||12):0;
     drawNyanCat(canvas,state,animate?(now-start)/1000:0,animate?now:0,!!host.closest('.pet-studio'),preferences.headwear==='headphones'||radio);
     last=now;
   }
   if(animate)frameId=requestAnimationFrame(draw);
 }
 function refresh(){
   host.hidden=!visible||hidden;host.dataset.size=preferences.size;host.dataset.state=preferences.asleep?"sleep":"awake";label.textContent=preferences.name;label.hidden=!preferences.nameplate;
   pet.setAttribute('aria-label',preferences.asleep?'Wake Nyan Cat. Drag to move.':'Open Nyan Cat controls. Drag to move.');
   cancelAnimationFrame(frameId);last=-Infinity;draw(performance.now());place();
 }
 function play(name){if(actions[name]){mode=actions[name];start=performance.now();}if(['hello','excited','greet'].includes(name)&&!host.closest('.pet-studio'))window.PetSpeech?.say(host,'Nyan! Sending a rainbow your way!');}
 function click(){if(suppress){suppress=false;return;}if(preferences.asleep){onChange({...preferences,asleep:false});}else onCustomize?.();}
 function speech(e){speaking=!!e.detail?.speaking;}
 pet.addEventListener('click',click);pet.addEventListener('pointerdown',pointerDown);pet.addEventListener('pointermove',pointerMove);pet.addEventListener('pointerup',pointerEnd);pet.addEventListener('pointercancel',pointerEnd);pet.addEventListener('keydown',keyDown);
 host.addEventListener('pet-speech-change',speech);window.addEventListener('resize',place);document.addEventListener('visibilitychange',refresh);motion.addEventListener('change',refresh);
 return {host,play,refresh,update(value){
   if(account!==value.account){account=value.account;position=null;mode=0;hidden=false;try{const stored=JSON.parse(localStorage.getItem(positionKey()));if(Number.isFinite(stored?.x)&&Number.isFinite(stored?.y))position=stored;}catch{}}
   const waking=visible&&preferences.asleep&&!value.preferences?.asleep;
   preferences={...nyanDefaults(),...value.preferences};visible=value.visible;radio=value.radio;
   if(!visible){speaking=false;mode=0;}else if(waking)play('wake');refresh();
 },show(){hidden=false;refresh();},hide(){hidden=true;refresh();},reset(){position=null;try{localStorage.removeItem(positionKey());}catch{}place();},
 destroy(){cancelAnimationFrame(frameId);window.removeEventListener('resize',place);document.removeEventListener('visibilitychange',refresh);motion.removeEventListener('change',refresh);host.remove();}};
};
