# Black Cat

Production integration of the approved Black Cat preview, including the velvet bed, cat-ear nameplate, ear-fitted headphones, toothless talking/greeting and yawning, attached breathing snore mouth, visible Robo-Colt-style happy eyes, original-fur smile and exact normalized Saber-tooth paw motion. The original cat and four approved supporting PNGs are copied unchanged; generation prompts and SHA-256 hashes are in artwork.json.

rig.js is the approved renderer with scoped SVG identifiers and production image paths. animation.js owns one frame clock, idle reactions, speech-mouth synchronization, radio dancing and reduced motion. interactive.js adapts to the existing pet controller, account settings and saved device position. Hidden pets stop rendering. Static artwork remains if WebGL cannot start. The shared Pet Studio owns selection, naming, display settings and the headphone choice; the original Black skin remains available alongside Ginger Tabby, Silver Tabby, Siamese, Calico, Tuxedo, Chocolate and Hairless Sphynx. The shared browser/server catalog is skins.js.

Shared PetSpeech and Talk to Pet provide the charcoal/brass/burgundy paw-themed bubble and compact chat. The Cloudflare AI personality is curious, warm and gently cheeky, and receives the saved pet name and actual equipped headphones and selected skin. Conversations retain the existing local history/privacy rules; the cat adds no API, account, audio or microphone feature. Speech bubbles keep the existing gradual reveal and remain available for slow readers until dismissed.

Tests: npm run test:blackcat checks saved teacher/student settings and account isolation, API validation, AI name/accessory context through a local test provider, all animations, sleep and waking, platform/nameplate, all eight Studio themes, custom chat/bubble styling, mobile, pet switching and reload. Shared companion, chat, speech and startup suites cover existing pets. No live student data or paid AI calls are used in the tests.

Commit message: Add Black Cat pet with themed chat bubbles

Final validation passed: test:blackcat, test:startup, test:companion, test:pet-talk, shared speech verification, npm run check and git diff --check. Original pet art/skins/accessories were not modified. The renderer matches the approved preview after reversing only the production URL/ID scoping.

Approved coat integration: the 21 skin PNGs are copied byte-for-byte from the animated previews. skins/approved-assets.json records their SHA-256 hashes; generation prompts are in skins/artwork.json and skins/sphynx-artwork.json. Only the equipped coat’s full image, body backing and front legs load for animation. Inactive renderers release GPU textures; late image loads cannot overwrite a newer selection. Eye art, eyelid colors, Studio thumbnails/subtitles, chat portrait and server AI context follow the selected skin. Names, platform/nameplate, motion, headphones and positions keep their existing behavior.

Commit message: Add seven approved cat skins to Pet Studio
