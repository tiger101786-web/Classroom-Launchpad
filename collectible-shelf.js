(function (root) {
  'use strict';
  const themes = [
    {id:'crimson',name:'Crimson Original'},
    {id:'amethyst',name:'Amethyst Crystal'},
    {id:'temple',name:'Ancient Temple'},
    {id:'celestial',name:'Celestial Night'},
    {id:'blossom',name:'Cherry Blossom'},
    {id:'dragon',name:'Dragon Obsidian'},
    {id:'forest',name:'Enchanted Forest'},
    {id:'ice',name:'Frost Crystal'},
    {id:'halloween',name:'Halloween Glow'},
    {id:'mardi-gras',name:'Mardi Gras'},
    {id:'ocean',name:'Ocean Pearl'},
    {id:'royal',name:'Royal Gold'},
    {id:'steampunk',name:'Steampunk Brass'}
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
    ["Animal Friends",["capybara","Capybara Figurine"],["otter","Otter Figurine"],["frog-prince","Frog Prince"],["sleeping-cat","Sleeping Cat"],["hummingbird","Hummingbird Sculpture"]],
    ["Miniature Treasures",["gumball-machine","Mini Gumball Machine"],["retro-radio","Mini Retro Radio"],["typewriter","Mini Typewriter"],["lava-lamp","Mini Lava Lamp"],["rotary-phone","Mini Rotary Phone"]],
    ["Tiny Wonders",["seahorse","Seahorse Sculpture"],["kraken","Tiny Kraken"],["unicorn","Unicorn Figurine"],["wizard-hat","Wizard Hat Keepsake"],["dragon-egg","Dragon Egg"]],
    ["Sweet & Playful",["macaron-tower","Macaron Tower"],["honey-pot","Honey Pot"],["rubiks-cube","Puzzle Cube"],["nesting-doll","Nesting Doll"],["paperweight","Galaxy Paperweight"]],
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
    rumi: {source:'assets/shelf-rumi.png',width:1254,height:1254,bounds:[325,11,569,1242]},
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
    const scale = 200 / Math.max(w,h);
    return `<svg class="shelf-object" role="img" aria-label="${item.name}" viewBox="0 0 220 220"><svg x="${(220-w*scale)/2}" y="${216-h*scale}" width="${w*scale}" height="${h*scale}" viewBox="${x} ${y} ${w} ${h}" overflow="hidden"><image href="${source}" width="${asset?.width || 1254}" height="${asset?.height || 1254}"/></svg></svg>`;
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
    let draft = clean(selected), active = 0, saving = false;
    const opener = document.activeElement;
    const keyboard = !!opener?.matches(':focus-visible');
    const dialog = document.createElement('dialog');
    dialog.className = 'launch-scene-dialog shelf-dialog';
    dialog.setAttribute('aria-labelledby', 'shelfTitle');
    dialog.innerHTML = `<div class="launch-scene-dialog-heading"><h2 id="shelfTitle">Your collectible shelf</h2><button type="button" class="outline-btn" data-shelf-close aria-label="Close shelf chooser">✕</button></div><p>Pick a spot, then choose its collectible. Your shelf is personal to your account.</p><div id="shelfPreview"></div><label class="shelf-show"><input id="shelfEnabled" type="checkbox" ${draft.enabled ? 'checked' : ''}> Show shelf on my homepage</label><div class="shelf-filters"><label>Search objects<input id="shelfSearch" type="search" placeholder="Search 36 collectibles…" autocomplete="off"></label><label>Category<select id="shelfCategory"><option value="">All categories</option>${rows.map(([category]) => `<option>${category}</option>`).join('')}</select></label></div><p id="shelfResults" role="status"></p><div id="shelfChoices" class="shelf-choice-grid"></div><p id="shelfSaveStatus" role="status"></p><div class="launch-scene-dialog-actions shelf-dialog-actions"><button type="button" class="outline-btn" data-shelf-close>Cancel</button><button type="button" class="primary-btn" id="saveShelf">Save shelf</button></div>`;
    document.body.append(dialog);
    dialog.querySelector('#shelfPreview').insertAdjacentHTML('afterend', `<fieldset class="shelf-theme-picker"><legend>Choose your shelf</legend><div class="shelf-theme-grid">${themes.map(theme => `<button type="button" data-shelf-theme-choice="${theme.id}" aria-pressed="${draft.theme === theme.id}"><span class="collectible-shelf" data-shelf-theme="${theme.id}" aria-hidden="true"><span class="shelf-board"></span></span><strong>${theme.name}</strong></button>`).join('')}</div></fieldset>`);
    dialog.querySelector('#shelfSearch').placeholder = `Search ${items.length} collectibles…`;
    const preview = dialog.querySelector('#shelfPreview');
    const choices = dialog.querySelector('#shelfChoices');
    const update = () => {
      preview.innerHTML = art(draft, true, active);
      const terms = dialog.querySelector('#shelfSearch').value.toLowerCase().trim().split(/\s+/).filter(Boolean);
      const category = dialog.querySelector('#shelfCategory').value;
      const matches = items.filter(item => (!category || item.category === category) && terms.every(term => `${item.name} ${item.category}`.toLowerCase().includes(term))).sort((a,b) => a.name.localeCompare(b.name));
      choices.innerHTML = `<button type="button" data-shelf-item="none" aria-pressed="${draft.slots[active] === 'none'}"><span class="shelf-clear-art" aria-hidden="true">—</span><strong>Empty spot</strong></button>` + matches.map(item => `<button type="button" data-shelf-item="${item.id}" aria-pressed="${draft.slots[active] === item.id}">${sprite(item.id)}<strong>${item.name}</strong></button>`).join('');
      dialog.querySelector('#shelfResults').textContent = `${matches.length} collectibles · Choosing for the ${['left','middle','right'][active]} spot${matches.length ? '' : ' — try another search'}`;
    };
    preview.addEventListener('click', event => {
      const button = event.target.closest('[data-shelf-slot]');
      if (!button || saving) return;
      active = Number(button.dataset.shelfSlot); update();
      preview.querySelector(`[data-shelf-slot="${active}"]`).focus();
    });
    choices.addEventListener('click', event => {
      const button = event.target.closest('[data-shelf-item]');
      if (!button || saving) return;
      const id = button.dataset.shelfItem;
      draft.slots[active] = id; update();
      choices.querySelector(`[data-shelf-item="${id}"]`).focus();
    });
    dialog.querySelector('#shelfSearch').addEventListener('input', update);
    dialog.querySelector('.shelf-theme-picker').addEventListener('click', event => {
      const button = event.target.closest('[data-shelf-theme-choice]');
      if (!button || saving) return;
      draft.theme = button.dataset.shelfThemeChoice;
      dialog.querySelectorAll('[data-shelf-theme-choice]').forEach(choice => choice.setAttribute('aria-pressed',String(choice.dataset.shelfThemeChoice === draft.theme)));
      preview.innerHTML = art(draft,true,active);
    });
    dialog.querySelector('#shelfCategory').addEventListener('change', update);
    dialog.querySelector('#shelfEnabled').addEventListener('change', event => { draft.enabled = event.target.checked; });
    const close = () => {
      if (saving) return;
      dialog.close(); dialog.remove();
      if (opener?.closest('#shelfSettingsMenu')) restoreGear(keyboard);
      else if (opener?.isConnected) opener.focus();
      else document.querySelector('.header-account-summary')?.focus();
    };
    dialog.querySelectorAll('[data-shelf-close]').forEach(button => button.addEventListener('click', close));
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    dialog.querySelector('#saveShelf').addEventListener('click', async () => {
      saving = true;
      dialog.querySelectorAll('button,input,select').forEach(control => { control.disabled = true; });
      dialog.querySelector('#shelfSaveStatus').textContent = 'Saving your shelf…';
      try {
        const result = await save(clean(draft));
        saving = false; close(); onSave(result); restoreGear(keyboard);
      } catch (error) {
        saving = false;
        dialog.querySelectorAll('button,input,select').forEach(control => { control.disabled = false; });
        dialog.querySelector('#shelfSaveStatus').textContent = error.message || 'Could not save. Please try again.';
      }
    });
    update(); dialog.showModal();
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
