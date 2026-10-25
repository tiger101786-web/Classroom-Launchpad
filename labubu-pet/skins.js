/* Macaron names verified against POP MART's Exciting Macaron collection.
   Palette values visually matched to the supplied photo; not manufacturer color specifications. */
(function(root){
const skins={Tan:null,Soymilk:'#e4dcc1','Lychee Berry':'#c992b5','Green Grape':'#a7c69a','Sea Salt Coconut':'#93bdce',Toffee:'#b5a591','Sesame Bean':'#a4a8ad'};
if(typeof module!=='undefined'&&module.exports)module.exports=skins;
if(!root)return;root.labubuSkins=skins;
let serial=0;
root.labubuColorArt=function(skin,prefix,source='labubu-pet/tan.png'){
 const id=prefix||'labubu-swatch-'+(++serial),color=skins[skin]||'#d4a273';
 const base=`<image href="${source}" width="1024" height="1536"/>`;

 const channels=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255);
 const transfer=channels.map((v,i)=>`<feFunc${'RGB'[i]} type="table" tableValues="${[v*.13,v*.37,v*.71,v,Math.min(1,v+(1-v)*.77)].join(' ')}"/>`).join('');
 return `<defs><filter id="${id}-color" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer>${transfer}<feFuncA type="identity"/></feComponentTransfer></filter><mask id="${id}-fur" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1536"><path fill="${skin==='Tan'?'black':'white'}" d="M0 0H1024V1536H0Z"/><g fill="black"><path d="M266 624Q294 538 406 535Q513 522 623 535Q738 543 766 637Q805 728 766 811Q712 904 514 899Q320 900 265 811Q227 728 266 624Z"/><ellipse cx="190" cy="1145" rx="56" ry="66"/><ellipse cx="832" cy="1145" rx="56" ry="66"/><ellipse cx="367" cy="1435" rx="103" ry="47"/><ellipse cx="656" cy="1435" rx="103" ry="47"/><path d="M305 406C285 345 307 227 340 157C362 106 389 78 414 106C457 144 466 252 452 335L444 350Q372 367 305 406Z M590 348C570 300 560 214 587 145C602 109 622 83 645 101C696 131 727 259 726 389Q654 366 590 348Z"/></g><path fill="white" d="M364 373C359 338 371 270 384 234C390 217 396 211 401 224C411 249 407 313 403 359Z M625 357C618 329 612 274 613 241C613 215 620 202 628 219C650 250 662 315 665 373Z"/></mask></defs>${base}<g mask="url(#${id}-fur)" filter="url(#${id}-color)">${base}</g>`;
};
root.labubuThumbnail=function(skin){return `<svg viewBox="80 0 864 1510" aria-hidden="true" class="labubu-skin-thumb">${root.labubuColorArt(skin)}</svg>`};
})(typeof window!=='undefined'?window:null);
