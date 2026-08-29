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
  throw new Error("Radio favorites test server did not start.");
}

async function run() {
  const root = path.resolve(__dirname, "..");
  const port = await availablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "radio-favorites-"));
  const child = spawn(process.execPath, [path.join(root, "server.js")], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      DATA_DIR: dataDir,
      SESSION_SECRET: "radio-favorites-test-session-secret-that-is-long",
      TEACHER_PIN: "123456",
      NODE_ENV: "test"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  try {
    await waitForServer(baseUrl);
    let response = await fetch(`${baseUrl}/api/radio-favorites`);
    assert.equal(response.status, 401, "Guests can read account favorites.");

    response = await fetch(`${baseUrl}/api/auth/teacher`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: baseUrl },
      body: JSON.stringify({ pin: "123456" })
    });
    assert.equal(response.status, 200);
    const cookie = response.headers.get("set-cookie").split(";")[0];

    response = await fetch(`${baseUrl}/api/radio-favorites`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookie, Origin: baseUrl },
      body: JSON.stringify({ favorites: ["game-soundtracks", "laid-back-jazz", "game-soundtracks", "NOT VALID!"] })
    });
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).favorites, ["game-soundtracks", "laid-back-jazz"]);

    response = await fetch(`${baseUrl}/api/radio-favorites`, { headers: { Cookie: cookie } });
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).favorites, ["game-soundtracks", "laid-back-jazz"]);

    const stored = JSON.parse(fs.readFileSync(path.join(dataDir, "classroom-launchpad-db.json"), "utf8"));
    assert.deepEqual(stored.radioFavorites.teacher, ["game-soundtracks", "laid-back-jazz"]);
    console.log(JSON.stringify({ accountScopedFavorites: true, guestProtected: true, normalizedStationIds: true }, null, 2));
  } finally {
    child.kill();
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
