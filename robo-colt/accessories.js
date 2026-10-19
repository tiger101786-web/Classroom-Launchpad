// Production artwork is used directly, without skin filters or vector redraws.
window.createRoboColtAccessories=function(pet){
 const ns='http://www.w3.org/2000/svg',head=pet.querySelector('#rc-head');
 const fit={horn:[271,-40,192,222],sleepcap:[194,10,440,263],sunglasses:[198,186,338,169],scarf:[230,388,336,156],bowtie:[280,423,174,94]};
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
 const rearBand=document.createElementNS(ns,'g');rearBand.id='rc-audio-rear-band';rearBand.setAttribute('pointer-events','none');head.prepend(rearBand);
 // Reposition the original artwork's cups, without repainting their details.
 for(const [part,rect,transform] of [
  ['band',[85,10,564,99],''],
  ['left',[85,104,204,180],'translate(0 14) rotate(10 194 188) translate(42 0) scale(.75 1)'],
  ['right',[445,104,204,180],'translate(0 14) rotate(-10 540 188) translate(141.5 0) scale(.75 1)']
 ]){
  const clip=document.createElementNS(ns,'clipPath');clip.id='rc-audio-'+part+'-clip';
  const r=document.createElementNS(ns,'rect');for(const [i,k] of ['x','y','width','height'].entries())r.setAttribute(k,rect[i]);clip.append(r);pet.querySelector('defs').append(clip);
  const piece=document.createElementNS(ns,'g');if(transform)piece.setAttribute('transform',transform);
  const art=image('headphones',[85,10,564,270]);art.setAttribute('clip-path','url(#'+clip.id+')');piece.append(art);(part==='band'?rearBand:headset).append(piece);
 }
 return prefs=>{const phones=pet.classList.contains('wear-phones');rearBand.style.display=phones?'inline':'none';pet.querySelector('#rc-audio-forelock').style.display=phones?'inline':'none';for(const [name,g] of Object.entries(nodes))g.style.display=(name==='sunglasses'?prefs.eyewear===name:['scarf','bowtie'].includes(name)?prefs.neckwear===name:prefs.headwear===name&&!phones)?'inline':'none';};
};
