const sharp=require('sharp');
(async()=>{const result={};for(const id of ["mew","mimikyu","umbreon","snorlax","lucario","gardevoir","dragonite","rayquaza","mewtwo","garchomp","arcanine","squirtle","gengar","bulbasaur","charizard","charmander","gyarados"]){
const source='assets/shelf-pokemon-'+id+'-statue.png';
const {data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
let l=info.width,t=info.height,r=0,b=0;
for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){const i=(y*info.width+x)*4;if(data[i+3]>32&&Math.min(data[i],data[i+1],data[i+2])<220){l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x);b=Math.max(b,y);}}
l=Math.max(0,l-5);t=Math.max(0,t-5);r=Math.min(info.width-1,r+5);b=Math.min(info.height-1,b+5);
result['pokemon-'+id+'-statue']={source,width:info.width,height:info.height,bounds:[l,t,r-l+1,b-t+1],displaySize:460,displayWidth:340};
}console.log(JSON.stringify(result));})();
