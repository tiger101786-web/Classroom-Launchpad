# Talk to Pet

Click the equipped desktop pet to open its existing Pet Studio controls, then choose **Talk to Pet** alongside the preview controls. Studio returns the same live pet to the desktop and opens a compact chat. Enter or Send submits; Escape or the close button clears the conversation. Suggested prompts help younger readers get started; they hide when space is needed for the message field on small screens.

## Architecture

- `pet-conversation-data.js`: 251 distinct curated topic/personality lines, plus eight riddle/trivia prompts and answers. All nine actual species have their own greetings, jokes, questions, reactions, and favorites. Add dialogue here.
- `pet-conversation.js`: synchronous rule engine with normalization, selected common spelling corrections, bounded recent-response avoidance, explicit unknown-topic fallbacks, and one pending question/quiz. Safety and privacy checks run before topic/context matching. It does not solve arbitrary questions or use a language model.
- `pet-talk.js` / `pet-talk.css`: one reusable, nonmodal window, a maximum of 24 recent messages, 240-character input limit, 900 ms send cooldown, IME-safe Enter handling, touch-sized controls, viewport-aware placement, and existing species portrait assets. Portraits identify the species; the live pet retains the actual equipped appearance.
- `companion-picker.js`: read-only chat bridge reads the equipped species, name, and customization from existing controllers. It neither writes pet settings nor saves conversations. Existing availability/account rules still apply; chat requires no new account or service.
- `pet-studio.js`: adds one Talk to Pet action and opens chat after Studio's existing close handler has restored the pet to the desktop.
- `pet-speech.js` / `pet-speech.css`: reuse the single existing themed bubble and speaking-state events. Chat replies replace the previous bubble and take priority over idle/movement messages. They follow the live pet each animation frame while visible. A bubble stays for 4 seconds plus 650 ms per word (9–45 seconds), then fades over 250 ms; click or keyboard dismisses it. Near the top edge it moves below the pet to remain readable, with its pointer reversed. No pet movement or artwork changes are needed.

## Privacy and limitations

No conversation storage, network calls, keys, subscriptions, new dependencies, or backend routes. Messages live only in the open window; closing, changing species/account, hiding the page, or reloading clears them. Sensitive or inappropriate inputs are replaced in the visible transcript with a neutral label. Do not request or echo personal details. Serious-concern rules direct students to a trusted adult. The filter is a basic local safeguard, not a comprehensive understanding or moderation service; unmatched input receives a curated fallback and is never turned into generated content.

No voice or recording features are added. Existing pet controllers, art, animation rules, customization/save paths, and other app functions remain responsible for their own behavior. Chat layout avoids the pet when space permits; very short screens can require scrolling the recent-message area. Reduced-motion preferences disable the fade transition.

## Verification

`npm run test:pet-talk` runs offline engine checks and the real-site browser integration test (Playwright and Chrome required). The browser test uses a temporary data directory/server and checks every species, entry from the pet, names, replies, context, safeguards, no message transmission, cooldown, bubble replacement/tracking/dismissal/fade, desktop/tablet/mobile bounds, customization metadata, switching, and cleared history. Screenshots are written to the printed temporary folder.

Also run `npm run check`, `npm run test:companion`, and `node work/verify-pet-speech.cjs` for existing controls, artwork/customization, student/teacher preferences, animation behavior, and native speech regression coverage.

The native-speech test now waits for the lazily loaded Studio to open before interacting with it. The Studio test measures responsive nameplate clearance against the same layout with Talk to Pet hidden: the pre-existing 800px layout has a 14.3px gap, so the old fixed 16px assumption was replaced with a scaled minimum plus a direct no-regression comparison.

## Files changed

New: `pet-conversation-data.js`, `pet-conversation.js`, `pet-talk.js`, `pet-talk.css`, `work/verify-pet-conversation.cjs`, `work/verify-pet-talk.cjs`, and this note.

Updated: `companion-picker.js`, `pet-studio.js`, `pet-speech.js`, `pet-speech.css`, `index.html` (load/version references), `package.json` (syntax/test commands), `work/verify-pet-speech.cjs`, and `work/verify-pet-studio-production.cjs`.
