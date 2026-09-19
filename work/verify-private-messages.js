const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const server = fs.readFileSync(path.join(root, "server.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");

function check(value, message) {
  if (!value) throw new Error(message);
}

check(app.includes('id="showStudentLoginPassword"'), "Regular login is missing Show password.");
check(
  app.includes('data-password-targets="studentRegisterPassword studentRegisterPasswordConfirm"'),
  "First Login is missing Show passwords."
);
check(
  app.includes('input.type = visible ? "text" : "password"'),
  "Password visibility toggle behavior is missing."
);
check(app.includes('function renderDashboardMessages()'), "Teacher message center is missing.");
check(app.includes('function renderStudentMessages()'), "Student private message screen is missing.");
check(app.includes('Only Mr. Nieves and ${escapeHtml(studentName)} can view these messages.'), "Privacy notice is missing.");
check(server.includes('const studentEmail = allowed.role === "student" ? normalizeEmail(allowed.email) : normalizeEmail(body.studentEmail);'), "Student message identity is not enforced by the server.");
check(server.includes('return messages.filter(message => message.studentEmail === email);'), "Student message filtering is missing.");
check(server.includes('const allowed = requireRole(req, res, ["student", "teacher"]);'), "Private message endpoints require login.");
check(styles.includes(".password-visibility-control"), "Password control styling is missing.");
check(styles.includes(".teacher-message-center"), "Private message layout styling is missing.");
check(app.includes('id="teacherMessageSearch"'), "Teacher student search is missing.");
check(app.includes('data-action="messageGrade"'), "Grade-level message filters are missing.");
check(app.includes('function renderDirectMessageNotification()'), "Unread response notification is missing.");
check(app.includes('const cornerHeading = isTeacher() ? "Colt Corner"'), "Teacher homepage incorrectly uses a student grade label for Colt Corner.");
check(styles.includes(".direct-message-notification"), "Unread notification styling is missing.");
check(app.includes('data-action="clearMessageStudent"'), "Close Conversation control is missing.");
check(app.includes('if (selectedMessageStudentEmail === nextStudentEmail)'), "Clicking the selected student does not close the conversation.");
check(!app.includes('selectedMessageStudentEmail = students[0] ? students[0].email : "";'), "The inbox still automatically selects the first student.");

// Exercise the real notification renderer with a controlled clock.
const vm = require("node:vm");
const assert = require("node:assert/strict");
let now = 1000;
let removed = 0;
let nextTimer = 0;
const timers = new Map();
const context = vm.createContext({
  Date: { now: () => now },
  setTimeout: (callback, delay) => { const id = ++nextTimer; timers.set(id, { callback, delay }); return id; },
  clearTimeout: id => timers.delete(id),
  document: { querySelector: () => ({ remove: () => removed++ }) },
  escapeHtml: value => value,
  authSession: { authenticated: true, role: "student", email: "student@example.com" },
  directMessages: [{ id: "one", studentEmail: "student@example.com", senderRole: "teacher", readByStudent: false }]
});
vm.runInContext(`
  const directMessagePopupSeen = new Map();
  let directMessagePopupAccount = "", directMessagePopupUntil = 0, directMessagePopupTimer = null;
  function isSignedIn() { return authSession.authenticated; }
  function isTeacher() { return authSession.role === "teacher"; }
  ${app.slice(app.indexOf("function renderDirectMessageNotification()"), app.indexOf("function renderModal()"))}
`, context);
const popup = () => vm.runInContext("renderDirectMessageNotification()", context);
assert.match(popup(), /Private Messages/);
assert.equal([...timers.values()][0].delay, 8000);
const firstTimer = nextTimer;
now += 4000;
assert.match(popup(), /Private Messages/);
assert.equal(nextTimer, firstTimer, "Rerender must not extend the popup lifetime.");
now += 4000;
timers.get(firstTimer).callback();
assert.equal(removed, 1);
assert.equal(popup(), "", "Old unread messages must not revive the popup.");
assert.equal(context.directMessages[0].readByStudent, false);
context.directMessages.push({ ...context.directMessages[0], id: "two" });
assert.match(popup(), /2 new messages/);
context.authSession.authenticated = false;
assert.equal(popup(), "");
context.authSession = { authenticated: true, role: "teacher", email: "teacher@example.com" };
context.directMessages.push({ id: "reply", studentEmail: "student@example.com", senderRole: "student", readByTeacher: false });
assert.match(popup(), /1 new student response/);
context.directMessages[2].readByTeacher = true;
assert.equal(popup(), "");
console.log("Private message security, password visibility, and popup timeout checks passed.");
