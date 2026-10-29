const $=s=>document.querySelector(s),pet=$('#pet'),stage=$('.stage');
// Keep the front edge/nameplate alignment while adding space behind the haunches.
$('#platform').innerHTML='<image href="platform-v2.png" x="-68" y="720" width="1160" height="480" preserveAspectRatio="none"/>';
$('.nameplate').setAttribute('transform','translate(90 1180)');
$('.nameplate').innerHTML='<image href="nameplate-v2.png" x="0" y="-50" width="844" height="290" preserveAspectRatio="none"/><text id="name-text" x="422" y="92" text-anchor="middle" dominant-baseline="middle" fill="#49301d" style="font:700 73px Georgia,serif;letter-spacing:1px">Saber</text>';
$('#name').addEventListener('input',e=>{const name=e.target.value.trim()||'Saber',text=$('#name-text');text.textContent=name;text.style.fontSize=Math.min(73,580/Math.max(name.length*.62,1))+'px'});
$('#size').addEventListener('change',e=>pet.style.width=e.target.value+'px');
$('#light').addEventListener('change',e=>stage.classList.toggle('light',e.target.checked));
$('#platform-toggle').addEventListener('change',e=>$('#platform').style.display=e.target.checked?'':'none');
