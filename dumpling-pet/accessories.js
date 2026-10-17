// Standalone approval preview: accessories share the bun's animation coordinates.
window.addDumplingAccessories = function(root) {
  const puppet = root.querySelector('.pet-button');
  const ns = 'http://www.w3.org/2000/svg';
  const defs = puppet.querySelector('defs');
  defs.insertAdjacentHTML('beforeend', `
    <linearGradient id="ribbon" x2="0.8" y2="1"><stop stop-color="#ffe2ec"/><stop offset=".3" stop-color="#ed6d9d"/><stop offset=".65" stop-color="#bb346b"/><stop offset="1" stop-color="#742044"/></linearGradient>
    <linearGradient id="headset" x2="1" y2=".3"><stop stop-color="#560720"/><stop offset=".4" stop-color="#a83f60"/><stop offset=".65" stop-color="#7b0b31"/><stop offset="1" stop-color="#350716"/></linearGradient>
    <linearGradient id="metal" x2="1" y2=".6"><stop stop-color="#dc8ca4"/><stop offset=".35" stop-color="#a81747"/><stop offset=".7" stop-color="#7b0b31"/><stop offset="1" stop-color="#560720"/></linearGradient>
    <linearGradient id="hat-fabric" x2=".7" y2="1"><stop stop-color="#afc9df"/><stop offset=".3" stop-color="#6385b5"/><stop offset=".7" stop-color="#344d80"/><stop offset="1" stop-color="#1d2b4e"/></linearGradient>
    <filter id="accessory-shadow" x="-30%" y="-40%" width="160%" height="190%"><feDropShadow dx="0" dy="9" stdDeviation="6" flood-color="#301a16" flood-opacity=".35"/></filter>`);
  const layer = document.createElementNS(ns, 'g');
  layer.classList.add('accessory-layer');
  layer.setAttribute('pointer-events', 'none');
  // Inside moving-bun, outside tinted-bun: follows the pet without changing accessory colors.
  puppet.querySelector('.moving-bun').append(layer);
  const artwork = {
    none: '',
    bow: `<g transform="translate(350 245) rotate(-17)" filter="url(#accessory-shadow)">
      <path d="M-12 17 -63 118 -14 100 12 116 32 24M15 20 62 119 83 94 126 101 49 8" fill="url(#ribbon)" stroke="#932950" stroke-width="3"/>
      <path d="M0 0C-115-98-151-92-135-13C-152 68-101 72 0 24C102 77 144 69 130-10C144-89 100-94 0 0Z" fill="url(#ribbon)" stroke="#922c55" stroke-width="4"/>
      <path d="M-116-49Q-72-43-25 5M113-49Q65-37 24 5" fill="none" stroke="#ffbfd8" stroke-width="7" stroke-linecap="round" opacity=".6"/>
      <path d="M-111 27-26 15M103 28 24 16" stroke="#882345" stroke-width="4" opacity=".6"/>
      <rect x="-26" y="-20" width="54" height="64" rx="19" fill="url(#ribbon)" stroke="#a3375e" stroke-width="3"/>
      <path d="M-12-9V29" stroke="#ffd5e7" stroke-width="5" stroke-linecap="round" opacity=".6"/></g>`,
    headphones: `<g filter="url(#accessory-shadow)">
      <!-- Shorter, raised earcups keep clearance even at the deepest .78 squash. -->
      <path d="M155 405C170 28 1084 28 1099 405" fill="none" stroke="#262629" stroke-width="48"/>
      <path d="M155 405C170 28 1084 28 1099 405" fill="none" stroke="url(#headset)" stroke-width="30"/>
      <path d="M190 318C327 65 927 65 1064 318" fill="none" stroke="#c6c8cb" stroke-width="5" opacity=".8"/>
      <g class="earcup" transform="translate(155 390) rotate(10)"><rect x="-54" y="-38" width="110" height="170" rx="43" fill="#262629"/><rect x="-62" y="-28" width="77" height="149" rx="31" fill="url(#metal)" stroke="#6f7377" stroke-width="5"/><path d="M-43-1V82" stroke="#eee5e8" stroke-width="6" stroke-linecap="round" opacity=".75"/></g>
      <g class="earcup" transform="translate(1099 390) rotate(-10)"><rect x="-56" y="-38" width="110" height="170" rx="43" fill="#262629"/><rect x="-15" y="-28" width="77" height="149" rx="31" fill="url(#metal)" stroke="#6f7377" stroke-width="5"/><path d="M42-1V82" stroke="#eee5e8" stroke-width="6" stroke-linecap="round" opacity=".75"/></g></g>`,
    hat: `<g transform="translate(627 178)" filter="url(#accessory-shadow)">
      <ellipse cx="0" cy="16" rx="201" ry="43" fill="#202c49"/>
      <path d="M-141 8-118-116Q0-158 118-116L141 8Q0 55-141 8Z" fill="url(#hat-fabric)" stroke="#293c62" stroke-width="4"/>
      <ellipse cy="-116" rx="118" ry="29" fill="#7292bb" stroke="#a5c3dc" stroke-width="4"/>
      <path d="M-133-31Q0 9 133-31L141 8Q0 55-141 8Z" fill="#e7c27a" stroke="#a5834e" stroke-width="3"/>
      <path d="M-181 20Q0 77 181 20" fill="none" stroke="#7597bf" stroke-width="8" stroke-linecap="round"/>
      <path d="m0-24 7 14 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2Z" fill="#fff0b6" stroke="#a88442" stroke-width="2"/></g>`
  };
  const control = document.createElement('div');
  control.className = 'accessory-controls';
  control.innerHTML = '<div class="label motion-label">Accessory</div><div class="controls" role="group" aria-label="Choose an accessory"></div><p class="accessory-hint">One at a time · follows the squishy</p>';
  const colors = root.querySelector('.colors');
  colors.after(control);
  function setAccessory(id) {
    layer.innerHTML = artwork[id] || '';
    puppet.dataset.accessory = id;
  }
  Object.entries({none:'None',bow:'Bow',headphones:'Headphones',hat:'Small hat'}).forEach(([id, label]) => {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = label; button.dataset.accessory = id;
    button.setAttribute('aria-pressed', String(id === 'none'));
    button.onclick = () => {
      setAccessory(id);
      control.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      puppet.setAttribute('aria-label', `Squish your dumpling${id === 'none' ? '' : ' wearing ' + label.toLowerCase()}`);
    };
    control.querySelector('.controls').append(button);
  });
  root.querySelector('.panel > div > p').textContent = 'Pick a color and accessory, then try a squeeze or bounce. Accessories follow the squishy; the basket stays still.';
  return {setAccessory};
};
