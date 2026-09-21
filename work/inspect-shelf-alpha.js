// Read-only alpha bounds used to position generated assets without altering them.
const sharp = require('sharp');
(async () => {
  const output = {};
  for (const id of process.argv.slice(2)) {
    const source = `assets/shelf-${id}.png`;
    const metadata = await sharp(source).metadata();
    if (!metadata.hasAlpha) throw new Error(`${id} needs transparency`);
    const {data,info} = await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    let left=info.width,top=info.height,right=-1,bottom=-1;
    for(let y=0;y<info.height;y++) for(let x=0;x<info.width;x++) {
      if(data[(y*info.width+x)*4+3]>20) {
        left=Math.min(left,x); top=Math.min(top,y); right=Math.max(right,x); bottom=Math.max(bottom,y);
      }
    }
    if(right<0) throw new Error(`${id} is empty`);
    left=Math.max(0,left-4); top=Math.max(0,top-4);
    right=Math.min(info.width-1,right+4); bottom=Math.min(info.height-1,bottom+4);
    output[id]={source,width:info.width,height:info.height,bounds:[left,top,right-left+1,bottom-top+1]};
  }
  console.log(JSON.stringify(output));
})().catch(error=>{console.error(error);process.exitCode=1;});
