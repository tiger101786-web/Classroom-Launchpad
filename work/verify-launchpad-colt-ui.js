"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

async function authenticate(page, role = "student") {
  await page.evaluate(activeRole => {
    window.dispatchEvent(new CustomEvent("classroom-launchpad-rendered", {
      detail: {
        screen: "home",
        auth: {
          authenticated: true,
          role: activeRole,
          email: activeRole === "teacher" ? "teacher@local" : "student@local"
        }
      }
    }));
  }, role);
}

async function run() {
  const serverSource = fs.readFileSync(path.resolve(__dirname, "..", "server.js"), "utf8");
  const coltSource = fs.readFileSync(path.resolve(__dirname, "..", "launchpad-colt.js"), "utf8");
  assert.match(serverSource, /"\.webm":\s*"video\/webm"/, "The production server must send Colt animations with the video/webm MIME type.");
  assert.match(coltSource, /WELCOME_REACTION_DURATION_MS\s*=\s*10_100/, "The complete ten-second welcome animation must remain visible.");
  assert.match(coltSource, /GREETING_EXCITED_REACTION_DURATION_MS\s*=\s*6_100/, "The complete greeting and excited animation must remain visible.");
  assert.match(coltSource, /FEEDING_REACTION_DURATION_MS\s*=\s*6_200/, "The complete feeding animation must remain visible.");
  assert.match(coltSource, /PETTING_REACTION_DURATION_MS\s*=\s*6_200/, "The complete petting animation must remain visible.");
  assert.match(coltSource, /RADIO_MESSAGE_DURATION_MS\s*=\s*4_200/, "The radio announcement must have a short display time.");
  assert.match(coltSource, /RADIO_DANCE_READY_TIMEOUT_MS\s*=\s*2_500/, "The alternate dance must have a buffering fallback.");
  assert.match(coltSource, /addEventListener\("stalled", \(\) => recoverStalledRadioDance\(video\)\)/, "A stalled dance must recover instead of freezing.");
  assert.match(coltSource, /target\.addEventListener\("canplay", activate, \{ once: true \}\)/, "Dance switching must wait for the next video to be playable.");
  assert.match(coltSource, /react\("radio", showMessage \? "Now playing—enjoy the music!" : "", 0\)/, "The radio dance must not have a short reaction timer.");
  assert.match(coltSource, /sleepButton\.textContent = prefs\.asleep \? "Wake Colt Up" : "Put Colt to Sleep"/, "The sleep control must switch to a wake control.");
  assert.match(coltSource, /if \(prefs\.asleep \|\| radioPlaybackActive\) return;[\s\S]*?if \(currentState === "sleep"\) welcome\("I'm awake—what are we doing next\?"\);[\s\S]*?60000/, "The automatic nap must remain activity-based and stay disabled during radio playback.");
  assert.match(coltSource, /if \(prefs\.asleep \|\| radioPlaybackActive\) return;/, "Automatic sleep must stay disabled while Colt Radio is playing.");
  assert.match(coltSource, /addEventListener\("colt-radio-playback"/, "The Colt must follow Colt Radio playback state.");
  ["companion"].forEach(pose => {
    const filename = pose === "companion" ? "launchpad-colt-companion.png" : `launchpad-colt-${pose}.png`;
    assert(fs.existsSync(path.resolve(__dirname, "..", "assets", filename)), `Missing ${pose} pose artwork.`);
  });
  ["launchpad-colt-idle.webm", "launchpad-colt-welcome.webm", "launchpad-colt-sleeping.webm", "launchpad-colt-pointing-transparent.webm", "launchpad-colt-radio-dance.webm", "launchpad-colt-radio-dance-alternate.webm", "launchpad-colt-greeting-excited.webm", "launchpad-colt-feeding.webm", "launchpad-colt-petting.webm"].forEach(filename => {
    assert(fs.existsSync(path.resolve(__dirname, "..", "assets", filename)), `Missing ${filename}.`);
  });
  assert(fs.existsSync(path.resolve(__dirname, "..", "assets", "launchpad-colt-nameplate.png")), "Missing the custom Colt nameplate artwork.");
  ["launchpad-colt-radio-dance.webm", "launchpad-colt-radio-dance-alternate.webm"].forEach(filename => {
    const size = fs.statSync(path.resolve(__dirname, "..", "assets", filename)).size;
    assert(size < 3_500_000, `${filename} is too large for reliable playback on school laptops (${size} bytes).`);
  });
  ["launchpad-colt-pointing.png", "launchpad-colt-pointing.webm", "launchpad-colt-pointing.mp4", "launchpad-colt-greeting.png", "launchpad-colt-excited.png"].forEach(filename => {
    assert(!fs.existsSync(path.resolve(__dirname, "..", "assets", filename)), `Obsolete static/fallback pointing asset still exists: ${filename}`);
  });
  assert(!fs.existsSync(path.resolve(__dirname, "..", "assets", "launchpad-colt-sleeping.png")), "The obsolete static sleeping poster still exists.");
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--allow-file-access-from-files"]
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.addInitScript(() => {
      const nativeFetch = window.fetch.bind(window);
      let customization = { name: "Colt" };
      window.fetch = async (input, init = {}) => {
        const url = String(input);
        if (url.includes("/api/launchpad-colt/customization")) {
          if (String(init.method || "GET").toUpperCase() === "PUT") {
            customization = JSON.parse(init.body || "{}");
            window.__savedColtCustomization = customization;
          }
          return new Response(JSON.stringify({ ok: true, customization }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        }
        return nativeFetch(input, init);
      };
    });
    const indexUrl = pathToFileURL(path.resolve(__dirname, "..", "index.html")).href;
    await page.goto(indexUrl, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".launchpad-colt-character", { state: "attached" });
    await page.waitForSelector(".colt-radio-launcher:visible");
    await authenticate(page);
    await page.waitForSelector(".launchpad-colt-character:visible");

    const image = page.locator('.launchpad-colt-character video[data-pose="idle"]');
    assert.match(await image.getAttribute("src"), /launchpad-colt-idle\.webm/);
    assert.match(await image.getAttribute("poster"), /launchpad-colt-companion\.png/);
    assert.equal(await page.locator(".launchpad-colt-pose").count(), 9);
    const welcomeVideo = page.locator('.launchpad-colt-pose[data-pose="welcome"]');
    assert.equal(await welcomeVideo.evaluate(element => element.tagName), "VIDEO");
    assert.match(await welcomeVideo.getAttribute("src"), /launchpad-colt-welcome\.webm/);
    assert.equal(await welcomeVideo.getAttribute("poster"), null);
    const pointingVideo = page.locator('.launchpad-colt-pose[data-pose="pointing"]');
    assert.equal(await pointingVideo.evaluate(element => element.tagName), "VIDEO");
    assert.match(await pointingVideo.getAttribute("src"), /launchpad-colt-pointing-transparent\.webm/);
    assert.equal(await pointingVideo.getAttribute("poster"), null);
    assert.equal(await page.locator('img[src*="launchpad-colt-pointing"]').count(), 0, "A static pointing image must never be rendered.");
    const radioDanceVideo = page.locator('.launchpad-colt-pose[data-pose="radioDance"]');
    assert.equal(await radioDanceVideo.evaluate(element => element.tagName), "VIDEO");
    assert.match(await radioDanceVideo.getAttribute("src"), /launchpad-colt-radio-dance\.webm/);
    const alternateRadioDanceVideo = page.locator('.launchpad-colt-pose[data-pose="radioDanceAlternate"]');
    assert.equal(await alternateRadioDanceVideo.evaluate(element => element.tagName), "VIDEO");
    assert.match(await alternateRadioDanceVideo.getAttribute("src"), /launchpad-colt-radio-dance-alternate\.webm/);
    assert.equal(await alternateRadioDanceVideo.getAttribute("loop"), null);
    const alternateDanceCornerAlpha = await alternateRadioDanceVideo.evaluate(async element => {
      await new Promise(resolve => {
        if (element.readyState >= 2) resolve();
        else element.addEventListener("loadeddata", resolve, { once: true });
      });
      element.currentTime = 1;
      await new Promise(resolve => element.addEventListener("seeked", resolve, { once: true }));
      const canvas = document.createElement("canvas");
      canvas.width = element.videoWidth;
      canvas.height = element.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(element, 0, 0);
      return context.getImageData(0, 0, 1, 1).data[3];
    });
    assert(alternateDanceCornerAlpha < 8, `The second radio dance still has a visible green-screen background (corner alpha: ${alternateDanceCornerAlpha}).`);
    assert.equal(await alternateRadioDanceVideo.evaluate(element => element.videoWidth), 480, "The second dance was not optimized for the pet's display size.");
    assert.equal(await page.locator('.launchpad-colt-pose[data-pose="dancing"]').count(), 0, "The old static radio-dance pose must not render.");
    await page.waitForSelector('.launchpad-colt-companion[data-state="welcome"]');
    await page.waitForTimeout(180);
    assert.equal(await welcomeVideo.evaluate(element => getComputedStyle(element).opacity), "1");
    assert.equal(await pointingVideo.evaluate(element => getComputedStyle(element).opacity), "0");
    assert.equal(await welcomeVideo.evaluate(element => element.paused), false);
    const welcomeCornerAlpha = await welcomeVideo.evaluate(async element => {
      element.currentTime = 3;
      await new Promise(resolve => element.addEventListener("seeked", resolve, { once: true }));
      const canvas = document.createElement("canvas");
      canvas.width = element.videoWidth;
      canvas.height = element.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(element, 0, 0);
      return context.getImageData(0, 0, 1, 1).data[3];
    });
    assert(welcomeCornerAlpha < 8, `The welcome animation background is not transparent (corner alpha: ${welcomeCornerAlpha}).`);
    assert.equal(await image.getAttribute("muted"), "");
    assert.equal(await image.getAttribute("loop"), "");
    await page.evaluate(() => {
      const target = document.createElement("button");
      target.dataset.action = "homeNavigate";
      target.dataset.target = "home-launch";
      document.body.append(target);
      target.click();
      target.remove();
    });
    await pointingVideo.evaluate(element => new Promise(resolve => {
      if (element.readyState >= 3) resolve();
      else element.addEventListener("canplay", resolve, { once: true });
    }));
    const pointingTime = await pointingVideo.evaluate(element => element.currentTime);
    await page.waitForTimeout(350);
    assert.equal(await pointingVideo.evaluate(element => element.paused), false);
    assert((await pointingVideo.evaluate(element => element.currentTime)) > pointingTime);
    const cornerAlpha = await pointingVideo.evaluate(async element => {
      element.currentTime = 3;
      await new Promise(resolve => element.addEventListener("seeked", resolve, { once: true }));
      const canvas = document.createElement("canvas");
      canvas.width = element.videoWidth;
      canvas.height = element.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(element, 0, 0);
      return context.getImageData(0, 0, 1, 1).data[3];
    });
    assert(cornerAlpha < 8, `The pointing animation background is not transparent (corner alpha: ${cornerAlpha}).`);
    const greetingExcitedVideo = page.locator('.launchpad-colt-pose[data-pose="greetingExcited"]');
    assert.equal(await greetingExcitedVideo.evaluate(element => element.tagName), "VIDEO");
    assert.match(await greetingExcitedVideo.getAttribute("src"), /launchpad-colt-greeting-excited\.webm/);
    assert.equal(await page.locator('.launchpad-colt-pose[data-pose="greeting"], .launchpad-colt-pose[data-pose="excited"]').count(), 0);
    await page.evaluate(() => {
      const target = document.createElement("button");
      target.dataset.action = "openGoogleApp";
      target.dataset.url = "https://classroom.google.com/";
      document.body.append(target);
      target.click();
      target.remove();
    });
    await greetingExcitedVideo.evaluate(element => new Promise(resolve => {
      if (element.readyState >= 3) resolve();
      else element.addEventListener("canplay", resolve, { once: true });
    }));
    assert.equal(await greetingExcitedVideo.evaluate(element => getComputedStyle(element).opacity), "1");
    const greetingStart = await greetingExcitedVideo.evaluate(element => element.currentTime);
    await page.waitForTimeout(350);
    assert.equal(await greetingExcitedVideo.evaluate(element => element.paused), false);
    assert((await greetingExcitedVideo.evaluate(element => element.currentTime)) > greetingStart);
    const greetingCornerAlpha = await greetingExcitedVideo.evaluate(async element => {
      element.currentTime = 2;
      await new Promise(resolve => element.addEventListener("seeked", resolve, { once: true }));
      const canvas = document.createElement("canvas");
      canvas.width = element.videoWidth;
      canvas.height = element.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(element, 0, 0);
      return context.getImageData(0, 0, 1, 1).data[3];
    });
    assert(greetingCornerAlpha < 8, `The greeting/excited animation background is not transparent (corner alpha: ${greetingCornerAlpha}).`);
    await page.evaluate(() => {
      const target = document.createElement("button");
      target.dataset.action = "openMessages";
      document.body.append(target);
      target.click();
      target.remove();
    });
    assert.equal(await page.locator(".launchpad-colt-companion").getAttribute("data-state"), "message");
    assert.equal(await greetingExcitedVideo.evaluate(element => getComputedStyle(element).opacity), "1");
    assert.match(await greetingExcitedVideo.evaluate(element => getComputedStyle(element).animationName), /launchpad-colt-hop/);

    await page.locator(".launchpad-colt-character").click();
    assert(await page.getByRole("button", { name: "Minimize", exact: true }).isVisible());
    assert(await page.getByRole("button", { name: "Pause motion", exact: true }).isVisible());
    assert(await page.getByRole("button", { name: "Reset position", exact: true }).isVisible());
    assert(await page.getByRole("button", { name: "Size: Medium", exact: true }).isVisible());
    assert(await page.getByRole("button", { name: "Put Colt to Sleep", exact: true }).isVisible());
    assert(await page.getByRole("button", { name: "Feed Me", exact: true }).isVisible());
    assert(await page.getByRole("button", { name: "Name Your Colt", exact: true }).isVisible());
    await page.getByRole("button", { name: "Name Your Colt", exact: true }).click();
    await page.waitForSelector(".launchpad-colt-customizer:visible");
    await page.locator("#launchpadColtName").fill("Blaze");
    assert.equal(await page.locator(".launchpad-colt-nameplate-preview strong").textContent(), "Blaze");
    assert.equal(await page.locator("[data-colt-accessory]").count(), 0, "Obsolete accessory choices are still present.");
    await page.getByRole("button", { name: "Save Name", exact: true }).click();
    await page.waitForFunction(() => window.__savedColtCustomization?.name === "Blaze");
    await page.waitForFunction(() => JSON.parse(localStorage.getItem("classroomLaunchpadColtPrefsV1:student@local") || "{}").coltName === "Blaze");
    assert.equal(await page.locator(".launchpad-colt-nameplate strong").textContent(), "Blaze");
    const characterBounds = await page.locator(".launchpad-colt-character").boundingBox();
    const nameplateBounds = await page.locator(".launchpad-colt-nameplate").boundingBox();
    assert(Math.abs((nameplateBounds.width / nameplateBounds.height) - 3) < 0.08, "The custom nameplate artwork is distorted.");
    assert(nameplateBounds.width <= characterBounds.width * 1.08, "The custom nameplate is too wide for the Colt.");
    assert(Math.abs((nameplateBounds.x + nameplateBounds.width / 2) - (characterBounds.x + characterBounds.width / 2)) < 3, "The custom nameplate is not centered under the Colt.");
    const savedColtPreferences = await page.evaluate(() => Object.fromEntries(
      Object.keys(localStorage)
        .filter(key => key.startsWith("classroomLaunchpadColtPrefsV1:"))
        .map(key => [key, JSON.parse(localStorage.getItem(key) || "{}")])
    ));
    assert.equal(savedColtPreferences["classroomLaunchpadColtPrefsV1:student@local"]?.coltName, "Blaze", JSON.stringify(savedColtPreferences));
    await page.getByRole("button", { name: "Close Colt naming panel", exact: true }).click();
    assert.equal(await page.locator(".launchpad-colt-customizer").isHidden(), true);
    await page.locator(".launchpad-colt-character").click();
    await page.getByRole("button", { name: "Feed Me", exact: true }).click();
    const feedingVideo = page.locator('.launchpad-colt-pose[data-pose="feeding"]');
    assert.equal(await page.locator(".launchpad-colt-companion").getAttribute("data-state"), "feeding");
    assert.match(await feedingVideo.getAttribute("src"), /launchpad-colt-feeding\.webm/);
    assert.equal(await feedingVideo.getAttribute("muted"), "");
    assert.equal(await feedingVideo.getAttribute("loop"), null, "The feeding animation must play once rather than loop.");
    await feedingVideo.evaluate(element => new Promise(resolve => {
      if (element.readyState >= 3) resolve();
      else element.addEventListener("canplay", resolve, { once: true });
    }));
    assert.equal(await feedingVideo.evaluate(element => getComputedStyle(element).opacity), "1");
    const feedingCornerAlpha = await feedingVideo.evaluate(async element => {
      element.currentTime = 2;
      await new Promise(resolve => element.addEventListener("seeked", resolve, { once: true }));
      const canvas = document.createElement("canvas");
      canvas.width = element.videoWidth;
      canvas.height = element.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(element, 0, 0);
      return context.getImageData(0, 0, 1, 1).data[3];
    });
    assert(feedingCornerAlpha < 8, `The feeding animation background is not transparent (corner alpha: ${feedingCornerAlpha}).`);
    await feedingVideo.dispatchEvent("ended");
    assert.equal(await page.locator(".launchpad-colt-companion").getAttribute("data-state"), "idle", "The Colt did not return to idle after feeding.");
    assert.equal(await page.locator(".launchpad-colt-nameplate strong").textContent(), "Blaze", "The saved nameplate disappeared during a Colt animation.");
    await page.locator(".launchpad-colt-character").click();
    assert(await page.getByRole("button", { name: "Pet Me", exact: true }).isVisible());
    await page.getByRole("button", { name: "Pet Me", exact: true }).click();
    const pettingVideo = page.locator('.launchpad-colt-pose[data-pose="petting"]');
    assert.equal(await page.locator(".launchpad-colt-companion").getAttribute("data-state"), "petting");
    assert.match(await pettingVideo.getAttribute("src"), /launchpad-colt-petting\.webm/);
    assert.equal(await pettingVideo.getAttribute("muted"), "");
    assert.equal(await pettingVideo.getAttribute("loop"), null, "The petting animation must play once rather than loop.");
    await pettingVideo.evaluate(element => new Promise(resolve => {
      if (element.readyState >= 3) resolve();
      else element.addEventListener("canplay", resolve, { once: true });
    }));
    assert.equal(await pettingVideo.evaluate(element => getComputedStyle(element).opacity), "1");
    const pettingCornerAlpha = await pettingVideo.evaluate(async element => {
      element.currentTime = 2;
      await new Promise(resolve => element.addEventListener("seeked", resolve, { once: true }));
      const canvas = document.createElement("canvas");
      canvas.width = element.videoWidth;
      canvas.height = element.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(element, 0, 0);
      return context.getImageData(0, 0, 1, 1).data[3];
    });
    assert(pettingCornerAlpha < 8, `The petting animation background is not transparent (corner alpha: ${pettingCornerAlpha}).`);
    await pettingVideo.dispatchEvent("ended");
    assert.equal(await page.locator(".launchpad-colt-companion").getAttribute("data-state"), "idle", "The Colt did not return to idle after petting.");
    await page.locator(".launchpad-colt-character").click();
    await page.getByRole("button", { name: "Size: Medium", exact: true }).click();
    assert.equal(await page.locator("#launchpadColtRoot").getAttribute("data-size"), "large");
    await page.getByRole("button", { name: "Size: Large", exact: true }).click();
    assert.equal(await page.locator("#launchpadColtRoot").getAttribute("data-size"), "extra-large");
    assert(await page.getByRole("button", { name: "Size: Extra Large", exact: true }).isVisible());
    assert((await page.locator(".launchpad-colt-character").boundingBox()).width >= 200);
    assert(await page.getByRole("button", { name: "Hide Colt", exact: true }).isVisible());
    await page.getByRole("button", { name: "Put Colt to Sleep", exact: true }).click();
    assert.equal(await page.locator(".launchpad-colt-companion").getAttribute("data-state"), "sleep");
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("classroomLaunchpadColtPrefsV1:student@local") || "{}").asleep), true);
    const sleepingImage = page.locator('.launchpad-colt-pose[data-pose="sleeping"]');
    assert.equal(await sleepingImage.evaluate(element => element.tagName), "VIDEO");
    assert.match(await sleepingImage.getAttribute("src"), /launchpad-colt-sleeping\.webm/);
    assert.equal(await sleepingImage.getAttribute("poster"), null);
    const sleepingCornerAlpha = await sleepingImage.evaluate(async element => {
      element.currentTime = 3;
      await new Promise(resolve => element.addEventListener("seeked", resolve, { once: true }));
      const canvas = document.createElement("canvas");
      canvas.width = element.videoWidth;
      canvas.height = element.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(element, 0, 0);
      return context.getImageData(0, 0, 1, 1).data[3];
    });
    assert(sleepingCornerAlpha < 8, `The sleeping animation background is not transparent (corner alpha: ${sleepingCornerAlpha}).`);
    assert.equal(await sleepingImage.evaluate(element => element.videoWidth), 940);
    assert.equal(await sleepingImage.evaluate(element => element.videoHeight), 820);
    await sleepingImage.evaluate(element => { element.style.transition = "none"; });
    assert.equal(await sleepingImage.evaluate(element => getComputedStyle(element).opacity), "1");
    assert.match(await sleepingImage.evaluate(element => getComputedStyle(element).animationName), /launchpad-colt-sleep-breathe/);
    await page.keyboard.press("A");
    await page.waitForTimeout(120);
    assert.equal(await page.locator(".launchpad-colt-companion").getAttribute("data-state"), "sleep", "Keyboard activity woke a manually sleeping Colt.");
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("colt-radio-opened")));
    await page.waitForTimeout(120);
    assert.equal(await page.locator(".launchpad-colt-companion").getAttribute("data-state"), "sleep", "Opening Colt Radio woke a manually sleeping Colt.");
    await page.locator(".launchpad-colt-character").click();
    assert(await page.getByRole("button", { name: "Wake Colt Up", exact: true }).isVisible());
    await page.getByRole("button", { name: "Wake Colt Up", exact: true }).click();
    assert.notEqual(await page.locator(".launchpad-colt-companion").getAttribute("data-state"), "sleep");
    await page.locator(".launchpad-colt-character").click();
    assert(await page.getByRole("button", { name: "Put Colt to Sleep", exact: true }).isVisible());
    assert(await page.getByRole("button", { name: "Minimize", exact: true }).isVisible());
    await page.getByRole("button", { name: "Minimize", exact: true }).click();
    assert(await page.locator("#launchpadColtRoot").evaluate(element => element.classList.contains("is-minimized")));
    const minimizedBeforeDrag = await page.locator("#launchpadColtRoot").boundingBox();
    await page.mouse.move(minimizedBeforeDrag.x + 32, minimizedBeforeDrag.y + 32);
    await page.mouse.down();
    await page.mouse.move(minimizedBeforeDrag.x - 85, minimizedBeforeDrag.y + 45, { steps: 7 });
    await page.mouse.up();
    const minimizedAfterDrag = await page.locator("#launchpadColtRoot").boundingBox();
    assert(Math.abs(minimizedAfterDrag.x - minimizedBeforeDrag.x) > 30, "The minimized Colt icon could not be dragged.");
    assert(await page.locator("#launchpadColtRoot").evaluate(element => element.classList.contains("is-minimized")));
    await page.locator(".launchpad-colt-character").click();
    assert(await page.getByRole("button", { name: "Make larger", exact: true }).isVisible());
    assert(await page.getByRole("button", { name: "Hide Colt", exact: true }).isVisible());
    await page.getByRole("button", { name: "Make larger", exact: true }).click();
    assert(!(await page.locator("#launchpadColtRoot").evaluate(element => element.classList.contains("is-minimized"))));

    const beforeDrag = await page.locator("#launchpadColtRoot").boundingBox();
    await page.mouse.move(beforeDrag.x + 80, beforeDrag.y + 70);
    await page.mouse.down();
    await page.mouse.move(beforeDrag.x - 130, beforeDrag.y + 90, { steps: 8 });
    await page.mouse.up();
    assert(await page.locator("#launchpadColtRoot").evaluate(element => element.classList.contains("is-user-positioned")));
    assert.equal(await page.locator(".launchpad-colt-companion").getAttribute("data-state"), "move");
    await page.waitForTimeout(180);
    assert.equal(await pointingVideo.evaluate(element => getComputedStyle(element).opacity), "1");
    assert.equal(await greetingExcitedVideo.evaluate(element => getComputedStyle(element).opacity), "0");
    assert.equal(await pointingVideo.evaluate(element => element.paused), false);
    assert(await page.evaluate(() => {
      const raw = localStorage.getItem("classroomLaunchpadColtPrefsV1:student@local");
      const stored = raw ? JSON.parse(raw) : {};
      return Number.isFinite(stored.position && stored.position.x) && Number.isFinite(stored.position && stored.position.y);
    }));
    const afterFirstDrag = await page.locator("#launchpadColtRoot").boundingBox();
    await page.mouse.move(afterFirstDrag.x + 70, afterFirstDrag.y + 65);
    await page.mouse.down();
    await page.mouse.move(afterFirstDrag.x + 145, afterFirstDrag.y + 20, { steps: 7 });
    await page.mouse.up();
    const afterSecondDrag = await page.locator("#launchpadColtRoot").boundingBox();
    assert(Math.abs(afterSecondDrag.x - afterFirstDrag.x) > 30, "The Colt could not be immediately dragged a second time.");

    await page.locator(".launchpad-colt-character").click();
    await page.getByRole("button", { name: "Hide Colt", exact: true }).click();
    await page.waitForSelector(".launchpad-colt-restore:visible");
    const hiddenBeforeDrag = await page.locator("#launchpadColtRoot").boundingBox();
    const restoreBox = await page.locator(".launchpad-colt-restore").boundingBox();
    await page.mouse.move(restoreBox.x + 27, restoreBox.y + 27);
    await page.mouse.down();
    await page.mouse.move(restoreBox.x - 80, restoreBox.y - 35, { steps: 7 });
    await page.mouse.up();
    const hiddenAfterDrag = await page.locator("#launchpadColtRoot").boundingBox();
    assert(Math.abs(hiddenAfterDrag.x - hiddenBeforeDrag.x) > 30, "The hidden Colt restore icon could not be dragged.");
    await page.locator(".launchpad-colt-restore").click();
    await page.waitForSelector(".launchpad-colt-character:visible");

    await page.evaluate(() => window.dispatchEvent(new CustomEvent("colt-radio-playback", { detail: { playing: true, station: "test" } })));
    await page.waitForTimeout(180);
    await page.locator(".launchpad-colt-character").click();
    assert(await page.getByRole("button", { name: "Put Colt to Sleep", exact: true }).isEnabled(), "Manual sleep was disabled during music playback.");
    await page.getByRole("button", { name: "Put Colt to Sleep", exact: true }).click();
    assert.equal(await page.locator(".launchpad-colt-companion").getAttribute("data-state"), "sleep", "Manual sleep did not override radio dancing.");
    await page.locator(".launchpad-colt-character").click();
    await page.getByRole("button", { name: "Wake Colt Up", exact: true }).click();
    await page.waitForTimeout(120);
    assert.equal(await page.locator(".launchpad-colt-companion").getAttribute("data-state"), "radio", "The Colt did not resume dancing after a manual wake-up.");
    const radioDragStart = await page.locator("#launchpadColtRoot").boundingBox();
    await page.mouse.move(radioDragStart.x + 70, radioDragStart.y + 65);
    await page.mouse.down();
    await page.mouse.move(radioDragStart.x - 80, radioDragStart.y + 30, { steps: 7 });
    await page.mouse.up();
    assert.equal(await page.locator(".launchpad-colt-companion").getAttribute("data-state"), "move", "Moving Colt did not show the new-spot reaction during radio playback.");
    await page.waitForTimeout(2400);
    assert.equal(await page.locator(".launchpad-colt-companion").getAttribute("data-state"), "radio", "Colt did not resume dancing after the new-spot reaction.");
    await page.waitForTimeout(2200);
    assert.equal(await page.locator(".launchpad-colt-companion").getAttribute("data-state"), "radio", "The Colt radio dance stopped while playback was still active.");
    assert.equal(await radioDanceVideo.evaluate(element => element.paused), false, "The Colt radio dance video is not playing.");
    await radioDanceVideo.evaluate(element => element.dispatchEvent(new Event("ended")));
    await page.waitForTimeout(120);
    assert.equal(await radioDanceVideo.evaluate(element => element.paused), true, "The first dance kept playing after it ended.");
    assert.equal(await alternateRadioDanceVideo.evaluate(element => element.paused), false, "The second dance did not start after the first dance ended.");
    assert.equal(await alternateRadioDanceVideo.evaluate(element => getComputedStyle(element).opacity), "1", "The second dance is not visible.");
    await alternateRadioDanceVideo.evaluate(element => element.dispatchEvent(new Event("ended")));
    await page.waitForTimeout(120);
    assert.equal(await radioDanceVideo.evaluate(element => element.paused), false, "The first dance did not resume after the second dance ended.");
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("colt-radio-playback", { detail: { playing: false } })));
    await page.waitForTimeout(150);
    assert.equal(await page.locator(".launchpad-colt-companion").getAttribute("data-state"), "idle", "The Colt did not stop dancing when radio playback paused.");

    await page.locator(".colt-radio-launcher").click();
    await page.waitForSelector(".colt-radio-panel:visible");
    assert(await page.locator("#launchpadColtRoot").evaluate(element => element.classList.contains("is-radio-panel-open")));
    assert.equal(await page.locator("#launchpadColtRoot").evaluate(element => element.classList.contains("is-panel-open")), false, "Opening Colt Radio still hides the pet as a blocked panel.");
    assert.equal(await page.locator(".launchpad-colt-companion").getAttribute("data-state"), "idle", "The Colt is not idle before radio playback starts.");
    assert.equal(await page.locator("#launchpadColtRoot").evaluate(element => getComputedStyle(element).opacity), "1", "The idle Colt disappeared when Colt Radio opened.");
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("colt-radio-playback", { detail: { playing: true, station: "test" } })));
    await page.waitForTimeout(180);
    assert.equal(await page.locator(".launchpad-colt-companion").getAttribute("data-state"), "radio");
    assert.equal(await page.locator(".launchpad-colt-speech span").textContent(), "Now playing—enjoy the music!");
    assert.equal(await page.locator("#launchpadColtRoot").evaluate(element => getComputedStyle(element).opacity), "1", "The dancing Colt disappeared while the radio panel was open.");
    await page.waitForTimeout(4300);
    assert.equal(await page.locator(".launchpad-colt-speech").isHidden(), true, "The now-playing announcement did not disappear.");
    assert.equal(await page.locator(".launchpad-colt-companion").getAttribute("data-state"), "radio", "Hiding the announcement stopped the radio dance.");
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("colt-radio-playback", { detail: { playing: false } })));
    await page.waitForTimeout(120);
    assert.equal(await page.locator(".launchpad-colt-companion").getAttribute("data-state"), "idle", "The Colt did not return to idle when radio playback stopped.");

    await page.getByRole("button", { name: "Minimize Colt Radio", exact: true }).click();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.dispatchEvent(new Event("resize")));
    assert(await page.locator("#launchpadColtRoot").evaluate(element => element.classList.contains("is-auto-compact")));
    await page.locator(".launchpad-colt-character").click();
    await page.getByRole("button", { name: "Name Your Colt", exact: true }).click();
    const mobileCustomizer = await page.locator(".launchpad-colt-customizer").boundingBox();
    assert(mobileCustomizer.x >= 0 && mobileCustomizer.x + mobileCustomizer.width <= 390, "The Colt customizer overflows the mobile viewport.");
    assert(mobileCustomizer.y >= 0 && mobileCustomizer.y + mobileCustomizer.height <= 844, "The Colt customizer is not vertically contained on mobile.");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  } finally {
    await browser.close();
  }
  console.log("Launchpad Colt UI verification passed.");
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
