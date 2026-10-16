(() => {
  const choices = [['none', 'No banner'], ['colt', 'Colt Pride'], ['neon', 'Neon Studio'], ['cosmic', 'Cosmic Ribbon'], ['horizon', 'Soft Horizon'], ['ocean', 'Ocean Pearl'], ['laurel', 'Royal Laurel'], ['sakura', 'Sakura Bloom'], ['grove', 'Enchanted Forest'], ['autumn', 'Autumn Harvest']];
  const isCustom = value => typeof value === 'string' && /^custom-[a-f0-9]{64}-[0-9]{13}(?:-(?:full|half))?$/.test(value);
  const normalize = value => isCustom(value) || choices.some(([id]) => id === value) ? value : 'none';
  choices.push(['blue-fire', 'Blue Fire'], ['rainbow-fire', 'Rainbow Fire'], ['nugget-party', 'Nugget Party']);
  choices.push(['storm', 'Storm Crystal'], ['clockwork', 'Clockwork Brass'], ['moon-garden', 'Moonlit Garden']);
  choices.push(...[["anime-rooftops","Anime Rooftops"],["chapel-light","Chapel Light"],["sunlit-peaks","Sunlit Peaks"],["saturn-dream","Saturn Dream"],["winter-crystal","Winter Crystal"],["honey-meadow","Honey Meadow"],["midnight-melody","Midnight Melody"],["paint-play","Paint Play"],["dragon-valley","Dragon Valley"],["butterfly-dream","Butterfly Dream"],["rainbow-clouds","Rainbow Clouds"],["harbor-lights","Harbor Lights"],["carnival-glow","Carnival Glow"],["robot-city","Robot City"],["storybook-nook","Storybook Nook"],["stadium-spirit","Stadium Spirit"]]);
  choices.push(...[["patriotic-pride","Patriotic Pride"],["angelic-peace","Angelic Peace"],["highland-haven","Highland Haven"],["dumpling-delight","Dumpling Delight"],["prehistoric-jungle","Prehistoric Jungle"],["mermaid-lagoon","Mermaid Lagoon"],["frontier-sunset","Frontier Sunset"],["strawberry-picnic","Strawberry Picnic"]]);
  choices.push(...[["capybara-springs","Capybara Springs"],["lavender-cottage","Lavender Cottage"],["sunflower-meadow","Sunflower Meadow"],["ninja-dojo","Ninja Dojo"],["enchanted-mushrooms","Enchanted Mushrooms"],["polar-penguins","Polar Penguins"],["royal-peacock","Royal Peacock"],["dragon-treasure","Dragon Treasure"]]);
  // Keep saved IDs compatible while replacing circular scenes with original wide artwork.
  const sceneBanners = {
    'disney-twilight-boulevard': ['Disney-inspired • Starlight Kingdom'],
    'disney-agrabah': ['Disney • Agrabah Palace'],
    'disney-pride-rock': ['Disney-inspired • Savannah Sunrise'],
    'anime-hidden-leaf': ['Anime • Hidden Leaf Village'],
    'anime-kame-island': ['Disney-inspired • Tropical Cottage'],
    'anime-cherry-village': ['Anime-inspired • Moonlit Sakura'],
    'anime-walled-city': ['Anime • Walled City']
  };
  choices.push(...Object.entries(sceneBanners).map(([id, [title]]) => [id, title]));
  const cover = value => {
    // Additional themed covers share the existing crop and preview behavior.
    const id = normalize(value);
    if (isCustom(id)) return `<div class="profile-banner-cover profile-banner-custom" data-custom-layout="${id.endsWith('-half') ? 'half' : id.endsWith('-full') ? 'full' : 'legacy'}" aria-hidden="true"><img src="/api/profile-banner-image/${id}" alt="" loading="lazy"></div>`;
    const scene = sceneBanners[id];
    const source = scene ? `assets/profile-banner-${id}-wide.png${id === 'anime-hidden-leaf' ? '?v=20261005-hidden-leaf-v2' : ''}` : `assets/profile-banner-${id}.png`;
    return id === 'none' ? '' : `<div class="profile-banner-cover${scene ? ' profile-banner-panorama' : ''}" data-banner="${id}" aria-hidden="true"><img src="${source}" alt="" loading="lazy"></div>`;
  };
  function open({ selected, avatar, name, role, save, onSave }) {
    document.querySelector('.profile-banner-dialog')?.remove();
    let draft = normalize(selected);
    let saving = false;
    let preparing = false;
    let uploaded = null;
    let sourceImage = null;
    let customDraft = null;
    let useUpload = false;
    const dialog = document.createElement('dialog');
    dialog.className = 'profile-banner-dialog launch-scene-dialog';
    dialog.setAttribute('aria-labelledby', 'profileBannerTitle');
    const preview = () => `<div class="profile-banner-card">${useUpload && customDraft ? `<div class="profile-banner-cover profile-banner-custom" data-custom-layout="${customDraft.layout}"><img src="${customDraft.image}" alt="Custom banner preview"></div>` : cover(draft)}<div class="profile-banner-identity">${avatar}<div><strong>${name}</strong><span>${role}</span></div></div></div>`;
    dialog.innerHTML = `<div class="launch-scene-dialog-heading"><h2 id="profileBannerTitle">Choose your profile banner</h2><button type="button" class="outline-btn" data-banner-close aria-label="Close banner chooser">✕</button></div><p>Your Colt Corner cover. Your picture, avatar frame, and homepage scene stay unchanged.</p><div id="profileBannerPreview">${preview()}</div><div class="profile-banner-options">${choices.map(([id, title]) => `<button type="button" data-banner-choice="${id}" aria-pressed="${id === draft}">${id === 'none' ? '<span class="profile-banner-blank">Simple & clean</span>' : cover(id)}<strong>${title}</strong></button>`).join('')}</div><p id="profileBannerStatus" role="status"></p><div class="launch-scene-dialog-actions"><button type="button" class="outline-btn" data-banner-close>Cancel</button><button type="button" class="primary-btn" id="saveProfileBanner">Save banner</button></div>`;
    document.body.append(dialog);
    const editor = document.createElement('section');
    editor.className = 'custom-banner-editor';
    editor.innerHTML = `<h3>Your own image</h3><p>Choose a school-appropriate JPG, PNG, or WebP (up to 10 MB). Premade banners below are always available.</p><label for="customBannerFile">Upload an image</label><input id="customBannerFile" type="file" accept="image/jpeg,image/png,image/webp"><div id="customBannerControls" hidden><label for="customBannerLayout">Layout</label><select id="customBannerLayout"><option value="full">Full banner</option><option value="framed">Half image (fade on the left)</option></select><div id="customBannerCrop"><label for="customBannerX">Horizontal position</label><input id="customBannerX" type="range" min="0" max="100" value="50"><label for="customBannerY">Vertical position</label><input id="customBannerY" type="range" min="0" max="100" value="50"><label for="customBannerZoom">Zoom</label><input id="customBannerZoom" type="range" min="1" max="3" step="0.05" value="1"></div><button type="button" class="outline-btn" id="useCustomBanner">Use this image</button></div><p id="customBannerQuality" role="status" aria-live="polite"></p><button type="button" class="outline-btn" id="removeCustomBanner">Remove banner</button>`;
    dialog.querySelector('#profileBannerPreview').after(editor);
    const quality = editor.querySelector('#customBannerQuality');
    const encodeSource = image => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#202124'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (const q of [.85, .65, .45, .25]) {
        const data = canvas.toDataURL('image/jpeg', q);
        if (data.length <= 950000) return data;
      }
      throw new Error('This image has too much detail. Choose a smaller image.');
    };
    const drawUpload = () => {
      if (!uploaded || saving) return;
      const canvas = document.createElement('canvas');
      canvas.width = 1200; canvas.height = 400;
      const ctx = canvas.getContext('2d');
      const framed = editor.querySelector('#customBannerLayout').value === 'framed';
      editor.querySelector('#customBannerCrop').hidden = false;
      ctx.fillStyle = '#202124'; ctx.fillRect(0, 0, 1200, 400);
      let scale;
      const imageWidth = framed ? 720 : 1200;
      const imageLeft = 1200 - imageWidth;
      scale = Math.max(imageWidth / uploaded.width, 400 / uploaded.height) * Number(editor.querySelector('#customBannerZoom').value);
      const w = uploaded.width * scale, h = uploaded.height * scale;
      ctx.save(); ctx.beginPath(); ctx.rect(imageLeft,0,imageWidth,400); ctx.clip();
      ctx.drawImage(uploaded, imageLeft+(imageWidth-w)*Number(editor.querySelector('#customBannerX').value)/100, (400-h)*Number(editor.querySelector('#customBannerY').value)/100, w, h);
      ctx.restore();
      // Apply the fade in CSS so saved banners follow each viewer's theme.
      let image = canvas.toDataURL('image/jpeg', .85);
      if (image.length > 950000) image = canvas.toDataURL('image/jpeg', .65);
      customDraft = {image, sourceImage, layout: framed ? 'half' : 'full'}; useUpload = true;
      quality.textContent = scale > 1.15 ? 'This crop may look blurry. Reduce the zoom or choose a larger picture (1200 × 400 or larger recommended).' : 'This image has enough detail for the current crop.';
      dialog.querySelectorAll('[data-banner-choice]').forEach(b => b.setAttribute('aria-pressed','false'));
      dialog.querySelector('#profileBannerPreview').innerHTML = preview();
    };
    editor.querySelectorAll('select, input[type="range"]').forEach(el => el.addEventListener('input', drawUpload));
    editor.querySelector('#useCustomBanner').addEventListener('click', drawUpload);
    editor.querySelector('#removeCustomBanner').addEventListener('click', () => {
      if (saving || preparing) return;
      useUpload = false; customDraft = null; uploaded = null; sourceImage = null; draft = 'none';
      editor.querySelector('#customBannerControls').hidden = true;
      editor.querySelector('#customBannerFile').value = '';
      quality.textContent = '';
      dialog.querySelectorAll('[data-banner-choice]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.bannerChoice === 'none')));
      dialog.querySelector('#profileBannerPreview').innerHTML = preview();
      dialog.querySelector('#profileBannerStatus').textContent = 'Banner removed from preview. Select Save banner to keep this change.';
    });
    editor.querySelector('#customBannerFile').addEventListener('change', async event => {
      const file = event.target.files[0];
      if (!file || saving || preparing) return;
      preparing = true;
      dialog.querySelector('#saveProfileBanner').disabled = true;
      event.target.disabled = true;
      quality.textContent = 'Preparing your image…';
      let url;
      try {
        if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Choose a JPG, PNG, or WebP image.');
        if (file.size > 10*1024*1024) throw new Error('Choose an image smaller than 10 MB.');
        url = URL.createObjectURL(file);
        const image = new Image(); image.src = url; await image.decode();
        if (image.width*image.height > 40000000) throw new Error('That image is too large. Resize it to under 40 megapixels first.');
        if (image.width < 160 || image.height < 100) throw new Error('This image is too tiny for a banner. Choose one at least 160 × 100 pixels.');
        if (!dialog.isConnected) return;
        const encoded = encodeSource(image);
        uploaded = image; sourceImage = encoded;
        editor.querySelector('#customBannerControls').hidden = false;
        editor.querySelector('#customBannerLayout').value = image.width < 900 || image.height < 300 ? 'framed' : 'full';
        editor.querySelector('#customBannerX').value = editor.querySelector('#customBannerY').value = 50;
        editor.querySelector('#customBannerZoom').value = 1;
        drawUpload();
      } catch (error) { quality.textContent = error.message; }
      finally {
        if (url) URL.revokeObjectURL(url);
        preparing = false; event.target.disabled = false; event.target.value = '';
        dialog.querySelector('#saveProfileBanner').disabled = false;
      }
    });
    const pageSize = 6;
    let page = Math.floor(Math.max(0, choices.findIndex(([id]) => id === draft)) / pageSize);
    const pageCount = Math.ceil(choices.length / pageSize);
    const cards = [...dialog.querySelectorAll('[data-banner-choice]')];
    const pager = document.createElement('nav');
    pager.className = 'profile-picker-pages';
    pager.setAttribute('aria-label', 'Banner pages');
    dialog.querySelector('.profile-banner-options').after(pager);
    const showPage = () => {
      cards.forEach((card, index) => { card.hidden = Math.floor(index / pageSize) !== page; });
      pager.innerHTML = `<button type="button" class="outline-btn" data-banner-page="-1" ${page === 0 ? 'disabled' : ''}>Previous</button><span role="status">Page ${page + 1} of ${pageCount}</span><button type="button" class="outline-btn" data-banner-page="1" ${page === pageCount - 1 ? 'disabled' : ''}>Next</button>`;
    };
    pager.addEventListener('click', event => {
      const button = event.target.closest('[data-banner-page]');
      if (!button || button.disabled || saving) return;
      page = Math.max(0, Math.min(pageCount - 1, page + Number(button.dataset.bannerPage)));
      showPage();
      cards[page * pageSize]?.focus({preventScroll:true});
    });
    showPage();
    const close = () => { if (saving) return; dialog.close(); dialog.remove(); document.getElementById('changeProfileBanner')?.focus(); };
    dialog.querySelectorAll('[data-banner-close]').forEach(button => button.addEventListener('click', close));
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    dialog.querySelectorAll('[data-banner-choice]').forEach(button => button.addEventListener('click', () => {
      if (saving || preparing) return;
      useUpload = false;
      draft = button.dataset.bannerChoice;
      dialog.querySelectorAll('[data-banner-choice]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      dialog.querySelector('#profileBannerPreview').innerHTML = preview();
    }));
    dialog.querySelector('#saveProfileBanner').addEventListener('click', async () => {
      if (saving || preparing) return;
      saving = true;
      dialog.querySelectorAll('button, input, select').forEach(button => { button.disabled = true; });
      dialog.querySelector('#profileBannerStatus').textContent = 'Saving your banner…';
      try {
        const result = await save(useUpload ? customDraft : draft);
        saving = false; close(); onSave(result);
        document.getElementById('changeProfileBanner')?.focus();
      } catch (error) {
        saving = false;
        dialog.querySelector('#profileBannerStatus').textContent = error.message;
        dialog.querySelectorAll('button, input, select').forEach(button => { button.disabled = false; });
        showPage();
      }
    });
    dialog.showModal();
    if (isCustom(draft)) {
      const savedId = draft;
      preparing = true;
      editor.querySelector('#customBannerControls').hidden = false;
      editor.querySelector('#customBannerLayout').value = savedId.endsWith('-half') ? 'framed' : 'full';
      editor.querySelectorAll('input, select, button').forEach(el => { el.disabled = true; });
      dialog.querySelector('#saveProfileBanner').disabled = true;
      quality.textContent = 'Loading your saved image…';
      (async () => {
        try {
          let image = new Image();
          image.src = `/api/profile-banner-source/${savedId}`;
          try { await image.decode(); }
          catch {
            image = new Image(); image.src = `/api/profile-banner-image/${savedId}`;
            await image.decode();
            if (savedId.endsWith('-half')) {
              const crop = document.createElement('canvas'); crop.width = 720; crop.height = 400;
              crop.getContext('2d').drawImage(image, 480, 0, 720, 400, 0, 0, 720, 400);
              image = crop;
            }
          }
          if (!dialog.isConnected) return;
          sourceImage = encodeSource(image); uploaded = image;
          quality.textContent = 'Switch between Full banner and Half image, then select Save banner.';
        } catch {
          editor.querySelector('#customBannerControls').hidden = true;
          quality.textContent = 'Your saved image could not be loaded. Try reopening the chooser or upload an image.';
        } finally {
          preparing = false;
          editor.querySelectorAll('input, select, button').forEach(el => { el.disabled = false; });
          dialog.querySelector('#saveProfileBanner').disabled = false;
        }
      })();
    }
  }
  window.ProfileBanners = { normalize, cover, open };
  choices.push(['honeybee','Honeybee Garden'], ['volcanic','Volcanic Forge'], ['aurora','Arctic Aurora']);
  choices.sort(([a, nameA], [b, nameB]) => a === 'none' ? -1 : b === 'none' ? 1 : nameA.localeCompare(nameB, 'en', { sensitivity: 'base' }));
})();
