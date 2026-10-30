/* Shared browser/server catalog. Skin files remain lossless, full-size PNGs. */
(function(root){
 const skins={
  'Saber-tooth':{label:'Saber-tooth Tiger',art:'saber-pet/tiger.png',underlay:'saber-pet/limb-underlay.png',lid:['#bc752e','#d1aa79','#ecd0a0']},
  'Arctic':{file:'white',lid:['#b2a99d','#d7d1c8','#eeeae4']},
  'Shadow':{file:'shadow',lid:['#302a28','#514841','#71665b']},
  'Bengal':{file:'bengal',lid:['#a66123','#cd8a3c','#ead6b8']},
  'Snow Leopard':{file:'snow',lid:['#8c8070','#b8ac9b','#ddd4c5']},
  'Sandstone':{file:'sand',lid:['#a07643','#c4a175','#e3d1b6']},
  'Woodland':{file:'woodland',lid:['#7e5d32','#ae8756','#d5c2a2']},
  'Storm':{file:'storm',lid:['#173d7c','#4377b3','#c1d7ed']}
 };
 for(const [name,s] of Object.entries(skins)){s.label??=name;if(s.file){s.art=`saber-pet/skins/${s.file}.png`;s.underlay=`saber-pet/skins/${s.file}-underlay.png`;}}
 if(typeof module==='object'&&module.exports)module.exports=skins;
 else root.saberSkins=skins;
})(typeof window==='object'?window:globalThis);
