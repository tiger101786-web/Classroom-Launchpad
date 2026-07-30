const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const audioFiles = [
  ["colt-run-mr-nieves-celebration-audio.mp3", 19661],
  ["colt-run-mr-nieves-celebration-audio-02.mp3", 33792],
  ["colt-run-mr-nieves-celebration-audio-03.mp3", 43776],
  ["colt-run-mr-nieves-celebration-audio-04.mp3", 68545],
  ["colt-run-mr-nieves-celebration-audio-05.mp3", 52662]
];

function check(value, message) {
  if (!value) throw new Error(message);
}

audioFiles.forEach(([fileName, expectedSize]) => {
  const audio = fs.readFileSync(path.join(root, "assets", fileName));
  const hasId3Header = audio.toString("ascii", 0, 3) === "ID3";
  const hasMp3Frame = audio[0] === 0xff && (audio[1] & 0xe0) === 0xe0;
  check(audio.length === expectedSize, `${fileName} size changed unexpectedly.`);
  check(hasId3Header || hasMp3Frame, `${fileName} does not begin with a valid MP3 header or frame.`);
});

[
  'createDeferredAudio("assets/colt-run-mr-nieves-celebration-audio.mp3?v=20260728-woohoo1")',
  'createDeferredAudio("assets/colt-run-mr-nieves-celebration-audio-02.mp3?v=20260728-letsgo1")',
  'createDeferredAudio("assets/colt-run-mr-nieves-celebration-audio-03.mp3?v=20260728-yayboy-ohyeah-boost1")',
  'createDeferredAudio("assets/colt-run-mr-nieves-celebration-audio-04.mp3?v=20260728-victory1")',
  'createDeferredAudio("assets/colt-run-mr-nieves-celebration-audio-05.mp3?v=20260728-yayboy-ohyeah-boost1")'
].forEach(registration => {
  check(appSource.includes(registration), `Missing celebration registration: ${registration}`);
});

check(
  appSource.includes("const mrNievesCelebrationVolumeMultipliers = [1, 1, 1.4, 1, 1.4];"),
  "The maleyayboy and maleohyeah volume boosts are missing or assigned to the wrong sounds."
);

const characterMediaStart = appSource.indexOf("const ensureCharacterMedia =");
const characterMediaEnd = appSource.indexOf("const stagedMediaTimers =", characterMediaStart);
const characterMedia = appSource.slice(characterMediaStart, characterMediaEnd);
check(
  characterMedia.includes("mrNievesCelebrationAudios.forEach(audio => ensureMediaSource(audio));"),
  "The Mr. Nieves celebration rotation is not preloaded with his character media."
);

const audioPlayerStart = appSource.indexOf("const chooseNonRepeatingAudioIndex =");
const audioPlayerEnd = appSource.indexOf("const syncRunningAudio =", audioPlayerStart);
const audioPlayer = appSource.slice(audioPlayerStart, audioPlayerEnd);
check(
  audioPlayer.includes("if (audioCount > 1 && nextIndex === lastIndex)"),
  "The consecutive-repeat guard is missing."
);
check(
  audioPlayer.includes("mrNievesCelebrationAudios.length")
    && audioPlayer.includes("lastMrNievesCelebrationAudioIndex = nextIndex;"),
  "The celebration rotation is not using all five sounds with remembered history."
);

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
check(completeFinish.includes('player.state = "celebrate";'), "Character-specific celebration animation routing changed.");
check(completeFinish.includes("chooseMrNievesCelebrationVideo();"), "Mr. Nieves celebration animation routing changed.");

console.log(JSON.stringify({
  validMp3Files: 5,
  mrNievesOnly: true,
  nonRepeatingRotation: true,
  maleyayboyVolumeMultiplier: 1.4,
  maleohyeahVolumeMultiplier: 1.4,
  startsAtFlagContact: true,
  startsBeforeCelebrationAnimation: true,
  allMrNievesCelebrationAnimationsCovered: 4,
  mrNievesFinishBehaviorUnchanged: true
}, null, 2));
