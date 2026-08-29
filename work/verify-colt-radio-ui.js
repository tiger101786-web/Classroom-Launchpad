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
    const badgeStyles = await page.evaluate(() => {
      const radio = getComputedStyle(document.querySelector(".colt-radio-heading .feature-kicker"));
      const assistant = getComputedStyle(document.querySelector(".colt-assistant-heading .feature-kicker"));
      return {
        radio: {
          color: radio.color,
          backgroundColor: radio.backgroundColor,
          fontSize: radio.fontSize,
          padding: radio.padding
        },
        assistant: {
          color: assistant.color,
          backgroundColor: assistant.backgroundColor,
          fontSize: assistant.fontSize,
          padding: assistant.padding
        }
      };
    });
    assert.deepEqual(badgeStyles.radio, badgeStyles.assistant, JSON.stringify(badgeStyles));
    assert.equal(await page.locator(".colt-radio-root a").count(), 0, "Colt Radio contains an external navigation link.");
    assert.deepEqual(
      await page.locator(".colt-radio-station").allTextContents(),
      ["Studying", "Working", "Chilling", "Sleeping", "Gaming Lofi", "Japanese Lofi", "Lo-fi Hip Hop", "Chillsynth", "Datawave", "Nightride", "Spacesynth", "COTN Radio", "SSR Electronica", "Radio ABF", "Chill House", "ICF Worship", "GOD Radio"]
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

    await page.getByRole("button", { name: "Working", exact: true }).click();
    assert.equal(await iframe.getAttribute("src"), "https://loficafe.net/embed/working");
    await page.getByRole("button", { name: "Sleeping", exact: true }).click();
    assert.equal(await iframe.getAttribute("src"), "https://loficafe.net/embed/sleeping");
    await page.getByRole("button", { name: "Gaming Lofi", exact: true }).click();
    assert.equal(await iframe.getAttribute("src"), "https://loficafe.net/embed/gaming");
    await page.getByRole("button", { name: "Japanese Lofi", exact: true }).click();
    assert.equal(await iframe.getAttribute("src"), "https://loficafe.net/embed/japanese-lofi");
    await page.evaluate(() => {
      window.__embeddedFrameBeforeDirectStation = document.querySelector(".colt-radio-player iframe");
    });

    await page.getByRole("button", { name: "Nightride", exact: true }).click();
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

    await page.getByRole("button", { name: "Spacesynth", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://stream.nightride.fm/spacesynth.mp3");
    await page.getByText("Test Artist - Spacesynth Song", { exact: true }).waitFor();

    await page.getByRole("button", { name: "COTN Radio", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://streaming.smartradio.ch:8510/stream");
    await page.getByText("Test Artist - COTN Song", { exact: true }).waitFor();
    assert.match(await page.locator(".colt-radio-stream-label").innerText(), /COTN RADIO/);

    await page.getByRole("button", { name: "SSR Electronica", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://systrum.net:8443/SSR2");
    await page.getByText("Test Artist - SSR Song", { exact: true }).waitFor();

    await page.getByRole("button", { name: "Radio ABF", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://stream.radioabf.com/abf-sd.mp3");
    await page.getByText("Test Artist - ABF Song", { exact: true }).waitFor();

    await page.getByRole("button", { name: "Chill House", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://stream.chillhouse-live.com/live");
    await page.getByText("Chill House live stream", { exact: true }).waitFor();
    assert.match(await page.locator(".colt-radio-note").innerText(), /No ads, no presenters/);

    await page.getByRole("button", { name: "ICF Worship", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://playerservices.streamtheworld.com/api/livestream-redirect/SP_R4750372.aac");
    await page.getByText("Test Worship Artist - Test Worship Song", { exact: true }).waitFor();
    assert.match(await page.locator(".colt-radio-note").innerText(), /Curated, ad-free/);

    await page.getByRole("button", { name: "GOD Radio", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://stream.wildfm.nl/GOD_Radio");
    await page.getByText("Test GOD Radio Artist - Test GOD Radio Program", { exact: true }).waitFor();
    assert.match(await page.locator(".colt-radio-note").innerText(), /Bible teaching, testimonies, and prayer/);

    await page.getByRole("button", { name: "Lo-fi Hip Hop", exact: true }).click();
    const firstLofiTrack = await audio.getAttribute("src");
    assert.match(firstLofiTrack, /^https:\/\/lofi\.radio\/songs\//);
    assert(await audio.isHidden(), "Lo-fi Hip Hop exposed a progress bar or song duration.");
    assert(await page.locator(".colt-radio-stream-player").isVisible(), "Lo-fi Hip Hop did not use the compact Colt Radio player.");
    assert.match(await page.locator(".colt-radio-now-playing strong").innerText(), /^Purrple Cat - /);
    await audio.evaluate(element => element.dispatchEvent(new Event("ended")));
    assert.notEqual(await audio.getAttribute("src"), firstLofiTrack, "Lo-fi Hip Hop repeated the same track immediately.");

    await page.getByRole("button", { name: "Working", exact: true }).click();
    assert.equal(await iframe.getAttribute("src"), "https://loficafe.net/embed/working");
    assert.equal(await audio.getAttribute("src"), null);
    assert(await audio.isHidden(), "The direct stream remained visible after returning to Lofi Cafe.");

    await page.getByRole("button", { name: "Datawave", exact: true }).click();
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
      stations: ["Studying", "Working", "Chilling", "Sleeping", "Gaming Lofi", "Japanese Lofi", "Lo-fi Hip Hop", "Chillsynth", "Datawave", "Nightride", "Spacesynth", "COTN Radio", "SSR Electronica", "Radio ABF", "Chill House", "ICF Worship", "GOD Radio"],
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
