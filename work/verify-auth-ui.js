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
    await page.evaluate(() => localStorage.removeItem("classroomLaunchpadHomeNavigationCollapsedV1"));
    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.reload({ waitUntil: "networkidle" });
    const wideNavigation = await page.evaluate(() => {
      const navigation = document.querySelector(".home-quick-navigation").getBoundingClientRect();
      const hero = document.querySelector(".hero-panel").getBoundingClientRect();
      return {
        itemCount: document.querySelectorAll(".home-navigation-list .home-navigation-button").length,
        navigationWidth: Math.round(navigation.width),
        heroWidth: Math.round(hero.width),
        labelsVisible: getComputedStyle(document.querySelector(".home-navigation-label")).display !== "none",
        homeCircle: Math.round(document.querySelector(".home-navigation-icon.is-home-icon").getBoundingClientRect().width),
        homeHouse: Math.round(document.querySelector(".home-navigation-icon.is-home-icon svg").getBoundingClientRect().width)
      };
    });
    if (wideNavigation.itemCount !== 8 || wideNavigation.navigationWidth < 200 || wideNavigation.heroWidth !== 1132 || !wideNavigation.labelsVisible || wideNavigation.homeCircle < 38 || wideNavigation.homeHouse < 22) {
      throw new Error(`Wide homepage navigation changed existing content sizing: ${JSON.stringify(wideNavigation)}.`);
    }
    await page.locator('.home-navigation-button[data-target="home-launch"]').click();
    await page.waitForTimeout(700);
    const navigationJump = await page.evaluate(() => ({
      scrollY: Math.round(window.scrollY),
      activeTarget: document.querySelector(".home-navigation-button.is-active")?.dataset.target
    }));
    if (navigationJump.scrollY < 100 || navigationJump.activeTarget !== "home-launch") {
      throw new Error(`Homepage navigation did not move to Today's Launch: ${JSON.stringify(navigationJump)}.`);
    }
    await page.locator('.home-navigation-list .home-navigation-button[data-target="home-top"]').click();
    await page.waitForTimeout(700);
    await page.locator('[data-action="toggleHomeNavigationCollapse"]').click();
    const collapsedNavigation = await page.evaluate(() => ({
      navigationWidth: Math.round(document.querySelector(".home-quick-navigation").getBoundingClientRect().width),
      heroWidth: Math.round(document.querySelector(".hero-panel").getBoundingClientRect().width),
      labelsHidden: getComputedStyle(document.querySelector(".home-navigation-label")).display === "none"
    }));
    if (collapsedNavigation.navigationWidth > 80 || collapsedNavigation.heroWidth !== 1132 || !collapsedNavigation.labelsHidden) {
      throw new Error(`Collapsed homepage navigation is incorrect: ${JSON.stringify(collapsedNavigation)}.`);
    }
    await page.setViewportSize({ width: 1024, height: 850 });
    const tabletTriggerVisible = await page.locator(".home-nav-mobile-trigger").isVisible();
    if (!tabletTriggerVisible) throw new Error("Tablet homepage navigation trigger is hidden.");
    await page.locator(".home-nav-mobile-trigger").click();
    await page.waitForTimeout(300);
    const tabletNavigation = await page.evaluate(() => {
      const navigation = document.querySelector(".home-quick-navigation").getBoundingClientRect();
      const radio = document.querySelector(".colt-radio-launcher")?.getBoundingClientRect();
      return {
        open: document.querySelector(".home-layout").classList.contains("is-mobile-nav-open"),
        left: Math.round(navigation.left),
        right: Math.round(navigation.right),
        bottom: Math.round(navigation.bottom),
        radioTop: radio ? Math.round(radio.top) : null,
        labelsVisible: getComputedStyle(document.querySelector(".home-navigation-label")).display !== "none"
      };
    });
    if (!tabletNavigation.open || tabletNavigation.left < 0 || tabletNavigation.right > 1024 || !tabletNavigation.labelsVisible
      || (tabletNavigation.radioTop !== null && tabletNavigation.bottom > tabletNavigation.radioTop)) {
      throw new Error(`Tablet homepage navigation is not contained or overlaps Colt Radio: ${JSON.stringify(tabletNavigation)}.`);
    }
    await page.keyboard.press("Escape");
    if (await page.locator(".home-layout.is-mobile-nav-open").count()) throw new Error("Escape did not close the homepage navigation drawer.");
    await page.setViewportSize({ width: 390, height: 800 });
    const mobileNavigation = await page.evaluate(() => ({
      triggerVisible: getComputedStyle(document.querySelector(".home-nav-mobile-trigger")).display !== "none",
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
    }));
    if (!mobileNavigation.triggerVisible || mobileNavigation.horizontalOverflow) {
      throw new Error(`Mobile homepage navigation is not responsive: ${JSON.stringify(mobileNavigation)}.`);
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.evaluate(() => localStorage.removeItem("classroomLaunchpadHomeNavigationCollapsedV1"));
    await page.reload({ waitUntil: "networkidle" });
    const assignmentBuckets = await page.evaluate(() => [
      studentAssignmentViewFor({ id: "fixture" }, null),
      studentAssignmentViewFor({ id: "fixture" }, { status: "submitted" }),
      studentAssignmentViewFor({ id: "fixture" }, { status: "reviewed" }),
      studentAssignmentViewFor({ id: "fixture" }, { status: "returned" })
    ]);
    if (assignmentBuckets.join(",") !== "todo,submitted,submitted,returned") {
      throw new Error(`Student assignment tab counts use incorrect status groups: ${JSON.stringify(assignmentBuckets)}.`);
    }
    const assignmentBadgeFixture = await page.evaluate(() => {
      const original = { authSession, assignments, submissions, assignmentView, selectedAssignmentId, replacingAssignmentId };
      try {
        authSession = { authenticated: true, role: "student", name: "Student, UI", email: "ui.fixture@scscolts.org", grade: "5" };
        assignments = ["todo", "submitted", "reviewed", "returned"].map((id, index) => ({
          id, title: `Assignment ${index + 1}`, instructions: "Fixture", grades: ["5"], dueAt: "",
          acceptedTypes: [".pdf"], maxFileSizeMb: 5, allowResubmissions: false, status: "open"
        }));
        submissions = [
          { assignmentId: "submitted", studentEmail: authSession.email, status: "submitted" },
          { assignmentId: "reviewed", studentEmail: authSession.email, status: "reviewed" },
          { assignmentId: "returned", studentEmail: authSession.email, status: "returned" }
        ];
        assignmentView = "todo";
        selectedAssignmentId = "";
        replacingAssignmentId = "";
        const fixture = new DOMParser().parseFromString(renderAssignmentsPage(), "text/html");
        return [...fixture.querySelectorAll(".assignment-view-tabs button")].map(button => ({
          label: button.querySelector("span:first-child")?.textContent.trim(),
          count: button.querySelector(".assignment-tab-count")?.textContent.trim(),
          accessibleName: button.getAttribute("aria-label")
        }));
      } finally {
        ({ authSession, assignments, submissions, assignmentView, selectedAssignmentId, replacingAssignmentId } = original);
      }
    });
    if (JSON.stringify(assignmentBadgeFixture.map(item => item.count)) !== JSON.stringify(["1", "2", "1"])
      || assignmentBadgeFixture.some(item => !item.accessibleName?.includes("assignment"))) {
      throw new Error(`Student assignment tab notification badges are incorrect: ${JSON.stringify(assignmentBadgeFixture)}.`);
    }
    const compactAssignmentTabsFit = await page.evaluate(() => {
      const fixture = document.createElement("div");
      fixture.style.width = "270px";
      fixture.innerHTML = `<div class="assignment-view-tabs"><button class="is-active"><span>To Do</span><span class="assignment-tab-count">12</span></button><button><span>Submitted</span><span class="assignment-tab-count">12</span></button><button><span>Returned</span><span class="assignment-tab-count">12</span></button></div>`;
      document.body.appendChild(fixture);
      const fits = fixture.querySelector(".assignment-view-tabs").scrollWidth <= fixture.clientWidth
        && [...fixture.querySelectorAll("button")].every(button => button.scrollWidth <= button.clientWidth);
      fixture.remove();
      return fits;
    });
    if (!compactAssignmentTabsFit) throw new Error("Student assignment notification badges overflow the compact sidebar.");
    const lateSubmissionFixture = await page.evaluate(() => {
      const dueAt = "2026-08-01T12:00:00.000Z";
      const assignment = { id: "late-assignment", title: "Late Work Test", dueAt };
      const submission = {
        id: "late-submission", assignmentId: assignment.id, studentName: "Student, UI", grade: "5",
        submittedAt: "2026-08-02T13:00:00.000Z", status: "submitted", submissionType: "link",
        projectTitle: "Late Project", projectUrl: "https://www.canva.com/design/example/view", note: "", feedback: ""
      };
      const original = { assignments, selectedSubmissionId };
      try {
        assignments = [assignment];
        selectedSubmissionId = submission.id;
        const row = new DOMParser().parseFromString(renderTeacherSubmissionRow(submission), "text/html");
        const preview = new DOMParser().parseFromString(renderTeacherSubmissionPreview(submission), "text/html");
        return {
          onTime: submissionTimingDetails(assignment, { submittedAt: "2026-08-01T11:59:00.000Z" })?.label,
          oneDayLate: submissionTimingDetails(assignment, { submittedAt: "2026-08-01T12:01:00.000Z" })?.label,
          rowBadge: row.querySelector(".submission-late-badge")?.textContent.trim(),
          previewBadge: preview.querySelector(".submission-late-badge")?.textContent.trim(),
          noDueDateBadge: renderSubmissionTimingBadge({ dueAt: "" }, submission)
        };
      } finally {
        ({ assignments, selectedSubmissionId } = original);
      }
    });
    if (lateSubmissionFixture.onTime !== "On time" || lateSubmissionFixture.oneDayLate !== "Late by 1 day"
      || lateSubmissionFixture.rowBadge !== "Late by 2 days" || lateSubmissionFixture.previewBadge !== "Late by 2 days"
      || lateSubmissionFixture.noDueDateBadge !== "") {
      throw new Error(`Teacher late-day indicators are incorrect: ${JSON.stringify(lateSubmissionFixture)}.`);
    }
    const launchpadFeedbackFixture = await page.evaluate(() => {
      const originalSession = authSession;
      try {
        authSession = { authenticated: true, role: "student", name: "Student, UI", email: "ui.fixture@scscolts.org", grade: "5" };
        const markup = renderStudentWebsiteRequest();
        const fixture = new DOMParser().parseFromString(markup, "text/html");
        const select = fixture.querySelector("#requestFeedbackType");
        const layoutFixture = document.createElement("div");
        layoutFixture.style.width = "1130px";
        layoutFixture.innerHTML = markup;
        document.body.append(layoutFixture);
        const cardRect = layoutFixture.querySelector(".student-request-entry-card").getBoundingClientRect();
        const typeRect = layoutFixture.querySelector(".request-feedback-type").getBoundingClientRect();
        const messageRect = layoutFixture.querySelector(".request-message-field").getBoundingClientRect();
        const formRect = layoutFixture.querySelector(".student-request-form").getBoundingClientRect();
        const buttonRect = layoutFixture.querySelector('button[type="submit"]').getBoundingClientRect();
        const layout = {
          feedbackFieldsShareRow: Math.abs(typeRect.top - messageRect.top) < 2,
          buttonInsidePanel: buttonRect.bottom <= cardRect.bottom && buttonRect.left >= formRect.left && buttonRect.right <= formRect.right,
          buttonSpansForm: Math.abs(buttonRect.width - formRect.width) < 2
        };
        layoutFixture.remove();
        return {
          kicker: fixture.querySelector(".request-heading .feature-kicker")?.textContent.trim(),
          heading: fixture.querySelector(".request-heading h2")?.textContent.trim(),
          description: fixture.querySelector(".request-heading p")?.textContent.trim(),
          labels: [...fixture.querySelectorAll(".student-request-form label")].map(label => label.textContent.trim()),
          options: [...select.options].slice(1).map(option => option.textContent.trim()),
          required: select.required,
          placeholder: fixture.querySelector("#requestWebsiteName")?.getAttribute("placeholder"),
          button: fixture.querySelector('button[type="submit"]')?.textContent.trim(),
          validRequestError: validateWebsiteRequest({ studentName: "Student, UI", grade: "5", feedbackType: "Broken link", websiteName: "The practice link is broken." }),
          layout
        };
      } finally {
        authSession = originalSession;
      }
    });
    const expectedFeedbackOptions = ["Website suggestion", "Feature request", "Bug or glitch", "Broken link", "Other"];
    if (launchpadFeedbackFixture.kicker !== "Launchpad Feedback"
      || launchpadFeedbackFixture.heading !== "Suggest or Report Something"
      || launchpadFeedbackFixture.description !== "Send Mr. Nieves a website suggestion, feature idea, or report a bug or glitch in Classroom Launchpad."
      || JSON.stringify(launchpadFeedbackFixture.labels) !== JSON.stringify(["Your name", "Grade", "Type of feedback", "Website, feature, or issue"])
      || JSON.stringify(launchpadFeedbackFixture.options) !== JSON.stringify(expectedFeedbackOptions)
      || !launchpadFeedbackFixture.required || launchpadFeedbackFixture.placeholder !== "Example: a new website, calculator, broken link, bug, or display problem"
      || launchpadFeedbackFixture.button !== "Submit Feedback" || launchpadFeedbackFixture.validRequestError !== ""
      || !launchpadFeedbackFixture.layout.feedbackFieldsShareRow || !launchpadFeedbackFixture.layout.buttonInsidePanel
      || !launchpadFeedbackFixture.layout.buttonSpansForm) {
      throw new Error(`Launchpad feedback form does not match the requested wording and controls: ${JSON.stringify(launchpadFeedbackFixture)}.`);
    }
    await page.evaluate(() => {
      localStorage.removeItem("classroomLaunchpadHomeProfileQueueV1");
      localStorage.removeItem("classroomLaunchpadHomeProfileLastV1");
    });
    const profileVisits = [];
    for (let visit = 0; visit < 12; visit += 1) {
      await page.reload({ waitUntil: "networkidle" });
      const sources = await page.locator(".school-photo source").evaluateAll(items => items.map(item => item.getAttribute("data-src").split("?")[0]));
      if (sources.length !== 1) throw new Error(`Expected one selected home profile video, found ${sources.length}.`);
      const profileMetadata = await page.locator(".school-photo").evaluate(video => new Promise((resolve, reject) => {
        const done = () => resolve({ width: video.videoWidth, height: video.videoHeight, duration: video.duration });
        if (video.readyState >= 1) return done();
        const timer = setTimeout(() => reject(new Error("Profile video metadata timed out.")), 5000);
        video.addEventListener("loadedmetadata", () => { clearTimeout(timer); done(); }, { once: true });
        video.addEventListener("error", () => { clearTimeout(timer); reject(new Error("Profile video failed to load.")); }, { once: true });
      }));
      const supportedProfileSize = profileMetadata.width === profileMetadata.height
        && profileMetadata.width >= 544
        && profileMetadata.width <= 1080;
      if (!supportedProfileSize || profileMetadata.duration < 5.7) {
        throw new Error(`Profile video has invalid optimized metadata: ${JSON.stringify(profileMetadata)}.`);
      }
      profileVisits.push(sources[0]);
    }
    if (new Set(profileVisits).size !== 12) {
      throw new Error(`Home profile rotation repeated before showing all twelve videos: ${JSON.stringify(profileVisits)}.`);
    }
    await page.reload({ waitUntil: "networkidle" });
    const nextProfile = await page.locator(".school-photo source").getAttribute("data-src");
    if (nextProfile.split("?")[0] === profileVisits[profileVisits.length - 1]) {
      throw new Error("Home profile rotation repeated the same video on consecutive visits.");
    }
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
    const requestDashboardText = await page.locator("#dashboardWorkspace").innerText();
    if (!requestDashboardText.includes("Launchpad Feedback") || !requestDashboardText.includes("Pending Launchpad Feedback") || requestDashboardText.includes("Pending Addition Requests")) {
      throw new Error(`Teacher feedback dashboard wording does not match the student form: ${JSON.stringify(requestDashboardText)}.`);
    }
    await page.locator('[data-action="back"]').first().click();
    await page.locator('[data-action="teacher"]').first().click();
    const defaultDashboardSection = await page.locator(".dashboard-nav-button.is-active").innerText();
    if (!defaultDashboardSection.includes("Overview")) {
      throw new Error(`Teacher Dashboard reopened on ${defaultDashboardSection} instead of Overview.`);
    }
    console.log(JSON.stringify({
      homepageRendersBeforeAccountChecks: true,
      homepageQuickNavigationPreservesContentSize: true,
      homepageQuickNavigationResponsive: true,
      studentAssignmentNotificationGroupsMatchTabs: true,
      studentAssignmentNotificationBadgesFitCompactScreens: true,
      teacherSubmissionLateDaysAppearInInboxAndPreview: true,
      launchpadFeedbackFormIncludesRequiredType: true,
      launchpadFeedbackFormFitsInsidePanel: true,
      twelveHomeProfileVideosRotateWithoutImmediateRepeats: true,
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
      teacherFeedbackDashboardMatchesStudentForm: true,
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
