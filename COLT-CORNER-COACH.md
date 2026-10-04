# Colt Corner private revision coach

Student topics and replies are checked on the server before publishing. Routine revisions return only to the submitting student's composer; they are not bot replies, private-inbox messages, or public posts. The draft stays in the form until the student edits and submits again. Leaving or refreshing the page can discard an unsent draft.

The private panel explains the issue, gives a concrete editing instruction, and quotes the relevant wording when the contextual checker returns a verified exact quote. **Edit My Post** focuses that field and selects the quote. **Check Again & Post** reruns the checks; approved revisions publish automatically. No routine teacher approval is required.

Rules cover friends-only participation, classmates' crush/dating gossip, harassment and existing safety/privacy checks. Friendly casual conversation, hobbies, greetings and disagreements about ideas are allowed. The contextual prompt explicitly distinguishes harmless words, fictional relationships and educational discussion. Existing hard safety filters remain in effect, including their configured exceptions; flagged safety wording may still need teacher judgment. There are no automatic punishments or account restrictions.

Serious threats, slurs and explicit sexual content are held in the existing Teacher Dashboard → Colt Corner → Needs Review queue, hidden from public feeds. Identical pending safety alerts from the same student are deduplicated. Routine revision text is not stored on the server. Safety review copies remain available through the existing moderation controls.

## Hosted connection and release

This uses the same server-side Cloudflare Workers AI connection as Guided AI, not a new provider. Configure `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_AI_API_TOKEN`; `COLT_AI_ENABLED` must not be `false`. It uses `COLT_AI_TEXT_MODEL` (the existing default if omitted) and `CLOUDFLARE_AI_API_BASE`. Keep credentials server-side. No credentials were changed or added by this implementation.

The model receives draft title/message and limited parent-topic context, without account email, profile or chat history. Detected private details are rejected locally before the hosted call. The UI discloses Cloudflare processing. Local pattern checks cannot guarantee that every possible private detail will be recognized.

Timeouts, unavailable configuration, provider errors and malformed or unverifiable model decisions leave drafts unpublished with a retry notice, not an accusation. Moderation calls have a 15-second timeout and a separate 60-attempt-per-10-minute account limit. Model decisions can be wrong; report controls and teacher review remain important.

Deploy the updated server and assets together through the normal release process. A working Guided AI connection is required for student posting. This change does not retroactively scan or remove existing topics. No deployment or live provider quality evaluation was performed as part of the local tests.

## Verification

- `node work/verify-corner-coach-unit.js`
- `node work/verify-colt-corner-moderation.js`
- `node work/verify-colt-corner-moderation-ui.js`
- `node work/verify-nintendo-shelf.js`

Tests use synthetic users, isolated temporary databases and a local AI transport fixture, never production student data. They verify enforcement and UI behavior; the fixture is not evidence of the real model's classification accuracy.
