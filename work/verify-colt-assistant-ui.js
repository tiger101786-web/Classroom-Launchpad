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
    assert.equal(await page.locator(".colt-assistant-choice.is-primary").count(), 4);
    assert.equal(await page.getByRole("button", { name: "More Help", exact: true }).count(), 1);
    const assistantHome = page.getByRole("button", { name: "Return to Colt Assistant home", exact: true });
    const assistantBack = page.getByRole("button", { name: "Go back one Colt Assistant step", exact: true });
    assert(await assistantHome.isVisible());
    assert(await assistantBack.isDisabled());

    await page.getByRole("button", { name: "Find an Activity", exact: true }).click();
    assert.match(await page.locator(".colt-assistant-conversation").innerText(), /What kind of approved activity/i);
    assert.equal(await page.getByRole("button", { name: "Create something", exact: true }).count(), 1);
    assert.equal(await page.getByRole("button", { name: "Play a learning game", exact: true }).count(), 1);
    assert.doesNotMatch(
      await page.locator(".colt-assistant-conversation").innerText(),
      /I can help you find approved websites, choose an activity, review classroom rules/i
    );
    await assistantHome.click();

    await page.getByRole("button", { name: "Computer Help", exact: true }).click();
    assert.equal(await page.getByRole("button", { name: "Email not working", exact: true }).count(), 1);
    assert.equal(await page.getByRole("button", { name: "USB drive not showing", exact: true }).count(), 1);
    assert.equal(await page.getByRole("button", { name: "Wi-Fi not working", exact: true }).count(), 1);
    assert.equal(await page.getByRole("button", { name: "Cannot print", exact: true }).count(), 0);
    assert.equal(await page.getByRole("button", { name: "Keyboard shortcuts", exact: true }).count(), 1);
    await page.getByRole("button", { name: "Email not working", exact: true }).click();
    assert.match(
      await page.locator(".colt-assistant-conversation").innerText(),
      /Do not enter your email address or password|school email page/i
    );
    await assistantHome.click();

    await page.getByRole("button", { name: "More Help", exact: true }).click();
    await page.getByRole("button", { name: "Keyboard Shortcuts", exact: true }).click();
    assert.match(await page.locator(".colt-assistant-conversation").innerText(), /Ctrl\+C|Ctrl\+Shift\+T/i);
    await assistantHome.click();

    await page.getByRole("button", { name: "Ask a Question", exact: true }).click();
    await page.locator("#coltAssistantInput").fill("downloads");
    await page.locator(".colt-assistant-form button[type='submit']").click();
    assert.match(await page.locator(".colt-assistant-conversation").innerText(), /Downloads folder|download or upload/i);
    assert.doesNotMatch(await page.locator(".colt-assistant-conversation").innerText(), /I’m not sure about that one/i);
    await assistantHome.click();

    await page.getByRole("button", { name: "Today’s Directions", exact: true }).click();
    assert.match(await page.locator(".colt-assistant-conversation").innerText(), /current directions|Today’s Launch/i);
    assert(!(await assistantBack.isDisabled()));
    await assistantBack.click();
    assert.equal(await page.locator(".colt-assistant-choice.is-primary").count(), 4);

    await page.getByRole("button", { name: "Ask a Question", exact: true }).click();
    assert(await page.locator("#coltAssistantInput").evaluate(element => document.activeElement === element));
    assert.match(await page.locator(".colt-assistant-conversation").innerText(), /Type a short classroom question/i);
    await page.getByRole("button", { name: "Ask a Question", exact: true }).dblclick();
    assert.equal(
      await page.getByText(
        "Type a short classroom question below. Please do not enter your name, email, password, grade, or other private information.",
        { exact: true }
      ).count(),
      1
    );
    await page.locator("#coltAssistantInput").fill("im having keyboard issues");
    await page.locator(".colt-assistant-form button[type='submit']").click();
    assert.match(await page.locator(".colt-assistant-conversation").innerText(), /Click once inside the box|Try one letter/i);
    assert.equal(await page.getByText("TypingClub", { exact: true }).count(), 0);
    await assistantHome.click();
    assert.equal(await page.locator(".colt-assistant-choice.is-primary").count(), 4);

    await page.locator("#coltAssistantInput").fill("What can u do?");
    await page.locator(".colt-assistant-form button[type='submit']").click();
    assert.match(
      await page.locator(".colt-assistant-conversation").innerText(),
      /approved websites|choose an activity/i
    );
    assert((await page.locator(".colt-assistant-choice").count()) >= 4);
    await page.locator(".colt-assistant-clear").click();

    await page.locator("#coltAssistantInput").fill("I wana dra.");
    await page.locator(".colt-assistant-form button[type='submit']").click();
    await page.waitForSelector(".colt-assistant-recommendation");
    const desktopRecommendations = page.locator(".colt-assistant-recommendation");
    assert((await desktopRecommendations.count()) > 0);
    assert((await desktopRecommendations.count()) <= 3);
    const recommendationText = await desktopRecommendations.first().innerText();
    assert.match(recommendationText, /Creative Projects/i);
    const firstTitles = await desktopRecommendations.locator("h3").allTextContents();
    await page.getByRole("button", { name: "Show me more", exact: true }).last().click();
    const allTitles = await page.locator(".colt-assistant-recommendation h3").allTextContents();
    assert(allTitles.length > firstTitles.length);
    assert(allTitles.slice(firstTitles.length).some(title => !firstTitles.includes(title)));

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
