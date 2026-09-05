const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const audioPath = path.join(root, "assets", "colt-run-mr-nieves-death-audio.wav");
const audio = fs.readFileSync(audioPath);

function check(value, message) {
  if (!value) throw new Error(message);
}

check(audio.toString("ascii", 0, 4) === "RIFF" && audio.toString("ascii", 8, 12) === "WAVE", "Death audio is not a valid WAV file.");
const channels = audio.readUInt16LE(22);
const sampleRate = audio.readUInt32LE(24);
const bitsPerSample = audio.readUInt16LE(34);
const dataBytes = audio.readUInt32LE(40);
const durationSeconds = dataBytes / (sampleRate * channels * (bitsPerSample / 8));
check(channels === 1 && sampleRate === 44100 && bitsPerSample === 16, "Death audio format changed unexpectedly.");
check(durationSeconds > 0.5 && durationSeconds < 0.6, "Death audio duration changed unexpectedly.");

check(appSource.includes('createDeferredAudio("assets/colt-run-mr-nieves-death-audio.wav?v=20260727-pain1")'), "Mr. Nieves death audio is not registered.");
check(appSource.includes('createDeferredAudio("assets/colt-run-mr-nieves-death-audio-02.mp3?v=20260728-makedeath2")'), "Second Mr. Nieves death audio is not registered.");
check(appSource.includes("mrNievesDeathAudios.forEach(audio => ensureMediaSource(audio));"), "Mr. Nieves death audio is not preloaded with his character media.");
check(appSource.includes("chooseNonRepeatingAudioIndex(\n      mrNievesDeathAudios.length,\n      lastMrNievesDeathAudioIndex"), "Mr. Nieves death sounds do not use the non-repeating selector.");

const deathVideoMatches = appSource.match(/createDeferredVideo\("assets\/colt-run-mr-nieves-death(?:-02)?\.mp4\?[^"]+"\)/g) || [];
check(deathVideoMatches.length === 2, `Expected two Mr. Nieves death animations, found ${deathVideoMatches.length}.`);

const triggerStart = appSource.indexOf("const triggerColtDeath =");
const triggerEnd = appSource.indexOf("const updateColtDeath =", triggerStart);
const trigger = appSource.slice(triggerStart, triggerEnd);
const mrAudioCall = trigger.indexOf('if (selectedCharacter === "mrNieves") playMrNievesDeathAudio();');
const coltDeathCall = trigger.indexOf('else if (selectedCharacter === "colt") playColtDeathAudio();');
const deathTimestamp = trigger.indexOf("deathStartedAt = performance.now();");
const deathAnimation = trigger.indexOf("const activeDeathVideo =");
check(mrAudioCall >= 0, "Mr. Nieves death sound is not selected by character.");
check(coltDeathCall > mrAudioCall, "The Colt, Mr. Nieves, and Mrs. Levandoske death sounds are not separated by character.");
check(mrAudioCall < deathTimestamp && mrAudioCall < deathAnimation, "Mr. Nieves death sound does not start before the death animation.");
check((appSource.match(/triggerColtDeath\(/g) || []).length === 3, "Not every death cause uses the shared death trigger.");

console.log(JSON.stringify({
  validWav: true,
  durationSeconds: Number(durationSeconds.toFixed(3)),
  mrNievesDeathSounds: 2,
  nonRepeatingRotation: true,
  mrNievesDeathAnimationsCovered: 2,
  allDeathCausesCovered: 3,
  audioStartsBeforeAnimation: true,
  coltAndMrNievesSoundsRemainSeparate: true
}, null, 2));
