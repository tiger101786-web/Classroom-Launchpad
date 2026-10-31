// Local-only preview server. Serves only this preview's public assets.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png'};
const allowed=new Set(['index.html','preview.js','animation.js','rig-test.js','rig-accessories-test.js','basket-accessories.js','accessories/french-fries.png','accessories/waffle-fries.png','materials-face-test.js','preview.css','nugget-concept.png','body.png','basket.png']);
http.createServer((req,res)=>{
 const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
 const production=/^nugget-pet\/accessories\/(french-fries|waffle-fries)-v2\.png$/.test(name)||name.startsWith('nugget-pet/')&&(['accessories.js','rig.js','materials.js','skins.js','nugget-concept.png','body.png','basket.png'].includes(name.slice(11))||/^nugget-pet\/skins\/(spicy|buffalo|bbq|garlic-parm|honey-mustard|extra-crispy|burnt)-material\.png$/.test(name));
 const themeAsset=['themes-preview.js','rig-themes-test.js'].includes(name)||/^themes\/(mcdonalds|chick-fil-a|burger-king|raising-canes)\.png$/.test(name);
 if(!allowed.has(name)&&!themeAsset&&!/^accessories\/(french-fries|waffle-fries)-v2\.png$/.test(name)&&!production){res.writeHead(404);res.end('Not found');return}
 fs.readFile(production?path.join(__dirname,'../..',name):path.join(__dirname,name),(error,data)=>{
  if(error){res.writeHead(500);res.end('Unable to read preview asset');return}
  res.writeHead(200,{'Content-Type':types[path.extname(name)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(data);
 });
}).listen(8766,'127.0.0.1',()=>console.log('Nugget preview: http://127.0.0.1:8766/'));
