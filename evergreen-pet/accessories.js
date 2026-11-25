const evergreenSpriteBase=new URL('accessories/',document.currentScript.src);
function createEvergreenAccessories(refresh) {
  const images=Object.create(null), indices=Object.create(null);
  let revision=0;
  for(const [group,choices] of Object.entries(evergreenAccessories)){
    for(const key of Object.keys(choices)){
      if(key.startsWith(group+'-'))indices[key]=Number(key.slice(group.length+1));
    }
  }
  function sprite(ctx,key,x,y,w,h,anchor=.5,tilt=0) {
    if (!(key in indices)) return;
    let img=images[key];
    if (!img) {
      img=images[key]=new Image();
      img.onload=()=>{revision++;refresh();};
      img.src=new URL(key+'.webp',evergreenSpriteBase);
    }
    if (!img.complete || !img.naturalWidth) return;
    const scale=Math.min(w/img.naturalWidth,h/img.naturalHeight);
    const width=img.naturalWidth*scale,height=img.naturalHeight*scale;
    ctx.save();ctx.translate(x,y);ctx.rotate(tilt);
    ctx.drawImage(img,-width/2,-height*anchor,width,height);ctx.restore();
  }
  const trim=document.createElement('canvas'); trim.width=455;trim.height=566;
  const pen=trim.getContext('2d');
  let last='';
  function strand(key,row,left,right,y,dip,count,size,garland) {
    pen.strokeStyle=garland?'#937653':'#364934';
    pen.lineWidth=garland?2.5:1.7;pen.beginPath();pen.moveTo(left,y);
    pen.quadraticCurveTo((left+right)/2,y+2*dip,right,y-12);pen.stroke();
    for(let i=0;i<count;i++){
      const u=i/(count-1),x=left+(right-left)*u,py=y+4*dip*u*(1-u)-12*u*u;
      const angle=Math.atan((4*dip*(1-2*u)-24*u)/(right-left));
      pen.save();
      if(!garland && (key==='lights-0'||key==='lights-5'))pen.filter='hue-rotate('+[0,130,49,222][(row+i)%4]+'deg)';
      if(garland && key==='garland-1')pen.filter='hue-rotate('+[0,114,44][i%3]+'deg)';
      sprite(pen,key,x,py,size,garland?size*.84:size,garland ? .5 : .08,garland?angle:0);
      if(key==='garland-0'){
        pen.fillStyle='#b32640';pen.beginPath();pen.arc(x+size*.43,py+1,2.7,0,Math.PI*2);pen.fill();
      }
      pen.restore();
    }
  }
  return {
    hasTopper:look=>look.topper in indices,
    hasSkirt:look=>look.skirt in indices,
    skirt(ctx,look){sprite(ctx,look.skirt,300,752,489,211,1);},
    branches(ctx,look,t,state){
      const signature=[look.ornaments,look.lights,look.garland,revision].join('/');
      if(last!==signature){
        last=signature;pen.clearRect(0,0,455,566);
        if(look.garland in indices){
          const size=[15,20,30,24,13,16,16,22][indices[look.garland]];
          // Follow the narrower branch tiers between the rows of bulbs.
          for(const [row,left,right,y,dip] of [[0,192,261,90,16],[1,129,321,207,19],[2,70,379,402,22]]){
            strand(look.garland,row,left,right,y,dip,Math.round((right-left)/size)+1,size,true);
          }
        }
        if(look.lights in indices){
          for(const [row,left,right,y,dip] of [[0,171,278,150,23],[1,105,342,263,27],[2,53,393,435,34]]){
            strand(look.lights,row,left,right,y,dip,row*2+5,20+row*2,false);
          }
        }
        for(const [x,y] of [[219,85],[174,194],[275,186],[123,281],[320,267],[90,373],[355,366],[160,464],[283,473],[85,507],[374,495]]){
          sprite(pen,look.ornaments,x,y,34,39,0);
        }
      }
      ctx.drawImage(trim,0,0);
      if(look.lights==='lights-7' && state==='dance'){
        const u=(Math.floor(t*8)%9)/8;
        ctx.save();ctx.shadowColor='#fff4d1';ctx.shadowBlur=8;ctx.fillStyle='#fff6de';
        ctx.beginPath();ctx.arc(53+340*u,444+136*u*(1-u)-12*u*u,4,0,Math.PI*2);ctx.fill();ctx.restore();
      }
    },
    mountRow:look=>look.topper==='topper-4'?87:18,
    finish(ctx,look,x,y){
      if(look.topper==='topper-4'){
        // The brim ends before the pom-pom, so its center is left of the sprite center.
        sprite(ctx,look.topper,x+5,y,156,114,1);
      }else sprite(ctx,look.topper,x,y+5,122,104,.94);
    }
  };
}
