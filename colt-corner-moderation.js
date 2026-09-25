"use strict";

const crypto = require("crypto");
const defaultConfig = require("./colt-corner-moderation-config");

const substitutions = Object.freeze({
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "@": "a",
  "$": "s"
});

function normalizeForModeration(value) {
  const original = String(value || "").normalize("NFKD");
  const substituted = Array.from(original.toLowerCase(), character => substitutions[character] || character).join("");
  const spaced = substituted
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const reduced = spaced
    .split(" ")
    .map(word => word.replace(/([a-z])\1{2,}/g, "$1"))
    .join(" ");
  return {
    original,
    spaced,
    reduced,
    compact: reduced.replace(/\s+/g, "")
  };
}

function hashNormalizedMessage(value) {
  return crypto.createHash("sha256").update(normalizeForModeration(value).reduced).digest("hex");
}

function escapePattern(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function phraseInNormalized(normalized, phrase) {
  const target = normalizeForModeration(phrase).reduced;
  if (!target) return false;
  const pattern = new RegExp(`(?:^|\\s)${escapePattern(target).replace(/\\ /g, "\\s+")}(?:$|\\s)`, "i");
  if (pattern.test(normalized.reduced)) return true;
  const compactTarget = target.replace(/\s+/g, "");
  // Match separated letters without matching innocent words like "assignment".
  return compactTarget.length >= 4 && new RegExp(
    `(?:^|\\s)${compactTarget.split("").map(escapePattern).join("\\s*")}(?:i\\s*n\\s*g|e\\s*d|e\\s*r\\s*s?|s)?(?:$|\\s)`, "i"
  ).test(normalized.reduced);
}

function firstConfiguredMatch(normalized, entries, exceptions) {
  // Remove only the allowed phrase, never exempt the whole message.
  let safeText = normalized.reduced;
  for (const exception of exceptions || []) {
    const phrase = escapePattern(normalizeForModeration(exception).reduced);
    safeText = safeText.replace(new RegExp(`\\b${phrase}\\b`, "g"), " ");
  }
  const remaining = normalizeForModeration(safeText);
  return (entries || []).find(entry => phraseInNormalized(remaining, entry)) || "";
}

function reason(code, label) {
  return { code, label };
}

function studentMessageFor(status, reasons) {
  const codes = new Set(reasons.map(item => item.code));
  if (codes.has("personal_information") || codes.has("social_contact")) {
    return "Colt Assistant noticed that your message may contain personal information. Please remove names, email addresses, phone numbers, addresses, or usernames and try again.";
  }
  if (codes.has("duplicate") || codes.has("rate_limit") || codes.has("short_spam")) {
    return "That message looks very similar to something you recently posted, or it was sent too quickly. Please wait before posting it again.";
  }
  if (codes.has("excessive_capitals")) {
    return "Please rewrite your message without using so many capital letters.";
  }
  if (status === "needs_review") {
    return "Your message has been sent to Mr. Nieves for review before it appears in Colt Corner.";
  }
  return "Let’s keep Colt Corner respectful and school appropriate. Please rewrite your message using kinder language.";
}

function moderateMessage(value, config = defaultConfig) {
  const text = String(value || "").trim();
  const normalized = normalizeForModeration(text);
  const reasons = [];
  let blocked = false;

  const email = /\b[a-z0-9._%+'-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i.test(text);
  const phone = /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\b/.test(text);
  const streetAddress = /\b\d{1,6}\s+[a-z0-9.' -]{2,40}\s(?:street|st|road|rd|avenue|ave|lane|ln|drive|dr|boulevard|blvd|court|ct|place|pl|way)\b/i.test(text);
  const fullName = /\bmy\s+(?:full\s+)?name\s+is\s+[a-z][a-z.'-]+(?:\s+[a-z][a-z.'-]+)+/i.test(text);
  if (email || phone || streetAddress || fullName) {
    blocked = true;
    reasons.push(reason("personal_information", "Possible email address, phone number, or street address"));
  }

  const socialContact = /(?:@[a-z0-9_.]{3,}|(?:add|follow|message|dm|contact)\s+me\s+(?:on|at)|(?:snapchat|instagram|tiktok|discord)\s+(?:name|user(?:name)?|tag|handle)\s*(?:is|:|=)|my\s+(?:snapchat|instagram|tiktok|discord)\s*(?:is|:|=)|(?:instagram\.com|tiktok\.com|snapchat\.com|discord\.gg)\/[^\s]+)/i.test(text);
  if (socialContact && !email) {
    blocked = true;
    reasons.push(reason("social_contact", "Possible social-media username or outside contact invitation"));
  }

  const unsafeMarkup = /<\s*script\b|javascript\s*:|onerror\s*=|onload\s*=/i.test(text);
  if (unsafeMarkup) {
    blocked = true;
    reasons.push(reason("unsafe_markup", "Unsafe script or HTML-like content"));
  }

  const prohibited = firstConfiguredMatch(normalized, config.prohibitedWords, config.allowedExceptions);
  const sexual = firstConfiguredMatch(normalized, config.sexualWords, config.allowedExceptions);
  const slur = firstConfiguredMatch(normalized, config.discriminatorySlurs, config.allowedExceptions);
  const threat = firstConfiguredMatch(normalized, config.threatPhrases, config.allowedExceptions);
  if (prohibited) {
    blocked = true;
    reasons.push(reason("profanity", "Profanity or highly inappropriate wording"));
  }
  if (sexual) {
    blocked = true;
    reasons.push(reason("sexual_content", "Sexual or highly inappropriate wording"));
  }
  if (slur) {
    blocked = true;
    reasons.push(reason("hate_speech", "Discriminatory or hateful slur"));
  }
  if (threat) {
    blocked = true;
    reasons.push(reason("threat", "Direct threat or encouragement of harm"));
  }

  const uniqueReasons = Array.from(new Map(reasons.map(item => [item.code, item])).values());
  const status = blocked ? "blocked" : "approved";
  return {
    status,
    reasons: uniqueReasons,
    normalizedMessageHash: hashNormalizedMessage(text),
    normalizedText: normalized.reduced,
    originalText: text,
    studentMessage: status === "approved" ? "" : studentMessageFor(status, uniqueReasons)
  };
}

module.exports = {
  normalizeForModeration,
  hashNormalizedMessage,
  moderateMessage,
  studentMessageFor
};
