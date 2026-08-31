const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const server = fs.readFileSync(path.join(root, "server.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");

function check(value, message) {
  if (!value) throw new Error(message);
}

check(app.includes('id="studentChangePasswordForm"'), "Student password form is missing.");
check(!app.includes('id="studentCurrentPassword"'), "Signed-in students should not need their old password.");
check(app.includes('id="studentNewPasswordConfirm"'), "New-password confirmation is missing.");
check(app.includes('data-password-targets="studentNewPassword studentNewPasswordConfirm"'), "Show passwords does not cover both new-password fields.");
check(app.includes("sharedBackend.changeStudentPassword(newPassword)"), "Password form is not connected to the backend.");
check(server.includes('pathname === "/api/auth/change-password"'), "Change-password API is missing.");
check(server.includes('const session = requireRole(req, res, ["student"]);'), "Change-password API is not restricted to signed-in students.");
check(!server.includes('verifyStudentSecret(currentPassword, approved.passwordSalt, approved.passwordHash)'), "Signed-in students are still required to provide their old password.");
check(server.includes('approved.passwordHash = passwordRecord.hash;'), "New password hash is not saved.");
check(!server.includes("if (!rateLimitLogin(req))"), "Student authentication is still using the old lockout limiter.");
check(server.includes("if (!rateLimitTeacherLogin(req))"), "Teacher PIN protection should remain separate.");
check(styles.includes(".student-password-settings"), "Student password settings styling is missing.");

console.log("Student password change verification passed.");
