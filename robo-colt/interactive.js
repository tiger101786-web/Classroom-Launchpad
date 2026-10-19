// Approved seated Colt renderer. Original video assets are retained but no longer selected.
window.roboColtDefaults=()=>({skin:'Original',headwear:'none',platform:true,motion:true,size:'medium',asleep:false});
window.createRoboColt=function(onChange){
const host=document.createElement('div');host.className='robo-companion';host.hidden=true;
host.innerHTML="<button type=\"button\" class=\"pet-button\" aria-label=\"Open Colt controls. Drag to move.\"><svg viewBox=\"-95 0 920 940\" aria-hidden=\"true\">\n<defs>\n<radialGradient id=\"rc-iris\"><stop stop-color=\"#ffb6a4\"/><stop offset=\".5\" stop-color=\"#ff3c25\"/><stop offset=\"1\" stop-color=\"#970b15\"/></radialGradient>\n<filter id=\"rc-glow\"><feGaussianBlur stdDeviation=\"2\"/></filter>\n<path id=\"rc-ear-left-shape\" d=\"M190 174V83L220 13Q236 5 253 24L303 90L280 174Z\"/>\n<path id=\"rc-ear-right-shape\" d=\"M426 159L450 71L484 17Q501 1 514 26L548 83V177Z\"/>\n<path id=\"rc-rear-left-shape\" d=\"M270 512C207 493 137 536 112 608V684H282Z\"/>\n<path id=\"rc-rear-right-shape\" d=\"M470 512C540 493 607 536 624 608V684H463Z\"/>\n<clipPath id=\"rc-rear-left-clip\"><use href=\"#rc-rear-left-shape\"/></clipPath><clipPath id=\"rc-rear-right-clip\"><use href=\"#rc-rear-right-shape\"/></clipPath>\n<mask id=\"rc-body-without-ears\"><rect width=\"650\" height=\"685\" fill=\"white\"/><use href=\"#rc-ear-left-shape\" fill=\"black\"/><use href=\"#rc-ear-right-shape\" fill=\"black\"/><use href=\"#rc-rear-left-shape\" fill=\"black\"/><use href=\"#rc-rear-right-shape\" fill=\"black\"/></mask>\n<clipPath id=\"rc-ear-left-clip\"><use href=\"#rc-ear-left-shape\"/></clipPath><clipPath id=\"rc-ear-right-clip\"><use href=\"#rc-ear-right-shape\"/></clipPath>\n<clipPath id=\"rc-upper-leg-clip\"><rect x=\"190\" y=\"430\" width=\"180\" height=\"142\"/></clipPath>\n<clipPath id=\"rc-lower-leg-clip\"><rect x=\"190\" y=\"558\" width=\"180\" height=\"106\"/></clipPath>\n<clipPath id=\"rc-hoof-clip\"><rect x=\"190\" y=\"657\" width=\"180\" height=\"76\"/></clipPath>\n<clipPath id=\"rc-upper-right-clip\"><rect x=\"395\" y=\"430\" width=\"180\" height=\"142\"/></clipPath>\n<clipPath id=\"rc-lower-right-clip\"><rect x=\"395\" y=\"558\" width=\"180\" height=\"106\"/></clipPath>\n<clipPath id=\"rc-hoof-right-clip\"><rect x=\"395\" y=\"657\" width=\"180\" height=\"76\"/></clipPath>\n<linearGradient id=\"rc-mouth-rim\" x2=\"0\" y2=\"1\"><stop stop-color=\"#272024\"/><stop offset=\"1\" stop-color=\"#554347\"/></linearGradient>\n</defs>\n<g id=\"rc-platform\"><image href=\"robo-colt/platform-v1.png\" x=\"-65\" y=\"535\" width=\"860\" height=\"420\" preserveAspectRatio=\"none\"/><ellipse cx=\"365\" cy=\"706\" rx=\"245\" ry=\"27\" fill=\"#000\" opacity=\".28\"/></g>\n<g id=\"rc-puppet\">\n<g id=\"rc-tail\"><svg x=\"496\" y=\"456\" width=\"202\" height=\"230\" viewBox=\"752 716 448 470\"><image href=\"robo-colt/parts-v1.png\" width=\"1254\" height=\"1254\"/></svg></g>\n<g id=\"rc-ear-left\"><image href=\"robo-colt/parts-v1.png\" width=\"1254\" height=\"1254\" clip-path=\"url(#rc-ear-left-clip)\"/></g>\n<g id=\"rc-ear-right\"><image href=\"robo-colt/parts-v1.png\" width=\"1254\" height=\"1254\" clip-path=\"url(#rc-ear-right-clip)\"/></g>\n<g id=\"rc-rear-left\"><image href=\"robo-colt/parts-v1.png\" width=\"1254\" height=\"1254\" clip-path=\"url(#rc-rear-left-clip)\"/></g>\n<g id=\"rc-rear-right\"><image href=\"robo-colt/parts-v1.png\" width=\"1254\" height=\"1254\" clip-path=\"url(#rc-rear-right-clip)\"/></g>\n<svg width=\"650\" height=\"685\" viewBox=\"0 0 650 685\" mask=\"url(#rc-body-without-ears)\"><image href=\"robo-colt/parts-v1.png\" width=\"1254\" height=\"1254\"/></svg>\n<g id=\"rc-leg-left\"><g id=\"rc-lower-leg\"><g clip-path=\"url(#rc-lower-leg-clip)\"><svg x=\"206\" y=\"438\" width=\"148\" height=\"288\" viewBox=\"840 158 235 500\" preserveAspectRatio=\"none\"><image href=\"robo-colt/parts-v1.png\" width=\"1254\" height=\"1254\"/></svg></g></g><g id=\"rc-hoof-left\"><g clip-path=\"url(#rc-hoof-clip)\"><svg x=\"206\" y=\"438\" width=\"148\" height=\"288\" viewBox=\"840 158 235 500\" preserveAspectRatio=\"none\"><image href=\"robo-colt/parts-v1.png\" width=\"1254\" height=\"1254\"/></svg></g></g><g clip-path=\"url(#rc-upper-leg-clip)\"><svg x=\"206\" y=\"438\" width=\"148\" height=\"288\" viewBox=\"840 158 235 500\" preserveAspectRatio=\"none\"><image href=\"robo-colt/parts-v1.png\" width=\"1254\" height=\"1254\"/></svg></g></g>\n<g id=\"rc-leg-right\"><g id=\"rc-lower-leg-right\"><g clip-path=\"url(#rc-lower-right-clip)\"><svg x=\"411\" y=\"438\" width=\"145\" height=\"288\" viewBox=\"198 690 248 510\" preserveAspectRatio=\"none\"><image href=\"robo-colt/parts-v1.png\" width=\"1254\" height=\"1254\"/></svg></g></g><g id=\"rc-hoof-right\"><g clip-path=\"url(#rc-hoof-right-clip)\"><svg x=\"411\" y=\"438\" width=\"145\" height=\"288\" viewBox=\"198 690 248 510\" preserveAspectRatio=\"none\"><image href=\"robo-colt/parts-v1.png\" width=\"1254\" height=\"1254\"/></svg></g></g><g clip-path=\"url(#rc-upper-right-clip)\"><svg x=\"411\" y=\"438\" width=\"145\" height=\"288\" viewBox=\"198 690 248 510\" preserveAspectRatio=\"none\"><image href=\"robo-colt/parts-v1.png\" width=\"1254\" height=\"1254\"/></svg></g></g>\n<g class=\"eyes-open\">\n<g class=\"eye\" style=\"transform-origin:274px 276px\"><ellipse cx=\"274\" cy=\"276\" rx=\"28\" ry=\"35\" transform=\"rotate(-25 274 276)\" fill=\"#ff3428\" filter=\"url(#rc-glow)\"/><ellipse cx=\"274\" cy=\"276\" rx=\"25\" ry=\"32\" transform=\"rotate(-25 274 276)\" fill=\"url(#rc-iris)\"/><ellipse cx=\"279\" cy=\"277\" rx=\"13\" ry=\"24\" fill=\"#23060a\"/><circle cx=\"278\" cy=\"262\" r=\"7\" fill=\"#fff6e6\"/></g>\n<g class=\"eye\" style=\"transform-origin:458px 276px\"><ellipse cx=\"458\" cy=\"276\" rx=\"28\" ry=\"35\" transform=\"rotate(25 458 276)\" fill=\"#ff3428\" filter=\"url(#rc-glow)\"/><ellipse cx=\"458\" cy=\"276\" rx=\"25\" ry=\"32\" transform=\"rotate(25 458 276)\" fill=\"url(#rc-iris)\"/><ellipse cx=\"453\" cy=\"277\" rx=\"13\" ry=\"24\" fill=\"#23060a\"/><circle cx=\"455\" cy=\"262\" r=\"7\" fill=\"#fff6e6\"/></g>\n</g>\n<g class=\"eyes-happy\" fill=\"none\" stroke=\"#ff5646\" stroke-width=\"8\" stroke-linecap=\"round\"><path d=\"M252 287Q272 253 294 287M438 287Q458 253 480 287\"/></g>\n<g class=\"eyes-sleep\" fill=\"none\" stroke=\"#b72d32\" stroke-width=\"6\" stroke-linecap=\"round\"><path d=\"M249 279Q273 298 297 279M435 279Q459 298 483 279\"/></g>\n<g id=\"rc-mouth\" transform=\"translate(367 400)\">\n<path class=\"mouth-rest\" d=\"M-26-4Q0 10 26-4\" fill=\"none\" stroke=\"#130e11\" stroke-width=\"5\" stroke-linecap=\"round\"/>\n<g class=\"mouth-open\"><path d=\"M-29-6Q0 0 29-6Q24 24 0 25Q-24 24-29-6Z\" fill=\"#160a0f\" stroke=\"url(#rc-mouth-rim)\" stroke-width=\"3\"/><path d=\"M-17 16Q0 7 17 16Q0 28-17 16\" fill=\"#d9717e\"/></g>\n<ellipse class=\"mouth-sleep\" cx=\"0\" cy=\"3\" rx=\"7\" ry=\"9\" fill=\"#170e13\"/>\n</g>\n<g id=\"rc-headphones\" fill=\"#801b36\" stroke=\"#17131b\" stroke-width=\"8\"><path d=\"M174 286C136 25 566 25 562 286\" fill=\"none\" stroke-width=\"19\"/><path d=\"M174 286C136 25 566 25 562 286\" fill=\"none\" stroke=\"#b8b6be\" stroke-width=\"5\"/><rect x=\"154\" y=\"257\" width=\"43\" height=\"93\" rx=\"20\" transform=\"rotate(-12 175 303)\"/><rect x=\"544\" y=\"257\" width=\"43\" height=\"93\" rx=\"20\" transform=\"rotate(12 565 303)\"/></g>\n</g>\n<g class=\"zs\" fill=\"#c8bde8\" font-family=\"Arial\" font-weight=\"bold\"><text x=\"555\" y=\"220\" font-size=\"32\">Z</text><text x=\"600\" y=\"165\" font-size=\"40\">Z</text><text x=\"635\" y=\"100\" font-size=\"48\">Z</text></g>\n<g class=\"notes\" fill=\"#c63b5d\" font-size=\"50\"><text x=\"115\" y=\"380\">♪</text><text x=\"610\" y=\"320\">♫</text></g>\n</svg></button><aside class=\"panel\" hidden aria-label=\"Colt controls\"></aside>";
document.body.append(host);
const pet=host.querySelector('.pet-button'),panel=host.querySelector('.panel');
const $=s=>host.querySelector(s.startsWith('#')?'#rc-'+s.slice(1):s);
// Use the dumpling's four-note design and timing, normalized to Colt's viewBox.
// Separate anchors keep the entire floating path outside his face.
const musicNotes=pet.querySelector('.notes');
musicNotes.setAttribute('font-family','Arial, sans-serif');
musicNotes.setAttribute('font-size','140');
musicNotes.setAttribute('font-weight','bold');
musicNotes.setAttribute('text-anchor','middle');
musicNotes.setAttribute('fill','#a81747');
musicNotes.setAttribute('stroke','#fff1cf');
musicNotes.setAttribute('stroke-width','7');
musicNotes.setAttribute('paint-order','stroke');
musicNotes.setAttribute('pointer-events','none');
musicNotes.innerHTML=[[55,350,'♪',0],[715,330,'♫',-.6],[75,120,'♫',-1.2],[695,110,'♪',-1.8]].map(([x,y,note,delay])=>'<g transform="translate('+x+' '+y+') scale('+(920/1254)+')"><text class="music-note" x="0" y="0" style="animation-delay:'+delay+'s">'+note+'</text></g>').join('');
// Colt's ear cups sit over his upper ears, not beside his cheeks.
$('#headphones').innerHTML='<path d="M222 98C254 4 454 4 504 98" fill="none" stroke="#17131b" stroke-width="20"/><path d="M222 98C254 4 454 4 504 98" fill="none" stroke="#b8b6be" stroke-width="5"/>';
for(const [side,x,angle] of [['left',204,-22],['right',470,22]]){
 const cup=document.createElementNS('http://www.w3.org/2000/svg','g');
 cup.classList.add('colt-earphone');cup.id='rc-earphone-'+side;
 cup.innerHTML='<g transform="rotate('+angle+' '+(x+30)+' 105)"><rect x="'+x+'" y="53" width="60" height="108" rx="26" fill="#17131b" stroke="#aaa6b1" stroke-width="4"/><rect x="'+(x+8)+'" y="61" width="44" height="90" rx="20" fill="#801b36"/><path d="M'+(x+17)+' 78V127" stroke="#d26b86" stroke-width="4" stroke-linecap="round"/></g>';
 $('#ear-'+side).append(cup);
}
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let sleeping=false,dancing=false,idle=false,phones=false,busy=false,sequence=0,drag=null;
let prefs=window.roboColtDefaults(),visible=false,account='',radio=false,autoAsleep=false,hiddenByUser=false,position=null,napTimer,wakeTimer,waking=false;
function status(s){const label=panel.querySelector('.motion-status');if(label)label.textContent=s}
const animations=new Set();
function animate(el,frames,opts={}){const a=el.animate(frames,{duration:650,easing:'ease-in-out',...opts});animations.add(a);a.finished.catch(()=>{}).finally(()=>animations.delete(a));return a}
function stop(){sequence++;for(const a of animations)a.cancel();animations.clear();pet.classList.remove('happy','talking');busy=false}
function blink(){if(sleeping||waking)return;pet.querySelectorAll('.eye').forEach(e=>animate(e,[{transform:'scaleY(1)'},{transform:'scaleY(.04)',offset:.45},{transform:'scaleY(1)'}],{duration:600}))}
function cancelWake(){clearTimeout(wakeTimer);waking=false;pet.classList.remove('waking','wake-smile');pet.querySelectorAll('.eye').forEach(e=>e.style.removeProperty('transform'))}
function wakeUp(){
 stop();dancing=false;pet.classList.remove('dancing');cancelWake();
 if(!idle)return;
 waking=true;pet.classList.add('waking');
 // Open gradually, pause to focus, then blink before the final smile.
 pet.querySelectorAll('.eye').forEach(e=>{
  // Hold closed immediately, including the frame before the animation starts.
  e.style.transform='scaleY(.04)';
  const opening=animate(e,[
  {transform:'scaleY(.04)',offset:0,easing:'ease-in-out'},
  {transform:'scaleY(1)',offset:.5},{transform:'scaleY(1)',offset:.65,easing:'ease-in-out'},
  {transform:'scaleY(.04)',offset:.77,easing:'ease-in-out'},{transform:'scaleY(1)',offset:.9},
  {transform:'scaleY(1)',offset:1}
 ],{duration:4000,easing:'linear',fill:'backwards'});
  opening.finished.then(()=>e.style.removeProperty('transform')).catch(()=>{});
 });
 wakeTimer=setTimeout(()=>{
  pet.classList.add('wake-smile');
  wakeTimer=setTimeout(()=>{cancelWake();sync();say('Recharged and ready!')},1000);
 },4000);
}
function tail(){animate($('#tail'),[{transform:'rotate(0deg) skewY(0deg)',offset:0},{transform:'rotate(-18deg) skewY(-5deg)',offset:.17},{transform:'rotate(17deg) skewY(4deg)',offset:.38},{transform:'rotate(-12deg) skewY(-3deg)',offset:.59},{transform:'rotate(8deg) skewY(2deg)',offset:.78},{transform:'rotate(-3deg)',offset:.91},{transform:'rotate(0deg) skewY(0deg)',offset:1}],{duration:1700})}
function hoof(){
  // Only the shin foreshortens. The rigid hoof translates without any scaling.
  const timing={duration:1450};
  animate($('#lower-leg'),[{transform:'scaleY(1)',offset:0},{transform:'scaleY(.54)',offset:.32},{transform:'scaleY(.54)',offset:.65},{transform:'scaleY(1)',offset:1}],timing);
  return animate($('#hoof-left'),[{transform:'translateY(0)',offset:0},{transform:'translateY(-43.24px)',offset:.32},{transform:'translateY(-43.24px)',offset:.65},{transform:'translateY(0)',offset:1}],timing);
}
function ears(){animate($('#ear-left'),[{transform:'rotate(0deg)'},{transform:'rotate(-12deg)',offset:.18},{transform:'rotate(4deg)',offset:.34},{transform:'rotate(-7deg)',offset:.5},{transform:'rotate(0deg)',offset:.76},{transform:'rotate(0deg)'}],{duration:720});animate($('#ear-right'),[{transform:'rotate(0deg)'},{transform:'rotate(9deg)',offset:.25},{transform:'rotate(-3deg)',offset:.5},{transform:'rotate(0deg)'}],{duration:560,delay:160})}
function mouth(){const id=sequence;pet.classList.add('talking');const a=animate($('.mouth-open'),[{transform:'scaleY(.15)'},{transform:'scaleY(1)',offset:.18},{transform:'scaleY(.3)',offset:.37},{transform:'scaleY(.85)',offset:.56},{transform:'scaleY(.25)',offset:.73},{transform:'scaleY(.7)',offset:.86},{transform:'scaleY(.15)'}],{duration:1300});a.finished.then(()=>{if(id===sequence)pet.classList.remove('talking')}).catch(()=>{})}
function bounce(){return animate($('#puppet'),[{transform:'translateY(0)'},{transform:'translateY(3px) scale(1.008,.992)',offset:.2},{transform:'translateY(-17px)',offset:.48},{transform:'translateY(0)',offset:.8},{transform:'translateY(0)'}],{duration:680})}
function happy(duration=1500){const id=sequence;pet.classList.add('happy');setTimeout(()=>{if(id===sequence&&!sleeping&&!dancing)pet.classList.remove('happy')},duration)}
function dance(){
  stop();sleeping=false;dancing=!dancing;sync();
  if(!dancing){status('Dance stopped.');return}
  pet.classList.add('happy');
  if(!reduced.matches){
    const timing={duration:640,iterations:Infinity,easing:'linear'};
    // One complete two-step: left hoof up on beat one, right on beat two.
    // Both hooves keep their full shape, moving separately from the foreshortened shins.
    for(const [shin,foot,amounts] of [
      ['#lower-leg','#hoof-left',[0,1,0,0,0]],
      ['#lower-leg-right','#hoof-right',[0,0,0,1,0]]
    ]){
      animate($(shin),amounts.map((v,i)=>({transform:`scaleY(${1-.46*v})`,offset:i/4,easing:'ease-in-out'})),timing);
      animate($(foot),amounts.map((v,i)=>({transform:`translateY(${-43.24*v}px)`,offset:i/4,easing:'ease-in-out'})),timing);
    }
    // Back hooves rock out and in around the hips: a small seated shimmy, not a walk.
    animate($('#rear-left'),[0,1,0,-.55,0].map((v,i)=>({transform:`translateY(${-3*Math.abs(v)}px) rotate(${6*v}deg)`,offset:i/4,easing:'ease-in-out'})),timing);
    animate($('#rear-right'),[0,.55,0,-1,0].map((v,i)=>({transform:`translateY(${-3*Math.abs(v)}px) rotate(${6*v}deg)`,offset:i/4,easing:'ease-in-out'})),timing);
    animate($('#puppet'),[0,1,0,-1,0].map((v,i)=>({transform:`translateY(${-5*Math.abs(v)}px) rotate(${v}deg)`,offset:i/4,easing:'ease-in-out'})),timing);
    animate($('#tail'),[0,1,0,-1,0].map((v,i)=>({transform:`rotate(${8*v}deg)`,offset:i/4,easing:'ease-in-out'})),timing);
    // Share an exact start time so the steps cannot drift out of phase.
    const started=document.timeline.currentTime;
    for(const a of animations)a.startTime=started;
  }
  status(reduced.matches?'Dance pose only: reduced motion is enabled.':'Two-step dance: quick alternating front hooves and a little back-hoof shimmy.');
}
function action(name){if(sleeping){status('Wake him first, or click him to wake.');return}if(dancing){status('Stop the dance before trying another move.');return}stop();if(name==='blink')blink();if(name==='tail')tail();if(name==='hoof')hoof();if(name==='ears')ears();if(name==='mouth')mouth();if(name==='bounce')bounce();if(name==='happy')happy();if(name==='greet'){happy(1900);tail();hoof();ears();bounce()}status({blink:'A quick blink.',tail:'A broader swish, easing back to rest.',hoof:'The hoof lifts without shrinking or flattening.',ears:'A quick, staggered ear flick.',mouth:'A little silent chatter from his muzzle.',bounce:'One little bounce, then still again.',happy:'Happy eyes and an open smile.',greet:'Hello! A lifted hoof, wag, ear flick, and held-open smile.'}[name])}

panel.innerHTML='<header class="dumpling-panel-heading"><div><span class="pet-kicker">YOUR CLASSROOM COMPANION</span><strong>Robo-Colt</strong></div><button type="button" data-close aria-label="Close Colt controls">✕</button></header><div class="dumpling-panel-body" tabindex="0" role="region" aria-label="Colt customization options"><div class="dumpling-look"><h2>Robo-Colt</h2><p>Black armor. Big personality.</p></div><div class="dumpling-sections"></div><div class="dumpling-radio-status" role="status"></div><div class="controls dumpling-utilities"><button type="button" data-reset>Reset spot</button><button type="button" data-hide>Hide Colt</button><button type="button" data-companion-open>Choose pet</button></div><p class="pet-status" role="status"></p><button type="button" data-retry hidden>Retry save</button></div>';
const paintSkin=window.createRoboColtSkinPainter(pet);
const pages=[];
function group(title,choices,key,pageSize=4){
 const field=document.createElement('fieldset');field.className='dumpling-group';
 const legend=document.createElement('legend');legend.textContent=title;field.append(legend);
 const grid=document.createElement('div');grid.className='controls';field.append(grid);
 const ordered=key==='size'||key==='skin'?choices.slice():choices.slice().sort((a,b)=>a[1].localeCompare(b[1]));
 const buttons=ordered.map(([value,label])=>{
  const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.option=value;b.dataset.setting=key;
  b.onclick=()=>{if(key==='action'){if(waking){status('Colt is waking up. One moment!');return}if(!prefs.motion||reduced.matches){status('Turn motion on to try animations.');return}touch();action(value);return}
   prefs[key]=value==='true'?true:value==='false'?false:value;touch();sync();onChange({...prefs});};
  grid.append(b);return b;
 });
 let page=0;const count=Math.ceil(buttons.length/pageSize),nav=document.createElement('nav');nav.className='dumpling-option-pages';
 const prev=document.createElement('button'),next=document.createElement('button'),label=document.createElement('span');prev.type=next.type='button';prev.textContent='Previous';next.textContent='Next';nav.append(prev,label,next);field.append(nav);
 function render(){buttons.forEach((b,i)=>b.hidden=Math.floor(i/pageSize)!==page);nav.hidden=count<=1;prev.disabled=page===0;next.disabled=page>=count-1;label.textContent=(page+1)+' / '+count}
 prev.onclick=()=>{page--;render()};next.onclick=()=>{page++;render()};
 pages.push(()=>{const at=buttons.findIndex(b=>b.dataset.option===String(prefs[key]));if(at>=0)page=Math.floor(at/pageSize);render()});render();
 panel.querySelector('.dumpling-sections').append(field);return field;
}
group('01 · Choose your skin',['Original',...Object.keys(window.roboColtSkins).filter(name=>name!=='Original').sort((a,b)=>a.localeCompare(b))].map(name=>[name,name]),'skin');
group('02 · Dress it up',[['none','None'],['headphones','Headphones']],'headwear');
const play=group('03 · Play together',[['blink','Blink'],['bounce','Bounce'],['ears','Ear twitch'],['greet','Excited greeting'],['happy','Happy smile'],['hoof','Hoof lift'],['mouth','Mouth movement'],['tail','Tail wag']],'action');
const motionStatus=document.createElement('p');motionStatus.className='motion-status';motionStatus.textContent='Try a move together.';play.append(motionStatus);
group('04 · Choose your size',[['small','Small'],['medium','Medium'],['large','Large'],['extra-large','Extra Large']],'size');
const rest=group('05 · Rest & motion',[['true','Motion on'],['false','Motion off']],'motion');
const sleepBtn=document.createElement('button');sleepBtn.type='button';sleepBtn.dataset.sleep='';rest.querySelector('.controls').append(sleepBtn);
group('06 · Display platform',[['true','Show platform'],['false','Hide platform']],'platform');
const speech=document.createElement('div');speech.className='dumpling-speech';speech.hidden=true;speech.innerHTML='<span class="dumpling-speech-label">ROBO-COLT</span><span class="dumpling-speech-message"></span>';host.append(speech);let speechTimer;
function say(text){if(host.hidden||sleeping||!panel.hidden)return;speech.querySelector('.dumpling-speech-message').textContent=text;speech.hidden=false;clearTimeout(speechTimer);speechTimer=setTimeout(()=>speech.hidden=true,3800);place()}
function close(){panel.hidden=true;pet.setAttribute('aria-expanded','false')}
function customize(){if(!visible)return;hiddenByUser=false;sync();pages.forEach(fn=>fn());panel.hidden=false;speech.hidden=true;pet.setAttribute('aria-expanded','true');place();panel.querySelector('[data-close]').focus()}
function place(){
 if(host.hidden)return;
 const box=pet.getBoundingClientRect(),x=Math.max(8,Math.min(position?.x??innerWidth-box.width-34,innerWidth-box.width-8)),y=Math.max(8,Math.min(position?.y??innerHeight*.48-90,innerHeight-box.height-8));
 host.style.left=x+'px';host.style.top=y+'px';if(position)position={x,y};
 const width=Math.min(640,innerWidth-24);panel.style.width=width+'px';panel.style.left=Math.max(12,Math.min(x>width+20?x-width-12:x+box.width+12,innerWidth-width-12))+'px';panel.style.top=Math.max(12,Math.min(y,innerHeight-panel.offsetHeight-12))+'px';
 speech.style.width=Math.min(238,innerWidth-24)+'px';speech.style.left=Math.max(12,Math.min(x+box.width/2-119,innerWidth-250))+'px';speech.style.top=Math.max(12,y-95)+'px';
}
function sync(){
 const wasSleeping=sleeping;
 host.hidden=!visible||hiddenByUser;host.dataset.size=prefs.size;idle=!host.hidden&&prefs.motion&&!reduced.matches&&!document.hidden;
 sleeping=prefs.asleep||autoAsleep;phones=prefs.headwear==='headphones';
 // Start waking before radio/visibility updates can expose fully open eyes.
 if(wasSleeping&&!sleeping&&!host.hidden)wakeUp();
 if(sleeping)speech.hidden=true;
 const shouldDance=radio&&!sleeping&&!waking&&!host.hidden;
 if(sleeping||host.hidden||!idle){cancelWake();stop();dancing=false;}
 if(shouldDance!==dancing){if(shouldDance&&idle)dance();else {stop();dancing=false;}}
 pet.classList.toggle('sleeping',sleeping);pet.classList.toggle('asleep',sleeping);
 pet.classList.toggle('idle',idle);pet.classList.toggle('dancing',dancing);
 pet.classList.toggle('wear-phones',phones||shouldDance);host.classList.toggle('motion-off',!idle);
 $('#platform').style.display=prefs.platform?'':'none';
 const skin=paintSkin(prefs.skin);
 panel.querySelector('.dumpling-look h2').textContent=prefs.skin+' Colt';
 panel.querySelector('.dumpling-look p').textContent=skin.description;
 sleepBtn.textContent=sleeping?'Wake Colt':'Sleep Colt';sleepBtn.setAttribute('aria-pressed',sleeping);
 pet.setAttribute('aria-label',sleeping?'Wake Colt. Drag to move.':'Open Colt controls. Drag to move.');
 panel.querySelectorAll('[data-setting]').forEach(b=>{if(b.dataset.setting!=='action')b.setAttribute('aria-pressed',String(String(prefs[b.dataset.setting])===b.dataset.option))});
 panel.querySelector('.dumpling-radio-status').textContent=sleeping?'☾ Sleeping · Click Colt to wake':radio?'♫ Colt Radio · Headphones on · '+(idle?'Let’s dance!':'Motion paused'):'♫ Radio ready · Headphones appear when music plays';
 if(host.hidden){close();speech.hidden=true;clearTimeout(napTimer);clearTimeout(wakeTimer);waking=false;pet.classList.remove('waking')}
 place();
}
function touch(){clearTimeout(napTimer);if(autoAsleep){autoAsleep=false;sync()}if(!host.hidden&&!prefs.asleep&&!radio)napTimer=setTimeout(()=>{if(!host.hidden&&panel.hidden&&!radio){autoAsleep=true;sync()}else touch()},60000)}
sleepBtn.onclick=()=>{prefs.asleep=!(prefs.asleep||autoAsleep);autoAsleep=false;close();sync();touch();onChange({...prefs})};
panel.querySelector('[data-close]').onclick=()=>{close();pet.focus();touch()};
panel.querySelector('[data-hide]').onclick=()=>{hiddenByUser=true;sync()};
panel.querySelector('[data-reset]').onclick=()=>{position=null;try{localStorage.removeItem('robo-colt-position:'+account)}catch{}place()};
let suppress=false;
pet.onclick=()=>{if(suppress){suppress=false;return}if(sleeping){prefs.asleep=false;autoAsleep=false;sync();touch();onChange({...prefs});return}touch();panel.hidden?customize():close()};
pet.addEventListener('pointerdown',e=>{if(e.button!==0)return;const b=pet.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:b.left,top:b.top,moved:false};suppress=false;pet.setPointerCapture(e.pointerId)});
pet.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)<6)return;drag.moved=true;position={x:drag.left+dx,y:drag.top+dy};close();speech.hidden=true;place()});
function endDrag(e){if(!drag||drag.id!==e.pointerId)return;suppress=drag.moved;if(drag.moved){try{localStorage.setItem('robo-colt-position:'+account,JSON.stringify(position))}catch{}if(e.type==='pointerup'&&!sleeping&&!dancing){if(idle)action('greet');say('New spot. Same Colt energy!')}}drag=null;touch()}
pet.addEventListener('pointerup',endDrag);pet.addEventListener('pointercancel',endDrag);
pet.addEventListener('keydown',e=>{const move={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[e.key];if(!move)return;e.preventDefault();const b=pet.getBoundingClientRect();position={x:b.left+move[0],y:b.top+move[1]};place();try{localStorage.setItem('robo-colt-position:'+account,JSON.stringify(position))}catch{}touch()});
document.addEventListener('pointerdown',e=>{if(!host.contains(e.target)){close();if(!host.hidden)touch()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){close()}if(!host.hidden)touch()});
window.addEventListener('resize',place);
reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
function canIdle(){return idle&&!sleeping&&!dancing&&!waking&&!drag&&animations.size===0&&!pet.classList.contains('happy')}
function schedule(kind,min,max){setTimeout(()=>{if(canIdle()){if(kind==='blink'){blink();if(Math.random()<.45)ears()}else if(kind==='smile')happy(1800);else {happy(1200);bounce()}}schedule(kind,min,max)},min+Math.random()*(max-min))}
schedule('blink',3500,6500);schedule('smile',12000,22000);schedule('bounce',24000,38000);
return {
 update(state){
  const changed=account!==state.account;
  if(changed){stop();clearTimeout(wakeTimer);clearTimeout(napTimer);waking=false;autoAsleep=false;sleeping=false;dancing=false;hiddenByUser=false;position=null;close();account=state.account;try{const p=JSON.parse(localStorage.getItem('robo-colt-position:'+account));if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y))position=p}catch{}}
  const radioChanged=radio!==state.radio,visibleChanged=visible!==state.visible;
  prefs={...window.roboColtDefaults(),...state.preferences};visible=state.visible;radio=state.radio;
  if(radioChanged&&radio)autoAsleep=false;
  sync();if(changed||radioChanged||visibleChanged)touch();
  if(radioChanged&&radio)say('Time for a little two-step!');
 },
 customize,close,show(){hiddenByUser=false;sync();touch()},
 announce(message,error,retry){panel.querySelector('.pet-status').textContent=message;const b=panel.querySelector('[data-retry]');b.hidden=!error;b.onclick=retry}
};
};


