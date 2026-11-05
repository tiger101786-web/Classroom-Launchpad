// Shared chooser, artwork and layout registry. Illustration exceptions remain in CSS.
(function (root) {
  'use strict';
  const skins = [
  {
    "id": "original",
    "label": "Original",
    "layout": "original",
    "title": "plain",
    "assets": [],
    "variables": {},
    "swatch": "linear-gradient(135deg,#dc324e,#1c090e)"
  },
  {
    "id": "inferno",
    "label": "Inferno Forge",
    "layout": "illustrated",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/inferno-atlas-lossless.png",
      "assets/radio-skins/illustrated/inferno-header-v2-lossless.png"
    ],
    "variables": {
      "--radio-skin-accent": "#ffb44e"
    },
    "swatch": "linear-gradient(135deg,#ffcd6a,#a52f09,#150a04)"
  },
  {
    "id": "frostfang",
    "label": "Frostfang Citadel",
    "layout": "illustrated",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/frostfang-atlas-lossless.png",
      "assets/radio-skins/illustrated/frostfang-header-v2-lossless.png"
    ],
    "variables": {
      "--radio-skin-accent": "#85dcff"
    },
    "swatch": "linear-gradient(135deg,#e5fbff,#287eb6,#071827)"
  },
  {
    "id": "temple",
    "label": "Overgrown Temple",
    "layout": "illustrated",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/temple-atlas-lossless.png",
      "assets/radio-skins/illustrated/temple-header-v2-lossless.png"
    ],
    "variables": {
      "--radio-skin-accent": "#8ee6af"
    },
    "swatch": "linear-gradient(135deg,#e6c16c,#1eac67,#041b13)"
  },
  {
    "id": "nebula",
    "label": "Nebula Rider",
    "layout": "illustrated",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/nebula-atlas-lossless.png",
      "assets/radio-skins/illustrated/nebula-header-v2-lossless.png"
    ],
    "variables": {
      "--radio-skin-accent": "#d09bff"
    },
    "swatch": "linear-gradient(135deg,#7cecff,#c054f1,#160a2d)"
  },
  {
    "id": "bayou",
    "label": "Bayou Nights",
    "layout": "illustrated",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/bayou-atlas-lossless.png",
      "assets/radio-skins/illustrated/bayou-header-lossless.png"
    ],
    "variables": {},
    "swatch": "linear-gradient(135deg,#dfe993,#83a929,#513516)"
  },
  {
    "id": "hiphop",
    "label": "Hip-Hop DJ",
    "layout": "illustrated",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/hiphop-atlas-lossless.png",
      "assets/radio-skins/illustrated/hiphop-header-lossless.png"
    ],
    "variables": {
      "--radio-skin-accent": "#ffcf65"
    },
    "swatch": "linear-gradient(135deg,#ffe2a2,#8a5520,#171018,#8b35bd)"
  },
  {
    "id": "cyberpunk",
    "label": "Neon Cyberpunk",
    "layout": "illustrated",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/cyberpunk-atlas-lossless.png",
      "assets/radio-skins/illustrated/cyberpunk-header-lossless.png"
    ],
    "variables": {
      "--radio-skin-accent": "#65f4ff"
    },
    "swatch": "linear-gradient(135deg,#87f7ff,#15314b,#d837f3)"
  },
  {
    "id": "country",
    "label": "Country Music",
    "layout": "genre",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/country-atlas-lossless.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/country-atlas-lossless.png')",
      "--genre-base": "#251306",
      "--genre-edge": "#c09250",
      "--genre-accent": "#f5d592",
      "--genre-text": "#ffefd2",
      "--genre-material": "linear-gradient(#1f0e0433,#1f0e0477),var(--genre-art) center 43% / auto 620% no-repeat",
      "--genre-band": "1254 / 190",
      "--genre-band-position": "41.8233%",
      "--genre-portrait": "205%"
    },
    "swatch": "linear-gradient(135deg,#ffdc98,#764119,#244476)"
  },
  {
    "id": "metal",
    "label": "Heavy Metal",
    "layout": "genre",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/metal-atlas-lossless.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/metal-atlas-lossless.png')",
      "--genre-base": "#100e10",
      "--genre-edge": "#a9a5a2",
      "--genre-accent": "#ff7954",
      "--genre-text": "#fff0e8",
      "--genre-material": "repeating-linear-gradient(130deg,#b7c5ce0a 0 1px,transparent 1px 4px),linear-gradient(135deg,#36383b,#121214 60%,#373334)",
      "--genre-band": "1254 / 215",
      "--genre-band-position": "42.7334%",
      "--genre-portrait": "213%"
    },
    "swatch": "linear-gradient(135deg,#d0d0cf,#242327,#e13b1a)"
  },
  {
    "id": "jazz",
    "label": "Jazz Club",
    "layout": "genre",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/jazz-atlas-lossless.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/jazz-atlas-lossless.png')",
      "--genre-base": "#20100c",
      "--genre-edge": "#c3954c",
      "--genre-accent": "#ffe0a1",
      "--genre-text": "#fff2d6",
      "--genre-material": "repeating-linear-gradient(2deg,#d2973e0d 0 1px,transparent 1px 5px),linear-gradient(120deg,#49231c,#291412 65%,#563223)",
      "--genre-band": "1254 / 222",
      "--genre-band-position": "39.9225%",
      "--genre-portrait": "210%"
    },
    "swatch": "linear-gradient(135deg,#e3ba72,#4a2018,#221218)"
  },
  {
    "id": "djclub",
    "label": "DJ Club",
    "layout": "genre",
    "title": "plain",
    "assets": [
      "assets/radio-skins/illustrated/djclub-atlas-lossless.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/djclub-atlas-lossless.png')",
      "--genre-base": "#070f22",
      "--genre-edge": "#6d9cda",
      "--genre-accent": "#79f1ff",
      "--genre-text": "#e7faff",
      "--genre-material": "repeating-linear-gradient(0deg,#9ddaff0a 0 1px,transparent 1px 4px),linear-gradient(120deg,#122c4c,#0b1027 65%,#30204d)",
      "--genre-band": "1254 / 226",
      "--genre-band-position": "39.5914%",
      "--genre-portrait": "210%"
    },
    "swatch": "linear-gradient(135deg,#80f9ff,#142a67,#bd50ff)"
  },
  {
    "id": "reggae",
    "label": "Reggae",
    "layout": "genre",
    "title": "words",
    "assets": [
      "assets/radio-skins/illustrated/reggae-atlas-lossless.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/reggae-atlas-lossless.png')",
      "--genre-base": "#0b2018",
      "--genre-edge": "#d3ae44",
      "--genre-accent": "#ffe27f",
      "--genre-text": "#fff4ce",
      "--genre-material": "repeating-linear-gradient(0deg,#eed5830b 0 1px,transparent 1px 6px),linear-gradient(125deg,#23583e,#112c22 65%,#244537)",
      "--genre-band": "1254 / 225",
      "--genre-band-position": "40.8163%",
      "--genre-portrait": "205%"
    },
    "swatch": "linear-gradient(135deg,#c83c32 0 33%,#f0cb5c 34% 65%,#338950 66%)"
  },
  {
    "id": "disco",
    "label": "Disco",
    "layout": "genre",
    "title": "words",
    "assets": [
      "assets/radio-skins/illustrated/disco-atlas-lossless.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/disco-atlas-lossless.png')",
      "--genre-base": "#1c1029",
      "--genre-edge": "#bfc3df",
      "--genre-accent": "#ffb4ee",
      "--genre-text": "#fff2fd",
      "--genre-material": "radial-gradient(ellipse at top left,#b755c744,transparent 60%),repeating-linear-gradient(115deg,#d0d6ff0b 0 1px,transparent 1px 5px),linear-gradient(130deg,#463c65,#241c34 65%,#493256)",
      "--genre-band": "1254 / 200",
      "--genre-band-position": "38.8994%",
      "--genre-portrait": "200%"
    },
    "swatch": "conic-gradient(#f2e5ff,#c969d6,#8de2f0,#fde0a1,#f2e5ff)"
  },
  {
    "id": "punk",
    "label": "Punk Rock",
    "layout": "genre",
    "title": "letters",
    "assets": [
      "assets/radio-skins/illustrated/punk-atlas-lossless.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/punk-atlas-lossless.png')",
      "--genre-base": "#151719",
      "--genre-edge": "#a4a5a9",
      "--genre-accent": "#d7ff74",
      "--genre-text": "#f5ffe6",
      "--genre-material": "repeating-linear-gradient(165deg,#dce3ed0c 0 1px,transparent 1px 7px),linear-gradient(125deg,#34383d,#181b20 65%,#303138)",
      "--genre-band": "1254 / 210",
      "--genre-band-position": "36.8774%",
      "--genre-portrait": "198%"
    },
    "swatch": "linear-gradient(135deg,#dcff70,#22232a 40% 65%,#f47cbd)"
  },
  {
    "id": "blues",
    "label": "Blues",
    "layout": "genre",
    "title": "words",
    "assets": [
      "assets/radio-skins/illustrated/blues-atlas-lossless.png"
    ],
    "variables": {
      "--genre-art": "url('assets/radio-skins/illustrated/blues-atlas-lossless.png')",
      "--genre-base": "#08182d",
      "--genre-edge": "#c39b56",
      "--genre-accent": "#f5d48b",
      "--genre-text": "#fff0cf",
      "--genre-material": "repeating-linear-gradient(0deg,#b6c8ed08 0 1px,transparent 1px 4px),linear-gradient(125deg,#204271,#0b203e 65%,#213a5a)",
      "--genre-band": "1254 / 200",
      "--genre-band-position": "37.9507%",
      "--genre-portrait": "195%"
    },
    "swatch": "linear-gradient(135deg,#e2bb70,#18345f 40%,#08162d 70%,#b58a44)"
  }
];
  skins.forEach(skin => {
    Object.freeze(skin.assets);
    Object.freeze(skin.variables);
    Object.freeze(skin);
  });
  if (typeof module !== 'undefined' && module.exports) module.exports = Object.freeze(skins);
  else root.coltRadioSkinDefinitions = Object.freeze(skins);
})(typeof window !== 'undefined' ? window : globalThis);
