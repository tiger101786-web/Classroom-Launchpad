(() => {
  "use strict";
  const scenes = [
    { id: "original", name: "Classroom Original", description: "Mr. Nieves & Colt videos", image: "" },
    { id: "reef", name: "Coral Cove", description: "Sunlit reef & rising bubbles", image: "assets/launchpad-scene-reef.png" },
    { id: "forest", name: "Firefly Forest", description: "Twilight stream & drifting lights", image: "assets/launchpad-scene-forest.png" },
    { id: "pixel", name: "Pixel Arcade", description: "Floating clouds & glowing pixels", image: "assets/launchpad-scene-pixel.png" },
    { id: "observatory", name: "Cosmic Observatory", description: "Ringed planet & drifting stars", image: "assets/launchpad-scene-observatory.png" },
    { id: "dragon", name: "Dragon’s Library", description: "Cozy books & golden dust", image: "assets/launchpad-scene-dragon.png" },
    { id: "cabin", name: "Snowy Cabin", description: "Warm windows & falling snow", image: "assets/launchpad-scene-cabin.png" },
    { id: "neon", name: "Rainy Neon City", description: "Colorful skyline & flowing rain", image: "assets/launchpad-scene-neon.png" },
    { id: "castle", name: "Cloud Castle", description: "Floating towers & passing clouds", image: "assets/launchpad-scene-castle.png" },
    { id: "koi", name: "Moonlit Koi Pond", description: "Quiet garden & falling petals", image: "assets/launchpad-scene-koi.png" },
    { id: "crystal", name: "Crystal Cavern", description: "Glowing gems & rising sparkles", image: "assets/launchpad-scene-crystal.png" },
    { id: "pumpkin", name: "Pumpkin Patch", description: "Friendly pumpkins & autumn leaves", image: "assets/launchpad-scene-pumpkin.png" },
    { id: "volcano", name: "Volcano Island", description: "Tropical sunset & drifting embers", image: "assets/launchpad-scene-volcano.png" }
  ];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let guestMotion = true;
  const settings = session => ({
    id: session.authenticated && scenes.some(scene => scene.id === session.homeScene?.id) ? session.homeScene.id : "original",
    motion: session.authenticated ? session.homeScene?.motion !== false : guestMotion
  });
  function artwork(id, motion, video, preview = false) {
    const scene = scenes.find(item => item.id === id) || scenes[0];
    const paused = !motion || reduced.matches;
    const content = scene.image
      ? `<img class="launch-scene-image" src="${scene.image}" alt="${scene.name}" decoding="async"><span class="launch-scene-particles" aria-hidden="true">${Array.from({ length: 9 }, (_, index) => `<i style="--n:${index};--x:${9 + (index * 19) % 84}%;--y:${12 + (index * 23) % 72}%"></i>`).join("")}</span>`
      : `<video class="launch-scene-video" ${paused ? "" : "autoplay"} muted loop playsinline preload="metadata" aria-label="Mr. Nieves and Colt classroom video"><source ${preview ? "src" : "data-src"}="${video}?v=20260905-profile-optimized1" type="video/mp4"></video>`;
    return `<div class="school-photo launch-scene scene-${scene.id}${paused ? " is-paused" : ""}" data-scene="${scene.id}" data-motion="${motion}">${content}</div>`;
  }
  function render(session, video) {
    const scene = settings(session);
    return `<section class="home-feature home-scene-feature">
      ${artwork(scene.id, scene.motion, video)}
      <div class="launch-scene-controls">
        ${session.authenticated ? '<button type="button" id="chooseLaunchScene">✦ Choose scene</button>' : ""}
        <button type="button" id="toggleLaunchScene" aria-pressed="${!scene.motion}">${reduced.matches ? "Motion reduced" : scene.motion ? "Pause scene" : "Resume scene"}</button>
      </div><span id="launchSceneStatus" class="launch-scene-status" role="status"></span>
    </section>`;
  }
  async function save(value) {
    const response = await fetch("/api/home-scene", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not save your scene. Please try again.");
    return result.session;
  }
  function attach(session, video, onSave) {
    // A navigation or background refresh must not leave an orphaned dialog.
    document.querySelector(".launch-scene-dialog")?.remove();
    const toggle = document.getElementById("toggleLaunchScene");
    if (!toggle) return;
    toggle.disabled = reduced.matches;
    toggle.addEventListener("click", async () => {
      const next = settings(session);
      next.motion = !next.motion;
      toggle.disabled = true;
      const status = document.getElementById("launchSceneStatus");
      try {
        if (session.authenticated) onSave(await save(next));
        else {
          guestMotion = next.motion;
          const root = document.querySelector(".home-scene-feature");
          root.outerHTML = render(session, video);
          attach(session, video, onSave);
          const player = document.querySelector('.home-scene-feature video');
          if (player) { player.querySelector('source').src = `${video}?v=20260905-profile-optimized1`; player.load(); }
        }
      } catch (error) { status.textContent = error.message; toggle.disabled = false; }
    });
    document.getElementById("chooseLaunchScene")?.addEventListener("click", () => {
      const draft = settings(session);
      const dialog = document.createElement("dialog");
      dialog.className = "launch-scene-dialog";
      dialog.setAttribute("aria-labelledby", "launchSceneTitle");
      dialog.innerHTML = `<div class="launch-scene-dialog-heading"><div><span class="feature-kicker">Your own little world</span><h2 id="launchSceneTitle">Choose your Launchpad scene</h2></div><button type="button" class="outline-btn" data-scene-close aria-label="Close scene chooser">✕</button></div>
        <p>Only your homepage changes. Your profile picture and classmates’ pages stay the same.</p>
        <div id="launchScenePreview">${artwork(draft.id, draft.motion, video, true)}</div>
        <div class="launch-scene-options">${scenes.map(scene => `<button type="button" data-scene-choice="${scene.id}" aria-pressed="${draft.id === scene.id}">${scene.image ? `<img src="${scene.image}" alt="" loading="lazy">` : '<span class="scene-original-thumb" aria-hidden="true">▶</span>'}<strong>${scene.name}</strong><small>${scene.description}</small></button>`).join("")}</div>
        <label class="launch-scene-motion"><input type="checkbox" id="launchSceneMotion" ${draft.motion ? "checked" : ""}> Gentle effects (or original video playback)</label>
        <p class="launch-scene-hint">Scene artwork stays still; only the silent effects move inside the circle. Reduced-motion preferences are always respected.</p>
        <p id="launchSceneSaveStatus" role="status"></p><div class="launch-scene-dialog-actions"><button type="button" class="outline-btn" data-scene-close>Cancel</button><button type="button" class="primary-btn" id="saveLaunchScene">Save Scene</button></div>`;
      document.body.append(dialog);
      const close = () => { dialog.close(); dialog.remove(); document.getElementById("chooseLaunchScene")?.focus(); };
      dialog.querySelectorAll("[data-scene-close]").forEach(button => button.addEventListener("click", close));
      dialog.addEventListener("cancel", event => { event.preventDefault(); close(); });
      const refreshPreview = () => { dialog.querySelector("#launchScenePreview").innerHTML = artwork(draft.id, draft.motion, video, true); };
      dialog.querySelectorAll("[data-scene-choice]").forEach(button => button.addEventListener("click", () => {
        draft.id = button.dataset.sceneChoice;
        dialog.querySelectorAll("[data-scene-choice]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
        refreshPreview();
      }));
      dialog.querySelector("#launchSceneMotion").addEventListener("change", event => { draft.motion = event.target.checked; refreshPreview(); });
      dialog.querySelector("#saveLaunchScene").addEventListener("click", async () => {
        const button = dialog.querySelector("#saveLaunchScene");
        button.disabled = true;
        dialog.querySelector("#launchSceneSaveStatus").textContent = "Saving your scene…";
        try { const updated = await save(draft); close(); onSave(updated); document.getElementById("chooseLaunchScene")?.focus(); }
        catch (error) { dialog.querySelector("#launchSceneSaveStatus").textContent = error.message; button.disabled = false; }
      });
      dialog.showModal();
    });
  }
  reduced.addEventListener("change", () => {
    document.querySelectorAll(".launch-scene").forEach(element => {
      const paused = reduced.matches || element.dataset.motion === "false";
      element.classList.toggle("is-paused", paused);
      const video = element.querySelector("video");
      if (video) { video.autoplay = !paused; if (paused) video.pause(); else video.play().catch(() => {}); }
    });
    const button = document.getElementById("toggleLaunchScene");
    if (button) { button.disabled = reduced.matches; button.textContent = reduced.matches ? "Motion reduced" : button.getAttribute("aria-pressed") === "true" ? "Resume scene" : "Pause scene"; }
  });
  window.LaunchpadScenes = { render, attach };
})();
