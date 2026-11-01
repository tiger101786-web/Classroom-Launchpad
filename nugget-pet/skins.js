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
    "photographic": true,
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
    "photographic": true,
    "dip": "Toasted butter pepper",
    "description": "deep golden amber double-breaded fried chicken crust, highly detailed chunky jagged panko flakes, bubbled crispy ridges and caramelized toasted brown crumb tips, matte dry crunch with restrained oil sheen"
  },
  "Teriyaki Sesame": {
    "label": "Teriyaki Sesame",
    "file": "teriyaki-sesame",
    "photographic": true,
    "blackFeatures": true,
    "dip": "Sesame teriyaki",
    "description": "Glossy amber-mahogany teriyaki glaze with small ivory sesame seeds over crispy golden breading"
  },
  "Burnt": {
    "label": "Burnt",
    "file": "burnt",
    "dip": "Charred-pepper BBQ",
    "description": "very dark toasted charcoal-brown fried chicken breading, cracked blackened crust peaks with deep umber and occasional copper-brown fissures, realistic dry char texture; retain readable detailed relief, not a flat black surface"
  }
};
 if(typeof module==='object'&&module.exports)module.exports=skins;
 else root.nuggetSkins=skins;
})(typeof window==='undefined'?globalThis:window);
