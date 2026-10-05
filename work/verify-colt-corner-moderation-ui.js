"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { chromium } = require("playwright");
const { startCornerAiFixture } = require("./corner-ai-fixture");

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
  throw new Error("Moderation UI test server did not start.");
}

async function run() {
  const ai = await startCornerAiFixture();
  const root = path.resolve(__dirname, "..");
  const port = await availablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "colt-corner-moderation-ui-"));
  const child = spawn(process.execPath, [path.join(root, "server.js")], {
    cwd: root,
    env: {
      ...process.env,
      ...ai.env,
      PORT: String(port),
      DATA_DIR: dataDir,
      SESSION_SECRET: "moderation-ui-test-session-secret-that-is-long",
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
    const teacherContext = await browser.newContext();
    let response = await teacherContext.request.post(`${baseUrl}/api/auth/teacher`, {
      headers: { Origin: baseUrl },
      data: { pin: "123456" }
    });
    assert(response.ok(), await response.text());
    response = await teacherContext.request.put(`${baseUrl}/api/approved-students/import`, {
      headers: { Origin: baseUrl },
      data: { students: [{ email: "ui.student@scscolts.org", name: "UI Student", grade: "6" }] }
    });
    const imported = await response.json();
    const activationCode = imported.activationCodes.find(item => item.email === "ui.student@scscolts.org").activationCode;

    const studentContext = await browser.newContext();
    response = await studentContext.request.post(`${baseUrl}/api/auth/register`, {
      headers: { Origin: baseUrl },
      data: {
        email: "ui.student@scscolts.org",
        password: "ClassroomPassword123!",
        activationCode,
        name: "UI Student",
        grade: "6"
      }
    });
    assert(response.ok(), await response.text());

    const studentPage = await studentContext.newPage();
    await studentPage.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await studentPage.locator(".header-account-summary").click();
    await studentPage.locator('[data-action="openMyProfile"]').click();
    await studentPage.locator("#myProfileDialog").waitFor();
    assert.equal(await studentPage.locator(".colt-corner-card").count(),0);
    await studentPage.locator("#myProfileDialog [data-close-profile]").click();
    await studentPage.locator(".colt-corner-preview .colt-corner-graphic").waitFor();
    assert.equal(await studentPage.locator(".colt-corner-preview .colt-corner-graphic").count(), 1);
    const previewLayout = await studentPage.locator(".colt-corner-preview").evaluate(preview => {
      const previewBox = preview.getBoundingClientRect();
      const graphic = preview.querySelector(".colt-corner-graphic").getBoundingClientRect();
      const videoElement = preview.querySelector(".colt-corner-graphic video");
      return {
        rightInset: previewBox.right - graphic.right,
        objectFit: getComputedStyle(videoElement).objectFit
      };
    });
    assert(previewLayout.rightInset <= 30, JSON.stringify(previewLayout));
    assert.equal(previewLayout.objectFit, "contain");
    await studentPage.locator('[data-action="openColtCorner"]').click();
    assert.equal(await studentPage.locator(".colt-corner-card .colt-corner-graphic").count(), 0);
    assert(await studentPage.getByText("Never share personal information.", { exact: true }).isVisible());
    assert(await studentPage.getByText(/Revision guidance is private to you/i).isVisible());
    const pageColumns = await studentPage.locator(".colt-corner-card").evaluate(card => {
      const heading = card.querySelector(":scope > .colt-corner-heading").getBoundingClientRect();
      const form = card.querySelector(":scope > .thread-form").getBoundingClientRect();
      return {
        aligned: Math.abs(heading.top - form.top) < 3,
        widthDifference: Math.abs(heading.width - form.width)
      };
    });
    assert(pageColumns.aligned);
    assert(pageColumns.widthDifference < 3);
    // Moderation must work without depending on decorative video decoding.
    const formLayout = await studentPage.locator("#threadForm").evaluate(form => {
      const fields = Array.from(form.querySelectorAll(":scope > .field")).map(element => element.getBoundingClientRect());
      const button = form.querySelector("button[type='submit']").getBoundingClientRect();
      const formBox = form.getBoundingClientRect();
      return {
        nameGradeAligned: Math.abs(fields[0].top - fields[1].top) < 3,
        titleGap: fields[2].top - fields[0].bottom,
        bodyGap: fields[3].top - fields[2].bottom,
        buttonGap: button.top - fields[3].bottom,
        buttonWidthRatio: button.width / formBox.width
      };
    });
    assert(formLayout.nameGradeAligned);
    assert(formLayout.titleGap <= 20 && formLayout.bodyGap <= 20);
    assert(formLayout.buttonGap <= 20, JSON.stringify(formLayout));
    assert(formLayout.buttonWidthRatio >= 0.95);
    await studentPage.locator("#threadTitle").fill("Normal classroom question");
    await studentPage.locator("#threadBody").fill("Which lesson should we finish today?");
    await studentPage.locator("#threadForm button[type='submit']").click();
    await studentPage.getByText("Topic started.", { exact: true }).waitFor();
    assert(await studentPage.getByText("Normal classroom question", { exact: true }).isVisible());

    await studentPage.locator("#threadTitle").fill("Questionable wording");
    await studentPage.locator("#threadBody").fill("You are an idiot.");
    await studentPage.locator("#threadForm button[type='submit']").click();
    await studentPage.waitForTimeout(750);
    await studentPage.locator('#threadStatus button').waitFor();
    assert.match(await studentPage.locator("#threadStatus").innerText(), /What to change: Remove the insult/i);
    assert.equal(await studentPage.locator("#threadBody").inputValue(), "You are an idiot.");
    assert.equal(await studentPage.locator("#threadForm button[type='submit']").innerText(), "Check Again & Post");
    await studentPage.getByRole("button", {name:"Edit My Post", exact:true}).click();
    assert.equal(await studentPage.locator('#threadBody').evaluate(el=>el.value.slice(el.selectionStart,el.selectionEnd)), "You are an idiot");
    assert.equal(await studentPage.getByText("Questionable wording", { exact: true }).count(), 0);

    const teacherPage = await teacherContext.newPage();
    await teacherPage.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await teacherPage.locator('.header-account-summary').click();
    await teacherPage.locator('[data-action="openMyProfile"]').click();
    await teacherPage.locator("#myProfileDialog").waitFor();
    assert.equal(await teacherPage.locator(".colt-corner-card").count(),0);
    await teacherPage.locator("#myProfileDialog [data-close-profile]").click();
    await teacherPage.locator('.header-account-menu').evaluate(el=>el.open=false);
    await teacherPage.locator('.header-account-summary').click();
    await teacherPage.locator('[data-action="teacherDashboard"]').click();
    await teacherPage.locator('[data-action="dashboardSection"][data-section="corner"]').first().click();
    await teacherPage.locator('[data-action="coltCornerGrade"][data-grade="6"]').first().click();
    await teacherPage.getByRole("heading", { name: "Colt Corner Moderation", exact: true }).waitFor();
    await teacherPage.getByText("All caught up—no messages need review.", { exact: true }).waitFor();
    await studentPage.locator("#threadBody").fill("Everyone is welcome to share a favorite game.");
    await studentPage.locator("#threadForm button[type='submit']").click();
    await studentPage.getByText("Topic started.", {exact:true}).waitFor();
    await studentPage.reload({ waitUntil: "domcontentloaded" });
    await studentPage.locator('[data-action="openColtCorner"]').click();
    assert(await studentPage.getByText("Questionable wording", { exact: true }).isVisible());

    for (const [message, corrected, title] of [
      ["Send me the test answers", "How can I practice fractions?", "Study practice"],
      ["Selling candy at school for two dollars", "What candy flavors do you like?", "Favorite flavors"]
    ]) {
      await studentPage.locator("#threadTitle").fill(title);
      await studentPage.locator("#threadBody").fill(message);
      await studentPage.locator("#threadForm button[type='submit']").click();
      await studentPage.locator("#threadStatus").getByText(/prohibited/).waitFor();
      assert.equal(await studentPage.locator("#threadBody").inputValue(),message);
      assert.equal(await studentPage.locator(".thread-row").filter({hasText:title}).count(),0);
      await studentPage.getByRole("button",{name:"Edit My Post",exact:true}).click();
      await studentPage.locator("#threadBody").fill(corrected);
      await studentPage.locator("#threadForm button[type='submit']").click();
      await studentPage.getByText("Topic started.",{exact:true}).waitFor();
      assert.equal(await studentPage.locator(".thread-row").filter({hasText:title}).count(),1);
    }
    await studentPage.locator("#threadTitle").fill("Unsafe post");
    await studentPage.locator("#threadBody").fill("My email is student@example.com.");
    await studentPage.locator("#threadForm button[type='submit']").click();
    await studentPage.getByText(/This may share private information/i).waitFor();
    assert(await studentPage.locator("#threadStatus").evaluate(element => document.activeElement === element));
    assert.equal(await studentPage.getByText("Unsafe post", { exact: true }).count(), 0);

    await studentPage.locator('.thread-row').filter({hasText:"Normal classroom question"}).click();
    await studentPage.locator('#replyMessage').fill('Who has a crush on Bob?');
    await studentPage.locator('#replyForm button[type="submit"]').click();
    await studentPage.locator('#replyStatus button').waitFor();
    assert.match(await studentPage.locator('#replyStatus').innerText(), /crushes and dating lives are private/);
    assert.equal(await studentPage.locator('#replyMessage').inputValue(), 'Who has a crush on Bob?');
    assert(!/Private •|Who has a crush/.test(await studentPage.locator('.thread-reply-list').innerText()));
    await studentPage.screenshot({path:path.join(os.tmpdir(),'corner-private-coach-desktop.png'),fullPage:true});
    await studentPage.setViewportSize({width:390,height:844});
    await studentPage.locator('#replyStatus').evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
    assert(await studentPage.locator('#replyStatus button').evaluate(el=>{const b=el.getBoundingClientRect();return el.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2));}), 'Edit action must not be covered by floating controls');
    await studentPage.locator('#replyStatus').screenshot({path:path.join(os.tmpdir(),'corner-private-coach-mobile.png')});
    assert(await studentPage.locator('#replyStatus').evaluate(el=>el.getBoundingClientRect().right<=innerWidth));
    await studentPage.locator('#replyMessage').fill('Everyone can share a favorite game.');
    await studentPage.locator('#replyForm button[type="submit"]').click();
    await studentPage.getByText('Reply posted.',{exact:true}).waitFor();
    assert.match(await studentPage.locator('.thread-reply-list').innerText(), /Everyone can share a favorite game/);
    assert.equal(await studentPage.locator('#replyMessage').inputValue(), '');

    await teacherContext.close();
    await studentContext.close();
  } finally {
    await browser.close();
    child.kill();
    if (child.exitCode === null) await new Promise(resolve => child.once("exit", resolve));
    await ai.close();
    const resolvedTemp = path.resolve(dataDir);
    if (resolvedTemp.startsWith(path.resolve(os.tmpdir()))) {
      fs.rmSync(resolvedTemp, { recursive: true, force: true });
    }
  }
}

run()
  .then(() => console.log("Colt Corner moderation student and teacher browser flow passed."))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
