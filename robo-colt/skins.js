/* Skins recolor only the original art: accessory geometry and colors are independent. */
window.roboColtSkins = {
 Original:{accent:'#ff3c25',light:'#ffb6a4',dark:'#970b15',description:'Classic graphite armor and crimson energy.'},
 Arctic:{accent:'#63dfff',light:'#efffff',dark:'#167ba6',tint:[.12,.23,.31],armor:[1.7,1.85,2],offset:.12,fullPaint:true,description:'Pearl-silver armor, icy blue details, and a frosty glow.'},
 Emerald:{accent:'#45ef9b',light:'#d9ffe9',dark:'#087d50',tint:[.12,.65,.38],armor:[1.12,1.17,1.2],texture:'brushed',description:'Brushed gunmetal armor with polished jade accents.'},
 Galaxy:{accent:'#c985ff',light:'#f7e6ff',dark:'#6331b4',tint:[.53,.28,.78],armor:[.87,.99,1.24],texture:'nebula',description:'Midnight blue-gray armor with violet nebula accents.'},
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
  // Keep accent and armor treatments separate; Arctic restores its original full pearl finish.
  const matrix=skin.tint.map((t,i)=>[t,(skin.fullPaint?skin.armor[i]:1)-t,0,0,skin.fullPaint?skin.offset:0].join(' ')).join(' ')+' 0 0 0 1 0';
  filter.innerHTML='<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 6 -3 -3 0 -.3" result="redMask"/><feComposite in="redMask" in2="SourceAlpha" operator="in" result="accentMask"/><feColorMatrix in="SourceGraphic" type="matrix" values="'+matrix+'" result="paint"/>';
  let armorSource='SourceGraphic';
  if(skin.armor&&!skin.fullPaint){
   const armorMatrix=[skin.armor[0]+' 0 0 0 0','0 '+skin.armor[1]+' 0 0 0','0 0 '+skin.armor[2]+' 0 0','0 0 0 1 0'].join(' ');
   filter.innerHTML+='<feColorMatrix in="SourceGraphic" type="matrix" values="'+armorMatrix+'" result="armor"/>';armorSource='armor';
  }
  if(skin.texture){
   // Soft continuous texture, not thresholded sparkles. It travels with each body part.
   const brushed=skin.texture==='brushed',frequency=brushed?'.012 .65':'.014',strength=brushed?.18:.4,base=1-strength;
   filter.innerHTML+='<feTurbulence type="fractalNoise" baseFrequency="'+frequency+'" numOctaves="'+(brushed?1:3)+'" seed="23" result="grain"/><feColorMatrix in="grain" type="matrix" values="'+strength+' 0 0 0 '+base+' '+strength+' 0 0 0 '+base+' '+strength+' 0 0 0 '+base+' 0 0 0 0 1" result="texture"/><feBlend in="paint" in2="texture" mode="multiply" result="paint"/>';
   if(brushed)filter.innerHTML+='<feBlend in="armor" in2="texture" mode="multiply"/><feComposite in2="SourceAlpha" operator="in" result="armor"/>';
  }
  if(skin.fullPaint)filter.innerHTML+='<feComposite in="paint" in2="SourceAlpha" operator="in"/>';
  else filter.innerHTML+='<feComposite in="paint" in2="accentMask" operator="in" result="coloredAccents"/><feComposite in="'+armorSource+'" in2="accentMask" operator="out" result="originalArmor"/><feComposite in="coloredAccents" in2="originalArmor" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>';
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
