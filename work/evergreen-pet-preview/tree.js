const canvas = document.querySelector('canvas');
const topper = document.querySelector('#topper');
const skirt = document.querySelector('#skirt');
const statusText = document.querySelector('#status');
const controls = document.querySelector('#actions');
const ornaments = document.querySelector('#ornaments');
const lights = document.querySelector('#lights');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const motions = {
  idle: ['Idle', Infinity], hello: ['Say hello', 3], blink: ['Blink', .55],
  happy: ['Happy eyes', 2.8], talk: ['Talking mouth', 4], curious: ['Curious look', 3],
  crown: ['Crown flick', 2], wave: ['Branch wave', 2.8], swish: ['Bough swish', 3],
  twitch: ['Nose twitch', 1.8], wobble: ['Body wobble', 2.5], sleep: ['Sleep', Infinity],
  wake: ['Wake & yawn', 3.5], dance: ['Dance', Infinity]
};
let state = 'idle', started = performance.now(), frame = 0;

function activate(next) {
  state = next;
  started = performance.now();
  statusText.textContent = motions[next][0];
  for (const button of controls.children) button.setAttribute('aria-pressed', String(button.value === next));
  refresh();
}
for (const [key, [label]] of Object.entries(motions)) {
  const button = document.createElement('button');
  button.textContent = label;
  button.value = key;
  button.setAttribute('aria-pressed', String(key === state));
  button.onclick = () => activate(key === state && key === 'sleep' ? 'wake' : key === state && key === 'dance' ? 'idle' : key);
  controls.append(button);
}
function draw(now) {
  frame=0;
  if (document.hidden) return;
  const elapsed=(now-started)/1000;
  if (elapsed>=motions[state][1]) { activate('idle'); return; }
  const t=reduced.matches?0.65:elapsed;
  render(state,t,{garland:garlandSelect.value,ornaments:ornaments.value,lights:lights.value,skirt:skirt.value,topper:topper.value});
  if (!reduced.matches||Number.isFinite(motions[state][1])) frame=requestAnimationFrame(draw);
}
function refresh() {
  cancelAnimationFrame(frame); draw(performance.now());
}
document.querySelector('.pet').onclick=()=>activate(state==='sleep'?'wake':'hello');
document.querySelector('#size').onchange=e=>document.querySelector('.stage').dataset.size=e.target.value;
ornaments.onchange=lights.onchange=skirt.onchange=topper.onchange=refresh;
document.addEventListener('visibilitychange',refresh);
reduced.addEventListener('change',refresh);
const garlandSelect=document.querySelector('#garland');
garlandSelect.onchange=refresh;
for(const [group,selected] of Object.entries({topper:4,ornaments:0,garland:0,lights:0,skirt:1})){
  const select=document.getElementById(group);
  select.replaceChildren(...Object.entries(evergreenAccessories[group]).map(([value,label])=>new Option(label,value)));
  select.value=group+'-'+selected;
}
const render=createEvergreenRenderer(canvas,refresh);
