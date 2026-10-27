/* Local-only Highland cow rig. A single GPU mesh bends the original silhouette
   continuously: no detached ear/leg cutouts and no competing CSS timelines. */
(async()=>{'use strict';
const $=s=>document.querySelector(s),ns='http://www.w3.org/2000/svg',pet=$('.pet'),cow=$('.cow'),svg=pet.querySelector('svg');
const style=document.createElement('style');style.textContent=`.cow,.pet.hello .cow,.pet.dance .cow{animation:none!important}.notes text{animation:none!important}.controls{align-self:start}.action-set{display:grid;grid-template-columns:1fr 1fr;gap:6px}.action-set button{font-size:13px;padding:9px 5px}#speech{position:absolute;top:16px;left:50%;transform:translateX(-50%);max-width:90%;padding:9px 15px;border-radius:14px;background:#f7ecd3;color:#493221;font-size:14px;text-align:center;pointer-events:none}#speech[hidden]{display:none}.stage{min-height:570px}.pet:focus-visible{outline:2px solid #e2bc78;outline-offset:10px}#animation-status{min-height:40px}.symbols text{paint-order:stroke;stroke:#28372b;stroke-width:6;fill:#ebc68d;font-family:Arial,sans-serif;font-weight:bold}`;document.head.append(style);
$('.status').textContent='Working animation test · artwork, platform and nameplate remain separate. Close-up is enlarged for inspection; the four display sizes match the other pets’ visible height.';
$('#size').innerHTML='<option value="125">Small · actual size</option><option value="145">Medium · actual size</option><option value="170">Large · actual size</option><option value="200">Extra large · actual size</option><option value="330" selected>Animation close-up</option>';
$('#size').onchange=e=>pet.style.width=e.target.value+'px';
const controls=document.createElement('div');controls.className='action-set';controls.innerHTML=['happy:Happy eyes','blink:Blink','talk:Mouth movement','ears:Ear flick','tail:Tail swish','hoof:Hoof lift','nose:Nose wiggle'].map(s=>{const [id,label]=s.split(':');return `<button class="action" data-action="${id}">${label}</button>`}).join('')+'<button class="action" id="sleep">Sleep</button><button class="action" id="wake">Wake up</button>';
$('#dance').after(controls);controls.insertAdjacentHTML('afterend','<label class="check"><input type="checkbox" id="idle" checked> Idle reactions</label><p id="animation-status" role="status">Loading animation…</p>');
$('#motion').parentElement.lastChild.textContent=' Motion';
$('.stage').insertAdjacentHTML('beforeend','<div id="speech" role="status" hidden></div>');
const add=(parent,markup)=>parent.insertAdjacentHTML('beforeend',markup);
add(svg.querySelector('defs'),`<radialGradient id="mouth-depth"><stop stop-color="#532b28"/><stop offset="1" stop-color="#21110e"/></radialGradient><linearGradient id="lid-color" x2="0" y2="1"><stop stop-color="#9c5427"/><stop offset=".55" stop-color="#c87b3b"/><stop offset="1" stop-color="#a15b2d"/></linearGradient><clipPath id="mouth-window"><path id="mouth-window-path"/></clipPath>`);
const original=new Image();original.src=window.highlandArtData;await original.decode();
// Render the established SVG silhouette once into the texture; GPU vertices do the motion.
const texture=document.createElement('canvas');texture.width=1024;texture.height=1024;const ctx=texture.getContext('2d');ctx.save();const silhouette=new Path2D();$('#cow-cut').querySelectorAll('path').forEach(p=>silhouette.addPath(new Path2D(p.getAttribute('d'))));ctx.clip(silhouette);ctx.drawImage(original,0,0,1024,1536);ctx.restore();
const fo=document.createElementNS(ns,'foreignObject');fo.setAttribute('width','1024');fo.setAttribute('height','1024');const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1024;canvas.style.cssText='width:1024px;height:1024px;display:block';fo.append(canvas);
const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:true});
let render=()=>{};
if(!gl)throw Error('This animation test requires WebGL. Enable browser hardware acceleration.');
const vs=`attribute vec2 p;varying vec2 uv;
uniform float ear,tail,hoof,hoofRight,rearStep,nose,breath,wobble;
float field(vec2 q,vec2 c,vec2 r){vec2 d=(q-c)/r;return exp(-dot(d,d)*2.0);}
void main(){uv=p/1024.0;vec2 q=p;
float el=field(p,vec2(243.,277.),vec2(125.,98.));float er=field(p,vec2(789.,277.),vec2(125.,98.));q.y+=ear*(el-er)*23.;q.x+=ear*(el+er)*6.;
float t=field(p,vec2(160.,720.),vec2(130.,160.))*(1.-smoothstep(230.,270.,p.x));q.x+=tail*t*43.;q.y-=tail*t*10.;
// Forehoof lifts and rear-leg weight shifts have separate, smoothly blended masks.
float h=smoothstep(376.,398.,p.x)*(1.-smoothstep(519.,531.,p.x))*smoothstep(610.,830.,p.y);
q.y-=hoof*h*67.;q.x-=hoof*h*19.;
float hr=smoothstep(523.,535.,p.x)*(1.-smoothstep(645.,667.,p.x))*smoothstep(610.,830.,p.y);
q.y-=hoofRight*hr*67.;q.x+=hoofRight*hr*19.;
// Alternating rear-knee flex: taper to zero at the soles to preserve contact.
float rearAnchor=1.-smoothstep(825.,884.,p.y);
float rearL=field(p,vec2(337.,785.),vec2(65.,125.))*rearAnchor;
float rearR=field(p,vec2(703.,785.),vec2(65.,125.))*rearAnchor;
q.x+=rearStep*11.*(rearL+rearR);
q.y+=rearStep*4.*(rearL-rearR);
float n=field(p,vec2(512.,373.),vec2(85.,55.));q.x+=nose*n*6.;
// Restore visible torso/head breathing, fading out before the contact points.
float anchoredBreath=1.-smoothstep(730.,835.,p.y);
q.y+=(p.y-909.)*.012*breath*anchoredBreath;
float chest=field(p,vec2(512.,620.),vec2(240.,165.))*(1.-smoothstep(740.,815.,p.y));
q.x+=(p.x-512.)*.035*breath*chest;
float upper=1.-smoothstep(570.,835.,p.y);q.x+=wobble*13.*upper;
// A subtle knee shuffle, never whole-body vertical bobbing.
float knees=field(p,vec2(465.,750.),vec2(120.,95.))*(1.-smoothstep(815.,865.,p.y));q.x+=wobble*3.*knees;
gl_Position=vec4(q.x/512.-1.,1.-q.y/512.,0.,1.);}`;
const fs=`precision mediump float;varying vec2 uv;uniform sampler2D art;void main(){gl_FragColor=texture2D(art,uv);}`;
function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
const verts=[];for(let y=0;y<1024;y+=16)for(let x=0;x<1024;x+=16)verts.push(x,y,x+16,y,x,y+16,x+16,y,x+16,y+16,x,y+16);
const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.STATIC_DRAW);const pos=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
const uniforms=Object.fromEntries(['ear','tail','hoof','hoofRight','rearStep','nose','breath','wobble'].map(k=>[k,gl.getUniformLocation(program,k)]));
render=values=>{gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);for(const k in uniforms)gl.uniform1f(uniforms[k],values[k]||0);gl.drawArrays(gl.TRIANGLES,0,verts.length/2)};
cow.replaceChildren(fo);cow.removeAttribute('clip-path');
add(cow,`<g id="face-motion"><g id="lids">${[[420,289],[609,289]].map(([x,y],i)=>`<g><clipPath id="lid-crop-${i}"><path id="lid-path-${i}"/></clipPath><g clip-path="url(#lid-crop-${i})"><image href="highland-art.png" width="1024" height="1536" transform="translate(0 61)"/></g><path id="lid-line-${i}" fill="none" stroke="#512b18" stroke-width="5" stroke-linecap="round"/></g>`).join('')}</g><g id="mouth-motion" opacity="0"><path id="mouth-shape" fill="url(#mouth-depth)" stroke="#723e30" stroke-width="3"/><g clip-path="url(#mouth-window)"><ellipse id="tongue" cx="512" cy="446" rx="24" ry="11" fill="#c9897e"/></g><path id="lip" fill="none" stroke="#c48a69" stroke-width="3"/></g></g>`);
svg.querySelector('.notes').remove();add(svg,`<g class="symbols" id="music" opacity="0"><text x="110" y="450" font-size="110">♪</text><text x="850" y="530" font-size="120">♫</text><text x="160" y="700" font-size="100">♫</text><text x="810" y="260" font-size="105">♪</text></g><g class="symbols" id="sleep-zs" opacity="0"><text x="780" y="200" font-size="75">z</text><text x="830" y="150" font-size="95">Z</text><text x="880" y="100" font-size="110">Z</text></g>`);
const state={mode:'idle',action:null,motion:true,idle:true,phase:0,frames:0,nextIdle:3,nextBlink:2,blinkStart:-99,index:0};const durations={hello:2.7,happy:2.5,blink:.32,talk:2.2,ears:1.7,tail:1.8,hoof:2.4,nose:1.7,wake:3.2};const reduce=matchMedia('(prefers-reduced-motion: reduce)');let last=0,raf,speechTimer;
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},set=(id,key,value)=>$(id).setAttribute(key,value);
function say(text){clearTimeout(speechTimer);$('#speech').textContent=text;$('#speech').hidden=false;speechTimer=setTimeout(()=>$('#speech').hidden=true,3500)}
function ui(){const name=state.action?.name;$('#animation-status').textContent=state.mode==='sleep'?'Sleeping · continuous breathing and gentle snoring':state.mode==='dance'?'Dancing · ears, tail and happy eyes':name?name==='wake'?'Waking up with a yawn':name.replace(/^./,s=>s.toUpperCase()):'Awake · watching over your day';$('#dance').setAttribute('aria-pressed',String(state.mode==='dance'));$('#sleep').setAttribute('aria-pressed',String(state.mode==='sleep'));pet.setAttribute('aria-label',state.mode==='sleep'?'Wake your Highland cow':'Greet your Highland cow');}
function play(name){if(name==='sleep'){state.mode='sleep';state.action=null;$('#speech').hidden=true}else if(name==='wake'||state.mode==='sleep'){state.mode='idle';state.action={name:'wake',start:state.phase};say('Good morning! Ready for a fresh start?')}else if(name==='dance'){state.mode=state.mode==='dance'?'idle':'dance';state.action=null;if(state.mode==='dance')say('A little Highland shuffle!')}else{state.mode='idle';state.action={name,start:state.phase};if(name==='hello')say(['Hello there, friend!','You’ve got this!','Ready for a little adventure?'][state.index%3])}state.nextIdle=state.phase+6;ui()}
$('#hello').onclick=pet.onclick=()=>play(state.mode==='sleep'?'wake':'hello');$('#dance').onclick=()=>play('dance');$('#sleep').onclick=()=>play('sleep');$('#wake').onclick=()=>play('wake');controls.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>play(b.dataset.action));$('#motion').onchange=e=>{state.motion=e.target.checked};$('#idle').onchange=e=>{state.idle=e.target.checked;state.nextIdle=state.phase+3};
function tick(now){const dt=last?Math.min((now-last)/1000,.05):0;last=now;const moving=state.motion&&!reduce.matches;if(moving)state.phase+=dt;const time=state.phase;
if(state.action&&time-state.action.start>=durations[state.action.name]){state.action=null;state.nextIdle=time+2.5;ui()}
if(moving&&state.mode==='idle'&&!state.action&&state.idle&&time>state.nextIdle)play(['ears','tail','happy','talk','hello','hoof','nose'][state.index++%7]);
if(moving&&state.mode==='idle'&&time>state.nextBlink){state.blinkStart=time;state.nextBlink=time+3.1+Math.random()*2}
const a=state.action,name=a?.name,t=a?clamp((time-a.start)/durations[name]):0,env=Math.sin(Math.PI*t)**2;
let close=0,happy=0,open=0,ear=0,tail=0,hoof=0,hoofRight=0,rearStep=0,nose=0,wobble=0;const bt=(time-state.blinkStart)/.32;if(bt>=0&&bt<1)close=Math.sin(bt*Math.PI)**2;
if(name==='blink')close=Math.sin(t*Math.PI)**2;
if(name==='happy'||name==='hello'){happy=env;open=.3*env}
if(name==='ears'||name==='hello')ear=Math.sin(t*Math.PI*8)*env;
if(name==='tail'||name==='hello')tail=Math.sin((time-a.start)*Math.PI*2/.36)*smooth(t/.14)*(1-smooth((t-.85)/.15));
if(name==='hoof'||name==='hello')hoof=smooth(t/.25)*(1-smooth((t-.62)/.38))*(name==='hello'?.7:1);
if(name==='nose')nose=Math.sin(t*Math.PI*8)*env;
if(name==='talk')open=(.2+.8*(.5-.5*Math.cos(t*Math.PI*10)))*env;
const breath=Math.sin(time*Math.PI*2/3.4);
if(state.mode==='sleep'){close=1;open=.08+.48*(.5+.5*Math.sin(time*Math.PI*2/3.4));}
if(name==='wake'){close=1-smooth((t-.35)/.5);open=.95*Math.sin(Math.PI*clamp((t-.05)/.9))**2;ear=.4*Math.sin(t*Math.PI*4)*env;}
if(state.mode==='dance'){wobble=Math.sin(time*Math.PI*2/.7);ear=.35*Math.sin(time*9);tail=.45*Math.sin(time*14);happy=.75;open=.35+.08*Math.sin(time*8);const step=Math.sin(time*Math.PI*2/1.4);hoof=.65*Math.max(0,step)**2;hoofRight=.65*Math.max(0,-step)**2;rearStep=step;}
cow.removeAttribute('transform');
state.pose={ear,tail,hoof,hoofRight,rearStep,nose,breath,wobble};render(state.pose);window.highlandAccessoryFrame?.(state.pose);
// Expressions follow the head's breathing without moving any feet.
set('#face-motion','transform',`translate(${wobble*13} ${-909*.012*breath}) scale(1 ${1+.012*breath})`);
// Cover eyes with nearby fur, never scale the eye itself. Happy lids lift gently from below.
for(const [i,cx] of [[0,420],[1,609]]){const top=266+close*43,bottom=313-happy*20;let d='M0 0Z';if(close>.001)d=`M${cx-25} 264H${cx+25}V${top}Q${cx} ${top+7} ${cx-25} ${top}Z`;if(happy>.001&&close<.95)d+=` M${cx-25} ${bottom}Q${cx} ${bottom-9} ${cx+25} ${bottom}V318H${cx-25}Z`;set('#lid-path-'+i,'d',d);set('#lid-line-'+i,'d',close>.85?`M${cx-20} 298Q${cx} 308 ${cx+20} 298`:'M0 0Z');}
const sleeping=state.mode==='sleep';const rx=sleeping?24+open*7:28+open*6,ry=sleeping?3+open*37:2+open*24,y=421;const d=`M${512-rx} ${y}Q512 ${y-4} ${512+rx} ${y}C${512+rx} ${y+ry*1.5} ${512-rx} ${y+ry*1.5} ${512-rx} ${y}Z`;
set('#tongue','opacity',sleeping?0:.65);
set('#mouth-motion','opacity',smooth(open/.12));set('#mouth-shape','d',d);set('#mouth-window-path','d',d);set('#tongue','cy',y+ry*.95);set('#tongue','rx',rx*.65);set('#lip','d',`M${512-rx} ${y}Q512 ${y-4} ${512+rx} ${y}`);
set('#music','opacity',state.mode==='dance'?1:0);set('#sleep-zs','opacity',state.mode==='sleep'?1:0);
$('#music').querySelectorAll('text').forEach((e,i)=>{const p=(time/2.4+i*.25)%1;e.setAttribute('transform',`translate(0 ${25-135*p}) rotate(${-8+16*p} ${e.getAttribute('x')} ${e.getAttribute('y')})`);e.style.opacity=Math.sin(p*Math.PI)});
$('#sleep-zs').querySelectorAll('text').forEach((e,i)=>{const p=(time/3+i/3)%1;e.setAttribute('transform',`translate(${-20+45*p} ${45-110*p})`);e.style.opacity=p<.25?p*4:1-(p-.25)/.75});
state.frames++;raf=requestAnimationFrame(tick);
}
document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);last=0;if(!document.hidden)raf=requestAnimationFrame(tick)});
window.highlandTest={state,play,render,ready:true,sizes:{small:125,medium:145,large:170,'extra-large':200},renderer:'continuous WebGL mesh'};ui();raf=requestAnimationFrame(tick);
})().catch(error=>{console.error(error);document.querySelector('#animation-status').textContent='Animation could not start: '+error.message});
