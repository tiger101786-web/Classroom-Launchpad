const fs=require('fs'),assert=require('assert/strict'),sharp=require('sharp');
const frames=require('./thin-frame-plan.json').frames;
(async()=>{
 const results=[];
 for(const f of frames){
  const asset='assets/scene-frame-'+f.id+'-thin-v2.png';
  if(!fs.existsSync(asset))continue;
  const {data,info}=await sharp(asset).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.equal(info.width,info.height,f.id+' must be square');
  const alpha=(x,y)=>data[(y*info.width+x)*4+3];
  assert.equal(alpha(Math.floor(info.width/2),Math.floor(info.height/2)),0,f.id+' center must be transparent');
  let min=1,max=0;
  for(let deg=0;deg<360;deg++){
   const a=deg*Math.PI/180;let run=0,found=false;
   for(let r=Math.floor(info.width*.3);r<info.width*.5;r++){
    const x=Math.floor(info.width/2+Math.cos(a)*r),y=Math.floor(info.height/2+Math.sin(a)*r);
    run=alpha(x,y)>100?run+1:0;
    if(run>=4){const radius=(r-3)/info.width;min=Math.min(min,radius);max=Math.max(max,radius);found=true;break;}
   }
   assert.ok(found,f.id+' must have a continuous rim at '+deg);
  }
  results.push({id:f.id,size:info.width,min,max,inset:-Math.min(.08,(.498/max-1)/2)*100});
 }
 console.log(JSON.stringify(results));
 console.error('Audited '+results.length+'/89 transparent frame assets.');
})().catch(e=>{console.error(e);process.exitCode=1});
