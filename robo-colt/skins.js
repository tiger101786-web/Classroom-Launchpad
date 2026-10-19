/* Skins recolor only the original art: accessory geometry and colors are independent. */
window.roboColtSkins = {
 Original:{accent:'#ff3c25',light:'#ffb6a4',dark:'#970b15',description:'Classic graphite armor and crimson energy.'},
 Arctic:{accent:'#63dfff',light:'#efffff',dark:'#167ba6',armor:[1.7,1.85,2],tint:[.12,.23,.31],offset:.12,description:'Pearl armor, icy blue details, and a frosty glow.'},
 Emerald:{accent:'#45ef9b',light:'#d9ffe9',dark:'#087d50',armor:[.7,1,.85],tint:[.08,.92,.43],description:'Deep green armor with emerald energy.'},
 Galaxy:{accent:'#c985ff',light:'#f7e6ff',dark:'#6331b4',armor:[.9,.65,1.5],tint:[.59,.19,1],description:'Midnight violet armor with a starlit finish.'},
 Royal:{accent:'#ffd05b',light:'#fff6cc',dark:'#99651c',armor:[.9,.85,.8],tint:[1,.65,.12],description:'Onyx armor and polished golden details.'},
 'School Spirit':{accent:'#db3c72',light:'#ffe0ec',dark:'#790c30',armor:[1.25,1.25,1.3],tint:[.65,.02,.18],description:'Graphite and silver with school-burgundy accents.'}
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
  // R-G isolates crimson details; green carries the neutral armor's shading.
  const matrix=skin.tint.map((t,i)=>[t,skin.armor[i]-t,0,0,skin.offset||0].join(' ')).join(' ')+' 0 0 0 1 0';
  filter.innerHTML='<feColorMatrix type="matrix" values="'+matrix+'" result="paint"/>';
  if(name==='Galaxy')filter.innerHTML+='<feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="14" result="noise"/><feColorMatrix in="noise" type="matrix" values="0 0 0 0 .65 0 0 0 0 .43 0 0 0 0 1 0 0 0 1 0" result="nebula"/><feComposite in="nebula" in2="paint" operator="arithmetic" k1="0" k2=".12" k3=".88" k4="0" result="cloud"/><feTurbulence baseFrequency=".6" numOctaves="1" seed="7"/><feColorMatrix type="matrix" values="0 0 0 0 .85 0 0 0 0 .85 0 0 0 0 1 0 0 0 18 -12"/><feBlend in2="cloud" mode="screen"/>';
  filter.innerHTML+='<feComposite in2="SourceAlpha" operator="in"/>';
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
