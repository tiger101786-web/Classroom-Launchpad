(function initializeColtRadio(globalObject) {
  "use strict";

  const stations = [
    {
      id: "studying",
      label: "Studying",
      type: "embed",
      source: "https://loficafe.net/embed/studying",
      note: "Free, ad-free study music streamed by Lofi Cafe. No account required."
    },
    {
      id: "working",
      label: "Working",
      type: "embed",
      source: "https://loficafe.net/embed/working",
      note: "Free, ad-free work music streamed by Lofi Cafe. No account required."
    },
    {
      id: "chilling",
      label: "Chilling",
      type: "embed",
      source: "https://loficafe.net/embed/chilling",
      note: "Free, ad-free chill music streamed by Lofi Cafe. No account required."
    },
    {
      id: "sleeping",
      label: "Sleeping",
      type: "embed",
      source: "https://loficafe.net/embed/sleeping",
      note: "Free, ad-free soft lofi streamed by Lofi Cafe for quiet work and calm classroom moments. No account required."
    },
    {
      id: "gaming",
      label: "Gaming Lofi",
      type: "embed",
      source: "https://loficafe.net/embed/gaming",
      note: "Free, ad-free instrumental lofi with a little more energy, streamed by Lofi Cafe. No account required."
    },
    {
      id: "japanese-lofi",
      label: "Japanese Lofi",
      type: "embed",
      source: "https://loficafe.net/embed/japanese-lofi",
      note: "Free, ad-free Japanese-inspired instrumental lofi streamed by Lofi Cafe. No account required."
    },
    {
      id: "lofi-fm",
      label: "Lo-fi Hip Hop",
      type: "playlist",
      sources: [
        "https://lofi.radio/songs/42.mp3",
        "https://lofi.radio/songs/A Place to Hide.mp3",
        "https://lofi.radio/songs/Adrift.mp3",
        "https://lofi.radio/songs/Aether.mp3",
        "https://lofi.radio/songs/After Hours.mp3",
        "https://lofi.radio/songs/After the Rain.mp3",
        "https://lofi.radio/songs/Alien Sky.mp3",
        "https://lofi.radio/songs/Alienated.mp3",
        "https://lofi.radio/songs/All Curled Up.mp3",
        "https://lofi.radio/songs/Alley Cat.mp3"
      ],
      note: "Free, ad-free lo-fi hip hop by Purrple Cat. Tracks change automatically. No account required."
    },
    {
      id: "chillsynth",
      label: "Chillsynth",
      type: "stream",
      source: "https://stream.nightride.fm/chillsynth.mp3",
      metadataMount: "/chillsynth.mp3",
      note: "Instrumental chillsynth and chillwave streamed by Nightride FM. No account required."
    },
    {
      id: "datawave",
      label: "Datawave",
      type: "stream",
      source: "https://stream.nightride.fm/datawave.mp3",
      metadataMount: "/datawave.mp3",
      note: "Instrumental electronic and retro-computing music streamed by Nightride FM. No account required."
    },
    {
      id: "nightride",
      label: "Nightride",
      type: "stream",
      source: "https://stream.nightride.fm/nightride.mp3",
      metadataMount: "/nightride.mp3",
      note: "Synthwave, retrowave, and outrun music streamed live by Nightride FM. No account required."
    },
    {
      id: "spacesynth",
      label: "Spacesynth",
      type: "stream",
      source: "https://stream.nightride.fm/spacesynth.mp3",
      provider: "Nightride FM",
      metadataEndpoint: "https://stream.nightride.fm/status-json.xsl",
      metadataMount: "/spacesynth.mp3",
      note: "Spacesynth, space disco, and retro electronic music streamed live by Nightride FM. No account required."
    },
    {
      id: "cotn-radio",
      label: "COTN Radio",
      type: "stream",
      source: "https://streaming.smartradio.ch:8510/stream",
      provider: "COTN Radio",
      metadataEndpoint: "https://onlineradiobox.com/json/ch/reaturesfightadio/playlist",
      metadataFormat: "onlineRadioBox",
      note: "Modern lounge, chillout, ambient, chillhouse, and deep-house music streamed by COTN Radio. Free, ad-free, and no account required."
    },
    {
      id: "ssr-electronica",
      label: "SSR Electronica",
      type: "stream",
      source: "https://systrum.net:8443/SSR2",
      provider: "Systrum Sistum",
      metadataEndpoint: "https://systrum.net:8443/status-json.xsl",
      metadataMount: "/SSR2",
      note: "Modern electronica and dance music streamed by the nonprofit Systrum Sistum station. No account required."
    },
    {
      id: "radio-abf",
      label: "Radio ABF",
      type: "stream",
      source: "https://stream.radioabf.com/abf-sd.mp3",
      provider: "Radio ABF",
      metadataEndpoint: "https://stream.radioabf.com/status-json.xsl",
      metadataMount: "/abf-sd.mp3",
      note: "Modern house, techno, electronic music, and DJ mixes streamed by Radio ABF. Ad-free and no account required."
    },
    {
      id: "chill-house",
      label: "Chill House",
      type: "stream",
      source: "https://stream.chillhouse-live.com/live",
      provider: "Chillhouse Live",
      note: "Warm deep-house and chill-house background music streamed by Chillhouse Live. No ads, no presenters, and no account required."
    },
    {
      id: "icf-worship",
      label: "ICF Worship",
      type: "stream",
      source: "https://playerservices.streamtheworld.com/api/livestream-redirect/SP_R4750372.aac",
      provider: "ICF Radio",
      metadataEndpoint: "https://listen.samcloud.com/webapi/station/139286/history/npe?token=0fadd322e13a4d70b77795d1fdbb0156d14371ff&format=json",
      metadataFormat: "samCloudNowPlaying",
      note: "Modern worship music streamed by ICF Radio. Curated, ad-free, free of charge, and no account required."
    }
  ];
  const preferredStationKey = "classroomLaunchpadColtRadioStationV1";
  const hiddenScreens = new Set(["coltRun", "pin", "login", "account", "dashboard", "edit", "changePin"]);

  function buildElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = String(text);
    return element;
  }

  function mountRadio() {
    const root = document.getElementById("coltRadioRoot");
    if (!root) return;

    const launcher = buildElement("button", "colt-radio-launcher");
    launcher.type = "button";
    launcher.setAttribute("aria-label", "Open Colt Radio");
    launcher.setAttribute("aria-expanded", "false");
    const launcherMark = buildElement("span", "colt-radio-launcher-mark", "♫");
    launcherMark.setAttribute("aria-hidden", "true");
    const launcherLabel = buildElement("span", "colt-radio-launcher-label", "Colt Radio");
    launcher.append(launcherMark, launcherLabel);

    const panel = buildElement("section", "colt-radio-panel");
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "false");
    panel.setAttribute("aria-labelledby", "coltRadioTitle");

    const header = buildElement("header", "colt-radio-header");
    const heading = buildElement("div", "colt-radio-heading");
    const headingMark = buildElement("span", "colt-radio-heading-mark", "♫");
    headingMark.setAttribute("aria-hidden", "true");
    const headingText = buildElement("div");
    const kicker = buildElement("span", "feature-kicker", "Classroom Music");
    const title = buildElement("h2", "", "Colt Radio");
    title.id = "coltRadioTitle";
    headingText.append(kicker, title);
    heading.append(headingMark, headingText);

    const headerActions = buildElement("div", "colt-radio-header-actions");
    const minimize = buildElement("button", "colt-radio-icon-btn", "−");
    minimize.type = "button";
    minimize.setAttribute("aria-label", "Minimize Colt Radio");
    const stop = buildElement("button", "colt-radio-icon-btn", "■");
    stop.type = "button";
    stop.setAttribute("aria-label", "Stop Colt Radio");
    headerActions.append(minimize, stop);
    header.append(heading, headerActions);

    const stationNav = buildElement("nav", "colt-radio-stations");
    stationNav.setAttribute("aria-label", "Choose a Colt Radio station");
    const stationButtons = stations.map(station => {
      const button = buildElement("button", "colt-radio-station", station.label);
      button.type = "button";
      button.dataset.station = station.id;
      button.setAttribute("aria-pressed", "false");
      stationNav.append(button);
      return button;
    });

    const playerWrap = buildElement("div", "colt-radio-player");
    const placeholder = buildElement("p", "colt-radio-placeholder", "Choose a station, then press Play in the radio player.");
    const nowPlaying = buildElement("div", "colt-radio-now-playing colt-radio-stream-player");
    nowPlaying.hidden = true;
    nowPlaying.setAttribute("aria-live", "polite");
    const streamArtwork = buildElement("span", "colt-radio-stream-artwork", "\u266b");
    streamArtwork.setAttribute("aria-hidden", "true");
    const streamDetails = buildElement("span", "colt-radio-stream-details");
    const nowPlayingLabel = buildElement("span", "colt-radio-stream-label", "Now Playing");
    const nowPlayingTitle = buildElement("strong", "", "Loading track information...");
    streamDetails.append(nowPlayingLabel, nowPlayingTitle);
    const muteStream = buildElement("button", "colt-radio-stream-control colt-radio-mute", "\ud83d\udd0a");
    muteStream.type = "button";
    muteStream.setAttribute("aria-label", "Mute Colt Radio");
    const toggleStream = buildElement("button", "colt-radio-stream-control colt-radio-play", "\u25b6");
    toggleStream.type = "button";
    toggleStream.setAttribute("aria-label", "Play Colt Radio");
    nowPlaying.append(streamArtwork, streamDetails, muteStream, toggleStream);
    function createPlayerFrame() {
      const frame = document.createElement("iframe");
      frame.title = "Lofi Cafe radio player";
      frame.loading = "lazy";
      frame.referrerPolicy = "no-referrer";
      frame.setAttribute("allow", "autoplay");
      frame.setAttribute("sandbox", "allow-scripts allow-same-origin");
      frame.hidden = true;
      return frame;
    }
    function createAudioPlayer() {
      const audio = document.createElement("audio");
      audio.className = "colt-radio-audio";
      audio.preload = "none";
      audio.disableRemotePlayback = true;
      audio.setAttribute("aria-label", "Colt Radio audio controls");
      audio.hidden = true;
      return audio;
    }
    let iframe = createPlayerFrame();
    const audio = createAudioPlayer();
    playerWrap.append(placeholder, iframe, nowPlaying, audio);

    const note = buildElement("p", "colt-radio-note", "Free, ad-free music streamed by Lofi Cafe. No account required.");
    panel.append(header, stationNav, playerWrap, note);
    root.append(launcher, panel);

    let activeStation = "";
    let playlistTrackIndex = -1;
    let metadataTimer = 0;

    function preferredStation() {
      try {
        const savedStation = localStorage.getItem(preferredStationKey);
        return stations.some(station => station.id === savedStation) ? savedStation : "studying";
      } catch (error) {
        return "studying";
      }
    }

    function rememberStation(stationId) {
      try {
        localStorage.setItem(preferredStationKey, stationId);
      } catch (error) {}
    }

    function clearAudioStream() {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audio.hidden = true;
      nowPlaying.hidden = true;
      toggleStream.textContent = "\u25b6";
      toggleStream.setAttribute("aria-label", "Play Colt Radio");
      nowPlayingTitle.textContent = "Loading track information...";
      if (metadataTimer) globalObject.clearInterval(metadataTimer);
      metadataTimer = 0;
    }

    function clearEmbeddedPlayer() {
      const activeFrame = iframe;
      activeFrame.src = "about:blank";
      activeFrame.remove();
      iframe = createPlayerFrame();
      playerWrap.insertBefore(iframe, nowPlaying);
    }

    function trackNameFromSource(source) {
      const filename = decodeURIComponent(source.split("/").pop() || "Lo-fi Hip Hop");
      return filename.replace(/\.mp3$/i, "");
    }

    function loadNextPlaylistTrack(station, { autoplay = false } = {}) {
      if (!station.sources?.length) return;
      let nextIndex = Math.floor(Math.random() * station.sources.length);
      if (station.sources.length > 1 && nextIndex === playlistTrackIndex) {
        nextIndex = (nextIndex + 1) % station.sources.length;
      }
      playlistTrackIndex = nextIndex;
      const source = station.sources[nextIndex];
      audio.src = source;
      nowPlayingTitle.textContent = `Purrple Cat - ${trackNameFromSource(source)}`;
      audio.load();
      if (autoplay) audio.play().catch(() => {});
    }

    function metadataSources(payload) {
      const source = payload?.icestats?.source;
      return Array.isArray(source) ? source : source ? [source] : [];
    }

    async function refreshNowPlaying(station) {
      if (activeStation !== station.id) return;
      try {
        const metadataEndpoint = station.metadataEndpoint || (station.metadataMount ? "https://stream.nightride.fm/status-json.xsl" : "");
        if (!metadataEndpoint) {
          nowPlayingTitle.textContent = `${station.label} live stream`;
          return;
        }
        const response = await fetch(metadataEndpoint, { cache: "no-store" });
        if (!response.ok) throw new Error("Metadata unavailable");
        const payload = await response.json();
        if (station.metadataFormat === "onlineRadioBox") {
          const currentTrack = payload?.playlist?.[0]?.name;
          if (activeStation === station.id) nowPlayingTitle.textContent = currentTrack || `${station.label} live stream`;
          return;
        }
        if (station.metadataFormat === "samCloudNowPlaying") {
          const currentTrack = payload?.m_Item2;
          const title = [currentTrack?.Artist, currentTrack?.Title].filter(Boolean).join(" - ");
          if (activeStation === station.id) nowPlayingTitle.textContent = title || `${station.label} live stream`;
          return;
        }
        const stream = metadataSources(payload).find(item => {
          try {
            return new URL(item.listenurl).pathname === station.metadataMount;
          } catch (error) {
            return String(item.listenurl || "").endsWith(station.metadataMount);
          }
        });
        if (activeStation !== station.id) return;
        nowPlayingTitle.textContent = stream?.title || stream?.["display-title"] || `${station.label} live stream`;
      } catch (error) {
        if (activeStation === station.id) nowPlayingTitle.textContent = `${station.label} live stream`;
      }
    }

    function startNowPlayingUpdates(station) {
      refreshNowPlaying(station);
      metadataTimer = globalObject.setInterval(() => refreshNowPlaying(station), 20000);
    }

    function updateStreamLabel(station) {
      const provider = station.provider || (station.type === "playlist" ? "Lo-fi Hip Hop" : "Nightride FM");
      nowPlayingLabel.textContent = `${station.label} \u00b7 ${provider}`;
    }

    function updatePlaybackButton() {
      const playing = !audio.paused && !audio.ended;
      toggleStream.textContent = playing ? "\u275a\u275a" : "\u25b6";
      toggleStream.setAttribute("aria-label", playing ? "Pause Colt Radio" : "Play Colt Radio");
    }

    function setLauncherState() {
      launcherLabel.textContent = activeStation ? "Colt Radio • On" : "Colt Radio";
      launcher.classList.toggle("is-playing", Boolean(activeStation));
    }

    function minimizePanel({ focusLauncher = true } = {}) {
      panel.hidden = true;
      launcher.hidden = false;
      launcher.setAttribute("aria-expanded", "false");
      if (focusLauncher && !root.hidden) launcher.focus();
    }

    function stopRadio({ focusLauncher = true } = {}) {
      clearAudioStream();
      clearEmbeddedPlayer();
      placeholder.hidden = false;
      activeStation = "";
      stationButtons.forEach(button => {
        button.classList.remove("is-active");
        button.setAttribute("aria-pressed", "false");
      });
      setLauncherState();
      minimizePanel({ focusLauncher });
    }

    function selectStation(stationId) {
      const station = stations.find(item => item.id === stationId);
      if (!station) return;
      activeStation = station.id;
      clearAudioStream();
      clearEmbeddedPlayer();
      if (station.type === "embed") {
        iframe.src = station.source;
        iframe.title = `Lofi Cafe ${station.label} station`;
        iframe.hidden = false;
      } else if (station.type === "playlist") {
        audio.setAttribute("aria-label", `${station.label} station audio controls`);
        audio.hidden = false;
        nowPlaying.hidden = false;
        updateStreamLabel(station);
        loadNextPlaylistTrack(station);
      } else {
        audio.src = station.source;
        audio.setAttribute("aria-label", `${station.label} station audio controls`);
        audio.hidden = false;
        nowPlaying.hidden = false;
        updateStreamLabel(station);
        audio.load();
        startNowPlayingUpdates(station);
      }
      placeholder.hidden = true;
      note.textContent = station.note;
      stationButtons.forEach(button => {
        const selected = button.dataset.station === station.id;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
      rememberStation(station.id);
      setLauncherState();
    }

    function openPanel() {
      panel.hidden = false;
      launcher.hidden = true;
      launcher.setAttribute("aria-expanded", "true");
      globalObject.dispatchEvent(new CustomEvent("colt-radio-opened"));
      if (!activeStation) selectStation(preferredStation());
      stationButtons.find(button => button.dataset.station === activeStation)?.focus();
    }

    function updateVisibility(event) {
      const screen = event?.detail?.screen || "home";
      const shouldHide = hiddenScreens.has(screen);
      root.hidden = shouldHide;
      root.classList.toggle("has-class-timer", Boolean(document.querySelector(".class-timer-badge")));
      if (screen === "coltRun") {
        stopRadio({ focusLauncher: false });
        return;
      }
      if (shouldHide) minimizePanel({ focusLauncher: false });
    }

    launcher.addEventListener("click", openPanel);
    minimize.addEventListener("click", () => minimizePanel());
    stop.addEventListener("click", () => stopRadio());
    stationNav.addEventListener("click", event => {
      const button = event.target.closest("[data-station]");
      if (button) selectStation(button.dataset.station);
    });
    audio.addEventListener("ended", () => {
      const station = stations.find(item => item.id === activeStation);
      if (station?.type === "playlist") loadNextPlaylistTrack(station, { autoplay: true });
    });
    audio.addEventListener("play", updatePlaybackButton);
    audio.addEventListener("pause", updatePlaybackButton);
    toggleStream.addEventListener("click", () => {
      if (audio.paused) audio.play().catch(() => updatePlaybackButton());
      else audio.pause();
    });
    muteStream.addEventListener("click", () => {
      audio.muted = !audio.muted;
      muteStream.textContent = audio.muted ? "\ud83d\udd07" : "\ud83d\udd0a";
      muteStream.setAttribute("aria-label", audio.muted ? "Unmute Colt Radio" : "Mute Colt Radio");
    });
    panel.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        event.preventDefault();
        minimizePanel();
      }
    });
    globalObject.addEventListener("colt-assistant-opened", () => minimizePanel({ focusLauncher: false }));
    globalObject.addEventListener("colt-run-opening", () => stopRadio({ focusLauncher: false }));
    globalObject.addEventListener("classroom-launchpad-rendered", updateVisibility);

    updateVisibility({ detail: { screen: "home" } });
    setLauncherState();
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountRadio);
    else mountRadio();
  }
})(typeof window !== "undefined" ? window : globalThis);
