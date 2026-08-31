"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const card = app.match(/<button type="button" class="is-placeholder" data-character="mrsLevandoske"[\s\S]*?<\/button>/)?.[0] || "";

assert(card, "Mrs. Levandoske is missing from character select.");
assert.match(card, /disabled aria-disabled="true"/, "Mrs. Levandoske must remain unavailable for gameplay.");
assert.doesNotMatch(card, /data-colt-run="character"/, "The coming-soon card can still start gameplay.");
assert.match(card, /Mrs\. Levandoske/);
assert.match(card, /Coming Soon/);
assert.match(app, /colt-run-mrs-levandoske-idle\.webm/);
assert.match(app, /colt-run-mrs-levandoske-idle-02\.webm/);
assert.match(app, /mrsLevandoskeIdleIndex = \(mrsLevandoskeIdleIndex \+ 1\) % mrsLevandoskeIdleVideos\.length/);
assert.match(app, /mrsLevandoskeIdleVideos\.forEach\(video => \{[\s\S]*?video\.addEventListener\("ended"/);
assert.match(styles, /\.colt-run-character-grid \{[\s\S]*?grid-template-columns: repeat\(3,/);
assert.match(styles, /\.colt-run-coming-soon/);

[
  "colt-run-mrs-levandoske-idle.webm",
  "colt-run-mrs-levandoske-idle-02.webm"
].forEach(filename => {
  const file = path.join(root, "assets", filename);
  assert(fs.existsSync(file), `Missing transparent idle animation: ${filename}`);
  assert(fs.statSync(file).size > 100_000, `Idle animation is unexpectedly small: ${filename}`);
});

console.log("Mrs. Levandoske coming-soon character verification passed.");
