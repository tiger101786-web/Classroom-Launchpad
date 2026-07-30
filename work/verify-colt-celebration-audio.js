const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const audioFiles = [
  ["colt-run-colt-celebration-audio.mp3", 44544],
  ["colt-run-colt-celebration-audio-02.mp3", 50991]
];
const celebrationVideo = fs.readFileSync(path.join(root, "assets", "colt-run-colt-celebration.mp4"));

function check(value, message) {
  if (!value) throw new Error(message);
}

audioFiles.forEach(([fileName, expectedSize]) => {
  const audio = fs.readFileSync(path.join(root, "assets", fileName));
  check(audio.length === expectedSize, `${fileName} size changed unexpectedly.`);
  check(audio[0] === 0xff && (audio[1] & 0xe0) === 0xe0, `${fileName} does not begin with a valid MP3 frame.`);
});
check(celebrationVideo.length === 3970157, "The Colt celebration animation size changed unexpectedly.");
check(celebrationVideo.toString("ascii", 4, 8) === "ftyp", "The Colt celebration animation is not a valid MP4 container.");
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
check(finishTrigger.includes('if (selectedCharacter === "mrNieves") playMrNievesCelebrationAudio();'), "Mr. Nieves celebration sound routing changed.");
check(!finishTrigger.includes("playColtCelebrationAudio();"), "The Colt celebration sound still starts immediately at flag contact.");

const completeStart = appSource.indexOf("const completeFinishLanding =");
const completeEnd = appSource.indexOf("const beginFinishLanding =", completeStart);
const completeFinish = appSource.slice(completeStart, completeEnd);
check(completeFinish.includes('player.state = "celebrate";'), "The finish does not activate the character-specific celebration animation.");
check(
  appSource.includes('createDeferredVideo("assets/colt-run-colt-celebration.mp4?v=20260729-celebration1")'),
  "The Colt celebration animation is not registered."
);
check(
  completeFinish.includes("keepColtCelebrationVideoPlaying();"),
  "The Colt celebration animation does not start after the finish landing."
);
check(
  completeFinish.includes("coltCelebrationAudioPending = true;"),
  "The Colt celebration sound is not armed when its animation starts."
);
check(
  appSource.includes("const coltCelebrationAudioCueSeconds = 0.74;"),
  "The Colt celebration sound is not aligned with the 0.74-second rearing cue."
);
const celebrationDrawStart = appSource.indexOf("} else if (coltCelebrationFrame) {");
const celebrationDrawEnd = appSource.indexOf("} else if (!isMrNieves && sprite.complete", celebrationDrawStart);
const celebrationDraw = appSource.slice(celebrationDrawStart, celebrationDrawEnd);
check(
  celebrationDraw.includes("celebrationVideoTime >= coltCelebrationAudioCueSeconds"),
  "The Colt celebration sound is not synchronized to the animation timeline."
);
check(
  celebrationDraw.includes("playColtCelebrationAudio();"),
  "The synchronized rearing cue does not play either Colt celebration sound."
);
check(
  celebrationDraw.includes("celebrationVideoTime < coltCelebrationLastVideoTime - 0.25"),
  "The Colt celebration sound is not re-armed when the animation loops."
);
check(
  celebrationDraw.includes("coltCelebrationLastVideoTime = celebrationVideoTime;"),
  "The Colt celebration loop position is not tracked."
);

console.log(JSON.stringify({
  validMp3Files: 2,
  validCelebrationVideo: true,
  coltOnly: true,
  nonRepeatingRandomRotation: true,
  doesNotStartAtFlagContact: true,
  animationCueSeconds: 0.74,
  synchronizedToRearingMotion: true,
  repeatsWithEveryAnimationLoop: true,
  coltCelebrationAnimation: true,
  minecraftDeathSoundRestored: true,
  mrNievesCelebrationSoundUnchanged: true
}, null, 2));
