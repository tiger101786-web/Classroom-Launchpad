const categories = [
  "Typing Practice",
  "Social Studies & Science",
  "Computer Skills",
  "Review Games",
  "Logic Games",
  "Creative Projects",
  "Class Videos"
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

let deferredVideoObserver = null;

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

function normalizeRequests(items) {
  return (Array.isArray(items) ? items : []).filter(item => item && item.id !== DAILY_LAUNCH_REQUEST_ID && item.id !== CLASS_TIMER_REQUEST_ID && item.id !== RANDOM_ACTIVITY_REQUEST_ID).map(item => ({
    id: item.id || makeId(),
    studentName: item.studentName || "",
    grade: item.grade || "",
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
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.status === 204 ? null : response.json();
  },
  loadState() {
    return this.request("/api/state");
  },
  saveThreads(threads) {
    return this.request("/api/threads", { method: "PUT", body: JSON.stringify({ threads }) });
  },
  saveMutedStudents(students) {
    return this.request("/api/muted-students", { method: "PUT", body: JSON.stringify({ mutedStudents: students }) });
  },
  saveWebsiteRequests(requests) {
    return this.request("/api/website-requests", { method: "PUT", body: JSON.stringify({ websiteRequests: requests }) });
  },
  saveDailyLaunch(launch) {
    return this.request("/api/daily-launch", { method: "PUT", body: JSON.stringify({ message: launch.message }) });
  },
  saveClassTimer(timer) {
    return this.request("/api/class-timer", { method: "PUT", body: JSON.stringify({ classTimer: timer }) });
  },
  saveRandomActivitySettings(settings) {
    return this.request("/api/random-activity", { method: "PUT", body: JSON.stringify({ randomActivity: settings }) });
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

let links = store.loadLinks();
let websiteRequests = store.loadRequests();
let classThreads = store.loadThreads();
let mutedStudents = store.loadMutedStudents();
let dailyLaunch = store.loadDailyLaunch();
let classTimer = store.loadClassTimer();
let randomActivitySettings = store.loadRandomActivitySettings();
let screen = { name: "home" };
let modal = null;
let theme = store.getTheme();
let clockTimer = null;
let classTimerClock = null;
let sharedSyncTimer = null;
let randomActivity = null;
let coltRunGame = null;
const app = document.getElementById("app");

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
  return JSON.stringify({ classThreads, mutedStudents, websiteRequests, dailyLaunch, classTimer, randomActivitySettings });
}

async function loadSharedState(shouldRender = true) {
  if (!sharedBackend.enabled) return;
  const before = sharedSnapshot();
  try {
    const state = await sharedBackend.loadState();
    const incomingThreads = normalizeThreads(state && state.threads);
    const incomingMuted = normalizeMutedStudents(state && state.mutedStudents);
    const incomingRequests = normalizeRequests(state && state.websiteRequests);
    const incomingLaunch = normalizeDailyLaunch((state && state.dailyLaunch) || extractDailyLaunchFromRequests(state && state.websiteRequests));
    const incomingTimer = chooseSharedClassTimer(state && state.classTimer, extractClassTimerFromRequests(state && state.websiteRequests));
    const incomingRandomActivity = chooseSharedRandomActivitySettings(state && state.randomActivity, extractRandomActivitySettingsFromRequests(state && state.websiteRequests));
    classThreads = incomingThreads;
    mutedStudents = incomingMuted;
    websiteRequests = incomingRequests;
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
  } catch {
    sharedBackend.enabled = false;
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

function saveLinks(next) {
  links = next;
  store.saveLinks(links);
  render();
}

function saveWebsiteRequests(next, shouldRender = true) {
  websiteRequests = normalizeRequests(next);
  store.saveRequests(websiteRequests);
  if (sharedBackend.enabled) sharedBackend.saveWebsiteRequests([dailyLaunchRequestMarker(), classTimerRequestMarker(), randomActivityRequestMarker(), ...websiteRequests]).catch(() => {});
  if (shouldRender) render();
}

function saveClassThreads(next, shouldRender = true) {
  classThreads = normalizeThreads(next);
  store.saveThreads(classThreads);
  if (sharedBackend.enabled) sharedBackend.saveThreads(classThreads).catch(() => {});
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

function renderHome() {
  return `
    <section class="hero-panel">
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
          <button class="mode-btn" title="Switch color mode" data-action="toggleTheme">${theme === "night" ? "Light" : "Night"}</button>
          <button class="icon-btn" title="Teacher Mode" data-action="teacher">⚙</button>
        </div>`
      )}
      <section class="home-feature">
        <div class="search-wrap">
          <input id="studentSearch" type="search" placeholder="Search approved links" autocomplete="off">
        </div>
        <video class="school-photo" autoplay muted loop playsinline aria-label="Mr. Nieves with the St. Cletus Colts mascot">
          <source data-src="assets/mr-nieves-colts.mp4" type="video/mp4">
        </video>
      </section>
    </section>
    <section id="homeBody">
      ${renderHomeDefault()}
    </section>
  `;
}

function renderHomeDefault() {
  return `
    <section class="launch-row" aria-label="Launch tools">
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
    <section class="rules-card">
      <div class="expectations-copy">
        <div>
          <h3>Classroom Launchpad Expectations:</h3>
          <ol>
            <li>Stay on approved sites.</li>
            <li>Work quietly.</li>
            <li>Keep headphones low.</li>
            <li>Do not switch activities without permission.</li>
            <li>Ask for permission before switching to any unlisted website.</li>
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
    <h2 class="section-title">Website Categories</h2>
    <section class="category-grid">
      ${categories.map(category => categoryCard(category)).join("")}
    </section>
    ${renderColtCornerPreview()}
    ${renderStudentWebsiteRequest()}
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
  return `
    <section class="student-request-card">
      <div class="request-heading">
        <span class="feature-kicker">Website Request</span>
        <h2>Suggest a Website</h2>
        <p>Send Mr. Nieves a website idea to review before it is added.</p>
        <figure class="request-spirit">
          <video autoplay muted loop playsinline aria-label="Animated Colts school spirit graphic">
            <source data-src="assets/request-spirit.mp4" type="video/mp4">
          </video>
        </figure>
      </div>
      <form id="studentRequestForm" class="student-request-form">
        <div class="field">
          <label for="requestStudentName">Name</label>
          <input id="requestStudentName" autocomplete="name" placeholder="Your name">
        </div>
        <div class="field">
          <label for="requestGrade">Grade</label>
          <input id="requestGrade" autocomplete="off" placeholder="Your grade">
        </div>
        <div class="field">
          <label for="requestWebsiteName">Website name</label>
          <input id="requestWebsiteName" autocomplete="off" placeholder="Website to request">
        </div>
        <button class="primary-btn" type="submit">Send Request</button>
        <p id="studentRequestMessage" class="request-message" aria-live="polite"></p>
      </form>
    </section>
  `;
}

function renderColtCorner() {
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
            <li>Be respectful.</li>
            <li>Keep it appropriate.</li>
            <li>School-related topics only.</li>
            <li>Stay on topic.</li>
            <li>Think before you post.</li>
            <li>No spamming or repeat posts.</li>
          </ol>
        </section>
        <figure class="colt-corner-graphic">
          <video autoplay muted loop playsinline aria-label="Animated Colt Corner message board logo">
            <source data-src="assets/colt-corner-message-board.mp4" type="video/mp4">
          </video>
        </figure>
      </div>
      <form id="threadForm" class="thread-form">
        <div class="field">
          <label for="threadStudentName">Name</label>
          <input id="threadStudentName" autocomplete="name" placeholder="Your name">
        </div>
        <div class="field">
          <label for="threadGrade">Grade</label>
          <input id="threadGrade" autocomplete="off" placeholder="Your grade">
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
        <p id="threadStatus" class="request-message" aria-live="polite"></p>
        <figure class="colt-corner-banner thread-form-banner">
          <video autoplay muted loop playsinline aria-label="Animated Join the Herd Colt Corner banner">
            <source data-src="assets/colt-corner-join-herd.mp4" type="video/mp4">
          </video>
        </figure>
      </form>
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
      <span>${escapeHtml(thread.studentName)}<small>Grade ${escapeHtml(thread.grade)}</small></span>
      <span class="thread-replies">${replyCount}</span>
      <span>${lastDate ? escapeHtml(lastDate) : "New"}<small>${escapeHtml(lastPost.studentName || thread.studentName)}</small></span>
    </button>
  `;
}

function renderThreadDetail(threadId) {
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
        <p class="meta">${escapeHtml(thread.studentName)} • Grade ${escapeHtml(thread.grade)}${formatShortDate(thread.createdAt) ? ` • ${escapeHtml(formatShortDate(thread.createdAt))}` : ""}</p>
      </article>
      <section class="thread-reply-list" aria-label="Thread replies">
        <h3>${escapeHtml(`${replies.length} ${replies.length === 1 ? "Reply" : "Replies"}`)}</h3>
        ${replies.length ? replies.map(renderThreadReply).join("") : emptyCard("No replies yet. Ask the first question or add a helpful response.")}
      </section>
      <form id="replyForm" class="reply-form" data-thread-id="${thread.id}">
        <div class="field">
          <label for="replyStudentName">Name</label>
          <input id="replyStudentName" autocomplete="name" placeholder="Your name">
        </div>
        <div class="field">
          <label for="replyGrade">Grade</label>
          <input id="replyGrade" autocomplete="off" placeholder="Your grade">
        </div>
        <div class="field">
          <label for="replyMessage">Reply</label>
          <textarea id="replyMessage" maxlength="320" placeholder="Write a respectful question or response"></textarea>
        </div>
        <button class="primary-btn" type="submit">Post Reply</button>
        <p id="replyStatus" class="request-message" aria-live="polite"></p>
      </form>
    </section>
  `;
}

function renderThreadReply(reply) {
  const submitted = formatShortDate(reply.createdAt);
  return `
    <article class="thread-reply-post">
      <p>${escapeHtml(reply.message)}</p>
      <p class="meta">${escapeHtml(reply.studentName)} • Grade ${escapeHtml(reply.grade)}${submitted ? ` • ${escapeHtml(submitted)}` : ""}</p>
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
            <h3>Choose Your Runner</h3>
            <div class="colt-run-character-grid">
              <button type="button" data-colt-run="character" data-character="colt">
                <canvas id="coltRunSelectColt" width="180" height="130" aria-hidden="true"></canvas>
                <span>Colt</span>
              </button>
              <button type="button" data-colt-run="character" data-character="mrNieves">
                <canvas id="coltRunSelectMrNieves" width="180" height="150" aria-hidden="true"></canvas>
                <span>Mr. Nieves</span>
              </button>
            </div>
          </div>
        </div>
        <canvas id="coltRunCanvas" class="colt-run-canvas" width="960" height="540" tabindex="0" aria-label="Colt Run platform game"></canvas>
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
        <p id="coltRunStatus">Use arrow keys or WASD to move. Space or up arrow jumps. Reach the flag before time runs out.</p>
        <div class="colt-run-actions">
          <div class="colt-run-volume" aria-label="Game audio volume">
            <button id="coltRunMusicToggle" class="colt-run-volume-btn" type="button" data-colt-run="musicToggle" aria-label="Turn game audio off"></button>
            <input id="coltRunMusicVolume" class="colt-run-volume-slider" type="range" min="0" max="100" step="1" value="42" aria-label="Game audio volume">
          </div>
          <button class="outline-btn" type="button" data-colt-run="fullscreen">⛶ Fullscreen</button>
          <button class="outline-btn" type="button" data-colt-run="characterSelect">Character</button>
          <button class="outline-btn" type="button" data-colt-run="leaderboard">Leaderboard</button>
          <button class="outline-btn" type="button" data-colt-run="restart">Restart</button>
          <button id="coltRunNextLevel" class="primary-btn" type="button" data-colt-run="new" disabled>Next Level</button>
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
  const fullscreenButtons = shell ? Array.from(shell.querySelectorAll('[data-colt-run="fullscreen"]')) : [];
  const ctx = canvas.getContext("2d");
  const levelNode = document.getElementById("coltRunLevel");
  const timeNode = document.getElementById("coltRunTime");
  const scoreNode = document.getElementById("coltRunScore");
  const statusNode = document.getElementById("coltRunStatus");
  const nextLevelButton = document.getElementById("coltRunNextLevel");
  const leaderboardPanel = document.getElementById("coltRunLeaderboard");
  const leaderboardBody = document.getElementById("coltRunLeaderboardBody");
  const leaderboardForm = document.getElementById("coltRunLeaderboardForm");
  const leaderboardNameInput = document.getElementById("coltRunPlayerName");
  const leaderboardStorageKey = "coltRunCoinLeaderboardV1";
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
      forwardCooldown: 920
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
      forwardCooldown: 720
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
      forwardCooldown: 560
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
      forwardCooldown: 440
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
    }
  ];
  const inGameMusic = createDeferredAudio("");
  const lastInGameMusicTrackStorageKey = "coltRunLastInGameMusicTrackV1";
  let currentInGameMusicTrack = null;
  const characterSelectMusic = createDeferredAudio("assets/colt-run-character-select-music.mp3?v=20260719-character-select1", true);
  const runningAudio = createDeferredAudio("assets/colt-run-running-audio.mp3?v=20260714-running1", true);
  const mrNievesRunningAudio = createDeferredAudio(mrNievesRunMediaSource, true);
  const rockDeathAudio = createDeferredAudio("assets/colt-run-rock-death-audio.mp3?v=20260714-rock-death1");
  const ambientLayerVolume = 1;
  const inGameMusicLayerVolume = 0.5;
  const characterSelectMusicLayerVolume = 0.7;
  const runningLayerVolume = 0.9;
  const rockDeathLayerVolume = 1;
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
  characterSelectMusic.volume = musicMuted ? 0 : musicVolume * characterSelectMusicLayerVolume;
  characterSelectMusic.muted = musicMuted;
  runningAudio.volume = musicMuted ? 0 : musicVolume * runningLayerVolume;
  runningAudio.muted = musicMuted;
  mrNievesRunningAudio.volume = musicMuted ? 0 : musicVolume * runningLayerVolume;
  mrNievesRunningAudio.muted = musicMuted;
  rockDeathAudio.volume = musicMuted ? 0 : musicVolume * rockDeathLayerVolume;
  rockDeathAudio.muted = musicMuted;
  const keys = { left: false, right: false, jump: false };
  let animationId = 0;
  let level = 1;
  let levelSeed = Date.now();
  let levelStart = performance.now();
  let runTimeBankSeconds = 0;
  let levelDurationSeconds = 60;
  let cameraX = 0;
  let score = 0;
  let won = false;
  let lost = false;
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
      statusNode.textContent = `${difficultyModes[mode].label} mode is already selected.`;
      canvas.focus({ preventScroll: true });
      return;
    }
    difficultyMode = mode;
    localStorage.setItem(difficultyStorageKey, difficultyMode);
    updateDifficultyButtons();
    level = 1;
    resetLevel(true);
    statusNode.textContent = `${difficultyModes[mode].label} mode selected. Reach the flag before time runs out.`;
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
    if (characterSelectPanel) characterSelectPanel.hidden = false;
    updateCharacterButtons();
    stopRunningAudio();
    if (initialCharacterSelectionPending) playColtRunAudio();
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
      characterSelectMusic.pause();
      try {
        characterSelectMusic.currentTime = 0;
      } catch {}
    }
    selectedCharacter = character;
    localStorage.setItem(characterStorageKey, selectedCharacter);
    updateCharacterButtons();
    ensureCharacterMedia(selectedCharacter);
    resetLevel(true);
    closeCharacterSelect();
    playColtRunAudio();
    statusNode.textContent = `${characterNames[selectedCharacter]} selected. Reach the flag before time runs out.`;
  };
  const player = { x: 48, y: 300, w: 82, h: 62, vx: 0, vy: 0, grounded: false, groundPlatform: null, facing: 1, state: "idle", jumpPrepUntil: 0 };
  const coltSprites = {
    idle: new Image(),
    run: new Image(),
    run2: new Image(),
    run3: new Image(),
    jumpPrep: new Image(),
    leap: new Image()
  };
  coltSprites.idle.src = "assets/colt-run-idle.png?v=20260702-legfix";
  coltSprites.run.src = "assets/colt-run-run.png?v=20260703-holefix";
  coltSprites.run2.src = "assets/colt-run-run-2.png?v=20260702-run2";
  coltSprites.run3.src = "assets/colt-run-run-3.png?v=20260702-run3";
  coltSprites.jumpPrep.src = "assets/colt-run-jump-prep.png?v=20260702-clean";
  coltSprites.leap.src = "assets/colt-run-leap.png?v=20260702-clean";
  const smallPlatformSpriteIndex = 21;
  const platformAssetVersions = Array.from({ length: 22 }, () => "20260718-platform07-replace1");
  platformAssetVersions[0] = "20260718-platform01-replace1";
  platformAssetVersions[1] = "20260718-platform02-replace1";
  platformAssetVersions[3] = "20260718-platform04-replace1";
  platformAssetVersions[4] = "20260718-platform05-replace1";
  platformAssetVersions[8] = "20260718-platform09-replace1";
  platformAssetVersions[9] = "20260719-platform10-replace1";
  platformAssetVersions[10] = "20260719-platform11-replace1";
  platformAssetVersions[11] = "20260719-platform12-replace1";
  platformAssetVersions[12] = "20260718-platform13-replace1";
  platformAssetVersions[13] = "20260718-platform14-replace1";
  platformAssetVersions[14] = "20260718-platform15-replace1";
  platformAssetVersions[15] = "20260719-platform16-replace1";
  platformAssetVersions[16] = "20260719-platform17-replace1";
  platformAssetVersions[17] = "20260718-platform18-replace1";
  platformAssetVersions[20] = "20260718-platform21-replace1";
  const platformSpriteSources = platformAssetVersions.map((version, index) => (
    `assets/colt-run-platform-${String(index + 1).padStart(2, "0")}.png?v=${version}`
  ));
  const platformSprites = platformSpriteSources.map(() => new Image());
  const ensurePlatformSprite = index => {
    const spriteIndex = Math.abs(index) % platformSprites.length;
    const sprite = platformSprites[spriteIndex];
    if (!sprite.getAttribute("src")) sprite.src = platformSpriteSources[spriteIndex];
    return sprite;
  };
  const platformSurfaceRatios = [0.24, 0.27, 0.20, 0.18, 0.24, 0.27, 0.22, 0.25, 0.35, 0.24, 0.23, 0.22, 0.42, 0.52, 0.41, 0.13, 0.52, 0.50, 0.47, 0.50, 0.22, 0.18];
  const platformCollisionProfiles = {
    0: { offsetY: 10 },
    7: { leftSurfaceRatio: 0.43, rightSurfaceRatio: 0.08 }
  };

  const getPlatformDrawSize = platform => {
    const spriteIndex = platform.sprite % platformSprites.length;
    const sprite = platformSprites[spriteIndex];
    const drawW = spriteIndex === smallPlatformSpriteIndex ? Math.max(platform.w + 28, platform.w * 1.14) : Math.max(platform.w + 72, platform.w * 1.22);
    const naturalRatio = sprite.complete && sprite.naturalWidth ? sprite.naturalHeight / sprite.naturalWidth : 0.48;
    const drawH = spriteIndex === smallPlatformSpriteIndex ? Math.max(54, Math.min(112, drawW * naturalRatio)) : Math.max(82, Math.min(190, drawW * naturalRatio));
    return { drawW, drawH };
  };

  const getPlatformSurfaceY = (platform, footX) => {
    const spriteIndex = platform.sprite % platformSprites.length;
    const profile = platformCollisionProfiles[spriteIndex];
    if (!profile) return platform.y;
    if (Number.isFinite(profile.offsetY)) return platform.y + profile.offsetY;
    const { drawH } = getPlatformDrawSize(platform);
    const localX = Math.max(0, Math.min(1, (footX - platform.x) / platform.w));
    const surfaceRatio = profile.leftSurfaceRatio + (profile.rightSurfaceRatio - profile.leftSurfaceRatio) * localX;
    return platform.y + drawH * (surfaceRatio - platformSurfaceRatios[spriteIndex]);
  };
  const lavaRockSpriteSources = Array.from({ length: 10 }, (_, index) => (
    `assets/colt-run-lava-rock-${String(index + 1).padStart(2, "0")}.png?v=20260707-rocks6`
  ));
  const lavaRockSprites = lavaRockSpriteSources.map(() => new Image());
  const ensureLavaRockSprite = index => {
    const spriteIndex = Math.abs(index) % lavaRockSprites.length;
    const sprite = lavaRockSprites[spriteIndex];
    if (!sprite.getAttribute("src")) sprite.src = lavaRockSpriteSources[spriteIndex];
    return sprite;
  };
  const lavaRockShowerSpriteSources = [
    "assets/colt-run-lava-rock-shower-01.png?v=20260707-shower1",
    "assets/colt-run-lava-rock-shower-02.png?v=20260711-shower2"
  ];
  const lavaRockShowerSprites = lavaRockShowerSpriteSources.map(() => new Image());
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
    { coreX: 0.32, coreY: 0.68, rx: 0.21, ry: 0.2 }
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
    ]
  ];
  const lavaRockVideoSpecialHitProfiles = [
    { coreX: 0.35, coreY: 0.66, rx: 0.2, ry: 0.2 }
  ];
  const lavaRockSizeMultipliers = [0.72, 0.92, 0.92, 0.9, 0.9, 0.82, 0.84, 0.84, 0.9, 0.9];
  const backgroundSpriteSources = Array.from({ length: 5 }, (_, index) => (
    `assets/colt-run-bg-${String(index + 1).padStart(2, "0")}.png?v=20260719-background-stills-match-videos1`
  ));
  const backgroundSprites = backgroundSpriteSources.map(() => new Image());
  const ensureBackgroundSprite = index => {
    const spriteIndex = Math.abs(index) % backgroundSprites.length;
    const sprite = backgroundSprites[spriteIndex];
    if (!sprite.getAttribute("src")) sprite.src = backgroundSpriteSources[spriteIndex];
    return sprite;
  };
  const animatedBackgroundVideos = [
    "assets/colt-run-bg-01.mp4?v=20260709-scene1-sixsec",
    "assets/colt-run-bg-02.mp4?v=20260709-scene2-sixsec",
    "assets/colt-run-bg-03.mp4?v=20260709-scene3-sixsec",
    "assets/colt-run-bg-04.mp4?v=20260709-scene4-sixsec",
    "assets/colt-run-bg-05.mp4?v=20260704-scene5"
  ].map(createDeferredVideo);
  const coinSprite = new Image();
  coinSprite.src = "assets/colt-run-coin.png?v=20260709-coin-gold";
  const coinVideo = createDeferredVideo("assets/colt-run-coin-spin.mp4?v=20260704-coin2");
  const flagVideo = createDeferredVideo("assets/colt-run-flag.mp4?v=20260704-flagblow");
  const idleVideo = createDeferredVideo("assets/colt-run-idle.mp4?v=20260703-idle");
  const runVideo = createDeferredVideo("assets/colt-run-run.mp4?v=20260704-best-run");
  const leapVideo = createDeferredVideo("assets/colt-run-leap.mp4?v=20260704-best2-leap");
  const mrNievesIdleVideo = createDeferredVideo("assets/colt-run-mr-nieves-idle.mp4?v=20260716-idle-remake2");
  const mrNievesRunVideo = createDeferredVideo(mrNievesRunMediaSource);
  const mrNievesInAirVideo = createDeferredVideo("assets/colt-run-mr-nieves-inair.mp4?v=20260717-inair1");
  const mrNievesCelebrationVideo = createDeferredVideo("assets/colt-run-mr-nieves-celebration.mp4?v=20260717-celebration1");
  const mrNievesJumpImage = new Image();
  mrNievesJumpImage.src = "assets/colt-run-mr-nieves-jump.jpg?v=20260717-jump1";
  const deathVideo = createDeferredVideo("assets/colt-run-death.mp4?v=20260706-death");
  const ensureCharacterMedia = character => {
    if (character === "mrNieves") {
      ensureMediaSource(mrNievesIdleVideo);
      ensureMediaSource(mrNievesRunVideo);
      ensureMediaSource(mrNievesInAirVideo);
      ensureMediaSource(mrNievesCelebrationVideo, "metadata");
      return;
    }
    ensureMediaSource(idleVideo);
    ensureMediaSource(runVideo);
    ensureMediaSource(leapVideo);
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
  const idleFrameWidth = 180;
  const idleFrameHeight = 122;
  const idleFrameCanvas = document.createElement("canvas");
  idleFrameCanvas.width = idleFrameWidth;
  idleFrameCanvas.height = idleFrameHeight;
  const idleFrameContext = idleFrameCanvas.getContext("2d", { willReadFrequently: true });
  const idleCropCanvas = document.createElement("canvas");
  const idleCropContext = idleCropCanvas.getContext("2d");
  let idleFrameStamp = -1;
  let idleStableCrop = null;
  const runFrameWidth = 220;
  const runFrameHeight = 128;
  const runFrameCanvas = document.createElement("canvas");
  runFrameCanvas.width = runFrameWidth;
  runFrameCanvas.height = runFrameHeight;
  const runFrameContext = runFrameCanvas.getContext("2d", { willReadFrequently: true });
  const runCropCanvas = document.createElement("canvas");
  const runCropContext = runCropCanvas.getContext("2d");
  let runFrameStamp = -1;
  let runStableCrop = null;
  const leapFrameWidth = 220;
  const leapFrameHeight = 150;
  const leapFrameCanvas = document.createElement("canvas");
  leapFrameCanvas.width = leapFrameWidth;
  leapFrameCanvas.height = leapFrameHeight;
  const leapFrameContext = leapFrameCanvas.getContext("2d", { willReadFrequently: true });
  const leapCropCanvas = document.createElement("canvas");
  const leapCropContext = leapCropCanvas.getContext("2d");
  let leapFrameStamp = -1;
  let leapStableCrop = null;
  const mrNievesFrameWidth = 220;
  const mrNievesFrameHeight = 170;
  const mrNievesFrameCanvas = document.createElement("canvas");
  mrNievesFrameCanvas.width = mrNievesFrameWidth;
  mrNievesFrameCanvas.height = mrNievesFrameHeight;
  const mrNievesFrameContext = mrNievesFrameCanvas.getContext("2d", { willReadFrequently: true });
  const mrNievesCropCanvas = document.createElement("canvas");
  const mrNievesCropContext = mrNievesCropCanvas.getContext("2d", { willReadFrequently: true });
  const mrNievesFrameStates = {
    idle: { stamp: -1, crop: null },
    run: { stamp: -1, crop: null },
    jump: { stamp: -1, crop: null },
    inAir: { stamp: -1, crop: null },
    celebration: { stamp: -1, crop: null }
  };
  let mrNievesActiveFrameState = "";
  const deathFrameWidth = 230;
  const deathFrameHeight = 170;
  const deathFrameCanvas = document.createElement("canvas");
  deathFrameCanvas.width = deathFrameWidth;
  deathFrameCanvas.height = deathFrameHeight;
  const deathFrameContext = deathFrameCanvas.getContext("2d", { willReadFrequently: true });
  const deathCropCanvas = document.createElement("canvas");
  const deathCropContext = deathCropCanvas.getContext("2d");
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
  const getLevelDurationSeconds = () => Math.min(105, 56 + level * 7);
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
      statusNode.textContent = "Leaderboard name skipped. Press R or Enter to start again.";
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
    leaderboard = normalizeLeaderboard([
      ...leaderboard,
      {
        name: cleanLeaderboardName(name),
        coins: pendingLeaderboardEntry.coins,
        seconds: pendingLeaderboardEntry.seconds,
        difficulty: entryMode,
        createdAt: new Date().toISOString()
      }
    ]);
    pendingLeaderboardEntry = null;
    activeLeaderboardMode = entryMode;
    saveLeaderboard();
    renderLeaderboardList();
    statusNode.textContent = `Leaderboard saved to ${difficultyModes[entryMode].label}. Press R or Enter to start again.`;
    if (leaderboardNameInput) leaderboardNameInput.value = "";
  };
  leaderboard = loadLeaderboard();

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
  const playRockDeathAudio = () => {
    if (musicMuted || musicVolume <= 0) return;
    ensureMediaSource(rockDeathAudio);
    try {
      rockDeathAudio.currentTime = 0;
    } catch {}
    rockDeathAudio.play().catch(() => {});
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
    characterSelectMusic.volume = musicMuted ? 0 : musicVolume * characterSelectMusicLayerVolume;
    characterSelectMusic.muted = musicMuted;
    runningAudio.volume = musicMuted ? 0 : musicVolume * runningLayerVolume;
    runningAudio.muted = musicMuted;
    mrNievesRunningAudio.volume = musicMuted ? 0 : musicVolume * runningLayerVolume;
    mrNievesRunningAudio.muted = musicMuted;
    rockDeathAudio.volume = musicMuted ? 0 : musicVolume * rockDeathLayerVolume;
    rockDeathAudio.muted = musicMuted;
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
      characterSelectMusic.pause();
      stopRunningAudio();
      rockDeathAudio.pause();
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
      characterSelectMusic.pause();
      stopRunningAudio();
      rockDeathAudio.pause();
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
  coinVideo.addEventListener("canplay", keepCoinVideoPlaying);

  const keepFlagVideoPlaying = () => {
    ensureMediaSource(flagVideo, "metadata");
    if (!flagVideo.paused) return;
    flagVideo.play().catch(() => {});
  };
  flagVideo.addEventListener("canplay", keepFlagVideoPlaying);

  const keepIdleVideoPlaying = () => {
    ensureMediaSource(idleVideo);
    if (!idleVideo.paused) return;
    idleVideo.play().catch(() => {});
  };
  idleVideo.addEventListener("canplay", keepIdleVideoPlaying);

  const keepRunVideoPlaying = () => {
    ensureMediaSource(runVideo);
    if (!runVideo.paused) return;
    runVideo.play().catch(() => {});
  };
  runVideo.addEventListener("canplay", keepRunVideoPlaying);

  const keepLeapVideoPlaying = () => {
    ensureMediaSource(leapVideo);
    if (!leapVideo.paused) return;
    leapVideo.play().catch(() => {});
  };
  leapVideo.addEventListener("canplay", keepLeapVideoPlaying);

  const keepMrNievesIdleVideoPlaying = () => {
    ensureMediaSource(mrNievesIdleVideo);
    if (!mrNievesIdleVideo.paused) return;
    mrNievesIdleVideo.play().catch(() => {});
  };
  mrNievesIdleVideo.addEventListener("canplay", keepMrNievesIdleVideoPlaying);

  const keepMrNievesRunVideoPlaying = () => {
    ensureMediaSource(mrNievesRunVideo);
    if (!mrNievesRunVideo.paused) return;
    mrNievesRunVideo.play().catch(() => {});
  };
  mrNievesRunVideo.addEventListener("canplay", keepMrNievesRunVideoPlaying);

  const keepMrNievesInAirVideoPlaying = () => {
    ensureMediaSource(mrNievesInAirVideo);
    if (!mrNievesInAirVideo.paused) return;
    mrNievesInAirVideo.play().catch(() => {});
  };
  mrNievesInAirVideo.addEventListener("canplay", keepMrNievesInAirVideoPlaying);

  const keepMrNievesCelebrationVideoPlaying = () => {
    ensureMediaSource(mrNievesCelebrationVideo);
    if (!mrNievesCelebrationVideo.paused) return;
    mrNievesCelebrationVideo.play().catch(() => {});
  };
  mrNievesCelebrationVideo.addEventListener("canplay", keepMrNievesCelebrationVideoPlaying);

  const keepDeathVideoPlaying = () => {
    ensureMediaSource(deathVideo);
    if (!deathVideo.paused) return;
    deathVideo.play().catch(() => {});
  };
  deathVideo.addEventListener("canplay", keepDeathVideoPlaying);

  const getLavaRockVideoSpecial = index => lavaRockVideoSpecials[index] || lavaRockVideoSpecials[0];

  const keepLavaRockVideoSpecialPlaying = (index = 0) => {
    const video = getLavaRockVideoSpecial(index);
    ensureMediaSource(video);
    if (!video || !video.paused) return;
    video.play().catch(() => {});
  };
  lavaRockVideoSpecials.forEach((video, index) => {
    video.addEventListener("canplay", () => keepLavaRockVideoSpecialPlaying(index));
  });

  const keepBackgroundVideoPlaying = video => {
    ensureMediaSource(video, "metadata");
    if (!video || !video.paused) return;
    video.play().catch(() => {});
  };
  animatedBackgroundVideos.forEach(video => {
    video.addEventListener("canplay", () => keepBackgroundVideoPlaying(video));
  });

  const getTransparentCoinFrame = () => {
    if (coinVideo.readyState < 2 || !coinFrameContext) return null;
    const frameStamp = Math.floor(coinVideo.currentTime * 30);
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
    const frameStamp = Math.floor(flagVideo.currentTime * 30);
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

  const getTransparentIdleFrame = () => {
    if (idleVideo.readyState < 2 || !idleFrameContext) return null;
    const frameStamp = Math.floor(idleVideo.currentTime * 30);
    if (frameStamp === idleFrameStamp) return idleFrameCanvas;
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
      const lowSaturation = brightest - darkest < 112;
      const mutedWarmGray = red > green && red > blue && red - green < 70 && red - blue < 86;
      return !vividColtRed && !blackInk && average > 32 && (lowSaturation || mutedWarmGray);
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
      const mutedWarmGray = red > green && red > blue && red - green < 76 && red - blue < 92;
      return !vividColtRed && !blackInk && average > 36 && (brightest - darkest < 106 || mutedWarmGray);
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
    if (!idleStableCrop && maxX > minX && maxY > minY) {
      const padding = 1;
      idleStableCrop = {
        x: Math.max(0, minX - padding),
        y: Math.max(0, minY - padding),
        w: Math.min(idleFrameWidth - 1, maxX + padding) - Math.max(0, minX - padding) + 1,
        h: Math.min(idleFrameHeight - 1, maxY + padding) - Math.max(0, minY - padding) + 1
      };
    }
    if (idleStableCrop && idleCropContext) {
      const cropW = idleStableCrop.w;
      const cropH = idleStableCrop.h;
      idleCropCanvas.width = cropW;
      idleCropCanvas.height = cropH;
      idleCropContext.clearRect(0, 0, cropW, cropH);
      idleCropContext.putImageData(idleFrameContext.getImageData(idleStableCrop.x, idleStableCrop.y, cropW, cropH), 0, 0);
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
    idleFrameStamp = frameStamp;
    return idleFrameCanvas;
  };

  const getTransparentRunFrame = () => {
    if (runVideo.readyState < 2 || !runFrameContext) return null;
    const frameStamp = Math.floor(runVideo.currentTime * 30);
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

  const getTransparentLeapFrame = () => {
    if (leapVideo.readyState < 2 || !leapFrameContext) return null;
    const frameStamp = Math.floor(leapVideo.currentTime * 30);
    if (frameStamp === leapFrameStamp) return leapFrameCanvas;
    const sourceW = leapVideo.videoWidth || leapFrameWidth;
    const sourceH = leapVideo.videoHeight || leapFrameHeight;
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
    leapFrameContext.drawImage(leapVideo, drawX, drawY, drawW, drawH);
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
      const lowSaturation = brightest - darkest < 116;
      const mutedWarmGray = red > green && red > blue && red - green < 74 && red - blue < 90;
      const paleBackdrop = average > 180 && brightest - darkest < 82;
      return !vividColtRed && !brightHighlight && !blackInk && average > 34 && (lowSaturation || mutedWarmGray || paleBackdrop);
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
      return !vividColtRed && !brightHighlight && !blackInk && average > 44 && brightest - darkest < 104;
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
      const paleGray = average > 108 && brightest - darkest < 98;
      const mutedWarmGray = red >= green - 8 && red >= blue - 8 && red - green < 72 && red - blue < 92 && average > 78;
      return !vividColtRed && !brightHighlight && !blackInk && (paleGray || mutedWarmGray);
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
      if (!leapStableCrop) {
        leapStableCrop = nextCrop;
      } else {
        const cropX = Math.min(leapStableCrop.x, nextCrop.x);
        const cropY = Math.min(leapStableCrop.y, nextCrop.y);
        const cropMaxX = Math.max(leapStableCrop.x + leapStableCrop.w - 1, nextCrop.x + nextCrop.w - 1);
        const cropMaxY = Math.max(leapStableCrop.y + leapStableCrop.h - 1, nextCrop.y + nextCrop.h - 1);
        leapStableCrop = {
          x: cropX,
          y: cropY,
          w: cropMaxX - cropX + 1,
          h: cropMaxY - cropY + 1
        };
      }
    }
    if (leapStableCrop && leapCropContext) {
      const cropW = leapStableCrop.w;
      const cropH = leapStableCrop.h;
      leapCropCanvas.width = cropW;
      leapCropCanvas.height = cropH;
      leapCropContext.clearRect(0, 0, cropW, cropH);
      leapCropContext.putImageData(leapFrameContext.getImageData(leapStableCrop.x, leapStableCrop.y, cropW, cropH), 0, 0);
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
    leapFrameStamp = frameStamp;
    return leapFrameCanvas;
  };

  const getTransparentMrNievesFrame = (sourceMedia, frameStateKey) => {
    const isVideoSource = typeof sourceMedia.readyState === "number";
    const isReady = isVideoSource ? sourceMedia.readyState >= 2 : sourceMedia.complete && sourceMedia.naturalWidth;
    if (!isReady || !mrNievesFrameContext || !mrNievesCropContext) return null;
    const frameState = mrNievesFrameStates[frameStateKey] || mrNievesFrameStates.idle;
    const frameStamp = isVideoSource ? Math.floor(sourceMedia.currentTime * 30) : 0;
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
  const getTransparentMrNievesIdleFrame = () => getTransparentMrNievesFrame(mrNievesIdleVideo, "idle");
  const getTransparentMrNievesRunFrame = () => getTransparentMrNievesFrame(mrNievesRunVideo, "run");
  const getTransparentMrNievesJumpFrame = () => getTransparentMrNievesFrame(mrNievesJumpImage, "jump");
  const getTransparentMrNievesInAirFrame = () => getTransparentMrNievesFrame(mrNievesInAirVideo, "inAir");
  const getTransparentMrNievesCelebrationFrame = () => getTransparentMrNievesFrame(mrNievesCelebrationVideo, "celebration");
  const getTransparentDeathFrame = () => {
    if (deathVideo.readyState < 2 || !deathFrameContext) return null;
    const frameStamp = Math.floor(deathVideo.currentTime * 30);
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
    const frameStamp = Math.floor(video.currentTime * 30);
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
    startingPlatformDeck = platformSprites.map((_, index) => index).filter(index => index !== smallPlatformSpriteIndex);
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
    const choosePlatformSprite = (width, forceSmallPlatform = false) => {
      if (forceSmallPlatform) {
        lastPlatformSprite = smallPlatformSpriteIndex;
        return smallPlatformSpriteIndex;
      }
      const widePlatforms = [0, 2, 6, 7, 9, 11, 12, 13, 14, 15, 18, 19];
      const islandPlatforms = [1, 2, 3, 4, 5, 8, 10, 11, 12, 14, 15, 20];
      const choices = width > 230 ? widePlatforms : islandPlatforms;
      const availableChoices = choices.length > 1 ? choices.filter(choice => choice !== lastPlatformSprite) : choices;
      const sprite = availableChoices[Math.floor(random() * availableChoices.length)];
      lastPlatformSprite = sprite;
      return sprite;
    };
    platforms = [{ x: 0, y: 430, w: 280, h: 34, sprite: currentStartingPlatformSprite }];
    coins = [];
    let x = 280;
    let y = 430;
    while (x < targetX) {
      const difficulty = Math.min(level, 8);
      const smallPlatformChance = difficultyMode === "veryHard" ? 0.55 : difficultyMode === "hard" ? 0.12 : 0;
      const useSmallPlatform = lastPlatformSprite !== smallPlatformSpriteIndex && random() < smallPlatformChance;
      const width = useSmallPlatform ? 72 + random() * 22 : 175 + random() * 115;
      const nextY = Math.max(275, Math.min(438, y + (random() - 0.48) * (88 + difficulty * 4)));
      const upwardDelta = Math.max(0, y - nextY);
      const desiredGap = (92 + difficulty * 2 + random() * (56 + difficulty * 4)) * mode.platformGapScale;
      const fairGapLimit = Math.max(96, maxFairPlatformGap + mode.platformGapBonus - upwardDelta * upwardGapPenalty);
      const gap = Math.min(desiredGap, fairGapLimit);
      y = nextY;
      x += gap;
      platforms.push({ x, y, w: width, h: 30, sprite: choosePlatformSprite(width, useSmallPlatform) });
      if (random() > 0.35) coins.push({ x: x + width * 0.5, y: y - 44, taken: false });
      x += width;
    }
    const last = platforms[platforms.length - 1];
    flag = { x: last.x + last.w - 34, y: last.y - 86 };
    [...new Set(platforms.map(platform => platform.sprite))].forEach(ensurePlatformSprite);
  };

  const triggerColtDeath = (message, options = {}) => {
    if (lost) return;
    lost = true;
    player.vx = 0;
    player.vy = 0;
    player.grounded = false;
    player.state = "death";
    stopRunningAudio();
    deathStartedAt = performance.now();
    deathX = player.x;
    deathFallStartY = Math.min(player.y, canvas.height - player.h + 6);
    deathY = deathFallStartY;
    deathFrameStamp = -1;
    ensureMediaSource(deathVideo);
    try {
      deathVideo.currentTime = 0;
    } catch {}
    keepDeathVideoPlaying();
    if (options.rockHit) playRockDeathAudio();
    statusNode.textContent = message;
  };

  const updateColtDeath = now => {
    if (!deathStartedAt) return;
    const elapsed = Math.max(0, (now - deathStartedAt) / 1000);
    deathY = deathFallStartY + 70 * elapsed + 420 * elapsed * elapsed;
    cameraX = Math.max(0, deathX - 230);
  };

  const coltDeathHasFallen = () => {
    if (!lost || !deathStartedAt) return false;
    return deathY > canvas.height + 70 || performance.now() - deathStartedAt > 1600;
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
      statusNode.textContent = `Top 10 ${difficultyModes[finalDifficulty].label} run: ${finalCoins} coins in ${formatRunTime(finalSeconds)}. Enter your name.`;
      openLeaderboard();
    } else {
      statusNode.textContent = "The Colt lost all coins. Press R or Enter to start again.";
    }
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
    const sprite = getLavaRockSprite(rock);
    const ratio = rock.videoSpecial
      ? 1
      : sprite && sprite.complete && sprite.naturalWidth ? sprite.naturalHeight / sprite.naturalWidth : 1.18;
    const drawW = rock.size;
    const drawH = drawW * ratio;
    return {
      x: rock.x,
      y: rock.y,
      w: drawW,
      h: drawH
    };
  };

  const getLavaRockCoreHitbox = rock => {
    const box = getLavaRockDrawBox(rock);
    const profile = lavaRockHitProfiles[rock.rockType % lavaRockHitProfiles.length] || lavaRockHitProfiles[0];
    return {
      x: box.x + box.w * profile.coreX,
      y: box.y + box.h * profile.coreY,
      rx: box.w * profile.rx,
      ry: box.h * profile.ry
    };
  };

  const getLavaRockCoreHitboxes = rock => {
    if (rock.videoSpecial) {
      const box = getLavaRockDrawBox(rock);
      return lavaRockVideoSpecialHitProfiles.map(profile => ({
        x: box.x + box.w * profile.coreX,
        y: box.y + box.h * profile.coreY,
        rx: box.w * profile.rx,
        ry: box.h * profile.ry
      }));
    }
    if (!rock.shower) return [getLavaRockCoreHitbox(rock)];
    const box = getLavaRockDrawBox(rock);
    const showerProfiles = lavaRockShowerHitProfiles[(rock.showerType || 0) % lavaRockShowerHitProfiles.length] || lavaRockShowerHitProfiles[0];
    return showerProfiles.map(profile => ({
      x: box.x + box.w * profile.coreX,
      y: box.y + box.h * profile.coreY,
      rx: box.w * profile.rx,
      ry: box.h * profile.ry
    }));
  };

  const ellipseHitsRect = (ellipse, rect) => {
    const closestX = Math.max(rect.left, Math.min(ellipse.x, rect.right));
    const closestY = Math.max(rect.top, Math.min(ellipse.y, rect.bottom));
    const normalizedX = (closestX - ellipse.x) / ellipse.rx;
    const normalizedY = (closestY - ellipse.y) / ellipse.ry;
    return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
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
    const rockType = Math.floor(Math.random() * lavaRockSprites.length);
    ensureLavaRockSprite(rockType);
    const baseSize = 116 + Math.random() * 32 + difficulty * 2;
    const size = baseSize * (lavaRockSizeMultipliers[rockType] || 1);
    const minX = forwardSpawn ? Math.max(cameraX + canvas.width * 0.48, player.x + 170) : cameraX + 54;
    const maxX = forwardSpawn ? cameraX + canvas.width + 260 - size : cameraX + canvas.width - size - 36;
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
    const isWideShower = showerType === 1;
    ensureLavaRockShowerSprite(showerType);
    const size = isWideShower
      ? Math.min(canvas.width * 0.72, 620 + difficulty * 12)
      : Math.min(canvas.width * 0.52, 430 + difficulty * 8);
    const minX = Math.max(cameraX + canvas.width * (isWideShower ? 0.02 : 0.08), player.x + 120);
    const maxX = cameraX + canvas.width * (isWideShower ? 0.32 : 0.48);
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
    const size = Math.min(canvas.width * 0.52, 430 + difficulty * 8);
    const minX = Math.max(cameraX + canvas.width * 0.08, player.x + 140);
    const maxX = cameraX + canvas.width * 0.48;
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

  const updateLavaRocks = now => {
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
        const firstX = cameraX + canvas.width * 0.38 + Math.random() * Math.max(1, canvas.width * 0.68);
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
        const specialChoice = Math.floor(Math.random() * (lavaRockVideoSpecials.length + 2));
        if (specialChoice < lavaRockVideoSpecials.length) spawnLavaRockVideoSpecial(now, specialChoice);
        else spawnLavaRockShower(now, specialChoice - lavaRockVideoSpecials.length);
      }
      scheduleNextLavaRockShower(now);
    }
    const hasForwardCoverage = fallingLavaRocks.some(rock => {
      return getLavaRockCoreHitboxes(rock).some(hitbox => (
        hitbox.x > player.x + player.w &&
        hitbox.x < cameraX + canvas.width + 180 &&
        hitbox.y < canvas.height * 0.74
      ));
    });
    if (!hasForwardCoverage && player.vx > moveSpeed * 0.65 && fallingLavaRocks.length < maxActiveRocks && now >= nextForwardLavaRockAt) {
      spawnLavaRock(now, player.x + 230 + Math.random() * 260, true);
      nextForwardLavaRockAt = now + mode.forwardCooldown;
    }
    fallingLavaRocks = fallingLavaRocks.filter(rock => {
      rock.x += rock.vx;
      rock.y += rock.vy;
      rock.angle += rock.spin * 0.08;
      const box = getLavaRockDrawBox(rock);
      const screenX = box.x - cameraX;
      return box.y < canvas.height + box.h + 80 && screenX > -box.w - 220 && screenX < canvas.width + 360;
    });
  };

  const resetLevel = (newSeed = false, keepRun = false) => {
    if (newSeed) {
      levelSeed = Date.now() + Math.floor(Math.random() * 9999);
      chooseLevelBackground();
      chooseStartingPlatformSprite();
    }
    ensureBackgroundSprite(currentBackgroundIndex);
    animatedBackgroundReadyAt = performance.now() + 1200;
    generateLevel();
    Object.assign(player, { x: 48, y: 300, vx: 0, vy: 0, grounded: false, groundPlatform: null, facing: 1, state: "idle", jumpPrepUntil: 0 });
    cameraX = 0;
    if (!keepRun) {
      score = 0;
      runTimeBankSeconds = 0;
      pendingLeaderboardEntry = null;
      leaderboardOpenedAt = 0;
      if (leaderboardPanel) leaderboardPanel.hidden = true;
    }
    won = false;
    lost = false;
    deathLeaderboardHandled = false;
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
    lavaRockVideoSpecials.forEach(video => video.pause());
    lavaRockVideoFrameStamp = -1;
    lavaRockVideoFrameSource = -1;
    levelStart = performance.now();
    levelDurationSeconds = getLevelDurationSeconds();
    statusNode.textContent = "Use arrow keys or WASD to move. Space or up arrow jumps. Reach the flag before time runs out.";
    levelNode.textContent = level;
    scoreNode.textContent = score;
    timeNode.textContent = levelDurationSeconds.toFixed(1);
    if (nextLevelButton) nextLevelButton.disabled = true;
    canvas.focus({ preventScroll: true });
  };

  const nextLevel = () => {
    level += 1;
    resetLevel(true, true);
  };

  const drawDeathColt = () => {
    const isMrNieves = selectedCharacter === "mrNieves";
    const drawW = (isMrNieves ? 138 : 178) * deathColtDrawScale;
    const drawH = (isMrNieves ? 166 : 132) * deathColtDrawScale;
    const x = Math.round(deathX - cameraX + player.w / 2);
    const y = Math.round(deathY + player.h - drawH + (isMrNieves ? 22 : 8));
    const deathFrame = isMrNieves ? getTransparentMrNievesIdleFrame() : getTransparentDeathFrame();
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(player.facing, 1);
    ctx.shadowColor = "rgba(0, 0, 0, 0.44)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 8;
    if (deathFrame) {
      if (isMrNieves) keepMrNievesIdleVideoPlaying();
      else keepDeathVideoPlaying();
      ctx.drawImage(deathFrame, -drawW / 2, 0, drawW, drawH);
    } else if (coltSprites.leap.complete && coltSprites.leap.naturalWidth) {
      ctx.drawImage(coltSprites.leap, -drawW / 2, 0, drawW, drawH);
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
    if (spriteIndex === 8) return 6;
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
    const drawW = isMrNieves ? (mrNievesIsJumping ? 154 : mrNievesIsInAir ? 150 : mrNievesIsCelebrating ? 132 : mrNievesIsRunning ? 128 : 128) : player.state === "idle" ? 154 : player.state === "run" ? 170 : player.state === "leap" ? 164 : player.state === "jumpPrep" ? 132 : 124;
    const drawH = isMrNieves ? (mrNievesIsJumping ? 142 : mrNievesIsInAir ? 140 : mrNievesIsCelebrating ? 154 : mrNievesIsRunning ? 154 : 154) : player.state === "idle" ? 104 : player.state === "run" ? 100 : player.state === "leap" ? 112 : player.state === "jumpPrep" ? 100 : 84;
    const x = Math.round(player.x - cameraX + player.w / 2);
    const y = Math.round(player.y + player.h - drawH + (isMrNieves ? 10 + getMrNievesPlatformVisualOffset() : 8));
    ctx.save();
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
    if (mrNievesFrame) {
      if (mrNievesIsCelebrating && mrNievesCelebrationVideo.readyState >= 2) keepMrNievesCelebrationVideoPlaying();
      else if (mrNievesIsInAir && mrNievesInAirVideo.readyState >= 2) keepMrNievesInAirVideoPlaying();
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
    } else if (sprite.complete && sprite.naturalWidth) {
      ctx.drawImage(sprite, -drawW / 2, 0, drawW, drawH);
    } else {
      ctx.fillStyle = "#7b0b31";
      ctx.fillRect(-player.w / 2, drawH - player.h, player.w, player.h);
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
    drawSelectPreview(selectColtCanvas, getTransparentIdleFrame(), 132, 96);
    drawSelectPreview(selectMrNievesCanvas, getTransparentMrNievesIdleFrame(), 116, 132, 4);
  };

  const drawCoverImage = image => {
    const w = canvas.width;
    const h = canvas.height;
    if (!image.complete || !image.naturalWidth) return false;
    const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
    const drawW = image.naturalWidth * scale;
    const drawH = image.naturalHeight * scale;
    const drawX = (w - drawW) / 2;
    const drawY = (h - drawH) / 2;
    ctx.drawImage(image, drawX, drawY, drawW, drawH);
    return true;
  };

  const drawCoverVideo = video => {
    const w = canvas.width;
    const h = canvas.height;
    if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) return false;
    const scale = Math.max(w / video.videoWidth, h / video.videoHeight);
    const drawW = video.videoWidth * scale;
    const drawH = video.videoHeight * scale;
    const drawX = (w - drawW) / 2;
    const drawY = (h - drawH) / 2;
    ctx.drawImage(video, drawX, drawY, drawW, drawH);
    return true;
  };

  const drawLevelBackground = () => {
    const w = canvas.width;
    const h = canvas.height;
    const background = ensureBackgroundSprite(currentBackgroundIndex);
    const animatedBackground = animatedBackgroundVideos[currentBackgroundIndex];
    const useAnimatedBackground = animatedBackground && performance.now() >= animatedBackgroundReadyAt;
    if (useAnimatedBackground) keepBackgroundVideoPlaying(animatedBackground);
    const backgroundDrawn = useAnimatedBackground
      ? drawCoverVideo(animatedBackground) || drawCoverImage(background)
      : drawCoverImage(background);
    if (backgroundDrawn) {
      const vignette = ctx.createRadialGradient(w * 0.5, h * 0.45, h * 0.12, w * 0.5, h * 0.45, h * 0.78);
      vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
      vignette.addColorStop(1, "rgba(0, 0, 0, 0.32)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);
      return;
    }
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#101014");
    sky.addColorStop(0.55, "#211017");
    sky.addColorStop(1, "#08080a");
    ctx.fillStyle = sky;
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
    if (screenX > canvas.width + 260 || screenX + box.w < -220 || box.y > canvas.height + 160) return;
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
    const w = canvas.width;
    const h = canvas.height;
    drawLevelBackground();
    platforms.forEach(platform => {
      const x = platform.x - cameraX;
      if (x > w + 160 || x + platform.w < -160) return;
      drawPlatform(platform);
    });
    coins.forEach(coin => {
      if (coin.taken) return;
      const x = coin.x - cameraX;
      if (x < -40 || x > w + 40) return;
      const coinSize = 58;
      const transparentCoinFrame = getTransparentCoinFrame();
      if (transparentCoinFrame) {
        keepCoinVideoPlaying();
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
    const flagX = flag.x - cameraX;
    const transparentFlagFrame = getTransparentFlagFrame();
    if (transparentFlagFrame) {
      keepFlagVideoPlaying();
      const flagDrawW = 118;
      const flagDrawH = 132;
      ctx.save();
      ctx.shadowColor = "rgba(255, 82, 21, 0.45)";
      ctx.shadowBlur = 16;
      ctx.drawImage(transparentFlagFrame, flagX - 31, flag.y - 38, flagDrawW, flagDrawH);
      ctx.restore();
    } else {
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
      ctx.fillStyle = "#f8dce8";
      ctx.font = "900 48px Arial";
      ctx.textAlign = "center";
      ctx.fillText(won ? "Finish Flag Reached!" : "Try Again", w / 2, h / 2 - 10);
      ctx.font = "800 20px Arial";
      ctx.fillText(won ? "Press Enter for Next Level or R to Restart." : "Press R or Enter to Restart.", w / 2, h / 2 + 28);
    }
  };

  const update = () => {
    const now = performance.now();
    if (leaderboardPanel && !leaderboardPanel.hidden && !pendingLeaderboardEntry && !won && !lost) {
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
      const elapsedSeconds = (now - levelStart) / 1000;
      const remainingSeconds = Math.max(0, levelDurationSeconds - elapsedSeconds);
      if (remainingSeconds <= 0) {
        triggerColtDeath("Time ran out. Restart and try for the flag again.");
        timeNode.textContent = "0.0";
        draw();
        animationId = requestAnimationFrame(update);
        return;
      }
      const wasGrounded = player.grounded;
      player.vx = 0;
      if (keys.left) {
        player.vx = -moveSpeed;
        player.facing = -1;
      }
      if (keys.right) {
        player.vx = moveSpeed;
        player.facing = 1;
      }
      if (keys.jump && player.grounded) {
        player.vy = jumpPower;
        player.grounded = false;
        player.state = "jumpPrep";
        player.jumpPrepUntil = now + 150;
        stopRunningAudio();
      }
      player.vy += gravity;
      player.x += player.vx;
      player.y += player.vy;
      player.x = Math.max(0, player.x);
      const previousGroundPlatform = player.groundPlatform;
      player.grounded = false;
      player.groundPlatform = null;
      platforms.forEach(platform => {
        const spriteIndex = platform.sprite % platformSprites.length;
        const withinX = player.x + player.w > platform.x && player.x < platform.x + platform.w;
        const footX = Math.max(platform.x, Math.min(platform.x + platform.w, player.x + player.w / 2));
        const surfaceY = getPlatformSurfaceY(platform, footX);
        const stayedOnPlatform = spriteIndex === 7 && wasGrounded && previousGroundPlatform === platform;
        const wasAbove = player.y + player.h - player.vy <= surfaceY + (stayedOnPlatform ? 12 : 0);
        const hitTop = player.y + player.h >= surfaceY - (stayedOnPlatform ? 12 : 0) && player.y + player.h <= surfaceY + platform.h + 12;
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
        const dy = player.y + player.h / 2 - coin.y;
        if (Math.hypot(dx, dy) < 40) {
          coin.taken = true;
          score += 10;
          scoreNode.textContent = score;
        }
      });
      updateLavaRocks(now);
      if (!lost) {
        const coltHitbox = getColtHazardHitbox();
        for (const rock of fallingLavaRocks) {
          if (getLavaRockCoreHitboxes(rock).some(hitbox => ellipseHitsRect(hitbox, coltHitbox))) {
            triggerColtDeath("The Colt was hit by a lava rock. Restart and try again.", { rockHit: true });
            break;
          }
        }
      }
      if (!lost && player.x + player.w > flag.x && player.y + player.h > flag.y && player.y < flag.y + 90) {
        runTimeBankSeconds += Math.max(0, (performance.now() - levelStart) / 1000);
        won = true;
        fallingLavaRocks = [];
        nextLavaRockAt = 0;
        nextForwardLavaRockAt = 0;
        nextLavaRockShowerAt = 0;
        player.vx = 0;
        player.vy = 0;
        player.grounded = true;
        player.state = selectedCharacter === "mrNieves" ? "celebrate" : "idle";
        if (selectedCharacter === "mrNieves") {
          ensureMediaSource(mrNievesCelebrationVideo);
          if (mrNievesCelebrationVideo.readyState >= 1) mrNievesCelebrationVideo.currentTime = 0;
          keepMrNievesCelebrationVideoPlaying();
        }
        stopRunningAudio();
        scoreNode.textContent = score;
        if (nextLevelButton) nextLevelButton.disabled = false;
        statusNode.textContent = "You reached the finish flag. Press Enter or Next Level to keep your coins going.";
      }
      if (!lost && player.y > canvas.height - 36) {
        triggerColtDeath("The Colt fell. Restart and try a new route.");
      }
      cameraX = Math.max(0, player.x - 230);
      timeNode.textContent = remainingSeconds.toFixed(1);
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
    if (event.target instanceof HTMLElement && event.target.closest("#coltRunLeaderboardForm")) return;
    if (event.target instanceof HTMLElement && event.target.closest(".colt-run-volume")) return;
    if (characterSelectOpen) return;
    playColtRunAudio();
    if (event.code === "Enter") {
      event.preventDefault();
      if (won) nextLevel();
      else if (lost) {
        if (pendingLeaderboardEntry) openLeaderboard();
        else resetLevel(false);
      }
      else statusNode.textContent = "Reach the finish flag first, then Enter starts the next level.";
      return;
    }
    if (event.code === "KeyR") {
      event.preventDefault();
      if (pendingLeaderboardEntry) {
        openLeaderboard();
        return;
      }
      resetLevel(false);
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
    playColtRunAudio();
    if (button.dataset.coltRun === "fullscreen") toggleFullscreen();
    if (button.dataset.coltRun === "leaderboard") openLeaderboard();
    if (button.dataset.coltRun === "closeLeaderboard") closeLeaderboard();
    if (button.dataset.coltRun === "restart") {
      if (pendingLeaderboardEntry) openLeaderboard();
      else resetLevel(false);
    }
    if (button.dataset.coltRun === "new") {
      if (won) nextLevel();
      else statusNode.textContent = "Reach the finish flag first, then Next Level unlocks.";
    }
  };
  const onLeaderboardSubmit = event => {
    event.preventDefault();
    savePendingLeaderboardEntry(leaderboardNameInput ? leaderboardNameInput.value : "");
    canvas.focus({ preventScroll: true });
  };
  const isFullscreen = () => document.fullscreenElement === stage;
  const updateFullscreenButton = () => {
    fullscreenButtons.forEach(button => {
      button.textContent = isFullscreen() ? "Exit Fullscreen" : "⛶ Fullscreen";
    });
    if (isFullscreen()) canvas.focus({ preventScroll: true });
  };
  const toggleFullscreen = () => {
    if (!stage || !document.fullscreenEnabled) return;
    if (isFullscreen()) {
      document.exitFullscreen?.();
      return;
    }
    stage.requestFullscreen?.().then(() => {
      canvas.focus({ preventScroll: true });
      updateFullscreenButton();
    }).catch(() => {
      statusNode.textContent = "Fullscreen is not available in this browser.";
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

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", clearTouchKeys);
  document.addEventListener("fullscreenchange", updateFullscreenButton);
  app.addEventListener("click", onButtonClick);
  if (leaderboardForm) leaderboardForm.addEventListener("submit", onLeaderboardSubmit);
  updateDifficultyButtons();
  updateCharacterButtons();
  ensureMediaSource(idleVideo);
  ensureMediaSource(mrNievesIdleVideo);
  scheduleMediaLoad(coinVideo, 1800);
  scheduleMediaLoad(flagVideo, 2600);
  resetLevel(true);
  openCharacterSelect();
  update();
  coltRunGame = {
    stop() {
      cancelAnimationFrame(animationId);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
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
      inGameMusic.removeEventListener("ended", onInGameMusicEnded);
      [
        ambientAudio,
        inGameMusic,
        characterSelectMusic,
        runningAudio,
        mrNievesRunningAudio,
        rockDeathAudio,
        coinVideo,
        flagVideo,
        idleVideo,
        runVideo,
        leapVideo,
        mrNievesIdleVideo,
        mrNievesRunVideo,
        mrNievesInAirVideo,
        mrNievesCelebrationVideo,
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
      <form id="pinForm" class="form-grid">
        <div class="field">
          <label for="pinInput">PIN</label>
          <input id="pinInput" type="password" inputmode="numeric" autocomplete="current-password" maxlength="8">
        </div>
        <p id="pinError" class="error"></p>
        <button class="primary-btn" type="submit">Enter Teacher Mode</button>
      </form>
    </section>
  `;
}

function renderDashboard() {
  const sorted = [...links].sort((a, b) => `${a.category}${a.title}`.localeCompare(`${b.category}${b.title}`));
  return `
    ${pageHeader("Teacher Dashboard", "", true)}
    <section class="dashboard-actions">
      <button class="primary-btn" data-action="add">+ Add Website</button>
      <button class="outline-btn" data-action="changePin"> Change PIN</button>
      <button class="outline-btn" data-action="reset">↺ Reset Sample Links</button>
    </section>
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
    <h2 class="section-title">Student Website Requests</h2>
    <section class="teacher-list">
      ${websiteRequests.length ? websiteRequests.map(renderWebsiteRequest).join("") : emptyCard("No student website requests yet.")}
    </section>
    <h2 class="section-title">Manage Links</h2>
    <section class="teacher-list">
      ${sorted.map(renderTeacherLink).join("")}
    </section>
  `;
}

function renderWebsiteRequest(request) {
  const submitted = formatShortDate(request.createdAt);
  return `
    <article class="request-card">
      <div>
        <h3>${escapeHtml(request.websiteName)}</h3>
        <p class="meta">${escapeHtml(request.studentName)} • Grade ${escapeHtml(request.grade)}</p>
        ${submitted ? `<p class="url-text">Requested ${escapeHtml(submitted)}</p>` : ""}
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
      <p class="meta">Started by ${escapeHtml(thread.studentName)} • Grade ${escapeHtml(thread.grade)}${submitted ? ` • ${escapeHtml(submitted)}` : ""}${muted ? " • Muted" : ""}</p>
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
      <p class="meta">${escapeHtml(reply.studentName)} • Grade ${escapeHtml(reply.grade)}${submitted ? ` • ${escapeHtml(submitted)}` : ""}${muted ? " • Muted" : ""}</p>
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
          <input id="newPin" type="password" inputmode="numeric" maxlength="8" autocomplete="new-password">
        </div>
        <div class="field">
          <label for="confirmPin">Confirm PIN</label>
          <input id="confirmPin" type="password" inputmode="numeric" maxlength="8" autocomplete="new-password">
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
  document.body.dataset.theme = theme;
  let html = "";
  if (screen.name === "home") html = renderHome();
  if (screen.name === "category") html = renderCategory(screen.category);
  if (screen.name === "coltRun") html = renderColtRun();
  if (screen.name === "coltCorner") html = renderColtCornerPage();
  if (screen.name === "thread") html = renderThreadDetail(screen.id);
  if (screen.name === "pin") html = renderPin();
  if (screen.name === "dashboard") html = renderDashboard();
  if (screen.name === "edit") html = renderEdit(screen.id);
  if (screen.name === "changePin") html = renderChangePin();
  app.innerHTML = html + renderClassTimerBadge() + renderModal();
  attachScreenHandlers();
  observeDeferredVideos(app);
}

function attachScreenHandlers() {
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
    });
  }

  attachStudentRequestForm();
  attachThreadForm();
  attachReplyForm();
  startCalendarClock();
  startClassTimerClock();
  if (screen.name === "coltRun") startColtRunGame();

  const pinForm = document.getElementById("pinForm");
  if (pinForm) {
    pinForm.addEventListener("submit", event => {
      event.preventDefault();
      const input = document.getElementById("pinInput");
      const error = document.getElementById("pinError");
      if (input.value === store.getPin() || input.value === DEFAULT_TEACHER_PIN) {
        store.setPin(input.value);
        setScreen({ name: "dashboard" });
      }
      else error.textContent = "That PIN did not match.";
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
    changePinForm.addEventListener("submit", event => {
      event.preventDefault();
      const pin = document.getElementById("newPin").value.replace(/\D/g, "");
      const confirm = document.getElementById("confirmPin").value.replace(/\D/g, "");
      const error = document.getElementById("pinChangeError");
      if (pin.length < 4) error.textContent = "Use at least four digits.";
      else if (pin !== confirm) error.textContent = "The PIN entries do not match.";
      else {
        store.setPin(pin);
        setScreen({ name: "dashboard" });
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
      studentName: document.getElementById("requestStudentName").value.trim(),
      grade: document.getElementById("requestGrade").value.trim(),
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
    message.textContent = "Request sent to Teacher Dashboard.";
    message.classList.remove("error");
  });
}

function attachThreadForm() {
  const threadForm = document.getElementById("threadForm");
  if (!threadForm || threadForm.dataset.ready === "true") return;
  threadForm.dataset.ready = "true";
  threadForm.addEventListener("submit", event => {
    event.preventDefault();
    const thread = {
      id: makeId(),
      studentName: document.getElementById("threadStudentName").value.trim(),
      grade: document.getElementById("threadGrade").value.trim(),
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
      return;
    }
    saveClassThreads([thread, ...classThreads], false);
    threadForm.reset();
    status.textContent = "Topic started.";
    status.classList.remove("error");
    const list = document.querySelector(".thread-list");
    if (list) list.outerHTML = renderThreadTable(sortedThreads());
  });
}

function attachReplyForm() {
  const replyForm = document.getElementById("replyForm");
  if (!replyForm || replyForm.dataset.ready === "true") return;
  replyForm.dataset.ready = "true";
  replyForm.addEventListener("submit", event => {
    event.preventDefault();
    const reply = {
      id: makeId(),
      studentName: document.getElementById("replyStudentName").value.trim(),
      grade: document.getElementById("replyGrade").value.trim(),
      message: document.getElementById("replyMessage").value.trim(),
      createdAt: new Date().toISOString()
    };
    const status = document.getElementById("replyStatus");
    const error = validateThreadReply(reply);
    if (error) {
      status.textContent = error;
      status.classList.add("error");
      return;
    }
    const threadId = replyForm.dataset.threadId;
    saveClassThreads(classThreads.map(thread => {
      if (thread.id !== threadId) return thread;
      return { ...thread, replies: [...getThreadReplies(thread), reply] };
    }), false);
    replyForm.reset();
    status.textContent = "Reply posted.";
    status.classList.remove("error");
    const updated = classThreads.find(thread => thread.id === threadId);
    const list = document.querySelector(".thread-reply-list");
    if (updated && list) {
      const replies = getThreadReplies(updated);
      list.innerHTML = `
        <h3>${escapeHtml(`${replies.length} ${replies.length === 1 ? "Reply" : "Replies"}`)}</h3>
        ${replies.map(renderThreadReply).join("")}
      `;
    }
  });
}

function validateThreadTopic(thread) {
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
  if (!request.websiteName) return "Please add the website name.";
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

app.addEventListener("click", event => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;

  if (action === "back") {
    if (screen.name === "thread") setScreen({ name: "coltCorner" });
    else if (["dashboard", "category", "pin", "coltCorner", "coltRun"].includes(screen.name)) setScreen({ name: "home" });
    else setScreen({ name: "dashboard" });
  }
  if (action === "teacher") setScreen({ name: "pin" });
  if (action === "toggleTheme") toggleTheme();
  if (action === "category") setScreen({ name: "category", category: target.dataset.category });
  if (action === "randomActivity") {
    if (randomActivitySettings.locked) return;
    randomActivity = pickRandomActivity();
    const card = document.getElementById("randomActivityCard");
    if (card) card.outerHTML = renderRandomActivityCard();
    observeDeferredVideos(app);
  }
  if (action === "openColtCorner") setScreen({ name: "coltCorner" });
  if (action === "openColtRun") setScreen({ name: "coltRun" });
  if (action === "openThread") setScreen({ name: "thread", id: target.dataset.id });
  if (action === "open") window.open(target.dataset.url, "_blank", "noopener,noreferrer");
  if (action === "add") setScreen({ name: "edit", id: null });
  if (action === "edit") setScreen({ name: "edit", id: target.dataset.id });
  if (action === "changePin") setScreen({ name: "changePin" });
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
    saveClassThreads(classThreads.filter(item => item.id !== target.dataset.id));
  }
  if (action === "deleteReply") {
    saveClassThreads(classThreads.map(thread => {
      if (thread.id !== target.dataset.threadId) return thread;
      return { ...thread, replies: getThreadReplies(thread).filter(reply => reply.id !== target.dataset.replyId) };
    }));
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

render();
startSharedSync();







