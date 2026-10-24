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
<linearGradient id="headphone-metal"><stop stop-color="#211c19"/><stop offset=".3" stop-color="#6b5240"/><stop offset=".52" stop-color="#b08a50"/><stop offset=".72" stop-color="#513a29"/><stop offset="1" stop-color="#201915"/></linearGradient><linearGradient id="headphone-pad"><stop stop-color="#100e0d"/><stop offset=".5" stop-color="#51463c"/><stop offset="1" stop-color="#171311"/></linearGradient> </defs>
 <g class="branch"><image href="branch-fitted-v4.png" y="60" width="1374" height="1145"/></g>
 <g class="body"><g class="stable-face"><g clip-path="url(#bird-crop)"><g clip-path="url(#left-wing)"><image href="wing-backing-v2.png" width="1374" height="1145"/></g><g clip-path="url(#right-wing)"><image href="wing-backing-v2.png" width="1374" height="1145"/></g><g mask="url(#torso-mask)">${artwork}</g></g>
 <g class="happy-eyes" opacity="0" mask="url(#happy-mask)"><svg x="375" y="210" width="320" height="275" style="width:320px;height:275px;overflow:hidden" viewBox="375 210 320 275"><image class="happy-left" href="happy-open-eyes-v4.png" width="1374" height="1145"/></svg><svg x="720" y="210" width="300" height="275" style="width:300px;height:275px;overflow:hidden" viewBox="720 210 300 275"><image class="happy-right" href="happy-open-eyes-v4.png" width="1374" height="1145"/></svg></g>
 <g class="gaze" opacity="0"><g clip-path="url(#left-eye)"><image class="gaze-art" href="approved-eagle.png" width="1374" height="1145"/></g><g clip-path="url(#right-eye)"><image class="gaze-art" href="approved-eagle.png" width="1374" height="1145"/></g></g><g class="lids"><g clip-path="url(#left-eye)"><rect class="lid-left" x="492" y="305" width="125" height="125" fill="url(#lid)"/><path class="closed-eye" d="M507 372Q549 400 601 377" fill="none" stroke="#5b4738" stroke-width="6" stroke-linecap="round"/></g><g clip-path="url(#right-eye)"><rect class="lid-right" x="791" y="305" width="125" height="125" fill="url(#lid)"/><path class="closed-eye" d="M805 377Q851 400 899 372" fill="none" stroke="#5b4738" stroke-width="6" stroke-linecap="round"/></g></g>
 <g class="beak-motion" opacity="0"><g clip-path="url(#jaw-crop)"><g class="lower-jaw"><image href="open-beak-v2.png" width="1374" height="1145" clip-path="url(#jaw-crop)"/></g></g><g class="upper-beak" clip-path="url(#upper-beak-crop)">${artwork}</g></g><g class="headphones" style="display:none;pointer-events:none"><path d="M357 340C310 -40 1090 -40 1048 340" fill="none" stroke="#171310" stroke-width="57" stroke-linecap="round"/><path d="M357 340C310 -40 1090 -40 1048 340" fill="none" stroke="url(#headphone-metal)" stroke-width="38" stroke-linecap="round"/><path d="M361 295C340 3 1065 3 1044 295" fill="none" stroke="#dab87b" stroke-width="5" stroke-linecap="round"/><g transform="rotate(12 357 369)"><rect x="297" y="251" width="120" height="241" rx="58" fill="url(#headphone-pad)" stroke="#15110f" stroke-width="9"/><rect x="310" y="269" width="94" height="205" rx="42" fill="url(#headphone-metal)" stroke="#caab72" stroke-width="6"/><rect x="323" y="283" width="68" height="178" rx="31" fill="#382b24" stroke="#876b4c" stroke-width="4"/><path d="M345 395Q384 356 365 329Q331 340 345 395M345 395L369 348" fill="#e4c586" stroke="#e4c586" stroke-width="4"/><path d="M343 429H371" stroke="#e9be65" stroke-width="7" stroke-linecap="round"/></g><g transform="rotate(-12 1048 369)"><rect x="988" y="251" width="120" height="241" rx="58" fill="url(#headphone-pad)" stroke="#15110f" stroke-width="9"/><rect x="1001" y="269" width="94" height="205" rx="42" fill="url(#headphone-metal)" stroke="#caab72" stroke-width="6"/><rect x="1014" y="283" width="68" height="178" rx="31" fill="#382b24" stroke="#876b4c" stroke-width="4"/><path d="M1036 395Q1075 356 1056 329Q1022 340 1036 395M1036 395L1060 348" fill="#e4c586" stroke="#e4c586" stroke-width="4"/><path d="M1034 429H1062" stroke="#e9be65" stroke-width="7" stroke-linecap="round"/></g></g></g></g>
 <g class="perched-wings" style="transform-origin:687px 955px"><g class="wing-left" clip-path="url(#left-wing)">${artwork}</g><g class="wing-right" clip-path="url(#right-wing)">${artwork}</g></g>
 <g class="zs" opacity="0" font-family="Segoe UI,sans-serif" font-weight="700"><text x="1045" y="225" font-size="70">z</text><text x="1140" y="128" font-size="90">Z</text><text x="1240" y="20" font-size="110">Z</text></g>
 <g class="notes" font-family="Arial,sans-serif" font-weight="bold" font-size="140"><text x="-5" y="550">♪</text><text x="1250" y="550">♫</text><text x="80" y="280">♫</text><text x="1160" y="265">♪</text></g>
 </svg></button><div class="eagle-speech" role="status" hidden><span class="speech-label">BALD EAGLE</span><span class="speech-message"></span></div>`;
 const pet=host.querySelector('.eagle'),body=host.querySelector('.body'),wingLeft=host.querySelector('.wing-left'),wingRight=host.querySelector('.wing-right'),jaw=host.querySelector('.lower-jaw'),lids=[...host.querySelectorAll('.lid-left,.lid-right')],closed=[...host.querySelectorAll('.closed-eye')],mouth=host.querySelector('.beak-motion'),zs=host.querySelector('.zs'),notes=[...host.querySelectorAll('.notes text')];
 const status=document.querySelector('#state'), sleepButton=document.querySelector('#sleep'),danceButton=document.querySelector('#dance'),media=matchMedia('(prefers-reduced-motion: reduce)');
 let asleep=false,dancing=false,waking=false,motion=true,idle=true,action=null,phase=0,last=0,blinkStart=-10000,nextBlink=2000,nextIdle=1500,idleIndex=0,wakeStart=0,sleepStart=0,raf=0,frames=0;
 const speech=host.querySelector('.eagle-speech');let speechTimer=0,lastSpeech=-20000,speechIndex=0;
 function say(text){if(asleep||waking||document.hidden)return;speech.querySelector('.speech-message').textContent=text;speech.hidden=false;lastSpeech=performance.now();clearTimeout(speechTimer);speechTimer=setTimeout(()=>speech.hidden=true,3800);}
 function hush(){clearTimeout(speechTimer);speech.hidden=true;}
 const canMove=()=>motion&&!media.matches&&!document.hidden;
 const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
 function eye(close){lids.forEach((e,i)=>{const c=Math.max(0,Math.min(1,close));e.setAttribute('height',String(125*c));closed[i].style.opacity=String(smooth((c-.84)/.16));});}
 function ui(label){status.textContent=label;host.querySelector('.headphones').style.display=dancing?'':'none';if(asleep||waking)hush();pet.classList.toggle('still',!canMove());sleepButton.setAttribute('aria-pressed',String(asleep));sleepButton.textContent=asleep?'Wake up':'Sleep';danceButton.setAttribute('aria-pressed',String(dancing));danceButton.textContent=dancing?'Stop dancing':'Try dancing';pet.setAttribute('aria-label',asleep?'Wake the eagle':'Say hello to the eagle');document.querySelectorAll('[data-action],#dance').forEach(b=>b.disabled=asleep||waking||!canMove());}
 const happyEyes=host.querySelector('.happy-eyes'),gaze=host.querySelector('.gaze'),gazeArt=[...host.querySelectorAll('.gaze-art')],happySides=[...happyEyes.children];
 function resetFace(){eye(asleep?1:0);happyEyes.style.opacity='0';gaze.style.opacity='0';happySides.forEach(e=>e.style.opacity='1');mouth.style.opacity='0';wingLeft.removeAttribute('transform');wingRight.removeAttribute('transform');}
 function play(name){if(asleep||waking||!canMove()||!['hello','wings','fast-wings','wobble','blink','talk','curious'].includes(name))return;dancing=false;action={name,start:performance.now(),duration:{hello:2600,curious:3600,wings:2400,'fast-wings':2400,wobble:1600,blink:360,talk:2000}[name]};if(name==='blink'){blinkStart=performance.now();action=null;}if(name==='hello')say('Hey there! Ready to soar?');else if(name==='curious'&&performance.now()-lastSpeech>18000)say('What are we exploring today?');else if(name==='talk'&&performance.now()-lastSpeech>18000)say(['One step at a time. You’ve got this!','Keeping an eagle eye on things.','Ready for our next challenge?'][speechIndex++%3]);nextIdle=performance.now()+3500;ui({hello:'Hello there',curious:'Curious glance',wings:'Wing flap','fast-wings':'Fast wing flap',wobble:'Soft body wobble',blink:'Blink',talk:'Beak chatter'}[name]);start();}
 function sleep(){action=null;dancing=false;asleep=!asleep;sleepStart=performance.now();waking=!asleep&&canMove();wakeStart=performance.now();nextIdle=wakeStart+4500;resetFace();ui(asleep?'Resting on the branch':waking?'Waking up slowly':'Ready');start();}
 function tick(now){raf=0;frames++;const delta=last?Math.min(now-last,50):16;last=now;const moving=canMove();if(moving)phase+=delta/1000;
  let scaleX=1,scaleY=1,rotation=0,closure=asleep?1:0,wingAngle=0,talk=0,happy=0,gazeX=0,gazeY=0,gazeAmount=0,asymmetric=0;
  if(moving){const p=phase*Math.PI*2/4.8;scaleX=1+.006*Math.sin(p);scaleY=1+.009*Math.cos(p);rotation=asleep?0:.35*Math.sin(p);if(asleep){scaleX=1+.009*Math.sin(p);scaleY=1-.009*Math.sin(p);talk=.72*Math.sin(Math.PI*((now-sleepStart)%5200)/5200)**4;}
   if(now>nextBlink&&!asleep&&!waking){blinkStart=now;nextBlink=now+3500+Math.random()*2500;}
   const bt=(now-blinkStart)/360;if(!asleep&&!waking&&bt>=0&&bt<1)closure=Math.sin(bt*Math.PI)**2;
   if(waking){const elapsed=now-wakeStart,t=elapsed/3200,eyeTime=elapsed/2100;talk=smooth((t-.08)/.28)*(1-smooth((t-.62)/.3));closure=eyeTime<.6?1-smooth(eyeTime/.6):eyeTime<.82?.8*Math.sin((eyeTime-.6)/.22*Math.PI)**2:0;if(t>=1){waking=false;say('Good stretch. Let’s get going!');ui('Awake and ready');nextBlink=now+3000;}}
   if(dancing){const a=phase*Math.PI*2/.85;scaleX=1+.025*Math.sin(a);scaleY=1-.025*Math.sin(a);rotation=1.4*Math.cos(a);wingAngle=6*(.5+.5*Math.sin(a));}
   if(action){const t=(now-action.start)/action.duration,envelope=Math.sin(Math.PI*Math.min(1,t))**2;const name=action.name;
    if(name==='wings'||name==='hello')wingAngle=(name==='hello'?22:34)*(.5+.5*Math.sin(t*Math.PI*4))*envelope;
    if(name==='fast-wings')wingAngle=42*(.5-.5*Math.cos(t*Math.PI*14))*smooth(t/.1)*(1-smooth((t-.9)/.1));
    if(name==='hello'){scaleY+=.018*envelope;talk=envelope*(.5+.5*Math.sin(t*Math.PI*4));}
    if(name==='wobble'){const wobble=.04*Math.sin(t*Math.PI*4)*envelope;scaleX+=wobble;scaleY-=wobble;}
    const expression=smooth(t/.2)*(1-smooth((t-.8)/.2));
    if(name==='curious'){happy=.85*expression;asymmetric=expression;gazeAmount=expression;gazeX=9*expression*(1-2*smooth((t-.45)/.2));}
    if(name==='talk')talk=envelope*(.5+.5*Math.sin(t*Math.PI*6));
    if(t>=1){action=null;nextIdle=now+1000+Math.random()*1000;ui('Watching over your day');}
   }
   if(idle&&!action&&!asleep&&!dancing&&!waking&&now>nextIdle)play(['talk','wings','fast-wings','talk','wings','curious','talk','wings','fast-wings','talk','wings','hello','talk','wings','wobble'][idleIndex++%15]);
  }
  body.style.transform=`rotate(${rotation}deg) scale(${scaleX},${scaleY})`;eye(closure);happyEyes.style.opacity=String(happy*(1-closure));happySides[0].style.opacity='1';happySides[1].style.opacity=String(1-.8*asymmetric);gaze.style.opacity=String(gazeAmount*(1-closure));gazeArt.forEach(e=>e.setAttribute('transform',`translate(${gazeX} ${gazeY})`));
  host.querySelector('.perched-wings').style.transform=body.style.transform;
  // Expression artwork stays at its original size. Never scale eyes or stretch the beak.
  mouth.style.opacity=String(smooth(talk/.12));jaw.setAttribute('transform',`translate(0 ${-54*(1-Math.max(0,Math.min(1,talk)))})`);
  wingLeft.setAttribute('transform',`rotate(${wingAngle} 322 530)`);wingRight.setAttribute('transform',`rotate(${-wingAngle} 1065 530)`);
  zs.style.opacity=asleep?'1':waking?String(1-smooth((now-wakeStart)/500)):'0';zs.style.transform=`translateY(${moving?-5*Math.sin(phase*1.5):0}px)`;
  host.querySelector('.notes').style.opacity=dancing?'1':'0';notes.forEach((e,i)=>{const t=(phase/2.4+i*.25)%1;e.style.opacity=dancing?String(Math.sin(t*Math.PI)):0;e.style.transform=`translateY(${25-135*t}px) rotate(${-12+26*t}deg)`;});
  if(moving)raf=requestAnimationFrame(tick);
 }
 function start(){if(!raf){last=0;tick(performance.now());}}
 document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>play(b.dataset.action));sleepButton.onclick=sleep;danceButton.onclick=()=>{if(asleep||waking||!canMove())return;action=null;dancing=!dancing;if(dancing)say('Now that’s a soaring beat!');ui(dancing?'Moving to the beat':'Watching over your day');nextIdle=performance.now()+1500;start()};pet.onclick=()=>asleep?sleep():play('hello');
 document.querySelector('#idle').onchange=e=>{idle=e.target.checked;nextIdle=performance.now()+1500;};
 function motionChanged(){action=null;dancing=false;waking=false;resetFace();ui(canMove()?'Watching over your day':'Motion paused');start();}
 document.querySelector('#motion').onchange=e=>{motion=e.target.checked;motionChanged()};media.addEventListener('change',motionChanged);
 document.querySelector('#size').onchange=e=>host.dataset.size=e.target.value;document.querySelector('#light').onchange=e=>document.documentElement.classList.toggle('light',e.target.checked);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){hush();cancelAnimationFrame(raf);raf=0;action=null;resetFace();}else{nextIdle=performance.now()+1500;nextBlink=performance.now()+2500;start();}});
 window.eaglePreview={play,sleep,get state(){return {asleep,dancing,waking,action:action?.name||null,moving:canMove(),frames,idleIndex}}};
 ui('Watching over your day');start();
})();
