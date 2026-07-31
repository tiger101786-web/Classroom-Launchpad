const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const port = 8137;
const origin = `http://127.0.0.1:${port}`;
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "classroom-launchpad-assignments-"));
const server = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], {
  cwd: path.join(__dirname, ".."),
  env: { ...process.env, PORT: String(port), DATA_DIR: dataDir, SESSION_SECRET: "assignment-test-secret", TEACHER_PIN: "654321", STUDENT_EMAIL_DOMAIN: "scscolts.org" },
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
  throw new Error("Assignment verification server did not start.");
}

(async () => {
  try {
    await waitForServer();

    const teacherLogin = await request("/api/auth/teacher", {
      method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify({ pin: "654321" })
    });
    assert.equal(teacherLogin.response.status, 200);
    const teacherCookie = cookieFrom(teacherLogin.response);

    const imported = await request("/api/approved-students/import", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Origin: origin, Cookie: teacherCookie },
      body: JSON.stringify({ students: [{ email: "avery.johnson@scscolts.org", name: "Avery Johnson", grade: "6" }] })
    });
    assert.equal(imported.response.status, 200);
    const activationCode = imported.payload.activationCodes[0].activationCode;

    const created = await request("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin, Cookie: teacherCookie },
      body: JSON.stringify({
        title: "Keyboard Shortcuts Practice", instructions: "Complete the practice sheet.", grades: ["6"],
        acceptedTypes: [".pdf"], maxFileSizeMb: 5, allowResubmissions: true, status: "open"
      })
    });
    assert.equal(created.response.status, 201);
    const assignmentId = created.payload.assignment.id;

    const registered = await request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin },
      body: JSON.stringify({ email: "avery.johnson@scscolts.org", activationCode, name: "Avery Johnson", grade: "6", password: "StudentPass123!" })
    });
    assert.equal(registered.response.status, 200);
    const studentCookie = cookieFrom(registered.response);

    const studentAssignments = await request("/api/assignments", { headers: { Cookie: studentCookie } });
    assert.equal(studentAssignments.payload.assignments.length, 1);
    assert.equal(studentAssignments.payload.submissions.length, 0);

    const pdf = Buffer.from("%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF");
    const submitted = await request(`/api/assignments/${assignmentId}/submissions`, {
      method: "POST",
      headers: { Origin: origin, Cookie: studentCookie, "Content-Type": "application/pdf", "X-File-Name": encodeURIComponent("Avery Shortcuts.pdf"), "X-Submission-Note": encodeURIComponent("Finished in class.") },
      body: pdf
    });
    assert.equal(submitted.response.status, 201);
    assert.equal(submitted.payload.submissions.length, 1);
    assert.equal(submitted.payload.submissions[0].studentName, "Avery Johnson");
    assert.equal(submitted.payload.submissions[0].storedName, undefined);
    const submissionId = submitted.payload.submission.id;

    const guestFile = await request(`/api/submissions/${submissionId}/file?view=inline`);
    assert.equal(guestFile.response.status, 401);
    const teacherFile = await request(`/api/submissions/${submissionId}/file?view=inline`, { headers: { Cookie: teacherCookie } });
    assert.equal(teacherFile.response.status, 200);
    assert.equal(teacherFile.payload.subarray(0, 5).toString("ascii"), "%PDF-");

    const forbiddenReview = await request(`/api/submissions/${submissionId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json", Origin: origin, Cookie: studentCookie }, body: JSON.stringify({ status: "reviewed" })
    });
    assert.equal(forbiddenReview.response.status, 403);

    const reviewed = await request(`/api/submissions/${submissionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Origin: origin, Cookie: teacherCookie },
      body: JSON.stringify({ status: "returned", feedback: "Excellent work. Please check number five." })
    });
    assert.equal(reviewed.response.status, 200);

    const studentAfterReview = await request("/api/assignments", { headers: { Cookie: studentCookie } });
    assert.equal(studentAfterReview.payload.submissions[0].status, "returned");
    assert.match(studentAfterReview.payload.submissions[0].feedback, /Excellent work/);

    const removed = await request(`/api/assignments/${assignmentId}`, {
      method: "DELETE", headers: { "Content-Type": "application/json", Origin: origin, Cookie: teacherCookie }, body: "{}"
    });
    assert.equal(removed.response.status, 200);
    assert.equal(removed.payload.assignments.length, 0);
    assert.equal(removed.payload.submissions.length, 0);

    console.log("Assignments and submissions verification passed.");
  } finally {
    server.kill();
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
