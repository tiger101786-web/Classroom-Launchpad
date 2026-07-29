"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { moderateMessage, normalizeForModeration } = require("../colt-corner-moderation");

assert.equal(moderateMessage("What homework should I finish today?").status, "approved");
assert.equal(moderateMessage("You are an idiot.").status, "needs_review");
assert.equal(moderateMessage("This is f.u.c.k.i.n.g awful.").status, "blocked");
assert.equal(moderateMessage("Call me at 504-555-1212.").status, "blocked");
assert.equal(moderateMessage("Email me at student@example.com.").status, "blocked");
assert.equal(moderateMessage("My full name is Student Example.").status, "blocked");
assert.equal(moderateMessage("Visit https://example.com after class.").status, "needs_review");
assert.equal(moderateMessage("FOLLOW ME ON SOCIAL MEDIA").status, "blocked");
assert.equal(moderateMessage("THIS MESSAGE USES WAY TOO MANY CAPITAL LETTERS").status, "needs_review");
assert.equal(moderateMessage("<script>alert('x')</script>").status, "blocked");
assert.equal(moderateMessage("We learned about sex education in health class.").status, "approved");
assert.equal(normalizeForModeration("f - 0 - 0").compact, "foo");

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
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Moderation test server did not start.");
}

async function runIntegration() {
  const root = path.resolve(__dirname, "..");
  const port = await availablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "colt-corner-moderation-"));
  const existingThread = {
    id: "existing-topic",
    studentName: "Existing Student",
    grade: "5",
    title: "Existing topic",
    body: "This older message should remain visible.",
    createdAt: "2026-01-01T12:00:00.000Z",
    replies: []
  };
  fs.writeFileSync(path.join(dataDir, "classroom-launchpad-db.json"), JSON.stringify({ threads: [existingThread] }));

  const child = spawn(process.execPath, [path.join(root, "server.js")], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      DATA_DIR: dataDir,
      SESSION_SECRET: "moderation-test-session-secret-that-is-long",
      TEACHER_PIN: "123456",
      NODE_ENV: "test"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  let teacherCookie = "";
  let studentCookie = "";
  let secondStudentCookie = "";
  async function request(route, { method = "GET", body, cookie = "" } = {}) {
    const response = await fetch(`${baseUrl}${route}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
        ...(!["GET", "HEAD"].includes(method) ? { Origin: baseUrl } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const setCookie = response.headers.get("set-cookie");
    const payload = await response.json();
    return {
      status: response.status,
      payload,
      cookie: setCookie ? setCookie.split(";")[0] : ""
    };
  }

  try {
    await waitForServer(baseUrl);

    let response = await request("/api/auth/teacher", { method: "POST", body: { pin: "123456" } });
    assert.equal(response.status, 200);
    teacherCookie = response.cookie;

    response = await request("/api/approved-students/import", {
      method: "PUT",
      cookie: teacherCookie,
      body: {
        students: [
          { email: "moderation.student@scscolts.org", name: "Moderation Student", grade: "6" },
          { email: "second.student@scscolts.org", name: "Second Student", grade: "5" }
        ]
      }
    });
    assert.equal(response.status, 200);
    const activationCodes = new Map(response.payload.activationCodes.map(item => [item.email, item.activationCode]));

    response = await request("/api/auth/register", {
      method: "POST",
      body: {
        email: "moderation.student@scscolts.org",
        password: "ClassroomPassword123!",
        activationCode: activationCodes.get("moderation.student@scscolts.org"),
        name: "Moderation Student",
        grade: "6"
      }
    });
    assert.equal(response.status, 200);
    studentCookie = response.cookie;

    response = await request("/api/auth/register", {
      method: "POST",
      body: {
        email: "second.student@scscolts.org",
        password: "SecondClassroomPassword123!",
        activationCode: activationCodes.get("second.student@scscolts.org"),
        name: "Second Student",
        grade: "5"
      }
    });
    assert.equal(response.status, 200);
    secondStudentCookie = response.cookie;

    response = await request("/api/state", { cookie: studentCookie });
    assert(response.payload.threads.some(thread => thread.id === "existing-topic"));
    assert(!Object.hasOwn(response.payload, "moderation"));

    response = await request("/api/threads", {
      method: "POST",
      cookie: studentCookie,
      body: { title: "Homework question", message: "Which lesson should we complete today?" }
    });
    assert.equal(response.payload.moderationStatus, "approved");
    assert(response.payload.threads.some(thread => thread.title === "Homework question"));
    const homeworkThread = response.payload.threads.find(thread => thread.title === "Homework question");

    response = await request(`/api/threads/${homeworkThread.id}/replies`, {
      method: "POST",
      cookie: studentCookie,
      body: { message: "This is a respectful classroom reply." }
    });
    assert.equal(response.payload.moderationStatus, "needs_review");
    let teacherQueue = await request("/api/moderation", { cookie: teacherCookie });
    const pendingReply = teacherQueue.payload.moderation.pending.find(item => item.type === "reply");
    assert(pendingReply);
    response = await request(`/api/moderation/${pendingReply.id}`, {
      method: "PATCH",
      cookie: teacherCookie,
      body: { action: "approve" }
    });
    assert.equal(response.status, 200);
    const approvedHomework = response.payload.threads.find(thread => thread.id === homeworkThread.id);
    assert(approvedHomework.replies.some(reply => reply.message === "This is a respectful classroom reply."));

    response = await request("/api/threads", {
      method: "POST",
      cookie: studentCookie,
      body: { title: "Outside link", message: "Can we visit https://example.com for this project?" }
    });
    assert.equal(response.payload.moderationStatus, "needs_review");
    assert(!response.payload.threads.some(thread => thread.title === "Outside link"));
    assert.equal(response.payload.pendingModeration.length, 1);

    const studentModerationAttempt = await request("/api/moderation", { cookie: studentCookie });
    assert.equal(studentModerationAttempt.status, 401);

    response = await request("/api/moderation", { cookie: teacherCookie });
    assert.equal(response.status, 200);
    const pendingLink = response.payload.moderation.pending.find(item => item.title === "Outside link");
    assert(pendingLink);
    assert(pendingLink.moderationReasons.some(item => item.code === "external_link"));

    response = await request(`/api/moderation/${pendingLink.id}`, {
      method: "PATCH",
      cookie: teacherCookie,
      body: { action: "edit_approve", title: "Project resource question", message: "Can we use another approved project resource?" }
    });
    assert.equal(response.status, 200);
    assert(response.payload.threads.some(thread => thread.title === "Project resource question"));

    response = await request("/api/threads", {
      method: "POST",
      cookie: studentCookie,
      body: { title: "Unkind message", message: "You are an idiot." }
    });
    assert.equal(response.payload.moderationStatus, "needs_review");
    const unkindPending = (await request("/api/moderation", { cookie: teacherCookie }))
      .payload.moderation.pending.find(item => item.title === "Unkind message");
    assert(unkindPending);
    response = await request(`/api/moderation/${unkindPending.id}`, {
      method: "PATCH",
      cookie: teacherCookie,
      body: { action: "reject" }
    });
    assert.equal(response.status, 200);
    assert(response.payload.moderation.recent.some(item => (
      item.id === unkindPending.id && item.moderationStatus === "blocked"
    )));

    response = await request("/api/threads", {
      method: "POST",
      cookie: studentCookie,
      body: { title: "Delete this review", message: "Can we use https://delete.example.com?" }
    });
    assert.equal(response.payload.moderationStatus, "needs_review");
    const deletePending = (await request("/api/moderation", { cookie: teacherCookie }))
      .payload.moderation.pending.find(item => item.title === "Delete this review");
    assert(deletePending);
    response = await request(`/api/moderation/${deletePending.id}`, {
      method: "PATCH",
      cookie: teacherCookie,
      body: { action: "delete" }
    });
    assert.equal(response.status, 200);
    assert(!response.payload.moderation.pending.some(item => item.id === deletePending.id));

    response = await request("/api/threads", {
      method: "POST",
      cookie: studentCookie,
      body: { title: "Private information", message: "My email is student@example.com." }
    });
    assert.equal(response.payload.moderationStatus, "blocked");
    assert(!response.payload.threads.some(thread => thread.title === "Private information"));

    response = await request("/api/threads", {
      method: "POST",
      cookie: studentCookie,
      body: { title: "Unsafe markup", message: "<script>alert('x')</script>" }
    });
    assert.equal(response.payload.moderationStatus, "blocked");

    const firstDuplicate = await request("/api/threads", {
      method: "POST",
      cookie: secondStudentCookie,
      body: { title: "Repeated topic", message: "This is the same repeated classroom message." }
    });
    assert(["approved", "needs_review"].includes(firstDuplicate.payload.moderationStatus));
    const secondDuplicate = await request("/api/threads", {
      method: "POST",
      cookie: secondStudentCookie,
      body: { title: "Repeated topic", message: "This is the same repeated classroom message." }
    });
    assert.equal(secondDuplicate.payload.moderationStatus, "needs_review");
    const thirdDuplicate = await request("/api/threads", {
      method: "POST",
      cookie: secondStudentCookie,
      body: { title: "Repeated topic", message: "This is the same repeated classroom message." }
    });
    assert.equal(thirdDuplicate.payload.moderationStatus, "blocked");

    const db = JSON.parse(fs.readFileSync(path.join(dataDir, "classroom-launchpad-db.json"), "utf8"));
    assert(!JSON.stringify(db).includes("student@example.com"));
    assert(!JSON.stringify(db).includes("<script>"));
  } finally {
    child.kill();
    await new Promise(resolve => child.once("exit", resolve));
    const resolvedTemp = path.resolve(dataDir);
    if (resolvedTemp.startsWith(path.resolve(os.tmpdir()))) {
      fs.rmSync(resolvedTemp, { recursive: true, force: true });
    }
  }
}

runIntegration()
  .then(() => console.log("Colt Corner server-side moderation verification passed."))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
