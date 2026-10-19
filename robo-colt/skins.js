/* Skins recolor only the original art: accessory geometry and colors are independent. */
window.roboColtSkins = {
 Original:{accent:'#ff3c25',light:'#ffb6a4',dark:'#970b15',description:'Classic graphite armor and crimson energy.'},
 Arctic:{accent:'#63dfff',light:'#efffff',dark:'#167ba6',tint:[.12,.23,.31],armor:[1.7,1.85,2],offset:.12,fullPaint:true,description:'Pearl-silver armor, icy blue details, and a frosty glow.'},
 Emerald:{accent:'#45ef9b',light:'#d9ffe9',dark:'#087d50',tint:[.12,.65,.38],armor:[1.12,1.17,1.2],texture:'brushed',description:'Brushed gunmetal armor with polished jade accents.'},
 Galaxy:{accent:'#c985ff',light:'#f7e6ff',dark:'#6331b4',tint:[.53,.28,.78],armor:[.87,.99,1.24],texture:'nebula',description:'Midnight blue-gray armor with violet nebula accents.'},
 Royal:{accent:'#ffd05b',light:'#fff6cc',dark:'#99651c',tint:[1,.65,.12],description:'Original black armor with golden accents.'},
 'School Spirit':{accent:'#db3c72',light:'#ffe0ec',dark:'#790c30',tint:[.65,.02,.18],description:'Original black armor with school-burgundy accents.'},
 'Ancient Bronze':{accent:'#64cfbd',light:'#ddfff5',dark:'#286c63',tint:[.15,.65,.5],armor:[1.5,1.05,.61],armorLift:[.07,.035,.01],texture:'patina',description:'Weathered bronze plates with turquoise patina accents.'},
 'Candy Chrome':{accent:'#fa77bb',light:'#ffe8f5',dark:'#97355f',tint:[.95,.24,.52],armor:[1.6,1.7,1.8],armorLift:[.09,.09,.11],description:'Clean silver chrome with glossy raspberry-pink enamel.'},
 'Carbon Racer':{accent:'#ffe256',light:'#fffbdc',dark:'#9b7611',tint:[1,.8,.06],armor:[.82,.85,.9],pattern:'carbon',description:'Woven carbon-fiber armor and racing-yellow accents.'},
 'Copper Circuit':{accent:'#ffaf75',light:'#ffebd8',dark:'#9c4b25',tint:[.9,.4,.16],armor:[.9,.94,1],pattern:'circuit',description:'Graphite armor and copper enamel with sparse circuit details.'},
 'Deep Sea':{accent:'#4fe3d5',light:'#dcfff7',dark:'#106c76',tint:[.08,.7,.65],armor:[.56,.79,1.22],texture:'water',pattern:'water',description:'Midnight navy plates with rippled teal accents.'},
 'Desert Relic':{accent:'#62d6cf',light:'#e1fff4',dark:'#267b7b',tint:[.13,.63,.58],armor:[1.65,1.35,.88],armorLift:[.16,.12,.065],texture:'sand',pattern:'runes',description:'Warm sandstone armor, carved markings, and turquoise accents.'},
 Frostfire:{accent:'#8cecff',light:'#efffff',dark:'#267c9e',tint:[.15,.7,1],armor:[.88,.98,1.12],pattern:'frostfire',description:'Dark steel with icy-blue and ember-orange split accents.'},
 Moonstone:{accent:'#b6d5ff',light:'#fff5ec',dark:'#686c9c',tint:[.63,.73,.95],armor:[1.35,1.42,1.58],armorLift:[.04,.04,.06],pattern:'moonstone',description:'Smoky silver and milky blue-peach opalescent accents.'},
 'Obsidian Ember':{accent:'#ff9a45',light:'#fff0c1',dark:'#a23113',tint:[.85,.24,.025],armor:[.53,.49,.49],texture:'stone',pattern:'cracks',description:'Dark volcanic rock with sparse, glowing molten lava seams.'},
 Porcelain:{accent:'#5997f0',light:'#eef7ff',dark:'#193d8c',tint:[.06,.19,.55],armor:[.92,.92,.9],armorLift:[.55,.55,.5],pattern:'porcelain',description:'Cream-white glazed porcelain with spacious cobalt scallop motifs.'},
 'Rose Quartz':{accent:'#f0a5c4',light:'#fff0f8',dark:'#a45e82',tint:[.95,.48,.68],armor:[1.5,1.44,1.5],armorLift:[.08,.07,.085],pattern:'quartz',description:'Pearl-gray plates with rose-pink crystal veins.'},
 'Woodland Guardian':{accent:'#b5ca79',light:'#f2ffcf',dark:'#4e682e',tint:[.38,.54,.16],armor:[1.22,.78,.43],armorLift:[.035,.015,0],texture:'wood',pattern:'wood',description:'Walnut-grain armor with moss-green and bronze details.'}
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
   const lift=skin.armorLift||[0,0,0];
   const armorMatrix=[skin.armor[0]+' 0 0 0 '+lift[0],'0 '+skin.armor[1]+' 0 0 '+lift[1],'0 0 '+skin.armor[2]+' 0 '+lift[2],'0 0 0 1 0'].join(' ');
   filter.innerHTML+='<feColorMatrix in="SourceGraphic" type="matrix" values="'+armorMatrix+'" result="armor"/>';armorSource='armor';
  }
  if(skin.texture){
   // Soft continuous texture, not thresholded sparkles. It travels with each body part.
   const brushed=skin.texture==='brushed',frequency=({brushed:'.012 .65',wood:'.035 .003',sand:'.22',stone:'.055',water:'.012 .028',patina:'.032'})[skin.texture]||'.014',strength=brushed?.18:skin.texture==='wood'?.5:.4,base=1-strength;
   filter.innerHTML+='<feTurbulence type="fractalNoise" baseFrequency="'+frequency+'" numOctaves="'+(brushed?1:3)+'" seed="23" result="grain"/><feColorMatrix in="grain" type="matrix" values="'+strength+' 0 0 0 '+base+' '+strength+' 0 0 0 '+base+' '+strength+' 0 0 0 '+base+' 0 0 0 0 1" result="texture"/><feBlend in="paint" in2="texture" mode="multiply" result="paint"/>';
   if(skin.texture!=='nebula')filter.innerHTML+='<feBlend in="armor" in2="texture" mode="multiply"/><feComposite in2="SourceAlpha" operator="in" result="armor"/>';
  }
  if(skin.pattern){
   const designs={
    carbon:['armor',28,'<path d="M0 0H14V14H0ZM14 14H28V28H14Z" fill="#ccd4e2" opacity=".10"/><path d="M2 2L12 12M16 16L26 26" stroke="#05090e" stroke-width="3" opacity=".4"/>'],
    circuit:['armor',280,'<path d="M45 35V90L75 120H135V180" fill="none" stroke="#cd9263" stroke-width="2.5" opacity=".42"/><g fill="#cd9263" opacity=".55"><circle cx="45" cy="35" r="4"/><circle cx="135" cy="180" r="4"/></g>'],
    cracks:['armor',360,'<defs><path id="lava" d="M0 85L34 96L48 88L70 108L100 113L118 140L143 135L167 158L195 148L210 166L239 151L257 124L281 120L298 96L330 101L360 85M167 158L153 188L161 206L143 229L148 252L123 272L129 303L113 329L120 360M120 0L110 28L125 44L118 69L100 113"/><filter id="heat" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter></defs><use href="#lava" fill="none" stroke="#ff3b08" stroke-width="15" opacity=".5" filter="url(#heat)"/><use href="#lava" fill="none" stroke="#e85b0a" stroke-width="5" stroke-linejoin="round"/><use href="#lava" fill="none" stroke="#ffc64f" stroke-width="1.8" stroke-linejoin="round"/>'],
    porcelain:['armor',260,'<g fill="none" stroke="#234a8c" stroke-width="5" opacity=".88"><path d="M0 0Q0 48 65 52Q63 108 130 130Q197 108 195 52Q260 48 260 0M0 260Q0 212 65 208Q63 152 130 130Q197 152 195 208Q260 212 260 260"/></g><g fill="#214884" opacity=".85"><path d="M130 36Q111 49 130 56Q149 49 130 36M130 204Q111 217 130 224Q149 217 130 204"/><circle cx="130" cy="130" r="5"/></g><path d="M130 55V76M130 224V244" stroke="#3f6596" stroke-width="2" opacity=".7"/>'],
    quartz:['paint',170,'<path d="M0 40L55 60L90 15L110 95L170 130M55 60L70 150M110 95L45 110" fill="none" stroke="#ffedf7" stroke-width="3" opacity=".48"/>'],
    runes:['armor',150,'<path d="M25 20V60L45 40L25 20M85 70L110 95L85 120L60 95ZM20 125H40M110 25V45" fill="none" stroke="#644c31" stroke-width="4" opacity=".4"/>'],
    water:['paint',140,'<path d="M-20 35Q15 0 50 35T120 35T190 35M-20 95Q15 60 50 95T120 95T190 95" fill="none" stroke="#b0fff6" stroke-width="3" opacity=".22"/>'],
    wood:['armor',150,'<path d="M15 0Q65 60 15 150M35 0Q85 60 35 150M80 0Q40 80 100 150M110 0Q70 80 130 150" fill="none" stroke="#d5a76f" stroke-width="3" opacity=".19"/>']
   };
   const d=designs[skin.pattern];
   let svg,target;
   if(d){target=d[0];svg='<svg xmlns="http://www.w3.org/2000/svg" width="1254" height="1254"><defs><pattern id="p" width="'+d[1]+'" height="'+d[1]+'" patternUnits="userSpaceOnUse">'+d[2]+'</pattern></defs><rect width="1254" height="1254" fill="url(#p)"/></svg>'}
   else {target='paint';const frost=skin.pattern==='frostfire';svg='<svg xmlns="http://www.w3.org/2000/svg" width="1254" height="1254"><defs><linearGradient id="p" x1="0" x2="1"><stop stop-color="'+(frost?'#55d8ff':'#9bc6ff')+'"/><stop offset=".48" stop-color="'+(frost?'#55d8ff':'#f5e4f4')+'"/><stop offset=".55" stop-color="'+(frost?'#ff792e':'#ffd3af')+'"/><stop offset="1" stop-color="'+(frost?'#ff792e':'#b8bdf4')+'"/></linearGradient></defs><rect width="1254" height="1254" fill="url(#p)" opacity="'+(frost?'.85':'.48')+'"/></svg>'}
   if(skin.pattern==='frostfire')svg=svg.replace('x1="0" x2="1"','x1="0" x2="730" gradientUnits="userSpaceOnUse"');
   const uri='data:image/svg+xml,'+encodeURIComponent(svg);
   filter.innerHTML+='<feImage href="'+uri+'" x="0" y="0" width="1254" height="1254" result="pattern"/><feBlend in="pattern" in2="'+target+'" mode="'+(d?'normal':'color')+'"/><feComposite in2="SourceAlpha" operator="in" result="'+target+'"/>';
  }
  if(skin.fullPaint)filter.innerHTML+='<feComposite in="paint" in2="SourceAlpha" operator="in"/>';
  else filter.innerHTML+='<feComposite in="paint" in2="accentMask" operator="in" result="coloredAccents"/><feComposite in="'+armorSource+'" in2="accentMask" operator="out" result="originalArmor"/><feComposite in="coloredAccents" in2="originalArmor" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>';
  defs.append(filter);
  if(skin.pattern==='frostfire')for(const [side,color] of [['ice','#55d8ff'],['fire','#ff792e']]){
   const variant=filter.cloneNode(true);variant.id=skin.filterId+'-'+side;
   variant.querySelector('feImage').setAttribute('href','data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1254" height="1254"><rect width="1254" height="1254" fill="'+color+'" opacity=".85"/></svg>'));
   defs.append(variant);
  }
 });
 let last;
 return function(name){
  const skin=window.roboColtSkins[name]||window.roboColtSkins.Original;
  if(last===skin)return skin;last=skin;
  layers.forEach(e=>{
   let filterId=skin.filterId;
   if(name==='Frostfire'){
    if(e.closest('#rc-leg-left,#rc-rear-left,#rc-ear-left'))filterId+='-ice';
    if(e.closest('#rc-leg-right,#rc-rear-right,#rc-ear-right,#rc-tail'))filterId+='-fire';
   }
   if(filterId)e.setAttribute('filter','url(#'+filterId+')');else e.removeAttribute('filter');
  });
  pet.querySelector('#rc-iris').innerHTML='<stop stop-color="'+skin.light+'"/><stop offset=".5" stop-color="'+skin.accent+'"/><stop offset="1" stop-color="'+skin.dark+'"/>';
  pet.querySelectorAll('.eye ellipse[filter]').forEach(e=>e.setAttribute('fill',skin.accent));
  pet.querySelectorAll('.eyes-happy path').forEach(e=>e.setAttribute('stroke',skin.accent));
  pet.querySelectorAll('.eyes-sleep path').forEach(e=>e.setAttribute('stroke',skin.dark));
  pet.dataset.skin=name;
  return skin;
 };
};
