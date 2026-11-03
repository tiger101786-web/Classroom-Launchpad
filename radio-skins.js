(function () {
  'use strict';
  const panel = document.querySelector('.colt-radio-panel');
  if (!panel || panel.dataset.radioSkins) return;
  panel.dataset.radioSkins = 'true';
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = 'radio-skins.css?v=20261102-proportional-headers-v5';
  document.head.append(stylesheet);

  // Clip the original header region inside an independently fitted art layer.
  // Its width and height always use the same scale; source image files stay intact.
  const headerArt = document.createElement('div');
  headerArt.className = 'colt-radio-header-art';
  headerArt.setAttribute('aria-hidden', 'true');
  headerArt.innerHTML = '<div class="colt-radio-header-art-frame"></div>';
  panel.querySelector('.colt-radio-header').prepend(headerArt);

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
  const skins = [['classic', 'Original'], ['arcade', 'Retro Arcade'], ['graffiti', 'Neon Graffiti'],
    ['rock-stage', 'Rock Stage'],
    ['bayou', 'Bayou Dance Hall'],
    ['arctic', 'Arctic Aurora'],
    ['cosmic', 'Cosmic Voyage'],
    ['sakura', 'Moonlit Sakura'],
    ['forge', 'Industrial Forge'],
    ['neon-city', 'Neon City'],
    ['underwater', 'Underwater'],
    ['samurai', 'Cyber Samurai'],
    ['pirate', 'Pirate Cove']
  ];
  const choices = skins.map(([value, label]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.radioSkinChoice = value;
    if (!['classic', 'arcade', 'graffiti'].includes(value)) button.dataset.radioSkinNew = 'true';
    button.setAttribute('role', 'menuitemradio');
    button.innerHTML = '<span class="radio-skin-swatch" aria-hidden="true"></span><span></span><span class="radio-skin-selected" aria-hidden="true">✓</span>';
    button.children[1].textContent = label;
    menu.append(button);
    return button;
  });
  panel.append(menu);

  const key = 'coltRadioSkin';
  function applySkin(skin) {
    if (!skins.some(([value]) => value === skin)) skin = 'classic';
    if (skin === 'classic') delete panel.dataset.radioSkin;
    else panel.dataset.radioSkin = skin;
    panel.toggleAttribute('data-radio-extended', !['classic', 'arcade', 'graffiti'].includes(skin));
    choices.forEach(button => {
      const selected = button.dataset.radioSkinChoice === skin;
      button.setAttribute('aria-checked', String(selected));
      button.tabIndex = selected ? 0 : -1;
      button.autofocus = selected;
    });
    try { localStorage.setItem(key, skin); } catch {}
  }
  let saved = 'classic';
  try { saved = localStorage.getItem(key) || localStorage.getItem('coltRadioSkinPreview') || saved; } catch {}
  applySkin(saved);
  function closeMenu(focus = false) {
    menu.hidePopover();
    gear.setAttribute('aria-expanded', 'false');
    if (focus) gear.focus();
  }
  function positionMenu() {
    if (!menu.matches(':popover-open')) return;
    const view = menu.ownerDocument.defaultView;
    const viewport = view.visualViewport;
    const left = viewport?.offsetLeft || 0, top = viewport?.offsetTop || 0;
    const width = viewport?.width || view.innerWidth, height = viewport?.height || view.innerHeight;
    menu.style.maxWidth = Math.max(0, width - 16) + 'px';
    const anchor = gear.getBoundingClientRect();
    const roomBelow = Math.max(0, top + height - 8 - anchor.bottom - 6);
    const roomAbove = Math.max(0, anchor.top - 6 - top - 8);
    menu.style.maxHeight = Math.max(0, Math.min(296, height - 16, Math.max(roomBelow, roomAbove))) + 'px';
    const bounds = menu.getBoundingClientRect();
    const below = anchor.bottom + 6, above = anchor.top - bounds.height - 6;
    const preferredTop = below + bounds.height <= top + height - 8 ? below : above;
    menu.style.left = Math.max(left + 8, Math.min(anchor.right - bounds.width, left + width - bounds.width - 8)) + 'px';
    menu.style.top = Math.max(top + 8, Math.min(preferredTop, top + height - bounds.height - 8)) + 'px';
    menu.style.opacity = '1';
    const focused = menu.ownerDocument.activeElement;
    if (menu.contains(focused)) focused.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    gear.setAttribute('aria-expanded', 'true');
  }
  let stopWatchingPosition = () => {};
  function watchPosition() {
    stopWatchingPosition();
    const doc = menu.ownerDocument, view = doc.defaultView, viewport = view.visualViewport;
    const onScroll = event => { if (!menu.contains(event.target)) positionMenu(); };
    view.addEventListener('resize', positionMenu);
    doc.addEventListener('scroll', onScroll, true);
    viewport?.addEventListener('resize', positionMenu);
    viewport?.addEventListener('scroll', positionMenu);
    stopWatchingPosition = () => {
      view.removeEventListener('resize', positionMenu);
      doc.removeEventListener('scroll', onScroll, true);
      viewport?.removeEventListener('resize', positionMenu);
      viewport?.removeEventListener('scroll', positionMenu);
    };
  }
  menu.addEventListener('beforetoggle', event => {
    gear.setAttribute('aria-expanded', String(event.newState === 'open'));
    if (event.newState === 'open') menu.style.opacity = '0';
  });
  // beforetoggle runs before layout exists; measure only after the popover is open.
  menu.addEventListener('toggle', () => {
    const open = menu.matches(':popover-open');
    gear.setAttribute('aria-expanded', String(open));
    if (open) { watchPosition(); positionMenu(); }
    else stopWatchingPosition();
  });
  stylesheet.addEventListener('load', positionMenu);
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
