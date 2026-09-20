(function (root) {
  'use strict';
  // IDs and row order are stable: each row maps to the six-column artwork atlas.
  const rows = [
    ['Sports', ['trophy','Gold Trophy'], ['basketball','Basketball'], ['soccer','Soccer Ball'], ['baseball','Baseball & Glove'], ['helmet','Colt Football Helmet'], ['medal','Gold Medal']],
    ['Space', ['astronaut','Astronaut'], ['rocket','Rocket'], ['planet','Ringed Planet'], ['ufo','UFO'], ['alien','Friendly Alien'], ['moon','Moon Globe']],
    ['Creatures & Colt Pride', ['dragon','Baby Dragon'], ['dinosaur','Dinosaur'], ['owl','Owl'], ['turtle','Sea Turtle'], ['horse','Colt Horse'], ['horseshoe','Golden Horseshoe']],
    ['Technology', ['robot','Robot'], ['computer','Retro Computer'], ['controller','Game Controller'], ['arcade','Arcade Cabinet'], ['camera','Camera'], ['headphones','Headphones']],
    ['Nature', ['crystal','Amethyst Crystal'], ['bonsai','Bonsai Tree'], ['cactus','Cactus'], ['sunflower','Sunflower'], ['shell','Seashell'], ['butterfly','Butterfly Dome']],
    ['Culture, Faith & Books', ['mask','Mardi Gras Mask'], ['fleur','Fleur-de-lis'], ['crawfish','Crawfish'], ['church','Little Church'], ['cross','Golden Cross'], ['books','Book Stack']]
  ];
  const items = rows.flatMap(([category, ...entries], row) => entries.map(([id, name], column) => ({ id, name, category, row, column })));
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
  const ids = new Set(['none', ...items.map(item => item.id)]);
  const valid = value => !!value && typeof value.enabled === 'boolean' && Array.isArray(value.slots) && value.slots.length === 3 && value.slots.every(id => ids.has(id));
  const clean = value => valid(value) ? { enabled: value.enabled, slots: [...value.slots] } : { enabled: true, slots: ['horse', 'crystal', 'planet'] };
  const name = id => items.find(item => item.id === id)?.name || 'Empty spot';
  function sprite(id) {
    const item = items.find(item => item.id === id);
    if (!item) return '<span class="shelf-empty" aria-label="Empty spot"></span>';
    const [x,y,w,h] = bounds[item.row * 6 + item.column];
    const scale = 200 / Math.max(w,h);
    return `<svg class="shelf-object" role="img" aria-label="${item.name}" viewBox="0 0 220 220"><svg x="${(220-w*scale)/2}" y="${216-h*scale}" width="${w*scale}" height="${h*scale}" viewBox="${x} ${y} ${w} ${h}" overflow="hidden"><image href="assets/shelf-collectibles.png" width="1254" height="1254"/></svg></svg>`;
  }
  function art(value, interactive = false, active = 0) {
    const state = clean(value);
    return `<div class="collectible-shelf${interactive ? ' shelf-preview' : ''}"><div class="shelf-objects">${state.slots.map((id, index) => interactive
      ? `<button type="button" data-shelf-slot="${index}" aria-pressed="${index === active}" aria-label="${['Left','Middle','Right'][index]} spot: ${name(id)}">${sprite(id)}<span class="shelf-slot-label">${['Left','Middle','Right'][index]}</span></button>`
      : `<div class="shelf-display-slot">${sprite(id)}</div>`).join('')}</div><div class="shelf-board" aria-hidden="true"></div></div>`;
  }
  function render(session) {
    if (!session?.authenticated || !clean(session.homeShelf).enabled) return '';
    return `<section class="home-collectible-shelf" aria-label="Your collectible shelf">${art(session.homeShelf)}<button class="shelf-customize" type="button" data-action="collectibleShelf" aria-label="Customize your collectible shelf">Customize shelf</button></section>`;
  }
  function open({ selected, save, onSave }) {
    if (document.querySelector('.shelf-dialog')) return;
    let draft = clean(selected), active = 0, saving = false;
    const opener = document.activeElement;
    const dialog = document.createElement('dialog');
    dialog.className = 'launch-scene-dialog shelf-dialog';
    dialog.setAttribute('aria-labelledby', 'shelfTitle');
    dialog.innerHTML = `<div class="launch-scene-dialog-heading"><h2 id="shelfTitle">Your collectible shelf</h2><button type="button" class="outline-btn" data-shelf-close aria-label="Close shelf chooser">✕</button></div><p>Pick a spot, then choose its collectible. Your shelf is personal to your account.</p><div id="shelfPreview"></div><label class="shelf-show"><input id="shelfEnabled" type="checkbox" ${draft.enabled ? 'checked' : ''}> Show shelf on my homepage</label><div class="shelf-filters"><label>Search objects<input id="shelfSearch" type="search" placeholder="Search 36 collectibles…" autocomplete="off"></label><label>Category<select id="shelfCategory"><option value="">All categories</option>${rows.map(([category]) => `<option>${category}</option>`).join('')}</select></label></div><p id="shelfResults" role="status"></p><div id="shelfChoices" class="shelf-choice-grid"></div><p id="shelfSaveStatus" role="status"></p><div class="launch-scene-dialog-actions shelf-dialog-actions"><button type="button" class="outline-btn" data-shelf-close>Cancel</button><button type="button" class="primary-btn" id="saveShelf">Save shelf</button></div>`;
    document.body.append(dialog);
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
    dialog.querySelector('#shelfCategory').addEventListener('change', update);
    dialog.querySelector('#shelfEnabled').addEventListener('change', event => { draft.enabled = event.target.checked; });
    const close = () => {
      if (saving) return;
      dialog.close(); dialog.remove();
      if (opener?.isConnected) opener.focus();
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
        saving = false; close(); onSave(result);
      } catch (error) {
        saving = false;
        dialog.querySelectorAll('button,input,select').forEach(control => { control.disabled = false; });
        dialog.querySelector('#shelfSaveStatus').textContent = error.message || 'Could not save. Please try again.';
      }
    });
    update(); dialog.showModal();
  }
  const api = { items, valid, clean, render, open, art };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CollectibleShelf = api;
})(typeof window !== 'undefined' ? window : globalThis);
