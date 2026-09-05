"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const card = app.match(/<button type="button" data-colt-run="character" data-character="mrsLevandoske"[\s\S]*?<\/button>/)?.[0] || "";
const trittelCard = app.match(/<button type="button" class="is-placeholder" data-character="mrsTrittel"[\s\S]*?<\/button>/)?.[0] || "";
const kochCard = app.match(/<button type="button" class="is-placeholder" data-character="mrsKoch"[\s\S]*?<\/button>/)?.[0] || "";

assert(card, "Mrs. Levandoske is missing from character select.");
assert.doesNotMatch(card, /disabled|aria-disabled|is-placeholder/, "Mrs. Levandoske is still disabled.");
assert.match(card, /data-colt-run="character"/, "Mrs. Levandoske cannot start gameplay.");
assert.match(card, /Mrs\. Levandoske/);
assert.doesNotMatch(card, /Coming Soon|colt-run-coming-soon/);
assert.match(app, /mrsLevandoske: "Mrs\. Levandoske"/);
assert.match(app, /colt-run-mrs-levandoske-idle\.webm/);
assert.match(app, /colt-run-mrs-levandoske-idle-02\.webm/);
assert.match(app, /colt-run-mrs-levandoske-run\.webm/);
assert.match(app, /colt-run-mrs-levandoske-run\.webm\?v=20260905-green-key2/);
assert.match(app, /colt-run-mrs-levandoske-jump\.webm/);
assert.match(app, /colt-run-mrs-levandoske-jump-02\.webm/);
assert.match(app, /colt-run-mrs-levandoske-jump\.webm\?v=20260905-green-key2/);
assert.match(app, /colt-run-mrs-levandoske-jump-02\.webm\?v=20260905-green-key2/);
assert.match(app, /colt-run-mrs-levandoske-death\.webm/);
assert.match(app, /colt-run-mrs-levandoske-death\.webm\?v=20260905-green-key2/);
assert.match(app, /colt-run-mrs-levandoske-celebration-audio\.mp3/);
assert.match(app, /colt-run-mrs-levandoske-celebration-audio-02\.mp3/);
assert.match(app, /colt-run-mrs-levandoske-death-audio\.mp3/);
assert.match(app, /selectedCharacter === "mrNieves" \|\| selectedCharacter === "mrsLevandoske"/, "Mrs. Levandoske should reuse Mr. Nieves's running sound.");
assert.match(app, /selectedCharacter === "mrsLevandoske"\) playMrsLevandoskeCelebrationAudio\(\)/);
assert.match(app, /selectedCharacter === "mrsLevandoske"\) playMrsLevandoskeDeathAudio\(\)/);
assert.match(app, /selectedCharacter === "mrsLevandoske"\) \{[\s\S]*?chooseMrsLevandoskeIdleVideo\(\);[\s\S]*?keepMrsLevandoskeIdleVideoPlaying\(\);/, "Mrs. Levandoske should use an idle animation for her temporary celebration.");
assert.match(app, /isMrsLevandoske \? 18 : 8/, "Mrs. Levandoske should sit lower on gameplay platforms.");
assert.match(app, /mrsLevandoskeCueVolumeMultipliers = \[2\.4, 1, 1\]/, "Mrs. Levandoske's death scream should receive a significant volume boost.");
assert.match(app, /chooseNonRepeatingAudioIndex\([\s\S]*?mrsLevandoskeCelebrationAudios\.length,[\s\S]*?lastMrsLevandoskeCelebrationAudioIndex/, "Mrs. Levandoske's celebration sounds should rotate without immediate repeats.");
assert.match(app, /mrsLevandoskeIdleIndex = \(mrsLevandoskeIdleIndex \+ 1\) % mrsLevandoskeIdleVideos\.length/);
assert.match(app, /mrsLevandoskeJumpIndex = \(mrsLevandoskeJumpIndex \+ 1\) % mrsLevandoskeJumpVideos\.length/);
assert.match(app, /mrsLevandoskeIdleVideos\.forEach\(video => \{[\s\S]*?video\.addEventListener\("ended"/);
assert.match(app, /drawSelectPreview\(selectMrsLevandoskeCanvas, getMrsLevandoskeIdleVideo\(\), 130, 198, -6\)/, "Mrs. Levandoske should sit slightly lower on the character-select platform.");
assert.match(styles, /\.colt-run-character-grid \{[\s\S]*?grid-template-columns: repeat\(6,/);
assert.match(styles, /\.colt-run-character-grid button \{[\s\S]*?grid-column: span 2;/, "Character cards should retain their original three-across width.");
assert.match(styles, /\.colt-run-coming-soon/);
assert.match(styles, /\.colt-run-coming-soon \{[\s\S]*?position: relative !important;/, "Coming Soon badges should remain in normal layout below the character artwork.");
assert.doesNotMatch(styles.match(/\.colt-run-coming-soon \{[\s\S]*?\n\}/)?.[0] || "", /^\s*(?:bottom|left|transform):/m, "Coming Soon badges must not float over character legs.");
assert.match(app, /drawSelectPreview\(selectMrsTrittelCanvas, mrsTrittelComingSoonImage, 72, 198, 2\)/, "Mrs. Trittel must preserve her natural proportions.");
assert.match(app, /drawSelectPreview\(selectMrsKochCanvas, mrsKochComingSoonImage, 74, 198, 2\)/, "Mrs. Koch must preserve her natural proportions.");
assert.match(
  styles,
  /button\[data-character="mrsLevandoske"\],[\s\S]*?colt-run-character-select-mr-nieves-bg\.png/,
  "Mrs. Levandoske must use the same fiery character-select background as the existing runners."
);

[
  [trittelCard, "Mrs. Trittel"],
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
assert.match(app, /const mrsTrittelComingSoonImage = new Image\(\)/);
assert.match(app, /const mrsKochComingSoonImage = new Image\(\)/);
assert.match(styles, /data-character="mrsTrittel"[\s\S]*?data-character="mrsKoch"[\s\S]*?colt-run-character-select-mr-nieves-bg\.png/);

[
  "colt-run-mrs-trittel-coming-soon.png",
  "colt-run-mrs-koch-coming-soon.png"
].forEach(filename => {
  const file = path.join(root, "assets", filename);
  assert(fs.existsSync(file), `Missing transparent character art: ${filename}`);
  assert(fs.statSync(file).size > 100_000, `Character art is unexpectedly small: ${filename}`);
});

[
  "colt-run-mrs-levandoske-idle.webm",
  "colt-run-mrs-levandoske-idle-02.webm",
  "colt-run-mrs-levandoske-run.webm",
  "colt-run-mrs-levandoske-jump.webm",
  "colt-run-mrs-levandoske-jump-02.webm",
  "colt-run-mrs-levandoske-death.webm"
].forEach(filename => {
  const file = path.join(root, "assets", filename);
  assert(fs.existsSync(file), `Missing transparent animation: ${filename}`);
  assert(fs.statSync(file).size > 100_000, `Animation is unexpectedly small: ${filename}`);
});

[
  "colt-run-mrs-levandoske-celebration-audio.mp3",
  "colt-run-mrs-levandoske-celebration-audio-02.mp3",
  "colt-run-mrs-levandoske-death-audio.mp3"
].forEach(filename => {
  const file = path.join(root, "assets", filename);
  assert(fs.existsSync(file), `Missing Mrs. Levandoske sound: ${filename}`);
  assert(fs.statSync(file).size > 20_000, `Mrs. Levandoske sound is unexpectedly small: ${filename}`);
});

console.log("Colt Run roster, jump guard, and fullscreen verification passed.");
