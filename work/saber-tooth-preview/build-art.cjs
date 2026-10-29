// Package unchanged source artwork for WebGL when the preview is opened via file://.
const fs=require('node:fs'),path=require('node:path');
const p=path.join(__dirname,'tiger.png');
fs.writeFileSync(path.join(__dirname,'art-data.js'),'window.saberArtData="data:image/png;base64,'+fs.readFileSync(p).toString('base64')+'";\n');
fs.appendFileSync(path.join(__dirname,'art-data.js'),'window.saberUnderlayData="data:image/png;base64,'+fs.readFileSync(path.join(__dirname,'limb-underlay.png')).toString('base64')+'";\n');
