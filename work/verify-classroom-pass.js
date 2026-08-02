const assert = require("node:assert/strict");
const fs = require("node:fs");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");

function availablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });
}

async function waitForServer(baseUrl) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      if ((await fetch(`${baseUrl}/api/health`)).ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Classroom Pass test server did not start.");
}

function cookieFrom(response) {
  return String(response.headers.get("set-cookie") || "").split(";")[0];
}

async function run() {
  const root = path.resolve(__dirname, "..");
  const port = await availablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "classroom-pass-"));
  const child = spawn(process.execPath, [path.join(root, "server.js")], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      DATA_DIR: dataDir,
      SESSION_SECRET: "classroom-pass-test-session-secret-that-is-long",
      TEACHER_PIN: "123456",
      NODE_ENV: "test"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  async function request(pathname, options = {}) {
    const response = await fetch(`${baseUrl}${pathname}`, options);
    const contentType = String(response.headers.get("content-type") || "");
    const payload = contentType.includes("application/json") ? await response.json() : await response.text();
    return { response, payload };
  }

  try {
    await waitForServer(baseUrl);
    const originHeaders = { Origin: baseUrl, "Content-Type": "application/json" };
    let result = await request("/api/auth/teacher", {
      method: "POST",
      headers: originHeaders,
      body: JSON.stringify({ pin: "123456" })
    });
    assert.equal(result.response.status, 200);
    const teacherCookie = cookieFrom(result.response);

    result = await request("/api/approved-students/import", {
      method: "PUT",
      headers: { ...originHeaders, Cookie: teacherCookie },
      body: JSON.stringify({ students: [
        { email: "pass.one@scscolts.org", name: "Pass Student One", grade: "5" },
        { email: "pass.two@scscolts.org", name: "Pass Student Two", grade: "6" }
      ] })
    });
    assert.equal(result.response.status, 200);
    const activationCodes = new Map(result.payload.activationCodes.map(item => [item.email, item.activationCode]));

    async function register(email, name, grade) {
      const registration = await request("/api/auth/register", {
        method: "POST",
        headers: originHeaders,
        body: JSON.stringify({ email, name, grade, activationCode: activationCodes.get(email), password: "StudentPass123!" })
      });
      assert.equal(registration.response.status, 200);
      return cookieFrom(registration.response);
    }

    const firstCookie = await register("pass.one@scscolts.org", "Pass Student One", "5");
    const secondCookie = await register("pass.two@scscolts.org", "Pass Student Two", "6");

    result = await request("/api/classroom-pass", { headers: { Cookie: firstCookie } });
    assert.equal(result.response.status, 200);
    assert.equal(result.payload.canStart, true);
    assert.equal(result.payload.activePass, null);
    assert.deepEqual(result.payload.destinations, ["Restroom", "Water", "Office", "Nurse", "Teacher Errand", "Other Approved Reason"]);

    const beforeStart = Date.now();
    result = await request("/api/classroom-pass/start", {
      method: "POST",
      headers: { ...originHeaders, Cookie: firstCookie },
      body: JSON.stringify({ destination: "Restroom", outAt: "2000-01-01T00:00:00.000Z", studentName: "Changed Name" })
    });
    assert.equal(result.response.status, 201);
    const firstPass = result.payload.activePass;
    assert.equal(firstPass.studentName, "Pass Student One");
    assert.equal(firstPass.grade, "5");
    assert.equal(firstPass.destination, "Restroom");
    assert(Date.parse(firstPass.outAt) >= beforeStart, "Departure time did not come from the server.");

    result = await request("/api/classroom-pass/start", {
      method: "POST",
      headers: { ...originHeaders, Cookie: firstCookie },
      body: JSON.stringify({ destination: "Water" })
    });
    assert.equal(result.response.status, 409);
    assert.equal(result.payload.code, "PASS_ALREADY_ACTIVE");

    result = await request("/api/classroom-pass", { headers: { Cookie: secondCookie } });
    assert.equal(result.payload.canStart, false);
    assert.equal(result.payload.passes.length, 0, "A student could see another student's pass history.");

    result = await request("/api/classroom-pass/start", {
      method: "POST",
      headers: { ...originHeaders, Cookie: secondCookie },
      body: JSON.stringify({ destination: "Water" })
    });
    assert.equal(result.response.status, 409);
    assert.equal(result.payload.code, "PASS_UNAVAILABLE");

    result = await request("/api/classroom-pass/config", {
      method: "PATCH",
      headers: { ...originHeaders, Cookie: teacherCookie },
      body: JSON.stringify({ enabled: true, maxActive: 2 })
    });
    assert.equal(result.response.status, 200);
    assert.equal(result.payload.config.maxActive, 2);

    result = await request("/api/classroom-pass/start", {
      method: "POST",
      headers: { ...originHeaders, Cookie: secondCookie },
      body: JSON.stringify({ destination: "Teacher Errand" })
    });
    assert.equal(result.response.status, 201);
    const secondPassId = result.payload.activePass.id;

    result = await request("/api/classroom-pass/return", {
      method: "POST",
      headers: { ...originHeaders, Cookie: firstCookie },
      body: "{}"
    });
    assert.equal(result.response.status, 200);
    assert.equal(result.payload.activePass, null);
    assert.equal(result.payload.passes[0].status, "returned");
    assert(Date.parse(result.payload.passes[0].returnedAt) >= Date.parse(firstPass.outAt));

    result = await request(`/api/classroom-pass/${encodeURIComponent(secondPassId)}`, {
      method: "PATCH",
      headers: { ...originHeaders, Cookie: teacherCookie },
      body: "{}"
    });
    assert.equal(result.response.status, 200);
    const corrected = result.payload.passes.find(pass => pass.id === secondPassId);
    assert.equal(corrected.status, "corrected");
    assert.equal(corrected.returnedBy, "Mr. Nieves");

    result = await request("/api/classroom-pass/export", { headers: { Cookie: teacherCookie } });
    assert.equal(result.response.status, 200);
    assert.match(result.response.headers.get("content-type"), /text\/csv/);
    assert.match(result.payload, /Pass Student One/);
    assert.match(result.payload, /Teacher Errand/);

    result = await request("/api/classroom-pass/config", {
      method: "PATCH",
      headers: { ...originHeaders, Cookie: teacherCookie },
      body: JSON.stringify({ enabled: false, maxActive: 2 })
    });
    assert.equal(result.payload.config.enabled, false);
    result = await request("/api/classroom-pass/start", {
      method: "POST",
      headers: { ...originHeaders, Cookie: firstCookie },
      body: JSON.stringify({ destination: "Office" })
    });
    assert.equal(result.response.status, 403);
    assert.equal(result.payload.code, "PASS_DISABLED");

    result = await request(`/api/classroom-pass/${encodeURIComponent(secondPassId)}`, {
      method: "DELETE",
      headers: { ...originHeaders, Cookie: teacherCookie },
      body: "{}"
    });
    assert.equal(result.response.status, 200);
    assert(!result.payload.passes.some(pass => pass.id === secondPassId));

    console.log(JSON.stringify({
      serverRecordedIdentityAndTime: true,
      destinationButtonsSupported: true,
      duplicatePassPrevented: true,
      capacityEnforced: true,
      studentPrivacyPreserved: true,
      studentReturnRecorded: true,
      teacherCorrectionSupported: true,
      teacherSettingsSupported: true,
      csvExportAvailable: true,
      accidentalRecordDeletionSupported: true
    }, null, 2));
  } finally {
    child.kill();
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
