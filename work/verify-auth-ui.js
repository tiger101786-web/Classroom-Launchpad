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
    const feedbackLayout = await page.evaluate(() => {
      const box = document.createElement("div");
      box.className = "teacher-feedback-box";
      box.innerHTML = '<span class="feature-kicker">Feedback from Mr. Nieves</span><p>Good job with this!</p>';
      document.body.appendChild(box);
      const label = box.querySelector(".feature-kicker").getBoundingClientRect();
      const message = box.querySelector("p").getBoundingClientRect();
      const result = { gap: message.top - label.bottom, fontSize: parseFloat(getComputedStyle(box.querySelector(".feature-kicker")).fontSize) };
      box.remove();
      return result;
    });
    if (feedbackLayout.gap < 7 || feedbackLayout.fontSize > 11) {
      throw new Error(`Student feedback label is too large or overlaps its message: ${JSON.stringify(feedbackLayout)}.`);
    }
    const faviconLinks = await page.locator('link[rel="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]').count();
    const faviconResponse = await page.request.get("http://localhost:8098/favicon.ico");
    const manifestResponse = await page.request.get("http://localhost:8098/site.webmanifest");
    const manifest = await manifestResponse.json();
    if (faviconLinks < 5 || !faviconResponse.ok() || !String(faviconResponse.headers()["content-type"]).includes("image/x-icon")) {
      throw new Error("Cross-browser favicon links or the ICO response are incomplete.");
    }
    if (!manifestResponse.ok() || manifest.icons?.length !== 2) {
      throw new Error("The favicon web manifest is incomplete.");
    }
    await page.locator('[data-action="login"]').first().waitFor();
    const headerButtons = await page.locator(".header-actions button").allTextContents();
    if (!headerButtons.includes("PlusPortal") || !headerButtons.includes("Student Login")) {
      throw new Error("Header login button was not placed beside PlusPortal.");
    }
    const lightHeaderColors = await page.locator(".portal-btn, .login-btn:not(.signed-in)").evaluateAll(buttons => buttons.map(button => getComputedStyle(button).backgroundColor));
    if (new Set(lightHeaderColors).size !== 1) {
      throw new Error(`Light-mode PlusPortal and Student Login colors did not match: ${lightHeaderColors.join(", ")}.`);
    }
    await page.locator('[data-action="toggleTheme"]').first().click();
    const darkGuestStyles = await page.locator(".portal-btn, .login-btn:not(.signed-in), .mode-btn, .icon-btn").evaluateAll(buttons => buttons.map(button => {
      const style = getComputedStyle(button);
      return [style.backgroundColor, style.color].join("|");
    }));
    if (new Set(darkGuestStyles).size !== 1) {
      throw new Error(`Dark-mode guest header buttons did not match: ${darkGuestStyles.join(", ")}.`);
    }
    await page.locator('[data-action="toggleTheme"]').first().click();
    const lockedText = await page.locator(".colt-corner-locked").innerText();
    if (!lockedText.includes("Only approved students")) throw new Error("Colt Corner did not show its protected state.");
    await page.locator('[data-action="category"][data-category="Logic Games"]').first().click();
    await page.locator('[data-action="openColtRun"]').first().click();
    await page.locator(".colt-run-character-panel").waitFor();
    const howToPlayCards = await page.locator(".colt-run-control-card").count();
    const howToPlayText = await page.locator(".colt-run-how-to-play").innerText();
    const gameStatusText = await page.locator(".colt-run-status-panel").innerText();
    if (howToPlayCards !== 4 || !howToPlayText.includes("Move") || !howToPlayText.includes("Jump") || !howToPlayText.includes("Reach the Flag")) {
      throw new Error("Colt Run character selection does not contain the complete How to Play panel.");
    }
    if (!gameStatusText.toLowerCase().includes("game status") || gameStatusText.includes("Use arrow keys")) {
      throw new Error(`Colt Run live status panel did not replace the old directions sentence: ${JSON.stringify(gameStatusText)}.`);
    }
    await page.screenshot({ path: path.join(dataDir, "colt-run-how-to-play-ui-qa.png"), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    const mobileColtRunOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    if (mobileColtRunOverflow || !await page.locator(".colt-run-how-to-play").isVisible()) {
      throw new Error("Colt Run How to Play panel is not usable on a compact screen.");
    }
    await page.screenshot({ path: path.join(dataDir, "colt-run-how-to-play-mobile-ui-qa.png"), fullPage: true });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('[data-action="back"]').first().click();
    await page.locator('[data-action="login"]').first().click();
    await page.locator(".auth-card").waitFor();
    const loginText = await page.locator(".auth-card").innerText();
    if (!loginText.includes("one-time activation code") || !loginText.includes("Do not reuse your Google password")) {
      throw new Error("Website account and password guidance was missing.");
    }
    await page.screenshot({ path: path.join(dataDir, "auth-login-ui-qa.png"), fullPage: true });
    await page.locator('[data-action="back"]').click();
    await page.evaluate(() => {
      const stored = JSON.parse(localStorage.getItem("earlyFinisherLinks") || "[]");
      stored.push({
        id: "existing-browser-only-link",
        title: "Existing Browser Addition",
        instruction: "This was saved before shared storage was enabled.",
        url: "https://example.com/existing-browser-addition",
        category: "Computer Skills",
        active: true,
        todayChoice: false
      });
      localStorage.setItem("earlyFinisherLinks", JSON.stringify(stored));
    });
    await page.reload({ waitUntil: "networkidle" });
    await page.locator('[data-action="teacher"]').click();
    await page.locator("#pinInput").fill("654321");
    await page.locator("#pinForm").evaluate(form => form.requestSubmit());
    await page.locator(".dashboard-nav").waitFor();
    const dashboardSections = await page.locator(".dashboard-nav-button").allTextContents();
    if (dashboardSections.length < 8 || !dashboardSections.some(label => label.includes("Student Work")) || !dashboardSections.some(label => label.includes("Students & Access"))) {
      throw new Error("Teacher dashboard navigation is incomplete.");
    }
    await page.locator('[data-action="back"]').first().click();
    await page.locator('[data-action="toggleTheme"]').first().click();
    const darkTeacherStyles = await page.locator(".portal-btn, .login-btn, .mode-btn, .icon-btn").evaluateAll(buttons => buttons.map(button => {
      const style = getComputedStyle(button);
      return [style.backgroundColor, style.color].join("|");
    }));
    if (new Set(darkTeacherStyles).size !== 1) {
      throw new Error(`Dark-mode teacher header buttons did not match: ${darkTeacherStyles.join(", ")}.`);
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
    await page.locator("#dashboardStudentSearch").fill("Student, UI");
    if (await page.locator(".approved-student-row").count() !== 1) {
      throw new Error("Student manager search did not filter by student name.");
    }
    await page.locator("#dashboardStudentSearch").fill("no matching student");
    if (!await page.getByText("No students match this search.", { exact: true }).count()) {
      throw new Error("Student manager search did not show its empty state.");
    }
    await page.locator("#dashboardStudentSearch").fill("");
    await page.locator('[data-action="dashboardSection"][data-section="gradebooks"]').first().click();
    await page.locator(".gradebook-student-row").first().waitFor();
    const gradebookAlignment = await page.evaluate(() => {
      const centers = elements => [...elements].map(element => {
        const box = element.getBoundingClientRect();
        return box.left + box.width / 2;
      });
      const header = centers(document.querySelectorAll(".gradebook-header > span"));
      const row = centers(document.querySelectorAll(".gradebook-student-row:first-of-type > *"));
      return header.map((center, index) => Math.abs(center - row[index]));
    });
    if (gradebookAlignment.length !== 8 || gradebookAlignment.some(offset => offset > 1)) {
      throw new Error(`Gradebook headers and row values are not aligned: ${gradebookAlignment.join(", ")}.`);
    }
    await page.locator('[data-action="dashboardSection"][data-section="websites"]').first().click();
    await page.locator("#dashboardLinkSearch").waitFor();
    await page.locator("#dashboardLinkSearch").fill("Google");
    if (await page.locator(".dashboard-link-row").count() < 1) {
      throw new Error("Website search did not return a matching result.");
    }
    await page.locator("#dashboardLinkSearch").fill("");
    await page.locator('[data-action="add"]').first().click();
    await page.locator("#siteTitle").fill("Cross Browser Website");
    await page.locator("#siteInstruction").fill("This link must appear in every browser.");
    await page.locator("#siteUrl").fill("https://example.com/cross-browser");
    await page.locator("#siteCategory").selectOption("Computer Skills");
    const sharedSave = page.waitForResponse(response => response.url().endsWith("/api/links") && response.request().method() === "PUT");
    await page.locator("#websiteForm").evaluate(form => form.requestSubmit());
    const sharedSaveResponse = await sharedSave;
    if (!sharedSaveResponse.ok()) throw new Error(`Shared website save returned ${sharedSaveResponse.status()}.`);
    const secondContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const secondBrowserPage = await secondContext.newPage();
    await secondBrowserPage.goto("http://localhost:8098/", { waitUntil: "networkidle" });
    await secondBrowserPage.locator("#studentSearch").fill("Cross Browser Website");
    if (!await secondBrowserPage.getByText("Cross Browser Website", { exact: true }).count()) {
      throw new Error("A website added by the teacher did not appear in a separate browser profile.");
    }
    await secondBrowserPage.locator("#studentSearch").fill("Existing Browser Addition");
    if (!await secondBrowserPage.getByText("Existing Browser Addition", { exact: true }).count()) {
      throw new Error("The teacher's existing browser-only website additions were not migrated.");
    }
    await secondContext.close();
    await page.locator(".dashboard-nav").waitFor();
    await page.locator('[data-action="dashboardSection"][data-section="tools"]').first().click();
    if (!await page.locator("#dailyLaunchForm").count() || !await page.locator("#classTimerForm").count()) {
      throw new Error("Classroom tools were not preserved in the redesigned dashboard.");
    }
    await page.screenshot({ path: path.join(dataDir, "teacher-dashboard-ui-qa.png"), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('[data-action="dashboardSection"][data-section="overview"]').first().click();
    const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    await page.locator('[data-action="dashboardSection"][data-section="requests"]').first().click();
    await page.locator('[data-action="back"]').first().click();
    await page.locator('[data-action="teacher"]').first().click();
    const defaultDashboardSection = await page.locator(".dashboard-nav-button.is-active").innerText();
    if (!defaultDashboardSection.includes("Overview")) {
      throw new Error(`Teacher Dashboard reopened on ${defaultDashboardSection} instead of Overview.`);
    }
    console.log(JSON.stringify({
      homepageRendersBeforeAccountChecks: true,
      crossBrowserFaviconsAvailable: true,
      loginBesidePlusPortal: true,
      darkModeGuestHeaderButtonsMatch: true,
      darkModeTeacherHeaderButtonsMatch: true,
      coltCornerShowsProtectedState: true,
      coltRunHowToPlayPanelComplete: true,
      coltRunUsesDedicatedLiveStatus: true,
      coltRunHowToPlayResponsive: true,
      activationAndPasswordGuidancePresent: true,
      teacherCanGenerateActivationCodes: true,
      privateRosterNamesDisplay: true,
      studentManagerSearchWorks: true,
      teacherForumIdentityAutomatic: true,
      dashboardNavigationComplete: true,
      websiteSearchWorks: true,
      websiteAdditionsSyncAcrossBrowsers: true,
      existingBrowserAdditionsAreMigrated: true,
      classroomToolsPreserved: true,
      teacherDashboardAlwaysOpensOnOverview: true,
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
