/* One viewport-positioned speech surface; each pet retains its own speech timing. */
(()=>{'use strict';
const types={
 'robo-companion':['colt','ROBO-COLT','New spot. Same Colt energy!'],
 'dumpling-companion':['squishy','SQUISHY DUMPLING','New spot, same squish! This basket feels right at home.'],
 'gummy-companion':['gummy','GUMMY BEAR','New spot! Just letting my jelly settle.'],
 'eagle-companion':['eagle','BALD EAGLE','New perch secured. What a view from here!'],
 'labubu-companion':['labubu','LABUBU','New hideout! A little mischief belongs here.'],
 'roblox-companion':['roblox','ROBLOX BUDDY','New spawn point! Time to build something great.'],
 'highland-companion':['highland','HIGHLAND COW','A new patch of pasture! Hooves down, horns up.']
};
const selector=Object.keys(types).map(c=>'.'+c).join(','),seen=new WeakSet();let bubble,active,timer,frame,drag;
function info(host){return types[Object.keys(types).find(c=>host.classList.contains(c))]}
function allowed(host){const pet=host.querySelector('.pet-button');return host.isConnected&&!host.hidden&&!document.hidden&&!host.closest('.pet-studio')&&host.getClientRects().length&&host.dataset.state!=='sleep'&&!pet?.matches('.asleep,.sleeping')}
function hide(){clearTimeout(timer);cancelAnimationFrame(frame);active=null;bubble.hidden=true}
function place(){if(!active)return;const {host}=active;if(!allowed(host)){hide();return}const p=(host.querySelector('.pet-button')||host).getBoundingClientRect(),w=bubble.offsetWidth,h=bubble.offsetHeight;
 const left=Math.max(10,Math.min(p.left+p.width/2-w/2,innerWidth-w-10));
 const below=p.top<h+26;const top=Math.max(10,Math.min(below?p.bottom+14:p.top-h-14,innerHeight-h-10));
 bubble.dataset.side=below?'below':'above';bubble.style.left=left+'px';bubble.style.top=top+'px';bubble.style.setProperty('--tail-x',Math.max(20,Math.min(w-20,p.left+p.width/2-left))+'px');
 frame=requestAnimationFrame(place);
}
function show(host,text,source=null){if(!allowed(host)||!text)return;clearTimeout(timer);cancelAnimationFrame(frame);active={host,source};const [kind,label]=info(host);bubble.dataset.pet=kind;bubble.querySelector('strong').textContent=label;bubble.querySelector('span').textContent=text;bubble.hidden=false;place();timer=setTimeout(hide,4200)}
function register(host){if(seen.has(host)||!info(host))return;const source=host.querySelector('.dumpling-speech,.gb-speech,.eagle-speech,.labubu-speech,.roblox-speech,.highland-speech');if(!source)return;seen.add(host);source.classList.add('pet-native-speech');
 const sync=()=>{if(source.hidden){if(active?.source===source)hide();return}const text=(source.querySelector('.dumpling-speech-message,.gb-speech-message,.speech-message')||source).textContent.trim();show(host,text,source)};
 new MutationObserver(sync).observe(source,{attributes:true,attributeFilter:['hidden'],childList:true,characterData:true,subtree:true});sync();
}
function start(){bubble=document.createElement('div');bubble.className='pet-chat';bubble.hidden=true;bubble.setAttribute('role','status');bubble.setAttribute('aria-live','polite');bubble.setAttribute('aria-atomic','true');bubble.innerHTML='<strong></strong><span></span>';document.body.append(bubble);document.querySelectorAll(selector).forEach(register);
 new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(n=>{if(n.nodeType!==1)return;if(n.matches(selector))register(n);n.querySelectorAll(selector).forEach(register)}))).observe(document.body,{childList:true});
 document.addEventListener('pointerdown',e=>{const host=e.target.closest(selector);if(!host||host.closest('.pet-studio')||e.button!==0||!e.target.closest('.pet-button'))return;drag={host,id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};if(active?.host===host)hide()},true);
 document.addEventListener('pointermove',e=>{if(drag?.id===e.pointerId&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>6)drag.moved=true},true);
 document.addEventListener('pointerup',e=>{if(drag?.id!==e.pointerId)return;const d=drag;drag=null;if(d.moved)setTimeout(()=>show(d.host,info(d.host)[2]),0)},true);
 document.addEventListener('pointercancel',()=>drag=null,true);document.addEventListener('visibilitychange',()=>{if(document.hidden)hide()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
