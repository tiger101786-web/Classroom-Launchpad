/* Decode full-size coat PNGs once. Never recolor or downsample source artwork. */
(()=>{
 const images=new Map();
 window.saberCoatedImage=src=>{
  if(!images.has(src)){
   const image=new Image();image.src=src;
   images.set(src,image.decode().then(()=>image).catch(error=>{images.delete(src);throw error}));
  }
  return images.get(src);
 };
})();
