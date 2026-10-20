# Snake skin and restored Panda ears

Built with the built-in image-generation tool using the imagegen skill. Production assets are `parts-snake-v1.png` and `parts-panda-v4.png`. The latter replaces v3 at runtime; v3 is retained as historical artwork. Panda now uses the normal horse-ear cutouts and pointed Colt ears, not bear ears. This supersedes the rounded-ear description in PANDA-AND-TAIL.md.

Snake uses the existing eye groups with golden-amber irises and narrow vertical pupils. Its code-native forked tongue follows the existing skin-specific mouth anchor; it has its own timer and animation handle, and never changes the head/limb animation transforms. It is an expressive pet animation, not a biological simulation. Varied 2.2–4.2 second idle gaps prevent a metronomic appearance. Each short 560ms flick is interrupted by conflicting states and reset on skin change. No new controls or persisted timer fields are needed.

Validation: verify-colt-snake.cjs, verify-colt-skins.cjs, verify-colt-tail.cjs, npm run build, npm run test:robo.

## Final generation prompts

### panda4

Precise-object-edit, production transparent animation atlas. Image1 EDIT TARGET Panda robot. Image2 supporting exact original Colt ear shape reference. Change ONLY the two rounded bear ears in upper-left body to the normal pointed upright HORSE EARS from Image2. Match Image2 ear silhouettes, size and placement exactly, but make them black graphite metal with dark interiors and silver edge highlights consistent with Panda. Keep EVERYTHING ELSE in Image1 pixel-aligned unchanged: panda eye patches, empty eye sockets, white face/muzzle, black nose, segmented white belly, black mechanical limbs, mane, detached legs, tail and their atlas positions. No fur. Do not add eyes or tongue. Exact same square canvas and transparent background. No text, no platform, no new geometry except restoring horse ears.

### snake

Precise-object-edit. Production transparent animation parts atlas for robotic Colt pet. Image1 EDIT TARGET exact robot anatomy, atlas positions and silhouettes. Image2 STYLE REFERENCE for snake skin pattern. Repaint Image1 with luxurious python-snakeskin enamel armor: realistic tan/taupe and dark espresso/black irregular diamond/saddle markings with cream borders, patterned small smooth embossed scales following panel curves like Image2. Not green crocodile. Keep robot mechanical joints and polished dark bronze edges, smooth dark bronze muzzle, sculpted horse mane and tail dark brown with tan-gold accent strands. Restrained readable pattern on forehead, cheeks, torso and limbs. Premium collectible robot, no fur. Preserve exact normal pointed horse ears, head, camera, poses, proportions, limb anchors and four atlas part layouts. Upper-left body without front legs, upper-right isolated leg, lower-left second leg, lower-right tail. Keep empty dark eye sockets and neutral closed mouth unchanged for code animation. NO painted eyes, NO painted tongue, no fangs. No snake body, no changed horse anatomy. Transparent background, no shadow, no platform, no props, no text. Same square image and original component positions.
