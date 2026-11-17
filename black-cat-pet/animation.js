window.blackcatDefaults=()=>({skin:'Black',name:'Midnight',nameplate:true,platform:true,motion:true,size:'medium',asleep:false,headwear:'none'});
window.blackcatMarkup=()=>`<svg viewBox="0 0 1280 1680" role="img" aria-label="Cat companion"><image id="blackcat-platform" href="black-cat-pet/cat-platform.png" x="0" y="1080" width="1280" height="425"/><image class="blackcat-fallback" href="black-cat-pet/black-cat.png" width="1280" height="1280"/><foreignObject width="1280" height="1280"><canvas width="1536" height="1536" style="width:1280px;height:1280px;display:block"></canvas></foreignObject><g id="blackcat-headphones" visibility="hidden"><path d="M395 150C455 100 760 100 820 150" fill="none" stroke="#0c0b11" stroke-width="49"/><path d="M395 150C455 100 760 100 820 150" fill="none" stroke="#b18c57" stroke-width="29"/><path d="M395 150C455 100 760 100 820 150" fill="none" stroke="#f5d99b" stroke-width="3"/>${[395,820].map((x,i)=>`<g id="blackcat-earphone-${i}" transform="translate(${x} 150) rotate(${i?15:-15})"><rect x="-48" y="-80" width="96" height="160" rx="39" fill="#111015" stroke="#cfa66a" stroke-width="9"/><rect x="-31" y="-61" width="62" height="122" rx="24" fill="#412637"/><path d="M-10 -10L10 -18V20Q-6 36 -14 21Q-18 9 -3 7V-10" fill="#edcd93"/></g>`).join('')}</g><g id="blackcat-sleep-symbols" fill="#edcd93" font-family="Georgia,serif" font-weight="bold" opacity="0"><text x="890" y="230" font-size="77">z</text><text x="980" y="155" font-size="92">Z</text><text x="1090" y="80" font-size="105">Z</text></g><g id="blackcat-music-symbols" fill="#e8bb85" font-family="Georgia,serif" opacity="0"><text x="160" y="570" font-size="110">♪</text><text x="1020" y="480" font-size="100">♫</text><text x="180" y="860" font-size="95">♫</text><text x="1090" y="900" font-size="105">♪</text></g><g id="blackcat-nameplate"><image href="black-cat-pet/cat-nameplate.png" x="210" y="1385" width="860" height="285"/><text id="blackcat-pet-name" x="640" y="1545" text-anchor="middle" dominant-baseline="middle" fill="#f1d3a4" style="font:600 78px Georgia,serif;letter-spacing:1px">Midnight</text></g></svg>`;
// Keep only in-flight image loads; inactive decoded coats and GPU textures can be released.
const blackcatImageLoads=new Map();
function loadBlackcatSkin(skin){return Promise.all(['art','underlay','forelegs'].map(field=>{
 const url=skin[field];if(blackcatImageLoads.has(url))return blackcatImageLoads.get(url);
 const pending=(async()=>{const image=new Image();image.src=url;await image.decode();return image;})();
 blackcatImageLoads.set(url,pending);pending.then(()=>blackcatImageLoads.delete(url),()=>blackcatImageLoads.delete(url));return pending;
}));}
window.mountBlackCatRig=async function(host,initialSkin='Black'){
 const pet=host.querySelector('.pet-button'),$=selector=>host.querySelector(selector),canvas=pet.querySelector('canvas'),headphones=$('#blackcat-headphones'),zs=$('#blackcat-sleep-symbols'),notes=$('#blackcat-music-symbols');
 const durations={hello:2.5,happy:2.4,blink:.38,talk:4,ears:1.8,paw:1.65,tail:2.5,nose:1.6,wobble:2,wake:3.5};
 const state={mode:'idle',action:null,time:0,frames:0,nextIdle:5,nextBlink:2,blinkStart:-10,motion:true,idle:true,values:{}};
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v);};
 let options={...blackcatDefaults(),radio:false,visible:true},raf=0,last=0,disposed=false,index=0,speaking=false;
 let selectedSkin=Object.hasOwn(blackcatSkins,initialSkin)?initialSkin:'Black',loadingSkin=null,skinVersion=0;
 let renderer=createLaunchpadBlackCatRig(canvas,...await loadBlackcatSkin(blackcatSkins[selectedSkin]),blackcatSkins[selectedSkin]);
 host.dataset.skin=selectedSkin;
 function selectSkin(key){
  key=Object.hasOwn(blackcatSkins,key)?key:'Black';
  if(key===selectedSkin){if(loadingSkin){skinVersion++;loadingSkin=null;delete host.dataset.skinLoading;}return;}
  if(key===loadingSkin)return;
  const revision=++skinVersion;loadingSkin=key;host.dataset.skinLoading='true';delete host.dataset.skinError;
  loadBlackcatSkin(blackcatSkins[key]).then(images=>{
   if(disposed||revision!==skinVersion)return;
   renderer.destroy();renderer=createLaunchpadBlackCatRig(canvas,...images,blackcatSkins[key]);
   selectedSkin=key;host.dataset.skin=key;host.querySelector('.blackcat-fallback').setAttribute('href',blackcatSkins[key].art);
   if(state.frames)renderer.draw(state.values);start();
  }).catch(error=>{if(!disposed&&revision===skinVersion){host.dataset.skinError='true';console.warn('Cat skin could not load:',error.message);}})
   .finally(()=>{if(revision===skinVersion){loadingSkin=null;delete host.dataset.skinLoading;}});
 }

 function updateUI(){host.dataset.state=state.mode;pet.dataset.state=state.mode;pet.dataset.action=state.action?.name||'';}
 function start(){if(!raf&&!disposed&&!document.hidden&&!host.hidden&&options.visible)raf=requestAnimationFrame(tick);}
 function tick(now){raf=0;if(disposed||document.hidden||!options.visible||host.hidden)return;const dt=last?Math.min((now-last)/1000,.06):0;last=now;const moving=state.motion&&!reduce.matches;if(moving)state.time+=dt;const time=state.time;
if(state.action&&time-state.action.start>=durations[state.action.name]){state.action=null;if(options.radio&&!options.asleep)state.mode='dance';state.nextIdle=time+3;updateUI();}
if(moving&&state.idle&&state.mode==='idle'&&!state.action&&time>state.nextIdle){const n=['ears','tail','happy','nose','paw'][index++%5];state.action={name:n,start:time};state.nextIdle=time+8;updateUI();}
if(moving&&state.mode!=='sleep'&&time>state.nextBlink){state.blinkStart=time;state.nextBlink=time+3.5+Math.random()*3;}
const a=state.action,name=a?.name,t=a?clamp((time-a.start)/durations[name]):0,env=Math.sin(t*Math.PI)**2;let smile=0,close=0,mouth=0,ear=0,paw=0,right=0,tail=0,nose=0,wobble=0,stretch=0;const bt=(time-state.blinkStart)/.34;if(bt>=0&&bt<=1)close=Math.sin(bt*Math.PI)**2;
if(name==='blink')close=Math.sin(t*Math.PI)**2;if(name==='happy'||name==='hello'){smile=ease(t/.12)*(1-ease((t-.88)/.12));mouth=0;}if(name==='hello'||name==='paw')paw=1.25*env*(.82+.18*Math.sin(t*Math.PI*12));if(name==='ears'||name==='hello')ear=Math.sin(t*Math.PI*7)*env;if(name==='tail'||name==='hello')tail=Math.sin(t*Math.PI*8)*env;if(name==='nose')nose=Math.sin(t*Math.PI*10)*env;if(name==='wobble')wobble=Math.sin(t*Math.PI*8)*env;if(name==='talk'||name==='hello')mouth=(.28+.72*(.5-.5*Math.cos(t*Math.PI*24)))*ease(t/.08)*(1-ease((t-.92)/.08));if(name==='wake'){close=1-ease((t-.12)/.45);mouth=Math.sin(Math.PI*clamp((t-.08)/.7))**2;stretch=Math.sin(t*Math.PI)**2;ear=.4*Math.sin(t*12)*env;}
if(state.mode==='sleep'){close=1;mouth=.15+.5*(.5+.5*Math.sin(time*2*Math.PI/3.4));tail=.08*Math.sin(time);}if(state.mode==='dance'){wobble=.65*Math.sin(time*8);smile=.75;mouth=.25+.1*Math.sin(time*12);ear=.4*Math.sin(time*9);tail=.5*Math.sin(time*7);paw=.65*Math.max(0,Math.sin(time*5))**2;right=.65*Math.max(0,-Math.sin(time*5))**2;}
if(!moving){ear=paw=right=tail=nose=wobble=stretch=0;mouth=0;close=state.mode==='sleep'?1:name==='blink'?1:0;}const breath=moving?Math.sin(time*(state.mode==='sleep'?2*Math.PI/3.4:1.9)):0;
if(speaking&&state.mode!=='sleep'&&moving)mouth=.25+.75*(.5-.5*Math.cos(time*17));
state.values={breath,smile,close,mouth,ear,paw,right,tail,nose,wobble,stretch,wave:Math.sin(time*12),yawn:name==='wake',sleeping:state.mode==='sleep'};renderer.draw(state.values);state.frames++;pet.dataset.frames=String(state.frames);
headphones.setAttribute('visibility',!options.asleep&&(state.mode==='dance'||options.headwear==='headphones')?'visible':'hidden');headphones.setAttribute('transform',`translate(${wobble*1280*.017} ${-breath*1280*.003-stretch*1280*.012})`);[395,820].forEach((x,i)=>$('#blackcat-earphone-'+i).setAttribute('transform',`translate(${x+ear*20} ${150+(i?-1:1)*ear*16}) rotate(${i?15:-15})`));zs.setAttribute('opacity',state.mode==='sleep'?'1':'0');zs.setAttribute('transform',`translate(0 ${moving?-12-18*Math.sin(time*1.2):0})`);notes.setAttribute('opacity',state.mode==='dance'?'.9':'0');notes.setAttribute('transform',`translate(${wobble*12} ${moving?-20*Math.sin(time*2):0})`);
if(moving)start();}

 function play(name){name=({excited:'hello',greet:'hello',smile:'happy',mouth:'talk',shake:'wobble'})[name]||name;if(disposed||!options.visible||host.hidden||!options.motion||reduce.matches||options.asleep&&!['wake','sleep'].includes(name))return;
  if(name==='sleep'){state.mode='sleep';state.action=null;}else if(name==='dance'){state.mode=state.mode==='dance'?'idle':'dance';state.action=null;}else if(name==='idle'){state.mode='idle';state.action=null;}else if(durations[name]){state.mode='idle';state.action={name,start:state.time};}else return;
  state.nextIdle=state.time+6;updateUI();start();
 }
 function update(value){const wasSleeping=options.asleep;options={...blackcatDefaults(),...value};state.motion=options.motion;
  if(options.visible)selectSkin(options.skin);
  if(options.asleep){state.mode='sleep';state.action=null;speaking=false;}
  else if(wasSleeping){state.mode='idle';state.action={name:'wake',start:state.time};}
  else if(!state.action||state.action.name!=='wake'){if(options.radio){state.mode='dance';state.action=null;}else if(state.mode==='dance')state.mode='idle';}
  if(!options.motion||reduce.matches){state.action=null;state.mode=options.asleep?'sleep':'idle';}
  cancelAnimationFrame(raf);raf=0;last=0;updateUI();start();
 }
 function visibility(){cancelAnimationFrame(raf);raf=0;last=0;if(!document.hidden)start();}
 function reduceChanged(){update(options);}
 document.addEventListener('visibilitychange',visibility);reduce.addEventListener('change',reduceChanged);
 return {play,update,setSpeaking(value){speaking=Boolean(value);start();},reset(){state.mode='idle';state.action=null;state.time=0;state.nextIdle=5;state.blinkStart=-10;state.nextBlink=2;speaking=false;},getState:()=>({...state,rig:renderer.getState()}),destroy(){disposed=true;skinVersion++;cancelAnimationFrame(raf);document.removeEventListener('visibilitychange',visibility);reduce.removeEventListener('change',reduceChanged);renderer.destroy();}};
};
