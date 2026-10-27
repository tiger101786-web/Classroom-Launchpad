window.robloxDefaults=()=>({skin:'Classic',top:'skin',pants:'skin',name:'Buddy',headwear:'none',nameplate:true,platform:true,motion:true,size:'medium',asleep:false});
window.createRobloxPet=function(onChange,onCustomize){'use strict';
const host=document.createElement('div');host.className='roblox-companion';host.hidden=true;
host.innerHTML='<button type="button" class="pet-button" aria-label="Open Roblox Buddy controls"></button><div class="roblox-speech" role="status" hidden></div>';document.body.append(host);
const pet=host.querySelector('.pet-button'),bubble=host.querySelector('.roblox-speech'),ns='http://www.w3.org/2000/svg';
let prefs=robloxDefaults(),visible=false,hidden=false,radio=false,account='',position=null,drag=null,suppress=false;
const art='<image href="roblox-pet/approved-roblox.png" width="1107" height="1421"/>';
pet.innerHTML=`<svg viewBox="-80 0 1267 1810" aria-label="Animated Roblox Buddy with red and white chest logo"><defs>
<clipPath id="head-cut"><path d="M387 85H722V380Q720 435 552 435Q390 435 387 380Z"/></clipPath>
<clipPath id="torso-cut"><path d="M319 403H787L803 437V826L794 839L804 855V918H300V856L310 837L303 827V437Z"/></clipPath>
<clipPath id="left-arm-cut"><path d="M39 397H296L315 426L304 451V830L299 846L306 862V930H39Z"/></clipPath>
<clipPath id="right-arm-cut"><path d="M810 397H1075V932H797V862L805 845L798 831V448L789 426Z"/></clipPath>
<clipPath id="legs-cut"><rect x="276" y="910" width="558" height="485"/></clipPath>
<linearGradient id="yellow-patch"><stop stop-color="#e4ce26"/><stop offset=".48" stop-color="#f9df2a"/><stop offset="1" stop-color="#ffe83c"/></linearGradient>
<radialGradient id="blend"><stop offset=".78" stop-color="white"/><stop offset="1" stop-color="black"/></radialGradient>
<mask id="face-backing"><ellipse cx="552" cy="280" rx="126" ry="140" fill="url(#blend)"/></mask>
<clipPath id="live-mouth-clip"><path class="mouth-clip"/></clipPath>
<linearGradient id="blue"><stop stop-color="#134c86"/><stop offset=".45" stop-color="#258ee1"/><stop offset="1" stop-color="#0d3c74"/></linearGradient>
<linearGradient id="platform" x2="0" y2="1"><stop stop-color="#c5de70"/><stop offset="1" stop-color="#637a27"/></linearGradient>
<linearGradient id="deck" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#e2ef9c"/><stop offset="1" stop-color="#93b849"/></linearGradient>
<linearGradient id="fascia" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#3497dc"/><stop offset=".3" stop-color="#126cad"/><stop offset="1" stop-color="#12375d"/></linearGradient>
<linearGradient id="plateInset" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#307bb6"/><stop offset="1" stop-color="#15395c"/></linearGradient>
</defs>
<g class="platform">
<ellipse cx="552" cy="1538" rx="477" ry="30" fill="#101b29" opacity=".3"/>
<path d="M98 1390L214 1326H890L1006 1390V1489L912 1533H192L98 1489Z" fill="#102d48" stroke="#102336" stroke-width="8" stroke-linejoin="round"/>
<path d="M98 1390L192 1437H912L1006 1390V1478L912 1520H192L98 1478Z" fill="url(#fascia)"/>
<path d="M98 1390L192 1437V1520L98 1478Z" fill="#16466b"/>
<path d="M912 1437L1006 1390V1478L912 1520Z" fill="#0d3557"/>
<path d="M98 1390L214 1326H890L1006 1390L912 1437H192Z" fill="url(#deck)" stroke="#597b30" stroke-width="6" stroke-linejoin="round"/>
<path d="M116 1391L198 1430H906L989 1391M225 1336H878" fill="none" stroke="#e4f5b5" stroke-width="5" stroke-linecap="round"/>
<path d="M139 1389L222 1344H882L965 1389L901 1419H203Z" fill="none" stroke="#b9d879" stroke-width="3"/>
<path d="M206 1450H898M207 1505H897" fill="none" stroke="#59aee2" stroke-width="4"/>
<path d="M228 1464H876V1489H228Z" fill="#1c527b" stroke="#398bbd" stroke-width="3"/>
<path d="M509 1457H595V1498H509Z" fill="#e4c439" stroke="#ffed89" stroke-width="4"/><path d="M532 1468H572V1487H532Z" fill="#ba8c17"/>
</g>
<g class="legs" clip-path="url(#legs-cut)">${art}</g>
<g class="upper moving"><g class="arm left"><circle cx="293" cy="448" r="40" fill="#dfc81d"/><g clip-path="url(#left-arm-cut)">${art}</g></g><g class="arm right"><circle cx="810" cy="448" r="40" fill="#e9d21e"/><g clip-path="url(#right-arm-cut)">${art}</g></g>
<g class="skin-torso" clip-path="url(#torso-cut)">${art}</g><g class="head moving"><g clip-path="url(#head-cut)">${art}</g>
<image class="face-backing" href="roblox-pet/face-underlay.png" width="1107" height="1421" mask="url(#face-backing)"/>
<g class="gaze"><g class="eyes"><path class="eye-left" fill="#181b15" stroke="#181b15" stroke-width="3" stroke-linecap="round"/><path class="eye-right" fill="#181b15" stroke="#181b15" stroke-width="3" stroke-linecap="round"/></g>
<g class="mouth"><path class="happy-mouth" fill="#211e18" stroke="#211e18" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/><g clip-path="url(#live-mouth-clip)"><ellipse class="tongue" cx="552" cy="383" rx="28" ry="10" fill="#d67b76"/></g><ellipse class="sleep-mouth" cx="552" cy="345" rx="22" ry="30" fill="#29231c" style="display:none"/></g></g>
<g class="headset" style="display:none"><path d="M388 249C350 10 751 10 717 249" fill="none" stroke="#172638" stroke-width="32"/><path d="M388 249C350 10 751 10 717 249" fill="none" stroke="#43a8f0" stroke-width="14"/>${[374,704].map(x=>`<g><rect x="${x}" y="205" width="47" height="109" rx="20" fill="#172638" stroke="#71c9ff" stroke-width="6"/><rect x="${x+11}" y="219" width="25" height="80" rx="9" fill="#2677bd"/><path d="M${x+18} 279h12" stroke="#ffe449" stroke-width="5"/></g>`).join('')}</g></g></g>
<g class="notes" style="display:none"><g transform="translate(10 670) scale(1.15)"><text class="music-note" x="0" y="0" style="animation-delay:0s">♪</text></g><g transform="translate(1100 600) scale(1.15)"><text class="music-note" x="0" y="0" style="animation-delay:-0.6s">♫</text></g><g transform="translate(90 330) scale(1.15)"><text class="music-note" x="0" y="0" style="animation-delay:-1.2s">♫</text></g><g transform="translate(1040 290) scale(1.15)"><text class="music-note" x="0" y="0" style="animation-delay:-1.8s">♪</text></g></g><g class="zs pet-sleep-zs" style="display:none"><text x="760" y="200" font-size="65">z</text><text x="838" y="130" font-size="85">Z</text><text x="934" y="48" font-size="105">Z</text></g>
<g class="nameplate" transform="translate(552 1574) scale(1.3 1.16) translate(-552 -1574)">
<path d="M156 1585H948L990 1627V1724L948 1766H156L114 1724V1627Z" fill="#102d48" stroke="#0d2438" stroke-width="8" stroke-linejoin="round"/>
<path d="M156 1574H948L990 1616V1713L948 1755H156L114 1713V1616Z" fill="url(#blue)" stroke="#77c7f2" stroke-width="6" stroke-linejoin="round"/>
<path d="M230 1599H874L896 1621V1708L874 1730H230L208 1708V1621Z" fill="url(#plateInset)" stroke="#0b3253" stroke-width="5"/>
<path d="M238 1607H866M237 1723H867" stroke="#73b8e3" stroke-width="3" opacity=".7"/>
${[163,941].map(x=>`<g><rect x="${x-25}" y="1636" width="50" height="57" rx="9" fill="#926b19"/><rect x="${x-25}" y="1630" width="50" height="53" rx="9" fill="#e9c938" stroke="#fff098" stroke-width="3"/><circle cx="${x}" cy="1654" r="13" fill="#f6dd65" stroke="#c99f26" stroke-width="3"/></g>`).join('')}
<text id="plate-name" x="552" y="1668" dominant-baseline="middle" text-anchor="middle" style="font-size:92px">Buddy</text></g></svg>`;
// Namespace artwork references so they cannot collide with the other pets.
for(const el of pet.querySelectorAll('[id]')){const id=el.id;el.id='roblox-'+id;for(const node of pet.querySelectorAll('*'))for(const attr of [...node.attributes])if(attr.value.includes('url(#'+id+')'))node.setAttribute(attr.name,attr.value.replaceAll('url(#'+id+')','url(#roblox-'+id+')'));}
const $=s=>pet.querySelector(s.replace(/#([\w-]+)/g,'#roblox-$1')),motion={checked:true},idle={checked:true},reduced=matchMedia('(prefers-reduced-motion:reduce)');
const skinArt=window.mountRobloxSkins?.(pet);
const state={mode:'idle',action:null,start:performance.now(),nextIdle:performance.now()+4000,nextBlink:performance.now()+2500,blink:0,index:0};
const duration={hello:2800,happy:2200,blink:350,talk:2300,hands:2600,wobble:2600,look:2200,wake:4200};let raf=0,speechTimer;
const clamp=t=>Math.min(1,Math.max(0,t)),smooth=t=>{t=clamp(t);return t*t*(3-2*t)},moving=()=>visible&&!hidden&&!document.hidden&&motion.checked&&!reduced.matches;
function say(text){if(host.hidden||host.closest('.pet-studio')||state.mode==='sleep')return;bubble.textContent=text;bubble.hidden=false;clearTimeout(speechTimer);speechTimer=setTimeout(()=>bubble.hidden=true,3400)}
function update(){skinArt?.set(prefs,state.mode==='dance');pet.classList.toggle('asleep',state.mode==='sleep');pet.classList.toggle('still',!moving());host.dataset.state=state.mode;$('.headset').style.display=state.mode==='dance'||prefs.headwear==='headphones'?'':'none';$('.notes').style.display=state.mode==='dance'?'':'none';$('.zs').style.display=state.mode==='sleep'?'':'none';pet.setAttribute('aria-label',state.mode==='sleep'?'Wake '+prefs.name:'Open '+prefs.name+' controls. Drag to move.');if(host.hidden||host.closest('.pet-studio'))bubble.hidden=true;}
function play(name){if(name==='sleep'){state.mode='sleep';state.action=null;bubble.hidden=true;}else if(name==='wake'||state.mode==='sleep'){state.mode='idle';state.action=moving()?{name:'wake',start:performance.now()}:null;say('Good morning! Let’s build something.');}else if(name==='dance'){state.mode=state.mode==='dance'?'idle':'dance';state.action=null;if(state.mode==='dance')say('Block party!');}else if(duration[name]){state.mode='idle';state.action=moving()?{name,start:performance.now()}:null;if(name==='hello')say(['Hey, builder! Ready to explore a new level?','You’ve got this, builder!','Brick by brick, let’s build something awesome!'][state.index++%3]);}state.start=performance.now();state.nextIdle=state.start+5000;update();start();}
let lookAnimation=null,lookAction=null;
function setFaceAttribute(node,key,value){value=String(value);if(node.getAttribute(key)!==value)node.setAttribute(key,value);}
function tick(now){raf=0;if(document.hidden)return;let left=0,right=0,body=0,head=0,closed=0,happy=0,opening=0,yawn=0,gaze=0;
 const a=state.action,t=a?clamp((now-a.start)/duration[a.name]):0,env=Math.sin(Math.PI*t)**2;
 if(moving()){
 if(state.mode==='idle'&&!a&&now>state.nextBlink){state.blink=now;state.nextBlink=now+3200+Math.random()*2500;}if(state.blink){const b=(now-state.blink)/350;if(b<1)closed=Math.sin(b*Math.PI)**2;else state.blink=0;}
 if(a){switch(a.name){case'hello':left=(62+12*Math.sin(t*Math.PI*8))*env;right=-8*env;head=-3*env;happy=env;opening=.5*env;break;case'hands':left=(22+12*Math.sin(t*Math.PI*8))*env;right=-(22-12*Math.sin(t*Math.PI*8))*env;break;case'happy':happy=env;opening=.65*env;break;case'blink':closed=env;break;case'talk':opening=(.2+.7*Math.sin(t*Math.PI*6)**2)*env;break;case'wobble':body=2.5*Math.sin(t*Math.PI*4)*env;left=5*env;right=-5*env;break;case'look':head=5*Math.sin(t*Math.PI*2)*env;break;case'wake':closed=1-smooth((t-.45)/.4);yawn=Math.sin(Math.PI*clamp((t-.06)/.84))**2;opening=yawn;left=38*env;right=-38*env;break;}if(t>=1){state.action=null;state.nextIdle=now+4000;update();}}
 if(state.mode==='dance'){const p=(now-state.start)/1000*Math.PI*2/.8;left=24+15*Math.sin(p);right=-24+15*Math.sin(p);body=2*Math.sin(p);head=-3*Math.sin(p);happy=.8;opening=.6;}
 if(state.mode==='idle'&&!state.action&&idle.checked&&now>state.nextIdle)play(['hello','hands','happy','look','talk','wobble'][state.index++%6]);
 }
 if(moving()&&a?.name==='look'){head=0;gaze=-46*Math.sin(2*Math.PI*t)*Math.sin(Math.PI*t);}
 if(state.mode==='sleep'){closed=1;opening=1;}
 $('.arm.left').style.transform=`rotate(${left}deg)`;$('.arm.right').style.transform=`rotate(${right}deg)`;$('.upper').style.transform=`rotate(${body}deg)`;$('.head').style.transform=`rotate(${head}deg)`;
 // One live eye per side: morph the oval into a closed or smiling curve.
 // No cross-fade can expose an old raster eye underneath this backing plate.
 const gazeLayer=$('.gaze');
 if(moving()&&a?.name==='look'){
  if(lookAction!==a){lookAnimation?.cancel();lookAction=a;
   lookAnimation=gazeLayer.animate([[0,0,0],[.18,-34,-2],[.32,-29,-1],[.62,38,-3],[.78,32,-1],[1,0,0]].map(([offset,x,y])=>({offset,transform:`translate3d(${x}px,${y}px,0)`,easing:'cubic-bezier(.22,.61,.36,1)'})),{duration:duration.look,easing:'linear'});
   lookAnimation.currentTime=Math.max(0,now-a.start);
  }
 }else{lookAnimation?.cancel();lookAnimation=null;lookAction=null;}
 for(const [side,cx] of [['left',519],['right',584]]){
  const squeeze=Math.max(closed,happy),height=31*(1-squeeze),curve=closed>=happy?7*closed:-17*happy;
  setFaceAttribute($(`.eye-${side}`),'d',`M${cx-12} 219C${cx-12} ${219-height+curve} ${cx+12} ${219-height+curve} ${cx+12} 219C${cx+12} ${219+height+curve} ${cx-12} ${219+height+curve} ${cx-12} 219Z`);
 }
 const asleep=state.mode==='sleep';$('.happy-mouth').style.display=asleep?'none':'';$('.tongue').style.display=asleep?'none':'';$('.sleep-mouth').style.display=asleep?'':'none';
 const mouthPath=`M494 324Q552 ${410-90*opening-10*yawn} 610 324Q552 ${410+20*opening+35*yawn} 494 324Z`;
 setFaceAttribute($('.happy-mouth'),'d',mouthPath);setFaceAttribute($('.mouth-clip'),'d',mouthPath);setFaceAttribute($('.tongue'),'opacity',smooth((opening-.15)/.5));setFaceAttribute($('.tongue'),'cy',383+17*yawn);
 if(state.mode==='sleep'){const p=now/1000*Math.PI*2/2.8,breath=moving()?Math.sin(p):0,snore=moving()?.5-Math.asin(.98*Math.cos(p))/(2*Math.asin(.98)):0;$('.upper').style.transform=`translateY(${4*breath}px) rotate(${.25*breath}deg)`;$('.sleep-mouth').style.transform=`scaleY(${.18+.82*snore})`;$('.zs').style.transform='';}
 if(moving())raf=requestAnimationFrame(tick);
}
function start(){cancelAnimationFrame(raf);raf=0;tick(performance.now())}
function place(){if(host.hidden||host.closest('.pet-studio'))return;const b=pet.getBoundingClientRect();host.style.left=Math.max(8,Math.min(position?.x??innerWidth-b.width-34,innerWidth-b.width-8))+'px';host.style.top=Math.max(8,Math.min(position?.y??innerHeight*.48-90,innerHeight-b.height-8))+'px';}
const positionKey=()=>'roblox-position:'+account;
function remember(){try{localStorage.setItem(positionKey(),JSON.stringify(position))}catch{}}
function render(){host.hidden=!visible||hidden;host.dataset.size=prefs.size;motion.checked=prefs.motion;
 const wasSleeping=state.mode==='sleep';if(prefs.asleep&&!wasSleeping)play('sleep');else if(!prefs.asleep&&wasSleeping)play('wake');
 const dance=radio&&!prefs.asleep&&moving();if(dance&&state.mode!=='dance'){state.action=null;state.mode='dance';state.start=performance.now();say('Block party!');}else if(!dance&&state.mode==='dance')state.mode='idle';
 $('.platform').style.display=prefs.platform?'':'none';$('.nameplate').style.display=prefs.nameplate&&prefs.platform?'':'none';
 const label=$('#plate-name');label.textContent=prefs.name||'Buddy';label.style.fontSize='92px';if(!host.hidden)for(let i=0;i<5&&label.getComputedTextLength()>620;i++)label.style.fontSize=(parseFloat(label.style.fontSize)*615/label.getComputedTextLength())+'px';
 if(!moving())state.action=null;update();place();start();}
pet.onclick=()=>{if(suppress){suppress=false;return}if(prefs.asleep){prefs.asleep=false;render();onChange({...prefs})}else onCustomize?.()};
pet.addEventListener('pointerdown',e=>{if(e.button!==0||host.closest('.pet-studio'))return;const b=pet.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:b.left,top:b.top,moved:false};suppress=false;pet.setPointerCapture(e.pointerId)});
pet.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)<6)return;drag.moved=true;bubble.hidden=true;position={x:drag.left+dx,y:drag.top+dy};place()});
function end(e){if(!drag||drag.id!==e.pointerId)return;suppress=drag.moved;if(drag.moved)remember();drag=null}pet.addEventListener('pointerup',end);pet.addEventListener('pointercancel',end);
pet.addEventListener('keydown',e=>{if(host.closest('.pet-studio'))return;const d={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[e.key];if(d){e.preventDefault();const b=pet.getBoundingClientRect();position={x:b.left+d[0],y:b.top+d[1]};place();remember()}});
reduced.addEventListener('change',render);window.addEventListener('resize',place);document.addEventListener('visibilitychange',()=>{state.action=null;state.nextIdle=performance.now()+4000;render()});
return {host,play(action){if(prefs.asleep||!moving())return;play(({excited:'hello',greet:'hello',mouth:'talk',squish:'wobble'})[action]||action)},update(value){if(account!==value.account){account=value.account;hidden=false;position=null;state.mode='idle';state.action=null;state.nextIdle=performance.now()+4000;try{const p=JSON.parse(localStorage.getItem(positionKey())||'null');if(Number.isFinite(p?.x)&&Number.isFinite(p?.y))position=p}catch{}}visible=value.visible;radio=value.radio;prefs={...robloxDefaults(),...value.preferences};render()},show(){hidden=false;render()},hide(){hidden=true;render()},reset(){position=null;try{localStorage.removeItem(positionKey())}catch{}place()},refresh:render};
};
