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
  warningWords: [
    "idiot", "stupid", "dumb", "loser", "ugly", "moron"
  ],
  warningPhrases: [
    "shut up",
    "i hate you",
    "nobody likes you",
    "you are worthless",
    "go away"
  ],
  allowedExceptions: [
    "class assignment",
    "computer class",
    "class discussion",
    "sex education"
  ],
  limits: Object.freeze({
    minimumMessageLength: 3,
    maximumRepeatedCharacterRun: 5,
    capitalLetterMinimum: 12,
    capitalLetterRatio: 0.75,
    minimumSecondsBetweenPosts: 10,
    maximumPostsPerFiveMinutes: 5,
    duplicateWindowMinutes: 30,
    rejectedRetentionDays: 30
  })
});
