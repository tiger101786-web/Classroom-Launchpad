/* Approved preview artwork, shared with the live cow rig. */
window.createHighlandAccessories=async function(host){
const ns='http://www.w3.org/2000/svg',cow=host.querySelector('.cow'),layer=document.createElementNS(ns,'g');layer.id='cow-accessories';layer.style.pointerEvents='none';
const grad=(id,a,b,c)=>`<linearGradient id="ha-${id}" x2=".8" y2="1"><stop stop-color="${a}"/><stop offset=".45" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>`;
const sprig=(x,y,r,s=1)=>`<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M0 4Q-5 -20 1 -63M-1 -12L-15 -29M-1 -26L14 -43" fill="none" stroke="#44542b" stroke-width="4" stroke-linecap="round"/>${Array.from({length:9},(_,i)=>{const yy=-12-i*5.3,xx=(i%2?1:-1)*(7-i*.45);return `<path d="M${xx} ${yy+8}q-8 -3 -3 -10q5 -5 10 1q3 7 -7 9" fill="${['#514481','#7760a4','#9880bb'][i%3]}" stroke="#403661" stroke-width="1.4"/><circle cx="${xx+1}" cy="${yy}" r="1.5" fill="#c5b4df"/>`}).join('')}</g>`;
const thistle=`<path d="M0 24V-2M0 15L-12 5M0 9L12 -2" fill="none" stroke="#b69858" stroke-width="3"/><path d="M-12 -6L-9 -16L-4 -11L0 -21L5 -12L10 -18L13 -6Q10 5 0 5Q-10 5 -12 -6Z" fill="#c8aa69"/><path d="M-9 -5H9M-7 -10L-4 -2M1 -13V-3M7 -10L5 -2" stroke="#685032" stroke-width="1.5"/>`;
layer.innerHTML=`<defs>${grad('brass','#fff0bc','#b6995e','#655032')}${grad('leather','#77533b','#3f2a21','#211812')}${grad('cushion','#483b30','#201a16','#100f0d')}${grad('tweed','#a5a28a','#686c57','#343b30')}<pattern id="ha-weave" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0 0L6 6L0 12M6 0L12 6L6 12" fill="none" stroke="#e1d0a2" stroke-opacity=".32" stroke-width="2"/><path d="M0 3L6 9M6 3L12 9" stroke="#362c21" stroke-opacity=".45" stroke-width="1.2"/></pattern><pattern id="ha-tartan" width="76" height="76" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)"><rect width="76" height="76" fill="#284d40"/><path d="M18 0V76M0 18H76" stroke="#632737" stroke-width="24"/><path d="M55 0V76M0 55H76" stroke="#162c2a" stroke-width="16"/><path d="M16 0V76M21 0V76M0 16H76M0 21H76" stroke="#c5ab71" stroke-width="2"/><path d="M50 0V76M60 0V76M0 50H76M0 60H76" stroke="#ddd1a0" stroke-opacity=".55" stroke-width="1.5"/></pattern><linearGradient id="ha-cloth-light" x2="0" y2="1"><stop stop-color="#f6e7b1" stop-opacity=".2"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient></defs>
<g data-ha="scarf" style="display:none"><g class="ha-neck">
<path d="M332 460Q308 477 308 511Q310 552 363 568Q512 621 672 565Q715 549 718 513Q720 478 690 460Q652 493 512 501Q375 493 332 460Z" fill="url(#ha-tartan)" stroke="#1c2e26" stroke-width="6"/>
<path d="M332 460Q308 477 308 511Q310 552 363 568Q512 621 672 565Q715 549 718 513Q720 478 690 460Q652 493 512 501Q375 493 332 460Z" fill="url(#ha-cloth-light)"/>
<path d="M321 499Q512 583 705 500M340 547Q512 606 681 548" fill="none" stroke="#ddcda2" stroke-opacity=".55" stroke-width="3" stroke-dasharray="5 5"/>
<path d="M627 535Q657 568 684 590L724 693Q688 723 635 713L605 609Q591 565 627 535Z" fill="url(#ha-tartan)" stroke="#20342a" stroke-width="5"/>
<path d="M627 535Q657 568 684 590L724 693Q688 723 635 713L605 609Q591 565 627 535Z" fill="url(#ha-cloth-light)"/>
${Array.from({length:13},(_,i)=>`<path d="M${637+i*6.5} ${710-i*.8}l${i%2?5:8} ${18+i%3*3}" stroke="${i%3?'#456a50':'#aa7f64'}" stroke-width="4" stroke-linecap="round"/>`).join('')}
<path d="M603 510Q637 495 676 516L675 557Q642 578 614 554Z" fill="url(#ha-tartan)" stroke="#24392e" stroke-width="5"/>
<circle cx="646" cy="535" r="18" fill="url(#ha-brass)" stroke="#58442b" stroke-width="3"/><g transform="translate(646 535) scale(.5)">${thistle}</g>
</g></g>
<g data-ha="headphones" style="display:none"><g class="ha-head">
<path d="M252 265C228 141 308 10 512 8C716 10 796 141 772 265" fill="none" stroke="#211913" stroke-width="29"/>
<path d="M252 265C228 141 308 10 512 8C716 10 796 141 772 265" fill="none" stroke="url(#ha-leather)" stroke-width="22"/>
<path d="M252 255C231 141 310 14 512 14C714 14 793 141 772 255" fill="none" stroke="#c2a876" stroke-width="2.2" stroke-dasharray="5 5"/>
${[false,true].map(right=>`<g class="ha-cup" data-side="${right?'right':'left'}"><g transform="translate(${right?792:232} 275) rotate(${right?20:-20})"><rect x="-59" y="-74" width="118" height="148" rx="50" fill="url(#ha-cushion)" stroke="#17110f" stroke-width="5"/><rect x="-49" y="-66" width="98" height="133" rx="42" fill="url(#ha-brass)"/><rect x="-43" y="-61" width="86" height="122" rx="38" fill="url(#ha-leather)" stroke="#ccaf73" stroke-width="2"/><rect x="-35" y="-53" width="70" height="106" rx="30" fill="none" stroke="#ad9166" stroke-width="1.7" stroke-dasharray="3 4"/><path d="M-39 -44V-74Q0 -108 39 -74V-44" fill="none" stroke="url(#ha-brass)" stroke-width="9"/><circle cx="-39" cy="-40" r="8" fill="url(#ha-brass)"/><circle cx="39" cy="-40" r="8" fill="url(#ha-brass)"/><g transform="translate(0 -3)">${thistle}</g><path d="M-12 37H12" stroke="#d5b677" stroke-width="3" stroke-linecap="round"/></g></g>`).join('')}
</g></g>
<g data-ha="cap" style="display:none"><g class="ha-head">
<!-- Short curved peak sits underneath the soft eight-panel crown. -->
<path d="M330 177Q512 132 694 177L689 209Q661 219 646 205Q512 166 378 205Q354 218 335 207Z" fill="#30372c" stroke="#252c24" stroke-width="5"/>
<path d="M346 185Q512 134 678 185L684 210Q512 160 340 210Z" fill="url(#ha-tweed)" stroke="#414935" stroke-width="3"/>
<path d="M346 185Q512 134 678 185L684 210Q512 160 340 210Z" fill="url(#ha-weave)"/>
<path d="M342 208Q512 159 682 208" fill="none" stroke="#b6b297" stroke-width="3"/>
<path d="M306 170C288 143 319 94 364 69C403 45 460 36 512 36C564 36 621 45 660 69C705 94 736 143 718 170Q705 191 675 190Q601 163 512 163Q423 163 349 190Q319 191 306 170Z" fill="url(#ha-tweed)" stroke="#30392d" stroke-width="5"/>
<path d="M306 170C288 143 319 94 364 69C403 45 460 36 512 36C564 36 621 45 660 69C705 94 736 143 718 170Q705 191 675 190Q601 163 512 163Q423 163 349 190Q319 191 306 170Z" fill="url(#ha-weave)"/>
<path d="M512 39C448 64 412 112 398 177M512 39C576 64 612 112 626 177M506 41Q490 101 482 163M518 41Q534 101 542 163M492 42Q366 61 326 176M532 42Q658 61 698 176" fill="none" stroke="#343c30" stroke-opacity=".7" stroke-width="3"/>
<path d="M506 44Q444 74 404 173M518 44Q580 74 620 173M489 48Q378 68 334 169M535 48Q646 68 690 169" fill="none" stroke="#c5bea2" stroke-opacity=".45" stroke-width="2" stroke-dasharray="3 3"/>
<path d="M311 163Q325 187 350 181Q512 125 674 181Q699 187 713 163" fill="none" stroke="#252e25" stroke-width="5"/>
<path d="M317 163Q331 181 351 176Q512 122 673 176Q693 181 707 163" fill="none" stroke="#bab294" stroke-opacity=".65" stroke-width="2"/>
<ellipse cx="512" cy="37" rx="12" ry="6" fill="#606650" stroke="#32392c" stroke-width="3"/><path d="M505 35Q512 31 519 35" fill="none" stroke="#c0b99c" stroke-width="2"/>
</g></g>
<g data-ha="wreath" style="display:none"><g class="ha-head">
<image href="highland-pet/heather-wreath-v3.png" x="270" y="92" width="484" height="155" preserveAspectRatio="none"/>
</g></g>`;
// Match the approved preview's SVG scene graph and fractional SVG transforms.
// HTML/3D compositor layers inside a scaled foreignObject can snap/repaint at
// different times from the cow. Keep all wearable motion in its SVG coordinates.
const originalWreath=new Image();originalWreath.src='highland-pet/heather-wreath-v3.png';await originalWreath.decode();
const prefix='ha-'+crypto.randomUUID()+'-';
layer.querySelectorAll('[id]').forEach(node=>node.id=prefix+node.id);
layer.querySelectorAll('*').forEach(node=>{for(const attr of [...node.attributes])if(attr.value.includes('url(#'))node.setAttribute(attr.name,attr.value.replaceAll('url(#','url(#'+prefix))});
const layers={};
for(const g of layer.querySelectorAll('[data-ha]')){
 g.dataset.highlandWearable=g.dataset.ha;layers[g.dataset.ha]=g;
}
cow.append(layer);
// Preserve the approved native SVG renderer in Chrome, Edge and Safari.
// Firefox on iOS uses WebKit and must also keep the native renderer.
const firefox=/Firefox\//.test(navigator.userAgent)&&!/FxiOS\//.test(navigator.userAgent);
host.dataset.accessoryRenderer=firefox?'canvas':'svg';
if(!firefox){
 let selected=[];
 return {frame(pose){const b=pose.breath*.012;for(const id of selected){layers[id].firstElementChild.setAttribute('transform',`translate(${pose.wobble*(id==='scarf'?10:13)} ${-909*b}) scale(1 ${1+b})`);if(id==='headphones')layers[id].querySelectorAll('.ha-cup').forEach(g=>g.setAttribute('transform',`translate(${pose.ear*6} ${pose.ear*(g.dataset.side==='left'?23:-23)})`))}},update(p,dancing=false){const head=dancing?'headphones':p.headwear;selected=[...(p.neckwear==='scarf'?['scarf']:[]),...(head&&head!=='none'?[head]:[])];for(const [id,g] of Object.entries(layers))g.style.display=selected.includes(id)?'':'none';host.dataset.headwear=head||'none';host.dataset.neckwear=p.neckwear||'none'}};
}
// Small SVG scale changes can reuse a pixel-snapped raster in Firefox. The
// recording showed stationary cloth followed by jumps while the body advanced.
// Keep the original SVG as the artwork source, rasterize it ONCE at 4x, then
// apply fractional transforms in a canvas on the body's existing frame callback.
// No new animation clock, CSS animation, or modification of the cow rig.
const drawings={};
for(const [id,g] of Object.entries(layers)){
 if(id!=='scarf'&&id!=='wreath')continue;
 g.style.display='';
 // The live pet initializes hidden. Measure a visible offscreen clone instead
 // of getBBox() on a display:none ancestor (which returns an empty rectangle).
 const measure=document.createElementNS(ns,'svg');measure.setAttribute('viewBox','0 0 1024 1024');measure.style.cssText='position:fixed;left:-10000px;top:0;width:1024px;height:1024px;pointer-events:none';const measured=g.cloneNode(true);measure.append(layer.querySelector('defs').cloneNode(true),measured);document.body.append(measure);const bounds=measured.getBBox();measure.remove();
 const pad=8,x=Math.floor(bounds.x-pad),y=Math.floor(bounds.y-pad),w=Math.ceil(bounds.width+pad*2),h=Math.ceil(bounds.height+pad*2);
 const source=document.createElementNS(ns,'svg');source.setAttribute('xmlns',ns);source.setAttribute('viewBox',`${x} ${y} ${w} ${h}`);source.setAttribute('width',w*4);source.setAttribute('height',h*4);
 source.append(layer.querySelector('defs').cloneNode(true),g.cloneNode(true));
 for(const image of source.querySelectorAll('image')){
  const blob=await (await fetch(image.getAttribute('href'))).blob();
  const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob)});image.setAttribute('href',data);
 }
 const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(source)],{type:'image/svg+xml'}));
 const image=new Image();try{image.src=url;await image.decode();const raster=document.createElement('canvas');raster.width=w*4;raster.height=h*4;raster.getContext('2d').drawImage(image,0,0);
 // Firefox does not implement high-quality canvas downsampling. Build a
 // half-size pyramid once so tartan/flowers cannot alias during a large shrink.
 const levels=[raster];while(levels.at(-1).width>64){const prev=levels.at(-1),next=document.createElement('canvas');next.width=Math.ceil(prev.width/2);next.height=Math.ceil(prev.height/2);next.getContext('2d').drawImage(prev,0,0,next.width,next.height);levels.push(next)}
 drawings[id]={levels,x,y,w,h}}finally{URL.revokeObjectURL(url)}
 g.style.display='none';
}
layer.style.visibility='hidden';
const surface=document.createElementNS(ns,'foreignObject');surface.setAttribute('width','1024');surface.setAttribute('height','1024');surface.setAttribute('aria-hidden','true');surface.style.pointerEvents='none';
const canvas=document.createElement('canvas');canvas.width=canvas.height=2048;canvas.style.cssText='display:block;width:1024px;height:1024px';canvas.dataset.highlandAccessorySurface='';surface.append(canvas);cow.append(surface);
const context=canvas.getContext('2d');context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';
let resolution=0;
let displayWidth=host.getBoundingClientRect().width;
const resize=new ResizeObserver(entries=>{displayWidth=entries[0].contentRect.width});resize.observe(host);
let selected=[];
return {frame(pose){const target=Math.max(256,Math.min(2048,Math.ceil(displayWidth*(window.devicePixelRatio||1)*2)));if(target!==resolution){resolution=target;canvas.width=canvas.height=target;context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high'}const scale=resolution/1024,b=pose.breath*.012;context.setTransform(1,0,0,1,0,0);context.clearRect(0,0,resolution,resolution);for(const id of selected){const dx=pose.wobble*(id==='scarf'?10:13);layers[id].firstElementChild.setAttribute('transform',`translate(${dx} ${-909*b}) scale(1 ${1+b})`);if(id==='headphones'){// Keep earcups attached to independently moving ears using the native rig.
 layers[id].querySelectorAll('.ha-cup').forEach(g=>g.setAttribute('transform',`translate(${pose.ear*6} ${pose.ear*(g.dataset.side==='left'?23:-23)})`));continue;
 }const art=drawings[id];if(art){let image=art.levels[0];for(const level of art.levels){if(level.width<art.w*scale)break;image=level}context.setTransform(scale,0,0,scale*(1+b),scale*dx,-scale*909*b);context.drawImage(image,art.x,art.y,art.w,art.h)}}},update(p,dancing=false){const head=dancing?'headphones':p.headwear;selected=[...(p.neckwear==='scarf'?['scarf']:[]),...(head&&head!=='none'?[head]:[])];for(const [id,g] of Object.entries(layers)){g.style.display=selected.includes(id)?'':'none';g.style.visibility=drawings[id]?'hidden':'visible'}host.dataset.headwear=head||'none';host.dataset.neckwear=p.neckwear||'none'}};
};

