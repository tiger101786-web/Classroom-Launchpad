(function initializeLaunchpadColt(globalObject) {
  "use strict";

  const documentObject = globalObject.document;
  const root = documentObject.getElementById("launchpadColtRoot");
  if (!root) return;

  const ASSET_URL = "assets/launchpad-colt-companion.png?v=20260830-launchpad-colt";
  const VIDEO_ASSETS = {
    idle: "assets/launchpad-colt-idle.webm?v=20260830-colt-video-poses",
    welcome: "assets/launchpad-colt-welcome.webm?v=20260830-welcome-alpha-v1",
    sleeping: "assets/launchpad-colt-sleeping.webm?v=20260830-sleeping-alpha-v2",
    pointing: "assets/launchpad-colt-pointing-transparent.webm?v=20260830-pointing-alpha-v7"
  };
  const POSE_ASSETS = {
    greeting: "assets/launchpad-colt-greeting.png?v=20260830-colt-poses",
    excited: "assets/launchpad-colt-excited.png?v=20260830-colt-poses",
    dancing: "assets/launchpad-colt-dancing.png?v=20260830-colt-poses"
  };
  const HIDDEN_SCREENS = new Set(["pin", "login", "coltRun", "dashboard", "edit", "changePin"]);
  const REACTIONS = {
    welcome: { icon: "✓", text: "Welcome back! Ready to launch?" },
    directions: { icon: "☝", text: "Today's directions are ready." },
    message: { icon: "✉", text: "You have a new private message!" },
    corner: { icon: "💬", text: "There's something new in Colt Corner." },
    radio: { icon: "♫", text: "Colt Radio is ready. Pick your focus music!" },
    classroom: { icon: "▤", text: "Google Classroom is opening." },
    explore: { icon: "➜", text: "Great choice—let's explore!" },
    move: { icon: "✓", text: "This is my new spot!" },
    success: { icon: "✓", text: "Nice work!" },
    sleep: { icon: "Zz", text: "" }
  };
  const SIZE_LABELS = {
    small: "Small",
    medium: "Medium",
    large: "Large",
    "extra-large": "Extra Large"
  };

  let session = { authenticated: false, role: "guest", email: "" };
  let screen = documentObject.body.dataset.screen || "home";
  let globallyEnabled = true;
  let reactionTimer = 0;
  let sleepTimer = 0;
  let panelObserver = null;
  let currentState = "idle";
  let controlsOpen = false;
  let prefs = { minimized: false, motion: true, hidden: false, position: null, size: "medium" };
  let dragSession = null;
  let suppressCharacterClick = false;

  root.innerHTML = `
    <aside class="launchpad-colt-companion" data-state="idle" aria-label="Launchpad Colt companion">
      <div class="launchpad-colt-speech" role="status" aria-live="polite" hidden>
        <strong>Launchpad Colt</strong>
        <span></span>
      </div>
      <button class="launchpad-colt-character" type="button" aria-label="Open Launchpad Colt controls. Drag to move him." title="Drag Launchpad Colt to move him" aria-expanded="false">
        <span class="launchpad-colt-prop" aria-hidden="true"></span>
        <video class="launchpad-colt-pose" data-pose="idle" src="${VIDEO_ASSETS.idle}" poster="${ASSET_URL}" autoplay muted loop playsinline preload="auto" disablepictureinpicture aria-hidden="true"></video>
        <video class="launchpad-colt-pose" data-pose="welcome" src="${VIDEO_ASSETS.welcome}" autoplay muted loop playsinline preload="auto" disablepictureinpicture aria-hidden="true"></video>
        <img class="launchpad-colt-pose" data-pose="greeting" src="${POSE_ASSETS.greeting}" alt="" aria-hidden="true" draggable="false">
        <video class="launchpad-colt-pose" data-pose="pointing" src="${VIDEO_ASSETS.pointing}" autoplay muted loop playsinline preload="auto" disablepictureinpicture aria-hidden="true"></video>
        <img class="launchpad-colt-pose" data-pose="excited" src="${POSE_ASSETS.excited}" alt="" aria-hidden="true" draggable="false">
        <img class="launchpad-colt-pose" data-pose="dancing" src="${POSE_ASSETS.dancing}" alt="" aria-hidden="true" draggable="false">
        <video class="launchpad-colt-pose" data-pose="sleeping" src="${VIDEO_ASSETS.sleeping}" autoplay muted loop playsinline preload="auto" disablepictureinpicture aria-hidden="true"></video>
        <span class="launchpad-colt-spark" aria-hidden="true">✦</span>
      </button>
      <div class="launchpad-colt-controls" aria-label="Launchpad Colt controls" hidden>
        <button type="button" data-colt-control="minimize">Minimize</button>
        <button type="button" data-colt-control="motion">Pause motion</button>
        <button type="button" data-colt-control="size">Size: Medium</button>
        <button type="button" data-colt-control="sleep">Put Colt to Sleep</button>
        <button type="button" data-colt-control="reset-position">Reset position</button>
        <button type="button" data-colt-control="hide">Hide Colt</button>
      </div>
    </aside>
    <button class="launchpad-colt-restore" type="button" aria-label="Show Launchpad Colt" title="Show Launchpad Colt" hidden>
      <img src="${ASSET_URL}" alt="">
    </button>
  `;

  const companion = root.querySelector(".launchpad-colt-companion");
  const characterButton = root.querySelector(".launchpad-colt-character");
  const speech = root.querySelector(".launchpad-colt-speech");
  const speechText = speech.querySelector("span");
  const prop = root.querySelector(".launchpad-colt-prop");
  const controls = root.querySelector(".launchpad-colt-controls");
  const restoreButton = root.querySelector(".launchpad-colt-restore");
  const minimizeButton = controls.querySelector('[data-colt-control="minimize"]');
  const motionButton = controls.querySelector('[data-colt-control="motion"]');
  const sizeButton = controls.querySelector('[data-colt-control="size"]');
  const poseVideos = Array.from(root.querySelectorAll("video.launchpad-colt-pose"));

  function syncPoseVideos(state = currentState, restart = false) {
    const poseByState = {
      idle: "idle",
      welcome: "welcome",
      directions: "pointing",
      explore: "pointing",
      move: "pointing",
      sleep: "sleeping"
    };
    const activePose = poseByState[state] || "";
    poseVideos.forEach(video => {
      const active = prefs.motion && video.dataset.pose === activePose;
      if (!active) {
        video.pause();
        return;
      }
      if (restart) {
        try { video.currentTime = 0; } catch {}
      }
      video.play().catch(() => {});
    });
  }

  function preferenceKey() {
    const account = session.email || session.role || "guest";
    return `classroomLaunchpadColtPrefsV1:${account}`;
  }

  function loadPreferences() {
    try {
      const stored = JSON.parse(globalObject.localStorage.getItem(preferenceKey()) || "{}");
      prefs = {
        minimized: Boolean(stored.minimized),
        motion: stored.motion !== false,
        hidden: Boolean(stored.hidden),
        position: stored.position && Number.isFinite(stored.position.x) && Number.isFinite(stored.position.y)
          ? { x: stored.position.x, y: stored.position.y }
          : null,
        size: Object.hasOwn(SIZE_LABELS, stored.size) ? stored.size : "medium"
      };
    } catch {
      prefs = { minimized: false, motion: true, hidden: false, position: null, size: "medium" };
    }
    applyPreferences();
  }

  function savePreferences() {
    try {
      globalObject.localStorage.setItem(preferenceKey(), JSON.stringify(prefs));
    } catch {}
  }

  function applyPreferences() {
    root.classList.toggle("is-minimized", prefs.minimized);
    root.classList.toggle("is-motion-paused", !prefs.motion);
    root.dataset.size = prefs.size;
    companion.hidden = prefs.hidden;
    restoreButton.hidden = !prefs.hidden;
    minimizeButton.textContent = prefs.minimized ? "Make larger" : "Minimize";
    motionButton.textContent = prefs.motion ? "Pause motion" : "Resume motion";
    sizeButton.textContent = `Size: ${SIZE_LABELS[prefs.size]}`;
    applySavedPosition();
    if (prefs.hidden) closeControls();
    syncPoseVideos();
  }

  function clampPosition(x, y) {
    const width = root.offsetWidth || (prefs.minimized || globalObject.innerWidth < 1120 ? 68 : 154);
    const height = root.offsetHeight || (prefs.minimized || globalObject.innerWidth < 1120 ? 68 : 154);
    return {
      x: Math.max(6, Math.min(globalObject.innerWidth - width - 6, Number(x) || 6)),
      y: Math.max(6, Math.min(globalObject.innerHeight - height - 6, Number(y) || 6))
    };
  }

  function applySavedPosition() {
    if (!prefs.position) {
      root.classList.remove("is-user-positioned");
      root.style.removeProperty("left");
      root.style.removeProperty("top");
      return;
    }
    const next = clampPosition(prefs.position.x, prefs.position.y);
    prefs.position = next;
    root.classList.add("is-user-positioned");
    root.style.left = `${next.x}px`;
    root.style.top = `${next.y}px`;
  }

  function closeControls() {
    controlsOpen = false;
    controls.hidden = true;
    characterButton.setAttribute("aria-expanded", "false");
  }

  function shouldShow() {
    return globallyEnabled && session.authenticated && !HIDDEN_SCREENS.has(screen);
  }

  function syncVisibility() {
    root.hidden = !shouldShow();
    if (root.hidden) closeControls();
    else applySavedPosition();
    syncPanelCollision();
  }

  function react(name, customText, duration = 4200) {
    if (!shouldShow() || prefs.hidden || root.classList.contains("is-panel-open")) return;
    const reaction = REACTIONS[name] || REACTIONS.success;
    globalObject.clearTimeout(reactionTimer);
    currentState = name;
    companion.dataset.state = name;
    prop.textContent = reaction.icon;
    speechText.textContent = typeof customText === "string" ? customText : reaction.text;
    speech.hidden = !speechText.textContent;
    syncPoseVideos(name, true);
    if (duration > 0) {
      reactionTimer = globalObject.setTimeout(() => {
        currentState = "idle";
        companion.dataset.state = "idle";
        prop.textContent = "";
        speech.hidden = true;
        syncPoseVideos("idle", true);
      }, duration);
    }
  }

  function resetSleepTimer() {
    globalObject.clearTimeout(sleepTimer);
    if (currentState === "sleep") react("welcome", "I'm awake—what are we doing next?", 2600);
    sleepTimer = globalObject.setTimeout(() => {
      if (!controlsOpen) react("sleep", "", 0);
    }, 60000);
  }

  function openPanels() {
    return [
      documentObject.querySelector(".colt-radio-panel"),
      documentObject.querySelector(".colt-assistant-panel")
    ].filter(panel => panel && !panel.hidden);
  }

  function syncPanelCollision() {
    const blocked = openPanels().length > 0;
    root.classList.toggle("is-panel-open", blocked);
    if (blocked) {
      speech.hidden = true;
      closeControls();
    }
  }

  function watchPanels() {
    if (panelObserver) panelObserver.disconnect();
    panelObserver = new MutationObserver(syncPanelCollision);
    [documentObject.querySelector(".colt-radio-panel"), documentObject.querySelector(".colt-assistant-panel")]
      .filter(Boolean)
      .forEach(panel => panelObserver.observe(panel, { attributes: true, attributeFilter: ["hidden"] }));
    syncPanelCollision();
  }

  function noticeNewActivity() {
    const messageBadge = documentObject.querySelector(".header-message-badge, .direct-message-notification");
    const cornerBadge = documentObject.querySelector(".colt-corner-topic-bell b");
    if (messageBadge) {
      const marker = `launchpadColtMessageNotice:${session.email}:${messageBadge.textContent.trim()}`;
      if (!globalObject.sessionStorage.getItem(marker)) {
        globalObject.sessionStorage.setItem(marker, "1");
        react("message");
      }
    } else if (cornerBadge) {
      const marker = `launchpadColtCornerNotice:${session.email}:${cornerBadge.textContent.trim()}`;
      if (!globalObject.sessionStorage.getItem(marker)) {
        globalObject.sessionStorage.setItem(marker, "1");
        react("corner");
      }
    }
  }

  function injectTeacherSetting() {
    const grid = documentObject.querySelector(".dashboard-settings-grid");
    if (!grid || session.role !== "teacher" || grid.querySelector(".launchpad-colt-setting-card")) return;
    const card = documentObject.createElement("section");
    card.className = "form-card dashboard-setting-card launchpad-colt-setting-card";
    card.innerHTML = `
      <span class="feature-kicker">Student Companion</span>
      <h3>Launchpad Colt</h3>
      <p class="instruction">Show or hide the privacy-safe reactive colt for all signed-in students.</p>
      <label class="launchpad-colt-setting-toggle">
        <input type="checkbox" ${globallyEnabled ? "checked" : ""}>
        <span>${globallyEnabled ? "Enabled for students" : "Hidden from students"}</span>
      </label>
      <small class="launchpad-colt-setting-status" aria-live="polite"></small>
    `;
    const checkbox = card.querySelector("input");
    const label = card.querySelector(".launchpad-colt-setting-toggle span");
    const status = card.querySelector(".launchpad-colt-setting-status");
    checkbox.addEventListener("change", async () => {
      checkbox.disabled = true;
      status.textContent = "Saving…";
      try {
        const response = await fetch("/api/launchpad-colt/config", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled: checkbox.checked })
        });
        if (!response.ok) throw new Error("Could not save the setting.");
        globallyEnabled = checkbox.checked;
        label.textContent = globallyEnabled ? "Enabled for students" : "Hidden from students";
        status.textContent = "Saved";
        syncVisibility();
      } catch (error) {
        checkbox.checked = globallyEnabled;
        status.textContent = error.message;
      } finally {
        checkbox.disabled = false;
      }
    });
    grid.append(card);
  }

  characterButton.addEventListener("pointerdown", event => {
    if (event.button !== 0) return;
    event.preventDefault();
    const rect = root.getBoundingClientRect();
    dragSession = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      rootX: rect.left,
      rootY: rect.top,
      moved: false
    };
    characterButton.setPointerCapture(event.pointerId);
  });

  characterButton.addEventListener("pointermove", event => {
    if (!dragSession || dragSession.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - dragSession.startX;
    const deltaY = event.clientY - dragSession.startY;
    if (!dragSession.moved && Math.hypot(deltaX, deltaY) < 6) return;
    dragSession.moved = true;
    root.classList.add("is-dragging", "is-user-positioned");
    closeControls();
    speech.hidden = true;
    const next = clampPosition(dragSession.rootX + deltaX, dragSession.rootY + deltaY);
    root.style.left = `${next.x}px`;
    root.style.top = `${next.y}px`;
    prefs.position = next;
  });

  function finishDrag(event) {
    if (!dragSession || dragSession.pointerId !== event.pointerId) return;
    if (dragSession.moved) {
      suppressCharacterClick = true;
      savePreferences();
      globalObject.setTimeout(() => { suppressCharacterClick = false; }, 0);
      react("move", "This is my new spot!", 2300);
    }
    root.classList.remove("is-dragging");
    dragSession = null;
  }

  characterButton.addEventListener("pointerup", finishDrag);
  characterButton.addEventListener("pointercancel", finishDrag);
  characterButton.addEventListener("dragstart", event => event.preventDefault());

  characterButton.addEventListener("click", () => {
    if (suppressCharacterClick) return;
    if (prefs.minimized) {
      prefs.minimized = false;
      savePreferences();
      applyPreferences();
      react("welcome", "Launchpad Colt is back!", 2200);
      return;
    }
    controlsOpen = !controlsOpen;
    controls.hidden = !controlsOpen;
    characterButton.setAttribute("aria-expanded", String(controlsOpen));
    speech.hidden = true;
  });

  controls.addEventListener("click", event => {
    const button = event.target.closest("[data-colt-control]");
    if (!button) return;
    const action = button.dataset.coltControl;
    if (action === "sleep") {
      closeControls();
      react("sleep", "", 0);
      return;
    }
    if (action === "minimize") prefs.minimized = !prefs.minimized;
    if (action === "motion") prefs.motion = !prefs.motion;
    if (action === "size") {
      const sizes = ["small", "medium", "large", "extra-large"];
      prefs.size = sizes[(sizes.indexOf(prefs.size) + 1) % sizes.length];
    }
    if (action === "reset-position") prefs.position = null;
    if (action === "hide") prefs.hidden = true;
    savePreferences();
    applyPreferences();
  });

  restoreButton.addEventListener("click", () => {
    prefs.hidden = false;
    prefs.minimized = false;
    savePreferences();
    applyPreferences();
    react("welcome", "Welcome back!", 2400);
  });

  documentObject.addEventListener("click", event => {
    const target = event.target.closest("[data-action], .colt-radio-play");
    if (!target) return;
    const action = target.dataset.action || "";
    if (target.matches(".colt-radio-play")) react("radio");
    else if (action === "openMessages") react("message", "Opening your private messages.");
    else if (action === "openColtCorner") react("corner", "Let's check Colt Corner.");
    else if (action === "openGoogleApp" && /classroom\.google\.com/i.test(target.dataset.url || "")) react("classroom");
    else if (action === "randomActivity") react("explore", "Let's find something new!");
    else if (action === "category") react("explore", "Choose a teacher-approved website.");
    else if (action === "homeNavigate" && target.dataset.target === "home-launch") react("directions");
  }, true);

  ["pointerdown", "keydown", "scroll"].forEach(eventName => {
    globalObject.addEventListener(eventName, resetSleepTimer, { passive: true });
  });
  globalObject.addEventListener("resize", () => {
    root.classList.toggle("is-auto-compact", globalObject.innerWidth < 1120);
    applySavedPosition();
  });
  globalObject.addEventListener("colt-radio-opened", syncPanelCollision);
  globalObject.addEventListener("colt-assistant-opened", syncPanelCollision);
  globalObject.addEventListener("classroom-launchpad-rendered", event => {
    screen = event.detail && event.detail.screen ? event.detail.screen : (documentObject.body.dataset.screen || screen);
    const nextAuth = event.detail && event.detail.auth ? event.detail.auth : session;
    const becameAuthenticated = !session.authenticated && Boolean(nextAuth.authenticated);
    const accountChanged = (nextAuth.email || nextAuth.role) !== (session.email || session.role);
    session = { ...session, ...nextAuth };
    if (accountChanged) loadPreferences();
    syncVisibility();
    injectTeacherSetting();
    if (becameAuthenticated && shouldShow()) {
      const marker = `launchpadColtWelcome:${session.email || session.role}`;
      if (!globalObject.sessionStorage.getItem(marker)) {
        globalObject.sessionStorage.setItem(marker, "1");
        globalObject.setTimeout(() => react("welcome"), 120);
      }
    }
    globalObject.setTimeout(() => {
      watchPanels();
      noticeNewActivity();
    }, 0);
  });

  async function start() {
    try {
      const response = await fetch("/api/state", { headers: { Accept: "application/json" } });
      if (response.ok) {
        const state = await response.json();
        session = { ...session, ...(state.auth || {}) };
        globallyEnabled = !state.launchpadColt || state.launchpadColt.enabled !== false;
      }
    } catch {}
    screen = documentObject.body.dataset.screen || screen;
    loadPreferences();
    root.classList.toggle("is-auto-compact", globalObject.innerWidth < 1120);
    syncVisibility();
    watchPanels();
    injectTeacherSetting();
    resetSleepTimer();
    if (shouldShow()) {
      const marker = `launchpadColtWelcome:${session.email || session.role}`;
      if (!globalObject.sessionStorage.getItem(marker)) {
        globalObject.sessionStorage.setItem(marker, "1");
        globalObject.setTimeout(() => react("welcome"), 550);
      }
      noticeNewActivity();
    }
  }

  start();
})(window);
