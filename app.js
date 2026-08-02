const categories = [
  "Typing Practice",
  "Social Studies & Science",
  "Computer Skills",
  "Review Games",
  "Logic Games",
  "Creative Projects",
  "Class Videos"
];

const LAUNCHPAD_FEEDBACK_TYPES = [
  "Website suggestion",
  "Feature request",
  "Bug or glitch",
  "Broken link",
  "Other"
];
const CLASSROOM_PASS_DESTINATIONS = [
  "Restroom",
  "Water",
  "Office",
  "Nurse",
  "Teacher Errand",
  "Other Approved Reason"
];

const CLASSROOM_EXPECTATIONS = Array.isArray(window.COLT_ASSISTANT_KNOWLEDGE?.classroomRules)
  && window.COLT_ASSISTANT_KNOWLEDGE.classroomRules.length
  ? window.COLT_ASSISTANT_KNOWLEDGE.classroomRules.map(rule => String(rule))
  : [
      "Stay on approved websites.",
      "Work quietly.",
      "Keep headphone volume low.",
      "Do not switch activities without permission.",
      "Ask before visiting an unlisted website.",
      "Use respectful and school-appropriate language."
    ];

const DEFAULT_TEACHER_PIN = "1017";
const LEGACY_DEFAULT_PINS = ["123", "1234"];
const DEFAULT_DAILY_LAUNCH = {
  message: "Check the board for today's first task, then choose a teacher-approved activity or resource.",
  updatedAt: ""
};
const DAILY_LAUNCH_REQUEST_ID = "__daily_launch__";
const DEFAULT_CLASS_TIMER = {
  title: "Work Time",
  status: "idle",
  durationSeconds: 600,
  remainingSeconds: 600,
  endAt: "",
  updatedAt: ""
};
const CLASS_TIMER_REQUEST_ID = "__class_timer__";
const classTimerTitles = ["Work Time", "Test Time", "Project Time", "Student Pick", "Study Time"];
const DEFAULT_RANDOM_ACTIVITY_SETTINGS = {
  locked: false,
  updatedAt: ""
};
const RANDOM_ACTIVITY_REQUEST_ID = "__random_activity__";
const COLT_RUN_URL = "internal:colt-run";

const HOME_PROFILE_VIDEOS = [
  "assets/mr-nieves-colts.mp4",
  "assets/home-profile-02.mp4",
  "assets/home-profile-03.mp4",
  "assets/home-profile-04.mp4",
  "assets/home-profile-05.mp4",
  "assets/home-profile-06.mp4",
  "assets/home-profile-07.mp4",
  "assets/home-profile-08.mp4",
  "assets/home-profile-09.mp4",
  "assets/home-profile-10.mp4",
  "assets/home-profile-11.mp4",
  "assets/home-profile-12.mp4"
];
const HOME_PROFILE_QUEUE_KEY = "classroomLaunchpadHomeProfileQueueV1";
const HOME_PROFILE_LAST_KEY = "classroomLaunchpadHomeProfileLastV1";
const HOME_NAVIGATION_COLLAPSED_KEY = "classroomLaunchpadHomeNavigationCollapsedV1";
const HOME_NAVIGATION_ITEMS = [
  { id: "home-top", label: "Home", icon: "&#8962;" },
  { id: "home-launch", label: "Today's Launch", icon: "&#10003;" },
  { id: "home-expectations", label: "Expectations", icon: "&#9745;" },
  { id: "home-categories", label: "Website Categories", icon: "&#9638;" },
  { id: "home-assignments", label: "Assignments", icon: "&#9635;" },
  { id: "home-classroom-pass", label: "Classroom Pass", icon: "&#127915;" },
  { id: "home-colt-corner", label: "Colt Corner", icon: "&#10022;" },
  { id: "home-feedback", label: "Suggest or Report", icon: "&#9993;" }
];

function shuffledHomeProfileIndexes() {
  const indexes = HOME_PROFILE_VIDEOS.map((_, index) => index);
  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
  }
  return indexes;
}

function selectHomeProfileVideo() {
  try {
    const lastIndex = Number(localStorage.getItem(HOME_PROFILE_LAST_KEY));
    let queue = JSON.parse(localStorage.getItem(HOME_PROFILE_QUEUE_KEY) || "[]");
    const validQueue = Array.isArray(queue)
      && new Set(queue).size === queue.length
      && queue.every(index => Number.isInteger(index) && index >= 0 && index < HOME_PROFILE_VIDEOS.length);
    if (!validQueue || !queue.length) queue = shuffledHomeProfileIndexes();
    if (queue.length > 1 && queue[0] === lastIndex) {
      const replacementIndex = queue.findIndex(index => index !== lastIndex);
      [queue[0], queue[replacementIndex]] = [queue[replacementIndex], queue[0]];
    }
    const selectedIndex = queue.shift();
    localStorage.setItem(HOME_PROFILE_QUEUE_KEY, JSON.stringify(queue));
    localStorage.setItem(HOME_PROFILE_LAST_KEY, String(selectedIndex));
    return HOME_PROFILE_VIDEOS[selectedIndex];
  } catch (error) {
    return HOME_PROFILE_VIDEOS[Math.floor(Math.random() * HOME_PROFILE_VIDEOS.length)];
  }
}

const homeProfileVideo = selectHomeProfileVideo();

let deferredVideoObserver = null;
let homeNavigationObserver = null;

function isPreferredResponsiveVideo(video) {
  const mobileLayout = window.matchMedia("(max-width: 720px)").matches;
  if (video.classList.contains("hero-bg-video")) return !mobileLayout;
  if (video.classList.contains("hero-colt-mobile-video")) return mobileLayout;
  return true;
}

function loadDeferredVideo(video) {
  if (!video || video.dataset.videoLoaded === "true" || !isPreferredResponsiveVideo(video)) return;
  const sources = Array.from(video.querySelectorAll("source[data-src]"));
  if (!sources.length) return;
  sources.forEach(source => {
    source.src = source.dataset.src;
  });
  video.dataset.videoLoaded = "true";
  video.preload = "metadata";
  video.load();
  if (video.autoplay) video.play().catch(() => {});
}

function observeDeferredVideos(root = document) {
  const videos = Array.from(root.querySelectorAll("video")).filter(video => video.querySelector("source[data-src]"));
  if (!videos.length) return;
  if (!("IntersectionObserver" in window)) {
    videos.forEach(loadDeferredVideo);
    return;
  }
  if (!deferredVideoObserver) {
    deferredVideoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (!isPreferredResponsiveVideo(entry.target)) return;
        loadDeferredVideo(entry.target);
        deferredVideoObserver.unobserve(entry.target);
      });
    }, { rootMargin: "80px 0px", threshold: 0.01 });
  }
  videos.forEach(video => deferredVideoObserver.observe(video));
}

function refreshResponsiveVideos() {
  document.querySelectorAll(".hero-bg-video, .hero-colt-mobile-video").forEach(video => {
    if (isPreferredResponsiveVideo(video)) {
      const rect = video.getBoundingClientRect();
      if (rect.bottom >= -80 && rect.top <= window.innerHeight + 80) loadDeferredVideo(video);
    } else if (!video.paused) {
      video.pause();
    }
  });
}

window.addEventListener("resize", refreshResponsiveVideos, { passive: true });

const categoryIcons = {
  "Typing Practice": "⌨",
  "Social Studies & Science": "🌎",
  "Computer Skills": "💻",
  "Review Games": "★",
  "Logic Games": "◆",
  "Creative Projects": "✎",
  "Class Videos": "▶"
};

function makeId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cloneLinks(items) {
  return JSON.parse(JSON.stringify(items));
}

function normalizeSharedLinks(items) {
  return (Array.isArray(items) ? items : []).flatMap(item => {
    if (!item || typeof item !== "object") return [];
    const title = String(item.title || "").trim();
    const url = String(item.url || "").trim();
    const category = String(item.category || "").trim();
    if (!title || !url || !category) return [];
    return [{
      id: String(item.id || makeId()),
      title,
      instruction: String(item.instruction || "").trim(),
      url,
      category,
      active: item.active !== false,
      todayChoice: Boolean(item.todayChoice)
    }];
  });
}

function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  const source = String(text || "").replace(/^\uFEFF/, "");
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === '"') {
      if (quoted && source[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && source[index + 1] === "\n") index += 1;
      row.push(value.trim());
      if (row.some(cell => cell)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }
  row.push(value.trim());
  if (row.some(cell => cell)) rows.push(row);
  return rows;
}

function parseStudentRosterCsv(text) {
  const rows = parseCsvRows(text);
  if (rows.length < 2) throw new Error("The roster file does not contain any student rows.");
  const headers = rows[0].map(header => header.toLowerCase().replace(/[^a-z]/g, ""));
  const emailIndex = headers.findIndex(header => ["email", "schoolemail", "studentemail"].includes(header));
  const nameIndex = headers.findIndex(header => ["name", "studentname"].includes(header));
  const gradeIndex = headers.findIndex(header => ["grade", "studentgrade"].includes(header));
  if (emailIndex < 0 || nameIndex < 0) throw new Error("The roster must include Student Name and School Email columns.");
  return rows.slice(1).map(row => ({
    email: row[emailIndex] || "",
    name: row[nameIndex] || "",
    grade: gradeIndex >= 0 ? row[gradeIndex] || "" : ""
  })).filter(student => student.email && student.name);
}

function normalizeRequests(items) {
  return (Array.isArray(items) ? items : []).filter(item => item && item.id !== DAILY_LAUNCH_REQUEST_ID && item.id !== CLASS_TIMER_REQUEST_ID && item.id !== RANDOM_ACTIVITY_REQUEST_ID).map(item => ({
    id: item.id || makeId(),
    studentName: item.studentName || "",
    grade: item.grade || "",
    feedbackType: LAUNCHPAD_FEEDBACK_TYPES.includes(item.feedbackType) ? item.feedbackType : "Website suggestion",
    websiteName: item.websiteName || "",
    createdAt: item.createdAt || new Date().toISOString()
  }));
}

function normalizeThreads(items) {
  return (Array.isArray(items) ? items : []).map(item => {
    const replies = Array.isArray(item.replies) ? item.replies.map(reply => ({
      id: reply.id || makeId(),
      studentName: reply.studentName || "",
      grade: reply.grade || "",
      message: reply.message || "",
      createdAt: reply.createdAt || new Date().toISOString()
    })) : [];
    return {
      id: item.id || makeId(),
      title: item.title || item.message || "Class Topic",
      studentName: item.studentName || "",
      grade: item.grade || "",
      body: item.body || item.message || "",
      replies,
      createdAt: item.createdAt || new Date().toISOString()
    };
  });
}

function normalizeMutedStudents(items) {
  return (Array.isArray(items) ? items : []).map(item => ({
    id: item.id || makeId(),
    name: item.name || "",
    normalized: item.normalized || normalizeStudentName(item.name || ""),
    createdAt: item.createdAt || new Date().toISOString()
  })).filter(item => item.name && item.normalized);
}

function normalizeDailyLaunch(item) {
  const message = item && typeof item.message === "string" ? item.message.trim() : "";
  return {
    message: message || DEFAULT_DAILY_LAUNCH.message,
    updatedAt: item && typeof item.updatedAt === "string" ? item.updatedAt : ""
  };
}

function dailyLaunchRequestMarker(launch = dailyLaunch) {
  return {
    id: DAILY_LAUNCH_REQUEST_ID,
    studentName: "__system__",
    grade: "",
    websiteName: normalizeDailyLaunch(launch).message,
    createdAt: normalizeDailyLaunch(launch).updatedAt || new Date().toISOString()
  };
}

function extractDailyLaunchFromRequests(items) {
  const marker = (Array.isArray(items) ? items : []).find(item => item && item.id === DAILY_LAUNCH_REQUEST_ID);
  if (!marker) return null;
  return normalizeDailyLaunch({
    message: marker.websiteName,
    updatedAt: marker.createdAt
  });
}

function normalizeClassTimer(item) {
  const title = item && typeof item.title === "string" && classTimerTitles.includes(item.title) ? item.title : DEFAULT_CLASS_TIMER.title;
  const allowedStatus = new Set(["idle", "running", "paused", "ended"]);
  let status = item && allowedStatus.has(item.status) ? item.status : DEFAULT_CLASS_TIMER.status;
  const durationSeconds = Math.max(60, Math.min(7200, Number(item && item.durationSeconds) || DEFAULT_CLASS_TIMER.durationSeconds));
  let remainingSeconds = Math.max(0, Math.min(7200, Number(item && item.remainingSeconds) || durationSeconds));
  const endAt = item && typeof item.endAt === "string" ? item.endAt : "";
  if (status === "running" && endAt) {
    remainingSeconds = Math.max(0, Math.ceil((new Date(endAt).getTime() - Date.now()) / 1000));
    if (remainingSeconds <= 0) status = "ended";
  }
  return {
    title,
    status,
    durationSeconds,
    remainingSeconds,
    endAt: status === "running" ? endAt : "",
    updatedAt: item && typeof item.updatedAt === "string" ? item.updatedAt : ""
  };
}

function classTimerRequestMarker(timer = classTimer) {
  const normalized = normalizeClassTimer(timer);
  return {
    id: CLASS_TIMER_REQUEST_ID,
    studentName: "__system__",
    grade: "",
    websiteName: JSON.stringify(normalized),
    createdAt: normalized.updatedAt || new Date().toISOString()
  };
}

function extractClassTimerFromRequests(items) {
  const marker = (Array.isArray(items) ? items : []).find(item => item && item.id === CLASS_TIMER_REQUEST_ID);
  if (!marker) return null;
  try {
    return normalizeClassTimer(JSON.parse(marker.websiteName || "{}"));
  } catch {
    return null;
  }
}

function normalizeRandomActivitySettings(item) {
  return {
    locked: Boolean(item && item.locked),
    updatedAt: item && typeof item.updatedAt === "string" ? item.updatedAt : ""
  };
}

function randomActivityRequestMarker(settings = randomActivitySettings) {
  const normalized = normalizeRandomActivitySettings(settings);
  return {
    id: RANDOM_ACTIVITY_REQUEST_ID,
    studentName: "__system__",
    grade: "",
    websiteName: JSON.stringify(normalized),
    createdAt: normalized.updatedAt || new Date().toISOString()
  };
}

function extractRandomActivitySettingsFromRequests(items) {
  const marker = (Array.isArray(items) ? items : []).find(item => item && item.id === RANDOM_ACTIVITY_REQUEST_ID);
  if (!marker) return null;
  try {
    return normalizeRandomActivitySettings(JSON.parse(marker.websiteName || "{}"));
  } catch {
    return null;
  }
}

function chooseSharedRandomActivitySettings(primary, fallback) {
  const first = primary ? normalizeRandomActivitySettings(primary) : null;
  const second = fallback ? normalizeRandomActivitySettings(fallback) : null;
  if (!first) return second || { ...DEFAULT_RANDOM_ACTIVITY_SETTINGS };
  if (!second) return first;
  const firstTime = Date.parse(first.updatedAt || "") || 0;
  const secondTime = Date.parse(second.updatedAt || "") || 0;
  return secondTime > firstTime ? second : first;
}

function chooseSharedClassTimer(primary, fallback) {
  const first = primary ? normalizeClassTimer(primary) : null;
  const second = fallback ? normalizeClassTimer(fallback) : null;
  if (!first) return second || { ...DEFAULT_CLASS_TIMER };
  if (!second) return first;
  const firstTime = Date.parse(first.updatedAt || "") || 0;
  const secondTime = Date.parse(second.updatedAt || "") || 0;
  return secondTime > firstTime ? second : first;
}

const isGitHubPagesHost = /\.github\.io$/i.test(window.location.hostname);

const sharedBackend = {
  enabled: ["http:", "https:"].includes(window.location.protocol) && !isGitHubPagesHost,
  async request(path, options = {}) {
    if (!this.enabled) return null;
    const response = await fetch(path, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options
    });
    const payload = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error(payload && payload.error ? payload.error : `Request failed: ${response.status}`);
      error.status = response.status;
      error.code = payload && payload.code;
      throw error;
    }
    return payload;
  },
  loadState() {
    return this.request("/api/state");
  },
  saveThreads(threads) {
    return this.request("/api/threads", { method: "PUT", body: JSON.stringify({ threads }) });
  },
  submitTopic(topic) {
    return this.request("/api/threads", {
      method: "POST",
      body: JSON.stringify({ title: topic.title, message: topic.body })
    });
  },
  submitReply(threadId, reply) {
    return this.request(`/api/threads/${encodeURIComponent(threadId)}/replies`, {
      method: "POST",
      body: JSON.stringify({ message: reply.message })
    });
  },
  deleteThread(threadId) {
    return this.request(`/api/threads/${encodeURIComponent(threadId)}`, { method: "DELETE", body: "{}" });
  },
  deleteReply(threadId, replyId) {
    return this.request(`/api/threads/${encodeURIComponent(threadId)}/replies/${encodeURIComponent(replyId)}`, {
      method: "DELETE",
      body: "{}"
    });
  },
  moderatePost(postId, update) {
    return this.request(`/api/moderation/${encodeURIComponent(postId)}`, {
      method: "PATCH",
      body: JSON.stringify(update)
    });
  },
  saveLinks(links) {
    return this.request("/api/links", { method: "PUT", body: JSON.stringify({ links }) });
  },
  saveMutedStudents(students) {
    return this.request("/api/muted-students", { method: "PUT", body: JSON.stringify({ mutedStudents: students }) });
  },
  saveWebsiteRequests(requests) {
    return this.request("/api/website-requests", { method: "PUT", body: JSON.stringify({ websiteRequests: requests }) });
  },
  loadAssignments() {
    return this.request("/api/assignments");
  },
  createAssignment(assignment) {
    return this.request("/api/assignments", { method: "POST", body: JSON.stringify(assignment) });
  },
  updateAssignment(id, assignment) {
    return this.request(`/api/assignments/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(assignment) });
  },
  async uploadAssignmentAttachment(id, file) {
    if (!this.enabled) return null;
    const response = await fetch(`/api/assignments/${encodeURIComponent(id)}/attachment`, {
      method: "POST",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        "X-File-Name": encodeURIComponent(file.name)
      },
      body: file
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload && payload.error ? payload.error : `Attachment upload failed: ${response.status}`);
    return payload;
  },
  removeAssignmentAttachment(id) {
    return this.request(`/api/assignments/${encodeURIComponent(id)}/attachment`, { method: "DELETE", body: "{}" });
  },
  deleteAssignment(id) {
    return this.request(`/api/assignments/${encodeURIComponent(id)}`, { method: "DELETE", body: "{}" });
  },
  async submitAssignment(id, file, note) {
    if (!this.enabled) return null;
    const response = await fetch(`/api/assignments/${encodeURIComponent(id)}/submissions`, {
      method: "POST",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        "X-File-Name": encodeURIComponent(file.name),
        "X-Submission-Note": encodeURIComponent(note || "")
      },
      body: file
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error(payload && payload.error ? payload.error : `Upload failed: ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return payload;
  },
  async previewSubmissionFile(file) {
    if (!this.enabled) return null;
    const response = await fetch("/api/submissions/preview", {
      method: "POST",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        "X-File-Name": encodeURIComponent(file.name)
      },
      body: file
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload && payload.error ? payload.error : "This file could not be previewed.");
    return payload.preview;
  },
  async loadSubmissionPreview(id) {
    const payload = await this.request(`/api/submissions/${encodeURIComponent(id)}/preview`);
    return payload.preview;
  },
  async loadSubmissionFile(id) {
    const response = await fetch(`/api/submissions/${encodeURIComponent(id)}/file?view=inline`, {
      credentials: "same-origin"
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload && payload.error ? payload.error : "This document could not be loaded.");
    }
    return response.blob();
  },
  submitAssignmentLink(id, project) {
    return this.request(`/api/assignments/${encodeURIComponent(id)}/link-submissions`, {
      method: "POST",
      body: JSON.stringify(project)
    });
  },
  reviewSubmission(id, update) {
    return this.request(`/api/submissions/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(update) });
  },
  deleteSubmission(id) {
    return this.request(`/api/submissions/${encodeURIComponent(id)}`, { method: "DELETE", body: "{}" });
  },
  loadClassroomPass() {
    return this.request("/api/classroom-pass");
  },
  startClassroomPass(destination) {
    return this.request("/api/classroom-pass/start", {
      method: "POST",
      body: JSON.stringify({ destination })
    });
  },
  returnClassroomPass() {
    return this.request("/api/classroom-pass/return", { method: "POST", body: "{}" });
  },
  updateClassroomPassConfig(config) {
    return this.request("/api/classroom-pass/config", { method: "PATCH", body: JSON.stringify(config) });
  },
  closeClassroomPass(id) {
    return this.request(`/api/classroom-pass/${encodeURIComponent(id)}`, { method: "PATCH", body: "{}" });
  },
  deleteClassroomPass(id) {
    return this.request(`/api/classroom-pass/${encodeURIComponent(id)}`, { method: "DELETE", body: "{}" });
  },
  saveDailyLaunch(launch) {
    return this.request("/api/daily-launch", { method: "PUT", body: JSON.stringify({ message: launch.message }) });
  },
  saveClassTimer(timer) {
    return this.request("/api/class-timer", { method: "PUT", body: JSON.stringify({ classTimer: timer }) });
  },
  saveRandomActivitySettings(settings) {
    return this.request("/api/random-activity", { method: "PUT", body: JSON.stringify({ randomActivity: settings }) });
  },
  loadLeaderboards() {
    return this.request("/api/leaderboards");
  },
  submitLeaderboardEntry(entry) {
    return this.request("/api/leaderboards", { method: "POST", body: JSON.stringify({ entry }) });
  },
  importLeaderboards(leaderboards) {
    return this.request("/api/leaderboards/import", { method: "PUT", body: JSON.stringify({ leaderboards }) });
  },
  loadAuthConfig() {
    return this.request("/api/auth/config");
  },
  loadSession() {
    return this.request("/api/auth/session");
  },
  registerStudent(account) {
    return this.request("/api/auth/register", { method: "POST", body: JSON.stringify(account) });
  },
  loginStudent(email, password) {
    return this.request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  },
  teacherLogin(pin) {
    return this.request("/api/auth/teacher", { method: "POST", body: JSON.stringify({ pin }) });
  },
  logout() {
    return this.request("/api/auth/logout", { method: "POST", body: "{}" });
  },
  changeTeacherPin(pin) {
    return this.request("/api/auth/teacher-pin", { method: "PUT", body: JSON.stringify({ pin }) });
  },
  loadApprovedStudents() {
    return this.request("/api/approved-students");
  },
  importApprovedStudents(entries) {
    const body = Array.isArray(entries) ? { students: entries } : { emails: entries };
    return this.request("/api/approved-students/import", { method: "PUT", body: JSON.stringify(body) });
  },
  removeApprovedStudent(email) {
    return this.request(`/api/approved-students/${encodeURIComponent(email)}`, { method: "DELETE", body: "{}" });
  },
  resetStudentCode(email) {
    return this.request(`/api/approved-students/${encodeURIComponent(email)}/reset-code`, { method: "POST", body: "{}" });
  },
  regenerateStudentCodes() {
    return this.request("/api/approved-students/regenerate-codes", { method: "POST", body: "{}" });
  }
};

const kahootTemplate = {
  title: "Kahoot",
  url: "https://kahoot.it/",
  category: "Review Games",
  instruction: "Join a teacher-approved Kahoot review game."
};

const quizletTemplate = {
  title: "Quizlet",
  url: "https://quizlet.com/",
  category: "Review Games",
  instruction: "Study with a teacher-approved review set."
};

const exploreTemplate = {
  title: "Explore.org",
  url: "https://explore.org/",
  category: "Social Studies & Science",
  instruction: "Explore a teacher-approved live nature or science resource."
};

const geoguessrTemplate = {
  title: "GeoGuessr",
  url: "https://www.geoguessr.com/",
  category: "Social Studies & Science",
  instruction: "Explore geography with a teacher-approved map activity."
};

const worldGeographyGamesTemplate = {
  title: "World Geography Games",
  url: "https://world-geography-games.com/?utm_source=chatgpt.com",
  category: "Social Studies & Science",
  instruction: "Practice world geography with teacher-approved map games."
};

const ztypeTemplate = {
  title: "ZType",
  url: "https://zty.pe/",
  category: "Typing Practice",
  instruction: "Practice keyboard accuracy by typing the falling words."
};

const typingDotComTemplate = {
  title: "Typing.com",
  url: "https://www.typing.com/?utm_source=chatgpt.com",
  category: "Typing Practice",
  instruction: "Practice keyboarding lessons and typing accuracy."
};

const songMakerTemplate = {
  title: "Song-Maker",
  url: "https://musiclab.chromeexperiments.com/Song-Maker/",
  category: "Creative Projects",
  instruction: "Create a school-appropriate song or sound pattern."
};

const jerryLawsonTemplate = {
  title: "Jerry Lawson Game/Editor",
  url: "https://www.google.com/logos/2022/lawson/r1201/lawson.html",
  category: "Creative Projects",
  instruction: "Create or play a school-appropriate game in the Jerry Lawson editor."
};

const preziTemplate = {
  title: "Prezi",
  url: "https://prezi.com/",
  category: "Creative Projects",
  instruction: "Create or view a school-appropriate presentation."
};

const bandLabTemplate = {
  title: "BandLab",
  url: "https://www.bandlab.com/?lang=en",
  category: "Creative Projects",
  instruction: "Create or explore a school-appropriate music project."
};

const oneNoteTemplate = {
  title: "OneNote",
  url: "https://onenote.cloud.microsoft/en-us/",
  category: "Creative Projects",
  instruction: "Organize notes or create a school-appropriate notebook project."
};

const googleDocsTemplate = {
  title: "Google Docs",
  url: "https://docs.google.com/document/u/0/",
  category: "Creative Projects",
  instruction: "Write or edit a school-appropriate document."
};

const site123Template = {
  title: "SITE123",
  url: "https://www.site123.com/",
  category: "Creative Projects",
  instruction: "Create a school-appropriate website or page."
};

const beInternetAwesomeTemplate = {
  title: "Be Internet Awesome",
  url: "https://beinternetawesome.withgoogle.com/en_us",
  category: "Computer Skills",
  instruction: "Practice safe, smart, and kind internet habits."
};

const tinkercadTemplate = {
  title: "Tinkercad",
  url: "https://www.tinkercad.com/",
  category: "Computer Skills",
  instruction: "Create a school-appropriate 3D design or coding project."
};

const mouseAccuracyTemplate = {
  title: "Mouse Accuracy",
  url: "https://mouseaccuracy.com/",
  category: "Computer Skills",
  instruction: "Practice careful mouse movement and clicking accuracy."
};

const computerSkillsCourseTemplate = {
  title: "Computer Skills Course",
  url: "https://www.wistechopen.org/basic-computer-skills-mooc#1",
  category: "Computer Skills",
  instruction: "Watch tutorials, take pre-test, practice key skills."
};

const mathPlaygroundTemplate = {
  title: "Math Playground",
  url: "https://www.mathplayground.com/logic-games.html?utm_source=chatgpt.com",
  category: "Logic Games",
  instruction: "Play a teacher-approved logic or problem-solving game."
};

const coolmathGamesTemplate = {
  title: "Coolmath Games",
  url: "https://www.coolmathgames.com/c/logic-games?utm_source=chatgpt.com",
  category: "Logic Games",
  instruction: "Play a teacher-approved logic game."
};

const prodigyTemplate = {
  title: "Prodigy",
  url: "https://www.prodigygame.com/main-en/prodigy-math?utm_source=chatgpt.com",
  category: "Logic Games",
  instruction: "Practice math and problem solving in a teacher-approved game."
};

const chessOnlineTemplate = {
  title: "Chess Online",
  url: "https://www.chess.com/?utm_source=chatgpt.com",
  category: "Logic Games",
  instruction: "Practice strategy and problem solving with chess."
};

const tetrisTemplate = {
  title: "Tetris",
  url: "https://play.tetris.com/",
  category: "Logic Games",
  instruction: "Practice spatial reasoning with a teacher-approved puzzle game."
};

const jigsawExplorerTemplate = {
  title: "Jigsaw Explorer",
  url: "https://www.jigsawexplorer.com/",
  category: "Logic Games",
  instruction: "Build a teacher-approved jigsaw puzzle quietly."
};

const mecabricksTemplate = {
  title: "Mecabricks",
  url: "https://www.mecabricks.com/",
  category: "Logic Games",
  instruction: "Build a school-appropriate 3D brick model."
};

const coltRunTemplate = {
  title: "Colt Run",
  url: COLT_RUN_URL,
  category: "Logic Games",
  instruction: "Guide the Colt through a platform challenge and reach the finish flag."
};

const defaultLinks = [
  { title: "TypingClub", url: "https://www.typingclub.com/", category: "Typing Practice", instruction: "Complete one typing lesson quietly." },
  { title: "Nitro Type", url: "https://www.nitrotype.com/", category: "Typing Practice", instruction: "Practice typing speed while racing." },
  { title: "Dance Mat Typing", url: "https://www.dancemattypingguide.com/", category: "Typing Practice", instruction: "Practice beginner keyboarding skills." },
  { ...ztypeTemplate },
  { ...typingDotComTemplate },
  { title: "Seterra Geography", url: "https://www.geoguessr.com/quiz/seterra", category: "Social Studies & Science", instruction: "Practice map skills and geography quizzes." },
  { title: "National Geographic Kids Countries", url: "https://kids.nationalgeographic.com/geography/countries", category: "Social Studies & Science", instruction: "Research a country and write down three facts." },
  { title: "Google Earth", url: "https://earth.google.com/web", category: "Social Studies & Science", instruction: "Explore a location in our world." },
  { ...exploreTemplate },
  { ...geoguessrTemplate },
  { ...worldGeographyGamesTemplate },
  { title: "Common Sense Digital Citizenship", url: "https://www.commonsense.org/education/digital-citizenship", category: "Computer Skills", instruction: "Review internet safety and digital citizenship topics." },
  { title: "GCFGlobal Computer Basics", url: "https://www.learnfree.org/series/computer-basics?utm_source=chatgpt.com", category: "Computer Skills", instruction: "Practice basic computer skills." },
  { ...beInternetAwesomeTemplate },
  { ...tinkercadTemplate },
  { ...mouseAccuracyTemplate },
  { ...computerSkillsCourseTemplate },
  { title: "Gimkit", url: "https://www.gimkit.com/", category: "Review Games", instruction: "Join a teacher-approved review game." },
  { title: "Blooket", url: "https://www.blooket.com/", category: "Review Games", instruction: "Join a teacher-approved review game." },
  { ...kahootTemplate },
  { title: "Wayground, formerly Quizizz", url: "https://wayground.com/", category: "Review Games", instruction: "Join a teacher-approved quiz or review activity." },
  { ...quizletTemplate },
  { ...mathPlaygroundTemplate },
  { ...coolmathGamesTemplate },
  { ...prodigyTemplate },
  { ...chessOnlineTemplate },
  { ...tetrisTemplate },
  { ...jigsawExplorerTemplate },
  { ...mecabricksTemplate },
  { ...coltRunTemplate },
  { title: "Canva", url: "https://www.canva.com/", category: "Creative Projects", instruction: "Create a school-appropriate design or mini-poster." },
  { title: "Google Slides", url: "https://workspace.google.com/products/slides/", category: "Creative Projects", instruction: "Work on a school presentation or slide project." },
  { title: "Pixilart", url: "https://www.pixilart.com/", category: "Creative Projects", instruction: "Create school-appropriate pixel art." },
  { ...songMakerTemplate },
  { ...jerryLawsonTemplate },
  { ...preziTemplate },
  { ...bandLabTemplate },
  { ...oneNoteTemplate },
  { ...googleDocsTemplate },
  { ...site123Template },
  { title: "YouTube", url: "https://www.youtube.com/?app=desktop", category: "Class Videos", instruction: "Replace this with a teacher-approved video link." },
  { title: "PBS LearningMedia", url: "https://www.pbslearningmedia.org/", category: "Class Videos", instruction: "Explore teacher-approved educational videos." },
  { title: "Google Arts & Culture", url: "https://artsandculture.google.com/", category: "Class Videos", instruction: "Explore art, history, and culture collections." }
].map(link => ({ ...link, id: makeId(), active: true, todayChoice: false }));

const store = {
  linksKey: "earlyFinisherLinks",
  pinKey: "earlyFinisherPin",
  themeKey: "classroomLaunchpadTheme",
  requestsKey: "classroomLaunchpadWebsiteRequests",
  threadsKey: "classroomLaunchpadMessages",
  mutedStudentsKey: "classroomLaunchpadMutedStudents",
  dailyLaunchKey: "classroomLaunchpadDailyLaunch",
  classTimerKey: "classroomLaunchpadClassTimer",
  randomActivityKey: "classroomLaunchpadRandomActivity",
  loadLinks() {
    const raw = localStorage.getItem(this.linksKey);
    if (!raw) {
      this.saveLinks(defaultLinks);
      return cloneLinks(defaultLinks);
    }
    try {
      const parsed = JSON.parse(raw);
      let hydrated = parsed.map(item => ({
        active: true,
        todayChoice: false,
        ...item,
        category: item.category === "Social Studies" ? "Social Studies & Science" : item.category
      })).filter(item => item.title !== "GCFGlobal Internet Safety").map(item => {
        if (item.title === "GCFGlobal Computer Basics") {
          return {
            ...item,
            url: "https://www.learnfree.org/series/computer-basics?utm_source=chatgpt.com",
            instruction: "Practice basic computer skills."
          };
        }
        if (item.title === "YouTube" && item.url === "https://www.youtube.com/") {
          return { ...item, url: "https://www.youtube.com/?app=desktop" };
        }
        if (item.title === "Jigsaw Explorer") {
          return { ...item, url: "https://www.jigsawexplorer.com/" };
        }
        if (item.title === "Google Earth") {
          return { ...item, instruction: "Explore a location in our world." };
        }
        if (item.url === "https://www.wistechopen.org/basic-computer-skills-mooc#1") {
          return { ...item, instruction: computerSkillsCourseTemplate.instruction };
        }
        return item;
      });
      const migrationKey = "earlyFinisherKahootAdded";
      const hasKahoot = hydrated.some(item => item.title.trim().toLowerCase() === "kahoot");
      if (!localStorage.getItem(migrationKey) && !hasKahoot) {
        hydrated = [...hydrated, { ...kahootTemplate, id: makeId(), active: true, todayChoice: false }];
      }
      localStorage.setItem(migrationKey, "true");
      const quizletMigrationKey = "earlyFinisherQuizletAdded";
      const hasQuizlet = hydrated.some(item => item.url.trim().toLowerCase() === "https://quizlet.com/");
      if (!localStorage.getItem(quizletMigrationKey) && !hasQuizlet) {
        hydrated = [...hydrated, { ...quizletTemplate, id: makeId(), active: true, todayChoice: false }];
      }
      localStorage.setItem(quizletMigrationKey, "true");
      const scienceMigrationKey = "earlyFinisherScienceExploreAdded";
      const hasExplore = hydrated.some(item => item.url.trim().toLowerCase() === "https://explore.org/");
      if (!localStorage.getItem(scienceMigrationKey) && !hasExplore) {
        hydrated = [...hydrated, { ...exploreTemplate, id: makeId(), active: true, todayChoice: false }];
      }
      localStorage.setItem(scienceMigrationKey, "true");
      const geoguessrMigrationKey = "earlyFinisherGeoguessrAdded";
      const hasGeoguessr = hydrated.some(item => item.url.trim().toLowerCase() === "https://www.geoguessr.com/");
      if (!localStorage.getItem(geoguessrMigrationKey) && !hasGeoguessr) {
        hydrated = [...hydrated, { ...geoguessrTemplate, id: makeId(), active: true, todayChoice: false }];
      }
      localStorage.setItem(geoguessrMigrationKey, "true");
      const worldGeographyGamesMigrationKey = "earlyFinisherWorldGeographyGamesAdded";
      const hasWorldGeographyGames = hydrated.some(item => item.url.trim().toLowerCase() === "https://world-geography-games.com/?utm_source=chatgpt.com");
      if (!localStorage.getItem(worldGeographyGamesMigrationKey) && !hasWorldGeographyGames) {
        hydrated = [...hydrated, { ...worldGeographyGamesTemplate, id: makeId(), active: true, todayChoice: false }];
      }
      localStorage.setItem(worldGeographyGamesMigrationKey, "true");
      const ztypeMigrationKey = "earlyFinisherZtypeAdded";
      const hasZtype = hydrated.some(item => item.url.trim().toLowerCase() === "https://zty.pe/");
      if (!localStorage.getItem(ztypeMigrationKey) && !hasZtype) {
        hydrated = [...hydrated, { ...ztypeTemplate, id: makeId(), active: true, todayChoice: false }];
      }
      localStorage.setItem(ztypeMigrationKey, "true");
      const typingDotComMigrationKey = "earlyFinisherTypingDotComAdded";
      const hasTypingDotCom = hydrated.some(item => item.url.trim().toLowerCase() === "https://www.typing.com/?utm_source=chatgpt.com");
      if (!localStorage.getItem(typingDotComMigrationKey) && !hasTypingDotCom) {
        hydrated = [...hydrated, { ...typingDotComTemplate, id: makeId(), active: true, todayChoice: false }];
      }
      localStorage.setItem(typingDotComMigrationKey, "true");
      const songMakerMigrationKey = "earlyFinisherSongMakerAdded";
      const hasSongMaker = hydrated.some(item => item.url.trim().toLowerCase() === "https://musiclab.chromeexperiments.com/song-maker/");
      if (!localStorage.getItem(songMakerMigrationKey) && !hasSongMaker) {
        hydrated = [...hydrated, { ...songMakerTemplate, id: makeId(), active: true, todayChoice: false }];
      }
      localStorage.setItem(songMakerMigrationKey, "true");
      const jerryLawsonMigrationKey = "earlyFinisherJerryLawsonAdded";
      const hasJerryLawson = hydrated.some(item => item.url.trim().toLowerCase() === "https://www.google.com/logos/2022/lawson/r1201/lawson.html");
      if (!localStorage.getItem(jerryLawsonMigrationKey) && !hasJerryLawson) {
        hydrated = [...hydrated, { ...jerryLawsonTemplate, id: makeId(), active: true, todayChoice: false }];
      }
      localStorage.setItem(jerryLawsonMigrationKey, "true");
      const preziMigrationKey = "earlyFinisherPreziAdded";
      const hasPrezi = hydrated.some(item => item.url.trim().toLowerCase() === "https://prezi.com/");
      if (!localStorage.getItem(preziMigrationKey) && !hasPrezi) {
        hydrated = [...hydrated, { ...preziTemplate, id: makeId(), active: true, todayChoice: false }];
      }
      localStorage.setItem(preziMigrationKey, "true");
      const beInternetAwesomeMigrationKey = "earlyFinisherBeInternetAwesomeAdded";
      const hasBeInternetAwesome = hydrated.some(item => item.url.trim().toLowerCase() === "https://beinternetawesome.withgoogle.com/en_us");
      if (!localStorage.getItem(beInternetAwesomeMigrationKey) && !hasBeInternetAwesome) {
        hydrated = [...hydrated, { ...beInternetAwesomeTemplate, id: makeId(), active: true, todayChoice: false }];
      }
      localStorage.setItem(beInternetAwesomeMigrationKey, "true");
      const tinkercadMigrationKey = "earlyFinisherTinkercadAdded";
      const hasTinkercad = hydrated.some(item => item.url.trim().toLowerCase() === "https://www.tinkercad.com/");
      if (!localStorage.getItem(tinkercadMigrationKey) && !hasTinkercad) {
        hydrated = [...hydrated, { ...tinkercadTemplate, id: makeId(), active: true, todayChoice: false }];
      }
      localStorage.setItem(tinkercadMigrationKey, "true");
      const mathPlaygroundMigrationKey = "earlyFinisherMathPlaygroundAdded";
      const hasMathPlayground = hydrated.some(item => item.url.trim().toLowerCase() === "https://www.mathplayground.com/logic-games.html?utm_source=chatgpt.com");
      if (!localStorage.getItem(mathPlaygroundMigrationKey) && !hasMathPlayground) {
        hydrated = [...hydrated, { ...mathPlaygroundTemplate, id: makeId(), active: true, todayChoice: false }];
      }
      localStorage.setItem(mathPlaygroundMigrationKey, "true");
      const coolmathGamesMigrationKey = "earlyFinisherCoolmathGamesAdded";
      const hasCoolmathGames = hydrated.some(item => item.url.trim().toLowerCase() === "https://www.coolmathgames.com/c/logic-games?utm_source=chatgpt.com");
      if (!localStorage.getItem(coolmathGamesMigrationKey) && !hasCoolmathGames) {
        hydrated = [...hydrated, { ...coolmathGamesTemplate, id: makeId(), active: true, todayChoice: false }];
      }
      localStorage.setItem(coolmathGamesMigrationKey, "true");
      const prodigyMigrationKey = "earlyFinisherProdigyAdded";
      const hasProdigy = hydrated.some(item => item.url.trim().toLowerCase() === "https://www.prodigygame.com/main-en/prodigy-math?utm_source=chatgpt.com");
      if (!localStorage.getItem(prodigyMigrationKey) && !hasProdigy) {
        hydrated = [...hydrated, { ...prodigyTemplate, id: makeId(), active: true, todayChoice: false }];
      }
      localStorage.setItem(prodigyMigrationKey, "true");
      const chessOnlineMigrationKey = "earlyFinisherChessOnlineAdded";
      const hasChessOnline = hydrated.some(item => item.url.trim().toLowerCase() === "https://www.chess.com/?utm_source=chatgpt.com");
      if (!localStorage.getItem(chessOnlineMigrationKey) && !hasChessOnline) {
        hydrated = [...hydrated, { ...chessOnlineTemplate, id: makeId(), active: true, todayChoice: false }];
      }
      localStorage.setItem(chessOnlineMigrationKey, "true");
      const tetrisMigrationKey = "earlyFinisherTetrisAdded";
      const hasTetris = hydrated.some(item => item.url.trim().toLowerCase() === "https://play.tetris.com/");
      if (!localStorage.getItem(tetrisMigrationKey) && !hasTetris) {
        hydrated = [...hydrated, { ...tetrisTemplate, id: makeId(), active: true, todayChoice: false }];
      }
      localStorage.setItem(tetrisMigrationKey, "true");
      const jigsawExplorerMigrationKey = "earlyFinisherJigsawExplorerAdded";
      const hasJigsawExplorer = hydrated.some(item => item.url.trim().toLowerCase() === "https://www.jigsawexplorer.com/");
      if (!localStorage.getItem(jigsawExplorerMigrationKey) && !hasJigsawExplorer) {
        hydrated = [...hydrated, { ...jigsawExplorerTemplate, id: makeId(), active: true, todayChoice: false }];
      }
      localStorage.setItem(jigsawExplorerMigrationKey, "true");
      const mecabricksMigrationKey = "earlyFinisherMecabricksAdded";
      const hasMecabricks = hydrated.some(item => item.url.trim().toLowerCase() === "https://www.mecabricks.com/");
      if (!localStorage.getItem(mecabricksMigrationKey) && !hasMecabricks) {
        hydrated = [...hydrated, { ...mecabricksTemplate, id: makeId(), active: true, todayChoice: false }];
      }
      localStorage.setItem(mecabricksMigrationKey, "true");
      const coltRunMigrationKey = "classroomLaunchpadColtRunAdded";
      const hasColtRun = hydrated.some(item => item.url.trim().toLowerCase() === COLT_RUN_URL);
      if (!localStorage.getItem(coltRunMigrationKey) && !hasColtRun) {
        hydrated = [...hydrated, { ...coltRunTemplate, id: makeId(), active: true, todayChoice: false }];
      }
      localStorage.setItem(coltRunMigrationKey, "true");
      const bandLabMigrationKey = "earlyFinisherBandLabAdded";
      const hasBandLab = hydrated.some(item => item.url.trim().toLowerCase() === "https://www.bandlab.com/?lang=en");
      if (!localStorage.getItem(bandLabMigrationKey) && !hasBandLab) {
        hydrated = [...hydrated, { ...bandLabTemplate, id: makeId(), active: true, todayChoice: false }];
      }
      localStorage.setItem(bandLabMigrationKey, "true");
      const oneNoteMigrationKey = "earlyFinisherOneNoteAdded";
      const hasOneNote = hydrated.some(item => item.url.trim().toLowerCase() === "https://onenote.cloud.microsoft/en-us/");
      if (!localStorage.getItem(oneNoteMigrationKey) && !hasOneNote) {
        hydrated = [...hydrated, { ...oneNoteTemplate, id: makeId(), active: true, todayChoice: false }];
      }
      localStorage.setItem(oneNoteMigrationKey, "true");
      const googleDocsMigrationKey = "earlyFinisherGoogleDocsAdded";
      const hasGoogleDocs = hydrated.some(item => item.url.trim().toLowerCase() === "https://docs.google.com/document/u/0/");
      if (!localStorage.getItem(googleDocsMigrationKey) && !hasGoogleDocs) {
        hydrated = [...hydrated, { ...googleDocsTemplate, id: makeId(), active: true, todayChoice: false }];
      }
      localStorage.setItem(googleDocsMigrationKey, "true");
      const site123MigrationKey = "earlyFinisherSite123Added";
      const hasSite123 = hydrated.some(item => item.url.trim().toLowerCase() === "https://www.site123.com/");
      if (!localStorage.getItem(site123MigrationKey) && !hasSite123) {
        hydrated = [...hydrated, { ...site123Template, id: makeId(), active: true, todayChoice: false }];
      }
      localStorage.setItem(site123MigrationKey, "true");
      const mouseAccuracyMigrationKey = "earlyFinisherMouseAccuracyAdded";
      const hasMouseAccuracy = hydrated.some(item => item.url.trim().toLowerCase() === "https://mouseaccuracy.com/");
      if (!localStorage.getItem(mouseAccuracyMigrationKey) && !hasMouseAccuracy) {
        hydrated = [...hydrated, { ...mouseAccuracyTemplate, id: makeId(), active: true, todayChoice: false }];
      }
      localStorage.setItem(mouseAccuracyMigrationKey, "true");
      const computerSkillsCourseMigrationKey = "earlyFinisherComputerSkillsCourseAdded";
      const hasComputerSkillsCourse = hydrated.some(item => item.url.trim().toLowerCase() === "https://www.wistechopen.org/basic-computer-skills-mooc#1");
      if (!localStorage.getItem(computerSkillsCourseMigrationKey) && !hasComputerSkillsCourse) {
        hydrated = [...hydrated, { ...computerSkillsCourseTemplate, id: makeId(), active: true, todayChoice: false }];
      }
      localStorage.setItem(computerSkillsCourseMigrationKey, "true");
      this.saveLinks(hydrated);
      return hydrated;
    } catch {
      this.saveLinks(defaultLinks);
      return cloneLinks(defaultLinks);
    }
  },
  saveLinks(links) {
    localStorage.setItem(this.linksKey, JSON.stringify(links));
  },
  getPin() {
    const storedPin = localStorage.getItem(this.pinKey);
    if (!storedPin || LEGACY_DEFAULT_PINS.includes(storedPin)) {
      localStorage.setItem(this.pinKey, DEFAULT_TEACHER_PIN);
      return DEFAULT_TEACHER_PIN;
    }
    return storedPin;
  },
  setPin(pin) {
    localStorage.setItem(this.pinKey, pin);
  },
  getTheme() {
    return localStorage.getItem(this.themeKey) || "light";
  },
  setTheme(theme) {
    localStorage.setItem(this.themeKey, theme);
  },
  loadRequests() {
    const raw = localStorage.getItem(this.requestsKey);
    if (!raw) return [];
    try {
      return normalizeRequests(JSON.parse(raw));
    } catch {
      return [];
    }
  },
  saveRequests(requests) {
    localStorage.setItem(this.requestsKey, JSON.stringify(requests));
  },
  loadThreads() {
    const raw = localStorage.getItem(this.threadsKey);
    if (!raw) return [];
    try {
      return normalizeThreads(JSON.parse(raw));
    } catch {
      return [];
    }
  },
  saveThreads(threads) {
    localStorage.setItem(this.threadsKey, JSON.stringify(threads));
  },
  loadMutedStudents() {
    const raw = localStorage.getItem(this.mutedStudentsKey);
    if (!raw) return [];
    try {
      return normalizeMutedStudents(JSON.parse(raw));
    } catch {
      return [];
    }
  },
  saveMutedStudents(students) {
    localStorage.setItem(this.mutedStudentsKey, JSON.stringify(students));
  },
  loadDailyLaunch() {
    const raw = localStorage.getItem(this.dailyLaunchKey);
    if (!raw) return { ...DEFAULT_DAILY_LAUNCH };
    try {
      return normalizeDailyLaunch(JSON.parse(raw));
    } catch {
      return { ...DEFAULT_DAILY_LAUNCH };
    }
  },
  saveDailyLaunch(launch) {
    localStorage.setItem(this.dailyLaunchKey, JSON.stringify(normalizeDailyLaunch(launch)));
  },
  loadClassTimer() {
    const raw = localStorage.getItem(this.classTimerKey);
    if (!raw) return { ...DEFAULT_CLASS_TIMER };
    try {
      return normalizeClassTimer(JSON.parse(raw));
    } catch {
      return { ...DEFAULT_CLASS_TIMER };
    }
  },
  saveClassTimer(timer) {
    localStorage.setItem(this.classTimerKey, JSON.stringify(normalizeClassTimer(timer)));
  },
  loadRandomActivitySettings() {
    const raw = localStorage.getItem(this.randomActivityKey);
    if (!raw) return { ...DEFAULT_RANDOM_ACTIVITY_SETTINGS };
    try {
      return normalizeRandomActivitySettings(JSON.parse(raw));
    } catch {
      return { ...DEFAULT_RANDOM_ACTIVITY_SETTINGS };
    }
  },
  saveRandomActivitySettings(settings) {
    localStorage.setItem(this.randomActivityKey, JSON.stringify(normalizeRandomActivitySettings(settings)));
  }
};

function normalizeAssignments(items) {
  return (Array.isArray(items) ? items : []).map(item => ({
    id: String(item && item.id || ""),
    title: String(item && item.title || ""),
    instructions: String(item && item.instructions || ""),
    grades: Array.isArray(item && item.grades) ? item.grades.map(String) : [],
    dueAt: String(item && item.dueAt || ""),
    acceptedTypes: Array.isArray(item && item.acceptedTypes) ? item.acceptedTypes.map(String) : [".pdf"],
    maxFileSizeMb: Number(item && item.maxFileSizeMb) || 10,
    allowResubmissions: item && item.allowResubmissions !== false,
    attachmentOriginalName: String(item && item.attachmentOriginalName || ""),
    attachmentExtension: String(item && item.attachmentExtension || "").toLowerCase(),
    attachmentMimeType: String(item && item.attachmentMimeType || ""),
    attachmentSize: Number(item && item.attachmentSize) || 0,
    status: String(item && item.status || "draft"),
    createdAt: String(item && item.createdAt || ""),
    updatedAt: String(item && item.updatedAt || "")
  })).filter(item => item.id && item.title);
}

function normalizeSubmissions(items) {
  return (Array.isArray(items) ? items : []).map(item => ({
    id: String(item && item.id || ""),
    assignmentId: String(item && item.assignmentId || ""),
    studentEmail: String(item && item.studentEmail || ""),
    studentName: String(item && item.studentName || ""),
    grade: String(item && item.grade || ""),
    originalName: String(item && item.originalName || ""),
    submissionType: item && item.submissionType === "link" ? "link" : "file",
    projectTitle: String(item && item.projectTitle || ""),
    projectUrl: String(item && item.projectUrl || ""),
    extension: String(item && item.extension || "").toLowerCase(),
    mimeType: String(item && item.mimeType || ""),
    size: Number(item && item.size) || 0,
    note: String(item && item.note || ""),
    status: String(item && item.status || "submitted"),
    feedback: String(item && item.feedback || ""),
    submittedAt: String(item && item.submittedAt || ""),
    updatedAt: String(item && item.updatedAt || "")
  })).filter(item => item.id && item.assignmentId);
}

function normalizeClassroomPassPayload(payload) {
  const source = payload && typeof payload === "object" ? payload : {};
  const normalizePass = pass => ({
    id: String(pass && pass.id || ""),
    studentEmail: String(pass && pass.studentEmail || ""),
    studentName: String(pass && pass.studentName || ""),
    grade: String(pass && pass.grade || ""),
    destination: String(pass && pass.destination || "Other Approved Reason"),
    outAt: String(pass && pass.outAt || ""),
    returnedAt: String(pass && pass.returnedAt || ""),
    status: String(pass && pass.status || "out"),
    returnedBy: String(pass && pass.returnedBy || "")
  });
  const passes = (Array.isArray(source.passes) ? source.passes : []).map(normalizePass).filter(pass => pass.id);
  const activePass = source.activePass ? normalizePass(source.activePass) : passes.find(pass => pass.status === "out") || null;
  return {
    config: {
      enabled: !source.config || source.config.enabled !== false,
      maxActive: Math.max(1, Math.min(10, Number(source.config && source.config.maxActive) || 1)),
      updatedAt: String(source.config && source.config.updatedAt || "")
    },
    destinations: Array.isArray(source.destinations) && source.destinations.length
      ? source.destinations.map(String)
      : [...CLASSROOM_PASS_DESTINATIONS],
    activeCount: Math.max(0, Number(source.activeCount) || 0),
    activePass,
    passes,
    canStart: Boolean(source.canStart)
  };
}

let links = store.loadLinks();
let websiteRequests = store.loadRequests();
let classThreads = store.loadThreads();
let mutedStudents = store.loadMutedStudents();
let pendingModeration = [];
let moderationQueue = [];
let recentlyModerated = [];
let dailyLaunch = store.loadDailyLaunch();
let classTimer = store.loadClassTimer();
let randomActivitySettings = store.loadRandomActivitySettings();
let screen = { name: "home" };
let modal = null;
let theme = store.getTheme();
let homeNavigationCollapsed = (() => {
  try {
    return localStorage.getItem(HOME_NAVIGATION_COLLAPSED_KEY) === "true";
  } catch {
    return false;
  }
})();
let homeNavigationMobileOpen = false;
let homeNavigationActive = "home-top";
let clockTimer = null;
let classTimerClock = null;
let sharedSyncTimer = null;
let randomActivity = null;
let coltRunGame = null;
let authConfig = { studentEmailDomain: "scscolts.org", studentLoginConfigured: false, teacherConfigured: false };
let authSession = { authenticated: false, role: "guest", name: "", email: "", grade: "" };
let approvedStudents = [];
let postingBlocked = false;
let authMessage = "";
let activationCodeResults = [];
let assignments = [];
let submissions = [];
let selectedAssignmentId = "";
let selectedSubmissionId = "";
let assignmentView = "todo";
let dashboardSubmissionSearch = "";
let dashboardAssignmentFilter = "all";
let dashboardGradeFilter = "all";
let dashboardSubmissionStatus = "all";
let assignmentEditorId = "";
let replacingAssignmentId = "";
let submissionMethod = "file";
let studentPreviewObjectUrl = "";
let dashboardGradebookGrade = "4";
let dashboardGradebookAssignment = "all";
let dashboardGradebookSearch = "";
let classroomPassData = {
  config: { enabled: true, maxActive: 1, updatedAt: "" },
  destinations: [...CLASSROOM_PASS_DESTINATIONS],
  activeCount: 0,
  activePass: null,
  passes: [],
  canStart: false
};
let classroomPassDestination = "";
let classroomPassMessage = "";
let classroomPassSearch = "";
let classroomPassGradeFilter = "all";
let classroomPassDestinationFilter = "all";
let classroomPassStatusFilter = "all";
let classroomPassDateFilter = classroomPassDateKey(new Date());
let classroomPassClock = 0;
let classroomPassRefreshTimer = 0;
let approvedLinksReady = !sharedBackend.enabled;
const dashboardSections = [
  { id: "overview", label: "Overview", icon: "⌂" },
  { id: "assignments", label: "Assignments & Submissions", navLabel: "Student Work", icon: "▣" },
  { id: "gradebooks", label: "Gradebooks", icon: "▦" },
  { id: "passes", label: "Classroom Pass Log", navLabel: "Classroom Pass", icon: "→" },
  { id: "students", label: "Students & Access", icon: "♙" },
  { id: "tools", label: "Classroom Tools", icon: "◷" },
  { id: "corner", label: "Colt Corner", icon: "✦" },
  { id: "requests", label: "Launchpad Feedback", icon: "✉" },
  { id: "websites", label: "Manage Websites", icon: "▦" },
  { id: "settings", label: "Settings", icon: "⚙" }
];
let dashboardSection = sessionStorage.getItem("teacherDashboardSection") || "overview";
let dashboardStudentSearch = "";
let dashboardLinkSearch = "";
let dashboardLinkCategory = "all";
let dashboardLinkStatus = "all";
let dashboardLinkPage = 1;
const DASHBOARD_LINKS_PER_PAGE = 15;
const app = document.getElementById("app");

function isSignedIn() {
  return Boolean(authSession && authSession.authenticated);
}

function normalizeModerationItems(items) {
  return (Array.isArray(items) ? items : []).map(item => ({
    id: String(item && item.id || ""),
    type: item && item.type === "reply" ? "reply" : "topic",
    threadId: String(item && item.threadId || ""),
    studentName: String(item && item.studentName || ""),
    grade: String(item && item.grade || ""),
    title: String(item && item.title || ""),
    message: String(item && item.message || ""),
    submittedAt: String(item && item.submittedAt || ""),
    moderationStatus: String(item && item.moderationStatus || ""),
    moderationReasons: (Array.isArray(item && item.moderationReasons) ? item.moderationReasons : []).map(reason => ({
      code: String(reason && reason.code || ""),
      label: String(reason && reason.label || "")
    })),
    moderatedAt: String(item && item.moderatedAt || ""),
    moderatedBy: String(item && item.moderatedBy || "")
  })).filter(item => item.id);
}

function normalizePendingModeration(items) {
  return (Array.isArray(items) ? items : []).map(item => ({
    id: String(item && item.id || ""),
    type: item && item.type === "reply" ? "reply" : "topic",
    title: String(item && item.title || ""),
    submittedAt: String(item && item.submittedAt || "")
  })).filter(item => item.id);
}

function isTeacher() {
  return isSignedIn() && authSession.role === "teacher";
}

function isApprovedStudent() {
  return isSignedIn() && authSession.role === "student";
}

function forumRoleLabel(grade = authSession.grade) {
  const value = String(grade || "").trim();
  return value.toLowerCase() === "teacher" ? "Teacher" : `Grade ${value}`;
}

function hasSharedData() {
  return classThreads.length > 0
    || mutedStudents.length > 0
    || websiteRequests.length > 0
    || dailyLaunch.message !== DEFAULT_DAILY_LAUNCH.message
    || classTimer.status !== DEFAULT_CLASS_TIMER.status
    || classTimer.title !== DEFAULT_CLASS_TIMER.title
    || classTimer.durationSeconds !== DEFAULT_CLASS_TIMER.durationSeconds
    || randomActivitySettings.locked !== DEFAULT_RANDOM_ACTIVITY_SETTINGS.locked;
}

function isEditingForm() {
  const active = document.activeElement;
  return Boolean(active && active.closest && active.closest("form"));
}

function sharedSnapshot() {
  return JSON.stringify({
    links,
    classThreads,
    mutedStudents,
    websiteRequests,
    assignments,
    submissions,
    dailyLaunch,
    classTimer,
    randomActivitySettings,
    pendingModeration,
    moderationQueue,
    recentlyModerated
  });
}

async function loadSharedState(shouldRender = true) {
  if (!sharedBackend.enabled) return;
  const before = sharedSnapshot();
  try {
    const state = await sharedBackend.loadState();
    if (state && state.auth) authSession = state.auth;
    postingBlocked = Boolean(state && state.postingBlocked);
    const incomingThreads = normalizeThreads(state && state.threads);
    const incomingMuted = normalizeMutedStudents(state && state.mutedStudents);
    const incomingPendingModeration = normalizePendingModeration(state && state.pendingModeration);
    const incomingModerationQueue = normalizeModerationItems(state && state.moderation && state.moderation.pending);
    const incomingRecentlyModerated = normalizeModerationItems(state && state.moderation && state.moderation.recent);
    const incomingRequests = normalizeRequests(state && state.websiteRequests);
    const incomingAssignments = normalizeAssignments(state && state.assignments);
    const incomingSubmissions = normalizeSubmissions(state && state.submissions);
    const incomingLaunch = normalizeDailyLaunch((state && state.dailyLaunch) || extractDailyLaunchFromRequests(state && state.websiteRequests));
    const incomingTimer = chooseSharedClassTimer(state && state.classTimer, extractClassTimerFromRequests(state && state.websiteRequests));
    const incomingRandomActivity = chooseSharedRandomActivitySettings(state && state.randomActivity, extractRandomActivitySettingsFromRequests(state && state.websiteRequests));
    if (state && Array.isArray(state.links)) {
      links = normalizeSharedLinks(state.links);
      store.saveLinks(links);
      approvedLinksReady = true;
    } else if (state && state.links === null && isTeacher()) {
      const migrated = await sharedBackend.saveLinks(links);
      if (migrated && Array.isArray(migrated.links)) {
        links = normalizeSharedLinks(migrated.links);
        store.saveLinks(links);
        approvedLinksReady = true;
      }
    } else if (state && state.links === null) {
      approvedLinksReady = false;
    }
    classThreads = incomingThreads;
    mutedStudents = incomingMuted;
    pendingModeration = incomingPendingModeration;
    moderationQueue = incomingModerationQueue;
    recentlyModerated = incomingRecentlyModerated;
    websiteRequests = incomingRequests;
    assignments = incomingAssignments;
    submissions = incomingSubmissions;
    dailyLaunch = incomingLaunch;
    classTimer = incomingTimer;
    randomActivitySettings = incomingRandomActivity;
    if (randomActivitySettings.locked) randomActivity = null;
    store.saveThreads(classThreads);
    store.saveMutedStudents(mutedStudents);
    store.saveRequests(websiteRequests);
    store.saveDailyLaunch(dailyLaunch);
    store.saveClassTimer(classTimer);
    store.saveRandomActivitySettings(randomActivitySettings);
    if (shouldRender && before !== sharedSnapshot() && !isEditingForm()) render();
  } catch (error) {
    if (!error || error.status >= 500) sharedBackend.enabled = false;
  }
}

function startSharedSync() {
  if (!sharedBackend.enabled || sharedSyncTimer) return;
  loadSharedState(true);
  sharedSyncTimer = window.setInterval(() => loadSharedState(true), 4000);
}

function setScreen(next) {
  screen = next;
  render();
  requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
}

async function openTeacherDashboard() {
  await loadClassroomPassData(false);
  dashboardSection = "overview";
  sessionStorage.setItem("teacherDashboardSection", dashboardSection);
  setScreen({ name: "dashboard" });
}

function saveLinks(next) {
  links = normalizeSharedLinks(next);
  store.saveLinks(links);
  if (sharedBackend.enabled && isTeacher()) {
    sharedBackend.saveLinks(links).then(result => {
      if (!result || !Array.isArray(result.links)) return;
      links = normalizeSharedLinks(result.links);
      store.saveLinks(links);
      if (!isEditingForm()) render();
    }).catch(error => {
      authMessage = error.message;
      loadSharedState(true);
    });
  }
  render();
}

function saveWebsiteRequests(next, shouldRender = true) {
  websiteRequests = normalizeRequests(next);
  store.saveRequests(websiteRequests);
  if (sharedBackend.enabled) sharedBackend.saveWebsiteRequests(websiteRequests).catch(error => {
    authMessage = error.message;
    loadSharedState(true);
  });
  if (shouldRender) render();
}

function saveClassThreads(next, shouldRender = true) {
  classThreads = normalizeThreads(next);
  store.saveThreads(classThreads);
  if (sharedBackend.enabled) sharedBackend.saveThreads(classThreads).then(result => {
    if (result && result.threads) {
      classThreads = normalizeThreads(result.threads);
      store.saveThreads(classThreads);
      if (["coltCorner", "thread"].includes(screen.name)) render();
    }
  }).catch(error => {
    authMessage = error.message;
    loadSharedState(true);
  });
  if (shouldRender) render();
}

function saveDailyLaunch(next, shouldRender = true) {
  dailyLaunch = normalizeDailyLaunch(next);
  store.saveDailyLaunch(dailyLaunch);
  if (sharedBackend.enabled) {
    sharedBackend.saveDailyLaunch(dailyLaunch)
      .catch(() => sharedBackend.saveWebsiteRequests([dailyLaunchRequestMarker(dailyLaunch), classTimerRequestMarker(), randomActivityRequestMarker(), ...websiteRequests]).catch(() => {}));
  }
  if (shouldRender) render();
}

function saveClassTimer(next, shouldRender = true) {
  classTimer = normalizeClassTimer(next);
  store.saveClassTimer(classTimer);
  if (sharedBackend.enabled) {
    sharedBackend.saveClassTimer(classTimer)
      .catch(() => sharedBackend.saveWebsiteRequests([dailyLaunchRequestMarker(), classTimerRequestMarker(classTimer), randomActivityRequestMarker(), ...websiteRequests]).catch(() => {}));
  }
  if (shouldRender) render();
}

function saveRandomActivitySettings(next, shouldRender = true) {
  randomActivitySettings = normalizeRandomActivitySettings(next);
  if (randomActivitySettings.locked) randomActivity = null;
  store.saveRandomActivitySettings(randomActivitySettings);
  if (sharedBackend.enabled) {
    sharedBackend.saveRandomActivitySettings(randomActivitySettings)
      .catch(() => sharedBackend.saveWebsiteRequests([dailyLaunchRequestMarker(), classTimerRequestMarker(), randomActivityRequestMarker(randomActivitySettings), ...websiteRequests]).catch(() => {}));
  }
  if (shouldRender) render();
}

function saveMutedStudents(next, shouldRender = true) {
  mutedStudents = normalizeMutedStudents(next);
  store.saveMutedStudents(mutedStudents);
  if (sharedBackend.enabled) sharedBackend.saveMutedStudents(mutedStudents).catch(() => {});
  if (shouldRender) render();
}

function updateLink(id, changes) {
  saveLinks(links.map(link => link.id === id ? { ...link, ...changes } : link));
}

function toggleTheme() {
  theme = theme === "night" ? "light" : "night";
  store.setTheme(theme);
  render();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getClassTimerRemaining(timer = classTimer) {
  const normalized = normalizeClassTimer(timer);
  if (normalized.status === "running" && normalized.endAt) {
    return Math.max(0, Math.ceil((new Date(normalized.endAt).getTime() - Date.now()) / 1000));
  }
  if (normalized.status === "ended") return 0;
  return Math.max(0, Number(normalized.remainingSeconds) || 0);
}

function formatTimerSeconds(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

function classTimerStatusText(timer = classTimer) {
  const normalized = normalizeClassTimer(timer);
  const remaining = getClassTimerRemaining(normalized);
  if (normalized.status === "idle") return "No timer is showing.";
  if (normalized.status === "ended" || remaining <= 0) return "Time is up.";
  if (normalized.status === "paused") return `${formatTimerSeconds(remaining)} paused.`;
  return `${formatTimerSeconds(remaining)} remaining.`;
}

function renderClassTimerBadge() {
  const normalized = normalizeClassTimer(classTimer);
  if (normalized.status === "idle") return "";
  const remaining = getClassTimerRemaining(normalized);
  const ended = normalized.status === "ended" || remaining <= 0;
  return `
    <section class="class-timer-badge ${ended ? "is-ended" : ""}" aria-label="Class timer">
      <span>${escapeHtml(normalized.title)}</span>
      <strong id="classTimerDisplay">${escapeHtml(ended ? "Time is up" : formatTimerSeconds(remaining))}</strong>
    </section>
  `;
}

function getActiveLinks() {
  return links.filter(link => link.active);
}

function pickRandomActivity() {
  const available = getActiveLinks();
  if (!available.length) return null;
  return available[Math.floor(Math.random() * available.length)];
}

function sanitizeLaunchHtml(value) {
  const raw = String(value || "");
  const template = document.createElement("template");
  template.innerHTML = raw.includes("<") ? raw : escapeHtml(raw).replace(/\n/g, "<br>");
  const allowed = new Set(["B", "STRONG", "I", "EM", "U", "UL", "OL", "LI", "BR", "DIV", "P", "SPAN", "FONT"]);
  const allowedStyles = new Set(["color", "background-color", "font-family", "font-size", "text-align"]);
  const safeCssValue = value => /^[#(),.%\w\s-]+$/.test(value);
  const cleanStyle = node => {
    const pieces = [];
    const style = node.getAttribute("style") || "";
    style.split(";").forEach(part => {
      const [rawName, ...rawValue] = part.split(":");
      const name = (rawName || "").trim().toLowerCase();
      const cssValue = rawValue.join(":").trim();
      if (allowedStyles.has(name) && cssValue && safeCssValue(cssValue)) pieces.push(`${name}: ${cssValue}`);
    });
    if (node.tagName === "FONT") {
      const color = node.getAttribute("color");
      const face = node.getAttribute("face");
      const size = node.getAttribute("size");
      const sizeMap = { "2": "12px", "3": "14px", "4": "16px", "5": "18px", "6": "24px" };
      if (color && safeCssValue(color)) pieces.push(`color: ${color}`);
      if (face && safeCssValue(face)) pieces.push(`font-family: ${face}`);
      if (sizeMap[size]) pieces.push(`font-size: ${sizeMap[size]}`);
    }
    const align = node.getAttribute("align");
    if (["left", "center", "right"].includes(align)) pieces.push(`text-align: ${align}`);
    return pieces.length ? ` style="${escapeHtml(pieces.join("; "))}"` : "";
  };
  const cleanNode = node => {
    if (node.nodeType === Node.TEXT_NODE) return escapeHtml(node.textContent);
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    if (!allowed.has(node.tagName)) return Array.from(node.childNodes).map(cleanNode).join("");
    if (node.tagName === "BR") return "<br>";
    const tag = { STRONG: "b", EM: "i", DIV: "p", FONT: "span" }[node.tagName] || node.tagName.toLowerCase();
    const inner = Array.from(node.childNodes).map(cleanNode).join("");
    if (!inner.trim() && !["ul", "ol"].includes(tag)) return "";
    const style = ["span", "p", "li"].includes(tag) ? cleanStyle(node) : "";
    return `<${tag}${style}>${inner}</${tag}>`;
  };
  const cleaned = Array.from(template.content.childNodes).map(cleanNode).join("").trim();
  return cleaned || escapeHtml(DEFAULT_DAILY_LAUNCH.message);
}

function getLaunchPlainText(html) {
  const box = document.createElement("div");
  box.innerHTML = sanitizeLaunchHtml(html);
  return box.textContent.trim();
}

function runEditorCommand(command, value = null) {
  document.execCommand(command, false, value);
  if (command === "hiliteColor") document.execCommand("backColor", false, value);
}

function saveEditorSelection(editor) {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return null;
  const range = selection.getRangeAt(0);
  if (!editor.contains(range.commonAncestorContainer)) return null;
  return range.cloneRange();
}

function restoreEditorSelection(editor, range) {
  if (!range) return;
  editor.focus();
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function applyEditorInlineStyle(editor, range, styles) {
  restoreEditorSelection(editor, range);
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return null;
  const activeRange = selection.getRangeAt(0);
  if (!editor.contains(activeRange.commonAncestorContainer) || activeRange.collapsed) return saveEditorSelection(editor);

  const span = document.createElement("span");
  Object.entries(styles).forEach(([property, value]) => {
    span.style[property] = value;
  });
  span.appendChild(activeRange.extractContents());
  activeRange.insertNode(span);

  const nextRange = document.createRange();
  nextRange.selectNodeContents(span);
  selection.removeAllRanges();
  selection.addRange(nextRange);
  editor.focus();
  return nextRange.cloneRange();
}

function normalizeStudentName(name) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function isStudentMuted(name) {
  const normalized = normalizeStudentName(name);
  return mutedStudents.some(student => student.normalized === normalized);
}

function formatShortDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function getThreadReplies(thread) {
  return Array.isArray(thread.replies) ? thread.replies : [];
}

function getThreadLastPost(thread) {
  const replies = getThreadReplies(thread);
  return replies.length ? replies[replies.length - 1] : thread;
}

function sortedThreads() {
  return [...classThreads].sort((a, b) => {
    const aDate = new Date(getThreadLastPost(a).createdAt || a.createdAt).getTime();
    const bDate = new Date(getThreadLastPost(b).createdAt || b.createdAt).getTime();
    return bDate - aDate;
  });
}

function pageHeader(title, subtitle = "", back = false, trailing = "") {
  const fallbackTrailing = `<div class="header-actions">
    <button class="mode-btn" title="Switch color mode" data-action="toggleTheme">${theme === "night" ? "Light" : "Night"}</button>
  </div>`;
  return `
    <div class="topbar">
      <div class="title-group">
        ${back ? `<button class="back-btn" data-action="back"> Back</button>` : ""}
        ${!back && title === "Classroom Launchpad" ? `<span class="school-logo-frame"><video class="school-logo" autoplay muted loop playsinline aria-label="St. Cletus Catholic School animated logo"><source data-src="assets/st-cletus-logo.mp4?v=20260702" type="video/mp4"></video></span>` : ""}
        ${!back && title === "Classroom Launchpad" ? `<p class="teacher-name">MR. NIEVES' COMPUTER CLASS</p>` : ""}
        <h1>${escapeHtml(title)}</h1>
        ${subtitle ? `<p class="subtitle">${escapeHtml(subtitle)}</p>` : ""}
      </div>
      ${trailing || fallbackTrailing}
    </div>
  `;
}

function formatClassroomPassTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatClassroomPassDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function classroomPassDateKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function classroomPassDuration(start, end = Date.now()) {
  const startTime = Date.parse(start);
  const endTime = typeof end === "number" ? end : Date.parse(end);
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) return "—";
  const totalSeconds = Math.max(0, Math.floor((endTime - startTime) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours
    ? `${hours}h ${String(minutes).padStart(2, "0")}m`
    : `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function renderAuthButton() {
  if (isSignedIn()) {
    const fullName = String(authSession.name || "Student").trim();
    const firstName = fullName.split(/\s+/)[0] || "Student";
    const studentLabel = String(authSession.email || "").toLowerCase() === "tiger101786@gmail.com"
      ? "Test Account"
      : fullName.length <= 11
        ? fullName
        : firstName.length <= 10
          ? firstName
          : "Student";
    return `
      <button class="login-btn signed-in" data-action="${isTeacher() ? "teacherDashboard" : "account"}" title="${escapeHtml(authSession.email || authSession.name)}">
        ${escapeHtml(isTeacher() ? "Teacher" : studentLabel)}
      </button>
      <button class="logout-btn" data-action="logout">Log Out</button>
    `;
  }
  return `<button class="login-btn" data-action="login">Student Login</button>`;
}

function categoryTopbar() {
  return `
    <div class="topbar category-topbar">
      <button class="back-btn" data-action="back"> Back</button>
      <div class="header-actions">
        <button class="mode-btn" title="Switch color mode" data-action="toggleTheme">${theme === "night" ? "Light" : "Night"}</button>
      </div>
    </div>
  `;
}

function renderHomeNavigation() {
  return `
    <button class="home-nav-mobile-trigger" type="button" data-action="toggleHomeNavigation" aria-controls="homeQuickNavigation" aria-expanded="${homeNavigationMobileOpen ? "true" : "false"}">
      <span aria-hidden="true">&#9776;</span><strong>Quick Navigation</strong>
    </button>
    <aside id="homeQuickNavigation" class="home-quick-navigation" aria-label="Homepage quick navigation">
      <header class="home-quick-navigation-header">
        <strong>Quick Navigation</strong>
        <button class="home-nav-collapse" type="button" data-action="toggleHomeNavigationCollapse" aria-label="${homeNavigationCollapsed ? "Expand quick navigation" : "Collapse quick navigation"}" aria-expanded="${homeNavigationCollapsed ? "false" : "true"}">
          <span aria-hidden="true">${homeNavigationCollapsed ? "&#8250;&#8250;" : "&#8249;&#8249;"}</span>
        </button>
        <button class="home-nav-close" type="button" data-action="closeHomeNavigation" aria-label="Close quick navigation">&#10005;</button>
      </header>
      <nav class="home-navigation-list">
        ${HOME_NAVIGATION_ITEMS.map(item => `
          <button class="home-navigation-button ${homeNavigationActive === item.id ? "is-active" : ""}" type="button" data-action="homeNavigate" data-target="${item.id}" title="${escapeHtml(item.label)}" ${homeNavigationActive === item.id ? 'aria-current="location"' : ""}>
            <span class="home-navigation-icon" aria-hidden="true">${item.icon}</span>
            <span class="home-navigation-label">${escapeHtml(item.label)}</span>
          </button>
        `).join("")}
      </nav>
      <button class="home-navigation-button home-navigation-top" type="button" data-action="homeNavigate" data-target="home-top" title="Back to Top">
        <span class="home-navigation-icon" aria-hidden="true">&#8593;</span>
        <span class="home-navigation-label">Back to Top</span>
      </button>
    </aside>
    <button class="home-navigation-backdrop" type="button" data-action="closeHomeNavigation" aria-label="Close quick navigation"></button>
  `;
}

function renderHome() {
  return `
    <div class="home-layout ${homeNavigationCollapsed ? "is-nav-collapsed" : ""} ${homeNavigationMobileOpen ? "is-mobile-nav-open" : ""}">
    ${renderHomeNavigation()}
    <div class="home-page-content">
    <section id="home-top" class="hero-panel home-navigation-anchor">
      <video class="hero-bg-video" autoplay muted loop playsinline aria-hidden="true">
        <source data-src="assets/hero-panel-bg.mp4" type="video/mp4">
      </video>
      <video class="hero-colt-mobile-video" autoplay muted loop playsinline aria-hidden="true">
        <source data-src="assets/hero-panel-bg-mobile.mp4?v=20260710-mobile-bg2" type="video/mp4">
      </video>
      ${pageHeader(
        "Classroom Launchpad",
        "Choose a teacher-approved activity or resource below.",
        false,
        `<div class="header-actions">
          <button class="portal-btn" data-action="open" data-url="https://www.plusportals.com/StCletus">PlusPortal</button>
          ${renderAuthButton()}
          <button class="mode-btn" title="Switch color mode" data-action="toggleTheme">${theme === "night" ? "Light" : "Night"}</button>
          <button class="icon-btn" title="Teacher Mode" data-action="teacher">⚙</button>
        </div>`
      )}
      <section class="home-feature${homeProfileVideo.endsWith("home-profile-12.mp4") ? " home-feature--detail" : ""}">
        <div class="search-wrap">
          <input id="studentSearch" type="search" placeholder="Search approved links" autocomplete="off">
        </div>
        <video class="school-photo" autoplay muted loop playsinline aria-label="Rotating St. Cletus Colts profile animation">
          <source data-src="${homeProfileVideo}?v=20260802-profile-rotation12-clean-detail" type="video/mp4">
        </video>
      </section>
    </section>
    <section id="homeBody">
      ${renderHomeDefault()}
    </section>
    </div>
    </div>
  `;
}

function renderHomeDefault() {
  return `
    <section id="home-launch" class="launch-row home-navigation-anchor" aria-label="Launch tools">
      <section class="daily-launch-card" aria-label="Today's Launch">
        <video class="daily-launch-bg-video" autoplay muted loop playsinline aria-hidden="true">
          <source data-src="assets/daily-launch-bg.mp4" type="video/mp4">
        </video>
        <div class="daily-launch-icon" aria-hidden="true">✓</div>
        <div class="daily-launch-copy">
          <span class="feature-kicker">Start Here</span>
          <h2>Today's Launch</h2>
          <div class="daily-launch-message">${sanitizeLaunchHtml(dailyLaunch.message)}</div>
        </div>
      </section>
      ${renderRandomActivityCard()}
    </section>
    <section id="home-expectations" class="rules-card home-navigation-anchor">
      <div class="expectations-copy">
        <div>
          <h3>Classroom Launchpad Expectations:</h3>
          <ol>
            ${CLASSROOM_EXPECTATIONS.map(rule => `<li>${escapeHtml(rule)}</li>`).join("")}
          </ol>
        </div>
        <figure class="expectations-colt">
          <video autoplay muted loop playsinline aria-label="Animated Colts horse graphic">
            <source data-src="assets/expectations-colt.mp4" type="video/mp4">
          </video>
        </figure>
        <section class="calendar-card" aria-label="Current date and time">
          <span id="calendarDay" class="calendar-day">Today</span>
          <span id="calendarDate" class="calendar-date"></span>
          <span id="calendarTime" class="calendar-time"></span>
        </section>
      </div>
    </section>
    <div id="home-categories" class="home-navigation-anchor">
      <h2 class="section-title">Website Categories</h2>
      <section class="category-grid">
        ${categories.map(category => categoryCard(category)).join("")}
      </section>
    </div>
    <div id="home-assignments" class="home-navigation-anchor">${renderAssignmentsPreview()}</div>
    <div id="home-classroom-pass" class="home-navigation-anchor">${renderClassroomPassPreview()}</div>
    <div id="home-colt-corner" class="home-navigation-anchor">${renderColtCornerPreview()}</div>
    <div id="home-feedback" class="home-navigation-anchor">${renderStudentWebsiteRequest()}</div>
  `;
}

function renderRandomActivityCard() {
  const locked = randomActivitySettings.locked;
  const selected = randomActivity && links.some(link => link.id === randomActivity.id && link.active) ? randomActivity : null;
  const selectedIsColtRun = selected && selected.url === COLT_RUN_URL;
  return `
    <section id="randomActivityCard" class="random-activity-card ${locked ? "is-locked" : ""}" aria-label="Random Activity">
      <video class="random-activity-bg-video" autoplay muted loop playsinline aria-hidden="true">
        <source data-src="assets/random-activity-bg.mp4" type="video/mp4">
      </video>
      <span class="feature-kicker">Student Choice</span>
      <h2>Random Activity</h2>
      <p>${locked ? "Currently Locked" : selected ? "Here is an approved activity to try." : "Need help choosing? Let the launchpad pick an approved site."}</p>
      ${locked ? `
        <article class="random-activity-result random-activity-locked">
          <h3>Locked</h3>
          <span>Teacher Controlled</span>
          <p>Please read the Today's Launch section.</p>
        </article>
      ` : selected ? `
        <article class="random-activity-result">
          <h3>${escapeHtml(selected.title)}</h3>
          <span>${escapeHtml(selected.category)}</span>
          <p>${escapeHtml(selected.instruction)}</p>
        </article>
      ` : ""}
      <div class="random-activity-actions">
        <button class="primary-btn" data-action="randomActivity" ${locked ? "disabled" : ""}>${locked ? "Locked" : selected ? "Pick Again" : "Pick Activity"}</button>
        ${selected && !locked ? `<button class="outline-btn" data-action="${selectedIsColtRun ? "openColtRun" : "open"}" ${selectedIsColtRun ? "" : `data-url="${escapeHtml(selected.url)}"`}>${selectedIsColtRun ? "Play Game" : "Open Site"}</button>` : ""}
      </div>
    </section>
  `;
}

function renderColtCornerPreview() {
  if (!isSignedIn()) {
    return `
      <section class="colt-corner-preview colt-corner-locked">
        <div class="colt-corner-heading">
          <span class="feature-kicker">Protected Class Forum</span>
          <h2>Colt Corner</h2>
          <p>Only approved students and the teacher can view or use the class message board.</p>
          <button class="primary-btn colt-corner-open" data-action="login">Sign In to Colt Corner</button>
        </div>
        <div class="forum-lock" aria-hidden="true">🔒</div>
      </section>
    `;
  }
  const topicCount = classThreads.length;
  const replyCount = classThreads.reduce((total, thread) => total + getThreadReplies(thread).length, 0);
  return `
    <section class="colt-corner-preview">
      <div class="colt-corner-heading">
        <span class="feature-kicker">Class Forum</span>
        <h2>Colt Corner</h2>
        <p>Open the class message board to start topics, ask questions, and reply to classmates.</p>
        <div class="colt-corner-stats">
          <span>${escapeHtml(`${topicCount} ${topicCount === 1 ? "Topic" : "Topics"}`)}</span>
          <span>${escapeHtml(`${replyCount} ${replyCount === 1 ? "Reply" : "Replies"}`)}</span>
        </div>
        <button class="primary-btn colt-corner-open" data-action="openColtCorner">Open Colt Corner</button>
        <figure class="colt-corner-banner">
          <video autoplay muted loop playsinline aria-label="Animated Join the Herd Colt Corner banner">
            <source data-src="assets/colt-corner-join-herd.mp4" type="video/mp4">
          </video>
        </figure>
      </div>
      <figure class="colt-corner-graphic">
        <video autoplay muted loop playsinline aria-label="Animated Colt Corner message board logo">
          <source data-src="assets/colt-corner-message-board.mp4" type="video/mp4">
        </video>
      </figure>
    </section>
  `;
}

function renderStudentWebsiteRequest() {
  if (!isSignedIn()) {
    return `
      <section class="student-request-card protected-feature-card">
        <div class="request-heading">
          <span class="feature-kicker">Protected Student Feature</span>
          <h2>Suggest or Report Something</h2>
          <p>Send Mr. Nieves a website suggestion, feature idea, or report a bug or glitch in Classroom Launchpad.</p>
        </div>
        <button class="primary-btn" data-action="login">Student Login</button>
      </section>
    `;
  }
  return `
    <section class="student-request-card student-request-entry-card">
      <div class="request-heading">
        <span class="feature-kicker">Launchpad Feedback</span>
        <h2>Suggest or Report Something</h2>
        <p>Send Mr. Nieves a website suggestion, feature idea, or report a bug or glitch in Classroom Launchpad.</p>
      </div>
      <figure class="request-spirit">
        <video autoplay muted loop playsinline aria-label="Animated Colts school spirit graphic">
          <source data-src="assets/request-spirit.mp4?v=20260730-website-request-art1" type="video/mp4">
        </video>
      </figure>
      <form id="studentRequestForm" class="student-request-form">
        <div class="field">
          <label>Your name</label>
          <input value="${escapeHtml(authSession.name)}" readonly>
        </div>
        <div class="field">
          <label for="requestGrade">Grade</label>
          <input id="requestGrade" autocomplete="off" placeholder="Your grade">
        </div>
        <div class="field request-feedback-type">
          <label for="requestFeedbackType">Type of feedback</label>
          <select id="requestFeedbackType" required>
            <option value="" selected disabled>Choose a feedback type</option>
            ${LAUNCHPAD_FEEDBACK_TYPES.map(type => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join("")}
          </select>
        </div>
        <div class="field request-message-field">
          <label for="requestWebsiteName">Website, feature, or issue</label>
          <input id="requestWebsiteName" autocomplete="off" placeholder="Example: a new website, calculator, broken link, bug, or display problem">
        </div>
        <button class="primary-btn" type="submit">Submit Feedback</button>
        <p id="studentRequestMessage" class="request-message" aria-live="polite"></p>
      </form>
    </section>
  `;
}

function renderColtCorner() {
  if (!isSignedIn()) {
    return `
      <section class="auth-card">
        <span class="feature-kicker">Protected Class Forum</span>
        <h2>Sign in to open Colt Corner</h2>
        <p>The message board is available only to approved students and the teacher.</p>
        <button class="primary-btn" data-action="login">Student Login</button>
      </section>
    `;
  }
  const visibleThreads = sortedThreads();
  return `
    <section class="colt-corner-card">
      <div class="colt-corner-heading">
        <span class="feature-kicker">Class Forum</span>
        <h2>Colt Corner</h2>
        <p>Start a teacher-approved topic, ask a question, or respond respectfully to a classmate.</p>
        <section class="forum-rules-card" aria-label="Colt Corner forum rules">
          <h3>Forum Rules</h3>
          <ol>
            <li>Be respectful and kind.</li>
            <li>Keep every message school appropriate.</li>
            <li>School-related topics only.</li>
            <li>Never share personal information.</li>
            <li>Do not post outside links or usernames.</li>
            <li>No bullying, threats, spam, or repeated posts.</li>
          </ol>
          <p class="forum-moderation-note">
            Colt Corner checks messages for safety. Some messages may be held for Mr. Nieves to review before appearing.
          </p>
        </section>
      </div>
      <form id="threadForm" class="thread-form">
        <div class="field">
          <label>Name</label>
          <input value="${escapeHtml(authSession.name)}" readonly>
        </div>
        <div class="field">
          <label>Grade</label>
          <input value="${escapeHtml(isTeacher() ? "Teacher" : authSession.grade)}" readonly>
        </div>
        <div class="field">
          <label for="threadTitle">Topic title</label>
          <input id="threadTitle" autocomplete="off" maxlength="80" placeholder="What should the topic be called?">
        </div>
        <div class="field">
          <label for="threadBody">First post</label>
          <textarea id="threadBody" maxlength="360" placeholder="Start the conversation with a school-appropriate question or idea"></textarea>
        </div>
        <button class="primary-btn" type="submit">Start Topic</button>
        ${!isTeacher() && pendingModeration.length ? `
          <p class="colt-corner-pending-note" role="status">
            ${pendingModeration.length} ${pendingModeration.length === 1 ? "message is" : "messages are"} waiting for Mr. Nieves to review.
          </p>
        ` : ""}
        <p id="threadStatus" class="request-message colt-assistant-moderation-feedback" aria-live="assertive"></p>
      </form>
      <figure class="colt-corner-banner thread-form-banner">
        <video autoplay muted loop playsinline aria-label="Animated Join the Herd Colt Corner banner">
          <source data-src="assets/colt-corner-join-herd.mp4" type="video/mp4">
        </video>
      </figure>
      ${renderThreadTable(visibleThreads)}
    </section>
  `;
}

function renderColtCornerPage() {
  return `
    ${pageHeader("Colt Corner", "Start topics and reply to classmates.", true)}
    ${renderColtCorner()}
  `;
}

function renderThreadTable(threads) {
  return `
    <section class="thread-list" aria-label="Colt Corner topics">
      <div class="thread-row thread-head">
        <span>Topic</span>
        <span>Started By</span>
        <span>Replies</span>
        <span>Last Post</span>
      </div>
      ${threads.length ? threads.map(renderThreadRow).join("") : emptyCard("No topics yet. Start Colt Corner with the first one.")}
    </section>
  `;
}

function renderThreadRow(thread) {
  const lastPost = getThreadLastPost(thread);
  const replyCount = getThreadReplies(thread).length;
  const lastDate = formatShortDate(lastPost.createdAt || thread.createdAt);
  return `
    <button class="thread-row" data-action="openThread" data-id="${thread.id}">
      <span class="thread-topic">${escapeHtml(thread.title)}</span>
      <span>${escapeHtml(thread.studentName)}<small>${escapeHtml(forumRoleLabel(thread.grade))}</small></span>
      <span class="thread-replies">${replyCount}</span>
      <span>${lastDate ? escapeHtml(lastDate) : "New"}<small>${escapeHtml(lastPost.studentName || thread.studentName)}</small></span>
    </button>
  `;
}

function renderThreadDetail(threadId) {
  if (!isSignedIn()) {
    return `
      ${pageHeader("Colt Corner", "Approved student login required", true)}
      ${renderColtCorner()}
    `;
  }
  const thread = classThreads.find(item => item.id === threadId);
  if (!thread) {
    return `
      ${pageHeader("Colt Corner", "Topic not found", true)}
      ${emptyCard("That topic could not be found.")}
    `;
  }
  const replies = getThreadReplies(thread);
  return `
    ${pageHeader("Colt Corner", thread.title, true)}
    <section class="thread-detail-card">
      <article class="thread-starter">
        <span class="feature-kicker">Topic Starter</span>
        <h2>${escapeHtml(thread.title)}</h2>
        <p>${escapeHtml(thread.body)}</p>
        <p class="meta">${escapeHtml(thread.studentName)} • ${escapeHtml(forumRoleLabel(thread.grade))}${formatShortDate(thread.createdAt) ? ` • ${escapeHtml(formatShortDate(thread.createdAt))}` : ""}</p>
      </article>
      <section class="thread-reply-list" aria-label="Thread replies">
        <h3>${escapeHtml(`${replies.length} ${replies.length === 1 ? "Reply" : "Replies"}`)}</h3>
        ${replies.length ? replies.map(renderThreadReply).join("") : emptyCard("No replies yet. Ask the first question or add a helpful response.")}
      </section>
      <form id="replyForm" class="reply-form" data-thread-id="${thread.id}">
        <div class="field">
          <label>Name</label>
          <input value="${escapeHtml(authSession.name)}" readonly>
        </div>
        <div class="field">
          <label>Grade</label>
          <input value="${escapeHtml(isTeacher() ? "Teacher" : authSession.grade)}" readonly>
        </div>
        <div class="field">
          <label for="replyMessage">Reply</label>
          <textarea id="replyMessage" maxlength="320" placeholder="Write a respectful question or response"></textarea>
        </div>
        <button class="primary-btn" type="submit">Post Reply</button>
        ${!isTeacher() && pendingModeration.length ? `
          <p class="colt-corner-pending-note" role="status">
            ${pendingModeration.length} ${pendingModeration.length === 1 ? "message is" : "messages are"} waiting for Mr. Nieves to review.
          </p>
        ` : ""}
        <p id="replyStatus" class="request-message colt-assistant-moderation-feedback" aria-live="assertive"></p>
      </form>
    </section>
  `;
}

function renderThreadReply(reply) {
  const submitted = formatShortDate(reply.createdAt);
  return `
    <article class="thread-reply-post">
      <p>${escapeHtml(reply.message)}</p>
      <p class="meta">${escapeHtml(reply.studentName)} • ${escapeHtml(forumRoleLabel(reply.grade))}${submitted ? ` • ${escapeHtml(submitted)}` : ""}</p>
    </article>
  `;
}

function categoryCard(category) {
  const count = links.filter(link => link.active && link.category === category).length;
  return `
    <button class="category-card" data-action="category" data-category="${escapeHtml(category)}">
      <video class="category-card-bg" autoplay muted loop playsinline aria-hidden="true">
        <source data-src="assets/category-pane-bg.mp4" type="video/mp4">
      </video>
      <span class="card-icon">${categoryIcons[category] || "•"}</span>
      <span class="category-copy">
        <span class="category-title">${escapeHtml(category)}</span>
        <span class="category-count">${escapeHtml(`${count} links`)}</span>
      </span>
      <span class="card-arrow">›</span>
    </button>
  `;
}

function renderSearchResults(query) {
  const term = query.trim().toLowerCase();
  const results = links.filter(link => link.active && [link.title, link.instruction, link.category].some(value => value.toLowerCase().includes(term)));
  return `
    <h2 class="section-title">Search Results</h2>
    <section class="link-list">
      ${results.length ? results.map(renderStudentLink).join("") : emptyCard("No approved links match your search.")}
    </section>
  `;
}

function renderCategory(category) {
  const visibleLinks = links.filter(link => link.active && link.category === category);
  const sectionColtsLogo = category === "Creative Projects" ? "assets/creative-projects-colts-logo.mp4" : "assets/section-colts-logo.mp4";

  return `
    ${categoryTopbar()}
    ${category === "Typing Practice" ? renderTypingFeature() : ""}
    ${category === "Social Studies & Science" ? renderSocialScienceFeature() : ""}
    ${category === "Computer Skills" ? renderComputerSkillsFeature() : ""}
    ${category === "Review Games" ? renderReviewGamesFeature() : ""}
    ${category === "Logic Games" ? renderLogicGamesFeature() : ""}
    ${category === "Creative Projects" ? renderCreativeProjectsFeature() : ""}
    ${category === "Class Videos" ? renderClassVideosFeature() : ""}
    <section class="category-content">
      <section class="link-list">
        ${visibleLinks.length ? visibleLinks.map(renderStudentLink).join("") : emptyCard("No active links are available in this category.")}
      </section>
      <aside class="section-colts-art ${category === "Creative Projects" ? "creative-projects-colts-art" : ""}" aria-label="St. Cletus Colts graphic">
        <video autoplay muted loop playsinline aria-label="Animated St. Cletus Colts logo">
          <source data-src="${sectionColtsLogo}" type="video/mp4">
        </video>
      </aside>
    </section>
  `;
}

function renderTypingFeature() {
  return `
    <section class="category-feature typing-feature">
      <div class="feature-copy">
        <span class="feature-kicker">Keyboard Lab</span>
        <h2>Typing Practice</h2>
        <p>Accuracy • Speed • Focus</p>
      </div>
      <video class="feature-media" autoplay muted loop playsinline aria-label="Typing practice animation">
        <source data-src="assets/typing-practice-feature.mp4" type="video/mp4">
      </video>
      <figure class="typing-keyboard-art">
        <video autoplay muted loop playsinline aria-label="Illuminated keyboard animation">
          <source data-src="assets/typing-keyboard-art.mp4" type="video/mp4">
        </video>
      </figure>
    </section>
  `;
}

function renderSocialScienceFeature() {
  return `
    <section class="category-feature social-science-feature">
      <video class="feature-bg-video" autoplay muted loop playsinline aria-hidden="true">
        <source data-src="assets/social-studies-science-background.mp4" type="video/mp4">
      </video>
      <div class="feature-copy">
        <span class="feature-kicker">Explore Lab</span>
        <h2>Social Studies & Science</h2>
        <p>Maps • Nature • Discovery</p>
      </div>
      <video class="feature-media" autoplay muted loop playsinline aria-label="Social studies and science animation">
        <source data-src="assets/social-studies-science-feature.mp4" type="video/mp4">
      </video>
    </section>
  `;
}

function renderComputerSkillsFeature() {
  return `
    <section class="category-feature computer-skills-feature">
      <video class="feature-bg-video" autoplay muted loop playsinline aria-hidden="true">
        <source data-src="assets/computer-skills-background.mp4" type="video/mp4">
      </video>
      <div class="feature-copy">
        <span class="feature-kicker">Tech Lab</span>
        <h2>Computer Skills</h2>
        <p>Safety • Design • Digital Tools</p>
      </div>
      <video class="feature-media" autoplay muted loop playsinline aria-label="Computer skills animation">
        <source data-src="assets/computer-skills-feature.mp4" type="video/mp4">
      </video>
    </section>
  `;
}

function renderReviewGamesFeature() {
  return `
    <section class="category-feature review-games-feature">
      <video class="feature-bg-video" autoplay muted loop playsinline aria-hidden="true">
        <source data-src="assets/review-games-background.mp4" type="video/mp4">
      </video>
      <div class="feature-copy">
        <span class="feature-kicker">Game Lab</span>
        <h2>Review Games</h2>
        <p>Practice • Recall • Challenge</p>
      </div>
      <video class="feature-media" autoplay muted loop playsinline aria-label="Review games animation">
        <source data-src="assets/review-games-feature.mp4" type="video/mp4">
      </video>
    </section>
  `;
}

function renderLogicGamesFeature() {
  return `
    <section class="category-feature logic-games-feature">
      <video class="feature-bg-video" autoplay muted loop playsinline aria-hidden="true">
        <source data-src="assets/logic-games-background.mp4" type="video/mp4">
      </video>
      <div class="feature-copy">
        <span class="feature-kicker">Logic Lab</span>
        <h2>Logic Games</h2>
        <p>Puzzles • Strategy • Problem Solving</p>
      </div>
      <video class="feature-media" autoplay muted loop playsinline aria-label="Logic games animation">
        <source data-src="assets/logic-games-feature.mp4" type="video/mp4">
      </video>
    </section>
  `;
}

function renderCreativeProjectsFeature() {
  return `
    <section class="category-feature creative-projects-feature">
      <video class="feature-bg-video" autoplay muted loop playsinline aria-hidden="true">
        <source data-src="assets/creative-projects-background.mp4" type="video/mp4">
      </video>
      <div class="feature-copy">
        <span class="feature-kicker">Creation Studio</span>
        <h2>Creative Projects</h2>
        <p>Design • Build • Share</p>
      </div>
      <video class="feature-media" autoplay muted loop playsinline aria-label="Creative projects animation">
        <source data-src="assets/creative-projects-feature.mp4" type="video/mp4">
      </video>
    </section>
  `;
}

function renderClassVideosFeature() {
  return `
    <section class="category-feature class-videos-feature">
      <video class="feature-bg-video" autoplay muted loop playsinline aria-hidden="true">
        <source data-src="assets/class-videos-background.mp4" type="video/mp4">
      </video>
      <div class="feature-copy">
        <span class="feature-kicker">Video Library</span>
        <h2>Class Videos</h2>
        <p>Watch • Learn • Reflect</p>
      </div>
      <video class="feature-media" autoplay muted loop playsinline aria-label="Class videos animation">
        <source data-src="assets/class-videos-feature.mp4" type="video/mp4">
      </video>
    </section>
  `;
}

function renderStudentLink(link) {
  const isColtRun = link.url === COLT_RUN_URL;
  return `
    <article class="link-card">
      <h3>${escapeHtml(link.title)}</h3>
      <p class="instruction">${escapeHtml(link.instruction)}</p>
      <p class="meta">${escapeHtml(link.category)}</p>
      <div class="actions">
        <button class="primary-btn" data-action="${isColtRun ? "openColtRun" : "open"}" ${isColtRun ? "" : `data-url="${escapeHtml(link.url)}"`}>${isColtRun ? "▶ Play Game" : "↗ Open Site"}</button>
      </div>
    </article>
  `;
}

function emptyCard(message) {
  return `<div class="empty-card"><p>${escapeHtml(message)}</p></div>`;
}

function renderColtRun() {
  return `
    ${categoryTopbar()}
    <section class="colt-run-shell" aria-label="Colt Run game">
      <div class="colt-run-topline">
        <div>
          <span class="feature-kicker">Logic Games</span>
          <h2>Colt Run</h2>
          <p>Reach the finish flag before time runs out.</p>
          <div class="colt-run-difficulty" role="group" aria-label="Difficulty">
            <button type="button" data-colt-run="difficulty" data-difficulty="easy">Easy</button>
            <button type="button" data-colt-run="difficulty" data-difficulty="medium">Medium</button>
            <button type="button" data-colt-run="difficulty" data-difficulty="hard">Hard</button>
            <button type="button" data-colt-run="difficulty" data-difficulty="veryHard">Very Hard</button>
            <button type="button" data-colt-run="difficulty" data-difficulty="impossible">Impossible</button>
          </div>
        </div>
        <div class="colt-run-stats" aria-label="Game stats">
          <span>Level <strong id="coltRunLevel">1</strong></span>
          <span>Time Left <strong id="coltRunTime">0.0</strong></span>
          <span>Coins <strong id="coltRunScore">0</strong></span>
        </div>
      </div>
      <div class="colt-run-stage">
        <div id="coltRunCharacterSelect" class="colt-run-character-select" aria-label="Choose character">
          <div class="colt-run-character-panel">
            <div class="colt-run-character-heading">
              <div>
                <span>Get Ready</span>
                <h3>Choose Your Runner</h3>
              </div>
              <p>Learn the controls, then pick a character to begin.</p>
            </div>
            <section class="colt-run-how-to-play" aria-labelledby="coltRunHowToPlayTitle">
              <div class="colt-run-how-to-play-title">
                <span aria-hidden="true">?</span>
                <div>
                  <h4 id="coltRunHowToPlayTitle">How to Play</h4>
                  <p>Run, jump, and reach the finish flag before time runs out.</p>
                </div>
              </div>
              <div class="colt-run-control-grid">
                <div class="colt-run-control-card">
                  <span class="colt-run-control-number">1</span>
                  <div>
                    <strong>Move</strong>
                    <span class="colt-run-key-row">
                      <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
                      <em>or</em>
                      <kbd>&larr;</kbd><kbd>&rarr;</kbd>
                    </span>
                  </div>
                </div>
                <div class="colt-run-control-card">
                  <span class="colt-run-control-number">2</span>
                  <div>
                    <strong>Jump</strong>
                    <span class="colt-run-key-row">
                      <kbd class="is-wide">Space</kbd>
                      <em>or</em>
                      <kbd>&uarr;</kbd>
                    </span>
                  </div>
                </div>
                <div class="colt-run-control-card">
                  <span class="colt-run-control-number">3</span>
                  <div>
                    <strong>Reach the Flag</strong>
                    <small>Beat the clock to finish.</small>
                  </div>
                </div>
                <div class="colt-run-control-card">
                  <span class="colt-run-control-number">4</span>
                  <div>
                    <strong>Return</strong>
                    <span class="colt-run-key-row"><kbd>B</kbd><small>Back to Launchpad</small></span>
                  </div>
                </div>
              </div>
            </section>
            <div class="colt-run-character-grid">
              <button type="button" data-colt-run="character" data-character="colt">
                <canvas id="coltRunSelectColt" width="300" height="200" aria-hidden="true"></canvas>
                <span>Colt</span>
              </button>
              <button type="button" data-colt-run="character" data-character="mrNieves">
                <canvas id="coltRunSelectMrNieves" width="300" height="200" aria-hidden="true"></canvas>
                <span>Mr. Nieves</span>
              </button>
            </div>
          </div>
        </div>
        <canvas id="coltRunCanvas" class="colt-run-canvas" width="1280" height="720" tabindex="0" aria-label="Colt Run platform game"></canvas>
        <button class="colt-run-fullscreen-toggle" type="button" data-colt-run="fullscreen">Exit Fullscreen</button>
        <div class="colt-run-touch" aria-label="Touch controls">
          <div class="colt-run-joystick" data-colt-joystick aria-label="Move" role="application">
            <div class="colt-run-joystick-ring">
              <div class="colt-run-joystick-knob"></div>
            </div>
          </div>
          <button class="colt-run-touch-btn colt-run-touch-jump" type="button" data-colt-key="jump" aria-label="Jump">Jump</button>
        </div>
      </div>
      <div class="colt-run-footer">
        <div class="colt-run-status-panel" role="status" aria-live="polite">
          <span>Game Status</span>
          <p id="coltRunStatus">Choose a runner to begin.</p>
        </div>
        <div class="colt-run-actions">
          <div class="colt-run-volume" aria-label="Game audio volume">
            <button id="coltRunMusicToggle" class="colt-run-volume-btn" type="button" data-colt-run="musicToggle" aria-label="Turn game audio off"></button>
            <input id="coltRunMusicVolume" class="colt-run-volume-slider" type="range" min="0" max="100" step="1" value="42" aria-label="Game audio volume">
          </div>
          <button class="outline-btn" type="button" data-colt-run="fullscreen">⛶ Fullscreen</button>
          <button class="outline-btn" type="button" data-colt-run="characterSelect">Character</button>
          <button class="outline-btn" type="button" data-colt-run="leaderboard">Leaderboard</button>
          <button id="coltRunLeaderboardPromptToggle" class="outline-btn" type="button" data-colt-run="leaderboardPrompts" aria-pressed="true">Leaderboard Popups: On</button>
          <button class="outline-btn" type="button" data-colt-run="restart">Restart</button>
          <button id="coltRunNextLevel" class="primary-btn" type="button" data-colt-run="new" disabled>Next Level</button>
          <button class="outline-btn" type="button" data-colt-run="back" aria-keyshortcuts="B">Back (B)</button>
        </div>
      </div>
      <div id="coltRunLeaderboard" class="colt-run-leaderboard" hidden>
        <section class="colt-run-leaderboard-panel" aria-label="Colt Run leaderboard">
          <div class="colt-run-leaderboard-header">
            <h3>Coin Leaderboard</h3>
            <button class="outline-btn colt-run-leaderboard-back" type="button" data-colt-run="closeLeaderboard">Close</button>
          </div>
          <div id="coltRunLeaderboardBody" class="colt-run-leaderboard-body"></div>
          <form id="coltRunLeaderboardForm" class="colt-run-name-form" hidden>
            <label for="coltRunPlayerName">Top 10 run! Enter your name.</label>
            <div>
              <input id="coltRunPlayerName" type="text" maxlength="16" autocomplete="off" placeholder="Name">
              <button class="primary-btn" type="submit">Save</button>
            </div>
          </form>
        </section>
      </div>
    </section>
  `;
}

function stopColtRunGame() {
  if (coltRunGame && typeof coltRunGame.stop === "function") coltRunGame.stop();
  coltRunGame = null;
}

function startColtRunGame() {
  const canvas = document.getElementById("coltRunCanvas");
  if (!canvas) return;
  const shell = canvas.closest(".colt-run-shell");
  const stage = canvas.closest(".colt-run-stage");
  const fullscreenTarget = shell || stage;
  const fullscreenButtons = shell ? Array.from(shell.querySelectorAll('[data-colt-run="fullscreen"]')) : [];
  const ctx = canvas.getContext("2d");
  const gameViewportWidth = 960;
  const gameViewportHeight = 540;
  const renderScaleX = canvas.width / gameViewportWidth;
  const renderScaleY = canvas.height / gameViewportHeight;
  ctx.setTransform(renderScaleX, 0, 0, renderScaleY, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  const backgroundVignette = ctx.createRadialGradient(
    gameViewportWidth * 0.5,
    gameViewportHeight * 0.45,
    gameViewportHeight * 0.12,
    gameViewportWidth * 0.5,
    gameViewportHeight * 0.45,
    gameViewportHeight * 0.78
  );
  backgroundVignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  backgroundVignette.addColorStop(1, "rgba(0, 0, 0, 0.32)");
  const fallbackSkyGradient = ctx.createLinearGradient(0, 0, 0, gameViewportHeight);
  fallbackSkyGradient.addColorStop(0, "#101014");
  fallbackSkyGradient.addColorStop(0.55, "#211017");
  fallbackSkyGradient.addColorStop(1, "#08080a");
  const levelNode = document.getElementById("coltRunLevel");
  const timeNode = document.getElementById("coltRunTime");
  const scoreNode = document.getElementById("coltRunScore");
  const statusNode = document.getElementById("coltRunStatus");
  const nextLevelButton = document.getElementById("coltRunNextLevel");
  const leaderboardPanel = document.getElementById("coltRunLeaderboard");
  const leaderboardBody = document.getElementById("coltRunLeaderboardBody");
  const leaderboardForm = document.getElementById("coltRunLeaderboardForm");
  const leaderboardNameInput = document.getElementById("coltRunPlayerName");
  const leaderboardPromptToggle = document.getElementById("coltRunLeaderboardPromptToggle");
  const leaderboardStorageKey = "coltRunCoinLeaderboardV1";
  const leaderboardMigrationKey = "coltRunSharedLeaderboardMigratedV1";
  const leaderboardPromptsStorageKey = "coltRunLeaderboardPromptsV1";
  let leaderboardPromptsEnabled = localStorage.getItem(leaderboardPromptsStorageKey) !== "off";
  const characterSelectPanel = document.getElementById("coltRunCharacterSelect");
  const characterButtons = shell ? Array.from(shell.querySelectorAll("[data-character]")) : [];
  const selectColtCanvas = document.getElementById("coltRunSelectColt");
  const selectMrNievesCanvas = document.getElementById("coltRunSelectMrNieves");
  const characterStorageKey = "coltRunCharacterV1";
  const characterNames = {
    colt: "Colt",
    mrNieves: "Mr. Nieves"
  };
  let selectedCharacter = localStorage.getItem(characterStorageKey);
  if (!characterNames[selectedCharacter]) selectedCharacter = "colt";
  let characterSelectOpen = true;
  let initialCharacterSelectionPending = true;
  let deathStatusText = "";
  const runnerSelectionStatusText = "Choose a runner to begin. Reach the flag before time runs out.";
  const selectedRunnerStatusText = () => `${characterNames[selectedCharacter]} selected. Reach the flag before time runs out.`;
  const syncGameStatus = () => {
    statusNode.textContent = characterSelectOpen || initialCharacterSelectionPending
      ? runnerSelectionStatusText
      : deathStatusText || selectedRunnerStatusText();
  };
  const difficultyStorageKey = "coltRunDifficultyV1";
  const difficultyModes = {
    easy: {
      label: "Easy",
      platformGapScale: 0.86,
      platformGapBonus: -14,
      rockIntervalMultiplier: 1.36,
      showerIntervalMultiplier: 1.28,
      rockSpeedMultiplier: 0.78,
      activeRockBonus: -1,
      maxActiveRocks: 5,
      doubleDropMultiplier: 0.55,
      maxDrops: 1,
      forwardCooldown: 920,
      playerSpeedMultiplier: 1,
      jumpPowerMultiplier: 1,
      gravityMultiplier: 1,
      levelTimeMultiplier: 1,
      challengePlatformChance: 0.03,
      smallPlatformChance: 0,
      platformWidthScale: 1,
      verticalVariationChance: 0.38,
      verticalRiseMin: 14,
      verticalRiseMax: 44,
      verticalDropMin: 16,
      verticalDropMax: 52,
      largeDropChance: 0.04,
      largeDropMin: 58,
      largeDropMax: 72,
      downwardGapReward: 0.2
    },
    medium: {
      label: "Medium",
      platformGapScale: 1,
      platformGapBonus: 0,
      rockIntervalMultiplier: 1,
      showerIntervalMultiplier: 1,
      rockSpeedMultiplier: 1,
      activeRockBonus: 0,
      maxActiveRocks: 7,
      doubleDropMultiplier: 1,
      maxDrops: 2,
      forwardCooldown: 720,
      playerSpeedMultiplier: 1,
      jumpPowerMultiplier: 1,
      gravityMultiplier: 1,
      levelTimeMultiplier: 1,
      challengePlatformChance: 0.06,
      smallPlatformChance: 0,
      platformWidthScale: 1,
      verticalVariationChance: 0.56,
      verticalRiseMin: 16,
      verticalRiseMax: 56,
      verticalDropMin: 18,
      verticalDropMax: 70,
      largeDropChance: 0.1,
      largeDropMin: 72,
      largeDropMax: 94,
      downwardGapReward: 0.28
    },
    hard: {
      label: "Hard",
      platformGapScale: 1.14,
      platformGapBonus: 18,
      rockIntervalMultiplier: 0.68,
      showerIntervalMultiplier: 0.78,
      rockSpeedMultiplier: 1.22,
      activeRockBonus: 2,
      maxActiveRocks: 9,
      doubleDropMultiplier: 1.45,
      maxDrops: 3,
      forwardCooldown: 560,
      playerSpeedMultiplier: 1,
      jumpPowerMultiplier: 1,
      gravityMultiplier: 1,
      levelTimeMultiplier: 1,
      challengePlatformChance: 0.12,
      smallPlatformChance: 0.12,
      platformWidthScale: 1,
      verticalVariationChance: 0.72,
      verticalRiseMin: 18,
      verticalRiseMax: 68,
      verticalDropMin: 22,
      verticalDropMax: 86,
      largeDropChance: 0.18,
      largeDropMin: 88,
      largeDropMax: 116,
      downwardGapReward: 0.34
    },
    veryHard: {
      label: "Very Hard",
      platformGapScale: 1.2,
      platformGapBonus: 28,
      rockIntervalMultiplier: 0.52,
      showerIntervalMultiplier: 0.64,
      rockSpeedMultiplier: 1.38,
      activeRockBonus: 4,
      maxActiveRocks: 11,
      doubleDropMultiplier: 1.8,
      maxDrops: 3,
      forwardCooldown: 440,
      playerSpeedMultiplier: 1,
      jumpPowerMultiplier: 1,
      gravityMultiplier: 1,
      levelTimeMultiplier: 1,
      challengePlatformChance: 0.44,
      smallPlatformChance: 0.55,
      platformWidthScale: 1,
      verticalVariationChance: 0.86,
      verticalRiseMin: 20,
      verticalRiseMax: 80,
      verticalDropMin: 26,
      verticalDropMax: 104,
      largeDropChance: 0.3,
      largeDropMin: 102,
      largeDropMax: 138,
      downwardGapReward: 0.4
    },
    impossible: {
      label: "Impossible",
      platformGapScale: 1.34,
      platformGapBonus: 52,
      rockIntervalMultiplier: 0.34,
      showerIntervalMultiplier: 0.42,
      rockSpeedMultiplier: 1.68,
      activeRockBonus: 8,
      maxActiveRocks: 14,
      doubleDropMultiplier: 2.4,
      maxDrops: 4,
      forwardCooldown: 280,
      playerSpeedMultiplier: 1.28,
      jumpPowerMultiplier: 1.16,
      gravityMultiplier: 0.96,
      levelTimeMultiplier: 0.82,
      challengePlatformChance: 0.68,
      smallPlatformChance: 0.78,
      platformWidthScale: 0.8,
      verticalVariationChance: 0.94,
      verticalRiseMin: 22,
      verticalRiseMax: 90,
      verticalDropMin: 30,
      verticalDropMax: 122,
      largeDropChance: 0.42,
      largeDropMin: 116,
      largeDropMax: 156,
      downwardGapReward: 0.46
    }
  };
  const difficultyModeNames = Object.keys(difficultyModes);
  const storedDifficultyMode = localStorage.getItem(difficultyStorageKey);
  let difficultyMode = difficultyModeNames.includes(storedDifficultyMode) ? storedDifficultyMode : "medium";
  const difficultyButtons = shell ? Array.from(shell.querySelectorAll("[data-difficulty]")) : [];
  const musicVolumeSlider = document.getElementById("coltRunMusicVolume");
  const musicToggleButton = document.getElementById("coltRunMusicToggle");
  const musicVolumeStorageKey = "coltRunMusicVolumeV1";
  const ensureMediaSource = (media, preload = "auto") => {
    if (!media || media.getAttribute("src")) return media;
    const src = media.dataset.src;
    if (!src) return media;
    media.preload = preload;
    media.src = src;
    media.load();
    return media;
  };
  const releaseMediaSource = media => {
    if (!media) return;
    media.pause();
    media.removeAttribute("src");
    media.load();
  };
  const createDeferredAudio = (src, loop = false) => {
    const audio = new Audio();
    audio.dataset.src = src;
    audio.preload = "none";
    audio.loop = loop;
    return audio;
  };
  const createDeferredVideo = src => {
    const video = document.createElement("video");
    video.dataset.src = src;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "none";
    return video;
  };
  const decodedVideoFrameVersions = new WeakMap();
  const decodedVideoFrameCallbackIds = new WeakMap();
  const useTimeBasedDecodedVideoFrames = /firefox/i.test(navigator.userAgent);
  const trackDecodedVideoFrames = video => {
    if (!video || typeof video.requestVideoFrameCallback !== "function" || decodedVideoFrameCallbackIds.has(video)) return;
    const onVideoFrame = () => {
      decodedVideoFrameVersions.set(video, (decodedVideoFrameVersions.get(video) || 0) + 1);
      decodedVideoFrameCallbackIds.set(video, video.requestVideoFrameCallback(onVideoFrame));
    };
    decodedVideoFrameCallbackIds.set(video, video.requestVideoFrameCallback(onVideoFrame));
  };
  const stopTrackingDecodedVideoFrames = video => {
    const callbackId = decodedVideoFrameCallbackIds.get(video);
    if (callbackId === undefined || typeof video.cancelVideoFrameCallback !== "function") return;
    video.cancelVideoFrameCallback(callbackId);
    decodedVideoFrameCallbackIds.delete(video);
  };
  const getDecodedVideoFrameStamp = (video, fallbackFrameRate = 30) => {
    if (!useTimeBasedDecodedVideoFrames && typeof video.requestVideoFrameCallback === "function") {
      trackDecodedVideoFrames(video);
      return decodedVideoFrameVersions.get(video) || 0;
    }
    return Math.floor(video.currentTime * fallbackFrameRate);
  };
  const mrNievesRunMediaSource = "assets/colt-run-mr-nieves-run.mp4?v=20260717-run-audio1";
  const ambientAudio = createDeferredAudio("assets/colt-run-world-ambience.mp3?v=20260714-ambience-seamless", true);
  const inGameMusicTracks = [
    {
      id: "caestus",
      source: "assets/colt-run-game-music-test.ogg?v=20260720-two-track-playlist1",
      gain: 1
    },
    {
      id: "battle-theme-a",
      source: "assets/colt-run-game-music-battle-theme-a.mp3?v=20260720-two-track-playlist1",
      gain: 0.83
    },
    {
      id: "epic-boss-battle",
      source: "assets/colt-run-game-music-epic-boss-battle.wav?v=20260720-three-track-playlist1",
      gain: 0.5
    },
    {
      id: "dark-descent",
      source: "assets/colt-run-game-music-dark-descent.mp3?v=20260721-four-track-playlist1",
      gain: 1.05
    },
    {
      id: "wasteland-showdown",
      source: "assets/colt-run-game-music-wasteland-showdown.mp3?v=20260721-six-track-playlist1",
      gain: 1.08
    },
    {
      id: "battle-theme-1",
      source: "assets/colt-run-game-music-battle-theme-1.mp3?v=20260721-six-track-playlist1",
      gain: 1.36
    },
    {
      id: "battle-theme-3",
      source: "assets/colt-run-game-music-battle-theme-3.mp3?v=20260721-eight-track-playlist1",
      gain: 1.12
    },
    {
      id: "battle-theme-4",
      source: "assets/colt-run-game-music-battle-theme-4.mp3?v=20260721-eight-track-playlist1",
      gain: 1.28
    },
    {
      id: "battle-mus",
      source: "assets/colt-run-game-music-battle-mus.mp3?v=20260725-ten-track-playlist1",
      gain: 1
    },
    {
      id: "sonic-battle",
      source: "assets/colt-run-game-music-sonic-battle.mp3?v=20260725-ten-track-playlist1",
      gain: 1.28
    }
  ];
  const inGameMusic = createDeferredAudio("");
  const lastInGameMusicTrackStorageKey = "coltRunLastInGameMusicTrackV1";
  let currentInGameMusicTrack = null;
  const characterSelectMusicTracks = [
    createDeferredAudio("assets/colt-run-character-select-music.mp3?v=20260719-character-select1", true),
    createDeferredAudio("assets/colt-run-character-select-music-02.mp3?v=20260730-character-select-track2", true)
  ];
  const lastCharacterSelectMusicStorageKey = "coltRunLastCharacterSelectMusicV1";
  const previousCharacterSelectMusicIndex = Number(localStorage.getItem(lastCharacterSelectMusicStorageKey));
  const characterSelectMusicChoices = characterSelectMusicTracks
    .map((audio, index) => ({ audio, index }))
    .filter(choice => choice.index !== previousCharacterSelectMusicIndex);
  const characterSelectMusicChoice = characterSelectMusicChoices[
    Math.floor(Math.random() * characterSelectMusicChoices.length)
  ] || { audio: characterSelectMusicTracks[0], index: 0 };
  const characterSelectMusic = characterSelectMusicChoice.audio;
  localStorage.setItem(lastCharacterSelectMusicStorageKey, String(characterSelectMusicChoice.index));
  const runningAudio = createDeferredAudio("assets/colt-run-running-audio.mp3?v=20260728-gallop1", true);
  const mrNievesRunningAudio = createDeferredAudio("assets/colt-run-mr-nieves-running-audio.mp3?v=20260728-running1", true);
  const coinPickupAudio = createDeferredAudio("assets/colt-run-coin-pickup-audio.mp3?v=20260730-gameplay-cues1");
  const getReadyAudio = createDeferredAudio("assets/colt-run-get-ready-audio.mp3?v=20260730-robot-countdown1");
  const nextLevelAudio = createDeferredAudio("assets/colt-run-next-level-audio.mp3?v=20260730-gameplay-cues1");
  const gameplayCueVolumeMultipliers = [1, 1.85, 1];
  const coltDeathAudios = [
    createDeferredAudio("assets/colt-run-colt-death-audio.mp3?v=20260728-minecraft-death2"),
    createDeferredAudio("assets/colt-run-game-over-audio.mp3?v=20260730-gameplay-cues1")
  ];
  const coltCelebrationAudios = [
    createDeferredAudio("assets/colt-run-colt-celebration-audio.mp3?v=20260728-gentle-whinny1"),
    createDeferredAudio("assets/colt-run-colt-celebration-audio-02.mp3?v=20260729-horse2celeb1")
  ];
  const mrNievesDeathAudios = [
    createDeferredAudio("assets/colt-run-mr-nieves-death-audio.wav?v=20260727-pain1"),
    createDeferredAudio("assets/colt-run-mr-nieves-death-audio-02.mp3?v=20260728-makedeath2"),
    createDeferredAudio("assets/colt-run-game-over-audio.mp3?v=20260730-gameplay-cues1")
  ];
  const mrNievesCelebrationAudios = [
    createDeferredAudio("assets/colt-run-mr-nieves-celebration-audio.mp3?v=20260728-woohoo1"),
    createDeferredAudio("assets/colt-run-mr-nieves-celebration-audio-02.mp3?v=20260728-letsgo1"),
    createDeferredAudio("assets/colt-run-mr-nieves-celebration-audio-03.mp3?v=20260728-yayboy-ohyeah-boost1"),
    createDeferredAudio("assets/colt-run-mr-nieves-celebration-audio-04.mp3?v=20260728-victory1"),
    createDeferredAudio("assets/colt-run-mr-nieves-celebration-audio-05.mp3?v=20260728-yayboy-ohyeah-boost1")
  ];
  const mrNievesCelebrationVolumeMultipliers = [1, 1, 1.4, 1, 1.4];
  let lastColtDeathAudioIndex = -1;
  let lastColtCelebrationAudioIndex = -1;
  let lastMrNievesDeathAudioIndex = -1;
  let lastMrNievesCelebrationAudioIndex = -1;
  const ambientLayerVolume = 1;
  const inGameMusicLayerVolume = 0.5;
  const characterSelectMusicLayerVolume = 0.7;
  const runningLayerVolume = 0.9;
  const gameplayCueLayerVolume = 1;
  const coltDeathLayerVolume = 1;
  const coltCelebrationLayerVolume = 1;
  const coltCelebrationAudioCueSeconds = 0.74;
  const mrNievesDeathLayerVolume = 1;
  const mrNievesCelebrationLayerVolume = 1;
  const ambientBoostGain = 3.6;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  let ambientAudioContext = null;
  let ambientGainNode = null;
  let ambientSourceNode = null;
  const storedMusicVolumeValue = localStorage.getItem(musicVolumeStorageKey);
  const storedMusicVolume = storedMusicVolumeValue === null ? Number.NaN : Number(storedMusicVolumeValue);
  let musicVolume = Number.isFinite(storedMusicVolume) ? Math.max(0, Math.min(1, storedMusicVolume)) : 0.42;
  let lastAudibleMusicVolume = musicVolume > 0 ? musicVolume : 0.42;
  let musicMuted = musicVolume <= 0;
  ambientAudio.volume = musicMuted ? 0 : musicVolume * ambientLayerVolume;
  ambientAudio.muted = musicMuted;
  inGameMusic.volume = musicMuted ? 0 : musicVolume * inGameMusicLayerVolume;
  inGameMusic.muted = musicMuted;
  characterSelectMusicTracks.forEach(audio => {
    audio.volume = musicMuted ? 0 : musicVolume * characterSelectMusicLayerVolume;
    audio.muted = musicMuted;
  });
  runningAudio.volume = musicMuted ? 0 : musicVolume * runningLayerVolume;
  runningAudio.muted = musicMuted;
  mrNievesRunningAudio.volume = musicMuted ? 0 : musicVolume * runningLayerVolume;
  mrNievesRunningAudio.muted = musicMuted;
  [coinPickupAudio, getReadyAudio, nextLevelAudio].forEach((audio, index) => {
    audio.volume = musicMuted
      ? 0
      : Math.min(1, musicVolume * gameplayCueLayerVolume * gameplayCueVolumeMultipliers[index]);
    audio.muted = musicMuted;
  });
  coltDeathAudios.forEach(audio => {
    audio.volume = musicMuted ? 0 : musicVolume * coltDeathLayerVolume;
    audio.muted = musicMuted;
  });
  coltCelebrationAudios.forEach(audio => {
    audio.volume = musicMuted ? 0 : musicVolume * coltCelebrationLayerVolume;
    audio.muted = musicMuted;
  });
  mrNievesDeathAudios.forEach(audio => {
    audio.volume = musicMuted ? 0 : musicVolume * mrNievesDeathLayerVolume;
    audio.muted = musicMuted;
  });
  mrNievesCelebrationAudios.forEach((audio, index) => {
    audio.volume = musicMuted
      ? 0
      : Math.min(1, musicVolume * mrNievesCelebrationLayerVolume * mrNievesCelebrationVolumeMultipliers[index]);
    audio.muted = musicMuted;
  });
  const keys = { left: false, right: false, jump: false };
  let animationId = 0;
  let lastRenderedTimeText = "";
  let lastOverlayFrameAt = 0;
  let lastSimulationFrameAt = 0;
  let level = 1;
  let levelSeed = Date.now();
  let levelStart = performance.now();
  let runTimeBankSeconds = 0;
  let levelDurationSeconds = 60;
  let cameraX = 0;
  let score = 0;
  let won = false;
  let lost = false;
  let finishLandingPending = false;
  let finishPlatform = null;
  let finishTouchElapsedSeconds = 0;
  let coltCelebrationAudioPending = false;
  let coltCelebrationLastVideoTime = 0;
  let deathLeaderboardHandled = false;
  let pendingLeaderboardEntry = null;
  let leaderboard = [];
  let leaderboardOpenedAt = 0;
  let activeLeaderboardMode = difficultyMode;
  let platforms = [];
  let coins = [];
  let fallingLavaRocks = [];
  let nextLavaRockAt = 0;
  let nextForwardLavaRockAt = 0;
  let nextLavaRockShowerAt = 0;
  let flag = { x: 0, y: 0 };
  let deathStartedAt = 0;
  let deathX = 0;
  let deathY = 0;
  let deathFallStartY = 0;
  let currentBackgroundIndex = 0;
  let lastBackgroundIndex = -1;
  let backgroundDeck = [];
  let currentStartingPlatformSprite = 0;
  let lastStartingPlatformSprite = -1;
  let startingPlatformDeck = [];
  const getDifficultySettings = () => difficultyModes[difficultyMode] || difficultyModes.medium;
  const setTimeDisplay = value => {
    const text = String(value);
    if (text === lastRenderedTimeText) return;
    lastRenderedTimeText = text;
    timeNode.textContent = text;
  };
  const updateDifficultyButtons = () => {
    difficultyButtons.forEach(button => {
      const selected = button.dataset.difficulty === difficultyMode;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  };
  const setDifficultyMode = mode => {
    if (!difficultyModes[mode]) return;
    if (difficultyMode === mode) {
      syncGameStatus();
      canvas.focus({ preventScroll: true });
      return;
    }
    difficultyMode = mode;
    localStorage.setItem(difficultyStorageKey, difficultyMode);
    updateDifficultyButtons();
    level = 1;
    resetLevel(true);
    syncGameStatus();
  };
  const updateCharacterButtons = () => {
    characterButtons.forEach(button => {
      const selected = button.dataset.character === selectedCharacter;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  };
  const openCharacterSelect = () => {
    characterSelectOpen = true;
    deathStatusText = "";
    if (characterSelectPanel) characterSelectPanel.hidden = false;
    updateCharacterButtons();
    stopRunningAudio();
    if (initialCharacterSelectionPending) playColtRunAudio();
    syncGameStatus();
  };
  const closeCharacterSelect = () => {
    characterSelectOpen = false;
    if (characterSelectPanel) characterSelectPanel.hidden = true;
    canvas.focus({ preventScroll: true });
  };
  const setCharacter = character => {
    if (!characterNames[character]) return;
    if (initialCharacterSelectionPending) {
      initialCharacterSelectionPending = false;
      characterSelectMusicTracks.forEach(audio => {
        audio.pause();
        try {
          audio.currentTime = 0;
        } catch {}
      });
    }
    selectedCharacter = character;
    localStorage.setItem(characterStorageKey, selectedCharacter);
    updateCharacterButtons();
    if (selectedCharacter === "mrNieves") chooseMrNievesIdleVideo();
    ensureCharacterMedia(selectedCharacter);
    resetLevel(true);
    closeCharacterSelect();
    playColtRunAudio();
    playGameplayCue(getReadyAudio);
    syncGameStatus();
  };
  const player = { x: 48, y: 300, w: 82, h: 62, vx: 0, vy: 0, grounded: false, groundPlatform: null, facing: 1, state: "idle", jumpPrepUntil: 0 };
  const coltSprites = {
    idle: new Image(),
    run: new Image(),
    run2: new Image(),
    run3: new Image(),
    jumpPrep: new Image(),
    leap: new Image(),
    deathLoading: new Image()
  };
  Object.values(coltSprites).forEach(image => {
    image.decoding = "async";
  });
  coltSprites.idle.src = "assets/colt-run-idle.png?v=20260702-legfix";
  coltSprites.run.src = "assets/colt-run-run.png?v=20260703-holefix";
  coltSprites.run2.src = "assets/colt-run-run-2.png?v=20260702-run2";
  coltSprites.run3.src = "assets/colt-run-run-3.png?v=20260702-run3";
  coltSprites.jumpPrep.src = "assets/colt-run-jump-prep.png?v=20260702-clean";
  coltSprites.leap.src = "assets/colt-run-leap.png?v=20260702-clean";
  coltSprites.deathLoading.src = "assets/colt-run-death-loading.png?v=20260730-death-loading1";
  const smallPlatformSpriteIndex = 21;
  const horseHeadPlatformSpriteIndex = 8;
  const dragonHeadPlatformSpriteIndex = 31;
  const churchPlatformSpriteIndex = 32;
  const bishopPlatformSpriteIndex = 33;
  const scenicPlatformSpriteIndexSet = new Set([churchPlatformSpriteIndex, bishopPlatformSpriteIndex]);
  const challengePillarSpriteIndex = 26;
  const challengePlatformSpriteIndexes = [challengePillarSpriteIndex, 27, 28, 29, 30];
  const challengePlatformSpriteIndexSet = new Set(challengePlatformSpriteIndexes);
  const tallChallengePlatformSpriteIndexSet = new Set([challengePillarSpriteIndex, 27]);
  const platformAssetVersions = Array.from({ length: 34 }, () => "20260718-platform07-replace1");
  platformAssetVersions[0] = "20260718-platform01-replace1";
  platformAssetVersions[1] = "20260718-platform02-replace1";
  platformAssetVersions[3] = "20260718-platform04-replace1";
  platformAssetVersions[4] = "20260718-platform05-replace1";
  platformAssetVersions[7] = "20260721-platform08-incline1";
  platformAssetVersions[horseHeadPlatformSpriteIndex] = "20260721-platform09-horse-head1";
  platformAssetVersions[9] = "20260719-platform10-replace1";
  platformAssetVersions[10] = "20260719-platform11-replace1";
  platformAssetVersions[11] = "20260719-platform12-replace1";
  platformAssetVersions[12] = "20260718-platform13-replace1";
  platformAssetVersions[13] = "20260720-platform14-colored-crest1";
  platformAssetVersions[14] = "20260718-platform15-replace1";
  platformAssetVersions[15] = "20260719-platform16-replace1";
  platformAssetVersions[16] = "20260720-platform17-glowing-crest1";
  platformAssetVersions[17] = "20260720-platform18-colored-crest1";
  platformAssetVersions[18] = "20260720-platform19-colored-fallback1";
  platformAssetVersions[19] = "20260720-platform20-colored-fallback1";
  platformAssetVersions[20] = "20260718-platform21-replace1";
  platformAssetVersions[22] = "20260721-platform23-new1";
  platformAssetVersions[23] = "20260721-platform24-new1";
  platformAssetVersions[24] = "20260721-platform25-new1";
  platformAssetVersions[25] = "20260721-platform26-new1";
  platformAssetVersions[26] = "20260721-platform27-challenge1";
  platformAssetVersions[27] = "20260721-platform28-challenge1";
  platformAssetVersions[28] = "20260721-platform29-challenge1";
  platformAssetVersions[29] = "20260721-platform30-challenge1";
  platformAssetVersions[30] = "20260721-platform31-challenge1";
  platformAssetVersions[dragonHeadPlatformSpriteIndex] = "20260725-platform32-dragon-head3";
  platformAssetVersions[churchPlatformSpriteIndex] = "20260722-platform33-st-cletus-church1";
  platformAssetVersions[bishopPlatformSpriteIndex] = "20260722-platform34-bishop-statue1";
  const platformSpriteSources = platformAssetVersions.map((version, index) => (
    `assets/colt-run-platform-${String(index + 1).padStart(2, "0")}.png?v=${version}`
  ));
  const platformSprites = platformSpriteSources.map(() => {
    const image = new Image();
    image.decoding = "async";
    return image;
  });
  const retiredPlatformSpriteIndexes = new Set([18, 19]);
  const ensurePlatformSprite = index => {
    const spriteIndex = Math.abs(index) % platformSprites.length;
    const sprite = platformSprites[spriteIndex];
    if (!sprite.getAttribute("src")) sprite.src = platformSpriteSources[spriteIndex];
    return sprite;
  };
  const platformSurfaceRatios = [0.24, 0.27, 0.20, 0.18, 0.24, 0.27, 0.22, 0.25, 0.49, 0.24, 0.23, 0.22, 0.42, 0.52, 0.41, 0.13, 0.52, 0.50, 0.50, 0.50, 0.22, 0.18, 0.41, 0.25, 0.31, 0.30, 0.16, 0.23, 0.30, 0.41, 0.25, 0.54, 0.61, 0.61];
  const platformCollisionProfiles = {
    0: { offsetY: 10 },
    7: { leftSurfaceRatio: 0.47, rightSurfaceRatio: 0.03 },
    22: { surfacePoints: [[0, 0.285], [0.2, 0.32], [0.5, 0.41], [0.8, 0.48], [1, 0.50]] },
    23: { surfacePoints: [[0, 0.28], [0.62, 0.28], [0.72, 0.245], [0.85, 0.17], [1, 0.17]] },
    24: { surfacePoints: [[0, 0.16], [0.35, 0.17], [0.45, 0.23], [0.58, 0.40], [0.70, 0.48], [1, 0.48]] },
    25: { surfacePoints: [[0, 0.31], [0.35, 0.31], [0.43, 0.29], [0.68, 0.11], [0.75, 0.10], [1, 0.10]] }
  };
  const platformFlagAnchors = {
    0: { xRatio: 0.64 }
  };

  const getPlatformDrawSize = platform => {
    const spriteIndex = platform.sprite % platformSprites.length;
    const sprite = platformSprites[spriteIndex];
    const spriteReady = sprite.complete && sprite.naturalWidth;
    if (
      spriteReady &&
      platform.drawSizeCache &&
      platform.drawSizeCache.spriteIndex === spriteIndex &&
      platform.drawSizeCache.width === platform.w &&
      platform.drawSizeCache.naturalWidth === sprite.naturalWidth &&
      platform.drawSizeCache.naturalHeight === sprite.naturalHeight
    ) {
      return platform.drawSizeCache;
    }
    const drawW = spriteIndex === smallPlatformSpriteIndex
      ? Math.max(platform.w + 28, platform.w * 1.14)
      : challengePlatformSpriteIndexSet.has(spriteIndex)
        ? Math.max(platform.w + 36, platform.w * 1.18)
        : Math.max(platform.w + 72, platform.w * 1.22);
    const naturalRatio = spriteReady ? sprite.naturalHeight / sprite.naturalWidth : 0.48;
    const drawH = spriteIndex === smallPlatformSpriteIndex
      ? Math.max(54, Math.min(112, drawW * naturalRatio))
      : spriteIndex === dragonHeadPlatformSpriteIndex
        ? Math.max(150, Math.min(260, drawW * naturalRatio))
      : scenicPlatformSpriteIndexSet.has(spriteIndex)
        ? Math.max(150, Math.min(250, drawW * naturalRatio))
      : spriteIndex === horseHeadPlatformSpriteIndex
        ? Math.max(118, Math.min(230, drawW * naturalRatio))
      : tallChallengePlatformSpriteIndexSet.has(spriteIndex)
        ? Math.max(132, Math.min(210, drawW * naturalRatio))
        : challengePlatformSpriteIndexSet.has(spriteIndex)
          ? Math.max(92, Math.min(175, drawW * naturalRatio))
        : Math.max(82, Math.min(190, drawW * naturalRatio));
    const drawSize = { drawW, drawH };
    if (spriteReady) {
      platform.drawSizeCache = {
        ...drawSize,
        spriteIndex,
        width: platform.w,
        naturalWidth: sprite.naturalWidth,
        naturalHeight: sprite.naturalHeight
      };
    }
    return drawSize;
  };

  const getPlatformSurfaceY = (platform, footX) => {
    const spriteIndex = platform.sprite % platformSprites.length;
    const profile = platformCollisionProfiles[spriteIndex];
    if (!profile) return platform.y;
    if (Number.isFinite(profile.offsetY)) return platform.y + profile.offsetY;
    const { drawH } = getPlatformDrawSize(platform);
    const localX = Math.max(0, Math.min(1, (footX - platform.x) / platform.w));
    let surfaceRatio;
    if (Array.isArray(profile.surfacePoints) && profile.surfacePoints.length > 1) {
      let rightPointIndex = profile.surfacePoints.findIndex(point => point[0] >= localX);
      if (rightPointIndex < 0) rightPointIndex = profile.surfacePoints.length - 1;
      else if (rightPointIndex === 0) rightPointIndex = 1;
      const leftPoint = profile.surfacePoints[rightPointIndex - 1];
      const rightPoint = profile.surfacePoints[Math.min(rightPointIndex, profile.surfacePoints.length - 1)];
      const segmentProgress = Math.max(0, Math.min(1, (localX - leftPoint[0]) / Math.max(0.001, rightPoint[0] - leftPoint[0])));
      surfaceRatio = leftPoint[1] + (rightPoint[1] - leftPoint[1]) * segmentProgress;
    } else {
      surfaceRatio = profile.leftSurfaceRatio + (profile.rightSurfaceRatio - profile.leftSurfaceRatio) * localX;
    }
    return platform.y + drawH * (surfaceRatio - platformSurfaceRatios[spriteIndex]);
  };
  const lavaRockSpriteSources = Array.from({ length: 32 }, (_, index) => (
    `assets/colt-run-lava-rock-${String(index + 1).padStart(2, "0")}.png?v=20260707-rocks6`
  ));
  lavaRockSpriteSources[10] = "assets/colt-run-lava-rock-11.png?v=20260721-new-rocks1";
  lavaRockSpriteSources[11] = "assets/colt-run-lava-rock-12.png?v=20260721-new-rocks1";
  lavaRockSpriteSources[12] = "assets/colt-run-lava-rock-13.png?v=20260721-new-rocks1";
  for (let index = 13; index < 18; index += 1) {
    lavaRockSpriteSources[index] = `assets/colt-run-lava-rock-${String(index + 1).padStart(2, "0")}.png?v=20260726-lava-heads1`;
  }
  for (let index = 18; index < 26; index += 1) {
    lavaRockSpriteSources[index] = `assets/colt-run-lava-rock-${String(index + 1).padStart(2, "0")}.png?v=20260726-background8-rocks1`;
  }
  for (let index = 26; index < 32; index += 1) {
    lavaRockSpriteSources[index] = `assets/colt-run-lava-rock-${String(index + 1).padStart(2, "0")}.png?v=20260730-background9-rocks1`;
  }
  const activeLavaRockSpriteIndexes = lavaRockSpriteSources.map((_, index) => index);
  const background008Index = 7;
  const background009Index = 8;
  const background008FeaturedLavaRockChance = 0.75;
  const background008FeaturedLavaRockSpriteIndexes = Array.from({ length: 8 }, (_, index) => index + 18);
  const background008LegacyLavaRockSpriteIndexes = activeLavaRockSpriteIndexes.filter(index => (
    !background008FeaturedLavaRockSpriteIndexes.includes(index)
  ));
  const background009FeaturedLavaRockChance = 0.75;
  const background009FeaturedLavaRockSpriteIndexes = Array.from({ length: 6 }, (_, index) => index + 26);
  const background009LegacyLavaRockSpriteIndexes = activeLavaRockSpriteIndexes.filter(index => (
    !background009FeaturedLavaRockSpriteIndexes.includes(index)
  ));
  const chooseRegularLavaRockSpriteIndex = () => {
    let spriteIndexes = activeLavaRockSpriteIndexes;
    if (currentBackgroundIndex === background008Index) {
      spriteIndexes = Math.random() < background008FeaturedLavaRockChance
        ? background008FeaturedLavaRockSpriteIndexes
        : background008LegacyLavaRockSpriteIndexes;
    } else if (currentBackgroundIndex === background009Index) {
      spriteIndexes = Math.random() < background009FeaturedLavaRockChance
        ? background009FeaturedLavaRockSpriteIndexes
        : background009LegacyLavaRockSpriteIndexes;
    }
    return spriteIndexes[Math.floor(Math.random() * spriteIndexes.length)];
  };
  const lavaRockSprites = lavaRockSpriteSources.map(() => {
    const image = new Image();
    image.decoding = "async";
    return image;
  });
  const ensureLavaRockSprite = index => {
    const spriteIndex = Math.abs(index) % lavaRockSprites.length;
    const sprite = lavaRockSprites[spriteIndex];
    if (!sprite.getAttribute("src")) sprite.src = lavaRockSpriteSources[spriteIndex];
    return sprite;
  };
  const lavaRockShowerSpriteSources = [
    "assets/colt-run-lava-rock-shower-01.png?v=20260707-shower1",
    "assets/colt-run-lava-rock-shower-02.png?v=20260711-shower2",
    "assets/colt-run-lava-rock-shower-03.png?v=20260721-meteor-shower1"
  ];
  const lavaRockShowerSprites = lavaRockShowerSpriteSources.map(() => {
    const image = new Image();
    image.decoding = "async";
    return image;
  });
  const ensureLavaRockShowerSprite = index => {
    const spriteIndex = Math.abs(index) % lavaRockShowerSprites.length;
    const sprite = lavaRockShowerSprites[spriteIndex];
    if (!sprite.getAttribute("src")) sprite.src = lavaRockShowerSpriteSources[spriteIndex];
    return sprite;
  };
  const lavaRockVideoSpecialSources = [
    "assets/colt-run-lava-rock-video-special-01.mp4?v=20260707-video-special1",
    "assets/colt-run-lava-rock-video-special-02.mp4?v=20260715-video-special2"
  ];
  const lavaRockVideoSpecials = lavaRockVideoSpecialSources.map(createDeferredVideo);
  const lavaRockVideoFrameSize = 260;
  const lavaRockVideoFrameCanvas = document.createElement("canvas");
  lavaRockVideoFrameCanvas.width = lavaRockVideoFrameSize;
  lavaRockVideoFrameCanvas.height = lavaRockVideoFrameSize;
  const lavaRockVideoFrameContext = lavaRockVideoFrameCanvas.getContext("2d", { willReadFrequently: true });
  const lavaRockVideoCropCanvas = document.createElement("canvas");
  const lavaRockVideoCropContext = lavaRockVideoCropCanvas.getContext("2d");
  let lavaRockVideoFrameStamp = -1;
  let lavaRockVideoFrameSource = -1;
  const lavaRockHitProfiles = [
    { coreX: 0.35, coreY: 0.71, rx: 0.18, ry: 0.18 },
    { coreX: 0.37, coreY: 0.59, rx: 0.22, ry: 0.24 },
    { coreX: 0.26, coreY: 0.59, rx: 0.19, ry: 0.27 },
    { coreX: 0.38, coreY: 0.65, rx: 0.22, ry: 0.21 },
    { coreX: 0.35, coreY: 0.57, rx: 0.23, ry: 0.24 },
    { coreX: 0.34, coreY: 0.62, rx: 0.22, ry: 0.23 },
    { coreX: 0.34, coreY: 0.62, rx: 0.24, ry: 0.22 },
    { coreX: 0.34, coreY: 0.63, rx: 0.24, ry: 0.22 },
    { coreX: 0.38, coreY: 0.67, rx: 0.18, ry: 0.19 },
    { coreX: 0.32, coreY: 0.68, rx: 0.21, ry: 0.2 },
    { coreX: 0.34, coreY: 0.67, rx: 0.25, ry: 0.25 },
    { coreX: 0.16, coreY: 0.78, rx: 0.14, ry: 0.19 },
    { coreX: 0.30, coreY: 0.66, rx: 0.25, ry: 0.27 },
    { coreX: 0.30, coreY: 0.56, rx: 0.27, ry: 0.34 },
    { coreX: 0.29, coreY: 0.58, rx: 0.27, ry: 0.32 },
    { coreX: 0.30, coreY: 0.57, rx: 0.27, ry: 0.34 },
    { coreX: 0.29, coreY: 0.57, rx: 0.27, ry: 0.31 },
    { coreX: 0.30, coreY: 0.58, rx: 0.27, ry: 0.31 },
    { coreX: 0.31, coreY: 0.72, rx: 0.25, ry: 0.23 },
    { coreX: 0.29, coreY: 0.76, rx: 0.24, ry: 0.18 },
    { coreX: 0.35, coreY: 0.75, rx: 0.27, ry: 0.2 },
    { coreX: 0.45, coreY: 0.65, rx: 0.27, ry: 0.25 },
    { coreX: 0.27, coreY: 0.80, rx: 0.22, ry: 0.15 },
    { coreX: 0.26, coreY: 0.82, rx: 0.23, ry: 0.13 },
    { coreX: 0.34, coreY: 0.69, rx: 0.28, ry: 0.24 },
    { coreX: 0.50, coreY: 0.60, rx: 0.25, ry: 0.22 },
    { coreX: 0.78, coreY: 0.84, rx: 0.16, ry: 0.14 },
    { coreX: 0.69, coreY: 0.80, rx: 0.20, ry: 0.15 },
    { coreX: 0.73, coreY: 0.84, rx: 0.20, ry: 0.14 },
    { coreX: 0.72, coreY: 0.81, rx: 0.18, ry: 0.14 },
    { coreX: 0.75, coreY: 0.85, rx: 0.16, ry: 0.13 },
    { coreX: 0.73, coreY: 0.84, rx: 0.18, ry: 0.14 }
  ];
  const lavaRockShowerHitProfiles = [
    [
      { coreX: 0.16, coreY: 0.45, rx: 0.045, ry: 0.045 },
      { coreX: 0.33, coreY: 0.25, rx: 0.055, ry: 0.055 },
      { coreX: 0.50, coreY: 0.33, rx: 0.065, ry: 0.085 },
      { coreX: 0.84, coreY: 0.23, rx: 0.045, ry: 0.04 },
      { coreX: 0.13, coreY: 0.72, rx: 0.12, ry: 0.12 },
      { coreX: 0.54, coreY: 0.59, rx: 0.09, ry: 0.09 },
      { coreX: 0.75, coreY: 0.58, rx: 0.065, ry: 0.065 },
      { coreX: 0.49, coreY: 0.82, rx: 0.07, ry: 0.07 },
      { coreX: 0.78, coreY: 0.83, rx: 0.055, ry: 0.055 }
    ],
    [
      { coreX: 0.336, coreY: 0.294, rx: 0.07, ry: 0.09 },
      { coreX: 0.595, coreY: 0.74, rx: 0.065, ry: 0.09 },
      { coreX: 0.814, coreY: 0.75, rx: 0.06, ry: 0.08 },
      { coreX: 0.681, coreY: 0.398, rx: 0.05, ry: 0.085 },
      { coreX: 0.29, coreY: 0.755, rx: 0.04, ry: 0.065 },
      { coreX: 0.066, coreY: 0.545, rx: 0.035, ry: 0.055 },
      { coreX: 0.134, coreY: 0.246, rx: 0.03, ry: 0.052 },
      { coreX: 0.612, coreY: 0.351, rx: 0.043, ry: 0.05 },
      { coreX: 0.165, coreY: 0.666, rx: 0.03, ry: 0.045 },
      { coreX: 0.487, coreY: 0.541, rx: 0.028, ry: 0.05 },
      { coreX: 0.397, coreY: 0.925, rx: 0.03, ry: 0.045 },
      { coreX: 0.588, coreY: 0.182, rx: 0.026, ry: 0.04 },
      { coreX: 0.834, coreY: 0.514, rx: 0.024, ry: 0.04 }
    ],
    [
      { coreX: 0.081, coreY: 0.214, rx: 0.055, ry: 0.07 },
      { coreX: 0.381, coreY: 0.259, rx: 0.06, ry: 0.07 },
      { coreX: 0.649, coreY: 0.18, rx: 0.035, ry: 0.045 },
      { coreX: 0.76, coreY: 0.35, rx: 0.05, ry: 0.07 },
      { coreX: 0.132, coreY: 0.511, rx: 0.035, ry: 0.05 },
      { coreX: 0.424, coreY: 0.54, rx: 0.075, ry: 0.11 },
      { coreX: 0.875, coreY: 0.496, rx: 0.04, ry: 0.055 },
      { coreX: 0.593, coreY: 0.578, rx: 0.025, ry: 0.035 },
      { coreX: 0.20, coreY: 0.699, rx: 0.04, ry: 0.055 },
      { coreX: 0.021, coreY: 0.946, rx: 0.03, ry: 0.04 },
      { coreX: 0.278, coreY: 0.936, rx: 0.045, ry: 0.06 },
      { coreX: 0.532, coreY: 0.901, rx: 0.07, ry: 0.095 },
      { coreX: 0.655, coreY: 0.975, rx: 0.02, ry: 0.03 },
      { coreX: 0.823, coreY: 0.827, rx: 0.09, ry: 0.12 }
    ]
  ];
  const lavaRockVideoSpecialHitProfiles = [
    { coreX: 0.35, coreY: 0.66, rx: 0.2, ry: 0.2 }
  ];
  const lavaRockSingleHitProfiles = lavaRockHitProfiles.map(profile => [profile]);
  lavaRockSingleHitProfiles[25] = [
    { coreX: 0.67, coreY: 0.27, rx: 0.17, ry: 0.16 },
    { coreX: 0.28, coreY: 0.72, rx: 0.2, ry: 0.18 },
    { coreX: 0.72, coreY: 0.73, rx: 0.18, ry: 0.17 }
  ];
  const lavaRockSizeMultipliers = [
    0.72, 0.92, 0.92, 0.9, 0.9, 0.82, 0.84, 0.84, 0.9, 0.9, 0.88, 1.18, 0.9,
    1, 1, 1, 1, 1,
    1, 1.04, 1, 0.96, 1.06, 1.28, 1, 1.08,
    1, 1, 1, 1, 1, 1
  ];
  const backgroundSpriteSources = [
    ...Array.from({ length: 5 }, (_, index) => (
      `assets/colt-run-bg-${String(index + 1).padStart(2, "0")}.png?v=20260719-background-stills-match-videos1`
    )),
    "assets/colt-run-bg-06.png?v=20260724-background6",
    "assets/colt-run-bg-07.png?v=20260725-backgrounds7-8",
    "assets/colt-run-bg-08.png?v=20260725-backgrounds7-8",
    "assets/colt-run-bg-09.png?v=20260730-background9-cartoon-students-replacement2",
    "assets/colt-run-bg-10.png?v=20260730-background10-hq1"
  ];
  const backgroundSprites = backgroundSpriteSources.map(() => {
    const image = new Image();
    image.decoding = "async";
    return image;
  });
  const ensureBackgroundSprite = index => {
    const spriteIndex = Math.abs(index) % backgroundSprites.length;
    const sprite = backgroundSprites[spriteIndex];
    if (!sprite.getAttribute("src")) sprite.src = backgroundSpriteSources[spriteIndex];
    return sprite;
  };
  const animatedBackgroundVideos = [
    "assets/colt-run-bg-01.mp4?v=20260726-backgrounds1-5-hq2",
    "assets/colt-run-bg-02.mp4?v=20260726-backgrounds1-5-hq2",
    "assets/colt-run-bg-03.mp4?v=20260726-backgrounds1-5-hq2",
    "assets/colt-run-bg-04.mp4?v=20260726-backgrounds1-5-hq2",
    "assets/colt-run-bg-05.mp4?v=20260726-backgrounds1-5-hq2",
    "assets/colt-run-bg-06.mp4?v=20260725-background6-hq2",
    "assets/colt-run-bg-07.mp4?v=20260725-background7-hq2",
    "assets/colt-run-bg-08.mp4?v=20260725-background8-hq2",
    "assets/colt-run-bg-09.mp4?v=20260730-background9-cartoon-students-replacement2",
    "assets/colt-run-bg-10.mp4?v=20260730-background10-hq1"
  ].map(createDeferredVideo);
  const coinSprite = new Image();
  coinSprite.decoding = "async";
  coinSprite.src = "assets/colt-run-coin.png?v=20260709-coin-gold";
  const coinVideo = createDeferredVideo("assets/colt-run-coin-spin.mp4?v=20260704-coin2");
  const flagVideo = createDeferredVideo("assets/colt-run-flag.mp4?v=20260704-flagblow");
  const coltIdleVideos = [
    createDeferredVideo("assets/colt-run-idle.mp4?v=20260703-idle"),
    createDeferredVideo("assets/colt-run-idle-02.mp4?v=20260724-idle2")
  ];
  coltIdleVideos.forEach(video => {
    video.loop = false;
  });
  let coltIdleIndex = 0;
  const getColtIdleVideo = () => coltIdleVideos[coltIdleIndex];
  const runVideo = createDeferredVideo("assets/colt-run-run.mp4?v=20260704-best-run");
  const leapVideo = createDeferredVideo("assets/colt-run-leap.mp4?v=20260704-best2-leap");
  const coltCelebrationVideo = createDeferredVideo("assets/colt-run-colt-celebration.mp4?v=20260729-celebration1");
  const mrNievesIdleVideos = [
    createDeferredVideo("assets/colt-run-mr-nieves-idle.mp4?v=20260716-idle-remake2"),
    createDeferredVideo("assets/colt-run-mr-nieves-idle-02.mp4?v=20260723-idle2")
  ];
  mrNievesIdleVideos.forEach(video => {
    video.loop = false;
  });
  let mrNievesIdleIndex = 0;
  let lastMrNievesIdleIndex = -1;
  const getMrNievesIdleVideo = () => mrNievesIdleVideos[mrNievesIdleIndex];
  const mrNievesRunVideo = createDeferredVideo(mrNievesRunMediaSource);
  const mrNievesInAirVideos = [
    createDeferredVideo("assets/colt-run-mr-nieves-inair.mp4?v=20260717-inair1"),
    createDeferredVideo("assets/colt-run-mr-nieves-inair-02.mp4?v=20260723-inair2")
  ];
  let mrNievesInAirIndex = 0;
  const getMrNievesInAirVideo = () => mrNievesInAirVideos[mrNievesInAirIndex];
  const mrNievesCelebrationVideos = [
    createDeferredVideo("assets/colt-run-mr-nieves-celebration.mp4?v=20260717-celebration1"),
    createDeferredVideo("assets/colt-run-mr-nieves-celebration-02.mp4?v=20260723-celebration2"),
    createDeferredVideo("assets/colt-run-mr-nieves-celebration-03.mp4?v=20260723-celebration3"),
    createDeferredVideo("assets/colt-run-mr-nieves-celebration-04.mp4?v=20260726-celebration4")
  ];
  let mrNievesCelebrationIndex = 0;
  let lastMrNievesCelebrationIndex = -1;
  const getMrNievesCelebrationVideo = () => mrNievesCelebrationVideos[mrNievesCelebrationIndex];
  const mrNievesDeathVideos = [
    createDeferredVideo("assets/colt-run-mr-nieves-death.mp4?v=20260723-death2"),
    createDeferredVideo("assets/colt-run-mr-nieves-death-02.mp4?v=20260724-death3")
  ];
  let mrNievesDeathIndex = -1;
  const getMrNievesDeathVideo = () => mrNievesDeathVideos[Math.max(0, mrNievesDeathIndex)];
  const mrNievesJumpImage = new Image();
  mrNievesJumpImage.decoding = "async";
  mrNievesJumpImage.src = "assets/colt-run-mr-nieves-jump.jpg?v=20260717-jump1";
  const deathVideo = createDeferredVideo("assets/colt-run-death.mp4?v=20260706-death");
  const ensureCharacterMedia = character => {
    if (character === "mrNieves") {
      mrNievesIdleVideos.forEach(video => ensureMediaSource(video, "metadata"));
      ensureMediaSource(mrNievesRunVideo, "metadata");
      mrNievesInAirVideos.forEach(video => ensureMediaSource(video, "metadata"));
      mrNievesCelebrationVideos.forEach(video => ensureMediaSource(video, "metadata"));
      mrNievesDeathVideos.forEach(video => ensureMediaSource(video, "metadata"));
      mrNievesDeathAudios.forEach(audio => ensureMediaSource(audio));
      mrNievesCelebrationAudios.forEach(audio => ensureMediaSource(audio));
      return;
    }
    coltIdleVideos.forEach(video => ensureMediaSource(video, "metadata"));
    ensureMediaSource(getColtIdleVideo());
    ensureMediaSource(runVideo, "metadata");
    ensureMediaSource(leapVideo, "metadata");
    ensureMediaSource(coltCelebrationVideo, "metadata");
    coltDeathAudios.forEach(audio => ensureMediaSource(audio));
    coltCelebrationAudios.forEach(audio => ensureMediaSource(audio));
  };
  const stagedMediaTimers = [];
  const scheduleMediaLoad = (media, delay) => {
    const timer = window.setTimeout(() => ensureMediaSource(media, "metadata"), delay);
    stagedMediaTimers.push(timer);
  };
  let animatedBackgroundReadyAt = Number.POSITIVE_INFINITY;
  const coinFrameSize = 96;
  const coinFrameCanvas = document.createElement("canvas");
  coinFrameCanvas.width = coinFrameSize;
  coinFrameCanvas.height = coinFrameSize;
  const coinFrameContext = coinFrameCanvas.getContext("2d", { willReadFrequently: true });
  let coinFrameStamp = -1;
  const flagFrameSize = 128;
  const flagFrameCanvas = document.createElement("canvas");
  flagFrameCanvas.width = flagFrameSize;
  flagFrameCanvas.height = flagFrameSize;
  const flagFrameContext = flagFrameCanvas.getContext("2d", { willReadFrequently: true });
  let flagFrameStamp = -1;
  // Retain the Colt's source pixel-art detail through chroma keying and
  // gameplay scaling instead of reducing each animation too early.
  const idleFrameWidth = 270;
  const idleFrameHeight = 183;
  const idleFrameCanvas = document.createElement("canvas");
  idleFrameCanvas.width = idleFrameWidth;
  idleFrameCanvas.height = idleFrameHeight;
  const idleFrameContext = idleFrameCanvas.getContext("2d", { willReadFrequently: true });
  const idleCropCanvas = document.createElement("canvas");
  const idleCropContext = idleCropCanvas.getContext("2d");
  if (idleFrameContext) idleFrameContext.imageSmoothingEnabled = false;
  if (idleCropContext) idleCropContext.imageSmoothingEnabled = false;
  const idleFrameStates = coltIdleVideos.map(() => ({
    stamp: -1,
    stableCrop: null
  }));
  const runFrameWidth = 330;
  const runFrameHeight = 192;
  const runFrameCanvas = document.createElement("canvas");
  runFrameCanvas.width = runFrameWidth;
  runFrameCanvas.height = runFrameHeight;
  const runFrameContext = runFrameCanvas.getContext("2d", { willReadFrequently: true });
  const runCropCanvas = document.createElement("canvas");
  const runCropContext = runCropCanvas.getContext("2d");
  if (runFrameContext) runFrameContext.imageSmoothingEnabled = false;
  if (runCropContext) runCropContext.imageSmoothingEnabled = false;
  let runFrameStamp = -1;
  let runStableCrop = null;
  const leapFrameWidth = 330;
  const leapFrameHeight = 225;
  const leapFrameCanvas = document.createElement("canvas");
  leapFrameCanvas.width = leapFrameWidth;
  leapFrameCanvas.height = leapFrameHeight;
  const leapFrameContext = leapFrameCanvas.getContext("2d", { willReadFrequently: true });
  const leapCropCanvas = document.createElement("canvas");
  const leapCropContext = leapCropCanvas.getContext("2d");
  if (leapFrameContext) leapFrameContext.imageSmoothingEnabled = false;
  if (leapCropContext) leapCropContext.imageSmoothingEnabled = false;
  const coltMotionFrameStates = {
    leap: { stamp: -1, crop: null },
    celebration: { stamp: -1, crop: null }
  };
  let coltMotionActiveFrameState = "";
  // Preserve more of the source pixel-art detail before the character is
  // chroma-keyed, cropped, and scaled onto the game surface.
  const mrNievesFrameWidth = 330;
  const mrNievesFrameHeight = 255;
  const mrNievesFrameCanvas = document.createElement("canvas");
  mrNievesFrameCanvas.width = mrNievesFrameWidth;
  mrNievesFrameCanvas.height = mrNievesFrameHeight;
  const mrNievesFrameContext = mrNievesFrameCanvas.getContext("2d", { willReadFrequently: true });
  const mrNievesCropCanvas = document.createElement("canvas");
  const mrNievesCropContext = mrNievesCropCanvas.getContext("2d", { willReadFrequently: true });
  if (mrNievesFrameContext) mrNievesFrameContext.imageSmoothingEnabled = false;
  if (mrNievesCropContext) mrNievesCropContext.imageSmoothingEnabled = false;
  const mrNievesFrameStates = {
    idle0: { stamp: -1, crop: null },
    idle1: { stamp: -1, crop: null },
    run: { stamp: -1, crop: null },
    jump: { stamp: -1, crop: null },
    inAir0: { stamp: -1, crop: null },
    inAir1: { stamp: -1, crop: null },
    celebration0: { stamp: -1, crop: null },
    celebration1: { stamp: -1, crop: null },
    celebration2: { stamp: -1, crop: null },
    celebration3: { stamp: -1, crop: null },
    death0: { stamp: -1, crop: null },
    death1: { stamp: -1, crop: null }
  };
  let mrNievesActiveFrameState = "";
  const deathFrameWidth = 345;
  const deathFrameHeight = 255;
  const deathFrameCanvas = document.createElement("canvas");
  deathFrameCanvas.width = deathFrameWidth;
  deathFrameCanvas.height = deathFrameHeight;
  const deathFrameContext = deathFrameCanvas.getContext("2d", { willReadFrequently: true });
  const deathCropCanvas = document.createElement("canvas");
  const deathCropContext = deathCropCanvas.getContext("2d");
  if (deathFrameContext) deathFrameContext.imageSmoothingEnabled = false;
  if (deathCropContext) deathCropContext.imageSmoothingEnabled = false;
  let deathFrameStamp = -1;
  let deathStableCrop = null;
  const gravity = 0.72;
  const moveSpeed = 4.7;
  const jumpPower = -13.2;
  const deathColtDrawScale = 0.9;
  const maxFairPlatformGap = 166;
  const upwardGapPenalty = 0.58;
  const lavaRockBaseInterval = 1560;
  const lavaRockMinInterval = 780;
  const lavaRockShowerBaseInterval = 8200;
  const lavaRockShowerMinInterval = 5200;
  const getLevelDurationSeconds = () => {
    const baseDuration = Math.min(105, 56 + level * 7);
    return Math.max(40, baseDuration * getDifficultySettings().levelTimeMultiplier);
  };
  const cleanLeaderboardName = name => {
    const cleaned = String(name || "").replace(/[^\w .'-]/g, "").trim().slice(0, 16);
    return cleaned || "Colt";
  };
  const formatRunTime = seconds => {
    const wholeSeconds = Math.max(0, Math.round(Number(seconds) || 0));
    const minutes = Math.floor(wholeSeconds / 60);
    const remainder = String(wholeSeconds % 60).padStart(2, "0");
    return `${minutes}:${remainder}`;
  };
  const compareLeaderboardEntries = (a, b) => (
    (Number(b.coins) || 0) - (Number(a.coins) || 0) ||
    (Number(a.seconds) || 0) - (Number(b.seconds) || 0) ||
    String(a.createdAt || "").localeCompare(String(b.createdAt || ""))
  );
  const normalizeDifficultyMode = mode => difficultyModeNames.includes(mode) ? mode : "medium";
  const getLeaderboardRows = mode => {
    const activeMode = normalizeDifficultyMode(mode);
    return leaderboard
      .filter(entry => entry.difficulty === activeMode)
      .sort(compareLeaderboardEntries)
      .slice(0, 10);
  };
  const normalizeLeaderboard = entries => {
    if (!Array.isArray(entries)) return [];
    return entries
      .map(entry => ({
        name: cleanLeaderboardName(entry.name),
        coins: Math.max(0, Math.round(Number(entry.coins) || 0)),
        seconds: Math.max(0, Math.round(Number(entry.seconds) || 0)),
        difficulty: normalizeDifficultyMode(entry.difficulty),
        createdAt: String(entry.createdAt || new Date().toISOString())
      }))
      .filter(entry => entry.coins > 0)
      .sort((a, b) => (
        normalizeDifficultyMode(a.difficulty).localeCompare(normalizeDifficultyMode(b.difficulty)) ||
        compareLeaderboardEntries(a, b)
      ));
  };
  const loadLeaderboard = () => {
    try {
      return normalizeLeaderboard(JSON.parse(localStorage.getItem(leaderboardStorageKey) || "[]"));
    } catch {
      return [];
    }
  };
  const saveLeaderboard = () => {
    localStorage.setItem(leaderboardStorageKey, JSON.stringify(normalizeLeaderboard(leaderboard)));
  };
  const updateLeaderboardPromptToggle = () => {
    if (!leaderboardPromptToggle) return;
    leaderboardPromptToggle.textContent = `Leaderboard Popups: ${leaderboardPromptsEnabled ? "On" : "Off"}`;
    leaderboardPromptToggle.setAttribute("aria-pressed", String(leaderboardPromptsEnabled));
  };
  const toggleLeaderboardPrompts = () => {
    leaderboardPromptsEnabled = !leaderboardPromptsEnabled;
    localStorage.setItem(leaderboardPromptsStorageKey, leaderboardPromptsEnabled ? "on" : "off");
    updateLeaderboardPromptToggle();
    syncGameStatus();
  };
  const leaderboardQualifies = (coins, seconds, mode = difficultyMode) => {
    if (coins <= 0) return false;
    const activeMode = normalizeDifficultyMode(mode);
    const candidate = { coins, seconds, difficulty: activeMode, createdAt: new Date().toISOString() };
    return normalizeLeaderboard([...leaderboard, candidate])
      .filter(entry => entry.difficulty === activeMode)
      .sort(compareLeaderboardEntries)
      .slice(0, 10)
      .some(entry => (
      entry.coins === candidate.coins &&
      entry.seconds === candidate.seconds &&
      entry.difficulty === candidate.difficulty &&
      entry.createdAt === candidate.createdAt
    ));
  };
  const renderLeaderboardList = () => {
    if (!leaderboardBody) return;
    activeLeaderboardMode = normalizeDifficultyMode(activeLeaderboardMode);
    const rows = getLeaderboardRows(activeLeaderboardMode);
    const modeLabel = difficultyModes[activeLeaderboardMode].label;
    const tabs = difficultyModeNames.map(mode => `
      <button
        type="button"
        data-colt-run="leaderboardMode"
        data-leaderboard-mode="${mode}"
        class="${mode === activeLeaderboardMode ? "is-active" : ""}"
        aria-pressed="${mode === activeLeaderboardMode ? "true" : "false"}"
      >${difficultyModes[mode].label}</button>
    `).join("");
    if (!rows.length) {
      leaderboardBody.innerHTML = `
        <div class="colt-run-leaderboard-tabs" role="group" aria-label="Leaderboard difficulty">${tabs}</div>
        <p class="colt-run-leaderboard-empty">No ${modeLabel} coin runs yet.</p>
      `;
    } else {
      leaderboardBody.innerHTML = `
        <div class="colt-run-leaderboard-tabs" role="group" aria-label="Leaderboard difficulty">${tabs}</div>
        <ol class="colt-run-leaderboard-list">
          ${rows.map(entry => `
            <li>
              <strong>${escapeHtml(entry.name)}</strong>
              <span>${entry.coins} coins</span>
              <em>${formatRunTime(entry.seconds)}</em>
            </li>
          `).join("")}
        </ol>
      `;
    }
    if (leaderboardForm) leaderboardForm.hidden = !pendingLeaderboardEntry;
    const closeButton = leaderboardPanel ? leaderboardPanel.querySelector('[data-colt-run="closeLeaderboard"]') : null;
    if (closeButton) {
      closeButton.disabled = false;
      closeButton.textContent = pendingLeaderboardEntry ? "Back" : "Close";
    }
  };
  const openLeaderboard = () => {
    if (!leaderboardPanel) return;
    activeLeaderboardMode = normalizeDifficultyMode(pendingLeaderboardEntry?.difficulty || difficultyMode);
    renderLeaderboardList();
    syncSharedLeaderboard();
    if (leaderboardPanel.hidden) leaderboardOpenedAt = performance.now();
    leaderboardPanel.hidden = false;
    if (pendingLeaderboardEntry && leaderboardNameInput) {
      leaderboardNameInput.value = "";
      setTimeout(() => leaderboardNameInput.focus({ preventScroll: true }), 0);
    }
  };
  const closeLeaderboard = () => {
    if (!leaderboardPanel) return;
    if (pendingLeaderboardEntry) {
      pendingLeaderboardEntry = null;
      if (leaderboardNameInput) leaderboardNameInput.value = "";
      if (leaderboardForm) leaderboardForm.hidden = true;
      syncGameStatus();
    }
    if (leaderboardOpenedAt && !won && !lost) {
      levelStart += performance.now() - leaderboardOpenedAt;
    }
    leaderboardOpenedAt = 0;
    leaderboardPanel.hidden = true;
    canvas.focus({ preventScroll: true });
  };
  const savePendingLeaderboardEntry = name => {
    if (!pendingLeaderboardEntry) return;
    const entryMode = normalizeDifficultyMode(pendingLeaderboardEntry.difficulty);
    const entry = {
      name: cleanLeaderboardName(name),
      coins: pendingLeaderboardEntry.coins,
      seconds: pendingLeaderboardEntry.seconds,
      difficulty: entryMode,
      createdAt: new Date().toISOString()
    };
    leaderboard = normalizeLeaderboard([
      ...leaderboard,
      entry
    ]);
    pendingLeaderboardEntry = null;
    activeLeaderboardMode = entryMode;
    saveLeaderboard();
    renderLeaderboardList();
    syncGameStatus();
    if (sharedBackend.enabled) {
      sharedBackend.submitLeaderboardEntry(entry).then(result => {
        leaderboard = normalizeLeaderboard(result && result.leaderboards);
        saveLeaderboard();
        if (leaderboardPanel && !leaderboardPanel.hidden) renderLeaderboardList();
      }).catch(() => {
        syncGameStatus();
      });
    }
    if (leaderboardNameInput) leaderboardNameInput.value = "";
  };
  let leaderboardSyncPromise = null;
  const syncSharedLeaderboard = () => {
    if (!sharedBackend.enabled) return Promise.resolve(leaderboard);
    if (leaderboardSyncPromise) return leaderboardSyncPromise;
    const localEntries = loadLeaderboard();
    const shouldImport = !localStorage.getItem(leaderboardMigrationKey) && localEntries.length > 0;
    leaderboardSyncPromise = (shouldImport
      ? sharedBackend.importLeaderboards(localEntries)
      : sharedBackend.loadLeaderboards())
      .then(result => {
        leaderboard = normalizeLeaderboard(result && result.leaderboards);
        saveLeaderboard();
        localStorage.setItem(leaderboardMigrationKey, "true");
        if (leaderboardPanel && !leaderboardPanel.hidden) renderLeaderboardList();
        return leaderboard;
      })
      .catch(() => leaderboard)
      .finally(() => {
        leaderboardSyncPromise = null;
      });
    return leaderboardSyncPromise;
  };
  leaderboard = loadLeaderboard();
  syncSharedLeaderboard();

  const setupAmbientBoost = () => {
    if (!AudioContextClass || ambientSourceNode) return;
    try {
      ambientAudioContext = new AudioContextClass();
      ambientSourceNode = ambientAudioContext.createMediaElementSource(ambientAudio);
      ambientGainNode = ambientAudioContext.createGain();
      ambientGainNode.gain.value = musicMuted ? 0 : ambientBoostGain;
      ambientSourceNode.connect(ambientGainNode);
      ambientGainNode.connect(ambientAudioContext.destination);
    } catch {
      ambientAudioContext = null;
      ambientGainNode = null;
      ambientSourceNode = null;
    }
  };
  const applyAmbientBoost = () => {
    if (ambientGainNode) ambientGainNode.gain.value = musicMuted ? 0 : ambientBoostGain;
  };
  const applyInGameMusicVolume = () => {
    const trackGain = currentInGameMusicTrack ? currentInGameMusicTrack.gain : 1;
    inGameMusic.volume = musicMuted ? 0 : Math.min(1, musicVolume * inGameMusicLayerVolume * trackGain);
    inGameMusic.muted = musicMuted;
  };
  const chooseNextInGameMusic = () => {
    const previousTrackId = currentInGameMusicTrack
      ? currentInGameMusicTrack.id
      : localStorage.getItem(lastInGameMusicTrackStorageKey);
    const nonRepeatingChoices = inGameMusicTracks.filter(track => track.id !== previousTrackId);
    const choices = nonRepeatingChoices.length ? nonRepeatingChoices : inGameMusicTracks;
    currentInGameMusicTrack = choices[Math.floor(Math.random() * choices.length)];
    localStorage.setItem(lastInGameMusicTrackStorageKey, currentInGameMusicTrack.id);
    inGameMusic.pause();
    inGameMusic.removeAttribute("src");
    inGameMusic.dataset.src = currentInGameMusicTrack.source;
    ensureMediaSource(inGameMusic);
    applyInGameMusicVolume();
  };
  const playInGameMusic = (advance = false) => {
    if (musicMuted || musicVolume <= 0) return;
    if (advance || inGameMusic.ended || !currentInGameMusicTrack || !inGameMusic.getAttribute("src")) {
      chooseNextInGameMusic();
    }
    inGameMusic.play().catch(() => {});
  };
  const onInGameMusicEnded = () => playInGameMusic(true);
  inGameMusic.addEventListener("ended", onInGameMusicEnded);
  const playColtRunAudio = () => {
    if (musicMuted || musicVolume <= 0) return;
    if (initialCharacterSelectionPending && characterSelectOpen) {
      inGameMusic.pause();
      ensureMediaSource(characterSelectMusic);
      characterSelectMusic.play().catch(() => {});
      return;
    }
    ensureMediaSource(ambientAudio);
    setupAmbientBoost();
    if (ambientAudioContext && ambientAudioContext.state === "suspended") {
      ambientAudioContext.resume().catch(() => {});
    }
    ambientAudio.play().catch(() => {});
    playInGameMusic();
  };
  const stopRunningAudio = () => {
    runningAudio.pause();
    mrNievesRunningAudio.pause();
    try {
      runningAudio.currentTime = 0;
      mrNievesRunningAudio.currentTime = 0;
    } catch {}
  };
  const gameplayCueAudios = [coinPickupAudio, getReadyAudio, nextLevelAudio];
  const stopAndRewindAudio = audio => {
    audio.pause();
    try {
      audio.currentTime = 0;
    } catch {}
  };
  const stopGameplayCues = () => gameplayCueAudios.forEach(stopAndRewindAudio);
  const playGameplayCue = audio => {
    if (musicMuted || musicVolume <= 0) return;
    ensureMediaSource(audio);
    try {
      audio.currentTime = 0;
    } catch {}
    audio.play().catch(() => {});
  };
  const playColtDeathAudio = () => {
    if (musicMuted || musicVolume <= 0) return;
    const nextIndex = chooseNonRepeatingAudioIndex(
      coltDeathAudios.length,
      lastColtDeathAudioIndex
    );
    lastColtDeathAudioIndex = nextIndex;
    playExclusiveAudio(coltDeathAudios, nextIndex);
  };
  const playColtCelebrationAudio = () => {
    if (musicMuted || musicVolume <= 0) return;
    const nextIndex = chooseNonRepeatingAudioIndex(
      coltCelebrationAudios.length,
      lastColtCelebrationAudioIndex
    );
    lastColtCelebrationAudioIndex = nextIndex;
    playExclusiveAudio(coltCelebrationAudios, nextIndex);
  };
  const chooseNonRepeatingAudioIndex = (audioCount, lastIndex) => {
    let nextIndex = Math.floor(Math.random() * audioCount);
    if (audioCount > 1 && nextIndex === lastIndex) {
      nextIndex = (nextIndex + 1 + Math.floor(Math.random() * (audioCount - 1))) % audioCount;
    }
    return nextIndex;
  };
  const playExclusiveAudio = (audios, activeIndex) => {
    const activeAudio = audios[activeIndex];
    audios.forEach((audio, index) => {
      if (index === activeIndex) return;
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch {}
    });
    ensureMediaSource(activeAudio);
    try {
      activeAudio.currentTime = 0;
    } catch {}
    activeAudio.play().catch(() => {});
  };
  const playMrNievesDeathAudio = () => {
    if (musicMuted || musicVolume <= 0) return;
    const nextIndex = chooseNonRepeatingAudioIndex(
      mrNievesDeathAudios.length,
      lastMrNievesDeathAudioIndex
    );
    lastMrNievesDeathAudioIndex = nextIndex;
    playExclusiveAudio(mrNievesDeathAudios, nextIndex);
  };
  const playMrNievesCelebrationAudio = () => {
    if (musicMuted || musicVolume <= 0) return;
    const nextIndex = chooseNonRepeatingAudioIndex(
      mrNievesCelebrationAudios.length,
      lastMrNievesCelebrationAudioIndex
    );
    lastMrNievesCelebrationAudioIndex = nextIndex;
    playExclusiveAudio(mrNievesCelebrationAudios, nextIndex);
  };
  const syncRunningAudio = () => {
    const shouldRunAudio = !musicMuted && musicVolume > 0 && !won && !lost && player.state === "run";
    if (shouldRunAudio) {
      const activeRunningAudio = selectedCharacter === "mrNieves" ? mrNievesRunningAudio : runningAudio;
      const inactiveRunningAudio = selectedCharacter === "mrNieves" ? runningAudio : mrNievesRunningAudio;
      ensureMediaSource(activeRunningAudio);
      if (!inactiveRunningAudio.paused) {
        inactiveRunningAudio.pause();
        try {
          inactiveRunningAudio.currentTime = 0;
        } catch {}
      }
      if (activeRunningAudio.paused) activeRunningAudio.play().catch(() => {});
    } else if (!runningAudio.paused || !mrNievesRunningAudio.paused) {
      stopRunningAudio();
    }
  };
  const updateMusicVolumeUi = () => {
    const activeVolume = musicMuted ? 0 : musicVolume;
    const percent = Math.round(activeVolume * 100);
    if (musicVolumeSlider) {
      musicVolumeSlider.value = String(percent);
      musicVolumeSlider.style.setProperty("--volume", `${percent}%`);
    }
    if (musicToggleButton) {
      musicToggleButton.textContent = percent <= 0 ? "🔇" : percent < 45 ? "🔉" : "🔊";
      musicToggleButton.setAttribute("aria-label", percent <= 0 ? "Turn game audio on" : "Turn game audio off");
      musicToggleButton.classList.toggle("is-muted", percent <= 0);
    }
  };
  const applyMusicVolume = (persist = true) => {
    ambientAudio.volume = musicMuted ? 0 : musicVolume * ambientLayerVolume;
    ambientAudio.muted = musicMuted;
    applyInGameMusicVolume();
    characterSelectMusicTracks.forEach(audio => {
      audio.volume = musicMuted ? 0 : musicVolume * characterSelectMusicLayerVolume;
      audio.muted = musicMuted;
    });
    runningAudio.volume = musicMuted ? 0 : musicVolume * runningLayerVolume;
    runningAudio.muted = musicMuted;
    mrNievesRunningAudio.volume = musicMuted ? 0 : musicVolume * runningLayerVolume;
    mrNievesRunningAudio.muted = musicMuted;
    gameplayCueAudios.forEach((audio, index) => {
      audio.volume = musicMuted
        ? 0
        : Math.min(1, musicVolume * gameplayCueLayerVolume * gameplayCueVolumeMultipliers[index]);
      audio.muted = musicMuted;
    });
    coltDeathAudios.forEach(audio => {
      audio.volume = musicMuted ? 0 : musicVolume * coltDeathLayerVolume;
      audio.muted = musicMuted;
    });
    coltCelebrationAudios.forEach(audio => {
      audio.volume = musicMuted ? 0 : musicVolume * coltCelebrationLayerVolume;
      audio.muted = musicMuted;
    });
    mrNievesDeathAudios.forEach(audio => {
      audio.volume = musicMuted ? 0 : musicVolume * mrNievesDeathLayerVolume;
      audio.muted = musicMuted;
    });
    mrNievesCelebrationAudios.forEach((audio, index) => {
      audio.volume = musicMuted
        ? 0
        : Math.min(1, musicVolume * mrNievesCelebrationLayerVolume * mrNievesCelebrationVolumeMultipliers[index]);
      audio.muted = musicMuted;
    });
    applyAmbientBoost();
    if (persist) localStorage.setItem(musicVolumeStorageKey, String(musicMuted ? 0 : musicVolume));
    updateMusicVolumeUi();
  };
  const setMusicVolumeFromSlider = value => {
    const nextVolume = Math.max(0, Math.min(1, Number(value) / 100 || 0));
    musicVolume = nextVolume;
    musicMuted = nextVolume <= 0;
    if (nextVolume > 0) lastAudibleMusicVolume = nextVolume;
    applyMusicVolume();
    if (musicMuted) {
      ambientAudio.pause();
      inGameMusic.pause();
      characterSelectMusicTracks.forEach(audio => audio.pause());
      stopRunningAudio();
      stopGameplayCues();
      coltDeathAudios.forEach(audio => audio.pause());
      coltCelebrationAudios.forEach(audio => audio.pause());
      mrNievesDeathAudios.forEach(audio => audio.pause());
      mrNievesCelebrationAudios.forEach(audio => audio.pause());
    }
    else playColtRunAudio();
  };
  const toggleMusic = () => {
    if (musicMuted || musicVolume <= 0) {
      musicMuted = false;
      musicVolume = lastAudibleMusicVolume || 0.42;
      applyMusicVolume();
      playColtRunAudio();
    } else {
      musicMuted = true;
      applyMusicVolume();
      ambientAudio.pause();
      inGameMusic.pause();
      characterSelectMusicTracks.forEach(audio => audio.pause());
      stopRunningAudio();
      stopGameplayCues();
      coltDeathAudios.forEach(audio => audio.pause());
      coltCelebrationAudios.forEach(audio => audio.pause());
      mrNievesDeathAudios.forEach(audio => audio.pause());
      mrNievesCelebrationAudios.forEach(audio => audio.pause());
    }
  };
  const onMusicVolumeInput = event => setMusicVolumeFromSlider(event.target.value);
  const onMusicVolumePointerDown = () => playColtRunAudio();
  applyMusicVolume(false);
  if (musicVolumeSlider) {
    musicVolumeSlider.addEventListener("input", onMusicVolumeInput);
    musicVolumeSlider.addEventListener("pointerdown", onMusicVolumePointerDown);
  }

  const keepCoinVideoPlaying = () => {
    ensureMediaSource(coinVideo, "metadata");
    if (!coinVideo.paused) return;
    coinVideo.play().catch(() => {});
  };

  const keepFlagVideoPlaying = () => {
    ensureMediaSource(flagVideo, "metadata");
    if (!flagVideo.paused) return;
    flagVideo.play().catch(() => {});
  };

  const keepIdleVideoPlaying = () => {
    const idleVideo = getColtIdleVideo();
    ensureMediaSource(idleVideo);
    if (!idleVideo.paused) return;
    idleVideo.play().catch(() => {});
  };

  const chooseColtIdleVideo = () => {
    coltIdleIndex = (coltIdleIndex + 1) % coltIdleVideos.length;
    const video = getColtIdleVideo();
    ensureMediaSource(video);
    try {
      video.currentTime = 0;
    } catch {}
    return video;
  };

  const keepRunVideoPlaying = () => {
    ensureMediaSource(runVideo);
    if (!runVideo.paused) return;
    runVideo.play().catch(() => {});
  };

  const keepLeapVideoPlaying = () => {
    ensureMediaSource(leapVideo);
    if (!leapVideo.paused) return;
    leapVideo.play().catch(() => {});
  };

  const keepColtCelebrationVideoPlaying = () => {
    ensureMediaSource(coltCelebrationVideo);
    if (!coltCelebrationVideo.paused) return;
    coltCelebrationVideo.play().catch(() => {});
  };

  const mrNievesIdlePlaybackProgress = new WeakMap();
  const keepMrNievesIdleVideoPlaying = () => {
    const mrNievesIdleVideo = getMrNievesIdleVideo();
    ensureMediaSource(mrNievesIdleVideo);
    const now = performance.now();
    const currentTime = Number.isFinite(mrNievesIdleVideo.currentTime) ? mrNievesIdleVideo.currentTime : 0;
    const previousProgress = mrNievesIdlePlaybackProgress.get(mrNievesIdleVideo);
    const playbackAdvanced = !previousProgress || Math.abs(currentTime - previousProgress.currentTime) > 0.01;
    if (mrNievesIdleVideo.paused || mrNievesIdleVideo.seeking || mrNievesIdleVideo.readyState < 2 || playbackAdvanced) {
      mrNievesIdlePlaybackProgress.set(mrNievesIdleVideo, { currentTime, checkedAt: now });
    } else if (!mrNievesIdleVideo.ended && now - previousProgress.checkedAt > 1100) {
      try {
        const duration = Number.isFinite(mrNievesIdleVideo.duration) ? mrNievesIdleVideo.duration : 0;
        mrNievesIdleVideo.currentTime = duration && currentTime >= duration - 0.08 ? 0 : currentTime + 0.001;
      } catch {}
      mrNievesIdlePlaybackProgress.set(mrNievesIdleVideo, {
        currentTime: mrNievesIdleVideo.currentTime,
        checkedAt: now
      });
      mrNievesIdleVideo.pause();
    }
    if (mrNievesIdleVideo.paused) mrNievesIdleVideo.play().catch(() => {});
  };

  const keepMrNievesRunVideoPlaying = () => {
    ensureMediaSource(mrNievesRunVideo);
    if (!mrNievesRunVideo.paused) return;
    mrNievesRunVideo.play().catch(() => {});
  };

  const keepMrNievesInAirVideoPlaying = () => {
    const mrNievesInAirVideo = getMrNievesInAirVideo();
    ensureMediaSource(mrNievesInAirVideo);
    if (!mrNievesInAirVideo.paused) return;
    mrNievesInAirVideo.play().catch(() => {});
  };

  const chooseMrNievesInAirVideo = () => {
    mrNievesInAirIndex = (mrNievesInAirIndex + 1) % mrNievesInAirVideos.length;
    const video = getMrNievesInAirVideo();
    ensureMediaSource(video);
    try {
      video.currentTime = 0;
    } catch {}
    return video;
  };

  const keepMrNievesCelebrationVideoPlaying = () => {
    const mrNievesCelebrationVideo = getMrNievesCelebrationVideo();
    ensureMediaSource(mrNievesCelebrationVideo);
    if (!mrNievesCelebrationVideo.paused) return;
    mrNievesCelebrationVideo.play().catch(() => {});
  };

  const chooseMrNievesIdleVideo = () => {
    let nextIndex = Math.floor(Math.random() * mrNievesIdleVideos.length);
    if (mrNievesIdleVideos.length > 1 && nextIndex === lastMrNievesIdleIndex) {
      nextIndex = (nextIndex + 1 + Math.floor(Math.random() * (mrNievesIdleVideos.length - 1))) % mrNievesIdleVideos.length;
    }
    mrNievesIdleIndex = nextIndex;
    lastMrNievesIdleIndex = nextIndex;
    const video = getMrNievesIdleVideo();
    ensureMediaSource(video);
    try {
      video.currentTime = 0;
    } catch {}
    return video;
  };

  const chooseMrNievesCelebrationVideo = () => {
    let nextIndex = Math.floor(Math.random() * mrNievesCelebrationVideos.length);
    if (mrNievesCelebrationVideos.length > 1 && nextIndex === lastMrNievesCelebrationIndex) {
      nextIndex = (nextIndex + 1 + Math.floor(Math.random() * (mrNievesCelebrationVideos.length - 1))) % mrNievesCelebrationVideos.length;
    }
    mrNievesCelebrationIndex = nextIndex;
    lastMrNievesCelebrationIndex = nextIndex;
    const video = getMrNievesCelebrationVideo();
    ensureMediaSource(video);
    try {
      video.currentTime = 0;
    } catch {}
    return video;
  };

  const keepMrNievesDeathVideoPlaying = () => {
    const mrNievesDeathVideo = getMrNievesDeathVideo();
    ensureMediaSource(mrNievesDeathVideo);
    if (!mrNievesDeathVideo.paused) return;
    mrNievesDeathVideo.play().catch(() => {});
  };

  const chooseMrNievesDeathVideo = () => {
    mrNievesDeathIndex = (mrNievesDeathIndex + 1) % mrNievesDeathVideos.length;
    const video = getMrNievesDeathVideo();
    ensureMediaSource(video);
    try {
      video.currentTime = 0;
    } catch {}
    return video;
  };

  const keepDeathVideoPlaying = () => {
    ensureMediaSource(deathVideo);
    if (!deathVideo.paused) return;
    deathVideo.play().catch(() => {});
  };
  const characterAnimationVideos = [
    ...coltIdleVideos,
    runVideo,
    leapVideo,
    coltCelebrationVideo,
    ...mrNievesIdleVideos,
    mrNievesRunVideo,
    ...mrNievesInAirVideos,
    ...mrNievesCelebrationVideos,
    ...mrNievesDeathVideos,
    deathVideo
  ];
  let characterPlaybackKey = "";
  const syncCharacterVideoPlayback = (force = false) => {
    let activeVideos = [];
    let nextKey = "hidden";
    if (!document.hidden) {
      if (characterSelectOpen) {
        nextKey = `character-select:${coltIdleIndex}:${mrNievesIdleIndex}`;
        activeVideos = [getColtIdleVideo(), getMrNievesIdleVideo()];
      } else if (lost) {
        nextKey = selectedCharacter === "mrNieves"
          ? `death:mrNieves:${mrNievesDeathIndex}`
          : "death:colt";
        activeVideos = [selectedCharacter === "mrNieves" ? getMrNievesDeathVideo() : deathVideo];
      } else if (selectedCharacter === "mrNieves") {
        nextKey = `mrNieves:${player.state}`;
        if (player.state === "run") activeVideos = [mrNievesRunVideo];
        else if (player.state === "leap") {
          nextKey = `mrNieves:leap:${mrNievesInAirIndex}`;
          activeVideos = [getMrNievesInAirVideo()];
        }
        else if (player.state === "celebrate") {
          nextKey = `mrNieves:celebrate:${mrNievesCelebrationIndex}`;
          activeVideos = [getMrNievesCelebrationVideo()];
        }
        else {
          nextKey = `mrNieves:idle:${mrNievesIdleIndex}`;
          activeVideos = [getMrNievesIdleVideo()];
        }
      } else if (player.state === "run") {
        nextKey = "colt:run";
        activeVideos = [runVideo];
      } else if (player.state === "leap") {
        nextKey = "colt:leap";
        activeVideos = [leapVideo];
      } else if (player.state === "celebrate") {
        nextKey = "colt:celebrate";
        activeVideos = [coltCelebrationVideo];
      } else if (player.state !== "jumpPrep") {
        nextKey = `colt:idle:${coltIdleIndex}`;
        activeVideos = [getColtIdleVideo()];
      } else {
        nextKey = "colt:jump-prep";
      }
    }
    if (!force && nextKey === characterPlaybackKey) return;
    characterPlaybackKey = nextKey;
    const activeVideoSet = new Set(activeVideos);
    characterAnimationVideos.forEach(video => {
      if (activeVideoSet.has(video)) {
        ensureMediaSource(video);
        if (video.paused) video.play().catch(() => {});
      } else if (!video.paused) {
        video.pause();
      }
    });
  };
  characterAnimationVideos.forEach(video => {
    video.addEventListener("canplay", () => syncCharacterVideoPlayback(true));
  });
  coltIdleVideos.forEach(video => {
    video.addEventListener("ended", () => {
      if (video !== getColtIdleVideo()) return;
      chooseColtIdleVideo();
      characterPlaybackKey = "";
      syncCharacterVideoPlayback(true);
    });
  });
  mrNievesIdleVideos.forEach(video => {
    video.addEventListener("ended", () => {
      if (video !== getMrNievesIdleVideo()) return;
      chooseMrNievesIdleVideo();
      characterPlaybackKey = "";
      syncCharacterVideoPlayback(true);
    });
  });

  const getLavaRockVideoSpecial = index => lavaRockVideoSpecials[index] || lavaRockVideoSpecials[0];

  const keepLavaRockVideoSpecialPlaying = (index = 0) => {
    const video = getLavaRockVideoSpecial(index);
    ensureMediaSource(video);
    if (!video || !video.paused) return;
    video.play().catch(() => {});
  };
  lavaRockVideoSpecials.forEach((video, index) => {
    video.addEventListener("canplay", () => {
      if (!document.hidden && fallingLavaRocks.some(rock => rock.videoSpecial && rock.videoSpecialIndex === index)) {
        keepLavaRockVideoSpecialPlaying(index);
      }
    });
  });

  const keepBackgroundVideoPlaying = video => {
    ensureMediaSource(video, "metadata");
    if (!video || !video.paused) return;
    video.play().catch(() => {});
  };
  animatedBackgroundVideos.forEach((video, index) => {
    video.addEventListener("canplay", () => {
      if (!document.hidden && index === currentBackgroundIndex) keepBackgroundVideoPlaying(video);
      else if (!video.paused) video.pause();
    });
  });

  const getTransparentCoinFrame = () => {
    if (coinVideo.readyState < 2 || !coinFrameContext) return null;
    const frameStamp = getDecodedVideoFrameStamp(coinVideo);
    if (frameStamp === coinFrameStamp) return coinFrameCanvas;
    const sourceW = coinVideo.videoWidth || coinFrameSize;
    const sourceH = coinVideo.videoHeight || coinFrameSize;
    const sourceRatio = sourceW / sourceH;
    let sx = 0;
    let sy = 0;
    let sw = sourceW;
    let sh = sourceH;
    if (sourceRatio > 1) {
      sw = sourceH;
      sx = (sourceW - sw) / 2;
    } else if (sourceRatio < 1) {
      sh = sourceW;
      sy = (sourceH - sh) / 2;
    }
    coinFrameContext.clearRect(0, 0, coinFrameSize, coinFrameSize);
    coinFrameContext.drawImage(coinVideo, sx, sy, sw, sh, 0, 0, coinFrameSize, coinFrameSize);
    const frame = coinFrameContext.getImageData(0, 0, coinFrameSize, coinFrameSize);
    const pixels = frame.data;
    const center = coinFrameSize / 2;
    const coinRadius = coinFrameSize * 0.49;
    const softEdge = coinFrameSize * 0.025;
    for (let index = 0; index < pixels.length; index += 4) {
      const pixelIndex = index / 4;
      const pixelX = pixelIndex % coinFrameSize;
      const pixelY = Math.floor(pixelIndex / coinFrameSize);
      const distanceFromCenter = Math.hypot(pixelX - center, pixelY - center);
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      const brightest = Math.max(red, green, blue);
      const darkest = Math.min(red, green, blue);
      const average = (red + green + blue) / 3;
      const whiteBackdrop = average > 214 && brightest - darkest < 58;
      if (whiteBackdrop) {
        pixels[index + 3] = 0;
      } else if (distanceFromCenter > coinRadius) {
        pixels[index + 3] = 0;
      } else if (distanceFromCenter > coinRadius - softEdge) {
        const fade = Math.max(0, Math.min(1, (coinRadius - distanceFromCenter) / softEdge));
        pixels[index + 3] = Math.round(pixels[index + 3] * fade);
      }
    }
    coinFrameContext.putImageData(frame, 0, 0);
    coinFrameStamp = frameStamp;
    return coinFrameCanvas;
  };

  const getTransparentFlagFrame = () => {
    if (flagVideo.readyState < 2 || !flagFrameContext) return null;
    const frameStamp = getDecodedVideoFrameStamp(flagVideo);
    if (frameStamp === flagFrameStamp) return flagFrameCanvas;
    const sourceW = flagVideo.videoWidth || flagFrameSize;
    const sourceH = flagVideo.videoHeight || flagFrameSize;
    const sourceRatio = sourceW / sourceH;
    let drawW = flagFrameSize;
    let drawH = flagFrameSize;
    let drawX = 0;
    let drawY = 0;
    if (sourceRatio > 1) {
      drawH = flagFrameSize / sourceRatio;
      drawY = (flagFrameSize - drawH) / 2;
    } else if (sourceRatio < 1) {
      drawW = flagFrameSize * sourceRatio;
      drawX = (flagFrameSize - drawW) / 2;
    }
    flagFrameContext.clearRect(0, 0, flagFrameSize, flagFrameSize);
    flagFrameContext.drawImage(flagVideo, drawX, drawY, drawW, drawH);
    const frame = flagFrameContext.getImageData(0, 0, flagFrameSize, flagFrameSize);
    const pixels = frame.data;
    const isBackgroundPixel = pixelIndex => {
      const offset = pixelIndex * 4;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      const brightest = Math.max(red, green, blue);
      const darkest = Math.min(red, green, blue);
      const average = (red + green + blue) / 3;
      const paleBackdrop = average > 150 && brightest - darkest < 118;
      const whiteBackdrop = average > 214 && brightest - darkest < 70;
      return paleBackdrop || whiteBackdrop;
    };
    const transparent = new Uint8Array(flagFrameSize * flagFrameSize);
    const queue = [];
    const addPixel = (x, y) => {
      if (x < 0 || x >= flagFrameSize || y < 0 || y >= flagFrameSize) return;
      const pixelIndex = y * flagFrameSize + x;
      if (transparent[pixelIndex] || !isBackgroundPixel(pixelIndex)) return;
      transparent[pixelIndex] = 1;
      queue.push(pixelIndex);
    };
    for (let i = 0; i < flagFrameSize; i += 1) {
      addPixel(i, 0);
      addPixel(i, flagFrameSize - 1);
      addPixel(0, i);
      addPixel(flagFrameSize - 1, i);
    }
    while (queue.length) {
      const pixelIndex = queue.pop();
      const x = pixelIndex % flagFrameSize;
      const y = Math.floor(pixelIndex / flagFrameSize);
      addPixel(x - 1, y);
      addPixel(x + 1, y);
      addPixel(x, y - 1);
      addPixel(x, y + 1);
    }
    for (let pixelIndex = 0; pixelIndex < transparent.length; pixelIndex += 1) {
      const offset = pixelIndex * 4;
      const x = pixelIndex % flagFrameSize;
      const y = Math.floor(pixelIndex / flagFrameSize);
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      const brightest = Math.max(red, green, blue);
      const darkest = Math.min(red, green, blue);
      const average = (red + green + blue) / 3;
      const lowColorRange = brightest - darkest < 112;
      const protectEmblem = x > 45 && x < 78 && y > 40 && y < 82;
      const protectFlag = red > green * 1.12 && red > blue * 1.08 && red > 68;
      const protectDarkPole = average < 82 && darkest < 64;
      if (transparent[pixelIndex] || (!protectEmblem && !protectFlag && !protectDarkPole && average > 136 && lowColorRange)) {
        pixels[offset + 3] = 0;
      }
    }
    flagFrameContext.putImageData(frame, 0, 0);
    flagFrameStamp = frameStamp;
    return flagFrameCanvas;
  };

  const cleanColtBackdropHalo = (pixels, width, height, protectPaleDetails = false) => {
    const isProtectedColtPixel = pixelIndex => {
      const offset = pixelIndex * 4;
      if (pixels[offset + 3] < 16) return false;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      const brightest = Math.max(red, green, blue);
      const darkest = Math.min(red, green, blue);
      const average = (red + green + blue) / 3;
      const chroma = brightest - darkest;
      const vividColtRed = red > 66 && red > green * 1.6 && red > blue * 1.4 && chroma > 50;
      const deepColtRed = red > 38 && red > green * 1.9 && red > blue * 1.6 && chroma > 34;
      const redHighlight = red > 120 && red > green * 1.35 && red > blue * 1.25;
      const blackOutline = average < 20 || (average < 34 && darkest < 24 && chroma < 12);
      const silverHoof = average > 54 && average < 170 && chroma < 54 && green >= red - 18 && blue >= red - 12;
      const paleMarking =
        protectPaleDetails &&
        average > 92 &&
        red > 104 &&
        green > 52 &&
        blue > 48 &&
        red > green * 1.03 &&
        red > blue * 1.03;
      return vividColtRed || deepColtRed || redHighlight || blackOutline || silverHoof || paleMarking;
    };
    const isResidualBackdrop = pixelIndex => {
      const offset = pixelIndex * 4;
      if (pixels[offset + 3] < 16 || isProtectedColtPixel(pixelIndex)) return false;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      const brightest = Math.max(red, green, blue);
      const darkest = Math.min(red, green, blue);
      const average = (red + green + blue) / 3;
      const chroma = brightest - darkest;
      const muddyBrown = average > 12 && average < 188 && red >= green * 1.08 && red >= blue * 1.12 && chroma < 88;
      const mutedGray = average > 20 && average < 170 && chroma < 45;
      return muddyBrown || mutedGray;
    };
    for (let pass = 0; pass < 12; pass += 1) {
      const toClear = [];
      for (let pixelIndex = 0; pixelIndex < width * height; pixelIndex += 1) {
        if (!isResidualBackdrop(pixelIndex)) continue;
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        let touchesTransparent = false;
        for (let dy = -1; dy <= 1 && !touchesTransparent; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if (!dx && !dy) continue;
            const nextX = x + dx;
            const nextY = y + dy;
            if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height || pixels[(nextY * width + nextX) * 4 + 3] < 16) {
              touchesTransparent = true;
              break;
            }
          }
        }
        if (touchesTransparent) toClear.push(pixelIndex);
      }
      if (!toClear.length) break;
      toClear.forEach(index => {
        pixels[index * 4 + 3] = 0;
      });
    }
    const interiorResiduals = [];
    for (let pixelIndex = 0; pixelIndex < width * height; pixelIndex += 1) {
      if (!isResidualBackdrop(pixelIndex)) continue;
      interiorResiduals.push(pixelIndex);
    }
    interiorResiduals.forEach(pixelIndex => {
      pixels[pixelIndex * 4 + 3] = 0;
    });
  };

  const cleanIdleGreenScreenSpill = (pixels, width, height, clearInterior = false) => {
    const isResidualGreen = pixelIndex => {
      const offset = pixelIndex * 4;
      if (pixels[offset + 3] < 16) return false;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      return (
        green > 32 &&
        green > red * 1.08 &&
        green > blue * 1.04 &&
        green - red > 7
      );
    };
    const isObviousGreen = pixelIndex => {
      const offset = pixelIndex * 4;
      if (pixels[offset + 3] < 16) return false;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      return (
        green > 54 &&
        green > red * 1.22 &&
        green > blue * 1.12 &&
        green - red > 20
      );
    };
    for (let pixelIndex = 0; pixelIndex < width * height; pixelIndex += 1) {
      if (isObviousGreen(pixelIndex)) pixels[pixelIndex * 4 + 3] = 0;
    }
    for (let pass = 0; pass < 4; pass += 1) {
      const toClear = [];
      for (let pixelIndex = 0; pixelIndex < width * height; pixelIndex += 1) {
        if (!isResidualGreen(pixelIndex)) continue;
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        let touchesTransparent = false;
        for (let dy = -1; dy <= 1 && !touchesTransparent; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if (!dx && !dy) continue;
            const nextX = x + dx;
            const nextY = y + dy;
            if (
              nextX < 0 ||
              nextX >= width ||
              nextY < 0 ||
              nextY >= height ||
              pixels[(nextY * width + nextX) * 4 + 3] < 16
            ) {
              touchesTransparent = true;
              break;
            }
          }
        }
        if (touchesTransparent) toClear.push(pixelIndex);
      }
      if (!toClear.length) break;
      toClear.forEach(pixelIndex => {
        pixels[pixelIndex * 4 + 3] = 0;
      });
    }
    if (!clearInterior) return;
    for (let pixelIndex = 0; pixelIndex < width * height; pixelIndex += 1) {
      if (isResidualGreen(pixelIndex)) pixels[pixelIndex * 4 + 3] = 0;
    }
  };

  const getTransparentIdleFrame = () => {
    const idleVideo = getColtIdleVideo();
    const idleFrameState = idleFrameStates[coltIdleIndex];
    if (idleVideo.readyState < 2 || !idleFrameContext) return null;
    const frameStamp = getDecodedVideoFrameStamp(idleVideo);
    if (frameStamp === idleFrameState.stamp) return idleFrameCanvas;
    const sourceW = idleVideo.videoWidth || idleFrameWidth;
    const sourceH = idleVideo.videoHeight || idleFrameHeight;
    const sourceRatio = sourceW / sourceH;
    const targetRatio = idleFrameWidth / idleFrameHeight;
    let drawW = idleFrameWidth;
    let drawH = idleFrameHeight;
    let drawX = 0;
    let drawY = 0;
    if (sourceRatio > targetRatio) {
      drawH = idleFrameWidth / sourceRatio;
      drawY = (idleFrameHeight - drawH) / 2;
    } else if (sourceRatio < targetRatio) {
      drawW = idleFrameHeight * sourceRatio;
      drawX = (idleFrameWidth - drawW) / 2;
    }
    idleFrameContext.clearRect(0, 0, idleFrameWidth, idleFrameHeight);
    idleFrameContext.drawImage(idleVideo, drawX, drawY, drawW, drawH);
    const frame = idleFrameContext.getImageData(0, 0, idleFrameWidth, idleFrameHeight);
    const pixels = frame.data;
    const isBackgroundPixel = pixelIndex => {
      const offset = pixelIndex * 4;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      const brightest = Math.max(red, green, blue);
      const darkest = Math.min(red, green, blue);
      const average = (red + green + blue) / 3;
      const vividColtRed = red > green * 1.58 && red > blue * 1.48 && red > 82;
      const blackInk = average < 31 && darkest < 20;
      const greenScreen = green > 70 && green > red * 1.35 && green > blue * 1.18 && green - red > 35;
      const lowSaturation = brightest - darkest < 112;
      const mutedWarmGray = red > green && red > blue && red - green < 70 && red - blue < 86;
      return greenScreen || (!vividColtRed && !blackInk && average > 32 && (lowSaturation || mutedWarmGray));
    };
    const transparent = new Uint8Array(idleFrameWidth * idleFrameHeight);
    const queue = [];
    const addPixel = (x, y) => {
      if (x < 0 || x >= idleFrameWidth || y < 0 || y >= idleFrameHeight) return;
      const pixelIndex = y * idleFrameWidth + x;
      if (transparent[pixelIndex] || !isBackgroundPixel(pixelIndex)) return;
      transparent[pixelIndex] = 1;
      queue.push(pixelIndex);
    };
    for (let x = 0; x < idleFrameWidth; x += 1) {
      addPixel(x, 0);
      addPixel(x, idleFrameHeight - 1);
    }
    for (let y = 0; y < idleFrameHeight; y += 1) {
      addPixel(0, y);
      addPixel(idleFrameWidth - 1, y);
    }
    while (queue.length) {
      const pixelIndex = queue.pop();
      const x = pixelIndex % idleFrameWidth;
      const y = Math.floor(pixelIndex / idleFrameWidth);
      addPixel(x - 1, y);
      addPixel(x + 1, y);
      addPixel(x, y - 1);
      addPixel(x, y + 1);
    }
    for (let pixelIndex = 0; pixelIndex < transparent.length; pixelIndex += 1) {
      if (!transparent[pixelIndex]) continue;
      pixels[pixelIndex * 4 + 3] = 0;
    }
    const grayCandidate = pixelIndex => {
      if (pixels[pixelIndex * 4 + 3] < 16) return false;
      const offset = pixelIndex * 4;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      const brightest = Math.max(red, green, blue);
      const darkest = Math.min(red, green, blue);
      const average = (red + green + blue) / 3;
      const vividColtRed = red > green * 1.6 && red > blue * 1.5 && red > 84;
      const blackInk = average < 31 && darkest < 20;
      const greenScreen = green > 64 && green > red * 1.28 && green > blue * 1.12 && green - red > 28;
      const mutedWarmGray = red > green && red > blue && red - green < 76 && red - blue < 92;
      const paleColtDetail =
        average > 92 &&
        red > 104 &&
        green > 52 &&
        blue > 48 &&
        red > green * 1.03 &&
        red > blue * 1.03;
      return greenScreen || (!vividColtRed && !blackInk && !paleColtDetail && average > 36 && (brightest - darkest < 106 || mutedWarmGray));
    };
    const seen = new Uint8Array(idleFrameWidth * idleFrameHeight);
    for (let pixelIndex = 0; pixelIndex < seen.length; pixelIndex += 1) {
      if (seen[pixelIndex] || !grayCandidate(pixelIndex)) continue;
      const queue = [pixelIndex];
      const component = [];
      seen[pixelIndex] = 1;
      while (queue.length) {
        const current = queue.pop();
        component.push(current);
        const x = current % idleFrameWidth;
        const y = Math.floor(current / idleFrameWidth);
        [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].forEach(([nextX, nextY]) => {
          if (nextX < 0 || nextX >= idleFrameWidth || nextY < 0 || nextY >= idleFrameHeight) return;
          const next = nextY * idleFrameWidth + nextX;
          if (seen[next] || !grayCandidate(next)) return;
          seen[next] = 1;
          queue.push(next);
        });
      }
      if (component.length < 18) continue;
      component.forEach(index => {
        pixels[index * 4 + 3] = 0;
      });
    }
    for (let pass = 0; pass < 2; pass += 1) {
      const toClear = [];
      for (let pixelIndex = 0; pixelIndex < idleFrameWidth * idleFrameHeight; pixelIndex += 1) {
        if (!grayCandidate(pixelIndex)) continue;
        const x = pixelIndex % idleFrameWidth;
        const y = Math.floor(pixelIndex / idleFrameWidth);
        let touchesTransparent = false;
        for (let dy = -1; dy <= 1 && !touchesTransparent; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if (!dx && !dy) continue;
            const nextX = x + dx;
            const nextY = y + dy;
            if (nextX < 0 || nextX >= idleFrameWidth || nextY < 0 || nextY >= idleFrameHeight) {
              touchesTransparent = true;
              break;
            }
            if (pixels[(nextY * idleFrameWidth + nextX) * 4 + 3] < 16) {
              touchesTransparent = true;
              break;
            }
          }
        }
        if (touchesTransparent) toClear.push(pixelIndex);
      }
      toClear.forEach(index => {
        pixels[index * 4 + 3] = 0;
      });
    }
    cleanColtBackdropHalo(pixels, idleFrameWidth, idleFrameHeight, true);
    cleanIdleGreenScreenSpill(pixels, idleFrameWidth, idleFrameHeight, true);
    idleFrameContext.putImageData(frame, 0, 0);
    let minX = idleFrameWidth;
    let minY = idleFrameHeight;
    let maxX = 0;
    let maxY = 0;
    for (let pixelIndex = 0; pixelIndex < pixels.length; pixelIndex += 4) {
      if (pixels[pixelIndex + 3] < 16) continue;
      const point = pixelIndex / 4;
      const x = point % idleFrameWidth;
      const y = Math.floor(point / idleFrameWidth);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
    if (!idleFrameState.stableCrop && maxX > minX && maxY > minY) {
      const padding = 1;
      idleFrameState.stableCrop = {
        x: Math.max(0, minX - padding),
        y: Math.max(0, minY - padding),
        w: Math.min(idleFrameWidth - 1, maxX + padding) - Math.max(0, minX - padding) + 1,
        h: Math.min(idleFrameHeight - 1, maxY + padding) - Math.max(0, minY - padding) + 1
      };
    }
    if (idleFrameState.stableCrop && idleCropContext) {
      const cropW = idleFrameState.stableCrop.w;
      const cropH = idleFrameState.stableCrop.h;
      idleCropCanvas.width = cropW;
      idleCropCanvas.height = cropH;
      idleCropContext.clearRect(0, 0, cropW, cropH);
      idleCropContext.putImageData(idleFrameContext.getImageData(idleFrameState.stableCrop.x, idleFrameState.stableCrop.y, cropW, cropH), 0, 0);
      const cropRatio = cropW / cropH;
      const frameRatio = idleFrameWidth / idleFrameHeight;
      let fitW = idleFrameWidth;
      let fitH = idleFrameHeight;
      let fitX = 0;
      let fitY = 0;
      if (cropRatio > frameRatio) {
        fitH = idleFrameWidth / cropRatio;
        fitY = idleFrameHeight - fitH;
      } else {
        fitW = idleFrameHeight * cropRatio;
        fitX = (idleFrameWidth - fitW) / 2;
      }
      idleFrameContext.clearRect(0, 0, idleFrameWidth, idleFrameHeight);
      idleFrameContext.drawImage(idleCropCanvas, fitX, fitY, fitW, fitH);
    }
    idleFrameState.stamp = frameStamp;
    return idleFrameCanvas;
  };

  const getTransparentRunFrame = () => {
    if (runVideo.readyState < 2 || !runFrameContext) return null;
    const frameStamp = getDecodedVideoFrameStamp(runVideo);
    if (frameStamp === runFrameStamp) return runFrameCanvas;
    const sourceW = runVideo.videoWidth || runFrameWidth;
    const sourceH = runVideo.videoHeight || runFrameHeight;
    const sourceRatio = sourceW / sourceH;
    const targetRatio = runFrameWidth / runFrameHeight;
    let drawW = runFrameWidth;
    let drawH = runFrameHeight;
    let drawX = 0;
    let drawY = 0;
    if (sourceRatio > targetRatio) {
      drawH = runFrameWidth / sourceRatio;
      drawY = (runFrameHeight - drawH) / 2;
    } else if (sourceRatio < targetRatio) {
      drawW = runFrameHeight * sourceRatio;
      drawX = (runFrameWidth - drawW) / 2;
    }
    runFrameContext.clearRect(0, 0, runFrameWidth, runFrameHeight);
    runFrameContext.drawImage(runVideo, drawX, drawY, drawW, drawH);
    const frame = runFrameContext.getImageData(0, 0, runFrameWidth, runFrameHeight);
    const pixels = frame.data;
    const isBackgroundPixel = pixelIndex => {
      const offset = pixelIndex * 4;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      const brightest = Math.max(red, green, blue);
      const darkest = Math.min(red, green, blue);
      const average = (red + green + blue) / 3;
      const vividColtRed = red > green * 1.48 && red > blue * 1.38 && red > 76;
      const blackInk = average < 34 && darkest < 24;
      const lowSaturation = brightest - darkest < 116;
      const mutedWarmGray = red > green && red > blue && red - green < 74 && red - blue < 90;
      return !vividColtRed && !blackInk && average > 34 && (lowSaturation || mutedWarmGray);
    };
    const transparent = new Uint8Array(runFrameWidth * runFrameHeight);
    const queue = [];
    const addPixel = (x, y) => {
      if (x < 0 || x >= runFrameWidth || y < 0 || y >= runFrameHeight) return;
      const pixelIndex = y * runFrameWidth + x;
      if (transparent[pixelIndex] || !isBackgroundPixel(pixelIndex)) return;
      transparent[pixelIndex] = 1;
      queue.push(pixelIndex);
    };
    for (let x = 0; x < runFrameWidth; x += 1) {
      addPixel(x, 0);
      addPixel(x, runFrameHeight - 1);
    }
    for (let y = 0; y < runFrameHeight; y += 1) {
      addPixel(0, y);
      addPixel(runFrameWidth - 1, y);
    }
    while (queue.length) {
      const pixelIndex = queue.pop();
      const x = pixelIndex % runFrameWidth;
      const y = Math.floor(pixelIndex / runFrameWidth);
      addPixel(x - 1, y);
      addPixel(x + 1, y);
      addPixel(x, y - 1);
      addPixel(x, y + 1);
    }
    for (let pixelIndex = 0; pixelIndex < transparent.length; pixelIndex += 1) {
      if (!transparent[pixelIndex]) continue;
      pixels[pixelIndex * 4 + 3] = 0;
    }
    const edgeBackgroundPixel = pixelIndex => {
      if (pixels[pixelIndex * 4 + 3] < 16) return false;
      const offset = pixelIndex * 4;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      const brightest = Math.max(red, green, blue);
      const darkest = Math.min(red, green, blue);
      const average = (red + green + blue) / 3;
      const vividColtRed = red > green * 1.52 && red > blue * 1.42 && red > 80;
      const blackInk = average < 31 && darkest < 22;
      return !vividColtRed && !blackInk && average > 44 && brightest - darkest < 96;
    };
    for (let pass = 0; pass < 2; pass += 1) {
      const toClear = [];
      for (let pixelIndex = 0; pixelIndex < runFrameWidth * runFrameHeight; pixelIndex += 1) {
        if (!edgeBackgroundPixel(pixelIndex)) continue;
        const x = pixelIndex % runFrameWidth;
        const y = Math.floor(pixelIndex / runFrameWidth);
        let touchesTransparent = false;
        for (let dy = -1; dy <= 1 && !touchesTransparent; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if (!dx && !dy) continue;
            const nextX = x + dx;
            const nextY = y + dy;
            if (nextX < 0 || nextX >= runFrameWidth || nextY < 0 || nextY >= runFrameHeight) {
              touchesTransparent = true;
              break;
            }
            if (pixels[(nextY * runFrameWidth + nextX) * 4 + 3] < 16) {
              touchesTransparent = true;
              break;
            }
          }
        }
        if (touchesTransparent) toClear.push(pixelIndex);
      }
      toClear.forEach(index => {
        pixels[index * 4 + 3] = 0;
      });
    }
    const interiorBackgroundPixel = pixelIndex => {
      if (pixels[pixelIndex * 4 + 3] < 16) return false;
      const offset = pixelIndex * 4;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      const brightest = Math.max(red, green, blue);
      const darkest = Math.min(red, green, blue);
      const average = (red + green + blue) / 3;
      const vividColtRed = red > green * 1.5 && red > blue * 1.42 && red > 90;
      const brightHighlight = red > 166 && green > 62 && blue > 56;
      const blackInk = average < 38 && darkest < 28;
      const hoofGray = average > 74 && average < 146 && brightest - darkest < 62 && blue >= red - 20;
      const dullBrownGray = average > 34 && average < 170 && brightest - darkest < 150 && red >= green - 20 && red >= blue - 20;
      return !vividColtRed && !brightHighlight && !blackInk && !hoofGray && dullBrownGray;
    };
    const seenInterior = new Uint8Array(runFrameWidth * runFrameHeight);
    for (let pixelIndex = 0; pixelIndex < seenInterior.length; pixelIndex += 1) {
      if (seenInterior[pixelIndex] || !interiorBackgroundPixel(pixelIndex)) continue;
      const queue = [pixelIndex];
      const component = [];
      seenInterior[pixelIndex] = 1;
      while (queue.length) {
        const current = queue.pop();
        component.push(current);
        const x = current % runFrameWidth;
        const y = Math.floor(current / runFrameWidth);
        [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].forEach(([nextX, nextY]) => {
          if (nextX < 0 || nextX >= runFrameWidth || nextY < 0 || nextY >= runFrameHeight) return;
          const next = nextY * runFrameWidth + nextX;
          if (seenInterior[next] || !interiorBackgroundPixel(next)) return;
          seenInterior[next] = 1;
          queue.push(next);
        });
      }
      if (component.length > 0 && component.length < 2600) {
        component.forEach(index => {
          pixels[index * 4 + 3] = 0;
        });
      }
    }
    for (let pass = 0; pass < 2; pass += 1) {
      const toClear = [];
      for (let pixelIndex = 0; pixelIndex < runFrameWidth * runFrameHeight; pixelIndex += 1) {
        if (!interiorBackgroundPixel(pixelIndex)) continue;
        const x = pixelIndex % runFrameWidth;
        const y = Math.floor(pixelIndex / runFrameWidth);
        let nearbyTransparent = 0;
        for (let dy = -2; dy <= 2; dy += 1) {
          for (let dx = -2; dx <= 2; dx += 1) {
            if (!dx && !dy) continue;
            const nextX = x + dx;
            const nextY = y + dy;
            if (nextX < 0 || nextX >= runFrameWidth || nextY < 0 || nextY >= runFrameHeight) continue;
            if (pixels[(nextY * runFrameWidth + nextX) * 4 + 3] < 16) nearbyTransparent += 1;
          }
        }
        if (nearbyTransparent >= 2) toClear.push(pixelIndex);
      }
      toClear.forEach(index => {
        pixels[index * 4 + 3] = 0;
      });
    }
    cleanColtBackdropHalo(pixels, runFrameWidth, runFrameHeight);
    runFrameContext.putImageData(frame, 0, 0);
    let minX = runFrameWidth;
    let minY = runFrameHeight;
    let maxX = 0;
    let maxY = 0;
    for (let pixelIndex = 0; pixelIndex < pixels.length; pixelIndex += 4) {
      if (pixels[pixelIndex + 3] < 16) continue;
      const point = pixelIndex / 4;
      const x = point % runFrameWidth;
      const y = Math.floor(point / runFrameWidth);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
    if (maxX > minX && maxY > minY) {
      const leftPadding = 10;
      const rightPadding = 20;
      const verticalPadding = 4;
      const nextCrop = {
        x: Math.max(0, minX - leftPadding),
        y: Math.max(0, minY - verticalPadding),
        w: Math.min(runFrameWidth - 1, maxX + rightPadding) - Math.max(0, minX - leftPadding) + 1,
        h: Math.min(runFrameHeight - 1, maxY + verticalPadding) - Math.max(0, minY - verticalPadding) + 1
      };
      if (!runStableCrop) {
        runStableCrop = nextCrop;
      } else {
        const cropX = Math.min(runStableCrop.x, nextCrop.x);
        const cropY = Math.min(runStableCrop.y, nextCrop.y);
        const cropMaxX = Math.max(runStableCrop.x + runStableCrop.w - 1, nextCrop.x + nextCrop.w - 1);
        const cropMaxY = Math.max(runStableCrop.y + runStableCrop.h - 1, nextCrop.y + nextCrop.h - 1);
        runStableCrop = {
          x: cropX,
          y: cropY,
          w: cropMaxX - cropX + 1,
          h: cropMaxY - cropY + 1
        };
      }
    }
    if (runStableCrop && runCropContext) {
      const cropW = runStableCrop.w;
      const cropH = runStableCrop.h;
      runCropCanvas.width = cropW;
      runCropCanvas.height = cropH;
      runCropContext.clearRect(0, 0, cropW, cropH);
      runCropContext.putImageData(runFrameContext.getImageData(runStableCrop.x, runStableCrop.y, cropW, cropH), 0, 0);
      const cropRatio = cropW / cropH;
      const frameRatio = runFrameWidth / runFrameHeight;
      let fitW = runFrameWidth;
      let fitH = runFrameHeight;
      let fitX = 0;
      let fitY = 0;
      if (cropRatio > frameRatio) {
        fitH = runFrameWidth / cropRatio;
        fitY = runFrameHeight - fitH;
      } else {
        fitW = runFrameHeight * cropRatio;
        fitX = (runFrameWidth - fitW) / 2;
      }
      runFrameContext.clearRect(0, 0, runFrameWidth, runFrameHeight);
      runFrameContext.drawImage(runCropCanvas, fitX, fitY, fitW, fitH);
    }
    runFrameStamp = frameStamp;
    return runFrameCanvas;
  };

  const getTransparentLeapFrame = (sourceVideo = leapVideo, frameStateKey = "leap") => {
    if (sourceVideo.readyState < 2 || !leapFrameContext) return null;
    const frameState = coltMotionFrameStates[frameStateKey] || coltMotionFrameStates.leap;
    const frameStamp = getDecodedVideoFrameStamp(sourceVideo);
    if (frameStamp === frameState.stamp && coltMotionActiveFrameState === frameStateKey) return leapFrameCanvas;
    const sourceW = sourceVideo.videoWidth || leapFrameWidth;
    const sourceH = sourceVideo.videoHeight || leapFrameHeight;
    const sourceRatio = sourceW / sourceH;
    const targetRatio = leapFrameWidth / leapFrameHeight;
    let drawW = leapFrameWidth;
    let drawH = leapFrameHeight;
    let drawX = 0;
    let drawY = 0;
    if (sourceRatio > targetRatio) {
      drawH = leapFrameWidth / sourceRatio;
      drawY = (leapFrameHeight - drawH) / 2;
    } else if (sourceRatio < targetRatio) {
      drawW = leapFrameHeight * sourceRatio;
      drawX = (leapFrameWidth - drawW) / 2;
    }
    leapFrameContext.clearRect(0, 0, leapFrameWidth, leapFrameHeight);
    leapFrameContext.drawImage(sourceVideo, drawX, drawY, drawW, drawH);
    const frame = leapFrameContext.getImageData(0, 0, leapFrameWidth, leapFrameHeight);
    const pixels = frame.data;
    const isBackgroundPixel = pixelIndex => {
      const offset = pixelIndex * 4;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      const brightest = Math.max(red, green, blue);
      const darkest = Math.min(red, green, blue);
      const average = (red + green + blue) / 3;
      const vividColtRed = red > green * 1.48 && red > blue * 1.38 && red > 76;
      const brightHighlight = red > 166 && green > 62 && blue > 56;
      const blackInk = average < 34 && darkest < 24;
      const greenScreen = green > 64 && green > red * 1.28 && green > blue * 1.12 && green - red > 28;
      const lowSaturation = brightest - darkest < 116;
      const mutedWarmGray = red > green && red > blue && red - green < 74 && red - blue < 90;
      const paleBackdrop = average > 180 && brightest - darkest < 82;
      return greenScreen || (!vividColtRed && !brightHighlight && !blackInk && average > 34 && (lowSaturation || mutedWarmGray || paleBackdrop));
    };
    const transparent = new Uint8Array(leapFrameWidth * leapFrameHeight);
    const queue = [];
    const addPixel = (x, y) => {
      if (x < 0 || x >= leapFrameWidth || y < 0 || y >= leapFrameHeight) return;
      const pixelIndex = y * leapFrameWidth + x;
      if (transparent[pixelIndex] || !isBackgroundPixel(pixelIndex)) return;
      transparent[pixelIndex] = 1;
      queue.push(pixelIndex);
    };
    for (let x = 0; x < leapFrameWidth; x += 1) {
      addPixel(x, 0);
      addPixel(x, leapFrameHeight - 1);
    }
    for (let y = 0; y < leapFrameHeight; y += 1) {
      addPixel(0, y);
      addPixel(leapFrameWidth - 1, y);
    }
    while (queue.length) {
      const pixelIndex = queue.pop();
      const x = pixelIndex % leapFrameWidth;
      const y = Math.floor(pixelIndex / leapFrameWidth);
      addPixel(x - 1, y);
      addPixel(x + 1, y);
      addPixel(x, y - 1);
      addPixel(x, y + 1);
    }
    for (let pixelIndex = 0; pixelIndex < transparent.length; pixelIndex += 1) {
      if (!transparent[pixelIndex]) continue;
      pixels[pixelIndex * 4 + 3] = 0;
    }
    const edgeBackgroundPixel = pixelIndex => {
      if (pixels[pixelIndex * 4 + 3] < 16) return false;
      const offset = pixelIndex * 4;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      const brightest = Math.max(red, green, blue);
      const darkest = Math.min(red, green, blue);
      const average = (red + green + blue) / 3;
      const vividColtRed = red > green * 1.52 && red > blue * 1.42 && red > 80;
      const brightHighlight = red > 166 && green > 62 && blue > 56;
      const blackInk = average < 31 && darkest < 22;
      const greenScreen = green > 58 && green > red * 1.22 && green > blue * 1.08 && green - red > 22;
      return greenScreen || (!vividColtRed && !brightHighlight && !blackInk && average > 44 && brightest - darkest < 104);
    };
    for (let pass = 0; pass < 2; pass += 1) {
      const toClear = [];
      for (let pixelIndex = 0; pixelIndex < leapFrameWidth * leapFrameHeight; pixelIndex += 1) {
        if (!edgeBackgroundPixel(pixelIndex)) continue;
        const x = pixelIndex % leapFrameWidth;
        const y = Math.floor(pixelIndex / leapFrameWidth);
        let touchesTransparent = false;
        for (let dy = -1; dy <= 1 && !touchesTransparent; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if (!dx && !dy) continue;
            const nextX = x + dx;
            const nextY = y + dy;
            if (nextX < 0 || nextX >= leapFrameWidth || nextY < 0 || nextY >= leapFrameHeight) {
              touchesTransparent = true;
              break;
            }
            if (pixels[(nextY * leapFrameWidth + nextX) * 4 + 3] < 16) {
              touchesTransparent = true;
              break;
            }
          }
        }
        if (touchesTransparent) toClear.push(pixelIndex);
      }
      toClear.forEach(index => {
        pixels[index * 4 + 3] = 0;
      });
    }
    const detachedBackdropPixel = pixelIndex => {
      if (pixels[pixelIndex * 4 + 3] < 16) return false;
      const offset = pixelIndex * 4;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      const brightest = Math.max(red, green, blue);
      const darkest = Math.min(red, green, blue);
      const average = (red + green + blue) / 3;
      const vividColtRed = red > green * 1.42 && red > blue * 1.32 && red > 74;
      const brightHighlight = red > 166 && green > 62 && blue > 56;
      const blackInk = average < 31 && darkest < 22;
      const greenScreen = green > 54 && green > red * 1.18 && green > blue * 1.06 && green - red > 17;
      const paleGray = average > 108 && brightest - darkest < 98;
      const mutedWarmGray = red >= green - 8 && red >= blue - 8 && red - green < 72 && red - blue < 92 && average > 78;
      return greenScreen || (!vividColtRed && !brightHighlight && !blackInk && (paleGray || mutedWarmGray));
    };
    const seenDetached = new Uint8Array(leapFrameWidth * leapFrameHeight);
    for (let pixelIndex = 0; pixelIndex < seenDetached.length; pixelIndex += 1) {
      if (seenDetached[pixelIndex] || !detachedBackdropPixel(pixelIndex)) continue;
      const queue = [pixelIndex];
      const component = [];
      seenDetached[pixelIndex] = 1;
      while (queue.length) {
        const current = queue.pop();
        component.push(current);
        const x = current % leapFrameWidth;
        const y = Math.floor(current / leapFrameWidth);
        [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].forEach(([nextX, nextY]) => {
          if (nextX < 0 || nextX >= leapFrameWidth || nextY < 0 || nextY >= leapFrameHeight) return;
          const next = nextY * leapFrameWidth + nextX;
          if (seenDetached[next] || !detachedBackdropPixel(next)) return;
          seenDetached[next] = 1;
          queue.push(next);
        });
      }
      if (component.length > 0 && component.length < 3600) {
        component.forEach(index => {
          pixels[index * 4 + 3] = 0;
        });
      }
    }
    const seenVisible = new Uint8Array(leapFrameWidth * leapFrameHeight);
    const isVisiblePixel = pixelIndex => pixels[pixelIndex * 4 + 3] >= 16;
    const isColtColorPixel = pixelIndex => {
      const offset = pixelIndex * 4;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      const average = (red + green + blue) / 3;
      const vividColtRed = red > green * 1.36 && red > blue * 1.26 && red > 70;
      const redHighlight = red > 150 && green > 48 && blue > 44 && red > green * 1.18;
      const blackOutline = average < 42 && red >= green - 12 && red >= blue - 12;
      return vividColtRed || redHighlight || blackOutline;
    };
    for (let pixelIndex = 0; pixelIndex < seenVisible.length; pixelIndex += 1) {
      if (seenVisible[pixelIndex] || !isVisiblePixel(pixelIndex)) continue;
      const queue = [pixelIndex];
      const component = [];
      let coltColorCount = 0;
      seenVisible[pixelIndex] = 1;
      while (queue.length) {
        const current = queue.pop();
        component.push(current);
        if (isColtColorPixel(current)) coltColorCount += 1;
        const x = current % leapFrameWidth;
        const y = Math.floor(current / leapFrameWidth);
        [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].forEach(([nextX, nextY]) => {
          if (nextX < 0 || nextX >= leapFrameWidth || nextY < 0 || nextY >= leapFrameHeight) return;
          const next = nextY * leapFrameWidth + nextX;
          if (seenVisible[next] || !isVisiblePixel(next)) return;
          seenVisible[next] = 1;
          queue.push(next);
        });
      }
      if (coltColorCount < 10) {
        component.forEach(index => {
          pixels[index * 4 + 3] = 0;
        });
      }
    }
    cleanColtBackdropHalo(pixels, leapFrameWidth, leapFrameHeight);
    cleanIdleGreenScreenSpill(pixels, leapFrameWidth, leapFrameHeight, true);
    leapFrameContext.putImageData(frame, 0, 0);
    let minX = leapFrameWidth;
    let minY = leapFrameHeight;
    let maxX = 0;
    let maxY = 0;
    for (let pixelIndex = 0; pixelIndex < pixels.length; pixelIndex += 4) {
      if (pixels[pixelIndex + 3] < 16) continue;
      const point = pixelIndex / 4;
      const x = point % leapFrameWidth;
      const y = Math.floor(point / leapFrameWidth);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
    if (maxX > minX && maxY > minY) {
      const leftPadding = 12;
      const rightPadding = 18;
      const verticalPadding = 8;
      const nextCrop = {
        x: Math.max(0, minX - leftPadding),
        y: Math.max(0, minY - verticalPadding),
        w: Math.min(leapFrameWidth - 1, maxX + rightPadding) - Math.max(0, minX - leftPadding) + 1,
        h: Math.min(leapFrameHeight - 1, maxY + verticalPadding) - Math.max(0, minY - verticalPadding) + 1
      };
      if (!frameState.crop) {
        frameState.crop = nextCrop;
      } else {
        const cropX = Math.min(frameState.crop.x, nextCrop.x);
        const cropY = Math.min(frameState.crop.y, nextCrop.y);
        const cropMaxX = Math.max(frameState.crop.x + frameState.crop.w - 1, nextCrop.x + nextCrop.w - 1);
        const cropMaxY = Math.max(frameState.crop.y + frameState.crop.h - 1, nextCrop.y + nextCrop.h - 1);
        frameState.crop = {
          x: cropX,
          y: cropY,
          w: cropMaxX - cropX + 1,
          h: cropMaxY - cropY + 1
        };
      }
    }
    if (frameState.crop && leapCropContext) {
      const cropW = frameState.crop.w;
      const cropH = frameState.crop.h;
      leapCropCanvas.width = cropW;
      leapCropCanvas.height = cropH;
      leapCropContext.clearRect(0, 0, cropW, cropH);
      leapCropContext.putImageData(leapFrameContext.getImageData(frameState.crop.x, frameState.crop.y, cropW, cropH), 0, 0);
      const cropRatio = cropW / cropH;
      const frameRatio = leapFrameWidth / leapFrameHeight;
      let fitW = leapFrameWidth;
      let fitH = leapFrameHeight;
      let fitX = 0;
      let fitY = 0;
      if (cropRatio > frameRatio) {
        fitH = leapFrameWidth / cropRatio;
        fitY = leapFrameHeight - fitH;
      } else {
        fitW = leapFrameHeight * cropRatio;
        fitX = (leapFrameWidth - fitW) / 2;
      }
      leapFrameContext.clearRect(0, 0, leapFrameWidth, leapFrameHeight);
      leapFrameContext.drawImage(leapCropCanvas, fitX, fitY, fitW, fitH);
    }
    frameState.stamp = frameStamp;
    coltMotionActiveFrameState = frameStateKey;
    return leapFrameCanvas;
  };

  const getTransparentColtCelebrationFrame = () => getTransparentLeapFrame(coltCelebrationVideo, "celebration");

  const getTransparentMrNievesFrame = (sourceMedia, frameStateKey) => {
    const isVideoSource = typeof sourceMedia.readyState === "number";
    const isReady = isVideoSource ? sourceMedia.readyState >= 2 : sourceMedia.complete && sourceMedia.naturalWidth;
    if (!isReady || !mrNievesFrameContext || !mrNievesCropContext) return null;
    const frameState = mrNievesFrameStates[frameStateKey] || mrNievesFrameStates.idle0;
    const frameStamp = isVideoSource ? getDecodedVideoFrameStamp(sourceMedia) : 0;
    if (frameStamp === frameState.stamp && mrNievesActiveFrameState === frameStateKey) return mrNievesFrameCanvas;
    const sourceW = sourceMedia.videoWidth || sourceMedia.naturalWidth || mrNievesFrameWidth;
    const sourceH = sourceMedia.videoHeight || sourceMedia.naturalHeight || mrNievesFrameHeight;
    const sourceRatio = sourceW / sourceH;
    const targetRatio = mrNievesFrameWidth / mrNievesFrameHeight;
    let drawW = mrNievesFrameWidth;
    let drawH = mrNievesFrameHeight;
    let drawX = 0;
    let drawY = 0;
    if (sourceRatio > targetRatio) {
      drawH = mrNievesFrameWidth / sourceRatio;
      drawY = (mrNievesFrameHeight - drawH) / 2;
    } else if (sourceRatio < targetRatio) {
      drawW = mrNievesFrameHeight * sourceRatio;
      drawX = (mrNievesFrameWidth - drawW) / 2;
    }
    mrNievesFrameContext.clearRect(0, 0, mrNievesFrameWidth, mrNievesFrameHeight);
    mrNievesFrameContext.drawImage(sourceMedia, drawX, drawY, drawW, drawH);
    const frame = mrNievesFrameContext.getImageData(0, 0, mrNievesFrameWidth, mrNievesFrameHeight);
    const pixels = frame.data;
    const getPixel = index => {
      const offset = index * 4;
      return { red: pixels[offset], green: pixels[offset + 1], blue: pixels[offset + 2], alpha: pixels[offset + 3] };
    };
    const colorDistance = (a, b) => {
      const red = a.red - b.red;
      const green = a.green - b.green;
      const blue = a.blue - b.blue;
      return Math.sqrt(red * red + green * green + blue * blue);
    };
    const sampleArea = (startX, startY, size) => {
      const color = { red: 0, green: 0, blue: 0 };
      let count = 0;
      for (let y = startY; y < Math.min(mrNievesFrameHeight, startY + size); y += 1) {
        for (let x = startX; x < Math.min(mrNievesFrameWidth, startX + size); x += 1) {
          const pixel = getPixel(y * mrNievesFrameWidth + x);
          if (pixel.alpha < 16) continue;
          color.red += pixel.red;
          color.green += pixel.green;
          color.blue += pixel.blue;
          count += 1;
        }
      }
      return count ? { red: color.red / count, green: color.green / count, blue: color.blue / count } : { red: 0, green: 255, blue: 0 };
    };
    const cornerSize = 12;
    const backgroundSamples = [
      sampleArea(0, 0, cornerSize),
      sampleArea(mrNievesFrameWidth - cornerSize, 0, cornerSize),
      sampleArea(0, mrNievesFrameHeight - cornerSize, cornerSize),
      sampleArea(mrNievesFrameWidth - cornerSize, mrNievesFrameHeight - cornerSize, cornerSize)
    ];
    const isGreenScreen = pixel => pixel.green > 90 && pixel.green > pixel.red * 1.28 && pixel.green > pixel.blue * 1.28;
    const isBackgroundPixel = index => {
      const pixel = getPixel(index);
      if (pixel.alpha < 16 || isGreenScreen(pixel)) return true;
      const closestSample = Math.min(...backgroundSamples.map(sample => colorDistance(pixel, sample)));
      const brightest = Math.max(pixel.red, pixel.green, pixel.blue);
      const darkest = Math.min(pixel.red, pixel.green, pixel.blue);
      const chroma = brightest - darkest;
      return closestSample < 58 || (closestSample < 86 && chroma < 48);
    };
    const transparent = new Uint8Array(mrNievesFrameWidth * mrNievesFrameHeight);
    const queue = [];
    const addPixel = (x, y) => {
      if (x < 0 || x >= mrNievesFrameWidth || y < 0 || y >= mrNievesFrameHeight) return;
      const index = y * mrNievesFrameWidth + x;
      if (transparent[index] || !isBackgroundPixel(index)) return;
      transparent[index] = 1;
      queue.push(index);
    };
    for (let x = 0; x < mrNievesFrameWidth; x += 1) {
      addPixel(x, 0);
      addPixel(x, mrNievesFrameHeight - 1);
    }
    for (let y = 0; y < mrNievesFrameHeight; y += 1) {
      addPixel(0, y);
      addPixel(mrNievesFrameWidth - 1, y);
    }
    while (queue.length) {
      const index = queue.pop();
      const x = index % mrNievesFrameWidth;
      const y = Math.floor(index / mrNievesFrameWidth);
      addPixel(x - 1, y);
      addPixel(x + 1, y);
      addPixel(x, y - 1);
      addPixel(x, y + 1);
    }
    for (let index = 0; index < transparent.length; index += 1) {
      if (transparent[index] || isGreenScreen(getPixel(index))) pixels[index * 4 + 3] = 0;
    }
    for (let pass = 0; pass < 2; pass += 1) {
      const soften = [];
      for (let index = 0; index < mrNievesFrameWidth * mrNievesFrameHeight; index += 1) {
        const alphaIndex = index * 4 + 3;
        if (pixels[alphaIndex] < 16 || !isBackgroundPixel(index)) continue;
        const x = index % mrNievesFrameWidth;
        const y = Math.floor(index / mrNievesFrameWidth);
        let touchesTransparent = false;
        for (let dy = -1; dy <= 1 && !touchesTransparent; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if (!dx && !dy) continue;
            const nextX = x + dx;
            const nextY = y + dy;
            if (nextX < 0 || nextX >= mrNievesFrameWidth || nextY < 0 || nextY >= mrNievesFrameHeight) continue;
            if (pixels[(nextY * mrNievesFrameWidth + nextX) * 4 + 3] < 16) {
              touchesTransparent = true;
              break;
            }
          }
        }
        if (touchesTransparent) soften.push(index);
      }
      soften.forEach(index => {
        pixels[index * 4 + 3] = Math.max(0, pixels[index * 4 + 3] - 120);
      });
    }
    if (frameStateKey.startsWith("idle")) {
      cleanIdleGreenScreenSpill(pixels, mrNievesFrameWidth, mrNievesFrameHeight);
    }
    mrNievesFrameContext.putImageData(frame, 0, 0);
    let minX = mrNievesFrameWidth;
    let minY = mrNievesFrameHeight;
    let maxX = 0;
    let maxY = 0;
    for (let offset = 0; offset < pixels.length; offset += 4) {
      if (pixels[offset + 3] < 18) continue;
      const index = offset / 4;
      const x = index % mrNievesFrameWidth;
      const y = Math.floor(index / mrNievesFrameWidth);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
    if (maxX > minX && maxY > minY) {
      const padding = 5;
      const nextCrop = {
        minX: Math.max(0, minX - padding),
        minY: Math.max(0, minY - padding),
        maxX: Math.min(mrNievesFrameWidth - 1, maxX + padding),
        maxY: Math.min(mrNievesFrameHeight - 1, maxY + padding)
      };
      if (frameState.crop) {
        frameState.crop.minX = Math.min(frameState.crop.minX, nextCrop.minX);
        frameState.crop.minY = Math.min(frameState.crop.minY, nextCrop.minY);
        frameState.crop.maxX = Math.max(frameState.crop.maxX, nextCrop.maxX);
        frameState.crop.maxY = Math.max(frameState.crop.maxY, nextCrop.maxY);
      } else {
        frameState.crop = { ...nextCrop };
      }
      const cropW = frameState.crop.maxX - frameState.crop.minX + 1;
      const cropH = frameState.crop.maxY - frameState.crop.minY + 1;
      mrNievesCropCanvas.width = cropW;
      mrNievesCropCanvas.height = cropH;
      mrNievesCropContext.clearRect(0, 0, cropW, cropH);
      mrNievesCropContext.drawImage(mrNievesFrameCanvas, frameState.crop.minX, frameState.crop.minY, cropW, cropH, 0, 0, cropW, cropH);
      const fitScale = Math.min(mrNievesFrameWidth / cropW, mrNievesFrameHeight / cropH);
      const fitW = cropW * fitScale;
      const fitH = cropH * fitScale;
      const fitX = (mrNievesFrameWidth - fitW) / 2;
      const fitY = mrNievesFrameHeight - fitH;
      mrNievesFrameContext.clearRect(0, 0, mrNievesFrameWidth, mrNievesFrameHeight);
      mrNievesFrameContext.drawImage(mrNievesCropCanvas, fitX, fitY, fitW, fitH);
    }
    frameState.stamp = frameStamp;
    mrNievesActiveFrameState = frameStateKey;
    return mrNievesFrameCanvas;
  };
  const getLastTransparentMrNievesFrame = () => (
    mrNievesActiveFrameState ? mrNievesFrameCanvas : null
  );
  const getTransparentMrNievesIdleFrame = () => (
    getTransparentMrNievesFrame(getMrNievesIdleVideo(), `idle${mrNievesIdleIndex}`) ||
    getLastTransparentMrNievesFrame()
  );
  const getTransparentMrNievesRunFrame = () => getTransparentMrNievesFrame(mrNievesRunVideo, "run");
  const getTransparentMrNievesJumpFrame = () => getTransparentMrNievesFrame(mrNievesJumpImage, "jump");
  const getTransparentMrNievesInAirFrame = () => getTransparentMrNievesFrame(getMrNievesInAirVideo(), `inAir${mrNievesInAirIndex}`);
  const getTransparentMrNievesCelebrationFrame = () => getTransparentMrNievesFrame(getMrNievesCelebrationVideo(), `celebration${mrNievesCelebrationIndex}`);
  const getTransparentMrNievesDeathFrame = () => (
    getTransparentMrNievesFrame(getMrNievesDeathVideo(), `death${Math.max(0, mrNievesDeathIndex)}`)
  );
  const getTransparentDeathFrame = () => {
    if (deathVideo.readyState < 2 || !deathFrameContext) return null;
    const frameStamp = getDecodedVideoFrameStamp(deathVideo);
    if (frameStamp === deathFrameStamp) return deathFrameCanvas;
    const sourceW = deathVideo.videoWidth || deathFrameWidth;
    const sourceH = deathVideo.videoHeight || deathFrameHeight;
    const sourceRatio = sourceW / sourceH;
    const targetRatio = deathFrameWidth / deathFrameHeight;
    let drawW = deathFrameWidth;
    let drawH = deathFrameHeight;
    let drawX = 0;
    let drawY = 0;
    if (sourceRatio > targetRatio) {
      drawH = deathFrameWidth / sourceRatio;
      drawY = (deathFrameHeight - drawH) / 2;
    } else if (sourceRatio < targetRatio) {
      drawW = deathFrameHeight * sourceRatio;
      drawX = (deathFrameWidth - drawW) / 2;
    }
    deathFrameContext.clearRect(0, 0, deathFrameWidth, deathFrameHeight);
    deathFrameContext.drawImage(deathVideo, drawX, drawY, drawW, drawH);
    const frame = deathFrameContext.getImageData(0, 0, deathFrameWidth, deathFrameHeight);
    const pixels = frame.data;
    const isColtPixel = pixelIndex => {
      const offset = pixelIndex * 4;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      const brightest = Math.max(red, green, blue);
      const darkest = Math.min(red, green, blue);
      const average = (red + green + blue) / 3;
      const chroma = brightest - darkest;
      const vividColtRed = red > green * 1.48 && red > blue * 1.38 && red > 76;
      const redHighlight = red > 156 && green > 42 && blue > 34 && red > green * 1.26 && red > blue * 1.24;
      const blackOutline = average < 42 && darkest < 32 && chroma > 22 && red > green * 0.98 && red > blue * 0.98;
      const warmDarkBody = average > 36 && average < 102 && chroma > 42 && red > 68 && red - green > 17 && red - blue > 24 && red > green * 1.18 && red > blue * 1.16;
      const paleHighlight = red > 152 && green > 74 && blue > 58 && red > blue * 1.12 && chroma > 48;
      return vividColtRed || redHighlight || blackOutline || warmDarkBody || paleHighlight;
    };
    const isRedColtAnchor = pixelIndex => {
      const offset = pixelIndex * 4;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      return (red > green * 1.42 && red > blue * 1.32 && red > 72) || (red > 150 && green > 42 && red > blue * 1.2);
    };
    const isBackgroundPixel = pixelIndex => {
      if (isColtPixel(pixelIndex)) return false;
      const offset = pixelIndex * 4;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      const brightest = Math.max(red, green, blue);
      const darkest = Math.min(red, green, blue);
      const average = (red + green + blue) / 3;
      const chroma = brightest - darkest;
      const darkFlatBackdrop = average < 58 && chroma < 42;
      const lowSaturation = chroma < 104;
      const mutedWarmGray = red >= green - 18 && red >= blue - 18 && red - green < 78 && red - blue < 92;
      const brownBackdrop = average > 30 && average < 132 && red > green - 4 && green >= blue - 10 && red - green < 54 && red - blue < 74;
      return average > 20 && (darkFlatBackdrop || lowSaturation || mutedWarmGray || brownBackdrop);
    };
    const isDeathMattePixel = pixelIndex => {
      if (isColtPixel(pixelIndex)) return false;
      const offset = pixelIndex * 4;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      const brightest = Math.max(red, green, blue);
      const darkest = Math.min(red, green, blue);
      const average = (red + green + blue) / 3;
      const chroma = brightest - darkest;
      const muted = chroma < 88 || (red - green < 58 && red - blue < 78);
      const brown = red > green - 2 && green >= blue - 12 && red - green < 52 && red - blue < 72;
      return average > 18 && average < 150 && (muted || brown);
    };
    const transparent = new Uint8Array(deathFrameWidth * deathFrameHeight);
    const queue = [];
    const addPixel = (x, y) => {
      if (x < 0 || x >= deathFrameWidth || y < 0 || y >= deathFrameHeight) return;
      const pixelIndex = y * deathFrameWidth + x;
      if (transparent[pixelIndex] || !isBackgroundPixel(pixelIndex)) return;
      transparent[pixelIndex] = 1;
      queue.push(pixelIndex);
    };
    for (let x = 0; x < deathFrameWidth; x += 1) {
      addPixel(x, 0);
      addPixel(x, deathFrameHeight - 1);
    }
    for (let y = 0; y < deathFrameHeight; y += 1) {
      addPixel(0, y);
      addPixel(deathFrameWidth - 1, y);
    }
    while (queue.length) {
      const pixelIndex = queue.pop();
      const x = pixelIndex % deathFrameWidth;
      const y = Math.floor(pixelIndex / deathFrameWidth);
      addPixel(x - 1, y);
      addPixel(x + 1, y);
      addPixel(x, y - 1);
      addPixel(x, y + 1);
    }
    for (let pixelIndex = 0; pixelIndex < transparent.length; pixelIndex += 1) {
      if (!transparent[pixelIndex]) continue;
      pixels[pixelIndex * 4 + 3] = 0;
    }
    for (let pass = 0; pass < 5; pass += 1) {
      const toClear = [];
      for (let pixelIndex = 0; pixelIndex < deathFrameWidth * deathFrameHeight; pixelIndex += 1) {
        if (pixels[pixelIndex * 4 + 3] < 16 || !isBackgroundPixel(pixelIndex)) continue;
        const x = pixelIndex % deathFrameWidth;
        const y = Math.floor(pixelIndex / deathFrameWidth);
        let touchesTransparent = false;
        for (let dy = -1; dy <= 1 && !touchesTransparent; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if (!dx && !dy) continue;
            const nextX = x + dx;
            const nextY = y + dy;
            if (nextX < 0 || nextX >= deathFrameWidth || nextY < 0 || nextY >= deathFrameHeight) {
              touchesTransparent = true;
              break;
            }
            if (pixels[(nextY * deathFrameWidth + nextX) * 4 + 3] < 16) {
              touchesTransparent = true;
              break;
            }
          }
        }
        if (touchesTransparent) toClear.push(pixelIndex);
      }
      toClear.forEach(index => {
        pixels[index * 4 + 3] = 0;
      });
    }
    for (let pass = 0; pass < 3; pass += 1) {
      const toClear = [];
      for (let pixelIndex = 0; pixelIndex < deathFrameWidth * deathFrameHeight; pixelIndex += 1) {
        if (pixels[pixelIndex * 4 + 3] < 16 || !isDeathMattePixel(pixelIndex)) continue;
        const x = pixelIndex % deathFrameWidth;
        const y = Math.floor(pixelIndex / deathFrameWidth);
        let touchesTransparent = false;
        for (let dy = -2; dy <= 2 && !touchesTransparent; dy += 1) {
          for (let dx = -2; dx <= 2; dx += 1) {
            if (!dx && !dy) continue;
            const nextX = x + dx;
            const nextY = y + dy;
            if (nextX < 0 || nextX >= deathFrameWidth || nextY < 0 || nextY >= deathFrameHeight) {
              touchesTransparent = true;
              break;
            }
            if (pixels[(nextY * deathFrameWidth + nextX) * 4 + 3] < 16) {
              touchesTransparent = true;
              break;
            }
          }
        }
        if (touchesTransparent) toClear.push(pixelIndex);
      }
      toClear.forEach(index => {
        pixels[index * 4 + 3] = 0;
      });
    }
    const seen = new Uint8Array(deathFrameWidth * deathFrameHeight);
    const isVisiblePixel = pixelIndex => pixels[pixelIndex * 4 + 3] >= 16;
    for (let pixelIndex = 0; pixelIndex < seen.length; pixelIndex += 1) {
      if (seen[pixelIndex] || !isVisiblePixel(pixelIndex)) continue;
      const component = [];
      let coltPixels = 0;
      let redAnchors = 0;
      const queue = [pixelIndex];
      seen[pixelIndex] = 1;
      while (queue.length) {
        const current = queue.pop();
        component.push(current);
        if (isColtPixel(current)) coltPixels += 1;
        if (isRedColtAnchor(current)) redAnchors += 1;
        const x = current % deathFrameWidth;
        const y = Math.floor(current / deathFrameWidth);
        [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].forEach(([nextX, nextY]) => {
          if (nextX < 0 || nextX >= deathFrameWidth || nextY < 0 || nextY >= deathFrameHeight) return;
          const next = nextY * deathFrameWidth + nextX;
          if (seen[next] || !isVisiblePixel(next)) return;
          seen[next] = 1;
          queue.push(next);
        });
      }
      if (component.length >= 40 && coltPixels >= Math.max(14, component.length * 0.24) && redAnchors >= Math.max(4, component.length * 0.035)) continue;
      component.forEach(index => {
        pixels[index * 4 + 3] = 0;
      });
    }
    cleanColtBackdropHalo(pixels, deathFrameWidth, deathFrameHeight);
    deathFrameContext.putImageData(frame, 0, 0);
    let minX = deathFrameWidth;
    let minY = deathFrameHeight;
    let maxX = 0;
    let maxY = 0;
    for (let pixelIndex = 0; pixelIndex < pixels.length; pixelIndex += 4) {
      if (pixels[pixelIndex + 3] < 16) continue;
      const point = pixelIndex / 4;
      const x = point % deathFrameWidth;
      const y = Math.floor(point / deathFrameWidth);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
    if (maxX > minX && maxY > minY) {
      const padding = 4;
      const nextCrop = {
        x: Math.max(0, minX - padding),
        y: Math.max(0, minY - padding),
        w: Math.min(deathFrameWidth - 1, maxX + padding) - Math.max(0, minX - padding) + 1,
        h: Math.min(deathFrameHeight - 1, maxY + padding) - Math.max(0, minY - padding) + 1
      };
      if (!deathStableCrop) {
        deathStableCrop = nextCrop;
      } else {
        const cropX = Math.min(deathStableCrop.x, nextCrop.x);
        const cropY = Math.min(deathStableCrop.y, nextCrop.y);
        const cropMaxX = Math.max(deathStableCrop.x + deathStableCrop.w - 1, nextCrop.x + nextCrop.w - 1);
        const cropMaxY = Math.max(deathStableCrop.y + deathStableCrop.h - 1, nextCrop.y + nextCrop.h - 1);
        deathStableCrop = {
          x: cropX,
          y: cropY,
          w: cropMaxX - cropX + 1,
          h: cropMaxY - cropY + 1
        };
      }
    }
    if (deathStableCrop && deathCropContext) {
      const cropW = deathStableCrop.w;
      const cropH = deathStableCrop.h;
      deathCropCanvas.width = cropW;
      deathCropCanvas.height = cropH;
      deathCropContext.clearRect(0, 0, cropW, cropH);
      deathCropContext.putImageData(deathFrameContext.getImageData(deathStableCrop.x, deathStableCrop.y, cropW, cropH), 0, 0);
      const cropRatio = cropW / cropH;
      const frameRatio = deathFrameWidth / deathFrameHeight;
      let fitW = deathFrameWidth;
      let fitH = deathFrameHeight;
      let fitX = 0;
      let fitY = 0;
      if (cropRatio > frameRatio) {
        fitH = deathFrameWidth / cropRatio;
        fitY = deathFrameHeight - fitH;
      } else {
        fitW = deathFrameHeight * cropRatio;
        fitX = (deathFrameWidth - fitW) / 2;
      }
      deathFrameContext.clearRect(0, 0, deathFrameWidth, deathFrameHeight);
      deathFrameContext.drawImage(deathCropCanvas, fitX, fitY, fitW, fitH);
    }
    deathFrameStamp = frameStamp;
    return deathFrameCanvas;
  };

  const getTransparentLavaRockVideoFrame = (index = 0) => {
    const video = getLavaRockVideoSpecial(index);
    if (!video || video.readyState < 2 || !lavaRockVideoFrameContext) return null;
    const frameStamp = getDecodedVideoFrameStamp(video);
    if (frameStamp === lavaRockVideoFrameStamp && lavaRockVideoFrameSource === index) return lavaRockVideoFrameCanvas;
    const sourceW = video.videoWidth || lavaRockVideoFrameSize;
    const sourceH = video.videoHeight || lavaRockVideoFrameSize;
    const sourceRatio = sourceW / sourceH;
    let drawW = lavaRockVideoFrameSize;
    let drawH = lavaRockVideoFrameSize;
    let drawX = 0;
    let drawY = 0;
    if (sourceRatio > 1) {
      drawH = lavaRockVideoFrameSize / sourceRatio;
      drawY = (lavaRockVideoFrameSize - drawH) / 2;
    } else if (sourceRatio < 1) {
      drawW = lavaRockVideoFrameSize * sourceRatio;
      drawX = (lavaRockVideoFrameSize - drawW) / 2;
    }
    let frame;
    try {
      lavaRockVideoFrameContext.clearRect(0, 0, lavaRockVideoFrameSize, lavaRockVideoFrameSize);
      lavaRockVideoFrameContext.drawImage(video, drawX, drawY, drawW, drawH);
      frame = lavaRockVideoFrameContext.getImageData(0, 0, lavaRockVideoFrameSize, lavaRockVideoFrameSize);
    } catch {
      return null;
    }
    const pixels = frame.data;
    const isBackdropPixel = pixelIndex => {
      const offset = pixelIndex * 4;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      const brightest = Math.max(red, green, blue);
      const darkest = Math.min(red, green, blue);
      const average = (red + green + blue) / 3;
      const chroma = brightest - darkest;
      return (average > 225 && chroma < 74) || (average > 205 && chroma < 46);
    };
    const transparent = new Uint8Array(lavaRockVideoFrameSize * lavaRockVideoFrameSize);
    const queue = [];
    const addPixel = (x, y) => {
      if (x < 0 || x >= lavaRockVideoFrameSize || y < 0 || y >= lavaRockVideoFrameSize) return;
      const pixelIndex = y * lavaRockVideoFrameSize + x;
      if (transparent[pixelIndex] || !isBackdropPixel(pixelIndex)) return;
      transparent[pixelIndex] = 1;
      queue.push(pixelIndex);
    };
    for (let i = 0; i < lavaRockVideoFrameSize; i += 1) {
      addPixel(i, 0);
      addPixel(i, lavaRockVideoFrameSize - 1);
      addPixel(0, i);
      addPixel(lavaRockVideoFrameSize - 1, i);
    }
    while (queue.length) {
      const pixelIndex = queue.pop();
      const x = pixelIndex % lavaRockVideoFrameSize;
      const y = Math.floor(pixelIndex / lavaRockVideoFrameSize);
      addPixel(x - 1, y);
      addPixel(x + 1, y);
      addPixel(x, y - 1);
      addPixel(x, y + 1);
    }
    for (let pixelIndex = 0; pixelIndex < transparent.length; pixelIndex += 1) {
      if (transparent[pixelIndex]) pixels[pixelIndex * 4 + 3] = 0;
    }
    for (let pass = 0; pass < 3; pass += 1) {
      const toFade = [];
      for (let pixelIndex = 0; pixelIndex < lavaRockVideoFrameSize * lavaRockVideoFrameSize; pixelIndex += 1) {
        const alphaIndex = pixelIndex * 4 + 3;
        if (pixels[alphaIndex] < 16 || !isBackdropPixel(pixelIndex)) continue;
        const x = pixelIndex % lavaRockVideoFrameSize;
        const y = Math.floor(pixelIndex / lavaRockVideoFrameSize);
        let transparentNeighbor = false;
        for (let dy = -2; dy <= 2 && !transparentNeighbor; dy += 1) {
          for (let dx = -2; dx <= 2; dx += 1) {
            if (!dx && !dy) continue;
            const nextX = x + dx;
            const nextY = y + dy;
            if (nextX < 0 || nextX >= lavaRockVideoFrameSize || nextY < 0 || nextY >= lavaRockVideoFrameSize) {
              transparentNeighbor = true;
              break;
            }
            if (pixels[(nextY * lavaRockVideoFrameSize + nextX) * 4 + 3] < 16) {
              transparentNeighbor = true;
              break;
            }
          }
        }
        if (transparentNeighbor) toFade.push(pixelIndex);
      }
      toFade.forEach(pixelIndex => {
        pixels[pixelIndex * 4 + 3] = Math.max(0, pixels[pixelIndex * 4 + 3] - 96);
      });
    }
    const tailTopFeather = lavaRockVideoFrameSize * (index === 1 ? 0.32 : 0.2);
    const tailRightFeather = lavaRockVideoFrameSize * (index === 1 ? 0.3 : 0.16);
    const tailCornerFeather = lavaRockVideoFrameSize * (index === 1 ? 0.5 : 0.32);
    for (let pixelIndex = 0; pixelIndex < lavaRockVideoFrameSize * lavaRockVideoFrameSize; pixelIndex += 1) {
      const alphaIndex = pixelIndex * 4 + 3;
      if (pixels[alphaIndex] < 16) continue;
      const x = pixelIndex % lavaRockVideoFrameSize;
      const y = Math.floor(pixelIndex / lavaRockVideoFrameSize);
      const isSecondSpecialTrail = index === 1 && x > lavaRockVideoFrameSize * 0.54 && y < lavaRockVideoFrameSize * 0.58;
      if (index === 1 && !isSecondSpecialTrail) continue;
      const topFade = Math.max(0, Math.min(1, y / tailTopFeather));
      const rightFade = Math.max(0, Math.min(1, (lavaRockVideoFrameSize - 1 - x) / tailRightFeather));
      const topRightDistance = Math.hypot(lavaRockVideoFrameSize - 1 - x, y);
      const cornerFade = Math.max(0, Math.min(1, topRightDistance / tailCornerFeather));
      const edgeFade = Math.min(topFade, rightFade, cornerFade);
      if (edgeFade < 1) pixels[alphaIndex] = Math.round(pixels[alphaIndex] * edgeFade);
    }
    lavaRockVideoFrameContext.putImageData(frame, 0, 0);
    if (lavaRockVideoCropContext) {
      let minX = lavaRockVideoFrameSize;
      let minY = lavaRockVideoFrameSize;
      let maxX = 0;
      let maxY = 0;
      for (let pixelIndex = 0; pixelIndex < lavaRockVideoFrameSize * lavaRockVideoFrameSize; pixelIndex += 1) {
        if (pixels[pixelIndex * 4 + 3] < 18) continue;
        const x = pixelIndex % lavaRockVideoFrameSize;
        const y = Math.floor(pixelIndex / lavaRockVideoFrameSize);
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
      if (maxX > minX && maxY > minY) {
        const padding = 5;
        const cropX = Math.max(0, minX - padding);
        const cropY = Math.max(0, minY - padding);
        const cropMaxX = Math.min(lavaRockVideoFrameSize - 1, maxX + padding);
        const cropMaxY = Math.min(lavaRockVideoFrameSize - 1, maxY + padding);
        const cropW = cropMaxX - cropX + 1;
        const cropH = cropMaxY - cropY + 1;
        lavaRockVideoCropCanvas.width = cropW;
        lavaRockVideoCropCanvas.height = cropH;
        lavaRockVideoCropContext.clearRect(0, 0, cropW, cropH);
        lavaRockVideoCropContext.putImageData(lavaRockVideoFrameContext.getImageData(cropX, cropY, cropW, cropH), 0, 0);
        const fitScale = Math.min(lavaRockVideoFrameSize / cropW, lavaRockVideoFrameSize / cropH);
        const fitW = cropW * fitScale;
        const fitH = cropH * fitScale;
        const fitX = (lavaRockVideoFrameSize - fitW) / 2;
        const fitY = (lavaRockVideoFrameSize - fitH) / 2;
        lavaRockVideoFrameContext.clearRect(0, 0, lavaRockVideoFrameSize, lavaRockVideoFrameSize);
        lavaRockVideoFrameContext.drawImage(lavaRockVideoCropCanvas, fitX, fitY, fitW, fitH);
      }
    }
    lavaRockVideoFrameStamp = frameStamp;
    lavaRockVideoFrameSource = index;
    return lavaRockVideoFrameCanvas;
  };

  const seededRandom = seed => {
    let value = seed % 2147483647;
    if (value <= 0) value += 2147483646;
    return () => {
      value = value * 16807 % 2147483647;
      return (value - 1) / 2147483646;
    };
  };

  const shuffleBackgroundDeck = () => {
    backgroundDeck = backgroundSprites.map((_, index) => index);
    for (let index = backgroundDeck.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [backgroundDeck[index], backgroundDeck[swapIndex]] = [backgroundDeck[swapIndex], backgroundDeck[index]];
    }
    if (backgroundDeck.length > 1 && backgroundDeck[0] === lastBackgroundIndex) {
      [backgroundDeck[0], backgroundDeck[1]] = [backgroundDeck[1], backgroundDeck[0]];
    }
  };

  const chooseLevelBackground = () => {
    if (!backgroundDeck.length) shuffleBackgroundDeck();
    currentBackgroundIndex = backgroundDeck.shift();
    lastBackgroundIndex = currentBackgroundIndex;
  };

  const shuffleStartingPlatformDeck = () => {
    startingPlatformDeck = platformSprites
      .map((_, index) => index)
      .filter(index => index !== smallPlatformSpriteIndex && !challengePlatformSpriteIndexSet.has(index) && !retiredPlatformSpriteIndexes.has(index));
    for (let index = startingPlatformDeck.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [startingPlatformDeck[index], startingPlatformDeck[swapIndex]] = [startingPlatformDeck[swapIndex], startingPlatformDeck[index]];
    }
    if (startingPlatformDeck.length > 1 && startingPlatformDeck[0] === lastStartingPlatformSprite) {
      [startingPlatformDeck[0], startingPlatformDeck[1]] = [startingPlatformDeck[1], startingPlatformDeck[0]];
    }
  };

  const chooseStartingPlatformSprite = () => {
    if (!startingPlatformDeck.length) shuffleStartingPlatformDeck();
    currentStartingPlatformSprite = startingPlatformDeck.shift();
    lastStartingPlatformSprite = currentStartingPlatformSprite;
  };

  const generateLevel = () => {
    const random = seededRandom(levelSeed + level * 971);
    const mode = getDifficultySettings();
    const targetX = Math.min(2600 + level * 320, 5000);
    let lastPlatformSprite = currentStartingPlatformSprite;
    const choosePlatformSprite = (width, forceSmallPlatform = false, challengePlatformSpriteIndex = null, reservedSprites = new Set()) => {
      if (forceSmallPlatform && !reservedSprites.has(smallPlatformSpriteIndex)) {
        lastPlatformSprite = smallPlatformSpriteIndex;
        return smallPlatformSpriteIndex;
      }
      if (Number.isInteger(challengePlatformSpriteIndex) && !reservedSprites.has(challengePlatformSpriteIndex)) {
        lastPlatformSprite = challengePlatformSpriteIndex;
        return challengePlatformSpriteIndex;
      }
      const widePlatforms = [0, 2, 6, 7, 9, 11, 12, 13, 14, 15, 17, 18, 22, 23, 24, 25, dragonHeadPlatformSpriteIndex, churchPlatformSpriteIndex, bishopPlatformSpriteIndex];
      const islandPlatforms = [1, 2, 3, 4, 5, horseHeadPlatformSpriteIndex, 10, 11, 12, 14, 15, 20];
      const choices = width > 230 ? widePlatforms : islandPlatforms;
      const activeChoices = choices.filter(choice => !retiredPlatformSpriteIndexes.has(choice));
      const allRegularPlatforms = [...new Set([...widePlatforms, ...islandPlatforms])]
        .filter(choice => !retiredPlatformSpriteIndexes.has(choice));
      const unseenChoices = activeChoices.filter(choice => !reservedSprites.has(choice));
      const unseenAlternates = allRegularPlatforms.filter(choice => !reservedSprites.has(choice));
      const availableChoices = unseenChoices.length ? unseenChoices : unseenAlternates;
      const sprite = availableChoices[Math.floor(random() * availableChoices.length)];
      lastPlatformSprite = sprite;
      return sprite;
    };
    platforms = [{ x: 0, y: 430, w: 280, h: 34, sprite: currentStartingPlatformSprite }];
    coins = [];
    let x = 280;
    let y = 430;
    // Keep the playable platforms beneath background 009's spectator ledge
    // so the platform artwork cannot cover the cartoon crowd.
    const minPlatformY = currentBackgroundIndex === background009Index ? 340 : 258;
    const maxPlatformY = 438;
    const levelVerticalProgress = Math.min(1, Math.max(0, level - 1) / 7);
    const platformRepeatClearance = gameViewportWidth + 120;
    while (x < targetX) {
      const difficulty = Math.min(level, 8);
      const reservedPlatformSprites = new Set(platforms
        .filter(platform => x - (platform.x + platform.w) < platformRepeatClearance)
        .map(platform => platform.sprite));
      const challengePlatformChance = mode.challengePlatformChance;
      let challengePlatformSpriteIndex = null;
      if (!challengePlatformSpriteIndexSet.has(lastPlatformSprite) && random() < challengePlatformChance) {
        const availableChallengePlatforms = challengePlatformSpriteIndexes.filter(sprite => !reservedPlatformSprites.has(sprite));
        if (availableChallengePlatforms.length) {
          challengePlatformSpriteIndex = availableChallengePlatforms[Math.floor(random() * availableChallengePlatforms.length)];
        }
      }
      const smallPlatformChance = mode.smallPlatformChance;
      const useSmallPlatform = challengePlatformSpriteIndex === null
        && !reservedPlatformSprites.has(smallPlatformSpriteIndex)
        && random() < smallPlatformChance;
      const challengePlatformIsTall = tallChallengePlatformSpriteIndexSet.has(challengePlatformSpriteIndex);
      const challengePlatformIsWide = challengePlatformSpriteIndex === 30;
      const width = (challengePlatformSpriteIndex !== null
        ? challengePlatformIsTall
          ? 118 + random() * 32
          : challengePlatformIsWide
            ? 165 + random() * 50
            : 138 + random() * 42
        : useSmallPlatform
          ? 72 + random() * 22
          : 175 + random() * 115) * mode.platformWidthScale;
      let nextY = y;
      const variationChance = Math.min(0.98, mode.verticalVariationChance + levelVerticalProgress * 0.08);
      if (random() < variationChance) {
        const availableRise = y - minPlatformY;
        const availableDrop = maxPlatformY - y;
        const largeDropChance = Math.min(0.72, mode.largeDropChance * (0.72 + levelVerticalProgress * 0.58));
        const useLargeDrop = availableDrop >= mode.largeDropMin * 0.85 && random() < largeDropChance;
        const downBias = y < 318 ? 0.72 : y > 400 ? 0.28 : 0.54;
        let moveDown = useLargeDrop || random() < downBias;
        if (availableDrop < mode.verticalDropMin * 0.75) moveDown = false;
        if (availableRise < mode.verticalRiseMin * 0.75) moveDown = true;
        const levelStepScale = 0.78 + levelVerticalProgress * 0.22;
        if (moveDown) {
          const minimumDrop = useLargeDrop ? mode.largeDropMin : mode.verticalDropMin;
          const maximumDrop = useLargeDrop ? mode.largeDropMax : mode.verticalDropMax;
          const drop = (minimumDrop + random() * (maximumDrop - minimumDrop)) * levelStepScale;
          nextY = Math.min(maxPlatformY, y + drop);
        } else {
          const rise = (mode.verticalRiseMin + random() * (mode.verticalRiseMax - mode.verticalRiseMin)) * levelStepScale;
          nextY = Math.max(minPlatformY, y - rise);
        }
        nextY = Math.round(nextY);
      }
      const verticalDelta = nextY - y;
      const upwardDelta = Math.max(0, -verticalDelta);
      const downwardDelta = Math.max(0, verticalDelta);
      const dropSpacingBoost = downwardDelta * (0.08 + levelVerticalProgress * 0.04);
      const desiredGap = (92 + difficulty * 2 + random() * (56 + difficulty * 4)) * mode.platformGapScale + dropSpacingBoost;
      const currentMoveSpeed = moveSpeed * mode.playerSpeedMultiplier;
      const currentJumpPower = Math.abs(jumpPower * mode.jumpPowerMultiplier);
      const currentGravity = gravity * mode.gravityMultiplier;
      const jumpDiscriminant = Math.max(0, currentJumpPower * currentJumpPower + 2 * currentGravity * verticalDelta);
      const landingFrames = (currentJumpPower + Math.sqrt(jumpDiscriminant)) / currentGravity;
      const physicsGapLimit = currentMoveSpeed * landingFrames * 0.96;
      const configuredGapLimit = maxFairPlatformGap
        + mode.platformGapBonus
        - upwardDelta * upwardGapPenalty
        + downwardDelta * mode.downwardGapReward;
      const landingWidthPenalty = useSmallPlatform ? 18 : challengePlatformIsTall ? 14 : challengePlatformSpriteIndex !== null ? 8 : 0;
      const fairGapLimit = Math.max(84, Math.min(physicsGapLimit, configuredGapLimit) - landingWidthPenalty);
      const gap = Math.min(desiredGap, fairGapLimit);
      y = nextY;
      x += gap;
      platforms.push({
        x,
        y,
        w: width,
        h: 30,
        sprite: choosePlatformSprite(width, useSmallPlatform, challengePlatformSpriteIndex, reservedPlatformSprites)
      });
      if (random() > 0.35) coins.push({ x: x + width * 0.5, y: y - 44, taken: false });
      x += width;
    }
    const last = platforms[platforms.length - 1];
    const flagAnchor = platformFlagAnchors[last.sprite] || {};
    const flagX = Number.isFinite(flagAnchor.xRatio)
      ? last.x + last.w * flagAnchor.xRatio
      : last.x + last.w - 34;
    const flagSurfaceY = getPlatformSurfaceY(last, flagX);
    flag = { x: flagX, y: flagSurfaceY - 86 };
    [...new Set(platforms.map(platform => platform.sprite))].forEach(ensurePlatformSprite);
  };

  const triggerColtDeath = () => {
    if (lost) return;
    const lostCoins = score;
    deathStatusText = lostCoins > 0
      ? `${characterNames[selectedCharacter]} lost ${lostCoins} coins. Press R or Enter to start again.`
      : `${characterNames[selectedCharacter]} lost all coins. Press R or Enter to start again.`;
    lost = true;
    player.vx = 0;
    player.vy = 0;
    player.grounded = false;
    player.state = "death";
    stopRunningAudio();
    stopGameplayCues();
    if (selectedCharacter === "mrNieves") playMrNievesDeathAudio();
    else playColtDeathAudio();
    deathStartedAt = performance.now();
    deathX = player.x;
    deathFallStartY = Math.min(player.y, gameViewportHeight - player.h + 6);
    deathY = deathFallStartY;
    deathFrameStamp = -1;
    const activeDeathVideo = selectedCharacter === "mrNieves" ? chooseMrNievesDeathVideo() : deathVideo;
    ensureMediaSource(activeDeathVideo);
    try {
      activeDeathVideo.currentTime = 0;
    } catch {}
    if (selectedCharacter === "mrNieves") keepMrNievesDeathVideoPlaying();
    else keepDeathVideoPlaying();
    syncGameStatus();
  };

  const updateColtDeath = now => {
    if (!deathStartedAt) return;
    const elapsed = Math.max(0, (now - deathStartedAt) / 1000);
    deathY = deathFallStartY + 70 * elapsed + 420 * elapsed * elapsed;
    cameraX = Math.max(0, deathX - 230);
  };

  const coltDeathHasFallen = () => {
    if (!lost || !deathStartedAt) return false;
    return deathY > gameViewportHeight + 70 || performance.now() - deathStartedAt > 1600;
  };

  const finishRunAfterDeath = () => {
    if (deathLeaderboardHandled) return;
    deathLeaderboardHandled = true;
    const finalCoins = score;
    const finalSeconds = Math.max(1, Math.round(runTimeBankSeconds + Math.max(0, (deathStartedAt - levelStart) / 1000)));
    const finalDifficulty = normalizeDifficultyMode(difficultyMode);
    score = 0;
    scoreNode.textContent = score;
    if (leaderboardQualifies(finalCoins, finalSeconds, finalDifficulty)) {
      pendingLeaderboardEntry = { coins: finalCoins, seconds: finalSeconds, difficulty: finalDifficulty };
      if (leaderboardPromptsEnabled) {
        openLeaderboard();
      }
    }
    syncGameStatus();
  };

  const getColtHazardHitbox = () => ({
    left: player.x + 12,
    right: player.x + player.w - 9,
    top: player.y + 17,
    bottom: player.y + player.h - 5
  });

  const getLavaRockSprite = rock => {
    if (rock.videoSpecial) return getTransparentLavaRockVideoFrame(rock.videoSpecialIndex || 0);
    if (rock.shower) return ensureLavaRockShowerSprite(rock.showerType || 0);
    return ensureLavaRockSprite(rock.rockType);
  };

  const getLavaRockDrawBox = rock => {
    let ratio = 1;
    if (!rock.videoSpecial) {
      const sprite = rock.shower
        ? ensureLavaRockShowerSprite(rock.showerType || 0)
        : ensureLavaRockSprite(rock.rockType);
      const naturalWidth = sprite.complete ? sprite.naturalWidth : 0;
      const naturalHeight = sprite.complete ? sprite.naturalHeight : 0;
      if (rock.drawNaturalWidth !== naturalWidth || rock.drawNaturalHeight !== naturalHeight) {
        rock.drawRatio = naturalWidth ? naturalHeight / naturalWidth : 1.18;
        rock.drawNaturalWidth = naturalWidth;
        rock.drawNaturalHeight = naturalHeight;
      }
      ratio = rock.drawRatio;
    }
    const box = rock.drawBox || (rock.drawBox = { x: 0, y: 0, w: 0, h: 0 });
    box.x = rock.x;
    box.y = rock.y;
    box.w = rock.size;
    box.h = rock.size * ratio;
    return box;
  };

  const getLavaRockProfiles = rock => {
    if (rock.videoSpecial) return lavaRockVideoSpecialHitProfiles;
    if (rock.shower) {
      return lavaRockShowerHitProfiles[(rock.showerType || 0) % lavaRockShowerHitProfiles.length]
        || lavaRockShowerHitProfiles[0];
    }
    return lavaRockSingleHitProfiles[rock.rockType % lavaRockSingleHitProfiles.length] || lavaRockSingleHitProfiles[0];
  };

  const lavaRockHitsRect = (rock, rect) => {
    const box = getLavaRockDrawBox(rock);
    const profiles = getLavaRockProfiles(rock);
    for (const profile of profiles) {
      const x = box.x + box.w * profile.coreX;
      const y = box.y + box.h * profile.coreY;
      const rx = box.w * profile.rx;
      const ry = box.h * profile.ry;
      const closestX = Math.max(rect.left, Math.min(x, rect.right));
      const closestY = Math.max(rect.top, Math.min(y, rect.bottom));
      const normalizedX = (closestX - x) / rx;
      const normalizedY = (closestY - y) / ry;
      if (normalizedX * normalizedX + normalizedY * normalizedY <= 1) return true;
    }
    return false;
  };

  const lavaRockHasForwardCoverage = rock => {
    const box = getLavaRockDrawBox(rock);
    const profiles = getLavaRockProfiles(rock);
    for (const profile of profiles) {
      const x = box.x + box.w * profile.coreX;
      const y = box.y + box.h * profile.coreY;
      if (
        x > player.x + player.w &&
        x < cameraX + gameViewportWidth + 180 &&
        y < gameViewportHeight * 0.74
      ) return true;
    }
    return false;
  };

  const scheduleNextLavaRock = now => {
    const difficulty = Math.min(level, 8);
    const mode = getDifficultySettings();
    const interval = Math.max(
      lavaRockMinInterval * mode.rockIntervalMultiplier,
      (lavaRockBaseInterval - difficulty * 70) * mode.rockIntervalMultiplier
    );
    const jitter = Math.max(140, (540 - difficulty * 24) * mode.rockIntervalMultiplier);
    nextLavaRockAt = now + interval + Math.random() * jitter;
  };

  const scheduleNextLavaRockShower = now => {
    const difficulty = Math.min(level, 8);
    const mode = getDifficultySettings();
    const interval = Math.max(
      lavaRockShowerMinInterval * mode.showerIntervalMultiplier,
      (lavaRockShowerBaseInterval - difficulty * 260) * mode.showerIntervalMultiplier
    );
    nextLavaRockShowerAt = now + interval + Math.random() * (2600 * mode.showerIntervalMultiplier);
  };

  const spawnLavaRock = (now, xHint = null, forwardSpawn = false) => {
    const difficulty = Math.min(level, 8);
    const mode = getDifficultySettings();
    const speed = mode.rockSpeedMultiplier;
    const rockType = chooseRegularLavaRockSpriteIndex();
    ensureLavaRockSprite(rockType);
    const baseSize = 116 + Math.random() * 32 + difficulty * 2;
    const size = baseSize * (lavaRockSizeMultipliers[rockType] || 1);
    const minX = forwardSpawn ? Math.max(cameraX + gameViewportWidth * 0.48, player.x + 170) : cameraX + 54;
    const maxX = forwardSpawn ? cameraX + gameViewportWidth + 260 - size : cameraX + gameViewportWidth - size - 36;
    let x = Number.isFinite(xHint) ? xHint : minX + Math.random() * Math.max(1, maxX - minX);
    x = Math.max(minX, Math.min(maxX, x));
    const playerCenter = player.x + player.w / 2;
    const rockCoreOffset = size * (lavaRockHitProfiles[rockType]?.coreX || 0.35);
    if (Math.abs(x + rockCoreOffset - playerCenter) < 120) {
      x += x + rockCoreOffset < playerCenter ? -145 : 145;
      x = Math.max(minX, Math.min(maxX, x));
    }
    fallingLavaRocks.push({
      x,
      y: -size * (1.35 + Math.random() * 0.45),
      size,
      vx: (-0.78 - Math.random() * 0.54) * speed,
      vy: (3.45 + difficulty * 0.13 + Math.random() * 0.72) * speed,
      rockType,
      spin: (Math.random() - 0.5) * 0.08,
      angle: (Math.random() - 0.5) * 0.12,
      bornAt: now
    });
  };

  const spawnLavaRockShower = (now, showerType = 0) => {
    const difficulty = Math.min(level, 8);
    const mode = getDifficultySettings();
    const speed = mode.rockSpeedMultiplier;
    const isWideShower = showerType !== 0;
    ensureLavaRockShowerSprite(showerType);
    const size = isWideShower
      ? Math.min(gameViewportWidth * 0.72, 620 + difficulty * 12)
      : Math.min(gameViewportWidth * 0.52, 430 + difficulty * 8);
    const minX = Math.max(cameraX + gameViewportWidth * (isWideShower ? 0.02 : 0.08), player.x + 120);
    const maxX = cameraX + gameViewportWidth * (isWideShower ? 0.32 : 0.48);
    const x = minX + Math.random() * Math.max(1, maxX - minX);
    fallingLavaRocks.push({
      shower: true,
      showerType,
      x,
      y: -size * (1.05 + Math.random() * 0.2),
      size,
      vx: ((isWideShower ? -0.72 : -0.62) - Math.random() * 0.24) * speed,
      vy: ((isWideShower ? 2.65 : 2.85) + difficulty * 0.08 + Math.random() * 0.28) * speed,
      rockType: 0,
      spin: 0,
      angle: (Math.random() - 0.5) * 0.035,
      bornAt: now
    });
  };

  const spawnLavaRockVideoSpecial = (now, specialIndex = 0) => {
    const difficulty = Math.min(level, 8);
    const mode = getDifficultySettings();
    const speed = mode.rockSpeedMultiplier;
    const videoSpecialIndex = Math.max(0, Math.min(lavaRockVideoSpecials.length - 1, specialIndex));
    const size = Math.min(gameViewportWidth * 0.52, 430 + difficulty * 8);
    const minX = Math.max(cameraX + gameViewportWidth * 0.08, player.x + 140);
    const maxX = cameraX + gameViewportWidth * 0.48;
    const x = minX + Math.random() * Math.max(1, maxX - minX);
    const video = getLavaRockVideoSpecial(videoSpecialIndex);
    ensureMediaSource(video);
    try {
      video.currentTime = 0;
      lavaRockVideoFrameStamp = -1;
      lavaRockVideoFrameSource = -1;
    } catch {}
    keepLavaRockVideoSpecialPlaying(videoSpecialIndex);
    fallingLavaRocks.push({
      videoSpecial: true,
      videoSpecialIndex,
      x,
      y: -size * (1.05 + Math.random() * 0.2),
      size,
      vx: (-0.62 - Math.random() * 0.24) * speed,
      vy: (2.85 + difficulty * 0.08 + Math.random() * 0.28) * speed,
      rockType: 0,
      spin: 0,
      angle: (Math.random() - 0.5) * 0.035,
      bornAt: now
    });
  };

  const updateLavaRocks = (now, deltaScale) => {
    const difficulty = Math.min(level, 8);
    const mode = getDifficultySettings();
    const maxActiveRocks = Math.max(1, Math.min(mode.maxActiveRocks, 3 + Math.floor(difficulty / 2) + mode.activeRockBonus));
    if (!nextLavaRockAt) scheduleNextLavaRock(now + 500);
    if (!nextLavaRockShowerAt) scheduleNextLavaRockShower(now + 4200);
    if (now >= nextLavaRockAt) {
      const openSlots = maxActiveRocks - fallingLavaRocks.length;
      if (openSlots > 0) {
        const doubleDropChance = Math.min(0.82, (0.2 + difficulty * 0.025) * mode.doubleDropMultiplier);
        const drops = openSlots > 1 && Math.random() < doubleDropChance ? Math.min(openSlots, mode.maxDrops) : 1;
        const firstX = cameraX + gameViewportWidth * 0.38 + Math.random() * Math.max(1, gameViewportWidth * 0.68);
        for (let dropIndex = 0; dropIndex < drops; dropIndex += 1) {
          const spacing = 210 + Math.random() * 160;
          const direction = Math.random() < 0.5 ? -1 : 1;
          const xHint = dropIndex ? firstX + spacing * direction : firstX;
          spawnLavaRock(now + dropIndex * 90, xHint, true);
        }
      }
      scheduleNextLavaRock(now);
    }
    if (now >= nextLavaRockShowerAt) {
      const specialAlreadyActive = fallingLavaRocks.some(rock => rock.shower || rock.videoSpecial);
      if (!specialAlreadyActive && fallingLavaRocks.length <= maxActiveRocks - 2) {
        const specialChoice = Math.floor(Math.random() * (lavaRockVideoSpecials.length + lavaRockShowerSprites.length));
        if (specialChoice < lavaRockVideoSpecials.length) spawnLavaRockVideoSpecial(now, specialChoice);
        else spawnLavaRockShower(now, specialChoice - lavaRockVideoSpecials.length);
      }
      scheduleNextLavaRockShower(now);
    }
    const hasForwardCoverage = fallingLavaRocks.some(lavaRockHasForwardCoverage);
    if (!hasForwardCoverage && player.vx > moveSpeed * 0.65 && fallingLavaRocks.length < maxActiveRocks && now >= nextForwardLavaRockAt) {
      spawnLavaRock(now, player.x + 230 + Math.random() * 260, true);
      nextForwardLavaRockAt = now + mode.forwardCooldown;
    }
    let activeRockCount = 0;
    for (const rock of fallingLavaRocks) {
      rock.x += rock.vx * deltaScale;
      rock.y += rock.vy * deltaScale;
      rock.angle += rock.spin * 0.08 * deltaScale;
      const box = getLavaRockDrawBox(rock);
      const screenX = box.x - cameraX;
      if (box.y < gameViewportHeight + box.h + 80 && screenX > -box.w - 220 && screenX < gameViewportWidth + 360) {
        fallingLavaRocks[activeRockCount] = rock;
        activeRockCount += 1;
      }
    }
    fallingLavaRocks.length = activeRockCount;
    lavaRockVideoSpecials.forEach((video, index) => {
      const isActive = fallingLavaRocks.some(rock => rock.videoSpecial && rock.videoSpecialIndex === index);
      if (!isActive && !video.paused) video.pause();
    });
  };

  const completeFinishLanding = () => {
    const landingPlatform = finishPlatform || platforms[platforms.length - 1];
    if (!landingPlatform) return;
    const footX = Math.max(
      landingPlatform.x + 6,
      Math.min(landingPlatform.x + landingPlatform.w - 6, player.x + player.w / 2)
    );
    player.x = Math.max(
      landingPlatform.x + 4,
      Math.min(landingPlatform.x + landingPlatform.w - player.w - 4, footX - player.w / 2)
    );
    player.y = getPlatformSurfaceY(landingPlatform, player.x + player.w / 2) - player.h;
    player.vx = 0;
    player.vy = 0;
    player.grounded = true;
    player.groundPlatform = landingPlatform;
    player.state = "celebrate";
    finishLandingPending = false;
    won = true;
    runTimeBankSeconds += finishTouchElapsedSeconds;
    finishTouchElapsedSeconds = 0;
    if (selectedCharacter === "mrNieves") {
      chooseMrNievesCelebrationVideo();
      keepMrNievesCelebrationVideoPlaying();
    } else {
      coltCelebrationAudioPending = true;
      coltCelebrationLastVideoTime = 0;
      try {
        coltCelebrationVideo.currentTime = 0;
      } catch {}
      keepColtCelebrationVideoPlaying();
    }
    scoreNode.textContent = score;
    if (nextLevelButton) nextLevelButton.disabled = false;
    syncGameStatus();
  };

  const beginFinishLanding = now => {
    if (finishLandingPending || won || lost) return;
    finishPlatform = platforms[platforms.length - 1] || null;
    if (!finishPlatform) return;
    stopRunningAudio();
    if (selectedCharacter === "mrNieves") playMrNievesCelebrationAudio();
    finishLandingPending = true;
    finishTouchElapsedSeconds = Math.max(0, (now - levelStart) / 1000);
    if (nextLevelButton) nextLevelButton.disabled = true;
    fallingLavaRocks = [];
    nextLavaRockAt = 0;
    nextForwardLavaRockAt = 0;
    nextLavaRockShowerAt = 0;
    player.vx = 0;
    const minPlayerX = finishPlatform.x + 4;
    const maxPlayerX = Math.max(minPlayerX, finishPlatform.x + finishPlatform.w - player.w - 4);
    player.x = Math.max(minPlayerX, Math.min(maxPlayerX, player.x));
    const surfaceY = getPlatformSurfaceY(finishPlatform, player.x + player.w / 2);
    const alreadyLanded = player.grounded && player.groundPlatform === finishPlatform;
    if (alreadyLanded || player.y + player.h >= surfaceY - 1) {
      completeFinishLanding();
      return;
    }
    player.grounded = false;
    player.groundPlatform = null;
    player.state = "leap";
    if (selectedCharacter === "mrNieves") chooseMrNievesInAirVideo();
    stopRunningAudio();
    syncGameStatus();
  };

  const updateFinishLanding = deltaScale => {
    if (!finishLandingPending || !finishPlatform) return;
    const mode = getDifficultySettings();
    const currentGravity = gravity * mode.gravityMultiplier;
    const previousVerticalVelocity = player.vy;
    player.vy += currentGravity * deltaScale;
    player.y += previousVerticalVelocity * deltaScale + currentGravity * deltaScale * (deltaScale + 1) / 2;
    const minPlayerX = finishPlatform.x + 4;
    const maxPlayerX = Math.max(minPlayerX, finishPlatform.x + finishPlatform.w - player.w - 4);
    player.x = Math.max(minPlayerX, Math.min(maxPlayerX, player.x));
    const surfaceY = getPlatformSurfaceY(finishPlatform, player.x + player.w / 2);
    if (player.y + player.h >= surfaceY) {
      completeFinishLanding();
      return;
    }
    player.grounded = false;
    player.groundPlatform = null;
    player.state = "leap";
  };

  const resetLevel = (newSeed = false, keepRun = false, preservePendingLeaderboardEntry = false) => {
    if (newSeed) {
      levelSeed = Date.now() + Math.floor(Math.random() * 9999);
      chooseLevelBackground();
      chooseStartingPlatformSprite();
    }
    ensureBackgroundSprite(currentBackgroundIndex);
    animatedBackgroundReadyAt = performance.now() + 1200;
    animatedBackgroundVideos.forEach((video, index) => {
      if (index !== currentBackgroundIndex && !video.paused) video.pause();
    });
    generateLevel();
    Object.assign(player, { x: 48, y: 300, vx: 0, vy: 0, grounded: false, groundPlatform: null, facing: 1, state: "idle", jumpPrepUntil: 0 });
    cameraX = 0;
    if (!keepRun) {
      score = 0;
      runTimeBankSeconds = 0;
      if (!preservePendingLeaderboardEntry) pendingLeaderboardEntry = null;
      leaderboardOpenedAt = 0;
      if (leaderboardPanel) leaderboardPanel.hidden = true;
    }
    won = false;
    lost = false;
    finishLandingPending = false;
    finishPlatform = null;
    finishTouchElapsedSeconds = 0;
    coltCelebrationAudioPending = false;
    coltCelebrationLastVideoTime = 0;
    deathLeaderboardHandled = false;
    deathStatusText = "";
    deathStartedAt = 0;
    deathX = 0;
    deathY = 0;
    deathFallStartY = 0;
    fallingLavaRocks = [];
    stopRunningAudio();
    const mode = getDifficultySettings();
    nextLavaRockAt = performance.now() + 1400 * mode.rockIntervalMultiplier;
    nextForwardLavaRockAt = performance.now() + mode.forwardCooldown;
    nextLavaRockShowerAt = performance.now() + (3200 + Math.random() * 1800) * mode.showerIntervalMultiplier;
    deathVideo.pause();
    coltCelebrationVideo.pause();
    try {
      coltCelebrationVideo.currentTime = 0;
    } catch {}
    mrNievesDeathVideos.forEach(video => video.pause());
    stopGameplayCues();
    coltDeathAudios.forEach(stopAndRewindAudio);
    coltCelebrationAudios.forEach(audio => {
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch {}
    });
    mrNievesDeathAudios.forEach(audio => {
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch {}
    });
    mrNievesCelebrationAudios.forEach(audio => {
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch {}
    });
    lavaRockVideoSpecials.forEach(video => video.pause());
    lavaRockVideoFrameStamp = -1;
    lavaRockVideoFrameSource = -1;
    lastSimulationFrameAt = 0;
    levelStart = performance.now();
    levelDurationSeconds = getLevelDurationSeconds();
    syncGameStatus();
    levelNode.textContent = level;
    scoreNode.textContent = score;
    setTimeDisplay(levelDurationSeconds.toFixed(1));
    if (nextLevelButton) nextLevelButton.disabled = true;
    canvas.focus({ preventScroll: true });
  };

  const nextLevel = () => {
    level += 1;
    resetLevel(true, true);
    playGameplayCue(nextLevelAudio);
  };

  const drawDeathColt = () => {
    const isMrNieves = selectedCharacter === "mrNieves";
    const drawW = (isMrNieves ? 144 : 178) * deathColtDrawScale;
    const drawH = (isMrNieves ? 178 : 132) * deathColtDrawScale;
    const x = Math.round(deathX - cameraX + player.w / 2);
    const y = Math.round(deathY + player.h - drawH + (isMrNieves ? 22 : 8));
    const mrNievesDeathReady = isMrNieves && getMrNievesDeathVideo().readyState >= 2;
    const deathFrame = isMrNieves
      ? getTransparentMrNievesDeathFrame() || getTransparentMrNievesIdleFrame()
      : getTransparentDeathFrame();
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(player.facing, 1);
    ctx.shadowColor = "rgba(0, 0, 0, 0.44)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 8;
    if (deathFrame) {
      if (isMrNieves && mrNievesDeathReady) keepMrNievesDeathVideoPlaying();
      else if (isMrNieves) keepMrNievesIdleVideoPlaying();
      else keepDeathVideoPlaying();
      ctx.drawImage(deathFrame, -drawW / 2, 0, drawW, drawH);
    } else if (!isMrNieves && coltSprites.deathLoading.complete && coltSprites.deathLoading.naturalWidth) {
      ctx.drawImage(coltSprites.deathLoading, -drawW / 2, 0, drawW, drawH);
    } else {
      ctx.fillStyle = "#7b0b31";
      ctx.fillRect(-player.w / 2, drawH - player.h, player.w, player.h);
    }
    ctx.restore();
  };

  const getMrNievesPlatformVisualOffset = () => {
    if (!player.grounded || !player.groundPlatform) return 0;
    const platform = player.groundPlatform;
    const spriteIndex = platform.sprite % platformSprites.length;
    const footX = player.x + player.w / 2;
    const drawW = spriteIndex === smallPlatformSpriteIndex ? Math.max(platform.w + 28, platform.w * 1.14) : Math.max(platform.w + 72, platform.w * 1.22);
    const imageLeft = platform.x - (drawW - platform.w) / 2;
    const localX = Math.max(0, Math.min(1, (footX - imageLeft) / drawW));
    if (spriteIndex === 14) {
      if (localX < 0.35) return 4;
      if (localX > 0.82) return -12;
      return 4 + ((localX - 0.35) / 0.47) * -16;
    }
    return 0;
  };

  const drawColt = () => {
    if (lost) {
      drawDeathColt();
      return;
    }
    const runFrames = [coltSprites.run, coltSprites.run2, coltSprites.run3];
    const runFrame = Math.floor(performance.now() / 115) % runFrames.length;
    const sprite = player.state === "run"
      ? runFrames[runFrame]
      : coltSprites[player.state] || coltSprites.idle;
    const isMrNieves = selectedCharacter === "mrNieves";
    const mrNievesIsJumping = isMrNieves && player.state === "jumpPrep";
    const mrNievesIsInAir = isMrNieves && player.state === "leap";
    const mrNievesIsRunning = isMrNieves && player.state === "run";
    const mrNievesIsCelebrating = isMrNieves && player.state === "celebrate";
    const coltIsCelebrating = !isMrNieves && player.state === "celebrate";
    const drawW = isMrNieves ? (mrNievesIsJumping ? 154 : mrNievesIsInAir ? 150 : mrNievesIsCelebrating ? 132 : mrNievesIsRunning ? 128 : 128) : coltIsCelebrating ? 180 : player.state === "idle" ? 154 : player.state === "run" ? 170 : player.state === "leap" ? 164 : player.state === "jumpPrep" ? 132 : 124;
    const drawH = isMrNieves ? (mrNievesIsJumping ? 142 : mrNievesIsInAir ? 140 : mrNievesIsCelebrating ? 154 : mrNievesIsRunning ? 154 : 154) : coltIsCelebrating ? 123 : player.state === "idle" ? 104 : player.state === "run" ? 100 : player.state === "leap" ? 112 : player.state === "jumpPrep" ? 100 : 84;
    const x = Math.round(player.x - cameraX + player.w / 2);
    const y = Math.round(player.y + player.h - drawH + (isMrNieves ? 10 + getMrNievesPlatformVisualOffset() : 8));
    ctx.save();
    if (!isMrNieves) ctx.imageSmoothingEnabled = false;
    ctx.translate(x, y);
    ctx.scale(player.facing, 1);
    ctx.shadowColor = "rgba(0, 0, 0, 0.42)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 8;
    const mrNievesFrame = isMrNieves
      ? (mrNievesIsJumping ? getTransparentMrNievesJumpFrame() || getTransparentMrNievesIdleFrame() : mrNievesIsInAir ? getTransparentMrNievesInAirFrame() || getTransparentMrNievesJumpFrame() || getTransparentMrNievesIdleFrame() : mrNievesIsCelebrating ? getTransparentMrNievesCelebrationFrame() || getTransparentMrNievesIdleFrame() : mrNievesIsRunning ? getTransparentMrNievesRunFrame() || getTransparentMrNievesIdleFrame() : getTransparentMrNievesIdleFrame())
      : null;
    const idleFrame = !isMrNieves && player.state === "idle" ? getTransparentIdleFrame() : null;
    const runningFrame = !isMrNieves && player.state === "run" ? getTransparentRunFrame() : null;
    const leapFrame = !isMrNieves && player.state === "leap" ? getTransparentLeapFrame() : null;
    const coltCelebrationFrame = coltIsCelebrating ? getTransparentColtCelebrationFrame() : null;
    if (mrNievesFrame) {
      if (mrNievesIsCelebrating && getMrNievesCelebrationVideo().readyState >= 2) keepMrNievesCelebrationVideoPlaying();
      else if (mrNievesIsInAir && getMrNievesInAirVideo().readyState >= 2) keepMrNievesInAirVideoPlaying();
      else if (mrNievesIsRunning && mrNievesRunVideo.readyState >= 2) keepMrNievesRunVideoPlaying();
      else keepMrNievesIdleVideoPlaying();
      ctx.drawImage(mrNievesFrame, -drawW / 2, 0, drawW, drawH);
    } else if (idleFrame) {
      keepIdleVideoPlaying();
      ctx.drawImage(idleFrame, -drawW / 2, 0, drawW, drawH);
    } else if (runningFrame) {
      keepRunVideoPlaying();
      ctx.drawImage(runningFrame, -drawW / 2, 0, drawW, drawH);
    } else if (leapFrame) {
      keepLeapVideoPlaying();
      ctx.drawImage(leapFrame, -drawW / 2, 0, drawW, drawH);
    } else if (coltCelebrationFrame) {
      keepColtCelebrationVideoPlaying();
      const celebrationVideoTime = coltCelebrationVideo.currentTime;
      if (celebrationVideoTime < coltCelebrationLastVideoTime - 0.25) {
        coltCelebrationAudioPending = true;
      }
      if (coltCelebrationAudioPending && celebrationVideoTime >= coltCelebrationAudioCueSeconds) {
        coltCelebrationAudioPending = false;
        playColtCelebrationAudio();
      }
      coltCelebrationLastVideoTime = celebrationVideoTime;
      ctx.drawImage(coltCelebrationFrame, -drawW / 2, 0, drawW, drawH);
    } else if (!isMrNieves && sprite.complete && sprite.naturalWidth) {
      ctx.drawImage(sprite, -drawW / 2, 0, drawW, drawH);
    } else if (!isMrNieves) {
      ctx.fillStyle = "#7b0b31";
      ctx.fillRect(-player.w / 2, drawH - player.h, player.w, player.h);
    } else {
      keepMrNievesIdleVideoPlaying();
    }
    ctx.restore();
  };

  const drawSelectPreview = (previewCanvas, frame, width, height, bottomPadding = 8) => {
    if (!previewCanvas || !frame) return;
    const previewContext = previewCanvas.getContext("2d");
    if (!previewContext) return;
    previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    previewContext.save();
    previewContext.translate(previewCanvas.width / 2, previewCanvas.height - bottomPadding);
    previewContext.shadowColor = "rgba(0, 0, 0, 0.34)";
    previewContext.shadowBlur = 10;
    previewContext.shadowOffsetY = 6;
    previewContext.drawImage(frame, -width / 2, -height, width, height);
    previewContext.restore();
  };

  const drawCharacterSelectPreviews = () => {
    if (!characterSelectOpen) return;
    keepIdleVideoPlaying();
    keepMrNievesIdleVideoPlaying();
    drawSelectPreview(selectColtCanvas, getTransparentIdleFrame(), 220, 160, 14);
    drawSelectPreview(selectMrNievesCanvas, getTransparentMrNievesIdleFrame(), 174, 198, 2);
  };

  const coverDrawRectCache = new WeakMap();
  const getCoverDrawRect = (media, sourceW, sourceH) => {
    const cacheKey = `${gameViewportWidth}x${gameViewportHeight}:${sourceW}x${sourceH}`;
    const cached = coverDrawRectCache.get(media);
    if (cached && cached.key === cacheKey) return cached;
    const scale = Math.max(gameViewportWidth / sourceW, gameViewportHeight / sourceH);
    const drawW = sourceW * scale;
    const drawH = sourceH * scale;
    const rect = {
      key: cacheKey,
      x: (gameViewportWidth - drawW) / 2,
      y: (gameViewportHeight - drawH) / 2,
      w: drawW,
      h: drawH
    };
    coverDrawRectCache.set(media, rect);
    return rect;
  };

  const drawCoverImage = image => {
    if (!image.complete || !image.naturalWidth) return false;
    const rect = getCoverDrawRect(image, image.naturalWidth, image.naturalHeight);
    ctx.drawImage(image, rect.x, rect.y, rect.w, rect.h);
    return true;
  };

  const drawCoverVideo = video => {
    if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) return false;
    const rect = getCoverDrawRect(video, video.videoWidth, video.videoHeight);
    ctx.drawImage(video, rect.x, rect.y, rect.w, rect.h);
    return true;
  };

  const drawLevelBackground = () => {
    const w = gameViewportWidth;
    const h = gameViewportHeight;
    const background = ensureBackgroundSprite(currentBackgroundIndex);
    const animatedBackground = animatedBackgroundVideos[currentBackgroundIndex];
    const useAnimatedBackground = animatedBackground && performance.now() >= animatedBackgroundReadyAt;
    if (useAnimatedBackground) keepBackgroundVideoPlaying(animatedBackground);
    const backgroundDrawn = useAnimatedBackground
      ? drawCoverVideo(animatedBackground) || drawCoverImage(background)
      : drawCoverImage(background);
    if (backgroundDrawn) {
      ctx.fillStyle = backgroundVignette;
      ctx.fillRect(0, 0, w, h);
      return;
    }
    ctx.fillStyle = fallbackSkyGradient;
    ctx.fillRect(0, 0, w, h);
  };

  const drawPlatform = platform => {
    const spriteIndex = platform.sprite % platformSprites.length;
    const sprite = platformSprites[spriteIndex];
    const surfaceRatio = platformSurfaceRatios[spriteIndex] || 0.22;
    const x = platform.x - cameraX;
    const { drawW, drawH } = getPlatformDrawSize(platform);
    const drawX = Math.round(x - (drawW - platform.w) / 2);
    const drawY = Math.round(platform.y - drawH * surfaceRatio);
    if (sprite.complete && sprite.naturalWidth) {
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 8;
      ctx.drawImage(sprite, drawX, drawY, drawW, drawH);
      ctx.restore();
      return;
    }
  };

  const drawLavaRock = rock => {
    const sprite = getLavaRockSprite(rock);
    const box = getLavaRockDrawBox(rock);
    const screenX = box.x - cameraX;
    if (screenX > gameViewportWidth + 260 || screenX + box.w < -220 || box.y > gameViewportHeight + 160) return;
    ctx.save();
    ctx.translate(screenX + box.w / 2, box.y + box.h / 2);
    ctx.rotate(rock.angle);
    ctx.shadowColor = "rgba(255, 78, 18, 0.45)";
    ctx.shadowBlur = 16;
    if (rock.videoSpecial && sprite) {
      keepLavaRockVideoSpecialPlaying(rock.videoSpecialIndex || 0);
      ctx.drawImage(sprite, -box.w / 2, -box.h / 2, box.w, box.h);
    } else if (sprite && sprite.complete && sprite.naturalWidth) {
      ctx.drawImage(sprite, -box.w / 2, -box.h / 2, box.w, box.h);
    } else {
      const gradient = ctx.createRadialGradient(0, 0, box.w * 0.08, 0, 0, box.w * 0.34);
      gradient.addColorStop(0, "#ffb21f");
      gradient.addColorStop(0.35, "#f34217");
      gradient.addColorStop(1, "#171012");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(0, 0, box.w * 0.26, box.h * 0.2, -0.25, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  const draw = () => {
    const w = gameViewportWidth;
    const h = gameViewportHeight;
    syncCharacterVideoPlayback();
    drawLevelBackground();
    platforms.forEach(platform => {
      const x = platform.x - cameraX;
      if (x > w + 160 || x + platform.w < -160) return;
      drawPlatform(platform);
    });
    let hasVisibleCoin = false;
    coins.forEach(coin => {
      if (coin.taken) return;
      const x = coin.x - cameraX;
      if (x < -40 || x > w + 40) return;
      hasVisibleCoin = true;
      const coinSize = 58;
      keepCoinVideoPlaying();
      const transparentCoinFrame = getTransparentCoinFrame();
      if (transparentCoinFrame) {
        ctx.save();
        ctx.shadowColor = "rgba(255, 82, 21, 0.52)";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(x, coin.y, coinSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(transparentCoinFrame, x - coinSize / 2, coin.y - coinSize / 2, coinSize, coinSize);
        ctx.restore();
      } else if (coinSprite.complete && coinSprite.naturalWidth) {
        ctx.save();
        ctx.shadowColor = "rgba(255, 82, 21, 0.52)";
        ctx.shadowBlur = 12;
        ctx.drawImage(coinSprite, x - coinSize / 2, coin.y - coinSize / 2, coinSize, coinSize);
        ctx.restore();
      }
    });
    if (!hasVisibleCoin && !coinVideo.paused) coinVideo.pause();
    const flagX = flag.x - cameraX;
    const flagIsVisible = flagX > -140 && flagX < w + 140;
    if (flagIsVisible) keepFlagVideoPlaying();
    else if (!flagVideo.paused) flagVideo.pause();
    const transparentFlagFrame = flagIsVisible ? getTransparentFlagFrame() : null;
    if (flagIsVisible && transparentFlagFrame) {
      keepFlagVideoPlaying();
      const flagDrawW = 118;
      const flagDrawH = 132;
      ctx.save();
      ctx.shadowColor = "rgba(255, 82, 21, 0.45)";
      ctx.shadowBlur = 16;
      ctx.drawImage(transparentFlagFrame, flagX - 31, flag.y - 38, flagDrawW, flagDrawH);
      ctx.restore();
    } else if (flagIsVisible) {
      ctx.strokeStyle = "#f4f2f3";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(flagX, flag.y);
      ctx.lineTo(flagX, flag.y + 86);
      ctx.stroke();
      ctx.fillStyle = "#7b0b31";
      ctx.beginPath();
      ctx.moveTo(flagX + 3, flag.y + 6);
      ctx.lineTo(flagX + 70, flag.y + 24);
      ctx.lineTo(flagX + 3, flag.y + 44);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#d9dde0";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    fallingLavaRocks.forEach(drawLavaRock);
    if (!initialCharacterSelectionPending) drawColt();
    drawCharacterSelectPreviews();
    if (won || coltDeathHasFallen()) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
      ctx.fillRect(0, 0, w, h);
      if (won) {
        const playerScreenCenter = player.x - cameraX + player.w / 2;
        const panelW = Math.min(465, w - 40);
        const panelH = 96;
        const panelX = playerScreenCenter < w / 2 ? w - panelW - 20 : 20;
        const panelY = 20;
        ctx.fillStyle = "rgba(20, 4, 12, 0.84)";
        ctx.fillRect(panelX, panelY, panelW, panelH);
        ctx.strokeStyle = "rgba(248, 220, 232, 0.72)";
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX, panelY, panelW, panelH);
        ctx.fillStyle = "#f8dce8";
        ctx.textAlign = "center";
        ctx.font = "900 34px Arial";
        ctx.fillText("Finish Flag Reached!", panelX + panelW / 2, panelY + 40);
        ctx.font = "800 17px Arial";
        ctx.fillText("Press Enter for Next Level or R to Restart.", panelX + panelW / 2, panelY + 72);
      } else {
        ctx.fillStyle = "#f8dce8";
        ctx.font = "900 48px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Try Again", w / 2, h / 2 - 10);
        ctx.font = "800 20px Arial";
        ctx.fillText("Press R or Enter to Restart.", w / 2, h / 2 + 28);
      }
    }
  };

  const update = frameNow => {
    const now = Number.isFinite(frameNow) ? frameNow : performance.now();
    const targetFrameMs = 1000 / 60;
    const frameElapsedMs = lastSimulationFrameAt ? Math.max(0, now - lastSimulationFrameAt) : targetFrameMs;
    const deltaScale = Math.min(4, frameElapsedMs / targetFrameMs);
    lastSimulationFrameAt = now;
    const overlayOpen = characterSelectOpen || (leaderboardPanel && !leaderboardPanel.hidden);
    if (overlayOpen && lastOverlayFrameAt && now - lastOverlayFrameAt < 1000 / 30) {
      animationId = requestAnimationFrame(update);
      return;
    }
    lastOverlayFrameAt = overlayOpen ? now : 0;
    if (leaderboardPanel && !leaderboardPanel.hidden && !won && !lost) {
      draw();
      animationId = requestAnimationFrame(update);
      return;
    }
    if (characterSelectOpen) {
      draw();
      animationId = requestAnimationFrame(update);
      return;
    }
    if (!won && !lost) {
      if (finishLandingPending) {
        updateFinishLanding(deltaScale);
        cameraX = Math.max(0, player.x - 230);
        stopRunningAudio();
        draw();
        animationId = requestAnimationFrame(update);
        return;
      }
      const mode = getDifficultySettings();
      const currentMoveSpeed = moveSpeed * mode.playerSpeedMultiplier;
      const currentJumpPower = jumpPower * mode.jumpPowerMultiplier;
      const currentGravity = gravity * mode.gravityMultiplier;
      const elapsedSeconds = (now - levelStart) / 1000;
      const remainingSeconds = Math.max(0, levelDurationSeconds - elapsedSeconds);
      if (remainingSeconds <= 0) {
        triggerColtDeath();
        setTimeDisplay("0.0");
        draw();
        animationId = requestAnimationFrame(update);
        return;
      }
      const wasGrounded = player.grounded;
      player.vx = 0;
      if (keys.left) {
        player.vx = -currentMoveSpeed;
        player.facing = -1;
      }
      if (keys.right) {
        player.vx = currentMoveSpeed;
        player.facing = 1;
      }
      if (keys.jump && player.grounded) {
        if (selectedCharacter === "mrNieves") chooseMrNievesInAirVideo();
        player.vy = currentJumpPower;
        player.grounded = false;
        player.state = "jumpPrep";
        player.jumpPrepUntil = now + 150;
        stopRunningAudio();
      }
      const previousPlayerY = player.y;
      const previousPlayerBottom = previousPlayerY + player.h;
      const previousVerticalVelocity = player.vy;
      player.vy += currentGravity * deltaScale;
      player.x += player.vx * deltaScale;
      player.y += previousVerticalVelocity * deltaScale + currentGravity * deltaScale * (deltaScale + 1) / 2;
      player.x = Math.max(0, player.x);
      const previousGroundPlatform = player.groundPlatform;
      player.grounded = false;
      player.groundPlatform = null;
      platforms.forEach(platform => {
        const spriteIndex = platform.sprite % platformSprites.length;
        const withinX = player.x + player.w > platform.x && player.x < platform.x + platform.w;
        if (!withinX) return;
        const footX = Math.max(platform.x, Math.min(platform.x + platform.w, player.x + player.w / 2));
        const surfaceY = getPlatformSurfaceY(platform, footX);
        const stayedOnPlatform = Boolean(platformCollisionProfiles[spriteIndex]) && wasGrounded && previousGroundPlatform === platform;
        const wasAbove = previousPlayerBottom <= surfaceY + (stayedOnPlatform ? 12 : 0);
        const hitTop = player.y + player.h >= surfaceY - (stayedOnPlatform ? 12 : 0);
        if (withinX && wasAbove && hitTop && player.vy >= 0) {
          player.y = surfaceY - player.h;
          player.vy = 0;
          player.grounded = true;
          player.groundPlatform = platform;
        }
      });
      if (player.grounded) {
        player.state = Math.abs(player.vx) > 0.2 ? "run" : "idle";
      } else if (player.state !== "jumpPrep" || now > player.jumpPrepUntil) {
        player.state = "leap";
      }
      if (!wasGrounded && player.grounded) {
        player.state = "idle";
      }
      coins.forEach(coin => {
        if (coin.taken) return;
        const dx = player.x + player.w / 2 - coin.x;
        if (Math.abs(dx) >= 40) return;
        const dy = player.y + player.h / 2 - coin.y;
        if (dx * dx + dy * dy < 1600) {
          coin.taken = true;
          score += 10;
          scoreNode.textContent = score;
          playGameplayCue(coinPickupAudio);
        }
      });
      updateLavaRocks(now, deltaScale);
      if (!lost) {
        const coltHitbox = getColtHazardHitbox();
        for (const rock of fallingLavaRocks) {
          if (lavaRockHitsRect(rock, coltHitbox)) {
            triggerColtDeath();
            break;
          }
        }
      }
      if (!lost && player.x + player.w > flag.x && player.y + player.h > flag.y && player.y < flag.y + 90) {
        beginFinishLanding(now);
      }
      if (!lost && !finishLandingPending && player.y > gameViewportHeight - 36) {
        triggerColtDeath();
      }
      cameraX = Math.max(0, player.x - 230);
      setTimeDisplay(remainingSeconds.toFixed(1));
      syncRunningAudio();
    } else if (lost) {
      stopRunningAudio();
      updateColtDeath(now);
      if (coltDeathHasFallen()) finishRunAfterDeath();
    }
    draw();
    animationId = requestAnimationFrame(update);
  };

  const setKey = (name, value) => {
    if (name !== "left" && name !== "right" && name !== "jump") return;
    const wasPressed = keys[name];
    if (name === "jump" && value && !wasPressed && player.grounded && !won && !lost) {
      playColtRunAudio();
      stopRunningAudio();
    }
    keys[name] = value;
  };
  const keyMap = {
    ArrowLeft: "left",
    KeyA: "left",
    ArrowRight: "right",
    KeyD: "right",
    ArrowUp: "jump",
    KeyW: "jump",
    Space: "jump"
  };
  const onKeyDown = event => {
    if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select, [contenteditable='true']")) return;
    if (event.code === "KeyB") {
      event.preventDefault();
      setScreen({ name: "home" });
      return;
    }
    if (characterSelectOpen) return;
    playColtRunAudio();
    if (event.code === "Enter") {
      event.preventDefault();
      if (won) nextLevel();
      else if (lost) {
        if (pendingLeaderboardEntry && leaderboardPromptsEnabled) openLeaderboard();
        else resetLevel(false, false, Boolean(pendingLeaderboardEntry));
      }
      else syncGameStatus();
      return;
    }
    if (event.code === "KeyR") {
      event.preventDefault();
      if (pendingLeaderboardEntry && leaderboardPromptsEnabled) {
        openLeaderboard();
        return;
      }
      resetLevel(false, false, Boolean(pendingLeaderboardEntry));
      return;
    }
    const key = keyMap[event.code];
    if (!key) return;
    event.preventDefault();
    setKey(key, true);
  };
  const onKeyUp = event => {
    if (event.target instanceof HTMLElement && event.target.closest(".colt-run-volume")) return;
    const key = keyMap[event.code];
    if (!key) return;
    event.preventDefault();
    setKey(key, false);
  };
  const onButtonClick = event => {
    const button = event.target.closest("[data-colt-run]");
    if (!button) return;
    if (button.dataset.coltRun === "musicToggle") {
      toggleMusic();
      return;
    }
    if (button.dataset.coltRun === "difficulty") {
      setDifficultyMode(button.dataset.difficulty);
      return;
    }
    if (button.dataset.coltRun === "leaderboardMode") {
      activeLeaderboardMode = normalizeDifficultyMode(button.dataset.leaderboardMode);
      renderLeaderboardList();
      return;
    }
    if (button.dataset.coltRun === "characterSelect") {
      openCharacterSelect();
      return;
    }
    if (button.dataset.coltRun === "character") {
      setCharacter(button.dataset.character);
      return;
    }
    if (button.dataset.coltRun === "back") {
      setScreen({ name: "home" });
      return;
    }
    playColtRunAudio();
    if (button.dataset.coltRun === "fullscreen") toggleFullscreen();
    if (button.dataset.coltRun === "leaderboard") openLeaderboard();
    if (button.dataset.coltRun === "leaderboardPrompts") toggleLeaderboardPrompts();
    if (button.dataset.coltRun === "closeLeaderboard") closeLeaderboard();
    if (button.dataset.coltRun === "restart") {
      if (pendingLeaderboardEntry && leaderboardPromptsEnabled) openLeaderboard();
      else resetLevel(false, false, Boolean(pendingLeaderboardEntry));
    }
    if (button.dataset.coltRun === "new") {
      if (won) nextLevel();
      else syncGameStatus();
    }
  };
  const onLeaderboardSubmit = event => {
    event.preventDefault();
    savePendingLeaderboardEntry(leaderboardNameInput ? leaderboardNameInput.value : "");
    canvas.focus({ preventScroll: true });
  };
  const isFullscreen = () => document.fullscreenElement === fullscreenTarget;
  const updateFullscreenButton = () => {
    fullscreenButtons.forEach(button => {
      button.textContent = isFullscreen() ? "Exit Fullscreen" : "⛶ Fullscreen";
    });
    if (isFullscreen()) canvas.focus({ preventScroll: true });
  };
  const toggleFullscreen = () => {
    if (!fullscreenTarget || !document.fullscreenEnabled) return;
    if (isFullscreen()) {
      document.exitFullscreen?.();
      return;
    }
    fullscreenTarget.requestFullscreen?.().then(() => {
      canvas.focus({ preventScroll: true });
      updateFullscreenButton();
    }).catch(() => {
      syncGameStatus();
    });
  };
  const bindTouchButton = button => {
    const key = button.dataset.coltKey;
    const down = event => {
      event.preventDefault();
      button.setPointerCapture?.(event.pointerId);
      setKey(key, true);
    };
    const up = event => {
      event.preventDefault();
      button.releasePointerCapture?.(event.pointerId);
      setKey(key, false);
    };
    button.addEventListener("pointerdown", down);
    button.addEventListener("pointerup", up);
    button.addEventListener("pointerleave", up);
    button.addEventListener("pointercancel", up);
    return () => {
      button.removeEventListener("pointerdown", down);
      button.removeEventListener("pointerup", up);
      button.removeEventListener("pointerleave", up);
      button.removeEventListener("pointercancel", up);
    };
  };
  const bindTouchJoystick = joystick => {
    let activePointerId = null;
    const resetJoystick = () => {
      keys.left = false;
      keys.right = false;
      joystick.style.setProperty("--stick-x", "0px");
      joystick.style.setProperty("--stick-y", "0px");
      joystick.classList.remove("is-active");
    };
    const updateJoystick = event => {
      const rect = joystick.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const maxDistance = rect.width * 0.28;
      const rawX = event.clientX - centerX;
      const rawY = event.clientY - centerY;
      const distance = Math.hypot(rawX, rawY);
      const scale = distance > maxDistance ? maxDistance / distance : 1;
      const x = rawX * scale;
      const y = rawY * scale;
      const deadZone = rect.width * 0.12;
      joystick.style.setProperty("--stick-x", `${x}px`);
      joystick.style.setProperty("--stick-y", `${y}px`);
      keys.left = x < -deadZone;
      keys.right = x > deadZone;
    };
    const down = event => {
      event.preventDefault();
      activePointerId = event.pointerId;
      joystick.setPointerCapture?.(event.pointerId);
      joystick.classList.add("is-active");
      updateJoystick(event);
    };
    const move = event => {
      if (activePointerId !== event.pointerId) return;
      event.preventDefault();
      updateJoystick(event);
    };
    const up = event => {
      if (activePointerId !== event.pointerId) return;
      event.preventDefault();
      joystick.releasePointerCapture?.(event.pointerId);
      activePointerId = null;
      resetJoystick();
    };
    joystick.addEventListener("pointerdown", down);
    joystick.addEventListener("pointermove", move);
    joystick.addEventListener("pointerup", up);
    joystick.addEventListener("pointercancel", up);
    joystick.addEventListener("lostpointercapture", up);
    return () => {
      joystick.removeEventListener("pointerdown", down);
      joystick.removeEventListener("pointermove", move);
      joystick.removeEventListener("pointerup", up);
      joystick.removeEventListener("pointercancel", up);
      joystick.removeEventListener("lostpointercapture", up);
      resetJoystick();
    };
  };
  const touchCleanups = [
    ...Array.from(document.querySelectorAll("[data-colt-key]")).map(bindTouchButton),
    ...Array.from(document.querySelectorAll("[data-colt-joystick]")).map(bindTouchJoystick)
  ];
  const clearTouchKeys = () => {
    keys.left = false;
    keys.right = false;
    keys.jump = false;
    document.querySelectorAll("[data-colt-joystick]").forEach(joystick => {
      joystick.style.setProperty("--stick-x", "0px");
      joystick.style.setProperty("--stick-y", "0px");
      joystick.classList.remove("is-active");
    });
  };
  const gameplayVideos = [
    coinVideo,
    flagVideo,
    ...characterAnimationVideos,
    ...lavaRockVideoSpecials,
    ...animatedBackgroundVideos
  ];
  let documentHiddenAt = 0;
  const onVisibilityChange = () => {
    if (document.hidden) {
      documentHiddenAt = performance.now();
      gameplayVideos.forEach(video => {
        if (!video.paused) video.pause();
      });
      characterPlaybackKey = "";
      return;
    }
    if (
      documentHiddenAt &&
      !won &&
      !lost &&
      !characterSelectOpen &&
      (!leaderboardPanel || leaderboardPanel.hidden)
    ) {
      levelStart += performance.now() - documentHiddenAt;
    }
    documentHiddenAt = 0;
    lastSimulationFrameAt = 0;
    characterPlaybackKey = "";
    syncCharacterVideoPlayback(true);
  };

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("blur", clearTouchKeys);
  document.addEventListener("fullscreenchange", updateFullscreenButton);
  app.addEventListener("click", onButtonClick);
  if (leaderboardForm) leaderboardForm.addEventListener("submit", onLeaderboardSubmit);
  updateDifficultyButtons();
  updateCharacterButtons();
  updateLeaderboardPromptToggle();
  ensureMediaSource(getColtIdleVideo());
  chooseMrNievesIdleVideo();
  scheduleMediaLoad(coinVideo, 1800);
  scheduleMediaLoad(flagVideo, 2600);
  scheduleMediaLoad(coinPickupAudio, 900);
  scheduleMediaLoad(getReadyAudio, 1200);
  scheduleMediaLoad(nextLevelAudio, 1500);
  resetLevel(true);
  openCharacterSelect();
  update();
  coltRunGame = {
    stop() {
      cancelAnimationFrame(animationId);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", clearTouchKeys);
      document.removeEventListener("fullscreenchange", updateFullscreenButton);
      app.removeEventListener("click", onButtonClick);
      if (leaderboardForm) leaderboardForm.removeEventListener("submit", onLeaderboardSubmit);
      if (musicVolumeSlider) {
        musicVolumeSlider.removeEventListener("input", onMusicVolumeInput);
        musicVolumeSlider.removeEventListener("pointerdown", onMusicVolumePointerDown);
      }
      touchCleanups.forEach(cleanup => cleanup());
      stagedMediaTimers.forEach(timer => window.clearTimeout(timer));
      stopRunningAudio();
      gameplayVideos.forEach(stopTrackingDecodedVideoFrames);
      inGameMusic.removeEventListener("ended", onInGameMusicEnded);
      [
        ambientAudio,
        inGameMusic,
        ...characterSelectMusicTracks,
        runningAudio,
        mrNievesRunningAudio,
        ...gameplayCueAudios,
        ...coltDeathAudios,
        ...coltCelebrationAudios,
        ...mrNievesDeathAudios,
        ...mrNievesCelebrationAudios,
        coinVideo,
        flagVideo,
        ...coltIdleVideos,
        runVideo,
        leapVideo,
        coltCelebrationVideo,
        ...mrNievesIdleVideos,
        mrNievesRunVideo,
        ...mrNievesInAirVideos,
        ...mrNievesCelebrationVideos,
        ...mrNievesDeathVideos,
        deathVideo,
        ...lavaRockVideoSpecials,
        ...animatedBackgroundVideos
      ].forEach(releaseMediaSource);
      mrNievesJumpImage.src = "";
      if (ambientAudioContext) ambientAudioContext.close().catch(() => {});
      if (isFullscreen()) document.exitFullscreen?.();
    }
  };
}

function renderPin() {
  return `
    ${pageHeader("Teacher PIN", "", true)}
    <section class="pin-card">
      <h2>Teacher Sign-In</h2>
      <p class="instruction">Enter your private server-protected recovery PIN.</p>
      <form id="pinForm" class="form-grid">
        <div class="field">
          <label for="pinInput">PIN</label>
          <input id="pinInput" type="password" inputmode="numeric" autocomplete="current-password" maxlength="12">
        </div>
        <p id="pinError" class="error"></p>
        <button class="primary-btn" type="submit">Enter Teacher Mode</button>
      </form>
    </section>
  `;
}

function renderAssignmentsPreview() {
  const studentSubmissions = submissions.filter(item => item.studentEmail === authSession.email);
  const remaining = assignments.filter(assignment => !studentSubmissions.some(item => item.assignmentId === assignment.id)).length;
  return `
    <section class="assignments-home-card">
      <div class="assignments-home-copy">
        <span class="feature-kicker">Student Work</span>
        <h2>Assignments &amp; Submissions</h2>
        <p>${isApprovedStudent()
          ? `${remaining} ${remaining === 1 ? "assignment is" : "assignments are"} waiting for you.`
          : "Sign in to view assignments and submit your work to Mr. Nieves."}</p>
        <div class="assignments-home-stats">
          <span><strong>${isApprovedStudent() ? assignments.length : "—"}</strong> Assigned</span>
          <span><strong>${isApprovedStudent() ? studentSubmissions.length : "—"}</strong> Submitted</span>
        </div>
      </div>
      <button class="primary-btn" data-action="openAssignments">${isApprovedStudent() ? "Open Assignments" : "Student Login"}</button>
    </section>
  `;
}

function renderClassroomPassPreview() {
  const activePass = classroomPassData.activePass;
  const buttonText = isTeacher()
    ? "Open Pass Log"
    : activePass
      ? "Return to Classroom"
      : isApprovedStudent()
        ? "Open Classroom Pass"
        : "Student Login";
  return `
    <section class="classroom-pass-home-card ${activePass ? "has-active-pass" : ""}">
      <div class="classroom-pass-home-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <rect x="3" y="5" width="18" height="15" rx="3"></rect>
          <path d="M8 5V3h8v2"></path>
          <circle cx="9" cy="11" r="2"></circle>
          <path d="M6.5 16c.6-1.8 1.5-2.7 2.5-2.7s1.9.9 2.5 2.7M14 10h4M14 14h4"></path>
        </svg>
      </div>
      <div>
        <span class="feature-kicker">Leaving the Room</span>
        <h2>Classroom Pass</h2>
        <p>${activePass
          ? `You left for ${escapeHtml(activePass.destination)} at ${escapeHtml(formatClassroomPassTime(activePass.outAt))}.`
          : isApprovedStudent()
            ? "Use this pass whenever Mr. Nieves gives you permission to leave the classroom."
            : isTeacher()
              ? "See who is currently out and review student pass activity."
              : "Student login is required to use the Classroom Pass."}</p>
      </div>
      <button class="primary-btn" data-action="openClassroomPass">${buttonText}</button>
    </section>
  `;
}

function studentSubmissionFor(assignmentId) {
  if (replacingAssignmentId === assignmentId) return null;
  return submissions.find(item => item.assignmentId === assignmentId && item.studentEmail === authSession.email) || null;
}

function assignmentDueText(assignment) {
  if (!assignment.dueAt) return "No due date";
  return new Date(assignment.dueAt).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function renderOfficePreviewPayload(preview) {
  if (!preview) return `<div class="office-preview-message"><strong>Preview unavailable</strong><p>This file could not be displayed.</p></div>`;
  if (preview.kind === "docx") {
    const paragraphs = String(preview.text || "").split(/\n+/).filter(Boolean).slice(0, 1200);
    return `<article class="word-document-preview" aria-label="Preview of ${escapeHtml(preview.title || "Word document")}"><header><span>WORD DOCUMENT PREVIEW</span><strong>${escapeHtml(preview.title || "Document")}</strong></header><div>${paragraphs.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join("") || "<p>No previewable text was found.</p>"}${preview.images && preview.images.length ? `<div class="office-preview-images">${preview.images.map(image => `<img src="${escapeHtml(image.src)}" alt="Embedded image from ${escapeHtml(preview.title || "document")}">`).join("")}</div>` : ""}</div></article>`;
  }
  if (preview.kind === "pptx") {
    return `<section class="powerpoint-document-preview" aria-label="Preview of ${escapeHtml(preview.title || "PowerPoint")}"><header><span>POWERPOINT PREVIEW</span><strong>${escapeHtml(preview.title || "Presentation")}</strong></header><div class="powerpoint-slide-list">${(preview.slides || []).map(slide => `<article class="powerpoint-slide"><span>Slide ${Number(slide.number) || 1}</span><div>${String(slide.text || "").split(/\n+/).filter(Boolean).map(line => `<p>${escapeHtml(line)}</p>`).join("")}</div></article>`).join("")}${preview.images && preview.images.length ? `<div class="office-preview-images">${preview.images.map(image => `<img src="${escapeHtml(image.src)}" alt="Embedded image from ${escapeHtml(preview.title || "presentation")}">`).join("")}</div>` : ""}</div></section>`;
  }
  return `<div class="office-preview-message"><strong>${escapeHtml(preview.title || "Preview unavailable")}</strong><p>${escapeHtml(preview.message || "Download this file to open it in the appropriate app.")}</p></div>`;
}

async function renderFaithfulDocxPreview(source, target, title) {
  if (!target) return;
  if (!window.docx || typeof window.docx.renderAsync !== "function") {
    throw new Error("The Word preview viewer did not load. Refresh the page and try again.");
  }
  const shell = document.createElement("article");
  shell.className = "faithful-docx-preview";
  shell.setAttribute("aria-label", `Full-page preview of ${title || "Word document"}`);
  const header = document.createElement("header");
  const label = document.createElement("span");
  label.textContent = "FULL WORD DOCUMENT PREVIEW";
  const name = document.createElement("strong");
  name.textContent = title || "Word document";
  header.append(label, name);
  const pages = document.createElement("div");
  pages.className = "faithful-docx-pages";
  shell.append(header, pages);
  target.replaceChildren(shell);
  await window.docx.renderAsync(source, pages, pages, {
    breakPages: true,
    experimental: true,
    ignoreHeight: false,
    ignoreWidth: false,
    ignoreFonts: false,
    ignoreLastRenderedPageBreak: false,
    renderHeaders: true,
    renderFooters: true,
    renderFootnotes: true,
    renderEndnotes: true,
    renderComments: false,
    useBase64URL: true
  });
  const revealCompletePages = () => {
    pages.querySelectorAll("section.docx").forEach(pageSection => {
      const completeHeight = pageSection.scrollHeight;
      if (completeHeight > pageSection.clientHeight + 1) pageSection.style.minHeight = `${completeHeight}px`;
    });
  };
  revealCompletePages();
  const wrapper = pages.querySelector(".docx-wrapper");
  const page = pages.querySelector("section.docx");
  if (wrapper && page) {
    const naturalWidth = page.offsetWidth;
    const fitPages = () => {
      const availableWidth = Math.max(280, pages.clientWidth - 36);
      wrapper.style.zoom = String(Math.min(1, availableWidth / naturalWidth));
    };
    fitPages();
    pages.querySelectorAll("img").forEach(image => image.addEventListener("load", () => {
      revealCompletePages();
      fitPages();
    }, { once: true }));
    if (typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(() => {
        if (!pages.isConnected) {
          observer.disconnect();
          return;
        }
        revealCompletePages();
        fitPages();
      });
      observer.observe(pages);
    }
  }
}

async function hydrateOfficeSubmissionPreviews() {
  const docxTargets = [...document.querySelectorAll("[data-docx-submission-preview]")];
  const officeTargets = [...document.querySelectorAll("[data-office-submission-preview]")];
  await Promise.all(docxTargets.map(async target => {
    if (target.dataset.loading === "true") return;
    target.dataset.loading = "true";
    try {
      const blob = await sharedBackend.loadSubmissionFile(target.dataset.docxSubmissionPreview);
      await renderFaithfulDocxPreview(blob, target, target.dataset.previewTitle || "Word document");
    } catch (error) {
      target.innerHTML = `<div class="office-preview-message"><strong>Preview unavailable</strong><p>${escapeHtml(error.message)}</p></div>`;
    }
  }));
  const targets = officeTargets;
  await Promise.all(targets.map(async target => {
    if (target.dataset.loading === "true") return;
    target.dataset.loading = "true";
    try {
      const preview = await sharedBackend.loadSubmissionPreview(target.dataset.officeSubmissionPreview);
      target.innerHTML = renderOfficePreviewPayload(preview);
    } catch (error) {
      target.innerHTML = `<div class="office-preview-message"><strong>Preview unavailable</strong><p>${escapeHtml(error.message)}</p></div>`;
    }
  }));
}

function renderSubmissionPreview(submission) {
  if (!submission) return `<div class="submission-preview-empty"><strong>No file selected</strong><span>Your preview will appear here before you submit.</span></div>`;
  if (submission.submissionType === "link") {
    let domain = "External project";
    try { domain = new URL(submission.projectUrl).hostname; } catch {}
    return `<div class="submission-link-preview"><span class="submission-link-icon" aria-hidden="true">↗</span><span class="feature-kicker">Linked Project</span><h3>${escapeHtml(submission.projectTitle || "Student Project")}</h3><p>${escapeHtml(domain)}</p><a class="primary-btn" href="${escapeHtml(submission.projectUrl)}" target="_blank" rel="noopener noreferrer">Open Project</a></div>`;
  }
  const src = `/api/submissions/${encodeURIComponent(submission.id)}/file?view=inline`;
  if ([".png", ".jpg", ".jpeg", ".webp"].includes(submission.extension)) {
    return `<img class="submission-preview-image" src="${src}" alt="Preview of ${escapeHtml(submission.originalName)}">`;
  }
  if (submission.extension === ".docx") {
    return `<div class="office-submission-preview faithful-docx-host" data-docx-submission-preview="${escapeHtml(submission.id)}" data-preview-title="${escapeHtml(submission.originalName)}"><div class="office-preview-message"><strong>Preparing full document previewâ€¦</strong><p>The file remains inside Classroom Launchpad.</p></div></div>`;
  }
  if ([".doc", ".ppt", ".pptx"].includes(submission.extension)) {
    return `<div class="office-submission-preview" data-office-submission-preview="${escapeHtml(submission.id)}"><div class="office-preview-message"><strong>Preparing document preview…</strong><p>The file remains inside Classroom Launchpad.</p></div></div>`;
  }
  return `<iframe class="submission-preview-frame" src="${src}" title="Preview of ${escapeHtml(submission.originalName)}"></iframe>`;
}

function renderStudentAssignmentCard(assignment) {
  const submission = studentSubmissionFor(assignment.id);
  const status = submission ? submission.status : "todo";
  const late = assignment.dueAt && Date.now() > Date.parse(assignment.dueAt) && !submission;
  return `
    <button class="student-assignment-card ${selectedAssignmentId === assignment.id ? "is-selected" : ""}" data-action="selectAssignment" data-id="${escapeHtml(assignment.id)}">
      <span class="assignment-card-status is-${escapeHtml(status)}">${submission ? (status === "returned" ? "Returned" : status === "reviewed" ? "Reviewed" : "Submitted") : late ? "Past Due" : "To Do"}</span>
      <strong>${escapeHtml(assignment.title)}</strong>
      <small>Due ${escapeHtml(assignmentDueText(assignment))}</small>
      <span class="assignment-grade-pill">${assignment.grades.length ? `Grade ${escapeHtml(assignment.grades.join(", "))}` : "All Grades"}</span>
    </button>
  `;
}

function renderAssignmentAttachment(assignment) {
  if (!assignment || !assignment.attachmentOriginalName) return "";
  const previewable = [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".txt"].includes(assignment.attachmentExtension);
  const fileUrl = `/api/assignments/${encodeURIComponent(assignment.id)}/attachment`;
  return `
    <section class="student-assignment-attachment">
      <span class="assignment-attachment-icon" aria-hidden="true">▤</span>
      <span><span class="feature-kicker">File from Mr. Nieves</span><strong>${escapeHtml(assignment.attachmentOriginalName)}</strong><small>${formatFileSize(assignment.attachmentSize)}${[".doc", ".docx"].includes(assignment.attachmentExtension) ? " • Microsoft Word" : [".ppt", ".pptx"].includes(assignment.attachmentExtension) ? " • Microsoft PowerPoint" : ""}</small></span>
      <div class="actions">${previewable ? `<a class="outline-btn" href="${fileUrl}?view=inline" target="_blank" rel="noopener">Preview</a>` : ""}<a class="primary-btn" href="${fileUrl}">Download File</a></div>
    </section>
  `;
}

function studentAssignmentViewFor(assignment, submission = studentSubmissionFor(assignment.id)) {
  if (!submission) return "todo";
  return submission.status === "returned" ? "returned" : "submitted";
}

function renderAssignmentsPage() {
  if (!isApprovedStudent()) return `${pageHeader("Assignments & Submissions", "Student login is required.", true)}${renderLogin()}`;
  const assignmentCounts = assignments.reduce((counts, assignment) => {
    counts[studentAssignmentViewFor(assignment)] += 1;
    return counts;
  }, { todo: 0, submitted: 0, returned: 0 });
  const filtered = assignments.filter(assignment => studentAssignmentViewFor(assignment) === assignmentView);
  const selected = assignments.find(item => item.id === selectedAssignmentId)
    && filtered.some(item => item.id === selectedAssignmentId)
      ? assignments.find(item => item.id === selectedAssignmentId)
      : (filtered[0] || null);
  selectedAssignmentId = selected ? selected.id : "";
  const submission = selected ? studentSubmissionFor(selected.id) : null;
  return `
    ${pageHeader("Assignments & Submissions", "Upload and review your class work.", true)}
    <section class="student-submission-identity" aria-label="Current student">
      <span class="student-submission-identity-icon" aria-hidden="true">${escapeHtml((authSession.name || "S").charAt(0))}</span>
      <span><small>Submitting as</small><strong>${escapeHtml(authSession.name || "Student")}</strong><em>Grade ${escapeHtml(authSession.grade || "Not assigned")}</em></span>
    </section>
    <section class="student-assignments-shell">
      <aside class="student-assignment-sidebar">
        <div class="assignment-view-tabs" role="tablist" aria-label="Assignment status">
          ${[["todo", "To Do"], ["submitted", "Submitted"], ["returned", "Returned"]].map(([id, label]) => `
            <button data-action="assignmentView" data-view="${id}" class="${assignmentView === id ? "is-active" : ""}" role="tab" aria-selected="${assignmentView === id}" aria-label="${label}, ${assignmentCounts[id]} ${assignmentCounts[id] === 1 ? "assignment" : "assignments"}">
              <span>${label}</span><span class="assignment-tab-count" aria-hidden="true">${assignmentCounts[id]}</span>
            </button>
          `).join("")}
        </div>
        <div class="student-assignment-list">
          ${filtered.length ? filtered.map(renderStudentAssignmentCard).join("") : `<div class="assignment-list-empty">Nothing is in this section right now.</div>`}
        </div>
      </aside>
      <main class="student-submission-workspace">
        ${selected ? `
          <header class="student-assignment-heading">
            <div><span class="feature-kicker">${submission ? "Submission Details" : "Assignment"}</span><h2>${escapeHtml(selected.title)}</h2></div>
            <span class="assignment-due-badge">Due ${escapeHtml(assignmentDueText(selected))}</span>
          </header>
          <div class="assignment-instructions">${escapeHtml(selected.instructions || "Complete the assigned work and submit your file below.").replace(/\n/g, "<br>")}</div>
          ${renderAssignmentAttachment(selected)}
          ${submission ? `
            <section class="student-submission-receipt">
              <div class="submission-file-heading">
                <div><strong>${escapeHtml(submission.submissionType === "link" ? submission.projectTitle : submission.originalName)}</strong><span>${submission.submissionType === "link" ? "External project link" : formatFileSize(submission.size)} • Submitted ${escapeHtml(formatShortDate(submission.submittedAt))}</span></div>
                ${submission.submissionType === "link"
                  ? `<a class="outline-btn" href="${escapeHtml(submission.projectUrl)}" target="_blank" rel="noopener noreferrer">Open Project</a>`
                  : `<a class="outline-btn" href="/api/submissions/${encodeURIComponent(submission.id)}/file" download>Download</a>`}
              </div>
              <div class="submission-preview-box">${renderSubmissionPreview(submission)}</div>
              ${submission.note ? `<p class="submission-note"><strong>Your note:</strong> ${escapeHtml(submission.note)}</p>` : ""}
              ${submission.feedback ? `<div class="teacher-feedback-box"><span class="feature-kicker">Feedback from Mr. Nieves</span><p>${escapeHtml(submission.feedback)}</p></div>` : ""}
              ${selected.allowResubmissions && selected.status === "open" ? `<button class="primary-btn" data-action="replaceSubmission">Replace Submission</button>` : ""}
            </section>
          ` : `
            <div class="submission-method-tabs" role="tablist" aria-label="Submission method">
              <button type="button" data-action="submissionMethod" data-method="file" class="${submissionMethod === "file" ? "is-active" : ""}">Upload a File</button>
              <button type="button" data-action="submissionMethod" data-method="link" class="${submissionMethod === "link" ? "is-active" : ""}">Submit a Project Link</button>
            </div>
            ${submissionMethod === "file" ? `<form id="studentSubmissionForm" class="student-upload-form" data-assignment-id="${escapeHtml(selected.id)}">
              <label class="student-upload-drop" for="studentSubmissionFile">
                <span class="upload-icon" aria-hidden="true">⇧</span>
                <strong>Drop your file here</strong>
                <span>or choose a file from your device</span>
                <span class="outline-btn">Choose File</span>
                <input id="studentSubmissionFile" type="file" accept="${escapeHtml(selected.acceptedTypes.join(","))}" required>
              </label>
              <div id="selectedSubmissionFile" class="selected-upload-file">No file selected</div>
              <section id="studentPreSubmitPreview" class="pre-submit-preview" hidden aria-live="polite"></section>
              <label class="field"><span>Optional note</span><textarea id="studentSubmissionNote" maxlength="500" placeholder="Add a short note for Mr. Nieves"></textarea></label>
              <div class="student-submit-footer">
                <p>Your name and grade are added automatically. Maximum file size: ${selected.maxFileSizeMb} MB.</p>
                <div class="actions">
                  ${replacingAssignmentId === selected.id ? `<button class="outline-btn" type="button" data-action="cancelReplacement">Cancel</button>` : ""}
                  <button class="primary-btn" type="submit">Submit to Mr. Nieves</button>
                </div>
              </div>
              <p id="studentSubmissionMessage" class="request-message" aria-live="polite"></p>
            </form>` : `<form id="studentLinkSubmissionForm" class="student-upload-form student-link-form" data-assignment-id="${escapeHtml(selected.id)}">
              <div class="submission-link-help"><strong>Submit work created on another website</strong><p>Paste the share link from Canva, Prezi, Google, Scratch, or another website approved by Mr. Nieves. Make sure your teacher has permission to view it.</p></div>
              <label class="field"><span>Project title</span><input id="studentProjectTitle" maxlength="180" placeholder="Example: My Ecosystem Presentation" required></label>
              <label class="field"><span>Project share link</span><input id="studentProjectUrl" type="url" inputmode="url" placeholder="https://…" required></label>
              <label class="field"><span>Optional note</span><textarea id="studentProjectNote" maxlength="500" placeholder="Add a short note for Mr. Nieves"></textarea></label>
              <div class="student-submit-footer"><p>Your name and grade are added automatically.</p><div class="actions">${replacingAssignmentId === selected.id ? `<button class="outline-btn" type="button" data-action="cancelReplacement">Cancel</button>` : ""}<button class="primary-btn" type="submit">Submit Link to Mr. Nieves</button></div></div>
              <p id="studentLinkSubmissionMessage" class="request-message" aria-live="polite"></p>
            </form>`}
          `}
        ` : `<div class="assignment-list-empty"><h2>No assignments yet</h2><p>New assignments will appear here when Mr. Nieves posts them.</p></div>`}
      </main>
    </section>
  `;
}

function renderClassroomPassPage() {
  if (!isApprovedStudent()) return `${pageHeader("Classroom Pass", "Student login is required.", true)}${renderLogin()}`;
  const active = classroomPassData.activePass;
  const config = classroomPassData.config;
  const available = classroomPassData.canStart;
  const availabilityMessage = !config.enabled
    ? "Classroom Pass is not available right now. Please ask Mr. Nieves."
    : available
      ? "Available — choose where you are going after receiving permission."
      : "A Classroom Pass is currently in use. Please wait until it becomes available.";
  const recent = classroomPassData.passes.filter(pass => pass.status !== "out").slice(0, 3);
  return `
    ${pageHeader("Classroom Pass", "Quickly sign out and return without interrupting class.", true)}
    <section class="classroom-pass-student-shell">
      <section class="classroom-pass-student-identity" aria-label="Current student">
        <span class="classroom-pass-avatar" aria-hidden="true">${escapeHtml((authSession.name || "S").charAt(0))}</span>
        <span><small>Using this pass as</small><strong>${escapeHtml(authSession.name || "Student")}</strong><em>Grade ${escapeHtml(authSession.grade || "Not assigned")}</em></span>
      </section>
      ${active ? `
        <section class="classroom-pass-active-student" aria-live="polite">
          <span class="feature-kicker">Currently Signed Out</span>
          <div class="classroom-pass-active-icon" aria-hidden="true">→</div>
          <h2>${escapeHtml(active.destination)}</h2>
          <p>You left the classroom at <strong>${escapeHtml(formatClassroomPassTime(active.outAt))}</strong>.</p>
          <div class="classroom-pass-student-timer">
            <span>Time out of the room</span>
            <strong data-pass-start="${escapeHtml(active.outAt)}">${escapeHtml(classroomPassDuration(active.outAt))}</strong>
          </div>
          <button class="primary-btn classroom-pass-return-button" data-action="returnClassroomPass">Return to Classroom</button>
          <p class="classroom-pass-reminder">Press this button as soon as you return.</p>
        </section>
      ` : `
        <section class="classroom-pass-start-card">
          <div class="classroom-pass-availability ${available ? "is-available" : "is-unavailable"}">
            <span aria-hidden="true">${available ? "✓" : "•"}</span>
            <strong>${escapeHtml(availabilityMessage)}</strong>
          </div>
          <div class="classroom-pass-permission-note">
            <strong>Ask Mr. Nieves first.</strong>
            <span>Then choose your destination and start the pass.</span>
          </div>
          <fieldset class="classroom-pass-destinations" ${available ? "" : "disabled"}>
            <legend>Where are you going?</legend>
            ${classroomPassData.destinations.map(destination => `
              <button type="button" class="classroom-pass-destination ${classroomPassDestination === destination ? "is-selected" : ""}" data-action="selectClassroomPassDestination" data-destination="${escapeHtml(destination)}" aria-pressed="${classroomPassDestination === destination}">
                <span aria-hidden="true">${destination === "Restroom" ? "R" : destination === "Water" ? "W" : destination === "Office" ? "O" : destination === "Nurse" ? "N" : destination === "Teacher Errand" ? "T" : "✓"}</span>
                ${escapeHtml(destination)}
              </button>
            `).join("")}
          </fieldset>
          <button class="primary-btn classroom-pass-start-button" data-action="startClassroomPass" ${available && classroomPassDestination ? "" : "disabled"}>Leave Classroom</button>
        </section>
      `}
      ${classroomPassMessage ? `<p class="classroom-pass-message" role="status">${escapeHtml(classroomPassMessage)}</p>` : ""}
      ${recent.length ? `
        <section class="classroom-pass-student-recent">
          <h3>Your Recent Passes</h3>
          ${recent.map(pass => `<div><span><strong>${escapeHtml(pass.destination)}</strong><small>${escapeHtml(formatClassroomPassDate(pass.outAt))} at ${escapeHtml(formatClassroomPassTime(pass.outAt))}</small></span><em>${escapeHtml(classroomPassDuration(pass.outAt, pass.returnedAt))}</em></div>`).join("")}
        </section>
      ` : ""}
    </section>
  `;
}

function renderLogin() {
  return `
    ${pageHeader("Student Login", "Use your approved school email and Classroom Launchpad password.", true)}
    <section class="auth-card student-auth-card">
      <span class="feature-kicker">Protected Student Access</span>
      <h2>Classroom Launchpad Account</h2>
      <p>Your first login requires a one-time activation code from Mr. Nieves. Classroom Launchpad passwords are separate from school Google passwords.</p>
      <div class="student-auth-grid">
        <form id="studentLoginForm" class="form-grid auth-form-panel">
          <h3>Log In</h3>
          <div class="field">
            <label for="studentLoginEmail">School email</label>
            <input id="studentLoginEmail" type="email" autocomplete="username" placeholder="student@${escapeHtml(authConfig.studentEmailDomain)}">
          </div>
          <div class="field">
            <label for="studentLoginPassword">Classroom Launchpad password</label>
            <input id="studentLoginPassword" type="password" autocomplete="current-password">
          </div>
          <button class="primary-btn" type="submit">Log In</button>
        </form>
        <form id="studentRegisterForm" class="form-grid auth-form-panel">
          <h3>First Login</h3>
          <div class="field">
            <label for="studentRegisterEmail">Approved school email</label>
            <input id="studentRegisterEmail" type="email" autocomplete="username" placeholder="student@${escapeHtml(authConfig.studentEmailDomain)}">
          </div>
          <div class="field">
            <label for="studentActivationCode">One-time activation code</label>
            <input id="studentActivationCode" autocomplete="one-time-code" maxlength="14">
          </div>
          <div class="field">
            <label for="studentRegisterName">First and last name</label>
            <input id="studentRegisterName" autocomplete="name" maxlength="80">
          </div>
          <div class="field">
            <label for="studentRegisterGrade">Grade</label>
            <input id="studentRegisterGrade" autocomplete="off" maxlength="12">
          </div>
          <div class="field">
            <label for="studentRegisterPassword">Create password</label>
            <input id="studentRegisterPassword" type="password" autocomplete="new-password" minlength="10">
            <small>Use at least 10 characters. Do not reuse your Google password.</small>
          </div>
          <div class="field">
            <label for="studentRegisterPasswordConfirm">Confirm password</label>
            <input id="studentRegisterPasswordConfirm" type="password" autocomplete="new-password" minlength="10">
          </div>
          <button class="primary-btn" type="submit">Create Account</button>
        </form>
      </div>
      <p id="authStatus" class="request-message ${authMessage ? "error" : ""}" aria-live="polite">${escapeHtml(authMessage)}</p>
    </section>
  `;
}

function renderAccount() {
  return `
    ${pageHeader("Your Account", "", true)}
    <section class="auth-card">
      <span class="feature-kicker">Signed In</span>
      <h2>${escapeHtml(authSession.name || "Student")}</h2>
      <p>${escapeHtml(authSession.email || "")}</p>
      <button class="outline-btn" data-action="logout">Log Out</button>
    </section>
  `;
}

function renderApprovedStudentManager() {
  const studentQuery = dashboardStudentSearch.trim().toLowerCase();
  const visibleStudents = approvedStudents.filter(student => {
    if (!studentQuery) return true;
    const status = student.registered
      ? "registered reset password"
      : student.activationReady
        ? "waiting for first login new code"
        : "needs activation code new code";
    return [student.name, student.email, student.grade, status]
      .some(value => String(value || "").toLowerCase().includes(studentQuery));
  });
  return `
    <section class="form-card approved-student-manager">
      <div>
        <span class="feature-kicker">Private Access List</span>
        <h2>Approved Student Emails</h2>
        <p class="instruction">Paste one or more @${escapeHtml(authConfig.studentEmailDomain)} addresses. New students receive one-time activation codes for their first login.</p>
      </div>
      <form id="approvedStudentImportForm" class="form-grid">
        <div class="field">
          <label for="approvedStudentEmails">Student emails</label>
          <textarea id="approvedStudentEmails" rows="6" placeholder="student@${escapeHtml(authConfig.studentEmailDomain)}"></textarea>
        </div>
        <button class="primary-btn" type="submit">Add Approved Emails</button>
        <div class="roster-import-panel">
          <div>
            <strong>Add names and grades</strong>
            <small>Choose a private roster CSV with Student Name, School Email, and Grade columns. Existing activation codes and passwords will not change.</small>
          </div>
          <label class="outline-btn roster-file-button">
            Import Names &amp; Grades
            <input id="approvedStudentRosterFile" type="file" accept=".csv,text/csv">
          </label>
        </div>
        <button class="outline-btn" type="button" data-action="regenerateStudentCodes">Generate New Codes for Unregistered Students</button>
        <p id="approvedStudentStatus" class="request-message" aria-live="polite"></p>
      </form>
      ${activationCodeResults.length ? `
        <section class="activation-code-results">
          <div>
            <strong>Save these one-time codes now</strong>
            <p>Codes are displayed only when created. Give each code privately to the matching student.</p>
          </div>
          <button class="outline-btn" data-action="downloadActivationCodes">Download Codes</button>
          <div class="activation-code-list">
            ${activationCodeResults.map(item => `
              <div><span>${escapeHtml(item.email)}</span><code>${escapeHtml(item.activationCode)}</code></div>
            `).join("")}
          </div>
        </section>
      ` : ""}
      <div class="approved-student-summary">
        <div class="approved-student-summary-header">
          <div>
            <strong>${approvedStudents.length} approved ${approvedStudents.length === 1 ? "student" : "students"}</strong>
            ${studentQuery ? `<small>${visibleStudents.length} matching ${visibleStudents.length === 1 ? "student" : "students"}</small>` : ""}
          </div>
          <label class="approved-student-search">
            <span class="sr-only">Search approved students</span>
            <input id="dashboardStudentSearch" type="search" value="${escapeHtml(dashboardStudentSearch)}" placeholder="Search name, email, grade, or status…">
          </label>
        </div>
        <div class="approved-student-list">
          ${visibleStudents.length ? visibleStudents.map(student => `
            <div class="approved-student-row">
              <span class="approved-student-identity">
                <strong>${escapeHtml(student.name || "Name not added")}${student.teacherTestAccount ? ` <span class="test-account-badge">Teacher Test Account</span>` : ""}</strong>
                <span>${escapeHtml(student.email)}${student.grade ? ` · Grade ${escapeHtml(student.grade)}` : ""}</span>
                <small>${student.registered ? "Registered" : student.activationReady ? "Waiting for first login" : student.teacherTestAccount ? "Click New Code to create the first-login access code" : "Needs activation code"}</small>
              </span>
              <div class="actions">
                <button class="outline-btn" data-action="resetStudentCode" data-email="${escapeHtml(student.email)}">${student.registered ? "Reset Password" : "New Code"}</button>
                ${student.teacherTestAccount ? "" : `<button class="danger-btn" data-action="removeApprovedStudent" data-email="${escapeHtml(student.email)}">Remove</button>`}
              </div>
            </div>
          `).join("") : `<p class="instruction">${approvedStudents.length ? "No students match this search." : "No student emails have been imported yet."}</p>`}
        </div>
      </div>
    </section>
  `;
}

function renderLegacyDashboard() {
  const sorted = [...links].sort((a, b) => `${a.category}${a.title}`.localeCompare(`${b.category}${b.title}`));
  return `
    ${pageHeader("Teacher Dashboard", "", true)}
    <section class="dashboard-actions">
      <button class="primary-btn" data-action="add">+ Add Website</button>
      <button class="outline-btn" data-action="changePin"> Change PIN</button>
      <button class="outline-btn" data-action="reset">↺ Reset Sample Links</button>
    </section>
    ${renderApprovedStudentManager()}
    <section class="form-card daily-launch-editor">
      <div>
        <span class="feature-kicker">Homepage Message</span>
        <h2>Today's Launch</h2>
        <p class="instruction">Update the message students see near the top of the homepage.</p>
      </div>
      <form id="dailyLaunchForm" class="form-grid">
        <div class="field">
          <label for="dailyLaunchMessage">Launch message</label>
          <div class="mini-editor" aria-label="Today's Launch word processor">
            <div class="mini-editor-toolbar" aria-label="Formatting tools">
              <div class="editor-tool-group editor-select-group">
                <select id="launchFontName" data-editor-select="fontName" title="Font">
                  <option value="Aptos">Aptos</option>
                  <option value="Arial">Arial</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                </select>
                <select id="launchFontSize" data-editor-select="fontSize" title="Font size">
                  <option value="2">12</option>
                  <option value="3" selected>14</option>
                  <option value="4">16</option>
                  <option value="5">18</option>
                  <option value="6">24</option>
                </select>
              </div>
              <div class="editor-tool-group">
                <button type="button" data-editor-command="undo" title="Undo">↶</button>
                <button type="button" data-editor-command="redo" title="Redo">↷</button>
              </div>
              <div class="editor-tool-group">
                <button type="button" data-editor-command="bold" title="Bold"><b>B</b></button>
                <button type="button" data-editor-command="italic" title="Italic"><i>I</i></button>
                <button type="button" data-editor-command="underline" title="Underline"><u>U</u></button>
              </div>
              <div class="editor-tool-group">
                <div class="editor-color-menu">
                  <button type="button" class="editor-color-tool" data-editor-palette="color" title="Text color">A</button>
                  <div class="editor-color-popover" data-editor-popover="color" aria-label="Text color choices">
                    <button type="button" class="editor-swatch" style="--swatch:#7b0b31" data-editor-swatch="color" data-color="#7b0b31" title="Maroon text"></button>
                    <button type="button" class="editor-swatch" style="--swatch:#222222" data-editor-swatch="color" data-color="#222222" title="Black text"></button>
                    <button type="button" class="editor-swatch" style="--swatch:#6b7280" data-editor-swatch="color" data-color="#6b7280" title="Gray text"></button>
                    <button type="button" class="editor-swatch" style="--swatch:#2563eb" data-editor-swatch="color" data-color="#2563eb" title="Blue text"></button>
                    <button type="button" class="editor-swatch" style="--swatch:#15803d" data-editor-swatch="color" data-color="#15803d" title="Green text"></button>
                  </div>
                </div>
                <div class="editor-color-menu">
                  <button type="button" class="editor-color-tool" data-editor-palette="backgroundColor" title="Highlight">H</button>
                  <div class="editor-color-popover" data-editor-popover="backgroundColor" aria-label="Highlight color choices">
                    <button type="button" class="editor-swatch" style="--swatch:#fff176" data-editor-swatch="backgroundColor" data-color="#fff176" title="Yellow highlight"></button>
                    <button type="button" class="editor-swatch" style="--swatch:#fecdd3" data-editor-swatch="backgroundColor" data-color="#fecdd3" title="Pink highlight"></button>
                    <button type="button" class="editor-swatch" style="--swatch:#bbf7d0" data-editor-swatch="backgroundColor" data-color="#bbf7d0" title="Green highlight"></button>
                    <button type="button" class="editor-swatch" style="--swatch:#bfdbfe" data-editor-swatch="backgroundColor" data-color="#bfdbfe" title="Blue highlight"></button>
                    <button type="button" class="editor-swatch" style="--swatch:#e5e7eb" data-editor-swatch="backgroundColor" data-color="#e5e7eb" title="Gray highlight"></button>
                  </div>
                </div>
              </div>
              <div class="editor-tool-group">
                <button type="button" data-editor-command="insertUnorderedList" title="Bulleted list">•</button>
                <button type="button" data-editor-command="insertOrderedList" title="Numbered list">1.</button>
              </div>
              <div class="editor-tool-group">
                <button type="button" data-editor-command="justifyLeft" title="Align left">☰</button>
                <button type="button" data-editor-command="justifyCenter" title="Align center">≡</button>
                <button type="button" data-editor-command="justifyRight" title="Align right">☷</button>
              </div>
            </div>
            <div id="dailyLaunchMessage" class="mini-editor-surface" contenteditable="true" role="textbox" aria-multiline="true">${sanitizeLaunchHtml(dailyLaunch.message)}</div>
          </div>
        </div>
        <p id="dailyLaunchStatus" class="request-message" aria-live="polite"></p>
        <button class="primary-btn" type="submit">Save Today's Launch</button>
      </form>
    </section>
    <section class="form-card class-timer-editor">
      <div>
        <span class="feature-kicker">Class Timer</span>
        <h2>Class Timer</h2>
        <p class="instruction">Start a timer students can see while they use the launchpad.</p>
      </div>
      <form id="classTimerForm" class="timer-form">
        <div class="field">
          <label for="classTimerTitle">Timer title</label>
          <select id="classTimerTitle">
            ${classTimerTitles.map(title => `<option value="${escapeHtml(title)}" ${title === classTimer.title ? "selected" : ""}>${escapeHtml(title)}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="classTimerMinutes">Minutes</label>
          <input id="classTimerMinutes" type="number" min="1" max="120" value="${Math.max(1, Math.round((classTimer.durationSeconds || DEFAULT_CLASS_TIMER.durationSeconds) / 60))}">
        </div>
        <div class="timer-preview">
          <span>Student display</span>
          <strong>${escapeHtml(classTimer.title)}</strong>
          <p>${escapeHtml(classTimerStatusText(classTimer))}</p>
        </div>
        <div class="timer-actions">
          <button class="primary-btn" type="submit">Start Timer</button>
          <button class="outline-btn" type="button" data-action="pauseTimer" ${classTimer.status !== "running" ? "disabled" : ""}>Pause</button>
          <button class="outline-btn" type="button" data-action="resumeTimer" ${classTimer.status !== "paused" ? "disabled" : ""}>Resume</button>
          <button class="outline-btn" type="button" data-action="resetTimer" ${classTimer.status === "idle" ? "disabled" : ""}>Reset</button>
          <button class="danger-btn" type="button" data-action="clearTimer" ${classTimer.status === "idle" ? "disabled" : ""}>Clear</button>
        </div>
      </form>
    </section>
    <section class="form-card random-activity-control">
      <div>
        <span class="feature-kicker">Student Choice</span>
        <h2>Random Activity</h2>
        <p class="instruction">Control whether students can use the Random Activity picker.</p>
      </div>
      <div class="random-lock-panel">
        <div class="random-lock-status ${randomActivitySettings.locked ? "is-locked" : "is-open"}">
          <span>Current Status</span>
          <strong>${randomActivitySettings.locked ? "Locked" : "Available"}</strong>
          <p>${randomActivitySettings.locked ? "Students can see the pane, but cannot pick a random site." : "Students can use the picker to choose an approved activity."}</p>
        </div>
        <label class="toggle-row random-lock-toggle">
          <span>Lock Random Activity</span>
          <span class="switch">
            <input type="checkbox" data-action="toggleRandomActivityLock" ${randomActivitySettings.locked ? "checked" : ""}>
            <span class="slider"></span>
          </span>
        </label>
      </div>
    </section>
    <h2 class="section-title">Colt Corner Threads</h2>
    <section class="teacher-list">
      ${classThreads.length ? sortedThreads().map(renderTeacherThread).join("") : emptyCard("No Colt Corner topics yet.")}
    </section>
    <h2 class="section-title">Muted Students</h2>
    <section class="teacher-list">
      ${mutedStudents.length ? mutedStudents.map(renderMutedStudent).join("") : emptyCard("No muted students.")}
    </section>
    <h2 class="section-title">Student Launchpad Feedback</h2>
    <section class="teacher-list">
      ${websiteRequests.length ? websiteRequests.map(renderWebsiteRequest).join("") : emptyCard("No student feedback yet.")}
    </section>
    <h2 class="section-title">Manage Links</h2>
    <section class="teacher-list">
      ${sorted.map(renderTeacherLink).join("")}
    </section>
  `;
}

function dashboardSectionDetails() {
  return dashboardSections.find(section => section.id === dashboardSection) || dashboardSections[0];
}

function renderDashboardNavigation() {
  return `
    <nav class="dashboard-nav" aria-label="Teacher dashboard sections">
      <div class="dashboard-nav-heading">
        <span class="feature-kicker">Teacher Controls</span>
        <strong>Dashboard Menu</strong>
      </div>
      <div class="dashboard-nav-items">
        ${dashboardSections.map(section => `
          <button
            type="button"
            class="dashboard-nav-button ${section.id === dashboardSection ? "is-active" : ""}"
            data-action="dashboardSection"
            data-section="${section.id}"
            ${section.id === dashboardSection ? 'aria-current="page"' : ""}
          >
            <span class="dashboard-nav-icon" aria-hidden="true">${section.icon}</span>
            <span class="dashboard-nav-label">${escapeHtml(section.navLabel || section.label)}</span>
            ${section.id === "requests" && websiteRequests.length ? `<b>${websiteRequests.length}</b>` : ""}
            ${section.id === "corner" && moderationQueue.length ? `<b>${moderationQueue.length}</b>` : ""}
            ${section.id === "assignments" && submissions.some(item => item.status === "submitted") ? `<b>${submissions.filter(item => item.status === "submitted").length}</b>` : ""}
            ${section.id === "passes" && classroomPassData.passes.some(item => item.status === "out") ? `<b>${classroomPassData.passes.filter(item => item.status === "out").length}</b>` : ""}
          </button>
        `).join("")}
      </div>
    </nav>
  `;
}

function renderDashboardOverview() {
  const registered = approvedStudents.filter(student => student.registered).length;
  const waiting = approvedStudents.filter(student => !student.registered).length;
  const activeLinks = links.filter(link => link.active).length;
  const metrics = [
    ["Approved Students", approvedStudents.length, "students"],
    ["Registered", registered, "students"],
    ["Awaiting First Login", waiting, "students"],
    ["Open Assignments", assignments.filter(item => item.status === "open").length, "assignments"],
    ["New Submissions", submissions.filter(item => item.status === "submitted").length, "assignments"],
    ["Students Currently Out", classroomPassData.passes.filter(item => item.status === "out").length, "passes"],
    ["Colt Corner Topics", classThreads.length, "corner"],
    ["Posts Awaiting Review", moderationQueue.length, "corner"],
    ["Launchpad Feedback", websiteRequests.length, "requests"],
    ["Muted Students", mutedStudents.length, "corner"]
  ];
  return `
    <section class="dashboard-overview" aria-label="Dashboard overview">
      <div class="dashboard-metric-grid">
        ${metrics.map(([label, value, section]) => `
          <button class="dashboard-metric-card" data-action="dashboardSection" data-section="${section}">
            <span>${escapeHtml(label)}</span>
            <strong>${value}</strong>
            <small>View details →</small>
          </button>
        `).join("")}
      </div>
      <section class="dashboard-quick-panel">
        <div>
          <span class="feature-kicker">Quick Actions</span>
          <h3>What would you like to manage?</h3>
          <p class="instruction">${activeLinks} of ${links.length} websites are currently visible to students.</p>
        </div>
        <div class="dashboard-quick-actions">
          <button class="primary-btn" data-action="add">+ Add Website</button>
          <button class="outline-btn" data-action="dashboardSection" data-section="assignments">Assignments & Submissions</button>
          <button class="outline-btn" data-action="dashboardSection" data-section="passes">Classroom Pass Log</button>
          <button class="outline-btn" data-action="dashboardSection" data-section="students">Manage Student Access</button>
          <button class="outline-btn" data-action="dashboardSection" data-section="tools">Open Classroom Tools</button>
          <button class="outline-btn" data-action="dashboardSection" data-section="requests">Review Feedback</button>
        </div>
      </section>
      <section class="dashboard-status-panel">
        <div>
          <span class="dashboard-status-dot ${randomActivitySettings.locked ? "is-locked" : ""}"></span>
          <span>Random Activity</span>
          <strong>${randomActivitySettings.locked ? "Locked" : "Available"}</strong>
        </div>
        <div>
          <span class="dashboard-status-dot ${classTimer.status === "running" ? "" : "is-idle"}"></span>
          <span>Class Timer</span>
          <strong>${escapeHtml(classTimerStatusText(classTimer))}</strong>
        </div>
      </section>
    </section>
  `;
}

function renderDashboardClassroomTools() {
  const legacy = renderLegacyDashboard();
  const start = legacy.indexOf('<section class="form-card daily-launch-editor">');
  const end = legacy.indexOf('<h2 class="section-title">Colt Corner Threads</h2>');
  return `<div class="dashboard-tools-grid">${legacy.slice(start, end)}</div>`;
}

function renderModerationReasons(item) {
  const reasons = Array.isArray(item.moderationReasons) ? item.moderationReasons : [];
  return reasons.length
    ? `<ul class="moderation-reason-list">${reasons.map(reason => `<li>${escapeHtml(reason.label)}</li>`).join("")}</ul>`
    : `<p class="instruction">No rule details were recorded.</p>`;
}

function renderPendingModerationCard(item) {
  const submitted = formatShortDate(item.submittedAt);
  return `
    <article class="teacher-card moderation-card" data-moderation-card="${escapeHtml(item.id)}">
      <div class="moderation-card-heading">
        <div>
          <span class="feature-kicker">${item.type === "reply" ? "Pending Reply" : "Pending Topic"}</span>
          <h3>${escapeHtml(item.studentName || "Student")}</h3>
          <p class="meta">${escapeHtml(forumRoleLabel(item.grade))}${submitted ? ` • ${escapeHtml(submitted)}` : ""}</p>
        </div>
        <span class="moderation-status-pill is-pending">Needs Review</span>
      </div>
      ${item.type === "topic" ? `
        <label class="field">
          <span>Topic title</span>
          <input class="moderation-edit-title" maxlength="80" value="${escapeHtml(item.title)}">
        </label>
      ` : ""}
      <label class="field">
        <span>Message</span>
        <textarea class="moderation-edit-message" maxlength="${item.type === "topic" ? "360" : "320"}">${escapeHtml(item.message)}</textarea>
      </label>
      <div class="moderation-trigger-panel">
        <strong>Why it was flagged</strong>
        ${renderModerationReasons(item)}
      </div>
      <div class="actions moderation-actions">
        <button class="primary-btn" data-action="moderatePost" data-moderation-action="approve" data-id="${escapeHtml(item.id)}">Approve</button>
        <button class="outline-btn" data-action="moderatePost" data-moderation-action="edit_approve" data-id="${escapeHtml(item.id)}">Edit and Approve</button>
        <button class="outline-btn" data-action="moderatePost" data-moderation-action="reject" data-id="${escapeHtml(item.id)}">Reject</button>
        <button class="danger-btn" data-action="moderatePost" data-moderation-action="delete" data-id="${escapeHtml(item.id)}">Delete</button>
      </div>
    </article>
  `;
}

function renderRecentModerationItem(item) {
  const moderated = formatShortDate(item.moderatedAt);
  const approved = item.moderationStatus === "approved";
  return `
    <article class="teacher-card moderation-recent-card">
      <div class="moderation-card-heading">
        <div>
          <strong>${escapeHtml(item.studentName || "Student")}</strong>
          <p class="meta">${item.type === "reply" ? "Reply" : "Topic"}${moderated ? ` • ${escapeHtml(moderated)}` : ""}${item.moderatedBy ? ` • ${escapeHtml(item.moderatedBy)}` : ""}</p>
        </div>
        <span class="moderation-status-pill ${approved ? "is-approved" : "is-rejected"}">${approved ? "Approved" : "Rejected"}</span>
      </div>
      <p class="instruction">${escapeHtml(item.message)}</p>
      ${renderModerationReasons(item)}
    </article>
  `;
}

function renderDashboardColtCorner() {
  return `
    <section class="moderation-dashboard" aria-labelledby="moderationQueueHeading">
      <div class="dashboard-subheading">
        <div><span class="feature-kicker">Server-Side Safety Review</span><h3 id="moderationQueueHeading">Colt Corner Moderation</h3></div>
        <span class="dashboard-count">${moderationQueue.length}</span>
      </div>
      <p class="instruction">Messages held here are hidden from students until you approve them.</p>
      <p id="moderationDashboardStatus" class="request-message" aria-live="polite"></p>
      <div class="moderation-queue">
        ${moderationQueue.length
          ? moderationQueue.map(renderPendingModerationCard).join("")
          : emptyCard("No Colt Corner messages are waiting for review.")}
      </div>
      <details class="moderation-recent">
        <summary>Recently moderated posts (${recentlyModerated.length})</summary>
        <div class="teacher-list">
          ${recentlyModerated.length
            ? recentlyModerated.map(renderRecentModerationItem).join("")
            : emptyCard("No recently moderated posts.")}
        </div>
      </details>
    </section>
    <div class="dashboard-split-view">
      <section>
        <div class="dashboard-subheading">
          <div><span class="feature-kicker">Discussion Board</span><h3>Topics & Replies</h3></div>
          <span class="dashboard-count">${classThreads.length}</span>
        </div>
        <div class="teacher-list">
          ${classThreads.length ? sortedThreads().map(renderTeacherThread).join("") : emptyCard("No Colt Corner topics yet.")}
        </div>
      </section>
      <aside>
        <div class="dashboard-subheading">
          <div><span class="feature-kicker">Posting Access</span><h3>Muted Students</h3></div>
          <span class="dashboard-count">${mutedStudents.length}</span>
        </div>
        <div class="teacher-list">
          ${mutedStudents.length ? mutedStudents.map(renderMutedStudent).join("") : emptyCard("No muted students.")}
        </div>
      </aside>
    </div>
  `;
}

function renderDashboardRequests() {
  return `
    <section>
      <div class="dashboard-subheading">
        <div><span class="feature-kicker">Student Suggestions & Reports</span><h3>Pending Launchpad Feedback</h3></div>
        <span class="dashboard-count">${websiteRequests.length}</span>
      </div>
      <div class="teacher-list">
        ${websiteRequests.length ? websiteRequests.map(renderWebsiteRequest).join("") : emptyCard("No student feedback yet.")}
      </div>
    </section>
  `;
}

function filteredDashboardLinks() {
  const query = dashboardLinkSearch.trim().toLowerCase();
  return [...links]
    .filter(link => dashboardLinkCategory === "all" || link.category === dashboardLinkCategory)
    .filter(link => dashboardLinkStatus === "all" || (dashboardLinkStatus === "active" ? link.active : !link.active))
    .filter(link => !query || [link.title, link.category, link.instruction, link.url].some(value => String(value).toLowerCase().includes(query)))
    .sort((a, b) => `${a.category}${a.title}`.localeCompare(`${b.category}${b.title}`));
}

function renderDashboardLinkRow(link) {
  return `
    <article class="dashboard-link-row">
      <div class="dashboard-link-name">
        <strong>${escapeHtml(link.title)}</strong>
        <small>${escapeHtml(link.url)}</small>
      </div>
      <span class="dashboard-category-pill">${escapeHtml(link.category)}</span>
      <label class="toggle-row dashboard-link-toggle">
        <span>${link.active ? "Active" : "Hidden"}</span>
        <span class="switch"><input type="checkbox" data-action="toggleActive" data-id="${link.id}" ${link.active ? "checked" : ""}><span class="slider"></span></span>
      </label>
      <div class="actions">
        <button class="outline-btn" data-action="edit" data-id="${link.id}">Edit</button>
        <button class="danger-btn" data-action="delete" data-id="${link.id}">Delete</button>
      </div>
    </article>
  `;
}

function renderDashboardWebsites() {
  const filtered = filteredDashboardLinks();
  const pageCount = Math.max(1, Math.ceil(filtered.length / DASHBOARD_LINKS_PER_PAGE));
  dashboardLinkPage = Math.min(dashboardLinkPage, pageCount);
  const start = (dashboardLinkPage - 1) * DASHBOARD_LINKS_PER_PAGE;
  const visible = filtered.slice(start, start + DASHBOARD_LINKS_PER_PAGE);
  return `
    <section class="dashboard-website-manager">
      <div class="dashboard-manager-toolbar">
        <label class="dashboard-search">
          <span class="sr-only">Search websites</span>
          <input id="dashboardLinkSearch" type="search" value="${escapeHtml(dashboardLinkSearch)}" placeholder="Search websites…">
        </label>
        <label>
          <span class="sr-only">Filter by category</span>
          <select id="dashboardLinkCategory">
            <option value="all">All categories</option>
            ${categories.map(category => `<option value="${escapeHtml(category)}" ${dashboardLinkCategory === category ? "selected" : ""}>${escapeHtml(category)}</option>`).join("")}
          </select>
        </label>
        <label>
          <span class="sr-only">Filter by status</span>
          <select id="dashboardLinkStatus">
            <option value="all" ${dashboardLinkStatus === "all" ? "selected" : ""}>All statuses</option>
            <option value="active" ${dashboardLinkStatus === "active" ? "selected" : ""}>Active</option>
            <option value="hidden" ${dashboardLinkStatus === "hidden" ? "selected" : ""}>Hidden</option>
          </select>
        </label>
        <button class="primary-btn" data-action="add">+ Add Website</button>
      </div>
      <div class="dashboard-manager-summary">
        <strong>${filtered.length} ${filtered.length === 1 ? "website" : "websites"}</strong>
        <span>Page ${dashboardLinkPage} of ${pageCount}</span>
      </div>
      <div class="dashboard-link-table" aria-live="polite">
        <div class="dashboard-link-header" aria-hidden="true"><span>Website</span><span>Category</span><span>Status</span><span>Actions</span></div>
        ${visible.length ? visible.map(renderDashboardLinkRow).join("") : emptyCard("No websites match these filters.")}
      </div>
      ${pageCount > 1 ? `
        <div class="dashboard-pagination" aria-label="Website pages">
          <button class="outline-btn" data-action="dashboardLinkPage" data-page="${dashboardLinkPage - 1}" ${dashboardLinkPage === 1 ? "disabled" : ""}>← Previous</button>
          <span>Page ${dashboardLinkPage} of ${pageCount}</span>
          <button class="outline-btn" data-action="dashboardLinkPage" data-page="${dashboardLinkPage + 1}" ${dashboardLinkPage === pageCount ? "disabled" : ""}>Next →</button>
        </div>
      ` : ""}
    </section>
  `;
}

function renderDashboardSettings() {
  return `
    <div class="dashboard-settings-grid">
      <section class="form-card dashboard-setting-card">
        <span class="feature-kicker">Teacher Security</span>
        <h3>Teacher PIN</h3>
        <p class="instruction">Change the private PIN used to open this dashboard.</p>
        <button class="primary-btn" data-action="changePin">Change Teacher PIN</button>
      </section>
      <section class="form-card dashboard-setting-card">
        <span class="feature-kicker">Website Library</span>
        <h3>Reset Sample Links</h3>
        <p class="instruction">Restore the original sample websites. This removes teacher edits to the link library.</p>
        <button class="danger-btn" data-action="reset">Reset Sample Links</button>
      </section>
      <section class="form-card dashboard-setting-card">
        <span class="feature-kicker">Current Session</span>
        <h3>Sign Out</h3>
        <p class="instruction">Log out when you are finished, especially on a shared computer.</p>
        <button class="outline-btn" data-action="logout">Log Out</button>
      </section>
    </div>
  `;
}

function assignmentStudentCount(assignment) {
  return approvedStudents.filter(student => !assignment.grades.length || assignment.grades.includes(String(student.grade))).length;
}

function renderAssignmentEditor() {
  if (!assignmentEditorId) return "";
  const existing = assignments.find(item => item.id === assignmentEditorId) || null;
  const assignment = existing || {
    title: "", instructions: "", grades: ["4", "5", "6", "7"], dueAt: "",
    acceptedTypes: [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".png", ".jpg", ".jpeg", ".webp", ".txt"],
    maxFileSizeMb: 10, allowResubmissions: true, status: "open"
  };
  const localDue = assignment.dueAt ? new Date(new Date(assignment.dueAt).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";
  const localDueDate = localDue ? localDue.slice(0, 10) : "";
  const localDueTime = localDue ? localDue.slice(11, 16) : "";
  const timeValues = Array.from({ length: 57 }, (_, index) => {
    const totalMinutes = 6 * 60 + index * 15;
    return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`;
  });
  if (localDueTime && !timeValues.includes(localDueTime)) timeValues.unshift(localDueTime);
  const timeOptions = timeValues.map(value => {
    const [hourValue, minuteValue] = value.split(":").map(Number);
    const totalMinutes = hourValue * 60 + minuteValue;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const labelHour = hour % 12 || 12;
    return `<option value="${value}" ${localDueTime === value ? "selected" : ""}>${labelHour}:${String(minute).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}</option>`;
  }).join("");
  return `
    <section class="assignment-editor-card">
      <header><div><span class="feature-kicker">${existing ? "Edit Assignment" : "New Assignment"}</span><h3>${existing ? escapeHtml(existing.title) : "Create an Assignment"}</h3></div><button class="outline-btn" data-action="closeAssignmentEditor">Close</button></header>
      <form id="assignmentEditorForm" data-id="${existing ? escapeHtml(existing.id) : ""}">
        <label class="field"><span>Assignment title</span><input id="assignmentTitle" maxlength="120" value="${escapeHtml(assignment.title)}" placeholder="Example: Keyboard Shortcuts Practice" required></label>
        <label class="field assignment-instructions-field"><span>Directions</span><textarea id="assignmentInstructions" maxlength="3000" placeholder="Explain what students should complete and submit.">${escapeHtml(assignment.instructions)}</textarea></label>
        <section class="assignment-attachment-editor">
          <div><span class="feature-kicker">Assignment File</span><strong>Attach the document students need</strong><p>Optional: add a Word document, PDF, PowerPoint, image, or text file up to 20 MB.</p></div>
          ${assignment.attachmentOriginalName ? `<div class="current-assignment-attachment"><span><strong>${escapeHtml(assignment.attachmentOriginalName)}</strong><small>${formatFileSize(assignment.attachmentSize)}</small></span><a class="outline-btn" href="/api/assignments/${encodeURIComponent(assignment.id)}/attachment">Download</a><label><input id="assignmentRemoveAttachment" type="checkbox"> Remove this file</label></div>` : ""}
          <label class="assignment-attachment-picker" for="assignmentAttachmentFile"><span aria-hidden="true">＋</span><span><strong>${assignment.attachmentOriginalName ? "Replace assignment file" : "Choose assignment file"}</strong><small>DOC, DOCX, PDF, PPT, PPTX, PNG, JPG, WEBP, or TXT</small></span><input id="assignmentAttachmentFile" type="file" accept=".doc,.docx,.pdf,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.txt"></label>
          <div id="selectedAssignmentAttachment" class="selected-upload-file">${assignment.attachmentOriginalName ? "Keep the current file, or choose a replacement." : "No assignment file selected."}</div>
        </section>
        <fieldset class="assignment-option-group"><legend>Grade levels</legend><div>${["4", "5", "6", "7"].map(grade => `<label><input type="checkbox" name="assignmentGrade" value="${grade}" ${assignment.grades.includes(grade) ? "checked" : ""}> Grade ${grade}</label>`).join("")}</div></fieldset>
        <div class="assignment-schedule-grid">
          <label class="field"><span>Due date</span><input id="assignmentDueDate" type="date" value="${escapeHtml(localDueDate)}"></label>
          <label class="field"><span>Due time</span><select id="assignmentDueTime"><option value="">Select a time</option>${timeOptions}</select></label>
          <label class="field"><span>Status</span><select id="assignmentStatus"><option value="draft" ${assignment.status === "draft" ? "selected" : ""}>Draft</option><option value="open" ${assignment.status === "open" ? "selected" : ""}>Open</option><option value="closed" ${assignment.status === "closed" ? "selected" : ""}>Closed</option><option value="archived" ${assignment.status === "archived" ? "selected" : ""}>Archived</option></select></label>
        </div>
        <fieldset class="assignment-option-group assignment-file-types"><legend>Files students may submit</legend><div>${[[".pdf", "PDF"], [".doc", "Word DOC"], [".docx", "Word DOCX"], [".ppt", "PowerPoint PPT"], [".pptx", "PowerPoint PPTX"], [".png", "PNG"], [".jpg", "JPG"], [".webp", "WEBP"], [".txt", "Text"]].map(([extension, label]) => `<label><input type="checkbox" name="assignmentFileType" value="${extension}" ${assignment.acceptedTypes.includes(extension) || (extension === ".jpg" && assignment.acceptedTypes.includes(".jpeg")) ? "checked" : ""}> ${label}</label>`).join("")}</div></fieldset>
        <label class="field"><span>Maximum file size</span><select id="assignmentMaxSize">${[5, 10, 15].map(size => `<option value="${size}" ${assignment.maxFileSizeMb === size ? "selected" : ""}>${size} MB</option>`).join("")}</select></label>
        <label class="toggle-row assignment-resubmission-toggle"><span>Allow students to replace a submission</span><span class="switch"><input id="assignmentResubmissions" type="checkbox" ${assignment.allowResubmissions ? "checked" : ""}><span class="slider"></span></span></label>
        <p id="assignmentEditorMessage" class="request-message" aria-live="polite"></p>
        <button class="primary-btn" type="submit">${existing ? "Save Assignment" : "Create Assignment"}</button>
      </form>
    </section>
  `;
}

function renderTeacherAssignmentRow(assignment) {
  const assignmentSubmissions = submissions.filter(item => item.assignmentId === assignment.id);
  return `
    <article class="teacher-assignment-row">
      <div><span class="assignment-card-status is-${escapeHtml(assignment.status)}">${escapeHtml(assignment.status)}</span><strong>${escapeHtml(assignment.title)}</strong><small>${escapeHtml(assignmentDueText(assignment))} • ${assignment.grades.length ? `Grades ${escapeHtml(assignment.grades.join(", "))}` : "All grades"}</small></div>
      <div class="teacher-assignment-progress"><strong>${assignmentSubmissions.length}</strong><span>of ${assignmentStudentCount(assignment)} submitted</span></div>
      <div class="actions"><button class="outline-btn" data-action="editAssignment" data-id="${escapeHtml(assignment.id)}">Edit</button><button class="danger-btn" data-action="deleteAssignment" data-id="${escapeHtml(assignment.id)}">Delete</button></div>
    </article>
  `;
}

function filteredSubmissions() {
  const query = dashboardSubmissionSearch.trim().toLowerCase();
  return submissions.filter(item => dashboardAssignmentFilter === "all" || item.assignmentId === dashboardAssignmentFilter)
    .filter(item => dashboardGradeFilter === "all" || item.grade === dashboardGradeFilter)
    .filter(item => dashboardSubmissionStatus === "all" || item.status === dashboardSubmissionStatus)
    .filter(item => !query || [item.studentName, item.studentEmail, item.originalName].some(value => String(value).toLowerCase().includes(query)))
    .sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt));
}

function submissionTimingDetails(assignment, submission) {
  if (!assignment?.dueAt || !submission?.submittedAt) return null;
  const dueAt = Date.parse(assignment.dueAt);
  const submittedAt = Date.parse(submission.submittedAt);
  if (!Number.isFinite(dueAt) || !Number.isFinite(submittedAt)) return null;
  if (submittedAt <= dueAt) return { daysLate: 0, label: "On time", className: "is-on-time" };
  const daysLate = Math.ceil((submittedAt - dueAt) / (24 * 60 * 60 * 1000));
  return {
    daysLate,
    label: `Late by ${daysLate} ${daysLate === 1 ? "day" : "days"}`,
    className: "is-late"
  };
}

function renderSubmissionTimingBadge(assignment, submission) {
  const timing = submissionTimingDetails(assignment, submission);
  if (!timing) return "";
  return `<span class="submission-late-badge ${timing.className}" title="Due ${escapeHtml(assignmentDueText(assignment))}">${escapeHtml(timing.label)}</span>`;
}

function renderTeacherSubmissionRow(submission) {
  const assignment = assignments.find(item => item.id === submission.assignmentId);
  return `
    <button class="teacher-submission-row ${selectedSubmissionId === submission.id ? "is-selected" : ""}" data-action="selectSubmission" data-id="${escapeHtml(submission.id)}">
      <span class="submission-student-initial">${escapeHtml((submission.studentName || "S").charAt(0))}</span>
      <span><strong>${escapeHtml(submission.studentName || "Student")}</strong><small>Grade ${escapeHtml(submission.grade)} • ${escapeHtml(assignment ? assignment.title : "Assignment")}</small><span class="submission-row-timing"><span class="submission-time">${escapeHtml(formatShortDate(submission.submittedAt))}</span>${renderSubmissionTimingBadge(assignment, submission)}</span></span>
      <span class="assignment-card-status is-${escapeHtml(submission.status)}">${submission.status === "submitted" ? "New" : escapeHtml(submission.status)}</span>
    </button>
  `;
}

function renderTeacherSubmissionPreview(submission) {
  if (!submission) return `<div class="submission-preview-empty teacher-preview-empty"><strong>Select a submission</strong><span>The student’s work will open here without downloading it.</span></div>`;
  const assignment = assignments.find(item => item.id === submission.assignmentId);
  return `
    <article class="teacher-submission-preview">
      <header><div><span class="feature-kicker">Student Submission</span><h3>${escapeHtml(submission.studentName)}</h3><p>Grade ${escapeHtml(submission.grade)} • ${escapeHtml(assignment ? assignment.title : "Assignment")} • Submitted ${escapeHtml(formatShortDate(submission.submittedAt))}</p></div><div class="teacher-submission-status-stack"><span class="assignment-card-status is-${escapeHtml(submission.status)}">${escapeHtml(submission.status)}</span>${renderSubmissionTimingBadge(assignment, submission)}</div></header>
      <div class="submission-file-heading"><div><strong>${escapeHtml(submission.submissionType === "link" ? submission.projectTitle : submission.originalName)}</strong><span>${submission.submissionType === "link" ? "External project link" : formatFileSize(submission.size)}</span></div>${submission.submissionType === "link" ? `<a class="outline-btn" href="${escapeHtml(submission.projectUrl)}" target="_blank" rel="noopener noreferrer">Open Project</a>` : `<a class="outline-btn" href="/api/submissions/${encodeURIComponent(submission.id)}/file" download>Download</a>`}</div>
      <div class="submission-preview-box teacher-file-preview">${renderSubmissionPreview(submission)}</div>
      ${submission.note ? `<div class="submission-note"><strong>Student note:</strong> ${escapeHtml(submission.note)}</div>` : ""}
      <form id="submissionReviewForm" data-id="${escapeHtml(submission.id)}">
        <label class="field"><span>Teacher feedback</span><textarea id="submissionFeedback" maxlength="1500" placeholder="Add clear feedback for the student">${escapeHtml(submission.feedback)}</textarea></label>
        <div class="submission-review-actions"><button class="outline-btn" type="submit" name="reviewAction" value="reviewed">Mark Reviewed</button><button class="primary-btn" type="submit" name="reviewAction" value="returned">Return to Student</button><button class="danger-btn" type="button" data-action="deleteSubmission" data-id="${escapeHtml(submission.id)}">Delete</button></div>
        <p id="submissionReviewMessage" class="request-message" aria-live="polite"></p>
      </form>
    </article>
  `;
}

function renderDashboardAssignments() {
  const openAssignments = assignments.filter(item => item.status === "open").length;
  const newSubmissions = submissions.filter(item => item.status === "submitted").length;
  const returned = submissions.filter(item => item.status === "returned").length;
  const missing = assignments.filter(item => item.status === "open").reduce((total, assignment) => total + Math.max(0, assignmentStudentCount(assignment) - submissions.filter(item => item.assignmentId === assignment.id).length), 0);
  const visible = filteredSubmissions();
  const selected = visible.find(item => item.id === selectedSubmissionId) || visible[0] || null;
  selectedSubmissionId = selected ? selected.id : "";
  return `
    <section class="teacher-assignment-dashboard">
      <div class="assignment-metric-grid">${[["Open Assignments", openAssignments], ["New Submissions", newSubmissions], ["Missing", missing], ["Returned", returned]].map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join("")}</div>
      <div class="assignment-manager-heading"><div><span class="feature-kicker">Class Work</span><h3>Assignments</h3></div><button class="primary-btn" data-action="newAssignment">+ Create Assignment</button></div>
      ${renderAssignmentEditor()}
      <div class="teacher-assignment-list">${assignments.length ? assignments.map(renderTeacherAssignmentRow).join("") : emptyCard("No assignments yet. Create the first assignment when you are ready.")}</div>
      <div class="assignment-manager-heading submission-inbox-heading"><div><span class="feature-kicker">Submission Inbox</span><h3>Student Work</h3></div><span class="dashboard-count">${visible.length}</span></div>
      <div class="submission-filter-toolbar">
        <label class="dashboard-search"><span class="sr-only">Search students</span><input id="dashboardSubmissionSearch" type="search" value="${escapeHtml(dashboardSubmissionSearch)}" placeholder="Search students…"></label>
        <select id="dashboardAssignmentFilter" aria-label="Filter by assignment"><option value="all">All assignments</option>${assignments.map(item => `<option value="${escapeHtml(item.id)}" ${dashboardAssignmentFilter === item.id ? "selected" : ""}>${escapeHtml(item.title)}</option>`).join("")}</select>
        <select id="dashboardGradeFilter" aria-label="Filter by grade"><option value="all">All grades</option>${["4", "5", "6", "7"].map(grade => `<option value="${grade}" ${dashboardGradeFilter === grade ? "selected" : ""}>Grade ${grade}</option>`).join("")}</select>
        <select id="dashboardSubmissionStatus" aria-label="Filter by status"><option value="all">All statuses</option><option value="submitted" ${dashboardSubmissionStatus === "submitted" ? "selected" : ""}>New</option><option value="reviewed" ${dashboardSubmissionStatus === "reviewed" ? "selected" : ""}>Reviewed</option><option value="returned" ${dashboardSubmissionStatus === "returned" ? "selected" : ""}>Returned</option></select>
      </div>
      <div class="teacher-submission-split"><div class="teacher-submission-list">${visible.length ? visible.map(renderTeacherSubmissionRow).join("") : emptyCard("No submissions match these filters.")}</div>${renderTeacherSubmissionPreview(selected)}</div>
    </section>
  `;
}

function studentGradeNumber(student) {
  const match = String(student && student.grade || "").match(/[4-7]/);
  return match ? match[0] : "";
}

function gradebookAssignmentsFor(grade) {
  return assignments.filter(assignment => assignment.status !== "archived" && assignment.status !== "draft" && (
    !assignment.grades.length || assignment.grades.includes(grade)
  ));
}

function renderGradebookStudentRow(student, gradeAssignments) {
  const email = String(student.email || "").toLowerCase();
  const relevantAssignments = dashboardGradebookAssignment === "all"
    ? gradeAssignments
    : gradeAssignments.filter(item => item.id === dashboardGradebookAssignment);
  const studentSubmissions = submissions.filter(item => item.studentEmail.toLowerCase() === email && relevantAssignments.some(assignment => assignment.id === item.assignmentId));
  const submitted = studentSubmissions.length;
  const missing = Math.max(0, relevantAssignments.length - submitted);
  const reviewed = studentSubmissions.filter(item => item.status === "reviewed").length;
  const returned = studentSubmissions.filter(item => item.status === "returned").length;
  const latest = [...studentSubmissions].sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt))[0];
  const focusedAssignment = dashboardGradebookAssignment === "all" ? null : relevantAssignments[0];
  const focusedSubmission = focusedAssignment ? studentSubmissions.find(item => item.assignmentId === focusedAssignment.id) : null;
  return `
    <article class="gradebook-student-row">
      <div class="gradebook-student-name"><span class="submission-student-initial">${escapeHtml((student.name || "S").charAt(0))}</span><span><strong>${escapeHtml(student.name || "Student")}</strong><small>${escapeHtml(student.email || "")}</small></span></div>
      <span>${relevantAssignments.length}</span>
      <span class="gradebook-positive">${submitted}</span>
      <span class="gradebook-missing ${missing ? "has-missing" : ""}">${missing}</span>
      <span>${reviewed}</span>
      <span>${returned}</span>
      <span class="gradebook-latest">${focusedAssignment
        ? `<span class="assignment-card-status is-${escapeHtml(focusedSubmission ? focusedSubmission.status : "todo")}">${focusedSubmission ? escapeHtml(focusedSubmission.status) : "Missing"}</span>`
        : (latest ? escapeHtml(formatShortDate(latest.submittedAt)) : "No submissions")}</span>
      <button class="outline-btn" data-action="viewGradebookStudent" data-student="${escapeHtml(student.name || student.email)}">View Work</button>
    </article>
  `;
}

function renderDashboardGradebooks() {
  const grade = dashboardGradebookGrade;
  const gradeAssignments = gradebookAssignmentsFor(grade);
  const query = dashboardGradebookSearch.trim().toLowerCase();
  const gradeStudents = approvedStudents.filter(student => studentGradeNumber(student) === grade);
  const students = gradeStudents
    .filter(student => !query || [student.name, student.email].some(value => String(value || "").toLowerCase().includes(query)))
    .sort((a, b) => String(a.name || a.email).localeCompare(String(b.name || b.email)));
  const gradeStudentEmails = new Set(gradeStudents.map(student => String(student.email || "").toLowerCase()));
  const gradeSubmissions = submissions.filter(item => gradeStudentEmails.has(item.studentEmail.toLowerCase()) && gradeAssignments.some(assignment => assignment.id === item.assignmentId));
  const totalExpected = gradeStudents.length * (dashboardGradebookAssignment === "all" ? gradeAssignments.length : Math.min(1, gradeAssignments.filter(item => item.id === dashboardGradebookAssignment).length));
  const visibleSubmitted = dashboardGradebookAssignment === "all" ? gradeSubmissions : gradeSubmissions.filter(item => item.assignmentId === dashboardGradebookAssignment);
  return `
    <section class="gradebook-dashboard">
      <div class="gradebook-tabs" role="tablist" aria-label="Gradebook grade levels">${["4", "5", "6", "7"].map(value => `<button class="${grade === value ? "is-active" : ""}" data-action="gradebookGrade" data-grade="${value}">Grade ${value}<span>${approvedStudents.filter(student => studentGradeNumber(student) === value).length}</span></button>`).join("")}</div>
      <div class="gradebook-summary-grid">
        <div><span>Students</span><strong>${gradeStudents.length}</strong></div>
        <div><span>Assignments</span><strong>${gradeAssignments.length}</strong></div>
        <div><span>Submitted</span><strong>${visibleSubmitted.length}</strong></div>
        <div><span>Missing</span><strong>${Math.max(0, totalExpected - visibleSubmitted.length)}</strong></div>
      </div>
      <div class="gradebook-toolbar">
        <label class="dashboard-search"><span class="sr-only">Search this gradebook</span><input id="dashboardGradebookSearch" type="search" value="${escapeHtml(dashboardGradebookSearch)}" placeholder="Search Grade ${grade} students…"></label>
        <label><span class="sr-only">Choose assignment</span><select id="dashboardGradebookAssignment"><option value="all">All assignments</option>${gradeAssignments.map(assignment => `<option value="${escapeHtml(assignment.id)}" ${dashboardGradebookAssignment === assignment.id ? "selected" : ""}>${escapeHtml(assignment.title)}</option>`).join("")}</select></label>
      </div>
      <div class="gradebook-table" aria-live="polite">
        <div class="gradebook-header" aria-hidden="true"><span>Student</span><span>Assigned</span><span>Submitted</span><span>Missing</span><span>Reviewed</span><span>Returned</span><span>Latest / Status</span><span>Action</span></div>
        ${students.length ? students.map(student => renderGradebookStudentRow(student, gradeAssignments)).join("") : emptyCard(`No Grade ${grade} students match this search.`)}
      </div>
    </section>
  `;
}

function classroomPassStatusLabel(pass) {
  if (pass.status === "out") return "Currently Out";
  if (pass.status === "corrected") return "Teacher Corrected";
  return "Returned";
}

function renderClassroomPassActiveCard(pass) {
  return `
    <article class="classroom-pass-current-card">
      <span class="classroom-pass-current-avatar" aria-hidden="true">${escapeHtml((pass.studentName || "S").charAt(0))}</span>
      <div>
        <span class="feature-kicker">Currently Out</span>
        <h3>${escapeHtml(pass.studentName)}</h3>
        <p>Grade ${escapeHtml(pass.grade)} · ${escapeHtml(pass.destination)}</p>
      </div>
      <div class="classroom-pass-current-time">
        <span>Left at ${escapeHtml(formatClassroomPassTime(pass.outAt))}</span>
        <strong data-pass-start="${escapeHtml(pass.outAt)}">${escapeHtml(classroomPassDuration(pass.outAt))}</strong>
      </div>
      <button class="primary-btn" data-action="teacherReturnClassroomPass" data-id="${escapeHtml(pass.id)}">Mark Returned</button>
    </article>
  `;
}

function renderClassroomPassTableRow(pass) {
  const active = pass.status === "out";
  return `
    <article class="classroom-pass-log-row ${active ? "is-active" : ""}">
      <span class="classroom-pass-student-cell"><strong>${escapeHtml(pass.studentName)}</strong><small>${escapeHtml(pass.studentEmail)}</small></span>
      <span data-label="Grade">${escapeHtml(pass.grade)}</span>
      <span data-label="Destination">${escapeHtml(pass.destination)}</span>
      <span data-label="Left">${escapeHtml(formatClassroomPassTime(pass.outAt))}</span>
      <span data-label="Returned">${active ? "—" : escapeHtml(formatClassroomPassTime(pass.returnedAt))}</span>
      <span data-label="Duration" data-pass-start="${escapeHtml(pass.outAt)}" ${active ? "" : `data-pass-end="${escapeHtml(pass.returnedAt)}"`}>${escapeHtml(classroomPassDuration(pass.outAt, active ? Date.now() : pass.returnedAt))}</span>
      <span data-label="Status"><b class="classroom-pass-status is-${escapeHtml(pass.status)}">${escapeHtml(classroomPassStatusLabel(pass))}</b></span>
      <span class="classroom-pass-row-actions">
        ${active ? `<button class="outline-btn" data-action="teacherReturnClassroomPass" data-id="${escapeHtml(pass.id)}">Return</button>` : ""}
        <button class="danger-btn" data-action="deleteClassroomPass" data-id="${escapeHtml(pass.id)}">Delete</button>
      </span>
    </article>
  `;
}

function renderDashboardClassroomPasses() {
  const passes = classroomPassData.passes;
  const active = passes.filter(pass => pass.status === "out");
  const todayKey = classroomPassDateKey(new Date());
  const today = passes.filter(pass => classroomPassDateKey(pass.outAt) === todayKey);
  const completedToday = today.filter(pass => pass.returnedAt);
  const averageSeconds = completedToday.length
    ? completedToday.reduce((total, pass) => total + Math.max(0, (Date.parse(pass.returnedAt) - Date.parse(pass.outAt)) / 1000), 0) / completedToday.length
    : 0;
  const query = classroomPassSearch.trim().toLowerCase();
  const filtered = passes
    .filter(pass => !classroomPassDateFilter || classroomPassDateKey(pass.outAt) === classroomPassDateFilter)
    .filter(pass => classroomPassGradeFilter === "all" || pass.grade === classroomPassGradeFilter)
    .filter(pass => classroomPassDestinationFilter === "all" || pass.destination === classroomPassDestinationFilter)
    .filter(pass => classroomPassStatusFilter === "all" || pass.status === classroomPassStatusFilter)
    .filter(pass => !query || `${pass.studentName} ${pass.studentEmail}`.toLowerCase().includes(query));
  return `
    <section class="classroom-pass-dashboard">
      <section class="classroom-pass-settings-card">
        <div>
          <span class="feature-kicker">Teacher Controls</span>
          <h3>Pass Availability</h3>
          <p class="instruction">Students must still receive your permission before using the pass.</p>
        </div>
        <label class="toggle-row classroom-pass-enabled-toggle">
          <span>${classroomPassData.config.enabled ? "Available to students" : "Passes are paused"}</span>
          <span class="switch"><input id="classroomPassEnabled" type="checkbox" ${classroomPassData.config.enabled ? "checked" : ""}><span class="slider"></span></span>
        </label>
        <label class="field classroom-pass-capacity"><span>Students allowed out at once</span><select id="classroomPassCapacity">${[1, 2, 3, 4].map(value => `<option value="${value}" ${classroomPassData.config.maxActive === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
      </section>

      <section class="classroom-pass-current-section">
        <div class="assignment-manager-heading"><div><span class="feature-kicker">Live Status</span><h3>Currently Out</h3></div><span class="dashboard-count">${active.length}</span></div>
        <div class="classroom-pass-current-list">
          ${active.length ? active.map(renderClassroomPassActiveCard).join("") : `<div class="classroom-pass-all-present"><span aria-hidden="true">✓</span><strong>Everyone is currently in the classroom.</strong></div>`}
        </div>
      </section>

      <section class="classroom-pass-today-section">
        <div class="assignment-manager-heading"><div><span class="feature-kicker">Today at a Glance</span><h3>Simple Daily Summary</h3></div><a class="outline-btn" href="/api/classroom-pass/export">Download CSV</a></div>
        <div class="classroom-pass-metric-grid">
          <div><span>Currently Out</span><strong>${active.length}</strong></div>
          <div><span>Total Passes Today</span><strong>${today.length}</strong></div>
          <div><span>Average Time Out</span><strong>${completedToday.length ? `${Math.max(1, Math.round(averageSeconds / 60))} min` : "—"}</strong></div>
          <div><span>Unreturned Passes</span><strong>${active.length}</strong></div>
        </div>
      </section>

      <section class="classroom-pass-history-section">
        <div class="assignment-manager-heading"><div><span class="feature-kicker">Pass History</span><h3>Student Pass Activity</h3></div><span class="dashboard-count">${filtered.length}</span></div>
        <div class="classroom-pass-filters">
          <label class="dashboard-search"><span class="sr-only">Search students</span><input id="classroomPassSearch" type="search" value="${escapeHtml(classroomPassSearch)}" placeholder="Search student name…"></label>
          <label><span class="sr-only">Choose date</span><input id="classroomPassDate" type="date" value="${escapeHtml(classroomPassDateFilter)}"></label>
          <label><span class="sr-only">Filter grade</span><select id="classroomPassGrade"><option value="all">All grades</option>${["4", "5", "6", "7"].map(grade => `<option value="${grade}" ${classroomPassGradeFilter === grade ? "selected" : ""}>Grade ${grade}</option>`).join("")}</select></label>
          <label><span class="sr-only">Filter destination</span><select id="classroomPassDestinationFilter"><option value="all">All destinations</option>${classroomPassData.destinations.map(destination => `<option value="${escapeHtml(destination)}" ${classroomPassDestinationFilter === destination ? "selected" : ""}>${escapeHtml(destination)}</option>`).join("")}</select></label>
          <label><span class="sr-only">Filter status</span><select id="classroomPassStatus"><option value="all">All statuses</option><option value="out" ${classroomPassStatusFilter === "out" ? "selected" : ""}>Currently Out</option><option value="returned" ${classroomPassStatusFilter === "returned" ? "selected" : ""}>Returned</option><option value="corrected" ${classroomPassStatusFilter === "corrected" ? "selected" : ""}>Teacher Corrected</option></select></label>
        </div>
        <div class="classroom-pass-log-table" aria-live="polite">
          <div class="classroom-pass-log-header" aria-hidden="true"><span>Student</span><span>Grade</span><span>Destination</span><span>Left</span><span>Returned</span><span>Duration</span><span>Status</span><span>Actions</span></div>
          ${filtered.length ? filtered.map(renderClassroomPassTableRow).join("") : emptyCard("No Classroom Pass records match these filters.")}
        </div>
      </section>
      ${classroomPassMessage ? `<p class="classroom-pass-message" role="status">${escapeHtml(classroomPassMessage)}</p>` : ""}
    </section>
  `;
}

function renderDashboardSection() {
  if (dashboardSection === "assignments") return renderDashboardAssignments();
  if (dashboardSection === "gradebooks") return renderDashboardGradebooks();
  if (dashboardSection === "passes") return renderDashboardClassroomPasses();
  if (dashboardSection === "students") return renderApprovedStudentManager();
  if (dashboardSection === "tools") return renderDashboardClassroomTools();
  if (dashboardSection === "corner") return renderDashboardColtCorner();
  if (dashboardSection === "requests") return renderDashboardRequests();
  if (dashboardSection === "websites") return renderDashboardWebsites();
  if (dashboardSection === "settings") return renderDashboardSettings();
  return renderDashboardOverview();
}

function renderDashboard() {
  const current = dashboardSectionDetails();
  return `
    ${pageHeader("Teacher Dashboard", "", true)}
    <div class="teacher-dashboard-shell">
      ${renderDashboardNavigation()}
      <main class="dashboard-workspace" id="dashboardWorkspace">
        <header class="dashboard-workspace-header">
          <div>
            <span class="feature-kicker">Teacher Dashboard</span>
            <h2>${escapeHtml(current.label)}</h2>
          </div>
          ${dashboardSection !== "overview" ? `<button class="outline-btn dashboard-overview-button" data-action="dashboardSection" data-section="overview">Back to Overview</button>` : ""}
        </header>
        ${renderDashboardSection()}
      </main>
    </div>
  `;
}

function renderWebsiteRequest(request) {
  const submitted = formatShortDate(request.createdAt);
  return `
    <article class="request-card">
      <div>
        <span class="feature-kicker">${escapeHtml(request.feedbackType || "Website suggestion")}</span>
        <h3>${escapeHtml(request.websiteName)}</h3>
        <p class="meta">${escapeHtml(request.studentName)} • Grade ${escapeHtml(request.grade)}</p>
        ${submitted ? `<p class="url-text">Submitted ${escapeHtml(submitted)}</p>` : ""}
      </div>
      <div class="actions">
        <button class="danger-btn" data-action="deleteRequest" data-id="${request.id}">Delete</button>
      </div>
    </article>
  `;
}

function renderTeacherThread(thread) {
  const submitted = formatShortDate(thread.createdAt);
  const muted = isStudentMuted(thread.studentName);
  const replies = getThreadReplies(thread);
  return `
    <article class="teacher-card thread-teacher-card">
      <h3>${escapeHtml(thread.title)}</h3>
      <p class="meta">Started by ${escapeHtml(thread.studentName)} • ${escapeHtml(forumRoleLabel(thread.grade))}${submitted ? ` • ${escapeHtml(submitted)}` : ""}${muted ? " • Muted" : ""}</p>
      <p class="instruction">${escapeHtml(thread.body)}</p>
      ${replies.length ? `<div class="teacher-replies">${replies.map(reply => renderTeacherReply(thread, reply)).join("")}</div>` : ""}
      <div class="actions">
        <button class="outline-btn" data-action="muteStudent" data-student="${escapeHtml(thread.studentName)}" ${muted ? "disabled" : ""}>${muted ? "Muted" : "Mute Student"}</button>
        <button class="danger-btn" data-action="deleteThread" data-id="${thread.id}">Delete Topic</button>
      </div>
    </article>
  `;
}

function renderTeacherReply(thread, reply) {
  const submitted = formatShortDate(reply.createdAt);
  const muted = isStudentMuted(reply.studentName);
  return `
    <article class="teacher-reply">
      <p>${escapeHtml(reply.message)}</p>
      <p class="meta">${escapeHtml(reply.studentName)} • ${escapeHtml(forumRoleLabel(reply.grade))}${submitted ? ` • ${escapeHtml(submitted)}` : ""}${muted ? " • Muted" : ""}</p>
      <div class="actions">
        <button class="outline-btn" data-action="muteStudent" data-student="${escapeHtml(reply.studentName)}" ${muted ? "disabled" : ""}>${muted ? "Muted" : "Mute Student"}</button>
        <button class="danger-btn" data-action="deleteReply" data-thread-id="${thread.id}" data-reply-id="${reply.id}">Delete Reply</button>
      </div>
    </article>
  `;
}

function renderMutedStudent(student) {
  const submitted = formatShortDate(student.createdAt);
  return `
    <article class="teacher-card muted-student-card">
      <h3>${escapeHtml(student.name)}</h3>
      ${submitted ? `<p class="meta">Muted ${escapeHtml(submitted)}</p>` : ""}
      <div class="actions">
        <button class="outline-btn" data-action="unmuteStudent" data-id="${student.id}">Unmute</button>
      </div>
    </article>
  `;
}

function renderTeacherLink(link) {
  return `
    <article class="teacher-card">
      <h3>${escapeHtml(link.title)}</h3>
      <p class="meta">${escapeHtml(link.category)}</p>
      <p class="instruction">${escapeHtml(link.instruction)}</p>
      <p class="url-text">${escapeHtml(link.url)}</p>
      <label class="toggle-row">
        <span>Active</span>
        <span class="switch"><input type="checkbox" data-action="toggleActive" data-id="${link.id}" ${link.active ? "checked" : ""}><span class="slider"></span></span>
      </label>
      <div class="actions">
        <button class="primary-btn" data-action="edit" data-id="${link.id}">✎ Edit</button>
        <button class="danger-btn" data-action="delete" data-id="${link.id}">Delete</button>
      </div>
    </article>
  `;
}

function renderEdit(id = null) {
  const existing = links.find(link => link.id === id) || null;
  const title = existing ? "Edit Website" : "Add Website";
  const link = existing || { title: "", instruction: "", url: "", category: categories[0], active: true, todayChoice: false };
  return `
    ${pageHeader(title, "", true)}
    <section class="form-card">
      <form id="websiteForm" class="form-grid" data-id="${existing ? existing.id : ""}">
        <div class="field">
          <label for="siteTitle">Website title</label>
          <input id="siteTitle" value="${escapeHtml(link.title)}" autocomplete="off">
        </div>
        <div class="field">
          <label for="siteInstruction">Teacher instruction</label>
          <textarea id="siteInstruction">${escapeHtml(link.instruction)}</textarea>
        </div>
        <div class="field">
          <label for="siteUrl">Website URL</label>
          <input id="siteUrl" value="${escapeHtml(link.url)}" autocomplete="off" inputmode="url">
        </div>
        <div class="field">
          <label for="siteCategory">Category</label>
          <select id="siteCategory">
            ${categories.map(category => `<option value="${escapeHtml(category)}" ${category === link.category ? "selected" : ""}>${escapeHtml(category)}</option>`).join("")}
          </select>
        </div>
        <label class="toggle-row">
          <span>Active</span>
          <span class="switch"><input id="siteActive" type="checkbox" ${link.active ? "checked" : ""}><span class="slider"></span></span>
        </label>
        <p id="formError" class="error"></p>
        <button class="primary-btn" type="submit">Save Website</button>
      </form>
    </section>
  `;
}

function renderChangePin() {
  return `
    ${pageHeader("Change Teacher PIN", "", true)}
    <section class="form-card">
      <form id="changePinForm" class="form-grid">
        <div class="field">
          <label for="newPin">New PIN</label>
          <input id="newPin" type="password" inputmode="numeric" maxlength="12" autocomplete="new-password">
        </div>
        <div class="field">
          <label for="confirmPin">Confirm PIN</label>
          <input id="confirmPin" type="password" inputmode="numeric" maxlength="12" autocomplete="new-password">
        </div>
        <p id="pinChangeError" class="error"></p>
        <button class="primary-btn" type="submit">Save PIN</button>
      </form>
    </section>
  `;
}

function renderModal() {
  if (!modal) return "";
  return `
    <div class="modal-backdrop" role="dialog" aria-modal="true">
      <section class="modal">
        <h2>${escapeHtml(modal.title)}</h2>
        <p>${escapeHtml(modal.message)}</p>
        <div class="actions">
          <button class="primary-btn" data-action="confirmModal">${escapeHtml(modal.confirmText || "Confirm")}</button>
          <button class="outline-btn" data-action="closeModal">Cancel</button>
        </div>
      </section>
    </div>
  `;
}

function render() {
  stopColtRunGame();
  if (homeNavigationObserver) homeNavigationObserver.disconnect();
  if (screen.name !== "home") {
    homeNavigationMobileOpen = false;
    document.body.classList.remove("home-navigation-open");
  }
  document.body.dataset.theme = theme;
  document.body.dataset.screen = screen.name;
  let html = "";
  if (screen.name === "home") html = renderHome();
  if (screen.name === "category") html = renderCategory(screen.category);
  if (screen.name === "coltRun") html = renderColtRun();
  if (screen.name === "coltCorner") html = renderColtCornerPage();
  if (screen.name === "thread") html = renderThreadDetail(screen.id);
  if (screen.name === "pin") html = renderPin();
  if (screen.name === "login") html = renderLogin();
  if (screen.name === "account") html = renderAccount();
  if (screen.name === "assignments") html = renderAssignmentsPage();
  if (screen.name === "classroomPass") html = renderClassroomPassPage();
  if (screen.name === "dashboard") html = renderDashboard();
  if (screen.name === "edit") html = renderEdit(screen.id);
  if (screen.name === "changePin") html = renderChangePin();
  app.innerHTML = html + renderClassTimerBadge() + renderModal();
  attachScreenHandlers();
  startClassroomPassTimers();
  observeDeferredVideos(app);
  window.dispatchEvent(new CustomEvent("classroom-launchpad-rendered", {
    detail: { screen: screen.name }
  }));
}

function updateHomeNavigationActive(targetId) {
  if (!HOME_NAVIGATION_ITEMS.some(item => item.id === targetId)) return;
  homeNavigationActive = targetId;
  document.querySelectorAll(".home-navigation-button[data-target]").forEach(button => {
    const active = button.dataset.target === targetId && !button.classList.contains("home-navigation-top");
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "location");
    else button.removeAttribute("aria-current");
  });
}

function setHomeNavigationMobileOpen(open) {
  homeNavigationMobileOpen = Boolean(open);
  document.querySelector(".home-layout")?.classList.toggle("is-mobile-nav-open", homeNavigationMobileOpen);
  document.querySelector(".home-nav-mobile-trigger")?.setAttribute("aria-expanded", String(homeNavigationMobileOpen));
  if (homeNavigationMobileOpen) document.querySelector(".home-navigation-button.is-active")?.focus({ preventScroll: true });
  else if (document.querySelector(".home-quick-navigation")?.contains(document.activeElement)) {
    document.querySelector(".home-nav-mobile-trigger")?.focus({ preventScroll: true });
  }
  syncHomeNavigationAccessibility();
}

function syncHomeNavigationAccessibility() {
  const navigation = document.querySelector(".home-quick-navigation");
  if (!navigation) return;
  const hiddenMobileDrawer = window.matchMedia("(max-width: 1329px)").matches && !homeNavigationMobileOpen;
  navigation.inert = hiddenMobileDrawer;
  if (hiddenMobileDrawer) navigation.setAttribute("aria-hidden", "true");
  else navigation.removeAttribute("aria-hidden");
  document.body.classList.toggle("home-navigation-open", !hiddenMobileDrawer && window.matchMedia("(max-width: 1329px)").matches);
}

function applyHomeNavigationCollapsedState() {
  const layout = document.querySelector(".home-layout");
  const collapseButton = document.querySelector(".home-nav-collapse");
  layout?.classList.toggle("is-nav-collapsed", homeNavigationCollapsed);
  if (collapseButton) {
    collapseButton.setAttribute("aria-label", homeNavigationCollapsed ? "Expand quick navigation" : "Collapse quick navigation");
    collapseButton.setAttribute("aria-expanded", String(!homeNavigationCollapsed));
    collapseButton.querySelector("span").innerHTML = homeNavigationCollapsed ? "&#8250;&#8250;" : "&#8249;&#8249;";
  }
}

function attachHomeNavigation() {
  if (homeNavigationObserver) homeNavigationObserver.disconnect();
  if (screen.name !== "home") return;
  const sections = HOME_NAVIGATION_ITEMS.map(item => document.getElementById(item.id)).filter(Boolean);
  if (!sections.length) return;
  syncHomeNavigationAccessibility();
  const current = sections.filter(section => section.getBoundingClientRect().top <= window.innerHeight * 0.3).at(-1) || sections[0];
  updateHomeNavigationActive(current.id);
  if (!("IntersectionObserver" in window)) return;
  homeNavigationObserver = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
    if (visible[0]) updateHomeNavigationActive(visible[0].target.id);
  }, { rootMargin: "-18% 0px -66% 0px", threshold: [0.01, 0.2, 0.5] });
  sections.forEach(section => homeNavigationObserver.observe(section));
}

async function loadApprovedStudents() {
  if (!sharedBackend.enabled || !isTeacher()) return;
  try {
    const result = await sharedBackend.loadApprovedStudents();
    approvedStudents = Array.isArray(result.students) ? result.students : [];
  } catch (error) {
    authMessage = error.message;
  }
}

async function loadClassroomPassData(shouldRender = false) {
  if (!sharedBackend.enabled || !isSignedIn()) return;
  const before = JSON.stringify(classroomPassData);
  try {
    classroomPassData = normalizeClassroomPassPayload(await sharedBackend.loadClassroomPass());
    if (shouldRender && before !== JSON.stringify(classroomPassData)) {
      const active = document.activeElement;
      if (!active || !active.closest(".classroom-pass-filters")) render();
    }
  } catch (error) {
    classroomPassMessage = error.message;
  }
}

function updateClassroomPassClocks() {
  document.querySelectorAll("[data-pass-start]").forEach(element => {
    const end = element.dataset.passEnd || Date.now();
    element.textContent = classroomPassDuration(element.dataset.passStart, end);
  });
}

function startClassroomPassTimers() {
  if (classroomPassClock) window.clearInterval(classroomPassClock);
  if (classroomPassRefreshTimer) window.clearInterval(classroomPassRefreshTimer);
  classroomPassClock = 0;
  classroomPassRefreshTimer = 0;
  const relevant = screen.name === "classroomPass" || (screen.name === "dashboard" && dashboardSection === "passes");
  if (!relevant) return;
  updateClassroomPassClocks();
  classroomPassClock = window.setInterval(updateClassroomPassClocks, 1000);
  classroomPassRefreshTimer = window.setInterval(() => loadClassroomPassData(true), 5000);
}

function attachScreenHandlers() {
  attachHomeNavigation();
  const passSearch = document.getElementById("classroomPassSearch");
  if (passSearch) {
    passSearch.addEventListener("input", event => {
      classroomPassSearch = event.target.value;
      render();
      const next = document.getElementById("classroomPassSearch");
      if (next) {
        next.focus();
        next.setSelectionRange(classroomPassSearch.length, classroomPassSearch.length);
      }
    });
  }
  [
    ["classroomPassDate", value => classroomPassDateFilter = value],
    ["classroomPassGrade", value => classroomPassGradeFilter = value],
    ["classroomPassDestinationFilter", value => classroomPassDestinationFilter = value],
    ["classroomPassStatus", value => classroomPassStatusFilter = value]
  ].forEach(([id, update]) => {
    const control = document.getElementById(id);
    if (control) control.addEventListener("change", event => { update(event.target.value); render(); });
  });
  const passEnabled = document.getElementById("classroomPassEnabled");
  if (passEnabled) passEnabled.addEventListener("change", async event => {
    try {
      classroomPassData = normalizeClassroomPassPayload(await sharedBackend.updateClassroomPassConfig({
        enabled: event.target.checked,
        maxActive: classroomPassData.config.maxActive
      }));
      classroomPassMessage = event.target.checked ? "Classroom Pass is available to students." : "Classroom Pass is paused.";
    } catch (error) {
      classroomPassMessage = error.message;
    }
    render();
  });
  const passCapacity = document.getElementById("classroomPassCapacity");
  if (passCapacity) passCapacity.addEventListener("change", async event => {
    try {
      classroomPassData = normalizeClassroomPassPayload(await sharedBackend.updateClassroomPassConfig({
        enabled: classroomPassData.config.enabled,
        maxActive: Number(event.target.value)
      }));
      classroomPassMessage = `Up to ${classroomPassData.config.maxActive} ${classroomPassData.config.maxActive === 1 ? "student" : "students"} may be out at once.`;
    } catch (error) {
      classroomPassMessage = error.message;
    }
    render();
  });
  const studentManagerSearch = document.getElementById("dashboardStudentSearch");
  if (studentManagerSearch) {
    studentManagerSearch.addEventListener("input", event => {
      dashboardStudentSearch = event.target.value;
      render();
      const nextSearch = document.getElementById("dashboardStudentSearch");
      if (nextSearch) {
        nextSearch.focus();
        nextSearch.setSelectionRange(dashboardStudentSearch.length, dashboardStudentSearch.length);
      }
    });
  }
  const dashboardSearch = document.getElementById("dashboardLinkSearch");
  if (dashboardSearch) {
    dashboardSearch.addEventListener("input", event => {
      dashboardLinkSearch = event.target.value;
      dashboardLinkPage = 1;
      render();
      const nextSearch = document.getElementById("dashboardLinkSearch");
      if (nextSearch) {
        nextSearch.focus();
        nextSearch.setSelectionRange(dashboardLinkSearch.length, dashboardLinkSearch.length);
      }
    });
  }
  const dashboardCategory = document.getElementById("dashboardLinkCategory");
  if (dashboardCategory) {
    dashboardCategory.addEventListener("change", event => {
      dashboardLinkCategory = event.target.value;
      dashboardLinkPage = 1;
      render();
    });
  }
  const dashboardStatus = document.getElementById("dashboardLinkStatus");
  if (dashboardStatus) {
    dashboardStatus.addEventListener("change", event => {
      dashboardLinkStatus = event.target.value;
      dashboardLinkPage = 1;
      render();
    });
  }
  const submissionSearch = document.getElementById("dashboardSubmissionSearch");
  if (submissionSearch) {
    submissionSearch.addEventListener("input", event => {
      dashboardSubmissionSearch = event.target.value;
      render();
      const next = document.getElementById("dashboardSubmissionSearch");
      if (next) {
        next.focus();
        next.setSelectionRange(dashboardSubmissionSearch.length, dashboardSubmissionSearch.length);
      }
    });
  }
  [["dashboardAssignmentFilter", value => dashboardAssignmentFilter = value], ["dashboardGradeFilter", value => dashboardGradeFilter = value], ["dashboardSubmissionStatus", value => dashboardSubmissionStatus = value]].forEach(([id, setValue]) => {
    const control = document.getElementById(id);
    if (control) control.addEventListener("change", event => { setValue(event.target.value); selectedSubmissionId = ""; render(); });
  });
  const gradebookSearch = document.getElementById("dashboardGradebookSearch");
  if (gradebookSearch) {
    gradebookSearch.addEventListener("input", event => {
      dashboardGradebookSearch = event.target.value;
      render();
      const next = document.getElementById("dashboardGradebookSearch");
      if (next) {
        next.focus();
        next.setSelectionRange(dashboardGradebookSearch.length, dashboardGradebookSearch.length);
      }
    });
  }
  const gradebookAssignment = document.getElementById("dashboardGradebookAssignment");
  if (gradebookAssignment) {
    gradebookAssignment.addEventListener("change", event => {
      dashboardGradebookAssignment = event.target.value;
      render();
    });
  }
  const search = document.getElementById("studentSearch");
  if (search) {
    search.addEventListener("input", event => {
      const body = document.getElementById("homeBody");
      body.innerHTML = event.target.value.trim() ? renderSearchResults(event.target.value) : renderHomeDefault();
      observeDeferredVideos(body);
      attachStudentRequestForm();
      attachThreadForm();
      attachReplyForm();
      startCalendarClock();
      startClassTimerClock();
      attachHomeNavigation();
    });
  }

  attachStudentRequestForm();
  attachThreadForm();
  attachReplyForm();
  hydrateOfficeSubmissionPreviews();
  startCalendarClock();
  startClassTimerClock();
  if (screen.name === "coltRun") startColtRunGame();
  const studentLoginForm = document.getElementById("studentLoginForm");
  if (studentLoginForm) {
    studentLoginForm.addEventListener("submit", async event => {
      event.preventDefault();
      const status = document.getElementById("authStatus");
      try {
        const result = await sharedBackend.loginStudent(
          document.getElementById("studentLoginEmail").value,
          document.getElementById("studentLoginPassword").value
        );
        authSession = result.session;
        authMessage = "";
        await loadSharedState(false);
        setScreen({ name: "home" });
      } catch (error) {
        status.textContent = error.message;
        status.classList.add("error");
      }
    });
  }

  const studentRegisterForm = document.getElementById("studentRegisterForm");
  if (studentRegisterForm) {
    studentRegisterForm.addEventListener("submit", async event => {
      event.preventDefault();
      const status = document.getElementById("authStatus");
      const password = document.getElementById("studentRegisterPassword").value;
      const confirmation = document.getElementById("studentRegisterPasswordConfirm").value;
      if (password !== confirmation) {
        status.textContent = "The password entries do not match.";
        status.classList.add("error");
        return;
      }
      try {
        const result = await sharedBackend.registerStudent({
          email: document.getElementById("studentRegisterEmail").value,
          activationCode: document.getElementById("studentActivationCode").value,
          name: document.getElementById("studentRegisterName").value,
          grade: document.getElementById("studentRegisterGrade").value,
          password
        });
        authSession = result.session;
        authMessage = "";
        await loadSharedState(false);
        setScreen({ name: "home" });
      } catch (error) {
        status.textContent = error.message;
        status.classList.add("error");
      }
    });
  }

  const pinForm = document.getElementById("pinForm");
  if (pinForm) {
    pinForm.addEventListener("submit", async event => {
      event.preventDefault();
      const input = document.getElementById("pinInput");
      const error = document.getElementById("pinError");
      try {
        const result = await sharedBackend.teacherLogin(input.value);
        authSession = result.session;
        await loadSharedState(false);
        await loadApprovedStudents();
        openTeacherDashboard();
      } catch (loginError) {
        error.textContent = loginError.message;
      }
    });
  }

  const approvedStudentImportForm = document.getElementById("approvedStudentImportForm");
  if (approvedStudentImportForm) {
    approvedStudentImportForm.addEventListener("submit", async event => {
      event.preventDefault();
      const status = document.getElementById("approvedStudentStatus");
      const emails = document.getElementById("approvedStudentEmails").value;
      try {
        const result = await sharedBackend.importApprovedStudents(emails);
        approvedStudents = result.students || [];
        activationCodeResults = result.activationCodes || [];
        status.textContent = `${result.added} added. ${result.total} students are now approved.`;
        status.classList.remove("error");
        document.getElementById("approvedStudentEmails").value = "";
        window.setTimeout(() => render(), 700);
      } catch (error) {
        status.textContent = error.message;
        status.classList.add("error");
      }
    });
  }

  const approvedStudentRosterFile = document.getElementById("approvedStudentRosterFile");
  if (approvedStudentRosterFile) {
    approvedStudentRosterFile.addEventListener("change", async event => {
      const status = document.getElementById("approvedStudentStatus");
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      try {
        const students = parseStudentRosterCsv(await file.text());
        const result = await sharedBackend.importApprovedStudents(students);
        approvedStudents = result.students || [];
        activationCodeResults = result.activationCodes || [];
        status.textContent = `${result.updated || 0} names updated. ${result.added || 0} new students added.`;
        status.classList.remove("error");
        window.setTimeout(() => render(), 900);
      } catch (error) {
        status.textContent = error.message;
        status.classList.add("error");
      } finally {
        event.target.value = "";
      }
    });
  }

  const websiteForm = document.getElementById("websiteForm");
  if (websiteForm) {
    websiteForm.addEventListener("submit", event => {
      event.preventDefault();
      const id = websiteForm.dataset.id;
      const next = {
        id: id || makeId(),
        title: document.getElementById("siteTitle").value.trim(),
        instruction: document.getElementById("siteInstruction").value.trim(),
        url: document.getElementById("siteUrl").value.trim(),
        category: document.getElementById("siteCategory").value,
        active: document.getElementById("siteActive").checked,
        todayChoice: false
      };
      const error = validateWebsite(next);
      document.getElementById("formError").textContent = error || "";
      if (error) return;
      saveLinks(id ? links.map(link => link.id === id ? next : link) : [...links, next]);
      setScreen({ name: "dashboard" });
    });
  }

  const dailyLaunchForm = document.getElementById("dailyLaunchForm");
  if (dailyLaunchForm) {
    const editor = document.getElementById("dailyLaunchMessage");
    let savedEditorRange = null;
    const rememberSelection = () => {
      savedEditorRange = saveEditorSelection(editor) || savedEditorRange;
    };
    ["keyup", "mouseup", "input", "focus"].forEach(eventName => editor.addEventListener(eventName, rememberSelection));
    document.addEventListener("selectionchange", () => {
      if (document.activeElement === editor) rememberSelection();
    });
    dailyLaunchForm.querySelectorAll("[data-editor-command]").forEach(button => {
      button.addEventListener("mousedown", event => event.preventDefault());
      button.addEventListener("click", () => {
        restoreEditorSelection(editor, savedEditorRange);
        runEditorCommand(button.dataset.editorCommand);
        rememberSelection();
      });
    });
    dailyLaunchForm.querySelectorAll("[data-editor-select]").forEach(select => {
      select.addEventListener("mousedown", rememberSelection);
      select.addEventListener("change", () => {
        restoreEditorSelection(editor, savedEditorRange);
        runEditorCommand(select.dataset.editorSelect, select.value);
        rememberSelection();
      });
    });
    dailyLaunchForm.querySelectorAll("[data-editor-palette]").forEach(button => {
      button.addEventListener("mousedown", event => {
        event.preventDefault();
        rememberSelection();
      });
      button.addEventListener("click", () => {
        const palette = button.dataset.editorPalette;
        const popover = dailyLaunchForm.querySelector(`[data-editor-popover="${palette}"]`);
        dailyLaunchForm.querySelectorAll("[data-editor-popover]").forEach(item => {
          if (item !== popover) item.classList.remove("is-open");
        });
        popover.classList.toggle("is-open");
      });
    });
    dailyLaunchForm.querySelectorAll("[data-editor-swatch]").forEach(button => {
      button.addEventListener("mousedown", event => {
        event.preventDefault();
        rememberSelection();
      });
      button.addEventListener("click", () => {
        savedEditorRange = applyEditorInlineStyle(editor, savedEditorRange, {
          [button.dataset.editorSwatch]: button.dataset.color
        });
        dailyLaunchForm.querySelectorAll("[data-editor-popover]").forEach(item => item.classList.remove("is-open"));
      });
    });
    dailyLaunchForm.addEventListener("submit", event => {
      event.preventDefault();
      const message = sanitizeLaunchHtml(editor.innerHTML);
      const status = document.getElementById("dailyLaunchStatus");
      if (!getLaunchPlainText(message)) {
        status.textContent = "Please type a launch message.";
        status.classList.add("error");
        return;
      }
      editor.innerHTML = message;
      saveDailyLaunch({ message, updatedAt: new Date().toISOString() }, false);
      status.textContent = "Today's Launch saved.";
      status.classList.remove("error");
    });
  }

  const classTimerForm = document.getElementById("classTimerForm");
  if (classTimerForm) {
    classTimerForm.addEventListener("submit", event => {
      event.preventDefault();
      const title = document.getElementById("classTimerTitle").value;
      const minutes = Math.max(1, Math.min(120, Number(document.getElementById("classTimerMinutes").value) || 10));
      const durationSeconds = minutes * 60;
      saveClassTimer({
        title,
        status: "running",
        durationSeconds,
        remainingSeconds: durationSeconds,
        endAt: new Date(Date.now() + durationSeconds * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
  }

  const changePinForm = document.getElementById("changePinForm");
  if (changePinForm) {
    changePinForm.addEventListener("submit", async event => {
      event.preventDefault();
      const pin = document.getElementById("newPin").value.replace(/\D/g, "");
      const confirm = document.getElementById("confirmPin").value.replace(/\D/g, "");
      const error = document.getElementById("pinChangeError");
      if (pin.length < 6) error.textContent = "Use at least six digits.";
      else if (pin !== confirm) error.textContent = "The PIN entries do not match.";
      else {
        try {
          await sharedBackend.changeTeacherPin(pin);
          setScreen({ name: "dashboard" });
        } catch (saveError) {
          error.textContent = saveError.message;
        }
      }
    });
  }

  const assignmentEditorForm = document.getElementById("assignmentEditorForm");
  if (assignmentEditorForm) {
    const assignmentAttachmentFile = document.getElementById("assignmentAttachmentFile");
    if (assignmentAttachmentFile) {
      assignmentAttachmentFile.addEventListener("change", () => {
        const file = assignmentAttachmentFile.files && assignmentAttachmentFile.files[0];
        const display = document.getElementById("selectedAssignmentAttachment");
        if (display) {
          display.textContent = file ? `${file.name} • ${formatFileSize(file.size)}` : "No replacement file selected.";
          display.classList.toggle("has-file", Boolean(file));
        }
        const remove = document.getElementById("assignmentRemoveAttachment");
        if (remove && file) remove.checked = false;
      });
    }
    assignmentEditorForm.addEventListener("submit", async event => {
      event.preventDefault();
      const status = document.getElementById("assignmentEditorMessage");
      const grades = [...assignmentEditorForm.querySelectorAll('input[name="assignmentGrade"]:checked')].map(input => input.value);
      const types = [...assignmentEditorForm.querySelectorAll('input[name="assignmentFileType"]:checked')].flatMap(input => input.value === ".jpg" ? [".jpg", ".jpeg"] : [input.value]);
      const dueDate = document.getElementById("assignmentDueDate").value;
      const dueTime = document.getElementById("assignmentDueTime").value;
      if ((dueDate && !dueTime) || (!dueDate && dueTime)) {
        status.textContent = "Choose both a due date and a due time, or leave both blank.";
        status.classList.add("error");
        return;
      }
      const assignment = {
        title: document.getElementById("assignmentTitle").value.trim(),
        instructions: document.getElementById("assignmentInstructions").value.trim(),
        grades,
        dueAt: dueDate && dueTime ? new Date(`${dueDate}T${dueTime}:00`).toISOString() : "",
        acceptedTypes: types,
        maxFileSizeMb: Number(document.getElementById("assignmentMaxSize").value),
        allowResubmissions: document.getElementById("assignmentResubmissions").checked,
        status: document.getElementById("assignmentStatus").value
      };
      if (!assignment.title) {
        status.textContent = "Please add an assignment title.";
        status.classList.add("error");
        return;
      }
      if (!assignment.grades.length) {
        status.textContent = "Choose at least one grade level.";
        status.classList.add("error");
        return;
      }
      if (!assignment.acceptedTypes.length) {
        status.textContent = "Choose at least one accepted file type.";
        status.classList.add("error");
        return;
      }
      const button = assignmentEditorForm.querySelector('button[type="submit"]');
      const attachmentFile = assignmentAttachmentFile && assignmentAttachmentFile.files && assignmentAttachmentFile.files[0];
      if (attachmentFile && attachmentFile.size > 20 * 1024 * 1024) {
        status.textContent = "Choose an assignment file that is 20 MB or smaller.";
        status.classList.add("error");
        return;
      }
      button.disabled = true;
      try {
        const id = assignmentEditorForm.dataset.id;
        let result = id ? await sharedBackend.updateAssignment(id, assignment) : await sharedBackend.createAssignment(assignment);
        const savedId = result.assignment && result.assignment.id;
        if (attachmentFile && savedId) {
          button.textContent = "Uploading Assignment File…";
          const savedAssignmentResult = result;
          try {
            result = await sharedBackend.uploadAssignmentAttachment(savedId, attachmentFile);
          } catch (uploadError) {
            assignments = normalizeAssignments(savedAssignmentResult.assignments);
            assignmentEditorId = savedId;
            assignmentEditorForm.dataset.id = savedId;
            status.textContent = `The assignment was saved, but the file was not attached: ${uploadError.message}`;
            status.classList.add("error");
            button.disabled = false;
            button.textContent = "Save Assignment";
            return;
          }
        } else if (savedId && document.getElementById("assignmentRemoveAttachment")?.checked) {
          result = await sharedBackend.removeAssignmentAttachment(savedId);
        }
        assignments = normalizeAssignments(result.assignments);
        submissions = normalizeSubmissions(result.submissions);
        replacingAssignmentId = "";
        assignmentEditorId = "";
        render();
      } catch (error) {
        status.textContent = error.message;
        status.classList.add("error");
        button.disabled = false;
      }
    });
  }

  const studentSubmissionFile = document.getElementById("studentSubmissionFile");
  if (studentSubmissionFile) {
    studentSubmissionFile.addEventListener("change", async () => {
      const file = studentSubmissionFile.files && studentSubmissionFile.files[0];
      const display = document.getElementById("selectedSubmissionFile");
      const preview = document.getElementById("studentPreSubmitPreview");
      display.textContent = file ? `${file.name} • ${formatFileSize(file.size)}` : "No file selected";
      display.classList.toggle("has-file", Boolean(file));
      if (studentPreviewObjectUrl) {
        URL.revokeObjectURL(studentPreviewObjectUrl);
        studentPreviewObjectUrl = "";
      }
      if (!preview || !file) {
        if (preview) preview.hidden = true;
        return;
      }
      preview.hidden = false;
      preview.innerHTML = `<div class="office-preview-message"><strong>Preparing preview…</strong><p>Your file has not been submitted.</p></div>`;
      const extension = `.${file.name.split(".").pop().toLowerCase()}`;
      try {
        if ([".png", ".jpg", ".jpeg", ".webp"].includes(extension)) {
          studentPreviewObjectUrl = URL.createObjectURL(file);
          preview.innerHTML = `<img class="submission-preview-image" src="${studentPreviewObjectUrl}" alt="Preview of ${escapeHtml(file.name)}">`;
        } else if (extension === ".pdf") {
          studentPreviewObjectUrl = URL.createObjectURL(file);
          preview.innerHTML = `<iframe class="submission-preview-frame" src="${studentPreviewObjectUrl}" title="Preview of ${escapeHtml(file.name)}"></iframe>`;
        } else if (extension === ".txt") {
          preview.innerHTML = `<pre class="text-file-preview">${escapeHtml((await file.text()).slice(0, 180000))}</pre>`;
        } else if (extension === ".docx") {
          await renderFaithfulDocxPreview(file, preview, file.name);
        } else if ([".doc", ".ppt", ".pptx"].includes(extension)) {
          const payload = await sharedBackend.previewSubmissionFile(file);
          if (studentSubmissionFile.files && studentSubmissionFile.files[0] === file) preview.innerHTML = renderOfficePreviewPayload(payload);
        } else {
          preview.innerHTML = `<div class="office-preview-message"><strong>${escapeHtml(file.name)}</strong><p>A preview is not available for this file type.</p></div>`;
        }
      } catch (error) {
        preview.innerHTML = `<div class="office-preview-message"><strong>Preview unavailable</strong><p>${escapeHtml(error.message)}</p></div>`;
      }
    });
  }
  const studentSubmissionForm = document.getElementById("studentSubmissionForm");
  if (studentSubmissionForm) {
    studentSubmissionForm.addEventListener("submit", async event => {
      event.preventDefault();
      const file = studentSubmissionFile && studentSubmissionFile.files && studentSubmissionFile.files[0];
      const message = document.getElementById("studentSubmissionMessage");
      if (!file) {
        message.textContent = "Please choose a file first.";
        message.classList.add("error");
        return;
      }
      const assignment = assignments.find(item => item.id === studentSubmissionForm.dataset.assignmentId);
      if (assignment && file.size > assignment.maxFileSizeMb * 1024 * 1024) {
        message.textContent = `Choose a file smaller than ${assignment.maxFileSizeMb} MB.`;
        message.classList.add("error");
        return;
      }
      const button = studentSubmissionForm.querySelector('button[type="submit"]');
      button.disabled = true;
      button.textContent = "Uploading…";
      message.textContent = "Uploading your work securely…";
      message.classList.remove("error");
      try {
        const result = await sharedBackend.submitAssignment(studentSubmissionForm.dataset.assignmentId, file, document.getElementById("studentSubmissionNote").value.trim());
        assignments = normalizeAssignments(result.assignments);
        submissions = normalizeSubmissions(result.submissions);
        replacingAssignmentId = "";
        assignmentView = "submitted";
        message.textContent = "Submitted to Mr. Nieves.";
        render();
      } catch (error) {
        message.textContent = error.message;
        message.classList.add("error");
        button.disabled = false;
        button.textContent = "Submit to Mr. Nieves";
      }
    });
  }

  const studentLinkSubmissionForm = document.getElementById("studentLinkSubmissionForm");
  if (studentLinkSubmissionForm) {
    studentLinkSubmissionForm.addEventListener("submit", async event => {
      event.preventDefault();
      const message = document.getElementById("studentLinkSubmissionMessage");
      const button = studentLinkSubmissionForm.querySelector('button[type="submit"]');
      button.disabled = true;
      button.textContent = "Submitting…";
      try {
        const result = await sharedBackend.submitAssignmentLink(studentLinkSubmissionForm.dataset.assignmentId, {
          projectTitle: document.getElementById("studentProjectTitle").value.trim(),
          projectUrl: document.getElementById("studentProjectUrl").value.trim(),
          note: document.getElementById("studentProjectNote").value.trim()
        });
        assignments = normalizeAssignments(result.assignments);
        submissions = normalizeSubmissions(result.submissions);
        replacingAssignmentId = "";
        assignmentView = "submitted";
        render();
      } catch (error) {
        message.textContent = error.message;
        message.classList.add("error");
        button.disabled = false;
        button.textContent = "Submit Link to Mr. Nieves";
      }
    });
  }

  const submissionReviewForm = document.getElementById("submissionReviewForm");
  if (submissionReviewForm) {
    submissionReviewForm.addEventListener("submit", async event => {
      event.preventDefault();
      const button = event.submitter;
      const status = document.getElementById("submissionReviewMessage");
      try {
        const result = await sharedBackend.reviewSubmission(submissionReviewForm.dataset.id, {
          status: button && button.value === "returned" ? "returned" : "reviewed",
          feedback: document.getElementById("submissionFeedback").value.trim()
        });
        assignments = normalizeAssignments(result.assignments);
        submissions = normalizeSubmissions(result.submissions);
        status.textContent = button && button.value === "returned" ? "Returned to the student." : "Marked as reviewed.";
        render();
      } catch (error) {
        status.textContent = error.message;
        status.classList.add("error");
      }
    });
  }
}

function startClassTimerClock() {
  if (classTimerClock) {
    clearInterval(classTimerClock);
    classTimerClock = null;
  }
  const display = document.getElementById("classTimerDisplay");
  if (!display) return;

  const update = () => {
    const remaining = getClassTimerRemaining(classTimer);
    const ended = classTimer.status === "ended" || remaining <= 0;
    display.textContent = ended ? "Time is up" : formatTimerSeconds(remaining);
    const badge = display.closest(".class-timer-badge");
    if (badge) badge.classList.toggle("is-ended", ended);
    if (classTimer.status === "running" && ended) {
      saveClassTimer({ ...classTimer, status: "ended", remainingSeconds: 0, endAt: "", updatedAt: new Date().toISOString() }, false);
      if (classTimerClock) {
        clearInterval(classTimerClock);
        classTimerClock = null;
      }
    }
  };

  update();
  if (classTimer.status === "running") classTimerClock = window.setInterval(update, 1000);
}

function startCalendarClock() {
  if (clockTimer) {
    clearInterval(clockTimer);
    clockTimer = null;
  }
  const day = document.getElementById("calendarDay");
  const date = document.getElementById("calendarDate");
  const time = document.getElementById("calendarTime");
  if (!day || !date || !time) return;

  const update = () => {
    const now = new Date();
    day.textContent = new Intl.DateTimeFormat([], { weekday: "long" }).format(now);
    date.textContent = new Intl.DateTimeFormat([], { month: "long", day: "numeric", year: "numeric" }).format(now);
    time.textContent = new Intl.DateTimeFormat([], { hour: "numeric", minute: "2-digit", second: "2-digit" }).format(now);
  };
  update();
  clockTimer = window.setInterval(update, 1000);
}

function attachStudentRequestForm() {
  const requestForm = document.getElementById("studentRequestForm");
  if (!requestForm || requestForm.dataset.ready === "true") return;
  requestForm.dataset.ready = "true";
  requestForm.addEventListener("submit", event => {
    event.preventDefault();
    const request = {
      id: makeId(),
      studentName: authSession.name,
      grade: document.getElementById("requestGrade").value.trim(),
      feedbackType: document.getElementById("requestFeedbackType").value,
      websiteName: document.getElementById("requestWebsiteName").value.trim(),
      createdAt: new Date().toISOString()
    };
    const message = document.getElementById("studentRequestMessage");
    const error = validateWebsiteRequest(request);
    if (error) {
      message.textContent = error;
      message.classList.add("error");
      return;
    }
    saveWebsiteRequests([request, ...websiteRequests], false);
    requestForm.reset();
    message.textContent = "Feedback sent to Teacher Dashboard.";
    message.classList.remove("error");
  });
}

function attachThreadForm() {
  const threadForm = document.getElementById("threadForm");
  if (!threadForm || threadForm.dataset.ready === "true") return;
  threadForm.dataset.ready = "true";
  threadForm.addEventListener("submit", async event => {
    event.preventDefault();
    const thread = {
      id: makeId(),
      studentName: authSession.name,
      grade: isTeacher() ? "Teacher" : authSession.grade,
      title: document.getElementById("threadTitle").value.trim(),
      body: document.getElementById("threadBody").value.trim(),
      createdAt: new Date().toISOString(),
      replies: []
    };
    const status = document.getElementById("threadStatus");
    const error = validateThreadTopic(thread);
    if (error) {
      status.textContent = error;
      status.classList.add("error");
      document.getElementById(!thread.title ? "threadTitle" : "threadBody").focus();
      return;
    }
    const button = threadForm.querySelector("button[type='submit']");
    button.disabled = true;
    button.textContent = "Checking...";
    status.textContent = "Colt Assistant is checking your message.";
    status.classList.remove("error", "pending", "success");
    try {
      const result = await sharedBackend.submitTopic(thread);
      classThreads = normalizeThreads(result && result.threads);
      pendingModeration = normalizePendingModeration(result && result.pendingModeration);
      status.textContent = result && result.message ? result.message : "Topic started.";
      status.classList.toggle("error", result && result.moderationStatus === "blocked");
      status.classList.toggle("pending", result && result.moderationStatus === "needs_review");
      status.classList.toggle("success", result && result.moderationStatus === "approved");
      if (result && result.moderationStatus !== "blocked") threadForm.reset();
      if (result && result.moderationStatus === "blocked") document.getElementById("threadBody").focus();
      const list = document.querySelector(".thread-list");
      if (list) list.outerHTML = renderThreadTable(sortedThreads());
    } catch (submissionError) {
      status.textContent = submissionError.message;
      status.classList.add("error");
      document.getElementById("threadBody").focus();
    } finally {
      button.disabled = false;
      button.textContent = "Start Topic";
    }
  });
}

function attachReplyForm() {
  const replyForm = document.getElementById("replyForm");
  if (!replyForm || replyForm.dataset.ready === "true") return;
  replyForm.dataset.ready = "true";
  replyForm.addEventListener("submit", async event => {
    event.preventDefault();
    const reply = {
      id: makeId(),
      studentName: authSession.name,
      grade: isTeacher() ? "Teacher" : authSession.grade,
      message: document.getElementById("replyMessage").value.trim(),
      createdAt: new Date().toISOString()
    };
    const status = document.getElementById("replyStatus");
    const error = validateThreadReply(reply);
    if (error) {
      status.textContent = error;
      status.classList.add("error");
      document.getElementById("replyMessage").focus();
      return;
    }
    const threadId = replyForm.dataset.threadId;
    const button = replyForm.querySelector("button[type='submit']");
    button.disabled = true;
    button.textContent = "Checking...";
    status.textContent = "Colt Assistant is checking your reply.";
    status.classList.remove("error", "pending", "success");
    try {
      const result = await sharedBackend.submitReply(threadId, reply);
      classThreads = normalizeThreads(result && result.threads);
      pendingModeration = normalizePendingModeration(result && result.pendingModeration);
      status.textContent = result && result.message ? result.message : "Reply posted.";
      status.classList.toggle("error", result && result.moderationStatus === "blocked");
      status.classList.toggle("pending", result && result.moderationStatus === "needs_review");
      status.classList.toggle("success", result && result.moderationStatus === "approved");
      if (result && result.moderationStatus !== "blocked") replyForm.reset();
      if (result && result.moderationStatus === "blocked") document.getElementById("replyMessage").focus();
      const updated = classThreads.find(thread => thread.id === threadId);
      const list = document.querySelector(".thread-reply-list");
      if (updated && list) {
        const replies = getThreadReplies(updated);
        list.innerHTML = `
          <h3>${escapeHtml(`${replies.length} ${replies.length === 1 ? "Reply" : "Replies"}`)}</h3>
          ${replies.map(renderThreadReply).join("")}
        `;
      }
    } catch (submissionError) {
      status.textContent = submissionError.message;
      status.classList.add("error");
      document.getElementById("replyMessage").focus();
    } finally {
      button.disabled = false;
      button.textContent = "Post Reply";
    }
  });
}

function validateThreadTopic(thread) {
  if (!isSignedIn()) return "Please log in with your approved Classroom Launchpad account.";
  if (postingBlocked) return "Posting is unavailable. Please check with Mr. Nieves.";
  if (!thread.studentName) return "Please add your name.";
  if (!thread.grade) return "Please add your grade.";
  if (!thread.title) return "Please add a topic title.";
  if (!thread.body) return "Please write the first post.";
  if (thread.title.length > 80) return "Keep the title under 80 characters.";
  if (thread.body.length > 360) return "Keep the first post under 360 characters.";
  if (isStudentMuted(thread.studentName)) return "Posting is unavailable. Please check with Mr. Nieves.";
  return "";
}

function validateThreadReply(reply) {
  if (!isSignedIn()) return "Please log in with your approved Classroom Launchpad account.";
  if (postingBlocked) return "Replying is unavailable. Please check with Mr. Nieves.";
  if (!reply.studentName) return "Please add your name.";
  if (!reply.grade) return "Please add your grade.";
  if (!reply.message) return "Please type a reply.";
  if (reply.message.length > 320) return "Keep your reply under 320 characters.";
  if (isStudentMuted(reply.studentName)) return "Replying is unavailable. Please check with Mr. Nieves.";
  return "";
}

function validateWebsiteRequest(request) {
  if (!request.studentName) return "Please add your name.";
  if (!request.grade) return "Please add your grade.";
  if (!LAUNCHPAD_FEEDBACK_TYPES.includes(request.feedbackType)) return "Please choose a feedback type.";
  if (!request.websiteName) return "Please describe the website, feature, or issue.";
  return "";
}

function validateWebsite(link) {
  if (!link.title) return "Website title is required.";
  if (!link.instruction) return "Teacher instruction is required.";
  if (!link.url) return "Website URL is required.";
  if (link.url === COLT_RUN_URL) return "";
  try {
    const parsed = new URL(link.url);
    if (!["http:", "https:"].includes(parsed.protocol)) return "Enter a valid http or https URL.";
  } catch {
    return "Enter a valid http or https URL.";
  }
  return "";
}

app.addEventListener("keydown", event => {
  if (event.key === "Escape" && homeNavigationMobileOpen) setHomeNavigationMobileOpen(false);
});

window.addEventListener("resize", () => {
  if (screen.name === "home") syncHomeNavigationAccessibility();
}, { passive: true });

app.addEventListener("click", async event => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;

  if (action === "homeNavigate") {
    const destination = document.getElementById(target.dataset.target || "");
    if (destination) {
      updateHomeNavigationActive(destination.id);
      setHomeNavigationMobileOpen(false);
      destination.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  if (action === "toggleHomeNavigation") setHomeNavigationMobileOpen(!homeNavigationMobileOpen);
  if (action === "closeHomeNavigation") setHomeNavigationMobileOpen(false);
  if (action === "toggleHomeNavigationCollapse") {
    homeNavigationCollapsed = !homeNavigationCollapsed;
    try {
      localStorage.setItem(HOME_NAVIGATION_COLLAPSED_KEY, String(homeNavigationCollapsed));
    } catch {}
    applyHomeNavigationCollapsedState();
  }

  if (action === "back") {
    if (screen.name === "thread") setScreen({ name: "coltCorner" });
    else if (["dashboard", "category", "pin", "login", "account", "assignments", "classroomPass", "coltCorner", "coltRun"].includes(screen.name)) setScreen({ name: "home" });
    else setScreen({ name: "dashboard" });
  }
  if (action === "teacher") {
    if (isTeacher()) {
      await loadApprovedStudents();
      await openTeacherDashboard();
    } else setScreen({ name: "pin" });
  }
  if (action === "teacherDashboard") {
    await loadApprovedStudents();
    await openTeacherDashboard();
  }
  if (action === "dashboardSection") {
    const nextSection = dashboardSections.some(section => section.id === target.dataset.section) ? target.dataset.section : "overview";
    if (nextSection === "passes") await loadClassroomPassData(false);
    dashboardSection = nextSection;
    sessionStorage.setItem("teacherDashboardSection", dashboardSection);
    render();
    document.getElementById("dashboardWorkspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (action === "dashboardLinkPage") {
    dashboardLinkPage = Math.max(1, Number(target.dataset.page) || 1);
    render();
    document.getElementById("dashboardWorkspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (action === "gradebookGrade") {
    dashboardGradebookGrade = ["4", "5", "6", "7"].includes(target.dataset.grade) ? target.dataset.grade : "4";
    dashboardGradebookAssignment = "all";
    dashboardGradebookSearch = "";
    render();
  }
  if (action === "viewGradebookStudent") {
    dashboardSubmissionSearch = target.dataset.student || "";
    dashboardAssignmentFilter = dashboardGradebookAssignment;
    dashboardGradeFilter = dashboardGradebookGrade;
    dashboardSubmissionStatus = "all";
    dashboardSection = "assignments";
    selectedSubmissionId = "";
    sessionStorage.setItem("teacherDashboardSection", dashboardSection);
    render();
    document.getElementById("dashboardWorkspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (action === "login") {
    authMessage = "";
    setScreen({ name: "login" });
  }
  if (action === "account") setScreen({ name: "account" });
  if (action === "logout") {
    try {
      await sharedBackend.logout();
    } catch {}
    authSession = { authenticated: false, role: "guest", name: "", email: "", grade: "" };
    classThreads = [];
    mutedStudents = [];
    websiteRequests = [];
    approvedStudents = [];
    assignments = [];
    submissions = [];
    classroomPassData = normalizeClassroomPassPayload(null);
    classroomPassDestination = "";
    classroomPassMessage = "";
    activationCodeResults = [];
    setScreen({ name: "home" });
  }
  if (action === "toggleTheme") toggleTheme();
  if (action === "category") setScreen({ name: "category", category: target.dataset.category });
  if (action === "openAssignments") setScreen({ name: isApprovedStudent() ? "assignments" : "login" });
  if (action === "openClassroomPass") {
    if (!isSignedIn()) setScreen({ name: "login" });
    else if (isTeacher()) {
      await loadClassroomPassData(false);
      dashboardSection = "passes";
      sessionStorage.setItem("teacherDashboardSection", dashboardSection);
      setScreen({ name: "dashboard" });
    } else {
      classroomPassMessage = "";
      await loadClassroomPassData(false);
      setScreen({ name: "classroomPass" });
    }
  }
  if (action === "selectClassroomPassDestination") {
    classroomPassDestination = classroomPassData.destinations.includes(target.dataset.destination) ? target.dataset.destination : "";
    classroomPassMessage = "";
    render();
  }
  if (action === "startClassroomPass") {
    if (!classroomPassDestination) return;
    try {
      classroomPassData = normalizeClassroomPassPayload(await sharedBackend.startClassroomPass(classroomPassDestination));
      classroomPassDestination = "";
      classroomPassMessage = "Your departure time was recorded automatically.";
      render();
    } catch (error) {
      classroomPassMessage = error.message;
      await loadClassroomPassData(false);
      render();
    }
  }
  if (action === "returnClassroomPass") {
    try {
      classroomPassData = normalizeClassroomPassPayload(await sharedBackend.returnClassroomPass());
      classroomPassMessage = "Welcome back. Your return time was recorded automatically.";
      render();
    } catch (error) {
      classroomPassMessage = error.message;
      render();
    }
  }
  if (action === "teacherReturnClassroomPass") {
    try {
      classroomPassData = normalizeClassroomPassPayload(await sharedBackend.closeClassroomPass(target.dataset.id));
      classroomPassMessage = "The student was marked as returned.";
      render();
    } catch (error) {
      classroomPassMessage = error.message;
      render();
    }
  }
  if (action === "deleteClassroomPass") {
    const pass = classroomPassData.passes.find(item => item.id === target.dataset.id);
    modal = {
      title: "Delete Classroom Pass record?",
      message: `This permanently removes ${pass ? `${pass.studentName}'s ${pass.destination} pass` : "this pass record"}.`,
      confirmText: "Delete Record",
      onConfirm: async () => {
        classroomPassData = normalizeClassroomPassPayload(await sharedBackend.deleteClassroomPass(target.dataset.id));
        classroomPassMessage = "The pass record was deleted.";
        render();
      }
    };
    render();
  }
  if (action === "assignmentView") {
    assignmentView = target.dataset.view || "todo";
    selectedAssignmentId = "";
    render();
  }
  if (action === "submissionMethod") {
    submissionMethod = target.dataset.method === "link" ? "link" : "file";
    render();
  }
  if (action === "selectAssignment") {
    selectedAssignmentId = target.dataset.id;
    render();
  }
  if (action === "replaceSubmission") {
    replacingAssignmentId = selectedAssignmentId;
    assignmentView = "todo";
    render();
  }
  if (action === "cancelReplacement") {
    replacingAssignmentId = "";
    assignmentView = "submitted";
    render();
  }
  if (action === "newAssignment") {
    assignmentEditorId = "new";
    render();
  }
  if (action === "editAssignment") {
    assignmentEditorId = target.dataset.id;
    render();
  }
  if (action === "closeAssignmentEditor") {
    assignmentEditorId = "";
    render();
  }
  if (action === "selectSubmission") {
    selectedSubmissionId = target.dataset.id;
    render();
  }
  if (action === "deleteAssignment") {
    const assignment = assignments.find(item => item.id === target.dataset.id);
    modal = {
      title: "Delete assignment?",
      message: `This permanently removes ${assignment ? assignment.title : "this assignment"} and every submitted file attached to it.`,
      confirmText: "Delete Assignment",
      onConfirm: async () => {
        const result = await sharedBackend.deleteAssignment(target.dataset.id);
        assignments = normalizeAssignments(result.assignments);
        submissions = normalizeSubmissions(result.submissions);
        selectedSubmissionId = "";
        render();
      }
    };
    render();
  }
  if (action === "deleteSubmission") {
    const submission = submissions.find(item => item.id === target.dataset.id);
    modal = {
      title: "Delete submission?",
      message: `This permanently removes ${submission ? submission.studentName + "'s file" : "this submitted file"}.`,
      confirmText: "Delete Submission",
      onConfirm: async () => {
        const result = await sharedBackend.deleteSubmission(target.dataset.id);
        assignments = normalizeAssignments(result.assignments);
        submissions = normalizeSubmissions(result.submissions);
        selectedSubmissionId = "";
        render();
      }
    };
    render();
  }
  if (action === "randomActivity") {
    if (randomActivitySettings.locked) return;
    randomActivity = pickRandomActivity();
    const card = document.getElementById("randomActivityCard");
    if (card) card.outerHTML = renderRandomActivityCard();
    observeDeferredVideos(app);
  }
  if (action === "openColtCorner") setScreen({ name: isSignedIn() ? "coltCorner" : "login" });
  if (action === "openColtRun") {
    window.dispatchEvent(new CustomEvent("colt-run-opening"));
    setScreen({ name: "coltRun" });
  }
  if (action === "openThread") setScreen({ name: "thread", id: target.dataset.id });
  if (action === "open") window.open(target.dataset.url, "_blank", "noopener,noreferrer");
  if (action === "add") setScreen({ name: "edit", id: null });
  if (action === "edit") setScreen({ name: "edit", id: target.dataset.id });
  if (action === "changePin") setScreen({ name: "changePin" });
  if (action === "removeApprovedStudent") {
    try {
      const result = await sharedBackend.removeApprovedStudent(target.dataset.email);
      approvedStudents = result.students || [];
      render();
    } catch (error) {
      authMessage = error.message;
    }
  }
  if (action === "resetStudentCode") {
    try {
      const result = await sharedBackend.resetStudentCode(target.dataset.email);
      approvedStudents = result.students || [];
      activationCodeResults = [{ email: result.email, activationCode: result.activationCode }];
      render();
    } catch (error) {
      authMessage = error.message;
    }
  }
  if (action === "regenerateStudentCodes") {
    try {
      const result = await sharedBackend.regenerateStudentCodes();
      approvedStudents = result.students || [];
      activationCodeResults = result.activationCodes || [];
      render();
    } catch (error) {
      authMessage = error.message;
    }
  }
  if (action === "downloadActivationCodes" && activationCodeResults.length) {
    const rows = [
      ["Student Email", "One-Time Activation Code"],
      ...activationCodeResults.map(item => [item.email, item.activationCode])
    ];
    const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `classroom-launchpad-activation-codes-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
  if (action === "delete") {
    const link = links.find(item => item.id === target.dataset.id);
    modal = {
      title: "Delete website?",
      message: `This will remove ${link ? link.title : "this website"} from the student lists.`,
      confirmText: "Delete",
      onConfirm: () => saveLinks(links.filter(item => item.id !== target.dataset.id))
    };
    render();
  }
  if (action === "deleteRequest") {
    saveWebsiteRequests(websiteRequests.filter(item => item.id !== target.dataset.id));
  }
  if (action === "deleteThread") {
    try {
      const result = await sharedBackend.deleteThread(target.dataset.id);
      classThreads = normalizeThreads(result && result.threads);
      moderationQueue = normalizeModerationItems(result && result.moderation && result.moderation.pending);
      recentlyModerated = normalizeModerationItems(result && result.moderation && result.moderation.recent);
      render();
    } catch (error) {
      authMessage = error.message;
    }
  }
  if (action === "deleteReply") {
    try {
      const result = await sharedBackend.deleteReply(target.dataset.threadId, target.dataset.replyId);
      classThreads = normalizeThreads(result && result.threads);
      moderationQueue = normalizeModerationItems(result && result.moderation && result.moderation.pending);
      recentlyModerated = normalizeModerationItems(result && result.moderation && result.moderation.recent);
      render();
    } catch (error) {
      authMessage = error.message;
    }
  }
  if (action === "moderatePost") {
    const moderationAction = target.dataset.moderationAction;
    const card = target.closest("[data-moderation-card]");
    const update = { action: moderationAction };
    if (moderationAction === "edit_approve" && card) {
      const titleInput = card.querySelector(".moderation-edit-title");
      const messageInput = card.querySelector(".moderation-edit-message");
      update.title = titleInput ? titleInput.value.trim() : "";
      update.message = messageInput ? messageInput.value.trim() : "";
    }
    target.disabled = true;
    try {
      const result = await sharedBackend.moderatePost(target.dataset.id, update);
      classThreads = normalizeThreads(result && result.threads);
      moderationQueue = normalizeModerationItems(result && result.moderation && result.moderation.pending);
      recentlyModerated = normalizeModerationItems(result && result.moderation && result.moderation.recent);
      render();
    } catch (error) {
      target.disabled = false;
      const status = document.getElementById("moderationDashboardStatus");
      if (status) {
        status.textContent = error.message;
        status.classList.add("error");
      }
    }
  }
  if (action === "muteStudent") {
    const name = target.dataset.student || "";
    const normalized = normalizeStudentName(name);
    if (normalized && !mutedStudents.some(student => student.normalized === normalized)) {
      saveMutedStudents([
        { id: makeId(), name: name.trim().replace(/\s+/g, " "), normalized, createdAt: new Date().toISOString() },
        ...mutedStudents
      ]);
    }
  }
  if (action === "unmuteStudent") {
    saveMutedStudents(mutedStudents.filter(student => student.id !== target.dataset.id));
  }
  if (action === "pauseTimer") {
    const remainingSeconds = getClassTimerRemaining(classTimer);
    saveClassTimer({
      ...classTimer,
      status: remainingSeconds <= 0 ? "ended" : "paused",
      remainingSeconds,
      endAt: "",
      updatedAt: new Date().toISOString()
    });
  }
  if (action === "resumeTimer") {
    const remainingSeconds = Math.max(1, getClassTimerRemaining(classTimer));
    saveClassTimer({
      ...classTimer,
      status: "running",
      remainingSeconds,
      endAt: new Date(Date.now() + remainingSeconds * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  if (action === "resetTimer") {
    saveClassTimer({
      ...classTimer,
      status: "paused",
      remainingSeconds: classTimer.durationSeconds || DEFAULT_CLASS_TIMER.durationSeconds,
      endAt: "",
      updatedAt: new Date().toISOString()
    });
  }
  if (action === "clearTimer") {
    saveClassTimer({ ...DEFAULT_CLASS_TIMER, updatedAt: new Date().toISOString() });
  }
  if (action === "reset") {
    modal = {
      title: "Reset all links?",
      message: "This restores the original sample links and removes teacher edits.",
      confirmText: "Reset",
      onConfirm: () => saveLinks(defaultLinks.map(link => ({ ...link, id: makeId() })))
    };
    render();
  }
  if (action === "closeModal") {
    modal = null;
    render();
  }
  if (action === "confirmModal") {
    const run = modal && modal.onConfirm;
    modal = null;
    if (run) run();
    render();
  }
});

app.addEventListener("change", event => {
  const target = event.target;
  if (!target.matches("[data-action]")) return;
  if (target.dataset.action === "toggleActive") updateLink(target.dataset.id, { active: target.checked });
  if (target.dataset.action === "toggleToday") updateLink(target.dataset.id, { todayChoice: target.checked });
  if (target.dataset.action === "toggleRandomActivityLock") {
    saveRandomActivitySettings({
      locked: target.checked,
      updatedAt: new Date().toISOString()
    });
  }
});

window.addEventListener("popstate", () => setScreen({ name: "home" }));

window.ClassroomLaunchpadAssistantData = Object.freeze({
  getApprovedLinks() {
    return links
      .filter(link => link && link.active !== false)
      .map(link => ({
        id: String(link.id || ""),
        title: String(link.title || ""),
        instruction: String(link.instruction || ""),
        category: String(link.category || ""),
        url: String(link.url || ""),
        active: true
      }));
  },
  getCategories() {
    return [...categories];
  },
  getClassroomRules() {
    return [...CLASSROOM_EXPECTATIONS];
  },
  getTodayDirections() {
    return getLaunchPlainText(dailyLaunch.message).slice(0, 1000);
  },
  getCurrentScreen() {
    return screen.name;
  },
  isApprovedLinksReady() {
    return approvedLinksReady;
  },
  openApprovedLink(id) {
    const approved = links.find(link => link && link.active !== false && String(link.id) === String(id));
    if (!approved) return false;
    try {
      const url = new URL(approved.url);
      if (!["http:", "https:"].includes(url.protocol)) return false;
      window.open(url.href, "_blank", "noopener,noreferrer");
      return true;
    } catch {
      return false;
    }
  }
});

async function initializeApp() {
  render();
  if (sharedBackend.enabled) {
    try {
      const [configResult, sessionResult] = await Promise.all([
        sharedBackend.loadAuthConfig(),
        sharedBackend.loadSession()
      ]);
      authConfig = { ...authConfig, ...(configResult || {}) };
      authSession = sessionResult && sessionResult.session ? sessionResult.session : authSession;
      await loadSharedState(false);
      if (isSignedIn()) await loadClassroomPassData(false);
      if (isTeacher()) await loadApprovedStudents();
    } catch {}
  }
  render();
  startSharedSync();
}

initializeApp();







