# Talk to Pet

Click your equipped pet, then choose **Talk to Pet** in Pet Studio. Drag the dotted grip or focus it and use the arrow keys to move the compact chat bar. Enter or the send button submits a message. Use the history button to reopen the recent conversation. Replies appear in the pet's themed bubble and stay visible until dismissed, replaced by another reply, or the chat closes.

The chat sends the current message and up to eight recent turns to the Classroom Launchpad server, which calls the existing Cloudflare Workers AI connection. The server selects one of nine character prompts in pet-ai-personalities.js. Cloudflare generates every conversational reply. The browser keeps recent messages in memory for the open chat and clears them on close. Classroom Launchpad does not save them to its database.

The feature uses the same Cloudflare configuration as Colt Assistant. An unavailable connection or usage limit is shown as a chat status. The server authenticates requests, checks origin, limits requests, filters common private details, and instructs the model to keep replies short and classroom appropriate.

Run npm run test:pet-talk for the mocked Cloudflare integration and browser tests. These tests verify request routing, personality selection, conversation context, the compact movable interface, and persistent reply bubbles.
