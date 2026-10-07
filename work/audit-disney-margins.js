// Read-only measurements of circular artwork inside the supplied PNGs.
const fs=require('fs'),vm=require('vm'),sharp=require('sharp');
const source=fs.readFileSync('launchpad-scenes.js','utf8');
const scenes=vm.runInNewContext(source.slice(source.indexOf('const scenes ='),source.indexOf('const frames ='))+';scenes',{matchMedia:()=>({matches:false})}).filter(s=>s.id.startsWith('disney-'));
(async()=>{
 for(const s of scenes){
  const {data,info}=await sharp(s.image).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const radii=[];
  for(let d=0;d<360;d++){
   const a=d*Math.PI/180;let r=.499;
   for(;r>.3;r-=.001){const x=Math.floor((.5+r*Math.cos(a))*info.width),y=Math.floor((.5+r*Math.sin(a))*info.height),i=(y*info.width+x)*4;
    if(data[i+3]>200&&Math.max(data[i],data[i+1],data[i+2])>20)break;
   }
   radii.push(r);
  }
  radii.sort((a,b)=>a-b);
  console.log(JSON.stringify({id:s.id,min:radii[0],p05:radii[18],median:radii[180],scale:Math.ceil(.503/radii[18]*1000)/1000}));
 }
})().catch(e=>{console.error(e);process.exitCode=1});
