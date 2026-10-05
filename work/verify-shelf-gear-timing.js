const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('collectible-shelf.js', 'utf8');
const sceneSource = fs.readFileSync('launchpad-scenes.js', 'utf8');
const shelf = require('../collectible-shelf.js');
for (const side of ['left', 'right']) {
  const html = shelf.render({ authenticated:true, homeShelf:{enabled:true}, homeShelfRight:{enabled:true} }, side);
  const menu = html.slice(html.indexOf('<div id="shelfSettingsMenu'));
  assert(menu.includes('Customize shelf'));
  assert(!menu.includes('hideCollectibleShelf'), 'Redundant Hide action remains in menu');
  assert.equal((html.match(/data-action="hideCollectibleShelf"/g) || []).length, 1);
}
function checkTimer(code, call) {
  let delay, callback;
  const classes = new Set();
  const gear = { isConnected:true, focus(){}, blur(){}, matches(){return false}, getAttribute(){return 'false'}, classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)} };
  const document = { querySelector:s=>s === '.shelf-dialog' ? null : gear, getElementById:()=>gear, activeElement:gear };
  vm.runInNewContext(code + ';' + call, { document, clearTimeout(){}, setTimeout(fn,ms){delay=ms;callback=fn;return 1} });
  assert(classes.has('is-recent'));
  assert(!classes.has('is-idle'));
  callback();
  assert(classes.has('is-idle'));
  return delay;
}
const shelfDelay = checkTimer(source.slice(source.indexOf('  const gearHideTimers'), source.indexOf('  function open({')), "restoreGear(false, 'left')");
const sceneDelay = checkTimer(sceneSource.slice(sceneSource.indexOf('  let gearHideTimer;'), sceneSource.indexOf('  const settings =')), 'settleGear(false)');
assert.equal(shelfDelay, sceneDelay);
assert.equal(shelfDelay, 3000);
console.log('PASS: both shelf menus retain Customize only; separate Hide buttons remain; gear inactivity timers match. Pointer-leave behavior is checked separately.');
