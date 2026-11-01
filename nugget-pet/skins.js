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
    "dip": "Chili sauce",
    "description": "deep brick-red cayenne dry rub on rugged fried chicken breading, paprika powder, tiny red chili flakes, toasted gold crumbs peeking through, scattered dark pepper flecks"
  },
  "Buffalo": {
    "label": "Buffalo",
    "file": "buffalo",
    "dip": "Buffalo sauce",
    "description": "rich vivid burnt-orange buffalo butter sauce clinging to craggy chicken breading, silky glossy glaze gathered in tiny valleys, small golden crispy exposed peaks"
  },
  "BBQ": {
    "label": "BBQ",
    "file": "bbq",
    "dip": "Smoky BBQ",
    "description": "dark reddish mahogany barbecue glaze on crispy breaded chicken, sticky lacquered highlights, caramelized ridges and tiny char specks; brown-red not black"
  },
  "Garlic Parm": {
    "label": "Garlic Parm",
    "file": "garlic-parm",
    "dip": "Garlic parmesan",
    "description": "creamy golden garlic-butter coated crispy breading with many finely grated ivory parmesan shavings, small toasted minced garlic pieces, sparsely scattered little green parsley flecks; pale golden cream rather than orange"
  },
  "Honey Mustard": {
    "label": "Honey Mustard",
    "file": "honey-mustard",
    "dip": "Honey mustard",
    "description": "warm golden ochre honey mustard glaze over textured crispy chicken breading, glossy honey ribbons, tiny mustard seed flecks, pale golden highlights; yellow gold rather than orange"
  },
  "Extra Crispy": {
    "label": "Extra Crispy",
    "file": "extra-crispy",
    "dip": "Toasted butter pepper",
    "description": "deep golden amber double-breaded fried chicken crust, highly detailed chunky jagged panko flakes, bubbled crispy ridges and caramelized toasted brown crumb tips, matte dry crunch with restrained oil sheen"
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
