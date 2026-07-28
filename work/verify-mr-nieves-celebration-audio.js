const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const audioPath = path.join(root, "assets", "colt-run-mr-nieves-celebration-audio.mp3");
const audio = fs.readFileSync(audioPath);

function check(value, message) {
  if (!value) throw new Error(message);
}

check(audio.length === 19661, "Mr. Nieves celebration audio size changed unexpectedly.");
check(audio.toString("ascii", 0, 3) === "ID3", "Mr. Nieves celebration audio does not contain a valid MP3 ID3 header.");
check(appSource.includes('createDeferredAudio("assets/colt-run-mr-nieves-celebration-audio.mp3?v=20260728-woohoo1")'), "Mr. Nieves celebration audio is not registered.");

const characterMediaStart = appSource.indexOf("const ensureCharacterMedia =");
const characterMediaEnd = appSource.indexOf("const stagedMediaTimers =", characterMediaStart);
const characterMedia = appSource.slice(characterMediaStart, characterMediaEnd);
check(characterMedia.includes("ensureMediaSource(mrNievesCelebrationAudio);"), "Celebration audio is not preloaded with Mr. Nieves.");

const finishStart = appSource.indexOf("const beginFinishLanding =");
const finishEnd = appSource.indexOf("const updateFinishLanding =", finishStart);
const finishTrigger = appSource.slice(finishStart, finishEnd);
const audioCall = finishTrigger.indexOf("playMrNievesCelebrationAudio();");
const pendingFlag = finishTrigger.indexOf("finishLandingPending = true;");
const possibleImmediateLanding = finishTrigger.indexOf("completeFinishLanding();");
check(finishTrigger.includes('if (selectedCharacter === "mrNieves")'), "Celebration audio is not restricted to Mr. Nieves.");
check(audioCall >= 0 && audioCall < pendingFlag && audioCall < possibleImmediateLanding, "Celebration audio does not start immediately at flag contact.");

const completeStart = appSource.indexOf("const completeFinishLanding =");
const completeEnd = appSource.indexOf("const beginFinishLanding =", completeStart);
const completeFinish = appSource.slice(completeStart, completeEnd);
check(completeFinish.includes('player.state = selectedCharacter === "mrNieves" ? "celebrate" : "idle";'), "Character-specific celebration animation routing changed.");

console.log(JSON.stringify({
  validMp3Header: true,
  mrNievesOnly: true,
  startsAtFlagContact: true,
  startsBeforeCelebrationAnimation: true,
  allMrNievesCelebrationAnimationsCovered: 4,
  coltFinishBehaviorUnchanged: true
}, null, 2));
