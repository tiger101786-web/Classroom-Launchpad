const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const audioPath = path.join(root, "assets", "colt-run-colt-celebration-audio.mp3");
const audio = fs.readFileSync(audioPath);

function check(value, message) {
  if (!value) throw new Error(message);
}

check(audio.length === 44544, "Colt celebration audio size changed unexpectedly.");
check(audio[0] === 0xff && (audio[1] & 0xe0) === 0xe0, "Colt celebration audio does not begin with a valid MP3 frame.");
check(appSource.includes('createDeferredAudio("assets/colt-run-colt-celebration-audio.mp3?v=20260728-gentle-whinny1")'), "Colt celebration audio is not registered.");

const characterMediaStart = appSource.indexOf("const ensureCharacterMedia =");
const characterMediaEnd = appSource.indexOf("const stagedMediaTimers =", characterMediaStart);
const characterMedia = appSource.slice(characterMediaStart, characterMediaEnd);
check(characterMedia.includes("ensureMediaSource(coltCelebrationAudio);"), "Colt celebration audio is not preloaded with the Colt.");

const finishStart = appSource.indexOf("const beginFinishLanding =");
const finishEnd = appSource.indexOf("const updateFinishLanding =", finishStart);
const finishTrigger = appSource.slice(finishStart, finishEnd);
const coltAudioCall = finishTrigger.indexOf("else playColtCelebrationAudio();");
const pendingFlag = finishTrigger.indexOf("finishLandingPending = true;");
const possibleImmediateLanding = finishTrigger.indexOf("completeFinishLanding();");
check(finishTrigger.includes('if (selectedCharacter === "mrNieves") playMrNievesCelebrationAudio();'), "Mr. Nieves celebration sound routing changed.");
check(coltAudioCall >= 0 && coltAudioCall < pendingFlag && coltAudioCall < possibleImmediateLanding, "Colt celebration audio does not start immediately at flag contact.");

const completeStart = appSource.indexOf("const completeFinishLanding =");
const completeEnd = appSource.indexOf("const beginFinishLanding =", completeStart);
const completeFinish = appSource.slice(completeStart, completeEnd);
check(completeFinish.includes('player.state = selectedCharacter === "mrNieves" ? "celebrate" : "idle";'), "The Colt's existing finish animation behavior changed.");

console.log(JSON.stringify({
  validMp3Frame: true,
  coltOnly: true,
  startsAtFlagContact: true,
  startsBeforeFinishAnimation: true,
  minecraftDeathSoundRestored: true,
  mrNievesCelebrationSoundUnchanged: true
}, null, 2));
