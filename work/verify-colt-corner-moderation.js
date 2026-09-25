"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { moderateMessage, normalizeForModeration } = require("../colt-corner-moderation");

assert.equal(moderateMessage("What homework should I finish today?").status, "approved");
assert.equal(moderateMessage("You are an idiot.").status, "approved");
assert.equal(moderateMessage("This is f.u.c.k.i.n.g awful.").status, "blocked");
assert.equal(moderateMessage("Call me at 504-555-1212.").status, "blocked");
assert.equal(moderateMessage("Email me at student@example.com.").status, "blocked");
assert.equal(moderateMessage("My full name is Student Example.").status, "blocked");
assert.equal(moderateMessage("Visit https://example.com after class.").status, "approved");
assert.equal(moderateMessage("FOLLOW ME ON SOCIAL MEDIA").status, "blocked");
assert.equal(moderateMessage("THIS MESSAGE USES WAY TOO MANY CAPITAL LETTERS").status, "approved");
assert.equal(moderateMessage("<script>alert('x')</script>").status, "blocked");
assert.equal(moderateMessage("We learned about sex education in health class.").status, "approved");
assert.equal(normalizeForModeration("f - 0 - 0").compact, "foo");

for (const text of ["Hi", "YES!!!!!!", "I saw it on TikTok", "The assignment is about classic ships.", "We visited Scunthorpe.", "😊😊😊"]) {
  assert.equal(moderateMessage(text).status, "approved", text);
}
for (const text of ["computer class fuck", "sex education and porn", "f.u.c.k.i.n.g", "My Discord username is: student123", "My instagram is student123", "I live at 123 Main Street", "i will kill you"]) {
  assert.equal(moderateMessage(text).status, "blocked", text);
}
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
  fs.writeFileSync(path.join(dataDir, "classroom-launchpad-db.json"), JSON.stringify({
    threads: [existingThread],
    dailyLaunch: { message: "Legacy launch message copied to every grade.", updatedAt: "2026-01-01T12:00:00.000Z" }
  }));

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
    assert(!response.payload.threads.some(thread => thread.id === "existing-topic"));
    assert(!Object.hasOwn(response.payload, "moderation"));
    response = await request("/api/state", { cookie: secondStudentCookie });
    assert(response.payload.threads.some(thread => thread.id === "existing-topic"));

    response = await request("/api/daily-launch", {
      method: "PUT",
      cookie: teacherCookie,
      body: { message: "Grade 5 should open the reading activity.", grades: ["5"] }
    });
    assert.equal(response.status, 200);
    assert.equal(response.payload.dailyLaunch.grades["5"].message, "Grade 5 should open the reading activity.");

    response = await request("/api/daily-launch", {
      method: "PUT",
      cookie: teacherCookie,
      body: { message: "Grade 6 should open the math activity.", grade: "6" }
    });
    assert.equal(response.status, 200);

    response = await request("/api/state", { cookie: teacherCookie });
    assert.deepEqual(Object.keys(response.payload.dailyLaunch.grades).sort(), ["4", "5", "6", "7"]);
    assert.equal(response.payload.dailyLaunch.grades["4"].message, "Legacy launch message copied to every grade.");
    assert.equal(response.payload.dailyLaunch.grades["7"].message, "Legacy launch message copied to every grade.");

    response = await request("/api/state", { cookie: secondStudentCookie });
    assert.deepEqual(Object.keys(response.payload.dailyLaunch.grades), ["5"]);
    assert.equal(response.payload.dailyLaunch.grades["5"].message, "Grade 5 should open the reading activity.");

    response = await request("/api/state", { cookie: studentCookie });
    assert.deepEqual(Object.keys(response.payload.dailyLaunch.grades), ["6"]);
    assert.equal(response.payload.dailyLaunch.grades["6"].message, "Grade 6 should open the math activity.");

    response = await request("/api/state");
    assert.deepEqual(response.payload.dailyLaunch.grades, {});
    assert.equal(response.payload.dailyLaunch.requiresLogin, true);

    response = await request("/api/daily-launch", {
      method: "PUT",
      cookie: studentCookie,
      body: { message: "Students cannot change launch directions.", grade: "6" }
    });
    assert.equal(response.status, 401);

    response = await request("/api/threads", {
      method: "POST",
      cookie: teacherCookie,
      body: {
        title: "Shared teacher prompt",
        message: "Each grade receives a separate discussion copy.",
        grades: ["5", "6"]
      }
    });
    assert.equal(response.status, 200);
    const teacherCopies = response.payload.threads.filter(thread => thread.title === "Shared teacher prompt");
    assert.equal(teacherCopies.length, 2);
    assert.deepEqual(new Set(teacherCopies.map(thread => thread.audienceGrade)), new Set(["5", "6"]));

    response = await request("/api/state", { cookie: studentCookie });
    const gradeSixCopies = response.payload.threads.filter(thread => thread.title === "Shared teacher prompt");
    assert.equal(gradeSixCopies.length, 1);
    assert.equal(gradeSixCopies[0].audienceGrade, "6");

    response = await request("/api/state", { cookie: secondStudentCookie });
    const gradeFiveCopies = response.payload.threads.filter(thread => thread.title === "Shared teacher prompt");
    assert.equal(gradeFiveCopies.length, 1);
    assert.equal(gradeFiveCopies[0].audienceGrade, "5");

    response = await request("/api/threads", {
      method: "POST",
      cookie: studentCookie,
      body: { title: "Homework question", message: "Which lesson should we complete today?" }
    });
    assert.equal(response.payload.moderationStatus, "approved");
    assert(response.payload.threads.some(thread => thread.title === "Homework question"));
    const homeworkThread = response.payload.threads.find(thread => thread.title === "Homework question");

    const crossGradeReply = await request(`/api/threads/${homeworkThread.id}/replies`, {
      method: "POST",
      cookie: secondStudentCookie,
      body: { message: "A different grade must not reach this topic." }
    });
    assert.equal(crossGradeReply.status, 404);

    response = await request(`/api/threads/${homeworkThread.id}/replies`, {
      method: "POST",
      cookie: studentCookie,
      body: { message: "This is a respectful classroom reply." }
    });
    assert.equal(response.payload.moderationStatus, "approved");
    assert(response.payload.threads.find(thread => thread.id === homeworkThread.id).replies.some(reply => reply.message === "This is a respectful classroom reply."));
    for (const [title, message] of [
      ["Outside link", "Can we visit https://example.com for this project?"],
      ["Excited", "THIS IS SO COOL!!!!!!"],
      ["Short reply", "Hi"],
      ["Social discussion", "We discussed TikTok and Instagram in class."],
      ["Opinion", "This game is stupid but I like the artwork."]
    ]) {
      response = await request("/api/threads", {method:"POST", cookie:studentCookie, body:{title,message}});
      assert.equal(response.payload.moderationStatus, "approved", JSON.stringify(response.payload));
      assert(response.payload.threads.some(thread => thread.title === title));
      assert.equal(response.payload.pendingModeration.length, 0);
    }
    assert.equal((await request("/api/moderation", {cookie:studentCookie})).status, 401);
    const teacherQueue = await request("/api/moderation", {cookie:teacherCookie});
    assert.equal(teacherQueue.status, 200);
    assert.equal(teacherQueue.payload.moderation.pending.length, 0);

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
    assert.equal(secondDuplicate.payload.moderationStatus, "approved");
    const thirdDuplicate = await request("/api/threads", {
      method: "POST",
      cookie: secondStudentCookie,
      body: { title: "Repeated topic", message: "This is the same repeated classroom message." }
    });
    assert.equal(thirdDuplicate.payload.moderationStatus, "approved");

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
