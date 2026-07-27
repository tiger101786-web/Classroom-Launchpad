const { spawn } = require("child_process");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const child = spawn(process.execPath, ["server.js"], {
  cwd: root,
  env: {
    ...process.env,
    PORT: "8098",
    DATA_DIR: path.join(__dirname, `auth-ui-test-data-${process.pid}`),
    SESSION_SECRET: "test-session-secret-at-least-32-characters",
    TEACHER_PIN: "654321"
  },
  stdio: ["ignore", "pipe", "pipe"]
});

async function run() {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Server did not start.")), 5000);
    child.stdout.on("data", chunk => {
      if (String(chunk).includes("server running")) {
        clearTimeout(timer);
        resolve();
      }
    });
  });
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto("http://localhost:8098/", { waitUntil: "networkidle" });
    await page.locator('[data-action="login"]').first().waitFor();
    const headerButtons = await page.locator(".header-actions button").allTextContents();
    if (!headerButtons.includes("PlusPortal") || !headerButtons.includes("Student Login")) {
      throw new Error("Header login button was not placed beside PlusPortal.");
    }
    const lockedText = await page.locator(".colt-corner-locked").innerText();
    if (!lockedText.includes("Only approved students")) throw new Error("Colt Corner did not show its protected state.");
    await page.locator('[data-action="login"]').first().click();
    await page.locator(".auth-card").waitFor();
    const loginText = await page.locator(".auth-card").innerText();
    if (!loginText.includes("one-time activation code") || !loginText.includes("Do not reuse your Google password")) {
      throw new Error("Website account and password guidance was missing.");
    }
    await page.screenshot({ path: path.join(__dirname, "auth-login-ui-qa.png"), fullPage: true });
    await page.locator('[data-action="back"]').click();
    await page.locator('[data-action="teacher"]').click();
    await page.locator("#pinInput").fill("654321");
    await page.locator("#pinForm").evaluate(form => form.requestSubmit());
    await page.locator(".dashboard-nav").waitFor();
    const dashboardSections = await page.locator(".dashboard-nav-button").allTextContents();
    if (dashboardSections.length !== 7 || !dashboardSections.some(label => label.includes("Students & Access"))) {
      throw new Error("Teacher dashboard navigation is incomplete.");
    }
    await page.locator('[data-action="dashboardSection"][data-section="students"]').first().click();
    await page.locator("#approvedStudentEmails").waitFor();
    await page.locator("#approvedStudentEmails").fill("ui.test@scscolts.org");
    await page.locator("#approvedStudentImportForm").evaluate(form => form.requestSubmit());
    await page.locator(".activation-code-results").waitFor();
    const activationText = await page.locator(".activation-code-results").innerText();
    if (!activationText.includes("ui.test@scscolts.org") || !activationText.includes("Download Codes")) {
      throw new Error("Teacher activation-code results were not displayed.");
    }
    await page.locator('[data-action="dashboardSection"][data-section="websites"]').first().click();
    await page.locator("#dashboardLinkSearch").waitFor();
    await page.locator("#dashboardLinkSearch").fill("Google");
    if (await page.locator(".dashboard-link-row").count() < 1) {
      throw new Error("Website search did not return a matching result.");
    }
    await page.locator('[data-action="dashboardSection"][data-section="tools"]').first().click();
    if (!await page.locator("#dailyLaunchForm").count() || !await page.locator("#classTimerForm").count()) {
      throw new Error("Classroom tools were not preserved in the redesigned dashboard.");
    }
    await page.screenshot({ path: path.join(__dirname, "teacher-dashboard-ui-qa.png"), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('[data-action="dashboardSection"][data-section="overview"]').first().click();
    const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    console.log(JSON.stringify({
      loginBesidePlusPortal: true,
      coltCornerShowsProtectedState: true,
      activationAndPasswordGuidancePresent: true,
      teacherCanGenerateActivationCodes: true,
      dashboardNavigationComplete: true,
      websiteSearchWorks: true,
      classroomToolsPreserved: true,
      mobileHorizontalOverflow: mobileOverflow
    }, null, 2));
    if (mobileOverflow) throw new Error("Teacher dashboard has horizontal overflow on mobile.");
  } finally {
    await browser.close();
  }
}

run()
  .catch(error => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  })
  .finally(() => child.kill());
