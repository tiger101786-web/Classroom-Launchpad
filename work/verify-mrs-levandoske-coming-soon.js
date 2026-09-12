"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const card = app.match(/<button type="button" data-colt-run="character" data-character="mrsLevandoske"[\s\S]*?<\/button>/)?.[0] || "";
const trittelCard = app.match(/<button type="button" data-colt-run="character" data-character="mrsTrittel"[\s\S]*?<\/button>/)?.[0] || "";
const kochCard = app.match(/<button type="button" class="is-placeholder" data-character="mrsKoch"[\s\S]*?<\/button>/)?.[0] || "";

assert(card, "Mrs. Levandoske is missing from character select.");
assert.doesNotMatch(card, /disabled|aria-disabled|is-placeholder/, "Mrs. Levandoske is still disabled.");
assert.match(card, /data-colt-run="character"/, "Mrs. Levandoske cannot start gameplay.");
assert.match(card, /Mrs\. Levandoske/);
assert.doesNotMatch(card, /Coming Soon|colt-run-coming-soon/);
assert.match(app, /mrsLevandoske: "Mrs\. Levandoske"/);
assert.match(app, /colt-run-mrs-levandoske-idle\.webm/);
assert.match(app, /colt-run-mrs-levandoske-idle-02\.webm/);
assert.match(app, /colt-run-mrs-levandoske-idle\.webm\?v=20260910-tight-hq1/);
assert.match(app, /colt-run-mrs-trittel-idle\.webm\?v=20260910-tight-hq1/);
assert.match(app, /colt-run-mrs-koch-idle\.webm\?v=20260910-tight-hq1/);
assert.match(app, /colt-run-mrs-levandoske-run\.webm/);
assert.match(app, /colt-run-mrs-levandoske-run\.webm\?v=20260905-green-key2/);
assert.match(app, /colt-run-mrs-levandoske-jump\.webm/);
assert.match(app, /colt-run-mrs-levandoske-jump-02\.webm/);
assert.match(app, /colt-run-mrs-levandoske-jump\.webm\?v=20260905-green-key2/);
assert.match(app, /colt-run-mrs-levandoske-jump-02\.webm\?v=20260905-green-key2/);
assert.match(app, /colt-run-mrs-levandoske-death\.webm/);
assert.match(app, /colt-run-mrs-levandoske-death\.webm\?v=20260905-green-key2/);
assert.match(app, /colt-run-mrs-levandoske-celebration\.webm\?v=20260908-green-key1/);
assert.match(app, /colt-run-mrs-levandoske-celebration-02\.webm\?v=20260908-green-key1/);
assert.match(app, /colt-run-mrs-levandoske-celebration-audio\.mp3/);
assert.match(app, /colt-run-mrs-levandoske-celebration-audio-02\.mp3/);
assert.match(app, /colt-run-mrs-levandoske-celebration-audio-03\.mp3/);
assert.match(app, /colt-run-mrs-levandoske-death-audio\.mp3/);
assert.match(app, /colt-run-mrs-levandoske-death-audio-02\.mp3/);
assert.match(app, /usesHumanRunningAudio[\s\S]*?selectedCharacter === "mrsLevandoske"[\s\S]*?selectedCharacter === "mrsTrittel"/, "The playable teacher characters should reuse the human running sound.");
assert.match(app, /selectedCharacter === "mrsLevandoske"\) playMrsLevandoskeCelebrationAudio\(\)/);
assert.match(app, /selectedCharacter === "mrsLevandoske"\) playMrsLevandoskeDeathAudio\(\)/);
assert.match(app, /selectedCharacter === "mrsLevandoske"\) \{[\s\S]*?chooseMrsLevandoskeCelebrationVideo\(\);[\s\S]*?keepMrsLevandoskeCelebrationVideoPlaying\(\);/, "Mrs. Levandoske should use her dedicated end-flag celebration animations.");
assert.match(app, /isMrsLevandoske \? 18 : isMrsTrittel \? 16 : 8/, "The playable teacher characters should sit correctly on gameplay platforms.");
assert.match(app, /mrsLevandoskeCueVolumeMultipliers = \[2\.4, 2\.4, 1, 1, 1\]/, "Both Mrs. Levandoske death screams should receive a significant volume boost.");
assert.match(app, /chooseNonRepeatingAudioIndex\([\s\S]*?mrsLevandoskeDeathAudios\.length,[\s\S]*?lastMrsLevandoskeDeathAudioIndex/, "Mrs. Levandoske's death sounds should alternate without immediate repeats.");
assert.match(app, /chooseNonRepeatingAudioIndex\([\s\S]*?mrsLevandoskeCelebrationAudios\.length,[\s\S]*?lastMrsLevandoskeCelebrationAudioIndex/, "Mrs. Levandoske's celebration sounds should rotate without immediate repeats.");
assert.match(app, /mrsLevandoskeCelebrationIndex = \(mrsLevandoskeCelebrationIndex \+ 1\) % mrsLevandoskeCelebrationVideos\.length/, "Mrs. Levandoske's celebration videos should alternate.");
assert.match(app, /mrsLevandoskeCelebrationVideos\.forEach\(video => \{\s*video\.loop = true;/, "The selected Mrs. Levandoske celebration should loop for the entire finish screen.");
assert.match(app, /selectedCharacter === "mrsLevandoske"\) \{[\s\S]*?chooseMrsLevandoskeCelebrationVideo\(\);[\s\S]*?keepMrsLevandoskeCelebrationVideoPlaying\(\);/, "Mrs. Levandoske's celebration video should advance once when each level's finish flag is reached.");
assert.match(app, /mrsLevandoskeIsCelebrating[\s\S]*?getMrsLevandoskeCelebrationVideo\(\)\.readyState >= 2/, "Mrs. Levandoske's dedicated celebration frame should be rendered at the finish flag.");
assert.match(app, /mrsLevandoskeIdleIndex = \(mrsLevandoskeIdleIndex \+ 1\) % mrsLevandoskeIdleVideos\.length/);
assert.match(app, /mrsLevandoskeJumpIndex = \(mrsLevandoskeJumpIndex \+ 1\) % mrsLevandoskeJumpVideos\.length/);
assert.match(app, /mrsLevandoskeIdleVideos\.forEach\(video => \{[\s\S]*?video\.addEventListener\("ended"/);
assert.match(app, /drawSelectPreview\(selectMrsLevandoskeCanvas, getMrsLevandoskeIdleVideo\(\), 140, 198, 2\)/, "Mrs. Levandoske should use the tighter high-quality framing.");
assert.match(styles, /\.colt-run-character-grid \{[\s\S]*?grid-template-columns: repeat\(6,/);
assert.match(styles, /\.colt-run-character-grid button \{[\s\S]*?grid-column: span 2;/, "Character cards should retain their original three-across width.");
assert.equal((app.match(/<canvas id="coltRunSelect[^\"]+" width="600" height="400"/g) || []).length, 5, "All character-select previews should use high-resolution canvases.");
assert.match(app, /const renderScale = previewCanvas\.width \/ 300;/, "Character artwork should retain its visible size on the sharper canvas.");
assert.match(app, /imageSmoothingQuality = "high";/, "Character previews should use high-quality image smoothing.");
assert.match(styles, /\.colt-run-coming-soon/);
assert.match(styles, /\.colt-run-coming-soon \{[\s\S]*?position: relative !important;/, "Coming Soon badges should remain in normal layout below the character artwork.");
assert.doesNotMatch(styles.match(/\.colt-run-coming-soon \{[\s\S]*?\n\}/)?.[0] || "", /^\s*(?:bottom|left|transform):/m, "Coming Soon badges must not float over character legs.");
assert.match(app, /drawSelectPreview\(selectMrsTrittelCanvas, getMrsTrittelIdleVideo\(\), 135, 198, 2\)/, "Mrs. Trittel must use the tighter high-quality framing.");
assert.match(app, /drawSelectPreview\(selectMrsKochCanvas, getMrsKochIdleVideo\(\), 136, 198, 0\)/, "Mrs. Koch must use the tighter high-quality framing while retaining her slightly lower platform position.");
assert.match(
  styles,
  /button\[data-character="mrsLevandoske"\],[\s\S]*?colt-run-character-select-mr-nieves-bg\.png/,
  "Mrs. Levandoske must use the same fiery character-select background as the existing runners."
);

assert(trittelCard, "Mrs. Trittel is missing from character select.");
assert.doesNotMatch(trittelCard, /disabled|aria-disabled|is-placeholder/, "Mrs. Trittel is still disabled.");
assert.match(trittelCard, /data-colt-run="character"/, "Mrs. Trittel cannot start gameplay.");
assert.match(trittelCard, /Mrs\. Trittel/);
assert.doesNotMatch(trittelCard, /Coming Soon|colt-run-coming-soon/);
assert.match(app, /mrsTrittel: "Mrs\. Trittel"/);
assert.match(app, /colt-run-mrs-trittel-run\.webm\?v=20260910-playable1/);
assert.match(app, /colt-run-mrs-trittel-jump\.webm\?v=20260911-best-leap1/);
assert.match(app, /mrsTrittelJumpVideo\.playbackRate = 2\.25;/, "Mrs. Trittel's leap clip should move quickly enough to read during the short in-game jump.");
assert.match(app, /colt-run-mrs-trittel-death\.webm\?v=20260911-death1/);
assert.match(app, /colt-run-mrs-trittel-death-audio\.mp3\?v=20260911-trim1/);
assert.match(app, /colt-run-mrs-trittel-death-audio-02\.mp3\?v=20260911-death2-lower1/);
assert.match(app, /selectedCharacter === "mrsTrittel"\) playMrsTrittelDeathAudio\(\)/, "Mrs. Trittel must play her dedicated death screams.");
assert.match(app, /const nextIndex = \(lastMrsTrittelDeathAudioIndex \+ 1\) % mrsTrittelDeathAudios\.length;/, "Mrs. Trittel's death screams must follow a strict alternating cycle.");
assert.match(app, /colt-run-mrs-trittel-celebration\.webm\?v=20260911-green-key1/);
assert.match(app, /colt-run-mrs-trittel-celebration-02\.webm\?v=20260911-green-key1/);
assert.match(app, /colt-run-mrs-trittel-celebration-audio\.mp3\?v=20260911-celebration1/);
assert.match(app, /colt-run-mrs-trittel-celebration-audio-02\.mp3\?v=20260911-celebration2/);
assert.match(app, /mrsTrittelCelebrationIndex = \(mrsTrittelCelebrationIndex \+ 1\) % mrsTrittelCelebrationVideos\.length/, "Mrs. Trittel's finish animations must alternate between levels.");
assert.match(app, /const nextIndex = \(lastMrsTrittelCelebrationAudioIndex \+ 1\) % mrsTrittelCelebrationAudios\.length;/, "Mrs. Trittel's finish sounds must follow a strict alternating cycle.");
assert.match(app, /mrsTrittelCelebrationVideos\.forEach\(video => \{\s*video\.loop = true;/, "Mrs. Trittel's selected finish animation must loop.");
assert.match(app, /selectedCharacter === "mrsTrittel"\) \{[\s\S]*?chooseMrsTrittelCelebrationVideo\(\);[\s\S]*?keepMrsTrittelCelebrationVideoPlaying\(\);/, "Mrs. Trittel must use her dedicated finish animations.");
assert.match(app, /selectedCharacter === "mrsTrittel"\) playMrsTrittelCelebrationAudio\(\)/, "Mrs. Trittel must use her dedicated finish sounds.");
assert.match(app, /selectedCharacter === "mrsTrittel"[\s\S]*?mrsTrittelRunVideo/);
assert.match(app, /selectedCharacter === "mrsTrittel"[\s\S]*?mrsTrittelJumpVideo/);
assert.match(app, /mrsTrittelIsCelebrating[\s\S]*?getMrsTrittelCelebrationVideo\(\)\.readyState >= 2/, "Mrs. Trittel's dedicated celebration frame should render at the finish flag.");

[
  [kochCard, "Mrs. Koch"]
].forEach(([comingSoonCard, name]) => {
  assert(comingSoonCard, `${name} is missing from character select.`);
  assert.match(comingSoonCard, /disabled/);
  assert.doesNotMatch(comingSoonCard, /data-colt-run="character"/, `${name} must not be playable yet.`);
  assert.match(comingSoonCard, /colt-run-coming-soon">Coming Soon<\/strong>/);
  assert.match(comingSoonCard, new RegExp(name.replace(".", "\\.")));
});

assert.match(app, /const fullscreenTarget = stage \|\| shell;/, "Fullscreen should target only the 16:9 game stage.");
assert.match(app, /keys\.jump && !jumpConsumed && player\.grounded/, "Jump must require a fresh press.");
assert.match(app, /if \(name === "jump" && !value\) jumpConsumed = false;/);
assert.match(app, /const mrsTrittelIdleVideos = \[/);
assert.match(app, /const mrsKochIdleVideos = \[/);
assert.match(app, /mrsTrittelIdleIndex = \(mrsTrittelIdleIndex \+ 1\) % mrsTrittelIdleVideos\.length/);
assert.match(app, /mrsKochIdleIndex = \(mrsKochIdleIndex \+ 1\) % mrsKochIdleVideos\.length/);
assert.match(app, /mrsTrittelIdleVideos\.forEach\(video => \{[\s\S]*?video\.addEventListener\("ended"/);
assert.match(app, /mrsKochIdleVideos\.forEach\(video => \{[\s\S]*?video\.addEventListener\("ended"/);
assert.match(styles, /data-character="mrsTrittel"[\s\S]*?data-character="mrsKoch"[\s\S]*?colt-run-character-select-mr-nieves-bg\.png/);

[
  "colt-run-mrs-trittel-idle.webm",
  "colt-run-mrs-trittel-idle-02.webm",
  "colt-run-mrs-trittel-run.webm",
  "colt-run-mrs-trittel-jump.webm",
  "colt-run-mrs-trittel-death.webm",
  "colt-run-mrs-trittel-celebration.webm",
  "colt-run-mrs-trittel-celebration-02.webm",
  "colt-run-mrs-koch-idle.webm",
  "colt-run-mrs-koch-idle-02.webm"
].forEach(filename => {
  const file = path.join(root, "assets", filename);
  assert(fs.existsSync(file), `Missing transparent coming-soon animation: ${filename}`);
  assert(fs.statSync(file).size > 100_000, `Coming-soon animation is unexpectedly small: ${filename}`);
});

[
  "colt-run-mrs-levandoske-idle.webm",
  "colt-run-mrs-levandoske-idle-02.webm",
  "colt-run-mrs-levandoske-run.webm",
  "colt-run-mrs-levandoske-jump.webm",
  "colt-run-mrs-levandoske-jump-02.webm",
  "colt-run-mrs-levandoske-death.webm",
  "colt-run-mrs-levandoske-celebration.webm",
  "colt-run-mrs-levandoske-celebration-02.webm"
].forEach(filename => {
  const file = path.join(root, "assets", filename);
  assert(fs.existsSync(file), `Missing transparent animation: ${filename}`);
  assert(fs.statSync(file).size > 100_000, `Animation is unexpectedly small: ${filename}`);
});

[
  "colt-run-mrs-levandoske-celebration-audio.mp3",
  "colt-run-mrs-levandoske-celebration-audio-02.mp3",
  "colt-run-mrs-levandoske-celebration-audio-03.mp3",
  "colt-run-mrs-levandoske-death-audio.mp3"
].forEach(filename => {
  const file = path.join(root, "assets", filename);
  assert(fs.existsSync(file), `Missing Mrs. Levandoske sound: ${filename}`);
  assert(fs.statSync(file).size > 20_000, `Mrs. Levandoske sound is unexpectedly small: ${filename}`);
});

[
  "colt-run-mrs-trittel-death-audio.mp3",
  "colt-run-mrs-trittel-death-audio-02.mp3",
  "colt-run-mrs-trittel-celebration-audio.mp3",
  "colt-run-mrs-trittel-celebration-audio-02.mp3"
].forEach(filename => {
  const file = path.join(root, "assets", filename);
  assert(fs.existsSync(file), `Missing Mrs. Trittel death sound: ${filename}`);
  assert(fs.statSync(file).size > 3_000, `Mrs. Trittel death sound is unexpectedly small: ${filename}`);
});

console.log("Colt Run roster, jump guard, and fullscreen verification passed.");
