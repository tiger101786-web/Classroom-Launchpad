/* Preview rig: one frame clock; stationary basket; native-resolution source layers. */
window.mountNuggetRig=async function(host,{assetBase='nugget-pet/',onState=()=>{},respectReducedMotion=true}={}){
 const fallback=host.querySelector('img');let options={motion:true,visible:true,platform:true,headwear:'none'};
 // Use the actual load event: embedded file previews may reject decode()
 // even when the image can be loaded and drawn normally.
 const load=src=>new Promise((resolve,reject)=>{
  const image=new Image();
  const timeout=setTimeout(()=>{cleanup();reject(new Error('Timed out loading '+src))},15000);
  function cleanup(){clearTimeout(timeout);image.onload=null;image.onerror=null}
  image.onload=()=>{cleanup();resolve(image)};
  image.onerror=()=>{cleanup();reject(new Error('Cannot load '+src+'. Open the local web preview instead of the file preview.'))};
  image.src=new URL(assetBase+src,document.baseURI).href;
 });
 try{
 const [original,body,basket]=await Promise.all(['nugget-concept.png','body.png','basket.png'].map(load));
 const canvas=document.createElement('canvas');canvas.width=canvas.height=2048;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Animated chicken nugget in a red basket');host.insertBefore(canvas,fallback);fallback.hidden=true;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let action='',started=0,clock=0,last=0,dance=false,asleep=false,closed=0,blinkAt=3.4,blinkStart=-10,raf=0,enabled=!reduced.matches;

 const durations={hello:2.4,happy:2.1,blink:.32,talk:2,hands:2,wave:2.2,shake:1.1,look:3.2,foot:1.5,wake:1.8};
 const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},envelope=(t,d)=>smooth(t/.25)*smooth((d-t)/.35);
 const leftArm=new Path2D('M282 429 C260 436 242 456 234 485 C223 514 221 546 232 568 C242 594 275 596 297 576 C318 556 325 521 316 492 L303 451Z');
 const rightArm=new Path2D('M700 430 C719 433 744 452 757 479 C770 504 785 546 772 569 C760 591 729 590 710 568 C694 548 690 515 687 481Z');
 const leftFoot=new Path2D('M370 657 C349 674 335 696 342 717 C347 738 387 743 421 732 C450 726 467 711 456 690 L437 661Z');
 const rightFoot=new Path2D('M566 657 C552 674 542 698 551 718 C560 738 607 741 640 732 C670 726 678 710 660 689 L638 661Z');
 const image=(source)=>ctx.drawImage(source,0,0,1024,1024);
 function piece(path,px,py,angle=0,lift=0){ctx.save();ctx.translate(px,py-lift);ctx.rotate(angle);ctx.translate(-px,-py);ctx.clip(path);image(original);ctx.restore()}
 function eye(x,y,open,gaze,happy){
  ctx.save();ctx.translate(x+gaze,y);ctx.lineCap='round';ctx.lineWidth=7;ctx.strokeStyle='#241009';
  if(open<.07||happy>.8){ctx.beginPath();ctx.moveTo(-18,0);ctx.quadraticCurveTo(0,happy>.8?-13:10,18,0);ctx.stroke()}
  else{ctx.scale(1,Math.max(.06,open));ctx.beginPath();ctx.ellipse(0,0,24,25,0,0,Math.PI*2);ctx.clip();ctx.drawImage(original,0,0,original.width,original.height,-x,-y,1024,1024)}
  ctx.restore();
 }
 function mouth(open,smile){ctx.save();ctx.translate(516,361);ctx.lineCap='round';ctx.lineWidth=7;ctx.strokeStyle='#241009';
  if(open>.08){ctx.beginPath();ctx.ellipse(0,6,30+smile*5,4+open*24,0,0,Math.PI*2);ctx.fillStyle='#190907';ctx.fill();ctx.stroke();ctx.save();ctx.clip();ctx.fillStyle='#ae5b45';ctx.beginPath();ctx.ellipse(0,23,14,7,0,0,Math.PI*2);ctx.fill();ctx.restore()}
  else{ctx.beginPath();ctx.moveTo(-34-smile*5,-2);ctx.quadraticCurveTo(0,25+smile*8,34+smile*5,-2);ctx.stroke()}
  ctx.restore();
 }
 function headphones(){ctx.save();ctx.lineWidth=17;ctx.strokeStyle='#6e1019';ctx.beginPath();ctx.ellipse(510,285,237,207,0,Math.PI,Math.PI*2);ctx.stroke();ctx.lineWidth=6;ctx.strokeStyle='#f4bd69';ctx.stroke();for(const x of [280,741]){ctx.fillStyle='#9e2232';ctx.strokeStyle='#f4bd69';ctx.lineWidth=4;ctx.beginPath();ctx.roundRect(x-25,235,50,93,16);ctx.fill();ctx.stroke();ctx.fillStyle='#3e2020';ctx.beginPath();ctx.roundRect(x-15,246,30,70,12);ctx.fill()}ctx.restore()}
 function symbols(t,sleep){ctx.save();ctx.font='bold 64px Georgia';ctx.textAlign='center';ctx.lineWidth=5;ctx.strokeStyle='#392224';ctx.fillStyle=sleep?'#ffe1a3':'#ffdb77';for(let i=0;i<3;i++){const phase=(t/(sleep?2.5:1.9)+i/3)%1;ctx.globalAlpha=Math.sin(Math.PI*phase);const x=(sleep?815:170)+(i%2?50:-20)+Math.sin(phase*5+i)*16,y=370-phase*210+i*16;const text=sleep?'Z':i%2?'♫':'♪';ctx.strokeText(text,x,y);ctx.fillText(text,x,y)}ctx.restore()}
 function sync(){host.dataset.state=asleep?'sleep':dance?'dance':action||'idle';onState(host.dataset.state,enabled)}
 function play(name){if(!enabled||asleep)return;dance=false;action=name;started=clock;if(name==='blink')blinkStart=clock;sync();schedule()}
 function render(){
  const elapsed=clock-started,d=durations[action]||1,e=action?envelope(elapsed,d):0,breath=Math.sin(clock*Math.PI*2/3.2),beat=Math.sin(clock*Math.PI*2/1.05);
  if(action&&elapsed>d){action='';sync()}
  let wave=0,rightWave=0,happy=action==='happy'?e:0,gaze=0,jaw=0,shake=0,leftLift=0,rightLift=0;
  if(action==='hello'||action==='wave')wave=e*(1.4+.32*Math.sin(elapsed*15));
  if(action==='hello'){happy=e*.65;jaw=e*.25*(.5+.5*Math.sin(elapsed*12))}
  if(action==='hands'){wave=e*(.45+.3*Math.sin(elapsed*12));rightWave=e*(.45-.3*Math.sin(elapsed*12))}
  if(action==='talk')jaw=e*(.2+.8*(.5+.5*Math.sin(elapsed*13)));
  if(action==='shake')shake=e*Math.sin(elapsed*34)*.022;
  if(action==='look')gaze=Math.sin(elapsed/d*Math.PI*2)*e*7;
  if(action==='foot')leftLift=e*18;
  if(action==='wake')jaw=e*Math.sin(Math.PI*clamp(elapsed/d))*.85;
  if(dance){wave=.35+.25*beat;rightWave=.35-.25*beat;leftLift=Math.max(0,beat)*10;rightLift=Math.max(0,-beat)*10;happy=1;jaw=0}
  if(asleep)jaw=.5+.3*(breath*.5+.5);
  if(enabled&&clock>blinkAt&&!asleep){blinkStart=clock;blinkAt=clock+3.2+Math.random()*2.1}
  const bt=(clock-blinkStart)/.3,blink=bt>=0&&bt<=1?Math.sin(bt*Math.PI):0;
  const eyeOpen=1-Math.max(closed,blink);
  ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,1024,1024);if(options.platform)image(basket);
  piece(leftFoot,400,722,0,leftLift);piece(rightFoot,606,722,0,rightLift);
  ctx.save();const sy=1+(enabled?.006*breath:0),skew=enabled?(shake+(dance?beat*.012:0)):0;ctx.transform(1,0,skew,sy,-skew*668,668*(1-sy));
  // Register the isolated body back to the approved composite's coordinates.
  ctx.save();ctx.beginPath();ctx.rect(0,0,1024,672);ctx.clip();ctx.drawImage(body,98,10,795,795);ctx.restore();
  piece(leftArm,291,448,wave);piece(rightArm,713,448,-rightWave);
  eye(438,322,eyeOpen,gaze,happy);eye(597,322,eyeOpen,gaze,happy);mouth(jaw,happy);
  if(happy>.1){ctx.strokeStyle='#241009';ctx.lineWidth=6;ctx.lineCap='round';for(const x of [438,597]){ctx.beginPath();ctx.moveTo(x-17,285-happy*7);ctx.quadraticCurveTo(x,276-happy*7,x+17,285-happy*7);ctx.stroke()}}
  if(dance||options.headwear==='headphones')headphones();ctx.restore();
  if(enabled&&(asleep||dance))symbols(clock,asleep);
  canvas.dataset.frame=String(Math.round(clock*1000));
 }

 function tick(now){raf=0;const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(enabled)clock+=dt;closed+=(Number(asleep)-closed)*Math.min(1,dt*8);render();schedule()}
 function schedule(){if(!raf&&enabled&&options.visible&&!document.hidden)raf=requestAnimationFrame(tick)}
 function update(next){
  const previousSleep=asleep;options={...options,...next};
  enabled=options.motion&&(!respectReducedMotion||!reduced.matches);asleep=Boolean(options.asleep);
  dance=Boolean(options.radio&&!asleep&&enabled);
  if(previousSleep&&!asleep){action='wake';started=clock}
  if(asleep){action='';dance=false}
  if(!enabled){action='';dance=false;closed=Number(asleep);blinkStart=-10}
  if(!enabled||!options.visible){cancelAnimationFrame(raf);raf=0;last=0}
  sync();render();schedule();
 }
 reduced.addEventListener('change',()=>update(options));
 document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);raf=0;last=0;if(!document.hidden)schedule()});
 const api={play,update,render,getState:()=>({action,dance,asleep,enabled,clock}),reset(){action='';dance=false;asleep=false;closed=0;clock=0;last=0;blinkStart=-10;blinkAt=3.4}};
 host.dataset.ready='true';sync();render();schedule();return api;
 }catch(error){host.dataset.error=error.message;throw error}
};
