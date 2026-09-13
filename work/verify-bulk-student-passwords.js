const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const port = 8146;
const origin = `http://127.0.0.1:${port}`;
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "launchpad-bulk-passwords-"));
const server = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], {
  cwd: path.join(__dirname, ".."),
  env: {
    ...process.env,
    PORT: String(port),
    DATA_DIR: dataDir,
    SESSION_SECRET: "bulk-password-verification-secret",
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
      if ((await fetch(`${origin}/api/health`)).ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Bulk password verification server did not start.");
}

(async () => {
  try {
    await waitForServer();
    const headers = { "Content-Type": "application/json", Origin: origin };
    const teacherLogin = await request("/api/auth/teacher", {
      method: "POST",
      headers,
      body: JSON.stringify({ pin: "654321" })
    });
    assert.equal(teacherLogin.response.status, 200);
    const teacherCookie = cookieFrom(teacherLogin.response);
    const teacherHeaders = { ...headers, Cookie: teacherCookie };

    const imported = await request("/api/approved-students/import", {
      method: "PUT",
      headers: teacherHeaders,
      body: JSON.stringify({ students: [
        { email: "first.student@scscolts.org", name: "First Student", grade: "4", activationCode: "FST-234" },
        { email: "second.student@scscolts.org", name: "Second Student", grade: "4", activationCode: "SND-234" },
        { email: "waiting.student@scscolts.org", name: "Waiting Student", grade: "4", activationCode: "WTG-234" }
      ] })
    });
    assert.equal(imported.response.status, 200);

    for (const [email, activationCode, password] of [
      ["first.student@scscolts.org", "FST-234", "old-first-password"],
      ["second.student@scscolts.org", "SND-234", "old-second-password"]
    ]) {
      const registration = await request("/api/auth/register", {
        method: "POST",
        headers,
        body: JSON.stringify({ email, activationCode, password })
      });
      assert.equal(registration.response.status, 200);
    }

    const unauthenticated = await request("/api/approved-students/passwords/bulk", {
      method: "PUT",
      headers,
      body: JSON.stringify({ students: [{ email: "first.student@scscolts.org", newPassword: "blocked" }] })
    });
    assert.equal(unauthenticated.response.status, 401);

    const reset = await request("/api/approved-students/passwords/bulk", {
      method: "PUT",
      headers: teacherHeaders,
      body: JSON.stringify({ students: [
        { email: "first.student@scscolts.org", newPassword: "new-first-password" },
        { email: "second.student@scscolts.org", newPassword: "different-second-password" },
        { email: "waiting.student@scscolts.org", newPassword: "must-not-activate" },
        { email: "unknown.student@scscolts.org", newPassword: "must-not-create" }
      ] })
    });
    assert.equal(reset.response.status, 200);
    assert.equal(reset.payload.updated, 2);
    assert.equal(reset.payload.requested, 4);
    assert(reset.payload.results.some(item => item.email === "waiting.student@scscolts.org" && item.status === "not-activated"));
    assert(reset.payload.results.some(item => item.email === "unknown.student@scscolts.org" && item.status === "not-found"));
    assert(!JSON.stringify(reset.payload).includes("new-first-password"), "Plaintext passwords leaked in the response.");

    for (const [email, password] of [
      ["first.student@scscolts.org", "new-first-password"],
      ["second.student@scscolts.org", "different-second-password"]
    ]) {
      const login = await request("/api/auth/login", {
        method: "POST",
        headers,
        body: JSON.stringify({ email, password })
      });
      assert.equal(login.response.status, 200, `${email} could not use its unique reset password.`);
    }

    console.log("Bulk student password verification passed.");
  } finally {
    server.kill();
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
