/* Labubu: approved local artwork and animations, scoped to one live companion. */
window.labubuDefaults=()=>({skin:'Tan',name:'Labubu',nameplate:true,platform:true,headwear:'none',motion:true,size:'medium',asleep:false});
window.createLabubuPet=function(onChange,onCustomize){'use strict';
const host=document.createElement('div');host.className='labubu-companion';host.hidden=true;
host.innerHTML='<button class="pet-button" type="button" aria-label="Open Labubu controls"></button><div class="labubu-speech" role="status" hidden></div>';document.body.append(host);
let renderedSkin=null;
let prefs=labubuDefaults(),account='',visible=false,hidden=false,radio=false,position=null,drag=null,suppress=false;
const $=s=>host.querySelector(s),ns='http://www.w3.org/2000/svg';
const original='labubu-pet/tan.png',underlay='labubu-pet/face-underlay.png';
// Cached renders preserve the approved color masks, but avoid nested full-size
// recoloring passes inside each animated ear/hand filter.
function cachedArt(skin,source=original){const part=source===underlay?'face-underlay':'tan';return `<image href="labubu-pet/rendered/${skin.toLowerCase().replaceAll(' ','-')}-${part}.png" width="1024" height="1536"/>`}
const image=`<g class="labubu-colored-art">${cachedArt('Tan')}</g>`;
// Neutral gray means zero displacement. Soft gradients bend fur continuously,
// so moving ears/hands never expose a cut edge or a second underlying limb.
function map(kind){const shape=kind==='nose'?'<ellipse cx="514" cy="754" rx="58" ry="48" fill="url(#r)"/>':kind==='ears'?'<ellipse cx="350" cy="190" rx="175" ry="240" fill="url(#r)"/><ellipse cx="675" cy="190" rx="175" ry="240" fill="url(#l)"/>':'<ellipse cx="221" cy="1110" rx="145" ry="175" fill="url(#r)"/><ellipse cx="803" cy="1110" rx="145" ry="175" fill="url(#l)"/>';return 'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="${ns}" width="1024" height="1536"><defs><radialGradient id="r"><stop stop-color="${kind==='hand'?'#ff0080':'#ff8080'}"/><stop offset="1" stop-color="#808080"/></radialGradient><radialGradient id="l"><stop stop-color="${kind==='hand'?'#000080':'#008080'}"/><stop offset="1" stop-color="#808080"/></radialGradient></defs><path fill="#808080" d="M0 0H1024V1536H0Z"/>${shape}</svg>`)}
const filters=['ears','hand','nose'].map(k=>`<filter id="${k}" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1536" color-interpolation-filters="sRGB"><feImage href="${map(k)}" x="0" y="0" width="1024" height="1536" result="map"/><feDisplacementMap id="${k}-bend" in="SourceGraphic" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>`).join('');
$('.pet-button').innerHTML=`<svg viewBox="-100 -70 1224 1920" role="img" aria-label="Animated tan Labubu"><defs>${filters}<radialGradient id="patch"><stop offset=".8" stop-color="white"/><stop offset="1" stop-color="black"/></radialGradient><mask id="face-patch"><ellipse cx="512" cy="718" rx="300" ry="210" fill="url(#patch)"/></mask><clipPath id="left-eye"><path d="M334 704Q335 647 375 621Q407 610 433 642Q460 679 462 743Q458 784 418 792Q359 799 341 756Z"/></clipPath><clipPath id="right-eye"><path d="M565 730Q565 664 589 637Q620 610 649 630Q688 656 696 719Q699 765 672 786Q620 807 585 780Q565 765 565 730Z"/></clipPath><clipPath id="left-open"><path id="left-aperture" d="M300 580H480V810H300Z"/></clipPath><clipPath id="right-open"><path id="right-aperture" d="M550 580H730V810H550Z"/></clipPath><clipPath id="grin-crop"><path d="M277 715Q302 790 401 827Q515 875 651 820Q725 785 754 715L762 807Q722 866 647 888Q512 923 377 878Q295 843 273 793Z"/></clipPath><radialGradient id="mouth-fill"><stop stop-color="#542228"/><stop offset="1" stop-color="#1e1016"/></radialGradient><clipPath id="mouth-clip"><path id="mouth-cut"/></clipPath></defs>
<g id="platform">
<defs><linearGradient id="bark" x2="0" y2="1"><stop stop-color="#ad7445"/><stop offset=".35" stop-color="#6f432d"/><stop offset=".8" stop-color="#41291e"/><stop offset="1" stop-color="#94603b"/></linearGradient><radialGradient id="woodtop"><stop stop-color="#f3d6a1"/><stop offset=".7" stop-color="#c8975e"/><stop offset="1" stop-color="#81522f"/></radialGradient><linearGradient id="plaque" x2="0" y2="1"><stop stop-color="#fff0cf"/><stop offset=".45" stop-color="#e3bb80"/><stop offset="1" stop-color="#bd8953"/></linearGradient></defs>
<path d="M142 1459C142 1390 882 1390 882 1459V1521C870 1622 154 1622 142 1521Z" fill="url(#bark)" stroke="#3b241b" stroke-width="7"/>
<ellipse cx="512" cy="1459" rx="370" ry="87" fill="url(#woodtop)" stroke="#593722" stroke-width="9"/>
${[.28,.45,.64,.83].map(k=>`<ellipse cx="512" cy="1459" rx="${350*k}" ry="${74*k}" fill="none" stroke="#976338" stroke-opacity=".45" stroke-width="4"/>`).join('')}
<path d="M173 1493l13 47m39-27 7 50m55-39 6 49m73-35 3 52m86-46 2 51m90-51-2 51m86-58-4 52m72-63-5 49m55-66-7 50m39-74-13 47" stroke="#362319" stroke-opacity=".65" stroke-width="8" stroke-linecap="round"/>
<path d="M155 1528Q512 1630 869 1528" fill="none" stroke="#c7955b" stroke-opacity=".55" stroke-width="5"/>
<g fill="#657844" stroke="#34462b" stroke-width="4"><path d="M180 1518Q101 1465 133 1429Q191 1435 180 1518Z"/><path d="M181 1518Q198 1455 236 1466Q232 1508 181 1518Z"/><path d="M844 1518Q923 1465 891 1429Q833 1435 844 1518Z"/><path d="M843 1518Q826 1455 788 1466Q792 1508 843 1518Z"/></g>
</g><g id="puppet"><g filter="url(#ears)"><g filter="url(#hand)"><g filter="url(#nose)">${image}<g mask="url(#face-patch)"><g class="labubu-colored-art" data-underlay="true">${labubuColorArt('Tan',null,underlay)}</g></g>
<g id="eyes"><g clip-path="url(#left-open)"><g clip-path="url(#left-eye)">${image}</g></g><g clip-path="url(#right-open)"><g clip-path="url(#right-eye)">${image}</g></g><path id="closed-left" fill="none" stroke="#70422e" stroke-width="6" stroke-linecap="round" opacity="0"/><path id="closed-right" fill="none" stroke="#70422e" stroke-width="6" stroke-linecap="round" opacity="0"/></g>
<g id="original-grin" clip-path="url(#grin-crop)">${image}</g><g id="open-mouth" opacity="0"><path id="mouth-shape" fill="url(#mouth-fill)" stroke="#75402b" stroke-width="3"/><g clip-path="url(#mouth-clip)"><ellipse id="tongue" cx="512" cy="865" rx="58" ry="21" fill="#dc8a83"/><g id="teeth" fill="#fff0d9" stroke="#bd9c82" stroke-width="1.5"></g></g></g>
<g id="headphones" opacity="0"><defs><linearGradient id="labubu-headset-metal" x2="1" y2=".2"><stop stop-color="#4c2e1e"/><stop offset=".38" stop-color="#d9b783"/><stop offset=".6" stop-color="#a87743"/><stop offset="1" stop-color="#50321f"/></linearGradient><linearGradient id="labubu-headset-shell" x2="1" y2="1"><stop stop-color="#a17650"/><stop offset=".5" stop-color="#65442e"/><stop offset="1" stop-color="#33241d"/></linearGradient></defs><path d="M283 218C215 -72 808 -72 741 218" fill="none" stroke="#281e18" stroke-width="43" stroke-linecap="round"/><path d="M283 218C215 -72 808 -72 741 218" fill="none" stroke="url(#labubu-headset-metal)" stroke-width="27" stroke-linecap="round"/><path d="M282 185C252 -52 771 -52 742 185" fill="none" stroke="#f6dfaf" stroke-width="5" stroke-linecap="round"/><g transform="rotate(10 291 247)"><rect x="237" y="132" width="119" height="238" rx="55" fill="#281c17" stroke="#17100d" stroke-width="7"/><rect x="239" y="140" width="103" height="222" rx="46" fill="#4b3428" stroke="#b58a5c" stroke-width="5"/><rect x="234" y="155" width="81" height="192" rx="36" fill="url(#labubu-headset-shell)" stroke="url(#labubu-headset-metal)" stroke-width="9"/><path d="M256 176Q273 167 289 176M251 326Q272 337 291 326" fill="none" stroke="#e5c293" stroke-width="3" stroke-dasharray="4 5"/><circle cx="274" cy="242" r="24" fill="#30241c" stroke="#d3b180" stroke-width="4"/><path d="M262 249Q274 229 286 249Q274 259 262 249Z" fill="#e4c48d"/><g fill="#e4c48d"><ellipse cx="260" cy="233" rx="4" ry="6"/><ellipse cx="270" cy="224" rx="4" ry="6"/><ellipse cx="281" cy="224" rx="4" ry="6"/><ellipse cx="290" cy="234" rx="4" ry="6"/></g><path d="M263 298H285" stroke="#ffe5a5" stroke-width="6" stroke-linecap="round"/></g><g transform="translate(1024 0) scale(-1 1)"><g transform="rotate(10 291 247)"><rect x="237" y="132" width="119" height="238" rx="55" fill="#281c17" stroke="#17100d" stroke-width="7"/><rect x="239" y="140" width="103" height="222" rx="46" fill="#4b3428" stroke="#b58a5c" stroke-width="5"/><rect x="234" y="155" width="81" height="192" rx="36" fill="url(#labubu-headset-shell)" stroke="url(#labubu-headset-metal)" stroke-width="9"/><path d="M256 176Q273 167 289 176M251 326Q272 337 291 326" fill="none" stroke="#e5c293" stroke-width="3" stroke-dasharray="4 5"/><circle cx="274" cy="242" r="24" fill="#30241c" stroke="#d3b180" stroke-width="4"/><path d="M262 249Q274 229 286 249Q274 259 262 249Z" fill="#e4c48d"/><g fill="#e4c48d"><ellipse cx="260" cy="233" rx="4" ry="6"/><ellipse cx="270" cy="224" rx="4" ry="6"/><ellipse cx="281" cy="224" rx="4" ry="6"/><ellipse cx="290" cy="234" rx="4" ry="6"/></g><path d="M263 298H285" stroke="#ffe5a5" stroke-width="6" stroke-linecap="round"/></g></g></g>
</g></g></g></g><g id="notes" fill="#ffd28f" font-family="Segoe UI" font-size="110" opacity="0"><text x="60" y="680">♪</text><text x="890" y="850">♫</text><text x="90" y="1080">♫</text></g><g id="zs" fill="#efcba3" font-family="Segoe UI" font-weight="700" opacity="0"><text x="825" y="520" font-size="65">z</text><text x="904" y="413" font-size="90">Z</text></g><g id="nameplate" transform="translate(512 1725) scale(1.65 1.45) translate(-512 -1725)">
<path d="M226 1662Q512 1629 798 1662L817 1690V1756L798 1783Q512 1814 226 1783L207 1756V1690Z" fill="url(#bark)" stroke="#38251b" stroke-width="8"/>
<path d="M249 1679Q512 1654 775 1679L790 1699V1748L775 1768Q512 1793 249 1768L234 1748V1699Z" fill="url(#plaque)" stroke="#ecce98" stroke-width="5"/>
<path d="M255 1688Q512 1665 769 1688M255 1759Q512 1782 769 1759" fill="none" stroke="#87613c" stroke-width="3" stroke-dasharray="7 7"/>
<defs><clipPath id="nameplate-labubu-head"><path d="M100 0H924V835Q897 905 792 938Q660 972 512 968Q364 972 232 938Q127 905 100 835Z"/></clipPath><filter id="head-shadow" x="-25%" y="-20%" width="150%" height="150%"><feDropShadow dx="0" dy="9" stdDeviation="9" flood-color="#2d1b12" flood-opacity=".85"/></filter></defs>
${[224,800].map(x=>`<g class="nameplate-labubu-head" transform="translate(${x-76.8} 1635) scale(.15)" filter="url(#head-shadow)"><g clip-path="url(#nameplate-labubu-head)">${image}</g></g>`).join('')}
<text id="name-label" x="512" y="1734" text-anchor="middle" dominant-baseline="middle" font-family="Georgia,serif" font-size="65" font-weight="bold" fill="#4c2e20" stroke="#fff0ce" stroke-width="1" paint-order="stroke">Labubu</text></g></svg>`;
const state={mode:'idle',action:null,motion:true,idle:true,start:performance.now(),nextIdle:performance.now()+4500,nextBlink:performance.now()+2500,blink:0,index:0,speechUntil:0};
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const durations={hello:2800,happy:2500,blink:360,talk:2200,ears:2400,hand:3200,nose:1800,wobble:3800,wake:3800};
const reactions=['ears','hello','nose','happy','wobble','talk','hand'];
const messages=['Hey! Ready for a little adventure?','You’ve got this!','Tiny steps, big discoveries.','That deserves a smile!'];
function say(text,now=performance.now()){if(host.hidden||host.closest('.pet-studio'))return;$('.labubu-speech').textContent=text;$('.labubu-speech').hidden=false;state.speechUntil=now+3800;}
function ui(){host.dataset.state=state.mode;$('.pet-button').setAttribute('aria-label',state.mode==='sleep'?'Wake '+prefs.name:'Customize '+prefs.name);}
function play(name){name=({excited:'hello',greet:'hello',mouth:'talk',squish:'wobble'})[name]||name;if(!['sleep','wake','dance',...Object.keys(durations)].includes(name))return;if(!state.motion||reduce.matches){if(name==='sleep')state.mode='sleep';else if(name==='wake')state.mode='idle';ui();return;}const now=performance.now();if(name==='sleep'){state.mode='sleep';state.action=null;state.start=now;$('.labubu-speech').hidden=true;}else if(name==='wake'||state.mode==='sleep'){state.mode='idle';state.action={name:'wake',start:now};say('Good morning! Let’s get started.',now);}else if(name==='dance'){state.mode=state.mode==='dance'?'idle':'dance';state.action=null;state.start=now;if(state.mode==='dance')say('This is my kind of beat!',now);}else{state.mode='idle';state.action={name,start:now};if(name==='hello')say(messages[state.index++%messages.length],now);}state.nextIdle=now+6000;ui();}
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},nodes=new Map(),attr=(id,k,v)=>{let el=nodes.get(id);if(!el){el=$(id);nodes.set(id,el)}const next=String(typeof v==='number'?Math.round(v*1000)/1000:v);if(el.getAttribute(k)!==next)el.setAttribute(k,next)};
// Reproduce the original radial displacement fields on the GPU. In particular,
// hands move vertically as well as sideways; this is not a scanline stretch.
const baseArt=host.querySelector('#puppet .labubu-colored-art');
const raster=document.createElementNS(ns,'foreignObject');
raster.setAttribute('x','0');raster.setAttribute('y','0');raster.setAttribute('width','1024');raster.setAttribute('height','1536');
const canvas=document.createElement('canvas');canvas.width=512;canvas.height=768;canvas.style.cssText='width:1024px;height:1536px;display:block;pointer-events:none';raster.append(canvas);baseArt.after(raster);
const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,preserveDrawingBuffer:true});
let texture=null,textureSkin='',lastRaster='',bendUniform;
if(gl){
 const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};
 const program=gl.createProgram();
 gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 point;varying vec2 uv;void main(){uv=vec2((point.x+1.0)*0.5,(1.0-point.y)*0.5);gl_Position=vec4(point,0.0,1.0);}'));
 gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`precision highp float;
 varying vec2 uv;uniform sampler2D art;uniform vec2 bends;
 float radial(vec2 p,vec2 center,vec2 radius){return max(0.0,1.0-length((p-center)/radius));}
 void main(){vec2 p=uv*vec2(1024.0,1536.0);
 float el=radial(p,vec2(350.0,190.0),vec2(175.0,240.0));
 float er=radial(p,vec2(675.0,190.0),vec2(175.0,240.0));
 p.x+=bends.x*65.0*(el-er)*0.5;
 float hl=radial(p,vec2(221.0,1110.0),vec2(145.0,175.0));
 float hr=radial(p,vec2(803.0,1110.0),vec2(145.0,175.0));
 p+=bends.y*95.0*vec2(hl-hr,-hl-hr)*0.5;
 gl_FragColor=texture2D(art,p/vec2(1024.0,1536.0));}`));
 gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 const point=gl.getAttribLocation(program,'point');gl.enableVertexAttribArray(point);gl.vertexAttribPointer(point,2,gl.FLOAT,false,0,0);
 bendUniform=gl.getUniformLocation(program,'bends');gl.uniform1i(gl.getUniformLocation(program,'art'),0);gl.viewport(0,0,512,768);
 texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
}
let textureReady=false;
function drawBends(ear,wave){if(!gl||!textureReady)return;const key=ear.toFixed(4)+':'+wave.toFixed(4);if(key===lastRaster)return;lastRaster=key;gl.uniform2f(bendUniform,ear,wave);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}
function loadTexture(skin){if(!gl||textureSkin===skin)return;textureSkin=skin;const img=new Image();img.onload=()=>{if(textureSkin!==skin)return;gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);textureReady=true;lastRaster='';drawBends(0,0);baseArt.style.display='none'};img.src='labubu-pet/rendered/'+skin.toLowerCase().replaceAll(' ','-')+'-tan.png';}
const bends=['ears','hand','nose'].map(id=>({id,group:host.querySelector('[filter="url(#'+id+')"]')}));
let lastTeeth='';
let raf=0;
function tick(now){raf=0;if(host.hidden||document.hidden)return;const sec=(now-state.start)/1000,moving=state.motion&&!reduce.matches;
if(state.action&&now-state.action.start>durations[state.action.name]){state.action=null;state.nextIdle=now+4200;if(radio&&!prefs.asleep)play('dance');ui();}
if(state.mode==='idle'&&!state.action&&state.idle&&moving&&now>state.nextIdle)play(reactions[state.index++%reactions.length]);
if(state.mode==='idle'&&!state.action&&now>state.nextBlink&&moving){state.blink=now;state.nextBlink=now+3500+Math.random()*1700;}
let closed=0,happy=0,opening=0,wave=0,ear=0,nose=0,wobble=0,yawn=0;
const a=state.action,name=a?.name,t=a?clamp((now-a.start)/durations[name]):0,env=Math.sin(Math.PI*t)**2;
if(state.blink&&now-state.blink<340)closed=Math.sin(Math.PI*(now-state.blink)/340);else state.blink=0;
if(name==='blink')closed=Math.sin(Math.PI*t);
if(name==='happy'||name==='hello'){happy=env;opening=.35*env;}
if(name==='hello'||name==='hand')wave=Math.sin(t*Math.PI*8)*env;
if(name==='ears'||name==='hello')ear=Math.sin(t*Math.PI*7)*env;
if(name==='nose'||name==='hello')nose=Math.sin(t*Math.PI*10)*env;
if(name==='wobble')wobble=Math.sin(t*Math.PI*5)*env;
if(name==='talk')opening=(.15+.7*Math.sin(t*Math.PI*6)**2)*env;
if(name==='wake'){closed=1-smooth((t-.42)/.4);yawn=Math.sin(Math.PI*clamp((t-.08)/.8))**2;opening=yawn;ear=Math.sin(t*Math.PI*3)*env;}
if(state.mode==='sleep'){closed=1;opening=moving?Math.max(0,Math.sin(sec*Math.PI*2/5))**2:0;}
if(state.mode==='dance'){happy=.8;opening=.35;wobble=Math.sin(sec*Math.PI*2/0.7);ear=.7*Math.sin(sec*7);wave=.4*Math.sin(sec*8);}
const breathe=moving?Math.sin(now/1000*Math.PI*2/(state.mode==='sleep'?5:4)):0;
const drift=moving&&state.mode!=='sleep'?Math.sin(now/1000*Math.PI*2/7)*.65:0;
const sx=1+(moving?.009*breathe+.018*wobble:0),sy=1-(moving?.008*breathe+.012*wobble:0),angle=moving?drift+2.3*wobble:0;
attr('#puppet','transform',`translate(512 1460) rotate(${angle}) scale(${sx} ${sy}) translate(-512 -1460)`);
drawBends(moving?ear:0,moving?wave:0);
for(const b of bends){const value=moving?(b.id==='nose'?nose:!gl?({ears:ear,hand:wave})[b.id]:0):0;const next=Math.abs(value)>.001?'url(#'+b.id+')':'none';if(b.group.getAttribute('filter')!==next)b.group.setAttribute('filter',next);}
attr('#nose-bend','scale',moving?nose*27:0);
attr('#ears-bend','scale',moving?ear*65:0);attr('#hand-bend','scale',moving?wave*95:0);
for(const [id,cx] of [['left',397],['right',630]]){const top=580+closed*245,bottom=810-happy*60,x=id==='left'?300:550;attr('#'+id+'-aperture','d',closed>.98?'M0 0Z':`M${x} ${top}Q${cx} ${top+closed*16} ${x+180} ${top}V${bottom}Q${cx} ${bottom-happy*35} ${x} ${bottom}Z`);attr('#closed-'+id,'d',`M${cx-52} 729Q${cx} ${happy>.3?685:765} ${cx+52} 729`);attr('#closed-'+id,'opacity',smooth((closed-.8)/.2));}
const sleeping=state.mode==='sleep',dynamic=opening>.015||sleeping;
attr('#original-grin','opacity',dynamic?0:1);attr('#open-mouth','opacity',dynamic?1:0);
const rx=sleeping?35:100+yawn*15,top=sleeping?805:800,h=sleeping?opening*88:32+opening*95;
const d=`M${512-rx} ${top}Q512 ${top-(sleeping?opening*9:16)} ${512+rx} ${top}C${512+rx} ${top+h} ${512-rx} ${top+h} ${512-rx} ${top}Z`;
attr('#mouth-shape','d',d);attr('#mouth-cut','d',d);attr('#tongue','cy',top+h*.75);attr('#tongue','rx',rx*.57);attr('#tongue','opacity',sleeping?smooth((opening-.18)/.4):1);
const teethMarkup=sleeping?'':Array.from({length:9},(_,i)=>{const x=512-rx+8+i*(2*rx-16)/9,w=(2*rx-16)/9;return `<path d="M${x} ${top-3}h${w}l${-w/2} 22Z"/>`}).join('');
if(teethMarkup!==lastTeeth){$('#teeth').innerHTML=teethMarkup;lastTeeth=teethMarkup;}
attr('#headphones','opacity',state.mode==='dance'||prefs.headwear==='headphones'?1:0);attr('#notes','opacity',state.mode==='dance'?1:0);attr('#notes','transform',`translate(0 ${moving?Math.sin(sec*3)*20:0})`);attr('#zs','opacity',sleeping?.7+.3*Math.sin(sec*1.2)**2:0);
if(now>state.speechUntil)$('.labubu-speech').hidden=true;
if(moving)raf=requestAnimationFrame(tick);
}

function start(){if(!raf&&!host.hidden&&!document.hidden)tick(performance.now());}
function place(){if(host.hidden||host.closest('.pet-studio'))return;const box=$('.pet-button').getBoundingClientRect();host.style.left=Math.max(8,Math.min(position?.x??innerWidth-box.width-34,innerWidth-box.width-8))+'px';host.style.top=Math.max(8,Math.min(position?.y??innerHeight*.48-90,innerHeight-box.height-8))+'px';}
const positionKey=()=>'labubu-position:'+account;
function remember(){try{localStorage.setItem(positionKey(),JSON.stringify(position))}catch{}}
function render(){
 loadTexture(Object.hasOwn(labubuSkins,prefs.skin)?prefs.skin:'Tan');
 if(renderedSkin!==prefs.skin){renderedSkin=Object.hasOwn(labubuSkins,prefs.skin)?prefs.skin:'Tan';host.querySelectorAll('.labubu-colored-art').forEach(g=>g.innerHTML=cachedArt(renderedSkin,g.dataset.underlay?underlay:original));}

 host.hidden=!visible||hidden;host.dataset.size=prefs.size;state.motion=prefs.motion;state.idle=true;
 $('#name-label').textContent=prefs.name;attr('#name-label','font-size',Math.min(82,490/(Array.from(prefs.name).length*.63)));
 $('#nameplate').style.display=prefs.nameplate?'':'none';$('#platform').style.display=prefs.platform?'':'none';
 if(prefs.asleep&&state.mode!=='sleep')play('sleep');else if(!prefs.asleep&&state.mode==='sleep')play('wake');
 if(!prefs.asleep&&state.action?.name!=='wake'){if(radio&&state.mode!=='dance')play('dance');else if(!radio&&state.mode==='dance')play('dance');}
 if(!state.motion||reduce.matches){state.action=null;state.blink=0;state.mode=prefs.asleep?'sleep':'idle';}
 if(host.hidden||host.closest('.pet-studio'))$('.labubu-speech').hidden=true;
 cancelAnimationFrame(raf);raf=0;place();ui();start();
}
const pet=$('.pet-button');
pet.onclick=()=>{if(suppress){suppress=false;return}if(prefs.asleep){prefs={...prefs,asleep:false};render();onChange({...prefs})}else onCustomize?.()};
pet.addEventListener('pointerdown',e=>{if(e.button!==0||host.closest('.pet-studio'))return;const b=pet.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:b.left,top:b.top,moved:false};pet.setPointerCapture(e.pointerId)});
pet.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)<6)return;drag.moved=true;position={x:drag.left+dx,y:drag.top+dy};$('.labubu-speech').hidden=true;place()});
function end(e){if(!drag||drag.id!==e.pointerId)return;suppress=drag.moved;if(drag.moved)remember();drag=null}
pet.addEventListener('pointerup',end);pet.addEventListener('pointercancel',end);
pet.addEventListener('keydown',e=>{if(host.closest('.pet-studio'))return;const delta={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[e.key];if(!delta)return;e.preventDefault();const b=pet.getBoundingClientRect();position={x:b.left+delta[0],y:b.top+delta[1]};place();remember()});
reduce.addEventListener('change',render);window.addEventListener('resize',place);
document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);raf=0;state.action=null;state.nextIdle=performance.now()+4000;state.nextBlink=performance.now()+2500;start()});
return {host,play(name){if(host.hidden||prefs.asleep||!prefs.motion||reduce.matches)return;play(name);start()},update(value){
 if(account!==value.account){account=value.account;position=null;hidden=false;state.mode='idle';state.action=null;state.index=0;state.start=performance.now();state.nextIdle=performance.now()+4500;$('.labubu-speech').hidden=true;try{const p=JSON.parse(localStorage.getItem(positionKey())||'null');if(Number.isFinite(p?.x)&&Number.isFinite(p?.y))position=p}catch{}}
 visible=value.visible;radio=value.radio;prefs={...labubuDefaults(),...value.preferences};render();
},show(){hidden=false;render()},hide(){hidden=true;render()},reset(){position=null;try{localStorage.removeItem(positionKey())}catch{}place()},refresh:render};
};

