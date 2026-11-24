(() => {
  const accessories = {
    topper: {none:'None', star:'Gold star', bow:'Cranberry bow', angel:'Golden angel'},
    skirt: {none:'No skirt', cranberry:'Cranberry velvet', pine:'Forest green velvet', blue:'Winter blue velvet'},
    ornaments: {none:'None', classic:'Cranberry and gold', ice:'Frosted silver and blue', candy:'Peppermint pink'},
    lights: {none:'Off', warm:'Warm white', color:'Multicolor', frost:'Winter blue'}
  };
  const defaults = () => ({skin:'Classic', name:'Evergreen', size:'medium', topper:'none', skirt:'cranberry',
    ornaments:'classic', lights:'warm', motion:true, asleep:false, nameplate:true});
  if(typeof module !== 'undefined' && module.exports) module.exports={accessories,defaults};
  else {window.evergreenAccessories=accessories;window.evergreenDefaults=defaults;}
})();
