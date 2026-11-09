/* Keep unselected pet renderers and styles out of the initial page load. */
(() => {
 'use strict';
 const factories={colt:'createRoboColt',gummy:'createGummyBear',eagle:'createEaglePet',labubu:'createLabubuPet',roblox:'createRobloxPet',highland:'createHighlandPet',saber:'createSaberPet',nugget:'createNuggetPet'};
 const loads=new Map();
 function load(marker){
  const script=marker.dataset.petRuntimeScript;
  const url=script||marker.dataset.petRuntimeStyle;
  if(loads.has(url))return loads.get(url);
  const node=document.createElement(script?'script':'link');
  if(script){node.src=url;node.async=false;}else{node.rel='stylesheet';node.href=url;}
  const pending=new Promise((resolve,reject)=>{
   node.onload=resolve;
   node.onerror=()=>{loads.delete(url);node.remove();reject(new Error('Your pet could not load. Please try again.'));};
   marker.before(node);
  });
  loads.set(url,pending);return pending;
 }
 window.createLazyLaunchpadPet=(kind,onChange,onCustomize)=>{
  let instance=null,pending=null,latest=null,notice=null;
  const listeners=[];
  const markers=[...document.querySelectorAll('meta[data-pet-runtime="'+kind+'"]')];
  const ready=()=>instance?.host||document.querySelector('.'+(kind==='colt'?'robo':kind)+'-companion');
  function showError(){
   if(!latest?.visible||notice)return;
   notice=document.createElement('div');notice.className='pet-runtime-error';notice.setAttribute('role','alert');
   const message=document.createElement('span');message.textContent='Your pet could not load. ';
   const retry=document.createElement('button');retry.type='button';retry.textContent='Try again';
   retry.onclick=()=>{notice.remove();notice=null;ensure().catch(showError);};
   notice.append(message,retry);document.body.append(notice);
  }
  function ensure(){
   if(instance)return Promise.resolve(instance);
   if(pending)return pending;
   pending=(async()=>{
    await Promise.all(markers.filter(m=>m.dataset.petRuntimeStyle).map(load));
    for(const marker of markers.filter(m=>m.dataset.petRuntimeScript))await load(marker);
    const factory=window[factories[kind]];
    if(typeof factory!=='function')throw new Error('Your pet could not load. Please try again.');
    if(kind==='colt')window.installApprovedColtAccessories?.();
    instance=factory(onChange,onCustomize);
    if(latest)instance.update(latest);
    notice?.remove();notice=null;
    listeners.splice(0).forEach(listener=>listener(ready()));
    window.dispatchEvent(new CustomEvent('launchpad-pet-ready',{detail:{kind}}));
    return instance;
   })().catch(error=>{pending=null;throw error;});
   return pending;
  }
  const proxy={
   get host(){return ready();},ensure,
   whenReady(listener){if(instance)listener(ready());else listeners.push(listener);},
   update(value){latest=value;if(!value.visible){notice?.remove();notice=null;}if(instance)instance.update(value);else if(value.visible)ensure().catch(showError);}
  };
  for(const method of ['show','hide','close','refresh','reset','speak','announce'])proxy[method]=(...args)=>instance?.[method]?.(...args);
  for(const method of ['customize','play'])proxy[method]=(...args)=>ensure().then(api=>api[method]?.(...args)).catch(showError);
  return proxy;
 };
})();
