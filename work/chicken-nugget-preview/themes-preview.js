/* Test-only basket themes. No production preferences or character pixels change. */
window.nuggetThemePreview=(()=>{
 const labels={none:'Original basket',mcdonalds:"McDonald's",'chick-fil-a':'Chick-fil-A','burger-king':'Burger King','raising-canes':"Raising Cane's"};
 const cache=new Map();let current=null,selected='none',version=0;
 async function select(name){
  if(!Object.hasOwn(labels,name))name='none';const request=++version;
  if(name==='none'){current=null;selected=name;return name}
  if(!cache.has(name))cache.set(name,new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>{cache.delete(name);reject(Error('Could not load '+labels[name]+' basket'))};image.src='themes/'+name+'.png'}));
  const image=await cache.get(name);
  if(request===version){current=image;selected=name}return selected;
 }
 return {labels,select,get current(){return current},get selected(){return selected}};
})();
