# Panda robot skin and fluid tail wag

## Shipped artwork

`parts-panda-v3.png` is the production asset, created with the built-in image-generation tool using the imagegen skill. The first ivory-metal version was rejected; the second established the panda pattern but had fur. The final version preserves that pattern with smooth robotic enamel, mechanical joints, rounded black metal ears, black eye patches, white face/belly, and black limbs. No fur is used. Earlier drafts are retained outside the repository in the local preview QA directory.

The atlas has component-specific measured bounds and facial anchors. Panda-only ear cutouts restore the original horse cutouts when another skin is selected. It uses the same animated eyes, mouth, head, limb rig, and separate accessories. The platform/nameplate have a complementary silver/graphite finish.

## Tail movement

Manual wag and greeting use four continuous sinusoidal swings in 1.2 seconds with gradual entry and damping, plus small phase-delayed flex. The fixed root stays at (510,547). The dance wag uses a seamless 480ms continuous loop. Sleep, motion-off, and reduced-motion behavior are preserved.

## Giraffe decision

A long-neck Giraffe was not shipped. The current atlas combines the neck with the head and torso, with fixed cutouts around the neck seam. A proper elongated neck needs separate artwork, head/neck registration, accessory positioning, and additional animation validation; a color-only skin or stretched head would not satisfy the request.

## Final built-in generation prompt

Use case: precise-object-edit. Image 1 is the EDIT TARGET, a four-part panda robot animation atlas. Image 2 is supporting MATERIAL STYLE REFERENCE of the original robotic horse. Change ONLY the material finish of Image 1 back into a ROBOT. KEEP EXACTLY its approved panda color blocking, round black ears, broad black oval eye patches, white face and belly, black shoulder/chest band, black legs/feet, all-black swept mane and tail, exact silhouette, part positions, size, empty eye sockets and muzzle placement. REMOVE ALL FUR, soft plush texture and individual hairs everywhere. Replace with smooth premium satin enamel black/white armor with metallic highlights and restrained mechanical plate seams. Reintroduce robotic segmented chest/abdomen plates and articulated leg panels with black mechanical round joints matching Image 2's robot style, but preserve Image 1's black-and-white pattern. White stays clean porcelain-white, not golden ivory. Round ears are BLACK metal/enamel, no hairs. Mane and tail are solid sculpted glossy black metal strands, like original robot material. Nose stays black robotic nose with same two nostrils; surrounding muzzle white enamel. No eyes or pupils in sockets, added by code. Same four separate pieces in same atlas positions: upper-left seated body without front legs; upper-right isolated front leg; bottom-left other front leg; bottom-right tail. Actual transparent background, no shadow, no text, no accessories, no platform. DO NOT return to original pointed horse ears, DO NOT add cream stripes to mane, DO NOT change panda markings. This is a panda ROBOT, absolutely no fur.

## Validation

`node work/verify-colt-tail.cjs`, `node work/verify-colt-skins.cjs`, `npm run build`, `npm run test:robo`.
