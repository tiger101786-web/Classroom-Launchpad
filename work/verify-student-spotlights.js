const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const port = 8146;
const origin = `http://127.0.0.1:${port}`;
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "classroom-launchpad-spotlights-"));
const server = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], {
  cwd: path.join(__dirname, ".."),
  env: { ...process.env, PORT: String(port), DATA_DIR: dataDir, SESSION_SECRET: "spotlight-test-secret", TEACHER_PIN: "654321", STUDENT_EMAIL_DOMAIN: "scscolts.org" },
  stdio: ["ignore", "pipe", "pipe"]
});

function cookieFrom(response) {
  return String(response.headers.get("set-cookie") || "").split(";")[0];
}

async function request(pathname, options = {}) {
  const response = await fetch(`${origin}${pathname}`, options);
  const type = response.headers.get("content-type") || "";
  const payload = type.includes("application/json") ? await response.json() : Buffer.from(await response.arrayBuffer());
  return { response, payload };
}

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const result = await request("/api/health");
      if (result.response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Spotlight verification server did not start.");
}

(async () => {
  try {
    await waitForServer();
    const guestState = await request("/api/state");
    assert.deepEqual(guestState.payload.studentSpotlights, []);

    const teacherLogin = await request("/api/auth/teacher", {
      method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify({ pin: "654321" })
    });
    const teacherCookie = cookieFrom(teacherLogin.response);
    const imported = await request("/api/approved-students/import", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Origin: origin, Cookie: teacherCookie },
      body: JSON.stringify({ students: [{ email: "avery.johnson@scscolts.org", name: "Avery Johnson", grade: "6" }] })
    });
    const activationCode = imported.payload.activationCodes[0].activationCode;

    const created = await request("/api/student-spotlights", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin, Cookie: teacherCookie },
      body: JSON.stringify({
        studentEmail: "avery.johnson@scscolts.org",
        title: "Ecosystem Research Project",
        description: "A clear and creative explanation of a local ecosystem.",
        displayNameStyle: "first-last-initial",
        projectUrl: "https://docs.google.com/presentation/d/example",
        status: "published"
      })
    });
    assert.equal(created.response.status, 201);
    assert.equal(created.payload.spotlight.displayName, "Avery J.");
    assert.equal(created.payload.spotlight.studentEmail, "avery.johnson@scscolts.org");
    const id = created.payload.spotlight.id;

    const pdf = Buffer.from("%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF");
    const uploaded = await request(`/api/student-spotlights/${id}/file`, {
      method: "POST",
      headers: { Origin: origin, Cookie: teacherCookie, "Content-Type": "application/pdf", "X-File-Name": encodeURIComponent("ecosystem.pdf") },
      body: pdf
    });
    assert.equal(uploaded.response.status, 201);
    assert.equal(uploaded.payload.spotlight.hasMedia, true);
    assert.equal(uploaded.payload.spotlight.mediaKind, "pdf");

    const registered = await request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin },
      body: JSON.stringify({ email: "avery.johnson@scscolts.org", activationCode, name: "Avery Johnson", grade: "6", password: "StudentPass123!" })
    });
    const studentCookie = cookieFrom(registered.response);
    const studentState = await request("/api/state", { headers: { Cookie: studentCookie } });
    assert.equal(studentState.payload.studentSpotlights.length, 1);
    assert.equal(studentState.payload.studentSpotlights[0].displayName, "Avery J.");
    assert.equal(studentState.payload.studentSpotlights[0].studentEmail, undefined);

    const studentFile = await request(`/api/student-spotlights/${id}/file`, { headers: { Cookie: studentCookie } });
    assert.equal(studentFile.response.status, 200);
    const guestFile = await request(`/api/student-spotlights/${id}/file`);
    assert.equal(guestFile.response.status, 401);

    const hidden = await request(`/api/student-spotlights/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Origin: origin, Cookie: teacherCookie },
      body: JSON.stringify({ status: "hidden" })
    });
    assert.equal(hidden.response.status, 200);
    const hiddenStudentState = await request("/api/state", { headers: { Cookie: studentCookie } });
    assert.equal(hiddenStudentState.payload.studentSpotlights.length, 0);

    const appSource = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
    assert.match(appSource, /Student Work Spotlight/);
    assert.match(appSource, /Open Student Spotlight/);
    assert.match(appSource, /home-student-spotlight/);
    assert.match(appSource, /Student Spotlight.*requiresAuth: true/);
    assert.match(appSource, /is-spotlight-icon/);
    assert.match(appSource, /student-spotlight-home-art\.png/);
    assert.match(appSource, /Creative Work, Great Ideas, Student Success/);
    assert.match(appSource, /Students Only/);
    assert.match(appSource, /Feature New Work/);
    assert.match(appSource, /class="spotlight-pdf-preview"/);
    assert(!appSource.includes('<b>PDF</b><small>Student Project</small>'));
    assert(!appSource.includes("sharedBackend.enabled = false"));
    assert.match(appSource, /could not reach the spotlight server/);
    console.log("Student spotlight verification passed.");
  } finally {
    server.kill("SIGTERM");
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
