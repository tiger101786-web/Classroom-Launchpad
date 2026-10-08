const sharp=require('sharp');
(async()=>{
 for(const id of ['disney-sunset-carnival','disney-sun-palace']){
  const {data,info}=await sharp('assets/launchpad-scene-'+id+'.png').removeAlpha().raw().toBuffer({resolveWithObject:true});
  let min=info.width;
  for(let degree=0;degree<360;degree++){
   const a=degree*Math.PI/180;
   for(let r=Math.floor(info.width*.5)-1;r>info.width*.35;r--){
    const x=Math.floor(info.width/2+r*Math.cos(a)),y=Math.floor(info.height/2+r*Math.sin(a)),i=(y*info.width+x)*3;
    if(Math.max(data[i],data[i+1],data[i+2])>5){min=Math.min(min,r);break;}
   }
  }
  const frame=await sharp('assets/scene-frame-match-'+id+'-thin-v2.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});
  console.log(id,{width:info.width,height:info.height,minimumSceneRadius:min,cropScale:Math.ceil(info.width/2/min*1000+4)/1000,frameSize:frame.info,centerAlpha:frame.data[(Math.floor(frame.info.height/2)*frame.info.width+Math.floor(frame.info.width/2))*4+3]});
 }
})();
