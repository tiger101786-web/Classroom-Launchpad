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
      CLOUDFLARE_ACCOUNT_ID: "classroom-test-account",
      CLOUDFLARE_AI_API_TOKEN: "classroom-test-token"
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
    const guidedAnswer = "Start with one small idea and explain it in your own words. Then add one example that shows what you mean. Keep the example connected to the lesson. What idea would you like to explain first?";
    await page.route("**/api/colt-assistant/chat", route => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ answer: guidedAnswer, mode: "guided-learning" })
    }));
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    const launcherStyles = await page.evaluate(() => {
      function snapshot(selector) {
        const element = document.querySelector(selector);
        const mark = element.querySelector(`${selector}-mark`);
        const style = getComputedStyle(element);
        const markStyle = getComputedStyle(mark);
        return {
          backgroundImage: style.backgroundImage,
          borderColor: style.borderColor,
          boxShadow: style.boxShadow,
          markBackground: markStyle.backgroundColor,
          markBorderColor: markStyle.borderColor,
          markColor: markStyle.color,
          markShadow: markStyle.boxShadow
        };
      }
      return {
        assistant: snapshot(".colt-assistant-launcher"),
        radio: snapshot(".colt-radio-launcher")
      };
    });
    assert.deepEqual(launcherStyles.assistant, launcherStyles.radio, JSON.stringify(launcherStyles));
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
    assert.equal(visual.modes, 2, JSON.stringify(visual));
    assert.equal(visual.activeMode, "Guided AI", JSON.stringify(visual));
    assert.equal(visual.footerVisible, true, JSON.stringify(visual));

    assert.deepEqual(
      await page.locator(".colt-assistant-mode").allTextContents(),
      ["Guided AI", "Classroom Help"]
    );
    await page.getByText(/Guided AI helps you think through schoolwork/i).waitFor();
    assert.equal(await page.getByRole("button", { name: "Guided AI", exact: true }).getAttribute("aria-pressed"), "true");
    assert.equal(await page.getByRole("button", { name: "Create Image", exact: true }).count(), 0);
    assert.equal(await page.locator("#coltAssistantInput").getAttribute("placeholder"), "What are you learning?");

    await page.locator("#coltAssistantInput").fill("Help me organize my explanation.");
    await page.locator(".colt-assistant-form button[type='submit']").click();
    const showFull = page.getByRole("button", { name: "Show Full Response", exact: true });
    assert.equal(await showFull.count(), 0);
    await page.waitForTimeout(250);
    const partialText = await page.locator(".colt-assistant-reveal-text").last().innerText();
    assert(partialText.length > 0 && partialText.length < guidedAnswer.length, partialText);
    await page.waitForFunction(answer => {
      const responses = document.querySelectorAll(".colt-assistant-reveal-text");
      return responses.length && responses[responses.length - 1].innerText === answer;
    }, guidedAnswer);
    assert.equal(await page.locator(".colt-assistant-reveal-text").last().innerText(), guidedAnswer);
    assert.equal(await page.getByRole("button", { name: /Read the latest Colt Assistant response aloud/i }).isDisabled(), false);

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.locator("#coltAssistantInput").fill("Give me one more step.");
    await page.locator(".colt-assistant-form button[type='submit']").click();
    assert.equal(await showFull.count(), 0);
    await page.waitForTimeout(250);
    const reducedMotionPartial = await page.locator(".colt-assistant-reveal-text").last().innerText();
    assert(reducedMotionPartial.length > 0 && reducedMotionPartial.length < guidedAnswer.length, reducedMotionPartial);
    await page.waitForFunction(answer => {
      const responses = document.querySelectorAll(".colt-assistant-reveal-text");
      return responses.length && responses[responses.length - 1].innerText === answer;
    }, guidedAnswer);
    assert.equal(await page.locator(".colt-assistant-reveal-text").last().innerText(), guidedAnswer);

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
