// Read-only alpha measurements for independently generated shelf cutouts.
const sharp = require('sharp');
(async () => {
  const assets = {};
  for (const id of process.argv.slice(2)) {
    const source = `assets/shelf-${id}.png`;
    const {data,info} = await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    let left=info.width,top=info.height,right=0,bottom=0;
    for(let y=0;y<info.height;y++) for(let x=0;x<info.width;x++) {
      if(data[(y*info.width+x)*4+3] <= 32) continue;
      left=Math.min(left,x); top=Math.min(top,y); right=Math.max(right,x); bottom=Math.max(bottom,y);
    }
    left=Math.max(0,left-2); top=Math.max(0,top-2);
    right=Math.min(info.width-1,right+2); bottom=Math.min(info.height-1,bottom+2);
    assets[id]={source,width:info.width,height:info.height,bounds:[left,top,right-left+1,bottom-top+1]};
  }
  console.log(JSON.stringify(assets));
})().catch(error=>{console.error(error);process.exitCode=1;});
