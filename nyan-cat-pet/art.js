const nyanStars=Array.from({length:37},(_,i)=>[(i*73+11)%317,(i*47+7)%119]);
window.drawNyanCat = function(canvas, mode, t, now, studio, headphones){
const g=canvas.getContext('2d'),W=canvas.width,H=canvas.height;
const lengths=[0,2.8,.6,2.5,4,2.1,2.6,2.8,2,2.5,0,3.8,0];
const ink='#292238',fur='#aaa8b3',light='#cbc9cf',pink='#ff92bc';function rect(col,x,y,w,h){g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w,h)}
// Fill whole pixel rows so diagonal edges stay crisp at every preview size.
function poly(color,pts){for(let y=Math.floor(Math.min(...pts.map(p=>p[1])));y<Math.max(...pts.map(p=>p[1]));y++){let xs=[];for(let i=0;i<pts.length;i++){let [x1,y1]=pts[i],[x2,y2]=pts[(i+1)%pts.length];if((y1<=y+.5&&y+.5<y2)||(y2<=y+.5&&y+.5<y1))xs.push(x1+(y+.5-y1)*(x2-x1)/(y2-y1))}xs.sort((a,b)=>a-b);for(let j=0;j<xs.length;j+=2)rect(color,Math.round(xs[j]),y,Math.round(xs[j+1])-Math.round(xs[j]),1)}}
function box(col,x,y,w,h,r){rect(col,x+r,y,w-2*r,h);rect(col,x,y+r,w,h-2*r);if(r>1)rect(col,x+1,y+1,w-2,h-2)}
const sleep=mode===10,dance=mode===12,beat=Math.floor(now/(sleep?600:dance?95:150)),p=beat%6,k=Math.sin(t*8),tm=now/1000;g.clearRect(0,0,W,H);
if(studio){rect('#101b3c',0,0,W,H);
nyanStars.forEach(([sx,sy],i)=>{let x=Math.floor(((sx/317*W-tm*(sleep?1:6)+W*10000)%W)),y=Math.floor(sy/119*H);rect(i%3?'#a8bced':'#fdf3e1',x,y,1,1);if((beat+i)%9<3&&i%3===0){rect('#d0e6ff',x-1,y,3,1);rect('#d0e6ff',x,y-1,1,3)}});
}
const reach=Math.max(16,Math.min(78,W-80));
const bx=Math.round((W+reach-58)/2)+(mode===9?Math.round(k*4):0),by=Math.round(H*.50)-12+(sleep?1:dance?[0,-3,-5,-3,0,1][p]:[0,0,-1,-1,0,1][p]);
g.save();g.translate(bx,by);
// Project a bend in the horizontal plane. Vertical stripes keep their order as the
// far side turns behind the near side, and shrink with increasing distance.
const palette=[[255,74,84],[255,153,47],[255,229,62],[106,233,79],[65,193,255],[144,104,246]];
const join=-reach*.77,phase=sleep?0:beat*2,sections=[];
function section(x,y,width,depth,along){
  const ripple=((Math.floor((along+phase)/8)%2+2)%2)*width/10;
  return {x,y:y+ripple,width,depth};
}
for(let i=0;i<=52;i++){
  const u=i/52,v=1-u;
  const x=join+reach*(.25*v*v*v-3*.53*v*v*u-3*.31*v*u*u);
  const y=21-(27+(sleep?0:Math.sin(tm*2)))*v*v*v-3*12*v*v*u;
  sections.push(section(x,y,1+15*u**1.35,v,join-48*v));
}
for(let x=Math.ceil(join);x<=5;x++){
  const u=(x-join)/(5-join);
  sections.push(section(x,21-6*u,16+4*u,0,x-.001),section(x,21-6*u,16+4*u,0,x));
}
function outline(ctx,points){
  ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);ctx.closePath();ctx.fill();
}
// A soft halo stays behind the opaque ribbon and the cat.
g.save();g.filter='blur(2px)';g.fillStyle='rgba(174,139,255,.32)';
outline(g,sections.map(q=>[q.x,q.y-q.width*.65]).concat(sections.slice().reverse().map(q=>[q.x,q.y+q.width*.65])));g.restore();
for(let i=1;i<sections.length;i++){
  const a=sections[i-1],b=sections[i];
  const rim=Math.exp(-((b.depth-.42)**2)/.024);
  palette.forEach((rgb,j)=>{
    const shade=.99-.40*b.depth+.14*rim;
    const color=rgb.map(n=>Math.round(Math.min(255,n*shade+24*rim)));
    const y0=j/6-.5,y1=(j+1)/6-.5;
    poly('rgb('+color.join(',')+')',[[a.x,a.y+y0*a.width],[b.x,b.y+y0*b.width],[b.x,b.y+y1*b.width],[a.x,a.y+y1*a.width]]);
  });
}
// Small moving glints follow the surface and thin out into the distance.
for(let i=0;i<22;i++){
  const n=(i*37+Math.floor(sleep?0:tm*5))%sections.length,q=sections[n];
  const across=((i*19)%29)/29-.5;
  g.globalAlpha=(.28+.35*(1-q.depth))*(.8+.2*Math.sin(i+tm*2));
  rect('#fff4dc',q.x,q.y+across*q.width,1,1);
}
g.globalAlpha=1;
const tail=(mode===7?Math.round(5*k):[0,1,2,1,-1,-2][p]);for(let i=0;i<11;i++){let y=17+Math.round(Math.sin(i/3+p*.7)*1.5+tail*i/11-i*.25);box(ink,2-i,y,5,5,1);rect(fur,3-i,y+1,3,3)}
const waving=mode===1||mode===6;
for(const [j,x] of [4,13,26,35].entries()){if(waving&&j===3)continue;let dx=sleep?0:[0,1,2,1,-1,-2][(p+j*2)%6],dy=sleep?-1:(p+j)%3;box(ink,x+dx,24+dy,7,7,2);rect(fur,x+dx+1,25+dy,5,4)}
box(ink,0,0,42,28,3);box('#e9a958',1,1,40,26,3);box('#ffdb91',2,2,38,23,3);box('#da719e',4,3,34,21,3);box('#ffaaca',5,4,32,18,3);[[8,8],[13,5],[20,10],[10,17],[16,14],[25,6],[29,12],[20,19],[6,13],[32,7]].forEach(([x,y],i)=>rect(i%2?'#ed508d':'#f564a0',x,y,2,2));
if(waving){
  const lift=Math.min(1,t*5,(lengths[mode]-t)*5);
  const x=38+Math.round((17+2*k)*lift), y=30-Math.round((5+3*k)*lift);
  // The foreleg starts under the chin. Draw behind the face so the paw cannot cover either eye.
  poly(ink,[[35,26],[40,26],[x+3,y-2],[x+4,y+3],[42,34],[36,34]]);
  poly(fur,[[37,27],[40,27],[x+2,y],[x+2,y+2],[42,32],[37,32]]);
  box(ink,x,y-4,7,8,2);box(fur,x+1,y-3,5,6,1);rect(pink,x+2,y,3,2);
}
g.save();g.translate(28,8+(dance?p%2:0));const tip=mode===5?Math.round(3*Math.max(0,k)):0;
poly(ink,[[0,11],[-tip,tip],[3-tip,tip],[9,5],[15,5],[21+tip,tip],[24+tip,tip],[24,11],[27,14],[27,21],[23,25],[4,25],[-2,21],[-2,14]]);
poly(fur,[[1,12],[1-tip,2+tip],[3-tip,2+tip],[9,7],[16,7],[21+tip,2+tip],[23+tip,2+tip],[23,12],[25,15],[25,20],[22,23],[5,23],[0,20],[0,15]]);
poly('#d6bccb',[[3-tip,4+tip],[7,8],[3,8]]);poly('#d6bccb',[[21+tip,4+tip],[21,8],[17,9]]);
const happy=mode===3||mode===1;
const closed=sleep||mode===2&&t>.1&&t<.45||mode===11&&t<2||mode===0&&tm%4.9<.14;for(const x of [5,18]){if(happy||closed){rect(ink,x,14,4,1);if(happy){rect(ink,x+1,13,2,1)}}else{rect(ink,x,12,3,5);rect('white',x,12,1,1)}}rect(pink,1,17,4,2);rect(pink,21,17,4,2);
let nx=mode===8?Math.round(k):0;rect(ink,12+nx,16,2,2);rect(ink,9,18,1,2);rect(ink,10,20,3,1);rect(ink,13,18,1,2);rect(ink,14,20,3,1);rect(ink,17,18,1,2);let opening=mode===11?Math.round(4*Math.sin(Math.PI*t/3.8)**2):sleep?Math.round(2*(1+Math.sin(tm*2))/2):(mode===4||mode===1)?Math.round(3*(1+k)/2):0;if(opening){rect(ink,11,19,5,opening+1);if(opening>1)rect('#f788ab',12,19+opening,3,1)}
if(dance||headphones){rect('#342f50',0,3,24,2);for(const x of [-4,22]){box('#7954b0',x,7,7,9,2);box('#46c9ff',x+1,9,5,5,2);rect('#aaeaff',x+2,10,2,1)}}
g.restore();if(sleep){g.fillStyle='#e3d8ff';g.font='bold 8px monospace';g.fillText('z Z',50,4-p%3)}g.restore();
};
