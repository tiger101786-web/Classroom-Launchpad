// Read-only measurement of the generated PNG; does not alter the artwork.
const sharp = require('sharp');
(async () => {
  const {data,info} = await sharp('assets/scene-frame-usa-patriotic.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const alpha = (x,y) => data[(Math.round(y)*info.width+Math.round(x))*4+3];
  if(alpha(info.width/2,info.height/2)!==0 || alpha(0,0)!==0) throw new Error('Frame must have transparent center and exterior');
  const points=[];
  for(let angle=0;angle<360;angle++) {
    const a=angle*Math.PI/180, dx=Math.cos(a),dy=Math.sin(a);
    let r=0;
    while(r<info.width*.49 && alpha(info.width/2+dx*r,info.height/2+dy*r)<220) r+=.5;
    if(r>=info.width*.49) throw new Error('Frame opening is not enclosed');
    r+=2; // Small overlap beneath the opaque inner rim prevents hairline gaps.
    points.push(`${(-4+108*(info.width/2+dx*r)/info.width).toFixed(2)}% ${(-4+108*(info.height/2+dy*r)/info.height).toFixed(2)}%`);
  }
  console.log(`:is(.launch-scene-stage, .frame-swatch):has(> [data-scene-frame="usa-patriotic"]) { --scene-aperture: polygon(${points.join(', ')}); }`);
})().catch(error=>{console.error(error);process.exitCode=1});
