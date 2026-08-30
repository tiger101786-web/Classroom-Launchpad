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

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
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
  const [appPort, textPort, imagePort] = await Promise.all([availablePort(), availablePort(), availablePort()]);
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "colt-assistant-ai-"));
  let receivedTextRequest = null;
  let receivedImageWorkflow = null;
  const tinyPng = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");

  const textServer = http.createServer(async (req, res) => {
    receivedTextRequest = await readJson(req);
    sendJson(res, 200, { message: { role: "assistant", content: "Let’s break this into one small step. What have you tried so far?" } });
  });
  const imageServer = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://127.0.0.1:${imagePort}`);
    if (req.method === "POST" && url.pathname === "/prompt") {
      receivedImageWorkflow = await readJson(req);
      sendJson(res, 200, { prompt_id: "classroom-test" });
      return;
    }
    if (url.pathname === "/history/classroom-test") {
      sendJson(res, 200, { "classroom-test": { outputs: { "9": { images: [{ filename: "test.png", subfolder: "", type: "output" }] } } } });
      return;
    }
    if (url.pathname === "/view") {
      res.writeHead(200, { "Content-Type": "image/png" });
      res.end(tinyPng);
      return;
    }
    sendJson(res, 404, { error: "Not found" });
  });
  await Promise.all([
    new Promise(resolve => textServer.listen(textPort, "127.0.0.1", resolve)),
    new Promise(resolve => imageServer.listen(imagePort, "127.0.0.1", resolve))
  ]);

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
      COLT_AI_IMAGE_ENABLED: "true",
      COLT_AI_TEXT_ENDPOINT: `http://127.0.0.1:${textPort}/api/chat`,
      COLT_AI_TEXT_MODEL: "classroom-test-model",
      COLT_AI_IMAGE_ENDPOINT: `http://127.0.0.1:${imagePort}`,
      COLT_AI_IMAGE_MODEL: "classroom-test-image-model.safetensors"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  const baseUrl = `http://127.0.0.1:${appPort}`;
  try {
    await waitForServer(baseUrl);
    const unauthenticated = await fetch(`${baseUrl}/api/colt-assistant/config`);
    assert.equal(unauthenticated.status, 401);

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
    assert.equal(config.imageEnabled, true);
    assert.equal(config.mode, "guided-learning");
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
    assert.equal(receivedTextRequest.model, "classroom-test-model");
    assert.match(receivedTextRequest.messages[0].content, /Guide the learner toward an answer/i);
    assert.match(receivedTextRequest.messages[0].content, /Never invent a citation/i);
    assert.equal(receivedTextRequest.messages.at(-1).content, "How should I research volcanoes?");

    const blockedImage = await fetch(`${baseUrl}/api/colt-assistant/image`, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify({ prompt: "Make a graphic violence scene" })
    });
    assert.equal(blockedImage.status, 400);
    assert.equal((await blockedImage.json()).code, "AI_IMAGE_BLOCKED");

    const imageResponse = await fetch(`${baseUrl}/api/colt-assistant/image`, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify({ prompt: "A labeled diagram of the water cycle" })
    });
    assert.equal(imageResponse.status, 200);
    const imagePayload = await imageResponse.json();
    assert.match(imagePayload.image, /^data:image\/png;base64,/);
    assert.match(receivedImageWorkflow.prompt["6"].inputs.text, /school-appropriate educational illustration/i);
    assert.equal(receivedImageWorkflow.prompt["4"].inputs.ckpt_name, "classroom-test-image-model.safetensors");

    const databaseText = fs.readFileSync(path.join(dataDir, "classroom-launchpad-db.json"), "utf8");
    assert.doesNotMatch(databaseText, /volcanoes|water cycle|secret123/i);
    console.log("Colt Assistant guided AI verification passed.");
  } finally {
    child.kill();
    await Promise.all([
      new Promise(resolve => textServer.close(resolve)),
      new Promise(resolve => imageServer.close(resolve))
    ]);
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
