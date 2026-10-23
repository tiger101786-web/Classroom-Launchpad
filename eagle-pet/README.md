# Bald Eagle companion

Production version of the approved `work/eagle-pet-preview` animation rig. All image assets are local to this folder; production does not depend on the work preview or generated-image cache.

## Included

- The original eagle, fitted textured branch, independent wing flaps, greeting, open happy eyes, body wobble, blink and proportion-preserving beak chatter.
- Slow sleeping mouth movement and the restored eye-opening sequence with a restrained wake yawn.
- Idle rotation, radio dancing/music notes, reduced-motion support, and suspension when hidden or signed out.
- Pet Studio selection, per-account name/size/motion/sleep preferences, drag and keyboard positioning, reset and hide/show.
- Editable carved-wood nameplate with ivory/brown feather ornaments, saved visibility and automatically fitted lettering. Character size is unchanged.
- Idle reactions recur after 3.5–6 seconds, emphasizing chatter and flaps; a five-cycle 1.8-second fast flap is also available in Studio.

## Nameplate artwork

`nameplate-v1.png` was generated with the built-in image tool, source `exec-2169a3ff-fd86-4c37-9951-587f61a15099.png`. Original transparency retained; live SVG text remains editable.

Prompt: Finished game UI nameplate for a painted 2D bald eagle perched on a brown branch. Wide low carved honey-walnut plaque, irregular beveled bark edges, broad pale honey inset, ivory-white and chocolate-brown feather ornaments at both ends, muted gold shafts, masculine woodland craftsmanship. Center at least 70% blank for editable lettering. Front-facing readable hand-painted illustration, transparent background, no character, feet, scenery or words.

The four page widths are 157/183/213/266 px, giving character-and-perch heights of approximately 127/148/172/215 px. These match the existing Colt's character/platform canvas (without its additional nameplate) to within 2 px. Below 1120 px, the eagle follows the other pets' compact mode at 79 px wide. The illustration is uniformly scaled, never stretched. Studio uses its own fixed preview framing.

## Artwork provenance

All artwork was generated with the built-in image tool and approved through the preview iterations. `approved-eagle.png`, `wing-backing-v2.png`, `open-beak-v2.png`, and `happy-open-eyes-v4.png` preserve the same 1374×1145 registration. `branch-fitted-v4.png` is the final accepted perch, displayed at y=60. Exact prompts and generated source IDs are recorded in `../work/eagle-pet-preview/README.md`.

## Verification

`node work/verify-pet-studio-production.cjs` verifies teacher/student persistence and isolation; eagle selection, thumbnail loading, all four sizes and compact size, wing action, sleep/wake, fixed-size jaw, radio preview, mobile layout, reload, hide/show and reduced motion, alongside regressions for the existing pets. `npm run check` includes this controller's syntax check.
