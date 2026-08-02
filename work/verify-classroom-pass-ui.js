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
  throw new Error("Classroom Pass UI test server did not start.");
}

async function noHorizontalOverflow(page, selector) {
  return page.locator(selector).evaluate(element => element.scrollWidth <= element.clientWidth + 2);
}

async function run() {
  const root = path.resolve(__dirname, "..");
  const port = await availablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "classroom-pass-ui-"));
  const child = spawn(process.execPath, [path.join(root, "server.js")], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      DATA_DIR: dataDir,
      SESSION_SECRET: "classroom-pass-ui-session-secret-that-is-long",
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
    const teacherContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    let response = await teacherContext.request.post(`${baseUrl}/api/auth/teacher`, {
      headers: { Origin: baseUrl },
      data: { pin: "123456" }
    });
    assert(response.ok());
    response = await teacherContext.request.put(`${baseUrl}/api/approved-students/import`, {
      headers: { Origin: baseUrl },
      data: { students: [{ email: "pass.student@scscolts.org", name: "Pass Student", grade: "5" }] }
    });
    const imported = await response.json();
    const activationCode = imported.activationCodes[0].activationCode;

    const studentContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    response = await studentContext.request.post(`${baseUrl}/api/auth/register`, {
      headers: { Origin: baseUrl },
      data: {
        email: "pass.student@scscolts.org",
        password: "ClassroomPassword123!",
        activationCode,
        name: "Pass Student",
        grade: "5"
      }
    });
    assert(response.ok());

    const studentPage = await studentContext.newPage();
    await studentPage.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await studentPage.getByRole("heading", { name: "Classroom Pass", exact: true }).first().waitFor();
    const homepagePassLayout = await studentPage.evaluate(() => {
      const assignments = document.querySelector(".assignments-home-card").getBoundingClientRect();
      const classroomPass = document.querySelector(".classroom-pass-home-card").getBoundingClientRect();
      const icon = document.querySelector(".classroom-pass-home-icon svg").getBoundingClientRect();
      return { gap: classroomPass.top - assignments.bottom, iconWidth: icon.width, iconHeight: icon.height };
    });
    assert(homepagePassLayout.gap >= 20, JSON.stringify(homepagePassLayout));
    assert(homepagePassLayout.iconWidth >= 30 && homepagePassLayout.iconHeight >= 30, JSON.stringify(homepagePassLayout));
    await studentPage.locator('[data-action="openClassroomPass"]').click();
    await studentPage.getByRole("heading", { name: "Classroom Pass", exact: true }).waitFor();
    const studentIdentity = await studentPage.locator(".classroom-pass-student-identity").innerText();
    assert.match(studentIdentity, /Pass Student/i, studentIdentity);
    assert.match(studentIdentity, /Grade 5/i, studentIdentity);
    assert(await studentPage.getByText(/^Available/).isVisible());
    assert(await noHorizontalOverflow(studentPage, ".classroom-pass-student-shell"));

    await studentPage.locator('[data-action="selectClassroomPassDestination"][data-destination="Water"]').click();
    await studentPage.locator('[data-action="startClassroomPass"]').click();
    await studentPage.getByText("Currently Signed Out", { exact: true }).waitFor();
    assert(await studentPage.getByText("Water", { exact: true }).isVisible());
    assert.match(await studentPage.locator("[data-pass-start]").innerText(), /^\d+:\d{2}$/);

    const teacherPage = await teacherContext.newPage();
    await teacherPage.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await teacherPage.locator('[data-action="teacherDashboard"]').click();
    await teacherPage.locator('[data-action="dashboardSection"][data-section="passes"]').first().click();
    await teacherPage.getByRole("heading", { name: "Classroom Pass Log", exact: true }).waitFor();
    assert(await teacherPage.getByRole("heading", { name: "Currently Out", exact: true }).isVisible());
    assert(await teacherPage.getByText("Pass Student", { exact: true }).first().isVisible());
    assert.match(await teacherPage.locator(".classroom-pass-current-card").innerText(), /Grade 5\s*·\s*Water/);
    assert.equal(await teacherPage.locator(".classroom-pass-current-list .classroom-pass-current-card").count(), 1);
    assert(await noHorizontalOverflow(teacherPage, ".teacher-dashboard-shell"));
    await teacherPage.getByRole("button", { name: "Mark Returned", exact: true }).first().click();
    await teacherPage.getByText("Everyone is currently in the classroom.", { exact: true }).waitFor();

    await studentPage.reload({ waitUntil: "domcontentloaded" });
    await studentPage.locator('[data-action="openClassroomPass"]').click();
    await studentPage.getByText(/^Available/).waitFor();
    assert(await studentPage.getByRole("heading", { name: "Your Recent Passes", exact: true }).isVisible());
    assert(await studentPage.getByText("Water", { exact: true }).isVisible());

    const mobilePage = await studentContext.newPage();
    await mobilePage.setViewportSize({ width: 390, height: 844 });
    await mobilePage.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await mobilePage.locator('[data-action="openClassroomPass"]').click();
    await mobilePage.getByRole("heading", { name: "Classroom Pass", exact: true }).waitFor();
    assert(await noHorizontalOverflow(mobilePage, "body"));
    const destinationWidth = await mobilePage.locator(".classroom-pass-destinations").evaluate(element => element.getBoundingClientRect().width);
    assert(destinationWidth <= 390, String(destinationWidth));

    await teacherContext.close();
    await studentContext.close();
  } finally {
    await browser.close();
    child.kill();
    if (child.exitCode === null) await new Promise(resolve => child.once("exit", resolve));
    const resolvedTemp = path.resolve(dataDir);
    if (resolvedTemp.startsWith(path.resolve(os.tmpdir()))) fs.rmSync(resolvedTemp, { recursive: true, force: true });
  }
}

run()
  .then(() => console.log("Classroom Pass student and teacher browser flow passed."))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
