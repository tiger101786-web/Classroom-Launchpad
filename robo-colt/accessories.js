// Production artwork is used directly, without skin filters or vector redraws.
window.createRoboColtAccessories=function(pet){
 const ns='http://www.w3.org/2000/svg',head=pet.querySelector('#rc-head');
 const fit={horn:[271,-40,192,222],sleepcap:[194,10,440,263],sunglasses:[198,186,338,169],scarf:[230,405,336,156],bowtie:[280,423,174,94]};
 function image(name,box){const art=document.createElementNS(ns,'image');art.setAttribute('href','robo-colt/accessory-'+name+(['sleepcap','scarf'].includes(name)?'-v3.png':'-v2.png'));art.setAttribute('preserveAspectRatio','none');for(const [i,k] of ['x','y','width','height'].entries())art.setAttribute(k,box[i]);return art;}
 const nodes={};
 // Neckwear, including its hanging end, sits in front of the forelegs.
 const puppet=pet.querySelector('#rc-puppet');
 puppet.insertBefore(pet.querySelector('#rc-leg-left'),head);puppet.insertBefore(pet.querySelector('#rc-leg-right'),head);
 for(const [name,box] of Object.entries(fit)){
  const g=document.createElementNS(ns,'g');g.id='rc-accessory-'+name;g.setAttribute('pointer-events','none');g.append(image(name,box));g.style.display='none';head.append(g);nodes[name]=g;
 }
 // A complete headset follows the head rather than individual ear twitches.
 pet.querySelectorAll('.colt-earphone').forEach(e=>e.remove());
 const headset=pet.querySelector('#rc-headphones');headset.replaceChildren();
 const rearBand=document.createElementNS(ns,'g');rearBand.id='rc-audio-rear-band';rearBand.setAttribute('pointer-events','none');head.insertBefore(rearBand,headset);
 // One continuous arched band ends inside the two silver hinge housings.
 // Cropping and rotating the previous raster band left diagonal gaps at both ends.
 const bandMaterial=document.createElementNS(ns,'linearGradient');bandMaterial.id='rc-audio-band-material';
 bandMaterial.setAttribute('x1','0');bandMaterial.setAttribute('y1','0');bandMaterial.setAttribute('x2','0');bandMaterial.setAttribute('y2','1');
 bandMaterial.innerHTML='<stop stop-color="#a6a1a3"/><stop offset=".2" stop-color="#3c383d"/><stop offset=".55" stop-color="#100e13"/><stop offset="1" stop-color="#54434a"/>';pet.querySelector('defs').append(bandMaterial);
 rearBand.innerHTML='<path d="M196 140C196-8 538-8 538 140" fill="none" stroke="#211a20" stroke-width="15" stroke-linecap="round"/><path d="M196 140C196-8 538-8 538 140" fill="none" stroke="url(#rc-audio-band-material)" stroke-width="11" stroke-linecap="round"/><path d="M194 136C198-9 536-9 540 136" fill="none" stroke="#bbadb1" stroke-opacity=".65" stroke-width="1.5" stroke-linecap="round"/>';
 // Reposition the original artwork's cups, without repainting their details.
 for(const [part,rect,transform] of [
  ['left',[85,86,204,198],'translate(0 14) rotate(10 194 188) translate(42 0) scale(.75 1)'],
  ['right',[445,86,204,198],'translate(0 14) rotate(-10 540 188) translate(141.5 0) scale(.75 1)']
 ]){
  const clip=document.createElementNS(ns,'clipPath');clip.id='rc-audio-'+part+'-clip';
  const r=document.createElementNS(ns,'path');
  r.setAttribute('d',part==='left'?'M85 113H213Q225 101 245 101H289V284H85Z':'M521 113H649V284H445V101H489Q509 101 521 113Z');
  clip.append(r);pet.querySelector('defs').append(clip);
  const piece=document.createElementNS(ns,'g');if(transform)piece.setAttribute('transform',transform);
  const art=image('headphones',[85,10,564,270]);art.setAttribute('clip-path','url(#'+clip.id+')');piece.append(art);(part==='band'?rearBand:headset).append(piece);
 }
 return prefs=>{const phones=pet.classList.contains('wear-phones');rearBand.style.display=phones?'inline':'none';pet.querySelector('#rc-audio-forelock').style.display=phones?'inline':'none';for(const [name,g] of Object.entries(nodes))g.style.display=(name==='sunglasses'?prefs.eyewear===name:['scarf','bowtie'].includes(name)?prefs.neckwear===name:prefs.headwear===name&&!phones)?'inline':'none';};
};
