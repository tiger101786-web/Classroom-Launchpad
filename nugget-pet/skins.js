/* Shared client/server skin IDs. Original Golden remains the default. */
(function(root){
 const skins={
  "Golden": {
    "label": "Golden",
    "dip": "Honey mustard",
    "file": null
  },
  "Frozen": {
    "label": "Frozen",
    "file": "frozen",
    "dip": "Frosted honey mustard",
    "description": "Golden breading dusted with white freezer frost and fine ice crystals"
  },
  "Spicy": {
    "label": "Spicy",
    "file": "spicy",
    "photographic": true,
    "blackFeatures": true,
    "dip": "Chili sauce",
    "description": "Glossy red-orange chili glaze with pepper flecks, tiny golden chili seeds and red chili pieces"
  },
  "Buffalo": {
    "label": "Buffalo",
    "file": "buffalo",
    "characterFile": "buffalo-character-v4.png",
    "photographic": true,
    "blackFeatures": true,
    "dip": "Buffalo sauce",
    "description": "rich vivid burnt-orange buffalo butter sauce clinging to craggy chicken breading, silky glossy glaze gathered in tiny valleys, small golden crispy exposed peaks"
  },
  "BBQ": {
    "label": "BBQ",
    "file": "bbq",
    "photographic": true,
    "blackFeatures": true,
    "dip": "Smoky BBQ",
    "description": "dark reddish mahogany barbecue glaze on crispy breaded chicken, sticky lacquered highlights, caramelized ridges and tiny char specks; brown-red not black"
  },
  "Garlic Parm": {
    "label": "Garlic Parm",
    "file": "garlic-parm",
    "photographic": true,
    "blackFeatures": true,
    "dip": "Garlic parmesan",
    "description": "Golden-orange buttery breading with fine ivory parmesan shreds and small green parsley leaves"
  },
  "Honey Mustard": {
    "label": "Honey Mustard",
    "file": "honey-mustard",
    "photographic": true,
    "blackFeatures": true,
    "dip": "Honey mustard",
    "description": "Pale creamy honey-yellow coating over golden breading with fine pepper and green herb flecks"
  },
  "Extra Crispy": {
    "label": "Extra Crispy",
    "file": "extra-crispy",
    "characterFile": "extra-crispy-character-v4.png",
    "photographic": true,
    "blackFeatures": true,
    "dip": "Toasted butter pepper",
    "description": "Rich golden-orange breading with tightly curled crunchy flakes and a lighter golden center"
  },
  "Teriyaki Sesame": {
    "label": "Teriyaki Sesame",
    "file": "teriyaki-sesame",
    "photographic": true,
    "blackFeatures": true,
    "dip": "Sesame teriyaki",
    "description": "Glossy amber-mahogany teriyaki glaze with small ivory sesame seeds over crispy golden breading"
  },
  "Ranch": {
    "label": "Ranch",
    "file": "ranch",
    "characterFile": "ranch-character-v4.png",
    "photographic": true,
    "blackFeatures": true,
    "dip": "Herbed ranch",
    "description": "Thick ivory ranch dressing with fine green herbs, rounded drips and an exposed golden face center"
  },
  "Burnt": {
    "label": "Burnt",
    "file": "burnt",
    "characterFile": "burnt-character-v4.png",
    "photographic": true,
    "blackFeatures": true,
    "dip": "Charred-pepper BBQ",
    "description": "Glossy caramel-amber breading with strongly blackened charred ridges and a warm golden center"
  }
};
 if(typeof module==='object'&&module.exports)module.exports=skins;
 else root.nuggetSkins=skins;
})(typeof window==='undefined'?globalThis:window);
