window.createPetTalk = function(read) {
  'use strict';
  const panel = document.createElement('section');
  panel.className = 'pet-talk';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-labelledby', 'pet-talk-name');
  panel.innerHTML = '<header><button type="button" class="pet-talk-grip" aria-label="Move chat with arrow keys" title="Drag to move">⠿</button><h2 id="pet-talk-name"></h2><button type="button" data-history aria-label="Recent messages" aria-expanded="false">↶</button><button type="button" data-talk-close aria-label="Close pet chat">×</button></header><div class="pet-talk-messages" role="log" aria-label="Recent conversation" aria-live="off" tabindex="0" hidden></div><form autocomplete="off"><input id="pet-talk-input" aria-label="Your message" maxlength="240" placeholder="Type a message…" spellcheck="false" enterkeyhint="send"><button type="submit" aria-label="Send message" title="Send message">➤</button></form><p class="pet-talk-status" role="status" hidden></p>';
  document.body.append(panel);
  const title = panel.querySelector('h2');
  const grip = panel.querySelector('.pet-talk-grip');
  const log = panel.querySelector('.pet-talk-messages');
  const historyButton = panel.querySelector('[data-history]');
  const input = panel.querySelector('input');
  const sendButton = panel.querySelector('[type=submit]');
  const status = panel.querySelector('.pet-talk-status');
  let current, request, opener, position, drag;
  const history = [];
  const portraits = {
    colt:'assets/pet-studio/colt-original.png',
    squishy:'assets/pet-studio/squishy-gold.png',
    gummy:'assets/pet-studio/gummy-strawberry.png',
    eagle:'assets/pet-studio/eagle-bald-eagle.png',
    labubu:'assets/pet-studio/labubu-tan.png',
    roblox:'assets/pet-studio/roblox-classic.png',
    highland:'highland-pet/highland-art.png',
    saber:'saber-pet/tiger.png'
  };

  function theme() {
    panel.dataset.pet = current.kind;
    panel.style.removeProperty('--talk-portrait');
    if (portraits[current.kind]) {
      panel.style.setProperty('--talk-portrait', 'url("' + portraits[current.kind] + '")');
    } else if (current.kind === 'nugget') {
      const pet = current;
      window.nuggetThumbnail?.(pet.skin).then(url => {
        if (!panel.hidden && current?.kind === pet.kind && current.skin === pet.skin) panel.style.setProperty('--talk-portrait', 'url("' + url + '")');
      }).catch(() => {});
    }
  }

  function notice(message = '', keepPosition = true) {
    status.textContent = message;
    status.hidden = !message;
    if (!panel.hidden) place(keepPosition);
  }

  function place(keepPosition = false) {
    if (panel.hidden || !current) return;
    const viewport = window.visualViewport;
    const x = viewport?.offsetLeft || 0, y = viewport?.offsetTop || 0;
    const width = viewport?.width || innerWidth, height = viewport?.height || innerHeight;
    panel.style.width = Math.min(260, width - 16) + 'px';
    const pet = current.host.querySelector('.pet-button').getBoundingClientRect();
    // Status text can change height; retain the current anchor instead of flipping sides.
    const anchored = keepPosition === true && panel.style.top !== '';
    const left = anchored ? parseFloat(panel.style.left) : position?.left ?? pet.left + (pet.width - panel.offsetWidth) / 2;
    const top = anchored ? parseFloat(panel.style.top) : position?.top ?? (pet.bottom + panel.offsetHeight + 20 < y + height
      ? pet.bottom + 10 : pet.top - panel.offsetHeight - 120);
    panel.style.left = Math.max(x + 8, Math.min(left, x + width - panel.offsetWidth - 8)) + 'px';
    panel.style.top = Math.max(y + 8, Math.min(top, y + height - panel.offsetHeight - 8)) + 'px';
  }

  function close(focus = true) {
    if (panel.hidden) return;
    panel.hidden = true;
    request?.abort();
    request = null;
    sendButton.disabled = false;
    window.PetSpeech.dismiss();
    history.length = 0;
    log.replaceChildren();
    log.hidden = true;
    historyButton.setAttribute('aria-expanded', 'false');
    input.value = '';
    current = null;
    drag = null;
    if (focus && opener?.isConnected && !opener.closest('[hidden]')) opener.focus();
    opener = null;
  }

  function sync() {
    if (panel.hidden) return;
    const next = read();
    if (!next || next.host.hidden || next.host.closest('.pet-studio') ||
        next.kind !== current.kind || next.account !== current.account) {
      close(false);
      return;
    }
    current = next;
    title.textContent = 'Talk to ' + current.name;
  }

  function open() {
    if (!panel.hidden) return input.focus();
    current = read();
    if (!current || current.host.hidden || current.host.closest('.pet-studio')) return;
    theme();
    opener = document.activeElement;
    title.textContent = 'Talk to ' + current.name;
    panel.hidden = false;
    notice('', false);
    input.focus({preventScroll: true});
  }

  function append(role, content) {
    history.push({role, content});
    const line = document.createElement('p');
    const label = document.createElement('strong');
    label.textContent = role === 'user' ? 'You: ' : current.name + ': ';
    line.append(label, content);
    log.append(line);
    if (history.length > 8) {
      history.shift();
      log.firstElementChild.remove();
    }
    log.scrollTop = log.scrollHeight;
  }

  async function send() {
    sync();
    const prompt = input.value.trim();
    if (panel.hidden || request || !prompt) return;
    const controller = new AbortController();
    request = controller;
    sendButton.disabled = true;
    input.value = '';
    notice(current.name + ' is thinking…');
    try {
      const response = await fetch('/api/pet-talk/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({kind: current.kind, skin: current.skin, appearance: current.appearance, prompt, history}),
        signal: controller.signal
      });
      const result = await response.json();
      if (request !== controller) return;
      if (!response.ok || !result.answer) throw new Error(result.error || 'Pet AI couldn’t reply.');
      append('user', prompt);
      append('assistant', result.answer);
      notice();
      window.PetSpeech.say(current.host, result.answer);
    } catch (error) {
      if (request !== controller) return;
      if (!input.value) input.value = prompt;
      notice(error.message || 'Pet AI couldn’t reply.');
    } finally {
      if (request === controller) {
        request = null;
        sendButton.disabled = false;
      }
    }
  }

  panel.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    if (!composing) send();
  });
  let composing = false;
  input.addEventListener('compositionstart', () => composing = true);
  input.addEventListener('compositionend', () => composing = false);
  historyButton.onclick = () => {
    log.hidden = !log.hidden;
    historyButton.setAttribute('aria-expanded', String(!log.hidden));
    place();
    log.scrollTop = log.scrollHeight;
  };
  grip.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    const box = panel.getBoundingClientRect();
    drag = {id: event.pointerId, x: event.clientX - box.left, y: event.clientY - box.top};
    grip.setPointerCapture(event.pointerId);
  });
  grip.addEventListener('pointermove', event => {
    if (drag?.id !== event.pointerId) return;
    position = {left: event.clientX - drag.x, top: event.clientY - drag.y};
    place();
  });
  grip.addEventListener('lostpointercapture', () => drag = null);
  grip.addEventListener('keydown', event => {
    const delta = {ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16]}[event.key];
    if (!delta) return;
    event.preventDefault();
    const box = panel.getBoundingClientRect();
    position = {left: box.left + delta[0], top: box.top + delta[1]};
    place();
  });
  panel.querySelector('[data-talk-close]').onclick = () => close();
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      close();
    }
  });
  window.addEventListener('resize', place);
  window.visualViewport?.addEventListener('resize', place);
  window.visualViewport?.addEventListener('scroll', place);
  window.addEventListener('pagehide', () => close(false));
  return {open, close, sync};
};
