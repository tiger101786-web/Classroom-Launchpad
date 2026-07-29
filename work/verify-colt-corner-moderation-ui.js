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
  const root = path.resolve(__dirname, "..");
  const port = await availablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "colt-corner-moderation-ui-"));
  const child = spawn(process.execPath, [path.join(root, "server.js")], {
    cwd: root,
    env: {
      ...process.env,
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
    assert(response.ok());
    response = await teacherContext.request.put(`${baseUrl}/api/approved-students/import`, {
      headers: { Origin: baseUrl },
      data: { students: [{ email: "ui.student@scscolts.org", name: "UI Student", grade: "6" }] }
    });
    const imported = await response.json();
    const activationCode = imported.activationCodes[0].activationCode;

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
    assert(response.ok());

    const studentPage = await studentContext.newPage();
    await studentPage.goto(baseUrl, { waitUntil: "domcontentloaded" });
    assert.equal(await studentPage.locator(".colt-corner-preview .colt-corner-graphic").count(), 1);
    await studentPage.locator('[data-action="openColtCorner"]').click();
    assert.equal(await studentPage.locator(".colt-corner-card .colt-corner-graphic").count(), 0);
    assert(await studentPage.getByText("Never share personal information.", { exact: true }).isVisible());
    assert(await studentPage.getByText(/Some messages may be held for Mr\. Nieves to review before appearing/i).isVisible());
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
    const formLayout = await studentPage.locator("#threadForm").evaluate(form => {
      const fields = Array.from(form.querySelectorAll(":scope > .field")).map(element => element.getBoundingClientRect());
      const button = form.querySelector("button[type='submit']").getBoundingClientRect();
      const banner = form.querySelector(".thread-form-banner").getBoundingClientRect();
      const formBox = form.getBoundingClientRect();
      return {
        nameGradeAligned: Math.abs(fields[0].top - fields[1].top) < 3,
        titleGap: fields[2].top - fields[0].bottom,
        bodyGap: fields[3].top - fields[2].bottom,
        buttonGap: button.top - fields[3].bottom,
        bannerGap: banner.top - button.bottom,
        buttonWidthRatio: button.width / formBox.width
      };
    });
    assert(formLayout.nameGradeAligned);
    assert(formLayout.titleGap <= 20 && formLayout.bodyGap <= 20);
    assert(formLayout.buttonGap <= 20 && formLayout.bannerGap <= 30, JSON.stringify(formLayout));
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
    assert.match(await studentPage.locator("#threadStatus").innerText(), /sent to Mr\. Nieves for review|wait before posting/i);
    assert.equal(await studentPage.getByText("Questionable wording", { exact: true }).count(), 0);

    const teacherPage = await teacherContext.newPage();
    await teacherPage.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await teacherPage.locator('[data-action="teacherDashboard"]').click();
    await teacherPage.locator('[data-action="dashboardSection"][data-section="corner"]').first().click();
    await teacherPage.getByRole("heading", { name: "Colt Corner Moderation", exact: true }).waitFor();
    assert.equal(await teacherPage.locator(".moderation-edit-title").inputValue(), "Questionable wording");
    assert(await teacherPage.getByText(/Possible insult, bullying/i).isVisible());
    await teacherPage.getByRole("button", { name: "Approve", exact: true }).click();
    await teacherPage.getByText("No Colt Corner messages are waiting for review.", { exact: true }).waitFor();

    await studentPage.reload({ waitUntil: "domcontentloaded" });
    await studentPage.locator('[data-action="openColtCorner"]').click();
    assert(await studentPage.getByText("Questionable wording", { exact: true }).isVisible());

    await studentPage.locator("#threadTitle").fill("Unsafe post");
    await studentPage.locator("#threadBody").fill("My email is student@example.com.");
    await studentPage.locator("#threadForm button[type='submit']").click();
    await studentPage.getByText(/may contain personal information/i).waitFor();
    assert(await studentPage.locator("#threadBody").evaluate(element => document.activeElement === element));
    assert.equal(await studentPage.getByText("Unsafe post", { exact: true }).count(), 0);

    await teacherContext.close();
    await studentContext.close();
  } finally {
    await browser.close();
    child.kill();
    if (child.exitCode === null) await new Promise(resolve => child.once("exit", resolve));
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
