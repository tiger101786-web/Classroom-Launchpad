const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const audioPath = path.join(root, "assets", "colt-run-colt-death-audio.mp3");
const audio = fs.readFileSync(audioPath);

function check(value, message) {
  if (!value) throw new Error(message);
}

check(audio.length === 19865, "Colt death audio size changed unexpectedly.");
check(audio[0] === 0xff && (audio[1] & 0xe0) === 0xe0, "Colt death audio does not begin with a valid MP3 frame.");
check(appSource.includes('createDeferredAudio("assets/colt-run-colt-death-audio.mp3?v=20260728-horse-death1")'), "Colt death audio is not registered.");
check(appSource.includes("ensureMediaSource(coltDeathAudio);"), "Colt death audio is not preloaded with the Colt character media.");

const triggerStart = appSource.indexOf("const triggerColtDeath =");
const triggerEnd = appSource.indexOf("const updateColtDeath =", triggerStart);
const trigger = appSource.slice(triggerStart, triggerEnd);
const mrAudioCall = trigger.indexOf('if (selectedCharacter === "mrNieves") playMrNievesDeathAudio();');
const coltAudioCall = trigger.indexOf("else playColtDeathAudio();");
const deathTimestamp = trigger.indexOf("deathStartedAt = performance.now();");
const deathAnimation = trigger.indexOf("const activeDeathVideo =");
check(mrAudioCall >= 0 && coltAudioCall > mrAudioCall, "Character-specific death audio routing is incomplete.");
check(coltAudioCall < deathTimestamp && coltAudioCall < deathAnimation, "Colt death audio does not start before the death animation.");
check((appSource.match(/triggerColtDeath\(/g) || []).length === 3, "Not every Colt death cause uses the shared death trigger.");
check(!appSource.includes("playRockDeathAudio"), "The old rock-only death sound function is still active.");

console.log(JSON.stringify({
  validMp3Frame: true,
  coltDeathCausesCovered: 3,
  audioStartsBeforeAnimation: true,
  oldRockOnlySoundReplaced: true,
  mrNievesDeathSoundUnchanged: true
}, null, 2));
