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
  assert.match(serverSource, /"\.webm":\s*"video\/webm"/, "The production server must send Colt animations with the video/webm MIME type.");
  ["companion", "greeting", "excited", "dancing", "sleeping"].forEach(pose => {
    const filename = pose === "companion" ? "launchpad-colt-companion.png" : `launchpad-colt-${pose}.png`;
    assert(fs.existsSync(path.resolve(__dirname, "..", "assets", filename)), `Missing ${pose} pose artwork.`);
  });
  ["launchpad-colt-idle.webm", "launchpad-colt-sleeping.webm", "launchpad-colt-pointing.mp4"].forEach(filename => {
    assert(fs.existsSync(path.resolve(__dirname, "..", "assets", filename)), `Missing ${filename}.`);
  });
  ["launchpad-colt-pointing.png", "launchpad-colt-pointing.webm"].forEach(filename => {
    assert(!fs.existsSync(path.resolve(__dirname, "..", "assets", filename)), `Obsolete static/fallback pointing asset still exists: ${filename}`);
  });
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const indexUrl = pathToFileURL(path.resolve(__dirname, "..", "index.html")).href;
    await page.goto(indexUrl, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".launchpad-colt-character", { state: "attached" });
    await page.waitForSelector(".colt-radio-launcher:visible");
    await authenticate(page);
    await page.waitForSelector(".launchpad-colt-character:visible");

    const image = page.locator('.launchpad-colt-character video[data-pose="idle"]');
    assert.match(await image.getAttribute("src"), /launchpad-colt-idle\.webm/);
    assert.match(await image.getAttribute("poster"), /launchpad-colt-companion\.png/);
    assert.equal(await page.locator(".launchpad-colt-pose").count(), 6);
    const pointingVideo = page.locator('.launchpad-colt-pose[data-pose="pointing"]');
    assert.equal(await pointingVideo.evaluate(element => element.tagName), "VIDEO");
    assert.match(await pointingVideo.getAttribute("src"), /launchpad-colt-pointing\.mp4/);
    assert.equal(await pointingVideo.getAttribute("poster"), null);
    assert.equal(await page.locator('img[src*="launchpad-colt-pointing"]').count(), 0, "A static pointing image must never be rendered.");
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
    const greetingImage = page.locator('.launchpad-colt-pose[data-pose="greeting"]');
    await greetingImage.evaluate(element => {
      element.style.transition = "none";
      element.closest(".launchpad-colt-companion").dataset.state = "welcome";
    });
    assert.equal(await greetingImage.evaluate(element => getComputedStyle(element).opacity), "1");
    assert.match(await greetingImage.evaluate(element => getComputedStyle(element).animationName), /launchpad-colt-greeting/);

    await page.locator(".launchpad-colt-character").click();
    assert(await page.getByRole("button", { name: "Minimize", exact: true }).isVisible());
    assert(await page.getByRole("button", { name: "Pause motion", exact: true }).isVisible());
    assert(await page.getByRole("button", { name: "Reset position", exact: true }).isVisible());
    assert(await page.getByRole("button", { name: "Size: Medium", exact: true }).isVisible());
    assert(await page.getByRole("button", { name: "Put Colt to Sleep", exact: true }).isVisible());
    await page.getByRole("button", { name: "Size: Medium", exact: true }).click();
    assert.equal(await page.locator("#launchpadColtRoot").getAttribute("data-size"), "large");
    await page.getByRole("button", { name: "Size: Large", exact: true }).click();
    assert.equal(await page.locator("#launchpadColtRoot").getAttribute("data-size"), "extra-large");
    assert(await page.getByRole("button", { name: "Size: Extra Large", exact: true }).isVisible());
    assert((await page.locator(".launchpad-colt-character").boundingBox()).width >= 200);
    assert(await page.getByRole("button", { name: "Hide Colt", exact: true }).isVisible());
    await page.getByRole("button", { name: "Put Colt to Sleep", exact: true }).click();
    assert.equal(await page.locator(".launchpad-colt-companion").getAttribute("data-state"), "sleep");
    const sleepingImage = page.locator('.launchpad-colt-pose[data-pose="sleeping"]');
    assert.equal(await sleepingImage.evaluate(element => element.tagName), "VIDEO");
    assert.match(await sleepingImage.getAttribute("src"), /launchpad-colt-sleeping\.webm/);
    await sleepingImage.evaluate(element => { element.style.transition = "none"; });
    assert.equal(await sleepingImage.evaluate(element => getComputedStyle(element).opacity), "1");
    assert.match(await sleepingImage.evaluate(element => getComputedStyle(element).animationName), /launchpad-colt-sleep-breathe/);
    await page.locator(".launchpad-colt-character").click();
    assert(await page.getByRole("button", { name: "Minimize", exact: true }).isVisible());
    await page.getByRole("button", { name: "Minimize", exact: true }).click();
    assert(await page.locator("#launchpadColtRoot").evaluate(element => element.classList.contains("is-minimized")));

    await page.locator(".launchpad-colt-character").click();
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
    assert.equal(await greetingImage.evaluate(element => getComputedStyle(element).opacity), "0");
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

    await page.locator(".colt-radio-launcher").click();
    await page.waitForSelector(".colt-radio-panel:visible");
    assert(await page.locator("#launchpadColtRoot").evaluate(element => element.classList.contains("is-panel-open")));

    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.dispatchEvent(new Event("resize")));
    assert(await page.locator("#launchpadColtRoot").evaluate(element => element.classList.contains("is-auto-compact")));
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
