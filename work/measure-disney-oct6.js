// Read-only alpha measurement; outputs CSS without changing either PNG.
const sharp=require('sharp');
const plan=require('./disney-oct6-generated.json');
(async()=>{
 const rules=[];
 for(const f of plan.frames){
  const {data,info}=await sharp(f.asset).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  if(data[(Math.floor(info.height/2)*info.width+Math.floor(info.width/2))*4+3]!==0)throw Error(f.frame+' center is opaque');
  let outer=0;
  const pts=[];
  for(let degree=0;degree<360;degree++){
   const a=degree*Math.PI/180; let r=.05;
   for(;r<.49;r+=.0005){
    const x=Math.round(info.width*(.5+r*Math.cos(a))),y=Math.round(info.height*(.5+r*Math.sin(a)));
    if(data[(y*info.width+x)*4+3]>=220)break;
   }
   if(r>=.49)throw Error(f.frame+' has open rim');
   outer=Math.max(outer,r);
   pts.push([(r+.001)*108*Math.cos(a),(r+.001)*108*Math.sin(a)]);
  }
  // Cover the widest part of the opening, including the source PNG's black margin.
  const scale=(outer+.008)*1.08/.46;
  const polygon=s=>pts.map(([x,y])=>`${(50+x/s).toFixed(2)}% ${(50+y/s).toFixed(2)}%`).join(',');
  rules.push(`:is(.launch-scene-stage,.frame-swatch):has(> [data-scene-frame="${f.frame}"]) { --scene-safe-scale:${scale.toFixed(4)}; --scene-aperture:polygon(${polygon(1)}); --scene-image-aperture:polygon(${polygon(scale)}); }`);
 }
 console.log(rules.join('\n'));
})().catch(e=>{console.error(e);process.exitCode=1});
