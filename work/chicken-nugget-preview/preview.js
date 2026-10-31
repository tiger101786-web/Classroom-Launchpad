const pet=document.querySelector('.pet'),plate=document.querySelector('#plate-name'),stage=document.querySelector('.stage');
function fitName(){plate.style.fontSize=(pet.clientWidth*.075)+'px';while(plate.scrollWidth>plate.clientWidth&&parseFloat(plate.style.fontSize)>10)plate.style.fontSize=(parseFloat(plate.style.fontSize)-1)+'px'}
document.querySelector('#pet-name').addEventListener('input',event=>{const name=event.target.value.trim()||'Nugget';plate.textContent=name;document.querySelector('#meet-name').textContent='Meet '+name+'.';fitName()});
document.querySelector('#size').addEventListener('change',event=>{pet.style.setProperty('--pet-size',event.target.value+'px');fitName()});
document.querySelectorAll('button[data-background]').forEach(button=>button.addEventListener('click',()=>{stage.dataset.background=button.dataset.background;document.querySelectorAll('button[data-background]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)))}));
new ResizeObserver(fitName).observe(pet);
