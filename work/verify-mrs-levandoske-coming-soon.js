"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const card = app.match(/<button type="button" data-colt-run="character" data-character="mrsLevandoske"[\s\S]*?<\/button>/)?.[0] || "";

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
assert.match(app, /colt-run-mrs-levandoske-celebration-audio\.mp3/);
assert.match(app, /colt-run-mrs-levandoske-death-audio\.mp3/);
assert.match(app, /selectedCharacter === "mrNieves" \|\| selectedCharacter === "mrsLevandoske"/, "Mrs. Levandoske should reuse Mr. Nieves's running sound.");
assert.match(app, /selectedCharacter === "mrsLevandoske"\) playMrsLevandoskeCelebrationAudio\(\)/);
assert.match(app, /selectedCharacter === "mrsLevandoske"\) playMrsLevandoskeDeathAudio\(\)/);
assert.match(app, /selectedCharacter === "mrsLevandoske"\) \{[\s\S]*?chooseMrsLevandoskeIdleVideo\(\);[\s\S]*?keepMrsLevandoskeIdleVideoPlaying\(\);/, "Mrs. Levandoske should use an idle animation for her temporary celebration.");
assert.match(app, /isMrsLevandoske \? 18 : 8/, "Mrs. Levandoske should sit lower on gameplay platforms.");
assert.match(app, /mrsLevandoskeCueVolumeMultipliers = \[2\.4, 1\]/, "Mrs. Levandoske's death scream should receive a significant volume boost.");
assert.match(app, /mrsLevandoskeIdleIndex = \(mrsLevandoskeIdleIndex \+ 1\) % mrsLevandoskeIdleVideos\.length/);
assert.match(app, /mrsLevandoskeJumpIndex = \(mrsLevandoskeJumpIndex \+ 1\) % mrsLevandoskeJumpVideos\.length/);
assert.match(app, /mrsLevandoskeIdleVideos\.forEach\(video => \{[\s\S]*?video\.addEventListener\("ended"/);
assert.match(app, /drawSelectPreview\(selectMrsLevandoskeCanvas, getMrsLevandoskeIdleVideo\(\), 130, 198, -6\)/, "Mrs. Levandoske should sit slightly lower on the character-select platform.");
assert.match(styles, /\.colt-run-character-grid \{[\s\S]*?grid-template-columns: repeat\(3,/);
assert.doesNotMatch(styles, /\.colt-run-coming-soon/);
assert.match(
  styles,
  /button\[data-character="mrsLevandoske"\] \{[\s\S]*?colt-run-character-select-mr-nieves-bg\.png/,
  "Mrs. Levandoske must use the same fiery character-select background as the existing runners."
);

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
  "colt-run-mrs-levandoske-death-audio.mp3"
].forEach(filename => {
  const file = path.join(root, "assets", filename);
  assert(fs.existsSync(file), `Missing Mrs. Levandoske sound: ${filename}`);
  assert(fs.statSync(file).size > 20_000, `Mrs. Levandoske sound is unexpectedly small: ${filename}`);
});

console.log("Mrs. Levandoske playable character verification passed.");
