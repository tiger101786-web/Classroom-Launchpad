(() => {
  let applying = false;
  const emit = data => parent.postMessage({type:'dumpling-pet', ...data}, location.origin);
  const idle = document.querySelector('#idle');
  function preferences() {
    return {color:document.querySelector('.color-choice[aria-pressed=true]')?.textContent || 'Gold',
      accessory:document.querySelector('.accessory-controls [aria-pressed=true]')?.dataset.accessory || 'none',
      motion:idle.getAttribute('aria-pressed') === 'true'};
  }
  document.addEventListener('click', event => {
    if (!applying && event.target.closest('.color-choice, [data-accessory], #idle')) emit({preferences:preferences()});
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape')emit({close:true});});
  window.addEventListener('message', event => {
    if (event.source !== parent || event.origin !== location.origin || event.data?.type !== 'dumpling-host') return;
    applying = true;
    const {preferences:p, expanded, dark} = event.data;
    if (p) {
      [...document.querySelectorAll('.color-choice')].find(b=>b.textContent===p.color)?.click();
      [...document.querySelectorAll('[data-accessory]')].find(b=>b.tagName==='BUTTON' && b.dataset.accessory===p.accessory)?.click();
      const motion = p.motion && !matchMedia('(prefers-reduced-motion: reduce)').matches;
      if ((idle.getAttribute('aria-pressed') === 'true') !== motion) idle.click();
    }
    document.body.classList.toggle('expanded', !!expanded);
    document.body.classList.toggle('dark', !!dark);
    document.querySelector('.panel').hidden = !expanded;
    applying = false;
  });
  emit({ready:true});
})();
