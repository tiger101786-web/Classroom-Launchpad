"use strict";

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
  throw new Error("Colt Assistant UI test server did not start.");
}

async function run() {
  const root = path.resolve(__dirname, "..");
  const port = await availablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "colt-assistant-ui-"));
  const child = spawn(process.execPath, [path.join(root, "server.js")], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      DATA_DIR: dataDir,
      SESSION_SECRET: "colt-assistant-ui-test-session-secret-that-is-long",
      TEACHER_PIN: "123456",
      NODE_ENV: "test",
      COLT_AI_ENABLED: "true",
      COLT_AI_IMAGE_ENABLED: "true"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
  });

  try {
    await waitForServer(baseUrl);
    const context = await browser.newContext({ viewport: { width: 1280, height: 820 } });
    const login = await context.request.post(`${baseUrl}/api/auth/teacher`, {
      headers: { Origin: baseUrl },
      data: { pin: "123456" }
    });
    assert.equal(login.status(), 200);
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Open Colt Assistant" }).click();
    const panel = page.locator(".colt-assistant-panel");
    await panel.waitFor();

    const visual = await panel.evaluate(element => ({
      width: Math.round(element.getBoundingClientRect().width),
      background: getComputedStyle(element).backgroundColor,
      portrait: element.querySelector(".colt-assistant-heading-mark img")?.getAttribute("src") || "",
      modes: element.querySelectorAll(".colt-assistant-mode").length,
      activeMode: element.querySelector(".colt-assistant-mode.is-active")?.textContent || "",
      footerVisible: element.querySelector(".colt-assistant-footer").getBoundingClientRect().bottom <= element.getBoundingClientRect().bottom + 1
    }));
    assert.equal(visual.width, 440, JSON.stringify(visual));
    assert.equal(visual.background, "rgb(5, 5, 5)", JSON.stringify(visual));
    assert.match(visual.portrait, /colt-radio-header-portrait\.png/, JSON.stringify(visual));
    assert.equal(visual.modes, 3, JSON.stringify(visual));
    assert.equal(visual.activeMode, "Classroom Help", JSON.stringify(visual));
    assert.equal(visual.footerVisible, true, JSON.stringify(visual));

    await page.getByRole("button", { name: "Guided AI", exact: true }).click();
    await page.getByText(/Guided AI helps you think through schoolwork/i).waitFor();
    assert.equal(await page.getByRole("button", { name: "Guided AI", exact: true }).getAttribute("aria-pressed"), "true");
    await page.getByRole("button", { name: "Create Image", exact: true }).click();
    await page.getByText(/Describe a school-appropriate educational image/i).waitFor();
    assert.equal(await page.locator("#coltAssistantInput").getAttribute("placeholder"), "Describe an educational image…");

    if (process.env.COLT_ASSISTANT_SCREENSHOT) {
      await panel.screenshot({ path: process.env.COLT_ASSISTANT_SCREENSHOT });
    }

    await page.setViewportSize({ width: 390, height: 780 });
    const mobileLayout = await panel.evaluate(element => {
      const panelBox = element.getBoundingClientRect();
      const footerBox = element.querySelector(".colt-assistant-footer").getBoundingClientRect();
      return {
        left: panelBox.left,
        right: panelBox.right,
        viewportWidth: window.innerWidth,
        footerBottom: footerBox.bottom,
        panelBottom: panelBox.bottom
      };
    });
    assert(mobileLayout.left >= 0 && mobileLayout.right <= mobileLayout.viewportWidth, JSON.stringify(mobileLayout));
    assert(mobileLayout.footerBottom <= mobileLayout.panelBottom + 1, JSON.stringify(mobileLayout));
    console.log("Colt Assistant crimson UI verification passed.");
  } finally {
    await browser.close();
    child.kill();
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
