const evergreenArtBase = new URL('.', document.currentScript.src);
window.createEvergreenRenderer = function(canvas, refresh) {
const accessories=createEvergreenAccessories(refresh);
const ctx = canvas.getContext('2d');
const tree = new Image();
const skirtArt = new Image();
const skirtTints = { cranberry:'none', pine:'hue-rotate(102deg)', blue:'hue-rotate(212deg)' };
const layer = document.createElement('canvas');
layer.width = 455;
layer.height = 690;
const art = layer.getContext('2d');
// Assemble the animated rows on a whole-pixel grid, then scale the completed image.
const foliage = document.createElement('canvas');
foliage.width = canvas.width;
foliage.height = layer.height;
const branches = foliage.getContext('2d');
const ornamentColors = { classic:['#bc1737','#e7ad4f'], ice:['#5898ca','#dce6e9'], candy:['#e57994','#f7ddd4'] };
const bulbColors = { warm:['#ffe18b'], color:['#ff5461','#59dfa8','#6ea8ff','#ffd36a'], frost:['#90dfff','#e4faff'] };
const baubles = [[220,105],[178,179],[273,204],[125,261],[327,270],[83,370],[350,382],[163,435],[289,460],[73,500],[375,505],[226,540]];

function oval(x,y,rx,ry,color) {
  art.fillStyle=color;
  art.beginPath(); art.ellipse(x,y,rx,ry,0,0,Math.PI*2); art.fill();
}
function curve(x,y,cx,cy,ex,ey,color,width) {
  art.beginPath(); art.moveTo(x,y); art.quadraticCurveTo(cx,cy,ex,ey);
  art.strokeStyle=color; art.lineWidth=width; art.lineCap='round'; art.stroke();
}
const decorated=document.createElement('canvas');
decorated.width=layer.width;
decorated.height=566;
const base=decorated.getContext('2d');
const glow=document.createElement('canvas');
glow.width=decorated.width;
glow.height=decorated.height;
const bulbsLayer=glow.getContext('2d');
let lastLights, lastOrnaments;

function prepareDecorations(look) {
  if(lastLights===look.lights && lastOrnaments===look.ornaments)return;
  lastLights=look.lights;
  lastOrnaments=look.ornaments;
  art.clearRect(0,0,layer.width,layer.height);
  bulbsLayer.clearRect(0,0,glow.width,glow.height);
  const palette = ornamentColors[look.ornaments];
  if (palette) baubles.forEach(([x,y],i) => {
    const r=9+y/100;
    curve(x,y-r-10,x-3,y-r-5,x,y-r,'#c9a971',1.6);
    art.fillStyle='#c6a46a'; art.fillRect(x-3,y-r-2,6,4);
    const glaze=art.createRadialGradient(x-r*.4,y-r*.5,1,x,y,r);
    glaze.addColorStop(0,'#fff2d1'); glaze.addColorStop(.25,palette[i%2]); glaze.addColorStop(.78,palette[i%2]); glaze.addColorStop(1,'#402c2c');
    oval(x,y,r,r,glaze);
  });
  const bulbs=bulbColors[look.lights];

  for (let row=0;bulbs && row<4;row++) {
    const span=46+row*41, y=121+row*124, count=5+row*2;
    curve(227-span,y,227,y+43,227+span,y-7,'#33452c',2);
    for (let i=0;i<count;i++) {
      const u=(i+.2)/count, x=227-span+2*span*u, by=y+86*u*(1-u)-7*u*u;
      const color=bulbs[(row+i)%bulbs.length];
      bulbsLayer.shadowColor=color; bulbsLayer.shadowBlur=8;
      bulbsLayer.fillStyle=color; bulbsLayer.beginPath();
      bulbsLayer.ellipse(x,by+3,3.5,5,0,0,Math.PI*2); bulbsLayer.fill();
      oval(x,by+3,3.5,5,color);
      oval(x-.7,by+2,1,2,'#fffae5');
    }
  }
  base.clearRect(0,0,decorated.width,decorated.height);
  base.drawImage(layer,0,0);
}
function expression(t,state) {
  const sleep=state==='sleep', pleased=state==='happy'||state==='dance';
  const blink=state==='blink'||(state==='idle' && t%4.7>4.5);
  for (const x of [185,270]) {
    if (sleep||pleased||blink) {
      curve(x-14,319,x,pleased?297:329,x+14,319,'#e1c6a0',8);
      curve(x-14,318,x,pleased?296:328,x+14,318,'#29211f',5);
    } else {
      const shift=state==='curious'?5*Math.sin(t*2):0;
      oval(x,317,16,19,'#b19c71'); oval(x,317,14,17,'#302522');
      oval(x+shift,319,9,12,'#100e0e'); oval(x-4+shift,311,4,4,'#fff9eb');
    }
  }
  const wiggle=state==='twitch'?3*Math.sin(t*16):0;
  oval(227+wiggle,335,5,3,'#30251f');
  if (sleep||['talk','hello','wake'].includes(state)) {
    const open=sleep?5+2*Math.sin(t*2):state==='wake'?4+13*Math.sin(Math.min(1,t/3.5)*Math.PI):5+5*Math.abs(Math.sin(t*8));
    oval(227,349,11,open,'#3c2424'); oval(227,350+open*.48,6,open*.26,'#d88e88');
  } else curve(214,345,227,pleased?366:357,241,345,'#2c201c',5);
}

// Contact points in the artwork: star notch, robe hem, and ribbon knot.
const toppers = {
  star: {height:107, anchorX:.50, anchorY:.71},
  angel: {height:116, anchorX:.50, anchorY:.93},
  bow: {height:92, anchorX:.50, anchorY:.34}
};
function drawTopper(kind,x,y) {
  const topper=toppers[kind];
  if(!topper)return;
  if(!topper.image){
    topper.image=new Image();
    topper.image.onload=refresh;
    topper.image.src=new URL('topper-'+kind+'.webp?v=2',evergreenArtBase);
  }
  const image=topper.image;
  if(!image.naturalWidth)return;
  const width=topper.height*image.naturalWidth/image.naturalHeight;
  ctx.drawImage(image,x-width*topper.anchorX,y-topper.height*topper.anchorY,width,topper.height);
}
function render(state,t,look) {
  if(!tree.complete || !tree.naturalWidth) return;
  prepareDecorations(look);
  art.clearRect(0,0,layer.width,layer.height);
  art.drawImage(tree,0,0,455,566);
  art.drawImage(decorated,0,0);
  if(bulbColors[look.lights]){
    art.globalAlpha=.35+.15*Math.sin(t*2);
    art.drawImage(glow,0,0);
    art.globalAlpha=1;
  }
  accessories.branches(art,look,t,state);
  expression(t,state);
  ctx.clearRect(0,0,600,810);
  ctx.save();
  if(toppers[look.topper] || accessories.hasTopper(look)){
    // Reserve headroom for the ornaments while keeping the skirt on its baseline.
    ctx.translate(18,45);
    ctx.scale(.94,.94);
  }
  if (accessories.hasSkirt(look)) {
    accessories.skirt(ctx,look);
  } else if (look.skirt !== 'none' && skirtArt.naturalWidth) {
    ctx.save();
    ctx.filter=skirtTints[look.skirt];
    ctx.drawImage(skirtArt,72,62+508,455,182);
    ctx.restore();
  } else {
    const bark=ctx.createLinearGradient(285,0,315,0);
    bark.addColorStop(0,'#503523'); bark.addColorStop(.4,'#93633e'); bark.addColorStop(1,'#4a3021');
    ctx.fillStyle=bark;
    ctx.beginPath(); ctx.roundRect(285,593,30,56,7); ctx.fill();
  }
  const swing=Math.sin(t*(state==='dance'?6:3));
  // Move the crown and branch tiers around their attachment points. Keep the skirt anchored.
  let sway=(state==='sleep'?1:3)*Math.sin(t*1.6);
  if(state==='dance'||state==='wobble') sway+=swing*(state==='dance'?34:21);
  const mountRow=accessories.mountRow(look);
  let tipOffset=sway*(1-mountRow/568);
  if(['crown','swish','wave','hello'].includes(state)){
    branches.clearRect(0,0,foliage.width,foliage.height);
    for(let y=0;y<566;y+=3){
      const height=Math.min(3,566-y);
      let dx=sway*(1-y/568);
      if(state==='crown') dx+=Math.sin(t*10)*Math.max(0,1-y/155)*24;
      if(state==='swish') dx+=Math.sin(t*5)*Math.exp(-((y-475)**2)/3400)*20;
      if(y===mountRow) tipOffset=dx;
      if(state==='wave'||state==='hello'){
        const extension=Math.exp(-((y-357)**2)/3700)*(1-Math.cos(t*6))*14;
        const joint=Math.round(252+dx), left=72+dx-extension;
        branches.drawImage(layer,0,y,180,height,left,y,joint-left,height);
        branches.drawImage(layer,180,y,275,height,joint,y,275,height);
      }else branches.drawImage(layer,0,y,455,height,72+dx,y,455,height);
    }
    ctx.drawImage(foliage,0,62);
  }else{
    // The ordinary sway is a shear anchored at the base. Draw the tree in one pass.
    ctx.save();
    ctx.translate(72+sway,62);
    ctx.transform(1,0,-sway/568,1,0,0);
    ctx.drawImage(layer,0,0);
    ctx.restore();
  }
  // At foliage row 18 the curved leader spans source pixels 236–255.
  const crownX=72+245.5*455/tree.naturalWidth;
  drawTopper(look.topper,crownX+tipOffset,62+18);
  accessories.finish(ctx,look,crownX+tipOffset,62+mountRow);
  if(state==='dance'){
    ctx.textAlign='center';
    ctx.font='bold 56px Arial,sans-serif';
    ctx.fillStyle='#dba44d'; ctx.strokeStyle='#26202c'; ctx.lineWidth=2;
    for(const [i,[symbol,x,y]] of danceNotes.entries()){
      const phase=(t/2.4+i*.25)%1;
      ctx.save();
      ctx.globalAlpha=Math.sin(phase*Math.PI);
      ctx.translate(x,y+10-54*phase); ctx.rotate((-12+26*phase)*Math.PI/180);
      ctx.strokeText(symbol,0,0); ctx.fillText(symbol,0,0);
      ctx.restore();
    }
  }else if(state==='sleep'){
    ctx.textAlign='center'; ctx.fillStyle='#9674bd'; ctx.strokeStyle='#fff'; ctx.lineWidth=2;
    for(const [i,[symbol,x,y,size]] of sleepZs.entries()){
      const phase=(t/3+i/3)%1;
      const rise=1-(1-phase)**1.6;
      ctx.font='700 '+size+'px "Segoe UI",sans-serif';
      ctx.globalAlpha=phase<.25?1-(1-phase*4)**1.6:((1-phase)/.75)**1.6;
      const left=x-8+18*rise, baseline=y+18-44*rise;
      ctx.strokeText(symbol,left,baseline); ctx.fillText(symbol,left,baseline);
    }
  }
  ctx.restore();
}
const danceNotes=[['♪',79,372],['♫',520,372],['♫',115,253],['♪',486,247]];
const sleepZs=[['z',406,258,28],['Z',447,218,36],['Z',489,175,44]];
tree.onload=skirtArt.onload=refresh;
tree.src=new URL('boughs.webp',evergreenArtBase);
skirtArt.src=new URL('skirt.webp',evergreenArtBase);
return render;
};
