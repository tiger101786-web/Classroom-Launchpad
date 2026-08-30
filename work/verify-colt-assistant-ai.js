"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");

function availablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

function readJson(req) {
  return new Promise(resolve => {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", () => resolve(body ? JSON.parse(body) : {}));
  });
}

async function waitForServer(baseUrl) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      if ((await fetch(`${baseUrl}/api/health`)).ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Colt Assistant AI test server did not start.");
}

async function run() {
  const root = path.resolve(__dirname, "..");
  const [appPort, aiPort] = await Promise.all([availablePort(), availablePort()]);
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "colt-assistant-ai-"));
  let receivedRequest = null;
  let receivedAuthorization = "";
  let receivedPath = "";

  const aiServer = http.createServer(async (req, res) => {
    receivedPath = req.url;
    receivedAuthorization = req.headers.authorization || "";
    receivedRequest = await readJson(req);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      success: true,
      result: { response: "Let’s break this into one small step. What have you tried so far?" }
    }));
  });
  await new Promise(resolve => aiServer.listen(aiPort, "127.0.0.1", resolve));

  const child = spawn(process.execPath, [path.join(root, "server.js")], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(appPort),
      DATA_DIR: dataDir,
      SESSION_SECRET: "colt-assistant-ai-test-session-secret-that-is-long",
      TEACHER_PIN: "123456",
      NODE_ENV: "test",
      COLT_AI_ENABLED: "true",
      CLOUDFLARE_ACCOUNT_ID: "classroom-account",
      CLOUDFLARE_AI_API_TOKEN: "private-test-token",
      CLOUDFLARE_AI_API_BASE: `http://127.0.0.1:${aiPort}`,
      COLT_AI_TEXT_MODEL: "@cf/meta/classroom-test-model"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  const baseUrl = `http://127.0.0.1:${appPort}`;

  try {
    await waitForServer(baseUrl);
    assert.equal((await fetch(`${baseUrl}/api/colt-assistant/config`)).status, 401);

    const login = await fetch(`${baseUrl}/api/auth/teacher`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: baseUrl },
      body: JSON.stringify({ pin: "123456" })
    });
    assert.equal(login.status, 200);
    const cookie = login.headers.get("set-cookie").split(";")[0];
    const requestHeaders = { "Content-Type": "application/json", Origin: baseUrl, Cookie: cookie };

    const configResponse = await fetch(`${baseUrl}/api/colt-assistant/config`, { headers: { Cookie: cookie } });
    const config = await configResponse.json();
    assert.equal(config.enabled, true);
    assert.equal(Object.hasOwn(config, "imageEnabled"), false);
    assert.equal(config.mode, "guided-learning");
    assert.match(config.privacy, /Cloudflare Workers AI/i);
    assert.match(config.privacy, /not saved/i);

    const privateResponse = await fetch(`${baseUrl}/api/colt-assistant/chat`, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify({ prompt: "My password is secret123" })
    });
    assert.equal(privateResponse.status, 400);
    assert.equal((await privateResponse.json()).code, "AI_PRIVATE_INFORMATION");

    const chatResponse = await fetch(`${baseUrl}/api/colt-assistant/chat`, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify({ prompt: "How should I research volcanoes?", history: [] })
    });
    assert.equal(chatResponse.status, 200);
    assert.match((await chatResponse.json()).answer, /small step/i);
    assert.equal(receivedAuthorization, "Bearer private-test-token");
    assert.match(receivedPath, /accounts\/classroom-account\/ai\/run\/@cf\/meta\/classroom-test-model/);
    assert.match(receivedRequest.messages[0].content, /Guide the learner toward an answer/i);
    assert.match(receivedRequest.messages[0].content, /Never invent a citation/i);
    assert.equal(receivedRequest.messages.at(-1).content, "How should I research volcanoes?");
    assert.equal(receivedRequest.max_tokens, 420);

    const removedImageRoute = await fetch(`${baseUrl}/api/colt-assistant/image`, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify({ prompt: "A water cycle" })
    });
    assert.equal(removedImageRoute.status, 404);

    const databaseText = fs.readFileSync(path.join(dataDir, "classroom-launchpad-db.json"), "utf8");
    assert.doesNotMatch(databaseText, /volcanoes|secret123|small step/i);
    console.log("Colt Assistant free hosted Guided AI verification passed.");
  } finally {
    child.kill();
    await new Promise(resolve => aiServer.close(resolve));
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
