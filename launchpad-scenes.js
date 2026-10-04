(() => {
  "use strict";
  const scenes = [
    { id: "original", name: "Classroom Original", description: "Mr. Nieves & Colt videos", image: "" },
    { id: "disney-epcot-night", name: "Disney • EPCOT After Dark", description: "Spaceship Earth with flowing violet and golden illumination", image: "assets/launchpad-scene-disney-epcot-night.png" },
    { id: "disney-hollywood-hotel", name: "Disney • Hollywood Tower Hotel", description: "Twilight hotel with glowing neon signage", image: "assets/launchpad-scene-disney-hollywood-hotel.png" },
    { id: "disney-haunted-mansion", name: "Disney • Moonlit Haunted Mansion", description: "A moonlit mansion with animated amber lantern light", image: "assets/launchpad-scene-disney-haunted-mansion.png" },
    { id: "disney-castle-fountain", name: "Disney • Castle Fountain Gardens", description: "A sunny fairytale castle with cascading fountain water", image: "assets/launchpad-scene-disney-castle-fountain.png" },
    { id: "disney-twilight-boulevard", name: "Disney • Twilight Castle Boulevard", description: "A glowing castle boulevard with shimmering lamplight reflections", image: "assets/launchpad-scene-disney-twilight-boulevard.png" },
    { id: "disney-agrabah", name: "Disney • Agrabah Palace", description: "Aladdin's golden palace with shimmering domes at sunset", image: "assets/launchpad-scene-disney-agrabah.png" },
    { id: "disney-snow-castle", name: "Disney • Snowy Mountain Castle", description: "A winter fairytale castle with falling snow", image: "assets/launchpad-scene-disney-snow-castle.png" },
    { id: "disney-pride-rock", name: "Disney • Pride Rock", description: "The Lion King savanna with animated golden sun radiance", image: "assets/launchpad-scene-disney-pride-rock.png" },
    { id: "disney-undersea-palace", name: "Disney • Undersea Palace", description: "The Little Mermaid inspired underwater kingdom with rising bubbles", image: "assets/launchpad-scene-disney-undersea-palace.png" },
    { id: "disney-bayou", name: "Disney • Firefly Bayou", description: "The Princess and the Frog inspired riverboat sunset with glowing fireflies", image: "assets/launchpad-scene-disney-bayou.png" },
    { id: "disney-river-valley", name: "Disney • Sunset River Valley", description: "Forest cliffs and a golden river with moving water ripples", image: "assets/launchpad-scene-disney-river-valley.png" },
    { id: "disney-island-cottage", name: "Disney • Tropical Island Cottage", description: "Lilo and Stitch inspired Hawaiian coastline with shimmering surf", image: "assets/launchpad-scene-disney-island-cottage.png" },
    { id: "disney-alpine-harbor", name: "Disney • Alpine Castle Harbor", description: "A colorful mountain village and castle with sparkling harbor ripples", image: "assets/launchpad-scene-disney-alpine-harbor.png" },
    { id: "floating-sky-tower", name: "Floating Sky Tower", description: "A soaring fortress above the clouds with bright upper-right sun rays", image: "assets/launchpad-scene-floating-sky-tower.png" },
    { id: "soccer-training-complex", name: "Soccer Training Complex", description: "Evening practice fields with animated stadium floodlights", image: "assets/launchpad-scene-soccer-training-complex.png" },
    { id: "sunset-school-gym", name: "Sunset School Gym", description: "A golden school sunset with rays radiating from the sun", image: "assets/launchpad-scene-sunset-school-gym.png" },
    { id: "tokyo-cherry-night", name: "Tokyo Cherry Blossom Night", description: "Tokyo Tower, moonlit river and falling pink cherry blossoms", image: "assets/launchpad-scene-tokyo-cherry-night.png" },
    { id: "kame-house-island", name: "Kame House Island", description: "Dragon Ball's tropical island with bright upper-right sun rays", image: "assets/launchpad-scene-kame-house-island.png" },
    { id: "royal-castle-city", name: "Royal Castle City", description: "A towering castle above the town with bright sweeping sun rays", image: "assets/launchpad-scene-royal-castle-city.png" },
    { id: "sunlit-palace-harbor", name: "Sunlit Palace Harbor", description: "A sailing ship and hilltop palace with animated blue water ripples", image: "assets/launchpad-scene-sunlit-palace-harbor.png" },
    { id: "pokemon-center-gardens", name: "Pokémon • Center Gardens", description: "A sunny Pokémon Center with flowers and falling leaves", image: "assets/launchpad-scene-pokemon-center-gardens.png" },
    { id: "forest-temple", name: "Forest Temple", description: "A Japanese mountain temple with falling green leaves", image: "assets/launchpad-scene-forest-temple.png" },
    { id: "mha-ua-campus", name: "MHA • U.A. High School", description: "My Hero Academia campus with bright animated sunbeams from the upper left", image: "assets/launchpad-scene-mha-ua-campus.png" },
    { id: "pokemon-campus", name: "Pokémon • Woodland Campus", description: "A sunny Pokémon campus with gently falling green leaves", image: "assets/launchpad-scene-pokemon-campus.png" },
    { id: "pokemon-indoor-arena", name: "Pokémon • Garden Arena", description: "An indoor botanical battle arena with softly shimmering skylight", image: "assets/launchpad-scene-pokemon-indoor-arena.png" },
    { id: "moonlit-cherry-village", name: "Moonlit Cherry Blossom Village", description: "Japanese lantern-lit village, red bridge, cherry petals & moonlit reflections", image: "assets/launchpad-scene-moonlit-cherry-village.png" },
    { id: "walled-city-fountain", name: "Walled City • Fountain Square", description: "Towering city walls, a sunny market square & softly shimmering fountain", image: "assets/launchpad-scene-walled-city-fountain.png" },
    { id: "walled-city-market", name: "Walled City • Market Street", description: "Colorful market awnings, cobblestone streets & gently drifting golden light", image: "assets/launchpad-scene-walled-city-market.png" },
    { id: "demon-slayer-nezuko", name: "Nezuko • Pink Moon", description: "Demon Slayer: Nezuko, cherry blossoms & pink flames", image: "assets/launchpad-scene-demon-slayer-nezuko.png" },
    { id: "demon-slayer-shinobu", name: "Shinobu • Wisteria Garden", description: "Demon Slayer: Shinobu, purple wisteria & glowing butterflies", image: "assets/launchpad-scene-demon-slayer-shinobu.png" },
    { id: "demon-slayer-akaza", name: "Akaza • Infinity Castle", description: "Demon Slayer: Akaza beneath the castle's golden lanterns", image: "assets/launchpad-scene-demon-slayer-akaza.png" },
    { id: "demon-slayer-tanjiro", name: "Tanjiro • Water Breathing", description: "Demon Slayer: Tanjiro surrounded by swirling blue waves", image: "assets/launchpad-scene-demon-slayer-tanjiro.png" },
    { id: "demon-slayer-rengoku", name: "Rengoku • Flame Breathing", description: "Demon Slayer: Rengoku surrounded by golden flames", image: "assets/launchpad-scene-demon-slayer-rengoku.png" },
    { id: "demon-slayer-giyu", name: "Giyu • Moonlit Water", description: "Demon Slayer: Giyu, moonlight & rushing blue water", image: "assets/launchpad-scene-demon-slayer-giyu.png" },
    { id: "hidden-leaf-overlook", name: "Hidden Leaf Forest Overlook", description: "Naruto's Hidden Leaf Village, Hokage Monument & a leafy sunset trail", image: "assets/launchpad-scene-hidden-leaf-overlook.png" },
    { id: "hidden-leaf-rooftops", name: "Hidden Leaf Rooftop Sunset", description: "Naruto's Hidden Leaf Village rooftops & Hokage Monument beneath a golden sky", image: "assets/launchpad-scene-hidden-leaf-rooftops.png" },
    { id: "jdm", name: "JDM Neon Garage", description: "Japanese tuner cars, neon workshop lights & a rainy Tokyo skyline", image: "assets/launchpad-scene-jdm.png" },
    { id: "squishy", name: "Squishy Dumpling Café", description: "Smiling pastel bao toys, glitter-gold dumpling & cozy bamboo baskets", image: "assets/launchpad-scene-squishy.png" },
    { id: "highland", name: "Highland Cattle Meadow", description: "Shaggy Highland cow & calf in a sunset Scottish meadow", image: "assets/launchpad-scene-highland.png" },
    { id: "ninja-course", name: "American Ninja Warrior Arena", description: "Obstacle course, warped wall & sweeping stadium lights", image: "assets/launchpad-scene-ninja-course.png" },
    { id: "anime", name: "Anime Sunset", description: "Original anime friends, a glowing town & drifting cherry petals", image: "assets/launchpad-scene-anime.png" },
    { id: "alien", name: "Alien Observatory", description: "Gray alien explorers & a glowing star-map console", image: "assets/launchpad-scene-alien.png" },
    { id: "reef", name: "Coral Cove", description: "Sunlit reef & rising bubbles", image: "assets/launchpad-scene-reef.png" },
    { id: "forest", name: "Firefly Forest", description: "Twilight stream & drifting lights", image: "assets/launchpad-scene-forest.png" },
    { id: "pixel", name: "Pixel Arcade", description: "Spinning coins & glowing pixels", image: "assets/launchpad-scene-pixel-coinfree.png" },
    { id: "observatory", name: "Cosmic Observatory", description: "Ringed planet & drifting stars", image: "assets/launchpad-scene-observatory.png" },
    { id: "dragon", name: "Dragon’s Library", description: "Cozy books & golden dust", image: "assets/launchpad-scene-dragon.png" },
    { id: "cabin", name: "Snowy Cabin", description: "Warm windows & falling snow", image: "assets/launchpad-scene-cabin.png" },
    { id: "neon", name: "Rainy Neon City", description: "Colorful skyline & flowing rain", image: "assets/launchpad-scene-neon.png" },
    { id: "castle", name: "Cloud Castle", description: "Floating towers & shimmering sun rays", image: "assets/launchpad-scene-castle.png" },
    { id: "koi", name: "Moonlit Koi Pond", description: "Quiet garden & falling petals", image: "assets/launchpad-scene-koi.png" },
    { id: "crystal", name: "Crystal Cavern", description: "Glowing gems & rising sparkles", image: "assets/launchpad-scene-crystal.png" },
    { id: "pumpkin", name: "Pumpkin Patch", description: "Friendly pumpkins & autumn leaves", image: "assets/launchpad-scene-pumpkin.png" },
    { id: "volcano", name: "Volcano Island", description: "Tropical sunset & drifting embers", image: "assets/launchpad-scene-volcano.png" },
    { id: "football", name: "Friday Night Football", description: "Stadium lights & falling confetti", image: "assets/launchpad-scene-football.png" },
    { id: "basketball", name: "Basketball After Dark", description: "Gently glowing court lights & reflections", image: "assets/launchpad-scene-basketball.png" },
    { id: "championship", name: "Colts Championship Arena", description: "Golden trophy & celebration confetti", image: "assets/launchpad-scene-championship.png" },
    { id: "soccer", name: "Soccer Stadium", description: "Twilight pitch & glowing floodlights", image: "assets/launchpad-scene-soccer.png" },
    { id: "baseball", name: "Baseball Under the Lights", description: "Sunset diamond & warm stadium lights", image: "assets/launchpad-scene-baseball.png" },
    { id: "softball", name: "Softball Sunset", description: "Golden diamond & glowing stadium lights", image: "assets/launchpad-scene-softball.png" },
    { id: "gymnastics", name: "Gymnastics Arena", description: "Balance beam, uneven bars & glowing lights", image: "assets/launchpad-scene-gymnastics.png" },
    { id: "cafe", name: "French Quarter Café", description: "Beignets, New Orleans & rain on glass", image: "assets/launchpad-scene-cafe-v2.png" },
    { id: "aurora", name: "Northern Lights Lake", description: "Alpine lake & flowing aurora light", image: "assets/launchpad-scene-aurora.png" },
    { id: "train", name: "Autumn Train Station", description: "Golden leaves & drifting steam", image: "assets/launchpad-scene-train.png" },
    { id: "lantern", name: "Japanese Lantern Street", description: "Warm lanterns & drifting cherry petals", image: "assets/launchpad-scene-lantern.png" },
    { id: "bookshop", name: "Cozy Bookshop", description: "Book displays, shop cat & rainy window", image: "assets/launchpad-scene-bookshop-v2.png" },
    { id: "crawfish", name: "Louisiana Crawfish Boil", description: "Bayou picnic & curling pot steam", image: "assets/launchpad-scene-crawfish.png" },
    { id: "balloons", name: "Hot Air Balloon Meadow", description: "Sunrise wildflowers & flickering burner glow", image: "assets/launchpad-scene-balloons.png" },
    { id: "robotics", name: "Robotics Workshop", description: "Friendly robot & glowing indicator lights", image: "assets/launchpad-scene-robotics.png" },
    { id: "retro-arcade", name: "Retro Arcade", description: "Vintage cabinets & pulsing neon screens", image: "assets/launchpad-scene-retro-arcade.png" },
    { id: "chapel", name: "Stained Glass Chapel", description: "Jesus, a golden cross & gentle candlelight", image: "assets/launchpad-scene-chapel.png" },
    { id: "bonfire", name: "Beach Bonfire", description: "Sunset waves, warm firelight & rising embers", image: "assets/launchpad-scene-bonfire.png" },
    { id: "oasis", name: "Desert Oasis", description: "Golden cliffs, palms & shimmering turquoise water", image: "assets/launchpad-scene-oasis.png" },
    { id: "christmas-chapel", name: "Christmas Chapel", description: "Nativity display, candlelight & a glowing star", image: "assets/launchpad-scene-christmas-chapel.png" }
  ];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  scenes.push(...[{"id":"holiday-christmas","name":"Christmas Village","description":"Snowy village, glowing Christmas tree & wrapped gifts","image":"assets/launchpad-scene-holiday-christmas.png"},{"id":"holiday-thanksgiving","name":"Thanksgiving Harvest","description":"Cornucopia, autumn orchard & cozy farmhouse","image":"assets/launchpad-scene-holiday-thanksgiving.png"},{"id":"holiday-easter","name":"Easter Garden","description":"Pastel eggs, spring flowers & a little bunny","image":"assets/launchpad-scene-holiday-easter.png"},{"id":"holiday-valentine","name":"Valentine’s Day Cottage","description":"Heart lanterns, roses & a storybook cottage","image":"assets/launchpad-scene-holiday-valentine.png"},{"id":"holiday-st-patrick","name":"St. Patrick’s Day Meadow","description":"Shamrocks, rainbow & an Irish cottage","image":"assets/launchpad-scene-holiday-st-patrick.png"},{"id":"holiday-mardi-gras","name":"Mardi Gras Celebration","description":"Carnival mask, beads & French Quarter lights","image":"assets/launchpad-scene-holiday-mardi-gras.png"},{"id":"holiday-halloween","name":"Halloween Candy Cottage","description":"Friendly ghosts, glowing pumpkins & candy","image":"assets/launchpad-scene-holiday-halloween.png"},{"id":"holiday-new-year","name":"New Year’s Celebration","description":"Midnight clock, golden stars & fireworks","image":"assets/launchpad-scene-holiday-new-year.png"},{"id":"holiday-usa","name":"USA Patriotic","description":"American flag, summer town & red-white-blue fireworks","image":"assets/launchpad-scene-holiday-usa.png"}]);
  const frames = [
    { id: "blue-fire", name: "Blue Fire", description: "Electric blue flames & a luminous cyan ring", decorative: true },
    { id: "rainbow-fire", name: "Rainbow Fire", description: "A full spectrum of vivid curling flames", decorative: true },
    { id: "usa-patriotic", name: "Stars & Stripes", description: "USA ribbons, golden eagle & silver stars", decorative: true },
    { id: "none", name: "No frame", description: "Original clean border" },
    { id: "christian", name: "Christian Grace", description: "Golden cross, white lilies, olive branches & dove", decorative: true },
    { id: "squishy", name: "Squishy Sweethearts", description: "Bamboo, pastel ribbons & smiling dumpling toys", decorative: true },
    { id: "highland", name: "Highland Heather", description: "Rustic oak, bronze Celtic knots, purple heather & tartan", decorative: true },
    { id: "titanium", name: "Brushed Titanium", description: "Satin metal & fine engraved lines" },
    { id: "walnut", name: "Walnut Classic", description: "Warm wood grain & brass trim" },
    { id: "ivory", name: "Ivory Enamel", description: "Cream enamel & delicate gold edging" },
    { id: "chrome", name: "Liquid Silver", description: "Sculpted polished chrome" },
    { id: "gold", name: "Golden Edge", description: "Layered warm gold" },
    { id: "rose", name: "Rose Halo", description: "Soft rose-gold metal" },
    { id: "pearl", name: "Pearl Crown", description: "A circle of luminous pearls" },
    { id: "neon", name: "Neon Duo", description: "Electric cyan and violet" },
    { id: "prism", name: "Prism Glass", description: "Faceted rainbow reflections" },
    { id: "onyx", name: "Onyx Luxe", description: "Dark metal, gold accents" },
    { id: "braid", name: "Silver Braid", description: "Interwoven silver strands" },
    { id: "bronze", name: "Copper Rivets", description: "Burnished metal & brass studs" },
    { id: "velvet", name: "Velvet Stitch", description: "Burgundy trim & ivory stitching" },
    { id: "mosaic", name: "Mosaic Pop", description: "Colorful tiles & dark grout" },
    { id: "carbon", name: "Carbon Weave", description: "Woven graphite & silver edging" },
    { id: "deco", name: "Deco Orbit", description: "Golden dashes & midnight enamel" },
    { id: "frost", name: "Frosted Crystal", description: "Icy facets & a cool blue halo" },
    { id: "blossom", name: "Cherry Blossom", description: "Rose-gold branches & pink flowers", decorative: true },
    { id: "guardian", name: "Dragon Guardian", description: "Emerald scales & amber jewels", decorative: true },
    { id: "woodland", name: "Enchanted Forest", description: "Twisting vines & tiny mushrooms", decorative: true },
    { id: "orbit", name: "Cosmic Explorer", description: "Golden stars, moon & ringed planet", decorative: true },
    {"id":"treasure","name":"Ocean Treasure","description":"Coral, seashells & pearls","decorative":true},
    {"id":"royal","name":"Royal Crown","description":"Gold filigree & ruby jewels","decorative":true},
    {"id":"phoenix","name":"Phoenix Flame","description":"Copper feathers & fiery tips","decorative":true},
    {"id":"butterfly","name":"Butterfly Garden","description":"Colorful wings & flowers","decorative":true},
    {"id":"frost-dragon","name":"Frost Dragon","description":"Silver scales & blue crystals","decorative":true},
    {"id":"clockwork","name":"Clockwork","description":"Brass gears & copper details","decorative":true},
    {"id":"library","name":"Enchanted Library","description":"Little books & feather quill","decorative":true},
    {"id":"champion","name":"Sports Champion","description":"Golden laurels & hanging medal","decorative":true},
    { id: "halloween", name: "Halloween Magic", description: "Smiling pumpkins, bats & a friendly ghost", decorative: true },
    { id: "new-orleans", name: "New Orleans", description: "French Quarter lanterns & Mardi Gras jewels", decorative: true },
    { id: "sunflower", name: "Sunflower Wreath", description: "Golden flowers, daisies & amber jewels", decorative: true },
    { id: "peacock", name: "Peacock Jewels", description: "Iridescent feathers & gold filigree", decorative: true },
    { id: "harvest", name: "Autumn Harvest", description: "Copper leaves, acorns & little pumpkins", decorative: true },
    { id: "evergreen", name: "Christmas Evergreen", description: "Holly, velvet ribbon & golden bells", decorative: true }
  ];
  // Keep the reset choice first without mutating the catalog or saved IDs.
  const alphabetically = items => [...items].sort((a, b) => {
    const pinned = item => item.id === "none" || item.id === "original";
    return Number(pinned(b)) - Number(pinned(a)) || a.name.localeCompare(b.name, "en", { sensitivity: "base" });
  });
  function attachChooserSearch(dialog, kind) {
    const options = dialog.querySelector(".launch-scene-options");
    const controls = document.createElement("div");
    controls.className = "launch-chooser-search";
    controls.innerHTML = `<label for="launchChooserSearch">Search ${kind}</label><div class="launch-chooser-search-row"><input id="launchChooserSearch" type="search" placeholder="Search ${kind}…" autocomplete="off" spellcheck="false"><button type="button" class="outline-btn" data-clear-search>Clear</button></div><p role="status" aria-live="polite" data-search-status></p>`;
    options.before(controls);
    const input = controls.querySelector("input");
    const clear = controls.querySelector("[data-clear-search]");
    const status = controls.querySelector("[data-search-status]");
    const normalize = value => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("en");
    const cards = [...options.children].map(button => ({
      button,
      text: normalize(button.querySelector("strong").textContent + " " + button.querySelector("small").textContent)
    }));
    const pageSize = 8;
    let page = Math.floor(Math.max(0, cards.findIndex(({button}) => button.getAttribute('aria-pressed') === 'true')) / pageSize);
    const pager = document.createElement('nav');
    pager.className = 'launch-chooser-pages';
    pager.setAttribute('aria-label', `${kind} pages`);
    options.after(pager);
    const filter = () => {
      const terms = normalize(input.value).trim().split(/\s+/).filter(Boolean);
      const matches = cards.filter(({text}) => terms.every(term => text.includes(term)));
      const count = matches.length;
      const pages = Math.max(1, Math.ceil(count / pageSize));
      page = Math.min(page, pages - 1);
      cards.forEach(({button}) => { button.hidden = true; });
      matches.slice(page * pageSize, (page + 1) * pageSize).forEach(({button}) => {
        button.hidden = false;
        button.querySelectorAll('img[data-chooser-src]').forEach(image => {
          image.src = image.dataset.chooserSrc;
          image.removeAttribute('data-chooser-src');
        });
      });
      pager.hidden = !count;
      pager.innerHTML = `<button type="button" class="outline-btn" data-chooser-page="-1" ${page === 0 ? 'disabled' : ''}>Previous</button><span role="status">Page ${page + 1} of ${pages}</span><button type="button" class="outline-btn" data-chooser-page="1" ${page === pages - 1 ? 'disabled' : ''}>Next</button>`;
      clear.disabled = !input.value;
      status.textContent = count ? `${count} of ${cards.length} ${kind}` : `No matching ${kind}. Try another search or clear it.`;
    };
    pager.addEventListener('click', event => {
      const button = event.target.closest('[data-chooser-page]');
      if (!button || button.disabled) return;
      page = Math.max(0, page + Number(button.dataset.chooserPage));
      filter();
      options.querySelector('button:not([hidden])')?.focus({preventScroll:true});
    });
    input.addEventListener("input", () => { page = 0; filter(); });
    clear.addEventListener("click", () => { input.value = ""; page = 0; filter(); input.focus(); });
    filter();
  }
  let guestMotion = true;
  let gearHideTimer;
  function settleGear(keyboard) {
    const gear = document.getElementById("launchSceneSettings");
    if (!gear) return;
    gear.focus({ preventScroll: true });
    if (keyboard) return; // Do not hide the control from a keyboard user.
    gear.classList.add("is-recent");
    clearTimeout(gearHideTimer);
    gearHideTimer = setTimeout(() => {
      if (!gear.isConnected || gear.getAttribute("aria-expanded") === "true") return;
      gear.classList.remove("is-recent");
      gear.classList.add("is-idle");
      if (document.activeElement === gear) gear.blur();
    }, 2500);
  }
  const settings = session => ({
    id: session.authenticated && scenes.some(scene => scene.id === session.homeScene?.id) ? session.homeScene.id : "original",
    motion: session.authenticated ? session.homeScene?.motion !== false : guestMotion,
    frame: session.authenticated && frames.some(frame => frame.id === session.homeScene?.frame) ? session.homeScene.frame : "none"
  });
  function frameArt(id, deferred = false) {
    const frame = frames.find(item => item.id === id) || frames[0];
    if (frame.decorative) return `<span class="scene-frame scene-frame-decorative" data-scene-frame="${frame.id}" aria-hidden="true"><img class="scene-frame-artwork" ${deferred ? 'data-chooser-src' : 'src'}="assets/scene-frame-${frame.id}.png" alt="" decoding="async"></span>`;
    return `<span class="scene-frame scene-frame-${frame.id}" data-scene-frame="${frame.id}" aria-hidden="true"><svg viewBox="0 0 320 320"><circle class="frame-track" cx="160" cy="160" r="153"/>${Array.from({ length: frame.id === "pearl" ? 48 : 12 }, (_, i) => {
      const angle = i * Math.PI * 2 / (frame.id === "pearl" ? 48 : 12);
      return `<circle class="frame-gem" cx="${160 + 153 * Math.cos(angle)}" cy="${160 + 153 * Math.sin(angle)}" r="${frame.id === "pearl" ? 5 : 2.5}"/>`;
    }).join("")}</svg></span>`;
  }
  function framedArtwork(scene, video, preview = true) {
    return `<div class="launch-scene-stage">${artwork(scene.id, scene.motion, video, preview)}${frameArt(scene.frame)}</div>`;
  }
  function artwork(id, motion, video, preview = false) {
    const scene = scenes.find(item => item.id === id) || scenes[0];
    const paused = !motion || reduced.matches;
    const content = scene.image
      ? `<img class="launch-scene-image" src="${scene.image}" alt="${scene.name}" decoding="async"><span class="launch-scene-particles" aria-hidden="true">${Array.from({ length: 9 }, (_, index) => `<i style="--n:${index};--x:${9 + (index * 19) % 84}%;--y:${12 + (index * 23) % 72}%"></i>`).join("")}</span>`
      : `<video class="launch-scene-video" ${paused ? "" : "autoplay"} muted loop playsinline preload="metadata" aria-label="Mr. Nieves and Colt classroom video"><source ${preview ? "src" : "data-src"}="${video}?v=20260905-profile-optimized1" type="video/mp4"></video>`;
    const coins = scene.id === "pixel" ? `<span class="scene-coin-layer" aria-hidden="true">${[[56.6, 46.9, 2.3], [50.5, 53.1, 2.5], [53.3, 64.1, 3.1], [58.4, 71.9, 3.8]].map(([x, y, size], index) => `<span class="scene-pixel-coin" style="left:${x}%;top:${y}%;width:${size}%;--coin-delay:${index * -.45}s"><svg viewBox="0 0 12 16" shape-rendering="crispEdges"><path fill="#8d4000" d="M4 0h4v1h2v2h1v2h1v6h-1v2h-1v2H8v1H4v-1H2v-2H1v-2H0V5h1V3h1V1h2Z"/><path fill="#ffd12f" d="M4 1h4v1h2v3h1v6h-1v3H8v1H4v-1H2v-3H1V5h1V2h2Z"/><path fill="#ffef85" d="M4 2h3v1H4v10H3V4h1Z"/><path fill="#ed8b06" d="M8 3h1v10H7v1H5v-1h2V4h1Z"/><path fill="#ffef85" d="M5 4h1v7H5Z"/></svg></span>`).join("")}</span>` : "";
    return `<div class="school-photo launch-scene scene-${scene.id}${paused ? " is-paused" : ""}" data-scene="${scene.id}" data-motion="${motion}">${content}${coins}</div>`;
  }
  function render(session, video, sessionReady = true) {
    // Do not create or fetch the default video before the saved account choice is known.
    if (!sessionReady) return `<section class="home-feature home-scene-feature" aria-busy="true"><div class="school-photo launch-scene scene-loading" role="status">Loading your scene…</div></section>`;
    const scene = settings(session);
    return `<section class="home-feature home-scene-feature">
      <div class="launch-scene-stage">${artwork(scene.id, scene.motion, video)}${frameArt(scene.frame)}
      <button type="button" id="launchSceneSettings" class="launch-scene-settings" aria-label="Scene settings" title="Scene settings" aria-expanded="false" aria-controls="launchSceneMenu" popovertarget="launchSceneMenu"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 3-.6 2.4-2 .9-2.2-.7-2 3.4 1.7 1.7v2.6L2.2 15l2 3.4 2.2-.7 2 .9L9 21h4l.6-2.4 2-.9 2.2.7 2-3.4-1.7-1.7v-2.6L19.8 9l-2-3.4-2.2.7-2-.9L13 3Z"/><circle cx="11" cy="12" r="3"/></svg></button>
      </div><div id="launchSceneMenu" class="launch-scene-controls" popover="auto" aria-label="Scene settings">
        ${session.authenticated ? '<button type="button" id="chooseLaunchScene">Choose scene</button>' : ""}
        ${session.authenticated ? '<button type="button" id="chooseLaunchFrame">Choose frame</button>' : ""}
        <button type="button" id="toggleLaunchScene" aria-pressed="${!scene.motion}">${reduced.matches ? "Motion reduced" : scene.motion ? "Pause scene" : "Resume scene"}</button>
      </div><span id="launchSceneStatus" class="launch-scene-status" role="status"></span>
    </section>`;
  }
  async function save(value) {
    const response = await fetch("/api/home-scene", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not save your scene. Please try again.");
    return result.session;
  }
  function attach(session, video, onSave) {
    // A navigation or background refresh must not leave an orphaned dialog.
    document.querySelector(".launch-scene-dialog")?.remove();
    const toggle = document.getElementById("toggleLaunchScene");
    if (!toggle) return;
    const gear = document.getElementById("launchSceneSettings");
    const menu = document.getElementById("launchSceneMenu");
    clearTimeout(gearHideTimer);
    const revealGear = () => gear.classList.remove("is-idle");
    gear.closest(".launch-scene-stage").addEventListener("pointermove", revealGear);
    gear.closest(".launch-scene-stage").addEventListener("pointerdown", revealGear);
    gear.addEventListener("focus", revealGear);
    menu.addEventListener("beforetoggle", event => {
      if (event.newState === "open") {
        clearTimeout(gearHideTimer);
        gear.classList.remove("is-idle", "is-recent");
        const rect = gear.getBoundingClientRect();
        menu.style.left = `${Math.max(8, Math.min(rect.right - 190, window.innerWidth - 198))}px`;
        menu.style.top = `${Math.max(8, Math.min(rect.top - 154, window.innerHeight - 162))}px`;
      }
      gear.setAttribute("aria-expanded", String(event.newState === "open"));
    });
    toggle.disabled = reduced.matches;
    toggle.addEventListener("click", async () => {
      menu.hidePopover();
      gear.focus();
      const next = settings(session);
      next.motion = !next.motion;
      toggle.disabled = true;
      const status = document.getElementById("launchSceneStatus");
      try {
        if (session.authenticated) onSave(await save(next));
        else {
          guestMotion = next.motion;
          const root = document.querySelector(".home-scene-feature");
          root.outerHTML = render(session, video);
          attach(session, video, onSave);
          const player = document.querySelector('.home-scene-feature video');
          if (player) { player.querySelector('source').src = `${video}?v=20260905-profile-optimized1`; player.load(); }
        }
        document.getElementById("launchSceneSettings")?.focus();
      } catch (error) { status.textContent = error.message; toggle.disabled = reduced.matches; }
    });
    document.getElementById("chooseLaunchScene")?.addEventListener("click", () => {
      menu.hidePopover();
      const draft = settings(session);
      const dialog = document.createElement("dialog");
      dialog.className = "launch-scene-dialog";
      dialog.setAttribute("aria-labelledby", "launchSceneTitle");
      dialog.innerHTML = `<div class="launch-scene-dialog-heading"><div><span class="feature-kicker">Your own little world</span><h2 id="launchSceneTitle">Choose your Launchpad scene</h2></div><button type="button" class="outline-btn" data-scene-close aria-label="Close scene chooser">✕</button></div>
        <p>Only your homepage changes. Your profile picture and classmates’ pages stay the same.</p>
        <div id="launchScenePreview">${framedArtwork(draft, video)}</div>
        <div class="launch-scene-options">${alphabetically(scenes).map(scene => `<button type="button" data-scene-choice="${scene.id}" aria-pressed="${draft.id === scene.id}">${scene.image ? `<img data-chooser-src="${scene.image}" alt="" loading="lazy">` : '<span class="scene-original-thumb" aria-hidden="true">▶</span>'}<strong>${scene.name}</strong><small>${scene.description}</small></button>`).join("")}</div>
        <label class="launch-scene-motion"><input type="checkbox" id="launchSceneMotion" ${draft.motion ? "checked" : ""}> Gentle effects (or original video playback)</label>
        <p class="launch-scene-hint">Scene artwork stays still; only the silent effects move inside the circle. Reduced-motion preferences are always respected.</p>
        <p id="launchSceneSaveStatus" role="status"></p><div class="launch-scene-dialog-actions"><button type="button" class="outline-btn" data-scene-close>Cancel</button><button type="button" class="primary-btn" id="saveLaunchScene">Save Scene</button></div>`;
      document.body.append(dialog);
      const close = () => { dialog.close(); dialog.remove(); document.getElementById("launchSceneSettings")?.focus(); };
      dialog.querySelectorAll("[data-scene-close]").forEach(button => button.addEventListener("click", close));
      dialog.addEventListener("cancel", event => { event.preventDefault(); close(); });
      const refreshPreview = () => { dialog.querySelector("#launchScenePreview").innerHTML = framedArtwork(draft, video); };
      dialog.querySelectorAll("[data-scene-choice]").forEach(button => button.addEventListener("click", () => {
        draft.id = button.dataset.sceneChoice;
        dialog.querySelectorAll("[data-scene-choice]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
        refreshPreview();
      }));
      dialog.querySelector("#launchSceneMotion").addEventListener("change", event => { draft.motion = event.target.checked; refreshPreview(); });
      attachChooserSearch(dialog, "scenes");
      dialog.querySelector("#saveLaunchScene").addEventListener("click", async event => {
        const keyboard = event.detail === 0;
        const button = dialog.querySelector("#saveLaunchScene");
        button.disabled = true;
        dialog.querySelector("#launchSceneSaveStatus").textContent = "Saving your scene…";
        try { const updated = await save(draft); close(); onSave(updated); settleGear(keyboard); }
        catch (error) { dialog.querySelector("#launchSceneSaveStatus").textContent = error.message; button.disabled = false; }
      });
      dialog.showModal();
    });
    document.getElementById("chooseLaunchFrame")?.addEventListener("click", () => {
      menu.hidePopover();
      const draft = settings(session);
      const dialog = document.createElement("dialog");
      dialog.className = "launch-scene-dialog launch-frame-dialog";
      dialog.setAttribute("aria-labelledby", "launchFrameTitle");
      const image = scenes.find(scene => scene.id === draft.id)?.image;
      dialog.innerHTML = `<div class="launch-scene-dialog-heading"><div><span class="feature-kicker">Make it yours</span><h2 id="launchFrameTitle">Choose your scene frame</h2></div><button type="button" class="outline-btn" data-frame-close aria-label="Close frame chooser">✕</button></div>
        <p>Every frame fits every scene. Your scene, effects, and small profile-picture frame stay unchanged.</p>
        <div id="launchScenePreview">${framedArtwork(draft, video)}</div>
        <div class="launch-scene-options launch-frame-options">${alphabetically(frames).map(frame => `<button type="button" data-frame-choice="${frame.id}" aria-pressed="${draft.frame === frame.id}"><span class="frame-swatch">${image ? `<img data-chooser-src="${image}" alt="" decoding="async">` : '<span class="scene-original-thumb" aria-hidden="true">▶</span>'}${frameArt(frame.id, true)}</span><strong>${frame.name}</strong><small>${frame.description}</small></button>`).join("")}</div>
        <p id="launchFrameSaveStatus" role="status"></p><div class="launch-scene-dialog-actions"><button type="button" class="outline-btn" data-frame-close>Cancel</button><button type="button" class="primary-btn" id="saveLaunchFrame">Save frame</button></div>`;
      document.body.append(dialog);
      const close = () => { dialog.close(); dialog.remove(); document.getElementById("launchSceneSettings")?.focus(); };
      dialog.querySelectorAll("[data-frame-close]").forEach(button => button.addEventListener("click", close));
      dialog.addEventListener("cancel", event => { event.preventDefault(); close(); });
      dialog.querySelectorAll("[data-frame-choice]").forEach(button => button.addEventListener("click", () => {
        draft.frame = button.dataset.frameChoice;
        dialog.querySelectorAll("[data-frame-choice]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
        dialog.querySelector("#launchScenePreview").innerHTML = framedArtwork(draft, video);
      }));
      dialog.querySelector("#saveLaunchFrame").addEventListener("click", async event => {
        const keyboard = event.detail === 0;
        event.currentTarget.disabled = true;
        dialog.querySelector("#launchFrameSaveStatus").textContent = "Saving your frame…";
        try { const updated = await save(draft); close(); onSave(updated); settleGear(keyboard); }
        catch (error) { dialog.querySelector("#launchFrameSaveStatus").textContent = error.message; dialog.querySelector("#saveLaunchFrame").disabled = false; }
      });
      attachChooserSearch(dialog, "frames");
      dialog.showModal();
    });
  }
  reduced.addEventListener("change", () => {
    document.querySelectorAll(".launch-scene").forEach(element => {
      const paused = reduced.matches || element.dataset.motion === "false";
      element.classList.toggle("is-paused", paused);
      const video = element.querySelector("video");
      if (video) { video.autoplay = !paused; if (paused) video.pause(); else video.play().catch(() => {}); }
    });
    const button = document.getElementById("toggleLaunchScene");
    if (button) { button.disabled = reduced.matches; button.textContent = reduced.matches ? "Motion reduced" : button.getAttribute("aria-pressed") === "true" ? "Resume scene" : "Pause scene"; }
  });
  window.LaunchpadScenes = { render, attach };
})();
