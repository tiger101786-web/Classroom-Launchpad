const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const root = __dirname;
const dataDir = path.join(root, "data");
const dbPath = path.join(dataDir, "classroom-launchpad-db.json");
const port = Number(process.env.PORT || 8080);

const defaultDb = {
  threads: [],
  mutedStudents: [],
  websiteRequests: [],
  dailyLaunch: {
    message: "Check the board for today's first task, then choose a teacher-approved activity or resource.",
    updatedAt: ""
  },
  classTimer: {
    title: "Work Time",
    status: "idle",
    durationSeconds: 600,
    remainingSeconds: 600,
    endAt: "",
    updatedAt: ""
  },
  randomActivity: {
    locked: false,
    updatedAt: ""
  }
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function ensureDb() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dbPath)) writeDb(defaultDb);
}

function readDb() {
  ensureDb();
  try {
    return { ...defaultDb, ...JSON.parse(fs.readFileSync(dbPath, "utf8")) };
  } catch {
    writeDb(defaultDb);
    return { ...defaultDb };
  }
}

function writeDb(db) {
  fs.mkdirSync(dataDir, { recursive: true });
  const next = {
    threads: Array.isArray(db.threads) ? db.threads : [],
    mutedStudents: Array.isArray(db.mutedStudents) ? db.mutedStudents : [],
    websiteRequests: Array.isArray(db.websiteRequests) ? db.websiteRequests : [],
    dailyLaunch: db.dailyLaunch && typeof db.dailyLaunch === "object"
      ? {
          message: typeof db.dailyLaunch.message === "string" ? db.dailyLaunch.message : defaultDb.dailyLaunch.message,
          updatedAt: typeof db.dailyLaunch.updatedAt === "string" ? db.dailyLaunch.updatedAt : ""
        }
      : { ...defaultDb.dailyLaunch },
    classTimer: db.classTimer && typeof db.classTimer === "object"
      ? {
          title: typeof db.classTimer.title === "string" ? db.classTimer.title : defaultDb.classTimer.title,
          status: typeof db.classTimer.status === "string" ? db.classTimer.status : defaultDb.classTimer.status,
          durationSeconds: Number(db.classTimer.durationSeconds) || defaultDb.classTimer.durationSeconds,
          remainingSeconds: Number(db.classTimer.remainingSeconds) || defaultDb.classTimer.remainingSeconds,
          endAt: typeof db.classTimer.endAt === "string" ? db.classTimer.endAt : "",
          updatedAt: typeof db.classTimer.updatedAt === "string" ? db.classTimer.updatedAt : ""
        }
      : { ...defaultDb.classTimer },
    randomActivity: db.randomActivity && typeof db.randomActivity === "object"
      ? {
          locked: Boolean(db.randomActivity.locked),
          updatedAt: typeof db.randomActivity.updatedAt === "string" ? db.randomActivity.updatedAt : ""
        }
      : { ...defaultDb.randomActivity }
  };
  const tempPath = `${dbPath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(next, null, 2));
  fs.renameSync(tempPath, dbPath);
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 2_000_000) {
        reject(new Error("Request body is too large."));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) resolve({});
      else {
        try {
          resolve(JSON.parse(body));
        } catch {
          reject(new Error("Invalid JSON."));
        }
      }
    });
    req.on("error", reject);
  });
}

async function handleApi(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/state") {
    sendJson(res, 200, readDb());
    return true;
  }

  const writeTargets = {
    "/api/threads": "threads",
    "/api/muted-students": "mutedStudents",
    "/api/website-requests": "websiteRequests"
  };

  if (req.method === "PUT" && writeTargets[pathname]) {
    try {
      const body = await readBody(req);
      const key = writeTargets[pathname];
      const incoming = body[key];
      if (!Array.isArray(incoming)) {
        sendJson(res, 400, { error: `${key} must be an array.` });
        return true;
      }
      const db = readDb();
      db[key] = incoming;
      writeDb(db);
      sendJson(res, 200, { ok: true });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return true;
  }

  if (req.method === "PUT" && pathname === "/api/daily-launch") {
    try {
      const body = await readBody(req);
      const message = typeof body.message === "string" ? body.message.trim().slice(0, 3000) : "";
      const db = readDb();
      db.dailyLaunch = {
        message: message || defaultDb.dailyLaunch.message,
        updatedAt: new Date().toISOString()
      };
      writeDb(db);
      sendJson(res, 200, { ok: true, dailyLaunch: db.dailyLaunch });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return true;
  }

  if (req.method === "PUT" && pathname === "/api/class-timer") {
    try {
      const body = await readBody(req);
      const incoming = body.classTimer && typeof body.classTimer === "object" ? body.classTimer : {};
      const titles = new Set(["Work Time", "Test Time", "Project Time", "Student Pick", "Study Time"]);
      const statuses = new Set(["idle", "running", "paused", "ended"]);
      const db = readDb();
      db.classTimer = {
        title: titles.has(incoming.title) ? incoming.title : defaultDb.classTimer.title,
        status: statuses.has(incoming.status) ? incoming.status : defaultDb.classTimer.status,
        durationSeconds: Math.max(60, Math.min(7200, Number(incoming.durationSeconds) || defaultDb.classTimer.durationSeconds)),
        remainingSeconds: Math.max(0, Math.min(7200, Number(incoming.remainingSeconds) || defaultDb.classTimer.remainingSeconds)),
        endAt: typeof incoming.endAt === "string" ? incoming.endAt : "",
        updatedAt: new Date().toISOString()
      };
      writeDb(db);
      sendJson(res, 200, { ok: true, classTimer: db.classTimer });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return true;
  }

  if (req.method === "PUT" && pathname === "/api/random-activity") {
    try {
      const body = await readBody(req);
      const incoming = body.randomActivity && typeof body.randomActivity === "object" ? body.randomActivity : {};
      const db = readDb();
      db.randomActivity = {
        locked: Boolean(incoming.locked),
        updatedAt: new Date().toISOString()
      };
      writeDb(db);
      sendJson(res, 200, { ok: true, randomActivity: db.randomActivity });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return true;
  }

  if (pathname.startsWith("/api/")) {
    sendJson(res, 404, { error: "Not found." });
    return true;
  }

  return false;
}

function serveStatic(req, res, pathname) {
  if (pathname.startsWith("/data/")) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const requested = pathname === "/" ? "/index.html" : pathname;
  const decoded = decodeURIComponent(requested);
  const filePath = path.normalize(path.join(root, decoded));

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream"
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (await handleApi(req, res, url.pathname)) return;
  serveStatic(req, res, url.pathname);
});

server.listen(port, "0.0.0.0", () => {
  const addresses = Object.values(os.networkInterfaces())
    .flat()
    .filter(item => item && item.family === "IPv4" && !item.internal)
    .map(item => `http://${item.address}:${port}/`);
  console.log(`Classroom Launchpad server running at http://localhost:${port}/`);
  addresses.forEach(address => console.log(`Network URL: ${address}`));
});
