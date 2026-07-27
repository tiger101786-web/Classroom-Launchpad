const { spawn } = require("child_process");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const dataDir = path.join(__dirname, `auth-ui-test-data-${process.pid}`);
const child = spawn(process.execPath, ["server.js"], {
  cwd: root,
  env: {
    ...process.env,
    PORT: "8098",
    DATA_DIR: dataDir,
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
    const instantPage = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await instantPage.route("**/api/**", async route => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      await route.continue();
    });
    await instantPage.goto("http://localhost:8098/", { waitUntil: "domcontentloaded" });
    await instantPage.locator(".hero-panel").waitFor({ timeout: 750 });
    await instantPage.close();

    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto("http://localhost:8098/", { waitUntil: "networkidle" });
    await page.locator('[data-action="login"]').first().waitFor();
    const headerButtons = await page.locator(".header-actions button").allTextContents();
    if (!headerButtons.includes("PlusPortal") || !headerButtons.includes("Student Login")) {
      throw new Error("Header login button was not placed beside PlusPortal.");
    }
    await page.locator('[data-action="toggleTheme"]').first().click();
    const darkLoginColor = await page.locator(".login-btn:not(.signed-in)").first().evaluate(button => getComputedStyle(button).backgroundColor);
    if (darkLoginColor !== "rgb(5, 5, 5)") {
      throw new Error(`Dark-mode Student Login button was ${darkLoginColor} instead of black.`);
    }
    await page.locator('[data-action="toggleTheme"]').first().click();
    const lockedText = await page.locator(".colt-corner-locked").innerText();
    if (!lockedText.includes("Only approved students")) throw new Error("Colt Corner did not show its protected state.");
    await page.locator('[data-action="login"]').first().click();
    await page.locator(".auth-card").waitFor();
    const loginText = await page.locator(".auth-card").innerText();
    if (!loginText.includes("one-time activation code") || !loginText.includes("Do not reuse your Google password")) {
      throw new Error("Website account and password guidance was missing.");
    }
    await page.screenshot({ path: path.join(dataDir, "auth-login-ui-qa.png"), fullPage: true });
    await page.locator('[data-action="back"]').click();
    await page.locator('[data-action="teacher"]').click();
    await page.locator("#pinInput").fill("654321");
    await page.locator("#pinForm").evaluate(form => form.requestSubmit());
    await page.locator(".dashboard-nav").waitFor();
    const dashboardSections = await page.locator(".dashboard-nav-button").allTextContents();
    if (dashboardSections.length !== 7 || !dashboardSections.some(label => label.includes("Students & Access"))) {
      throw new Error("Teacher dashboard navigation is incomplete.");
    }
    await page.locator('[data-action="back"]').first().click();
    await page.locator('[data-action="toggleTheme"]').first().click();
    const darkTeacherColor = await page.locator('.login-btn[data-action="teacherDashboard"]').evaluate(button => getComputedStyle(button).backgroundColor);
    if (darkTeacherColor !== "rgb(5, 5, 5)") {
      throw new Error(`Dark-mode Teacher button was ${darkTeacherColor} instead of black.`);
    }
    await page.locator('[data-action="toggleTheme"]').first().click();
    await page.locator('[data-action="openColtCorner"]').first().click();
    const identityLabels = await page.locator("#threadForm .field label").allTextContents();
    const identityValues = await page.locator("#threadForm input[readonly]").evaluateAll(inputs => inputs.map(input => input.value));
    if (identityLabels.includes("Posting as") || identityValues[0] !== "Mr. Nieves" || identityValues[1] !== "Teacher") {
      throw new Error("Teacher Colt Corner identity was not filled automatically.");
    }
    await page.locator('[data-action="back"]').first().click();
    await page.locator('[data-action="teacher"]').first().click();
    await page.locator(".dashboard-nav").waitFor();
    await page.locator('[data-action="dashboardSection"][data-section="students"]').first().click();
    await page.locator("#approvedStudentEmails").waitFor();
    await page.locator("#approvedStudentEmails").fill("ui.test@scscolts.org");
    await page.locator("#approvedStudentImportForm").evaluate(form => form.requestSubmit());
    await page.locator(".activation-code-results").waitFor();
    const activationText = await page.locator(".activation-code-results").innerText();
    if (!activationText.includes("ui.test@scscolts.org") || !activationText.includes("Download Codes")) {
      throw new Error("Teacher activation-code results were not displayed.");
    }
    await page.locator("#approvedStudentRosterFile").setInputFiles({
      name: "private-roster.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("Grade,Student Name,School Email\r\n5,\"Student, UI\",ui.test@scscolts.org")
    });
    await page.getByText("Student, UI", { exact: true }).waitFor();
    const studentIdentity = await page.locator(".approved-student-identity").filter({ hasText: "ui.test@scscolts.org" }).innerText();
    if (!studentIdentity.includes("Student, UI") || !studentIdentity.includes("Grade 5")) {
      throw new Error("Private roster name and grade were not displayed.");
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
    await page.screenshot({ path: path.join(dataDir, "teacher-dashboard-ui-qa.png"), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('[data-action="dashboardSection"][data-section="overview"]').first().click();
    const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    console.log(JSON.stringify({
      homepageRendersBeforeAccountChecks: true,
      loginBesidePlusPortal: true,
      darkModeStudentLoginIsBlack: true,
      darkModeTeacherButtonIsBlack: true,
      coltCornerShowsProtectedState: true,
      activationAndPasswordGuidancePresent: true,
      teacherCanGenerateActivationCodes: true,
      privateRosterNamesDisplay: true,
      teacherForumIdentityAutomatic: true,
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
