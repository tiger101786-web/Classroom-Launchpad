/* Apply generated food materials to the original geometry at native resolution.
 * Source alpha, facial placement, basket, bowl, paper and nameplate remain fixed.
 * Material coordinates use the same body registration as the approved rig. */
(()=>{
 const images=new Map(),sets=new Map();
 const base=new URL('.',document.currentScript.src);
 function load(file){const url=new URL(file,base).href;if(!images.has(url))images.set(url,new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>{images.delete(url);reject(Error('Cannot load '+file))};i.src=url}));return images.get(url)}
 function pixels(image){const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(image,0,0);return {canvas:c,ctx:g,image:g.getImageData(0,0,c.width,c.height)}}
 const photoParts={
  leftArm:'M290 430 C250 430 221 477 221 530 C221 575 248 597 285 585 C318 579 329 548 320 505 C315 472 307 446 290 430Z',
  rightArm:'M710 430 C747 432 773 478 774 530 C774 575 748 596 715 582 C686 568 685 528 691 484 C695 459 700 441 710 430Z',
  leftFoot:'M348 645 C326 649 301 677 301 706 C301 744 348 750 401 743 C444 739 470 720 460 688 L437 645Z',
  rightFoot:'M566 645 C545 661 536 691 544 719 C555 746 607 749 650 741 C685 735 699 716 685 688 L654 645Z'
 };
 // Dedicated photographic skins bypass texture multiplication entirely. Keep
 // their native pixel dimensions while registering them to the existing rig.
 function photoLayers(reference,eyes,basket,blackFeatures=false){
  const source=pixels(reference),data=source.image.data,w=reference.width,h=reference.height;
  let left=w,top=h,right=0,bottom=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(data[(y*w+x)*4+3]>100){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y)}
  const full=document.createElement('canvas');full.width=w;full.height=h;
  const g=full.getContext('2d');g.imageSmoothingQuality='high';g.scale(w/1024,h/1024);
  g.drawImage(reference,left,top,right-left+1,bottom-top+1,221,45,551,695);
  const isolated=document.createElement('canvas');isolated.width=w;isolated.height=h;
  const b=isolated.getContext('2d');b.imageSmoothingQuality='high';b.drawImage(full,0,0);b.scale(w/1024,h/1024);b.globalCompositeOperation='destination-out';
  // Keep the entire body and feet together. Legacy foot masks cut across the
  // wider photographic silhouettes and leave triangular scraps at the ankles.
  const masks=blackFeatures?[photoParts.leftArm,photoParts.rightArm]:['M282 429 C260 436 242 456 234 485 C223 514 221 546 232 568 C242 594 275 596 297 576 C318 556 325 521 316 492 L303 451Z','M700 430 C719 433 744 452 757 479 C770 504 785 546 772 569 C760 591 729 590 710 568 C694 548 690 515 687 481Z'];
  for(const path of masks)b.fill(new Path2D(path));
  const registered=document.createElement('canvas');registered.width=w;registered.height=h;
  const r=registered.getContext('2d');r.imageSmoothingQuality='high';r.drawImage(isolated,-98*w/795,-10*h/795,w*1024/795,h*1024/795);
  if(blackFeatures){
   const e=pixels(eyes),d=e.image.data,ew=eyes.width,eh=eyes.height;
   for(let y=Math.floor(eh*295/1024);y<Math.ceil(eh*350/1024);y++)for(let x=Math.floor(ew*410/1024);x<Math.ceil(ew*625/1024);x++){
    const wx=x/ew*1024,wy=y/eh*1024;
    if(![438,597].some(cx=>((wx-cx)/24)**2+((wy-322)/25)**2<=1))continue;
    const i=(y*ew+x)*4,black=255*Math.pow(Math.min(d[i],d[i+1],d[i+2])/255,1.6);d[i]=d[i+1]=d[i+2]=black;
   }
   e.ctx.putImageData(e.image,0,0);eyes=e.canvas;
  }
  return {original:full,body:registered,wholeBody:isolated,basket,eyes,photographic:true,parts:blackFeatures?photoParts:undefined};
 }
 async function coat(source,map,isBody,blackEyes=false){
  const out=pixels(source),d=out.image.data,w=source.width,h=source.height,tex=map.image.data,tw=map.canvas.width,th=map.canvas.height;
  for(let y=0;y<h;y++){if(y%64===0)await new Promise(resolve=>setTimeout(resolve,0));for(let x=0;x<w;x++){const i=(y*w+x)*4;if(!d[i+3])continue;
   const wx=isBody?98+x/w*795:x/w*1024,wy=isBody?10+y/h*795:y/h*1024;
   // Preserve eye shape and reflections for the black-feature flavors.
   if(!isBody&&(((wx-438)/21)**2+((wy-322)/22)**2<1||((wx-597)/21)**2+((wy-322)/22)**2<1)){
    if(blackEyes){
     const black=255*Math.pow(Math.min(d[i],d[i+1],d[i+2])/255,1.6);
     d[i]=d[i+1]=d[i+2]=black;
    }
    continue;
   }
   const u=Math.max(0,Math.min(.999,(wx-190)/730)),v=Math.max(0,Math.min(.999,(wy-35)/730));
   const j=(Math.floor(v*th*.65)*tw+Math.floor(tw*.12+u*th*.65))*4;
   const lum=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];
   const shade=Math.min(1.18,.20+.95*lum/200);
   for(let k=0;k<3;k++)d[i+k]=Math.min(255,tex[j+k]*shade);
  }}out.ctx.putImageData(out.image,0,0);return out.canvas;
 }
 function sauce(source,map){
  const out=pixels(source),d=out.image.data,w=source.width,h=source.height,tex=map.image.data,tw=map.canvas.width,th=map.canvas.height;
  for(let y=Math.floor(h*.50);y<h*.585;y++)for(let x=Math.floor(w*.69);x<w*.94;x++){
   const i=(y*w+x)*4,wx=x/w*1024,wy=y/h*1024;
   if(((wx-823)/108)**2+((wy-547)/35)**2>1.04)continue;
   // Color-select the original mustard, preserving the white ceramic rim.
   const gold=Math.max(0,Math.min(1,(d[i]-d[i+2]-12)/24));
   if(!gold)continue;
   const u=Math.max(0,Math.min(.999,(wx-715)/216)),v=Math.max(0,Math.min(.999,(wy-512)/70));
   const j=(Math.floor(th*(.79+v*.20))*tw+Math.floor((.22+u*.56)*tw))*4;
   // Retain the original photographed sauce relief, swirls and rim shadow.
   const lum=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];
   const radius=((wx-823)/108)**2+((wy-547)/35)**2;
   const shade=Math.min(1.30,.28+.90*lum/180)*(1-.25*Math.pow(Math.min(1,radius),3));
   const gloss=Math.max(0,(lum-195)/60)*.78;
   for(let k=0;k<3;k++){
    const material=Math.min(255,tex[j+k]*shade);
    const lit=material*(1-gloss)+[255,246,225][k]*gloss;
    d[i+k]=d[i+k]*(1-gold)+lit*gold;
   }
  }out.ctx.putImageData(out.image,0,0,Math.floor(w*.69),Math.floor(h*.50),Math.ceil(w*.25),Math.ceil(h*.085));return out.canvas;
 }
 window.nuggetSkinLayers=async name=>{
  name=Object.hasOwn(nuggetSkins,name)?name:'Golden';
  if(!sets.has(name)){
   const promise=(async()=>{
    const [original,body,basket]=await Promise.all(['nugget-concept.png','body.png','basket.png'].map(load));
    const skin=nuggetSkins[name];if(!skin.file)return {original,body,basket};
    if(name==='Frozen'){
     const reference=await load('skins/frozen-reference.png');
     const full=document.createElement('canvas');full.width=full.height=1024;
     full.getContext('2d').drawImage(reference,133,45,reference.width*.58,reference.height*.58);
     // Register the uploaded artwork directly; do not recolor or regenerate it.
     const isolated=document.createElement('canvas');isolated.width=isolated.height=1024;
     const g=isolated.getContext('2d');g.drawImage(full,0,0);g.globalCompositeOperation='destination-out';
     for(const path of ['M282 429 C260 436 242 456 234 485 C223 514 221 546 232 568 C242 594 275 596 297 576 C318 556 325 521 316 492 L303 451Z','M700 430 C719 433 744 452 757 479 C770 504 785 546 772 569 C760 591 729 590 710 568 C694 548 690 515 687 481Z'])g.fill(new Path2D(path));
     const registered=document.createElement('canvas');registered.width=registered.height=1024;
     registered.getContext('2d').drawImage(isolated,-98*1024/795,-10*1024/795,1024*1024/795,1024*1024/795);
     return {original:full,body:registered,basket,reference:true};
    }
    if(skin.photographic){
     const [reference,atlas]=await Promise.all([load('skins/'+skin.file+'-character-v2.png'),load('skins/'+skin.file+'-material.png')]);
     return photoLayers(reference,original,sauce(basket,pixels(atlas)),skin.blackFeatures);
    }
    const atlas=await load('skins/'+skin.file+'-material.png'),map=pixels(atlas);
    const blackEyes=['Burnt','Spicy','BBQ','Frozen'].includes(name);
    const [coatedOriginal,coatedBody]=await Promise.all([coat(original,map,false,blackEyes),coat(body,map,true,blackEyes)]);
    return {original:coatedOriginal,body:coatedBody,basket:sauce(basket,map)};
   })().catch(error=>{sets.delete(name);throw error});
   sets.set(name,promise);
   // Bound decoded layer storage; active rigs keep references to their own set.
   if(sets.size>3)sets.delete(sets.keys().next().value);
  }return sets.get(name);
 };
 // Photographic reference skins use their requested black expressions.
 window.nuggetFacePalette=name=>(nuggetSkins[name]?.blackFeatures||['Spicy','Burnt','BBQ','Frozen'].includes(name))?{ink:'#000000',mouth:'#000000',eyeRing:null}:{ink:'#491e18',mouth:'#491e18',eyeRing:null};
 const thumbs=new Map();
 window.nuggetThumbnail=async name=>{
  if(!thumbs.has(name))thumbs.set(name,(async()=>{
   const s=await nuggetSkinLayers(name),c=document.createElement('canvas');c.width=c.height=320;const g=c.getContext('2d');g.scale(320/1024,320/1024);g.imageSmoothingQuality='high';g.drawImage(s.basket,0,0,1024,1024);
   if(s.reference){g.drawImage(s.original,0,0,1024,1024);return c.toDataURL('image/png');}
   const piece=(path,part)=>{g.save();g.clip(new Path2D(s.parts?.[part]||path));g.drawImage(s.original,0,0,1024,1024);g.restore()};
   if(!s.photographic){piece('M370 657 C349 674 335 696 342 717 C347 738 387 743 421 732 C450 726 467 711 456 690 L437 661Z','leftFoot');piece('M566 657 C552 674 542 698 551 718 C560 738 607 741 640 732 C670 726 678 710 660 689 L638 661Z','rightFoot');}
   g.save();g.beginPath();g.rect(0,0,1024,s.photographic?1024:672);g.clip();if(s.wholeBody)g.drawImage(s.wholeBody,0,0,1024,1024);else g.drawImage(s.body,98,10,795,795);g.restore();
   piece('M282 429 C260 436 242 456 234 485 C223 514 221 546 232 568 C242 594 275 596 297 576 C318 556 325 521 316 492 L303 451Z','leftArm');
   piece('M700 430 C719 433 744 452 757 479 C770 504 785 546 772 569 C760 591 729 590 710 568 C694 548 690 515 687 481Z','rightArm');
   const face=nuggetFacePalette(name);
   for(const x of [438,597]){g.save();g.beginPath();g.ellipse(x,322,24,25,0,0,Math.PI*2);g.clip();g.drawImage(s.eyes||s.original,0,0,1024,1024);g.restore();if(face.eyeRing){g.strokeStyle=face.eyeRing;g.lineWidth=2;g.beginPath();g.ellipse(x,322,24,25,0,0,Math.PI*2);g.stroke()}}
   g.strokeStyle=face.ink;g.lineWidth=7;g.lineCap='round';g.beginPath();g.moveTo(482,359);g.quadraticCurveTo(516,386,550,359);g.stroke();
   return c.toDataURL('image/png');
  })().catch(e=>{thumbs.delete(name);throw e}));
  return thumbs.get(name);
 };
})();
