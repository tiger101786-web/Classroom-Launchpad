"use strict";

/*
 * Colt Corner moderation settings
 * --------------------------------
 * Keep editable word and phrase lists here so moderation rules are not
 * scattered throughout the server. Entries are compared as complete
 * normalized words or phrases, including common filter-evasion spelling.
 */
module.exports = Object.freeze({
  prohibitedWords: [
    "fuck", "shit", "bitch", "asshole", "bastard", "dick", "cunt"
  ],
  sexualWords: [
    "porn", "porno", "sex", "sexting", "nude", "nudes", "penis", "vagina"
  ],
  discriminatorySlurs: [
    "nigger", "faggot", "retard", "tranny"
  ],
  threatPhrases: [
    "i will kill you",
    "im going to kill you",
    "kill yourself",
    "i will hurt you",
    "im going to hurt you",
    "i will shoot you",
    "beat you up",
    "bomb the school"
  ],
  allowedExceptions: [
    "class assignment",
    "computer class",
    "class discussion",
    "sex education"
  ],
  limits: Object.freeze({
    rejectedRetentionDays: 30
  })
});
