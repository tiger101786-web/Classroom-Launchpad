/* Approved Highland cow artwork and animation rig, promoted from the local test. */
window.highlandDefaults=()=>({skin:'Copper',name:'Hamish',nameplate:true,platform:true,motion:true,size:'medium',asleep:false,headwear:'none',neckwear:'none'});
window.highlandMarkup=()=>"<svg viewBox=\"0 0 1024 1420\" role=\"img\" aria-label=\"Seated copper Highland cow on a grassy stone platform with wooden nameplate\"><defs>\n<clipPath id=\"highland-cow-cut\"><path d=\"M217 57Q221 44 226 55C235 111 264 143 344 146L364 177L343 203C276 207 233 166 222 116Q214 83 217 57Z\"/><path d=\"M217 48Q210 90 234 137Q252 174 295 184L331 178L310 163L324 154L301 150L324 138L302 128L334 129L320 115L348 122L333 104L367 112L348 96L389 102L370 83L413 96L403 75L445 91L445 65L462 85L485 46L488 80L516 36L514 70L548 45L537 77L574 62L558 91L604 74L582 99L631 91L612 112L659 104L643 126L691 117L677 145L709 151Q758 126 793 53Q804 38 809 64Q815 127 790 168Q772 195 747 201L776 199L769 210L801 207L790 221L821 220L810 234L841 239L827 251L847 265L830 279L840 291L818 302L822 316L794 320L793 335L763 334L749 353L726 344L739 383L729 407L742 431L724 457L737 483L720 506L735 538L718 565L740 593L725 612L754 638L744 651L779 685L783 715L800 749L785 776Q811 810 787 865Q772 889 726 882L677 870Q662 908 608 910L512 909L447 910Q411 907 399 887L370 873Q329 891 286 878L262 854L241 822L215 809L198 817L169 800L145 775L133 748L126 722L133 696L129 674L148 655L155 630L168 611L164 648L186 624L175 658L195 639L186 674L205 653L200 687Q206 722 229 740L251 742L262 707L254 687L272 654L269 630L292 600L288 574L308 544L301 519L318 489L304 469L314 443L302 412L313 383L301 356L278 350L250 357L232 337L210 337L213 319L190 307L199 291L184 277L200 265L190 251L214 241L204 231L237 220L225 209L264 202L294 199Q242 187 219 141Q204 97 217 48Z\"/></clipPath>\n<clipPath id=\"highland-ground-cut\"><path d=\"M65 1001L82 973L99 985L101 941L119 968L133 925L145 956L162 915L172 948L188 922L200 941L206 907L220 944L234 917L246 953L264 939L279 961L301 951L317 978L342 969L370 996L408 1014L440 1040L400 1070L88 1043Z\"/><path d=\"M746 1003L762 970L778 978L794 920L807 960L822 938L839 955L850 922L865 956L886 929L895 961L918 938L928 967L944 955L935 999L954 1015L923 1040L766 1035Z\"/><path d=\"M52 1014L77 992L126 980L172 977L211 969L267 978L318 970L372 978L430 969L483 978L534 968L580 979L639 969L690 975L738 967L780 978L830 972L880 984L934 997Q977 1012 974 1057L967 1090L981 1115L976 1155Q937 1195 824 1202Q510 1223 203 1201Q79 1195 44 1160L44 1121L57 1080Q43 1053 52 1014Z\"/></clipPath>\n<clipPath id=\"highland-plate-cut\"><path d=\"M24 1305Q43 1273 96 1258L127 1254L169 1264Q512 1256 852 1265L889 1254L936 1266Q989 1290 1004 1334L1004 1394Q992 1442 944 1467L898 1474L853 1464H176L134 1474L83 1461Q31 1440 21 1395L20 1342Z\"/></clipPath></defs>\n<g class=\"highland-platform\" transform=\"translate(512 910) scale(1.12 1.3) translate(-512 -1050)\" clip-path=\"url(#highland-ground-cut)\"><image href=\"highland-pet/heather-platform.png\" width=\"1024\" height=\"1536\"/></g>\n<g class=\"cow\" clip-path=\"url(#highland-cow-cut)\"><image href=\"highland-pet/highland-art.png\" width=\"1024\" height=\"1536\"/></g>\n<g class=\"highland-nameplate\" transform=\"translate(0 -80)\"><g clip-path=\"url(#highland-plate-cut)\"><image href=\"highland-pet/highland-art.png\" width=\"1024\" height=\"1536\"/></g><text id=\"highland-pet-name\" x=\"512\" y=\"1380\" dominant-baseline=\"middle\" text-anchor=\"middle\" fill=\"#492a16\" style=\"font:700 85px Georgia,serif\">Hamish</text></g>\n<g class=\"notes\"><text x=\"95\" y=\"540\">♪</text><text x=\"870\" y=\"440\">♫</text></g></svg>";
window.createHighlandPet=function(onChange,onCustomize){
 const host=document.createElement('div');host.className='highland-companion';host.hidden=true;
 host.innerHTML='<button type="button" class="pet-button" aria-label="Open Highland Cow controls">'+highlandMarkup()+'</button><div id="highland-speech" class="highland-speech" role="status" hidden></div>';
 document.body.append(host);
 let preferences=highlandDefaults(),visible=false,hidden=false,radio=false,account='',position=null,drag=null,suppress=false,rig=null;
 const pet=host.querySelector('.pet-button'),positionKey=()=> 'highland-position:'+account;
 function place(){if(host.hidden||host.closest('.pet-studio'))return;const b=pet.getBoundingClientRect();host.style.left=Math.max(8,Math.min(position?.x??innerWidth-b.width-34,innerWidth-b.width-8))+'px';host.style.top=Math.max(8,Math.min(position?.y??innerHeight*.48-90,innerHeight-b.height-8))+'px';}
 function remember(){try{localStorage.setItem(positionKey(),JSON.stringify(position))}catch{}}
 function refresh(){host.hidden=!visible||hidden;host.dataset.size=preferences.size;const label=host.querySelector('#highland-pet-name');label.textContent=preferences.name;label.style.fontSize=Math.min(85,635/Math.max(1,Array.from(preferences.name).length*.63))+'px';host.querySelector('.highland-platform').style.display=preferences.platform?'':'none';host.querySelector('.highland-nameplate').style.display=preferences.platform&&preferences.nameplate?'':'none';host.querySelector('.highland-speech').hidden=true;rig?.update({...preferences,radio});place();}
 pet.onclick=()=>{if(suppress){suppress=false;return}if(preferences.asleep){preferences={...preferences,asleep:false};refresh();onChange({...preferences})}else onCustomize?.()};
 pet.addEventListener('pointerdown',e=>{if(e.button!==0||host.closest('.pet-studio'))return;const b=pet.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:b.left,top:b.top,moved:false};pet.setPointerCapture(e.pointerId)});
 pet.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)<6)return;drag.moved=true;position={x:drag.left+dx,y:drag.top+dy};host.querySelector('.highland-speech').hidden=true;place()});
 function end(e){if(!drag||drag.id!==e.pointerId)return;suppress=drag.moved;if(drag.moved)remember();drag=null}
 pet.addEventListener('pointerup',end);pet.addEventListener('pointercancel',end);
 pet.addEventListener('keydown',e=>{if(host.closest('.pet-studio'))return;const d={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[e.key];if(!d)return;e.preventDefault();const b=pet.getBoundingClientRect();position={x:b.left+d[0],y:b.top+d[1]};place();remember()});
 window.addEventListener('resize',place);
 mountHighlandRig(host).then(value=>{rig=value;host.dataset.ready='true';refresh()}).catch(error=>{host.dataset.ready='error';console.warn('Highland cow is displaying its static artwork:',error.message)});
 return {host,play(name){if(!host.hidden&&!preferences.asleep&&preferences.motion)rig?.play(({excited:'hello',greet:'hello',mouth:'talk'})[name]||name)},update(value){if(account!==value.account){account=value.account;position=null;hidden=false;rig?.reset();try{const p=JSON.parse(localStorage.getItem(positionKey())||'null');if(Number.isFinite(p?.x)&&Number.isFinite(p?.y))position=p}catch{}}preferences={...highlandDefaults(),...value.preferences};visible=value.visible;radio=value.radio;refresh()},show(){hidden=false;refresh()},hide(){hidden=true;refresh()},reset(){position=null;try{localStorage.removeItem(positionKey())}catch{}place()},refresh};
};
async function mountHighlandRig(host){
const $=s=>host.querySelector(s.replace(/#([a-z][a-z0-9-]*)/gi,'#highland-$1')),ns='http://www.w3.org/2000/svg',pet=$('.pet-button'),cow=$('.cow'),svg=pet.querySelector('svg');
let options=highlandDefaults();
const add=(parent,markup)=>parent.insertAdjacentHTML('beforeend',markup.replace(/id="([^"]+)"/g,'id="highland-$1"').replaceAll('url(#','url(#highland-').replaceAll('href="highland-art.png"','href="highland-pet/highland-art.png"'));
add(svg.querySelector('defs'),`<radialGradient id="mouth-depth"><stop stop-color="#532b28"/><stop offset="1" stop-color="#21110e"/></radialGradient><linearGradient id="lid-color" x2="0" y2="1"><stop stop-color="#9c5427"/><stop offset=".55" stop-color="#c87b3b"/><stop offset="1" stop-color="#a15b2d"/></linearGradient><clipPath id="mouth-window"><path id="mouth-window-path"/></clipPath>`);
const original=new Image();original.src='highland-pet/highland-art.png';await original.decode();
// Render the established SVG silhouette once into the texture; GPU vertices do the motion.
const texture=document.createElement('canvas');texture.width=1024;texture.height=1024;const ctx=texture.getContext('2d');ctx.save();const silhouette=new Path2D();$('#cow-cut').querySelectorAll('path').forEach(p=>silhouette.addPath(new Path2D(p.getAttribute('d'))));ctx.clip(silhouette);ctx.drawImage(original,0,0,1024,1536);ctx.restore();
const fo=document.createElementNS(ns,'foreignObject');fo.setAttribute('width','1024');fo.setAttribute('height','1024');const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1024;canvas.style.cssText='width:1024px;height:1024px;display:block';fo.append(canvas);
const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:true});
let render=()=>{};
if(!gl)throw Error('This animation test requires WebGL. Enable browser hardware acceleration.');
const vs=`attribute vec2 p;varying vec2 uv;
uniform float ear,tail,hoof,hoofRight,rearStep,nose,breath,wobble,attachment;
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
// Accessories use their approved rigid fitting transforms on the same GPU clock.
if(attachment>0.5){q=p;q.y+=(p.y-909.)*.012*breath;q.x+=wobble*(attachment>1.5&&attachment<2.5?10.:13.);
 if(attachment>2.5){q.x+=ear*(el+er)*6.;q.y+=ear*(el-er)*23.;}}
gl_Position=vec4(q.x/512.-1.,1.-q.y/512.,0.,1.);}`;
const fs=`precision mediump float;varying vec2 uv;uniform sampler2D art;void main(){gl_FragColor=texture2D(art,uv);}`;
function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
const verts=[];for(let y=0;y<1024;y+=16)for(let x=0;x<1024;x+=16)verts.push(x,y,x+16,y,x,y+16,x+16,y,x+16,y+16,x,y+16);
const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.STATIC_DRAW);const pos=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
const uniforms=Object.fromEntries(['ear','tail','hoof','hoofRight','rearStep','nose','breath','wobble'].map(k=>[k,gl.getUniformLocation(program,k)]));
const attachment=gl.getUniformLocation(program,'attachment'),wearableTextures={};
gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
render=values=>{gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);for(const k in uniforms)gl.uniform1f(uniforms[k],values[k]||0);
 gl.uniform1f(attachment,0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.drawArrays(gl.TRIANGLES,0,verts.length/2);
 for(const id of accessories.selected){gl.uniform1f(attachment,id==='scarf'?2:id==='headphones'?3:1);gl.bindTexture(gl.TEXTURE_2D,wearableTextures[id]);gl.drawArrays(gl.TRIANGLES,0,verts.length/2)}
};
cow.replaceChildren(fo);cow.removeAttribute('clip-path');
add(cow,`<g id="face-motion"><g id="lids">${[[420,289],[609,289]].map(([x,y],i)=>`<g><clipPath id="lid-crop-${i}"><path id="lid-path-${i}"/></clipPath><g clip-path="url(#lid-crop-${i})"><image href="highland-art.png" width="1024" height="1536" transform="translate(0 61)"/></g><path id="lid-line-${i}" fill="none" stroke="#512b18" stroke-width="5" stroke-linecap="round"/></g>`).join('')}</g><g id="mouth-motion" opacity="0"><path id="mouth-shape" fill="url(#mouth-depth)" stroke="#723e30" stroke-width="3"/><g clip-path="url(#mouth-window)"><ellipse id="tongue" cx="512" cy="446" rx="24" ry="11" fill="#c9897e"/></g><path id="lip" fill="none" stroke="#c48a69" stroke-width="3"/></g></g>`);
svg.querySelector('.notes').remove();add(svg,`<g class="symbols" id="music" opacity="0"><text x="110" y="450" font-size="110">♪</text><text x="850" y="530" font-size="120">♫</text><text x="160" y="700" font-size="100">♫</text><text x="810" y="260" font-size="105">♪</text></g><g class="symbols" id="sleep-zs" opacity="0"><text x="780" y="200" font-size="75">z</text><text x="830" y="150" font-size="95">Z</text><text x="880" y="100" font-size="110">Z</text></g>`);
const state={mode:'idle',action:null,motion:true,idle:true,phase:0,frames:0,nextIdle:3,nextBlink:2,blinkStart:-99,index:0};const durations={hello:2.7,happy:2.5,blink:.32,talk:2.2,ears:1.7,tail:1.8,hoof:2.4,nose:1.7,wake:3.2};const reduce=matchMedia('(prefers-reduced-motion: reduce)');let last=0,raf,speechTimer;
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},set=(id,key,value)=>$(id).setAttribute(key,value);
function say(text){if(host.hidden||host.closest('.pet-studio'))return;clearTimeout(speechTimer);$('#speech').textContent=text;$('#speech').hidden=false;speechTimer=setTimeout(()=>$('#speech').hidden=true,3500)}
const accessories=await window.createHighlandAccessories(host);
for(const [id,image] of Object.entries(accessories.artwork)){const t=gl.createTexture();wearableTextures[id]=t;gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)}
function ui(){host.dataset.state=state.mode;accessories.update(options,state.mode==='dance');}
function play(name){if(name==='sleep'){state.mode='sleep';state.action=null;$('#speech').hidden=true}else if(name==='wake'||state.mode==='sleep'){state.mode='idle';state.action={name:'wake',start:state.phase};say('Morning mist is lifting. Ready to roam the Highlands!')}else if(name==='dance'){state.mode=state.mode==='dance'?'idle':'dance';state.action=null;if(state.mode==='dance')say('A little Highland shuffle!')}else{state.mode='idle';state.action={name,start:state.phase};if(name==='hello')say(['Hello from the heather, wee friend!','Hooves steady, horns high. You’ve got this!','Fancy a wee adventure beyond the pasture?'][state.index%3])}state.nextIdle=state.phase+6;ui()}

function tick(now){raf=0;if(host.hidden||document.hidden)return;const dt=last?Math.min((now-last)/1000,.05):0;last=now;const moving=state.motion&&!reduce.matches;if(moving)state.phase+=dt;const time=state.phase;
if(state.action&&time-state.action.start>=durations[state.action.name]){state.action=null;state.nextIdle=time+2.5;if(options.radio&&!options.asleep)state.mode='dance';ui()}
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
state.pose={ear,tail,hoof,hoofRight,rearStep,nose,breath,wobble};render(state.pose);
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
state.frames++;if(state.motion&&!reduce.matches)raf=requestAnimationFrame(tick);
}

function start(){if(!raf&&!host.hidden&&!document.hidden){last=0;raf=requestAnimationFrame(tick)}}
function update(value){options=value;state.motion=value.motion;state.idle=true;if(value.asleep&&state.mode!=='sleep')play('sleep');else if(!value.asleep&&state.mode==='sleep')play('wake');if(!value.asleep&&state.action?.name!=='wake'){if(value.radio)state.mode='dance';else if(state.mode==='dance')state.mode='idle';}if(!value.motion||reduce.matches){state.action=null;state.mode=value.asleep?'sleep':'idle';}cancelAnimationFrame(raf);raf=0;last=0;ui();start()}
document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);raf=0;last=0;start()});reduce.addEventListener('change',()=>update(options));
return {play(name){if(!durations[name]||!state.motion||reduce.matches)return;play(name);start()},update,reset(){state.mode='idle';state.action=null;state.phase=0;state.nextIdle=3;state.nextBlink=2;state.blinkStart=-99;state.index=0;clearTimeout(speechTimer);$('#speech').hidden=true}};
}

