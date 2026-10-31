/* Approved preview and Pet Studio use the same renderer and facial colors. */
(async()=>{
 const host=document.querySelector('.pet'),status=document.querySelector('#animation-status');
 const motion=document.querySelector('#motion'),dance=document.querySelector('#dance'),sleep=document.querySelector('#sleep');
 let options={skin:'Golden',motion:!matchMedia('(prefers-reduced-motion: reduce)').matches,visible:true,platform:true,asleep:false,radio:false};
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
 const skin=document.querySelector('#skin');
 Object.keys(nuggetSkins).forEach(name=>skin.add(new Option(name,name)));
 skin.onchange=()=>{options.skin=skin.value;update();document.querySelector('#dip-label').textContent=nuggetSkins[skin.value].dip+' dip'};
 skin.value=options.skin;skin.onchange();
 const accessory=document.querySelector('#basket-accessory'),accessoryStatus=document.querySelector('#accessory-status');
 Object.entries({none:'No basket accessory','french-fries':'French fries','waffle-fries':'Waffle fries'}).forEach(([value,label])=>accessory.add(new Option(label,value)));
 accessory.onchange=async()=>{
  options.basketAccessory=accessory.value;update();
  accessoryStatus.textContent=accessory.value==='none'?'Original basket.':accessory.selectedOptions[0].text+' · shared Pet Studio artwork';
 };
 accessory.value='french-fries';await accessory.onchange();
 const theme=document.querySelector('#basket-theme'),themeStatus=document.querySelector('#theme-status');
 Object.entries(nuggetThemePreview.labels).forEach(([value,label])=>theme.add(new Option(label,value)));
 theme.onchange=async()=>{
  themeStatus.textContent='Loading full-resolution basket…';
  try{const name=await nuggetThemePreview.select(theme.value);host.dataset.basketTheme=name;rig.render();accessory.disabled=name!=='none';themeStatus.textContent=name==='none'?'Original basket and skin-matched sauce.':nuggetThemePreview.labels[name]+' · complete themed basket · preview only';}
  catch(error){themeStatus.textContent=error.message}
 };
 theme.value='mcdonalds';await theme.onchange();
 }catch(error){status.textContent='Animation could not load: '+error.message;console.error(error)}
})();
