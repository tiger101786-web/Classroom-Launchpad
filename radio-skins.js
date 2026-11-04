(function () {
  'use strict';
  const stylesheetURL = new URL('radio-skins.css?v=20261103-hiphop-v1', document.currentScript.src).href;
  window.initializeColtRadioSkins = async function (panel) {
    if (panel.dataset.radioSkins) return;
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = stylesheetURL;
    await new Promise((resolve, reject) => {
      stylesheet.onload = resolve;
      stylesheet.onerror = () => { stylesheet.remove(); reject(new Error('Radio skin styles unavailable')); };
      document.head.append(stylesheet);
    });
    panel.dataset.radioSkins = 'true';
    const skins = [['original', 'Original'], ['inferno', 'Inferno Forge'], ['frostfang', 'Frostfang Citadel'], ['temple', 'Overgrown Temple'], ['nebula', 'Nebula Rider'], ['bayou', 'Bayou Nights'], ['hiphop', 'Hip-Hop DJ']];
    const key = 'coltRadioIllustratedSkin';
    const backdrop = document.createElement('div');
    backdrop.className = 'colt-radio-skin-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 10; i++) backdrop.append(document.createElement('span'));
    const gear = document.createElement('button');
    gear.type = 'button';
    gear.className = 'colt-radio-skin-gear';
    gear.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><defs><linearGradient id="radio-gear-metal" x2="0" y2="1"><stop stop-color="#fff"/><stop offset=".45" stop-color="#c8d3e1"/><stop offset="1" stop-color="#64748b"/></linearGradient></defs><path fill="url(#radio-gear-metal)" stroke="#ecf5ff" stroke-width=".65" stroke-linejoin="round" fill-rule="evenodd" d="M9.5 2h5l.65 3.05 1.5.87 2.97-.96 2.5 4.33-2.32 2.1v1.72l2.32 2.1-2.5 4.33-2.97-.96-1.5.87L14.5 22h-5l-.65-3.05-1.5-.87-2.97.96-2.5-4.33 2.32-2.1v-1.72l-2.32-2.1 2.5-4.33 2.97.96 1.5-.87L9.5 2ZM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';
    gear.setAttribute('aria-label', 'Change Colt Radio skin');
    gear.setAttribute('aria-haspopup', 'menu');
    gear.setAttribute('aria-expanded', 'false');
    const menu = document.createElement('div');
    menu.id = 'colt-radio-skin-menu';
    menu.className = 'colt-radio-skin-menu';
    menu.setAttribute('popover', 'auto');
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', 'Radio skins');
    gear.setAttribute('popovertarget', menu.id);
    gear.setAttribute('aria-controls', menu.id);
    const choices = skins.map(([value, label]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.radioSkinChoice = value;
      button.setAttribute('role', 'menuitemradio');
      button.innerHTML = '<span class="radio-skin-swatch" aria-hidden="true"></span><span></span><span class="radio-skin-check" aria-hidden="true">✓</span>';
      button.children[1].textContent = label;
      menu.append(button);
      return button;
    });
    panel.prepend(backdrop);
    panel.querySelector('.colt-radio-filters').append(gear);
    panel.append(menu);
    const header = panel.querySelector('.colt-radio-header');
    const fitBackdrop = () => panel.style.setProperty('--radio-skin-header-height', header.getBoundingClientRect().height + 'px');
    new ResizeObserver(fitBackdrop).observe(header);
    function applySkin(skin) {
      if (!skins.some(([id]) => id === skin)) skin = 'original';
      if (skin === 'original') delete panel.dataset.radioSkin;
      else panel.dataset.radioSkin = skin;
      fitBackdrop();
      choices.forEach(button => {
        const selected = button.dataset.radioSkinChoice === skin;
        button.setAttribute('aria-checked', String(selected));
        button.tabIndex = selected ? 0 : -1;
        button.autofocus = selected;
      });
      gear.title = 'Radio skin: ' + skins.find(([id]) => id === skin)[1];
      try { localStorage.setItem(key, skin); } catch {}
    }
    let saved = 'original';
    try { saved = localStorage.getItem(key) || saved; } catch {}
    applySkin(saved);
    function closeMenu(focus = false) {
      menu.hidePopover();
      if (focus) gear.focus();
    }
    function positionMenu() {
      if (!menu.matches(':popover-open')) return;
      const view = menu.ownerDocument.defaultView;
      const viewport = view.visualViewport;
      const left = viewport?.offsetLeft || 0, top = viewport?.offsetTop || 0;
      const width = viewport?.width || view.innerWidth, height = viewport?.height || view.innerHeight;
      menu.style.maxHeight = Math.max(0, height - 16) + 'px';
      menu.style.maxWidth = Math.max(0, width - 16) + 'px';
      const anchor = gear.getBoundingClientRect(), bounds = menu.getBoundingClientRect();
      menu.style.left = Math.max(left + 8, Math.min(anchor.right - bounds.width, left + width - bounds.width - 8)) + 'px';
      menu.style.top = Math.max(top + 8, Math.min(anchor.top - bounds.height - 6, top + height - bounds.height - 8)) + 'px';
      menu.style.opacity = '1';
    }
    let unwatch = () => {};
    menu.addEventListener('beforetoggle', event => {
      gear.setAttribute('aria-expanded', String(event.newState === 'open'));
      if (event.newState === 'open') menu.style.opacity = '0';
    });
    menu.addEventListener('toggle', () => {
      unwatch();
      const open = menu.matches(':popover-open');
      gear.setAttribute('aria-expanded', String(open));
      if (!open) return;
      positionMenu();
      const doc = menu.ownerDocument, view = doc.defaultView;
      view.addEventListener('resize', positionMenu);
      doc.addEventListener('scroll', positionMenu, true);
      view.visualViewport?.addEventListener('resize', positionMenu);
      unwatch = () => {
        view.removeEventListener('resize', positionMenu);
        doc.removeEventListener('scroll', positionMenu, true);
        view.visualViewport?.removeEventListener('resize', positionMenu);
      };
    });
    choices.forEach(button => button.addEventListener('click', () => {
      applySkin(button.dataset.radioSkinChoice);
      closeMenu(true);
    }));
    menu.addEventListener('keydown', event => {
      const current = choices.indexOf(menu.ownerDocument.activeElement);
      let next;
      if (event.key === 'ArrowDown') next = (current + 1) % choices.length;
      if (event.key === 'ArrowUp') next = (current + choices.length - 1) % choices.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = choices.length - 1;
      if (next !== undefined) { event.preventDefault(); choices[next].focus(); }
      if (event.key === 'Tab') closeMenu();
    });
    panel.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.matches(':popover-open')) {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeMenu(true);
      }
    }, true);
  };
})();
