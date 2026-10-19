/* Skins recolor only the original art: accessory geometry and colors are independent. */
window.roboColtSkins = {
 Original:{accent:'#ff3c25',light:'#ffb6a4',dark:'#970b15',description:'Classic graphite armor and crimson energy.'},
 Arctic:{accent:'#63dfff',light:'#efffff',dark:'#167ba6',tint:[.12,.73,1],description:'Original black armor with icy blue accents.'},
 Emerald:{accent:'#45ef9b',light:'#d9ffe9',dark:'#087d50',tint:[.08,.92,.43],glitter:true,description:'Original black armor with green glitter accents.'},
 Galaxy:{accent:'#c985ff',light:'#f7e6ff',dark:'#6331b4',tint:[.59,.19,1],glitter:true,description:'Original black armor with purple glitter accents.'},
 Royal:{accent:'#ffd05b',light:'#fff6cc',dark:'#99651c',tint:[1,.65,.12],description:'Original black armor with golden accents.'},
 'School Spirit':{accent:'#db3c72',light:'#ffe0ec',dark:'#790c30',tint:[.65,.02,.18],description:'Original black armor with school-burgundy accents.'}
};
window.createRoboColtSkinPainter = function(pet){
 const ns='http://www.w3.org/2000/svg',defs=pet.querySelector('defs');
 const layers=[...pet.querySelectorAll('image')].filter(e=>/robo-colt\/(parts|platform)-v1\.png$/.test(e.getAttribute('href')||''));
 Object.entries(window.roboColtSkins).forEach(([name,skin],index)=>{
  if(!skin.tint)return;
  skin.filterId='rc-skin-'+index;
  const filter=document.createElementNS(ns,'filter');filter.id=skin.filterId;
  filter.setAttribute('color-interpolation-filters','sRGB');
  filter.setAttribute('x','0%');filter.setAttribute('y','0%');filter.setAttribute('width','100%');filter.setAttribute('height','100%');
  // Mask saturated red only. Unmasked armor is the untouched source image.
  const matrix=skin.tint.map(t=>[t,1-t,0,0,0].join(' ')).join(' ')+' 0 0 0 1 0';
  filter.innerHTML='<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 6 -3 -3 0 -.3" result="redMask"/><feComposite in="redMask" in2="SourceAlpha" operator="in" result="accentMask"/><feColorMatrix in="SourceGraphic" type="matrix" values="'+matrix+'" result="paint"/>';
  if(skin.glitter)filter.innerHTML+='<feTurbulence type="fractalNoise" baseFrequency=".48" numOctaves="1" seed="17" result="grain"/><feColorMatrix in="grain" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 14 0 0 0 -8.3" result="sparkles"/><feBlend in="sparkles" in2="paint" mode="screen" result="paint"/>';
  filter.innerHTML+='<feComposite in="paint" in2="accentMask" operator="in" result="coloredAccents"/><feComposite in="SourceGraphic" in2="accentMask" operator="out" result="originalArmor"/><feComposite in="coloredAccents" in2="originalArmor" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>';
  defs.append(filter);
 });
 let last;
 return function(name){
  const skin=window.roboColtSkins[name]||window.roboColtSkins.Original;
  if(last===skin)return skin;last=skin;
  layers.forEach(e=>{if(skin.filterId)e.setAttribute('filter','url(#'+skin.filterId+')');else e.removeAttribute('filter')});
  pet.querySelector('#rc-iris').innerHTML='<stop stop-color="'+skin.light+'"/><stop offset=".5" stop-color="'+skin.accent+'"/><stop offset="1" stop-color="'+skin.dark+'"/>';
  pet.querySelectorAll('.eye ellipse[filter]').forEach(e=>e.setAttribute('fill',skin.accent));
  pet.querySelectorAll('.eyes-happy path').forEach(e=>e.setAttribute('stroke',skin.accent));
  pet.querySelectorAll('.eyes-sleep path').forEach(e=>e.setAttribute('stroke',skin.dark));
  pet.dataset.skin=name;
  return skin;
 };
};
