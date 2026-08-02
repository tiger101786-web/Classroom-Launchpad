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
    await page.route("https://stream.nightride.fm/**", route => route.fulfill({
      status: 200,
      contentType: "audio/mpeg",
      body: Buffer.from([])
    }));
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
      ["Studying", "Working", "Chilling", "Chillsynth", "Datawave"]
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

    await page.getByRole("button", { name: "Chillsynth", exact: true }).click();
    assert.equal(await audio.getAttribute("src"), "https://stream.nightride.fm/chillsynth.mp3");
    assert(await audio.isVisible(), "The Chillsynth stream did not use the existing Colt Radio player.");
    assert(await iframe.isHidden(), "The Lofi Cafe player remained visible after switching to Chillsynth.");
    assert.match(await page.locator(".colt-radio-note").innerText(), /Instrumental chillsynth/);

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
      stations: ["Studying", "Working", "Chilling", "Chillsynth", "Datawave"],
      freeLofiCafeEmbed: true,
      freeInstrumentalStreams: true,
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
