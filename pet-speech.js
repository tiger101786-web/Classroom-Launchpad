/* One viewport-positioned speech surface; each pet retains its own speech timing. */
(()=>{'use strict';
const types={
 'robo-companion':['colt','ROBO-COLT','New spot. Same Colt energy!'],
 'dumpling-companion':['squishy','SQUISHY DUMPLING','New spot, same squish! This basket feels right at home.'],
 'gummy-companion':['gummy','GUMMY BEAR','New spot! Just letting my jelly settle.'],
 'eagle-companion':['eagle','BALD EAGLE','New perch secured. What a view from here!'],
 'labubu-companion':['labubu','LABUBU','New hideout! A little mischief belongs here.'],
 'roblox-companion':['roblox','ROBLOX BUDDY','New spawn point! Time to build something great.'],
 'nugget-companion':['nugget','CHICKEN NUGGET','Fresh spot, same crunch! My basket feels right at home.'],
 'saber-companion':['saber','SABER-TOOTH TIGER','New territory claimed. These paws are staying put!'],
 'highland-companion':['highland','HIGHLAND COW','A new patch of pasture! Hooves down, horns up.']
};
const selector=Object.keys(types).map(c=>'.'+c).join(','),seen=new WeakSet();let bubble,active,timer,frame,drag;
function info(host){return types[Object.keys(types).find(c=>host.classList.contains(c))]}
function allowed(host,talk=false){const pet=host.querySelector('.pet-button');return host.isConnected&&!host.hidden&&!document.hidden&&!host.closest('.pet-studio')&&host.getClientRects().length&&(talk||host.dataset.state!=='sleep'&&!pet?.matches('.asleep,.sleeping'))}
function hide(){active?.host.dispatchEvent(new CustomEvent('pet-speech-change',{detail:{speaking:false}}));clearTimeout(timer);cancelAnimationFrame(frame);active=null;if(bubble){bubble.hidden=true;bubble.classList.remove('is-fading')}}
window.PetSpeech={say:(host,text)=>show(host,text,'conversation'),dismiss:()=>{if(active?.source==='conversation')hide()}};
function place(){if(!active)return;const {host,source}=active;if(!allowed(host,source==='conversation')){hide();return}const p=(host.querySelector('.pet-button')||host).getBoundingClientRect();
 const v=window.visualViewport,x=v?.offsetLeft||0,y=v?.offsetTop||0,vw=v?.width||innerWidth,vh=v?.height||innerHeight;
 bubble.style.maxWidth=Math.max(80,vw-20)+'px';bubble.style.maxHeight=Math.max(60,vh-20)+'px';const w=bubble.offsetWidth,h=bubble.offsetHeight;
 const left=Math.max(x+10,Math.min(p.left+p.width/2-w/2,x+vw-w-10));
 let below=p.top-y<h+26;
 const chat=document.querySelector('.pet-talk:not([hidden])')?.getBoundingClientRect();
 if(chat&&left<chat.right&&left+w>chat.left){const aboveTop=p.top-h-14,belowTop=p.bottom+14;
  const overlaps=top=>top<chat.bottom&&top+h>chat.top;
  if(!below&&overlaps(aboveTop)&&!overlaps(belowTop)&&belowTop+h<=y+vh-10)below=true;
  else if(below&&overlaps(belowTop)&&!overlaps(aboveTop)&&aboveTop>=y+10)below=false;
 }
 const top=Math.max(y+10,Math.min(below?p.bottom+14:p.top-h-14,y+vh-h-10));
 bubble.dataset.side=below?'below':'above';bubble.style.left=left+'px';bubble.style.top=top+'px';bubble.style.setProperty('--tail-x',Math.max(20,Math.min(w-20,p.left+p.width/2-left))+'px');
 frame=requestAnimationFrame(place);
}
function show(host,text,source=null){const talk=source==='conversation';if(!bubble||!info(host)||!allowed(host,talk)||!text||active?.source==='conversation'&&!talk)return;if(active?.host!==host)active?.host.dispatchEvent(new CustomEvent('pet-speech-change',{detail:{speaking:false}}));clearTimeout(timer);cancelAnimationFrame(frame);active={host,source};const [kind,label]=info(host);bubble.dataset.pet=kind;bubble.querySelector('strong').textContent=label;bubble.querySelector('span').textContent=text;bubble.classList.remove('is-fading');bubble.hidden=false;host.dispatchEvent(new CustomEvent('pet-speech-change',{detail:{speaking:true}}));place();bubble.dataset.conversation=String(talk);if(talk){timer=setTimeout(()=>host.dispatchEvent(new CustomEvent("pet-speech-change",{detail:{speaking:false}})),3000);return}const duration=4200;timer=setTimeout(()=>{bubble.classList.add('is-fading');timer=setTimeout(hide,250)},duration)}
function register(host){if(seen.has(host)||!info(host))return;const source=host.querySelector('.dumpling-speech,.gb-speech,.eagle-speech,.labubu-speech,.roblox-speech,.highland-speech,.saber-speech,.nugget-speech');if(!source)return;seen.add(host);source.classList.add('pet-native-speech');
 const sync=()=>{if(source.hidden){if(active?.source===source)hide();return}const text=(source.querySelector('.dumpling-speech-message,.gb-speech-message,.speech-message')||source).textContent.trim();show(host,text,source)};
 new MutationObserver(sync).observe(source,{attributes:true,attributeFilter:['hidden'],childList:true,characterData:true,subtree:true});sync();
}
function start(){bubble=document.createElement('div');bubble.className='pet-chat';bubble.hidden=true;bubble.setAttribute('role','status');bubble.setAttribute('aria-live','polite');bubble.setAttribute('aria-atomic','true');bubble.innerHTML='<strong></strong><span></span>';document.body.append(bubble);document.querySelectorAll(selector).forEach(register);
 bubble.tabIndex=0;bubble.title='Click to dismiss';bubble.addEventListener('click',hide);bubble.addEventListener('keydown',e=>{if(['Enter',' ','Escape'].includes(e.key)){e.preventDefault();hide()}});
 new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(n=>{if(n.nodeType!==1)return;if(n.matches(selector))register(n);n.querySelectorAll(selector).forEach(register)}))).observe(document.body,{childList:true});
 document.addEventListener('pointerdown',e=>{const host=e.target.closest?.(selector);if(!host||host.closest('.pet-studio')||e.button!==0||!e.target.closest?.('.pet-button'))return;drag={host,id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};if(active?.host===host&&active.source!=='conversation')hide()},true);
 document.addEventListener('pointermove',e=>{if(drag?.id===e.pointerId&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>6)drag.moved=true},true);
 document.addEventListener('pointerup',e=>{if(drag?.id!==e.pointerId)return;const d=drag;drag=null;if(d.moved)setTimeout(()=>show(d.host,info(d.host)[2]),0)},true);
 document.addEventListener('pointercancel',()=>drag=null,true);document.addEventListener('visibilitychange',()=>{if(document.hidden)hide()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
