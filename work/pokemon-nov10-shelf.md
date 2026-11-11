# Pokémon shelf additions — November 10

Added Caterpie, Charmeleon, Venusaur, Wartortle and Ivysaur to the Pokémon category. The user-provided Desktop PNGs already contain genuine alpha transparency. Each file was copied byte-for-byte to assets/shelf-pokemon-*-statue.png, with no generation, re-encoding, cropping or resolution change in the final assets. An earlier image-generation extraction attempt was rejected; no generated output was used.

Source paths, native dimensions and measured nontransparent bounds are recorded in pokemon-nov10-shelf-assets.json. The existing renderer uses those bounds with the standard 330-unit size, 280-unit width limit and shared bottom baseline, preserving aspect ratios and all character/base detail.

Validation: work/verify-pokemon-nov10-shelf.cjs checks valid selections, shared baseline, size limits, desktop/mobile rendering, chooser search and saving. Preview includes existing Squirtle for comparison. Syntax and whitespace checks passed. Nothing committed or pushed.
