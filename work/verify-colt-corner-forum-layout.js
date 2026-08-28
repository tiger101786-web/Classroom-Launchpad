"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { chromium } = require("playwright");

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
  throw new Error("Forum layout test server did not start.");
}

async function run() {
  const root = path.resolve(__dirname, "..");
  const port = await availablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "colt-corner-forum-layout-"));
  const avatarFixture = path.join(dataDir, "avatar.png");
  fs.writeFileSync(avatarFixture, Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAG0lEQVR4nO3BAQ0AAADCoPdPbQ43oAAAAAAAAAB4G0AABc4oOwAAAABJRU5ErkJggg==",
    "base64"
  ));
  fs.writeFileSync(path.join(dataDir, "classroom-launchpad-db.json"), JSON.stringify({ threads: [] }));
  const child = spawn(process.execPath, [path.join(root, "server.js")], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      DATA_DIR: dataDir,
      SESSION_SECRET: "forum-layout-test-session-secret-that-is-long",
      TEACHER_PIN: "123456",
      NODE_ENV: "test"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

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
    const payload = await response.json();
    return {
      status: response.status,
      payload,
      cookie: (response.headers.get("set-cookie") || "").split(";")[0]
    };
  }

  let browser;
  try {
    await waitForServer(baseUrl);
    let response = await request("/api/auth/teacher", { method: "POST", body: { pin: "123456" } });
    const teacherCookie = response.cookie;
    response = await request("/api/approved-students/import", {
      method: "PUT",
      cookie: teacherCookie,
      body: { students: [{ email: "forum.student@scscolts.org", name: "Forum Student", grade: "6" }] }
    });
    const activationCode = response.payload.activationCodes[0].activationCode;
    response = await request("/api/auth/register", {
      method: "POST",
      body: {
        email: "forum.student@scscolts.org",
        password: "GooglePass123",
        activationCode,
        name: "Forum Student",
        grade: "6"
      }
    });
    const studentCookie = response.cookie;
    response = await request("/api/threads", {
      method: "POST",
      cookie: studentCookie,
      body: { title: "Forum layout test", message: "This first post checks the new two-column discussion layout." }
    });
    assert.equal(response.status, 200);

    browser = await chromium.launch({
      headless: true,
      executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
    });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const [cookieName, cookieValue] = studentCookie.split("=");
    await context.addCookies([{ name: cookieName, value: cookieValue, url: baseUrl }]);
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.locator('[data-action="openColtCorner"]').first().click();
    await page.locator('[data-action="openThread"]').first().click();
    await page.locator(".forum-thread-view").waitFor();
    assert.equal(await page.locator(".forum-post-author").count(), 1);
    assert.equal(await page.locator(".forum-post-content").count(), 1);
    assert(await page.locator(".forum-profile-editor").isVisible());
    assert(await page.locator(".forum-reply-composer").isVisible());

    await page.locator("#forumProfileImage").setInputFiles(avatarFixture);
    await page.locator("#forumProfileStatus").getByText("Profile picture saved.").waitFor();
    const avatarSrc = await page.locator("img.forum-profile-preview").getAttribute("src");
    assert.match(avatarSrc, /^\/api\/profile-avatar\/[a-f0-9]{64}\?v=\d+$/);
    assert(await page.locator(".forum-post-author img.forum-avatar").isVisible());
    assert.equal((await fetch(`${baseUrl}${avatarSrc}`)).status, 401);
    assert.equal((await fetch(`${baseUrl}${avatarSrc}`, { headers: { Cookie: studentCookie } })).status, 200);
    await page.screenshot({ path: path.join(dataDir, "forum-thread-desktop.png"), fullPage: true });

    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false);
    assert(await page.locator(".forum-post-author").isVisible());
    assert(await page.locator(".forum-post-content").isVisible());
    await page.screenshot({ path: path.join(dataDir, "forum-thread-mobile.png"), fullPage: true });

    await page.locator("#removeForumProfileImage").click();
    await page.locator("#forumProfileStatus").getByText("Profile picture removed.").waitFor();
    assert(await page.locator(".forum-profile-preview.forum-avatar-initials").isVisible());

    console.log(JSON.stringify({
      forumDesktopTwoColumnLayout: true,
      forumMobileLayoutResponsive: true,
      studentProfilePictureUpload: true,
      studentProfilePictureRemoval: true,
      profilePicturesRequireSignedInAccess: true,
      desktopScreenshot: path.join(dataDir, "forum-thread-desktop.png"),
      mobileScreenshot: path.join(dataDir, "forum-thread-mobile.png")
    }, null, 2));
  } finally {
    if (browser) await browser.close();
    child.kill();
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});