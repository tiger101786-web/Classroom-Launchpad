(function initializeLaunchpadColt(globalObject) {
  "use strict";

  const documentObject = globalObject.document;
  const root = documentObject.getElementById("launchpadColtRoot");
  if (!root) return;

  const ASSET_URL = "assets/launchpad-colt-companion.png?v=20260830-launchpad-colt";
  const VIDEO_ASSETS = {
    idle: "assets/launchpad-colt-idle.webm?v=20260830-colt-video-poses",
    welcome: "assets/launchpad-colt-welcome.webm?v=20260830-welcome-alpha-v1",
    sleeping: "assets/launchpad-colt-sleeping.webm?v=20260903-sleeping-alpha-v3",
    pointing: "assets/launchpad-colt-pointing-transparent.webm?v=20260830-pointing-alpha-v7",
    radioDance: "assets/launchpad-colt-radio-dance.webm?v=20260903-radio-dance-optimized-v2",
    radioDanceAlternate: "assets/launchpad-colt-radio-dance-alternate.webm?v=20260903-radio-dance-optimized-v2",
    greetingExcited: "assets/launchpad-colt-greeting-excited.webm?v=20260831-greeting-excited-alpha-v1",
    feeding: "assets/launchpad-colt-feeding.webm?v=20260901-feeding-alpha-v1",
    petting: "assets/launchpad-colt-petting.webm?v=20260901-petting-alpha-v1"
  };
  const HIDDEN_SCREENS = new Set(["pin", "login", "coltRun", "dashboard", "edit", "changePin"]);
  const WELCOME_REACTION_DURATION_MS = 10_100;
  const GREETING_EXCITED_REACTION_DURATION_MS = 6_100;
  const FEEDING_REACTION_DURATION_MS = 6_200;
  const PETTING_REACTION_DURATION_MS = 6_200;
  const RADIO_MESSAGE_DURATION_MS = 4_200;
  const RADIO_DANCE_READY_TIMEOUT_MS = 2_500;
  const RADIO_DANCE_STALL_TIMEOUT_MS = 1_400;
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
    feeding: { icon: "", text: "Snack time!" },
    petting: { icon: "", text: "That feels nice!" },
    sleep: { icon: "", text: "" }
  };
  const SIZE_LABELS = {
    small: "Small",
    medium: "Medium",
    large: "Large",
    "extra-large": "Extra Large"
  };
  const DEFAULT_CUSTOMIZATION = Object.freeze({ name: "Colt" });

  let session = { authenticated: false, role: "guest", email: "" };
  let screen = documentObject.body.dataset.screen || "home";
  let globallyEnabled = true;
  let reactionTimer = 0;
  let speechTimer = 0;
  let sleepTimer = 0;
  let panelObserver = null;
  let currentState = "idle";
  let radioPlaybackActive = false;
  let activeRadioDancePose = "radioDance";
  let radioDanceSwitchToken = 0;
  let radioDanceRecoveryTimer = 0;
  let controlsOpen = false;
  let customizationRevision = 0;
  let prefs = {
    minimized: false,
    motion: true,
    hidden: false,
    position: null,
    size: "medium",
    asleep: false,
    coltName: DEFAULT_CUSTOMIZATION.name
  };
  let customizationDraft = { ...DEFAULT_CUSTOMIZATION };
  let dragSession = null;
  let suppressCharacterClick = false;

  root.innerHTML = `
    <aside class="launchpad-colt-companion" data-state="idle" aria-label="Launchpad Colt companion">
      <div class="launchpad-colt-speech" role="status" aria-live="polite" hidden>
        <strong>Colt</strong>
        <span></span>
      </div>
      <button class="launchpad-colt-character" type="button" aria-label="Open Launchpad Colt controls. Drag to move him." title="Drag Launchpad Colt to move him" aria-expanded="false">
        <span class="launchpad-colt-prop" aria-hidden="true"></span>
        <video class="launchpad-colt-pose" data-pose="idle" src="${VIDEO_ASSETS.idle}" poster="${ASSET_URL}" autoplay muted loop playsinline preload="auto" disablepictureinpicture aria-hidden="true"></video>
        <video class="launchpad-colt-pose" data-pose="welcome" src="${VIDEO_ASSETS.welcome}" autoplay muted loop playsinline preload="auto" disablepictureinpicture aria-hidden="true"></video>
        <video class="launchpad-colt-pose" data-pose="greetingExcited" src="${VIDEO_ASSETS.greetingExcited}" autoplay muted loop playsinline preload="auto" disablepictureinpicture aria-hidden="true"></video>
        <video class="launchpad-colt-pose" data-pose="pointing" src="${VIDEO_ASSETS.pointing}" autoplay muted loop playsinline preload="auto" disablepictureinpicture aria-hidden="true"></video>
        <video class="launchpad-colt-pose" data-pose="radioDance" src="${VIDEO_ASSETS.radioDance}" autoplay muted playsinline preload="auto" disablepictureinpicture aria-hidden="true"></video>
        <video class="launchpad-colt-pose" data-pose="radioDanceAlternate" src="${VIDEO_ASSETS.radioDanceAlternate}" autoplay muted playsinline preload="auto" disablepictureinpicture aria-hidden="true"></video>
        <video class="launchpad-colt-pose" data-pose="feeding" src="${VIDEO_ASSETS.feeding}" autoplay muted playsinline preload="auto" disablepictureinpicture aria-hidden="true"></video>
        <video class="launchpad-colt-pose" data-pose="petting" src="${VIDEO_ASSETS.petting}" autoplay muted playsinline preload="auto" disablepictureinpicture aria-hidden="true"></video>
        <video class="launchpad-colt-pose" data-pose="sleeping" src="${VIDEO_ASSETS.sleeping}" autoplay muted loop playsinline preload="auto" disablepictureinpicture aria-hidden="true"></video>
        <span class="launchpad-colt-spark" aria-hidden="true">✦</span>
        <span class="launchpad-colt-nameplate" aria-hidden="true"><strong>Colt</strong></span>
      </button>
      <div class="launchpad-colt-controls" aria-label="Launchpad Colt controls" hidden>
        <button type="button" data-colt-control="minimize">Minimize</button>
        <button type="button" data-colt-control="motion">Pause motion</button>
        <button type="button" data-colt-control="size">Size: Medium</button>
        <button type="button" data-colt-control="feed">Feed Me</button>
        <button type="button" data-colt-control="pet">Pet Me</button>
        <button type="button" data-colt-control="customize">Name Your Colt</button>
        <button type="button" data-colt-control="sleep">Put Colt to Sleep</button>
        <button type="button" data-colt-control="reset-position">Reset position</button>
        <button type="button" data-colt-control="hide">Hide Colt</button>
      </div>
    </aside>
    <button class="launchpad-colt-restore" type="button" aria-label="Show Launchpad Colt" title="Show Launchpad Colt" hidden>
      <img src="${ASSET_URL}" alt="">
    </button>
  `;

  const customizer = documentObject.createElement("section");
  customizer.className = "launchpad-colt-customizer";
  customizer.hidden = true;
  customizer.setAttribute("aria-label", "Name your Colt");
  customizer.innerHTML = `
    <header>
      <div><span>Personal Companion</span><h2>Name Your Colt</h2></div>
      <button type="button" class="launchpad-colt-customizer-close" data-colt-customizer="close" aria-label="Close Colt naming panel">×</button>
    </header>
    <div class="launchpad-colt-name-editor">
      <label for="launchpadColtName">Colt name</label>
      <div>
        <input id="launchpadColtName" maxlength="16" autocomplete="off" spellcheck="false" aria-describedby="launchpadColtNameHint">
        <button type="button" data-colt-customizer="save-name">Save Name</button>
      </div>
      <small id="launchpadColtNameHint">Use 2–16 school-appropriate letters or numbers. Your Colt's new name appears on his signature nameplate.</small>
    </div>
    <div class="launchpad-colt-nameplate-preview" aria-hidden="true"><strong>Colt</strong></div>
    <p class="launchpad-colt-customizer-status" role="status" aria-live="polite"></p>
    <footer>
      <button type="button" data-colt-customizer="restore">Use Default Name</button>
    </footer>
  `;
  documentObject.body.append(customizer);

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
  const feedButton = controls.querySelector('[data-colt-control="feed"]');
  const petButton = controls.querySelector('[data-colt-control="pet"]');
  const sleepButton = controls.querySelector('[data-colt-control="sleep"]');
  const customizeButton = controls.querySelector('[data-colt-control="customize"]');
  const nameplate = root.querySelector(".launchpad-colt-nameplate strong");
  const nameplatePreview = customizer.querySelector(".launchpad-colt-nameplate-preview strong");
  const customizerName = customizer.querySelector("#launchpadColtName");
  const customizerStatus = customizer.querySelector(".launchpad-colt-customizer-status");
  const feedingVideo = root.querySelector('video[data-pose="feeding"]');
  const pettingVideo = root.querySelector('video[data-pose="petting"]');
  const poseVideos = Array.from(root.querySelectorAll("video.launchpad-colt-pose"));
  const radioDanceVideos = poseVideos.filter(video => video.dataset.pose === "radioDance" || video.dataset.pose === "radioDanceAlternate");

  function syncPoseVideos(state = currentState, restart = false) {
    if (state !== "radio") globalObject.clearTimeout(radioDanceRecoveryTimer);
    const poseByState = {
      idle: "idle",
      welcome: "welcome",
      directions: "pointing",
      explore: "pointing",
      move: "pointing",
      message: "greetingExcited",
      corner: "greetingExcited",
      success: "greetingExcited",
      classroom: "greetingExcited",
      radio: activeRadioDancePose,
      feeding: "feeding",
      petting: "petting",
      sleep: "sleeping"
    };
    const activePose = poseByState[state] || "";
    poseVideos.forEach(video => {
      const active = prefs.motion && video.dataset.pose === activePose;
      video.dataset.active = String(active);
      if (!active) {
        video.pause();
        return;
      }
      if (restart) {
        try { video.currentTime = 0; } catch {}
      }
      video.play().catch(() => {
        if (state === "radio" && radioPlaybackActive) recoverStalledRadioDance(video);
      });
    });
  }

  function warmRadioDanceVideos() {
    radioDanceVideos.forEach(video => {
      video.preload = "auto";
      if (video.networkState === globalObject.HTMLMediaElement.NETWORK_EMPTY) video.load();
    });
  }

  function switchRadioDanceWhenReady(nextPose, fallbackPose) {
    const target = radioDanceVideos.find(video => video.dataset.pose === nextPose);
    if (!target || !radioPlaybackActive || currentState !== "radio") return;
    const token = ++radioDanceSwitchToken;
    let settled = false;
    const activate = () => {
      if (settled || token !== radioDanceSwitchToken || !radioPlaybackActive || currentState !== "radio") return;
      settled = true;
      globalObject.clearTimeout(radioDanceRecoveryTimer);
      activeRadioDancePose = nextPose;
      syncPoseVideos("radio", true);
    };
    if (target.readyState >= globalObject.HTMLMediaElement.HAVE_FUTURE_DATA) {
      activate();
      return;
    }
    target.addEventListener("canplay", activate, { once: true });
    target.load();
    globalObject.clearTimeout(radioDanceRecoveryTimer);
    radioDanceRecoveryTimer = globalObject.setTimeout(() => {
      if (settled || token !== radioDanceSwitchToken || !radioPlaybackActive || currentState !== "radio") return;
      settled = true;
      activeRadioDancePose = fallbackPose;
      syncPoseVideos("radio", true);
    }, RADIO_DANCE_READY_TIMEOUT_MS);
  }

  function recoverStalledRadioDance(video) {
    if (!radioPlaybackActive || currentState !== "radio" || video.dataset.pose !== activeRadioDancePose) return;
    globalObject.clearTimeout(radioDanceRecoveryTimer);
    radioDanceRecoveryTimer = globalObject.setTimeout(() => {
      if (!radioPlaybackActive || currentState !== "radio" || video.dataset.pose !== activeRadioDancePose) return;
      if (!video.paused && video.readyState >= globalObject.HTMLMediaElement.HAVE_FUTURE_DATA) return;
      const fallbackPose = video.dataset.pose === "radioDance" ? "radioDanceAlternate" : "radioDance";
      switchRadioDanceWhenReady(fallbackPose, video.dataset.pose);
    }, RADIO_DANCE_STALL_TIMEOUT_MS);
  }

  function preferenceKey() {
    const account = session.email || session.role || "guest";
    return `classroomLaunchpadColtPrefsV1:${account}`;
  }

  function normalizeCustomization(value) {
    const source = value && typeof value === "object" ? value : {};
    const enteredName = String(source.name || source.coltName || "").trim().replace(/\s+/g, " ").slice(0, 16);
    const name = enteredName.toLowerCase() === "launchpad colt" ? DEFAULT_CUSTOMIZATION.name : enteredName;
    return { name: name || DEFAULT_CUSTOMIZATION.name };
  }

  function defaultPreferences() {
    return {
      minimized: false,
      motion: true,
      hidden: false,
      position: null,
      size: "medium",
      asleep: false,
      coltName: DEFAULT_CUSTOMIZATION.name
    };
  }

  function applyCustomization(value = prefs) {
    const customization = normalizeCustomization(value);
    nameplate.textContent = customization.name;
    nameplatePreview.textContent = customization.name;
    speech.querySelector("strong").textContent = customization.name;
    companion.setAttribute("aria-label", `${customization.name}, Launchpad Colt companion`);
    characterButton.setAttribute("aria-label", `Open ${customization.name} controls. Drag to move the Colt.`);
  }

  function applyRemoteCustomization(value) {
    const customization = normalizeCustomization(value);
    prefs.coltName = customization.name;
    savePreferences();
    applyPreferences();
  }

  async function loadRemoteCustomization() {
    if (!session.authenticated) return;
    const revision = customizationRevision;
    try {
      const response = await fetch("/api/launchpad-colt/customization", { headers: { Accept: "application/json" } });
      if (!response.ok) return;
      const result = await response.json();
      if (revision !== customizationRevision || !customizer.hidden) return;
      applyRemoteCustomization(result.customization);
    } catch {}
  }

  function showSleepingState(restart = false) {
    globalObject.clearTimeout(reactionTimer);
    globalObject.clearTimeout(speechTimer);
    currentState = "sleep";
    root.classList.remove("is-radio-dancing");
    companion.dataset.state = "sleep";
    prop.textContent = REACTIONS.sleep.icon;
    speechText.textContent = "";
    speech.hidden = true;
    syncPoseVideos("sleep", restart);
  }

  function loadPreferences() {
    try {
      const stored = JSON.parse(globalObject.localStorage.getItem(preferenceKey()) || "{}");
      const customization = normalizeCustomization(stored);
      prefs = {
        minimized: Boolean(stored.minimized),
        motion: stored.motion !== false,
        hidden: Boolean(stored.hidden),
        position: stored.position && Number.isFinite(stored.position.x) && Number.isFinite(stored.position.y)
          ? { x: stored.position.x, y: stored.position.y }
          : null,
        size: Object.hasOwn(SIZE_LABELS, stored.size) ? stored.size : "medium",
        asleep: Boolean(stored.asleep),
        coltName: customization.name
      };
    } catch {
      prefs = defaultPreferences();
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
    feedButton.disabled = prefs.asleep;
    feedButton.title = prefs.asleep ? "Wake the Colt before feeding him" : "Play the feeding animation";
    petButton.disabled = prefs.asleep;
    petButton.title = prefs.asleep ? "Wake the Colt before petting him" : "Play the petting animation";
    sleepButton.textContent = prefs.asleep ? "Wake Colt Up" : "Put Colt to Sleep";
    applyCustomization();
    applySavedPosition();
    if (prefs.hidden) closeControls();
    if (prefs.asleep) showSleepingState();
    else syncPoseVideos();
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

  function renderCustomizationDraft() {
    const customization = normalizeCustomization(customizationDraft);
    customizerName.value = customization.name;
    applyCustomization(customization);
  }

  function openCustomizer() {
    customizationRevision += 1;
    customizationDraft = normalizeCustomization(prefs);
    customizerStatus.textContent = "";
    renderCustomizationDraft();
    customizer.hidden = false;
    root.classList.add("is-customizing");
    closeControls();
    globalObject.setTimeout(() => customizerName.focus(), 0);
  }

  function closeCustomizer({ restorePreview = true } = {}) {
    customizer.hidden = true;
    root.classList.remove("is-customizing");
    if (restorePreview) applyCustomization();
  }

  async function saveCustomization(successMessage) {
    const customization = normalizeCustomization({ name: customizerName.value });
    customizationRevision += 1;
    customizerStatus.textContent = "Saving…";
    customizer.querySelectorAll("button, input").forEach(control => { control.disabled = true; });
    try {
      const response = await fetch("/api/launchpad-colt/customization", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customization)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "The Colt customization could not be saved.");
      const saved = normalizeCustomization(result.customization || customization);
      prefs.coltName = saved.name;
      customizationDraft = saved;
      savePreferences();
      applyPreferences();
      renderCustomizationDraft();
      customizerStatus.textContent = successMessage;
    } catch (error) {
      customizerStatus.textContent = error.message;
      applyCustomization(customizationDraft);
    } finally {
      customizer.querySelectorAll("button, input").forEach(control => { control.disabled = false; });
    }
  }

  function shouldShow() {
    return globallyEnabled && session.authenticated && !HIDDEN_SCREENS.has(screen);
  }

  function syncVisibility() {
    root.hidden = !shouldShow();
    if (root.hidden) {
      closeControls();
      closeCustomizer();
    }
    else applySavedPosition();
    syncPanelCollision();
  }

  function react(name, customText, duration = 4200) {
    if (!shouldShow() || prefs.hidden || (root.classList.contains("is-panel-open") && name !== "radio")) return;
    if (prefs.asleep && name !== "sleep") return;
    const reaction = REACTIONS[name] || REACTIONS.success;
    globalObject.clearTimeout(reactionTimer);
    globalObject.clearTimeout(speechTimer);
    currentState = name;
    root.classList.toggle("is-radio-dancing", name === "radio");
    companion.dataset.state = name;
    prop.textContent = reaction.icon;
    speechText.textContent = typeof customText === "string" ? customText : reaction.text;
    speech.hidden = !speechText.textContent;
    syncPoseVideos(name, true);
    const greetingExcitedState = ["success", "classroom", "message", "corner"].includes(name);
    const reactionDuration = name === "welcome"
      ? Math.max(duration, WELCOME_REACTION_DURATION_MS)
      : greetingExcitedState
        ? Math.max(duration, GREETING_EXCITED_REACTION_DURATION_MS)
        : duration;
    if (reactionDuration > 0) {
      reactionTimer = globalObject.setTimeout(() => {
        if (radioPlaybackActive && name !== "radio" && name !== "feeding" && name !== "petting") {
          react("radio", "", 0);
          return;
        }
        currentState = "idle";
        root.classList.remove("is-radio-dancing");
        companion.dataset.state = "idle";
        prop.textContent = "";
        speech.hidden = true;
        syncPoseVideos("idle", true);
      }, reactionDuration);
    }
  }

  function welcome(customText) {
    react("welcome", customText, WELCOME_REACTION_DURATION_MS);
  }

  function startRadioDance(showMessage = true) {
    radioDanceSwitchToken += 1;
    globalObject.clearTimeout(radioDanceRecoveryTimer);
    warmRadioDanceVideos();
    react("radio", showMessage ? "Now playing—enjoy the music!" : "", 0);
    if (!showMessage || prefs.asleep || currentState !== "radio") return;
    speechTimer = globalObject.setTimeout(() => {
      if (currentState !== "radio") return;
      speechText.textContent = "";
      speech.hidden = true;
    }, RADIO_MESSAGE_DURATION_MS);
  }

  function finishFeeding() {
    if (currentState !== "feeding") return;
    globalObject.clearTimeout(reactionTimer);
    currentState = "idle";
    root.classList.remove("is-radio-dancing");
    companion.dataset.state = "idle";
    prop.textContent = "";
    speech.hidden = true;
    syncPoseVideos("idle", true);
    resetSleepTimer();
  }

  function finishPetting() {
    if (currentState !== "petting") return;
    globalObject.clearTimeout(reactionTimer);
    currentState = "idle";
    root.classList.remove("is-radio-dancing");
    companion.dataset.state = "idle";
    prop.textContent = "";
    speech.hidden = true;
    syncPoseVideos("idle", true);
    resetSleepTimer();
  }

  feedingVideo.addEventListener("ended", finishFeeding);
  pettingVideo.addEventListener("ended", finishPetting);
  radioDanceVideos.forEach(video => {
      video.addEventListener("ended", () => {
        if (!radioPlaybackActive || currentState !== "radio" || prefs.asleep || !prefs.motion) return;
        const nextPose = video.dataset.pose === "radioDance" ? "radioDanceAlternate" : "radioDance";
        switchRadioDanceWhenReady(nextPose, video.dataset.pose);
      });
      video.addEventListener("waiting", () => recoverStalledRadioDance(video));
      video.addEventListener("stalled", () => recoverStalledRadioDance(video));
    });

  function resetSleepTimer() {
    globalObject.clearTimeout(sleepTimer);
    if (prefs.asleep || radioPlaybackActive) return;
    if (currentState === "sleep") welcome("I'm awake—what are we doing next?");
    sleepTimer = globalObject.setTimeout(() => {
      if (!controlsOpen) react("sleep", "", 0);
    }, 60000);
  }

  function syncPanelCollision() {
    const radioPanel = documentObject.querySelector(".colt-radio-panel");
    const assistantPanel = documentObject.querySelector(".colt-assistant-panel");
    const radioOpen = Boolean(radioPanel && !radioPanel.hidden);
    const assistantOpen = Boolean(assistantPanel && !assistantPanel.hidden);
    const blocked = assistantOpen;
    root.classList.toggle("is-panel-open", blocked);
    root.classList.toggle("is-radio-panel-open", radioOpen);
    if (blocked || radioOpen) {
      speech.hidden = true;
      closeControls();
      closeCustomizer();
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

  function beginDrag(event) {
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
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event) {
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
  }

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

  [characterButton, restoreButton].forEach(handle => {
    handle.addEventListener("pointerdown", beginDrag);
    handle.addEventListener("pointermove", moveDrag);
    handle.addEventListener("pointerup", finishDrag);
    handle.addEventListener("pointercancel", finishDrag);
    handle.addEventListener("dragstart", event => event.preventDefault());
  });

  characterButton.addEventListener("click", () => {
    if (suppressCharacterClick) return;
    if (!customizer.hidden) {
      closeCustomizer();
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
    if (action === "customize") {
      openCustomizer();
      return;
    }
    if (action === "feed") {
      if (prefs.asleep) return;
      closeControls();
      react("feeding", undefined, FEEDING_REACTION_DURATION_MS);
      return;
    }
    if (action === "pet") {
      if (prefs.asleep) return;
      closeControls();
      react("petting", undefined, PETTING_REACTION_DURATION_MS);
      return;
    }
    if (action === "sleep") {
      closeControls();
      prefs.asleep = !prefs.asleep;
      savePreferences();
      applyPreferences();
      if (prefs.asleep) {
        globalObject.clearTimeout(sleepTimer);
        showSleepingState(true);
      } else {
        resetSleepTimer();
        if (radioPlaybackActive) startRadioDance(false);
        else welcome("I'm awake—what are we doing next?");
      }
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

  customizer.addEventListener("click", event => {
    const actionButton = event.target.closest("[data-colt-customizer]");
    if (!actionButton) return;
    const action = actionButton.dataset.coltCustomizer;
    if (action === "close") {
      closeCustomizer();
      return;
    }
    if (action === "restore") {
      customizationDraft = { ...DEFAULT_CUSTOMIZATION };
      renderCustomizationDraft();
      saveCustomization("The default Colt name was restored.");
      return;
    }
    if (action === "save-name") saveCustomization("Your Colt's name was saved.");
  });

  customizerName.addEventListener("input", () => {
    customizationDraft = { ...customizationDraft, name: customizerName.value };
    customizerStatus.textContent = "Previewing—choose Save Name to keep this name.";
    applyCustomization(customizationDraft);
  });

  documentObject.addEventListener("keydown", event => {
    if (event.key === "Escape" && !customizer.hidden) closeCustomizer();
  });

  restoreButton.addEventListener("click", () => {
    if (suppressCharacterClick) return;
    prefs.hidden = false;
    prefs.minimized = false;
    savePreferences();
    applyPreferences();
    welcome("Welcome back!");
  });

  globalObject.addEventListener("colt-radio-playback", event => {
    const playing = Boolean(event.detail?.playing);
    radioPlaybackActive = playing;
    if (playing) {
      globalObject.clearTimeout(sleepTimer);
      if (!prefs.asleep) startRadioDance(true);
      return;
    }
    radioDanceSwitchToken += 1;
    globalObject.clearTimeout(radioDanceRecoveryTimer);
    root.classList.remove("is-radio-dancing");
    if (currentState === "radio") {
      globalObject.clearTimeout(reactionTimer);
      currentState = "idle";
      companion.dataset.state = "idle";
      prop.textContent = "";
      speech.hidden = true;
      syncPoseVideos("idle", true);
    }
    resetSleepTimer();
  });

  globalObject.addEventListener("colt-radio-opened", () => {
    if (radioPlaybackActive || prefs.asleep) return;
    globalObject.clearTimeout(reactionTimer);
    currentState = "idle";
    root.classList.remove("is-radio-dancing");
    companion.dataset.state = "idle";
    prop.textContent = "";
    speech.hidden = true;
    syncPoseVideos("idle", true);
  });

  documentObject.addEventListener("click", event => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action || "";
    if (action === "openMessages") react("message", "Opening your private messages.");
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
    if (accountChanged) {
      loadPreferences();
      loadRemoteCustomization();
    }
    syncVisibility();
    injectTeacherSetting();
    if (becameAuthenticated && shouldShow()) {
      const marker = `launchpadColtWelcome:${session.email || session.role}`;
      if (!globalObject.sessionStorage.getItem(marker)) {
        globalObject.sessionStorage.setItem(marker, "1");
        globalObject.setTimeout(() => welcome(), 120);
      }
    }
    globalObject.setTimeout(() => {
      watchPanels();
      noticeNewActivity();
    }, 0);
  });

  async function start() {
    let initialCustomization = null;
    try {
      const response = await fetch("/api/state", { headers: { Accept: "application/json" } });
      if (response.ok) {
        const state = await response.json();
        session = { ...session, ...(state.auth || {}) };
        globallyEnabled = !state.launchpadColt || state.launchpadColt.enabled !== false;
        initialCustomization = state.coltCustomization || null;
      }
    } catch {}
    screen = documentObject.body.dataset.screen || screen;
    loadPreferences();
    if (initialCustomization) applyRemoteCustomization(initialCustomization);
    root.classList.toggle("is-auto-compact", globalObject.innerWidth < 1120);
    syncVisibility();
    watchPanels();
    injectTeacherSetting();
    resetSleepTimer();
    if (shouldShow()) {
      const marker = `launchpadColtWelcome:${session.email || session.role}`;
      if (!globalObject.sessionStorage.getItem(marker)) {
        globalObject.sessionStorage.setItem(marker, "1");
        globalObject.setTimeout(() => welcome(), 550);
      }
      noticeNewActivity();
    }
  }

  start();
})(window);
