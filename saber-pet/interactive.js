window.saberDefaults=()=>({skin:'Saber-tooth',name:'Saber',nameplate:true,platform:true,motion:true,size:'medium',asleep:false,headwear:'none'});
window.saberMarkup=()=>"<svg viewBox=\"-68 0 1160 1420\" role=\"img\" aria-label=\"Saber-tooth tiger on a fossil stone platform\"><defs></defs><g class=\"saber-platform\"><image href=\"saber-pet/platform-v2.png\" x=\"-68\" y=\"720\" width=\"1160\" height=\"480\" preserveAspectRatio=\"none\"/></g><g class=\"tiger\"><image href=\"saber-pet/tiger.png\" width=\"1024\" height=\"1024\"/></g><g class=\"saber-nameplate\" transform=\"translate(90 1180)\"><image href=\"saber-pet/nameplate-v2.png\" x=\"0\" y=\"-50\" width=\"844\" height=\"290\" preserveAspectRatio=\"none\"/><text id=\"saber-pet-name\" x=\"422\" y=\"92\" text-anchor=\"middle\" dominant-baseline=\"middle\" fill=\"#49301d\" style=\"font:700 73px Georgia,serif;letter-spacing:1px\">Saber</text></g></svg>";
window.createSaberPet=function(onChange,onCustomize){
 const host=document.createElement('div');host.className='saber-companion';host.hidden=true;
 host.innerHTML='<button type="button" class="pet-button" aria-label="Open Saber Tiger controls">'+saberMarkup()+'</button><div id="saber-speech" class="saber-speech" role="status" hidden></div>';
 document.body.append(host);
 let preferences=saberDefaults(),visible=false,hidden=false,radio=false,account='',position=null,drag=null,suppress=false,rig=null;
 const pet=host.querySelector('.pet-button'),positionKey=()=> 'saber-position:'+account;
 function place(){if(host.hidden||host.closest('.pet-studio'))return;const b=pet.getBoundingClientRect();host.style.left=Math.max(8,Math.min(position?.x??innerWidth-b.width-34,innerWidth-b.width-8))+'px';host.style.top=Math.max(8,Math.min(position?.y??innerHeight*.48-90,innerHeight-b.height-8))+'px';}
 function remember(){try{localStorage.setItem(positionKey(),JSON.stringify(position))}catch{}}
 function refresh(){const still=host.querySelector('.tiger>image');if(still&&window.saberSkins?.[preferences.skin])still.setAttribute('href',saberSkins[preferences.skin].art);host.hidden=!visible||hidden;host.dataset.size=preferences.size;const label=host.querySelector('#saber-pet-name');label.textContent=preferences.name;label.style.fontSize=Math.min(73,580/Math.max(1,Array.from(preferences.name).length*.63))+'px';host.querySelector('.saber-platform').style.display=preferences.platform?'':'none';host.querySelector('.saber-nameplate').style.display=preferences.platform&&preferences.nameplate?'':'none';host.querySelector('.saber-speech').hidden=true;rig?.update({...preferences,radio});place();}
 pet.onclick=()=>{if(suppress){suppress=false;return}if(preferences.asleep){preferences={...preferences,asleep:false};refresh();onChange({...preferences})}else onCustomize?.()};
 pet.addEventListener('pointerdown',e=>{if(e.button!==0||host.closest('.pet-studio'))return;const b=pet.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:b.left,top:b.top,moved:false};pet.setPointerCapture(e.pointerId)});
 pet.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)<6)return;drag.moved=true;position={x:drag.left+dx,y:drag.top+dy};host.querySelector('.saber-speech').hidden=true;place()});
 function end(e){if(!drag||drag.id!==e.pointerId)return;suppress=drag.moved;if(drag.moved)remember();drag=null}
 pet.addEventListener('pointerup',end);pet.addEventListener('pointercancel',end);
 pet.addEventListener('keydown',e=>{if(host.closest('.pet-studio'))return;const d={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[e.key];if(!d)return;e.preventDefault();const b=pet.getBoundingClientRect();position={x:b.left+d[0],y:b.top+d[1]};place();remember()});
 window.addEventListener('resize',place);
 mountSaberRig(host,()=>preferences).then(value=>{rig=value;host.dataset.ready='true';refresh()}).catch(error=>{host.dataset.ready='error';console.warn('Saber-tooth tiger is displaying its static artwork:',error.message)});
 return {host,play(name){if(!host.hidden&&!preferences.asleep&&preferences.motion)rig?.play(({excited:'hello',greet:'hello',mouth:'talk'})[name]||name)},update(value){if(account!==value.account){account=value.account;position=null;hidden=false;rig?.reset();try{const p=JSON.parse(localStorage.getItem(positionKey())||'null');if(Number.isFinite(p?.x)&&Number.isFinite(p?.y))position=p}catch{}}preferences={...saberDefaults(),...value.preferences};visible=value.visible;radio=value.radio;refresh()},show(){hidden=false;refresh()},hide(){hidden=true;refresh()},reset(){position=null;try{localStorage.removeItem(positionKey())}catch{}place()},refresh};
};
/* One clock for body mesh, face, headphones, and floating symbols. Production rig from the approved preview. */
async function mountSaberRig(host,getPreferences=()=>saberDefaults()){
 const pet=host.querySelector('.pet-button'),$=s=>host.querySelector(s.replace(/#([a-z][a-z0-9-]*)/gi,'#saber-rig-$1'));let options=saberDefaults();
 const ns='http://www.w3.org/2000/svg',svg=pet.querySelector('svg'),tiger=$('.tiger');
 tiger.style.animation='none';
 // Yield until the controller has received the saved account preferences.
 await Promise.resolve();
 const initialName=window.saberSkins?.[getPreferences().skin]?getPreferences().skin:'Saber-tooth';
 const initialSkin=window.saberSkins?.[initialName];
 const original=new Image();original.src=initialSkin?.art||window.saberArtData;await original.decode();
 const underlay=new Image();underlay.src=initialSkin?.underlay||window.saberUnderlayData;await underlay.decode();
 const fo=document.createElementNS(ns,'foreignObject');fo.setAttribute('width',1024);fo.setAttribute('height',1024);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1536;canvas.style.cssText='width:1024px;height:1024px;display:block';fo.append(canvas);
 const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:true});
 if(!gl)throw Error('Please enable browser hardware acceleration to test animations.');
 const vertex=`attribute vec2 p;varying vec2 uv;uniform float breath,ear,paw,pawRight,nose,sway,tilt,jaw,brow,rear,layer;
 float field(vec2 p,vec2 c,vec2 r){vec2 d=(p-c)/r;return exp(-dot(d,d)*2.);}
 void main(){uv=p/1024.;vec2 q=p;
 float leftEar=field(p,vec2(303.,125.),vec2(95.,92.));float rightEar=field(p,vec2(739.,125.),vec2(95.,92.));
 q.y+=ear*(leftEar-rightEar)*14.;q.x+=ear*(leftEar+rightEar)*5.;
 // Separate foreground limbs: no displacement can propagate into rear legs.
 float lift=layer==1.?paw:(layer==2.?pawRight:0.);
 float hinge=smoothstep(630.,880.,p.y);
 q.y-=lift*92.*hinge;q.x+=(layer==1.?-1.:1.)*lift*12.*hinge;
 float rearLeft=field(p,vec2(238.,875.),vec2(65.,100.));float rearRight=field(p,vec2(850.,875.),vec2(65.,100.));
 if(layer==0.)q.y-=max(rear,0.)*rearLeft*9.+max(-rear,0.)*rearRight*9.;
 q.y-=brow*18.*(field(p,vec2(413.,207.),vec2(65.,30.))+field(p,vec2(626.,207.),vec2(65.,30.)));
 q.x+=nose*5.*field(p,vec2(520.,389.),vec2(70.,46.));
 q.y+=jaw*12.*field(p,vec2(520.,508.),vec2(62.,45.));
 float head=1.-smoothstep(590.,845.,p.y);float a=tilt*.01745329*head;vec2 d=q-vec2(520.,465.);q=vec2(cos(a)*d.x-sin(a)*d.y,sin(a)*d.x+cos(a)*d.y)+vec2(520.,465.);
 float anchor=1.-smoothstep(850.,972.,p.y);q.y+=(q.y-987.)*.007*breath*anchor;
 q.x+=(p.x-520.)*.008*breath*field(p,vec2(520.,700.),vec2(260.,190.))*anchor;
 q.x+=sway*9.*head;
 gl_Position=vec4(q.x/512.-1.,1.-q.y/512.,0.,1.);}`;
 const fragment=`precision highp float;varying vec2 uv;uniform sampler2D art,clean,limbs;uniform float gaze,layer,detailBias;
 void main(){vec2 q=uv*1024.;float l=1.-smoothstep(20.,34.,length((q-vec2(429.,257.))*vec2(1.,1.1)));float r=1.-smoothstep(20.,34.,length((q-vec2(617.,257.))*vec2(1.,1.1)));vec2 sampleUV=uv;sampleUV.x-=gaze*7.*max(l,r)/1024.;vec4 source=texture2D(art,sampleUV,detailBias);vec4 mask=texture2D(limbs,uv,detailBias);
 // Reveal each complete rear foot, not just the portion inside the foreleg cutout.
 // The blend ends in the fur above the toes; no mask edge crosses a rear claw.
 float rearFeet=smoothstep(770.,850.,q.y);
 if(layer==0.)gl_FragColor=mix(source,texture2D(clean,uv,detailBias),max(max(mask.r,mask.g),rearFeet));else gl_FragColor=source*(layer==1.?mask.r:mask.g);}`;
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
 const vertices=[];for(let y=0;y<1024;y+=8)for(let x=0;x<1024;x+=8)vertices.push(x,y,x+8,y,x,y+8,x+8,y,x+8,y+8,x,y+8);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);const loc=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
 // Power-of-two textures allow filtered mip levels in WebGL 1. Keep the
 // original files untouched; filtering happens only in GPU upload/display.
 function uploadFiltered(source){
  const upload=document.createElement('canvas');upload.width=upload.height=2048;
  const ctx=upload.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(source,0,0,2048,2048);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,upload);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  for(const k of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE);
  gl.generateMipmap(gl.TEXTURE_2D);
 }
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);uploadFiltered(original);
 gl.viewport(0,0,canvas.width,canvas.height);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
 const maskCanvas=document.createElement('canvas');maskCanvas.width=maskCanvas.height=2048;
 const mc=maskCanvas.getContext('2d');mc.scale(2,2);mc.fillStyle='black';mc.fillRect(0,0,1024,1024);
 // Contours follow the original forelegs, leaving rear paws outside the masks.
 // Include the inward-facing dewclaws behind each forepaw. They belong to
 // the moving foreleg, not the stationary rear-foot/torso layer.
 const leftContour=new Path2D('M277 625 Q278 739 306 838 Q306 861 283 873 Q248 878 245 925 Q241 965 265 983 Q350 1000 470 987 Q490 962 481 923 L493 927 Q500 901 487 876 Q478 862 467 861 L450 838 Q425 749 393 685 L370 625Z');
 const rightContour=new Path2D('M800 625 Q806 745 770 841 Q773 862 794 878 Q829 890 832 931 Q839 969 813 987 Q705 1001 595 986 Q577 966 588 920 L575 925 Q568 899 581 874 Q590 860 601 859 L617 831 Q645 744 673 685 L700 625Z');
 mc.fillStyle='#ff0000';mc.fill(leftContour);mc.fillStyle='#00ff00';mc.fill(rightContour);
 function extraTexture(unit,name,source){gl.activeTexture(gl.TEXTURE0+unit);const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);uploadFiltered(source);gl.uniform1i(gl.getUniformLocation(program,name),unit);return t}
 const cleanTexture=extraTexture(1,'clean',underlay);extraTexture(2,'limbs',maskCanvas);gl.activeTexture(gl.TEXTURE0);
 let skinVersion=0,requestedSkin=initialName;host.dataset.renderedSkin=initialName;
 const skinImages=new Map();
 function decodeSkin(url){if(!skinImages.has(url)){const image=new Image();image.src=url;const task=image.decode().then(()=>image).catch(error=>{skinImages.delete(url);throw error});skinImages.set(url,task)}return skinImages.get(url)}
 async function selectSkin(name){
  const skin=window.saberSkins?.[name];if(!skin||requestedSkin===name)return;
  requestedSkin=name;const version=++skinVersion;host.dataset.skinLoading='true';
  try{
   const [art,clean]=await Promise.all([decodeSkin(skin.art),decodeSkin(skin.underlay)]);
   if(version!==skinVersion)return;
   // Upload both matching layers in one task. Never show an orange underlay
   // or a static replacement face while a different skin is loading.
   gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);uploadFiltered(art);
   gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,cleanTexture);uploadFiltered(clean);
   gl.activeTexture(gl.TEXTURE0);
   host.querySelectorAll('#saber-rig-lid-fur stop').forEach((stop,i)=>stop.setAttribute('stop-color',skin.lid[i]));
   host.dataset.renderedSkin=name;delete host.dataset.skinError;start();
  }catch(error){if(version===skinVersion){requestedSkin=host.dataset.renderedSkin;host.dataset.skinError='true';console.warn('Saber skin could not load:',name,error.message)}}
  finally{if(version===skinVersion)delete host.dataset.skinLoading}
 }
 const layerUniform=gl.getUniformLocation(program,'layer');
 // Keep the detailed fur at full resolution even when mounted hidden or shown
 // at classroom size. A 384px intermediate discarded detail before SVG scaling.
 // CSS handles display sizing; moving into/out of Studio must not resize the art.
 const renderResolution=Math.min(2048,gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),gl.getParameter(gl.MAX_TEXTURE_SIZE));
 canvas.width=canvas.height=renderResolution;gl.viewport(0,0,renderResolution,renderResolution);
 host.dataset.renderResolution=String(renderResolution);
 // The SVG shrinks this canvas again. Account for that second minification
 // rather than sending single-pixel fur detail to a ~190px on-screen tiger.
 const detailUniform=gl.getUniformLocation(program,'detailBias');
 function updateDetail(){
  const pixels=canvas.getBoundingClientRect().width*(window.devicePixelRatio||1);
  if(pixels<=0)return;
  // Retain a half-level of supersampled detail for the final browser resize.
  const bias=Math.max(0,Math.log2(renderResolution/pixels)-.5);
  gl.uniform1f(detailUniform,bias);host.dataset.detailBias=bias.toFixed(3);start();
 }
 new ResizeObserver(updateDetail).observe(pet);
 const uniforms=Object.fromEntries(['breath','ear','paw','pawRight','nose','sway','tilt','jaw','brow','rear','gaze'].map(k=>[k,gl.getUniformLocation(program,k)]));
 tiger.replaceChildren(fo);
 svg.querySelector('defs').insertAdjacentHTML('beforeend',`<linearGradient id="saber-rig-lid-fur" x2="0" y2="1"><stop stop-color="#bc752e"/><stop offset=".6" stop-color="#d1aa79"/><stop offset="1" stop-color="#ecd0a0"/></linearGradient><radialGradient id="saber-rig-gape"><stop stop-color="#492d25"/><stop offset="1" stop-color="#1c1511"/></radialGradient>
 <clipPath id="saber-rig-eye-left"><path d="M388 232Q400 224 416 238L460 278Q459 297 430 302Q390 301 384 266Q381 246 388 232Z"/></clipPath><clipPath id="saber-rig-eye-right"><path d="M652 232Q640 224 624 238L580 278Q581 297 610 302Q650 301 656 266Q659 246 652 232Z"/></clipPath>`);
 tiger.insertAdjacentHTML('beforeend',`<g id="saber-rig-face"><g clip-path="url(#saber-rig-eye-left)"><path id="saber-rig-lid-left" fill="url(#saber-rig-lid-fur)"/><path id="saber-rig-lash-left" fill="none" stroke="#34271c" stroke-width="5" stroke-linecap="round"/></g><g clip-path="url(#saber-rig-eye-right)"><path id="saber-rig-lid-right" fill="url(#saber-rig-lid-fur)"/><path id="saber-rig-lash-right" fill="none" stroke="#34271c" stroke-width="5" stroke-linecap="round"/></g><g id="saber-rig-mouth" opacity="0"><path id="saber-rig-mouth-shape" fill="url(#saber-rig-gape)" stroke="#342119" stroke-width="3"/><path id="saber-rig-mouth-tongue" fill="#ba7c72"/></g></g>
 <g id="saber-rig-headphones" visibility="hidden"><path d="M277 154C248 -14 786 -14 763 154" fill="none" stroke="#32261d" stroke-width="30"/><path d="M277 154C248 -14 786 -14 763 154" fill="none" stroke="#9c7542" stroke-width="18"/><path d="M277 154C248 -14 786 -14 763 154" fill="none" stroke="#e4c78f" stroke-width="2" stroke-dasharray="5 5"/>${[277,763].map((x,i)=>`<g transform="translate(${x} 159) rotate(${i?24:-24})"><rect x="-39" y="-60" width="78" height="120" rx="29" fill="#332c24" stroke="#211e19" stroke-width="6"/><rect x="-31" y="-51" width="62" height="102" rx="24" fill="#ac814a" stroke="#efdba5" stroke-width="3"/><rect x="-23" y="-42" width="46" height="84" rx="18" fill="#614630"/><path d="M-10 -16Q12 -24 13 -8L-1 20L-5 1Z" fill="#f0d9a6"/></g>`).join('')}</g>`);
 svg.insertAdjacentHTML('beforeend',`<g id="saber-rig-music" class="symbols" opacity="0">${[[90,380],[870,400],[110,650],[870,670]].map(([x,y],i)=>`<text x="${x}" y="${y}" font-size="105">${i%2?'♫':'♪'}</text>`).join('')}</g><g id="saber-rig-zs" class="symbols" opacity="0">${[[810,190],[860,130],[920,80]].map(([x,y],i)=>`<text x="${x}" y="${y}" font-size="${70+i*15}">${i?'Z':'z'}</text>`).join('')}</g>`);

 if(initialSkin)host.querySelectorAll('#saber-rig-lid-fur stop').forEach((stop,i)=>stop.setAttribute('stop-color',initialSkin.lid[i]));
 const state={mode:'idle',action:null,time:0,motion:true,idle:true,nextIdle:4,nextBlink:2,blinkStart:-10,index:0,frames:0};
 // A clipped row of small incisors sits inside the opening, never across the fangs.
 svg.querySelector('defs').insertAdjacentHTML('beforeend','<clipPath id="saber-rig-mouth-clip"><path id="saber-rig-mouth-clip-shape"/></clipPath>');
 $('#mouth').insertAdjacentHTML('beforeend','<g id="saber-rig-small-teeth" clip-path="url(#saber-rig-mouth-clip)" fill="#f6e7c9" stroke="#bba88a" stroke-width="1">'+[487,503,519,535,551].map(x=>`<path d="M${x-5} 462L${x+5} 462L${x+1} 477Q${x} 479 ${x-1} 477Z"/>`).join('')+'</g>');
 const durations={hello:2.5,happy:2.4,blink:.3,talk:2.3,ears:1.7,paw:1.65,nose:1.5,wobble:1.6,look:3.5,wake:3.4};
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)};
 let last=0,raf=0,speechTimer,inTick=false;
 function say(message){if(host.hidden||host.closest('.pet-studio'))return;clearTimeout(speechTimer);host.querySelector('.saber-speech').textContent=message;host.querySelector('.saber-speech').hidden=false;speechTimer=setTimeout(()=>host.querySelector('.saber-speech').hidden=true,3500)}
 function ui(){pet.dataset.state=state.mode;host.dataset.state=state.mode;}
 function play(name){if(name==='sleep'){state.mode='sleep';state.action=null;host.querySelector('.saber-speech').hidden=true}else if(name==='wake'||state.mode==='sleep'){state.mode='idle';state.action={name:'wake',start:state.time};say('That was a mammoth-sized nap!')}else if(name==='dance'){state.mode=state.mode==='dance'?'idle':'dance';state.action=null;if(state.mode==='dance')say('These paws have found their rhythm.')}else{state.mode='idle';state.action={name,start:state.time};if(name==='hello')say(['Big fangs. Bigger courage. You’ve got this!','Your prehistoric study buddy is here.','Ready to sink our teeth into something new?'][state.index++%3])}state.nextIdle=state.time+6;ui();start()}
 function set(id,key,value){$(id).setAttribute(key,value)}
 function tick(now){raf=0;if(document.hidden||host.hidden)return;inTick=true;const dt=last?Math.min((now-last)/1000,.06):0;last=now;if(state.motion&&!reduce.matches)state.time+=dt;const time=state.time;
  if(state.action&&time-state.action.start>=durations[state.action.name]){state.action=null;state.nextIdle=time+3;ui()}
  if(state.mode==='idle'&&!state.action&&state.idle&&time>state.nextIdle)play(['ears','happy','paw','nose','hello','talk','look','wobble'][state.index++%8]);
  if(state.mode==='idle'&&time>state.nextBlink){state.blinkStart=time;state.nextBlink=time+3.2+Math.random()*2}
  const action=state.action,name=action?.name,t=action?clamp((time-action.start)/durations[name]):0,envelope=Math.sin(t*Math.PI)**2;
  let close=0,happy=0,open=0,ear=0,paw=0,pawRight=0,nose=0,sway=0,tilt=0,gaze=0,rear=0;
  const blink=(time-state.blinkStart)/.3;if(blink>=0&&blink<1)close=Math.sin(blink*Math.PI)**2;
  if(name==='blink')close=envelope;
  if(name==='happy'||name==='hello'){happy=envelope;open=.4*envelope}
  if(name==='hello'||name==='paw')paw=1.25*envelope*(.82+.18*Math.sin(t*Math.PI*12));
  if(name==='ears'||name==='hello')ear=Math.sin(t*Math.PI*6)*envelope;
  if(name==='nose')nose=Math.sin(t*Math.PI*8)*envelope;
  if(name==='wobble'){sway=Math.sin(t*Math.PI*20)*envelope*1.5;tilt=sway*1.1;ear=-sway*.7}
  if(name==='look')gaze=Math.sin(t*Math.PI*2)*envelope;
  if(name==='talk')open=(.3+.7*(.5-.5*Math.cos(t*Math.PI*10)))*envelope;
  if(state.mode==='sleep'){close=1;open=.15+.5*(.5+.5*Math.sin(time*2*Math.PI/3.4))}
  if(name==='wake'){close=1-ease((t-.38)/.14);if(t>.62&&t<.72)close=.7*Math.sin((t-.62)/.1*Math.PI)**2;open=Math.sin(Math.PI*clamp((t-.05)/.85))**2;ear=.25*Math.sin(t*Math.PI*4)*envelope}
  if(state.mode==='dance'){sway=Math.sin(time*Math.PI*2/.8);tilt=sway*1.4;ear=.25*Math.sin(time*8);const step=Math.sin(time*Math.PI*2/1.2);paw=.6*Math.max(0,step)**2;pawRight=.6*Math.max(0,-step)**2;rear=-step;happy=.6;open=.32+.08*Math.sin(time*8)}
  const breath=Math.sin(time*Math.PI*2/3.4),pose={breath,ear,paw,pawRight,nose,sway,tilt,jaw:open,brow:happy,rear,gaze};state.pose=pose;
  gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);for(const [key,loc] of Object.entries(uniforms))gl.uniform1f(loc,pose[key]);for(let layer=0;layer<3;layer++){gl.uniform1f(layerUniform,layer);gl.drawArrays(gl.TRIANGLES,0,vertices.length/2)}
  const transform=`translate(${sway*9} ${-987*.007*breath}) scale(1 ${1+.007*breath}) rotate(${tilt} 520 465)`;set('#face','transform',transform);set('#headphones','transform',transform);set('#headphones','visibility',state.mode==='dance'||options.headwear==='headphones'?'visible':'hidden');
  for(const [side,x] of [['left',425],['right',615]]){let d='M0 0Z';const c=ease(close),upper=200+80*c,lower=335-55*c;if(c>.001)d=`M${x-50} 218H${x+50}V258Q${x} ${upper} ${x-50} 258Z M${x-50} 258Q${x} ${lower} ${x+50} 258V312H${x-50}Z`;set('#lid-'+side,'d',d);set('#lash-'+side,'d',c>.85?`M${x-34} 263Q${x} 278 ${x+34} 263`:'M0 0Z')}
  const sleeping=state.mode==='sleep',rx=sleeping?27:45+open*10,depth=(sleeping?5:2)+open*(name==='wake'?50:32),cy=468;
  set('#mouth','opacity',ease(open/.15));set('#mouth-shape','d',`M${520-rx} ${cy}Q520 ${cy-7} ${520+rx} ${cy}C${520+rx} ${cy+depth*1.5} ${520-rx} ${cy+depth*1.5} ${520-rx} ${cy}Z`);
  set('#mouth-clip-shape','d',$('#mouth-shape').getAttribute('d'));set('#small-teeth','opacity',sleeping?0:1);
  set('#mouth-tongue','d',sleeping?'M0 0Z':`M${520-rx*.55} ${cy+depth*.95}Q520 ${cy+depth*.5} ${520+rx*.55} ${cy+depth*.95}Q520 ${cy+depth*1.2} ${520-rx*.55} ${cy+depth*.95}Z`);
  set('#music','opacity',state.mode==='dance'?1:0);set('#zs','opacity',sleeping?1:0);
  $('#music').querySelectorAll('text').forEach((node,i)=>{const p=(time/2.4+i*.25)%1;node.setAttribute('transform',`translate(${Math.sin(p*Math.PI*2)*12} ${25-135*p})`);node.style.opacity=Math.sin(Math.PI*p)});
  $('#zs').querySelectorAll('text').forEach((node,i)=>{const p=(time/3+i/3)%1;node.setAttribute('transform',`translate(${-20+45*p} ${45-110*p})`);node.style.opacity=p<.25?p*4:1-(p-.25)/.75});
  state.frames++;inTick=false;if(state.motion&&!reduce.matches&&!host.hidden)raf=requestAnimationFrame(tick);
 }
 function start(){if(!raf&&!inTick&&!document.hidden&&!host.hidden)raf=requestAnimationFrame(tick)}
 document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);raf=0;last=0;start()});reduce.addEventListener('change',()=>{last=0;start()});
 ui();start();
 return {play,reset(){state.mode='idle';state.action=null;state.time=0;state.nextIdle=4;last=0;},update(value){const wasAsleep=options.asleep;options=value;selectSkin(value.skin);state.motion=value.motion;const mode=value.asleep?'sleep':value.radio?'dance':'idle';if(mode!==state.mode){if(mode==='idle'&&wasAsleep)play('wake');else{state.mode=mode;state.action=null;ui();}}if(host.hidden){cancelAnimationFrame(raf);raf=0;last=0;host.querySelector('.saber-speech').hidden=true;}else start();}};
}
