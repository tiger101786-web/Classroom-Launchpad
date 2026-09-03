"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");

const port = 8142;
const origin = `http://127.0.0.1:${port}`;
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "classroom-launchpad-colt-customization-"));
const server = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], {
  cwd: path.join(__dirname, ".."),
  env: {
    ...process.env,
    PORT: String(port),
    DATA_DIR: dataDir,
    SESSION_SECRET: "colt-customization-verification-secret",
    TEACHER_PIN: "654321",
    STUDENT_EMAIL_DOMAIN: "scscolts.org"
  },
  stdio: ["ignore", "pipe", "pipe"]
});

function cookieFrom(response) {
  return String(response.headers.get("set-cookie") || "").split(";")[0];
}

async function request(pathname, options = {}) {
  const response = await fetch(`${origin}${pathname}`, options);
  return { response, payload: await response.json() };
}

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      if ((await fetch(`${origin}/api/health`)).ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Colt customization verification server did not start.");
}

(async () => {
  try {
    await waitForServer();
    const unauthenticated = await request("/api/launchpad-colt/customization");
    assert.equal(unauthenticated.response.status, 401);

    const login = await request("/api/auth/teacher", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin },
      body: JSON.stringify({ pin: "654321" })
    });
    assert.equal(login.response.status, 200);
    const cookie = cookieFrom(login.response);
    const headers = { "Content-Type": "application/json", Origin: origin, Cookie: cookie };

    const initial = await request("/api/launchpad-colt/customization", { headers });
    assert.deepEqual(initial.payload.customization, { name: "Launchpad Colt", accessories: [] });

    const saved = await request("/api/launchpad-colt/customization", {
      method: "PUT",
      headers,
      body: JSON.stringify({
        name: "Blaze",
        accessories: ["nameplate", "red-glow", "platform", "lightning-frame", "not-allowed"]
      })
    });
    assert.equal(saved.response.status, 200);
    assert.equal(saved.payload.customization.name, "Blaze");
    assert.deepEqual(saved.payload.customization.accessories, ["nameplate", "red-glow", "platform", "lightning-frame"]);

    const state = await request("/api/state", { headers });
    assert.equal(state.payload.coltCustomization.name, "Blaze");
    assert.deepEqual(state.payload.coltCustomization.accessories, ["nameplate", "red-glow", "platform", "lightning-frame"]);

    const invalid = await request("/api/launchpad-colt/customization", {
      method: "PUT",
      headers,
      body: JSON.stringify({ name: "X", accessories: [] })
    });
    assert.equal(invalid.response.status, 400);

    const persisted = JSON.parse(fs.readFileSync(path.join(dataDir, "classroom-launchpad-db.json"), "utf8"));
    assert.equal(persisted.coltCustomizations.teacher.name, "Blaze");
    assert.deepEqual(persisted.coltCustomizations.teacher.accessories, ["nameplate", "red-glow", "platform", "lightning-frame"]);
    console.log("Launchpad Colt customization verification passed.");
  } finally {
    server.kill();
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
