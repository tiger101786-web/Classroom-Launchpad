const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const port = 8138;
const origin = `http://127.0.0.1:${port}`;
const testEmail = "tiger101786@gmail.com";
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "classroom-launchpad-teacher-test-"));
const server = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], {
  cwd: path.join(__dirname, ".."),
  env: {
    ...process.env,
    PORT: String(port),
    DATA_DIR: dataDir,
    SESSION_SECRET: "teacher-test-account-verification",
    TEACHER_PIN: "654321",
    STUDENT_EMAIL_DOMAIN: "scscolts.org"
  },
  stdio: ["ignore", "pipe", "pipe"]
});

function cookieFrom(response) {
  return String(response.headers.get("set-cookie") || "").split(";")[0];
}

async function request(pathname, options = {}) {
  const response = await fetch(`${origin}${pathname}`, options);
  const payload = await response.json();
  return { response, payload };
}

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${origin}/api/health`);
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Teacher test-account verification server did not start.");
}

(async () => {
  try {
    await waitForServer();

    const teacherLogin = await request("/api/auth/teacher", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin },
      body: JSON.stringify({ pin: "654321" })
    });
    assert.equal(teacherLogin.response.status, 200);
    const teacherCookie = cookieFrom(teacherLogin.response);

    const roster = await request("/api/approved-students", {
      headers: { Origin: origin, Cookie: teacherCookie }
    });
    const testStudent = roster.payload.students.find(student => student.email === testEmail);
    assert(testStudent, "The teacher test account should always be present.");
    assert.equal(testStudent.name, "Mr. Nieves Test Student");
    assert.equal(testStudent.grade, "4");
    assert.equal(testStudent.teacherTestAccount, true);

    const reset = await request(`/api/approved-students/${encodeURIComponent(testEmail)}/reset-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin, Cookie: teacherCookie },
      body: "{}"
    });
    assert.equal(reset.response.status, 200);
    assert.match(reset.payload.activationCode, /^[A-Z]{3}-[2-9]{3}$/);

    const register = await request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin },
      body: JSON.stringify({
        email: testEmail,
        activationCode: reset.payload.activationCode,
        name: "Ignored Name",
        grade: "7",
        password: "TeacherTestPass123!"
      })
    });
    assert.equal(register.response.status, 200);
    assert.equal(register.payload.session.role, "student");
    assert.equal(register.payload.session.name, "Mr. Nieves Test Student");
    assert.equal(register.payload.session.grade, "4");

    const teacherPasswordChange = await request(`/api/approved-students/${encodeURIComponent(testEmail)}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Origin: origin, Cookie: teacherCookie },
      body: JSON.stringify({ newPassword: "7" })
    });
    assert.equal(teacherPasswordChange.response.status, 200);
    assert.equal(teacherPasswordChange.payload.email, testEmail);

    const loginWithTeacherPassword = await request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin },
      body: JSON.stringify({ email: testEmail, password: "7" })
    });
    assert.equal(loginWithTeacherPassword.response.status, 200, "The teacher-set one-character password should work without activation or minimum-length rules.");
    assert.equal(loginWithTeacherPassword.payload.session.email, testEmail);

    const outsideGmail = await request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin },
      body: JSON.stringify({
        email: "not-approved@gmail.com",
        activationCode: "ABC-234",
        name: "Outside User",
        grade: "4",
        password: "OutsidePass123!"
      })
    });
    assert.equal(outsideGmail.response.status, 403);

    console.log("Teacher-owned student test account verification passed.");
  } finally {
    server.kill();
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
