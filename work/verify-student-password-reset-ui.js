"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const app = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const styles = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");

assert.match(app, /data-action="showStudentPasswordReset">Create a New Password/);
assert.match(app, /Open Your Account to change your password anytime without a code/);
assert.match(app, /One-time password reset code/);
assert.match(app, /Save New Password/);
assert.match(app, /registerEmail\.value = loginEmail\.value\.trim\(\)/);
assert.match(app, /data-action="showStudentFirstLogin"/);
assert.match(styles, /\.student-password-reset-entry/);
assert.match(styles, /\.student-password-reset-hint\[hidden\]/);

console.log("Student password-reset UI verification passed.");
