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
  getTodayDirections: () => "Open TypingClub and complete lesson five before choosing an approved activity.",
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
const activityChooserResponse = ask("Help me choose an activity.");
assert.match(activityChooserResponse.text, /what kind of approved activity/i);
assert(Array.isArray(activityChooserResponse.choices) && activityChooserResponse.choices.length >= 5);
assert(activityChooserResponse.choices.some(item => item.label === "Create something"));
assert.match(ask("Choose an activity.").text, /what kind of approved activity/i);
assert.match(ask("What can I do when I finish?").text, /assigned work|approved activity/i);
assert.equal(ask("Can I go to YouTube?").recommendations[0].title, "YouTube");
assert.match(ask("My sound does not work.").text, /volume|muted|headphones/i);
const keyboardRepairResponse = ask("how can i fix my keyboard");
assert.match(keyboardRepairResponse.text, /click once inside|try one letter|ask Mr\. Nieves/i);
assert.equal(keyboardRepairResponse.recommendations, undefined);
assert.match(ask("My keyboard is broken.").text, /click once inside|try one letter/i);
const keyboardIssuesResponse = ask("im having keyboard issues");
assert.match(keyboardIssuesResponse.text, /click once inside|try one letter|ask Mr\. Nieves/i);
assert.equal(keyboardIssuesResponse.recommendations, undefined);
assert.match(ask("I am having trouble with my keyboard.").text, /click once inside|try one letter/i);
assert.match(ask("I have difficulty with my keyboard.").text, /click once inside|try one letter/i);
assert.match(ask("How do I fix my trackpad?").text, /move one finger|connected/i);
const mouseHelpResponse = ask("mouse help");
assert.match(mouseHelpResponse.text, /trackpad|connected|Mr\. Nieves/i);
assert.equal(mouseHelpResponse.recommendations, undefined);
assert.match(ask("I am having email issues.").text, /do not enter your email address or password|finished loading/i);
assert.match(ask("My USB drive is not showing.").text, /ask Mr\. Nieves before connecting|Eject/i);
assert.match(ask("The Wi-Fi is not working.").text, /do not change networks|offline/i);
assert.match(ask("My microphone has a problem.").text, /teacher-approved website|permission/i);
assert.match(ask("I cannot print.").text, /ask Mr\. Nieves/i);
assert.equal(ask("I cannot print.").recommendations, undefined);
assert.match(ask("My Chromebook is not charging.").text, /save your work|damaged cable/i);
assert.match(ask("My file is not uploading.").text, /upload to finish|correct school file/i);
const downloadsTopicResponse = ask("downloads");
assert.match(downloadsTopicResponse.text, /download or upload to finish|Downloads folder/i);
assert.equal(downloadsTopicResponse.recommendations, undefined);
assert.match(ask("uploads").text, /download or upload to finish|correct school file/i);
assert.match(ask("email").text, /school email page|email address or password/i);
assert.match(ask("USB").text, /USB drive|Files app|Eject/i);
assert.match(ask("Wi-Fi").text, /Wi-Fi symbol|do not change networks/i);
assert.match(ask("microphone").text, /teacher-approved website|permission/i);
assert.match(ask("battery").text, /save your work|battery is low/i);
assert.match(ask("How do I copy and paste?").text, /Ctrl\+C|Ctrl\+V/i);
const shortcutsResponse = ask("Show me keyboard shortcuts.");
assert.match(shortcutsResponse.text, /Ctrl\+C|Ctrl\+Z|Ctrl\+Shift\+T/i);
assert.match(shortcutsResponse.text, /teacher-approved pages/i);
assert.equal(shortcutsResponse.recommendations, undefined);
assert.match(ask("My screen is black.").text, /brightness-up|screen stays black/i);

const passwordResponse = ask("My password is test123.");
assert.equal(passwordResponse.sensitive, true);
assert.match(passwordResponse.text, /do not enter names, passwords/i);
assert.doesNotMatch(passwordResponse.text, /test123/i);

assert(hasCategory(ask("Show me science websites."), "Social Studies & Science"));
assert.match(ask("I want a website that is not on the list.").text, /not currently on the approved list/i);
assert(hasCategory(ask("I wana dra."), "Creative Projects"));
assert.match(ask("How do I return to Classroom Launchpad?").text, /bookmark|launchpad/i);
assert.match(ask("What are today's directions?").text, /TypingClub|lesson five/i);

const gradeResponse = ask("What is my grade?");
assert.equal(gradeResponse.sensitive, true);
assert.match(gradeResponse.text, /private information/i);

assert.match(ask("Who won the World Series in 1998?").text, /ask Mr\. Nieves/i);
assert(ask("Show me creative websites.").recommendations.length <= 3);

const capabilityResponse = ask("What can u do?");
assert.match(capabilityResponse.text, /approved websites|choose an activity/i);
assert(Array.isArray(capabilityResponse.choices) && capabilityResponse.choices.length >= 4);

const firstGreeting = ask("Hi");
const secondGreeting = ask("Hello");
assert.match(firstGreeting.text, /help|activity|website/i);
assert.notEqual(firstGreeting.text, secondGreeting.text);
assert.match(ask("Who are you?").text, /Colt Assistant|classroom helper/i);
assert.match(ask("How are you?").text, /ready|great|help/i);
assert.match(ask("Thank you").text, /welcome|happy to help|you got it/i);
assert.match(ask("Goodbye").text, /goodbye|see you|bye/i);

const firstJoke = ask("Tell me a joke");
const secondJoke = ask("Another joke");
assert.match(firstJoke.text, /computer|graphics|microchips|keyboard|space/i);
assert.notEqual(firstJoke.text, secondJoke.text);
assert(Array.isArray(ask("I'm bored").choices));
assert.match(ask("This is hard").text, /small step|Mr\. Nieves/i);
assert.match(ask("You are helpful").text, /glad|thank/i);

responder.resetContext();
const creativeFirstPage = ask("Show me creative websites.");
const savedContext = responder.getContextSnapshot();
const creativeMore = ask("Show me more.");
assert.equal(creativeFirstPage.recommendations.length, 3);
assert.equal(creativeMore.recommendations.length, 1);
assert(!creativeMore.recommendations.some(next => creativeFirstPage.recommendations.some(previous => previous.id === next.id)));
responder.restoreContext(savedContext);
const restoredMore = ask("Show me more.");
assert.deepEqual(
  restoredMore.recommendations.map(item => item.id),
  creativeMore.recommendations.map(item => item.id)
);
const repeatedResponse = ask("Say that again");
assert.match(repeatedResponse.text, /here it is again/i);
responder.resetContext();
assert.match(ask("Show me more").text, /pick a category|kind of activity/i);

const safeLinks = core.safeApprovedLinks(() => approvedLinks);
assert(!safeLinks.some(link => link.id === "hidden-1"));
assert(!safeLinks.some(link => link.id === "unsafe-1"));
assert(safeLinks.every(link => !Object.hasOwn(link, "url")));

const assistantSource = fs.readFileSync(path.join(root, "colt-assistant.js"), "utf8");
const knowledgeSource = fs.readFileSync(path.join(root, "colt-assistant-knowledge.js"), "utf8");
assert(!/[âÃ�]/.test(knowledgeSource));
assert.match(assistantSource, /\/api\/colt-assistant\/chat/);
assert.doesNotMatch(assistantSource, /\/api\/colt-assistant\/image/);
assert.match(assistantSource, /Guided AI/);
assert.doesNotMatch(assistantSource, /Create Image/);
assert.match(assistantSource, /Show Full Response/);
assert.doesNotMatch(assistantSource, /matchMedia\("\(prefers-reduced-motion: reduce\)"\)/);
assert.match(assistantSource, /appendAnimatedAssistantResponse/);
assert.match(assistantSource, /65 \+ punctuationPause/);
assert.match(assistantSource, /looksSensitive\(prompt\)/);
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
