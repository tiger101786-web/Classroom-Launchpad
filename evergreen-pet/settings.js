(() => {
  const accessories = {
    topper: {none:'None', star:'Gold star', bow:'Cranberry bow', angel:'Golden angel'},
    skirt: {none:'No skirt', cranberry:'Cranberry velvet', pine:'Forest green velvet', blue:'Winter blue velvet'},
    ornaments: {none:'None', classic:'Cranberry and gold', ice:'Frosted silver and blue', candy:'Peppermint pink'},
    lights: {none:'Off', warm:'Warm white', color:'Multicolor', frost:'Winter blue'}
  };
  const catalog = {
    topper: ['Red-nosed reindeer','Snowy owl','Frosted snowflake','Gingerbread house','Santa hat','Nutcracker crown','Silver bell cluster'],
    ornaments: ['Gingerbread cookies','Peppermint canes','Tiny nutcrackers','Rocking horses','Red cardinals','Mini snow globes','Glass teardrops','Classroom keepsakes'],
    garland: ['Popcorn and cranberry','Paper chain','Tartan ribbon','Silver tinsel','Wooden beads','Gingerbread stars','Gold bells','Eucalyptus and berries'],
    lights: ['Vintage multicolor','Candle lanterns','Peppermint bulbs','Icicle drops','Golden stars','Jewel lights','Snowball globes','Red and white chase'],
    skirt: ['Buffalo plaid','Ivory cable knit','Midnight constellations','Gingerbread icing','Peppermint swirl','Woodland foxes','Velvet toy soldiers','Christmas patchwork'],
  };
  accessories.garland={none:'None'};
  for(const [group,labels] of Object.entries(catalog)){
    labels.forEach((label,i)=>{accessories[group][group+'-'+i]=label;});
  }
  const defaults = () => ({skin:'Classic', name:'Evergreen', size:'medium', topper:'none', garland:'none', skirt:'cranberry',
    ornaments:'classic', lights:'warm', motion:true, asleep:false, nameplate:true});
  if(typeof module !== 'undefined' && module.exports) module.exports={accessories,defaults};
  else {window.evergreenAccessories=accessories;window.evergreenDefaults=defaults;}
})();
