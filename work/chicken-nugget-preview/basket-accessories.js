/* Preview only. Original generated PNGs retain native resolution and alpha. */
window.nuggetBasketAccessories=(()=>{
 const images=new Map();let selected='none',version=0;
 const labels={none:'No basket accessory','french-fries':'French fries','waffle-fries':'Waffle fries'};
 async function select(name){
  if(!Object.hasOwn(labels,name))name='none';
  const current=++version;
  if(name!=='none'&&!images.has(name)){
   const image=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('Could not load '+labels[name]));i.src='accessories/'+name+'-v2.png'});
   images.set(name,image);
  }
  if(current===version)selected=name;
  return selected;
 }
 function draw(ctx,basket){
  const image=images.get(selected);if(!image||selected==='none')return;
  // Generous portions surround the pet, behind its moving body and limbs.
  // Clip to the inside of the basket, preserving the foreground rim and label.
  ctx.save();ctx.beginPath();ctx.moveTo(20,285);ctx.lineTo(1004,285);ctx.lineTo(1004,650);ctx.bezierCurveTo(950,735,740,775,510,775);ctx.bezierCurveTo(275,775,80,730,20,660);ctx.closePath();ctx.clip();
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  // One reference-aligned arrangement, not repeated or rotated miniature piles.
  // Leave bare paper under the feet, including when they lift while dancing.
  ctx.beginPath();ctx.rect(0,0,1024,1024);
  ctx.moveTo(469,715);ctx.ellipse(401,715,68,30,0,0,Math.PI*2);
  ctx.moveTo(680,715);ctx.ellipse(612,715,68,30,0,0,Math.PI*2);
  ctx.clip('evenodd');
  ctx.drawImage(image,0,0,1024,1024);
  ctx.restore();
  // Follow the ceramic rim rather than copying the red liner above/right of it.
  // Shared by both fry types and all matching sauce flavors.
  ctx.save();ctx.beginPath();ctx.moveTo(694,543);
  ctx.bezierCurveTo(694,514,750,493,819,493);
  ctx.bezierCurveTo(889,493,947,514,951,545);
  ctx.bezierCurveTo(954,566,938,584,936,588);
  ctx.lineTo(930,617);ctx.bezierCurveTo(920,645,885,668,848,673);
  ctx.bezierCurveTo(800,676,739,660,717,637);
  ctx.bezierCurveTo(705,618,703,580,698,566);
  ctx.closePath();ctx.clip();ctx.drawImage(basket,0,0,1024,1024);ctx.restore();
 }
 return {select,draw,labels,get selected(){return selected}};
})();
