const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "../app.js"), "utf8");
const storage = new Map();
const context = vm.createContext({
  authSession: { authenticated: true, role: "teacher", email: "teacher@example.com" },
  classThreads: [
    { id: "four", grade: "4", createdAt: "2026-09-19T10:00:00Z" },
    { id: "six", grade: "6", createdAt: "2026-09-19T12:00:00Z" },
    { id: "seven", grade: "7", createdAt: "2026-09-19T11:00:00Z" }
  ],
  screen: { name: "home" },
  teacherColtCornerGrade: "4",
  COLT_CORNER_SEEN_TOPICS_KEY: "test-seen",
  localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) }
});
vm.runInContext(`
  function isSignedIn() { return authSession.authenticated; }
  function isTeacher() { return authSession.role === "teacher"; }
  function isApprovedStudent() { return authSession.role === "student"; }
  function coltCornerAudienceGrade(thread) { return thread.audienceGrade || thread.grade; }
  function setScreen(value) { screen = value; }
  ${source.slice(source.indexOf("function coltCornerSeenTopicsStorageKey()"), source.indexOf("function isTeacher()"))}
`, context);
const run = code => vm.runInContext(code, context);
run("openNewColtCornerTopic()");
assert.equal(context.screen.id, "six");
assert.equal(context.teacherColtCornerGrade, "6");
run("markVisibleColtCornerTopicsSeen()");
assert.deepEqual(Array.from(run("unreadColtCornerTopics().map(topic => topic.id)")), ["four", "seven"]);
run("openNewColtCornerTopic()");
assert.equal(context.screen.id, "seven");
assert.equal(context.teacherColtCornerGrade, "7");
context.screen = { name: "coltCorner" };
run("markVisibleColtCornerTopicsSeen()");
assert.deepEqual(Array.from(run("unreadColtCornerTopics().map(topic => topic.id)")), ["four"]);
run("openNewColtCornerTopic(); markVisibleColtCornerTopicsSeen(); openNewColtCornerTopic()");
assert.equal(context.screen.name, "coltCorner");
context.authSession = { authenticated: true, role: "student", email: "student@example.com", grade: "4" };
run("openNewColtCornerTopic()");
assert.equal(context.screen.id, "four", "Students must only be sent to their own grade.");
context.authSession.authenticated = false;
run("openNewColtCornerTopic()");
assert.equal(context.screen.name, "login");
assert(source.includes('data-action="openNewColtCornerTopic"'));
assert(source.includes('if (action === "openNewColtCornerTopic") openNewColtCornerTopic();'));
console.log("Colt Corner bell navigation and grade-specific seen-state checks passed.");
