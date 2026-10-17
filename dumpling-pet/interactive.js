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
      <g class="music-eyes" fill="none" stroke="#171413" stroke-width="14" stroke-linecap="round"><path d="M449 605 Q483 571 517 605"/><path d="M761 605 Q795 571 829 605"/></g>
      <g class="sleep-eyes" fill="none" stroke="#171413" stroke-width="14" stroke-linecap="round"><path d="M449 595 Q483 627 517 595"/><path d="M761 595 Q795 627 829 595"/></g>
      <g class="mouth"><path d="M594 632 Q608 694 637 685 Q664 684 681 632" fill="none" stroke="#16110f" stroke-width="22" stroke-linecap="round"/></g>
      <g class="mouth-open"><path d="M592 636 Q637 649 681 636 C680 712 597 712 592 636Z" fill="#191211"/><path d="M612 685 Q637 669 662 685 Q637 708 612 685" fill="#e98d91"/></g>
    </g></g></g>
    <image class="fixed-basket" href="${asset}" width="1254" height="1254" mask="url(#basket-mask)"/>
    <g class="music-notes" pointer-events="none" font-family="Arial, sans-serif" font-size="140" font-weight="bold" text-anchor="middle" fill="#a81747" stroke="#fff1cf" stroke-width="7" paint-order="stroke">
      <text class="music-note" x="105" y="410">♪</text>
      <text class="music-note" x="1140" y="370" style="animation-delay:-.6s">♫</text>
      <text class="music-note" x="260" y="200" style="animation-delay:-1.2s">♫</text>
      <text class="music-note" x="990" y="190" style="animation-delay:-1.8s">♪</text>
    </g>
    <g class="sleep-zs" pointer-events="none" fill="#b7c6ec" stroke="#292036" stroke-width="6" paint-order="stroke" font-family="Arial, sans-serif" font-weight="bold" font-size="125"><text x="950" y="330">Z</text><text x="1040" y="225" style="animation-delay:-1s">Z</text><text x="1120" y="120" style="animation-delay:-2s">Z</text></g>
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
  let blinkTimer, smileTimer, bounceTimer, smileEnd, animation, radioAnimation;
  let radioPlaying = false;
  let wakeAnimations=[];
  const canAnimate = () => puppet.classList.contains('idle') && !puppet.classList.contains('asleep') && !puppet.classList.contains('waking') && !reduced.matches && !document.hidden;
  const eyes = [...puppet.querySelectorAll('.eye')];
  function blink() {
    if(puppet.classList.contains('radio-dancing')||puppet.classList.contains('asleep')||puppet.classList.contains('waking'))return;
    eyes.forEach(eye => {
      eye.getAnimations().forEach(a => a.cancel());
      eye.animate([{transform:'scaleY(1)'},{transform:'scaleY(.06)',offset:.45},{transform:'scaleY(.06)',offset:.6},{transform:'scaleY(1)'}], {duration:260,easing:'ease-in-out'});
    });
  }
  function smile() {
    if(puppet.classList.contains('asleep')||puppet.classList.contains('waking'))return;
    clearTimeout(smileEnd);
    puppet.classList.add('smiling');
    smileEnd = setTimeout(() => puppet.classList.remove('smiling'), 1200);
  }
  function scheduleFace() {
    clearTimeout(blinkTimer); clearTimeout(smileTimer); clearTimeout(bounceTimer);
    if (!canAnimate()) return;
    const nextBlink = () => { blinkTimer = setTimeout(() => {if(canAnimate()){blink();nextBlink();}}, 3200 + Math.random()*2600); };
    const nextSmile = () => { smileTimer = setTimeout(() => {if(canAnimate()){smile();nextSmile();}}, 12000 + Math.random()*10000); };
    const nextBounce = () => { bounceTimer = setTimeout(() => {if(canAnimate()){if(!radioPlaying && animation?.playState!=='running')play('bounce',true);nextBounce();}}, 22000 + Math.random()*16000); };
    nextBlink(); nextSmile(); nextBounce();
  }
  function syncRadio() {
    const run = radioPlaying && canAnimate();
    puppet.classList.toggle('radio-dancing',run);
    if (!run) {radioAnimation?.cancel();radioAnimation=null;return;}
    if(radioAnimation) return;
    animation?.cancel();
    radioAnimation=puppet.querySelector('.moving-bun').animate([
      {transform:'scale(1)'},{transform:'scale(1.035,.87)'},{transform:'scale(.99,1.02)'},{transform:'scale(1)'}
    ],{duration:600,iterations:Infinity,easing:'ease-in-out'});
  }
  function setRadio(playing) {
    if(radioPlaying===playing)return;
    radioPlaying=playing;syncRadio();scheduleFace();
  }
  function setIdle(on) {
    if(!on)finishWake();
    puppet.classList.toggle('idle', on);
    idle.setAttribute('aria-pressed', String(on));
    idle.textContent = `Motion: ${on ? 'on' : 'off'}`;
    scheduleFace();
    syncRadio();
    if (!on) { animation?.cancel();clearTimeout(smileEnd); puppet.classList.remove('smiling'); eyes.forEach(e => e.getAnimations().forEach(a => a.cancel())); }
  }
  function finishWake() {
    if(!puppet.classList.contains('waking'))return;
    puppet.classList.remove('waking');
    wakeAnimations.forEach(a=>{a.onfinish=null;a.cancel();});wakeAnimations=[];
    section.querySelector('.motion-status').textContent='Awake and ready to play.';
    scheduleFace();syncRadio();root.dispatchEvent(new Event('dumpling-wake-finished'));
  }
  function startWake() {
    puppet.classList.add('waking');scheduleFace();syncRadio();
    section.querySelector('.motion-status').textContent='Waking up…';
    const animate=(element,frames,options)=>{const a=element.animate(frames,options);wakeAnimations.push(a);return a;};
    animate(puppet.querySelector('.sleep-zs'),[{opacity:1},{opacity:0}],{duration:450,fill:'forwards'});
    eyes.forEach(eye=>animate(eye,[
      {transform:'scaleY(.06)',offset:0},{transform:'scaleY(1)',offset:.3},
      {transform:'scaleY(.06)',offset:.4},{transform:'scaleY(1)',offset:.5},
      {transform:'scaleY(.06)',offset:.6},{transform:'scaleY(1)',offset:.72},{transform:'scaleY(1)'}
    ],{duration:1300,easing:'ease-in-out'}));
    animate(puppet.querySelector('.mouth'),[{opacity:1,offset:0},{opacity:1,offset:.45},{opacity:0,offset:.6},{opacity:0}],{duration:2000});
    animate(puppet.querySelector('.mouth-open'),[{opacity:0,transform:'scaleY(1)',offset:0},{opacity:0,transform:'scaleY(1)',offset:.45},{opacity:1,transform:'scaleY(1)',offset:.6},{opacity:1,transform:'scaleY(1)'}],{duration:2000});
    const body=animate(puppet.querySelector('.moving-bun'),[
      {transform:'scale(1)',offset:0},{transform:'scale(1)',offset:.35},
      {transform:'scale(.97,1.055)',offset:.57},{transform:'scale(1.025,.94)',offset:.7},
      {transform:'translateY(-18px) scale(.99,1.02)',offset:.8},{transform:'scale(1.02,.96)',offset:.9},{transform:'scale(1)'}
    ],{duration:2000,easing:'ease-in-out'});
    body.onfinish=finishWake;
  }
  function setSleep(on,animateWake=false) {
    if(puppet.classList.contains('asleep')===on)return;
    finishWake();
    puppet.classList.toggle('asleep',on);
    animation?.cancel();clearTimeout(smileEnd);puppet.classList.remove('smiling');
    eyes.forEach(e=>e.getAnimations().forEach(a=>a.cancel()));
    section.querySelectorAll('[data-motion],#blink,#smile').forEach(b=>{b.disabled=on;b.title=on?'Wake the squishy first':'';});
    section.querySelector('.motion-status').textContent=on?'Shh… sleeping.':'Awake and ready to play.';
    if(!on&&animateWake&&canAnimate())startWake();
    else {scheduleFace();syncRadio();}
  }
  setIdle(!reduced.matches);
  idle.onclick = () => setIdle(!puppet.classList.contains('idle'));
  reduced.addEventListener('change', () => { if (reduced.matches) setIdle(false); });
  document.addEventListener('visibilitychange', () => {if(document.hidden)finishWake();scheduleFace();syncRadio();if(document.hidden)animation?.cancel();});
  section.querySelector('#blink').onclick = blink;
  section.querySelector('#smile').onclick = smile;
  function play(type, automatic=false) {
    if(puppet.classList.contains('asleep')||puppet.classList.contains('waking'))return;
    animation?.cancel();
    radioAnimation?.cancel();radioAnimation=null;
    blink(); smile();
    const frames = type === 'excited'
      ? ['scale(1)','scale(1.04,.9)','translateY(-24px) scale(.98,1.03)','scale(1.03,.93)','translateY(-13px) scale(.99,1.02)','scale(1)']
      : type === 'bounce'
      ? ['scale(1)', 'scale(1.035,.90)', 'translateY(-22px) scale(.985,1.025)', 'scale(1.04,.88)', 'scale(.99,1.015)', 'scale(1)']
      : ['scale(1)', 'scale(1.04,.78)', 'scale(.985,1.035)', 'scale(1.015,.96)', 'scale(1)'];
    animation = puppet.querySelector('.moving-bun').animate(frames.map(transform => ({transform})), {duration: reduced.matches ? 250 : type === 'bounce'||type === 'excited' ? 1100 : 1450, easing: 'ease-in-out'});
    if(!automatic)section.querySelector('.motion-status').textContent = type === 'bounce' ? 'Boing!' : 'Squish… and slowly spring back.';
    animation.onfinish = () => { if(!automatic)section.querySelector('.motion-status').textContent = 'Ready for another squeeze.';syncRadio(); };
  }
  puppet.onclick = () => play('squish');
  section.querySelectorAll('[data-motion]').forEach(b => b.onclick = () => play(b.dataset.motion));
  panel.querySelector('.note').innerHTML = '<p><strong>Interactive 2D preview.</strong> The face blinks and smiles, following the squishy during movement. Idle controls automatic movement; try Blink or Happy smile anytime. The basket stays rigid. This is not a 3D model.</p><p>Your existing Colt and classroom site are unchanged.</p>';
  function excite(){if(canAnimate())play('excited',true);else if(!puppet.classList.contains('asleep'))smile();}
  return {setIdle,setRadio,setSleep,excite};
};
