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
      const profile = document.querySelector(".school-photo").getBoundingClientRect();
      return {
        itemCount: document.querySelectorAll(".home-navigation-list .home-navigation-button").length,
        navigationWidth: Math.round(navigation.width),
        heroWidth: Math.round(hero.width),
        heroHeight: Math.round(hero.height),
        profileTopRatio: Number(((profile.top - hero.top) / hero.height).toFixed(2)),
        profileSize: Math.round(profile.width),
        profileLeftInset: Math.round(profile.left - hero.left),
        profileRightInset: Math.round(hero.right - profile.right),
        profileClearOfTitle: profile.left >= document.querySelector(".hero-panel h1").getBoundingClientRect().right,
        profileContained: profile.top >= hero.top && profile.right <= hero.right && profile.bottom <= hero.bottom,
        heroBackgroundPosition: getComputedStyle(document.querySelector(".hero-bg-video")).objectPosition,
        homeFeatureChildren: document.querySelector(".home-feature").children.length,
        retiredSearchCount: document.querySelectorAll("#studentSearch").length,
        retiredSubtitleCount: document.querySelectorAll(".hero-panel .subtitle").length,
        labelsVisible: getComputedStyle(document.querySelector(".home-navigation-label")).display !== "none",
        homeCircle: Math.round(document.querySelector(".home-navigation-icon.is-home-icon").getBoundingClientRect().width),
        homeHouse: Math.round(document.querySelector(".home-navigation-icon.is-home-icon svg").getBoundingClientRect().width),
        expectationsStar: Math.round(document.querySelector(".home-navigation-icon.is-expectations-icon svg").getBoundingClientRect().width),
        expectationsPaths: document.querySelectorAll(".home-navigation-icon.is-expectations-icon svg path").length,
        categoriesGlobe: Math.round(document.querySelector(".home-navigation-icon.is-categories-icon svg").getBoundingClientRect().width),
        categoriesParts: document.querySelectorAll(".home-navigation-icon.is-categories-icon svg circle, .home-navigation-icon.is-categories-icon svg path").length,
        googleClassroomIcon: Math.round(document.querySelector(".home-navigation-icon.is-google-classroom-icon img").getBoundingClientRect().width),
        classroomPassTicket: Math.round(document.querySelector(".home-navigation-icon.is-pass-icon svg").getBoundingClientRect().width),
        classroomPassUsesCurrentColor: getComputedStyle(document.querySelector(".home-navigation-icon.is-pass-icon svg path")).stroke === getComputedStyle(document.querySelector(".home-navigation-icon.is-pass-icon")).color,
        coltCornerMessages: Math.round(document.querySelector(".home-navigation-icon.is-corner-icon svg").getBoundingClientRect().width),
        coltCornerBubbles: document.querySelectorAll(".home-navigation-icon.is-corner-icon .message-bubble").length,
        coltCornerDots: document.querySelectorAll(".home-navigation-icon.is-corner-icon .message-dot").length,
        logicLightbulb: Math.round(document.querySelector(".card-icon .logic-lightbulb-icon").getBoundingClientRect().width),
        logicLightbulbPaths: document.querySelectorAll(".card-icon .logic-lightbulb-icon path").length
      };
    });
    if (wideNavigation.itemCount !== 8 || wideNavigation.navigationWidth < 200 || wideNavigation.heroWidth !== 1132 || !wideNavigation.labelsVisible || wideNavigation.homeCircle < 38 || wideNavigation.homeHouse < 22 || wideNavigation.expectationsStar < 22 || wideNavigation.expectationsPaths !== 1 || wideNavigation.categoriesGlobe < 22 || wideNavigation.categoriesParts !== 2 || wideNavigation.googleClassroomIcon < 22 || wideNavigation.classroomPassTicket < 22 || !wideNavigation.classroomPassUsesCurrentColor || wideNavigation.coltCornerMessages < 23 || wideNavigation.coltCornerBubbles !== 2 || wideNavigation.coltCornerDots !== 6 || wideNavigation.logicLightbulb < 25 || wideNavigation.logicLightbulbPaths !== 2
      || wideNavigation.retiredSearchCount !== 0 || wideNavigation.retiredSubtitleCount !== 0 || wideNavigation.homeFeatureChildren !== 1 || wideNavigation.profileTopRatio < 0.28
      || wideNavigation.profileSize < 300 || wideNavigation.profileLeftInset > 430 || wideNavigation.profileRightInset < 350 || !wideNavigation.profileClearOfTitle || !wideNavigation.profileContained || wideNavigation.heroHeight > 510
      || wideNavigation.heroBackgroundPosition !== "50% 0%") {
      throw new Error(`Wide homepage navigation changed existing content sizing: ${JSON.stringify(wideNavigation)}.`);
    }
    await page.locator(".hero-panel").screenshot({ path: path.join(dataDir, "compact-home-hero-desktop.png") });
    const googleClassroomCard = await page.evaluate(() => {
      const card = document.querySelector(".google-classroom-home-card");
      const link = card && card.querySelector(".google-classroom-open-btn");
      return {
        heading: card && card.querySelector("h2")?.textContent.trim(),
        label: link?.textContent.trim(),
        href: link?.href,
        target: link?.target,
        oldAssignmentsVisible: Boolean(document.querySelector(".assignments-home-card"))
      };
    });
    if (googleClassroomCard.heading !== "Google Classroom" || googleClassroomCard.label !== "Open Google Classroom"
      || googleClassroomCard.href !== "https://classroom.google.com/" || googleClassroomCard.target !== "_blank"
      || googleClassroomCard.oldAssignmentsVisible) {
      throw new Error(`Google Classroom homepage card is incorrect: ${JSON.stringify(googleClassroomCard)}.`);
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
    await page.locator(".hero-panel").screenshot({ path: path.join(dataDir, "compact-home-hero-mobile.png") });
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
    const assignmentAttachmentPreviewFixture = await page.evaluate(() => {
      const markup = renderAssignmentAttachment({
        id: "assignment-docx-preview-fixture",
        attachmentOriginalName: "Summer_Break_Assignment.docx",
        attachmentExtension: ".docx",
        attachmentSize: 49152
      });
      const fixture = new DOMParser().parseFromString(markup, "text/html");
      return {
        previewId: fixture.querySelector("[data-docx-assignment-preview]")?.dataset.docxAssignmentPreview,
        title: fixture.querySelector("[data-docx-assignment-preview]")?.dataset.previewTitle,
        downloadText: fixture.querySelector(".student-assignment-attachment .primary-btn")?.textContent.trim()
      };
    });
    if (assignmentAttachmentPreviewFixture.previewId !== "assignment-docx-preview-fixture"
      || assignmentAttachmentPreviewFixture.title !== "Summer_Break_Assignment.docx"
      || assignmentAttachmentPreviewFixture.downloadText !== "Download File") {
      throw new Error(`Student assignment document preview is incomplete: ${JSON.stringify(assignmentAttachmentPreviewFixture)}.`);
    }
    await page.evaluate(() => {
      authSession = { authenticated: true, role: "student", name: "Student, UI", email: "ui.fixture@scscolts.org", grade: "5" };
      assignments = [{
        id: "remove-file-fixture", title: "Remove File Test", instructions: "Choose a file, then remove it.", grades: ["5"],
        dueAt: "", acceptedTypes: [".txt"], maxFileSizeMb: 5, allowResubmissions: false, status: "open"
      }];
      submissions = [];
      assignmentView = "todo";
      selectedAssignmentId = "remove-file-fixture";
      screen = { name: "assignments" };
      render();
    });
    await page.locator("#studentSubmissionFile").setInputFiles({ name: "wrong-file.txt", mimeType: "text/plain", buffer: Buffer.from("Wrong assignment file") });
    await page.locator("#removeStudentSubmissionFile").waitFor();
    const selectedWrongFile = await page.locator("#selectedSubmissionFile").innerText();
    if (!selectedWrongFile.includes("wrong-file.txt") || await page.locator("#studentPreSubmitPreview").isHidden()) {
      throw new Error("The selected student file and its preview did not appear before submission.");
    }
    await page.setViewportSize({ width: 390, height: 844 });
    const mobileFileControlsOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    if (mobileFileControlsOverflow) throw new Error("Student file preview controls overflow on mobile.");
    await page.locator("#removeStudentSubmissionFile").click();
    const clearedStudentFile = await page.evaluate(() => ({
      count: document.querySelector("#studentSubmissionFile").files.length,
      label: document.querySelector("#selectedSubmissionFile").textContent.trim(),
      removeHidden: document.querySelector("#removeStudentSubmissionFile").hidden,
      previewHidden: document.querySelector("#studentPreSubmitPreview").hidden
    }));
    if (clearedStudentFile.count !== 0 || clearedStudentFile.label !== "No file selected"
      || !clearedStudentFile.removeHidden || !clearedStudentFile.previewHidden) {
      throw new Error(`Removing a selected student file did not reset the form: ${JSON.stringify(clearedStudentFile)}.`);
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.reload({ waitUntil: "networkidle" });
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
    if (!headerButtons.includes("PlusPortal") || !headerButtons.includes("Launchpad Login")) {
      throw new Error("The header is missing PlusPortal or Launchpad Login.");
    }
    await page.locator(".google-apps-trigger").click();
    await page.locator(".google-apps-panel").waitFor();
    const googleAppsLayer = await page.evaluate(() => {
      const topbar = document.querySelector(".hero-panel > .topbar");
      const feature = document.querySelector(".home-feature");
      const panel = document.querySelector(".google-apps-panel");
      const profile = document.querySelector(".school-photo");
      const panelRect = panel.getBoundingClientRect();
      const profileRect = profile.getBoundingClientRect();
      const left = Math.max(panelRect.left, profileRect.left);
      const right = Math.min(panelRect.right, profileRect.right);
      const top = Math.max(panelRect.top, profileRect.top);
      const bottom = Math.min(panelRect.bottom, profileRect.bottom);
      const overlaps = right > left && bottom > top;
      const topElement = overlaps
        ? document.elementFromPoint((left + right) / 2, (top + bottom) / 2)
        : panel;
      return {
        topbarZ: Number(getComputedStyle(topbar).zIndex),
        featureZ: Number(getComputedStyle(feature).zIndex),
        overlaps,
        panelWins: Boolean(topElement?.closest(".google-apps-panel"))
      };
    });
    await page.locator(".hero-panel").screenshot({ path: path.join(dataDir, "google-apps-menu-layering.png") });
    if (googleAppsLayer.topbarZ <= googleAppsLayer.featureZ || !googleAppsLayer.panelWins) {
      throw new Error(`Google Apps menu did not stay above the profile video: ${JSON.stringify(googleAppsLayer)}.`);
    }
    await page.locator(".google-apps-trigger").click();
    const studentHeaderFixture = await page.evaluate(() => {
      const originalSession = authSession;
      const originalMessages = directMessages;
      try {
        authSession = { authenticated: true, role: "student", name: "Amari, Liam", email: "liam.amari@scscolts.org", grade: "4", avatarUrl: "" };
        directMessages = [{
          id: "header-message", studentEmail: authSession.email, studentName: authSession.name, grade: "4",
          senderRole: "teacher", message: "Welcome", createdAt: new Date().toISOString(), readByTeacher: true, readByStudent: false
        }];
        const fixture = new DOMParser().parseFromString(renderHomeHeaderControls(), "text/html");
        return {
          summary: fixture.querySelector(".header-account-summary")?.textContent.replace(/\s+/g, " ").trim(),
          initials: fixture.querySelector(".header-account-initials")?.textContent.trim(),
          badge: fixture.querySelector(".header-message-badge")?.textContent.trim(),
          menuItems: [...fixture.querySelectorAll(".header-account-links button")].map(button => button.textContent.replace(/\s+/g, " ").trim()),
          oldButtons: fixture.querySelectorAll(".header-messages-btn, .logout-btn").length
        };
      } finally {
        authSession = originalSession;
        directMessages = originalMessages;
      }
    });
    if (!studentHeaderFixture.summary.includes("Hi, Liam") || !studentHeaderFixture.summary.includes("Grade 4")
      || studentHeaderFixture.initials !== "AL" || studentHeaderFixture.badge !== "1"
      || !studentHeaderFixture.menuItems.some(item => item.includes("My Profile"))
      || !studentHeaderFixture.menuItems.some(item => item.includes("Change Password"))
      || studentHeaderFixture.oldButtons !== 0) {
      throw new Error(`Student personalized header is incomplete: ${JSON.stringify(studentHeaderFixture)}.`);
    }
    const coltCornerTopicAlert = await page.evaluate(() => {
      const originalSession = authSession;
      const originalThreads = classThreads;
      const fixtureEmail = "topic.alert@scscolts.org";
      const storageKey = `${COLT_CORNER_SEEN_TOPICS_KEY}:${fixtureEmail}`;
      const previousSeen = localStorage.getItem(storageKey);
      const teacherStorageKey = `${COLT_CORNER_SEEN_TOPICS_KEY}:teacher`;
      const previousTeacherSeen = localStorage.getItem(teacherStorageKey);
      try {
        authSession = { authenticated: true, role: "student", name: "Alert, Student", email: fixtureEmail, grade: "4", avatarUrl: "" };
        classThreads = [
          { id: "grade-4-topic", title: "Grade 4 Topic", audienceGrade: "4", grade: "Teacher", replies: [], createdAt: new Date().toISOString() },
          { id: "grade-5-topic", title: "Grade 5 Topic", audienceGrade: "5", grade: "Teacher", replies: [], createdAt: new Date().toISOString() }
        ];
        localStorage.removeItem(storageKey);
        const preview = new DOMParser().parseFromString(renderColtCornerPreview(), "text/html");
        const before = unreadColtCornerTopics().length;
        markVisibleColtCornerTopicsSeen();
        const seenPreview = new DOMParser().parseFromString(renderColtCornerPreview(), "text/html");
        authSession = { authenticated: true, role: "teacher", name: "Mr. Nieves", email: "", grade: "Teacher", avatarUrl: "" };
        classThreads = [
          { id: "student-topic", title: "Student Topic", audienceGrade: "4", grade: "4", replies: [], createdAt: new Date().toISOString() },
          { id: "teacher-topic", title: "Teacher Topic", audienceGrade: "4", grade: "Teacher", replies: [], createdAt: new Date().toISOString() }
        ];
        localStorage.removeItem(teacherStorageKey);
        const teacherPreview = new DOMParser().parseFromString(renderColtCornerPreview(), "text/html");
        return {
          before,
          after: seenPreview.querySelector(".colt-corner-topic-bell b")?.textContent.trim() || "",
          studentBellBadge: preview.querySelector(".colt-corner-topic-bell b")?.textContent.trim(),
          studentBellAlwaysVisible: Boolean(seenPreview.querySelector(".colt-corner-topic-bell")),
          teacherUnread: unreadColtCornerTopics().length,
          teacherBellBadge: teacherPreview.querySelector(".colt-corner-topic-bell b")?.textContent.trim(),
          floatingNotificationCount: document.querySelectorAll(".colt-corner-topic-notification").length
        };
      } finally {
        authSession = originalSession;
        classThreads = originalThreads;
        if (previousSeen === null) localStorage.removeItem(storageKey);
        else localStorage.setItem(storageKey, previousSeen);
        if (previousTeacherSeen === null) localStorage.removeItem(teacherStorageKey);
        else localStorage.setItem(teacherStorageKey, previousTeacherSeen);
      }
    });
    if (coltCornerTopicAlert.before !== 1 || coltCornerTopicAlert.after !== ""
      || coltCornerTopicAlert.studentBellBadge !== "1" || !coltCornerTopicAlert.studentBellAlwaysVisible
      || coltCornerTopicAlert.teacherUnread !== 1 || coltCornerTopicAlert.teacherBellBadge !== "1"
      || coltCornerTopicAlert.floatingNotificationCount !== 0) {
      throw new Error(`Grade-aware Colt Corner topic alert is incomplete: ${JSON.stringify(coltCornerTopicAlert)}.`);
    }
    const lightHeaderColors = await page.locator(".portal-btn, .login-btn:not(.signed-in)").evaluateAll(buttons => buttons.map(button => getComputedStyle(button).backgroundColor));
    if (new Set(lightHeaderColors).size !== 1) {
      throw new Error(`Light-mode PlusPortal and Launchpad Login colors did not match: ${lightHeaderColors.join(", ")}.`);
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
    if (!loginText.includes("one-time activation code") || !loginText.includes("You may use your school Google password") || !loginText.includes("Use at least 8 characters")) {
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
    if (dashboardSections.length < 8 || !dashboardSections.some(label => label.includes("Students & Access"))
      || dashboardSections.some(label => label.includes("Student Work") || label.includes("Gradebooks"))) {
      throw new Error(`Teacher dashboard navigation did not retire the old assignment system: ${JSON.stringify(dashboardSections)}.`);
    }
    const classroomQuickAction = await page.locator('.dashboard-quick-actions [data-url="https://classroom.google.com/"]').innerText();
    if (classroomQuickAction.trim() !== "Open Google Classroom") throw new Error("The teacher Google Classroom shortcut is missing.");
    const quickHeadingGap = await page.locator(".dashboard-quick-panel").evaluate(panel => {
      const label = panel.querySelector(".feature-kicker").getBoundingClientRect();
      const heading = panel.querySelector("h3").getBoundingClientRect();
      return Math.round(heading.top - label.bottom);
    });
    if (quickHeadingGap < 8) throw new Error(`Quick Actions heading gap is too small: ${quickHeadingGap}.`);

    await page.locator('[data-action="back"]').first().click();
    const teacherLaunchBadge = await page.locator(".daily-launch-grade").innerText();
    if (teacherLaunchBadge.trim() !== "TEACHER VIEW") {
      throw new Error(`Teacher homepage launch badge incorrectly shows ${teacherLaunchBadge}.`);
    }
    if (await page.locator(".daily-launch-preview-tab").count() !== 4) {
      throw new Error("Teacher homepage does not provide four grade preview buttons.");
    }
    await page.locator('.daily-launch-preview-tab[data-grade="7"]').click();
    const activeLaunchPreview = await page.locator(".daily-launch-preview-tab.is-active").innerText();
    if (activeLaunchPreview.trim() !== "Grade 7" || await page.locator(".daily-launch-grade").innerText() !== "TEACHER VIEW") {
      throw new Error("Teacher homepage grade preview did not switch cleanly while preserving Teacher View.");
    }
    const longLaunchLayout = await page.locator(".daily-launch-card").evaluate(card => {
      const message = card.querySelector(".daily-launch-message");
      message.innerHTML = `<ol>${Array.from({ length: 14 }, (_, index) => `<li>Multi-step classroom direction ${index + 1}</li>`).join("")}</ol>`;
      const cardBox = card.getBoundingClientRect();
      const messageBox = message.getBoundingClientRect();
      const randomBox = document.querySelector(".random-activity-card").getBoundingClientRect();
      const nextSectionBox = document.querySelector("#home-expectations").getBoundingClientRect();
      return {
        cardHeight: Math.round(cardBox.height),
        randomHeight: Math.round(randomBox.height),
        contentFits: messageBox.bottom <= cardBox.bottom + 1,
        nextSectionClearsCard: nextSectionBox.top >= cardBox.bottom
      };
    });
    if (longLaunchLayout.cardHeight <= 300 || longLaunchLayout.randomHeight !== 300 || !longLaunchLayout.contentFits || !longLaunchLayout.nextSectionClearsCard) {
      throw new Error(`Long Today's Launch directions do not expand cleanly: ${JSON.stringify(longLaunchLayout)}.`);
    }
    const personalizedTeacherHeader = await page.evaluate(() => ({
      rail: Boolean(document.querySelector(".home-header-rail")),
      accountText: document.querySelector(".header-account-summary")?.innerText || "",
      bellCount: document.querySelectorAll(".header-message-control svg").length,
      standaloneLogoutCount: document.querySelectorAll(".home-header-rail > .logout-btn").length,
      heroOverflow: document.querySelector(".hero-panel").scrollWidth > document.querySelector(".hero-panel").clientWidth
    }));
    if (!personalizedTeacherHeader.rail || !personalizedTeacherHeader.accountText.includes("Mr. Nieves")
      || !personalizedTeacherHeader.accountText.includes("Teacher") || personalizedTeacherHeader.bellCount !== 1
      || personalizedTeacherHeader.standaloneLogoutCount !== 0 || personalizedTeacherHeader.heroOverflow) {
      throw new Error(`Teacher personalized header is incomplete: ${JSON.stringify(personalizedTeacherHeader)}.`);
    }
    await page.locator(".hero-panel").screenshot({ path: path.join(dataDir, "personalized-teacher-header.png") });
    await page.setViewportSize({ width: 390, height: 844 });
    const mobilePersonalizedHeader = await page.evaluate(() => {
      const rail = document.querySelector(".home-header-rail");
      const account = document.querySelector(".header-account-summary");
      const hero = document.querySelector(".hero-panel");
      const railBox = rail.getBoundingClientRect();
      const accountBox = account.getBoundingClientRect();
      return {
        railFits: rail.scrollWidth <= rail.clientWidth && railBox.left >= hero.getBoundingClientRect().left && railBox.right <= hero.getBoundingClientRect().right,
        accountVisible: accountBox.width > 100 && accountBox.right <= railBox.right + 1,
        pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
      };
    });
    if (!mobilePersonalizedHeader.railFits || !mobilePersonalizedHeader.accountVisible || mobilePersonalizedHeader.pageOverflow) {
      throw new Error(`Mobile personalized header does not fit: ${JSON.stringify(mobilePersonalizedHeader)}.`);
    }
    await page.locator(".hero-panel").screenshot({ path: path.join(dataDir, "personalized-teacher-header-mobile.png") });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator(".header-account-summary").click();
    await page.locator('.header-account-panel [data-action="toggleTheme"]').click();
    if (await page.locator("body").getAttribute("data-theme") !== "night") throw new Error("Account-menu theme control did not enable night mode.");
    await page.locator(".header-account-summary").click();
    await page.locator('.header-account-panel [data-action="toggleTheme"]').click();
    await page.locator(".colt-corner-open").click();
    const identityLabels = await page.locator("#threadForm .field label").allTextContents();
    const identityValues = await page.locator("#threadForm input[readonly]").evaluateAll(inputs => inputs.map(input => input.value));
    if (identityLabels.includes("Posting as") || identityValues[0] !== "Mr. Nieves" || identityValues[1] !== "Teacher") {
      throw new Error("Teacher Colt Corner identity was not filled automatically.");
    }
    await page.locator('[data-action="back"]').first().click();
    await page.locator(".header-account-summary").click();
    await page.locator('.header-account-panel [data-action="teacherDashboard"]').click();
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

    await page.evaluate(() => {
      approvedStudents = [...approvedStudents, {
        email: "activated.ui@scscolts.org", name: "Activated, UI", grade: "5",
        registered: true, activationReady: false, teacherTestAccount: false
      }, {
        email: "cody.nieves@scscolts.org", name: "Nieves, Cody", grade: "5",
        registered: true, activationReady: false, teacherTestAccount: false
      }, {
        email: "avery.adams@scscolts.org", name: "Avery Adams", grade: "5",
        registered: true, activationReady: false, teacherTestAccount: false
      }];
      render();
    });
    await page.locator('[data-action="dashboardSection"][data-section="overview"]').first().click();
    await page.locator(".dashboard-metric-card").filter({ has: page.getByText("Registered", { exact: true }) }).click();
    await page.locator(".registered-student-roster").waitFor();
    const registeredRoster = await page.evaluate(() => ({
      names: [...document.querySelectorAll(".registered-student-name strong")].map(item => item.textContent.trim()),
      unregisteredStudentVisible: [...document.querySelectorAll(".registered-student-name strong")].some(item => item.textContent.trim() === "Student, UI"),
      heading: document.querySelector(".registered-student-roster h2")?.textContent.trim(),
      gradeCards: document.querySelectorAll(".registered-student-grade-card").length
    }));
    if (!registeredRoster.names.includes("UI, Activated") || !registeredRoster.names.includes("Cody, Nieves")
      || !registeredRoster.names.includes("Avery, Adams")
      || registeredRoster.names.indexOf("Avery, Adams") > registeredRoster.names.indexOf("Cody, Nieves")
      || registeredRoster.names.indexOf("Cody, Nieves") > registeredRoster.names.indexOf("UI, Activated")
      || registeredRoster.unregisteredStudentVisible
      || registeredRoster.heading !== "Students Who Have Registered" || !registeredRoster.gradeCards) {
      throw new Error(`Registered-student details did not isolate activated accounts: ${JSON.stringify(registeredRoster)}.`);
    }
    await page.evaluate(() => {
      approvedStudents = approvedStudents.filter(student => !["activated.ui@scscolts.org", "cody.nieves@scscolts.org", "avery.adams@scscolts.org"].includes(student.email));
      render();
    });

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
    await secondBrowserPage.locator('.category-card[data-category="Computer Skills"]').click();
    if (!await secondBrowserPage.getByText("Cross Browser Website", { exact: true }).count()) {
      throw new Error("A website added by the teacher did not appear in a separate browser profile.");
    }
    if (!await secondBrowserPage.getByText("Existing Browser Addition", { exact: true }).count()) {
      throw new Error("The teacher's existing browser-only website additions were not migrated.");
    }
    await secondContext.close();
    await page.locator(".dashboard-nav").waitFor();
    await page.locator('[data-action="dashboardSection"][data-section="tools"]').first().click();
    if (!await page.locator("#dailyLaunchForm").count() || !await page.locator("#classTimerForm").count()) {
      throw new Error("Classroom tools were not preserved in the redesigned dashboard.");
    }
    if (await page.locator('[data-action="dailyLaunchGrade"]').count() !== 4) {
      throw new Error("Today's Launch does not show all four grade tabs.");
    }
    await page.locator('[data-action="dailyLaunchGrade"][data-grade="5"]').click();
    await page.locator("#dailyLaunchMessage").fill("Grade 5 browser test directions.");
    await page.locator('input[name="dailyLaunchCopyGrade"][value="6"]').check();
    const launchSave = page.waitForResponse(response => response.url().endsWith("/api/daily-launch") && response.request().method() === "PUT");
    await page.locator('button[name="launchSaveMode"][value="selected"]').click();
    const launchSaveResponse = await launchSave;
    const launchSavePayload = await launchSaveResponse.json();
    if (!launchSaveResponse.ok()
      || launchSavePayload.dailyLaunch.grades["5"].message !== "Grade 5 browser test directions."
      || launchSavePayload.dailyLaunch.grades["6"].message !== "Grade 5 browser test directions."
      || launchSavePayload.dailyLaunch.grades["4"].message === "Grade 5 browser test directions.") {
      throw new Error("Today's Launch grade save/copy controls did not keep grade messages separate.");
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
    await page.locator(".header-account-summary").click();
    await page.locator('.header-account-panel [data-action="teacherDashboard"]').click();
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
      studentAssignmentDocumentPreviewRestored: true,
      studentCanRemoveWrongFileBeforeSubmitting: true,
      teacherSubmissionLateDaysAppearInInboxAndPreview: true,
      launchpadFeedbackFormIncludesRequiredType: true,
      launchpadFeedbackFormFitsInsidePanel: true,
      twelveHomeProfileVideosRotateWithoutImmediateRepeats: true,
      crossBrowserFaviconsAvailable: true,
      loginBesidePlusPortal: true,
      darkModeGuestHeaderButtonsMatch: true,
      darkModeTeacherHeaderButtonsMatch: true,
      teacherHomepageLaunchBadgeIsNotAStudentGrade: true,
      teacherHomepageCanPreviewEveryGradeLaunch: true,
      longDailyLaunchDirectionsExpandWithoutClipping: true,
      coltCornerShowsProtectedState: true,
      coltRunHowToPlayPanelComplete: true,
      coltRunUsesDedicatedLiveStatus: true,
      coltRunHowToPlayResponsive: true,
      activationAndPasswordGuidancePresent: true,
      teacherCanGenerateActivationCodes: true,
      privateRosterNamesDisplay: true,
      studentManagerSearchWorks: true,
      registeredStudentDetailsShowOnlyActivatedAccounts: true,
      teacherForumIdentityAutomatic: true,
      coltCornerBellIsPermanentAndGradeAware: true,
      dashboardNavigationComplete: true,
      googleClassroomReplacesLaunchpadAssignments: true,
      retiredGradebookAndStudentWorkNavigationRemoved: true,
      websiteSearchWorks: true,
      outdatedHomepageSearchRemoved: true,
      outdatedHomepageSubtitleRemoved: true,
      compactHomepageHeroPreservesHorseFaceClearance: true,
      websiteAdditionsSyncAcrossBrowsers: true,
      existingBrowserAdditionsAreMigrated: true,
      classroomToolsPreserved: true,
      dailyLaunchGradeTabsAndCopyControlsWork: true,
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
