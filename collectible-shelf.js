(function (root) {
  'use strict';
  const themes = [
    {id:'crimson',name:'Crimson Original'},
    {id:'dinosaur-dig',name:"Dinosaur Dig"},
    {id:'wizard-library',name:"Wizard’s Library"},
    {id:'candy-kingdom',name:"Candy Kingdom"},
    {id:'storm-fortress',name:"Storm Fortress"},
    {id:'stained-glass',name:"Stained Glass"},
    {id:'clockwork-observatory',name:"Clockwork Observatory"},
    {id:'bamboo-panda',name:"Bamboo Panda"},
    {id:'racing-garage',name:"Racing Garage"},
    {id:'firefly-bayou',name:"Firefly Bayou"},
    {id:'origami-garden',name:"Origami Garden"},
    {id:'anime-spirit',name:'Hokage Mountain'},
    {id:'aurora',name:'Arctic Aurora'},
    {id:'honeybee',name:'Honeybee Garden'},
    {id:'volcanic',name:'Volcanic Forge'},
    {id:'amethyst',name:'Amethyst Crystal'},
    {id:'temple',name:'Ancient Temple'},
    {id:'art-deco',name:'Art Deco'},
    {id:'celestial',name:'Celestial Night'},
    {id:'blossom',name:'Cherry Blossom'},
    {id:'autumn',name:'Copper Autumn'},
    {id:'crimson-bastion',name:'Crimson Bastion'},
    {id:'crimson-spire',name:'Crimson Spire'},
    {id:'cyber',name:'Cyber Circuit'},
    {id:'desert',name:'Desert Sunset'},
    {id:'dragon',name:'Dragon Obsidian'},
    {id:'forest',name:'Enchanted Forest'},
    {id:'ice',name:'Frost Crystal'},
    {id:'cathedral',name:'Gothic Cathedral'},
    {id:'halloween',name:'Halloween Glow'},
    {id:'mardi-gras',name:'Mardi Gras'},
    {id:'ocean',name:'Ocean Pearl'},
    {id:'peacock',name:'Peacock Palace'},
    {id:'pirate',name:'Pirate Cove'},
    {id:'porcelain',name:'Porcelain Garden'},
    {id:'royal',name:'Royal Gold'},
    {id:'sakura-moon',name:'Sakura Moon'},
    {id:'steampunk',name:'Steampunk Brass'},
    {id:'holiday',name:'Winter Holiday'}
  ];
  const themeIds = new Set(themes.map(theme => theme.id));
  // IDs and row order are stable: each row maps to the six-column artwork atlas.
  const rows = [
    ['Sports', ['trophy','Gold Trophy'], ['basketball','Basketball'], ['soccer','Soccer Ball'], ['baseball','Baseball & Glove'], ['helmet','Colt Football Helmet'], ['tanjiro','Tanjiro Bust']],
    ['Space', ['astronaut','Astronaut'], ['rocket','Rocket'], ['planet','Ringed Planet'], ['ufo','UFO'], ['alien','Friendly Alien'], ['moon','Moon Globe']],
    ['Creatures & Colt Pride', ['dragon','Baby Dragon'], ['dinosaur','Dinosaur'], ['owl','Owl'], ['turtle','Sea Turtle'], ['horse','Colt Horse'], ['horseshoe','Golden Horseshoe']],
    ['Technology', ['robot','Robot'], ['computer','Retro Computer'], ['controller','Game Controller'], ['arcade','Arcade Cabinet'], ['camera','Camera'], ['headphones','Headphones']],
    ['Nature', ['crystal','Amethyst Crystal'], ['bonsai','Bonsai Tree'], ['cactus','Cactus'], ['sunflower','Sunflower'], ['shell','Seashell'], ['butterfly','Butterfly Dome']],
    ['Culture, Faith & Books', ['mask','Mardi Gras Mask'], ['fleur','Fleur-de-lis'], ['crawfish','Crawfish'], ['church','Little Church'], ['cross','Golden Cross'], ['books','Book Stack']],
    ['Anime', ['all-might','All Might Statue'], ['naruto','Naruto Sage Mode Bust'], ['goku','Goku Statue'], ['pikachu','Pikachu'], ['eevee','Eevee'], ['nezuko','Nezuko Statue'], ['luffy','Luffy Bust'], ['sailor-moon','Sailor Moon Figurine'], ['rumi','Rumi Statue']],
    ['Display Pieces', ['crystal-dragon','Crystal Dragon'], ['moon-astronaut','Moon Astronaut'], ['race-car','Race Car'], ['ship-bottle','Ship in a Bottle'], ['knight-helmet','Knight Helmet'], ['streetcar','New Orleans Streetcar'], ['saxophone','Jazz Saxophone'], ['pinball','Pinball Machine'], ['snow-globe','Mountain Snow Globe'], ['owl-books','Spellbook Owl']],
    ['Music', ['trumpet','Golden Trumpet']],
    ['Shelf Decorations', ['ceramic-fox','Ceramic Fox'], ['succulent','Succulent Pot'], ['hourglass','Brass Hourglass'], ['mantel-clock','Vintage Mantel Clock']],
    ['Science', ['microscope','Microscope'], ['telescope','Brass Telescope'], ['dna','DNA Model'], ['atom','Atom Sculpture'], ['earth-globe','Antique Earth Globe']],
    ['Travel & Adventure', ['hot-air-balloon','Hot Air Balloon'], ['compass','Nautical Compass'], ['lighthouse','Lighthouse'], ['biplane','Vintage Biplane'], ['steam-train','Steam Locomotive']],
    ['Fantasy & Treats', ['treasure-chest','Treasure Chest'], ['phoenix','Phoenix Statue'], ['potion','Enchanted Potion'], ['beignets','Beignet Plate'], ['cupcake','Rose Cupcake']],
    ['Little Animals', ['red-panda','Red Panda Figurine'], ['penguin','Penguin Figurine'], ['axolotl','Axolotl Figurine'], ['hedgehog','Hedgehog Figurine'], ['lucky-cat','Lucky Cat']],
    ['Cozy Keepsakes', ['terrarium','Glass Terrarium'], ['mushroom-house','Mushroom Cottage'], ['lantern','Mini Lantern'], ['music-box','Ballerina Music Box'], ['teacup','Floral Teacup']],
    ['Curios & Ornaments', ['rubber-duck','Rubber Duck'], ['origami-crane','Origami Crane'], ['ammonite','Ammonite Fossil'], ['geode','Blue Geode'], ['message-bottle','Message in a Bottle'], ['jewelry-box','Jeweled Trinket Box'], ['snowman','Snowman Figurine'], ['pumpkin-lantern','Pumpkin Lantern'], ['daisy-vase','Daisy Vase'], ['sandcastle','Sandcastle Keepsake']]
  ];
  rows.push(
    ['Squishy Toys', ['squishy-pink','Pink Squishy Dumpling'], ['squishy-blue','Blue Squishy Dumpling'], ['squishy-gold','Glitter Gold Squishy Dumpling']],
    ['Animal Friends', ['highland-cow','Highland Cow Statue']],
    ['Anime', ['itachi','Itachi Uchiha Bust']],
    ['Anime', ['sasuke','Sasuke Uchiha Bust'], ['madara','Madara Uchiha Bust'], ['kakashi','Kakashi Hatake Bust'], ['sakura','Sakura Haruno Bust']],
    ['Anime', ['muzan','Muzan Kibutsuji Bust'], ['rengoku','Kyojuro Rengoku Bust'], ['mitsuri','Mitsuri Kanroji Bust'], ['muichiro','Muichiro Tokito Bust']],
    ['Anime', ['anya','Anya Forger Statue'], ['frieren','Frieren Statue'], ['gojo','Satoru Gojo Bust']],
    ['Character Collectibles', ['peppa','Peppa Pig Statue']],
    ['Character Collectibles', ['bluey','Bluey Statue'], ['sonic','Sonic Statue'], ['hello-kitty','Hello Kitty Statue']],
    ["Fall & Halloween",["harvest-gnome","Harvest Gnome"],["scarecrow","Scarecrow Figurine"],["acorn-house","Acorn Cottage"],["apple-basket","Apple Harvest Basket"],["pumpkin-pie","Pumpkin Pie Keepsake"],["friendly-ghost","Friendly Ghost"],["witch-cat","Witch Cat Figurine"],["candy-cauldron","Candy Cauldron"],["haunted-cottage","Haunted Cottage"],["bat-figurine","Little Bat Figurine"]],
    ["Animal Friends",["capybara","Capybara Figurine"],["otter","Otter Figurine"],["frog-prince","Frog Prince"],["sleeping-cat","Sleeping Cat"],["hummingbird","Hummingbird Sculpture"]],
    ["Miniature Treasures",["gumball-machine","Mini Gumball Machine"],["retro-radio","Mini Retro Radio"],["typewriter","Mini Typewriter"],["lava-lamp","Mini Lava Lamp"],["rotary-phone","Mini Rotary Phone"]],
    ["Tiny Wonders",["seahorse","Seahorse Sculpture"],["kraken","Tiny Kraken"],["unicorn","Unicorn Figurine"],["wizard-hat","Wizard Hat Keepsake"],["dragon-egg","Dragon Egg"]],
    ["Sweet & Playful",["macaron-tower","Macaron Tower"],["honey-pot","Honey Pot"],["rubiks-cube","Puzzle Cube"],["nesting-doll","Nesting Doll"],["paperweight","Galaxy Paperweight"]],
    ["Woodland Companions",["sloth","Sloth Figurine"],["koala","Koala Figurine"],["dachshund","Dachshund Figurine"],["raccoon","Raccoon Figurine"],["flamingo","Flamingo Figurine"],["chameleon","Chameleon Figurine"]],
    ["Vintage Miniatures",["jukebox","Mini Jukebox"],["sewing-machine","Mini Sewing Machine"],["gramophone","Mini Gramophone"],["vintage-tv","Mini Television"]],
    ["Artful Keepsakes",["carousel-horse","Carousel Horse"],["koi","Koi Sculpture"],["lotus-bowl","Lotus Trinket Bowl"],["chess-knight","Chess Knight"],["ornate-key","Ornate Key Keepsake"]],
    ["Little Delights",["coffee-grinder","Mini Coffee Grinder"],["ramen-bowl","Ramen Bowl Keepsake"],["sushi-plate","Sushi Plate Keepsake"],["windmill","Dutch Windmill"]],
  );
  const items = rows.flatMap(([category, ...entries], row) => entries.map(([id, name], column) => ({ id, name, category: id === 'tanjiro' ? 'Anime' : category, row, column })));
  // Individual artwork bounds avoid neighboring sprites leaking into uneven atlas cells.
  // These are viewport crops only; the original transparent PNG is unmodified.
  const bounds = [
    [27,16,160,190],[223,38,165,163],[435,30,165,167],[651,32,181,174],[867,29,183,176],[1093,14,117,188],
    [28,215,159,199],[254,218,107,195],[408,232,219,183],[631,240,212,173],[896,214,114,201],[1078,215,155,199],
    [15,420,186,197],[205,420,213,199],[449,429,146,191],[623,446,231,173],[854,417,209,203],[1092,428,146,185],
    [16,625,186,209],[207,655,195,164],[432,668,193,152],[666,627,141,199],[851,658,194,160],[1085,627,148,197],
    [17,836,179,188],[224,833,192,197],[458,837,138,194],[660,832,153,198],[874,834,159,197],[1073,834,166,197],
    [16,1025,181,211],[242,1033,147,203],[415,1032,226,206],[654,1028,176,205],[896,1041,115,194],[1075,1062,164,170]
  ];
  // Preserve saved shelves when a collectible is replaced.
  const replacements = { medal:'tanjiro', 'electric-guitar':'ceramic-fox', 'drum-kit':'succulent', violin:'hourglass', 'grand-piano':'mantel-clock' };
  const ids = new Set(['none', ...Object.keys(replacements), ...items.map(item => item.id)]);
  const valid = value => !!value && typeof value.enabled === 'boolean' && Array.isArray(value.slots) && value.slots.length === 3 && value.slots.every(id => ids.has(id)) && (value.theme === undefined || themeIds.has(value.theme));
  const clean = value => valid(value) ? { enabled: value.enabled, slots: value.slots.map(id => replacements[id] || id), theme:value.theme || 'crimson' } : { enabled: true, slots: ['horse', 'crystal', 'planet'], theme:'crimson' };
  const name = id => items.find(item => item.id === id)?.name || 'Empty spot';
  const standalone = {
    'highland-cow': {source:'assets/shelf-highland-cow.png',width:1254,height:1254,bounds:[152,32,986,1189]},
    itachi: {source:'assets/shelf-itachi-bust.png',width:977,height:1609,bounds:[30,68,920,1489]},
    sasuke: {source:'assets/shelf-sasuke-bust.png',width:1145,height:1374,bounds:[176,11,782,1333]},
    madara: {source:'assets/shelf-madara-bust.png',width:1254,height:1254,bounds:[193,5,951,1243]},
    kakashi: {source:'assets/shelf-kakashi-bust.png',width:1054,height:1492,bounds:[88,10,844,1467]},
    sakura: {source:'assets/shelf-sakura-bust.png',width:1254,height:1254,bounds:[270,8,729,1235]},
    muzan: {source:'assets/shelf-muzan-bust.png',width:1254,height:1254,bounds:[115,25,1067,1206]},
    rengoku: {source:'assets/shelf-rengoku-bust.png',width:1254,height:1254,bounds:[78,16,1130,1227]},
    mitsuri: {source:'assets/shelf-mitsuri-bust.png',width:1188,height:1324,bounds:[12,8,1159,1300]},
    muichiro: {source:'assets/shelf-muichiro-bust.png',width:1254,height:1254,bounds:[72,30,1110,1197]},
    gojo: {source:'assets/shelf-gojo.png',width:1254,height:1254,bounds:[244,31,748,1189]},
    peppa: {source:'assets/shelf-peppa.png',width:1254,height:1254,bounds:[257,22,729,1207]},
    anya: {source:'assets/shelf-anya.png',width:1254,height:1254,bounds:[279,4,677,1228]},
    frieren: {source:'assets/shelf-frieren.png',width:1254,height:1254,bounds:[295,6,682,1237]},
    bluey: {source:'assets/shelf-bluey.png',width:1254,height:1254,bounds:[280,6,781,1242]},
    sonic: {source:'assets/shelf-sonic.png',width:1254,height:1254,bounds:[299,29,763,1193]},
    'hello-kitty': {source:'assets/shelf-hello-kitty.png',width:1254,height:1254,bounds:[255,52,799,1159]},
    'harvest-gnome': {"source":"assets/shelf-harvest-gnome.png","width":1254,"height":1254,"bounds":[292,18,683,1219]},
    'scarecrow': {"source":"assets/shelf-scarecrow.png","width":1254,"height":1254,"bounds":[226,0,867,1254]},
    'acorn-house': {"source":"assets/shelf-acorn-house.png","width":1254,"height":1254,"bounds":[180,25,922,1192]},
    'apple-basket': {"source":"assets/shelf-apple-basket.png","width":1254,"height":1254,"bounds":[129,48,1060,1158]},
    'pumpkin-pie': {"source":"assets/shelf-pumpkin-pie.png","width":1254,"height":1254,"bounds":[116,207,1023,873]},
    'friendly-ghost': {"source":"assets/shelf-friendly-ghost.png","width":1254,"height":1254,"bounds":[220,70,839,1119]},
    'witch-cat': {"source":"assets/shelf-witch-cat.png","width":1254,"height":1254,"bounds":[285,20,731,1209]},
    'candy-cauldron': {"source":"assets/shelf-candy-cauldron.png","width":1254,"height":1254,"bounds":[152,55,938,1143]},
    'haunted-cottage': {"source":"assets/shelf-haunted-cottage.png","width":1254,"height":1254,"bounds":[155,15,1014,1199]},
    'bat-figurine': {"source":"assets/shelf-bat-figurine.png","width":1254,"height":1254,"bounds":[254,9,791,1230]},
    'sloth': {"source":"assets/shelf-sloth.png","width":1254,"height":1254,"bounds":[186,12,935,1224]},
    'koala': {"source":"assets/shelf-koala.png","width":1254,"height":1254,"bounds":[106,8,1053,1239]},
    'dachshund': {"source":"assets/shelf-dachshund.png","width":1254,"height":1254,"bounds":[36,68,1191,1122]},
    'raccoon': {"source":"assets/shelf-raccoon.png","width":1254,"height":1254,"bounds":[117,5,1047,1227]},
    'flamingo': {"source":"assets/shelf-flamingo.png","width":1254,"height":1254,"bounds":[367,13,623,1228]},
    'chameleon': {"source":"assets/shelf-chameleon.png","width":1254,"height":1254,"bounds":[201,14,927,1227]},
    'jukebox': {"source":"assets/shelf-jukebox.png","width":1254,"height":1254,"bounds":[203,5,853,1240]},
    'sewing-machine': {"source":"assets/shelf-sewing-machine.png","width":1254,"height":1254,"bounds":[5,15,1248,1216]},
    'gramophone': {"source":"assets/shelf-gramophone.png","width":1254,"height":1254,"bounds":[154,8,995,1239]},
    'vintage-tv': {"source":"assets/shelf-vintage-tv.png","width":1254,"height":1254,"bounds":[61,10,1141,1235]},
    'carousel-horse': {"source":"assets/shelf-carousel-horse.png","width":1254,"height":1254,"bounds":[130,3,999,1241]},
    'koi': {"source":"assets/shelf-koi.png","width":1254,"height":1254,"bounds":[278,10,812,1234]},
    'lotus-bowl': {"source":"assets/shelf-lotus-bowl.png","width":1254,"height":1254,"bounds":[17,152,1221,956]},
    'chess-knight': {"source":"assets/shelf-chess-knight.png","width":1254,"height":1254,"bounds":[293,7,674,1240]},
    'ornate-key': {"source":"assets/shelf-ornate-key.png","width":1254,"height":1254,"bounds":[375,7,501,1242]},
    'coffee-grinder': {"source":"assets/shelf-coffee-grinder.png","width":1254,"height":1254,"bounds":[54,7,1171,1247]},
    'ramen-bowl': {"source":"assets/shelf-ramen-bowl.png","width":1254,"height":1254,"bounds":[34,150,1209,987]},
    'sushi-plate': {"source":"assets/shelf-sushi-plate.png","width":1254,"height":1254,"bounds":[4,262,1247,777]},
    'windmill': {"source":"assets/shelf-windmill.png","width":1254,"height":1254,"bounds":[162,11,927,1232]},
    'capybara': {"source":"assets/shelf-capybara.png","width":1254,"height":1254,"bounds":[271,83,708,1095]},
    'otter': {"source":"assets/shelf-otter.png","width":1254,"height":1254,"bounds":[334,64,632,1130]},
    'frog-prince': {"source":"assets/shelf-frog-prince.png","width":1254,"height":1254,"bounds":[206,49,847,1157]},
    'sleeping-cat': {"source":"assets/shelf-sleeping-cat.png","width":1254,"height":1254,"bounds":[54,197,1167,891]},
    'hummingbird': {"source":"assets/shelf-hummingbird.png","width":1254,"height":1254,"bounds":[333,58,740,1142]},
    'gumball-machine': {"source":"assets/shelf-gumball-machine.png","width":1254,"height":1254,"bounds":[309,19,633,1202]},
    'retro-radio': {"source":"assets/shelf-retro-radio.png","width":1254,"height":1254,"bounds":[37,176,1187,924]},
    'typewriter': {"source":"assets/shelf-typewriter.png","width":1254,"height":1254,"bounds":[61,81,1158,1114]},
    'lava-lamp': {"source":"assets/shelf-lava-lamp.png","width":1254,"height":1254,"bounds":[432,46,386,1163]},
    'rotary-phone': {"source":"assets/shelf-rotary-phone.png","width":1254,"height":1254,"bounds":[38,130,1194,999]},
    'seahorse': {"source":"assets/shelf-seahorse.png","width":1254,"height":1254,"bounds":[410,45,475,1165]},
    'kraken': {"source":"assets/shelf-kraken.png","width":1254,"height":1254,"bounds":[148,129,968,997]},
    'unicorn': {"source":"assets/shelf-unicorn.png","width":1254,"height":1254,"bounds":[251,32,755,1149]},
    'wizard-hat': {"source":"assets/shelf-wizard-hat.png","width":1254,"height":1254,"bounds":[213,60,832,1102]},
    'dragon-egg': {"source":"assets/shelf-dragon-egg.png","width":1254,"height":1254,"bounds":[280,62,707,1122]},
    'macaron-tower': {"source":"assets/shelf-macaron-tower.png","width":1254,"height":1254,"bounds":[205,66,845,1129]},
    'honey-pot': {"source":"assets/shelf-honey-pot.png","width":1254,"height":1254,"bounds":[124,109,1064,1060]},
    'rubiks-cube': {"source":"assets/shelf-rubiks-cube.png","width":1254,"height":1254,"bounds":[92,77,1070,1111]},
    'nesting-doll': {"source":"assets/shelf-nesting-doll.png","width":1254,"height":1254,"bounds":[288,43,698,1167]},
    'paperweight': {"source":"assets/shelf-paperweight.png","width":1254,"height":1254,"bounds":[153,132,948,983]},
    'sailor-moon': {source:'assets/shelf-sailor-moon.png',width:1254,height:1254,bounds:[237,10,785,1236]},
    rumi: {source:'assets/shelf-rumi-bust.png',width:1024,height:1536,bounds:[218,25,594,1462]},
    'nezuko': {"source":"assets/shelf-nezuko.png","width":1254,"height":1254,"bounds":[137,36,982,1189]},
    'red-panda': {"source":"assets/shelf-red-panda.png","width":1254,"height":1254,"bounds":[217,68,818,1092]},
    'penguin': {"source":"assets/shelf-penguin.png","width":1254,"height":1254,"bounds":[258,89,741,1083]},
    'axolotl': {"source":"assets/shelf-axolotl.png","width":1254,"height":1254,"bounds":[135,122,993,1020]},
    'hedgehog': {"source":"assets/shelf-hedgehog.png","width":1254,"height":1254,"bounds":[186,143,883,977]},
    'lucky-cat': {"source":"assets/shelf-lucky-cat.png","width":1254,"height":1254,"bounds":[280,95,800,1059]},
    'terrarium': {"source":"assets/shelf-terrarium.png","width":1254,"height":1254,"bounds":[265,110,724,1031]},
    'mushroom-house': {"source":"assets/shelf-mushroom-house.png","width":1254,"height":1254,"bounds":[203,94,852,1061]},
    'lantern': {"source":"assets/shelf-lantern.png","width":1254,"height":1254,"bounds":[330,53,603,1102]},
    'music-box': {"source":"assets/shelf-music-box.png","width":1254,"height":1254,"bounds":[265,75,757,1090]},
    'teacup': {"source":"assets/shelf-teacup.png","width":1254,"height":1254,"bounds":[78,283,1098,769]},
    'rubber-duck': {"source":"assets/shelf-rubber-duck.png","width":1254,"height":1254,"bounds":[245,190,763,895]},
    'origami-crane': {"source":"assets/shelf-origami-crane.png","width":1254,"height":1254,"bounds":[199,123,958,1016]},
    'ammonite': {"source":"assets/shelf-ammonite.png","width":1254,"height":1254,"bounds":[241,98,791,1075]},
    'geode': {"source":"assets/shelf-geode.png","width":1254,"height":1254,"bounds":[306,123,687,1023]},
    'message-bottle': {"source":"assets/shelf-message-bottle.png","width":1254,"height":1254,"bounds":[378,73,508,1109]},
    'jewelry-box': {"source":"assets/shelf-jewelry-box.png","width":1254,"height":1254,"bounds":[149,193,963,891]},
    'snowman': {"source":"assets/shelf-snowman.png","width":1254,"height":1254,"bounds":[266,85,696,1085]},
    'pumpkin-lantern': {"source":"assets/shelf-pumpkin-lantern.png","width":1254,"height":1254,"bounds":[192,120,876,991]},
    'sandcastle': {"source":"assets/shelf-sandcastle.png","width":1254,"height":1254,"bounds":[141,86,977,1065]},
    'luffy': {"source":"assets/shelf-luffy.png","width":1254,"height":1254,"bounds":[234,55,771,1155]},
    'daisy-vase': {"source":"assets/shelf-daisy-vase.png","width":1254,"height":1254,"bounds":[266,146,743,990]},
    'ceramic-fox': { source:'assets/shelf-ceramic-fox.png', width:1254, height:1254, bounds:[301,74,690,1093] },
    succulent: { source:'assets/shelf-succulent.png', width:1254, height:1254, bounds:[249,108,765,1044] },
    hourglass: { source:'assets/shelf-hourglass.png', width:1254, height:1254, bounds:[343,75,574,1086] },
    'mantel-clock': { source:'assets/shelf-mantel-clock.png', width:1254, height:1254, bounds:[64,156,1146,943] },
    tanjiro: { source:'assets/shelf-tanjiro-bust.png', width:1254, height:1254, bounds:[228,22,835,1215] },
    'all-might': { source:'assets/shelf-all-might.png', width:1537, height:1023, bounds:[414,13,712,999] },
    naruto: { source:'assets/shelf-naruto.png', width:1120, height:1405, bounds:[44,7,1066,1376] }
  };
  // Individually framed viewports retain transparent gutters between the new sprites.
  const expansion = {
    goku:[40,8,227,306], pikachu:[368,28,238,284], eevee:[667,13,229,303],
    'crystal-dragon':[977,6,243,309], 'moon-astronaut':[40,319,241,306],
    'race-car':[298,412,317,183], 'ship-bottle':[629,378,352,237],
    'knight-helmet':[1004,314,237,318], streetcar:[20,680,304,240],
    saxophone:[386,602,169,326], pinball:[653,622,234,310],
    'snow-globe':[972,634,251,297], 'owl-books':[25,924,264,320]
  };
  const discovery = {
    trumpet:[506,54,285,277],
    microscope:[29,338,189,310], telescope:[249,341,242,307], dna:[536,340,167,309],
    atom:[752,341,245,309], 'earth-globe':[1016,340,222,310],
    'hot-air-balloon':[16,653,211,304], compass:[252,651,225,291],
    lighthouse:[505,651,209,306], biplane:[718,696,296,241], 'steam-train':[1014,681,240,257],
    'treasure-chest':[8,961,245,279], phoenix:[268,938,236,303], potion:[523,955,190,288],
    beignets:[718,988,299,252], cupcake:[1026,943,213,299]
  };
  function sprite(id) {
    const item = items.find(item => item.id === id);
    if (!item) return '<span class="shelf-empty" aria-label="Empty spot"></span>';
    const asset = standalone[item.id] || (expansion[item.id] ? { source:'assets/shelf-collectibles-expansion.png', width:1254, height:1254, bounds:expansion[item.id] } : null) || (discovery[item.id] ? { source:'assets/shelf-collectibles-discovery.png', width:1254, height:1254, bounds:discovery[item.id] } : null);
    const [x,y,w,h] = asset ? asset.bounds : bounds[item.row * 6 + item.column];
    const source = asset?.source || 'assets/shelf-collectibles.png';
    const anime = item.category === 'Anime';
    // Every collectible shares the statue sizing and bottom baseline. Wide pieces
    // retain their proportions and stay inside the space between neighboring slots.
    const scale = Math.min(330 / Math.max(w,h), 240 / w);
    const height = 350;
    return `<svg class="shelf-object${anime ? ' shelf-object-anime' : ''}" style="aspect-ratio:220 / ${height}" role="img" aria-label="${item.name}" viewBox="0 0 220 ${height}"><svg x="${(220-w*scale)/2}" y="${height-4-h*scale}" width="${w*scale}" height="${h*scale}" viewBox="${x} ${y} ${w} ${h}" overflow="hidden"><image href="${source}" width="${asset?.width || 1254}" height="${asset?.height || 1254}"/></svg></svg>`;
  }
  function art(value, interactive = false, active = 0) {
    const state = clean(value);
    return `<div class="collectible-shelf${interactive ? ' shelf-preview' : ''}" data-shelf-theme="${state.theme}"><div class="shelf-objects">${state.slots.map((id, index) => interactive
      ? `<button type="button" data-shelf-slot="${index}" aria-pressed="${index === active}" aria-label="${['Left','Middle','Right'][index]} spot: ${name(id)}">${sprite(id)}<span class="shelf-slot-label">${['Left','Middle','Right'][index]}</span></button>`
      : `<div class="shelf-display-slot">${sprite(id)}</div>`).join('')}</div><div class="shelf-board" aria-hidden="true"></div></div>`;
  }
  function render(session) {
    if (!session?.authenticated) return '';
    if (!clean(session.homeShelf).enabled) return '<div class="shelf-restore"><button type="button" class="outline-btn" data-action="showCollectibleShelf">Show shelf</button><span id="shelfShowStatus" role="status"></span></div>';
    return `<section class="home-collectible-shelf" aria-label="Your collectible shelf">${art(session.homeShelf)}<button class="shelf-customize" type="button" popovertarget="shelfSettingsMenu" aria-label="Shelf settings" title="Shelf settings" aria-expanded="false" aria-controls="shelfSettingsMenu"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 3-.6 2.4-2 .9-2.2-.7-2 3.4 1.7 1.7v2.6L2.2 15l2 3.4 2.2-.7 2 .9L9 21h4l.6-2.4 2-.9 2.2.7 2-3.4-1.7-1.7v-2.6L19.8 9l-2-3.4-2.2.7-2-.9L13 3Z"/><circle cx="11" cy="12" r="3"/></svg></button><div id="shelfSettingsMenu" class="shelf-settings-menu" popover="auto" aria-label="Shelf settings"><button type="button" data-action="collectibleShelf">Customize shelf</button><button type="button" data-action="hideCollectibleShelf">Hide shelf</button><span id="shelfHideStatus" role="status"></span></div></section>`;
  }
  let hideTimer;
  function restoreGear(keyboard) {
    const gear = document.querySelector('.shelf-customize');
    if (!gear) { document.querySelector('.header-account-summary')?.focus(); return; }
    gear.focus({ preventScroll:true });
    clearTimeout(hideTimer);
    if (keyboard) return;
    gear.classList.add('is-recent');
    hideTimer = setTimeout(() => {
      if (!gear.isConnected || document.querySelector('.shelf-dialog') || gear.getAttribute('aria-expanded') === 'true') return;
      gear.classList.remove('is-recent'); gear.classList.add('is-idle');
      if (document.activeElement === gear) gear.blur();
    },900);
  }
  function open({ selected, save, onSave }) {
    if (document.querySelector('.shelf-dialog')) return;
    document.querySelector('#shelfSettingsMenu:popover-open')?.hidePopover();
    let draft=clean(selected), active=0, saving=false, tab='objects';
    const pages={objects:0,styles:0}, searches={objects:'',styles:''};
    const opener=document.activeElement, keyboard=!!opener?.matches(':focus-visible');
    const dialog=document.createElement('dialog');
    dialog.className='launch-scene-dialog shelf-dialog';
    dialog.setAttribute('aria-labelledby','shelfTitle');
    dialog.innerHTML='<div class="launch-scene-dialog-heading"><h2 id="shelfTitle">Your collectible shelf</h2><button type="button" class="outline-btn" data-shelf-close aria-label="Close shelf chooser">✕</button></div><div class="shelf-preview-area"><div id="shelfPreview"></div><div class="shelf-preview-controls"><p>Choose a spot, then pick an object.</p><button type="button" class="outline-btn" id="shelfClearSlot">Clear selected spot</button><label class="shelf-show"><input id="shelfEnabled" type="checkbox"> Show shelf</label></div></div><div class="shelf-tabs" role="tablist" aria-label="Customize shelf"><button type="button" id="shelfObjectsTab" role="tab" data-shelf-tab="objects" aria-controls="shelfObjectsPanel">Objects</button><button type="button" id="shelfStylesTab" role="tab" data-shelf-tab="styles" aria-controls="shelfStylesPanel">Shelf Styles</button></div><div class="shelf-filters"><label><span id="shelfSearchLabel">Search objects</span><input id="shelfSearch" type="search" autocomplete="off"></label><label id="shelfCategoryLabel">Category<select id="shelfCategory"><option value="">All categories</option>'+[...new Set(rows.map(([category])=>category))].sort().map(category=>'<option>'+category+'</option>').join('')+'</select></label></div><p id="shelfResults" role="status"></p><div class="shelf-browse-area"><section id="shelfObjectsPanel" role="tabpanel" aria-labelledby="shelfObjectsTab"><div id="shelfChoices" class="shelf-choice-grid"></div></section><section id="shelfStylesPanel" role="tabpanel" aria-labelledby="shelfStylesTab" hidden><div class="shelf-theme-grid"></div></section></div><nav class="shelf-pagination" aria-label="Choice pages"><button type="button" class="outline-btn" id="shelfPrevious">Previous</button><span id="shelfPageStatus" role="status"></span><button type="button" class="outline-btn" id="shelfNext">Next</button></nav><div class="shelf-dialog-actions"><span id="shelfSaveStatus" role="status"></span><button type="button" class="outline-btn" data-shelf-close>Cancel</button><button type="button" class="primary-btn" id="saveShelf">Save shelf</button></div>';
    document.body.append(dialog);
    const preview=dialog.querySelector('#shelfPreview'), choices=dialog.querySelector('#shelfChoices'), themeChoices=dialog.querySelector('.shelf-theme-grid'), search=dialog.querySelector('#shelfSearch'), category=dialog.querySelector('#shelfCategory');
    dialog.querySelector('#shelfEnabled').checked=draft.enabled;
    const browse=dialog.querySelector('.shelf-browse-area');
    // Measure the space left after real fonts, controls, zoom and preview layout.
    const pageSize=()=>{
      const style=getComputedStyle(browse);
      const cardHeight=parseFloat(style.getPropertyValue('--shelf-card-height')) || 154;
      const columns=Math.max(1,Math.min(tab==='styles'?3:4,Math.floor((browse.clientWidth-8+8)/(tab==='styles'?178:120))));
      const rowCount=Math.max(1,Math.min(3,Math.floor((browse.clientHeight-8+8)/(cardHeight+8))));
      browse.style.setProperty('--shelf-columns',columns);
      return columns*rowCount;
    };
    const update=()=>{
      preview.innerHTML=art(draft,true,active);
      dialog.querySelectorAll('[data-shelf-tab]').forEach(button=>{
        const selected=button.dataset.shelfTab===tab;
        button.setAttribute('aria-selected',String(selected)); button.tabIndex=selected?0:-1;
      });
      dialog.querySelector('#shelfObjectsPanel').hidden=tab!=='objects';
      dialog.querySelector('#shelfStylesPanel').hidden=tab!=='styles';
      dialog.querySelector('#shelfCategoryLabel').hidden=tab!=='objects';
      dialog.querySelector('#shelfSearchLabel').textContent=tab==='objects'?'Search objects':'Search shelves';
      search.placeholder=tab==='objects'?'Search '+items.length+' collectibles…':'Search shelf styles…';
      const terms=searches[tab].toLowerCase().trim().split(/\s+/).filter(Boolean);
      const pool=tab==='objects'?items.filter(item=>!category.value || item.category===category.value).sort((a,b)=>a.name.localeCompare(b.name)):themes;
      const matches=pool.filter(item=>terms.every(term=>(item.name+' '+(item.category||'')).toLowerCase().includes(term)));
      const size=pageSize(), count=Math.max(1,Math.ceil(matches.length/size));
      pages[tab]=Math.min(pages[tab],count-1);
      const visible=matches.slice(pages[tab]*size,(pages[tab]+1)*size);
      choices.innerHTML=tab==='objects'?visible.map(item=>'<button type="button" data-shelf-item="'+item.id+'" aria-pressed="'+(draft.slots[active]===item.id)+'">'+sprite(item.id)+'<strong>'+item.name+'</strong></button>').join(''):'';
      themeChoices.innerHTML=tab==='styles'?visible.map(theme=>'<button type="button" data-shelf-theme-choice="'+theme.id+'" aria-pressed="'+(draft.theme===theme.id)+'"><span class="collectible-shelf" data-shelf-theme="'+theme.id+'" aria-hidden="true"><span class="shelf-board"></span></span><strong>'+theme.name+'</strong></button>').join(''):'';
      dialog.querySelector('#shelfResults').textContent=matches.length?matches.length+' '+(tab==='objects'?'objects · '+['Left','Middle','Right'][active]+' spot':'shelf styles'):'No matches. Try another search or category.';
      dialog.querySelector('#shelfPageStatus').textContent='Page '+(pages[tab]+1)+' of '+count;
      dialog.querySelector('#shelfPrevious').disabled=saving || pages[tab]===0;
      dialog.querySelector('#shelfNext').disabled=saving || pages[tab]===count-1;
      dialog.querySelector('#shelfClearSlot').disabled=saving || draft.slots[active]==='none';
      dialog.querySelector('.shelf-browse-area').scrollTop=0;
    };
    const switchTab=value=>{if(saving)return;tab=value;search.value=searches[tab];update();};
    dialog.querySelector('.shelf-tabs').addEventListener('click',event=>{
      const button=event.target.closest('[data-shelf-tab]');if(button)switchTab(button.dataset.shelfTab);
    });
    dialog.querySelector('.shelf-tabs').addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();switchTab(event.key==='Home'?'objects':event.key==='End'?'styles':tab==='objects'?'styles':'objects');
      dialog.querySelector('[aria-selected="true"]').focus();
    });
    preview.addEventListener('click',event=>{
      const button=event.target.closest('[data-shelf-slot]');if(!button || saving)return;
      active=Number(button.dataset.shelfSlot);update();preview.querySelector('[data-shelf-slot="'+active+'"]').focus();
    });
    choices.addEventListener('click',event=>{
      const button=event.target.closest('[data-shelf-item]');if(!button || saving)return;
      const id=button.dataset.shelfItem;draft.slots[active]=id;update();choices.querySelector('[data-shelf-item="'+id+'"]')?.focus();
    });
    themeChoices.addEventListener('click',event=>{
      const button=event.target.closest('[data-shelf-theme-choice]');if(!button || saving)return;
      draft.theme=button.dataset.shelfThemeChoice;update();themeChoices.querySelector('[data-shelf-theme-choice="'+draft.theme+'"]')?.focus();
    });
    search.addEventListener('input',()=>{searches[tab]=search.value;pages[tab]=0;update();});
    category.addEventListener('change',()=>{pages.objects=0;update();});
    for(const [id,delta] of [['shelfPrevious',-1],['shelfNext',1]])dialog.querySelector('#'+id).addEventListener('click',()=>{if(saving)return;pages[tab]+=delta;update();});
    dialog.querySelector('#shelfClearSlot').addEventListener('click',()=>{if(saving)return;draft.slots[active]='none';update();preview.querySelector('[data-shelf-slot="'+active+'"]').focus();});
    dialog.querySelector('#shelfEnabled').addEventListener('change',event=>{draft.enabled=event.target.checked;});
    const resize=()=>{if(!saving)update();};
    window.addEventListener('resize',resize);
    let resizeFrame;
    const observer=new ResizeObserver(()=>{
      cancelAnimationFrame(resizeFrame);
      resizeFrame=requestAnimationFrame(()=>{if(!saving && dialog.isConnected)update();});
    });
    const close=()=>{
      if(saving)return;
      window.removeEventListener('resize',resize);observer.disconnect();cancelAnimationFrame(resizeFrame);dialog.close();dialog.remove();
      if(opener?.closest('#shelfSettingsMenu'))restoreGear(keyboard);
      else if(opener?.isConnected)opener.focus();
      else document.querySelector('.header-account-summary')?.focus();
    };
    dialog.querySelectorAll('[data-shelf-close]').forEach(button=>button.addEventListener('click',close));
    dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
    dialog.querySelector('#saveShelf').addEventListener('click',async()=>{
      saving=true;dialog.querySelectorAll('button,input,select').forEach(control=>{control.disabled=true;});
      dialog.querySelector('#shelfSaveStatus').textContent='Saving your shelf…';
      try{const result=await save(clean(draft));saving=false;close();onSave(result);restoreGear(keyboard);}
      catch(error){saving=false;dialog.querySelectorAll('button,input,select').forEach(control=>{control.disabled=false;});update();dialog.querySelector('#shelfSaveStatus').textContent=error.message||'Could not save. Please try again.';}
    });
    dialog.showModal();update();observer.observe(browse);
  }
  const api = { items, themes, valid, clean, render, open, art };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else {
    root.CollectibleShelf = api;
    document.addEventListener('toggle', event => {
      if (event.target.id !== 'shelfSettingsMenu') return;
      const gear = document.querySelector('.shelf-customize');
      if (!gear) return;
      gear.setAttribute('aria-expanded', String(event.newState === 'open'));
      if (event.newState !== 'open') {
        if (!document.querySelector('.shelf-dialog')) restoreGear(gear.matches(':focus-visible'));
        return;
      }
      clearTimeout(hideTimer);
      gear.classList.remove('is-idle');
      const box = gear.getBoundingClientRect(), menu = event.target;
      menu.style.left = `${Math.max(8,Math.min(box.right-menu.offsetWidth,innerWidth-menu.offsetWidth-8))}px`;
      menu.style.top = `${Math.max(8,Math.min(box.bottom+6,innerHeight-menu.offsetHeight-8))}px`;
    },true);
    for (const event of ['pointermove','pointerdown','focusin']) document.addEventListener(event, e => {
      e.target.closest?.('.home-collectible-shelf')?.querySelector('.shelf-customize')?.classList.remove('is-idle');
    });
    document.addEventListener('pointerout', event => {
      const shelf = event.target.closest?.('.home-collectible-shelf');
      if (!shelf || shelf.contains(event.relatedTarget)) return;
      const gear = shelf.querySelector('.shelf-customize');
      if (!gear || gear.getAttribute('aria-expanded') === 'true' || gear.matches(':focus-visible')) return;
      clearTimeout(hideTimer);
      gear.classList.remove('is-recent');
      gear.classList.add('is-idle');
      if (document.activeElement === gear) gear.blur();
    });
  }
})(typeof window !== 'undefined' ? window : globalThis);
