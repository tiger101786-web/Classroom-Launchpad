// Approved bamboo artwork with editable, account-specific lettering.
(()=>{
 const asset=new URL('bamboo-nameplate-v1.png',document.currentScript.src).href;
 const font=new URL('Nunito.ttf',document.currentScript.src).href;
 window.createSquishyNameplate=function(pet){
  const ns='http://www.w3.org/2000/svg',svg=pet.querySelector('svg'),g=document.createElementNS(ns,'g');
  const style=document.createElement('style');style.textContent=`@font-face{font-family:SquishyName;src:url("${font}") format("truetype");font-weight:200 1000;font-display:swap}`;document.head.append(style);
  g.id='squishy-nameplate';g.setAttribute('pointer-events','none');
  const art=document.createElementNS(ns,'image');art.setAttribute('href',asset);art.setAttribute('x','102');art.setAttribute('y','1160');art.setAttribute('width','1050');art.setAttribute('height','390.69');
  const text=document.createElementNS(ns,'text');text.setAttribute('x','627');text.setAttribute('text-anchor','middle');text.setAttribute('font-family','SquishyName,sans-serif');text.setAttribute('font-weight','900');text.setAttribute('fill','#613619');text.setAttribute('stroke','#ffe9b5');text.setAttribute('stroke-width','1.5');text.setAttribute('paint-order','stroke');
  g.append(art,text);svg.append(g);
  function fit(){text.setAttribute('font-size','100');text.setAttribute('y','1380');while(text.getBBox().width>560&&Number(text.getAttribute('font-size'))>12)text.setAttribute('font-size',String(Number(text.getAttribute('font-size'))-1));const box=text.getBBox();text.setAttribute('y',String(1380+1357-box.y-box.height/2));}
  document.fonts.load('900 100px SquishyName').then(fit).catch(()=>{});
  return {update(name,visible=true){g.style.display=visible?'':'none';text.textContent=Array.from(String(name).replace(/[\u0000-\u001f\u007f]/g,'').trim()).slice(0,16).join('')||'Mochi';fit();g.setAttribute('aria-label',text.textContent+' nameplate');}};
 };
})();
