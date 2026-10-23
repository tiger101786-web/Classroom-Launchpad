(() => {
 'use strict';
 const host=document.querySelector('#eagle-host'), ns='http://www.w3.org/2000/svg';
 const leftWing='M0 470H276Q351 468 393 523Q431 583 402 684Q374 808 294 930H0Z',rightWing='M1374 470H1110Q1032 468 1001 530Q974 601 1008 713Q1043 837 1113 930H1374Z';
 const artwork='<image href="approved-eagle.png" width="1374" height="1145"/>';
 host.innerHTML=`<button class="eagle" aria-label="Say hello to the eagle"><svg viewBox="-60 -30 1494 1205" role="img" aria-label="Front-facing bald eagle perched on a wooden branch"><defs>
 <clipPath id="bird-crop"><path d="M0 0H1374V930L1140 949Q710 973 330 949L170 930H0Z"/></clipPath>
 <clipPath id="left-eye"><path d="M513 315Q549 309 591 351Q610 376 604 395Q582 426 545 416Q509 406 503 378Q495 348 513 315Z"/></clipPath>
 <clipPath id="right-eye"><path d="M884 315Q850 309 813 351Q794 376 803 395Q825 425 861 415Q891 407 900 378Q909 348 884 315Z"/></clipPath>
 <linearGradient id="lid" x1="0" y1="0" x2="0.7" y2="1"><stop stop-color="#bca58e"/><stop offset=".4" stop-color="#e6d9c9"/><stop offset="1" stop-color="#fff7e9"/></linearGradient>
 <clipPath id="left-wing"><path d="${leftWing}"/></clipPath><clipPath id="right-wing"><path d="${rightWing}"/></clipPath>
 <mask id="torso-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1374" height="1145"><rect width="1374" height="1145" fill="white"/><path d="${leftWing}" fill="black"/><path d="${rightWing}" fill="black"/></mask>
 <linearGradient id="shoulder-fill"><stop stop-color="#53301f"/><stop offset=".5" stop-color="#71442d"/><stop offset="1" stop-color="#53301f"/></linearGradient>
 <radialGradient id="brow-blend"><stop offset=".65" stop-color="white"/><stop offset="1" stop-color="black"/></radialGradient>
 <mask id="happy-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1374" height="1145"><ellipse cx="554" cy="352" rx="147" ry="123" fill="url(#brow-blend)"/><ellipse cx="851" cy="352" rx="147" ry="123" fill="url(#brow-blend)"/></mask>
 <clipPath id="jaw-crop"><path d="M562 450H855Q793 480 748 572L709 617L668 573Q621 483 562 450Z"/></clipPath>
 <clipPath id="upper-beak-crop"><path d="M563 455Q599 444 624 424Q658 356 709 340Q751 357 783 424Q811 444 854 455L780 471Q746 508 710 569Q675 508 640 471Z"/></clipPath>
 </defs>
 <g class="branch"><image href="branch-fitted-v4.png" y="60" width="1374" height="1145"/></g>
 <g class="body"><g class="stable-face"><g clip-path="url(#bird-crop)"><g clip-path="url(#left-wing)"><image href="wing-backing-v2.png" width="1374" height="1145"/></g><g clip-path="url(#right-wing)"><image href="wing-backing-v2.png" width="1374" height="1145"/></g><g mask="url(#torso-mask)">${artwork}</g></g>
 <g class="happy-eyes" opacity="0" mask="url(#happy-mask)"><svg x="375" y="210" width="320" height="275" style="width:320px;height:275px;overflow:hidden" viewBox="375 210 320 275"><image class="happy-left" href="happy-open-eyes-v4.png" width="1374" height="1145"/></svg><svg x="720" y="210" width="300" height="275" style="width:300px;height:275px;overflow:hidden" viewBox="720 210 300 275"><image class="happy-right" href="happy-open-eyes-v4.png" width="1374" height="1145"/></svg></g>
 <g class="lids"><g clip-path="url(#left-eye)"><rect class="lid-left" x="492" y="305" width="125" height="125" fill="url(#lid)"/><path class="closed-eye" d="M507 372Q549 400 601 377" fill="none" stroke="#5b4738" stroke-width="6" stroke-linecap="round"/></g><g clip-path="url(#right-eye)"><rect class="lid-right" x="791" y="305" width="125" height="125" fill="url(#lid)"/><path class="closed-eye" d="M805 377Q851 400 899 372" fill="none" stroke="#5b4738" stroke-width="6" stroke-linecap="round"/></g></g>
 <g class="beak-motion" opacity="0"><g clip-path="url(#jaw-crop)"><g class="lower-jaw"><image href="open-beak-v2.png" width="1374" height="1145" clip-path="url(#jaw-crop)"/></g></g><g class="upper-beak" clip-path="url(#upper-beak-crop)">${artwork}</g></g></g></g>
 <g class="perched-wings" style="transform-origin:687px 955px"><g class="wing-left" clip-path="url(#left-wing)">${artwork}</g><g class="wing-right" clip-path="url(#right-wing)">${artwork}</g></g>
 <g class="zs" opacity="0" font-family="Segoe UI,sans-serif" font-weight="700"><text x="1045" y="225" font-size="70">z</text><text x="1140" y="128" font-size="90">Z</text><text x="1240" y="20" font-size="110">Z</text></g>
 <g class="notes" font-family="Arial,sans-serif" font-weight="bold" font-size="140"><text x="-5" y="550">♪</text><text x="1250" y="550">♫</text><text x="80" y="280">♫</text><text x="1160" y="265">♪</text></g>
 </svg></button>`;
 const pet=host.querySelector('.eagle'),body=host.querySelector('.body'),wingLeft=host.querySelector('.wing-left'),wingRight=host.querySelector('.wing-right'),jaw=host.querySelector('.lower-jaw'),lids=[...host.querySelectorAll('.lid-left,.lid-right')],closed=[...host.querySelectorAll('.closed-eye')],mouth=host.querySelector('.beak-motion'),zs=host.querySelector('.zs'),notes=[...host.querySelectorAll('.notes text')];
 const status=document.querySelector('#state'), sleepButton=document.querySelector('#sleep'),danceButton=document.querySelector('#dance'),media=matchMedia('(prefers-reduced-motion: reduce)');
 let asleep=false,dancing=false,waking=false,motion=true,idle=true,action=null,phase=0,last=0,blinkStart=-10000,nextBlink=2000,nextIdle=8500,idleIndex=0,wakeStart=0,sleepStart=0,raf=0,frames=0;
 const canMove=()=>motion&&!media.matches&&!document.hidden;
 const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
 function eye(close){close=Math.max(0,Math.min(1,close));lids.forEach(e=>e.setAttribute('height',String(125*close)));closed.forEach(e=>{e.style.opacity=String(smooth((close-.84)/.16));});}
 function ui(label){status.textContent=label;pet.classList.toggle('still',!canMove());sleepButton.setAttribute('aria-pressed',String(asleep));sleepButton.textContent=asleep?'Wake up':'Sleep';danceButton.setAttribute('aria-pressed',String(dancing));danceButton.textContent=dancing?'Stop dancing':'Try dancing';pet.setAttribute('aria-label',asleep?'Wake the eagle':'Say hello to the eagle');document.querySelectorAll('[data-action],#dance').forEach(b=>b.disabled=asleep||waking||!canMove());}
 const happyEyes=host.querySelector('.happy-eyes');
 function resetFace(){eye(asleep?1:0);happyEyes.style.opacity='0';mouth.style.opacity='0';wingLeft.removeAttribute('transform');wingRight.removeAttribute('transform');}
 function play(name){if(asleep||waking||!canMove()||!['hello','happy','wings','wobble','blink','talk'].includes(name))return;dancing=false;action={name,start:performance.now(),duration:{hello:2600,happy:3000,wings:2400,wobble:1600,blink:360,talk:2000}[name]};if(name==='blink'){blinkStart=performance.now();action=null;}nextIdle=performance.now()+12000;ui({hello:'Hello there',happy:'Happy to see you',wings:'Wing flap',wobble:'Soft body wobble',blink:'Blink',talk:'Beak chatter'}[name]);start();}
 function sleep(){action=null;dancing=false;asleep=!asleep;sleepStart=performance.now();waking=!asleep&&canMove();wakeStart=performance.now();nextIdle=wakeStart+11000;resetFace();ui(asleep?'Resting on the branch':waking?'Waking up slowly':'Ready');start();}
 function tick(now){raf=0;frames++;const delta=last?Math.min(now-last,50):16;last=now;const moving=canMove();if(moving)phase+=delta/1000;
  let scaleX=1,scaleY=1,rotation=0,closure=asleep?1:0,wingAngle=0,talk=0,happy=0;
  if(moving){const p=phase*Math.PI*2/4.8;scaleX=1+.006*Math.sin(p);scaleY=1+.009*Math.cos(p);rotation=asleep?0:.35*Math.sin(p);if(asleep){scaleX=1+.009*Math.sin(p);scaleY=1-.009*Math.sin(p);talk=.72*Math.sin(Math.PI*((now-sleepStart)%5200)/5200)**4;}
   if(now>nextBlink&&!asleep&&!waking){blinkStart=now;nextBlink=now+3500+Math.random()*2500;}
   const bt=(now-blinkStart)/360;if(!asleep&&!waking&&bt>=0&&bt<1)closure=Math.sin(bt*Math.PI)**2;
   if(waking){const elapsed=now-wakeStart,t=elapsed/3200,eyeTime=elapsed/2100;talk=smooth((t-.08)/.28)*(1-smooth((t-.62)/.3));closure=eyeTime<.6?1-smooth(eyeTime/.6):eyeTime<.82?.8*Math.sin((eyeTime-.6)/.22*Math.PI)**2:0;if(t>=1){waking=false;ui('Awake and ready');nextBlink=now+3000;}}
   if(dancing){const a=phase*Math.PI*2/.85;scaleX=1+.025*Math.sin(a);scaleY=1-.025*Math.sin(a);rotation=1.4*Math.cos(a);wingAngle=6*(.5+.5*Math.sin(a));happy=1;}
   if(action){const t=(now-action.start)/action.duration,envelope=Math.sin(Math.PI*Math.min(1,t))**2;const name=action.name;
    if(name==='wings'||name==='hello')wingAngle=(name==='hello'?22:34)*(.5+.5*Math.sin(t*Math.PI*4))*envelope;
    if(name==='hello'||name==='happy')happy=smooth(t/.18)*(1-smooth((t-.82)/.18));
    if(name==='hello'){scaleY+=.018*envelope;talk=envelope*(.5+.5*Math.sin(t*Math.PI*4));}
    if(name==='wobble'){const wobble=.04*Math.sin(t*Math.PI*4)*envelope;scaleX+=wobble;scaleY-=wobble;}
    if(name==='talk')talk=envelope*(.5+.5*Math.sin(t*Math.PI*6));
    if(t>=1){action=null;nextIdle=now+8000+Math.random()*6000;ui('Watching over your day');}
   }
   if(idle&&!action&&!asleep&&!dancing&&!waking&&now>nextIdle)play(['happy','wings','hello','wobble'][idleIndex++%4]);
  }
  body.style.transform=`rotate(${rotation}deg) scale(${scaleX},${scaleY})`;eye(closure);happyEyes.style.opacity=String(happy*(1-closure));
  host.querySelector('.perched-wings').style.transform=body.style.transform;
  // Expression artwork stays at its original size. Never scale eyes or stretch the beak.
  mouth.style.opacity=String(smooth(talk/.12));jaw.setAttribute('transform',`translate(0 ${-54*(1-Math.max(0,Math.min(1,talk)))})`);
  wingLeft.setAttribute('transform',`rotate(${wingAngle} 322 530)`);wingRight.setAttribute('transform',`rotate(${-wingAngle} 1065 530)`);
  zs.style.opacity=asleep?'1':waking?String(1-smooth((now-wakeStart)/500)):'0';zs.style.transform=`translateY(${moving?-5*Math.sin(phase*1.5):0}px)`;
  host.querySelector('.notes').style.opacity=dancing?'1':'0';notes.forEach((e,i)=>{const t=(phase/2.4+i*.25)%1;e.style.opacity=dancing?String(Math.sin(t*Math.PI)):0;e.style.transform=`translateY(${25-135*t}px) rotate(${-12+26*t}deg)`;});
  if(moving)raf=requestAnimationFrame(tick);
 }
 function start(){if(!raf){last=0;tick(performance.now());}}
 document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>play(b.dataset.action));sleepButton.onclick=sleep;danceButton.onclick=()=>{if(asleep||waking||!canMove())return;action=null;dancing=!dancing;ui(dancing?'Moving to the beat':'Watching over your day');nextIdle=performance.now()+10000;start()};pet.onclick=()=>asleep?sleep():play('hello');
 document.querySelector('#idle').onchange=e=>{idle=e.target.checked;nextIdle=performance.now()+9000;};
 function motionChanged(){action=null;dancing=false;waking=false;resetFace();ui(canMove()?'Watching over your day':'Motion paused');start();}
 document.querySelector('#motion').onchange=e=>{motion=e.target.checked;motionChanged()};media.addEventListener('change',motionChanged);
 document.querySelector('#size').onchange=e=>host.dataset.size=e.target.value;document.querySelector('#light').onchange=e=>document.documentElement.classList.toggle('light',e.target.checked);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;action=null;resetFace();}else{nextIdle=performance.now()+9000;nextBlink=performance.now()+2500;start();}});
 window.eaglePreview={play,sleep,get state(){return {asleep,dancing,waking,action:action?.name||null,moving:canMove(),frames,idleIndex}}};
 ui('Watching over your day');start();
})();
