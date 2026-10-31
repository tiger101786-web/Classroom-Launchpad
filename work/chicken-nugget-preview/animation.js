/* Preview-only color test; rig-test.js preserves the approved motion and line widths. */
(async()=>{
 const host=document.querySelector('.pet'),status=document.querySelector('#animation-status');
 const motion=document.querySelector('#motion'),dance=document.querySelector('#dance'),sleep=document.querySelector('#sleep');
 let options={motion:!matchMedia('(prefers-reduced-motion: reduce)').matches,visible:true,platform:true,asleep:false,radio:false};
 motion.checked=options.motion;
 try{
 const rig=await mountNuggetRig(host,{assetBase:'../../nugget-pet/',respectReducedMotion:false,onState(state,enabled){
  status.textContent=!enabled?'Motion paused':state==='sleep'?'Sleeping · gentle breathing and drifting Z’s':state==='dance'?'Dancing · happy eyes, a smile and floating notes':state==='idle'?'Idle · gentle breathing and natural blinks':state;
  document.querySelectorAll('[data-move]').forEach(b=>b.disabled=!enabled||state==='sleep');
  dance.disabled=!enabled||state==='sleep';
 }});
 const update=()=>{rig.update(options);dance.setAttribute('aria-pressed',String(options.radio));sleep.setAttribute('aria-pressed',String(options.asleep));sleep.textContent=options.asleep?'Wake up':'Sleep'};
 document.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>{options.radio=false;update();rig.play(b.dataset.move)});
 dance.onclick=()=>{options.radio=!options.radio;update()};
 sleep.onclick=()=>{options.asleep=!options.asleep;options.radio=false;update()};
 motion.onchange=()=>{options.motion=motion.checked;options.radio=false;update()};
 const canvas=host.querySelector('canvas');canvas.tabIndex=0;canvas.title='Click to say hello';canvas.onclick=()=>rig.play('hello');canvas.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();rig.play('hello')}};
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{options.motion=!e.matches;motion.checked=options.motion;update()});window.nuggetRig=rig;update();
 }catch(error){status.textContent='Animation could not load: '+error.message;console.error(error)}
})();
