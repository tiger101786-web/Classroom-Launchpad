"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const knowledge = require(path.join(root, "colt-assistant-knowledge.js"));
const core = require(path.join(root, "colt-assistant.js"));

const approvedLinks = [
  { id: "creative-1", title: "Pixilart", instruction: "Create school-appropriate pixel art.", category: "Creative Projects", url: "https://www.pixilart.com/", active: true },
  { id: "creative-2", title: "Canva", instruction: "Create a school-appropriate design.", category: "Creative Projects", url: "https://www.canva.com/", active: true },
  { id: "creative-3", title: "Chrome Music Lab", instruction: "Create a teacher-approved song.", category: "Creative Projects", url: "https://musiclab.chromeexperiments.com/", active: true },
  { id: "creative-4", title: "BandLab", instruction: "Create a teacher-approved music project.", category: "Creative Projects", url: "https://www.bandlab.com/", active: true },
  { id: "review-1", title: "Kahoot", instruction: "Join a teacher-approved review game.", category: "Review Games", url: "https://kahoot.it/", active: true },
  { id: "logic-1", title: "Chess", instruction: "Practice strategy.", category: "Logic Games", url: "https://www.chess.com/play/computer", active: true },
  { id: "science-1", title: "Explore.org", instruction: "Explore science and nature.", category: "Social Studies & Science", url: "https://explore.org/", active: true },
  { id: "video-1", title: "YouTube", instruction: "Use a teacher-approved class video.", category: "Class Videos", url: "https://www.youtube.com/", active: true },
  { id: "hidden-1", title: "Hidden Site", instruction: "Hidden.", category: "Logic Games", url: "https://hidden.example/", active: false },
  { id: "unsafe-1", title: "Unsafe Scheme", instruction: "Unsafe.", category: "Logic Games", url: "javascript:alert(1)", active: true }
];

const categories = Object.keys(knowledge.categoryKeywords);
const responder = core.createResponder({
  knowledge,
  getLinks: () => approvedLinks,
  getCategories: () => categories,
  getRules: () => knowledge.classroomRules,
  isLinksReady: () => true
});

function ask(text) {
  return responder.respond(text);
}

function hasCategory(response, category) {
  return Array.isArray(response.recommendations)
    && response.recommendations.length > 0
    && response.recommendations.every(item => item.category === category);
}

assert(hasCategory(ask("I want to make something."), "Creative Projects"));
assert(hasCategory(ask("Show me a game."), "Review Games"));
assert.match(ask("What can I do when I finish?").text, /assigned work|approved activity/i);
assert.equal(ask("Can I go to YouTube?").recommendations[0].title, "YouTube");
assert.match(ask("My sound does not work.").text, /volume|muted|headphones/i);

const passwordResponse = ask("My password is test123.");
assert.equal(passwordResponse.sensitive, true);
assert.match(passwordResponse.text, /do not enter names, passwords/i);
assert.doesNotMatch(passwordResponse.text, /test123/i);

assert(hasCategory(ask("Show me science websites."), "Social Studies & Science"));
assert.match(ask("I want a website that is not on the list.").text, /not currently on the approved list/i);
assert(hasCategory(ask("I wana dra."), "Creative Projects"));
assert.match(ask("How do I return to Classroom Launchpad?").text, /bookmark|launchpad/i);

const gradeResponse = ask("What is my grade?");
assert.equal(gradeResponse.sensitive, true);
assert.match(gradeResponse.text, /private information/i);

assert.match(ask("Who won the World Series in 1998?").text, /ask Mr\. Nieves/i);
assert(ask("Show me creative websites.").recommendations.length <= 3);

const safeLinks = core.safeApprovedLinks(() => approvedLinks);
assert(!safeLinks.some(link => link.id === "hidden-1"));
assert(!safeLinks.some(link => link.id === "unsafe-1"));
assert(safeLinks.every(link => !Object.hasOwn(link, "url")));

const assistantSource = fs.readFileSync(path.join(root, "colt-assistant.js"), "utf8");
assert(!/\bfetch\s*\(/.test(assistantSource));
assert(!/\bXMLHttpRequest\b/.test(assistantSource));
assert(!/\bWebSocket\b/.test(assistantSource));
assert(!/\bsendBeacon\b/.test(assistantSource));
assert(!/\blocalStorage\b/.test(assistantSource));
assert(!/\bsessionStorage\b/.test(assistantSource));
assert(!/dangerouslySetInnerHTML|\.innerHTML\s*=/.test(assistantSource));

const indexSource = fs.readFileSync(path.join(root, "index.html"), "utf8");
const stylesSource = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
assert.match(indexSource, /id="coltAssistantRoot"/);
assert.match(indexSource, /colt-assistant-knowledge\.js/);
assert.match(indexSource, /colt-assistant\.js/);
assert.match(stylesSource, /@media \(max-width: 720px\)[\s\S]*\.colt-assistant-panel/);
assert.match(stylesSource, /prefers-reduced-motion/);
assert.match(appSource, /ClassroomLaunchpadAssistantData/);
assert.match(appSource, /\["http:", "https:"\]\.includes/);

console.log("Colt Assistant verification passed.");
