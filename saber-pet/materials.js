/* Texture-only coats. No resampling, deformation, alpha edits or AI redraws.
   The identical material is applied to the original artwork and hidden limbs. */
(()=>{
 const cache=new Map(),images=new Map();
 const clamp=x=>Math.max(0,Math.min(1,x));
 const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
 function load(src){if(!images.has(src)){const i=new Image();i.src=src;images.set(src,i.decode().then(()=>i))}return images.get(src)}
 async function coat(src,kind){
  const image=await load(src);if(!kind)return image;
  const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
  const frame=ctx.getImageData(0,0,canvas.width,canvas.height),d=frame.data;
  for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
   const i=(y*canvas.width+x)*4;if(!d[i+3])continue;
   const r=d[i]/255,g=d[i+1]/255,b=d[i+2]/255,px=x/canvas.width*1024,py=y/canvas.height*1024;
   // Protect the eyes, muzzle/nose, sabers and claws. Coat masks fade softly
   // into the original cream fur; original highlights and fur luminance remain.
   const eye=Math.max(Math.exp(-(((px-429)/38)**2+((py-257)/35)**2)*2),Math.exp(-(((px-617)/38)**2+((py-257)/35)**2)*2));
   const nose=Math.exp(-(((px-520)/50)**2+((py-405)/23)**2)*2);
   const ivory=(smooth(460,500,py)*(1-smooth(630,670,py))*(Math.exp(-(((px-429)/24)**2))+Math.exp(-(((px-607)/24)**2))));
   const protect=Math.max(smooth(.15,.55,eye),smooth(.15,.5,nose),clamp(ivory));
   const lum=.28*r+.57*g+.15*b;
   let mask=1-protect,R=r,G=g,B=b;
   if(kind==='arctic'||kind==='snow'){
    const value=Math.pow(lum,.67);R=value*.97;G=value*.985;B=value;
   }else if(kind==='shadow'){R=lum*.42;G=lum*.39;B=lum*.44;}
   else if(kind==='sand'){R=lum*1.1;G=lum*.94;B=lum*.72;}
   else if(kind==='woodland'){R=lum*.79;G=lum*.68;B=lum*.49;}
   const orange=smooth(.05,.22,r-b)*(1-smooth(.74,.94,b));
   if(kind==='bengal'||kind==='woodland'){
    const side=Math.abs(px-520),wave=Math.sin(py*.058+side*.037+2.2*Math.sin(py*.014)+Math.sin(px*.026))+.09*Math.sin(px*.47+py*.91);
    const taper=smooth(35,160,side),stripe=smooth(.63,.9,wave)*orange*taper;
    const dark=1-stripe*(kind==='bengal'?.65:.51);R*=dark;G*=dark;B*=dark;
   }
   if(kind==='snow'){
    const qx=px+9*Math.sin(py*.025),qy=py+8*Math.sin(px*.028);
    const cellX=Math.floor(qx/49),cellY=Math.floor(qy/43);
    const cx=((qx%49)+49)%49-24.5,cy=((qy%43)+43)%43-21.5;
    const radius=Math.sqrt((cx/15)**2+(cy/12)**2);
    const seed=Math.sin(cellX*127.1+cellY*311.7)*43758.5453;
    const broken=.55+.45*Math.sin(Math.atan2(cy,cx)*3+seed);
    const ring=(smooth(.45,.7,radius)-smooth(.93,1.2,radius))*broken;
    const spot=ring*orange*smooth(30,120,Math.abs(px-520));R*=1-.7*spot;G*=1-.7*spot;B*=1-.7*spot;
   }
   d[i]=Math.round(255*clamp(r+(R-r)*mask));d[i+1]=Math.round(255*clamp(g+(G-g)*mask));d[i+2]=Math.round(255*clamp(b+(B-b)*mask));
  }
  ctx.putImageData(frame,0,0);return canvas;
 }
 window.saberCoatedImage=(src,kind)=>{const key=src+'|'+(kind||'');if(!cache.has(key))cache.set(key,coat(src,kind));return cache.get(key)};
 window.saberPaintThumbnails=container=>{
  container.querySelectorAll('img[data-saber-skin]').forEach(async img=>{
   const s=saberSkins[img.dataset.saberSkin];if(!s?.material)return;
   const canvas=await saberCoatedImage(s.art,s.material);if(!img.isConnected)return;
   img.src=canvas.toDataURL('image/png');
  });
 };
})();
