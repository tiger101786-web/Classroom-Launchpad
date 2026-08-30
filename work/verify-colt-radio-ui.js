const assert = require("node:assert/strict");
const fs = require("node:fs");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { chromium } = require("playwright");

function availablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });
}

async function waitForServer(baseUrl) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      if ((await fetch(`${baseUrl}/api/health`)).ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Colt Radio UI test server did not start.");
}

function overlaps(first, second) {
  const firstRight = first.x + first.width;
  const firstBottom = first.y + first.height;
  const secondRight = second.x + second.width;
  const secondBottom = second.y + second.height;
  return !(
    firstRight <= second.x
    || first.x >= secondRight
    || firstBottom <= second.y
    || first.y >= secondBottom
  );
}

async function run() {
  const root = path.resolve(__dirname, "..");
  const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
  assert(
    appSource.includes('window.dispatchEvent(new CustomEvent("colt-run-opening"));\n    setScreen({ name: "coltRun" });'),
    "Colt Run does not send the immediate radio stop event before opening."
  );
  const port = await availablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "colt-radio-ui-"));
  const child = spawn(process.execPath, [path.join(root, "server.js")], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      DATA_DIR: dataDir,
      SESSION_SECRET: "colt-radio-ui-test-session-secret-that-is-long",
      TEACHER_PIN: "123456",
      NODE_ENV: "test"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
  });

  try {
    await waitForServer(baseUrl);
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.route("https://loficafe.net/**", route => route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><title>Test Lofi Cafe Embed</title><button>Play</button>"
    }));
    await page.route("https://stream.nightride.fm/**", route => {
      if (new URL(route.request().url()).pathname === "/status-json.xsl") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({
            icestats: {
              source: [
                { listenurl: "https://stream.nightride.fm/chillsynth.mp3", title: "Test Artist - Chillsynth Song" },
                { listenurl: "https://stream.nightride.fm/datawave.mp3", title: "Test Artist - Datawave Song" },
                { listenurl: "https://stream.nightride.fm/nightride.mp3", title: "Test Artist - Nightride Song" },
                { listenurl: "https://stream.nightride.fm/spacesynth.mp3", title: "Test Artist - Spacesynth Song" }
              ]
            }
          })
        });
      }
      return route.fulfill({ status: 200, contentType: "audio/mpeg", body: Buffer.from([]) });
    });
    await page.route("https://lofi.radio/**", route => route.fulfill({
      status: 200,
      contentType: "audio/mpeg",
      body: Buffer.from([])
    }));
    await page.route("https://onlineradiobox.com/json/ch/reaturesfightadio/playlist", route => route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ playlist: [{ name: "Test Artist - COTN Song" }] })
    }));
    await page.route("https://streaming.smartradio.ch:8510/stream", route => route.fulfill({ status: 200, contentType: "audio/aac", body: Buffer.from([]) }));
    await page.route("https://systrum.net:8443/**", route => {
      if (new URL(route.request().url()).pathname === "/status-json.xsl") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ icestats: { source: [{ listenurl: "https://systrum.net:8443/SSR2", title: "Test Artist - SSR Song" }] } })
        });
      }
      return route.fulfill({ status: 200, contentType: "audio/mpeg", body: Buffer.from([]) });
    });
    await page.route("https://stream.radioabf.com/**", route => {
      if (new URL(route.request().url()).pathname === "/status-json.xsl") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ icestats: { source: [{ listenurl: "https://stream.radioabf.com/abf-sd.mp3", title: "Test Artist - ABF Song" }] } })
        });
      }
      return route.fulfill({ status: 200, contentType: "audio/mpeg", body: Buffer.from([]) });
    });
    await page.route("https://stream.chillhouse-live.com/live", route => route.fulfill({ status: 200, contentType: "audio/mpeg", body: Buffer.from([]) }));
    await page.route("https://playerservices.streamtheworld.com/api/livestream-redirect/SP_R4750372.aac", route => route.fulfill({ status: 206, contentType: "audio/aacp", body: Buffer.from([]) }));
    await page.route("https://listen.samcloud.com/webapi/station/139286/history/npe**", route => route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ m_Item2: { Artist: "Test Worship Artist", Title: "Test Worship Song" } })
    }));
    await page.route("https://stream.wildfm.nl/GOD_Radio", route => route.fulfill({ status: 200, contentType: "audio/mpeg", body: Buffer.from([]) }));
    await page.route("https://ycpycskjlwukfsuizfnw.supabase.co/functions/v1/now-playing", route => {
      assert.equal(route.request().method(), "POST");
      assert(route.request().headers().apikey, "GOD Radio metadata request omitted its public API key.");
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ artist: "Test GOD Radio Artist", title: "Test GOD Radio Program" })
      });
    });
    await page.route("https://icecast.gttradio.com/**", route => {
      if (new URL(route.request().url()).pathname === "/status-json.xsl") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ icestats: { source: [{ listenurl: "https://icecast.gttradio.com/mp3_320k", title: "Test Game - Test Soundtrack" }] } })
        });
      }
      return route.fulfill({ status: 200, contentType: "audio/mpeg", body: Buffer.from([]) });
    });
    await page.route("https://west-mp3-128.streamthejazzgroove.com/stream", route => route.fulfill({ status: 200, contentType: "audio/mpeg", body: Buffer.from([]) }));
    await page.route("https://stream.nucrooze.com/listen/nucrooze/radio.mp3", route => route.fulfill({ status: 200, contentType: "audio/mpeg", body: Buffer.from([]) }));
    await page.route("https://core.nucrooze.com/api/nowplaying/nucrooze", route => route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ now_playing: { song: { artist: "Test Jazz Artist", title: "Test Funk Song" } } })
    }));
    await page.route("https://play.radiorivendell.com/radio/8000/radio.mp3", route => route.fulfill({ status: 200, contentType: "audio/mpeg", body: Buffer.from([]) }));
    await page.route("**/api/radio-metadata/rivendell", route => route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ artist: "Test Fantasy Artist", title: "Test Adventure Song" })
    }));
    await page.route("https://manager11.streamradio.fr:2485/**", route => {
      if (new URL(route.request().url()).pathname === "/status-json.xsl") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ icestats: { source: { listenurl: "https://manager11.streamradio.fr:2485/stream", title: "Test Oldies Artist - Test Jukebox Song" } } })
        });
      }
      return route.fulfill({ status: 200, contentType: "audio/mpeg", body: Buffer.from([]) });
    });
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    const indexResponse = await page.request.get(baseUrl);
    assert.match(indexResponse.headers()["permissions-policy"], /autoplay=.*loficafe\.net/);

    const radioLauncher = page.getByRole("button", { name: "Open Colt Radio" });
    const assistantLauncher = page.getByRole("button", { name: "Open Colt Assistant" });
    await radioLauncher.waitFor();
    await assistantLauncher.waitFor();
    const launcherBoxes = await Promise.all([radioLauncher.boundingBox(), assistantLauncher.boundingBox()]);
    assert(!overlaps(launcherBoxes[0], launcherBoxes[1]), "Colt Radio overlaps Colt Assistant on desktop.");

    await radioLauncher.click();
    const radioPanel = page.locator(".colt-radio-panel");
    await assert.doesNotReject(() => radioPanel.waitFor());
    await page.evaluate(() => {
      document.body.dataset.theme = "night";
    });
    const radioVisuals = await page.evaluate(() => {
      const radio = getComputedStyle(document.querySelector(".colt-radio-heading .feature-kicker"));
      return {
        kickerColor: radio.color,
        panelBackground: getComputedStyle(document.querySelector(".colt-radio-panel")).backgroundColor,
        stationIcons: document.querySelectorAll(".colt-radio-station-icon svg").length,
        equalizerBars: document.querySelectorAll(".colt-radio-equalizer i").length,
        headingArtwork: document.querySelector(".colt-radio-heading-mark img")?.getAttribute("src") || "",
        artwork: document.querySelector(".colt-radio-stream-artwork img")?.getAttribute("src") || ""
      };
    });
    assert.equal(radioVisuals.kickerColor, "rgb(239, 68, 82)", JSON.stringify(radioVisuals));
    assert.equal(radioVisuals.panelBackground, "rgb(5, 5, 5)", JSON.stringify(radioVisuals));
    assert.equal(radioVisuals.stationIcons, 22, JSON.stringify(radioVisuals));
    assert.equal(radioVisuals.equalizerBars, 24, JSON.stringify(radioVisuals));
    assert.match(radioVisuals.headingArtwork, /colt-radio-header-portrait\.png/, JSON.stringify(radioVisuals));
    assert.match(radioVisuals.artwork, /colt-radio-horse-portrait\.png/, JSON.stringify(radioVisuals));
    const matchedPanelLayout = await page.evaluate(() => {
      const panel = document.querySelector(".colt-radio-panel").getBoundingClientRect();
      const header = document.querySelector(".colt-radio-header").getBoundingClientRect();
      const station = document.querySelector(".colt-radio-station").getBoundingClientRect();
      return {
        panelWidth: Math.round(panel.width),
        headerHeight: Math.round(header.height),
        stationHeight: Math.round(station.height)
      };
    });
    assert.equal(matchedPanelLayout.panelWidth, 414, JSON.stringify(matchedPanelLayout));
    assert.equal(matchedPanelLayout.headerHeight, 112, JSON.stringify(matchedPanelLayout));
    assert.equal(matchedPanelLayout.stationHeight, 51, JSON.stringify(matchedPanelLayout));
    assert.equal(await page.locator(".colt-radio-root a").count(), 0, "Colt Radio contains an external navigation link.");
    const visibleStationNames = await page.locator(".colt-radio-station").allTextContents();
    assert(!visibleStationNames.some(name => name.includes("•")), JSON.stringify(visibleStationNames));
    const stationLabelLayout = await page.locator(".colt-radio-station-item").evaluateAll(items => items.map(item => {
      const name = item.querySelector(".colt-radio-station-name").getBoundingClientRect();
      const favorite = item.querySelector(".colt-radio-favorite").getBoundingClientRect();
      const linesFit = [...item.querySelectorAll(".colt-radio-station-family, .colt-radio-station-style")]
        .every(line => line.scrollWidth <= line.clientWidth + 1);
      return { nameRight: name.right, favoriteLeft: favorite.left, linesFit };
    }));
    assert(stationLabelLayout.every(item => item.linesFit && item.nameRight <= item.favoriteLeft), JSON.stringify(stationLabelLayout));
    assert.deepEqual(
      visibleStationNames.map(name => name.replace(" ", " • ")),
      ["Lo-Fi • Study", "Lo-Fi • Focus", "Lo-Fi • Chill", "Lo-Fi • Sleep", "Lo-Fi • Gaming", "Lo-Fi • Japan", "Lo-Fi • Hip-Hop", "Synth • Chill", "Synth • Datawave", "Synth • Nightdrive", "Synth • Space", "Electronic • Lounge", "Electronic • Dance", "Electronic • Club", "House • Chill", "Worship • Modern", "Worship • Faith", "Games • Soundtracks", "Jazz • Laid-Back", "Jazz • Funk & Soul", "Fantasy • Adventure", "Oldies • Jukebox"]
    );
    const iframe = radioPanel.locator("iframe");
    const audio = radioPanel.locator("audio.colt-radio-audio");
    assert.equal(await iframe.getAttribute("src"), "https://loficafe.net/embed/studying");
    assert.equal(await iframe.getAttribute("sandbox"), "allow-scripts allow-same-origin");
    assert.equal(await iframe.getAttribute("allow"), "autoplay");
    const croppedPlayerLayout = await page.locator(".colt-radio-player").evaluate(player => {
      const frame = player.querySelector("iframe");
      const playerBox = player.getBoundingClientRect();
      const frameBox = frame.getBoundingClientRect();
      return {
        clippedOverflow: getComputedStyle(player).overflow === "hidden",
        extraFrameWidth: frameBox.width - playerBox.width
      };
    });
    assert(croppedPlayerLayout.clippedOverflow);
    assert(croppedPlayerLayout.extraFrameWidth >= 38, JSON.stringify(croppedPlayerLayout));

    await page.getByRole("button", { name: "Lo-Fi • Focus", exact: true }).click();
    assert.equal(await iframe.getAttribute("src"), "https://loficafe.net/embed/working");
    await page.getByRole("button", { name: "Lo-Fi • Sleep", exact: true }).click();
    assert.equal(await iframe.getAttribute("src"), "https://loficafe.net/embed/sleeping");
    await page.getByRole("button", { name: "Lo-Fi • Gaming", exact: true }).click();
    assert.equal(await iframe.getAttribute("src"), "https://loficafe.net/embed/gaming");
    await page.getByRole("button", { name: "Lo-Fi • Japan", exact: true }).click();
    assert.equal(await iframe.getAttribute("src"), "https://loficafe.net/embed/japanese-lofi");
    await page.evaluate(() => {
      window.__embeddedFrameBeforeDirectStation = document.querySelector(".colt-radio-player iframe");
    });

    await page.getByRole("button", { name: "Synth • Nightdrive", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://stream.nightride.fm/nightride.mp3");
    assert(await audio.isHidden(), "The browser's progress and duration bar remained visible for Chillsynth.");
    assert(await page.locator(".colt-radio-stream-player").isVisible(), "The compact Chillsynth player did not appear.");
    assert.equal(await audio.evaluate(element => element.controls), false, "Native audio controls exposed a song timeline.");
    assert(await page.getByRole("button", { name: "Play Colt Radio" }).isVisible(), "The compact Play button is missing.");
    assert(await page.getByRole("button", { name: "Mute Colt Radio" }).isVisible(), "The compact speaker button is missing.");
    assert(await iframe.isHidden(), "The Lofi Cafe player remained visible after switching to Chillsynth.");
    assert.match(await page.locator(".colt-radio-note").innerText(), /Synthwave, retrowave/);
    assert(await page.evaluate(() => !window.__embeddedFrameBeforeDirectStation.isConnected), "The old Lofi Cafe player kept running after switching stations.");
    await page.getByText("Test Artist - Nightride Song", { exact: true }).waitFor();

    await page.getByRole("button", { name: "Synth • Space", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://stream.nightride.fm/spacesynth.mp3");
    await page.getByText("Test Artist - Spacesynth Song", { exact: true }).waitFor();

    await page.getByRole("button", { name: "Electronic • Lounge", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://streaming.smartradio.ch:8510/stream");
    await page.getByText("Test Artist - COTN Song", { exact: true }).waitFor();
    assert.match(await page.locator(".colt-radio-stream-label").innerText(), /COTN RADIO/);

    await page.getByRole("button", { name: "Electronic • Dance", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://systrum.net:8443/SSR2");
    await page.getByText("Test Artist - SSR Song", { exact: true }).waitFor();

    await page.getByRole("button", { name: "Electronic • Club", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://stream.radioabf.com/abf-sd.mp3");
    await page.getByText("Test Artist - ABF Song", { exact: true }).waitFor();

    await page.getByRole("button", { name: "House • Chill", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://stream.chillhouse-live.com/live");
    await page.getByText("House • Chill live stream", { exact: true }).waitFor();
    assert.match(await page.locator(".colt-radio-note").innerText(), /No ads, no presenters/);
    if (process.env.COLT_RADIO_SCREENSHOT) {
      await radioPanel.screenshot({ path: process.env.COLT_RADIO_SCREENSHOT });
    }

    await page.getByRole("button", { name: "Worship • Modern", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://playerservices.streamtheworld.com/api/livestream-redirect/SP_R4750372.aac");
    await page.getByText("Test Worship Artist - Test Worship Song", { exact: true }).waitFor();
    assert.match(await page.locator(".colt-radio-note").innerText(), /Curated, ad-free/);

    await page.getByRole("button", { name: "Worship • Faith", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://stream.wildfm.nl/GOD_Radio");
    await page.getByText("Test GOD Radio Artist - Test GOD Radio Program", { exact: true }).waitFor();
    assert.match(await page.locator(".colt-radio-note").innerText(), /Bible teaching, testimonies, and prayer/);

    await page.getByRole("button", { name: "Games • Soundtracks", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://icecast.gttradio.com/mp3_320k");
    await page.getByText("Test Game - Test Soundtrack", { exact: true }).waitFor();
    const wrappingTrackText = await page.evaluate(() => ({
      labelWhiteSpace: getComputedStyle(document.querySelector(".colt-radio-stream-label")).whiteSpace,
      titleWhiteSpace: getComputedStyle(document.querySelector(".colt-radio-now-playing strong")).whiteSpace,
      playerMinimumHeight: parseFloat(getComputedStyle(document.querySelector(".colt-radio-now-playing")).minHeight)
    }));
    assert.equal(wrappingTrackText.labelWhiteSpace, "normal", "The station and provider name is still truncated to one line.");
    assert.equal(wrappingTrackText.titleWhiteSpace, "normal", "The current track title is still truncated to one line.");
    assert(wrappingTrackText.playerMinimumHeight >= 110, "The player did not gain enough room for wrapped track information.");

    await page.getByRole("button", { name: "Jazz • Laid-Back", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://west-mp3-128.streamthejazzgroove.com/stream");

    await page.getByRole("button", { name: "Jazz • Funk & Soul", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://stream.nucrooze.com/listen/nucrooze/radio.mp3");
    await page.getByText("Test Jazz Artist - Test Funk Song", { exact: true }).waitFor();

    await page.getByRole("button", { name: "Fantasy • Adventure", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://play.radiorivendell.com/radio/8000/radio.mp3");
    await page.getByText("Test Fantasy Artist - Test Adventure Song", { exact: true }).waitFor();

    await page.getByRole("button", { name: "Oldies • Jukebox", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://manager11.streamradio.fr:2485/stream");
    await page.getByText("Test Oldies Artist - Test Jukebox Song", { exact: true }).waitFor();

    await page.getByRole("button", { name: "Add Games • Soundtracks to favorites" }).click();
    assert(await page.getByRole("button", { name: "Favorites (1)", exact: true }).isVisible());
    assert.deepEqual(JSON.parse(await page.evaluate(() => localStorage.getItem("classroomLaunchpadColtRadioFavoritesGuestV1"))), ["game-soundtracks"]);
    assert.equal(await page.locator("[data-station-item]").first().getAttribute("data-station-item"), "game-soundtracks", "Pinned favorites did not move to the top of All Stations.");
    await page.getByRole("button", { name: "Favorites (1)", exact: true }).click();
    assert.equal(await page.locator("[data-station-item]:not([hidden])").count(), 1);
    assert(await page.getByRole("button", { name: "Games • Soundtracks", exact: true }).isVisible());
    await page.getByRole("button", { name: "All Stations", exact: true }).click();

    await page.getByRole("button", { name: "Lo-Fi • Hip-Hop", exact: true }).click();
    const firstLofiTrack = await audio.getAttribute("src");
    assert.match(firstLofiTrack, /^https:\/\/lofi\.radio\/songs\//);
    assert(await audio.isHidden(), "Lo-fi Hip Hop exposed a progress bar or song duration.");
    assert(await page.locator(".colt-radio-stream-player").isVisible(), "Lo-fi Hip Hop did not use the compact Colt Radio player.");
    assert.match(await page.locator(".colt-radio-now-playing strong").innerText(), /^Purrple Cat - /);
    await audio.evaluate(element => element.dispatchEvent(new Event("ended")));
    assert.notEqual(await audio.getAttribute("src"), firstLofiTrack, "Lo-fi Hip Hop repeated the same track immediately.");

    await page.getByRole("button", { name: "Lo-Fi • Focus", exact: true }).click();
    assert.equal(await iframe.getAttribute("src"), "https://loficafe.net/embed/working");
    assert.equal(await audio.getAttribute("src"), null);
    assert(await audio.isHidden(), "The direct stream remained visible after returning to Lofi Cafe.");

    await page.getByRole("button", { name: "Synth • Datawave", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://stream.nightride.fm/datawave.mp3");
    await page.getByRole("button", { name: "Stop Colt Radio" }).click();
    await radioLauncher.click();
    assert.equal(await audio.getAttribute("src"), "https://stream.nightride.fm/datawave.mp3");
    assert.equal(await page.evaluate(() => localStorage.getItem("classroomLaunchpadColtRadioStationV1")), "datawave");

    await assistantLauncher.click();
    assert(await radioPanel.isHidden(), "Opening Colt Assistant did not minimize Colt Radio.");
    assert(await page.locator(".colt-assistant-panel").isVisible(), "Colt Assistant did not open.");
    await radioLauncher.click();
    assert(await page.locator(".colt-assistant-panel").isHidden(), "Opening Colt Radio did not close Colt Assistant.");
    assert(await radioPanel.isVisible(), "Colt Radio did not reopen.");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => {
      const timer = document.createElement("section");
      timer.className = "class-timer-badge";
      timer.innerHTML = "<span>Class Timer</span><strong>10:00</strong>";
      document.body.append(timer);
      window.dispatchEvent(new CustomEvent("classroom-launchpad-rendered", { detail: { screen: "home" } }));
    });
    assert(await page.locator("#coltRadioRoot").evaluate(rootElement => rootElement.classList.contains("has-class-timer")));
    const mobileRadioPanel = await radioPanel.boundingBox();
    const timerBox = await page.locator(".class-timer-badge").boundingBox();
    assert(!overlaps(mobileRadioPanel, timerBox), "Colt Radio covers the class timer on mobile.");

    await page.getByRole("button", { name: "Minimize Colt Radio" }).click();
    const mobileRadioLauncher = await radioLauncher.boundingBox();
    const mobileAssistantLauncher = await assistantLauncher.boundingBox();
    assert(!overlaps(mobileRadioLauncher, mobileAssistantLauncher), "The mobile Colt Radio button covers Colt Assistant.");
    assert(!overlaps(mobileRadioLauncher, timerBox), "The mobile Colt Radio button covers the class timer.");

    await radioLauncher.click();
    await page.evaluate(() => {
      window.__coltRadioFrameBeforeGame = document.querySelector(".colt-radio-player iframe");
      window.__coltRadioAudioBeforeGame = document.querySelector(".colt-radio-player audio");
      window.dispatchEvent(new CustomEvent("colt-run-opening"));
      window.dispatchEvent(new CustomEvent("classroom-launchpad-rendered", { detail: { screen: "coltRun" } }));
    });
    assert(await page.locator("#coltRadioRoot").isHidden(), "Colt Radio remains visible during Colt Run.");
    assert.equal(await iframe.getAttribute("src"), null, "Colt Radio did not stop when Colt Run opened.");
    assert.equal(await audio.getAttribute("src"), null, "The direct radio stream did not stop when Colt Run opened.");
    const hardStopState = await page.evaluate(() => ({
      oldFrameDisconnected: !window.__coltRadioFrameBeforeGame.isConnected,
      playerWasRebuilt: window.__coltRadioFrameBeforeGame !== document.querySelector(".colt-radio-player iframe"),
      audioStopped: window.__coltRadioAudioBeforeGame.paused && !window.__coltRadioAudioBeforeGame.getAttribute("src")
    }));
    assert(hardStopState.oldFrameDisconnected, "The playing Lofi Cafe frame remained connected.");
    assert(hardStopState.playerWasRebuilt, "Colt Radio did not rebuild its player after stopping.");
    assert(hardStopState.audioStopped, "Colt Radio did not clear its direct audio source after stopping.");

    const noHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    assert(noHorizontalOverflow, "Colt Radio caused mobile horizontal overflow.");

    console.log(JSON.stringify({
      embeddedInsideLaunchpad: true,
      noExternalNavigationLink: true,
      stations: ["Lo-Fi • Study", "Lo-Fi • Focus", "Lo-Fi • Chill", "Lo-Fi • Sleep", "Lo-Fi • Gaming", "Lo-Fi • Japan", "Lo-Fi • Hip-Hop", "Synth • Chill", "Synth • Datawave", "Synth • Nightdrive", "Synth • Space", "Electronic • Lounge", "Electronic • Dance", "Electronic • Club", "House • Chill", "Worship • Modern", "Worship • Faith", "Games • Soundtracks", "Jazz • Laid-Back", "Jazz • Funk & Soul", "Fantasy • Adventure", "Oldies • Jukebox"],
      freeLofiCafeEmbed: true,
      freeInstrumentalStreams: true,
      lofiFmAutomaticPlaylist: true,
      liveTrackTitles: true,
      compactControlsMatchOriginalStations: true,
      progressAndDurationHidden: true,
      embeddedPlayerDestroyedOnSwitch: true,
      onePlayerAtATime: true,
      stationPreferenceRemembered: true,
      assistantCollisionPrevented: true,
      classTimerCollisionPrevented: true,
      mobileOverflow: false,
      stopsForColtRun: true
    }, null, 2));
  } finally {
    await browser.close();
    child.kill();
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
