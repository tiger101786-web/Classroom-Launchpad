# Colt Assistant

Colt Assistant is a free, keyword-based classroom helper built directly into Classroom Launchpad. It does not use an AI service, language model, search engine, analytics service, or outside message system.

Student questions are handled in the browser. Conversations last only while the current page is open and are never placed in browser storage or the server database.

It can also handle basic classroom-safe conversation, including greetings, thanks, goodbyes, simple jokes, encouragement, questions about what it can do, and follow-ups such as “show me more.” Follow-up memory is temporary and is cleared with the conversation or when the page refreshes.

The student home screen uses four primary choices—Find an Activity, Today’s Directions, Computer Help, and Ask a Question—so advanced options do not overwhelm students. Home and Back controls provide simple navigation, and Read Aloud uses the browser’s built-in speech feature when it is available.

## Files

- `colt-assistant-knowledge.js` contains the teacher-editable messages, suggested questions, keywords, classroom rules, and troubleshooting directions.
- `colt-assistant.js` contains the matching, privacy protection, approved-link selection, and chat-panel behavior.
- `app.js` safely supplies the current active approved websites, categories, and classroom expectations.
- `styles.css` contains the light, night, desktop, mobile, keyboard-focus, and reduced-motion styles.
- `work/verify-colt-assistant.js` tests the required classroom questions and safety restrictions.

## Enable or disable Colt Assistant

Open `colt-assistant-knowledge.js` and find:

```js
enabled: true,
```

Change `true` to `false` to hide Colt Assistant. Change it back to `true` to enable it.

## Change the welcome message

In `colt-assistant-knowledge.js`, edit the words after `welcomeMessage:`. Keep the message inside the quotation marks.

## Edit the opening choices

The simplified interface uses `primaryActions` for its four large starting choices and `moreHelpActions` for the smaller More Help menu. Edit their `label` text to change what students see. The `prompt` text determines which local assistant response opens.

## Add keywords or common phrases

The `categoryKeywords` section connects student phrases to an existing Classroom Launchpad category.

For example:

```js
"Creative Projects": ["creative", "create", "draw", "art"],
```

Add another phrase inside the brackets and quotation marks. Do not add website addresses to this file.

The `intentKeywords` section works the same way for classroom rules, early-finisher questions, computer help, permission, login help, and navigation.

The `conversationKeywords` and `conversationResponses` sections control greetings, basic conversation, friendly replies, jokes, encouragement, and follow-up phrases. These remain local templates and do not turn Colt Assistant into a general-purpose AI.

## Website recommendations

Colt Assistant reads the current active website list from Classroom Launchpad. It does not maintain a separate website list.

- Hidden or deleted websites are not recommended.
- Only approved `http` or `https` addresses can produce an Open Website button.
- Students must click the button; websites never open automatically.
- No more than three recommendations are shown at once.
- Manage website names, descriptions, categories, and active status through the existing Teacher Dashboard.

Today’s Directions reads the existing teacher-managed Today’s Launch message. It does not maintain a second copy of those directions.

## Edit troubleshooting directions

Find `troubleshooting` in `colt-assistant-knowledge.js`. Each item contains:

- `id`: a short internal label
- `keywords`: phrases students might type
- `response`: the child-friendly steps Colt Assistant displays

Use `\n` inside a response when you want a new line.

Login, password, private-record, or unresolved technical issues should continue to direct students to Mr. Nieves.

## Privacy and safety

Colt Assistant:

- Does not request or store names, emails, passwords, grades, or private records.
- Hides a student message when it appears to contain sensitive information.
- Does not send chat messages to the Classroom Launchpad server or any outside service.
- Does not execute commands or modify website data.
- Does not browse the internet.
- Opens only a currently active approved website selected from Classroom Launchpad.

## Test locally

Start the website:

```powershell
npm start
```

Open `http://localhost:8080/`.

Run the full verification:

```powershell
npm test
npm run build
```

The build command checks the JavaScript files. The test command verifies the required student prompts, private-information response, approved-link restrictions, recommendation limit, and local-only implementation.

## Limitations

Colt Assistant is not a general-purpose AI. It recognizes approved keywords, common phrases, website titles, categories, and minor spelling mistakes. Unexpected or unrelated questions are deliberately sent to Mr. Nieves instead of being guessed.
