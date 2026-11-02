(function () {
  'use strict';
  const panel = document.querySelector('.colt-radio-panel');
  if (!panel || panel.dataset.skinPreview) return;
  panel.dataset.skinPreview = 'true';
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = 'radio-skins-preview.css?v=20261101-styled-dropdown-v6';
  document.head.append(stylesheet);

  const gear = document.createElement('button');
  gear.type = 'button';
  gear.className = 'colt-radio-skin-gear';
  gear.setAttribute('aria-label', 'Change Colt Radio skin');
  gear.setAttribute('aria-haspopup', 'menu');
  gear.setAttribute('aria-expanded', 'false');
  gear.setAttribute('aria-controls', 'colt-radio-skin-menu');
  gear.innerHTML = '<span class="dashboard-nav-icon" aria-hidden="true">⚙</span>';
  panel.querySelector('.colt-radio-filters').append(gear);

  // A compact top-layer dropdown: no settings panel, heading, or extra layout row.
  const menu = document.createElement('div');
  menu.id = 'colt-radio-skin-menu';
  menu.className = 'colt-radio-skin-menu';
  menu.setAttribute('popover', 'auto');
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-label', 'Radio skins');
  // Register the real invoker so browser light-dismiss cannot close then reopen it.
  gear.setAttribute('popovertarget', menu.id);
  gear.setAttribute('popovertargetaction', 'toggle');
  const skins = [['classic', 'Original'], ['arcade', 'Retro Arcade'], ['graffiti', 'Neon Graffiti']];
  const choices = skins.map(([value, label]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.radioSkinChoice = value;
    button.setAttribute('role', 'menuitemradio');
    button.innerHTML = '<span class="radio-skin-swatch" aria-hidden="true"></span><span></span><span class="radio-skin-selected" aria-hidden="true">✓</span>';
    button.children[1].textContent = label;
    menu.append(button);
    return button;
  });
  panel.append(menu);

  const key = 'coltRadioSkinPreview';
  function applySkin(skin) {
    if (!skins.some(([value]) => value === skin)) skin = 'classic';
    if (skin === 'classic') delete panel.dataset.radioSkin;
    else panel.dataset.radioSkin = skin;
    choices.forEach(button => {
      const selected = button.dataset.radioSkinChoice === skin;
      button.setAttribute('aria-checked', String(selected));
      button.tabIndex = selected ? 0 : -1;
      button.autofocus = selected;
    });
    try { localStorage.setItem(key, skin); } catch {}
  }
  let saved = 'classic';
  try { saved = localStorage.getItem(key) || saved; } catch {}
  applySkin(saved);
  function closeMenu(focus = false) {
    menu.hidePopover();
    gear.setAttribute('aria-expanded', 'false');
    if (focus) gear.focus();
  }
  function positionMenu() {
    if (!menu.matches(':popover-open')) return;
    const anchor = gear.getBoundingClientRect(), bounds = menu.getBoundingClientRect();
    const view = menu.ownerDocument.defaultView;
    menu.style.left = Math.max(8, Math.min(anchor.right - bounds.width, view.innerWidth - bounds.width - 8)) + 'px';
    menu.style.top = Math.max(8, Math.min(anchor.bottom + 6, view.innerHeight - bounds.height - 8)) + 'px';
    gear.setAttribute('aria-expanded', 'true');
  }
  menu.addEventListener('beforetoggle', event => {
    gear.setAttribute('aria-expanded', String(event.newState === 'open'));
    if (event.newState === 'open') queueMicrotask(positionMenu);
  });
  menu.addEventListener('toggle', () => gear.setAttribute('aria-expanded', String(menu.matches(':popover-open'))));
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
})();
