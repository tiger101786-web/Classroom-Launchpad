# Colt Corner Server-Side Moderation

Colt Corner moderation is separate from the Colt Assistant classroom helper. The helper answers student questions in the chat panel. The moderation system runs privately on the Classroom Launchpad server whenever a student submits a Colt Corner topic or reply.

## Cost and privacy

- No AI model or paid API is used.
- No API key is required.
- Student messages are not sent outside Classroom Launchpad.
- Blocked submissions are not stored.
- Teacher-rejected messages are automatically removed after 30 days.

## Moderation results

- `approved`: appears in Colt Corner immediately.
- `needs_review`: stays hidden until Mr. Nieves approves it.
- `blocked`: is not posted publicly or saved as a new submission.

Existing topics and replies without moderation fields are treated as approved automatically.

## Editing the rules

Open `colt-corner-moderation-config.js` to edit:

- prohibited words;
- sexual or highly inappropriate words;
- discriminatory slurs;
- threat phrases;
- warning words and possible bullying phrases;
- allowed classroom exceptions;
- timing, duplicate, capitalization, and retention limits.

Keep entries lowercase. Rules use normalized complete words or phrases and account for common punctuation, spacing, repeated-letter, and number-substitution attempts.

## Teacher workflow

1. Log in to the existing Teacher Dashboard.
2. Open **Colt Corner**.
3. Review the private **Colt Corner Moderation** queue.
4. Choose **Approve**, **Reject**, **Edit and Approve**, or **Delete**.
5. Open **Recently moderated posts** to review recent decisions.

Students cannot read the moderation queue or use its server routes.

## Deployment

No database command or manual migration is required. The JSON database is upgraded safely when it is next saved. Keep the existing Render persistent disk and `DATA_DIR`, `SESSION_SECRET`, `STUDENT_EMAIL_DOMAIN`, and teacher authentication settings.

No new environment variables are required.
