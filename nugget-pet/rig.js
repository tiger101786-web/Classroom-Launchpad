/* Preview rig: one frame clock; stationary basket; native-resolution source layers. */
window.mountNuggetRig=async function(host,{assetBase='nugget-pet/',onState=()=>{},respectReducedMotion=true}={}){
 const fallback=host.querySelector('img');let options={motion:true,visible:true,platform:true,headwear:'none'};
 const basketAccessories=window.createNuggetBasketAccessories?.();let requestedAccessory='none';
 host.dataset.basketAccessory='none';
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
 let [original,body,basket]=await Promise.all(['nugget-concept.png','body.png','basket.png'].map(load));
 let eyeSource=original;
 let photographicSkin=false;
 let photoBodySource=null;
 let photoFullBodySource=null;
 let photoArmSources=null;
 let photoDeformer;
 let referenceSkin=false;
 let requestedSkin='Golden',skinVersion=0;host.dataset.renderedSkin='Golden';
 async function selectSkin(name){
  name=Object.hasOwn(window.nuggetSkins||{},name)?name:'Golden';if(name===requestedSkin)return;
  requestedSkin=name;const version=++skinVersion;host.dataset.skinLoading='true';
  try{
   const layers=await nuggetSkinLayers(name);if(version!==skinVersion)return;
   original=layers.original;body=layers.body;basket=layers.basket;eyeSource=layers.eyes||original;referenceSkin=Boolean(layers.reference);
   photographicSkin=Boolean(layers.photographic);
   photoBodySource=layers.torso||layers.wholeBody||null;
   photoFullBodySource=layers.wholeBody||null;
   photoArmSources=layers.armLayers||null;
   host.dataset.renderedSkin=name;delete host.dataset.skinError;render();schedule();
  }catch(error){if(version===skinVersion){requestedSkin=host.dataset.renderedSkin;host.dataset.skinError=error.message;console.warn('Nugget skin could not load:',error.message)}}
  finally{if(version===skinVersion)delete host.dataset.skinLoading}
 }
 const canvas=document.createElement('canvas');canvas.width=canvas.height=2048;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Animated chicken nugget in a red basket');host.insertBefore(canvas,fallback);fallback.hidden=true;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let action='',started=0,clock=0,last=0,dance=false,asleep=false,closed=0,blinkAt=3.4,blinkStart=-10,raf=0,enabled=!reduced.matches;

 const idleActions=['happy','look','foot','hands','wave','talk','shake','hello'];
 let nextIdle=3.5,idleIndex=0,speaking=false,speechStarted=0;
 const durations={hello:2.4,happy:2.1,blink:.32,talk:2,hands:2,wave:2.2,shake:1.1,look:3.2,foot:1.5,wake:1.8};
 const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},envelope=(t,d)=>smooth(t/.25)*smooth((d-t)/.35);
 const leftArm=new Path2D('M282 429 C260 436 242 456 234 485 C223 514 221 546 232 568 C242 594 275 596 297 576 C318 556 325 521 316 492 L303 451Z');
 const rightArm=new Path2D('M700 430 C719 433 744 452 757 479 C770 504 785 546 772 569 C760 591 729 590 710 568 C694 548 690 515 687 481Z');
 const leftFoot=new Path2D('M370 657 C349 674 335 696 342 717 C347 738 387 743 421 732 C450 726 467 711 456 690 L437 661Z');
 const rightFoot=new Path2D('M566 657 C552 674 542 698 551 718 C560 738 607 741 640 732 C670 726 678 710 660 689 L638 661Z');
 const image=(source)=>ctx.drawImage(source,0,0,1024,1024);
 function piece(path,px,py,angle=0,lift=0){ctx.save();ctx.translate(px,py-lift);ctx.rotate(angle);ctx.translate(-px,-py);ctx.clip(path);image(original);ctx.restore()}
 function createPhotoDeformer(){
  const surface=document.createElement('canvas');surface.width=surface.height=2048;
  const gl=surface.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:true,preserveDrawingBuffer:true});
  if(!gl)return null;
  const vertex=`attribute vec2 p;varying vec2 uv;uniform vec4 pose;
   void main(){uv=p/1024.;vec2 q=p;
    float l=1.-smoothstep(80.,120.,abs(p.x-390.));
    float r=1.-smoothstep(80.,120.,abs(p.x-610.));
    q.y-=smoothstep(610.,660.,p.y)*(pose.z*l+pose.w*r);
    gl_Position=vec4(q.x/512.-1.,1.-q.y/512.,0.,1.);
   }`;
  const fragment='precision highp float;varying vec2 uv;uniform sampler2D art;void main(){gl_FragColor=texture2D(art,uv);}';
  const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};
  const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
  const vertices=[];for(let y=0;y<1024;y+=8)for(let x=0;x<1024;x+=8)vertices.push(x,y,x+8,y,x,y+8,x+8,y,x+8,y+8,x,y+8);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);const attribute=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(attribute);gl.vertexAttribPointer(attribute,2,gl.FLOAT,false,0,0);
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
  for(const wrap of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,wrap,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.uniform1i(gl.getUniformLocation(program,'art'),0);const pose=gl.getUniformLocation(program,'pose');gl.viewport(0,0,2048,2048);let uploaded;
  return (source,left,right,footLeft,footRight)=>{
   if(gl.isContextLost())return null;
   if(uploaded!==source){gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);uploaded=source;}
   gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform4f(pose,left,right,footLeft,footRight);gl.drawArrays(gl.TRIANGLES,0,vertices.length/2);return surface;
  };
 }
 function photoBody(leftLift,rightLift,separateArms){
  const source=separateArms?photoBodySource:photoFullBodySource;
  if(leftLift+rightLift<.01){image(source);return;}
  if(photoDeformer===undefined){try{photoDeformer=createPhotoDeformer();}catch(error){photoDeformer=null;console.warn('Nugget motion fallback:',error.message)}host.dataset.photoMotion=photoDeformer?'continuous-mesh':'continuous-canvas';}
  const surface=photoDeformer?.(source,0,0,leftLift,rightLift);
  if(surface)image(surface);
  else{ctx.save();ctx.translate(0,-(leftLift+rightLift)*.2);image(source);ctx.restore();}
 }
 function photoArm(source,px,angle){ctx.save();ctx.translate(px,448);ctx.rotate(angle);ctx.translate(-px,-448);image(source);ctx.restore()}
 function facePalette(){return window.nuggetFacePalette?.(host.dataset.renderedSkin)||{ink:'#491e18',mouth:'#491e18'}}
 function eye(x,y,open,gaze,happy){
  ctx.save();ctx.translate(x+gaze,y);ctx.lineCap='round';ctx.lineWidth=7;ctx.strokeStyle=facePalette().ink;
  if(open<.07||happy>.8){ctx.beginPath();ctx.moveTo(-18,0);ctx.quadraticCurveTo(0,happy>.8?-13:10,18,0);ctx.stroke()}
  else{ctx.scale(1,Math.max(.06,open));ctx.beginPath();ctx.ellipse(0,0,24,25,0,0,Math.PI*2);ctx.clip();ctx.drawImage(eyeSource,0,0,eyeSource.width,eyeSource.height,-x,-y,1024,1024);if(facePalette().eyeRing){ctx.strokeStyle=facePalette().eyeRing;ctx.lineWidth=2;ctx.stroke()}}
  ctx.restore();
 }
 function mouth(open,smile){ctx.save();ctx.translate(516,361);ctx.lineCap='round';ctx.lineWidth=7;ctx.strokeStyle=facePalette().ink;
  if(open>.08){ctx.beginPath();ctx.ellipse(0,6,30+smile*5,4+open*24,0,0,Math.PI*2);ctx.fillStyle=facePalette().mouth;ctx.fill();ctx.stroke();ctx.save();ctx.clip();ctx.fillStyle='#ae5b45';ctx.beginPath();ctx.ellipse(0,23,14,7,0,0,Math.PI*2);ctx.fill();ctx.restore()}
  else{ctx.beginPath();ctx.moveTo(-34-smile*5,-2);ctx.quadraticCurveTo(0,25+smile*8,34+smile*5,-2);ctx.stroke()}
  ctx.restore();
 }
 function headphones(){ctx.save();ctx.lineWidth=17;ctx.strokeStyle='#6e1019';ctx.beginPath();ctx.ellipse(510,285,237,207,0,Math.PI,Math.PI*2);ctx.stroke();ctx.lineWidth=6;ctx.strokeStyle='#f4bd69';ctx.stroke();for(const x of [280,741]){ctx.fillStyle='#9e2232';ctx.strokeStyle='#f4bd69';ctx.lineWidth=4;ctx.beginPath();ctx.roundRect(x-25,235,50,93,16);ctx.fill();ctx.stroke();ctx.fillStyle='#3e2020';ctx.beginPath();ctx.roundRect(x-15,246,30,70,12);ctx.fill()}ctx.restore()}
 // Match Robo-Colt's four outlined notes and the eagle's diagonal z/Z/Z trail.
 function symbols(t,sleep){
  ctx.save();ctx.textAlign='center';ctx.lineJoin='round';
  if(sleep){
   ctx.fillStyle='#9674bd';ctx.strokeStyle='#fff';ctx.lineWidth=4;
   [[790,260,54,'z'],[855,190,69,'Z'],[920,110,84,'Z']].forEach(([x,y,size,label],i)=>{
    const phase=(t/3+i/3)%1,ease=1-Math.pow(1-phase,2);
    ctx.save();ctx.globalAlpha=phase<.25?phase/.25:(1-phase)/.75;
    ctx.translate(x-15+34*ease,y+34-83*ease);ctx.font='700 '+size+'px "Segoe UI",sans-serif';
    ctx.strokeText(label,0,0);ctx.fillText(label,0,0);ctx.restore();
   });
  }else{
   ctx.fillStyle='#a81747';ctx.strokeStyle='#fff1cf';ctx.lineWidth=5;ctx.font='bold 104px Arial,sans-serif';
   [[105,440,'♪'],[915,420,'♫'],[145,225,'♫'],[875,205,'♪']].forEach(([x,y,label],i)=>{
    const phase=(t/2.4+i*.25)%1,ease=1-Math.pow(1-phase,2),size=.8+.28*ease;
    ctx.save();ctx.globalAlpha=phase<.2?phase/.2:phase<.75?1-(phase-.2)/.55*.1:(1-phase)/.25*.9;
    ctx.translate(x,y+25-135*ease);ctx.rotate((-12+26*ease)*Math.PI/180);ctx.scale(size,size);
    ctx.strokeText(label,0,0);ctx.fillText(label,0,0);ctx.restore();
   });
  }
  ctx.restore();
 }
 function sync(){host.dataset.state=asleep?'sleep':dance?'dance':action||'idle';onState(host.dataset.state,enabled)}
 function play(name){if(!enabled||asleep)return;dance=false;action=name;started=clock;if(name==='blink')blinkStart=clock;sync();schedule()}
 function render(){
  const elapsed=clock-started,d=durations[action]||1,e=action?envelope(elapsed,d):0,breath=Math.sin(clock*Math.PI*2/3.2),beat=Math.sin(clock*Math.PI*2/1.05);
  if(action&&elapsed>d){action='';nextIdle=clock+3+Math.random()*2;sync()}
  let wave=0,rightWave=0,happy=action==='happy'?e:0,gaze=0,jaw=0,shake=0,leftLift=0,rightLift=0;
  if(action==='hello'||action==='wave')wave=e*(1.4+.32*Math.sin(elapsed*15));
  if(action==='hello'){happy=e*.65;jaw=e*.25*(.5+.5*Math.sin(elapsed*12))}
  if(action==='hands'){wave=e*(.45+.3*Math.sin(elapsed*12));rightWave=e*(.45-.3*Math.sin(elapsed*12))}
  if(action==='talk')jaw=e*(.2+.8*(.5+.5*Math.sin(elapsed*13)));
  if(action==='shake')shake=e*Math.sin(elapsed*34)*.022;
  if(action==='look')gaze=Math.sin(elapsed/d*Math.PI*2)*e*7;
  if(action==='foot')leftLift=e*(photographicSkin?20:18);
  if(action==='wake')jaw=e*Math.sin(Math.PI*clamp(elapsed/d))*.85;
  if(dance){wave=.35+.25*beat;rightWave=.35-.25*beat;const step=photographicSkin?12:10;leftLift=Math.max(0,beat)*step;rightLift=Math.max(0,-beat)*step;happy=1;jaw=0}
  if(speaking&&enabled&&!asleep)jaw=.2+.8*(.5+.5*Math.sin((clock-speechStarted)*13));
  if(asleep)jaw=.5+.3*(breath*.5+.5);
  if(enabled&&clock>blinkAt&&!asleep){blinkStart=clock;blinkAt=clock+3.2+Math.random()*2.1}
  const bt=(clock-blinkStart)/.3,blink=bt>=0&&bt<=1?Math.sin(bt*Math.PI):0;
  const eyeOpen=1-Math.max(closed,blink);
  ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,1024,1024);if(options.platform){if(!['mcdonalds','chick-fil-a','burger-king','raising-canes'].includes(basketAccessories?.selected))image(basket);basketAccessories?.draw(ctx,basket);}
  if(!photographicSkin){piece(leftFoot,400,722,0,leftLift);piece(rightFoot,606,722,0,rightLift);}
  ctx.save();const sy=1+(enabled?.006*breath:0),skew=enabled?(shake+(dance?beat*.012:0)):0;ctx.transform(1,0,skew,sy,-skew*668,668*(1-sy));
  // Register the isolated body back to the approved composite's coordinates.
  const movingArms=Math.abs(wave)+Math.abs(rightWave)>.001;
  if(photographicSkin)photoBody(leftLift,rightLift,movingArms);
  else{ctx.save();ctx.beginPath();ctx.rect(0,0,1024,672);ctx.clip();ctx.drawImage(body,98,10,795,795);ctx.restore();}
  if(photographicSkin){if(movingArms){photoArm(photoArmSources.left,291,wave);photoArm(photoArmSources.right,713,-rightWave);}}
  else{piece(leftArm,291,448,wave);piece(rightArm,713,448,-rightWave);}
  if(referenceSkin){
   // Cover only the small feature area while it moves; the resting pose retains the uploaded face.
   if(eyeOpen<.99||happy>.8)for(const x of [438,597])ctx.drawImage(original,x-29,260,58,55,x-29,294,58,55);
   if(jaw>.08||happy>.1)ctx.drawImage(original,479,401,76,56,479,343,76,56);
  }
  eye(438,322,eyeOpen,gaze,happy);eye(597,322,eyeOpen,gaze,happy);if(!referenceSkin||jaw>.08||happy>.1)mouth(jaw,happy);
  if(happy>.1){ctx.strokeStyle=facePalette().ink;ctx.lineWidth=6;ctx.lineCap='round';for(const x of [438,597]){ctx.beginPath();ctx.moveTo(x-17,285-happy*7);ctx.quadraticCurveTo(x,276-happy*7,x+17,285-happy*7);ctx.stroke()}}
  if(dance||options.headwear==='headphones')headphones();ctx.restore();
  if(options.platform)basketAccessories?.drawForeground(ctx);
  if(enabled&&(asleep||dance))symbols(clock,asleep);
  canvas.dataset.frame=String(Math.round(clock*1000));
 }

 function tick(now){raf=0;const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(enabled)clock+=dt;if(enabled&&options.visible&&!document.hidden&&!asleep&&!dance&&!action&&clock>=nextIdle)play(idleActions[idleIndex++%idleActions.length]);closed+=(Number(asleep)-closed)*Math.min(1,dt*8);render();schedule()}
 function schedule(){if(!raf&&enabled&&options.visible&&!document.hidden)raf=requestAnimationFrame(tick)}
 function update(next){
  const previousSleep=asleep,previousDance=dance,previousEnabled=enabled;options={...options,...next};
  selectSkin(options.skin||'Golden');
  const accessory=['french-fries','waffle-fries','mcdonalds','chick-fil-a','burger-king','raising-canes'].includes(options.basketAccessory)?options.basketAccessory:'none';
  if(basketAccessories&&accessory!==requestedAccessory){
   requestedAccessory=accessory;
   basketAccessories.select(accessory).then(name=>{host.dataset.basketAccessory=name;delete host.dataset.accessoryError;render();schedule()}).catch(error=>{requestedAccessory=basketAccessories.selected;host.dataset.accessoryError=error.message;console.warn(error)});
  }
  enabled=options.motion&&(!respectReducedMotion||!reduced.matches);asleep=Boolean(options.asleep);
  dance=Boolean(options.radio&&!asleep&&enabled);
  if(previousDance!==dance){action='';nextIdle=clock+3.5;}
  if(!previousEnabled&&enabled)nextIdle=clock+3.5;
  if(previousSleep&&!asleep){action='wake';started=clock}
  if(asleep||!enabled||!options.visible)speaking=false;
  if(asleep){action='';dance=false}
  if(!enabled){action='';dance=false;closed=Number(asleep);blinkStart=-10}
  if(!enabled||!options.visible){cancelAnimationFrame(raf);raf=0;last=0}
  sync();render();schedule();
 }
 reduced.addEventListener('change',()=>update(options));
 document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);raf=0;last=0;if(!document.hidden)schedule()});
 const api={play,update,render,setSpeaking(value){speaking=Boolean(value&&enabled&&!asleep&&options.visible);speechStarted=clock;render();schedule()},getState:()=>({action,dance,asleep,enabled,clock,speaking}),reset(){speaking=false;action='';dance=false;asleep=false;closed=0;clock=0;last=0;blinkStart=-10;blinkAt=3.4;nextIdle=3.5;idleIndex=0}};
 host.dataset.ready='true';sync();render();schedule();return api;
 }catch(error){host.dataset.error=error.message;throw error}
};
