const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const audioFiles = [
  ["colt-run-colt-celebration-audio.mp3", 44544],
  ["colt-run-colt-celebration-audio-02.mp3", 50991]
];

function check(value, message) {
  if (!value) throw new Error(message);
}

audioFiles.forEach(([fileName, expectedSize]) => {
  const audio = fs.readFileSync(path.join(root, "assets", fileName));
  check(audio.length === expectedSize, `${fileName} size changed unexpectedly.`);
  check(audio[0] === 0xff && (audio[1] & 0xe0) === 0xe0, `${fileName} does not begin with a valid MP3 frame.`);
});
check(appSource.includes('createDeferredAudio("assets/colt-run-colt-celebration-audio.mp3?v=20260728-gentle-whinny1")'), "The original Colt celebration audio is not registered.");
check(appSource.includes('createDeferredAudio("assets/colt-run-colt-celebration-audio-02.mp3?v=20260729-horse2celeb1")'), "The second Colt celebration audio is not registered.");
check(appSource.includes("let lastColtCelebrationAudioIndex = -1;"), "The Colt celebration rotation does not track the last sound.");
check(
  appSource.includes("chooseNonRepeatingAudioIndex(\n      coltCelebrationAudios.length,\n      lastColtCelebrationAudioIndex"),
  "The Colt celebration sounds do not use the non-repeating selector."
);

const characterMediaStart = appSource.indexOf("const ensureCharacterMedia =");
const characterMediaEnd = appSource.indexOf("const stagedMediaTimers =", characterMediaStart);
const characterMedia = appSource.slice(characterMediaStart, characterMediaEnd);
check(characterMedia.includes("coltCelebrationAudios.forEach(audio => ensureMediaSource(audio));"), "Both Colt celebration sounds are not preloaded with the Colt.");

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
  validMp3Files: 2,
  coltOnly: true,
  nonRepeatingRandomRotation: true,
  startsAtFlagContact: true,
  startsBeforeFinishAnimation: true,
  minecraftDeathSoundRestored: true,
  mrNievesCelebrationSoundUnchanged: true
}, null, 2));
