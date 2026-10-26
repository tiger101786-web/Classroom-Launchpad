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
 // Reuse the corrected garment silhouettes, neck openings, and sleeve rig.
 // New fabric gradients are scoped to the clones, leaving approved outfits intact.
 layer.querySelector('defs').insertAdjacentHTML('beforeend',`${fabric('denim','#6d9ac0','#386889','#203b55')}${fabric('sage','#a2b58d','#6d835c','#3e5239')}${fabric('navy','#455b80','#263958','#121e35')}`);
 function variant(source,id,replacements){const copy=layer.querySelector(`[data-lc-value="${source}"]`).cloneNode(true);copy.dataset.lcValue=id;let markup=copy.innerHTML;for(const [from,to] of replacements)markup=markup.split(from).join(to);markup=markup.split('lc-strap-neckline').join('lc-strap-neckline-'+id);copy.innerHTML=markup;layer.append(copy);return copy;}
 const denim=[['url(#lc-mustard)','url(#lc-denim)'],['lc-knit','lc-twill'],['#8c6423','#254862'],['#997022','#31546f'],['#b58524','#2d526f'],['#785018','#1f3d58']];
 const dungarees=variant('mustard-overalls','denim-overalls',denim);
 dungarees.insertAdjacentHTML('beforeend',`<path d="M300 1262Q355 1290 404 1279M620 1279Q669 1290 724 1262" fill="none" stroke="#b7cbd4" stroke-width="3" stroke-dasharray="5 5"/><g transform="translate(512 1188)"><rect x="-38" y="-19" width="76" height="38" rx="5" fill="#b28a58" stroke="#624d38" stroke-width="3"/><path d="M-23 7L-8 -7L3 2L15 -9L25 7Z" fill="#443e35"/></g>`);
 variant('mustard-cap','denim-cap',denim);
 const coveredShoulder='M348 909Q252 910 196 1008Q155 1050 145 1092Q170 1130 232 1139L321 1085Z',coveredTorso=torso.replace('M335 934Q512 971 689 934','M315 909Q512 971 709 909');
 const explorer=variant('black-hoodie','sage-jacket',[['url(#lc-black)','url(#lc-sage)'],['#1b1c20','#3f5239'],['#191a1d','#3f5239'],['#191a1f','#435837'],['#686970','#b7bd92']]);
 // Replace hoodie drawstrings and pouch with a zip-front field jacket.
 explorer.innerHTML=`${sleeves('url(#lc-sage)','lc-twill','#3f5239',coveredShoulder)}${shape(pants,'url(#lc-cream)','lc-twill','#8c826d')}${shape(coveredTorso,'url(#lc-sage)','lc-twill','#3f5239')}<path d="M512 977V1305" stroke="#304532" stroke-width="15"/><path d="M512 977V1305" stroke="#c7c6a4" stroke-width="5" stroke-dasharray="5 3"/><path d="M353 952L444 987L414 1040M671 952L580 987L610 1040" fill="none" stroke="#c4c6a0" stroke-width="13"/>${[336,554].map(x=>`${shape(`M${x} 1085H${x+134}V1197Q${x+67} 1220 ${x} 1197Z`,'url(#lc-sage)','lc-twill','#3f5239')}<path d="M${x} 1085L${x+67} 1120L${x+134} 1085" fill="#8fa17c" stroke="#465d3f" stroke-width="4"/><circle cx="${x+67}" cy="1128" r="7" fill="#d3bc79"/>${seam(`M${x+10} 1145V1189Q${x+67} 1208 ${x+124} 1189V1145`)}`).join('')}${rib(285,1380,184,'#a49b83')}${rib(555,1380,184,'#a49b83')}${seam('M306 1277Q512 1325 718 1277')}`;
 const bucket=variant('black-bucket','sage-bucket',[['url(#lc-black)','url(#lc-sage)'],['#191a1d','#3f5239']]);
 bucket.querySelector('g[transform="translate(512 416)"]')?.remove();
 bucket.insertAdjacentHTML('beforeend',`<g transform="translate(512 418)"><rect x="-47" y="-29" width="94" height="58" rx="9" fill="#ded2a6" stroke="#3f5239" stroke-width="4"/><path d="M-30 17L-8 -19L8 4L19 -10L33 17Z" fill="#45613c"/>${seam('M-39 -20H39V20H-39Z')}</g>`);
 const varsity=variant('black-hoodie','navy-varsity',[]);
 varsity.innerHTML=`${sleeves('url(#lc-cream)','lc-twill','#b4aa94',coveredShoulder)}${shape(pants,'url(#lc-navy)','lc-twill','#16253e')}${shape(coveredTorso,'url(#lc-navy)','lc-twill','#16253e')}<path d="M350 950Q512 1020 674 950" fill="none" stroke="#e6d5ac" stroke-width="19"/><path d="M512 982V1303" stroke="#d7bd83" stroke-width="9"/>${[1040,1110,1180,1250].map(y=>`<circle cx="528" cy="${y}" r="8" fill="#eedbb4" stroke="#6e664e" stroke-width="2"/>`).join('')}<path d="M331 1208L424 1167M693 1208L600 1167" stroke="#e8d5ac" stroke-width="12" stroke-linecap="round"/><path d="M285 1295Q512 1340 739 1295" fill="none" stroke="#dfc89b" stroke-width="18"/><text x="383" y="1104" text-anchor="middle" font-family="Georgia,serif" font-size="88" font-weight="900" fill="#f3dfb0" stroke="#a2814c" stroke-width="2">L</text>${rib(285,1380,184,'#263958')}${rib(555,1380,184,'#263958')}<path d="M292 1392H461M563 1392H732" stroke="#e1c997" stroke-width="6"/>`;
 variant('black-hood','navy-hood',[['url(#lc-black)','url(#lc-navy)'],['#191a1d','#16253e'],['#575960','#b7c5d4']]);
 layer.insertAdjacentHTML('beforeend',`<g data-lc-slot="neckwear" data-lc-value="compass" style="display:none"><path d="M329 954Q512 1090 695 954" fill="none" stroke="#443525" stroke-width="14"/><path d="M329 951Q512 1087 695 951" fill="none" stroke="#b59a66" stroke-width="5"/><g transform="translate(512 1044)"><circle r="35" fill="url(#lc-gold)" stroke="#59462b" stroke-width="5"/><circle r="26" fill="#233c38" stroke="#f0dba0" stroke-width="3"/><path d="M0 -22L8 0L0 22L-8 0Z" fill="#f1d990"/><path d="M0 -22L8 0H-8Z" fill="#db685b"/><circle r="4" fill="#fff1bc"/></g></g>`);
 layer.querySelector('defs').insertAdjacentHTML('beforeend',`${fabric('teal','#64c8c4','#278f96','#155361')}${fabric('berry','#b66e7d','#803e54','#482539')}<pattern id="lc-plaid" width="48" height="48" patternUnits="userSpaceOnUse"><rect width="48" height="48" fill="#cbb98d"/><path d="M12 0V48M0 12H48" stroke="#783c50" stroke-width="14"/><path d="M36 0V48M0 36H48" stroke="#294f54" stroke-width="8"/><path d="M22 0V48M0 22H48" stroke="#f1dfb7" stroke-width="3"/></pattern>`);
 const rain=variant('sage-jacket','teal-raincoat',[]);
 rain.innerHTML=`${sleeves('url(#lc-teal)','lc-twill','#185563',coveredShoulder)}${shape(pants,'url(#lc-black)')}${shape(coveredTorso,'url(#lc-teal)','lc-twill','#185563')}<path d="M512 976V1310" stroke="#164c59" stroke-width="19"/><path d="M518 981V1300" stroke="#a3e1d4" stroke-width="4"/>${[1020,1100,1180,1260].map(y=>`<circle cx="512" cy="${y}" r="7" fill="#eed5a1" stroke="#4f605a" stroke-width="2"/>`).join('')}<path d="M350 954L445 995L420 1040M674 954L579 995L604 1040" fill="none" stroke="#a3e1d4" stroke-width="12"/>${[332,563].map(x=>`${shape(`M${x} 1145H${x+130}L${x+120} 1243Q${x+65} 1260 ${x+10} 1243Z`,'url(#lc-teal)','lc-twill','#185563')}<path d="M${x} 1145H${x+130}L${x+120} 1174H${x+10}Z" fill="#53b6b3" stroke="#185563" stroke-width="3"/>`).join('')}<path d="M289 1298Q512 1337 735 1298" fill="none" stroke="#b5e1cf" stroke-width="7"/>${rib(285,1380,184,'#242b32')}${rib(555,1380,184,'#242b32')}<path d="M617 1065Q635 1023 653 1065A19 19 0 1 1 617 1065Z" fill="#f1ddab"/>`;
 variant('black-hood','teal-hood',[['url(#lc-black)','url(#lc-teal)'],['#191a1d','#185563'],['#575960','#a3e1d4']]);
 const sweater=variant('navy-varsity','berry-sweater',[]);
 sweater.innerHTML=`${sleeves('url(#lc-berry)','lc-knit','#54293e',coveredShoulder)}${shape(pants,'url(#lc-cream)','lc-twill','#9a8d73')}${shape(coveredTorso,'url(#lc-berry)','lc-knit','#54293e')}<path d="M351 952Q512 1025 673 952" fill="none" stroke="#d2ab91" stroke-width="21"/>${[357,421,485,549,613,677].map(x=>`<path d="M${x} 1045Q${x+24} 1071 ${x} 1097Q${x-24} 1123 ${x} 1149Q${x+24} 1175 ${x} 1201Q${x-24} 1227 ${x} 1253" fill="none" stroke="#d19a9f" stroke-opacity=".65" stroke-width="5"/>`).join('')}${rib(276,1285,472,'#612d43')}${rib(285,1380,184,'#b5a78a')}${rib(555,1380,184,'#b5a78a')}<rect x="620" y="1267" width="64" height="41" rx="5" fill="#d4b584" stroke="#6c523d" stroke-width="3"/><path d="M636 1295L651 1278L669 1295Z" fill="#724653"/>`;
 const beanie=variant('mustard-cap','berry-beanie',[]);
 beanie.innerHTML=`${shape('M189 528Q198 342 370 330Q512 304 654 330Q826 342 835 528L799 568Q512 497 225 568Z','url(#lc-berry)','lc-knit','#54293e')}${shape('M193 492Q512 449 831 492L835 557Q512 510 189 557Z','url(#lc-berry)','lc-knit','#54293e')}${seam('M209 506Q512 465 815 506M209 544Q512 503 815 544')}<rect x="468" y="491" width="88" height="49" rx="6" fill="#d4b584" stroke="#6c523d" stroke-width="3"/><path d="M488 526L511 503L536 526Z" fill="#724653"/>`;
 layer.insertAdjacentHTML('beforeend',`<g data-lc-slot="neckwear" data-lc-value="plaid-scarf" style="display:none"><path class="lc-scarf-wrap" d="M294 928Q512 1001 730 928Q748 956 725 1018Q512 1088 299 1018Q276 956 294 928Z" fill="url(#lc-plaid)" stroke="#66513d" stroke-width="5"/><path d="M626 1007L710 1020L681 1214L598 1198Z" fill="url(#lc-plaid)" stroke="#66513d" stroke-width="5"/><path d="M299 943Q512 1015 725 943M305 1005Q512 1069 719 1005" fill="none" stroke="#efe0bc" stroke-width="4"/><path d="M291 946Q307 971 311 1008M733 946Q717 971 713 1008" fill="none" stroke="#66513d" stroke-opacity=".55" stroke-width="6"/><ellipse cx="665" cy="1020" rx="48" ry="37" fill="url(#lc-plaid)" stroke="#66513d" stroke-width="5"/>${[604,617,630,643,656,669,680].map((x,i)=>`<path d="M${x} ${1199+i*2}l-5 27" stroke="#cbb98d" stroke-width="5" stroke-linecap="round"/>`).join('')}</g>`);
 // Costume collection: same fitted shell and animated sleeves, new garment details.
 layer.querySelector('defs').insertAdjacentHTML('beforeend',`${fabric('leather','#895b44','#50372d','#271f22')}${fabric('space','#f8fcff','#c8dce5','#778eaa')}<pattern id="lc-chef-check" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="#e7e2d5"/><path d="M0 0H12V12H0ZM12 12H24V24H12Z" fill="#44464c"/></pattern><pattern id="lc-sailor" width="24" height="36" patternUnits="userSpaceOnUse"><rect width="24" height="36" fill="#eee2ca"/><path d="M0 23H24" stroke="#963b46" stroke-width="13"/></pattern>`);
 const pirate=variant('sage-jacket','pirate-coat',[]);
 pirate.innerHTML=`${sleeves('url(#lc-leather)','lc-twill','#30232a',coveredShoulder)}${shape(pants,'url(#lc-black)')}${shape(coveredTorso,'url(#lc-leather)','lc-twill','#30232a')}<path d="M431 971Q512 1003 593 971L575 1280H449Z" fill="url(#lc-sailor)"/><path d="M342 943L433 975L453 1051L416 1139M682 943L591 975L571 1051L608 1139" fill="none" stroke="#d3af68" stroke-width="15"/>${[1053,1121,1190].map(y=>`<circle cx="389" cy="${y}" r="9" fill="url(#lc-gold)"/><circle cx="635" cy="${y}" r="9" fill="url(#lc-gold)"/>`).join('')}<path d="M289 1232Q512 1273 735 1232L739 1276Q512 1320 285 1276Z" fill="#231f25" stroke="#c5a065" stroke-width="4"/><rect x="471" y="1241" width="82" height="58" rx="5" fill="url(#lc-gold)"/><rect x="486" y="1255" width="52" height="30" fill="#30232a"/>${rib(285,1380,184,'#28252c')}${rib(555,1380,184,'#28252c')}${seam('M304 1014L290 1207M720 1014L734 1207')}`;
 const tricorn=variant('black-bucket','pirate-tricorn',[]);
 tricorn.innerHTML=`${shape('M254 487Q264 331 512 321Q760 331 770 487Z','url(#lc-leather)','lc-twill','#2c2227')}${shape('M128 433Q249 499 365 443L512 366L659 443Q775 499 896 433L831 566Q713 589 637 536Q512 484 387 536Q311 589 193 566Z','url(#lc-leather)','lc-twill','#2c2227')}<path d="M146 451Q253 516 373 459L512 386L651 459Q771 516 878 451M206 552Q311 571 386 520Q512 468 638 520Q713 571 818 552" fill="none" stroke="#d6b574" stroke-width="8"/><g transform="translate(512 451)"><circle r="31" fill="#d8ba7c" stroke="#6c4c33" stroke-width="5"/><path d="M0 -22L7 -7L22 0L7 7L0 22L-7 7L-22 0L-7 -7Z" fill="#47312c"/></g>`;
 const chef=variant('sage-jacket','chef-uniform',[]);
 chef.innerHTML=`${sleeves('url(#lc-cream)','lc-twill','#aaa394',coveredShoulder)}${shape(pants,'url(#lc-chef-check)','lc-twill','#55545a')}${shape(coveredTorso,'url(#lc-cream)','lc-twill','#aaa394')}<path d="M349 952L512 1040L675 952M551 1019V1306" fill="none" stroke="#b9b09e" stroke-width="5"/>${[1074,1153,1232].map(y=>`<circle cx="442" cy="${y}" r="9" fill="#393a42"/><circle cx="589" cy="${y}" r="9" fill="#393a42"/>`).join('')}<path d="M340 1126H401V1195Q369 1215 340 1195Z" fill="#eee6d6" stroke="#b6ad9a" stroke-width="3"/><path d="M355 1126V1092M368 1126V1092M381 1126V1092" stroke="#77716b" stroke-width="4"/>${seam('M303 1281Q512 1324 721 1281')}${rib(285,1380,184,'#44464c')}${rib(555,1380,184,'#44464c')}`;
 const toque=variant('mustard-cap','chef-hat',[]);
 toque.innerHTML=`${shape('M236 489L224 402Q142 340 206 278Q243 239 308 264Q330 183 412 215Q512 130 612 215Q694 183 716 264Q781 239 818 278Q882 340 800 402L788 489Z','url(#lc-cream)','lc-twill','#aaa394')}<path d="M308 294Q342 365 339 466M411 247Q430 361 429 459M612 247Q594 361 595 459M716 294Q682 365 685 466" fill="none" stroke="#c5bdab" stroke-width="7" stroke-linecap="round"/>${shape('M228 465Q512 423 796 465L807 550Q512 506 217 550Z','url(#lc-cream)','lc-twill','#aaa394')}${seam('M239 481Q512 440 785 481M231 535Q512 493 793 535')}`;
 const space=variant('sage-jacket','space-suit',[]);
 space.innerHTML=`${sleeves('url(#lc-space)','lc-twill','#657e98',coveredShoulder)}${shape(pants,'url(#lc-space)','lc-twill','#657e98')}${shape(coveredTorso,'url(#lc-space)','lc-twill','#657e98')}<path d="M350 951Q512 1020 674 951" fill="none" stroke="#3e566f" stroke-width="22"/><rect x="397" y="1047" width="230" height="145" rx="18" fill="#30495f" stroke="#7b98ad" stroke-width="7"/><rect x="415" y="1066" width="130" height="57" rx="5" fill="#86dedd"/><path d="M427 1105L448 1080L467 1109L492 1088L532 1096" fill="none" stroke="#2f6278" stroke-width="5"/><circle cx="585" cy="1086" r="13" fill="#f3a163"/><circle cx="585" cy="1138" r="10" fill="#a8dca3"/><path d="M417 1150H544M294 1268Q512 1316 730 1268" fill="none" stroke="#66879f" stroke-width="9"/><path d="M408 1185Q330 1212 354 1282M616 1185Q694 1212 670 1282" fill="none" stroke="#586e84" stroke-width="15"/><path d="M408 1185Q330 1212 354 1282M616 1185Q694 1212 670 1282" fill="none" stroke="#aac0cb" stroke-width="7" stroke-dasharray="5 4"/>${rib(285,1380,184,'#3e566f')}${rib(555,1380,184,'#3e566f')}`;
 const helmet=variant('black-hood','space-helmet',[['url(#lc-black)','url(#lc-space)'],['#191a1d','#536e8a'],['#575960','#85d9dc']]);
 helmet.insertAdjacentHTML('beforeend',`<path d="M273 946Q512 1020 751 946" fill="none" stroke="#344e68" stroke-width="24"/><path d="M293 950Q512 1004 731 950" fill="none" stroke="#c6ebed" stroke-width="6"/>${[185,839].map(x=>`<rect x="${x-24}" y="645" width="48" height="108" rx="18" fill="#657e98" stroke="#344e68" stroke-width="4"/><path d="M${x-9} 671V724" stroke="#9ae9e0" stroke-width="7" stroke-linecap="round"/>`).join('')}`);
 layer.insertAdjacentHTML('beforeend',`<g data-lc-slot="neckwear" data-lc-value="chef-kerchief" style="display:none"><path d="M329 948Q512 1016 695 948L686 984Q512 1054 338 984Z" fill="#ad3448" stroke="#6b293b" stroke-width="4"/><path d="M497 1011L445 1101L503 1082L521 1032L568 1109L590 1070L538 1007Z" fill="#c64c5e" stroke="#6b293b" stroke-width="4"/><ellipse cx="518" cy="1018" rx="29" ry="23" fill="#d05b68" stroke="#6b293b" stroke-width="4"/></g>`);
 // The clothes share the body transform; headphones stay above hats during music.
 // Garments surround the fur silhouette rather than leaving an exposed strip
 // down either side. Keep the neck and face openings inside the hood.
 for(const outfit of layer.querySelectorAll('[data-lc-slot="outfit"]'))outfit.setAttribute('transform','translate(512 0) scale(1.14 1) translate(-512 0)');
 for(const id of ['black-hood','navy-hood','teal-hood','space-helmet'])layer.querySelector(`[data-lc-value="${id}"]`).setAttribute('transform','translate(512 0) scale(1.09 1) translate(-512 0)');
 const headphones=host.querySelector('#headphones');headphones.before(layer);
 const items=[...layer.querySelectorAll('[data-lc-slot]')],sleeveNodes=[...layer.querySelectorAll('.lc-sleeve')];
 return {
  set(prefs,dancing){for(const item of items){const show=prefs[item.dataset.lcSlot]===item.dataset.lcValue&&!(dancing&&item.dataset.lcSlot==='headwear');item.style.display=show?'':'none';}
   // Replace the covered torso's fur silhouette, rather than pasting a smaller
   // garment over it. Bare hands/feet and the sleeveless outfit's arms remain.
   const dressed=items.some(item=>item.dataset.lcSlot==='outfit'&&item.dataset.lcValue===prefs.outfit);
   for(const art of [host.querySelector('#puppet .labubu-colored-art'),host.querySelector('#puppet foreignObject')].filter(Boolean)){
    if(dressed)art.setAttribute('mask','url(#lc-dressed-body)');else art.removeAttribute('mask');
   }
  },
  animate(wave){for(const sleeve of sleeveNodes){const sign=sleeve.dataset.side==='right'?-1:1;sleeve.style.transform=`translate(${sign*-wave*19}px,${wave*19}px)`;}}
 };
};
