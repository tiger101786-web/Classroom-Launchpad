// Approval-only 2D puppet. The original photo asset stays unchanged.
window.createDumplingPet = function(root) {
  const stage = root.querySelector('.stage');
  const asset = 'dumpling-pet/gold-squishy-front-v5.png';
  const img = stage.querySelector('.toy');
  const puppet = document.createElement('button');
  puppet.className = 'toy pet-button';
  puppet.type = 'button';
  puppet.setAttribute('aria-label', 'Squish your dumpling');
  // Complementary masks split the bun from the rigid basket at the rim.
  const edge = 'M0 0H1254V590H1182C1194 692 1100 812 627 824C154 812 60 692 72 590H0Z';
  puppet.innerHTML = `<svg viewBox="0 0 1254 1254" aria-hidden="true"><defs>
    <clipPath id="bun-clip"><path d="${edge}"/></clipPath>
    <filter id="patch-soft"><feGaussianBlur stdDeviation="4"/></filter>
    <mask id="eye-cover"><g fill="white" filter="url(#patch-soft)"><ellipse cx="483" cy="605" rx="72" ry="85"/><ellipse cx="795" cy="605" rx="72" ry="85"/></g></mask>
    <mask id="mouth-cover"><ellipse cx="637" cy="661" rx="83" ry="65" fill="white" filter="url(#patch-soft)"/></mask>
    <mask id="basket-mask"><rect width="1254" height="1254" fill="white"/><path d="${edge}" fill="black"/></mask>
    </defs><ellipse cx="627" cy="765" rx="555" ry="105" fill="#b47a40"/>
    <g class="breathing"><g class="moving-bun"><g class="tinted-bun">
      <image href="${asset}" width="1254" height="1254" clip-path="url(#bun-clip)"/>
      <!-- Nearby glitter texture conceals the printed features; separate face layers can move. -->
      <g mask="url(#eye-cover)"><image href="${asset}" y="160" width="1254" height="1254"/></g>
      <g mask="url(#mouth-cover)"><image href="${asset}" y="200" width="1254" height="1254"/></g>
    </g><g class="face">
      <!-- Clean independent eyes: no clipped photo edges or fixed printed-eye outline. -->
      <g class="eye eye-left"><ellipse cx="483" cy="605" rx="44" ry="60" fill="#171413"/><ellipse cx="481" cy="588" rx="13" ry="19" fill="#f5f6f3"/></g>
      <g class="eye eye-right"><ellipse cx="795" cy="605" rx="44" ry="60" fill="#171413"/><ellipse cx="793" cy="588" rx="13" ry="19" fill="#f5f6f3"/></g>
      <g class="mouth"><path d="M594 632 Q608 694 637 685 Q664 684 681 632" fill="none" stroke="#16110f" stroke-width="22" stroke-linecap="round"/></g>
      <g class="mouth-open"><path d="M592 636 Q637 649 681 636 C680 712 597 712 592 636Z" fill="#191211"/><path d="M612 685 Q637 669 662 685 Q637 708 612 685" fill="#e98d91"/></g>
    </g></g></g>
    <image class="fixed-basket" href="${asset}" width="1254" height="1254" mask="url(#basket-mask)"/>
    </svg>`;
  img.replaceWith(puppet);
  root.querySelector('h1').textContent = 'Your squishy, your color.';
  root.querySelector('.eyebrow').textContent = 'INTERACTIVE APPROVAL PREVIEW';
  stage.querySelector('span').textContent = 'TAP THE TOY TO SQUISH';
  const panel = root.querySelector('.panel');
  panel.querySelector('h2').textContent = 'Gold glitter';
  panel.querySelector('p').textContent = 'Choose a glitter color, then try a squeeze or a bounce. The basket stays still.';
  const section = document.createElement('div');
  section.innerHTML = `<div class="label">Glitter color</div><div class="controls colors"></div>
    <div class="label motion-label">Try an animation</div><div class="controls"><button data-motion="squish">Squish</button><button data-motion="bounce">Bounce</button><button id="blink">Blink</button><button id="smile">Happy smile</button><button id="idle" aria-pressed="true">Idle: on</button></div><p class="motion-status" role="status" aria-live="polite">Ready for a squeeze.</p>`;
  panel.insertBefore(section, panel.children[1]);
  const colors = [
    ['Gold', '#e6b33c', 'none'],
    ['Rose', '#e18db8', 'hue-rotate(285deg) saturate(.65)'],
    ['Blue', '#70a5e5', 'hue-rotate(170deg) saturate(.7)'],
    ['Lavender', '#b998df', 'hue-rotate(220deg) saturate(.45)'],
    ['Matcha', '#a7bd6a', 'hue-rotate(45deg) saturate(.5)'],
    ['Silver', '#cbd2da', 'grayscale(1) brightness(1.14)']
  ];
  colors.forEach(([name, swatch, filter], i) => {
    const b = document.createElement('button');
    b.className = 'color-choice'; b.textContent = name;
    b.style.setProperty('--swatch', swatch);
    b.setAttribute('aria-pressed', String(i === 0));
    b.onclick = () => {
      puppet.querySelector('.tinted-bun').style.filter = filter;
      panel.querySelector('h2').textContent = `${name} glitter`;
      section.querySelectorAll('.color-choice').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    };
    section.querySelector('.colors').append(b);
  });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const idle = section.querySelector('#idle');
  let blinkTimer, smileTimer, smileEnd;
  const eyes = [...puppet.querySelectorAll('.eye')];
  function blink() {
    eyes.forEach(eye => {
      eye.getAnimations().forEach(a => a.cancel());
      eye.animate([{transform:'scaleY(1)'},{transform:'scaleY(.06)',offset:.45},{transform:'scaleY(.06)',offset:.6},{transform:'scaleY(1)'}], {duration:260,easing:'ease-in-out'});
    });
  }
  function smile() {
    clearTimeout(smileEnd);
    puppet.classList.add('smiling');
    smileEnd = setTimeout(() => puppet.classList.remove('smiling'), 1200);
  }
  function scheduleFace() {
    clearTimeout(blinkTimer); clearTimeout(smileTimer);
    if (!puppet.classList.contains('idle') || reduced.matches || document.hidden) return;
    blinkTimer = setTimeout(() => { blink(); scheduleFace(); }, 3200 + Math.random()*2600);
    // Resting body stays still; facial reactions happen on deliberate interactions.
  }
  function setIdle(on) {
    puppet.classList.toggle('idle', on);
    idle.setAttribute('aria-pressed', String(on));
    idle.textContent = `Idle: ${on ? 'on' : 'off'}`;
    scheduleFace();
    if (!on) { clearTimeout(smileEnd); puppet.classList.remove('smiling'); eyes.forEach(e => e.getAnimations().forEach(a => a.cancel())); }
  }
  setIdle(!reduced.matches);
  idle.onclick = () => setIdle(!puppet.classList.contains('idle'));
  reduced.addEventListener('change', () => { if (reduced.matches) setIdle(false); });
  document.addEventListener('visibilitychange', scheduleFace);
  section.querySelector('#blink').onclick = blink;
  section.querySelector('#smile').onclick = smile;
  let animation;
  function play(type) {
    animation?.cancel();
    blink(); smile();
    const frames = type === 'bounce'
      ? ['scale(1)', 'scale(1.035,.90)', 'translateY(-22px) scale(.985,1.025)', 'scale(1.04,.88)', 'scale(.99,1.015)', 'scale(1)']
      : ['scale(1)', 'scale(1.04,.78)', 'scale(.985,1.035)', 'scale(1.015,.96)', 'scale(1)'];
    animation = puppet.querySelector('.moving-bun').animate(frames.map(transform => ({transform})), {duration: reduced.matches ? 250 : type === 'bounce' ? 1100 : 1450, easing: 'ease-in-out'});
    section.querySelector('.motion-status').textContent = type === 'bounce' ? 'Boing!' : 'Squish… and slowly spring back.';
    animation.onfinish = () => { section.querySelector('.motion-status').textContent = 'Ready for another squeeze.'; };
  }
  puppet.onclick = () => play('squish');
  section.querySelectorAll('[data-motion]').forEach(b => b.onclick = () => play(b.dataset.motion));
  panel.querySelector('.note').innerHTML = '<p><strong>Interactive 2D preview.</strong> The face blinks and smiles, following the squishy during movement. Idle controls automatic movement; try Blink or Happy smile anytime. The basket stays rigid. This is not a 3D model.</p><p>Your existing Colt and classroom site are unchanged.</p>';
  return {setIdle};
};
