(function (root) {
  'use strict';
  const themes = [
    {id:'chicken-nuggets',name:'Chicken Nuggets'},
    {id:'disney-castle',name:'Disney Storybook Castle'},
    {id:'stars-stripes',name:'Stars & Stripes'},
    {id:'angel-wings',name:'Angel Wings'},
    {id:'wild-west',name:'Wild West'},
    {id:'egyptian-gold',name:'Egyptian Gold'},
    {id:'jungle-ruins',name:'Jungle Ruins'},
    {id:'tropical-paradise',name:'Tropical Paradise'},
    {id:'ice-cream-parlor',name:'Ice Cream Parlor'},
    {id:'music-hall',name:'Music Hall'},
    {id:'comic-hero',name:'Comic Hero'},
    {id:'strawberry-garden',name:'Strawberry Garden'},
    {id:'crimson',name:'Crimson Original'},
    {id:'christian',name:'Christian Grace'},
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
    ['Display Pieces', ['crystal-dragon','Crystal Dragon'], ['moon-astronaut','Moon Astronaut'], ['ship-bottle','Ship in a Bottle'], ['knight-helmet','Knight Helmet'], ['streetcar','New Orleans Streetcar'], ['saxophone','Jazz Saxophone'], ['pinball','Pinball Machine'], ['snow-globe','Mountain Snow Globe'], ['owl-books','Spellbook Owl']],
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
    ['Disney', ['enchanted-rose','Enchanted Rose']],
    ['Christian Faith', ["open-bible","Open Bible"], ["praying-hands","Praying Hands"], ["peace-dove","Dove of Peace"], ["holy-family","Holy Family Nativity"], ["good-shepherd","Jesus Good Shepherd"]],
    ['Squishy Toys', ['squishy-pink','Pink Squishy Dumpling'], ['squishy-blue','Blue Squishy Dumpling'], ['squishy-gold','Gold Squishy Dumpling']],
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
  rows.push(['New Orleans', ['nola-snowball','New Orleans Snowball'], ['nola-king-cake','Mardi Gras King Cake'], ['nola-second-line','Second-Line Umbrella'], ['nola-pelican','Louisiana Pelican']]);
  rows.push(['Character Collectibles', ['bingo','Bingo Statue'], ['chilli','Chilli (Bluey Mom) Statue'], ['bandit','Bandit (Bluey Dad) Statue']]);
  rows.push(['Character Collectibles', ['labubu-cream','Cream Labubu'], ['labubu-pink','Pink Labubu'], ['labubu-sage','Sage Green Labubu']]);
  rows.push(['USA Patriotic', ['usa-eagle','Bald Eagle Statue'], ['usa-liberty','Statue of Liberty'], ['usa-bell','Liberty Bell'], ['usa-top-hat','Stars & Stripes Top Hat']]);
  rows.push(['Christian Faith', ['archangel-michael','Archangel Michael Statue'], ['archangel-gabriel','Archangel Gabriel Statue']]);
  rows.push(['USA Patriotic', ['uncle-sam','Uncle Sam Statue']]);
  rows.push(['Anime', ['sukuna','Ryomen Sukuna Bust'], ['midoriya','Izuku Midoriya (Deku) Bust']]);
  rows.push(['Anime', ['asta','Asta Bust'], ['zoro','Roronoa Zoro Bust'], ['sung-jin-woo','Sung Jin-woo Bust']]);
  rows.push(['Display Pieces', ['six-seven','67 Hands Statue']]);
  rows.push(['Disney', ['disney-snow-white-bust','Snow White Bust'], ['disney-ariel-bust','Ariel Bust'], ['disney-tiana-bust','Tiana Bust'], ['disney-cinderella-bust','Cinderella Bust'], ['disney-rapunzel-bust','Rapunzel Bust'], ['disney-belle-bust','Belle Bust'], ['disney-anna-bust','Anna Bust'], ['disney-jasmine-bust','Jasmine Bust'], ['disney-mulan-bust','Mulan Bust'], ['disney-aurora-bust','Aurora Bust']]);
  rows.push(['Pokémon', ['pokemon-mew-statue','Mew Statue'], ['pokemon-mimikyu-statue','Mimikyu Statue'], ['pokemon-umbreon-statue','Umbreon Statue'], ['pokemon-snorlax-statue','Snorlax Statue'], ['pokemon-lucario-statue','Lucario Statue'], ['pokemon-gardevoir-statue','Gardevoir Statue'], ['pokemon-dragonite-statue','Dragonite Statue'], ['pokemon-rayquaza-statue','Rayquaza Statue'], ['pokemon-mewtwo-statue','Mewtwo Statue'], ['pokemon-garchomp-statue','Garchomp Statue'], ['pokemon-arcanine-statue','Arcanine Statue'], ['pokemon-squirtle-statue','Squirtle Statue'], ['pokemon-gengar-statue','Gengar Statue'], ['pokemon-bulbasaur-statue','Bulbasaur Statue'], ['pokemon-charizard-statue','Charizard Statue'], ['pokemon-charmander-statue','Charmander Statue'], ['pokemon-gyarados-statue','Gyarados Statue']]);

  rows.push(['JDM Model Cars', ['jdm-purple-green-supra','Purple & Green Supra'], ['jdm-anime-supra','Purple Anime Supra'], ['jdm-red-skyline','Red LBWK Skyline'], ['jdm-blue-skyline','Blue Skyline GT-R'], ['jdm-black-red-nsx','Black & Red NSX'], ['jdm-neon-gtr','Neon Anime GT-R']]);
  rows.push(['Animal Friends', ['highland-pumpkin','Highland Cow Pumpkin Glow'], ['highland-sunflower-bow','Highland Cow Sunflower Bow'], ['highland-sunflower-bouquet','Highland Cow Sunflower Bouquet'], ['highland-lavender-basket','Highland Cow Lavender Basket'], ['highland-lavender-bow','Highland Cow Lavender Bow']]);
  rows.push(['Disney', ['disney-elsa-bust','Elsa Bust'], ['disney-maleficent-bust','Maleficent Bust'], ['disney-evil-queen-bust','Evil Queen Bust'], ['disney-ursula-bust','Ursula Bust'], ['disney-jafar-bust','Jafar Bust'], ['disney-hans-bust','Hans Bust'], ['disney-gaston-bust','Gaston Bust'], ['disney-aladdin-bust','Aladdin Bust'], ['disney-beast-bust','Beast Bust'], ['disney-hercules-bust','Hercules Bust'], ['disney-kristoff-bust','Kristoff Bust']]);
  rows.push(['Disney', ['disney-prince-eric-bust','Prince Eric Bust'], ['disney-pocahontas-bust','Pocahontas Bust'], ['disney-genie-bust','Genie Bust']]);
  rows.push(['Superheroes', ['superhero-winter-soldier-bust','Winter Soldier Bust'], ['superhero-iron-man-bust','Iron Man Bust'], ['superhero-black-widow-bust','Black Widow Bust'], ['superhero-captain-america-bust','Captain America Bust'], ['superhero-juggernaut-bust','Juggernaut Bust'], ['superhero-sabretooth-bust','Sabretooth Bust'], ['superhero-spider-man-bust','Spider-Man Bust'], ['superhero-wolverine-bust','Wolverine Bust'], ['superhero-loki-bust','Loki Bust'], ['superhero-hulk-bust','Hulk Bust'], ['superhero-thor-bust','Thor Bust']]);
  rows.push(['Music', ['michael-jackson-blue-bust','Michael Jackson Blue Base Bust'], ['michael-jackson-gold-bust','Michael Jackson Gold Base Bust']]);
  rows.push(['Music', ['music-pop-singer-statue','Pop Singer Guitar Statue']]);
  rows.push(['Anime', ['anime-ichigo-statue','Ichigo Statue']]);
  rows.push(['Anime', ['anime-luck-voltia-statue','Luck Voltia Statue'], ['anime-megumi-statue','Megumi Fushiguro Statue']]);
  rows.push(['Pokémon', ["pokemon-meowth-statue","Meowth Statue"], ["pokemon-tyranitar-statue","Tyranitar Statue"], ["pokemon-blastoise-statue","Blastoise Statue"], ["pokemon-vileplume-statue","Vileplume Statue"], ["pokemon-poliwrath-statue","Poliwrath Statue"]]);
  rows.push(['Anime', ["anime-mikasa-statue","Mikasa Ackerman Statue"], ["anime-armored-titan-statue","Armored Titan Statue"], ["anime-attack-titan-statue","Attack Titan Statue"], ["anime-eren-statue","Eren Yeager Statue"], ["anime-colossal-titan-statue","Colossal Titan Statue"]]);
  rows.push(['Anime', ["anime-akaza-statue","Akaza Statue"], ["anime-zenitsu-statue","Zenitsu Agatsuma Statue"], ["anime-shinobu-statue","Shinobu Kocho Statue"], ["anime-tanjiro-statue","Tanjiro Kamado Statue"], ["anime-inosuke-statue","Inosuke Hashibira Statue"], ["anime-giyu-statue","Giyu Tomioka Statue"]]);
  rows.push(['Pokémon', ["pokemon-espeon-statue","Espeon Statue"], ["pokemon-arceus-statue","Arceus Statue"], ["pokemon-machamp-statue","Machamp Statue"], ["pokemon-ninetales-statue","Ninetales Statue"]]);
  rows.push(['Anime', ["anime-kirishima-statue","Eijiro Kirishima Statue"], ["anime-bakugo-statue","Katsuki Bakugo Statue"], ["anime-iida-statue","Tenya Iida Statue"], ["anime-uraraka-statue","Ochaco Uraraka Statue"], ["anime-tsuyu-statue","Tsuyu Asui Statue"], ["anime-todoroki-statue","Shoto Todoroki Statue"], ["anime-kaminari-statue","Denki Kaminari Statue"], ["anime-toga-statue","Himiko Toga Statue"]]);
  rows.push(['Anime', ["anime-pain-statue","Pain Statue"], ["anime-levi-statue","Levi Ackerman Statue"], ["anime-guts-statue","Guts Statue"], ["anime-orochimaru-statue","Orochimaru Statue"], ["anime-light-yagami-statue","Light Yagami Statue"], ["anime-naruto-six-paths-statue","Naruto Six Paths Statue"], ["anime-sasuke-susanoo-statue","Sasuke Susanoo Statue"], ["anime-naruto-kurama-statue","Naruto & Kurama Statue"]]);
  rows.push(['Anime', ["anime-gon-statue","Gon Freecss Statue"], ["anime-hinata-statue","Shoyo Hinata Statue"], ["anime-obanai-statue","Obanai Iguro Statue"], ["anime-tengen-statue","Tengen Uzui Statue"], ["anime-isagi-statue","Yoichi Isagi Statue"], ["anime-gray-statue","Yuno Grinberryall Statue"], ["anime-nobara-statue","Nobara Kugisaki Statue"], ["anime-kirito-statue","Kirito Statue"], ["anime-natsu-statue","Natsu Dragneel Statue"], ["anime-gyomei-statue","Gyomei Himejima Statue"], ["anime-sanemi-statue","Sanemi Shinazugawa Statue"]]);
  rows.push(['Character Collectibles', ['peace-sign-girl','Peace Sign Girl Statue'], ['verity-statue','Verity Statue'], ['toy-story-buzz','Buzz Lightyear Statue'], ['toy-story-rex','Rex Statue'], ['toy-story-woody','Woody Statue']]);
  rows.push(['Squishy Toys', ['nee-doh-stack-statue','Nee Doh Stack Statue']]);
  rows.push(['Disney', ['disney-lilo-stitch-statue','Lilo & Stitch Surfing Statue'], ['disney-moana-statue','Moana Statue']]);
  rows.push(['Superheroes', ['superhero-captain-marvel-statue','Captain Marvel Statue'], ['superhero-black-panther-statue','Black Panther Statue'], ['superhero-batman-statue','Batman Statue'], ['superhero-thanos-statue','Thanos Statue'], ['superhero-wonder-woman-statue','Wonder Woman Statue'], ['superhero-green-lantern-statue','Green Lantern Statue'], ['superhero-flash-statue','The Flash Statue'], ['superhero-superman-statue','Superman Statue'], ['superhero-hawkeye-statue','Hawkeye Statue'], ['superhero-deadpool-statue','Deadpool Statue']]);
  rows.push(['Disney', ['disney-camp-rock-statue','Camp Rock Statue']]);
  rows.push(['Pokémon', ['pokemon-lugia-statue','Lugia Statue'], ['pokemon-ash-statue','Ash Ketchum Statue'], ['pokemon-ho-oh-statue','Ho-Oh Statue'], ['pokemon-jigglypuff-statue','Jigglypuff Statue'], ['pokemon-groudon-statue','Groudon Statue'], ['pokemon-entei-statue','Entei Statue']]);
  rows.push(['Superheroes', ["superhero-harley-quinn-statue","Harley Quinn Statue"], ["superhero-joker-statue","Joker Statue"]]);
  rows.push(['Nintendo', ["luigi-statue","Luigi Statue"], ["mario-statue","Mario Statue"]]);
  rows.push(['Disney', ["merida-statue","Merida Statue"], ["simba-statue","Simba Statue"]]);
  rows.push(['Nintendo', ['nintendo-bowser-statue','Bowser Statue'], ['nintendo-link-statue','Link Statue'], ['nintendo-peach-statue','Princess Peach Statue'], ['nintendo-yoshi-statue','Yoshi Statue'], ['nintendo-zelda-statue','Princess Zelda Statue']]);
  rows.push(['Nintendo', ['nintendo-fox-statue','Fox McCloud Statue'], ['nintendo-samus-statue','Samus Aran Statue']]);
  const items = rows.flatMap(([category, ...entries], row) => entries.map(([id, name], column) => ({ id, name, category: ['pikachu','eevee'].includes(id) ? 'Pokémon' : id === 'tanjiro' ? 'Anime' : ['cross','church'].includes(id) ? 'Christian Faith' : category, row, column })));
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
  const replacements = { 'charizard-flames':'pokemon-charizard-statue', 'bulbasaur-vines':'pokemon-bulbasaur-statue', 'gengar-flames':'pokemon-gengar-statue', 'dragonite-pillow':'pokemon-dragonite-statue', growlithe:'none', 'ash-pikachu':'none', 'mew-console':'pokemon-mew-statue', medal:'tanjiro', 'electric-guitar':'ceramic-fox', 'drum-kit':'succulent', violin:'hourglass', 'grand-piano':'mantel-clock', 'race-car':'none', 'superhero-falcon-bust':'none', 'superhero-hawkeye-bust':'none', elsa:'none', beast:'none', anna:'disney-anna-bust', jasmine:'disney-jasmine-bust', belle:'disney-belle-bust', ariel:'disney-ariel-bust' };
  const ids = new Set(['none', ...Object.keys(replacements), ...items.map(item => item.id)]);
  const valid = value => !!value && typeof value.enabled === 'boolean' && Array.isArray(value.slots) && value.slots.length === 3 && value.slots.every(id => ids.has(id)) && (value.theme === undefined || themeIds.has(value.theme));
  const clean = value => valid(value) ? { enabled: value.enabled, slots: value.slots.map(id => replacements[id] || id), theme:value.theme || 'crimson' } : { enabled: true, slots: ['horse', 'crystal', 'planet'], theme:'crimson' };
  const name = id => items.find(item => item.id === id)?.name || 'Empty spot';
  const standalone = {
    'nintendo-bowser-statue': {source:'assets/shelf-nintendo-bowser-statue.png',width:1584,height:1248,bounds:[40,4,1511,1187],displaySize:370,displayWidth:370,directImage:true},
    'nintendo-fox-statue': {source:'assets/shelf-nintendo-fox-statue.png',width:1040,height:1904,bounds:[60,4,980,1835],displaySize:330,displayWidth:280,directImage:true},
    'nintendo-samus-statue': {source:'assets/shelf-nintendo-samus-statue.png',width:1360,height:1456,bounds:[263,7,834,1397],displaySize:330,displayWidth:280,directImage:true},
    'nintendo-link-statue': {source:'assets/shelf-nintendo-link-statue.png',width:1232,height:1600,bounds:[190,9,835,1553],displaySize:330,displayWidth:280,directImage:true},
    'nintendo-peach-statue': {source:'assets/shelf-nintendo-peach-statue.png',width:1040,height:1888,bounds:[4,4,1029,1869],displaySize:330,displayWidth:280,directImage:true},
    'nintendo-yoshi-statue': {source:'assets/shelf-nintendo-yoshi-statue.png',width:1216,height:1616,bounds:[168,0,987,1598],displaySize:330,displayWidth:280,directImage:true},
    'nintendo-zelda-statue': {source:'assets/shelf-nintendo-zelda-statue.png',width:1056,height:1888,bounds:[45,11,955,1861],displaySize:330,displayWidth:280,directImage:true},
    'superhero-harley-quinn-statue': {"source":"assets/shelf-superhero-harley-quinn-statue.png","width":1728,"height":1152,"bounds":[386,6,981,1111],"displaySize":330,"displayWidth":330,"displayOffsetX":-15,"directImage":true},
    'superhero-joker-statue': {"source":"assets/shelf-superhero-joker-statue.png","width":1264,"height":1568,"bounds":[166,2,978,1534],"displaySize":330,"displayWidth":280,"directImage":true},
    'luigi-statue': {"source":"assets/shelf-luigi-statue.png","width":1232,"height":1600,"bounds":[261,26,731,1518],"displaySize":330,"displayWidth":280,"directImage":true},
    'mario-statue': {"source":"assets/shelf-mario-statue.png","width":960,"height":2064,"bounds":[52,36,870,1956],"displaySize":330,"displayWidth":280,"directImage":true},
    'simba-statue': {"source":"assets/shelf-simba-statue.png","width":1600,"height":1232,"bounds":[324,17,1039,1189],"displaySize":330,"displayWidth":280,"directImage":true},
    'merida-statue': {"source":"assets/shelf-merida-statue.png","width":1152,"height":1712,"bounds":[192,60,880,1580],"displaySize":330,"displayWidth":280,"directImage":true},
    'peace-sign-girl': {source:'assets/shelf-peace-sign-girl.png',width:1122,height:1402,bounds:[134,2,877,1396],displaySize:330,displayWidth:280},
    'verity-statue': {source:'assets/shelf-verity-statue.png',width:1152,height:1728,bounds:[70,21,1046,1672],displaySize:330,displayWidth:280},
    'toy-story-buzz': {source:'assets/shelf-toy-story-buzz.png',width:1600,height:1200,bounds:[271,25,1110,1148],displaySize:330,displayWidth:280},
    'toy-story-rex': {source:'assets/shelf-toy-story-rex.png',width:1344,height:1472,bounds:[224,37,837,1376],displaySize:330,displayWidth:280},
    'toy-story-woody': {source:'assets/shelf-toy-story-woody.png',width:1264,height:1568,bounds:[249,13,780,1537],displaySize:330,displayWidth:280},
    'anime-gon-statue': {"source":"assets/shelf-anime-gon-statue.png","width":896,"height":2208,"bounds":[35,43,824,2049],"displaySize":330,"displayWidth":280},
    'anime-hinata-statue': {"source":"assets/shelf-anime-hinata-statue.png","width":1152,"height":1712,"bounds":[216,22,738,1625],"displaySize":330,"displayWidth":280},
    'anime-obanai-statue': {"source":"assets/shelf-anime-obanai-statue.png","width":1696,"height":1168,"bounds":[545,9,626,1150],"displaySize":330,"displayWidth":280},
    'anime-tengen-statue': {"source":"assets/shelf-anime-tengen-statue.png","width":1552,"height":1280,"bounds":[265,7,1039,1252],"displaySize":330,"displayWidth":280},
    'anime-isagi-statue': {"source":"assets/shelf-anime-isagi-statue.png","width":1200,"height":1648,"bounds":[279,15,724,1572],"displaySize":330,"displayWidth":280},
    'anime-gray-statue': {"source":"assets/shelf-anime-gray-statue.png","width":1152,"height":1728,"bounds":[181,9,816,1660],"displaySize":330,"displayWidth":280},
    'anime-nobara-statue': {"source":"assets/shelf-anime-nobara-statue.png","width":992,"height":1984,"bounds":[38,0,954,1916],"displaySize":330,"displayWidth":280},
    'anime-kirito-statue': {"source":"assets/shelf-anime-kirito-statue.png","width":832,"height":2368,"bounds":[30,216,802,1909],"displaySize":330,"displayWidth":280},
    'anime-natsu-statue': {"source":"assets/shelf-anime-natsu-statue.png","width":1152,"height":1728,"bounds":[208,18,792,1677],"displaySize":330,"displayWidth":280},
    'anime-gyomei-statue': {"source":"assets/shelf-anime-gyomei-statue.png","width":1168,"height":1680,"bounds":[113,14,959,1617],"displaySize":330,"displayWidth":280},
    'anime-sanemi-statue': {"source":"assets/shelf-anime-sanemi-statue.png","width":1072,"height":1856,"bounds":[64,24,976,1792],"displaySize":330,"displayWidth":280},
    'anime-pain-statue': {"source":"assets/shelf-anime-pain-statue.png","width":896,"height":2224,"bounds":[21,35,875,2101],"displaySize":330,"displayWidth":280},
    'anime-levi-statue': {"source":"assets/shelf-anime-levi-statue.png","width":1056,"height":1872,"bounds":[43,61,975,1736],"displaySize":330,"displayWidth":280},
    'anime-guts-statue': {"source":"assets/shelf-anime-guts-statue.png","width":1152,"height":1728,"bounds":[47,65,1105,1595],"displaySize":330,"displayWidth":280},
    'anime-orochimaru-statue': {"source":"assets/shelf-anime-orochimaru-statue.png","width":1264,"height":1568,"bounds":[87,47,1107,1478],"displaySize":330,"displayWidth":280},
    'anime-light-yagami-statue': {"source":"assets/shelf-anime-light-yagami-statue.png","width":1152,"height":1728,"bounds":[126,20,946,1673],"displaySize":330,"displayWidth":280},
    'anime-naruto-six-paths-statue': {"source":"assets/shelf-anime-naruto-six-paths-statue.png","width":1424,"height":1392,"bounds":[43,18,1368,1345],"displaySize":330,"displayWidth":280},
    'anime-sasuke-susanoo-statue': {"source":"assets/shelf-anime-sasuke-susanoo-statue.png","width":1264,"height":1552,"bounds":[70,35,1146,1477],"displaySize":330,"displayWidth":280},
    'anime-naruto-kurama-statue': {"source":"assets/shelf-anime-naruto-kurama-statue.png","width":832,"height":1248,"bounds":[31,11,778,1225],"displaySize":330,"displayWidth":280},
    'anime-kirishima-statue': {"source":"assets/shelf-anime-kirishima-statue.png","width":880,"height":1184,"bounds":[22,0,855,1156],"displaySize":330,"displayWidth":280},
    'anime-bakugo-statue': {"source":"assets/shelf-anime-bakugo-statue.png","width":1504,"height":1312,"bounds":[384,0,792,1276],"displaySize":330,"displayWidth":280},
    'anime-iida-statue': {"source":"assets/shelf-anime-iida-statue.png","width":1408,"height":1408,"bounds":[207,30,1091,1346],"displaySize":330,"displayWidth":280},
    'anime-uraraka-statue': {"source":"assets/shelf-anime-uraraka-statue.png","width":1408,"height":1408,"bounds":[278,22,833,1356],"displaySize":330,"displayWidth":280},
    'anime-tsuyu-statue': {"source":"assets/shelf-anime-tsuyu-statue.png","width":992,"height":1984,"bounds":[16,0,958,1941],"displaySize":330,"displayWidth":280},
    'anime-todoroki-statue': {"source":"assets/shelf-anime-todoroki-statue.png","width":1136,"height":1744,"bounds":[159,6,857,1724],"displaySize":330,"displayWidth":280},
    'anime-kaminari-statue': {"source":"assets/shelf-anime-kaminari-statue.png","width":1152,"height":1728,"bounds":[27,0,1098,1709],"displaySize":330,"displayWidth":280},
    'anime-toga-statue': {"source":"assets/shelf-anime-toga-statue.png","width":880,"height":2240,"bounds":[10,87,869,2048],"displaySize":330,"displayWidth":280},
    'pokemon-meowth-statue': {"source":"assets/shelf-pokemon-meowth-statue.png","width":1408,"height":1408,"bounds":[261,5,895,1387],"displaySize":330,"displayWidth":280},
    'pokemon-tyranitar-statue': {"source":"assets/shelf-pokemon-tyranitar-statue.png","width":1296,"height":1520,"bounds":[135,19,1066,1455],"displaySize":330,"displayWidth":280},
    'pokemon-blastoise-statue': {"source":"assets/shelf-pokemon-blastoise-statue.png","width":1360,"height":1456,"bounds":[127,64,1142,1328],"displaySize":330,"displayWidth":280},
    'pokemon-vileplume-statue': {"source":"assets/shelf-pokemon-vileplume-statue.png","width":1408,"height":1408,"bounds":[100,28,1246,1351],"displaySize":330,"displayWidth":280},
    'pokemon-poliwrath-statue': {"source":"assets/shelf-pokemon-poliwrath-statue.png","width":1408,"height":1408,"bounds":[68,120,1298,1207],"displaySize":330,"displayWidth":280},
    'anime-mikasa-statue': {"source":"assets/shelf-anime-mikasa-statue.png","width":1200,"height":1648,"bounds":[270,15,680,1581],"displaySize":330,"displayWidth":280},
    'anime-armored-titan-statue': {"source":"assets/shelf-anime-armored-titan-statue.png","width":1376,"height":1440,"bounds":[249,0,892,1425],"displaySize":330,"displayWidth":280},
    'anime-attack-titan-statue': {"source":"assets/shelf-anime-attack-titan-statue.png","width":1408,"height":1408,"bounds":[285,28,820,1349],"displaySize":330,"displayWidth":280},
    'anime-eren-statue': {"source":"assets/shelf-anime-eren-statue.png","width":1008,"height":1968,"bounds":[116,44,892,1822],"displaySize":330,"displayWidth":280},
    'anime-colossal-titan-statue': {"source":"assets/shelf-anime-colossal-titan-statue.png","width":1056,"height":1872,"bounds":[20,35,995,1770],"displaySize":330,"displayWidth":280},
    'anime-akaza-statue': {"source":"assets/shelf-anime-akaza-statue.png","width":1312,"height":1504,"bounds":[91,6,1182,1444],"displaySize":330,"displayWidth":280},
    'anime-zenitsu-statue': {"source":"assets/shelf-anime-zenitsu-statue.png","width":1424,"height":1392,"bounds":[189,17,1186,1297],"displaySize":330,"displayWidth":280},
    'anime-shinobu-statue': {"source":"assets/shelf-anime-shinobu-statue.png","width":1168,"height":1680,"bounds":[35,46,1105,1571],"displaySize":330,"displayWidth":280},
    'anime-tanjiro-statue': {"source":"assets/shelf-anime-tanjiro-statue.png","width":1200,"height":1648,"bounds":[163,10,1037,1614],"displaySize":330,"displayWidth":280},
    'anime-inosuke-statue': {"source":"assets/shelf-anime-inosuke-statue.png","width":1168,"height":1680,"bounds":[156,49,889,1600],"displaySize":330,"displayWidth":280},
    'anime-giyu-statue': {"source":"assets/shelf-anime-giyu-statue.png","width":992,"height":2000,"bounds":[17,26,969,1892],"displaySize":330,"displayWidth":280},
    'pokemon-espeon-statue': {"source":"assets/shelf-pokemon-espeon-statue.png","width":1440,"height":1376,"bounds":[197,15,1051,1327],"displaySize":330,"displayWidth":280},
    'pokemon-arceus-statue': {"source":"assets/shelf-pokemon-arceus-statue.png","width":1408,"height":1408,"bounds":[320,18,848,1352],"displaySize":330,"displayWidth":280},
    'pokemon-machamp-statue': {"source":"assets/shelf-pokemon-machamp-statue.png","width":1408,"height":1408,"bounds":[189,1,1020,1380],"displaySize":330,"displayWidth":280},
    'pokemon-ninetales-statue': {"source":"assets/shelf-pokemon-ninetales-statue.png","width":1408,"height":1408,"bounds":[140,25,1196,1344],"displaySize":330,"displayWidth":280},
    'anime-luck-voltia-statue': {"source":"assets/shelf-anime-luck-voltia-statue-v2.png","width":1376,"height":1440,"bounds":[122,0,1201,1411],"displaySize":330,"displayWidth":280},
    'nee-doh-stack-statue': {"source":"assets/shelf-nee-doh-stack-statue.png","width":1408,"height":1408,"bounds":[317,40,817,1288],"displaySize":330,"displayWidth":280},
    'anime-megumi-statue': {"source":"assets/shelf-anime-megumi-statue-v2.png","width":1408,"height":1408,"bounds":[253,1,926,1377],"displaySize":330,"displayWidth":280},
    'anime-ichigo-statue': {"source":"assets/shelf-anime-ichigo-statue.png","width":1104,"height":1776,"bounds":[1,132,1103,1552],"displaySize":330,"displayWidth":280},
    'music-pop-singer-statue': {"source":"assets/shelf-music-pop-singer-statue.png","width":1680,"height":1184,"bounds":[300,10,949,1153],"displaySize":330,"displayWidth":280},
    'disney-lilo-stitch-statue': {"source":"assets/shelf-disney-lilo-stitch-statue.png","width":1504,"height":1312,"bounds":[130,46,1247,1230],"displaySize":330,"displayWidth":280},
    'disney-moana-statue': {"source":"assets/shelf-disney-moana-statue.png","width":992,"height":1984,"bounds":[25,53,967,1831],"displaySize":330,"displayWidth":280},
    'superhero-captain-marvel-statue': {"source":"assets/shelf-superhero-captain-marvel-statue.png","width":1296,"height":1520,"bounds":[19,11,1272,1455],"displaySize":330,"displayWidth":280},
    'superhero-black-panther-statue': {"source":"assets/shelf-superhero-black-panther-statue.png","width":1360,"height":1456,"bounds":[255,17,904,1401],"displaySize":330,"displayWidth":280},
    'superhero-batman-statue': {"source":"assets/shelf-superhero-batman-statue.png","width":1136,"height":1744,"bounds":[51,41,1042,1645],"displaySize":330,"displayWidth":280},
    'superhero-thanos-statue': {"source":"assets/shelf-superhero-thanos-statue.png","width":1200,"height":1600,"bounds":[82,51,1077,1472],"displaySize":330,"displayWidth":280},
    'superhero-wonder-woman-statue': {"source":"assets/shelf-superhero-wonder-woman-statue.png","width":1136,"height":1744,"bounds":[127,56,846,1618],"displaySize":330,"displayWidth":280},
    'superhero-green-lantern-statue': {"source":"assets/shelf-superhero-green-lantern-statue.png","width":1136,"height":1728,"bounds":[46,66,1005,1579],"displaySize":330,"displayWidth":280},
    'disney-camp-rock-statue': {"source":"assets/shelf-disney-camp-rock-statue.png","width":1600,"height":1200,"bounds":[265,5,1076,1178],"displaySize":330,"displayWidth":280},
    'superhero-flash-statue': {"source":"assets/shelf-superhero-flash-statue.png","width":2000,"height":992,"bounds":[510,0,1029,962],"displaySize":330,"displayWidth":280},
    'superhero-superman-statue': {"source":"assets/shelf-superhero-superman-statue.png","width":1792,"height":1008,"bounds":[319,0,1329,983],"displaySize":440,"displayWidth":440,"displayOffsetX":80},
    'superhero-hawkeye-statue': {"source":"assets/shelf-superhero-hawkeye-statue.png","width":1200,"height":1600,"bounds":[53,43,1038,1484],"displaySize":330,"displayWidth":280},
    'superhero-deadpool-statue': {"source":"assets/shelf-superhero-deadpool-statue.png","width":1232,"height":1600,"bounds":[199,82,859,1442],"displaySize":330,"displayWidth":280},
    'pokemon-lugia-statue': {"source":"assets/shelf-pokemon-lugia-statue.png","width":1408,"height":1408,"bounds":[209,17,1015,1360],"displaySize":330,"displayWidth":280},
    'pokemon-ash-statue': {"source":"assets/shelf-pokemon-ash-statue.png","width":1200,"height":1600,"bounds":[130,34,982,1516],"displaySize":330,"displayWidth":280},
    'pokemon-ho-oh-statue': {"source":"assets/shelf-pokemon-ho-oh-statue.png","width":1408,"height":1408,"bounds":[259,0,907,1385],"displaySize":330,"displayWidth":280},
    'pokemon-jigglypuff-statue': {"source":"assets/shelf-pokemon-jigglypuff-statue.png","width":1440,"height":1360,"bounds":[308,22,923,1283],"displaySize":330,"displayWidth":280},
    'pokemon-groudon-statue': {"source":"assets/shelf-pokemon-groudon-statue.png","width":1408,"height":1408,"bounds":[103,109,1241,1223],"displaySize":330,"displayWidth":280},
    'pokemon-entei-statue': {"source":"assets/shelf-pokemon-entei-statue.png","width":1344,"height":1472,"bounds":[67,15,1242,1403],"displaySize":330,"displayWidth":280},
    'michael-jackson-blue-bust': {source:'assets/shelf-michael-jackson-blue-bust.png',width:1152,height:1728,bounds:[203,44,749,1598],displaySize:330,displayWidth:280},
    'michael-jackson-gold-bust': {source:'assets/shelf-michael-jackson-gold-bust.png',width:1152,height:1728,bounds:[35,49,1100,1631],displaySize:330,displayWidth:280},
    'pokemon-mew-statue': {"source":"assets/shelf-pokemon-mew-statue.png","width":1392,"height":1424,"bounds":[202,8,992,1391],"displaySize":330,"displayWidth":280},
    'pokemon-mimikyu-statue': {"source":"assets/shelf-pokemon-mimikyu-statue.png","width":1248,"height":1584,"bounds":[247,1,866,1559],"displaySize":330,"displayWidth":280},
    'pokemon-umbreon-statue': {"source":"assets/shelf-pokemon-umbreon-statue.png","width":1280,"height":1536,"bounds":[101,18,1099,1468],"displaySize":330,"displayWidth":280},
    'pokemon-snorlax-statue': {"source":"assets/shelf-pokemon-snorlax-statue.png","width":1408,"height":1408,"bounds":[207,52,1016,1305],"displaySize":330,"displayWidth":280},
    'pokemon-lucario-statue': {"source":"assets/shelf-pokemon-lucario-statue.png","width":1136,"height":1744,"bounds":[93,24,963,1678],"displaySize":330,"displayWidth":280},
    'pokemon-gardevoir-statue': {"source":"assets/shelf-pokemon-gardevoir-statue.png","width":1104,"height":1792,"bounds":[59,93,1020,1648],"displaySize":330,"displayWidth":280},
    'pokemon-dragonite-statue': {"source":"assets/shelf-pokemon-dragonite-statue.png","width":1232,"height":1600,"bounds":[5,44,1227,1498],"displaySize":330,"displayWidth":280},
    'pokemon-rayquaza-statue': {"source":"assets/shelf-pokemon-rayquaza-statue.png","width":1408,"height":1408,"bounds":[160,19,1090,1362],"displaySize":330,"displayWidth":280},
    'pokemon-mewtwo-statue': {"source":"assets/shelf-pokemon-mewtwo-statue.png","width":1264,"height":1552,"bounds":[111,23,1084,1504],"displaySize":330,"displayWidth":280},
    'pokemon-garchomp-statue': {"source":"assets/shelf-pokemon-garchomp-statue.png","width":1408,"height":1408,"bounds":[101,50,1244,1292],"displaySize":330,"displayWidth":280},
    'pokemon-arcanine-statue': {"source":"assets/shelf-pokemon-arcanine-statue.png","width":1408,"height":1408,"bounds":[119,20,1204,1357],"displaySize":330,"displayWidth":280},
    'pokemon-squirtle-statue': {"source":"assets/shelf-pokemon-squirtle-statue.png","width":1408,"height":1408,"bounds":[107,80,1227,1275],"displaySize":330,"displayWidth":280},
    'pokemon-gengar-statue': {"source":"assets/shelf-pokemon-gengar-statue.png","width":1328,"height":1488,"bounds":[194,45,973,1392],"displaySize":330,"displayWidth":280},
    'pokemon-bulbasaur-statue': {"source":"assets/shelf-pokemon-bulbasaur-statue.png","width":1456,"height":1360,"bounds":[181,53,1124,1265],"displaySize":330,"displayWidth":280},
    'pokemon-charizard-statue': {"source":"assets/shelf-pokemon-charizard-statue.png","width":1552,"height":1264,"bounds":[49,17,1480,1232],"displaySize":430,"displayWidth":430},
    'pokemon-charmander-statue': {"source":"assets/shelf-pokemon-charmander-statue.png","width":1328,"height":1504,"bounds":[77,41,1187,1414],"displaySize":330,"displayWidth":280},
    'pokemon-gyarados-statue': {"source":"assets/shelf-pokemon-gyarados-statue.png","width":1408,"height":1408,"bounds":[268,7,923,1338],"displaySize":330,"displayWidth":280},
    pikachu: {source:'assets/shelf-collectibles-expansion.png',width:1254,height:1254,bounds:[368,28,238,284],displaySize:330,displayWidth:280},
    eevee: {source:'assets/shelf-collectibles-expansion.png',width:1254,height:1254,bounds:[667,13,229,303],displaySize:330,displayWidth:280},
    'superhero-winter-soldier-bust': {source:'assets/shelf-superhero-winter-soldier-bust.png',width:1152,height:1728,bounds:[34,50,1062,1604],displaySize:330,displayWidth:280},
    'superhero-hawkeye-bust': {source:'assets/shelf-superhero-hawkeye-bust.png',width:1264,height:1568,bounds:[184,8,946,1480],displaySize:330,displayWidth:280},
    'superhero-iron-man-bust': {source:'assets/shelf-superhero-iron-man-bust.png',width:1392,height:1424,bounds:[133,46,1046,1324],displaySize:330,displayWidth:280},
    'superhero-black-widow-bust': {source:'assets/shelf-superhero-black-widow-bust.png',width:1504,height:1312,bounds:[438,24,721,1248],displaySize:330,displayWidth:280},
    'superhero-captain-america-bust': {source:'assets/shelf-superhero-captain-america-bust.png',width:1264,height:1568,bounds:[128,13,998,1520],displaySize:330,displayWidth:280},
    'superhero-juggernaut-bust': {source:'assets/shelf-superhero-juggernaut-bust-v2.png',width:1248,height:1584,bounds:[31,15,1207,1534],displaySize:330,displayWidth:280},
    'sung-jin-woo': {source:'assets/shelf-sung-jin-woo-bust.png',width:1040,height:1888,bounds:[87,28,946,1800],displaySize:330,displayWidth:280},
    'superhero-sabretooth-bust': {source:'assets/shelf-superhero-sabretooth-bust.png',width:1408,height:1408,bounds:[130,12,1117,1358],displaySize:330,displayWidth:280},
    'superhero-spider-man-bust': {source:'assets/shelf-superhero-spider-man-bust.png',width:1408,height:1408,bounds:[339,49,827,1267],displaySize:330,displayWidth:280},
    'superhero-wolverine-bust': {source:'assets/shelf-superhero-wolverine-bust.png',width:1408,height:1408,bounds:[64,44,1022,1291],displaySize:330,displayWidth:280},
    'superhero-loki-bust': {source:'assets/shelf-superhero-loki-bust-v2.png',width:1152,height:1728,bounds:[59,20,1063,1660],displaySize:330,displayWidth:280},
    'superhero-hulk-bust': {source:'assets/shelf-superhero-hulk-bust-v2.png',width:1136,height:1728,bounds:[109,43,940,1619],displaySize:330,displayWidth:280},
    'superhero-thor-bust': {source:'assets/shelf-superhero-thor-bust-v2.png',width:1136,height:1728,bounds:[94,39,940,1630],displaySize:330,displayWidth:280},
    'disney-genie-bust': {source:'assets/shelf-disney-genie-bust.png',width:1312,height:1504,bounds:[228,41,858,1405]},
    'disney-prince-eric-bust': {source:'assets/shelf-disney-prince-eric-bust.png',width:1408,height:1408,bounds:[253,44,889,1290]},
    'disney-pocahontas-bust': {source:'assets/shelf-disney-pocahontas-bust.png',width:1600,height:1200,bounds:[414,26,730,1124]},
    'disney-elsa-bust': {source:'assets/shelf-disney-elsa-bust.png',width:1408,height:1408,bounds:[317,44,919,1318]},
    'disney-maleficent-bust': {source:'assets/shelf-disney-maleficent-bust.png',width:1408,height:1408,bounds:[322,10,757,1365],displaySize:330},
    'disney-evil-queen-bust': {source:'assets/shelf-disney-evil-queen-bust.png',width:1408,height:1408,bounds:[370,21,688,1348]},
    'disney-ursula-bust': {source:'assets/shelf-disney-ursula-bust.png',width:1408,height:1408,bounds:[447,49,815,1281]},
    'disney-jafar-bust': {source:'assets/shelf-disney-jafar-bust.png',width:1408,height:1408,bounds:[311,16,788,1325]},
    'disney-hans-bust': {source:'assets/shelf-disney-hans-bust.png',width:1408,height:1408,bounds:[192,37,1002,1303]},
    'disney-gaston-bust': {source:'assets/shelf-disney-gaston-bust.png',width:1408,height:1408,bounds:[78,43,1259,1288],displayWidth:300},
    'disney-aladdin-bust': {source:'assets/shelf-disney-aladdin-bust.png',width:1408,height:1408,bounds:[318,50,808,1299]},
    'disney-beast-bust': {source:'assets/shelf-disney-beast-bust.png',width:1408,height:1408,bounds:[215,20,952,1348]},
    'disney-hercules-bust': {source:'assets/shelf-disney-hercules-bust.png',width:1408,height:1408,bounds:[185,34,948,1335]},
    'disney-kristoff-bust': {source:'assets/shelf-disney-kristoff-bust.png',width:1408,height:1408,bounds:[237,44,947,1302]},
    'disney-snow-white-bust': {source:'assets/shelf-disney-snow-white-bust.png',width:1408,height:1408,bounds:[369,60,728,1268]},
    'disney-ariel-bust': {source:'assets/shelf-disney-ariel-bust.png',width:1408,height:1408,bounds:[286,88,861,1173]},
    'disney-tiana-bust': {source:'assets/shelf-disney-tiana-bust-v2.png',width:1408,height:1408,bounds:[365,40,955,1304]},
    'disney-cinderella-bust': {source:'assets/shelf-disney-cinderella-bust.png',width:1408,height:1408,bounds:[344,29,764,1338]},
    'disney-rapunzel-bust': {source:'assets/shelf-disney-rapunzel-bust.png',width:1408,height:1408,bounds:[289,26,801,1305],displaySize:330},
    'disney-belle-bust': {source:'assets/shelf-disney-belle-bust.png',width:1408,height:1408,bounds:[221,50,918,1300]},
    'disney-anna-bust': {source:'assets/shelf-disney-anna-bust.png',width:1408,height:1408,bounds:[217,35,940,1329]},
    'disney-jasmine-bust': {source:'assets/shelf-disney-jasmine-bust.png',width:1408,height:1408,bounds:[305,46,927,1311]},
    'disney-mulan-bust': {source:'assets/shelf-disney-mulan-bust.png',width:1408,height:1408,bounds:[344,40,844,1313]},
    'disney-aurora-bust': {source:'assets/shelf-disney-aurora-bust.png',width:1408,height:1408,bounds:[159,38,1115,1310],displayWidth:280},
    'growlithe': {source:'assets/shelf-growlithe.png',width:1200,height:1200,bounds:[249,87,708,1017]},
    'ash-pikachu': {source:'assets/shelf-ash-pikachu.png',width:896,height:1152,bounds:[106,58,732,1052]},
    'mew-console': {source:'assets/shelf-mew-console.png',width:1621,height:1280,bounds:[359,131,779,1048]},
    'charizard-flames': {source:'assets/shelf-charizard-flames.png',width:753,height:1285,bounds:[0,0,750,1257],displaySize:445,displayWidth:270},
    'bulbasaur-vines': {source:'assets/shelf-bulbasaur-vines.png',width:570,height:712,bounds:[39,22,516,652]},
    // Exclude the detached upper-right logo in the SVG presentation, preserving the supplied PNG.
    'gengar-flames': {source:'assets/shelf-gengar-flames.png',width:1080,height:1350,bounds:[105,172,853,1046],clip:'polygon(0 0, 77.777778% 0, 77.777778% 17.777778%, 100% 17.777778%, 100% 100%, 0 100%)'},
    'dragonite-pillow': {source:'assets/shelf-dragonite-pillow.png',width:1200,height:1200,bounds:[208,163,774,929]},
    'jdm-anime-supra': {source:'assets/shelf-jdm-anime-supra.png',width:1774,height:887,bounds:[7,116,1756,737]},
    'jdm-black-red-nsx': {source:'assets/shelf-jdm-black-red-nsx.png',width:1810,height:869,bounds:[12,82,1788,709]},
    'jdm-blue-skyline': {source:'assets/shelf-jdm-blue-skyline.png',width:1672,height:941,bounds:[27,179,1614,629]},
    'jdm-neon-gtr': {source:'assets/shelf-jdm-neon-gtr.png',width:1890,height:832,bounds:[19,108,1857,654]},
    'jdm-purple-green-supra': {source:'assets/shelf-jdm-purple-green-supra.png',width:1536,height:1024,bounds:[24,39,1508,900]},
    'jdm-red-skyline': {source:'assets/shelf-jdm-red-skyline.png',width:1871,height:841,bounds:[12,107,1858,646]},
    'six-seven': {source:'assets/shelf-six-seven.png',width:1403,height:1121,bounds:[195,62,1010,1025]},
    'asta': {source:'assets/shelf-asta.png',width:1146,height:1372,bounds:[157,0,833,1347]},
    'zoro': {source:'assets/shelf-zoro.png',width:1045,height:1505,bounds:[42,61,960,1398]},
    'sukuna': {source:'assets/shelf-sukuna.png',width:1131,height:1391,bounds:[70,18,1000,1364]},
    'midoriya': {source:'assets/shelf-midoriya.png',width:1199,height:1312,bounds:[62,15,1077,1282]},
    'highland-pumpkin': {source:'assets/shelf-highland-pumpkin.png',width:1145,height:1374,bounds:[121,13,894,1288]},
    'highland-sunflower-bow': {source:'assets/shelf-highland-sunflower-bow.png',width:1243,height:1266,bounds:[131,49,990,1176]},
    'highland-sunflower-bouquet': {source:'assets/shelf-highland-sunflower-bouquet.png',width:1237,height:1271,bounds:[76,26,1085,1206]},
    'highland-lavender-basket': {source:'assets/shelf-highland-lavender-basket.png',width:1236,height:1273,bounds:[121,21,1016,1210]},
    'highland-lavender-bow': {source:'assets/shelf-highland-lavender-bow.png',width:1234,height:1274,bounds:[103,9,1031,1247]},
    'archangel-michael': {source:'assets/shelf-archangel-michael.png',width:1254,height:1254,bounds:[283,17,689,1180]},
    'archangel-gabriel': {source:'assets/shelf-archangel-gabriel.png',width:1254,height:1254,bounds:[309,12,636,1228]},
    'uncle-sam': {source:'assets/shelf-uncle-sam.png',width:1254,height:1254,bounds:[395,14,487,1215]},
    'usa-eagle': {source:'assets/shelf-usa-eagle.png',width:1254,height:1254,bounds:[290,0,674,1254]},
    'usa-liberty': {source:'assets/shelf-usa-liberty.png',width:1254,height:1254,bounds:[408,5,443,1245]},
    'usa-bell': {source:'assets/shelf-usa-bell.png',width:1254,height:1254,bounds:[13,13,1231,1223]},
    'usa-top-hat': {source:'assets/shelf-usa-top-hat.png',width:1254,height:1254,bounds:[16,48,1226,1161]},
    'labubu-cream': {source:'assets/shelf-labubu-cream-front.png',width:1024,height:1536,bounds:[100,39,826,1456]},
    'labubu-pink': {source:'assets/shelf-labubu-pink-front.png',width:1024,height:1536,bounds:[120,32,784,1473]},
    'labubu-sage': {source:'assets/shelf-labubu-sage-front.png',width:1024,height:1536,bounds:[104,31,816,1465]},
    bingo: {source:'assets/shelf-bingo-reference.png',width:1024,height:1536,bounds:[60,34,907,1455]},
    chilli: {source:'assets/shelf-chilli.png',width:1254,height:1254,bounds:[278,6,689,1237]},
    bandit: {source:'assets/shelf-bandit.png',width:1254,height:1254,bounds:[291,9,662,1237]},
    'nola-snowball': {source:'assets/shelf-nola-snowball.png',width:1254,height:1254,bounds:[240,17,821,1222]},
    'nola-king-cake': {source:'assets/shelf-nola-king-cake-flat.png',width:1897,height:829,bounds:[37,93,1823,661],displayWidth:280},
    'nola-second-line': {source:'assets/shelf-nola-second-line.png',width:1254,height:1254,bounds:[77,9,1113,1235]},
    'nola-pelican': {source:'assets/shelf-nola-pelican.png',width:1254,height:1254,bounds:[229,20,840,1218]},
    'enchanted-rose': {source:'assets/shelf-enchanted-rose.png',width:1254,height:1254,bounds:[265,18,723,1165]},
    'open-bible': {"source":"assets/shelf-open-bible.png","width":1254,"height":1254,"bounds":[39,114,1180,1046]},
    'praying-hands': {"source":"assets/shelf-praying-hands.png","width":1254,"height":1254,"bounds":[245,23,767,1210]},
    'peace-dove': {"source":"assets/shelf-peace-dove.png","width":1254,"height":1254,"bounds":[150,12,977,1229]},
    'holy-family': {"source":"assets/shelf-holy-family.png","width":1254,"height":1254,"bounds":[93,3,1068,1223]},
    'good-shepherd': {"source":"assets/shelf-good-shepherd.png","width":1254,"height":1254,"bounds":[142,11,974,1232]},
    'squishy-pink': {source:'assets/shelf-squishy-pink.png',width:1254,height:1254,bounds:[29,62,1196,1153]},
    'squishy-blue': {source:'assets/shelf-squishy-blue.png',width:1254,height:1254,bounds:[24,37,1207,1185]},
    'squishy-gold': {source:'assets/shelf-squishy-gold.png',width:1254,height:1254,bounds:[13,17,1229,1219]},
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
    'all-might': {"source":"assets/shelf-all-might-v2.png","width":1136,"height":1744,"bounds":[132,23,909,1640],"displaySize":330,"displayWidth":280},
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
  function sprite(id, thumbnail = false) {
    const item = items.find(item => item.id === id);
    if (!item) return '<span class="shelf-empty" aria-label="Empty spot"></span>';
    const asset = standalone[item.id] || (expansion[item.id] ? { source:'assets/shelf-collectibles-expansion.png', width:1254, height:1254, bounds:expansion[item.id] } : null) || (discovery[item.id] ? { source:'assets/shelf-collectibles-discovery.png', width:1254, height:1254, bounds:discovery[item.id] } : null);
    const [x,y,w,h] = asset ? asset.bounds : bounds[item.row * 6 + item.column];
    const source = asset?.source || 'assets/shelf-collectibles.png';
    const car = item.category === 'JDM Model Cars';
    if (car && thumbnail) return `<svg class="shelf-object shelf-car-thumbnail" role="img" aria-label="${item.name}" viewBox="${x} ${y} ${w} ${h}"><image href="${source}" width="${asset.width}" height="${asset.height}"/></svg>`;
    const anime = item.category === 'Anime';
    // Every collectible shares the statue sizing and bottom baseline. Wide pieces
    // retain their proportions and stay inside the space between neighboring slots.
    // The low-profile cake uses more of its slot's horizontal gap, without
    // stretching the plate or moving its contact point off the shared baseline.
    const scale = Math.min((thumbnail ? 330 : (asset?.displaySize || 330)) / Math.max(w,h), (asset?.displayWidth || (car ? 270 : 240)) / w);
    const height = 350;
    if (asset?.directImage || anime || item.category === 'Superheroes' || id === 'peace-sign-girl' || id === 'verity-statue' || id.startsWith('toy-story-')) {
      // Render the original bitmap directly at its final layout size, without SVG/filter rasterization.
      return `<div class="shelf-object shelf-direct-image${anime ? ' shelf-object-anime' : ''}${asset?.displaySize && !thumbnail ? ' shelf-tall-object' : ''}" role="img" aria-label="${item.name}" style="position:relative;filter:none;aspect-ratio:220 / 350"><div style="position:absolute;overflow:hidden;left:${((220-w*scale)/2 + (thumbnail ? 0 : (asset?.displayOffsetX || 0)))/220*100}%;bottom:${4/350*100}%;width:${w*scale/220*100}%;height:${h*scale/350*100}%"><img alt="" src="${source}" style="position:absolute;max-width:none;width:${(asset?.width || 1254)/w*100}%;height:${(asset?.height || 1254)/h*100}%;left:${-x/w*100}%;top:${-y/h*100}%;image-rendering:auto${asset?.clip ? `;clip-path:${asset.clip};clip-rule:nonzero` : ''}"></div></div>`;
    }
    return `<svg class="shelf-object${anime ? ' shelf-object-anime' : ''}${asset?.displaySize && !thumbnail ? ' shelf-tall-object' : ''}" style="aspect-ratio:220 / ${height}" role="img" aria-label="${item.name}" viewBox="0 0 220 ${height}"><svg x="${(220-w*scale)/2 + (thumbnail ? 0 : (asset?.displayOffsetX || 0))}" y="${height-4-h*scale}" width="${w*scale}" height="${h*scale}" viewBox="${x} ${y} ${w} ${h}" overflow="hidden"><image href="${source}" width="${asset?.width || 1254}" height="${asset?.height || 1254}"${asset?.clip ? ` style="clip-path:${asset.clip};clip-rule:nonzero"` : ''}/></svg></svg>`;
  }
  function art(value, interactive = false, active = 0) {
    const state = clean(value);
    return `<div class="collectible-shelf${interactive ? ' shelf-preview' : ''}${state.slots.some(id => id.startsWith('jdm-')) ? ' shelf-has-cars' : ''}${state.slots.some(id => id.startsWith('michael-jackson-') || id.startsWith('superhero-') || id.startsWith('pokemon-') || ['pikachu','eevee'].includes(id)) ? ' shelf-has-superheroes' : ''}" data-shelf-theme="${state.theme}"><div class="shelf-objects">${state.slots.map((id, index) => interactive
      ? `<button type="button" data-shelf-slot="${index}" aria-pressed="${index === active}" aria-label="${['Left','Middle','Right'][index]} spot: ${name(id)}">${sprite(id)}<span class="shelf-slot-label">${['Left','Middle','Right'][index]}</span></button>`
      : `<div class="shelf-display-slot">${sprite(id)}</div>`).join('')}</div><div class="shelf-board" aria-hidden="true"></div></div>`;
  }
  function render(session, side = 'left') {
    if (!session?.authenticated) return '';
    side = side === 'right' ? 'right' : 'left';
    const value = side === 'right' ? session.homeShelfRight : session.homeShelf;
    const suffix = side === 'right' ? 'Right' : '';
    const label = side === 'right' ? 'Right' : 'Left';
    // Keep a hover/touch target in the same position when a shelf is hidden.
    const visibility = enabled => `<div class="shelf-visibility-controls"><button type="button" class="outline-btn" data-shelf-side="${side}" data-action="${enabled ? 'hide' : 'show'}CollectibleShelf">${enabled ? 'Hide' : 'Show'} ${label.toLowerCase()} shelf</button><span role="status"></span></div>`;
    if (!clean(value).enabled) return `<div class="shelf-restore" data-shelf-side="${side}">${visibility(false)}</div>`;
    return `<section class="home-collectible-shelf" data-shelf-side="${side}" aria-label="Your ${side} collectible shelf">${art(value)}${visibility(true)}<button class="shelf-customize" type="button" popovertarget="shelfSettingsMenu${suffix}" aria-label="${label} shelf settings" title="${label} shelf settings" aria-expanded="false" aria-controls="shelfSettingsMenu${suffix}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 3-.6 2.4-2 .9-2.2-.7-2 3.4 1.7 1.7v2.6L2.2 15l2 3.4 2.2-.7 2 .9L9 21h4l.6-2.4 2-.9 2.2.7 2-3.4-1.7-1.7v-2.6L19.8 9l-2-3.4-2.2.7-2-.9L13 3Z"/><circle cx="11" cy="12" r="3"/></svg></button><div id="shelfSettingsMenu${suffix}" class="shelf-settings-menu" popover="auto" aria-label="${label} shelf settings"><button type="button" data-shelf-side="${side}" data-action="collectibleShelf">Customize shelf</button><button type="button" data-shelf-side="${side}" data-action="hideCollectibleShelf">Hide shelf</button><span id="shelfHideStatus${suffix}" role="status"></span></div></section>`;
  }
  let hideTimer;
  function restoreGear(keyboard, side = 'left') {
    const gear = document.querySelector('.home-collectible-shelf[data-shelf-side="'+side+'"] .shelf-customize');
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
  function open({ selected, save, onSave, side = 'left' }) {
    if (document.querySelector('.shelf-dialog')) return;
    document.querySelectorAll('.shelf-settings-menu:popover-open').forEach(menu => menu.hidePopover());
    let draft=clean(selected), active=0, saving=false, tab='objects';
    const pages={objects:0,styles:0}, searches={objects:'',styles:''};
    const opener=document.activeElement, keyboard=!!opener?.matches(':focus-visible');
    const dialog=document.createElement('dialog');
    dialog.className='launch-scene-dialog shelf-dialog';
    dialog.setAttribute('aria-labelledby','shelfTitle');
    dialog.innerHTML='<div class="launch-scene-dialog-heading"><h2 id="shelfTitle">Your collectible shelf</h2><button type="button" class="outline-btn" data-shelf-close aria-label="Close shelf chooser">✕</button></div><div class="shelf-preview-area"><div id="shelfPreview"></div><div class="shelf-preview-controls"><p>Choose a spot, then pick an object.</p><button type="button" class="outline-btn" id="shelfClearSlot">Clear selected spot</button><label class="shelf-show"><input id="shelfEnabled" type="checkbox"> Show shelf</label></div></div><div class="shelf-tabs" role="tablist" aria-label="Customize shelf"><button type="button" id="shelfObjectsTab" role="tab" data-shelf-tab="objects" aria-controls="shelfObjectsPanel">Objects</button><button type="button" id="shelfStylesTab" role="tab" data-shelf-tab="styles" aria-controls="shelfStylesPanel">Shelf Styles</button></div><div class="shelf-filters"><label><span id="shelfSearchLabel">Search objects</span><input id="shelfSearch" type="search" autocomplete="off"></label><label id="shelfCategoryLabel">Category<select id="shelfCategory"><option value="">All categories</option>'+[...new Set(rows.map(([category])=>category))].sort().map(category=>'<option>'+category+'</option>').join('')+'</select></label></div><p id="shelfResults" role="status"></p><div class="shelf-browse-area"><section id="shelfObjectsPanel" role="tabpanel" aria-labelledby="shelfObjectsTab"><div id="shelfChoices" class="shelf-choice-grid"></div></section><section id="shelfStylesPanel" role="tabpanel" aria-labelledby="shelfStylesTab" hidden><div class="shelf-theme-grid"></div></section></div><nav class="shelf-pagination" aria-label="Choice pages"><button type="button" class="outline-btn" id="shelfPrevious">Previous</button><span id="shelfPageStatus" role="status"></span><button type="button" class="outline-btn" id="shelfNext">Next</button></nav><div class="shelf-dialog-actions"><span id="shelfSaveStatus" role="status"></span><button type="button" class="outline-btn" data-shelf-close>Cancel</button><button type="button" class="primary-btn" id="saveShelf">Save shelf</button></div>';
    dialog.querySelector('#shelfTitle').textContent = side === 'right' ? 'Your right collectible shelf' : 'Your left collectible shelf';
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
      const pool=tab==='objects'?items.filter(item=>!category.value || item.category===category.value).sort((a,b)=>a.name.localeCompare(b.name)):[...themes].sort((a,b)=>a.name.localeCompare(b.name));
      const matches=pool.filter(item=>terms.every(term=>(item.name+' '+(item.category||'')).toLowerCase().includes(term)));
      const size=pageSize(), count=Math.max(1,Math.ceil(matches.length/size));
      pages[tab]=Math.min(pages[tab],count-1);
      const visible=matches.slice(pages[tab]*size,(pages[tab]+1)*size);
      choices.innerHTML=tab==='objects'?visible.map(item=>'<button type="button" data-shelf-item="'+item.id+'" aria-pressed="'+(draft.slots[active]===item.id)+'">'+sprite(item.id,true)+'<strong>'+item.name+'</strong></button>').join(''):'';
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
      if(opener?.closest('.shelf-settings-menu'))restoreGear(keyboard, side);
      else if(opener?.isConnected)opener.focus();
      else document.querySelector('.header-account-summary')?.focus();
    };
    dialog.querySelectorAll('[data-shelf-close]').forEach(button=>button.addEventListener('click',close));
    dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
    dialog.querySelector('#saveShelf').addEventListener('click',async()=>{
      saving=true;dialog.querySelectorAll('button,input,select').forEach(control=>{control.disabled=true;});
      dialog.querySelector('#shelfSaveStatus').textContent='Saving your shelf…';
      try{const result=await save(clean(draft));saving=false;close();onSave(result);restoreGear(keyboard, side);}
      catch(error){saving=false;dialog.querySelectorAll('button,input,select').forEach(control=>{control.disabled=false;});update();dialog.querySelector('#shelfSaveStatus').textContent=error.message||'Could not save. Please try again.';}
    });
    dialog.showModal();update();observer.observe(browse);
  }
  const api = { items, themes, valid, clean, render, open, art };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else {
    root.CollectibleShelf = api;
    const visibilityTimers = new WeakMap();
    for (const name of ['pointermove','pointerdown','focusin']) document.addEventListener(name, event => {
      const region = event.target.closest?.('.home-collectible-shelf,.shelf-restore');
      const controls = region?.querySelector('.shelf-visibility-controls');
      if (!controls) return;
      clearTimeout(visibilityTimers.get(controls));
      controls.classList.remove('is-idle');
      controls.classList.add('is-active');
      visibilityTimers.set(controls, setTimeout(() => {
        controls.classList.remove('is-active');
        controls.classList.add('is-idle');
      }, 3000));
    });
    document.addEventListener('toggle', event => {
      if (!event.target.classList?.contains('shelf-settings-menu')) return;
      const gear = event.target.closest('.home-collectible-shelf')?.querySelector('.shelf-customize');
      if (!gear) return;
      gear.setAttribute('aria-expanded', String(event.newState === 'open'));
      if (event.newState !== 'open') {
        if (!document.querySelector('.shelf-dialog')) restoreGear(gear.matches(':focus-visible'), event.target.closest('.home-collectible-shelf').dataset.shelfSide);
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
