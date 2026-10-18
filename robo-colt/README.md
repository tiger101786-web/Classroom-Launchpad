# Seated Colt companion

The approved layered Colt replaces the video companion under the existing `colt` selection. Original video assets, old customization data, and the legacy renderer source remain in the repository; `launchpad-colt.js` still broadcasts the administrator's availability setting but does not display its video pet.

`companion-picker.js` owns authentication, selection, and the serialized save queue. Robot settings are stored separately in the `robo` field of `/api/companion-preferences`, preserving Squishy choices. Position is account-scoped in local storage. Defaults preserve the original crimson look, headphones off, platform on, medium size, motion on.

The new renderer reacts to the existing radio event through the picker. Manual sleep takes priority over music; click-to-wake plays the wake sequence before dancing resumes. Automatic naps occur after one quiet minute. Idle blinks, ear twitches, smiles, and occasional bounces stop for sleep, hidden pets, hidden tabs, and reduced-motion settings. The platform is outside the animated body group.

The panel reuses the Squishy layout and paged collections. Only fitted accessories are exposed (headphones); additional headwear should be fitted to this character before being added. This is layered 2D animation, not a walking 3D rig.

Validation: `npm run build`, `npm run test:companion`. The original video UI test files are retained as historical references but are no longer in the active test command; the companion test now verifies replacement, radio, sleep/wake, persistence, account isolation, switching, mobile, reduced motion, and the remaining Squishy features.

Artwork was created with the built-in image editor. Generation prompts are preserved in `art-notes.md` and `platform-notes.md`.
