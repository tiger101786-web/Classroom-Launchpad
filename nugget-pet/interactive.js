window.nuggetDefaults=()=>({skin:'Golden',name:'Nugget',nameplate:true,platform:true,motion:true,size:'medium',asleep:false,headwear:'none'});
window.nuggetMarkup=()=>'<img class="nugget-fallback" src="nugget-pet/nugget-concept.png" alt="Crispy chicken nugget in a red basket"><span id="nugget-pet-name">Nugget</span>';
window.createNuggetPet=function(onChange,onCustomize){
 const host=document.createElement('div');host.className='nugget-companion';host.hidden=true;
 host.innerHTML='<button type="button" class="pet-button" aria-label="Open Chicken Nugget controls">'+nuggetMarkup()+'</button><div id="nugget-speech" class="nugget-speech" role="status" hidden></div>';
 document.body.append(host);
 let preferences=nuggetDefaults(),visible=false,hidden=false,radio=false,account='',position=null,drag=null,suppress=false,rig=null;
 const pet=host.querySelector('.pet-button'),positionKey=()=> 'nugget-position:'+account;
 function place(){if(host.hidden||host.closest('.pet-studio'))return;const b=pet.getBoundingClientRect();host.style.left=Math.max(8,Math.min(position?.x??innerWidth-b.width-34,innerWidth-b.width-8))+'px';host.style.top=Math.max(8,Math.min(position?.y??innerHeight*.48-90,innerHeight-b.height-8))+'px';}
 function remember(){try{localStorage.setItem(positionKey(),JSON.stringify(position))}catch{}}
 function refresh(){host.hidden=!visible||hidden;host.dataset.size=preferences.size;const label=host.querySelector('#nugget-pet-name');label.textContent=preferences.name;label.style.fontSize='';label.style.display=preferences.platform&&preferences.nameplate?'':'none';fitName();host.querySelector('.nugget-speech').hidden=true;rig?.update({...preferences,radio,visible:!host.hidden});place();}
 function fitName(){const label=host.querySelector('#nugget-pet-name');label.style.fontSize=(pet.clientWidth*.075)+'px';while(label.scrollWidth>label.clientWidth&&parseFloat(label.style.fontSize)>6)label.style.fontSize=(parseFloat(label.style.fontSize)-1)+'px'}
 new ResizeObserver(fitName).observe(pet);
 pet.onclick=()=>{if(suppress){suppress=false;return}if(preferences.asleep){preferences={...preferences,asleep:false};refresh();onChange({...preferences})}else onCustomize?.()};
 pet.addEventListener('pointerdown',e=>{if(e.button!==0||host.closest('.pet-studio'))return;const b=pet.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:b.left,top:b.top,moved:false};pet.setPointerCapture(e.pointerId)});
 pet.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)<6)return;drag.moved=true;position={x:drag.left+dx,y:drag.top+dy};host.querySelector('.nugget-speech').hidden=true;place()});
 function end(e){if(!drag||drag.id!==e.pointerId)return;suppress=drag.moved;if(drag.moved)remember();drag=null}
 pet.addEventListener('pointerup',end);pet.addEventListener('pointercancel',end);
 pet.addEventListener('keydown',e=>{if(host.closest('.pet-studio'))return;const d={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[e.key];if(!d)return;e.preventDefault();const b=pet.getBoundingClientRect();position={x:b.left+d[0],y:b.top+d[1]};place();remember()});
 window.addEventListener('resize',place);
 mountNuggetRig(pet,{onState:state=>host.dataset.state=state}).then(value=>{rig=value;host.dataset.ready='true';refresh()}).catch(error=>{host.dataset.ready='error';console.warn('Nugget animation could not load:',error.message)});
 return {host,play(name){if(!host.hidden&&!preferences.asleep&&preferences.motion)rig?.play(({excited:'hello',greet:'hello',mouth:'talk'})[name]||name)},update(value){if(account!==value.account){account=value.account;position=null;hidden=false;rig?.reset();try{const p=JSON.parse(localStorage.getItem(positionKey())||'null');if(Number.isFinite(p?.x)&&Number.isFinite(p?.y))position=p}catch{}}preferences={...nuggetDefaults(),...value.preferences};visible=value.visible;radio=value.radio;refresh()},show(){hidden=false;refresh()},hide(){hidden=true;refresh()},reset(){position=null;try{localStorage.removeItem(positionKey())}catch{}place()},refresh};
};
