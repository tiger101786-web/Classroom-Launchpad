"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");

function availablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
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
  throw new Error("Test server did not start.");
}

async function verifyTransparentVideo(page, filename) {
  return page.evaluate(name => new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.src = `/assets/${name}`;
    video.addEventListener("error", () => reject(new Error(`Could not load ${name}`)), { once: true });
    video.addEventListener("loadeddata", () => {
      video.currentTime = Math.min(2, Math.max(0, video.duration - 0.1));
    }, { once: true });
    video.addEventListener("seeked", () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0);
      const corners = [
        context.getImageData(0, 0, 1, 1).data[3],
        context.getImageData(canvas.width - 1, 0, 1, 1).data[3],
        context.getImageData(0, canvas.height - 1, 1, 1).data[3],
        context.getImageData(canvas.width - 1, canvas.height - 1, 1, 1).data[3]
      ];
      resolve({ width: canvas.width, height: canvas.height, maxCornerAlpha: Math.max(...corners) });
    }, { once: true });
  }), filename);
}

async function run() {
  const port = await availablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "mrs-trittel-ui-"));
  const child = spawn(process.execPath, [path.join(root, "server.js")], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      DATA_DIR: dataDir,
      SESSION_SECRET: "mrs-trittel-playable-ui-test-secret",
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
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.addInitScript(() => {
      window.__mrsTrittelDraws = [];
      const originalDrawImage = CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage = function(source, ...args) {
        const mediaSource = source?.currentSrc || source?.src || source?.dataset?.src || "";
        if (mediaSource.includes("colt-run-mrs-trittel") && window.__mrsTrittelDraws.length < 2000) {
          window.__mrsTrittelDraws.push(mediaSource);
        }
        return originalDrawImage.call(this, source, ...args);
      };
    });
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.locator('[data-action="category"][data-category="Logic Games"]').first().click();
    await page.locator('[data-action="openColtRun"]').first().click();

    const card = page.locator('[data-character="mrsTrittel"]');
    await card.waitFor();
    assert.equal(await card.isDisabled(), false, "Mrs. Trittel is disabled.");
    assert.equal(await card.getAttribute("data-colt-run"), "character");
    assert.doesNotMatch((await card.innerText()).toLowerCase(), /coming soon/);

    for (const filename of ["colt-run-mrs-trittel-run.webm", "colt-run-mrs-trittel-jump.webm", "colt-run-mrs-trittel-death.webm"]) {
      const media = await verifyTransparentVideo(page, filename);
      assert.deepEqual({ width: media.width, height: media.height }, { width: 576, height: 876 });
      assert(media.maxCornerAlpha <= 8, `${filename} still has an opaque green-screen corner.`);
    }

    await card.click();
    assert.match(await page.locator("#coltRunStatus").innerText(), /Mrs\. Trittel selected/);
    await page.evaluate(() => { window.__mrsTrittelDraws = []; });
    await page.keyboard.down("ArrowRight");
    await page.waitForFunction(() => window.__mrsTrittelDraws.some(source => source.includes("mrs-trittel-run.webm")), null, { timeout: 5000 });
    await page.keyboard.up("ArrowRight");
    await page.evaluate(() => { window.__mrsTrittelDraws = []; });
    await page.keyboard.down("Space");
    await page.waitForFunction(() => window.__mrsTrittelDraws.some(source => source.includes("mrs-trittel-jump.webm")), null, { timeout: 5000 });
    await page.keyboard.up("Space");
    await page.screenshot({ path: path.join(dataDir, "mrs-trittel-playable-ui.png"), fullPage: true });
    console.log("Mrs. Trittel playable UI verification passed.");
  } finally {
    await browser.close();
    child.kill();
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
