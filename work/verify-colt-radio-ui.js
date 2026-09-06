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
    await page.route("https://radio.loficafe.net/**", route => {
      const pathname = new URL(route.request().url()).pathname;
      if (pathname.startsWith("/api/nowplaying/")) {
        const slug = pathname.split("/").pop();
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ now_playing: { song: { artist: "Test Lofi Artist", title: `Test ${slug} Song` } } })
        });
      }
      return route.fulfill({ status: 200, contentType: "audio/mpeg", body: Buffer.from([]) });
    });
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
    await page.route("https://us2.maindigitalstream.com/ssl/7739", route => route.fulfill({ status: 200, contentType: "audio/mpeg", body: Buffer.from([]) }));
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
    await page.route("https://443-1.autopo.st/171/stream/1/", route => route.fulfill({ status: 200, contentType: "audio/mpeg", body: Buffer.from([]) }));
    await page.route("https://relaxingjazz.com/nowplaying.php?type=current", route => route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ artist: "Test Smooth Artist", title: "Test Smooth Song" })
    }));
    await page.route("https://listen.ceol.fm/**", route => {
      if (new URL(route.request().url()).pathname === "/status-json.xsl") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ icestats: { source: { listenurl: "https://listen.ceol.fm/auto", title: "Test Celtic Artist - Test Celtic Tune" } } })
        });
      }
      return route.fulfill({ status: 200, contentType: "audio/mpeg", body: Buffer.from([]) });
    });
    await page.route("https://cdn.onlyhitsradio.net/**", route => {
      if (new URL(route.request().url()).pathname.startsWith("/currentsong/kpop")) {
        return route.fulfill({ status: 200, contentType: "text/plain", headers: { "Access-Control-Allow-Origin": "*" }, body: "Test K-Pop Artist - Test K-Pop Song" });
      }
      return route.fulfill({ status: 200, contentType: "audio/mpeg", body: Buffer.from([]) });
    });
    await page.route("https://stream.zeno.fm/hs2dndb7ydnuv", route => route.fulfill({ status: 200, contentType: "audio/mpeg", body: Buffer.from([]) }));
    await page.route("https://streaming.radioempresabrasil.com.br/proxy/novainstrumental/stream", route => route.fulfill({ status: 200, contentType: "audio/mpeg", body: Buffer.from([]) }));
    await page.route("https://stream.rcs.revma.com/x8wbda03tm0uv", route => route.fulfill({ status: 200, contentType: "audio/mpeg", body: Buffer.from([]) }));
    await page.route("https://funkids-feed-data.s3-eu-west-1.amazonaws.com/now-playing/fun-kids-soundtracks.json", route => route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ artist: "Test Movie Artist", song: "Test Movie Song" })
    }));
    await page.route("https://audio-mp3.ibiblio.org/wcpe.mp3", route => route.fulfill({ status: 200, contentType: "audio/mpeg", body: Buffer.from([]) }));
    await page.route("https://radio.stereoscenic.com/asp-h", route => route.fulfill({ status: 200, contentType: "audio/mpeg", body: Buffer.from([]) }));
    await page.route("https://streamssl.chilltrax.com/", route => route.fulfill({ status: 200, contentType: "audio/mpeg", body: Buffer.from([]) }));
    await page.route("https://drive.uber.radio/uber/forkidzpophits/icecast.audio", route => route.fulfill({ status: 200, contentType: "audio/mpeg", body: Buffer.from([]) }));
    await page.route("https://stream.revma.ihrhls.com/zc7014", route => route.fulfill({ status: 200, contentType: "audio/aac", body: Buffer.from([]) }));
    await page.route("https://drive.uber.radio/uber/forkidzmoviesoundtracks/icecast.audio", route => route.fulfill({ status: 200, contentType: "audio/mpeg", body: Buffer.from([]) }));
    await page.route("https://drive.uber.radio/uber/forkidzkidzbop/icecast.audio", route => route.fulfill({ status: 200, contentType: "audio/mpeg", body: Buffer.from([]) }));
    await page.route("https://drive.uber.radio/uber/calmkids/icecast.audio", route => route.fulfill({ status: 200, contentType: "audio/mpeg", body: Buffer.from([]) }));
    await page.route("https://rtn.cdnstream1.com/2579_96.aac", route => route.fulfill({ status: 200, contentType: "audio/aac", body: Buffer.from([]) }));
    await page.route("https://streaming.live365.com/a08639", route => route.fulfill({ status: 200, contentType: "audio/mpeg", body: Buffer.from([]) }));
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
    assert.equal(radioVisuals.stationIcons, 40, JSON.stringify(radioVisuals));
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
      ["Lo-Fi • Study", "Lo-Fi • Focus", "Lo-Fi • Chill", "Lo-Fi • Sleep", "Lo-Fi • Gaming", "Lo-Fi • Japan", "Lo-Fi • Hip-Hop", "Synth • Chill", "Synth • Datawave", "Synth • Nightdrive", "Synth • Space", "Electronic • Lounge", "Electronic • Dance", "Electronic • Club", "House • Chill", "Worship • Modern", "Worship • Faith", "Worship • Bluegrass", "Christian • JOY FM", "Games • Soundtracks", "Jazz • Laid-Back", "Jazz • Funk & Soul", "Fantasy • Adventure", "Oldies • Jukebox", "Jazz • Smooth", "Celtic • Traditional", "K-Pop • Hits", "Hip-Hop • Urban Heat", "Hip-Hop • Positive", "Instrumental • Brazil", "Movies • Soundtracks", "Classical", "Ambient • Sleeping Pill", "Electronic • Chilltrax", "Kids • Pop", "Country • Family", "Kids • Movie Music", "Kids • Kidz Bop", "Kids • Calm", "Pop • New Hits"]
    );
    const iframe = radioPanel.locator("iframe");
    const audio = radioPanel.locator("audio.colt-radio-audio");
    assert.equal(await iframe.getAttribute("src"), null);
    assert.equal(await iframe.getAttribute("sandbox"), "allow-scripts allow-same-origin");
    assert.equal(await iframe.getAttribute("allow"), "autoplay");
    assert.equal(await audio.getAttribute("preload"), "auto", "The selected station is not prepared ahead of Play.");
    assert(await iframe.isHidden(), "The external Lofi Cafe interface should stay hidden.");
    assert.equal(await audio.getAttribute("src"), "https://radio.loficafe.net/listen/studying/radio.mp3");
    assert(await page.locator(".colt-radio-stream-player").isVisible(), "The Colt Radio player did not appear for Lofi Cafe.");

    await page.locator('[data-station="working"]').click();
    assert.equal(await audio.getAttribute("src"), "https://radio.loficafe.net/listen/working/radio.mp3");
    await page.locator('[data-station="sleeping"]').click();
    assert.equal(await audio.getAttribute("src"), "https://radio.loficafe.net/listen/sleeping/radio.mp3");
    await page.locator('[data-station="gaming"]').click();
    assert.equal(await audio.getAttribute("src"), "https://radio.loficafe.net/listen/gaming/radio.mp3");
    await page.locator('[data-station="japanese-lofi"]').click();
    assert.equal(await audio.getAttribute("src"), "https://radio.loficafe.net/listen/japanese-lofi/radio.mp3");
    await page.evaluate(() => {
      window.__consistentPlayerBeforeDirectStation = document.querySelector(".colt-radio-stream-player");
    });

    await page.getByRole("button", { name: "Synth • Nightdrive", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://stream.nightride.fm/nightride.mp3");
    assert(await audio.isHidden(), "The browser's progress and duration bar remained visible for Chillsynth.");
    assert(await page.locator(".colt-radio-stream-player").isVisible(), "The compact Chillsynth player did not appear.");
    assert.equal(await audio.evaluate(element => element.controls), false, "Native audio controls exposed a song timeline.");
    assert(await page.getByRole("button", { name: "Play Colt Radio" }).isVisible(), "The compact Play button is missing.");
    assert.equal(await page.locator(".colt-radio-live-badge").innerText(), "READY");
    await audio.evaluate(element => {
      element.__coltRadioNativePlay = element.play;
      element.play = () => Promise.resolve();
    });
    await page.getByRole("button", { name: "Play Colt Radio" }).click();
    assert.equal(await page.locator(".colt-radio-live-badge").innerText(), "CONNECTING...");
    assert(await page.getByRole("button", { name: "Cancel Colt Radio connection" }).isVisible());
    await audio.evaluate(element => element.dispatchEvent(new Event("playing")));
    assert.equal(await page.locator(".colt-radio-live-badge").innerText(), "● LIVE");
    assert(await page.locator(".colt-radio-now-playing").evaluate(element => element.classList.contains("is-playing")));
    await audio.evaluate(element => element.dispatchEvent(new Event("waiting")));
    assert.equal(await page.locator(".colt-radio-live-badge").innerText(), "BUFFERING...");
    await page.getByRole("button", { name: "Cancel Colt Radio connection" }).click();
    assert.equal(await page.locator(".colt-radio-live-badge").innerText(), "READY");
    await audio.evaluate(element => {
      element.play = () => Promise.reject(new DOMException("Test stream failure", "NotSupportedError"));
    });
    await page.getByRole("button", { name: "Play Colt Radio" }).click();
    await page.getByText("UNAVAILABLE", { exact: true }).waitFor();
    assert(await page.getByRole("button", { name: "Retry Colt Radio" }).isVisible());
    await audio.evaluate(element => {
      element.play = element.__coltRadioNativePlay;
      delete element.__coltRadioNativePlay;
    });
    const muteButton = page.getByRole("button", { name: "Mute Colt Radio" });
    assert(await muteButton.isVisible(), "The compact speaker button is missing.");
    assert.equal(await muteButton.locator(".colt-radio-volume-icon").count(), 1, "The crimson speaker artwork is missing.");
    assert.equal(await muteButton.evaluate(element => getComputedStyle(element).color), "rgb(237, 48, 70)");
    const volumeSlider = page.getByRole("slider", { name: "Colt Radio volume" });
    assert(await volumeSlider.isVisible(), "The Colt Radio volume slider is missing.");
    assert.equal(await volumeSlider.inputValue(), "65");
    assert.equal(await audio.evaluate(element => element.volume), 0.65);
    await volumeSlider.fill("35");
    assert.equal(await audio.evaluate(element => element.volume), 0.35);
    assert.equal(await page.evaluate(() => localStorage.getItem("classroomLaunchpadColtRadioVolumeV1")), "35");
    await page.getByRole("button", { name: "Mute Colt Radio" }).click();
    assert.equal(await audio.evaluate(element => element.muted), true);
    assert.equal(await page.getByRole("button", { name: "Unmute Colt Radio" }).locator(".colt-radio-volume-icon").count(), 1);
    await page.getByRole("button", { name: "Unmute Colt Radio" }).click();
    assert.equal(await audio.evaluate(element => element.muted), false);
    assert(await iframe.isHidden(), "The external player interface became visible after switching stations.");
    assert.match(await page.locator(".colt-radio-note").innerText(), /Synthwave, retrowave/);
    assert(await page.evaluate(() => window.__consistentPlayerBeforeDirectStation === document.querySelector(".colt-radio-stream-player")), "Colt Radio replaced its player interface while switching stations.");
    await page.getByText("Test Artist - Nightride Song", { exact: true }).waitFor();

    await page.getByRole("button", { name: "Synth • Space", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://stream.nightride.fm/spacesynth.mp3");
    assert.equal(await audio.evaluate(element => element.volume), 0.35, "Volume did not remain set after changing stations.");
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

    await page.getByRole("button", { name: "Worship • Bluegrass", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://us2.maindigitalstream.com/ssl/7739");
    assert.match(await page.locator(".colt-radio-note").innerText(), /commercial-free/);
    assert.match(await page.locator(".colt-radio-note").innerText(), /do not air indecent, vulgar, or offensive language/);

    await page.getByRole("button", { name: "Christian • JOY FM", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://rtn.cdnstream1.com/2579_96.aac");
    await page.getByText("Christian • JOY FM live stream", { exact: true }).waitFor();
    assert.match(await page.locator(".colt-radio-note").innerText(), /family-friendly main channel/);

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

    await page.getByRole("button", { name: "Jazz • Smooth", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://443-1.autopo.st/171/stream/1/");
    await page.getByText("Test Smooth Artist - Test Smooth Song", { exact: true }).waitFor();

    await page.getByRole("button", { name: "Celtic • Traditional", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://listen.ceol.fm/auto");
    await page.getByText("Test Celtic Artist - Test Celtic Tune", { exact: true }).waitFor();

    await page.getByRole("button", { name: "K-Pop • Hits", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://cdn.onlyhitsradio.net/kpop");
    await page.getByText("Test K-Pop Artist - Test K-Pop Song", { exact: true }).waitFor();

    await page.getByRole("button", { name: "Hip-Hop • Urban Heat", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://stream.zeno.fm/hs2dndb7ydnuv");
    await page.getByText("Hip-Hop • Urban Heat live stream", { exact: true }).waitFor();

    await page.getByRole("button", { name: "Hip-Hop • Positive", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://gateway.cdnstream1.com/boost-live");
    await page.getByText("Hip-Hop • Positive live stream", { exact: true }).waitFor();
    assert.match(await page.locator(".colt-radio-note").innerText(), /commercial-free by BOOST Radio/);

    await page.getByRole("button", { name: "Instrumental • Brazil", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://streaming.radioempresabrasil.com.br/proxy/novainstrumental/stream");
    await page.getByText("Instrumental • Brazil live stream", { exact: true }).waitFor();

    await page.getByRole("button", { name: "Movies • Soundtracks", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://stream.rcs.revma.com/x8wbda03tm0uv");
    await page.getByText("Test Movie Artist - Test Movie Song", { exact: true }).waitFor();
    assert.match(await page.locator(".colt-radio-note").innerText(), /Disney classics/);

    await page.getByRole("button", { name: "Classical", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://audio-mp3.ibiblio.org/wcpe.mp3");
    await page.getByText("Classical live stream", { exact: true }).waitFor();
    assert.match(await page.locator(".colt-radio-note").innerText(), /noncommercial/);

    await page.getByRole("button", { name: "Ambient • Sleeping Pill", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://radio.stereoscenic.com/asp-h");
    await page.getByText("Ambient • Sleeping Pill live stream", { exact: true }).waitFor();
    assert.match(await page.locator(".colt-radio-note").innerText(), /Ad-free, beat-free/);

    await page.getByRole("button", { name: "Electronic • Chilltrax", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://streamssl.chilltrax.com");
    await page.getByText("Electronic • Chilltrax live stream", { exact: true }).waitFor();
    assert.match(await page.locator(".colt-radio-note").innerText(), /100% free of advertising/);

    await page.getByRole("button", { name: "Kids • Pop", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://drive.uber.radio/uber/forkidzpophits/icecast.audio");
    assert.match(await page.locator(".colt-radio-note").innerText(), /Commercial-free, kid-friendly/);

    await page.getByRole("button", { name: "Country • Family", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://stream.revma.ihrhls.com/zc7014");
    assert.match(await page.locator(".colt-radio-note").innerText(), /Family-friendly, commercial-free/);

    await page.getByRole("button", { name: "Kids • Movie Music", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://drive.uber.radio/uber/forkidzmoviesoundtracks/icecast.audio");
    assert.match(await page.locator(".colt-radio-note").innerText(), /family-friendly songs from animated films/);

    await page.getByRole("button", { name: "Kids • Kidz Bop", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://drive.uber.radio/uber/forkidzkidzbop/icecast.audio");
    assert.match(await page.locator(".colt-radio-note").innerText(), /family-friendly versions of popular songs/);

    await page.getByRole("button", { name: "Kids • Calm", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://drive.uber.radio/uber/calmkids/icecast.audio");
    assert.match(await page.locator(".colt-radio-note").innerText(), /quiet classroom work/);

    await page.getByRole("button", { name: "Pop • New Hits", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://streaming.live365.com/a08639");
    assert.match(await page.locator(".colt-radio-note").innerText(), /family-friendly, always commercial-free/);

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
    assert.equal(await iframe.getAttribute("src"), null);
    assert.equal(await audio.getAttribute("src"), "https://radio.loficafe.net/listen/working/radio.mp3");
    assert(await page.locator(".colt-radio-stream-player").isVisible(), "The Colt Radio interface changed after returning to Lofi Cafe.");

    await page.getByRole("button", { name: "Synth • Datawave", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://stream.nightride.fm/datawave.mp3");
    assert.equal(await page.getByRole("button", { name: "Stop Colt Radio" }).innerText(), "×");
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
      stations: ["Lo-Fi • Study", "Lo-Fi • Focus", "Lo-Fi • Chill", "Lo-Fi • Sleep", "Lo-Fi • Gaming", "Lo-Fi • Japan", "Lo-Fi • Hip-Hop", "Synth • Chill", "Synth • Datawave", "Synth • Nightdrive", "Synth • Space", "Electronic • Lounge", "Electronic • Dance", "Electronic • Club", "House • Chill", "Worship • Modern", "Worship • Faith", "Worship • Bluegrass", "Christian • JOY FM", "Games • Soundtracks", "Jazz • Laid-Back", "Jazz • Funk & Soul", "Fantasy • Adventure", "Oldies • Jukebox", "Jazz • Smooth", "Celtic • Traditional", "K-Pop • Hits", "Hip-Hop • Urban Heat", "Hip-Hop • Positive", "Instrumental • Brazil", "Movies • Soundtracks", "Classical", "Ambient • Sleeping Pill", "Electronic • Chilltrax", "Kids • Pop", "Country • Family", "Kids • Movie Music", "Kids • Kidz Bop", "Kids • Calm", "Pop • New Hits"],
      directLofiCafeStreams: true,
      freeInstrumentalStreams: true,
      lofiFmAutomaticPlaylist: true,
      liveTrackTitles: true,
      compactControlsMatchOriginalStations: true,
      volumeSlider: true,
      volumeRememberedAcrossStations: true,
      progressAndDurationHidden: true,
      consistentPlayerInterface: true,
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
