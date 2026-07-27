const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const root = path.resolve(__dirname, "..");
const dataDir = path.join(__dirname, `auth-api-test-data-${process.pid}`);
fs.mkdirSync(dataDir, { recursive: true });

const child = spawn(process.execPath, ["server.js"], {
  cwd: root,
  env: {
    ...process.env,
    PORT: "8097",
    DATA_DIR: dataDir,
    SESSION_SECRET: "test-session-secret-at-least-32-characters",
    TEACHER_PIN: "654321",
    GOOGLE_CLIENT_ID: "test.apps.googleusercontent.com",
    TEACHER_GOOGLE_EMAIL: "cnieves@stcletuscolts.com"
  },
  stdio: ["ignore", "pipe", "pipe"]
});

const base = "http://localhost:8097";
const originHeaders = { Origin: base, "Content-Type": "application/json" };
const testSessionSecret = "test-session-secret-at-least-32-characters";

function signedStudentCookie() {
  const payload = Buffer.from(JSON.stringify({
    role: "student",
    sub: "google-student-123",
    email: "test.student@scscolts.org",
    name: "Verified Student",
    grade: "",
    exp: Date.now() + 60_000
  })).toString("base64url");
  const signature = crypto.createHmac("sha256", testSessionSecret).update(payload).digest("base64url");
  return `classroom_launchpad_session=${payload}.${signature}`;
}

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

  const imported = await fetch(`${base}/api/approved-students/import`, {
    method: "PUT",
    headers: { ...originHeaders, Cookie: cookie },
    body: JSON.stringify({ emails: "test.student@scscolts.org invalid@example.com" })
  });
  const importResult = await imported.json();
  check(imported.status === 200 && importResult.added === 1, "Allowlist import did not filter the wrong domain.");

  const privateList = await fetch(`${base}/api/approved-students`, { headers: { Cookie: cookie, Origin: base } });
  const privateResult = await privateList.json();
  check(privateResult.students.length === 1, "Teacher could not read the private allowlist.");

  const outsiderList = await fetch(`${base}/api/approved-students`);
  check(outsiderList.status === 401, `Outsider allowlist read returned ${outsiderList.status}.`);

  const badOrigin = await fetch(`${base}/api/auth/teacher`, {
    method: "POST",
    headers: { Origin: "https://attacker.example", "Content-Type": "application/json" },
    body: JSON.stringify({ pin: "654321" })
  });
  check(badOrigin.status === 403, `Cross-origin login returned ${badOrigin.status}.`);

  const studentCookie = signedStudentCookie();
  const newTopic = await fetch(`${base}/api/threads`, {
    method: "PUT",
    headers: { ...originHeaders, Cookie: studentCookie },
    body: JSON.stringify({ threads: [{
      id: "student-supplied-id",
      studentName: "Impersonated Name",
      grade: "5",
      title: "Verified topic",
      body: "This is a test topic.",
      createdAt: "2000-01-01T00:00:00.000Z",
      replies: []
    }] })
  });
  const newTopicResult = await newTopic.json();
  check(newTopic.status === 200, `Approved student topic returned ${newTopic.status}.`);
  check(newTopicResult.threads[0].studentName === "Verified Student", "Student could spoof another name.");
  check(newTopicResult.threads[0].id !== "student-supplied-id", "Server trusted a student-supplied topic ID.");

  const altered = structuredClone(newTopicResult.threads);
  altered[0].body = "Altered existing topic";
  const alterationAttempt = await fetch(`${base}/api/threads`, {
    method: "PUT",
    headers: { ...originHeaders, Cookie: studentCookie },
    body: JSON.stringify({ threads: altered })
  });
  check(alterationAttempt.status === 400, `Existing-topic alteration returned ${alterationAttempt.status}.`);

  console.log(JSON.stringify({
    guestCannotReadThreads: true,
    guestCannotWriteThreads: true,
    teacherSessionWorks: true,
    wrongDomainFiltered: true,
    allowlistIsPrivate: true,
    crossOriginRequestBlocked: true,
    studentIdentityCannotBeSpoofed: true,
    studentCannotAlterExistingTopics: true
  }, null, 2));
}

run()
  .catch(error => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  })
  .finally(() => child.kill());
