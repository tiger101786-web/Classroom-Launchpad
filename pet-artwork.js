/* Keep hidden companions' original artwork unloaded until selected. */
window.deferPetArtwork=markup=>markup.replace(/(<(?:image|img)\b[^>]*?\s)(href|src)=/g,'$1data-pet-$2=');
window.loadPetArtwork=host=>{
 if(host.hidden)return;
 host.querySelectorAll('[data-pet-href], [data-pet-src]').forEach(image=>{
  for(const attribute of ['href','src']){
   const key='data-pet-'+attribute;
   if(image.hasAttribute(key)){image.setAttribute(attribute,image.getAttribute(key));image.removeAttribute(key);}
  }
 });
};
