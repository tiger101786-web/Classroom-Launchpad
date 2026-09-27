(() => {
  const choices = [['none', 'No banner'], ['colt', 'Colt Pride'], ['neon', 'Neon Studio'], ['cosmic', 'Cosmic Ribbon'], ['horizon', 'Soft Horizon'], ['ocean', 'Ocean Pearl'], ['laurel', 'Royal Laurel'], ['sakura', 'Sakura Bloom'], ['grove', 'Enchanted Forest'], ['autumn', 'Autumn Harvest']];
  const normalize = value => choices.some(([id]) => id === value) ? value : 'none';
  choices.push(['storm', 'Storm Crystal'], ['clockwork', 'Clockwork Brass'], ['moon-garden', 'Moonlit Garden']);
  choices.push(...[["anime-rooftops","Anime Rooftops"],["chapel-light","Chapel Light"],["sunlit-peaks","Sunlit Peaks"],["saturn-dream","Saturn Dream"],["winter-crystal","Winter Crystal"],["honey-meadow","Honey Meadow"],["midnight-melody","Midnight Melody"],["paint-play","Paint Play"],["dragon-valley","Dragon Valley"],["butterfly-dream","Butterfly Dream"],["rainbow-clouds","Rainbow Clouds"],["harbor-lights","Harbor Lights"],["carnival-glow","Carnival Glow"],["robot-city","Robot City"],["storybook-nook","Storybook Nook"],["stadium-spirit","Stadium Spirit"]]);
  const cover = value => {
    // Additional themed covers share the existing crop and preview behavior.
    const id = normalize(value);
    return id === 'none' ? '' : `<div class="profile-banner-cover" data-banner="${id}" aria-hidden="true"><img src="assets/profile-banner-${id}.png" alt="" loading="lazy"></div>`;
  };
  function open({ selected, avatar, name, role, save, onSave }) {
    document.querySelector('.profile-banner-dialog')?.remove();
    let draft = normalize(selected);
    let saving = false;
    const dialog = document.createElement('dialog');
    dialog.className = 'profile-banner-dialog launch-scene-dialog';
    dialog.setAttribute('aria-labelledby', 'profileBannerTitle');
    const preview = () => `<div class="profile-banner-card">${cover(draft)}<div class="profile-banner-identity">${avatar}<div><strong>${name}</strong><span>${role}</span></div></div></div>`;
    dialog.innerHTML = `<div class="launch-scene-dialog-heading"><h2 id="profileBannerTitle">Choose your profile banner</h2><button type="button" class="outline-btn" data-banner-close aria-label="Close banner chooser">✕</button></div><p>Your Colt Corner cover. Your picture, avatar frame, and homepage scene stay unchanged.</p><div id="profileBannerPreview">${preview()}</div><div class="profile-banner-options">${choices.map(([id, title]) => `<button type="button" data-banner-choice="${id}" aria-pressed="${id === draft}">${id === 'none' ? '<span class="profile-banner-blank">Simple & clean</span>' : cover(id)}<strong>${title}</strong></button>`).join('')}</div><p id="profileBannerStatus" role="status"></p><div class="launch-scene-dialog-actions"><button type="button" class="outline-btn" data-banner-close>Cancel</button><button type="button" class="primary-btn" id="saveProfileBanner">Save banner</button></div>`;
    document.body.append(dialog);
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
      draft = button.dataset.bannerChoice;
      dialog.querySelectorAll('[data-banner-choice]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      dialog.querySelector('#profileBannerPreview').innerHTML = preview();
    }));
    dialog.querySelector('#saveProfileBanner').addEventListener('click', async () => {
      saving = true;
      dialog.querySelectorAll('button').forEach(button => { button.disabled = true; });
      dialog.querySelector('#profileBannerStatus').textContent = 'Saving your banner…';
      try {
        const result = await save(draft);
        saving = false; close(); onSave(result);
        document.getElementById('changeProfileBanner')?.focus();
      } catch (error) {
        saving = false;
        dialog.querySelector('#profileBannerStatus').textContent = error.message;
        dialog.querySelectorAll('button').forEach(button => { button.disabled = false; });
        showPage();
      }
    });
    dialog.showModal();
  }
  window.ProfileBanners = { normalize, cover, open };
  choices.push(['honeybee','Honeybee Garden'], ['volcanic','Volcanic Forge'], ['aurora','Arctic Aurora']);
  choices.sort(([a, nameA], [b, nameB]) => a === 'none' ? -1 : b === 'none' ? 1 : nameA.localeCompare(nameB, 'en', { sensitivity: 'base' }));
})();
