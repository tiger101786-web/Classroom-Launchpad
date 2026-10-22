/* One approved candy artwork, eight enamel-free candy tints, shared animation geometry. */
window.gummyBearSkins={
 Cherry:{rgb:[1,0,0],accent:'#ed3853',description:'Classic translucent cherry-red gummy candy.'},
 Strawberry:{rgb:[1,.30,.52],accent:'#f77da4',description:'Rosy pink strawberry gummy candy.'},
 Orange:{rgb:[1,.42,.025],accent:'#f39b40',description:'Juicy orange gummy candy.'},
 Lemon:{rgb:[1,.84,.035],accent:'#ebd357',description:'Bright lemon-yellow gummy candy.'},
 'Green Apple':{rgb:[.24,.82,.07],accent:'#8ec956',description:'Fresh green apple gummy candy.'},
 Pineapple:{rgb:[1,.93,.69],accent:'#e9dbaa',description:'Pale golden-cream pineapple gummy candy.'},
 'Blue Raspberry':{rgb:[.075,.62,1],accent:'#62bdf1',description:'Translucent blue raspberry gummy candy.'},
 Grape:{rgb:[.61,.16,.88],accent:'#ba7be0',description:'Rich purple grape gummy candy.'}
};
window.gummyBearDefaults=()=>({skin:'Cherry',name:'Gummy',nameplate:true,motion:true,size:'medium',asleep:false});
window.createGummyBear=function(onChange,onCustomize){
 const ns='http://www.w3.org/2000/svg',host=document.createElement('div');host.className='gummy-companion';host.hidden=true;
 // Native SVG crops use the approved pixels rather than redrawing the character.
 const outline='M293 89C229 81 180 121 174 185C168 248 194 298 232 324L213 468C184 548 216 610 278 648C229 667 199 715 177 788L149 891C133 944 151 985 198 1005C215 1011 237 999 254 982L273 1109C264 1134 239 1170 228 1216C220 1268 242 1294 302 1295L440 1298Q492 1294 495 1256L492 1162Q511 1144 531 1164L531 1254Q535 1294 584 1298L720 1297C785 1295 805 1267 797 1217C789 1178 765 1137 752 1114L769 982C795 1011 825 1014 853 993C883 970 882 930 873 892L850 802C826 713 800 677 748 650C807 615 834 559 812 480L790 323C829 300 850 257 850 200C849 131 808 89 745 90C688 87 650 120 632 178C556 156 474 156 395 178C377 120 344 89 293 89Z';
 const dish='M229 1206C153 1215 88 1245 79 1308C65 1382 148 1414 247 1441C409 1486 643 1486 806 1440C904 1413 961 1378 946 1312C935 1254 871 1221 795 1207L797 1255Q795 1295 735 1298H583Q534 1296 531 1254L531 1194H494L495 1256Q491 1298 440 1298H300Q224 1295 228 1244Z';
 const image='<image href="gummy-bear/cherry-approved.png" width="1024" height="1536"/>';
 host.innerHTML='<button type="button" class="pet-button" aria-label="Open Gummy Bear controls. Drag to move."><svg viewBox="0 45 1024 1590" aria-hidden="true"><defs><clipPath id="gb-body-clip"><path d="'+outline+'"/></clipPath><clipPath id="gb-dish-clip"><path d="'+dish+'"/></clipPath><clipPath id="gb-eye-left"><ellipse cx="389" cy="424" rx="41" ry="49"/></clipPath><clipPath id="gb-eye-right"><ellipse cx="638" cy="424" rx="41" ry="49"/></clipPath><mask id="gb-face-mask"><rect width="1024" height="1536" fill="white"/><ellipse cx="389" cy="424" rx="40" ry="48" fill="black"/><ellipse cx="638" cy="424" rx="40" ry="48" fill="black"/></mask><radialGradient id="gb-lid"><stop stop-color="#ec1327"/><stop offset="1" stop-color="#ab0618"/></radialGradient><filter id="gb-tint" color-interpolation-filters="sRGB" x="-5%" y="-5%" width="110%" height="110%"><feColorMatrix/></filter></defs><g class="gb-candy"><g clip-path="url(#gb-dish-clip)">'+image+'</g><g class="gb-body"><g clip-path="url(#gb-body-clip)" mask="url(#gb-face-mask)">'+image+'</g><ellipse cx="389" cy="424" rx="41" ry="49" fill="url(#gb-lid)"/><ellipse cx="638" cy="424" rx="41" ry="49" fill="url(#gb-lid)"/><g class="gb-eye gb-eye-left" clip-path="url(#gb-eye-left)">'+image+'</g><g class="gb-eye gb-eye-right" clip-path="url(#gb-eye-right)">'+image+'</g><path class="gb-closed" d="M358 429Q389 453 420 429M607 429Q638 453 669 429" fill="none" stroke="#530717" stroke-width="8" stroke-linecap="round"/></g></g><g class="gb-zs" fill="#a65baf" stroke="#fff0fb" stroke-width="3" paint-order="stroke" font-family="system-ui" font-weight="700"><text x="850" y="390" font-size="65">z</text><text x="910" y="300" font-size="85">Z</text></g><g class="gb-notes" fill="#f9b8d2" stroke="#642746" stroke-width="2" paint-order="stroke" font-size="85"><text x="32" y="620">♪</text><text x="910" y="710">♫</text></g></svg><span class="gb-nameplate"></span></button>';
 document.body.append(host);const pet=host.querySelector('button'),svg=pet.querySelector('svg'),body=pet.querySelector('.gb-body');
 // A complete empty dish stays stationary beneath every animated pose.
 const dishLayer=pet.querySelector('.gb-candy > g');dishLayer.classList.add('gb-platform');
 pet.querySelector('#gb-dish-clip path').setAttribute('d','M78 1285C65 1210 254 1153 512 1153C768 1153 958 1210 949 1285C958 1387 772 1446 512 1446C253 1446 66 1387 78 1285Z');
 dishLayer.innerHTML='<image href="gummy-bear/platform-solid-v1.png" width="1024" height="1536"/>';
 dishLayer.setAttribute('transform','translate(0 30)');
 const defs=pet.querySelector('defs');
 const mouthClip=document.createElementNS(ns,'clipPath');mouthClip.id='gb-mouth-clean-clip';mouthClip.innerHTML='<rect x="410" y="516" width="205" height="82" rx="12"/>';defs.append(mouthClip);
 const backing=document.createElementNS(ns,'g');backing.classList.add('gb-expression-backing');backing.setAttribute('clip-path','url(#gb-mouth-clean-clip)');backing.innerHTML='<image href="gummy-bear/mouth-clean-v1.png" width="1024" height="1536"/>';body.append(backing);
 const expression=document.createElementNS(ns,'g');expression.classList.add('gb-mouth');expression.setAttribute('transform','translate(512 552)');
 expression.innerHTML='<g class="gb-mouth-open"><path d="M-57-15Q0 1 57-15C55 51-55 51-57-15Z" fill="#230b15"/><path d="M-34 27Q0 9 34 27Q0 52-34 27" fill="#ef8a9a"/></g><ellipse class="gb-mouth-sleep" cx="0" cy="0" rx="23" ry="29" fill="#230b15"/>';body.append(expression);
 const happyEyes=document.createElementNS(ns,'path');happyEyes.classList.add('gb-happy-eyes');happyEyes.setAttribute('d','M358 435Q389 391 420 435M607 435Q638 391 669 435');happyEyes.setAttribute('fill','none');happyEyes.setAttribute('stroke','#530717');happyEyes.setAttribute('stroke-width','9');happyEyes.setAttribute('stroke-linecap','round');body.append(happyEyes);
 // Bend the continuous artwork, never cut ears away from the head. The map
 // fades to neutral before each ear root, so the attachment cannot open up.
 const earFilter=document.createElementNS(ns,'filter');earFilter.id='gb-ear-flex';
 for(const [k,v] of Object.entries({x:0,y:0,width:1024,height:1536,filterUnits:'userSpaceOnUse',primitiveUnits:'userSpaceOnUse','color-interpolation-filters':'sRGB'}))earFilter.setAttribute(k,v);
 const flexMap='<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536"><defs><radialGradient id="l"><stop stop-color="rgb(255,128,128)"/><stop offset="1" stop-color="rgb(128,128,128)"/></radialGradient><radialGradient id="r"><stop stop-color="rgb(0,128,128)"/><stop offset="1" stop-color="rgb(128,128,128)"/></radialGradient></defs><path fill="rgb(128,128,128)" d="M0 0H1024V1536H0Z"/><ellipse cx="273" cy="139" rx="116" ry="137" fill="url(#l)"/><ellipse cx="751" cy="139" rx="116" ry="137" fill="url(#r)"/></svg>';
 earFilter.innerHTML='<feImage x="0" y="0" width="1024" height="1536" preserveAspectRatio="none" result="flex"/><feDisplacementMap in="SourceGraphic" in2="flex" scale="0" xChannelSelector="R" yChannelSelector="G"/>';
 earFilter.firstChild.setAttribute('href','data:image/svg+xml,'+encodeURIComponent(flexMap));defs.append(earFilter);
 const earBend=earFilter.querySelector('feDisplacementMap');let earFrame=0;
 function stopEars(){cancelAnimationFrame(earFrame);earFrame=0;earBend.setAttribute('scale','0');body.removeAttribute('filter');}
 function wobbleEars(){const start=performance.now();body.setAttribute('filter','url(#gb-ear-flex)');function step(now){const t=(now-start)/1600;if(t>=1||!moving()||prefs.asleep){stopEars();return}earBend.setAttribute('scale',String(32*Math.sin(t*Math.PI*8)*Math.sin(t*Math.PI)));earFrame=requestAnimationFrame(step)}earFrame=requestAnimationFrame(step)}
 let prefs=gummyBearDefaults(),account='',position=null,visible=false,hidden=false,radio=false,drag=null,suppress=false,timer,blinkTimer,actionTimer,bodyAction;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const moving=()=>visible&&!hidden&&!host.hidden&&prefs.motion&&!reduced.matches;
 const positionKey=()=>`gummy-position:${account}`;
 function place(){if(host.hidden||host.closest('.pet-studio'))return;const b=pet.getBoundingClientRect(),x=position?.x??innerWidth-b.width-34,y=position?.y??innerHeight*.48-90;position={x:Math.max(8,Math.min(x,innerWidth-b.width-8)),y:Math.max(8,Math.min(y,innerHeight-b.height-8))};host.style.left=position.x+'px';host.style.top=position.y+'px';}
 function remember(){try{localStorage.setItem(positionKey(),JSON.stringify(position))}catch{}}
 function stop(){clearTimeout(timer);clearTimeout(blinkTimer);clearTimeout(actionTimer);pet.classList.remove('gb-blinking','gb-action','gb-talking','gb-ear-wobble');bodyAction?.cancel();bodyAction=null;stopEars();}
 function blink(){if(!moving()||prefs.asleep)return;pet.classList.add('gb-blinking');clearTimeout(blinkTimer);blinkTimer=setTimeout(()=>pet.classList.remove('gb-blinking'),360);}
 function schedule(){clearTimeout(timer);if(moving()&&!prefs.asleep)timer=setTimeout(()=>{blink();schedule()},3500+Math.random()*3000);}
 function render(){const skin=gummyBearSkins[prefs.skin]||gummyBearSkins.Cherry;host.hidden=!visible||hidden;host.dataset.size=prefs.size;pet.dataset.skin=prefs.skin;pet.classList.toggle('asleep',prefs.asleep);pet.classList.toggle('dancing',moving()&&radio&&!prefs.asleep);pet.classList.toggle('idle',moving()&&!radio&&!prefs.asleep);pet.classList.toggle('still',!moving());
  const t=skin.rgb;pet.querySelector('feColorMatrix').setAttribute('values',t.map(v=>[v,1-v,0,0,0].join(' ')).join(' ')+' 0 0 0 1 0');
  pet.querySelector('.gb-candy').setAttribute('filter',prefs.skin==='Cherry'?'none':'url(#gb-tint)');host.style.setProperty('--gummy-accent',skin.accent);
  const plate=pet.querySelector('.gb-nameplate');plate.textContent=prefs.name||'Gummy';plate.hidden=!prefs.nameplate;svg.setAttribute('viewBox',prefs.nameplate?'0 45 1024 1590':'0 45 1024 1460');
  pet.setAttribute('aria-label',prefs.asleep?'Wake Gummy Bear. Drag to move.':'Open Gummy Bear controls. Drag to move.');
  if(!moving()||prefs.asleep)stop();schedule();place();
 }
 function play(action){if(!moving()||prefs.asleep)return;if(action==='blink'){blink();return}stop();
  if(action==='mouth'||action==='ears'){const cls=action==='mouth'?'gb-talking':'gb-ear-wobble';pet.classList.add(cls);if(action==='ears')wobbleEars();actionTimer=setTimeout(()=>{pet.classList.remove(cls);if(action==='ears')stopEars();schedule()},action==='mouth'?2400:1600);return}
  pet.classList.add('gb-action');const frames=action==='squish'?[{transform:'scale(1,1)'},{transform:'scale(1.1,.89)',offset:.35},{transform:'scale(.96,1.04)',offset:.65},{transform:'scale(1,1)'}]:[{transform:'translateY(0) rotate(0)'},{transform:'translateY(-40px) rotate(-3deg)',offset:.3},{transform:'translateY(-18px) rotate(3deg)',offset:.65},{transform:'translateY(0) rotate(0)'}];bodyAction=body.animate(frames,{duration:900,easing:'ease-in-out'});actionTimer=setTimeout(()=>{pet.classList.remove('gb-action');schedule()},950);}
 pet.onclick=()=>{if(suppress){suppress=false;return}if(prefs.asleep){prefs={...prefs,asleep:false};render();onChange({...prefs});return}onCustomize?.()};
 pet.addEventListener('pointerdown',e=>{if(e.button!==0||host.closest('.pet-studio'))return;const b=pet.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:b.left,top:b.top,moved:false};suppress=false;pet.setPointerCapture(e.pointerId)});
 pet.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)<6)return;drag.moved=true;position={x:drag.left+dx,y:drag.top+dy};place()});
 function end(e){if(!drag||drag.id!==e.pointerId)return;suppress=drag.moved;if(drag.moved)remember();drag=null}
 pet.addEventListener('pointerup',end);pet.addEventListener('pointercancel',end);
 pet.addEventListener('keydown',e=>{const delta={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[e.key];if(!delta)return;e.preventDefault();const b=pet.getBoundingClientRect();position={x:b.left+delta[0],y:b.top+delta[1]};place();remember()});
 reduced.addEventListener('change',render);window.addEventListener('resize',place);
 return {host,play,update(value){if(account!==value.account){stop();account=value.account;hidden=false;position=null;try{const p=JSON.parse(localStorage.getItem(positionKey())||'null');if(Number.isFinite(p?.x)&&Number.isFinite(p?.y))position=p}catch{}}visible=value.visible;radio=value.radio;prefs={...gummyBearDefaults(),...value.preferences};render()},show(){hidden=false;render()},hide(){hidden=true;render()},reset(){position=null;try{localStorage.removeItem(positionKey())}catch{}place()},refresh:render};
};
