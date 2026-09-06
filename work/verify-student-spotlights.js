const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const JSZip = require("jszip");

const port = 8146;
const origin = `http://127.0.0.1:${port}`;
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "classroom-launchpad-spotlights-"));
const server = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], {
  cwd: path.join(__dirname, ".."),
  env: { ...process.env, PORT: String(port), DATA_DIR: dataDir, SESSION_SECRET: "spotlight-test-secret", TEACHER_PIN: "654321", STUDENT_EMAIL_DOMAIN: "scscolts.org" },
  stdio: ["ignore", "pipe", "pipe"]
});

function cookieFrom(response) {
  return String(response.headers.get("set-cookie") || "").split(";")[0];
}

function onePagePdf() {
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  const addObject = (id, contents) => {
    offsets[id] = Buffer.byteLength(pdf);
    pdf += `${id} 0 obj\n${contents}\nendobj\n`;
  };
  addObject(1, "<</Type /Catalog /Pages 2 0 R>>");
  addObject(2, "<</Type /Pages /Kids [3 0 R] /Count 1>>");
  addObject(3, "<</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources <</Font <</F1 4 0 R>>>> /Contents 5 0 R>>");
  addObject(4, "<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>");
  const stream = "BT /F1 30 Tf 72 700 Td (Student Work Preview) Tj ET";
  addObject(5, `<</Length ${Buffer.byteLength(stream)}>>\nstream\n${stream}\nendstream`);
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += "xref\n0 6\n0000000000 65535 f \n";
  for (let id = 1; id <= 5; id += 1) pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<</Size 6 /Root 1 0 R>>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf);
}

async function oneSlidePowerPoint() {
  const zip = new JSZip();
  zip.file("ppt/slides/slide1.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
      <p:cSld><p:spTree><p:sp><p:spPr><a:xfrm><a:off x="900000" y="900000"/><a:ext cx="7300000" cy="1200000"/></a:xfrm></p:spPr><p:txBody><a:p><a:r><a:rPr sz="3200"><a:solidFill><a:srgbClr val="65001F"/></a:solidFill></a:rPr><a:t>Our Ecosystem Presentation</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld>
    </p:sld>`);
  zip.file("ppt/presentation.xml", `<?xml version="1.0" encoding="UTF-8"?><p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldSz cx="9144000" cy="5143500"/></p:presentation>`);
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

async function request(pathname, options = {}) {
  const response = await fetch(`${origin}${pathname}`, options);
  const type = response.headers.get("content-type") || "";
  const payload = type.includes("application/json") ? await response.json() : Buffer.from(await response.arrayBuffer());
  return { response, payload };
}

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const result = await request("/api/health");
      if (result.response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Spotlight verification server did not start.");
}

(async () => {
  try {
    await waitForServer();
    const guestState = await request("/api/state");
    assert.deepEqual(guestState.payload.studentSpotlights, []);

    const teacherLogin = await request("/api/auth/teacher", {
      method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify({ pin: "654321" })
    });
    const teacherCookie = cookieFrom(teacherLogin.response);
    const imported = await request("/api/approved-students/import", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Origin: origin, Cookie: teacherCookie },
      body: JSON.stringify({ students: [{ email: "avery.johnson@scscolts.org", name: "Avery Johnson", grade: "6" }] })
    });
    const activationCode = imported.payload.activationCodes[0].activationCode;

    const created = await request("/api/student-spotlights", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin, Cookie: teacherCookie },
      body: JSON.stringify({
        studentEmail: "avery.johnson@scscolts.org",
        title: "Ecosystem Research Project",
        description: "A clear and creative explanation of a local ecosystem.",
        displayNameStyle: "first-last-initial",
        projectUrl: "https://docs.google.com/presentation/d/example",
        status: "published"
      })
    });
    assert.equal(created.response.status, 201);
    assert.equal(created.payload.spotlight.displayName, "Avery J.");
    assert.equal(created.payload.spotlight.studentEmail, "avery.johnson@scscolts.org");
    assert.equal(created.payload.spotlight.collectionName, "Ecosystem Research Project");
    const id = created.payload.spotlight.id;

    const pdf = onePagePdf();
    const uploaded = await request(`/api/student-spotlights/${id}/file`, {
      method: "POST",
      headers: { Origin: origin, Cookie: teacherCookie, "Content-Type": "application/pdf", "X-File-Name": encodeURIComponent("ecosystem.pdf") },
      body: pdf
    });
    assert.equal(uploaded.response.status, 201);
    assert.equal(uploaded.payload.spotlight.hasMedia, true);
    assert.equal(uploaded.payload.spotlight.mediaKind, "pdf");
    assert.equal(uploaded.payload.spotlight.hasThumbnail, true);
    const storedDbPath = path.join(dataDir, "classroom-launchpad-db.json");
    const storedDb = JSON.parse(fs.readFileSync(storedDbPath, "utf8"));
    const storedSpotlight = storedDb.studentSpotlights.find(item => item.id === id);
    const firstThumbnailPath = path.join(dataDir, "student-spotlights", storedSpotlight.thumbnailStoredName);
    assert(fs.existsSync(firstThumbnailPath), "The upload did not persist its thumbnail.");
    fs.unlinkSync(firstThumbnailPath);
    storedSpotlight.thumbnailStoredName = "";
    storedSpotlight.thumbnailSize = 0;
    fs.writeFileSync(storedDbPath, `${JSON.stringify(storedDb, null, 2)}\n`);

    const registered = await request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin },
      body: JSON.stringify({ email: "avery.johnson@scscolts.org", activationCode, name: "Avery Johnson", grade: "6", password: "StudentPass123!" })
    });
    const studentCookie = cookieFrom(registered.response);
    const studentState = await request("/api/state", { headers: { Cookie: studentCookie } });
    assert.equal(studentState.payload.studentSpotlights.length, 1);
    assert.equal(studentState.payload.studentSpotlights[0].displayName, "Avery J.");
    assert.equal(studentState.payload.studentSpotlights[0].studentEmail, undefined);

    const studentFile = await request(`/api/student-spotlights/${id}/file`, { headers: { Cookie: studentCookie } });
    assert.equal(studentFile.response.status, 200);
    const studentThumbnail = await request(`/api/student-spotlights/${id}/thumbnail`, { headers: { Cookie: studentCookie } });
    assert.equal(studentThumbnail.response.status, 200);
    assert.equal(studentThumbnail.response.headers.get("content-type"), "image/jpeg");
    assert.deepEqual([...studentThumbnail.payload.subarray(0, 3)], [0xff, 0xd8, 0xff]);
    const regeneratedDb = JSON.parse(fs.readFileSync(storedDbPath, "utf8"));
    assert(regeneratedDb.studentSpotlights.find(item => item.id === id).thumbnailStoredName, "An existing PDF did not receive a thumbnail automatically.");
    const guestFile = await request(`/api/student-spotlights/${id}/file`);
    assert.equal(guestFile.response.status, 401);

    const pptx = await oneSlidePowerPoint();
    const powerpointUpload = await request(`/api/student-spotlights/${id}/file`, {
      method: "POST",
      headers: {
        Origin: origin,
        Cookie: teacherCookie,
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "X-File-Name": encodeURIComponent("ecosystem-presentation.pptx")
      },
      body: pptx
    });
    assert.equal(powerpointUpload.response.status, 201);
    assert.equal(powerpointUpload.payload.spotlight.mediaKind, "powerpoint");
    assert.equal(powerpointUpload.payload.spotlight.hasThumbnail, true);
    const powerpointThumbnail = await request(`/api/student-spotlights/${id}/thumbnail`, { headers: { Cookie: studentCookie } });
    assert.equal(powerpointThumbnail.response.status, 200);
    assert.equal(powerpointThumbnail.response.headers.get("content-type"), "image/jpeg");
    assert.deepEqual([...powerpointThumbnail.payload.subarray(0, 3)], [0xff, 0xd8, 0xff]);

    const hidden = await request(`/api/student-spotlights/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Origin: origin, Cookie: teacherCookie },
      body: JSON.stringify({ status: "hidden" })
    });
    assert.equal(hidden.response.status, 200);
    const hiddenStudentState = await request("/api/state", { headers: { Cookie: studentCookie } });
    assert.equal(hiddenStudentState.payload.studentSpotlights.length, 0);

    const appSource = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
    assert.match(appSource, /Student Work Spotlight/);
    assert.match(appSource, /Open Student Spotlight/);
    assert.match(appSource, /home-student-spotlight/);
    assert.match(appSource, /Student Spotlight.*requiresAuth: true/);
    assert.match(appSource, /is-spotlight-icon/);
    assert.match(appSource, /student-spotlight-home-art\.png/);
    assert.match(appSource, /Creative Work, Great Ideas, Student Success/);
    assert.match(appSource, /Students Only/);
    assert.match(appSource, /Feature New Work/);
    assert.match(appSource, /class="spotlight-document-thumbnail"/);
    assert.match(appSource, /Assignment Folders/);
    assert.match(appSource, /Assignment folder/);
    assert.match(appSource, /spotlightCollection/);
    assert.match(appSource, /Image, PDF, or PowerPoint/);
    assert.match(appSource, /student-spotlights\/.*\/thumbnail/);
    assert(!appSource.includes("spotlight-pdf-preview"));
    assert(!appSource.includes('<b>PDF</b><small>Student Project</small>'));
    assert(!appSource.includes("sharedBackend.enabled = false"));
    assert.match(appSource, /could not reach the spotlight server/);
    console.log("Student spotlight verification passed.");
  } finally {
    server.kill("SIGTERM");
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
