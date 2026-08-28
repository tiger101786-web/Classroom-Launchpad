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

console.log("Private message security and password visibility checks passed.");