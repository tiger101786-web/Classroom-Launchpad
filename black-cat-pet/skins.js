/* Shared browser/server catalog. Approved preview PNGs remain unchanged. */
(function(root){
 const skins={
  "Black": {
    "label": "Black Cat",
    "art": "black-cat-pet/black-cat.png",
    "underlay": "black-cat-pet/black-cat-body-underlay-v4.png",
    "forelegs": "black-cat-pet/black-cat-forelegs-v5.png",
    "happyInk": "#e1b24f",
    "lidInk": "#141217"
  },
  "Ginger Tabby": {
    "label": "Ginger Tabby",
    "art": "black-cat-pet/skins/ginger.png",
    "underlay": "black-cat-pet/skins/ginger-underlay.png",
    "forelegs": "black-cat-pet/skins/ginger-forelegs.png",
    "happyInk": "#743b23",
    "lidInk": "#663c29"
  },
  "Silver Tabby": {
    "label": "Silver Tabby",
    "art": "black-cat-pet/skins/silver.png",
    "underlay": "black-cat-pet/skins/silver-underlay.png",
    "forelegs": "black-cat-pet/skins/silver-forelegs.png",
    "happyInk": "#87a95d",
    "lidInk": "#35343d"
  },
  "Siamese": {
    "label": "Siamese",
    "art": "black-cat-pet/skins/siamese.png",
    "underlay": "black-cat-pet/skins/siamese-underlay.png",
    "forelegs": "black-cat-pet/skins/siamese-forelegs.png",
    "happyInk": "#7ebce5",
    "lidInk": "#3c2927"
  },
  "Calico": {
    "label": "Calico",
    "art": "black-cat-pet/skins/calico.png",
    "underlay": "black-cat-pet/skins/calico-underlay.png",
    "forelegs": "black-cat-pet/skins/calico-forelegs.png",
    "happyInk": "#9ca43c",
    "lidInk": "#514443"
  },
  "Tuxedo": {
    "label": "Tuxedo",
    "art": "black-cat-pet/skins/tuxedo.png",
    "underlay": "black-cat-pet/skins/tuxedo-underlay.png",
    "forelegs": "black-cat-pet/skins/tuxedo-forelegs.png",
    "happyInk": "#b2ac4b",
    "lidInk": "#181719"
  },
  "Chocolate": {
    "label": "Chocolate",
    "art": "black-cat-pet/skins/chocolate.png",
    "underlay": "black-cat-pet/skins/chocolate-underlay.png",
    "forelegs": "black-cat-pet/skins/chocolate-forelegs.png",
    "happyInk": "#e3a044",
    "lidInk": "#543226"
  },
  "Hairless Sphynx": {
    "label": "Hairless Sphynx",
    "art": "black-cat-pet/skins/sphynx.png",
    "underlay": "black-cat-pet/skins/sphynx-underlay.png",
    "forelegs": "black-cat-pet/skins/sphynx-forelegs.png",
    "happyInk": "#784c43",
    "lidInk": "#967277"
  }
};
 if(typeof module==='object'&&module.exports)module.exports=skins;
 else root.blackcatSkins=skins;
})(typeof window==='object'?window:globalThis);
