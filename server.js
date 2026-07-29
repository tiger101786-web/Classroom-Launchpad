const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const moderationConfig = require("./colt-corner-moderation-config");
const {
  hashNormalizedMessage,
  moderateMessage,
  normalizeForModeration,
  studentMessageFor
} = require("./colt-corner-moderation");

const root = __dirname;
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(root, "data");
const dbPath = path.join(dataDir, "classroom-launchpad-db.json");
const port = Number(process.env.PORT || 8080);
const allowedStudentDomain = String(process.env.STUDENT_EMAIL_DOMAIN || "scscolts.org").trim().toLowerCase();
const configuredSessionSecret = String(process.env.SESSION_SECRET || "");
const sessionSecret = configuredSessionSecret || crypto.randomBytes(48).toString("hex");
const initialTeacherPin = String(process.env.TEACHER_PIN || (process.env.NODE_ENV === "production" ? "" : "1017"));
const sessionCookieName = "classroom_launchpad_session";
const leaderboardDifficulties = new Set(["easy", "medium", "hard", "veryHard", "impossible"]);
const loginAttempts = new Map();

const defaultDb = {
  links: null,
  threads: [],
  mutedStudents: [],
  websiteRequests: [],
  leaderboards: [],
  approvedStudents: [],
  teacherPin: null,
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

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function cleanText(value, maxLength) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function cleanMultilineText(value, maxLength) {
  return String(value || "").trim().replace(/\r/g, "").slice(0, maxLength);
}

function cleanGrade(value) {
  return cleanText(value, 12).replace(/[^a-z0-9 -]/gi, "");
}

const moderationStatuses = new Set(["approved", "needs_review", "blocked"]);

function validIsoDate(value, fallback = "") {
  return Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : fallback;
}

function normalizeModerationReasons(entries) {
  return (Array.isArray(entries) ? entries : []).slice(0, 20).flatMap(entry => {
    if (typeof entry === "string") {
      const label = cleanText(entry, 160);
      return label ? [{ code: "legacy", label }] : [];
    }
    const code = cleanText(entry && entry.code, 60).replace(/[^a-z0-9_-]/gi, "");
    const label = cleanText(entry && entry.label, 160);
    return code && label ? [{ code, label }] : [];
  });
}

function normalizeModeratedPost(source, type) {
  const createdAt = validIsoDate(source && source.createdAt, new Date().toISOString());
  const submittedAt = validIsoDate(source && source.submittedAt, createdAt);
  const status = moderationStatuses.has(source && source.moderationStatus)
    ? source.moderationStatus
    : "approved";
  const base = {
    id: cleanText(source && source.id, 100) || crypto.randomUUID(),
    studentName: cleanText(source && source.studentName, 80),
    grade: cleanGrade(source && source.grade),
    createdAt,
    submittedAt,
    moderationStatus: status,
    moderationReasons: normalizeModerationReasons(source && source.moderationReasons),
    moderatedAt: validIsoDate(source && source.moderatedAt),
    moderatedBy: cleanText(source && source.moderatedBy, 80),
    normalizedMessageHash: cleanText(source && source.normalizedMessageHash, 128),
    authorKey: cleanText(source && source.authorKey, 128)
  };
  if (type === "topic") {
    return {
      ...base,
      title: cleanText(source && (source.title || source.message), 80) || "Class Topic",
      body: cleanMultilineText(source && (source.body || source.message), 360),
      replies: (Array.isArray(source && source.replies) ? source.replies : [])
        .map(reply => normalizeModeratedPost(reply, "reply"))
    };
  }
  return {
    ...base,
    message: cleanMultilineText(source && source.message, 320)
  };
}

function normalizeModeratedThreads(entries) {
  return (Array.isArray(entries) ? entries : []).slice(0, 1000)
    .map(thread => normalizeModeratedPost(thread, "topic"));
}

function pruneModeratedThreads(entries, now = Date.now()) {
  const cutoff = now - moderationConfig.limits.rejectedRetentionDays * 24 * 60 * 60 * 1000;
  return normalizeModeratedThreads(entries)
    .filter(thread => !(
      thread.moderationStatus === "blocked"
      && thread.moderatedAt
      && Date.parse(thread.moderatedAt) < cutoff
    ))
    .map(thread => ({
      ...thread,
      replies: (thread.replies || []).filter(reply => !(
        reply.moderationStatus === "blocked"
        && reply.moderatedAt
        && Date.parse(reply.moderatedAt) < cutoff
      ))
    }));
}

function studentAuthorKey(session) {
  return crypto.createHash("sha256").update(normalizeEmail(session && session.email)).digest("hex");
}

function isApprovedPost(post) {
  return !post || !post.moderationStatus || post.moderationStatus === "approved";
}

function publicPost(post, type) {
  const base = {
    id: post.id,
    studentName: post.studentName,
    grade: post.grade,
    createdAt: post.createdAt
  };
  return type === "topic"
    ? {
        ...base,
        title: post.title,
        body: post.body,
        replies: (post.replies || []).filter(isApprovedPost).map(reply => publicPost(reply, "reply"))
      }
    : { ...base, message: post.message };
}

function publicApprovedThreads(entries) {
  return normalizeModeratedThreads(entries).filter(isApprovedPost).map(thread => publicPost(thread, "topic"));
}

function moderationItem(post, type, threadId = "") {
  return {
    id: post.id,
    type,
    threadId: threadId || (type === "topic" ? post.id : ""),
    studentName: post.studentName,
    grade: post.grade,
    title: type === "topic" ? post.title : "",
    message: type === "topic" ? post.body : post.message,
    submittedAt: post.submittedAt || post.createdAt,
    moderationStatus: post.moderationStatus || "approved",
    moderationReasons: normalizeModerationReasons(post.moderationReasons),
    moderatedAt: post.moderatedAt || "",
    moderatedBy: post.moderatedBy || ""
  };
}

function teacherModerationData(db) {
  const all = normalizeModeratedThreads(db.threads).flatMap(thread => [
    moderationItem(thread, "topic"),
    ...(thread.replies || []).map(reply => moderationItem(reply, "reply", thread.id))
  ]);
  return {
    pending: all
      .filter(item => item.moderationStatus === "needs_review")
      .sort((a, b) => String(a.submittedAt).localeCompare(String(b.submittedAt))),
    recent: all
      .filter(item => item.moderatedAt)
      .sort((a, b) => String(b.moderatedAt).localeCompare(String(a.moderatedAt)))
      .slice(0, 50)
  };
}

function studentPendingModeration(db, session) {
  if (!session || session.role !== "student") return [];
  const authorKey = studentAuthorKey(session);
  return normalizeModeratedThreads(db.threads).flatMap(thread => [
    ...(thread.authorKey === authorKey && thread.moderationStatus === "needs_review"
      ? [moderationItem(thread, "topic")]
      : []),
    ...(thread.replies || [])
      .filter(reply => reply.authorKey === authorKey && reply.moderationStatus === "needs_review")
      .map(reply => moderationItem(reply, "reply", thread.id))
  ]).map(item => ({
    id: item.id,
    type: item.type,
    title: item.title,
    submittedAt: item.submittedAt
  }));
}

function normalizeLinks(entries) {
  if (!Array.isArray(entries)) return null;
  const seen = new Set();
  return entries.slice(0, 500).flatMap(entry => {
    const source = entry && typeof entry === "object" ? entry : {};
    const id = cleanText(source.id, 100) || crypto.randomUUID();
    const title = cleanText(source.title, 120);
    const instruction = cleanMultilineText(source.instruction, 500);
    const url = cleanText(source.url, 2048);
    const category = cleanText(source.category, 80);
    const allowedUrl = url === "internal:colt-run" || /^https?:\/\/\S+$/i.test(url);
    if (!title || !url || !category || !allowedUrl || seen.has(id)) return [];
    seen.add(id);
    return [{
      id,
      title,
      instruction,
      url,
      category,
      active: source.active !== false,
      todayChoice: Boolean(source.todayChoice)
    }];
  });
}

function cleanLeaderboardName(name) {
  const cleaned = String(name || "").replace(/[^\w .'-]/g, "").trim().slice(0, 16);
  return cleaned || "Colt";
}

function compareLeaderboardEntries(a, b) {
  return (Number(b.coins) || 0) - (Number(a.coins) || 0)
    || (Number(a.seconds) || 0) - (Number(b.seconds) || 0)
    || String(a.createdAt || "").localeCompare(String(b.createdAt || ""));
}

function normalizeLeaderboards(entries) {
  const normalized = (Array.isArray(entries) ? entries : [])
    .map(entry => ({
      name: cleanLeaderboardName(entry && entry.name),
      coins: Math.max(0, Math.min(100000, Math.round(Number(entry && entry.coins) || 0))),
      seconds: Math.max(0, Math.min(86400, Math.round(Number(entry && entry.seconds) || 0))),
      difficulty: leaderboardDifficulties.has(entry && entry.difficulty) ? entry.difficulty : "medium",
      createdAt: Number.isFinite(Date.parse(entry && entry.createdAt)) ? new Date(entry.createdAt).toISOString() : new Date().toISOString()
    }))
    .filter(entry => entry.coins > 0);
  return Array.from(leaderboardDifficulties).flatMap(difficulty => normalized
    .filter(entry => entry.difficulty === difficulty)
    .sort(compareLeaderboardEntries)
    .slice(0, 10));
}

function mergeLeaderboards(existing, incoming) {
  const seen = new Set();
  return normalizeLeaderboards([...normalizeLeaderboards(existing), ...normalizeLeaderboards(incoming)].filter(entry => {
    const key = [entry.name.toLowerCase(), entry.coins, entry.seconds, entry.difficulty, entry.createdAt].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }));
}

function normalizeApprovedStudents(entries) {
  const seen = new Set();
  return (Array.isArray(entries) ? entries : []).flatMap(entry => {
    const source = typeof entry === "string" ? { email: entry } : (entry || {});
    const email = normalizeEmail(source.email);
    if (!email || !email.endsWith(`@${allowedStudentDomain}`) || seen.has(email)) return [];
    seen.add(email);
    return [{
      email,
      name: cleanText(source.name, 80),
      grade: cleanGrade(source.grade),
      passwordSalt: cleanText(source.passwordSalt, 128),
      passwordHash: cleanText(source.passwordHash, 256),
      activationSalt: cleanText(source.activationSalt, 128),
      activationHash: cleanText(source.activationHash, 256),
      activationIssuedAt: Number.isFinite(Date.parse(source.activationIssuedAt)) ? new Date(source.activationIssuedAt).toISOString() : "",
      createdAt: Number.isFinite(Date.parse(source.createdAt)) ? new Date(source.createdAt).toISOString() : new Date().toISOString()
    }];
  }).sort((a, b) => a.email.localeCompare(b.email));
}

function hashTeacherPin(pin, salt = crypto.randomBytes(16).toString("hex")) {
  return {
    salt,
    hash: crypto.scryptSync(String(pin), salt, 64).toString("hex")
  };
}

function hashStudentSecret(secret, salt = crypto.randomBytes(16).toString("hex")) {
  return {
    salt,
    hash: crypto.scryptSync(String(secret), salt, 64).toString("hex")
  };
}

function verifyStudentSecret(secret, salt, hash) {
  if (!salt || !hash) return false;
  const actual = crypto.scryptSync(String(secret), salt, 64);
  const expected = Buffer.from(hash, "hex");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function createActivationCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = "23456789";
  const prefix = Array.from({ length: 3 }, () => letters[crypto.randomInt(letters.length)]).join("");
  const suffix = Array.from({ length: 3 }, () => numbers[crypto.randomInt(numbers.length)]).join("");
  return `${prefix}-${suffix}`;
}

function normalizeActivationCode(value) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function publicApprovedStudents(entries) {
  return normalizeApprovedStudents(entries).map(student => ({
    email: student.email,
    name: student.name,
    grade: student.grade,
    registered: Boolean(student.passwordHash),
    activationReady: Boolean(student.activationHash),
    activationIssuedAt: student.activationIssuedAt
  }));
}

function verifyTeacherPin(pin, stored) {
  if (!stored || !stored.salt || !stored.hash) return false;
  const actual = crypto.scryptSync(String(pin), stored.salt, 64);
  const expected = Buffer.from(stored.hash, "hex");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
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
    links: Array.isArray(db.links) ? normalizeLinks(db.links) : null,
    threads: pruneModeratedThreads(db.threads),
    mutedStudents: Array.isArray(db.mutedStudents) ? db.mutedStudents : [],
    websiteRequests: Array.isArray(db.websiteRequests) ? db.websiteRequests : [],
    leaderboards: normalizeLeaderboards(db.leaderboards),
    approvedStudents: normalizeApprovedStudents(db.approvedStudents),
    teacherPin: db.teacherPin && typeof db.teacherPin === "object"
      ? { salt: String(db.teacherPin.salt || ""), hash: String(db.teacherPin.hash || "") }
      : null,
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

function sendJson(res, status, payload, extraHeaders = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...extraHeaders
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

function parseCookies(req) {
  return String(req.headers.cookie || "").split(";").reduce((cookies, part) => {
    const index = part.indexOf("=");
    if (index < 0) return cookies;
    cookies[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim());
    return cookies;
  }, {});
}

function base64urlJson(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function createSessionToken(payload) {
  const encoded = base64urlJson(payload);
  const signature = crypto.createHmac("sha256", sessionSecret).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

function readSession(req) {
  const token = parseCookies(req)[sessionCookieName];
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = crypto.createHmac("sha256", sessionSecret).update(encoded).digest();
  let actual;
  try {
    actual = Buffer.from(signature, "base64url");
  } catch {
    return null;
  }
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (!payload.exp || Date.now() >= payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function isSecureRequest(req) {
  return req.socket.encrypted || String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim() === "https";
}

function sessionCookie(req, payload) {
  const maxAge = Math.max(0, Math.floor((payload.exp - Date.now()) / 1000));
  return `${sessionCookieName}=${encodeURIComponent(createSessionToken(payload))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${isSecureRequest(req) ? "; Secure" : ""}`;
}

function clearSessionCookie(req) {
  return `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isSecureRequest(req) ? "; Secure" : ""}`;
}

function publicSession(session) {
  if (!session) return { authenticated: false, role: "guest" };
  return {
    authenticated: true,
    role: session.role,
    name: session.name || (session.role === "teacher" ? "Mr. Nieves" : "Student"),
    email: session.role === "student" ? session.email : "",
    grade: session.role === "student" ? session.grade || "" : "Teacher"
  };
}

function requireRole(req, res, roles) {
  const session = readSession(req);
  if (!session || !roles.includes(session.role)) {
    sendJson(res, 401, { error: "Please sign in to continue.", code: "AUTH_REQUIRED" });
    return null;
  }
  return session;
}

function requestOriginMatches(req) {
  const origin = String(req.headers.origin || "");
  if (!origin) return false;
  try {
    return new URL(origin).host === String(req.headers.host || "");
  } catch {
    return false;
  }
}

function requireSameOrigin(req, res) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method) || requestOriginMatches(req)) return true;
  sendJson(res, 403, { error: "The request origin could not be verified.", code: "BAD_ORIGIN" });
  return false;
}

function clientAddress(req) {
  return String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
}

function rateLimitLogin(req) {
  const key = clientAddress(req);
  const now = Date.now();
  const recent = (loginAttempts.get(key) || []).filter(time => now - time < 10 * 60 * 1000);
  recent.push(now);
  loginAttempts.set(key, recent);
  return recent.length <= 20;
}

function studentDisplayName(session) {
  return cleanText(session.name || session.email.split("@")[0], 80);
}

function isStudentMuted(db, session) {
  const email = normalizeEmail(session.email);
  const name = studentDisplayName(session).toLowerCase();
  return (Array.isArray(db.mutedStudents) ? db.mutedStudents : []).some(student => (
    normalizeEmail(student.email) === email
    || cleanText(student.normalized || student.name, 80).toLowerCase() === name
  ));
}

function publicState(db, session) {
  const signedIn = session && ["student", "teacher"].includes(session.role);
  const teacher = session && session.role === "teacher";
  return {
    links: Array.isArray(db.links) ? normalizeLinks(db.links) : null,
    threads: signedIn ? publicApprovedThreads(db.threads) : [],
    pendingModeration: session && session.role === "student" ? studentPendingModeration(db, session) : [],
    ...(teacher ? { moderation: teacherModerationData(db) } : {}),
    mutedStudents: teacher ? db.mutedStudents : [],
    websiteRequests: teacher ? db.websiteRequests : [],
    leaderboards: db.leaderboards,
    dailyLaunch: db.dailyLaunch,
    classTimer: db.classTimer,
    randomActivity: db.randomActivity,
    auth: publicSession(session),
    coltCornerLocked: !signedIn,
    postingBlocked: session && session.role === "student" ? isStudentMuted(db, session) : false
  };
}

function rejectIfMuted(db, session, res) {
  if (!isStudentMuted(db, session)) return false;
  sendJson(res, 403, { error: "Posting is unavailable. Please check with Mr. Nieves.", code: "POSTING_BLOCKED" });
  return true;
}

function allModeratedPosts(db) {
  return normalizeModeratedThreads(db.threads).flatMap(thread => [
    thread,
    ...(thread.replies || [])
  ]);
}

function moderationPostText(post) {
  return typeof post.message === "string"
    ? post.message
    : `${post.title || ""}\n${post.body || ""}`;
}

function editDistance(left, right) {
  const a = String(left || "");
  const b = String(right || "");
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let row = 1; row <= a.length; row += 1) {
    let diagonal = previous[0];
    previous[0] = row;
    for (let column = 1; column <= b.length; column += 1) {
      const old = previous[column];
      previous[column] = Math.min(
        previous[column] + 1,
        previous[column - 1] + 1,
        diagonal + (a[row - 1] === b[column - 1] ? 0 : 1)
      );
      diagonal = old;
    }
  }
  return previous[b.length];
}

function nearlyIdenticalMessage(left, right) {
  const a = normalizeForModeration(left).reduced;
  const b = normalizeForModeration(right).reduced;
  if (!a || !b) return false;
  if (a === b) return true;
  if (Math.min(a.length, b.length) < 10) return false;
  return 1 - editDistance(a, b) / Math.max(a.length, b.length) >= 0.88;
}

function addModerationReason(result, code, label) {
  if (!result.reasons.some(item => item.code === code)) result.reasons.push({ code, label });
}

function applyPostingBehavior(db, session, result, now = Date.now()) {
  if (!session || session.role !== "student") return result;
  const authorKey = studentAuthorKey(session);
  const posts = allModeratedPosts(db).filter(post => post.authorKey === authorKey);
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  const duplicateCutoff = now - moderationConfig.limits.duplicateWindowMinutes * 60 * 1000;
  const recentPosts = posts.filter(post => Date.parse(post.submittedAt || post.createdAt) >= fiveMinutesAgo);
  const lastPostAt = posts.reduce((latest, post) => Math.max(latest, Date.parse(post.submittedAt || post.createdAt) || 0), 0);
  const duplicates = posts.filter(post => (
    Date.parse(post.submittedAt || post.createdAt) >= duplicateCutoff
    && (
      (post.normalizedMessageHash && post.normalizedMessageHash === result.normalizedMessageHash)
      || nearlyIdenticalMessage(moderationPostText(post), result.originalText)
    )
  ));

  if (recentPosts.length >= moderationConfig.limits.maximumPostsPerFiveMinutes) {
    result.status = "blocked";
    addModerationReason(result, "rate_limit", "Too many messages within five minutes");
  } else if (lastPostAt && now - lastPostAt < moderationConfig.limits.minimumSecondsBetweenPosts * 1000) {
    if (result.status === "approved") result.status = "needs_review";
    addModerationReason(result, "rate_limit", "Messages submitted less than ten seconds apart");
  }

  if (duplicates.length >= 2) {
    result.status = "blocked";
    addModerationReason(result, "duplicate", "Repeated identical or nearly identical message after a warning");
  } else if (duplicates.length === 1) {
    if (result.status === "approved") result.status = "needs_review";
    addModerationReason(result, "duplicate", "Repeated identical or nearly identical message");
  }

  result.studentMessage = result.status === "approved"
    ? ""
    : studentMessageFor(result.status, result.reasons);
  return result;
}

function moderationFields(result, session, submittedAt) {
  const approvedByTeacher = session.role === "teacher";
  return {
    submittedAt,
    moderationStatus: approvedByTeacher ? "approved" : result.status,
    moderationReasons: approvedByTeacher ? [] : result.reasons,
    moderatedAt: approvedByTeacher ? submittedAt : "",
    moderatedBy: approvedByTeacher ? cleanText(session.name || "Mr. Nieves", 80) : "",
    normalizedMessageHash: result.normalizedMessageHash,
    authorKey: session.role === "student" ? studentAuthorKey(session) : "teacher"
  };
}

function preserveNonPublicModeration(existing, incoming) {
  const next = normalizeModeratedThreads(incoming);
  const nextById = new Map(next.map(thread => [thread.id, thread]));
  for (const prior of normalizeModeratedThreads(existing)) {
    if (prior.moderationStatus !== "approved") {
      if (!nextById.has(prior.id)) next.push(prior);
      continue;
    }
    const candidate = nextById.get(prior.id);
    if (!candidate) continue;
    const candidateReplyIds = new Set((candidate.replies || []).map(reply => reply.id));
    candidate.replies.push(...(prior.replies || []).filter(reply => (
      reply.moderationStatus !== "approved" && !candidateReplyIds.has(reply.id)
    )));
  }
  return next;
}

function validateStudentThreadUpdate(existing, incoming, session) {
  if (!Array.isArray(incoming)) throw new Error("threads must be an array.");
  const existingById = new Map(existing.map(thread => [String(thread.id), thread]));
  const incomingById = new Map(incoming.map(thread => [String(thread && thread.id), thread]));
  const newThreads = incoming.filter(thread => !existingById.has(String(thread && thread.id)));
  if (newThreads.length === 1 && incoming.length === existing.length + 1) {
    for (const oldThread of existing) {
      if (JSON.stringify(incomingById.get(String(oldThread.id))) !== JSON.stringify(oldThread)) {
        throw new Error("Existing topics cannot be changed.");
      }
    }
    const draft = newThreads[0] || {};
    const title = cleanText(draft.title, 80);
    const body = cleanMultilineText(draft.body, 360);
    const grade = cleanGrade(session.grade);
    if (!title || !body || !grade) throw new Error("Topic title, message, and grade are required.");
    return [{
      id: crypto.randomUUID(),
      studentName: studentDisplayName(session),
      grade,
      title,
      body,
      createdAt: new Date().toISOString(),
      replies: []
    }, ...existing];
  }

  if (incoming.length === existing.length) {
    let changedThread = null;
    for (const oldThread of existing) {
      const candidate = incomingById.get(String(oldThread.id));
      if (!candidate) throw new Error("Topics cannot be removed.");
      if (JSON.stringify(candidate) !== JSON.stringify(oldThread)) {
        if (changedThread) throw new Error("Only one reply can be added at a time.");
        changedThread = { oldThread, candidate };
      }
    }
    if (!changedThread) return existing;
    const oldReplies = Array.isArray(changedThread.oldThread.replies) ? changedThread.oldThread.replies : [];
    const newReplies = Array.isArray(changedThread.candidate.replies) ? changedThread.candidate.replies : [];
    const unchangedThread = { ...changedThread.candidate, replies: oldReplies };
    if (JSON.stringify(unchangedThread) !== JSON.stringify(changedThread.oldThread) || newReplies.length !== oldReplies.length + 1) {
      throw new Error("Only a new reply may be added.");
    }
    if (JSON.stringify(newReplies.slice(0, -1)) !== JSON.stringify(oldReplies)) throw new Error("Existing replies cannot be changed.");
    const draft = newReplies[newReplies.length - 1] || {};
    const message = cleanMultilineText(draft.message, 320);
    const grade = cleanGrade(session.grade);
    if (!message || !grade) throw new Error("Reply and grade are required.");
    return existing.map(thread => thread.id === changedThread.oldThread.id ? {
      ...thread,
      replies: [...oldReplies, {
        id: crypto.randomUUID(),
        studentName: studentDisplayName(session),
        grade,
        message,
        createdAt: new Date().toISOString()
      }]
    } : thread);
  }
  throw new Error("Students may only add one topic or reply at a time.");
}

function applyTeacherThreadIdentity(existing, incoming, session) {
  const existingById = new Map(existing.map(thread => [String(thread.id), thread]));
  const teacherName = cleanText(session.name || "Mr. Nieves", 80);
  return incoming.map(thread => {
    const priorThread = existingById.get(String(thread && thread.id));
    if (!priorThread) {
      return { ...thread, studentName: teacherName, grade: "Teacher" };
    }
    const existingReplyIds = new Set((Array.isArray(priorThread.replies) ? priorThread.replies : []).map(reply => String(reply.id)));
    const replies = (Array.isArray(thread.replies) ? thread.replies : []).map(reply => (
      existingReplyIds.has(String(reply && reply.id))
        ? reply
        : { ...reply, studentName: teacherName, grade: "Teacher" }
    ));
    return { ...thread, replies };
  });
}

function findModerationTarget(db, id) {
  const targetId = String(id || "");
  for (const thread of db.threads) {
    if (String(thread.id) === targetId) return { type: "topic", thread, post: thread };
    const reply = (thread.replies || []).find(item => String(item.id) === targetId);
    if (reply) return { type: "reply", thread, post: reply };
  }
  return null;
}

function deleteModerationTarget(db, target) {
  if (target.type === "topic") {
    db.threads = db.threads.filter(thread => thread.id !== target.thread.id);
  } else {
    target.thread.replies = (target.thread.replies || []).filter(reply => reply.id !== target.post.id);
  }
}

function updateModerationTarget(target, body, teacherName) {
  const action = cleanText(body && body.action, 30);
  if (action === "delete") return { deleted: true };
  if (!["approve", "reject", "edit_approve"].includes(action)) {
    throw new Error("Choose Approve, Reject, Edit and Approve, or Delete.");
  }
  if (action === "edit_approve") {
    if (target.type === "topic") {
      const title = cleanText(body.title, 80);
      const message = cleanMultilineText(body.message, 360);
      if (!title || !message) throw new Error("A topic title and message are required.");
      target.post.title = title;
      target.post.body = message;
      target.post.normalizedMessageHash = hashNormalizedMessage(`${title}\n${message}`);
    } else {
      const message = cleanMultilineText(body.message, 320);
      if (!message) throw new Error("A reply message is required.");
      target.post.message = message;
      target.post.normalizedMessageHash = hashNormalizedMessage(message);
    }
  }
  target.post.moderationStatus = action === "reject" ? "blocked" : "approved";
  target.post.moderatedAt = new Date().toISOString();
  target.post.moderatedBy = teacherName;
  return { deleted: false };
}

async function handleAuthApi(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/auth/config") {
    sendJson(res, 200, {
      studentEmailDomain: allowedStudentDomain,
      studentLoginConfigured: Boolean(configuredSessionSecret),
      teacherConfigured: Boolean(initialTeacherPin || readDb().teacherPin)
    });
    return true;
  }

  if (req.method === "GET" && pathname === "/api/auth/session") {
    sendJson(res, 200, { session: publicSession(readSession(req)) });
    return true;
  }

  if (req.method === "POST" && pathname === "/api/auth/register") {
    if (!requireSameOrigin(req, res)) return true;
    if (!rateLimitLogin(req)) {
      sendJson(res, 429, { error: "Too many registration attempts. Please wait and try again." });
      return true;
    }
    if (!configuredSessionSecret) {
      sendJson(res, 503, { error: "Student login has not been configured yet.", code: "AUTH_NOT_CONFIGURED" });
      return true;
    }
    try {
      const body = await readBody(req);
      const email = normalizeEmail(body.email);
      const password = String(body.password || "");
      const activationCode = normalizeActivationCode(body.activationCode);
      const providedName = cleanText(body.name, 80);
      const providedGrade = cleanGrade(body.grade);
      if (!email.endsWith(`@${allowedStudentDomain}`)) {
        sendJson(res, 403, { error: `Use an approved @${allowedStudentDomain} student email.`, code: "WRONG_DOMAIN" });
        return true;
      }
      if (password.length < 10 || password.length > 128) {
        sendJson(res, 400, { error: "Create a password containing at least 10 characters." });
        return true;
      }
      if (!activationCode) {
        sendJson(res, 400, { error: "The activation code is required." });
        return true;
      }
      const db = readDb();
      const approved = normalizeApprovedStudents(db.approvedStudents).find(student => student.email === email);
      if (!approved) {
        sendJson(res, 403, { error: "This school email is not on the approved student list.", code: "NOT_APPROVED" });
        return true;
      }
      const name = approved.name || providedName;
      const grade = approved.grade || providedGrade;
      if (!name || !grade) {
        sendJson(res, 400, { error: "Name and grade are required when they are not already saved in the approved roster." });
        return true;
      }
      if (approved.passwordHash) {
        sendJson(res, 409, { error: "This account is already registered. Use the Log In form or ask Mr. Nieves for a reset code.", code: "ALREADY_REGISTERED" });
        return true;
      }
      if (!verifyStudentSecret(activationCode, approved.activationSalt, approved.activationHash)) {
        sendJson(res, 401, { error: "The activation code did not match.", code: "INVALID_ACTIVATION_CODE" });
        return true;
      }
      const passwordRecord = hashStudentSecret(password);
      approved.name = name;
      approved.grade = grade;
      approved.passwordSalt = passwordRecord.salt;
      approved.passwordHash = passwordRecord.hash;
      approved.activationSalt = "";
      approved.activationHash = "";
      approved.activationIssuedAt = "";
      db.approvedStudents = db.approvedStudents.map(student => normalizeEmail(student.email) === email ? approved : student);
      writeDb(db);
      const session = {
        role: "student",
        email,
        name: approved.name,
        grade: approved.grade,
        exp: Date.now() + 12 * 60 * 60 * 1000
      };
      sendJson(res, 200, { ok: true, session: publicSession(session) }, { "Set-Cookie": sessionCookie(req, session) });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return true;
  }

  if (req.method === "POST" && pathname === "/api/auth/login") {
    if (!requireSameOrigin(req, res)) return true;
    if (!rateLimitLogin(req)) {
      sendJson(res, 429, { error: "Too many login attempts. Please wait and try again." });
      return true;
    }
    try {
      const body = await readBody(req);
      const email = normalizeEmail(body.email);
      const password = String(body.password || "");
      const approved = normalizeApprovedStudents(readDb().approvedStudents).find(student => student.email === email);
      if (!approved || !approved.passwordHash || !verifyStudentSecret(password, approved.passwordSalt, approved.passwordHash)) {
        sendJson(res, 401, { error: "The email or password did not match.", code: "INVALID_LOGIN" });
        return true;
      }
      const session = {
        role: "student",
        email,
        name: approved.name || email.split("@")[0],
        grade: approved.grade,
        exp: Date.now() + 12 * 60 * 60 * 1000
      };
      sendJson(res, 200, { ok: true, session: publicSession(session) }, { "Set-Cookie": sessionCookie(req, session) });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return true;
  }

  if (req.method === "POST" && pathname === "/api/auth/teacher") {
    if (!requireSameOrigin(req, res)) return true;
    if (!rateLimitLogin(req)) {
      sendJson(res, 429, { error: "Too many login attempts. Please wait and try again." });
      return true;
    }
    try {
      const body = await readBody(req);
      const pin = String(body.pin || "");
      const db = readDb();
      const valid = db.teacherPin ? verifyTeacherPin(pin, db.teacherPin) : Boolean(initialTeacherPin && pin === initialTeacherPin);
      if (!valid) {
        sendJson(res, 401, { error: "That PIN did not match." });
        return true;
      }
      if (!db.teacherPin) {
        db.teacherPin = hashTeacherPin(pin);
        writeDb(db);
      }
      const session = { role: "teacher", name: "Mr. Nieves", exp: Date.now() + 8 * 60 * 60 * 1000 };
      sendJson(res, 200, { ok: true, session: publicSession(session) }, { "Set-Cookie": sessionCookie(req, session) });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return true;
  }

  if (req.method === "POST" && pathname === "/api/auth/logout") {
    if (!requireSameOrigin(req, res)) return true;
    sendJson(res, 200, { ok: true }, { "Set-Cookie": clearSessionCookie(req) });
    return true;
  }

  if (req.method === "PUT" && pathname === "/api/auth/teacher-pin") {
    if (!requireSameOrigin(req, res)) return true;
    const session = requireRole(req, res, ["teacher"]);
    if (!session) return true;
    try {
      const body = await readBody(req);
      const pin = String(body.pin || "").replace(/\D/g, "");
      if (pin.length < 6 || pin.length > 12) {
        sendJson(res, 400, { error: "Use a teacher PIN between 6 and 12 digits." });
        return true;
      }
      const db = readDb();
      db.teacherPin = hashTeacherPin(pin);
      writeDb(db);
      sendJson(res, 200, { ok: true });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return true;
  }

  return false;
}

async function handleApprovedStudentsApi(req, res, pathname) {
  if (!pathname.startsWith("/api/approved-students")) return false;
  if (!requireSameOrigin(req, res)) return true;
  const session = requireRole(req, res, ["teacher"]);
  if (!session) return true;
  const db = readDb();

  if (req.method === "GET" && pathname === "/api/approved-students") {
    sendJson(res, 200, { students: publicApprovedStudents(db.approvedStudents) });
    return true;
  }

  if (req.method === "PUT" && pathname === "/api/approved-students/import") {
    try {
      const body = await readBody(req);
      const incomingStudents = Array.isArray(body.students)
        ? body.students.map(student => ({
            email: normalizeEmail(student && student.email),
            name: cleanText(student && student.name, 80),
            grade: cleanGrade(student && student.grade)
          }))
        : (Array.isArray(body.emails)
            ? body.emails
            : (String(body.emails || "").match(/[A-Za-z0-9._%+'-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || [])
          ).map(email => ({ email: normalizeEmail(email), name: "", grade: "" }));
      let before = normalizeApprovedStudents(db.approvedStudents);
      for (const incomingEmail of incomingStudents.map(student => student.email).filter(email => email.includes("'"))) {
        const [localPart, domain] = incomingEmail.split("@");
        const truncatedEmail = `${localPart.slice(localPart.indexOf("'") + 1)}@${domain}`;
        if (!before.some(student => student.email === incomingEmail)) {
          before = before.map(student => student.email === truncatedEmail ? { ...student, email: incomingEmail } : student);
        }
      }
      const beforeByEmail = new Map(before.map(student => [student.email, student]));
      let updated = 0;
      for (const incoming of incomingStudents) {
        if (!incoming.email || !incoming.email.endsWith(`@${allowedStudentDomain}`)) continue;
        const existing = beforeByEmail.get(incoming.email);
        if (existing) {
          const nextName = incoming.name || existing.name;
          const nextGrade = incoming.grade || existing.grade;
          if (nextName !== existing.name || nextGrade !== existing.grade) updated += 1;
          beforeByEmail.set(incoming.email, { ...existing, name: nextName, grade: nextGrade });
        } else {
          beforeByEmail.set(incoming.email, incoming);
        }
      }
      db.approvedStudents = normalizeApprovedStudents([...beforeByEmail.values()]);
      const activationCodes = [];
      db.approvedStudents = db.approvedStudents.map(student => {
        if (student.passwordHash || student.activationHash) return student;
        const code = createActivationCode();
        const record = hashStudentSecret(normalizeActivationCode(code));
        activationCodes.push({ email: student.email, activationCode: code });
        return {
          ...student,
          activationSalt: record.salt,
          activationHash: record.hash,
          activationIssuedAt: new Date().toISOString()
        };
      });
      writeDb(db);
      sendJson(res, 200, {
        ok: true,
        added: db.approvedStudents.length - before.length,
        updated,
        total: db.approvedStudents.length,
        activationCodes,
        students: publicApprovedStudents(db.approvedStudents)
      });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return true;
  }

  if (req.method === "POST" && pathname === "/api/approved-students/regenerate-codes") {
    const activationCodes = [];
    db.approvedStudents = normalizeApprovedStudents(db.approvedStudents).map(student => {
      if (student.passwordHash) return student;
      const code = createActivationCode();
      const record = hashStudentSecret(normalizeActivationCode(code));
      activationCodes.push({ email: student.email, activationCode: code });
      return {
        ...student,
        activationSalt: record.salt,
        activationHash: record.hash,
        activationIssuedAt: new Date().toISOString()
      };
    });
    writeDb(db);
    sendJson(res, 200, {
      ok: true,
      activationCodes,
      students: publicApprovedStudents(db.approvedStudents)
    });
    return true;
  }

  if (req.method === "POST" && pathname.endsWith("/reset-code")) {
    const encodedEmail = pathname.slice("/api/approved-students/".length, -"/reset-code".length);
    const email = normalizeEmail(decodeURIComponent(encodedEmail));
    const student = normalizeApprovedStudents(db.approvedStudents).find(item => item.email === email);
    if (!student) {
      sendJson(res, 404, { error: "Approved student not found." });
      return true;
    }
    const code = createActivationCode();
    const record = hashStudentSecret(normalizeActivationCode(code));
    const resetStudent = {
      ...student,
      passwordSalt: "",
      passwordHash: "",
      activationSalt: record.salt,
      activationHash: record.hash,
      activationIssuedAt: new Date().toISOString()
    };
    db.approvedStudents = db.approvedStudents.map(item => normalizeEmail(item.email) === email ? resetStudent : item);
    writeDb(db);
    sendJson(res, 200, {
      ok: true,
      email,
      activationCode: code,
      students: publicApprovedStudents(db.approvedStudents)
    });
    return true;
  }

  if (req.method === "DELETE" && pathname.startsWith("/api/approved-students/")) {
    const email = normalizeEmail(decodeURIComponent(pathname.slice("/api/approved-students/".length)));
    db.approvedStudents = normalizeApprovedStudents(db.approvedStudents).filter(student => student.email !== email);
    writeDb(db);
    sendJson(res, 200, { ok: true, students: publicApprovedStudents(db.approvedStudents) });
    return true;
  }

  sendJson(res, 404, { error: "Not found." });
  return true;
}

async function handleApi(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/health") {
    sendJson(res, 200, {
      ok: true,
      studentLoginConfigured: Boolean(configuredSessionSecret),
      teacherAuthConfigured: Boolean(initialTeacherPin || readDb().teacherPin)
    });
    return true;
  }

  if (await handleAuthApi(req, res, pathname)) return true;
  if (await handleApprovedStudentsApi(req, res, pathname)) return true;

  const session = readSession(req);
  if (req.method === "GET" && pathname === "/api/state") {
    sendJson(res, 200, publicState(readDb(), session));
    return true;
  }

  if (req.method === "GET" && pathname === "/api/threads") {
    const allowed = requireRole(req, res, ["student", "teacher"]);
    if (!allowed) return true;
    sendJson(res, 200, { threads: publicApprovedThreads(readDb().threads) });
    return true;
  }

  if (req.method === "GET" && pathname === "/api/moderation") {
    if (!requireRole(req, res, ["teacher"])) return true;
    sendJson(res, 200, { moderation: teacherModerationData(readDb()) });
    return true;
  }

  if (req.method === "POST" && pathname === "/api/threads") {
    if (!requireSameOrigin(req, res)) return true;
    const allowed = requireRole(req, res, ["student", "teacher"]);
    if (!allowed) return true;
    try {
      const body = await readBody(req);
      const db = readDb();
      if (allowed.role === "student" && rejectIfMuted(db, allowed, res)) return true;
      const title = cleanText(body.title, 80);
      const message = cleanMultilineText(body.message || body.body, 360);
      const grade = allowed.role === "teacher" ? "Teacher" : cleanGrade(allowed.grade);
      if (!title || !message || !grade) throw new Error("Topic title and message are required.");
      const submittedAt = new Date().toISOString();
      const result = allowed.role === "teacher"
        ? moderateMessage(`${title}\n${message}`)
        : applyPostingBehavior(db, allowed, moderateMessage(`${title}\n${message}`));
      if (allowed.role === "student" && result.status === "blocked") {
        sendJson(res, 200, {
          ok: false,
          moderationStatus: "blocked",
          message: result.studentMessage,
          reasons: result.reasons.map(item => item.code),
          threads: publicApprovedThreads(db.threads),
          pendingModeration: studentPendingModeration(db, allowed)
        });
        return true;
      }
      const topic = {
        id: crypto.randomUUID(),
        studentName: allowed.role === "teacher"
          ? cleanText(allowed.name || "Mr. Nieves", 80)
          : studentDisplayName(allowed),
        grade,
        title,
        body: message,
        createdAt: submittedAt,
        replies: [],
        ...moderationFields(result, allowed, submittedAt)
      };
      db.threads = [topic, ...normalizeModeratedThreads(db.threads)];
      writeDb(db);
      sendJson(res, result.status === "needs_review" ? 202 : 200, {
        ok: true,
        moderationStatus: topic.moderationStatus,
        message: topic.moderationStatus === "needs_review"
          ? result.studentMessage
          : "Topic started.",
        threads: publicApprovedThreads(db.threads),
        pendingModeration: studentPendingModeration(db, allowed)
      });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return true;
  }

  const replySubmission = pathname.match(/^\/api\/threads\/([^/]+)\/replies$/);
  if (req.method === "POST" && replySubmission) {
    if (!requireSameOrigin(req, res)) return true;
    const allowed = requireRole(req, res, ["student", "teacher"]);
    if (!allowed) return true;
    try {
      const body = await readBody(req);
      const db = readDb();
      if (allowed.role === "student" && rejectIfMuted(db, allowed, res)) return true;
      const threadId = decodeURIComponent(replySubmission[1]);
      const thread = normalizeModeratedThreads(db.threads).find(item => item.id === threadId);
      if (!thread || !isApprovedPost(thread)) {
        sendJson(res, 404, { error: "That Colt Corner topic is not available." });
        return true;
      }
      const message = cleanMultilineText(body.message, 320);
      const grade = allowed.role === "teacher" ? "Teacher" : cleanGrade(allowed.grade);
      if (!message || !grade) throw new Error("A reply message is required.");
      const submittedAt = new Date().toISOString();
      const result = allowed.role === "teacher"
        ? moderateMessage(message)
        : applyPostingBehavior(db, allowed, moderateMessage(message));
      if (allowed.role === "student" && result.status === "blocked") {
        sendJson(res, 200, {
          ok: false,
          moderationStatus: "blocked",
          message: result.studentMessage,
          reasons: result.reasons.map(item => item.code),
          threads: publicApprovedThreads(db.threads),
          pendingModeration: studentPendingModeration(db, allowed)
        });
        return true;
      }
      thread.replies.push({
        id: crypto.randomUUID(),
        studentName: allowed.role === "teacher"
          ? cleanText(allowed.name || "Mr. Nieves", 80)
          : studentDisplayName(allowed),
        grade,
        message,
        createdAt: submittedAt,
        ...moderationFields(result, allowed, submittedAt)
      });
      db.threads = normalizeModeratedThreads(db.threads).map(item => item.id === thread.id ? thread : item);
      writeDb(db);
      sendJson(res, result.status === "needs_review" ? 202 : 200, {
        ok: true,
        moderationStatus: result.status,
        message: result.status === "needs_review" ? result.studentMessage : "Reply posted.",
        threads: publicApprovedThreads(db.threads),
        pendingModeration: studentPendingModeration(db, allowed)
      });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return true;
  }

  const moderationAction = pathname.match(/^\/api\/moderation\/([^/]+)$/);
  if (req.method === "PATCH" && moderationAction) {
    if (!requireSameOrigin(req, res)) return true;
    const teacher = requireRole(req, res, ["teacher"]);
    if (!teacher) return true;
    try {
      const body = await readBody(req);
      const db = readDb();
      db.threads = normalizeModeratedThreads(db.threads);
      const target = findModerationTarget(db, decodeURIComponent(moderationAction[1]));
      if (!target) {
        sendJson(res, 404, { error: "Moderation item not found." });
        return true;
      }
      const update = updateModerationTarget(target, body, cleanText(teacher.name || "Mr. Nieves", 80));
      if (update.deleted) deleteModerationTarget(db, target);
      writeDb(db);
      sendJson(res, 200, {
        ok: true,
        threads: publicApprovedThreads(db.threads),
        moderation: teacherModerationData(db)
      });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return true;
  }

  const deleteReply = pathname.match(/^\/api\/threads\/([^/]+)\/replies\/([^/]+)$/);
  if (req.method === "DELETE" && deleteReply) {
    if (!requireSameOrigin(req, res)) return true;
    if (!requireRole(req, res, ["teacher"])) return true;
    const db = readDb();
    db.threads = normalizeModeratedThreads(db.threads);
    const thread = db.threads.find(item => item.id === decodeURIComponent(deleteReply[1]));
    if (thread) thread.replies = thread.replies.filter(reply => reply.id !== decodeURIComponent(deleteReply[2]));
    writeDb(db);
    sendJson(res, 200, { ok: true, threads: publicApprovedThreads(db.threads), moderation: teacherModerationData(db) });
    return true;
  }

  const deleteThread = pathname.match(/^\/api\/threads\/([^/]+)$/);
  if (req.method === "DELETE" && deleteThread) {
    if (!requireSameOrigin(req, res)) return true;
    if (!requireRole(req, res, ["teacher"])) return true;
    const db = readDb();
    db.threads = normalizeModeratedThreads(db.threads).filter(thread => thread.id !== decodeURIComponent(deleteThread[1]));
    writeDb(db);
    sendJson(res, 200, { ok: true, threads: publicApprovedThreads(db.threads), moderation: teacherModerationData(db) });
    return true;
  }

  if (req.method === "GET" && pathname === "/api/leaderboards") {
    sendJson(res, 200, { leaderboards: readDb().leaderboards });
    return true;
  }

  if (req.method === "PUT" && pathname === "/api/links") {
    if (!requireSameOrigin(req, res)) return true;
    if (!requireRole(req, res, ["teacher"])) return true;
    try {
      const body = await readBody(req);
      if (!Array.isArray(body.links)) throw new Error("links must be an array.");
      const db = readDb();
      db.links = normalizeLinks(body.links);
      writeDb(db);
      sendJson(res, 200, { ok: true, links: db.links });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return true;
  }

  if (req.method === "POST" && pathname === "/api/leaderboards") {
    if (!requireSameOrigin(req, res)) return true;
    try {
      const body = await readBody(req);
      const entry = body.entry && typeof body.entry === "object" ? body.entry : body;
      const normalized = normalizeLeaderboards([{ ...entry, createdAt: new Date().toISOString() }]);
      if (!normalized.length) {
        sendJson(res, 400, { error: "A leaderboard entry must include at least one coin." });
        return true;
      }
      const db = readDb();
      db.leaderboards = mergeLeaderboards(db.leaderboards, normalized);
      writeDb(db);
      sendJson(res, 200, { ok: true, leaderboards: db.leaderboards });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return true;
  }

  if (req.method === "PUT" && pathname === "/api/leaderboards/import") {
    if (!requireSameOrigin(req, res)) return true;
    try {
      const body = await readBody(req);
      if (!Array.isArray(body.leaderboards)) {
        sendJson(res, 400, { error: "leaderboards must be an array." });
        return true;
      }
      const db = readDb();
      db.leaderboards = mergeLeaderboards(db.leaderboards, body.leaderboards.slice(0, 100));
      writeDb(db);
      sendJson(res, 200, { ok: true, leaderboards: db.leaderboards });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return true;
  }

  if (req.method === "PUT" && pathname === "/api/threads") {
    if (!requireSameOrigin(req, res)) return true;
    const allowed = requireRole(req, res, ["student", "teacher"]);
    if (!allowed) return true;
    try {
      const body = await readBody(req);
      const db = readDb();
      if (allowed.role === "teacher") {
        if (!Array.isArray(body.threads)) throw new Error("threads must be an array.");
        db.threads = preserveNonPublicModeration(
          db.threads,
          applyTeacherThreadIdentity(publicApprovedThreads(db.threads), body.threads, allowed)
        );
      } else {
        sendJson(res, 405, {
          error: "Please refresh Classroom Launchpad before posting.",
          code: "USE_MODERATED_POSTING"
        });
        return true;
      }
      writeDb(db);
      sendJson(res, 200, { ok: true, threads: publicApprovedThreads(db.threads) });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return true;
  }

  if (req.method === "PUT" && pathname === "/api/website-requests") {
    if (!requireSameOrigin(req, res)) return true;
    const allowed = requireRole(req, res, ["student", "teacher"]);
    if (!allowed) return true;
    try {
      const body = await readBody(req);
      const db = readDb();
      if (!Array.isArray(body.websiteRequests)) throw new Error("websiteRequests must be an array.");
      if (allowed.role === "teacher") {
        db.websiteRequests = body.websiteRequests;
      } else {
        if (!body.websiteRequests.length) throw new Error("A website request is required.");
        const draft = body.websiteRequests[0] || {};
        const websiteName = cleanText(draft.websiteName, 120);
        const grade = cleanGrade(allowed.grade);
        if (!websiteName || !grade) throw new Error("Website name and grade are required.");
        db.websiteRequests = [{
          id: crypto.randomUUID(),
          studentName: studentDisplayName(allowed),
          grade,
          websiteName,
          createdAt: new Date().toISOString()
        }, ...db.websiteRequests];
      }
      writeDb(db);
      sendJson(res, 200, { ok: true });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return true;
  }

  const teacherWriteTargets = {
    "/api/muted-students": "mutedStudents"
  };

  if (req.method === "PUT" && teacherWriteTargets[pathname]) {
    if (!requireSameOrigin(req, res)) return true;
    if (!requireRole(req, res, ["teacher"])) return true;
    try {
      const body = await readBody(req);
      const key = teacherWriteTargets[pathname];
      if (!Array.isArray(body[key])) throw new Error(`${key} must be an array.`);
      const db = readDb();
      db[key] = body[key];
      writeDb(db);
      sendJson(res, 200, { ok: true });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return true;
  }

  if (req.method === "PUT" && ["/api/daily-launch", "/api/class-timer", "/api/random-activity"].includes(pathname)) {
    if (!requireSameOrigin(req, res)) return true;
    if (!requireRole(req, res, ["teacher"])) return true;
    try {
      const body = await readBody(req);
      const db = readDb();
      if (pathname === "/api/daily-launch") {
        const message = typeof body.message === "string" ? body.message.trim().slice(0, 3000) : "";
        db.dailyLaunch = { message: message || defaultDb.dailyLaunch.message, updatedAt: new Date().toISOString() };
      }
      if (pathname === "/api/class-timer") {
        const incoming = body.classTimer && typeof body.classTimer === "object" ? body.classTimer : {};
        const titles = new Set(["Work Time", "Test Time", "Project Time", "Student Pick", "Study Time"]);
        const statuses = new Set(["idle", "running", "paused", "ended"]);
        db.classTimer = {
          title: titles.has(incoming.title) ? incoming.title : defaultDb.classTimer.title,
          status: statuses.has(incoming.status) ? incoming.status : defaultDb.classTimer.status,
          durationSeconds: Math.max(60, Math.min(7200, Number(incoming.durationSeconds) || defaultDb.classTimer.durationSeconds)),
          remainingSeconds: Math.max(0, Math.min(7200, Number(incoming.remainingSeconds) || defaultDb.classTimer.remainingSeconds)),
          endAt: typeof incoming.endAt === "string" ? incoming.endAt : "",
          updatedAt: new Date().toISOString()
        };
      }
      if (pathname === "/api/random-activity") {
        const incoming = body.randomActivity && typeof body.randomActivity === "object" ? body.randomActivity : {};
        db.randomActivity = { locked: Boolean(incoming.locked), updatedAt: new Date().toISOString() };
      }
      writeDb(db);
      sendJson(res, 200, { ok: true });
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
  if (pathname.startsWith("/data/") || pathname.startsWith("/work/") || pathname.startsWith("/private/")) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const requested = pathname === "/" ? "/index.html" : pathname;
  let decoded;
  try {
    decoded = decodeURIComponent(requested);
  } catch {
    res.writeHead(400);
    res.end("Bad request");
    return;
  }
  const filePath = path.normalize(path.join(root, decoded));
  if (!filePath.startsWith(`${root}${path.sep}`) && filePath !== root) {
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
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    if (await handleApi(req, res, url.pathname)) return;
    serveStatic(req, res, url.pathname);
  } catch {
    if (!res.headersSent) sendJson(res, 500, { error: "The server could not complete this request." });
    else res.end();
  }
});

server.listen(port, "0.0.0.0", () => {
  const addresses = Object.values(os.networkInterfaces())
    .flat()
    .filter(item => item && item.family === "IPv4" && !item.internal)
    .map(item => `http://${item.address}:${port}/`);
  console.log(`Classroom Launchpad server running at http://localhost:${port}/`);
  addresses.forEach(address => console.log(`Network URL: ${address}`));
  if (!configuredSessionSecret) console.log("Student login is waiting for SESSION_SECRET.");
  if (!initialTeacherPin && !readDb().teacherPin) console.log("Teacher login is waiting for TEACHER_PIN.");
});
