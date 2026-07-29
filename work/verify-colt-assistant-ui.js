"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
  });
  try {
    const externalRequests = [];
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    page.setDefaultTimeout(10000);
    page.on("request", request => {
      if (/^https?:/i.test(request.url())) externalRequests.push(request.url());
    });

    const indexUrl = pathToFileURL(path.resolve(__dirname, "..", "index.html")).href;
    await page.goto(indexUrl, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".colt-assistant-launcher:visible");

    assert(await page.locator("text=Website Categories").isVisible());
    await page.locator(".colt-assistant-launcher").click();
    assert(await page.locator(".colt-assistant-panel").isVisible());
    assert.match(await page.locator(".colt-assistant-conversation").innerText(), /approved activity/i);

    await page.locator("#coltAssistantInput").fill("I wana dra.");
    await page.locator(".colt-assistant-form button[type='submit']").click();
    await page.waitForSelector(".colt-assistant-recommendation");
    const desktopRecommendations = page.locator(".colt-assistant-recommendation");
    assert((await desktopRecommendations.count()) > 0);
    assert((await desktopRecommendations.count()) <= 3);
    const recommendationText = await desktopRecommendations.first().innerText();
    assert.match(recommendationText, /Creative Projects/i);

    await page.locator("#coltAssistantInput").fill("My password is test123.");
    await page.locator(".colt-assistant-form button[type='submit']").click();
    const privateConversation = await page.locator(".colt-assistant-conversation").innerText();
    assert.match(privateConversation, /private information/i);
    assert.doesNotMatch(privateConversation, /test123/i);

    await page.locator(".colt-assistant-clear").click();
    const clearedConversation = await page.locator(".colt-assistant-conversation").innerText();
    assert.match(clearedConversation, /approved activity/i);
    assert.doesNotMatch(clearedConversation, /test123|wana dra/i);

    await page.locator("#coltAssistantInput").press("Escape");
    assert(!(await page.locator(".colt-assistant-panel").isVisible()));
    assert(await page.locator(".colt-assistant-launcher").evaluate(element => document.activeElement === element));

    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator(".colt-assistant-launcher").click();
    const mobileBox = await page.locator(".colt-assistant-panel").boundingBox();
    assert(mobileBox);
    assert(mobileBox.x >= 0 && mobileBox.y >= 0);
    assert(mobileBox.x + mobileBox.width <= 390);
    assert(mobileBox.y + mobileBox.height <= 844);

    assert.equal(externalRequests.length, 0);
    console.log("Colt Assistant desktop, mobile, keyboard, clear, privacy, and local-only UI verification passed.");
  } finally {
    await browser.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
