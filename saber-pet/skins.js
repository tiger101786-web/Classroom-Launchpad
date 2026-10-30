/* Shared browser/server catalog. Skin files remain lossless, full-size PNGs. */
(function(root){
 const skins={
  'Saber-tooth':{label:'Saber-tooth Tiger',art:'saber-pet/tiger.png',underlay:'saber-pet/limb-underlay.png',lid:['#bc752e','#d1aa79','#ecd0a0']},
  'Arctic':{file:'white-v3',lid:['#b8aea1','#d8d0c5','#f1eae0']},
  'Shadow':{file:'shadow-v3',lid:['#28242b','#49424b','#736773']},
  'Bengal':{file:'bengal-v3',lid:['#bc752e','#d1aa79','#ecd0a0']},
  'Snow Leopard':{file:'snow-v3',lid:['#a79b8a','#c8bdac','#e6ddcc']},
  'Sandstone':{file:'sand-v3',lid:['#b4946a','#d1b48b','#ecd9bd']},
  'Woodland':{file:'woodland-v3',lid:['#695234','#a08b6c','#d4c7ad']},
  'Storm':{file:'storm',lid:['#173d7c','#4377b3','#c1d7ed']},
  'Fire':{file:'fire-v1',lid:['#7c2417','#bd5020','#efb15d']},
  'Ice':{file:'ice-v1',lid:['#4d8caa','#a4d7e5','#e6f7fa']}
 };
 for(const [name,s] of Object.entries(skins)){s.label??=name;if(s.file){s.art=`saber-pet/skins/${s.file}.png`;s.underlay=`saber-pet/skins/${s.file}-underlay.png`;}}
 if(typeof module==='object'&&module.exports)module.exports=skins;
 else root.saberSkins=skins;
})(typeof window==='object'?window:globalThis);
