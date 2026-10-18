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
  const eyewearLayer=document.createElementNS(ns,'g');
  eyewearLayer.classList.add('eyewear-layer');eyewearLayer.setAttribute('pointer-events','none');
  eyewearLayer.setAttribute('transform','translate(-59.66 23) scale(1.114286 1)');
  puppet.querySelector('.moving-bun').append(eyewearLayer);
  const artwork = {
    none: '',
    cap: `<g filter="url(#accessory-shadow)">
      <path d="M350 300Q365 72 627 65Q889 72 904 300Q627 360 350 300Z" fill="url(#headset)" stroke="#45091f" stroke-width="7"/>
      <path d="M520 90Q627 55 734 90Q759 144 759 300Q627 322 495 300Q495 144 520 90Z" fill="#fffaf3"/>
      <path d="M520 90Q495 144 495 300M734 90Q759 144 759 300" fill="none" stroke="#d47d99" stroke-width="4" opacity=".65"/>
      <ellipse cx="627" cy="68" rx="24" ry="12" fill="#710d30"/>
      <path d="M353 296Q627 254 901 296L959 339Q627 419 295 339Z" fill="#690d2c" stroke="#3b091b" stroke-width="7"/>
      <path d="M325 340Q627 405 929 340" fill="none" stroke="#e8dce1" stroke-width="6"/>
      <image href="assets/st-cletus-crest.png" x="527" y="87" width="200" height="204" preserveAspectRatio="xMidYMid meet"/>
    </g>`,
    crown: `<g transform="translate(627 180)" filter="url(#accessory-shadow)">
      <path d="M-190 27-220-101-107-34 0-139 107-34 220-101 190 27Z" fill="#f7cd55" stroke="#996017" stroke-width="7" stroke-linejoin="round"/>
      <path d="M-185 9Q0 46 185 9L181 55Q0 93-181 55Z" fill="#d69b29" stroke="#996017" stroke-width="6"/>
      <path d="M-173 20Q0 55 173 20" fill="none" stroke="#fff3a5" stroke-width="7"/>
      <path d="m0-72 29 30-29 32-29-32Z" fill="#9f1746" stroke="#fff0a1" stroke-width="5"/>
      <circle cx="-125" cy="-13" r="15" fill="#65c7de"/><circle cx="125" cy="-13" r="15" fill="#65c7de"/>
      <g fill="#fff0a1"><circle cx="-220" cy="-101" r="13"/><circle cy="-139" r="13"/><circle cx="220" cy="-101" r="13"/></g>
    </g>`,
    sleepcap: `<g filter="url(#accessory-shadow)">
      <path d="M390 232Q465 47 668 57Q858 43 936 219Q838 164 753 167Q706 223 727 258Z" fill="url(#hat-fabric)" stroke="#293c62" stroke-width="6"/>
      <path d="M414 196Q568 158 743 212L743 264Q570 224 389 254Z" fill="#f4e9d5" stroke="#d0c0a9" stroke-width="6"/>
      <circle cx="936" cy="219" r="39" fill="#fff4df" stroke="#d0c0a9" stroke-width="5"/>
      <path d="m590 96 9 20 23 3-17 15 4 23-19-11-20 11 4-23-16-15 22-3Z" fill="#ffe09a"/>
      <path d="M750 90a27 27 0 1 0 28 37A29 29 0 0 1 750 90" fill="#ffe09a"/>
    </g>`,
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
  control.innerHTML = '<div class="label motion-label">Headwear</div><div class="controls headwear-options" role="group" aria-label="Choose headwear" tabindex="0"></div><p class="accessory-hint">Scroll for more hats. Add glasses below.</p>';
  const colors = root.querySelector('.colors');
  colors.after(control);
  function setAccessory(id) {
    layer.innerHTML = artwork[id] || '';
    puppet.dataset.accessory = id;
  }
  Object.entries({none:'None',bow:'Bow',headphones:'Headphones',hat:'Small hat',cap:'School cap',crown:'Crown',sleepcap:'Sleep cap'}).forEach(([id, label]) => {
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
  const eyewear=document.createElement('div');eyewear.className='controls eyewear-controls';
  eyewear.setAttribute('role','group');eyewear.setAttribute('aria-label','Choose eyewear');control.after(eyewear);
  const frames={
    none:'',
    round:`<g fill="none" stroke="#492333" stroke-width="12" stroke-linecap="round"><path class="glasses-arms" d="M413 561Q300 505 180 480Q166 483 170 509M841 561Q954 505 1074 480Q1088 483 1084 509"/><circle cx="487" cy="582" r="74"/><circle cx="767" cy="582" r="74"/><path d="M561 577Q627 548 693 577"/></g><g fill="none" stroke="#fff4df" stroke-width="5" opacity=".8"><path d="M438 563Q445 531 474 527M718 563Q725 531 754 527"/></g>`,
    sunglasses:`<g stroke="#221924" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"><path class="glasses-arms" d="M400 548Q290 502 180 480Q166 483 170 509M854 548Q964 502 1074 480Q1088 483 1084 509" fill="none" stroke-width="18"/><path d="M400 533H568L552 615Q487 656 420 613Z" fill="#302d43"/><path d="M686 533H854L834 613Q767 656 702 615Z" fill="#302d43"/><path d="M568 551Q627 530 686 551" fill="none"/></g><path d="m431 551 67 0-52 53M719 551h67l-52 53" fill="#b3c7de" opacity=".35"/>`
  };
  function setEyewear(id){eyewearLayer.innerHTML=frames[id]||'';puppet.dataset.eyewear=id;eyewear.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.eyewear===id)));}
  Object.entries({none:'No glasses',round:'Round glasses',sunglasses:'Sunglasses'}).forEach(([id,label])=>{
    const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.eyewear=id;
    button.onclick=()=>setEyewear(id);eyewear.append(button);
  });setEyewear('none');
  return {setAccessory,setEyewear};
};
