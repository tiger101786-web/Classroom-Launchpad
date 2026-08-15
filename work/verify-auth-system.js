const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const root = path.resolve(__dirname, "..");
const dataDir = path.join(__dirname, `auth-api-test-data-${process.pid}-${Date.now()}`);
fs.mkdirSync(dataDir, { recursive: true });

const child = spawn(process.execPath, ["server.js"], {
  cwd: root,
  env: {
    ...process.env,
    PORT: "8097",
    DATA_DIR: dataDir,
    SESSION_SECRET: "test-session-secret-at-least-32-characters",
    TEACHER_PIN: "654321",
    STUDENT_EMAIL_DOMAIN: "scscolts.org"
  },
  stdio: ["ignore", "pipe", "pipe"]
});

const base = "http://localhost:8097";
const originHeaders = { Origin: base, "Content-Type": "application/json" };

function check(value, message) {
  if (!value) throw new Error(message);
}

async function run() {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Server did not start.")), 5000);
    child.stdout.on("data", chunk => {
      if (String(chunk).includes("server running")) {
        clearTimeout(timer);
        resolve();
      }
    });
    child.on("exit", code => reject(new Error(`Server exited with ${code}.`)));
  });

  const guestStateResponse = await fetch(`${base}/api/state`);
  const guestState = await guestStateResponse.json();
  check(guestState.auth.role === "guest", "Guest state did not identify a guest.");
  check(Array.isArray(guestState.threads) && guestState.threads.length === 0, "Guest could read threads.");

  const guestWrite = await fetch(`${base}/api/threads`, {
    method: "PUT",
    headers: originHeaders,
    body: JSON.stringify({ threads: [] })
  });
  check(guestWrite.status === 401, `Guest thread write returned ${guestWrite.status}.`);

  const teacherLogin = await fetch(`${base}/api/auth/teacher`, {
    method: "POST",
    headers: originHeaders,
    body: JSON.stringify({ pin: "654321" })
  });
  check(teacherLogin.status === 200, `Teacher login returned ${teacherLogin.status}.`);
  const cookie = teacherLogin.headers.get("set-cookie").split(";")[0];
  const teacher = await teacherLogin.json();
  check(teacher.session.role === "teacher", "Teacher session role was incorrect.");
  check(teacher.session.name === "Mr. Nieves" && teacher.session.grade === "Teacher", "Teacher identity was not automatic.");

  const sharedLinks = [{
    id: "shared-test-link",
    title: "Shared Browser Test",
    instruction: "Verify this website appears everywhere.",
    url: "https://example.com/shared-browser-test",
    category: "Computer Skills",
    active: true,
    todayChoice: false
  }];
  const guestLinkWrite = await fetch(`${base}/api/links`, {
    method: "PUT",
    headers: originHeaders,
    body: JSON.stringify({ links: sharedLinks })
  });
  check(guestLinkWrite.status === 401, `Guest website-library write returned ${guestLinkWrite.status}.`);
  const teacherLinkWrite = await fetch(`${base}/api/links`, {
    method: "PUT",
    headers: { ...originHeaders, Cookie: cookie },
    body: JSON.stringify({ links: sharedLinks })
  });
  const teacherLinkResult = await teacherLinkWrite.json();
  check(teacherLinkWrite.status === 200 && teacherLinkResult.links[0].title === "Shared Browser Test", "Teacher could not save the shared website library.");
  const sharedGuestState = await fetch(`${base}/api/state`).then(response => response.json());
  check(sharedGuestState.links.some(link => link.id === "shared-test-link"), "A second browser could not read the shared website library.");

  const imported = await fetch(`${base}/api/approved-students/import`, {
    method: "PUT",
    headers: { ...originHeaders, Cookie: cookie },
    body: JSON.stringify({ emails: "test.student@scscolts.org invalid@example.com" })
  });
  const importResult = await imported.json();
  check(imported.status === 200 && importResult.added === 1, "Allowlist import did not filter the wrong domain.");
  const studentActivation = importResult.activationCodes.find(item => item.email === "test.student@scscolts.org");
  check(studentActivation, "Import did not issue a one-time activation code.");
  check(/^[A-Z]{3}-[2-9]{3}$/.test(studentActivation.activationCode), "Activation code did not use the short ABC-234 format.");

  const preassignedImport = await fetch(`${base}/api/approved-students/import`, {
    method: "PUT",
    headers: { ...originHeaders, Cookie: cookie },
    body: JSON.stringify({
      students: [{
        email: "preassigned.student@scscolts.org",
        name: "Student, Preassigned",
        grade: "4",
        activationCode: "CLT-786"
      }]
    })
  });
  const preassignedResult = await preassignedImport.json();
  check(preassignedImport.status === 200 && preassignedResult.added === 1, "Preassigned roster student was not added.");
  check(
    preassignedResult.activationCodes.some(item => item.email === "preassigned.student@scscolts.org" && item.activationCode === "CLT-786"),
    "The teacher-provided activation code was not preserved for the new student."
  );
  const preassignedRegistration = await fetch(`${base}/api/auth/register`, {
    method: "POST",
    headers: originHeaders,
    body: JSON.stringify({
      email: "preassigned.student@scscolts.org",
      activationCode: "CLT-786",
      name: "Student, Preassigned",
      grade: "4",
      password: "StudentPass123!"
    })
  });
  check(preassignedRegistration.status === 200, "The preassigned activation code could not activate the new student account.");

  await fetch(`${base}/api/approved-students/import`, {
    method: "PUT",
    headers: { ...originHeaders, Cookie: cookie },
    body: JSON.stringify({ emails: "example.student@scscolts.org" })
  });
  const apostropheImport = await fetch(`${base}/api/approved-students/import`, {
    method: "PUT",
    headers: { ...originHeaders, Cookie: cookie },
    body: JSON.stringify({ emails: "o'example.student@scscolts.org" })
  });
  const apostropheResult = await apostropheImport.json();
  check(apostropheImport.status === 200, `Apostrophe email import returned ${apostropheImport.status}.`);
  check(apostropheResult.students.some(student => student.email === "o'example.student@scscolts.org"), "Apostrophe email was not preserved.");
  check(!apostropheResult.students.some(student => student.email === "example.student@scscolts.org"), "Truncated apostrophe email was not repaired.");

  const rosterImport = await fetch(`${base}/api/approved-students/import`, {
    method: "PUT",
    headers: { ...originHeaders, Cookie: cookie },
    body: JSON.stringify({
      students: [
        { email: "test.student@scscolts.org", name: "Student, Test", grade: "5", activationCode: "NEW-234" },
        { email: "o'example.student@scscolts.org", name: "Example, O'Neil", grade: "6" }
      ]
    })
  });
  const rosterResult = await rosterImport.json();
  check(rosterImport.status === 200 && rosterResult.updated === 2, "Private roster names were not merged.");
  check(rosterResult.students.some(student => student.email === "test.student@scscolts.org" && student.name === "Student, Test" && student.grade === "5"), "Roster name and grade were not stored.");
  check(rosterResult.activationCodes.length === 0, "Roster update replaced an existing activation code.");

  const privateList = await fetch(`${base}/api/approved-students`, { headers: { Cookie: cookie, Origin: base } });
  const privateResult = await privateList.json();
  check(privateResult.students.some(student => student.email === "test.student@scscolts.org")
    && privateResult.students.some(student => student.email === "o'example.student@scscolts.org"), "Teacher could not read the private allowlist.");
  check(!("activationHash" in privateResult.students[0]) && !("passwordHash" in privateResult.students[0]), "Secret hashes leaked through the teacher API.");

  const outsiderList = await fetch(`${base}/api/approved-students`);
  check(outsiderList.status === 401, `Outsider allowlist read returned ${outsiderList.status}.`);

  const badOrigin = await fetch(`${base}/api/auth/teacher`, {
    method: "POST",
    headers: { Origin: "https://attacker.example", "Content-Type": "application/json" },
    body: JSON.stringify({ pin: "654321" })
  });
  check(badOrigin.status === 403, `Cross-origin login returned ${badOrigin.status}.`);

  const registration = await fetch(`${base}/api/auth/register`, {
    method: "POST",
    headers: originHeaders,
    body: JSON.stringify({
      email: "test.student@scscolts.org",
      activationCode: studentActivation.activationCode,
      name: "Verified Student",
      grade: "7",
      password: "correct-horse-classroom"
    })
  });
  check(registration.status === 200, `Student registration returned ${registration.status}.`);
  const studentCookie = registration.headers.get("set-cookie").split(";")[0];

  const studentWebsiteRequest = await fetch(`${base}/api/website-requests`, {
    method: "PUT",
    headers: { ...originHeaders, Cookie: studentCookie },
    body: JSON.stringify({
      websiteRequests: [{
        studentName: "Impersonated Name",
        grade: "7",
        feedbackType: "Bug or glitch",
        websiteName: "Shared Request Test"
      }]
    })
  });
  check(studentWebsiteRequest.status === 200, `Student website request returned ${studentWebsiteRequest.status}.`);
  const teacherStateAfterRequest = await fetch(`${base}/api/state`, {
    headers: { Origin: base, Cookie: cookie }
  }).then(response => response.json());
  const savedWebsiteRequest = teacherStateAfterRequest.websiteRequests.find(request => request.websiteName === "Shared Request Test");
  check(savedWebsiteRequest && savedWebsiteRequest.studentName === "Student, Test" && savedWebsiteRequest.grade === "5" && savedWebsiteRequest.feedbackType === "Bug or glitch", "Launchpad feedback was not shared with the teacher or did not preserve its type and approved student identity.");

  const missingFeedbackType = await fetch(`${base}/api/website-requests`, {
    method: "PUT",
    headers: { ...originHeaders, Cookie: studentCookie },
    body: JSON.stringify({ websiteRequests: [{ websiteName: "Missing feedback type" }] })
  });
  check(missingFeedbackType.status === 400, `Feedback without a required type returned ${missingFeedbackType.status}.`);

  const reusedCode = await fetch(`${base}/api/auth/register`, {
    method: "POST",
    headers: originHeaders,
    body: JSON.stringify({
      email: "test.student@scscolts.org",
      activationCode: studentActivation.activationCode,
      name: "Impersonator",
      grade: "7",
      password: "another-classroom-password"
    })
  });
  check(reusedCode.status === 409, `Reused activation code returned ${reusedCode.status}.`);

  const wrongPassword = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: originHeaders,
    body: JSON.stringify({ email: "test.student@scscolts.org", password: "wrong-password" })
  });
  check(wrongPassword.status === 401, `Wrong password returned ${wrongPassword.status}.`);

  const validLogin = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: originHeaders,
    body: JSON.stringify({ email: "test.student@scscolts.org", password: "correct-horse-classroom" })
  });
  check(validLogin.status === 200, `Valid password returned ${validLogin.status}.`);
  const newTopic = await fetch(`${base}/api/threads`, {
    method: "POST",
    headers: { ...originHeaders, Cookie: studentCookie },
    body: JSON.stringify({
      id: "student-supplied-id",
      studentName: "Impersonated Name",
      grade: "7",
      title: "Verified topic",
      message: "This is a test topic.",
      createdAt: "2000-01-01T00:00:00.000Z"
    })
  });
  const newTopicResult = await newTopic.json();
  check(newTopic.status === 200, `Approved student topic returned ${newTopic.status}.`);
  check(newTopicResult.threads[0].studentName === "Student, Test", "Student could spoof another name or replace the approved roster name.");
  check(newTopicResult.threads[0].grade === "5", "Student could spoof another grade.");
  check(newTopicResult.threads[0].id !== "student-supplied-id", "Server trusted a student-supplied topic ID.");

  const altered = structuredClone(newTopicResult.threads);
  altered[0].body = "Altered existing topic";
  const alterationAttempt = await fetch(`${base}/api/threads`, {
    method: "PUT",
    headers: { ...originHeaders, Cookie: studentCookie },
    body: JSON.stringify({ threads: altered })
  });
  check(alterationAttempt.status === 405, `Existing-topic alteration returned ${alterationAttempt.status}.`);

  const teacherTopic = await fetch(`${base}/api/threads`, {
    method: "POST",
    headers: { ...originHeaders, Cookie: cookie },
    body: JSON.stringify({
      id: "teacher-supplied-id",
      studentName: "Different Name",
      grade: "4",
      title: "Teacher topic",
      message: "This is a teacher topic.",
      createdAt: new Date().toISOString()
    })
  });
  const teacherTopicResult = await teacherTopic.json();
  check(teacherTopic.status === 200, `Teacher topic returned ${teacherTopic.status}.`);
  check(teacherTopicResult.threads[0].studentName === "Mr. Nieves" && teacherTopicResult.threads[0].grade === "Teacher", "Teacher post identity was not enforced.");

  console.log(JSON.stringify({
    guestCannotReadThreads: true,
    guestCannotWriteThreads: true,
    guestCannotEditWebsiteLibrary: true,
    websiteLibraryIsSharedAcrossBrowsers: true,
    teacherSessionWorks: true,
    wrongDomainFiltered: true,
    allowlistIsPrivate: true,
    crossOriginRequestBlocked: true,
    oneTimeActivationWorks: true,
    apostropheEmailsArePreserved: true,
    privateRosterNamesCanBeMerged: true,
    websiteRequestsAreSharedWithTeacher: true,
    passwordsAreRequired: true,
    studentIdentityCannotBeSpoofed: true,
    studentGradeCannotBeSpoofed: true,
    teacherPostsUseTeacherIdentity: true,
    studentCannotAlterExistingTopics: true
  }, null, 2));
}

run()
  .catch(error => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  })
  .finally(() => child.kill());
