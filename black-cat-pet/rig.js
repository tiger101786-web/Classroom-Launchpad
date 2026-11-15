/* Cat rig: original-art contour cutouts and the exact normalized Saber-tooth foreleg lift. */
window.createLaunchpadBlackCatRig = function (canvas, art, clean, forelegsImage, skin) {
  'use strict';
  skin=skin||{};
  const svg = canvas.closest('svg'), ns = 'http://www.w3.org/2000/svg';
  const node = (tag, attrs = {}, parent) => {
    const element = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
    parent?.append(element);
    return element;
  };
  const defs = node('defs', {}, svg);
  const eyeCenters = [511, 712], eyeY = 335;
  const apertures = [];
  for (let i = 0; i < 2; i++) {
    const crop = node('clipPath', {id:'blackcat-eye-crop-'+i}, defs);
    node('ellipse', {cx:eyeCenters[i],cy:eyeY,rx:64,ry:55}, crop);
    const aperture = node('clipPath', {id:'blackcat-eye-aperture-'+i}, defs);
    apertures.push(node('path', {}, aperture));
  }
  const mouthClip = node('clipPath', {id:'blackcat-mouth-clip'}, defs);
  const mouthClipShape = node('path', {}, mouthClip);
  const gradient = node('radialGradient', {id:'blackcat-mouth-shade'}, defs);
  node('stop', {'stop-color':'#4a2934'}, gradient);
  node('stop', {offset:'1','stop-color':'#110d13'}, gradient);
  const face = node('g', {id:'blackcat-face'}, svg);
  const lines = [];
  for (let i = 0; i < 2; i++) {
    const opening = node('g', {'clip-path':'url(#blackcat-eye-aperture-'+i+')'}, face);
    const original = node('g', {'clip-path':'url(#blackcat-eye-crop-'+i+')'}, opening);
    node('image', {href:skin.art||'black-cat-pet/black-cat.png',width:1280,height:1280}, original);
    lines.push(node('path', {fill:'none',stroke:'#141217','stroke-width':7,'stroke-linecap':'round'}, face));
  }
  const smileAccent=node('g',{id:'blackcat-smile',opacity:0,'data-render-mode':'original-mouth-deformation'},face);
  const mouth = node('g', {id:'blackcat-mouth',opacity:0,'data-anchor-x':610,'data-anchor-y':466}, face);
  const mouthShape = node('path', {fill:'url(#blackcat-mouth-shade)',stroke:'#171217','stroke-width':3}, mouth);
  const inside = node('g', {'clip-path':'url(#blackcat-mouth-clip)'}, mouth);
  const tongue = node('path', {fill:'#b36f80'}, inside);

  const gl = canvas.getContext('webgl', {alpha:true,premultipliedAlpha:false,antialias:true});
  if (!gl) throw Error('Please enable browser hardware acceleration to preview the cat animations.');
  const vertex = `precision mediump float;
    attribute vec2 p; varying vec2 uv;
    uniform float breath, ear, paw, right, tail, nose, wobble, stretch, smile, jaw, wave, layer;
    float field(vec2 p, vec2 c, vec2 r) { vec2 d=(p-c)/r;return exp(-2.*dot(d,d)); }
    vec2 rotate(vec2 p, float a) { float c=cos(a),s=sin(a);return vec2(c*p.x-s*p.y,s*p.x+c*p.y); }
    void main() {
      uv=p; vec2 q=p;
      if(layer>2.5) {
        float angle=.22*tail-.04*abs(tail);
        vec2 root=vec2(910.,1115.)/1280.;
        q=root+rotate(p-root,angle);
      } else if(layer>.5) {
        // Exact normalized motion from Saber-tooth: complete foreground leg lift.
        float lift=layer==1.?paw:right;
        float hinge=smoothstep(630./1024.,880./1024.,p.y);
        q.y-=lift*(92./1024.)*hinge;
        q.x+=(layer==1.?-1.:1.)*lift*(12./1024.)*hinge;
      }
      float upper=1.-smoothstep(.65,.97,p.y);
      q.y-=breath*.003*upper+stretch*.012*upper;
      q.x+=wobble*.017*upper;q.y-=abs(wobble)*.003*upper;
      float le=field(p,vec2(.31,.09),vec2(.09,.13));
      float re=field(p,vec2(.62,.09),vec2(.09,.13));
      q.x+=ear*.018*(le+re);q.y+=ear*.014*(le-re);
      float nt=field(p,vec2(610.,410.)/1280.,vec2(.035,.03));
      q.x+=nose*.004*nt;q.y+=nose*.002*nt;

      if(layer<.5) {
        // Lift the original textured mouth corners; no separate painted-on smile.
        float leftLip=1.-smoothstep(0.,1.,length((p-vec2(555.,462.)/1280.)/(vec2(32.,25.)/1280.)));
        float rightLip=1.-smoothstep(0.,1.,length((p-vec2(665.,462.)/1280.)/(vec2(32.,25.)/1280.)));
        q.y-=smile*(28./1280.)*(leftLip+rightLip);
        q.x+=smile*(9./1280.)*(rightLip-leftLip);
      }
      gl_Position=vec4(q.x*2.-1.,1.-q.y*2.,0.,1.);
    }`;
  const fragment = `precision mediump float;
    varying vec2 uv; uniform sampler2D art, clean, pieces, forelegs; uniform float layer;
    float ellipse(vec2 p,vec2 c,vec2 r) {return 1.-smoothstep(.88,1.,length((p-c)/r));}
    void main() {
      vec4 source=texture2D(art,uv),mask=texture2D(pieces,uv);
      if(layer>.5) {
        float amount;
        if(layer>2.5) amount=mask.b;
        else {
          amount=layer==1.?mask.r:mask.g;
        }
        source.a*=amount;
        if(layer<2.5) {
          vec4 fur=texture2D(forelegs,uv);
          fur.a*=layer==1.?1.-step(.475,uv.x):step(.475,uv.x);
          source=mix(source,fur,smoothstep(840./1280.,960./1280.,uv.y));
        }
        gl_FragColor=source;return;
      }
      float eye=max(ellipse(uv,vec2(511.,335.)/1280.,vec2(72.,62.)/1280.),ellipse(uv,vec2(712.,335.)/1280.,vec2(72.,62.)/1280.));
      float bodyBacking=smoothstep(650./1280.,760./1280.,uv.y);
      float backing=max(bodyBacking,max(max(mask.r,mask.g),max(mask.b,eye)));
      gl_FragColor=mix(source,texture2D(clean,uv),backing);
    }`;
  const compile = (type, source) => {
    const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(shader));
    return shader;
  };
  const program=gl.createProgram(), shaders=[compile(gl.VERTEX_SHADER,vertex),compile(gl.FRAGMENT_SHADER,fragment)];
  shaders.forEach(shader=>gl.attachShader(program,shader));gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const vertices=[],n=96;
  for(let y=0;y<n;y++) for(let x=0;x<n;x++) vertices.push(x/n,y/n,(x+1)/n,y/n,x/n,(y+1)/n,(x+1)/n,y/n,(x+1)/n,(y+1)/n,x/n,(y+1)/n);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
  const attr=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);

  // Match the Saber-tooth technique: trace the original fur, never use oval limb masks.
  const pieceMask=document.createElement('canvas');pieceMask.width=pieceMask.height=2048;
  const ctx=pieceMask.getContext('2d');ctx.scale(2048/1280,2048/1280);
  ctx.fillStyle='#000';ctx.fillRect(0,0,1280,1280);
  const contours={
    left:'M425 706 Q418 781 444 889 Q457 988 456 1107 Q453 1145 446 1166 Q439 1197 457 1228 Q478 1256 530 1257 Q581 1261 598 1229 Q614 1200 601 1167 L594 1135 Q586 1054 589 956 C592 900 590 842 582 792 Q573 734 558 707Z',
    right:'M632 707 Q605 774 612 875 Q621 988 620 1117 Q619 1157 615 1180 Q608 1223 639 1247 Q682 1269 730 1250 Q768 1232 773 1193 Q776 1168 761 1147 Q753 1106 763 1020 Q782 921 803 843 Q821 771 786 707Z',
    tail:'M881 1055 Q973 1046 1012 959 Q1057 869 1027 817 Q1010 785 956 779 Q912 776 908 747 Q907 705 942 672 Q1007 619 1092 653 Q1194 685 1216 799 Q1240 915 1165 1019 Q1076 1135 917 1180 L874 1162Z'
  };
  for(const [name,color] of [['left','#f00'],['right','#0f0'],['tail','#00f']]){ctx.fillStyle=color;ctx.filter=name==='tail'?'none':'blur(3px)';ctx.fill(new Path2D(contours[name]));ctx.filter='none';}
  const textures=[art,clean,pieceMask,forelegsImage].map((image,i)=>{
    const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
    // Power-of-two mipmaps keep fine black fur from sparkling when the cat is small.
    const upload=document.createElement('canvas');upload.width=upload.height=2048;
    upload.getContext('2d').drawImage(image,0,0,2048,2048);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,upload);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    for(const key of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,key,gl.CLAMP_TO_EDGE);
    gl.generateMipmap(gl.TEXTURE_2D);gl.uniform1i(gl.getUniformLocation(program,['art','clean','pieces','forelegs'][i]),i);
    return texture;
  });
  const names=['breath','ear','paw','right','tail','nose','wobble','stretch','smile','jaw','wave','layer'];
  const uniforms=Object.fromEntries(names.map(name=>[name,gl.getUniformLocation(program,name)]));
  gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0,0,0,0);gl.viewport(0,0,canvas.width,canvas.height);
  let latest={};
  const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
  const endpoint=(v,left)=>{
    const lift=left?v.paw:v.right,tip=[left?528:698,1210];
    const t=clamp((tip[1]/1280-630/1024)/((880-630)/1024)),hinge=t*t*(3-2*t);
    return [tip[0]+(left?-1:1)*lift*(12/1024)*1280*hinge,tip[1]-lift*(92/1024)*1280*hinge];
  };
  return {
    draw(v) {
      latest={...v};gl.clear(gl.COLOR_BUFFER_BIT);
      for(const key of names)if(key!=='layer')gl.uniform1f(uniforms[key],key==='jaw'?v.mouth:v[key]||0);
      for(const layer of [3,0,1,2]){gl.uniform1f(uniforms.layer,layer);gl.drawArrays(gl.TRIANGLES,0,vertices.length/2);}
      face.setAttribute('transform',`translate(${v.wobble*1280*.017} ${-v.breath*1280*.003-v.stretch*1280*.012})`);
      const c=smooth(v.close),happy=v.smile;
      for(let i=0;i<2;i++) {
        const cx=eyeCenters[i],top=272+c*64,bottom=398-c*62;
        const happyEyes=happy>.25;
        apertures[i].setAttribute('d',c>.99||happyEyes?'M0 0Z':`M${cx-90} ${top}Q${cx} ${top+c*10} ${cx+90} ${top}V${bottom}H${cx-90}Z`);
        // Robo Colt's happy eyes: two held, upward arches instead of squinting pupils.
        lines[i].setAttribute('d',happyEyes?`M${cx-42} 348Q${cx} 280 ${cx+42} 348`:c>.88?`M${cx-37} 338Q${cx} 354 ${cx+37} 338`:'M0 0Z');
        lines[i].setAttribute('stroke',happyEyes?(skin.happyInk||'#e1b24f'):(skin.lidInk||'#141217'));
        lines[i].setAttribute('stroke-width',happyEyes?11:7);
      }
      const open=v.mouth,cy=466,cx=610;
      const rx=v.yawn?29+open*9:28+open*7,depth=open*(v.yawn?42:27);
      // The opening sits beneath the original feline upper lip. Never erase its fur or whiskers.
      const ovalX=20+open*14,ovalY=10+open*23,ovalCenter=477;
      const shape=v.sleeping?`M${cx} 454C${cx-4} 454 ${cx-ovalX} 462 ${cx-ovalX} ${ovalCenter}C${cx-ovalX} ${ovalCenter+ovalY*1.7} ${cx+ovalX} ${ovalCenter+ovalY*1.7} ${cx+ovalX} ${ovalCenter}C${cx+ovalX} 462 ${cx+4} 454 ${cx} 454Z`:`M${cx-rx} ${cy}Q${cx} ${cy-13} ${cx+rx} ${cy}C${cx+rx} ${cy+depth*1.5} ${cx-rx} ${cy+depth*1.5} ${cx-rx} ${cy}Z`;
      smileAccent.setAttribute('opacity',v.sleeping?0:smooth((happy-.12)/.35)*(1-smooth(open/.2)));
      mouth.setAttribute('opacity',v.sleeping?1:smooth(open/.12));mouth.setAttribute('data-sleeping',String(!!v.sleeping));mouthShape.setAttribute('d',shape);mouthClipShape.setAttribute('d',shape);
      tongue.setAttribute('d',v.yawn&&open>.35?`M${cx-10} ${cy+depth*.97}Q${cx} ${cy+depth*.75} ${cx+10} ${cy+depth*.97}Q${cx} ${cy+depth*1.13} ${cx-10} ${cy+depth*.97}Z`:'M0 0Z');

    },
    getState() {
      const v=latest;
      return {skin:skin.label||'Black Cat',parts:['body','left-foreleg','right-foreleg','tail'],forelegArtwork:'clean-cutouts-v5',pawMotion:'saber-exact-normalized',mouthAnchor:[610,466],muzzlePreserved:true,happy:v.smile||0,tailAngle:.22*(v.tail||0)-.04*Math.abs(v.tail||0),leftPawTip:v.paw===undefined?null:endpoint(v,true),rightPawTip:v.right===undefined?null:endpoint(v,false)};
    },
    destroy(){textures.forEach(t=>gl.deleteTexture(t));gl.deleteBuffer(buffer);shaders.forEach(s=>gl.deleteShader(s));gl.deleteProgram(program);face.remove();defs.remove();}
  };
};
