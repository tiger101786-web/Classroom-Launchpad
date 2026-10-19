// Approved rendered nameplate with bundled, editable lettering.
window.createColtNameplate=function(pet){
 const ns='http://www.w3.org/2000/svg',plate=document.createElementNS(ns,'g');
 if(!document.getElementById('colt-name-font')){const style=document.createElement('style');style.id='colt-name-font';style.textContent='@font-face{font-family:ColtOxanium;src:url("robo-colt/Oxanium.ttf") format("truetype");font-weight:400 900;font-display:swap}';document.head.append(style);}
 plate.id='rc-nameplate';plate.setAttribute('pointer-events','none');
 plate.innerHTML='<defs><filter id="rc-name-enamel" color-interpolation-filters="sRGB"><feColorMatrix type="matrix"/></filter><linearGradient id="rc-letter-cut" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff8ec"/><stop offset=".44" stop-color="#f5e9d8"/><stop offset=".49" stop-color="#e7d7be"/><stop offset=".55" stop-color="#f0e3cf"/><stop offset="1" stop-color="#ded0b8"/></linearGradient></defs><image href="robo-colt/nameplate-wide-v1.png" x="25" y="890" width="680" height="245.1125" preserveAspectRatio="xMidYMid meet" filter="url(#rc-name-enamel)"/><text x="365" y="1033" text-anchor="middle" fill="url(#rc-letter-cut)" font-family="ColtOxanium,serif" font-weight="700" font-size="64" letter-spacing="3" stroke="#151218" stroke-width="1.8" paint-order="stroke"></text>';
 const platform=pet.querySelector('#rc-platform');platform.insertBefore(plate,platform.firstChild);
 function fit(){const text=plate.querySelector('text');text.setAttribute('font-size','64');const width=text.getBBox().width;if(width>500)text.setAttribute('font-size',String(Math.floor(64*490/width)));}
 document.fonts.load('700 64px ColtOxanium').then(fit).catch(()=>{});
 return {update(name,skin='Original',visible=true){
  const clean=Array.from(String(name).replace(/[\u0000-\u001f\u007f]/g,'').trim()).slice(0,16).join('')||'COLT';
  plate.querySelector('text').textContent=clean;
  const [r,g,b]=(window.roboColtSkins[skin]||window.roboColtSkins.Original).tint||[1,0,0];
  plate.querySelector('feColorMatrix').setAttribute('values',`${r} ${1-r} 0 0 0 ${g} ${1-g} 0 0 0 ${b} ${-b} 1 0 0 0 0 0 1 0`);
  // Share the actual platform finish, including light armor and texture variants.
  const platformFilter=platform.querySelector(':scope > image').getAttribute('filter');
  if(platformFilter)plate.querySelector('image').setAttribute('filter',platformFilter);
  else plate.querySelector('image').setAttribute('filter','url(#rc-name-enamel)');
  plate.querySelector('text').setAttribute('fill','url(#rc-letter-cut)');
  plate.querySelector('text').setAttribute('stroke','#151218');
  plate.style.display=visible?'':'none';fit();plate.setAttribute('aria-label',clean+' nameplate');
 }};
};
