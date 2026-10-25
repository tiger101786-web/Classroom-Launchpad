/* Fitted clothing in the same 1024 × 1536 coordinates as Labubu's puppet.
   Headwear, outfits and necklaces are independent persisted slots. */
window.mountLabubuClothes=function(host){
 const ns='http://www.w3.org/2000/svg',layer=document.createElementNS(ns,'g');
 layer.id='labubu-clothes';layer.setAttribute('pointer-events','none');
 const fabric=(id,light,mid,dark)=>`<linearGradient id="lc-${id}" x2="1" y2=".3"><stop stop-color="${dark}"/><stop offset=".22" stop-color="${mid}"/><stop offset=".45" stop-color="${light}"/><stop offset=".72" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></linearGradient>`;
 const knit=`<pattern id="lc-knit" width="10" height="14" patternUnits="userSpaceOnUse"><path d="M1 0Q9 5 5 13M9 0Q1 5 5 13" fill="none" stroke="#fff1ba" stroke-opacity=".24" stroke-width="1.5"/><path d="M5 0V14" stroke="#4e310d" stroke-opacity=".18" stroke-width="1"/></pattern>`;
 const twill=`<pattern id="lc-twill" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M-1 1L1 -1M0 7L7 0M6 8L8 6" stroke="#c4c5ca" stroke-opacity=".13" stroke-width="1"/></pattern>`;
 const shape=(d,fill,texture='lc-twill',stroke='#191a1d')=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/><path d="${d}" fill="url(#${texture})"/>`;
 const seam=d=>`<path d="${d}" fill="none" stroke="#c7b79a" stroke-opacity=".65" stroke-width="2.5" stroke-dasharray="5 5"/>`;
 const crown=`<path d="M-25 13L-32 -13L-12 -2L0 -22L12 -2L32 -13L25 13Z" fill="#40382e"/><circle cy="-25" r="4" fill="#40382e"/>`;
 const tag=(x,y)=>`<g transform="translate(${x} ${y})"><path d="M-54 -27H54L0 37Z" fill="#17191c" stroke="#c4c3b6" stroke-width="3"/><path d="M-40 -18H40L0 24Z" fill="none" stroke="#878d90" stroke-width="1.5"/><text y="-3" text-anchor="middle" font-family="Georgia,serif" font-size="16" letter-spacing="2" fill="#ece5d4">PRADA</text><path d="M-17 5H17" stroke="#c4c3b6"/></g>`;
 const torso='M335 934Q512 971 689 934Q735 984 742 1134L758 1300Q712 1339 512 1348Q312 1339 266 1300L282 1134Q289 984 335 934Z';
 const pants='M278 1242Q512 1270 746 1242L748 1390Q660 1436 552 1400L520 1306H504L472 1400Q364 1436 276 1390Z';
 const sleeve='M333 950Q244 942 196 1008Q155 1050 145 1092Q170 1130 232 1139L301 1085Z';
 const sleeves=(color,texture,stroke,outline=sleeve)=>[false,true].map(right=>`<g class="lc-sleeve" data-side="${right?'right':'left'}"><g ${right?'transform="translate(1024 0) scale(-1 1)"':''}>${shape(outline,color,texture,stroke)}<path d="M155 1090Q186 1121 238 1125" fill="none" stroke="${stroke}" stroke-width="17"/>${seam('M168 1084Q195 1108 240 1113')}</g></g>`).join('');
 const rib=(x,y,w,color)=>`<rect x="${x}" y="${y}" width="${w}" height="30" rx="10" fill="${color}"/><path d="${Array.from({length:Math.floor(w/8)},(_,i)=>`M${x+5+i*8} ${y+4}v22`).join('')}" stroke="#fff" stroke-opacity=".15" stroke-width="2"/>`;
 layer.innerHTML=`<defs>${fabric('mustard','#eec25a','#c99425','#80551a')}${fabric('cream','#fffaf0','#e5dfcf','#b4aa94')}${fabric('black','#41434a','#26282e','#101115')}${fabric('gold','#fff2b0','#c59a40','#675021')}${knit}${twill}<mask id="lc-dressed-body" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1536"><rect width="1024" height="1536" fill="white"/><path d="M310 970H714L785 1200V1411H239V1200Z" fill="black"/></mask></defs>
 <g data-lc-slot="outfit" data-lc-value="mustard-overalls" style="display:none">
 ${sleeves('url(#lc-cream)','lc-knit','#b7af9d','M348 909Q252 910 196 1008Q155 1050 145 1092Q170 1130 232 1139L321 1085Z')}
 ${shape('M315 909Q512 971 709 909Q745 984 742 1090H282Q279 984 315 909Z','url(#lc-cream)','lc-knit','#b7af9d')}
 ${shape(pants,'url(#lc-mustard)','lc-knit','#8c6423')}
 ${shape('M279 1040Q512 1104 745 1040L768 1300Q670 1343 512 1334Q353 1343 256 1300Z','url(#lc-mustard)','lc-knit','#8c6423')}
 <defs><clipPath id="lc-strap-neckline"><path d="M315 909Q512 971 709 909Q745 984 742 1120H282Q279 984 315 909Z"/></clipPath></defs>
 <g clip-path="url(#lc-strap-neckline)">
 <path d="M320 860Q312 916 336 953L376 1102M704 860Q712 916 688 953L648 1102" fill="none" stroke="#362719" stroke-width="43"/>
 <path d="M310 860Q302 918 326 956L366 1100M330 860Q322 914 346 951L386 1095M694 860Q702 914 678 951L638 1095M714 860Q722 918 698 956L658 1100" fill="none" stroke="#bc9a65" stroke-width="2" stroke-dasharray="5 4"/>
 </g>
 <g fill="none" stroke="url(#lc-gold)" stroke-width="8"><rect x="329" y="1011" width="58" height="54" rx="5" transform="rotate(-14 358 1038)"/><rect x="637" y="1011" width="58" height="54" rx="5" transform="rotate(14 666 1038)"/></g>
 ${shape('M416 1135Q512 1150 608 1135L596 1217Q512 1267 428 1217Z','url(#lc-mustard)','lc-knit','#997022')}${seam('M428 1147L439 1211Q512 1249 585 1211L596 1147')}
 <path d="M312 1272Q365 1310 420 1298M603 1298Q658 1310 712 1272" fill="none" stroke="#785018" stroke-opacity=".4" stroke-width="8"/>
 ${rib(287,1380,180,'#b58524')}${rib(557,1380,180,'#b58524')}
 <g transform="translate(651 1317)"><rect x="-57" y="-39" width="114" height="78" rx="4" fill="#dad8c9" stroke="#5d584c" stroke-width="4"/><rect x="-51" y="-33" width="102" height="66" rx="3" fill="none" stroke="#5d584c" stroke-width="2" stroke-dasharray="3 4"/>${crown}</g>
 </g>
 <g data-lc-slot="outfit" data-lc-value="black-streetwear" style="display:none">
 ${shape(pants,'url(#lc-black)')}${shape(torso,'url(#lc-black)')}
 <path d="M340 946Q512 1021 684 946L667 982Q512 1054 357 982Z" fill="#111318" stroke="#66686b" stroke-width="3"/>
 ${seam('M312 1004L294 1278Q512 1337 730 1278L712 1004')}
 <path d="M318 1240L389 1261M706 1240L635 1261M512 1295V1320" fill="none" stroke="#9c9c9a" stroke-width="3"/>
 ${rib(283,1380,186,'#17191c')}${rib(555,1380,186,'#17191c')}${tag(512,1163)}
 </g>
 <g data-lc-slot="outfit" data-lc-value="black-hoodie" style="display:none">
 ${sleeves('url(#lc-black)','lc-twill','#1b1c20')}${shape(pants,'url(#lc-black)')}${shape(torso,'url(#lc-black)')}
 ${rib(285,1380,184,'#191a1f')}${rib(555,1380,184,'#191a1f')}
 ${shape('M390 1162Q512 1180 634 1162L689 1254Q512 1284 335 1254Z','url(#lc-black)')}${seam('M397 1176Q512 1193 627 1176M348 1246Q512 1271 676 1246')}
 <path d="M393 1172L352 1233M631 1172L672 1233" stroke="#686970" stroke-width="7" stroke-linecap="round"/>
 ${rib(276,1285,472,'#191a1f')}
 <path d="M442 967Q431 1050 414 1110M582 967Q593 1050 610 1110" fill="none" stroke="#111" stroke-width="15" stroke-linecap="round"/>
 <path d="M442 967Q431 1050 414 1110M582 967Q593 1050 610 1110" fill="none" stroke="#e8e3d6" stroke-width="10" stroke-linecap="round"/>
 <g fill="#eee7d4" stroke="#aaa28d" stroke-width="2"><ellipse cx="414" cy="1102" rx="11" ry="14"/><ellipse cx="610" cy="1102" rx="11" ry="14"/><path d="M410 1110L405 1135L417 1138L419 1110ZM605 1110L607 1138L619 1135L615 1110Z"/></g>
 </g>
 <g data-lc-slot="neckwear" data-lc-value="gold-chain" style="display:none">
 <path d="M329 954Q512 1119 695 954" fill="none" stroke="#332517" stroke-width="22"/>
 ${Array.from({length:13},(_,i)=>{const t=i/12,x=329+366*t,y=954+330*t*(1-t),a=42-84*t;return `<ellipse cx="${x}" cy="${y}" rx="23" ry="13" transform="rotate(${a} ${x} ${y})" fill="none" stroke="#49391b" stroke-width="12"/><ellipse cx="${x}" cy="${y-2}" rx="23" ry="13" transform="rotate(${a} ${x} ${y-2})" fill="none" stroke="url(#lc-gold)" stroke-width="8"/>`}).join('')}
 </g>
 <g data-lc-slot="headwear" data-lc-value="mustard-cap" style="display:none">
 ${shape('M189 528Q198 342 370 330Q512 304 654 330Q826 342 835 528L799 568Q512 497 225 568Z','url(#lc-mustard)','lc-knit','#8c6423')}
 ${seam('M212 504Q223 363 379 350M512 327V496M645 350Q801 363 812 504')}
 ${shape('M200 506Q512 456 824 506L851 582Q764 614 691 576Q512 530 333 576Q260 614 173 582Z','url(#lc-mustard)','lc-knit','#8c6423')}
 ${seam('M194 573Q264 598 330 564Q512 518 694 564Q760 598 830 573')}
 </g>
 <g data-lc-slot="headwear" data-lc-value="black-bucket" style="display:none">
 ${shape('M243 355Q512 306 781 355L826 516Q512 563 198 516Z','url(#lc-black)')}
 ${seam('M257 366Q512 325 767 366M235 469Q512 518 789 469')}
 ${shape('M202 488Q512 539 822 488L892 589Q790 612 716 577Q512 536 308 577Q234 612 132 589Z','url(#lc-black)')}
 ${seam('M158 578Q235 599 310 563Q512 523 714 563Q789 599 866 578')}${tag(512,416)}
 </g>
 <g data-lc-slot="headwear" data-lc-value="black-hood" style="display:none">
 ${shape('M190 552Q204 345 512 331Q820 345 834 552Q950 774 775 958Q664 1007 512 972Q360 1007 249 958Q74 774 190 552ZM223 584Q139 789 282 914Q512 988 742 914Q885 789 801 584Q764 444 512 435Q260 444 223 584Z','url(#lc-black)')}
 <path d="M223 584Q139 789 282 914Q512 988 742 914Q885 789 801 584Q764 444 512 435Q260 444 223 584Z" fill="none" stroke="#575960" stroke-width="13"/>
 ${seam('M205 579Q116 791 270 932Q512 1010 754 932Q908 791 819 579Q776 421 512 413Q248 421 205 579')}
 </g>`;
 // The clothes share the body transform; headphones stay above hats during music.
 // Garments surround the fur silhouette rather than leaving an exposed strip
 // down either side. Keep the neck and face openings inside the hood.
 for(const outfit of layer.querySelectorAll('[data-lc-slot="outfit"]'))outfit.setAttribute('transform','translate(512 0) scale(1.14 1) translate(-512 0)');
 layer.querySelector('[data-lc-value="black-hood"]').setAttribute('transform','translate(512 0) scale(1.09 1) translate(-512 0)');
 const headphones=host.querySelector('#headphones');headphones.before(layer);
 const items=[...layer.querySelectorAll('[data-lc-slot]')],sleeveNodes=[...layer.querySelectorAll('.lc-sleeve')];
 return {
  set(prefs,dancing){for(const item of items){const show=prefs[item.dataset.lcSlot]===item.dataset.lcValue&&!(dancing&&item.dataset.lcSlot==='headwear');item.style.display=show?'':'none';}
   // Replace the covered torso's fur silhouette, rather than pasting a smaller
   // garment over it. Bare hands/feet and the sleeveless outfit's arms remain.
   const dressed=['mustard-overalls','black-streetwear','black-hoodie'].includes(prefs.outfit);
   for(const art of [host.querySelector('#puppet .labubu-colored-art'),host.querySelector('#puppet foreignObject')].filter(Boolean)){
    if(dressed)art.setAttribute('mask','url(#lc-dressed-body)');else art.removeAttribute('mask');
   }
  },
  animate(wave){for(const sleeve of sleeveNodes){const sign=sleeve.dataset.side==='right'?-1:1;sleeve.style.transform=`translate(${sign*-wave*19}px,${wave*19}px)`;}}
 };
};
