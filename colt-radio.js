(function initializeColtRadio(globalObject) {
  "use strict";

  const stations = [
    { id: "studying", label: "Studying" },
    { id: "working", label: "Working" },
    { id: "chilling", label: "Chilling" }
  ];
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
    stationNav.setAttribute("aria-label", "Choose a Lofi Cafe station");
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
    const iframe = document.createElement("iframe");
    iframe.title = "Lofi Cafe radio player";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer";
    iframe.setAttribute("allow", "autoplay");
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
    iframe.hidden = true;
    playerWrap.append(placeholder, iframe);

    const note = buildElement("p", "colt-radio-note", "Free, ad-free music streamed by Lofi Cafe. No account required.");
    panel.append(header, stationNav, playerWrap, note);
    root.append(launcher, panel);

    let activeStation = "";

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
      iframe.removeAttribute("src");
      iframe.hidden = true;
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
      iframe.src = `https://loficafe.net/embed/${station.id}`;
      iframe.title = `Lofi Cafe ${station.label} station`;
      iframe.hidden = false;
      placeholder.hidden = true;
      stationButtons.forEach(button => {
        const selected = button.dataset.station === station.id;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
      setLauncherState();
    }

    function openPanel() {
      panel.hidden = false;
      launcher.hidden = true;
      launcher.setAttribute("aria-expanded", "true");
      globalObject.dispatchEvent(new CustomEvent("colt-radio-opened"));
      if (!activeStation) selectStation("studying");
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
    panel.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        event.preventDefault();
        minimizePanel();
      }
    });
    globalObject.addEventListener("colt-assistant-opened", () => minimizePanel({ focusLauncher: false }));
    globalObject.addEventListener("classroom-launchpad-rendered", updateVisibility);

    updateVisibility({ detail: { screen: "home" } });
    setLauncherState();
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountRadio);
    else mountRadio();
  }
})(typeof window !== "undefined" ? window : globalThis);
