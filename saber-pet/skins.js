/* Shared browser/server catalog. Skin files remain lossless, full-size PNGs. */
(function(root){
 const skins={
  'Saber-tooth':{label:'Saber-tooth Tiger',art:'saber-pet/tiger.png',underlay:'saber-pet/limb-underlay.png',lid:['#bc752e','#d1aa79','#ecd0a0']},
  'Arctic':{material:'arctic',lid:['#aaa9ab','#d1d4d7','#f0f2f2']},
  'Shadow':{material:'shadow',lid:['#28242b','#49424b','#736773']},
  'Bengal':{material:'bengal',lid:['#bc752e','#d1aa79','#ecd0a0']},
  'Snow Leopard':{material:'snow',lid:['#aaa9ab','#d1d4d7','#f0f2f2']},
  'Sandstone':{material:'sand',lid:['#b4946a','#d1b48b','#ecd9bd']},
  'Woodland':{material:'woodland',lid:['#695234','#a08b6c','#d4c7ad']},
  'Storm':{file:'storm',lid:['#173d7c','#4377b3','#c1d7ed']}
 };
 for(const [name,s] of Object.entries(skins)){s.label??=name;if(s.file){s.art=`saber-pet/skins/${s.file}.png`;s.underlay=`saber-pet/skins/${s.file}-underlay.png`;}else if(s.material){s.art=skins['Saber-tooth'].art;s.underlay=skins['Saber-tooth'].underlay;}}
 if(typeof module==='object'&&module.exports)module.exports=skins;
 else root.saberSkins=skins;
})(typeof window==='object'?window:globalThis);
