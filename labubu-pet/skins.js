/* Macaron names verified against POP MART's Exciting Macaron collection.
   Palette values visually matched to the supplied photo; not manufacturer color specifications. */
(function(root){
const skins={Tan:null,Soymilk:'#e4dcc1','Lychee Berry':'#c992b5','Green Grape':'#a7c69a','Sea Salt Coconut':'#93bdce',Toffee:'#b5a591','Sesame Bean':'#a4a8ad'};
if(typeof module!=='undefined'&&module.exports)module.exports=skins;
if(!root)return;root.labubuSkins=skins;
let serial=0;
root.labubuColorArt=function(skin,prefix,source='labubu-pet/tan.png'){
 const id=prefix||'labubu-swatch-'+(++serial),color=skins[skin];
 const base=`<image href="${source}" width="1024" height="1536"/>`;
 if(!color)return base;
 const channels=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255);
 const transfer=channels.map((v,i)=>`<feFunc${'RGB'[i]} type="table" tableValues="${[v*.13,v*.37,v*.71,v,Math.min(1,v+(1-v)*.77)].join(' ')}"/>`).join('');
 return `<defs><filter id="${id}-color" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer>${transfer}<feFuncA type="identity"/></feComponentTransfer></filter><mask id="${id}-fur" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1536"><path fill="white" d="M0 0H1024V1536H0Z"/><g fill="black"><path d="M266 624Q294 538 406 535Q513 522 623 535Q738 543 766 637Q805 728 766 811Q712 904 514 899Q320 900 265 811Q227 728 266 624Z"/><ellipse cx="190" cy="1145" rx="56" ry="66"/><ellipse cx="832" cy="1145" rx="56" ry="66"/><ellipse cx="367" cy="1435" rx="103" ry="47"/><ellipse cx="656" cy="1435" rx="103" ry="47"/><path d="M296 390Q289 277 329 164Q359 70 390 118Q454 233 432 364L417 385Z M600 378Q576 255 623 131Q654 69 686 149Q733 269 724 390Z"/></g></mask></defs>${base}<g mask="url(#${id}-fur)" filter="url(#${id}-color)">${base}</g>`;
};
root.labubuThumbnail=function(skin){return `<svg viewBox="80 0 864 1510" aria-hidden="true" class="labubu-skin-thumb">${root.labubuColorArt(skin)}</svg>`};
})(typeof window!=='undefined'?window:null);
