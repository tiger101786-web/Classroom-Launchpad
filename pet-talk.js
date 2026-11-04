/* One compact chat window. The bridge only reads existing pet state. */
window.createPetTalk = function(read) {
  'use strict';
  const panel=document.createElement('section');
  panel.className='pet-talk';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-labelledby','pet-talk-name');
  panel.innerHTML='<header><img class="pet-talk-portrait" alt=""><div><small>TALK TO PET</small><h2 id="pet-talk-name"></h2></div><button type="button" data-talk-close aria-label="Close pet chat">×</button></header><p class="pet-talk-note">Pretend pet · Built-in replies · Chats are not saved</p><div class="pet-talk-messages" role="log" aria-label="Recent conversation" aria-live="off" tabindex="0"></div><div class="pet-talk-prompts"><button type="button">Tell me a joke</button><button type="button">Ask me a question</button></div><form autocomplete="off"><label for="pet-talk-input">Your message</label><div><input id="pet-talk-input" type="text" maxlength="240" placeholder="Say hello…" autocomplete="off" autocapitalize="sentences" spellcheck="false" enterkeyhint="send"><button type="submit">Send</button></div><p class="pet-talk-status" role="status">Try a joke, a fact, or a riddle.</p></form>';
  document.body.append(panel);
  const log=panel.querySelector('.pet-talk-messages'),input=panel.querySelector('input'),status=panel.querySelector('.pet-talk-status'),portrait=panel.querySelector('img');
  let current=null,engine=null,frame=0,lastSent=-Infinity,opener=null,portraitRevision=0;
  const icons={colt:'assets/pet-studio/colt-original.png',squishy:'assets/pet-studio/squishy-gold.png',gummy:'assets/pet-studio/gummy-strawberry.png',eagle:'assets/pet-studio/eagle-bald-eagle.png',labubu:'assets/pet-studio/labubu-tan.png',roblox:'assets/pet-studio/roblox-classic.png',highland:'highland-pet/highland-art.png',saber:'saber-pet/tiger.png'};
  function append(text,from){const row=document.createElement('p');row.dataset.from=from;const label=document.createElement('strong');label.textContent=from==='pet'?current.name:'You';const message=document.createElement('span');message.textContent=text;row.append(label,message);log.append(row);while(log.children.length>24)log.firstElementChild.remove();log.scrollTop=log.scrollHeight;}
  function reply(response){append(response.text,'pet');window.PetSpeech.say(current.host,response.text);}
  function refresh(){
    const next=read();
    if(!next||!next.host?.isConnected||next.host.hidden||next.host.closest('.pet-studio')){close(false);return false;}
    const changed=current?.kind!==next.kind||current?.account!==next.account;
    current=next;panel.querySelector('h2').textContent=current.name;
    if(changed){
      window.PetSpeech.dismiss();log.replaceChildren();input.value='';engine=window.PetConversation.create(current.kind);lastSent=-Infinity;
      const revision=++portraitRevision;portrait.hidden=true;portrait.removeAttribute('src');
      portrait.onload=()=>{if(revision===portraitRevision)portrait.hidden=false};portrait.onerror=()=>portrait.hidden=true;
      if(current.kind==='nugget')window.nuggetThumbnail?.('Golden').then(src=>{if(revision===portraitRevision)portrait.src=src}).catch(()=>{});
      else if(icons[current.kind])portrait.src=icons[current.kind];
      reply(engine.start());
    }
    return true;
  }
  function place(){
    if(panel.hidden)return;
    if(!current?.host.isConnected||current.host.hidden||current.host.closest('.pet-studio')||document.querySelector('dialog[open]')){close(false);return;}
    const v=window.visualViewport,x=v?.offsetLeft||0,y=v?.offsetTop||0,w=v?.width||innerWidth,h=v?.height||innerHeight;
    panel.style.width=Math.min(340,w-20)+'px';
    const pet=current.host.querySelector('.pet-button').getBoundingClientRect();
    const belowSpace=y+h-pet.bottom-20,aboveSpace=pet.top-y-20;
    const compact=w<650;
    const dockBelow=compact&&belowSpace>=280;
    panel.style.maxHeight=Math.max(150,Math.min(h-20,dockBelow?belowSpace:compact&&aboveSpace>=240?aboveSpace:460))+'px';
    panel.dataset.compact=String(parseFloat(panel.style.maxHeight)<350);
    const box=panel.getBoundingClientRect();
    // Opposite corner on wide screens; above the pet on narrow screens. Never move the pet.
    const left=pet.left+pet.width/2>x+w/2?x+10:x+w-box.width-10;
    let top=y+Math.max(10,(h-box.height)/2);
    if(compact)top=dockBelow?pet.bottom+10:y+10;
    panel.style.left=Math.max(x+10,left)+'px';panel.style.top=Math.max(y+10,Math.min(top,y+h-box.height-10))+'px';
    frame=requestAnimationFrame(place);
  }
  function close(focus=true){cancelAnimationFrame(frame);panel.hidden=true;window.PetSpeech.dismiss();log.replaceChildren();input.value='';engine=null;current=null;++portraitRevision;portrait.removeAttribute('src');if(focus&&opener?.isConnected&&!opener.closest('[hidden]'))opener.focus();opener=null;}
  function open(){if(!panel.hidden){input.focus();return;}opener=document.activeElement;panel.hidden=false;status.textContent='Try a joke, a fact, or a riddle.';if(!refresh())return;place();input.focus({preventScroll:true});}
  function send(){
    if(panel.hidden||!refresh())return;
    const message=input.value.trim();if(!message){status.textContent='Type a message first.';return;}
    if(message.length>window.PetConversation.maxLength){status.textContent='Keep your message to 240 characters.';return;}
    const now=performance.now();if(now-lastSent<window.PetConversation.cooldown){status.textContent='One moment—then you can send another message.';return;}
    lastSent=now;const response=engine.respond(message,current.look);
    append(response.redact?'Let’s choose a safe chat topic.':message,'student');input.value='';reply(response);status.textContent='Reply ready. Click its bubble to dismiss it.';input.focus({preventScroll:true});
  }
  panel.querySelector('form').addEventListener('submit',e=>{e.preventDefault();if(!composing)send()});
  let composing=false;input.addEventListener('compositionstart',()=>composing=true);input.addEventListener('compositionend',()=>composing=false);
  panel.querySelector('[data-talk-close]').onclick=()=>close();
  panel.querySelectorAll('.pet-talk-prompts button').forEach(b=>b.onclick=()=>{input.value=b.textContent;send()});
  panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close()}});
  window.addEventListener('pagehide',()=>close(false));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)close(false)});
  return {open,close,sync(){if(!panel.hidden)refresh()}};
};
