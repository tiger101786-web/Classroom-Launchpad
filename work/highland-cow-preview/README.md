# Highland cow accessory preview

Open `accessories.html` to test the approved tweed cap, textured purple heather wreath, leather-and-brass headphones, and tartan scarf. These accessories are preview-only; they are not registered in Pet Studio.

The preview includes the cow artwork, platform, animation rig, and embedded artwork data needed for local-file playback. The wreath uses `heather-wreath-v3.png` with transparency. Its transform follows the animated head. The scarf is independently selectable; headwear is mutually exclusive.

Run `node work/highland-cow-preview/verify-accessories.cjs` with Playwright available to check selection, animation following, scarf toggling, mobile layout, and browser errors. The test uses the local Windows Chrome installation and produces untracked screenshots.
