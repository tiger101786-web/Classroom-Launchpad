# Bald Eagle companion

Production version of the approved `work/eagle-pet-preview` animation rig. All image assets are local to this folder; production does not depend on the work preview or generated-image cache.

## Included

- The original eagle, fitted textured branch, independent wing flaps, greeting, open happy eyes, body wobble, blink and proportion-preserving beak chatter.
- Slow sleeping mouth movement and the restored eye-opening sequence with a restrained wake yawn.
- Idle rotation, radio dancing/music notes, reduced-motion support, and suspension when hidden or signed out.
- Pet Studio selection, per-account name/size/motion/sleep preferences, drag and keyboard positioning, reset and hide/show.
- The approved Bald Eagle look only. No unapproved skins, accessories or nameplate are included. The name is shown in Pet Studio and accessibility labels.

The four page widths are 157/183/213/266 px, giving character-and-perch heights of approximately 127/148/172/215 px. These match the existing Colt's character/platform canvas (without its additional nameplate) to within 2 px. Below 1120 px, the eagle follows the other pets' compact mode at 79 px wide. The illustration is uniformly scaled, never stretched. Studio uses its own fixed preview framing.

## Artwork provenance

All artwork was generated with the built-in image tool and approved through the preview iterations. `approved-eagle.png`, `wing-backing-v2.png`, `open-beak-v2.png`, and `happy-open-eyes-v4.png` preserve the same 1374×1145 registration. `branch-fitted-v4.png` is the final accepted perch, displayed at y=60. Exact prompts and generated source IDs are recorded in `../work/eagle-pet-preview/README.md`.

## Verification

`node work/verify-pet-studio-production.cjs` verifies teacher/student persistence and isolation; eagle selection, thumbnail loading, all four sizes and compact size, wing action, sleep/wake, fixed-size jaw, radio preview, mobile layout, reload, hide/show and reduced motion, alongside regressions for the existing pets. `npm run check` includes this controller's syntax check.
